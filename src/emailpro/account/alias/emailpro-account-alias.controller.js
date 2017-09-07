/**
 * Account alias
 */
angular.module("Module.emailpro.controllers").controller("EmailProTabAliasCtrl", ($scope, $stateParams, EmailPro) => {
    "use strict";

    $scope.aliasMaxLimit = EmailPro.aliasMaxLimit;

    $scope.$on(EmailPro.events.accountsChanged, () => {
        $scope.$broadcast("paginationServerSide.reload", "aliasTable");
    });

    $scope.getAliases = function (count, offset) {
        if ($scope.selectedAccount) {
            $scope.aliasLoading = true;
            EmailPro.getAliases($stateParams.productId, $scope.selectedAccount.primaryEmailAddress, count, offset)
                .then((data) => {
                    $scope.aliasLoading = false;
                    $scope.aliases = data;
                }, (failure) => {
                    $scope.aliasLoading = false;
                    $scope.setMessage($scope.tr("exchange_tab_ALIAS_error_message"), failure.data);
                });
        }
    };

    $scope.hideAliases = function () {
        $scope.$emit("showAccounts");
    };

    $scope.deleteAlias = function (alias) {
        if (!alias.taskPendingId) {
            $scope.setAction("emailpro/account/alias/remove/emailpro-account-alias-remove", {
                account: $scope.selectedAccount,
                alias
            });
        }
    };

    $scope.addAccountAlias = function () {
        if ($scope.selectedAccount && $scope.selectedAccount.aliases <= $scope.aliasMaxLimit) {
            $scope.setAction("emailpro/account/alias/add/emailpro-account-alias-add", $scope.selectedAccount);
        }
    };

    $scope.getAddAliasTooltip = function () {
        if ($scope.selectedAccount && $scope.selectedAccount.aliases >= $scope.aliasMaxLimit) {
            return $scope.tr("emailpro_tab_ALIAS_add_alias_limit_tooltip");
        }
        return null;
    };
});

/**
 *
 */
angular.module("Module.emailpro.controllers").controller("EmailProAddAccountAliasCtrl", ($scope, $stateParams, EmailPro, Alerter) => {
    "use strict";

    $scope.selectedAccount = $scope.currentActionData;

    $scope.data = null;
    $scope.model = {};

    $scope.loadDomainData = function () {
        EmailPro.getNewAliasOptions($stateParams.productId, $scope.selectedAccount.primaryEmailAddress, "ACCOUNT")
            .then((data) => {
                if (data.availableDomains.length === 0) {
                    $scope.setMessage($scope.tr("emailpro_tab_ALIAS_add_no_domains"));
                    $scope.resetAction();
                } else {
                    $scope.availableDomains = data.availableDomains;
                    $scope.takenEmails = data.takenEmails;
                    $scope.model.domain = $scope.availableDomains[0];
                }
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_domain_loading_failure"), failure.data);
                $scope.resetAction();
            });
    };

    $scope.checkTakenEmails = function () {
        $scope.takenEmailError = false;
        if ($scope.takenEmails &&
           $scope.model.alias &&
           $scope.takenEmails.indexOf(`${$scope.model.alias.toLowerCase()}@${$scope.model.domain.name}`) >= 0) {
            $scope.takenEmailError = true;
        }
    };

    $scope.addAccountAlias = function () {
        $scope.resetAction();
        EmailPro.addAlias($stateParams.productId, $scope.selectedAccount.primaryEmailAddress, $scope.model)
            .then((data) => {
                Alerter.success($scope.tr("exchange_tab_ALIAS_add_alias_success_message"), data);
            }, (failure) => {
                failure.type = "ERROR";
                Alerter.alertFromSWS($scope.tr("exchange_tab_ALIAS_add_alias_error_message"), failure);
            });
    };

    $scope.aliasIsValid = function () {
        return $scope.model.alias && $scope.model.domain && $scope.model.alias.length <= 64 && !$scope.takenEmailError;
    };
});

/**
 *
 */
angular.module("Module.emailpro.controllers").controller("EmailProRemoveAliasCtrl", ($scope, $stateParams, EmailPro, Alerter) => {
    "use strict";

    $scope.account = $scope.currentActionData.account;
    $scope.alias = $scope.currentActionData.alias;

    $scope.submit = function () {
        $scope.resetAction();

        EmailPro.deleteAlias($stateParams.productId, $scope.account.primaryEmailAddress, $scope.alias.alias)
            .then(() => {
                Alerter.success($scope.tr("exchange_tab_ALIAS_delete_success_message"));
            }, (failure) => {
                failure.type = "ERROR";
                Alerter.alertFromSWS($scope.tr("exchange_tab_ALIAS_delete_error_message"), failure);
            });
    };
});

