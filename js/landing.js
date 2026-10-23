/* landing.js - only the mobile menu.
   Scroll bar, header shrink and fade-in already come from common.js,
   so we do NOT redeclare $ or $$ here (that would cause an error). */

const menuBtn = document.getElementById('menuBtn');
const menuIcon = document.getElementById('menuIcon');
const mobileMenu = document.getElementById('mobileMenu');

// Open or close the menu and keep the icon + accessibility label in sync
function setMenu(open) {
  mobileMenu.classList.toggle('open', open);
  menuBtn.setAttribute('aria-expanded', String(open));
  menuIcon.textContent = open ? 'close' : 'menu';
}

// Click the button: flip between open and closed
menuBtn.addEventListener('click', () => {
  setMenu(!mobileMenu.classList.contains('open'));
});

// Click any link inside the menu: close it
mobileMenu.querySelectorAll('a').forEach((link) => {
  link.addEventListener('click', () => setMenu(false));
});

// Press Escape: close it
document.addEventListener('keydown', (e) => {
  if (e.key === 'Escape') setMenu(false);
});