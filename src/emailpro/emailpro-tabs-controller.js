angular.module("Module.emailpro.controllers").controller("EmailProTabsCtrl", ($scope, $stateParams, $location) => {
    "use strict";

    $scope.kebabCase = _.kebabCase;

    var defaultTab = "INFORMATION";
    $scope.tabs = [
        "INFORMATION",
        "DOMAIN",
        "ACCOUNT",
        "EXTERNAL_CONTACT"
    ];

    $scope.tabMenu = {
        title: $scope.tr("navigation_more"),
        items: [
            {
                label: $scope.tr("exchange_tab_DISCLAIMER"),
                target: "DISCLAIMER",
                type: "SWITCH_TABS"
            },
            {
                label: $scope.tr("exchange_tab_TASKS"),
                target: "TASK",
                type: "SWITCH_TABS"
            },
            {
                type: "SEPARATOR"
            },
            {
                label: $scope.tr("exchange_action_configuration"),
                type: "ACTION",
                fn () {
                    $scope.setAction("emailpro/service/configure/emailpro-service-configure", { exchange: $scope.exchange });
                },
                disabled: $scope.is25g()
            }
        ]
    };

    $scope.setSelectedTab = function (tab) {
        if (tab !== undefined && tab !== null && tab !== "") {
            $scope.selectedTab = tab;
        } else {
            $scope.selectedTab = defaultTab;
        }
        $location.search("tab", $scope.selectedTab);
    };

    if ($stateParams.tab && ~$scope.tabs.indexOf(angular.uppercase($stateParams.tab))) {
        $scope.setSelectedTab(angular.uppercase($stateParams.tab));
    } else {
        $scope.setSelectedTab(defaultTab);
    }
});
