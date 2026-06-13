'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { ScooterIcon } from '@/components/brand-logo';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, Hash, Calendar, Award, ClipboardCheck, MapPin } from 'lucide-react';

interface Cert {
  id: string;
  certNumber: string;
  ownerName: string;
  phone: string;
  examScore: number | null;
  issuedAt: string;
  expiresAt: string;
  status: string;
}

export default function AdminCertsPage() {
  const [certs, setCerts] = useState<Cert[] | null>(null);
  const [busy, setBusy] = useState('');

  async function load() {
    setCerts(await api<Cert[]>('/api/admin/certificates'));
  }
  useEffect(() => {
    load();
  }, []);

  async function setStatus(id: string, status: string) {
    setBusy(id);
    try {
      await api(`/api/admin/certificates/${id}`, { method: 'PATCH', json: { status } });
      load();
    } finally {
      setBusy('');
    }
  }

  return (
    <AppShell nav={adminNav} title="Гэрчилгээ" requireRole="ADMIN">
      {!certs ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          <CertInfo />
          <p className="text-sm text-slate-500">
            Нийт {certs.length} гэрчилгээ. Шаардлагатай бол цуцлах эсвэл сэргээх боломжтой.
          </p>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Дугаар</th>
                  <th className="px-4 py-3">Эзэмшигч</th>
                  <th className="px-4 py-3">Шалгалт</th>
                  <th className="px-4 py-3">Олгосон</th>
                  <th className="px-4 py-3">Дуусах</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {certs.map((c) => (
                  <tr key={c.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-mono text-xs text-brand-700">{c.certNumber}</td>
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{c.ownerName}</div>
                      <div className="text-xs text-slate-400">{c.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">{c.examScore ? `${c.examScore}%` : '—'}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(c.issuedAt)}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(c.expiresAt)}</td>
                    <td className="px-4 py-3">
                      <Badge color={c.status === 'ACTIVE' ? 'green' : c.status === 'REVOKED' ? 'red' : 'amber'}>
                        {c.status === 'ACTIVE' ? 'Хүчинтэй' : c.status === 'REVOKED' ? 'Цуцлагдсан' : 'Хугацаа дууссан'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {c.status === 'ACTIVE' ? (
                        <Button size="sm" variant="ghost" loading={busy === c.id} onClick={() => setStatus(c.id, 'REVOKED')}>
                          Цуцлах
                        </Button>
                      ) : (
                        <Button size="sm" variant="ghost" loading={busy === c.id} onClick={() => setStatus(c.id, 'ACTIVE')}>
                          Сэргээх
                        </Button>
                      )}
                    </td>
                  </tr>
                ))}
                {certs.length === 0 && (
                  <tr>
                    <td colSpan={7} className="px-4 py-10 text-center text-slate-400">
                      Гэрчилгээ алга байна.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </AppShell>
  );
}

// Гэрчилгээ хэрхэн үүсдэг + загварын урьдчилан харагдац
function CertInfo() {
  const rules = [
    { icon: ClipboardCheck, title: 'Онлайн шалгалт', desc: '30 асуултаас 80%+ (24/30) авч тэнцсэн байх.' },
    { icon: MapPin, title: 'Практик дадлага', desc: 'Дадлагатай багц (Стандарт/Pro) бол элемент A–G бүгдийг багш баталгаажуулсан байх. Үндсэн багц онлайнаар л гэрчилгээ авна.' },
    { icon: Award, title: 'Автомат үүсгэлт', desc: 'Нөхцөл хангагдмагц систем гэрчилгээг автоматаар үүсгэнэ.' },
    { icon: Hash, title: 'Дугаар ба hash', desc: 'SCE-YYYY-NNNNNN дугаар + SHA-256 баталгаажуулалтын hash үүснэ.' },
    { icon: Calendar, title: 'Хүчинтэй хугацаа', desc: 'Олгосон өдрөөс 2 жил. Дараа нь шинэчилнэ.' },
    { icon: ShieldCheck, title: 'Нийтийн шалгалт', desc: 'Хэн ч /verify/SCE-... хаягаар эсвэл QR-аар хүчинтэйг шалгана.' },
  ];
  return (
    <div className="grid gap-6 lg:grid-cols-2">
      {/* Generation logic */}
      <Card className="p-5">
        <h3 className="mb-1 flex items-center gap-2 font-bold text-slate-900">
          <Award className="h-5 w-5 text-brand-700" /> Гэрчилгээ хэрхэн үүсдэг вэ?
        </h3>
        <p className="mb-3 text-sm text-slate-500">Дижитал гэрчилгээ олгогдох нөхцөл ба логик.</p>
        <div className="space-y-2.5">
          {rules.map((r) => (
            <div key={r.title} className="flex items-start gap-2.5">
              <div className="mt-0.5 grid h-7 w-7 shrink-0 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <r.icon className="h-4 w-4" />
              </div>
              <div>
                <div className="text-sm font-semibold text-slate-800">{r.title}</div>
                <div className="text-xs text-slate-500">{r.desc}</div>
              </div>
            </div>
          ))}
        </div>
      </Card>

      {/* Template preview */}
      <div>
        <h3 className="mb-2 text-sm font-bold text-slate-700">Гэрчилгээний загвар (жишээ)</h3>
        <div className="overflow-hidden rounded-2xl border-2 border-brand-200 shadow-sm">
          <div className="hero-gradient flex items-center justify-between p-4 text-white">
            <div className="flex items-center gap-2">
              <div className="grid h-9 w-9 place-items-center rounded-lg bg-white/15">
                <ScooterIcon className="h-5 w-5 text-white" />
              </div>
              <div>
                <div className="text-[10px] uppercase tracking-widest text-brand-200">ScooterEdu MN</div>
                <div className="text-sm font-extrabold">Дижитал Гэрчилгээ</div>
              </div>
            </div>
            <Badge color="green">Хүчинтэй</Badge>
          </div>
          <div className="grid grid-cols-[1fr_auto] gap-3 bg-white p-4">
            <div>
              <div className="text-xs text-slate-400">Эзэмшигч</div>
              <div className="text-lg font-extrabold text-slate-900">Б.Батбаяр</div>
              <div className="text-xs text-slate-500">Регистр: УБ95051512</div>
              <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                <div><span className="text-slate-400">Дугаар:</span> <span className="font-mono">SCE-2026-000001</span></div>
                <div><span className="text-slate-400">Шалгалт:</span> 93%</div>
                <div><span className="text-slate-400">Олгосон:</span> 2026/06/13</div>
                <div><span className="text-slate-400">Дуусах:</span> 2028/06/13</div>
              </div>
              <div className="mt-2 inline-flex items-center gap-1 rounded-full bg-accent-50 px-2 py-0.5 text-[10px] font-semibold text-accent-700">
                <ShieldCheck className="h-3 w-3" /> Практик баталгаажсан
              </div>
            </div>
            <div className="grid place-items-center">
              <div className="grid h-20 w-20 place-items-center rounded-lg border border-slate-200 bg-slate-50 text-[9px] text-slate-400">
                QR
              </div>
            </div>
          </div>
        </div>
        <p className="mt-2 text-xs text-slate-400">
          Жинхэнэ гэрчилгээ нь хэрэглэгчийн «Гэрчилгээ» хэсэгт QR кодтойгоор үүсэж, PDF татах боломжтой.
        </p>
      </div>
    </div>
  );
}
