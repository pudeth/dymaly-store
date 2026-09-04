// Global state
let allProducts = [];
let filteredProducts = [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
let allBrands = [];
let currentBrand = '';

// Helper for high-resolution brand vector logos
function getBrandLogoSvg(brandName) {
    const normalized = (brandName || '').toLowerCase().trim();
    if (normalized === 'apple') {
        return `<svg viewBox="0 0 170 170" width="28" height="28" fill="#1d1d1f"><path d="M150.37 130.25c-2.45 5.66-5.35 10.87-8.71 15.66-4.58 6.53-8.33 11.05-11.22 13.56-4.48 4.12-9.28 6.23-14.42 6.35-3.69 0-8.14-1.05-13.32-3.18-5.19-2.12-9.97-3.17-14.34-3.17-4.58 0-9.49 1.05-14.75 3.17-5.26 2.13-9.5 3.24-12.74 3.35-4.35.13-9.16-1.9-14.42-6.08-3.69-3.04-7.67-7.8-11.96-14.28-5.87-8.8-10.45-18.78-13.73-29.93-3.28-11.16-4.92-21.75-4.92-31.78 0-14.35 3.59-26.31 10.77-35.88 7.18-9.57 16.29-14.46 27.32-14.67 4.79 0 10.12 1.25 16 3.75 5.88 2.5 9.68 3.86 11.4 4.08 2.18-.32 6.16-1.74 11.96-4.25 5.79-2.51 10.98-3.69 15.56-3.54 12.29.54 22.18 4.79 29.68 12.74-10.66 6.42-15.89 15.34-15.68 26.76.22 8.92 3.74 16.48 10.56 22.68 6.82 6.2 14.86 9.77 24.11 10.72-2.18 6.64-4.8 13.06-7.85 19.26zm-26.7-104.91c0 5.44-1.85 10.77-5.55 16-3.7 5.22-8.38 8.92-14.04 11.1-1.09-4.79-1.2-9.58-.33-14.37.87-4.79 2.94-9.57 6.21-14.35 3.48-5.01 7.72-8.6 12.72-10.77.65 4.13.99 8.26.99 12.39z"/></svg>`;
    }
    if (normalized === 'samsung') {
        return `<span style="font-weight:900; font-size:9.5px; letter-spacing:0.5px; color:#1428a0;">SAMSUNG</span>`;
    }
    if (normalized === 'google') {
        return `<svg viewBox="0 0 24 24" width="26" height="26"><path fill="#4285F4" d="M23.745 12.27c0-.7-.06-1.4-.19-2.07H12v4.51h6.6c-.29 1.52-1.14 2.82-2.4 3.68v3.05h3.88c2.27-2.09 3.665-5.17 3.665-9.17z"/><path fill="#34A853" d="M12 24c3.24 0 5.95-1.08 7.93-2.91l-3.88-3.05c-1.08.72-2.45 1.16-4.05 1.16-3.12 0-5.77-2.1-6.72-4.93H1.25v3.15C3.26 21.36 7.33 24 12 24z"/><path fill="#FBBC05" d="M5.28 14.27c-.25-.72-.38-1.49-.38-2.27s.13-1.55.38-2.27V6.58H1.25C.45 8.18 0 10.03 0 12s.45 3.82 1.25 5.42l4.03-3.15z"/><path fill="#EA4335" d="M12 4.75c1.77 0 3.35.61 4.6 1.8l3.42-3.42C17.95 1.19 15.24 0 12 0 7.33 0 3.26 2.64 1.25 6.58l4.03 3.15c.95-2.83 3.6-4.98 6.72-4.98z"/></svg>`;
    }
    if (normalized === 'oneplus') {
        return `<span style="font-weight:900; font-size:12px; color:#eb0028; border:2px solid #eb0028; border-radius:5px; padding:1px 4px; line-height:1;">1+</span>`;
    }
    if (normalized === 'xiaomi') {
        return `<span style="font-weight:900; font-size:11px; background:#ff6900; color:#fff; border-radius:6px; padding:2px 5px;">mi</span>`;
    }
    return `<span style="font-size:22px;">📱</span>`;
}

function getBrandIconEmoji(brandName) {
    const normalized = (brandName || '').toLowerCase().trim();
    if (normalized === 'apple') return '';
    if (normalized === 'samsung') return '📱';
    if (normalized === 'google') return '🔍';
    if (normalized === 'oneplus') return '⚡';
    if (normalized === 'xiaomi') return '🚀';
    return '🏷️';
}

// Load products on page load
async function loadProducts() {
    try {
        const response = await fetch('/api/products');
        allProducts = await response.json();
        filteredProducts = [...allProducts];
        
        await loadBrands();
        applyFilters();
    } catch (error) {
        console.error('Error loading products:', error);
        document.getElementById('productsGrid').innerHTML = 
            '<div class="empty-state"><h3>Failed to load products</h3><p>Please try again later.</p></div>';
    }
}

// Load brands from API
async function loadBrands() {
    try {
        const response = await fetch('/api/brands');
        allBrands = await response.json();
    } catch (e) {
        console.warn('Could not load brands from /api/brands, falling back to product brands', e);
        const uniqueNames = [...new Set(allProducts.map(p => p.brand))].sort();
        allBrands = uniqueNames.map((name, i) => ({ id: i + 1, name }));
    }

    renderBrands();
    renderBrandChips();
    populateBrandFilter();
}

// Render the "Shop by Brand" cards
function renderBrands() {
    const container = document.getElementById('brandsContainer');
    if (!container) return;

    const counts = {};
    allProducts.forEach(p => {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
    });

    const brandMap = new Map();
    allBrands.forEach(b => brandMap.set(b.name, b));
    allProducts.forEach(p => {
        if (!brandMap.has(p.brand)) {
            brandMap.set(p.brand, { name: p.brand });
        }
    });

    const displayBrands = Array.from(brandMap.values()).sort((a, b) => {
        const countA = counts[a.name] || 0;
        const countB = counts[b.name] || 0;
        return countB - countA;
    });

    container.innerHTML = displayBrands.map(b => {
        const count = counts[b.name] || 0;
        const isActive = currentBrand && currentBrand.toLowerCase() === b.name.toLowerCase();
        const hasValidCustomLogo = b.logo_url && 
            typeof b.logo_url === 'string' &&
            !b.logo_url.includes('via.placeholder.com') && 
            !b.logo_url.startsWith('data:image/svg+xml;base64,PHN2Zy');
        
        const logoHtml = hasValidCustomLogo 
            ? `<img src="${b.logo_url}" alt="${b.name}" onerror="this.outerHTML = getBrandLogoSvg('${b.name}')">` 
            : getBrandLogoSvg(b.name);

        const t = (k, def) => (window.BongI18n ? window.BongI18n.t(k) : def);
        const unit = count === 1 ? t('phone_unit_single', 'phone') : t('phone_unit', 'phones');

        return `
            <div class="brand-card ${isActive ? 'active' : ''}" 
                 data-brand="${b.name}" 
                 onclick="filterByBrand('${b.name}')" 
                 role="button" 
                 tabindex="0"
                 aria-label="Filter products by ${b.name}">
                <div class="brand-logo-wrap">
                    ${logoHtml}
                </div>
                <div class="brand-card-name">${b.name}</div>
                <div class="brand-card-count">${count} ${unit}</div>
            </div>
        `;
    }).join('');
}

// Render the mobile quick filter chips
function renderBrandChips() {
    const container = document.getElementById('brandChipsContainer');
    if (!container) return;

    const counts = {};
    allProducts.forEach(p => {
        counts[p.brand] = (counts[p.brand] || 0) + 1;
    });

    const uniqueBrands = [...new Set(allProducts.map(p => p.brand))].sort();
    const allBrandsText = window.BongI18n ? window.BongI18n.t('all_brands') : 'All Brands';

    let html = `
        <button class="brand-chip ${currentBrand === '' ? 'active' : ''}" data-brand="" onclick="filterByBrand('')">
            <span class="chip-icon">📱</span> ${allBrandsText}
        </button>
    `;

    uniqueBrands.forEach(b => {
        const isActive = currentBrand && currentBrand.toLowerCase() === b.toLowerCase();
        const emoji = getBrandIconEmoji(b);
        const count = counts[b] || 0;
        html += `
            <button class="brand-chip ${isActive ? 'active' : ''}" data-brand="${b}" onclick="filterByBrand('${b}')">
                <span class="chip-icon">${emoji}</span> ${b} (${count})
            </button>
        `;
    });

    container.innerHTML = html;
}

// Populate brand filter dropdown
function populateBrandFilter() {
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();
    const brandFilter = document.getElementById('brandFilter');
    if (!brandFilter) return;
    
    brandFilter.innerHTML = '<option value="">All Brands</option>';
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandFilter.appendChild(option);
    });
}

