import React, { useState, memo, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';

import { SvgIcon } from '@ui';
import { CallbackStoreContext } from '@store';
import { formatBytes } from '@helpers';

import styles from './File.module.scss';

const File = ({ className, data, onDelete, onSuccess, onError, ...props }) => {
  const { addToast } = useToasts();

  const [progress, setProgress] = useState(null);

  const callbackContext = useContext(CallbackStoreContext);

  // start upload automatically when file is added
  useEffect(async () => {
    if (data && data.upload !== null) {
      setProgress(100);
      return;
    }

    const upload = await callbackContext
      .uploadFiles([data.file], (progress) => {
        setProgress(progress);
      })
      .catch((err) => {
        addToast(`Ошибка при загрузке файла ${data.file.name}`, { appearance: 'error' });
        onError && onError(err);
        return;
      });

    if (upload && upload.length > 0) {
      onSuccess && onSuccess({ file: data.file, upload: upload[0] }); // fileId + name
    }
  }, []);

  return (
    <div className={cns(styles.file, className)}>
      <div className={styles.delete} onClick={() => onDelete(data)}>
        <SvgIcon name="close" />
      </div>
      <div className={styles.content}>
        {data.file.name}
        <span>{formatBytes(data.file.size)}</span>
      </div>

      <div className={cns(styles.progress, progress === 100 && styles._uploaded)}>
        <div className={styles.progressInner} style={{ width: `${progress}%` }}></div>
      </div>
    </div>
  );
};

File.propTypes = {
  className: PropTypes.string,
  data: PropTypes.object,
  handleDeleteClick: PropTypes.func,
};

File.defaultProps = {};

export default memo(File);
