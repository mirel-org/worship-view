import { createRoot } from 'react-dom/client';
import Application from './Application';
import Modal from 'react-modal';
import { injectFontCSS } from './lib/fonts';
import './index.css';

// Say something
console.log('[ERWT] : Renderer execution started');

// Inject fonts before rendering
injectFontCSS();

Modal.setAppElement(document.getElementById('app') as HTMLElement);

// Application to Render
const app = <Application />;

// Get root element
const container = document.getElementById('app');
if (!container) {
  throw new Error('Root element not found');
}

// Render application in DOM using React 18+ API
const root = createRoot(container);
root.render(app);

// Hot module replacement with Vite
if (import.meta.hot) {
  import.meta.hot.accept();
  // Re-inject fonts on HMR
  import.meta.hot.accept('./lib/fonts', () => {
    injectFontCSS();
  });
}

