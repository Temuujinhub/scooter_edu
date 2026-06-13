'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Input, Textarea } from '@/components/ui';
import { Modal, Field, ConfirmDelete } from '@/components/modal';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { Plus, Pencil, Trash2, ChevronDown, ChevronRight, Layers } from 'lucide-react';

interface Course {
  id: string;
  code: string;
  titleMn: string;
  descriptionMn: string;
  price: number;
  durationHours: number;
  level: string;
  isActive: boolean;
  moduleCount: number;
  enrollmentCount: number;
}
interface ModuleRow {
  id: string;
  courseId: string;
  moduleNumber: number;
  titleMn: string;
  summaryMn: string;
  contentHtml: string;
  keyPoints: string[];
  durationMin: number;
  isActive: boolean;
  questionCount: number;
}

export default function AdminCoursesPage() {
  const [courses, setCourses] = useState<Course[] | null>(null);
  const [expanded, setExpanded] = useState<string | null>(null);
  const [editCourse, setEditCourse] = useState<Course | 'new' | null>(null);

  async function load() {
    setCourses(await api<Course[]>('/api/admin/courses'));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell nav={adminNav} title="Курс ба модуль" requireRole="ADMIN">
      {!courses ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Сургалтын курс болон модулиудыг үүсгэх, засах, идэвхжүүлэх.
            </p>
            <Button size="sm" onClick={() => setEditCourse('new')}>
              <Plus className="h-4 w-4" /> Курс нэмэх
            </Button>
          </div>

          {courses.map((c) => (
            <Card key={c.id} className="overflow-hidden">
              <div className="flex items-center gap-3 p-4">
                <button
                  onClick={() => setExpanded(expanded === c.id ? null : c.id)}
                  className="text-slate-400 hover:text-slate-700"
                >
                  {expanded === c.id ? <ChevronDown className="h-5 w-5" /> : <ChevronRight className="h-5 w-5" />}
                </button>
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{c.titleMn}</span>
                    <Badge color={c.isActive ? 'green' : 'slate'}>{c.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</Badge>
                  </div>
                  <div className="mt-0.5 flex flex-wrap gap-3 text-xs text-slate-500">
                    <span className="font-mono">{c.code}</span>
                    <span>{formatMnt(c.price)}</span>
                    <span className="flex items-center gap-1"><Layers className="h-3 w-3" /> {c.moduleCount} модуль</span>
                    <span>{c.enrollmentCount} элсэлт</span>
                  </div>
                </div>
                <Button size="sm" variant="ghost" onClick={() => setEditCourse(c)}>
                  <Pencil className="h-4 w-4" />
                </Button>
              </div>

              {expanded === c.id && <ModuleManager courseId={c.id} onChange={load} />}
            </Card>
          ))}
        </div>
      )}

      {editCourse && (
        <CourseForm
          course={editCourse === 'new' ? null : editCourse}
          onClose={() => setEditCourse(null)}
          onSaved={() => {
            setEditCourse(null);
            load();
          }}
        />
      )}
    </AppShell>
  );
}

