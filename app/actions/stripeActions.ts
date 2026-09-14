'use server'

import Stripe from 'stripe'
import { headers, cookies } from 'next/headers'
import { createServerClient } from '@supabase/ssr'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia' as any, 
})

export async function createCheckoutSessionAction() {
  try {
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!,
      { cookies: { getAll() { return cookieStore.getAll() }, setAll() {} } }
    )
    
    const { data: { user } } = await supabase.auth.getUser()
    if (!user) {
      return { error: '決済へ進むにはログインが必要です。' }
    }

    const headersList = await headers()
    const domain = headersList.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${domain}/dashboard`, // 成功時はダッシュボードへ戻すわ
      cancel_url: `${domain}/premium`,
      client_reference_id: user.id, 
      metadata: {
        userId: user.id, // ★重要: Webhook側が読み取る命綱
      },
    })

    if (!session.url) {
      throw new Error('決済URLの生成に失敗しました')
    }

    return { url: session.url }
  } catch (error: any) {
    console.error('Stripe決済セッション生成エラー:', error)
    return { error: '決済画面の準備に失敗しました。時間をおいて再度お試しください。' }
  }
}