(() => {
  const app = window.BookKeepingPortal.module;
  const { API_BASE } = window.BookKeepingPortal;

  app.service('BudgetCategoryService', [
    '$q',
    '$http',
    'AuthSessionService',
    function ($q, $http, AuthSessionService) {
      const { ajax } = rxjs.ajax;
      const { of } = rxjs;
      const { catchError, map } = rxjs.operators;

      function readActiveFlag(category) {
        if (typeof category.isActive === 'boolean') return category.isActive;
        if (typeof category.active === 'boolean') return category.active;
        return false;
      }

      function mapCategories(categories) {
        return (categories || []).map((category) => ({
          accNo: category.accNo,
          description: category.description,
          isActive: readActiveFlag(category),
        }));
      }

      function authHeaders() {
        const token = AuthSessionService.getToken();
        return {
          'Content-Type': 'application/json',
          ...(token ? { Authorization: `Bearer ${token}` } : {}),
        };
      }

      this.fetchActiveCategories = function () {
        const deferred = $q.defer();

        ajax({
          url: `${API_BASE}/budget/categories/active`,
          method: 'GET',
          headers: authHeaders(),
        })
          .pipe(
            map((response) => response.response?.categories || []),
            map((categories) => mapCategories(categories)),
            catchError((error) => {
              deferred.reject(error);
              return of([]);
            })
          )
          .subscribe({
            next: (categories) => deferred.resolve(categories),
            error: (error) => deferred.reject(error),
          });

        return deferred.promise;
      };

      this.fetchAllCategories = function () {
        return $http
          .get(`${API_BASE}/budget/categories`)
          .then((response) => mapCategories(response.data?.categories));
      };

      this.createCategory = function (payload) {
        return $http.post(`${API_BASE}/budget/categories`, payload).then((response) => response.data);
      };

      this.changeStatus = function (accNo) {
        return $http
          .put(`${API_BASE}/budget/categories/${encodeURIComponent(accNo)}/change-status`)
          .then((response) => response.data);
      };
    },
  ]);
})();
