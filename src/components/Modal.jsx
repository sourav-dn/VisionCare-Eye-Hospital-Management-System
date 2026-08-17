import { X } from 'lucide-react';
import { useEffect } from 'react';

/**
 * Reusable modal component.
 * @param {boolean}  isOpen
 * @param {function} onClose
 * @param {string}   title
 * @param {ReactNode} children
 * @param {string}   size    - 'sm'|'md'|'lg'|'xl'  (default 'md')
 * @param {function} onConfirm - if provided, shows a confirm button
 * @param {string}   confirmLabel
 * @param {string}   confirmVariant - 'primary'|'danger'
 * @param {boolean}  loading
 */
export default function Modal({
  isOpen, onClose, title, children,
  size = 'md',
  onConfirm, confirmLabel = 'Confirm',
  confirmVariant = 'primary',
  loading = false,
  footer,
}) {
  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e) => { if (e.key === 'Escape') onClose(); };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  const sizeClass = size === 'lg' ? 'modal-lg' : size === 'xl' ? 'modal-xl' : '';

  return (
    <div className="modal-overlay" onClick={(e) => { if (e.target === e.currentTarget) onClose(); }}>
      <div className={`modal ${sizeClass}`}>
        {/* Header */}
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: '1.5rem' }}>
          <h3 style={{ margin: 0, fontSize: '1.125rem', fontFamily: 'Outfit' }}>{title}</h3>
          <button onClick={onClose} className="btn btn-ghost btn-sm" style={{ padding: '0.375rem' }}>
            <X size={18} />
          </button>
        </div>

        {/* Body */}
        <div>{children}</div>

        {/* Footer */}
        {(onConfirm || footer) && (
          <div style={{ marginTop: '1.5rem', display: 'flex', gap: '0.75rem', justifyContent: 'flex-end' }}>
            {footer || (
              <>
                <button onClick={onClose}    className="btn btn-secondary" disabled={loading}>Cancel</button>
                <button onClick={onConfirm}  className={`btn btn-${confirmVariant}`} disabled={loading}>
                  {loading ? <span className="animate-spin" style={{ display: 'inline-block', width: 14, height: 14, border: '2px solid #fff', borderTopColor: 'transparent', borderRadius: '50%' }} /> : confirmLabel}
                </button>
              </>
            )}
          </div>
        )}
      </div>
    </div>
  );
}
