import { api, endpoints } from '@api';

export default {
  submit: (req) => {
    /**
      @sessionId string
      @formType string
      @fields Array[{id: string, content: string]
    */
    return api.post(endpoints.form.submit, req);
  },
  typing: (req) => {
    /**
      __same_as_submit__
    */
    return api.post(endpoints.form.typing, req);
  },
};
