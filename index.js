process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0";
// const express = require("express");
// const { Pool } = require("pg");
import puppeteer from "puppeteer";
import * as fs from "fs";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
import { createWorker } from "tesseract.js";
// const app = express();

// Kết nối PostgreSQL
// const pool = new Pool({
//   host: process.env.DB_HOST,
//   user: process.env.DB_USER,
//   password: process.env.DB_PASSWORD,
//   database: process.env.DB_NAME,
//   port: process.env.DB_PORT,
// });

const delay = (ms) => new Promise((resolve) => setTimeout(resolve, ms));

// Hàm thu thập dữ liệu từ trang web Rik (ví dụ sử dụng Puppeteer)
(async function main() {
  const browser = await puppeteer.launch({
    headless: false,
    slowMo: 100,
    // devtools: true,
  });
  const page = await browser.newPage();
  await page.setViewport({ width: 800, height: 600 });
  console.log("Starting scraping Rik website...");

  const apiUrlCaptcha = "https://bodergatez.dsrcgoms.net/verify/index.aspx";
  var base64Data = "";
  page.on("response", async (response) => {
    const url = response.url();
    if (url.includes(apiUrlCaptcha)) {
      const data = await response.json();
      base64Data = data.c.b64.replace(/^data:image\/\w+;base64,/, "");
      fs.writeFileSync("api-data.json", JSON.stringify(data, null, 2));
      // console.log(base64Data);
    }
  });

  await page.goto("https://i.go88.com/", { waitUntil: "networkidle0" });
  // getPosition(page);
  //click btn login to open login form
  await page.mouse.click(470, 385, { button: "left" }); // Di chuyển chuột đến tọa độ

  // // click and type username
  // await page.mouse.click(400, 222, { button: "left" }); // Di chuyển chuột đến tọa độ
  // // await page.mouse.down({ button: "left" }); // Nhấn chuột trái
  // // await page.mouse.up({ button: "left" }); // Thả chuột trái
  // await page.keyboard.type("mrnobody");

  // //click and type password
  // await page.mouse.click(400, 280, { button: "left" }); // Di chuyển chuột đến tọa độ
  // await page.keyboard.type("admin123");

  // // //xuly captcha
  // // //loading............
  // // //handleCaptcha();

  // // click and type captcha
  // await page.mouse.click(400, 360, { button: "left" });
  // await page.keyboard.type("capthca");

  // //click btn login
  // await page.mouse.click(400, 420, { button: "left" });

  // const responsePromise = page.waitForResponse(apiUrlCaptcha);

  // // Lấy dữ liệu từ API
  // var response = await responsePromise;
  // const data = await response.json();

  // // Chuyển thành buffer và lưu thành file
  // const base64Data = data.c.b64.replace(/^data:image\/\w+;base64,/, "");
  // const buffer = Buffer.from(base64Data, "base64");
  // fs.writeFileSync("output.png", buffer);
  console.log(__dirname + `\\captcha_keyword.png`);
  
  await handleCaptcha(__dirname + "\\captcha_keyword.png");
  // console.log("API Response từ domain khác:", data);

  // // Chụp ảnh khu vực cửa sổ đăng nhập
  // await page.screenshot({
  //   path: "login_window.png", // Lưu ảnh vào file
  //   clip: {
  //     x: 258,
  //     y: 310,
  //     width: 284, // Chiều rộng khu vực
  //     height: 80, // Chiều cao khu vực
  //   },
  // });

  // // Chụp ảnh khu vực điều kiện captcha
  // await page.screenshot({
  //   path: "captcha_condition.png", // Lưu ảnh vào file
  //   clip: {
  //     x: 300,
  //     y: 310,
  //     width: 200, // Chiều rộng khu vực
  //     height: 27, // Chiều cao khu vực
  //   },
  // });

  // // Chụp ảnh khu vực chứa ký tự captcha
  // await page.screenshot({
  //   path: "captcha_keyword.png", // Lưu ảnh vào file
  //   clip: {
  //     x: 420,
  //     y: 343,
  //     width: 120, // Chiều rộng khu vực
  //     height: 42, // Chiều cao khu vực
  //   },
  // });

  // console.log("Đã chụp ảnh cửa sổ đăng nhập vào file login_window.png");
  // await browser.close();
  // await getPosition(page);
})();
async function getPosition(page) {
  const canvasExists = await page.evaluate(() => {
    const canvas = document.querySelector("#GameCanvas");
    return canvas !== null;
  });
  console.log("Canvas exists:", canvasExists);
  await page.evaluate(() => {
    const canvas = document.querySelector("#GameCanvas");
    canvas.addEventListener("mousemove", (event) => {
      const rect = canvas.getBoundingClientRect();
      const x = event.clientX - rect.left;
      const y = event.clientY - rect.top;
      console.log(`Tọa độ: x=${x}, y=${y}`);
    });
  });
}

async function handleCaptcha(fileName) {
  const worker = await createWorker();
  // await worker.load();
  await worker.reinitialize("eng");
  const {
    data: { text },
  } = await worker.recognize(fileName);
  console.log("Ký tự captcha:", text);
  await worker.terminate();
}

// // API để cảnh sát truy vấn danh sách tài khoản
// app.get("/bank-accounts", async (req, res) => {
//   try {
//     const query = "SELECT * FROM bank_accounts ORDER BY first_detected DESC";
//     const result = await pool.query(query);
//     res.json(result.rows);
//   } catch (error) {
//     res.status(500).json({ error: "Lỗi khi truy vấn tài khoản" });
//   }
// });

// // Khởi động server
// app.listen(3000, async () => {

//   console.log("Server chạy trên cổng 3000");
// });
