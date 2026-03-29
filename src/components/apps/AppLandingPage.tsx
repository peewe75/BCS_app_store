'use client';

import { useEffect, useMemo, useState } from 'react';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useAuth, useUser } from '@clerk/nextjs';
import VideoPlaceholder from '@/src/components/VideoPlaceholder';
import { useAdminStatus } from '@/src/hooks/useAdminStatus';
import { getAppLandingContent } from '@/src/lib/app-landing';
import { getAppWorkspaceRoute } from '@/src/lib/app-routes';
import type { AppRecord, UserAppGrant } from '@/src/lib/catalog';
import { createClerkSupabaseBrowserClient, publicSupabase } from '@/src/lib/supabase/public';

import { env } from '@/src/lib/env';

function isFreeApp(app: AppRecord) {
  return app.pricing_model === 'free' || app.id === 'forf';
}

function buildSignInHref(workspaceHref: string) {
  return `/sign-in?redirect_url=${encodeURIComponent(workspaceHref)}`;
}

function buildSignUpHref(workspaceHref: string) {
  return `/sign-up?redirect_url=${encodeURIComponent(workspaceHref)}`;
}

function buildBadgeText(app: AppRecord) {
  return app.pricing_badge || app.price_label || 'Catalogo BCS AI';
}

function InnerAppLandingPage({
  app,
  getToken,
  isLoaded,
  isSignedIn,
  user,
  isAdmin,
  isLoadingAdmin,
}: {
  app: AppRecord;
  getToken: any;
  isLoaded: boolean;
  isSignedIn: boolean;
  user: any;
  isAdmin: boolean;
  isLoadingAdmin: boolean;
}) {
  const [grant, setGrant] = useState<UserAppGrant | null>(null);
  const [grantLoaded, setGrantLoaded] = useState(false);
  const [videoLightbox, setVideoLightbox] = useState(false);

  const content = useMemo(() => getAppLandingContent(app), [app]);
  const sections = content.sections ?? [];
  const benefits = content.benefits ?? [];
  const workspaceHref = useMemo(() => app.internal_route ?? getAppWorkspaceRoute(app), [app]);
  const accentColor = app.accent_color ?? '#3713ec';
  const background = app.bg_gradient ?? `linear-gradient(135deg, ${app.bg_color ?? '#F5F5F7'} 0%, #ffffff 100%)`;
  const hasAccess = app.is_internal && (isAdmin || isFreeApp(app) || Boolean(grant));

  useEffect(() => {
    let cancelled = false;

    const loadGrant = async () => {
      if (!app.is_internal || !isLoaded || !isSignedIn || !user?.id || isFreeApp(app)) {
        setGrant(null);
        setGrantLoaded(true);
        return;
      }

      const client = createClerkSupabaseBrowserClient(getToken) ?? publicSupabase;
      if (!client) {
        setGrant(null);
        setGrantLoaded(true);
        return;
      }

      const { data } = await client
        .from('user_apps')
        .select('app_id, plan, expires_at')
        .eq('user_id', user.id)
        .eq('app_id', app.id)
        .maybeSingle();

      if (!cancelled) {
        setGrant((data as UserAppGrant | null) ?? null);
        setGrantLoaded(true);
      }
    };

    void loadGrant();

    return () => {
      cancelled = true;
    };
  }, [app, getToken, isLoaded, isSignedIn, user?.id]);

  const primaryAction = useMemo(() => {
    if (!app.is_internal) {
      return {
        href: app.cta_href ?? '#',
        label: content.finalCtaLabel ?? content.primaryCtaLabel ?? app.cta_text ?? `Vai a ${app.name}`,
        external: true,
      };
    }

    if (!isLoaded || !grantLoaded || isLoadingAdmin) {
      return {
        href: workspaceHref,
        label: 'Verifico accesso...',
        external: false,
      };
    }

    if (!isSignedIn) {
      return {
        href: buildSignUpHref(workspaceHref),
        label: content.primaryCtaLabel ?? `Crea account e apri ${app.name}`,
        external: false,
      };
    }

    if (hasAccess) {
      return {
        href: workspaceHref,
        label: content.finalCtaLabel ?? `Apri ${app.name}`,
        external: false,
      };
    }

    return {
      href: workspaceHref,
      label: `Sblocca ${app.name}`,
      external: false,
    };
  }, [app, content.finalCtaLabel, content.primaryCtaLabel, grantLoaded, hasAccess, isLoaded, isLoadingAdmin, isSignedIn, workspaceHref]);

  const secondaryAction = useMemo(() => {
    if (app.is_internal && !isSignedIn) {
      return {
        href: buildSignInHref(workspaceHref),
        label: 'Hai gia un account? Accedi',
        external: false,
      };
    }

    return {
      href: '#details',
      label: content.secondaryCtaLabel ?? 'Scopri le funzionalita',
      external: false,
    };
  }, [app.is_internal, content.secondaryCtaLabel, isSignedIn, workspaceHref]);

  return (
    <main style={{ background: '#fbfbfd' }}>
      <section
        style={{
          background,
          borderBottom: '1px solid rgba(0,0,0,0.06)',
        }}
      >
        <div className="bcs-app-hero-grid" style={{ maxWidth: 1240, margin: '0 auto', padding: '48px 24px 72px' }}>
          <motion.div
            initial={{ opacity: 0, y: 24 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.6 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 28, justifyContent: 'center' }}
          >
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap', alignItems: 'center' }}>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: `${accentColor}14`,
                  color: accentColor,
                  border: `1px solid ${accentColor}24`,
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {content.eyebrow}
              </span>
              <span
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  padding: '8px 16px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.76)',
                  color: '#4b5563',
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontSize: 13,
                  fontWeight: 700,
                }}
              >
                {buildBadgeText(app)}
              </span>
            </div>

            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              <p style={{ margin: 0, color: accentColor, fontWeight: 700, fontSize: 15, letterSpacing: '0.02em' }}>
                {app.name}
              </p>
              <h1
                style={{
                  margin: 0,
                  fontSize: 'clamp(40px, 6vw, 72px)',
                  lineHeight: 0.95,
                  maxWidth: 760,
                }}
              >
                {content.headline}
              </h1>
              <p
                style={{
                  margin: 0,
                  maxWidth: 720,
                  color: '#4b5563',
                  fontSize: 'clamp(18px, 2vw, 22px)',
                  lineHeight: 1.55,
                }}
              >
                {content.subheadline}
              </p>
            </div>

            <p
              style={{
                margin: 0,
                maxWidth: 620,
                color: '#111827',
                fontSize: 14,
                lineHeight: 1.7,
                fontWeight: 600,
              }}
            >
              {content.trustLine}
            </p>

            <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
              {primaryAction.external ? (
                <a
                  href={primaryAction.href}
                  target="_blank"
                  rel="noopener noreferrer"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 220,
                    padding: '16px 28px',
                    borderRadius: 999,
                    background: accentColor,
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    boxShadow: `0 16px 40px ${accentColor}2e`,
                  }}
                >
                  {primaryAction.label}
                </a>
              ) : (
                <Link
                  href={primaryAction.href}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 220,
                    padding: '16px 28px',
                    borderRadius: 999,
                    background: accentColor,
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    boxShadow: `0 16px 40px ${accentColor}2e`,
                  }}
                >
                  {primaryAction.label}
                </Link>
              )}

              <Link
                href={secondaryAction.href}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  minWidth: 220,
                  padding: '16px 28px',
                  borderRadius: 999,
                  background: 'rgba(255,255,255,0.7)',
                  color: '#111827',
                  textDecoration: 'none',
                  border: '1px solid rgba(0,0,0,0.08)',
                  fontWeight: 700,
                }}
              >
                {secondaryAction.label}
              </Link>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.7, delay: 0.1 }}
            style={{ display: 'flex', flexDirection: 'column', gap: 14 }}
          >
            <div
              onClick={app.video_src ? () => setVideoLightbox(true) : undefined}
              style={{
                width: '100%',
                padding: 18,
                borderRadius: 28,
                background: 'rgba(255,255,255,0.65)',
                border: '1px solid rgba(255,255,255,0.6)',
                boxShadow: '0 32px 80px rgba(15, 23, 42, 0.14)',
                cursor: app.video_src ? 'zoom-in' : 'default',
              }}
              title={app.video_src ? 'Clicca per ingrandire' : undefined}
            >
              <VideoPlaceholder
                videoSrc={app.video_src ?? undefined}
                posterSrc={app.poster_src ?? undefined}
                accentColor={accentColor}
                title={`Preview ${app.name}`}
              />
            </div>

            {app.video_src && (
              <a
                href={app.id === 'ugc' ? '/video/ugc-video.mp4' : app.video_src}
                download={app.id === 'ugc' ? 'ugc-video.mp4' : undefined}
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: 8,
                  padding: '13px 20px',
                  borderRadius: 14,
                  background: accentColor,
                  color: '#fff',
                  fontWeight: 700,
                  fontSize: 14,
                  textDecoration: 'none',
                  boxShadow: `0 4px 16px ${accentColor}33`,
                }}
              >
                <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden>
                  <path d="M8 2v8M8 10l-3-3M8 10l3-3M2 13h12" stroke="white" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"/>
                </svg>
                {app.id === 'ugc' ? 'Scarica Video UGC' : 'Scarica video demo d\'uso'}
              </a>
            )}
          </motion.div>
        </div>
      </section>

      <section id="details" style={{ padding: '72px 24px 40px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gap: 20 }}>
          <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <p style={{ margin: 0, color: accentColor, fontWeight: 700, fontSize: 14 }}>
              Perche esiste
            </p>
            <h2 style={{ margin: 0, fontSize: 'clamp(30px, 4vw, 48px)', lineHeight: 1.04, maxWidth: 720 }}>
              {content.problemTitle}
            </h2>
          </div>
          <p style={{ margin: 0, color: '#4b5563', fontSize: 18, lineHeight: 1.8, maxWidth: 760 }}>
            {content.problemBody}
          </p>
        </div>
      </section>

      <section style={{ padding: '0 24px 56px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gap: 0 }}>
          {sections.map((section, index) => (
            <motion.article
              key={section.id}
              initial={{ opacity: 0, y: 24 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, amount: 0.2 }}
              transition={{ duration: 0.5, delay: index * 0.04 }}
              style={{
                borderTop: '1px solid rgba(0,0,0,0.08)',
                paddingTop: 36,
                paddingBottom: 36,
                display: 'grid',
                gap: 20,
              }}
            >
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 20, flexWrap: 'wrap' }}>
                <span style={{ color: accentColor, fontSize: 13, fontWeight: 700, whiteSpace: 'nowrap' }}>
                  {String(index + 1).padStart(2, '0')}
                </span>
                <h3 style={{ margin: 0, fontSize: 'clamp(22px, 3vw, 32px)', lineHeight: 1.1 }}>
                  {section.title}
                </h3>
              </div>
              <div style={{ display: 'grid', gap: 18 }}>
                <p style={{ margin: 0, color: '#4b5563', fontSize: 16, lineHeight: 1.8, maxWidth: 760 }}>
                  {section.body}
                </p>
                {section.bullets && section.bullets.length > 0 && (
                  <div className="bcs-app-summary-grid">
                    {section.bullets.map((bullet) => (
                      <div
                        key={bullet}
                        style={{
                          padding: '18px 20px',
                          borderRadius: 20,
                          background: `${accentColor}0b`,
                          border: `1px solid ${accentColor}18`,
                          color: '#111827',
                          lineHeight: 1.6,
                        }}
                      >
                        {bullet}
                      </div>
                    ))}
                  </div>
                )}
              </div>
            </motion.article>
          ))}
        </div>
      </section>

      <section style={{ padding: '8px 24px 72px' }}>
        <div style={{ maxWidth: 1240, margin: '0 auto', display: 'grid', gap: 32 }}>
          <div style={{ display: 'grid', gap: 12 }}>
            <p style={{ margin: 0, color: accentColor, fontWeight: 700, fontSize: 14 }}>
              {content.benefitsTitle}
            </p>
            <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.04, maxWidth: 640 }}>
              Tutto quello che ti serve, in un solo strumento.
            </h2>
          </div>
          <div className="bcs-app-summary-grid">
            {benefits.map((benefit) => (
              <div
                key={benefit}
                style={{
                  padding: '20px 22px',
                  borderRadius: 22,
                  background: '#fff',
                  border: '1px solid rgba(0,0,0,0.08)',
                  boxShadow: '0 14px 32px rgba(15, 23, 42, 0.06)',
                  lineHeight: 1.7,
                }}
              >
                {benefit}
              </div>
            ))}
          </div>
        </div>
      </section>

      <section style={{ padding: '0 24px 88px' }}>
        <div
          style={{
            maxWidth: 1240,
            margin: '0 auto',
            borderRadius: 32,
            background: '#0f172a',
            color: '#fff',
            padding: '40px 28px',
          }}
        >
          <div className="bcs-app-detail-grid" style={{ alignItems: 'start' }}>
            <div style={{ display: 'grid', gap: 14 }}>
              <p style={{ margin: 0, color: '#93c5fd', fontWeight: 700, fontSize: 14 }}>
                {content.audienceTitle}
              </p>
              <h2 style={{ margin: 0, fontSize: 'clamp(28px, 4vw, 44px)', lineHeight: 1.02 }}>
                {content.closingHeadline}
              </h2>
              <p style={{ margin: 0, color: 'rgba(255,255,255,0.74)', lineHeight: 1.8 }}>
                {content.closingBody}
              </p>
            </div>

            <div style={{ display: 'grid', gap: 18 }}>
              <div style={{ display: 'grid', gap: 10 }}>
                <p style={{ margin: 0, color: '#93c5fd', fontWeight: 700, fontSize: 13 }}>
                  {content.audienceTitle}
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.8)', lineHeight: 1.8 }}>
                  {content.audienceBody}
                </p>
              </div>
              <div style={{ display: 'grid', gap: 10 }}>
                <p style={{ margin: 0, color: '#93c5fd', fontWeight: 700, fontSize: 13 }}>
                  {content.pricingTitle}
                </p>
                <p style={{ margin: 0, color: '#fff', fontSize: 20, fontWeight: 700 }}>
                  {content.pricingLine}
                </p>
                <p style={{ margin: 0, color: 'rgba(255,255,255,0.7)', lineHeight: 1.7 }}>
                  {content.supportLine}
                </p>
              </div>
              <div style={{ display: 'flex', gap: 14, flexWrap: 'wrap' }}>
                {primaryAction.external ? (
                  <a
                    href={primaryAction.href}
                    target="_blank"
                    rel="noopener noreferrer"
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 220,
                      padding: '16px 28px',
                      borderRadius: 999,
                      background: accentColor,
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    {primaryAction.label}
                  </a>
                ) : (
                  <Link
                    href={primaryAction.href}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      minWidth: 220,
                      padding: '16px 28px',
                      borderRadius: 999,
                      background: accentColor,
                      color: '#fff',
                      textDecoration: 'none',
                      fontWeight: 700,
                    }}
                  >
                    {primaryAction.label}
                  </Link>
                )}
                <Link
                  href="/"
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    minWidth: 220,
                    padding: '16px 28px',
                    borderRadius: 999,
                    background: 'transparent',
                    color: '#fff',
                    textDecoration: 'none',
                    fontWeight: 700,
                    border: '1px solid rgba(255,255,255,0.18)',
                  }}
                >
                  Torna alla landing
                </Link>
              </div>
            </div>
          </div>
        </div>
      </section>

      {videoLightbox && app.video_src && (
        <div
          onClick={() => setVideoLightbox(false)}
          style={{
            position: 'fixed', inset: 0, zIndex: 9999,
            background: 'rgba(0,0,0,0.88)',
            display: 'flex', alignItems: 'center', justifyContent: 'center',
            cursor: 'zoom-out',
          }}
        >
          <div
            onClick={(e) => e.stopPropagation()}
            style={{
              width: '82vw', maxWidth: 960,
              borderRadius: 18, overflow: 'hidden',
              boxShadow: '0 40px 100px rgba(0,0,0,0.6)',
            }}
          >
            <video
              src={app.video_src}
              controls
              autoPlay
              style={{ width: '100%', display: 'block' }}
            />
          </div>
          <button
            onClick={() => setVideoLightbox(false)}
            style={{
              position: 'absolute', top: 20, right: 20,
              background: 'rgba(255,255,255,0.12)',
              border: '1px solid rgba(255,255,255,0.25)',
              color: '#fff', borderRadius: '50%',
              width: 40, height: 40, fontSize: 18,
              cursor: 'pointer', display: 'flex',
              alignItems: 'center', justifyContent: 'center',
            }}
          >
            ✕
          </button>
        </div>
      )}
    </main>
  );
}

function ClerkAppLandingPage({ app }: { app: AppRecord }) {
  const { getToken } = useAuth();
  const { isLoaded, isSignedIn, user } = useUser();
  const { isAdmin, isLoadingAdmin } = useAdminStatus();

  return (
    <InnerAppLandingPage
      app={app}
      getToken={getToken}
      isLoaded={isLoaded}
      isSignedIn={!!isSignedIn}
      user={user}
      isAdmin={isAdmin}
      isLoadingAdmin={isLoadingAdmin}
    />
  );
}

export default function AppLandingPage({ app }: { app: AppRecord }) {
  // If Clerk is not configured, load without auth context
  if (!env.clerkPublishableKey) {
    return (
      <InnerAppLandingPage
        app={app}
        getToken={() => null as any}
        isLoaded={true}
        isSignedIn={false}
        user={null}
        isAdmin={false}
        isLoadingAdmin={false}
      />
    );
  }

  return <ClerkAppLandingPage app={app} />;
}
