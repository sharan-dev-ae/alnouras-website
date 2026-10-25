import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import Lenis from 'lenis';
import 'lenis/dist/lenis.css';

gsap.registerPlugin(ScrollTrigger);
let openingPlayed = false;

/** Owns every cinematic effect; reverting restores readable server-rendered content. */
export function initMotion(signal: AbortSignal) {
  const media = gsap.matchMedia();
  const originalHeadings = new Map<HTMLElement, string>();
  const dividers: HTMLElement[] = [];
  let disposed = false;
  document.documentElement.classList.add('motion-ready');

  document.querySelectorAll<HTMLElement>('main h2').forEach(heading => {
    originalHeadings.set(heading, heading.innerHTML);
    const lines = heading.innerHTML.split(/<br\s*\/?\s*>/i);
    heading.innerHTML = lines.map(line => `<span class="text-mask"><span class="text-line">${line}</span></span>`).join('');
  });
  document.querySelectorAll<HTMLElement>('.section-heading').forEach(heading => {
    const divider = document.createElement('span');
    divider.className = 'section-divider'; divider.setAttribute('aria-hidden', 'true');
    heading.append(divider); dividers.push(divider);
  });

  media.add({ motion: '(prefers-reduced-motion: no-preference)', desktop: '(min-width: 1024px) and (hover: hover) and (pointer: fine)' }, context => {
    const { motion, desktop } = context.conditions!;
    if (!motion) return;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const capable = (navigator.hardwareConcurrency || 8) >= 4 && (memory === undefined || memory >= 4);
    const localCleanup: Array<() => void> = [];
    let activeContext = true;
    let lenis: Lenis | undefined;
    if (desktop && capable) {
      lenis = new Lenis({ lerp: 0.1, smoothWheel: true, wheelMultiplier: 0.92, syncTouch: false, anchors: { offset: -72 }, prevent: node => Boolean(node.closest('[data-lenis-prevent]')) });
      lenis.on('scroll', ScrollTrigger.update);
      const tick = (seconds: number) => lenis?.raf(seconds * 1000);
      gsap.ticker.add(tick);
      const overlay = (event: Event) => { if ((event as CustomEvent<{ open: boolean }>).detail.open) lenis?.stop(); else lenis?.start(); };
      document.addEventListener('alnouras:overlay', overlay, { signal });
      document.documentElement.classList.add('smooth-enabled');
      localCleanup.push(() => { document.removeEventListener('alnouras:overlay', overlay); gsap.ticker.remove(tick); lenis?.destroy(); document.documentElement.classList.remove('smooth-enabled'); });
    }

    if (!openingPlayed && scrollY < 80) {
      openingPlayed = true;
      const intro = gsap.timeline({ defaults: { ease: 'power3.out' } });
      intro.fromTo('.hero-image', { clipPath: 'inset(0% 0% 100% 0%)' }, { clipPath: 'inset(0% 0% 0% 0%)', duration: 1.25 })
        .fromTo('.hero-image img', { scale: 1.09 }, { scale: 1, duration: 1.9 }, 0)
        .from('.hero-eyebrow', { opacity: 0, x: -15, duration: 0.65 }, 0.35)
        .from('.hero-line>span', { yPercent: 112, duration: 1, stagger: 0.14 }, 0.48)
        .from('.hero-copy>p', { opacity: 0, y: 10, duration: 0.8 }, 0.98)
        .from('.hero-actions', { opacity: 0, y: 8, duration: 0.75 }, 1.1)
        .from('.hero-assurances', { opacity: 0, duration: 0.6 }, 1.3)
        .from('.nav-inner', { opacity: 0, y: -8, duration: 0.8 }, 0.8)
        .from('.hero-scroll,.hero-caption,.hero-edge-label', { opacity: 0, duration: 0.8 }, 1.4);
    }
    if (desktop && capable) gsap.to('.hero-image img', { yPercent: 5, ease: 'none', scrollTrigger: { trigger: '.hero', start: 'top top', end: 'bottom top', scrub: 0.5 } });

    const revealTargets = Array.from(new Set(gsap.utils.toArray<HTMLElement>('.reveal,.section-heading,.compact-heading,.company-intro-copy,.company-intro-visual,.service-overview-card,.service-visual-stage,.service-choices,.coverage-map-static,.fleet-compact-media,.fleet-compact-card,.equipment-stage,.equipment-selector,.about-visual,.about-copy,.contact-copy,.enquiry-form,.value-title,.value-feature')));
    revealTargets.forEach((target, index) => gsap.set(target, { opacity: 0, x: index % 2 === 0 ? -24 : 24, y: 14, force3D: true }));
    const revealObserver = new IntersectionObserver(entries => entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      revealObserver.unobserve(entry.target);
      const targetIndex = revealTargets.indexOf(entry.target as HTMLElement);
      gsap.to(entry.target, { opacity: 1, x: 0, y: 0, force3D: true, duration: 0.9, delay: (targetIndex % 3) * 0.045, ease: 'power3.out', overwrite: true, clearProps: 'transform' });
    }), { rootMargin: '0px 0px -10% 0px', threshold: 0.08 });
    revealTargets.forEach(target => revealObserver.observe(target));
    localCleanup.push(() => { revealObserver.disconnect(); gsap.killTweensOf(revealTargets); gsap.set(revealTargets, { clearProps: 'opacity,transform' }); });

    if (desktop && capable) document.querySelectorAll<HTMLElement>('.operation-card').forEach(card => {
      const image = card.querySelector('.operation-image');
      if (image) gsap.fromTo(image, { yPercent: -3 }, { yPercent: 3, ease: 'none', scrollTrigger: { trigger: card, start: 'top bottom', end: 'bottom top', scrub: 0.6 } });
    });

    const story = document.querySelector<HTMLElement>('[data-fleet-story]');
    const chapters = gsap.utils.toArray<HTMLElement>('[data-fleet-chapter]');
    const frames = gsap.utils.toArray<HTMLElement>('[data-fleet-image]');
    if (story && desktop && capable && innerHeight >= 650) {
      story.classList.add('is-pinned-story');
      gsap.set(chapters.slice(1), { autoAlpha: 0, y: 16 });
      gsap.set(frames.slice(1), { autoAlpha: 0, scale: 1.035 });
      const storyTimeline = gsap.timeline({ scrollTrigger: { trigger: story, start: 'top 110px', end: () => `+=${Math.min(innerHeight * 0.9, 760)}`, pin: true, scrub: 0.55, invalidateOnRefresh: true,
        onUpdate: self => {
          const active = self.progress < 0.28 ? 0 : self.progress < 0.68 ? 1 : 2;
          chapters.forEach((chapter, index) => chapter.setAttribute('aria-hidden', String(index !== active)));
          frames.forEach((frame, index) => frame.setAttribute('aria-hidden', String(index !== active)));
          document.querySelectorAll('[data-fleet-tab]').forEach((tab, index) => tab.classList.toggle('active', index === active));
          const step = document.querySelector('#fleet-step'); if (step) step.textContent = String(active + 1).padStart(2, '0');
        }
      }});
      storyTimeline.to({}, { duration: 0.2 });
      for (let index = 1; index < chapters.length; index++) {
        const position = index === 1 ? 0.3 : 0.7;
        storyTimeline.to(chapters[index - 1], { autoAlpha: 0, y: -12, duration: 0.12 }, position)
          .to(frames[index], { autoAlpha: 1, scale: 1, duration: 0.22, ease: 'power2.out' }, position)
          .to(chapters[index], { autoAlpha: 1, y: 0, duration: 0.18 }, position + 0.04);
      }
      storyTimeline.to({}, { duration: 0.14 });
      localCleanup.push(() => { story.classList.remove('is-pinned-story'); chapters.forEach(chapter => chapter.removeAttribute('aria-hidden')); frames.forEach((frame, index) => frame.setAttribute('aria-hidden', String(index !== 0))); });
    }

    if (desktop && capable) {
      document.querySelectorAll<HTMLElement>('.button').forEach(button => {
        const xTo = gsap.quickTo(button, 'x', { duration: 0.25, ease: 'power2.out' });
        const yTo = gsap.quickTo(button, 'y', { duration: 0.25, ease: 'power2.out' });
        const move = (event: PointerEvent) => { const box = button.getBoundingClientRect(); xTo((event.clientX - box.left - box.width / 2) * 0.06); yTo((event.clientY - box.top - box.height / 2) * 0.08); };
        const leave = () => { xTo(0); yTo(0); };
        button.addEventListener('pointermove', move, { signal }); button.addEventListener('pointerleave', leave, { signal });
        localCleanup.push(() => { button.removeEventListener('pointermove', move); button.removeEventListener('pointerleave', leave); gsap.killTweensOf(button); gsap.set(button, { clearProps: 'transform' }); });
      });
      document.querySelectorAll<HTMLElement>('[data-pointer-image]').forEach(card => {
        const image = card.querySelector('img')!;
        const xTo = gsap.quickTo(image, 'x', { duration: 0.65, ease: 'power2.out' });
        const yTo = gsap.quickTo(image, 'y', { duration: 0.65, ease: 'power2.out' });
        const cursor = document.createElement('span'); cursor.className = 'operation-cursor'; cursor.setAttribute('aria-hidden', 'true'); cursor.textContent = 'Enquire ↗'; card.append(cursor);
        const cursorX = gsap.quickTo(cursor, 'x', { duration: 0.3, ease: 'power2.out' });
        const cursorY = gsap.quickTo(cursor, 'y', { duration: 0.3, ease: 'power2.out' });
        const move = (event: PointerEvent) => { const box = card.getBoundingClientRect(); xTo((event.clientX - box.left - box.width / 2) * 0.016); yTo((event.clientY - box.top - box.height / 2) * 0.016); cursorX(event.clientX - box.left); cursorY(event.clientY - box.top); };
        const leave = () => { xTo(0); yTo(0); };
        card.addEventListener('pointermove', move, { signal }); card.addEventListener('pointerleave', leave, { signal });
        localCleanup.push(() => { card.removeEventListener('pointermove', move); card.removeEventListener('pointerleave', leave); gsap.killTweensOf([image, cursor]); cursor.remove(); gsap.set(image, { clearProps: 'transform' }); });
      });
    }
    const refresh = () => { if (!disposed && activeContext) { lenis?.resize(); ScrollTrigger.refresh(); } };
    document.fonts.ready.then(refresh);
    document.querySelectorAll<HTMLImageElement>('main img').forEach(image => { if (!image.complete) { image.addEventListener('load', refresh, { once: true, signal }); localCleanup.push(() => image.removeEventListener('load', refresh)); } });
    return () => { activeContext = false; localCleanup.reverse().forEach(cleanup => cleanup()); };
  });

  return () => {
    disposed = true;
    media.revert();
    originalHeadings.forEach((html, heading) => { heading.innerHTML = html; });
    dividers.forEach(divider => divider.remove());
    document.documentElement.classList.remove('motion-ready');
  };
}
