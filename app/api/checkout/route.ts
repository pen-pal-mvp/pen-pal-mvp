import { NextResponse } from 'next/server'
import Stripe from 'stripe'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
})

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { userId, email, provider, targetCulture, birthDate } = body
    
    const origin = request.headers.get('origin') || 'http://localhost:3000'

    const paymentMethods = provider === 'kakao' ? ['card', 'kakao_pay'] : 
                           provider === 'line' ? ['card', 'line_pay'] : 
                           ['card'];

    const session = await stripe.checkout.sessions.create({
      payment_method_types: paymentMethods,
      customer_email: email,
      client_reference_id: userId,
      metadata: {
        targetCulture: targetCulture,
        birthDate: birthDate
      },
      line_items: [
        {
          price: process.env.NEXT_PUBLIC_STRIPE_PRICE_ID,
          quantity: 1,
        },
      ],
      mode: 'subscription',
      success_url: `${origin}/dashboard`,
      cancel_url: `${origin}/welcome`,
    })

    return NextResponse.json({ url: session.url })
  } catch (error) {
    return new NextResponse('Internal Error', { status: 500 })
  }
}