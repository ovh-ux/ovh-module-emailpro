angular.module("Module.emailpro.controllers").controller("EmailProAccountDelegationCtrl", ($scope, $stateParams, EmailPro, $timeout) => {
    "use strict";

    var init = function () {
        $scope.selectedAccount = $scope.currentActionData;
        $scope.form = { search: null };
    };

    var recordChangeOperations = function (account, buffer, changesList) {
        // record the operation to be done for sendAs rights:
        if (account.newSendAsValue !== buffer.sendAs) {
            changesList.sendRights.push({
                id: account.id,
                operation: account.newSendAsValue === true ? "POST" : "DELETE"
            });
        }

        // records the operation for sendOnBehalfTo rights:
        if (account.newSendOnBehalfToValue !== buffer.sendOnBehalfTo) {
            changesList.sendOnBehalfToRights.push({
                id: account.id,
                operation: account.newSendOnBehalfToValue === true ? "POST" : "DELETE"
            });
        }

        // record the operation to be done for full access rights:
        if (account.newFullAccessValue !== buffer.fullAccess) {
            changesList.fullAccessRights.push({
                id: account.id,
                operation: account.newFullAccessValue === true ? "POST" : "DELETE"
            });
        }
        return changesList;
    };

    /**
     * Return an array containing changes from the original configuration
     */
    var getChanges = function () {
        var changesList = {
            account: $scope.selectedAccount.primaryEmailAddress,
            sendRights: [],
            sendOnBehalfToRights: [],
            fullAccessRights: []
        };

        if ($scope.accounts) {
            angular.forEach($scope.accounts.list.results, (account, index) => {
                recordChangeOperations(account, $scope.bufferAccounts.list.results[index], changesList);
            });
        }
        return changesList;
    };

    var constructResult = function (data) {
        var mainMessage = {
            OK: $scope.tr("exchange_ACTION_delegation_success_message"),
            PARTIAL: $scope.tr("exchange_ACTION_delegation_partial_message"),
            ERROR: $scope.tr("exchange_ACTION_delegation_error_message")
        };
        var state = "OK";
        var errors = 0;

        angular.forEach(data, (task) => {
            if (task.status === "ERROR") {
                task.message = $scope.tr(`exchange_tab_TASKS_${task.function}`);
                task.type = "ERROR";
                state = "PARTIAL";
                errors++;
            }
        });
        if (errors === data.length) {
            state = "ERROR";
        }
        $scope.setMessage(mainMessage, { messages: data, state });
    };

    var checkForBufferChanges = function (account) {
        if ($scope.bufferAccounts) {
            angular.forEach($scope.bufferAccounts.list.results, (bufferAccount) => {
                if (bufferAccount.id === account.id) {
                    account.newSendAsValue = bufferAccount.newSendAsValue;
                    account.newSendOnBehalfToValue = bufferAccount.newSendOnBehalfToValue;
                    account.newFullAccessValue = bufferAccount.newFullAccessValue;
                }
            });
        }
    };

    /**
     * Check if there are changes compared to original configuration
     */
    $scope.hasChanged = function () {
        var changesList = getChanges();
        if (changesList) {
            return changesList.sendRights.length > 0 ||
            changesList.fullAccessRights.length > 0 ||
            changesList.sendOnBehalfToRights.length > 0;
        }
        return false;

    };

    $scope.getAccounts = function (count, offset) {
        $scope.setMessage(null);
        $scope.loading = true;

        EmailPro.getAccountDelegationRight($stateParams.productId, $scope.selectedAccount.primaryEmailAddress, count, offset, $scope.form.search)
            .then((accounts) => {
                $scope.loading = false;
                $scope.accounts = angular.copy(accounts); // make a deep copy of accounts list to use it as model
                angular.forEach($scope.accounts.list.results, (account) => {
                    account.newSendAsValue = account.sendAs;
                    account.newSendOnBehalfToValue = account.sendOnBehalfTo;
                    account.newFullAccessValue = account.fullAccess;
                    checkForBufferChanges(account);
                });

                $scope.bufferAccounts = $scope.accounts; // keep the original data as a reference point to compare changes
            }, (failure) => {
                $scope.loading = false;
                $scope.setMessage($scope.tr("exchange_tab_ACCOUNTS_error_message"), failure.data);
            });
    };

    $scope.$on(EmailPro.events.accountsChanged, () => {
        $scope.getAccounts();
    });

    $scope.$watch("form.search", (search) => {
        if ($scope.form.search !== null) {
            $timeout(() => {
                if ($scope.form.search === search) {
                    $scope.getAccounts();
                }
            }, 1500);
        }
    }, true);

    $scope.updateDelegationRight = function () {
        $scope.resetAction();
        $scope.setMessage($scope.tr("exchange_ACTION_delegation_doing_message"));

        EmailPro.updateAccountDelegationRights($stateParams.productId, getChanges()
        ).then((data) => {
            constructResult(data);
        }, (failure) => {
            $scope.setMessage($scope.tr("exchange_ACTION_delegation_error_message"), failure.data);
        });
    };

    init();
});

