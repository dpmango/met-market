import { makeAutoObservable, runInAction } from 'mobx';
import { catalog } from '@store';
export default class UiStore {
  prevModal = null;
  activeModal = null;
  modalParams = null;
  header = {
    catalogOpened: false,
    scrolled: false,
  };

  constructor() {
    makeAutoObservable(this);
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