// Render products
function renderProducts() {
    const container = document.getElementById('productsGrid');
    if (!container) return;
    
    if (filteredProducts.length === 0) {
        container.innerHTML = `
            <div class="empty-state" style="grid-column: 1 / -1; text-align: center; padding: 40px 20px;">
                <div style="font-size: 40px; margin-bottom: 12px;">🔍</div>
                <h3 style="font-size: 18px; margin-bottom: 8px;">No products found</h3>
                <p style="color: var(--text-muted); font-size: 14px; margin-bottom: 16px;">
                    ${currentBrand ? `No smartphones found for <strong>${currentBrand}</strong>.` : 'Try adjusting your search or filters.'}
                </p>
                <button class="clear-filter-btn" onclick="clearBrandSelection()" style="padding: 8px 18px; font-size: 13px;">
                    View All Products
                </button>
            </div>
        `;
        return;
    }
    
    container.innerHTML = filteredProducts.map(product => {
        const t = (k, def) => (window.BongI18n ? window.BongI18n.t(k) : def);
        const isSaved = savedItems.includes(product.id);
        const soldOutBadge = product.stock === 0 ? `<span class="sold-out-badge">${t('sold_out', 'Sold out')}</span>` : '';
        const sizeBadge = product.size ? `<span class="product-size-badge">${product.size}</span>` : '';
        
        const pid = product.id;
        return `
            <div class="product-card">
                ${soldOutBadge}
                <button class="fav-btn ${isSaved ? 'active' : ''}" 
                        onclick="toggleSaved(event, '${pid}')" 
                        title="${isSaved ? 'Remove from saved' : 'Save for later'}"
                        aria-label="${isSaved ? 'Remove from saved' : 'Save for later'}">
                    ${isSaved ? '❤️' : '🤍'}
                </button>
                <div class="product-img-wrap" onclick="viewProduct('${pid}')">
                    <div class="product-img-frame">
                        <img src="${product.image_url}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src=getPlaceholderImage('${product.name.replace(/'/g, "\\'")}', '${(product.brand || '').replace(/'/g, "\\'")}');">
                    </div>
                </div>
                <div class="product-info">
                    <div class="product-brand-row">
                        <span class="product-brand-name" onclick="filterByBrand('${product.brand}')" style="cursor: pointer;" title="Filter by ${product.brand}">${product.brand}</span>
                        ${sizeBadge}
                    </div>
                    <h3 onclick="viewProduct('${pid}')" style="cursor: pointer;">${product.name}</h3>
                    <div class="product-price-row">
                        <div class="product-price">${window.BongI18n ? window.BongI18n.formatPrice(product.price) : `$${product.price.toFixed(2)}`}</div>
                        ${product.stock > 0 ? `<button class="add-btn" onclick="addToCart(event, '${pid}')" title="${t('add_to_cart', 'Add to cart')}" aria-label="${t('add_to_cart', 'Add to cart')}">+</button>` : ''}
                    </div>
                </div>
            </div>
        `;
    }).join('');
}

