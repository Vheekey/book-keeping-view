(() => {
  window.BookKeepingPortal.module.factory('OcrService', [
    '$q',
    function ($q) {
      function ensurePdfWorker() {
        if (window.pdfjsLib?.GlobalWorkerOptions && !window.pdfjsLib.GlobalWorkerOptions.workerSrc) {
          window.pdfjsLib.GlobalWorkerOptions.workerSrc =
            window.__PDF_WORKER_SRC__ || '/vendor/pdf.worker.min.js';
        }
      }

      function readFile(file, mode) {
        const deferred = $q.defer();
        const reader = new FileReader();

        reader.onload = () => deferred.resolve(reader.result);
        reader.onerror = () => deferred.reject(new Error(`Failed to read the ${mode} file.`));

        if (mode === 'pdf') {
          reader.readAsArrayBuffer(file);
        } else {
          reader.readAsDataURL(file);
        }

        return deferred.promise;
      }

      function runImageRecognition(imageSource, onProgress) {
        return $q((resolve, reject) => {
          Tesseract.recognize(imageSource, 'eng', {
            logger(message) {
              if (message.status === 'recognizing text') {
                onProgress(Math.round(message.progress * 100));
              }
            },
          })
            .then((result) => resolve(result?.data?.text || ''))
            .catch(() => reject(new Error('Failed to read the uploaded form.')));
        });
      }

      function renderPdfFirstPage(fileData) {
        if (!window.pdfjsLib) {
          return $q.reject(new Error('PDF reader failed to load. Please refresh and try again.'));
        }

        ensurePdfWorker();

        return $q((resolve, reject) => {
          const loadingTask = window.pdfjsLib.getDocument({ data: fileData });

          loadingTask.promise
            .then((pdf) => pdf.getPage(1))
            .then((page) => {
              const viewport = page.getViewport({ scale: 2 });
              const canvas = document.createElement('canvas');
              const context = canvas.getContext('2d');
              canvas.height = viewport.height;
              canvas.width = viewport.width;

              return page.render({ canvasContext: context, viewport }).promise.then(() => canvas);
            })
            .then(resolve)
            .catch(() => reject(new Error('Failed to read the PDF file.')));
        });
      }

      function extractText(file, onProgress) {
        const isPdf = file?.type === 'application/pdf';
        const isImage = file?.type?.startsWith('image/');

        if (!isPdf && !isImage) {
          return $q.reject(new Error('Please upload a PDF or image file.'));
        }

        if (isImage) {
          return readFile(file, 'image').then((imageSource) => runImageRecognition(imageSource, onProgress));
        }

        return readFile(file, 'pdf')
          .then((fileData) => renderPdfFirstPage(fileData))
          .then((canvas) => runImageRecognition(canvas, onProgress));
      }

      function parseFields(text) {
        const cleaned = (text || '').replace(/\r/g, '').replace(/[ \t]+/g, ' ').trim();

        function pick(regex) {
          const match = cleaned.match(regex);
          return match ? match[1].trim() : '';
        }

        function normalizeDate(value) {
          if (!value) return '';
          if (/^\d{4}-\d{2}-\d{2}$/.test(value)) return value;

          const slash = value.match(/^(\d{1,2})[\/\-.](\d{1,2})[\/\-.](\d{2,4})$/);
          if (!slash) return '';

          const day = slash[1].padStart(2, '0');
          const month = slash[2].padStart(2, '0');
          const year = slash[3].length === 2 ? `20${slash[3]}` : slash[3];

          return `${year}-${month}-${day}`;
        }

        const dateRaw = pick(/Date of Expenditure[:\s]*([0-9\/\-.]+)/i);
        const amountMatch = pick(/Amount[:\s]*([0-9,]+(?:\.\d{2})?)/i);
        const reimburseMatch = pick(/To be reimbursed[:\s]*.*?\b(Yes|No)\b/i);
        const clearingMatch = pick(/Clearing\s*Number[:\s]*([0-9]{4})/i);
        const accountNumberMatch = pick(/Account\s*Number[:\s]*([0-9]{10,20})/i);
        const accountNameMatch = pick(/Account\s*Holder'?s?\s*Name[:\s]*([A-Za-z .'-]+)/i);
        const nameMatch = pick(/\bName[:\s]*([A-Za-z .'-]+)/i);
        const phoneMatch = pick(/Phone\s*Number[:\s]*([+\d][\d\s-]{9,15})/i);
        const expenseDescMatch = pick(
          /Expense\s*Description[^:\n]*[:\s]*([\s\S]*?)(?:\n|I hereby|Please send|Name|Signature|$)/i
        );

        const parsed = {};
        const normalizedDate = normalizeDate(dateRaw);

        if (normalizedDate) parsed.expenditureDate = normalizedDate;
        if (amountMatch) parsed.amount = Number(amountMatch.replace(/,/g, ''));
        if (reimburseMatch) parsed.shouldReimburse = reimburseMatch.toLowerCase() === 'yes' ? 'true' : 'false';
        if (clearingMatch) parsed.clearingNumber = clearingMatch;
        if (accountNumberMatch) parsed.accountNumber = accountNumberMatch;
        if (accountNameMatch) parsed.accountName = accountNameMatch;
        if (nameMatch) parsed.name = nameMatch;
        if (phoneMatch) parsed.phoneNumber = phoneMatch.replace(/\s+/g, '');

        if (expenseDescMatch) {
          const description = expenseDescMatch.replace(/\s+/g, ' ').trim();
          if (description.length > 2 && !/^o$/i.test(description)) {
            parsed.description = description;
          }
        }

        return parsed;
      }

      return {
        extractText,
        parseFields,
      };
    },
  ]);
})();
