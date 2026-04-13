(() => {
  window.BookKeepingPortal.module.controller('BudgetAdminController', [
    'BudgetCategoryService',
    'ApiErrorService',
    'AuthSessionService',
    'SweetAlertService',
    function (BudgetCategoryService, ApiErrorService, AuthSessionService, SweetAlertService) {
      const vm = this;

      vm.categories = [];
      vm.loadingCategories = true;
      vm.creatingCategory = false;
      vm.statusPending = {};
      vm.categorySuccess = '';
      vm.categoryError = '';
      vm.categoryForm = {
        accNo: '',
        description: '',
      };
      vm.isSAdmin = AuthSessionService.hasRole('SADMIN');
      vm.canCreateUsers = AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      vm.canManage = AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);

      vm.loadCategories = function () {
        vm.loadingCategories = true;
        vm.categoryError = '';

        return BudgetCategoryService.fetchAllCategories()
          .then((categories) => {
            vm.categories = categories;
          })
          .catch((error) => {
            vm.categoryError = ApiErrorService.parse(error, 'Failed to load categories').message;
            SweetAlertService.error('Loading failed', vm.categoryError);
          })
          .finally(() => {
            vm.loadingCategories = false;
          });
      };

      vm.createCategory = function () {
        if (!vm.canManage) return;
        vm.categorySuccess = '';
        vm.categoryError = '';

        SweetAlertService.confirm({
          title: 'Create category?',
          text: `Create account ${vm.categoryForm.accNo} for "${vm.categoryForm.description}"?`,
          confirmButtonText: 'Create',
        })
          .then((result) => {
            if (!result.isConfirmed) return;

            vm.creatingCategory = true;

            return BudgetCategoryService.createCategory({
              accNo: vm.categoryForm.accNo,
              description: vm.categoryForm.description,
            })
              .then(() => vm.loadCategories())
              .then(() => {
                vm.categorySuccess = '';
                vm.categoryForm = { accNo: '', description: '' };
                return SweetAlertService.success('Category created', 'The budget category was created successfully.');
              })
              .catch((error) => {
                vm.categoryError = ApiErrorService.parse(error, 'Failed to create category').message;
                return SweetAlertService.error('Create failed', vm.categoryError);
              })
              .finally(() => {
                vm.creatingCategory = false;
              });
          });
      };

      vm.toggleCategory = function (category) {
        if (!vm.canManage) return;
        vm.categorySuccess = '';
        vm.categoryError = '';

        SweetAlertService.confirm({
          title: `${category.isActive ? 'Deactivate' : 'Activate'} category?`,
          text: `Update account ${category.accNo} to ${category.isActive ? 'inactive' : 'active'}?`,
          confirmButtonText: category.isActive ? 'Deactivate' : 'Activate',
        })
          .then((result) => {
            if (!result.isConfirmed) return;

            vm.statusPending[category.accNo] = true;

            return BudgetCategoryService.changeStatus(category.accNo)
              .then((response) => {
                const updated = (response.categories || []).find((item) => item.accNo === category.accNo);

                if (updated) {
                  category.isActive =
                    typeof updated.isActive === 'boolean' ? updated.isActive : Boolean(updated.active);
                  category.description = updated.description;
                } else {
                  category.isActive = !category.isActive;
                }

                vm.categorySuccess = '';
                return SweetAlertService.success('Category updated', `Category ${category.accNo} was updated.`);
              })
              .catch((error) => {
                vm.categoryError = ApiErrorService.parse(error, 'Failed to update category').message;
                return SweetAlertService.error('Update failed', vm.categoryError);
              });
          })
          .finally(() => {
            delete vm.statusPending[category.accNo];
          });
      };

      vm.loadCategories();
    },
  ]);
})();
