'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { translateLetterAction } from '@/app/actions/translationActions'

interface TranslatedLetterProps {
  content: string
  isPremium: boolean
}

export default function TranslatedLetter({ content, isPremium }: TranslatedLetterProps) {
  const router = useRouter()
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isTranslating, setIsTranslating] = useState(false)

  const handleTranslate = async () => {
    if (!isPremium) {
      router.push('/premium')
      return
    }

    setIsTranslating(true)
    try {
      const result = await translateLetterAction(content, 'ja')
      
      if (result?.error) {
        alert(result.error)
      } 
      else if (result?.translatedText) {
        setTranslatedText(result.translatedText)
      } 
      else {
        alert('翻訳結果を取得できませんでした。')
      }
    } catch (error) {
      console.error('翻訳に失敗しました:', error)
      alert('翻訳に失敗しました。時間をおいて再度お試しください。')
    } finally {
      setIsTranslating(false)
    }
  }

  return (
    <div className="space-y-4">
      <div className="p-5 bg-[#FDFBF7] rounded-xl shadow-sm border border-[#E5E0D8] text-gray-800 whitespace-pre-wrap leading-relaxed font-serif">
        {content}
      </div>

      {translatedText && (
        <div className="relative p-5 bg-blue-50/50 rounded-xl border border-blue-100 text-gray-800 whitespace-pre-wrap leading-relaxed font-serif mt-4">
          <div className="absolute -top-3 left-4 bg-blue-100 text-blue-700 text-xs font-bold px-2 py-1 rounded">
            ✨ 翻訳結果
          </div>
          {translatedText}
        </div>
      )}

      {!translatedText && (
        <button
          onClick={handleTranslate}
          disabled={isTranslating}
          className={`w-full py-3 px-4 rounded-xl font-bold transition-all duration-200 flex items-center justify-center gap-2
            ${
              isPremium
                ? 'bg-blue-600 hover:bg-blue-700 text-white disabled:bg-blue-400'
                : 'bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-md'
            }
          `}
        >
          {isPremium ? (
            isTranslating ? (
              <>
                <svg className="animate-spin h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                  <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                  <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                </svg>
                翻訳中...
              </>
            ) : (
              '✨ 翻訳する'
            )
          ) : (
            '👑 翻訳機能を使う（プレミアム専用）'
          )}
        </button>
      )}
    </div>
  )
}