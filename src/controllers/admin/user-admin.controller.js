(() => {
  window.BookKeepingPortal.module.controller('UserAdminController', [
    '$scope',
    'UserAdminService',
    'RoleAdminService',
    'ApiErrorService',
    'AuthSessionService',
    'FormErrorService',
    'SweetAlertService',
    function (
      $scope,
      UserAdminService,
      RoleAdminService,
      ApiErrorService,
      AuthSessionService,
      FormErrorService,
      SweetAlertService
    ) {
      const vm = this;
      const { Subject } = rxjs;
      const { debounceTime, distinctUntilChanged } = rxjs.operators;
      const searchTerms = new Subject();
      const searchSubscription = searchTerms
        .pipe(debounceTime(300), distinctUntilChanged())
        .subscribe((term) => {
          $scope.$evalAsync(() => {
            vm.filters.pageNumber = 0;
            vm.filters.search = term;
            vm.loadUsers();
          });
        });

      function syncSelectedUser(response) {
        vm.selectedUser = response.users?.[0] || null;
        if (!vm.selectedUser) return;

        vm.userForm = {
          id: vm.selectedUser.id,
          name: vm.selectedUser.name || '',
          email: vm.selectedUser.email || '',
          username: vm.selectedUser.username || '',
          roleId: vm.selectedUser.roleId || null,
          roleName: vm.selectedUser.roleName || '',
        };
      }

      vm.loadingUsers = false;
      vm.loadingRoles = false;
      vm.savingUser = false;
      vm.creatingUser = false;
      vm.togglingStatus = false;
      vm.deletingUser = false;
      vm.assigningRole = false;
      vm.userError = '';
      vm.createFieldErrorsMap = {};
      vm.users = [];
      vm.roles = [];
      vm.selectedUser = null;
      vm.isSAdmin = AuthSessionService.hasRole('SADMIN');
      vm.canCreateUsers = AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      vm.filters = {
        pageNumber: 0,
        pageSize: 10,
        search: '',
      };
      vm.userForm = {
        id: null,
        name: '',
        email: '',
        username: '',
        roleId: null,
        roleName: '',
      };
      vm.createForm = {
        name: '',
        email: '',
        username: '',
        password: '',
      };

      vm.onSearchChange = function () {
        searchTerms.next((vm.filters.search || '').trim());
      };

      vm.filteredUsers = function () {
        const term = (vm.filters.search || '').trim().toLowerCase();
        if (!term) return vm.users;

        return vm.users.filter((user) =>
          [user.name, user.email, user.username, user.roleName, user.isActive ? 'active' : 'inactive'].some((value) =>
            String(value || '').toLowerCase().includes(term)
          )
        );
      };

      vm.loadRoles = function () {
        if (!vm.isSAdmin) return Promise.resolve();
        vm.loadingRoles = true;
        return RoleAdminService.fetchList()
          .then((response) => {
            vm.roles = response.roles || [];
          })
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to load roles').message;
          })
          .finally(() => {
            vm.loadingRoles = false;
          });
      };

      vm.loadUsers = function () {
        if (!vm.isSAdmin) return Promise.resolve();
        vm.loadingUsers = true;
        vm.userError = '';

        return UserAdminService.fetchList(vm.filters)
          .then((response) => {
            vm.users = response.users || [];
            vm.totalPages = response.totalPages || 0;
          })
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to load users').message;
            SweetAlertService.error('Loading failed', vm.userError);
          })
          .finally(() => {
            vm.loadingUsers = false;
          });
      };

      vm.selectUser = function (userId) {
        if (!vm.isSAdmin) return;
        vm.userError = '';

        return UserAdminService.fetchOne(userId)
          .then((response) => {
            syncSelectedUser(response);
          })
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to load user').message;
            SweetAlertService.error('Loading failed', vm.userError);
          });
      };

      vm.saveUser = function () {
        if (!vm.isSAdmin) return;
        vm.userError = '';
        vm.savingUser = true;

        return UserAdminService.update(vm.userForm.id, {
          name: vm.userForm.name,
          email: vm.userForm.email,
          username: vm.userForm.username,
        })
          .then((response) => {
            syncSelectedUser(response);
            return vm.loadUsers();
          })
          .then(() => SweetAlertService.success('User updated', 'The user record was updated.'))
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to update user').message;
            return SweetAlertService.error('Update failed', vm.userError);
          })
          .finally(() => {
            vm.savingUser = false;
          });
      };

      vm.createUser = function () {
        vm.userError = '';
        vm.createFieldErrorsMap = {};
        vm.creatingUser = true;

        return UserAdminService.create({
          ...vm.createForm,
          username: (vm.createForm.username || '').trim() || null,
        })
          .then((response) => {
            vm.createForm = { name: '', email: '', username: '', password: '' };
            syncSelectedUser(response);
            return vm.loadUsers();
          })
          .then(() => SweetAlertService.success('User created', 'The user account was created.'))
          .catch((error) => {
            const parsed = ApiErrorService.parse(error, 'Failed to create user');
            vm.userError = parsed.message;
            vm.createFieldErrorsMap = FormErrorService.toFieldMap(parsed.fieldErrors);

            if (!parsed.fieldErrors.length) {
              return SweetAlertService.error('Create failed', vm.userError);
            }
          })
          .finally(() => {
            vm.creatingUser = false;
          });
      };

      vm.assignRole = function () {
        if (!vm.isSAdmin) return;
        vm.userError = '';
        vm.assigningRole = true;

        return RoleAdminService.changeUserRole(vm.userForm.id, vm.userForm.roleName)
          .then(() => vm.selectUser(vm.userForm.id))
          .then(() => vm.loadUsers())
          .then(() => SweetAlertService.success('Role changed', 'The user role was updated.'))
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to change role').message;
            return SweetAlertService.error('Role change failed', vm.userError);
          })
          .finally(() => {
            vm.assigningRole = false;
          });
      };

      vm.toggleStatus = function () {
        if (!vm.isSAdmin) return;
        vm.userError = '';
        vm.togglingStatus = true;

        return UserAdminService.changeStatus(vm.userForm.id)
          .then((response) => {
            syncSelectedUser(response);
            return vm.loadUsers();
          })
          .then(() => SweetAlertService.success('Status updated', 'The user status was updated.'))
          .catch((error) => {
            vm.userError = ApiErrorService.parse(error, 'Failed to update status').message;
            return SweetAlertService.error('Status update failed', vm.userError);
          })
          .finally(() => {
            vm.togglingStatus = false;
          });
      };

      vm.deleteUser = function () {
        if (!vm.isSAdmin) return;
        vm.userError = '';

        return SweetAlertService.confirm({
          title: 'Delete user?',
          text: `Remove ${vm.selectedUser?.name || 'this user'} permanently?`,
          confirmButtonText: 'Delete',
        }).then((result) => {
          if (!result.isConfirmed) return;

          vm.deletingUser = true;
          return UserAdminService.remove(vm.userForm.id)
            .then(() => {
              vm.selectedUser = null;
              vm.userForm = { id: null, name: '', email: '', username: '', roleId: null, roleName: '' };
              return vm.loadUsers();
            })
            .then(() => SweetAlertService.success('User deleted', 'The user was deleted.'))
            .catch((error) => {
              vm.userError = ApiErrorService.parse(error, 'Failed to delete user').message;
              return SweetAlertService.error('Delete failed', vm.userError);
            })
            .finally(() => {
              vm.deletingUser = false;
            });
        });
      };

      vm.changePage = function (direction) {
        if (!vm.isSAdmin) return;
        const nextPage = vm.filters.pageNumber + direction;
        if (nextPage < 0) return;
        vm.filters.pageNumber = nextPage;
        vm.loadUsers();
      };

      $scope.$on('$destroy', function () {
        searchSubscription.unsubscribe();
      });

      vm.loadRoles();
      vm.loadUsers();
    },
  ]);
})();
