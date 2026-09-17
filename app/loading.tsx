export default function Loading() {
  return (
    <div className="min-h-screen bg-slate-50 flex flex-col items-center justify-center space-y-6">
      
      {/* ぐるぐる回るスピナー（Violet & Pinkのグラデーション） */}
      <div className="w-16 h-16 border-4 border-slate-200 border-t-violet-500 border-r-pink-500 rounded-full animate-spin shadow-sm"></div>
      
      {/* 点滅するテキスト */}
      <p className="text-slate-500 font-bold tracking-wider animate-pulse flex flex-col items-center gap-1">
        <span>画面を準備しています... ✨</span>
        <span className="text-sm font-medium">화면을 준비 중입니다...</span>
      </p>
      
    </div>
  )
}