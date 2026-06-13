'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { QrCode } from '@/components/qr-code';
import { ScooterIcon } from '@/components/brand-logo';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';
import { Award, ShieldCheck, ExternalLink, BookOpen } from 'lucide-react';

interface Cert {
  id: string;
  certNumber: string;
  ownerName: string;
  registerNumber: string | null;
  examScore: number | null;
  practiceVerified: boolean;
  issuedAt: string;
  expiresAt: string;
  status: string;
  hash: string;
  verifyUrl: string;
}

export default function CertificatesPage() {
  const [certs, setCerts] = useState<Cert[] | null>(null);

  useEffect(() => {
    api<Cert[]>('/api/certificates').then(setCerts).catch(() => setCerts([]));
  }, []);

  return (
    <AppShell nav={studentNav} title="Дижитал гэрчилгээ">
      {!certs ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : certs.length === 0 ? (
        <Card className="py-16 text-center">
          <Award className="mx-auto h-16 w-16 text-slate-300" />
          <h3 className="mt-3 text-lg font-bold text-slate-900">Гэрчилгээ алга</h3>
          <p className="mt-1 text-sm text-slate-500">
            Сургалт, шалгалт, практик дадлагаа дүүргэснээр дижитал гэрчилгээ автоматаар үүснэ.
          </p>
          <Link href="/courses">
            <Button className="mt-5">
              <BookOpen className="h-4 w-4" /> Сургалт үзэх
            </Button>
          </Link>
        </Card>
      ) : (
        <div className="space-y-6">
          {certs.map((c) => (
            <CertificateCard key={c.id} cert={c} />
          ))}
        </div>
      )}
    </AppShell>
  );
}

function CertificateCard({ cert }: { cert: Cert }) {
  return (
    <div>
      <Card className="overflow-hidden border-2 border-brand-200 print:border-0 print:shadow-none">
        {/* Header */}
        <div className="hero-gradient flex items-center justify-between p-6 text-white">
          <div className="flex items-center gap-3">
            <div className="grid h-12 w-12 place-items-center rounded-xl bg-white/15">
              <ScooterIcon className="h-7 w-7 text-white" />
            </div>
            <div>
              <div className="text-xs uppercase tracking-widest text-brand-200">ScooterEdu MN</div>
              <div className="text-lg font-extrabold">Дижитал Гэрчилгээ</div>
            </div>
          </div>
          <Badge color={cert.status === 'ACTIVE' ? 'green' : 'red'}>
            {cert.status === 'ACTIVE' ? 'Хүчинтэй' : cert.status === 'EXPIRED' ? 'Хугацаа дууссан' : 'Цуцлагдсан'}
          </Badge>
        </div>

        {/* Body */}
        <div className="grid gap-6 p-6 md:grid-cols-[1fr_auto]">
          <div>
            <p className="text-sm text-slate-500">Гэрчилгээ эзэмшигч</p>
            <h2 className="text-2xl font-extrabold text-slate-900">{cert.ownerName}</h2>
            {cert.registerNumber && (
              <p className="text-sm text-slate-500">Регистр: {cert.registerNumber}</p>
            )}

            <p className="mt-4 max-w-md text-sm text-slate-600">
              Монгол Улсад цахилгаан скүүтэр жолоодох онлайн сургалтыг амжилттай дүүргэж,
              практик дадлагыг баталгаажуулсныг гэрчилж байна.
            </p>

            <div className="mt-5 grid grid-cols-2 gap-4 text-sm sm:grid-cols-4">
              <Field label="Дугаар" value={cert.certNumber} mono />
              <Field label="Олгосон" value={formatDate(cert.issuedAt)} />
              <Field label="Дуусах" value={formatDate(cert.expiresAt)} />
              <Field label="Шалгалт" value={cert.examScore ? `${cert.examScore}%` : '—'} />
            </div>

            <div className="mt-4 flex flex-wrap items-center gap-2">
              {cert.practiceVerified && (
                <span className="inline-flex items-center gap-1 rounded-full bg-accent-50 px-2.5 py-1 text-xs font-semibold text-accent-700">
                  <ShieldCheck className="h-4 w-4" /> Практик баталгаажсан
                </span>
              )}
              <span className="rounded-full bg-slate-100 px-2.5 py-1 font-mono text-[10px] text-slate-500">
                SHA-256: {cert.hash.slice(0, 24)}…
              </span>
            </div>
          </div>

          {/* QR */}
          <div className="flex flex-col items-center justify-center">
            <div className="rounded-2xl border border-slate-200 p-2">
              <QrCode value={cert.verifyUrl} size={130} />
            </div>
            <p className="mt-2 text-center text-[10px] text-slate-400">Нийтийн шалгалт</p>
          </div>
        </div>
      </Card>

      {/* Actions */}
      <div className="mt-3 flex flex-wrap gap-2 print:hidden">
        <Button variant="outline" size="sm" onClick={() => window.print()}>
          Хэвлэх / PDF татах
        </Button>
        <Link href={`/verify/${cert.certNumber}`} target="_blank">
          <Button variant="ghost" size="sm">
            <ExternalLink className="h-4 w-4" /> Нийтийн шалгалт нээх
          </Button>
        </Link>
      </div>
    </div>
  );
}

function Field({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div>
      <div className="text-xs text-slate-400">{label}</div>
      <div className={`font-semibold text-slate-800 ${mono ? 'font-mono text-xs' : 'text-sm'}`}>
        {value}
      </div>
    </div>
  );
}
