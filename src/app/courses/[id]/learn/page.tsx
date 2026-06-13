'use client';

import { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Alert } from '@/components/ui';
import { api } from '@/lib/client';
import { CheckCircle2, Circle, PlayCircle, Lightbulb, ListChecks, ArrowRight } from 'lucide-react';

interface ModuleLite {
  id: string;
  moduleNumber: number;
  titleMn: string;
  summaryMn: string;
  durationMin: number;
  status: string;
}
interface CourseDetail {
  id: string;
  titleMn: string;
  modules: ModuleLite[];
}
interface ModuleFull {
  id: string;
  moduleNumber: number;
  titleMn: string;
  contentHtml: string;
  keyPoints: string[];
  durationMin: number;
  status: string;
  quiz: { id: string; questionMn: string; options: { key: string; text: string; isCorrect: boolean }[]; explanationMn: string }[];
}

export default function LearnPage() {
  const params = useParams();
  const courseId = params.id as string;
  const [course, setCourse] = useState<CourseDetail | null>(null);
  const [activeId, setActiveId] = useState<string | null>(null);

  async function loadCourse() {
    const c = await api<CourseDetail>(`/api/courses/${courseId}`);
    setCourse(c);
    if (!activeId && c.modules.length) {
      const firstIncomplete = c.modules.find((m) => m.status !== 'COMPLETED');
      setActiveId(firstIncomplete?.id ?? c.modules[0].id);
    }
  }

  useEffect(() => {
    loadCourse();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  return (
    <AppShell nav={studentNav} title={course?.titleMn ?? 'Сургалт'}>
      {!course ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="grid gap-6 lg:grid-cols-[260px_1fr]">
          {/* Module list */}
          <Card className="h-fit p-3">
            <div className="px-2 py-2 text-xs font-bold uppercase tracking-wider text-slate-400">
              Модулиуд
            </div>
            <div className="space-y-1">
              {course.modules.map((m) => {
                const active = m.id === activeId;
                return (
                  <button
                    key={m.id}
                    onClick={() => setActiveId(m.id)}
                    className={`flex w-full items-center gap-2.5 rounded-xl px-3 py-2.5 text-left text-sm transition ${
                      active ? 'bg-brand-800 text-white' : 'hover:bg-slate-100'
                    }`}
                  >
                    {m.status === 'COMPLETED' ? (
                      <CheckCircle2 className={`h-5 w-5 shrink-0 ${active ? 'text-accent-300' : 'text-accent-600'}`} />
                    ) : (
                      <Circle className={`h-5 w-5 shrink-0 ${active ? 'text-white/60' : 'text-slate-300'}`} />
                    )}
                    <span className="flex-1 font-medium">
                      {m.moduleNumber}. {m.titleMn}
                    </span>
                  </button>
                );
              })}
            </div>
          </Card>

          {/* Module content */}
          {activeId && (
            <ModuleView
              key={activeId}
              moduleId={activeId}
              modules={course.modules}
              onComplete={async () => {
                await loadCourse();
                // дараагийн модуль руу шилжих
                const idx = course.modules.findIndex((m) => m.id === activeId);
                const next = course.modules[idx + 1];
                if (next) setActiveId(next.id);
              }}
            />
          )}
        </div>
      )}
    </AppShell>
  );
}

function ModuleView({
  moduleId,
  modules,
  onComplete,
}: {
  moduleId: string;
  modules: ModuleLite[];
  onComplete: () => void;
}) {
  const router = useRouter();
  const [mod, setMod] = useState<ModuleFull | null>(null);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [showResults, setShowResults] = useState(false);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    setMod(null);
    setAnswers({});
    setShowResults(false);
    api<ModuleFull>(`/api/modules/${moduleId}`).then(setMod).catch(() => {});
  }, [moduleId]);

  if (!mod) {
    return (
      <Card className="grid min-h-[300px] place-items-center">
        <Spinner className="h-8 w-8" />
      </Card>
    );
  }

  const allModulesDone = modules.every((m) => m.status === 'COMPLETED');
  const quizScore = mod.quiz.filter(
    (q) => answers[q.id] === q.options.find((o) => o.isCorrect)?.key
  ).length;

  async function markComplete() {
    setSaving(true);
    try {
      const score = mod && mod.quiz.length ? Math.round((quizScore / mod.quiz.length) * 100) : 100;
      await api(`/api/modules/${moduleId}/progress`, {
        method: 'POST',
        json: { status: 'COMPLETED', quizScore: score, watchSeconds: (mod?.durationMin ?? 0) * 60 },
      });
      onComplete();
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="space-y-5">
      {/* Video poster */}
      <Card className="overflow-hidden">
        <div className="hero-gradient relative grid h-44 place-items-center">
          <PlayCircle className="h-16 w-16 text-white/80" />
          <div className="absolute bottom-3 left-4 text-white">
            <Badge color="green">Модуль {mod.moduleNumber}</Badge>
            <span className="ml-2 text-xs text-brand-100">{mod.durationMin} минут</span>
          </div>
        </div>
        <div className="p-5">
          <h2 className="text-xl font-extrabold text-slate-900">{mod.titleMn}</h2>

          {/* Key points */}
          {mod.keyPoints.length > 0 && (
            <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50/60 p-4">
              <div className="mb-2 flex items-center gap-2 text-sm font-bold text-brand-800">
                <Lightbulb className="h-4 w-4" /> Гол санаанууд
              </div>
              <ul className="space-y-1.5">
                {mod.keyPoints.map((kp, i) => (
                  <li key={i} className="flex items-start gap-2 text-sm text-slate-700">
                    <CheckCircle2 className="mt-0.5 h-4 w-4 shrink-0 text-accent-600" /> {kp}
                  </li>
                ))}
              </ul>
            </div>
          )}

          {/* Lesson content */}
          <div
            className="prose-mn mt-5"
            dangerouslySetInnerHTML={{ __html: mod.contentHtml }}
          />
        </div>
      </Card>

      {/* Mini quiz */}
      {mod.quiz.length > 0 && (
        <Card className="p-5">
          <div className="mb-4 flex items-center gap-2 text-sm font-bold text-slate-900">
            <ListChecks className="h-5 w-5 text-brand-700" /> Өөрийгөө шалга ({mod.quiz.length} асуулт)
          </div>
          <div className="space-y-5">
            {mod.quiz.map((q, i) => {
              const correctKey = q.options.find((o) => o.isCorrect)?.key;
              return (
                <div key={q.id}>
                  <p className="text-sm font-medium text-slate-900">
                    {i + 1}. {q.questionMn}
                  </p>
                  <div className="mt-2 grid gap-2 sm:grid-cols-2">
                    {q.options.map((o) => {
                      const selected = answers[q.id] === o.key;
                      const isCorrect = o.key === correctKey;
                      let cls = 'border-slate-200 hover:border-brand-300';
                      if (showResults) {
                        if (isCorrect) cls = 'border-accent-400 bg-accent-50';
                        else if (selected) cls = 'border-red-300 bg-red-50';
                      } else if (selected) {
                        cls = 'border-brand-500 bg-brand-50';
                      }
                      return (
                        <button
                          key={o.key}
                          disabled={showResults}
                          onClick={() => setAnswers({ ...answers, [q.id]: o.key })}
                          className={`rounded-xl border px-3 py-2 text-left text-sm transition ${cls}`}
                        >
                          <span className="font-semibold">{o.key}.</span> {o.text}
                        </button>
                      );
                    })}
                  </div>
                  {showResults && (
                    <p className="mt-1.5 text-xs text-slate-500">💡 {q.explanationMn}</p>
                  )}
                </div>
              );
            })}
          </div>
          {!showResults && (
            <Button
              variant="outline"
              className="mt-4"
              onClick={() => setShowResults(true)}
              disabled={Object.keys(answers).length < mod.quiz.length}
            >
              Хариу шалгах
            </Button>
          )}
          {showResults && (
            <Alert variant={quizScore === mod.quiz.length ? 'success' : 'warning'} className="mt-4">
              Та {mod.quiz.length} асуултаас {quizScore}-д зөв хариуллаа.
            </Alert>
          )}
        </Card>
      )}

      {/* Complete button */}
      <div className="flex items-center justify-between rounded-2xl border border-slate-200 bg-white p-4">
        {mod.status === 'COMPLETED' ? (
          <span className="flex items-center gap-2 text-sm font-semibold text-accent-700">
            <CheckCircle2 className="h-5 w-5" /> Энэ модулийг дуусгасан
          </span>
        ) : (
          <span className="text-sm text-slate-500">Агуулгыг үзсэний дараа дуусгасан гэж тэмдэглэнэ үү.</span>
        )}
        {allModulesDone ? (
          <Button variant="success" onClick={() => router.push('/exam')}>
            Шалгалт руу <ArrowRight className="h-4 w-4" />
          </Button>
        ) : (
          <Button onClick={markComplete} loading={saving} disabled={mod.status === 'COMPLETED'}>
            {mod.status === 'COMPLETED' ? 'Дууссан' : 'Дуусгасан'}
          </Button>
        )}
      </div>
    </div>
  );
}
