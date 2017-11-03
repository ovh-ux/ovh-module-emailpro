angular.module("Module.emailpro.controllers").controller("EmailProUpdateAccountCtrl", ($scope, $stateParams, EmailPro, EmailProPassword) => {
    "use strict";

    var originalValues = angular.copy($scope.currentActionData);

    var accountIsValid = function () {
        var account = $scope.selectedAccount;
        if ($scope.simplePasswordFlag ||
        $scope.differentPasswordFlag ||
        $scope.containsNameFlag) {
            return false;
        } else if (account && /\s/.test(account.password)) {
            return false;
        } else if (!account.canBeConfigured && !account.password) {
            return false;
        } else if (!account.domain || !account.login) {
            return false;
        }
        return true;
    };

    var getModelToUpdate = function (originalValues, modifiedBuffer) {
        var model = { primaryEmailAddress: originalValues.primaryEmailAddress };
        model.login = modifiedBuffer.login !== originalValues.login ? modifiedBuffer.login : undefined;
        model.displayName = modifiedBuffer.displayName !== originalValues.displayName ? modifiedBuffer.displayName : undefined;
        model.domain = modifiedBuffer.completeDomain.name !== originalValues.completeDomain.name ? modifiedBuffer.completeDomain.name : undefined;
        model.firstName = modifiedBuffer.firstName !== originalValues.firstName ? modifiedBuffer.firstName : undefined;
        model.lastName = modifiedBuffer.lastName !== originalValues.lastName ? modifiedBuffer.lastName : undefined;
        model.hiddenFromGAL = modifiedBuffer.hiddenFromGAL !== originalValues.hiddenFromGAL ? modifiedBuffer.hiddenFromGAL : undefined;
        model.accountLicense = modifiedBuffer.accountLicense !== originalValues.accountLicense ? modifiedBuffer.accountLicense : undefined;
        return model;
    };

    var getFeaturesToUpdate = function (originalValues, modifiedBuffer) {
        var model = getModelToUpdate(originalValues, modifiedBuffer);

        if ($scope.exchange.offer === $scope.accountTypeProvider) {
            model.quota = originalValues.totalQuota.value && modifiedBuffer.quota !== originalValues.quota ? modifiedBuffer.quota : undefined;
        }
        model.password = modifiedBuffer.password;
        return model;
    };

    var getActionMessage = function (messages) {
        var updateAccountMessages = {
            OK: " ",
            PARTIAL: " ",
            ERROR: " "
        };

        if (messages.length === 1) {
            if (messages[0].type === "INFO") {
                updateAccountMessages.OK = $scope.tr("emailpro_ACTION_update_account_success_message");
            } else if (messages[0].type === "ERROR") {
                updateAccountMessages.ERROR = $scope.tr("emailpro_ACTION_update_account_error_message");
            }
        } else if (messages.length === 2) {
            if (messages[0].type === messages[1].type) {
                if (messages[0].type === "INFO") {
                    updateAccountMessages.OK = $scope.tr("emailpro_ACTION_update_account_success_message");
                } else if (messages[0].type === "ERROR") {
                    updateAccountMessages.ERROR = $scope.tr("emailpro_ACTION_update_account_error_message");
                }
            } else if (messages[0].message === EmailPro.updateAccountAction) {
                updateAccountMessages.PARTIAL = $scope.tr("emailpro_ACTION_update_account_success_message");
                updateAccountMessages.PARTIAL += ` ${$scope.tr("exchange_ACTION_change_password_account_error_message_linked")}`;
            } else {
                updateAccountMessages.PARTIAL = $scope.tr("emailpro_ACTION_change_password_account_success_message");
                updateAccountMessages.PARTIAL += ` ${$scope.tr("exchange_ACTION_update_account_error_message_linked")}`;
            }
        }
        return updateAccountMessages;
    };

    $scope.accountTypeProvider = EmailPro.accountTypeProvider;
    $scope.accountTypeDedicated = EmailPro.accountTypeDedicated;
    $scope.accountTypeHosted = EmailPro.accountTypeHosted;

    $scope.selectedAccount = $scope.currentActionData;
    $scope.selectedAccount.quota = $scope.currentActionData.quota ? $scope.currentActionData.quota : $scope.selectedAccount.totalQuota.value;

    $scope.passwordTooltip = null; // set in $scope.loadAccountOptions()

    $scope.checkTakenEmails = function () {
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

    $scope.setPasswordsFlag = function (selectedAccount) {
        $scope.differentPasswordFlag = false;
        $scope.simplePasswordFlag = false;
        $scope.containsNameFlag = false;
        $scope.containsSameAccountNameFlag = false;

        selectedAccount.password = selectedAccount.password || "";
        selectedAccount.passwordConfirmation = selectedAccount.passwordConfirmation || "";

        if (selectedAccount.password !== selectedAccount.passwordConfirmation) {
            $scope.differentPasswordFlag = true;
        }

        if (selectedAccount.password.length > 0) {
            $scope.simplePasswordFlag = !EmailProPassword.passwordSimpleCheck(selectedAccount.password, true, $scope.newAccountOptions.minPasswordLength);

            /*
                see the password complexity requirements of Microsoft Windows Server (like EmailPro)
                https://technet.microsoft.com/en-us/library/hh994562%28v=ws.10%29.aspx
            */
            if ($scope.newAccountOptions.passwordComplexityEnabled) {
                $scope.simplePasswordFlag = $scope.simplePasswordFlag || !EmailProPassword.passwordComplexityCheck(selectedAccount.password);

                if (selectedAccount.displayName) {
                    $scope.containsNameFlag = EmailProPassword.passwordContainsName(
                        selectedAccount.password,
                        selectedAccount.displayName
                    );
                }

                if (!$scope.containsNameFlag && selectedAccount.login) {
                    if (selectedAccount.password.indexOf(selectedAccount.login) !== -1) {
                        $scope.containsNameFlag = true;
                    }
                }

                if (selectedAccount.samaccountName &&
                    selectedAccount.password.indexOf(selectedAccount.samaccountName) !== -1) {
                    if (!$scope.containsSamAccountNameLabel) {
                        $scope.containsSamAccountNameLabel = $scope
                            .tr("exchange_ACTION_update_account_step1_password_contains_samaccount_name",
                                [selectedAccount.samaccountName]);
                    }
                    $scope.containsSamAccountNameFlag = true;
                } else {
                    $scope.containsSamAccountNameFlag = false;
                }
            }
        }
    };

    $scope.needsUpdate = function () {
        var modifiedBuffer = $scope.selectedAccount;
        var result;
        result = !(!modifiedBuffer.password &&
           angular.equals(originalValues.login, modifiedBuffer.login) &&
           angular.equals(originalValues.displayName, modifiedBuffer.displayName) &&
           angular.equals(originalValues.completeDomain.name, modifiedBuffer.completeDomain.name) &&
           angular.equals(originalValues.firstName, modifiedBuffer.firstName) &&
           angular.equals(originalValues.lastName, modifiedBuffer.lastName) &&
           angular.equals(originalValues.hiddenFromGAL, modifiedBuffer.hiddenFromGAL) &&
           angular.equals(originalValues.accountLicense, modifiedBuffer.accountLicense) &&
           angular.equals(originalValues.quota, modifiedBuffer.quota));
        return result && accountIsValid() && !$scope.takenEmailError;
    };

    $scope.setQuotaAvailable = function () {
        $scope.newAccountOptions.quotaArray = [];
        for (var i = $scope.newAccountOptions.maxQuota; i >= $scope.newAccountOptions.minQuota; i--) {
            $scope.newAccountOptions.quotaArray.push(i);
        }
    };

    $scope.canChangePrimary = function () {
        if ($scope.selectedAccount.is25g) {
            return $scope.selectedAccount.primaryEmailAddress.split("@")[1] === "configureme.me";
        }
        return $scope.newAccountOptions !== null;
    };

    $scope.newAccountOptions = {
        availableDomains: [$scope.selectedAccount.domain],
        availableTypes: [$scope.selectedAccount.accountLicense],
        quotaArray: []
    };

    $scope.getPasswordPlaceholder = function () {
        return $scope.selectedAccount.canBeConfigured ? $scope.tr("exchange_ACTION_update_account_step1_password_placeholder") : " ";
    };

    $scope.getCompleteDomain = function (domainName) {
        var result;
        angular.forEach($scope.newAccountOptions.availableDomains, (value) => {
            if (value.name === domainName) {
                result = value;
            }
        });

        // if the current domain is not in the domain's list (dummy account), select by default the first available
        if (result === undefined) {
            result = $scope.newAccountOptions.availableDomains[0];
        }
        return result;
    };

    $scope.loadAccountOptions = function () {
        $scope.noDomainMessage = null;
        EmailPro.getNewAccountOptions($stateParams.productId).then((data) => {
            $scope.canDeleteOutlookAtExpiration = true;

            // No restrictions for Outlook suppression,
            $scope.newAccountOptions = data;

            $scope.setQuotaAvailable();
            $scope.takenEmails = data.takenEmails;

            if (data.availableDomains.length === 0) {
                $scope.setMessage($scope.tr("emailpro_ACTION_add_no_domains"), { status: "error" });
                $scope.resetAction();
                $scope.noDomainMessage = $scope.tr("emailpro_ACTION_add_no_domains");

                $scope.error = true;
                $scope.setMessage($scope.tr("emailpro_ACTION_add_no_domains"));
            } else {
                accountIsValid();
                $scope.selectedAccount.completeDomain = $scope.getCompleteDomain($scope.selectedAccount.completeDomain.name);
            }

            $scope.passwordTooltip = $scope.newAccountOptions.passwordComplexityEnabled ?
                $scope.tr("exchange_ACTION_update_account_step1_complex_password_tooltip",
                          [$scope.newAccountOptions.minPasswordLength]) :
                $scope.tr("exchange_ACTION_update_account_step1_simple_password_tooltip",
                          [$scope.newAccountOptions.minPasswordLength]);

        }, (failure) => {
            $scope.setMessage($scope.tr("exchange_ACTION_add_account_option_fail"), failure.data);
            $scope.resetAction();
        });
    };

    EmailPro.getSelected().then((exchange) => {
        $scope.exchange = exchange;
    });

    $scope.updateExchangeAccount = function () {
        $scope.resetAction();
        $scope.setMessage($scope.tr("exchange_dashboard_action_doing"));

        if ($scope.needsUpdate()) {
            EmailPro.updateAccount($stateParams.productId, getFeaturesToUpdate(originalValues, $scope.selectedAccount))
                .then((data) => {
                    $scope.setMessage(getActionMessage(data.messages), data);
                }, (failure) => {
                    $scope.setMessage($scope.tr("emailpro_ACTION_update_account_error_message"), failure);
                });
        }
    };
});
