import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory, useLocation } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { Modal, Spinner, Button, Checkbox, Input, SvgIcon } from '@ui';
import { UiStoreContext, CallbackStoreContext } from '@store';
import { useFirstRender } from '@hooks';
import { ruPhoneRegex } from '@helpers/Validation';
import { formatBytes, bytesToMegaBytes, updateQueryParams } from '@helpers';

import styles from './Callback.module.scss';

const formInitial = {
  name: '',
  phone: '',
  product: '',
  agree: false,
};

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

  const handleValidation = (values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(values.phone)) {
      errors.phone = 'Неверный номер телефона';
    } else if (!values.agree) {
      errors.agree = 'Необходимо согласие';
    }
    return errors;
  };

  const handleSubmit = useCallback(
    async (values, { resetForm }) => {
      if (loading) return true;
      setLoading(true);

      await callbackContext
        .submitForm({
          type: 'RFQ',
          payload: Object.keys(values).map((key) => ({ id: key, content: values[key] })),
        })
        .then((_res) => {
          resetForm();
          uiContext.setModal('callbacksuccess');
        })
        .catch((_error) => {
          addToast('Ошибка при отправке', { appearance: 'error' });
        });

      setLoading(false);
    },
    [loading]
  );

  const submitTyping = useCallback(
    debounce((name, val) => {
      if (name && val) {
        callbackContext
          .typingForm({
            type: 'RFQ',
            payload: { id: name, content: val },
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

  return (
    <Modal name="callback" variant="narrow">
      <Formik initialValues={formInitial} validate={handleValidation} onSubmit={handleSubmit}>
        {({ isSubmitting }) => (
          <Form className={cns(styles.form, loading && styles._loading)}>
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
                <Field name="name">
                  {({ field, form: { setFieldValue }, meta }) => (
                    <Input
                      placeholder="Ваше имя"
                      value={field.value}
                      error={meta.touched && meta.error}
                      onChange={(v) => {
                        setFieldValue(field.name, v);
                        submitTyping(field.name, v);
                      }}
                    />
                  )}
                </Field>
              </div>

              <div className={styles.group}>
                <Field type="tel" name="phone">
                  {({ field, form: { setFieldValue }, meta }) => (
                    <Input
                      placeholder="Телефон"
                      className={styles.reqField}
                      mask="+7 (999) 999-99-99"
                      value={field.value}
                      error={meta.touched && meta.error}
                      onChange={(v) => {
                        setFieldValue(field.name, v);
                        submitTyping(field.name, v);
                      }}
                    />
                  )}
                </Field>
              </div>
              <div className={styles.group}>
                <Field name="product">
                  {({ field, form: { setFieldValue }, meta }) => (
                    <Input
                      type="textarea"
                      placeholder="Наименование товара"
                      rows="1"
                      value={field.value}
                      error={meta.touched && meta.error}
                      onChange={(v) => {
                        setFieldValue(field.name, v);
                        submitTyping(field.name, v);
                      }}
                    />
                  )}
                </Field>
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
                <Field type="checkbox" name="agree">
                  {({ field, form: { setFieldValue }, meta }) => (
                    <Checkbox
                      className={styles.actionBtnCta}
                      isChecked={field.value}
                      error={meta.touched && meta.error}
                      onChange={() => {
                        setFieldValue(field.name, !field.value);
                        submitTyping(field.name, !field.value);
                      }}>
                      <span>
                        Подтверждаю свое согласие на{' '}
                        <a href="policy.pdf" target="_blank">
                          обработку персональных данных
                        </a>
                      </span>
                    </Checkbox>
                  )}
                </Field>
              </div>

              <Button type="submit" theme="accent" block loading={loading} disabled={isSubmitting}>
                Отправить
              </Button>
            </div>
          </Form>
        )}
      </Formik>
    </Modal>
  );
});

export default Callback;
