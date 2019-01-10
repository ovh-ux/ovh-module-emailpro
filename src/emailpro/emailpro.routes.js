angular
  .module('emailproRoutes')
  .config(($stateProvider) => {
    $stateProvider.state('app.email-pro', {
      url: '/configuration/email_pro/:productId?tab',
      templateUrl: 'emailpro/emailpro.html',
      controller: 'EmailProCtrl',
      reloadOnSearch: false,
      resolve: {
        navigationInformations: ['Navigator', '$rootScope', (Navigator, $rootScope) => {
          _.set($rootScope, 'currentSectionInformation', 'email_pro');
          return Navigator.setNavigationInformation({
            leftMenuVisible: true,
            configurationSelected: true,
          });
        }],
      },
      translations: ['.'],
    });

    $stateProvider.state('app.email.mxplan', {
      url: '/configuration/email_mxplan/:productId?tab',
      templateUrl: 'emailpro/emailpro.html',
      controller: 'EmailProCtrl',
      reloadOnSearch: false,
      resolve: {
        navigationInformations: ['Navigator', '$rootScope', (Navigator, $rootScope) => {
          _.set($rootScope, 'currentSectionInformation', 'email_mxplan');
          return Navigator.setNavigationInformation({
            leftMenuVisible: true,
            configurationSelected: true,
          });
        }],
      },
      translations: ['.'],
    });
  });
