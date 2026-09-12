'use server'

import Stripe from 'stripe'
import { headers } from 'next/headers'

// 修正1: as any を追加して型エラーを回避
const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2024-06-20' as any,
})

export async function createCheckoutSessionAction() {
  try {
    // 修正2: await を追加して非同期処理に対応
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
      success_url: `${domain}/premium/success`,
      cancel_url: `${domain}/premium`,
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