(() => {
  const { API_BASE } = window.BookKeepingPortal;

  window.BookKeepingPortal.module.controller('ReimbursementAdminController', [
    '$timeout',
    '$window',
    'ReimbursementAdminService',
    'ApiErrorService',
    'AuthSessionService',
    'SweetAlertService',
    function ($timeout, $window, ReimbursementAdminService, ApiErrorService, AuthSessionService, SweetAlertService) {
      const vm = this;

      function syncSelectedReimbursement(response) {
        vm.selectedReimbursement = response.reimbursements?.[0] || null;
        vm.payoutForm.id = vm.selectedReimbursement?.id || null;
      }

      function firstPresent(values) {
        return values.find((value) => value !== undefined && value !== null && value !== '');
      }

      function readReimbursementField(reimbursement, keys) {
        if (!reimbursement) return null;
        return firstPresent(keys.map((key) => reimbursement[key]));
      }

      function normalizeReceipt(receipt) {
        if (!receipt) return null;

        if (typeof receipt === 'string') {
          return {
            name: 'Receipt',
            url: receipt,
          };
        }

        return {
          id: firstPresent([receipt.id, receipt.receiptId, receipt.fileId]),
          name: firstPresent([
            receipt.originalFilename,
            receipt.originalFileName,
            receipt.fileName,
            receipt.name,
            receipt.filename,
            'Receipt',
          ]),
          url: firstPresent([receipt.url, receipt.downloadUrl, receipt.fileUrl, receipt.receiptUrl, receipt.path]),
          contentType: firstPresent([
            receipt.storedContentType,
            receipt.sourceContentType,
            receipt.contentType,
            receipt.mimeType,
            receipt.type,
          ]),
          size: firstPresent([receipt.storedSizeBytes, receipt.originalSizeBytes, receipt.size, receipt.fileSize]),
          uploadedAt: firstPresent([receipt.uploadedAt, receipt.createdAt, receipt.createdDate]),
        };
      }

      function normalizeReceiptsResponse(response) {
        const receipts = Array.isArray(response)
          ? response
          : firstPresent([
              response?.receipts,
              response?.reimbursementReceipts,
              response?.files,
              response?.attachments,
              response?.data,
            ]);

        if (!Array.isArray(receipts)) {
          return [];
        }

        return receipts.map(normalizeReceipt).filter(Boolean);
      }

      function resolveReceiptUrl(url) {
        if (!url) return '';
        if (/^(blob:|https?:)/i.test(url)) return url;
        return new URL(url, `${API_BASE.replace(/\/$/, '')}/`).href;
      }

      vm.processingDecision = false;
      vm.processingPayout = false;
      vm.loadingReimbursements = false;
      vm.loadingReceipt = false;
      vm.loadingReceipts = false;
      vm.uploadingReceipt = false;
      vm.deletingReceiptId = null;
      vm.reimbursementSuccess = '';
      vm.reimbursementError = '';
      vm.receiptError = '';
      vm.reimbursements = [];
      vm.receiptsByReimbursementId = {};
      vm.selectedReceipts = [];
      vm.selectedReimbursement = null;
      vm.searchTerm = '';
      vm.filtersExpanded = false;
      vm.adminReceiptFile = null;
      vm.adminReceiptError = '';
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

      vm.reimbursementField = function (reimbursement, keys, fallback = 'n/a') {
        const value = readReimbursementField(reimbursement, keys);
        return value == null || value === '' ? fallback : value;
      };

      vm.reimbursementBooleanLabel = function (reimbursement, keys) {
        const value = readReimbursementField(reimbursement, keys);

        if (value === true || value === 'true' || value === 'TRUE') return 'Yes';
        if (value === false || value === 'false' || value === 'FALSE') return 'No';

        return 'n/a';
      };

      vm.reimbursementStatusClass = function (status) {
        const value = (status || '').toLowerCase();
        return {
          active: value === 'approved' || value === 'paid',
          inactive: value === 'rejected',
          pending: value === 'pending',
        };
      };

      vm.getReceiptInfo = function (reimbursement) {
        if (!reimbursement) return null;

        const receipt = Array.isArray(reimbursement.receipts)
          ? reimbursement.receipts[0]
          : firstPresent([
              reimbursement.receipt,
              reimbursement.receiptFile,
              reimbursement.receiptAttachment,
              reimbursement.attachment,
            ]);

        const normalized = normalizeReceipt(receipt);

        if (normalized) {
          return normalized;
        }

        if (reimbursement.hasReceipt || reimbursement.receiptId || reimbursement.receiptUrl) {
          return {
            id: firstPresent([reimbursement.receiptId, reimbursement.id]),
            name: firstPresent([reimbursement.receiptFileName, 'Receipt']),
            url: reimbursement.receiptUrl,
          };
        }

        return null;
      };

      vm.hasReceipt = function (reimbursement) {
        return vm.receiptCount(reimbursement) > 0;
      };

      vm.receiptLabel = function (reimbursement) {
        const receipt = vm.getReceiptInfo(reimbursement);
        return receipt?.name || 'Receipt';
      };

      vm.receiptCount = function (reimbursement) {
        if (!reimbursement) return 0;

        const cachedReceipts = vm.receiptsByReimbursementId[reimbursement.id];
        if (cachedReceipts) {
          return cachedReceipts.length;
        }

        if (Array.isArray(reimbursement.receipts)) {
          return reimbursement.receipts.length;
        }

        if (typeof reimbursement.receiptCount === 'number') {
          return reimbursement.receiptCount;
        }

        return vm.getReceiptInfo(reimbursement) ? 1 : 0;
      };

      vm.receiptCountLabel = function (reimbursement) {
        const count = vm.receiptCount(reimbursement);
        if (!count) return 'None';
        return count === 1 ? '1 receipt' : `${count} receipts`;
      };

      vm.onAdminReceiptFileChange = function (files) {
        const file = files?.[0] || null;
        vm.adminReceiptError = '';
        vm.adminReceiptFile = file;

        if (!file) {
          return;
        }

        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');
        const maxSize = 10 * 1024 * 1024;

        if (!isPdf && !isImage) {
          vm.adminReceiptError = 'Please attach a receipt as a PDF or image file.';
          vm.adminReceiptFile = null;
          return;
        }

        if (file.size > maxSize) {
          vm.adminReceiptError = 'Please attach a receipt smaller than 10 MB.';
          vm.adminReceiptFile = null;
        }
      };

      vm.clearAdminReceiptFile = function () {
        vm.adminReceiptFile = null;
        vm.adminReceiptError = '';
      };

      vm.loadReceipts = function (reimbursementId) {
        if (!reimbursementId) return Promise.resolve([]);

        vm.loadingReceipts = true;
        vm.receiptError = '';

        return ReimbursementAdminService.fetchReceipts(reimbursementId)
          .then((response) => {
            const receipts = normalizeReceiptsResponse(response);
            vm.receiptsByReimbursementId[reimbursementId] = receipts;
            if (vm.selectedReimbursement?.id === reimbursementId) {
              vm.selectedReceipts = receipts;
            }
            return receipts;
          })
          .catch((error) => {
            vm.receiptError = ApiErrorService.parse(error, 'Failed to load receipts').message;
            SweetAlertService.error('Receipt loading failed', vm.receiptError);
            return [];
          })
          .finally(() => {
            vm.loadingReceipts = false;
          });
      };

      vm.openReceipt = function (receipt) {
        if (!vm.selectedReimbursement || !receipt) return;

        vm.receiptError = '';

        if (receipt.url) {
          $window.open(resolveReceiptUrl(receipt.url), '_blank', 'noopener');
          return;
        }

        vm.loadingReceipt = true;
        const receiptWindow = $window.open('', '_blank');

        ReimbursementAdminService.fetchReceipt(vm.selectedReimbursement.id, receipt.id)
          .then((response) => {
            const blob = response.blob;
            const blobUrl = $window.URL.createObjectURL(blob);
            if (receiptWindow) {
              receiptWindow.location = blobUrl;
            } else {
              $window.open(blobUrl, '_blank', 'noopener');
            }
            $timeout(() => {
              $window.URL.revokeObjectURL(blobUrl);
            }, 60000);
          })
          .catch((error) => {
            if (receiptWindow) {
              receiptWindow.close();
            }
            vm.receiptError = ApiErrorService.parse(error, 'Failed to load receipt').message;
            SweetAlertService.error('Receipt unavailable', vm.receiptError);
          })
          .finally(() => {
            vm.loadingReceipt = false;
          });
      };

      vm.uploadReceipt = function () {
        if (!vm.selectedReimbursement || !vm.adminReceiptFile || vm.adminReceiptError) return;

        vm.uploadingReceipt = true;
        vm.receiptError = '';

        ReimbursementAdminService.uploadReceipt(vm.selectedReimbursement.id, vm.adminReceiptFile)
          .then((response) => {
            vm.clearAdminReceiptFile();
            return vm.loadReceipts(vm.selectedReimbursement.id).then(() =>
              SweetAlertService.success('Receipt uploaded', response?.message || 'The receipt was attached successfully.')
            );
          })
          .catch((error) => {
            vm.receiptError = ApiErrorService.parse(error, 'Failed to upload receipt').message;
            SweetAlertService.error('Receipt upload failed', vm.receiptError);
          })
          .finally(() => {
            vm.uploadingReceipt = false;
          });
      };

      vm.deleteReceipt = function (receipt) {
        if (!vm.selectedReimbursement || !receipt?.id) return;

        SweetAlertService.confirm({
          title: 'Remove receipt?',
          text: 'This receipt will be removed from the reimbursement.',
          confirmButtonText: 'Remove',
        }).then((result) => {
          if (!result.isConfirmed) return;

          vm.deletingReceiptId = receipt.id;
          vm.receiptError = '';

          return ReimbursementAdminService.deleteReceipt(vm.selectedReimbursement.id, receipt.id)
            .then((response) =>
              vm.loadReceipts(vm.selectedReimbursement.id).then(() =>
                SweetAlertService.success('Receipt removed', response?.message || 'The receipt was removed successfully.')
              )
            )
            .catch((error) => {
              vm.receiptError = ApiErrorService.parse(error, 'Failed to remove receipt').message;
              return SweetAlertService.error('Receipt removal failed', vm.receiptError);
            })
            .finally(() => {
              vm.deletingReceiptId = null;
            });
        });
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
        vm.receiptError = '';
        vm.adminReceiptError = '';
        vm.adminReceiptFile = null;
        vm.selectedReceipts = [];

        ReimbursementAdminService.fetchOne(reimbursementId)
          .then((response) => {
            const reimbursement = response.reimbursements?.[0] || null;
            vm.selectedReimbursement = reimbursement;
            vm.reimbursementForm.id = reimbursement?.id || null;
            vm.reimbursementForm.comment = reimbursement?.adminComment || '';
            vm.reimbursementForm.isApproved = reimbursement?.status !== 'REJECTED';
            vm.payoutForm.id = reimbursement?.id || null;

            if (reimbursement?.id) {
              vm.loadReceipts(reimbursement.id);
            }

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
