module.exports = {
  name: 'clear',
  description: 'Clear messages from channel',
  execute(message, args) {
    if (!message.member.permissions.has('MANAGE_MESSAGES')) {
      return message.reply('Anda tidak memiliki izin untuk menggunakan command ini!');
    }

    const amount = parseInt(args[0]);
    if (!amount || amount < 1 || amount > 100) {
      return message.reply('Masukkan jumlah pesan yang ingin dihapus (1-100)!');
    }

    message.channel.bulkDelete(amount + 1) // +1 to include the command message
      .then(() => {
        message.channel.send(`Berhasil menghapus ${amount} pesan!`).then(msg => {
          setTimeout(() => msg.delete(), 5000);
        });
      })
      .catch(error => {
        console.error(error);
        message.reply('Terjadi kesalahan saat menghapus pesan!');
      });
  },
};