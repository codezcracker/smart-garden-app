# Smart Garden IoT - Deployment Guide

## 🚀 Production Deployment Checklist

### 1. ESP8266 Firmware Configuration

#### Update WiFi Credentials
```cpp
// Change these for production
const char* ssid = "YOUR_PRODUCTION_WIFI";
const char* password = "YOUR_PRODUCTION_PASSWORD";
```

#### Update Server URL
```cpp
// Change to your production server
const char* serverURL = "https://your-domain.com";
```

#### Optimize Data Send Frequency
```cpp
// Reduce frequency for battery life and server load
#define DATA_SEND_INTERVAL_SECONDS 30  // 30 seconds instead of 1 second
```

#### Add Error Handling
```cpp
// Add retry logic for failed connections
#define MAX_RETRY_ATTEMPTS 3
#define RETRY_DELAY 5000  // 5 seconds
```

### 2. Server Deployment Options

#### Option A: Vercel (Easiest)
1. **Connect GitHub repository**
2. **Set environment variables:**
   - `MONGODB_URI`
   - `NEXTAUTH_SECRET`
   - `NEXTAUTH_URL`
3. **Deploy automatically**

#### Option B: VPS Deployment
1. **Set up Ubuntu server**
2. **Install Node.js, PM2, Nginx**
3. **Configure SSL with Let's Encrypt**
4. **Set up MongoDB**

### 3. Database Configuration

#### MongoDB Atlas (Recommended)
```bash
# Create cluster at mongodb.com
# Get connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartgarden
```

#### Self-hosted MongoDB
```bash
# Install MongoDB on server
sudo apt update
sudo apt install mongodb
```

### 4. Environment Variables

#### Production .env
```bash
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartgarden
NEXTAUTH_SECRET=your-super-secret-key-here
NEXTAUTH_URL=https://your-domain.com
NODE_ENV=production
```

### 5. Domain & SSL Setup

#### Domain Configuration
- **Purchase domain** (e.g., smartgarden.com)
- **Point DNS** to your server
- **Configure subdomain** (e.g., api.smartgarden.com)

#### SSL Certificate
- **Let's Encrypt** (free)
- **Cloudflare SSL** (if using Cloudflare)
- **Provider SSL** (Vercel, Netlify provide automatically)

## 🔧 Production Optimizations

### ESP8266 Optimizations
```cpp
// Add deep sleep for battery operation
#define SLEEP_DURATION 300000  // 5 minutes

// Add watchdog timer
ESP.wdtEnable(8000);

// Optimize WiFi power
WiFi.setSleepMode(WIFI_LIGHT_SLEEP);
```

### Server Optimizations
```javascript
// Add rate limiting
const rateLimit = require('express-rate-limit');

// Add CORS configuration
app.use(cors({
  origin: ['https://your-domain.com'],
  credentials: true
}));

// Add compression
const compression = require('compression');
app.use(compression());
```

## 📊 Monitoring & Maintenance

### Health Checks
- **ESP8266 heartbeat** monitoring
- **Database connection** monitoring
- **Server uptime** monitoring

### Logging
- **Winston** for server logs
- **Serial logging** for ESP8266 debugging

### Backup Strategy
- **Database backups** (daily)
- **Code versioning** (Git)
- **Configuration backups**

## 🚨 Security Considerations

### ESP8266 Security
- **WiFi WPA2/WPA3** encryption
- **HTTPS only** communication
- **Device authentication** tokens

### Server Security
- **Environment variables** for secrets
- **Rate limiting** to prevent abuse
- **Input validation** for all endpoints
- **CORS** configuration
- **Firewall** rules

## 📱 Mobile App Considerations

### PWA Features
- **Offline support**
- **Push notifications**
- **App-like experience**

### Real-time Updates
- **WebSocket** connections
- **Server-Sent Events**
- **Polling** fallback

## 🔋 Power Management

### Battery Operation
- **Deep sleep** mode
- **Reduced send frequency**
- **Low power sensors**

### Solar Power
- **Solar panel** integration
- **Battery monitoring**
- **Power optimization**

## 📈 Scaling Considerations

### Multiple Devices
- **Device management** system
- **User authentication**
- **Multi-tenant** architecture

### Data Storage
- **Time-series** database (InfluxDB)
- **Data retention** policies
- **Analytics** integration

## 🛠️ Deployment Commands

### Vercel Deployment
```bash
npm install -g vercel
vercel login
vercel --prod
```

### Docker Deployment
```dockerfile
FROM node:18-alpine
WORKDIR /app
COPY package*.json ./
RUN npm ci --only=production
COPY . .
EXPOSE 3000
CMD ["npm", "start"]
```

### PM2 Deployment
```bash
npm install -g pm2
pm2 start ecosystem.config.js
pm2 startup
pm2 save
```

## 📋 Pre-Deployment Checklist

- [ ] Update WiFi credentials
- [ ] Change server URL to production
- [ ] Set up production database
- [ ] Configure environment variables
- [ ] Set up domain and SSL
- [ ] Test all endpoints
- [ ] Configure monitoring
- [ ] Set up backups
- [ ] Test ESP8266 connectivity
- [ ] Verify data flow
- [ ] Performance testing
- [ ] Security audit

## 🎯 Go-Live Steps

1. **Deploy server** to production
2. **Update ESP8266** firmware
3. **Test connectivity**
4. **Monitor logs**
5. **Verify data flow**
6. **Set up alerts**
7. **Document configuration**
8. **Train users**

## 📞 Support & Maintenance

### Monitoring Tools
- **Uptime monitoring** (UptimeRobot)
- **Error tracking** (Sentry)
- **Performance monitoring** (New Relic)

### Maintenance Schedule
- **Weekly** health checks
- **Monthly** security updates
- **Quarterly** performance reviews