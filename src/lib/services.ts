// Бизнес логикийн хуваалцсан үйлчилгээнүүд.
// (Сертификат олгох, урамшуулал бэлэглэх, суралцагчийн аяллын төлөв)

import { prisma } from './prisma';
import { CERT_VALIDITY_YEARS, EXAM_CONFIG } from './constants';
import { generateCertNumber, generateCertHash } from './certificate';

export interface JourneyState {
  enrolled: boolean;
  modulesTotal: number;
  modulesCompleted: number;
  allModulesDone: boolean;
  examPassed: boolean;
  examScore: number | null;
  practiceDone: boolean;
  certificate: { certNumber: string; status: string } | null;
  // дараагийн алхам
  nextStep: 'enroll' | 'learn' | 'exam' | 'practice' | 'done';
}

// Суралцагчийн нийт аяллын төлөвийг тооцоолно (Dashboard-д)
export async function getJourneyState(userId: string): Promise<JourneyState> {
  const course = await prisma.course.findFirst({
    where: { code: 'SCE-FULL' },
    include: { modules: { where: { isActive: true } } },
  });
  const modulesTotal = course?.modules.length ?? 0;
  const moduleIds = course?.modules.map((m) => m.id) ?? [];

  const enrollment = course
    ? await prisma.enrollment.findFirst({
        where: { userId, courseId: course.id },
      })
    : null;

  const completedProgress = await prisma.moduleProgress.count({
    where: { userId, moduleId: { in: moduleIds }, status: 'COMPLETED' },
  });

  const passedExam = await prisma.examAttempt.findFirst({
    where: { userId, status: 'PASSED' },
    orderBy: { submittedAt: 'desc' },
  });

  const donePractice = await prisma.practiceSession.findFirst({
    where: { userId, status: 'COMPLETED' },
  });

  const cert = await prisma.certificate.findFirst({
    where: { userId },
    orderBy: { issuedAt: 'desc' },
  });

  const allModulesDone = modulesTotal > 0 && completedProgress >= modulesTotal;
  const examPassed = !!passedExam;
  const practiceDone = !!donePractice;

  let nextStep: JourneyState['nextStep'] = 'enroll';
  if (cert) nextStep = 'done';
  else if (!enrollment || enrollment.status === 'PENDING_PAYMENT') nextStep = 'enroll';
  else if (!allModulesDone) nextStep = 'learn';
  else if (!examPassed) nextStep = 'exam';
  else if (!practiceDone) nextStep = 'practice';
  else nextStep = 'done';

  return {
    enrolled: !!enrollment && enrollment.status !== 'PENDING_PAYMENT',
    modulesTotal,
    modulesCompleted: completedProgress,
    allModulesDone,
    examPassed,
    examScore: passedExam?.percent ?? null,
    practiceDone,
    certificate: cert ? { certNumber: cert.certNumber, status: cert.status } : null,
    nextStep,
  };
}

// Сертификат олгох (практик дадлага бүрэн баталгаажсаны дараа)
export async function issueCertificate(userId: string) {
  // Аль хэдийн идэвхтэй сертификаттай бол давхар үүсгэхгүй
  const existing = await prisma.certificate.findFirst({
    where: { userId, status: 'ACTIVE' },
  });
  if (existing) return existing;

  const passedExam = await prisma.examAttempt.findFirst({
    where: { userId, status: 'PASSED' },
    orderBy: { submittedAt: 'desc' },
  });

  const certNumber = await generateCertNumber();
  const issuedAt = new Date();
  const expiresAt = new Date(issuedAt);
  expiresAt.setFullYear(expiresAt.getFullYear() + CERT_VALIDITY_YEARS);

  const hash = generateCertHash({
    certNumber,
    userId,
    issuedAt,
    examScore: passedExam?.percent ?? null,
  });

  const cert = await prisma.certificate.create({
    data: {
      certNumber,
      userId,
      examScore: passedExam?.percent ?? null,
      practiceVerified: true,
      issuedAt,
      expiresAt,
      hash,
      status: 'ACTIVE',
    },
  });

  // Холбосон түрээсийн аппуудад урамшуулал бэлэглэх
  await grantRewardsForCertificate(userId, cert.id);

  return cert;
}

