angular
    .module("Module.emailpro.controllers")
    .controller("EmailProExternalContactsModifyCtrl", class EmailProExternalContactsModifyCtrl {
        constructor ($scope, $stateParams, EmailPro, EmailProExternalContacts, Alerter, translator) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;
            this.EmailProExternalContacts = EmailProExternalContacts;
            this.Alerter = Alerter;
            this.translator = translator;
        }

        $onInit () {
            this.previousModel = angular.copy(this.$scope.currentActionData);
            this.model = angular.copy(this.$scope.currentActionData);

            this.isLoading = false;
            this.emailValidationRegex = "^[a-zA-Z0-9]+([\.+\-\w][a-zA-Z0-9]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$";

            this.retrievingAlreadyTakenEmails();

            this.$scope.submitting = () => this.submitting();
            this.$scope.modelHasChanged = () => this.modelHasChanged();
        }

        retrievingAlreadyTakenEmails () {
            this.isLoading = true;

            return this.EmailProExternalContacts
                .retrievingContacts(this.$stateParams.productId)
                .then((data) => {
                    this.alreadyTakenEmails = data.list.results.map((contact) => contact.externalEmailAddress);
                })
                .catch((error) => {
                    this.Alerter.alertFromSWS(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_fail"), error, this.$scope.alerts.dashboard);
                    this.$scope.resetAction();
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }

        submitting () {
            return this.EmailProExternalContacts
                .updatingContact(this.$stateParams.productId, this.previousModel.externalEmailAddress, this.model)
                .then(() => {
                    this.Alerter.success(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_success"), this.$scope.alerts.dashboard);
                })
                .catch((err) => {
                    this.Alerter.alertFromSWS(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_modify_fail"), err, this.$scope.alerts.dashboard);
                })
                .finally(() => {
                    this.$scope.resetAction();
                });
        }

        isCurrentEmailAlreadyTaken () {
            return this.model.externalEmailAddress !== this.previousModel.externalEmailAddress && this.alreadyTakenEmails.includes(this.model.externalEmailAddress);
        }

        getEmailErrorMessage () {
            this.emailProExternalContactsModifyForm.emailAddress.$setValidity("email", true);

            if (this.emailProExternalContactsModifyForm.emailAddress.$dirty && this.emailProExternalContactsModifyForm.emailAddress.$error.required) {
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_isEmpty");
            }

            if (this.emailProExternalContactsModifyForm.emailAddress.$dirty && this.emailProExternalContactsModifyForm.emailAddress.$error.pattern) {
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_notValid");
            }

            if (this.emailProExternalContactsModifyForm.emailAddress.$dirty && (this.isCurrentEmailAlreadyTaken() || this.emailProExternalContactsModifyForm.emailAddress.$error.email)) {
                this.emailProExternalContactsModifyForm.emailAddress.$setValidity("email", false);
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_alreadyTaken");
            }

            if (this.emailProExternalContactsModifyForm.emailAddress.$dirty && this.emailProExternalContactsModifyForm.emailAddress.$invalid) {
                return this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_step1_email_invalid");
            }

            return "";
        }

        updateDisplayName () {
            const firstName = _.isEmpty(this.model.firstName) ? "" : this.model.firstName;
            const separator = !_.isEmpty(this.model.firstName) && !_.isEmpty(this.model.lastName) ? " " : "";
            const lastName = _.isEmpty(this.model.lastName) ? "" : this.model.lastName;

            this.model.displayName = `${firstName}${separator}${lastName}`;
        }

        modelHasChanged () {
            return !_.isEqual(this.previousModel, this.model);
        }
    });
