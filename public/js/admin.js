// Global state
let currentTab = 'stats';
let isInitialized = false;

// Check authentication on load
async function checkAuth() {
    try {
        const response = await fetch('/api/auth/status');
        const data = await response.json();
        
        if (data.authenticated && data.user.role === 'admin') {
            showDashboard(data.user);
        } else {
            showLogin();
        }
    } catch (error) {
        console.error('Auth check error:', error);
        showLogin();
    }
}

function showLogin() {
    document.getElementById('loginSection').style.display = 'flex';
    document.getElementById('dashboardSection').style.display = 'none';
    loadStoreSettings();
}

function showDashboard(user) {
    document.getElementById('loginSection').style.display = 'none';
    document.getElementById('dashboardSection').style.display = 'block';
    const usernameEl = document.getElementById('adminUsername');
    if (usernameEl) {
        usernameEl.textContent = `Welcome, ${user.username}`;
    }
    loadTabContent(currentTab);
    
    // Load store identity and admin profile info
    loadStoreSettings();
    loadAdminProfile();
    
    // Initialize image upload after dashboard is shown
    setTimeout(() => {
        initializeImageUpload();
        initializeBrandLogoUpload();
        if (typeof initializeStoreLogoUpload === 'function') initializeStoreLogoUpload();
        if (typeof initializeAdminAvatarUpload === 'function') initializeAdminAvatarUpload();
        loadBrandDropdowns();
        loadCategoryDropdowns();
    }, 100);
}

// Initialize event listeners
function initializeEventListeners() {
    // Login handling
    const loginForm = document.getElementById('loginForm');
    if (loginForm) {
        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;
            const errorEl = document.getElementById('loginError');
            
            try {
                const response = await fetch('/api/auth/login', {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });
                
                const data = await response.json();
                
                if (response.ok) {
                    showDashboard(data.user);
                } else {
                    if (errorEl) errorEl.textContent = data.error || 'Login failed';
                }
            } catch (error) {
                console.error('Login error:', error);
                if (errorEl) errorEl.textContent = 'Connection error. Please try again.';
            }
        });
    }

    // Password visibility toggle
    const passwordToggleBtn = document.getElementById('passwordToggleBtn');
    if (passwordToggleBtn) {
        passwordToggleBtn.addEventListener('click', () => {
            const passwordInput = document.getElementById('password');
            const eyeIcon = document.getElementById('eyeIcon');
            if (passwordInput) {
                const isPassword = passwordInput.type === 'password';
                passwordInput.type = isPassword ? 'text' : 'password';
                if (eyeIcon) {
                    eyeIcon.innerHTML = isPassword 
                        ? '<path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24"></path><line x1="1" y1="1" x2="23" y2="23"></line>'
                        : '<path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path><circle cx="12" cy="12" r="3"></circle>';
                }
            }
        });
    }

    // Logout handling
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', async () => {
            try {
                await fetch('/api/auth/logout', { method: 'POST' });
                showLogin();
            } catch (error) {
                console.error('Logout error:', error);
            }
        });
    }

    // Tab switching
    document.querySelectorAll('.tab-btn').forEach(btn => {
        btn.addEventListener('click', () => {
            const tab = btn.dataset.tab;
            switchToTab(tab);
        });
    });
    
    // Initialize other listeners
    initializeProductSearch();
    initializeBrandSearch();
    initializeCategorySearch();
    initializeProductModal();
    initializeBrandModal();
    initializeCategoryModal();
}

// Global Tab Switcher with Unified Catalog support
window.switchToTab = function(tab) {
    let activeSubtab = null;
    if (tab === 'products' || tab === 'brands' || tab === 'categories') {
        activeSubtab = tab;
        tab = 'catalog';
    }
    currentTab = tab;
    
    document.querySelectorAll('.tab-btn').forEach(b => b.classList.remove('active'));
    document.querySelectorAll(`.tab-btn[data-tab="${tab}"]`).forEach(b => b.classList.add('active'));
    
    document.querySelectorAll('.tab-content').forEach(c => c.classList.remove('active'));
    const targetContent = document.getElementById(tab + 'Tab');
    if (targetContent) targetContent.classList.add('active');
    
    if (activeSubtab && typeof switchCatalogSubtab === 'function') {
        switchCatalogSubtab(activeSubtab);
    }
    loadTabContent(tab);
};

// Load tab content
async function loadTabContent(tab) {
    switch(tab) {
        case 'stats':
            await loadStats();
            break;
        case 'catalog':
            await loadCatalog();
            break;
        case 'reviews':
            await loadReviews();
            break;
        case 'settings':
            await loadStoreSettings();
            await loadAdminProfile();
            break;
    }
}

// Load statistics
async function loadStats() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        const reviewsResponse = await fetch('/api/reviews');
        const reviews = await reviewsResponse.json();
        
        // Calculate stats
        const totalProducts = products.length;
        const totalUnits = products.reduce((sum, p) => sum + p.stock, 0);
        const stockValue = products.reduce((sum, p) => sum + (p.price * p.stock), 0);
        const totalReviews = reviews.length;
        const avgRating = totalReviews > 0 
            ? (reviews.reduce((sum, r) => sum + r.rating, 0) / totalReviews)
            : 0;
        
        // Stock distribution
        const outOfStock = products.filter(p => p.stock === 0).length;
        const critical = products.filter(p => p.stock > 0 && p.stock <= 3).length;
        const lowStock = products.filter(p => p.stock > 3 && p.stock < 10).length;
        const normal = products.filter(p => p.stock >= 10 && p.stock <= 50).length;
        const highStock = products.filter(p => p.stock > 50).length;
        const needRestock = outOfStock + critical + lowStock;
        
        // Update UI
        document.getElementById('totalProducts').textContent = totalProducts;
        document.getElementById('totalUnits').textContent = `${totalUnits} total units`;
        document.getElementById('stockValue').textContent = `$${stockValue.toLocaleString('en-US', { minimumFractionDigits: 0, maximumFractionDigits: 0 })}`;
        document.getElementById('avgRating').textContent = avgRating.toFixed(1);
        document.getElementById('totalReviewsMeta').textContent = `${totalReviews} review${totalReviews !== 1 ? 's' : ''}`;
        document.getElementById('needRestock').textContent = needRestock;
        
        // Stock distribution counts
        document.getElementById('outOfStockCount').textContent = outOfStock;
        document.getElementById('criticalCount').textContent = critical;
        document.getElementById('lowStockCount').textContent = lowStock;
        document.getElementById('normalCount').textContent = normal;
        document.getElementById('highStockCount').textContent = highStock;
        
        // Load products needing attention
        await loadProductsNeedingAttention(products);
    } catch (error) {
        console.error('Error loading stats:', error);
    }
}

// Load products needing attention
async function loadProductsNeedingAttention(products) {
    const needingAttention = products.filter(p => p.stock === 0 || p.stock < 10)
        .sort((a, b) => a.stock - b.stock);
    
    const container = document.getElementById('lowStockList');
    
    if (needingAttention.length === 0) {
        container.innerHTML = `
            <div style="text-align: center; padding: 40px 20px; color: var(--text-muted);">
                <div style="font-size: 48px; margin-bottom: 16px;">✅</div>
                <p style="font-weight: 600;">All products are well stocked!</p>
            </div>
        `;
        return;
    }
    
    container.innerHTML = needingAttention.map(product => {
        let statusClass = 'low';
        let statusText = `${product.stock} left`;
        let statusColor = '#ffd93d';
        
        if (product.stock === 0) {
            statusClass = 'out';
            statusText = 'Out of Stock';
            statusColor = '#ef4444';
        } else if (product.stock <= 3) {
            statusClass = 'critical';
            statusText = `Only ${product.stock} left`;
            statusColor = '#ff9f43';
        }
        
        return `
            <div class="low-stock-item" style="border-left: 4px solid ${statusColor};">
                <div>
                    <div class="name">${product.name}</div>
                    <div class="brand">${product.brand} • ${window.BongI18n ? window.BongI18n.formatPrice(product.price) : `$${product.price.toFixed(2)}`}</div>
                </div>
                <div class="product-stock ${statusClass}">${statusText}</div>
            </div>
        `;
    }).join('');
}

// Load products
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        const products = await response.json();
        
        renderProducts(products);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Render products with optional filter
