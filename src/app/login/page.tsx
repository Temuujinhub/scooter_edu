'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand-logo';
import { Button, Input, Label, Alert } from '@/components/ui';
import { api } from '@/lib/client';
import { ArrowLeft, KeyRound, Smartphone } from 'lucide-react';

export default function LoginPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'student' | 'staff'>('student');

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      <div className="hero-gradient relative hidden flex-col justify-between p-10 md:flex">
        <Link href="/">
          <BrandLogo variant="light" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-white">Тавтай морил</h2>
          <p className="mt-3 max-w-sm text-brand-100/90">
            Сургалтаа үргэлжлүүлж, дижитал гэрчилгээ рүүгээ нэг алхам ойртоорой.
          </p>
        </div>
        <p className="text-xs text-brand-200/70">© {new Date().getFullYear()} MediaProfessional LLC</p>
      </div>

      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 md:hidden">
            <ArrowLeft className="h-4 w-4" /> Нүүр хуудас
          </Link>
          <h1 className="text-2xl font-extrabold text-slate-900">Нэвтрэх</h1>

          {/* mode toggle */}
          <div className="mt-5 grid grid-cols-2 gap-1 rounded-xl bg-slate-100 p-1">
            <button
              onClick={() => setMode('student')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                mode === 'student' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              <Smartphone className="h-4 w-4" /> Суралцагч
            </button>
            <button
              onClick={() => setMode('staff')}
              className={`flex items-center justify-center gap-2 rounded-lg py-2 text-sm font-semibold transition ${
                mode === 'staff' ? 'bg-white text-brand-800 shadow-sm' : 'text-slate-500'
              }`}
            >
              <KeyRound className="h-4 w-4" /> Ажилтан
            </button>
          </div>

          <div className="mt-6">
            {mode === 'student' ? <StudentLogin router={router} /> : <StaffLogin router={router} />}
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Шинэ хэрэглэгч үү?{' '}
            <Link href="/register" className="font-semibold text-brand-700 hover:underline">
              Бүртгүүлэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}

function StudentLogin({ router }: { router: ReturnType<typeof useRouter> }) {
  const [step, setStep] = useState<'phone' | 'code'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function send() {
    setError('');
    setLoading(true);
    try {
      const res = await api<{ devOtp?: string }>('/api/auth/otp/send', {
        method: 'POST',
        json: { phone, purpose: 'login' },
      });
      setDevOtp(res.devOtp ?? null);
      setStep('code');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function verify() {
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/register', { method: 'POST', json: { phone, code } });
      router.push('/dashboard');
    } catch (e: any) {
      if (e.message?.includes('регистр')) {
        setError('Та бүртгэлгүй байна. Эхлээд бүртгүүлнэ үү.');
      } else {
        setError(e.message);
      }
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      {step === 'phone' ? (
        <>
          <div>
            <Label>Утасны дугаар</Label>
            <Input
              placeholder="9911XXXX"
              inputMode="numeric"
              maxLength={8}
              value={phone}
              onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button className="w-full" onClick={send} loading={loading} disabled={phone.length !== 8}>
            Код авах
          </Button>
        </>
      ) : (
        <>
          {devOtp && (
            <Alert variant="info">
              <strong>Тест код:</strong>{' '}
              <span className="font-mono text-lg font-bold">{devOtp}</span>
            </Alert>
          )}
          <div>
            <Label>Баталгаажуулах код</Label>
            <Input
              placeholder="6 оронтой код"
              inputMode="numeric"
              maxLength={6}
              value={code}
              onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
            />
          </div>
          <Button className="w-full" onClick={verify} loading={loading} disabled={code.length !== 6}>
            Нэвтрэх
          </Button>
        </>
      )}
    </div>
  );
}

function StaffLogin({ router }: { router: ReturnType<typeof useRouter> }) {
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function login() {
    setError('');
    setLoading(true);
    try {
      const res = await api<{ user: { role: string } }>('/api/auth/login', {
        method: 'POST',
        json: { phone, password },
      });
      router.push(res.user.role === 'ADMIN' ? '/admin' : '/instructor');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="space-y-4">
      {error && <Alert variant="error">{error}</Alert>}
      <div>
        <Label>Утас / Нэвтрэх нэр</Label>
        <Input placeholder="99000000" value={phone} onChange={(e) => setPhone(e.target.value)} />
      </div>
      <div>
        <Label>Нууц үг</Label>
        <Input
          type="password"
          placeholder="••••••••"
          value={password}
          onChange={(e) => setPassword(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && login()}
        />
      </div>
      <Button className="w-full" onClick={login} loading={loading} disabled={!phone || !password}>
        Нэвтрэх
      </Button>
    </div>
  );
}
