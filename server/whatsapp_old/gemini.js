import { GoogleGenAI } from "@google/genai";
import dotenv from "dotenv";
import { BRAND_CONTEXT } from "./brandContext.js";

dotenv.config();

const ai = new GoogleGenAI({
  apiKey: process.env.GEMINI_API_KEY,
});

export const askGemini = async (userMessage, history = []) => {
  const previousChat = history.map(m => `${m.role === "user" ? "User" : "Bot"}: ${m.text}`).join("\n");

  const prompt = `
    ${BRAND_CONTEXT}

    Previous Chat:
    ${previousChat || "No previous messages."};

    Current user message:
    User: ${userMessage}

    Reply as the Brand Assistant
    `;
  
  const response = await ai.models.generateContent({
    model: "gemini-2.5-flash",
    contents: prompt,
  });

  return response.text || "Sorry, I could not understand that.";
}
