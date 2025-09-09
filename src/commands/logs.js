const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('logs')
    .setDescription('View recent bot logs')
    .addIntegerOption(option =>
      option.setName('lines')
        .setDescription('Number of log lines to show (max 20)')
        .setRequired(false)
        .setMinValue(1)
        .setMaxValue(20))
    .setDefaultMemberPermissions(PermissionFlagsBits.Administrator),

  async execute(interaction) {
    // Check if user has Administrator permission
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.Administrator)) {
      logger.warn('Unauthorized logs access attempt', {
        user: interaction.user.username,
        userId: interaction.user.id,
        guild: interaction.guild?.name
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin Administrator untuk melihat logs!',
        flags: 64 // Ephemeral flag
      });
    }

    const lines = interaction.options.getInteger('lines') || 10;
    const logsDir = path.join(__dirname, '../../logs');
    const today = new Date().toISOString().split('T')[0];
    const logFile = path.join(logsDir, `${today}.log`);

    try {
      if (!fs.existsSync(logFile)) {
        return interaction.reply({
          content: '📝 Belum ada logs untuk hari ini.',
          flags: 64
        });
      }

      const logContent = fs.readFileSync(logFile, 'utf8');
      const logLines = logContent.trim().split('\n').filter(line => line.trim());

      if (logLines.length === 0) {
        return interaction.reply({
          content: '📝 Logs kosong untuk hari ini.',
          flags: 64
        });
      }

      // Get last N lines
      const recentLogs = logLines.slice(-lines);
      const formattedLogs = recentLogs.map((line, index) => {
        try {
          const parsed = JSON.parse(line);
          return `\`${index + 1}.\` **[${parsed.level}]** ${parsed.message}`;
        } catch {
          return `\`${index + 1}.\` ${line}`;
        }
      }).join('\n');

      const embed = {
        color: 0x0099ff,
        title: '📋 Recent Bot Logs',
        description: formattedLogs.length > 4000 ? formattedLogs.substring(0, 4000) + '...' : formattedLogs,
        footer: {
          text: `Showing last ${lines} log entries`
        },
        timestamp: new Date()
      };

      await interaction.reply({ embeds: [embed], flags: 64 });

      logger.info('Logs accessed by administrator', {
        user: interaction.user.username,
        linesRequested: lines
      });

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'logs_access',
        user: interaction.user.username
      });
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat mengambil logs.',
        flags: 64
      });
    }
  },
};