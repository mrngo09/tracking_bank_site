process.env["NODE_TLS_REJECT_UNAUTHORIZED"] = 0;
import axios from "axios";
import { promises as fs } from "fs";
import { resolve } from "path";

// API Key của bạn (thay bằng API key thực tế từ xAI)
const API_KEY =
  "xai-SOooCN4p5LWqUqw6dRRX3JZmdG431QreL8X81FjVctiorBfbkhqiMmieZyKXeWsel2sFvCwkBORvnGfX";

// API Endpoint (thay bằng endpoint thực tế từ xAI documentation)
const API_URL = "https://api.x.ai/v1/chat/completions";

// Đường dẫn đến hình ảnh CAPTCHA
const imagePath = "./captcha_keyword.png"; // Thay bằng đường dẫn thực tế đến hình ảnh PFM7

// Hàm chuyển hình ảnh thành base64
async function imageToBase64(filePath) {
  try {
    const imageData = await fs.readFile(filePath);
    return imageData.toString("base64");
  } catch (error) {
    throw new Error(`Failed to read image file: ${error.message}`);
  }
}

// Hàm chính để gửi yêu cầu tới Grok API
async function extractTextFromCaptcha() {
  // Kiểm tra xem file hình ảnh có tồn tại không
  const absolutePath = resolve(imagePath);
  if (
    !(await fs
      .access(absolutePath)
      .then(() => true)
      .catch(() => false))
  ) {
    throw new Error(`Image file not found at: ${absolutePath}`);
  }

  // Chuyển hình ảnh thành base64
  const imageBase64 = await imageToBase64(absolutePath);

  // Tạo payload cho API request
  const payload = JSON.stringify({
    model: "grok-2-latest",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please extract the text from this CAPTCHA image.",
          },
          {
            type: "image_url",
            image_url: {
              url: `data:image/png;base64,${imageBase64}`,
            },
          },
        ],
      },
    ],
    max_tokens: 50, // Giới hạn số token trả về (đủ để chứa văn bản CAPTCHA ngắn)
  });

  // Headers cho API request
  const headers = {
    Authorization: `Bearer ${API_KEY}`,
    "Content-Type": "application/json",
  };

  // Gửi yêu cầu tới API
  const response = axios
    .request({
      method: "post",
      data: payload,
      maxBodyLength: Infinity,
      url: API_URL,
      headers: headers,
    })
    .then((response) => {
      console.log(JSON.stringify(response.data));
    })
    .catch((error) => {
      console.log(error);
    });

  // Kiểm tra trạng thái phản hồi
  // if (response.status !== 200) {
  //   throw new Error(
  //     `API request failed with status code ${response.status}: ${response.data}`
  //   );
  // }

  // Phân tích phản hồi
  // const extractedText = response.data.choices[0].message.content;

  // // In kết quả
  // console.log("Extracted text from CAPTCHA:");
  // console.log(extractedText);
}

// Chạy hàm chính
extractTextFromCaptcha();