function renderProducts(products) {
    const container = document.getElementById('productsList');
    
    if (products.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No products found. Add your first product!</p></div>';
        return;
    }
    
    container.innerHTML = products.map(product => {
        const safeName = (product.name || 'Phone').replace(/'/g, "\\'");
        const safeBrand = (product.brand || '').replace(/'/g, "\\'");
        const stockClass = product.stock <= 5 ? 'stock-critical' : product.stock <= 15 ? 'stock-low' : 'stock-normal';
        const imgUrl = product.image_url || getPlaceholderImage(product.name, product.brand);
        
        return `
            <div class="product-card" data-id="${product.id}">
                <div class="product-img-wrap">
                    <img src="${imgUrl}" alt="${product.name}" onerror="this.onerror=null; this.src=getPlaceholderImage('${safeName}', '${safeBrand}');">
                </div>
                <div class="product-info">
                    <div class="product-header-row">
                        <span class="product-brand-badge" style="cursor: pointer;" onclick="browseBrandProducts('${safeBrand}')" title="Filter products by ${product.brand}">
                            ${product.brand}
                        </span>
                        <span class="product-stock-pill ${stockClass}">
                            <span class="stock-dot"></span> ${product.stock} in stock
                        </span>
                    </div>
                    <h3>${product.name}</h3>
                    <div class="product-price">${window.BongI18n ? window.BongI18n.formatPrice(product.price, { showBoth: true }) : `$${product.price.toFixed(2)}`}</div>
                    <p class="product-desc">${product.description || ''}</p>
                    <div class="product-actions">
                        <button class="btn-action btn-edit" onclick="editProduct('${product.id}')" aria-label="Edit ${product.name}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                                <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                            </svg>
                            <span>Edit</span>
                        </button>
                        <button class="btn-action btn-delete" onclick="deleteProduct('${product.id}')" aria-label="Delete ${product.name}">
                            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                <polyline points="3 6 5 6 21 6"></polyline>
                                <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                <line x1="10" y1="11" x2="10" y2="17"></line>
                                <line x1="14" y1="11" x2="14" y2="17"></line>
                            </svg>
                            <span>Delete</span>
                        </button>
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Product search functionality
let allAdminProducts = [];
let allProducts = []; // For editing

// Generate local luxury phone illustration placeholder (no external network needed)
function getPlaceholderImage(name = 'Phone', brand = '') {
    const cleanBrand = (brand || 'QKZ').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
            <linearGradient id="bgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fcfbfa"/>
                <stop offset="100%" stop-color="#ede7de"/>
            </linearGradient>
            <linearGradient id="phoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#40362f"/>
                <stop offset="100%" stop-color="#241e1a"/>
            </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#bgGrad)" rx="20"/>
        <g transform="translate(85, 35)">
            <rect x="0" y="0" width="130" height="210" rx="22" fill="url(#phoneGrad)" stroke="#d5c8b8" stroke-width="2"/>
            <rect x="6" y="6" width="118" height="198" rx="18" fill="#1c1714"/>
            <rect x="42" y="10" width="46" height="8" rx="4" fill="#332922"/>
            <circle cx="65" cy="14" r="2.5" fill="#4a3e35"/>
            <rect x="10" y="24" width="110" height="174" rx="12" fill="#2d241e"/>
            <g transform="translate(18, 34)" opacity="0.95">
                <rect x="0" y="0" width="44" height="44" rx="12" fill="#3d3229" stroke="#5c4d3f" stroke-width="1.5"/>
                <circle cx="14" cy="14" r="8.5" fill="#1f1814" stroke="#7a6755" stroke-width="1.5"/>
                <circle cx="14" cy="14" r="3" fill="#3b82f6" opacity="0.8"/>
                <circle cx="30" cy="22" r="7" fill="#1f1814" stroke="#7a6755" stroke-width="1.5"/>
                <circle cx="14" cy="30" r="6" fill="#1f1814" stroke="#7a6755" stroke-width="1.5"/>
            </g>
        </g>
        <text x="150" y="272" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="12" font-weight="800" fill="#8c7a6b" letter-spacing="1">${cleanBrand}</text>
    </svg>`;
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

// Generate brand logo placeholder with authentic vector graphics
function getBrandPlaceholder(text) {
    const normalized = (text || 'B').toLowerCase().trim();
    let svg = '';
    if (normalized === 'apple') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 170 170" width="100" height="100">
            <rect width="170" height="170" rx="36" fill="#f5f1e8"/>
            <path d="M132.68 114.93c-2.16 4.98-4.71 9.56-7.66 13.78-3.95 5.74-7.18 9.72-9.67 11.93-3.86 3.62-8 5.48-12.43 5.59-3.18 0-7.02-.92-11.48-2.79-4.47-1.86-8.6-2.79-12.36-2.79-3.95 0-8.18.93-12.72 2.79-4.53 1.87-8.19 2.85-10.98 2.95-3.75.11-7.9-1.67-12.43-5.35-3.18-2.67-6.61-6.86-10.31-12.56-5.06-7.74-9.01-16.52-11.84-26.33-2.83-9.82-4.24-19.14-4.24-27.96 0-12.63 3.09-23.15 9.28-31.57 6.19-8.42 14.04-12.72 23.55-12.91 4.13 0 8.72 1.1 13.79 3.3 5.07 2.2 8.35 3.4 9.83 3.59 1.88-.28 5.31-1.53 10.31-3.74 5-2.21 9.47-3.25 13.41-3.12 10.6.48 19.12 4.22 25.59 11.21-9.19 5.65-13.7 13.5-13.52 23.55.19 7.85 3.22 14.5 9.1 19.96 5.88 5.46 12.81 8.6 20.78 9.43-1.88 5.84-4.14 11.49-6.76 16.95zm-23.02-92.31c0 4.79-1.59 9.48-4.78 14.08-3.19 4.6-7.22 7.85-12.1 9.77-.94-4.22-1.03-8.43-.28-12.64.75-4.22 2.53-8.42 5.35-12.63 3-4.41 6.66-7.57 10.97-9.48.56 3.64.84 7.27.84 10.9z" fill="#1d1d1f"/>
        </svg>`;
    } else if (normalized === 'google') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
            <g transform="translate(18, 18) scale(2.66)">
                <path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/>
                <path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/>
                <path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/>
                <path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/>
            </g>
        </svg>`;
    } else if (normalized === 'samsung') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
            <text x="50" y="55" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="14" font-weight="900" letter-spacing="0.5" fill="#1428a0">SAMSUNG</text>
        </svg>`;
    } else if (normalized === 'oneplus') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
            <rect x="25" y="25" width="50" height="50" rx="10" fill="#eb0028"/>
            <text x="50" y="58" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="900" fill="#ffffff">1+</text>
        </svg>`;
    } else if (normalized === 'xiaomi') {
        svg = `<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 100 100" width="100" height="100">
            <rect width="100" height="100" rx="20" fill="#f5f1e8"/>
            <rect x="25" y="25" width="50" height="50" rx="14" fill="#ff6900"/>
            <text x="50" y="56" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="22" font-weight="900" fill="#ffffff">mi</text>
        </svg>`;
    } else {
        const clean = (text || 'B').toUpperCase().slice(0, 2);
        svg = `<svg xmlns="http://www.w3.org/2000/svg" width="100" height="100" viewBox="0 0 100 100">
            <rect width="100" height="100" rx="20" fill="#f5eee3"/>
            <text x="50" y="56" dominant-baseline="middle" text-anchor="middle" font-family="-apple-system, BlinkMacSystemFont, Segoe UI, Roboto, sans-serif" font-size="28" font-weight="800" fill="#ff9f43">${clean}</text>
        </svg>`;
    }
    return 'data:image/svg+xml;utf8,' + encodeURIComponent(svg);
}

async function loadProductsWithSearch() {
    try {
        const response = await fetch('/api/products');
        allAdminProducts = await response.json();
        allProducts = allAdminProducts; // Keep reference for editing
        renderProducts(allAdminProducts);
    } catch (error) {
        console.error('Error loading products:', error);
    }
}

// Initialize product search
function initializeProductSearch() {
    const productSearch = document.getElementById('productSearch');
    if (productSearch) {
        productSearch.addEventListener('input', () => {
            applyProductFilters();
        });
    }
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch('/api/reviews');
        const reviews = await response.json();
        
        const container = document.getElementById('reviewsList');
        
        if (reviews.length === 0) {
            container.innerHTML = '<p style="color: white;">No reviews yet.</p>';
            return;
        }
        
        container.innerHTML = reviews.map(review => `
            <div class="review-card">
                <div class="review-header">
                    <div class="review-product">${review.product_name}</div>
                    <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
                </div>
                <div class="review-customer">${review.customer_name}</div>
                <div class="review-date">${new Date(review.created_at).toLocaleDateString()}</div>
                <div class="review-comment">${review.comment}</div>
                <button class="btn btn-danger btn-small" onclick="deleteReview('${review.id}')">Delete</button>
            </div>
        `).join('');
    } catch (error) {
        console.error('Error loading reviews:', error);
    }
}

// Initialize product modal
function initializeProductModal() {
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', async () => {
            await loadBrandDropdowns();
            await loadCategoryDropdowns();
            
            document.getElementById('modalTitle').textContent = 'Add New Product';
            const productForm = document.getElementById('productForm');
            if (productForm) productForm.reset();
            document.getElementById('productId').value = '';
            
            resetImageUpload();
            
            const productModal = document.getElementById('productModal');
            if (productModal) productModal.style.display = 'flex';
        });
    }

    // Close button for product modal
    const closeModalBtn = document.querySelector('.modal-close');
    if (closeModalBtn) {
        closeModalBtn.addEventListener('click', closeProductModal);
    }

    // Product form submission
    const productForm = document.getElementById('productForm');
    if (productForm) {
        productForm.addEventListener('submit', handleProductFormSubmit);
    }
}

// Handle product form submit
async function handleProductFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('processing');
        submitBtn.disabled = true;
    }
    
    try {
        // Upload image first if there's a new file
        const productImageInput = document.getElementById('productImage');
        let imageUrl = currentImageUrl || (productImageInput ? productImageInput.value : '') || '';
        if (currentImageFile) {
            imageUrl = await uploadImage();
            if (!imageUrl) {
                throw new Error('Image upload failed');
            }
        }
        
        const id = document.getElementById('productId').value;
        const name = document.getElementById('productName').value;
        const brand = document.getElementById('productBrand').value;
        const category = document.getElementById('productCategory').value;
        const price = parseFloat(document.getElementById('productPrice').value);
        const size = document.getElementById('productSize').value;
        const stock = parseInt(document.getElementById('productStock').value);
        const description = document.getElementById('productDescription').value;
        
        const productData = {
            name,
            brand,
            category: category || null,
            price,
            size: size || null,
            stock,
            description,
            image_url: imageUrl || getPlaceholderImage(name)
        };
        
        const url = id ? `/api/products/${id}` : '/api/products';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(productData)
        });
        
        if (response.ok) {
            if (submitBtn) {
                submitBtn.classList.remove('processing');
                submitBtn.classList.add('success');
            }
            
            setTimeout(() => {
                closeProductModal();
                loadProductsWithSearch();
                showToast(id ? 'Product updated successfully!' : 'Product created successfully!');
                if (submitBtn) {
                    submitBtn.classList.remove('success');
                    submitBtn.disabled = false;
                }
            }, 1000);
        } else {
            const error = await response.json();
            throw new Error(error.error || 'Failed to save product');
        }
    } catch (error) {
        console.error('Error saving product:', error);
        alert('Failed to save product: ' + error.message);
        if (submitBtn) {
            submitBtn.classList.remove('processing');
            submitBtn.disabled = false;
        }
    }
}

// Edit product
async function editProduct(id) {
    try {
        const response = await fetch(`/api/products/${id}`);
        const product = await response.json();
        
        document.getElementById('modalTitle').textContent = 'Edit Product';
        document.getElementById('productId').value = product.id;
        document.getElementById('productName').value = product.name;
        document.getElementById('productBrand').value = product.brand;
        const categoryElem = document.getElementById('productCategory');
        if (categoryElem) categoryElem.value = product.category || '';
        document.getElementById('productPrice').value = product.price;
        const sizeElem = document.getElementById('productSize');
        if (sizeElem) sizeElem.value = product.size || '';
        document.getElementById('productStock').value = product.stock;
        document.getElementById('productDescription').value = product.description || '';
        if (document.getElementById('productImage')) document.getElementById('productImage').value = product.image_url || '';
        
        document.getElementById('productModal').style.display = 'flex';
    } catch (error) {
        console.error('Error loading product:', error);
    }
}

// Delete product
async function deleteProduct(id) {
    if (!confirm('Are you sure you want to delete this product? This will also delete all its reviews.')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/products/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            await loadProductsWithSearch();
            alert('Product deleted successfully!');
        } else {
            alert('Failed to delete product');
        }
    } catch (error) {
        console.error('Error deleting product:', error);
    }
}

