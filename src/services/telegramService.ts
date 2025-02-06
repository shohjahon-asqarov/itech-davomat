import axios from "axios";
import { toast } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

const botToken = import.meta.env.VITE_BOT_TOKEN;
const chatId = import.meta.env.VITE_CHAT_ID;

const TELEGRAM_API_URL = `https://api.telegram.org/bot${botToken}/sendMessage`;

interface TelegramMessage {
  text: string;
}

export const sendTelegramMessage = async ({ text }: TelegramMessage) => {
  const toastId = toast.loading("Xabar yuborilmoqda..."); // Loading holati

  try {
    await axios.post(TELEGRAM_API_URL, {
      chat_id: chatId,
      text: text,
    });

    toast.update(toastId, {
      render: "Xabar muvaffaqiyatli yuborildi!",
      type: "success",
      isLoading: false,
      autoClose: 1500,
    });
  } catch (error) {
    toast.update(toastId, {
      render: "Xabar yuborishda xatolik yuz berdi!",
      type: "error",
      isLoading: false,
      autoClose: 1500,
    });

    console.error("Xabar yuborishda xatolik, qaytadan urinib ko'ring: ", error);
  }
};
