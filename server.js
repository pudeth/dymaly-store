const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDatabase, saveDatabase, getDatabase } = require('./database');
const {
  mongoose,
  User,
  Setting,
  Brand,
  Category,
  Product,
  Review,
  connectMongoDB,
  isMongoConnected
} = require('./models');

// Helper to query MongoDB by either _id or legacy integer id
function findByIdOrLegacy(model, id) {
  if (!id) return model.findOne({ _id: null });
  if (mongoose.isValidObjectId(id)) {
    return model.findOne({ $or: [{ _id: id }, { legacy_id: isNaN(Number(id)) ? -1 : Number(id) }] });
  } else if (!isNaN(Number(id))) {
    return model.findOne({ legacy_id: Number(id) });
  } else {
    return model.findOne({ _id: id });
  }
}

const app = express();
const PORT = process.env.PORT || 3000;

// Helper function to generate placeholder image SVG
function getPlaceholderImage(text, width = 300, height = 300) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#757575">${text}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

// Uploads directory configuration (supports persistent disk /data/uploads)
const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : null);
const uploadsDir = DATA_DIR ? path.join(DATA_DIR, 'uploads') : path.join(__dirname, 'public', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Auto-seed initial image assets to persistent disk if running on /data
const seedUploadsDir = path.join(__dirname, 'public', 'uploads');
if (DATA_DIR && seedUploadsDir !== uploadsDir && fs.existsSync(seedUploadsDir)) {
  try {
    const seedFiles = fs.readdirSync(seedUploadsDir);
    seedFiles.forEach(file => {
      const destFile = path.join(uploadsDir, file);
      if (!fs.existsSync(destFile)) {
        fs.copyFileSync(path.join(seedUploadsDir, file), destFile);
      }
    });
    console.log(`✓ Seeded ${seedFiles.length} upload assets to ${uploadsDir}`);
  } catch (err) {
    console.warn('Could not seed uploads to persistent directory:', err.message);
  }
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: function (req, file, cb) {
    cb(null, uploadsDir);
  },
  filename: function (req, file, cb) {
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    cb(null, 'product-' + uniqueSuffix + path.extname(file.originalname));
  }
});

const upload = multer({
  storage: storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5MB limit
  fileFilter: function (req, file, cb) {
    const allowedTypes = /jpeg|jpg|png|gif|webp/;
    const extname = allowedTypes.test(path.extname(file.originalname).toLowerCase());
    const mimetype = allowedTypes.test(file.mimetype);
    
    if (mimetype && extname) {
      return cb(null, true);
    } else {
      cb(new Error('Only image files are allowed!'));
    }
  }
});

// Middleware
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(express.static('public'));
app.use('/uploads', express.static(uploadsDir));

// Session configuration
app.use(session({
  secret: process.env.SESSION_SECRET || 'phone-store-secret-key-change-in-production',
  resave: false,
  saveUninitialized: false,
  cookie: { maxAge: 24 * 60 * 60 * 1000 } // 24 hours
}));

// Authentication middleware
function requireAdmin(req, res, next) {
  if (req.session.user && req.session.user.role === 'admin') {
    next();
  } else {
    res.status(401).json({ error: 'Unauthorized. Admin access required.' });
  }
}

// ==================== AUTH ROUTES ====================

app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;

  try {
    let user = null;
    let passwordHash = null;

    if (isMongoConnected()) {
      const doc = await User.findOne({ username });
      if (doc) {
        user = {
          id: doc.id,
          username: doc.username,
          role: doc.role,
          display_name: doc.display_name,
          email: doc.email,
          phone: doc.phone,
          avatar_url: doc.avatar_url
        };
        passwordHash = doc.password;
      }
    } else {
      const db = getDatabase();
      const result = db.exec(`SELECT * FROM users WHERE username = ?`, [username]);
      if (result.length > 0 && result[0].values.length > 0) {
        const row = result[0].values[0];
        user = {
          id: row[0],
          username: row[1],
          role: row[3],
          display_name: row[4] || 'Store Administrator',
          email: row[5] || 'admin@bongstore.com',
          phone: row[6] || '+855 12 345 678',
          avatar_url: row[7] || ''
        };
        passwordHash = row[2];
      }
    }

    if (!user || !passwordHash) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const validPassword = await bcrypt.compare(password, passwordHash);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = user;

    res.json({ 
      success: true, 
      user: { 
        username: user.username, 
        role: user.role 
      } 
    });
  } catch (error) {
    res.status(500).json({ error: 'Login failed' });
  }
});

