'use client';

import { useEffect, useState } from 'react';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Alert } from '@/components/ui';
import { ScooterIcon } from '@/components/brand-logo';
import { api, useUser } from '@/lib/client';
import { Gift, Link2, Check, Sparkles } from 'lucide-react';

interface Partner {
  id: string;
  name: string;
  appName: string;
  rewardPoints: number;
  discountPercent: number;
  logoColor: string;
  scooterCount: string;
  description: string;
}
interface RentalLink {
  partnerId: string;
  partnerName: string;
  appName: string;
  logoColor: string;
  status: string;
  rewardGranted: boolean;
  points: number;
}

export default function ProfilePage() {
  const { user } = useUser();
  const [partners, setPartners] = useState<Partner[]>([]);
  const [links, setLinks] = useState<RentalLink[]>([]);
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);
  const [message, setMessage] = useState('');

  async function load() {
    const [p, l] = await Promise.all([
      api<Partner[]>('/api/partners'),
      api<RentalLink[]>('/api/rental/links'),
    ]);
    setPartners(p);
    setLinks(l);
    setLoading(false);
  }

  useEffect(() => {
    load();
  }, []);

  const linkedMap = Object.fromEntries(links.map((l) => [l.partnerId, l]));
  const totalPoints = links.reduce((s, l) => s + l.points, 0);

  async function toggleLink(partner: Partner) {
    setBusy(partner.id);
    setMessage('');
    try {
      const existing = linkedMap[partner.id];
      if (existing && existing.status === 'LINKED') {
        await api('/api/rental/link', { method: 'DELETE', json: { partnerId: partner.id } });
      } else {
        const res = await api<{ message: string }>('/api/rental/link', {
          method: 'POST',
          json: { partnerId: partner.id },
        });
        setMessage(res.message);
      }
      await load();
    } catch (e: any) {
      setMessage(e.message);
    } finally {
      setBusy(null);
    }
  }

  return (
    <AppShell nav={studentNav} title="Профайл ба урамшуулал">
      {loading ? (
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      ) : (
        <div className="space-y-6">
          {/* Profile + points */}
          <div className="grid gap-4 sm:grid-cols-2">
            <Card className="p-5">
              <p className="text-xs font-bold uppercase tracking-wider text-slate-400">Хувийн мэдээлэл</p>
              <h2 className="mt-1 text-xl font-extrabold text-slate-900">
                {user?.firstName} {user?.lastName}
              </h2>
              <p className="text-sm text-slate-500">{user?.phone}</p>
              {user?.registerNumber && (
                <p className="text-sm text-slate-500">Регистр: {user.registerNumber}</p>
              )}
              <div className="mt-3 flex flex-wrap gap-2">
                {user?.ageVerified && <Badge color="green">18+ баталгаажсан</Badge>}
                {user?.xypVerified && <Badge color="blue">Хур шалгасан</Badge>}
                {user?.isTestUser && <Badge color="amber">Тест хэрэглэгч</Badge>}
              </div>
            </Card>

            <Card className="flex flex-col justify-center bg-gradient-to-br from-accent-500 to-accent-700 p-5 text-white">
              <div className="flex items-center gap-2 text-sm text-accent-50">
                <Sparkles className="h-4 w-4" /> Нийт урамшууллын оноо
              </div>
              <div className="mt-1 text-4xl font-extrabold">{totalPoints.toLocaleString('mn-MN')}</div>
              <p className="text-xs text-accent-50/80">
                {links.filter((l) => l.status === 'LINKED').length} апптай холбогдсон
              </p>
            </Card>
          </div>

          {message && <Alert variant="success">{message}</Alert>}

          {/* Rental apps */}
          <Card className="p-5">
            <div className="mb-1 flex items-center gap-2">
              <Gift className="h-5 w-5 text-accent-600" />
              <h3 className="font-bold text-slate-900">Түрээсийн аппууд холбох</h3>
            </div>
            <p className="mb-4 text-sm text-slate-500">
              Түрээсийн аппаа холбоход сертификатаа авмагц урамшууллын оноо тухайн апп дотор
              автоматаар бэлэглэгдэнэ.
            </p>

            <div className="grid gap-3 sm:grid-cols-2">
              {partners.map((p) => {
                const link = linkedMap[p.id];
                const isLinked = link?.status === 'LINKED';
                return (
                  <div
                    key={p.id}
                    className={`rounded-xl border p-4 transition ${
                      isLinked ? 'border-accent-300 bg-accent-50/50' : 'border-slate-200'
                    }`}
                  >
                    <div className="flex items-center gap-3">
                      <div
                        className="grid h-10 w-10 shrink-0 place-items-center rounded-lg text-white"
                        style={{ backgroundColor: p.logoColor }}
                      >
                        <ScooterIcon className="h-5 w-5" />
                      </div>
                      <div className="min-w-0 flex-1">
                        <div className="truncate font-semibold text-slate-900">{p.name}</div>
                        <div className="text-xs text-slate-500">{p.appName}</div>
                      </div>
                    </div>
                    <div className="mt-3 flex items-center justify-between">
                      <div className="flex flex-wrap gap-1.5">
                        <span className="rounded-full bg-accent-100 px-2 py-0.5 text-xs font-semibold text-accent-700">
                          +{p.rewardPoints} оноо
                        </span>
                        {isLinked && link.points > 0 && (
                          <span className="rounded-full bg-brand-100 px-2 py-0.5 text-xs font-semibold text-brand-700">
                            {link.points} авсан
                          </span>
                        )}
                      </div>
                      <Button
                        size="sm"
                        variant={isLinked ? 'outline' : 'success'}
                        onClick={() => toggleLink(p)}
                        loading={busy === p.id}
                      >
                        {isLinked ? (
                          <>
                            <Check className="h-4 w-4" /> Холбогдсон
                          </>
                        ) : (
                          <>
                            <Link2 className="h-4 w-4" /> Холбох
                          </>
                        )}
                      </Button>
                    </div>
                  </div>
                );
              })}
            </div>
          </Card>
        </div>
      )}
    </AppShell>
  );
}
