import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email } = body
    
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const session = await stripe.checkout.sessions.create({
      payment_method_types: ['card'],
      customer_email: email, // 顧客のメールアドレスを自動入力
      client_reference_id: userId, // 誰の決済かを判定するためのID
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard`, // 決済成功時の戻り先
      cancel_url: `${origin}/welcome`, // キャンセル時の戻り先
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}