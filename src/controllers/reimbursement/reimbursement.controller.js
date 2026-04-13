(() => {
  const { API_BASE } = window.BookKeepingPortal;

  window.BookKeepingPortal.module.controller('ReimbursementController', [
    '$http',
    'BudgetCategoryService',
    'ApiErrorService',
    'AuthSessionService',
    'FormErrorService',
    'OcrService',
    'SweetAlertService',
    function ($http, BudgetCategoryService, ApiErrorService, AuthSessionService, FormErrorService, OcrService, SweetAlertService) {
      const vm = this;

      function createInitialForm() {
        return {
          expenditureDate: '',
          name: '',
          description: '',
          amount: null,
          shouldReimburse: 'true',
          accountName: '',
          clearingNumber: '',
          accountNumber: '',
          accNo: '',
          phoneNumber: '',
          isCorrect: 'true',
        };
      }

      function resetMessages() {
        vm.successMessage = '';
        vm.errorMessage = '';
        vm.fieldErrors = [];
        vm.fieldErrorsMap = {};
      }

      function applyParsedFields(fields) {
        Object.keys(fields).forEach((key) => {
          vm.form[key] = fields[key];
        });
      }

      vm.form = createInitialForm();
      vm.categories = [];
      vm.loadingCategories = true;
      vm.submitting = false;
      vm.successMessage = '';
      vm.errorMessage = '';
      vm.fieldErrors = [];
      vm.fieldErrorsMap = {};
      vm.selectedFile = null;
      vm.ocrRunning = false;
      vm.ocrStatus = '';
      vm.ocrError = '';
      vm.entryMode = 'manual';
      vm.currentUser = AuthSessionService.getUser();

      vm.categoryLabel = function (category) {
        return `${category.accNo} - ${category.description}`;
      };

      vm.selectEntryMode = function (mode) {
        vm.entryMode = mode;
      };

      vm.onFileChange = function (files) {
        const file = files?.[0] || null;
        vm.ocrError = '';
        vm.ocrStatus = '';
        vm.selectedFile = file;

        if (!file) {
          return;
        }

        const isPdf = file.type === 'application/pdf';
        const isImage = file.type.startsWith('image/');

        if (!isPdf && !isImage) {
          vm.ocrError = 'Please upload a PDF or image file.';
          vm.selectedFile = null;
        }
      };

      vm.runOcr = function () {
        if (!vm.selectedFile) return;

        vm.ocrRunning = true;
        vm.ocrError = '';
        vm.ocrStatus = 'Preparing file…';

        OcrService.extractText(vm.selectedFile, (progress) => {
          vm.ocrStatus = `Reading… ${progress}%`;
        })
          .then((text) => {
            applyParsedFields(OcrService.parseFields(text));
            vm.ocrStatus = 'Process complete.';
          })
          .catch((error) => {
            vm.ocrError = error.message || 'Failed to read the uploaded form.';
          })
          .finally(() => {
            vm.ocrRunning = false;
          });
      };

      vm.submit = function () {
        vm.submitting = true;
        resetMessages();

        const payload = {
          expenditureDate: vm.form.expenditureDate,
          name: vm.form.name,
          description: vm.form.description,
          amount: vm.form.amount,
          shouldReimburse: vm.form.shouldReimburse === 'true',
          accountName: vm.form.accountName,
          clearingNumber: vm.form.clearingNumber,
          accountNumber: vm.form.accountNumber,
          accNo: vm.form.accNo,
          phoneNumber: vm.form.phoneNumber,
          isCorrect: vm.form.isCorrect === 'true',
        };

        $http
          .post(`${API_BASE}/reimbursements/create`, payload)
          .then(() => {
            vm.successMessage = '';
            vm.form = {
              ...createInitialForm(),
              amount: null,
              name: vm.currentUser?.name || '',
            };
            return SweetAlertService.success('Reimbursement submitted', 'Your reimbursement was submitted successfully.');
          })
          .catch((error) => {
            const parsed = ApiErrorService.parse(error, 'Failed to submit reimbursement');
            vm.errorMessage = parsed.message;
            vm.fieldErrors = parsed.fieldErrors;
            vm.fieldErrorsMap = FormErrorService.toFieldMap(parsed.fieldErrors);
            if (!parsed.fieldErrors.length) {
              SweetAlertService.error('Submission failed', parsed.message);
            }
          })
          .finally(() => {
            vm.submitting = false;
          });
      };

      BudgetCategoryService.fetchActiveCategories()
        .then((categories) => {
          vm.categories = categories;
          if (vm.currentUser?.name && !vm.form.name) {
            vm.form.name = vm.currentUser.name;
          }
        })
        .catch(() => {
          vm.errorMessage = 'Failed to load budget categories.';
          SweetAlertService.error('Loading failed', vm.errorMessage);
        })
        .finally(() => {
          vm.loadingCategories = false;
        });
    },
  ]);
})();
