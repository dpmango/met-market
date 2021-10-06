import React, { memo, useState, useContext, useMemo, createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import ClipLoader from 'react-spinners/ClipLoader';

import styles from './Spinner.module.scss';

const Themes = {
  PRIMARY: 'primary',
  BUTTON: 'button',
};

const ThemeClasses = {
  [Themes.PRIMARY]: styles._primary,
  [Themes.BUTTON]: styles._button,
};

const Spinner = ({ className, theme, color, ...props }) => {
  return (
    <div className={cns(styles.loader, theme && ThemeClasses[theme], className)}>
      <ClipLoader color={color || '#182D78'} loading={true} size={24} />
    </div>
  );
};

Spinner.propTypes = {
  className: PropTypes.string,
  theme: PropTypes.string,
  color: PropTypes.string,
};

Spinner.defaultProps = {
  theme: Themes.PRIMARY,
};

export default memo(Spinner);
