// Системийн нийтлэг тогтмолууд

// Практик дадлагын элементүүд (Судалгааны 9.1)
export const PRACTICE_ELEMENTS = [
  { code: 'A', titleMn: 'Эхлэх, зогсох', criteria: 'Жигд эхлэх, аюулгүй зогсох' },
  { code: 'B', titleMn: 'Шулуун явах', criteria: 'Нарийн шугам дагах' },
  { code: 'C', titleMn: 'Эргэлт (баруун/зүүн/U)', criteria: 'Зөв эргэлт' },
  { code: 'D', titleMn: 'Саад давах (шон тойрох)', criteria: 'Нарийн замаар нэвтрэх' },
  { code: 'E', titleMn: 'Гар хурдаар явах', criteria: 'Тэнцвэр хадгалах' },
  { code: 'F', titleMn: 'Яаралтай зогсолт', criteria: '7 метрт зогсох' },
  { code: 'G', titleMn: 'Замын хөдөлгөөнд нэгдэх', criteria: 'Зөв ажиглалт, эргэлт' },
] as const;

// Шалгалтын параметр (Судалгааны 8.1) — 6 модульд тохируулсан
export const EXAM_CONFIG = {
  totalQuestions: 30,
  durationMin: 30,
  passPercent: 80,
  passScore: 24, // 24/30
  maxAttempts: 3,
  retryDelayHours: 3,
  lockoutHours: 24,
  distribution: { M1: 5, M2: 5, M3: 5, M4: 5, M5: 5, M6: 5 },
};

// Сертификатын хүчинтэй хугацаа (жил)
export const CERT_VALIDITY_YEARS = 2;

// Статусын монгол нэрс
export const STATUS_LABELS: Record<string, string> = {
  PENDING_PAYMENT: 'Төлбөр хүлээгдэж буй',
  ACTIVE: 'Идэвхтэй',
  COMPLETED: 'Дууссан',
  NOT_STARTED: 'Эхлээгүй',
  IN_PROGRESS: 'Үргэлжилж буй',
  PASSED: 'Тэнцсэн',
  FAILED: 'Тэнцээгүй',
  BOOKED: 'Захиалсан',
  CANCELLED: 'Цуцалсан',
  EXPIRED: 'Хугацаа дууссан',
  REVOKED: 'Цуцлагдсан',
  PENDING: 'Хүлээгдэж буй',
  PAID: 'Төлөгдсөн',
  REFUNDED: 'Буцаагдсан',
  LINKED: 'Холбогдсон',
  UNLINKED: 'Салгагдсан',
};
