# 📱 Phone Store Website

A full-stack phone store web application with admin dashboard, customer product browsing, and review system.

## Features

### Customer Features
- **Product Browsing**: View all available phones with images, prices, and descriptions
- **Filter & Sort**: Filter by brand and sort by price or newest products
- **Product Details**: Click on any product to view detailed information
- **Customer Reviews**: Read reviews from other customers and submit your own reviews with ratings (1-5 stars)

### Admin Features
- **Secure Login**: Admin authentication with session management
- **Dashboard Statistics**: View total products, reviews, and average rating
- **Product Management**: Full CRUD operations (Create, Read, Update, Delete)
  - Add new products with details
  - Edit existing product information
  - Delete products (removes associated reviews automatically)
- **Review Monitoring**: View all customer reviews across all products
- **Review Moderation**: Delete inappropriate reviews

## Technology Stack

- **Backend**: Node.js with Express.js
- **Database**: SQLite with sql.js (no compilation required)
- **Authentication**: express-session with bcryptjs password hashing
- **Frontend**: Pure HTML, CSS, and JavaScript (no frameworks)
- **Styling**: Responsive CSS with modern design

## Installation

1. **Install dependencies**:
   ```bash
   npm install
   ```

2. **Start the server**:
   ```bash
   npm start
   ```

3. **Access the application**:
   - Customer Store: http://localhost:3000
   - Admin Dashboard: http://localhost:3000/admin.html

## Default Admin Credentials

- **Username**: `admin`
- **Password**: `admin123`

⚠️ **Important**: Change these credentials in production!

## Project Structure

```
phone-store/
├── server.js                 # Express server and API routes
├── database.js              # Database initialization and schema
├── package.json             # Project dependencies
├── phonestore.db           # SQLite database (created on first run)
├── public/                 # Static files
│   ├── index.html          # Customer store homepage
│   ├── product.html        # Product details page
│   ├── admin.html          # Admin dashboard
│   ├── css/
│   │   ├── style.css       # Customer site styles
│   │   └── admin.css       # Admin dashboard styles
│   └── js/
│       ├── main.js         # Customer store functionality
│       ├── product.js      # Product details functionality
│       └── admin.js        # Admin dashboard functionality
└── README.md               # This file
```

## API Endpoints

### Public Endpoints
- `GET /api/products` - Get all products
- `GET /api/products/:id` - Get single product
- `GET /api/products/:id/reviews` - Get reviews for a product
- `POST /api/products/:id/reviews` - Submit a review

### Admin Endpoints (Require Authentication)
- `POST /api/auth/login` - Admin login
- `POST /api/auth/logout` - Admin logout
- `GET /api/auth/status` - Check authentication status
- `GET /api/stats` - Get dashboard statistics
- `POST /api/products` - Create new product
- `PUT /api/products/:id` - Update product
- `DELETE /api/products/:id` - Delete product
- `GET /api/reviews` - Get all reviews
- `DELETE /api/reviews/:id` - Delete review

## Database Schema

### Users Table
- `id` - Primary key
- `username` - Unique username
- `password` - Bcrypt hashed password
- `role` - User role (admin/customer)
- `created_at` - Timestamp

### Products Table
- `id` - Primary key
- `name` - Product name
- `brand` - Product brand
- `price` - Product price
- `description` - Product description
- `image_url` - Product image URL
- `stock` - Available quantity
- `created_at` - Timestamp

### Reviews Table
- `id` - Primary key
- `product_id` - Foreign key to products
- `customer_name` - Reviewer name
- `rating` - Rating (1-5)
- `comment` - Review text
- `created_at` - Timestamp

## Sample Data

The application comes pre-loaded with:
- 1 admin user
- 6 sample phones (iPhone, Samsung, Google Pixel, OnePlus, Xiaomi)
- 5 sample reviews

## Usage Guide

### For Customers

1. **Browse Products**:
   - Visit http://localhost:3000
   - View all available phones
   - Filter by brand using the dropdown
   - Sort by price or newest products

2. **View Product Details**:
   - Click on any product card
   - See detailed information and reviews
   - Read what other customers are saying

3. **Submit a Review**:
   - On the product details page, scroll to the review form
   - Enter your name
   - Select a star rating (1-5 stars)
   - Write your review (optional)
   - Click "Submit Review"

### For Administrators

1. **Login**:
   - Visit http://localhost:3000/admin.html
   - Enter username: `admin`
   - Enter password: `admin123`
   - Click "Login"

2. **View Statistics**:
   - Click the "Statistics" tab
   - See total products, reviews, and average rating

3. **Manage Products**:
   - Click the "Products" tab
   - **Add Product**: Click "+ Add New Product" button
   - **Edit Product**: Click "Edit" on any product card
   - **Delete Product**: Click "Delete" (confirms before deleting)

4. **Monitor Reviews**:
   - Click the "Reviews" tab
   - View all customer reviews with product names
   - Delete inappropriate reviews if needed

5. **Logout**:
   - Click "Logout" button in the header

## Security Features

- Password hashing with bcryptjs
- Session-based authentication
- Admin-only protected routes
- SQL injection prevention (parameterized queries)
- Input validation on forms

## Development Notes

- Database is automatically created on first run
- Changes are persisted to `phonestore.db` file
- Server runs on port 3000 by default
- All API responses are in JSON format

## Future Enhancements

Potential features to add:
- User registration for customers
- Shopping cart functionality
- Order management system
- Image upload for products
- Email notifications
- Payment integration
- Product categories
- Search functionality
- Pagination for large product lists
- Advanced analytics dashboard

## Troubleshooting

**Server won't start:**
- Make sure port 3000 is not already in use
- Check that all dependencies are installed (`npm install`)

**Can't login to admin:**
- Use username: `admin` and password: `admin123`
- Check browser console for errors

**Database issues:**
- Delete `phonestore.db` file and restart the server to recreate it

**Products not showing:**
- Check the browser console for JavaScript errors
- Verify the server is running on http://localhost:3000

## License

MIT License - Feel free to use this project for learning or as a starting point for your own applications.

## Support

This is a demonstration project. For issues or questions, refer to the code comments and console logs for debugging.

---

**Built with ❤️ for learning and demonstration purposes**
