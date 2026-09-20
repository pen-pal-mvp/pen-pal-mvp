'use client'

import { useRouter } from 'next/navigation'

export default function CancelButton() {
  const router = useRouter()
  return (
    <button 
      type="button"
      onClick={() => router.back()} 
      className="text-sm text-slate-500 hover:text-violet-600 transition-colors font-semibold flex flex-col items-end leading-tight gap-1 bg-transparent border-none p-0 cursor-pointer"
    >
      <span>← キャンセル</span>
      <span>취소</span>
    </button>
  )
}