// Load cart from localStorage
let cart = JSON.parse(localStorage.getItem('cart')) || [];
let appliedPromo = localStorage.getItem('cart_promo') || '';

// Update cart badges and counters
function updateCartBadge() {
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    
    // Update header badge if exists
    const headerBadge = document.getElementById('cartBadge');
    if (headerBadge) {
        if (totalItems > 0) {
            headerBadge.textContent = totalItems;
            headerBadge.style.display = 'flex';
        } else {
            headerBadge.style.display = 'none';
        }
    }
    
    // Update nav badge
    const navBadge = document.getElementById('navCartBadge');
    if (navBadge) {
        if (totalItems > 0) {
            navBadge.textContent = totalItems;
            navBadge.classList.add('show');
        } else {
            navBadge.classList.remove('show');
        }
    }

    // Update cart page title pill
    const countPill = document.getElementById('cartCountPill');
    if (countPill) {
        countPill.textContent = totalItems === 1 ? '1 item' : `${totalItems} items`;
    }

    // Toggle clear cart button
    const clearBtn = document.getElementById('clearCartBtn');
    if (clearBtn) {
        clearBtn.style.display = totalItems > 0 ? 'inline-flex' : 'none';
    }

    // Toggle recommended section
    const recSection = document.getElementById('recommendedSection');
    if (recSection) {
        recSection.style.display = totalItems > 0 ? 'block' : 'none';
    }

    // Toggle shipping perk banner
    const shippingBanner = document.getElementById('shippingPerkBanner');
    if (shippingBanner) {
        shippingBanner.style.display = totalItems > 0 ? 'flex' : 'none';
    }
}

// Calculate discount
function getDiscountAmount(subtotal) {
    if (!appliedPromo) return 0;
    const code = appliedPromo.toUpperCase().trim();
    if (code === 'QKZ10' || code === 'SAVE10' || code === 'WELCOME10') {
        return subtotal * 0.10;
    } else if (code === 'VIP20' || code === 'SAVE20') {
        return subtotal * 0.20;
    } else if (code === 'QKZ50') {
        return Math.min(50, subtotal);
    }
    return 0;
}

