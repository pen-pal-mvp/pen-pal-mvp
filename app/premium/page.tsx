"use client";
import Link from "next/link";
import { useState } from "react";
import { createCheckoutSessionAction } from "@/app/actions/stripeActions";

export default function PremiumPage() {
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handlePayment = async (method: "line" | "kakao") => {
    setIsLoading(method);
    try {
      const result = await createCheckoutSessionAction();
      
      if (result.error) {
        alert("エラー: " + result.error + "\n\n오류: " + result.error);
        setIsLoading(null);
        return;
      }

      if (result.url) {
        window.location.href = result.url;
      }
    } catch (error: any) {
      alert("通信エラーが発生しました。\n\n통신 에러가 발생했습니다.");
      console.error(error);
      setIsLoading(null);
    }
  };

  return (
    <div className="min-h-screen bg-slate-50 p-8 font-sans text-slate-800 flex flex-col items-center justify-center">
      <div className="w-full max-w-lg p-8 md:p-10 bg-white rounded-3xl shadow-lg shadow-violet-100/50 border border-slate-100 space-y-8">
        
        <div className="text-center space-y-4">
          <h1 className="text-3xl font-extrabold text-transparent bg-clip-text bg-gradient-to-r from-violet-600 to-pink-500 flex flex-col gap-1">
            <span>プレミアムパスポート</span>
            <span className="text-2xl">프리미엄 패스포트</span>
          </h1>
          <div className="text-slate-500 font-semibold flex flex-col gap-1">
            <span>韓日ペンパルをさらに深く楽しむ</span>
            <span>한일 펜팔을 더욱 깊게 즐기기</span>
          </div>
        </div>

        <div className="bg-violet-50/50 border border-violet-100 rounded-2xl p-6 shadow-inner">
          <h2 className="text-xl font-semibold text-violet-800 mb-6 text-center flex flex-col items-center gap-1">
            <span className="flex items-center"><span className="mr-2">👑</span> 月額プランの特典</span>
            <span>월간 플랜 혜택</span>
          </h2>
          <ul className="space-y-6 text-slate-700">
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none mt-1">✨</span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">特急便（即時配達）が使い放題</p>
                <p className="font-semibold text-lg">특급 우편(즉시 배달) 무제한</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none mt-1">🔍</span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">言語学習マッチングの優先表示</p>
                <p className="font-semibold text-lg">언어 학습 매칭 우선 표시</p>
              </div>
            </li>
            <li className="flex items-start">
              <span className="text-2xl mr-4 leading-none mt-1">🌐</span>
              <div className="flex flex-col gap-1">
                <p className="font-semibold text-lg">手紙のワンタップ自動翻訳機能</p>
                <p className="font-semibold text-lg">편지 원탭 자동 번역 기능</p>
              </div>
            </li>
          </ul>
        </div>

        <div className="space-y-4 pt-2">
          <button 
            onClick={() => handlePayment("line")} 
            disabled={isLoading !== null} 
            className="w-full py-4 bg-[#06C755] hover:bg-[#05b34c] text-white rounded-2xl transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "line" ? (
              <>
                <span className="text-lg font-semibold">処理中...</span>
                <span className="text-lg font-semibold">처리 중...</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold">LINE Pay で登録 (300円 / 月)</span>
                <span className="text-lg font-semibold">라인페이로 등록 (300엔 / 월)</span>
              </>
            )}
          </button>
          <button 
            onClick={() => handlePayment("kakao")} 
            disabled={isLoading !== null} 
            className="w-full py-4 bg-[#FEE500] hover:bg-[#e6cf00] text-[#191919] rounded-2xl transition-all shadow-md hover:shadow-lg flex flex-col items-center justify-center gap-1 disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isLoading === "kakao" ? (
              <>
                <span className="text-lg font-semibold">処理中...</span>
                <span className="text-lg font-semibold">처리 중...</span>
              </>
            ) : (
              <>
                <span className="text-lg font-semibold">カカオペイで登録 (3000ウォン / 月)</span>
                <span className="text-lg font-semibold">카카오페이로 구독 (3000원 / 월)</span>
              </>
            )}
          </button>
        </div>

        <div className="pt-6 text-center border-t border-slate-100">
          <Link href="/dashboard" className="text-base text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-center gap-1">
            <span>← ダッシュボードに戻る</span>
            <span>대시보드로 돌아가기</span>
          </Link>
        </div>
        
      </div>
    </div>
  );
}