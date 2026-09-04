/**
 * Bong Store System - AI Translate Engine (Khmer, English, Chinese)
 * Persistent language switcher with real-time UI translation.
 */

(function() {
    window.BongI18n = {
        currentLang: localStorage.getItem('bong_store_language') || 'en',

        languages: [
            { code: 'en', name: 'English', nativeName: 'English', sub: 'Default · United States', flag: '🇺🇸', short: 'EN' },
            { code: 'km', name: 'Khmer', nativeName: 'ភាសាខ្មែរ', sub: 'Khmer · Cambodia', flag: '🇰🇭', short: 'ខ្មែរ' },
            { code: 'zh', name: 'Chinese', nativeName: '中文', sub: 'Chinese · 简体中文', flag: '🇨🇳', short: '中文' }
        ],

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
                add_to_cart: 'Add to cart',
                added_to_cart: 'Added to cart',
                sold_out: 'Sold out',
                in_stock: 'In Stock',
                out_of_stock: 'Out of Stock',
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
                remove_custom_image: 'Remove Custom Image'
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
                add_to_cart: 'ដាក់ក្នុងកន្ត្រក',
                added_to_cart: 'បានបញ្ចូលទៅក្នុងកន្ត្រក',
                sold_out: 'អស់ពីស្តុក',
                in_stock: 'មានក្នុងស្តុក',
                out_of_stock: 'អស់ពីស្តុក',
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
                remove_custom_image: 'លុបរូបភាពផ្ទាល់ខ្លួន'
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
                add_to_cart: '加入购物车',
                added_to_cart: '已加入购物车',
                sold_out: '已售罄',
                in_stock: '现货充足',
                out_of_stock: '暂时缺货',
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
                remove_custom_image: '恢复默认图片'
            }
        },

        t: function(key) {
            const lang = this.currentLang;
            if (this.dict[lang] && this.dict[lang][key] !== undefined) return this.dict[lang][key];
            if (this.dict['en'] && this.dict['en'][key] !== undefined) return this.dict['en'][key];
            return key;
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

            switcher.innerHTML = '<button type="button" class="ai-lang-trigger" id="aiLangTrigger" aria-label="AI Language Translate">' +
                '<span class="ai-spark-chip">✨ AI</span>' +
                '<span class="ai-flag" id="aiCurrentFlag">' + current.flag + '</span>' +
                '<span class="ai-lang-name" id="aiCurrentName">' + current.short + '</span>' +
                '<span class="ai-arrow"><svg viewBox="0 0 24 24" width="11" height="11" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><polyline points="6 9 12 15 18 9"></polyline></svg></span>' +
                '</button>' +
                '<div class="ai-lang-dropdown" id="aiLangDropdown">' +
                    '<div class="ai-dropdown-header">' +
                        '<div class="ai-dropdown-badge-row">' +
                            '<span class="ai-badge">✨ AI TRANSLATION</span>' +
                            '<span class="ai-lang-count">3 Languages</span>' +
                        '</div>' +
                        '<p class="ai-dropdown-hint">Select your preferred language for instant store translation</p>' +
                    '</div>' +
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
            }
        },

        updateSwitcherUI: function() {
            const current = this.getLangInfo(this.currentLang);
            const flagEl = document.getElementById('aiCurrentFlag');
            const nameEl = document.getElementById('aiCurrentName');
            if (flagEl) flagEl.textContent = current.flag;
            if (nameEl) nameEl.textContent = current.short;

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
