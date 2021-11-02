import { getEnv } from '@helpers';
import history from '@config/history';

export default class History {
  direction = 0;

  constructor() {
    sessionStorage.removeItem('positionLast');
    window.addEventListener('popstate', this.listenHistoryState, false);
    window.addEventListener('pageshow', this.listenHistoryState, false);

    window.listenHistoryState = this.listenHistoryState;
  }

  listenHistoryState = () => {
    const positionLast = Number(sessionStorage.getItem('positionLast'));
    let position = history.location.state;
    // let position = window.history.state.state;

    if (position === undefined || position === null) {
      position = positionLast + 1;

      history.replace({ pathname: history.location.pathname, search: history.location.search, state: position });
    }

    sessionStorage.setItem('positionLast', String(position));

    const direction = Math.sign(position - positionLast);

    // One of backward (-1), reload (0) and forward (1)
    // console.log('popstate direction', direction);
    this.direction = direction;
    window.direction = direction;
  };
}
