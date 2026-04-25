(() => {
  window.BookKeepingPortal.templates.home = `
    <section class="panel home-panel">
      <div class="hero-copy">
        <span class="badge">Book Keeping</span>
        <h2>Submit expenses or unlock your finance desk.</h2>
        <p class="helper-text">
          Create a reimbursement request without signing in, or login/register.
        </p>
      </div>

      <div class="admin-home-grid">
        <a class="admin-card action-card action-card-primary" href="#!/reimbursement">
          <span class="badge">Reimbursement</span>
          <h3>Create reimbursement</h3>
          <p>Submit a reimbursement request directly from the public form.</p>
          <span class="admin-card-link">Start reimbursement</span>
        </a>
        <a class="admin-card action-card action-card-secondary" href="#!/login">
          <span class="badge">Account</span>
          <h3>Login or register</h3>
          <p>Sign in or create an account to access admin, finance, or user tools.</p>
          <span class="admin-card-link">Open account access</span>
        </a>
      </div>
    </section>
  `;
})();
