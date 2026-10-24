import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import { fileURLToPath } from 'node:url';

const cesiumSource = fileURLToPath(new URL('./node_modules/cesium/Build/Cesium/', import.meta.url)).replaceAll('\\', '/');
export default defineConfig({
  vite: {
    define: { CESIUM_BASE_URL: JSON.stringify('/cesium/') },
    plugins: [
      tailwindcss(),
      viteStaticCopy({ targets: ['Workers', 'ThirdParty', 'Assets', 'Widgets'].map(directory => ({ src: `${cesiumSource}${directory}`, dest: 'cesium', rename: { stripBase: 4 } })) }),
    ],
  },
});
