angular.module("Module.emailpro.controllers").controller("EmailProCtrl", [
    "$rootScope",
    "$scope",
    "$timeout",
    "$location",
    "$stateParams",
    "Products",
    "EmailPro",
    "Api.EmailPro",
    "translator",
    "User",
    "EMAILPRO_CONFIG",

    function ($rootScope, $scope, $timeout, $location, $stateParams, Products, EmailPro, APIEmailPro, translator, User, EMAILPRO_CONFIG) {
        "use strict";

        let initialLoad = true;

        $scope.accountTypeDedicated = EmailPro.accountTypeDedicated;
        $scope.accountTypeHosted = EmailPro.accountTypeHosted;
        $scope.accountTypeProvider = EmailPro.accountTypeProvider;

        $scope.alerts = {
            dashboard: "emailproDashboardAlert"
        };

        $scope.loadingEmailProInformations = true;
        $scope.loadingEmailProError = false;
        $scope.message = null;
        $scope.newDisplayName = {
            value: ""
        };
        $scope.edit = {
            active: false
        };

        $scope.stepPath = "";
        $scope.currentAction = null;
        $scope.currentActionData = null;
        $scope.displayGuides = null;

        User.getUrlOf("changeOwner").then((link) => {
            $scope.changeOwnerUrl = link;
        });

        const loadATooltip = function (exchange) {
            if (exchange.serverDiagnostic.ip && exchange.serverDiagnostic.isAValid) {
                exchange.serverDiagnostic.aTooltip = $scope.tr("exchange_dashboard_diag_a_tooltip_ok");
            } else {
                exchange.serverDiagnostic.aTooltip = $scope.tr("exchange_dashboard_diag_a_tooltip_error", [exchange.hostname, exchange.serverDiagnostic.ip]);
            }
        };

        const loadAaaaTooltip = function (exchange) {
            if (exchange.serverDiagnostic.ipV6 && exchange.serverDiagnostic.isAaaaValid) {
                exchange.serverDiagnostic.aaaaTooltip = $scope.tr("exchange_dashboard_diag_aaaa_tooltip_ok");
            } else {
                exchange.serverDiagnostic.aaaaTooltip = $scope.tr("exchange_dashboard_diag_aaaa_tooltip_error", [exchange.hostname, exchange.serverDiagnostic.ipV6]);
            }
        };

        const loadPtrTooltip = function (exchange) {
            if (exchange.serverDiagnostic.isPtrValid) {
                exchange.serverDiagnostic.ptrTooltip = $scope.tr("exchange_dashboard_diag_ptr_tooltip_ok");
            } else {
                exchange.serverDiagnostic.ptrTooltip = $scope.tr("exchange_dashboard_diag_ptr_tooltip_error");
            }
        };
        const loadPtrv6Tooltip = function (exchange) {
            if (exchange.serverDiagnostic.isPtrV6Valid) {
                exchange.serverDiagnostic.ptrv6Tooltip = $scope.tr("exchange_dashboard_diag_ptrv6_tooltip_ok");
            } else {
                exchange.serverDiagnostic.ptrv6Tooltip = $scope.tr("exchange_dashboard_diag_ptrv6_tooltip_error");
            }
        };

        const loadEmailPro = function () {
            User.getUser().then((data) => {
                /* eslint-disable no-unused-vars */
                try {
                    $scope.displayGuides = EMAILPRO_CONFIG.URLS.GUIDES.DOCS_HOME[data.ovhSubsidiary];
                } catch (exception) {
                    return "";
                }
                /* eslint-enable no-unused-vars */
            });

            EmailPro.getSelected(true)
                .then((exchange) => {
                    $scope.exchange = exchange;
                    $scope.newDisplayName.value = exchange.displayName;
                    $scope.loadingEmailProInformations = false;

                    if (exchange.messages && exchange.messages.length > 0) {
                        $scope.setMessage($scope.tr("exchange_dashboard_loading_error"), exchange);
                        if (!exchange.name) {
                            $scope.loadingEmailProError = true;
                        }
                    }

                    if ($scope.is25g()) {
                        $scope.exchange.tabs = {
                            simple: ["ACCOUNTS"],
                            expert: ["ACCOUNTS"]
                        };
                    }

                    if ($scope.exchange.serverDiagnostic) {
                        loadATooltip($scope.exchange);
                        loadAaaaTooltip($scope.exchange);
                        loadPtrTooltip($scope.exchange);
                        loadPtrv6Tooltip($scope.exchange);
                    }

                    if (!$scope.exchange.domainsNumber && initialLoad) {
                        initialLoad = false;
                        $timeout(() => {
                            $scope.setAction("emailpro/domain/add/emailpro-domain-add", { noDomainAttached: true });
                        }, 1000);
                    }
                }, (failure) => {
                    $scope.loadingEmailProInformations = false;
                    $scope.loadingEmailProError = true;
                    if (failure) {
                        const response = failure.data || failure;
                        const data = {
                            status: "ERROR",
                            messages: [{ type: "ERROR", message: response.message, id: response.id }]
                        };
                        if (response.code === 460 || response.status === 460) {
                            $scope.setMessage($scope.tr("common_service_expired", [response.id]), data);
                        } else {
                            $scope.setMessage($scope.tr("exchange_dashboard_loading_error"), data);
                        }
                    }
                });
        };

        $scope.reloadEmailPro = function () {
            $scope.loadingEmailProInformations = true;
            $scope.loadingEmailProError = false;
            $scope.message = null;
            loadEmailPro();
        };

        $scope.$on("emailpro.dashboard.refresh", () => {
            loadEmailPro();
        });

        $scope.is25g = function () {
            if ($scope.exchange) {
                return $scope.exchange.offer === $scope.accountTypeProvider &&
                    $scope.exchange.serverDiagnostic.individual2010 === true;
            }
            return false;
        };

        const parseLocationForEmailProData = function () {
            // expect something like "/configuration/exchange_dedicated/organization-ss51633-1/exchange-ss51631-001?action=billing&tab=DOMAINS"
            // extract "exchange_dedicated"
            // var locationSplit = $location.url().replace("/configuration/", "").split("/");
            return {
                name: $stateParams.productId
            };
        };

        const init = function () {
            if ($location.search().action === "billing") {
                $timeout(() => {
                    $rootScope.$broadcast("leftNavigation.selectProduct.fromName", parseLocationForEmailProData());
                    loadEmailPro();
                }, 2000);
            } else {
                loadEmailPro();
            }
        };

        $scope.resetAction = function () {
            $scope.setAction(false);
        };

        $scope.$on("$locationChangeStart", () => {
            $scope.resetAction();
        });

        $scope.resetMessages = function () {
            $scope.message = null;
            $scope.messageDetails = null;
        };

        /**
         * If multiple messages set message structure as follow :
         * {
         *   OK: 'message to display when success',
         *   PARTIAL: 'message to display when partial success',
         *   ERROR: 'message to display when fail'
         * }
         * @param message
         * @param failure
         */
        $scope.setMessage = function (message, failure) {
            let messageToSend = message;
            let messageDetails = [];
            let alertType = "alert";

            if (failure) {
                if (failure.message) {
                    messageDetails.push({ id: failure.id, message: failure.message });
                    const type = _.get(failure, "type", "warning").toLowerCase();
                    switch (type) {
                    case "error":
                        alertType = "alert alert-danger";
                        break;
                    case "info":
                        alertType = "alert alert-success";
                        break;
                    case "warning":
                        alertType = "alert alert-warning";
                        break;
                    default:
                    }
                } else if (failure.messages) {
                    if (failure.messages.length > 0) {
                        const state = _.get(failure, "state", "").toLowerCase();
                        switch (state) {
                        case "error" :
                            alertType = "alert alert-danger";
                            messageToSend = message.ERROR;
                            break;
                        case "partial" :
                            alertType = "alert alert-warning";
                            messageToSend = message.PARTIAL;
                            break;
                        case "ok" :
                            alertType = "alert alert-success";
                            messageToSend = message.OK;
                            break;
                        default:
                        }
                        angular.forEach(failure.messages, function (value) {
                            if (value.type && value.type !== "INFO") {
                                this.push({ id: value.id, message: value.message });
                            }
                        }, messageDetails);
                    }
                } else if (failure.status) {
                    const status = _.get(failure, "status", "").toLowerCase();
                    switch (status) {
                    case "blocked":
                    case "cancelled":
                    case "paused":
                    case "error":
                        alertType = "alert alert-danger";
                        break;
                    case "waitingack":
                    case "waiting_ack":
                    case "warning":
                    case "doing":
                        alertType = "alert alert-warning";
                        break;
                    case "todo":
                    case "done":
                    case "success":
                        alertType = "alert alert-success";
                        break;
                    default:
                        alertType = "alert alert-warning";
                    }
                } else if (failure === "true") {
                    alertType = "alert alert-success";
                    messageDetails = null;
                }
            }
            $scope.message = messageToSend;
            $scope.messageDetails = messageDetails;
            $scope.alertType = alertType;
        };

        // TODO work in progress
        $scope.setAction = function (action, data) {
            $scope.currentAction = action;
            $scope.currentActionData = data;
            if (action) {
                $scope.stepPath = `${$scope.currentAction}.html`;
                $("#currentAction").modal({
                    keyboard: true,
                    backdrop: "static"
                });
            } else {
                $("#currentAction").modal("hide");
                $scope.currentActionData = null;
                $timeout(() => {
                    $scope.stepPath = "";
                }, 300);
            }
        };

        $scope.displayRenewDate = function () {
            return $scope.exchange &&
                $scope.exchange.expiration &&
                $scope.exchange.serverDiagnostic.version === EmailPro.EmailPro2013Code &&
                $scope.exchange.offer === $scope.accountTypeDedicated;
        };

        $scope.displaySslRenew = function () {
            if (!$scope.exchange) {
                return false;
            } else if ($scope.exchange.offer === $scope.accountTypeDedicated) {
                return true;
            } else if ($scope.exchange.serverDiagnostic.version === EmailPro.EmailPro2010Code && $scope.exchange.offer !== $scope.accountTypeHosted) {
                return true;
            }
            return false;

        };

        $scope.displayMigration2016 = function () {
            if (!$scope.exchange) {
                return false;
            }

            if ($scope.exchange.serverDiagnostic.commercialVersion === "_2013" &&
               $scope.exchange.offer === $scope.accountTypeHosted &&
               ($scope.exchange.nicType.indexOf("ADMIN") !== -1 || $scope.exchange.nicType.indexOf("BILLING") !== -1)) {
                return true;
            }

            return false;
        };

        $scope.displayOrderDiskSpace = function () {
            return $scope.exchange &&
                $scope.exchange.serverDiagnostic.version === EmailPro.EmailPro2010Code &&
                $scope.exchange.offer === $scope.accountTypeProvider && !$scope.is25g();
        };

        $scope.editDisplayName = function () {
            $scope.newDisplayName.value = $scope.exchange.displayName;
            $scope.edit.active = true;
        };

        $scope.resetDisplayName = function () {
            $timeout(() => {
                $scope.edit.active = false;
                if ($scope.newDisplayName.value.length < 5) {
                    $scope.setMessage($scope.tr("exchange_dashboard_display_name_min"));
                }
            }, 300);
        };

        $scope.saveDisplayName = function () {
            if ($scope.newDisplayName.value && $scope.newDisplayName.value.length >= 5) {
                const dataToSend = { displayName: $scope.newDisplayName.value };
                APIEmailPro.put("/{exchangeService}", {
                    urlParams: {
                        exchangeService: $scope.exchange.domain
                    },
                    data: dataToSend
                }).then(() => {
                    $scope.exchange.displayName = $scope.newDisplayName.value;
                    $rootScope.$broadcast("change.displayName", [$scope.exchange.domain, $scope.newDisplayName.value]);
                    $scope.setMessage($scope.tr("exchange_ACTION_configure_success"), "true");
                }).catch((err) => {
                    $scope.setMessage($scope.tr("exchange_ACTION_configure_error"), _.get(err, "data", ""));
                }).finally(() => {
                    $scope.edit.active = false;
                });
            } else {
                $scope.edit.active = false;
            }
        };

        init();
    }

]);

