angular
    .module("Module.emailpro.controllers")
    .controller("EmailProAddDisclaimerCtrl", ($scope, $stateParams, EmailPro, navigation) => {
        "use strict";
        const mceId = "add-disclaimer-editor";

        $scope.data = {
            content: "",
            outsideOnly: false,
            selectedVariable: "Name"
        };

        $scope.insertVariable = function () {
            CKEDITOR.instances[mceId].insertText(`%%${$scope.data.selectedAttribute}%%`);
        };

        $scope.loadAvailableDomains = function () {
            $scope.loadingData = true;

            return EmailPro.getNewDisclaimerOptions($stateParams.productId).then((data) => {
                $scope.loadingData = false;
                if (data.availableDomains) {
                    $scope.availableDomains = data.availableDomains;
                    $scope.selectCurrentDomain();

                    $scope.data.selectedAttribute = data.availableAttributes[0];
                    $scope.availableAttributes = data.availableAttributes;
                } else {
                    $scope.resetAction();
                    $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_no_domains"));
                }
                return $scope.data;
            });
        };

        $scope.selectCurrentDomain = function () {
            if (_.get(navigation, "currentActionData.domain.name")) {
                $scope.data.completeDomain = _.find($scope.availableDomains, "name", navigation.currentActionData.domain.name);
            }
            if (!$scope.data.completeDomain) {
                $scope.data.completeDomain = $scope.availableDomains[0];
            }
        };

        $scope.loadAvailableDomains();

        $scope.saveDisclaimer = function () {
            const model = {
                domain: $scope.data.completeDomain.name,
                externalEmailsOnly: $scope.data.outsideOnly,
                content: $scope.data.content
            };

            $scope.setMessage($scope.tr("exchange_dashboard_action_doing"), { status: "success" });
            EmailPro.saveDisclaimer($stateParams.productId, model).then(() => {
                $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_success_message"), { status: "success" });
            }, (failure) => {
                $scope.setMessage($scope.tr("exchange_ACTION_add_disclaimer_error_message"), failure.data);
            });
            $scope.resetAction();
        };
    });
