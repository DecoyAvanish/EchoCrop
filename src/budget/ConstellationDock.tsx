import { useEffect, useRef, useState, type MouseEvent } from 'react';
import { AnimatedTopDock } from '../shaders/animated-top-dock/AnimatedTopDock';
import { useBudget } from './store';
import type { AppPage } from './types';
import './dock-integration.css';

type Props = { onAccessibility: () => void };

export function ConstellationDock({ onAccessibility }: Props) {
  const s = useBudget();
  const [mobileOpen, setMobileOpen] = useState(false);
  const dockRef = useRef<HTMLDivElement>(null);
  const glass = s.theme === 'daybreak' || s.theme === 'contrast-light';
  const destinations: AppPage[] = s.authed
    ? ['sky', 'goals', 'insights', 'settings', 'help']
    : ['landing', 'landing', 'privacy', 'help', 'login'];
  const labels = s.authed
    ? ['Sky', 'Goals', 'Insights', 'Settings', 'Help']
    : ['Product', 'How it works', 'Privacy', 'Help', 'Log in'];

  useEffect(() => {
    dockRef.current?.querySelectorAll<HTMLButtonElement>('[data-dock-item]').forEach((button, index) => {
      button.setAttribute('aria-label', labels[index] ?? 'Navigation');
    });
    dockRef.current?.querySelector<HTMLElement>('.atd-modern__brand, .atd-glass__brand')?.setAttribute('aria-label', 'Budget Constellation home');
    dockRef.current?.querySelector<HTMLButtonElement>('.atd-modern__ghost')?.setAttribute('aria-label', 'Log in');
    dockRef.current?.querySelector<HTMLButtonElement>('.atd-modern__cta, .atd-glass__cta')?.setAttribute('aria-label', s.authed ? 'Open sky' : 'Start free');
  }, [s.authed, glass]);

  const routeDockClick = (event: MouseEvent<HTMLDivElement>) => {
    const target = event.target as HTMLElement;
    const item = target.closest<HTMLElement>('[data-dock-item]');
    if (item) {
      const items = [...event.currentTarget.querySelectorAll('[data-dock-item]')];
      const index = items.indexOf(item);
      if (index === 0 && !s.authed) document.querySelector('#preview')?.scrollIntoView({ behavior: s.motion === 'none' ? 'auto' : 'smooth' });
      else if (index === 1 && !s.authed) document.querySelector('#how')?.scrollIntoView({ behavior: s.motion === 'none' ? 'auto' : 'smooth' });
      else s.go(destinations[index] ?? (s.authed ? 'sky' : 'landing'));
      setMobileOpen(false);
      return;
    }
    if (target.closest('.atd-modern__brand, .atd-glass__brand')) s.go(s.authed ? 'sky' : 'landing');
    if (target.closest('.atd-modern__ghost')) s.go('login');
    if (target.closest('.atd-modern__cta, .atd-glass__cta')) s.go(s.authed ? 'sky' : 'signup');
  };

  return <div className={`bc-dock-shell ${glass ? 'is-glass' : 'is-modern'} ${s.authed ? 'is-authed' : 'is-public'} ${mobileOpen ? 'is-open' : ''}`}>
    <div ref={dockRef} className="bc-threeui-dock" onClickCapture={routeDockClick}>
      {glass ? <AnimatedTopDock
        variant="glass"
        particles={22}
        thickness={0.115}
        dispersion={0.050}
        specular={0.85}
        rim={0.50}
        drift={1.00}
        proximity={44}
        heightGrowth={20}
        drop={11.0}
      /> : <AnimatedTopDock
        variant="modern"
        proximity={122}
        spring={0.19}
        damping={0.70}
        widthGrowth={17}
        heightGrowth={16}
        drop={3.5}
      />}
    </div>
    <button className="bc-dock-mobile" type="button" aria-expanded={mobileOpen} onClick={() => setMobileOpen(!mobileOpen)}>{mobileOpen ? '×' : 'Menu'}</button>
    <div className="bc-dock-tools">
      <button onClick={() => s.setTheme(s.theme === 'midnight' ? 'daybreak' : 'midnight')} aria-label="Toggle theme">{s.theme === 'midnight' ? '☼' : '☾'}</button>
      <button onClick={() => s.setPaused(!s.paused)} aria-pressed={s.paused}>{s.paused ? '▶' : 'Ⅱ'}</button>
      <button className="access-button" onClick={onAccessibility} aria-label="Accessibility settings">A11y</button>
    </div>
  </div>;
}