// Render cart
function renderCart() {
    const container = document.getElementById('cartContent');
    if (!container) return;
    
    if (cart.length === 0) {
        const t = (k, def) => (window.BongI18n ? window.BongI18n.t(k) : def);
        container.innerHTML = `
            <div class="cart-empty-state">
                <div class="empty-icon-wrap">
                    <svg viewBox="0 0 24 24" width="48" height="48" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">
                        <path d="M6 2L3 6v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2V6l-3-4z"></path>
                        <line x1="3" y1="6" x2="21" y2="6"></line>
                        <path d="M16 10a4 4 0 0 1-8 0"></path>
                    </svg>
                </div>
                <h3>${t('empty_cart_title', 'Your shopping bag is empty')}</h3>
                <p>${t('empty_cart_desc', 'Discover our collection of premium smartphones, audio gear, and sleek accessories.')}</p>
                <a href="index.html" class="btn-start-shopping">
                    <span>${t('start_shopping', 'Start Shopping')}</span>
                    <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.5"><line x1="5" y1="12" x2="19" y2="12"></line><polyline points="12 5 19 12 12 19"></polyline></svg>
                </a>
            </div>
        `;
        updateCartBadge();
        return;
    }
    
    const t = (k, def) => (window.BongI18n ? window.BongI18n.t(k) : def);
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const totalItems = cart.reduce((sum, item) => sum + item.quantity, 0);
    const discount = getDiscountAmount(subtotal);
    const finalTotal = Math.max(0, subtotal - discount);
    
    container.innerHTML = `
        <div class="cart-layout-grid">
            <!-- Items List -->
            <div class="cart-items-container">
                ${cart.map(item => {
                    const itemTotal = item.price * item.quantity;
                    const safeImage = item.image_url || 'https://via.placeholder.com/150?text=Phone';
                    const formatPrice = (p, opts) => window.BongI18n ? window.BongI18n.formatPrice(p, opts) : `$${Number(p).toFixed(2)}`;

                    return `
                    <div class="cart-item-card" data-item-id="${item.id}">
                        <div class="cart-item-image-box">
                            <img src="${safeImage}" alt="${item.name}" onerror="this.src='https://via.placeholder.com/150?text=Phone'">
                        </div>

                        <div class="cart-item-body">
                            <div class="cart-item-top-row">
                                <div class="cart-item-title-col">
                                    ${item.brand ? `<span class="cart-item-brand-label">${item.brand}</span>` : ''}
                                    <h3 class="cart-item-name">${item.name}</h3>
                                </div>
                                <button type="button" class="cart-remove-icon-btn" onclick="removeFromCart('${item.id}')" title="Remove item" aria-label="Remove ${item.name}">
                                    <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                        <polyline points="3 6 5 6 21 6"></polyline>
                                        <path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path>
                                    </svg>
                                </button>
                            </div>

                            <div class="cart-item-specs-row">
                                ${item.size ? `<span class="cart-spec-badge size-badge">💾 ${item.size}</span>` : ''}
                                <span class="cart-spec-badge stock-badge">✓ In Stock</span>
                            </div>

                            <div class="cart-item-bottom-row">
                                <div class="cart-price-block">
                                    <span class="cart-item-total-price">${formatPrice(itemTotal)}</span>
                                    ${item.quantity > 1 ? `<span class="cart-item-unit-price">${formatPrice(item.price)} each</span>` : ''}
                                </div>

                                <div class="cart-quantity-stepper">
                                    <button type="button" class="stepper-btn minus-btn" onclick="updateQuantity('${item.id}', -1)" aria-label="Decrease quantity">−</button>
                                    <span class="stepper-num">${item.quantity}</span>
                                    <button type="button" class="stepper-btn plus-btn" onclick="updateQuantity('${item.id}', 1)" aria-label="Increase quantity">+</button>
                                </div>
                            </div>
                        </div>
                    </div>
                    `;
                }).join('')}
            </div>
            
            <!-- Order Summary Card -->
            <div class="cart-summary-wrapper">
                <div class="cart-summary-card">
                    <div class="summary-card-header">
                        <h3>${t('order_summary', 'Order Summary')}</h3>
                        <span class="summary-item-count">${totalItems} ${totalItems > 1 ? t('items', 'items') : t('item', 'item')}</span>
                    </div>

                    <div class="summary-line-items">
                        <div class="summary-line">
                            <span class="line-title">${t('subtotal', 'Subtotal')}</span>
                            <span class="line-amount">${window.BongI18n ? window.BongI18n.formatPrice(subtotal) : `$${subtotal.toFixed(2)}`}</span>
                        </div>
                        <div class="summary-line">
                            <span class="line-title">
                                ${t('shipping', 'Shipping')}
                                <span class="shipping-info-tag">2-3 Days</span>
                            </span>
                            <span class="line-amount free-highlight">${t('free', 'FREE')}</span>
                        </div>
                        <div class="summary-line">
                            <span class="line-title">Estimated Sales Tax</span>
                            <span class="line-amount">${window.BongI18n ? window.BongI18n.formatPrice(0) : '$0.00'}</span>
                        </div>
                        ${discount > 0 ? `
                        <div class="summary-line discount-active">
                            <span class="line-title">
                                Discount (${appliedPromo.toUpperCase()})
                                <button type="button" class="remove-promo-btn" onclick="removePromoCode()" title="Remove promo">✕</button>
                            </span>
                            <span class="line-amount">-${window.BongI18n ? window.BongI18n.formatPrice(discount) : `$${discount.toFixed(2)}`}</span>
                        </div>
                        ` : ''}
                    </div>

                    <!-- Promo Code Box -->
                    <div class="promo-box">
                        <div class="promo-input-row">
                            <div class="promo-field-wrap">
                                <svg class="promo-tag-icon" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round">
                                    <path d="M20.59 13.41l-7.17 7.17a2 2 0 0 1-2.83 0L2 12V2h10l8.59 8.59a2 2 0 0 1 0 2.82z"></path>
                                    <line x1="7" y1="7" x2="7.01" y2="7"></line>
                                </svg>
                                <input type="text" id="promoInput" placeholder="Promo code (e.g. QKZ10)" value="${appliedPromo ? appliedPromo.toUpperCase() : ''}" maxlength="15">
                            </div>
                            <button type="button" class="promo-apply-btn" onclick="applyPromoCode()">Apply</button>
                        </div>
                        ${discount > 0 ? `<p class="promo-status-msg success">🎉 Promo code applied successfully!</p>` : ''}
                    </div>

                    <div class="summary-divider-line"></div>

                    <!-- Total Amount -->
                    <div class="summary-final-row">
                        <div class="final-label-group">
                            <span class="final-total-text">${t('total', 'Total')}</span>
                            <span class="final-tax-hint">Including all taxes & duties</span>
                        </div>
                        <div class="final-price-wrap">
                            <span class="final-total-price">${window.BongI18n ? window.BongI18n.formatPrice(finalTotal, { showBoth: true }) : `$${finalTotal.toFixed(2)}`}</span>
                        </div>
                    </div>

                    <!-- Checkout Button -->
                    <button type="button" class="cart-checkout-btn" id="checkoutBtn" onclick="checkout()">
                        <span class="btn-lock-icon">
                            <svg viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" stroke-width="2.2" stroke-linecap="round" stroke-linejoin="round">
                                <rect x="3" y="11" width="18" height="11" rx="2" ry="2"></rect>
                                <path d="M7 11V7a5 5 0 0 1 10 0v4"></path>
                            </svg>
                        </span>
                        <span>${t('proceed_to_checkout', 'Proceed to Checkout')}</span>
                        <span class="btn-arrow-icon">
                            <svg viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round">
                                <line x1="5" y1="12" x2="19" y2="12"></line>
                                <polyline points="12 5 19 12 12 19"></polyline>
                            </svg>
                        </span>
                    </button>

                    <!-- Trust and Guarantees -->
                    <div class="checkout-assurance-row">
                        <div class="assurance-pill">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"></path></svg>
                            <span>256-Bit SSL</span>
                        </div>
                        <div class="assurance-pill">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><rect x="1" y="3" width="15" height="13" rx="2"></rect><polygon points="16 8 20 8 23 11 23 16 16 16 16 8"></polygon><circle cx="5.5" cy="18.5" r="2.5"></circle><circle cx="18.5" cy="18.5" r="2.5"></circle></svg>
                            <span>Free Delivery</span>
                        </div>
                        <div class="assurance-pill">
                            <svg viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" stroke-width="2.2"><polyline points="1 4 1 10 7 10"></polyline><path d="M3.51 15a9 9 0 1 0 2.13-9.36L1 10"></path></svg>
                            <span>30-Day Return</span>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `;
    
    updateCartBadge();
}