// Delete review
async function deleteReview(id) {
    if (!confirm('Are you sure you want to delete this review?')) {
        return;
    }
    
    try {
        const response = await fetch(`/api/reviews/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            await loadReviews();
            alert('Review deleted successfully!');
        } else {
            alert('Failed to delete review');
        }
    } catch (error) {
        console.error('Error deleting review:', error);
    }
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    const productForm = document.getElementById('productForm');
    
    if (modal) modal.style.display = 'none';
    if (productForm) productForm.reset();
    
    resetImageUpload();
}

// Modal click outside handler
window.onclick = function(event) {
    const productModal = document.getElementById('productModal');
    const brandModal = document.getElementById('brandModal');
    const categoryModal = document.getElementById('categoryModal');
    
    if (productModal && event.target === productModal) {
        closeProductModal();
    }
    if (brandModal && event.target === brandModal) {
        closeBrandModal();
    }
    if (categoryModal && event.target === categoryModal) {
        closeCategoryModal();
    }
}

// Initialize when DOM is ready
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', initializeApp);
} else {
    initializeApp();
}

function initializeApp() {
    if (isInitialized) return;
    isInitialized = true;
    
    initializeEventListeners();
    checkAuth();
}


// ==================== BRAND MANAGEMENT ====================

let allBrands = [];

// Load brands
async function loadBrands() {
    try {
        if (allAdminProducts.length === 0) {
            const prodRes = await fetch('/api/products').catch(() => null);
            if (prodRes && prodRes.ok) allAdminProducts = await prodRes.json();
        }
        const response = await fetch('/api/brands');
        allBrands = await response.json();
        renderBrands(allBrands);
        const brandCountEl = document.getElementById('catalogBrandsCount');
        if (brandCountEl) brandCountEl.textContent = allBrands.length;
    } catch (error) {
        console.error('Error loading brands:', error);
        document.getElementById('brandsList').innerHTML = '<p class="error">Failed to load brands</p>';
    }
}

// Render brands
function renderBrands(brands) {
    const container = document.getElementById('brandsList');
    
    if (brands.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No brands found</p></div>';
        return;
    }
    
    container.innerHTML = brands.map(brand => {
        const safeBrandName = (brand.name || '').replace(/'/g, "\\'");
        const prodCount = allAdminProducts.filter(p => (p.brand || '').toLowerCase() === (brand.name || '').toLowerCase()).length;
        const hasValidCustomLogo = brand.logo_url && 
            !brand.logo_url.includes('via.placeholder.com') && 
            !brand.logo_url.includes('text=Apple') && 
            !brand.logo_url.includes('text=Google') && 
            !brand.logo_url.includes('text=Samsung') && 
            !brand.logo_url.includes('text=OnePlus') && 
            !brand.logo_url.includes('text=Xiaomi');
        const logoSrc = hasValidCustomLogo ? brand.logo_url : getBrandPlaceholder(brand.name);
        return `
        <div class="brand-card" data-id="${brand.id}">
            <div class="brand-card-header">
                <img src="${logoSrc}" 
                     alt="${brand.name}" 
                     class="brand-logo"
                     onerror="this.src='${getBrandPlaceholder(brand.name).replace(/'/g, '&#39;')}'">
                <div class="brand-info">
                    <div class="brand-name">${brand.name}</div>
                    <span class="catalog-card-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                        </svg>
                        ${prodCount} Products
                    </span>
                </div>
            </div>
            ${brand.description ? `<p class="brand-description">${brand.description}</p>` : ''}
            <div class="brand-meta">Created ${new Date(brand.created_at).toLocaleDateString()}</div>
            <div class="brand-actions">
                <button class="btn-action btn-browse" onclick="browseBrandProducts('${safeBrandName}')" title="View Products for ${brand.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Products</span>
                </button>
                <button class="btn-action btn-edit" onclick="editBrand('${brand.id}')" aria-label="Edit ${brand.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit</span>
                </button>
                <button class="btn-action btn-delete" onclick="deleteBrand('${brand.id}', '${safeBrandName}')" aria-label="Delete ${brand.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span>Delete</span>
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function openAddBrandModal() {
    document.getElementById('brandModalTitle').textContent = 'Add New Brand';
    const brandForm = document.getElementById('brandForm');
    if (brandForm) brandForm.reset();
    document.getElementById('brandId').value = '';
    
    // Reset brand logo upload
    resetBrandLogoUpload();
    
    const brandModal = document.getElementById('brandModal');
    if (brandModal) brandModal.style.display = 'flex';
}

// Initialize brand modal
function initializeBrandModal() {
    const addBrandBtn = document.getElementById('addBrandBtn');
    if (addBrandBtn) {
        addBrandBtn.addEventListener('click', openAddBrandModal);
    }

    // Brand form submission
    const brandForm = document.getElementById('brandForm');
    if (brandForm) {
        brandForm.addEventListener('submit', handleBrandFormSubmit);
    }
}

// Handle brand form submit
async function handleBrandFormSubmit(e) {
    e.preventDefault();
    
    const submitBtn = e.target.querySelector('button[type="submit"]');
    if (submitBtn) {
        submitBtn.classList.add('processing');
        submitBtn.disabled = true;
    }
    
    try {
        // Upload logo first if there's a new file
        const brandLogoInput = document.getElementById('brandLogo');
        let logoUrl = currentBrandLogoUrl || (brandLogoInput ? brandLogoInput.value : '') || '';
        if (currentBrandLogoFile) {
            logoUrl = await uploadBrandLogo();
            if (!logoUrl) {
                throw new Error('Logo upload failed');
            }
        }
        
        const id = document.getElementById('brandId').value;
        const name = document.getElementById('brandName').value;
        const description = document.getElementById('brandDescription').value;
        
        const brandData = { name, description, logo_url: logoUrl };
        
        const url = id ? `/api/brands/${id}` : '/api/brands';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(brandData)
        });
        
        if (response.ok) {
            if (submitBtn) {
                submitBtn.classList.remove('processing');
                submitBtn.classList.add('success');
            }
            
            setTimeout(() => {
                closeBrandModal();
                loadBrands();
                loadBrandDropdowns(); // Refresh dropdowns
                showToast(id ? 'Brand updated successfully!' : 'Brand created successfully!');
                if (submitBtn) {
                    submitBtn.classList.remove('success');
                    submitBtn.disabled = false;
                }
            }, 500);
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to save brand');
            if (submitBtn) {
                submitBtn.classList.remove('processing');
                submitBtn.disabled = false;
            }
        }
    } catch (error) {
        console.error('Error saving brand:', error);
        alert('Failed to save brand: ' + error.message);
        if (submitBtn) {
            submitBtn.classList.remove('processing');
            submitBtn.disabled = false;
        }
    }
}

// Edit brand
async function editBrand(id) {
    try {
        const brand = allBrands.find(b => b.id === id);
        if (!brand) return;
        
        document.getElementById('brandModalTitle').textContent = 'Edit Brand';
        document.getElementById('brandId').value = brand.id;
        document.getElementById('brandName').value = brand.name;
        document.getElementById('brandDescription').value = brand.description || '';
        document.getElementById('brandLogo').value = brand.logo_url || '';
        
        // Load brand logo if exists
        loadBrandLogo(brand.logo_url);
        
        document.getElementById('brandModal').style.display = 'flex';
    } catch (error) {
        console.error('Error editing brand:', error);
    }
}

// Delete brand
async function deleteBrand(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/brands/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            await loadBrands();
            await loadBrandDropdowns(); // Refresh dropdowns
            showToast('Brand deleted successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete brand');
        }
    } catch (error) {
        console.error('Error deleting brand:', error);
        alert('Failed to delete brand');
    }
}

// Close brand modal
function closeBrandModal() {
    document.getElementById('brandModal').style.display = 'none';
}

// Initialize brand search
function initializeBrandSearch() {
    const brandSearch = document.getElementById('brandSearch');
    if (brandSearch) {
        brandSearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allBrands.filter(brand => 
                brand.name.toLowerCase().includes(searchTerm) ||
                (brand.description && brand.description.toLowerCase().includes(searchTerm))
            );
            renderBrands(filtered);
        });
    }
}

// ==================== CATEGORY MANAGEMENT ====================

let allCategories = [];

// Load categories
async function loadCategories() {
    try {
        if (allAdminProducts.length === 0) {
            const prodRes = await fetch('/api/products').catch(() => null);
            if (prodRes && prodRes.ok) allAdminProducts = await prodRes.json();
        }
        const response = await fetch('/api/categories');
        allCategories = await response.json();
        renderCategories(allCategories);
        const catCountEl = document.getElementById('catalogCategoriesCount');
        if (catCountEl) catCountEl.textContent = allCategories.length;
    } catch (error) {
        console.error('Error loading categories:', error);
        document.getElementById('categoriesList').innerHTML = '<p class="error">Failed to load categories</p>';
    }
}

// Render categories
function renderCategories(categories) {
    const container = document.getElementById('categoriesList');
    
    if (categories.length === 0) {
        container.innerHTML = '<div class="empty-state"><p>No categories found</p></div>';
        return;
    }
    
    container.innerHTML = categories.map(category => {
        const safeCatName = (category.name || '').replace(/'/g, "\\'");
        const prodCount = allAdminProducts.filter(p => (p.category || '').toLowerCase() === (category.name || '').toLowerCase()).length;
        return `
        <div class="category-card" data-id="${category.id}">
            <div class="category-card-header">
                <div class="category-icon">${category.icon || '📦'}</div>
                <div class="category-info">
                    <div class="category-name">${category.name}</div>
                    <span class="catalog-card-badge">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
                            <rect x="5" y="2" width="14" height="20" rx="2.5" ry="2.5"></rect>
                        </svg>
                        ${prodCount} Products
                    </span>
                </div>
            </div>
            ${category.description ? `<p class="category-description">${category.description}</p>` : ''}
            <div class="category-meta">Created ${new Date(category.created_at).toLocaleDateString()}</div>
            <div class="category-actions">
                <button class="btn-action btn-browse" onclick="browseCategoryProducts('${safeCatName}')" title="View Products in ${category.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z"></path>
                        <circle cx="12" cy="12" r="3"></circle>
                    </svg>
                    <span>Products</span>
                </button>
                <button class="btn-action btn-edit" onclick="editCategory('${category.id}')" aria-label="Edit ${category.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"></path>
                        <path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"></path>
                    </svg>
                    <span>Edit</span>
                </button>
                <button class="btn-action btn-delete" onclick="deleteCategory('${category.id}', '${safeCatName}')" aria-label="Delete ${category.name}">
                    <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                        <polyline points="3 6 5 6 21 6"></polyline>
                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                        <line x1="10" y1="11" x2="10" y2="17"></line>
                        <line x1="14" y1="11" x2="14" y2="17"></line>
                    </svg>
                    <span>Delete</span>
                </button>
            </div>
        </div>
    `;
    }).join('');
}

function openAddCategoryModal() {
    document.getElementById('categoryModalTitle').textContent = 'Add New Category';
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) categoryForm.reset();
    document.getElementById('categoryId').value = '';
    const categoryModal = document.getElementById('categoryModal');
    if (categoryModal) categoryModal.style.display = 'flex';
}

// Initialize category modal
function initializeCategoryModal() {
    const addCategoryBtn = document.getElementById('addCategoryBtn');
    if (addCategoryBtn) {
        addCategoryBtn.addEventListener('click', openAddCategoryModal);
    }

    // Category form submission
    const categoryForm = document.getElementById('categoryForm');
    if (categoryForm) {
        categoryForm.addEventListener('submit', handleCategoryFormSubmit);
    }
}

// Handle category form submit
async function handleCategoryFormSubmit(e) {
    e.preventDefault();
    
    const id = document.getElementById('categoryId').value;
    const name = document.getElementById('categoryName').value;
    const description = document.getElementById('categoryDescription').value;
    const icon = document.getElementById('categoryIcon').value;
    
    const categoryData = { name, description, icon: icon || '📦' };
    
    try {
        const url = id ? `/api/categories/${id}` : '/api/categories';
        const method = id ? 'PUT' : 'POST';
        
        const response = await fetch(url, {
            method,
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(categoryData)
        });
        
        if (response.ok) {
            closeCategoryModal();
            await loadCategories();
            await loadCategoryDropdowns(); // Refresh dropdowns
            showToast(id ? 'Category updated successfully!' : 'Category created successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to save category');
        }
    } catch (error) {
        console.error('Error saving category:', error);
        alert('Failed to save category');
    }
}

