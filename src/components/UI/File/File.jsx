import React, { useState, memo, useEffect, useContext, useCallback } from 'react';
import PropTypes from 'prop-types';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';

import { SvgIcon, Button } from '@ui';
import { CallbackStoreContext } from '@store';
import { formatBytes } from '@helpers';

import styles from './File.module.scss';

const File = ({ className, data, onDelete, onSuccess, onError, ...props }) => {
  const { addToast } = useToasts();

  const [progress, setProgress] = useState(null);

  const callbackContext = useContext(CallbackStoreContext);

  // start upload automatically when file is added
  const handleUpload = useCallback(async () => {
    if (data && data.upload !== null) {
      setProgress(100);
      return;
    }

    await callbackContext
      .uploadFiles([data.file], (progress) => {
        setProgress(progress);
      })
      .then((res) => {
        onSuccess && onSuccess({ file: data.file, id: data.id, upload: res[0] }); // fileId + name
      })
      .catch((err) => {
        addToast(`Ошибка при загрузке файла ${data.file.name}`, { appearance: 'error' });
        onError && onError({ file: data.file, id: data.id, upload: null, error: err });
        return;
      });
  }, [data, onSuccess, onError]);

  useEffect(async () => {
    if (!data.error) {
      await handleUpload();
    }
  }, []);

  return (
    <div className={cns(styles.file, className)} data-id={data.id}>
      <div className={styles.delete} onClick={() => onDelete(data)}>
        <SvgIcon name="close" />
      </div>
      <div className={styles.content}>
        {data.file.name}
        <span>{formatBytes(data.file.size)}</span>
      </div>

      <div className={cns(styles.progress, (progress === 100 || data.error) && styles._uploaded)}>
        <div className={styles.progressInner} style={{ width: `${progress}%` }}></div>
      </div>

      {data.error && (
        <div className={styles.repeat}>
          <Button variant="small" onClick={handleUpload}>
            Повторить загрузку{' '}
          </Button>
        </div>
      )}
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
