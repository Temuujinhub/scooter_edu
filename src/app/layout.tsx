import type { Metadata, Viewport } from 'next';
import './globals.css';

export const metadata: Metadata = {
  title: 'ScooterEdu MN — Цахилгаан Скүүтэр Жолоодлогын Онлайн Сургалт',
  description:
    'Монгол Улсын анхны цахилгаан скүүтэр жолоодлогын онлайн сургалт, дижитал гэрчилгээний платформ. Хууль, аюулгүй байдал, практик дадлага — онлайнаар хурдан, баталгаатай.',
  keywords: ['скүүтэр', 'e-scooter', 'сургалт', 'гэрчилгээ', 'Монгол', 'жолоодлого', 'QPay'],
  authors: [{ name: 'MediaProfessional LLC' }],
  openGraph: {
    title: 'ScooterEdu MN',
    description: 'Цахилгаан скүүтэр жолоодлогын онлайн сургалт ба дижитал баталгаажуулалт',
    type: 'website',
  },
};

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  themeColor: '#1b448a',
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="mn">
      <body className="bg-slate-50 text-slate-900 antialiased">{children}</body>
    </html>
  );
}
