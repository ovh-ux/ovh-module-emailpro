export default class emailproFeedbackMessengerController {
  constructor($scope) {
    this.$scope = $scope;
  }

  $onInit() {
    this.$scope.message = this.message;
  }
}
