angular.module("Module.emailpro.controllers")
    .controller("EmailProTabTasksCtrl", ($scope, $stateParams, EmailPro) => {
        "use strict";

        $scope.tasksList = null;
        $scope.stateDoing = "DOING";
        $scope.stateError = "ERROR";
        $scope.stateDone = "DONE";
        $scope.stateCancelled = "CANCELLED";
        $scope.stateTodo = "TODO";

        $scope.loadPaginated = function ({ pageSize, offset }) {
            return EmailPro.getTasks($stateParams.productId, pageSize, offset - 1)
                .then((tasks) => {
                    $scope.tasksList = tasks;
                    return {
                        data: tasks.list.results,
                        meta: {
                            totalCount: tasks.count
                        }
                    };
                }).catch((failure) => {
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
