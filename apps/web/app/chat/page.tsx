"use client";

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";
import { AppLayout } from "../components/AppLayout";
import { AuthGuard } from "../components/AuthGuard";
import ChatInterface from "../components/ChatInterface";

function ChatContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  return (
    <AppLayout selectedThread={chatId}>
      <ChatInterface threadId={chatId} />
    </AppLayout>
  );
}

export default function ChatPage() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard>
        <ChatContent />
      </AuthGuard>
    </Suspense>
  );
}
