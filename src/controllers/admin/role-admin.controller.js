(() => {
  window.BookKeepingPortal.module.controller('RoleAdminController', [
    'RoleAdminService',
    'ApiErrorService',
    'SweetAlertService',
    function (RoleAdminService, ApiErrorService, SweetAlertService) {
      const vm = this;

      function syncSelectedRole(response) {
        vm.selectedRole = response.roles?.[0] || null;
        vm.roleForm = {
          id: vm.selectedRole?.id || null,
          name: vm.selectedRole?.name || '',
        };
      }

      vm.roles = [];
      vm.selectedRole = null;
      vm.loadingRoles = false;
      vm.savingRole = false;
      vm.deletingRole = false;
      vm.roleError = '';
      vm.createForm = { name: '' };
      vm.roleForm = { id: null, name: '' };

      vm.loadRoles = function () {
        vm.loadingRoles = true;
        vm.roleError = '';

        return RoleAdminService.fetchList()
          .then((response) => {
            vm.roles = response.roles || [];
          })
          .catch((error) => {
            vm.roleError = ApiErrorService.parse(error, 'Failed to load roles').message;
            SweetAlertService.error('Loading failed', vm.roleError);
          })
          .finally(() => {
            vm.loadingRoles = false;
          });
      };

      vm.selectRole = function (roleId) {
        vm.roleError = '';

        return RoleAdminService.fetchOne(roleId)
          .then((response) => {
            syncSelectedRole(response);
          })
          .catch((error) => {
            vm.roleError = ApiErrorService.parse(error, 'Failed to load role').message;
            SweetAlertService.error('Loading failed', vm.roleError);
          });
      };

      vm.createRole = function () {
        vm.roleError = '';
        vm.savingRole = true;

        return RoleAdminService.create({ name: vm.createForm.name })
          .then(() => {
            vm.createForm = { name: '' };
            return vm.loadRoles();
          })
          .then(() => SweetAlertService.success('Role created', 'The role was created.'))
          .catch((error) => {
            vm.roleError = ApiErrorService.parse(error, 'Failed to create role').message;
            return SweetAlertService.error('Create failed', vm.roleError);
          })
          .finally(() => {
            vm.savingRole = false;
          });
      };

      vm.updateRole = function () {
        vm.roleError = '';
        vm.savingRole = true;

        return RoleAdminService.update(vm.roleForm.id, { name: vm.roleForm.name })
          .then((response) => {
            syncSelectedRole(response);
            return vm.loadRoles();
          })
          .then(() => SweetAlertService.success('Role updated', 'The role was updated.'))
          .catch((error) => {
            vm.roleError = ApiErrorService.parse(error, 'Failed to update role').message;
            return SweetAlertService.error('Update failed', vm.roleError);
          })
          .finally(() => {
            vm.savingRole = false;
          });
      };

      vm.deleteRole = function () {
        vm.roleError = '';

        return SweetAlertService.confirm({
          title: 'Delete role?',
          text: `Remove ${vm.selectedRole?.name || 'this role'} permanently?`,
          confirmButtonText: 'Delete',
        }).then((result) => {
          if (!result.isConfirmed) return;

          vm.deletingRole = true;
          return RoleAdminService.remove(vm.roleForm.id)
            .then(() => {
              vm.selectedRole = null;
              vm.roleForm = { id: null, name: '' };
              return vm.loadRoles();
            })
            .then(() => SweetAlertService.success('Role deleted', 'The role was deleted.'))
            .catch((error) => {
              vm.roleError = ApiErrorService.parse(error, 'Failed to delete role').message;
              return SweetAlertService.error('Delete failed', vm.roleError);
            })
            .finally(() => {
              vm.deletingRole = false;
            });
        });
      };

      vm.loadRoles();
    },
  ]);
})();
