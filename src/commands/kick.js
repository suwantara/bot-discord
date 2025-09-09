module.exports = {
  name: 'kick',
  description: 'Kick a user from the server',
  execute(message, args) {
    if (!message.member.permissions.has('KICK_MEMBERS')) {
      return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
    }

    const user = message.mentions.users.first();
    if (!user) return message.reply('Tag user yang ingin dikick!');

    const member = message.guild.members.cache.get(user.id);
    if (!member) return message.reply('User tidak ditemukan di server ini!');

    if (!member.kickable) return message.reply('Bot tidak dapat mengkick user ini!');

    const reason = args.slice(1).join(' ') || 'Tidak ada alasan';

    member.kick(reason)
      .then(() => {
        message.channel.send(`${user.username} telah dikick dari server. Alasan: ${reason}`);
      })
      .catch(error => {
        console.error(error);
        message.reply('Terjadi kesalahan saat mengkick user!');
      });
  },
};