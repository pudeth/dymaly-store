/**
 * Bong Store System - AI Translate Engine (Khmer, English, Chinese)
 * Persistent language switcher with real-time UI translation.
 */

(function() {
    window.BongI18n = {
        currentLang: localStorage.getItem('bong_store_language') || 'en',
        currentCurrency: localStorage.getItem('bong_store_currency') || 'USD',
        usdToKhrRate: 4100, // 1 USD = 4,100 KHR

        currencies: [
            { code: 'USD', symbol: '$', name: 'US Dollar', flag: '🇺🇸', label: 'USD ($)' },
            { code: 'KHR', symbol: '៛', name: 'Khmer Riel', flag: '🇰🇭', label: 'KHR (៛)' }
        ],

        languages: [
            { code: 'en', name: 'English', nativeName: 'English', sub: 'Default · United States', flag: '🇺🇸', short: 'EN' },
            { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', sub: 'Khmer · Cambodia', flag: '🇰🇭', short: 'ខ្មែរ' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', sub: 'Chinese · 简体中文', flag: '🇨🇳', short: '中文' }
        ],

        formatPrice: function(amountInUsd, opts = {}) {
            const num = Number(amountInUsd) || 0;
            if (this.currentCurrency === 'KHR') {
                const riel = Math.round(num * this.usdToKhrRate);
                const formatted = riel.toLocaleString('en-US');
                if (opts.showBoth) {
                    return `<span class="price-val">${formatted}</span>&nbsp;<span class="curr-symbol">៛</span> <span class="price-sub-usd">($${num.toFixed(2)})</span>`;
                }
                return `<span class="price-val">${formatted}</span>&nbsp;<span class="curr-symbol">៛</span>`;
            } else {
                const formatted = num.toFixed(2);
                if (opts.showBoth) {
                    const riel = Math.round(num * this.usdToKhrRate).toLocaleString('en-US');
                    return `<span class="curr-symbol">$</span><span class="price-val">${formatted}</span> <span class="price-sub-khr">(${riel}&nbsp;៛)</span>`;
                }
                return `<span class="curr-symbol">$</span><span class="price-val">${formatted}</span>`;
            }
        },

        setCurrency: function(curr) {
            if (curr !== 'USD' && curr !== 'KHR') return;
            this.currentCurrency = curr;
            localStorage.setItem('bong_store_currency', curr);
            this.updateSwitcherUI();
            window.dispatchEvent(new CustomEvent('currencyChanged', { detail: { currency: curr } }));
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: this.currentLang } }));
        },

        dict: {
            en: {
                ai_translate: 'AI Translate',
                brand_tagline: 'Phones and audio, delivered fast',
                nav_home: 'Home',
                nav_cart: 'Cart',
                nav_saved: 'Saved',
                nav_admin: 'Admin',
                nav_shop: 'Shop',
                continue_shopping: 'Continue Shopping',
                search_placeholder: 'Search phones, brands, accessories...',
                shop_by_brand: 'Shop by Brand',
                tap_brand_subtitle: 'Tap any brand to view authentic smartphones',
                all_brands: 'All Brands',
                all_products: 'All Products',
                showing_products_for: 'Showing products for',
                clear_filter: 'Clear Filter',
                show_all_brands: 'Show All Brands ✕',
                sort_newest: '🔥 Newest First',
                sort_price_low: '💰 Price: Low to High',
                sort_price_high: '💎 Price: High to Low',
                sort_stock_high: '📦 Stock: High to Low',
                sort_stock_low: '⚡ Stock: Low to High',
                stock_filter_all: '📦 All Stock',
                stock_filter_instock: '✓ In Stock',
                stock_filter_low: '⚡ Low Stock (≤ 5)',
                stock_filter_out: '🚫 Out of Stock',
                add_to_cart: 'Add to cart',
                added_to_cart: 'Added to cart',
                sold_out: 'Sold out',
                in_stock: 'In Stock',
                out_of_stock: 'Out of Stock',
                low_stock: 'Low Stock',
                only: 'Only',
                left: 'left',
                phone_unit: 'phones',
                phone_unit_single: 'phone',
                loading_brands: 'Loading top brands...',
                loading_products: 'Loading products...',
                no_products_found: 'No products found matching your search.',
                shopping_bag: 'Shopping Bag',
                wishlist_title: '❤️ Wishlist & Saved',
                empty_cart_title: 'Your bag is empty',
                empty_cart_desc: 'Discover our collection of premium smartphones, audio gear, and sleek accessories.',
                start_shopping: 'Start Shopping',
                order_summary: 'Order Summary',
                subtotal: 'Subtotal',
                shipping: 'Shipping',
                free: 'FREE',
                total: 'Total',
                proceed_to_checkout: 'Proceed to Checkout',
                clear_all: 'Clear All',
                items: 'items',
                item: 'item',
                admin_login: 'Admin Login',
                admin_subtitle: 'Manage phones, stock, categories and customer reviews',
                username: 'Username',
                password: 'Password',
                enter_username: 'Enter username',
                enter_password: 'Enter password',
                sign_in: 'Sign in to Dashboard',
                visit_store: 'Visit the Customer Store',
                dashboard: 'Dashboard',
                logout: 'Logout',
                store: 'Store',
                admin_portal: 'Admin Portal',
                banner_title_1: 'iPhone 15 Pro Titanium',
                banner_desc_1: 'Aerospace-grade titanium design with A17 Pro chip and next-gen camera.',
                banner_btn_1: 'Shop Apple iPhones →',
                banner_title_2: 'Galaxy S24 Ultra AI',
                banner_desc_2: 'Galaxy AI is here. 200MP camera, built-in S-Pen and titanium frame.',
                banner_btn_2: 'Shop Samsung Galaxy →',
                banner_title_3: 'Pixel 8 Pro Smartphone',
                banner_desc_3: 'Google Tensor G3, best-in-class computational photography and pure Android.',
                banner_btn_3: 'Shop Google Pixel →',
                quick_specs: 'Quick Specs',
                reviews: 'Reviews',
                close: 'Close',
                save_changes: 'Save Changes',
                store_logo: 'Store Logo',
                admin_avatar: 'Admin Profile Picture',
                upload_new_image: 'Upload New Image',
                remove_custom_image: 'Remove Custom Image',
                saved_subtitle: 'Your favorite devices reserved in one place for quick access and checkout.',
                empty_wishlist_title: 'Your Wishlist is Empty',
                empty_wishlist_desc: 'Browse our catalog of premium smartphones and save your favorite devices to keep track of specs and prices.',
                explore_phones: 'Explore Phones',
                add_all_to_bag: 'Add All to Bag',
                remove_from_wishlist: 'Remove from wishlist',
                save_for_later: 'Save for later',
                removed_from_saved: 'Removed from saved',
                saved_for_later_toast: 'Saved for later',
                all_added_to_cart: 'All saved items added to bag',
                add_short: 'Add',
                unavailable: 'Unavailable',
                no_saved_items_found: 'No Saved Items Found',
                no_saved_items_desc: 'Some saved products may have been updated or removed.',
                loading_saved_items: 'Loading saved items...',
                shipping_unlocked: 'Free Express Shipping Unlocked!',
                shipping_unlocked_sub: 'Guaranteed delivery in 2–3 business days',
                freq_added: 'Frequently Added Together',
                freq_added_sub: 'Essential accessories for your new device',

                // Navigation & Tabs
                nav_overview: 'Overview',
                nav_catalog: 'Catalog',
                nav_reviews: 'Reviews',
                nav_settings: 'Settings',

                // Admin Stats & Metrics
                stat_total_products: 'Total Products',
                stat_total_units_desc: 'total units',
                stat_stock_value: 'Stock Value',
                stat_total_inventory: 'Total inventory',
                stat_avg_rating: 'Average Rating',
                stat_reviews_count: 'reviews',
                stat_need_restock: 'Need Restock',
                stat_low_stock_items: 'Low stock items',

                // Stock Distribution
                stock_distribution: 'Stock Distribution',
                stock_critical: 'Critical',
                stock_normal: 'Normal',
                stock_high: 'High Stock',

                // Products Needing Attention
                products_needing_attention: 'Products Needing Attention',
                all_stocked_healthy: 'All products are well stocked!',

                // Catalog Management
                catalog_management: 'Catalog Management',
                catalog_subtitle: 'Products, brands, and categories in one unified hub',
                add_product: 'Add Product',
                add_brand: 'Add Brand',
                add_category: 'Add Category',
                tab_products: 'Products',
                tab_brands: 'Brands',
                tab_categories: 'Categories',
                search_products_placeholder: 'Search products by name, brand, or price...',
                filter_brand_label: 'Brand:',
                filter_category_label: 'Category:',
                all_categories: 'All Categories',
                search_brands_placeholder: 'Search brands...',
                search_categories_placeholder: 'Search categories...',
                no_products_found_admin: 'No products found. Add your first product!',
                no_brands_found: 'No brands found. Add your first brand!',
                no_categories_found: 'No categories found. Add your first category!',

                // Modals & Form Fields
                add_new_product: 'Add New Product',
                edit_product: 'Edit Product',
                product_name_label: 'Product Name *',
                brand_label: 'Brand *',
                category_label: 'Category *',
                price_label: 'Price ($) *',
                stock_qty_label: 'Stock Quantity *',
                storage_specs_label: 'Storage Size / Specs',
                description_label: 'Description',
                product_image_label: 'Product Image',
                cancel: 'Cancel',
                save_product: 'Save Product',
                add_new_brand: 'Add New Brand',
                edit_brand: 'Edit Brand',
                brand_name_label: 'Brand Name *',
                save_brand: 'Save Brand',
                add_new_category: 'Add New Category',
                edit_category: 'Edit Category',
                category_name_label: 'Category Name *',
                save_category: 'Save Category',
                choose_logo: 'Choose Logo',
                choose_file: 'Choose Image',

                // Reviews
                customer_reviews_title: 'Customer Reviews',
                customer_reviews_subtitle: 'Manage customer feedback',
                no_reviews_yet: 'No reviews found',
                delete_review: 'Delete',

                // Settings
                store_admin_settings: 'Store & Admin Settings',
                settings_subtitle: 'Configure your store identity and administrator account',
                store_identity: 'Store Identity',
                store_identity_desc: 'Edit store name, tagline, and customer contact info',
                live_preview: 'LIVE PREVIEW',
                store_logo_label: 'Store Logo / Brand Icon',
                upload_store_logo: 'Upload Store Logo',
                remove: 'Remove',
                store_name_label: 'Store Name *',
                header_badge_label: 'Header Badge',
                store_tagline_label: 'Store Tagline / Slogan',
                section_identity: '🏪 1. Store Identity & Branding',
                section_announcement: '📢 2. Top Announcement Bar',
                section_hero: '✨ 3. Hero Promo Banner (Homepage)',
                section_contact: '📞 4. Customer Support & Store Location',
                section_social: '🌐 5. Social Media Channels',
                contact_phone: 'Contact Phone',
                contact_email: 'Contact Email',
                physical_address: 'Physical Address / City',
                operating_hours: 'Operating Hours',
                save_store_settings: 'Save Store Settings',
                admin_account: 'Administrator Account',
                admin_account_desc: 'Update admin display name, contact, and login password',
                display_name: 'Display Name',
                email_label: 'Email',
                phone_label: 'Phone Number',
                current_password: 'Current Password *',
                new_password: 'New Password (Optional)',
                update_profile: 'Update Profile',

                // Cart & Checkout
                customer_info: 'Customer Information',
                full_name: 'Full Name',
                delivery_address: 'Delivery Address',
                payment_method: 'Payment Method',
                cash_on_delivery: 'Cash on Delivery',
                aba_khqr: 'ABA KHQR (Scan to Pay)',
                place_order: 'Confirm & Place Order',
                order_success_title: 'Order Placed Successfully!',
                order_success_desc: 'Thank you for shopping with DyMaly. We will contact you shortly to confirm delivery.',
                frequently_added: 'Frequently Added Together',
                frequently_added_desc: 'Essential accessories for your new device',
                express_shipping_title: 'Free Express Shipping Unlocked!',
                express_shipping_desc: 'Guaranteed delivery in 2–3 business days'
            },
            km: {
                ai_translate: 'បកប្រែ AI',
                brand_tagline: 'ទូរស័ព្ទ និងឧបករណ៍សំឡេង ដឹកជញ្ជូនរហ័ស',
                nav_home: 'ទំព័រដើម',
                nav_cart: 'កន្ត្រក',
                nav_saved: 'ចំណូលចិត្ត',
                nav_admin: 'អ្នកគ្រប់គ្រង',
                nav_shop: 'ទិញទំនិញ',
                continue_shopping: 'បន្តការទិញទំនិញ',
                search_placeholder: 'ស្វែងរកទូរស័ព្ទ, ម៉ាកយីហោ, គ្រឿងបន្លាស់...',
                shop_by_brand: 'ទិញតាមម៉ាកយីហោ',
                tap_brand_subtitle: 'ចុចលើម៉ាកណាមួយ ដើម្បីមើលស្មាតហ្វូនសុទ្ធ ១០០%',
                all_brands: 'គ្រប់ម៉ាកទាំងអស់',
                all_products: 'ផលិតផលទាំងអស់',
                showing_products_for: 'កំពុងបង្ហាញផលិតផលសម្រាប់',
                clear_filter: 'សម្អាតតម្រង',
                show_all_brands: 'បង្ហាញគ្រប់ម៉ាក ✕',
                sort_newest: '🔥 ថ្មីបំផុត',
                sort_price_low: '💰 តម្លៃ៖ ទាបទៅខ្ពស់',
                sort_price_high: '💎 តម្លៃ៖ ខ្ពស់ទៅទាប',
                sort_stock_high: '📦 ស្តុក៖ ច្រើនទៅតិច',
                sort_stock_low: '⚡ ស្តុក៖ តិចទៅច្រើន',
                stock_filter_all: '📦 គ្រប់ស្តុកទាំងអស់',
                stock_filter_instock: '✓ មានក្នុងស្តុក',
                stock_filter_low: '⚡ ស្តុកតិច (≤ ៥)',
                stock_filter_out: '🚫 អស់ពីស្តុក',
                add_to_cart: 'ដាក់ក្នុងកន្ត្រក',
                added_to_cart: 'បានបញ្ចូលទៅក្នុងកន្ត្រក',
                sold_out: 'អស់ពីស្តុក',
                in_stock: 'មានក្នុងស្តុក',
                out_of_stock: 'អស់ពីស្តុក',
                low_stock: 'ស្តុកតិច',
                only: 'នៅសល់តែ',
                left: 'គ្រឿង',
                phone_unit: 'គ្រឿង',
                phone_unit_single: 'គ្រឿង',
                loading_brands: 'កំពុងដំណើរការម៉ាកល្បីៗ...',
                loading_products: 'កំពុងផ្ទុកទិន្នន័យផលិតផល...',
                no_products_found: 'រកមិនឃើញផលិតផលដែលអ្នកចង់ស្វែងរកទេ។',
                shopping_bag: 'កន្ត្រកទំនិញរបស់អ្នក',
                wishlist_title: '❤️ បញ្ជីទំនិញដែលបានរក្សាទុក',
                empty_cart_title: 'កន្ត្រករបស់អ្នកមិនទាន់មានទំនិញទេ',
                empty_cart_desc: 'ស្វែងរកស្មាតហ្វូនទំនើប ឧបករណ៍សំឡេងគុណភាពខ្ពស់ និងគ្រឿងបន្លាស់ជាច្រើន។',
                start_shopping: 'ចាប់ផ្តើមទិញឥឡូវនេះ',
                order_summary: 'សង្ខេបការបញ្ជាទិញ',
                subtotal: 'តម្លៃសរុបបឋម',
                shipping: 'ថ្លៃដឹកជញ្ជូន',
                free: 'ឥតគិតថ្លៃ',
                total: 'សរុបចុងក្រោយ',
                proceed_to_checkout: 'បន្តទៅការទូទាត់ប្រាក់',
                clear_all: 'សម្អាតទាំងអស់',
                items: 'មុខ',
                item: 'មុខ',
                admin_login: 'ចូលគណនីគ្រប់គ្រង',
                admin_subtitle: 'គ្រប់គ្រងទូរស័ព្ទ ស្តុក ប្រភេទ និងមតិយោបល់អតិថិជន',
                username: 'ឈ្មោះគណនី',
                password: 'ពាក្យសម្ងាត់',
                enter_username: 'បញ្ចូលឈ្មោះគណនី',
                enter_password: 'បញ្ចូលពាក្យសម្ងាត់',
                sign_in: 'ចូលផ្ទាំងគ្រប់គ្រង',
                visit_store: 'ចូលទៅកាន់ទំព័រហាង',
                dashboard: 'ផ្ទាំងគ្រប់គ្រង',
                logout: 'ចាកចេញ',
                store: 'ហាងទំនិញ',
                admin_portal: 'ប្រព័ន្ធគ្រប់គ្រង',
                banner_title_1: 'iPhone 15 Pro Titanium',
                banner_desc_1: 'រចនាពីទីតានីញ៉ូមកម្រិតខ្ពស់ បំពាក់ឈីប A17 Pro និងកាមេរ៉ាជំនាន់ថ្មី។',
                banner_btn_1: 'ទិញ Apple iPhone →',
                banner_title_2: 'Galaxy S24 Ultra AI',
                banner_desc_2: 'Galaxy AI មកដល់ហើយ។ កាមេរ៉ា 200MP ប៊ិច S-Pen និងតួទីតានីញ៉ូម។',
                banner_btn_2: 'ទិញ Samsung Galaxy →',
                banner_title_3: 'Pixel 8 Pro Smartphone',
                banner_desc_3: 'Google Tensor G3 រូបថតវៃឆ្លាតបំផុត និង Android សុទ្ធសាធ។',
                banner_btn_3: 'ទិញ Google Pixel →',
                quick_specs: 'ព័ត៌មានលម្អិត',
                reviews: 'ការវាយតម្លៃ',
                close: 'បិទ',
                save_changes: 'រក្សាទុកការផ្លាស់ប្តូរ',
                store_logo: 'រូបសញ្ញាហាង (Logo)',
                admin_avatar: 'រូបថតគណនី Admin',
                upload_new_image: 'ផ្ទុករូបភាពថ្មី',
                remove_custom_image: 'លុបរូបភាពផ្ទាល់ខ្លួន',
                saved_subtitle: 'ឧបករណ៍ដែលអ្នកពេញចិត្តត្រូវបានរក្សាទុកនៅកន្លែងតែមួយ ដើម្បីងាយស្រួលទស្សនា និងបញ្ជាទិញ។',
                empty_wishlist_title: 'បញ្ជីចំណូលចិត្តរបស់អ្នកនៅទទេ',
                empty_wishlist_desc: 'ស្វែងរកស្មាតហ្វូនទំនើបៗក្នុងកាតាឡុករបស់យើង ហើយរក្សាទុកទូរស័ព្ទដែលអ្នកពេញចិត្តដើម្បីតាមដានលក្ខណៈ និងតម្លៃ។',
                explore_phones: 'ស្វែងរកទូរស័ព្ទ',
                add_all_to_bag: 'ដាក់ទាំងអស់ក្នុងកន្ត្រក',
                remove_from_wishlist: 'លុបចេញពីចំណូលចិត្ត',
                save_for_later: 'រក្សាទុកសម្រាប់ពេលក្រោយ',
                removed_from_saved: 'បានលុបចេញពីចំណូលចិត្ត',
                saved_for_later_toast: 'បានរក្សាទុកក្នុងចំណូលចិត្ត',
                all_added_to_cart: 'បានបញ្ចូលទំនិញទាំងអស់ទៅក្នុងកន្ត្រក',
                add_short: 'ទិញ',
                unavailable: 'មិនមានទំនិញទេ',
                no_saved_items_found: 'រកមិនឃើញទំនិញដែលបានរក្សាទុកទេ',
                no_saved_items_desc: 'ផលិតផលដែលបានរក្សាទុកមួយចំនួនអាចត្រូវបានធ្វើបច្ចុប្បន្នភាព ឬលុបចេញ។',
                loading_saved_items: 'កំពុងផ្ទុកទំនិញដែលបានរក្សាទុក...',
                shipping_unlocked: 'ការដឹកជញ្ជូនរហ័សឥតគិតថ្លៃ!',
                shipping_unlocked_sub: 'ធានាដឹកជញ្ជូនដល់ក្នុងរយៈពេល ២-៣ ថ្ងៃនៃថ្ងៃធ្វើការ',
                freq_added: 'គ្រឿងបន្លាស់ដែលពេញនិយមទិញជាមួយគ្នា',
                freq_added_sub: 'គ្រឿងបន្លាស់ចាំបាច់សម្រាប់ឧបករណ៍ថ្មីរបស់អ្នក',

                // Navigation & Tabs
                nav_overview: 'ទិដ្ឋភាពទូទៅ',
                nav_catalog: 'កាតាឡុក',
                nav_reviews: 'ការវាយតម្លៃ',
                nav_settings: 'ការកំណត់',

                // Admin Stats & Metrics
                stat_total_products: 'ផលិតផលសរុប',
                stat_total_units_desc: 'គ្រឿងសរុប',
                stat_stock_value: 'តម្លៃស្តុកសរុប',
                stat_total_inventory: 'តម្លៃសារពើភ័ណ្ឌសរុប',
                stat_avg_rating: 'ពិន្ទុវាយតម្លៃមធ្យម',
                stat_reviews_count: 'ការវាយតម្លៃ',
                stat_need_restock: 'ត្រូវការបញ្ចូលស្តុក',
                stat_low_stock_items: 'ទំនិញស្តុកតិច',

                // Stock Distribution
                stock_distribution: 'ការបែងចែកស្តុក',
                stock_critical: 'ជិតអស់ខ្លាំង',
                stock_normal: 'ធម្មតា',
                stock_high: 'ស្តុកច្រើន',

                // Products Needing Attention
                products_needing_attention: 'ផលិតផលដែលត្រូវការការយកចិត្តទុកដាក់',
                all_stocked_healthy: 'ផលិតផលទាំងអស់មានស្តុកគ្រប់គ្រាន់!',

                // Catalog Management
                catalog_management: 'ការគ្រប់គ្រងកាតាឡុក',
                catalog_subtitle: 'ផលិតផល ម៉ាក និងប្រភេទទាំងអស់ក្នុងមជ្ឈមណ្ឌលតែមួយ',
                add_product: 'បន្ថែមផលិតផល',
                add_brand: 'បន្ថែមម៉ាក',
                add_category: 'បន្ថែមប្រភេទ',
                tab_products: 'ផលិតផល',
                tab_brands: 'ម៉ាកផលិតផល',
                tab_categories: 'ប្រភេទ',
                search_products_placeholder: 'ស្វែងរកផលិតផលតាមឈ្មោះ ម៉ាក ឬតម្លៃ...',
                filter_brand_label: 'ម៉ាក:',
                filter_category_label: 'ប្រភេទ:',
                all_categories: 'គ្រប់ប្រភេទទាំងអស់',
                search_brands_placeholder: 'ស្វែងរកម៉ាក...',
                search_categories_placeholder: 'ស្វែងរកប្រភេទ...',
                no_products_found_admin: 'មិនមានផលិតផលទេ។ សូមបន្ថែមផលិតផលដំបូងរបស់អ្នក!',
                no_brands_found: 'មិនមានម៉ាកទេ។ សូមបន្ថែមម៉ាកដំបូងរបស់អ្នក!',
                no_categories_found: 'មិនមានប្រភេទទេ។ សូមបន្ថែមប្រភេទដំបូងរបស់អ្នក!',

                // Modals & Form Fields
                add_new_product: 'បន្ថែមផលិតផលថ្មី',
                edit_product: 'កែប្រែផលិតផល',
                product_name_label: 'ឈ្មោះផលិតផល *',
                brand_label: 'ម៉ាក *',
                category_label: 'ប្រភេទ *',
                price_label: 'តម្លៃ ($) *',
                stock_qty_label: 'ចំនួនស្តុក *',
                storage_specs_label: 'ទំហំផ្ទុក / លក្ខណៈបច្ចេកទេស',
                description_label: 'ការពិពណ៌នា',
                product_image_label: 'រូបភាពផលិតផល',
                cancel: 'បោះបង់',
                save_product: 'រក្សាទុកផលិតផល',
                add_new_brand: 'បន្ថែមម៉ាកថ្មី',
                edit_brand: 'កែប្រែម៉ាក',
                brand_name_label: 'ឈ្មោះម៉ាក *',
                save_brand: 'រក្សាទុកម៉ាក',
                add_new_category: 'បន្ថែមប្រភេទថ្មី',
                edit_category: 'កែប្រែប្រភេទ',
                category_name_label: 'ឈ្មោះប្រភេទ *',
                save_category: 'រក្សាទុកប្រភេទ',
                choose_logo: 'ជ្រើសរើសរូបសញ្ញា',
                choose_file: 'ជ្រើសរើសរូបភាព',

                // Reviews
                customer_reviews_title: 'ការវាយតម្លៃពីអតិថិជន',
                customer_reviews_subtitle: 'គ្រប់គ្រងមតិកែលម្អរបស់អតិថិជន',
                no_reviews_yet: 'មិនទាន់មានការវាយតម្លៃនៅឡើយទេ',
                delete_review: 'លុបការវាយតម្លៃ',

                // Settings
                store_admin_settings: 'ការកំណត់ហាង & អ្នកគ្រប់គ្រង',
                settings_subtitle: 'កំណត់អត្តសញ្ញាណហាង និងគណនីអ្នកគ្រប់គ្រងរបស់អ្នក',
                store_identity: 'អត្តសញ្ញាណហាង',
                store_identity_desc: 'កែប្រែឈ្មោះហាង ពាក្យស្លោក និងព័ត៌មានទំនាក់ទំនង',
                live_preview: 'ការមើលផ្ទាល់',
                store_logo_label: 'ឡូហ្គោហាង / រូបតំណាងម៉ាក',
                upload_store_logo: 'បញ្ចូលឡូហ្គោហាង',
                remove: 'លុបចេញ',
                store_name_label: 'ឈ្មោះហាង *',
                header_badge_label: 'ផ្លាកក្បាលទំព័រ',
                store_tagline_label: 'ពាក្យស្លោកហាង',
                section_identity: '🏪 ១. អត្តសញ្ញាណហាង និងម៉ាកយីហោ',
                section_announcement: '📢 ២. របារសេចក្តីជូនដំណឹងខាងលើ',
                section_hero: '✨ ៣. ផ្ទាំងផ្សាយពាណិជ្ជកម្មចម្បង',
                section_contact: '📞 ៤. សេវាអតិថិជន និងទីតាំងហាង',
                section_social: '🌐 ៥. បណ្តាញសង្គម',
                contact_phone: 'លេខទូរស័ព្ទទំនាក់ទំនង',
                contact_email: 'អ៊ីមែលទំនាក់ទំនង',
                physical_address: 'អាសយដ្ឋានហាង / ទីក្រុង',
                operating_hours: 'ម៉ោងបើកដំណើរការ',
                save_store_settings: 'រក្សាទុកការកំណត់ហាង',
                admin_account: 'គណនីអ្នកគ្រប់គ្រង',
                admin_account_desc: 'ធ្វើបច្ចុប្បន្នភាពឈ្មោះ ទំនាក់ទំនង និងពាក្យសម្ងាត់',
                display_name: 'ឈ្មោះបង្ហាញ',
                email_label: 'អ៊ីមែល',
                phone_label: 'លេខទូរស័ព្ទ',
                current_password: 'ពាក្យសម្ងាត់បច្ចុប្បន្ន *',
                new_password: 'ពាក្យសម្ងាត់ថ្មី (មិនបង្ខំ)',
                update_profile: 'ធ្វើបច្ចុប្បន្នភាពគណនី',

                // Cart & Checkout
                customer_info: 'ព័ត៌មានអតិថិជន',
                full_name: 'ឈ្មោះពេញ',
                delivery_address: 'អាសយដ្ឋានដឹកជញ្ជូន',
                payment_method: 'វិធីសាស្ត្រទូទាត់',
                cash_on_delivery: 'ទូទាត់ពេលទទួលទំនិញ (COD)',
                aba_khqr: 'ABA KHQR (ស្កេនទូទាត់)',
                place_order: 'បញ្ជាក់ និងកុម្ម៉ង់ទិញ',
                order_success_title: 'ការកុម្ម៉ង់ទទួលបានជោគជ័យ!',
                order_success_desc: 'សូមអរគុណសម្រាប់ការទិញទំនិញពី DyMaly។ យើងខ្ញុំនឹងទាក់ទងលោកអ្នកក្នុងពេលឆាប់ៗនេះដើម្បីបញ្ជាក់ការដឹកជញ្ជូន។',
                frequently_added: 'គ្រឿងបន្លាស់ពេញនិយមជាមួយគ្នា',
                frequently_added_desc: 'គ្រឿងបន្លាស់ចាំបាច់សម្រាប់ឧបករណ៍ថ្មីរបស់អ្នក',
                express_shipping_title: 'ទទួលបានការដឹកជញ្ជូនរហ័សឥតគិតថ្លៃ!',
                express_shipping_desc: 'ធានាដឹកជញ្ជូនក្នុងរយៈពេល ២-៣ ថ្ងៃនៃថ្ងៃធ្វើការ'
            },
            zh: {
                ai_translate: 'AI 翻译',
                brand_tagline: '正品手机与声学设备 · 闪电配送',
                nav_home: '首页',
                nav_cart: '购物车',
                nav_saved: '收藏夹',
                nav_admin: '管理后台',
                nav_shop: '精选商城',
                continue_shopping: '继续购物',
                search_placeholder: '搜索手机、品牌、配件...',
                shop_by_brand: '按品牌挑选',
                tap_brand_subtitle: '轻触品牌图标，浏览正品旗舰智能手机',
                all_brands: '全部品牌',
                all_products: '全部商品',
                showing_products_for: '当前展示品牌：',
                clear_filter: '清除筛选',
                show_all_brands: '展示全部品牌 ✕',
                sort_newest: '🔥 最新上架',
                sort_price_low: '💰 价格：从低到高',
                sort_price_high: '💎 价格：从高到低',
                sort_stock_high: '📦 库存：从多到少',
                sort_stock_low: '⚡ 库存：从少到多',
                stock_filter_all: '📦 全部库存',
                stock_filter_instock: '✓ 现货在库',
                stock_filter_low: '⚡ 低库存 (≤ 5)',
                stock_filter_out: '🚫 缺货售罄',
                add_to_cart: '加入购物车',
                added_to_cart: '已加入购物车',
                sold_out: '已售罄',
                in_stock: '现货在库',
                out_of_stock: '已售罄',
                low_stock: '库存紧俏',
                only: '仅剩',
                left: '件',
                phone_unit: '台',
                phone_unit_single: '台',
                loading_brands: '正在载入精选品牌...',
                loading_products: '正在载入商品列表...',
                no_products_found: '未找到符合条件的商品。',
                shopping_bag: '我的购物袋',
                wishlist_title: '❤️ 我的收藏与心愿单',
                empty_cart_title: '购物袋还是空的',
                empty_cart_desc: '快去探索我们精心挑选的顶级旗舰手机、发烧音频与潮流配件吧！',
                start_shopping: '立即选购',
                order_summary: '订单摘要',
                subtotal: '商品总计',
                shipping: '配送运费',
                free: '免运费',
                total: '实付金额',
                proceed_to_checkout: '前往结账',
                clear_all: '清空全部',
                items: '件商品',
                item: '件商品',
                admin_login: '管理员登录',
                admin_subtitle: '管理商品、库存、品牌类目与买家评价',
                username: '管理员账号',
                password: '登录密码',
                enter_username: '请输入管理员账号',
                enter_password: '请输入密码',
                sign_in: '登录管理面板',
                visit_store: '访问顾客商城',
                dashboard: '控制台',
                logout: '退出登录',
                store: '进入商城',
                admin_portal: '管理后台',
                banner_title_1: 'iPhone 15 Pro 钛金属',
                banner_desc_1: '航空级钛金属机身，搭载 A17 Pro 强劲芯片与新一代影像系统。',
                banner_btn_1: '选购 Apple iPhone →',
                banner_title_2: 'Galaxy S24 Ultra AI',
                banner_desc_2: 'Galaxy AI 时代降临。2亿像素专业镜头、内置 S-Pen 与钛金属边框。',
                banner_btn_2: '选购 Samsung Galaxy →',
                banner_title_3: 'Pixel 8 Pro 旗舰手机',
                banner_desc_3: 'Google Tensor G3 芯片，行业领先计算摄影与纯粹 Android 体验。',
                banner_btn_3: '选购 Google Pixel →',
                quick_specs: '核心参数',
                reviews: '用户评价',
                close: '关闭',
                save_changes: '保存设置',
                store_logo: '商店图标 (Logo)',
                admin_avatar: '管理员头像',
                upload_new_image: '上传新图片',
                remove_custom_image: '恢复默认图片',
                saved_subtitle: '将您喜爱的设备保存在一处，方便随时查看和快捷结账。',
                empty_wishlist_title: '您的愿望单是空的',
                empty_wishlist_desc: '浏览我们的精选高端智能手机，收藏您喜爱的设备以随时查看参数和价格。',
                explore_phones: '浏览手机',
                add_all_to_bag: '全部加入购物车',
                remove_from_wishlist: '从愿望单移除',
                save_for_later: '加入收藏',
                removed_from_saved: '已从收藏中移除',
                saved_for_later_toast: '已保存至愿望单',
                all_added_to_cart: '已将所有收藏商品加入购物车',
                add_short: '加购',
                unavailable: '暂时缺货',
                no_saved_items_found: '未找到收藏商品',
                no_saved_items_desc: '部分收藏的商品可能已更新或已下架。',
                loading_saved_items: '正在加载收藏商品...',
                shipping_unlocked: '已解锁极速免运费！',
                shipping_unlocked_sub: '保证 2–3 个工作日内送达',
                freq_added: '最佳搭配配件',
                freq_added_sub: '为您心仪的设备挑选必备实用配件',

                // Navigation & Tabs
                nav_overview: '总览概况',
                nav_catalog: '商品目录',
                nav_reviews: '用户评价',
                nav_settings: '系统设置',

                // Admin Stats & Metrics
                stat_total_products: '产品总数',
                stat_total_units_desc: '件总库存',
                stat_stock_value: '库存总货值',
                stat_total_inventory: '全部在库资产',
                stat_avg_rating: '平均好评度',
                stat_reviews_count: '条评价',
                stat_need_restock: '急需补货',
                stat_low_stock_items: '低库存警报',

                // Stock Distribution
                stock_distribution: '库存状态分布',
                stock_critical: '极度紧缺',
                stock_normal: '库存正常',
                stock_high: '库存充足',

                // Products Needing Attention
                products_needing_attention: '待关注及缺货商品',
                all_stocked_healthy: '所有商品库存充足！',

                // Catalog Management
                catalog_management: '商品目录管理',
                catalog_subtitle: '产品、品牌与分类一站式管理中心',
                add_product: '添加产品',
                add_brand: '添加品牌',
                add_category: '添加分类',
                tab_products: '产品列表',
                tab_brands: '品牌列表',
                tab_categories: '分类列表',
                search_products_placeholder: '按名称、品牌或价格搜索产品...',
                filter_brand_label: '品牌:',
                filter_category_label: '分类:',
                all_categories: '所有分类',
                search_brands_placeholder: '搜索品牌...',
                search_categories_placeholder: '搜索分类...',
                no_products_found_admin: '未找到产品。请添加您的第一个产品！',
                no_brands_found: '未找到品牌。请添加您的第一个品牌！',
                no_categories_found: '未找到分类。请添加您的第一个分类！',

                // Modals & Form Fields
                add_new_product: '添加新产品',
                edit_product: '编辑产品',
                product_name_label: '产品名称 *',
                brand_label: '品牌 *',
                category_label: '分类 *',
                price_label: '价格 ($) *',
                stock_qty_label: '库存数量 *',
                storage_specs_label: '存储容量 / 规格',
                description_label: '详细描述',
                product_image_label: '产品图片',
                cancel: '取消',
                save_product: '保存产品',
                add_new_brand: '添加新品牌',
                edit_brand: '编辑品牌',
                brand_name_label: '品牌名称 *',
                save_brand: '保存品牌',
                add_new_category: '添加新分类',
                edit_category: '编辑分类',
                category_name_label: '分类名称 *',
                save_category: '保存分类',
                choose_logo: '选择图标',
                choose_file: '选择图片',

                // Reviews
                customer_reviews_title: '顾客真实评价',
                customer_reviews_subtitle: '管理来自顾客的评价与留言',
                no_reviews_yet: '暂无用户评价',
                delete_review: '删除评价',

                // Settings
                store_admin_settings: '商城与管理员设置',
                settings_subtitle: '配置您的品牌商城信息与管理员账户',
                store_identity: '品牌与店铺标识',
                store_identity_desc: '修改店铺名称、广告语及顾客联系方式',
                live_preview: '实时预览',
                store_logo_label: '商城标志 / 品牌Logo',
                upload_store_logo: '上传商城Logo',
                remove: '移除',
                store_name_label: '店铺名称 *',
                header_badge_label: '页头角标',
                store_tagline_label: '店铺口号 / 标语',
                section_identity: '🏪 1. 店铺标识与品牌形象',
                section_announcement: '📢 2. 顶部公告栏',
                section_hero: '✨ 3. 首页巨幕推广横幅',
                section_contact: '📞 4. 客户服务与实体店地址',
                section_social: '🌐 5. 社交媒体渠道',
                contact_phone: '联系电话',
                contact_email: '电子邮箱',
                physical_address: '实体店详细地址',
                operating_hours: '营业时间',
                save_store_settings: '保存商城设置',
                admin_account: '管理员账户',
                admin_account_desc: '更新管理员显示名称、联系方式与登录密码',
                display_name: '显示昵称',
                email_label: '电子邮箱',
                phone_label: '联系电话',
                current_password: '当前登录密码 *',
                new_password: '新密码（可选）',
                update_profile: '更新资料',

                // Cart & Checkout
                customer_info: '顾客收货信息',
                full_name: '收货人姓名',
                delivery_address: '详细收货地址',
                payment_method: '支付方式',
                cash_on_delivery: '货到付款 (现金)',
                aba_khqr: 'ABA KHQR (扫码支付)',
                place_order: '确认并提交订单',
                order_success_title: '订单提交成功！',
                order_success_desc: '感谢您在 DyMaly 购物。我们将尽快与您联系以确认送货事宜。',
                frequently_added: '最佳搭配配件',
                frequently_added_desc: '为您心仪的设备挑选必备实用配件',
                express_shipping_title: '已解锁极速免运费！',
                express_shipping_desc: '保证 2–3 个工作日内送达'
            }
        },

        t: function(key, fallback) {
            const lang = this.currentLang;
            if (this.dict[lang] && this.dict[lang][key] !== undefined) return this.dict[lang][key];
            if (this.dict['en'] && this.dict['en'][key] !== undefined) return this.dict['en'][key];
            return fallback !== undefined ? fallback : key;
        },

        setLanguage: function(lang) {
            if (!this.dict[lang]) return;
            this.currentLang = lang;
            localStorage.setItem('bong_store_language', lang);
            document.documentElement.lang = lang;
            this.updateSwitcherUI();
            this.translatePage();
            window.dispatchEvent(new CustomEvent('languageChanged', { detail: { lang: lang } }));
        },

        getLangInfo: function(code) {
            return this.languages.find(function(l) { return l.code === code; }) || this.languages[0];
        },

        applyTranslations: function() {
            this.translatePage();
        },

        translatePage: function() {
            const self = this;
            document.querySelectorAll('[data-i18n]').forEach(function(el) {
                const key = el.getAttribute('data-i18n');
                const val = self.t(key);
                if (val) el.textContent = val;
            });
            document.querySelectorAll('[data-i18n-placeholder]').forEach(function(el) {
                const key = el.getAttribute('data-i18n-placeholder');
                const val = self.t(key);
                if (val) el.setAttribute('placeholder', val);
            });
            document.querySelectorAll('[data-i18n-title]').forEach(function(el) {
                const key = el.getAttribute('data-i18n-title');
                const val = self.t(key);
                if (val) el.setAttribute('title', val);
            });
            document.querySelectorAll('[data-i18n-aria]').forEach(function(el) {
                const key = el.getAttribute('data-i18n-aria');
                const val = self.t(key);
                if (val) el.setAttribute('aria-label', val);
            });

            const searchInput = document.getElementById('searchInput');
            if (searchInput) searchInput.placeholder = this.t('search_placeholder');

            const brandTagline = document.getElementById('storeBrandTagline');
            if (brandTagline) brandTagline.textContent = this.t('brand_tagline');

            const productsHeading = document.getElementById('productsHeading');
            if (productsHeading && !window.currentBrand) productsHeading.textContent = this.t('all_products');

            const sortSelect = document.getElementById('sortFilter');
            if (sortSelect && sortSelect.options && sortSelect.options.length >= 3) {
                sortSelect.options[0].text = this.t('sort_newest');
                sortSelect.options[1].text = this.t('sort_price_low');
                sortSelect.options[2].text = this.t('sort_price_high');
            }
        },

        injectLanguageSwitcher: function() {
            if (document.getElementById('aiLangSwitcherWrap')) return;
            const current = this.getLangInfo(this.currentLang);
            const switcher = document.createElement('div');
            switcher.id = 'aiLangSwitcherWrap';
            switcher.className = 'ai-lang-switcher-wrap';

            let optsHtml = '';
            this.languages.forEach(function(l) {
                const isActive = l.code === window.BongI18n.currentLang;
                optsHtml += '<button type="button" class="ai-lang-opt ' + (isActive ? 'active' : '') + '" data-code="' + l.code + '">' +
                    '<span class="ai-opt-flag-box"><span class="ai-opt-flag">' + l.flag + '</span></span>' +
                    '<div class="ai-opt-text">' +
                        '<span class="ai-opt-native">' + l.nativeName + '</span>' +
                        '<span class="ai-opt-sub">' + (l.sub || l.name) + '</span>' +
                    '</div>' +
                    (isActive ? '<span class="ai-check"><svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg></span>' : '<span class="ai-check-placeholder"></span>') +
                    '</button>';
            });

            switcher.innerHTML = '<button type="button" class="ai-lang-trigger" id="aiLangTrigger" aria-label="AI Language & Currency">' +
                '<span class="ai-spark-chip">✨ AI</span>' +
                '<span class="ai-flag" id="aiCurrentFlag">' + current.flag + '</span>' +
                '<span class="ai-lang-name" id="aiCurrentName">' + current.short + '</span>' +
                '<span class="ai-curr-pill" id="aiCurrentCurr">' + (this.currentCurrency === 'KHR' ? '៛ KHR' : '$ USD') + '</span>' +
                '<span class="ai-arrow"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
                '</button>' +
                '<div class="ai-lang-dropdown" id="aiLangDropdown">' +
                    '<div class="ai-dropdown-header">' +
                        '<div class="ai-dropdown-badge-row">' +
                            '<span class="ai-badge">✨ AI LOCALIZATION</span>' +
                            '<span class="ai-lang-count">3 Langs · 2 Currencies</span>' +
                        '</div>' +
                        '<p class="ai-dropdown-hint">Select language & local currency (USD / Khmer Riel)</p>' +
                    '</div>' +
                    '<!-- Currency Switcher Row -->' +
                    '<div class="ai-currency-section">' +
                        '<div class="ai-currency-label"><span>CURRENCY / រូបិយប័ណ្ណ</span><span class="ai-rate-hint">1$ ≈ 4,100៛</span></div>' +
                        '<div class="ai-currency-toggle-group">' +
                            '<button type="button" class="ai-curr-btn ' + (this.currentCurrency === 'USD' ? 'active' : '') + '" data-curr="USD">' +
                                '<span class="curr-flag">🇺🇸</span>' +
                                '<span class="curr-name">USD ($)</span>' +
                            '</button>' +
                            '<button type="button" class="ai-curr-btn ' + (this.currentCurrency === 'KHR' ? 'active' : '') + '" data-curr="KHR">' +
                                '<span class="curr-flag">🇰🇭</span>' +
                                '<span class="curr-name">KHR (៛ Riel)</span>' +
                            '</button>' +
                        '</div>' +
                    '</div>' +
                    '<div class="ai-section-divider"></div>' +
                    '<div class="ai-lang-section-label">LANGUAGE / ភាសា</div>' +
                    '<div class="ai-dropdown-list">' + optsHtml + '</div>' +
                    '<div class="ai-dropdown-footer">' +
                        '<span>⚡ Powered by Bong AI Engine</span>' +
                    '</div>' +
                '</div>' +
                '<div class="ai-dropdown-backdrop" id="aiDropdownBackdrop"></div>';

            const nav = document.querySelector('.top-nav') || document.querySelector('.header-actions') || document.querySelector('.header-row');
            if (nav) {
                if (nav.classList.contains('top-nav') || nav.classList.contains('header-actions')) {
                    nav.insertBefore(switcher, nav.firstChild);
                } else {
                    nav.appendChild(switcher);
                }
            } else {
                document.body.appendChild(switcher);
            }

            const trigger = document.getElementById('aiLangTrigger');
            const dropdown = document.getElementById('aiLangDropdown');
            const backdrop = document.getElementById('aiDropdownBackdrop');
            if (trigger && dropdown) {
                trigger.addEventListener('click', function(e) {
                    e.stopPropagation();
                    switcher.classList.toggle('open');
                });
                if (backdrop) {
                    backdrop.addEventListener('click', function(e) {
                        e.stopPropagation();
                        switcher.classList.remove('open');
                    });
                }
                document.addEventListener('click', function(e) {
                    if (!switcher.contains(e.target)) switcher.classList.remove('open');
                });
                dropdown.querySelectorAll('.ai-lang-opt').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const code = this.getAttribute('data-code');
                        window.BongI18n.setLanguage(code);
                        switcher.classList.remove('open');
                    });
                });
                dropdown.querySelectorAll('.ai-curr-btn').forEach(function(btn) {
                    btn.addEventListener('click', function(e) {
                        e.stopPropagation();
                        const curr = this.getAttribute('data-curr');
                        window.BongI18n.setCurrency(curr);
                        switcher.classList.remove('open');
                    });
                });
            }
        },

        updateSwitcherUI: function() {
            const current = this.getLangInfo(this.currentLang);
            const flagEl = document.getElementById('aiCurrentFlag');
            const nameEl = document.getElementById('aiCurrentName');
            const currEl = document.getElementById('aiCurrentCurr');
            if (flagEl) flagEl.textContent = current.flag;
            if (nameEl) nameEl.textContent = current.short;
            if (currEl) currEl.textContent = this.currentCurrency === 'KHR' ? '៛ KHR' : '$ USD';

            // Update active currency buttons
            document.querySelectorAll('.ai-curr-btn').forEach(btn => {
                const c = btn.getAttribute('data-curr');
                if (c === this.currentCurrency) {
                    btn.classList.add('active');
                } else {
                    btn.classList.remove('active');
                }
            });

            const opts = document.querySelectorAll('.ai-lang-opt');
            opts.forEach(function(opt) {
                const code = opt.getAttribute('data-code');
                if (code === window.BongI18n.currentLang) {
                    opt.classList.add('active');
                    let check = opt.querySelector('.ai-check');
                    if (!check) {
                        check = document.createElement('span');
                        check.className = 'ai-check';
                        check.innerHTML = '<svg viewBox="0 0 24 24" width="13" height="13" fill="none" stroke="currentColor" stroke-width="3" stroke-linecap="round" stroke-linejoin="round"><polyline points="20 6 9 17 4 12"></polyline></svg>';
                        const placeholder = opt.querySelector('.ai-check-placeholder');
                        if (placeholder) {
                            placeholder.replaceWith(check);
                        } else {
                            opt.appendChild(check);
                        }
                    }
                } else {
                    opt.classList.remove('active');
                    const check = opt.querySelector('.ai-check');
                    if (check) {
                        const placeholder = document.createElement('span');
                        placeholder.className = 'ai-check-placeholder';
                        check.replaceWith(placeholder);
                    }
                }
            });
        },

        init: function() {
            document.documentElement.lang = this.currentLang;
            const self = this;
            if (document.readyState === 'loading') {
                document.addEventListener('DOMContentLoaded', function() {
                    self.injectLanguageSwitcher();
                    self.translatePage();
                });
            } else {
                self.injectLanguageSwitcher();
                self.translatePage();
            }
        }
    };

    window.BongI18n.init();
})();
