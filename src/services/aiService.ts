import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const sendMessageToAI = async (message: string, sessionId: string) => {
  try {
    // Endi backendga message bilan birga sessionId ham ketadi
    const response = await axios.post(`${API_URL}/ai/chat`, { message, sessionId });
    return response.data.text;
  } catch (error) {
    console.error("AI API Error:", error);
    return "Kechirasiz, hozirda ulanishda muammo bor. Iltimos, keyinroq qayta urinib ko'ring.";
  }
};