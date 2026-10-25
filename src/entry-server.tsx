import { renderToString } from 'react-dom/server';
import { StaticRouter } from 'react-router';
import App from './App';

export function render(path: string) { return renderToString(<StaticRouter location={path}><App/></StaticRouter>); }
export { validateManifest } from './experience/manifest';
export { createCameraPath } from './experience/CameraPath';
export { routeMetadata } from './data/routeMetadata';
