import React from 'react';
import ReactDOM from 'react-dom';
import { inDev } from '@common/helpers';
import Application from './Application';
import Modal from 'react-modal';

// Say something
console.log('[ERWT] : Renderer execution started');
Modal.setAppElement(document.getElementById('app') as HTMLElement);

// Application to Render
const app = <Application />;

// Render application in DOM
ReactDOM.render(app, document.getElementById('app'));

// Hot module replacement
if (inDev() && module.hot) module.hot.accept();

