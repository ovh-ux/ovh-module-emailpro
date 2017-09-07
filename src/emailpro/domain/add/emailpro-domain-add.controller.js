angular.module("Module.emailpro.controllers").controller("EmailProAddDomainController", ($rootScope, $scope, $timeout, $stateParams, EmailPro, EmailProDomains, Alerter, Validator) => {
    "use strict";

    var Punycode = window.punycode;

    var timeout = null;

    var init = function () {
        $scope.noDomainAttached = $scope.currentActionData ? $scope.currentActionData.noDomainAttached : false;
        $scope.loading = false;
        $scope.ovhDomain = "ovh-domain";
        $scope.nonOvhDomain = "non-ovh-domain";
        $scope.orderDomain = "order-domain";
        $scope.model = {
            name: "",
            displayName: "",
            isUTF8Domain: false,
            srvParam: false,
            mxParam: false,
            domainType: $scope.ovhDomain
        };
    };

    var prepareData = function (data) {
        $scope.loading = false;
        $scope.availableDomains = data.availableDomains;
        $scope.availableDomainsBuffer = data.availableDomains;
        $scope.availableTypes = data.types;
        $scope.availableMainDomains = data.mainDomains;
        $scope.model.type = $scope.availableTypes[0];

        if ($scope.availableDomains.length === 0) {
            $scope.model.domainType = $scope.nonOvhDomain;
            $scope.model.srvParam = false;
            $scope.model.mxParam = false;
        }
    };

    var check2010Provider = function () {
        if ($scope.exchange && $scope.availableMainDomains &&
               $scope.exchange.offer === EmailPro.accountTypeProvider &&
               $scope.exchange.serverDiagnostic.version === EmailPro.EmailPro2010Code) {
            $scope.setOrganization2010 = true;
            if ($scope.availableMainDomains.length === 0) {
                $scope.model.main = true;
                $scope.model.organization2010 = null;
            } else if ($scope.availableMainDomains.length > 0) {
                $scope.model.main = false;
                $scope.model.attachOrganization2010 = $scope.availableMainDomains[0];
            }
        }
    };

    var prepareModel = function () {
        if ($scope.setOrganization2010) {
            if ($scope.model.main) {
                delete $scope.model.organization2010;
            } else {
                $scope.model.organization2010 = $scope.model.attachOrganization2010.name;
            }
            delete $scope.model.attachOrganization2010;
        }

        delete $scope.model.displayName;
        delete $scope.model.domainType;
        delete $scope.model.isUTF8Domain;
    };

    init();

    $scope.loadDomainData = function () {
        $scope.loading = true;

        EmailProDomains.getAddDomainData($stateParams.productId)
            .then((data) => {
                $scope.loading = false;
                prepareData(data);
                check2010Provider();
            }, (failure) => {
                $scope.resetAction();
                Alerter.alertFromSWS($scope.tr("emailpro_tab_domain_add_failure"), failure);
            });

        EmailPro.getSelected()
            .then((exchange) => {
                $scope.exchange = exchange;
                check2010Provider();
            });
    };

    $scope.resetSearchValue = function () {
        $scope.search.value = null;
        $scope.availableDomains = _.clone($scope.availableDomainsBuffer);
    };

    $scope.$watch("search.value", (search) => {
        if (search === "") {
            $scope.resetSearchValue();
        }
        $timeout.cancel(timeout);
        if ($scope.search && $scope.search.value) {
            timeout = $timeout(() => {
                if ($scope.search.value === search) {
                    $scope.availableDomains = _.filter($scope.availableDomainsBuffer, (n) => n.displayName.indexOf(search) > -1);
                }
            }, 850);
        } else {
            $scope.search = { value: search };
        }
    });

    $scope.addDomain = function () {
        $scope.resetAction();
        prepareModel();

        EmailProDomains.addDomain($scope.model)
            .then(() => {
                $scope.setMessage($scope.tr("emailpro_tab_domain_add_success"), "true");
            }, (failure) => {
                Alerter.alertFromSWS($scope.tr("emailpro_tab_domain_add_failure"), failure);
            });
    };

    $scope.resetName = function () {
        $scope.nonOvhDomainPristine = true;
        $scope.model.displayName = "";
        $scope.model.name = "";

    };

    $scope.checkDomain = function () {
        if ($scope.model.domainType === $scope.nonOvhDomain) {
            $scope.model.srvParam = false;
            $rootScope.$broadcast("wizard-goToStep", 3);
        }
    };

    $scope.checkDomainType = function () {
        if ($scope.model.domainType === $scope.nonOvhDomain) {
            $rootScope.$broadcast("wizard-goToStep", 1);
        }
    };

    $scope.changeName = function () {
        $scope.nonOvhDomainPristine = false;
        $scope.model.name = Punycode.toASCII($scope.model.displayName);
        $scope.model.isUTF8Domain = $scope.model.displayName !== $scope.model.name;
    };

    $scope.isNonOvhDomainValid = function () {
        return $scope.model.domainType !== $scope.nonOvhDomain || Validator.isValidDomain($scope.model.displayName);
    };
});
