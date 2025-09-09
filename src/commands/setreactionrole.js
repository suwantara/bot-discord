module.exports = {
  name: 'setreactionrole',
  description: 'Setup reaction role for a message',
  execute(message, args) {
    if (!message.member.permissions.has('MANAGE_ROLES')) {
      return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
    }

    const emoji = args[0];
    const role = message.mentions.roles.first();
    const messageId = args[2];

    if (!emoji || !role || !messageId) {
      return message.reply('Format: -setreactionrole <emoji> <@role> <message_id>');
    }

    const config = message.client.config;
    if (!config.reactionRoles[messageId]) {
      config.reactionRoles[messageId] = {};
    }

    config.reactionRoles[messageId][emoji] = role.id;

    // Save to file
    const fs = require('fs');
    fs.writeFileSync('./config/config.json', JSON.stringify(config, null, 2));

    message.reply(`Reaction role berhasil disetup! Emoji: ${emoji}, Role: ${role.name}`);
  },
};