/**
 * Group alias
 */
angular.module("Module.emailpro.controllers").controller("EmailProTabGroupAliasCtrl", ($scope, $stateParams, EmailPro) => {
    "use strict";

    $scope.aliasMaxLimit = EmailPro.aliasMaxLimit;

    $scope.$on(EmailPro.events.groupsChanged, () => {
        $scope.$broadcast("paginationServerSide.reload", "groupAliasTable");
    });

    $scope.getAliases = function (count, offset) {
        if ($scope.selectedGroup) {
            $scope.aliasLoading = true;
            EmailPro.getGroupAliasList($stateParams.productId, $scope.selectedGroup.mailingListAddress, count, offset)
                .then((data) => {
                    $scope.aliasLoading = false;
                    $scope.aliases = data;
                }, (failure) => {
                    $scope.aliasLoading = false;
                    $scope.setMessage($scope.tr("exchange_tab_ALIAS_error_message"), failure);
                });
        }
    };

    $scope.hideAliases = function () {
        $scope.$emit("showGroups");
    };

    $scope.deleteGroupAlias = function (alias) {
        if (!alias.taskPendingId) {
            $scope.setAction("emailpro/group/alias/remove/group-alias-remove", {
                selectedGroup: $scope.selectedGroup,
                alias
            });
        }
    };

    $scope.addGroupAlias = function () {
        if ($scope.selectedGroup && $scope.selectedGroup.aliases <= $scope.aliasMaxLimit && $scope.selectedGroup.state === $scope.stateOk) {
            $scope.setAction("emailpro/group/alias/add/group-alias-add", $scope.selectedGroup);
        }
    };

    $scope.getAddAliasTooltip = function () {
        if ($scope.selectedGroup && $scope.selectedGroup.aliases >= $scope.aliasMaxLimit) {
            return $scope.tr("emailpro_tab_ALIAS_add_alias_limit_tooltip");
        }
        return null;
    };
});

/**
 *
 */
angular.module("Module.emailpro.controllers").controller("EmailProAddGroupAliasCtrl", ($scope, $stateParams, EmailPro) => {
    "use strict";

    $scope.selectedMailingList = $scope.currentActionData;

    $scope.availableDomains = null;
    $scope.model = {};

    $scope.loadDomainData = function () {
        EmailPro.getNewAliasOptions($scope.selectedMailingList.mailingListName, "MAILING_LIST")
            .then((data) => {
                if (data.availableDomains.length === 0) {
                    $scope.setMessage($scope.tr("emailpro_tab_ALIAS_add_no_domains"));
                    $scope.resetAction();
                } else {
                    $scope.availableDomains = data.availableDomains;
                    $scope.takenEmails = data.takenEmails;
                    $scope.model.domain = data.availableDomains[0];
                }
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_domain_loading_failure"), failure.data);
                $scope.resetAction();
            });
    };

    $scope.checkTakenEmails = function () {
        $scope.takenEmailError = false;
        if ($scope.takenEmails &&
           $scope.model.alias &&
           $scope.takenEmails.indexOf(`${$scope.model.alias}@${$scope.model.domain.name}`) >= 0) {
            $scope.takenEmailError = true;
        }
    };

    $scope.addGroupAlias = function () {
        $scope.resetAction();
        EmailPro.addGroupAlias($stateParams.productId, $scope.selectedMailingList.mailingListName, $scope.model)
            .then((data) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_add_alias_success_message"), data);
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_add_alias_error_message"), failure.data);
            });
    };

    $scope.aliasIsValid = function () {
        return $scope.model.alias && $scope.model.domain && $scope.model.alias.length <= 64 && !$scope.takenEmailError;
    };
});

/**
 *
 */
angular.module("Module.emailpro.controllers").controller("EmailProRemoveGroupAliasCtrl", ($scope, $stateParams, EmailPro) => {
    "use strict";

    $scope.selectedGroup = $scope.currentActionData.selectedGroup;
    $scope.alias = $scope.currentActionData.alias;

    $scope.submit = function () {
        $scope.resetAction();

        EmailPro.deleteGroupAlias($stateParams.productId, $scope.selectedGroup.mailingListAddress, $scope.alias.alias)
            .then((success) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_delete_success_message"), success);
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_tab_ALIAS_delete_error_message"), failure.data);
            });
    };
});
