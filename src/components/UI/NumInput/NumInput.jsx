import React, { useCallback, useState, useMemo, memo, useRef, useEffect } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import uniqueId from 'lodash/uniqueId';

import { SvgIcon } from '@ui';
import { formatPrice } from '@helpers';
import styles from './NumInput.module.scss';

const Variants = {
  DEFAULT: 'default',
  SMALL: 'small',
};

const VariantClasses = {
  [Variants.DEFAULT]: null,
  [Variants.SMALL]: styles._small,
};

const NumInput = ({ className, label, variant, value, onChange, error, showError, ...props }) => {
  const inputRef = useRef(null);

  const id = useMemo(() => {
    return uniqueId();
  }, []);

  const [innerValue, setValue] = useState(value);

  const handleUpClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newVal = parseFloat(value) + 0.1;

    setValue(newVal.toFixed(1));
    onChange(newVal.toFixed(1));
  };

  const handleDownClick = (e) => {
    e.preventDefault();
    e.stopPropagation();

    const newVal = parseFloat(value) - 0.1;
    if (newVal <= 0) {
      return false;
    }

    setValue(newVal.toFixed(1));
    onChange(newVal.toFixed(1));
  };

  const onInputChange = useCallback((e) => {
    const val = e.target.value;
    e.preventDefault();

    if (val.split('.').length > 2) {
      return;
    }

    setValue(e.target.value);
  }, []);

  const onBlur = useCallback(
    (e) => {
      e.preventDefault();

      const split = innerValue && innerValue.toString().split('.');

      if (!innerValue || innerValue < 0.1) {
        setValue(0.1);
        onChange(0.1);
      } else if (split && split.length > 1) {
        const limited = split[1].slice(0, 1);

        setValue(`${split[0]}.${limited}`);
        onChange(`${split[0]}.${limited}`);
      } else {
        onChange(innerValue);
      }
    },
    [innerValue]
  );

  const onKeyDown = useCallback(
    (e) => {
      if (e.keyCode === 13) {
        onBlur(e);
        inputRef && inputRef.current.blur();
        return;
      }

      const isAllowedKey = [8, 190].includes(e.keyCode); // backspace, enter, space
      const isNumber = !Number.isNaN(parseFloat(e.key));

      if (!isNumber && !isAllowedKey) {
        event.preventDefault();
      }
    },
    [innerValue, inputRef]
  );

  useEffect(() => {
    setValue(value ? value : 0.1);
  }, [value]);

  const inputProps = {
    id,
    ref: inputRef,
    className: cns(styles.input_input, error && styles._withError),
    value: innerValue,
    onChange: onInputChange,
    onBlur: onBlur,
    onKeyDown: onKeyDown,
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
        <input type="text" {...inputProps} />

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
