'use server'

import { cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'
import { revalidatePath } from 'next/cache'
import { redirect } from 'next/navigation'

async function getSupabase() {
  const cookieStore = await cookies()
  return createServerClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL!,
    process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
    {
      cookies: {
        getAll() {
          return cookieStore.getAll()
        },
        setAll(cookiesToSet) {
          try {
            cookiesToSet.forEach(({ name, value, options }) =>
              cookieStore.set(name, value, options)
            )
          } catch {
            // Server Actionからの呼び出し時は無視
          }
        },
      },
    }
  )
}

// ユーザーをブロックする
export async function blockUser(blockedId: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('blocks').insert({
    blocker_id: user.id,
    blocked_id: blockedId,
  })

  revalidatePath('/dashboard')
}

// 手紙を通報する
export async function reportLetter(letterId: string, reportedId: string, reason: string) {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  await supabase.from('reports').insert({
    reporter_id: user.id,
    reported_id: reportedId,
    letter_id: letterId,
    reason: reason,
  })

  revalidatePath('/dashboard')
}

// 退会処理（論理削除と匿名化）
export async function deleteAccount() {
  const supabase = await getSupabase()
  const { data: { user } } = await supabase.auth.getUser()
  if (!user) return

  // 1. プロフィール情報を「退会したユーザー」に書き換え（匿名化）
  await supabase.from('users').update({
    pen_name: '退会したユーザー',
    avatar_type: 'deleted',
    email: null
  }).eq('id', user.id)

  // 2. ログアウト処理
  await supabase.auth.signOut()

  // 3. トップページへリダイレクト
  redirect('/')
}