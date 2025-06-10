const VisualGrid = (() => {
  let options = {};
  let container;
  let items = [];
  let buttons = [];
  let currentEffect = '';
  
  // Cria o elemento de grid
  function createGridItem(itemData, index) {
    const div = document.createElement('div');
    div.classList.add('vg-item', `effect-${currentEffect}`);
    div.style.animationDelay = `${index * 150}ms`;
    div.style.transitionDelay = `${index * 150}ms`;
    div.style.height = options.itemHeight || '250px';

    div.innerHTML = `
      <img src="${itemData.src}" alt="${itemData.title}" />
      <h3>${itemData.title}</h3>
    `;

    // Ativa animação
    setTimeout(() => {
      div.classList.add('visible');
    }, 50 + index * 150);

    return div;
  }

  // Renderiza os itens filtrando por categoria e efeito
  function renderGrid(effect, category) {
    currentEffect = effect || options.defaultEffect;
    container.innerHTML = '';

    let filteredItems = items;
    if (category && category !== 'all') {
      filteredItems = items.filter(i => i.category === category);
    }

    filteredItems.forEach((item, i) => {
      const gridItem = createGridItem(item, i);
      container.appendChild(gridItem);
    });
  }

  // Inicializa a galeria
  function init(userOptions = {}) {
    options = {
      containerSelector: '.visualgrid-container',
      buttonsSelector: '.visualgrid-filter-btn',
      defaultEffect: 'fade',
      itemHeight: '250px',
      items: [],
      ...userOptions,
    };

    container = document.querySelector(options.containerSelector);
    if (!container) {
      console.error('VisualGrid: Container not found');
      return;
    }

    items = options.items;
    buttons = [...document.querySelectorAll(options.buttonsSelector)];

    // Renderização inicial
    renderGrid(options.defaultEffect, 'all');

    // Eventos dos botões filtro e efeito
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

  return { init };
})();
