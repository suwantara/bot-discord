const cron = require('node-cron');
const logger = require('../utils/logger');

module.exports = {
  name: 'dailyMessage',
  once: false,
  execute(client) {
    // Schedule daily message at 6:00 AM Asia/Makassar time
    // Cron expression: "0 6 * * *" (6 AM daily)
    // Note: node-cron uses server time, we need to adjust for timezone

    const job = cron.schedule('0 6 * * *', async () => {
      try {
        logger.info('Daily message scheduler triggered', {
          time: new Date().toISOString(),
          timezone: 'Asia/Makassar'
        });

        // Get target channel from config
        const targetChannelId = client.config.dailyMessageChannel;
        if (!targetChannelId) {
          logger.warn('Daily message channel not configured', {
            config: client.config
          });
          return;
        }

        const channel = client.channels.cache.get(targetChannelId);
        if (!channel) {
          logger.error('Daily message channel not found', {
            channelId: targetChannelId,
            availableChannels: client.channels.cache.size
          });
          return;
        }

        // Check bot permissions
        const botPermissions = channel.permissionsFor(client.user);
        if (!botPermissions?.has('SendMessages')) {
          logger.error('Bot lacks permission to send messages in daily channel', {
            channelId: targetChannelId,
            channelName: channel.name
          });
          return;
        }

        // Get current date and time
        const now = new Date();
        const jakartaTime = new Date(now.toLocaleString("en-US", {timeZone: "Asia/Jakarta"}));
        const dayNames = ['Minggu', 'Senin', 'Selasa', 'Rabu', 'Kamis', 'Jumat', 'Sabtu'];
        const monthNames = ['Januari', 'Februari', 'Maret', 'April', 'Mei', 'Juni',
                          'Juli', 'Agustus', 'September', 'Oktober', 'November', 'Desember'];

        const dayName = dayNames[jakartaTime.getDay()];
        const date = jakartaTime.getDate();
        const month = monthNames[jakartaTime.getMonth()];
        const year = jakartaTime.getFullYear();

        // Create morning greeting embed
        const embed = {
          color: 0xFFD700, // Gold color
          title: '🌅 Selamat Pagi!',
          description: `**Halo teman-teman!**\n\nSemoga hari ini penuh dengan kebahagiaan dan produktivitas! 🚀`,
          fields: [
            {
              name: '📅 Hari Ini',
              value: `${dayName}, ${date} ${month} ${year}`,
              inline: true
            },
            {
              name: '⏰ Waktu',
              value: jakartaTime.toLocaleTimeString('id-ID', {
                hour: '2-digit',
                minute: '2-digit',
                timeZone: 'Asia/Jakarta'
              }),
              inline: true
            },
            {
              name: '🤖 Status Bot',
              value: '✅ Online & Ready',
              inline: true
            }
          ],
          footer: {
            text: `${client.user.username} • Daily Message System`,
            iconURL: client.user.displayAvatarURL()
          },
          timestamp: new Date()
        };

        // Send the message
        await channel.send({
          content: '@everyone',
          embeds: [embed]
        });

        logger.info('Daily morning message sent successfully', {
          channelId: targetChannelId,
          channelName: channel.name,
          day: dayName,
          date: `${date} ${month} ${year}`,
          time: jakartaTime.toLocaleTimeString('id-ID', {
            hour: '2-digit',
            minute: '2-digit',
            timeZone: 'Asia/Jakarta'
          })
        });

      } catch (error) {
        logger.errorOccurred(error, {
          action: 'send_daily_message',
          scheduledTime: '6:00 AM Asia/Makassar'
        });
      }
    }, {
      timezone: "Asia/Makassar"
    });

    // Log scheduler initialization
    logger.info('Daily message scheduler initialized', {
      schedule: '0 6 * * *',
      timezone: 'Asia/Makassar',
      nextRun: job.nextDate().toISOString()
    });

    // Store job reference for potential cleanup
    client.dailyMessageJob = job;

    // Send immediate test message (optional - remove in production)
    // Uncomment the following lines to test immediately:
    /*
    setTimeout(async () => {
      try {
        const testChannel = client.channels.cache.get(client.config.dailyMessageChannel);
        if (testChannel) {
          await testChannel.send('🧪 **Test Daily Message System**\n\nDaily message scheduler is now active! Messages will be sent every day at 6:00 AM.');
          logger.info('Test daily message sent');
        }
      } catch (error) {
        logger.error('Failed to send test daily message', { error: error.message });
      }
    }, 5000); // Send test message after 5 seconds
    */
  },
};