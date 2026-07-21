import { GoogleGenerativeAI } from "@google/generative-ai";

// Use gemini-2.5-flash (stable, fast, free tier supported)
// If you get a 404, try: "gemini-2.5-flash-preview-04-17" or "gemini-3.5-flash"
const MODEL_NAME = "gemini-2.5-flash";
const API_KEY = import.meta.env.VITE_GEMINI_API_KEY;

async function runChat(prompt) {
    if (!API_KEY) {
        throw new Error("API key not found. Please add VITE_GEMINI_API_KEY to your .env file.");
    }

    const genAI = new GoogleGenerativeAI(API_KEY);
    const model = genAI.getGenerativeModel({ model: MODEL_NAME });

    const chat = model.startChat({
        generationConfig: {
            temperature: 0.9,
            maxOutputTokens: 2048,
        },
        history: [],
    });

    const result = await chat.sendMessage(prompt);
    const response = result.response;
    return response.text();
}

export default runChat;