// Сертификат гарахад холбосон хамтрагч аппуудад оноо бэлэглэх (Судалгааны 5.5)
export async function grantRewardsForCertificate(userId: string, certificateId: string) {
  const links = await prisma.rentalLink.findMany({
    where: { userId, status: 'LINKED', rewardGranted: false },
    include: { partner: true },
  });

  for (const link of links) {
    if (!link.partner.isActive) continue;
    await prisma.rewardPoint.create({
      data: {
        userId,
        partnerId: link.partnerId,
        certificateId,
        points: link.partner.rewardPoints,
        actionType: 'training_completed',
      },
    });
    await prisma.rentalLink.update({
      where: { id: link.id },
      data: { rewardGranted: true },
    });
  }
}

// Төлбөр амжилттай болоход — төлбөрийг PAID болгож, курсын бүртгэлийг идэвхжүүлнэ
export async function completePayment(paymentId: string) {
  const payment = await prisma.payment.findUnique({ where: { id: paymentId } });
  if (!payment) return null;
  if (payment.status === 'PAID') return payment;

  const updated = await prisma.payment.update({
    where: { id: paymentId },
    data: { status: 'PAID', paidAt: new Date() },
  });

  // Холбогдох курсын бүртгэлийг идэвхжүүлэх
  if (payment.courseId) {
    await prisma.enrollment.updateMany({
      where: { userId: payment.userId, courseId: payment.courseId },
      data: { status: 'ACTIVE', paymentId: payment.id },
    });
  }

  return updated;
}

// Шалгалтын эрх шалгах
export async function checkExamEligibility(userId: string) {
  const course = await prisma.course.findFirst({
    where: { code: 'SCE-FULL' },
    include: { modules: { where: { isActive: true } } },
  });
  const moduleIds = course?.modules.map((m) => m.id) ?? [];
  const modulesTotal = moduleIds.length;

  const completed = await prisma.moduleProgress.count({
    where: { userId, moduleId: { in: moduleIds }, status: 'COMPLETED' },
  });

  if (completed < modulesTotal) {
    return {
      eligible: false,
      reason: `Эхлээд бүх ${modulesTotal} модулийг дуусгана уу (${completed}/${modulesTotal}).`,
      attemptsUsed: 0,
    };
  }

  const attempts = await prisma.examAttempt.findMany({
    where: { userId },
    orderBy: { startedAt: 'desc' },
  });

  const alreadyPassed = attempts.find((a) => a.status === 'PASSED');
  if (alreadyPassed) {
    return { eligible: false, reason: 'Та шалгалтад аль хэдийн тэнцсэн байна.', attemptsUsed: attempts.length, passed: true };
  }

  const finishedAttempts = attempts.filter((a) => a.status !== 'IN_PROGRESS');
  if (finishedAttempts.length >= EXAM_CONFIG.maxAttempts) {
    const last = finishedAttempts[0];
    if (last.nextAttemptAt && last.nextAttemptAt > new Date()) {
      return {
        eligible: false,
        reason: `Оролдлогын тоо дууссан. ${last.nextAttemptAt.toLocaleString('mn-MN')}-аас дахин оролдоно уу.`,
        attemptsUsed: finishedAttempts.length,
      };
    }
  }

  // Дараагийн оролдлогын хүлээх хугацаа
  const lastFinished = finishedAttempts[0];
  if (lastFinished?.nextAttemptAt && lastFinished.nextAttemptAt > new Date()) {
    return {
      eligible: false,
      reason: `Дараагийн оролдлого ${lastFinished.nextAttemptAt.toLocaleString('mn-MN')}-д нээгдэнэ.`,
      attemptsUsed: finishedAttempts.length,
    };
  }

  return {
    eligible: true,
    reason: 'Шалгалт өгөх боломжтой.',
    attemptsUsed: finishedAttempts.length,
  };
}
