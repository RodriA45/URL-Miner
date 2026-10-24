import { useState } from 'react';
import { History, Trash2, ArrowUpRight, Copy, Check, Download, Calendar } from 'lucide-react';

export default function HistoryView({ onRestoreSession, showToast }) {
  const [historyItems, setHistoryItems] = useState(() => {
    try {
      const saved = localStorage.getItem('urlminer_history');
      return saved ? JSON.parse(saved) : [];
    } catch {
      return [];
    }
  });

  const [copiedId, setCopiedId] = useState(null);

  const handleClearAll = () => {
    if (historyItems.length === 0) return;
    if (window.confirm('¿Seguro que deseas vaciar todo el historial de extracciones?')) {
      localStorage.removeItem('urlminer_history');
      setHistoryItems([]);
      showToast('Historial vaciado correctamente', 'info');
    }
  };

  const handleDeleteItem = (id) => {
    const updated = historyItems.filter(item => item.id !== id);
    setHistoryItems(updated);
    try {
      localStorage.setItem('urlminer_history', JSON.stringify(updated));
      showToast('Sesión eliminada del historial', 'info');
    } catch {
      // Ignore
    }
  };

  const handleCopyLinks = async (links, id) => {
    try {
      await navigator.clipboard.writeText(links.join('\n'));
      setCopiedId(id);
      showToast(`${links.length} enlaces copiados`, 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('Error al copiar al portapapeles', 'error');
    }
  };

  const handleDownloadTxt = (links, dateStr) => {
    const blob = new Blob([links.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `urlminer_historial_${dateStr.replace(/[^0-9]/g, '_')}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo .TXT descargado', 'success');
  };

  return (
    <div className="panel history-view-panel">
      <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
          <History size={22} color="var(--accent-color)" />
          <h2 className="panel-title" style={{ margin: 0 }}>HISTORIAL DE EXTRACCIONES</h2>
        </div>
        {historyItems.length > 0 && (
          <button className="btn-secondary danger-btn" onClick={handleClearAll} style={{ padding: '0.4rem 0.8rem', fontSize: '0.85rem' }}>
            <Trash2 size={14} /> VACIAR HISTORIAL
          </button>
        )}
      </div>

      <div className="panel-body" style={{ flexDirection: 'column', gap: '1rem' }}>
        {historyItems.length === 0 ? (
          <div className="empty-feed-placeholder" style={{ padding: '3rem 1rem' }}>
            <History size={48} style={{ opacity: 0.3, marginBottom: '1rem' }} />
            <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>NO HAY EXTRACCIONES GUARDADAS</div>
            <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '380px', textAlign: 'center', margin: '0.5rem 0' }}>
              Cada vez que proceses y extraigas enlaces en el Dashboard, se guardará automáticamente un registro local aquí para que nunca pierdas tu trabajo.
            </p>
          </div>
        ) : (
          <div className="history-list">
            {historyItems.map((item) => (
              <div key={item.id} className="history-item-card">
                <div className="history-card-top">
                  <div className="history-meta">
                    <Calendar size={14} color="var(--accent-cyan)" />
                    <span>{item.date}</span>
                    <span className="badge" style={{ marginLeft: '0.5rem' }}>
                      {item.links?.length || 0} ENLACES
                    </span>
                    {item.duplicates > 0 && (
                      <span className="badge" style={{ borderColor: 'var(--text-secondary)' }}>
                        {item.duplicates} repetidos
                      </span>
                    )}
                  </div>

                  <div className="history-actions">
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                      onClick={() => handleCopyLinks(item.links, item.id)}
                    >
                      {copiedId === item.id ? <Check size={13} color="#00ff66" /> : <Copy size={13} />}
                      {copiedId === item.id ? 'COPIADO' : 'COPIAR'}
                    </button>
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem' }}
                      onClick={() => handleDownloadTxt(item.links, item.date)}
                    >
                      <Download size={13} /> .TXT
                    </button>
                    <button
                      className="btn-primary"
                      style={{ padding: '0.35rem 0.7rem', fontSize: '0.8rem', width: 'auto', margin: 0 }}
                      onClick={() => onRestoreSession(item)}
                    >
                      <ArrowUpRight size={14} /> RESTAURAR EN EDITOR
                    </button>
                    <button
                      className="btn-secondary danger-btn"
                      style={{ padding: '0.35rem 0.6rem' }}
                      onClick={() => handleDeleteItem(item.id)}
                      title="Eliminar esta entrada"
                    >
                      <Trash2 size={13} />
                    </button>
                  </div>
                </div>

                {/* Preview sample */}
                <div className="history-preview-box">
                  <div className="history-preview-header">MUESTRA DE ENLACES:</div>
                  <div className="history-links-preview">
                    {item.links?.slice(0, 3).map((l, i) => (
                      <div key={i} className="history-link-line">
                        • {l}
                      </div>
                    ))}
                    {item.links?.length > 3 && (
                      <div style={{ color: 'var(--text-secondary)', fontStyle: 'italic', fontSize: '0.8rem' }}>
                        ... y {item.links.length - 3} enlaces más
                      </div>
                    )}
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
