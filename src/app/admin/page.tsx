'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Spinner } from '@/components/ui';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import {
  Users,
  GraduationCap,
  BadgeCheck,
  Award,
  CreditCard,
  Building2,
  MapPin,
  Gift,
  TrendingUp,
  ArrowRight,
} from 'lucide-react';

interface Stats {
  cards: {
    totalUsers: number;
    students: number;
    activeEnrollments: number;
    examsPassed: number;
    passRate: number;
    certificates: number;
    paidPayments: number;
    revenue: number;
    partners: number;
    practiceCompleted: number;
    rentalLinks: number;
  };
  signupTrend: { date: string; count: number }[];
}

export default function AdminDashboard() {
  const [stats, setStats] = useState<Stats | null>(null);

  useEffect(() => {
    api<Stats>('/api/admin/stats').then(setStats).catch(() => {});
  }, []);

  return (
    <AppShell nav={adminNav} title="Админ хяналтын самбар" requireRole="ADMIN">
      {!stats ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Revenue highlight */}
          <Card className="overflow-hidden">
            <div className="hero-gradient flex flex-wrap items-center justify-between gap-4 p-6 text-white">
              <div>
                <p className="text-sm text-brand-100">Нийт орлого (төлөгдсөн)</p>
                <p className="text-4xl font-extrabold">{formatMnt(stats.cards.revenue)}</p>
                <p className="text-sm text-brand-100">{stats.cards.paidPayments} төлбөр</p>
              </div>
              <TrendingUp className="h-16 w-16 text-white/30" />
            </div>
          </Card>

          {/* Stat cards */}
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
            <StatCard icon={Users} label="Нийт хэрэглэгч" value={stats.cards.totalUsers} sub={`${stats.cards.students} суралцагч`} color="bg-brand-50 text-brand-700" />
            <StatCard icon={GraduationCap} label="Идэвхтэй элсэлт" value={stats.cards.activeEnrollments} sub="курст бүртгэлтэй" color="bg-violet-50 text-violet-700" />
            <StatCard icon={BadgeCheck} label="Шалгалт тэнцсэн" value={stats.cards.examsPassed} sub={`${stats.cards.passRate}% тэнцэлт`} color="bg-accent-50 text-accent-700" />
            <StatCard icon={Award} label="Олгосон гэрчилгээ" value={stats.cards.certificates} sub="дижитал" color="bg-amber-50 text-amber-700" />
            <StatCard icon={MapPin} label="Дадлага дууссан" value={stats.cards.practiceCompleted} sub="баталгаажсан" color="bg-sky-50 text-sky-700" />
            <StatCard icon={Building2} label="Хамтрагч компани" value={stats.cards.partners} sub="идэвхтэй" color="bg-indigo-50 text-indigo-700" />
            <StatCard icon={Gift} label="Апп холболт" value={stats.cards.rentalLinks} sub="түрээсийн апп" color="bg-pink-50 text-pink-700" />
            <StatCard icon={CreditCard} label="Төлбөр" value={stats.cards.paidPayments} sub="амжилттай" color="bg-emerald-50 text-emerald-700" />
          </div>

          {/* Signup trend */}
          <Card className="p-6">
            <h3 className="mb-4 font-bold text-slate-900">Сүүлийн 7 хоногийн бүртгэл</h3>
            <SignupChart data={stats.signupTrend} />
          </Card>

          {/* Quick links */}
          <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
            {[
              { href: '/admin/courses', label: 'Курс ба модуль', icon: GraduationCap },
              { href: '/admin/questions', label: 'Асуултын сан', icon: BadgeCheck },
              { href: '/admin/partners', label: 'Хамтрагчид', icon: Building2 },
              { href: '/admin/reports', label: 'Тайлан', icon: TrendingUp },
            ].map((l) => (
              <Link
                key={l.href}
                href={l.href}
                className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-4 transition hover:border-brand-300 hover:bg-brand-50"
              >
                <l.icon className="h-5 w-5 text-brand-700" />
                <span className="flex-1 text-sm font-semibold text-slate-800">{l.label}</span>
                <ArrowRight className="h-4 w-4 text-slate-400" />
              </Link>
            ))}
          </div>
        </div>
      )}
    </AppShell>
  );
}

function StatCard({
  icon: Icon,
  label,
  value,
  sub,
  color,
}: {
  icon: any;
  label: string;
  value: number;
  sub: string;
  color: string;
}) {
  return (
    <Card className="p-5">
      <div className={`grid h-10 w-10 place-items-center rounded-lg ${color}`}>
        <Icon className="h-5 w-5" />
      </div>
      <div className="mt-3 text-3xl font-extrabold text-slate-900">{value}</div>
      <div className="text-sm font-medium text-slate-700">{label}</div>
      <div className="text-xs text-slate-400">{sub}</div>
    </Card>
  );
}

function SignupChart({ data }: { data: { date: string; count: number }[] }) {
  const max = Math.max(1, ...data.map((d) => d.count));
  return (
    <div className="flex items-end justify-between gap-2" style={{ height: 160 }}>
      {data.map((d) => (
        <div key={d.date} className="flex flex-1 flex-col items-center gap-2">
          <div className="flex w-full flex-1 items-end">
            <div
              className="w-full rounded-t-lg bg-gradient-to-t from-brand-600 to-brand-400 transition-all"
              style={{ height: `${(d.count / max) * 100}%`, minHeight: d.count > 0 ? 8 : 2 }}
              title={`${d.count}`}
            />
          </div>
          <span className="text-[10px] text-slate-400">{d.date}</span>
          <span className="text-xs font-semibold text-slate-700">{d.count}</span>
        </div>
      ))}
    </div>
  );
}
