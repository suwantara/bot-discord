const { SlashCommandBuilder, PermissionFlagsBits, ActionRowBuilder, ButtonBuilder, ButtonStyle } = require('discord.js');
const fs = require('fs');
const path = require('path');
const logger = require('../utils/logger');

module.exports = {
  data: new SlashCommandBuilder()
    .setName('reactionroles')
    .setDescription('Create advanced reaction role system')
    .addSubcommand(subcommand =>
      subcommand
        .setName('create')
        .setDescription('Create a reaction role message')
        .addStringOption(option =>
          option.setName('title')
            .setDescription('Title of the reaction role message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('description')
            .setDescription('Description of the reaction role message')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('add')
        .setDescription('Add a role to reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Message ID of the reaction role message')
            .setRequired(true))
        .addRoleOption(option =>
          option.setName('role')
            .setDescription('Role to add')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji for the role')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('label')
            .setDescription('Label for the button')
            .setRequired(true)))
    .addSubcommand(subcommand =>
      subcommand
        .setName('remove')
        .setDescription('Remove a role from reaction role message')
        .addStringOption(option =>
          option.setName('message_id')
            .setDescription('Message ID of the reaction role message')
            .setRequired(true))
        .addStringOption(option =>
          option.setName('emoji')
            .setDescription('Emoji of the role to remove')
            .setRequired(true)))
    .setDefaultMemberPermissions(PermissionFlagsBits.ManageRoles),

  async execute(interaction) {
    if (!interaction.memberPermissions?.has(PermissionFlagsBits.ManageRoles)) {
      logger.warn('Unauthorized reaction roles management attempt', {
        user: interaction.user.username,
        userId: interaction.user.id
      });
      return interaction.reply({
        content: '❌ Anda tidak memiliki izin untuk mengelola reaction roles!',
        flags: 64
      });
    }

    const subcommand = interaction.options.getSubcommand();
    const configPath = path.join(__dirname, '../../config/config.json');

    try {
      let config = JSON.parse(fs.readFileSync(configPath, 'utf8'));

      if (subcommand === 'create') {
        const title = interaction.options.getString('title');
        const description = interaction.options.getString('description');

        const embed = {
          color: 0x0099ff,
          title: title,
          description: description,
          footer: {
            text: 'Click buttons below to get roles!'
          },
          timestamp: new Date()
        };

        const row = new ActionRowBuilder()
          .addComponents(
            new ButtonBuilder()
              .setCustomId('reaction_role_placeholder')
              .setLabel('Roles will be added here')
              .setStyle(ButtonStyle.Secondary)
              .setDisabled(true)
          );

        const message = await interaction.reply({
          embeds: [embed],
          components: [row],
          fetchReply: true
        });

        // Initialize reaction roles for this message
        if (!config.reactionRoles) config.reactionRoles = {};
        config.reactionRoles[message.id] = {};

        fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

        logger.info('Reaction role message created', {
          messageId: message.id,
          title,
          createdBy: interaction.user.username
        });

        await interaction.followUp({
          content: `✅ Reaction role message berhasil dibuat!\n📝 Message ID: \`${message.id}\`\n\nGunakan \`/reactionroles add\` untuk menambahkan roles.`,
          flags: 64
        });

      } else if (subcommand === 'add') {
        const messageId = interaction.options.getString('message_id');
        const role = interaction.options.getRole('role');
        const emoji = interaction.options.getString('emoji');
        const label = interaction.options.getString('label');

        if (!config.reactionRoles?.[messageId]) {
          return interaction.reply({
            content: '❌ Message ID tidak ditemukan dalam reaction roles!',
            flags: 64
          });
        }

        // Update the message with new button
        try {
          const message = await interaction.channel.messages.fetch(messageId);
          const embed = message.embeds[0];

          // Create new row with existing buttons + new button
          const existingComponents = message.components[0]?.components || [];
          const newComponents = existingComponents.filter(comp => comp.customId !== 'reaction_role_placeholder');

          newComponents.push(
            new ButtonBuilder()
              .setCustomId(`reaction_role_${role.id}_${emoji}`)
              .setLabel(`${emoji} ${label}`)
              .setStyle(ButtonStyle.Primary)
          );

          const row = new ActionRowBuilder().addComponents(...newComponents);

          await message.edit({
            embeds: [embed],
            components: [row]
          });

          // Save to config
          config.reactionRoles[messageId][emoji] = role.id;
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          logger.info('Role added to reaction roles', {
            messageId,
            role: role.name,
            emoji,
            label,
            addedBy: interaction.user.username
          });

          await interaction.reply({
            content: `✅ Role "${role.name}" berhasil ditambahkan dengan emoji ${emoji}!`,
            flags: 64
          });

        } catch (error) {
          return interaction.reply({
            content: '❌ Tidak dapat menemukan message dengan ID tersebut!',
            flags: 64
          });
        }

      } else if (subcommand === 'remove') {
        const messageId = interaction.options.getString('message_id');
        const emoji = interaction.options.getString('emoji');

        if (!config.reactionRoles?.[messageId]?.[emoji]) {
          return interaction.reply({
            content: `❌ Emoji ${emoji} tidak ditemukan dalam reaction roles message tersebut!`,
            flags: 64
          });
        }

        try {
          const message = await interaction.channel.messages.fetch(messageId);
          const embed = message.embeds[0];

          // Remove the button
          const existingComponents = message.components[0]?.components || [];
          const newComponents = existingComponents.filter(comp =>
            !comp.customId?.includes(`reaction_role_`) ||
            !comp.customId?.includes(emoji)
          );

          if (newComponents.length === 0) {
            newComponents.push(
              new ButtonBuilder()
                .setCustomId('reaction_role_placeholder')
                .setLabel('Roles will be added here')
                .setStyle(ButtonStyle.Secondary)
                .setDisabled(true)
            );
          }

          const row = new ActionRowBuilder().addComponents(...newComponents);

          await message.edit({
            embeds: [embed],
            components: [row]
          });

          // Remove from config
          delete config.reactionRoles[messageId][emoji];
          fs.writeFileSync(configPath, JSON.stringify(config, null, 2));

          logger.info('Role removed from reaction roles', {
            messageId,
            emoji,
            removedBy: interaction.user.username
          });

          await interaction.reply({
            content: `✅ Role dengan emoji ${emoji} berhasil dihapus!`,
            flags: 64
          });

        } catch (error) {
          return interaction.reply({
            content: '❌ Tidak dapat menemukan message dengan ID tersebut!',
            flags: 64
          });
        }
      }

    } catch (error) {
      logger.errorOccurred(error, {
        action: 'reaction_roles_management',
        subcommand,
        user: interaction.user.username
      });
      await interaction.reply({
        content: '❌ Terjadi kesalahan saat mengelola reaction roles!',
        flags: 64
      });
    }
  },
};