// Generate local luxury phone illustration placeholder (no external network needed)
function getPlaceholderImage(name = 'Phone', brand = '') {
    const cleanBrand = (brand || 'QKZ').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
            <linearGradient id="mainBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fcfbfa"/>
                <stop offset="100%" stop-color="#ede7de"/>
            </linearGradient>
            <linearGradient id="mainPhoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#40362f"/>
                <stop offset="100%" stop-color="#241e1a"/>
            </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#mainBgGrad)" rx="20"/>
        <g transform="translate(85, 35)">
            <rect x="0" y="0" width="130" height="210" rx="22" fill="url(#mainPhoneGrad)" stroke="#d5c8b8" stroke-width="2"/>
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

// Filter by Brand function
function filterByBrand(brandName, shouldScroll = true) {
    currentBrand = brandName ? brandName.trim() : '';

    // Update active class on brand cards
    document.querySelectorAll('.brand-card').forEach(card => {
        const cardBrand = card.getAttribute('data-brand') || '';
        if (currentBrand && cardBrand.toLowerCase() === currentBrand.toLowerCase()) {
            card.classList.add('active');
            card.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
            card.classList.remove('active');
        }
    });

    // Update active class on brand chips
    document.querySelectorAll('.brand-chip').forEach(chip => {
        const chipBrand = chip.getAttribute('data-brand') || '';
        if (currentBrand === '' && chipBrand === '') {
            chip.classList.add('active');
            chip.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else if (currentBrand && chipBrand.toLowerCase() === currentBrand.toLowerCase()) {
            chip.classList.add('active');
            chip.scrollIntoView?.({ behavior: 'smooth', inline: 'center', block: 'nearest' });
        } else {
            chip.classList.remove('active');
        }
    });

    // Synchronize select dropdown
    const brandFilter = document.getElementById('brandFilter');
    if (brandFilter) {
        brandFilter.value = currentBrand;
    }

    // Update active filter alert & reset button
    const alertEl = document.getElementById('activeFilterAlert');
    const alertBrandName = document.getElementById('activeFilterBrandName');
    const resetBrandBtn = document.getElementById('resetBrandBtn');
    const headingEl = document.getElementById('productsHeading');

    if (currentBrand) {
        if (alertEl) alertEl.style.display = 'flex';
        if (alertBrandName) alertBrandName.textContent = currentBrand;
        if (resetBrandBtn) resetBrandBtn.style.display = 'inline-block';
        if (headingEl) headingEl.textContent = `${currentBrand} Phones`;
    } else {
        if (alertEl) alertEl.style.display = 'none';
        if (resetBrandBtn) resetBrandBtn.style.display = 'none';
        if (headingEl) headingEl.textContent = 'All Products';
    }

    // Reapply filter logic
    applyFilters();

    // Smooth scroll down to products section if requested
    if (shouldScroll) {
        const target = document.getElementById('productsSection');
        if (target) {
            target.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }
}

// Clear brand selection back to all products
function clearBrandSelection() {
    filterByBrand('', false);
}

// Update product count tag
function updateProductCount() {
    const tag = document.getElementById('productCountTag');
    if (tag) {
        const len = filteredProducts.length;
        tag.textContent = `${len} ${len === 1 ? 'item' : 'items'}`;
    }
}

// Unified filter application (Brand + Search)
function applyFilters() {
    const searchInput = document.getElementById('searchInput');
    const searchTerm = searchInput ? searchInput.value.toLowerCase().trim() : '';

    let list = [...allProducts];

    // Filter by brand
    if (currentBrand) {
        list = list.filter(p => p.brand.toLowerCase() === currentBrand.toLowerCase());
    }

    // Filter by search term
    if (searchTerm) {
        list = list.filter(p => 
            p.name.toLowerCase().includes(searchTerm) ||
            p.brand.toLowerCase().includes(searchTerm) ||
            (p.description && p.description.toLowerCase().includes(searchTerm))
        );
    }

    filteredProducts = list;
    applySorting();
}

// Listen to brand select dropdown for compatibility
document.getElementById('brandFilter')?.addEventListener('change', (e) => {
    filterByBrand(e.target.value, false);
});

// Sort products
document.getElementById('sortFilter').addEventListener('change', applySorting);

function applySorting() {
    const sortFilter = document.getElementById('sortFilter');
    const sortValue = sortFilter ? sortFilter.value : 'newest';
    
    switch(sortValue) {
        case 'newest':
            filteredProducts.sort((a, b) => new Date(b.created_at) - new Date(a.created_at));
            break;
        case 'price-low':
            filteredProducts.sort((a, b) => a.price - b.price);
            break;
        case 'price-high':
            filteredProducts.sort((a, b) => b.price - a.price);
            break;
    }
    
    renderProducts();
    updateProductCount();
}

// View product details
function viewProduct(id) {
    const product = allProducts.find(p => p.id === id);
    if (!product) return;
    
    const modal = document.getElementById('productModal');
    const isSaved = savedItems.includes(product.id);
    
    // Populate modal
    const modalImg = document.getElementById('modalImage');
    if (modalImg) {
        modalImg.src = product.image_url;
        modalImg.alt = product.name;
        modalImg.onerror = function() {
            this.onerror = null;
            this.src = getPlaceholderImage(product.name, product.brand);
        };
    }
    document.getElementById('modalTitle').textContent = product.name;
    const modalBrand = document.getElementById('modalBrand');
    if (modalBrand) {
        const sizeBadge = product.size ? ` <span class="product-size-badge">${product.size}</span>` : '';
        modalBrand.innerHTML = `<span>${product.brand}</span>${sizeBadge}`;
    }
    const modalPriceEl = document.getElementById('modalPrice');
    if (modalPriceEl) {
        modalPriceEl.innerHTML = window.BongI18n ? window.BongI18n.formatPrice(product.price, { showBoth: true }) : `$${product.price.toFixed(2)}`;
    }
    document.getElementById('modalDescription').textContent = product.description || 'No description available.';
    
    // Get reviews for this product
    fetchProductReviews(product.id);
    
    // Stock info
    const stockInfo = document.getElementById('modalStockInfo');
    if (product.stock === 0) {
        stockInfo.textContent = 'Out of stock';
        stockInfo.className = 'modal-stock-info out';
    } else if (product.stock < 10) {
        stockInfo.textContent = `Only ${product.stock} left!`;
        stockInfo.className = 'modal-stock-info low';
    } else {
        stockInfo.textContent = 'In stock';
        stockInfo.className = 'modal-stock-info';
    }
    
    // Add to cart button
    const addBtn = document.getElementById('modalAddBtn');
    if (product.stock === 0) {
        addBtn.disabled = true;
        addBtn.innerHTML = '<span>🛍️</span> Out of stock';
    } else {
        addBtn.disabled = false;
        addBtn.innerHTML = '<span>🛍️</span> Add to cart';
        addBtn.onclick = () => {
            addToCart(null, product.id);
        };
    }
    
    // Favorite button
    const favBtn = document.getElementById('modalFavBtn');
    favBtn.textContent = isSaved ? '❤️' : '🤍';
    favBtn.className = isSaved ? 'modal-fav-btn active' : 'modal-fav-btn';
    favBtn.onclick = () => {
        toggleSavedInModal(product.id);
    };
    
    // Show modal
    modal.classList.add('show');
    document.body.classList.add('modal-open');
}

// Close product modal
function closeProductModal() {
    const modal = document.getElementById('productModal');
    modal.classList.remove('show');
    document.body.classList.remove('modal-open');
}

// Toggle saved status from product card
function toggleSaved(event, productId) {
    if (event) {
        event.stopPropagation();
        event.preventDefault();
    }
    
    const index = savedItems.indexOf(productId);
    if (index > -1) {
        savedItems.splice(index, 1);
        showToast('Removed from saved');
    } else {
        savedItems.push(productId);
        showToast('Saved for later');
    }
    
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    renderProducts();
}

// Toggle saved in modal
function toggleSavedInModal(productId) {
    const index = savedItems.indexOf(productId);
    if (index > -1) {
        savedItems.splice(index, 1);
        showToast('Removed from saved');
    } else {
        savedItems.push(productId);
        showToast('Saved for later');
    }
    
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    
    const isSaved = savedItems.includes(productId);
    const favBtn = document.getElementById('modalFavBtn');
    if (favBtn) {
        favBtn.textContent = isSaved ? '❤️' : '🤍';
        favBtn.className = isSaved ? 'modal-fav-btn active' : 'modal-fav-btn';
    }
    
    renderProducts();
}

// Bind functions to window for inline HTML onclick attributes
window.toggleSaved = toggleSaved;
window.toggleSavedInModal = toggleSavedInModal;
window.addToCart = addToCart;
window.viewProduct = viewProduct;
window.closeProductModal = closeProductModal;

// Fetch product reviews
async function fetchProductReviews(productId) {
    try {
        const response = await fetch(`/api/reviews/${productId}`);
        const reviews = await response.json();
        
        const starsSpan = document.getElementById('modalStars');
        const reviewCount = document.getElementById('modalReviewCount');
        
        if (reviews.length === 0) {
            starsSpan.textContent = '';
            reviewCount.textContent = 'No reviews yet';
        } else {
            const avgRating = reviews.reduce((sum, r) => sum + r.rating, 0) / reviews.length;
            const fullStars = Math.floor(avgRating);
            const halfStar = avgRating % 1 >= 0.5 ? 1 : 0;
            
            starsSpan.textContent = '★'.repeat(fullStars) + (halfStar ? '☆' : '');
            reviewCount.textContent = `${avgRating.toFixed(1)} · ${reviews.length} review${reviews.length !== 1 ? 's' : ''}`;
        }
    } catch (error) {
        console.error('Error fetching reviews:', error);
        document.getElementById('modalStars').textContent = '';
        document.getElementById('modalReviewCount').textContent = '';
    }
}

// Close modal on outside click
document.getElementById('productModal')?.addEventListener('click', (e) => {
    if (e.target.id === 'productModal') {
        closeProductModal();
    }
});

// Close modal on escape key
document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape') {
        closeProductModal();
    }
});

