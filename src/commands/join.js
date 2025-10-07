const { SlashCommandBuilder } = require('discord.js');
const { joinVoiceChannel, entersState, VoiceConnectionStatus } = require('@discordjs/voice');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('join')
    .setDescription('Make the bot join your voice channel'),

  async execute(interaction) {
    const member = interaction.member;
    const voiceChannel = member && member.voice ? member.voice.channel : null;

    if (!voiceChannel) {
      await interaction.reply({ content: 'You need to be in a voice channel first.', ephemeral: true });
      return;
    }

    try {
      const connection = joinVoiceChannel({
        channelId: voiceChannel.id,
        guildId: voiceChannel.guild.id,
        adapterCreator: voiceChannel.guild.voiceAdapterCreator,
      });

      // Wait for the connection to become ready
      await entersState(connection, VoiceConnectionStatus.Ready, 30_000);

      await interaction.reply({ content: `Joined ${voiceChannel.name}`, ephemeral: false });

      logger.info('Joined voice channel', {
        user: interaction.user.username,
        channel: voiceChannel.name,
        guild: interaction.guild ? interaction.guild.name : 'DM',
      });
    } catch (error) {
      logger.error('Failed to join voice channel', { error: error.message });
      try {
        // cleanup if partially connected
        const connection = require('@discordjs/voice').getVoiceConnection(interaction.guild.id);
        if (connection) connection.destroy();
      } catch (_) {}

      await interaction.reply({ content: 'I could not join your voice channel.', ephemeral: true });
    }
  },
};
