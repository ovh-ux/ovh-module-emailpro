import ClassicEditor from '@ckeditor/ckeditor5-build-classic';

angular.module('Module.emailpro').directive('emailproEditor', () => ({
  scope: {
    ngModel: '=',
  },
  link(scope, element) {
    ClassicEditor.create(element[0]).then((editor) => {
      editor.model.document.on('change:data', () => {
        _.set(scope, 'ngModel', editor.getData());
      });

      scope.$watch('ngModel', () => {
        editor.setData(scope.ngModel);
      });
    });
  },
}));
