import React, { useCallback, useMemo, useState, useRef, memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import chunk from 'lodash/chunk';
import difference from 'lodash/difference';

import { SvgIcon } from '@ui';
import { CatalogStoreContext } from '@store';
import { useOnClickOutside, useQuery } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './SelectFilter.module.scss';

const SelectComponent = observer(({ label, value, name, className, options, onChange, ...props }) => {
  const location = useLocation();
  const history = useHistory();
  const query = useQuery();

  const [opened, setOpened] = useState(false);
  const optionsRef = useRef(null);

  const catalogContext = useContext(CatalogStoreContext);

  const handleOptionClick = (option) => {
    const filter = catalogContext.addFilter(option, name);

    updateQueryParams({
      history,
      location,
      query,
      payload: {
        type: 'filter',
        value: filter,
      },
    });
  };

  const columnizeOptions = useMemo(() => {
    const colSize = name === 'size' ? 5 : 4;
    const filter = catalogContext.filters[name];

    const checked = difference(
      filter.map((x) => x.value),
      options.map((x) => x.value)
    ).map((x) => ({
      label: x,
      value: x,
      disabled: true,
    }));

    console.log(checked);
    const splited = chunk([...checked, ...options], colSize);

    return splited
      ? [
          ...splited.map((x, idx) => ({
            opt: x,
            id: idx,
          })),
        ]
      : [];
  }, [name, options, catalogContext.filters]);

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

      <div className={cns(styles.selectOptions, name && styles[name])}>
        {columnizeOptions &&
          columnizeOptions.length > 0 &&
          columnizeOptions.map((col, idx) => {
            return (
              <div key={`${idx}_${col.id}`} className={styles.selectOptionCol}>
                {col.opt.map((option) => (
                  <div
                    key={option.value}
                    className={cns(
                      styles.selectOption,
                      option.disabled && styles._disabled,
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
            );
          })}
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

export default SelectComponent;
