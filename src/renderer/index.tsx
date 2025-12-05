import ReactDOM from 'react-dom';
import { inDev } from '@common/helpers';
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

// Render application in DOM
ReactDOM.render(app, document.getElementById('app'));

// Hot module replacement
if (inDev() && module.hot) {
  module.hot.accept();
  // Re-inject fonts on HMR
  module.hot.accept('./lib/fonts', () => {
    injectFontCSS();
  });
}

