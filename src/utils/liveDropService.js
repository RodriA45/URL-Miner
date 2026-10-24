/**
 * URL-Miner // Live Drop Service (Ephemeral Real-Time Text Transfer)
 * No account, zero configuration, works instantly across PC and Mobile.
 */

const NTFY_BASE = 'https://ntfy.sh';

export function sanitizeRoomCode(code) {
  if (!code) return '';
  return code.trim().toUpperCase().replace(/[^A-Z0-9_-]/g, '');
}

export function generateRoomCode() {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ';
  const prefix = Array.from({ length: 4 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  const suffix = Math.floor(100 + Math.random() * 900);
  return `${prefix}-${suffix}`;
}

export function getTopicName(roomCode) {
  const sanitized = sanitizeRoomCode(roomCode).toLowerCase();
  return `urlminer_room_${sanitized}`;
}

/**
 * Send an ephemeral message to a room
 */
export async function sendDropMessage(roomCode, { text, sender = 'Dispositivo', ttlMinutes = 15 }) {
  const code = sanitizeRoomCode(roomCode);
  if (!code) throw new Error('Código de sala no válido');
  if (!text || !text.trim()) throw new Error('El mensaje no puede estar vacío');

  const topic = getTopicName(code);
  const now = Date.now();
  const expiresAt = now + ttlMinutes * 60 * 1000;

  const payload = {
    id: 'msg-' + now + '-' + Math.random().toString(36).substring(2, 7),
    type: 'TEXT_MESSAGE',
    text: text.trim(),
    sender,
    timestamp: now,
    expiresAt,
    ttlMinutes
  };

  const response = await fetch(`${NTFY_BASE}/${topic}`, {
    method: 'POST',
    headers: {
      'Title': `URL-Miner Drop [${code}]`,
      'Priority': 'default',
      'Tags': 'speech_balloon'
    },
    body: JSON.stringify(payload)
  });

  if (!response.ok) {
    throw new Error(`Error en el servidor de enlace (HTTP ${response.status})`);
  }

  return payload;
}

/**
 * Fetch existing room messages (within the last 12 hours)
 */
export async function fetchDropHistory(roomCode) {
  const code = sanitizeRoomCode(roomCode);
  if (!code) return [];

  const topic = getTopicName(code);
  try {
    const response = await fetch(`${NTFY_BASE}/${topic}/json?poll=1`);
    if (!response.ok) return [];

    const rawText = await response.text();
    const lines = rawText.trim().split('\n').filter(Boolean);
    const messages = [];
    let lastPurgeTimestamp = 0;

    for (const line of lines) {
      try {
        const item = JSON.parse(line);
        if (item.event === 'message' && item.message) {
          let payload;
          try {
            payload = JSON.parse(item.message);
          } catch {
            payload = {
              id: item.id,
              type: 'TEXT_MESSAGE',
              text: item.message,
              sender: 'Dispositivo',
              timestamp: item.time * 1000,
              expiresAt: (item.time * 1000) + (15 * 60 * 1000),
              ttlMinutes: 15
            };
          }

          if (payload.type === 'PURGE_ROOM') {
            if (payload.timestamp > lastPurgeTimestamp) {
              lastPurgeTimestamp = payload.timestamp;
            }
          } else if (payload.type === 'TEXT_MESSAGE') {
            messages.push(payload);
          }
        }
      } catch {
        // Ignore malformed individual lines
      }
    }

    const now = Date.now();
    // Filter messages: must be after last purge AND not yet expired
    return messages.filter(msg => {
      const isNotPurged = msg.timestamp > lastPurgeTimestamp;
      const isNotExpired = !msg.expiresAt || msg.expiresAt > now;
      return isNotPurged && isNotExpired;
    });
  } catch (err) {
    console.error('Error fetching drop history:', err);
    return [];
  }
}

/**
 * Subscribe to real-time events via Server-Sent Events (SSE)
 */
export function subscribeToRoom(roomCode, onMessage, onPurge, onError) {
  const code = sanitizeRoomCode(roomCode);
  if (!code) return () => {};

  const topic = getTopicName(code);
  const sseUrl = `${NTFY_BASE}/${topic}/sse`;
  let eventSource = null;
  let isClosed = false;

  function connect() {
    if (isClosed) return;
    try {
      eventSource = new EventSource(sseUrl);

      eventSource.onmessage = (event) => {
        try {
          const item = JSON.parse(event.data);
          if (item.event === 'message' && item.message) {
            let payload;
            try {
              payload = JSON.parse(item.message);
            } catch {
              payload = {
                id: item.id,
                type: 'TEXT_MESSAGE',
                text: item.message,
                sender: 'Dispositivo',
                timestamp: item.time * 1000,
                expiresAt: (item.time * 1000) + (15 * 60 * 1000),
                ttlMinutes: 15
              };
            }

            if (payload.type === 'PURGE_ROOM') {
              if (typeof onPurge === 'function') {
                onPurge(payload.timestamp);
              }
            } else if (payload.type === 'TEXT_MESSAGE') {
              if (typeof onMessage === 'function') {
                onMessage(payload);
              }
            }
          }
        } catch (err) {
          console.error('Error parsing SSE event:', err);
        }
      };

      eventSource.onerror = (err) => {
        if (typeof onError === 'function') {
          onError(err);
        }
      };
    } catch (e) {
      if (typeof onError === 'function') {
        onError(e);
      }
    }
  }

  connect();

  // Return unsubscribe cleanup function
  return () => {
    isClosed = true;
    if (eventSource) {
      eventSource.close();
      eventSource = null;
    }
  };
}

/**
 * Broadcast a purge signal to clear the room immediately on all connected devices
 */
export async function purgeRoom(roomCode) {
  const code = sanitizeRoomCode(roomCode);
  if (!code) return;

  const topic = getTopicName(code);
  const payload = {
    type: 'PURGE_ROOM',
    timestamp: Date.now()
  };

  await fetch(`${NTFY_BASE}/${topic}`, {
    method: 'POST',
    headers: {
      'Title': `URL-Miner [${code}] Purge`,
      'Priority': 'high',
      'Tags': 'warning,wastebasket'
    },
    body: JSON.stringify(payload)
  });
}
