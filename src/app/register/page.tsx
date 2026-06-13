'use client';

import { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { BrandLogo } from '@/components/brand-logo';
import { Button, Input, Label, Alert, Card } from '@/components/ui';
import { api } from '@/lib/client';
import { ShieldCheck, Smartphone, Zap, ArrowLeft, CheckCircle2 } from 'lucide-react';

export default function RegisterPage() {
  const router = useRouter();
  const [step, setStep] = useState<'phone' | 'verify'>('phone');
  const [phone, setPhone] = useState('');
  const [code, setCode] = useState('');
  const [registerNumber, setRegisterNumber] = useState('');
  const [devOtp, setDevOtp] = useState<string | null>(null);
  const [xyp, setXyp] = useState<{ name: string; age: number } | null>(null);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  async function sendOtp() {
    setError('');
    setLoading(true);
    try {
      const res = await api<{ devOtp?: string }>('/api/auth/otp/send', {
        method: 'POST',
        json: { phone, purpose: 'register' },
      });
      setDevOtp(res.devOtp ?? null);
      setStep('verify');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function checkXyp() {
    if (registerNumber.length < 10) return;
    setError('');
    try {
      const res = await api<{ verified: boolean; age: number; message: string; citizen: any }>(
        '/api/xyp/verify',
        { method: 'POST', json: { registerNumber } }
      );
      if (res.verified) {
        setXyp({
          name: `${res.citizen.firstName} ${res.citizen.lastName}`,
          age: res.age,
        });
      } else {
        setXyp(null);
        setError(res.message);
      }
    } catch (e: any) {
      setError(e.message);
    }
  }

  async function register() {
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/register', {
        method: 'POST',
        json: { phone, code, registerNumber },
      });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  async function testLogin() {
    setError('');
    setLoading(true);
    try {
      await api('/api/auth/test-login', { method: 'POST', json: {} });
      router.push('/dashboard');
    } catch (e: any) {
      setError(e.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="grid min-h-screen md:grid-cols-2">
      {/* Left brand panel */}
      <div className="hero-gradient relative hidden flex-col justify-between p-10 md:flex">
        <Link href="/">
          <BrandLogo variant="light" />
        </Link>
        <div>
          <h2 className="text-3xl font-extrabold leading-tight text-white">
            Аюулгүй жолоодлогын аялалаа эхлүүл
          </h2>
          <ul className="mt-6 space-y-3 text-brand-100">
            {[
              'Утсаар хялбар, найдвартай бүртгэл',
              'Хур системээр 18+ нас баталгаажуулалт',
              'QPay төлбөр, дижитал гэрчилгээ',
            ].map((t) => (
              <li key={t} className="flex items-center gap-2">
                <CheckCircle2 className="h-5 w-5 text-accent-400" /> {t}
              </li>
            ))}
          </ul>
        </div>
        <p className="text-xs text-brand-200/70">© {new Date().getFullYear()} MediaProfessional LLC</p>
      </div>

      {/* Right form */}
      <div className="flex items-center justify-center bg-slate-50 p-6">
        <div className="w-full max-w-md">
          <Link href="/" className="mb-6 inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-800 md:hidden">
            <ArrowLeft className="h-4 w-4" /> Нүүр хуудас
          </Link>

          <h1 className="text-2xl font-extrabold text-slate-900">Бүртгүүлэх</h1>
          <p className="mt-1 text-sm text-slate-500">
            Утасны дугаараа баталгаажуулж эхэлнэ үү.
          </p>

          {error && (
            <Alert variant="error" className="mt-4">
              {error}
            </Alert>
          )}

          {step === 'phone' && (
            <div className="mt-6 space-y-4">
              <div>
                <Label>Утасны дугаар</Label>
                <div className="relative">
                  <Smartphone className="absolute left-3 top-3 h-5 w-5 text-slate-400" />
                  <Input
                    className="pl-10"
                    placeholder="9911XXXX"
                    inputMode="numeric"
                    maxLength={8}
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                  />
                </div>
                <p className="mt-1.5 text-xs text-slate-400">8 оронтой Монгол дугаар</p>
              </div>
              <Button
                className="w-full"
                onClick={sendOtp}
                loading={loading}
                disabled={phone.length !== 8}
              >
                Баталгаажуулах код авах
              </Button>
            </div>
          )}

          {step === 'verify' && (
            <div className="mt-6 space-y-4">
              {devOtp && (
                <Alert variant="info">
                  <strong>Тест горим:</strong> Таны баталгаажуулах код —{' '}
                  <span className="font-mono text-lg font-bold">{devOtp}</span>
                </Alert>
              )}
              <div>
                <Label>Баталгаажуулах код (OTP)</Label>
                <Input
                  placeholder="6 оронтой код"
                  inputMode="numeric"
                  maxLength={6}
                  value={code}
                  onChange={(e) => setCode(e.target.value.replace(/\D/g, ''))}
                />
              </div>
              <div>
                <Label>Регистрийн дугаар</Label>
                <Input
                  placeholder="УБ95051512"
                  value={registerNumber}
                  onChange={(e) => setRegisterNumber(e.target.value.toUpperCase())}
                  onBlur={checkXyp}
                />
                <p className="mt-1.5 text-xs text-slate-400">
                  Хур системээс 18+ нас шалгана (2 үсэг + 8 тоо)
                </p>
              </div>

              {xyp && (
                <Alert variant="success">
                  <div className="flex items-center gap-2">
                    <ShieldCheck className="h-5 w-5" />
                    <div>
                      <div className="font-semibold">{xyp.name}</div>
                      <div className="text-xs">Хур-аар баталгаажлаа · {xyp.age} нас</div>
                    </div>
                  </div>
                </Alert>
              )}

              <Button
                className="w-full"
                onClick={register}
                loading={loading}
                disabled={code.length !== 6 || registerNumber.length < 10}
              >
                Бүртгэл баталгаажуулах
              </Button>
              <button
                onClick={() => setStep('phone')}
                className="w-full text-center text-sm text-slate-500 hover:text-slate-800"
              >
                ← Утас солих
              </button>
            </div>
          )}

          {/* Test mode quick login */}
          <div className="mt-8 border-t border-dashed border-slate-300 pt-6">
            <Card className="border-accent-200 bg-accent-50/50 p-4">
              <div className="flex items-start gap-3">
                <div className="grid h-9 w-9 shrink-0 place-items-center rounded-lg bg-accent-100 text-accent-700">
                  <Zap className="h-5 w-5" />
                </div>
                <div className="flex-1">
                  <h3 className="text-sm font-bold text-slate-900">Тест горим — хялбар нэвтрэх</h3>
                  <p className="mt-0.5 text-xs text-slate-600">
                    Утас, OTP, регистр шаардахгүйгээр шууд туршиж үзэх.
                  </p>
                  <Button
                    variant="success"
                    size="sm"
                    className="mt-3"
                    onClick={testLogin}
                    loading={loading}
                  >
                    Тест хэрэглэгчээр нэвтрэх
                  </Button>
                </div>
              </div>
            </Card>
          </div>

          <p className="mt-6 text-center text-sm text-slate-500">
            Бүртгэлтэй юу?{' '}
            <Link href="/login" className="font-semibold text-brand-700 hover:underline">
              Нэвтрэх
            </Link>
          </p>
        </div>
      </div>
    </div>
  );
}
