'use client';

import { useEffect, useState } from 'react';
import { useAuth } from '@clerk/nextjs';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

type UgcVideo = {
  id: string;
  product_image_url: string | null;
  video_url: string | null;
  status: string | null;
  created_at: string;
};

export default function UgcWorkspace() {
  const { getToken, userId } = useAuth();
  const [videos, setVideos] = useState<UgcVideo[]>([]);

  useEffect(() => {
    let cancelled = false;

    const load = async () => {
      if (!userId) {
        return;
      }

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
      if (!client) {
        return;
      }

      const { data } = await client
        .from('ugc_videos')
        .select('id, product_image_url, video_url, status, created_at')
        .eq('user_id', userId)
        .order('created_at', { ascending: false });

      if (!cancelled) {
        setVideos((data as UgcVideo[] | null) ?? []);
      }
    };

    void load();

    return () => {
      cancelled = true;
    };
  }, [getToken, userId]);

  return (
    <div style={{ display: 'grid', gap: 20 }}>
      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <p style={{ margin: '0 0 8px', color: '#ec4899', fontWeight: 700 }}>UGC Ad Creator</p>
        <h1 style={{ margin: '0 0 10px', fontSize: 34 }}>Modulo base integrato</h1>
        <p style={{ margin: 0, color: '#6E6E73', lineHeight: 1.6 }}>
          UGC non ha utenti legacy, quindi il cutover e pulito. Questa pagina e pronta per leggere e salvare job in `ugc_videos`.
        </p>
      </section>

      <section style={{ padding: 28, borderRadius: 24, background: '#fff', border: '1px solid rgba(0,0,0,0.06)' }}>
        <h2 style={{ marginTop: 0 }}>Stato job recenti</h2>
        {videos.length === 0 ? (
          <div style={{ padding: 20, borderRadius: 18, background: '#FDF2F8', color: '#9D174D' }}>
            Nessun job presente. Il generatore video vero verra collegato qui senza migrazione dati pregressa.
          </div>
        ) : (
          <div style={{ display: 'grid', gap: 12 }}>
            {videos.map((video) => (
              <article key={video.id} style={{ padding: 18, borderRadius: 18, background: '#F8FAFC' }}>
                <strong>{video.status ?? 'pending'}</strong>
                <div style={{ color: '#6E6E73', marginTop: 6 }}>{new Date(video.created_at).toLocaleString('it-IT')}</div>
              </article>
            ))}
          </div>
        )}
      </section>
    </div>
  );
}
