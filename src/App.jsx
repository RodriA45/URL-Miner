import { useState, useEffect } from 'react';
import { 
  LayoutDashboard, 
  Radio, 
  History, 
  Settings, 
  Copy, 
  Download, 
  Trash2, 
  Replace, 
  Moon, 
  Sun, 
  ExternalLink, 
  Check, 
  Search 
} from 'lucide-react';
import './index.css';
import { extractUrls } from './utils/urlExtractor';
import LiveDrop from './components/LiveDrop';
import HistoryView from './components/HistoryView';
import SettingsView from './components/SettingsView';
import Toast from './components/Toast';

function getInitialRoomFromUrl() {
  if (typeof window === 'undefined') return '';
  try {
    const params = new URLSearchParams(window.location.search);
    return params.get('drop') || params.get('room') || '';
  } catch {
    return '';
  }
}

function App() {
  const initialRoom = getInitialRoomFromUrl();

  // Navigation
  const [activeTab, setActiveTab] = useState(initialRoom ? 'drop' : 'dashboard');
  const [initialDropRoom] = useState(initialRoom);

  // Core Extractor State
  const [inputText, setInputText] = useState('');
  const [extractedLinks, setExtractedLinks] = useState([]);
  const [stats, setStats] = useState({ total: 0, duplicates: 0 });
  const [theme, setTheme] = useState(() => {
    return localStorage.getItem('urlminer_theme') || 'dark';
  });

  // Settings & Filters
  const [domainFilter, setDomainFilter] = useState('');
  const [prefix, setPrefix] = useState('');
  const [suffix, setSuffix] = useState('');
  const [findText, setFindText] = useState('');
  const [replaceText, setReplaceText] = useState('');
  const [tableSearch, setTableSearch] = useState('');
  const [copiedRowIdx, setCopiedRowIdx] = useState(null);

  // Engine preferences
  const [extractorSettings, setExtractorSettings] = useState(() => {
    try {
      const saved = localStorage.getItem('urlminer_settings');
      return saved ? JSON.parse(saved) : {
        includeWww: true,
        removeTrailingSlash: false,
        stripUtm: true
      };
    } catch {
      return { includeWww: true, removeTrailingSlash: false, stripUtm: true };
    }
  });

  // Toast Notification
  const [toast, setToast] = useState(null);

  const showToast = (message, type = 'info') => {
    setToast({ message, type });
  };

  useEffect(() => {
    if (toast) {
      const timer = setTimeout(() => setToast(null), 3000);
      return () => clearTimeout(timer);
    }
  }, [toast]);

  // Theme Sync
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
    localStorage.setItem('urlminer_theme', theme);
  }, [theme]);

  // Persist Extractor Settings
  useEffect(() => {
    try {
      localStorage.setItem('urlminer_settings', JSON.stringify(extractorSettings));
    } catch {
      // Ignore
    }
  }, [extractorSettings]);

  const toggleTheme = () => {
    setTheme(prev => (prev === 'dark' ? 'light' : 'dark'));
  };

  // Main Extract Logic using improved URL Extractor engine
  const handleExtract = () => {
    if (!inputText.trim()) return;

    const rawLinks = extractUrls(inputText, {
      includeWww: extractorSettings.includeWww,
      removeTrailingSlash: extractorSettings.removeTrailingSlash,
      stripUtm: extractorSettings.stripUtm,
      domainFilter
    });

    // Remove duplicates
    const uniqueLinks = [...new Set(rawLinks)];
    const duplicatesRemoved = rawLinks.length - uniqueLinks.length;

    // Apply Prefix and Suffix
    const formatted = uniqueLinks.map(link => `${prefix}${link}${suffix}`);

    setExtractedLinks(formatted);
    setStats({
      total: formatted.length,
      duplicates: duplicatesRemoved
    });

    if (formatted.length > 0) {
      showToast(`¡Se extrajeron ${formatted.length} enlaces!`, 'success');

      // Auto-save session to history
      try {
        const historyItem = {
          id: 'hist-' + Date.now(),
          date: new Date().toLocaleString(),
          links: formatted,
          duplicates: duplicatesRemoved,
          domainFilter,
          sourcePreview: inputText.slice(0, 120)
        };

        const existing = JSON.parse(localStorage.getItem('urlminer_history') || '[]');
        const updated = [historyItem, ...existing.slice(0, 29)]; // keep last 30
        localStorage.setItem('urlminer_history', JSON.stringify(updated));
      } catch {
        // Storage full or unavailable
      }
    } else {
      showToast('No se encontraron URLs con los filtros seleccionados', 'info');
    }
  };

  // Batch Replace
  const handleReplace = () => {
    if (!findText) {
      showToast('Ingresa el texto a buscar', 'error');
      return;
    }
    const newLinks = extractedLinks.map(link => link.split(findText).join(replaceText));
    setExtractedLinks(newLinks);
    showToast(`Reemplazo masivo aplicado en ${newLinks.length} enlaces`, 'success');
  };

  // Copy All Links
  const handleCopyAll = async () => {
    if (extractedLinks.length === 0) return;
    try {
      await navigator.clipboard.writeText(extractedLinks.join('\n'));
      showToast(`¡${extractedLinks.length} enlaces copiados al portapapeles!`, 'success');
    } catch {
      showToast('No se pudo copiar automáticamente', 'error');
    }
  };

  // Copy Single Row
  const handleCopySingle = async (link, idx) => {
    try {
      await navigator.clipboard.writeText(link);
      setCopiedRowIdx(idx);
      setTimeout(() => setCopiedRowIdx(null), 1500);
      showToast('Enlace copiado', 'info');
    } catch {
      showToast('Error al copiar enlace', 'error');
    }
  };

  // Delete Single Row
  const handleDeleteRow = (idxToDelete) => {
    const updated = extractedLinks.filter((_, idx) => idx !== idxToDelete);
    setExtractedLinks(updated);
    setStats(prev => ({ ...prev, total: updated.length }));
  };

  // Export TXT
  const handleDownloadTxt = () => {
    if (extractedLinks.length === 0) return;
    const blob = new Blob([extractedLinks.join('\n')], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enlaces_extraidos_${Date.now()}.txt`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo .TXT descargado', 'success');
  };

  // Export CSV
  const handleDownloadCsv = () => {
    if (extractedLinks.length === 0) return;
    const csvContent = 'URL\n' + extractedLinks.map(l => `"${l.replace(/"/g, '""')}"`).join('\n');
    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `enlaces_extraidos_${Date.now()}.csv`;
    a.click();
    URL.revokeObjectURL(url);
    showToast('Archivo .CSV descargado', 'success');
  };

  // Clear Input & Results
  const handleClear = () => {
    setInputText('');
    setExtractedLinks([]);
    setStats({ total: 0, duplicates: 0 });
    setTableSearch('');
    showToast('Área de trabajo limpiada', 'info');
  };

  // Restore Session from History
  const handleRestoreSession = (historyItem) => {
    setExtractedLinks(historyItem.links || []);
    setStats({
      total: historyItem.links?.length || 0,
      duplicates: historyItem.duplicates || 0
    });
    if (historyItem.domainFilter) setDomainFilter(historyItem.domainFilter);
    setActiveTab('dashboard');
    showToast(`Sesión de ${historyItem.date} restaurada`, 'success');
  };

  // Bridge: Send extracted links to Live Drop
  const handleSendToLiveDrop = () => {
    setActiveTab('drop');
    showToast('Cargando enlaces en el Chat en Vivo', 'info');
  };

  // Bridge: Send received text from Live Drop to Extractor
  const handleLoadTextIntoExtractor = (text) => {
    setInputText(text);
    setActiveTab('dashboard');
    showToast('Texto cargado en el Extractor. Haz clic en EXTRAER ENLACES.', 'success');
  };

  // Filter extracted links for table view
  const visibleLinks = tableSearch.trim()
    ? extractedLinks.filter(l => l.toLowerCase().includes(tableSearch.toLowerCase()))
    : extractedLinks;

  return (
    <div className="app-container">
      {/* Toast Notification */}
      <Toast toast={toast} onClose={() => setToast(null)} />

      {/* Header */}
      <header className="top-bar">
        <div className="brand">
          <h1>URL_MINER</h1>
          <span>THE POWERFUL LINK EXTRACTOR & LIVE TEXT BRIDGE</span>
        </div>
        <div className="header-status-area">
          <button className="theme-toggle" onClick={toggleTheme}>
            {theme === 'dark' ? <><Sun size={15} /> CLARO</> : <><Moon size={15} /> OSCURO</>}
          </button>
          <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.82rem', color: 'var(--text-secondary)' }}>
            V_3.2.0 // SYS: ONLINE
          </div>
        </div>
      </header>

      {/* Main Grid: Sidebar + Content */}
      <main className="main-grid">
        <aside className="sidebar">
          <button 
            className={`nav-btn ${activeTab === 'dashboard' ? 'active' : ''}`}
            onClick={() => setActiveTab('dashboard')}
          >
            <div className="nav-btn-content">
              <LayoutDashboard size={19} />
              <span>DASHBOARD</span>
            </div>
            {extractedLinks.length > 0 && (
              <span className="nav-tag-badge">{extractedLinks.length}</span>
            )}
          </button>

          <button 
            className={`nav-btn ${activeTab === 'drop' ? 'active' : ''}`}
            onClick={() => setActiveTab('drop')}
          >
            <div className="nav-btn-content">
              <Radio size={19} color={activeTab === 'drop' ? undefined : 'var(--accent-cyan)'} />
              <span>LIVE DROP</span>
            </div>
            <span className="nav-tag-badge" style={{ background: 'var(--accent-cyan)', color: '#000' }}>
              EN VIVO
            </span>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'history' ? 'active' : ''}`}
            onClick={() => setActiveTab('history')}
          >
            <div className="nav-btn-content">
              <History size={19} />
              <span>HISTORIAL</span>
            </div>
          </button>

          <button 
            className={`nav-btn ${activeTab === 'settings' ? 'active' : ''}`}
            onClick={() => setActiveTab('settings')}
          >
            <div className="nav-btn-content">
              <Settings size={19} />
              <span>AJUSTES</span>
            </div>
          </button>
        </aside>

        <section className="content-area">
          {/* TAB 1: DASHBOARD / EXTRACTOR */}
          {activeTab === 'dashboard' && (
            <>
              {/* Input Panel */}
              <div className="panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 className="panel-title" style={{ margin: 0 }}>EXTRAER ENLACES DE CÓDIGO O TEXTO</h2>
                  <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                    {inputText.length} CARACTERES
                  </span>
                </div>

                <div className="panel-body">
                  <div className="editor-section">
                    <textarea 
                      placeholder="Pega aquí texto masivo, correos, documentos, código HTML, Markdown o cualquier contenido..."
                      value={inputText}
                      onChange={(e) => setInputText(e.target.value)}
                    />
                  </div>

                  <div className="settings-section">
                    <div className="settings-title">FILTROS INTELIGENTES</div>
                    <div className="form-group">
                      <label htmlFor="filter-domain-input">Filtrar por Dominio o Palabra:</label>
                      <input 
                        id="filter-domain-input"
                        type="text" 
                        placeholder="Ej. youtube, drive, .pdf" 
                        value={domainFilter}
                        onChange={e => setDomainFilter(e.target.value)}
                      />
                    </div>

                    <div className="settings-title" style={{ marginTop: '0.5rem' }}>FORMATEADOR EN LOTE</div>
                    <div className="form-group">
                      <label htmlFor="prefix-input">Prefijo (ej. &lt;a href="):</label>
                      <input 
                        id="prefix-input"
                        type="text" 
                        value={prefix}
                        onChange={e => setPrefix(e.target.value)}
                        placeholder="Prefijo opcional"
                      />
                    </div>
                    <div className="form-group">
                      <label htmlFor="suffix-input">Sufijo (ej. "&gt;Link&lt;/a&gt;):</label>
                      <input 
                        id="suffix-input"
                        type="text" 
                        value={suffix}
                        onChange={e => setSuffix(e.target.value)}
                        placeholder="Sufijo opcional"
                      />
                    </div>

                    <button 
                      className="btn-primary" 
                      onClick={handleExtract}
                      disabled={!inputText.trim()}
                      style={{ marginTop: '0.75rem' }}
                    >
                      EXTRAER ENLACES
                    </button>
                    <button className="btn-secondary" onClick={handleClear} style={{ marginTop: '0.4rem' }}>
                      <Trash2 size={15} /> LIMPIAR TODO
                    </button>
                  </div>
                </div>
              </div>

              {/* Output Panel */}
              <div className="panel">
                <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '0.5rem' }}>
                  <h2 className="panel-title" style={{ margin: 0 }}>RESULTADOS DE EXTRACCIÓN</h2>
                  {extractedLinks.length > 0 && (
                    <button 
                      className="btn-secondary"
                      onClick={handleSendToLiveDrop}
                      style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)', padding: '0.35rem 0.75rem', fontSize: '0.8rem' }}
                    >
                      <Radio size={14} /> PASAR A CHAT EN VIVO (LIVE DROP)
                    </button>
                  )}
                </div>

                <div className="panel-body" style={{ flexDirection: 'column', gap: '1rem' }}>
                  {/* Toolbar */}
                  <div style={{ display: 'flex', gap: '1rem', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap' }}>
                    <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold', fontSize: '0.95rem' }}>
                      {stats.total > 0 ? (
                        <>
                          SE ENCONTRARON {stats.total} ENLACES 
                          {stats.duplicates > 0 && (
                            <span className="badge" style={{ marginLeft: '10px' }}>
                              ({stats.duplicates} duplicados eliminados)
                            </span>
                          )}
                        </>
                      ) : (
                        '0 ENLACES ENCONTRADOS'
                      )}
                    </div>

                    <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                      <button className="btn-secondary" onClick={handleDownloadTxt} disabled={stats.total === 0}>
                        <Download size={15} /> .TXT
                      </button>
                      <button className="btn-secondary" onClick={handleDownloadCsv} disabled={stats.total === 0}>
                        <Download size={15} /> .CSV
                      </button>
                      <button 
                        className="btn-secondary" 
                        onClick={handleCopyAll} 
                        disabled={stats.total === 0} 
                        style={{ borderColor: 'var(--accent-color)', color: 'var(--text-primary)', background: 'var(--accent-color)' }}
                      >
                        <span style={{ color: '#000000', display: 'flex', gap: '5px', fontWeight: 'bold', alignItems: 'center' }}>
                          <Copy size={15} /> COPIAR TODOS
                        </span>
                      </button>
                    </div>
                  </div>

                  {/* Bulk Find & Replace + Table Search */}
                  {stats.total > 0 && (
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '0.75rem', borderTop: '1px solid var(--border-color)', paddingTop: '1rem' }}>
                      <div className="tools-group">
                        <input 
                          type="text"
                          placeholder="Buscar en enlaces (ej. share)" 
                          value={findText}
                          onChange={e => setFindText(e.target.value)}
                        />
                        <input 
                          type="text"
                          placeholder="Reemplazar por (ej. view)" 
                          value={replaceText}
                          onChange={e => setReplaceText(e.target.value)}
                        />
                        <button className="btn-secondary" onClick={handleReplace}>
                          <Replace size={15} /> REEMPLAZO MASIVO
                        </button>
                      </div>

                      {/* Quick Search within Table */}
                      <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem' }}>
                        <Search size={16} color="var(--text-secondary)" />
                        <input
                          type="text"
                          placeholder="Filtrar en la tabla..."
                          value={tableSearch}
                          onChange={e => setTableSearch(e.target.value)}
                          style={{ padding: '0.4rem 0.75rem', fontSize: '0.85rem' }}
                        />
                        {tableSearch && (
                          <span style={{ fontSize: '0.8rem', fontFamily: 'JetBrains Mono', color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>
                            {visibleLinks.length} de {extractedLinks.length}
                          </span>
                        )}
                      </div>
                    </div>
                  )}

                  {/* Table */}
                  <div className="table-container">
                    <table>
                      <thead>
                        <tr>
                          <th style={{ width: '50px' }}>#</th>
                          <th style={{ width: '70px' }}>TIPO</th>
                          <th>URL</th>
                          <th className="action-col">ACCIONES</th>
                        </tr>
                      </thead>
                      <tbody>
                        {visibleLinks.length > 0 ? (
                          visibleLinks.map((link, idx) => {
                            const isCopied = copiedRowIdx === idx;
                            return (
                              <tr key={idx}>
                                <td>{idx + 1}</td>
                                <td>[L]</td>
                                <td className="url-col">
                                  <a href={link} target="_blank" rel="noopener noreferrer">
                                    {link}
                                  </a>
                                </td>
                                <td className="action-col">
                                  <button 
                                    className={`table-action-btn ${isCopied ? 'copied-active' : ''}`}
                                    onClick={() => handleCopySingle(link, idx)}
                                    title="Copiar enlace"
                                  >
                                    {isCopied ? <Check size={12} /> : <Copy size={12} />}
                                    <span>{isCopied ? 'COPIADO' : 'COPIAR'}</span>
                                  </button>
                                  <a 
                                    href={link} 
                                    target="_blank" 
                                    rel="noopener noreferrer" 
                                    className="table-action-btn"
                                    title="Abrir enlace en pestaña nueva"
                                    style={{ textDecoration: 'none' }}
                                  >
                                    <ExternalLink size={12} />
                                  </a>
                                  <button
                                    className="table-action-btn danger-btn"
                                    onClick={() => handleDeleteRow(idx)}
                                    title="Eliminar de la lista"
                                  >
                                    <Trash2 size={12} />
                                  </button>
                                </td>
                              </tr>
                            );
                          })
                        ) : (
                          <tr>
                            <td colSpan="4" style={{ textAlign: 'center', padding: '2.5rem', color: 'var(--text-secondary)' }}>
                              {stats.total === 0 
                                ? 'NO HAY DATOS PARA MOSTRAR. PEGA UN TEXTO Y HAZ CLIC EN EXTRAER.' 
                                : 'NINGÚN ENLACE COINCIDE CON LA BÚSQUEDA.'}
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
                </div>
              </div>
            </>
          )}

          {/* TAB 2: LIVE DROP / PUENTE EN VIVO */}
          {activeTab === 'drop' && (
            <LiveDrop 
              initialRoom={initialDropRoom}
              onSendToExtractor={handleLoadTextIntoExtractor}
              extractedLinks={extractedLinks}
              showToast={showToast}
            />
          )}

          {/* TAB 3: HISTORIAL */}
          {activeTab === 'history' && (
            <HistoryView 
              onRestoreSession={handleRestoreSession}
              showToast={showToast}
            />
          )}

          {/* TAB 4: AJUSTES */}
          {activeTab === 'settings' && (
            <SettingsView 
              theme={theme}
              toggleTheme={toggleTheme}
              extractorSettings={extractorSettings}
              onUpdateExtractorSettings={setExtractorSettings}
              showToast={showToast}
            />
          )}
        </section>
      </main>

      {/* Footer */}
      <footer className="status-bar">
        <div>(L) {stats.total} Enlaces Activos // Vista: {activeTab.toUpperCase()}</div>
        <div>
          Creado por <a href="https://rodria45.github.io/rodrigo-antunez-portfolio/" target="_blank" rel="noopener noreferrer" style={{ color: 'var(--accent-cyan)', textDecoration: 'none', fontWeight: 'bold', borderBottom: '2px solid var(--accent-cyan)', paddingBottom: '2px' }}>Rodrigo Antunez</a>
        </div>
        <div style={{ color: 'var(--accent-cyan)', fontWeight: 'bold' }}>SYSTEM STATUS: NOMINAL</div>
      </footer>
    </div>
  );
}

export default App;
