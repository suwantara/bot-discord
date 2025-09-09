const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('mentionall')
    .setDescription('Mention all users in the server (Admin only)')
    .addStringOption(option =>
      option.setName('message')
        .setDescription('Message to send with mentions')
        .setRequired(true))
    .addBooleanOption(option =>
      option.setName('include_bots')
        .setDescription('Include bots in mentions')
        .setRequired(false))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      logger.warn('Unauthorized mentionall attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin Administrator untuk menggunakan command ini!',
        flags: 64
      });
    }

    const message = interaction.options.getString('message');
    const includeBots = interaction.options.getBoolean('include_bots') || false;

    try {
      await interaction.deferReply({ flags: 64 });

      // Get all members
      const members = await interaction.guild.members.fetch();
      const userMentions = [];

      for (const [memberId, member] of members) {
        // Skip bots if not included
        if (!includeBots && member.user.bot) continue;
        // Skip the command user
        if (member.id === interaction.user.id) continue;

        userMentions.push(member.toString());
      }

      // Split mentions into chunks to avoid message length limits
      const chunkSize = 50; // Mention ~50 users per message
      const chunks = [];

      for (let i = 0; i < userMentions.length; i += chunkSize) {
        chunks.push(userMentions.slice(i, i + chunkSize));
      }

      // Send first message with the announcement
      const embed = {
        color: 0xff6b6b,
        title: '📢 Important Announcement',
        description: message,
        footer: {
          text: `Sent by ${interaction.user.username} • ${chunks.length} message(s)`
        },
        timestamp: new Date()
      };

      await interaction.editReply({ embeds: [embed] });

      // Send mention chunks
      for (let i = 0; i < chunks.length; i++) {
        const chunk = chunks[i];
        const mentionText = chunk.join(' ');

        const mentionEmbed = {
          color: 0xff6b6b,
          description: mentionText,
          footer: {
            text: `Part ${i + 1}/${chunks.length}`
          }
        };

        await interaction.followUp({ embeds: [mentionEmbed] });

        // Small delay to avoid rate limits
        if (i < chunks.length - 1) {
          await new Promise(resolve => setTimeout(resolve, 1000));
        }
      }

      logger.info('Mention all executed', {
        executedBy: interaction.user.username,
        totalMentions: userMentions.length,
        chunks: chunks.length,
        includeBots,
        messageLength: message.length
      });

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'mention_all',
        user: interaction.user.username,
        includeBots
      });

      if (interaction.deferred) {
        await interaction.editReply({
          content: '❌ Terjadi kesalahan saat mengirim mention!',
          embeds: []
        });
      } else {
        await interaction.reply({
          content: '❌ Terjadi kesalahan saat mengirim mention!',
          flags: 64
        });
      }
    }
  },
};