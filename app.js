(() => {
  const { ajax } = rxjs.ajax;
  const { catchError, map } = rxjs.operators;
  const { of } = rxjs;

  const API_BASE = window.__ENV__?.API_BASE || 'http://localhost:9095/api/v1/book-keeping';

  const app = angular.module('bookKeepingPortal', ['ngRoute']);

  app.config([
    '$routeProvider',
    function ($routeProvider) {
      $routeProvider
        .when('/reimbursement', {
          template: `
            <section class="panel" ng-controller="ReimbursementController as vm">
              <h2>Create reimbursement</h2>
              <p class="helper-text">
                Create Reimbursement requests
              </p>

              <form ng-submit="vm.submit()">
              <div class="form-grid">
                <label>
                  Expenditure date
                  <input type="date" ng-model="vm.form.expenditureDate" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.expenditureDate">
                    {{ vm.fieldErrorsMap.expenditureDate }}
                  </span>
                </label>
                <label>
                  Your Name
                  <input type="text" ng-model="vm.form.name" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.name">{{ vm.fieldErrorsMap.name }}</span>
                </label>
                <label>
                  Budget category (accNo)
                  <select ng-model="vm.form.accNo" ng-options="c.accNo as c.description for c in vm.categories" required>
                    <option value="">Select category</option>
                  </select>
                  <span class="field-error" ng-if="vm.fieldErrorsMap.accNo">{{ vm.fieldErrorsMap.accNo }}</span>
                </label>
                <label>
                  Amount
                  <input type="number" min="0.01" step="0.01" ng-model="vm.form.amount" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.amount">{{ vm.fieldErrorsMap.amount }}</span>
                </label>
                <label>
                  Should reimburse?
                  <select ng-model="vm.form.shouldReimburse" required>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <span class="field-error" ng-if="vm.fieldErrorsMap.shouldReimburse">
                    {{ vm.fieldErrorsMap.shouldReimburse }}
                  </span>
                </label>
                <label>
                  Account name
                  <input type="text" ng-model="vm.form.accountName" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.accountName">
                    {{ vm.fieldErrorsMap.accountName }}
                  </span>
                </label>
                <label>
                  Clearing number (4 digits)
                  <input type="number" ng-model="vm.form.clearingNumber" maxlength="4" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.clearingNumber">
                    {{ vm.fieldErrorsMap.clearingNumber }}
                  </span>
                </label>
                <label>
                  Account number
                  <input type="text" ng-model="vm.form.accountNumber" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.accountNumber">
                    {{ vm.fieldErrorsMap.accountNumber }}
                  </span>
                </label>
                <label>
                  Phone number
                  <input type="tel" ng-model="vm.form.phoneNumber" placeholder="+46732222222" required />
                  <span class="field-error" ng-if="vm.fieldErrorsMap.phoneNumber">
                    {{ vm.fieldErrorsMap.phoneNumber }}
                  </span>
                </label>
                <label>
                  Description
                  <textarea ng-model="vm.form.description" required></textarea>
                  <span class="field-error" ng-if="vm.fieldErrorsMap.description">
                    {{ vm.fieldErrorsMap.description }}
                  </span>
                </label>
                <label>
                  Confirm details are correct
                  <select ng-model="vm.form.isCorrect" required>
                    <option value="true">Yes</option>
                    <option value="false">No</option>
                  </select>
                  <span class="field-error" ng-if="vm.fieldErrorsMap.isCorrect">
                    {{ vm.fieldErrorsMap.isCorrect }}
                  </span>
                </label>
              </div>

                <div class="form-actions">
                  <button type="submit" ng-disabled="vm.submitting">Submit reimbursement</button>
                  <span class="helper-text" ng-if="vm.loadingCategories">Loading categories...</span>
                </div>
              </form>

              <p class="status success" ng-if="vm.successMessage">{{ vm.successMessage }}</p>
            </section>
          `,
          controller: 'ReimbursementController',
          controllerAs: 'vm',
        })
        .when('/login', {
          template: `
            <section class="panel" ng-controller="LoginController as vm">
              <span class="badge">Users & admins</span>
              <h2>Login</h2>
              <p class="helper-text">
              Login to access dashboard
              </p>
              <form ng-submit="vm.submit()">
                <div class="form-grid">
                  <label>
                    Role
                    <select ng-model="vm.form.role" required>
                      <option value="user">User</option>
                      <option value="admin">Admin</option>
                    </select>
                  </label>
                  <label>
                    Email
                    <input type="email" ng-model="vm.form.email" required />
                  </label>
                  <label>
                    Password
                    <input type="password" ng-model="vm.form.password" required />
                  </label>
                </div>
                <div class="form-actions">
                  <button type="submit">Login</button>
                </div>
              </form>
              <p class="status" ng-if="vm.notice">{{ vm.notice }}</p>
            </section>
          `,
          controller: 'LoginController',
          controllerAs: 'vm',
        })
        .otherwise({ redirectTo: '/reimbursement' });
    },
  ]);

  app.service('BudgetCategoryService', [
    '$q',
    function ($q) {
      this.fetchActiveCategories = function () {
        const deferred = $q.defer();

        ajax({
          url: `${API_BASE}/budget/categories/active`,
          method: 'GET',
          headers: { 'Content-Type': 'application/json' },
        })
          .pipe(
            map((response) => response.response?.categories || []),
            map((categories) =>
              categories.map((category) => ({
                accNo: category.accNo,
                description: category.description,
                isActive: category.isActive,
              }))
            ),
            catchError((error) => {
              deferred.reject(error);
              return of([]);
            })
          )
          .subscribe({
            next: (categories) => deferred.resolve(categories),
            error: (error) => deferred.reject(error),
          });

        return deferred.promise;
      };
    },
  ]);

  app.controller('ReimbursementController', [
    '$http',
    'BudgetCategoryService',
    function ($http, BudgetCategoryService) {
      const vm = this;
      vm.form = {
        expenditureDate: '',
        name: '',
        description: '',
        amount: null,
        shouldReimburse: 'true',
        accountName: '',
        clearingNumber: '',
        accountNumber: '',
        accNo: '',
        phoneNumber: '',
        isCorrect: 'true',
      };
      vm.categories = [];
      vm.loadingCategories = true;
      vm.submitting = false;
      vm.successMessage = '';
      vm.errorMessage = '';
      vm.fieldErrors = [];
      vm.fieldErrorsMap = {};

      BudgetCategoryService.fetchActiveCategories()
        .then((categories) => {
          vm.categories = categories;
        })
        .catch(() => {
          vm.errorMessage = 'Failed to load budget categories.';
        })
        .finally(() => {
          vm.loadingCategories = false;
        });

      vm.submit = function () {
        vm.submitting = true;
        vm.successMessage = '';
        vm.errorMessage = '';

        const payload = {
          expenditureDate: vm.form.expenditureDate,
          name: vm.form.name,
          description: vm.form.description,
          amount: vm.form.amount,
          shouldReimburse: vm.form.shouldReimburse === 'true',
          accountName: vm.form.accountName,
          clearingNumber: vm.form.clearingNumber,
          accountNumber: vm.form.accountNumber,
          accNo: vm.form.accNo,
          phoneNumber: vm.form.phoneNumber,
          isCorrect: vm.form.isCorrect === 'true',
        };

        $http
          .post(`${API_BASE}/reimbursement/create`, payload)
          .then(() => {
            vm.successMessage = 'Reimbursement submitted successfully.';
            vm.form.amount = null;
            vm.form.description = '';
          })
          .catch((error) => {
            const response = error?.data || {};
            vm.errorMessage = response.message || response.error || 'Failed to submit reimbursement.';
            vm.fieldErrors = Array.isArray(response.fieldErrors) ? response.fieldErrors : [];
            vm.fieldErrorsMap = vm.fieldErrors.reduce((acc, item) => {
              if (item?.field && item?.message) {
                acc[item.field] = item.message;
              }
              return acc;
            }, {});
          })
          .finally(() => {
            vm.submitting = false;
          });
      };
    },
  ]);

  app.controller('LoginController', [
    function () {
      const vm = this;
      vm.form = {
        role: 'user',
        email: '',
        password: '',
      };
      vm.notice = '';

      vm.submit = function () {
        vm.notice = `Login for ${vm.form.role} is not wired yet.`;
      };
    },
  ]);
})();
