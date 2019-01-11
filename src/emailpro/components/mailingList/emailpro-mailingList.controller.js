export default class EmailProMailingListController {
  /* @ngInject */
  constructor(
    $rootScope,
    $stateParams,
    $translate,

    Alerter,
    WucEmails,
  ) {
    this.$rootScope = $rootScope;
    this.$stateParams = $stateParams;
    this.$translate = $translate;

    this.Alerter = Alerter;
    this.WucEmails = WucEmails;
  }

  $onInit() {
    return this.fetchingQuotas();
  }

  async fetchingQuotas() {
    this.isFetchingQuotas = true;

    try {
      this.quotas = await this.WucEmails.getQuotas('jetestelesndd.com');
    } catch (err) {
      this.feedback = {
        message: {
          text: this.$translate.instant('emailPro_mailingLists_home_fetchingQuotas_error'),
          details: [
            {
              text: err.message,
            },
          ],
        },
        type: 'error',
      };
    } finally {
      this.isFetchingQuotas = false;
    }
  }
}
