'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { instructorNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Alert, Input, Label } from '@/components/ui';
import { api } from '@/lib/client';
import { QrCode, CheckCircle2, User, Award } from 'lucide-react';

interface ElementDef {
  code: string;
  titleMn: string;
  criteria: string;
}
interface ScanSession {
  id: string;
  qrToken: string;
  status: string;
  student: { name: string; phone: string; registerNumber: string | null };
  school: { name: string };
  elementDefs: ElementDef[];
  elements: Record<string, boolean>;
}

export default function InstructorScanPage() {
  const router = useRouter();
  const [token, setToken] = useState('');
  const [session, setSession] = useState<ScanSession | null>(null);
  const [checks, setChecks] = useState<Record<string, boolean>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [done, setDone] = useState<{ cert: string | null } | null>(null);

  // URL-аас токен унших (QR линкээс)
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const t = params.get('token');
    if (t) {
      setToken(t);
      loadSession(t);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  async function loadSession(t: string) {
    setError('');
    setLoading(true);
    setSession(null);
    setDone(null);
    try {
      const s = await api<ScanSession>(`/api/practice/qr/${t}`);
      setSession(s);
      setChecks(s.elements ?? {});
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    if (!session) return;
    setLoading(true);
    setError('');
    try {
      const res = await api<{ allPassed: boolean; certificate: { certNumber: string } | null }>(
        '/api/practice/verify',
        { method: 'POST', json: { qrToken: session.qrToken, elements: checks } }
      );
      setDone({ cert: res.certificate?.certNumber ?? null });
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const allChecked = session?.elementDefs.every((e) => checks[e.code]) ?? false;

  return (
    <AppShell nav={instructorNav} title="QR баталгаажуулалт">
      <div className="mx-auto max-w-xl space-y-5">
        {/* Token input */}
        <Card className="p-5">
          <Label>QR токен</Label>
          <p className="mb-2 text-xs text-slate-400">
            Суралцагчийн QR кодыг камераар уншуулахад токен энд автоматаар орно. Эсвэл гараар оруулна уу.
          </p>
          <div className="flex gap-2">
            <Input value={token} onChange={(e) => setToken(e.target.value)} placeholder="QR токен" />
            <Button onClick={() => loadSession(token)} loading={loading} disabled={!token}>
              <QrCode className="h-4 w-4" /> Ачаалах
            </Button>
          </div>
        </Card>

        {error && <Alert variant="error">{error}</Alert>}

        {done ? (
          <Card className="p-8 text-center">
            <CheckCircle2 className="mx-auto h-16 w-16 text-accent-500" />
            <h3 className="mt-3 text-xl font-bold text-slate-900">Баталгаажлаа!</h3>
            {done.cert ? (
              <div className="mt-2">
                <p className="text-sm text-slate-600">Бүх элемент тэнцэж, дижитал гэрчилгээ үүслээ:</p>
                <p className="mt-2 flex items-center justify-center gap-2 font-mono font-bold text-brand-700">
                  <Award className="h-5 w-5" /> {done.cert}
                </p>
              </div>
            ) : (
              <p className="mt-2 text-sm text-slate-600">
                Зарим элемент үлдсэн тул хадгалагдлаа. Бүгдийг тэнцүүлэхэд гэрчилгээ үүснэ.
              </p>
            )}
            <Button className="mt-5" variant="outline" onClick={() => router.push('/instructor')}>
              Жагсаалт руу буцах
            </Button>
          </Card>
        ) : loading && !session ? (
          <div className="grid place-items-center py-12">
            <Spinner className="h-8 w-8" />
          </div>
        ) : session ? (
          <Card className="overflow-hidden">
            {/* Student */}
            <div className="hero-gradient p-5 text-white">
              <div className="flex items-center gap-3">
                <div className="grid h-11 w-11 place-items-center rounded-xl bg-white/15">
                  <User className="h-6 w-6" />
                </div>
                <div>
                  <div className="text-lg font-bold">{session.student.name}</div>
                  <div className="text-sm text-brand-100">
                    {session.student.phone}
                    {session.student.registerNumber && ` · ${session.student.registerNumber}`}
                  </div>
                </div>
                <Badge color="green" className="ml-auto">
                  {session.school.name}
                </Badge>
              </div>
            </div>

            {/* Elements checklist */}
            <div className="p-5">
              <p className="mb-3 text-sm font-semibold text-slate-700">
                Элемент бүрийг шалгаж тэмдэглэнэ үү:
              </p>
              <div className="space-y-2">
                {session.elementDefs.map((e) => (
                  <label
                    key={e.code}
                    className={`flex cursor-pointer items-center gap-3 rounded-xl border p-3 transition ${
                      checks[e.code] ? 'border-accent-300 bg-accent-50' : 'border-slate-200'
                    }`}
                  >
                    <input
                      type="checkbox"
                      checked={!!checks[e.code]}
                      onChange={(ev) => setChecks({ ...checks, [e.code]: ev.target.checked })}
                      className="h-5 w-5 rounded"
                    />
                    <div className="flex-1">
                      <div className="text-sm font-medium text-slate-900">
                        {e.code}: {e.titleMn}
                      </div>
                      <div className="text-xs text-slate-500">{e.criteria}</div>
                    </div>
                  </label>
                ))}
              </div>

              <Alert variant={allChecked ? 'success' : 'info'} className="mt-4">
                {allChecked
                  ? 'Бүх элемент тэнцсэн — баталгаажуулахад дижитал гэрчилгээ автоматаар үүснэ.'
                  : `${session.elementDefs.filter((e) => checks[e.code]).length}/${session.elementDefs.length} элемент тэмдэглэгдсэн.`}
              </Alert>

              <Button className="mt-4 w-full" variant={allChecked ? 'success' : 'primary'} onClick={verify} loading={loading}>
                Баталгаажуулах
              </Button>
            </div>
          </Card>
        ) : null}
      </div>
    </AppShell>
  );
}
