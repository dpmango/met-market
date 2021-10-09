import React, { useCallback, useMemo, useState, useRef, memo, useContext } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import chunk from 'lodash/chunk';
import difference from 'lodash/difference';

import { SvgIcon } from '@ui';
import { CatalogStoreContext } from '@store';
import { useOnClickOutside } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './SelectFilter.module.scss';

const SelectComponent = observer(
  ({ label, mini, value, name, className, optionsClassName, options, onChange, ...props }) => {
    const location = useLocation();
    const history = useHistory();

    const [opened, setOpened] = useState(false);
    const optionsRef = useRef(null);

    const catalogContext = useContext(CatalogStoreContext);

    const optionsMapped = useMemo(() => {
      if (!options) return [];

      if (name !== 'mark') {
        return options
          .filter((x) => x)
          .map((option) => ({
            value: option.value,
            label: option.value,
            disabled: option.disabled,
          }));
      } else {
        return options
          .filter((x) => x.name)
          .map((option) => ({
            value: option.name,
            label: option.name,
            isPopular: option.isPopular,
            disabled: option.disabled,
          }));
      }
    }, [options]);

    const handleOptionClick = (option) => {
      const filter = catalogContext.addFilter(option, name);

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'filter',
          value: filter,
        },
      });
    };

    const columnizeOptions = useMemo(() => {
      const colSize = name === 'size' ? 5 : 4;
      const filter = catalogContext.filters[name];

      if (!optionsMapped || !filter) return [];

      const diff = difference(
        filter.map((x) => x.value),
        optionsMapped.map((x) => x.value)
      );

      const checked = diff
        ? diff.map((x) => ({
            label: x,
            value: x,
            disabled: true,
          }))
        : [];

      const splited = chunk([...checked, ...optionsMapped], Math.ceil([...checked, ...optionsMapped].length / colSize));

      return splited
        ? [
            ...splited.map((x, idx) => ({
              opt: x,
              id: idx,
            })),
          ]
        : [];
    }, [name, optionsMapped, catalogContext.filters]);

    useOnClickOutside(
      optionsRef,
      useCallback((e) => setOpened(false), [setOpened])
    );

    return (
      <div className={cns(styles.select, mini && styles._mini, opened && styles._active, className)} ref={optionsRef}>
        {!mini ? (
          <div className={styles.selectDisplay} onClick={() => setOpened(!opened)}>
            <span>{label}</span>
            {value.length > 0 && <div className={styles.selectDisplayTag}>{value.length}</div>}
            <SvgIcon name="caret" />
          </div>
        ) : (
          <div className={styles.selectDisplayMini} onClick={() => setOpened(!opened)}>
            <SvgIcon name="filter" />
          </div>
        )}

        <div className={cns(styles.selectOptions, optionsClassName, name && styles[name])}>
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
  }
);

SelectComponent.propTypes = {
  mini: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.array,
  className: PropTypes.string,
  optionsClassName: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
};

export default SelectComponent;