// Logout
app.post('/api/auth/logout', (req, res) => {
  req.session.destroy();
  res.json({ success: true });
});

// Check auth status
app.get('/api/auth/status', (req, res) => {
  if (req.session.user) {
    res.json({ 
      authenticated: true, 
      user: req.session.user 
    });
  } else {
    res.json({ authenticated: false });
  }
});

// ==================== REAL-TIME LIVE STREAM (SSE) ====================

const sseClients = new Set();

function broadcastRealtimeUpdate(type, payload = {}) {
  const data = JSON.stringify({ type, payload, timestamp: Date.now() });
  const message = `data: ${data}\n\n`;
  for (const client of sseClients) {
    try {
      client.write(message);
    } catch (_) {
      sseClients.delete(client);
    }
  }
}

// Server-Sent Events endpoint for real-time live synchronization
app.get('/api/realtime/stream', (req, res) => {
  res.setHeader('Content-Type', 'text/event-stream');
  res.setHeader('Cache-Control', 'no-cache, no-transform');
  res.setHeader('Connection', 'keep-alive');
  res.setHeader('X-Accel-Buffering', 'no');
  res.flushHeaders();

  // Send initial handshake
  res.write(`data: ${JSON.stringify({ type: 'connected', timestamp: Date.now() })}\n\n`);
  sseClients.add(res);

  // Periodic keep-alive comment to prevent cloud proxies from dropping idle connections
  const keepAliveTimer = setInterval(() => {
    try {
      res.write(': keep-alive\n\n');
    } catch (_) {
      clearInterval(keepAliveTimer);
      sseClients.delete(res);
    }
  }, 25000);

  req.on('close', () => {
    clearInterval(keepAliveTimer);
    sseClients.delete(res);
  });
});

// Default settings dictionary for comprehensive website information
const DEFAULT_SITE_SETTINGS = {
  store_name: 'DyMaly',
  store_tagline: 'Phones & audio, delivered fast',
  store_phone: '+855 12 345 678',
  store_email: 'contact@dymaly.com',
  store_logo: '',
  store_badge: 'Official Store',
  announcement_enabled: 'true',
  announcement_text: '🎉 Grand Opening: Free express delivery on all phones + 1-Year Official Warranty 🚚',
  announcement_link: '#productsSection',
  announcement_badge: 'Special Offer',
  hero_badge: '✨ Featured Flagship 2026',
  hero_title: 'Next-Gen Smartphones',
  hero_subtitle: 'Titanium design, powerful mobile AI chips & pro-grade triple camera systems.',
  hero_btn_text: 'Explore Phones →',
  hero_btn_link: '#productsSection',
  store_address: 'Preah Monivong Blvd, Phnom Penh, Cambodia',
  store_hours: 'Mon - Sun: 8:00 AM - 9:00 PM',
  store_telegram: '@dymaly_store',
  social_telegram: 'https://t.me/dymaly_store',
  social_facebook: 'https://facebook.com',
  social_tiktok: 'https://tiktok.com',
  social_instagram: 'https://instagram.com',
  badge_1_icon: '🚀',
  badge_1_title: 'Express Delivery',
  badge_1_desc: 'Fast shipping nationwide',
  badge_2_icon: '🛡️',
  badge_2_title: 'Official Warranty',
  badge_2_desc: '1-Year genuine warranty',
  badge_3_icon: '💬',
  badge_3_title: '24/7 Support',
  badge_3_desc: 'Instant help via Telegram',
  badge_4_icon: '🔄',
  badge_4_title: '7-Day Return',
  badge_4_desc: 'Hassle-free exchange',
  footer_about: 'DyMaly is your trusted premier destination for authentic smartphones, high-end audio, and cutting-edge tech accessories in Cambodia.',
  footer_copyright: '© 2026 DyMaly Phone Store. All rights reserved.',
  site_version: String(Date.now())
};

// ==================== SETTINGS & PROFILE ROUTES ====================

