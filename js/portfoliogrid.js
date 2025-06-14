// PortfolioGrid: Biblioteca para criar galerias dinâmicas parte 1
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
    this.defaults = {
      itemSelector: '.grid-item', // Seletor para itens do grid
      layoutMode: 'masonry', // Modo de layout (masonry por padrão)
      columnWidth: 'auto', // Largura da coluna ('auto' usa o primeiro item)
      gutter: 10, // Espaço entre itens
      transitionDuration: '0.4s', // Duração das animações
      percentPosition: true // Posicionamento em porcentagem (relativo ao contêiner)
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

      // Calcula tamanhos
      this._getSize();

      // Aplica layout inicial
      this.layout();
    },

    // Coleta itens do grid com base em itemSelector
    _getItems: function() {
      var selector = this.options.itemSelector;
      var elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem) {
        return {
          element: elem,
          isVisible: true // Estado inicial: visível
        };
      });
    },

    // Calcula tamanhos do contêiner e itens (inspirado em getSize)
    _getSize: function() {
      // Tamanho do contêiner
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width,
        innerWidth: rect.width - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height,
        innerHeight: rect.height - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      // Largura da coluna
      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth; // Fallback
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    },

    // Método principal para aplicar layout (será expandido na Parte 2)
    layout: function() {
      // Placeholder para o layout Masonry
      console.log('Aplicando layout...');
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);
/// fim da parte 1

// PortfolioGrid: Biblioteca para criar galerias dinâmicas parte 2
(function(window) {
  'use strict';

  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows', // Mudei para fitRows como padrão, mais simples
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: false // Mudei para false para evitar problemas com CSS
    };

    this.options = Object.assign({}, this.defaults, options);
    this._init();
  }

  PortfolioGrid.prototype = {
    _init: function() {
      this.element.style.position = 'relative';
      this.items = this._getItems();
      if (this.items.length === 0) {
        console.warn('PortfolioGrid: Nenhum item encontrado com o seletor:', this.options.itemSelector);
        return;
      }
      this._getSize();
      this.layout();
    },

    _getItems: function() {
      var selector = this.options.itemSelector;
      var elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem) {
        return { element: elem, isVisible: true };
      });
    },

    _getSize: function() {
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width || 100, // Fallback para evitar divisão por zero
        innerWidth: (rect.width || 100) - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height || 100,
        innerHeight: (rect.height || 100) - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth / 2; // Fallback para metade da largura
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
      // Garante que columnWidth seja válido
      this.columnWidth = Math.max(this.columnWidth, 100);
    },

    layout: function() {
      if (this.options.layoutMode === 'fitRows') {
        this._layoutFitRows();
      } else {
        this._layoutMasonry();
      }
      this._postLayout();
    },

    _layoutMasonry: function() {
      this._resetLayout();
      this._layoutItems();
    },

    _layoutFitRows: function() {
      this._getSize();
      var x = 0, y = 0, rowHeight = 0;
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var itemStyles = getComputedStyle(item.element);
          var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
          var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

          if (x + itemWidth > this.size.innerWidth) {
            x = 0;
            y += rowHeight + this.options.gutter;
            rowHeight = 0;
          }
          this._positionItem(item, x, y);
          x += itemWidth + this.options.gutter;
          rowHeight = Math.max(rowHeight, itemHeight);
        }
      }, this);
      this.maxY = y + rowHeight;
    },

    _resetLayout: function() {
      this._getSize();
      this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
      this.colYs = new Array(this.cols).fill(0);
      this.maxY = 0;
    },

    _layoutItems: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    _getItemLayoutPosition: function(item) {
      var itemStyles = getComputedStyle(item.element);
      var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
      var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

      var colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + this.options.gutter)), this.cols);
      var colGroup = this._getTopColGroup(colSpan);
      var minY = Math.min.apply(Math, colGroup);
      var colIndex = colGroup.indexOf(minY);

      var x = colIndex * (this.columnWidth + this.options.gutter);
      var y = minY;

      for (var i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + this.options.gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + this.options.gutter);

      if (this.options.percentPosition) {
        x = (x / Math.max(this.size.innerWidth, 1)) * 100 + '%';
        y = (y / Math.max(this.size.innerHeight, 1)) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
        group.push(Math.max.apply(Math, this.colYs.slice(i, i + colSpan)));
      }
      return group;
    },

    _positionItem: function(item, x, y) {
      item.element.style.position = 'absolute';
      item.element.style.left = x;
      item.element.style.top = y;
      item.element.style.transition = `left ${this.options.transitionDuration}, top ${this.options.transitionDuration}`;
    },

    _postLayout: function() {
      this.element.style.height = (this.maxY || 0) + 'px';
    }
  };

  window.PortfolioGrid = PortfolioGrid;
})(window);
// fim da parte 2

