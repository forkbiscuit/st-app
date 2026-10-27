import { useEffect } from 'react';
import type { Toast as ToastData } from '../state/appState';
import { Icon } from './Icon';

/** One toast at a time, announced politely. Errors stay until dismissed. */
export function Toast({
  toast,
  onUndo,
  onDismiss,
}: {
  toast: ToastData | null;
  onUndo: () => void;
  onDismiss: () => void;
}) {
  useEffect(() => {
    if (!toast || toast.tone === 'error') return;
    const t = window.setTimeout(onDismiss, toast.canUndo ? 6000 : 3500);
    return () => window.clearTimeout(t);
  }, [toast, onDismiss]);

  return (
    <div className="toast-region" role={toast?.tone === 'error' ? 'alert' : 'status'} aria-live="polite">
      {toast && (
        <div key={toast.id} className={`toast toast-${toast.tone}`}>
          {toast.tone === 'error' && <Icon name="error" />}
          <p>{toast.message}</p>
          {toast.canUndo && (
            <button type="button" className="toast-action" onClick={onUndo}>
              Undo
            </button>
          )}
          {(toast.tone === 'error' || !toast.canUndo) && (
            <button type="button" className="toast-close" onClick={onDismiss} aria-label="Dismiss">
              <Icon name="close" />
            </button>
          )}
        </div>
      )}
    </div>
  );
}
