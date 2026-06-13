'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Input, Textarea } from '@/components/ui';
import { Modal, Field } from '@/components/modal';
import { api } from '@/lib/client';
import { formatMnt } from '@/lib/utils';
import { Pencil, CheckCircle2, MapPin, CreditCard } from 'lucide-react';

interface Pkg {
  id: string;
  code: string;
  name: string;
  price: number;
  priceLabel: string;
  tier: string;
  includesPractice: boolean;
  practiceSessions: number;
  includesCard: boolean;
  enrollable: boolean;
  badge: string;
  description: string;
  features: string[];
  isActive: boolean;
  enrollments: number;
}

export default function AdminPackagesPage() {
  const [packages, setPackages] = useState<Pkg[] | null>(null);
  const [edit, setEdit] = useState<Pkg | null>(null);

  async function load() {
    setPackages(await api<Pkg[]>('/api/admin/packages'));
  }
  useEffect(() => {
    load();
  }, []);

  return (
    <AppShell nav={adminNav} title="Үнийн багцууд" requireRole="ADMIN">
      {!packages ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <p className="text-sm text-slate-500">
            Багцуудын үнэ, агуулга, давуу талыг засварлах. Logic: дадлага агуулсан багц
            практик дадлагын дараа, бусад нь шалгалтын дараа гэрчилгээ олгоно.
          </p>

          <div className="grid gap-4 md:grid-cols-2">
            {packages.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-slate-900">{p.name}</span>
                    <Badge color="slate">{p.code}</Badge>
                    {p.badge && <Badge color={p.badge === 'Шинэ' ? 'blue' : 'green'}>{p.badge}</Badge>}
                    {!p.isActive && <Badge color="red">Идэвхгүй</Badge>}
                  </div>
                  <Button size="sm" variant="ghost" onClick={() => setEdit(p)}>
                    <Pencil className="h-4 w-4" />
                  </Button>
                </div>

                <div className="mt-1 text-2xl font-extrabold text-brand-800">
                  {p.price > 0 ? formatMnt(p.price) : p.priceLabel || 'Холбоо барих'}
                  {p.priceLabel && p.price > 0 && <span className="ml-1 text-sm font-normal text-slate-400">{p.priceLabel}</span>}
                </div>
                <p className="mt-1 text-sm text-slate-600">{p.description}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  {p.enrollable ? (
                    <span className="rounded-full bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">Худалдаалагдана</span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 font-semibold text-slate-600">Холбоо барих</span>
                  )}
                  {p.includesPractice ? (
                    <span className="flex items-center gap-1 rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">
                      <MapPin className="h-3 w-3" /> {p.practiceSessions} дадлага
                    </span>
                  ) : (
                    <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">Онлайн гэрчилгээ</span>
                  )}
                  {p.includesCard && (
                    <span className="flex items-center gap-1 rounded-full bg-amber-50 px-2 py-0.5 font-semibold text-amber-700">
                      <CreditCard className="h-3 w-3" /> Биет карт
                    </span>
                  )}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.enrollments} бүртгэл</span>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {edit && (
        <PackageForm
          pkg={edit}
          onClose={() => setEdit(null)}
          onSaved={() => {
            setEdit(null);
            load();
          }}
        />
      )}
    </AppShell>
  );
}

function PackageForm({ pkg, onClose, onSaved }: { pkg: Pkg; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: pkg.name,
    price: pkg.price,
    priceLabel: pkg.priceLabel,
    description: pkg.description,
    features: pkg.features.join('\n'),
    badge: pkg.badge,
    includesPractice: pkg.includesPractice,
    practiceSessions: pkg.practiceSessions,
    includesCard: pkg.includesCard,
    enrollable: pkg.enrollable,
    isActive: pkg.isActive,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    try {
      await api(`/api/admin/packages/${pkg.id}`, {
        method: 'PATCH',
        json: {
          name: form.name,
          price: Number(form.price),
          priceLabel: form.priceLabel,
          description: form.description,
          features: form.features.split('\n').map((s) => s.trim()).filter(Boolean),
          badge: form.badge,
          includesPractice: form.includesPractice,
          practiceSessions: Number(form.practiceSessions),
          includesCard: form.includesCard,
          enrollable: form.enrollable,
          isActive: form.isActive,
        },
      });
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
      title={`${pkg.name} (${pkg.code})`}
      description="Багцын үнэ, агуулга ба logic тохиргоо."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Болих</Button>
          <Button onClick={save} loading={saving}>Хадгалах</Button>
        </>
      }
    >
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Нэр" hint="Багцын нэр">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Тэмдэг" hint="Шинэ / Эрэлттэй / хоосон">
          <Input value={form.badge} onChange={(e) => setForm({ ...form, badge: e.target.value })} />
        </Field>
      </div>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Үнэ (₮)" hint="0 = Холбоо барих">
          <Input type="number" value={form.price} onChange={(e) => setForm({ ...form, price: Number(e.target.value) })} />
        </Field>
        <Field label="Үнийн тайлбар" hint="'25,000₮/хүн' г.м">
          <Input value={form.priceLabel} onChange={(e) => setForm({ ...form, priceLabel: e.target.value })} />
        </Field>
      </div>
      <Field label="Тайлбар" hint="Багцын товч танилцуулга">
        <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <Field label="Давуу талууд" hint="Мөр тус бүр нэг боломж">
        <Textarea rows={4} value={form.features} onChange={(e) => setForm({ ...form, features: e.target.value })} />
      </Field>
      <div className="grid grid-cols-2 gap-3">
        <Field label="Дадлагын тоо" hint="0 = онлайн гэрчилгээ">
          <Input type="number" value={form.practiceSessions} onChange={(e) => setForm({ ...form, practiceSessions: Number(e.target.value) })} />
        </Field>
        <div className="space-y-2 pt-7">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.includesPractice} onChange={(e) => setForm({ ...form, includesPractice: e.target.checked })} className="h-4 w-4 rounded" />
            Практик дадлага агуулна
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.includesCard} onChange={(e) => setForm({ ...form, includesCard: e.target.checked })} className="h-4 w-4 rounded" />
            Биет карт
          </label>
        </div>
      </div>
      <div className="flex gap-5">
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.enrollable} onChange={(e) => setForm({ ...form, enrollable: e.target.checked })} className="h-4 w-4 rounded" />
          Шууд худалдаалагдана (эс бөгөөс "Холбоо барих")
        </label>
        <label className="flex items-center gap-2 text-sm text-slate-700">
          <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded" />
          Идэвхтэй
        </label>
      </div>
    </Modal>
  );
}
