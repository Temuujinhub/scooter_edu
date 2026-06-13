// Орчны хувьсагчдыг нэг дороос, default утгатайгаар уншина.
// Ингэснээр .env байхгүй ч систем тестийн горимд ажиллана.

export const env = {
  jwtSecret:
    process.env.JWT_SECRET ?? 'scooteredu-mn-test-secret-key-change-in-production-2026',
  testMode: (process.env.TEST_MODE ?? 'true') === 'true',
  appUrl: process.env.NEXT_PUBLIC_APP_URL ?? 'http://localhost:3000',
  minAge: parseInt(process.env.MIN_AGE ?? '18', 10),

  qpay: {
    baseUrl: process.env.QPAY_BASE_URL ?? 'https://merchant.qpay.mn/v2',
    username: process.env.QPAY_USERNAME ?? 'TEST_MERCHANT',
    password: process.env.QPAY_PASSWORD ?? 'TEST_PASSWORD',
    invoiceCode: process.env.QPAY_INVOICE_CODE ?? 'SCOOTEREDU_MN_INVOICE',
  },

  xyp: {
    baseUrl: process.env.XYP_BASE_URL ?? 'https://xyp.gov.mn/api',
    accessToken: process.env.XYP_ACCESS_TOKEN ?? 'TEST_XYP_TOKEN',
    username: process.env.XYP_WSDL_USERNAME ?? 'TEST',
    password: process.env.XYP_WSDL_PASSWORD ?? 'TEST',
  },

  sms: {
    provider: process.env.SMS_PROVIDER ?? 'mock',
    apiKey: process.env.SMS_API_KEY ?? 'TEST_SMS_KEY',
    sender: process.env.SMS_SENDER ?? 'ScooterEdu',
  },
};
