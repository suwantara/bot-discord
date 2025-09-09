const { SlashCommandBuilder } = require('discord.js');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('ping')
    .setDescription('Test bot response'),

  async execute(interaction) {
    const startTime = Date.now();

    await interaction.reply('Pong!');

    const endTime = Date.now();
    const responseTime = endTime - startTime;

    logger.info('Ping command executed', {
      user: interaction.user.username,
      responseTime: `${responseTime}ms`,
      guild: interaction.guild ? interaction.guild.name : 'DM'
    });
  },
};