// Add swipe down to close on mobile
let touchStartY = 0;
let touchEndY = 0;

document.getElementById('productModal')?.addEventListener('touchstart', (e) => {
    const modalContent = document.querySelector('.modal-content');
    if (e.target === modalContent || modalContent.contains(e.target)) {
        touchStartY = e.touches[0].clientY;
    }
}, { passive: true });

document.getElementById('productModal')?.addEventListener('touchend', (e) => {
    const modalContent = document.querySelector('.modal-content');
    if (modalContent.scrollTop === 0) {
        touchEndY = e.changedTouches[0].clientY;
        const swipeDistance = touchEndY - touchStartY;
        
        // If swiped down more than 100px, close modal
        if (swipeDistance > 100) {
            closeProductModal();
        }
    }
}, { passive: true });

// Cart management
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + (item.quantity || 1), 0);
    const headerBadge = document.getElementById('cartBadge');
    if (headerBadge) {
        if (totalItems > 0) {
            headerBadge.textContent = totalItems > 99 ? '99+' : totalItems;
            headerBadge.style.display = 'inline-flex';
        } else {
            headerBadge.style.display = 'none';
        }
    }
    const navBadge = document.getElementById('navCartBadge');
    if (navBadge) {
        if (totalItems > 0) {
            navBadge.textContent = totalItems > 99 ? '99+' : totalItems;
            navBadge.style.display = 'flex';
        } else {
            navBadge.style.display = 'none';
        }
    }
}

function showToast(message) {
    const toast = document.getElementById('cartToast');
    const toastText = document.getElementById('cartToastText');
    if (!toast) return;
    if (toastText && message) toastText.textContent = message;
    toast.classList.add('show');
    setTimeout(() => {
        toast.classList.remove('show');
    }, 2000);
}

function addToCart(event, productId) {
    if (event) event.stopPropagation();
    const product = allProducts.find(p => p.id === productId);
    if (!product || product.stock === 0) return;

    const existing = cart.find(item => item.id === productId);
    if (existing) {
        if (existing.quantity < product.stock) {
            existing.quantity++;
        } else {
            showToast('Max stock reached');
            return;
        }
    } else {
        cart.push({
            id: product.id,
            name: product.name,
            brand: product.brand,
            price: product.price,
            image_url: product.image_url,
            size: product.size,
            quantity: 1,
            maxStock: product.stock
        });
    }

    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
    showToast('Added to cart');

    if (event && event.currentTarget) {
        const btn = event.currentTarget;
        const originalHtml = btn.innerHTML;
        btn.innerHTML = '✓';
        setTimeout(() => {
            btn.innerHTML = originalHtml;
        }, 1200);
    }
}

// Initialize
loadProducts();
updateCartBadge();

// ==================== CAROUSEL CONTROLLER ====================
let currentSlide = 0;
let carouselInterval = null;
let isDragging = false;
let isTransitioning = false;
let startX = 0;
let startY = 0;
let currentDeltaX = 0;
let isHorizontalSwipe = null;
let hasDragged = false;
let carouselEl = null;
let slidesEl = null;
let totalSlides = 0;

function updateSlidePosition(immediate = false, customOffset = 0) {
    if (!slidesEl) return;

    if (immediate) {
        slidesEl.style.transition = 'none';
    } else {
        slidesEl.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1)';
    }

    const percentage = -(currentSlide * 100);
    if (customOffset !== 0) {
        slidesEl.style.transform = `translateX(calc(${percentage}% + ${customOffset}px))`;
    } else {
        slidesEl.style.transform = `translateX(${percentage}%)`;
    }

    // Update active class and indicator dots
    const slides = document.querySelectorAll('.banner-slide');
    const dots = document.querySelectorAll('.carousel-indicators .dot');

    slides.forEach((slide, i) => {
        if (i === currentSlide) {
            slide.classList.add('active');
        } else {
            slide.classList.remove('active');
        }
    });

    dots.forEach((dot, i) => {
        if (i === currentSlide) {
            dot.classList.add('active');
        } else {
            dot.classList.remove('active');
        }
    });
}

