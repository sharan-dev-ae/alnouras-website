import type { Viewer, ImageryProvider } from 'cesium';
import { satelliteConfig, type SatelliteView } from './config';

export type ViewerState = 'loading' | 'ready' | 'degraded' | 'error';
export interface ViewerStatus { state: ViewerState; message: string; source: string; }
export interface SatelliteViewerHandle { setView: (view: SatelliteView) => void; destroy: () => void; }

/** Step 2: static inspection of real imagery. No autoplay, flight, markers or scroll pin. */
export async function createSatelliteViewer(
  container: HTMLElement,
  options: { signal: AbortSignal; onStatus: (status: ViewerStatus) => void },
): Promise<SatelliteViewerHandle | undefined> {
  let viewer: Viewer | undefined;
  let disposed = false;
  let hadTileWork = false;
  let imageryErrors = 0;
  let hasLoaded = false;
  let providerName = 'NASA Blue Marble / GIBS';
  let lastStatus = '';
  const removers: Array<() => void> = [];
  const status = (state: ViewerState, message: string) => {
    if (disposed || options.signal.aborted || `${state}:${message}` === lastStatus) return;
    lastStatus = `${state}:${message}`;
    options.onStatus({ state, message, source: providerName });
  };
  const destroy = () => {
    if (disposed) return;
    disposed = true;
    removers.reverse().forEach(remove => remove());
    if (viewer && !viewer.isDestroyed()) viewer.destroy();
  };
  options.signal.addEventListener('abort', destroy, { once: true });
  removers.push(() => options.signal.removeEventListener('abort', destroy));
  if (options.signal.aborted) { destroy(); return; }

  try {
    // Must be set before importing Cesium so workers resolve in dev AND production.
    (window as Window & { CESIUM_BASE_URL?: string }).CESIUM_BASE_URL = satelliteConfig.assetBaseUrl;
    status('loading', 'Preparing the geographic viewer…');
    const Cesium = await import('cesium');
    if (disposed) return;
    let provider: ImageryProvider;
    if (satelliteConfig.imagerySource === 'ion') {
      if (!satelliteConfig.ionToken || !Number.isSafeInteger(satelliteConfig.ionAssetId) || satelliteConfig.ionAssetId <= 0) throw new Error('ION_CONFIGURATION');
      providerName = 'Configured Cesium ion imagery';
      provider = await Cesium.IonImageryProvider.fromAssetId(satelliteConfig.ionAssetId, { accessToken: satelliteConfig.ionToken });
    } else if (satelliteConfig.imagerySource === 'nasa') {
      provider = new Cesium.UrlTemplateImageryProvider({
        url: satelliteConfig.nasaUrl,
        tilingScheme: new Cesium.WebMercatorTilingScheme(),
        minimumLevel: 0, maximumLevel: 8,
        credit: new Cesium.Credit('Imagery: <a href="https://earthdata.nasa.gov/gibs" target="_blank" rel="noopener noreferrer">NASA Blue Marble / GIBS</a>', true),
      });
    } else throw new Error('IMAGERY_CONFIGURATION');
    if (disposed) return;

    // Observe actual successful imagery responses instead of treating terrain geometry as imagery readiness.
    const originalRequest = provider.requestImage;
    provider.requestImage = (...args: Parameters<ImageryProvider['requestImage']>) => {
      const pending = originalRequest.apply(provider, args);
      if (!pending) return pending;
      return pending.then(image => {
        if (image && !disposed) {
          hasLoaded = true;
          status('ready', satelliteConfig.imagerySource === 'nasa' ? 'NASA Earth imagery is available. This global composite does not provide street-level Dubai detail.' : 'Configured satellite imagery is available. Detail continues loading as needed.');
        }
        return image;
      });
    };
    removers.push(() => { provider.requestImage = originalRequest; });

    viewer = new Cesium.Viewer(container, {
      baseLayer: new Cesium.ImageryLayer(provider),
      terrainProvider: new Cesium.EllipsoidTerrainProvider(),
      animation: false, timeline: false, geocoder: false, homeButton: false,
      sceneModePicker: false, baseLayerPicker: false, navigationHelpButton: false,
      fullscreenButton: false, infoBox: false, selectionIndicator: false,
      shouldAnimate: false, requestRenderMode: true, maximumRenderTimeChange: Infinity,
      scene3DOnly: true, shadows: false, skyBox: false,
      contextOptions: { webgl: { alpha: false, antialias: false, powerPreference: 'low-power' } },
      useBrowserRecommendedResolution: true,
    });
    const currentViewer = viewer;
    currentViewer.resolutionScale = matchMedia('(max-width: 767px)').matches ? 0.8 : 1;
    currentViewer.scene.msaaSamples = 1;
    currentViewer.scene.backgroundColor = Cesium.Color.fromCssColorString('#07111e');
    currentViewer.scene.globe.baseColor = Cesium.Color.fromCssColorString('#102B53');
    currentViewer.scene.globe.enableLighting = false;
    currentViewer.scene.globe.maximumScreenSpaceError = 3;
    // Never intercept ordinary scrolling or let drag gestures compete with future scroll control.
    currentViewer.scene.screenSpaceCameraController.enableInputs = false;
    currentViewer.canvas.setAttribute('aria-label', 'Static satellite imagery inspection view');
    currentViewer.canvas.setAttribute('role', 'img');
    currentViewer.canvas.setAttribute('tabindex', '-1');

    const setView = (name: SatelliteView) => {
      if (disposed || currentViewer.isDestroyed()) return;
      const camera = satelliteConfig.views[name];
      hadTileWork = false; imageryErrors = 0;
      currentViewer.camera.setView({
        destination: Cesium.Cartesian3.fromDegrees(camera.longitude, camera.latitude, camera.height),
        orientation: { heading: Cesium.Math.toRadians(camera.heading), pitch: Cesium.Math.toRadians(camera.pitch), roll: Cesium.Math.toRadians(camera.roll) },
      });
      status('loading', 'Loading geographic imagery. Available detail is retained while tiles arrive.');
      currentViewer.scene.requestRender();
    };
    removers.push(provider.errorEvent.addEventListener((error: { retry?: boolean }) => {
      error.retry = false;
      imageryErrors++;
      status(hasLoaded ? 'degraded' : imageryErrors >= 4 ? 'error' : 'loading', hasLoaded ? 'Some imagery tiles could not load. Available imagery is retained.' : imageryErrors >= 4 ? 'Imagery is unavailable. Check connectivity or the configured imagery credentials.' : 'Some imagery tiles are delayed. Waiting for available imagery.');
    }));
    removers.push(currentViewer.scene.postRender.addEventListener(() => {
      if (!disposed && hasLoaded && currentViewer.scene.globe.tilesLoaded && imageryErrors === 0) status('ready', satelliteConfig.imagerySource === 'nasa' ? 'NASA Earth imagery loaded. This global composite does not provide street-level Dubai detail.' : 'Configured satellite imagery tiles loaded.');
    }));
    const loadingTimeout = window.setTimeout(() => {
      if (!disposed && !hasLoaded) status('error', 'Imagery is taking longer than expected. Check the connection or retry the viewer.');
    }, 30_000);
    removers.push(() => clearTimeout(loadingTimeout));
    removers.push(currentViewer.scene.globe.tileLoadProgressEvent.addEventListener((remaining: number) => {
      if (disposed) return;
      if (remaining > 0) hadTileWork = true;
      if (remaining === 0 && hadTileWork && imageryErrors === 0) {
        hasLoaded = true;
        status('ready', satelliteConfig.imagerySource === 'nasa' ? 'NASA Earth imagery loaded. This global composite does not provide street-level Dubai detail.' : 'Configured satellite imagery tiles loaded.');
      }
    }));
    removers.push(currentViewer.scene.renderError.addEventListener(() => {
      status('error', 'The 3D renderer stopped. You can continue to the existing homepage.');
      destroy();
    }));
    const contextLost = (event: Event) => {
      event.preventDefault();
      status('error', 'The graphics context was lost. Reload the viewer or continue to the homepage.');
      destroy();
    };
    currentViewer.canvas.addEventListener('webglcontextlost', contextLost);
    removers.push(() => currentViewer.canvas.removeEventListener('webglcontextlost', contextLost));
    const resize = new ResizeObserver(() => {
      if (disposed || currentViewer.isDestroyed()) return;
      currentViewer.resize(); currentViewer.scene.requestRender();
    });
    resize.observe(container);
    removers.push(() => resize.disconnect());
    const visibility = () => {
      if (disposed || currentViewer.isDestroyed()) return;
      currentViewer.useDefaultRenderLoop = !document.hidden;
      if (!document.hidden) currentViewer.scene.requestRender();
    };
    document.addEventListener('visibilitychange', visibility);
    removers.push(() => document.removeEventListener('visibilitychange', visibility));
    visibility();
    setView('orbit');
    return { setView, destroy };
  } catch (error) {
    if (!disposed) {
      const configurationError = error instanceof Error && /CONFIGURATION/.test(error.message);
      status('error', configurationError ? 'Imagery configuration is incomplete. Set a valid provider, restricted browser token and imagery asset ID, or use NASA imagery.' : 'The 3D viewer could not start. WebGL support, network access or imagery configuration may be unavailable.');
    }
    destroy();
    return;
  }
}
