"use client";

import { Suspense } from "react";
import { AuthGuard } from "./components/AuthGuard";
import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { usePrivy } from "@privy-io/react-auth";

function HomeContent() {
  const router = useRouter();
  const { authenticated } = usePrivy();

  console.log(authenticated);

  useEffect(() => {
    if (authenticated) {
      router.push("/chat");
    }
  }, [authenticated, router]);

  return null;
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
