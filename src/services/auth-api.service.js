(() => {
  const app = window.BookKeepingPortal.module;
  const { API_BASE } = window.BookKeepingPortal;

  app.service('AuthApiService', [
    '$http',
    function ($http) {
      this.login = function (payload) {
        return $http.post(`${API_BASE}/users/auth/login`, payload).then((response) => response.data);
      };

      this.logout = function () {
        return $http.post(`${API_BASE}/users/auth/logout`).then((response) => response.data);
      };

      this.register = function (payload) {
        return $http.post(`${API_BASE}/users`, payload).then((response) => response.data);
      };
    },
  ]);
})();
