'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';

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
        <div className="space-y-4">
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
