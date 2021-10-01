import React, { useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import uniqueId from 'lodash/uniqueId';

import { SvgIcon, Select } from '@ui';
import styles from './Select.module.scss';
import stylesGlobal from './Select.scss';

const Variants = {
  DEFAULT: 'default',
  SMALL: 'small',
};

const VariantClasses = {
  [Variants.DEFAULT]: null,
  [Variants.SMALL]: 'small',
};

const SelectComponent = ({ label, value, className, options, onChange, variant, ...props }) => {
  const id = useMemo(() => {
    return uniqueId();
  }, []);

  const onSelectChange = useCallback(
    (e) => {
      if (onChange) {
        onChange(e);
      }
    },
    [onChange]
  );

  return (
    <div className={cns(styles.select, className)}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={cns(styles.select_wrapper, 'select-container', variant && VariantClasses[variant])}>
        <Select
          className="react-select-container"
          classNamePrefix="react-select"
          value={value}
          onChange={onSelectChange}
          options={options}
          {...props}
        />
      </div>
    </div>
  );
};

SelectComponent.propTypes = {
  variant: PropTypes.string,
  label: PropTypes.string,
  value: PropTypes.object,
  className: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
};

SelectComponent.defaultProps = {
  variant: Variants.DEFAULT,
};

export default memo(SelectComponent);
