const { SlashCommandBuilder } = require('discord.js');
const { getVoiceConnection } = require('@discordjs/voice');
const logger = require('../utils/logger');
const { stopKeepAlive } = require('../utils/voiceManager');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('leave')
    .setDescription('Make the bot leave the voice channel'),

  async execute(interaction) {
    const guild = interaction.guild;
    if (!guild) {
      await interaction.reply({ content: 'This command can only be used in a server.', ephemeral: true });
      return;
    }

    const connection = getVoiceConnection(guild.id);
    if (!connection) {
      await interaction.reply({ content: "I'm not in a voice channel.", ephemeral: true });
      return;
    }

    try {
      // Stop centralized keep-alive for this guild then destroy connection
      stopKeepAlive(guild.id);
      connection.destroy();
      await interaction.reply({ content: 'Left the voice channel.', ephemeral: false });

      logger.info('Left voice channel', {
        user: interaction.user.username,
        guild: guild.name,
      });
    } catch (error) {
      logger.error('Failed to leave voice channel', { error: error.message });
      await interaction.reply({ content: 'I could not leave the voice channel.', ephemeral: true });
    }
  },
};
