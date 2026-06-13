'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge } from '@/components/ui';
import { PaymentModal } from '@/components/payment-modal';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { BookOpen, Clock, Layers, ArrowRight, CheckCircle2 } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  titleMn: string;
  descriptionMn: string;
  price: number;
  durationHours: number;
  level: string;
  moduleCount: number;
}

export default function CoursesPage() {
  const router = useRouter();
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [enrollments, setEnrollments] = useState<Record<string, string>>({});
  const [pay, setPay] = useState<Course | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  async function load() {
    const [list, dash] = await Promise.all([
      api<Course[]>('/api/courses'),
      api<{ journey: { enrolled: boolean } }>('/api/dashboard').catch(() => null),
    ]);
    setCourses(list);
    // Бүртгэлийн төлвийг курс бүрээр шалгах
    const states: Record<string, string> = {};
    await Promise.all(
      list.map(async (c) => {
        const detail = await api<{ enrollment: { status: string } | null }>(`/api/courses/${c.id}`);
        if (detail.enrollment) states[c.id] = detail.enrollment.status;
      })
    );
    setEnrollments(states);
  }

  useEffect(() => {
    load();
  }, []);

  async function enroll(course: Course) {
    setBusy(course.id);
    try {
      const res = await api<{ needPayment: boolean; enrollment: { status: string } }>(
        `/api/courses/${course.id}/enroll`,
        { method: 'POST', json: {} }
      );
      if (res.needPayment && res.enrollment.status !== 'ACTIVE') {
        setPay(course);
      } else {
        router.push(`/courses/${course.id}/learn`);
      }
    } catch (e: any) {
      alert(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell nav={studentNav} title="Сургалт">
      {!courses ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-5">
          <p className="text-sm text-slate-500">
            Курсээ сонгож, цахилгаан скүүтэр жолоодлогын баталгаажсан мэдлэг эзэмшээрэй.
          </p>
          <div className="grid gap-5 md:grid-cols-2">
            {courses.map((c) => {
              const status = enrollments[c.id];
              const isActive = status === 'ACTIVE' || status === 'COMPLETED';
              return (
                <Card key={c.id} className="flex flex-col overflow-hidden">
                  <div className="hero-gradient relative h-28">
                    <div className="absolute bottom-3 left-4 flex items-center gap-2">
                      <Badge color="green">{c.level}</Badge>
                      {isActive && <Badge color="blue">Бүртгэлтэй</Badge>}
                    </div>
                    <BookOpen className="absolute right-4 top-4 h-8 w-8 text-white/40" />
                  </div>
                  <div className="flex flex-1 flex-col p-5">
                    <h3 className="text-lg font-bold text-slate-900">{c.titleMn}</h3>
                    <p className="mt-1.5 flex-1 text-sm text-slate-600">{c.descriptionMn}</p>
                    <div className="mt-4 flex items-center gap-4 text-xs text-slate-500">
                      <span className="flex items-center gap-1">
                        <Layers className="h-4 w-4" /> {c.moduleCount} модуль
                      </span>
                      <span className="flex items-center gap-1">
                        <Clock className="h-4 w-4" /> {c.durationHours} цаг
                      </span>
                    </div>
                    <div className="mt-4 flex items-center justify-between border-t border-slate-100 pt-4">
                      <span className="text-2xl font-extrabold text-brand-800">
                        {formatMnt(c.price)}
                      </span>
                      {isActive ? (
                        <Button variant="success" onClick={() => router.push(`/courses/${c.id}/learn`)}>
                          Үргэлжлүүлэх <ArrowRight className="h-4 w-4" />
                        </Button>
                      ) : (
                        <Button onClick={() => enroll(c)} loading={busy === c.id}>
                          Элсэх
                        </Button>
                      )}
                    </div>
                  </div>
                </Card>
              );
            })}
          </div>
        </div>
      )}

      {pay && (
        <PaymentModal
          courseId={pay.id}
          courseTitle={pay.titleMn}
          onClose={() => setPay(null)}
          onPaid={() => router.push(`/courses/${pay.id}/learn`)}
        />
      )}
    </AppShell>
  );
}
