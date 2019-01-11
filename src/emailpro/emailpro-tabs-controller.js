angular
  .module('emailProControllers')
  .controller('EmailProTabsCtrl', class {
    constructor(
      $location,
      $scope,
      $stateParams,
      $translate,
    ) {
      this.$location = $location;
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
    }

    $onInit() {
      this.tabs = [
        {
          isDefault: true,
          toString: () => 'INFORMATION',
        },
        {
          toString: () => 'DOMAIN',
        },
        {
          toString: () => 'ACCOUNT',
        },
        {
          isComponent: true,
          toString: () => 'MAILING_LIST',
          name: 'emailproMailingList',
          condition: this.$stateParams.serviceIsMXPlan,
        },
        {
          toString: () => 'EXTERNAL_CONTACT',
        },
      ].filter(tab => !_.has(tab, 'condition') || tab.condition);

      this.defaultTab = this.tabs.find(currentTab => currentTab.isDefault);

      this.extraMenuItems = {
        title: this.$translate.instant('navigation_more'),
        items: [
          {
            label: this.$translate.instant('emailpro_tab_DISCLAIMER'),
            target: 'DISCLAIMER',
            type: 'SWITCH_TABS',
          },
          {
            label: this.$translate.instant('emailpro_tab_TASKS'),
            target: 'TASK',
            type: 'SWITCH_TABS',
          },
          {
            type: 'SEPARATOR',
          },
          {
            label: this.$translate.instant('emailpro_configuration_action_title'),
            type: 'ACTION',
            fn() {
              this.$scope.setAction('emailpro/service/configure/emailpro-service-configure', { exchange: this.$scope.exchange });
            },
            disabled: this.$scope.is25g(),
          },
        ],
      };

      this.changeTab(this.$stateParams.tab || this.$stateParams.tabComponent);

      this.$scope.tabs = this.tabs;
      this.$scope.extraMenuItems = this.extraMenuItems;
      this.$scope.changeTab = tab => this.changeTab(tab);
    }

    changeTab(tabToChangeTo) {
      const matchingTab = this.tabs.find(currentTab => currentTab === tabToChangeTo);
      const newlySelectedTab = matchingTab || this.defaultTab;

      this.$scope.currentTab = newlySelectedTab;
      this.$location.search('tab', !newlySelectedTab.isComponent ? newlySelectedTab.name || newlySelectedTab : null);
      this.$location.search('tabComponent', newlySelectedTab.isComponent ? newlySelectedTab.name || newlySelectedTab : null);
    }
  });
