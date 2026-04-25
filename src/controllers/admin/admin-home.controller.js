(() => {
  window.BookKeepingPortal.module.controller('AdminHomeController', [
    'AuthSessionService',
    function (AuthSessionService) {
      const vm = this;

      vm.currentUser = AuthSessionService.getUser();

      vm.isSAdmin = function () {
        return AuthSessionService.hasRole('SADMIN');
      };

      vm.canCreateUsers = function () {
        return AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      };

      vm.canAccessBudgets = function () {
        return AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN']);
      };

      vm.canAccessReimbursements = function () {
        return AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN', 'FINANCE']);
      };
    },
  ]);
})();
