angular.module('Module.emailpro.services').service('Api.EmailPro', ['Api', '$q', 'constants', '$cacheFactory', function (Api, $q, constants, $cacheFactory) {
  const self = this;
  const cache = $cacheFactory('emailPro');

  function init() {
    angular.forEach(['get', 'put', 'post', 'delete'], (operationType) => {
      self[operationType] = function (a, bParam) {
        let b = bParam;
        if (!b) {
          b = {};
        }
        b.cache = cache;
        b.cache.removeAll();

        return Api[operationType](`${constants.swsProxyRootPath}email/pro${a}`, b).then(data => data, reason => $q.reject(reason));
      };
    });
  }

  init();
}]);
