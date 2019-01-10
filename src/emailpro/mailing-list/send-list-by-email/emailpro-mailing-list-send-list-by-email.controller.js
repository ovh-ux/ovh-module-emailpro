angular.module('App').controller(
  'EmailProMXPlanMailingListsSendListByEmailCtrl',
  class EmailProMXPlanMailingListsSendListByEmailCtrl {
    constructor($scope, $stateParams, $translate, Alerter, EmailProMXPlanMailingLists) {
      this.$scope = $scope;
      this.$stateParams = $stateParams;
      this.$translate = $translate;
      this.Alerter = Alerter;
      this.EmailProMXPlanMailingLists = EmailProMXPlanMailingLists;
    }

    $onInit() {
      this.email = '';
      this.mailingList = this.$scope.currentActionData;
      this.loading = false;
      this.$scope.sendListByEmail = () => this.sendListByEmail();
    }

    emailCheck(input) {
      input.$setValidity(
        'email',
        this.EmailProMXPlanMailingLists.constructor.isMailValid(input.$viewValue),
      );
    }

    sendListByEmail() {
      this.loading = true;
      return this.EmailProMXPlanMailingLists.sendListByEmail(this.$stateParams.productId, {
        name: this.mailingList.name,
        email: this.email,
      })
        .then((task) => {
          this.Alerter.success(
            this.$translate.instant(
              'mailing_list_tab_modal_sendListByEmail_success',
              { t0: this.email },
            ),
            this.$scope.alerts.main,
          );

          // no return here
          this.EmailProMXPlanMailingLists.pollState(this.$stateParams.productId, {
            id: task.id,
            successStates: ['noState'],
            namespace: 'EmailProMXPlanMailingLists.subscribers.sendListByEmail.poll',
          });
        })
        .catch(err => this.Alerter.alertFromSWS(
          this.$translate.instant('mailing_list_tab_modal_sendListByEmail_error'),
          _.get(err, 'data', err),
          this.$scope.alerts.main,
        ))
        .finally(() => {
          this.loading = false;
          this.$scope.resetAction();
        });
    }
  },
);
