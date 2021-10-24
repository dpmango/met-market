import { getScrollBarWidth } from '@helpers';
import { isMobile, isIosDevice, msieversion } from '@helpers';

export default class BrowserInfo {
  constructor() {
    this.setBodyTags();
  }

  hasScrollbar = () => {
    if (getScrollBarWidth(document.querySelector('.overlayScroller'))) {
      return true;
    } else {
      return false;
    }
  };

  setBodyTags = () => {
    if (!document) return;
    const body = document.querySelector('body');

    if (msieversion()) {
      body.classList.add('is-ie');
    }

    if (isMobile()) {
      body.classList.add('is-mobile');
    }

    if (isIosDevice()) {
      body.classList.add('is-ios');
    }
    if (this.hasScrollbar()) {
      body.classList.add('has-scrollbar');
    }
  };
}
