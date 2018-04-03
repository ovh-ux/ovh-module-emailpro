angular
    .module("Module.emailpro.controllers")
    .controller("EmailProAddDisclaimerCtrl", class EmailProAddDisclaimerCtrl {
        constructor ($scope, $stateParams, EmailPro, navigation) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;
            this.navigation = navigation;

            this.mceId = "add-disclaimer-editor";

            this.data = {
                content: "",
                outsideOnly: false,
                selectedVariable: "Name"
            };

            this.loadAvailableDomains();

            $scope.saveDisclaimer = () => this.saveDisclaimer();
        }

        insertVariable () {
            CKEDITOR.instances[this.mceId].insertText(`%%${this.data.selectedAttribute}%%`);
        }

        loadAvailableDomains () {
            this.loadingData = true;

            return this.EmailPro.getNewDisclaimerOptions(this.$stateParams.productId).then((data) => {
                this.loadingData = false;
                if (data.availableDomains) {
                    this.availableDomains = data.availableDomains;
                    this.selectCurrentDomain();

                    this.data.selectedAttribute = data.availableAttributes[0];
                    this.availableAttributes = data.availableAttributes;
                } else {
                    this.$scope.resetAction();
                    this.$scope.setMessage(this.$scope.tr("exchange_ACTION_add_disclaimer_no_domains"));
                }
                return this.data;
            });
        }

        selectCurrentDomain () {
            if (_.get(this.navigation, "currentActionData.domain.name")) {
                this.data.completeDomain = _.find(this.availableDomains, "name", this.navigation.currentActionData.domain.name);
            }
            if (!this.data.completeDomain) {
                this.data.completeDomain = this.availableDomains[0];
            }
        }

        saveDisclaimer () {
            const model = {
                domain: this.data.completeDomain.name,
                externalEmailsOnly: this.data.outsideOnly,
                content: this.data.content
            };

            this.$scope.setMessage(this.$scope.tr("exchange_dashboard_action_doing"), { status: "success" });
            this.EmailPro.saveDisclaimer(this.$stateParams.productId, model).then(() => {
                this.$scope.setMessage(this.$scope.tr("exchange_ACTION_add_disclaimer_success_message"), { status: "success" });
            }, (failure) => {
                this.$scope.setMessage(this.$scope.tr("exchange_ACTION_add_disclaimer_error_message"), failure.data);
            });
            this.$scope.resetAction();
        }
    });
