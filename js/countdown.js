// countdown.js — дата вебинара и обратный отсчёт.
//
// ⚠️ ЕДИНСТВЕННОЕ МЕСТО, ГДЕ ЗАДАНА ДАТА ЭФИРА. Ни в index.html, ни в других
// скриптах её нет: в разметке стоят плейсхолдеры, которые этот файл перезаписывает
// при загрузке. Клиент назвал дату — меняем WEBINAR_AT, и она разъезжается
// по шапке, hero, финальному баннеру и подписям.
//
// Формат — ISO 8601 со СМЕЩЕНИЕМ ЗОНЫ (+03:00 = Москва). Без смещения браузер
// прочитал бы дату в часовом поясе посетителя, и человек из Новосибирска
// увидел бы отсчёт до 19:00 по своему времени, а не по московскому.
(() => {
  'use strict';

  const WEBINAR_AT = '2026-08-27T19:00:00+03:00';

  // Сколько эфир идёт: пока не истечёт, показываем «мы в эфире», а не «прошёл».
  // 60 минут = доклад 40–50 минут + ответы на вопросы.
  const DURATION_MIN = 75;

  const start = new Date(WEBINAR_AT);
  if (Number.isNaN(start.getTime())) return; // дата задана неверно — молча выходим
  const end = new Date(start.getTime() + DURATION_MIN * 60 * 1000);

  // ===== Подстановка даты в разметку =====
  // Все даты на странице считаются по московскому времени независимо от того,
  // где находится посетитель: вебинар идёт по Москве, и «19:00» должно
  // означать 19:00 МСК для всех.
  const MSK = 'Europe/Moscow';

  const fmtShort = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit', timeZone: MSK,
  });

  const fmtFull = new Intl.DateTimeFormat('ru-RU', {
    day: 'numeric', month: 'long', year: 'numeric',
    hour: '2-digit', minute: '2-digit', timeZone: MSK,
  });

  // Intl отдаёт «17 сентября 2026 г., 19:00» — убираем « г.» и запятую перед
  // временем, чтобы строка читалась как в макете: «17 сентября 2026, 19:00 МСК».
  const clean = (s) => s.replace(' г.', '');

  document.querySelectorAll('[data-webinar-date]').forEach((el) => {
    el.textContent = clean(fmtShort.format(start));
  });

  document.querySelectorAll('[data-webinar-full]').forEach((el) => {
    el.textContent = clean(fmtFull.format(start)) + ' МСК';
  });

  // ===== Обратный отсчёт =====
  const timers = [...document.querySelectorAll('[data-countdown]')];
  if (!timers.length) return;

  // Русское склонение: 1 день, 2 дня, 5 дней. Формы задаются тройкой
  // [один, два-четыре, много]; 11–14 всегда «много» — отсюда проверка сотен.
  const plural = (n, forms) => {
    const mod100 = n % 100;
    const mod10 = n % 10;
    if (mod100 >= 11 && mod100 <= 14) return forms[2];
    if (mod10 === 1) return forms[0];
    if (mod10 >= 2 && mod10 <= 4) return forms[1];
    return forms[2];
  };

  const UNITS = [
    { key: 'days',    forms: ['день', 'дня', 'дней'] },
    { key: 'hours',   forms: ['час', 'часа', 'часов'] },
    { key: 'minutes', forms: ['минута', 'минуты', 'минут'] },
    { key: 'seconds', forms: ['секунда', 'секунды', 'секунд'] },
  ];

  // Собираем ссылки на узлы один раз: querySelector на каждом тике —
  // это 8 обходов DOM в секунду на каждый таймер.
  const parts = timers.map((root) => {
    const refs = { root, grid: root.querySelector('.countdown__grid'), message: root.querySelector('[data-countdown-message]') };
    UNITS.forEach(({ key }) => {
      refs[key] = root.querySelector('[data-countdown-' + key + ']');
      refs[key + 'Label'] = root.querySelector('[data-countdown-' + key + '-label]');
    });
    return refs;
  });

  const showMessage = (text, live) => {
    parts.forEach((p) => {
      if (p.grid) p.grid.hidden = true;
      if (p.message) {
        p.message.textContent = text;
        p.message.hidden = false;
      }
      p.root.classList.toggle('is-live', live);
    });
  };

  let timerId = null;

  const tick = () => {
    const now = Date.now();
    const left = start.getTime() - now;

    if (left <= 0) {
      // Эфир идёт или уже закончился — отсчёт больше не нужен
      if (timerId) clearInterval(timerId);

      if (now <= end.getTime()) {
        showMessage('Мы в эфире — присоединяйтесь', true);
      } else {
        showMessage('Вебинар прошёл. Оставьте заявку — пришлём запись и приглашение на следующий', false);
      }
      return;
    }

    const total = Math.floor(left / 1000);
    const value = {
      days: Math.floor(total / 86400),
      hours: Math.floor(total / 3600) % 24,
      minutes: Math.floor(total / 60) % 60,
      seconds: total % 60,
    };

    parts.forEach((p) => {
      UNITS.forEach(({ key, forms }) => {
        const n = value[key];
        // Двузначный формат везде, кроме дней: «03 д» выглядит странно,
        // а «03 ч» — привычно.
        if (p[key]) p[key].textContent = key === 'days' ? String(n) : String(n).padStart(2, '0');
        if (p[key + 'Label']) p[key + 'Label'].textContent = plural(n, forms);
      });
    });
  };

  tick();
  timerId = setInterval(tick, 1000);
})();
