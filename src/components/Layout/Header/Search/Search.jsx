import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
import { useHistory, useLocation } from 'react-router';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { SvgIcon, Spinner } from '@ui';
import { CatalogStoreContext, SessionStoreContext, UiStoreContext } from '@store';
import { useOnClickOutside } from '@hooks';
import { formatUGC } from '@helpers';

import styles from './Search.module.scss';

const settings = {
  delay: 500,
};

const Search = observer(({ className }) => {
  const history = useHistory();
  const location = useLocation();

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [suggestionsOpened, setSuggestionsOpened] = useState(false);

  const catalogContext = useContext(CatalogStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const uiContext = useContext(UiStoreContext);
  const searchRef = useRef(null);

  // debounced getter
  const searchFunc = useCallback(
    debounce((txt) => {
      const textNormalized = formatUGC(txt);
      if (textNormalized.length > 2) {
        const { meta, suggestions } = catalogContext.searchCatalog(textNormalized);

        const params = new URLSearchParams({
          search: `${textNormalized}`,
        });

        sessionContext.setLog({
          type: 'search',
          payload: textNormalized,
        });

        history.push({
          pathname: location.pathname,
          search: params.toString(),
        });
      }

      setLoading(false);
    }, settings.delay),
    []
  );

  useEffect(() => {
    setLoading(true);
    searchFunc(searchText);
  }, [searchText]);

  // event handlers
  const handleSearchSubmit = useCallback(
    (e) => {
      e.preventDefault();
      // const textNormalized = formatUGC(searchText);
      // if (textNormalized.length > 2) {
      //   sessionContext.setLog({
      //     type: 'search',
      //     payload: textNormalized,
      //   });
      // }
    },
    [searchText]
  );

  const handleSearchTermClick = useCallback(
    (query) => {
      const params = new URLSearchParams({
        search: `${query}`,
      });

      history.push({
        pathname: location.pathname,
        search: params.toString(),
      });
    },
    [catalogContext.getCatalogItem]
  );

  const handleSearchChange = useCallback(
    ({ target }) => {
      setSearchText(target.value);
    },
    [setSearchText]
  );

  const handleFocus = useCallback(() => {
    setSuggestionsOpened(true);
  }, []);

  const handleBlur = useCallback(() => {
    // setSuggestionsOpened(true);
  }, []);

  useOnClickOutside(
    searchRef,
    useCallback((e) => setSuggestionsOpened(false), [setSuggestionsOpened])
  );

  return (
    <div className={styles.search} ref={searchRef}>
      <input
        className={styles.searchInput}
        placeholder="Искать среди 845 товаров в наличии"
        value={searchText}
        onKeyUp={(e) => setSuggestionsOpened(true)}
        onFocus={handleFocus}
        onBlur={handleBlur}
        onChange={handleSearchChange}
      />
      <button className={styles.searchBtn} onClick={handleSearchSubmit}>
        <SvgIcon name="search" />
      </button>

      <div className={cns(styles.suggestions, suggestionsOpened && styles._active)} onClick={(e) => e.preventDefault()}>
        <div className={styles.suggestionsWrapper}>
          {loading ? (
            <Spinner />
          ) : (
            <>
              {/* LOGS */}
              {sessionContext.log.search && sessionContext.log.search.length > 0 && (
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
                </>
              )}
            </>
          )}
        </div>
      </div>
    </div>
  );
});

export default Search;
