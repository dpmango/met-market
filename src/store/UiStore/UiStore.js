import { makeAutoObservable, runInAction } from 'mobx';
import { catalog } from '@store';
import { update } from 'lodash-es';
export default class UiStore {
  prevModal = null;
  activeModal = null;
  modalParams = null;
  header = {
    catalogOpened: false,
    scrolled: false,
    scrolledSticky: false,
  };
  query = {
    search: null,
    category: null,
    page: null,
    size: null,
    mark: null,
    length: null,
    product: null,
    cart: null,
    origin: null,
  };

  constructor() {
    makeAutoObservable(this);

    this.updateParams(new URLSearchParams(window.location.search));
  }

  get catalogOpened() {
    return this.header.catalogOpened;
  }

  // assuming only one modal at given time
  setModal(name, params) {
    this.prevModal = this.activeModal;
    this.activeModal = name;
    if (params) {
      this.modalParams = params;
    } else {
      this.modalParams = null;
    }
  }

  resetModal() {
    this.prevModal = this.activeModal;
    this.activeModal = null;
    this.modalParams = null;
  }

  // header shared params globally
  setHeaderCatalog(state) {
    this.header.catalogOpened = state;
  }

  setScrolled(state) {
    this.header.scrolled = state;
  }

  setScrolledSticky(state) {
    this.header.scrolledSticky = state;
  }

  // params
  updateParams(query) {
    query = query || new URLSearchParams();

    const obj = {
      search: query.get('search') || null,
      category: query.get('category') || null,
      page: query.get('page') || null,
      size: query.get('size') || null,
      mark: query.get('mark') || null,
      length: query.get('length') || null,
      product: query.get('product') || null,
      cart: query.get('cart') || null,
      origin: query,
    };

    console.log(obj);

    this.query = obj;
  }

  checkQuery(query) {
    const params = query;

    const product = params.get('product');
    if (product) {
      const item = catalog.getCatalogItem(product);
      if (item) {
        this.setModal('cart-add', { ...item });
      }
    }
  }
}
