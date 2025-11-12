// Frontend-only site auth guard
// Prevents anonymous users from navigating to feature pages — redirects to login landing.
(function(){
  function isAuthRequiredHref(href) {
    if (!href) return false;
    href = href.toLowerCase();
    // allow login/register pages and anchors
    if (href.includes('login.html') || href.includes('register') || href.startsWith('#')) return false;
    // allow external links
    if (href.startsWith('http://') || href.startsWith('https://') || href.startsWith('mailto:')) return false;
    // otherwise require auth
    return true;
  }

  function guardLinks(e) {
    const cur = (window.DB && DB.getCurrentUser && DB.getCurrentUser()) || null;
    if (cur) return; // logged in, nothing to do

    // find nearest anchor
    let el = e.target;
    while (el && el.tagName !== 'A') el = el.parentElement;
    if (!el || !el.getAttribute) return;
    const href = el.getAttribute('href');
    if (!href) return;
    if (isAuthRequiredHref(href)) {
      e.preventDefault();
      // redirect to central login landing
      window.location.href = 'login.html';
    }
  }

  document.addEventListener('click', guardLinks, true);

  // Also block form submissions that require auth (booking form)
  document.addEventListener('submit', function(e){
    const cur = (window.DB && DB.getCurrentUser && DB.getCurrentUser()) || null;
    if (cur) return;
    // if the form is booking or payments, redirect
    const form = e.target;
    if (!form) return;
    const id = form.id || '';
    if (id.toLowerCase().includes('book') || id.toLowerCase().includes('pay')) {
      e.preventDefault();
      window.location.href = 'login.html';
    }
  }, true);
})();
