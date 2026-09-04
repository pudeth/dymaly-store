# ✅ Deployment Checklist

Use this checklist to ensure a successful deployment of your Bong Store System.

---

## 📋 Pre-Deployment

### Code Preparation
- [ ] All code changes committed
- [ ] No console.log statements in production code (or use proper logging)
- [ ] All dependencies listed in package.json
- [ ] Database initialization working correctly
- [ ] Image upload directory exists (`public/uploads`)
- [ ] Test application locally: `npm start`
- [ ] Test all features work locally

### Security
- [ ] Default admin password documented (will be changed after deployment)
- [ ] SESSION_SECRET ready (random string, min 32 characters)
- [ ] No sensitive data in code (API keys, passwords)
- [ ] .gitignore configured properly
- [ ] Environment variables prepared

### Documentation
- [ ] README.md up to date
- [ ] Deployment guide reviewed
- [ ] Admin credentials documented securely
- [ ] API endpoints documented (if needed)

---

## 🚀 During Deployment

### Platform Setup
- [ ] Deployment platform account created (Render/Railway/etc)
- [ ] Repository connected or files uploaded
- [ ] Build command set: `npm install`
- [ ] Start command set: `npm start`
- [ ] Port configured (usually 3000 or auto-assigned)

### Environment Variables
- [ ] `NODE_ENV` = `production`
- [ ] `SESSION_SECRET` = `[your-secret-key]`
- [ ] `PORT` = `3000` (if required)

### Build & Deploy
- [ ] Initial build successful
- [ ] No build errors in logs
- [ ] Application started without errors
- [ ] Health check passing (if available)

---

## ✅ Post-Deployment Testing

### Basic Access
- [ ] Site loads at deployment URL
- [ ] Homepage displays correctly
- [ ] CSS and images loading
- [ ] No console errors in browser

### Admin Panel
- [ ] Admin login page loads: `/admin.html`
- [ ] Can login with default credentials
  - Username: `admin`
  - Password: `admin123`
- [ ] Dashboard displays correctly
- [ ] Statistics showing (Products, Reviews, etc.)

### Product Management
- [ ] Can view products list
- [ ] Can add new product
- [ ] Can edit existing product
- [ ] Can delete product
- [ ] Product images display correctly

### Image Upload
- [ ] Can upload product image
- [ ] Uploaded image displays correctly
- [ ] Image URL is correct
- [ ] Can delete uploaded image

### Brand Management
- [ ] Can view brands
- [ ] Can add new brand
- [ ] Can upload brand logo
- [ ] Can edit brand
- [ ] Can delete brand (if not in use)

### Category Management
- [ ] Can view categories
- [ ] Can add new category
- [ ] Can edit category
- [ ] Can delete category (if not in use)

### Customer Features
- [ ] Homepage displays products
- [ ] Can search products
- [ ] Can filter by brand
- [ ] Can filter by category
- [ ] Product detail page works
- [ ] Can add items to cart
- [ ] Cart persists (localStorage)
- [ ] Can add to saved items
- [ ] Saved items persist

### Review System
- [ ] Can submit review on product page
- [ ] Review displays on product page
- [ ] Reviews show in admin panel
- [ ] Can delete review from admin panel
- [ ] Rating calculation correct

---

## 🔒 Security Hardening

### Immediate Actions (Priority 1)
- [ ] **Change admin password** via admin panel
- [ ] Verify SESSION_SECRET is set and unique
- [ ] Test that old admin password no longer works

### Important Actions (Priority 2)
- [ ] Enable HTTPS (usually automatic on platforms)
- [ ] Set up rate limiting (if using VPS)
- [ ] Configure firewall (if using VPS)
- [ ] Set proper file permissions (if using VPS)
  ```bash
  chmod 755 /var/www/bong-store
  chmod 666 phonestore.db
  chmod 777 public/uploads
  ```

### Recommended Actions (Priority 3)
- [ ] Add security headers (CSP, X-Frame-Options, etc.)
- [ ] Implement request logging
- [ ] Set up error monitoring
- [ ] Configure backup schedule
- [ ] Add API rate limiting

---

## 📱 Mobile Testing

- [ ] Test on mobile browser (Chrome/Safari)
- [ ] Homepage responsive
- [ ] Product grid displays correctly
- [ ] Product detail page readable
- [ ] Cart works on mobile
- [ ] Admin panel usable on tablet
- [ ] Touch interactions work
- [ ] Images load properly

---

## 🔄 Database & Backups

### Database
- [ ] Database file exists and accessible
- [ ] Database has write permissions
- [ ] Initial data populated (admin user, etc.)
- [ ] Can query database successfully

### Backup Setup
- [ ] Backup strategy decided
- [ ] Backup script created (if VPS)
- [ ] Backup schedule configured
- [ ] Test restore from backup
- [ ] Document backup location

