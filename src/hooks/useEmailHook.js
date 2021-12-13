import React, { useContext, useRef, useCallback } from 'react';
import { useToasts } from 'react-toast-notifications';

import { SessionStoreContext } from '@store';
import { isMobile, EVENTLIST, logEvent } from '@helpers';

export const useEmailHook = (name) => {
  const { addToast } = useToasts();
  const emailRef = useRef(null);
  const { cartNumber } = useContext(SessionStoreContext);

  const getEmail = useCallback(() => {
    const a = emailRef.current.getAttribute('data-start');
    const b = emailRef.current.getAttribute('data-end');

    if (cartNumber) {
      return `${a}+${cartNumber}@${b}`;
    } else {
      return `${a}@${b}`;
    }
  }, [emailRef, cartNumber]);

  const handleEmailClick = useCallback(
    (e) => {
      const email = getEmail();

      e.preventDefault();

      if (!isMobile()) {
        const el = document.createElement('textarea');
        el.value = email;
        el.setAttribute('readonly', '');
        el.style.position = 'absolute';
        el.style.left = '-9999px';
        document.body.appendChild(el);
        el.select();
        document.execCommand('copy');
        document.body.removeChild(el);

        addToast('Cкопировано в буфер обмена', { appearance: 'success' });
      } else {
        window.open(`mailto:${email}`);
      }

      logEvent({ name: EVENTLIST.CLICK_EMAIL, params: { from: name } });
    },
    [emailRef, cartNumber]
  );

  const handleEmailHover = useCallback(() => {
    const email = getEmail();

    emailRef.current.setAttribute('href', `mailto:${email}`);
  }, [emailRef, cartNumber]);

  return {
    emailRef,
    getEmail,
    handleEmailClick,
    handleEmailHover,
  };
};
