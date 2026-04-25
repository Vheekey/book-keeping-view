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
    '$q',
    function ($http, $q) {
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

      this.fetchReceipts = function (reimbursementId) {
        return $http
          .get(`${API_BASE}/reimbursements/${reimbursementId}/receipts`)
          .then((response) => response.data);
      };

      this.fetchReceipt = function (reimbursementId, receiptId) {
        const urls = [
          `${API_BASE}/reimbursements/${reimbursementId}/receipts/${receiptId}/content`,
          `${API_BASE}/reimbursements/${reimbursementId}/receipts/${receiptId}/download`,
          `${API_BASE}/reimbursements/${reimbursementId}/receipts/${receiptId}/file`,
          `${API_BASE}/reimbursements/${reimbursementId}/receipts/${receiptId}/view`,
        ];

        function tryFetch(index, lastError) {
          if (index >= urls.length) {
            return $q.reject(lastError || new Error('No receipt file endpoint returned file content.'));
          }

          return $http
            .get(urls[index], {
              responseType: 'blob',
            })
            .then((response) => {
              const contentType = response.headers('Content-Type') || response.data?.type || '';

              if (String(contentType).toLowerCase().includes('application/json')) {
                return tryFetch(index + 1, {
                  data: { message: 'Receipt endpoint returned metadata instead of file content.' },
                });
              }

              return {
                blob: response.data,
                contentDisposition: response.headers('Content-Disposition'),
                contentType,
              };
            })
            .catch((error) => tryFetch(index + 1, error));
        }

        return tryFetch(0);
      };

      this.uploadReceipt = function (reimbursementId, file) {
        const formData = new FormData();
        formData.append('receipt', file);

        return $http
          .post(`${API_BASE}/reimbursements/${reimbursementId}/receipts`, formData, {
            headers: { 'Content-Type': undefined },
            transformRequest: angular.identity,
          })
          .then((response) => response.data);
      };

      this.deleteReceipt = function (reimbursementId, receiptId) {
        return $http
          .delete(`${API_BASE}/reimbursements/${reimbursementId}/receipts/${receiptId}`)
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
