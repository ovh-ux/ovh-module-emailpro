angular
  .module('emailproServices')
  .service('emailproConfigure', class {
    constructor(
      EmailPro,
      OvhHttp,
    ) {
      this.EmailPro = EmailPro;
      this.OvhHttp = OvhHttp;
    }

    fetchingDetails(service) {
      return this.EmailPro
        .gettingBaseAPIPath()
        .then(baseAPIPath => this.OvhHttp
          .get(`/${baseAPIPath}/${service}`, {
            rootPath: 'apiv6',
          }));
    }

    updatingDetails(service, data) {
      return this.EmailPro
        .gettingBaseAPIPath()
        .then(baseAPIPath => this.OvhHttp
          .put(`/${baseAPIPath}/${service}`, {
            rootPath: 'apiv6',
            data,
          }));
    }
  });
