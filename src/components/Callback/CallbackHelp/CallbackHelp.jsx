import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { useHistory } from 'react-router-dom';
import { observer } from 'mobx-react';
import { Formik, Form, Field, ErrorMessage } from 'formik';
import { useToasts } from 'react-toast-notifications';
import cns from 'classnames';
import debounce from 'lodash/debounce';

import { Modal, Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CallbackStoreContext } from '@store';
import { ruPhoneRegex } from '@helpers/Validation';

import styles from './CallbackHelp.module.scss';

const formInitial = {
  phone: '',
};

const CallbackHelp = observer(() => {
  const { addToast } = useToasts();

  const callbackContext = useContext(CallbackStoreContext);
  const uiContext = useContext(UiStoreContext);

  const [loading, setLoading] = useState(false);

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
        type: 'Help',
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
            type: 'Help',
            payload: { id: name, content: `${val}` },
          })
          .catch((_error) => {
            // console.log('error setting typing');
          });
      }
    }, 3000),
    []
  );

  const preventSubmitOnEnter = useCallback((e) => {
    if (e.keyCode === 13) {
      e.target.blur();
      return;
    }
  }, []);

  return (
    <div className={styles.help}>
      <div className="container">
        <div className={styles.boxWrapper}>
          <div className={styles.content}>
            <div className={styles.head}>
              <div className={styles.headTitle}>Не нашли, что искали?</div>
              <div className={styles.headSubtitle}>Оставьте номер и мы проконсультируем Вас</div>
            </div>

            <Formik
              initialValues={formInitial}
              validateOnChange={false}
              validate={handleValidation}
              onSubmit={handleSubmit}>
              {({ isSubmitting, setFieldError }) => (
                <Form className={styles.form}>
                  <Field type="tel" name="phone">
                    {({ field, form: { setFieldValue }, meta }) => (
                      <Input
                        className={styles.formInput}
                        placeholder="Телефон"
                        mask="+7 (999) 999-99-99"
                        value={field.value}
                        error={meta.touched && meta.error}
                        onChange={(v) => {
                          setFieldValue(field.name, v);
                          submitTyping(field.name, v);
                          setFieldError(field.name);
                        }}
                        onKeyDown={preventSubmitOnEnter}
                      />
                    )}
                  </Field>

                  <Button
                    type="submit"
                    theme="accent"
                    loading={loading}
                    className={styles.formButton}
                    disabled={isSubmitting}>
                    Заказать звонок
                  </Button>
                </Form>
              )}
            </Formik>
          </div>
          <div className={styles.background}>
            <img src="/img/callbackHelp-bg.jpg" alt="Заказать звонок" />
          </div>
        </div>
      </div>

      <div className={styles.decor}></div>
    </div>
  );
});

export default CallbackHelp;
