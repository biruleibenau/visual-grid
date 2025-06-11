const VisualGrid = (() => {
  let options = {};
  let container;
  let items = [];
  let buttons = [];

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

  function applyEffectToItem(item, index) {
    // Remove classes e estilos anteriores
    item.classList.remove('effect-fade', 'effect-slide-right', 'effect-zoom', 'effect-flip', 'visible');
    item.style.animationDelay = '';
    item.style.transitionDelay = '';
    item.style.height = '';
    item.style.transitionDuration = '';
    item.style.opacity = '0';
    item.style.transform = ''; // Limpa transformações residuais

    // Aplica o efeito definido em defaultEffect
    item.classList.add(`effect-${options.defaultEffect}`);
    item.style.animationDelay = `${index * 150}ms`;
    item.style.transitionDelay = `${index * 150}ms`;
    item.style.height = options.itemHeight || '260px';
    item.style.transitionDuration = options.animationDuration;

    // Força reflow para reiniciar a animação
    item.offsetHeight; // Trigger reflow

    // Aplica visibilidade
    setTimeout(() => {
      item.classList.add('visible');
    }, 50 + index * 150);
  }

  function renderGrid(category) {
    const allItems = document.querySelectorAll(`${options.containerSelector} .vg-item`);

    // Esconde todos os itens e limpa estados
    allItems.forEach(item => {
      item.style.display = 'none';
      item.classList.remove('visible', 'effect-fade', 'effect-slide-right', 'effect-zoom', 'effect-flip');
      item.style.opacity = '0';
      item.style.transform = ''; // Reseta transformações
    });

    // Filtra e mostra os itens relevantes
    let visibleIndex = 0;
    allItems.forEach(item => {
      const itemCategory = item.dataset.category || '';
      const shouldShow = !options.filterByCategory || category === 'all' || itemCategory === category;

      if (shouldShow) {
        item.style.display = '';
        applyEffectToItem(item, visibleIndex);
        visibleIndex++;
      }
    });
  }

  function init(userOptions = {}) {
    options = {
      containerSelector: '.visualgrid-container',
      buttonsSelector: '.visualgrid-filter-btn',
      defaultEffect: 'fade',
      itemHeight: '260px',
      columns: 3,
      gap: '20px',
      animationDuration: '400ms',
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

    items = document.querySelectorAll(`${options.containerSelector} .vg-item`);
    buttons = [...document.querySelectorAll(options.buttonsSelector)];

    applyGridStyles();
    renderGrid('all');

    if (options.filterByCategory) {
      buttons.forEach(btn => {
        btn.addEventListener('click', () => {
          buttons.forEach(b => b.classList.remove('active'));
          btn.classList.add('active');

          const category = btn.dataset.category || 'all';
          renderGrid(category);
        });
      });
    }
  }

  return { init };
})();
