const { SlashCommandBuilder, PermissionFlagsBits } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('setdailymessage')
    .setDescription('Set channel untuk pesan harian otomatis')
    .addChannelOption(option =>
      option.setName('channel')
        .setDescription('Channel tempat pesan harian akan dikirim')
        .setRequired(true))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageGuild),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageGuild)) {
      logger.warn('Unauthorized daily message setup attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin untuk mengatur pesan harian!',
        flags: 64
      });
    }

    const channel = interaction.options.getChannel('channel');

    // Validate channel type
    if (channel.type !== 0) { // TEXT CHANNEL
      return interaction.reply({
        content: '❌ Channel harus berupa text channel!',
        flags: 64
      });
    }

    // Check bot permissions in the channel
    const botPermissions = channel.permissionsFor(interaction.guild.members.me);
    if (!botPermissions?.has(PermissionFlagsBits.SendMessages)) {
      return interaction.reply({
        content: `❌ Bot tidak memiliki izin untuk mengirim pesan di ${channel}!`,
        flags: 64
      });
    }

    if (!botPermissions?.has(PermissionFlagsBits.EmbedLinks)) {
      return interaction.reply({
        content: `❌ Bot tidak memiliki izin untuk mengirim embed di ${channel}!`,
        flags: 64
      });
    }

    try {
      // Update config
      const configPath = path.join(__dirname, '../../config/config.json');
      const config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      config.dailyMessageChannel = channel.id;

      fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

      // Update client config
      interaction.client.config = config;

      // Send confirmation
      const embed = {
        color: 0x00ff00,
        title: '✅ Daily Message Channel Updated!',
        description: `Pesan harian akan dikirim ke ${channel} setiap hari pukul 6:00 pagi.`,
        fields: [
          {
            name: '📍 Channel',
            value: channel.toString(),
            inline: true
          },
          {
            name: '⏰ Jadwal',
            value: 'Setiap hari pukul 06:00 WIB',
            inline: true
          },
          {
            name: '🌅 Pesan',
            value: 'Selamat pagi dengan embed yang cantik',
            inline: true
          }
        ],
        footer: {
          text: 'Daily Message System • Bot akan tetap aktif dengan pesan harian ini'
        },
        timestamp: new Date()
      };

      await interaction.reply({
        embeds: [embed],
        flags: 64
      });

      logger.info('Daily message channel updated', {
        newChannel: channel.name,
        newChannelId: channel.id,
        updatedBy: interaction.user.username,
        schedule: '6:00 AM daily'
      });

      // Send test message to confirm
      try {
        await channel.send({
          content: '🧪 **Test Daily Message System**\n\nChannel ini telah diset sebagai channel untuk pesan harian otomatis. Pesan akan dikirim setiap hari pukul 6:00 pagi.',
          embeds: [{
            color: 0xffd700,
            description: '✅ **Daily message system aktif!**\n\nBot akan mengirim pesan selamat pagi setiap hari untuk menjaga agar tetap online.',
            footer: {
              text: 'Test message • Akan dihapus dalam 30 detik'
            }
          }]
        }).then(sentMessage => {
          setTimeout(() => {
            sentMessage.delete().catch(() => {});
          }, 30000);
        });

        logger.info('Test daily message sent to new channel', {
          channel: channel.name,
          channelId: channel.id
        });
      } catch (testError) {
        logger.warn('Failed to send test message to daily channel', {
          error: testError.message,
          channel: channel.name
        });
      }

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'set_daily_message_channel',
        user: interaction.user.username,
        channel: channel.name
      });

      await interaction.reply({
        content: '❌ Terjadi kesalahan saat menyimpan konfigurasi!',
        flags: 64
      });
    }
  },
};