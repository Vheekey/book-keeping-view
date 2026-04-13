(() => {
  const app = window.BookKeepingPortal.module;
  const { API_BASE } = window.BookKeepingPortal;

  function padDatePart(value) {
    return String(value).padStart(2, '0');
  }

  function normalizeDateParam(value) {
    if (!value) return undefined;

    if (value instanceof Date) {
      if (Number.isNaN(value.getTime())) return undefined;

      return [
        value.getFullYear(),
        padDatePart(value.getMonth() + 1),
        padDatePart(value.getDate()),
      ].join('-');
    }

    if (typeof value === 'string') {
      const trimmed = value.trim();
      if (!trimmed) return undefined;

      const dateMatch = trimmed.match(/^(\d{4}-\d{2}-\d{2})/);
      return dateMatch ? dateMatch[1] : trimmed;
    }

    return undefined;
  }

  app.service('ReimbursementAdminService', [
    '$http',
    function ($http) {
      this.approve = function (reimbursementId, payload) {
        return $http
          .post(`${API_BASE}/reimbursements/${reimbursementId}/approve`, payload)
          .then((response) => response.data);
      };

      this.fetchList = function (params) {
        return $http
          .get(`${API_BASE}/reimbursements`, {
            params: {
              pageNumber: params.pageNumber,
              pageSize: params.pageSize,
              status: params.status,
              startDate: normalizeDateParam(params.startDate),
              endDate: normalizeDateParam(params.endDate),
            },
          })
          .then((response) => response.data);
      };

      this.fetchOne = function (reimbursementId) {
        return $http
          .get(`${API_BASE}/reimbursements/${reimbursementId}`)
          .then((response) => response.data);
      };

      this.payout = function (reimbursementId) {
        return $http
          .post(`${API_BASE}/reimbursements/${reimbursementId}/payout`)
          .then((response) => response.data);
      };
    },
  ]);
})();
