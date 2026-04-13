(() => {
  window.BookKeepingPortal.templates.roleAdmin = `
    <section class="panel admin-panel" ng-controller="RoleAdminController as vm">
      <div class="panel-intro">
        <div>
          <span class="badge">SADMIN</span>
          <h2>Role management</h2>
          <p class="helper-text">List backend roles, create new roles, rename them, and delete them.</p>
        </div>
        <button class="secondary" type="button" ng-click="vm.loadRoles()" ng-disabled="vm.loadingRoles">
          {{ vm.loadingRoles ? 'Refreshing…' : 'Refresh roles' }}
        </button>
      </div>

      <nav class="admin-tabs">
        <a href="#!/admin" class="admin-tab">Overview</a>
        <a href="#!/admin/budgets" class="admin-tab">Budgets</a>
        <a href="#!/admin/reimbursements" class="admin-tab">Reimbursements</a>
        <a href="#!/admin/users" class="admin-tab">Users</a>
        <a href="#!/admin/roles" class="admin-tab is-active">Roles</a>
      </nav>

      <div class="admin-layout">
        <section class="sub-panel">
          <h3>Create role</h3>
          <form class="inline-form" ng-submit="vm.createRole()">
            <label>
              Role name
              <input type="text" ng-model="vm.createForm.name" required />
            </label>
            <div class="form-actions">
              <button type="submit" ng-disabled="vm.savingRole">Create role</button>
            </div>
          </form>

          <div class="table-wrap top-gap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr ng-if="vm.loadingRoles">
                  <td colspan="2" class="empty-state">Loading roles...</td>
                </tr>
                <tr ng-if="!vm.loadingRoles && !vm.roles.length">
                  <td colspan="2" class="empty-state">No roles found.</td>
                </tr>
                <tr ng-repeat="role in vm.roles track by role.id">
                  <td>{{ role.name }}</td>
                  <td class="table-actions">
                    <button type="button" class="secondary" ng-click="vm.selectRole(role.id)">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>

        <section class="sub-panel" ng-if="vm.selectedRole">
          <h3>Edit role</h3>
          <form ng-submit="vm.updateRole()">
            <div class="form-grid admin-form-grid">
              <label>
                Role name
                <input type="text" ng-model="vm.roleForm.name" required />
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" ng-disabled="vm.savingRole">Save role</button>
              <button type="button" class="secondary" ng-click="vm.deleteRole()" ng-disabled="vm.deletingRole">
                {{ vm.deletingRole ? 'Deleting…' : 'Delete role' }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div class="alert-banner alert-banner-error" ng-if="vm.roleError">{{ vm.roleError }}</div>
    </section>
  `;
})();
