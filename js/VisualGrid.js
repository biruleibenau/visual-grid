const VisualGrid = (() => {
  let options = {};
  let container;
  let items = [];
  let buttons = [];
  let currentEffect = '';

  function applyGridStyles() {
    // Define colunas e gap no container usando CSS Grid
    if (!container) return;
    container.style.display = 'grid';
    container.style.gridTemplateColumns = `repeat(${options.columns}, 1fr)`;
    container.style.gap = options.gap;

    // Remove responsividade anterior se houver
    const oldStyle = document.getElementById('visualgrid-responsive-style');
    if (oldStyle) oldStyle.remove();

    // Cria responsividade via CSS injetado com breakpoints
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

  function createGridItem(itemData, index) {
    const div = document.createElement('div');
    div.classList.add('vg-item', `effect-${currentEffect}`);
    div.style.animationDelay = `${index * 150}ms`;
    div.style.transitionDelay = `${index * 150}ms`;
    div.style.height = options.itemHeight || '250px';
    div.style.transitionDuration = options.animationDuration;

    div.innerHTML = `
      <img src="${itemData.src}" alt="${itemData.title}" />
      <h3>${itemData.title}</h3>
    `;

    setTimeout(() => {
      div.classList.add('visible');
    }, 50 + index * 150);

    return div;
  }

  function renderGrid(effect, category) {
    currentEffect = effect || options.defaultEffect;
    container.innerHTML = '';

    let filteredItems = items;
    if (options.filterByCategory && category && category !== 'all') {
      filteredItems = items.filter(i => i.category === category);
    }

    filteredItems.forEach((item, i) => {
      const gridItem = createGridItem(item, i);
      container.appendChild(gridItem);
    });
  }

  function init(userOptions = {}) {
    options = {
      containerSelector: '.visualgrid-container',
      buttonsSelector: '.visualgrid-filter-btn',
      defaultEffect: 'fade',
      itemHeight: '250px',
      items: [],
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

    items = options.items;
    buttons = [...document.querySelectorAll(options.buttonsSelector)];

    applyGridStyles();

    // Inicial render
    renderGrid(options.defaultEffect, 'all');

    // Eventos dos botões filtro + efeito (se estiver ativo)
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
