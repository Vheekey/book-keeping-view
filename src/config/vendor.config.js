(() => {
  if (window.pdfjsLib?.GlobalWorkerOptions) {
    window.pdfjsLib.GlobalWorkerOptions.workerSrc =
      window.__PDF_WORKER_SRC__ || '/vendor/pdf.worker.min.js';
  }
})();
