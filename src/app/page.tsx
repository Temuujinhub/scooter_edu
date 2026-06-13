import Link from 'next/link';
import { prisma } from '@/lib/prisma';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { ScooterIcon } from '@/components/brand-logo';
import { formatMnt } from '@/lib/utils';
import {
  ShieldCheck,
  Smartphone,
  BadgeCheck,
  CreditCard,
  QrCode,
  GraduationCap,
  AlertTriangle,
  Clock,
  MapPin,
  Gift,
  CheckCircle2,
  ArrowRight,
} from 'lucide-react';

export const dynamic = 'force-dynamic';

const features = [
  { icon: Smartphone, title: 'Утсаар хялбар бүртгэл', desc: 'Утасны дугаараа оруулж SMS код (OTP)-оор хормын дотор баталгаажуулна.' },
  { icon: ShieldCheck, title: 'Хур системээр нас шалгах', desc: 'Засгийн газрын Хур (XYP) системээс регистрээр 18+ нас автоматаар баталгаажна.' },
  { icon: GraduationCap, title: '4 модуль онлайн хичээл', desc: 'Хууль, техник, хотын жолоодлого, ослоос сэргийлэх — видео ба интерактив агуулга.' },
  { icon: BadgeCheck, title: 'Онлайн шалгалт', desc: '30 асуултын шалгалт, 80% тэнцэх босго, anti-cheat хяналттай.' },
  { icon: QrCode, title: 'QR практик дадлага', desc: 'Гэрээт жолооны курст QR кодоор баталгаажуулсан бодит дадлага.' },
  { icon: CreditCard, title: 'QPay төлбөр', desc: 'Сургалтын төлбөрөө QPay-ээр шуурхай, аюулгүй төлнө.' },
];

const journey = [
  { n: 1, title: 'Бүртгүүлэх', desc: 'Утас + OTP + Хур нас шалгалт', icon: Smartphone },
  { n: 2, title: 'Сургалт үзэх', desc: '4 модуль онлайн хичээл', icon: GraduationCap },
  { n: 3, title: 'Шалгалт өгөх', desc: '30 асуулт, 80% тэнцэх', icon: BadgeCheck },
  { n: 4, title: 'Практик дадлага', desc: 'Жолооны курст QR баталгаажуулалт', icon: QrCode },
  { n: 5, title: 'Гэрчилгээ авах', desc: 'Дижитал сертификат + урамшуулал', icon: CheckCircle2 },
];

