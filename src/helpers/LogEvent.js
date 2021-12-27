import { session, ui, catalog } from '@store';
import { v4 } from 'uuid';
import service from '@store/SessionStore/api-service';

const rememberEvents = {
  search: false,
};

export const EVENTLIST = {
  PAGELOAD: {
    backend: 'pageLoad',
    shouldLogCatalogState: true,
  },
  CLICK_PRICELIST: {
    backend: 'clickPriceList',
    ym: 'clickPriceList',
    ga: {
      category: 'priceList',
      action: 'click',
    },
  },
  CLICK_OPENFORM_RFQ: {
    backend: 'clickOpenFormRfq',
  },
  FILE_UPLOAD: {
    ym: 'fileUpload',
    ga: {
      category: 'form',
      action: 'fileUpload',
    },
  },
  CLICK_OPENCART: {
    backend: 'clickOpenCart',
  },
  CLICK_WHATSAPP: {
    backend: 'clickWhatsapp',
    ym: 'clickWhatsapp',
    ga: {
      category: 'contact',
      action: 'click',
      label: 'whatsapp',
    },
  },
  CLICK_TELEGRAM: {
    backend: 'clickTelegram',
    ym: 'clickTelegram',
    ga: {
      category: 'contact',
      action: 'click',
      label: 'telegram',
    },
  },
  CLICK_PHONE: {
    backend: 'clickPhone',
    ym: 'clickPhone',
    ga: {
      category: 'contact',
      action: 'click',
      label: 'phone',
    },
  },
  CLICK_EMAIL: {
    backend: 'clickEmail',
    ym: 'clickEmail',
    ga: {
      category: 'contact',
      action: 'click',
      label: 'email',
    },
  },
  CLICK_COMPANYNAME: {
    backend: 'clickCompanyName',
    ym: 'clickCompanyName',
    ga: {
      category: 'contact',
      action: 'interact',
      label: 'companyName',
    },
  },
  CLICK_COMPANYINN: {
    backend: 'clickCompanyInn',
    ym: 'clickCompanyInn',
    ga: {
      category: 'contact',
      action: 'interact',
      label: 'companyInn',
    },
  },
  CLICK_COMPANYADDRESS: {
    backend: 'clickCompanyAddress',
    ym: 'clickCompanyAddress',
    ga: {
      category: 'contact',
      action: 'interact',
      label: 'companyAddress',
    },
  },
  CLICK_CATALOGBUTTON: {
    backend: 'clickCatalogButton',
  },
  CLICK_SCROLLTOP: {
    backend: 'clickScrollTop',
  },
  CLICK_PRODUCT: {
    backend: 'clickProduct',
  },
  CLICK_ADDTOCART: {
    backend: 'clickAddToCart',
    ym: 'clickAddToCart',
    ga: {
      category: 'cart',
      action: 'addToCart',
    },
  },
  CLICK_CATEGORY: {
    backend: 'clickCategory',
    shouldLogCatalogState: true,
  },
  CLICK_ABC_CATEGORIES_SWITCH: {
    backend: 'clickAbcCategoriesSwitch',
  },
  CLICK_FILTERLIST: {
    backend: 'clickFilterList',
  },
  CLICK_FILTER: {
    backend: 'clickFilter',
    ym: 'clickFilter',
    ga: {
      category: 'catalog',
      action: 'clickFilter',
    },
    shouldLogCatalogState: true,
  },
  CLICK_CLEAR_FILTERS: {
    backend: 'clickClearFilters',
    shouldLogCatalogState: true,
  },
  SEARCH: {
    backend: 'search', // also routed to addCatalogState
    ym: 'search',
    ga: {
      category: 'catalog',
      action: 'search',
    },
    once: true,
    shouldLogCatalogState: true,
  },
  CLICK_SEARCH: {
    backend: 'clickSearch',
  },
  CLICK_SEARCH_CLEAR: {
    backend: 'clickSearchClear',
    shouldLogCatalogState: true,
  },
  CLICK_SEARCH_HISTORYLIST: {
    backend: 'clickSearchHistoryList',
  },
  CLICK_SEARCH_HISTORYITEM: {
    backend: 'clickSearchHistoryItem',
  },
  SEND_LEAD_FORM_RFQ: {
    backend: 'sendLeadForm',
    ym: 'sendLeadFormRfq',
    ga: {
      category: 'form',
      action: 'sendLeadForm',
      label: 'rfq',
    },
  },
  SEND_LEAD_FORM_HERO: {
    backend: 'sendLeadForm',
    ym: 'sendLeadFormHero',
    ga: {
      category: 'form',
      action: 'sendLeadForm',
      label: 'hero',
    },
  },
  SEND_LEAD_FORM_HELP: {
    backend: 'sendLeadForm',
    ym: 'sendLeadFormHelp',
    ga: {
      category: 'form',
      action: 'sendLeadForm',
      label: 'help',
    },
  },
  MAKE_ORDER: {
    backend: 'makeOrder',
    ym: 'makeOrder',
    ga: {
      category: 'cart',
      action: 'makeOrder',
    },
  },
};

export const logEvent = async ({ name, params }) => {
  // eventID shouild be same for logEvent and catalogLogEvent
  const eventId = v4();

  // backend events
  if (name.backend) {
    let request = {
      eventId: eventId,
      sessionId: session.sessionId,
      eventName: name.backend,
    };

    if (params) {
      request = {
        ...request,
        params,
      };
    }

    service.logEvent(request);
  }

  // yandex metrika
  if (name.ym && !rememberEvents[name.backend]) {
    window.ym(86522567, 'reachGoal', name.ym, params || {});
  }

  // google analytics
  if (name.ga && !rememberEvents[name.backend]) {
    let gtagParams = {};

    if (name.ga.category) {
      gtagParams = {
        ...gtagParams,
        event_category: name.ga.category,
      };
    }
    if (name.ga.label) {
      gtagParams = {
        ...gtagParams,
        event_label: name.ga.label,
      };
    }

    window.gtag('event', name.ga.action || 'event', gtagParams);
  }

  // some evens should be triggered once for ga & ym
  if (name.once) {
    rememberEvents[name.backend] = true;
  }

  // catalog log
  if (name.shouldLogCatalogState) {
    window.logCatalogEvent = (req) => {
      const catalogLogRequest = {
        eventId: eventId || v4(),
        ...req,
      };
      session.logCatalog(catalogLogRequest);
    };

    ui.setPageLoaded(true);
  }

  return true;
};
