import React, { useState, useRef } from 'react';
import cns from 'classnames';
import { useIntersection } from '@hooks';
import './LazyMedia.scss';

const LazyMedia = ({ src, thumb, width, height }) => {
  const [isLoaded, setIsLoaded] = useState(false);
  const [isInView, setIsInView] = useState(false);
  const imgRef = useRef();
  useIntersection(imgRef, () => {
    setIsInView(true);
  });

  const handleOnLoad = () => {
    setIsLoaded(true);
  };
  return (
    <div
      className="image-container"
      ref={imgRef}
      style={{
        paddingBottom: `${(height / width) * 100}%`,
        width: '100%',
      }}>
      {isInView && (
        <>
          {thumb && (
            <img
              className={cns('image', 'thumb', {
                ['isLoaded']: !!isLoaded,
              })}
              src={thumb}
            />
          )}

          <img
            className={cns('image', {
              ['isLoaded']: !!isLoaded,
            })}
            src={src}
            onLoad={handleOnLoad}
          />
        </>
      )}
    </div>
  );
};

export default LazyMedia;
