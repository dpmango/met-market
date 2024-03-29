import { api, endpoints } from '@api';

export default {
  get: (req) => {
    // @cartId string
    return api.post(endpoints.cart.getItems, req);
  },
  new: async (req) => {
    // @sessionId string
    return api.post(endpoints.cart.new, req);
  },
  add: (req) => {
    // @cartId string
    // @itemId string
    // @count number
    // @pricePerItem integer(int32)
    // @itemFullName string
    return api.post(endpoints.cart.addItem, req);
  },
  update: (req) => {
    // @cartId string
    // @itemId string
    // @count number
    // @pricePerItem integer(int32)
    return api.post(endpoints.cart.updateItem, req);
  },
  remove: (req) => {
    // @cartId string
    // @itemId string
    return api.post(endpoints.cart.removeItem, req);
  },
  submit: (req) => {
    // @cartId string
    // @phone string
    // @deliveryInfo string
    // @comment string
    // @totalPrice integer(int32)

    // const formData = new FormData();

    // Object.keys(req).forEach((key) => {
    //   formData.append(key, req[key]);
    // });
    return api.post(endpoints.cart.submit, req);
  },
};
