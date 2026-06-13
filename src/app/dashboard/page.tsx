'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import type { JourneyState } from '@/lib/services';
import {
  BookOpen,
  ClipboardCheck,
  MapPin,
  Award,
  ArrowRight,
  CheckCircle2,
  Circle,
  Lock,
} from 'lucide-react';

interface DashData {
  journey: JourneyState;
  user: { name: string; isTestUser: boolean; ageVerified: boolean };
}

export default function DashboardPage() {
  const [data, setData] = useState<DashData | null>(null);

  useEffect(() => {
    api<DashData>('/api/dashboard').then(setData).catch(() => {});
  }, []);

  return (
    <AppShell nav={studentNav} title="Хяналтын самбар">
      {!data ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <DashboardContent data={data} />
      )}
    </AppShell>
  );
}

function DashboardContent({ data }: { data: DashData }) {
  const { journey, user } = data;
  const steps = [
    {
      key: 'enroll',
      label: 'Курст бүртгүүлэх',
      done: journey.enrolled,
      href: '/courses',
      icon: BookOpen,
    },
    {
      key: 'learn',
      label: `Сургалт үзэх (${journey.modulesCompleted}/${journey.modulesTotal})`,
      done: journey.allModulesDone,
      href: '/courses',
      icon: BookOpen,
    },
    {
      key: 'exam',
      label: 'Онлайн шалгалт өгөх',
      done: journey.examPassed,
      href: '/exam',
      icon: ClipboardCheck,
    },
    {
      key: 'practice',
      label: 'Практик дадлага хийх',
      done: journey.practiceDone,
      href: '/practice',
      icon: MapPin,
    },
    {
      key: 'done',
      label: 'Дижитал гэрчилгээ авах',
      done: !!journey.certificate,
      href: '/certificates',
      icon: Award,
    },
  ];

  const completedSteps = steps.filter((s) => s.done).length;
  const progressPct = Math.round((completedSteps / steps.length) * 100);

  return (
    <div className="space-y-6">
      {/* Greeting + progress */}
      <Card className="overflow-hidden">
        <div className="hero-gradient p-6 text-white">
          <p className="text-sm text-brand-100">Сайн байна уу,</p>
          <h2 className="text-2xl font-extrabold">{user.name || 'Суралцагч'} 👋</h2>
          <div className="mt-5">
            <div className="flex items-center justify-between text-sm">
              <span>Сургалтын явц</span>
              <span className="font-semibold">{progressPct}%</span>
            </div>
            <div className="mt-2 h-2.5 overflow-hidden rounded-full bg-white/20">
              <div
                className="h-full rounded-full bg-accent-400 transition-all"
                style={{ width: `${progressPct}%` }}
              />
            </div>
          </div>
        </div>
      </Card>

      {/* Next action */}
      {journey.certificate ? (
        <Card className="border-accent-200 bg-accent-50 p-6">
          <div className="flex items-center gap-4">
            <Award className="h-12 w-12 text-accent-600" />
            <div className="flex-1">
              <h3 className="text-lg font-bold text-slate-900">Баяр хүргэе! 🎉</h3>
              <p className="text-sm text-slate-600">
                Та сургалтаа амжилттай дүүргэж дижитал гэрчилгээ авлаа:{' '}
                <span className="font-mono font-semibold">{journey.certificate.certNumber}</span>
              </p>
            </div>
            <Link href="/certificates">
              <Button variant="success">Үзэх</Button>
            </Link>
          </div>
        </Card>
      ) : (
        <NextStepCard journey={journey} />
      )}

      {/* Journey checklist */}
      <Card className="p-6">
        <h3 className="mb-4 text-lg font-bold text-slate-900">Сургалтын зам</h3>
        <div className="space-y-2">
          {steps.map((step, i) => {
            const locked = i > 0 && !steps[i - 1].done && !step.done;
            return (
              <Link
                key={step.key}
                href={locked ? '#' : step.href}
                className={`flex items-center gap-3 rounded-xl border p-3.5 transition ${
                  step.done
                    ? 'border-accent-200 bg-accent-50'
                    : locked
                      ? 'cursor-not-allowed border-slate-200 bg-slate-50 opacity-60'
                      : 'border-slate-200 bg-white hover:border-brand-300 hover:bg-brand-50'
                }`}
              >
                {step.done ? (
                  <CheckCircle2 className="h-6 w-6 shrink-0 text-accent-600" />
                ) : locked ? (
                  <Lock className="h-5 w-5 shrink-0 text-slate-400" />
                ) : (
                  <Circle className="h-6 w-6 shrink-0 text-slate-300" />
                )}
                <span
                  className={`flex-1 text-sm font-medium ${
                    step.done ? 'text-slate-700' : 'text-slate-900'
                  }`}
                >
                  {step.label}
                </span>
                {step.done ? (
                  <Badge color="green">Дууссан</Badge>
                ) : !locked ? (
                  <ArrowRight className="h-4 w-4 text-slate-400" />
                ) : null}
              </Link>
            );
          })}
        </div>
      </Card>
    </div>
  );
}

function NextStepCard({ journey }: { journey: JourneyState }) {
  const map: Record<string, { title: string; desc: string; href: string; cta: string }> = {
    enroll: {
      title: 'Курст бүртгүүлээрэй',
      desc: 'Сургалтын курсээ сонгож, эхлэлээ тавь.',
      href: '/courses',
      cta: 'Курс үзэх',
    },
    learn: {
      title: 'Сургалтаа үргэлжлүүл',
      desc: 'Дараагийн модулиа үзэж, шалгалтад бэлдээрэй.',
      href: '/courses',
      cta: 'Хичээл үзэх',
    },
    exam: {
      title: 'Онлайн шалгалтад бэлэн',
      desc: 'Бүх модуль дууслаа. Шалгалтаа өгч тэнцээрэй (80%).',
      href: '/exam',
      cta: 'Шалгалт өгөх',
    },
    practice: {
      title: 'Практик дадлага захиал',
      desc: 'Жолооны курст QR баталгаажуулалтаар дадлага хий.',
      href: '/practice',
      cta: 'Дадлага захиалах',
    },
    done: { title: 'Бэлэн', desc: '', href: '/certificates', cta: 'Гэрчилгээ' },
  };
  const s = map[journey.nextStep] ?? map.enroll;

  return (
    <Card className="flex flex-col items-start gap-4 border-brand-200 bg-brand-50/50 p-6 sm:flex-row sm:items-center">
      <div className="flex-1">
        <p className="text-xs font-bold uppercase tracking-wider text-brand-600">Дараагийн алхам</p>
        <h3 className="mt-1 text-lg font-bold text-slate-900">{s.title}</h3>
        <p className="mt-1 text-sm text-slate-600">{s.desc}</p>
      </div>
      <Link href={s.href}>
        <Button>
          {s.cta} <ArrowRight className="h-4 w-4" />
        </Button>
      </Link>
    </Card>
  );
}
