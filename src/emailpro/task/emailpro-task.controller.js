angular.module('Module.emailpro.controllers')
  .controller('EmailProTabTasksCtrl', ($scope, $stateParams, $translate, EmailPro) => {
    $scope.tasksList = null;
    $scope.stateDoing = 'DOING';
    $scope.stateError = 'ERROR';
    $scope.stateDone = 'DONE';
    $scope.stateCancelled = 'CANCELLED';
    $scope.stateTodo = 'TODO';
    $scope.mailinglist = "mailinglist";
    $scope.redirection = "redirection";

    $scope.loadPaginated = function ({ pageSize, offset }) {
      return EmailPro.getTasks($stateParams.productId, pageSize, offset - 1, $scope.exchange.associatedDomainName)
        .then((tasks) => {
          $scope.tasksList = _.flatten(tasks);
          return {
            data: $scope.tasksList,
            meta: {
              totalCount: $scope.tasksList.length,
            },
          };
        }).catch((failure) => {
          $scope.setMessage($translate.instant('emailpro_tab_TASKS_error_message'), failure.data);
          return { data: null, meta: { totalCount: 0 }};
        });
    };

    $scope.$on(EmailPro.events.tasksChanged, () => {
      $scope.$broadcast('paginationServerSide.reload', 'tasksTable');
    });

    $scope.refreshTable = function () {
      $scope.$broadcast('paginationServerSide.reload', 'tasksTable');
    };
  });
