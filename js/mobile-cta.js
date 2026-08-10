// mobile-cta.js — липкая плашка «занять место» на телефоне.
// Показывает плашку (.is-visible), только когда CTA первого экрана (.hero__cta)
// пролистан вверх за шапку, и прячет, пока он виден. Видимость самой плашки
// ограничена мобилкой в CSS — здесь только переключаем класс, ширину не проверяем.
(() => {
  'use strict';

  const bar = document.querySelector('.mobile-cta');
  if (!bar) return;

  const heroCta = document.querySelector('.hero__cta');
  // Нет hero-CTA, за которым следить — показываем плашку всегда
  if (!heroCta) {
    bar.classList.add('is-visible');
    return;
  }

  // Верхняя граница root сдвинута на высоту липкой шапки: hero-CTA считается
  // «пролистанным», когда уходит под шапку, а не за край экрана. Шапка ниже
  // 1024 имеет высоту 64px, на телефоне — 56px; берём 56 как меньшее из двух,
  // разница в 8px на момент появления плашки не заметна.
  const io = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        bar.classList.toggle('is-visible', !entry.isIntersecting);
      });
    },
    { rootMargin: '-56px 0px 0px 0px', threshold: 0 }
  );

  io.observe(heroCta);
})();
