'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'

// モック翻訳機能（プレミアム会員のみ実行可能）
export async function translateLetterAction(content: string) {
  const supabase = createServerComponentClient({ cookies })
  
  // セッション確認
  const { data: { session } } = await supabase.auth.getSession()
  if (!session) {
    throw new Error('認証されていません')
  }

  // ユーザーのプレミアム状態を取得してサーバー側でも再検証（セキュリティのため）
  const { data: user, error } = await supabase
    .from('users')
    .select('is_premium')
    .eq('id', session.user.id)
    .single()

  if (error || !user) {
    throw new Error('ユーザー情報の取得に失敗しました')
  }

  if (!user.is_premium) {
    throw new Error('この機能はプレミアム会員限定です')
  }

  // 翻訳APIの通信遅延を擬似的に再現（0.8秒待機）
  await new Promise((resolve) => setTimeout(resolve, 800))

  // モックの翻訳結果を返す
  return `[翻訳結果]: ${content}`
}