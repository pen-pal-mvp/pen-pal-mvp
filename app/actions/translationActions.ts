'use server'

import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'

export async function translateLetterAction(content: string) {
  const cookieStore = await cookies()
  const supabase = createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
  )

  // 1. ユーザー認証チェック
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) throw new Error('ログインが必要です')

  // 2. プレミアム権限チェック
  const { data: userData } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', user.id)
    .single()

  if (!userData?.is_premium) throw new Error('この機能はプレミアム会員限定です')

  // 3. OpenAI API 呼び出し
  const apiKey = process.env.OPENAI_API_KEY
  if (!apiKey) throw new Error('翻訳システムのエラー：APIキーが設定されていません')

  const response = await fetch('https://api.openai.com/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${apiKey}`,
    },
    body: JSON.stringify({
      model: 'gpt-4o-mini',
      messages: [
        {
          role: 'system',
          content: 'あなたは優秀な翻訳アシスタントです。入力されたテキストが韓国語なら自然な日本語に、日本語なら自然な韓国語に翻訳してください。翻訳されたテキストのみを出力し、挨拶や解説などの他の文章は一切出力しないでください。'
        },
        {
          role: 'user',
          content: content
        }
      ],
      temperature: 0.3, // 翻訳の正確性を重視
    }),
  })

  if (!response.ok) throw new Error('翻訳処理に失敗しました')

  const data = await response.json()
  return data.choices[0].message.content
}