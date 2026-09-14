'use client'

import { useState } from 'react'
import Link from 'next/link'
import { translateLetterAction } from '../../actions/translationActions'

export default function TranslateSection({ content, isPremium }: { content: string, isPremium: boolean }) {
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  if (!isPremium) {
    return (
      <div className="bg-gradient-to-r from-orange-50 to-pink-50 p-6 rounded-2xl border border-orange-100 text-center space-y-4">
        <div className="space-y-1">
          <h3 className="font-bold text-gray-800 flex items-center justify-center">
            <span className="mr-2">✨</span> ワンタップAI自動翻訳を使いませんか？
          </h3>
          <p className="text-xs text-gray-600">
            プレミアムプランに登録すると、韓国語や日本語の手紙を瞬時に翻訳できます。
          </p>
        </div>
        <Link
          href="/premium"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white rounded-full font-bold text-sm shadow-md transition-all"
        >
          プレミアムプランの詳細を見る
        </Link>
      </div>
    )
  }

  const handleTranslate = async () => {
    setIsLoading(true)
    setError(null)
    try {
      const result = await translateLetterAction(content, 'ja')
      
      if (result?.error) {
        setError(result.error)
      } else if (result?.translatedText) {
        setTranslatedText(result.translatedText)
      } else {
        setError('翻訳結果を取得できませんでした。')
      }
    } catch (err: any) {
      setError('通信エラーが発生しました。')
    } finally {
      setIsLoading(false)
    }
  }

  return (
    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-3">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-orange-900 flex items-center text-sm">
          <span className="mr-2">✨</span> AI自動翻訳
        </h3>
        <span className="text-xs bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold">プレミアム機能</span>
      </div>

      {!translatedText && !isLoading && (
        <button 
          onClick={handleTranslate}
          className="px-5 py-2.5 bg-white border border-orange-200 text-orange-600 rounded-lg text-sm font-bold shadow-sm hover:bg-orange-50 transition-colors w-full sm:w-auto"
        >
          日本語 / 韓国語 に翻訳する
        </button>
      )}

      {isLoading && (
        <p className="text-orange-600 text-sm font-medium animate-pulse">翻訳しています... ✨</p>
      )}

      {error && (
        <p className="text-red-500 text-sm bg-red-50 p-3 rounded-lg border border-red-100">{error}</p>
      )}

      {translatedText && (
        <div className="p-4 bg-white rounded-xl border border-orange-100 text-gray-800 text-base leading-relaxed whitespace-pre-wrap">
          {translatedText}
        </div>
      )}
    </div>
  )
}