// Cinematic Zoom-Out depth transition before moving to next page
async function transitionToSlide(targetIndex) {
    const slides = document.querySelectorAll('.banner-slide');
    if (slides.length === 0) return;
    totalSlides = slides.length;

    const normalizedTarget = (targetIndex + totalSlides) % totalSlides;
    if (normalizedTarget === currentSlide || isTransitioning || isDragging) return;

    isTransitioning = true;
    const currentSlideEl = slides[currentSlide];
    const targetSlideEl = slides[normalizedTarget];
    const currentLayer = currentSlideEl ? currentSlideEl.querySelector('.banner-slide-layer') : null;
    const targetLayer = targetSlideEl ? targetSlideEl.querySelector('.banner-slide-layer') : null;

    // Step 1: Entire background banner card ZOOMS OUT (1.00 -> 0.82) into depth before moving to next page
    if (currentSlideEl && currentLayer) {
        currentSlideEl.classList.add('is-zooming');
        currentLayer.style.transition = 'transform 0.22s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.22s ease, box-shadow 0.22s ease';
        currentLayer.style.transform = 'scale(0.82)'; // Whole Card Background Zooms Out
        currentLayer.style.opacity = '0.8';
    }

    // Target slide starts at slight scale ready to expand cleanly
    if (targetLayer) {
        targetLayer.style.transition = 'none';
        targetLayer.style.transform = 'scale(0.86)';
        targetLayer.style.opacity = '0.85';
    }

    // Brief pause to feel the whole background card zoom out
    await new Promise(resolve => setTimeout(resolve, 200));

    // Step 2: Smooth track slide to next page
    currentSlide = normalizedTarget;
    updateSlidePosition(false);

    // Step 3: Incoming background banner card smoothly expands into full scale(1.0)
    if (targetLayer) {
        targetLayer.offsetHeight; // trigger reflow
        targetLayer.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease';
        targetLayer.style.transform = 'scale(1.0)';
        targetLayer.style.opacity = '1';
    }

    // Clean up previous slide zoom state
    setTimeout(() => {
        slides.forEach((s, idx) => {
            s.classList.remove('is-zooming');
            const layer = s.querySelector('.banner-slide-layer');
            if (layer && idx !== currentSlide) {
                layer.style.transition = 'none';
                layer.style.transform = 'scale(1.0)';
                layer.style.opacity = '1';
            }
        });
        isTransitioning = false;
    }, 460);
}

function goToSlide(index) {
    transitionToSlide(index);
}

// Window global for inline dot onclick handlers
window.goToSlide = function(index) {
    transitionToSlide(index);
    startCarouselTimer();
};

function nextSlide() {
    transitionToSlide(currentSlide + 1);
}

function prevSlide() {
    transitionToSlide(currentSlide - 1);
}

function startCarouselTimer() {
    stopCarouselTimer();
    carouselInterval = setInterval(nextSlide, 5000);
}

function stopCarouselTimer() {
    if (carouselInterval) {
        clearInterval(carouselInterval);
        carouselInterval = null;
    }
}

