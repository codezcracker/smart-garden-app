/**
 * Smart Garden IoT - Configuration Helper
 * Centralized configuration management for deployment
 */

const config = {
  // Database
  mongodb: {
    uri: process.env.MONGODB_URI || 'mongodb://localhost:27017/smart-garden',
    options: {
      useNewUrlParser: true,
      useUnifiedTopology: true,
    }
  },

  // Server
  server: {
    port: process.env.PORT || 3000,
    env: process.env.NODE_ENV || 'development',
    cors: {
      origin: process.env.ALLOWED_ORIGINS 
        ? process.env.ALLOWED_ORIGINS.split(',')
        : ['http://localhost:3000'],
      credentials: true
    }
  },

  // IoT Settings
  iot: {
    checkInterval: parseInt(process.env.IOT_CHECK_INTERVAL) || 1000,
    offlineThreshold: parseInt(process.env.IOT_OFFLINE_THRESHOLD) || 4000,
    maxRetries: 3,
    timeout: 5000
  },

  // Authentication
  auth: {
    secret: process.env.NEXTAUTH_SECRET || 'fallback-secret-key',
    url: process.env.NEXTAUTH_URL || 'http://localhost:3000'
  },

  // ESP8266 Configuration Templates
  esp8266: {
    // For local development
    local: {
      serverURL: 'http://192.168.1.100:3000', // Update this IP
      deviceID: 'DB1',
      sendInterval: 1000
    },
    
    // For production
    production: {
      serverURL: 'https://your-domain.com', // Update this domain
      deviceID: 'DB1',
      sendInterval: 1000,
      mDNSName: 'smart-garden'
    }
  },

  // Deployment Detection
  isProduction: () => process.env.NODE_ENV === 'production',
  isDevelopment: () => process.env.NODE_ENV === 'development',
  
  // Get appropriate ESP8266 config
  getESPConfig: () => {
    return config.isProduction() 
      ? config.esp8266.production 
      : config.esp8266.local;
  }
};

// Validation
const validateConfig = () => {
  const errors = [];
  
  if (!config.mongodb.uri) {
    errors.push('MONGODB_URI is required');
  }
  
  if (config.isProduction() && !config.auth.secret.includes('fallback')) {
    errors.push('NEXTAUTH_SECRET should be set in production');
  }
  
  if (errors.length > 0) {
    console.error('❌ Configuration errors:', errors);
    process.exit(1);
  }
  
  console.log('✅ Configuration validated');
};

// Initialize
if (require.main === module) {
  validateConfig();
  console.log('🔧 Current configuration:', {
    environment: config.server.env,
    port: config.server.port,
    mongodb: config.mongodb.uri ? '✅ Configured' : '❌ Missing',
    espConfig: config.getESPConfig()
  });
}

module.exports = config;
