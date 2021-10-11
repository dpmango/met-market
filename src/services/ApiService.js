export default class ApiService {
  handleError = (e) => {
    const { status } = e.response;

    if (status === 304) {
      console.log('304 :: JSON Catalog is up to date');
    } else {
      console.log('ApiService error -', e);
    }
  };

  handleSuccess = (msg) => {
    // console.log(msg);
  };
}
