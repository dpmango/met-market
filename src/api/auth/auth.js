import { api, endpoints } from '@api';

const emailRegex = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;

export default {
  login: (req) => {
    // api.post(endpoints.auth.base, {
    //   params: { email: req.email, password: req.password },
    // }),

    // FAKE API
    return new Promise((resolve, reject) => {
      if (req.password && req.password.length <= 5) {
        reject('Wrong password !');
      } else if (req.email && !emailRegex.test(req.email)) {
        reject('Wrong email !');
      } else {
        resolve({
          data: {
            token: 'abcdefg',
            email: req.email,
          },
        });
      }
    });
  },
};
