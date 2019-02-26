angular.module('Module.emailpro.controllers').controller(
  'EmailProTabInformationCtrl',
  class EmailProTabInformationCtrl {
    constructor($q, $scope, $translate, Alerter, EmailProMXPlanMailingLists, WucEmails) {
      this.$q = $q;
      this.$scope = $scope;
      this.$translate = $translate;
      this.Alerter = Alerter;
      this.EmailProMXPlanMailingLists = EmailProMXPlanMailingLists;
      this.WucEmails = WucEmails;
    }

    $onInit() {
      this.loading = {
        email: this.$scope.exchange.isMXPlan,
        mailingLists: this.$scope.exchange.isMXPlan,
        quotas: this.$scope.exchange.isMXPlan,
        redirections: this.$scope.exchange.isMXPlan,
      };

      if (this.$scope.exchange.isMXPlan) {
        this.$q.all({
          quotas: this.getQuotas(),
          emailsDomain: this.getEmailsDomain(),
          mailingLists: this.getMailingLists(),
          redirections: this.getRedirections(),
        });
      }
    }

    getQuotas() {
      this.loading.quotas = true;
      return this.WucEmails.getQuotas(_.get(this.$scope, 'exchange.associatedDomainName'))
        .then((quotas) => {
          this.$scope.quotas = quotas;
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
          this.loading.quotas = false;
        });
    }

    getMailingLists() {
      this.loading.mailingLists = true;

      return this.EmailProMXPlanMailingLists
        .getEmailProMXPlanMailingLists(_.get(this.$scope, 'exchange.associatedDomainName'), {
          name: '%',
          forceRefresh: true,
        })
        .then((data) => {
          this.$scope.mailingLists = data;
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
          this.loading.mailingLists = false;
        });
    }

    getRedirections() {
      this.loading.redirections = true;

      return this.WucEmails.getRedirections(_.get(this.$scope, 'exchange.associatedDomainName'))
        .then((data) => {
          this.$scope.redirections = data.map(id => ({ id }));
        })
        .catch(err => this.Alerter.alertFromSWS(
          this.$translate.instant('mailing_list_tab_modal_get_lists_error'),
          _.set(err, 'type', err.type || 'ERROR'),
          this.$scope.alerts.main,
        ))
        .finally(() => {
          this.loading.redirections = false;
        });
    }

    getEmailsDomain() {
      this.loading.email = true;

      return this.WucEmails.getDomain(_.get(this.$scope, 'exchange.associatedDomainName'))
        .then((data) => {
          this.$scope.emailDomain = data;
        })
        .catch(err => this.Alerter.alertFromSWS(
          this.$translate.instant('mailing_list_tab_modal_get_lists_error'),
          _.set(err, 'type', err.type || 'ERROR'),
          this.$scope.alerts.main,
        ))
        .finally(() => {
          this.loading.email = false;
        });
    }
  },
);
