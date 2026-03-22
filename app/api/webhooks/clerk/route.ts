import { headers } from 'next/headers';
import { NextResponse } from 'next/server';
import { Webhook } from 'svix';
import { createSupabaseAdminClient } from '@/src/lib/supabase/admin';
import { env, hasSupabaseAdminConfig } from '@/src/lib/env';

type ClerkWebhookPayload = {
  type: string;
  data: {
    id: string;
    first_name?: string | null;
    last_name?: string | null;
    created_at?: number | null;
    email_addresses?: Array<{ email_address: string }>;
    public_metadata?: Record<string, unknown>;
  };
};

function getPrimaryEmail(payload: ClerkWebhookPayload['data']) {
  return payload.email_addresses?.[0]?.email_address ?? null;
}

export async function POST(request: Request) {
  if (!env.clerkWebhookSecret || !hasSupabaseAdminConfig()) {
    return NextResponse.json(
      { error: 'Clerk webhook non configurato.' },
      { status: 503 },
    );
  }

  const payload = await request.text();
  const headerPayload = await headers();
  const svixHeaders = {
    'svix-id': headerPayload.get('svix-id') ?? '',
    'svix-signature': headerPayload.get('svix-signature') ?? '',
    'svix-timestamp': headerPayload.get('svix-timestamp') ?? '',
  };

  try {
    const webhook = new Webhook(env.clerkWebhookSecret);
    const event = webhook.verify(payload, svixHeaders) as ClerkWebhookPayload;
    const supabase = createSupabaseAdminClient();

    if (!supabase) {
      return NextResponse.json({ error: 'Supabase admin non disponibile.' }, { status: 503 });
    }

    if (event.type === 'user.deleted') {
      await supabase.from('profiles').delete().eq('id', event.data.id);
      return NextResponse.json({ ok: true });
    }

    if (event.type === 'user.created' || event.type === 'user.updated') {
      const publicMetadata = event.data.public_metadata ?? {};
      await supabase.from('profiles').upsert({
        id: event.data.id,
        email: getPrimaryEmail(event.data),
        first_name: event.data.first_name ?? null,
        last_name: event.data.last_name ?? null,
        role: typeof publicMetadata.role === 'string' ? publicMetadata.role : 'user',
        created_at: event.data.created_at
          ? new Date(event.data.created_at).toISOString()
          : new Date().toISOString(),
        updated_at: new Date().toISOString(),
      });
    }

    return NextResponse.json({ ok: true });
  } catch (error) {
    return NextResponse.json(
      {
        error: error instanceof Error ? error.message : 'Webhook Clerk non valido.',
      },
      { status: 400 },
    );
  }
}
