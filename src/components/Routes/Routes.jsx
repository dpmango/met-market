import React, { useContext } from 'react';
import { Router, Switch, Route, Redirect } from 'react-router-dom';

import history from '@config/history';
import Layout from '@c/Layout/';

import NoMatch from './NoMatch';
import Home from './Home';

const Routes = () => {
  return (
    <Layout variant="main">
      <Switch>
        <Route exact path="/">
          <Home />
        </Route>

        <Route component={NoMatch} />
      </Switch>
    </Layout>
  );
};

const CustomRouter = () => (
  <Router history={history}>
    <Routes />
  </Router>
);

export default CustomRouter;
