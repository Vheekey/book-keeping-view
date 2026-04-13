(() => {
  window.BookKeepingPortal.module.factory('AuthHttpInterceptor', [
    '$q',
    '$location',
    'AuthSessionService',
    function ($q, $location, AuthSessionService) {
      return {
        request(config) {
          const token = AuthSessionService.getToken();
          if (token) {
            config.headers = config.headers || {};
            config.headers.Authorization = `Bearer ${token}`;
          }
          return config;
        },
        responseError(rejection) {
          if (rejection?.status === 401) {
            AuthSessionService.clear();
            if ($location.path() !== '/login') {
              $location.path('/login');
            }
          }
          return $q.reject(rejection);
        },
      };
    },
  ]);
})();
