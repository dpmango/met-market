import 'react-app-polyfill/ie11';
import 'react-app-polyfill/stable';

import React from 'react';
import ReactDOM from 'react-dom';
import * as Sentry from '@sentry/react';
import { Integrations } from '@sentry/tracing';
import '@styles/index.scss';
import App from '@c/App';
import { BrowserInfo, VersionCheck, History } from '@services';
import { getEnv } from '@helpers';

Sentry.init({
  environment: 'production',
  dsn: getEnv('SENTRY_DSN'),
  integrations: [
    new Integrations.BrowserTracing({
      tracingOrigins: getEnv('SENTRY_TRACING_ORIGINS'),
    }),
  ],
  tracesSampleRate: getEnv('SENTRY_TRACES_SAMPLE_RATE'),
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
