// services/aiService.js
const { GoogleGenerativeAI } = require("@google/generative-ai");

// Access your API key from .env (make sure it's named GOOGLE_API_KEY there)
const genAI = new GoogleGenerativeAI(process.AIzaSyDalfCpr_QyKboI2otj7y3QEWkC7cIkCzU);

exports.generateFinancialAdvice = async (userMessage, chatHistory) => {
  try {
    // 1. Initialize the model (Gemini 1.5 Flash is recommended for speed)
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      systemInstruction: "You are the NexusFI Expert Financial Advisor. Provide concise, data-driven trading strategies and macro-economic insights. Use a professional yet encouraging tone."
    });

    // 2. Format history for Gemini (converts 'assistant' role to 'model')
    const formattedHistory = chatHistory.map(msg => ({
      role: msg.role === "assistant" ? "model" : "user",
      parts: [{ text: msg.text }],
    }));
    // services/aiService.js
exports.generateFinancialAdvice = async (userMessage, chatHistory, contextData) => {
  try {
    const model = genAI.getGenerativeModel({ 
      model: "gemini-1.5-flash",
      // This system instruction is what makes it act like the image!
      systemInstruction: `You are the Nexus AI Strategist. 
      Context: ${contextData}
      Analyze the user's specific holdings and give math-based advice like 'trim by 8%' or 'alpha: +1.8%'. 
      Be concise and use financial terminology.`
    });

    const chat = model.startChat({
      history: chatHistory.map(msg => ({
        role: msg.role === "assistant" ? "model" : "user",
        parts: [{ text: msg.text }],
      })),
    });

    const result = await chat.sendMessage(userMessage);
    return result.response.text();
  } catch (error) {
    console.error("AI Error:", error);
    return "Connection to strategy core lost.";
  }
};
    // 3. Start a chat session
    const chat = model.startChat({
      history: formattedHistory,
    });

    // 4. Send the new message
    const result = await chat.sendMessage(userMessage);
    const response = await result.response;
    
    return response.text();
  } catch (error) {
    console.error("Gemini AI Service Error:", error);
    return "I'm having trouble connecting to my strategy core. Please try again shortly.";
  }
};