import React, { useContext, useEffect, useMemo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Helmet } from 'react-helmet';
import cns from 'classnames';

import { Button, Breadcrumbs } from '@ui';
import { UiStoreContext } from '@store';
import { useQuery } from '@hooks';
import { updateQueryParams } from '@helpers';

import styles from './NoMatch.module.scss';

const NoMatchPage = observer(() => {
  const history = useHistory();
  const location = useLocation();
  const { query } = useQuery();

  const uiContext = useContext(UiStoreContext);

  const breadcrumbs = useMemo(() => {
    return [
      {
        category: 'all',
        text: 'Каталог',
      },
      {
        text: 'Страница не найдена',
      },
    ];
  }, []);

  useEffect(() => {
    uiContext.updateParams(query);
  }, [query]);

  return (
    <>
      {breadcrumbs && breadcrumbs.length > 0 && (
        <div className={cns(styles.breadcrumbs)}>
          <Breadcrumbs crumbs={breadcrumbs} />
        </div>
      )}
      <div className="container">
        <div className={styles.page404}>
          <div className={styles.page404_Title}>404</div>
          <div className={styles.page404_Subtitle}>К сожалению, страница не найдена</div>
          <div className={styles.page404_Cta}>
            <Button
              theme="accent"
              iconRight="arrow-long"
              onClick={() => {
                updateQueryParams({
                  location,
                  history,
                  payload: {
                    type: 'category',
                    value: 'all',
                  },
                });
              }}>
              Каталог
            </Button>
          </div>
        </div>
      </div>

      <Helmet>
        <title>Page not found</title>
      </Helmet>
    </>
  );
});

export default NoMatchPage;
