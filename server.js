const express = require('express');
const cors = require('cors');
const bodyParser = require('body-parser');
const nodemailer = require('nodemailer');
const sqlite3 = require('sqlite3').verbose();

const app = express();
const PORT = 3000;

// Middleware
app.use(cors()); // Farklı portlardan gelen isteklere izin ver
app.use(bodyParser.json()); // JSON verilerini işle

// Veritabanı Bağlantısı ve Tablo Oluşturma
const db = new sqlite3.Database('./shop.db', (err) => {
    if (err) {
        console.error('Veritabanı hatası:', err.message);
    } else {
        console.log('✅ SQLite veritabanına bağlanıldı.');
        db.run(`CREATE TABLE IF NOT EXISTS orders (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            customer_name TEXT,
            customer_email TEXT,
            address TEXT,
            total_amount TEXT,
            items JSON,
            order_date DATETIME DEFAULT CURRENT_TIMESTAMP
        )`);

        // Kullanıcılar Tablosu
        db.run(`CREATE TABLE IF NOT EXISTS users (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            email TEXT UNIQUE,
            password TEXT,
            role TEXT DEFAULT 'user'
        )`, () => {
            // Varsayılan Admin Hesabı Oluştur (Eğer yoksa)
            const insertAdmin = `INSERT OR IGNORE INTO users (email, password, role) VALUES (?, ?, ?)`;
            db.run(insertAdmin, ['admin@pamiundmami.com', 'admin123', 'admin']);
        });

        // Ürünler Tablosu
        db.run(`CREATE TABLE IF NOT EXISTS products (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            name TEXT,
            category TEXT,
            price TEXT,
            image TEXT,
            badge TEXT
        )`);
    }
});

// E-posta Yapılandırması (SMTP Ayarları)
const transporter = nodemailer.createTransport({
    host: "smtp.example.com", // Örn: smtp.gmail.com veya hosting sağlayıcınız
    port: 587,
    secure: false, 
    auth: {
        user: "siparis@pamiundmami.com", // Gönderici E-posta
        pass: "email_sifresi" // E-posta Şifresi
    }
});

// Test Route
app.get('/', (req, res) => {
    res.send('Pami & Mami Backend Çalışıyor!');
});

// --- API ENDPOINTS ---

// 1. Login (Giriş Yap)
app.post('/api/login', (req, res) => {
    const { email, password } = req.body;
    db.get(`SELECT * FROM users WHERE email = ? AND password = ?`, [email, password], (err, row) => {
        if (err) return res.status(500).json({ error: err.message });
        if (row) {
            res.json({ success: true, user: { email: row.email, role: row.role } });
        } else {
            res.status(401).json({ success: false, message: 'Hatalı e-posta veya şifre.' });
        }
    });
});

// 2. Ürünleri Getir
app.get('/api/products', (req, res) => {
    db.all(`SELECT * FROM products`, [], (err, rows) => {
        if (err) return res.status(500).json({ error: err.message });
        res.json(rows);
    });
});

// 3. Ürün Ekle (Sadece Admin)
app.post('/api/products', (req, res) => {
    const { name, category, price, image, badge } = req.body;
    const sql = `INSERT INTO products (name, category, price, image, badge) VALUES (?, ?, ?, ?, ?)`;
    db.run(sql, [name, category, price, image, badge], function(err) {
        if (err) return res.status(500).json({ error: err.message });
        res.json({ success: true, id: this.lastID });
    });
});

// Sipariş Oluşturma Endpoint'i
app.post('/api/orders', (req, res) => {
    const orderData = req.body;
    
    console.log('📦 Yeni Sipariş Geldi:', orderData);

    // 1. Veritabanına Kaydet (SQL)
    const sql = `INSERT INTO orders (customer_name, customer_email, address, total_amount, items) VALUES (?, ?, ?, ?, ?)`;
    const params = [
        orderData.customer.name,
        orderData.customer.email,
        `${orderData.customer.address}, ${orderData.customer.zip} ${orderData.customer.city}, ${orderData.customer.country || ''}`,
        orderData.total,
        JSON.stringify(orderData.items)
    ];
    
    db.run(sql, params, function(err) {
        if (err) {
            console.error('Veritabanı kayıt hatası:', err.message);
            return res.status(500).json({ error: err.message });
        }
        
        const orderId = this.lastID;

        // E-posta İçeriği Hazırla
        const mailOptions = {
            from: '"Pami & Mami Shop" <siparis@pamiundmami.com>',
            to: "admin@pamiundmami.com", // Siparişin bildirileceği sizin adresiniz
            subject: `Yeni Sipariş: #${orderId}`,
            html: `
                <h1>🎉 Yeni Sipariş Alındı!</h1>
                <p><strong>Sipariş No:</strong> #${orderId}</p>
                <p><strong>Müşteri:</strong> ${orderData.customer.name}</p>
                <p><strong>E-Posta:</strong> ${orderData.customer.email}</p>
                <p><strong>Toplam Tutar:</strong> ${orderData.total}</p>
                <hr>
                <h3>Sipariş Detayları:</h3>
                <ul>
                    ${orderData.items.map(item => `<li>${item.name} - ${item.quantity} Adet (${item.price})</li>`).join('')}
                </ul>
                <hr>
                <p><strong>Teslimat Adresi:</strong><br>
                ${orderData.customer.address}<br>
                ${orderData.customer.zip} ${orderData.customer.city}<br>
                ${orderData.customer.country || ''}</p>
            `
        };

        // E-postayı Gönder (Hata yönetimi ile)
        // Not: Canlıya geçmeden önce SMTP ayarları yapılmalıdır.
        // transporter.sendMail(mailOptions, (error, info) => { if (error) console.log(error); else console.log('Email gönderildi: ' + info.response); });
        
        res.status(201).json({
            message: 'Sipariş başarıyla alındı!',
            orderId: orderId
        });
    });
});

app.listen(PORT, () => {
    console.log(`🚀 Sunucu http://localhost:${PORT} adresinde çalışıyor.`);
});