# Smart Garden IoT - Production Environment Variables Template
# Copy this file to .env.production and update with your values

# ========================================
# DATABASE CONFIGURATION
# ========================================

# MongoDB Atlas (Recommended for production)
MONGODB_URI=mongodb+srv://username:password@cluster.mongodb.net/smartgarden?retryWrites=true&w=majority

# Alternative: Self-hosted MongoDB
# MONGODB_URI=mongodb://localhost:27017/smartgarden

# ========================================
# NEXT.JS CONFIGURATION
# ========================================

# NextAuth.js Configuration
NEXTAUTH_SECRET=your-super-secret-key-here-change-this-in-production
NEXTAUTH_URL=https://your-domain.com

# Environment
NODE_ENV=production

# ========================================
# API CONFIGURATION
# ========================================

# API Base URL
API_BASE_URL=https://your-domain.com/api

# CORS Configuration
CORS_ORIGIN=https://your-domain.com

# ========================================
# SECURITY CONFIGURATION
# ========================================

# JWT Secret (if using JWT authentication)
JWT_SECRET=your-jwt-secret-key-here

# Rate Limiting
RATE_LIMIT_MAX=100
RATE_LIMIT_WINDOW=900000

# ========================================
# MONITORING & LOGGING
# ========================================

# Log Level (error, warn, info, debug)
LOG_LEVEL=info

# Sentry DSN (for error tracking)
SENTRY_DSN=https://your-sentry-dsn@sentry.io/project-id

# ========================================
# ESP8266 CONFIGURATION
# ========================================

# Device Management
MAX_DEVICES_PER_USER=10
DEVICE_HEARTBEAT_TIMEOUT=300000

# Data Retention
DATA_RETENTION_DAYS=30

# ========================================
# EMAIL CONFIGURATION (Optional)
# ========================================

# SMTP Configuration for notifications
SMTP_HOST=smtp.gmail.com
SMTP_PORT=587
SMTP_USER=your-email@gmail.com
SMTP_PASS=your-app-password

# ========================================
# PUSH NOTIFICATIONS (Optional)
# ========================================

# Firebase Cloud Messaging
FCM_SERVER_KEY=your-fcm-server-key
FCM_PROJECT_ID=your-fcm-project-id

# ========================================
# ANALYTICS (Optional)
# ========================================

# Google Analytics
GA_TRACKING_ID=GA-XXXXXXXXX

# ========================================
# CLOUD STORAGE (Optional)
# ========================================

# AWS S3 Configuration
AWS_ACCESS_KEY_ID=your-aws-access-key
AWS_SECRET_ACCESS_KEY=your-aws-secret-key
AWS_REGION=us-east-1
AWS_S3_BUCKET=your-s3-bucket

# ========================================
# REDIS CACHE (Optional)
# ========================================

# Redis Configuration for caching
REDIS_URL=redis://localhost:6379
REDIS_PASSWORD=your-redis-password

# ========================================
# BACKUP CONFIGURATION
# ========================================

# Backup Schedule (cron format)
BACKUP_SCHEDULE=0 2 * * *

# Backup Retention (days)
BACKUP_RETENTION_DAYS=7

# ========================================
# DEVELOPMENT OVERRIDES
# ========================================

# Override for development/testing
DEV_MODE=false
DEBUG_MODE=false
MOCK_SENSORS=false
