(() => {
  window.BookKeepingPortal.module.controller('ReimbursementAdminController', [
    '$timeout',
    'ReimbursementAdminService',
    'ApiErrorService',
    'AuthSessionService',
    'SweetAlertService',
    function ($timeout, ReimbursementAdminService, ApiErrorService, AuthSessionService, SweetAlertService) {
      const vm = this;

      function syncSelectedReimbursement(response) {
        vm.selectedReimbursement = response.reimbursements?.[0] || null;
        vm.payoutForm.id = vm.selectedReimbursement?.id || null;
      }

      vm.processingDecision = false;
      vm.processingPayout = false;
      vm.loadingReimbursements = false;
      vm.reimbursementSuccess = '';
      vm.reimbursementError = '';
      vm.reimbursements = [];
      vm.selectedReimbursement = null;
      vm.searchTerm = '';
      vm.filtersExpanded = false;
      vm.reimbursementForm = {
        id: null,
        comment: '',
        isApproved: true,
      };
      vm.filters = {
        status: 'all',
        pageNumber: 0,
        pageSize: 10,
        startDate: '',
        endDate: '',
      };
      vm.payoutForm = {
        id: null,
      };
      vm.isSAdmin = AuthSessionService.hasRole('SADMIN');
      vm.canCreateUsers = AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      vm.canAccessBudgets = AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      vm.canProcess = AuthSessionService.hasRole('FINANCE');

      vm.formatAmount = function (amount) {
        return amount == null ? 'n/a' : `${amount}`;
      };

      vm.formatDate = function (value) {
        if (!value) return 'n/a';
        if (value instanceof Date && !Number.isNaN(value.getTime())) {
          return [
            value.getFullYear(),
            String(value.getMonth() + 1).padStart(2, '0'),
            String(value.getDate()).padStart(2, '0'),
          ].join('-');
        }

        const dateMatch = typeof value === 'string' ? value.match(/^(\d{4}-\d{2}-\d{2})/) : null;
        return dateMatch ? dateMatch[1] : value;
      };

      vm.formatDateTime = function (value) {
        if (!value) return 'n/a';
        const date = new Date(value);
        return Number.isNaN(date.getTime()) ? value : date.toLocaleString();
      };

      vm.reimbursementStatusClass = function (status) {
        const value = (status || '').toLowerCase();
        return {
          active: value === 'approved' || value === 'paid',
          inactive: value === 'rejected',
          pending: value === 'pending',
        };
      };

      vm.canGoNextPage = function () {
        return vm.reimbursements.length === vm.filters.pageSize;
      };

      vm.filteredReimbursements = function () {
        const term = (vm.searchTerm || '').trim().toLowerCase();
        if (!term) return vm.reimbursements;

        return vm.reimbursements.filter((reimbursement) => {
          const fields = [
            reimbursement.name,
            reimbursement.status,
            reimbursement.amount,
            reimbursement.description,
            reimbursement.accNo,
            reimbursement.expenditureDate,
          ];

          return fields.some((value) => String(value || '').toLowerCase().includes(term));
        });
      };

      vm.loadReimbursements = function () {
        vm.loadingReimbursements = true;
        vm.reimbursementError = '';

        return ReimbursementAdminService.fetchList(vm.filters)
          .then((response) => {
            vm.reimbursements = response.reimbursements || [];

            if (vm.selectedReimbursement) {
              const match = vm.reimbursements.find((item) => item.id === vm.selectedReimbursement.id);
              if (match) {
                vm.selectedReimbursement = match;
              }
            }
          })
          .catch((error) => {
            vm.reimbursementError = ApiErrorService.parse(error, 'Failed to load reimbursements').message;
            SweetAlertService.error('Loading failed', vm.reimbursementError);
          })
          .finally(() => {
            vm.loadingReimbursements = false;
          });
      };

      vm.applyFilters = function () {
        vm.filters.pageNumber = 0;
        vm.loadReimbursements();
      };

      vm.changePage = function (direction) {
        const nextPage = vm.filters.pageNumber + direction;
        if (nextPage < 0) return;
        vm.filters.pageNumber = nextPage;
        vm.loadReimbursements();
      };

      vm.selectReimbursement = function (reimbursementId) {
        vm.reimbursementError = '';

        ReimbursementAdminService.fetchOne(reimbursementId)
          .then((response) => {
            const reimbursement = response.reimbursements?.[0] || null;
            vm.selectedReimbursement = reimbursement;
            vm.reimbursementForm.id = reimbursement?.id || null;
            vm.reimbursementForm.comment = reimbursement?.adminComment || '';
            vm.reimbursementForm.isApproved = reimbursement?.status !== 'REJECTED';
            vm.payoutForm.id = reimbursement?.id || null;

            $timeout(() => {
              const workbench = document.getElementById('review-workbench');
              if (workbench) {
                workbench.scrollIntoView({ behavior: 'smooth', block: 'start' });
              }
            });
          })
          .catch((error) => {
            vm.reimbursementError = ApiErrorService.parse(error, 'Failed to load reimbursement').message;
            SweetAlertService.error('Loading failed', vm.reimbursementError);
          });
      };

      vm.processDecision = function () {
        if (!vm.canProcess) return;
        vm.reimbursementSuccess = '';
        vm.reimbursementError = '';

        SweetAlertService.confirm({
          title: vm.reimbursementForm.isApproved ? 'Approve reimbursement?' : 'Reject reimbursement?',
          text: vm.reimbursementForm.isApproved
            ? 'This reimbursement will be marked as approved.'
            : 'This reimbursement will be marked as rejected.',
          confirmButtonText: vm.reimbursementForm.isApproved ? 'Approve' : 'Reject',
        })
          .then((result) => {
            if (!result.isConfirmed) return;

            vm.processingDecision = true;

            return ReimbursementAdminService.approve(vm.reimbursementForm.id, {
              comment: vm.reimbursementForm.comment || '',
              isApproved: String(vm.reimbursementForm.isApproved),
            })
              .then((response) => {
                syncSelectedReimbursement(response);
                vm.reimbursementSuccess = '';
                return SweetAlertService.success(
                  'Reimbursement updated',
                  response.message || 'The reimbursement was processed successfully.'
                );
              })
              .then(() => vm.loadReimbursements())
              .catch((error) => {
                vm.reimbursementError = ApiErrorService.parse(error, 'Failed to process reimbursement').message;
                return SweetAlertService.error('Processing failed', vm.reimbursementError);
              })
              .finally(() => {
                vm.processingDecision = false;
              });
          });
      };

      vm.processPayout = function () {
        if (!vm.canProcess) return;
        vm.reimbursementSuccess = '';
        vm.reimbursementError = '';

        SweetAlertService.confirm({
          title: 'Mark payout?',
          text: 'This reimbursement will be marked as paid.',
          confirmButtonText: 'Mark paid',
        })
          .then((result) => {
            if (!result.isConfirmed) return;

            vm.processingPayout = true;

            return ReimbursementAdminService.payout(vm.payoutForm.id)
              .then((response) => {
                syncSelectedReimbursement(response);
                vm.reimbursementSuccess = '';
                return SweetAlertService.success(
                  'Payout recorded',
                  response.message || 'The reimbursement was marked as paid.'
                );
              })
              .then(() => vm.loadReimbursements())
              .catch((error) => {
                vm.reimbursementError = ApiErrorService.parse(error, 'Failed to mark payout').message;
                return SweetAlertService.error('Payout failed', vm.reimbursementError);
              })
              .finally(() => {
                vm.processingPayout = false;
              });
          });
      };

      vm.loadReimbursements();
    },
  ]);
})();
