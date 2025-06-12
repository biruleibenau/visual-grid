// PortfolioGrid: Biblioteca para criar galerias dinâmicas
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

// PortfolioGrid: Biblioteca para criar galerias dinâmicas
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
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: true
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
          isVisible: true
        };
      });
    },

    // Calcula tamanhos do contêiner e itens
    _getSize: function() {
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
          this.columnWidth = this.size.innerWidth;
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    },

    // Aplica o layout Masonry
    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

    // Redefine o estado do layout
    _resetLayout: function() {
      this._getSize(); // Atualiza tamanhos
      // Calcula número de colunas
      this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
      // Inicializa alturas das colunas
      this.colYs = new Array(this.cols).fill(0);
      this.maxY = 0;
    },

    // Posiciona os itens
    _layoutItems: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Calcula a posição de um item (inspirado em _getItemLayoutPosition do Isotope)
    _getItemLayoutPosition: function(item) {
      // Obtém tamanho do item
      var itemStyles = getComputedStyle(item.element);
      var itemWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
      var itemHeight = parseFloat(itemStyles.height) + parseFloat(itemStyles.marginTop) + parseFloat(itemStyles.marginBottom);

      // Calcula número de colunas ocupadas pelo item
      var colSpan = Math.min(Math.ceil(itemWidth / (this.columnWidth + this.options.gutter)), this.cols);

      // Encontra a coluna com menor altura
      var colGroup = this._getTopColGroup(colSpan);
      var minY = Math.min.apply(Math, colGroup);
      var colIndex = colGroup.indexOf(minY);

      // Calcula posição
      var x = colIndex * (this.columnWidth + this.options.gutter);
      var y = minY;

      // Atualiza alturas das colunas
      for (var i = colIndex; i < colIndex + colSpan; i++) {
        this.colYs[i] = y + itemHeight + this.options.gutter;
      }
      this.maxY = Math.max(this.maxY, y + itemHeight + this.options.gutter);

      // Converte para porcentagem se percentPosition for true
      if (this.options.percentPosition) {
        x = (x / this.size.innerWidth) * 100 + '%';
        y = (y / this.size.innerHeight) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    // Obtém grupo de colunas para posicionamento
    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
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
      this.element.style.height = (this.maxY - this.options.gutter) + 'px';
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);

// PortfolioGrid: Biblioteca para criar galerias dinâmicas
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
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: true,
      filter: '*' // '*' mostra todos os itens por padrão
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
      this.arrange();
    },

    // Coleta itens do grid com base em itemSelector
    _getItems: function() {
      var selector = this.options.itemSelector;
      var elements = this.element.querySelectorAll(selector);
      return Array.from(elements).map(function(elem) {
        return {
          element: elem,
          isVisible: true
        };
      });
    },

    // Calcula tamanhos do contêiner e itens
    _getSize: function() {
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
          this.columnWidth = this.size.innerWidth;
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    },

    // Método principal para configurar filtro e layout
    arrange: function(options) {
      // Atualiza opções, se fornecidas
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }

      // Aplica filtro
      this._filter();

      // Aplica layout
      this.layout();
    },

    // Filtra itens com base em options.filter
    _filter: function() {
      var filter = this.options.filter || '*';
      var filterFn = this._getFilterTest(filter);

      this.items.forEach(function(item) {
        item.isVisible = filterFn(item.element);
        item.element.style.display = item.isVisible ? '' : 'none';
      });
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

    // Aplica o layout Masonry
    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

    // Redefine o estado do layout
    _resetLayout: function() {
      this._getSize();
      this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
      this.colYs = new Array(this.cols).fill(0);
      this.maxY = 0;
    },

    // Posiciona os itens
    _layoutItems: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Calcula a posição de um item
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
        x = (x / this.size.innerWidth) * 100 + '%';
        y = (y / this.size.innerHeight) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    // Obtém grupo de colunas para posicionamento
    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
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
      this.element.style.height = (this.maxY - this.options.gutter) + 'px';
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);

