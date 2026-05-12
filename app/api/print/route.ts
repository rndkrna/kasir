import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';
import { printReceipt } from '@/lib/printer';
import { Order } from '@/types';

export async function POST(request: Request) {
  try {
    const { order_id } = await request.json();

    if (!order_id) {
      return NextResponse.json({ error: 'Order ID is required' }, { status: 400 });
    }

    // Initialize Supabase with Service Role Key for server-side access
    const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
    
    if (!supabaseKey) {
      throw new Error('Supabase configuration key is missing');
    }

    const supabase = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      supabaseKey
    );

    const { data, error } = await supabase
      .from('orders')
      .select('*, tables(nomor_meja), order_items(*)')
      .eq('id', order_id)
      .single();

    if (error || !data) {
      throw new Error('Order not found');
    }

    // Trigger printing
    await printReceipt(data as unknown as Order);

    return NextResponse.json({ success: true, message: 'Receipt printed' });
  } catch (error: unknown) {
    console.error('Print API Error:', error);
    const message = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
