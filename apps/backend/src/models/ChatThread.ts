import mongoose from "mongoose";

export interface IChatMessage {
  role: "user" | "assistant";
  content: string;
  createdAt: Date;
}

export interface IChatThread {
  userId: string;
  threadId: string;
  messages: IChatMessage[];
  createdAt: Date;
  updatedAt: Date;
  isActive: boolean;
}

const chatMessageSchema = new mongoose.Schema<IChatMessage>({
  role: { type: String, required: true, enum: ["user", "assistant"] },
  content: { type: String, required: true },
  createdAt: { type: Date, default: Date.now },
});

const chatThreadSchema = new mongoose.Schema<IChatThread>(
  {
    userId: { type: String, required: true, index: true },
    threadId: { type: String, required: true, unique: true },
    messages: [chatMessageSchema],
    isActive: { type: Boolean, default: true },
  },
  {
    timestamps: true,
  }
);

// Create indexes
chatThreadSchema.index({ createdAt: -1 });
chatThreadSchema.index({ updatedAt: -1 });

export const ChatThread = mongoose.model<IChatThread>(
  "ChatThread",
  chatThreadSchema
);