angular.module("Module.emailpro.controllers").controller("EmailProMailingListDelegationCtrl", ($scope, $stateParams, EmailPro, $timeout) => {
    "use strict";

    var init = function () {
        $scope.selectedGroup = $scope.currentActionData;
        $scope.form = { search: null };
    };

    var recordChangeOperations = function (account, changesList) {
        // record the operation to be done for sendAs rights:
        if (account.newSendAsValue !== account.sendAs) {
            changesList.sendRights.push({
                id: account.id,
                operation: account.newSendAsValue === true ? "POST" : "DELETE"
            });
        }

        // records the operation for sendOnBehalfTo rights:
        if (account.newSendOnBehalfToValue !== account.sendOnBehalfTo) {
            changesList.sendOnBehalfToRights.push({
                id: account.id,
                operation: account.newSendOnBehalfToValue === true ? "POST" : "DELETE"
            });
        }
        return changesList;
    };

    // Return an array containing changes compared to original configuration
    var getChanges = function () {
        var changesList = {
            account: $scope.selectedGroup.mailingListName,
            sendRights: [],
            sendOnBehalfToRights: []
        };
        if ($scope.delegationList) {
            angular.forEach($scope.delegationList.list.results, (account) => {
                recordChangeOperations(account, changesList);
            });
        }
        return changesList;
    };

    // Check if there are changes compared to original configuration
    $scope.hasChanged = function () {
        var changesList = getChanges();
        if (changesList) {
            return changesList.sendRights.length > 0 || changesList.sendOnBehalfToRights.length > 0;
        }
        return false;
    };

    $scope.getDelegationRight = function (count, offset) {
        $scope.setMessage(null);
        $scope.loading = true;

        EmailPro.getMailingListDelegationRights($stateParams.productId, $scope.selectedGroup.mailingListName, count, offset, $scope.form.search)
            .then((accounts) => {
                $scope.loading = false;

                $scope.delegationList = angular.copy(accounts); // make a deep copy of accounts list to use it as model

                // keep the original value to have a reference to compare changes
                angular.forEach($scope.delegationList.list.results, (account) => {
                    account.newSendAsValue = account.sendAs;
                    account.newSendOnBehalfToValue = account.sendOnBehalfTo;
                });
            }, (failure) => {
                $scope.loading = false;
                $scope.setMessage($scope.tr("exchange_tab_GROUPS_error_message"), failure.data);
            });
    };

    $scope.$on(EmailPro.events.accountsChanged, () => {
        $scope.$broadcast("paginationServerSide.reload", "delegationTable");
    });

    $scope.$watch("form.search", (search) => {
        if ($scope.form.search !== null) {
            $timeout(() => {
                if ($scope.form.search === search) {
                    $scope.$broadcast("paginationServerSide.loadPage", 1, "delegationTable");
                }
            }, 1500);
        }
    }, true);

    $scope.updateDelegationRight = function () {
        $scope.resetAction();
        $scope.setMessage($scope.tr("exchange_GROUPS_delegation_doing_message"));

        EmailPro.updateMailingListDelegationRights($stateParams.productId, getChanges()
        ).then((data) => {
            $scope.setMessage($scope.tr("exchange_GROUPS_delegation_success_message"), data);
        }, (failure) => {
            $scope.setMessage($scope.tr("exchange_GROUPS_delegation_error_message"), failure.data);
        });
    };

    init();
});
