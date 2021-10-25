/* eslint-disable react/jsx-key */
import React, { useContext, useMemo, useState, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import cns from 'classnames';
import chunk from 'lodash/chunk';

import { SvgIcon } from '@ui';
import { CatalogStoreContext } from '@store';
import { useWindowSize } from '@hooks';

import CategoryLetter from './CategoryLetter';
import CategoryMain from './CategoryMain';
import styles from './CatalogMenu.module.scss';

const CatalogMenu = observer(({ abcOrder, className }) => {
  const { width } = useWindowSize();
  const [activeLetters, setActiveLetters] = useState(['А']);
  const [mobOpened, setMobOpened] = useState([]);

  const { categoriesList, categoriesAbc } = useContext(CatalogStoreContext);

  // memo getters
  const list = useMemo(() => {
    if (abcOrder) {
      let allSorted = Object.keys(categoriesAbc).reduce((acc, x) => {
        return [...acc, ...categoriesAbc[x]];
      }, []);

      if (activeLetters && activeLetters.length > 0) {
        // enable per-later basis
        // allSorted = findCategoryLetter(allSorted, activeLetters);

        allSorted = allSorted.map((x, idx) => {
          const highlight = activeLetters.includes(x.name[0].toUpperCase());
          const nextElement = allSorted[idx + 1];
          let isLastHightlight = false;
          if (nextElement) {
            isLastHightlight = !activeLetters.includes(nextElement.name[0].toUpperCase());
          }

          return {
            ...x,
            highlight,
            isLastHightlight,
          };
        });
      }

      let colSize = 5;
      if (width < 768) {
        colSize = 1;
      } else if (width < 992) {
        colSize = 3;
      } else if (width < 1200) {
        colSize = 4;
      }

      const splited = chunk(allSorted, Math.ceil(allSorted.length / colSize));

      return {
        list: categoriesAbc,
        categories: splited,
      };
    }

    return categoriesList;
  }, [categoriesList, categoriesAbc, activeLetters, abcOrder, width]);

  const letters = useMemo(() => {
    return list && list.list ? Object.keys(list.list) : [];
  }, [list]);

  // click handlers
  const handleLetterClick = (letter) => {
    // enable multiple select
    // let letters = activeLetters;
    // if (activeLetters.includes(letter)) {
    //   letters = letters.filter((x) => x !== letter);
    // } else {
    //   letters = [...letters, letter];
    // }

    setActiveLetters([letter]);
  };

  const handlePrevClick = useCallback(() => {
    const curIndex = letters.findIndex((x) => activeLetters.includes(x));

    const prevLetter = letters[curIndex - 1];
    if (prevLetter) {
      setActiveLetters([prevLetter]);
    }
  }, [letters, activeLetters]);

  const handleNextClick = useCallback(() => {
    const curIndex = letters.findIndex((x) => activeLetters.includes(x));

    const nextLetter = letters[curIndex + 1];
    if (nextLetter) {
      setActiveLetters([nextLetter]);
    }
  }, [letters, activeLetters]);

  return (
    <div className={cns('catalog', styles.catalog, abcOrder && styles._abc, className)}>
      {abcOrder && list && (
        <div className={styles.abc}>
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

          <div className={cns(styles.abcNav, styles._left)} onClick={handlePrevClick}>
            <SvgIcon name="caret" />
          </div>
          <div className={cns(styles.abcNav, styles._right)} onClick={handleNextClick}>
            <SvgIcon name="caret" />
          </div>
        </div>
      )}

      <>
        {list && list.length > 0 && (
          <div className="row">
            <div className="col col-4 col-md-12">
              {list.slice(0, 2).map((cat) => (
                <CategoryMain key={cat.id} category={cat} mobOpened={mobOpened} setMobOpened={setMobOpened} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
              {list.slice(2, 5).map((cat) => (
                <CategoryMain key={cat.id} category={cat} mobOpened={mobOpened} setMobOpened={setMobOpened} />
              ))}
            </div>
            <div className="col col-4 col-md-12">
              {list.slice(5, 7).map((cat) => (
                <CategoryMain key={cat.id} category={cat} mobOpened={mobOpened} setMobOpened={setMobOpened} />
              ))}
            </div>
          </div>
        )}
      </>
    </div>
  );
});

export default CatalogMenu;

// const findCategoryLetter = (list, activeLetters) => {
//   // console.log(new RegExp(`/\b${activeLetters[0]}\b/`, 'gi'));
//   return (
//     list
//       .filter((x) =>
//         x.name
//           .toUpperCase()
//           .split(' ')
//           .some((word) => word.length > 3 && activeLetters.includes(word[0]))
//       )
//       // highlight syntax
//       .map((x) => ({
//         ...x,
//         short: x.short
//           .split(' ')
//           .map((word) => {
//             if (word[0].toUpperCase() === activeLetters[0]) {
//               return `<mark>${word[0]}</mark>${word.slice(1, word.length)}`;
//             }

//             return word;
//           })
//           .join(' '),
//       }))
//       // sort by priory - first matching word
//       .sort((a, b) => {
//         const aVal = a.name
//           .toUpperCase()
//           .split(' ')
//           .findIndex((word) => word.length > 3 && activeLetters.includes(word[0]));
//         const bVal = b.name
//           .toUpperCase()
//           .split(' ')
//           .findIndex((word) => word.length > 3 && activeLetters.includes(word[0]));

//         return aVal - bVal;
//       })
//   );
// };
