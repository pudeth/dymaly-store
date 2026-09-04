// Load saved items and cart from localStorage
let savedItems = JSON.parse(localStorage.getItem('savedItems')) || [];
let cart = JSON.parse(localStorage.getItem('cart')) || [];

// Luxury phone placeholder illustration SVG
function getPlaceholderImage(name = 'Phone', brand = '') {
    const cleanBrand = (brand || 'QKZ').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
            <linearGradient id="savedBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fcfbfa"/>
                <stop offset="100%" stop-color="#ede7de"/>
            </linearGradient>
            <linearGradient id="savedPhoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#40362f"/>
                <stop offset="100%" stop-color="#241e1a"/>
            </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#savedBgGrad)" rx="20"/>
        <g transform="translate(85, 35)">
            <rect x="0" y="0" width="130" height="210" rx="22" fill="url(#savedPhoneGrad)" stroke="#d5c8b8" stroke-width="2"/>
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
            <text x="65" y="165" font-family="-apple-system, sans-serif" font-size="12" font-weight="700" fill="#a89c8d" text-anchor="middle" letter-spacing="1">${cleanBrand}</text>
        </g>
    </svg>`;
    return 'data:image/svg+xml;base64,' + btoa(svg);
}

// Update cart and wishlist badges
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const badge = document.getElementById('cartBadge');
    if (badge) {
        if (totalItems > 0) {
            badge.textContent = totalItems;
            badge.style.display = 'flex';
        } else {
            badge.style.display = 'none';
        }
    }

    const navBadge = document.getElementById('navCartBadge');
    if (navBadge) {
        if (totalItems > 0) {
            navBadge.textContent = totalItems;
            navBadge.classList.add('show');
        } else {
            navBadge.classList.remove('show');
        }
    }

    const countPill = document.getElementById('savedCountPill');
    if (countPill) {
        countPill.textContent = savedItems.length === 1 ? '1 item' : `${savedItems.length} items`;
    }

    const actionsGroup = document.getElementById('savedActionsGroup');
    if (actionsGroup) {
        actionsGroup.style.display = savedItems.length > 0 ? 'flex' : 'none';
    }
}

// Toast helper
function showToast(msg) {
    let toast = document.querySelector('.saved-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'saved-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// Load and render saved items
async function renderSavedItems() {
    const container = document.getElementById('savedContent');
    if (!container) return;
    
    if (savedItems.length === 0) {
        container.innerHTML = `
            <div class="saved-empty-state">
                <div class="empty-heart-wrap">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path>
                    </svg>
                </div>
                <h3>Your Wishlist is Empty</h3>
                <p>Browse our catalog of premium smartphones and save your favorite devices to keep track of specs and prices.</p>
                <a href="index.html" class="btn-browse-products">
                    <span>Explore Phones</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        `;
        updateCartBadge();
        return;
    }
    
    try {
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        
        const savedProducts = allProducts.filter(p => savedItems.includes(p.id));
        
        if (savedProducts.length === 0) {
            container.innerHTML = `
                <div class="saved-empty-state">
                    <div class="empty-heart-wrap">
                        <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"></path></svg>
                    </div>
                    <h3>No Saved Items Found</h3>
                    <p>Some saved products may have been updated or removed.</p>
                    <a href="index.html" class="btn-browse-products">Explore Phones</a>
                </div>
            `;
            updateCartBadge();
            return;
        }
        
        container.innerHTML = `
            <div class="saved-products-grid">
                ${savedProducts.map(product => {
                    let stockClass = 'in-stock';
                    let stockText = `✓ In Stock (${product.stock})`;
                    
                    if (product.stock === 0) {
                        stockClass = 'out-of-stock';
                        stockText = 'Out of Stock';
                    } else if (product.stock < 10) {
                        stockClass = 'low-stock';
                        stockText = `Only ${product.stock} left!`;
                    }
                    
                    const safeName = (product.name || '').replace(/'/g, "\\'");
                    const safeBrand = (product.brand || '').replace(/'/g, "\\'");
                    const safeImage = product.image_url || getPlaceholderImage(product.name, product.brand);
                    
                    return `
                        <div class="saved-card" data-product-id="${product.id}">
                            <button type="button" class="saved-remove-btn active" onclick="toggleSaved(event, ${product.id})" title="Remove from wishlist" aria-label="Remove ${product.name}">
                                <svg viewBox="0 0 24 24" width="18" height="18" fill="#ef4444">
                                    <path d="M12 21.35l-1.45-1.32C5.4 15.36 2 12.28 2 8.5 2 5.42 4.42 3 7.5 3c1.74 0 3.41.81 4.5 2.09C13.09 3.81 14.76 3 16.5 3 19.58 3 22 5.42 22 8.5c0 3.78-3.4 6.86-8.55 11.54L12 21.35z"/>
                                </svg>
                            </button>

                            <div class="saved-card-image" onclick="viewProduct(${product.id})">
                                <img src="${safeImage}" alt="${product.name}" loading="lazy" onerror="this.onerror=null; this.src=getPlaceholderImage('${safeName}', '${safeBrand}');">
                            </div>

                            <div class="saved-card-body" onclick="viewProduct(${product.id})">
                                <div class="saved-meta-row">
                                    <span class="saved-brand-label">${product.brand}</span>
                                    ${product.size ? `<span class="saved-spec-pill">💾 ${product.size}</span>` : ''}
                                </div>
                                <h3 class="saved-card-title">${product.name}</h3>
                                <div class="saved-stock-pill ${stockClass}">${stockText}</div>
                            </div>

                            <div class="saved-card-footer">
                                <div class="saved-price-wrap">
                                    <span class="saved-card-price">$${product.price.toFixed(2)}</span>
                                </div>
                                ${product.stock > 0 ? `
                                <button type="button" class="saved-add-btn" onclick="addToCart(event, ${product.id})" aria-label="Add ${product.name} to cart">
                                    <svg viewBox="0 0 24 24" width="15" height="15" fill="none" stroke="currentColor" stroke-width="2.2">
                                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                                        <line x1="3" y1="6" x2="21" y2="6"></line>
                                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                                    </svg>
                                    <span>Add</span>
                                </button>
                                ` : `
                                <span class="saved-out-notice">Unavailable</span>
                                `}
                            </div>
                        </div>
                    `;
                }).join('')}
            </div>
        `;
    } catch (error) {
        console.error('Error loading saved items:', error);
        container.innerHTML = `
            <div class="saved-empty-state">
                <h3>Error loading saved items</h3>
                <p>Please try again later.</p>
            </div>
        `;
    }
    
    updateCartBadge();
}

// Toggle saved status
function toggleSaved(event, productId) {
    if (event) event.stopPropagation();
    
    const index = savedItems.indexOf(productId);
    if (index > -1) {
        savedItems.splice(index, 1);
        showToast('Removed from wishlist');
    } else {
        savedItems.push(productId);
        showToast('Added to wishlist');
    }
    
    localStorage.setItem('savedItems', JSON.stringify(savedItems));
    renderSavedItems();
}

// Add single item to cart
async function addToCart(event, productId) {
    if (event) event.stopPropagation();
    
    try {
        const response = await fetch(`/api/products/${productId}`);
        const product = await response.json();
        
        if (!product || product.stock === 0) return;
        
        const existingItem = cart.find(item => item.id === productId);
        
        if (existingItem) {
            if (existingItem.quantity < product.stock) {
                existingItem.quantity++;
            } else {
                showToast(`Max stock (${product.stock}) already in bag`);
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
        showToast(`Added ${product.name} to bag`);
        
        // Button visual feedback if clicked
        if (event && event.currentTarget) {
            const btn = event.currentTarget;
            const originalContent = btn.innerHTML;
            btn.innerHTML = '<span>✓ Added</span>';
            btn.style.background = '#10b981';
            btn.style.color = '#ffffff';
            setTimeout(() => {
                btn.innerHTML = originalContent;
                btn.style.background = '';
                btn.style.color = '';
            }, 1200);
        }
    } catch (error) {
        console.error('Error adding to cart:', error);
    }
}

// Move all saved items to cart
async function moveAllToCart() {
    if (savedItems.length === 0) return;
    
    try {
        const response = await fetch('/api/products');
        const allProducts = await response.json();
        const savedProducts = allProducts.filter(p => savedItems.includes(p.id) && p.stock > 0);
        
        if (savedProducts.length === 0) {
            showToast('Saved items are currently out of stock');
            return;
        }
        
        savedProducts.forEach(product => {
            const existing = cart.find(i => i.id === product.id);
            if (existing) {
                if (existing.quantity < product.stock) existing.quantity++;
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
        });
        
        localStorage.setItem('cart', JSON.stringify(cart));
        updateCartBadge();
        showToast(`Added ${savedProducts.length} items to your bag!`);
    } catch (e) {
        console.error('Error moving all to cart:', e);
    }
}

// View product
function viewProduct(id) {
    window.location.href = `product.html?id=${id}`;
}

// Initialize
renderSavedItems();
updateCartBadge();

// Smooth scroll behavior
let lastScrollTop = 0;
let scrollTimeout;

window.addEventListener('scroll', function() {
    const header = document.querySelector('header.site-header');
    const mobileNav = document.querySelector('.mobile-nav');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    clearTimeout(scrollTimeout);
    scrollTimeout = setTimeout(() => {
        if (currentScroll > lastScrollTop && currentScroll > 120) {
            if (header) header.classList.add('header-hidden');
            if (mobileNav) mobileNav.classList.remove('nav-hidden');
        } else if (currentScroll < lastScrollTop) {
            if (header) header.classList.remove('header-hidden');
            if (mobileNav) mobileNav.classList.remove('nav-hidden');
        }
        
        if (currentScroll <= 50) {
            if (header) header.classList.remove('header-hidden');
            if (mobileNav) mobileNav.classList.remove('nav-hidden');
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, 50);
}, false);

// Scroll to top button
const scrollToTopBtn = document.getElementById('scrollToTopBtn');
if (scrollToTopBtn) {
    window.addEventListener('scroll', () => {
        if (window.pageYOffset > 300) {
            scrollToTopBtn.classList.add('show');
        } else {
            scrollToTopBtn.classList.remove('show');
        }
    });

    scrollToTopBtn.addEventListener('click', () => {
        scrollToTopBtn.classList.add('clicked');
        setTimeout(() => scrollToTopBtn.classList.remove('clicked'), 600);
        window.scrollTo({
            top: 0,
            behavior: 'smooth'
        });
    });
}

// Load and apply store settings dynamically across saved items page
async function loadStoreIdentity() {
    try {
        const response = await fetch('/api/settings?_t=' + Date.now(), { cache: 'no-cache' });
        if (response.ok) {
            const settings = await response.json();
            if (settings.store_name) {
                document.querySelectorAll('.brand-text h1, .brand h1, .footer-brand h2, #storeBrandTitle').forEach(el => {
                    el.textContent = settings.store_name;
                });
                if (document.title.includes('QKZ Store') || document.title.includes('Bong Store')) {
                    document.title = document.title.replace(/QKZ Store|Bong Store/g, settings.store_name);
                }
            }
            if (settings.store_tagline) {
                document.querySelectorAll('.brand-text p, .brand p, #storeBrandTagline').forEach(el => {
                    el.textContent = settings.store_tagline;
                });
            }
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
            if (logoUrl) {
                let favicon = document.querySelector("link[rel*='icon']");
                if (!favicon) {
                    favicon = document.createElement('link');
                    favicon.rel = 'icon';
                    document.head.appendChild(favicon);
                }
                favicon.href = logoUrl;
            }
        }
    } catch (e) {}
}

if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', loadStoreIdentity);
} else {
    loadStoreIdentity();
}
