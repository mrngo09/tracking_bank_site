import * as fs from "fs";
import * as path from "path";
import sharp from "sharp";
import { createWorker } from "tesseract.js";

/**
 * Trích xuất màu cần đọc từ hướng dẫn trong ảnh
 * @param imagePath Đường dẫn tới file hình ảnh captcha
 * @returns Thông tin về màu cần đọc (green, red, blue,...)
 */
export async function extractColorFromInstruction(imagePath) {
  try {
    // Sử dụng OCR để đọc văn bản hướng dẫn
    const worker = await createWorker();
    await worker.reinitialize("eng");

    const { data } = await worker.recognize(imagePath);
    await worker.terminate();

    // Lấy văn bản chỉ dẫn
    const instructionText = data.text.toLowerCase();
    console.log("Văn bản được nhận dạng:", instructionText);

    // Xác định màu từ văn bản hướng dẫn
    let colorToExtract = "green"; // Mặc định là xanh lá

    if (
      instructionText.includes("màu xanh lá") ||
      (instructionText.includes("màu xanh") &&
        !instructionText.includes("xanh dương"))
    ) {
      colorToExtract = "green";
    } else if (instructionText.includes("màu đỏ")) {
      colorToExtract = "red";
    } else if (
      instructionText.includes("màu xanh dương") ||
      (instructionText.includes("màu xanh") &&
        instructionText.includes("dương"))
    ) {
      colorToExtract = "blue";
    } else if (instructionText.includes("màu vàng")) {
      colorToExtract = "yellow";
    } else if (instructionText.includes("màu đen")) {
      colorToExtract = "black";
    } else if (instructionText.includes("màu tím")) {
      colorToExtract = "purple";
    } else if (instructionText.includes("màu cam")) {
      colorToExtract = "orange";
    }

    console.log(`Màu cần trích xuất: ${colorToExtract}`);
    return colorToExtract;
  } catch (error) {
    console.error("Lỗi khi xác định màu từ hướng dẫn:", error);
    // Mặc định trả về màu xanh lá
    return "green";
  }
}

/**
 * Trích xuất text có màu cụ thể từ ảnh captcha
 * @param imagePath Đường dẫn tới file hình ảnh captcha
 * @param colorToExtract Màu cần trích xuất (green, red, blue,...)
 * @returns Chuỗi text đã nhận dạng được
 */
