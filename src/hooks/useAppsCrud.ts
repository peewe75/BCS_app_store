import { supabase } from '../lib/supabase';
import type { App } from './useApps';

/* ─── Types ───────────────────────────────────────────────────── */
export type AppInsert = Omit<App, 'created_at'>;
export type AppUpdate = Partial<AppInsert> & { id: string };

/* ─── CRUD Functions ──────────────────────────────────────────── */

export async function createApp(app: AppInsert): Promise<{ data: App | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase non configurato' };

  const { data, error } = await supabase
    .from('apps')
    .insert(app)
    .select()
    .single();

  return {
    data: data as App | null,
    error: error?.message ?? null,
  };
}

export async function updateApp(update: AppUpdate): Promise<{ data: App | null; error: string | null }> {
  if (!supabase) return { data: null, error: 'Supabase non configurato' };

  const { id, ...rest } = update;
  const { data, error } = await supabase
    .from('apps')
    .update(rest)
    .eq('id', id)
    .select()
    .single();

  return {
    data: data as App | null,
    error: error?.message ?? null,
  };
}

export async function deleteApp(id: string): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase non configurato' };

  const { error } = await supabase
    .from('apps')
    .delete()
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function toggleAppActive(id: string, isActive: boolean): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase non configurato' };

  const { error } = await supabase
    .from('apps')
    .update({ is_active: isActive })
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function toggleAppComingSoon(id: string, isComingSoon: boolean): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase non configurato' };

  const { error } = await supabase
    .from('apps')
    .update({ is_coming_soon: isComingSoon })
    .eq('id', id);

  return { error: error?.message ?? null };
}

export async function reorderApp(id: string, newSortOrder: number): Promise<{ error: string | null }> {
  if (!supabase) return { error: 'Supabase non configurato' };

  const { error } = await supabase
    .from('apps')
    .update({ sort_order: newSortOrder })
    .eq('id', id);

  return { error: error?.message ?? null };
}
