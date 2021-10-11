import React from 'react';
import { Helmet } from 'react-helmet';

const NoMatchPage = () => {
  return (
    <div className="container">
      <div className="h1-title">Страница не найдена</div>

      <Helmet>
        <title>Page not found</title>
      </Helmet>
    </div>
  );
};

export default NoMatchPage;
