import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';
import ResizeObserver from 'resize-observer-polyfill';

import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.scss';
import App from '@c/App';
import { BrowserInfo } from '@services';
// import reportWebVitals from './reportWebVitals';

if (!window.ResizeObserver) {
  window.ResizeObserver = ResizeObserver;
}

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

new BrowserInfo();
