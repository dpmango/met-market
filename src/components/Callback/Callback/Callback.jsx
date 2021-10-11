import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { useFormik } from 'formik';

import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { Modal, Spinner, Button, Checkbox, Input, SvgIcon } from '@ui';
import { UiStoreContext, CallbackStoreContext } from '@store';
import { useFirstRender } from '@hooks';
import { ruPhoneRegex } from '@helpers/Validation';
import { formatBytes, bytesToMegaBytes, updateQueryParams } from '@helpers';

import styles from './Callback.module.scss';

const uploader = {
  blacklistMime:
    '386|ade|adp|app|asp|aspx|asx|bas|bat|cer|cgi|chm|cla|class|cmd|cnt|com|cpl|crt|csh|csr|der|diagcab|dll|drv|exe|fxp|gadget|grp|hlp|hpj|hta|htaccess|htc|htpasswd|inf|ins|isp|its|jar|jnlp|js|jse|jsp|ksh|lnk|mad|maf|mag|mam|maq|mar|mas|mat|mau|mav|maw|mcf|mda|mdb|mde|mdt|mdw|mdz|ms|msc|msh|msh1|msh1xml|msh2|msh2xml|mshxml|msi|msp|mst|msu|ocx|ops|osd|pcd|php|php3|pif|pl|plg|prf|prg|printerexport|ps1|ps1xml|ps2|ps2xml|psc1|psc2|psd1|psdm1|pst|py|pyc|pyo|pyw|pyz|pyzw|reg|scf|scr|sct|sh|shb|shs|sys|theme|tmp|torrent|url|vb|vbe|vbp|vbs|vbscript|vhd|vhdx|vsmacros|vsw|webpnp|website|ws|wss|wsc|wsf|wsh|xbap|xll|xnk'.split(
      '|'
    ),
  maxSize: 25,
  includeReader: false,
};

