angular.module('Module.emailpro.services').service('Api.EmailPro', ['WucApi', '$q', 'constants', '$cacheFactory', function (WucApi, $q, constants, $cacheFactory) {
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

        return WucApi[operationType](`${constants.swsProxyRootPath}email/pro${a}`, b).then(data => data, reason => $q.reject(reason));
      };
    });
  }

  init();
}]);
