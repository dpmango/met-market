import { makeAutoObservable, runInAction } from 'mobx';

export default class UiStore {
  activeModal = null;
  modalParams = null;

  constructor() {
    makeAutoObservable(this);
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
}
