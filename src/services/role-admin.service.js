(() => {
  const app = window.BookKeepingPortal.module;
  const { API_BASE } = window.BookKeepingPortal;

  app.service('RoleAdminService', [
    '$http',
    function ($http) {
      this.fetchList = function () {
        return $http.get(`${API_BASE}/roles`).then((response) => response.data);
      };

      this.fetchOne = function (roleId) {
        return $http.get(`${API_BASE}/roles/${roleId}`).then((response) => response.data);
      };

      this.create = function (payload) {
        return $http.post(`${API_BASE}/roles`, payload).then((response) => response.data);
      };

      this.update = function (roleId, payload) {
        return $http.put(`${API_BASE}/roles/${roleId}`, payload).then((response) => response.data);
      };

      this.remove = function (roleId) {
        return $http.delete(`${API_BASE}/roles/${roleId}`).then((response) => response.data);
      };

      this.assignUser = function (roleId, userId) {
        return $http.post(`${API_BASE}/roles/${roleId}/users/${userId}`).then((response) => response.data);
      };

      this.changeUserRole = function (userId, role) {
        return $http
          .post(`${API_BASE}/users/${userId}/role`, { role: String(role || '').toUpperCase() })
          .then((response) => response.data);
      };
    },
  ]);
})();
