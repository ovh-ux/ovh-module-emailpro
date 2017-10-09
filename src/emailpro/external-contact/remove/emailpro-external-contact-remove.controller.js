angular
    .module("Module.emailpro.controllers")
    .controller("EmailProExternalContactsDeleteCtrl", class EmailProExternalContactsDeleteCtrl {
        constructor ($scope, $stateParams, EmailPro, EmailProExternalContacts, Alerter, translator) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;
            this.EmailProExternalContacts = EmailProExternalContacts;
            this.Alerter = Alerter;
            this.translator = translator;
        }

        $onInit () {
            this.externalEmailAddress = this.$scope.currentActionData;

            this.$scope.deleting = () => this.deleting();
        }

        deleting () {
            return this.EmailProExternalContacts
                .deletingContact(this.$stateParams.productId, this.externalEmailAddress)
                .then((data) => {
                    this.Alerter.alertFromSWS(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_delete_success"), data, this.$scope.alerts.dashboard);
                })
                .catch((data) => {
                    this.Alerter.alertFromSWS(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_delete_fail"), data, this.$scope.alerts.dashboard);
                })
                .finally(() => {
                    this.$scope.resetAction();
                });
        }
    });
