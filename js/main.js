/* =========================================================================
   SPA-роутер для Концепта 1 — Editorial
   - Hash-based маршруты (#/, #/about, #/services, ...)
   - Плавный fade между экранами
   - Подсветка активного пункта меню
   - Mobile nav toggle
   - Прогресс скролла
   ========================================================================= */

(function () {
  'use strict';

  // Получаем все views и ссылки навигации
  const views = document.querySelectorAll('.view');
  const navLinks = document.querySelectorAll('.site-nav a');
  const navToggle = document.querySelector('.nav-toggle');
  const siteNav = document.querySelector('.site-nav');
  const progress = document.querySelector('.scroll-progress');

  /**
   * Извлечь имя view из hash вида "#/about" → "about"
   */
  function nameFromHash(hash) {
    const cleaned = (hash || '').replace(/^#\/?/, '').replace(/\/$/, '');
    return cleaned || 'hero';
  }

  /**
   * Подсветка активного пункта меню
   */
  function highlightNav(name) {
    navLinks.forEach((a) => {
      const matches = a.dataset.link === name;
      a.classList.toggle('is-current', matches);
    });
  }

  /**
   * Показать экран и плавно переключиться
   */
  function showView(name) {
    let found = false;
    views.forEach((v) => {
      if (v.dataset.view === name && !found) {
        v.classList.add('is-active');
        // Скроллим активный view наверх
        v.scrollTop = 0;
        found = true;
      } else {
        v.classList.remove('is-active');
      }
    });
    // Если ничего не нашли — показать hero
    if (!found) {
      document.querySelector('.view[data-view="hero"]').classList.add('is-active');
    }
    highlightNav(name);

    // Закрыть мобильное меню если открыто
    if (siteNav && siteNav.classList.contains('is-open')) {
      siteNav.classList.remove('is-open');
      if (navToggle) navToggle.setAttribute('aria-expanded', 'false');
    }

    // Сброс прогресса при смене экрана
    if (progress) progress.style.width = '0%';
  }

  /**
   * Обработка кликов по ссылкам с data-link или href^="#/"
   */
  document.addEventListener('click', (e) => {
    const link = e.target.closest('a[data-link], a[href^="#/"]');
    if (!link) return;

    // Разрешаем внешние ссылки (target=_blank)
    if (link.target === '_blank') return;

    const href = link.getAttribute('href') || '';
    if (!href.startsWith('#/')) return;

    e.preventDefault();
    const name = nameFromHash(href);
    if (history.pushState) {
      history.pushState({ view: name }, '', href);
    }
    showView(name);
  });

  /**
   * Кнопки back/forward в браузере
   */
  window.addEventListener('popstate', () => {
    showView(nameFromHash(location.hash));
  });

  /**
   * Mobile nav toggle
   */
  if (navToggle && siteNav) {
    navToggle.addEventListener('click', () => {
      const isOpen = siteNav.classList.toggle('is-open');
      navToggle.setAttribute('aria-expanded', isOpen ? 'true' : 'false');
    });

    // Закрыть меню при клике на ссылку
    siteNav.addEventListener('click', (e) => {
      if (e.target.tagName === 'A') {
        siteNav.classList.remove('is-open');
        navToggle.setAttribute('aria-expanded', 'false');
      }
    });
  }

  /**
   * Прогресс скролла — отслеживаем активный view
   */
  function updateProgress() {
    const activeView = document.querySelector('.view.is-active');
    if (!activeView || !progress) return;
    const max = activeView.scrollHeight - activeView.clientHeight;
    const scrolled = activeView.scrollTop;
    const pct = max > 0 ? (scrolled / max) * 100 : 0;
    progress.style.width = pct + '%';
  }

  // Слушаем скролл на каждом view
  views.forEach((v) => {
    v.addEventListener('scroll', updateProgress, { passive: true });
  });

  // IntersectionObserver для reveal-эффектов при скролле внутри view
  const revealObserver = new IntersectionObserver(
    (entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add('is-visible');
        }
      });
    },
    { threshold: 0.1, rootMargin: '0px 0px -40px 0px' }
  );

  // Наблюдаем за блоками внутри views
  document.querySelectorAll('.reveal-on-scroll').forEach((el) => {
    revealObserver.observe(el);
  });

  /**
   * Инициализация при загрузке
   */
  function init() {
    // Если hash пустой — ставим #/
    if (!location.hash) {
      history.replaceState({ view: 'hero' }, '', '#/');
    }
    showView(nameFromHash(location.hash));
  }

  // Запуск после готовности DOM
  if (document.readyState === 'loading') {
    document.addEventListener('DOMContentLoaded', init);
  } else {
    init();
  }
})();