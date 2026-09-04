# 🚀 Deployment Guide - Bong Store System

This guide covers multiple deployment options for your Bong Store System, from free hosting to production-ready solutions.

---

## 📋 Table of Contents
1. [Pre-Deployment Checklist](#pre-deployment-checklist)
2. [Quick Deploy Options](#quick-deploy-options)
3. [Platform-Specific Guides](#platform-specific-guides)
4. [Post-Deployment Steps](#post-deployment-steps)
5. [Troubleshooting](#troubleshooting)

---

## ✅ Pre-Deployment Checklist

Before deploying, ensure:
- [ ] All dependencies are listed in `package.json`
- [ ] Database is properly initialized
- [ ] Environment variables are configured
- [ ] Session secret is changed from default
- [ ] Admin password is secure
- [ ] File upload directory exists

---

## 🎯 Quick Deploy Options

### Option 1: Render (Recommended - Free Tier Available)
**Best for**: Production deployments, automatic scaling
**Cost**: Free tier available, paid plans from $7/month

### Option 2: Railway
**Best for**: Quick deployments with database
**Cost**: Free $5 credit/month, then pay-as-you-go

### Option 3: Heroku
**Best for**: Enterprise-grade hosting
**Cost**: Starts at $5/month (no free tier)

### Option 4: Vercel/Netlify
**Best for**: Static + serverless
**Cost**: Free tier available
**Note**: Requires modifications for serverless

### Option 5: VPS (DigitalOcean, Linode, AWS EC2)
**Best for**: Full control, multiple projects
**Cost**: From $4-6/month

---

## 🌐 Platform-Specific Guides

## 1️⃣ Render Deployment (Recommended)

### Step 1: Prepare Your Project
Your project is already configured! The required files are included.

### Step 2: Create Render Account
1. Go to [render.com](https://render.com)
2. Sign up with GitHub/GitLab/Email

### Step 3: Deploy
1. Click **"New +"** → **"Web Service"**
2. Connect your repository OR:
   - Use "Public Git Repository"
   - Enter: Your Git URL or upload files

3. Configure:
   ```
   Name: bong-store-system
   Environment: Node
   Build Command: npm install
   Start Command: npm start
   ```

4. **Environment Variables** (Add these):
   ```
   NODE_ENV=production
   PORT=3000
   SESSION_SECRET=your-super-secret-key-here-change-this
   ```

5. Click **"Create Web Service"**

### Step 4: Access Your Site
- Your site will be available at: `https://bong-store-system.onrender.com`
- First build takes 2-5 minutes

**✅ Pros**: Automatic HTTPS, free tier, easy database integration
**⚠️ Cons**: Free tier sleeps after 15 min of inactivity

---

## 2️⃣ Railway Deployment

### Step 1: Install Railway CLI (Optional)
```bash
npm install -g @railway/cli
railway login
```

### Step 2: Deploy via Dashboard
1. Go to [railway.app](https://railway.app)
2. Click **"Start a New Project"**
3. Select **"Deploy from GitHub repo"** or **"Empty Project"**

### Step 3: Configure
1. Add environment variables:
   ```
   NODE_ENV=production
   SESSION_SECRET=your-secret-key
   ```

2. Railway auto-detects Node.js and deploys!

### Step 4: Get Domain
- Railway provides: `your-app.up.railway.app`
- Add custom domain in settings

**✅ Pros**: Very fast, great developer experience
**⚠️ Cons**: Limited free credits

---

## 3️⃣ Heroku Deployment

### Step 1: Install Heroku CLI
```bash
# Windows (using npm)
npm install -g heroku
```

### Step 2: Login and Create App
```bash
heroku login
heroku create bong-store-system
```

### Step 3: Configure
```bash
heroku config:set NODE_ENV=production
heroku config:set SESSION_SECRET=your-super-secret-key
```

### Step 4: Deploy
```bash
git add .
git commit -m "Prepare for Heroku deployment"
git push heroku main
```

### Step 5: Open App
```bash
heroku open
```

**✅ Pros**: Reliable, enterprise-grade
**⚠️ Cons**: No free tier anymore

---

## 4️⃣ VPS Deployment (DigitalOcean/Linode/AWS)

### Step 1: Create VPS
1. Create Ubuntu 22.04 droplet ($4-6/month)
2. SSH into your server:
   ```bash
   ssh root@your-server-ip
   ```

### Step 2: Install Dependencies
```bash
# Update system
apt update && apt upgrade -y

# Install Node.js 18+
curl -fsSL https://deb.nodesource.com/setup_18.x | bash -
apt install -y nodejs

# Install PM2 (process manager)
npm install -g pm2

# Install Nginx (reverse proxy)
apt install -y nginx
```

### Step 3: Upload Your Project
```bash
# On your local machine
scp -r "d:\Bong Store System" root@your-server-ip:/var/www/bong-store
```

OR clone from Git:
```bash
cd /var/www
git clone your-repository-url bong-store
```

### Step 4: Setup Application
```bash
cd /var/www/bong-store
npm install --production
```

### Step 5: Configure PM2
```bash
# Start application
pm2 start server.js --name bong-store

# Save PM2 config
pm2 save

# Auto-start on boot
pm2 startup
```

### Step 6: Configure Nginx
Create file: `/etc/nginx/sites-available/bong-store`
```nginx
server {
    listen 80;
    server_name your-domain.com;

    location / {
        proxy_pass http://localhost:3000;
        proxy_http_version 1.1;
        proxy_set_header Upgrade $http_upgrade;
        proxy_set_header Connection 'upgrade';
        proxy_set_header Host $host;
        proxy_cache_bypass $http_upgrade;
    }

    location /uploads {
        alias /var/www/bong-store/public/uploads;
        expires 30d;
    }
}
```

Enable site:
```bash
ln -s /etc/nginx/sites-available/bong-store /etc/nginx/sites-enabled/
nginx -t
systemctl restart nginx
```

### Step 7: Setup SSL (Free with Let's Encrypt)
```bash
apt install -y certbot python3-certbot-nginx
certbot --nginx -d your-domain.com
```

**✅ Pros**: Full control, can host multiple projects
**⚠️ Cons**: Requires server management knowledge

---

## 5️⃣ Docker Deployment

A Docker configuration is included in your project. Use it for:
- Easy deployment on any platform
- Consistent environments
- Container orchestration

See `docker-compose.yml` for details.

---

## 🔐 Post-Deployment Steps

### 1. Change Admin Password
```bash
# Access your admin panel
https://your-domain.com/admin.html

# Login with default credentials
Username: admin
Password: admin123

# Go to settings and change password
```

### 2. Update Session Secret
Never use the default secret in production!

**For Render/Railway/Heroku**: Set environment variable:
```
SESSION_SECRET=generate-a-random-string-here
```

**For VPS**: Create `.env` file:
```bash
cd /var/www/bong-store
nano .env
```

Add:
```env
NODE_ENV=production
SESSION_SECRET=your-super-secret-random-string
PORT=3000
```

Update `server.js` to use it (see `.env` file in project).

### 3. Setup Database Backups

**For VPS**:
```bash
# Create backup script
nano /root/backup-bong-store.sh
```

Add:
```bash
#!/bin/bash
cp /var/www/bong-store/phonestore.db /var/backups/phonestore-$(date +%Y%m%d-%H%M%S).db
find /var/backups -name "phonestore-*.db" -mtime +7 -delete
```

Make executable and schedule:
```bash
chmod +x /root/backup-bong-store.sh
crontab -e
# Add: 0 2 * * * /root/backup-bong-store.sh
```

### 4. Monitor Your Application

**Using PM2 (VPS)**:
```bash
pm2 monit                    # Real-time monitoring
pm2 logs bong-store          # View logs
pm2 restart bong-store       # Restart app
```

**Using Platform Tools**:
- Render: Built-in metrics dashboard
- Railway: Logs and metrics in dashboard
- Heroku: `heroku logs --tail`

---

## 🔧 Troubleshooting

### Issue: App crashes after deployment
**Solution**: Check logs for errors
```bash
# Render: View in dashboard
# Railway: View in dashboard
# Heroku: heroku logs --tail
# VPS: pm2 logs bong-store
```

### Issue: Database not persisting
**Solution**: Ensure database file has write permissions
```bash
# VPS
chmod 666 /var/www/bong-store/phonestore.db
chown www-data:www-data /var/www/bong-store/phonestore.db
```

### Issue: Images not uploading
**Solution**: Check uploads directory permissions
```bash
# VPS
mkdir -p /var/www/bong-store/public/uploads
chmod 777 /var/www/bong-store/public/uploads
```

### Issue: "Cannot GET /" error
**Solution**: Ensure static files are served correctly
- Check that `public` folder is included in deployment
- Verify `app.use(express.static('public'))` in server.js

### Issue: Session not persisting
**Solution**: 
- Ensure SESSION_SECRET is set
- Check if cookies are enabled
- For production, consider using Redis for sessions

### Issue: Port already in use
**Solution**: Change port in environment variables
```bash
# Set PORT environment variable
PORT=8080
```

---

## 📊 Performance Optimization

### 1. Enable Compression
Already included in your project setup.

### 2. Setup CDN for Static Assets
Use Cloudflare (free) to cache images and static files.

### 3. Database Optimization
For high traffic, consider migrating to PostgreSQL:
- More concurrent connections
- Better performance under load
- Built-in backup tools

### 4. Add Caching
Implement Redis for:
- Session storage
- Product catalog caching
- Rate limiting

---

## 🎓 Recommended Deployment Path

**For Beginners**: Start with Render (free tier)
**For Production**: VPS with proper monitoring
**For Scaling**: Railway or Heroku with PostgreSQL

---

## 📞 Support

If you encounter issues:
1. Check server logs first
2. Verify environment variables
3. Test locally with production settings
4. Check platform status pages

---

## 🔄 Update Deployment

### For Git-based deployments (Render/Railway/Heroku):
```bash
git add .
git commit -m "Update description"
git push origin main
# Deployment happens automatically
```

### For VPS:
```bash
ssh root@your-server-ip
cd /var/www/bong-store
git pull origin main
npm install
pm2 restart bong-store
```

---

## ✅ Deployment Checklist

- [ ] Change default admin password
- [ ] Set SESSION_SECRET environment variable
- [ ] Configure database backups
- [ ] Setup monitoring
- [ ] Enable HTTPS/SSL
- [ ] Test all features (login, products, reviews, uploads)
- [ ] Setup error logging
- [ ] Configure domain name (if using custom domain)
- [ ] Add site to Google Search Console (optional)
- [ ] Test mobile responsiveness

---

**🎉 Congratulations! Your Bong Store System is now deployed!**

Access your store at your deployment URL and start managing your phone inventory!