function initCarousel() {
    carouselEl = document.getElementById('bannerCarousel');
    slidesEl = document.getElementById('bannerSlides');
    const prevBtn = document.getElementById('carouselPrev');
    const nextBtn = document.getElementById('carouselNext');

    if (!carouselEl || !slidesEl) return;
    const slides = document.querySelectorAll('.banner-slide');
    totalSlides = slides.length;
    if (totalSlides === 0) return;

    prevBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        prevSlide();
        startCarouselTimer();
    });

    nextBtn?.addEventListener('click', (e) => {
        e.stopPropagation();
        nextSlide();
        startCarouselTimer();
    });

    // Pause on hover
    carouselEl.addEventListener('mouseenter', stopCarouselTimer);
    carouselEl.addEventListener('mouseleave', () => {
        if (!isDragging) startCarouselTimer();
    });

    // Prevent button click if the user was dragging/swiping
    carouselEl.addEventListener('click', (e) => {
        if (hasDragged) {
            e.preventDefault();
            e.stopPropagation();
            hasDragged = false;
        }
    }, true);

    // Gestures handling (Touch & Pointer)
    const onGestureStart = (clientX, clientY) => {
        if (isTransitioning) return;
        isDragging = true;
        hasDragged = false;
        startX = clientX;
        startY = clientY;
        currentDeltaX = 0;
        isHorizontalSwipe = null;
        stopCarouselTimer();
        carouselEl.classList.add('is-dragging');
        slidesEl.style.transition = 'none';
    };

    const onGestureMove = (clientX, clientY, e) => {
        if (!isDragging) return;
        const deltaX = clientX - startX;
        const deltaY = clientY - startY;

        // Detect direction on initial movement
        if (isHorizontalSwipe === null) {
            if (Math.abs(deltaX) > 5 || Math.abs(deltaY) > 5) {
                isHorizontalSwipe = Math.abs(deltaX) > Math.abs(deltaY);
            }
        }

        // If user is scrolling vertically, don't intercept
        if (isHorizontalSwipe === false) {
            return;
        }

        if (isHorizontalSwipe === true) {
            if (e && e.cancelable) {
                e.preventDefault();
            }
            if (Math.abs(deltaX) > 7) {
                hasDragged = true;
            }

            // Rubber-band resistance at boundaries
            let dampedDelta = deltaX;
            if ((currentSlide === 0 && deltaX > 0) || (currentSlide === totalSlides - 1 && deltaX < 0)) {
                dampedDelta = deltaX * 0.3;
            }

            currentDeltaX = dampedDelta;
            updateSlidePosition(true, currentDeltaX);

            // Live Zoom-Out during touch drag:
            // As user drags to move to next page, current card ZOOMS OUT (1.00 -> 0.82)
            const dragProgress = Math.min(Math.abs(currentDeltaX) / (carouselEl.offsetWidth * 0.45), 1);
            const activeZoom = 1.0 - (0.18 * dragProgress); // 1.00 down to 0.82 (Zoom Out)
            const activeOpacity = 1.0 - (0.25 * dragProgress); // 1.00 down to 0.75

            const activeSlideEl = slides[currentSlide];
            const activeLayer = activeSlideEl ? activeSlideEl.querySelector('.banner-slide-layer') : null;
            if (activeLayer) {
                activeLayer.style.transition = 'none';
                activeLayer.style.transform = `scale(${activeZoom.toFixed(3)})`;
                activeLayer.style.opacity = activeOpacity.toFixed(2);
            }

            // Approaching adjacent card smoothly expands into focus (0.86 -> 1.00)
            const neighborIndex = deltaX < 0 ? currentSlide + 1 : currentSlide - 1;
            if (neighborIndex >= 0 && neighborIndex < totalSlides) {
                const neighborSlide = slides[neighborIndex];
                const neighborLayer = neighborSlide ? neighborSlide.querySelector('.banner-slide-layer') : null;
                if (neighborLayer) {
                    const neighborZoom = 0.86 + (0.14 * dragProgress);
                    const neighborOpacity = 0.75 + (0.25 * dragProgress);
                    neighborLayer.style.transition = 'none';
                    neighborLayer.style.transform = `scale(${neighborZoom.toFixed(3)})`;
                    neighborLayer.style.opacity = neighborOpacity.toFixed(2);
                }
            }
        }
    };

    const onGestureEnd = () => {
        if (!isDragging) return;
        isDragging = false;
        carouselEl.classList.remove('is-dragging');

        const threshold = Math.min(carouselEl.offsetWidth * 0.18, 65);
        let targetIndex = currentSlide;

        if (isHorizontalSwipe === true && Math.abs(currentDeltaX) > threshold) {
            if (currentDeltaX < -threshold) {
                // Swiped left -> advance to next slide
                if (currentSlide < totalSlides - 1) {
                    targetIndex = currentSlide + 1;
                }
            } else if (currentDeltaX > threshold) {
                // Swiped right -> retreat to previous slide
                if (currentSlide > 0) {
                    targetIndex = currentSlide - 1;
                }
            }
        }

        currentDeltaX = 0;
        isHorizontalSwipe = null;

        if (targetIndex !== currentSlide) {
            // Animate smoothly to new slide and settle into scale(1.0)
            currentSlide = targetIndex;
            updateSlidePosition(false);

            slides.forEach((s, idx) => {
                const layer = s.querySelector('.banner-slide-layer');
                if (layer) {
                    if (idx === currentSlide) {
                        layer.style.transition = 'transform 0.45s cubic-bezier(0.22, 1, 0.36, 1), opacity 0.45s ease';
                        layer.style.transform = 'scale(1.0)';
                        layer.style.opacity = '1';
                    } else {
                        layer.style.transition = 'none';
                        layer.style.transform = 'scale(1.0)';
                        layer.style.opacity = '1';
                    }
                }
            });
        } else {
            // Snapped back: smoothly return position and scale to 1.0
            updateSlidePosition(false);
            slides.forEach((s) => {
                const layer = s.querySelector('.banner-slide-layer');
                if (layer) {
                    layer.style.transition = 'transform 0.35s cubic-bezier(0.25, 1, 0.5, 1), opacity 0.35s ease';
                    layer.style.transform = 'scale(1.0)';
                    layer.style.opacity = '1';
                }
            });
        }

        startCarouselTimer();
    };

    // Mobile touch events
    carouselEl.addEventListener('touchstart', (e) => {
        if (e.touches.length === 1) {
            onGestureStart(e.touches[0].clientX, e.touches[0].clientY);
        }
    }, { passive: true });

    carouselEl.addEventListener('touchmove', (e) => {
        if (e.touches.length === 1) {
            onGestureMove(e.touches[0].clientX, e.touches[0].clientY, e);
        }
    }, { passive: false });

    carouselEl.addEventListener('touchend', onGestureEnd, { passive: true });
    carouselEl.addEventListener('touchcancel', onGestureEnd, { passive: true });

    // Desktop pointer dragging
    carouselEl.addEventListener('pointerdown', (e) => {
        if (e.pointerType === 'mouse' && e.button !== 0) return;
        if (e.pointerType === 'mouse') {
            onGestureStart(e.clientX, e.clientY);
            const onPointerMove = (moveEvt) => {
                onGestureMove(moveEvt.clientX, moveEvt.clientY, moveEvt);
            };
            const onPointerUp = () => {
                window.removeEventListener('pointermove', onPointerMove);
                window.removeEventListener('pointerup', onPointerUp);
                onGestureEnd();
            };
            window.addEventListener('pointermove', onPointerMove);
            window.addEventListener('pointerup', onPointerUp);
        }
    });

    // Window resize handler to maintain exact track positioning
    window.addEventListener('resize', () => {
        updateSlidePosition(true);
    });

    updateSlidePosition(true);
    startCarouselTimer();
}

// ==================== SEARCH CONTROLLER ====================
function initSearch() {
    const searchInput = document.getElementById('searchInput');
    const searchClearBtn = document.getElementById('searchClearBtn');

    if (!searchInput) return;

    searchInput.addEventListener('input', (e) => {
        const val = e.target.value;
        if (searchClearBtn) {
            if (val.length > 0) {
                searchClearBtn.classList.add('visible');
            } else {
                searchClearBtn.classList.remove('visible');
            }
        }
        applyFilters();
    });

    searchClearBtn?.addEventListener('click', () => {
        searchInput.value = '';
        searchClearBtn.classList.remove('visible');
        searchInput.focus();
        applyFilters();
    });
}

// Initialize components
initCarousel();
initSearch();

// Scroll behavior - hide/show header and footer completely
let lastScrollTop = 0;
let scrollTimeout;

window.addEventListener('scroll', function() {
    const header = document.querySelector('header.site-header');
    const mobileNav = document.querySelector('.mobile-nav');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Add scrolled class for enhanced shadow
    if (currentScroll > 50) {
        header.classList.add('scrolled');
    } else {
        header.classList.remove('scrolled');
    }
    
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Delay to make it smoother
    scrollTimeout = setTimeout(() => {
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down - hide header and hide footer cleanly
            header.classList.add('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-compact');
                mobileNav.classList.add('nav-hidden');
            }
        } else if (currentScroll < lastScrollTop) {
            // Scrolling up - show header and footer
            header.classList.remove('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-compact');
                mobileNav.classList.remove('nav-hidden');
            }
        }
        
        // At top of page, always show everything
        if (currentScroll <= 50) {
            header.classList.remove('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-compact');
                mobileNav.classList.remove('nav-hidden');
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, 50);
}, false);

// Search Modal Functions
function openSearchModal() {
    const modal = document.getElementById('searchModal');
    modal.classList.add('active');
    document.body.style.overflow = 'hidden';
    
    // Populate brand dropdown
    populateModalBrandFilter();
    
    // Focus on search input
    setTimeout(() => {
        document.getElementById('modalSearchName').focus();
    }, 300);
}

