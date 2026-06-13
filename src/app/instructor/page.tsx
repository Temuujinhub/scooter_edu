'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { instructorNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';
import { QrCode, MapPin } from 'lucide-react';

interface Session {
  id: string;
  qrToken: string;
  status: string;
  scheduledAt: string;
  passedElements: number;
  totalElements: number;
  student: string;
  phone: string;
  school: string;
}

export default function InstructorPage() {
  const [sessions, setSessions] = useState<Session[] | null>(null);

  useEffect(() => {
    api<Session[]>('/api/instructor/sessions').then(setSessions).catch(() => setSessions([]));
  }, []);

  return (
    <AppShell nav={instructorNav} title="Дадлагын жагсаалт">
      <div className="space-y-4">
        <Card className="flex items-center justify-between p-5">
          <div>
            <h3 className="font-bold text-slate-900">QR баталгаажуулалт</h3>
            <p className="text-sm text-slate-500">Суралцагчийн QR кодыг уншуулж дадлага баталгаажуулна.</p>
          </div>
          <Link href="/instructor/scan">
            <Button>
              <QrCode className="h-4 w-4" /> QR уншуулах
            </Button>
          </Link>
        </Card>

        {!sessions ? (
          <div className="grid place-items-center py-16">
            <Spinner className="h-8 w-8" />
          </div>
        ) : (
          <Card className="overflow-x-auto">
            <table className="w-full min-w-[680px] text-sm">
              <thead>
                <tr className="border-b border-slate-200 text-left text-xs uppercase tracking-wider text-slate-400">
                  <th className="px-4 py-3">Суралцагч</th>
                  <th className="px-4 py-3">Дадлагын талбай</th>
                  <th className="px-4 py-3">Огноо</th>
                  <th className="px-4 py-3">Элемент</th>
                  <th className="px-4 py-3">Статус</th>
                  <th className="px-4 py-3 text-right">Үйлдэл</th>
                </tr>
              </thead>
              <tbody>
                {sessions.map((s) => (
                  <tr key={s.id} className="border-b border-slate-100 hover:bg-slate-50">
                    <td className="px-4 py-3">
                      <div className="font-medium text-slate-900">{s.student}</div>
                      <div className="text-xs text-slate-400">{s.phone}</div>
                    </td>
                    <td className="px-4 py-3 text-slate-600">
                      <span className="flex items-center gap-1">
                        <MapPin className="h-3.5 w-3.5 text-slate-400" /> {s.school}
                      </span>
                    </td>
                    <td className="px-4 py-3 text-xs text-slate-500">{formatDate(s.scheduledAt)}</td>
                    <td className="px-4 py-3 text-slate-600">
                      {s.passedElements}/{s.totalElements}
                    </td>
                    <td className="px-4 py-3">
                      <Badge color={s.status === 'COMPLETED' ? 'green' : s.status === 'CANCELLED' ? 'red' : 'amber'}>
                        {s.status === 'COMPLETED' ? 'Дууссан' : s.status === 'BOOKED' ? 'Захиалсан' : s.status === 'IN_PROGRESS' ? 'Үргэлжилж буй' : 'Цуцалсан'}
                      </Badge>
                    </td>
                    <td className="px-4 py-3 text-right">
                      {s.status !== 'COMPLETED' && (
                        <Link href={`/instructor/scan?token=${s.qrToken}`}>
                          <Button size="sm" variant="ghost">Баталгаажуулах</Button>
                        </Link>
                      )}
                    </td>
                  </tr>
                ))}
                {sessions.length === 0 && (
                  <tr>
                    <td colSpan={6} className="px-4 py-10 text-center text-slate-400">Дадлага алга байна.</td>
                  </tr>
                )}
              </tbody>
            </table>
          </Card>
        )}
      </div>
    </AppShell>
  );
}
