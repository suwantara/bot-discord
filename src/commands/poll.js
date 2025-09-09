const { SlashCommandBuilder } = require('discord.js');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('poll')
    .setDescription('Create a poll with reactions')
    .addStringOption(option =>
      option.setName('question')
        .setDescription('The poll question')
        .setRequired(true)),

  async execute(interaction) {
    const question = interaction.options.getString('question');

    const pollEmbed = {
      color: 0x0099ff,
      title: '📊 Poll',
      description: question,
      footer: {
        text: `Poll oleh ${interaction.user.username}`
      }
    };

    const message = await interaction.reply({ embeds: [pollEmbed], fetchReply: true });
    await message.react('👍');
    await message.react('👎');
  },
};