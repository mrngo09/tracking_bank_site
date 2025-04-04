process.env.NODE_TLS_REJECT_UNAUTHORIZED = "0"; // Bỏ qua kiểm tra SSL
import { Solver } from "@2captcha/captcha-solver";
// import { Solver } from "2captcha";

const solver = new Solver("62405416d5d94b6a27b152407496d81e"); // Thay bằng API Key của bạn
import { promises as fs } from "fs";

// Đường dẫn đến tệp JSON

async function readJsonFile(filePath) {
  try {
    // Đọc tệp JSON
    const data = await fs.readFile(filePath, "utf8");

    // Chuyển đổi chuỗi JSON thành object
    const jsonData = JSON.parse(data);

    return jsonData;
  } catch (err) {
    console.error("Lỗi:", err.message);
  }
}

async function solveCaptchaFromImage(jsonPath) {
  try {
    // Đọc dữ liệu từ tệp JSON ảnh CAPTCHA
    const data = await readJsonFile(jsonPath);
    const cleanBase64Image = data.c.b64;
    const hint = data.c.message;

    // solver
    //   .imageCaptcha(cleanBase64Image)
    //   .then((res) => {
    //     // Logs the image text
    //     console.log(res);
    //   })
    //   .catch((err) => {
    //     console.error(err.message);
    //   });

    // Gửi yêu cầu giải captcha
    const result = await solver.imageCaptcha({
      body: cleanBase64Image,
      numeric: 0,
      phrase: 0,
      regsense: 0,
      lang: "en",
      hintText: hint,
    });
    console.log("Kết quả captcha:", result.data);
    return result.data;
  } catch (err) {
    console.error("Lỗi:", err);
  }
}

// Gọi hàm với đường dẫn đến hình ảnh
solveCaptchaFromImage("./api-data.json");
