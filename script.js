const hamburger = document.querySelector('.hamburger');
const navLinks = document.querySelector('.nav-links');
const links = document.querySelectorAll('.nav-links li');

hamburger.addEventListener('click', () => {
    // Menüyü aç/kapa
    navLinks.classList.toggle('nav-active');

    // Link animasyonları
    links.forEach((link, index) => {
        if (link.style.animation) {
            link.style.animation = '';
        } else {
            link.style.animation = `navLinkFade 0.5s ease forwards ${index / 7 + 0.3}s`;
        }
    });

    // Hamburger animasyonu (X şekline dönmesi için CSS'e .toggle eklenebilir)
    hamburger.classList.toggle('toggle');
});

// COOKIE BANNER LOGIC
const cookieContainer = document.querySelector(".cookie-container");
const cookieBtn = document.querySelector(".cookie-btn");

if (cookieContainer && cookieBtn) {
    cookieBtn.addEventListener("click", () => {
        cookieContainer.classList.remove("active");
        localStorage.setItem("cookieBannerDisplayed", "true");
    });

    setTimeout(() => {
        if (!localStorage.getItem("cookieBannerDisplayed")) {
            cookieContainer.classList.add("active");
        }
    }, 2000);
}

// LANGUAGE SELECTOR LOGIC
const languageSelector = document.getElementById('languageSelector');
if (languageSelector) {
    languageSelector.addEventListener('change', (e) => {
        const lang = e.target.value;
        alert(`Sprache geändert zu: ${lang.toUpperCase()} (Demo)`);
const langLinks = document.querySelectorAll('.lang-dropdown a');
if (langLinks.length > 0) {
    langLinks.forEach(link => {
        link.addEventListener('click', (e) => {
            e.preventDefault();
            const langText = e.currentTarget.textContent.trim().split(' ')[0];
            alert(`Sprache geändert zu: ${langText} (Demo)`);
        });
    });
}

// --- FAZ 4.5: AUTH, ADMIN & ÜRÜN YÖNETİMİ ---

// API Adresi (Cloudflare üzerinden SSL ile)
const API_URL = 'https://api.pamiundmami.com'; 
const API_URL = 'https://api.pamiundmami.de'; 

let allProducts = []; // Tüm ürünleri hafızada tutmak için

// 1. Ürünleri API'den Çek ve Listele
async function fetchProducts() {
    const grid = document.querySelector('.product-grid');
    if (!grid) return;

    try {
        const response = await fetch(`${API_URL}/api/products`);
        const products = await response.json();

        allProducts = products; // Global değişkene ata
        grid.innerHTML = ''; // "Yükleniyor" yazısını temizle

        // Eğer veritabanı boşsa varsayılan ürünleri göster (Demo amaçlı)
        if (products.length === 0) {
            // Demo ürünleri manuel ekleyelim ki site boş görünmesin
            const demoProducts = [
                { name: "Hasenohr-Babyschuhe", category: "Bio-Baumwolle", price: "12.90 €", image: "https://images.unsplash.com/photo-1519689680058-324335c77eba?q=80&w=800&auto=format&fit=crop", badge: "Neu" },
                { name: "Personalisierte Schnullerkette", category: "Holz & Strick", price: "15.50 €", image: "https://images.unsplash.com/photo-1628257007727-882298715842?q=80&w=800&auto=format&fit=crop", badge: "" },
                { name: "Strickrassel Löwe", category: "Bio-Baumwolle", price: "18.90 €", image: "https://images.unsplash.com/photo-1515488042361-ee00e0ddd4e4?q=80&w=800&auto=format&fit=crop", badge: "" },
                { name: "Babydecke Musselin", category: "100% Baumwolle", price: "24.90 €", image: "https://images.unsplash.com/photo-1522771753035-a15806bb81ce?q=80&w=800&auto=format&fit=crop", badge: "Angebot" },
                { name: "Holzgreifling", category: "Naturbelassen", price: "11.50 €", image: "https://images.unsplash.com/photo-1596870230751-ebdfce98ec42?q=80&w=800&auto=format&fit=crop", badge: "" }
            ];
            allProducts = demoProducts; // Demo ürünleri de hafızaya al
            demoProducts.forEach(p => renderProductCard(p, grid));
        } else {
            products.forEach(p => renderProductCard(p, grid));
        }
        
        // Event Listener'ları tekrar bağla (Çünkü HTML yenilendi)
        attachCartEvents();
        attachWishlistEvents();

    } catch (error) {
        console.error("Ürünler yüklenemedi:", error);
        grid.innerHTML = '<p>Ürünler yüklenirken bir hata oluştu. Lütfen backend sunucusunu başlatın.</p>';
    }
}

function renderProductCard(product, container) {
    const card = document.createElement('div');
    card.classList.add('product-card');
    card.innerHTML = `
        <div class="product-image">
            <a href="product-detail.html">
                <img src="${product.image}" alt="${product.name}">
                ${product.badge ? `<span class="badge" style="${product.badge === 'Popüler' ? 'background-color: var(--accent-color);' : ''}">${product.badge}</span>` : ''}
            </a>
            <button class="wishlist-btn" data-name="${product.name}"><i class="fa-regular fa-heart"></i></button>
        </div>
        <div class="product-info">
            <h3>${product.name}</h3>
            <p class="category">${product.category}</p>
            <div class="price-action">
                <span class="price">${product.price}</span>
                <button class="add-to-cart">Sepete Ekle</button>
            </div>
        </div>
    `;
    container.appendChild(card);
}

// Sayfa Yüklendiğinde Ürünleri Çek
document.addEventListener('DOMContentLoaded', fetchProducts);

// 2. Login İşlemleri
const loginIcon = document.getElementById('loginIcon');
const loginModal = document.getElementById('loginModal');
const loginForm = document.getElementById('loginForm');
const adminBtn = document.getElementById('adminAddProductBtn');

// Kullanıcı giriş yapmış mı kontrol et
const currentUser = JSON.parse(localStorage.getItem('currentUser'));
if (currentUser && currentUser.role === 'admin') {
    if(adminBtn) adminBtn.style.display = 'flex';
    if(loginIcon) loginIcon.classList.replace('fa-user', 'fa-user-check'); // İkonu değiştir
}

if (loginIcon) {
    loginIcon.addEventListener('click', () => {
        if (localStorage.getItem('currentUser')) {
            // Zaten giriş yapmışsa çıkış yap
            if(confirm('Çıkış yapmak istiyor musunuz?')) {
                localStorage.removeItem('currentUser');
                location.reload();
            }
        } else {
            loginModal.style.display = 'flex';
        }
    });
}

if (loginForm) {
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const email = document.getElementById('loginEmail').value;
        const password = document.getElementById('loginPassword').value;

        try {
            const res = await fetch(`${API_URL}/api/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            const data = await res.json();

            if (data.success) {
                localStorage.setItem('currentUser', JSON.stringify(data.user));
                alert('Giriş Başarılı!');
                location.reload();
            } else {
                alert(data.message);
            }
        } catch (err) {
            alert('Sunucu hatası.');
        }
    });
}

// 3. Admin Ürün Ekleme
const productModal = document.getElementById('productModal');
const addProductForm = document.getElementById('addProductForm');

if (adminBtn) {
    adminBtn.addEventListener('click', () => {
        productModal.style.display = 'flex';
    });
}

if (addProductForm) {
    addProductForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newProduct = {
            name: document.getElementById('prodName').value,
            category: document.getElementById('prodCategory').value,
            price: document.getElementById('prodPrice').value,
            image: document.getElementById('prodImage').value,
            badge: document.getElementById('prodBadge').value
        };

        const res = await fetch(`${API_URL}/api/products`, {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify(newProduct)
        });

        if (res.ok) {
            alert('Ürün başarıyla eklendi!');
            location.reload();
        }
    });
}

// Modalları Kapatma (X butonu ve dışarı tıklama)
document.querySelectorAll('.close-modal').forEach(btn => {
    btn.addEventListener('click', (e) => {
        e.target.closest('.modal').style.display = 'none';
    });
});

window.onclick = function(event) {
    if (event.target.classList.contains('modal')) {
        event.target.style.display = "none";
    }
}

// --- SEPET MANTIĞI (CART LOGIC) ---

// Sepeti LocalStorage'dan al veya boş dizi oluştur
let cart = JSON.parse(localStorage.getItem('shoppingCart')) || [];

// Sayfa yüklendiğinde sepet sayısını güncelle
updateCartCount();

// 1. Anasayfa "Sepete Ekle" Butonları
function attachCartEvents() {
    const addToCartButtons = document.querySelectorAll('.add-to-cart');
    addToCartButtons.forEach(button => {
        button.onclick = (e) => {
            const card = e.target.closest('.product-card');
            const product = {
                name: card.querySelector('h3').innerText,
                price: card.querySelector('.price').innerText,
                image: card.querySelector('img').src,
                quantity: 1
            };
            addToCart(product);
        };
    });
}

// 2. Detay Sayfası "Sepete Ekle" Butonu
const addToCartBtnLarge = document.querySelector('.add-to-cart-btn-large');

if (addToCartBtnLarge) {
    addToCartBtnLarge.addEventListener('click', () => {
        const container = document.querySelector('.detail-info');
        const quantityInput = document.querySelector('.quantity-selector input');
        const quantity = quantityInput ? parseInt(quantityInput.value) : 1;
        const product = {
            name: container.querySelector('h1').innerText,
            price: container.querySelector('.detail-price').innerText,
            image: document.querySelector('.detail-image img').src,
            quantity: quantity
        };
        addToCart(product);
    });
}

// 3. Miktar Artır/Azalt Butonları (Detay Sayfası)
const quantityBtns = document.querySelectorAll('.quantity-selector button');
quantityBtns.forEach(btn => {
    btn.addEventListener('click', (e) => {
        const input = e.target.parentElement.querySelector('input');
        let value = parseInt(input.value);
        if (e.target.innerText === '+') {
            value++;
        } else if (e.target.innerText === '-' && value > 1) {
            value--;
        }
        input.value = value;
    });
});

// FONKSİYON: Sepete Ekle
function addToCart(product) {
    // Ürün zaten sepette var mı?
    const existingItem = cart.find(item => item.name === product.name);

    if (existingItem) {
        existingItem.quantity += product.quantity;
    } else {
        cart.push(product);
    }

    localStorage.setItem('shoppingCart', JSON.stringify(cart));
    updateCartCount();
    
    // İkonu salla
    const cartIcon = document.querySelector('.cart-icon');
    cartIcon.classList.add('shake');
    setTimeout(() => {
        cartIcon.classList.remove('shake');
    }, 500);
}

// FONKSİYON: Sepet Sayısını Güncelle
function updateCartCount() {
    const cartCounts = document.querySelectorAll('.cart-count');
    const totalItems = cart.reduce((total, item) => total + item.quantity, 0);
    
    cartCounts.forEach(count => {
        count.innerText = totalItems;
    });
}

// --- WISHLIST (FAVORİLER) MANTIĞI ---
function attachWishlistEvents() {
    const wishlistBtns = document.querySelectorAll('.wishlist-btn');
    let wishlist = JSON.parse(localStorage.getItem('wishlist')) || [];
    const wishlistIcon = document.getElementById('wishlistIcon');

    wishlistBtns.forEach(btn => {
        const productName = btn.getAttribute('data-name');
        const icon = btn.querySelector('i');

        // Eğer zaten favorideyse ikonu dolu yap
        if (wishlist.includes(productName)) {
            icon.classList.replace('fa-regular', 'fa-solid');
            icon.style.color = 'red';
        }

        btn.onclick = () => {
            if (wishlist.includes(productName)) {
                wishlist = wishlist.filter(item => item !== productName);
                icon.classList.replace('fa-solid', 'fa-regular');
                icon.style.color = 'var(--text-color)';
            } else {
                wishlist.push(productName);
                icon.classList.replace('fa-regular', 'fa-solid');
                icon.style.color = 'red';
            }
            localStorage.setItem('wishlist', JSON.stringify(wishlist));
        };
    });

    // Header'daki Kalp İkonuna Tıklama (Favorileri Göster)
    if (wishlistIcon) {
        wishlistIcon.onclick = () => {
            const modal = document.getElementById('wishlistModal');
            const container = document.getElementById('wishlistItems');
            const currentWishlist = JSON.parse(localStorage.getItem('wishlist')) || [];

            container.innerHTML = '';

            if (currentWishlist.length === 0) {
                container.innerHTML = '<p>Henüz favori ürününüz yok.</p>';
            } else {
                // Hafızadaki tüm ürünlerden favori olanları bul
                const favProducts = allProducts.filter(p => currentWishlist.includes(p.name));
                
                favProducts.forEach(item => {
                    const div = document.createElement('div');
                    div.style.cssText = 'display: flex; gap: 10px; margin-bottom: 10px; align-items: center; border-bottom: 1px solid #eee; padding-bottom: 5px;';
                    div.innerHTML = `
                        <img src="${item.image}" style="width: 50px; height: 50px; object-fit: cover; border-radius: 5px;">
                        <div>
                            <h4 style="font-size: 0.9rem; margin: 0;">${item.name}</h4>
                            <span style="font-size: 0.8rem; color: var(--primary-color);">${item.price}</span>
                        </div>
                    `;
                    container.appendChild(div);
                });
            }
            
            if(modal) modal.style.display = 'flex';
        };
    }
}

// --- CHECKOUT SAYFASI MANTIĞI ---

// Sepet ikonuna tıklayınca Checkout sayfasına git
const cartIcons = document.querySelectorAll('.cart-icon');
cartIcons.forEach(icon => {
    icon.addEventListener('click', () => {
        window.location.href = 'checkout.html';
    });
});

// Checkout sayfasında ürünleri listele
const checkoutItemsContainer = document.getElementById('checkout-cart-items');
const cartTotalPriceElement = document.getElementById('cart-total-price');

if (checkoutItemsContainer && cartTotalPriceElement) {
    renderCheckout();
}

function renderCheckout() {
    checkoutItemsContainer.innerHTML = '';
    let total = 0;

    if (cart.length === 0) {
        checkoutItemsContainer.innerHTML = '<p>Sepetiniz şu an boş.</p>';
        cartTotalPriceElement.innerText = '0.00 €';
        return;
    }

    cart.forEach(item => {
        // Fiyatı sayıya çevir (12.90 € -> 12.90)
        const priceNum = parseFloat(item.price.replace('€', '').replace(',', '.').trim());
        const itemTotal = priceNum * item.quantity;
        total += itemTotal;

        const itemElement = document.createElement('div');
        itemElement.classList.add('summary-item');
        itemElement.innerHTML = `
            <img src="${item.image}" alt="${item.name}">
            <div class="item-details">
                <h4>${item.name}</h4>
                <p>${item.quantity} Adet x ${item.price}</p>
            </div>
            <div class="item-price">${itemTotal.toFixed(2)} €</div>
        `;
        checkoutItemsContainer.appendChild(itemElement);
    });

    cartTotalPriceElement.innerText = total.toFixed(2) + ' €';
}

// --- CHECKOUT FORM SUBMISSION (BACKEND BAĞLANTISI) ---
const orderForm = document.getElementById('orderForm');

if (orderForm) {
    orderForm.addEventListener('submit', async (e) => {
        e.preventDefault(); // Sayfanın yenilenmesini engelle

        // Form verilerini topla
        const formData = {
            customer: {
                name: document.getElementById('customerName').value,
                email: document.getElementById('customerEmail').value,
                address: document.getElementById('customerAddress').value,
                city: document.getElementById('customerCity').value,
                zip: document.getElementById('customerZip').value
            },
            items: cart,
            total: document.getElementById('cart-total-price').innerText
        };

        try {
            // Backend'e gönder (Localhost testi için)
            const response = await fetch(`${API_URL}/api/orders`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (response.ok) {
                const result = await response.json();
                alert('🎉 Siparişiniz başarıyla alındı! Sipariş No: ' + result.orderId);
                
                // Sepeti temizle ve anasayfaya yönlendir
                cart = [];
                localStorage.setItem('shoppingCart', JSON.stringify(cart));
                window.location.href = 'index.html';
            } else {
                alert('Bir hata oluştu. Lütfen tekrar deneyin.');
            }
        } catch (error) {
            console.error('Hata:', error);
            alert('Sunucuya bağlanılamadı. Backend sunucusunun çalıştığından emin olun (npm start).');
        }
    });
}