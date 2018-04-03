/**
 *
 */
angular.module("Module.emailpro.controllers")
    .controller("EmailProRemoveDisclaimerCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";

        $scope.disclaimer = $scope.currentActionData;
        $scope.submit = function () {
            $scope.setMessage($scope.tr("exchange_dashboard_action_doing"), { status: "success" });
            EmailPro.deleteDisclaimer($stateParams.productId, $scope.disclaimer.domain.name)
                .then(() => {
                    $scope.setMessage($scope.tr("exchange_ACTION_delete_disclaimer_success"), { status: "success" });
                }, (failure) => {
                    $scope.setMessage($scope.tr("exchange_ACTION_delete_disclaimer_failure"), failure.data);
                });
            $scope.resetAction();
        };
    });
