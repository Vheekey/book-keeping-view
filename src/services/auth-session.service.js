(() => {
  const app = window.BookKeepingPortal.module;
  const STORAGE_KEY = 'bookKeepingPortal.auth';

  function normalizeRoleName(user) {
    return String(user?.roleName || '').toUpperCase();
  }

  app.service('AuthSessionService', [
    '$window',
    function ($window) {
      let session = null;

      function persist() {
        if (!session) {
          $window.localStorage.removeItem(STORAGE_KEY);
          return;
        }

        $window.localStorage.setItem(STORAGE_KEY, JSON.stringify(session));
      }

      function load() {
        if (session) return session;

        try {
          const raw = $window.localStorage.getItem(STORAGE_KEY);
          session = raw ? JSON.parse(raw) : null;
        } catch (_error) {
          session = null;
        }

        return session;
      }

      this.getSession = function () {
        return load();
      };

      this.getToken = function () {
        return load()?.token || '';
      };

      this.getUser = function () {
        return load()?.user || null;
      };

      this.isAuthenticated = function () {
        return Boolean(this.getToken() && this.getUser());
      };

      this.getRoleName = function () {
        return normalizeRoleName(this.getUser());
      };

      this.hasRole = function (roleName) {
        return this.getRoleName() === String(roleName || '').toUpperCase();
      };

      this.hasAnyRole = function (roleNames) {
        if (!Array.isArray(roleNames) || !roleNames.length) {
          return this.isAuthenticated();
        }

        const currentRole = this.getRoleName();
        return roleNames.some((roleName) => currentRole === String(roleName || '').toUpperCase());
      };

      this.setSession = function (authResponse) {
        session = {
          token: authResponse?.token || '',
          user: authResponse?.user || null,
        };
        persist();
        return session;
      };

      this.clear = function () {
        session = null;
        persist();
      };
    },
  ]);
})();
