export type SatelliteView = 'orbit' | 'dubai';
export type ImagerySource = 'nasa' | 'ion';

export const satelliteConfig = {
  assetBaseUrl: '/cesium/',
  imagerySource: (import.meta.env.PUBLIC_SATELLITE_IMAGERY_PROVIDER || 'nasa') as ImagerySource,
  ionToken: import.meta.env.PUBLIC_CESIUM_ION_TOKEN || '',
  ionAssetId: Number(import.meta.env.PUBLIC_CESIUM_IMAGERY_ASSET_ID || 0),
  nasaUrl: 'https://gibs.earthdata.nasa.gov/wmts/epsg3857/best/BlueMarble_NextGeneration/default/GoogleMapsCompatible_Level8/{z}/{y}/{x}.jpeg',
  // Static Step 2 inspection views only. Camera keyframes/interpolation are a later step.
  views: {
    orbit: { longitude: 45, latitude: 24, height: 22_000_000, heading: 0, pitch: -90, roll: 0 },
    dubai: { longitude: 55.2708, latitude: 25.2048, height: 120_000, heading: 0, pitch: -90, roll: 0 },
  },
} as const;
