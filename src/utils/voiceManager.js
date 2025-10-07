const { getVoiceConnection, joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const logger = require('./logger');

// Map<guildId, { interval: NodeJS.Timeout, channelId: string, adapterCreator: any }>
const keepAliveMap = new Map();

async function attemptRejoin(guildId) {
  const entry = keepAliveMap.get(guildId);
  if (!entry) return;
  const { channelId, adapterCreator } = entry;
  try {
    const newConn = joinVoiceChannel({ channelId, guildId, adapterCreator });
    try {
      await entersState(newConn, VoiceConnectionStatus.Ready, 30_000);
      logger.info('voiceManager: rejoined voice channel', { guildId, channelId });
    } catch (err) {
      logger.error('voiceManager: rejoin attempt failed', { guildId, error: err.message });
    }
  } catch (err) {
    logger.error('voiceManager: failed to create new connection', { guildId, error: err.message });
  }
}

function startKeepAlive(guildId, channelId, adapterCreator) {
  if (keepAliveMap.has(guildId)) return;

  const interval = setInterval(async () => {
    try {
      const conn = getVoiceConnection(guildId);
      const status = conn?.state?.status;
      if (!conn || status !== VoiceConnectionStatus.Ready) {
        logger.warn('voiceManager: connection not ready, attempting rejoin', { guildId, status });
        await attemptRejoin(guildId);
      }
    } catch (err) {
      logger.error('voiceManager: keep-alive interval error', { guildId, error: err.message });
    }
  }, 30_000); // check every 30s

  keepAliveMap.set(guildId, { interval, channelId, adapterCreator });
}

function stopKeepAlive(guildId) {
  const entry = keepAliveMap.get(guildId);
  if (!entry) return;
  try {
    clearInterval(entry.interval);
  } catch (_) {}
  keepAliveMap.delete(guildId);
  logger.info('voiceManager: stopped keep-alive', { guildId });
}

module.exports = { startKeepAlive, stopKeepAlive, keepAliveMap };
