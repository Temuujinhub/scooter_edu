// Монгол Улсын иргэний регистрийн дугаарыг шалгах ба задлах.
// Формат: 2 кирилл үсэг + 8 цифр (нийт 10 тэмдэгт). Жишээ: УБ95051512
//
// Цифрүүд: YY MM DD SS
//   YY = төрсөн оны сүүлийн 2 орон
//   MM = сар (2000+ онд төрсөн бол сар дээр +20 нэмэгддэг конвенц)
//   DD = өдөр
//   SS = серийн дугаар (сүүлийн орон хүйс заана: тэгш=эм, сондгой=эр)

const REGISTER_REGEX = /^[А-ЯӨҮ]{2}\d{8}$/;

export interface ParsedRegister {
  valid: boolean;
  birthDate: Date | null;
  gender: 'M' | 'F' | null;
  error?: string;
}

export function validateRegisterFormat(register: string): boolean {
  return REGISTER_REGEX.test(register.trim().toUpperCase());
}

export function parseRegister(registerRaw: string): ParsedRegister {
  const register = registerRaw.trim().toUpperCase();

  if (!REGISTER_REGEX.test(register)) {
    return {
      valid: false,
      birthDate: null,
      gender: null,
      error: 'Регистрийн дугаар буруу (2 үсэг + 8 тоо байх ёстой)',
    };
  }

  const digits = register.slice(2); // 8 цифр
  const yy = parseInt(digits.slice(0, 2), 10);
  let mm = parseInt(digits.slice(2, 4), 10);
  const dd = parseInt(digits.slice(4, 6), 10);
  const serial = parseInt(digits.slice(6, 8), 10);

  // Зуунаа тодорхойлох: сар 21–32 бол 2000+ онд төрсөн.
  let year: number;
  if (mm >= 21 && mm <= 32) {
    mm -= 20;
    year = 2000 + yy;
  } else {
    // 1900-аад он. Гэхдээ ирээдүйн он гарвал 2000+ гэж үзнэ.
    year = 1900 + yy;
    if (year > new Date().getFullYear()) year -= 100;
  }

  // Огнооны хүчинтэй эсэх
  if (mm < 1 || mm > 12 || dd < 1 || dd > 31) {
    return {
      valid: false,
      birthDate: null,
      gender: null,
      error: 'Регистрээс төрсөн огноо тодорхойлох боломжгүй',
    };
  }

  const birthDate = new Date(Date.UTC(year, mm - 1, dd));
  const gender: 'M' | 'F' = serial % 2 === 0 ? 'F' : 'M';

  return { valid: true, birthDate, gender };
}

// Төрсөн огноогоор нас тооцоолох
export function calculateAge(birthDate: Date): number {
  const today = new Date();
  let age = today.getFullYear() - birthDate.getFullYear();
  const m = today.getMonth() - birthDate.getMonth();
  if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
    age--;
  }
  return age;
}
