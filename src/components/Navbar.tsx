import React, { useEffect, useState } from 'react';
import { Link, useNavigate, useLocation } from 'react-router-dom';
import { motion, AnimatePresence } from 'framer-motion';
import Logo from './Logo';

const Navbar: React.FC = () => {
  const [scrolled, setScrolled] = useState(false);
  const [menuOpen, setMenuOpen] = useState(false);
  const navigate = useNavigate();
  const location = useLocation();

  // Solo sulla landing "/" il testo è bianco finché non si scrolla
  const isLanding = location.pathname === '/';

  useEffect(() => {
    const handleScroll = () => setScrolled(window.scrollY > 50);
    window.addEventListener('scroll', handleScroll, { passive: true });
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) setMenuOpen(false);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  const scrollTo = (id: string) => {
    setMenuOpen(false);
    const el = document.getElementById(id);
    if (el) {
      el.scrollIntoView({ behavior: 'smooth' });
    } else {
      navigate('/');
      setTimeout(() => {
        document.getElementById(id)?.scrollIntoView({ behavior: 'smooth' });
      }, 400);
    }
  };

  // Testo bianco solo sulla landing quando non scrollata, scuro in tutte le altre pagine
  const linkColor = isLanding && !scrolled ? 'rgba(255,255,255,0.88)' : '#1D1D1F';

  return (
    <>
      <header
        style={{
          position: 'fixed',
          top: 0,
          left: 0,
          right: 0,
          zIndex: 1000,
          background: (!isLanding || scrolled) ? 'rgba(255,255,255,0.88)' : 'transparent',
          backdropFilter: (!isLanding || scrolled) ? 'blur(24px) saturate(180%)' : 'none',
          WebkitBackdropFilter: (!isLanding || scrolled) ? 'blur(24px) saturate(180%)' : 'none',
          borderBottom: (!isLanding || scrolled) ? '1px solid rgba(0,0,0,0.08)' : '1px solid transparent',
          boxShadow: (!isLanding || scrolled) ? '0 1px 20px rgba(0,0,0,0.06)' : 'none',
          transition: 'background 0.35s ease, border-color 0.35s ease, box-shadow 0.35s ease',
        }}
      >
        <div
          style={{
            maxWidth: '1200px',
            margin: '0 auto',
            padding: '0 24px',
            height: '64px',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
          }}
        >
          {/* Logo */}
          <Link to="/" style={{ textDecoration: 'none' }} aria-label="BCS AI Home">
            <Logo variant={(!isLanding || scrolled) ? 'dark' : 'light'} size="md" />
          </Link>

          {/* Center nav — desktop */}
          <nav style={{ display: 'flex', gap: '4px' }} className="bcs-desktop-nav">
            {[
              { label: 'Prodotti', target: 'products' },
              { label: 'Prezzi', target: 'pricing' },
            ].map(({ label, target }) => (
              <button
                key={target}
                onClick={() => scrollTo(target)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '7px 16px',
                  borderRadius: '100px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '14px',
                  fontWeight: 500,
                  color: linkColor,
                  letterSpacing: '-0.01em',
                  transition: 'color 0.2s ease, background 0.2s ease',
                }}
                onMouseEnter={(e) => {
                  (e.currentTarget).style.background = scrolled
                    ? 'rgba(0,0,0,0.06)'
                    : 'rgba(255,255,255,0.12)';
                }}
                onMouseLeave={(e) => {
                  (e.currentTarget).style.background = 'transparent';
                }}
              >
                {label}
              </button>
            ))}
          </nav>

          {/* Right CTA — desktop */}
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }} className="bcs-desktop-nav">
            <Link
              to="/login"
              style={{
                textDecoration: 'none',
                padding: '7px 16px',
                borderRadius: '100px',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 500,
                color: linkColor,
                letterSpacing: '-0.01em',
                transition: 'color 0.2s ease',
              }}
            >
              Accedi
            </Link>
            <Link
              to="/signup"
              style={{
                textDecoration: 'none',
                padding: '8px 20px',
                borderRadius: '100px',
                background: '#3713ec',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontSize: '14px',
                fontWeight: 600,
                letterSpacing: '-0.01em',
                boxShadow: '0 2px 12px rgba(55,19,236,0.35)',
                transition: 'opacity 0.2s ease, transform 0.2s ease',
                display: 'inline-block',
              }}
              onMouseEnter={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '0.85';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(-1px)';
              }}
              onMouseLeave={(e) => {
                (e.currentTarget as HTMLAnchorElement).style.opacity = '1';
                (e.currentTarget as HTMLAnchorElement).style.transform = 'translateY(0)';
              }}
            >
              Inizia Gratis
            </Link>
          </div>

          {/* Mobile hamburger */}
          <button
            onClick={() => setMenuOpen((v) => !v)}
            aria-label={menuOpen ? 'Chiudi menu' : 'Apri menu'}
            className="bcs-mobile-nav"
            style={{
              background: 'none',
              border: 'none',
              cursor: 'pointer',
              padding: '8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '5px',
              alignItems: 'flex-end',
            }}
          >
            <motion.span
              animate={menuOpen ? { rotate: 45, y: 7, width: '22px' } : { rotate: 0, y: 0, width: '22px' }}
              style={{ display: 'block', height: '2px', background: linkColor, borderRadius: '2px', transformOrigin: 'center' }}
            />
            <motion.span
              animate={menuOpen ? { opacity: 0, scaleX: 0 } : { opacity: 1, scaleX: 1 }}
              style={{ display: 'block', width: '15px', height: '2px', background: linkColor, borderRadius: '2px' }}
            />
            <motion.span
              animate={menuOpen ? { rotate: -45, y: -7, width: '22px' } : { rotate: 0, y: 0, width: '22px' }}
              style={{ display: 'block', height: '2px', background: linkColor, borderRadius: '2px', transformOrigin: 'center' }}
            />
          </button>
        </div>
      </header>

      {/* Mobile dropdown */}
      <AnimatePresence>
        {menuOpen && (
          <motion.div
            key="mobile-menu"
            initial={{ opacity: 0, y: -8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.18 }}
            style={{
              position: 'fixed',
              top: '64px',
              left: 0,
              right: 0,
              zIndex: 999,
              background: 'rgba(255,255,255,0.97)',
              backdropFilter: 'blur(24px)',
              borderBottom: '1px solid rgba(0,0,0,0.08)',
              padding: '12px 16px 20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
            }}
          >
            {[{ label: 'Prodotti', target: 'products' }, { label: 'Prezzi', target: 'pricing' }].map(({ label, target }) => (
              <button
                key={target}
                onClick={() => scrollTo(target)}
                style={{
                  background: 'none',
                  border: 'none',
                  cursor: 'pointer',
                  padding: '12px 16px',
                  borderRadius: '12px',
                  fontFamily: 'var(--font-display)',
                  fontSize: '16px',
                  fontWeight: 500,
                  color: '#1D1D1F',
                  textAlign: 'left',
                }}
              >
                {label}
              </button>
            ))}
            <div style={{ height: '1px', background: 'rgba(0,0,0,0.07)', margin: '8px 0' }} />
            <Link
              to="/login"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none',
                padding: '12px 16px',
                borderRadius: '12px',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 500,
                color: '#1D1D1F',
                display: 'block',
              }}
            >
              Accedi
            </Link>
            <Link
              to="/signup"
              onClick={() => setMenuOpen(false)}
              style={{
                textDecoration: 'none',
                padding: '14px 16px',
                borderRadius: '12px',
                background: '#3713ec',
                color: '#FFFFFF',
                fontFamily: 'var(--font-display)',
                fontSize: '16px',
                fontWeight: 600,
                textAlign: 'center',
                marginTop: '4px',
                display: 'block',
              }}
            >
              Inizia Gratis
            </Link>
          </motion.div>
        )}
      </AnimatePresence>
    </>
  );
};

export default Navbar;
