import { LOCAL_STORAGE_GA, LOCAL_STORAGE_AMO, LOCAL_STORAGE_COMAGIC } from '@config/localStorage';
import { session } from '@store';

export const initTrackers = () => {
  // amo
  window.AMOPIXEL_IDENTIFIER_PARAMS = window.AMOPIXEL_IDENTIFIER_PARAMS || {};
  window.AMOPIXEL_IDENTIFIER_PARAMS.onload = function (pixel_identifier) {
    var visitor_uid = pixel_identifier.getVisitorUid();
    var amoTagSend = JSON.parse(localStorage.getItem(LOCAL_STORAGE_AMO));

    if (visitor_uid && amoTagSend !== visitor_uid) {
      session &&
        session.addSessionParams({
          amoVisitorUid: visitor_uid,
        });

      localStorage.setItem(LOCAL_STORAGE_AMO, JSON.stringify(visitor_uid));
    }
  };

  window.createAmoTag = function () {
    (function () {
      var el = document.createElement('script');
      el.src = 'https://piper.amocrm.ru/pixel/js/identifier/pixel_identifier.js';
      el.async = 'async';
      el.id = 'amo_pixel_identifier_js';
      document.head.appendChild(el);
    })();
  };

  // comagic
  window.__cs = window.__cs || [];
  window.__cs.push(['setCsAccount', 'oc3ghoG66vQzGiZiY9BW7Dg0fLcqUaGc']);
  window.__cs.push(['setDynamicalReplacement', true]);

  window.__cs_onReplacePhones = function (phones) {
    try {
      phones.forEach(function (phone) {
        if (phone.dt) {
          session.addSessionParams({
            uisPhone: phone.raw,
          });
        }
      });
    } catch (e) {
      console.info('Erorr setting uisPhone');
    }

    return true;
  };

  window.setUisClientId = function (sessionNumber) {
    if (typeof Comagic !== 'undefined') {
      try {
        const uisClientId = Comagic.getVisitorId();
        var comagicTagSend = JSON.parse(localStorage.getItem(LOCAL_STORAGE_COMAGIC));

        if (uisClientId && comagicTagSend !== uisClientId) {
          session.addSessionParams({
            uisClientId: uisClientId,
          });
          Comagic.addVisitorInfo({ session_number: sessionNumber });
          Comagic.setProperty('session_number', sessionNumber);

          localStorage.setItem(LOCAL_STORAGE_COMAGIC, JSON.stringify(uisClientId));
        }
      } catch (e) {
        console.info('Erorr setting uisClientId');
      }
    }
  };

  window.createComagicTag = function (sessionNumber) {
    (function () {
      var el = document.createElement('script');
      el.src = 'https://app.uiscom.ru/static/cs.min.js';
      el.async = 'true';
      el.addEventListener('load', function () {
        setTimeout(function () {
          window.setUisClientId(sessionNumber);
        }, 300);
        setTimeout(function () {
          window.setUisClientId(sessionNumber);
        }, 1000);
      });
      document.head.appendChild(el);
    })();
  };

  // google analytics
  window.dataLayer = window.dataLayer || [];
  window.gtag = function gtag() {
    window.dataLayer.push(arguments);
  };

  window.setGaClientId = function (sessionNumber) {
    var gaTagSend = JSON.parse(localStorage.getItem(LOCAL_STORAGE_GA)) || [];

    try {
      typeof ga !== 'undefined' &&
        ga.getAll &&
        ga.getAll().forEach((gi) => {
          const clientId = gi.get('clientId');

          if (clientId && !gaTagSend.includes(clientId)) {
            session.addSessionParams({
              gaClientId: clientId,
              gaTagId: gi.get('trackingId'),
            });

            gtag('set', 'user_properties', { client_id: clientId, session_number: sessionNumber });

            localStorage.setItem(LOCAL_STORAGE_GA, JSON.stringify([...gaTagSend, clientId]));
          }
        });
    } catch (e) {
      console.info('Erorr getting GA params', e);
    }
  };

  window.createGATag = function (sessionNumber) {
    (function () {
      var el = document.createElement('script');
      el.src = 'https://www.googletagmanager.com/gtag/js?id=UA-213145548-1';
      el.async = 'true';
      el.addEventListener('load', function () {
        setTimeout(function () {
          window.setGaClientId(sessionNumber);
        }, 300);
        setTimeout(function () {
          window.setGaClientId(sessionNumber);
        }, 1000);
      });
      document.head.appendChild(el);
    })();

    gtag('js', new Date());
    gtag('config', 'UA-213145548-1', { user_id: sessionNumber });
    gtag('config', 'G-JTR149BB93', { user_id: sessionNumber });
    // gtag('set', 'user_properties', { session_number: sessionNumber });
  };
};
