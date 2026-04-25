(() => {
  window.BookKeepingPortal.templates.reimbursementAdmin = `
    <section class="panel admin-panel" ng-controller="ReimbursementAdminController as vm">
      <div class="panel-intro">
        <div>
          <span class="badge">Admin</span>
          <h2>Reimbursements</h2>
          <p class="helper-text">
            Browse, filter, inspect, approve, reject, and pay reimbursements.
          </p>
        </div>
        <button class="secondary" type="button" ng-click="vm.loadReimbursements()" ng-disabled="vm.loadingReimbursements">
          {{ vm.loadingReimbursements ? 'Refreshing…' : 'Refresh reimbursements' }}
        </button>
      </div>

      <nav class="admin-tabs">
        <a href="#!/admin" class="admin-tab">Overview</a>
        <a href="#!/admin/budgets" class="admin-tab" ng-if="vm.canAccessBudgets">Budgets</a>
        <a href="#!/admin/reimbursements" class="admin-tab is-active">Reimbursements</a>
        <a href="#!/admin/users" class="admin-tab" ng-if="vm.canCreateUsers">Users</a>
        <a href="#!/admin/roles" class="admin-tab" ng-if="vm.isSAdmin">Roles</a>
      </nav>

      <div class="admin-layout admin-layout-single">
        <section class="sub-panel">
          <h3>Reimbursement processing</h3>
          <p class="helper-text">
            Browse reimbursements, filter by status, review a selected item, and run approve/reject or payout actions.
          </p>

          <div class="filters-header">
            <button
              type="button"
              class="secondary filters-toggle"
              ng-click="vm.filtersExpanded = !vm.filtersExpanded"
              ng-attr-aria-expanded="{{ vm.filtersExpanded }}"
            >
              {{ vm.filtersExpanded ? 'Hide filters' : 'Show filters' }}
            </button>
            <div class="active-filters">
              <span class="filter-chip" ng-if="vm.filters.status !== 'all'">Status: {{ vm.filters.status }}</span>
              <span class="filter-chip" ng-if="vm.filters.startDate">From: {{ vm.filters.startDate }}</span>
              <span class="filter-chip" ng-if="vm.filters.endDate">To: {{ vm.filters.endDate }}</span>
              <span class="filter-chip" ng-if="vm.searchTerm">Search: {{ vm.searchTerm }}</span>
            </div>
          </div>

          <div class="admin-workbench filters-workbench" ng-if="vm.filtersExpanded">
            <div class="toolbar-row">
              <label>
                From date
                <input type="date" ng-model="vm.filters.startDate" ng-change="vm.applyFilters()" />
              </label>
              <label>
                To date
                <input type="date" ng-model="vm.filters.endDate" ng-change="vm.applyFilters()" />
              </label>
              <label>
                Status
                <select ng-model="vm.filters.status" ng-change="vm.applyFilters()">
                  <option value="all">All</option>
                  <option value="pending">Pending</option>
                  <option value="approved">Approved</option>
                  <option value="rejected">Rejected</option>
                  <option value="paid">Paid</option>
                </select>
              </label>
              <label>
                Page size
                <select ng-model="vm.filters.pageSize" ng-change="vm.applyFilters()">
                  <option ng-value="5">5</option>
                  <option ng-value="10">10</option>
                  <option ng-value="20">20</option>
                </select>
              </label>
              <label>
                Search results
                <input
                  type="search"
                  ng-model="vm.searchTerm"
                  placeholder="Search name, amount, status, description"
                />
              </label>
              <div class="form-actions compact-actions">
                <button type="button" class="secondary" ng-click="vm.loadReimbursements()" ng-disabled="vm.loadingReimbursements">
                  {{ vm.loadingReimbursements ? 'Loading…' : 'Refresh reimbursements' }}
                </button>
              </div>
            </div>
          </div>

          <div class="table-wrap">
            <table class="data-table reimbursements-table">
              <thead>
                <tr>
                  <th>Date</th>
                  <th>Name</th>
                  <th>Amount</th>
                  <th>Status</th>
                  <th>Receipt</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                <tr ng-if="vm.loadingReimbursements">
                  <td colspan="6" class="empty-state">Loading reimbursements...</td>
                </tr>
                <tr ng-if="!vm.loadingReimbursements && !vm.reimbursements.length">
                  <td colspan="6" class="empty-state">No reimbursements found for this filter.</td>
                </tr>
                <tr ng-if="!vm.loadingReimbursements && vm.reimbursements.length && !vm.filteredReimbursements().length">
                  <td colspan="6" class="empty-state">No loaded reimbursements match this search.</td>
                </tr>
                <tr
                  ng-repeat="reimbursement in vm.filteredReimbursements() track by reimbursement.id"
                  ng-class="{ 'is-selected-row': vm.selectedReimbursement && vm.selectedReimbursement.id === reimbursement.id }"
                >
                  <td>{{ vm.formatDate(reimbursement.expenditureDate || reimbursement.createdAt) }}</td>
                  <td>{{ reimbursement.name }}</td>
                  <td>{{ vm.formatAmount(reimbursement.amount) }}</td>
                  <td>
                    <span class="status-pill" ng-class="vm.reimbursementStatusClass(reimbursement.status)">
                      {{ reimbursement.status }}
                    </span>
                  </td>
                  <td>
                    <span class="status-pill active" ng-if="vm.hasReceipt(reimbursement)">
                      {{ vm.receiptCountLabel(reimbursement) }}
                    </span>
                    <span class="helper-text" ng-if="!vm.hasReceipt(reimbursement)">None</span>
                  </td>
                  <td class="table-actions">
                    <button type="button" class="secondary" ng-click="vm.selectReimbursement(reimbursement.id)">
                      {{ vm.selectedReimbursement && vm.selectedReimbursement.id === reimbursement.id ? 'Reviewing' : 'Review' }}
                    </button>
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          <div class="pagination-row">
            <button type="button" class="secondary" ng-click="vm.changePage(-1)" ng-disabled="vm.filters.pageNumber === 0 || vm.loadingReimbursements">
              Previous
            </button>
            <span class="helper-text">Page {{ vm.filters.pageNumber + 1 }}</span>
            <button type="button" class="secondary" ng-click="vm.changePage(1)" ng-disabled="!vm.canGoNextPage() || vm.loadingReimbursements">
              Next
            </button>
          </div>

          <div class="review-focus-banner" ng-if="vm.selectedReimbursement">
            Reviewing reimbursement for <strong>{{ vm.selectedReimbursement.name }}</strong>.
          </div>

          <div class="alert-banner alert-banner-neutral" ng-if="vm.selectedReimbursement && !vm.canProcess">
            Your role can review reimbursements here, but only FINANCE can approve, reject, or mark payouts.
          </div>

          <div class="admin-workbench review-workbench" id="review-workbench" ng-if="vm.selectedReimbursement && vm.canProcess">
            <div class="workbench-header">
              <div>
                <span class="badge">Review</span>
                <h4>Process selected reimbursement</h4>
              </div>
            </div>
            <form ng-submit="vm.processDecision()">
              <div class="form-grid admin-form-grid">
                <label>
                  Decision
                  <select ng-model="vm.reimbursementForm.isApproved" required>
                    <option ng-value="true">Approve</option>
                    <option ng-value="false">Reject</option>
                  </select>
                </label>
                <label class="full-width">
                  Admin comment
                  <textarea ng-model="vm.reimbursementForm.comment" placeholder="Optional review note"></textarea>
                </label>
              </div>
              <div class="form-actions">
                <button type="submit" ng-disabled="vm.processingDecision">Submit decision</button>
              </div>
            </form>

            <form ng-submit="vm.processPayout()" class="top-gap">
              <div class="form-actions">
                <button type="submit" ng-disabled="vm.processingPayout">Mark payout</button>
              </div>
            </form>
          </div>

          <div class="alert-banner alert-banner-error" ng-if="vm.reimbursementError">{{ vm.reimbursementError }}</div>

          <div class="response-card response-card-strong" ng-if="vm.selectedReimbursement">
            <h4>Selected reimbursement</h4>
            <dl class="response-grid">
              <div>
                <dt>Status</dt>
                <dd>{{ vm.selectedReimbursement.status || 'n/a' }}</dd>
              </div>
              <div>
                <dt>Name</dt>
                <dd>{{ vm.selectedReimbursement.name || 'n/a' }}</dd>
              </div>
              <div>
                <dt>Amount</dt>
                <dd>{{ vm.formatAmount(vm.selectedReimbursement.amount) }}</dd>
              </div>
              <div>
                <dt>Budget category</dt>
                <dd>{{ vm.selectedReimbursement.accNo || 'n/a' }}</dd>
              </div>
              <div>
                <dt>Expenditure date</dt>
                <dd>{{ vm.formatDate(vm.selectedReimbursement.expenditureDate) }}</dd>
              </div>
              <div>
                <dt>Should reimburse</dt>
                <dd>{{ vm.reimbursementBooleanLabel(vm.selectedReimbursement, ['shouldReimburse']) }}</dd>
              </div>
              <div>
                <dt>Account name</dt>
                <dd>{{ vm.reimbursementField(vm.selectedReimbursement, ['accountName', 'accountHolderName']) }}</dd>
              </div>
              <div>
                <dt>Clearing number</dt>
                <dd>{{ vm.reimbursementField(vm.selectedReimbursement, ['clearingNumber', 'clearingNo']) }}</dd>
              </div>
              <div>
                <dt>Account number</dt>
                <dd>{{ vm.reimbursementField(vm.selectedReimbursement, ['accountNumber', 'accNumber']) }}</dd>
              </div>
              <div>
                <dt>Phone number</dt>
                <dd>{{ vm.reimbursementField(vm.selectedReimbursement, ['phoneNumber', 'phoneNo']) }}</dd>
              </div>
              <div>
                <dt>Details confirmed correct</dt>
                <dd>{{ vm.reimbursementBooleanLabel(vm.selectedReimbursement, ['isCorrect', 'correct']) }}</dd>
              </div>
              <div class="full-width">
                <dt>Description</dt>
                <dd>{{ vm.selectedReimbursement.description || 'n/a' }}</dd>
              </div>
              <div class="full-width">
                <dt>Receipts</dt>
                <dd>
                  <span ng-if="vm.loadingReceipts">Loading receipts...</span>
                  <span ng-if="!vm.loadingReceipts && !vm.selectedReceipts.length">n/a</span>
                  <div class="receipt-list" ng-if="!vm.loadingReceipts && vm.selectedReceipts.length">
                    <div class="receipt-list-item" ng-repeat="receipt in vm.selectedReceipts track by receipt.id || receipt.url || $index">
                      <span>{{ receipt.name || 'Receipt' }}</span>
                      <span class="helper-text" ng-if="receipt.uploadedAt">{{ vm.formatDateTime(receipt.uploadedAt) }}</span>
                      <div class="receipt-actions">
                        <button
                          type="button"
                          class="receipt-view-button"
                          ng-click="vm.openReceipt(receipt)"
                          ng-disabled="vm.loadingReceipt"
                        >
                          <span class="button-icon" aria-hidden="true">↗</span>
                          {{ vm.loadingReceipt ? 'Opening...' : 'View' }}
                        </button>
                        <button
                          type="button"
                          class="secondary danger-button"
                          ng-click="vm.deleteReceipt(receipt)"
                          ng-disabled="!receipt.id || vm.deletingReceiptId === receipt.id"
                        >
                          <span class="button-icon" aria-hidden="true">🗑</span>
                          {{ vm.deletingReceiptId === receipt.id ? 'Removing...' : 'Remove' }}
                        </button>
                      </div>
                    </div>
                  </div>
                </dd>
              </div>
              <div class="full-width">
                <dt>Add receipt</dt>
                <dd>
                  <form class="receipt-upload-form" ng-submit="vm.uploadReceipt()">
                    <label>
                      Receipt file
                      <input
                        type="file"
                        accept="application/pdf,image/*"
                        file-change="vm.onAdminReceiptFileChange($files)"
                      />
                    </label>
                    <span class="receipt-file-chip" ng-if="vm.adminReceiptFile">
                      {{ vm.adminReceiptFile.name }}
                      <button type="button" class="link-button" ng-click="vm.clearAdminReceiptFile()">Remove</button>
                    </span>
                    <span class="field-error" ng-if="vm.adminReceiptError">{{ vm.adminReceiptError }}</span>
                    <button
                      type="submit"
                      class="secondary"
                      ng-disabled="!vm.adminReceiptFile || vm.adminReceiptError || vm.uploadingReceipt"
                    >
                      {{ vm.uploadingReceipt ? 'Uploading...' : 'Attach receipt' }}
                    </button>
                  </form>
                </dd>
              </div>
              <div class="full-width">
                <dt>Comment</dt>
                <dd>{{ vm.selectedReimbursement.adminComment || 'n/a' }}</dd>
              </div>
              <div>
                <dt>Processed at</dt>
                <dd>{{ vm.formatDateTime(vm.selectedReimbursement.processedAt) }}</dd>
              </div>
              <div>
                <dt>Paid out at</dt>
                <dd>{{ vm.formatDateTime(vm.selectedReimbursement.paidOutAt) }}</dd>
              </div>
            </dl>
          </div>
          <div class="alert-banner alert-banner-error" ng-if="vm.receiptError">{{ vm.receiptError }}</div>
        </section>
      </div>
    </section>
  `;
})();
