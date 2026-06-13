'use client';

import { useEffect, useState } from 'react';
import QRCode from 'qrcode';

// QR код зураг үүсгэгч (клиент)
export function QrCode({
  value,
  size = 180,
  className,
}: {
  value: string;
  size?: number;
  className?: string;
}) {
  const [dataUrl, setDataUrl] = useState<string>('');

  useEffect(() => {
    QRCode.toDataURL(value, {
      width: size * 2,
      margin: 1,
      color: { dark: '#15306b', light: '#ffffff' },
    })
      .then(setDataUrl)
      .catch(() => setDataUrl(''));
  }, [value, size]);

  if (!dataUrl) {
    return (
      <div
        className={className}
        style={{ width: size, height: size, background: '#eef3fb', borderRadius: 12 }}
      />
    );
  }

  // eslint-disable-next-line @next/next/no-img-element
  return (
    <img
      src={dataUrl}
      alt="QR код"
      width={size}
      height={size}
      className={className}
      style={{ borderRadius: 12 }}
    />
  );
}
