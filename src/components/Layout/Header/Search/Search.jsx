import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { SvgIcon, Spinner } from '@ui';
import { CatalogStoreContext, SessionStoreContext, UiStoreContext } from '@store';
import { useOnClickOutside, useFirstRender } from '@hooks';
import { formatUGC, updateQueryParams } from '@helpers';

import styles from './Search.module.scss';

const settings = {
  delay: 400,
};

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

      // const { meta } = catalogContext.searchCatalog(textNormalized, null);

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

        // setSearchMeta({
        //   total: meta.total,
        //   query: textNormalized,
        // });
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

        // setSearchMeta({
        //   total: null,
        // });
      }

      setLoading(false);
    }, settings.delay),
    [location, history, firstRender]
  );

  useEffect(() => {
    setLoading(true);
    searchFunc(searchText);
  }, [searchText]);

  useEffect(() => {
    if (searchText !== query.search || '') {
      setSearchText(query.search || '');
    }
  }, [query.search]);

  // event handlers
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();

      const textNormalized = formatUGC(searchText);
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

        // setSuggestionsOpened(false);
        // setSearchText('');
      }
    },
    [searchText, history, location]
  );

  const handleSearchTermClick = useCallback(
    (q) => {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'search',
          value: `${q}`,
        },
      });
      // setSuggestionsOpened(false);
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
  }, []);

  const handleBlur = useCallback(() => {
    // setSuggestionsOpened(true);
  }, []);

  const handleClearClick = useCallback(() => {
    sessionContext.removeLogs('search');
  }, []);

  useOnClickOutside(
    searchRef,
    useCallback((e) => setShowRecent(false), [setShowRecent])
  );

  const haveLog = sessionContext.log && sessionContext.log.search.length > 0;

  return (
    <form className={styles.search} ref={searchRef} onSubmit={handleSearchSubmit}>
      <input
        className={styles.searchInput}
        placeholder={`Искать среди ${catalogContext.catalogLength} товаров в наличии`}
        value={searchText}
        // onKeyUp={(e) => setSuggestionsOpened(true)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleSearchChange}
        ref={inputRef}
      />
      {haveLog && (
        <button
          className={cns(styles.searchDropdown, showRecent && styles._active)}
          type="button"
          onClick={() => setShowRecent(!showRecent)}>
          <SvgIcon name="caret" key="caret" />
        </button>
      )}
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
