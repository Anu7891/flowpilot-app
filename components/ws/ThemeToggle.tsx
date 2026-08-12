'use client';
/**
 * Theme cycle: light → dark → system. The chosen mode is persisted to
 * localStorage('fp-theme') and mirrored onto <html data-theme>; the inline
 * script in app/layout.tsx applies it before first paint (no flash). In
 * `system` mode we follow the OS and react to changes live.
 */
import { useEffect, useState } from 'react';
import { Icon } from './ui';

type Mode = 'light' | 'dark' | 'system';
const ORDER: Mode[] = ['light', 'dark', 'system'];
const ICON: Record<Mode, string> = { light: 'i-sun', dark: 'i-moon', system: 'i-monitor' };
const LABEL: Record<Mode, string> = { light: 'Light', dark: 'Dark', system: 'System' };

function apply(mode: Mode) {
  const dark = mode === 'dark' || (mode === 'system' && window.matchMedia('(prefers-color-scheme: dark)').matches);
  document.documentElement.setAttribute('data-theme', dark ? 'dark' : 'light');
}

export default function ThemeToggle() {
  const [mode, setMode] = useState<Mode>('system');
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMode((localStorage.getItem('fp-theme') as Mode) || 'system');
    setMounted(true);
  }, []);

  // Follow the OS while in system mode.
  useEffect(() => {
    if (mode !== 'system') return;
    const mq = window.matchMedia('(prefers-color-scheme: dark)');
    const onChange = () => apply('system');
    mq.addEventListener('change', onChange);
    return () => mq.removeEventListener('change', onChange);
  }, [mode]);

  function cycle() {
    const next = ORDER[(ORDER.indexOf(mode) + 1) % ORDER.length];
    setMode(next);
    try { localStorage.setItem('fp-theme', next); } catch {}
    apply(next);
  }

  // Render a stable placeholder label until mounted to avoid hydration mismatch.
  return (
    <button className="side-link" onClick={cycle} title="Change theme" suppressHydrationWarning>
      <Icon name={mounted ? ICON[mode] : 'i-monitor'} /> {mounted ? LABEL[mode] : 'Theme'}
    </button>
  );
}
