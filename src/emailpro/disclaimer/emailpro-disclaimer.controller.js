angular.module("Module.emailpro.controllers")
    .controller("EmailProDisclaimerCtrl", class EmailProDisclaimerCtrl {
        constructor ($scope, $stateParams, EmailPro) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;

            this.disclaimersList = null;
            this.loadParams = {};

            $scope.$on(this.EmailPro.events.disclaimersChanged, () => {
                this.refreshList();
            });

            $scope.$on(this.EmailPro.events.disclaimersChanged, () => {
                $scope.$broadcast("paginationServerSide.reload", "disclaimersTable");
            });
        }

        static hasEmptySlot (list) {
            return _.some(list, "emptySlotFlag");
        }

        static hasFullSlot (list) {
            return _.some(list, "emptySlotFlag", false);
        }

        refreshList () {
            this.EmailPro.getDisclaimers(this.$stateParams.productId, this.loadParams.pageSize, this.loadParams.offset - 1)
                .then((data) => {
                    for (let i = 0; i < data.list.results.length; i++) {
                        this.disclaimersList.list.results.splice(i, 1, data.list.results[i]);
                    }
                    for (let i = data.list.results.length; i < this.disclaimersList.list.results.length; i++) {
                        this.disclaimersList.list.results.splice(i, 1);
                    }
                })
                .catch((data) => {
                    this.$scope.setMessage(this.$scope.tr("exchange_tab_DISCLAIMER_error_message"), data.data);
                });
        }

        loadPaginated ({ pageSize, offset }) {
            this.loadParams.pageSize = pageSize;
            this.loadParams.offset = offset;
            return this.EmailPro.getDisclaimers(this.$stateParams.productId, pageSize, offset - 1)
                .then((disclaimers) => {
                    this.disclaimersList = disclaimers;
                    return {
                        data: disclaimers.list.results,
                        meta: {
                            totalCount: disclaimers.count
                        }
                    };
                }).catch((data) => {
                    this.$scope.setMessage(this.$scope.tr("exchange_tab_DISCLAIMER_error_message"), data.data);
                });
        }

        updateDisclaimer (disclaimer) {
            this.$scope.setAction("emailpro/disclaimer/update/emailpro-disclaimer-update", disclaimer);
        }

        deleteDisclaimer (disclaimer) {
            this.$scope.setAction("emailpro/disclaimer/remove/emailpro-disclaimer-remove", disclaimer);
        }

        setMessagesFlags (disclaimersList) {
            this.addDomainMessageFlag = false;
            this.noDisclaimerMessageFlag = false;

            if (disclaimersList.list.results.length === 0 ||
            (!this.constructor.hasEmptySlot(disclaimersList.list.results) && !this.constructor.hasFullSlot(disclaimersList.list.results))) {
                this.addDomainMessageFlag = true;
            } else if (this.constructor.hasEmptySlot(disclaimersList.list.results) && !this.constructor.hasFullSlot(disclaimersList.list.results)) {
                this.noDisclaimerMessageFlag = true;
            }
        }

        newDisclaimersDisabled () {
            let result = false;
            if (this.disclaimersList) {
                result = this.constructor.hasEmptySlot(this.disclaimersList.list.results);
            }
            return !result;
        }

        addDisclaimer (disclaimer) {
            if (!this.newDisclaimersDisabled()) {
                this.$scope.setAction("emailpro/disclaimer/add/emailpro-disclaimer-add", disclaimer);
            }
        }
    });
