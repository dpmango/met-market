import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import '@styles/index.scss';
import App from '@c/App';
import { BrowserInfo, VersionCheck } from '@services';

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

new VersionCheck();
new BrowserInfo();