// parte 3
(function(window) {
  'use strict';

  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows', // Padrão alterado para fitRows, mais simples
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: false, // Alterado para false para maior compatibilidade
      filter: '*',
      sortBy: 'original-order',
      sortAscending: true,
      getSortData: {
        name: function(elem) { return elem.textContent || ''; },
        order: '[data-order]',
        random: function() { return Math.random(); }
      }
    };

    this.options = Object.assign({}, this.defaults, options);
    this._init();
  }

  PortfolioGrid.prototype = {
    _init: function() {
      this.element.style.position = 'relative';
      this.items = this._getItems();
      if (this.items.length === 0) {
        console.warn('PortfolioGrid: Nenhum item encontrado com o seletor:', this.options.itemSelector);
        return;
      }
      this._getSize();
      this._updateSortData();
      this.arrange();
    },

    _getItems: function() {
      var selector = this.options.itemSelector;
      var elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem, index) {
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': index }
        };
      });
    },

    _getSize: function() {
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width || 100, // Fallback para evitar divisão por zero
        innerWidth: (rect.width || 100) - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height || 100,
        innerHeight: (rect.height || 100) - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth / 2; // Fallback para metade da largura
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
      this.columnWidth = Math.max(this.columnWidth, 100); // Garante valor mínimo
    },

    arrange: function(options) {
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }
      this._updateSortData();
      this._filter();
      this._sort();
      if (this.options.layoutMode === 'fitRows') {
        this._layoutFitRows();
      } else {
        this._layoutMasonry();
      }
      this._postLayout();
    },

    _filter: function() {
      var filter = this.options.filter || '*';
      var filterFn = this._getFilterTest(filter);
      this.items.forEach(function(item) {
        item.isVisible = filterFn(item.element);
        item.element.style.opacity = item.isVisible ? '1' : '0';
        item.element.style.visibility = item.isVisible ? 'visible' : 'hidden';
        item.element.style.transform = item.isVisible ? 'scale(1)' : 'scale(0.8)';
        item.element.style.transition = `opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
      }, this);
    },

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

    _sort: function() {
      var sortBy = this.options.sortBy;
      if (!sortBy || sortBy === 'none') return;
      var sortAscending = this.options.sortAscending;
      var sorters = this._getSorters();
      this.items.sort(function(a, b) {
        var keys = Array.isArray(sortBy) ? sortBy : [sortBy];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var sorter = sorters[key] || function() { return 0; };
          var valueA = a.sortData[key];
          var valueB = b.sortData[key];
          if (valueA === undefined || valueB === undefined) return 0;
          if (valueA > valueB) return sortAscending ? 1 : -1;
          if (valueA < valueB) return sortAscending ? -1 : 1;
        }
        return 0;
      });
    },

    _getSorters: function() {
      var getSortData = this.options.getSortData || {};
      var sorters = {};
      for (var key in getSortData) {
        let sorter = getSortData[key];
        if (typeof sorter === 'string') {
          sorters[key] = function(elem) {
            let el = elem.element.querySelector(sorter);
            if (el) {
              let text = el.textContent || el.innerText;
              return parseFloat(text) || text || '';
            }
            let attrName = sorter.replace(/^\[|\]$/g, '');
            let attr = elem.element.getAttribute(attrName);
            return attr ? parseFloat(attr) || attr : '';
          };
        } else if (typeof sorter === 'function') {
          sorters[key] = function(elem) {
            try {
              if (sorter.length === 0) {
                return sorter();
              }
              return sorter(elem.element);
            } catch (e) {
              console.error(`Erro ao executar sorter "${key}":`, e);
              return '';
            }
          };
        }
      }
      return sorters;
    },

    _updateSortData: function() {
      var sorters = this._getSorters();
      this.items.forEach(function(item) {
        for (var key in sorters) {
          item.sortData[key] = sorters[key](item);
        }
      });
    },

    _layoutMasonry: function() {
      this._resetLayout();
      this._layoutItems();
    },

    _layoutFitRows: function() {
      this._getSize();
      var x = 0, y = 0, rowHeight = 0;
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var itemStyles = getComputedStyle(item.element);
          var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
          var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

          if (x + itemWidth > this.size.innerWidth) {
            x = 0;
            y += rowHeight + this.options.gutter;
            rowHeight = 0;
          }
          this._positionItem(item, x, y);
          x += itemWidth + this.options.gutter;
          rowHeight = Math.max(rowHeight, itemHeight);
        }
      }, this);
      this.maxY = y + rowHeight;
    },

    _resetLayout: function() {
      this._getSize();
      this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
      this.colYs = new Array(this.cols).fill(0);
      this.maxY = 0;
    },

    _layoutItems: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    _getItemLayoutPosition: function(item) {
      var itemStyles = getComputedStyle(item.element);
      var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
      var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

      var colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + this.options.gutter)), this.cols);
      var colGroup = this._getTopColGroup(colSpan);
      var minY = Math.min.apply(Math, colGroup);
      var colIndex = colGroup.indexOf(minY);

      var x = colIndex * (this.columnWidth + this.options.gutter);
      var y = minY;

      for (var i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + this.options.gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + this.options.gutter);

      if (this.options.percentPosition) {
        x = (x / Math.max(this.size.innerWidth, 1)) * 100 + '%';
        y = (y / Math.max(this.size.innerHeight, 1)) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
        group.push(Math.max.apply(Math, this.colYs.slice(i, i + colSpan)));
      }
      return group;
    },

    _positionItem: function(item, x, y) {
      item.element.style.position = 'absolute';
      item.element.style.left = x;
      item.element.style.top = y;
      item.element.style.transition = `left ${this.options.transitionDuration}, top ${this.options.transitionDuration}, opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
    },

    _postLayout: function() {
      this.element.style.height = (this.maxY || 0) + 'px';
    }
  };

  window.PortfolioGrid = PortfolioGrid;
})(window);// fim da parte 3

