(() => {
  window.BookKeepingPortal.templates.reimbursement = `
    <section class="panel" ng-controller="ReimbursementController as vm">
      <h2>Create reimbursement</h2>
      <p class="helper-text">
        Create reimbursement requests.
      </p>

      <form ng-submit="vm.submit()">
        <div class="entry-choice-panel">
          <div class="entry-choice-header">
            <h3>Start from a file or fill manually</h3>
            <p class="helper-text">Uploaded files still populate the same form below for review before submission.</p>
          </div>

          <div class="entry-choice-grid">
            <button
              type="button"
              class="entry-choice"
              ng-class="{ 'is-active': vm.entryMode === 'upload' }"
              ng-click="vm.selectEntryMode('upload')"
            >
              <span class="entry-choice-label">Upload form</span>
              <span class="helper-text">Import a PDF or image and prefill the fields.</span>
            </button>

            <div class="entry-choice-divider" aria-hidden="true">OR</div>

            <button
              type="button"
              class="entry-choice"
              ng-class="{ 'is-active': vm.entryMode === 'manual' }"
              ng-click="vm.selectEntryMode('manual')"
            >
              <span class="entry-choice-label">Fill manually</span>
              <span class="helper-text">Enter the reimbursement details yourself.</span>
            </button>
          </div>
        </div>

        <div class="upload-panel" ng-if="vm.entryMode === 'upload'">
          <label>
            Upload reimbursement form (PDF or image)
            <input
              type="file"
              accept="application/pdf,image/*"
              file-change="vm.onFileChange($files)"
            />
          </label>
          <button type="button" class="secondary" ng-click="vm.runOcr()" ng-disabled="!vm.selectedFile || vm.ocrRunning">
            {{ vm.ocrRunning ? 'Reading…' : 'Process' }}
          </button>
          <div class="alert-banner alert-banner-neutral" ng-if="vm.ocrStatus">{{ vm.ocrStatus }}</div>
          <div class="alert-banner alert-banner-error" ng-if="vm.ocrError">{{ vm.ocrError }}</div>
        </div>

        <div class="form-entry-divider">
          <span>{{ vm.entryMode === 'upload' ? 'Review and complete the form' : 'Reimbursement form' }}</span>
        </div>

        <div class="form-grid">
          <label>
            Expenditure date
            <input type="date" ng-model="vm.form.expenditureDate" required />
            <span class="field-error" ng-if="vm.fieldErrorsMap.expenditureDate">
              {{ vm.fieldErrorsMap.expenditureDate }}
            </span>
          </label>
          <label>
            Your name
            <input type="text" ng-model="vm.form.name" required />
            <span class="field-error" ng-if="vm.fieldErrorsMap.name">{{ vm.fieldErrorsMap.name }}</span>
          </label>
          <label>
            Budget category (accNo)
            <select ng-model="vm.form.accNo" ng-options="c.accNo as vm.categoryLabel(c) for c in vm.categories" required>
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
            <input type="number" ng-model="vm.form.clearingNumber" required />
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

      <div class="alert-banner alert-banner-error" ng-if="vm.errorMessage">{{ vm.errorMessage }}</div>
    </section>
  `;
})();
