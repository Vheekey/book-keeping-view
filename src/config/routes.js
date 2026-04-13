(() => {
  const app = window.BookKeepingPortal.module;
  const { templates } = window.BookKeepingPortal;

  app.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/', {
          template: templates.home,
        })
        .when('/home', {
          template: templates.home,
        })
        .when('/reimbursement', {
          template: templates.reimbursement,
          controller: 'ReimbursementController',
          controllerAs: 'vm',
        })
        .when('/admin', {
          template: templates.adminHome,
          controller: 'AdminHomeController',
          controllerAs: 'vm',
          access: {
            requiresAuth: true,
            roles: ['SADMIN', 'ADMIN', 'FINANCE'],
          },
        })
        .when('/admin/budgets', {
          template: templates.budgetAdmin,
          controller: 'BudgetAdminController',
          controllerAs: 'vm',
          access: {
            requiresAuth: true,
            roles: ['SADMIN', 'ADMIN'],
          },
        })
        .when('/admin/reimbursements', {
          template: templates.reimbursementAdmin,
          controller: 'ReimbursementAdminController',
          controllerAs: 'vm',
          access: {
            requiresAuth: true,
            roles: ['SADMIN', 'ADMIN', 'FINANCE'],
          },
        })
        .when('/admin/users', {
          template: templates.userAdmin,
          controller: 'UserAdminController',
          controllerAs: 'vm',
          access: {
            requiresAuth: true,
            roles: ['SADMIN', 'ADMIN'],
          },
        })
        .when('/admin/roles', {
          template: templates.roleAdmin,
          controller: 'RoleAdminController',
          controllerAs: 'vm',
          access: {
            requiresAuth: true,
            roles: ['SADMIN'],
          },
        })
        .when('/login', {
          template: templates.login,
          controller: 'LoginController',
          controllerAs: 'vm',
          access: {
            guestOnly: true,
          },
        })
        .otherwise({ redirectTo: '/home' });
    },
  ]);
})();
