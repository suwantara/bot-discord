const logger = require('../utils/logger');

module.exports = {
  name: 'messageCreate',
  async execute(message) {
    if (message.author.bot) return;

    // Check for banned words
    const bannedWords = message.client.config.banWords;
    const messageContent = message.content.toLowerCase();
    for (const word of bannedWords) {
      if (messageContent.includes(word.toLowerCase())) {
        // Delete the message
        message.delete()
          .then(() => {
            logger.messageDeleted(message, 'Auto-moderation: banned word detected');
          })
          .catch(error => {
            logger.error('Failed to delete message with banned word', {
              error: error.message,
              messageId: message.id
            });
          });

        // Send direct reply warning that auto-deletes
        try {
          const warningMessage = await message.channel.send({
            content: `${message.author}, pesan Anda mengandung kata **"${word}"** yang dilarang dan telah dihapus.\n\n💡 **Saran:** Silakan kirim ulang pesan Anda tanpa kata tersebut.`,
            reply: {
              messageReference: message.id,
              failIfNotExists: false
            }
          });

          // Auto-delete warning message after 15 seconds
          setTimeout(() => {
            warningMessage.delete().catch(() => {
              logger.debug('Warning message already deleted', {
                messageId: warningMessage.id,
                channel: message.channel.name
              });
            });
          }, 15000);

          logger.info('Auto-moderation warning sent with auto-delete', {
            user: message.author.username,
            userId: message.author.id,
            channel: message.channel.name,
            bannedWord: word,
            warningMessageId: warningMessage.id
          });
        } catch (error) {
          logger.error('Failed to send auto-moderation warning', {
            error: error.message,
            user: message.author.username,
            channel: message.channel.name,
            bannedWord: word
          });
        }

        return;
      }
    }

    const prefix = message.client.config.prefix;
    if (!message.content.startsWith(prefix)) return;

    const args = message.content.slice(prefix.length).trim().split(/ +/);
    const commandName = args.shift().toLowerCase();

    const command = message.client.commands.get(commandName);
    if (!command) {
      logger.warn('Unknown command attempted', {
        command: commandName,
        user: message.author.username,
        channel: message.channel.name
      });
      return;
    }

    try {
      // Log command usage
      logger.commandUsed(commandName, message.author, message.guild, 'prefix');

      command.execute(message, args);
    } catch (error) {
      logger.errorOccurred(error, {
        command: commandName,
        user: message.author.username,
        channel: message.channel.name
      });
      message.reply('Terjadi kesalahan saat menjalankan command!');
    }
  },
};