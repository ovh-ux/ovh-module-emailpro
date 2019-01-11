import emailproMailingList from './components/mailingList';

angular
  .module(
    'Module.emailpro',
    [
      'ovh-utils-angular',
      'ngRoute',
      'ui.bootstrap',
      'ngSanitize',
      'ng.ckeditor',
      'emailProComponents',
      'emailProConstants',
      'emailProControllers',
      'emailProFilters',
      emailproMailingList,
      'emailProRoutes',
      'emailProServices',
    ],
  );