// PortfolioGrid: Biblioteca para criar galerias dinâmicas
(function(window) {
  'use strict';

  // Construtor da biblioteca
  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    // Opções padrão
    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
      percentPosition: true,
      filter: '*',
      sortBy: 'original-order', // Ordem original por padrão
      sortAscending: true, // Ordem ascendente
      getSortData: { // Funções para extrair dados de ordenação
        name: function(elem) { return elem.textContent; },
        order: '[data-order]',
        random: function() { return Math.random(); }
      }
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
      this.element.style.position = 'relative';
      this.items = this._getItems();
      this._getSize();
      this._updateSortData();
      this.arrange();
    },

    // Coleta itens do grid
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

    // Calcula tamanhos do contêiner e itens
    _getSize: function() {
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width,
        innerWidth: rect.width - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height,
        innerHeight: rect.height - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth;
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    },

    // Método principal para configurar filtro, ordenação e layout
    arrange: function(options) {
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }
      this._updateSortData();
      this._filter();
      this._sort();
      this.layout();
    },

    // Filtra itens
    _filter: function() {
      var filter = this.options.filter || '*';
      var filterFn = this._getFilterTest(filter);

      this.items.forEach(function(item) {
        item.isVisible = filterFn(item.element);
        item.element.style.display = item.isVisible ? '' : 'none';
      });
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

    // Ordena itens
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
          if (valueA > valueB) return sortAscending ? 1 : -1;
          if (valueA < valueB) return sortAscending ? -1 : 1;
        }
        return 0;
      });
    },

    // Cria funções de ordenação
