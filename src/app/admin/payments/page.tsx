'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import { formatMnt, formatDateTime } from '@/lib/utils';

interface Payment {
  id: string;
  user: string;
  phone: string;
  amount: number;
  method: string;
  status: string;
  description: string;
  paidAt: string | null;
  createdAt: string;
}

export default function AdminPaymentsPage() {
  const [payments, setPayments] = useState<Payment[] | null>(null);

  useEffect(() => {
    api<Payment[]>('/api/admin/payments').then(setPayments).catch(() => {});
  }, []);

  const totalPaid = payments?.filter((p) => p.status === 'PAID').reduce((s, p) => s + p.amount, 0) ?? 0;

  return (
    <AppShell nav={adminNav} title="Төлбөр" requireRole="ADMIN">
      {!payments ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-2">
            <p className="text-sm text-slate-500">Нийт {payments.length} төлбөрийн гүйлгээ.</p>
            <div className="rounded-xl bg-accent-50 px-4 py-2 text-sm font-semibold text-accent-700">
              Нийт орлого: {formatMnt(totalPaid)}
            </div>
          </div>
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[720px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Хэрэглэгч</th>
                  <th className="px-4 py-3">Дүн</th>
                  <th className="px-4 py-3">Арга</th>
                  <th className="px-4 py-3">Тайлбар</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3">Огноо</th>
                </tr>
              </thead>
              <tbody>
                {payments.map((p) => (
                  <tr key={p.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{p.user}</div>
                      <div className="text-xs text-slate-400">{p.phone}</div>
                    </td>
                    <td className="px-4 py-3 font-semibold text-slate-900">{formatMnt(p.amount)}</td>
                    <td className="px-4 py-3 text-slate-600">{p.method}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{p.description}</td>
                    <td className="px-4 py-3">
                      <Badge color={p.status === 'PAID' ? 'green' : p.status === 'PENDING' ? 'amber' : 'red'}>
                        {p.status === 'PAID' ? 'Төлөгдсөн' : p.status === 'PENDING' ? 'Хүлээгдэж буй' : p.status === 'REFUNDED' ? 'Буцаагдсан' : 'Амжилтгүй'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDateTime(p.paidAt ?? p.createdAt)}</td>
                  </tr>
                ))}
                {payments.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Төлбөр алга байна.</td>
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
