// PortfolioGrid: Biblioteca para criar galerias dinâmicas
(function(window) {
  'use strict';

  // Parte 1: Inicialização
  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.warn('PortfolioGrid: Elemento não encontrado, criando contêiner padrão:', element);
      this.element = document.createElement('div');
      document.body.appendChild(this.element);
    }

    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'fitRows',
      columnWidth: 200,
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: false,
      filter: '*',
      sortBy: 'name',
      sortAscending: true,
      getSortData: {
        name: function(elem) { return elem.textContent.toLowerCase(); },
        order: '[data-order]',
        random: function() { return Math.random(); }
      },
      hiddenStyle: { opacity: 0, transform: 'scale(0.5)' },
      visibleStyle: { opacity: 1, transform: 'scale(1)' }
    };

    this.options = Object.assign({}, this.defaults, options || {});
    if (!this.options.itemSelector || typeof this.options.itemSelector !== 'string') {
      console.warn('PortfolioGrid: itemSelector inválido, usando padrão:', this.defaults.itemSelector);
      this.options.itemSelector = this.defaults.itemSelector;
    }

    this._init();
  }

  PortfolioGrid.prototype = {
    _init: function() {
      this.element.style.position = 'relative';
      this.items = this._getItems();
      if (!this.items.length) {
        console.warn('PortfolioGrid: Nenhum item encontrado com o seletor:', this.options.itemSelector);
        return;
      }
      this.items.forEach(function(item) {
        item.element.style.transition = `left ${this.options.transitionDuration}, top ${this.options.transitionDuration}, opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
      }, this);
      this._getSize();
      this._updateSortData();
      this.arrange();
      this._debouncedArrange = this._debounce(() => this.arrange(), 100);
      window.addEventListener('resize', this._debouncedArrange);
    },

    _debounce: function(func, wait) {
      let timeout;
      return function() {
        clearTimeout(timeout);
        timeout = setTimeout(() => func.apply(this, arguments), wait);
      };
    }
  };

  // Parte 2: Itens e Tamanhos
  Object.assign(PortfolioGrid.prototype, {
    _getItems: function() {
      const selector = this.options.itemSelector;
      const elements = this.element.querySelectorAll(selector);
      const items = Array.from(elements).map(function(elem, index) {
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': index }
        };
      });
      if (!items.length) {
        console.warn('PortfolioGrid: Nenhum item encontrado com o seletor:', selector);
      }
      return items;
    },

    _getSize: function() {
      const rect = this.element.getBoundingClientRect();
      const styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width,
        innerWidth: rect.width - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height,
        innerHeight: rect.height - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };
      if (this.options.columnWidth === 'auto') {
        const firstItem = this.items[0];
        if (firstItem) {
          const itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.defaults.columnWidth;
        }
      } else if (typeof this.options.columnWidth === 'number' && !isNaN(this.options.columnWidth)) {
        this.columnWidth = this.options.columnWidth;
      } else {
        console.warn('PortfolioGrid: columnWidth inválido, usando padrão:', this.defaults.columnWidth);
        this.columnWidth = this.defaults.columnWidth;
      }
    }
  });

  // Parte 3: Filtragem e Animações
  Object.assign(PortfolioGrid.prototype, {
    _filter: function() {
      let filter = this.options.filter;
      if (!filter || (typeof filter !== 'string' && typeof filter !== 'function')) {
        console.warn('PortfolioGrid: Filtro inválido, usando padrão:', this.defaults.filter);
        filter = this.defaults.filter;
      }
      const filterFn = this._getFilterTest(filter);
      const result = { needReveal: [], needHide: [] };
      this.items.forEach(function(item) {
        const shouldBeVisible = filterFn(item.element);
        item.isVisible = shouldBeVisible;
        if (shouldBeVisible && !item.isVisible) {
          result.needReveal.push(item);
        } else if (!shouldBeVisible && item.isVisible) {
          result.needHide.push(item);
        }
        item.isVisible = shouldBeVisible;
      });
      if (!result.needReveal.length && !this.items.some(item => item.isVisible)) {
        console.warn('PortfolioGrid: Nenhum item corresponde ao filtro:', filter);
      }
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
        try {
          return element.matches(filter);
        } catch (e) {
          console.warn('PortfolioGrid: Filtro CSS inválido:', filter);
          return false;
        }
      };
    },

    _hideReveal: function(filterResult) {
      this.hide(filterResult.needHide);
      this.reveal(filterResult.needReveal);
    },

    hide: function(items) {
      const hiddenStyle = typeof this.options.hiddenStyle === 'object' ? this.options.hiddenStyle : this.defaults.hiddenStyle;
      let duration = parseFloat(this.options.transitionDuration) || parseFloat(this.defaults.transitionDuration);
      if (isNaN(duration)) {
        console.warn('PortfolioGrid: transitionDuration inválido, usando padrão:', this.defaults.transitionDuration);
        duration = parseFloat(this.defaults.transitionDuration);
      }
      items.forEach(function(item) {
        Object.assign(item.element.style, hiddenStyle);
        setTimeout(() => {
          if (!item.isVisible) {
            item.element.style.display = 'none';
          }
        }, duration * 1000);
      }, this);
    },

    reveal: function(items) {
      const visibleStyle = typeof this.options.visibleStyle === 'object' ? this.options.visibleStyle : this.defaults.visibleStyle;
      items.forEach(function(item) {
        item.element.style.display = '';
        Object.assign(item.element.style, visibleStyle);
      }, this);
    }
  });

  // Parte 4: Ordenação
  Object.assign(PortfolioGrid.prototype, {
    _sort: function() {
      let sortBy = this.options.sortBy;
      const validSortKeys = Object.keys(this.options.getSortData || {});
      if (!sortBy || sortBy === 'none' || (typeof sortBy !== 'string' && !Array.isArray(sortBy)) || 
          (typeof sortBy === 'string' && !validSortKeys.includes(sortBy)) ||
          (Array.isArray(sortBy) && !sortBy.every(key => validSortKeys.includes(key)))) {
        console.warn('PortfolioGrid: sortBy inválido, usando padrão:', this.defaults.sortBy);
        sortBy = this.defaults.sortBy;
      }
      const sortAscending = typeof this.options.sortAscending === 'boolean' ? this.options.sortAscending : this.defaults.sortAscending;
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

    _getSorters: function() {
      const getSortData = typeof this.options.getSortData === 'object' ? this.options.getSortData : this.defaults.getSortData;
      const sorters = {};
      for (let key in getSortData) {
        const sorter = getSortData[key];
        if (typeof sorter === 'string') {
          sorters[key] = function(elem) {
            try {
              const value = elem.element.querySelector(sorter) || elem.element.getAttribute(sorter.replace(/\[|\]/g, ''));
              return value ? parseFloat(value) || value : '';
            } catch (e) {
              console.warn('PortfolioGrid: Seletor de ordenação inválido para', key, ':', sorter);
              return '';
            }
          };
        } else if (typeof sorter === 'function') {
          sorters[key] = function(elem) {
            if (sorter.length === 0) {
              return sorter();
            }
            return sorter(elem.element);
          };
        } else {
          console.warn('PortfolioGrid: Função de ordenação inválida para', key, ', ignorando.');
        }
      }
      return sorters;
    },

    _updateSortData: function() {
      const sorters = this._getSorters();
      this.items.forEach(function(item, index) {
        item.sortData['original-order'] = index;
        for (let key in sorters) {
          item.sortData[key] = sorters[key](item);
        }
      });
    },

    shuffle: function() {
      this.items.forEach(function(item) {
        item.sortData['random'] = Math.random();
      });
      this.arrange({ sortBy: 'random' });
    }
  });

  // Parte 5: Layouts
  Object.assign(PortfolioGrid.prototype, {
    // Modos de layout válidos
    _validModes: ['masonry', 'fitRows'],

    // Método principal para aplicar layout
    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

    // Redefine o estado do layout
    _resetLayout: function() {
      this._getSize();
      const layoutMode = this._validModes.includes(this.options.layoutMode) ? this.options.layoutMode : this.defaults.layoutMode;
      if (this.options.layoutMode !== layoutMode) {
        console.warn('PortfolioGrid: layoutMode inválido, usando padrão:', this.defaults.layoutMode);
      }
      const gutter = typeof this.options.gutter === 'number' && !isNaN(this.options.gutter) ? this.options.gutter : this.defaults.gutter;
      if (this.options.gutter !== gutter) {
        console.warn('PortfolioGrid: gutter inválido, usando padrão:', this.defaults.gutter);
      }
      const percentPosition = typeof this.options.percentPosition === 'boolean' ? this.options.percentPosition : this.defaults.percentPosition;
      if (this.options.percentPosition !== percentPosition) {
        console.warn('PortfolioGrid: percentPosition inválido, usando padrão:', this.defaults.percentPosition);
      }

      if (layoutMode === 'masonry') {
        this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + gutter)));
        this.colYs = new Array(this.cols).fill(0);
      } else if (layoutMode === 'fitRows') {
        this.rowY = 0;
        this.maxRowHeight = 0;
      }
      this.maxY = 0;
    },

    // Posiciona os itens
    _layoutItems: function() {
      const layoutMode = this._validModes.includes(this.options.layoutMode) ? this.options.layoutMode : this.defaults.layoutMode;
      if (layoutMode === 'masonry') {
        this._layoutMasonry();
      } else {
        this._layoutFitRows();
      }
    },

    // Layout Masonry
    _layoutMasonry: function() {
      const gutter = typeof this.options.gutter === 'number' && !isNaN(this.options.gutter) ? this.options.gutter : this.defaults.gutter;
      this.items.forEach(function(item) {
        if (item.isVisible) {
          const position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Layout FitRows
    _layoutFitRows: function() {
      const gutter = typeof this.options.gutter === 'number' && !isNaN(this.options.gutter) ? this.options.gutter : this.defaults.gutter;
      const percentPosition = typeof this.options.percentPosition === 'boolean' ? this.options.percentPosition : this.defaults.percentPosition;
      let x = 0;
      let maxRowHeight = 0;
      this.rowY = 0;

      this.items.forEach(function(item) {
        if (item.isVisible) {
          const itemStyles = getComputedStyle(item.element);
          let itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft || 0) + parseFloat(itemStyles.marginRight || 0);
          let itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop || 0) + parseFloat(itemStyles.marginBottom || 0);

          // Fallback para tamanhos inválidos
          if (isNaN(itemWidth) || itemWidth <= 0) {
            console.warn('PortfolioGrid: Item com largura inválida, usando columnWidth:', this.columnWidth);
            itemWidth = this.columnWidth;
          }
          if (isNaN(itemHeight) || itemHeight <= 0) {
            console.warn('PortfolioGrid: Item com altura inválida, usando padrão:', this.columnWidth);
            itemHeight = this.columnWidth;
          }

          if (x + itemWidth > this.size.innerWidth) {
            this.rowY += maxRowHeight + gutter;
            x = 0;
            maxRowHeight = 0;
          }

          const posX = percentPosition ? (x / this.size.innerWidth) * 100 + '%' : x + 'px';
          const posY = percentPosition ? (this.rowY / this.size.innerHeight) * 100 + '%' : this.rowY + 'px';
          this._positionItem(item, posX, posY);
          x += itemWidth + gutter;
          maxRowHeight = Math.max(maxRowHeight, itemHeight);
          this.maxY = this.rowY + maxRowHeight;
        }
      }, this);
      this.maxRowHeight = maxRowHeight;
    },

    // Calcula a posição de um item (para Masonry)
    _getItemLayoutPosition: function(item) {
      const gutter = typeof this.options.gutter === 'number' && !isNaN(this.options.gutter) ? this.options.gutter : this.defaults.gutter;
      const percentPosition = typeof this.options.percentPosition === 'boolean' ? this.options.percentPosition : this.defaults.percentPosition;
      const itemStyles = getComputedStyle(item.element);
      let itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft || 0) + parseFloat(itemStyles.marginRight || 0);
      let itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop || 0) + parseFloat(itemStyles.marginBottom || 0);

      // Fallback para tamanhos inválidos
      if (isNaN(itemWidth) || itemWidth <= 0) {
        console.warn('PortfolioGrid: Item com largura inválida, usando columnWidth:', this.columnWidth);
        itemWidth = this.columnWidth;
      }
      if (isNaN(itemHeight) || itemHeight <= 0) {
        console.warn('PortfolioGrid: Item com altura inválida, usando padrão:', this.columnWidth);
        itemHeight = this.columnWidth;
      }

      const colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + gutter)), this.cols);
      const colGroup = this._getTopColGroup(colSpan);
      const minY = Math.min.apply(Math, colGroup);
      const colIndex = colGroup.indexOf(minY);

      let x = colIndex * (this.columnWidth + gutter);
      let y = minY;

      for (let i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + gutter);

      if (percentPosition) {
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
      const gutter = typeof this.options.gutter === 'number' && !isNaN(this.options.gutter) ? this.options.gutter : this.defaults.gutter;
      const extraHeight = gutter;
      if (this.options.layoutMode === 'fitRows') {
        this.element.style.height = (this.maxY + gutter + extraHeight) + 'px';
      } else {
        this.element.style.height = (this.maxY + extraHeight) + 'px';
      }
    }
  });

  // Parte 6: Manipulação e Arrange
  Object.assign(PortfolioGrid.prototype, {
    arrange: function(options) {
      if (options) {
        const validatedOptions = {};
        const validKeys = Object.keys(this.defaults);
        for (let key in options) {
          if (validKeys.includes(key)) {
            validatedOptions[key] = this._validateOption(key, options[key]);
          } else {
            console.warn('PortfolioGrid: Opção desconhecida ignorada:', key);
          }
        }
        this.options = Object.assign({}, this.options, validatedOptions);
      }
      this._updateSortData();
      const filterResult = this._filter();
      this._sort();
      this._hideReveal(filterResult);
      this.layout();
    },

    _validateOption: function(key, value) {
      const defaults = this.defaults;
      switch (key) {
        case 'filter':
          return (typeof value === 'string' || typeof value === 'function') ? value : defaults.filter;
        case 'sortBy':
          const validSortKeys = Object.keys(this.options.getSortData || {});
          return (typeof value === 'string' && validSortKeys.includes(value)) ||
                 (Array.isArray(value) && value.every(v => validSortKeys.includes(v))) ? value : defaults.sortBy;
        case 'layoutMode':
          return ['masonry', 'fitRows'].includes(value) ? value : defaults.layoutMode;
        case 'columnWidth':
          return (value === 'auto' || (typeof value === 'number' && !isNaN(value))) ? value : defaults.columnWidth;
        case 'gutter':
          return (typeof value === 'number' && !isNaN(value)) ? value : defaults.gutter;
        case 'transitionDuration':
          return (typeof value === 'string' && !isNaN(parseFloat(value))) ? value : defaults.transitionDuration;
        case 'percentPosition':
          return typeof value === 'boolean' ? value : defaults.percentPosition;
        case 'sortAscending':
          return typeof value === 'boolean' ? value : defaults.sortAscending;
        case 'getSortData':
          return typeof value === 'object' && value !== null ? value : defaults.getSortData;
        case 'hiddenStyle':
        case 'visibleStyle':
          return typeof value === 'object' && value !== null ? value : defaults[key];
        default:
          return value;
      }
    },

    _itemize: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      const newItems = elements.map(function(elem, index) {
        if (!(elem instanceof HTMLElement)) {
          console.warn('PortfolioGrid: Elemento inválido ignorado:', elem);
          return null;
        }
        if (this.items.some(item => item.element === elem)) {
          console.warn('PortfolioGrid: Elemento já está no grid, ignorado:', elem);
          return null;
        }
        this.element.appendChild(elem);
        return {
          element: elem,
          isVisible: true,
          sortData: { 'original-order': this.items.length + index }
        };
      }, this).filter(item => item);

      if (!newItems.length) {
        console.warn('PortfolioGrid: Nenhum item válido para adicionar.');
      }
      return newItems;
    },

    appended: function(elements) {
      const newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = this.items.concat(newItems);
        this._updateSortData();
        this.arrange();
      }
    },

    prepended: function(elements) {
      const newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = newItems.concat(this.items);
        this._updateSortData();
        this.arrange();
      }
    },

    remove: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      const validElements = elements.filter(el => el instanceof HTMLElement);
      if (!validElements.length) {
        console.warn('PortfolioGrid: Nenhum elemento válido para remover.');
        return;
      }

      const itemsToRemove = this.items.filter(item => validElements.includes(item.element));
      if (itemsToRemove.length) {
        const duration = parseFloat(this.options.transitionDuration) || parseFloat(this.defaults.transitionDuration);
        const hiddenStyle = typeof this.options.hiddenStyle === 'object' ? this.options.hiddenStyle : this.defaults.hiddenStyle;

        itemsToRemove.forEach(item => {
          Object.assign(item.element.style, hiddenStyle);
          setTimeout(() => {
            if (item.element.parentNode) {
              item.element.parentNode.removeChild(item.element);
            }
          }, duration * 1000);
        });
        this.items = this.items.filter(item => !validElements.includes(item.element));
        this._updateSortData();
        this.arrange();
      } else {
        console.warn('PortfolioGrid: Nenhum item correspondente encontrado para remover.');
      }
    }
  });

  // Exporta PortfolioGrid pro escopo global
  window.PortfolioGrid = PortfolioGrid;
})(window);
