import { cn } from '@/lib/utils';

// ScooterEdu MN лого (SVG скүүтэр + үг)
export function BrandLogo({
  className,
  variant = 'dark',
  showText = true,
}: {
  className?: string;
  variant?: 'dark' | 'light';
  showText?: boolean;
}) {
  const textColor = variant === 'light' ? 'text-white' : 'text-brand-900';
  const subColor = variant === 'light' ? 'text-brand-200' : 'text-slate-500';
  return (
    <div className={cn('flex items-center gap-2.5', className)}>
      <div className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-brand-600 to-brand-900 shadow-md">
        <ScooterIcon className="h-6 w-6 text-white" />
      </div>
      {showText && (
        <div className="leading-tight">
          <div className={cn('text-lg font-extrabold tracking-tight', textColor)}>
            ScooterEdu<span className="text-accent-500"> MN</span>
          </div>
          <div className={cn('text-[10px] font-medium uppercase tracking-wider', subColor)}>
            Аюулгүй жолоодлого
          </div>
        </div>
      )}
    </div>
  );
}

export function ScooterIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="none" className={className} xmlns="http://www.w3.org/2000/svg">
      <circle cx="5" cy="18.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <circle cx="18.5" cy="18.5" r="2.4" stroke="currentColor" strokeWidth="1.6" />
      <path
        d="M7.4 18.5h8.7M16.1 18.5l3.2-11h1.8"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
      <path
        d="M5 18.5 10.5 8h3"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}
