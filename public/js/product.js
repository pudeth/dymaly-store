// Get product ID from URL
const urlParams = new URLSearchParams(window.location.search);
const productId = urlParams.get('id');
let cart = JSON.parse(localStorage.getItem('cart')) || [];

if (!productId) {
    window.location.href = 'index.html';
}

// Update cart badge
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
}

// Luxury phone placeholder illustration SVG
function getPlaceholderImage(name = 'Phone', brand = '') {
    const cleanBrand = (brand || 'QKZ').toUpperCase();
    const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="300" height="300" viewBox="0 0 300 300">
        <defs>
            <linearGradient id="prodBgGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#fcfbfa"/>
                <stop offset="100%" stop-color="#ede7de"/>
            </linearGradient>
            <linearGradient id="prodPhoneGrad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" stop-color="#40362f"/>
                <stop offset="100%" stop-color="#241e1a"/>
            </linearGradient>
        </defs>
        <rect width="300" height="300" fill="url(#prodBgGrad)" rx="20"/>
        <g transform="translate(85, 35)">
            <rect x="0" y="0" width="130" height="210" rx="22" fill="url(#prodPhoneGrad)" stroke="#d5c8b8" stroke-width="2"/>
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

// Load product details
async function loadProduct() {
    try {
        const response = await fetch(`/api/products/${productId}`);
        
        if (!response.ok) {
            throw new Error('Product not found');
        }
        
        const product = await response.json();
        renderProduct(product);
    } catch (error) {
        console.error('Error loading product:', error);
        document.getElementById('productContent').innerHTML = 
            '<div class="empty-state"><h3>Product not found</h3><p><a href="index.html">Return to store</a></p></div>';
    }
}

// Render product details
function renderProduct(product) {
    let stockClass = '';
    let stockText = `In Stock: ${product.stock} units`;
    let addToCartBtn = '';
    
    if (product.stock === 0) {
        stockClass = 'out';
        stockText = 'Out of Stock';
    } else if (product.stock < 10) {
        stockClass = 'low';
        stockText = `Only ${product.stock} left in stock!`;
        addToCartBtn = `<button class="btn btn-dark" onclick="addToCart()">🛍️ Add to Cart</button>`;
    } else {
        addToCartBtn = `<button class="btn btn-dark" onclick="addToCart()">🛍️ Add to Cart</button>`;
    }
    
    // Display size badge if available
    const sizeBadge = product.size ? `<span class="product-size-badge">${product.size}</span>` : '';
    
    const html = `
        <div class="product-detail-grid">
            <div class="product-image">
                <img src="${product.image_url}" alt="${product.name}" onerror="this.onerror=null; this.src=getPlaceholderImage('${product.name.replace(/'/g, "\\'")}', '${(product.brand || '').replace(/'/g, "\\'")}');">
            </div>
            <div class="product-details">
                <div class="product-brand">${product.brand} ${sizeBadge}</div>
                <h1>${product.name}</h1>
                <div class="product-price">$${product.price.toFixed(2)}</div>
                <div class="product-stock ${stockClass}">${stockText}</div>
                <p class="product-description">${product.description || 'No description available.'}</p>
                ${addToCartBtn}
            </div>
        </div>
    `;
    
    document.getElementById('productContent').innerHTML = html;
    window.currentProduct = product;
}

// Add to cart
function addToCart() {
    const product = window.currentProduct;
    if (!product || product.stock === 0) return;
    
    const existingItem = cart.find(item => item.id === product.id);
    
    if (existingItem) {
        if (existingItem.quantity < product.stock) {
            existingItem.quantity++;
        } else {
            alert('Maximum stock reached!');
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
    
    // Show success message
    const btn = event.target;
    const originalText = btn.innerHTML;
    btn.innerHTML = '✓ Added to Cart!';
    btn.style.background = 'var(--success)';
    
    setTimeout(() => {
        btn.innerHTML = originalText;
        btn.style.background = '';
    }, 2000);
}

// Load reviews
async function loadReviews() {
    try {
        const response = await fetch(`/api/products/${productId}/reviews`);
        const reviews = await response.json();
        renderReviews(reviews);
    } catch (error) {
        console.error('Error loading reviews:', error);
        document.getElementById('reviewsList').innerHTML = 
            '<div class="no-reviews">Failed to load reviews</div>';
    }
}

// Render reviews
function renderReviews(reviews) {
    const container = document.getElementById('reviewsList');
    
    if (reviews.length === 0) {
        container.innerHTML = '<div class="no-reviews">No reviews yet. Be the first to review this product!</div>';
        return;
    }
    
    container.innerHTML = reviews.map(review => `
        <div class="review-card">
            <div class="review-header">
                <div class="review-customer">${review.customer_name}</div>
                <div class="review-rating">${'⭐'.repeat(review.rating)}</div>
            </div>
            <div class="review-date">${formatDate(review.created_at)}</div>
            <div class="review-comment">${review.comment || 'No comment provided.'}</div>
        </div>
    `).join('');
}

// Format date
function formatDate(dateString) {
    const date = new Date(dateString);
    const options = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
}

// Handle review form submission
document.getElementById('reviewForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const customerName = document.getElementById('customerName').value.trim();
    const rating = document.querySelector('input[name="rating"]:checked');
    const comment = document.getElementById('comment').value.trim();
    
    if (!customerName || !rating) {
        alert('Please fill in all required fields');
        return;
    }
    
    const reviewData = {
        customer_name: customerName,
        rating: parseInt(rating.value),
        comment: comment
    };
    
    try {
        const response = await fetch(`/api/products/${productId}/reviews`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(reviewData)
        });
        
        if (response.ok) {
            // Show success message
            const successMsg = document.createElement('div');
            successMsg.className = 'success-message';
            successMsg.textContent = 'Thank you! Your review has been submitted successfully.';
            
            const form = document.getElementById('reviewForm');
            form.parentNode.insertBefore(successMsg, form);
            
            // Reset form
            form.reset();
            
            // Remove star selections
            document.querySelectorAll('input[name="rating"]').forEach(input => {
                input.checked = false;
            });
            
            // Reload reviews
            await loadReviews();
            
            // Remove success message after 5 seconds
            setTimeout(() => {
                successMsg.remove();
            }, 5000);
            
            // Scroll to reviews
            document.getElementById('reviewsList').scrollIntoView({ behavior: 'smooth' });
        } else {
            const error = await response.json();
            alert(error.error || 'Failed to submit review. Please try again.');
        }
    } catch (error) {
        console.error('Error submitting review:', error);
        alert('Failed to submit review. Please check your connection and try again.');
    }
});

// Initialize
loadProduct();
loadReviews();
updateCartBadge();

// Scroll behavior - hide/show header completely
let lastScrollTop = 0;
let scrollTimeout;

window.addEventListener('scroll', function() {
    const header = document.querySelector('header.site-header');
    const mobileNav = document.querySelector('.mobile-nav');
    const currentScroll = window.pageYOffset || document.documentElement.scrollTop;
    
    // Clear previous timeout
    clearTimeout(scrollTimeout);
    
    // Delay to make it smoother
    scrollTimeout = setTimeout(() => {
        if (currentScroll > lastScrollTop && currentScroll > 100) {
            // Scrolling down - hide header completely
            header.classList.add('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-hidden');
            }
        } else if (currentScroll < lastScrollTop) {
            // Scrolling up - show header
            header.classList.remove('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-hidden');
            }
        }
        
        // At top of page, always show everything
        if (currentScroll <= 50) {
            header.classList.remove('header-hidden');
            if (mobileNav) {
                mobileNav.classList.remove('nav-hidden');
            }
        }
        
        lastScrollTop = currentScroll <= 0 ? 0 : currentScroll;
    }, 50);
}, false);


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

// Load and apply store settings dynamically across product page
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
