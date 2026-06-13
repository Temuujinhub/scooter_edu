'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { AppShell } from '@/components/app-shell';
import { studentNav } from '@/components/nav-config';
import { Card, Button, Spinner, Badge, Alert, Input, Label } from '@/components/ui';
import { QrCode } from '@/components/qr-code';
import { api } from '@/lib/client';
import { formatDate } from '@/lib/utils';
import { MapPin, Phone, CheckCircle2, Circle, QrCode as QrIcon, Zap, Lock, ScanLine, UserCheck, ShieldCheck, CalendarCheck } from 'lucide-react';

interface School {
  id: string;
  name: string;
  address: string;
  district: string;
  phone: string;
}
interface ElementDef {
  code: string;
  titleMn: string;
  criteria: string;
}
interface Session {
  id: string;
  qrToken: string;
  status: string;
  scheduledAt: string;
  verifiedAt: string | null;
  elements: Record<string, boolean>;
  school: { name: string; address: string };
}

export default function PracticePage() {
  const [schools, setSchools] = useState<School[]>([]);
  const [elementDefs, setElementDefs] = useState<ElementDef[]>([]);
  const [sessions, setSessions] = useState<Session[]>([]);
  const [canBook, setCanBook] = useState<boolean | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function load() {
    const [practiceRes, schoolsRes, dash] = await Promise.all([
      api<{ elements: ElementDef[]; sessions: Session[] }>('/api/practice'),
      api<School[]>('/api/practice/schools'),
      api<{ journey: { examPassed: boolean } }>('/api/dashboard'),
    ]);
    setElementDefs(practiceRes.elements);
    setSessions(practiceRes.sessions);
    setSchools(schoolsRes);
    setCanBook(dash.journey.examPassed);
  }

  useEffect(() => {
    load().catch((e) => setError(e.message));
  }, []);

  const activeSession = sessions.find((s) => s.status === 'BOOKED' || s.status === 'IN_PROGRESS');

  if (canBook === null && !error) {
    return (
      <AppShell nav={studentNav} title="Практик дадлага">
        <div className="grid place-items-center py-20">
          <Spinner className="h-8 w-8" />
        </div>
      </AppShell>
    );
  }

  return (
    <AppShell nav={studentNav} title="Практик дадлага">
      <div className="space-y-6">
        {error && <Alert variant="error">{error}</Alert>}

        <PracticeExplainer />

        {!canBook ? (
          <Alert variant="info">
            <div className="flex items-center gap-2">
              <Lock className="h-5 w-5" />
              Практик дадлага захиалахын тулд эхлээд онлайн шалгалтад тэнцсэн байх шаардлагатай.
            </div>
          </Alert>
        ) : activeSession ? (
          <ActiveSession
            session={activeSession}
            elementDefs={elementDefs}
            onUpdate={load}
          />
        ) : (
          <BookSession schools={schools} onBooked={load} />
        )}

        {/* History */}
        {sessions.length > 0 && (
          <Card className="p-5">
            <h3 className="mb-3 font-bold text-slate-900">Миний дадлагууд</h3>
            <div className="space-y-2">
              {sessions.map((s) => (
                <div
                  key={s.id}
                  className="flex items-center justify-between rounded-xl border border-slate-200 p-3"
                >
                  <div>
                    <div className="text-sm font-medium text-slate-900">{s.school.name}</div>
                    <div className="text-xs text-slate-500">{formatDate(s.scheduledAt)}</div>
                  </div>
                  <Badge color={s.status === 'COMPLETED' ? 'green' : s.status === 'CANCELLED' ? 'red' : 'amber'}>
                    {s.status === 'COMPLETED' ? 'Баталгаажсан' : s.status === 'BOOKED' ? 'Захиалсан' : s.status === 'IN_PROGRESS' ? 'Үргэлжилж буй' : 'Цуцалсан'}
                  </Badge>
                </div>
              ))}
            </div>
          </Card>
        )}
      </div>
    </AppShell>
  );
}

