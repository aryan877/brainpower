import { ToolConfig } from "../types/index.js";
import axios from "axios";

interface TelegramNotifyArgs {
  message: string;
  type: "transaction" | "error" | "info";
}

export const telegramNotifyTool: ToolConfig<TelegramNotifyArgs> = {
  definition: {
    type: "function",
    function: {
      name: "telegram_notify",
      description: "Send important notifications to the user's Telegram",
      parameters: {
        type: "object",
        properties: {
          message: {
            type: "string",
            description: "The message to send to Telegram",
          },
          type: {
            type: "string",
            enum: ["transaction", "error", "info"],
            description: "Type of notification",
          },
        },
        required: ["message", "type"],
      },
    },
  },
  handler: async ({ message, type }) => {
    console.log("📱 Starting telegramNotify handler");

    try {
      const botToken = process.env.TELEGRAM_BOT_TOKEN;
      const chatId = process.env.TELEGRAM_CHAT_ID;

      if (!botToken || !chatId) {
        throw new Error("Telegram bot configuration missing");
      }

      const emoji = {
        transaction: "💰",
        error: "❌",
        info: "ℹ️",
      }[type];

      const formattedMessage = `${emoji} *${type.toUpperCase()}*\n\n${message}`;

      console.log("🔄 Sending Telegram notification");

      // Send message to Telegram
      const response = await axios.post(
        `https://api.telegram.org/bot${botToken}/sendMessage`,
        {
          chat_id: chatId,
          text: formattedMessage,
          parse_mode: "Markdown",
        }
      );

      if (response.data.ok) {
        console.log("✅ Notification sent successfully");
        return {
          success: true,
          message: "Notification sent to Telegram",
          message_id: response.data.result.message_id,
        };
      } else {
        throw new Error("Failed to send Telegram notification");
      }
    } catch (error) {
      console.error("❌ Error in telegramNotify:", error);
      return {
        success: false,
        error: error instanceof Error ? error.message : String(error),
      };
    }
  },
};
