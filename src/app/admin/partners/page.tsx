'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Input, Textarea } from '@/components/ui';
import { Modal, Field, ConfirmDelete } from '@/components/modal';
import { ScooterIcon } from '@/components/brand-logo';
import { api } from '@/lib/client';
import { Plus, Pencil, Trash2, Copy, RefreshCw, Check } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  code: string;
  appName: string;
  apiKey: string;
  rewardPoints: number;
  discountPercent: number;
  logoColor: string;
  scooterCount: string;
  description: string;
  isActive: boolean;
  linkedUsers: number;
  rewardsGranted: number;
}

export default function AdminPartnersPage() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [edit, setEdit] = useState<Partner | 'new' | null>(null);
  const [del, setDel] = useState<Partner | null>(null);
  const [deleting, setDeleting] = useState(false);
  const [copied, setCopied] = useState('');

  async function load() {
    setPartners(await api<Partner[]>('/api/admin/partners'));
  }
  useEffect(() => {
    load();
  }, []);

  async function confirmDelete() {
    if (!del) return;
    setDeleting(true);
    try {
      await api(`/api/admin/partners/${del.id}`, { method: 'DELETE' });
      setDel(null);
      load();
    } finally {
      setDeleting(false);
    }
  }

  function copy(key: string) {
    navigator.clipboard?.writeText(key);
    setCopied(key);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <AppShell nav={adminNav} title="Хамтрагч компаниуд" requireRole="ADMIN">
      {!partners ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <p className="text-sm text-slate-500">
              Түрээсийн апп компаниуд. Тус бүр API key-тэй (сертификат шалгах, урамшуулал өгөх).
            </p>
            <Button size="sm" onClick={() => setEdit('new')}>
              <Plus className="h-4 w-4" /> Хамтрагч нэмэх
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            {partners.map((p) => (
              <Card key={p.id} className="p-5">
                <div className="flex items-start gap-3">
                  <div
                    className="grid h-11 w-11 shrink-0 place-items-center rounded-xl text-white"
                    style={{ backgroundColor: p.logoColor }}
                  >
                    <ScooterIcon className="h-5 w-5" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center gap-2">
                      <span className="font-bold text-slate-900">{p.name}</span>
                      <Badge color={p.isActive ? 'green' : 'slate'}>{p.isActive ? 'Идэвхтэй' : 'Идэвхгүй'}</Badge>
                    </div>
                    <div className="text-xs text-slate-500">{p.appName} · {p.code}</div>
                  </div>
                  <div className="flex gap-1">
                    <Button size="sm" variant="ghost" onClick={() => setEdit(p)}>
                      <Pencil className="h-4 w-4" />
                    </Button>
                    <Button size="sm" variant="ghost" onClick={() => setDel(p)}>
                      <Trash2 className="h-4 w-4 text-red-500" />
                    </Button>
                  </div>
                </div>

                <p className="mt-2 text-sm text-slate-600">{p.description}</p>

                <div className="mt-3 flex flex-wrap gap-2 text-xs">
                  <span className="rounded-full bg-accent-50 px-2 py-0.5 font-semibold text-accent-700">+{p.rewardPoints} оноо</span>
                  {p.discountPercent > 0 && <span className="rounded-full bg-brand-50 px-2 py-0.5 font-semibold text-brand-700">{p.discountPercent}% хөнгөлөлт</span>}
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.linkedUsers} холболт</span>
                  <span className="rounded-full bg-slate-100 px-2 py-0.5 text-slate-600">{p.rewardsGranted} урамшуулал</span>
                </div>

                {/* API key */}
                <div className="mt-3 flex items-center gap-2 rounded-lg bg-slate-900 p-2">
                  <code className="flex-1 truncate font-mono text-xs text-accent-300">{p.apiKey}</code>
                  <button onClick={() => copy(p.apiKey)} className="text-slate-400 hover:text-white">
                    {copied === p.apiKey ? <Check className="h-4 w-4 text-accent-400" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              </Card>
            ))}
          </div>
        </div>
      )}

      {edit && (
        <PartnerForm
          partner={edit === 'new' ? null : edit}
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
        itemName={del?.name ?? ''}
        loading={deleting}
      />
    </AppShell>
  );
}

