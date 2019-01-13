import emailproFeedbackMessenger from './components/feedbackMessenger';

angular
  .module(
    'Module.emailpro',
    [
      'emailproComponents',
      'emailproConstants',
      'emailproControllers',
      emailproFeedbackMessenger,
      'emailproFilters',
      'emailproRoutes',
      'emailproServices',
      'ng.ckeditor',
      'ngRoute',
      'ngSanitize',
      'ovh-utils-angular',
      'ui.bootstrap',
    ],
  );
