angular.module('Module.emailpro').directive('emailproEditor', () => ({
  scope: {
    ngModel: '=',
  },
  link(scope, element) {
    if (!(!!window.MSInputMethodContext && !!document.documentMod)) {
      import('@ckeditor/ckeditor5-build-classic').then(mod => mod.default.create(element[0]).then((editor) => {
        editor.model.document.on('change:data', () => {
          _.set(scope, 'ngModel', editor.getData());
        });

        scope.$watch('ngModel', () => {
          editor.setData(scope.ngModel);
        });
      }));
    }
  },
}));
