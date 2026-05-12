import asyncHandler from "express-async-handler";
import customError from "../utils/custom-error.js";
import { GoogleGenerativeAI } from "@google/generative-ai";
import ConferenceModel from "../models/conferences.model.js";

const askAi = asyncHandler(async (req, res) => {
  const { message } = req.body;
  if (!message) throw new customError("Message is required", 400);

  const genAI = new GoogleGenerativeAI(process.env.GEMINI_API_KEY);
  const model = genAI.getGenerativeModel({ model: "gemma-4-31b-it" });
  const allConferences = await ConferenceModel.find({
    status: "confirmed",
  }).populate("faculty", "name");

  const prompt = `
    Bạn là trợ lý AI của trường Đại học Thủ Dầu Một, chuyên trả lời câu hỏi về hội nghị của trường Đại học Thủ Dầu Một.
    Dựa trên dữ liệu hội nghị sau:
    ${JSON.stringify(allConferences)}
    
    Câu hỏi: "${message}"
    
    Quy tắc:
    - Nếu câu hỏi hỏi về danh tính của bạn (ví dụ "bạn là ai"): Trả lời chính xác: "Tôi là trợ lý AI của trường Đại học Thủ Dầu Một, chuyên trả lời các câu hỏi liên quan đến hội nghị đã, đang và sắp diễn ra."
    - Nếu câu hỏi liên quan đến hội nghị: Trả lời ngắn gọn từ dữ liệu.
    - Nếu câu hỏi không liên quan: Trả lời "Xin lỗi, tôi chỉ có thể trả lời các câu hỏi liên quan đến hội nghị."
    
    Trả về một JSON object duy nhất với trường "answer" chứa câu trả lời. Không thêm bất kỳ văn bản nào khác.
  `;

  const result = await model.generateContent({
    contents: [{ role: "user", parts: [{ text: prompt }] }],
    generationConfig: {
      temperature: 0.1,
      responseMimeType: "application/json",
      responseJsonSchema: {
        type: "object",
        properties: {
          answer: { type: "string" },
        },
        required: ["answer"],
      },
    },
  });

  const response = await result.response;
  let text = response.text();

  // Loại bỏ markdown code block ```json ... ``` hoặc ``` ... ```
  text = text.replace(/^```(?:json)?\s*\n?/i, "").replace(/\n?```\s*$/i, "");
  text = text.trim();

  let finalAnswer = "Xin lỗi, không thể xử lý câu hỏi.";
  try {
    const parsed = JSON.parse(text);
    // Xử lý trường hợp lồng object như đã đề cập
    let answerValue = parsed;
    while (answerValue && typeof answerValue === "object" && "answer" in answerValue) {
      answerValue = answerValue.answer;
    }
    finalAnswer = typeof answerValue === "string" ? answerValue : JSON.stringify(answerValue);
  } catch (e) {
    // Fallback: nếu vẫn lỗi, giữ nguyên text đã được làm sạch
    finalAnswer = text;
  }
  console.log("finalAnswer", finalAnswer); // sẽ in ra chuỗi, không còn dấu {}

  res.status(200).json({
    data: finalAnswer, // ✅ không có .answer
    vcode: 0,
  });
});

export default { askAi };
