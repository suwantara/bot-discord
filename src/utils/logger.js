const fs = require('fs');
const path = require('path');

// Create logs directory if it doesn't exist
const logsDir = path.join(__dirname, '../../logs');
if (!fs.existsSync(logsDir)) {
  fs.mkdirSync(logsDir, { recursive: true });
}

class Logger {
  constructor() {
    this.logFile = path.join(logsDir, `${new Date().toISOString().split('T')[0]}.log`);
  }

  // Get current timestamp
  getTimestamp() {
    return new Date().toISOString();
  }

  // Format log message
  formatMessage(level, message, data = {}) {
    const timestamp = this.getTimestamp();
    const logEntry = {
      timestamp,
      level: level.toUpperCase(),
      message,
      ...data
    };
    return JSON.stringify(logEntry, null, 2) + '\n';
  }

  // Write to file
  writeToFile(content) {
    fs.appendFileSync(this.logFile, content);
  }

  // Log levels
  info(message, data = {}) {
    const formatted = this.formatMessage('info', message, data);
    console.log(`[INFO] ${message}`, data);
    this.writeToFile(formatted);
  }

  warn(message, data = {}) {
    const formatted = this.formatMessage('warn', message, data);
    console.warn(`[WARN] ${message}`, data);
    this.writeToFile(formatted);
  }

  error(message, data = {}) {
    const formatted = this.formatMessage('error', message, data);
    console.error(`[ERROR] ${message}`, data);
    this.writeToFile(formatted);
  }

  debug(message, data = {}) {
    const formatted = this.formatMessage('debug', message, data);
    console.debug(`[DEBUG] ${message}`, data);
    this.writeToFile(formatted);
  }

  // Specific logging methods
  commandUsed(command, user, guild, type = 'prefix') {
    this.info(`Command used: ${command}`, {
      command,
      user: `${user.username}#${user.discriminator} (${user.id})`,
      guild: guild ? `${guild.name} (${guild.id})` : 'DM',
      type,
      timestamp: this.getTimestamp()
    });
  }

  moderationAction(action, moderator, target, reason = 'No reason provided') {
    this.info(`Moderation action: ${action}`, {
      action,
      moderator: `${moderator.username}#${moderator.discriminator} (${moderator.id})`,
      target: `${target.username}#${target.discriminator} (${target.id})`,
      reason,
      timestamp: this.getTimestamp()
    });
  }

  userJoin(member) {
    this.info('User joined server', {
      user: `${member.user.username}#${member.user.discriminator} (${member.user.id})`,
      guild: `${member.guild.name} (${member.guild.id})`,
      joinedAt: member.joinedAt,
      timestamp: this.getTimestamp()
    });
  }

  userLeave(member) {
    this.info('User left server', {
      user: `${member.user.username}#${member.user.discriminator} (${member.user.id})`,
      guild: `${member.guild.name} (${member.guild.id})`,
      timestamp: this.getTimestamp()
    });
  }

  messageDeleted(message, reason = 'Unknown') {
    this.warn('Message deleted', {
      user: `${message.author.username}#${message.author.discriminator} (${message.author.id})`,
      channel: `${message.channel.name} (${message.channel.id})`,
      guild: `${message.guild.name} (${message.guild.id})`,
      content: message.content.substring(0, 500), // Limit content length
      reason,
      timestamp: this.getTimestamp()
    });
  }

  errorOccurred(error, context = {}) {
    this.error('An error occurred', {
      error: error.message,
      stack: error.stack,
      ...context,
      timestamp: this.getTimestamp()
    });
  }
}

module.exports = new Logger();