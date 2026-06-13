'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Alert } from '@/components/ui';
import { PaymentModal } from '@/components/payment-modal';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { CheckCircle2, ArrowRight, BookOpen, Building2, Plug } from 'lucide-react';

interface Pkg {
  id: string;
  code: string;
  name: string;
  price: number;
  priceLabel: string;
  tier: string;
  includesPractice: boolean;
  includesCard: boolean;
  enrollable: boolean;
  badge: string;
  description: string;
  features: string[];
}

export default function CoursesPage() {
  const router = useRouter();
  const [packages, setPackages] = useState<Pkg[] | null>(null);
  const [enrolled, setEnrolled] = useState(false);
  const [curriculumId, setCurriculumId] = useState<string | null>(null);
  const [pay, setPay] = useState<Pkg | null>(null);
  const [busy, setBusy] = useState<string | null>(null);
  const [error, setError] = useState('');

  async function load() {
    const [pkgs, dash] = await Promise.all([
      api<Pkg[]>('/api/packages'),
      api<{ journey: { enrolled: boolean }; curriculumId: string }>('/api/dashboard'),
    ]);
    setPackages(pkgs);
    setEnrolled(dash.journey.enrolled);
    setCurriculumId(dash.curriculumId);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  async function choose(pkg: Pkg) {
    setBusy(pkg.code);
    setError('');
    try {
      const res = await api<{ needPayment: boolean; enrollment: { status: string } }>(
        '/api/enroll',
        { method: 'POST', json: { packageCode: pkg.code } }
      );
      if (res.needPayment && res.enrollment.status !== 'ACTIVE') {
        setPay(pkg);
      } else if (curriculumId) {
        router.push(`/courses/${curriculumId}/learn`);
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell nav={studentNav} title="Сургалт ба багцууд">
      {!packages ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {error && <Alert variant="error">{error}</Alert>}

          {enrolled && (
            <Card className="flex flex-col items-start gap-3 border-accent-200 bg-accent-50 p-5 sm:flex-row sm:items-center">
              <CheckCircle2 className="h-8 w-8 text-accent-600" />
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">Та бүртгэлтэй байна</h3>
                <p className="text-sm text-slate-600">Сургалтаа үргэлжлүүлж болно.</p>
              </div>
              {curriculumId && (
                <Button variant="success" onClick={() => router.push(`/courses/${curriculumId}/learn`)}>
                  <BookOpen className="h-4 w-4" /> Сургалт үзэх
                </Button>
              )}
            </Card>
          )}

          {!enrolled && (
            <p className="text-sm text-slate-500">
              Хэрэгцээндээ тохирох багцаа сонгоорой. Бүх багц 4 модуль онлайн хичээл, шалгалт,
              дижитал гэрчилгээг агуулна.
            </p>
          )}

          {/* Enrollable packages */}
          <div className="grid gap-5 lg:grid-cols-3">
            {packages
              .filter((p) => p.enrollable)
              .map((p) => {
                const featured = p.badge === 'Эрэлттэй';
                return (
                  <Card
                    key={p.id}
                    className={`relative flex flex-col p-6 ${
                      featured ? 'border-brand-400 ring-2 ring-brand-200' : ''
                    }`}
                  >
                    {p.badge && (
                      <span
                        className={`absolute -top-3 left-6 rounded-full px-3 py-1 text-xs font-bold text-white ${
                          p.badge === 'Шинэ' ? 'bg-brand-600' : 'bg-accent-500'
                        }`}
                      >
                        {p.badge}
                      </span>
                    )}
                    <h3 className="text-lg font-bold text-slate-900">{p.name}</h3>
                    <div className="mt-2 text-3xl font-extrabold text-brand-800">
                      {formatMnt(p.price)}
                    </div>
                    <p className="mt-2 text-sm text-slate-600">{p.description}</p>
                    <ul className="mt-4 flex-1 space-y-2 text-sm text-slate-700">
                      {p.features.map((f) => (
                        <li key={f} className="flex items-start gap-2">
                          <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> {f}
                        </li>
                      ))}
                    </ul>
                    <Button
                      className="mt-5 w-full"
                      variant={featured ? 'primary' : 'secondary'}
                      onClick={() => choose(p)}
                      loading={busy === p.code}
                      disabled={enrolled}
                    >
                      {enrolled ? 'Бүртгэлтэй' : 'Сонгох'} {!enrolled && <ArrowRight className="h-4 w-4" />}
                    </Button>
                  </Card>
                );
              })}
          </div>

          {/* Contact packages (B2B, API) */}
          <div className="grid gap-5 md:grid-cols-2">
            {packages
              .filter((p) => !p.enrollable)
              .map((p) => (
                <Card key={p.id} className="flex flex-col bg-slate-900 p-6 text-white">
                  <div className="flex items-center gap-2">
                    {p.code === 'B2B' ? <Building2 className="h-5 w-5 text-accent-300" /> : <Plug className="h-5 w-5 text-accent-300" />}
                    <h3 className="text-lg font-bold">{p.name}</h3>
                    {p.badge && (
                      <span className="rounded-full bg-accent-500 px-2 py-0.5 text-xs font-bold">{p.badge}</span>
                    )}
                  </div>
                  <div className="mt-2 text-xl font-extrabold text-accent-300">
                    {p.price > 0 ? p.priceLabel || formatMnt(p.price) : p.priceLabel || 'Холбоо барих'}
                  </div>
                  <p className="mt-2 text-sm text-slate-300">{p.description}</p>
                  <ul className="mt-3 flex-1 space-y-1.5 text-sm text-slate-300">
                    {p.features.map((f) => (
                      <li key={f} className="flex items-start gap-2">
                        <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-400" /> {f}
                      </li>
                    ))}
                  </ul>
                  <a
                    href="mailto:info@scooteredu.mn"
                    className="mt-5 flex h-11 items-center justify-center rounded-xl border border-white/25 bg-white/10 font-semibold transition hover:bg-white/20"
                  >
                    Холбоо барих
                  </a>
                </Card>
              ))}
          </div>
        </div>
      )}

      {pay && (
        <PaymentModal
          packageCode={pay.code}
          title={`${pay.name} багц`}
          onClose={() => setPay(null)}
          onPaid={() => curriculumId && router.push(`/courses/${curriculumId}/learn`)}
        />
      )}
    </AppShell>
  );
}
