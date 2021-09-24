import React from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';

import Header from '@components/Layout/Header';

import styles from './Layout.module.scss';

const Variants = {
  MAIN: 'main',
};

const VariantClasses = {
  [Variants.MAIN]: '',
};

const Layout = ({ variant, children }) => {
  return (
    <div className={cns(styles.layout, variant && VariantClasses[variant])}>
      <Header className={styles.header} />

      <main className={styles.main}>{children}</main>
    </div>
  );
};

Layout.propTypes = {
  variant: PropTypes.string,
  children: PropTypes.oneOfType([PropTypes.arrayOf(PropTypes.node), PropTypes.node]).isRequired,
};

Layout.defaultProps = {
  variant: Variants.SIMPLE,
};

export default Layout;
