(() => {
  window.BookKeepingPortal.templates.userAdmin = `
    <section class="panel admin-panel" ng-controller="UserAdminController as vm">
      <div class="panel-intro">
        <div>
          <span class="badge">Users</span>
          <h2>User management</h2>
          <p class="helper-text">Create users. Super admins can also browse users, edit profile fields, toggle status, delete users, and assign roles.</p>
        </div>
        <button class="secondary" type="button" ng-click="vm.loadUsers()" ng-disabled="vm.loadingUsers">
          {{ vm.loadingUsers ? 'Refreshing…' : 'Refresh users' }}
        </button>
      </div>

      <nav class="admin-tabs">
        <a href="#!/admin" class="admin-tab">Overview</a>
        <a href="#!/admin/budgets" class="admin-tab">Budgets</a>
        <a href="#!/admin/reimbursements" class="admin-tab">Reimbursements</a>
        <a href="#!/admin/users" class="admin-tab is-active">Users</a>
        <a href="#!/admin/roles" class="admin-tab" ng-if="vm.isSAdmin">Roles</a>
      </nav>

      <div class="admin-layout">
        <section class="sub-panel" ng-if="vm.isSAdmin">
          <h3>Users</h3>
          <div class="toolbar-row">
            <label>
              Search users
              <input
                type="search"
                ng-model="vm.filters.search"
                ng-change="vm.onSearchChange()"
                placeholder="Search name, email, username, role, status"
              />
            </label>
          </div>
          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Name</th>
                  <th>Email</th>
                  <th>Username</th>
                  <th>Role</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr ng-if="vm.loadingUsers">
                  <td colspan="6" class="empty-state">Loading users...</td>
                </tr>
                <tr ng-if="!vm.loadingUsers && !vm.users.length">
                  <td colspan="6" class="empty-state">No users found.</td>
                </tr>
                <tr ng-if="!vm.loadingUsers && vm.users.length && !vm.filteredUsers().length">
                  <td colspan="6" class="empty-state">No loaded users match this table search.</td>
                </tr>
                <tr ng-repeat="user in vm.filteredUsers() track by user.id">
                  <td>{{ user.name }}</td>
                  <td>{{ user.email }}</td>
                  <td>{{ user.username || 'n/a' }}</td>
                  <td>{{ user.roleName || 'n/a' }}</td>
                  <td>
                    <span class="status-pill" ng-class="{ active: user.isActive, inactive: !user.isActive }">
                      {{ user.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button type="button" class="secondary" ng-click="vm.selectUser(user.id)">Manage</button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
          <div class="pagination-row">
            <button type="button" class="secondary" ng-click="vm.changePage(-1)" ng-disabled="vm.filters.pageNumber === 0 || vm.loadingUsers">
              Previous
            </button>
            <span class="helper-text">Page {{ vm.filters.pageNumber + 1 }}</span>
            <button type="button" class="secondary" ng-click="vm.changePage(1)" ng-disabled="vm.loadingUsers || !vm.users.length">
              Next
            </button>
          </div>
        </section>

        <section class="sub-panel">
          <h3>Create user</h3>
          <p class="helper-text">
            Create a user account without replacing your current admin session.
            New accounts are created with the USER role by default.
          </p>
          <form ng-submit="vm.createUser()">
            <div class="form-grid admin-form-grid">
              <label>
                Name
                <input type="text" ng-model="vm.createForm.name" required />
                <span class="field-error" ng-if="vm.createFieldErrorsMap.name">{{ vm.createFieldErrorsMap.name }}</span>
              </label>
              <label>
                Email
                <input type="email" ng-model="vm.createForm.email" required />
                <span class="field-error" ng-if="vm.createFieldErrorsMap.email">{{ vm.createFieldErrorsMap.email }}</span>
              </label>
              <label>
                Username
                <input type="text" ng-model="vm.createForm.username" />
                <span class="field-error" ng-if="vm.createFieldErrorsMap.username">{{ vm.createFieldErrorsMap.username }}</span>
              </label>
              <label>
                Password
                <input type="password" ng-model="vm.createForm.password" required />
                <span class="field-error" ng-if="vm.createFieldErrorsMap.password">{{ vm.createFieldErrorsMap.password }}</span>
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" ng-disabled="vm.creatingUser">
                {{ vm.creatingUser ? 'Creating…' : 'Create user' }}
              </button>
            </div>
          </form>
        </section>

        <section class="sub-panel" ng-if="vm.selectedUser && vm.isSAdmin">
          <h3>Edit user</h3>
          <form ng-submit="vm.saveUser()">
            <div class="form-grid admin-form-grid">
              <label>
                Name
                <input type="text" ng-model="vm.userForm.name" required />
              </label>
              <label>
                Email
                <input type="email" ng-model="vm.userForm.email" required />
              </label>
              <label>
                Username
                <input type="text" ng-model="vm.userForm.username" required />
              </label>
              <label>
                Role
                <select ng-model="vm.userForm.roleName" ng-options="role.name.toUpperCase() as role.name for role in vm.roles" required></select>
              </label>
            </div>
            <div class="form-actions">
              <button type="submit" ng-disabled="vm.savingUser">Save profile</button>
              <button type="button" class="secondary" ng-click="vm.assignRole()" ng-disabled="vm.assigningRole || vm.loadingRoles">
                {{ vm.assigningRole ? 'Saving…' : 'Change role' }}
              </button>
              <button type="button" class="secondary" ng-click="vm.toggleStatus()" ng-disabled="vm.togglingStatus">
                {{ vm.togglingStatus ? 'Saving…' : (vm.selectedUser.isActive ? 'Deactivate' : 'Activate') }}
              </button>
              <button type="button" class="secondary" ng-click="vm.deleteUser()" ng-disabled="vm.deletingUser">
                {{ vm.deletingUser ? 'Deleting…' : 'Delete user' }}
              </button>
            </div>
          </form>
        </section>
      </div>

      <div class="alert-banner alert-banner-error" ng-if="vm.userError">{{ vm.userError }}</div>
    </section>
  `;
})();
