"use client";

import { Suspense } from "react";
import { useSearchParams } from "next/navigation";
import ChatInterface from "./components/ChatInterface";
import { AuthGuard } from "./components/AuthGuard";
import { AppLayout } from "./components/AppLayout";

function HomeContent() {
  const searchParams = useSearchParams();
  const chatId = searchParams.get("chatId");

  return (
    <AppLayout selectedThread={chatId}>
      <ChatInterface threadId={chatId} />
    </AppLayout>
  );
}

export default function Home() {
  return (
    <Suspense fallback={<div>Loading...</div>}>
      <AuthGuard>
        <HomeContent />
      </AuthGuard>
    </Suspense>
  );
}
