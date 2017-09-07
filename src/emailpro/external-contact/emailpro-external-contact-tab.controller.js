angular.module("Module.emailpro.controllers")
    .controller("EmailProTabExternalContactsCtrl", ($scope, $stateParams, EmailPro, EmailProExternalContacts, $timeout) => {
        "use strict";

        $scope.contactsLoading = false;
        $scope.contacts = null;
        $scope.filter = null;

        $scope.$watch("filter", (newValue) => {
            if ($scope.filter !== null) {
                if ($scope.filter === "") {
                    $scope.$broadcast("paginationServerSide.loadPage", 1, "externalContactsTable");
                } else {
                    $timeout(() => {
                        if ($scope.filter === newValue) {
                            $scope.$broadcast("paginationServerSide.loadPage", 1, "externalContactsTable");
                        }
                    }, 500);
                }
            }
        }, true);

        $scope.getStateClassFor = function (state) {
            switch (state) {
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
        };

        $scope.emptySearch = function () {
            $scope.filter = "";
            $scope.loadContacts();
        };

        $scope.loadContacts = function (count, offset) {
            $scope.contactsLoading = true;
            EmailProExternalContacts.getContacts($stateParams.organization, $stateParams.productId, count, offset, $scope.filter)
                .then((contacts) => {
                    $scope.contacts = contacts;
                    $scope.contactsLoading = false;
                })
                .catch(() => {
                    $scope.contactsLoading = false;
                });
        };

        $scope.deleteExternalContact = function (element) {
            if (!element.taskPendingId) {
                $scope.setAction("emailpro/external-contact/remove/emailpro-external-contact-remove", element.externalEmailAddress);
            }
        };

        $scope.modifyExternalContact = function (element) {
            if (!element.taskPendingId) {
                $scope.setAction("emailpro/external-contact/update/emailpro-external-contact-update", element);
            }
        };

        $scope.$on(EmailPro.events.externalcontactsChanged, () => {
            $scope.$broadcast("paginationServerSide.reload", "externalContactsTable");
        });

        $scope.getIsDisabled = function (account) {
            return !!account.taskPendingId;
        };

    });
