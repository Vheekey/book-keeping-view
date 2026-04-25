(() => {
  window.BookKeepingPortal.templates.login = `
    <section class="panel auth-panel" ng-controller="LoginController as vm">
      <div class="hero-copy">
        <span class="badge">Authentication</span>
        <h2>Account access</h2>
        <p class="helper-text">
          Login with your email or username, or register a new user account.
        </p>
      </div>

      <nav class="admin-tabs">
        <button type="button" class="admin-tab" ng-class="{ 'is-active': vm.mode === 'login' }" ng-click="vm.selectMode('login')">
          Login
        </button>
        <button type="button" class="admin-tab" ng-class="{ 'is-active': vm.mode === 'register' }" ng-click="vm.selectMode('register')">
          Register
        </button>
      </nav>

      <form ng-if="vm.mode === 'login'" ng-submit="vm.submitLogin()">
        <div class="form-grid">
          <label>
            Email or username
            <input type="text" ng-model="vm.loginForm.identifier" placeholder="you@example.com or vheey01" required />
          </label>
          <label>
            Password
            <input type="password" ng-model="vm.loginForm.password" required />
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" ng-disabled="vm.submitting">Login</button>
        </div>
      </form>

      <form ng-if="vm.mode === 'register'" ng-submit="vm.submitRegister()">
        <div class="form-grid">
          <label>
            Name
            <input type="text" ng-model="vm.registerForm.name" required />
            <span class="field-error" ng-if="vm.fieldErrorsMap.name">{{ vm.fieldErrorsMap.name }}</span>
          </label>
          <label>
            Email
            <input type="email" ng-model="vm.registerForm.email" required />
            <span class="field-error" ng-if="vm.fieldErrorsMap.email">{{ vm.fieldErrorsMap.email }}</span>
          </label>
          <label>
            Username
            <input type="text" ng-model="vm.registerForm.username" />
            <span class="field-error" ng-if="vm.fieldErrorsMap.username">{{ vm.fieldErrorsMap.username }}</span>
          </label>
          <label>
            Password
            <input type="password" ng-model="vm.registerForm.password" required />
            <span class="field-error" ng-if="vm.fieldErrorsMap.password">{{ vm.fieldErrorsMap.password }}</span>
          </label>
        </div>
        <div class="form-actions">
          <button type="submit" ng-disabled="vm.submitting">Register</button>
        </div>
      </form>

      <div class="alert-banner alert-banner-error" ng-if="vm.errorMessage">{{ vm.errorMessage }}</div>
      <div class="alert-banner alert-banner-neutral" ng-if="vm.notice">{{ vm.notice }}</div>
    </section>
  `;
})();
