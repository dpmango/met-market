import React, { useContext } from 'react';
import { BrowserRouter, Switch, Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import routes from '@config/routes';
import Layout from '@components/Layout/';
import { AuthStoreContext } from '@store/AuthStore';

import ProtectedRoute from './ProtectedRoute';
import NoMatch from './NoMatch';
import Home from './Home';
import Auth from './Auth';

const Routes = observer(() => {
  const { isAuthenticated } = useContext(AuthStoreContext);

  return (
    <Layout variant="main">
      <Switch>
        <ProtectedRoute exact path={routes.HOME}>
          <Home />
        </ProtectedRoute>

        <Route path={routes.ENTRY.AUTH}>{isAuthenticated ? <Redirect to={routes.HOME} /> : <Auth />}</Route>

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
