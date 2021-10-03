import React, { useCallback, useMemo, useState, useRef, memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import cns from 'classnames';

import { CatalogStoreContext } from '@store';
import { useOnClickOutside } from '@hooks';

import { SvgIcon } from '@ui';
import styles from './SelectFilter.module.scss';

const SelectComponent = observer(({ label, value, name, className, options, onChange, ...props }) => {
  const [opened, setOpened] = useState(false);
  const optionsRef = useRef(null);

  const catalogContext = useContext(CatalogStoreContext);

  const handleOptionClick = (option) => {
    catalogContext.addFilter(option, name);
  };

  useOnClickOutside(
    optionsRef,
    useCallback((e) => setOpened(false), [setOpened])
  );

  return (
    <div className={cns(styles.select, opened && styles._active, className)} ref={optionsRef}>
      <div className={styles.selectDisplay} onClick={() => setOpened(true)}>
        <span>{label}</span>
        {value.length > 0 && <div className={styles.selectDisplayTag}>{value.length}</div>}
        <SvgIcon name="caret" />
      </div>

      <div className={cns(styles.selectOptions)}>
        {options.map((option) => (
          <div
            key={option.value}
            className={cns(
              styles.selectOption,
              option.isPopular && styles._popular,
              value.some((x) => x.value === option.value) && styles._active
            )}
            onClick={() => handleOptionClick(option)}>
            <i className={styles.selectOptionCheckbox}>
              <SvgIcon name="checkmark" />
            </i>
            <span>{option.label}</span>
          </div>
        ))}
      </div>
    </div>
  );
});

SelectComponent.propTypes = {
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.array,
  className: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
};

export default memo(SelectComponent);
