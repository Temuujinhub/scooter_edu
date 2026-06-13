// Төгсгөл-төгсгөлийн тест: бүртгэл → сургалт → шалгалт → дадлага → сертификат → хамтрагч
// Ажиллуулах: npx tsx scripts/e2e-test.ts  (сервер localhost:3000 дээр асаалттай байх)

import { PrismaClient } from '@prisma/client';

const prisma = new PrismaClient();
const BASE = 'http://localhost:3000';

let cookie = '';

async function call(path: string, options: any = {}) {
  const res = await fetch(BASE + path, {
    ...options,
    headers: {
      ...(options.body ? { 'Content-Type': 'application/json' } : {}),
      ...(cookie ? { Cookie: cookie } : {}),
      ...(options.headers ?? {}),
    },
  });
  const setCookie = res.headers.get('set-cookie');
  if (setCookie) cookie = setCookie.split(';')[0];
  const data = await res.json().catch(() => ({}));
  return { status: res.status, data };
}

function assert(cond: boolean, msg: string) {
  if (cond) {
    console.log('  ✅ ' + msg);
  } else {
    console.log('  ❌ ' + msg);
    failures++;
  }
}

let failures = 0;

async function main() {
  console.log('\n━━━ 1. ТЕСТ ХЯЛБАР НЭВТРЭЛТ ━━━');
  const login = await call('/api/auth/test-login', { method: 'POST', body: '{}' });
  assert(login.status === 200, 'Тест нэвтрэлт амжилттай');
  assert(!!cookie, 'Cookie хадгалагдсан');

  const me = await call('/api/auth/me');
  assert(me.data.data?.role === 'STUDENT', 'Хэрэглэгч STUDENT эрхтэй');

  console.log('\n━━━ 2. КУРСТ ЭЛСЭХ + ТӨЛБӨР ━━━');
  const courses = await call('/api/courses');
  const fullCourse = courses.data.data.find((c: any) => c.code === 'SCE-FULL');
  assert(!!fullCourse, 'SCE-FULL курс олдсон');

  const enroll = await call(`/api/courses/${fullCourse.id}/enroll`, { method: 'POST', body: '{}' });
  assert(enroll.data.data?.needPayment === true, 'Төлбөр шаардлагатай (25,000₮)');

  const payInit = await call('/api/payments/qpay/init', {
    method: 'POST',
    body: JSON.stringify({ courseId: fullCourse.id }),
  });
  assert(!!payInit.data.data?.paymentId, 'QPay invoice үүссэн');
  assert(!!payInit.data.data?.qrText, 'QR текст буцсан');

  const sim = await call('/api/payments/simulate', {
    method: 'POST',
    body: JSON.stringify({ paymentId: payInit.data.data.paymentId }),
  });
  assert(sim.data.data?.paid === true, 'Төлбөр симуляци амжилттай (PAID)');

  console.log('\n━━━ 3. 4 МОДУЛЬ ДУУСГАХ ━━━');
  const detail = await call(`/api/courses/${fullCourse.id}`);
  assert(detail.data.data?.enrollment?.status === 'ACTIVE', 'Бүртгэл ACTIVE болсон');
  const modules = detail.data.data.modules;
  assert(modules.length === 4, '4 модуль байна');

  for (const m of modules) {
    const prog = await call(`/api/modules/${m.id}/progress`, {
      method: 'POST',
      body: JSON.stringify({ status: 'COMPLETED', quizScore: 100 }),
    });
    assert(prog.data.data?.status === 'COMPLETED', `Модуль ${m.moduleNumber} дууссан`);
  }

  console.log('\n━━━ 4. ШАЛГАЛТ (зөв хариултаар тэнцүүлэх) ━━━');
  const elig = await call('/api/exam/eligibility');
  assert(elig.data.data?.eligible === true, 'Шалгалтын эрх нээгдсэн');

  const start = await call('/api/exam/start', { method: 'POST', body: '{}' });
  const examQuestions = start.data.data.questions;
  assert(examQuestions.length === 30, '30 асуулт сонгогдсон');

  // Зөв хариултыг DB-ээс хайх
  const qIds = examQuestions.map((q: any) => q.id);
  const dbQuestions = await prisma.question.findMany({ where: { id: { in: qIds } } });
  const answers: Record<string, string> = {};
  for (const q of dbQuestions) {
    const opts = JSON.parse(q.options);
    const correct = opts.find((o: any) => o.isCorrect);
    answers[q.id] = correct.key;
  }

  const submit = await call('/api/exam/submit', {
    method: 'POST',
    body: JSON.stringify({ attemptId: start.data.data.attemptId, answers }),
  });
  assert(submit.data.data?.passed === true, `Шалгалтад тэнцсэн (${submit.data.data?.percent}%)`);
  assert(submit.data.data?.score === 30, 'Бүх 30 асуулт зөв');

  console.log('\n━━━ 5. ХАМТРАГЧ АПП ХОЛБОХ ━━━');
  const partners = await call('/api/partners');
  const jet = partners.data.data.find((p: any) => p.code === 'JET');
  const linkRes = await call('/api/rental/link', {
    method: 'POST',
    body: JSON.stringify({ partnerId: jet.id }),
  });
  assert(linkRes.data.data?.linked === true, `${jet.name} холбогдсон`);

  console.log('\n━━━ 6. ПРАКТИК ДАДЛАГА + СЕРТИФИКАТ ━━━');
  const schools = await call('/api/practice/schools');
  const school = schools.data.data[0];
  const book = await call('/api/practice/book', {
    method: 'POST',
    body: JSON.stringify({ schoolId: school.id, scheduledAt: new Date().toISOString() }),
  });
  assert(!!book.data.data?.session?.qrToken, 'Дадлага захиалж QR токен авсан');

  const qrToken = book.data.data.session.qrToken;
  const allElements = { A: true, B: true, C: true, D: true, E: true, F: true, G: true };
  const verify = await call('/api/practice/verify', {
    method: 'POST',
    body: JSON.stringify({ qrToken, elements: allElements }),
  });
  assert(verify.data.data?.allPassed === true, 'Бүх элемент тэнцсэн');
  assert(!!verify.data.data?.certificate?.certNumber, `Сертификат үүссэн: ${verify.data.data?.certificate?.certNumber}`);

  const certNumber = verify.data.data.certificate.certNumber;

  console.log('\n━━━ 7. УРАМШУУЛАЛ ШАЛГАХ ━━━');
  const links = await call('/api/rental/links');
  const jetLink = links.data.data.find((l: any) => l.partnerName.includes('Jet'));
  assert(jetLink?.points === 1000, `Jet урамшуулал бэлэглэгдсэн (${jetLink?.points} оноо)`);

  console.log('\n━━━ 8. СЕРТИФИКАТ НИЙТИЙН ШАЛГАЛТ ━━━');
  const pubVerify = await call(`/api/certificates/verify/${certNumber}`);
  assert(pubVerify.data.data?.valid === true, 'Нийтийн шалгалт: хүчинтэй');

  console.log('\n━━━ 9. ХАМТРАГЧ API (X-API-Key) ━━━');
  const jetPartner = await prisma.partner.findUnique({ where: { code: 'JET' } });
  const partnerVerify = await call('/api/partner/verify-cert', {
    method: 'POST',
    headers: { 'X-API-Key': jetPartner!.apiKey },
    body: JSON.stringify({ cert_number: certNumber }),
  });
  assert(partnerVerify.data?.valid === true, 'Хамтрагч API: сертификат хүчинтэй');

  console.log('\n━━━ 10. ХУР (XYP) НАС БАТАЛГААЖУУЛАЛТ ━━━');
  const xypAdult = await call('/api/xyp/verify', {
    method: 'POST',
    body: JSON.stringify({ registerNumber: 'УБ95051512' }),
  });
  assert(xypAdult.data.data?.verified === true, `18+ нас баталгаажсан (${xypAdult.data.data?.age} нас)`);
  const xypMinor = await call('/api/xyp/verify', {
    method: 'POST',
    body: JSON.stringify({ registerNumber: 'УБ15251215' }), // 2015-05-12 төрсөн (~11 нас)
  });
  assert(xypMinor.data.data?.verified === false, '18-аас доош нас татгалзсан');

  console.log('\n━━━ 11. АДМИН НЭВТРЭЛТ + СТАТИСТИК ━━━');
  cookie = '';
  const adminLogin = await call('/api/auth/login', {
    method: 'POST',
    body: JSON.stringify({ phone: '99000000', password: 'admin123' }),
  });
  assert(adminLogin.data.data?.user?.role === 'ADMIN', 'Админ нэвтрэлт амжилттай');
  const stats = await call('/api/admin/stats');
  assert(stats.data.data?.cards?.certificates >= 1, `Админ статистик: ${stats.data.data?.cards?.certificates} сертификат, ${stats.data.data?.cards?.revenue}₮ орлого`);

  console.log('\n━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
  if (failures === 0) {
    console.log('🎉 БҮХ ТЕСТ АМЖИЛТТАЙ ДАМЖСАН!');
  } else {
    console.log(`⚠️  ${failures} тест амжилтгүй`);
  }
  console.log('━━━━━━━━━━━━━━━━━━━━━━━━━━━━━━');
}

main()
  .catch((e) => {
    console.error('Тест алдаа:', e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
    process.exit(failures === 0 ? 0 : 1);
  });
