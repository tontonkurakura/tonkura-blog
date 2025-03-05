'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Cookies from 'js-cookie';

export default function RecipeClient() {
  const router = useRouter();

  useEffect(() => {
    // ローカルストレージからRecipesの表示状態を確認
    const showRecipes = localStorage.getItem('showRecipes') === 'true';

    // クッキーに状態を保存
    Cookies.set('showRecipes', showRecipes ? 'true' : 'false');

    if (!showRecipes) {
      // 認証されていない場合はホームページにリダイレクト
      router.push('/');
    }
  }, [router]);

  return null;
} 