const logger = require('../utils/logger');

module.exports = {
  name: 'guildMemberRemove',
  execute(member) {
    // Log user leave
    logger.userLeave(member);

    const channel = member.guild.channels.cache.find(ch => ch.name === member.client.config.leaveChannel);
    if (!channel) {
      logger.warn('Leave channel not found', {
        guild: member.guild.name,
        expectedChannel: member.client.config.leaveChannel
      });
      return;
    }

    const leaveMessage = member.client.config.announcements.leave.replace('{user}', member.user.username);
    channel.send(leaveMessage)
      .then(() => {
        logger.info('Leave message sent', {
          user: member.user.username,
          channel: channel.name,
          guild: member.guild.name
        });
      })
      .catch(error => {
        logger.error('Failed to send leave message', {
          error: error.message,
          user: member.user.username,
          channel: channel.name
        });
      });
  },
};