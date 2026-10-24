import 'leaflet/dist/leaflet.css';
import type { Map as LeafletMap, Marker, Polyline, LayerGroup } from 'leaflet';
import { districts } from '../data/coverage';
import { initMotion } from './motion';

function initializeSite() {
  if (!document.querySelector('#main .hero')) return () => {};
  const abort = new AbortController();
  const cleanups: Array<() => void> = [];
  let disposed = false;
  type SiteEvents = GlobalEventHandlersEventMap & DocumentEventMap;
  function listen<K extends keyof SiteEvents>(target: EventTarget, type: K, handler: (event: SiteEvents[K]) => void, options: AddEventListenerOptions = {}) { target.addEventListener(type, handler as EventListener, { ...options, signal: abort.signal }); }
  try { cleanups.push(initMotion(abort.signal)); } catch (error) { console.error('Cinematic effects unavailable; content remains accessible.', error); }

  const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
  const header = document.querySelector('.site-header');
  let scrollScheduled = false;
  function updateScroll() {
    if (disposed) return;
    const available = document.documentElement.scrollHeight - innerHeight;
    document.documentElement.style.setProperty('--progress', String(available > 0 ? scrollY / available : 0));
    header?.classList.toggle('scrolled', scrollY > 30);
    scrollScheduled = false;
  }
  listen(window, 'scroll', () => {
    if (!scrollScheduled) { scrollScheduled = true; requestAnimationFrame(updateScroll); }
  }, { passive: true });
  updateScroll();

  const menu = document.querySelector<HTMLButtonElement>('.menu-toggle');
  function closeMenu() {
    menu?.setAttribute('aria-expanded', 'false');
    menu?.setAttribute('aria-label', 'Open navigation');
    document.querySelector('#navigation')?.classList.remove('open');
    document.dispatchEvent(new CustomEvent('alnouras:overlay', { detail: { open: false } }));
  }
  if (menu) listen(menu, 'click', () => {
    const open = menu.getAttribute('aria-expanded') !== 'true';
    menu.setAttribute('aria-expanded', String(open));
    menu.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    document.querySelector('#navigation')?.classList.toggle('open', open);
    document.dispatchEvent(new CustomEvent('alnouras:overlay', { detail: { open } }));
  });
  document.querySelectorAll('#navigation a').forEach(link => listen(link, 'click', closeMenu));
  listen(document, 'keydown', event => { if (event.key === 'Escape') closeMenu(); });

  const serviceChoices = [...document.querySelectorAll<HTMLButtonElement>('[data-service-select]')];
  function selectService(number: string) {
    document.querySelectorAll<HTMLElement>('[data-service-entry]').forEach(entry => {
      const active = entry.dataset.serviceEntry === number;
      entry.dataset.active = String(active);
      const control = entry.querySelector('[data-service-select]');
      control?.setAttribute('aria-expanded', String(active));
      const body = entry.querySelector<HTMLElement>('.service-entry-body');
      if (body) body.inert = !active;
    });
    document.querySelectorAll<HTMLElement>('[data-service-visual]').forEach(visual => { const active = visual.dataset.serviceVisual === number; visual.dataset.active = String(active); visual.setAttribute('aria-hidden', String(!active)); });
  }
  serviceChoices.forEach((button, index) => {
    listen(button, 'click', () => selectService(button.dataset.serviceSelect!));
    listen(button, 'pointerenter', () => { if (matchMedia('(hover: hover) and (pointer: fine)').matches) selectService(button.dataset.serviceSelect!); });
    listen(button, 'focus', () => selectService(button.dataset.serviceSelect!));
    listen(button, 'keydown', event => {
      const direction = event.key === 'ArrowDown' ? 1 : event.key === 'ArrowUp' ? -1 : 0;
      if (direction) { event.preventDefault(); serviceChoices[(index + direction + serviceChoices.length) % serviceChoices.length].focus(); }
    });
  });
  if (serviceChoices[0]) selectService(serviceChoices[0].dataset.serviceSelect!);

  const counterObserver = new IntersectionObserver(entries => entries.forEach(entry => {
    if (disposed) return;
    if (!entry.isIntersecting) return;
    const element = entry.target as HTMLElement;
    const target = Number(element.dataset.count);
    counterObserver.unobserve(element);
    if (element.dataset.counted === 'true') return;
    element.dataset.counted = 'true';
    if (reducedMotion.matches) return;
    const start = performance.now();
    const tick = (now: number) => {
      if (disposed) return;
      if (reducedMotion.matches) { element.textContent = target.toLocaleString('en-US'); return; }
      const progress = Math.min((now - start) / 1400, 1);
      element.textContent = Math.round(target * (1 - Math.pow(1 - progress, 3))).toLocaleString('en-US');
      if (progress < 1) requestAnimationFrame(tick);
    };
    requestAnimationFrame(tick);
  }), { threshold: 0.8 });
  document.querySelectorAll('[data-count]').forEach(element => counterObserver.observe(element));

  document.querySelectorAll<HTMLButtonElement>('[data-service-dialog]').forEach(button => {
    listen(button, 'click', () => {
      const dialog = document.querySelector<HTMLDialogElement>(`#service-${button.dataset.serviceDialog}`);
      if (dialog) { dialog.showModal(); document.body.classList.add('modal-open'); document.dispatchEvent(new CustomEvent('alnouras:overlay', { detail: { open: true } })); }
    });
  });
  document.querySelectorAll<HTMLDialogElement>('.service-dialog').forEach(dialog => {
    const closeButton = dialog.querySelector('.dialog-close');
    if (closeButton) listen(closeButton, 'click', () => dialog.close());
    listen(dialog, 'close', () => { document.body.classList.remove('modal-open'); document.dispatchEvent(new CustomEvent('alnouras:overlay', { detail: { open: false } })); });
    listen(dialog, 'click', event => {
      const bounds = dialog.getBoundingClientRect();
      if (event.target === dialog && (event.clientX < bounds.left || event.clientX > bounds.right || event.clientY < bounds.top || event.clientY > bounds.bottom)) dialog.close();
    });
    const quoteLink = dialog.querySelector<HTMLAnchorElement>('[data-quote-service]');
    if (quoteLink) listen(quoteLink, 'click', event => {
      const link = event.currentTarget as HTMLAnchorElement;
      const service = document.querySelector<HTMLSelectElement>('#service');
      if (service) service.value = link.dataset.quoteService || '';
      dialog.close();
    });
  });

  let enquiryUrl: string | undefined;
  const enquiryForm = document.querySelector<HTMLFormElement>('.enquiry-form');
  if (enquiryForm) listen(enquiryForm, 'submit', event => {
    event.preventDefault();
    const form = event.currentTarget as HTMLFormElement;
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    const body = `Hello Al Nouras,\n\nI would like to discuss a waste collection service.\n\nName: ${data.get('name')}\nCompany: ${data.get('company') || 'Not specified'}\nEmail: ${data.get('email')}\nPhone: ${data.get('phone') || 'Not specified'}\nService: ${data.get('service')}\nLocation: ${data.get('location')}\n\nRequirements:\n${data.get('message')}`;
    const mailLink = document.querySelector<HTMLAnchorElement>('.email-enquiry');
    if (mailLink) mailLink.href = `mailto:info@alnouras.com?subject=${encodeURIComponent(`Collection enquiry — ${data.get('service')}`)}&body=${encodeURIComponent(body)}`;
    if (enquiryUrl) URL.revokeObjectURL(enquiryUrl);
    enquiryUrl = URL.createObjectURL(new Blob([body], { type: 'text/plain;charset=utf-8' }));
    const download = document.querySelector<HTMLAnchorElement>('.download-enquiry');
    if (download) download.href = enquiryUrl;
    const result = document.querySelector<HTMLElement>('.form-result');
    if (result) { result.hidden = false; result.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'nearest' }); }
  });
  cleanups.push(() => { if (enquiryUrl) URL.revokeObjectURL(enquiryUrl); });

  // All data in this section is illustrative. No operational data or tracking API is used.
  type District = typeof districts[number];
  let map: LeafletMap | undefined;
  let markerLayer: LayerGroup | undefined;
  let routeLine: Polyline | undefined;
  let movingTruck: Marker | undefined;
  let markerByName = new Map<string, Marker>();
  let selectedAreas: District[] = [...districts];
  let currentFilter = 'all';
  let paused = reducedMotion.matches;
  let coverageVisible = false;
  let mapLoading: Promise<void> | undefined;
  let feedOffset = 0;
  let selectedName = districts[0].name as string;
  let animationFrame: number | undefined;
  let lastFrame = 0;
  let simulationTime = 0;
  let lastFeedUpdate = 0;
  const dashboard = document.querySelector<HTMLElement>('.coverage-dashboard');
  const pauseButton = document.querySelector<HTMLButtonElement>('#toggle-activity');
  const truckSvg = '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true"><path d="M3 6h12v12H3ZM15 10h4l3 4v4h-7M5 18a2 2 0 1 0 4 0m7 0a2 2 0 1 0 4 0"/></svg>';

  function syncPause() {
    dashboard?.classList.toggle('simulation-paused', paused);
    pauseButton?.setAttribute('aria-pressed', String(paused));
    pauseButton?.setAttribute('aria-label', paused ? 'Resume demo activity' : 'Pause demo activity');
    if (pauseButton) pauseButton.innerHTML = paused
      ? '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="m8 4 12 8-12 8Z"/></svg>'
      : '<svg width="17" height="17" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.7" aria-hidden="true"><path d="M8 5v14M16 5v14"/></svg>';
    scheduleSimulation();
  }
  if (pauseButton) listen(pauseButton, 'click', () => { paused = !paused; syncPause(); });
  listen(reducedMotion, 'change', () => { paused = reducedMotion.matches; syncPause(); });
  syncPause();

  function renderFeed() {
    const list = document.querySelector('#activity-list');
    if (!list) return;
    const previousFocus = document.activeElement instanceof HTMLElement && list.contains(document.activeElement) ? document.activeElement.dataset.area : undefined;
    list.replaceChildren();
    for (let index = 0; index < Math.min(3, selectedAreas.length); index++) {
      const area = selectedAreas[(index + feedOffset) % selectedAreas.length];
      const button = document.createElement('button');
      button.className = `activity-item${area.name === selectedName ? ' selected' : ''}`;
      button.dataset.area = area.name;
      const icon = document.createElement('span'); icon.className = 'activity-truck'; icon.innerHTML = truckSvg;
      const details = document.createElement('span');
      const title = document.createElement('strong'); title.textContent = area.name;
      const meta = document.createElement('small'); meta.textContent = `${area.service} · ${area.vehicle}`;
      const state = document.createElement('span'); state.className = 'activity-state';
      state.append(document.createElement('i'), area.state);
      details.append(title, meta, state);
      const arrow = document.createElement('span'); arrow.className = 'feed-arrow'; arrow.textContent = '›';
      button.append(icon, details, arrow); list.append(button);
    }
    if (previousFocus) list.querySelector<HTMLButtonElement>(`[data-area="${previousFocus}"]`)?.focus({ preventScroll: true });
    document.querySelectorAll('#active-count, #area-count').forEach(element => { element.textContent = String(selectedAreas.length); });
  }

  function makePopup(area: District) {
    const root = document.createElement('div');
    const badge = document.createElement('span'); badge.className = 'popup-demo'; badge.textContent = 'SIMULATED COLLECTION';
    const heading = document.createElement('strong'); heading.textContent = area.name;
    const service = document.createElement('p'); service.textContent = area.service;
    const status = document.createElement('p'); status.textContent = `${area.vehicle} · ${area.state}`;
    const link = document.createElement('a'); link.className = 'map-popup-quote'; link.href = '#contact'; link.textContent = 'Request a collection here ↗';
    listen(link, 'click', () => {
      const location = document.querySelector<HTMLInputElement>('#enquiry-location');
      const serviceSelect = document.querySelector<HTMLSelectElement>('#service');
      if (location) location.value = area.name;
      if (serviceSelect) serviceSelect.value = area.service;
      map?.closePopup();
    });
    root.append(badge, heading, service, status, link); return root;
  }

  async function initMap() {
    if (mapLoading) return mapLoading;
    mapLoading = (async () => {
      const L = await import('leaflet');
      if (disposed) return;
      map = L.map('dubai-map', { scrollWheelZoom: false, zoomControl: false, attributionControl: true, minZoom: 9, maxZoom: 16, preferCanvas: false });
      map.attributionControl.setPrefix(false);
      L.control.zoom({ position: 'bottomright' }).addTo(map);
      const tiles = L.tileLayer('https://{s}.basemaps.cartocdn.com/light_all/{z}/{x}/{y}{r}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> &copy; <a href="https://carto.com/attributions">CARTO</a>',
        subdomains: 'abcd', maxZoom: 20,
      });
      tiles.on('tileload', () => document.querySelector('.map-fallback')?.classList.add('loaded'));
      tiles.on('tileerror', () => dashboard?.classList.add('map-unavailable'));
      tiles.addTo(map);
      markerLayer = L.layerGroup().addTo(map);
      const icon = L.divIcon({ className: 'red-map-marker', html: '<span class="map-pin"></span>', iconSize: [15, 15], iconAnchor: [7, 7] });
      districts.forEach(area => {
        const marker = L.marker([area.lat, area.lng], { icon, title: `${area.name} — illustrative ${area.service} point`, alt: `Sample collection point: ${area.name}`, keyboard: true });
        marker.bindPopup(makePopup(area), { closeButton: true, autoPanPaddingTopLeft: [25, 70] });
        marker.on('click', () => { selectedName = area.name; renderFeed(); });
        markerByName.set(area.name, marker);
      });
      routeLine = L.polyline([], { color: '#d96b63', weight: 2, opacity: 0.65, dashArray: '5 9', className: 'route-line', interactive: false }).addTo(map);
      const truckIcon = L.divIcon({ className: 'moving-truck-marker', html: `<span class="moving-map-truck">${truckSvg}</span>`, iconSize: [32, 32], iconAnchor: [16, 16] });
      movingTruck = L.marker([districts[0].lat, districts[0].lng], { icon: truckIcon, title: 'Simulated vehicle — not a real location', interactive: false, zIndexOffset: 500 }).addTo(map);
      applyFilter(currentFilter, false);
      const bounds = L.latLngBounds(districts.map(area => [area.lat, area.lng]));
      map.fitBounds(bounds, { padding: [45, 70], animate: false });
      const mapResizeObserver = new ResizeObserver(() => map?.invalidateSize({ animate: false }));
      mapResizeObserver.observe(document.querySelector('#dubai-map')!);
      cleanups.push(() => mapResizeObserver.disconnect());
    })().catch(error => {
      if (disposed) return;
      console.error('Map could not be loaded:', error);
      dashboard?.classList.add('map-unavailable');
      const fallback = document.querySelector<HTMLElement>('.map-fallback>span');
      if (fallback) fallback.textContent = 'Map unavailable · Dubai coverage schematic';
    });
    return mapLoading;
  }

  function applyFilter(filter: string, fit = true) {
    if (disposed) return;
    currentFilter = filter;
    selectedAreas = districts.filter(area => filter === 'all' || area.service === filter);
    feedOffset = 0;
    selectedName = selectedAreas[0]?.name || '';
    document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => button.setAttribute('aria-pressed', String(button.dataset.filter === filter)));
    markerLayer?.clearLayers();
    selectedAreas.forEach(area => { const marker = markerByName.get(area.name); if (marker) markerLayer?.addLayer(marker); });
    // Connections are illustrative, not road routes or a service boundary.
    const sorted = [...selectedAreas].sort((a, b) => a.lat - b.lat);
    routeLine?.setLatLngs(sorted.map(area => [area.lat, area.lng]));
    if (fit && map && selectedAreas.length) map.fitBounds(selectedAreas.map(area => [area.lat, area.lng] as [number, number]), { padding: [40, 65], maxZoom: 12, animate: !reducedMotion.matches });
    if (movingTruck && sorted[0]) movingTruck.setLatLng([sorted[0].lat, sorted[0].lng]);
    renderFeed();
  }
  document.querySelectorAll<HTMLButtonElement>('[data-filter]').forEach(button => listen(button, 'click', async () => { await initMap(); applyFilter(button.dataset.filter || 'all'); }));
  const resetButton = document.querySelector('#reset-map');
  if (resetButton) listen(resetButton, 'click', async () => { await initMap(); applyFilter('all'); map?.closePopup(); });

  listen(document, 'click', async event => {
    if (!(event.target instanceof Element)) return;
    const button = event.target.closest<HTMLButtonElement>('[data-area]');
    if (!button) return;
    await initMap();
    if (disposed) return;
    const area = districts.find(area => area.name === button.dataset.area);
    if (!area) return;
    if (currentFilter !== 'all' && area.service !== currentFilter) applyFilter('all', false);
    selectedName = area.name;
    map?.flyTo([area.lat, area.lng], 12, { animate: !reducedMotion.matches, duration: 0.7 });
    markerByName.get(area.name)?.openPopup();
    renderFeed();
    document.querySelector('#dubai-map')?.scrollIntoView({ behavior: reducedMotion.matches ? 'instant' : 'smooth', block: 'center' });
  });

  const coverageObserver = new IntersectionObserver(entries => {
    if (disposed) return;
    coverageVisible = entries[0].isIntersecting;
    if (coverageVisible) void initMap();
    scheduleSimulation();
  }, { rootMargin: '200px' });
  coverageObserver.observe(document.querySelector('#coverage')!);

  function scheduleSimulation() {
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    animationFrame = undefined;
    lastFrame = performance.now();
    if (disposed) return;
    if (coverageVisible && !document.hidden && !paused && !reducedMotion.matches) animationFrame = requestAnimationFrame(animateSimulation);
  }
  listen(document, 'visibilitychange', scheduleSimulation);
  function animateSimulation(now: number) {
    if (disposed) return;
    // Update map positions at 12 fps; CSS interpolates movement between updates.
    if (now - lastFrame < 80) { animationFrame = requestAnimationFrame(animateSimulation); return; }
    const elapsed = Math.min(now - lastFrame, 200);
    lastFrame = now;
    if (coverageVisible && !document.hidden && !paused && !reducedMotion.matches) {
      simulationTime += elapsed;
      if (map && movingTruck && selectedAreas.length > 1) {
        const route = [...selectedAreas].sort((a, b) => a.lat - b.lat);
        const position = (simulationTime / 22000) % (route.length - 1);
        const index = Math.floor(position), fraction = position - index;
        const from = route[index], to = route[index + 1];
        movingTruck.setLatLng([from.lat + (to.lat - from.lat) * fraction, from.lng + (to.lng - from.lng) * fraction]);
      }
      if (simulationTime - lastFeedUpdate > 9000) {
        lastFeedUpdate = simulationTime;
        // Keep focused controls stable while a visitor is interacting with the feed.
        if (!document.querySelector('#activity-list')?.contains(document.activeElement)) { feedOffset++; renderFeed(); }
      }
      const clock = document.querySelector('#demo-clock');
      if (clock) clock.textContent = `DEMO · ${String(Math.floor(simulationTime / 60000)).padStart(2, '0')}:${String(Math.floor(simulationTime / 1000) % 60).padStart(2, '0')}`;
    }
    if (coverageVisible && !document.hidden && !paused && !reducedMotion.matches) animationFrame = requestAnimationFrame(animateSimulation);
  }

  const remove = () => {
    if (disposed) return;
    disposed = true;
    abort.abort();
    counterObserver.disconnect();
    coverageObserver.disconnect();
    if (animationFrame !== undefined) cancelAnimationFrame(animationFrame);
    map?.remove();
    markerByName.clear();
    document.body.classList.remove('modal-open');
    cleanups.reverse().forEach(cleanup => cleanup());
  };
  return remove;
}
let teardown: (() => void) | undefined;
function boot() { teardown?.(); teardown = initializeSite(); }
boot();
document.addEventListener('astro:before-swap', () => { teardown?.(); teardown = undefined; });
document.addEventListener('astro:page-load', () => { if (!teardown) boot(); });
window.addEventListener('pagehide', () => { teardown?.(); teardown = undefined; });
window.addEventListener('pageshow', event => { if (event.persisted) boot(); });
