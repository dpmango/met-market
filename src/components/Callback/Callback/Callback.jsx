import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { Modal, Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CallbackStoreContext } from '@store';
import { useQuery } from '@hooks';
import { ruPhoneRegex } from '@helpers/Validation';

import styles from './Callback.module.scss';

const formInitial = {
  name: '',
  phone: '',
  product: '',
};

const Callback = observer(() => {
  const { addToast } = useToasts();

  const callbackContext = useContext(CallbackStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);
  const [savedValues, setSavedValues] = useState(formInitial);

  const handleValidation = (values) => {
    const errors = {};
    if (!values.phone) {
      errors.phone = 'Введите телефон';
    } else if (!ruPhoneRegex.test(values.phone)) {
      errors.phone = 'Неверный номер телефона';
    }
    return errors;
  };

  const handleSubmit = useCallback(async (values, { resetForm }) => {
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
  }, []);

  const submitTyping = useCallback(
    debounce((name, val) => {
      if (name && val) {
        callbackContext
          .typingForm({
            type: 'RFQ',
            payload: { id: name, content: val },
          })
          .catch((_error) => {
            console.log('error setting typing');
          });
      }
    }, 3000),
    []
  );
  return (
    <Modal name="callback" variant="narrow">
      <Formik initialValues={formInitial} validate={handleValidation} onSubmit={handleSubmit}>
        {({ isSubmitting, values }) => (
          <Form className={styles.form}>
            <div className={styles.formTitle}>Заявка на металл</div>

            <div className={styles.formCta}>
              <a href="https://whatsupp.com" className={styles.formCtaLink}>
                <SvgIcon name="social-whatsapp" />
                <span>Whatsapp</span>
              </a>
              <a href="https://t.me/" className={styles.formCtaLink}>
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
                      mask="+7 (999) 999-99-99"
                      value={field.value}
                      error={meta.touched && meta.error}
                      onChange={(v) => {
                        setFieldValue(field.name, v);
                        setSavedValues(field.name, v);
                      }}
                    />
                  )}
                </Field>
              </div>
              <div className={styles.group}>
                <Field name="product">
                  {({ field, form: { setFieldValue }, meta }) => (
                    <Input
                      placeholder="Наименование товара"
                      value={field.value}
                      error={meta.touched && meta.error}
                      onChange={(v) => {
                        setFieldValue(field.name, v);
                        setSavedValues(field.name, v);
                      }}
                    />
                  )}
                </Field>
              </div>

              <Button type="submit" theme="accent" block disabled={isSubmitting}>
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
