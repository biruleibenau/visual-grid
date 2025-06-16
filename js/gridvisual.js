// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 1 (Inicialização)
(function(window) {
  'use strict';

  // Construtor da biblioteca
  function PortfolioGrid(element, options) {
    // Converte elemento ou seletor em elemento DOM
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    // Opções padrão
    // Opções padrão
this.defaults = {
  itemSelector: '.grid-item',
  layoutMode: 'masonry',
  columnWidth: 'auto',
  gutter: 10,
  transitionDuration: '0.4s',
  transitionTimingFunction: 'ease-in-out', // Novo: função de easing
  percentPosition: true,
  filter: '*',
  sortBy: 'original-order',
  sortAscending: true,
  getSortData: {
    name: function(elem) { return elem.textContent; },
    order: '[data-order]',
    random: function() { return Math.random(); }
  },
  hiddenStyle: { opacity: 0, transform: 'scale(0.5)' },
  visibleStyle: { opacity: 1, transform: 'scale(1)' }
};

    // Mescla opções fornecidas com padrão
    this.options = Object.assign({}, this.defaults, options);

    // Inicializa o grid
    this._init();
  }

  // Métodos do protótipo
  PortfolioGrid.prototype = {
    // Inicialização
    _init: function() {
      // Configura o contêiner
      this.element.style.position = 'relative';

      // Coleta os itens
      this.items = this._getItems();

      // Aplica transições aos itens
      this.items.forEach(function(item) {
    item.element.style.transition = `left ${this.options.transitionDuration} ${this.options.transitionTimingFunction}, top ${this.options.transitionDuration} ${this.options.transitionTimingFunction}, opacity ${this.options.transitionDuration} ${this.options.transitionTimingFunction}, transform ${this.options.transitionDuration} ${this.options.transitionTimingFunction}`;
  }, this);

      // Calcula tamanhos
      this._getSize();

      // Atualiza dados de ordenação
      this._updateSortData();

      // Aplica layout inicial
      this.arrange();

      // Adiciona listener de redimensionamento com debounce
      this._debouncedArrange = this._debounce(() => this.arrange(), 100);
      window.addEventListener('resize', this._debouncedArrange);
    },

    // Função de debounce para otimizar eventos
    _debounce: function(func, wait) {
      let timeout;
      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
      };
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);
//// fim parte 1
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 2 (Itens e Tamanhos)
(function(window) {
  'use strict';

  // Adiciona métodos ao protótipo
  Object.assign(PortfolioGrid.prototype, {
    // Coleta itens do grid com base em itemSelector
    _getItems: function() {
      const selector = this.options.itemSelector;
      const elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem, index) {
        return {
          element: elem,
          isVisible: true, // Estado inicial: visível
          sortData: { 'original-order': index } // Ordem inicial
        };
      });
    },

    // Calcula tamanhos do contêiner e itens
    _getSize: function() {
      const rect = this.element.getBoundingClientRect();
      const styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width,
        innerWidth: rect.width - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height,
        innerHeight: rect.height - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      // Define largura da coluna
      if (this.options.columnWidth === 'auto') {
        const firstItem = this.items[0];
        if (firstItem) {
          const itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth; // Fallback
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    }
  });
})(window);/// fim parte 2
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 3 (Filtragem e Animações)
(function(window) {
  'use strict';

  // Adiciona métodos ao protótipo
  Object.assign(PortfolioGrid.prototype, {
    // Filtra itens com base em options.filter
    _filter: function() {
      const filter = this.options.filter || '*';
      const filterFn = this._getFilterTest(filter);
      const result = { needReveal: [], needHide: [] };

      this.items.forEach(function(item) {
        const shouldBeVisible = filterFn(item.element);
        if (shouldBeVisible && !item.isVisible) {
          result.needReveal.push(item);
        } else if (!shouldBeVisible && item.isVisible) {
          result.needHide.push(item);
        }
        item.isVisible = shouldBeVisible;
      });
      return result;
    },

    // Cria função de teste para filtro
    _getFilterTest: function(filter) {
      if (filter === '*') {
        return function() { return true; };
      }
      if (typeof filter === 'function') {
        return filter;
      }
      return function(element) {
        return element.matches(filter);
      };
    },

    // Aplica animações de mostrar/esconder
    _hideReveal: function(filterResult) {
  if (filterResult.needHide.length) {
    this.hide(filterResult.needHide);
    // Aguarda a transição de hide antes de revelar
    setTimeout(() => {
      this.reveal(filterResult.needReveal);
    }, parseFloat(this.options.transitionDuration) * 1000);
  } else {
    this.reveal(filterResult.needReveal);
  }
},

    // Esconde itens com animação
    hide: function(items) {
  items.forEach(function(item) {
    Object.assign(item.element.style, this.options.hiddenStyle);
    const onTransitionEnd = () => {
      if (!item.isVisible) {
        item.element.style.display = 'none';
      }
      item.element.removeEventListener('transitionend', onTransitionEnd);
    };
    item.element.addEventListener('transitionend', onTransitionEnd);
  }, this);
},

    // Mostra itens com animação
    reveal: function(items) {
  items.forEach(function(item) {
    item.element.style.display = '';
    requestAnimationFrame(() => {
      Object.assign(item.element.style, this.options.visibleStyle);
    });
  }, this);
}
  });
})(window);/// fim parte 3
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 4 (Ordenação)
(function(window) {
  'use strict';

  // Adiciona métodos ao protótipo
  Object.assign(PortfolioGrid.prototype, {
    // Ordena itens com base em sortBy
    _sort: function() {
      const sortBy = this.options.sortBy;
      if (!sortBy || sortBy === 'none') return;

      const sortAscending = this.options.sortAscending;
      const sorters = this._getSorters();

      this.items.sort(function(a, b) {
        const keys = Array.isArray(sortBy) ? sortBy : [sortBy];
        for (let i = 0; i < keys.length; i++) {
          const key = keys[i];
          const sorter = sorters[key] || function() { return 0; };
          const valueA = a.sortData[key];
          const valueB = b.sortData[key];
          if (valueA > valueB) return sortAscending ? 1 : -1;
          if (valueA < valueB) return sortAscending ? -1 : 1;
        }
        return 0;
      });
    },

    // Cria funções de ordenação
    _getSorters: function() {
      const getSortData = this.options.getSortData;
      const sorters = {};

      for (let key in getSortData) {
        const sorter = getSortData[key];
        if (typeof sorter === 'string') {
          sorters[key] = function(elem) {
            const value = elem.element.querySelector(sorter) || elem.element.getAttribute(sorter.replace(/\[|\]/g, ''));
            return value ? parseFloat(value) || value : '';
          };
        } else if (typeof sorter === 'function') {
          sorters[key] = function(elem) {
            if (sorter.length === 0) {
              return sorter();
            }
            return sorter(elem.element);
          };
        }
      }
      return sorters;
    },

    // Atualiza dados de ordenação
    _updateSortData: function() {
      const sorters = this._getSorters();
      this.items.forEach(function(item, index) {
        item.sortData['original-order'] = index;
        for (let key in sorters) {
          item.sortData[key] = sorters[key](item);
        }
      });
    },

    // Ordena itens aleatoriamente (resolve reSortRandom)
    shuffle: function() {
      this.items.forEach(function(item) {
        item.sortData['random'] = Math.random();
      });
      this.arrange({ sortBy: 'random' });
    }
  });
})(window);/// fim parte 4
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 5 (Layouts)
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 5 (Layouts)
(function(window) {
  'use strict';

  // Adiciona métodos ao protótipo
  Object.assign(PortfolioGrid.prototype, {
    // Método principal para aplicar layout
    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

    // Redefine o estado do layout
    _resetLayout: function() {
      this._getSize();
      if (this.options.layoutMode === 'masonry') {
        this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
        this.colYs = new Array(this.cols).fill(0);
      } else if (this.options.layoutMode === 'fitRows') {
        this.rowY = 0;
        this.maxRowHeight = 0;
      }
      this.maxY = 0;
    },

    // Posiciona os itens
    _layoutItems: function() {
  this._getSize(); // Recalcula tamanhos antes de posicionar
  if (this.options.layoutMode === 'masonry') {
    this._layoutMasonry();
  } else if (this.options.layoutMode === 'fitRows') {
    this._layoutFitRows();
  }
},

    // Layout Masonry
    _layoutMasonry: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          const position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Layout FitRows
    _layoutFitRows: function() {
      let x = 0;
      let maxRowHeight = 0;
      this.rowY = 0;
      this.items.forEach(function(item) {
        if (item.isVisible) {
          const itemStyles = getComputedStyle(item.element);
          const itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
          const itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

          if (x + itemWidth > this.size.innerWidth) {
            this.rowY += maxRowHeight + this.options.gutter;
            x = 0;
            maxRowHeight = 0;
          }

          const posX = this.options.percentPosition ? (x / this.size.innerWidth) * 100 + '%' : x + 'px';
          const posY = this.options.percentPosition ? (this.rowY / this.size.innerHeight) * 100 + '%' : this.rowY + 'px';
          this._positionItem(item, posX, posY);
          x += itemWidth + this.options.gutter;
          maxRowHeight = Math.max(maxRowHeight, itemHeight);
          this.maxY = this.rowY + maxRowHeight;
        }
      }, this);
      this.maxRowHeight = maxRowHeight;
    },

    // Calcula a posição de um item (para Masonry)
    _getItemLayoutPosition: function(item) {
      const itemStyles = getComputedStyle(item.element);
      const itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
      const itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

      const colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + this.options.gutter)), this.cols);
      const colGroup = this._getTopColGroup(colSpan);
      const minY = Math.min.apply(Math, colGroup);
      const colIndex = colGroup.indexOf(minY);

      let x = colIndex * (this.columnWidth + this.options.gutter);
      let y = minY;

      for (let i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + this.options.gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + this.options.gutter);

      if (this.options.percentPosition) {
        x = (x / this.size.innerWidth) * 100 + '%';
        y = (y / this.size.innerHeight) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    // Obtém grupo de colunas
    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      const group = [];
      for (let i = 0; i <= this.cols - colSpan; i++) {
        group.push(Math.max.apply(Math, this.colYs.slice(i, i + colSpan)));
      }
      return group;
    },

    // Posiciona um item no grid
    _positionItem: function(item, x, y) {
      item.element.style.position = 'absolute';
      item.element.style.left = x;
      item.element.style.top = y;
    },

    // Finaliza o layout ajustando o contêiner
    _postLayout: function() {
      // Adiciona margem de segurança para garantir que todos os itens sejam visíveis
      const extraHeight = this.options.gutter; // Margem extra
      if (this.options.layoutMode === 'fitRows') {
        this.element.style.height = (this.maxY + this.options.gutter + extraHeight) + 'px';
      } else {
        this.element.style.height = (this.maxY + extraHeight) + 'px'; // Ajustado para masonry
      }
    }
  });
})(window);
// fim parte 5
// PortfolioGrid: Biblioteca para criar galerias dinâmicas - Parte 6 (Manipulação e Arrange)
(function(window) {
  'use strict';

  // Adiciona métodos ao protótipo
  Object.assign(PortfolioGrid.prototype, {
    // Método principal para configurar filtro, ordenação e layout
    arrange: function(options) {
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }
      this._updateSortData();
      const filterResult = this._filter();
      this._sort();
      this._hideReveal(filterResult);
      this.layout();
      // Opcional: emitir evento arrangeComplete (descomente se usar eventos)
      // this.emit('arrangeComplete', this.items.filter(item => item.isVisible));
    },

    // Converte elementos em itens do grid
    _itemize: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      return elements.map(function(elem, index) {
        if (!(elem instanceof HTMLElement)) return null;
        this.element.appendChild(elem);
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': this.items.length + index }
        };
      }, this).filter(item => item);
    },

    // Adiciona itens ao final do grid
    appended: function(elements) {
      const newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = this.items.concat(newItems);
        this._updateSortData();
        this.arrange();
      }
    },

    // Adiciona itens ao início do grid
    prepended: function(elements) {
      const newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = newItems.concat(this.items);
        this._updateSortData();
        this.arrange();
      }
    },

    // Remove itens do grid
    remove: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      const itemsToRemove = this.items.filter(item => elements.includes(item.element));
      if (itemsToRemove.length) {
        itemsToRemove.forEach(item => {
          Object.assign(item.element.style, this.options.hiddenStyle);
          setTimeout(() => {
            if (item.element.parentNode) {
              item.element.parentNode.removeChild(item.element);
            }
          }, parseFloat(this.options.transitionDuration) * 1000);
        });
        this.items = this.items.filter(item => !elements.includes(item.element));
        this._updateSortData();
        this.arrange();
      }
    }

    // Métodos opcionais (descomente se precisar)
    /*
    // Insere itens no grid
    insert: function(elements) {
      const newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = this.items.concat(newItems);
        this._updateSortData();
        this.arrange();
      }
    },

    // Marca elementos como fixos (stamp)
    stamp: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      this.stamps = this.stamps || [];
      this.stamps = this.stamps.concat(elements.map(el => ({ element: el })));
      this.arrange();
    },

    // Remove marcação de elementos fixos (unstamp)
    unstamp: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      this.stamps = this.stamps.filter(stamp => !elements.includes(stamp.element));
      this.arrange();
    },

    // Ignora itens sem removê-los
    ignore: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      this.items.forEach(item => {
        if (elements.includes(item.element)) {
          item.isIgnored = true;
          item.isVisible = false;
        }
      });
      this.arrange();
    },

    // Reativa itens ignorados
    unignore: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      this.items.forEach(item => {
        if (elements.includes(item.element)) {
          delete item.isIgnored;
          item.isVisible = true;
        }
      });
      this.arrange();
    },

    // Sistema de eventos
    on: function(eventName, callback) {
      this._events = this._events || {};
      this._events[eventName] = this._events[eventName] || [];
      this._events[eventName].push(callback);
    },
    emit: function(eventName, ...args) {
      if (this._events && this._events[eventName]) {
        this._events[eventName].forEach(callback => callback(...args));
      }
    }
    */
  });
})(window);
