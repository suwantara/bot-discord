const logger = require('../utils/logger');

module.exports = {
  name: 'guildMemberAdd',
  execute(member) {
    // Log user join
    logger.userJoin(member);

    const channel = member.guild.channels.cache.find(ch => ch.name === member.client.config.welcomeChannel);
    if (!channel) {
      logger.warn('Welcome channel not found', {
        guild: member.guild.name,
        expectedChannel: member.client.config.welcomeChannel
      });
      return;
    }

    const welcomeMessage = member.client.config.announcements.welcome.replace('{user}', member.user.username);
    channel.send(welcomeMessage)
      .then(() => {
        logger.info('Welcome message sent', {
          user: member.user.username,
          channel: channel.name,
          guild: member.guild.name
        });
      })
      .catch(error => {
        logger.error('Failed to send welcome message', {
          error: error.message,
          user: member.user.username,
          channel: channel.name
        });
      });
  },
};