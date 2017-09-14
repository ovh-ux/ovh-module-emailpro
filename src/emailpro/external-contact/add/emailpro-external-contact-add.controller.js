angular
    .module("Module.emailpro.controllers")
    .controller("EmailProAddExternalContactCtrl", class EmailProAddExternalContactCtrl {
        constructor ($scope, $stateParams, EmailPro, EmailProExternalContacts, Alerter, translator) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;
            this.EmailProExternalContacts = EmailProExternalContacts;
            this.Alerter = Alerter;
            this.translator = translator;
        }

        $onInit () {
            this.model = {
                hiddenFromGAL: false
            };

            this.isLoading = false;
            this.emailValidationRegex = "^[a-zA-Z0-9]+([\.+\-\w][a-zA-Z0-9]+)*@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$";

            this.EmailPro
                .getSelected()
                .then((exchange) => {
                    if (exchange.serverDiagnostic.version === 14 && exchange.offer === this.EmailPro.accountTypeProvider) {
                        this.EmailProExternalContacts.retrievingContactOptions(this.$stateParams.productId)
                            .then((data) => {
                                this.availableMainDomains = data;
                                this.attachOrganization2010 = this.availableMainDomains[0];
                            })
                            .catch((failure) => {
                                this.$scope.resetAction();
                                this.$scope.setMessage(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_fail"), failure.data);
                            });
                    }
                });

            this.retrievingAlreadyTakenEmails();

            this.$scope.submitting = () => this.submitting();
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
            if (!_.isEmpty(this.attachOrganization2010)) {
                this.model.organization2010 = this.attachOrganization2010.name;
            }

            return this.EmailProExternalContacts
                .addingContact(this.$stateParams.productId, this.model)
                .then(() => {
                    this.Alerter.success(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_success"), this.$scope.alerts.dashboard);
                })
                .catch((failure) => {
                    this.Alerter.alertFromSWS(this.translator.tr("exchange_tab_EXTERNAL_CONTACTS_configuration_contact_add_fail"), failure, this.$scope.alerts.dashboard);
                })
                .finally(() => {
                    this.$scope.resetAction();
                });
        }

        isCurrentEmailAlreadyTaken () {
            return this.alreadyTakenEmails.includes(this.model.externalEmailAddress);
        }

        getEmailErrorMessage () {
            this.externalContactAddForm.emailAddress.$setValidity("email", true);

            if (this.externalContactAddForm.emailAddress.$dirty && this.externalContactAddForm.emailAddress.$error.required) {
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_isEmpty");
            }

            if (this.externalContactAddForm.emailAddress.$dirty && this.externalContactAddForm.emailAddress.$error.pattern) {
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_notValid");
            }

            if (this.externalContactAddForm.emailAddress.$dirty && (this.isCurrentEmailAlreadyTaken() || this.externalContactAddForm.emailAddress.$error.email)) {
                this.externalContactAddForm.emailAddress.$setValidity("email", false);
                return this.translator.tr("emailpro_externalContacts_add_displayName_errors_alreadyTaken");
            }

            if (this.externalContactAddForm.emailAddress.$dirty && this.externalContactAddForm.emailAddress.$invalid) {
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
    });
