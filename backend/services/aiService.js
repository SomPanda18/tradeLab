// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key from .env
const genAI = new GoogleGenerativeAI(process.env.GOOGLE_API_KEY);

exports.generateFinancialAdvice = async (userMessage, chatHistory = [], contextData = '') => {
  try {
    const model = genAI.getGenerativeModel({
      model: "gemini-1.5-flash",
      systemInstruction: `You are the Nexus AI Strategist. 
      Context: ${contextData}
      Analyze the user's specific holdings and give math-based advice like 'trim by 8%' or 'alpha: +1.8%'. 
      Be concise and use financial terminology.`
    });

    const formattedHistory = (chatHistory || []).map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));

    const chat = model.startChat({
      history: formattedHistory,
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Connection to strategy core lost. Please try again shortly.";
  }
};