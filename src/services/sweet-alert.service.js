(() => {
  window.BookKeepingPortal.module.service('SweetAlertService', [
    '$q',
    function ($q) {
      const fallbackApi = {
        fire(options) {
          const title = options?.title ? `${options.title}\n\n` : '';
          const text = options?.text || '';
          window.alert(`${title}${text}`.trim());
          return Promise.resolve({ isConfirmed: true });
        },
      };

      function getSwal() {
        return window.Swal || fallbackApi;
      }

      function toPromise(callback) {
        return $q.when(callback());
      }

      this.success = function (title, text) {
        return toPromise(() =>
          getSwal().fire({
            icon: 'success',
            title,
            text,
            confirmButtonText: 'OK',
          })
        );
      };

      this.error = function (title, text) {
        return toPromise(() =>
          getSwal().fire({
            icon: 'error',
            title,
            text,
            confirmButtonText: 'Close',
          })
        );
      };

      this.confirm = function (options) {
        return toPromise(() =>
          getSwal().fire({
            icon: options.icon || 'question',
            title: options.title,
            text: options.text,
            confirmButtonText: options.confirmButtonText || 'Continue',
            cancelButtonText: options.cancelButtonText || 'Cancel',
            showCancelButton: true,
            reverseButtons: true,
            focusCancel: true,
          })
        );
      };
    },
  ]);
})();