// Get store settings (Public - all website info)
app.get('/api/settings', async (req, res) => {
  try {
    const settings = { ...DEFAULT_SITE_SETTINGS };

    if (isMongoConnected()) {
      const docs = await Setting.find({});
      docs.forEach(d => {
        settings[d.key] = d.value;
      });
    } else {
      const db = getDatabase();
      const result = db.exec("SELECT key, value FROM settings");
      if (result.length > 0 && result[0].values) {
        result[0].values.forEach(([k, v]) => {
          settings[k] = v;
        });
      }
    }

    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update store settings (Admin only - dynamic for all website info)
app.put('/api/settings', requireAdmin, async (req, res) => {
  try {
    const payload = { ...req.body, site_version: String(Date.now()) };

    if (isMongoConnected()) {
      for (const [key, rawVal] of Object.entries(payload)) {
        if (rawVal !== undefined && typeof rawVal !== 'object') {
          await Setting.findOneAndUpdate(
            { key },
            { key, value: String(rawVal).trim() },
            { upsert: true, new: true }
          );
        }
      }
      
      // Broadcast real-time update to all connected customers
      const allDocs = await Setting.find({});
      const updatedSettings = { ...DEFAULT_SITE_SETTINGS };
      allDocs.forEach(d => { updatedSettings[d.key] = d.value; });
      broadcastRealtimeUpdate('settings_updated', updatedSettings);

      return res.json({ success: true, message: 'Settings saved and synced in real-time', settings: updatedSettings });
    }

    // SQLite fallback
    const db = getDatabase();
    for (const [key, rawVal] of Object.entries(payload)) {
      if (rawVal !== undefined && typeof rawVal !== 'object') {
        db.run(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `, [key, String(rawVal).trim()]);
      }
    }

    saveDatabase();

    const result = db.exec("SELECT key, value FROM settings");
    const updatedSettings = { ...DEFAULT_SITE_SETTINGS };
    if (result.length > 0 && result[0].values) {
      result[0].values.forEach(([k, v]) => {
        updatedSettings[k] = v;
      });
    }

    // Broadcast real-time update to all connected customers
    broadcastRealtimeUpdate('settings_updated', updatedSettings);

    res.json({ success: true, message: 'Settings saved and synced in real-time', settings: updatedSettings });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get admin profile (Admin only)
app.get('/api/admin/profile', requireAdmin, async (req, res) => {
  try {
    const userId = req.session.user.id;

    if (isMongoConnected()) {
      const user = await findByIdOrLegacy(User, userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }
      return res.json({
        id: user.id,
        username: user.username,
        role: user.role,
        display_name: user.display_name || 'Store Administrator',
        email: user.email || 'admin@bongstore.com',
        phone: user.phone || '+855 12 345 678',
        avatar_url: user.avatar_url || ''
      });
    }

    const db = getDatabase();
    const result = db.exec("SELECT id, username, role, display_name, email, phone, avatar_url FROM users WHERE id = ?", [userId]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const [id, username, role, display_name, email, phone, avatar_url] = result[0].values[0];
    res.json({
      id,
      username,
      role,
      display_name: display_name || 'Store Administrator',
      email: email || 'admin@bongstore.com',
      phone: phone || '+855 12 345 678',
      avatar_url: avatar_url || ''
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch profile' });
  }
});

// Update admin profile & password (Admin only)
app.put('/api/admin/profile', requireAdmin, async (req, res) => {
  const { username, display_name, email, phone, avatar_url, current_password, new_password } = req.body;
  const userId = req.session.user.id;

  try {
    if (isMongoConnected()) {
      const user = await findByIdOrLegacy(User, userId);
      if (!user) {
        return res.status(404).json({ error: 'User not found' });
      }

      if (new_password) {
        if (!current_password) {
          return res.status(400).json({ error: 'Current password is required to set a new password' });
        }
        const valid = await bcrypt.compare(current_password, user.password);
        if (!valid) {
          return res.status(400).json({ error: 'Incorrect current password' });
        }
        user.password = await bcrypt.hash(new_password, 10);
      }

      if (username && username !== user.username) {
        const conflict = await User.findOne({ username, _id: { $ne: user._id } });
        if (conflict) {
          return res.status(400).json({ error: 'Username already taken' });
        }
        user.username = username.trim();
      }

      if (display_name !== undefined) user.display_name = display_name.trim();
      if (email !== undefined) user.email = email.trim();
      if (phone !== undefined) user.phone = phone.trim();
      if (avatar_url !== undefined) user.avatar_url = avatar_url.trim();

      await user.save();

      req.session.user.username = user.username;
      req.session.user.display_name = user.display_name;
      req.session.user.avatar_url = user.avatar_url;

      return res.json({
        success: true,
        message: 'Profile updated successfully',
        user: {
          id: user.id,
          username: user.username,
          display_name: user.display_name,
          email: user.email,
          phone: user.phone,
          avatar_url: user.avatar_url
        }
      });
    }

    // SQLite fallback
    const db = getDatabase();
    const result = db.exec("SELECT * FROM users WHERE id = ?", [userId]);
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'User not found' });
    }
    const userRow = result[0].values[0];
    const currentHashed = userRow[2];

    // If new password requested, verify current password
    if (new_password) {
      if (!current_password) {
        return res.status(400).json({ error: 'Current password is required to set a new password' });
      }
      const valid = await bcrypt.compare(current_password, currentHashed);
      if (!valid) {
        return res.status(400).json({ error: 'Incorrect current password' });
      }
      const hashedNew = await bcrypt.hash(new_password, 10);
      db.run("UPDATE users SET password = ? WHERE id = ?", [hashedNew, userId]);
    }

    // Check if new username conflicts with another user
    if (username && username !== userRow[1]) {
      const conflict = db.exec("SELECT id FROM users WHERE username = ? AND id != ?", [username, userId]);
      if (conflict.length > 0 && conflict[0].values.length > 0) {
        return res.status(400).json({ error: 'Username already taken' });
      }
    }

    const updatedUsername = username ? username.trim() : userRow[1];
    const updatedDisplayName = display_name ? display_name.trim() : (userRow[4] || 'Store Administrator');
    const updatedEmail = email ? email.trim() : (userRow[5] || 'admin@bongstore.com');
    const updatedPhone = phone ? phone.trim() : (userRow[6] || '+855 12 345 678');
    const updatedAvatar = avatar_url !== undefined ? avatar_url.trim() : (userRow[7] || '');

    db.run(`
      UPDATE users 
      SET username = ?, display_name = ?, email = ?, phone = ?, avatar_url = ? 
      WHERE id = ?
    `, [updatedUsername, updatedDisplayName, updatedEmail, updatedPhone, updatedAvatar, userId]);

    saveDatabase();

    // Update session
    req.session.user.username = updatedUsername;
    req.session.user.display_name = updatedDisplayName;
    req.session.user.avatar_url = updatedAvatar;

    res.json({
      success: true,
      message: 'Profile updated successfully',
      user: {
        id: userId,
        username: updatedUsername,
        display_name: updatedDisplayName,
        email: updatedEmail,
        phone: updatedPhone,
        avatar_url: updatedAvatar
      }
    });
  } catch (error) {
    console.error('Profile update error:', error);
    res.status(500).json({ error: 'Failed to update profile' });
  }
});

// ==================== PRODUCT ROUTES ====================

// Helper to map SQL row to product object using column names
function mapProduct(columns, row) {
  const p = {};
  columns.forEach((col, idx) => {
    p[col] = row[idx];
  });
  return {
    id: p.id,
    name: p.name,
    brand: p.brand,
    category: p.category || '',
    price: p.price !== undefined && p.price !== null ? Number(p.price) : 0,
    size: p.size || '',
    description: p.description || '',
    image_url: p.image_url || '',
    stock: p.stock !== undefined && p.stock !== null ? Number(p.stock) : 0,
    created_at: p.created_at || ''
  };
}

// Get all products
app.get('/api/products', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const products = await Product.find({}).sort({ createdAt: -1 });
      return res.json(products);
    }

    const db = getDatabase();
    const result = db.exec(`SELECT * FROM products ORDER BY created_at DESC`);
    
    if (result.length === 0) {
      return res.json([]);
    }

    const { columns, values } = result[0];
    const products = values.map(row => mapProduct(columns, row));

    res.json(products);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch products' });
  }
});

// Get single product
app.get('/api/products/:id', async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const product = await findByIdOrLegacy(Product, id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }
      return res.json(product);
    }

    const db = getDatabase();
    const result = db.exec(`SELECT * FROM products WHERE id = ?`, [id]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(404).json({ error: 'Product not found' });
    }

    const { columns, values } = result[0];
    const product = mapProduct(columns, values[0]);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch product' });
  }
});

// Create product (admin only)
app.post('/api/products', requireAdmin, async (req, res) => {
  const { name, brand, category, price, size, description, image_url, stock } = req.body;

  try {
    if (isMongoConnected()) {
      const highest = await Product.findOne({}).sort({ legacy_id: -1 });
      const nextLegacyId = (highest && highest.legacy_id) ? highest.legacy_id + 1 : Date.now();
      const product = await Product.create({
        legacy_id: nextLegacyId,
        name,
        brand,
        category: category || '',
        price: Number(price) || 0,
        size: size || '',
        description: description || '',
        image_url: image_url || getPlaceholderImage('Phone'),
        stock: Number(stock) || 0
      });
      broadcastRealtimeUpdate('products_updated', { action: 'create', id: product.id });
      return res.json(product);
    }

    const db = getDatabase();
    db.run(`
      INSERT INTO products (name, brand, category, price, size, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, brand, category || null, price, size || null, description, image_url || getPlaceholderImage('Phone'), stock || 0]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM products ORDER BY id DESC LIMIT 1`);
    const { columns, values } = result[0];
    const product = mapProduct(columns, values[0]);

    broadcastRealtimeUpdate('products_updated', { action: 'create', id: product.id });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, brand, category, price, size, description, image_url, stock } = req.body;

  try {
    if (isMongoConnected()) {
      const product = await findByIdOrLegacy(Product, id);
      if (!product) {
        return res.status(404).json({ error: 'Product not found' });
      }

      if (name !== undefined) product.name = name;
      if (brand !== undefined) product.brand = brand;
      if (category !== undefined) product.category = category;
      if (price !== undefined) product.price = Number(price);
      if (size !== undefined) product.size = size;
      if (description !== undefined) product.description = description;
      if (image_url !== undefined) product.image_url = image_url;
      if (stock !== undefined) product.stock = Number(stock);

      await product.save();
      broadcastRealtimeUpdate('products_updated', { action: 'update', id: product.id });
      return res.json(product);
    }

    const db = getDatabase();
    db.run(`
      UPDATE products 
      SET name = ?, brand = ?, category = ?, price = ?, size = ?, description = ?, image_url = ?, stock = ?
      WHERE id = ?
    `, [name, brand, category, price, size, description, image_url, stock, id]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM products WHERE id = ?`, [id]);
    const { columns, values } = result[0];
    const product = mapProduct(columns, values[0]);

    broadcastRealtimeUpdate('products_updated', { action: 'update', id: product.id });
    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const product = await findByIdOrLegacy(Product, id);
      if (product) {
        await Review.deleteMany({
          $or: [
            { product_id: product.id },
            { product_id: String(product.legacy_id || '') }
          ]
        });
        await Product.deleteOne({ _id: product._id });
      }
      broadcastRealtimeUpdate('products_updated', { action: 'delete', id });
      return res.json({ success: true });
    }

    const db = getDatabase();
    db.run(`DELETE FROM products WHERE id = ?`, [id]);
    db.run(`DELETE FROM reviews WHERE product_id = ?`, [id]);
    saveDatabase();

    broadcastRealtimeUpdate('products_updated', { action: 'delete', id });
    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a product
app.get('/api/products/:id/reviews', async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const product = await findByIdOrLegacy(Product, id);
      const pidQueries = [{ product_id: String(id) }];
      if (product) {
        pidQueries.push({ product_id: product.id });
        if (product.legacy_id) pidQueries.push({ product_id: String(product.legacy_id) });
      }
      const reviews = await Review.find({ $or: pidQueries }).sort({ createdAt: -1 });
      return res.json(reviews);
    }

    const db = getDatabase();
    const result = db.exec(`
      SELECT * FROM reviews 
      WHERE product_id = ? 
      ORDER BY created_at DESC
    `, [id]);

    if (result.length === 0) {
      return res.json([]);
    }

    const reviews = result[0].values.map(row => ({
      id: row[0],
      product_id: row[1],
      customer_name: row[2],
      rating: row[3],
      comment: row[4],
      created_at: row[5]
    }));

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Get all reviews (admin only)
app.get('/api/reviews', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const reviews = await Review.find({}).sort({ createdAt: -1 }).lean({ virtuals: true });
      const products = await Product.find({}).lean({ virtuals: true });
      const productMap = {};
      products.forEach(p => {
        productMap[p._id.toString()] = p.name;
        if (p.legacy_id) productMap[String(p.legacy_id)] = p.name;
      });
      const enriched = reviews.map(r => ({
        ...r,
        id: r._id.toString(),
        product_name: productMap[r.product_id] || 'Product'
      }));
      return res.json(enriched);
    }

    const db = getDatabase();
    const result = db.exec(`
      SELECT r.*, p.name as product_name 
      FROM reviews r
      JOIN products p ON r.product_id = p.id
      ORDER BY r.created_at DESC
    `);

    if (result.length === 0) {
      return res.json([]);
    }

    const reviews = result[0].values.map(row => ({
      id: row[0],
      product_id: row[1],
      customer_name: row[2],
      rating: row[3],
      comment: row[4],
      created_at: row[5],
      product_name: row[6]
    }));

    res.json(reviews);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch reviews' });
  }
});

// Create review
app.post('/api/products/:id/reviews', async (req, res) => {
  const { id } = req.params;
  const { customer_name, rating, comment } = req.body;

  if (!customer_name || !rating) {
    return res.status(400).json({ error: 'Customer name and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
    if (isMongoConnected()) {
      const highest = await Review.findOne({}).sort({ legacy_id: -1 });
      const nextLegacyId = (highest && highest.legacy_id) ? highest.legacy_id + 1 : Date.now();
      const review = await Review.create({
        legacy_id: nextLegacyId,
        product_id: String(id),
        customer_name,
        rating: Number(rating),
        comment: comment || ''
      });
      return res.json(review);
    }

    const db = getDatabase();
    db.run(`
      INSERT INTO reviews (product_id, customer_name, rating, comment)
      VALUES (?, ?, ?, ?)
    `, [id, customer_name, rating, comment || '']);

    saveDatabase();

    const result = db.exec(`SELECT * FROM reviews ORDER BY id DESC LIMIT 1`);
    const row = result[0].values[0];
    const review = {
      id: row[0],
      product_id: row[1],
      customer_name: row[2],
      rating: row[3],
      comment: row[4],
      created_at: row[5]
    };

    res.json(review);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create review' });
  }
});

// Delete review (admin only)
app.delete('/api/reviews/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const review = await findByIdOrLegacy(Review, id);
      if (review) {
        await Review.deleteOne({ _id: review._id });
      }
      return res.json({ success: true });
    }

    const db = getDatabase();
    db.run(`DELETE FROM reviews WHERE id = ?`, [id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ==================== STATS ROUTES (Admin) ====================

app.get('/api/stats', requireAdmin, async (req, res) => {
  try {
    if (isMongoConnected()) {
      const totalProducts = await Product.countDocuments();
      const totalReviews = await Review.countDocuments();
      const avgAgg = await Review.aggregate([
        { $group: { _id: null, avgRating: { $avg: '$rating' } } }
      ]);
      const averageRating = avgAgg.length > 0 ? (avgAgg[0].avgRating || 0) : 0;
      return res.json({
        totalProducts,
        totalReviews,
        averageRating: Number(averageRating.toFixed(1))
      });
    }

    const db = getDatabase();
    const productsResult = db.exec(`SELECT COUNT(*) as count FROM products`);
    const reviewsResult = db.exec(`SELECT COUNT(*) as count FROM reviews`);
    const avgRatingResult = db.exec(`SELECT AVG(rating) as avg FROM reviews`);

    const stats = {
      totalProducts: productsResult[0].values[0][0],
      totalReviews: reviewsResult[0].values[0][0],
      averageRating: avgRatingResult[0].values[0][0] || 0
    };

    res.json(stats);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch stats' });
  }
});

// ==================== BRAND ROUTES ====================

// Upload image endpoint
app.post('/api/upload-image', requireAdmin, upload.single('image'), async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ error: 'No file uploaded' });
    }

    // 1. Free ImgBB cloud storage
    const imgbbKey = process.env.IMGBB_API_KEY || 'c16540642d8c8a419f34a1323eeb6038';
    if (imgbbKey) {
      try {
        const fileBuffer = fs.readFileSync(req.file.path);
        const fileBlob = new Blob([fileBuffer], { type: req.file.mimetype || 'image/jpeg' });
        const formBody = new FormData();
        formBody.append('image', fileBlob, req.file.originalname || req.file.filename);
        formBody.append('name', path.parse(req.file.originalname || req.file.filename).name);

        const imgbbRes = await fetch(`https://api.imgbb.com/1/upload?key=${imgbbKey}`, {
          method: 'POST',
          body: formBody,
          headers: {
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/120.0.0.0 Safari/537.36'
          }
        });
        const imgbbData = await imgbbRes.json();
        if (imgbbData && imgbbData.success && imgbbData.data && imgbbData.data.url) {
          console.log('✓ Uploaded image to ImgBB cloud:', imgbbData.data.url);
          return res.json({
            success: true,
            imageUrl: imgbbData.data.url,
            filename: req.file.filename
          });
        } else {
          console.warn('ImgBB API response warning:', imgbbData);
        }
      } catch (cloudErr) {
        console.warn('ImgBB upload fallback to local storage:', cloudErr.message);
      }
    }
    
    // 2. Default: Saved to uploadsDir (persistent disk /data/uploads or public/uploads)
    const imageUrl = '/uploads/' + req.file.filename;
    res.json({ 
      success: true, 
      imageUrl: imageUrl,
      filename: req.file.filename 
    });
  } catch (error) {
    res.status(500).json({ error: 'Failed to upload image' });
  }
});

// Delete image endpoint
app.delete('/api/delete-image', requireAdmin, (req, res) => {
  try {
    const { filename } = req.body;
    if (!filename) {
      return res.status(400).json({ error: 'Filename required' });
    }
    
    const filePath = path.join(uploadsDir, filename);
    if (fs.existsSync(filePath)) {
      fs.unlinkSync(filePath);
      res.json({ success: true });
    } else {
      res.status(404).json({ error: 'File not found' });
    }
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete image' });
  }
});

// ==================== BRAND ROUTES ====================

// Get all brands
app.get('/api/brands', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const brands = await Brand.find({}).sort({ name: 1 });
      return res.json(brands);
    }

    const db = getDatabase();
    const result = db.exec(`SELECT * FROM brands ORDER BY name ASC`);
    
    if (result.length === 0) {
      return res.json([]);
    }

    const brands = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      logo_url: row[3],
      created_at: row[4]
    }));

    res.json(brands);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch brands' });
  }
});

