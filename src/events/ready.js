const logger = require('../utils/logger');

module.exports = {
  name: 'clientReady',
  once: true,
  execute(client) {
    console.log(`Bot ${client.user.tag} telah online!`);
    client.user.setActivity('Moderating server', { type: 'WATCHING' });

    logger.info('Bot is now online and ready', {
      bot: `${client.user.tag} (${client.user.id})`,
      guilds: client.guilds.cache.size,
      commands: client.commands.size
    });
  },
};