"use client";

import { createClientComponentClient } from "@supabase/auth-helpers-nextjs";
import { useRouter } from "next/navigation";

export default function LogoutButton() {
  const router = useRouter();
  const supabase = createClientComponentClient();

  const handleLogout = async () => {
    // Supabaseのセッションを破棄
    await supabase.auth.signOut();
    
    // キャッシュをクリアしてトップページ（ログイン画面）へ強制移動
    router.refresh();
    router.push("/");
  };

  return (
    <button
      onClick={handleLogout}
      className="px-4 py-2 text-sm font-semibold text-red-500 border border-red-500 rounded-md hover:bg-red-50 transition"
    >
      ログアウト
    </button>
  );
}