// Практик баталгаажуулалтын логикийг тайлбарлах хэсэг
function PracticeExplainer() {
  const steps = [
    { icon: CalendarCheck, title: 'Дадлага захиалах', desc: 'Гэрээт жолооны курс сонгож, очих өдрөө товлоно. Систем нэг удаагийн QR токен үүсгэнэ.' },
    { icon: QrIcon, title: 'QR код авах', desc: 'Таны утсан дээр QR код гарна. Үүнийг дадлагын талбайд очиж багшид үзүүлнэ.' },
    { icon: ScanLine, title: 'Багш QR скан хийх', desc: 'Тухайн жолооны курст ажилладаг бүртгэлтэй багш (INSTRUCTOR эрх) мобайлаараа QR-ийг уншуулж, таны мэдээллийг нээнэ.' },
    { icon: UserCheck, title: 'Элемент бүрийг баталгаажуулах', desc: 'Багш A–G элемент (эхлэх/зогсох, эргэлт, саад давах г.м) тус бүрийг бодит дадлага дээр шалгаж тэмдэглэнэ.' },
    { icon: ShieldCheck, title: 'Гэрчилгээ автоматаар', desc: 'Бүх элемент тэнцэхэд session дуусаж, дижитал гэрчилгээ автоматаар үүснэ. Нэг удаагийн токен, серверийн цаг бүртгэлтэй тул хуурамчлах боломжгүй.' },
  ];
  return (
    <Card className="overflow-hidden">
      <div className="border-b border-slate-100 bg-brand-50/50 px-5 py-3">
        <h3 className="flex items-center gap-2 text-sm font-bold text-brand-800">
          <ShieldCheck className="h-4 w-4" /> Практик дадлага хэрхэн баталгаажих вэ?
        </h3>
      </div>
      <div className="grid gap-4 p-5 sm:grid-cols-2 lg:grid-cols-5">
        {steps.map((s, i) => (
          <div key={i} className="relative">
            <div className="mb-2 flex items-center gap-2">
              <div className="grid h-8 w-8 place-items-center rounded-lg bg-brand-100 text-brand-700">
                <s.icon className="h-4 w-4" />
              </div>
              <span className="text-xs font-bold text-slate-400">{i + 1}</span>
            </div>
            <div className="text-sm font-semibold text-slate-900">{s.title}</div>
            <div className="mt-0.5 text-xs text-slate-500">{s.desc}</div>
          </div>
        ))}
      </div>
      <div className="border-t border-slate-100 bg-slate-50 px-5 py-3 text-xs text-slate-500">
        <strong className="text-slate-700">Багшийн тухай:</strong> Дадлага хянагч багш нь жолооны курсын
        бүртгэлтэй ажилтан бөгөөд платформд <span className="font-mono">INSTRUCTOR</span> эрхээр нэвтэрч,
        «QR баталгаажуулалт» хэсгээс суралцагчийн QR-ийг уншуулж дадлагыг баталгаажуулна. Тест эрх:
        <span className="font-mono"> 99001111 / teacher123</span>.
      </div>
    </Card>
  );
}

