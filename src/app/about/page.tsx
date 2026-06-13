import Link from 'next/link';
import { SiteNav } from '@/components/site-nav';
import { SiteFooter } from '@/components/site-footer';
import { Target, Eye, Scale, ShieldCheck, Users, TrendingUp } from 'lucide-react';

export const metadata = {
  title: 'Тухай — ScooterEdu MN',
};

const fines = [
  ['Явган хүний замаар явах', '50,000–150,000₮'],
  ['18-аас доош насны жолоодогч', '400,000₮ (эцэг эхэд)'],
  ['Дуулгагүй жолоодох', '20,000–50,000₮'],
  ['Гар утас ашиглах', '50,000₮'],
  ['Согтуугаар жолоодох', '150,000–500,000₮ + эрх хасах'],
  ['Хурд хэтрүүлэх', '30,000–100,000₮'],
];

export default function AboutPage() {
  return (
    <div className="min-h-screen bg-slate-50">
      <SiteNav />

      <section className="hero-gradient">
        <div className="mx-auto max-w-4xl px-4 py-16 text-center">
          <h1 className="text-4xl font-extrabold text-white">ScooterEdu MN-ийн тухай</h1>
          <p className="mx-auto mt-4 max-w-2xl text-brand-100/90">
            Монгол Улсын цахилгаан скүүтэр хэрэглэгчдийг аюулгүй, хуульд нийцсэн жолоодогч болгох
            зорилготой онлайн сургалт, дижитал баталгаажуулалтын платформ.
          </p>
        </div>
      </section>

      <section className="mx-auto max-w-5xl px-4 py-16">
        <div className="grid gap-6 md:grid-cols-2">
          <Box icon={Eye} title="Алсын харагдлал">
            "Монгол Улсын нийт e-scooter хэрэглэгчдийг аюулгүй жолоодогч болгох — онлайнаар хурдан,
            офлайнаар баталгаатай."
          </Box>
          <Box icon={Target} title="Эрхэм зорилго">
            Хууль, аюулгүй байдлын мэдлэгийг шуурхай, хямд, баталгаатайгаар хүргэж, осол гэмтлийг
            бууруулах.
          </Box>
        </div>

        <div className="mt-12 grid gap-5 sm:grid-cols-3">
          <Stat icon={Users} value="20,000+" label="УБ дахь скүүтэр хэрэглэгч" />
          <Stat icon={TrendingUp} value="30–50%" label="Зах зээлийн жилийн өсөлт" />
          <Stat icon={ShieldCheck} value="90 мин" label="Сургалтын дундаж хугацаа" />
        </div>
      </section>

      {/* Law section */}
      <section className="bg-white py-16">
        <div className="mx-auto max-w-4xl px-4">
          <div className="flex items-center gap-3">
            <Scale className="h-8 w-8 text-brand-700" />
            <h2 className="text-2xl font-extrabold text-slate-900">Хуулийн орчин (2026)</h2>
          </div>
          <p className="mt-3 text-slate-600">
            2026 оны 6-р сарын 30-наас эхлэн скүүтэр, мопедыг явган хүний замаар явахыг хатуу
            хориглосон. Нийслэлийн Засаг даргын А/387, А/552, А/820 захирамжуудаар зохицуулагдана.
          </p>

          <div className="mt-6 overflow-hidden rounded-2xl border border-slate-200">
            <table className="w-full text-sm">
              <thead>
                <tr className="bg-brand-800 text-white">
                  <th className="px-4 py-3 text-left font-semibold">Зөрчил</th>
                  <th className="px-4 py-3 text-left font-semibold">Торгуулийн хэмжээ</th>
                </tr>
              </thead>
              <tbody>
                {fines.map(([k, v], i) => (
                  <tr key={k} className={i % 2 ? 'bg-slate-50' : 'bg-white'}>
                    <td className="px-4 py-3 text-slate-700">{k}</td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{v}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </section>

      <section className="hero-gradient">
        <div className="mx-auto max-w-3xl px-4 py-14 text-center">
          <h2 className="text-2xl font-extrabold text-white">Өнөөдөр эхлээрэй</h2>
          <Link
            href="/register"
            className="mt-6 inline-flex h-12 items-center rounded-xl bg-accent-500 px-7 font-semibold text-white shadow-lg transition hover:bg-accent-600"
          >
            Үнэгүй бүртгүүлэх
          </Link>
        </div>
      </section>

      <SiteFooter />
    </div>
  );
}

function Box({ icon: Icon, title, children }: { icon: any; title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="grid h-12 w-12 place-items-center rounded-xl bg-brand-50 text-brand-700">
        <Icon className="h-6 w-6" />
      </div>
      <h3 className="mt-4 text-lg font-bold text-slate-900">{title}</h3>
      <p className="mt-2 text-sm leading-relaxed text-slate-600">{children}</p>
    </div>
  );
}

function Stat({ icon: Icon, value, label }: { icon: any; value: string; label: string }) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-6 text-center shadow-sm">
      <Icon className="mx-auto h-8 w-8 text-accent-600" />
      <div className="mt-2 text-3xl font-extrabold text-brand-800">{value}</div>
      <div className="text-sm text-slate-500">{label}</div>
    </div>
  );
}