function closeSearchModal(event) {
    const modal = document.getElementById('searchModal');
    modal.classList.remove('active');
    document.body.style.overflow = '';
}

function populateModalBrandFilter() {
    const brands = [...new Set(allProducts.map(p => p.brand))].sort();
    const brandSelect = document.getElementById('modalSearchBrand');
    
    // Clear existing options except "All Brands"
    brandSelect.innerHTML = '<option value="">All Brands</option>';
    
    brands.forEach(brand => {
        const option = document.createElement('option');
        option.value = brand;
        option.textContent = brand;
        brandSelect.appendChild(option);
    });
}

function applySearch(event) {
    event.preventDefault();
    
    const searchName = document.getElementById('modalSearchName').value.toLowerCase().trim();
    const searchBrand = document.getElementById('modalSearchBrand').value;
    const searchCategory = document.getElementById('modalSearchCategory').value;
    
    // Start with all products
    filteredProducts = [...allProducts];
    
    // Filter by name
    if (searchName) {
        filteredProducts = filteredProducts.filter(p => 
            p.name.toLowerCase().includes(searchName) ||
            (p.description && p.description.toLowerCase().includes(searchName))
        );
    }
    
    // Filter by brand
    if (searchBrand) {
        filteredProducts = filteredProducts.filter(p => p.brand === searchBrand);
    }
    
    // Filter by category (price-based categories)
    if (searchCategory === 'flagship') {
        filteredProducts = filteredProducts.filter(p => p.price >= 900);
    } else if (searchCategory === 'mid-range') {
        filteredProducts = filteredProducts.filter(p => p.price >= 700 && p.price < 900);
    } else if (searchCategory === 'budget') {
        filteredProducts = filteredProducts.filter(p => p.price < 700);
    }
    
    // Apply sorting
    applySorting();
    
    // Close modal
    closeSearchModal();
    
    // Scroll to products
    document.querySelector('.products-section').scrollIntoView({ behavior: 'smooth' });
}

function clearSearch() {
    document.getElementById('modalSearchName').value = '';
    document.getElementById('modalSearchBrand').value = '';
    document.getElementById('modalSearchCategory').value = '';
    
    // Reset to all products
    filteredProducts = [...allProducts];
    applySorting();
    
    // Close modal
    closeSearchModal();
}


// ==================== SCROLL TO TOP BUTTON ====================

const scrollToTopBtn = document.getElementById('scrollToTopBtn');

