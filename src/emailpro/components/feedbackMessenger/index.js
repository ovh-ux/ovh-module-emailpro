// import angular from 'angular';
// import 'ovh-ui-angular';

import component from './emailpro-feedbackMessenger.component';

const moduleName = 'emailproFeedbackMessenger';

angular
  .module(
    moduleName,
    [
      'oui',
    ],
  )
  .component(
    moduleName,
    component,
  )
  .run(/* @ngTranslationsInject ./translations */);

export default moduleName;
