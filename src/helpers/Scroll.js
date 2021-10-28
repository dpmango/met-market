/* eslint-disable no-plusplus */
export const ScrollTo = (to, duration = 800, $target) => {
  const element = $target || document.scrollingElement || document.documentElement;
  const start = element.scrollTop;
  const change = to - start;
  const startDate = +new Date();

  const easeInOutQuad = (t, b, c, d) => {
    t /= d / 2;
    if (t < 1) {
      return (c / 2) * t * t + b;
    }
    t--;
    return (-c / 2) * (t * (t - 2) - 1) + b;
  };

  const animateScroll = () => {
    const currentDate = +new Date();
    const currentTime = currentDate - startDate;

    element.scrollTop = parseInt(easeInOutQuad(currentTime, start, change, duration).toString(), 10);
    if (currentTime < duration) {
      requestAnimationFrame(animateScroll);
    } else {
      element.scrollTop = to;
    }
  };
  animateScroll();
};

export const scrollToPageEnd = (duration) => {
  const element = document.scrollingElement || document.documentElement;
  const endOfThePageTop = element.scrollHeight;
  ScrollTo(endOfThePageTop, duration);
};

export const scrollToPageStart = (duration) => {
  ScrollTo(0, duration);
};

const fillGapMethod = 'padding';

export const fillGapTarget = ($target) => {
  if ($target instanceof Node) {
    let scrollBarWidth;
    scrollBarWidth = getScrollBarWidth($target);

    var computedStyle = window.getComputedStyle($target);

    if (fillGapMethod === 'margin') {
      var currentMargin = parseFloat(computedStyle.marginRight);
      $target.style.marginRight = `${currentMargin + scrollBarWidth}px`;
    } else if (fillGapMethod === 'width') {
      $target.style.width = `calc(100% - ${scrollBarWidth}px)`;
    } else if (fillGapMethod === 'max-width') {
      $target.style.maxWidth = `calc(100% - ${scrollBarWidth}px)`;
    } else if (fillGapMethod === 'padding') {
      var currentPadding = parseFloat(computedStyle.paddingRight);
      $target.style.paddingRight = `${currentPadding + scrollBarWidth}px`;
    }
  }
};

export const unfillGapTarget = ($target) => {
  if ($target instanceof Node) {
    if (fillGapMethod === 'margin') {
      $target.style.marginRight = '';
    } else if (fillGapMethod === 'width') {
      $target.style.width = '';
    } else if (fillGapMethod === 'max-width') {
      $target.style.maxWidth = '';
    } else if (fillGapMethod === 'padding') {
      $target.style.paddingRight = '';
    }
  }
};

export const getScrollBarWidth = ($target) => {
  if ($target instanceof Node) {
    var documentWidth = document.documentElement.clientWidth;
    var windowWidth = window.innerWidth;
    var currentWidth = windowWidth - documentWidth;
    return currentWidth;
  } else {
    return 0;
  }
};
