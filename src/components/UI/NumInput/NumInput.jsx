import React, { useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import uniqueId from 'lodash/uniqueId';

import { SvgIcon } from '@ui';
import styles from './NumInput.module.scss';

const Variants = {
  DEFAULT: 'default',
  SMALL: 'small',
};

const VariantClasses = {
  [Variants.DEFAULT]: null,
  [Variants.SMALL]: styles._small,
};

const NumInput = ({ className, label, inputRef, variant, value, onChange, error, showError, ...props }) => {
  const id = useMemo(() => {
    return uniqueId();
  }, []);

  const handleUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newVal = parseFloat(value) + 0.1;

    onChange(newVal.toFixed(2));
  };

  const handleDownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newVal = parseFloat(value) - 0.1;
    if (newVal <= 0) {
      return false;
    }

    onChange(newVal.toFixed(2));
  };

  const onInputChange = useCallback((e) => {
    onChange(e.target.value);
  }, []);

  const inputProps = {
    id,
    ref: inputRef,
    className: cns(styles.input_input, error && styles._withError),
    value,
    onChange: onInputChange,
    ...props,
  };

  return (
    <div style={props.style} className={cns(styles.input, variant && VariantClasses[variant], className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}

      <div className={styles.input_wrapper}>
        <input type="text" disabled {...inputProps} />

        <div className={cns(styles.arrow, styles._up)} onClick={handleUpClick}>
          <SvgIcon name="up"></SvgIcon>
        </div>
        <div className={cns(styles.arrow, styles._down)} onClick={handleDownClick}>
          <SvgIcon name="down"></SvgIcon>
        </div>
        {error && showError && <div className={styles.error}>{error}</div>}
      </div>
    </div>
  );
};

NumInput.propTypes = {
  className: PropTypes.string,
  label: PropTypes.string,
  inputRef: PropTypes.oneOfType([PropTypes.func, PropTypes.shape({ current: PropTypes.instanceOf(Element) })]),
  value: PropTypes.oneOfType([PropTypes.string, PropTypes.number]),
  variant: PropTypes.string,
  error: PropTypes.oneOfType([PropTypes.string, PropTypes.boolean]),
  showError: PropTypes.bool,
  onChange: PropTypes.func,
};

NumInput.defaultProps = {
  variant: Variants.DEFAULT,
  showError: true,
};

export default memo(NumInput);
