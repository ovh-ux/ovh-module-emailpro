angular.module('App').controller(
  'EmailProMXPlanMailingListsDeleteCtrl',
  class EmailProMXPlanMailingListsDeleteCtrl {
    /**
     * Constructor
     * @param $scope
     * @param $stateParams
     * @param $translate
     * @param Alerter
     * @param EmailProMXPlanMailingLists
     */
    constructor($scope, $stateParams, $translate, Alerter, EmailProMXPlanMailingLists) {
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.Alerter = Alerter;
      this.EmailProMXPlanMailingLists = EmailProMXPlanMailingLists;
    }

    $onInit() {
      this.mailingList = this.$scope.currentActionData;
      this.loading = false;
      this.$scope.deleteMailingList = () => this.deleteMailingList();
    }

    deleteMailingList() {
      this.loading = true;
      return this.EmailProMXPlanMailingLists.deleteMailingList(
        this.$stateParams.productId,
        this.mailingList.name,
      )
        .then(() => this.Alerter.success(
          this.$translate.instant('mailing_list_tab_modal_list_delete_success'),
          this.$scope.alerts.main,
        ))
        .catch(err => this.Alerter.alertFromSWS(
          this.$translate.instant('mailing_list_tab_modal_list_delete_error'),
          err,
          this.$scope.alerts.main,
        ))
        .finally(() => {
          this.loading = false;
          this.$scope.resetAction();
        });
    }
  },
);