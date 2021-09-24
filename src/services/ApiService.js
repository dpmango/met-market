export default class ApiService {
  handleError = (e) => {
    console.log('ApiService error -', e);
  };

  handleSuccess = (msg) => {
    console.log(msg);
  };
}
