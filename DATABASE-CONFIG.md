# Smart Garden IoT - Database Configuration

## MongoDB Atlas Setup (Recommended)

### 1. Create MongoDB Atlas Account
- Go to https://cloud.mongodb.com
- Create free account
- Create new cluster (M0 Sandbox - Free)

### 2. Database Configuration
```javascript
// Database connection string
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartgarden?retryWrites=true&w=majority

// Collections structure
- devices: ESP8266 device information
- sensorData: Real-time sensor readings
- users: User accounts and preferences
- alerts: System alerts and notifications
```

### 3. Database Indexes
```javascript
// Performance indexes
db.sensorData.createIndex({ "deviceId": 1, "timestamp": -1 })
db.devices.createIndex({ "userId": 1 })
db.alerts.createIndex({ "timestamp": -1 })
```

## Self-Hosted MongoDB Setup

### 1. Install MongoDB
```bash
# Ubuntu/Debian
sudo apt update
sudo apt install mongodb

# Start MongoDB
sudo systemctl start mongodb
sudo systemctl enable mongodb
```

### 2. Configure MongoDB
```bash
# Create database user
mongo
use smartgarden
db.createUser({
  user: "smartgarden",
  pwd: "password123",
  roles: ["readWrite"]
})
```

## Database Backup Strategy

### 1. Automated Backups
```bash
#!/bin/bash
# backup.sh
DATE=$(date +%Y%m%d_%H%M%S)
mongodump --uri=$MONGODB_URI --out=./backups/$DATE
```

### 2. Restore from Backup
```bash
mongorestore --uri=$MONGODB_URI ./backups/latest
```

## Data Retention Policy

### 1. Sensor Data Retention
- Keep raw data for 30 days
- Keep aggregated data for 1 year
- Archive old data to cold storage

### 2. Cleanup Script
```javascript
// Cleanup old sensor data
db.sensorData.deleteMany({
  timestamp: { $lt: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000) }
})
```
