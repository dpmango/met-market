import React, { useRef, useEffect, useReducer, useContext, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import cns from 'classnames';

import { AuthStoreContext } from '@store/AuthStore';
import { Button, Input } from '@ui';
import routes from '@config/routes';

import styles from './Login.module.scss';

const Login = () => {
  const history = useHistory();

  const reducer = useCallback((state, action) => {
    const { key, value } = action;

    return {
      ...state,
      [key]: value,
    };
  }, []);

  const [state, dispatch] = useReducer(reducer, {
    email: '',
    password: '',
    error: null,
  });

  const authContext = useContext(AuthStoreContext);

  const emailRef = useRef(null);

  const handleEmailChange = (val) => {
    dispatch({ key: 'email', value: val });
  };

  const handlePasswordChange = (val) => {
    dispatch({ key: 'password', value: val });
  };

  const handleSubmit = useCallback(
    (event) => {
      event.preventDefault();

      authContext
        .auth({ email: state.email, password: state.password })
        .then((_res) => {
          history.push(routes.HOME);
        })
        .catch((_error) => {
          dispatch({ key: 'error', value: _error });
        });
    },
    [state]
  );

  useEffect(() => {
    // Focus input element
    emailRef.current.focus();
  }, []);

  return (
    <div className="auth mt-2 mb-2">
      <form className={styles.wrapper} onSubmit={handleSubmit}>
        <div className={styles.title}>Log in</div>

        {state.error && <div className={styles.error}>{state.error}</div>}

        <Input
          label="Email"
          placeholder="Email"
          type="email"
          value={state.email}
          onChange={handleEmailChange}
          inputRef={emailRef}
        />

        <Input
          className="mt-1"
          label="Password"
          placeholder="Password"
          type="password"
          value={state.password}
          onChange={handlePasswordChange}
        />

        <Button block className="mt-2" type="submit">
          Login
        </Button>
      </form>
    </div>
  );
};

export default memo(Login);
