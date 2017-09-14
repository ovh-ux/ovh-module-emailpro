angular
    .module("Module.emailpro.controllers")
    .controller("EmailProTabExternalContactsCtrl", class EmailProTabExternalContactsCtrl {
        constructor ($scope, $stateParams, EmailPro, EmailProExternalContacts, $timeout) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;
            this.EmailProExternalContacts = EmailProExternalContacts;
            this.$timeout = $timeout;
        }

        $onInit () {
            this.isLoading = false;
            this.contacts = null;
            this.searchValue = null;

            this.$scope.$on(this.EmailPro.events.externalcontactsChanged, () => {
                this.$scope.$broadcast("paginationServerSide.reload", "externalContactsTable");
            });

            this.debouncedRetrievingContacts = _.debounce(this.retrievingContacts, 300);

            this.$scope.retrievingContacts = (count, offet) => this.retrievingContacts(count, offet);
            this.$scope.getContacts = () => this.contacts;
            this.$scope.getIsLoading = () => this.isLoading;
        }

        onSearchValueChanged () {
            this.debouncedRetrievingContacts();
        }

        resetSearch () {
            this.searchValue = null;
            this.debouncedRetrievingContacts();
        }

        retrievingContacts (count, offset) {
            this.isLoading = true;

            return this.EmailProExternalContacts
                .retrievingContacts(this.$stateParams.productId, count, offset, this.searchValue)
                .then((contacts) => {
                    this.contacts = contacts;
                })
                .catch((error) => {
                    this.Alerter.alertFromSWS(this.translator.tr("emailpro_externalContacts_tab_retrieving_failure"), error, this.$scope.alerts.dashboard);
                })
                .finally(() => {
                    this.isLoading = false;
                });
        }

        static getStateClassFor (state) {
            switch (state) {
            case "OK":
            case "MODIFYING":
            case "CREATING":
            case "REOPENING":
                return "label-info";
            case "DELETING":
                return "label-warning";
            case "SUSPENDED":
            case "SUSPENDING":
                return "label-error";
            default:
            }
        }
    });
