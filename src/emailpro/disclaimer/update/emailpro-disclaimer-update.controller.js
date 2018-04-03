angular.module("Module.emailpro.controllers")
    .controller("EmailProUpdateDisclaimerCtrl", class EmailProUpdateDisclaimerCtrl {
        constructor ($scope, $stateParams, EmailPro) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;

            this.mceId = "update-disclaimer-editor";
            this.data = angular.copy($scope.currentActionData);
            this.loadOptions();

            $scope.saveDisclaimer = () => this.saveDisclaimer();
        }

        loadOptions () {
            this.loadingData = true;
            return this.EmailPro.getUpdateDisclaimerOptions().then((data) => {
                this.availableAttributes = data.availableAttributes;
                if (data.availableAttributes) {
                    this.data.selectedAttribute = data.availableAttributes[0];
                }
                return data;
            }).then((data) => {
                this.loadingData = false;
                return data;
            });
        }

        getCompleteDomain (domainName) {
            let result;
            angular.forEach(this.availableDomains, (value) => {
                if (value.name === domainName) {
                    result = value;
                }
            });
            return result;
        }

        /**
        * Insert attributes at text field current cursor position
        */
        insertAttribute () {
            CKEDITOR.instances[this.mceId].insertText(`%%${this.data.selectedAttribute}%%`);
        }

        saveDisclaimer () {
            const model = {
                domain: this.data.domain.name,
                externalEmailsOnly: this.data.outsideOnly,
                content: this.data.content
            };

            this.$scope.setMessage(this.$scope.tr("exchange_dashboard_action_doing"));
            this.EmailPro.updateDisclaimer(this.$stateParams.productId, model).then(() => {
                this.$scope.setMessage(this.$scope.tr("exchange_ACTION_update_disclaimer_success_message"), { status: "success" });
            }, (failure) => {
                this.$scope.setMessage(this.$scope.tr("exchange_ACTION_update_disclaimer_error_message"), failure.data);
            });
            this.$scope.resetAction();
        }
    });
