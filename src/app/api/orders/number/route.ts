import { NextResponse } from 'next/server';
import { newOrderNumber } from '../_lib/number';

export const dynamic = 'force-dynamic';

/** Выдаёт номер заказа до отправки заявки: он нужен клиенту для PDF. */
export async function POST() {
  return NextResponse.json({ number: await newOrderNumber() });
}
