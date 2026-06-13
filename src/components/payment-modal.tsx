'use client';

import { useEffect, useState } from 'react';
import { Button, Spinner, Alert } from './ui';
import { QrCode } from './qr-code';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { X, CheckCircle2, Smartphone } from 'lucide-react';

interface InitRes {
  paymentId: string;
  amount: number;
  qrText: string;
  isMock: boolean;
  canSimulate: boolean;
}

// QPay төлбөрийн модал — invoice үүсгэж QR харуулна, статус хянана.
export function PaymentModal({
  packageCode,
  title,
  onClose,
  onPaid,
}: {
  packageCode: string;
  title: string;
  onClose: () => void;
  onPaid: () => void;
}) {
  const [invoice, setInvoice] = useState<InitRes | null>(null);
  const [error, setError] = useState('');
  const [paid, setPaid] = useState(false);
  const [checking, setChecking] = useState(false);

  useEffect(() => {
    api<InitRes>('/api/payments/qpay/init', { method: 'POST', json: { packageCode } })
      .then(setInvoice)
      .catch((e) => setError(e.message));
  }, [packageCode]);

  // Статусыг тогтмол шалгах (production webhook эсвэл QPay)
  useEffect(() => {
    if (!invoice || paid) return;
    const t = setInterval(async () => {
      try {
        const r = await api<{ paid: boolean }>(`/api/payments/${invoice.paymentId}/status`);
        if (r.paid) {
          setPaid(true);
          clearInterval(t);
          setTimeout(onPaid, 1200);
        }
      } catch {}
    }, 3000);
    return () => clearInterval(t);
  }, [invoice, paid, onPaid]);

  async function simulate() {
    if (!invoice) return;
    setChecking(true);
    setError('');
    try {
      await api('/api/payments/simulate', {
        method: 'POST',
        json: { paymentId: invoice.paymentId },
      });
      setPaid(true);
      setTimeout(onPaid, 1200);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setChecking(false);
    }
  }

  return (
    <div className="fixed inset-0 z-50 grid place-items-center bg-black/50 p-4">
      <div className="w-full max-w-sm rounded-2xl bg-white p-6 shadow-xl">
        <div className="flex items-center justify-between">
          <h3 className="text-lg font-bold text-slate-900">QPay төлбөр</h3>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>

        {error && <Alert variant="error" className="mt-4">{error}</Alert>}

        {paid ? (
          <div className="py-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-accent-500" />
            <p className="mt-3 text-lg font-bold text-slate-900">Төлбөр амжилттай!</p>
            <p className="text-sm text-slate-500">Курст бүртгэгдлээ. Шилжиж байна...</p>
          </div>
        ) : !invoice ? (
          <div className="grid place-items-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <div className="mt-4 text-center">
            <p className="text-sm text-slate-500">{title}</p>
            <p className="mt-1 text-3xl font-extrabold text-brand-800">{formatMnt(invoice.amount)}</p>

            <div className="mt-5 flex justify-center">
              <div className="rounded-2xl border border-slate-200 bg-white p-3">
                <QrCode value={invoice.qrText} size={170} />
              </div>
            </div>
            <p className="mt-3 flex items-center justify-center gap-1.5 text-xs text-slate-500">
              <Smartphone className="h-4 w-4" /> QPay апп нээж QR кодыг уншуулна уу
            </p>

            {invoice.canSimulate && (
              <div className="mt-5 border-t border-dashed border-slate-200 pt-4">
                <p className="mb-2 text-xs text-slate-400">Тест горим</p>
                <Button variant="success" className="w-full" onClick={simulate} loading={checking}>
                  Төлбөр баталгаажуулах (симуляци)
                </Button>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
