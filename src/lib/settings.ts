import { prisma } from './prisma';

// Сайтын тохиргооны түлхүүрүүд, default утга, админ формын мета.
export interface SettingDef {
  key: string;
  label: string;
  hint: string;
  group: 'hero' | 'contact' | 'certificate';
  multiline?: boolean;
  default: string;
}

export const SETTING_DEFS: SettingDef[] = [
  // ── Hero хэсэг ──
  { key: 'hero_badge', label: 'Hero тэмдэг', hint: 'Дээд талын жижиг шошго', group: 'hero', default: '2026 оны шинэ дүрэмд бэлэн' },
  { key: 'hero_title_pre', label: 'Гарчиг (эхэнд)', hint: 'Онцлох үгийн өмнөх хэсэг', group: 'hero', default: 'Цахилгаан скүүтэрээ' },
  { key: 'hero_title_accent', label: 'Онцлох үг', hint: 'Ногоон өнгөөр онцлогдоно', group: 'hero', default: 'аюулгүй' },
  { key: 'hero_title_post', label: 'Гарчиг (төгсгөл)', hint: 'Онцлох үгийн дараах хэсэг', group: 'hero', default: 'жолоодож сур' },
  { key: 'hero_subtitle', label: 'Дэд гарчиг', hint: 'Hero доорх тайлбар', group: 'hero', multiline: true, default: 'Монгол Улсын анхны e-scooter онлайн сургалт ба дижитал гэрчилгээний платформ. Онлайнаар хурдан, офлайнаар баталгаатай — 90 минутад.' },
  { key: 'hero_stat1_value', label: 'Статистик 1 — утга', hint: '', group: 'hero', default: '20,000+' },
  { key: 'hero_stat1_label', label: 'Статистик 1 — нэр', hint: '', group: 'hero', default: 'УБ дахь скүүтэр' },
  { key: 'hero_stat2_value', label: 'Статистик 2 — утга', hint: '', group: 'hero', default: '4' },
  { key: 'hero_stat2_label', label: 'Статистик 2 — нэр', hint: '', group: 'hero', default: 'Сургалтын модуль' },
  { key: 'hero_stat3_value', label: 'Статистик 3 — утга', hint: '', group: 'hero', default: '7' },
  { key: 'hero_stat3_label', label: 'Статистик 3 — нэр', hint: '', group: 'hero', default: 'Хамтрагч апп' },

  // ── Холбоо барих (footer) ──
  { key: 'contact_email', label: 'И-мэйл', hint: 'Footer ба холбоо барих', group: 'contact', default: 'info@scooteredu.mn' },
  { key: 'contact_phone', label: 'Утас', hint: '', group: 'contact', default: '7011-0000' },
  { key: 'contact_address', label: 'Хаяг', hint: '', group: 'contact', default: 'Улаанбаатар, Монгол' },
  { key: 'footer_tagline', label: 'Footer тайлбар', hint: 'Лого доорх товч текст', group: 'contact', multiline: true, default: 'Монгол Улсын цахилгаан скүүтэр хэрэглэгчдийг аюулгүй жолоодогч болгох — онлайнаар хурдан, офлайнаар баталгаатай.' },

  // ── Гэрчилгээ ──
  { key: 'cert_org_name', label: 'Байгууллагын нэр', hint: 'Гэрчилгээн дээр', group: 'certificate', default: 'ScooterEdu MN' },
  { key: 'cert_issuer', label: 'Олгогч', hint: 'Гэрчилгээ олгогч компани', group: 'certificate', default: 'MediaProfessional LLC' },
  { key: 'cert_validity_years', label: 'Хүчинтэй хугацаа (жил)', hint: 'Гэрчилгээний хугацаа', group: 'certificate', default: '2' },
];

const DEFAULTS = Object.fromEntries(SETTING_DEFS.map((d) => [d.key, d.default]));

export type SettingsMap = Record<string, string>;

// DB-ээс тохиргоог уншиж default-тай нэгтгэнэ.
export async function getSettings(): Promise<SettingsMap> {
  try {
    const rows = await prisma.siteSetting.findMany();
    const map: SettingsMap = { ...DEFAULTS };
    for (const r of rows) map[r.key] = r.value;
    return map;
  } catch {
    return { ...DEFAULTS };
  }
}
