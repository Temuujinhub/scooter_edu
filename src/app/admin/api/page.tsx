'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { adminNav } from '@/components/nav-config';
import { Card, Spinner, Badge } from '@/components/ui';
import { api } from '@/lib/client';
import { ShieldCheck, Gift, Link2, KeyRound, Copy, Check } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  code: string;
  apiKey: string;
}

const BASE = typeof window !== 'undefined' ? window.location.origin : '';

const ENDPOINTS = [
  {
    icon: ShieldCheck,
    title: 'Сертификат шалгах API',
    method: 'POST',
    path: '/api/partner/verify-cert',
    desc: 'Хэрэглэгчийн дижитал гэрчилгээ хүчинтэй эсэхийг шалгана. Түрээсийн апп хэрэглэгчээ оруулахын өмнө сургалт төгссөн эсэхийг баталгаажуулна.',
    request: `{
  "cert_number": "SCE-2026-000001"
}`,
    response: `{
  "valid": true,
  "reason": "active",
  "cert_number": "SCE-2026-000001",
  "owner_name": "Б.Батбаяр",
  "issued_at": "2026-06-13",
  "expires_at": "2028-06-13",
  "status": "active"
}`,
  },
  {
    icon: Gift,
    title: 'Урамшуулал олгох API',
    method: 'POST',
    path: '/api/partner/reward/grant',
    desc: 'Хэрэглэгчид урамшууллын оноо бэлэглэнэ. cert_number эсвэл user_phone-оор хэрэглэгчийг тодорхойлно. points заагаагүй бол хамтрагчийн анхдагч оноог өгнө.',
    request: `{
  "cert_number": "SCE-2026-000001",
  "points": 1000,
  "action": "training_completed"
}`,
    response: `{
  "granted": true,
  "points": 1000,
  "partner": "JET"
}`,
  },
  {
    icon: Link2,
    title: 'Хэрэглэгч холболтын API',
    method: 'POST',
    path: '/api/partner/connect-user',
    desc: 'Түрээсийн аппын хэрэглэгчийг ScooterEdu бүртгэлд холбоно. Хэрэглэгч сертификаттай бол урамшууллыг шууд бэлэглэнэ. external_user_id-аар тухайн апп дахь ID-г холбоно.',
    request: `{
  "user_phone": "99091911",
  "external_user_id": "jet_8841"
}`,
    response: `{
  "connected": true,
  "has_certificate": true,
  "reward_points": 1000
}`,
  },
  {
    icon: KeyRound,
    title: 'Статистик API',
    method: 'GET',
    path: '/api/partner/stats',
    desc: 'Хамтрагчийн холбосон хэрэглэгч, бэлэглэсэн нийт урамшууллын статистик.',
    request: '— (body шаардлагагүй)',
    response: `{
  "partner": "Jet Sharing Mongolia",
  "linked_users": 124,
  "total_points": 124000
}`,
  },
];

export default function AdminApiPage() {
  const [partners, setPartners] = useState<Partner[] | null>(null);
  const [copied, setCopied] = useState('');

  useEffect(() => {
    api<Partner[]>('/api/admin/partners').then(setPartners).catch(() => setPartners([]));
  }, []);

  function copy(text: string, id: string) {
    navigator.clipboard?.writeText(text);
    setCopied(id);
    setTimeout(() => setCopied(''), 1500);
  }

  return (
    <AppShell nav={adminNav} title="API холболт" requireRole="ADMIN">
      <div className="space-y-6">
        <Card className="p-5">
          <h3 className="font-bold text-slate-900">Хамтрагчийн API танилцуулга</h3>
          <p className="mt-1 text-sm text-slate-600">
            Скүүтэр түрээсийн болон бусад апп ScooterEdu-тэй холбогдож сертификат шалгах,
            урамшуулал олгох, хэрэглэгч холбох боломжтой. Бүх хүсэлт <strong>X-API-Key</strong> толгойтой
            байна. API key-г <strong>Хамтрагчид</strong> хэсгээс авна.
          </p>
          <div className="mt-3 rounded-lg bg-slate-900 p-3 font-mono text-xs text-accent-300">
            Base URL: {BASE || 'https://your-domain'}
            <br />
            Headers: {'{'} "X-API-Key": "&lt;partner_api_key&gt;", "Content-Type": "application/json" {'}'}
          </div>
        </Card>

        {/* Endpoints */}
        {ENDPOINTS.map((e) => (
          <Card key={e.path} className="overflow-hidden">
            <div className="flex items-center gap-3 border-b border-slate-100 p-5">
              <div className="grid h-10 w-10 place-items-center rounded-lg bg-brand-50 text-brand-700">
                <e.icon className="h-5 w-5" />
              </div>
              <div className="flex-1">
                <h3 className="font-bold text-slate-900">{e.title}</h3>
                <div className="mt-0.5 flex items-center gap-2">
                  <Badge color={e.method === 'GET' ? 'green' : 'blue'}>{e.method}</Badge>
                  <code className="font-mono text-xs text-slate-600">{e.path}</code>
                </div>
              </div>
            </div>
            <div className="p-5">
              <p className="text-sm text-slate-600">{e.desc}</p>
              <div className="mt-3 grid gap-3 md:grid-cols-2">
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Хүсэлт (body)</div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-slate-200">{e.request}</pre>
                </div>
                <div>
                  <div className="mb-1 text-xs font-bold uppercase tracking-wider text-slate-400">Хариу</div>
                  <pre className="overflow-x-auto rounded-lg bg-slate-900 p-3 text-xs text-accent-200">{e.response}</pre>
                </div>
              </div>
            </div>
          </Card>
        ))}

        {/* API keys */}
        <Card className="p-5">
          <h3 className="mb-3 font-bold text-slate-900">Хамтрагчийн API түлхүүрүүд</h3>
          {!partners ? (
            <Spinner />
          ) : (
            <div className="space-y-2">
              {partners.map((p) => (
                <div key={p.id} className="flex items-center gap-3 rounded-lg border border-slate-200 p-2.5">
                  <div className="w-40 shrink-0">
                    <div className="text-sm font-medium text-slate-900">{p.name}</div>
                    <div className="text-xs text-slate-400">{p.code}</div>
                  </div>
                  <code className="flex-1 truncate rounded bg-slate-900 px-2 py-1 font-mono text-xs text-accent-300">
                    {p.apiKey}
                  </code>
                  <button onClick={() => copy(p.apiKey, p.id)} className="text-slate-400 hover:text-slate-700">
                    {copied === p.id ? <Check className="h-4 w-4 text-accent-500" /> : <Copy className="h-4 w-4" />}
                  </button>
                </div>
              ))}
            </div>
          )}
        </Card>
      </div>
    </AppShell>
  );
}
