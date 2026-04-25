(() => {
  const namespace = (window.BookKeepingPortal = window.BookKeepingPortal || {});

  namespace.API_BASE =
    window.__ENV__?.API_BASE || 'http://localhost:9095/api/v1/book-keeping';
  namespace.templates = namespace.templates || {};
  namespace.module = angular.module('bookKeepingPortal', ['ngRoute']);

  namespace.module.config([
    '$httpProvider',
    function ($httpProvider) {
      $httpProvider.interceptors.push('AuthHttpInterceptor');
    },
  ]);

  namespace.module.run([
    '$rootScope',
    'AccessControlService',
    function ($rootScope, AccessControlService) {
      $rootScope.$on('$routeChangeStart', function (event, next) {
        if (!AccessControlService.enforce(next)) {
          event.preventDefault();
        }
      });
    },
  ]);
})();
