# Satellite intro — Steps 1 and 2

## Scope

The existing homepage, navigation, Leaflet demo, service dialogs and enquiry flow remain unchanged. `/satellite-preview/` is a separate, noindex inspection page. It initializes a real CesiumJS globe with geographic imagery and offers two instantaneous inspection views: an orbital view facing the Middle East and a Dubai overhead view.

There is deliberately no scroll pin, autoplay, `camera.flyTo`, camera keyframe interpolation, coverage overlay or homepage transition in this checkpoint. `SatelliteCamera.ts`, `SatelliteTimeline.ts` and `CoverageOverlay.ts` belong to subsequent steps and have not been added as misleading empty modules.

The existing `src/data/coverage.ts` contains demo points. None is imported into this viewer. Verified company coverage coordinates have not been supplied.

## Local testing

1. Run `npm.cmd install` if dependencies are not installed.
2. Run `npm.cmd run dev` and open `http://127.0.0.1:4321/satellite-preview/`.
3. Confirm Earth imagery appears after loading. Provider attribution remains visible in Cesium's credit area.
4. Select **Dubai**, then **Orbital Earth**. These are static inspection views, not a camera flight. NASA's global-resolution imagery cannot demonstrate detailed Dubai streets or individual sites.
5. Scroll the page normally. The canvas does not capture scrolling or dragging, and nothing is pinned.
6. Activate **Skip intro**. It navigates to the existing homepage at `/#main` and works without JavaScript.
7. Enable reduced motion or data saving. The default becomes the existing company photograph with an optional **Load still Earth view** control. Devices reporting two or fewer CPU cores or 2 GB or less memory also default to this mode.
8. Test a disconnected network or invalid ion configuration. The fallback photograph and homepage link remain available, with a retry control and a readable error status. Temporary tile failures retain successfully loaded imagery.
9. For production, run `npm.cmd run check`, `npm.cmd run build`, then `npm.cmd run preview`. If this project's preview is already running, stop it with `npm.cmd run preview -- stop`, then start it again.

## Imagery configuration

Copy `.env.example` to `.env.local` when customization is needed. Environment files are ignored except the example. Restart/rebuild after changing public environment values.

### Default: NASA GIBS Blue Marble

`PUBLIC_SATELLITE_IMAGERY_PROVIDER=nasa` uses the public Blue Marble Next Generation satellite composite through NASA GIBS. No API key is required for the configured endpoint. It is a global-resolution composite, not live imagery and not a substitute for licensed high-resolution Dubai aerial/satellite imagery.

The tile URL and maximum level are configured in `src/scripts/satellite/config.ts`. NASA attribution is supplied through Cesium's credit API and remains visible. See [NASA GIBS documentation](https://nasa-gibs.github.io/gibs-api-docs/map-library-usage/).

### Detailed imagery: Cesium ion

Set these values in `.env.local`:

```dotenv
PUBLIC_SATELLITE_IMAGERY_PROVIDER=ion
PUBLIC_CESIUM_ION_TOKEN=your_restricted_browser_read_token
PUBLIC_CESIUM_IMAGERY_ASSET_ID=your_licensed_imagery_asset_id
```

Use an imagery asset available and licensed in your own Cesium ion account. No arbitrary asset ID, default demo token or privileged token is embedded. The code passes the token directly to `IonImageryProvider.fromAssetId`; it does not configure a global token or request ion terrain/buildings.

`PUBLIC_` values are browser-visible, not server secrets. In the provider dashboard restrict the token to `assets:read`, the selected imagery asset and the allowed application URLs; include the local development URL separately from the production URL. Do not use upload, administration or general-purpose server credentials. Confirm imagery usage terms, quota and billing in the account before public deployment. Provider-supplied imagery credits are preserved.

## Runtime assets and lifecycle

Vite defines `CESIUM_BASE_URL=/cesium/` and copies Cesium's `Workers`, `ThirdParty`, `Assets` and `Widgets` directories to that exact path for production. The static-copy plugin also serves the same URLs in development. The explicit `stripBase: 4` removes the `node_modules/cesium/Build/Cesium` prefix while retaining all nested runtime folders.

Cesium is dynamically imported only on the preview page, after the viewer is near the viewport and performance/preferences allow it. Reduced-motion and lightweight modes do not load the engine unless requested. The production engine chunk is large (roughly 4.9 MB uncompressed for the current version); it is not part of the existing homepage bundle. No bundle-size warning has been hidden.

The scene uses request-render mode, a stopped clock, ellipsoid terrain, no shadows and reduced resolution on mobile. Actual successful imagery requests drive readiness; loading terrain geometry alone is not treated as imagery success. The viewer reports tile, context and rendering failures without printing credential-bearing provider URLs.

Viewer instances, listeners, resize observers and timers are removed on retry, Astro navigation or page exit. Hidden tabs suspend Cesium's render loop. Back/forward cache restoration remounts the preview.

## Verification limits

The production build and Astro/TypeScript diagnostics are checked. NASA's configured tile endpoint and local asset URLs are checked separately. The in-app browser automation bridge is unavailable in this environment, so actual GPU rendering, screenshots, mobile interaction and runtime-console verification still require a browser QA session. A successful build or image HTTP response is not proof of rendered visual quality.

Before Step 3, visually confirm both static views in the browser. Before coverage overlays, provide company-verified coordinates with a source/verification record; the existing demonstration locations must not be reused as verified data.
