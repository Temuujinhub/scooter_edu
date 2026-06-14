'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Input, Textarea } from '@/components/ui';
import { Modal, Field, ConfirmDelete } from '@/components/modal';
import { api } from '@/lib/client';
import { Plus, Pencil, Trash2, CheckCircle2 } from 'lucide-react';

interface Option {
  key: string;
  text: string;
  isCorrect: boolean;
}
interface Question {
  id: string;
  moduleId: string;
  moduleCode: string;
  moduleTitle: string;
  questionMn: string;
  options: Option[];
  explanationMn: string;
  difficulty: string;
  isActive: boolean;
}
interface ModuleOpt {
  id: string;
  titleMn: string;
  moduleNumber: number;
}

const MODULE_CODES = ['M1', 'M2', 'M3', 'M4', 'M5', 'M6'];

export default function AdminQuestionsPage() {
  const [questions, setQuestions] = useState<Question[] | null>(null);
  const [modules, setModules] = useState<ModuleOpt[]>([]);
  const [filter, setFilter] = useState('');
  const [edit, setEdit] = useState<Question | 'new' | null>(null);
  const [del, setDel] = useState<Question | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    const [qs, mods] = await Promise.all([
      api<Question[]>('/api/admin/questions'),
      api<{ id: string; titleMn: string; moduleNumber: number }[]>('/api/admin/modules'),
    ]);
    setQuestions(qs);
    setModules(mods);
  }
  useEffect(() => {
    load();
  }, []);

  const filtered = filter ? questions?.filter((q) => q.moduleCode === filter) : questions;

  async function confirmDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      await api(`/api/admin/questions/${del.id}`, { method: 'DELETE' });
      setDel(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <AppShell nav={adminNav} title="Асуултын сан" requireRole="ADMIN">
      {!questions ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <p className="text-sm text-slate-500">
              Нийт {questions.length} асуулт. Шалгалтад модуль тус бүрээс санамсаргүй сонгогдоно.
            </p>
            <Button size="sm" onClick={() => setEdit('new')}>
              <Plus className="h-4 w-4" /> Асуулт нэмэх
            </Button>
          </div>

          {/* Filter */}
          <div className="flex flex-wrap gap-2">
            <button
              onClick={() => setFilter('')}
              className={`rounded-lg px-3 py-1.5 text-sm font-medium ${!filter ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-600'}`}
            >
              Бүгд ({questions.length})
            </button>
            {MODULE_CODES.map((mc) => {
              const count = questions.filter((q) => q.moduleCode === mc).length;
              return (
                <button
                  key={mc}
                  onClick={() => setFilter(mc)}
                  className={`rounded-lg px-3 py-1.5 text-sm font-medium ${filter === mc ? 'bg-brand-800 text-white' : 'bg-slate-100 text-slate-600'}`}
                >
                  {mc} ({count})
                </button>
              );
            })}
          </div>

          <div className="space-y-3">
            {filtered?.map((q) => (
              <Card key={q.id} className="p-4">
                <div className="flex items-start gap-3">
                  <Badge color="blue">{q.moduleCode}</Badge>
                  <div className="flex-1">
                    <p className="font-medium text-slate-900">{q.questionMn}</p>
                    <div className="mt-2 grid gap-1 sm:grid-cols-2">
                      {q.options.map((o) => (
                        <div
                          key={o.key}
                          className={`flex items-center gap-1.5 text-sm ${o.isCorrect ? 'font-semibold text-accent-700' : 'text-slate-500'}`}
                        >
                          {o.isCorrect ? <CheckCircle2 className="h-4 w-4" /> : <span className="w-4" />}
                          {o.key}. {o.text}
                        </div>
                      ))}
                    </div>
                    {q.explanationMn && (
                      <p className="mt-2 text-xs text-slate-400">💡 {q.explanationMn}</p>
                    )}
                  </div>
                  <div className="flex flex-col gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEdit(q)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDel(q)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {edit && (
        <QuestionForm
          question={edit === 'new' ? null : edit}
          modules={modules}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      )}
      <ConfirmDelete
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={confirmDelete}
        itemName={del?.questionMn?.slice(0, 40) ?? ''}
        loading={deleting}
      />
    </AppShell>
  );
}

function QuestionForm({
  question,
  modules,
  onClose,
  onSaved,
}: {
  question: Question | null;
  modules: ModuleOpt[];
  onClose: () => void;
  onSaved: () => void;
}) {
  const [moduleId, setModuleId] = useState(question?.moduleId ?? modules[0]?.id ?? '');
  const [questionMn, setQuestionMn] = useState(question?.questionMn ?? '');
  const [explanationMn, setExplanationMn] = useState(question?.explanationMn ?? '');
  const [difficulty, setDifficulty] = useState(question?.difficulty ?? 'easy');
  const [options, setOptions] = useState<Option[]>(
    question?.options ?? [
      { key: 'A', text: '', isCorrect: true },
      { key: 'B', text: '', isCorrect: false },
      { key: 'C', text: '', isCorrect: false },
      { key: 'D', text: '', isCorrect: false },
    ]
  );
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  function setCorrect(key: string) {
    setOptions(options.map((o) => ({ ...o, isCorrect: o.key === key })));
  }
  function setText(key: string, text: string) {
    setOptions(options.map((o) => (o.key === key ? { ...o, text } : o)));
  }

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (question) {
        await api(`/api/admin/questions/${question.id}`, {
          method: 'PATCH',
          json: { questionMn, options, explanationMn, difficulty },
        });
      } else {
        await api('/api/admin/questions', {
          method: 'POST',
          json: { moduleId, questionMn, options, explanationMn, difficulty },
        });
      }
      onSaved();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <Modal
      open
      onClose={onClose}
      size="lg"
      title={question ? 'Асуулт засах' : 'Шинэ асуулт'}
      description="Зөв хариултыг радио товчоор сонгоно уу."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Болих</Button>
          <Button onClick={save} loading={saving}>Хадгалах</Button>
        </>
      }
    >
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!question && (
        <Field label="Модуль" hint="Асуулт аль модульд хамаарах вэ (шалгалтын хуваарилалт).">
          <select
            value={moduleId}
            onChange={(e) => setModuleId(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
          >
            {modules.map((m) => (
              <option key={m.id} value={m.id}>
                M{m.moduleNumber}: {m.titleMn}
              </option>
            ))}
          </select>
        </Field>
      )}
      <Field label="Асуулт" hint="Тодорхой, ойлгомжтой асуулт бичнэ үү.">
        <Textarea rows={2} value={questionMn} onChange={(e) => setQuestionMn(e.target.value)} />
      </Field>
      <Field label="Хариултын хувилбарууд" hint="Зөв хариултыг зүүн талын товчоор тэмдэглэнэ.">
        <div className="space-y-2">
          {options.map((o) => (
            <div
              key={o.key}
              className={`flex items-center gap-2 rounded-xl border p-2 ${o.isCorrect ? 'border-accent-300 bg-accent-50' : 'border-slate-200'}`}
            >
              <input
                type="radio"
                name="correct"
                checked={o.isCorrect}
                onChange={() => setCorrect(o.key)}
                className="h-4 w-4"
              />
              <span className="w-5 font-semibold text-slate-500">{o.key}.</span>
              <Input
                className="h-9 flex-1 border-0 bg-transparent focus:ring-0"
                value={o.text}
                onChange={(e) => setText(o.key, e.target.value)}
                placeholder={`Хувилбар ${o.key}`}
              />
            </div>
          ))}
        </div>
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Тайлбар" hint="Зөв хариултын учрыг тайлбарла.">
          <Input value={explanationMn} onChange={(e) => setExplanationMn(e.target.value)} />
        </Field>
        <Field label="Хүндрэл" hint="easy / medium / hard">
          <select
            value={difficulty}
            onChange={(e) => setDifficulty(e.target.value)}
            className="h-11 w-full rounded-xl border border-slate-300 px-3 text-sm"
          >
            <option value="easy">Хялбар</option>
            <option value="medium">Дунд</option>
            <option value="hard">Хүнд</option>
          </select>
        </Field>
      </div>
    </Modal>
  );
}