/// parte 4
(function(window) {
  'use strict';

  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows',
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: false,
      filter: '*',
      sortBy: 'original-order',
      sortAscending: true,
      getSortData: null,
      hiddenStyle: { opacity: 0, transform: 'scale(0.5)' },
      visibleStyle: { opacity: 1, transform: 'scale(1)' }
    };

    this.options = Object.assign({}, this.defaults, options);
    this._init();
  }

  PortfolioGrid.prototype = {
    _init: function() {
      this.element.style.position = 'relative';
      this.items = this._getItems();
      if (this.items.length === 0) {
        console.warn('PortfolioGrid: Nenhum item encontrado com o seletor:', this.options.itemSelector);
        return;
      }
      this._applyTransitions(this.items);
      this._getSize();
      if (this.options.sortBy !== 'original-order' && this.options.getSortData) {
        this._updateSortData();
      }
      this.arrange();
      window.addEventListener('resize', () => this.arrange());
    },

    _applyTransitions: function(items) {
      items.forEach(function(item) {
        item.element.style.transition = `left ${this.options.transitionDuration}, top ${this.options.transitionDuration}, opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
      }, this);
    },

    _getItems: function() {
      var selector = this.options.itemSelector;
      var elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem, index) {
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': index }
        };
      });
    },

    _getSize: function() {
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width || 100,
        innerWidth: (rect.width || 100) - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height || 100,
        innerHeight: (rect.height || 100) - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };
      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth / 2;
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
      this.columnWidth = Math.max(this.columnWidth, 100);
    },

    arrange: function(options) {
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }
      if (this.options.sortBy !== 'original-order' && this.options.getSortData) {
        this._updateSortData();
      }
      var filterResult = this._filter();
      this._sort();
      this._hideReveal(filterResult);
      this.layout();
    },

    _filter: function() {
      var filter = this.options.filter || '*';
      var filterFn = this._getFilterTest(filter);
      var result = { needReveal: [], needHide: [] };
      this.items.forEach(function(item) {
        var shouldBeVisible = filterFn(item.element);
        if (shouldBeVisible && !item.isVisible) {
          result.needReveal.push(item);
        } else if (!shouldBeVisible && item.isVisible) {
          result.needHide.push(item);
        }
        item.isVisible = shouldBeVisible;
      });
      return result;
    },

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

    _hideReveal: function(filterResult) {
      this.hide(filterResult.needHide);
      setTimeout(() => {
        this.reveal(filterResult.needReveal);
      }, parseFloat(this.options.transitionDuration) * 1000 / 2);
    },

    hide: function(items) {
      items.forEach(function(item) {
        Object.assign(item.element.style, this.options.hiddenStyle);
        var onTransitionEnd = () => {
          if (item.isVisible === false) {
            item.element.style.display = 'none';
          }
          item.element.removeEventListener('transitionend', onTransitionEnd);
        };
        item.element.addEventListener('transitionend', onTransitionEnd);
      }, this);
    },

    reveal: function(items) {
      items.forEach(function(item) {
        Object.assign(item.element.style, this.options.hiddenStyle);
        item.element.style.display = '';
        requestAnimationFrame(() => {
          Object.assign(item.element.style, this.options.visibleStyle);
        });
      }, this);
    },

    _sort: function() {
      var sortBy = this.options.sortBy;
      if (!sortBy || sortBy === 'none') return;
      var sortAscending = this.options.sortAscending;
      var sorters = this._getSorters();
      if (!(sortBy in sorters) && sortBy !== 'original-order') {
        console.warn(`PortfolioGrid: sortBy "${sortBy}" inválido. Usando 'original-order'.`);
        this.options.sortBy = 'original-order';
      }
      this.items.sort(function(a, b) {
        var keys = Array.isArray(sortBy) ? sortBy : [sortBy];
        for (var i = 0; i < keys.length; i++) {
          var key = keys[i];
          var valueA = a.sortData[key];
          var valueB = b.sortData[key];
          if (valueA === undefined || valueB === undefined) return 0;
          if (valueA > valueB) return sortAscending ? 1 : -1;
          if (valueA < valueB) return sortAscending ? -1 : 1;
        }
        return 0;
      });
    },

    _getSorters: function() {
      var getSortData = this.options.getSortData || {};
      var sorters = {};
      for (var key in getSortData) {
        var sorter = getSortData[key];
        if (typeof sorter === 'string') {
          sorters[key] = function(elem) {
            var value = elem.element.querySelector(sorter) || elem.element.getAttribute(sorter.replace(/\[|\]/g, ''));
            return value ? parseFloat(value) || value : '';
          };
        } else if (typeof sorter === 'function') {
          sorters[key] = function(elem) {
            try {
              if (sorter.length === 0) {
                return sorter();
              }
              return sorter(elem.element);
            } catch (e) {
              console.error(`Erro ao executar sorter "${key}":`, e);
              return '';
            }
          };
        }
      }
      return sorters;
    },

    _updateSortData: function() {
      var sorters = this._getSorters();
      this.items.forEach(function(item) {
        item.sortData = item.sortData || {};
        item.sortData['original-order'] = this.items.indexOf(item);
        for (var key in sorters) {
          var value = sorters[key](item);
          if (value !== undefined && value !== null) {
            item.sortData[key] = value;
          }
        }
      }, this);
    },

    _itemize: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      var newItems = elements.map(function(elem, index) {
        if (!(elem instanceof HTMLElement)) return null;
        this.element.appendChild(elem);
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': this.items.length + index }
        };
      }, this).filter(item => item);
      this._applyTransitions(newItems);
      return newItems;
    },

    appended: function(elements) {
      var newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = this.items.concat(newItems);
        if (this.options.sortBy !== 'original-order' && this.options.getSortData) {
          this._updateSortData();
        }
        this.arrange();
      }
    },

    prepended: function(elements) {
      var newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = newItems.concat(this.items);
        if (this.options.sortBy !== 'original-order' && this.options.getSortData) {
          this._updateSortData();
        }
        this.arrange();
      }
    },

    remove: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      var itemsToRemove = this.items.filter(item => elements.includes(item.element));
      if (itemsToRemove.length) {
        this.hide(itemsToRemove);
        setTimeout(() => {
          itemsToRemove.forEach(item => {
            if (item.element.parentNode) {
              item.element.parentNode.removeChild(item.element);
            }
          });
          this.items = this.items.filter(item => !elements.includes(item.element));
          if (this.options.sortBy !== 'original-order' && this.options.getSortData) {
            this._updateSortData();
          }
          this.arrange();
        }, parseFloat(this.options.transitionDuration) * 1000);
      }
    },

    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

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

    _layoutItems: function() {
      if (this.options.layoutMode === 'masonry') {
        this._layoutMasonry();
      } else if (this.options.layoutMode === 'fitRows') {
        this._layoutFitRows();
      }
    },

    _layoutMasonry: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    _layoutFitRows: function() {
      var x = 0;
      var maxRowHeight = 0;
      this.rowY = 0;
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var itemStyles = getComputedStyle(item.element);
          var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
          var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

          if (x + itemWidth > this.size.innerWidth) {
            this.rowY += maxRowHeight + this.options.gutter;
            x = 0;
            maxRowHeight = 0;
          }

          var posX = this.options.percentPosition ? (x / Math.max(this.size.innerWidth, 1)) * 100 + '%' : x + 'px';
          var posY = this.options.percentPosition ? (this.rowY / Math.max(this.size.innerHeight, 1)) * 100 + '%' : this.rowY + 'px';
          this._positionItem(item, posX, posY);
          x += itemWidth + this.options.gutter;
          maxRowHeight = Math.max(maxRowHeight, itemHeight);
          this.maxY = this.rowY + maxRowHeight;
        }
      }, this);
      this.maxRowHeight = maxRowHeight;
    },

    _getItemLayoutPosition: function(item) {
      var itemStyles = getComputedStyle(item.element);
      var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
      var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

      var colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + this.options.gutter)), this.cols);
      var colGroup = this._getTopColGroup(colSpan);
      var minY = Math.min.apply(Math, colGroup);
      var colIndex = colGroup.indexOf(minY);

      var x = colIndex * (this.columnWidth + this.options.gutter);
      var y = minY;

      for (var i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + this.options.gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + this.options.gutter);

      if (this.options.percentPosition) {
        x = (x / Math.max(this.size.innerWidth, 1)) * 100 + '%';
        y = (y / Math.max(this.size.innerHeight, 1)) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
        group.push(Math.max.apply(Math, this.colYs.slice(i, i + colSpan)));
      }
      return group;
    },

    _positionItem: function(item, x, y) {
      item.element.style.position = 'absolute';
      item.element.style.left = x;
      item.element.style.top = y;
    },

    _postLayout: function() {
      if (this.options.layoutMode === 'fitRows') {
        this.element.style.height = (this.maxY + this.options.gutter) + 'px';
      } else {
        this.element.style.height = (this.maxY - this.options.gutter) + 'px';
      }
    }
  };

  window.PortfolioGrid = PortfolioGrid;
})(window);
//fim parte 4