// Update quantity
function updateQuantity(productId, change) {
    const item = cart.find(i => i.id === productId);
    if (!item) return;
    
    const newQuantity = item.quantity + change;
    
    if (newQuantity <= 0) {
        removeFromCart(productId);
        return;
    }
    
    if (item.maxStock && newQuantity > item.maxStock) {
        showToast(`Only ${item.maxStock} units in stock`);
        return;
    }
    
    item.quantity = newQuantity;
    saveCart();
    renderCart();
}

// Remove from cart
function removeFromCart(productId) {
    const item = cart.find(i => i.id === productId);
    cart = cart.filter(i => i.id !== productId);
    saveCart();
    renderCart();
    if (item) {
        showToast(`Removed ${item.name} from bag`);
    }
}

// Clear cart
function clearCart() {
    if (cart.length === 0) return;
    if (confirm('Are you sure you want to empty your shopping bag?')) {
        cart = [];
        saveCart();
        renderCart();
        showToast('Shopping bag cleared');
    }
}

// Save cart to localStorage
function saveCart() {
    localStorage.setItem('cart', JSON.stringify(cart));
    updateCartBadge();
}

// Apply promo code
function applyPromoCode() {
    const input = document.getElementById('promoInput');
    if (!input) return;
    const code = input.value.trim().toUpperCase();
    
    if (!code) {
        showToast('Please enter a promo code');
        return;
    }
    
    if (code === 'QKZ10' || code === 'SAVE10' || code === 'WELCOME10' || code === 'VIP20' || code === 'SAVE20' || code === 'QKZ50') {
        appliedPromo = code;
        localStorage.setItem('cart_promo', code);
        renderCart();
        showToast(`Promo code "${code}" applied!`);
    } else {
        showToast('Invalid promo code. Try "QKZ10"');
    }
}

