// import angular from 'angular';
// import emailProFeedbackMessenger from '../feedbackMessenger';

// import 'ovh-ui-angular';

import component from './emailpro-mailingList.component';

const moduleName = 'emailproMailingList';

angular
  .module(
    moduleName,
    [
      'emailproFeedbackMessenger',
      'oui',
    ],
  )
  .component('emailproMailingList', component)
  .run(/* @ngTranslationsInject ./translations */);

export default moduleName;
