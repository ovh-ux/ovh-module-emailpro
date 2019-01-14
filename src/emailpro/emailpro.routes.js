angular
  .module('emailproRoutes')
  .config(($stateProvider) => {
    $stateProvider
      .state('app.email-pro', {
        url: '/configuration/email_pro/:productId',
        templateUrl: 'emailpro/emailpro.html',
        controller: 'EmailProCtrl',
        resolve: {
          navigationInformations: ['Navigator', '$rootScope', (Navigator, $rootScope) => {
            _.set($rootScope, 'currentSectionInformation', 'email_pro');
            return Navigator.setNavigationInformation({
              leftMenuVisible: true,
              configurationSelected: true,
            });
          }],
        },
        onExit: (emailproService) => {
          emailproService.resetCache();
        },
        translations: ['.'],
      })
      .state('app.email-pro.tab', {
        url: '?tab',
        reloadOnSearch: false,
        templateUrl: $stateParams => `emailpro/${_.kebabCase($stateParams.tab)}/emailpro-${_.kebabCase($stateParams.tab)}.html`,
      })
      .state('app.email.mxplan', {
        url: '/configuration/email_mxplan/:productId',
        templateUrl: 'emailpro/emailpro.html',
        controller: 'EmailProCtrl',
        resolve: {
          navigationInformations: ['Navigator', '$rootScope', (Navigator, $rootScope) => {
            _.set($rootScope, 'currentSectionInformation', 'email_mxplan');
            return Navigator.setNavigationInformation({
              leftMenuVisible: true,
              configurationSelected: true,
            });
          }],
        },
        onExit: (emailproService) => {
          emailproService.resetCache();
        },
        translations: ['.'],
      })
      .state('app.email.mxplan.tab', {
        url: '?tab',
        reloadOnSearch: false,
        templateUrl: $stateParams => `emailpro/${_.kebabCase($stateParams.tab)}/emailpro-${_.kebabCase($stateParams.tab)}.html`,
      })
      .state('app.email.mxplan.tabComponent', {
        url: '?tabComponent',
        reloadOnSearch: false,
        componentProvider: $stateParams => $stateParams.tabComponent,
      });
  });
