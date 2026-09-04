const express = require('express');
const session = require('express-session');
const bcrypt = require('bcryptjs');
const path = require('path');
const multer = require('multer');
const fs = require('fs');
const { initDatabase, saveDatabase, getDatabase } = require('./database');

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

// Login
app.post('/api/auth/login', async (req, res) => {
  const { username, password } = req.body;
  const db = getDatabase();

  try {
    const result = db.exec(`SELECT * FROM users WHERE username = ?`, [username]);
    
    if (result.length === 0 || result[0].values.length === 0) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    const user = {
      id: result[0].values[0][0],
      username: result[0].values[0][1],
      password: result[0].values[0][2],
      role: result[0].values[0][3]
    };

    const validPassword = await bcrypt.compare(password, user.password);
    if (!validPassword) {
      return res.status(401).json({ error: 'Invalid credentials' });
    }

    req.session.user = {
      id: user.id,
      username: user.username,
      role: user.role
    };

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

// ==================== SETTINGS & PROFILE ROUTES ====================

// Get store settings (Public)
app.get('/api/settings', (req, res) => {
  const db = getDatabase();
  try {
    const result = db.exec("SELECT key, value FROM settings");
    const settings = {
      store_name: 'Bong Store',
      store_tagline: 'Premium Smartphones & Tech Store',
      store_phone: '+855 12 345 678',
      store_email: 'contact@bongstore.com',
      store_logo: ''
    };
    if (result.length > 0 && result[0].values) {
      result[0].values.forEach(([k, v]) => {
        settings[k] = v;
      });
    }
    res.set('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
    res.set('Pragma', 'no-cache');
    res.set('Expires', '0');
    res.json(settings);
  } catch (error) {
    res.status(500).json({ error: 'Failed to fetch settings' });
  }
});

// Update store settings (Admin only)
app.put('/api/settings', requireAdmin, (req, res) => {
  const { store_name, store_tagline, store_phone, store_email, store_logo } = req.body;
  const db = getDatabase();
  try {
    const upsert = (k, v) => {
      if (v !== undefined) {
        db.run(`
          INSERT INTO settings (key, value) VALUES (?, ?)
          ON CONFLICT(key) DO UPDATE SET value = excluded.value
        `, [k, String(v).trim()]);
      }
    };
    upsert('store_name', store_name);
    upsert('store_tagline', store_tagline);
    upsert('store_phone', store_phone);
    upsert('store_email', store_email);
    upsert('store_logo', store_logo);

    saveDatabase();
    res.json({ success: true, message: 'Settings saved successfully' });
  } catch (error) {
    console.error('Settings update error:', error);
    res.status(500).json({ error: 'Failed to update settings' });
  }
});

// Get admin profile (Admin only)
app.get('/api/admin/profile', requireAdmin, (req, res) => {
  const db = getDatabase();
  try {
    const userId = req.session.user.id;
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
  const db = getDatabase();
  const userId = req.session.user.id;

  try {
    // Fetch current user
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
app.get('/api/products', (req, res) => {
  const db = getDatabase();
  try {
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
app.get('/api/products/:id', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
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
app.post('/api/products', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { name, brand, category, price, size, description, image_url, stock } = req.body;

  try {
    db.run(`
      INSERT INTO products (name, brand, category, price, size, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, [name, brand, category || null, price, size || null, description, image_url || getPlaceholderImage('Phone'), stock || 0]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM products ORDER BY id DESC LIMIT 1`);
    const { columns, values } = result[0];
    const product = mapProduct(columns, values[0]);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to create product' });
  }
});

// Update product (admin only)
app.put('/api/products/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { name, brand, category, price, size, description, image_url, stock } = req.body;

  try {
    db.run(`
      UPDATE products 
      SET name = ?, brand = ?, category = ?, price = ?, size = ?, description = ?, image_url = ?, stock = ?
      WHERE id = ?
    `, [name, brand, category, price, size, description, image_url, stock, id]);

    saveDatabase();

    const result = db.exec(`SELECT * FROM products WHERE id = ?`, [id]);
    const { columns, values } = result[0];
    const product = mapProduct(columns, values[0]);

    res.json(product);
  } catch (error) {
    res.status(500).json({ error: 'Failed to update product' });
  }
});

// Delete product (admin only)
app.delete('/api/products/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    db.run(`DELETE FROM products WHERE id = ?`, [id]);
    db.run(`DELETE FROM reviews WHERE product_id = ?`, [id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete product' });
  }
});

// ==================== REVIEW ROUTES ====================

// Get reviews for a product
app.get('/api/products/:id/reviews', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
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
app.get('/api/reviews', requireAdmin, (req, res) => {
  const db = getDatabase();

  try {
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
app.post('/api/products/:id/reviews', (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { customer_name, rating, comment } = req.body;

  if (!customer_name || !rating) {
    return res.status(400).json({ error: 'Customer name and rating are required' });
  }

  if (rating < 1 || rating > 5) {
    return res.status(400).json({ error: 'Rating must be between 1 and 5' });
  }

  try {
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
app.delete('/api/reviews/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
    db.run(`DELETE FROM reviews WHERE id = ?`, [id]);
    saveDatabase();

    res.json({ success: true });
  } catch (error) {
    res.status(500).json({ error: 'Failed to delete review' });
  }
});

// ==================== STATS ROUTES (Admin) ====================

app.get('/api/stats', requireAdmin, (req, res) => {
  const db = getDatabase();

  try {
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
app.get('/api/brands', (req, res) => {
  const db = getDatabase();
  try {
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
app.post('/api/brands', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { name, description, logo_url } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Brand name is required' });
  }

  try {
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
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Brand already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create brand' });
    }
  }
});

// Update brand (admin only)
app.put('/api/brands/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { name, description, logo_url } = req.body;

  try {
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
app.delete('/api/brands/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
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
app.get('/api/categories', (req, res) => {
  const db = getDatabase();
  try {
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
app.post('/api/categories', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { name, description, icon } = req.body;

  if (!name) {
    return res.status(400).json({ error: 'Category name is required' });
  }

  try {
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
    if (error.message && error.message.includes('UNIQUE')) {
      res.status(400).json({ error: 'Category already exists' });
    } else {
      res.status(500).json({ error: 'Failed to create category' });
    }
  }
});

// Update category (admin only)
app.put('/api/categories/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;
  const { name, description, icon } = req.body;

  try {
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
app.delete('/api/categories/:id', requireAdmin, (req, res) => {
  const db = getDatabase();
  const { id } = req.params;

  try {
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
    await initDatabase();
    console.log('✓ Database initialized');

    app.listen(PORT, '0.0.0.0', () => {
      console.log(`✓ Phone Store server running on http://localhost:${PORT}`);
      console.log(`✓ Admin login: username=admin, password=admin123`);
    });
  } catch (error) {
    console.error('Failed to start server:', error);
    process.exit(1);
  }
}

startServer();
