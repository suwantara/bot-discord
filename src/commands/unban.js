const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('unban')
    .setDescription('Unban a user from the server')
    .addStringOption(option =>
      option.setName('userid')
        .setDescription('User ID to unban')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for unban')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.BanMembers),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.BanMembers)) {
      logger.warn('Unauthorized unban attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin untuk menggunakan command ini!',
        flags: 64
      });
    }

    const userId = interaction.options.getString('userid');
    const reason = interaction.options.getString('reason') || 'Tidak ada alasan';

    try {
      // Fetch ban list to check if user is banned
      const banList = await interaction.guild.bans.fetch();
      const bannedUser = banList.get(userId);

      if (!bannedUser) {
        return interaction.reply({
          content: '❌ User tersebut tidak dalam daftar banned!',
          flags: 64
        });
      }

      await interaction.guild.bans.remove(userId, reason);

      logger.moderationAction('unban', interaction.user, bannedUser.user, reason);

      const embed = {
        color: 0x00ff00,
        title: '✅ User Diunban',
        fields: [
          {
            name: 'User',
            value: `${bannedUser.user.username}#${bannedUser.user.discriminator}`,
            inline: true
          },
          {
            name: 'Moderator',
            value: interaction.user.username,
            inline: true
          },
          {
            name: 'Alasan',
            value: reason,
            inline: false
          }
        ],
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed] });

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'unban',
        user: interaction.user.username,
        targetId: userId
      });
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat mengunban user!',
        flags: 64
      });
    }
  },
};