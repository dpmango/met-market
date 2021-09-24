export default class BrowserInfo {
  constructor() {
    this.setBodyTags();
  }

  isRetinaDisplay = () => {
    if (window.matchMedia) {
      var mq = window.matchMedia(
        'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)'
      );
      return (mq && mq.matches) || window.devicePixelRatio > 1;
    }
  };

  isMobile = () => {
    if (/Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent)) {
      return true;
    } else {
      return false;
    }
  };

  isIosDevice = () => {
    if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
      return true;
    } else {
      return false;
    }
  };

  msieversion = () => {
    var ua = window.navigator.userAgent;
    var msie = ua.indexOf('MSIE ');

    if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
      return true;
    } else {
      return false;
    }
  };

  setBodyTags = () => {
    const body = document.querySelector('body');

    if (this.msieversion()) {
      body.classList.add('is-ie');
    }

    if (this.isMobile()) {
      body.classList.add('is-mobile');
    }

    if (this.isIosDevice()) {
      body.classList.add('is-ios');
    }
  };
}
