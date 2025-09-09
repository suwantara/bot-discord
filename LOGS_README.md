# 📋 Discord Bot Logging System

Bot ini dilengkapi dengan sistem logging yang komprehensif untuk melacak semua aktivitas.

## 📁 Struktur Logs

```
logs/
├── 2024-01-15.log
├── 2024-01-16.log
└── 2024-01-17.log
```

Logs disimpan dalam format JSON per hari di folder `logs/`.

## 📊 Jenis Log yang Dicatat

### 🤖 Bot Events
- Bot startup dan status
- Command loading
- Error handling

### 👥 User Activity
- User join/leave server
- Command usage (prefix & slash)
- Message deletions (auto-moderation)

### 🛡️ Moderation Actions
- Ban/kick/warn actions
- Auto-moderation triggers
- Permission checks

### ⚠️ Errors & Warnings
- Command execution errors
- API failures
- Configuration issues

## 📋 Format Log Entry

```json
{
  "timestamp": "2024-01-15T10:30:45.123Z",
  "level": "INFO",
  "message": "Command used: ping",
  "command": "ping",
  "user": "username#1234 (123456789012345678)",
  "guild": "Server Name (987654321098765432)",
  "type": "slash"
}
```

## 🔧 Commands untuk Melihat Logs

### `/logs` - View Recent Logs
```
/logs lines:10
```

**Parameters:**
- `lines` (optional): Jumlah baris log yang ditampilkan (1-20, default: 10)

**Permissions:** Administrator only

**Contoh Output:**
```
📋 Recent Bot Logs

`1.` **[INFO]** Command used: ping
`2.` **[INFO]** User joined server
`3.` **[WARN]** Message deleted
`4.` **[ERROR]** Failed to send welcome message
```

## 📈 Log Levels

| Level | Deskripsi | Contoh |
|-------|-----------|--------|
| `INFO` | Informasi umum | Command usage, user joins |
| `WARN` | Peringatan | Auto-moderation, missing channels |
| `ERROR` | Error | Command failures, API errors |
| `DEBUG` | Debug info | Detailed execution info |

## 🔍 Monitoring & Troubleshooting

### Melihat Logs Real-time
```bash
# Terminal 1: Run bot
npm start

# Terminal 2: Monitor logs
tail -f logs/$(date +%Y-%m-%d).log
```

### Analisis Logs
```bash
# Count command usage
grep "Command used" logs/*.log | wc -l

# Find errors
grep '"level":"ERROR"' logs/*.log

# User activity
grep "user_joined" logs/*.log | jq -r '.user'
```

## 🛡️ Security & Privacy

- ✅ Logs tidak mengandung data sensitif
- ✅ Hanya administrator yang bisa melihat logs
- ✅ Logs tersimpan lokal (tidak dikirim ke server eksternal)
- ✅ File logs diabaikan oleh Git (.gitignore)

## 📊 Dashboard Integration

Logs dapat diintegrasikan dengan dashboard web untuk:
- Real-time monitoring
- Log filtering
- Export functionality
- Alert system

## 🔧 Konfigurasi

### Mengubah Lokasi Logs
Edit `src/utils/logger.js`:
```javascript
const logsDir = path.join(__dirname, '../../custom_logs');
```

### Mengubah Format Logs
```javascript
// Plain text format
formatMessage(level, message, data) {
  return `${this.getTimestamp()} [${level}] ${message}\n`;
}
```

## 📋 Best Practices

1. **Regular Cleanup**: Hapus logs lama secara berkala
2. **Monitor Space**: Logs dapat membesar seiring waktu
3. **Backup Important Logs**: Simpan logs penting untuk audit
4. **Log Rotation**: Implementasi log rotation untuk production

## 🚨 Alert System (Future Enhancement)

```javascript
// Example: Alert on critical errors
if (level === 'ERROR') {
  // Send notification to admin
  // Send to monitoring service
  // Trigger automated response
}
```

## 📞 Support

Jika Anda mengalami masalah dengan logging system:
1. Periksa file logs di folder `logs/`
2. Gunakan `/logs` command untuk melihat recent activity
3. Periksa console output untuk error messages
4. Pastikan bot memiliki permission Administrator untuk `/logs` command