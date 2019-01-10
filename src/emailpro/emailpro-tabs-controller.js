angular.module('emailproControllers').controller('EmailProTabsCtrl', ($scope, $stateParams, $location, $translate) => {
  $scope.kebabCase = _.kebabCase;

  const defaultTab = 'INFORMATION';
  $scope.tabs = [
    'INFORMATION',
    'DOMAIN',
    'ACCOUNT',
    'EXTERNAL_CONTACT',
  ];

  $scope.tabMenu = {
    title: $translate.instant('navigation_more'),
    items: [
      {
        label: $translate.instant('emailpro_tab_DISCLAIMER'),
        target: 'DISCLAIMER',
        type: 'SWITCH_TABS',
      },
      {
        label: $translate.instant('emailpro_tab_TASKS'),
        target: 'TASK',
        type: 'SWITCH_TABS',
      },
      {
        type: 'SEPARATOR',
      },
      {
        label: $translate.instant('emailpro_configuration_action_title'),
        type: 'ACTION',
        fn() {
          $scope.setAction('emailpro/service/configure/emailpro-service-configure', { exchange: $scope.exchange });
        },
        disabled: $scope.is25g(),
      },
    ],
  };

  $scope.setSelectedTab = function (tab) {
    if (tab !== undefined && tab !== null && tab !== '') {
      $scope.selectedTab = tab;
    } else {
      $scope.selectedTab = defaultTab;
    }

    $location.search('tab', $scope.selectedTab);
  };

  if ($stateParams.tab && ~$scope.tabs.indexOf(angular.uppercase($stateParams.tab))) { // eslint-disable-line
    $scope.setSelectedTab(angular.uppercase($stateParams.tab));
  } else {
    $scope.setSelectedTab(defaultTab);
  }
});
