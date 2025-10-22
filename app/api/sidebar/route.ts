import { createHmac, timingSafeEqual } from 'crypto';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  const verificationToken = process.env.NOTION_WEBHOOK_SECERT_TOKEN;

  if (!verificationToken) {
    console.error('Verification token is missing');
    return NextResponse.json({ error: 'Internal Server Error' }, { status: 500 });
  }

  const body = await request.json();

  const signature = `sha256=${createHmac('sha256', verificationToken).update(JSON.stringify(body)).digest('hex')}`;
  const notionSignature = request.headers.get('X-Notion-Signature');

  const isTrustedPayload =
    signature && timingSafeEqual(Buffer.from(signature), Buffer.from(notionSignature || ''));

  if (!isTrustedPayload) {
    console.warn('Invalid signature - ignoring request');
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }

  console.log(body);

  return NextResponse.json({ success: true });
}
