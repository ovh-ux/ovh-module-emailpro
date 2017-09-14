

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
