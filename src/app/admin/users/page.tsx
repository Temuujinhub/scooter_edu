'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Spinner, Badge, Input } from '@/components/ui';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';
import { Search } from 'lucide-react';

interface AdminUser {
  id: string;
  phone: string;
  registerNumber: string | null;
  name: string;
  role: string;
  ageVerified: boolean;
  xypVerified: boolean;
  isTestUser: boolean;
  enrollments: number;
  certificates: number;
  examAttempts: number;
  createdAt: string;
}

export default function AdminUsersPage() {
  const [users, setUsers] = useState<AdminUser[] | null>(null);
  const [q, setQ] = useState('');

  useEffect(() => {
    api<AdminUser[]>('/api/admin/users').then(setUsers).catch(() => {});
  }, []);

  const filtered = users?.filter(
    (u) =>
      u.name.toLowerCase().includes(q.toLowerCase()) ||
      u.phone.includes(q) ||
      (u.registerNumber ?? '').toLowerCase().includes(q.toLowerCase())
  );

  return (
    <AppShell nav={adminNav} title="Хэрэглэгчид" requireRole="ADMIN">
      {!users ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between gap-4">
            <p className="text-sm text-slate-500">
              Нийт {users.length} хэрэглэгч. Бүртгэл, нас баталгаажуулалт, идэвхийг хянана.
            </p>
            <div className="relative w-64">
              <Search className="absolute left-3 top-3 h-4 w-4 text-slate-400" />
              <Input
                className="pl-9"
                placeholder="Нэр, утас, регистр хайх"
                value={q}
                onChange={(e) => setQ(e.target.value)}
              />
            </div>
          </div>

          <Card className="overflow-x-auto">
            <table className="w-full min-w-[760px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Нэр</th>
                  <th className="px-4 py-3">Утас</th>
                  <th className="px-4 py-3">Регистр</th>
                  <th className="px-4 py-3">Үүрэг</th>
                  <th className="px-4 py-3">Баталгаажуулалт</th>
                  <th className="px-4 py-3 text-center">Элсэлт</th>
                  <th className="px-4 py-3 text-center">Гэрчилгээ</th>
                  <th className="px-4 py-3">Бүртгүүлсэн</th>
                </tr>
              </thead>
              <tbody>
                {filtered?.map((u) => (
                  <tr key={u.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3 font-medium text-slate-900">{u.name}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">{u.phone}</td>
                    <td className="px-4 py-3 font-mono text-xs text-slate-600">
                      {u.registerNumber ?? '—'}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={u.role === 'ADMIN' ? 'red' : u.role === 'INSTRUCTOR' ? 'amber' : 'blue'}>
                        {u.role === 'ADMIN' ? 'Админ' : u.role === 'INSTRUCTOR' ? 'Багш' : 'Суралцагч'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3">
                      <div className="flex flex-wrap gap-1">
                        {u.ageVerified && <Badge color="green">18+</Badge>}
                        {u.xypVerified && <Badge color="blue">Хур</Badge>}
                        {u.isTestUser && <Badge color="amber">Тест</Badge>}
                      </div>
                    </td>
                    <td className="px-4 py-3 text-center text-slate-600">{u.enrollments}</td>
                    <td className="px-4 py-3 text-center text-slate-600">{u.certificates}</td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(u.createdAt)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