// Create brand (admin only)
app.post('/api/brands', requireAdmin, async (req, res) => {
  const { name, description, logo_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  try {
    if (isMongoConnected()) {
      const highest = await Brand.findOne({}).sort({ legacy_id: -1 });
      const nextLegacyId = (highest && highest.legacy_id) ? highest.legacy_id + 1 : Date.now();
      const brand = await Brand.create({
        legacy_id: nextLegacyId,
        name: name.trim(),
        description: description || '',
        logo_url: logo_url || getPlaceholderImage(name, 100, 100)
      });
      return res.json(brand);
    }

    const db = getDatabase();
    db.run(`
      INSERT INTO brands (name, description, logo_url)
      VALUES (?, ?, ?)
    `, [name, description || '', logo_url || getPlaceholderImage(name, 100, 100)]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM brands ORDER BY id DESC LIMIT 1`);
    const row = result[0].values[0];
    const brand = {
      id: row[0],
      name: row[1],
      description: row[2],
      logo_url: row[3],
      created_at: row[4]
    };

    res.json(brand);
  } catch (error) {
    if (error.message && (error.message.includes('UNIQUE') || error.code === 11000)) {
      res.status(400).json({ error: 'Brand already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }
});

// Update brand (admin only)
app.put('/api/brands/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, logo_url } = req.body;

  try {
    if (isMongoConnected()) {
      const brand = await findByIdOrLegacy(Brand, id);
      if (!brand) {
        return res.status(404).json({ error: 'Brand not found' });
      }
      if (name !== undefined) brand.name = name.trim();
      if (description !== undefined) brand.description = description;
      if (logo_url !== undefined) brand.logo_url = logo_url;
      await brand.save();
      return res.json(brand);
    }

    const db = getDatabase();
    db.run(`
      UPDATE brands 
      SET name = ?, description = ?, logo_url = ?
      WHERE id = ?
    `, [name, description, logo_url, id]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM brands WHERE id = ?`, [id]);
    const row = result[0].values[0];
    const brand = {
      id: row[0],
      name: row[1],
      description: row[2],
      logo_url: row[3],
      created_at: row[4]
    };

    res.json(brand);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update brand' });
  }
});

// Delete brand (admin only)
app.delete('/api/brands/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const brand = await findByIdOrLegacy(Brand, id);
      if (brand) {
        const productCount = await Product.countDocuments({ brand: brand.name });
        if (productCount > 0) {
          return res.status(400).json({ 
            error: `Cannot delete brand. ${productCount} product(s) are using this brand.` 
          });
        }
        await Brand.deleteOne({ _id: brand._id });
      }
      return res.json({ success: true });
    }

    const db = getDatabase();
    // Check if any products use this brand
    const checkResult = db.exec(`SELECT name FROM brands WHERE id = ?`, [id]);
    if (checkResult.length > 0 && checkResult[0].values.length > 0) {
      const brandName = checkResult[0].values[0][0];
      const productsResult = db.exec(`SELECT COUNT(*) FROM products WHERE brand = ?`, [brandName]);
      const productCount = productsResult[0].values[0][0];
      
      if (productCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete brand. ${productCount} product(s) are using this brand.` 
        });
      }
    }

    db.run(`DELETE FROM brands WHERE id = ?`, [id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete brand' });
  }
});

// ==================== CATEGORY ROUTES ====================

// Get all categories
app.get('/api/categories', async (req, res) => {
  try {
    if (isMongoConnected()) {
      const categories = await Category.find({}).sort({ name: 1 });
      return res.json(categories);
    }

    const db = getDatabase();
    const result = db.exec(`SELECT * FROM categories ORDER BY name ASC`);
    
    if (result.length === 0) {
      return res.json([]);
    }

    const categories = result[0].values.map(row => ({
      id: row[0],
      name: row[1],
      description: row[2],
      icon: row[3],
      created_at: row[4]
    }));

    res.json(categories);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch categories' });
  }
});

// Create category (admin only)
app.post('/api/categories', requireAdmin, async (req, res) => {
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
    if (isMongoConnected()) {
      const highest = await Category.findOne({}).sort({ legacy_id: -1 });
      const nextLegacyId = (highest && highest.legacy_id) ? highest.legacy_id + 1 : Date.now();
      const category = await Category.create({
        legacy_id: nextLegacyId,
        name: name.trim(),
        description: description || '',
        icon: icon || '📦'
      });
      return res.json(category);
    }

    const db = getDatabase();
    db.run(`
      INSERT INTO categories (name, description, icon)
      VALUES (?, ?, ?)
    `, [name, description || '', icon || '📦']);

    saveDatabase();

    const result = db.exec(`SELECT * FROM categories ORDER BY id DESC LIMIT 1`);
    const row = result[0].values[0];
    const category = {
      id: row[0],
      name: row[1],
      description: row[2],
      icon: row[3],
      created_at: row[4]
    };

    res.json(category);
  } catch (error) {
    if (error.message && (error.message.includes('UNIQUE') || error.code === 11000)) {
      res.status(400).json({ error: 'Category already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category (admin only)
app.put('/api/categories/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;
  const { name, description, icon } = req.body;

  try {
    if (isMongoConnected()) {
      const category = await findByIdOrLegacy(Category, id);
      if (!category) {
        return res.status(404).json({ error: 'Category not found' });
      }
      if (name !== undefined) category.name = name.trim();
      if (description !== undefined) category.description = description;
      if (icon !== undefined) category.icon = icon;
      await category.save();
      return res.json(category);
    }

    const db = getDatabase();
    db.run(`
      UPDATE categories 
      SET name = ?, description = ?, icon = ?
      WHERE id = ?
    `, [name, description, icon, id]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM categories WHERE id = ?`, [id]);
    const row = result[0].values[0];
    const category = {
      id: row[0],
      name: row[1],
      description: row[2],
      icon: row[3],
      created_at: row[4]
    };

    res.json(category);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update category' });
  }
});

