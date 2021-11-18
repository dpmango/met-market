import React, { useState, useContext, useRef, useCallback, useEffect, useMemo } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { SvgIcon, Spinner } from '@ui';
import { CatalogStoreContext, SessionStoreContext, UiStoreContext } from '@store';
import { useOnClickOutside, useFirstRender } from '@hooks';
import { formatUGC, updateQueryParams, ScrollTo } from '@helpers';
import { AnimatedSearchPlaceholder } from '@services';

import styles from './Search.module.scss';

const settings = {
  delay: 50,
};

const PlaceholderAnimation = new AnimatedSearchPlaceholder();

const Search = observer(({ className }) => {
  const history = useHistory();
  const location = useLocation();
  const firstRender = useFirstRender();

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [searchMeta, setSearchMeta] = useState({
    total: null,
  });
  const [suggestionsOpened, setSuggestionsOpened] = useState(false);
  const [showRecent, setShowRecent] = useState(false);

  const catalogContext = useContext(CatalogStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const { query } = useContext(UiStoreContext);
  const searchRef = useRef(null);
  const inputRef = useRef(null);

  // debounced getter

  const searchFunc = useCallback(
    debounce((txt) => {
      const textNormalized = formatUGC(txt);

      ScrollTo(0, 300);

      if (textNormalized.length >= 2) {
        updateQueryParams({
          location,
          history,
          payload: {
            type: 'search',
            value: `${textNormalized}`,
          },
        });

        sessionContext.setLog({
          type: 'search',
          payload: textNormalized,
        });
      } else {
        if (!firstRender) {
          updateQueryParams({
            location,
            history,
            payload: {
              type: 'search',
              value: false,
            },
          });
        }
      }

      setLoading(false);
    }, settings.delay),
    [location, history, firstRender]
  );

  // запуск поисковой функции при изминении внутреннего стейта
  useEffect(() => {
    setLoading(true);
    searchFunc(searchText);
  }, [searchText]);

  // сбрасывать поиск при переходе между категориями
  useEffect(() => {
    if (!firstRender && query.category && !query.search) {
      setSearchText('');
    }
  }, [query.category]);

  // проставляем значение поисковой строки из query при первом рендере
  useEffect(() => {
    if (firstRender) {
      setSearchText(query.search || '');
    }
  }, [query.search]);

  // memos
  const searchPlaceholder = useMemo(() => {
    return `Искать среди ${catalogContext.catalogLength} товаров в наличии`;
  }, [catalogContext.catalogLength]);

  // event handlers
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const textNormalized = formatUGC(searchText);
      if (textNormalized.length >= 2) {
        ScrollTo(0, 300);

        updateQueryParams({
          location,
          history,
          payload: {
            type: 'search',
            value: `${textNormalized}`,
          },
        });

        sessionContext.setLog({
          type: 'search',
          payload: textNormalized,
        });

        // setSuggestionsOpened(false);
        // setSearchText('');
        inputRef && inputRef.current.blur();
      }
    },
    [searchText, history, location]
  );

  const handleSearchTermClick = useCallback(
    (q) => {
      ScrollTo(0, 300);

      updateQueryParams({
        location,
        history,
        payload: {
          type: 'search',
          value: `${q}`,
        },
      });
      // setSuggestionsOpened(false);
      setShowRecent(false);
      setSearchText(q);

      inputRef && inputRef.current.focus();
    },
    [catalogContext.getCatalogItem, history, location, inputRef]
  );

  const handleSearchChange = useCallback(
    ({ target }) => {
      setSearchText(target.value);
    },
    [setSearchText]
  );

  const handleFocus = useCallback(() => {
    // setSuggestionsOpened(true);
    PlaceholderAnimation.stopAnimation();
  }, []);

  const handleBlur = useCallback(() => {
    // setSuggestionsOpened(true);
    if (showRecent) {
      PlaceholderAnimation.printPhrases();
    }
  }, [showRecent]);

  const handleClearClick = useCallback(() => {
    PlaceholderAnimation.stopAnimation();
    sessionContext.removeLogs('search');
  }, []);

  useOnClickOutside(
    searchRef,
    useCallback((e) => setShowRecent(false), [setShowRecent])
  );

  useEffect(() => {
    if (showRecent) {
      document.body.classList.add('searchShowingRecent');
      PlaceholderAnimation.printPhrases();
    } else {
      PlaceholderAnimation.stopAnimation();
      setTimeout(() => {
        document.body.classList.remove('searchShowingRecent');
      }, 250);
    }
  }, [showRecent]);

  // search animated placeholder
  useEffect(() => {
    if (inputRef) {
      PlaceholderAnimation.init(
        [
          'Мгновенный поиск по каталогу   ',
          'Лист горячекатаный   ',
          'Лист г/к ст3 1.5   ',
          'Трубы электросварные круглые   ',
          'Трубы ЭСВ 18 6000   ',
          'Просечно-вытяжной лист 306   ',
          'ПВЛ 306   ',
        ],
        inputRef.current,
        searchPlaceholder
      );
    }
  }, [inputRef, searchPlaceholder]);

  // Мгновенный поиск по каталогу (стирается полностью)
  // Лист горячекатаный (стирается побуквенно "горячекатаный")
  // Лист г/к ст3 1.5 (стирается полностью)
  // Трубы электросварные круглые (стирается побуквенно "электросварные круглые")
  // Трубы ЭСВ 18 6000 (стирается полностью)
  // Просечно-вытяжной лист 306 (стирается побуквенно полностью)
  // ПВЛ 306

  const haveLog = sessionContext.log && sessionContext.log.search.length > 0;

  return (
    <form className={cns(className, styles.search)} ref={searchRef} onSubmit={handleSearchSubmit}>
      <input
        className={styles.searchInput}
        placeholder={searchPlaceholder}
        value={searchText}
        // onKeyUp={(e) => setSuggestionsOpened(true)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleSearchChange}
        ref={inputRef}
      />

      <button
        className={cns(styles.searchDropdown, showRecent && styles._active)}
        type="button"
        onClick={() => setShowRecent(!showRecent)}>
        <SvgIcon name="caret" key="caret" />
      </button>

      {searchText.length >= 2 && (
        <button className={cns(styles.searchClear)} type="button" onClick={() => setSearchText('')}>
          <SvgIcon name="close" key="close" />
        </button>
      )}

      <button className={styles.searchBtn} type="submit">
        <SvgIcon name="search" key="search" />
      </button>

      <div
        className={cns(styles.suggestions, suggestionsOpened || (showRecent && styles._active))}
        onClick={(e) => e.preventDefault()}>
        <div className={styles.suggestionsWrapper}>
          {loading ? (
            <Spinner />
          ) : searchMeta.total ? (
            <>
              <div className={styles.suggestionsHead}>
                <div className={styles.suggestionsTitle}>
                  <span className="w-700 c-link">{searchMeta.query}</span> найдено {searchMeta.total} товаров
                </div>
              </div>
            </>
          ) : (
            <>
              {/* LOGS */}
              {haveLog && (
                <>
                  <div className={styles.suggestionsHead}>
                    <div className={styles.suggestionsTitle}>Вы искали:</div>
                  </div>
                  <div className={styles.suggestionScrollableList}>
                    {sessionContext.log.search.map((x, idx) => (
                      <div className={styles.suggestion} key={idx} onClick={() => handleSearchTermClick(x.searchTerm)}>
                        <div className={styles.suggestionText}>{x.searchTerm}</div>
                        <div
                          className={styles.suggestionRemove}
                          onClick={(e) => {
                            e.stopPropagation();
                            sessionContext.removeLog(x);
                          }}>
                          <SvgIcon name="close" />
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className={styles.suggestionsClear}>
                    <span onClick={handleClearClick}>Очистить недавние</span>
                  </div>
                </>
              )}
            </>
          )}
        </div>
      </div>
    </form>
  );
});

export default Search;
