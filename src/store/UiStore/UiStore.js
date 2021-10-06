import { makeAutoObservable, runInAction } from 'mobx';

export default class UiStore {
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
    this.activeModal = name;
    if (params) {
      this.modalParams = params;
    } else {
      this.modalParams = null;
    }
  }

  resetModal() {
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
}
