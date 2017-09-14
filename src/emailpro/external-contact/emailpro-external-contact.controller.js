angular.module("Module.emailpro.controllers").controller("EmailProExternalContactsModifyCtrl", ($scope, $stateParams, EmailPro, EmailProExternalContacts, Alerter) => {
    "use strict";

    $scope.model = {
        currentAccount: $scope.currentActionData,
        newAccount: angular.copy($scope.currentActionData),
        hasDisplayNameBeenModified: false
    };

    $scope.isEmailValid = function () {
        return $scope.model.newAccount.externalEmailAddress && EmailPro.isEmailValid($scope.model.newAccount.externalEmailAddress);
    };

    $scope.getPasswordInvalidClass = function () {
        return !$scope.model.newAccount.externalEmailAddress || EmailPro.isEmailValid($scope.model.newAccount.externalEmailAddress) ? "" : "error";
    };

    $scope.modifyContact = function () {
        $scope.resetAction();
        EmailProExternalContacts.modifyContact($stateParams.organization, $stateParams.productId, $scope.model.currentAccount.externalEmailAddress, $scope.model.newAccount)
            .then(() => {
                Alerter.success($scope.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_success"), $scope.alerts.dashboard);
            }, (err) => {
                Alerter.alertFromSWS($scope.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_fail"), err, $scope.alerts.dashboard);
            });
    };

    $scope.updateDisplayName = function () {
        if ($scope.model.newAccount && !$scope.model.hasDisplayNameBeenModified) {
            var result = "";
            if ($scope.model.newAccount.firstName) {
                result = $scope.model.newAccount.firstName;
                if ($scope.model.newAccount.lastName) {
                    result += " ";
                }
            }
            if ($scope.model.newAccount.lastName) {
                result += $scope.model.newAccount.lastName;
            }
            $scope.model.newAccount.displayName = result;
        }
    };

    $scope.updateDisplayNameFlag = function () {
        if ($scope.model.newAccount.displayName) {
            $scope.model.hasDisplayNameBeenModified = true;
        } else {
            $scope.model.hasDisplayNameBeenModified = false;
        }
    };

    $scope.accountIsValid = function () {
        return EmailProExternalContacts.isAccountValid($scope.model.newAccount) && $scope.model.newAccount.displayName;
    };

});

angular.module("Module.emailpro.controllers").controller("EmailProExternalContactsDeleteCtrl", ($scope, $stateParams, EmailPro, EmailProExternalContacts, Alerter) => {
    "use strict";

    $scope.model = {
        externalEmailAddress: $scope.currentActionData
    };

    $scope.deleteAccount = function () {
        $scope.resetAction();
        EmailProExternalContacts.removeContact($stateParams.organization, $stateParams.productId, $scope.model.externalEmailAddress).then((data) => {
            Alerter.alertFromSWS($scope.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_delete_success"), data, $scope.alerts.dashboard);
        }, (data) => {
            Alerter.alertFromSWS($scope.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_delete_fail"), data, $scope.alerts.dashboard);
        });
    };

});
