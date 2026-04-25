(() => {
  const app = window.BookKeepingPortal.module;
  const { API_BASE } = window.BookKeepingPortal;

  app.service('UserAdminService', [
    '$http',
    function ($http) {
      this.fetchList = function (params) {
        return $http
          .get(`${API_BASE}/users`, {
            params: {
              pageNumber: params.pageNumber,
              pageSize: params.pageSize,
              search: params.search || undefined,
            },
          })
          .then((response) => response.data);
      };

      this.fetchOne = function (userId) {
        return $http.get(`${API_BASE}/users/${userId}`).then((response) => response.data);
      };

      this.create = function (payload) {
        return $http.post(`${API_BASE}/users/create`, payload).then((response) => response.data);
      };

      this.update = function (userId, payload) {
        return $http.put(`${API_BASE}/users/${userId}`, payload).then((response) => response.data);
      };

      this.changeStatus = function (userId) {
        return $http.put(`${API_BASE}/users/${userId}/change-status`).then((response) => response.data);
      };

      this.remove = function (userId) {
        return $http.delete(`${API_BASE}/users/${userId}`).then((response) => response.data);
      };
    },
  ]);
})();
