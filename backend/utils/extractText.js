// utils/extractText.js
const fs = require("fs");
const pdfjsLib = require("pdfjs-dist/legacy/build/pdf.js");
const Tesseract = require("tesseract.js");
const { cleanOcrText } = require("./cleanOcrText");

async function extractTextFromPDF(filePath) {
  const data = new Uint8Array(fs.readFileSync(filePath));
  const doc = await pdfjsLib.getDocument({ data }).promise;
  let fullText = "";

  for (let i = 1; i <= doc.numPages; i++) {
    const page = await doc.getPage(i);
    const content = await page.getTextContent();
    let lineText = "";
    let prevItem = null;

    for (const item of content.items) {
      const x = item.transform[4];
      const y = item.transform[5];
      if (prevItem) {
        const sameLine = Math.abs(prevItem.y - y) < 3;
        if (!sameLine) {
          fullText += lineText.trim() + "\n";
          lineText = "";
        } else {
          // Only add space when there is a real visual gap between items
          const gap = x - prevItem.endX;
          const fontSize = Math.abs(item.transform[0]) || 10;
          if (gap > fontSize * 0.2) lineText += " ";
        }
      }
      lineText += item.str;
      prevItem = { y, endX: x + (item.width || 0) };
      if (item.hasEOL) {
        fullText += lineText.trim() + "\n";
        lineText = "";
        prevItem = null;
      }
    }
    if (lineText.trim()) fullText += lineText.trim() + "\n";
  }
  return fullText;
}

async function extractTextFromImage(filePath) {
  const { data } = await Tesseract.recognize(filePath, "eng", {
    tessedit_pageseg_mode: "1", // fully automatic page segmentation
    tessedit_char_whitelist:
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789 .,;:@#%&+-/\\()[]{}|'\"!?_~^*\n",
  });
  // Always clean OCR output — image resumes produce many artifacts
  return cleanOcrText(data.text);
}

async function extractText(filePath, mimeType) {
  if (mimeType === "application/pdf") return extractTextFromPDF(filePath);
  if (mimeType.startsWith("image/")) return extractTextFromImage(filePath);
  throw new Error("Unsupported file type. Only PDF and images are allowed.");
}

module.exports = { extractText, extractTextFromPDF, extractTextFromImage };
