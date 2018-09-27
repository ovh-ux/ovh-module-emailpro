angular.module('Module.emailpro.controllers').controller('EmailProTabDomainsCtrl', ($scope, $http, $stateParams, $translate, EmailPro, EmailProDomains) => {
  $scope.domainTypeAuthoritative = 'AUTHORITATIVE';
  $scope.domainTypeNonAuthoritative = 'NON_AUTHORITATIVE';
  $scope.stateCreating = EmailPro.stateCreating;
  $scope.stateDeleting = EmailPro.stateDeleting;
  $scope.stateOk = EmailPro.stateOk;

  const init = function () {
    $scope.loading = false;
    $scope.paginated = null;
    $scope.search = { value: null };

    EmailPro.getSelected().then((exchange) => {
      $scope.exchange = exchange;
      if ($scope.exchange.offer === 'PROVIDER') {
        $scope.cnameRedirection = 'ex-mail.biz';
      } else {
        $scope.cnameRedirection = 'ovh.com';
      }
    });
  };

  function isReseller2010AuthInvalidMx(domain) {
    return $scope.exchange.offer === 'PROVIDER'
      && $scope.exchange.serverDiagnostic.commercialVersion === '_2010'
      && domain.type === 'AUTHORITATIVE'
      && !domain.mxValid;
  }

  $scope.updateDomain = function (domain) {
    if (domain.state === $scope.stateOk
      && !domain.taskInProgress
      && !isReseller2010AuthInvalidMx(domain)) {
      _.set(domain, 'domainTypes', $scope.domainTypes);
      $scope.setAction('emailpro/domain/update/emailpro-domain-update', angular.copy(domain));
    }
  };

  $scope.isEditDisabled = function (domain) {
    return domain.state !== $scope.stateOk
      || domain.taskInProgress
      || isReseller2010AuthInvalidMx(domain);
  };

  $scope.isDeleteDisabled = function (domain) {
    return domain.state !== $scope.stateOk || domain.accountsCount > 0;
  };

  $scope.deleteDomain = function (domain) {
    if (domain.state === $scope.stateOk && domain.accountsCount === 0) {
      $scope.setAction('emailpro/domain/remove/emailpro-domain-remove', domain);
    }
  };

  function setMxTooltip(domain) {
    if (domain.mxValid) {
      _.set(domain, 'mxTooltip', $translate.instant('emailpro_tab_domain_diagnostic_mx_toolbox_ok'));
    } else {
      _.set(domain, 'mxTooltip', $translate.instant('emailpro_tab_domain_diagnostic_mx_toolbox', { t0: $scope.exchange.hostname }));
    }
  }

  function setSrvTooltip(domain) {
    if (domain.srvValid) {
      _.set(domain, 'srvTooltip', $translate.instant('emailpro_tab_domain_diagnostic_srv_toolbox_ok'));
    } else {
      _.set(domain, 'srvTooltip', $translate.instant('emailpro_tab_domain_diagnostic_srv_toolbox', { t0: $scope.exchange.hostname }));
    }
  }

  function setTooltips(paginated) {
    if (paginated && paginated.domains && paginated.domains.length) {
      angular.forEach($scope.paginated.domains, (domain) => {
        if ($scope.exchange) {
          setMxTooltip(domain);
          setSrvTooltip(domain);
        }
      });
    }
  }

  $scope.getDomains = function (count, offset) {
    $scope.loading = true;
    EmailProDomains.getDomains($stateParams.productId, count, offset, $scope.search.value)
      .then((domains) => {
        $scope.paginated = domains;
        $scope.domainTypes = domains.domainTypes;
        setTooltips($scope.paginated);
        $scope.loading = false;
      }, () => {
        $scope.loading = false;
      });
  };

  $scope.$watch('search.value', (search) => {
    if ($scope.search) {
      if ($scope.search.value === search) {
        $scope.$broadcast('paginationServerSide.loadPage', 1, 'domainsTable');
      }
    }
  });

  $scope.containPartial = function () {
    let i;
    if ($scope.paginated && $scope.paginated.domains && $scope.paginated.domains.length) {
      for (i = 0; i < $scope.paginated.domains.length; i += 1) {
        if ($scope.paginated.domains[i].partial) {
          return true;
        }
      }
    }
    return false;
  };

  $scope.$on(EmailPro.events.domainsChanged, () => {
    $scope.$broadcast('paginationServerSide.reload', 'domainsTable');
  });

  init();
});
