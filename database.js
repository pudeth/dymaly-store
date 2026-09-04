const initSqlJs = require('sql.js');
const fs = require('fs');
const path = require('path');
const bcrypt = require('bcryptjs');

const DATA_DIR = process.env.DATA_DIR || (fs.existsSync('/data') ? '/data' : __dirname);
const DB_PATH = path.join(DATA_DIR, 'phonestore.db');
let db = null;

// Helper function to generate authentic brand logo SVG data URIs
function getBrandLogoDataUri(brandName) {
  const normalized = (brandName || '').toLowerCase().trim();
  let innerSvg = '';
  if (normalized === 'apple') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100" height="100">
      <rect width="170" height="170" rx="36" fill="#f5f1e8"/>
      <path d="M132.68 114.93c-2.16 4.98-4.71 9.56-7.66 13.78-3.95 5.74-7.18 9.72-9.67 11.93-3.86 3.62-8 5.48-12.43 5.59-3.18 0-7.02-.92-11.48-2.79-4.47-1.86-8.6-2.79-12.36-2.79-3.95 0-8.18.93-12.72 2.79-4.53 1.87-8.19 2.85-10.98 2.95-3.75.11-7.9-1.67-12.43-5.35-3.18-2.67-6.61-6.86-10.31-12.56-5.06-7.74-9.01-16.52-11.84-26.33-2.83-9.82-4.24-19.14-4.24-27.96 0-12.63 3.09-23.15 9.28-31.57 6.19-8.42 14.04-12.72 23.55-12.91 4.13 0 8.72 1.1 13.79 3.3 5.07 2.2 8.35 3.4 9.83 3.59 1.88-.28 5.31-1.53 10.31-3.74 5-2.21 9.47-3.25 13.41-3.12 10.6.48 19.12 4.22 25.59 11.21-9.19 5.65-13.7 13.5-13.52 23.55.19 7.85 3.22 14.5 9.1 19.96 5.88 5.46 12.81 8.6 20.78 9.43-1.88 5.84-4.14 11.49-6.76 16.95zm-23.02-92.31c0 4.79-1.59 9.48-4.78 14.08-3.19 4.6-7.22 7.85-12.1 9.77-.94-4.22-1.03-8.43-.28-12.64.75-4.22 2.53-8.42 5.35-12.63 3-4.41 6.66-7.57 10.97-9.48.56 3.64.84 7.27.84 10.9z" fill="#1d1d1f"/>
    </svg>`;
  } else if (normalized === 'google') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
      <g transform="translate(18, 18) scale(2.66)">
        <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
        <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
        <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
        <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
      </g>
    </svg>`;
  } else if (normalized === 'samsung') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
      <text x="50" y="55" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="900" letter-spacing="0.5" fill="#1428a0">SAMSUNG</text>
    </svg>`;
  } else if (normalized === 'oneplus') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
      <rect x="25" y="25" width="50" height="50" rx="10" fill="#eb0028"/>
      <text x="50" y="58" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="900" fill="#ffffff">1+</text>
    </svg>`;
  } else if (normalized === 'xiaomi') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
      <rect x="25" y="25" width="50" height="50" rx="14" fill="#ff6900"/>
      <text x="50" y="56" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff">mi</text>
    </svg>`;
  } else {
    const clean = (brandName || 'B').toUpperCase().slice(0, 2);
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
      <rect width="100" height="100" rx="20" fill="#f5eee3"/>
      <text x="50" y="56" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#ff9f43">${clean}</text>
    </svg>`;
  }
  return 'data:image/svg+xml;base64,' + Buffer.from(innerSvg).toString('base64');
}

