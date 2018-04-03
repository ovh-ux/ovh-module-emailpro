angular
    .module("Module.emailpro.controllers")
    .controller("EmailProRemoveDisclaimerCtrl", class EmailProRemoveDisclaimerCtrl {
        constructor ($scope, $stateParams, EmailPro) {
            this.$scope = $scope;
            this.$stateParams = $stateParams;
            this.EmailPro = EmailPro;

            this.disclaimer = $scope.currentActionData;

            $scope.submit = () => this.submit();
        }

        submit () {
            this.$scope.setMessage(this.$scope.tr("exchange_dashboard_action_doing"), { status: "success" });
            this.EmailPro.deleteDisclaimer(this.$stateParams.productId, this.disclaimer.domain.name)
                .then(() => {
                    this.$scope.setMessage(this.$scope.tr("exchange_ACTION_delete_disclaimer_success"), { status: "success" });
                }, (failure) => {
                    this.$scope.setMessage(this.$scope.tr("exchange_ACTION_delete_disclaimer_failure"), failure.data);
                });
            this.$scope.resetAction();
        }
    });
