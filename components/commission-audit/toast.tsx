'use client';

import React, { createContext, useCallback, useContext, useMemo, useState } from 'react';
import { AlertTriangle, CheckCircle2, Info, X, XCircle } from 'lucide-react';

export type ToastTone = 'success' | 'error' | 'warning' | 'info';

export interface ToastMessage {
  id: string;
  title: string;
  description?: string;
  tone: ToastTone;
  durationMs?: number;
}

export interface ToastInput {
  title: string;
  description?: string;
  tone?: ToastTone;
  /** `0` keeps the toast until it is dismissed manually. */
  durationMs?: number;
}

interface ToastContextValue {
  push: (toast: ToastInput) => string;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastContextValue | null>(null);

const TONE_STYLES: Record<ToastTone, { wrap: string; icon: React.ReactNode }> = {
  success: {
    wrap: 'border-emerald-200 bg-white',
    icon: <CheckCircle2 className="w-4 h-4 text-emerald-600" />,
  },
  error: {
    wrap: 'border-rose-200 bg-white',
    icon: <XCircle className="w-4 h-4 text-rose-600" />,
  },
  warning: {
    wrap: 'border-amber-200 bg-white',
    icon: <AlertTriangle className="w-4 h-4 text-amber-600" />,
  },
  info: {
    wrap: 'border-slate-200 bg-white',
    icon: <Info className="w-4 h-4 text-slate-500" />,
  },
};

function ToastCard({ toast, onDismiss }: { toast: ToastMessage; onDismiss: (id: string) => void }) {
  const tone = TONE_STYLES[toast.tone];

  React.useEffect(() => {
    const duration = toast.durationMs ?? 4500;
    if (duration <= 0) return;
    const timer = window.setTimeout(() => onDismiss(toast.id), duration);
    return () => window.clearTimeout(timer);
  }, [toast.id, toast.durationMs, onDismiss]);

  return (
    <div
      role="status"
      className={`pointer-events-auto flex items-start gap-3 rounded-xl border shadow-lg px-4 py-3 w-80 ${tone.wrap}`}
    >
      <div className="mt-0.5 flex-shrink-0">{tone.icon}</div>
      <div className="flex-1 min-w-0">
        <p className="text-xs font-semibold text-slate-900">{toast.title}</p>
        {toast.description && (
          <p className="text-[11px] text-slate-600 mt-0.5 break-words">{toast.description}</p>
        )}
      </div>
      <button
        type="button"
        onClick={() => onDismiss(toast.id)}
        aria-label="Dismiss notification"
        className="p-1 rounded-lg text-slate-400 hover:text-slate-700 hover:bg-slate-100 transition flex-shrink-0"
      >
        <X className="w-3.5 h-3.5" />
      </button>
    </div>
  );
}

/** Mount once per page; `useToast()` pushes notifications into it. */
export function ToastProvider({ children }: { children: React.ReactNode }) {
  const [toasts, setToasts] = useState<ToastMessage[]>([]);

  const dismiss = useCallback((id: string) => {
    setToasts((current) => current.filter((toast) => toast.id !== id));
  }, []);

  const push = useCallback((input: ToastInput) => {
    const id = `toast-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`;
    setToasts((current) => [
      ...current.slice(-3),
      { id, tone: input.tone ?? 'info', ...input },
    ]);
    return id;
  }, []);

  const value = useMemo(() => ({ push, dismiss }), [push, dismiss]);

  return (
    <ToastContext.Provider value={value}>
      {children}
      <div className="fixed bottom-4 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
        {toasts.map((toast) => (
          <ToastCard key={toast.id} toast={toast} onDismiss={dismiss} />
        ))}
      </div>
    </ToastContext.Provider>
  );
}

/** Access the toast queue. Returns a no-op when no provider is mounted. */
export function useToast(): ToastContextValue {
  const context = useContext(ToastContext);
  return (
    context ?? {
      push: () => '',
      dismiss: () => undefined,
    }
  );
}
