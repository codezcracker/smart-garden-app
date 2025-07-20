# 🚀 Deployment Guide - Smart Garden IoT System

## Deploy to Vercel

### Prerequisites
- GitHub account
- Vercel account (free tier available)
- Your smart garden app code

### Step 1: Prepare Your Repository

1. **Initialize Git** (if not already done):
```bash
git init
git add .
git commit -m "Initial commit: Smart Garden IoT System"
```

2. **Create GitHub Repository**:
   - Go to [GitHub](https://github.com)
   - Click "New repository"
   - Name it `smart-garden-app`
   - Make it public or private
   - Don't initialize with README (we already have one)

3. **Push to GitHub**:
```bash
git remote add origin https://github.com/YOUR_USERNAME/smart-garden-app.git
git branch -M main
git push -u origin main
```

### Step 2: Deploy to Vercel

1. **Go to Vercel**:
   - Visit [vercel.com](https://vercel.com)
   - Sign up/login with your GitHub account

2. **Import Project**:
   - Click "New Project"
   - Select your `smart-garden-app` repository
   - Vercel will automatically detect it's a Next.js project

3. **Configure Settings**:
   - **Framework Preset**: Next.js (auto-detected)
   - **Root Directory**: `./` (default)
   - **Build Command**: `yarn build` (auto-detected)
   - **Output Directory**: `.next` (auto-detected)
   - **Install Command**: `yarn install` (auto-detected)

4. **Environment Variables** (if needed):
   - Add any environment variables in the Vercel dashboard
   - For now, no additional variables are required

5. **Deploy**:
   - Click "Deploy"
   - Wait for the build to complete (usually 2-3 minutes)

### Step 3: Verify Deployment

1. **Check Build Logs**:
   - Monitor the build process in Vercel dashboard
   - Ensure all pages build successfully

2. **Test Your App**:
   - Visit your deployed URL (e.g., `https://smart-garden-app.vercel.app`)
   - Test all pages:
     - Dashboard: `/`
     - Plants: `/plants`
     - Sensors: `/sensors`
     - Automation: `/automation`
     - Analytics: `/analytics`

3. **Custom Domain** (Optional):
   - In Vercel dashboard, go to "Settings" → "Domains"
   - Add your custom domain if you have one

### Step 4: Continuous Deployment

Your app is now set up for continuous deployment:
- Every push to the `main` branch triggers a new deployment
- Vercel creates preview deployments for pull requests
- Automatic rollback on failed deployments

## 🛠️ Local Development

### Development Server
```bash
yarn dev
```
Visit `http://localhost:3000`

### Production Build Test
```bash
yarn build
yarn start
```

## 📱 Mobile Optimization

The app is already mobile-responsive, but you can:
1. Test on mobile devices
2. Use browser dev tools to simulate mobile
3. Check performance with Lighthouse

## 🔧 Troubleshooting

### Build Errors
- Check that all dependencies are installed: `yarn install`
- Verify Node.js version (18+ recommended)
- Check for TypeScript errors (if any)

### Deployment Issues
- Check Vercel build logs
- Verify `vercel.json` configuration
- Ensure all files are committed to Git

### Performance Issues
- Optimize images and assets
- Check bundle size in build output
- Use Next.js Image component for images

## 📊 Monitoring

### Vercel Analytics
- Enable Vercel Analytics in dashboard
- Monitor performance metrics
- Track user behavior

### Error Tracking
- Consider adding error tracking (Sentry, LogRocket)
- Monitor for JavaScript errors
- Track API failures

## 🔄 Updates

### Making Changes
1. Make changes locally
2. Test with `yarn dev`
3. Commit and push to GitHub
4. Vercel automatically deploys

### Rollback
- Go to Vercel dashboard
- Click on your project
- Go to "Deployments"
- Click "Redeploy" on a previous version

## 🚀 Next Steps

After successful deployment:

1. **IoT Integration**:
   - Set up ESP32/Arduino sensors
   - Configure MQTT communication
   - Connect to your deployed API

2. **Database Setup**:
   - Add PostgreSQL or MongoDB
   - Set up environment variables
   - Configure data persistence

3. **Authentication**:
   - Add user authentication
   - Implement user management
   - Secure API endpoints

4. **Mobile App**:
   - Consider React Native app
   - Progressive Web App (PWA)
   - Native mobile development

## 📞 Support

- **Vercel Documentation**: [vercel.com/docs](https://vercel.com/docs)
- **Next.js Documentation**: [nextjs.org/docs](https://nextjs.org/docs)
- **GitHub Issues**: Create issues in your repository

---

**Your Smart Garden IoT System is now live! 🌱** 