// Remove promo code
function removePromoCode() {
    appliedPromo = '';
    localStorage.removeItem('cart_promo');
    renderCart();
    showToast('Promo code removed');
}

// Quick Add recommended accessories
function addRecommendedItem(id, name, brand, price, image_url, size) {
    const existing = cart.find(item => item.id === id);
    if (existing) {
        existing.quantity += 1;
    } else {
        cart.push({
            id,
            name,
            brand,
            price,
            image_url,
            size,
            quantity: 1,
            maxStock: 99
        });
    }
    saveCart();
    renderCart();
    showToast(`Added ${name} to bag`);
}

// Simple toast helper
function showToast(msg) {
    let toast = document.querySelector('.cart-toast');
    if (!toast) {
        toast = document.createElement('div');
        toast.className = 'cart-toast';
        document.body.appendChild(toast);
    }
    toast.textContent = msg;
    toast.classList.add('show');
    clearTimeout(toast._timeout);
    toast._timeout = setTimeout(() => {
        toast.classList.remove('show');
    }, 2400);
}

// Checkout with realistic button animation and real-time backend stock deduction
async function checkout() {
    if (cart.length === 0) {
        showToast('Your shopping bag is empty!');
        return;
    }
    
    const subtotal = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);
    const discount = getDiscountAmount(subtotal);
    const finalTotal = Math.max(0, subtotal - discount);
    
    const btn = document.getElementById('checkoutBtn');
    const originalBtnHtml = btn ? btn.innerHTML : '';
    if (btn) {
        btn.classList.add('processing');
        btn.disabled = true;
        btn.innerHTML = `
            <span class="spinner-inline" style="display:inline-block; width:16px; height:16px; border:2px solid #fff; border-top-color:transparent; border-radius:50%; animation:spin 0.7s linear infinite; margin-right:8px; vertical-align:middle;"></span>
            <span>Verifying Stock & Processing...</span>
        `;
    }

    try {
        const response = await fetch('/api/checkout', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({
                items: cart.map(i => ({
                    id: i.id,
                    quantity: i.quantity,
                    price: i.price,
                    name: i.name
                })),
                promo_code: appliedPromo || ''
            })
        });

        const data = await response.json();

        if (!response.ok) {
            // Insufficient stock or item out of stock
            if (btn) {
                btn.classList.remove('processing');
                btn.disabled = false;
                btn.innerHTML = originalBtnHtml;
            }

            const errorMsg = data.error || 'Checkout could not be completed.';
            showToast('⚠️ ' + errorMsg);
            alert(`⚠️ Stock Alert:\n\n${errorMsg}`);

            // If a specific product had low or zero stock, adjust cart locally
            if (data.productId !== undefined && data.availableStock !== undefined) {
                const target = cart.find(i => String(i.id) === String(data.productId));
                if (target) {
                    if (data.availableStock <= 0) {
                        target.quantity = 0;
                        cart = cart.filter(i => String(i.id) !== String(data.productId));
                    } else {
                        target.quantity = data.availableStock;
                        target.maxStock = data.availableStock;
                    }
                    saveCart();
                    renderCart();
                }
            }
            return;
        }

        // Order succeeded! Real-time stock deducted in database
        if (btn) {
            btn.classList.remove('processing');
            btn.classList.add('success');
            btn.innerHTML = `<span>✓ Order Confirmed!</span>`;
        }

        setTimeout(() => {
            const displayTotal = window.BongI18n ? window.BongI18n.formatPrice(finalTotal, { showBoth: true }) : `$${finalTotal.toFixed(2)}`;
            const orderNum = data.orderId || ('ORD-' + Date.now().toString(36).toUpperCase());
            
            // Format list of purchased items
            const purchasedSummary = (data.purchasedItems || []).map(p => 
                `• ${p.name} (Qty: ${p.deducted}) → Remaining Stock: ${p.stock}`
            ).join('\n');

            alert(`🎉 Order Placed Successfully!\n\nOrder #: ${orderNum}\nTotal Paid: ${displayTotal}\nEstimated Delivery: 2–3 Business Days\n\nStock Updated in Real-Time:\n${purchasedSummary || 'All items reserved'}\n\nThank you for choosing DyMaly Phone Store!`);

            cart = [];
            appliedPromo = '';
            localStorage.removeItem('cart');
            localStorage.removeItem('cart_promo');
            saveCart();
            renderCart();
        }, 500);

    } catch (err) {
        console.error('Checkout network error:', err);
        if (btn) {
            btn.classList.remove('processing');
            btn.disabled = false;
            btn.innerHTML = originalBtnHtml;
        }
        showToast('Network error processing checkout. Please retry.');
    }
}

