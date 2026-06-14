// ScooterEdu MN — Өгөгдлийн сан seed
// Ажиллуулах: npm run db:seed (эсвэл npm run setup)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  modules,
  questions,
  partners,
  drivingSchools,
  packages,
  CONTENT_VERSION,
} from './data';

const prisma = new PrismaClient();

function randomKey(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s}`;
}

// Багцыг үүсгэх (code-оор). Зөвхөн байхгүй багцыг нэмнэ —
// админы засварыг (үнэ г.м) дарж бичихгүй. Live DB-д ч аюулгүй.
async function seedPackages() {
  let created = 0;
  for (const p of packages) {
    const exists = await prisma.package.findUnique({ where: { code: p.code } });
    if (exists) continue;
    await prisma.package.create({
      data: { ...p, features: JSON.stringify(p.features) },
    });
    created++;
  }
  console.log(`✅ Багц: ${created} шинээр нэмэгдсэн (${packages.length - created} аль хэдийн байна)`);
}

// Модуль + асуултыг үүсгэх (хуучныг устгаад шинээр). Контент шинэчлэхэд ашиглана.
async function seedCurriculumContent(courseId: string) {
  await prisma.module.deleteMany({ where: { courseId } }); // cascade: question, progress
  let total = 0;
  for (const m of modules) {
    const module = await prisma.module.create({
      data: {
        courseId,
        moduleNumber: m.moduleNumber,
        titleMn: m.titleMn,
        summaryMn: m.summaryMn,
        contentHtml: m.contentHtml,
        keyPoints: JSON.stringify(m.keyPoints),
        durationMin: m.durationMin,
        sortOrder: m.moduleNumber,
        isActive: true,
      },
    });
    const mq = questions.filter((q) => q.moduleCode === m.moduleCode);
    for (const q of mq) {
      await prisma.question.create({
        data: {
          moduleId: module.id,
          moduleCode: q.moduleCode,
          questionMn: q.questionMn,
          options: JSON.stringify(q.options),
          explanationMn: q.explanationMn,
          difficulty: q.difficulty,
          tags: JSON.stringify(q.tags),
          isActive: true,
        },
      });
      total++;
    }
  }
  return { moduleCount: modules.length, questionCount: total };
}

async function setContentVersion() {
  await prisma.siteSetting.upsert({
    where: { key: 'content_version' },
    create: { key: 'content_version', value: CONTENT_VERSION },
    update: { value: CONTENT_VERSION },
  });
}

// Дадлагад бэлэн демо суралцагч (практик хэсгийг шууд харахад).
// Курс/модуль/багц байгаа тохиолдолд л ажиллана (live DB-д ч идэвхжинэ).
async function seedDemoPractice(phone = '99091911') {
  const course = await prisma.course.findFirst({
    where: { code: 'SCE-FULL' },
    include: { modules: true },
  });
  if (!course || course.modules.length === 0) return; // контент байхгүй бол алгасна
  const standard = await prisma.package.findUnique({ where: { code: 'STANDARD' } });

  let user = await prisma.user.findUnique({ where: { phone } });
  if (!user) {
    user = await prisma.user.create({
      data: {
        phone,
        firstName: 'Дэмо',
        lastName: 'Суралцагч',
        role: 'STUDENT',
        ageVerified: true,
        isTestUser: true,
        birthDate: new Date('1998-01-01'),
      },
    });
  }

  // Стандарт багцаар идэвхтэй бүртгэл (дадлагатай)
  const enr = await prisma.enrollment.findFirst({
    where: { userId: user.id, courseId: course.id },
  });
  if (!enr) {
    await prisma.enrollment.create({
      data: {
        userId: user.id,
        courseId: course.id,
        packageId: standard?.id,
        packageCode: 'STANDARD',
        includesPractice: true,
        amountPaid: standard?.price ?? 29900,
        status: 'ACTIVE',
      },
    });
  }

  // Бүх модулийг дуусгасан
  for (const m of course.modules) {
    await prisma.moduleProgress.upsert({
      where: { userId_moduleId: { userId: user.id, moduleId: m.id } },
      create: { userId: user.id, moduleId: m.id, status: 'COMPLETED', completedAt: new Date() },
      update: { status: 'COMPLETED' },
    });
  }

  // Шалгалт тэнцсэн (практик нээгдэнэ)
  const passed = await prisma.examAttempt.findFirst({
    where: { userId: user.id, status: 'PASSED' },
  });
  if (!passed) {
    await prisma.examAttempt.create({
      data: {
        userId: user.id,
        attemptNumber: 1,
        questionIds: '[]',
        answers: '{}',
        score: 28,
        percent: 93,
        status: 'PASSED',
        submittedAt: new Date(),
      },
    });
  }
  console.log(`✅ Дадлагад бэлэн демо: ${phone} (Стандарт багц, шалгалт тэнцсэн)`);
}

async function main() {
  // SEED_IF_EMPTY=true үед (Vercel build):
  //  • Багцыг үргэлж upsert хийнэ (шинэ багц аль хэдийн seed хийсэн DB-д нэмэгдэнэ)
  //  • Үндсэн контентыг зөвхөн DB хоосон үед seed хийнэ (хэрэглэгчийн өгөгдөл хамгаалах)
  if (process.env.SEED_IF_EMPTY === 'true') {
    const existing = await prisma.course.count().catch(() => -2);
    if (existing < 0) {
      console.log('⏭️  Seed алгаслаа (DB бэлэн биш)');
      return;
    }
    await seedPackages();

    if (existing > 0) {
      // Контентын хувилбар шинэчлэгдсэн бол модуль/асуултыг шинэчилнэ
      const cv = await prisma.siteSetting
        .findUnique({ where: { key: 'content_version' } })
        .catch(() => null);
      if (cv?.value !== CONTENT_VERSION) {
        const course = await prisma.course.findFirst({ where: { code: 'SCE-FULL' } });
        if (course) {
          const c = await seedCurriculumContent(course.id);
          await setContentVersion();
          console.log(`✅ Контент шинэчлэв (v${CONTENT_VERSION}): ${c.moduleCount} модуль, ${c.questionCount} асуулт`);
        }
      }
      await seedDemoPractice(); // 99091911-ийг дадлагад бэлэн болгох
      console.log(`⏭️  Үндсэн seed алгаслаа (${existing} курс аль хэдийн байна)`);
      return;
    }
  }

  console.log('🌱 Seed эхэлж байна...');

  // ── Хуучин өгөгдлийг цэвэрлэх (idempotent) ──
  await prisma.rewardPoint.deleteMany();
  await prisma.rentalLink.deleteMany();
  await prisma.certificate.deleteMany();
  await prisma.practiceSession.deleteMany();
  await prisma.examAttempt.deleteMany();
  await prisma.moduleProgress.deleteMany();
  await prisma.enrollment.deleteMany();
  await prisma.package.deleteMany();
  await prisma.payment.deleteMany();
  await prisma.question.deleteMany();
  await prisma.module.deleteMany();
  await prisma.course.deleteMany();
  await prisma.instructor.deleteMany();
  await prisma.drivingSchool.deleteMany();
  await prisma.partner.deleteMany();
  await prisma.otpCode.deleteMany();
  await prisma.user.deleteMany();

  // ── Админ хэрэглэгч ──
  const adminPassword = await bcrypt.hash('admin123', 12);
  const admin = await prisma.user.create({
    data: {
      phone: '99000000',
      firstName: 'Админ',
      lastName: 'ScooterEdu',
      role: 'ADMIN',
      passwordHash: adminPassword,
      ageVerified: true,
      xypVerified: true,
    },
  });
  console.log(`✅ Админ: ${admin.phone} / нууц үг: admin123`);

  // ── Багш (дадлага хянагч) ──
  const instructorPassword = await bcrypt.hash('teacher123', 12);
  const instructorUser = await prisma.user.create({
    data: {
      phone: '99001111',
      firstName: 'Бат',
      lastName: 'Багш',
      role: 'INSTRUCTOR',
      passwordHash: instructorPassword,
      ageVerified: true,
      xypVerified: true,
    },
  });

  // ── Гэрээт жолооны курсууд ──
  const createdSchools = [];
  for (const s of drivingSchools) {
    const school = await prisma.drivingSchool.create({ data: s });
    createdSchools.push(school);
  }
  console.log(`✅ ${createdSchools.length} жолооны курс`);

  await prisma.instructor.create({
    data: {
      userId: instructorUser.id,
      schoolId: createdSchools[0].id,
      licenseNumber: 'INS-2026-001',
      qrToken: randomKey('instr'),
      isVerified: true,
    },
  });
  console.log(`✅ Багш: ${instructorUser.phone} / нууц үг: teacher123`);

  // ── Хамтрагч компаниуд ──
  for (const p of partners) {
    await prisma.partner.create({
      data: { ...p, apiKey: randomKey('pk_live') },
    });
  }
  console.log(`✅ ${partners.length} хамтрагч компани`);

  // ── Үнийн багцууд ──
  await seedPackages();

  // ── Курс + Модуль + Асуулт ──
  const course = await prisma.course.create({
    data: {
      code: 'SCE-FULL',
      titleMn: 'Цахилгаан Скүүтэр Жолоодлогын Бүрэн Курс',
      descriptionMn:
        '"А" ангилалтай дүйцэхүйц 6 модуль: хууль, замын тэмдэг, тэмдэглэгээ ба дохио, хөдөлгөөний дэг журам, техник ба аюулгүй жолоодлого, осол ба анхны тусламж. Онлайн шалгалт болон практик дадлагаар дижитал гэрчилгээ авна.',
      price: 25000,
      durationHours: 1.5,
      level: 'Бүрэн',
      coverImage: '/images/course-cover.svg',
      isActive: true,
      sortOrder: 1,
    },
  });

  const content = await seedCurriculumContent(course.id);
  await setContentVersion();
  console.log(`✅ ${content.moduleCount} модуль, ${content.questionCount} асуулт`);

  // ── Демо суралцагч (тест харуулахад) ──
  const demo = await prisma.user.create({
    data: {
      phone: '88001122',
      registerNumber: 'УБ95051512',
      firstName: 'Болд',
      lastName: 'Батбаяр',
      birthDate: new Date('1995-05-15'),
      gender: 'M',
      role: 'STUDENT',
      ageVerified: true,
      xypVerified: true,
      isTestUser: true,
    },
  });
  const standardPkg = await prisma.package.findUnique({ where: { code: 'STANDARD' } });
  await prisma.enrollment.create({
    data: {
      userId: demo.id,
      courseId: course.id,
      packageId: standardPkg?.id,
      packageCode: 'STANDARD',
      includesPractice: true,
      amountPaid: standardPkg?.price ?? 29900,
      status: 'ACTIVE',
    },
  });
  console.log(`✅ Демо суралцагч: ${demo.phone}`);

  // Дадлагад бэлэн демо (99091911)
  await seedDemoPractice();

  console.log('🎉 Seed амжилттай дууслаа!');
  console.log('');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  console.log('  НЭВТРЭХ МЭДЭЭЛЭЛ:');
  console.log('  • Админ:   99000000 / admin123');
  console.log('  • Багш:    99001111 / teacher123');
  console.log('  • Суралцагч: утсаараа OTP-ээр бүртгүүлнэ');
  console.log('  • Тест горимд OTP код дэлгэц дээр харагдана');
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('❌ Seed алдаа:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