if (scrollToTopBtn) {
    // Show/hide button based on scroll position
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    // Scroll to top with smooth animation
    scrollToTopBtn.addEventListener('click', () => {
        // Add clicked animation
        scrollToTopBtn.classList.add('clicked');
        setTimeout(() => scrollToTopBtn.classList.remove('clicked'), 600);
        
        // Smooth scroll to top
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Apply all website settings dynamically across customer store
function applyWebsiteData(settings) {
    if (!settings) return;

    // 1. Store Title & Headings
    if (settings.store_name) {
        document.querySelectorAll('.brand-text h1, .brand h1, .footer-brand h2, #storeBrandTitle, #footerStoreName').forEach(el => {
            el.textContent = settings.store_name;
        });
        if (document.title.includes('QKZ Store') || document.title.includes('Bong Store') || document.title.includes('DyMaly')) {
            document.title = `${settings.store_name} - Premium Smartphones`;
        }
    }
    
    // 2. Store Tagline
    if (settings.store_tagline) {
        document.querySelectorAll('.brand-text p, .brand p, #storeBrandTagline').forEach(el => {
            el.textContent = settings.store_tagline;
        });
    }
    
    // 3. Custom Store Logo
    const logoUrl = (settings.store_logo || '').trim();
    const brandIcons = document.querySelectorAll('.brand-icon, #customerBrandIcon');
    
    brandIcons.forEach(iconBox => {
        let img = iconBox.querySelector('img.brand-custom-logo-img');
        let svg = iconBox.querySelector('svg');
        
        if (!img) {
            img = document.createElement('img');
            img.className = 'brand-custom-logo-img';
            img.alt = settings.store_name || 'Store Logo';
            img.style.display = 'none';
            iconBox.appendChild(img);
        }
        
        if (logoUrl) {
            img.onload = () => {
                img.style.display = 'block';
                if (svg) svg.style.display = 'none';
                iconBox.classList.add('has-logo');
            };
            img.onerror = () => {
                img.style.display = 'none';
                if (svg) svg.style.display = 'block';
                iconBox.classList.remove('has-logo');
            };
            img.src = logoUrl;
            
            if (img.complete && img.naturalWidth > 0) {
                img.style.display = 'block';
                if (svg) svg.style.display = 'none';
                iconBox.classList.add('has-logo');
            }
        } else {
            img.style.display = 'none';
            if (svg) svg.style.display = 'block';
            iconBox.classList.remove('has-logo');
        }
    });

    // Update favicon
    if (logoUrl) {
        let favicon = document.querySelector("link[rel*='icon']");
        if (!favicon) {
            favicon = document.createElement('link');
            favicon.rel = 'icon';
            document.head.appendChild(favicon);
        }
        favicon.href = logoUrl;
    }

    // 4. Top Announcement Bar
    const announcementBar = document.getElementById('announcementBar');
    if (announcementBar) {
        const isEnabled = settings.announcement_enabled === 'true' || settings.announcement_enabled === true;
        if (isEnabled && settings.announcement_text) {
            announcementBar.style.display = 'block';
            const badgeEl = document.getElementById('announcementBadge');
            const textEl = document.getElementById('announcementText');
            const linkEl = document.getElementById('announcementLink');
            if (badgeEl) badgeEl.textContent = settings.announcement_badge || 'Special Offer';
            if (textEl) textEl.textContent = settings.announcement_text;
            if (linkEl) {
                linkEl.href = settings.announcement_link || '#productsSection';
                linkEl.style.display = settings.announcement_link ? 'inline' : 'none';
            }
        } else {
            announcementBar.style.display = 'none';
        }
    }

    // 5. Hero Promo Banner
    const firstSlide = document.querySelector('.banner-slide');
    if (firstSlide && settings.hero_title) {
        const badgeEl = firstSlide.querySelector('.banner-badge');
        const titleEl = firstSlide.querySelector('.banner-title');
        const descEl = firstSlide.querySelector('.banner-desc');
        const btnEl = firstSlide.querySelector('.banner-btn');
        if (badgeEl && settings.hero_badge) badgeEl.textContent = settings.hero_badge;
        if (titleEl) titleEl.textContent = settings.hero_title;
        if (descEl && settings.hero_subtitle) descEl.textContent = settings.hero_subtitle;
        if (btnEl && settings.hero_btn_text) btnEl.textContent = settings.hero_btn_text;
    }

    // 6. Trust Features / Guarantees
    const trustGrid = document.getElementById('trustFeaturesGrid');
    if (trustGrid) {
        const badges = [
            { icon: settings.badge_1_icon || '🚀', title: settings.badge_1_title || 'Express Delivery', desc: settings.badge_1_desc || 'Fast shipping nationwide' },
            { icon: settings.badge_2_icon || '🛡️', title: settings.badge_2_title || 'Official Warranty', desc: settings.badge_2_desc || '1-Year genuine warranty' },
            { icon: settings.badge_3_icon || '💬', title: settings.badge_3_title || '24/7 Support', desc: settings.badge_3_desc || 'Instant help via Telegram' },
            { icon: settings.badge_4_icon || '🔄', title: settings.badge_4_title || '7-Day Return', desc: settings.badge_4_desc || 'Hassle-free exchange' }
        ];

        trustGrid.innerHTML = badges.map(b => `
            <div class="trust-card">
                <div class="trust-icon-box">${b.icon}</div>
                <div class="trust-info">
                    <h4 class="trust-title">${b.title}</h4>
                    <p class="trust-desc">${b.desc}</p>
                </div>
            </div>
        `).join('');
    }

    // 7. Footer About & Copyright
    const footerAbout = document.getElementById('footerStoreAbout');
    if (footerAbout && settings.footer_about) {
        footerAbout.textContent = settings.footer_about;
    }
    const footerCopyright = document.getElementById('footerCopyright');
    if (footerCopyright && settings.footer_copyright) {
        footerCopyright.textContent = settings.footer_copyright;
    }

    // 8. Footer Contact Info
    const phoneLink = document.getElementById('footerPhoneLink');
    if (phoneLink && settings.store_phone) {
        phoneLink.textContent = settings.store_phone;
        phoneLink.href = 'tel:' + settings.store_phone.replace(/\s+/g, '');
    }
    const emailLink = document.getElementById('footerEmailLink');
    if (emailLink && settings.store_email) {
        emailLink.textContent = settings.store_email;
        emailLink.href = 'mailto:' + settings.store_email.trim();
    }
    const addressText = document.getElementById('footerAddressText');
    if (addressText && settings.store_address) {
        addressText.textContent = settings.store_address;
    }
    const hoursText = document.getElementById('footerHoursText');
    if (hoursText && settings.store_hours) {
        hoursText.textContent = settings.store_hours;
    }

    // 9. Footer Social Links
    const socialContainer = document.getElementById('footerSocialLinks');
    if (socialContainer) {
        const links = [];
        if (settings.social_telegram) {
            links.push(`<a href="${settings.social_telegram}" target="_blank" rel="noopener" class="footer-social-btn">✈️ Telegram</a>`);
        }
        if (settings.social_facebook) {
            links.push(`<a href="${settings.social_facebook}" target="_blank" rel="noopener" class="footer-social-btn">📘 Facebook</a>`);
        }
        if (settings.social_tiktok) {
            links.push(`<a href="${settings.social_tiktok}" target="_blank" rel="noopener" class="footer-social-btn">🎵 TikTok</a>`);
        }
        if (settings.social_instagram) {
            links.push(`<a href="${settings.social_instagram}" target="_blank" rel="noopener" class="footer-social-btn">📸 Instagram</a>`);
        }
        socialContainer.innerHTML = links.join('');
    }
}

// Load and apply store settings dynamically across customer store
async function loadStoreIdentity() {
    try {
        const response = await fetch('/api/settings?_t=' + Date.now(), { cache: 'no-cache' });
        if (response.ok) {
            const settings = await response.json();
            applyWebsiteData(settings);
        }
    } catch (e) {
        console.warn('Could not load store identity:', e);
    }
}

// ==================== REAL-TIME LIVE STREAM (SSE) ====================
let sseEventSource = null;

function connectRealtimeStream() {
    if (window.EventSource) {
        try {
            if (sseEventSource) sseEventSource.close();
            
            sseEventSource = new EventSource('/api/realtime/stream');
            
            sseEventSource.onmessage = function(event) {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'connected') {
                        updateLiveBadge(true);
                    } else if (msg.type === 'settings_updated') {
                        applyWebsiteData(msg.payload);
                        flashLiveSync('Website updated live');
                    } else if (msg.type === 'products_updated') {
                        if (typeof loadProducts === 'function') loadProducts();
                        flashLiveSync('Products updated');
                    } else if (msg.type === 'brands_updated' || msg.type === 'categories_updated') {
                        if (typeof loadBrands === 'function') loadBrands();
                    }
                } catch (err) {
                    console.debug('SSE parse:', err);
                }
            };

            sseEventSource.onerror = function() {
                updateLiveBadge(false);
                if (sseEventSource) sseEventSource.close();
                // Reconnect after 5 seconds
                setTimeout(connectRealtimeStream, 5000);
            };
        } catch (e) {
            console.warn('Realtime SSE setup warning:', e);
        }
    }
}

function updateLiveBadge(isConnected) {
    const badge = document.getElementById('liveSyncBadge');
    if (!badge) return;
    const dot = badge.querySelector('.live-pulse-dot');
    const text = badge.querySelector('.live-status-text');
    if (isConnected) {
        if (dot) dot.style.background = '#22c55e';
        if (text) text.textContent = 'Live Sync Active';
    } else {
        if (dot) dot.style.background = '#eab308';
        if (text) text.textContent = 'Connecting...';
    }
}

function flashLiveSync(msg) {
    const toast = document.getElementById('cartToast');
    const text = document.getElementById('cartToastText');
    if (toast && text) {
        text.textContent = '✨ ' + msg;
        toast.classList.add('show');
        setTimeout(() => toast.classList.remove('show'), 2200);
    }
}

window.loadStoreIdentity = loadStoreIdentity;
window.applyWebsiteData = applyWebsiteData;

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', () => {
        loadStoreIdentity();
        connectRealtimeStream();
    });
} else {
    loadStoreIdentity();
    connectRealtimeStream();
}

// React to AI Translate language switch
window.addEventListener('languageChanged', () => {
    if (typeof renderBrands === 'function') renderBrands();
    if (typeof renderBrandChips === 'function') renderBrandChips();
    if (typeof renderProducts === 'function') renderProducts();
});
