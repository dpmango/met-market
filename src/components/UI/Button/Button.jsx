import React, { memo } from 'react';
import PropTypes from 'prop-types';
import { Link, NavLink } from 'react-router-dom';
import cns from 'classnames';

import styles from './Button.module.scss';

const Themes = {
  PRIMARY: 'primary',
  ACCENT: 'accent',
  DANGER: 'danger',
  SUCCESS: 'success',
  DARK: 'dark',
};

const Variants = {
  DEFAULT: 'default',
  SMALL: 'small',
  BIG: 'big',
};

const ThemeClasses = {
  [Themes.PRIMARY]: styles._primary,
  [Themes.ACCENT]: styles._accent,
  [Themes.DANGER]: styles._danger,
  [Themes.SUCCESS]: styles._success,
  [Themes.DARK]: styles._dark,
};

const VariantClasses = {
  [Variants.DEFAULT]: null,
  [Variants.SMALL]: styles._small,
  [Variants.BIG]: styles._big,
};

const Button = ({ children, className, theme, variant, type, outline, block, ...props }) => {
  const classStyle = cns(
    styles.btn,
    theme && ThemeClasses[theme],
    variant && VariantClasses[variant],
    outline && styles._outline,
    block && styles._block,
    className
  );

  if (type === 'link') {
    return (
      <Link {...props} className={classStyle}>
        {children}
      </Link>
    );
  } else {
    return (
      <button {...props} className={classStyle}>
        {children}
      </button>
    );
  }
};

Button.propTypes = {
  className: PropTypes.string,
  theme: PropTypes.string,
  variant: PropTypes.string,
  type: PropTypes.string,
  outline: PropTypes.bool,
  block: PropTypes.bool,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

Button.defaultProps = {
  theme: Themes.PRIMARY,
  variant: Variants.DEFAULT,
};

export default memo(Button);
