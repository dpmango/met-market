/* eslint-disable react/jsx-key */
import React, { useContext, useMemo, useState, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';
import chunk from 'lodash/chunk';

import { CatalogStoreContext } from '@store';

import CategoryLetter from './CategoryLetter';
import CategoryMain from './CategoryMain';
import styles from './CatalogMenu.module.scss';

const CatalogMenu = observer(({ abcOrder, className }) => {
  const { categoriesList, categoriesAbc } = useContext(CatalogStoreContext);

  const [activeLetters, setActiveLetters] = useState(['А']);

  const handleLetterClick = (letter) => {
    // let letters = activeLetters;
    // if (activeLetters.includes(letter)) {
    //   letters = letters.filter((x) => x !== letter);
    // } else {
    //   letters = [...letters, letter];
    // }

    setActiveLetters([letter]);
  };

  const list = useMemo(() => {
    if (abcOrder) {
      let allSorted = Object.keys(categoriesAbc).reduce((acc, x) => {
        return [...acc, ...categoriesAbc[x]];
      }, []);

      if (activeLetters && activeLetters.length > 0) {
        allSorted = allSorted.filter((x) =>
          x.name
            .toUpperCase()
            .split(' ')
            .some((word) => activeLetters.includes(word[0]))
        );
      }

      allSorted = allSorted.map((x) => ({
        ...x,
        name: x.name
          .replace('нержавеющие', 'нерж.')
          .replace('нержавеющий', 'нерж.')
          .replace('никельсодержащий', 'никель')
          .replace('равнополочный', 'рвнпр.')
          .replace('обыкновенного качества', 'об. кач.')
          .replace('низколегированный', 'н/л')
          .replace('низколегированные', 'н/л')
          .replace('электросварные', 'э/с')
          .replace('жаропрочный', 'жар')
          .replace('горячекатаный', 'горяч.')
          .replace('инструментальный', 'инстр.'),
      }));

      const splited = chunk(allSorted, Math.ceil(allSorted.length / 5));

      return {
        list: categoriesAbc,
        categories: splited,
      };
    }
    return categoriesList;
  }, [categoriesList, categoriesAbc, activeLetters, abcOrder]);

  return (
    <div className={cns(styles.catalog, className)}>
      {abcOrder && list && (
        <>
          <div className={styles.letters}>
            {Object.keys(list.list).map((letter) => (
              <div
                className={cns(styles.letter, activeLetters.includes(letter) && styles._active)}
                onClick={() => handleLetterClick(letter)}>
                {letter}
              </div>
            ))}
          </div>

          {list.categories && list.categories.length > 0 && (
            <div className="row">
              {list.categories.map((cat, idx) => (
                <div className={cns('col', styles.lettercol)}>
                  <CategoryLetter list={cat} key={idx} />
                </div>
              ))}
            </div>
          )}
        </>
      )}

      <>
        {list && list.length > 0 && (
          <div className="row">
            <div className="col col-4 col-md-12">
              {list.slice(0, 2).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
              {list.slice(2, 5).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
              {list.slice(5, 7).map((cat) => (
                <CategoryMain key={cat.id} category={cat} />
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  );
});

export default CatalogMenu;
