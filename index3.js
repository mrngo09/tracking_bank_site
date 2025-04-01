require('dotenv').config();
const express = require('express');
const { Pool } = require('pg');
const puppeteerExtra = require('puppeteer-extra');
const ProxyPlugin = require('puppeteer-extra-plugin-proxy');
const { Solver } = require('2captcha');
const app = express();

// Kết nối PostgreSQL
const pool = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT,
});

// Cấu hình Proxy (từ phần trước)
puppeteerExtra.use(
    ProxyPlugin({
        address: 'proxy.example.com',
        port: 12345,
        credentials: {
            username: 'your_proxy_username',
            password: 'your_proxy_password',
        },
    })
);

// Khởi tạo 2Captcha
const captchaSolver = new Solver('your_2captcha_api_key'); // Thay bằng API key của bạn

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

// Hàm giải CAPTCHA với 2Captcha
async function solveCaptcha(page, siteKey, url) {
    try {
        const { data } = await captchaSolver.recaptcha({
            googlekey: siteKey, // Site key của reCAPTCHA
            pageurl: url,       // URL của trang web Rik
        });
        console.log('Đã giải CAPTCHA:', data);
        return data; // Mã token CAPTCHA
    } catch (error) {
        console.error('Lỗi khi giải CAPTCHA:', error);
        throw error;
    }
}

// Hàm thu thập dữ liệu từ trang web Rik với xử lý CAPTCHA
async function scrapeRikWebsite() {
    const browser = await puppeteerExtra.launch({
        headless: true,
        args: ['--no-sandbox', '--disable-setuid-sandbox'],
    });
    const page = await browser.newPage();

    // Giả lập hành vi người dùng
    await page.setUserAgent('Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36');
    await page.setViewport({ width: 1280, height: 720 });

    try {
        await page.goto('https://rik-website.com', { waitUntil: 'networkidle2' }); // Thay bằng URL thực tế

        // Kiểm tra xem có CAPTCHA không
        const captchaElement = await page.$('div.g-recaptcha');
        if (captchaElement) {
            console.log('Phát hiện CAPTCHA, đang giải...');
            const siteKey = await page.evaluate(() => {
                return document.querySelector('div.g-recaptcha').getAttribute('data-sitekey');
            });

            // Giải CAPTCHA
            const captchaToken = await solveCaptcha(page, siteKey, 'https://rik-website.com');

            // Chèn token vào callback của reCAPTCHA
            await page.evaluate((token) => {
                document.getElementById('g-recaptcha-response').innerHTML = token;
                // Gọi hàm callback nếu có
                if (typeof ___grecaptcha_cfg !== 'undefined' && ___grecaptcha_cfg.callback) {
                    window[___grecaptcha_cfg.callback](token);
                }
            }, captchaToken);

            // Chờ trang tải lại sau khi vượt CAPTCHA (nếu cần)
            await page.waitForTimeout(2000);
        }

        // Lấy dữ liệu tài khoản ngân hàng
        const bankData = await page.evaluate(() => {
            const accountElement = document.querySelector('.bank-account'); // Thay bằng selector thực tế
            return {
                accountNumber: accountElement?.innerText || 'N/A',
                bankName: 'Unknown',
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