export async function extractTextByColor(imagePath, colorToExtract) {
  // Đường dẫn cho các file tạm thời
  const tempDir = path.dirname(imagePath);
  const preprocessedImagePath = path.join(tempDir, "preprocessed_captcha.png");
  const processedImagePath = path.join(tempDir, "processed_captcha.png");

  try {
    // Bước 1: Tiền xử lý ảnh - tăng kích thước và độ phân giải
    await sharp(imagePath)
      .metadata()
      .then(async (metadata) => {
        return sharp(imagePath)
          .resize({
            width: metadata.width ? metadata.width * 3 : 300,
            height: metadata.height ? metadata.height * 3 : 100,
            fit: "fill",
          })
          .sharpen()
          .normalize()
          .withMetadata({ density: 300 })
          .toFile(preprocessedImagePath);
      });

    // Bước 2: Xử lý ảnh để tách màu được chỉ định
    await sharp(preprocessedImagePath)
      .raw()
      .toBuffer({ resolveWithObject: true })
      .then(({ data, info }) => {
        const { width, height, channels } = info;
        const pixelArray = new Uint8Array(width * height * channels);

        // Thiết lập các tham số lọc màu dựa trên màu cần trích xuất
        let colorFilter = (r, g, b) => false;

        switch (colorToExtract) {
          case "green":
            // Lọc màu xanh lá: G cao, R và B thấp hơn
            colorFilter = (r, g, b) => g > r + 30 && g > b + 15;
            break;
          case "red":
            // Lọc màu đỏ: R cao, G và B thấp
            colorFilter = (r, g, b) => r > g + 30 && r > b + 30;
            break;
          case "blue":
            // Lọc màu xanh dương: B cao, R và G thấp
            colorFilter = (r, g, b) => b > r + 30 && b > g + 15;
            break;
          case "yellow":
            // Lọc màu vàng: R và G cao, B thấp
            colorFilter = (r, g, b) =>
              r > b + 50 && g > b + 50 && Math.abs(r - g) < 50;
            break;
          case "purple":
            // Lọc màu tím: R và B cao, G thấp
            colorFilter = (r, g, b) => r > g + 30 && b > g + 30;
            break;
          case "orange":
            // Lọc màu cam: R cao, G trung bình, B thấp
            colorFilter = (r, g, b) => r > g + 30 && r > b + 60 && g > b + 30;
            break;
          case "black":
            // Lọc màu đen: tất cả các kênh thấp
            colorFilter = (r, g, b) => r < 60 && g < 60 && b < 60;
            break;
          default:
            // Mặc định là màu xanh lá
            colorFilter = (r, g, b) => g > r + 30 && g > b + 15;
        }

        // Áp dụng bộ lọc màu
        for (let i = 0; i < data.length; i += channels) {
          const r = data[i];
          const g = data[i + 1];
          const b = data[i + 2];

          if (colorFilter(r, g, b)) {
            // Giữ lại pixel có màu cần trích xuất và chuyển thành đen
            pixelArray[i] = 0; // R
            pixelArray[i + 1] = 0; // G
            pixelArray[i + 2] = 0; // B
            if (channels === 4) pixelArray[i + 3] = 255; // Alpha
          } else {
            // Chuyển các pixel khác thành trắng
            pixelArray[i] = 255; // R
            pixelArray[i + 1] = 255; // G
            pixelArray[i + 2] = 255; // B
            if (channels === 4) pixelArray[i + 3] = 255; // Alpha
          }
        }

        // Tạo ảnh mới từ dữ liệu đã xử lý
        return sharp(pixelArray, {
          raw: { width, height, channels },
        })
          .threshold(128) // Ngưỡng để làm rõ chữ
          .png()
          .toFile(processedImagePath);
      });

    // Bước 3: Sử dụng Tesseract OCR để đọc text
    const worker = await createWorker();
    await worker.reinitialize("eng");

    // Cấu hình OCR tối ưu cho captcha
    await worker.setParameters({
      tessedit_char_whitelist:
        "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789",
      tessedit_ocr_engine_mode: "2", // Sử dụng LSTM only
    });

    // Thực hiện OCR
    const { data } = await worker.recognize(processedImagePath);
    await worker.terminate();

    // Xử lý kết quả OCR
    const recognizedText = data.text.trim().replace(/\s+/g, "");

    console.log(
      `Đã nhận dạng captcha màu ${colorToExtract}: "${recognizedText}"`
    );
    return recognizedText;
  } catch (error) {
    console.error(`Lỗi khi xử lý captcha màu ${colorToExtract}:`, error);
    throw error;
  } finally {
    // Xóa các file tạm
    if (fs.existsSync(preprocessedImagePath)) {
      fs.unlinkSync(preprocessedImagePath);
    }
    if (fs.existsSync(processedImagePath)) {
      fs.unlinkSync(processedImagePath);
    }
  }
}

/**
 * Hàm chính để tự động giải captcha màu
 * @param imagePath Đường dẫn tới file hình ảnh captcha
 * @param specifiedColor (Tùy chọn) Màu cần trích xuất được chỉ định trước
 * @returns Chuỗi text đã nhận dạng được
 */
export async function solveCaptcha(imagePath, specifiedColor) {
  try {
    // Xác định màu cần đọc (từ tham số hoặc từ hướng dẫn)
    const colorToExtract =
      specifiedColor || (await extractColorFromInstruction(imagePath));

    // Trích xuất text từ ảnh dựa trên màu
    return await extractTextByColor(imagePath, colorToExtract);
  } catch (error) {
    console.error("Lỗi khi giải captcha:", error);
    throw error;
  }
}

