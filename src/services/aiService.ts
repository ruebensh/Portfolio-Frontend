import axios from 'axios';

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export const sendMessageToAI = async (message: string) => {
  try {
    const response = await axios.post(`${API_URL}/ai/chat`, { message });
    return response.data.text;
  } catch (error) {
    console.error("AI API Error:", error);
    return "Kechirasiz, hozirda ulanishda muammo bor. Iltimos, keyinroq qayta urinib ko'ring.";
  }
};