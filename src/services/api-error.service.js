(() => {
  window.BookKeepingPortal.module.factory('ApiErrorService', [
    function () {
      function isGenericHttpMessage(message) {
        return [
          'bad request',
          'unauthorized',
          'forbidden',
          'not found',
          'unprocessable entity',
          'internal server error',
        ].includes(String(message || '').trim().toLowerCase());
      }

      function parse(error, fallbackMessage) {
        const response = error?.data || {};
        let message = '';
        const fieldErrors = Array.isArray(response.fieldErrors) ? response.fieldErrors : [];

        if (typeof response === 'string') {
          message = response;
        } else {
          message = response.message || response.error || '';
        }

        if (fieldErrors.length && isGenericHttpMessage(message)) {
          message = '';
        }

        if (!message) {
          message = fieldErrors.length ? '' : `${fallbackMessage}.`;
        }

        return {
          message,
          fieldErrors,
        };
      }

      return { parse };
    },
  ]);
})();
