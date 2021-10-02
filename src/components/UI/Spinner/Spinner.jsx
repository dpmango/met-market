import React, { memo, useState, useContext, useMemo, createContext, useEffect } from 'react';
import PropTypes from 'prop-types';
import cns from 'classnames';
import PulseLoader from 'react-spinners/PulseLoader';

import styles from './Spinner.module.scss';

const Spinner = ({ className, ...props }) => {
  return (
    <div className={cns(styles.loader, className)}>
      <PulseLoader color="#182D78" loading={true} size={12} />
    </div>
  );
};

Spinner.propTypes = {
  className: PropTypes.string,
};

export default memo(Spinner);
