/* common.js - shared behavior for every page that uses the header.
   Needs: <header id="siteHeader">, <div id="prog"></div>, .rv elements,
   optional #avatarBtn + #userMenu and [data-logout] buttons. */

const $ = (s) => document.querySelector(s);
const $$ = (s) => [...document.querySelectorAll(s)];

/* Header shrink + scroll progress bar */
function onScroll() {
  const header = $('#siteHeader');
  const bar = $('#prog');
  const max = document.documentElement.scrollHeight - innerHeight;
  if (header) header.classList.toggle('scrolled', scrollY > 20);
  if (bar) bar.style.transform = `scaleX(${max > 0 ? scrollY / max : 0})`;
}
addEventListener('scroll', onScroll, { passive: true });
onScroll();

/* Reveal on load/scroll: adds .in to every .rv element (staggered) */
(function reveal() {
  const items = $$('.rv');
  if (!('IntersectionObserver' in window)) { items.forEach((el) => el.classList.add('in')); return; }

  items.forEach((el) => {
    const siblings = [...el.parentElement.children].filter((c) => c.classList.contains('rv'));
    el.style.transitionDelay = Math.min(siblings.indexOf(el), 5) * 90 + 'ms';
  });

  const io = new IntersectionObserver((entries) => {
    entries.forEach((e) => {
      if (!e.isIntersecting) return;
      e.target.classList.add('in');
      setTimeout(() => (e.target.style.transitionDelay = '0ms'), 1300);   // so hover effects are not delayed
      io.unobserve(e.target);
    });
  }, { threshold: 0.15 });
  items.forEach((el) => io.observe(el));
})();

/* Spotlight on .spot cards */
document.addEventListener('mousemove', (e) => {
  const card = e.target.closest && e.target.closest('.spot');
  if (!card) return;
  const r = card.getBoundingClientRect();
  card.style.setProperty('--mx', e.clientX - r.left + 'px');
  card.style.setProperty('--my', e.clientY - r.top + 'px');
});

/* Account menu (avatar dropdown) */
(function accountMenu() {
  const btn = $('#avatarBtn');
  const menu = $('#userMenu');
  if (!btn || !menu) return;

  const setOpen = (open) => {
    menu.classList.toggle('open', open);
    btn.setAttribute('aria-expanded', String(open));
  };
  btn.addEventListener('click', (e) => { e.stopPropagation(); setOpen(!menu.classList.contains('open')); });
  document.addEventListener('click', (e) => { if (!menu.contains(e.target)) setOpen(false); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') setOpen(false); });
})();

/* Logout (FR-06): prototype only, just goes back to the login page */
$$('[data-logout]').forEach((b) => b.addEventListener('click', () => { window.location.href = 'login.html'; }));