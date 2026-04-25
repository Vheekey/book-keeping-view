(() => {
  window.BookKeepingPortal.templates.adminHome = `
    <section class="panel admin-panel" ng-controller="AdminHomeController as vm">
      <div class="panel-intro">
        <div>
          <span class="badge">Admin</span>
          <h2>Admin hub</h2>
        </div>
        <div class="helper-text" ng-if="vm.currentUser">
          Signed in as {{ vm.currentUser.name }} ({{ vm.currentUser.roleName }})
        </div>
      </div>

      <div class="admin-home-grid">
        <a class="admin-card" href="#!/admin/budgets" ng-if="vm.canAccessBudgets()">
          <span class="badge">Budget</span>
          <h3>Budget categories</h3>
          <p>List all categories, add a new account number, and toggle active status.</p>
          <span class="admin-card-link">Open budget tools</span>
        </a>
        <a class="admin-card" href="#!/admin/reimbursements" ng-if="vm.canAccessReimbursements()">
          <span class="badge">Reimbursements</span>
          <h3>Reimbursements</h3>
          <p>Browse reimbursement requests, filter by status, inspect details, and process payouts.</p>
          <span class="admin-card-link">Open reimbursement tools</span>
        </a>
        <a class="admin-card" href="#!/admin/users" ng-if="vm.canCreateUsers()">
          <span class="badge">Users</span>
          <h3>User administration</h3>
          <p>Create user accounts. Super admins can also list users, edit profile data, toggle active state, delete users, and assign roles.</p>
          <span class="admin-card-link">Open user tools</span>
        </a>
        <a class="admin-card" href="#!/admin/roles" ng-if="vm.isSAdmin()">
          <span class="badge">Roles</span>
          <h3>Role administration</h3>
          <p>Manage backend roles and role assignment options available to super admins.</p>
          <span class="admin-card-link">Open role tools</span>
        </a>
      </div>
    </section>
  `;
})();
