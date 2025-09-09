const logger = require('../utils/logger');

module.exports = {
  name: 'interactionCreate',
  async execute(interaction) {
    // Handle slash commands
    if (interaction.isChatInputCommand()) {
      const command = interaction.client.commands.get(interaction.commandName);

      if (!command) {
        logger.warn('Unknown slash command attempted', {
          command: interaction.commandName,
          user: interaction.user.username,
          guild: interaction.guild ? interaction.guild.name : 'DM'
        });
        return;
      }

      try {
        // Log slash command usage
        logger.commandUsed(interaction.commandName, interaction.user, interaction.guild, 'slash');

        await command.execute(interaction);
      } catch (error) {
        logger.errorOccurred(error, {
          command: interaction.commandName,
          user: interaction.user.username,
          guild: interaction.guild ? interaction.guild.name : 'DM',
          type: 'slash_command'
        });

        if (interaction.replied || interaction.deferred) {
          await interaction.followUp({ content: 'Terjadi kesalahan saat menjalankan command!', flags: 64 });
        } else {
          await interaction.reply({ content: 'Terjadi kesalahan saat menjalankan command!', flags: 64 });
        }
      }
    }

    // Handle button interactions for reaction roles
    else if (interaction.isButton()) {
      if (interaction.customId.startsWith('reaction_role_')) {
        const parts = interaction.customId.split('_');
        const roleId = parts[2];
        const emoji = parts[3];

        const config = interaction.client.config;
        const messageId = interaction.message.id;

        if (config.reactionRoles?.[messageId]?.[emoji] === roleId) {
          const role = interaction.guild.roles.cache.get(roleId);
          const member = interaction.guild.members.cache.get(interaction.user.id);

          if (!role || !member) {
            return interaction.reply({
              content: '❌ Role atau member tidak ditemukan!',
              flags: 64
            });
          }

          try {
            // Check if user already has the role
            if (member.roles.cache.has(roleId)) {
              // Remove role
              await member.roles.remove(role);
              await interaction.reply({
                content: `❌ Role ${role.name} telah dihapus dari Anda!`,
                flags: 64
              });

              logger.info('Role removed via reaction role', {
                user: interaction.user.username,
                role: role.name,
                emoji,
                action: 'remove'
              });
            } else {
              // Add role
              await member.roles.add(role);
              await interaction.reply({
                content: `✅ Role ${role.name} telah ditambahkan ke Anda!`,
                flags: 64
              });

              logger.info('Role added via reaction role', {
                user: interaction.user.username,
                role: role.name,
                emoji,
                action: 'add'
              });
            }
          } catch (error) {
            logger.errorOccurred(error, {
              action: 'reaction_role_toggle',
              user: interaction.user.username,
              role: role.name,
              emoji
            });

            await interaction.reply({
              content: '❌ Tidak dapat mengubah role Anda. Pastikan bot memiliki permission yang cukup!',
              flags: 64
            });
          }
        }
      }
    }
  },
};