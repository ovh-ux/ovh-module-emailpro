angular
  .module('emailProControllers')
  .controller('EmailProUpdateAccountCtrl', ($q, $scope, $stateParams, $translate, EmailPro, EmailProPassword) => {
    const originalValues = angular.copy($scope.currentActionData);

    const accountIsValid = function accountIsValid() {
      const account = $scope.selectedAccount;
      if ($scope.simplePasswordFlag
      || $scope.differentPasswordFlag
      || $scope.containsNameFlag) {
        return false;
      } if (account && /\s/.test(account.password)) {
        return false;
      } if (!account.canBeConfigured && !account.password) {
        return false;
      } if (!account.domain || !account.login) {
        return false;
      }
      return true;
    };

  const getModelToUpdate = function (originalValues, modifiedBuffer) { // eslint-disable-line
      const model = { primaryEmailAddress: originalValues.primaryEmailAddress };
      model.login = modifiedBuffer.login !== originalValues.login
        ? modifiedBuffer.login : undefined;
      model.displayName = modifiedBuffer.displayName !== originalValues.displayName
        ? modifiedBuffer.displayName : undefined;
      model.domain = modifiedBuffer.completeDomain.name !== originalValues.completeDomain.name
        ? modifiedBuffer.completeDomain.name : undefined;
      model.firstName = modifiedBuffer.firstName !== originalValues.firstName
        ? modifiedBuffer.firstName : undefined;
      model.lastName = modifiedBuffer.lastName !== originalValues.lastName
        ? modifiedBuffer.lastName : undefined;
      model.hiddenFromGAL = modifiedBuffer.hiddenFromGAL !== originalValues.hiddenFromGAL
        ? modifiedBuffer.hiddenFromGAL : undefined;
      model.accountLicense = modifiedBuffer.accountLicense !== originalValues.accountLicense
        ? modifiedBuffer.accountLicense : undefined;
      return model;
    };

  const getFeaturesToUpdate = function (originalValues, modifiedBuffer) { // eslint-disable-line
      const model = getModelToUpdate(originalValues, modifiedBuffer);

      if ($scope.exchange.offer === $scope.accountTypeProvider) {
        model.quota = originalValues.totalQuota.value
          && modifiedBuffer.quota !== originalValues.quota
          ? modifiedBuffer.quota
          : undefined;
      }
      model.password = modifiedBuffer.password;
      return model;
    };

    $scope.accountTypeProvider = EmailPro.accountTypeProvider;
    $scope.accountTypeDedicated = EmailPro.accountTypeDedicated;
    $scope.accountTypeHosted = EmailPro.accountTypeHosted;

    $scope.selectedAccount = $scope.currentActionData;
    $scope.selectedAccount.quota = $scope.currentActionData.quota
      ? $scope.currentActionData.quota : $scope.selectedAccount.totalQuota.value;

    $scope.passwordTooltip = null; // set in $scope.loadAccountOptions()

    $scope.checkTakenEmails = function checkTakenEmails() {
      $scope.takenEmailError = false;

      if ($scope.takenEmails && $scope.selectedAccount.login) {
        angular.forEach($scope.takenEmails, (value) => {
          if (`${$scope.selectedAccount.login.toLowerCase()}@${$scope.selectedAccount.completeDomain.name}` === value.toLowerCase()) {
            $scope.takenEmailError = true;
          }
        });
      }

      if (originalValues.primaryEmailAddress === `${$scope.selectedAccount.login}@${$scope.selectedAccount.completeDomain.name}`) {
        $scope.takenEmailError = false;
      }
    };

    $scope.setPasswordsFlag = function setPasswordsFlag(selectedAccount) {
      $scope.differentPasswordFlag = false;
      $scope.simplePasswordFlag = false;
      $scope.containsNameFlag = false;
      $scope.containsSameAccountNameFlag = false;

      _.set(selectedAccount, 'password', selectedAccount.password || '');
      _.set(selectedAccount, 'passwordConfirmation', selectedAccount.passwordConfirmation || '');

      if (selectedAccount.password !== selectedAccount.passwordConfirmation) {
        $scope.differentPasswordFlag = true;
      }

      if (selectedAccount.password.length > 0) {
        $scope.simplePasswordFlag = !EmailProPassword.passwordSimpleCheck(
          selectedAccount.password,
          true,
          $scope.newAccountOptions.minPasswordLength,
        );

        /*
        see the password complexity requirements of Microsoft Windows Server (like EmailPro)
        https://technet.microsoft.com/en-us/library/hh994562%28v=ws.10%29.aspx
      */
        if ($scope.newAccountOptions.passwordComplexityEnabled) {
          $scope.simplePasswordFlag = $scope.simplePasswordFlag
          || !EmailProPassword.passwordComplexityCheck(selectedAccount.password);

          if (selectedAccount.displayName) {
            $scope.containsNameFlag = EmailProPassword.passwordContainsName(
              selectedAccount.password,
              selectedAccount.displayName,
            );
          }

          if (!$scope.containsNameFlag && selectedAccount.login) {
            if (selectedAccount.password.indexOf(selectedAccount.login) !== -1) {
              $scope.containsNameFlag = true;
            }
          }

          if (selectedAccount.samaccountName
          && selectedAccount.password.indexOf(selectedAccount.samaccountName) !== -1) {
            if (!$scope.containsSamAccountNameLabel) {
              $scope.containsSamAccountNameLabel = $translate.instant('emailpro_ACTION_update_account_step1_password_contains_samaccount_name',
                { t0: selectedAccount.samaccountName });
            }
            $scope.containsSamAccountNameFlag = true;
          } else {
            $scope.containsSamAccountNameFlag = false;
          }
        }
      }
    };

    $scope.needsUpdate = function needsUpdate() {
      const modifiedBuffer = $scope.selectedAccount;
      const result = !(!modifiedBuffer.password
      && angular.equals(originalValues.login, modifiedBuffer.login)
      && angular.equals(originalValues.displayName, modifiedBuffer.displayName)
      && angular.equals(originalValues.completeDomain.name, modifiedBuffer.completeDomain.name)
      && angular.equals(originalValues.firstName, modifiedBuffer.firstName)
      && angular.equals(originalValues.lastName, modifiedBuffer.lastName)
      && angular.equals(originalValues.hiddenFromGAL, modifiedBuffer.hiddenFromGAL)
      && angular.equals(originalValues.accountLicense, modifiedBuffer.accountLicense)
      && angular.equals(originalValues.quota, modifiedBuffer.quota));
      return result && accountIsValid() && !$scope.takenEmailError;
    };

    $scope.setQuotaAvailable = function setQuotaAvailable() {
      $scope.newAccountOptions.quotaArray = [];
      for (let i = $scope.newAccountOptions.maxQuota;
        i >= $scope.newAccountOptions.minQuota; i -= 1) {
        $scope.newAccountOptions.quotaArray.push(i);
      }
    };

    $scope.canChangePrimary = function canChangePrimary() {
      if ($scope.selectedAccount.is25g) {
        return $scope.selectedAccount.primaryEmailAddress.split('@')[1] === 'configureme.me';
      }
      return $scope.newAccountOptions !== null;
    };

    $scope.newAccountOptions = {
      availableDomains: [$scope.selectedAccount.domain],
      availableTypes: [$scope.selectedAccount.accountLicense],
      quotaArray: [],
    };

    $scope.getPasswordPlaceholder = function getPasswordPlaceholder() {
      return $scope.selectedAccount.canBeConfigured ? $translate.instant('emailpro_ACTION_update_account_step1_password_placeholder') : ' ';
    };

    $scope.getCompleteDomain = function getCompleteDomain(domainName) {
      let result;
      angular.forEach($scope.newAccountOptions.availableDomains, (value) => {
        if (value.name === domainName) {
          result = value;
        }
      });

      // if the current domain is not in the domain's list (dummy account)
      // select by default the first available
      if (result === undefined) {
        result = _.first($scope.newAccountOptions.availableDomains);
      }
      return result;
    };

    $scope.loadAccountOptions = function loadAccountOptions() {
      $scope.noDomainMessage = null;
      EmailPro.getNewAccountOptions($stateParams.productId).then((data) => {
        $scope.canDeleteOutlookAtExpiration = true;

        // No restrictions for Outlook suppression,
        $scope.newAccountOptions = data;

        $scope.setQuotaAvailable();
        $scope.takenEmails = data.takenEmails;

        if (data.availableDomains.length === 0) {
          $scope.setMessage($translate.instant('emailpro_ACTION_add_no_domains'), { status: 'error' });
          $scope.resetAction();
          $scope.noDomainMessage = $translate.instant('emailpro_ACTION_add_no_domains');

          $scope.error = true;
          $scope.setMessage($translate.instant('emailpro_ACTION_add_no_domains'));
        } else {
          accountIsValid();
          $scope.selectedAccount.completeDomain = $scope.getCompleteDomain(
            $scope.selectedAccount.completeDomain.name,
          );
        }

        $scope.passwordTooltip = $scope.newAccountOptions.passwordComplexityEnabled
          ? $translate.instant('emailpro_ACTION_update_account_step1_complex_password_tooltip',
            { t0: $scope.newAccountOptions.minPasswordLength })
          : $translate.instant('emailpro_ACTION_update_account_step1_simple_password_tooltip',
            { t0: $scope.newAccountOptions.minPasswordLength });
      }, (failure) => {
        $scope.setMessage($translate.instant('emailpro_ACTION_add_account_option_fail'), failure.data);
        $scope.resetAction();
      });
    };

    $scope.updateExchangeAccount = function updateExchangeAccount() {
      $scope.resetAction();
      $scope.setMessage($translate.instant('emailpro_dashboard_action_doing'));

      if ($scope.needsUpdate()) {
        return EmailPro
          .updateAccount(
            $stateParams.productId,
            getFeaturesToUpdate(originalValues, $scope.selectedAccount),
          )
          .then(() => {
            $scope.setMessage($translate.instant(`${$scope.exchange.billingPlan}_ACTION_update_account_success_message`), { type: 'success' });
          })
          .catch((failure) => {
            $scope.setMessage($translate.instant(`${$scope.exchange.billingPlan}_ACTION_update_account_error_message`), failure);
          });
      }

      return $q.when();
    };
  });