function BookSession({ schools, onBooked }: { schools: School[]; onBooked: () => void }) {
  const [schoolId, setSchoolId] = useState('');
  const [date, setDate] = useState('');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  async function book() {
    setLoading(true);
    setError('');
    try {
      await api('/api/practice/book', {
        method: 'POST',
        json: { schoolId, scheduledAt: new Date(date).toISOString() },
      });
      onBooked();
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  const minDate = new Date().toISOString().slice(0, 10);

  return (
    <Card className="p-6">
      <h3 className="text-lg font-bold text-slate-900">Дадлага захиалах</h3>
      <p className="mt-1 text-sm text-slate-500">
        Гэрээт жолооны курс сонгож, очих өдрөө товлоно уу. QR код үүснэ.
      </p>

      {error && <Alert variant="error" className="mt-4">{error}</Alert>}

      <div className="mt-5 space-y-4">
        <div>
          <Label>Жолооны курс (дадлагын талбай)</Label>
          <div className="grid gap-2">
            {schools.map((s) => (
              <button
                key={s.id}
                onClick={() => setSchoolId(s.id)}
                className={`flex items-start gap-3 rounded-xl border p-3 text-left transition ${
                  schoolId === s.id ? 'border-brand-500 bg-brand-50' : 'border-slate-200 hover:border-brand-300'
                }`}
              >
                <MapPin className={`mt-0.5 h-5 w-5 shrink-0 ${schoolId === s.id ? 'text-brand-700' : 'text-slate-400'}`} />
                <div className="flex-1">
                  <div className="text-sm font-semibold text-slate-900">{s.name}</div>
                  <div className="text-xs text-slate-500">{s.address}</div>
                  <div className="mt-0.5 flex items-center gap-1 text-xs text-slate-400">
                    <Phone className="h-3 w-3" /> {s.phone}
                  </div>
                </div>
              </button>
            ))}
          </div>
        </div>
        <div>
          <Label>Очих өдөр</Label>
          <Input type="date" min={minDate} value={date} onChange={(e) => setDate(e.target.value)} />
        </div>
        <Button className="w-full" onClick={book} loading={loading} disabled={!schoolId || !date}>
          Захиалах ба QR авах
        </Button>
      </div>
    </Card>
  );
}

function ActiveSession({
  session,
  elementDefs,
  onUpdate,
}: {
  session: Session;
  elementDefs: ElementDef[];
  onUpdate: () => void;
}) {
  const router = useRouter();
  const [simulating, setSimulating] = useState(false);
  const [error, setError] = useState('');
  const verifyUrl = typeof window !== 'undefined' ? `${window.location.origin}/instructor/scan?token=${session.qrToken}` : session.qrToken;

  async function selfVerify() {
    setSimulating(true);
    setError('');
    try {
      const allTrue = Object.fromEntries(elementDefs.map((e) => [e.code, true]));
      const res = await api<{ allPassed: boolean; certificate: { certNumber: string } | null }>(
        '/api/practice/verify',
        { method: 'POST', json: { qrToken: session.qrToken, elements: allTrue } }
      );
      if (res.certificate) {
        router.push('/certificates');
      } else {
        onUpdate();
      }
    } catch (e: any) {
      setError(e.message);
    } finally {
      setSimulating(false);
    }
  }

  const passedCount = elementDefs.filter((e) => session.elements[e.code]).length;

  return (
    <Card className="overflow-hidden">
      <div className="hero-gradient p-6 text-white">
        <Badge color="green">Идэвхтэй захиалга</Badge>
        <h3 className="mt-2 text-lg font-extrabold">{session.school.name}</h3>
        <p className="text-sm text-brand-100">{session.school.address}</p>
        <p className="mt-1 text-sm text-brand-100">Товлосон огноо: {formatDate(session.scheduledAt)}</p>
      </div>

      <div className="grid gap-6 p-6 md:grid-cols-2">
        {/* QR */}
        <div className="flex flex-col items-center">
          <div className="rounded-2xl border border-slate-200 p-3">
            <QrCode value={verifyUrl} size={170} />
          </div>
          <p className="mt-3 text-center text-xs text-slate-500">
            <QrIcon className="mr-1 inline h-4 w-4" />
            Энэ QR кодыг жолооны курст багшид үзүүлнэ. Багш скан хийж элемент бүрийг баталгаажуулна.
          </p>
        </div>

        {/* Elements */}
        <div>
          <div className="mb-2 flex items-center justify-between">
            <span className="text-sm font-bold text-slate-900">Дадлагын элементүүд</span>
            <Badge color={passedCount === elementDefs.length ? 'green' : 'slate'}>
              {passedCount}/{elementDefs.length}
            </Badge>
          </div>
          <div className="space-y-1.5">
            {elementDefs.map((e) => {
              const done = session.elements[e.code];
              return (
                <div key={e.code} className="flex items-center gap-2.5 rounded-lg border border-slate-100 px-3 py-2">
                  {done ? (
                    <CheckCircle2 className="h-5 w-5 shrink-0 text-accent-600" />
                  ) : (
                    <Circle className="h-5 w-5 shrink-0 text-slate-300" />
                  )}
                  <div>
                    <div className="text-sm font-medium text-slate-800">
                      {e.code}: {e.titleMn}
                    </div>
                    <div className="text-xs text-slate-400">{e.criteria}</div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      </div>

      {error && <Alert variant="error" className="mx-6 mb-4">{error}</Alert>}

      {/* Test self-verify */}
      <div className="border-t border-dashed border-slate-200 bg-accent-50/40 p-5">
        <div className="flex items-center gap-3">
          <Zap className="h-5 w-5 text-accent-600" />
          <div className="flex-1">
            <p className="text-sm font-bold text-slate-900">Тест горим: дадлагыг өөрөө баталгаажуулах</p>
            <p className="text-xs text-slate-600">
              Багшийн скан хийхийг дуурайж, бүх элементийг тэнцүүлж сертификат авна.
            </p>
          </div>
          <Button variant="success" size="sm" onClick={selfVerify} loading={simulating}>
            Бүгдийг тэнцүүлэх
          </Button>
        </div>
      </div>
    </Card>
  );
}
