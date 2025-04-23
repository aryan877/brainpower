"use client";

import { usePrivy } from "@privy-io/react-auth";
import { useRouter } from "next/navigation";
import { Suspense, useEffect } from "react";
import { AuthGuard } from "./components/AuthGuard";
import { WelcomePage } from "./components/WelcomePage";

function HomeContent() {
  const router = useRouter();
  const { authenticated } = usePrivy();

  console.log(authenticated);

  useEffect(() => {
    if (authenticated) {
      router.push("/chat");
    }
  }, [authenticated, router]);

  return <WelcomePage onLogin={() => router.push("/chat")} />;
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
