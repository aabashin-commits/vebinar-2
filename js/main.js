// main.js — инициализация и общие хелперы лендинга.
//
// Главное здесь — window.openForm(). Все CTA страницы помечены [data-open-form]
// и идут через один делегированный обработчик. По умолчанию openForm НЕ открывает
// никакой формы: он плавно прокручивает к секции регистрации #reg, где есть
// крупная кнопка и телефон школы. Как только в разметку добавят CRM-форму
// Битрикс24, js/bitrix.js (грузится последним) переопределит openForm на неё.
//
// Зачем так: ID формы клиент даёт позже, а лендинг должен работать уже сейчас —
// мёртвых кнопок на странице быть не должно.
(() => {
  'use strict';

  // ===== Блокировка прокрутки под модалками (мобильное меню) =====
  // Одного `overflow: hidden` на body мало: на телефоне страница всё равно
  // «пробивается» свайпом. Поэтому body фиксируем, а чтобы он не прыгнул
  // в начало страницы, запоминаем позицию и возвращаем её при разблокировке.
  let savedScroll = 0;

  window.lockScroll = () => {
    savedScroll = window.scrollY;
    document.body.style.top = -savedScroll + 'px';
    document.body.classList.add('no-scroll');
  };

  window.unlockScroll = () => {
    document.body.classList.remove('no-scroll');
    document.body.style.top = '';
    // Пока body был fixed, он не занимал места и высота документа схлопывалась
    // до экрана: scrollTo обрезал бы значение по этой старой высоте. Чтение
    // layout-свойства форсирует пересчёт до восстановления позиции.
    void document.body.offsetHeight;
    // behavior: 'instant' обязателен: у html стоит scroll-behavior: smooth,
    // и обычный scrollTo возвращал бы позицию анимацией.
    window.scrollTo({ top: savedScroll, behavior: 'instant' });
  };

  // ===== Дефолтная реализация CTA =====
  const reg = document.querySelector('#reg');

  window.openForm = () => {
    if (!reg) return;

    reg.scrollIntoView({ behavior: 'smooth', block: 'center' });

    // Короткая подсветка баннера — отклик на клик. Без неё нажатие на кнопку,
    // когда секция #reg уже на экране, выглядит как «ничего не произошло».
    const banner = reg.querySelector('.final-cta__banner');
    if (!banner) return;

    banner.classList.remove('is-flash');
    // Чтение layout-свойства перезапускает анимацию при повторных кликах:
    // без него браузер не считает класс снятым и добавленным заново.
    void banner.offsetWidth;
    banner.classList.add('is-flash');
  };

  document.addEventListener('click', (e) => {
    const cta = e.target.closest('[data-open-form]');
    if (!cta) return;
    e.preventDefault();
    window.openForm(cta.dataset.openForm);
  });
})();