/**
 * Resiliate EmailPro service action
 */
angular.module("Module.emailpro.controllers").controller("EmailProRemoveEmailProCtrl", ($scope, $stateParams, EmailPro) => {
    "use strict";

    const getModel = function (exchange) {
        const model = {
            exchangeType: exchange.offer,
            automatic: exchange.renewType.automatic,
            deleteAtExpiration: !exchange.renewType.deleteAtExpiration, // switch the actual value
            renewPeriod: exchange.renewPeriod
        };
        return model;
    };

    $scope.exchange = angular.copy($scope.currentActionData);
    $scope.exchange.renewPeriod = "YEARLY";
    $scope.accountTypeHosted = EmailPro.accountTypeHosted;
    $scope.EmailPro2013Code = EmailPro.EmailPro2013Code;

    $scope.getSubmitButtonLabel = function () {
        return $scope.exchange.deleteAtExpirationValue ? $scope.tr("exchange_resilitation_action_button") : $scope.tr("exchange_resilitation_cancel_action_button");
    };

    $scope.submit = function () {
        EmailPro.updateDeleteAtExpiration($stateParams.productId, getModel($scope.exchange)).then((success) => {
            let updateRenewMessages;

            if ($scope.exchange.renewType.deleteAtExpiration) {
                updateRenewMessages = {
                    OK: $scope.tr("emailpro_resilitation_cancel_action_success"),
                    PARTIAL: $scope.tr("exchange_resilitation_cancel_action_partial"),
                    ERROR: $scope.tr("exchange_resilitation_cancel_action_failure")
                };
            } else {
                updateRenewMessages = {
                    OK: $scope.tr("emailpro_resilitation_action_success"),
                    PARTIAL: $scope.tr("exchange_resilitation_action_partial"),
                    ERROR: $scope.tr("emailpro_resilitation_action_failure")
                };
            }
            $scope.setMessage(updateRenewMessages, success);
            $scope.resetAction();
        }, (failure) => {
            if ($scope.exchange.renewType.deleteAtExpiration) {
                $scope.setMessage($scope.tr("exchange_resilitation_cancel_action_failure"), failure.data);
            } else {
                $scope.setMessage($scope.tr("emailpro_resilitation_action_failure"), failure.data);
            }
            $scope.resetAction();
        });
    };
});
