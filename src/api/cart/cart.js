import { api, endpoints } from '@api';

export default {
  get: (req) => {
    // @cartId string
    return api.post(endpoints.cart.getItems, null, { params: { ...req } });
  },
  add: (req) => {
    // @cartId string
    // @itemId string
    // @count number
    // @pricePerItem integer(int32)
    // @itemFullName string
    return api.post(endpoints.cart.addItem, null, { params: { ...req } });
  },
  update: (req) => {
    // @cartId string
    // @itemId string
    // @count number
    // @pricePerItem integer(int32)
    return api.post(endpoints.cart.updateItem, null, { params: { ...req } });
  },
  remove: (req) => {
    // @cartId string
    // @itemId string
    return api.post(endpoints.cart.removeItem, null, { params: { ...req } });
  },
  submit: (req) => {
    // @cartId string
    // @phone string
    // @deliveryInfo string
    // @comment string
    // @totalPrice integer(int32)

    const formData = new FormData();

    Object.keys(req).forEach((key) => {
      formData.append(key, req[key]);
    });
    return api.post(endpoints.cart.submit, formData);
  },
};
