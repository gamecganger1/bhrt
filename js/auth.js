// Simple auth helper UI functions
function showCurrentUserStatus() {
  const cur = DB.getCurrentUser();
  const header = document.querySelector('header');
  if (!header) return;
  let statusEl = document.getElementById('userStatus');
  if (!statusEl) {
    statusEl = document.createElement('div');
    statusEl.id = 'userStatus';
    statusEl.style.position = 'absolute';
    statusEl.style.right = '20px';
    statusEl.style.top = '18px';
    statusEl.style.color = 'white';
    header.appendChild(statusEl);
  }
  // Update nav links depending on auth state
  const nav = header.querySelector('nav');
  if (nav) {
    if (!cur) {
      // Not logged in: show primary links + login/register options
      nav.innerHTML = `
        <a href="index.html">Home</a>
        <a href="booking.html">Book Event</a>
        <a href="budget.html">Budget Calculator</a>
        <a href="login.html">Login / Register</a>
      `;
      statusEl.innerHTML = `<a href="user-login.html" style="color:white;">Login</a>`;
    } else {
      // Logged in: show role specific links
      if (cur.role === 'admin') {
        // Admins see admin features only
        nav.innerHTML = `
          <a href="index.html">Home</a>
          <a href="admin.html">Admin Panel</a>
          <a href="admin-payments.html">Admin Payments</a>
          <a href="all-bookings.html">All Bookings</a>
        `;
      } else if (cur.role === 'member') {
        // Members: dashboard and payments (no booking/budget)
        nav.innerHTML = `
          <a href="index.html">Home</a>
          <a href="member-dashboard.html">Member Dashboard</a>
          <a href="payments.html">Payments</a>
        `;
      } else {
        // regular user: booking and budget
        nav.innerHTML = `
          <a href="index.html">Home</a>
          <a href="booking.html">Book Event</a>
          <a href="budget.html">Budget Calculator</a>
          <a href="payments.html">Payments</a>
        `;
      }

      statusEl.innerHTML = `Logged in as <b>${cur.email}</b> (<a href="#" onclick="logoutAndReload()">Logout</a>)`;
    }
  }
}

function logoutAndReload() {
  DB.logout();
  location.reload();
}

document.addEventListener('DOMContentLoaded', function(){
  if (window.DB) showCurrentUserStatus();
});

// expose for console
window.logoutAndReload = logoutAndReload;
window.showCurrentUserStatus = showCurrentUserStatus;