// Initialize
renderCart();
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

// Listen for AI Language changes to re-render cart elements
window.addEventListener('languageChanged', () => {
    if (typeof renderCart === 'function') {
        renderCart();
    }
});

// Load and apply store settings dynamically across cart page
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
    document.addEventListener('DOMContentLoaded', () => {
        loadStoreIdentity();
        connectCartRealtimeStream();
    });
} else {
    loadStoreIdentity();
    connectCartRealtimeStream();
}

// ==================== REAL-TIME LIVE STREAM FOR CART ====================
let cartSseSource = null;

function connectCartRealtimeStream() {
    if (window.EventSource) {
        try {
            if (cartSseSource) cartSseSource.close();
            cartSseSource = new EventSource('/api/realtime/stream');
            
            cartSseSource.onmessage = function(event) {
                try {
                    const msg = JSON.parse(event.data);
                    if (msg.type === 'stock_updated' || msg.type === 'products_updated') {
                        syncCartWithLiveStock();
                    }
                } catch (e) {}
            };

            cartSseSource.onerror = function() {
                if (cartSseSource) cartSseSource.close();
                setTimeout(connectCartRealtimeStream, 6000);
            };
        } catch (e) {}
    }
}

async function syncCartWithLiveStock() {
    if (cart.length === 0) return;
    try {
        const res = await fetch('/api/products?_t=' + Date.now());
        if (!res.ok) return;
        const freshProducts = await res.json();
        let changed = false;

        cart.forEach(item => {
            const fresh = freshProducts.find(p => String(p.id) === String(item.id));
            if (fresh) {
                const freshStock = Number(fresh.stock);
                if (item.maxStock !== freshStock) {
                    item.maxStock = freshStock;
                    changed = true;
                }
                if (freshStock <= 0 && item.quantity > 0) {
                    showToast(`⚠️ "${item.name}" just went out of stock!`);
                    changed = true;
                } else if (item.quantity > freshStock) {
                    item.quantity = Math.max(1, freshStock);
                    changed = true;
                    showToast(`⚠️ Stock updated: Only ${freshStock} left for ${item.name}`);
                }
            }
        });

        if (changed) {
            saveCart();
            renderCart();
        }
    } catch (e) {}
}


