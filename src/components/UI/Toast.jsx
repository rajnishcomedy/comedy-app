import React from 'react';
import { CheckCircle2, XCircle, Info, X } from 'lucide-react';

const TOAST_STYLES = {
  success: { color: 'var(--green)',  bg: 'rgba(16,185,129,0.12)', border: 'rgba(16,185,129,0.3)',  Icon: CheckCircle2 },
  error:   { color: 'var(--red)',    bg: 'rgba(255,76,76,0.12)',   border: 'rgba(255,76,76,0.3)',   Icon: XCircle },
  info:    { color: 'var(--blue)',   bg: 'rgba(46,144,255,0.12)',  border: 'rgba(46,144,255,0.3)',  Icon: Info },
};

export function Toast({ id, message, type, onRemove }) {
  const { color, bg, border, Icon } = TOAST_STYLES[type] || TOAST_STYLES.info;
  const isError = type === 'error';
  const role = isError ? 'alert' : 'status';
  const ariaLive = isError ? 'assertive' : 'polite';
  return (
    <div
      role={role}
      aria-live={ariaLive}
      aria-atomic="true"
      style={{
      display: 'flex', alignItems: 'center', gap: 12,
      padding: '14px 16px',
      background: bg, border: `1px solid ${border}`,
      borderRadius: 'var(--radius)',
      backdropFilter: 'blur(12px)',
      animation: 'toastIn 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
      minWidth: 280, maxWidth: 380,
      boxShadow: '0 8px 32px rgba(0,0,0,0.4)',
    }}>
      <Icon size={18} color={color} style={{ flexShrink: 0 }} />
      <span style={{ flex: 1, fontSize: 14, color: 'var(--text)', lineHeight: 1.4 }}>{message}</span>
      <button
        onClick={() => onRemove(id)}
        aria-label={`Dismiss ${type} notification`}
        style={{ background: 'none', border: 'none', color: 'var(--text3)', cursor: 'pointer', padding: 2, display: 'flex' }}
      >
        <X size={16} />
      </button>
    </div>
  );
}

export function ToastContainer({ toasts, onRemove }) {
  return (
    <div style={{
      position: 'fixed', bottom: 24, right: 24,
      display: 'flex', flexDirection: 'column', gap: 10,
      zIndex: 9999, pointerEvents: 'none',
    }}>
      {toasts.map(t => (
        <div key={t.id} style={{ pointerEvents: 'all' }}>
          <Toast {...t} onRemove={onRemove} />
        </div>
      ))}
    </div>
  );
}