/**
 * Hàm tinh chỉnh các tham số lọc màu dựa trên ảnh cụ thể
 * @param imagePath Đường dẫn tới file hình ảnh captcha
 * @param colorName Tên màu cần điều chỉnh
 */
export async function tuneColorParameters(imagePath, colorName) {
  try {
    // Đọc ảnh
    const { data, info } = await sharp(imagePath)
      .raw()
      .toBuffer({ resolveWithObject: true });

    const { width, height, channels } = info;

    // Thống kê về các màu trong ảnh
    const colorStats = {
      red: [],
      green: [],
      blue: [],
    };

    // Phân tích các pixel trong ảnh
    for (let i = 0; i < data.length; i += channels) {
      const r = data[i];
      const g = data[i + 1];
      const b = data[i + 2];

      // Kiểm tra và phân loại màu
      if (g > r + 30 && g > b + 15) {
        // Có thể là màu xanh lá
        colorStats.green.push(i / channels);
      } else if (r > g + 30 && r > b + 30) {
        // Có thể là màu đỏ
        colorStats.red.push(i / channels);
      } else if (b > r + 30 && b > g + 15) {
        // Có thể là màu xanh dương
        colorStats.blue.push(i / channels);
      }
    }

    // In thống kê
    console.log(
      `Ảnh có kích thước ${width}x${height} với ${channels} kênh màu`
    );
    console.log(`Số pixel có màu đỏ: ${colorStats.red.length}`);
    console.log(`Số pixel có màu xanh lá: ${colorStats.green.length}`);
    console.log(`Số pixel có màu xanh dương: ${colorStats.blue.length}`);

    // Lưu ảnh với các pixel được đánh dấu theo màu
    const markedPixelArray = new Uint8Array(width * height * channels);

    // Sao chép dữ liệu gốc
    for (let i = 0; i < data.length; i++) {
      markedPixelArray[i] = data[i];
    }

    // Đánh dấu các pixel theo màu đã phát hiện
    if (colorName === "green") {
      for (const idx of colorStats.green) {
        const i = idx * channels;
        // Đánh dấu pixel màu xanh lá
        markedPixelArray[i] = 0; // R
        markedPixelArray[i + 1] = 0; // G
        markedPixelArray[i + 2] = 0; // B
      }
    } else if (colorName === "red") {
      for (const idx of colorStats.red) {
        const i = idx * channels;
        // Đánh dấu pixel màu đỏ
        markedPixelArray[i] = 0; // R
        markedPixelArray[i + 1] = 0; // G
        markedPixelArray[i + 2] = 0; // B
      }
    } else if (colorName === "blue") {
      for (const idx of colorStats.blue) {
        const i = idx * channels;
        // Đánh dấu pixel màu xanh dương
        markedPixelArray[i] = 0; // R
        markedPixelArray[i + 1] = 0; // G
        markedPixelArray[i + 2] = 0; // B
      }
    }

    // Lưu ảnh đã đánh dấu
    await sharp(markedPixelArray, {
      raw: { width, height, channels },
    })
      .png()
      .toFile(path.join(path.dirname(imagePath), `marked_${colorName}.png`));

    console.log(`Đã lưu ảnh với các pixel màu ${colorName} được đánh dấu.`);
  } catch (error) {
    console.error("Lỗi khi điều chỉnh tham số màu:", error);
  }
}

// Hàm main để test
async function main() {
  try {
    const captchaImagePath = "./captcha_keyword.png";

    // Phân tích và tinh chỉnh các tham số màu (có thể bỏ qua bước này nếu không cần)
    // await tuneColorParameters(captchaImagePath, 'green');

    // Sử dụng phương pháp tự động
    const captchaText = await solveCaptcha(captchaImagePath);
    console.log(`Kết quả giải captcha: ${captchaText}`);

    // Hoặc chỉ định trước màu cần trích xuất
    // const captchaText = await solveCaptcha(captchaImagePath, 'green');
  } catch (error) {
    console.error("Lỗi:", error);
  }
}

main();