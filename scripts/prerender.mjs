import fs from 'node:fs/promises';
import path from 'node:path';
import { render, routeMetadata } from '../.prerender/entry-server.js';

const template = await fs.readFile('dist/index.html', 'utf8');
const routes = ['/', '/experience-preview/', '/satellite-preview/'];
for (const route of routes) {
  let head = '';
  if (route === '/satellite-preview/') head = '<meta name="robots" content="noindex,follow"/><meta http-equiv="refresh" content="0;url=/"/>';
  else if (route === '/experience-preview/') head = '<meta name="robots" content="noindex,nofollow"/>';
  const metadata = routeMetadata(route);
  if (!head.includes('name="robots"')) head += `<meta name="robots" content="${metadata.robots}"/>`;
  const html = template.replace('<!--app-html-->', render(route)).replace('<!--route-head-->', head).replace(/<title>.*?<\/title>/,'<title>'+metadata.title.replaceAll('&','&amp;')+'</title>');
  const destination = route === '/' ? 'dist/index.html' : path.join('dist',route,'index.html');
  await fs.mkdir(path.dirname(destination), { recursive: true });
  await fs.writeFile(destination, html);
  console.log(`Prerendered ${route}`);
}
