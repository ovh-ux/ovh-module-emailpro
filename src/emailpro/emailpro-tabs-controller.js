angular
  .module('emailproControllers')
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
            fn: () => {
              this.$scope.setAction('emailpro/service/configure/emailpro-service-configure', { exchange: this.$scope.exchange });
            },
          },
        ],
      };

      this.changeTab(this.$stateParams.tab || this.$stateParams.tabComponent);

      this.$scope.tabs = this.tabs;
      this.$scope.extraMenuItems = this.extraMenuItems;
      this.$scope.changeTab = tab => this.changeTab(tab);
    }

    changeTab(tabToChangeTo = this.defaultTab) {
      const matchingTab = this.tabs.find(currentTab => currentTab.toString()
        === tabToChangeTo.toString());
      const matchingExtraMenuItem = !matchingTab
        && this.extraMenuItems.items.find(currentMenuItem => currentMenuItem.target
        === tabToChangeTo.toString());
      const newlySelectedTab = matchingTab || matchingExtraMenuItem;

      this.$scope.currentTab = newlySelectedTab;
      this.$location.search('tab', !newlySelectedTab.isComponent ? newlySelectedTab.target || newlySelectedTab.toString() : null);
      this.$location.search('tabComponent', newlySelectedTab.isComponent ? newlySelectedTab.toString() : null);
    }
  });
