(() => {
  window.BookKeepingPortal.module.service('AccessControlService', [
    '$location',
    'AuthSessionService',
    function ($location, AuthSessionService) {
      function fallbackPathForRole() {
        if (AuthSessionService.hasAnyRole(['SADMIN', 'ADMIN', 'FINANCE'])) {
          return '/admin';
        }

        return '/reimbursement';
      }

      this.enforce = function (route) {
        const access = route?.$$route?.access || {};

        if (access.guestOnly && AuthSessionService.isAuthenticated()) {
          $location.path(fallbackPathForRole());
          return false;
        }

        if (!access.requiresAuth) {
          return true;
        }

        if (!AuthSessionService.isAuthenticated()) {
          $location.path('/login');
          return false;
        }

        if (Array.isArray(access.roles) && access.roles.length && !AuthSessionService.hasAnyRole(access.roles)) {
          $location.path(fallbackPathForRole());
          return false;
        }

        return true;
      };
    },
  ]);
})();
