# ⚡ Quick Deploy Guide

Choose your deployment method:

## 🚀 Method 1: Render (Fastest - 5 minutes)

### One-Click Deploy with Render Button:
1. Push your code to GitHub
2. Click this deploy button (add to your README):
   ```
   [![Deploy to Render](https://render.com/images/deploy-to-render-button.svg)](https://render.com/deploy)
   ```

### Manual Deploy:
1. **Go to** [render.com](https://render.com) → Sign Up/Login
2. **Click** "New +" → "Web Service"
3. **Connect** your GitHub repo or upload project
4. **Configure**:
   - Name: `bong-store-system`
   - Environment: `Node`
   - Build Command: `npm install`
   - Start Command: `npm start`
5. **Add Environment Variables**:
   - `NODE_ENV` = `production`
   - `SESSION_SECRET` = `your-random-secret-key-here`
6. **Click** "Create Web Service"
7. **Wait** 2-3 minutes for deployment
8. **Access** your site at: `https://bong-store-system.onrender.com`

**Default Login**: username=`admin`, password=`admin123`

---

## 🐳 Method 2: Docker (For Any Server)

### Prerequisites:
- Docker installed ([Get Docker](https://docs.docker.com/get-docker/))

### Deploy:
```bash
# 1. Navigate to project directory
cd "d:\Bong Store System"

# 2. Build and run with Docker Compose
docker-compose up -d

# 3. Access at http://localhost:3000
```

### Management:
```bash
# View logs
docker-compose logs -f

# Stop
docker-compose down

# Restart
docker-compose restart

# Update
docker-compose pull
docker-compose up -d
```

---

## 🖥️ Method 3: VPS (DigitalOcean, Linode, etc.)

### Quick Setup Script:
```bash
# SSH into your server
ssh root@your-server-ip

# Run this script
curl -o- https://raw.githubusercontent.com/nvm-sh/nvm/v0.39.0/install.sh | bash
export NVM_DIR="$HOME/.nvm"
source "$NVM_DIR/nvm.sh"
nvm install 18
npm install -g pm2

# Upload your project (from your local machine)
scp -r "d:\Bong Store System" root@your-server-ip:/var/www/bong-store

# Back on server
cd /var/www/bong-store
npm install --production
pm2 start server.js --name bong-store
pm2 save
pm2 startup

# Install Nginx (optional but recommended)
apt update
apt install -y nginx
# Configure nginx (see DEPLOYMENT_GUIDE.md)
```

---

## 🔧 Method 4: Railway (Easiest - 2 minutes)

1. **Go to** [railway.app](https://railway.app)
2. **Click** "Start a New Project"
3. **Select** "Deploy from GitHub repo" (or upload)
4. **Add Variables** (optional):
   - `SESSION_SECRET` = random string
5. **Deploy** - Railway auto-configures everything!
6. **Get Domain** from Railway dashboard

---

## 🧪 Method 5: Local Testing

### Run Locally:
```bash
# Windows PowerShell
cd "d:\Bong Store System"
npm install
npm start

# Access at http://localhost:3000
```

---

## ✅ Post-Deployment Checklist

After deployment:

1. **Test the site** - Visit your URL
2. **Login to admin** - `/admin.html`
   - Username: `admin`
   - Password: `admin123`
3. **Change admin password** - (via admin panel settings)
4. **Add products** - Test product creation
5. **Test image upload** - Upload a product image
6. **Test reviews** - Add a customer review
7. **Check mobile view** - Test on phone/tablet

---

## 🆘 Common Issues

### Issue: "Cannot GET /"
**Fix**: Ensure `public` folder is deployed

### Issue: Database not found
**Fix**: Ensure `phonestore.db` exists or database initializes on first run

### Issue: Images not uploading
**Fix**: Check `public/uploads` folder exists and has write permissions
```bash
mkdir -p public/uploads
chmod 777 public/uploads  # Linux/Mac
```

### Issue: Session not persisting
**Fix**: Set `SESSION_SECRET` environment variable

---

## 📊 Deployment Comparison

| Platform | Free Tier | Setup Time | Best For |
|----------|-----------|------------|----------|
| **Render** | ✅ Yes | 5 min | Quick start |
| **Railway** | ✅ $5 credit | 2 min | Easiest |
| **Heroku** | ❌ No | 5 min | Enterprise |
| **Docker** | N/A | 3 min | Any server |
| **VPS** | From $4/mo | 15 min | Full control |

---

## 🎯 Recommended Path

1. **Testing**: Start with Render free tier
2. **Production**: Move to VPS or paid Render plan
3. **Scale**: Add CDN, database optimization, load balancing

---

## 🔗 Useful Links

- [Full Deployment Guide](./DEPLOYMENT_GUIDE.md) - Detailed instructions
- [Docker Documentation](https://docs.docker.com/)
- [Render Documentation](https://render.com/docs)
- [Railway Documentation](https://docs.railway.app/)
- [PM2 Documentation](https://pm2.keymetrics.io/)

---

## 💡 Pro Tips

1. **Always change default passwords** after first deployment
2. **Set strong SESSION_SECRET** in environment variables
3. **Enable HTTPS** - Most platforms do this automatically
4. **Backup database regularly** - Especially `phonestore.db`
5. **Monitor logs** to catch errors early
6. **Use CDN** for static assets (images, CSS, JS)

---

**Need Help?** Check the [Full Deployment Guide](./DEPLOYMENT_GUIDE.md) or open an issue.

**🎉 Happy Deploying!**
