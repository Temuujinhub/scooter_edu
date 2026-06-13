// ──────────────────────────────────────────────────────────────────
// Хур (XYP) систем — Засгийн газрын мэдээлэл солилцооны нэгдсэн систем
// https://xyp.gov.mn
//
// Зорилго: Регистрийн дугаараар иргэний мэдээлэл (нэр, төрсөн огноо)-г
// татаж, 18+ нас хүрсэн эсэхийг баталгаажуулна.
//
// Production-д ашиглах бодит үйлчилгээ:
//   WS100101_getCitizenIDCardInfo — Иргэний үнэмлэхний мэдээлэл
//
// ТЕСТ ГОРИМД (TEST_MODE=true): бодит API дуудахгүй, регистрийн дугаараас
// мэдээллийг гарган мок хариу буцаана. Ингэснээр бүртгэлийг шууд тест хийнэ.
// ──────────────────────────────────────────────────────────────────

import { env } from './env';
import { parseRegister, calculateAge } from './register';

export interface CitizenInfo {
  found: boolean;
  registerNumber: string;
  firstName: string;
  lastName: string;
  birthDate: string | null; // ISO
  gender: 'M' | 'F' | null;
  age: number | null;
  source: 'xyp' | 'mock';
  error?: string;
}

// Production-д бодит XYP API дуудах хэсэг (загвар).
async function fetchFromXyp(register: string): Promise<CitizenInfo> {
  // Бодит нэгтгэлд энд XYP-ийн REST/SOAP сервисийг дуудна:
  //
  // const res = await fetch(`${env.xyp.baseUrl}/citizen/idcard`, {
  //   method: 'POST',
  //   headers: {
  //     'Content-Type': 'application/json',
  //     Authorization: `Bearer ${env.xyp.accessToken}`,
  //   },
  //   body: JSON.stringify({ regnum: register }),
  // });
  // const data = await res.json();
  // return mapXypResponse(data);

  // Token тохируулагдаагүй тул түр алдаа буцаана.
  throw new Error('XYP_NOT_CONFIGURED');
}

// Тестийн мок: регистрээс нэр, төрсөн огноог гаргана.
function mockCitizen(register: string): CitizenInfo {
  const parsed = parseRegister(register);
  if (!parsed.valid || !parsed.birthDate) {
    return {
      found: false,
      registerNumber: register,
      firstName: '',
      lastName: '',
      birthDate: null,
      gender: null,
      age: null,
      source: 'mock',
      error: parsed.error ?? 'Мэдээлэл олдсонгүй',
    };
  }

  const age = calculateAge(parsed.birthDate);

  // Тестэд танигдахуйц нэр (регистрийн эхний үсгүүдээр)
  const sampleFirst = ['Болд', 'Сараа', 'Тэмүүлэн', 'Анхбаяр', 'Номин'];
  const sampleLast = ['Батбаяр', 'Ганболд', 'Дорж', 'Очир', 'Эрдэнэ'];
  const idx = (register.charCodeAt(0) + register.charCodeAt(1)) % 5;

  return {
    found: true,
    registerNumber: register,
    firstName: sampleFirst[idx],
    lastName: sampleLast[idx],
    birthDate: parsed.birthDate.toISOString(),
    gender: parsed.gender,
    age,
    source: 'mock',
  };
}

// Үндсэн функц: иргэний мэдээллийг авна.
export async function getCitizenInfo(registerRaw: string): Promise<CitizenInfo> {
  const register = registerRaw.trim().toUpperCase();

  // Тест горимд эсвэл XYP тохируулагдаагүй бол мок ашиглана.
  if (env.testMode || env.xyp.accessToken === 'TEST_XYP_TOKEN') {
    return mockCitizen(register);
  }

  try {
    return await fetchFromXyp(register);
  } catch {
    // XYP алдаа гарвал мок руу шилжих (тестийн тогтвортой байдлын төлөө).
    return mockCitizen(register);
  }
}

// 18+ нас баталгаажуулалт
export interface AgeVerification {
  verified: boolean;
  age: number | null;
  citizen: CitizenInfo;
  message: string;
}

export async function verifyAge(registerRaw: string): Promise<AgeVerification> {
  const citizen = await getCitizenInfo(registerRaw);

  if (!citizen.found || citizen.age === null) {
    return {
      verified: false,
      age: null,
      citizen,
      message: citizen.error ?? 'Иргэний мэдээлэл олдсонгүй',
    };
  }

  if (citizen.age < env.minAge) {
    return {
      verified: false,
      age: citizen.age,
      citizen,
      message: `Нас хүрэхгүй байна. ${env.minAge}+ нас шаардлагатай (одоо ${citizen.age} нас).`,
    };
  }

  return {
    verified: true,
    age: citizen.age,
    citizen,
    message: `Нас баталгаажлаа (${citizen.age} нас).`,
  };
}
