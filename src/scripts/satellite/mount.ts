import 'cesium/Build/Cesium/Widgets/widgets.css';
import { createSatelliteViewer, type SatelliteViewerHandle } from './SatelliteViewer';
import { satelliteConfig, type SatelliteView } from './config';

export function mountSatelliteIntros() {
  const cleanups: Array<() => void> = [];
  document.querySelectorAll<HTMLElement>('[data-satellite-intro]').forEach(root => {
    const pageAbort = new AbortController();
    let attemptAbort: AbortController | undefined;
    let handle: SatelliteViewerHandle | undefined;
    let generation = 0;
    const reducedMotion = matchMedia('(prefers-reduced-motion: reduce)');
    const canvas = root.querySelector<HTMLElement>('[data-satellite-canvas]')!;
    const loadButton = root.querySelector<HTMLButtonElement>('[data-load-viewer]')!;
    const fallbackMessage = root.querySelector<HTMLElement>('[data-fallback-message]')!;
    const statusText = root.querySelector<HTMLElement>('[data-viewer-status]')!;
    const sourceText = root.querySelector<HTMLElement>('[data-imagery-source]')!;
    const viewButtons = [...root.querySelectorAll<HTMLButtonElement>('[data-camera-view]')];
    const network = (navigator as Navigator & { connection?: { saveData?: boolean } }).connection;
    const memory = (navigator as Navigator & { deviceMemory?: number }).deviceMemory;
    const lowPower = (navigator.hardwareConcurrency !== undefined && navigator.hardwareConcurrency <= 2) || (memory !== undefined && memory <= 2) || Boolean(network?.saveData);
    sourceText.textContent = satelliteConfig.imagerySource === 'ion' ? 'Imagery source: configured Cesium ion asset' : 'Imagery source: NASA Blue Marble / GIBS';

    const stop = () => {
      generation++;
      attemptAbort?.abort(); handle?.destroy(); handle = undefined;
      viewButtons.forEach(button => { button.disabled = true; });
    };
    const start = async () => {
      stop();
      const ownGeneration = generation;
      attemptAbort = new AbortController();
      const signal = attemptAbort.signal;
      root.dataset.state = 'loading'; root.dataset.hasImagery = 'false';
      loadButton.disabled = true;
      fallbackMessage.textContent = 'Loading geographic imagery. You can continue to the homepage at any time.';
      const nextHandle = await createSatelliteViewer(canvas, { signal, onStatus: status => {
        if (pageAbort.signal.aborted || ownGeneration !== generation) return;
        root.dataset.state = status.state;
        if (status.state === 'ready' || status.state === 'degraded') root.dataset.hasImagery = 'true';
        if (status.state === 'error') { root.dataset.hasImagery = 'false'; fallbackMessage.textContent = status.message; loadButton.disabled = false; loadButton.textContent = 'Retry Earth view'; }
        statusText.textContent = status.message;
        sourceText.textContent = `Imagery source: ${status.source}`;
      } });
      if (pageAbort.signal.aborted || signal.aborted || ownGeneration !== generation) { nextHandle?.destroy(); return; }
      handle = nextHandle;
      loadButton.disabled = false;
      if (handle) {
        viewButtons.forEach(button => { button.disabled = false; button.setAttribute('aria-pressed', String(button.dataset.cameraView === 'orbit')); });
      }
    };
    loadButton.addEventListener('click', () => { void start(); }, { signal: pageAbort.signal });
    viewButtons.forEach(button => button.addEventListener('click', () => {
      handle?.setView(button.dataset.cameraView as SatelliteView);
      viewButtons.forEach(item => item.setAttribute('aria-pressed', String(item === button)));
    }, { signal: pageAbort.signal }));
    reducedMotion.addEventListener('change', () => {
      if (reducedMotion.matches) {
        stop(); root.dataset.state = 'idle'; root.dataset.hasImagery = 'false';
        loadButton.disabled = false; loadButton.textContent = 'Load still Earth view';
        fallbackMessage.textContent = 'Reduced-motion mode. A still Earth view is available on request.';
        statusText.textContent = 'Lightweight mode. No camera animation is active.';
      }
    }, { signal: pageAbort.signal });
    const observer = new IntersectionObserver(entries => {
      if (!entries.some(entry => entry.isIntersecting)) return;
      observer.disconnect();
      if (reducedMotion.matches || lowPower) {
        root.dataset.state = 'idle';
        fallbackMessage.textContent = reducedMotion.matches ? 'Reduced-motion mode. Load a still Earth view if you prefer.' : 'Lightweight mode is enabled for this device or connection. Load the 3D view only if you want it.';
        loadButton.textContent = 'Load still Earth view';
        statusText.textContent = 'Lightweight mode. The 3D engine has not been loaded.';
      } else void start();
    }, { rootMargin: '100px' });
    observer.observe(root);
    cleanups.push(() => { pageAbort.abort(); observer.disconnect(); stop(); });
  });
  return () => cleanups.reverse().forEach(cleanup => cleanup());
}
