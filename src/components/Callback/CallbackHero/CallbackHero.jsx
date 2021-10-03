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

import styles from './CallbackHero.module.scss';

const formInitial = {
  phone: '',
};

const CallbackHero = observer(() => {
  const { addToast } = useToasts();
  const query = useQuery();
  const categoryQuery = query.get('category');
  const searchQuery = query.get('search');

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
            console.log('error setting typing');
          });
      }
    }, 3000),
    []
  );

  if (categoryQuery || searchQuery) return null;

  return (
    <div className={styles.hero}>
      <div className="container">
        <div className={styles.boxWrapper}>
          <div className={styles.content}>
            <div className={styles.contentText}>
              <div className={styles.contentTitle}>
                ОГРУЗИМ ЛЮБУЮ ПАРТИЮ <br />
                МЕТАЛЛОПРОКАТА ЗА 24 ЧАСА
              </div>
              <ul className={styles.contentList}>
                <li>Гарантия лучшей цены с заводов производителей </li>
                <li>В наличии 8 765 позиций товара </li>
                <li>Полное соответствие ТУ и ГОСТам</li>
              </ul>
            </div>
            <div className={styles.contentBox}>
              <div className={styles.formTitle}>Рассчитаем стоимость вашей сметы за 30 минут</div>

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
                          onChange={(v) => {
                            setFieldValue(field.name, v);
                            submitTyping(field.name, v);
                          }}
                        />
                      )}
                    </Field>

                    <Button type="submit" theme="accent" className={styles.formButton} disabled={isSubmitting}>
                      Заказать звонок
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
