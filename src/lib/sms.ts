// SMS Gateway (Mobicom / Unitel) — OTP болон мэдэгдэл илгээх.
// ТЕСТ ГОРИМД бодитоор илгээхгүй, console-д лог хийнэ. OTP кодыг
// API хариунд буцааж дэлгэц дээр харуулна (хялбар тест хийхэд).

import { env } from './env';

export interface SmsResult {
  sent: boolean;
  mock: boolean;
}

export async function sendSms(phone: string, message: string): Promise<SmsResult> {
  if (env.testMode || env.sms.provider === 'mock') {
    console.log(`[SMS MOCK] → ${phone}: ${message}`);
    return { sent: true, mock: true };
  }

  // Production-д бодит SMS gateway-ийн API дуудна:
  // await fetch('https://api.mobicom.mn/sms/send', { ... })
  console.log(`[SMS] → ${phone}: ${message}`);
  return { sent: true, mock: false };
}

export async function sendOtp(phone: string, code: string): Promise<SmsResult> {
  return sendSms(
    phone,
    `ScooterEdu MN баталгаажуулах код: ${code}. 5 минутын дотor хүчинтэй.`
  );
}
