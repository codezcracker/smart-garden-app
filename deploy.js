#!/usr/bin/env node

/**
 * Smart Garden IoT - Quick Deployment Script
 * 
 * Usage:
 * node deploy.js [platform]
 * 
 * Platforms: vercel, railway, docker, local
 */

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

const platforms = {
  vercel: {
    name: 'Vercel',
    steps: [
      'Installing Vercel CLI...',
      'Deploying to Vercel...',
      'Setting up environment variables...'
    ],
    commands: [
      'npm install -g vercel',
      'vercel --prod',
      'echo "✅ Deployed to Vercel! Don\'t forget to set environment variables in Vercel dashboard."'
    ]
  },
  
  railway: {
    name: 'Railway',
    steps: [
      'Installing Railway CLI...',
      'Deploying to Railway...',
      'Setting up environment variables...'
    ],
    commands: [
      'npm install -g @railway/cli',
      'railway login && railway init && railway up',
      'echo "✅ Deployed to Railway! Don\'t forget to set environment variables in Railway dashboard."'
    ]
  },
  
  docker: {
    name: 'Docker',
    steps: [
      'Building Docker image...',
      'Running Docker container...'
    ],
    commands: [
      'docker build -t smart-garden-iot .',
      'docker run -p 3000:3000 -e MONGODB_URI=$MONGODB_URI smart-garden-iot'
    ]
  },
  
  local: {
    name: 'Local Development',
    steps: [
      'Installing dependencies...',
      'Starting development server...'
    ],
    commands: [
      'yarn install',
      'yarn dev'
    ]
  }
};

function deploy(platform) {
  if (!platforms[platform]) {
    console.error(`❌ Unknown platform: ${platform}`);
    console.log('Available platforms:', Object.keys(platforms).join(', '));
    process.exit(1);
  }

  const config = platforms[platform];
  console.log(`🚀 Deploying to ${config.name}...\n`);

  config.steps.forEach((step, index) => {
    console.log(`📦 ${step}`);
    try {
      execSync(config.commands[index], { stdio: 'inherit' });
    } catch (error) {
      console.error(`❌ Error in step ${index + 1}:`, error.message);
      process.exit(1);
    }
  });

  console.log(`\n✅ Successfully deployed to ${config.name}!`);
  
  // Show next steps
  if (platform !== 'local') {
    console.log('\n📋 Next Steps:');
    console.log('1. Set environment variables in your deployment platform');
    console.log('2. Update ESP8266 code with your deployment URL');
    console.log('3. Test the connection from your ESP8266');
    console.log('\n📖 See DEPLOYMENT-GUIDE.md for detailed instructions');
  }
}

function showHelp() {
  console.log(`
🌱 Smart Garden IoT - Deployment Script

Usage:
  node deploy.js [platform]

Available platforms:
  local     - Start local development server
  vercel    - Deploy to Vercel
  railway   - Deploy to Railway
  docker    - Build and run Docker container

Examples:
  node deploy.js local
  node deploy.js vercel
  node deploy.js railway

Environment Variables Required:
  MONGODB_URI - MongoDB connection string
  NEXTAUTH_SECRET - Authentication secret (for production)

For more information, see DEPLOYMENT-GUIDE.md
  `);
}

// Main execution
const platform = process.argv[2];

if (!platform || platform === 'help' || platform === '--help') {
  showHelp();
} else {
  deploy(platform);
}