// Helper function to generate placeholder image SVG
function getPlaceholderImage(text, width = 300, height = 300) {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}">
    <rect width="100%" height="100%" fill="#e0e0e0"/>
    <text x="50%" y="50%" dominant-baseline="middle" text-anchor="middle" font-family="Arial, sans-serif" font-size="18" fill="#757575">${text}</text>
  </svg>`;
  return 'data:image/svg+xml;base64,' + Buffer.from(svg).toString('base64');
}

async function initDatabase() {
  const SQL = await initSqlJs();
  
  // Seed persistent database from repository seed if it does not exist yet
  if (!fs.existsSync(DB_PATH)) {
    const seedPath = path.join(__dirname, 'phonestore.db');
    if (fs.existsSync(seedPath) && seedPath !== DB_PATH) {
      try {
        fs.copyFileSync(seedPath, DB_PATH);
        console.log(`✓ Seeded initial database to ${DB_PATH}`);
      } catch (err) {
        console.warn('Could not copy seed database:', err.message);
      }
    }
  }

  // Load existing database or create new one
  if (fs.existsSync(DB_PATH)) {
    const buffer = fs.readFileSync(DB_PATH);
    db = new SQL.Database(buffer);
    migrateDatabase();
  } else {
    db = new SQL.Database();
    await createTables();
    await insertSampleData();
    saveDatabase();
  }
  
  return db;
}

function migrateDatabase() {
  try {
    const tableInfo = db.exec("PRAGMA table_info(products)");
    if (tableInfo.length > 0 && tableInfo[0].values) {
      const columns = tableInfo[0].values.map(c => c[1]);
      if (!columns.includes('size')) {
        db.run("ALTER TABLE products ADD COLUMN size TEXT");
        const defaultSizes = {
          'iPhone 15 Pro': '256GB',
          'Samsung Galaxy S24 Ultra': '512GB',
          'Google Pixel 8 Pro': '128GB',
          'OnePlus 12': '256GB',
          'Xiaomi 14 Pro': '256GB',
          'iPhone 14': '128GB'
        };
        for (const [name, size] of Object.entries(defaultSizes)) {
          try {
            db.run("UPDATE products SET size = ? WHERE name = ? AND (size IS NULL OR size = '')", [size, name]);
          } catch (e) {}
        }
        saveDatabase();
        console.log('✓ Database migrated: added size column to products table');
      }
    }

    // Migrate brand logos from broken placeholder URLs to vector SVGs
    try {
      const brandsResult = db.exec("SELECT id, name, logo_url FROM brands");
      if (brandsResult.length > 0 && brandsResult[0].values) {
        let updatedCount = 0;
        for (const [id, name, logo_url] of brandsResult[0].values) {
          if (!logo_url || logo_url.includes('via.placeholder.com') || logo_url.includes('text=Apple') || logo_url.includes('text=Google') || logo_url.includes('text=Samsung') || logo_url.includes('text=OnePlus') || logo_url.includes('text=Xiaomi')) {
            const newLogo = getBrandLogoDataUri(name);
            db.run("UPDATE brands SET logo_url = ? WHERE id = ?", [newLogo, id]);
            updatedCount++;
          }
        }
        if (updatedCount > 0) {
          saveDatabase();
          console.log(`✓ Database migrated: updated ${updatedCount} brand logos to vector SVG icons`);
        }
      }
    } catch (e) {
      console.warn('Brand logo migration notice:', e);
    }

    // Migrate settings table and user profile columns
    try {
      db.run(`
        CREATE TABLE IF NOT EXISTS settings (
          key TEXT PRIMARY KEY,
          value TEXT
        )
      `);

      // Seed default settings if not exists
      const defaultSettings = [
        ['store_name', 'DyMaly'],
        ['store_tagline', 'Phones & audio, delivered fast'],
        ['store_phone', '+855 12 345 678'],
        ['store_email', 'contact@dymaly.com'],
        ['store_logo', ''],
        ['store_badge', 'Official Store'],
        ['announcement_enabled', 'true'],
        ['announcement_text', '🎉 Grand Opening: Free express delivery on all phones + 1-Year Official Warranty 🚚'],
        ['announcement_link', '#productsSection'],
        ['announcement_badge', 'Special Offer'],
        ['hero_badge', '✨ Featured Flagship 2026'],
        ['hero_title', 'Next-Gen Smartphones'],
        ['hero_subtitle', 'Titanium design, powerful mobile AI chips & pro-grade triple camera systems.'],
        ['hero_btn_text', 'Explore Phones →'],
        ['hero_btn_link', '#productsSection'],
        ['store_address', 'Preah Monivong Blvd, Phnom Penh, Cambodia'],
        ['store_hours', 'Mon - Sun: 8:00 AM - 9:00 PM'],
        ['store_telegram', '@dymaly_store'],
        ['social_telegram', 'https://t.me/dymaly_store'],
        ['social_facebook', 'https://facebook.com'],
        ['social_tiktok', 'https://tiktok.com'],
        ['social_instagram', 'https://instagram.com'],
        ['badge_1_icon', '🚀'],
        ['badge_1_title', 'Express Delivery'],
        ['badge_1_desc', 'Fast shipping nationwide'],
        ['badge_2_icon', '🛡️'],
        ['badge_2_title', 'Official Warranty'],
        ['badge_2_desc', '1-Year genuine warranty'],
        ['badge_3_icon', '💬'],
        ['badge_3_title', '24/7 Support'],
        ['badge_3_desc', 'Instant help via Telegram'],
        ['badge_4_icon', '🔄'],
        ['badge_4_title', '7-Day Return'],
        ['badge_4_desc', 'Hassle-free exchange'],
        ['footer_about', 'DyMaly is your trusted premier destination for authentic smartphones, high-end audio, and cutting-edge tech accessories in Cambodia.'],
        ['footer_copyright', '© 2026 DyMaly Phone Store. All rights reserved.'],
        ['site_version', String(Date.now())]
      ];

      for (const [key, value] of defaultSettings) {
        const check = db.exec("SELECT value FROM settings WHERE key = ?", [key]);
        if (check.length === 0 || check[0].values.length === 0) {
          db.run("INSERT INTO settings (key, value) VALUES (?, ?)", [key, value]);
        }
      }

      // Check users table columns for display_name, email, phone, avatar_url
      const userInfo = db.exec("PRAGMA table_info(users)");
      if (userInfo.length > 0 && userInfo[0].values) {
        const userCols = userInfo[0].values.map(c => c[1]);
        if (!userCols.includes('display_name')) {
          db.run("ALTER TABLE users ADD COLUMN display_name TEXT");
        }
        if (!userCols.includes('email')) {
          db.run("ALTER TABLE users ADD COLUMN email TEXT");
        }
        if (!userCols.includes('phone')) {
          db.run("ALTER TABLE users ADD COLUMN phone TEXT");
        }
        if (!userCols.includes('avatar_url')) {
          db.run("ALTER TABLE users ADD COLUMN avatar_url TEXT");
        }

        // Set default values for admin user
        db.run(`
          UPDATE users 
          SET display_name = COALESCE(NULLIF(display_name, ''), 'Store Administrator'),
              email = COALESCE(NULLIF(email, ''), 'admin@bongstore.com'),
              phone = COALESCE(NULLIF(phone, ''), '+855 12 345 678')
          WHERE role = 'admin'
        `);
      }
      saveDatabase();
      console.log('✓ Database migrated: verified settings table, store logo & admin avatar fields');
    } catch (e) {
      console.warn('Settings table migration notice:', e);
    }
  } catch (error) {
    console.error('Migration error:', error);
  }
}

async function createTables() {
  // Users table (for admin authentication)
  db.run(`
    CREATE TABLE IF NOT EXISTS users (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      username TEXT UNIQUE NOT NULL,
      password TEXT NOT NULL,
      role TEXT NOT NULL DEFAULT 'customer',
      display_name TEXT,
      email TEXT,
      phone TEXT,
      avatar_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Settings table
  db.run(`
    CREATE TABLE IF NOT EXISTS settings (
      key TEXT PRIMARY KEY,
      value TEXT
    )
  `);

  // Brands table
  db.run(`
    CREATE TABLE IF NOT EXISTS brands (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      logo_url TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Categories table
  db.run(`
    CREATE TABLE IF NOT EXISTS categories (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT UNIQUE NOT NULL,
      description TEXT,
      icon TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Products table
  db.run(`
    CREATE TABLE IF NOT EXISTS products (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      name TEXT NOT NULL,
      brand TEXT NOT NULL,
      category TEXT,
      price REAL NOT NULL,
      size TEXT,
      description TEXT,
      image_url TEXT,
      stock INTEGER DEFAULT 0,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP
    )
  `);

  // Reviews table
  db.run(`
    CREATE TABLE IF NOT EXISTS reviews (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      product_id INTEGER NOT NULL,
      customer_name TEXT NOT NULL,
      rating INTEGER NOT NULL CHECK(rating >= 1 AND rating <= 5),
      comment TEXT,
      created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
      FOREIGN KEY (product_id) REFERENCES products(id)
    )
  `);
}

async function insertSampleData() {
  // Create admin user (username: admin, password: admin123)
  const hashedPassword = await bcrypt.hash('admin123', 10);
  db.run(`
    INSERT INTO users (username, password, role) 
    VALUES ('admin', ?, 'admin')
  `, [hashedPassword]);

  // Insert sample brands
  const brands = [
    ['Apple', 'Premium smartphones and technology', getBrandLogoDataUri('Apple')],
    ['Samsung', 'Leading Android smartphones and electronics', getBrandLogoDataUri('Samsung')],
    ['Google', 'Pure Android experience with AI features', getBrandLogoDataUri('Google')],
    ['OnePlus', 'Never Settle - Flagship killers', getBrandLogoDataUri('OnePlus')],
    ['Xiaomi', 'Innovation for everyone', getBrandLogoDataUri('Xiaomi')]
  ];

  brands.forEach(brand => {
    db.run(`
      INSERT INTO brands (name, description, logo_url)
      VALUES (?, ?, ?)
    `, brand);
  });

  // Insert sample categories
  const categories = [
    ['Smartphones', 'Mobile phones and smartphones', '📱'],
    ['Accessories', 'Phone cases, chargers, and more', '🎧'],
    ['Tablets', 'Tablets and iPad devices', '📲'],
    ['Wearables', 'Smartwatches and fitness trackers', '⌚'],
    ['Audio', 'Headphones, earbuds, and speakers', '🎵']
  ];

  categories.forEach(category => {
    db.run(`
      INSERT INTO categories (name, description, icon)
      VALUES (?, ?, ?)
    `, category);
  });

  // Insert sample products
  const products = [
    ['iPhone 15 Pro', 'Apple', 'Smartphones', 999.99, '256GB', 'Latest iPhone with A17 Pro chip, titanium design', '/uploads/iphone-14.svg', 15],
    ['Samsung Galaxy S24 Ultra', 'Samsung', 'Smartphones', 1199.99, '512GB', 'Premium Android phone with S Pen and 200MP camera', '/uploads/galaxy-s24.svg', 20],
    ['Google Pixel 8 Pro', 'Google', 'Smartphones', 899.99, '128GB', 'Best camera phone with Google AI features', '/uploads/pixel-8-pro.svg', 12],
    ['OnePlus 12', 'OnePlus', 'Smartphones', 799.99, '256GB', 'Flagship killer with Snapdragon 8 Gen 3', '/uploads/oneplus-12.svg', 18],
    ['Xiaomi 14 Pro', 'Xiaomi', 'Smartphones', 749.99, '256GB', 'Great value flagship with Leica cameras', '/uploads/xiaomi-14.svg', 10],
    ['iPhone 14', 'Apple', 'Smartphones', 699.99, '128GB', 'Previous generation iPhone, still powerful', '/uploads/iphone-14.svg', 25]
  ];

  products.forEach(product => {
    db.run(`
      INSERT INTO products (name, brand, category, price, size, description, image_url, stock)
      VALUES (?, ?, ?, ?, ?, ?, ?, ?)
    `, product);
  });

  // Insert sample reviews
  const reviews = [
    [1, 'John Doe', 5, 'Amazing phone! The camera quality is outstanding.'],
    [1, 'Sarah Smith', 4, 'Great device but a bit pricey.'],
    [2, 'Mike Johnson', 5, 'Best Android phone I have ever owned!'],
    [3, 'Emily Brown', 5, 'The camera AI is incredible. Love the photo quality.'],
    [4, 'David Lee', 4, 'Fast charging and smooth performance. Recommended!']
  ];

  reviews.forEach(review => {
    db.run(`
      INSERT INTO reviews (product_id, customer_name, rating, comment)
      VALUES (?, ?, ?, ?)
    `, review);
  });
}

function saveDatabase() {
  const data = db.export();
  const buffer = Buffer.from(data);
  fs.writeFileSync(DB_PATH, buffer);
}

function getDatabase() {
  return db;
}

module.exports = {
  initDatabase,
  saveDatabase,
  getDatabase
};
