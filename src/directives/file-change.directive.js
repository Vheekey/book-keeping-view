(() => {
  window.BookKeepingPortal.module.directive('fileChange', [
    function () {
      return {
        restrict: 'A',
        scope: {
          fileChange: '&',
        },
        link(scope, element) {
          element.on('change', (event) => {
            const files = event.target.files ? Array.from(event.target.files) : [];
            scope.$applyAsync(() => {
              scope.fileChange({ $files: files });
            });
          });
        },
      };
    },
  ]);
})();