// Delete category (admin only)
app.delete('/api/categories/:id', requireAdmin, async (req, res) => {
  const { id } = req.params;

  try {
    if (isMongoConnected()) {
      const category = await findByIdOrLegacy(Category, id);
      if (category) {
        const productCount = await Product.countDocuments({ category: category.name });
        if (productCount > 0) {
          return res.status(400).json({ 
            error: `Cannot delete category. ${productCount} product(s) are using this category.` 
          });
        }
        await Category.deleteOne({ _id: category._id });
      }
      return res.json({ success: true });
    }

    const db = getDatabase();
    // Check if any products use this category
    const checkResult = db.exec(`SELECT name FROM categories WHERE id = ?`, [id]);
    if (checkResult.length > 0 && checkResult[0].values.length > 0) {
      const categoryName = checkResult[0].values[0][0];
      const productsResult = db.exec(`SELECT COUNT(*) FROM products WHERE category = ?`, [categoryName]);
      const productCount = productsResult[0].values[0][0];
      
      if (productCount > 0) {
        return res.status(400).json({ 
          error: `Cannot delete category. ${productCount} product(s) are using this category.` 
        });
      }
    }

    db.run(`DELETE FROM categories WHERE id = ?`, [id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete category' });
  }
});

// ==================== START SERVER ====================

async function startServer() {
  try {
    let usingMongo = false;
    if (process.env.MONGODB_URI) {
      usingMongo = await connectMongoDB(process.env.MONGODB_URI);
    }

    if (!usingMongo) {
      await initDatabase();
      console.log('✓ SQLite Database initialized (Fallback)');
    } else {
      console.log('✓ MongoDB Atlas initialized as Primary Database');
    }

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Phone Store server running on http://localhost:${PORT}`);
      console.log(`✓ Database mode: ${usingMongo ? 'MongoDB Atlas (Cloud)' : 'SQLite (Local)'}`);
      console.log(`✓ Admin login: username=admin, password=admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
