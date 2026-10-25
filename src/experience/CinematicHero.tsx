import { Component, lazy, Suspense, useCallback, useEffect, useRef, useState, type ErrorInfo, type ReactNode } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { validateManifest, type ExperienceManifest } from './manifest';
import type { SceneDriver } from './ArchitectureScene';

const ArchitectureScene = lazy(() => import('./ArchitectureScene'));
gsap.registerPlugin(ScrollTrigger);
class SceneBoundary extends Component<{ children: ReactNode; onFailure: () => void }, { failed: boolean }> {
  state = { failed: false };
  static getDerivedStateFromError() { return { failed: true }; }
  componentDidCatch(_error: Error, _info: ErrorInfo) { this.props.onFailure(); }
  render() { return this.state.failed ? null : this.props.children; }
}
export default function CinematicHero() {
  const layer = useRef<HTMLDivElement>(null);
  const driver = useRef<SceneDriver>({ progress: 0 });
  const timeline = useRef<gsap.core.Timeline | undefined>(undefined);
  const [manifest, setManifest] = useState<ExperienceManifest>();
  const [ready, setReady] = useState(false);
  const [failed, setFailed] = useState(false);
  const onReady = useCallback(() => setReady(true), []);
  const onFailure = useCallback(() => { setReady(false); setFailed(true); }, []);
  useEffect(() => {
    const abort = new AbortController();
    const reduced = matchMedia('(prefers-reduced-motion: reduce)');
    const memory = (navigator as Navigator & {deviceMemory?:number}).deviceMemory;
    const saveData = (navigator as Navigator & {connection?:{saveData?:boolean}}).connection?.saveData;
    const eligible = () => !reduced.matches && innerWidth >= 1024 && (navigator.hardwareConcurrency || 8) >= 4 && (memory === undefined || memory >= 4) && !saveData;
    const load = () => {
      if (!eligible()) { setManifest(undefined); setReady(false); return; }
      fetch('/experience/manifest.json', { signal: abort.signal, cache: 'no-cache' })
        .then(response => { if (!response.ok) throw new Error('Manifest unavailable'); return response.json(); })
        .then(value => { const result = validateManifest(value); if (!abort.signal.aborted && eligible() && result.ready) setManifest(result.manifest); })
        .catch(() => { /* The real company photograph is the intentional fallback. */ });
    };
    load(); reduced.addEventListener('change', load, { signal: abort.signal });
    return () => abort.abort();
  }, []);
  useEffect(() => {
    if (!ready || !manifest || failed || !layer.current) return;
    const hero = layer.current.closest<HTMLElement>('.hero');
    if (!hero) return;
    hero.dataset.cinematicReady = 'true';
    const context = gsap.context(() => {
      timeline.current = gsap.timeline({ scrollTrigger: { trigger: hero, start: 'top top', end: () => `+=${Math.min(innerHeight * 2, 1800)}`, pin: true, scrub: true, invalidateOnRefresh: true,
        onUpdate: self => { driver.current.progress = self.progress; driver.current.invalidate?.(); },
      }}).to(hero.querySelector('.hero-copy'), { opacity: 0, y: -20, duration: 0.25, ease: 'none' }, 0.75);
      ScrollTrigger.refresh();
    }, hero);
    const visible = new IntersectionObserver(entries => { if (entries[0].isIntersecting) driver.current.invalidate?.(); });
    visible.observe(hero);
    return () => { visible.disconnect(); context.revert(); timeline.current = undefined; delete hero.dataset.cinematicReady; };
  }, [ready, manifest, failed]);
  const skip = (event: React.MouseEvent<HTMLAnchorElement>) => {
    const end = timeline.current?.scrollTrigger?.end;
    if (end === undefined) return;
    event.preventDefault();
    window.scrollTo({ top: end + 1, behavior: 'instant' });
    document.querySelector<HTMLElement>('#services h2')?.focus({ preventScroll: true });
  };
  if (!manifest || failed) return null;
  return <div ref={layer} className="cinematic-layer"><SceneBoundary onFailure={onFailure}><Suspense fallback={null}><ArchitectureScene manifest={manifest} driver={driver.current} onReady={onReady}/></Suspense></SceneBoundary>{ready && <a className="experience-skip" href="#services" onClick={skip}>Skip intro ↗</a>}<span className="sr-only" role="status">{ready ? 'Architectural scene loaded. Scroll to explore or skip to services.' : 'Loading the architectural scene. The homepage remains available.'}</span></div>;
}
