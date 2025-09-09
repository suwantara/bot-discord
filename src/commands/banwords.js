const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('banwords')
    .setDescription('Manage banned words (add, list, remove)')
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a banned word')
        .addStringOption(option =>
          option.setName('word')
            .setDescription('Word to ban')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a banned word')
        .addStringOption(option =>
          option.setName('word')
            .setDescription('Word to remove')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('list')
        .setDescription('List all banned words'))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageMessages),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageMessages)) {
      logger.warn('Unauthorized banwords management attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin untuk mengelola banned words!',
        flags: 64
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '../../config/config.json');

    try {
      let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (subcommand === 'add') {
        const word = interaction.options.getString('word').toLowerCase().trim();

        if (!config.banWords) config.banWords = [];
        if (config.banWords.includes(word)) {
          return interaction.reply({
            content: `❌ Kata "${word}" sudah ada dalam daftar banned words!`,
            flags: 64
          });
        }

        config.banWords.push(word);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        logger.info('Banned word added', {
          word,
          addedBy: interaction.user.username,
          totalWords: config.banWords.length
        });

        await interaction.reply({
          content: `✅ Kata "${word}" berhasil ditambahkan ke banned words!\n📊 Total banned words: ${config.banWords.length}`,
          flags: 64
        });

      } else if (subcommand === 'remove') {
        const word = interaction.options.getString('word').toLowerCase().trim();

        if (!config.banWords || !config.banWords.includes(word)) {
          return interaction.reply({
            content: `❌ Kata "${word}" tidak ditemukan dalam daftar banned words!`,
            flags: 64
          });
        }

        config.banWords = config.banWords.filter(w => w !== word);
        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        logger.info('Banned word removed', {
          word,
          removedBy: interaction.user.username,
          totalWords: config.banWords.length
        });

        await interaction.reply({
          content: `✅ Kata "${word}" berhasil dihapus dari banned words!\n📊 Total banned words: ${config.banWords.length}`,
          flags: 64
        });

      } else if (subcommand === 'list') {
        const banWords = config.banWords || [];

        if (banWords.length === 0) {
          return interaction.reply({
            content: '📝 Tidak ada banned words yang terdaftar.',
            flags: 64
          });
        }

        const embed = {
          color: 0xffa500,
          title: '🚫 Banned Words List',
          description: banWords.map((word, index) => `\`${index + 1}.\` ${word}`).join('\n'),
          footer: {
            text: `Total: ${banWords.length} words`
          },
          timestamp: new Date()
        };

        await interaction.reply({ embeds: [embed], flags: 64 });

        logger.info('Banned words list viewed', {
          viewedBy: interaction.user.username,
          totalWords: banWords.length
        });
      }

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'banwords_management',
        subcommand,
        user: interaction.user.username
      });
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat mengelola banned words!',
        flags: 64
      });
    }
  },
};