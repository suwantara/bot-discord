module.exports = {
  name: 'messageReactionRemove',
  execute(reaction, user) {
    if (user.bot) return;

    const reactionRoles = reaction.message.client.config.reactionRoles;
    const messageId = reaction.message.id;

    if (reactionRoles[messageId] && reactionRoles[messageId][reaction.emoji.name]) {
      const roleId = reactionRoles[messageId][reaction.emoji.name];
      const role = reaction.message.guild.roles.cache.get(roleId);
      const member = reaction.message.guild.members.cache.get(user.id);

      if (role && member) {
        member.roles.remove(role)
          .catch(console.error);
      }
    }
  },
};