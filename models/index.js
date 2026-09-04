const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');
const dns = require('dns');
try { dns.setServers(['8.8.8.8', '1.1.1.1']); } catch (_) {}

const User = require('./User');
const Setting = require('./Setting');
const Brand = require('./Brand');
const Category = require('./Category');
const Product = require('./Product');
const Review = require('./Review');

function getBrandLogoDataUri(brandName) {
  const normalized = (brandName || '').toLowerCase().trim();
  let innerSvg = '';
  if (normalized === 'apple') {
    innerSvg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
      <rect width="100" height="100" rx="22" fill="#f5f1e8"/>
      <g transform="translate(19.7, 18.5) scale(2.6)">
        <path fill="#1d1d1f" d="M18.71 19.5c-.83 1.24-1.71 2.45-3.05 2.47-1.34.03-1.77-.79-3.29-.79-1.53 0-2 .77-3.27.82-1.31.05-2.3-1.32-3.14-2.53C4.25 17 2.94 12.45 4.7 9.39c.87-1.52 2.43-2.48 4.12-2.51 1.28-.02 2.5.87 3.29.87.78 0 2.26-1.07 3.81-.91.65.03 2.47.26 3.64 1.98-.09.06-2.17 1.28-2.15 3.81.03 3.02 2.65 4.03 2.68 4.04-.03.07-.42 1.44-1.38 2.83M15.97 4.54c.61-.74 1.04-1.77.92-2.81-.9.04-1.99.6-2.63 1.35-.57.66-.99 1.72-.88 2.76.99.08 1.98-.56 2.59-1.3"/>
      </g>
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

let isConnected = false;

async function connectMongoDB(uri) {
  const mongoUri = uri || process.env.MONGODB_URI;
  if (!mongoUri) {
    console.log('ℹ No MONGODB_URI provided. Ready for MongoDB connection string.');
    return false;
  }

  try {
    await mongoose.connect(mongoUri, {
      serverSelectionTimeoutMS: 5000
    });
    isConnected = true;
    console.log('✓ Connected to MongoDB successfully');
    await seedMongoDB();
    return true;
  } catch (err) {
    console.error('✗ MongoDB connection error:', err.message);
    isConnected = false;
    return false;
  }
}

async function seedMongoDB() {
  try {
    // 1. Seed Admin User
    const adminExists = await User.findOne({ username: 'admin' });
    if (!adminExists) {
      const hashedPassword = await bcrypt.hash('admin123', 10);
      await User.create({
        legacy_id: 1,
        username: 'admin',
        password: hashedPassword,
        role: 'admin',
        display_name: 'Store Administrator',
        email: 'admin@bongstore.com',
        phone: '+855 12 345 678'
      });
      console.log('✓ Seeded admin user in MongoDB (admin / admin123)');
    }

    // 2. Seed Default Settings
    const defaultSettings = [
      { key: 'store_name', value: 'DyMaly' },
      { key: 'store_tagline', value: 'Phones & audio, delivered fast' },
      { key: 'store_phone', value: '+855 12 345 678' },
      { key: 'store_email', value: 'contact@dymaly.com' },
      { key: 'store_logo', value: '' },
      { key: 'store_badge', value: 'Official Store' },
      
      // Top Announcement Bar
      { key: 'announcement_enabled', value: 'false' },
      { key: 'announcement_text', value: '' },
      { key: 'announcement_link', value: '' },
      { key: 'announcement_badge', value: '' },
      
      // Hero Promo Banner
      { key: 'hero_badge', value: '✨ Featured Flagship 2026' },
      { key: 'hero_title', value: 'Next-Gen Smartphones' },
      { key: 'hero_subtitle', value: 'Titanium design, powerful mobile AI chips & pro-grade triple camera systems.' },
      { key: 'hero_btn_text', value: 'Explore Phones →' },
      { key: 'hero_btn_link', value: '#productsSection' },
      
      // Contact & Store Location
      { key: 'store_address', value: 'Preah Monivong Blvd, Phnom Penh, Cambodia' },
      { key: 'store_hours', value: 'Mon - Sun: 8:00 AM - 9:00 PM' },
      { key: 'store_telegram', value: '@dymaly_store' },
      
      // Social Profiles
      { key: 'social_telegram', value: 'https://t.me/dymaly_store' },
      { key: 'social_facebook', value: 'https://facebook.com' },
      { key: 'social_tiktok', value: 'https://tiktok.com' },
      { key: 'social_instagram', value: 'https://instagram.com' },
      
      // Trust Guarantees
      { key: 'badge_1_icon', value: '🚀' },
      { key: 'badge_1_title', value: 'Express Delivery' },
      { key: 'badge_1_desc', value: 'Fast shipping nationwide' },
      { key: 'badge_2_icon', value: '🛡️' },
      { key: 'badge_2_title', value: 'Official Warranty' },
      { key: 'badge_2_desc', value: '1-Year genuine warranty' },
      { key: 'badge_3_icon', value: '💬' },
      { key: 'badge_3_title', value: '24/7 Support' },
      { key: 'badge_3_desc', value: 'Instant help via Telegram' },
      { key: 'badge_4_icon', value: '🔄' },
      { key: 'badge_4_title', value: '7-Day Return' },
      { key: 'badge_4_desc', value: 'Hassle-free exchange' },
      
      // Footer Content
      { key: 'footer_about', value: 'DyMaly is your trusted premier destination for authentic smartphones, high-end audio, and cutting-edge tech accessories in Cambodia.' },
      { key: 'footer_copyright', value: '© 2026 DyMaly Phone Store. All rights reserved.' },
      { key: 'site_version', value: String(Date.now()) }
    ];

    for (const s of defaultSettings) {
      const exists = await Setting.findOne({ key: s.key });
      if (!exists) {
        await Setting.create(s);
      }
    }

    // 3. Seed Brands
    const brandCount = await Brand.countDocuments();
    if (brandCount === 0) {
      const brands = [
        { legacy_id: 1, name: 'Apple', description: 'Premium smartphones and technology', logo_url: getBrandLogoDataUri('Apple') },
        { legacy_id: 2, name: 'Samsung', description: 'Leading Android smartphones and electronics', logo_url: getBrandLogoDataUri('Samsung') },
        { legacy_id: 3, name: 'Google', description: 'Pure Android experience with AI features', logo_url: getBrandLogoDataUri('Google') },
        { legacy_id: 4, name: 'OnePlus', description: 'Never Settle - Flagship killers', logo_url: getBrandLogoDataUri('OnePlus') },
        { legacy_id: 5, name: 'Xiaomi', description: 'Innovation for everyone', logo_url: getBrandLogoDataUri('Xiaomi') }
      ];
      await Brand.insertMany(brands);
      console.log('✓ Seeded brands in MongoDB');
    }

    // 4. Seed Categories
    const categoryCount = await Category.countDocuments();
    if (categoryCount === 0) {
      const categories = [
        { legacy_id: 1, name: 'Smartphones', description: 'Mobile phones and smartphones', icon: '📱' },
        { legacy_id: 2, name: 'Accessories', description: 'Phone cases, chargers, and more', icon: '🎧' },
        { legacy_id: 3, name: 'Tablets', description: 'Tablets and iPad devices', icon: '📲' },
        { legacy_id: 4, name: 'Wearables', description: 'Smartwatches and fitness trackers', icon: '⌚' },
        { legacy_id: 5, name: 'Audio', description: 'Headphones, earbuds, and speakers', icon: '🎵' }
      ];
      await Category.insertMany(categories);
      console.log('✓ Seeded categories in MongoDB');
    }

    // 5. Seed Products
    const productCount = await Product.countDocuments();
    if (productCount === 0) {
      const sampleProducts = [
        { legacy_id: 1, name: 'iPhone 15 Pro', brand: 'Apple', category: 'Smartphones', price: 999.99, size: '256GB', description: 'Latest iPhone with A17 Pro chip, titanium design', image_url: '/uploads/iphone-14.svg', stock: 15 },
        { legacy_id: 2, name: 'Samsung Galaxy S24 Ultra', brand: 'Samsung', category: 'Smartphones', price: 1199.99, size: '512GB', description: 'Premium Android phone with S Pen and 200MP camera', image_url: '/uploads/galaxy-s24.svg', stock: 20 },
        { legacy_id: 3, name: 'Google Pixel 8 Pro', brand: 'Google', category: 'Smartphones', price: 899.99, size: '128GB', description: 'Best camera phone with Google AI features', image_url: '/uploads/pixel-8-pro.svg', stock: 12 },
        { legacy_id: 4, name: 'OnePlus 12', brand: 'OnePlus', category: 'Smartphones', price: 799.99, size: '256GB', description: 'Flagship killer with Snapdragon 8 Gen 3', image_url: '/uploads/oneplus-12.svg', stock: 18 },
        { legacy_id: 5, name: 'Xiaomi 14 Pro', brand: 'Xiaomi', category: 'Smartphones', price: 749.99, size: '256GB', description: 'Great value flagship with Leica cameras', image_url: '/uploads/xiaomi-14.svg', stock: 10 },
        { legacy_id: 6, name: 'iPhone 14', brand: 'Apple', category: 'Smartphones', price: 699.99, size: '128GB', description: 'Previous generation iPhone, still powerful', image_url: '/uploads/iphone-14.svg', stock: 25 }
      ];
      await Product.insertMany(sampleProducts);
      console.log('✓ Seeded products in MongoDB');
    }

    // 6. Seed Reviews
    const reviewCount = await Review.countDocuments();
    if (reviewCount === 0) {
      const sampleReviews = [
        { legacy_id: 1, product_id: '1', customer_name: 'John Doe', rating: 5, comment: 'Amazing phone! The camera quality is outstanding.' },
        { legacy_id: 2, product_id: '1', customer_name: 'Sarah Smith', rating: 4, comment: 'Great device but a bit pricey.' },
        { legacy_id: 3, product_id: '2', customer_name: 'Mike Johnson', rating: 5, comment: 'Best Android phone I have ever owned!' },
        { legacy_id: 4, product_id: '3', customer_name: 'Emily Brown', rating: 5, comment: 'The camera AI is incredible. Love the photo quality.' },
        { legacy_id: 5, product_id: '4', customer_name: 'David Lee', rating: 4, comment: 'Fast charging and smooth performance. Recommended!' }
      ];
      await Review.insertMany(sampleReviews);
      console.log('✓ Seeded reviews in MongoDB');
    }
  } catch (err) {
    console.error('MongoDB seed notice:', err.message);
  }
}

module.exports = {
  mongoose,
  User,
  Setting,
  Brand,
  Category,
  Product,
  Review,
  connectMongoDB,
  seedMongoDB,
  isMongoConnected: () => isConnected,
  getBrandLogoDataUri
};
