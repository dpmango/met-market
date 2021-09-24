import React from 'react';
import { Helmet } from 'react-helmet';
import Login from '@components/Login';

const AuthPage = () => {
  return (
    <>
      <div className="container">
        <Login />
      </div>
      <Helmet>
        <title>Authorization</title>
      </Helmet>
    </>
  );
};

export default AuthPage;
