import { createWorker } from "tesseract.js";

async function main(fileName) {
  const worker = await createWorker();
  // await worker.load();
  await worker.reinitialize("eng");
  const {
    data: { text },
  } = await worker.recognize(fileName);
  console.log("Ký tự captcha:", text);
  await worker.terminate();
}

await main("./output.png");
