import React, { useCallback, useMemo, useState, useRef, useContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import chunk from 'lodash/chunk';
import uniqueId from 'lodash/uniqueId';

import { Input, SvgIcon } from '@ui';
import { CatalogStoreContext } from '@store';
import { useOnClickOutside, useWindowSize, useFirstRender } from '@hooks';
import { formatUGC, updateQueryParams } from '@helpers';

import styles from './SelectFilter.module.scss';

const SelectComponent = observer(
  ({
    label,
    mini,
    inline,
    value,
    name,
    className,
    optionsClassName,
    options,
    onChange,
    opened,
    setOpened,
    ...props
  }) => {
    const location = useLocation();
    const history = useHistory();
    const optionsRef = useRef(null);
    const searchInputRef = useRef(null);
    const { width } = useWindowSize();

    const [search, setSearch] = useState('');
    const catalogContext = useContext(CatalogStoreContext);

    const id = useMemo(() => {
      return uniqueId();
    }, []);

    const optionsMapped = useMemo(() => {
      if (!options) return [];

      const mapped = options.map((option) => ({
        value: option.value,
        label: option.value,
        isPopular: option.isPopular,
        disabled: !option.available,
      }));

      return mapped;
    }, [options]);

    const filter = useMemo(() => {
      return catalogContext.filters[name];
    }, [catalogContext.filters, name]);

    const allSelected = useMemo(() => {
      return filter && filter.length === 0;
    }, [filter]);

    const columnizeOptions = useMemo(() => {
      let colSize = name === 'size' ? 5 : 4;

      if (width < 768) {
        colSize = name === 'size' ? 2 : 2;
      } else if (width < 992) {
        colSize = name === 'size' ? 4 : 3;
      } else if (width < 1200) {
        colSize = name === 'size' ? 5 : 4;
      }

      if (!optionsMapped || !filter) return [];

      const filterPureValues = filter.map((x) => x.value);

      const checkedButNotListed = filter
        .map((f) => ({ value: f.value, label: f.label, disabled: false }))
        .filter((x) => !filterPureValues.includes(x.value));

      let combined = [...checkedButNotListed, ...optionsMapped];

      if (search && search.trim()) {
        const searchNormalized = formatUGC(search.trim().toLowerCase());
        combined = combined.filter((x) => x.label.toLowerCase().includes(searchNormalized));
      } else {
        combined = [{ value: 'all', label: 'Все', disabled: false }, ...combined];
      }

      const splited = chunk(combined, Math.ceil(combined.length / colSize));

      return splited
        ? [
            ...splited.map((x, idx) => ({
              opt: x,
              id: idx,
            })),
          ]
        : [];
    }, [filter, optionsMapped, width, search]);

    // click handlers
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

    const handleAllClick = useCallback(() => {
      let filterUp = {};

      if (!allSelected) {
        filterUp = catalogContext.resetFilter(name);
      } else {
        filterUp = catalogContext.selectAllFilters(name, optionsMapped);
      }

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'filter',
          value: filterUp,
        },
      });
    }, [allSelected, name, history, location, optionsMapped]);

    const onKeyDown = useCallback(
      (e) => {
        if (e.keyCode === 13) {
          searchInputRef && searchInputRef.current.blur();
          return;
        }
      },
      [searchInputRef]
    );

    // effects

    // useOnClickOutside(
    //   optionsRef,
    //   useCallback((e) => setOpened(false), [setOpened])
    // );

    useEffect(() => {
      if (opened) {
        setSearch('');
      }
      if (opened && width >= 768) {
        searchInputRef && searchInputRef.current.focus();
      }
    }, [opened]);

    return (
      <div
        className={cns(
          styles.select,
          mini && styles._mini,
          inline && styles._inline,
          opened && styles._active,
          className
        )}
        ref={optionsRef}>
        {!mini ? (
          <div className={styles.selectDisplay} onClick={() => setOpened(!opened)}>
            <span>{label}</span>
            {value.length > 0 && <div className={styles.selectDisplayTag}>{value.length}</div>}
            <SvgIcon name="caret" />
          </div>
        ) : (
          <div className={cns(styles.selectDisplayMini, 'selectDisplayMini')} onClick={() => setOpened(!opened)}>
            <SvgIcon name="filter" />
          </div>
        )}

        <div className={cns(styles.selectOptions, optionsClassName, name && styles[name])}>
          <div className={styles.selectSearch}>
            <Input
              autoComplete="false"
              name={`filter_s_${id}`}
              placeholder="Поиск..."
              allowClear
              value={search}
              onChange={(v) => setSearch(v)}
              onKeyDown={onKeyDown}
              inputRef={searchInputRef}
            />
          </div>

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
                        value.some((x) => x.value === option.value) && styles._active,
                        option.value === 'all' && allSelected && styles._active
                      )}
                      onClick={() => (option.value === 'all' ? handleAllClick() : handleOptionClick(option))}>
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
  inline: PropTypes.bool,
  label: PropTypes.string,
  name: PropTypes.string,
  value: PropTypes.array,
  className: PropTypes.string,
  optionsClassName: PropTypes.string,
  options: PropTypes.array,
  onChange: PropTypes.func,
  opened: PropTypes.bool,
  setOpened: PropTypes.func,
};

export default SelectComponent;
