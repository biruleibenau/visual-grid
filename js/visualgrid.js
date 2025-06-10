const VisualGrid = (() => {
  let options = {};
  let container;
  let items = [];
  let buttons = [];
  let currentEffect = '';

  function applyGridStyles() {
    if (!container) return;
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${options.columns}, 1fr)`;
    container.style.gap = options.gap;

    const oldStyle = document.getElementById('visualgrid-responsive-style');
    if (oldStyle) oldStyle.remove();

    if (options.responsiveBreakpoints) {
      let css = '';
      for (const bp in options.responsiveBreakpoints) {
        const cols = options.responsiveBreakpoints[bp];
        css += `
          @media(max-width: ${bp}px) {
            ${options.containerSelector} {
              grid-template-columns: repeat(${cols}, 1fr) !important;
            }
          }
        `;
      }
      const styleTag = document.createElement('style');
      styleTag.id = 'visualgrid-responsive-style';
      styleTag.innerHTML = css;
      document.head.appendChild(styleTag);
    }
  }

  function applyEffectToItem(item, effect, index) {
    // Remove efeitos anteriores
    item.classList.remove('effect-fade', 'effect-slide-right', 'effect-zoom', 'effect-flip', 'visible');
    // Adiciona novo efeito e atraso
    item.classList.add(`effect-${effect}`);
    item.style.animationDelay = `${index * 150}ms`;
    item.style.transitionDelay = `${index * 150}ms`;
    item.style.height = options.itemHeight || '250px';
    item.style.transitionDuration = options.animationDuration;
    // Aplica visibilidade após pequeno delay
    setTimeout(() => {
      item.classList.add('visible');
    }, 50 + index * 150);
  }

  function renderGrid(effect, category) {
    currentEffect = effect || options.defaultEffect;

    // Pega todos os itens do DOM
    const allItems = document.querySelectorAll(`${options.containerSelector} .vg-item`);

    allItems.forEach((item, index) => {
      const itemCategory = item.dataset.category || '';
      const shouldShow = !options.filterByCategory || category === 'all' || itemCategory === category;

      if (shouldShow) {
        item.style.display = ''; // Mostra o item
        applyEffectToItem(item, currentEffect, index);
      } else {
        item.style.display = 'none'; // Esconde o item
      }
    });
  }

  function init(userOptions = {}) {
    options = {
      containerSelector: '.visualgrid-container',
      buttonsSelector: '.visualgrid-filter-btn',
      defaultEffect: 'fade',
      itemHeight: '250px',
      columns: 3,
      gap: '20px',
      animationDuration: '500ms',
      responsiveBreakpoints: {
        992: 2,
        600: 1,
      },
      filterByCategory: true,
      ...userOptions,
    };

    container = document.querySelector(options.containerSelector);
    if (!container) {
      console.error('VisualGrid: Container not found');
      return;
    }

    // Remove a dependência de options.items
    items = document.querySelectorAll(`${options.containerSelector} .vg-item`);
    buttons = [...document.querySelectorAll(options.buttonsSelector)];

    applyGridStyles();

    // Inicial render
    renderGrid(options.defaultEffect, 'all');

    // Eventos dos botões
    if (options.filterByCategory) {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const effect = btn.dataset.effect || options.defaultEffect;
          const category = btn.dataset.category || 'all';
          renderGrid(effect, category);
        });
      });
    }
  }

  return { init };
})();