**VPS Backup Script**:
```bash
# Create backup
cp /var/www/bong-store/phonestore.db /var/backups/phonestore-$(date +%Y%m%d).db

# Add to crontab for daily backup at 2 AM
crontab -e
# Add: 0 2 * * * cp /var/www/bong-store/phonestore.db /var/backups/phonestore-$(date +%Y%m%d).db
```

---

## 📊 Monitoring Setup

### Application Monitoring
- [ ] Log viewing setup
- [ ] Error tracking configured
- [ ] Uptime monitoring (UptimeRobot, etc.)
- [ ] Performance metrics available
- [ ] Disk space monitoring (for VPS)

### Monitoring Commands (VPS)
```bash
# View application logs
pm2 logs bong-store

# Monitor resources
pm2 monit

# Check application status
pm2 status

# Check disk space
df -h

# Check memory
free -m
```

---

## 🌐 Domain & DNS (Optional)

If using custom domain:
- [ ] Domain purchased
- [ ] DNS configured to point to deployment
- [ ] SSL certificate configured
- [ ] WWW and non-WWW versions working
- [ ] HTTPS redirect enabled
- [ ] DNS propagation complete (check: whatsmydns.net)

---

## 📈 Performance Optimization

### Basic Optimizations
- [ ] Gzip compression enabled
- [ ] Static file caching configured
- [ ] Image optimization reviewed
- [ ] Database queries optimized

### Advanced Optimizations (Optional)
- [ ] CDN setup for static assets (Cloudflare)
- [ ] Redis for session storage
- [ ] Database moved to PostgreSQL (for scaling)
- [ ] Load balancer configured (for high traffic)

---

## 📝 Documentation Updates

- [ ] Deployment URL documented
- [ ] Admin credentials stored securely
- [ ] Environment variables documented
- [ ] Backup procedures documented
- [ ] Update README with live site URL
- [ ] Create admin user guide
- [ ] Document any custom configurations

---

## 🎯 Launch Checklist

### Before Going Live
- [ ] All features tested and working
- [ ] Admin password changed from default
- [ ] Security measures in place
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Documentation complete

### Going Live
- [ ] Announce to users (if applicable)
- [ ] Monitor for first 24 hours
- [ ] Check logs for errors
- [ ] Verify all features work under real usage
- [ ] Get feedback from test users

### After Launch
- [ ] Monitor performance metrics
- [ ] Review logs daily (first week)
- [ ] Test backup restore procedure
- [ ] Plan for updates and maintenance
- [ ] Set up update schedule

---

## 🆘 Emergency Contacts

Document these for quick reference:

- **Hosting Provider Support**: _______________
- **Domain Registrar**: _______________
- **Developer Contact**: _______________
- **Database Backup Location**: _______________
- **Deployment URL**: _______________
- **Admin Panel URL**: _______________/admin.html

---

## 🔧 Rollback Plan

In case of issues:

1. **Render/Railway/Heroku**: 
   - Revert to previous deployment from dashboard
   - Or redeploy previous git commit

2. **VPS**:
   ```bash
   cd /var/www/bong-store
   git log  # Find previous working commit
   git checkout [commit-hash]
   npm install
   pm2 restart bong-store
   ```

3. **Database Rollback**:
   ```bash
   # Restore from backup
   cp /var/backups/phonestore-YYYYMMDD.db /var/www/bong-store/phonestore.db
   pm2 restart bong-store
   ```

---

## 📞 Getting Help

If you encounter issues:

1. **Check Logs First**
   - Render/Railway: Dashboard → Logs
   - Heroku: `heroku logs --tail`
   - VPS: `pm2 logs bong-store`

2. **Common Issues**: See [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md) Troubleshooting section

3. **Platform Status**: Check if platform is having issues
   - Render: status.render.com
   - Railway: status.railway.app
   - Heroku: status.heroku.com

4. **Review Documentation**: [DEPLOYMENT_GUIDE.md](./DEPLOYMENT_GUIDE.md)

---

## ✅ Final Verification

Before marking deployment as complete:

- [ ] All checklist items completed
- [ ] Site accessible and working
- [ ] Admin panel functional
- [ ] Security measures in place
- [ ] Backups configured
- [ ] Monitoring active
- [ ] Documentation updated
- [ ] Team notified (if applicable)

---

**🎉 Deployment Complete!**

**Deployment Date**: _________________  
**Deployed By**: _________________  
**Deployment URL**: _________________  
**Notes**: _________________

---

## 📅 Maintenance Schedule

Set reminders for:

- [ ] **Weekly**: Check logs and monitoring
- [ ] **Monthly**: Test backup restore
- [ ] **Quarterly**: Security review and updates
- [ ] **As needed**: Update dependencies
- [ ] **As needed**: Apply security patches

---

**Keep this checklist for future deployments and updates!**
