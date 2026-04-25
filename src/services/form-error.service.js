(() => {
  window.BookKeepingPortal.module.factory('FormErrorService', [
    function () {
      function toFieldMap(fieldErrors) {
        return (fieldErrors || []).reduce((accumulator, item) => {
          if (item?.field && item?.message) {
            accumulator[item.field] = item.message;
          }

          return accumulator;
        }, {});
      }

      return { toFieldMap };
    },
  ]);
})();
