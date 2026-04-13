(() => {
  window.BookKeepingPortal.module.controller('LoginController', [
    '$location',
    'AuthApiService',
    'AuthSessionService',
    'ApiErrorService',
    'FormErrorService',
    'SweetAlertService',
    function ($location, AuthApiService, AuthSessionService, ApiErrorService, FormErrorService, SweetAlertService) {
      const vm = this;

      function redirectForRole() {
        const role = AuthSessionService.getRoleName();
        if (['SADMIN', 'ADMIN', 'FINANCE'].includes(role)) {
          $location.path('/admin');
          return;
        }

        $location.path('/reimbursement');
      }

      vm.mode = 'login';
      vm.loginForm = {
        identifier: '',
        password: '',
      };
      vm.registerForm = {
        name: '',
        email: '',
        username: '',
        password: '',
      };
      vm.submitting = false;
      vm.notice = '';
      vm.errorMessage = '';
      vm.fieldErrorsMap = {};

      vm.selectMode = function (mode) {
        vm.mode = mode;
        vm.notice = '';
        vm.errorMessage = '';
        vm.fieldErrorsMap = {};
      };

      vm.submitLogin = function () {
        vm.submitting = true;
        vm.notice = '';
        vm.errorMessage = '';
        vm.fieldErrorsMap = {};

        const identifier = (vm.loginForm.identifier || '').trim();
        const credentials = {
          password: vm.loginForm.password,
        };

        if (identifier.includes('@')) {
          credentials.email = identifier;
        } else {
          credentials.username = identifier;
        }

        return AuthApiService.login(credentials)
          .then((response) => {
            AuthSessionService.setSession(response);
            vm.notice = `Signed in as ${response.user?.roleName || 'USER'}.`;
            return SweetAlertService.success('Login successful', vm.notice);
          })
          .then(() => redirectForRole())
          .catch((error) => {
            const parsed = ApiErrorService.parse(error, 'Failed to login');
            vm.errorMessage = parsed.message;
            vm.fieldErrorsMap = FormErrorService.toFieldMap(parsed.fieldErrors);
            return SweetAlertService.error('Login failed', vm.errorMessage || 'Check your credentials and try again.');
          })
          .finally(() => {
            vm.submitting = false;
          });
      };

      vm.submitRegister = function () {
        vm.submitting = true;
        vm.notice = '';
        vm.errorMessage = '';
        vm.fieldErrorsMap = {};

        return AuthApiService.register({
          ...vm.registerForm,
          username: (vm.registerForm.username || '').trim() || null,
        })
          .then((response) => {
            AuthSessionService.setSession(response);
            vm.notice = 'Registration complete. Your account is signed in.';
            return SweetAlertService.success('Registration successful', vm.notice);
          })
          .then(() => redirectForRole())
          .catch((error) => {
            const parsed = ApiErrorService.parse(error, 'Failed to register');
            vm.errorMessage = parsed.message;
            vm.fieldErrorsMap = FormErrorService.toFieldMap(parsed.fieldErrors);
            if (!parsed.fieldErrors.length) {
              return SweetAlertService.error('Registration failed', vm.errorMessage);
            }
          })
          .finally(() => {
            vm.submitting = false;
          });
      };
    },
  ]);
})();
