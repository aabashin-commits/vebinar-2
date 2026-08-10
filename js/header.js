// header.js — бургер-меню лендинга.
// Липкость шапки решена CSS (position: sticky), выпадающих списков нет:
// на лендинге всего четыре якоря, группировать нечего.
(() => {
  'use strict';

  const header = document.querySelector('.header');
  if (!header) return;

  const menu = header.querySelector('.header__menu');
  const burger = header.querySelector('.header__burger');
  const close = header.querySelector('.header__menu-close');
  if (!menu || !burger || !close) return;

  const toggle = (open) => {
    menu.classList.toggle('is-open', open);
    burger.setAttribute('aria-expanded', String(open));

    // Страницу под открытым меню фиксируем (см. lockScroll в main.js):
    // иначе на телефоне она прокручивается свайпом сквозь оверлей.
    if (open) window.lockScroll();
    else window.unlockScroll();
  };

  burger.addEventListener('click', () => toggle(true));
  close.addEventListener('click', () => toggle(false));

  // Клик по якорю или CTA внутри меню закрывает его
  menu.addEventListener('click', (e) => {
    if (e.target.closest('a, [data-open-form]')) toggle(false);
  });

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && menu.classList.contains('is-open')) toggle(false);
  });
})();
