import React, { useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import routes from '@config/routes';
import Layout from '@c/Layout/';

import NoMatch from './NoMatch';
import Home from './Home';

const Routes = observer(() => {
  return (
    <Layout variant="main">
      <Switch>
        <Route exact path={routes.HOME}>
          <Home />
        </Route>

        <Route component={NoMatch} />
      </Switch>
    </Layout>
  );
});

const Router = () => (
  <BrowserRouter>
    <Routes />
  </BrowserRouter>
);

export default Router;