function PartnerForm({ partner, onClose, onSaved }: { partner: Partner | null; onClose: () => void; onSaved: () => void }) {
  const [form, setForm] = useState({
    name: partner?.name ?? '',
    code: partner?.code ?? '',
    appName: partner?.appName ?? '',
    rewardPoints: partner?.rewardPoints ?? 500,
    discountPercent: partner?.discountPercent ?? 0,
    logoColor: partner?.logoColor ?? '#1B448A',
    scooterCount: partner?.scooterCount ?? '',
    description: partner?.description ?? '',
    isActive: partner?.isActive ?? true,
    regenerateApiKey: false,
  });
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState('');

  async function save() {
    setSaving(true);
    setError('');
    try {
      if (partner) {
        await api(`/api/admin/partners/${partner.id}`, {
          method: 'PATCH',
          json: {
            name: form.name,
            appName: form.appName,
            rewardPoints: Number(form.rewardPoints),
            discountPercent: Number(form.discountPercent),
            logoColor: form.logoColor,
            scooterCount: form.scooterCount,
            description: form.description,
            isActive: form.isActive,
            regenerateApiKey: form.regenerateApiKey,
          },
        });
      } else {
        await api('/api/admin/partners', {
          method: 'POST',
          json: {
            name: form.name,
            code: form.code,
            appName: form.appName,
            rewardPoints: Number(form.rewardPoints),
            discountPercent: Number(form.discountPercent),
            logoColor: form.logoColor,
            scooterCount: form.scooterCount,
            description: form.description,
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
      title={partner ? 'Хамтрагч засах' : 'Шинэ хамтрагч'}
      description="Түрээсийн апп компанийн мэдээлэл. API key автоматаар үүснэ."
      footer={
        <>
          <Button variant="outline" onClick={onClose}>Болих</Button>
          <Button onClick={save} loading={saving}>Хадгалах</Button>
        </>
      }
    >
      {error && <div className="mb-3 rounded-lg bg-red-50 px-3 py-2 text-sm text-red-700">{error}</div>}
      <div className="grid grid-cols-2 gap-3">
        <Field label="Компанийн нэр" hint="Албан ёсны нэр">
          <Input value={form.name} onChange={(e) => setForm({ ...form, name: e.target.value })} />
        </Field>
        <Field label="Апп нэр" hint="Гар утасны аппын нэр">
          <Input value={form.appName} onChange={(e) => setForm({ ...form, appName: e.target.value })} />
        </Field>
      </div>
      {!partner && (
        <Field label="Код" hint="Давтагдашгүй (жишээ: JET). Том үсгээр.">
          <Input value={form.code} onChange={(e) => setForm({ ...form, code: e.target.value.toUpperCase() })} />
        </Field>
      )}
      <Field label="Тайлбар" hint="Компани болон урамшууллын тухай.">
        <Textarea rows={2} value={form.description} onChange={(e) => setForm({ ...form, description: e.target.value })} />
      </Field>
      <div className="grid grid-cols-3 gap-3">
        <Field label="Урамшуулал (оноо)" hint="Сертификатад өгөх оноо">
          <Input type="number" value={form.rewardPoints} onChange={(e) => setForm({ ...form, rewardPoints: Number(e.target.value) })} />
        </Field>
        <Field label="Хөнгөлөлт (%)" hint="0–100">
          <Input type="number" value={form.discountPercent} onChange={(e) => setForm({ ...form, discountPercent: Number(e.target.value) })} />
        </Field>
        <Field label="Лого өнгө" hint="HEX код">
          <Input type="color" className="h-11 p-1" value={form.logoColor} onChange={(e) => setForm({ ...form, logoColor: e.target.value })} />
        </Field>
      </div>
      <Field label="Скүүтэрийн тоо" hint="Жишээ: ~6,000 скүүтэр">
        <Input value={form.scooterCount} onChange={(e) => setForm({ ...form, scooterCount: e.target.value })} />
      </Field>
      {partner && (
        <div className="space-y-2">
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.isActive} onChange={(e) => setForm({ ...form, isActive: e.target.checked })} className="h-4 w-4 rounded" />
            Идэвхтэй
          </label>
          <label className="flex items-center gap-2 text-sm text-slate-700">
            <input type="checkbox" checked={form.regenerateApiKey} onChange={(e) => setForm({ ...form, regenerateApiKey: e.target.checked })} className="h-4 w-4 rounded" />
            <RefreshCw className="h-4 w-4" /> API key шинэчлэх (хуучин key ажиллахгүй болно)
          </label>
        </div>
      )}
    </Modal>
  );
}
