const mongoose = require('mongoose');
const bcrypt = require('bcryptjs');
const fs = require('fs');
const path = require('path');

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
      { key: 'store_tagline', value: 'Premium Smartphones & Tech Store' },
      { key: 'store_phone', value: '+855 12 345 678' },
      { key: 'store_email', value: 'contact@dymaly.com' },
      { key: 'store_logo', value: '' }
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