// Edit category
async function editCategory(id) {
    try {
        const category = allCategories.find(c => c.id === id);
        if (!category) return;
        
        document.getElementById('categoryModalTitle').textContent = 'Edit Category';
        document.getElementById('categoryId').value = category.id;
        document.getElementById('categoryName').value = category.name;
        document.getElementById('categoryDescription').value = category.description || '';
        document.getElementById('categoryIcon').value = category.icon || '';
        document.getElementById('categoryModal').style.display = 'flex';
    } catch (error) {
        console.error('Error editing category:', error);
    }
}

// Delete category
async function deleteCategory(id, name) {
    if (!confirm(`Are you sure you want to delete "${name}"? This cannot be undone.`)) {
        return;
    }
    
    try {
        const response = await fetch(`/api/categories/${id}`, { method: 'DELETE' });
        
        if (response.ok) {
            await loadCategories();
            await loadCategoryDropdowns(); // Refresh dropdowns
            showToast('Category deleted successfully!');
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to delete category');
        }
    } catch (error) {
        console.error('Error deleting category:', error);
        alert('Failed to delete category');
    }
}

// Close category modal
function closeCategoryModal() {
    document.getElementById('categoryModal').style.display = 'none';
}

// Initialize category search
function initializeCategorySearch() {
    const categorySearch = document.getElementById('categorySearch');
    if (categorySearch) {
        categorySearch.addEventListener('input', (e) => {
            const searchTerm = e.target.value.toLowerCase();
            const filtered = allCategories.filter(category => 
                category.name.toLowerCase().includes(searchTerm) ||
                (category.description && category.description.toLowerCase().includes(searchTerm))
            );
            renderCategories(filtered);
        });
    }
}

// ==================== BRAND & CATEGORY DROPDOWNS ====================

