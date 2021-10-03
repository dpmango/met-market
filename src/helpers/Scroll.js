/* eslint-disable no-plusplus */
export const ScrollTo = (to, duration = 800) => {
  const element = document.scrollingElement || document.documentElement;
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
