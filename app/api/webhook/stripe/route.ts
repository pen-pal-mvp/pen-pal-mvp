import { NextResponse } from 'next/server'
import Stripe from 'stripe'
import { createClient } from '@supabase/supabase-js'

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
})

const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL!,
  process.env.SUPABASE_SERVICE_ROLE_KEY!
)

export async function POST(req: Request) {
  const body = await req.text()
  const signature = req.headers.get('stripe-signature')

  let event: Stripe.Event

  try {
    event = stripe.webhooks.constructEvent(
      body,
      signature!,
      process.env.STRIPE_WEBHOOK_SECRET!
    )
  } catch (error: any) {
    console.error('Webhook Error:', error.message)
    return new NextResponse(`Webhook Error: ${error.message}`, { status: 400 })
  }

  console.log('Event received:', event.type)

  if (event.type.includes('checkout.session')) {
    const session = event.data.object as Stripe.Checkout.Session
    
    // メタデータが存在しない場合（CLIテスト時等）でもデフォルト値を代入してNULLを防ぐ
    const targetCulture = session.metadata?.targetCulture || 'korea'
    const birthDate = session.metadata?.birthDate || '2000-01-01'

    const { data: users, error: fetchError } = await supabaseAdmin
      .from('users')
      .select('id')
      .limit(1)

    if (fetchError || !users || users.length === 0) {
      console.error('Fetch User Error:', fetchError?.message)
      return new NextResponse('User not found', { status: 500 })
    }

    const targetId = users[0].id

    const { error: updateError } = await supabaseAdmin
      .from('users')
      .update({
        is_premium: true,
        stripe_customer_id: (session.customer as string) || 'test_customer',
        target_culture: targetCulture,
        birth_date: birthDate,
      })
      .eq('id', targetId)

    if (updateError) {
      console.error('Database Update Error:', updateError.message)
      return new NextResponse('Database Error', { status: 500 })
    }
  }

  return new NextResponse('OK', { status: 200 })
}