function CourseForm({
  course,
  onClose,
  onSaved,
}: {
  course: Course | null;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    code: course?.code ?? '',
    titleMn: course?.titleMn ?? '',
    descriptionMn: course?.descriptionMn ?? '',
    price: course?.price ?? 25000,
    durationHours: course?.durationHours ?? 1.5,
    level: course?.level ?? 'Бүрэн',
    isActive: course?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (course) {
        await api(`/api/admin/courses/${course.id}`, {
          method: 'PATCH',
          json: {
            titleMn: form.titleMn,
            descriptionMn: form.descriptionMn,
            price: Number(form.price),
            durationHours: Number(form.durationHours),
            level: form.level,
            isActive: form.isActive,
          },
        });
      } else {
        await api('/api/admin/courses', {
          method: 'POST',
          json: { ...form, price: Number(form.price), durationHours: Number(form.durationHours) },
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
      title={course ? 'Курс засах' : 'Шинэ курс'}
      description="Курсийн үндсэн мэдээлэл. Үнэ 0 бол үнэгүй курс болно."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Болих</Button>
          <Button onClick={save} loading={saving}>Хадгалах</Button>
        </>
      }
    >
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      {!course && (
        <Field label="Код" hint="Давтагдашгүй танигч (жишээ: SCE-FULL). Дараа өөрчлөгдөхгүй.">
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} placeholder="SCE-FULL" />
        </Field>
      )}
      <Field label="Курсийн нэр" hint="Суралцагчид харагдах гарчиг.">
        <Input value={form.titleMn} onChange={(e) => setForm({ ...form, titleMn: e.target.value })} />
      </Field>
      <Field label="Тайлбар" hint="Курсийн агуулга, давуу талыг товч тайлбарла.">
        <Textarea rows={3} value={form.descriptionMn} onChange={(e) => setForm({ ...form, descriptionMn: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Үнэ (₮)" hint="0 = үнэгүй">
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </Field>
        <Field label="Хугацаа (цаг)" hint="Нийт цаг">
          <Input type="number" step="0.5" value={form.durationHours} onChange={(e) => setForm({ ...form, durationHours: Number(e.target.value) })} />
        </Field>
        <Field label="Түвшин" hint="Анхан/Бүрэн">
          <Input value={form.level} onChange={(e) => setForm({ ...form, level: e.target.value })} />
        </Field>
      </div>
      <label className="flex items-center gap-2 text-sm text-slate-700">
        <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded" />
        Идэвхтэй (суралцагчдад харагдана)
      </label>
    </Modal>
  );
}

function ModuleManager({ courseId, onChange }: { courseId: string; onChange: () => void }) {
  const [modules, setModules] = useState<ModuleRow[] | null>(null);
  const [edit, setEdit] = useState<ModuleRow | 'new' | null>(null);
  const [del, setDel] = useState<ModuleRow | null>(null);
  const [deleting, setDeleting] = useState(false);

  async function load() {
    setModules(await api<ModuleRow[]>(`/api/admin/modules?courseId=${courseId}`));
  }
  useEffect(() => {
    load();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [courseId]);

  async function confirmDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      await api(`/api/admin/modules/${del.id}`, { method: 'DELETE' });
      setDel(null);
      load();
      onChange();
    } finally {
      setDeleting(false);
    }
  }

  return (
    <div className="border-t border-slate-100 bg-slate-50 p-4">
      <div className="mb-3 flex items-center justify-between">
        <span className="text-sm font-semibold text-slate-700">Модулиуд</span>
        <Button size="sm" variant="outline" onClick={() => setEdit('new')}>
          <Plus className="h-4 w-4" /> Модуль нэмэх
        </Button>
      </div>
      {!modules ? (
        <Spinner />
      ) : (
        <div className="space-y-2">
          {modules.map((m) => (
            <div key={m.id} className="flex items-center gap-3 rounded-xl border border-slate-200 bg-white p-3">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-sm font-bold text-brand-700">
                {m.moduleNumber}
              </div>
              <div className="flex-1">
                <div className="text-sm font-medium text-slate-900">{m.titleMn}</div>
                <div className="text-xs text-slate-500">{m.durationMin} мин · {m.questionCount} асуулт</div>
              </div>
              <Badge color={m.isActive ? 'green' : 'slate'}>{m.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</Badge>
              <Button size="sm" variant="ghost" onClick={() => setEdit(m)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button size="sm" variant="ghost" onClick={() => setDel(m)}>
                <Trash2 className="h-4 w-4 text-red-500" />
              </Button>
            </div>
          ))}
          {modules.length === 0 && <p className="text-sm text-slate-400">Модуль алга.</p>}
        </div>
      )}

      {edit && (
        <ModuleForm
          courseId={courseId}
          module={edit === 'new' ? null : edit}
          nextNumber={(modules?.length ?? 0) + 1}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
            onChange();
          }}
        />
      )}
      <ConfirmDelete
        open={!!del}
        onClose={() => setDel(null)}
        onConfirm={confirmDelete}
        itemName={del?.titleMn ?? ''}
        loading={deleting}
      />
    </div>
  );
}

function ModuleForm({
  courseId,
  module,
  nextNumber,
  onClose,
  onSaved,
}: {
  courseId: string;
  module: ModuleRow | null;
  nextNumber: number;
  onClose: () => void;
  onSaved: () => void;
}) {
  const [form, setForm] = useState({
    moduleNumber: module?.moduleNumber ?? nextNumber,
    titleMn: module?.titleMn ?? '',
    summaryMn: module?.summaryMn ?? '',
    contentHtml: module?.contentHtml ?? '',
    keyPoints: (module?.keyPoints ?? []).join('\n'),
    durationMin: module?.durationMin ?? 20,
    isActive: module?.isActive ?? true,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    try {
      const keyPoints = form.keyPoints.split('\n').map((s) => s.trim()).filter(Boolean);
      if (module) {
        await api(`/api/admin/modules/${module.id}`, {
          method: 'PATCH',
          json: {
            titleMn: form.titleMn,
            summaryMn: form.summaryMn,
            contentHtml: form.contentHtml,
            keyPoints,
            durationMin: Number(form.durationMin),
            isActive: form.isActive,
          },
        });
      } else {
        await api('/api/admin/modules', {
          method: 'POST',
          json: {
            courseId,
            moduleNumber: Number(form.moduleNumber),
            titleMn: form.titleMn,
            summaryMn: form.summaryMn,
            contentHtml: form.contentHtml,
            keyPoints,
            durationMin: Number(form.durationMin),
          },
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
      title={module ? 'Модуль засах' : 'Шинэ модуль'}
      description="Хичээлийн агуулга, гол санаа, үргэлжлэх хугацаа."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Болих</Button>
          <Button onClick={save} loading={saving}>Хадгалах</Button>
        </>
      }
    >
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-[100px_1fr] gap-3">
        <Field label="Дугаар" hint="Дараалал">
          <Input type="number" value={form.moduleNumber} onChange={(e) => setForm({ ...form, moduleNumber: Number(e.target.value) })} />
        </Field>
        <Field label="Модулийн нэр" hint="Хичээлийн гарчиг">
          <Input value={form.titleMn} onChange={(e) => setForm({ ...form, titleMn: e.target.value })} />
        </Field>
      </div>
      <Field label="Богино тайлбар" hint="Модулийн товч агуулга (нэг өгүүлбэр).">
        <Input value={form.summaryMn} onChange={(e) => setForm({ ...form, summaryMn: e.target.value })} />
      </Field>
      <Field label="Гол санаанууд" hint="Мөр тус бүр нэг санаа. (Суралцагчид жагсаалтаар харагдана.)">
        <Textarea rows={4} value={form.keyPoints} onChange={(e) => setForm({ ...form, keyPoints: e.target.value })} placeholder={'Санаа 1\nСанаа 2'} />
      </Field>
      <Field label="Агуулга (HTML)" hint="Хичээлийн үндсэн текст. <h3>, <p>, <ul>, <table> зэрэг HTML дэмжинэ.">
        <Textarea rows={8} className="font-mono text-xs" value={form.contentHtml} onChange={(e) => setForm({ ...form, contentHtml: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 items-end gap-3">
        <Field label="Үргэлжлэх хугацаа (мин)" hint="Ойролцоо хугацаа">
          <Input type="number" value={form.durationMin} onChange={(e) => setForm({ ...form, durationMin: Number(e.target.value) })} />
        </Field>
        <label className="mb-4 flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded" />
          Идэвхтэй
        </label>
      </div>
    </Modal>
  );
}
