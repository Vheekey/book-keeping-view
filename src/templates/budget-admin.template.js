(() => {
  window.BookKeepingPortal.templates.budgetAdmin = `
    <section class="panel admin-panel" ng-controller="BudgetAdminController as vm">
      <div class="panel-intro">
        <div>
          <span class="badge">Admin</span>
          <h2>Budget categories</h2>
          <p class="helper-text">
            Manage available budget categories and their active state.
          </p>
        </div>
        <button class="secondary" type="button" ng-click="vm.loadCategories()" ng-disabled="vm.loadingCategories">
          {{ vm.loadingCategories ? 'Refreshing…' : 'Refresh categories' }}
        </button>
      </div>

      <nav class="admin-tabs">
        <a href="#!/admin" class="admin-tab">Overview</a>
        <a href="#!/admin/budgets" class="admin-tab is-active">Budgets</a>
        <a href="#!/admin/reimbursements" class="admin-tab">Reimbursements</a>
        <a href="#!/admin/users" class="admin-tab" ng-if="vm.canCreateUsers">Users</a>
        <a href="#!/admin/roles" class="admin-tab" ng-if="vm.isSAdmin">Roles</a>
      </nav>

      <div class="admin-layout admin-layout-single">
        <section class="sub-panel">
          <h3>Budget categories</h3>
          <p class="helper-text">GET all categories, create new ones, and toggle active status.</p>

          <div class="admin-workbench">
            <form class="inline-form" ng-submit="vm.createCategory()" ng-if="vm.canManage">
              <label>
                Account number
                <input type="text" ng-model="vm.categoryForm.accNo" placeholder="7001" required />
              </label>
              <label>
                Description
                <input type="text" ng-model="vm.categoryForm.description" placeholder="Office supplies" required />
              </label>
              <div class="form-actions">
                <button type="submit" ng-disabled="vm.creatingCategory">Create category</button>
              </div>
            </form>
            <p class="helper-text" ng-if="!vm.canManage">Your current role can view categories but cannot change them in this UI.</p>
          </div>

          <div class="alert-banner alert-banner-error" ng-if="vm.categoryError">{{ vm.categoryError }}</div>

          <div class="table-wrap">
            <table class="data-table">
              <thead>
                <tr>
                  <th>Acc No</th>
                  <th>Description</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr ng-if="vm.loadingCategories">
                  <td colspan="4" class="empty-state">Loading categories...</td>
                </tr>
                <tr ng-if="!vm.loadingCategories && !vm.categories.length">
                  <td colspan="4" class="empty-state">No categories found.</td>
                </tr>
                <tr ng-repeat="category in vm.categories track by category.accNo">
                  <td>{{ category.accNo }}</td>
                  <td>{{ category.description }}</td>
                  <td>
                    <span class="status-pill" ng-class="{ active: category.isActive, inactive: !category.isActive }">
                      {{ category.isActive ? 'Active' : 'Inactive' }}
                    </span>
                  </td>
                  <td class="table-actions">
                    <button
                      type="button"
                      class="secondary"
                      ng-click="vm.toggleCategory(category)"
                      ng-disabled="vm.statusPending[category.accNo] || !vm.canManage"
                    >
                      {{ !vm.canManage ? 'View only' : (vm.statusPending[category.accNo] ? 'Saving…' : (category.isActive ? 'Deactivate' : 'Activate')) }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>
        </section>
      </div>
    </section>
  `;
})();
