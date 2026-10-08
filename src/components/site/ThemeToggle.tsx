'use client';

import {Moon, Sun} from 'lucide-react';
import {useEffect, useState} from 'react';

type Theme = 'light' | 'dark';

function applyTheme(theme: Theme) {
  document.documentElement.dataset.theme = theme;
  document.documentElement.style.colorScheme = theme;
  window.localStorage.setItem('swa-theme', theme);
  window.dispatchEvent(new CustomEvent<Theme>('swa-theme-change', {detail: theme}));
}

export function ThemeToggle() {
  const [theme, setTheme] = useState<Theme>('light');

  useEffect(() => {
    const current = document.documentElement.dataset.theme === 'dark' ? 'dark' : 'light';
    setTheme(current);
    const sync = (event: Event) => setTheme((event as CustomEvent<Theme>).detail);
    window.addEventListener('swa-theme-change', sync);
    return () => window.removeEventListener('swa-theme-change', sync);
  }, []);

  const next = theme === 'dark' ? 'light' : 'dark';
  const label = theme === 'dark' ? 'Usa sfondo chiaro' : 'Usa sfondo scuro';

  return <button type="button" className="swa-theme-toggle" aria-label={label} title={label} onClick={() => {
    applyTheme(next);
    setTheme(next);
  }}>{theme === 'dark' ? <Sun size={17} aria-hidden="true"/> : <Moon size={17} aria-hidden="true"/>}</button>;
}
