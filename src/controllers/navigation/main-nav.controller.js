(() => {
  window.BookKeepingPortal.module.controller('MainNavController', [
    '$scope',
    '$location',
    'AuthSessionService',
    function ($scope, $location, AuthSessionService) {
      const vm = this;

      vm.isOpen = false;

      vm.session = AuthSessionService.getSession();

      vm.isAuthenticated = function () {
        return AuthSessionService.isAuthenticated();
      };

      vm.user = function () {
        return AuthSessionService.getUser();
      };

      vm.roleLabel = function () {
        const user = AuthSessionService.getUser();
        return user?.roleName ? `(${user.roleName})` : '';
      };

      vm.hasAnyRole = function (roles) {
        return AuthSessionService.hasAnyRole(roles);
      };

      vm.toggle = function () {
        vm.isOpen = !vm.isOpen;
      };

      vm.close = function () {
        vm.isOpen = false;
        vm.session = AuthSessionService.getSession();
      };

      vm.logout = function () {
        AuthSessionService.clear();
        vm.session = null;
        vm.close();
        $location.path('/login');
      };

      $scope.$on('$routeChangeSuccess', vm.close);
    },
  ]);
})();
