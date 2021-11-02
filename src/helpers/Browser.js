export const isRetinaDisplay = () => {
  if (window.matchMedia) {
    var mq = window.matchMedia(
      'only screen and (min--moz-device-pixel-ratio: 1.3), only screen and (-o-min-device-pixel-ratio: 2.6/2), only screen and (-webkit-min-device-pixel-ratio: 1.3), only screen  and (min-device-pixel-ratio: 1.3), only screen and (min-resolution: 1.3dppx)'
    );
    return (mq && mq.matches) || window.devicePixelRatio > 1;
  }
};

export const isMobile = () => {
  if (
    /Android|webOS|iPhone|iPad|iPod|BlackBerry|IEMobile|Opera Mini/i.test(navigator.userAgent) ||
    (navigator.platform === 'MacIntel' && navigator.maxTouchPoints > 0)
  ) {
    return true;
  } else {
    return false;
  }
};

export const isIosDevice = () => {
  if (/iPad|iPhone|iPod/.test(navigator.userAgent) && !window.MSStream) {
    return true;
  } else {
    return false;
  }
};

export const msieversion = () => {
  var ua = window.navigator.userAgent;
  var msie = ua.indexOf('MSIE ');

  if (msie > 0 || !!navigator.userAgent.match(/Trident.*rv:11\./)) {
    return true;
  } else {
    return false;
  }
};
