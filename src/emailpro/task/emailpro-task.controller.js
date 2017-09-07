angular.module("Module.emailpro.controllers")
    .controller("EmailProTabTasksCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";

        $scope.tasksList = null;
        $scope.tableLoading = false;
        $scope.stateDoing = "DOING";
        $scope.stateError = "ERROR";
        $scope.stateDone = "DONE";
        $scope.stateCancelled = "CANCELLED";
        $scope.stateTodo = "TODO";

        $scope.loadPaginated = function (count, offset) {
            $scope.tableLoading = true;
            EmailPro.getTasks($stateParams.productId, count, offset)
                .then((tasks) => {
                    $scope.tableLoading = false;
                    $scope.tasksList = tasks;
                }, (failure) => {
                    $scope.tableLoading = false;
                    $scope.setMessage($scope.tr("exchange_tab_TASKS_error_message"), failure.data);
                });
        };

        $scope.$on(EmailPro.events.tasksChanged, () => {
            $scope.$broadcast("paginationServerSide.reload", "tasksTable");
        });

        $scope.refreshTable = function () {
            $scope.$broadcast("paginationServerSide.reload", "tasksTable");
        };
    });
