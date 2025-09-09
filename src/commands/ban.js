const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ban')
    .setDescription('Ban a user from the server')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to ban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for ban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    const user = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

    if (!interaction.member.permissions.has(PermissionFlagsBits.BanMembers)) {
      logger.warn('Unauthorized ban attempt', {
        user: interaction.user.username,
        target: user.username
      });
      return interaction.reply({ content: 'Anda tidak memiliki izin untuk menggunakan command ini!', ephemeral: true });
    }

    const member = interaction.guild.members.cache.get(user.id);
    if (!member) {
      logger.warn('Ban attempt on non-existent member', {
        user: interaction.user.username,
        target: user.username
      });
      return interaction.reply({ content: 'User tidak ditemukan di server ini!', ephemeral: true });
    }

    if (!member.bannable) {
      logger.warn('Ban attempt on unbannable user', {
        user: interaction.user.username,
        target: user.username,
        reason: 'User has higher permissions'
      });
      return interaction.reply({ content: 'Bot tidak dapat membanned user ini!', ephemeral: true });
    }

    try {
      await member.ban({ reason });

      // Log moderation action
      logger.moderationAction('ban', interaction.user, user, reason);

      const banMessage = interaction.client.config.announcements.ban
        .replace('{user}', user.username)
        .replace('{reason}', reason);

      await interaction.reply(banMessage);
    } catch (error) {
      logger.errorOccurred(error, {
        action: 'ban',
        user: interaction.user.username,
        target: user.username
      });
      await interaction.reply({ content: 'Terjadi kesalahan saat membanned user!', ephemeral: true });
    }
  },
};