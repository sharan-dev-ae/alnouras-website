import { createRoot, hydrateRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router';
import '@fontsource-variable/manrope';
import '@fontsource-variable/dm-sans';
import './styles/site.css';
import './styles/cinematic.css';
import './styles/experience.css';
import './styles/dark-theme.css';
import App from './App';

const root = document.getElementById('root')!;
const app = <BrowserRouter><App/></BrowserRouter>;
if (root.querySelector('[data-app-root]')) hydrateRoot(root, app);
else createRoot(root).render(app);
