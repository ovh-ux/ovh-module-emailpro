angular.module('App').controller(
  'EmailProMXPlanMailingListsTabModulesCtrl',
  class EmailProMXPlanMailingListsTabModulesCtrl {
    /**
     * Constructor
     * @param $scope
     * @param $filter
     * @param $stateParams
     * @param $translate
     * @param Alerter
     * @param WucEmails
     * @param EmailProMXPlanMailingLists
     */
    constructor(
      $scope,
      $filter,
      $stateParams,
      $translate,
      Alerter,
      WucEmails,
      EmailProMXPlanMailingLists,
    ) {
      this.$scope = $scope;
      this.$filter = $filter;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.Alerter = Alerter;
      this.WucEmails = WucEmails;
      this.EmailProMXPlanMailingLists = EmailProMXPlanMailingLists;
    }

    $onInit() {
      this.$http.get(`/hosting/web/${this.$scope.exchange.domain}`)
        .then((hosting) => {
          this.$scope.hosting = hosting;
        });

      this.EmailProMXPlanMailingListsDetails = [];
      this.loading = {
        EmailProMXPlanMailingLists: false,
        pager: false,
        quotas: false,
      };
      this.search = {
        EmailProMXPlanMailingLists: '',
      };

      this.$scope.$on('hosting.tabs.EmailProMXPlanMailingLists.refresh', () => this.refreshTableEmailProMXPlanMailingLists(true));
      this.$scope.$on('EmailProMXPlanMailingLists.update.poll.done', () => this.refreshTableEmailProMXPlanMailingLists(true));
      this.$scope.$on('$destroy', () => {
        this.Alerter.resetMessage(this.$scope.alerts.tabs);
        this.EmailProMXPlanMailingLists.killAllPolling({
          namespace: 'EmailProMXPlanMailingLists.update.poll',
        });
      });

      this.getQuotas().then(() => this.refreshTableEmailProMXPlanMailingLists());
    }

    //---------------------------------------------
    // Search
    //---------------------------------------------

    emptySearch() {
      this.search.EmailProMXPlanMailingLists = '';
      this.refreshTableEmailProMXPlanMailingLists(true);
    }

    goSearch() {
      this.refreshTableEmailProMXPlanMailingLists(true);
    }

    //---------------------------------------------
    // Mailing lists
    //---------------------------------------------

    getQuotas() {
      this.loading.quotas = true;
      return this.WucEmails.getQuotas(this.$stateParams.productId)
        .then((quotas) => {
          this.quotas = quotas;
        })
        .catch((err) => {
          _.set(err, 'type', err.type || 'ERROR');
          this.Alerter.alertFromSWS(
            this.$translate.instant('mailing_list_tab_modal_get_lists_error'),
            err,
            this.$scope.alerts.tabs,
          );
        })
        .finally(() => {
          this.loading.quotas = false;
        });
    }

    refreshTableEmailProMXPlanMailingLists(forceRefresh) {
      this.loading.EmailProMXPlanMailingLists = true;
      this.EmailProMXPlanMailingLists = null;

      return this.EmailProMXPlanMailingLists
        .getEmailProMXPlanMailingLists(this.$stateParams.productId, {
          name: `%${this.search.EmailProMXPlanMailingLists}%`,
          forceRefresh,
        })
        .then((data) => {
          this.EmailProMXPlanMailingLists = this.$filter('orderBy')(data);
        })
        .catch((err) => {
          _.set(err, 'type', err.type || 'ERROR');
          this.Alerter.alertFromSWS(
            this.$translate.instant('mailing_list_tab_modal_get_lists_error'),
            err,
            this.$scope.alerts.main,
          );
        })
        .finally(() => {
          if (_.isEmpty(this.EmailProMXPlanMailingLists)) {
            this.loading.EmailProMXPlanMailingLists = false;
          }
        });
    }

    transformItem(item) {
      return this.EmailProMXPlanMailingLists.getMailingList(
        this.$stateParams.productId,
        item,
      );
    }

    onTransformItemDone() {
      this.loading.EmailProMXPlanMailingLists = false;
      this.loading.pager = false;
    }
  },
);
