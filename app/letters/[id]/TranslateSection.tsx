'use client'

import { useState } from 'react'
import { translateLetterAction } from '../../actions/translateLetter'

export default function TranslateSection({ content, isPremium }: { content: string; isPremium: boolean }) {
  const [translatedText, setTranslatedText] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleTranslate = async () => {
    if (!isPremium) return
    setLoading(true)
    setError(null)
    try {
      // サーバー側でOpenAIを叩く処理を呼び出し
      const result = await translateLetterAction(content)
      setTranslatedText(result)
    } catch (err: any) {
      setError(err.message || '翻訳に失敗しました。')
    } finally {
      setLoading(false)
    }
  }

  // プレミアム未加入の場合のUI
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
        <a
          href="/premium"
          className="inline-block px-6 py-3 bg-gradient-to-r from-orange-500 to-pink-500 hover:opacity-90 text-white rounded-full font-bold text-sm shadow-md transition-all"
        >
          プレミアムプランの詳細を見る
        </a>
      </div>
    )
  }

  // プレミアム加入済みの場合のUI
  return (
    <div className="bg-orange-50/50 p-5 rounded-2xl border border-orange-100 space-y-4">
      <div className="flex items-center justify-between">
        <h3 className="font-bold text-orange-900 flex items-center text-sm">
          <span className="mr-2">✨</span> AI自動翻訳
        </h3>
        <span className="text-xs bg-orange-200 text-orange-800 px-2.5 py-1 rounded-full font-bold">プレミアム機能</span>
      </div>

      {!translatedText && !loading && (
        <button
          onClick={handleTranslate}
          className="w-full py-3 bg-white border-2 border-orange-200 hover:bg-orange-50 text-orange-600 rounded-xl font-bold text-sm shadow-sm transition-all"
        >
          この手紙を翻訳する
        </button>
      )}

      {loading && (
        <div className="text-center py-6 text-orange-500 font-bold text-sm animate-pulse flex justify-center items-center space-x-2">
          <span>翻訳中...</span>
          <span className="text-xl">🌍✨</span>
        </div>
      )}

      {error && (
        <div className="text-red-500 text-sm font-bold p-4 bg-red-50 rounded-xl border border-red-100">
          {error}
        </div>
      )}

      {translatedText && (
        <div className="mt-4 p-5 bg-white rounded-xl border border-orange-100 shadow-sm relative">
          <p className="text-gray-800 whitespace-pre-wrap leading-relaxed text-sm font-medium">
            {translatedText}
          </p>
        </div>
      )}
    </div>
  )
}