const Callback = observer(() => {
  const { addToast } = useToasts();
  const fileInput = useRef(null);
  const history = useHistory();
  const location = useLocation();
  const firstRender = useFirstRender();

  const [files, setFiles] = useState([]);

  const { activeModal, prevModal, query } = useContext(UiStoreContext);
  const callbackContext = useContext(CallbackStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);

  const handleValidation = useCallback((values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(values.phone)) {
      errors.phone = 'Неверный номер телефона';
    } else if (!values.agree) {
      errors.agree = 'Необходимо согласие';
    }
    return errors;
  }, []);

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      if (loading) return true;
      setLoading(true);

      let buildRequest = {
        type: 'RFQ',
        payload: Object.keys(values).map((key) => ({ id: key, content: `${values[key]}` })),
      };

      if (files && files.length > 0) {
        const uploades = await callbackContext.uploadFile(files);

        if (uploades && uploades.length === 0) {
          addToast('Ошибка при загрузке', { appearance: 'error' });
          setLoading(false);
          setFiles([]);
          return;
        }

        buildRequest = {
          ...buildRequest,
          payload: {
            ...buildRequest.payload,
            ...[{ id: 'uploads', content: uploades }],
          },
        };
      }

      await callbackContext
        .submitForm(buildRequest)
        .then((_res) => {
          resetForm();
          uiContext.setModal('callbacksuccess');
        })
        .catch((_error) => {
          addToast('Ошибка при отправке', { appearance: 'error' });
        });

      setLoading(false);
    },
    [loading, files]
  );

  const submitTyping = useCallback(
    debounce((name, val) => {
      if (name && val) {
        callbackContext
          .typingForm({
            type: 'RFQ',
            payload: { id: name, content: `${val}` },
          })
          .catch((_error) => {
            console.warn('error setting typing');
          });
      }
    }, 3000),
    []
  );

  const handleInputUpload = useCallback(
    (e) => {
      let newUpload = [];
      if (e.target && e.target.files && e.target.files[0]) {
        Array.from(e.target.files).forEach((file) => {
          // limit mime
          if (uploader.blacklistMime) {
            if (uploader.blacklistMime.includes(file.name.split('.').pop())) {
              addToast('Неверный формат файла', { appearance: 'error' });
              e.target.value = '';
              return false;
            }
          }

          // limit size
          if (uploader.maxSize) {
            const sizeInMb = bytesToMegaBytes(file.size);

            if (sizeInMb > uploader.maxSize) {
              addToast('Максимальный размер файла 25мб', { appearance: 'error' });
              e.target.value = '';
              return false;
            }
          }

          if (file) newUpload.push(file);
        });

        setFiles([...files, ...newUpload]);
        e.target.value = '';
      }

      return true;
    },
    [files]
  );

  const handleDeleteClick = useCallback(
    (delFile) => {
      setFiles([...files.filter((f) => f === delFile)]);
    },
    [files]
  );

  useEffect(() => {
    if (prevModal !== 'callback' && activeModal === 'callback') {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'callback',
          value: true,
        },
      });
    } else if (prevModal === 'callback' && activeModal === null) {
      updateQueryParams({
        location,
        history,
        payload: {
          type: 'callback',
          value: false,
        },
      });
    }
  }, [activeModal, prevModal]);

  useEffect(() => {
    if (query.callback) {
      uiContext.setModal('callback');
    } else {
      if (!firstRender) {
        uiContext.resetModal();
      }
    }
  }, [query.callback]);

  const formik = useFormik({
    initialValues: {
      name: '',
      phone: '',
      product: '',
      agree: false,
    },
    validate: handleValidation,
    onSubmit: handleSubmit,
  });

  return (
    <Modal name="callback" variant="narrow">
      <form onSubmit={formik.handleSubmit} className={cns(styles.form, loading && styles._loading)}>
        <div className={styles.formTitle}>Заявка на металл</div>

        <div className={styles.formCta}>
          <a href="https://whatsupp.com" target="_blank" className={styles.formCtaLink} rel="noreferrer">
            <SvgIcon name="social-whatsapp" />
            <span>Whatsapp</span>
          </a>
          <a href="https://t.me/" target="_blank" className={styles.formCtaLink} rel="noreferrer">
            <SvgIcon name="social-telegram" />
            <span>Telegram</span>
          </a>
          <a href="tel:88003508625" className={styles.formCtaLink}>
            <span>8-800-350-86-25</span>
          </a>
        </div>

        <div className={styles.formFields}>
          <div className={styles.group}>
            <Input
              placeholder="Ваше имя"
              value={formik.values.name}
              error={formik.touched.name && formik.errors.name}
              onChange={(v) => {
                formik.setFieldValue('name', v);
                submitTyping('name', v);
              }}
            />
          </div>

          <div className={styles.group}>
            <Input
              type="tel"
              placeholder="Телефон"
              className={styles.reqField}
              mask="+7 (999) 999-99-99"
              value={formik.values.phone}
              error={formik.touched.phone && formik.errors.phone}
              onChange={(v) => {
                formik.setFieldValue('phone', v);
                submitTyping('phone', v);
              }}
            />
          </div>
          <div className={styles.group}>
            <Input
              type="textarea"
              placeholder="Наименование товара"
              rows="1"
              value={formik.values.product}
              error={formik.touched.product && formik.errors.product}
              onChange={(v) => {
                formik.setFieldValue('product', v);
                submitTyping('product', v);
              }}
            />
          </div>

          <div className={styles.group}>
            <div className={styles.upload}>
              <input
                type="file"
                multiple
                id="fileupload"
                name="fileupload"
                ref={fileInput}
                onChange={handleInputUpload}
              />

              {files && files.length > 0 ? (
                <>
                  {files.map((x, idx) => (
                    <div key={idx} className={styles.uploadFile}>
                      <div className={styles.deleteUpload} onClick={() => handleDeleteClick(x)}>
                        <SvgIcon name="close" />
                      </div>
                      {x.name}
                      <span>{formatBytes(x.size)}</span>
                    </div>
                  ))}
                  <label htmlFor="fileupload" onClick={() => fileInput.current.click()}>
                    <Button iconRight="upload">Другой файл</Button>
                  </label>
                </>
              ) : (
                <label htmlFor="fileupload" onClick={() => fileInput.current.click()}>
                  <Button iconRight="upload">Загрузить смету</Button>
                </label>
              )}
            </div>
          </div>

          <div className={styles.group}>
            <Checkbox
              className={styles.actionBtnCta}
              isChecked={formik.values.agree}
              error={formik.touched.agree && formik.errors.agree}
              onChange={() => {
                formik.setFieldValue('agree', !formik.values.agree);
                submitTyping('agree', !formik.values.agree);
              }}>
              <span>
                Подтверждаю свое согласие на{' '}
                <a href="policy.pdf" target="_blank">
                  обработку персональных данных
                </a>
              </span>
            </Checkbox>
          </div>

          <Button type="submit" theme="accent" block loading={loading}>
            Отправить
          </Button>
        </div>
      </form>
    </Modal>
  );
});

export default Callback;
