import React, { useRef, useEffect, useState, useContext, useMemo, useCallback, memo } from 'react';
import { observer } from 'mobx-react';
import { Formik, Form, Field } from 'formik';
import { useToasts } from 'react-toast-notifications';
import debounce from 'lodash/debounce';
import cns from 'classnames';

import { Spinner, Button, Input, SvgIcon } from '@ui';
import { UiStoreContext, CatalogStoreContext, CallbackStoreContext } from '@store';
import { ruPhoneRegex } from '@helpers/Validation';

import styles from './CallbackHero.module.scss';

const formInitial = {
  phone: '',
};

const CallbackHero = observer(() => {
  const { addToast } = useToasts();

  const callbackContext = useContext(CallbackStoreContext);
  const { query } = useContext(UiStoreContext);
  const uiContext = useContext(UiStoreContext);
  const catalogContext = useContext(CatalogStoreContext);

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
        type: 'Hero',
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
            type: 'Hero',
            payload: { id: name, content: val },
          })
          .catch((_error) => {
            console.warn('error setting typing');
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

  if (query.search || query.category) return null;

  return (
    <div className={styles.hero}>
      <div className="container">
        <div className={styles.boxWrapper}>
          <div className={styles.content}>
            <div className={styles.contentText}>
              <div className={styles.contentTitle}>
                ОТГРУЗИМ ЛЮБУЮ ПАРТИЮ <br />
                МЕТАЛЛОПРОКАТА ЗА 24 ЧАСА
              </div>
              <ul className={styles.contentList}>
                <li>Гарантия лучшей цены с заводов производителей </li>
                <li>В наличии {catalogContext.catalogLength} позиций товара </li>
                <li>Полное соответствие ТУ и ГОСТам</li>
              </ul>
            </div>
            <div className={styles.contentBox}>
              <div className={styles.formTitle}>
                Рассчитаем стоимость вашей <br />
                сметы за 30 минут
              </div>

              <Formik initialValues={formInitial} validate={handleValidation} onSubmit={handleSubmit}>
                {({ isSubmitting }) => (
                  <Form className={styles.form}>
                    <Field type="tel" name="phone">
                      {({ field, form: { setFieldValue }, meta }) => (
                        <Input
                          className={styles.formInput}
                          placeholder="Телефон"
                          mask="+7 (999) 999-99-99"
                          value={field.value}
                          error={meta.touched && meta.error}
                          showError={false}
                          onChange={(v) => {
                            setFieldValue(field.name, v);
                            submitTyping(field.name, v);
                          }}
                          onKeyDown={preventSubmitOnEnter}
                        />
                      )}
                    </Field>

                    <Button
                      type="submit"
                      theme="accent"
                      className={cns(styles.formButton, loading && styles._loading)}
                      loading={loading}
                      disabled={isSubmitting}>
                      Рассчитать стоимость
                    </Button>
                  </Form>
                )}
              </Formik>

              <div className={styles.formHelper}>Менеджер перезвонит в ближайшее время</div>
            </div>
          </div>
          <div className={styles.background}>
            <img src="img/callbackHero-bg.jpg" alt="Заказать звонок" />
          </div>
        </div>
      </div>
    </div>
  );
});

export default CallbackHero;
