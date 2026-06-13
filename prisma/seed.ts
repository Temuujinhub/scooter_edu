// ScooterEdu MN — Өгөгдлийн сан seed
// Ажиллуулах: npm run db:seed (эсвэл npm run setup)

import { PrismaClient } from '@prisma/client';
import bcrypt from 'bcryptjs';
import {
  modules,
  questions,
  partners,
  drivingSchools,
} from './data';

const prisma = new PrismaClient();

function randomKey(prefix: string): string {
  const chars = 'abcdefghijklmnopqrstuvwxyz0123456789';
  let s = '';
  for (let i = 0; i < 32; i++) s += chars[Math.floor(Math.random() * chars.length)];
  return `${prefix}_${s}`;
}

async function main() {
  // SEED_IF_EMPTY=true үед (Vercel build) — өгөгдөл аль хэдийн байвал алгасна.
  // Ингэснээр production дахь хэрэглэгчийн өгөгдлийг устгахгүй.
  if (process.env.SEED_IF_EMPTY === 'true') {
    const existing = await prisma.course.count().catch(() => -1);
    if (existing > 0) {
      console.log(`⏭️  Seed алгаслаа (${existing} курс аль хэдийн байна)`);
      return;
    }
    if (existing < 0) {
      console.log('⏭️  Seed алгаслаа (DB бэлэн биш)');
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

  // ── Курс + Модуль + Асуулт ──
  const course = await prisma.course.create({
    data: {
      code: 'SCE-FULL',
      titleMn: 'Цахилгаан Скүүтэр Жолоодлогын Бүрэн Курс',
      descriptionMn:
        'Монгол Улсын хууль, скүүтэрийн техник, хотын жолоодлого, ослоос сэргийлэх 4 модуль. Онлайн шалгалт болон практик дадлагаар дижитал гэрчилгээ авна.',
      price: 25000,
      durationHours: 1.5,
      level: 'Бүрэн',
      coverImage: '/images/course-cover.svg',
      isActive: true,
      sortOrder: 1,
    },
  });

  // Үндсэн (хямд) курс
  await prisma.course.create({
    data: {
      code: 'SCE-BASIC',
      titleMn: 'Скүүтэр Жолоодлогын Үндсэн Курс',
      descriptionMn:
        '4 модулийн онлайн хичээл болон онлайн шалгалт. Хурдан, хямд эхлэлт.',
      price: 15000,
      durationHours: 1.5,
      level: 'Анхан шат',
      coverImage: '/images/course-cover.svg',
      isActive: true,
      sortOrder: 2,
    },
  });

  let totalQuestions = 0;
  for (const m of modules) {
    const module = await prisma.module.create({
      data: {
        courseId: course.id,
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

    const moduleQuestions = questions.filter((q) => q.moduleCode === m.moduleCode);
    for (const q of moduleQuestions) {
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
      totalQuestions++;
    }
  }
  console.log(`✅ ${modules.length} модуль, ${totalQuestions} асуулт`);

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
  await prisma.enrollment.create({
    data: { userId: demo.id, courseId: course.id, status: 'ACTIVE' },
  });
  console.log(`✅ Демо суралцагч: ${demo.phone}`);

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
