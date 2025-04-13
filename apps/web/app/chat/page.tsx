"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "../components/ChatInterface";
import { AuthGuard } from "../components/AuthGuard";
import { AppLayout } from "../components/AppLayout";

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
