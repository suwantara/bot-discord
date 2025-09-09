# 🎨 Discord Bot Dashboard

Dashboard web modern untuk mengelola bot Discord dengan interface yang user-friendly menggunakan TailwindCSS dan Lucide icons.

## 🌐 Akses Dashboard

Dashboard tersedia di: `http://localhost:3000` (saat bot berjalan)

## 📋 Fitur Dashboard

### 🏠 **General Settings**
- ✅ Bot prefix configuration
- ✅ Welcome/leave channel settings
- ✅ Log channel configuration

### 💬 **Message Templates**
- ✅ Custom welcome messages
- ✅ Custom leave messages
- ✅ Custom ban notification messages

### 🚫 **Ban Words Management**
- ✅ Add new banned words
- ✅ Remove existing banned words
- ✅ View all banned words in table format
- ✅ Real-time updates

### 👥 **Moderation Overview**
- ✅ Server statistics (members, bans, warnings)
- ✅ Recent moderation actions
- ✅ Live data updates every 30 seconds

### 🎭 **Reaction Roles Management**
- ✅ View all reaction role messages
- ✅ See configured roles and emojis
- ✅ Instructions for creating new reaction roles

### 🚫 **Banned Users Management**
- ✅ View banned users (via Discord commands)
- ✅ Unban user interface
- ✅ Ban reason tracking

### 📊 **System Logs**
- ✅ View recent bot logs
- ✅ Filter by log level (INFO, WARN, ERROR)
- ✅ Adjustable number of lines
- ✅ Real-time log viewing

## 🎨 **UI Features**

### Modern Design
- ✅ **TailwindCSS** styling
- ✅ **Lucide icons** for better UX
- ✅ **Responsive design** for all devices
- ✅ **Dark/light theme support**

### Interactive Elements
- ✅ **Tab navigation** with smooth transitions
- ✅ **Hover effects** and animations
- ✅ **Loading states** and feedback
- ✅ **Success/error messages** with auto-dismiss

### Real-time Updates
- ✅ **Auto-refresh** statistics every 30 seconds
- ✅ **Live data** from bot configuration
- ✅ **Instant feedback** on actions

## 🚀 **Cara Penggunaan**

### 1. **Akses Dashboard**
```bash
# Jalankan bot
npm start

# Buka browser
http://localhost:3000
```

### 2. **Navigasi Tab**
- Klik tab di bagian atas untuk berpindah section
- Setiap tab memiliki fungsi spesifik

### 3. **Konfigurasi Settings**
- Ubah pengaturan di tab **General**
- Edit pesan di tab **Messages**
- Klik **"Save All Changes"** untuk menyimpan

### 4. **Manage Ban Words**
- Pergi ke tab **Ban Words**
- Masukkan kata di field "Add New Ban Word"
- Klik **"Add"** untuk menambah
- Klik **"🗑️"** untuk menghapus kata

### 5. **Monitor Activity**
- Tab **Moderation** untuk statistik server
- Tab **Logs** untuk melihat aktivitas bot
- Data diperbarui otomatis setiap 30 detik

## 🔧 **Technical Details**

### Dependencies
```json
{
  "tailwindcss": "latest",
  "lucide": "latest",
  "express": "latest"
}
```

### API Endpoints
- `GET /api/config` - Get bot configuration
- `POST /api/config` - Update bot configuration
- `GET /api/logs` - Get system logs
- `GET /api/stats` - Get server statistics

### File Structure
```
public/
├── index.html          # Main dashboard
└── styles.css          # Additional styles (optional)
```

## 🎯 **Best Practices**

### Performance
- ✅ **Lazy loading** untuk data besar
- ✅ **Efficient API calls** dengan caching
- ✅ **Minimal DOM manipulation**

### Security
- ✅ **Client-side validation**
- ✅ **Safe API endpoints**
- ✅ **No sensitive data exposure**

### UX/UI
- ✅ **Consistent design language**
- ✅ **Clear visual hierarchy**
- ✅ **Intuitive navigation**
- ✅ **Helpful tooltips and labels**

## 🔄 **Auto-Features**

### Real-time Updates
```javascript
// Auto-refresh setiap 30 detik
setInterval(() => {
    loadStats();
    loadRecentActions();
}, 30000);
```

### Live Feedback
```javascript
// Success messages dengan animasi
showSuccessMessage('✅ Changes saved successfully!');

// Error handling
showErrorMessage('❌ Failed to save changes!');
```

## 📱 **Responsive Design**

Dashboard fully responsive untuk:
- ✅ **Desktop** (1200px+)
- ✅ **Tablet** (768px - 1199px)
- ✅ **Mobile** (320px - 767px)

## 🚨 **Troubleshooting**

### Dashboard Tidak Loading
```bash
# Pastikan bot berjalan
npm start

# Check port 3000
netstat -an | grep 3000

# Clear browser cache
```

### Data Tidak Update
```bash
# Manual refresh
location.reload()

# Check console untuk errors
F12 > Console
```

### API Errors
```bash
# Check bot logs
tail -f logs/YYYY-MM-DD.log

# Verify API endpoints
curl http://localhost:3000/api/config
```

## 🎨 **Customization**

### Mengubah Tema
```css
/* Edit di <style> section */
:root {
  --primary-color: #3b82f6;
  --secondary-color: #64748b;
}
```

### Menambah Tab Baru
```javascript
// Tambah button di navigation
<button onclick="showTab('newtab')">New Tab</button>

// Tambah content div
<div id="newtab" class="tab-content">Content here</div>
```

## 📈 **Future Enhancements**

- [ ] **Dark mode toggle**
- [ ] **Export/import configuration**
- [ ] **Real-time notifications**
- [ ] **Advanced analytics dashboard**
- [ ] **User management interface**
- [ ] **Scheduled message system**

## 📞 **Support**

Untuk bantuan dengan dashboard:
1. Check browser console untuk errors
2. Verify bot sedang berjalan
3. Check network tab untuk API calls
4. Review logs untuk debugging info

Dashboard ini memberikan kontrol penuh atas bot Discord dengan interface yang modern dan user-friendly! 🎉