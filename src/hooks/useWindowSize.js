import React, { useState, useEffect } from 'react';
import debounce from 'lodash/debounce';

export function useWindowSize() {
  const [windowSize, setWindowSize] = useState({
    width: undefined,
    height: undefined,
  });

  useEffect(() => {
    function handleResize() {
      setWindowSize({
        width: window.innerWidth,
        height: window.innerHeight,
      });
    }

    const debouncedFunction = debounce(handleResize, 300, { leading: false, trailing: true });

    window.addEventListener('resize', debouncedFunction, false);

    handleResize();

    return () => window.removeEventListener('resize', debouncedFunction, false);
  }, []);

  return windowSize;
}
