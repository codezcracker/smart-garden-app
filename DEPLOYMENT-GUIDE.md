# 🚀 Smart Garden IoT - Deployment Guide

## 📋 Prerequisites

- Node.js 18+ installed
- MongoDB Atlas account (or local MongoDB)
- ESP8266/ESP32 device
- WiFi network access

## 🌐 Deployment Options

### Option 1: Local Development (Current Setup)
```bash
# Install dependencies
yarn install

# Start development server
yarn dev
```

### Option 2: Production Deployment

#### A. Vercel Deployment (Recommended)
```bash
# Install Vercel CLI
npm i -g vercel

# Deploy to Vercel
vercel

# Set environment variables in Vercel dashboard:
# MONGODB_URI=your_mongodb_atlas_connection_string
```

#### B. Railway Deployment
```bash
# Install Railway CLI
npm install -g @railway/cli

# Deploy to Railway
railway login
railway init
railway up

# Set environment variables in Railway dashboard
```

#### C. Docker Deployment
```bash
# Build Docker image
docker build -t smart-garden-iot .

# Run container
docker run -p 3000:3000 -e MONGODB_URI=your_uri smart-garden-iot
```

## 🔧 Environment Variables

Create a `.env.local` file:
```env
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smart-garden
NEXTAUTH_SECRET=your-secret-key
NEXTAUTH_URL=https://your-domain.com
```

## 📱 ESP8266 Configuration

### 1. For Local Development
Use the current `Minimal_RealTime.ino` with your local IP:
```cpp
const char* serverURL = "http://192.168.1.100:3000"; // Your local IP
```

### 2. For Production Deployment
Use `Dynamic_IP_ESP8266.ino` with mDNS discovery:
```cpp
const char* mDNSName = "your-domain.com"; // Your deployed domain
```

### 3. Configuration Steps
1. **Copy `config.h`** to your Arduino sketch folder
2. **Modify the values** in `config.h`:
   ```cpp
   #define WIFI_SSID "YourWiFiName"
   #define WIFI_PASSWORD "YourWiFiPassword"
   #define DEVICE_ID "DB1"
   #define FALLBACK_SERVER_IP "your.server.ip"
   ```
3. **Include config** in your main file:
   ```cpp
   #include "config.h"
   ```
4. **Upload to ESP8266**

## 🌍 Dynamic IP Solutions

### Option 1: mDNS (Recommended for Local)
```bash
# Install mDNS on your server
npm install mdns

# Your server will be discoverable as "smart-garden.local"
```

### Option 2: Dynamic DNS
- Use services like No-IP, DuckDNS, or DynDNS
- Update ESP8266 code to use your dynamic domain

### Option 3: Cloud Discovery Service
```javascript
// Create a simple discovery endpoint
app.get('/api/discover', (req, res) => {
  res.json({
    server: 'https://your-domain.com',
    port: 3000,
    endpoints: {
      deviceData: '/api/iot/device-data',
      checkStatus: '/api/iot/check-status'
    }
  });
});
```

## 🔄 Auto-Deployment Setup

### GitHub Actions (CI/CD)
Create `.github/workflows/deploy.yml`:
```yaml
name: Deploy to Production
on:
  push:
    branches: [main]
jobs:
  deploy:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v2
      - name: Deploy to Vercel
        uses: amondnet/vercel-action@v20
        with:
          vercel-token: ${{ secrets.VERCEL_TOKEN }}
          vercel-org-id: ${{ secrets.ORG_ID }}
          vercel-project-id: ${{ secrets.PROJECT_ID }}
```

## 📊 Monitoring & Analytics

### Add to your deployment:
```javascript
// Add to your API routes
app.use((req, res, next) => {
  console.log(`${new Date().toISOString()} - ${req.method} ${req.path}`);
  next();
});
```

## 🛡️ Security Considerations

1. **Environment Variables**: Never commit `.env` files
2. **API Keys**: Store in deployment platform secrets
3. **CORS**: Configure for your domain only
4. **Rate Limiting**: Add rate limiting to API endpoints
5. **Authentication**: Implement proper auth for admin endpoints

## 📝 Deployment Checklist

- [ ] Environment variables configured
- [ ] Database connection tested
- [ ] ESP8266 code updated with correct server URL
- [ ] Domain/DNS configured (if using custom domain)
- [ ] SSL certificate installed (if using HTTPS)
- [ ] Monitoring/logging set up
- [ ] Backup strategy implemented

## 🆘 Troubleshooting

### Common Issues:
1. **ESP8266 can't connect**: Check WiFi credentials and server URL
2. **Database connection fails**: Verify MongoDB URI and network access
3. **CORS errors**: Update CORS configuration for your domain
4. **Build failures**: Check Node.js version and dependencies

### Support:
- Check logs in deployment platform dashboard
- Monitor ESP8266 serial output
- Test API endpoints with curl/Postman
