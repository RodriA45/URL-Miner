import { CheckCircle2, AlertTriangle, Info, X } from 'lucide-react';

export default function Toast({ toast, onClose }) {
  if (!toast) return null;

  const getIcon = () => {
    switch (toast.type) {
      case 'success':
        return <CheckCircle2 size={18} color="var(--accent-color)" />;
      case 'error':
        return <AlertTriangle size={18} color="#ff4444" />;
      default:
        return <Info size={18} color="var(--accent-cyan)" />;
    }
  };

  return (
    <div className="toast-notification">
      <div className="toast-content">
        <span className="toast-icon">{getIcon()}</span>
        <span className="toast-message">{toast.message}</span>
      </div>
      <button className="toast-close-btn" onClick={onClose} aria-label="Cerrar notificación">
        <X size={16} />
      </button>
    </div>
  );
}
