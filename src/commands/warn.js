const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('warn')
    .setDescription('Warn a user with a custom message')
    .addUserOption(option =>
      option.setName('user')
        .setDescription('User to warn')
        .setRequired(true))
    .addStringOption(option =>
      option.setName('reason')
        .setDescription('Reason for warning')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('dm_user')
        .setDescription('Send warning via DM')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      logger.warn('Unauthorized warn attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin untuk memberikan warning!',
        flags: 64
      });
    }

    const targetUser = interaction.options.getUser('user');
    const reason = interaction.options.getString('reason');
    const sendDM = interaction.options.getBoolean('dm_user') || false;

    if (targetUser.id === interaction.user.id) {
      return interaction.reply({
        content: '❌ Anda tidak dapat memberikan warning kepada diri sendiri!',
        flags: 64
      });
    }

    if (targetUser.id === interaction.client.user.id) {
      return interaction.reply({
        content: '❌ Anda tidak dapat memberikan warning kepada bot!',
        flags: 64
      });
    }

    const member = interaction.guild.members.cache.get(targetUser.id);
    if (!member) {
      return interaction.reply({
        content: '❌ User tidak ditemukan di server ini!',
        flags: 64
      });
    }

    try {
      // Create warning embed
      const warnEmbed = {
        color: 0xffa500,
        title: '⚠️ Warning Issued',
        fields: [
          {
            name: '👤 User',
            value: `${targetUser.username}#${targetUser.discriminator}`,
            inline: true
          },
          {
            name: '🛡️ Moderator',
            value: interaction.user.username,
            inline: true
          },
          {
            name: '📝 Reason',
            value: reason,
            inline: false
          },
          {
            name: '📅 Date',
            value: new Date().toLocaleString('id-ID'),
            inline: true
          }
        ],
        footer: {
          text: 'Please follow server rules to avoid further actions'
        },
        timestamp: new Date()
      };

      // Send warning in channel
      await interaction.reply({ embeds: [warnEmbed] });

      // Send DM to user if requested
      if (sendDM) {
        try {
          const dmEmbed = {
            color: 0xffa500,
            title: `⚠️ Warning from ${interaction.guild.name}`,
            description: `You have received a warning for: **${reason}**`,
            fields: [
              {
                name: '🛡️ Moderator',
                value: interaction.user.username,
                inline: true
              },
              {
                name: '📅 Date',
                value: new Date().toLocaleString('id-ID'),
                inline: true
              }
            ],
            footer: {
              text: 'Please follow server rules'
            },
            timestamp: new Date()
          };

          await targetUser.send({ embeds: [dmEmbed] });

          await interaction.followUp({
            content: '✅ Warning berhasil dikirim via DM!',
            flags: 64
          });
        } catch (error) {
          await interaction.followUp({
            content: '⚠️ Warning dikirim di channel, tetapi tidak dapat mengirim DM (user mungkin menutup DM).',
            flags: 64
          });
        }
      }

      // Log the warning
      logger.moderationAction('warn', interaction.user, targetUser, reason);

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'warn',
        user: interaction.user.username,
        target: targetUser.username,
        reason
      });
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat memberikan warning!',
        flags: 64
      });
    }
  },
};