// Load brand dropdown options
async function loadBrandDropdowns() {
    try {
        const response = await fetch('/api/brands');
        const brands = await response.json();
        
        const brandSelect = document.getElementById('productBrand');
        brandSelect.innerHTML = '<option value="">Select brand...</option>' +
            brands.map(brand => `<option value="${brand.name}">${brand.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading brand dropdown:', error);
    }
}

// Load category dropdown options
async function loadCategoryDropdowns() {
    try {
        const response = await fetch('/api/categories');
        const categories = await response.json();
        
        const categorySelect = document.getElementById('productCategory');
        categorySelect.innerHTML = '<option value="">Select category...</option>' +
            categories.map(category => `<option value="${category.name}">${category.icon} ${category.name}</option>`).join('');
    } catch (error) {
        console.error('Error loading category dropdown:', error);
    }
}

// ==================== UNIFIED CATALOG SYSTEM ====================

let currentCatalogSubtab = 'products';
let allBrandsData = [];
let allCategoriesData = [];

// Switch between Products, Brands, and Categories inside Catalog
window.switchCatalogSubtab = function(subtab) {
    currentCatalogSubtab = subtab;

    // Update active segment button
    document.querySelectorAll('.catalog-segment-btn').forEach(btn => {
        btn.classList.toggle('active', btn.dataset.subtab === subtab);
    });

    // Update active subview
    document.querySelectorAll('.catalog-subview').forEach(view => {
        view.classList.remove('active');
    });
    const targetView = document.getElementById(`catalogSubview-${subtab}`);
    if (targetView) targetView.classList.add('active');

    // Update Add button label
    const addBtnText = document.getElementById('catalogAddBtnText');
    if (addBtnText) {
        if (subtab === 'brands') addBtnText.textContent = 'Add Brand';
        else if (subtab === 'categories') addBtnText.textContent = 'Add Category';
        else addBtnText.textContent = 'Add Product';
    }

    // Load data for subtab
    if (subtab === 'brands') {
        loadBrands();
    } else if (subtab === 'categories') {
        loadCategories();
    } else {
        applyProductFilters();
    }
};

// Handle Add button click in Catalog header
window.handleCatalogAdd = async function() {
    if (currentCatalogSubtab === 'brands') {
        const addBrandBtn = document.getElementById('addBrandBtn');
        if (addBrandBtn) {
            addBrandBtn.click();
        } else {
            document.getElementById('brandModalTitle').textContent = 'Add New Brand';
            const brandForm = document.getElementById('brandForm');
            if (brandForm) brandForm.reset();
            document.getElementById('brandId').value = '';
            resetBrandLogoUpload();
            const brandModal = document.getElementById('brandModal');
            if (brandModal) brandModal.style.display = 'flex';
        }
    } else if (currentCatalogSubtab === 'categories') {
        const addCategoryBtn = document.getElementById('addCategoryBtn');
        if (addCategoryBtn) {
            addCategoryBtn.click();
        } else {
            document.getElementById('categoryModalTitle').textContent = 'Add New Category';
            const categoryForm = document.getElementById('categoryForm');
            if (categoryForm) categoryForm.reset();
            document.getElementById('categoryId').value = '';
            const categoryModal = document.getElementById('categoryModal');
            if (categoryModal) categoryModal.style.display = 'flex';
        }
    } else {
        await loadBrandDropdowns();
        await loadCategoryDropdowns();
        document.getElementById('modalTitle').textContent = 'Add New Product';
        const form = document.getElementById('productForm');
        if (form) form.reset();
        document.getElementById('productId').value = '';
        resetImageUpload();
        const modal = document.getElementById('productModal');
        if (modal) modal.style.display = 'flex';
    }
};

// Load full unified catalog (Products, Brands, Categories)
async function loadCatalog() {
    try {
        const [prodRes, brandRes, catRes] = await Promise.all([
            fetch('/api/products').catch(() => null),
            fetch('/api/brands').catch(() => null),
            fetch('/api/categories').catch(() => null)
        ]);

        if (prodRes && prodRes.ok) {
            allAdminProducts = await prodRes.json();
            allProducts = [...allAdminProducts];
        }
        if (brandRes && brandRes.ok) {
            allBrandsData = await brandRes.json();
            allBrands = [...allBrandsData];
        }
        if (catRes && catRes.ok) {
            allCategoriesData = await catRes.json();
            allCategories = [...allCategoriesData];
        }

        // Update segmented pill counters
        const prodCountEl = document.getElementById('catalogProductsCount');
        const brandCountEl = document.getElementById('catalogBrandsCount');
        const catCountEl = document.getElementById('catalogCategoriesCount');
        if (prodCountEl) prodCountEl.textContent = allAdminProducts.length;
        if (brandCountEl) brandCountEl.textContent = allBrandsData.length;
        if (catCountEl) catCountEl.textContent = allCategoriesData.length;

        // Populate Brand & Category filter dropdowns
        populateCatalogFilterDropdowns();

        // Render current active subtab
        if (currentCatalogSubtab === 'brands') {
            renderBrands(allBrandsData);
        } else if (currentCatalogSubtab === 'categories') {
            renderCategories(allCategoriesData);
        } else {
            applyProductFilters();
        }
    } catch (err) {
        console.error('Error loading catalog:', err);
    }
}

// Populate Brand & Category filter dropdowns in Products view
function populateCatalogFilterDropdowns() {
    const brandSelect = document.getElementById('filterBrandSelect');
    const catSelect = document.getElementById('filterCategorySelect');

    if (brandSelect) {
        const currentBrandVal = brandSelect.value;
        let brandOptions = '<option value="">All Brands</option>';
        allBrandsData.forEach(b => {
            const count = allAdminProducts.filter(p => (p.brand || '').toLowerCase() === (b.name || '').toLowerCase()).length;
            brandOptions += `<option value="${b.name}" ${currentBrandVal === b.name ? 'selected' : ''}>${b.name} (${count})</option>`;
        });
        brandSelect.innerHTML = brandOptions;
    }

    if (catSelect) {
        const currentCatVal = catSelect.value;
        let catOptions = '<option value="">All Categories</option>';
        allCategoriesData.forEach(c => {
            const count = allAdminProducts.filter(p => (p.category || '').toLowerCase() === (c.name || '').toLowerCase()).length;
            catOptions += `<option value="${c.name}" ${currentCatVal === c.name ? 'selected' : ''}>${c.icon || '📦'} ${c.name} (${count})</option>`;
        });
        catSelect.innerHTML = catOptions;
    }
}

// Combined Product Filtering (Search Query + Brand + Category)
window.applyProductFilters = function() {
    const searchInput = document.getElementById('productSearch');
    const brandSelect = document.getElementById('filterBrandSelect');
    const catSelect = document.getElementById('filterCategorySelect');

    const query = searchInput ? searchInput.value.toLowerCase().trim() : '';
    const brandFilter = brandSelect ? brandSelect.value.toLowerCase().trim() : '';
    const catFilter = catSelect ? catSelect.value.toLowerCase().trim() : '';

    let filtered = allAdminProducts;

    if (query) {
        filtered = filtered.filter(p => 
            (p.name && p.name.toLowerCase().includes(query)) ||
            (p.brand && p.brand.toLowerCase().includes(query)) ||
            (p.description && p.description.toLowerCase().includes(query)) ||
            (p.category && p.category.toLowerCase().includes(query)) ||
            p.price.toString().includes(query)
        );
    }

    if (brandFilter) {
        filtered = filtered.filter(p => (p.brand || '').toLowerCase() === brandFilter);
    }

    if (catFilter) {
        filtered = filtered.filter(p => (p.category || '').toLowerCase() === catFilter);
    }

    renderProducts(filtered);
};

// Cross-entity navigation: Browse brand products
window.browseBrandProducts = function(brandName) {
    if (currentTab !== 'catalog') switchToTab('catalog');
    switchCatalogSubtab('products');
    const brandSelect = document.getElementById('filterBrandSelect');
    if (brandSelect) {
        brandSelect.value = brandName;
        applyProductFilters();
    }
};

// Cross-entity navigation: Browse category products
window.browseCategoryProducts = function(categoryName) {
    if (currentTab !== 'catalog') switchToTab('catalog');
    switchCatalogSubtab('products');
    const catSelect = document.getElementById('filterCategorySelect');
    if (catSelect) {
        catSelect.value = categoryName;
        applyProductFilters();
    }
};

// Show toast notification
function showToast(message) {
    // Create toast if it doesn't exist
    let toast = document.getElementById('toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.id = 'toast';
        toast.style.cssText = `
            position: fixed;
            bottom: 20px;
            right: 20px;
            background: var(--success);
            color: white;
            padding: 14px 20px;
            border-radius: 12px;
            box-shadow: 0 4px 12px rgba(0,0,0,0.15);
            z-index: 10000;
            font-weight: 600;
            opacity: 0;
            transform: translateY(20px);
            transition: all 0.3s;
        `;
        document.body.appendChild(toast);
    }
    
    toast.textContent = message;
    toast.style.opacity = '1';
    toast.style.transform = 'translateY(0)';
    
    setTimeout(() => {
        toast.style.opacity = '0';
        toast.style.transform = 'translateY(20px)';
    }, 3000);
}


// ==================== IMAGE UPLOAD FUNCTIONALITY ====================

let currentImageFile = null;
let currentImageUrl = null;

// Initialize image upload elements after DOM is loaded and user is authenticated
function initializeImageUpload() {
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const productImageFile = document.getElementById('productImageFile');
    const productImageInput = document.getElementById('productImage');
    const selectImageBtn = document.getElementById('selectImageBtn');
    const removeImageBtn = document.getElementById('removeImageBtn');

    // Check if elements exist before adding listeners
    if (!imagePreview || !selectImageBtn || !removeImageBtn || !productImageFile) {
        console.warn('Image upload elements not found, skipping initialization');
        return;
    }

    // Select image button click
    selectImageBtn.addEventListener('click', () => {
        productImageFile.click();
    });

    // File input change
    productImageFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleImageFile(file);
        }
    });

    // Drag and drop functionality
    imagePreview.addEventListener('click', (e) => {
        if (!imagePreview.classList.contains('has-image')) {
            productImageFile.click();
        }
    });

    imagePreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        imagePreview.classList.add('drag-over');
    });

    imagePreview.addEventListener('dragleave', (e) => {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');
    });

    imagePreview.addEventListener('drop', (e) => {
        e.preventDefault();
        imagePreview.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleImageFile(file);
        } else {
            alert('Please drop an image file');
        }
    });

    // Remove image button
    removeImageBtn.addEventListener('click', () => {
        currentImageFile = null;
        currentImageUrl = null;
        productImageFile.value = '';
        productImageInput.value = '';
        previewImg.src = '';
        previewImg.style.display = 'none';
        uploadPlaceholder.style.display = 'block';
        imagePreview.classList.remove('has-image');
        removeImageBtn.style.display = 'none';
    });

    // Update add product button to reset image
    const addProductBtn = document.getElementById('addProductBtn');
    if (addProductBtn) {
        addProductBtn.addEventListener('click', async () => {
            await loadBrandDropdowns();
            await loadCategoryDropdowns();
            
            document.getElementById('modalTitle').textContent = 'Add New Product';
            document.getElementById('productForm').reset();
            document.getElementById('productId').value = '';
            
            // Reset image upload
            resetImageUpload();
            
            document.getElementById('productModal').style.display = 'flex';
        });
    }
}

// Helper to calculate aspect ratio and recommendation badge
function getAspectRatioBadge(width, height) {
    if (!width || !height) return '-';
    const ratio = width / height;
    const isSquare = Math.abs(width - height) <= Math.max(width, height) * 0.06; // Within 6% is practically square
    if (isSquare) {
        return `<span class="aspect-pill square">✓ 1:1 Square (Ideal)</span>`;
    } else if (ratio > 1) {
        return `<span class="aspect-pill warning">Landscape (${ratio.toFixed(2)}:1) • 1:1 recommended</span>`;
    } else {
        return `<span class="aspect-pill warning">Portrait (1:${(1 / ratio).toFixed(2)}) • 1:1 recommended</span>`;
    }
}

// Handle image file
function handleImageFile(file) {
    const imagePreview = document.getElementById('imagePreview');
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const imageDetails = document.getElementById('imageDetails');
    const imageFileName = document.getElementById('imageFileName');
    const imageDimensions = document.getElementById('imageDimensions');
    const imageAspectRatio = document.getElementById('imageAspectRatio');
    const imageFileSize = document.getElementById('imageFileSize');
    
    if (!imagePreview || !previewImg || !uploadPlaceholder || !removeImageBtn) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, GIF, and WEBP images are allowed');
        return;
    }
    
    currentImageFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = function() {
            // Update file details
            if (imageFileName) imageFileName.textContent = file.name;
            if (imageDimensions) imageDimensions.textContent = `${this.width} × ${this.height}px`;
            if (imageAspectRatio) imageAspectRatio.innerHTML = getAspectRatioBadge(this.width, this.height);
            if (imageFileSize) imageFileSize.textContent = formatFileSize(file.size);
            if (imageDetails) imageDetails.classList.add('show');
        };
        img.src = e.target.result;
        
        previewImg.src = e.target.result;
        previewImg.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        imagePreview.classList.add('has-image');
        removeImageBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
}

// Format file size helper
function formatFileSize(bytes) {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return Math.round(bytes / Math.pow(k, i) * 100) / 100 + ' ' + sizes[i];
}

// Reset image upload
function resetImageUpload() {
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const productImageFile = document.getElementById('productImageFile');
    const productImageInput = document.getElementById('productImage');
    const imageDetails = document.getElementById('imageDetails');
    
    if (!previewImg || !uploadPlaceholder || !imagePreview || !removeImageBtn) return;
    
    currentImageFile = null;
    currentImageUrl = null;
    if (productImageFile) productImageFile.value = '';
    if (productImageInput) productImageInput.value = '';
    previewImg.src = '';
    previewImg.style.display = 'none';
    uploadPlaceholder.style.display = 'block';
    imagePreview.classList.remove('has-image');
    removeImageBtn.style.display = 'none';
    if (imageDetails) imageDetails.classList.remove('show');
}

// ==================== BRAND LOGO UPLOAD FUNCTIONALITY ====================

let currentBrandLogoFile = null;
let currentBrandLogoUrl = null;

// Initialize brand logo upload
function initializeBrandLogoUpload() {
    const brandLogoPreview = document.getElementById('brandLogoPreview');
    const brandPreviewImg = document.getElementById('brandPreviewImg');
    const brandUploadPlaceholder = document.getElementById('brandUploadPlaceholder');
    const brandLogoFile = document.getElementById('brandLogoFile');
    const brandLogoInput = document.getElementById('brandLogo');
    const selectBrandLogoBtn = document.getElementById('selectBrandLogoBtn');
    const removeBrandLogoBtn = document.getElementById('removeBrandLogoBtn');

    if (!brandLogoPreview || !selectBrandLogoBtn || !removeBrandLogoBtn || !brandLogoFile) {
        console.warn('Brand logo upload elements not found');
        return;
    }

    // Select logo button click
    selectBrandLogoBtn.addEventListener('click', () => {
        brandLogoFile.click();
    });

    // File input change
    brandLogoFile.addEventListener('change', (e) => {
        const file = e.target.files[0];
        if (file) {
            handleBrandLogoFile(file);
        }
    });

    // Drag and drop functionality
    brandLogoPreview.addEventListener('click', (e) => {
        if (!brandLogoPreview.classList.contains('has-image')) {
            brandLogoFile.click();
        }
    });

    brandLogoPreview.addEventListener('dragover', (e) => {
        e.preventDefault();
        brandLogoPreview.classList.add('drag-over');
    });

    brandLogoPreview.addEventListener('dragleave', (e) => {
        e.preventDefault();
        brandLogoPreview.classList.remove('drag-over');
    });

    brandLogoPreview.addEventListener('drop', (e) => {
        e.preventDefault();
        brandLogoPreview.classList.remove('drag-over');
        
        const file = e.dataTransfer.files[0];
        if (file && file.type.startsWith('image/')) {
            handleBrandLogoFile(file);
        } else {
            alert('Please drop an image file');
        }
    });

    // Remove logo button
    removeBrandLogoBtn.addEventListener('click', () => {
        resetBrandLogoUpload();
    });
}

// Handle brand logo file
function handleBrandLogoFile(file) {
    const brandLogoPreview = document.getElementById('brandLogoPreview');
    const brandPreviewImg = document.getElementById('brandPreviewImg');
    const brandUploadPlaceholder = document.getElementById('brandUploadPlaceholder');
    const removeBrandLogoBtn = document.getElementById('removeBrandLogoBtn');
    const brandImageDetails = document.getElementById('brandImageDetails');
    const brandImageFileName = document.getElementById('brandImageFileName');
    const brandImageDimensions = document.getElementById('brandImageDimensions');
    const brandImageAspectRatio = document.getElementById('brandImageAspectRatio');
    const brandImageFileSize = document.getElementById('brandImageFileSize');
    
    if (!brandLogoPreview || !brandPreviewImg || !brandUploadPlaceholder || !removeBrandLogoBtn) return;
    
    // Validate file size (5MB)
    if (file.size > 5 * 1024 * 1024) {
        alert('File size must be less than 5MB');
        return;
    }
    
    // Validate file type
    const allowedTypes = ['image/jpeg', 'image/jpg', 'image/png', 'image/gif', 'image/webp'];
    if (!allowedTypes.includes(file.type)) {
        alert('Only JPG, PNG, GIF, and WEBP images are allowed');
        return;
    }
    
    currentBrandLogoFile = file;
    
    // Show preview
    const reader = new FileReader();
    reader.onload = (e) => {
        const img = new Image();
        img.onload = function() {
            // Update file details
            if (brandImageFileName) brandImageFileName.textContent = file.name;
            if (brandImageDimensions) brandImageDimensions.textContent = `${this.width} × ${this.height}px`;
            if (brandImageAspectRatio) brandImageAspectRatio.innerHTML = getAspectRatioBadge(this.width, this.height);
            if (brandImageFileSize) brandImageFileSize.textContent = formatFileSize(file.size);
            if (brandImageDetails) brandImageDetails.classList.add('show');
        };
        img.src = e.target.result;
        
        brandPreviewImg.src = e.target.result;
        brandPreviewImg.style.display = 'block';
        brandUploadPlaceholder.style.display = 'none';
        brandLogoPreview.classList.add('has-image');
        removeBrandLogoBtn.style.display = 'inline-block';
    };
    reader.readAsDataURL(file);
}

// Reset brand logo upload
function resetBrandLogoUpload() {
    const brandPreviewImg = document.getElementById('brandPreviewImg');
    const brandUploadPlaceholder = document.getElementById('brandUploadPlaceholder');
    const brandLogoPreview = document.getElementById('brandLogoPreview');
    const removeBrandLogoBtn = document.getElementById('removeBrandLogoBtn');
    const brandLogoFile = document.getElementById('brandLogoFile');
    const brandLogoInput = document.getElementById('brandLogo');
    const brandImageDetails = document.getElementById('brandImageDetails');
    
    if (!brandPreviewImg || !brandUploadPlaceholder || !brandLogoPreview || !removeBrandLogoBtn) return;
    
    currentBrandLogoFile = null;
    currentBrandLogoUrl = null;
    if (brandLogoFile) brandLogoFile.value = '';
    if (brandLogoInput) brandLogoInput.value = '';
    brandPreviewImg.src = '';
    brandPreviewImg.style.display = 'none';
    brandUploadPlaceholder.style.display = 'block';
    brandLogoPreview.classList.remove('has-image');
    removeBrandLogoBtn.style.display = 'none';
    if (brandImageDetails) brandImageDetails.classList.remove('show');
}

// Upload brand logo to server
async function uploadBrandLogo() {
    if (!currentBrandLogoFile) {
        return null;
    }
    
    const formData = new FormData();
    formData.append('image', currentBrandLogoFile);
    
    try {
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        if (response.ok) {
            const data = await response.json();
            return data.imageUrl;
        } else {
            console.error('Failed to upload logo');
            return null;
        }
    } catch (error) {
        console.error('Error uploading logo:', error);
        return null;
    }
}

// Load brand logo in edit mode
function loadBrandLogo(logoUrl) {
    const brandPreviewImg = document.getElementById('brandPreviewImg');
    const brandUploadPlaceholder = document.getElementById('brandUploadPlaceholder');
    const brandLogoPreview = document.getElementById('brandLogoPreview');
    const removeBrandLogoBtn = document.getElementById('removeBrandLogoBtn');
    
    if (!brandPreviewImg || !brandUploadPlaceholder || !brandLogoPreview || !removeBrandLogoBtn) return;
    
    if (logoUrl && typeof logoUrl === 'object') {
        logoUrl = logoUrl.url || logoUrl.src || logoUrl.path || (Array.isArray(logoUrl) ? logoUrl[0] : '');
    }
    
    if (typeof logoUrl === 'string') {
        logoUrl = logoUrl.trim();
    } else {
        logoUrl = '';
    }
    
    if (logoUrl && !logoUrl.includes('data:image/svg')) {
        currentBrandLogoUrl = logoUrl;
        brandPreviewImg.src = logoUrl;
        brandPreviewImg.style.display = 'block';
        brandUploadPlaceholder.style.display = 'none';
        brandLogoPreview.classList.add('has-image');
        removeBrandLogoBtn.style.display = 'inline-block';
    } else {
        resetBrandLogoUpload();
    }
}

// Upload image to server
async function uploadImage() {
    if (!currentImageFile) {
        return currentImageUrl || '';
    }
    
    const imagePreview = document.getElementById('imagePreview');
    if (!imagePreview) return '';
    
    const formData = new FormData();
    formData.append('image', currentImageFile);
    
    try {
        imagePreview.classList.add('uploading');
        
        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });
        
        const data = await response.json();
        
        if (response.ok) {
            currentImageUrl = data.imageUrl;
            currentImageFile = null; // Clear file after successful upload
            return data.imageUrl;
        } else {
            throw new Error(data.error || 'Upload failed');
        }
    } catch (error) {
        console.error('Error uploading image:', error);
        alert('Failed to upload image: ' + error.message);
        return '';
    } finally {
        if (imagePreview) {
            imagePreview.classList.remove('uploading');
        }
    }
}



// Load product image helper
function loadProductImage(imageUrl) {
    const previewImg = document.getElementById('previewImg');
    const uploadPlaceholder = document.getElementById('uploadPlaceholder');
    const imagePreview = document.getElementById('imagePreview');
    const removeImageBtn = document.getElementById('removeImageBtn');
    const productImageInput = document.getElementById('productImage');
    
    if (!previewImg || !uploadPlaceholder || !imagePreview || !removeImageBtn) return;
    
    if (imageUrl && typeof imageUrl === 'object') {
        imageUrl = imageUrl.url || imageUrl.src || imageUrl.path || (Array.isArray(imageUrl) ? imageUrl[0] : '');
    }
    
    if (typeof imageUrl === 'string') {
        imageUrl = imageUrl.trim();
    } else {
        imageUrl = '';
    }
    
    if (imageUrl && !imageUrl.includes('placeholder') && !imageUrl.includes('data:image/svg')) {
        currentImageUrl = imageUrl;
        currentImageFile = null;
        previewImg.src = imageUrl;
        previewImg.style.display = 'block';
        uploadPlaceholder.style.display = 'none';
        imagePreview.classList.add('has-image');
        removeImageBtn.style.display = 'inline-block';
        if (productImageInput) productImageInput.value = imageUrl;

        // Populate image details for existing image
        const img = new Image();
        img.onload = function() {
            const imageFileName = document.getElementById('imageFileName');
            const imageDimensions = document.getElementById('imageDimensions');
            const imageAspectRatio = document.getElementById('imageAspectRatio');
            const imageFileSize = document.getElementById('imageFileSize');
            const imageDetails = document.getElementById('imageDetails');
            
            const fileName = imageUrl.split('/').pop() || 'Existing Image';
            if (imageFileName) imageFileName.textContent = decodeURIComponent(fileName);
            if (imageDimensions) imageDimensions.textContent = `${this.width} × ${this.height}px`;
            if (imageAspectRatio) imageAspectRatio.innerHTML = getAspectRatioBadge(this.width, this.height);
            if (imageFileSize) imageFileSize.textContent = 'Uploaded';
            if (imageDetails) imageDetails.classList.add('show');
        };
        img.src = imageUrl;
    } else {
        resetImageUpload();
    }
}

// Update the edit product function to load image
window.editProduct = async function(id) {
    let product = allProducts.find(p => p.id == id);
    if (!product) {
        try {
            const response = await fetch(`/api/products/${id}`);
            if (response.ok) {
                product = await response.json();
            }
        } catch (e) {
            console.error('Error fetching product for edit:', e);
        }
    }
    if (!product) return;
    
    await loadBrandDropdowns();
    await loadCategoryDropdowns();
    
    // Initialize image upload if not already done
    initializeImageUpload();
    
    document.getElementById('modalTitle').textContent = 'Edit Product';
    document.getElementById('productId').value = product.id;
    document.getElementById('productName').value = product.name || '';
    document.getElementById('productBrand').value = product.brand || '';
    document.getElementById('productCategory').value = product.category || '';
    document.getElementById('productPrice').value = product.price !== undefined ? product.price : '';
    const sizeInput = document.getElementById('productSize');
    if (sizeInput) sizeInput.value = product.size || '';
    document.getElementById('productStock').value = product.stock !== undefined ? product.stock : 0;
    document.getElementById('productDescription').value = product.description || '';
    
    // Load existing image
    const imgUrl = product.image_url || product.image || '';
    loadProductImage(imgUrl);
    
    document.getElementById('productModal').style.display = 'flex';
};

// Window global function overrides for backward compatibility
window.closeProductModal = closeProductModal;

// ==================== STORE SETTINGS & ADMIN PROFILE ====================

// Store settings state
let currentStoreSettings = {
    store_name: 'Bong Store',
    store_tagline: 'Premium Smartphones & Tech Store',
    store_phone: '+855 12 345 678',
    store_email: 'contact@bongstore.com',
    store_logo: ''
};

// Apply store logo to UI elements across Admin Panel
function applyStoreLogoToAdmin(logoUrl) {
    const previewImg = document.getElementById('previewBannerImg');
    const previewSvg = document.getElementById('previewBannerSvg');
    const previewBoxImg = document.getElementById('storeLogoPreviewImg');
    const defaultIcon = document.getElementById('storeLogoDefaultIcon');
    const removeBtn = document.getElementById('removeStoreLogoBtn');
    const hiddenInput = document.getElementById('settingStoreLogo');
    const chooseBtnText = document.getElementById('chooseStoreLogoBtnText');

    // Header elements
    const headerImg = document.getElementById('adminHeaderStoreImg');
    const headerSvg = document.getElementById('adminHeaderStoreSvg');

    // Login brand elements
    const loginImg = document.getElementById('loginBrandImg');
    const loginSvg = document.getElementById('loginBrandSvg');
    const loginIcon = document.getElementById('loginBrandIcon');

    if (hiddenInput) hiddenInput.value = logoUrl || '';

    if (logoUrl && logoUrl.trim()) {
        const cleanUrl = logoUrl.trim();
        // Preview in banner
        if (previewImg) {
            previewImg.src = cleanUrl;
            previewImg.style.display = 'block';
        }
        if (previewSvg) previewSvg.style.display = 'none';

        // Preview in upload box
        if (previewBoxImg) {
            previewBoxImg.src = cleanUrl;
            previewBoxImg.style.display = 'block';
        }
        if (defaultIcon) defaultIcon.style.display = 'none';

        // Header logo
        if (headerImg) {
            headerImg.src = cleanUrl;
            headerImg.style.display = 'block';
        }
        if (headerSvg) headerSvg.style.display = 'none';

        // Login screen logo
        if (loginImg) {
            loginImg.src = cleanUrl;
            loginImg.style.display = 'block';
        }
        if (loginSvg) loginSvg.style.display = 'none';
        if (loginIcon) loginIcon.classList.add('has-logo');

        if (removeBtn) removeBtn.style.display = 'inline-flex';
        if (chooseBtnText) chooseBtnText.textContent = 'Change Logo';
    } else {
        // Revert to default phone icon
        if (previewImg) {
            previewImg.src = '';
            previewImg.style.display = 'none';
        }
        if (previewSvg) previewSvg.style.display = 'block';

        if (previewBoxImg) {
            previewBoxImg.src = '';
            previewBoxImg.style.display = 'none';
        }
        if (defaultIcon) defaultIcon.style.display = 'flex';

        if (headerImg) {
            headerImg.src = '';
            headerImg.style.display = 'none';
        }
        if (headerSvg) headerSvg.style.display = 'block';

        if (loginImg) {
            loginImg.src = '';
            loginImg.style.display = 'none';
        }
        if (loginSvg) loginSvg.style.display = 'block';
        if (loginIcon) loginIcon.classList.remove('has-logo');

        if (removeBtn) removeBtn.style.display = 'none';
        if (chooseBtnText) chooseBtnText.textContent = 'Upload Store Logo';
    }
}

// Auto-save store logo to database immediately on change
async function autoSaveStoreLogo(newLogoUrl) {
    try {
        const store_name = (document.getElementById('settingStoreName') ? document.getElementById('settingStoreName').value : (currentStoreSettings.store_name || 'DyMaly')).trim();
        const store_tagline = (document.getElementById('settingStoreTagline') ? document.getElementById('settingStoreTagline').value : (currentStoreSettings.store_tagline || '')).trim();
        const store_phone = (document.getElementById('settingStorePhone') ? document.getElementById('settingStorePhone').value : (currentStoreSettings.store_phone || '')).trim();
        const store_email = (document.getElementById('settingStoreEmail') ? document.getElementById('settingStoreEmail').value : (currentStoreSettings.store_email || '')).trim();
        const store_logo = (newLogoUrl !== undefined ? newLogoUrl : (document.getElementById('settingStoreLogo') ? document.getElementById('settingStoreLogo').value : '')).trim();

        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ store_name, store_tagline, store_phone, store_email, store_logo })
        });
        if (response.ok) {
            currentStoreSettings = { store_name, store_tagline, store_phone, store_email, store_logo };
            applyStoreLogoToAdmin(store_logo);
            return true;
        }
    } catch (e) {
        console.warn('Auto-save store logo error:', e);
    }
    return false;
}

// Upload Store Logo helper
async function handleStoreLogoUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('❌ Please select an image file (PNG, JPG, SVG, or WEBP).');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Image size exceeds 5MB limit.');
        return;
    }

    const chooseBtn = document.getElementById('chooseStoreLogoBtn');
    const chooseBtnText = document.getElementById('chooseStoreLogoBtnText');
    if (chooseBtnText) chooseBtnText.textContent = 'Uploading...';

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.imageUrl) {
            applyStoreLogoToAdmin(data.imageUrl);
            
            // Update the URL input field too
            const logoUrlInput = document.getElementById('settingStoreLogo');
            if (logoUrlInput) logoUrlInput.value = data.imageUrl;

            // Auto-save setting so the logo immediately goes live across the store
            const saved = await autoSaveStoreLogo(data.imageUrl);
            if (saved) {
                showToast('✓ Store logo uploaded & saved! Live across store.');
            } else {
                showToast('✓ Store logo uploaded! Click "Save Store Settings" to finalize.');
            }
        } else {
            showToast('❌ Failed to upload store logo: ' + (data.error || 'Please try again.'));
        }
    } catch (err) {
        console.error('Error uploading store logo:', err);
        showToast('❌ Network error while uploading store logo.');
    } finally {
        if (chooseBtnText) chooseBtnText.textContent = 'Change Logo';
    }
}

// Initialize Store Logo Upload events
function initializeStoreLogoUpload() {
    const fileInput = document.getElementById('storeLogoFileInput');
    const removeBtn = document.getElementById('removeStoreLogoBtn');
    const dropzone = document.getElementById('storeLogoUploader');
    const previewBox = document.getElementById('storeLogoPreviewBox');
    const logoUrlInput = document.getElementById('settingStoreLogo');
    const previewLogoUrlBtn = document.getElementById('btnPreviewStoreLogoUrl');

    // previewBox click triggers file dialog
    if (previewBox && fileInput) {
        previewBox.addEventListener('click', () => fileInput.click());
        previewBox.style.cursor = 'pointer';
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleStoreLogoUpload(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // Apply URL button
    if (previewLogoUrlBtn && logoUrlInput) {
        previewLogoUrlBtn.addEventListener('click', async () => {
            const url = logoUrlInput.value.trim();
            if (!url) { showToast('Please enter an image URL first.'); return; }
            applyStoreLogoToAdmin(url);
            const saved = await autoSaveStoreLogo(url);
            if (saved) {
                showToast('✓ Store logo URL applied & saved live!');
            } else {
                showToast('Preview applied. Click "Save & Sync" to finalize.');
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', async () => {
            applyStoreLogoToAdmin('');
            if (logoUrlInput) logoUrlInput.value = '';
            const saved = await autoSaveStoreLogo('');
            if (saved) {
                showToast('✓ Store logo removed & updated across store.');
            } else {
                showToast('Store logo removed. Save settings to apply.');
            }
        });
    }

    if (dropzone) {
        ['dragenter', 'dragover'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.add('drag-over');
            });
        });
        ['dragleave', 'drop'].forEach(eventName => {
            dropzone.addEventListener(eventName, (e) => {
                e.preventDefault();
                dropzone.classList.remove('drag-over');
            });
        });
        dropzone.addEventListener('drop', (e) => {
            if (e.dataTransfer && e.dataTransfer.files && e.dataTransfer.files[0]) {
                handleStoreLogoUpload(e.dataTransfer.files[0]);
            }
        });
    }
}

// Load store settings
async function loadStoreSettings() {
    try {
        const response = await fetch('/api/settings?_t=' + Date.now(), { cache: 'no-cache' });
        if (response.ok) {
            currentStoreSettings = await response.json();
            
            const setVal = (id, val) => {
                const el = document.getElementById(id);
                if (el) el.value = val !== undefined && val !== null ? val : '';
            };

            // 1. Store Identity
            setVal('settingStoreName', currentStoreSettings.store_name);
            setVal('settingStoreTagline', currentStoreSettings.store_tagline);
            setVal('settingStoreBadge', currentStoreSettings.store_badge);
            setVal('settingStoreLogo', currentStoreSettings.store_logo || '');
            applyStoreLogoToAdmin(currentStoreSettings.store_logo || '');

            // 2. Announcement Bar
            const annEnabled = currentStoreSettings.announcement_enabled === 'true' || currentStoreSettings.announcement_enabled === true;
            setVal('settingAnnouncementEnabled', annEnabled ? 'true' : 'false');
            setVal('settingAnnouncementBadge', currentStoreSettings.announcement_badge);
            setVal('settingAnnouncementText', currentStoreSettings.announcement_text);
            setVal('settingAnnouncementLink', currentStoreSettings.announcement_link);

            // 3. Hero Promo Banner
            setVal('settingHeroBadge', currentStoreSettings.hero_badge);
            setVal('settingHeroTitle', currentStoreSettings.hero_title);
            setVal('settingHeroSubtitle', currentStoreSettings.hero_subtitle);
            setVal('settingHeroBtnText', currentStoreSettings.hero_btn_text);

            // 4. Contact & Location
            setVal('settingStorePhone', currentStoreSettings.store_phone);
            setVal('settingStoreEmail', currentStoreSettings.store_email);
            setVal('settingStoreAddress', currentStoreSettings.store_address);
            setVal('settingStoreHours', currentStoreSettings.store_hours);

            // 5. Social Media Links
            setVal('settingSocialTelegram', currentStoreSettings.social_telegram);
            setVal('settingSocialFacebook', currentStoreSettings.social_facebook);
            setVal('settingSocialTiktok', currentStoreSettings.social_tiktok);
            setVal('settingSocialInstagram', currentStoreSettings.social_instagram);

            // 6. Guarantees & Trust Badges
            setVal('settingBadge1Icon', currentStoreSettings.badge_1_icon);
            setVal('settingBadge1Title', currentStoreSettings.badge_1_title);
            setVal('settingBadge1Desc', currentStoreSettings.badge_1_desc);

            setVal('settingBadge2Icon', currentStoreSettings.badge_2_icon);
            setVal('settingBadge2Title', currentStoreSettings.badge_2_title);
            setVal('settingBadge2Desc', currentStoreSettings.badge_2_desc);

            setVal('settingBadge3Icon', currentStoreSettings.badge_3_icon);
            setVal('settingBadge3Title', currentStoreSettings.badge_3_title);
            setVal('settingBadge3Desc', currentStoreSettings.badge_3_desc);

            setVal('settingBadge4Icon', currentStoreSettings.badge_4_icon);
            setVal('settingBadge4Title', currentStoreSettings.badge_4_title);
            setVal('settingBadge4Desc', currentStoreSettings.badge_4_desc);

            // 7. Footer Content
            setVal('settingFooterAbout', currentStoreSettings.footer_about);
            setVal('settingFooterCopyright', currentStoreSettings.footer_copyright);

            // Update live preview banner
            updateStorePreview();
            
            // Update header title
            const headerTitle = document.getElementById('headerStoreTitle');
            if (headerTitle && currentStoreSettings.store_name) {
                headerTitle.textContent = currentStoreSettings.store_name;
            }

            // Update login footer session store name
            const footerStoreName = document.getElementById('loginFooterStoreName');
            if (footerStoreName && currentStoreSettings.store_name) {
                footerStoreName.textContent = currentStoreSettings.store_name;
            }
        }
    } catch (error) {
        console.error('Error loading store settings:', error);
    }
}

// Live update of the store preview banner as admin types
window.updateStorePreview = function() {
    const nameInput = document.getElementById('settingStoreName');
    const taglineInput = document.getElementById('settingStoreTagline');
    const previewName = document.getElementById('previewStoreName');
    const previewTagline = document.getElementById('previewStoreTagline');
    
    if (previewName) {
        previewName.textContent = (nameInput && nameInput.value.trim()) ? nameInput.value.trim() : (currentStoreSettings.store_name || 'DyMaly');
    }
    if (previewTagline) {
        previewTagline.textContent = (taglineInput && taglineInput.value.trim()) ? taglineInput.value.trim() : (currentStoreSettings.store_tagline || 'Phones & audio, delivered fast');
    }
};

// Save store settings (All website information synced in real-time)
window.handleSaveStoreSettings = async function(event) {
    if (event) event.preventDefault();
    const saveBtn = document.getElementById('saveStoreSettingsBtn');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    
    const getVal = (id) => {
        const el = document.getElementById(id);
        return el ? el.value.trim() : '';
    };

    const store_name = getVal('settingStoreName');
    if (!store_name) {
        alert('Please enter a store name.');
        return;
    }

    const payload = {
        store_name,
        store_tagline: getVal('settingStoreTagline'),
        store_badge: getVal('settingStoreBadge'),
        store_logo: (document.getElementById('settingStoreLogo') ? document.getElementById('settingStoreLogo').value : '').trim(),
        
        announcement_enabled: getVal('settingAnnouncementEnabled'),
        announcement_badge: getVal('settingAnnouncementBadge'),
        announcement_text: getVal('settingAnnouncementText'),
        announcement_link: getVal('settingAnnouncementLink'),
        
        hero_badge: getVal('settingHeroBadge'),
        hero_title: getVal('settingHeroTitle'),
        hero_subtitle: getVal('settingHeroSubtitle'),
        hero_btn_text: getVal('settingHeroBtnText'),
        
        store_phone: getVal('settingStorePhone'),
        store_email: getVal('settingStoreEmail'),
        store_address: getVal('settingStoreAddress'),
        store_hours: getVal('settingStoreHours'),
        
        social_telegram: getVal('settingSocialTelegram'),
        social_facebook: getVal('settingSocialFacebook'),
        social_tiktok: getVal('settingSocialTiktok'),
        social_instagram: getVal('settingSocialInstagram'),
        
        badge_1_icon: getVal('settingBadge1Icon'),
        badge_1_title: getVal('settingBadge1Title'),
        badge_1_desc: getVal('settingBadge1Desc'),
        
        badge_2_icon: getVal('settingBadge2Icon'),
        badge_2_title: getVal('settingBadge2Title'),
        badge_2_desc: getVal('settingBadge2Desc'),
        
        badge_3_icon: getVal('settingBadge3Icon'),
        badge_3_title: getVal('settingBadge3Title'),
        badge_3_desc: getVal('settingBadge3Desc'),
        
        badge_4_icon: getVal('settingBadge4Icon'),
        badge_4_title: getVal('settingBadge4Title'),
        badge_4_desc: getVal('settingBadge4Desc'),
        
        footer_about: getVal('settingFooterAbout'),
        footer_copyright: getVal('settingFooterCopyright')
    };

    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Saving & Syncing Live...</span>';
    }
    
    try {
        const response = await fetch('/api/settings', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
            currentStoreSettings = { ...currentStoreSettings, ...payload };
            applyStoreLogoToAdmin(payload.store_logo);
            
            // Update header title in real time
            const headerTitle = document.getElementById('headerStoreTitle');
            if (headerTitle) headerTitle.textContent = store_name;
            
            // Update login footer session text
            const footerStoreName = document.getElementById('loginFooterStoreName');
            if (footerStoreName) footerStoreName.textContent = store_name;
            
            // Update document title
            document.title = `Admin Dashboard - ${store_name}`;
            
            showToast('✓ All website information saved and synced live in real-time!');
        } else {
            alert(result.error || 'Failed to save store settings');
        }
    } catch (error) {
        console.error('Error saving store settings:', error);
        alert('Network error while saving settings');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }
};

// Admin profile state
let currentAdminProfile = {
    username: 'admin',
    display_name: 'Store Administrator',
    email: 'admin@bongstore.com',
    phone: '+855 12 345 678',
    avatar_url: ''
};

// Apply admin avatar to UI elements
function applyAdminAvatarToUI(avatarUrl, displayName) {
    const largeImg = document.getElementById('profileAvatarImg');
    const largeInitial = document.getElementById('profileAvatarLarge');
    const headerImg = document.getElementById('headerAdminAvatarImg');
    const headerInitial = document.getElementById('headerAdminAvatarInitial');
    const removeBtn = document.getElementById('removeAdminAvatarBtn');
    const chooseBtnText = document.getElementById('chooseAvatarBtnText');
    const hiddenInput = document.getElementById('profileAvatarUrl');

    if (hiddenInput) hiddenInput.value = avatarUrl || '';

    const initialLetter = (displayName || currentAdminProfile.username || 'A').charAt(0).toUpperCase();

    if (avatarUrl && avatarUrl.trim()) {
        const cleanUrl = avatarUrl.trim();
        if (largeImg) {
            largeImg.src = cleanUrl;
            largeImg.style.display = 'block';
        }
        if (largeInitial) largeInitial.style.display = 'none';

        if (headerImg) {
            headerImg.src = cleanUrl;
            headerImg.style.display = 'block';
        }
        if (headerInitial) headerInitial.style.display = 'none';

        if (removeBtn) removeBtn.style.display = 'inline-block';
        if (chooseBtnText) chooseBtnText.textContent = 'Change Photo';
    } else {
        if (largeImg) {
            largeImg.src = '';
            largeImg.style.display = 'none';
        }
        if (largeInitial) {
            largeInitial.textContent = initialLetter;
            largeInitial.style.display = 'flex';
        }

        if (headerImg) {
            headerImg.src = '';
            headerImg.style.display = 'none';
        }
        if (headerInitial) {
            headerInitial.textContent = initialLetter;
            headerInitial.style.display = 'inline';
        }

        if (removeBtn) removeBtn.style.display = 'none';
        if (chooseBtnText) chooseBtnText.textContent = 'Upload Photo';
    }
}

// Upload Admin Avatar helper
async function handleAdminAvatarUpload(file) {
    if (!file) return;
    if (!file.type.startsWith('image/')) {
        showToast('❌ Please select an image file (PNG, JPG, or WEBP).');
        return;
    }
    if (file.size > 5 * 1024 * 1024) {
        showToast('❌ Image size exceeds 5MB limit.');
        return;
    }

    const chooseBtnText = document.getElementById('chooseAvatarBtnText');
    if (chooseBtnText) chooseBtnText.textContent = 'Uploading...';

    try {
        const formData = new FormData();
        formData.append('image', file);

        const response = await fetch('/api/upload-image', {
            method: 'POST',
            body: formData
        });

        const data = await response.json();

        if (response.ok && data.imageUrl) {
            const avatarUrl = data.imageUrl;
            // Update the visible URL field
            const urlInput = document.getElementById('profileAvatarUrl');
            if (urlInput) urlInput.value = avatarUrl;

            applyAdminAvatarToUI(avatarUrl, currentAdminProfile.display_name);

            // Auto-save to server so avatar persists immediately
            const saveRes = await fetch('/api/admin/profile', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    display_name: currentAdminProfile.display_name,
                    username: currentAdminProfile.username,
                    email: currentAdminProfile.email,
                    phone: currentAdminProfile.phone,
                    avatar_url: avatarUrl
                })
            });
            const saveData = await saveRes.json();
            if (saveRes.ok && saveData.success) {
                currentAdminProfile.avatar_url = avatarUrl;
                showToast('✓ Profile photo updated successfully!');
            } else {
                showToast('⚠️ Photo uploaded but failed to save: ' + (saveData.error || 'Unknown error'));
            }
        } else {
            showToast('❌ Failed to upload profile photo: ' + (data.error || 'Unknown error'));
        }
    } catch (err) {
        console.error('Error uploading admin avatar:', err);
        showToast('❌ Network error while uploading profile photo.');
    } finally {
        if (chooseBtnText) chooseBtnText.textContent = currentAdminProfile.avatar_url ? 'Change Photo' : 'Upload Photo';
    }
}

// Initialize Admin Avatar Upload events
function initializeAdminAvatarUpload() {
    const fileInput = document.getElementById('adminAvatarFileInput');
    const avatarLarge = document.getElementById('profileAvatarLarge');
    const avatarImg = document.getElementById('profileAvatarImg');
    const removeBtn = document.getElementById('removeAdminAvatarBtn');
    const urlInput = document.getElementById('profileAvatarUrl');
    const previewUrlBtn = document.getElementById('btnPreviewAvatarUrl');

    // Direct click on avatar area to trigger file input (in case label fails)
    const triggerUpload = () => fileInput && fileInput.click();
    if (avatarLarge) {
        avatarLarge.addEventListener('click', triggerUpload);
        avatarLarge.style.cursor = 'pointer';
    }
    if (avatarImg) {
        avatarImg.addEventListener('click', triggerUpload);
        avatarImg.style.cursor = 'pointer';
    }

    if (fileInput) {
        fileInput.addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                handleAdminAvatarUpload(e.target.files[0]);
                e.target.value = '';
            }
        });
    }

    // URL preview & apply
    if (previewUrlBtn && urlInput) {
        previewUrlBtn.addEventListener('click', async () => {
            const url = urlInput.value.trim();
            if (!url) { showToast('Please enter an image URL first.'); return; }
            applyAdminAvatarToUI(url, currentAdminProfile.display_name);
            // Auto-save
            try {
                const saveRes = await fetch('/api/admin/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        display_name: currentAdminProfile.display_name,
                        username: currentAdminProfile.username,
                        email: currentAdminProfile.email,
                        phone: currentAdminProfile.phone,
                        avatar_url: url
                    })
                });
                const saveData = await saveRes.json();
                if (saveRes.ok && saveData.success) {
                    currentAdminProfile.avatar_url = url;
                    showToast('✓ Profile photo URL applied & saved!');
                } else {
                    showToast('⚠️ Preview applied but failed to save: ' + (saveData.error || ''));
                }
            } catch (e) {
                showToast('⚠️ Preview applied but could not save.');
            }
        });
    }

    if (removeBtn) {
        removeBtn.addEventListener('click', async () => {
            applyAdminAvatarToUI('', currentAdminProfile.display_name);
            if (urlInput) urlInput.value = '';
            try {
                await fetch('/api/admin/profile', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        display_name: currentAdminProfile.display_name,
                        username: currentAdminProfile.username,
                        email: currentAdminProfile.email,
                        phone: currentAdminProfile.phone,
                        avatar_url: ''
                    })
                });
                currentAdminProfile.avatar_url = '';
                showToast('Profile photo removed.');
            } catch (err) {
                console.error('Error removing admin avatar:', err);
            }
        });
    }
}

// Load admin profile
async function loadAdminProfile() {
    try {
        const response = await fetch('/api/admin/profile');
        if (response.ok) {
            currentAdminProfile = await response.json();
            
            // Populate form fields
            const nameInput = document.getElementById('profileDisplayName');
            const userInput = document.getElementById('profileUsername');
            const emailInput = document.getElementById('profileEmail');
            const phoneInput = document.getElementById('profilePhone');
            const urlInput = document.getElementById('profileAvatarUrl');
            
            if (nameInput) nameInput.value = currentAdminProfile.display_name || '';
            if (userInput) userInput.value = currentAdminProfile.username || '';
            if (emailInput) emailInput.value = currentAdminProfile.email || '';
            if (phoneInput) phoneInput.value = currentAdminProfile.phone || '';
            if (urlInput) urlInput.value = currentAdminProfile.avatar_url || '';
            
            // Update Avatar (photo or initial)
            applyAdminAvatarToUI(currentAdminProfile.avatar_url || '', currentAdminProfile.display_name);
            
            // Update header pill name and profile card meta
            const headerName = document.getElementById('headerAdminName');
            const cardDisplayName = document.getElementById('profileCardDisplayName');
            const cardUsername = document.getElementById('profileCardUsername');
            
            if (headerName) headerName.textContent = currentAdminProfile.display_name || currentAdminProfile.username;
            if (cardDisplayName) cardDisplayName.textContent = currentAdminProfile.display_name || 'Store Administrator';
            if (cardUsername) cardUsername.textContent = `@${currentAdminProfile.username}`;
        }
    } catch (error) {
        console.error('Error loading admin profile:', error);
    }
}

// Save admin profile & password
window.handleSaveAdminProfile = async function(event) {
    if (event) event.preventDefault();
    const saveBtn = document.getElementById('saveAdminProfileBtn');
    const originalText = saveBtn ? saveBtn.innerHTML : '';
    
    const display_name = document.getElementById('profileDisplayName').value.trim();
    const username = document.getElementById('profileUsername').value.trim();
    const email = document.getElementById('profileEmail').value.trim();
    const phone = document.getElementById('profilePhone').value.trim();
    const avatar_url = (document.getElementById('profileAvatarUrl') ? document.getElementById('profileAvatarUrl').value : '').trim();
    const current_password = document.getElementById('profileCurrentPassword').value;
    const new_password = document.getElementById('profileNewPassword').value;
    const confirm_password = document.getElementById('profileConfirmPassword').value;
    
    if (!display_name || !username) {
        alert('Display Name and Username are required.');
        return;
    }
    
    // Password validation if changing password
    if (new_password || confirm_password || current_password) {
        if (!current_password) {
            alert('Please enter your current password to verify identity.');
            return;
        }
        if (new_password.length < 6) {
            alert('New password must be at least 6 characters long.');
            return;
        }
        if (new_password !== confirm_password) {
            alert('New password and confirmation do not match.');
            return;
        }
    }
    
    if (saveBtn) {
        saveBtn.disabled = true;
        saveBtn.innerHTML = '<span>Updating...</span>';
    }
    
    try {
        const payload = { display_name, username, email, phone, avatar_url };
        if (new_password) {
            payload.current_password = current_password;
            payload.new_password = new_password;
        }
        
        const response = await fetch('/api/admin/profile', {
            method: 'PUT',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(payload)
        });
        
        const result = await response.json();
        if (response.ok && result.success) {
            currentAdminProfile = { ...currentAdminProfile, display_name, username, email, phone, avatar_url };
            
            // Clear password fields
            document.getElementById('profileCurrentPassword').value = '';
            document.getElementById('profileNewPassword').value = '';
            document.getElementById('profileConfirmPassword').value = '';
            
            // Update UI avatar
            applyAdminAvatarToUI(avatar_url, display_name);
            
            const headerName = document.getElementById('headerAdminName');
            const cardDisplayName = document.getElementById('profileCardDisplayName');
            const cardUsername = document.getElementById('profileCardUsername');
            if (headerName) headerName.textContent = display_name;
            if (cardDisplayName) cardDisplayName.textContent = display_name;
            if (cardUsername) cardUsername.textContent = `@${username}`;
            
            showToast('✓ Admin profile updated successfully!');
        } else {
            alert(result.error || 'Failed to update profile');
        }
    } catch (error) {
        console.error('Error updating admin profile:', error);
        alert('Network error while updating profile');
    } finally {
        if (saveBtn) {
            saveBtn.disabled = false;
            saveBtn.innerHTML = originalText;
        }
    }
};

// Also hook up initializers in case DOM is already loaded
if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        initializeStoreLogoUpload();
        initializeAdminAvatarUpload();
    });
} else {
    initializeStoreLogoUpload();
    initializeAdminAvatarUpload();
}

// React to currency changes in Admin
window.addEventListener('currencyChanged', () => {
    if (typeof loadProducts === 'function') loadProducts();
    if (typeof loadStats === 'function') loadStats();
});