export default async function HomePage() {
  const [courses, partners] = await Promise.all([
    prisma.course.findMany({ where: { isActive: true }, orderBy: { sortOrder: 'asc' } }),
    prisma.partner.findMany({ where: { isActive: true }, orderBy: { createdAt: 'asc' } }),
  ]);

  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />

      {/* ── HERO ── */}
      <section className="hero-gradient relative overflow-hidden">
        <div className="mx-auto grid max-w-6xl items-center gap-10 px-4 py-16 md:grid-cols-2 md:py-24">
          <div className="animate-fade-up">
            <span className="inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-xs font-semibold text-brand-100">
              <span className="h-2 w-2 rounded-full bg-accent-400" />
              2026 оны шинэ дүрэмд бэлэн
            </span>
            <h1 className="mt-5 text-4xl font-extrabold leading-tight tracking-tight text-white md:text-5xl">
              Цахилгаан скүүтэрээ{' '}
              <span className="text-accent-400">аюулгүй</span> жолоодож сур
            </h1>
            <p className="mt-5 max-w-lg text-lg text-brand-100/90">
              Монгол Улсын анхны e-scooter онлайн сургалт ба дижитал гэрчилгээний платформ.
              Онлайнаар хурдан, офлайнаар баталгаатай — 90 минутад.
            </p>
            <div className="mt-8 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent-500 px-6 font-semibold text-white shadow-lg transition hover:bg-accent-600"
              >
                Сургалтаа эхлүүлэх <ArrowRight className="h-4 w-4" />
              </Link>
              <a
                href="#journey"
                className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/5 px-6 font-semibold text-white transition hover:bg-white/10"
              >
                Хэрхэн ажилладаг вэ?
              </a>
            </div>

            <div className="mt-10 grid max-w-md grid-cols-3 gap-4">
              {[
                { v: '20,000+', l: 'УБ дахь скүүтэр' },
                { v: '4', l: 'Сургалтын модуль' },
                { v: '7', l: 'Хамтрагч апп' },
              ].map((s) => (
                <div key={s.l}>
                  <div className="text-2xl font-extrabold text-white">{s.v}</div>
                  <div className="text-xs text-brand-200/80">{s.l}</div>
                </div>
              ))}
            </div>
          </div>

          <div className="relative animate-fade-up">
            <div className="animate-float rounded-3xl border border-white/10 bg-white/5 p-4 shadow-2xl backdrop-blur">
              {/* eslint-disable-next-line @next/next/no-img-element */}
              <img src="/images/hero.svg" alt="Скүүтэр жолоодлого" className="w-full" />
            </div>
          </div>
        </div>
      </section>

      {/* ── LAW BANNER ── */}
      <section className="border-y border-amber-200 bg-amber-50">
        <div className="mx-auto flex max-w-6xl flex-col items-center gap-4 px-4 py-5 text-center md:flex-row md:text-left">
          <AlertTriangle className="h-8 w-8 shrink-0 text-amber-500" />
          <p className="text-sm text-amber-900">
            <strong>2026 оны 6-р сарын 30-наас</strong> скүүтэрийг явган хүний замаар явахыг хатуу
            хориглосон. Насанд хүрээгүй жолоодвол эцэг эхэд <strong>400,000₮ торгууль</strong>.
            ScooterEdu MN таныг хуулийн шаардлагад нийцүүлэн бэлтгэнэ.
          </p>
        </div>
      </section>

      {/* ── FEATURES ── */}
      <section id="features" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
            Бүх зүйл нэг дор
          </h2>
          <p className="mt-3 text-slate-600">
            Бүртгэлээс эхлээд дижитал гэрчилгээ хүртэл — бүрэн автоматжуулсан, найдвартай систем.
          </p>
        </div>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f) => (
            <div
              key={f.title}
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition hover:-translate-y-1 hover:shadow-md"
            >
              <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700 transition group-hover:bg-brand-700 group-hover:text-white">
                <f.icon className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-bold text-slate-900">{f.title}</h3>
              <p className="mt-2 text-sm text-slate-600">{f.desc}</p>
            </div>
          ))}
        </div>
      </section>

      {/* ── JOURNEY ── */}
      <section id="journey" className="bg-white py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">
              5 алхамд гэрчилгээтэй болно
            </h2>
            <p className="mt-3 text-slate-600">Энгийн, ойлгомжтой, бүрэн онлайн урсгал.</p>
          </div>
          <div className="mt-14 grid gap-6 md:grid-cols-5">
            {journey.map((step, i) => (
              <div key={step.n} className="relative">
                {i < journey.length - 1 && (
                  <div className="absolute left-[60%] top-7 hidden h-0.5 w-full bg-gradient-to-r from-brand-200 to-transparent md:block" />
                )}
                <div className="relative flex flex-col items-center text-center">
                  <div className="grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-brand-600 to-brand-900 text-white shadow-lg">
                    <step.icon className="h-6 w-6" />
                  </div>
                  <div className="mt-3 text-xs font-bold uppercase tracking-wider text-accent-600">
                    Алхам {step.n}
                  </div>
                  <h3 className="mt-1 font-bold text-slate-900">{step.title}</h3>
                  <p className="mt-1 text-xs text-slate-500">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── PARTNERS ── */}
      <section id="partners" className="mx-auto max-w-6xl px-4 py-20">
        <div className="mx-auto max-w-2xl text-center">
          <span className="inline-flex items-center gap-2 rounded-full bg-accent-50 px-3 py-1 text-xs font-semibold text-accent-700">
            <Gift className="h-4 w-4" /> Урамшуулал
          </span>
          <h2 className="mt-4 text-3xl font-extrabold tracking-tight text-slate-900">
            {partners.length} түрээсийн апптай холбогдоно
          </h2>
          <p className="mt-3 text-slate-600">
            Сургалтаа дүүргэмэгц холбосон аппууд дотор урамшууллын оноо автоматаар бэлэглэгдэнэ.
          </p>
        </div>
        <div className="mt-12 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {partners.map((p) => (
            <div key={p.id} className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
              <div className="flex items-center gap-3">
                <div
                  className="grid h-11 w-11 place-items-center rounded-xl text-white shadow"
                  style={{ backgroundColor: p.logoColor }}
                >
                  <ScooterIcon className="h-5 w-5" />
                </div>
                <div>
                  <div className="font-bold text-slate-900">{p.name}</div>
                  <div className="text-xs text-slate-500">{p.appName}</div>
                </div>
              </div>
              <p className="mt-3 text-sm text-slate-600">{p.description}</p>
              <div className="mt-3 flex flex-wrap gap-2">
                <span className="rounded-full bg-accent-50 px-2.5 py-0.5 text-xs font-semibold text-accent-700">
                  +{p.rewardPoints} оноо
                </span>
                {p.discountPercent > 0 && (
                  <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-xs font-semibold text-brand-700">
                    {p.discountPercent}% хөнгөлөлт
                  </span>
                )}
                {p.scooterCount && (
                  <span className="rounded-full bg-slate-100 px-2.5 py-0.5 text-xs font-semibold text-slate-600">
                    {p.scooterCount}
                  </span>
                )}
              </div>
            </div>
          ))}
        </div>
      </section>

      {/* ── PRICING ── */}
      <section id="pricing" className="bg-slate-100 py-20">
        <div className="mx-auto max-w-6xl px-4">
          <div className="mx-auto max-w-2xl text-center">
            <h2 className="text-3xl font-extrabold tracking-tight text-slate-900">Үнийн санал</h2>
            <p className="mt-3 text-slate-600">Ил тод, нэг удаагийн төлбөр. Нуугдмал зардалгүй.</p>
          </div>
          <div className="mx-auto mt-12 grid max-w-3xl gap-6 sm:grid-cols-2">
            {courses.map((c, i) => (
              <div
                key={c.id}
                className={`relative rounded-2xl border bg-white p-7 shadow-sm ${
                  i === 0 ? 'border-brand-300 ring-2 ring-brand-200' : 'border-slate-200'
                }`}
              >
                {i === 0 && (
                  <span className="absolute -top-3 left-7 rounded-full bg-accent-500 px-3 py-1 text-xs font-bold text-white">
                    Эрэлттэй
                  </span>
                )}
                <h3 className="text-lg font-bold text-slate-900">{c.titleMn}</h3>
                <div className="mt-3 flex items-baseline gap-1">
                  <span className="text-4xl font-extrabold text-brand-800">{formatMnt(c.price)}</span>
                </div>
                <p className="mt-3 text-sm text-slate-600">{c.descriptionMn}</p>
                <ul className="mt-5 space-y-2 text-sm text-slate-700">
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> 4 модуль онлайн хичээл</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> Онлайн шалгалт (30 асуулт)</li>
                  <li className="flex items-center gap-2"><CheckCircle2 className="h-4 w-4 text-accent-600" /> {c.level === 'Бүрэн' ? 'Практик дадлага + гэрчилгээ' : 'Дижитал гэрчилгээ'}</li>
                </ul>
                <Link
                  href="/register"
                  className="mt-6 flex h-11 items-center justify-center rounded-xl bg-brand-800 font-semibold text-white transition hover:bg-brand-900"
                >
                  Сонгох
                </Link>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* ── CTA ── */}
      <section className="hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h2 className="text-3xl font-extrabold tracking-tight text-white md:text-4xl">
            Өнөөдөр аюулгүй жолоодогч бол
          </h2>
          <p className="mx-auto mt-4 max-w-xl text-brand-100/90">
            5 минутын дотор бүртгэлтэй болж, сургалтаа эхлүүлээрэй. Тест горимд хялбар нэвтэрч
            бүх боломжийг туршиж үзнэ.
          </p>
          <div className="mt-8 flex flex-wrap justify-center gap-3">
            <Link
              href="/register"
              className="inline-flex h-12 items-center gap-2 rounded-xl bg-accent-500 px-7 font-semibold text-white shadow-lg transition hover:bg-accent-600"
            >
              Үнэгүй бүртгүүлэх <ArrowRight className="h-4 w-4" />
            </Link>
            <Link
              href="/login"
              className="inline-flex h-12 items-center rounded-xl border border-white/25 bg-white/5 px-7 font-semibold text-white transition hover:bg-white/10"
            >
              Нэвтрэх
            </Link>
          </div>
          <div className="mt-8 flex flex-wrap items-center justify-center gap-6 text-sm text-brand-200/80">
            <span className="flex items-center gap-2"><Clock className="h-4 w-4" /> 90 минутын сургалт</span>
            <span className="flex items-center gap-2"><MapPin className="h-4 w-4" /> Хаанаас ч онлайн</span>
            <span className="flex items-center gap-2"><ShieldCheck className="h-4 w-4" /> Хуульд нийцсэн</span>
          </div>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}
