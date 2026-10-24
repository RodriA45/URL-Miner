import { useState, useEffect, useRef } from 'react';
import { QRCodeSVG } from 'qrcode.react';
import { 
  Radio, 
  Send, 
  Copy, 
  Check, 
  Trash2, 
  QrCode, 
  Smartphone, 
  Monitor, 
  Clock, 
  RefreshCw, 
  Share2, 
  ArrowRight,
  ClipboardPaste,
  ShieldCheck,
  Flame
} from 'lucide-react';
import { 
  generateRoomCode, 
  sanitizeRoomCode, 
  sendDropMessage, 
  fetchDropHistory, 
  subscribeToRoom, 
  purgeRoom 
} from '../utils/liveDropService';

export default function LiveDrop({ initialRoom = '', onSendToExtractor, extractedLinks = [], showToast }) {
  const [roomInput, setRoomInput] = useState(() => (initialRoom ? sanitizeRoomCode(initialRoom) : generateRoomCode()));
  const [activeRoom, setActiveRoom] = useState(() => (initialRoom ? sanitizeRoomCode(initialRoom) : ''));
  const [messages, setMessages] = useState([]);
  const [inputText, setInputText] = useState('');
  const [ttlMinutes, setTtlMinutes] = useState(15);
  const [isLoading, setIsLoading] = useState(false);
  const [isSending, setIsSending] = useState(false);
  const [copiedId, setCopiedId] = useState(null);
  const [showQrModal, setShowQrModal] = useState(false);
  const [currentTime, setCurrentTime] = useState(() => Date.now());

  // Detect device type
  const isMobile = typeof navigator !== 'undefined' && /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent);
  const [deviceName, setDeviceName] = useState(isMobile ? '📱 Dispositivo 2' : '💻 Dispositivo 1');

  const messagesEndRef = useRef(null);
  const showToastRef = useRef(showToast);
  useEffect(() => {
    showToastRef.current = showToast;
  }, [showToast]);

  // Handle joining or switching room
  useEffect(() => {
    if (!activeRoom) return;

    let isMounted = true;
    queueMicrotask(() => {
      if (isMounted) setIsLoading(true);
    });

    // Fetch initial history
    fetchDropHistory(activeRoom).then(initialMsgs => {
      if (isMounted) {
        setMessages(initialMsgs);
        setIsLoading(false);
      }
    });

    // Subscribe to live SSE events
    const unsubscribe = subscribeToRoom(
      activeRoom,
      (newMsg) => {
        if (!isMounted) return;
        setMessages(prev => {
          if (prev.some(m => m.id === newMsg.id)) return prev;
          return [...prev, newMsg];
        });
        showToastRef.current('¡Nuevo texto recibido en vivo!', 'info');
      },
      (purgeTimestamp) => {
        if (!isMounted) return;
        setMessages(prev => prev.filter(m => m.timestamp > purgeTimestamp));
        showToastRef.current('La sala fue limpiada/destruida por un dispositivo.', 'info');
      },
      (err) => {
        console.warn('SSE connection issue, falling back:', err);
      }
    );

    // Periodic tick to clean expired messages and update countdowns
    const interval = setInterval(() => {
      const now = Date.now();
      setCurrentTime(now);
      setMessages(prev => {
        const filtered = prev.filter(m => !m.expiresAt || m.expiresAt > now);
        return filtered.length !== prev.length ? filtered : prev;
      });
    }, 1000);

    return () => {
      isMounted = false;
      unsubscribe();
      clearInterval(interval);
    };
  }, [activeRoom]);

  // Scroll to bottom when messages update
  useEffect(() => {
    if (messages.length > 0) {
      messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
    }
  }, [messages.length]);

  const handleJoinRoom = (e) => {
    e?.preventDefault();
    const sanitized = sanitizeRoomCode(roomInput);
    if (!sanitized) {
      showToast('Por favor introduce un código de sala válido', 'error');
      return;
    }
    setActiveRoom(sanitized);
    showToast(`Conectado a la sala [${sanitized}]`, 'success');
  };

  const handleGenerateNew = () => {
    const newCode = generateRoomCode();
    setRoomInput(newCode);
    setActiveRoom(newCode);
    setMessages([]);
    showToast(`Nueva sala creada: [${newCode}]`, 'info');
  };

  const handleSendMessage = async () => {
    if (!inputText.trim()) {
      showToast('Escribe o pega algún texto antes de enviar', 'error');
      return;
    }
    if (!activeRoom) {
      showToast('Únete o crea una sala primero', 'error');
      return;
    }

    try {
      setIsSending(true);
      const sent = await sendDropMessage(activeRoom, {
        text: inputText,
        sender: deviceName,
        ttlMinutes: Number(ttlMinutes)
      });

      // Optimistically add to list if not already there
      setMessages(prev => prev.some(m => m.id === sent.id) ? prev : [...prev, sent]);
      setInputText('');
      showToast('¡Texto enviado en vivo al otro dispositivo!', 'success');
    } catch (err) {
      showToast('Error al enviar texto: ' + err.message, 'error');
    } finally {
      setIsSending(false);
    }
  };

  const handlePasteClipboard = async () => {
    try {
      if (navigator.clipboard && navigator.clipboard.readText) {
        const text = await navigator.clipboard.readText();
        if (text) {
          setInputText(text);
          showToast('Texto pegado del portapapeles', 'info');
        } else {
          showToast('El portapapeles está vacío', 'info');
        }
      } else {
        showToast('Función no permitida por el navegador, pega manualmente con Ctrl+V', 'error');
      }
    } catch {
      showToast('Permiso de portapapeles denegado, pega manualmente con Ctrl+V', 'error');
    }
  };

  const handleImportExtracted = () => {
    if (!extractedLinks || extractedLinks.length === 0) {
      showToast('No hay enlaces extraídos en URL-Miner aún', 'info');
      return;
    }
    const joined = extractedLinks.join('\n');
    setInputText(prev => prev ? `${prev}\n\n${joined}` : joined);
    showToast(`Se importaron ${extractedLinks.length} enlaces`, 'success');
  };

  const handleCopyText = async (text, id) => {
    try {
      await navigator.clipboard.writeText(text);
      setCopiedId(id);
      showToast('¡Texto copiado al portapapeles!', 'success');
      setTimeout(() => setCopiedId(null), 2000);
    } catch {
      showToast('No se pudo copiar automáticamente', 'error');
    }
  };

  const handlePurge = async () => {
    if (!activeRoom) return;
    const confirm = window.confirm(
      `¿Estás seguro de que deseas destruir y limpiar completamente la sala [${activeRoom}]? Todos los textos se borrarán en todos los dispositivos conectados.`
    );
    if (!confirm) return;

    try {
      await purgeRoom(activeRoom);
      setMessages([]);
      showToast('Sala destruida y purgada con éxito', 'success');
    } catch (err) {
      showToast('Error al purgar sala: ' + err.message, 'error');
    }
  };

  // Build the direct pairing URL
  const shareUrl = typeof window !== 'undefined' 
    ? `${window.location.origin}${window.location.pathname}?drop=${activeRoom}`
    : `https://url-miner.vercel.app/?drop=${activeRoom}`;

  const formatCountdown = (expiresAt) => {
    if (!expiresAt) return 'Sin límite';
    const diff = Math.max(0, expiresAt - currentTime);
    const totalSecs = Math.floor(diff / 1000);
    const mins = Math.floor(totalSecs / 60);
    const secs = totalSecs % 60;
    return `${mins}m ${secs < 10 ? '0' : ''}${secs}s`;
  };

  return (
    <div className="live-drop-view">
      {/* Top Header Card */}
      <div className="panel drop-header-panel">
        <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', flexWrap: 'wrap', gap: '1rem' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '0.75rem' }}>
            <Radio className="pulse-icon" size={24} color="var(--accent-cyan)" />
            <div>
              <h2 className="panel-title" style={{ margin: 0 }}>CHAT EN VIVO // LIVE TEXT DROP</h2>
              <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
                PÁRATE O COMPARTE TEXTOS COMPLETOS EN TIEMPO REAL ENTRE CUALQUIER DISPOSITIVO // SIN CUENTAS NI REGISTROS
              </span>
            </div>
          </div>

          <div className="connection-badge">
            <span className="live-dot"></span>
            {activeRoom ? `SALA ACTIVA: ${activeRoom}` : 'DESCONECTADO'}
          </div>
        </div>

        <div className="panel-body" style={{ flexDirection: 'column', gap: '1.25rem' }}>
          {/* Room Control Bar */}
          <div className="room-control-bar">
            <div className="room-input-group">
              <label htmlFor="room-code-input" style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem', fontWeight: 'bold' }}>
                CÓDIGO DE SALA:
              </label>
              <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
                <input
                  id="room-code-input"
                  type="text"
                  value={roomInput}
                  onChange={(e) => setRoomInput(sanitizeRoomCode(e.target.value))}
                  placeholder="Ej. DROP-842"
                  style={{ maxWidth: '180px', textTransform: 'uppercase', fontWeight: 'bold', letterSpacing: '0.1em' }}
                />
                <button className="btn-secondary" onClick={handleJoinRoom}>
                  ENTRAR A SALA
                </button>
                <button className="btn-secondary" onClick={handleGenerateNew} title="Generar un código nuevo aleatorio">
                  <RefreshCw size={15} /> NUEVA SALA
                </button>
              </div>
            </div>

            {/* Quick Actions & QR Code Toggle */}
            {activeRoom && (
              <div className="room-share-actions">
                <button 
                  className="btn-secondary" 
                  onClick={() => setShowQrModal(!showQrModal)}
                  style={{ borderColor: 'var(--accent-cyan)', color: 'var(--accent-cyan)' }}
                >
                  <QrCode size={16} /> {showQrModal ? 'OCULTAR QR' : 'CONECTAR OTRO DISPOSITIVO (QR)'}
                </button>
                <button 
                  className="btn-secondary" 
                  onClick={() => handleCopyText(shareUrl, 'share-url')}
                >
                  <Share2 size={16} /> {copiedId === 'share-url' ? '¡ENLACE COPIADO!' : 'COPIAR ENLACE'}
                </button>
                <button 
                  className="btn-secondary danger-btn" 
                  onClick={handlePurge}
                  title="Elimina todos los mensajes de esta sala inmediatamente"
                >
                  <Flame size={16} /> DESTRUIR SALA
                </button>
              </div>
            )}
          </div>

          {/* QR Code Banner / Flyout */}
          {activeRoom && showQrModal && (
            <div className="qr-container-banner">
              <div className="qr-box">
                <QRCodeSVG 
                  value={shareUrl} 
                  size={160}
                  bgColor="#ffffff"
                  fgColor="#000000"
                  level="M"
                  includeMargin={true}
                />
              </div>
              <div className="qr-details">
                <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontWeight: 'bold', fontSize: '1.1rem' }}>
                  <Smartphone size={20} color="var(--accent-color)" /> CONECTA OTRO DISPOSITIVO CON EL CÓDIGO QR
                </div>
                <p style={{ margin: '0.5rem 0', fontSize: '0.9rem', color: 'var(--text-secondary)' }}>
                  Apunta la cámara de cualquier teléfono, tablet o portátil hacia el código QR. Se abrirá automáticamente esta misma sala en vivo para pasarse textos al instante sin descargar aplicaciones ni crear cuentas.
                </p>
                <div style={{ fontFamily: 'JetBrains Mono', fontSize: '0.85rem' }}>
                  SALA: <strong style={{ color: 'var(--accent-cyan)' }}>{activeRoom}</strong>
                </div>
              </div>
            </div>
          )}

          {/* Device Identity Selector */}
          <div className="device-id-row">
            <div style={{ display: 'flex', alignItems: 'center', gap: '0.5rem', fontSize: '0.85rem', fontFamily: 'JetBrains Mono' }}>
              <span>IDENTIFICAR ESTE DISPOSITIVO COMO:</span>
              <input
                type="text"
                value={deviceName}
                onChange={(e) => setDeviceName(e.target.value)}
                style={{ width: '160px', padding: '0.3rem 0.6rem', fontSize: '0.85rem' }}
              />
            </div>
            <div className="privacy-pill">
              <ShieldCheck size={14} color="var(--accent-color)" />
              <span>100% EFÍMERO // SE AUTODESTRUYE SEGÚN EL TIEMPO ELEGIDO</span>
            </div>
          </div>
        </div>
      </div>

      {/* Main Two-Column Layout */}
      <div className="drop-columns-grid">
        {/* Left Column: Composer */}
        <div className="panel drop-composer-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>ENVIAR TEXTO O ENLACES</h3>
            <span style={{ fontSize: '0.8rem', color: 'var(--text-secondary)', fontFamily: 'JetBrains Mono' }}>
              {inputText.length} CARACTERES
            </span>
          </div>

          <div className="panel-body" style={{ flexDirection: 'column', gap: '1rem' }}>
            <textarea
              placeholder="Pega aquí cualquier texto largo, código, enlaces, apuntes o mensajes que quieras compartir o pasarte a otro dispositivo..."
              value={inputText}
              onChange={(e) => setInputText(e.target.value)}
              rows={8}
              style={{ minHeight: '180px' }}
            />

            {/* Quick helper buttons */}
            <div style={{ display: 'flex', gap: '0.5rem', flexWrap: 'wrap' }}>
              <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} onClick={handlePasteClipboard}>
                <ClipboardPaste size={14} /> PEGAR PORTAPAPELES
              </button>
              {extractedLinks.length > 0 && (
                <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem' }} onClick={handleImportExtracted}>
                  <ArrowRight size={14} /> IMPORTAR DE EXTRACTOR ({extractedLinks.length})
                </button>
              )}
              {inputText && (
                <button className="btn-secondary" style={{ padding: '0.5rem 0.75rem', fontSize: '0.85rem', marginLeft: 'auto' }} onClick={() => setInputText('')}>
                  <Trash2 size={14} /> VACIAR
                </button>
              )}
            </div>

            {/* Auto-Clean TTL Option */}
            <div className="form-group" style={{ marginTop: '0.5rem' }}>
              <label style={{ display: 'flex', alignItems: 'center', gap: '0.4rem', fontSize: '0.85rem' }}>
                <Clock size={14} color="var(--accent-color)" />
                TIEMPO DE EXPIRACIÓN Y LIMPIEZA AUTOMÁTICA:
              </label>
              <select
                value={ttlMinutes}
                onChange={(e) => setTtlMinutes(Number(e.target.value))}
                className="select-custom"
              >
                <option value={5}>5 Minutos (Ultra efímero)</option>
                <option value={15}>15 Minutos (Recomendado para transferir)</option>
                <option value={30}>30 Minutos</option>
                <option value={60}>1 Hora</option>
                <option value={1440}>24 Horas</option>
              </select>
            </div>

            <button 
              className="btn-primary" 
              onClick={handleSendMessage}
              disabled={isSending || !inputText.trim() || !activeRoom}
              style={{ display: 'flex', justifyContent: 'center', alignItems: 'center', gap: '0.6rem' }}
            >
              <Send size={18} />
              {isSending ? 'ENVIANDO...' : 'ENVIAR MENSAJE / TEXTO EN VIVO'}
            </button>
          </div>
        </div>

        {/* Right Column: Live Feed */}
        <div className="panel drop-feed-panel">
          <div className="panel-header" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <h3 className="panel-title" style={{ fontSize: '1rem' }}>
              TEXTOS EN ESTA SALA ({messages.length})
            </h3>
            {isLoading && <span style={{ fontSize: '0.8rem', color: 'var(--accent-cyan)' }}>SINCRONIZANDO...</span>}
          </div>

          <div className="panel-body messages-feed-container">
            {messages.length === 0 ? (
              <div className="empty-feed-placeholder">
                <Radio size={40} style={{ opacity: 0.4, marginBottom: '0.5rem' }} />
                <div style={{ fontFamily: 'JetBrains Mono', fontWeight: 'bold' }}>NO HAY TEXTOS EN ESTA SALA AÚN</div>
                <p style={{ fontSize: '0.85rem', color: 'var(--text-secondary)', maxWidth: '350px', textAlign: 'center', margin: '0.5rem 0' }}>
                  Escribe un texto o conecta otro dispositivo con el código de sala o QR para comenzar a pasarte datos en vivo.
                </p>
              </div>
            ) : (
              <div className="messages-list">
                {messages.map((msg) => {
                  const isCopied = copiedId === msg.id;
                  const isFromMe = msg.sender === deviceName;

                  return (
                    <div key={msg.id} className={`message-card ${isFromMe ? 'msg-own' : 'msg-incoming'}`}>
                      <div className="message-card-header">
                        <div className="msg-sender-info">
                          {msg.sender?.includes('Celular') || msg.sender?.includes('📱') ? (
                            <Smartphone size={15} color="var(--accent-cyan)" />
                          ) : (
                            <Monitor size={15} color="var(--accent-color)" />
                          )}
                          <span className="msg-sender-name">{msg.sender}</span>
                          <span className="msg-timestamp">
                            {new Date(msg.timestamp).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                          </span>
                        </div>

                        <div className="msg-ttl-badge" title="Tiempo restante antes de autodestruirse">
                          <Clock size={12} />
                          <span>{formatCountdown(msg.expiresAt)}</span>
                        </div>
                      </div>

                      <div className="message-card-body">
                        <pre className="message-text-content">{msg.text}</pre>
                      </div>

                      <div className="message-card-actions">
                        <button
                          className="msg-btn copy-btn"
                          onClick={() => handleCopyText(msg.text, msg.id)}
                          title="Copiar texto completo al portapapeles"
                        >
                          {isCopied ? <Check size={14} color="#00ff66" /> : <Copy size={14} />}
                          <span>{isCopied ? '¡COPIADO!' : 'COPIAR TEXTO'}</span>
                        </button>

                        {onSendToExtractor && (
                          <button
                            className="msg-btn extractor-btn"
                            onClick={() => onSendToExtractor(msg.text)}
                            title="Extraer URLs dentro de este texto usando URL-Miner"
                          >
                            <ArrowRight size={14} />
                            <span>MANDAR A EXTRACTOR</span>
                          </button>
                        )}

                        <button
                          className="msg-btn delete-btn"
                          onClick={() => setMessages(prev => prev.filter(m => m.id !== msg.id))}
                          title="Quitar de mi pantalla"
                        >
                          <Trash2 size={14} />
                        </button>
                      </div>
                    </div>
                  );
                })}
                <div ref={messagesEndRef} />
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
