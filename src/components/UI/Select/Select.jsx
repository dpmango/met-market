import React, { useCallback, useMemo, memo } from 'react';
import PropTypes from 'prop-types';
import Select from 'react-select';
import cns from 'classnames';
import uniqueId from 'lodash/uniqueId';

import { SvgIcon } from '@ui';
import styles from './Select.module.scss';
import stylesGlobal from './Select.scss';

const Variants = {
  DEFAULT: 'default',
  SMALL: 'small',
};

const VariantClasses = {
  [Variants.DEFAULT]: null,
  [Variants.SMALL]: styles._small,
};

const SelectComponent = ({ label, value, className, options, onChange, variant, ...props }) => {
  const id = useMemo(() => {
    return uniqueId();
  }, []);

  const onSelectChange = useCallback((e) => {
    if (onChange) {
      onChange(e);
    }
  }, []);

  return (
    <div className={cns(styles.select, className, variant && VariantClasses[variant])}>
      {label && (
        <label className={styles.label} htmlFor={id}>
          {label}
        </label>
      )}
      <div className={cns(styles.select_wrapper, 'select-container')}>
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
  value: PropTypes.oneOfType([PropTypes.object, PropTypes.array]),
  className: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
};

SelectComponent.defaultProps = {
  variant: Variants.DEFAULT,
};

export default memo(SelectComponent);
