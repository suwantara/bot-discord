# Discord Bot Moderation

Bot Discord lengkap dengan fitur moderation, reaction role, poll system, dan dashboard web untuk kustomisasi.

## Fitur

### Moderation
- Ban user dengan alasan
- Kick user dengan alasan
- Warn user
- Clear messages (1-100)
- Auto-moderation ban words

### Welcome & Leave System
- Pesan welcome otomatis saat user join
- Pesan leave otomatis saat user keluar
- Kustomisasi pesan melalui dashboard

### Reaction Role
- Setup reaction role untuk message tertentu
- Auto-assign/remove role berdasarkan reaction

### Poll System
- Buat poll dengan thumbs up/down
- Embed yang menarik

### Dashboard Web
- Interface web untuk kustomisasi pengumuman
- Edit ban words
- Konfigurasi channel
- Real-time update

### Commands
- `-ping` - Test bot response
- `-ban <@user> [reason]` - Ban user
- `-kick <@user> [reason]` - Kick user
- `-warn <@user> [reason]` - Warn user
- `-clear <amount>` - Clear messages
- `-poll <question>` - Create poll
- `-announce <message>` - Send announcement
- `-setreactionrole <emoji> <@role> <message_id>` - Setup reaction role
- `/setdailymessage <channel>` - Set channel untuk pesan harian

### 🌅 Daily Message System
Bot akan mengirim pesan selamat pagi otomatis setiap hari pukul 06:00 WIB untuk menjaga agar tetap aktif di platform hosting gratis.

**Fitur:**
- ✅ Pesan otomatis setiap hari pukul 6 pagi
- ✅ Embed dengan informasi tanggal dan waktu
- ✅ Mention @everyone
- ✅ Konfigurasi channel via dashboard atau command
- ✅ Test message functionality
- ✅ Logging lengkap untuk monitoring

**Setup:**
1. Gunakan `/setdailymessage` untuk mengatur channel
2. Atau edit `dailyMessageChannel` di `config/config.json`
3. Bot akan otomatis mengirim pesan setiap hari

**Dashboard:**
- Akses tab "Daily Message" di dashboard web
- Lihat status dan konfigurasi
- Test pesan sebelum deploy
- Monitor aktivitas daily message

## Setup

1. Clone repository ini
2. Install dependencies: `npm install`
3. Buat file `.env` dengan:
   ```
   DISCORD_TOKEN=your_bot_token_here
   CLIENT_ID=your_client_id_here
   GUILD_ID=your_guild_id_here
   PORT=3000
   ```
4. Konfigurasi bot di `config/config.json`
5. Jalankan bot: `node index.js`

## Dashboard

Dashboard web tersedia di `http://localhost:3000` untuk kustomisasi pengaturan bot.

## Deploy

### VPS/Local Server
1. Upload semua file ke server
2. Install Node.js dan npm
3. Jalankan `npm install`
4. Setup `.env` file
5. Jalankan dengan `node index.js` atau gunakan PM2

### Docker (Opsional)
```dockerfile
FROM node:16
WORKDIR /app
COPY package*.json ./
RUN npm install
COPY . .
CMD ["node", "index.js"]
```

## Permissions Bot

Bot memerlukan permissions berikut:
- Send Messages
- Manage Messages
- Ban Members
- Kick Members
- Manage Roles
- Read Message History
- Add Reactions

## Support

Untuk pertanyaan atau masalah, silakan buat issue di repository ini.