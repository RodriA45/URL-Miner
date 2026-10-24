import { useState } from 'react';
import { Settings, Shield, Sliders, Palette, Trash2, CheckCircle2, Check } from 'lucide-react';
import { THEMES } from '../utils/themes';

export default function SettingsView({
  theme,
  onSelectTheme,
  extractorSettings,
  onUpdateExtractorSettings,
  showToast
}) {
  const [cleared, setCleared] = useState(false);

  const handleToggle = (key) => {
    onUpdateExtractorSettings({
      ...extractorSettings,
      [key]: !extractorSettings[key]
    });
    showToast('Configuración actualizada', 'info');
  };

  const handleChooseTheme = (themeId, themeName) => {
    onSelectTheme(themeId);
    showToast(`Tema activado: ${themeName}`, 'success');
  };

  const handleClearAllStorage = () => {
    if (window.confirm('¿Deseas reiniciar toda la configuración y vaciar el almacenamiento local (historial, salas guardadas)?')) {
      localStorage.clear();
      setCleared(true);
      showToast('Almacenamiento local limpiado por completo', 'success');
      setTimeout(() => setCleared(false), 3000);
    }
  };

  return (
    <div className="panel settings-view-panel">
      <div className="panel-header" style={{ display: 'flex', alignItems: 'center', gap: '0.6rem' }}>
        <Settings size={22} color="var(--accent-color)" />
        <h2 className="panel-title" style={{ margin: 0 }}>AJUSTES Y TEMAS DEL SISTEMA</h2>
      </div>

      <div className="panel-body" style={{ flexDirection: 'column', gap: '1.75rem' }}>
        {/* Section 1: Visual Themes Gallery */}
        <div className="settings-card-group">
          <div className="settings-group-header">
            <Palette size={18} color="var(--accent-color)" />
            <span>GALERÍA DE TEMAS VISUALES (HALLOWEEN, NAVIDAD, MATRIX Y MÁS)</span>
          </div>

          <div style={{ fontSize: '0.85rem', color: 'var(--text-secondary)' }}>
            Selecciona un estilo visual para personalizar la interfaz de toda la aplicación:
          </div>

          <div className="theme-cards-grid">
            {THEMES.map((t) => {
              const isActive = theme === t.id;
              return (
                <div
                  key={t.id}
                  className={`theme-card ${isActive ? 'active-theme-card' : ''}`}
                  onClick={() => handleChooseTheme(t.id, t.name)}
                >
                  <div className="theme-card-top">
                    <div className="theme-card-name">
                      <span style={{ fontSize: '1.25rem' }}>{t.icon}</span>
                      <span>{t.name.toUpperCase()}</span>
                    </div>
                    {isActive && <Check size={16} color="var(--accent-color)" />}
                  </div>

                  <div style={{ fontSize: '0.78rem', color: 'var(--text-secondary)', lineHeight: 1.4 }}>
                    {t.subtitle}
                  </div>

                  <div className="theme-swatches">
                    {t.colors.map((c, i) => (
                      <span
                        key={i}
                        className="theme-swatch"
                        style={{ backgroundColor: c }}
                        title={`Color: ${c}`}
                      />
                    ))}
                  </div>

                  {isActive ? (
                    <div className="theme-active-tag">✓ ACTIVO</div>
                  ) : (
                    <button
                      className="btn-secondary"
                      style={{ padding: '0.3rem 0.6rem', fontSize: '0.78rem', marginTop: 'auto' }}
                      onClick={(e) => {
                        e.stopPropagation();
                        handleChooseTheme(t.id, t.name);
                      }}
                    >
                      ACTIVAR
                    </button>
                  )}
                </div>
              );
            })}
          </div>
        </div>

        {/* Section 2: Extraction Engine Preferences */}
        <div className="settings-card-group">
          <div className="settings-group-header">
            <Sliders size={18} color="var(--accent-cyan)" />
            <span>MOTOR DE EXTRACCIÓN Y LIMPIEZA</span>
          </div>

          <div className="settings-options-list">
            <label className="settings-toggle-row">
              <div>
                <div className="toggle-title">Detectar enlaces sin protocolo (ej. www.dominio.com)</div>
                <div className="toggle-desc">
                  Captura hipervínculos que empiezan directamente con "www." y les añade "https://" automáticamente.
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={extractorSettings.includeWww}
                onChange={() => handleToggle('includeWww')}
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <div className="toggle-title">Eliminar barra final (Trailing Slash /)</div>
                <div className="toggle-desc">
                  Normaliza URLs como "https://sitio.com/pagina/" a "https://sitio.com/pagina" para evitar duplicados.
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={extractorSettings.removeTrailingSlash}
                onChange={() => handleToggle('removeTrailingSlash')}
              />
            </label>

            <label className="settings-toggle-row">
              <div>
                <div className="toggle-title">Limpiar parámetros de rastreo y analítica (UTM, fbclid, etc.)</div>
                <div className="toggle-desc">
                  Elimina utm_source, utm_medium, utm_campaign, fbclid, gclid para URLs limpias y privadas.
                </div>
              </div>
              <input
                type="checkbox"
                className="checkbox-custom"
                checked={extractorSettings.stripUtm}
                onChange={() => handleToggle('stripUtm')}
              />
            </label>
          </div>
        </div>

        {/* Section 3: Privacy & Security */}
        <div className="settings-card-group">
          <div className="settings-group-header">
            <Shield size={18} color="var(--accent-cyan)" />
            <span>ARQUITECTURA, PRIVACIDAD Y LIMPIEZA</span>
          </div>

          <div style={{ fontSize: '0.9rem', color: 'var(--text-secondary)', lineHeight: 1.6, padding: '0.5rem 0' }}>
            <p>
              • <strong>100% Sin Cuentas:</strong> URL-Miner no requiere inicios de sesión, ni cookies invasivas, ni correo electrónico.
            </p>
            <p>
              • <strong>Extracción Local:</strong> El minado de enlaces se realiza estrictamente en la memoria de tu navegador (Client-Side). Tus datos nunca se envían a bases de datos permanentes.
            </p>
            <p>
              • <strong>Chat en Vivo Efímero:</strong> Los textos transferidos entre cualquier dispositivo se transmiten encriptados en tránsito y se destruyen de forma automática tras el tiempo de caducidad elegido (TTL).
            </p>
          </div>

          <div style={{ paddingTop: '1rem', borderTop: '1px solid var(--border-color)', display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
            <div>
              <div className="toggle-title">Restablecer Aplicación</div>
              <div className="toggle-desc">Borra historial guardado y restablece preferencias.</div>
            </div>
            <button className="btn-secondary danger-btn" onClick={handleClearAllStorage}>
              {cleared ? <CheckCircle2 size={16} color="#00ff66" /> : <Trash2 size={16} />}
              {cleared ? '¡DATOS REINICIADOS!' : 'BORRAR CACHÉ LOCAL'}
            </button>
          </div>
        </div>

        {/* About Card */}
        <div style={{ borderTop: '1px solid var(--border-color)', paddingTop: '1rem', fontSize: '0.85rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
          URL_MINER // VERSION 3.3.0 // TEMAS: CYBER DARK, NEO LIGHT, MATRIX, HALLOWEEN & NAVIDAD
        </div>
      </div>
    </div>
  );
}
