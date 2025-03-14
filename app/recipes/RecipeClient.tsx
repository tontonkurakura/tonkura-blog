"use client";

import { useEffect } from "react";
import { useRouter } from "next/navigation";

export default function RecipeClient() {
  const router = useRouter();

  useEffect(() => {
    // 認証されていない場合はホームページにリダイレクト
    router.push("/");
  }, [router]);

  return null;
}
