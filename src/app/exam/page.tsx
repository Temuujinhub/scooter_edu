'use client';

import { useEffect, useRef, useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Alert, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import {
  ClipboardCheck,
  Clock,
  AlertTriangle,
  CheckCircle2,
  XCircle,
  Trophy,
  RotateCcw,
} from 'lucide-react';

interface Eligibility {
  eligible: boolean;
  reason: string;
  passed?: boolean;
  attemptsUsed: number;
  config: { totalQuestions: number; durationMin: number; passPercent: number; maxAttempts: number };
}
interface ExamQuestion {
  id: string;
  questionMn: string;
  options: { key: string; text: string }[];
}
interface ExamResult {
  passed: boolean;
  score: number;
  total: number;
  percent: number;
  passScore: number;
  review: { questionMn: string; correctKey: string; userKey: string | null; isRight: boolean; explanationMn: string }[];
}

type Phase = 'intro' | 'active' | 'result';

export default function ExamPage() {
  const [phase, setPhase] = useState<Phase>('intro');
  const [elig, setElig] = useState<Eligibility | null>(null);
  const [attemptId, setAttemptId] = useState('');
  const [questions, setQuestions] = useState<ExamQuestion[]>([]);
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [result, setResult] = useState<ExamResult | null>(null);
  const [timeLeft, setTimeLeft] = useState(0);
  const [tabSwitches, setTabSwitches] = useState(0);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const submittedRef = useRef(false);

  useEffect(() => {
    api<Eligibility>('/api/exam/eligibility').then(setElig).catch((e) => setError(e.message));
  }, []);

  const submit = useCallback(
    async (auto = false) => {
      if (submittedRef.current) return;
      submittedRef.current = true;
      setLoading(true);
      try {
        const res = await api<ExamResult>('/api/exam/submit', {
          method: 'POST',
          json: { attemptId, answers, autoSubmit: auto },
        });
        setResult(res);
        setPhase('result');
      } catch (e: any) {
        setError(e.message);
        submittedRef.current = false;
      } finally {
        setLoading(false);
      }
    },
    [attemptId, answers]
  );

  // Таймер
  useEffect(() => {
    if (phase !== 'active') return;
    if (timeLeft <= 0) {
      submit(true);
      return;
    }
    const t = setTimeout(() => setTimeLeft((s) => s - 1), 1000);
    return () => clearTimeout(t);
  }, [phase, timeLeft, submit]);

  // Anti-cheat: tab switch хяналт
  useEffect(() => {
    if (phase !== 'active') return;
    function onHidden() {
      if (document.hidden) {
        setTabSwitches((n) => {
          const next = n + 1;
          if (next >= 2) submit(true);
          return next;
        });
      }
    }
    document.addEventListener('visibilitychange', onHidden);
    return () => document.removeEventListener('visibilitychange', onHidden);
  }, [phase, submit]);

  async function start() {
    setLoading(true);
    setError('');
    submittedRef.current = false;
    try {
      const res = await api<{ attemptId: string; questions: ExamQuestion[]; durationMin: number }>(
        '/api/exam/start',
        { method: 'POST', json: {} }
      );
      setAttemptId(res.attemptId);
      setQuestions(res.questions);
      setTimeLeft(res.durationMin * 60);
      setTabSwitches(0);
      setAnswers({});
      setPhase('active');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <AppShell nav={studentNav} title="Онлайн шалгалт">
      {!elig && !error ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : phase === 'intro' ? (
        <ExamIntro elig={elig} error={error} onStart={start} loading={loading} />
      ) : phase === 'active' ? (
        <ExamActive
          questions={questions}
          answers={answers}
          setAnswers={setAnswers}
          timeLeft={timeLeft}
          tabSwitches={tabSwitches}
          onSubmit={() => submit(false)}
          loading={loading}
        />
      ) : (
        result && <ExamResultView result={result} onRetry={() => { setPhase('intro'); api<Eligibility>('/api/exam/eligibility').then(setElig); }} />
      )}
    </AppShell>
  );
}

function fmt(s: number) {
  const m = Math.floor(s / 60);
  const sec = s % 60;
  return `${m}:${sec.toString().padStart(2, '0')}`;
}

function ExamIntro({ elig, error, onStart, loading }: { elig: Eligibility | null; error: string; onStart: () => void; loading: boolean }) {
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="overflow-hidden">
        <div className="hero-gradient flex items-center gap-4 p-6 text-white">
          <ClipboardCheck className="h-12 w-12" />
          <div>
            <h2 className="text-xl font-extrabold">Онлайн шалгалт</h2>
            <p className="text-sm text-brand-100">Сургалтын мэдлэгээ баталгаажуул</p>
          </div>
        </div>
        <div className="grid grid-cols-2 gap-4 p-6 sm:grid-cols-4">
          {[
            { v: elig?.config.totalQuestions ?? 30, l: 'Асуулт' },
            { v: `${elig?.config.durationMin ?? 30} мин`, l: 'Хугацаа' },
            { v: `${elig?.config.passPercent ?? 80}%`, l: 'Тэнцэх' },
            { v: elig?.config.maxAttempts ?? 3, l: 'Оролдлого' },
          ].map((s) => (
            <div key={s.l} className="text-center">
              <div className="text-2xl font-extrabold text-brand-800">{s.v}</div>
              <div className="text-xs text-slate-500">{s.l}</div>
            </div>
          ))}
        </div>
      </Card>

      <Alert variant="warning">
        <div className="flex items-start gap-2">
          <AlertTriangle className="mt-0.5 h-5 w-5 shrink-0" />
          <div className="text-sm">
            <strong>Anti-cheat:</strong> Шалгалтын үеэр өөр цонх руу 2 удаа шилжвэл шалгалт
            автоматаар дуусна. Таймер дуусахад автоматаар илгээгдэнэ.
          </div>
        </div>
      </Alert>

      {error && <Alert variant="error">{error}</Alert>}

      {elig?.passed ? (
        <Alert variant="success">Та шалгалтад аль хэдийн тэнцсэн байна! Практик дадлага руу үргэлжлүүлээрэй.</Alert>
      ) : elig?.eligible ? (
        <Button size="lg" className="w-full" onClick={onStart} loading={loading}>
          Шалгалт эхлүүлэх
        </Button>
      ) : (
        <Alert variant="info">{elig?.reason}</Alert>
      )}
    </div>
  );
}

function ExamActive({
  questions,
  answers,
  setAnswers,
  timeLeft,
  tabSwitches,
  onSubmit,
  loading,
}: {
  questions: ExamQuestion[];
  answers: Record<string, string>;
  setAnswers: (a: Record<string, string>) => void;
  timeLeft: number;
  tabSwitches: number;
  onSubmit: () => void;
  loading: boolean;
}) {
  const answered = Object.keys(answers).length;
  const danger = timeLeft < 60;
  return (
    <div className="space-y-4">
      {/* Sticky header */}
      <div className="sticky top-16 z-20 flex items-center justify-between rounded-xl border border-slate-200 bg-white/90 p-3 shadow-sm backdrop-blur">
        <Badge color="blue">
          {answered}/{questions.length} хариулсан
        </Badge>
        <div
          className={`flex items-center gap-2 rounded-lg px-3 py-1.5 font-mono text-lg font-bold ${
            danger ? 'bg-red-100 text-red-700' : 'bg-slate-100 text-slate-800'
          }`}
        >
          <Clock className="h-5 w-5" /> {fmt(timeLeft)}
        </div>
      </div>

      {tabSwitches > 0 && (
        <Alert variant="error">
          ⚠️ Анхааруулга {tabSwitches}/2: Цонх сольсон. Дахин сольвол шалгалт дуусна!
        </Alert>
      )}

      {questions.map((q, i) => (
        <Card key={q.id} className="p-5">
          <p className="font-medium text-slate-900">
            <span className="mr-2 text-brand-600">{i + 1}.</span>
            {q.questionMn}
          </p>
          <div className="mt-3 grid gap-2 sm:grid-cols-2">
            {q.options.map((o) => {
              const selected = answers[q.id] === o.key;
              return (
                <button
                  key={o.key}
                  onClick={() => setAnswers({ ...answers, [q.id]: o.key })}
                  className={`rounded-xl border px-3.5 py-2.5 text-left text-sm transition ${
                    selected ? 'border-brand-500 bg-brand-50 font-medium' : 'border-slate-200 hover:border-brand-300'
                  }`}
                >
                  <span className="font-semibold text-brand-700">{o.key}.</span> {o.text}
                </button>
              );
            })}
          </div>
        </Card>
      ))}

      <div className="sticky bottom-4 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
        <Button className="w-full" size="lg" onClick={onSubmit} loading={loading}>
          Шалгалт дуусгах ({answered}/{questions.length})
        </Button>
      </div>
    </div>
  );
}

function ExamResultView({ result, onRetry }: { result: ExamResult; onRetry: () => void }) {
  const router = useRouter();
  return (
    <div className="mx-auto max-w-2xl space-y-5">
      <Card className="overflow-hidden text-center">
        <div className={`p-8 ${result.passed ? 'bg-accent-50' : 'bg-red-50'}`}>
          {result.passed ? (
            <Trophy className="mx-auto h-16 w-16 text-accent-500" />
          ) : (
            <XCircle className="mx-auto h-16 w-16 text-red-400" />
          )}
          <h2 className="mt-3 text-2xl font-extrabold text-slate-900">
            {result.passed ? 'Баяр хүргэе! Тэнцлээ 🎉' : 'Дахин оролдоорой'}
          </h2>
          <p className="mt-1 text-slate-600">
            Оноо: <strong>{result.score}/{result.total}</strong> ({result.percent}%)
          </p>
          <div className="mx-auto mt-4 h-3 max-w-xs overflow-hidden rounded-full bg-white">
            <div
              className={`h-full rounded-full ${result.passed ? 'bg-accent-500' : 'bg-red-400'}`}
              style={{ width: `${result.percent}%` }}
            />
          </div>
          <p className="mt-2 text-xs text-slate-500">Тэнцэх босго: {result.passScore}/{result.total}</p>
        </div>
        <div className="p-5">
          {result.passed ? (
            <Button variant="success" className="w-full" onClick={() => router.push('/practice')}>
              Практик дадлага захиалах
            </Button>
          ) : (
            <Button variant="outline" className="w-full" onClick={onRetry}>
              <RotateCcw className="h-4 w-4" /> Буцах
            </Button>
          )}
        </div>
      </Card>

      {/* Review */}
      <Card className="p-5">
        <h3 className="mb-4 font-bold text-slate-900">Хариултын тойм</h3>
        <div className="space-y-3">
          {result.review.map((r, i) => (
            <div key={i} className="rounded-xl border border-slate-200 p-3">
              <div className="flex items-start gap-2">
                {r.isRight ? (
                  <CheckCircle2 className="mt-0.5 h-5 w-5 shrink-0 text-accent-600" />
                ) : (
                  <XCircle className="mt-0.5 h-5 w-5 shrink-0 text-red-500" />
                )}
                <div className="flex-1">
                  <p className="text-sm font-medium text-slate-900">{r.questionMn}</p>
                  <p className="mt-1 text-xs text-slate-500">
                    Зөв хариулт: <span className="font-semibold text-accent-700">{r.correctKey}</span>
                    {!r.isRight && r.userKey && (
                      <span className="ml-2 text-red-500">Таны хариулт: {r.userKey}</span>
                    )}
                  </p>
                  <p className="mt-1 text-xs text-slate-500">💡 {r.explanationMn}</p>
                </div>
              </div>
            </div>
          ))}
        </div>
      </Card>
    </div>
  );
}
