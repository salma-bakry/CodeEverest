(function () {
  document.querySelectorAll('.card').forEach(function (card) {
    card.classList.add('spot');

    // While the mouse moves over the card, tell the CSS where it is.
    //    global.css reads these two values as --mx and --my.
    card.addEventListener('mousemove', function (e) {
      const box = card.getBoundingClientRect();
      card.style.setProperty('--mx', (e.clientX - box.left) + 'px');
      card.style.setProperty('--my', (e.clientY - box.top) + 'px');
    });
  });
  const header = document.getElementById('siteHeader');
  if (header) {
    window.addEventListener('scroll', function () {
      header.classList.toggle('scrolled', window.scrollY > 20);
    }, { passive: true });
  }
})();