require('dotenv').config();
const { Client, GatewayIntentBits, Collection } = require('discord.js');
const fs = require('fs');
const path = require('path');
const express = require('express');
const logger = require('./src/utils/logger');

const client = new Client({
  intents: [
    GatewayIntentBits.Guilds,
    GatewayIntentBits.GuildMessages,
    GatewayIntentBits.MessageContent,
    GatewayIntentBits.GuildMembers,
    GatewayIntentBits.GuildMessageReactions,
  ],
});

client.commands = new Collection();
client.config = require('./config/config.json');

// Load commands
const commandsPath = path.join(__dirname, 'src/commands');
const commandFiles = fs.readdirSync(commandsPath).filter(file => file.endsWith('.js'));

for (const file of commandFiles) {
  const filePath = path.join(commandsPath, file);
  const command = require(filePath);

  // Support both slash commands and prefix commands
  if (command.data) {
    // Slash command
    client.commands.set(command.data.name, command);
  } else if (command.name) {
    // Prefix command
    client.commands.set(command.name, command);
  }
}

// Load events
const eventsPath = path.join(__dirname, 'src/events');
const eventFiles = fs.readdirSync(eventsPath).filter(file => file.endsWith('.js'));

for (const file of eventFiles) {
  const filePath = path.join(eventsPath, file);
  const event = require(filePath);
  if (event.once) {
    client.once(event.name, (...args) => event.execute(...args));
  } else {
    client.on(event.name, (...args) => event.execute(...args));
  }
}

// Express server for dashboard
const app = express();
app.use(express.json());
app.use(express.static('public'));

app.get('/', (req, res) => {
  res.sendFile(path.join(__dirname, 'public', 'index.html'));
});

app.get('/api/config', (req, res) => {
  res.json(client.config);
});

app.post('/api/config', (req, res) => {
  const newConfig = req.body;
  // Preserve existing reactionRoles if not provided
  if (!newConfig.reactionRoles) {
    newConfig.reactionRoles = client.config.reactionRoles || {};
  }
  fs.writeFileSync('./config/config.json', JSON.stringify(newConfig, null, 2));
  client.config = newConfig;
  res.json({ success: true });
});

// Test daily message endpoint
app.post('/api/test-daily-message', async (req, res) => {
  try {
    const targetChannelId = client.config.dailyMessageChannel;
    if (!targetChannelId) {
      return res.status(400).json({ error: 'Daily message channel not configured' });
    }

    const channel = client.channels.cache.get(targetChannelId);
    if (!channel) {
      return res.status(404).json({ error: 'Daily message channel not found' });
    }

    // Check bot permissions
    const botPermissions = channel.permissionsFor(client.user);
    if (!botPermissions?.has('SendMessages') || !botPermissions?.has('EmbedLinks')) {
      return res.status(403).json({ error: 'Bot lacks required permissions in the channel' });
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

    // Create test daily message embed
    const embed = {
      color: 0xFFD700, // Gold color
      title: '🧪 Test Daily Message',
      description: `**Halo teman-teman!**\n\nIni adalah pesan test untuk Daily Message System! 🚀`,
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
          value: '✅ Online & Testing',
          inline: true
        }
      ],
      footer: {
        text: `${client.user.username} • Daily Message System Test`,
        iconURL: client.user.displayAvatarURL()
      },
      timestamp: new Date()
    };

    // Send test message
    await channel.send({
      content: '@everyone **[TEST MESSAGE]**',
      embeds: [embed]
    });

    logger.info('Test daily message sent via API', {
      channel: channel.name,
      requestedBy: 'Dashboard User'
    });

    res.json({ success: true, message: 'Test daily message sent successfully' });

  } catch (error) {
    logger.errorOccurred(error, {
      action: 'test_daily_message_api',
      endpoint: '/api/test-daily-message'
    });

    res.status(500).json({
      error: 'Failed to send test daily message',
      details: error.message
    });
  }
});

app.get('/api/logs', (req, res) => {
  const lines = parseInt(req.query.lines) || 20;
  const level = req.query.level || 'all';
  const logsDir = path.join(__dirname, 'logs');
  const today = new Date().toISOString().split('T')[0];
  const logFile = path.join(logsDir, `${today}.log`);

  try {
    if (!fs.existsSync(logFile)) {
      return res.json({ logs: 'No logs available for today.' });
    }

    const logContent = fs.readFileSync(logFile, 'utf8');
    let logLines = logContent.trim().split('\n').filter(line => line.trim());

    // Filter by level if specified
    if (level !== 'all') {
      logLines = logLines.filter(line => {
        try {
          const parsed = JSON.parse(line);
          return parsed.level === level;
        } catch {
          return false;
        }
      });
    }

    // Get last N lines
    const recentLogs = logLines.slice(-lines);
    const formattedLogs = recentLogs.map((line, index) => {
      try {
        const parsed = JSON.parse(line);
        const timestamp = new Date(parsed.timestamp).toLocaleString('id-ID');
        return `[${timestamp}] ${parsed.level}: ${parsed.message}`;
      } catch {
        return `[${index + 1}] ${line}`;
      }
    }).join('\n');

    res.json({ logs: formattedLogs || 'No logs found.' });
  } catch (error) {
    console.error('Error reading logs:', error);
    res.status(500).json({ error: 'Failed to read logs' });
  }
});

app.get('/api/stats', (req, res) => {
  try {
    const guild = client.guilds.cache.first(); // Get first guild for demo
    if (!guild) {
      return res.json({
        totalMembers: 0,
        bannedUsers: 0,
        activeWarnings: 0
      });
    }

    // This is a simplified version - in production you'd track these in database
    res.json({
      totalMembers: guild.memberCount,
      bannedUsers: 0, // Would need to fetch bans
      activeWarnings: 0 // Would need to track warnings
    });
  } catch (error) {
    console.error('Error getting stats:', error);
    res.status(500).json({ error: 'Failed to get stats' });
  }
});

app.listen(process.env.PORT || 3000, () => {
  console.log('Dashboard running on port', process.env.PORT || 3000);
});

client.login(process.env.DISCORD_TOKEN);