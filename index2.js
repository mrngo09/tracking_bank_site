require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const puppeteerExtra = require('puppeteer-extra');
const ProxyPlugin = require('puppeteer-extra-plugin-proxy');
const app = express();

// Kết nối PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Cấu hình Proxy
puppeteerExtra.use(
    ProxyPlugin({
        address: 'proxy.example.com', // Thay bằng địa chỉ proxy thực tế
        port: 12345,                  // Thay bằng cổng proxy
        credentials: {                // Nếu proxy yêu cầu xác thực
            username: 'your_proxy_username',
            password: 'your_proxy_password',
        },
    })
);

// Hàm kiểm tra và thêm tài khoản ngân hàng
async function trackBankAccount(accountNumber, bankName) {
    try {
        const checkQuery = 'SELECT * FROM bank_accounts WHERE account_number = $1';
        const result = await pool.query(checkQuery, [accountNumber]);

        if (result.rows.length === 0) {
            const insertQuery = `
                INSERT INTO bank_accounts (account_number, bank_name)
                VALUES ($1, $2)
                RETURNING *;
            `;
            const newAccount = await pool.query(insertQuery, [accountNumber, bankName]);
            console.log('Tài khoản mới:', newAccount.rows[0]);
            return newAccount.rows[0];
        } else {
            const updateQuery = `
                UPDATE bank_accounts
                SET last_seen = CURRENT_TIMESTAMP, is_active = TRUE
                WHERE account_number = $1
                RETURNING *;
            `;
            const updatedAccount = await pool.query(updateQuery, [accountNumber]);
            console.log('Cập nhật tài khoản:', updatedAccount.rows[0]);
            return updatedAccount.rows[0];
        }
    } catch (error) {
        console.error('Lỗi khi theo dõi tài khoản:', error);
    }
}

// Hàm thu thập dữ liệu từ trang web Rik với Proxy
async function scrapeRikWebsite() {
    const browser = await puppeteerExtra.launch({
        headless: true,
        args: [
            '--no-sandbox',
            '--disable-setuid-sandbox',
            // Proxy được cấu hình qua puppeteer-extra-plugin-proxy
        ],
    });
    const page = await browser.newPage();
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    // Bỏ qua lỗi SSL nếu cần (proxy đôi khi gây ra vấn đề này)
    await page.setRequestInterception(true);
    page.on('request', (req) => {
        req.continue();
    });

    try {
        await page.goto('https://rik-website.com', { waitUntil: 'networkidle2' }); // Thay bằng URL thực tế
        const bankData = await page.evaluate(() => {
            const accountElement = document.querySelector('.bank-account'); // Thay bằng selector thực tế
            return {
                accountNumber: accountElement?.innerText || 'N/A',
                bankName: 'Unknown', // Cần logic để lấy tên ngân hàng
            };
        });
        await browser.close();
        return bankData;
    } catch (error) {
        console.error('Lỗi khi scrape:', error);
        await browser.close();
        return null;
    }
}

// API để truy vấn danh sách tài khoản
app.get('/bank-accounts', async (req, res) => {
    try {
        const query = 'SELECT * FROM bank_accounts ORDER BY first_detected DESC';
        const result = await pool.query(query);
        res.json(result.rows);
    } catch (error) {
        res.status(500).json({ error: 'Lỗi khi truy vấn tài khoản' });
    }
});

// Chạy kiểm tra định kỳ (mỗi 5 phút)
setInterval(async () => {
    const bankData = await scrapeRikWebsite();
    if (bankData && bankData.accountNumber !== 'N/A') {
        await trackBankAccount(bankData.accountNumber, bankData.bankName);
    }
}, 5 * 60 * 1000); // 5 phút

// Khởi động server
app.listen(3000, () => {
    console.log('Server chạy trên cổng 3000');
});