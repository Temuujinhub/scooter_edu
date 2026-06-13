'use client';

import { useEffect, useState } from 'react';
import { useParams } from 'next/navigation';
import Link from 'next/link';
import { BrandLogo } from '@/components/brand-logo';
import { Card, Spinner, Badge } from '@/components/ui';
import { formatDate } from '@/lib/utils';
import { ShieldCheck, ShieldX, CheckCircle2 } from 'lucide-react';

interface VerifyResult {
  valid: boolean;
  reason: string;
  certNumber?: string;
  owner?: string;
  examScore?: string | null;
  practiceVerified?: boolean;
  issuedAt?: string;
  expiresAt?: string;
  status?: string;
}

export default function VerifyPage() {
  const params = useParams();
  const certNumber = params.cert as string;
  const [result, setResult] = useState<VerifyResult | null>(null);

  useEffect(() => {
    fetch(`/api/certificates/verify/${certNumber}`)
      .then((r) => r.json())
      .then((d) => setResult(d.data ?? d))
      .catch(() => setResult({ valid: false, reason: 'error' }));
  }, [certNumber]);

  return (
    <div className="hero-gradient grid min-h-screen place-items-center p-4">
      <div className="w-full max-w-md">
        <div className="mb-6 flex justify-center">
          <Link href="/">
            <BrandLogo variant="light" />
          </Link>
        </div>

        {!result ? (
          <Card className="grid place-items-center py-20">
            <Spinner className="h-8 w-8" />
            <p className="mt-3 text-sm text-slate-500">Гэрчилгээ шалгаж байна...</p>
          </Card>
        ) : (
          <Card className="overflow-hidden">
            <div className={`p-8 text-center ${result.valid ? 'bg-accent-50' : 'bg-red-50'}`}>
              {result.valid ? (
                <ShieldCheck className="mx-auto h-20 w-20 text-accent-500" />
              ) : (
                <ShieldX className="mx-auto h-20 w-20 text-red-400" />
              )}
              <h1 className="mt-3 text-2xl font-extrabold text-slate-900">
                {result.valid ? 'Хүчинтэй гэрчилгээ' : 'Хүчингүй гэрчилгээ'}
              </h1>
              <p className="mt-1 text-sm text-slate-500">
                {result.valid
                  ? 'Энэ гэрчилгээ ScooterEdu MN-ээр баталгаажсан.'
                  : result.reason === 'not_found'
                    ? 'Ийм дугаартай гэрчилгээ олдсонгүй.'
                    : result.reason === 'expired'
                      ? 'Гэрчилгээний хугацаа дууссан байна.'
                      : 'Гэрчилгээ цуцлагдсан байна.'}
              </p>
            </div>

            {result.valid && (
              <div className="space-y-3 p-6">
                <Row label="Гэрчилгээ эзэмшигч" value={result.owner ?? '—'} />
                <Row label="Гэрчилгээний дугаар" value={result.certNumber ?? '—'} mono />
                <Row label="Олгосон огноо" value={formatDate(result.issuedAt)} />
                <Row label="Дуусах огноо" value={formatDate(result.expiresAt)} />
                {result.examScore && <Row label="Шалгалтын оноо" value={result.examScore} />}
                {result.practiceVerified && (
                  <div className="flex items-center gap-2 rounded-xl bg-accent-50 p-3 text-sm text-accent-700">
                    <CheckCircle2 className="h-5 w-5" /> Практик дадлага баталгаажсан
                  </div>
                )}
              </div>
            )}
          </Card>
        )}

        <p className="mt-6 text-center text-xs text-brand-200/70">
          ScooterEdu MN · Дижитал гэрчилгээний баталгаажуулалт
        </p>
      </div>
    </div>
  );
}

function Row({ label, value, mono }: { label: string; value: string; mono?: boolean }) {
  return (
    <div className="flex items-center justify-between border-b border-slate-100 pb-2.5 last:border-0">
      <span className="text-sm text-slate-500">{label}</span>
      <span className={`text-sm font-semibold text-slate-900 ${mono ? 'font-mono' : ''}`}>{value}</span>
    </div>
  );
}