_getSorters: function() {
  var getSortData = this.options.getSortData;
  var sorters = {};

  for (var key in getSortData) {
    let sorter = getSortData[key];

    // Se for uma string: seletor ou atributo
    if (typeof sorter === 'string') {
      sorters[key] = function(elem) {
        // Primeiro tenta como seletor
        let el = elem.element.querySelector(sorter);
        if (el) {
          let text = el.textContent || el.innerText;
          return parseFloat(text) || text;
        }

        // Depois tenta como atributo (remove os colchetes [])
        let attrName = sorter.replace(/^\[|\]$/g, '');
        let attr = elem.element.getAttribute(attrName);
        return attr ? parseFloat(attr) || attr : '';
      };
    }

    // Se for uma função
    else if (typeof sorter === 'function') {
      sorters[key] = function(elem) {
        try {
          // Se a função não espera argumentos (ex: random)
          if (sorter.length === 0) {
            return sorter();
          }
          // Se espera o elemento
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

    // Atualiza dados de ordenação
    _updateSortData: function() {
      var sorters = this._getSorters();
      this.items.forEach(function(item) {
        for (var key in sorters) {
          item.sortData[key] = sorters[key](item);
        }
      });
    },

    // Aplica o layout Masonry
    layout: function() {
      this._resetLayout();
      this._layoutItems();
      this._postLayout();
    },

    // Redefine o estado do layout
    _resetLayout: function() {
      this._getSize();
      this.cols = Math.max(1, Math.floor(this.size.innerWidth / (this.columnWidth + this.options.gutter)));
      this.colYs = new Array(this.cols).fill(0);
      this.maxY = 0;
    },

    // Posiciona os itens
    _layoutItems: function() {
      this.items.forEach(function(item) {
        if (item.isVisible) {
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Calcula a posição de um item
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
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
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

    // Finaliza o layout
    _postLayout: function() {
      this.element.style.height = (this.maxY - this.options.gutter) + 'px';
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);

// PortfolioGrid: Biblioteca para criar galerias dinâmicas parte 6
// PortfolioGrid: Biblioteca para criar galerias dinâmicas
(function(window) {
  'use strict';

  // Construtor da biblioteca
  function PortfolioGrid(element, options) {
    this.element = typeof element === 'string' ? document.querySelector(element) : element;
    if (!this.element) {
      console.error('PortfolioGrid: Elemento não encontrado:', element);
      return;
    }

    // Opções padrão
    this.defaults = {
      itemSelector: '.grid-item',
      layoutMode: 'masonry',
      columnWidth: 'auto',
      gutter: 10,
      transitionDuration: '0.4s',
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
      this.element.style.position = 'relative';
      this.items = this._getItems();
      this._getSize();
      this._updateSortData();
      this.arrange();
    },

    // Coleta itens do grid
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

    // Calcula tamanhos do contêiner e itens
    _getSize: function() {
      var rect = this.element.getBoundingClientRect();
      var styles = getComputedStyle(this.element);
      this.size = {
        width: rect.width,
        innerWidth: rect.width - (parseFloat(styles.paddingLeft) + parseFloat(styles.paddingRight)),
        height: rect.height,
        innerHeight: rect.height - (parseFloat(styles.paddingTop) + parseFloat(styles.paddingBottom))
      };

      if (this.options.columnWidth === 'auto') {
        var firstItem = this.items[0];
        if (firstItem) {
          var itemStyles = getComputedStyle(firstItem.element);
          this.columnWidth = parseFloat(itemStyles.width) + parseFloat(itemStyles.marginLeft) + parseFloat(itemStyles.marginRight);
        } else {
          this.columnWidth = this.size.innerWidth;
        }
      } else {
        this.columnWidth = this.options.columnWidth;
      }
    },

    // Método principal para configurar filtro, ordenação e layout
    arrange: function(options) {
      if (options) {
        this.options = Object.assign({}, this.options, options);
      }
      this._updateSortData();
      var filterResult = this._filter();
      this._sort();
      this._hideReveal(filterResult);
      this.layout();
    },

    // Filtra itens
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
      this.hide(filterResult.needHide);
      this.reveal(filterResult.needReveal);
    },

    // Esconde itens com animação
    hide: function(items) {
      items.forEach(function(item) {
        item.element.style.transition = `opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
        Object.assign(item.element.style, this.options.hiddenStyle);
        item.element.style.display = 'none';
      }, this);
    },

    // Mostra itens com animação
    reveal: function(items) {
      items.forEach(function(item) {
        item.element.style.display = '';
        item.element.style.transition = `opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
        Object.assign(item.element.style, this.options.visibleStyle);
      }, this);
    },

    // Ordena itens
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
          if (valueA > valueB) return sortAscending ? 1 : -1;
          if (valueA < valueB) return sortAscending ? -1 : 1;
        }
        return 0;
      });
    },

    // Cria funções de ordenação
    _getSorters: function() {
      var getSortData = this.options.getSortData;
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
            // Para funções que não precisam de elemento (ex.: random), chamar diretamente
            if (sorter.length === 0) {
              return sorter();
            }
            // Para funções que esperam um elemento (ex.: name), passar elem.element
            return sorter(elem.element);
          };
        }
      }
      return sorters;
    },

    // Atualiza dados de ordenação
    _updateSortData: function() {
      var sorters = this._getSorters();
      this.items.forEach(function(item, index) {
        item.sortData['original-order'] = index;
        for (var key in sorters) {
          item.sortData[key] = sorters[key](item);
        }
      });
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
      var newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = this.items.concat(newItems);
        this._updateSortData();
        this.arrange();
      }
    },

    // Adiciona itens ao início do grid
    prepended: function(elements) {
      var newItems = this._itemize(elements);
      if (newItems.length) {
        this.items = newItems.concat(this.items);
        this._updateSortData();
        this.arrange();
      }
    },

    // Remove itens do grid
    remove: function(elements) {
      elements = Array.isArray(elements) ? elements : [elements];
      var itemsToRemove = this.items.filter(item => elements.includes(item.element));
      if (itemsToRemove.length) {
        itemsToRemove.forEach(item => {
          item.element.style.transition = `opacity ${this.options.transitionDuration}, transform ${this.options.transitionDuration}`;
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
    },

    // Aplica o layout
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
          var position = this._getItemLayoutPosition(item);
          this._positionItem(item, position.x, position.y);
        }
      }, this);
    },

    // Layout FitRows
    _layoutFitRows: function() {
      var x = 0;
      var maxRowHeight = 0;
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

          this._positionItem(item, x, this.rowY);
          x += itemWidth + this.options.gutter;
          maxRowHeight = Math.max(maxRowHeight, itemHeight);
          this.maxY = Math.max(this.maxY, this.rowY + itemHeight);
        }
      }, this);
      this.maxRowHeight = maxRowHeight;
    },

    // Calcula a posição de um item (para Masonry)
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
        x = (x / this.size.innerWidth) * 100 + '%';
        y = (y / this.size.innerHeight) * 100 + '%';
      } else {
        x += 'px';
        y += 'px';
      }

      return { x: x, y: y };
    },

    // Obtém grupo de colunas (para Masonry)
    _getTopColGroup: function(colSpan) {
      if (colSpan === 1) return this.colYs;
      var group = [];
      for (var i = 0; i <= this.cols - colSpan; i++) {
        group.push(Math.max.apply(Math, this.colYs.slice(i, i + colSpan)));
      }
      return group;
    },

    // Posiciona um item no grid com transição
    _positionItem: function(item, x, y) {
      item.element.style.position = 'absolute';
      item.element.style.transition = `left ${this.options.transitionDuration}, top ${this.options.transitionDuration}`;
      item.element.style.left = x;
      item.element.style.top = y;
    },

    // Finaliza o layout
    _postLayout: function() {
      this.element.style.height = (this.maxY - this.options.gutter) + 'px';
    }
  };

  // Expor a biblioteca globalmente
  window.PortfolioGrid = PortfolioGrid;
})(window);
