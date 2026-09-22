import { NextResponse } from 'next/server';
import Stripe from 'stripe';
import { createClient } from '@supabase/supabase-js';

const stripe = new Stripe(process.env.STRIPE_SECRET_KEY!, {
  apiVersion: '2026-08-26.dahlia',
});

const endpointSecret = process.env.STRIPE_WEBHOOK_SECRET!;

export async function POST(req: Request) {
  const body = await req.text();
  const signature = req.headers.get('stripe-signature');

  if (!signature) {
    return NextResponse.json(
      { error: 'Missing stripe-signature header. Unauthorized.' },
      { status: 400 }
    );
  }

  let event: Stripe.Event;

  try {
    event = stripe.webhooks.constructEvent(body, signature, endpointSecret);
  } catch (err: any) {
    console.error(`Webhook signature verification failed: ${err.message}`);
    return NextResponse.json(
      { error: `Webhook Error: ${err.message}` },
      { status: 400 }
    );
  }

  if (event.type === 'checkout.session.completed') {
    const session = event.data.object as Stripe.Checkout.Session;
    const customerId = session.customer as string;
    
    // 発行時の client_reference_id から userId を抽出するように同期
    const userId = session.client_reference_id; 

    // ▼▼ 観測用のデバッグログ ▼▼
    console.log('=== WEBHOOK DEBUG ===');
    console.log('userId:', userId);
    console.log('customerId:', customerId);
    console.log('=====================');
    // ▲▲ ここまで ▲▲

    if (userId) {
      const supabase = createClient(
        process.env.NEXT_PUBLIC_SUPABASE_URL!,
        process.env.SUPABASE_SERVICE_ROLE_KEY!
      );

      const { error } = await supabase
        .from('users')
        .update({ is_premium: true, stripe_customer_id: customerId })
        .eq('id', userId);

      if (error) {
        console.error('Failed to update premium status:', error);
        return NextResponse.json({ error: 'Database update failed' }, { status: 500 });
      }
    }
  }

  return NextResponse.json({ received: true }, { status: 200 });
}