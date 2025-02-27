"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function CDRTestPage() {
  const router = useRouter();

  useEffect(() => {
    router.push("/tools");
  }, [router]);

  return (
    <main className="container mx-auto px-4 py-8">
      <div className="text-center">
        <p>リダイレクト中...</p>
      </div>
    </main>
  );
}
