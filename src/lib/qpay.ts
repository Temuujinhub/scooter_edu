// ──────────────────────────────────────────────────────────────────
// QPay v2 төлбөрийн нэгтгэл — https://merchant.qpay.mn
// Судалгааны баримтын 6.2 хэсэгт үндэслэв.
//
// Урсгал: createInvoice → QR/deeplink → хэрэглэгч төлнө → webhook → PAID
//
// ТЕСТ ГОРИМД: бодит QPay руу хандахгүй, мок invoice буцаана.
// "Төлбөр баталгаажуулах (симуляци)" товчоор төлбөрийг PAID болгоно.
// ──────────────────────────────────────────────────────────────────

import { env } from './env';
import { randomToken } from './utils';

export interface QpayInvoice {
  invoiceId: string;
  qrText: string; // QR-д кодлогдох текст / deeplink
  shortUrl: string;
  isMock: boolean;
}

export interface CreateInvoiceParams {
  amount: number;
  description: string;
  senderInvoiceNo: string; // манай payment ID
  callbackUrl: string;
}

// Production-д QPay access token авах
async function getQpayToken(): Promise<string> {
  const credentials = Buffer.from(
    `${env.qpay.username}:${env.qpay.password}`
  ).toString('base64');

  const res = await fetch(`${env.qpay.baseUrl}/auth/token`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Basic ${credentials}`,
    },
  });

  if (!res.ok) throw new Error('QPAY_AUTH_FAILED');
  const data = await res.json();
  return data.access_token as string;
}

// QPay invoice үүсгэх
export async function createInvoice(
  params: CreateInvoiceParams
): Promise<QpayInvoice> {
  // Тест горим эсвэл тохируулга байхгүй бол мок
  if (env.testMode || env.qpay.password === 'TEST_PASSWORD') {
    const invoiceId = 'MOCK-' + randomToken(16);
    return {
      invoiceId,
      qrText: `qpay://invoice/${invoiceId}?amount=${params.amount}`,
      shortUrl: `${env.appUrl}/pay/mock/${invoiceId}`,
      isMock: true,
    };
  }

  const token = await getQpayToken();
  const res = await fetch(`${env.qpay.baseUrl}/invoice`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      invoice_code: env.qpay.invoiceCode,
      sender_invoice_no: params.senderInvoiceNo,
      invoice_receiver_code: 'terminal',
      invoice_description: params.description,
      amount: params.amount,
      callback_url: params.callbackUrl,
    }),
  });

  if (!res.ok) throw new Error('QPAY_INVOICE_FAILED');
  const data = await res.json();

  return {
    invoiceId: data.invoice_id,
    qrText: data.qr_text,
    shortUrl: data.qPay_shortUrl ?? '',
    isMock: false,
  };
}

// QPay төлбөрийн статус шалгах (production)
export async function checkInvoice(invoiceId: string): Promise<boolean> {
  if (env.testMode || env.qpay.password === 'TEST_PASSWORD') {
    return false; // тестэд симуляцийн товч ашиглана
  }

  const token = await getQpayToken();
  const res = await fetch(`${env.qpay.baseUrl}/payment/check`, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      Authorization: `Bearer ${token}`,
    },
    body: JSON.stringify({
      object_type: 'INVOICE',
      object_id: invoiceId,
    }),
  });

  if (!res.ok) return false;
  const data = await res.json();
  return (data.count ?? 0) > 0 && data.paid_amount > 0;
}
