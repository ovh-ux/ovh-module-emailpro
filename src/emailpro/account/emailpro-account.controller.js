angular.module('emailproControllers').controller('EmailProTabAccountsCtrl', ($scope, EmailPro, $stateParams, $translate) => {
  $scope.stateCreating = EmailPro.stateCreating;
  $scope.stateDeleting = EmailPro.stateDeleting;
  $scope.stateOk = EmailPro.stateOk;
  $scope.stateReopening = EmailPro.stateReopening;
  $scope.stateSuspended = EmailPro.stateSuspended;
  $scope.stateSuspending = EmailPro.stateSuspending;

  $scope.stateTaskError = 'TASK_ON_ERROR';
  $scope.stateTaskDoing = 'TASK_ON_DOING';

  $scope.exchangeTypeHosted = EmailPro.accountTypeHosted;
  $scope.exchangeTypeDedicated = EmailPro.accountTypeDedicated;
  $scope.exchangeTypeProvider = EmailPro.accountTypeProvider;

  $scope.accountTypes = ['ALL', 'BASIC', 'STANDARD', 'ENTERPRISE'];
  $scope.filterType = 'ALL';

  $scope.setFilter = function () {
    $scope.$broadcast('paginationServerSide.loadPage', 1, 'accountsTable');
  };

  const init = function () {
    $scope.loading = false;
    $scope.accounts = null;
    $scope.displayAccounts();

    $scope.showAccounts = true;
    $scope.showAlias = false;
    $scope.selectedAccount = null;
    $scope.noDomainFlag = true;

    EmailPro.getSelected()
      .then((exchange) => {
        if (!$scope.is25g()) {
          $scope.orderOutlookDisabled = exchange.offer === EmailPro.accountTypeDedicated
            || (exchange.serverDiagnostic.version === 14
              && exchange.offer === EmailPro.accountTypeProvider)
            || $scope.addAccountOptionIsNotAvailable();
        } else {
          $scope.orderOutlookDisabled = false;
        }
      }, (failure) => {
        $scope.setMessage($translate.instant('emailpro_tab_ACCOUNTS_error_message'), failure);
      });

    EmailPro.getNewAccountOptions($stateParams.productId).then((data) => {
      if (data.availableDomains.length === 0) {
        $scope.noDomainFlag = true;
      } else {
        $scope.noDomainFlag = false;
      }
    });
  };

  $scope.spamTooltipContent = $translate.instant('emailpro_tab_ACCOUNTS_popover_span_text', { t0: `#/ticket?serviceName=${$stateParams.productId}` });

  $scope.$watch('search.value', (search) => {
    if ($scope.search) {
      if ($scope.search.value === search) {
        $scope.$broadcast('paginationServerSide.loadPage', 1, 'accountsTable');
      }
    }
  });

  $scope.getAccounts = function (count, offset) {
    $scope.setMessage(null);
    $scope.loading = true;

    EmailPro.getAccounts(count, offset, $scope.search.value, false, $scope.filterType === 'ALL' ? null : $scope.filterType)
      .then((accounts) => {
        $scope.loading = false;
        $scope.accounts = accounts;

        let act;
        for (let i = 0, c = accounts.list.results.length; i < c; i += 1) {
          act = accounts.list.results[i];
          /* eslint-disable no-restricted-properties */
          act.percentUse = Math.round(((act.currentUsage / Math.pow(1024, 2)) * 100) / act.quota);
          /* eslint-enable no-restricted-properties */
        }
      }, (failure) => {
        $scope.loading = false;
        $scope.setMessage($translate.instant('emailpro_tab_ACCOUNTS_error_message'), failure);
      });
  };

  $scope.$on(EmailPro.events.accountsChanged, () => {
    $scope.$broadcast('paginationServerSide.reload', 'accountsTable');
  });

  $scope.$on('showAccounts', () => {
    $scope.displayAccounts();
  });

  $scope.addAccountOptionIsNotAvailable = function () {
    return $scope.exchange.nicType.indexOf(EmailPro.nicAdmin) === -1
      && $scope.exchange.nicType.indexOf(EmailPro.nicTech) === -1;
  };

  $scope.newAccount = function () {
    if ($scope.is25g()) {
      $scope.setAction('emailpro/account/order/email-pro-account-order');
    } else if ($scope.exchange.offer === $scope.exchangeTypeDedicated) {
      $scope.setAction('emailpro/account/add/emailpro-account-add');
    } else if ($scope.exchange.offer === $scope.exchangeTypeProvider
        && $scope.exchange.serverDiagnostic.version === EmailPro.EmailPro2010Code) {
      $scope.setAction('emailpro/account/add/emailpro-account-add');
    } else {
      $scope.setAction('emailpro/account/order/emailpro-account-order');
    }
  };

  $scope.isEditable = function (account) {
    return (account.state === $scope.stateOk
      || account.state === $scope.stateTaskDoing
      || account.state === $scope.stateTaskError) && !$scope.noDomainFlag;
  };

  $scope.isConfigurable = function (account) {
    return account.canBeConfigured;
  };

  $scope.editAccount = function (account) {
    const populateAccount = angular.copy(account);

    populateAccount.is25g = $scope.is25g();

    if ($scope.isEditable(account)) {
      $scope.setAction('emailpro/account/update/emailpro-account-update', populateAccount);
    }
  };

  $scope.showAliases = function (account) {
    if (!$scope.is25g()) {
      $scope.selectedAccount = account;
      $scope.showAccounts = false;
      $scope.showAlias = true;
      $scope.$broadcast('paginationServerSide.loadPage', 1, 'aliasTable');
    }
  };

  $scope.displayAccounts = function () {
    $scope.search = { value: null };
    $scope.showAccounts = true;
    $scope.showAlias = false;
    $scope.selectedAccount = null;
  };

  $scope.isDisabled = function (account) {
    return account.state !== 'OK' ? 'disabled' : '';
  };

  $scope.deleteAccount = function (account) {
    if (account.state === 'OK') {
      $scope.setAction('emailpro/account/remove/emailpro-account-remove', angular.copy(account));
    }
  };

  $scope.delegationSettings = function (account) {
    if (account.state === 'OK') {
      $scope.setAction('emailpro/account/delegation/emailpro-account-delegation', angular.copy(account));
    }
  };

  $scope.aliasDisplay = function (account) {
    if (account.state === 'OK') {
      $scope.showAliases(account);
    }
  };

  init();
});
