angular.module("Module.emailpro.controllers").controller("EmailProLicenseHistoryCtrl", ($rootScope, $stateParams, $scope, EmailPro) => {
    "use strict";

    $scope.loading = false;
    $scope.selectedPeriod = { period: "LASTMONTH" };

    var parseItem = function (item) {
        var d = moment(item.time, "YYYY-MM-DDTHH:mm:dd.SSSZZ").toDate();
        return [Date.UTC(d.getFullYear(), d.getMonth(), d.getDate()), item.value];
    };

    var parseSerie = function (serie) {
        serie.name = $scope.tr(`exchange_action_license_history_type_${serie.name}`);
        var rawData = []; // data buffer
        angular.forEach(serie.data, (obj2) => {
            rawData.push(parseItem(obj2));
        });
        serie.data = rawData;
    };

    $scope.loadMonitoring = function (periodParam) {
        var period = periodParam;
        $scope.loading = true;
        period = period || $scope.selectedPeriod.period;
        $scope.licenseHistory = null;

        EmailPro.getEmailProLicenseHistory($stateParams.productId, period)
            .then((data) => {
                angular.forEach(data.series, (serie) => {
                    parseSerie(serie);
                });
                $scope.licenseHistory = data;
                $scope.loading = false;
            }, (failure) => {
                $scope.resetAction();
                $scope.loading = false;
                $scope.setMessage($scope.tr("exchange_action_license_history_fail"), failure.data);
            });
    };

    $scope.$watch("selectedPeriod", (oldValue, newValue) => {
        if (oldValue !== newValue) {
            $scope.loadMonitoring($scope.selectedPeriod.period);
        }
    }, true);
});
