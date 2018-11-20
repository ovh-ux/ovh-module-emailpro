angular.module('Module.emailpro.services').service('EmailProDomains', function (
  EmailPro,
  OvhHttp,
) {
  this.getDomains = function (serviceName, pageSize, offset, searchParam) {
    const search = searchParam || undefined;

    return OvhHttp.get('/sws/emailpro/{exchange}/domains', {
      rootPath: '2api',
      urlParams: {
        exchange: serviceName,
      },
      params: {
        count: pageSize || 10,
        offset: offset || 0,
        search,
      },
    });
  };

  this.addDomain = function (domainToAdd) {
    return EmailPro.getSelected().then((exchange) => {
      const keyMapping = { mxParam: 'configureMx', srvParam: 'configureAutodiscover' };
      const transformDomain = _.transform(domainToAdd, (result, valueParam, key) => {
        let value = valueParam;
        if (key === 'type') {
          if (value) {
            value = _.camelCase(value);
          }
        }

        if (!_.isEmpty(_.pick(keyMapping, key))) {
          result[keyMapping[key]] = value; // eslint-disable-line
        } else {
          result[key] = value; // eslint-disable-line
        }
      });

      if (transformDomain.type === 'authoritative') {
        delete transformDomain.mxRelay;
      }

      return OvhHttp.post('/email/pro/{exchangeService}/domain', {
        rootPath: 'apiv6',
        urlParams: {
          exchangeService: exchange.domain,
        },
        data: transformDomain,
      }).then((response) => {
        EmailPro.resetDomains();
        EmailPro.resetAccounts();
        EmailPro.resetTasks();
        return response;
      }, err => EmailPro.getSuccessDataOrReject(err));
    });
  };

  this.getAddDomainData = function (serviceName) {
    return OvhHttp.get('/sws/emailpro/{exchange}/domains/options', {
      rootPath: '2api',
      urlParams: {
        exchange: serviceName,
      },
    });
  };

  this.updateDomain = function (organization, productId, domain) {
    return OvhHttp.put('/email/pro/{exchange}/domain/{domainName}', {
      rootPath: 'apiv6',
      urlParams: {
        organization,
        exchange: productId,
        domainName: domain.name,
      },
      data: {
        mxRelay: domain.mxRelay,
        type: _.camelCase(domain.type),
      },
    }).then((response) => {
      EmailPro.resetDomains();
      EmailPro.resetTasks();
      return response;
    });
  };

  this.removeDomain = function (serviceName, name) {
    return OvhHttp.delete('/email/pro/{exchange}/domain/{domainName}', {
      rootPath: 'apiv6',
      urlParams: {
        exchange: serviceName,
        domainName: name,
      },
    }).then((response) => {
      EmailPro.resetDomains();
      EmailPro.resetAccounts();
      EmailPro.resetTasks();
      return response;
    });
  };

  /**
   * Get exchange license history
   */
  this.addZoneDnsField = function (serviceName, data) {
    return OvhHttp.put('/sws/emailpro/{exchange}/domains/{domain}/dnsSettings-update', {
      rootPath: '2api',
      urlParams: {
        exchange: serviceName,
        domain: data.domain,
      },
      data,
    });
  };

  this.getDnsSettings = function (serviceName, domain) {
    return OvhHttp.get('/sws/emailpro/{exchange}/domains/{domain}/dnsSettings', {
      rootPath: '2api',
      urlParams: {
        exchange: serviceName,
        domain,
      },
    });
  };
});
