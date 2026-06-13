'use client';

import { X } from 'lucide-react';
import { Button } from './ui';

// Дахин ашиглах модал цонх
export function Modal({
  open,
  onClose,
  title,
  description,
  children,
  footer,
  size = 'md',
}: {
  open: boolean;
  onClose: () => void;
  title: string;
  description?: string;
  children: React.ReactNode;
  footer?: React.ReactNode;
  size?: 'md' | 'lg';
}) {
  if (!open) return null;
  return (
    <div className="fixed inset-0 z-50 flex items-start justify-center overflow-y-auto bg-black/50 p-4">
      <div
        className={`my-8 w-full ${size === 'lg' ? 'max-w-2xl' : 'max-w-lg'} rounded-2xl bg-white shadow-xl`}
      >
        <div className="flex items-start justify-between border-b border-slate-200 p-5">
          <div>
            <h3 className="text-lg font-bold text-slate-900">{title}</h3>
            {description && <p className="mt-0.5 text-sm text-slate-500">{description}</p>}
          </div>
          <button onClick={onClose} className="text-slate-400 hover:text-slate-700">
            <X className="h-5 w-5" />
          </button>
        </div>
        <div className="p-5">{children}</div>
        {footer && (
          <div className="flex justify-end gap-2 border-t border-slate-200 p-5">{footer}</div>
        )}
      </div>
    </div>
  );
}

// Талбарын тайлбар бүхий хүрээ (админд бүх талбарт тусламжийн текст)
export function Field({
  label,
  hint,
  children,
}: {
  label: string;
  hint?: string;
  children: React.ReactNode;
}) {
  return (
    <div className="mb-4">
      <label className="mb-1 block text-sm font-semibold text-slate-700">{label}</label>
      {hint && <p className="mb-1.5 text-xs text-slate-400">{hint}</p>}
      {children}
    </div>
  );
}

export function ConfirmDelete({
  open,
  onClose,
  onConfirm,
  itemName,
  loading,
}: {
  open: boolean;
  onClose: () => void;
  onConfirm: () => void;
  itemName: string;
  loading?: boolean;
}) {
  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Устгахдаа итгэлтэй байна уу?"
      description={`"${itemName}" бичлэгийг бүрмөсөн устгана. Энэ үйлдлийг буцаах боломжгүй.`}
      footer={
        <>
          <Button variant="outline" onClick={onClose}>
            Болих
          </Button>
          <Button variant="danger" onClick={onConfirm} loading={loading}>
            Устгах
          </Button>
        </>
      }
    >
      <p className="text-sm text-slate-600">
        Холбоотой өгөгдөл (модуль, асуулт г.м) хамт устаж болзошгүйг анхаарна уу.
      </p>
    </Modal>
  );
}
