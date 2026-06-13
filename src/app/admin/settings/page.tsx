'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Input, Textarea, Alert } from '@/components/ui';
import { api } from '@/lib/client';
import { Layout, Phone, Award } from 'lucide-react';

interface SettingDef {
  key: string;
  label: string;
  hint: string;
  group: string;
  multiline?: boolean;
}

const GROUPS = [
  { id: 'hero', label: 'Нүүр хуудас (Hero)', icon: Layout, desc: 'Эхний дэлгэцийн гарчиг, тайлбар, статистик.' },
  { id: 'contact', label: 'Холбоо барих (Footer)', icon: Phone, desc: 'Footer дахь и-мэйл, утас, хаяг, тайлбар.' },
  { id: 'certificate', label: 'Гэрчилгээ', icon: Award, desc: 'Гэрчилгээн дээрх байгууллага, хүчинтэй хугацаа.' },
];

export default function AdminSettingsPage() {
  const [defs, setDefs] = useState<SettingDef[] | null>(null);
  const [values, setValues] = useState<Record<string, string>>({});
  const [saving, setSaving] = useState(false);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const res = await api<{ defs: SettingDef[]; values: Record<string, string> }>('/api/admin/settings');
    setDefs(res.defs);
    setValues(res.values);
  }
  useEffect(() => {
    load();
  }, []);

  async function save() {
    setSaving(true);
    setSaved(false);
    setError('');
    try {
      await api('/api/admin/settings', { method: 'PATCH', json: { values } });
      setSaved(true);
      setTimeout(() => setSaved(false), 2500);
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSaving(false);
    }
  }

  return (
    <AppShell nav={adminNav} title="Сайтын тохиргоо" requireRole="ADMIN">
      {!defs ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          <p className="text-sm text-slate-500">
            Нүүр хуудасны hero, footer холбоо барих болон гэрчилгээний мэдээллийг энд засна.
            Хадгалсны дараа сайт дээр шууд тусгагдана.
          </p>

          {error && <Alert variant="error">{error}</Alert>}

          {GROUPS.map((g) => (
            <Card key={g.id} className="p-6">
              <div className="mb-4 flex items-center gap-2">
                <g.icon className="h-5 w-5 text-brand-700" />
                <div>
                  <h3 className="font-bold text-slate-900">{g.label}</h3>
                  <p className="text-xs text-slate-400">{g.desc}</p>
                </div>
              </div>
              <div className="grid gap-4 sm:grid-cols-2">
                {defs
                  .filter((d) => d.group === g.id)
                  .map((d) => (
                    <div key={d.key} className={d.multiline ? 'sm:col-span-2' : ''}>
                      <label className="mb-1 block text-sm font-semibold text-slate-700">{d.label}</label>
                      {d.hint && <p className="mb-1 text-xs text-slate-400">{d.hint}</p>}
                      {d.multiline ? (
                        <Textarea
                          rows={3}
                          value={values[d.key] ?? ''}
                          onChange={(e) => setValues({ ...values, [d.key]: e.target.value })}
                        />
                      ) : (
                        <Input
                          value={values[d.key] ?? ''}
                          onChange={(e) => setValues({ ...values, [d.key]: e.target.value })}
                        />
                      )}
                    </div>
                  ))}
              </div>
            </Card>
          ))}

          <div className="sticky bottom-4 flex items-center justify-end gap-3 rounded-xl border border-slate-200 bg-white p-3 shadow-lg">
            {saved && <span className="text-sm font-medium text-accent-600">✓ Хадгалагдлаа</span>}
            <Button onClick={save} loading={saving}>
              Хадгалах
            </Button>
          </div>
        </div>
      )}
    </AppShell>
  );
}
