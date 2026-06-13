'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Spinner } from '@/components/ui';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { TrendingUp, BookOpen, Building2, ClipboardCheck } from 'lucide-react';

interface Report {
  revenueByMonth: { month: string; amount: number }[];
  totalRevenue: number;
  courseEnrollments: { title: string; code: string; enrollments: number }[];
  partnerStats: { name: string; code: string; linkedUsers: number; rewardsGranted: number }[];
  exam: { total: number; passed: number; failed: number };
}

export default function AdminReportsPage() {
  const [report, setReport] = useState<Report | null>(null);

  useEffect(() => {
    api<Report>('/api/admin/reports').then(setReport).catch(() => {});
  }, []);

  return (
    <AppShell nav={adminNav} title="Тайлан" requireRole="ADMIN">
      {!report ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-brand-700" />
              <h3 className="font-bold text-slate-900">Орлого (сараар)</h3>
              <span className="ml-auto text-sm font-semibold text-accent-700">
                Нийт: {formatMnt(report.totalRevenue)}
              </span>
            </div>
            {report.revenueByMonth.length === 0 ? (
              <p className="py-8 text-center text-sm text-slate-400">Орлогын мэдээлэл алга.</p>
            ) : (
              <RevenueChart data={report.revenueByMonth} />
            )}
          </Card>

          {/* Exam stats */}
          <Card className="p-6">
            <div className="mb-4 flex items-center gap-2">
              <ClipboardCheck className="h-5 w-5 text-brand-700" />
              <h3 className="font-bold text-slate-900">Шалгалтын статистик</h3>
            </div>
            <div className="grid grid-cols-3 gap-4">
              <StatBox label="Нийт оролдлого" value={report.exam.total} color="text-slate-900" />
              <StatBox label="Тэнцсэн" value={report.exam.passed} color="text-accent-600" />
              <StatBox label="Тэнцээгүй" value={report.exam.failed} color="text-red-500" />
            </div>
            {report.exam.total > 0 && (
              <div className="mt-4">
                <div className="mb-1 flex justify-between text-xs text-slate-500">
                  <span>Тэнцэлтийн хувь</span>
                  <span>{Math.round((report.exam.passed / report.exam.total) * 100)}%</span>
                </div>
                <div className="h-2.5 overflow-hidden rounded-full bg-slate-100">
                  <div
                    className="h-full rounded-full bg-accent-500"
                    style={{ width: `${(report.exam.passed / report.exam.total) * 100}%` }}
                  />
                </div>
              </div>
            )}
          </Card>

          <div className="grid gap-6 md:grid-cols-2">
            {/* Course enrollments */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <BookOpen className="h-5 w-5 text-brand-700" />
                <h3 className="font-bold text-slate-900">Курсээр элсэлт</h3>
              </div>
              <div className="space-y-3">
                {report.courseEnrollments.map((c) => (
                  <div key={c.code} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{c.title}</span>
                    <span className="rounded-full bg-brand-50 px-2.5 py-0.5 text-sm font-semibold text-brand-700">
                      {c.enrollments}
                    </span>
                  </div>
                ))}
              </div>
            </Card>

            {/* Partner stats */}
            <Card className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <Building2 className="h-5 w-5 text-brand-700" />
                <h3 className="font-bold text-slate-900">Хамтрагчийн оноо</h3>
              </div>
              <div className="space-y-3">
                {report.partnerStats.map((p) => (
                  <div key={p.code} className="flex items-center justify-between">
                    <span className="text-sm text-slate-700">{p.name}</span>
                    <div className="flex gap-1.5">
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs text-slate-600">
                        {p.linkedUsers} холболт
                      </span>
                      <span className="rounded-full bg-accent-50 px-2 py-0.5 text-xs font-semibold text-accent-700">
                        {p.rewardsGranted} урамшуулал
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            </Card>
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatBox({ label, value, color }: { label: string; value: number; color: string }) {
  return (
    <div className="rounded-xl bg-slate-50 p-4 text-center">
      <div className={`text-3xl font-extrabold ${color}`}>{value}</div>
      <div className="text-xs text-slate-500">{label}</div>
    </div>
  );
}

function RevenueChart({ data }: { data: { month: string; amount: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.amount));
  return (
    <div className="flex items-end gap-3" style={{ height: 180 }}>
      {data.map((d) => (
        <div key={d.month} className="flex flex-1 flex-col items-center gap-2">
          <span className="text-xs font-semibold text-slate-700">{formatMnt(d.amount)}</span>
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-accent-600 to-accent-400"
              style={{ height: `${(d.amount / max) * 100}%`, minHeight: 8 }}
            />
          </div>
          <span className="text-[10px] text-slate-400">{d.month}</span>
        </div>
      ))}
    </div>
  );
}
