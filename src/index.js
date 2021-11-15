import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import '@styles/index.scss';
import App from '@c/App';
import { BrowserInfo, VersionCheck, History } from '@services';

Sentry.init({
  environment: 'production',
  dsn: 'https://1a0ad3dd350f4718b38ddf68d5449b4b@o1068843.ingest.sentry.io/6063116',
  integrations: [new Integrations.BrowserTracing()],
  tracesSampleRate: 1.0,
});

ReactDOM.render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
  document.getElementById('root')
);

new VersionCheck();
new BrowserInfo();
new History();
