import React, { useContext } from 'react';
import { Route, Redirect } from 'react-router-dom';
import { observer } from 'mobx-react';

import routes from '@config/routes';
import { AuthStoreContext } from '@store/AuthStore';

const ProtectedRoute = observer(({ children, ...rest }) => {
  const { isAuthenticated } = useContext(AuthStoreContext);

  return (
    <Route
      {...rest}
      render={(props) =>
        isAuthenticated ? (
          children
        ) : (
          <Redirect
            to={{
              pathname: routes.ENTRY.AUTH,
              state: { from: props.location },
            }}
          />
        )
      }
    />
  );
});

export default ProtectedRoute;
