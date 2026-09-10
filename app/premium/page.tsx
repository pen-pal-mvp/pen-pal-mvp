"use client";

import Link from "next/link";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { upgradeSubscriptionAction } from "@/app/actions/paymentActions"; // 作成したアクションをインポート

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);
  const router = useRouter();

  const handlePayment = async (method: "line" | "kakao") => {
    setIsLoading(method);
    
    try {
      // サーバーアクションを呼び出してデータベースを更新（モック決済）
      const result = await upgradeSubscriptionAction(method);

      if (result.success) {
        alert("決済が完了しました！プレミアム会員に昇格しました。 / 결제가 완료되었습니다! 프리미엄 회원이 되었습니다.");
        router.push("/dashboard"); // 成功したらダッシュボードへ戻る
      } else {
        alert(result.error);
      }
    } catch (error) {
      alert("通信エラーが発生しました。");
    } finally {
      setIsLoading(null);
    }
  };

  return (
    <div className="max-w-lg mx-auto mt-10 p-6 bg-white rounded-xl shadow-lg mb-20 text-gray-900">
      <h1 className="text-3xl font-bold text-center text-gray-900 mb-2">
        プレミアムパスポート
      </h1>
      <p className="text-center text-gray-500 mb-8 font-medium">
        한일 펜팔 / 韓日ペンパルをさらに深く楽しむ
      </p>

      <div className="bg-blue-50 border border-blue-100 rounded-lg p-6 mb-8">
        <h2 className="text-xl font-bold text-blue-800 mb-4 text-center">
          月額プランの特典 / 월간 플랜 혜택
        </h2>
        <ul className="space-y-4 text-gray-800 font-medium">
          <li className="flex items-center">
            <span className="text-2xl mr-3">✨</span>
            <div>
              <p>特急便（即時配達）が使い放題</p>
              <p className="text-sm text-gray-500">특급 우편(즉시 배달) 무제한</p>
            </div>
          </li>
          <li className="flex items-center">
            <span className="text-2xl mr-3">🔍</span>
            <div>
              <p>言語学習マッチングの優先表示</p>
              <p className="text-sm text-gray-500">언어 학습 매칭 우선 표시</p>
            </div>
          </li>
          <li className="flex items-center">
            <span className="text-2xl mr-3">🌐</span>
            <div>
              <p>手紙のワンタップ自動翻訳機能</p>
              <p className="text-sm text-gray-500">편지 원탭 자동 번역 기능</p>
            </div>
          </li>
        </ul>
      </div>

      <div className="space-y-4">
        {/* 日本向け：LINE Pay */}
        <button
          onClick={() => handlePayment("line")}
          disabled={isLoading !== null}
          className="w-full py-4 bg-[#06C755] hover:bg-[#05b34c] text-white font-bold rounded-lg transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span className="text-lg">{isLoading === "line" ? "処理中..." : "LINE Pay で登録 (300円 / 月)"}</span>
        </button>

        {/* 韓国向け：Kakao Pay */}
        <button
          onClick={() => handlePayment("kakao")}
          disabled={isLoading !== null}
          className="w-full py-4 bg-[#FEE500] hover:bg-[#e6cf00] text-[#191919] font-bold rounded-lg transition shadow-md flex items-center justify-center space-x-2 disabled:opacity-50"
        >
          <span className="text-lg">{isLoading === "kakao" ? "처리 중..." : "카카오페이로 구독 (3000원 / 월)"}</span>
        </button>
      </div>

      <div className="mt-8 text-center">
        <Link href="/dashboard" className="text-blue-500 hover:underline font-bold">
          ダッシュボードに戻る / 대시보드로 돌아가기
        </Link>
      </div>
    </div>
  );
}