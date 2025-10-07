const { getVoiceConnection, joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const logger = require('./logger');

// Map<guildId, { timer: NodeJS.Timeout|null, channelId: string, adapterCreator: any, retries: number, listener: Function|null }>
const keepAliveMap = new Map();

async function createAndAwaitConnection(guildId, channelId, adapterCreator) {
  try {
    const newConn = joinVoiceChannel({ channelId, guildId, adapterCreator });
    await entersState(newConn, VoiceConnectionStatus.Ready, 30_000);
    return newConn;
  } catch (err) {
    throw err;
  }
}

function scheduleReconnect(guildId) {
  const entry = keepAliveMap.get(guildId);
  if (!entry) return;

  const maxRetries = entry.maxRetries ?? 10;
  if (entry.retries >= maxRetries) {
    logger.error('voiceManager: reached max reconnect retries', { guildId, retries: entry.retries });
    return;
  }

  const backoff = Math.min(30_000, 1000 * Math.pow(2, entry.retries)); // exponential backoff capped at 30s
  entry.retries += 1;

  if (entry.timer) clearTimeout(entry.timer);
  entry.timer = setTimeout(async () => {
    try {
      logger.info('voiceManager: attempting reconnect', { guildId, attempt: entry.retries });
      const newConn = await createAndAwaitConnection(guildId, entry.channelId, entry.adapterCreator);
      logger.info('voiceManager: reconnect successful', { guildId });
      // reset retries on success
      entry.retries = 0;
    } catch (err) {
      logger.error('voiceManager: reconnect failed', { guildId, error: err.message, attempt: entry.retries });
      scheduleReconnect(guildId);
    }
  }, backoff);
}

function attachStateListener(guildId) {
  const entry = keepAliveMap.get(guildId);
  if (!entry) return;

  // remove existing listener if any
  if (entry.listener) {
    try {
      const connOld = getVoiceConnection(guildId);
      if (connOld && entry.listener) connOld.removeListener('stateChange', entry.listener);
    } catch (_) {}
  }

  const listener = (oldState, newState) => {
    try {
      logger.info('voiceManager: connection stateChange', { guildId, old: oldState.status, new: newState.status });
      if (newState.status === VoiceConnectionStatus.Disconnected || newState.status === VoiceConnectionStatus.Destroyed) {
        // try reconnect unless user explicitly stopped keepAlive
        const currentEntry = keepAliveMap.get(guildId);
        if (currentEntry) {
          scheduleReconnect(guildId);
        }
      } else if (newState.status === VoiceConnectionStatus.Ready) {
        // reset retries
        const currentEntry = keepAliveMap.get(guildId);
        if (currentEntry) currentEntry.retries = 0;
      }
    } catch (err) {
      logger.error('voiceManager: stateChange handler error', { guildId, error: err.message });
    }
  };

  const conn = getVoiceConnection(guildId);
  if (conn) conn.on('stateChange', listener);
  entry.listener = listener;
}

function startKeepAlive(guildId, channelId, adapterCreator, options = {}) {
  // If keepAlive already exists, update channel/adapter if changed
  const existing = keepAliveMap.get(guildId);
  if (existing) {
    existing.channelId = channelId;
    existing.adapterCreator = adapterCreator;
    existing.maxRetries = options.maxRetries ?? existing.maxRetries;
    // ensure listener attached
    attachStateListener(guildId);
    return;
  }

  const entry = {
    timer: null,
    channelId,
    adapterCreator,
    retries: 0,
    maxRetries: options.maxRetries ?? 10,
    listener: null,
  };

  keepAliveMap.set(guildId, entry);

  // Attach listener if connection exists now
  attachStateListener(guildId);

  // Also, if not connected, try to create connection immediately
  (async () => {
    try {
      const conn = getVoiceConnection(guildId);
      if (!conn) {
        await createAndAwaitConnection(guildId, channelId, adapterCreator);
        logger.info('voiceManager: initial connection created', { guildId });
      }
    } catch (err) {
      logger.error('voiceManager: initial connection failed, scheduling reconnect', { guildId, error: err.message });
      scheduleReconnect(guildId);
    }
  })();
}

function stopKeepAlive(guildId) {
  const entry = keepAliveMap.get(guildId);
  if (!entry) return;
  try {
    if (entry.timer) clearTimeout(entry.timer);
    const conn = getVoiceConnection(guildId);
    if (conn && entry.listener) conn.removeListener('stateChange', entry.listener);
  } catch (err) {
    logger.error('voiceManager: stopKeepAlive error', { guildId, error: err.message });
  }
  keepAliveMap.delete(guildId);
  logger.info('voiceManager: stopped keep-alive', { guildId });
}

module.exports = { startKeepAlive, stopKeepAlive, keepAliveMap };
