/* eslint-disable react/jsx-key */
import React, { useMemo, useContext, useCallback, useRef, useState, memo, useEffect } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import cns from 'classnames';
import { use100vh } from 'react-div-100vh';

import { Button, SvgIcon, SelectFilter } from '@ui';
import { UiStoreContext, CatalogStoreContext } from '@store';
import { useOnClickOutside, useEventListener } from '@hooks';
import { updateQueryParams } from '@helpers';

import CategoryTags from '@c/Catalog/CatalogCategories/CategoryTags';
import styles from './MobileFilter.module.scss';

const MobileFilter = observer(({ categoryData, metaItemsCount }) => {
  const location = useLocation();
  const history = useHistory();
  const height = use100vh();
  const mobRef = useRef(null);

  const [visible, setVisible] = useState(false);
  const [categoriesOpened, setCategoriesOpened] = useState(true);
  const [opened, setOpened] = useState(false);

  const { filters, someFiltersActive } = useContext(CatalogStoreContext);
  const { query } = useContext(UiStoreContext);

  // useEffect(() => {
  //   setVisible(false);
  // }, [query.category]);

  const {
    catalogOpened,
    header: { scrolledSticky },
  } = useContext(UiStoreContext);

  const resetFilters = useCallback(
    (e) => {
      e && e.preventDefault();

      updateQueryParams({
        history,
        location,
        payload: {
          type: 'filter',
          value: {
            size: null,
            length: null,
            mark: null,
          },
        },
      });
    },
    [history, location]
  );

  const scrollerHeight = useMemo(() => {
    return height - 52 - 52;
  }, [height]);

  const handleEscapeKey = useCallback(
    (e) => {
      let evt = e || window.event;
      let isEscape = false;

      if ('key' in evt) {
        isEscape = evt.key === 'Escape' || evt.key === 'Esc';
      } else {
        isEscape = evt.keyCode === 27;
      }
      if (isEscape) {
        visible && setVisible(false);
      }
    },
    [visible, setVisible]
  );

  useEffect(() => {
    if (visible) {
      document.body.classList.add('filtersActive');
    } else {
      document.body.classList.remove('filtersActive');
    }
  }, [visible]);

  useEffect(() => {
    if (opened) setCategoriesOpened(false);
  }, [opened]);

  useEffect(() => {
    if (categoriesOpened) setOpened(false);
  }, [categoriesOpened]);

  useEventListener('keydown', handleEscapeKey);

  useOnClickOutside(
    mobRef,
    useCallback((e) => setVisible(false), [setVisible])
  );

  return (
    <div className={styles.mobFilterWrapper}>
      <div
        className={cns(styles.mobFilter, scrolledSticky && !catalogOpened && styles._sticky, visible && styles._active)}
        ref={mobRef}>
        <div className={cns(styles.mobFilterToggle)} onClick={() => setVisible(!visible)}>
          <SvgIcon name="filters" />
          <span>Фильтры</span>
          <div className={styles.mobFilterIcon}>
            <SvgIcon name="caret" />
          </div>
        </div>
        <div className={styles.mobFilterSubtitle}>{visible ? metaItemsCount : 'Цена с НДС'}</div>

        {categoryData && (
          <div className={cns(styles.filters, visible && styles._visible)}>
            {categoryData.subcategories && categoryData.subcategories.length > 0 && (
              <div className={cns(styles.filterTags, visible && categoriesOpened && styles._active)}>
                <div className={styles.filterTagsLabel} onClick={() => setCategoriesOpened(!categoriesOpened)}>
                  <span>Тип товара</span>
                  <SvgIcon name="caret" />
                </div>
                <div className={styles.filterTagsDropdown}>
                  <div className={styles.filtersToggle}>
                    <CategoryTags className={styles.tags} data={categoryData.subcategories} />
                  </div>
                </div>
              </div>
            )}

            <SelectFilter
              inline
              optionsClassName={cns(styles.selectOptions, styles.size)}
              label="Размер"
              name="size"
              value={filters.size}
              options={categoryData.filters.size}
              opened={visible && opened === 'size'}
              setOpened={(v) => setOpened(v ? 'size' : false)}
            />
            <SelectFilter
              inline
              optionsClassName={cns(styles.selectOptions, styles.mark)}
              label="Марка"
              name="mark"
              value={filters.mark}
              options={categoryData.filters.mark}
              opened={visible && opened === 'mark'}
              setOpened={(v) => setOpened(v ? 'mark' : false)}
            />
            <SelectFilter
              inline
              optionsClassName={cns(styles.selectOptions, styles.length)}
              label="Длина"
              name="length"
              value={filters.length}
              options={categoryData.filters['length']}
              opened={visible && opened === 'length'}
              setOpened={(v) => setOpened(v ? 'length' : false)}
            />
            <div className={styles.reset}>
              <Button outline={!someFiltersActive} disabled={!someFiltersActive} onClick={resetFilters}>
                Сбросить фильтры
              </Button>
            </div>

            <div className={styles.ok}>
              <Button theme="link" block onClick={() => setVisible(false)}>
                ОК
              </Button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
});

export default memo(MobileFilter);
