import { api } from '@api';
import { getEnv } from '@helpers';

export default class VersionCheck {
  version = null;
  fileName = 'version.txt';
  interval = parseInt(getEnv('APP_UPDATE_INTERVAL_MINUTES')) * 60 * 1000;
  lastActivity = new Date();

  constructor() {
    this.requestVersion();

    setInterval(() => {
      this.requestVersion();
    }, this.interval);
  }

  requestVersion = () => {
    const { fileName, interval } = this;

    const requestUrl = `${window.location.origin}/${fileName}?${new Date().getTime()}`;
    api.get(requestUrl).then((res) => {
      if (this.version) {
        const lastActivityWasRecently = new Date().getTime() - this.lastActivity.getTime() < interval;

        if (!lastActivityWasRecently && this.version !== res.data) {
          window.location.reload();
        }
      } else {
        this.version = res.data;
      }
    });
  };
}
