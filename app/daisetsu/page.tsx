"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function Daisetsu() {
  const router = useRouter();

  useEffect(() => {
    // ホームページにリダイレクト
    router.push("/");
  }, [router]);

  // リダイレクト中は何も表示しない
  return null;
}
