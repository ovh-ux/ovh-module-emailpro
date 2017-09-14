angular
    .module("Module.emailpro.controllers")
    .controller("EmailProExternalContactsPopoverCtrl", class EmailProExternalContactsPopoverCtrl {
        constructor ($scope) {
            this.$scope = $scope;
        }

        updateExternalContact (contact) {
            this.$scope.setAction("emailpro/external-contact/update/emailpro-external-contact-update", contact);
        }

        deleteExternalContact (contact) {
            this.$scope.setAction("emailpro/external-contact/remove/emailpro-external-contact-remove", contact.externalEmailAddress);
        }
    });
