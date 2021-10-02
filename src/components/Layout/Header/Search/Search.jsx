import React, { useState, useContext, useRef, useCallback, useEffect } from 'react';
import { observer } from 'mobx-react';
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
  const catalogContext = useContext(CatalogStoreContext);
  const sessionContext = useContext(SessionStoreContext);
  const uiContext = useContext(UiStoreContext);
  const searchRef = useRef(null);

  const [loading, setLoading] = useState(true);
  const [searchText, setSearchText] = useState('');
  const [suggestions, setSuggestions] = useState([]);
  const [suggestionsMeta, setSuggestionsMeta] = useState({ total: null });
  const [suggestionsOpened, setSuggestionsOpened] = useState(false);

  // debounced getter
  const searchFunc = useCallback(
    debounce((txt) => {
      const textNormalized = formatUGC(txt);
      if (textNormalized.length > 2) {
        const { meta, suggestions } = catalogContext.searchCatalog(textNormalized);

        setSuggestionsMeta(meta);
        setSuggestions(suggestions);
      } else {
        setSuggestionsMeta({ total: 0 });
        setSuggestions([]);
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
  const handleSearchSubmit = useCallback(() => {
    const textNormalized = formatUGC(searchText);
    if (textNormalized.length > 2) {
      sessionContext.setLog({
        type: 'search',
        payload: textNormalized,
      });
    }
  }, [searchText, sessionContext.setLog]);

  const handleSuggestionClick = useCallback(
    (id) => {
      const item = catalogContext.getCatalogItem(id);

      console.log({ item });
      uiContext.setModal('cart-add', { ...item });
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
          ) : searchText.trim().length > 2 ? (
            <>
              {/* Search results */}
              <div className={styles.suggestionsHead}>
                <div className={styles.suggestionsTitle}>Результаты поиска:</div>
                {suggestionsMeta.total > 0 && (
                  <div className={styles.suggestionsMeta}>{suggestionsMeta.total} найдено</div>
                )}
              </div>
              {suggestions && suggestions.length > 0 ? (
                <div className={styles.suggestionScrollableList}>
                  {suggestions.map((suggestion) => (
                    <div
                      className={styles.suggestion}
                      key={suggestion.id}
                      onClick={() => handleSuggestionClick(suggestion.id)}>
                      {suggestion.name} ({suggestion.price})
                    </div>
                  ))}
                </div>
              ) : (
                <div className={styles.suggestionEmpty}>
                  Не найдено по запросу <strong>{searchText}</strong>
                </div>
              )}
            </>
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
                      <div className={styles.suggestion} key={idx} onClick={() => setSearchText(x.searchTerm)}>
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
