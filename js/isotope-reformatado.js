// Parte 1: Cabeçalho e jQuery Bridget
// -----------------------------------
// Isotope v3.0.6 - Reformatação para estudo
// Licenciado sob GPLv3 para uso open source ou Licença Comercial do Isotope
// https://isotope.metafizzy.co
// Copyright 2010-2018 Metafizzy
// Reformatação com comentários em português para o seu portfólio com layout 'fitRows' e filtragem.

(function (window) {
  "use strict";

  // -----------------------------------
  // Módulo: jQuery Bridget
  // Integra o Isotope como plugin jQuery, permitindo chamadas como $('.grid').isotope().
  // Essencial para o seu portfólio, que usa jQuery.
  // -----------------------------------
  function jQueryBridget(namespace, PluginClass, $) {
    // Verifica se jQuery está disponível
    if (!$) return;

    // Adiciona método para configurar opções
    PluginClass.prototype.option = function (opts) {
      if ($.isPlainObject(opts)) {
        this.options = $.extend(true, this.options, opts);
      }
    };

    // Define o método jQuery (ex.: $.fn.isotope)
    $.fn[namespace] = function (arg0, ...args) {
      if (typeof arg0 === "string") {
        // Chama um método (ex.: $('.grid').isotope('layout'))
        let returnValue;
        this.each(function (i, elem) {
          const instance = $.data(elem, namespace);
          if (!instance) {
            console.error(`${namespace} not initialized. Cannot call method: ${arg0}`);
            return;
          }
          const method = instance[arg0];
          if (!method || arg0.charAt(0) === "_") {
            console.error(`Invalid method: ${arg0}`);
            return;
          }
          const result = method.apply(instance, args);
          if (returnValue === undefined) returnValue = result;
        });
        return returnValue !== undefined ? returnValue : this;
      }
      // Inicializa o plugin com opções
      this.each(function (i, elem) {
        let instance = $.data(elem, namespace);
        if (instance) {
          instance.option(arg0);
          instance._init();
        } else {
          instance = new PluginClass(elem, arg0);
          $.data(elem, namespace, instance);
        }
      });
      return this;
    };
  }

  // Registra o plugin jQuery
  if (typeof window.jQuery !== "undefined") {
    jQueryBridget("isotope", window.Isotope, window.jQuery);
  }

  // Fim da Parte 1
  // Cole este trecho no início do seu Gist: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 2 abaixo.
})();
// Parte 2: EvEmitter
// -----------------------------------
// Módulo: EvEmitter
// Sistema de eventos para gerenciar listeners e emitir eventos no Isotope.
// Usado para notificar quando ações ocorrem, como conclusão do layout ou filtragem no seu portfólio.
// -----------------------------------

(function () {
  // Define a classe EvEmitter
  function EvEmitter() {}

  EvEmitter.prototype = {
    // Adiciona um listener para um evento
    on: function (eventName, listener) {
      if (!eventName || !listener) return this;
      this._events = this._events || {};
      const listeners = (this._events[eventName] = this._events[eventName] || []);
      if (!listeners.includes(listener)) {
        listeners.push(listener);
      }
      return this;
      // Dica: No seu portfólio, use 'on' para capturar eventos como 'arrangeComplete'
      // Exemplo: isotope.on('arrangeComplete', () => console.log('Layout concluído'));
    },

    // Adiciona um listener que será chamado apenas uma vez
    once: function (eventName, listener) {
      if (!eventName || !listener) return this;
      this.on(eventName, listener);
      this._onceEvents = this._onceEvents || {};
      const onceListeners = (this._onceEvents[eventName] = this._onceEvents[eventName] || {});
      onceListeners[listener] = true;
      return this;
    },

    // Remove um listener de um evento
    off: function (eventName, listener) {
      const listeners = this._events && this._events[eventName];
      if (!listeners || !listeners.length) return this;
      const index = listeners.indexOf(listener);
      if (index !== -1) {
        listeners.splice(index, 1);
      }
      return this;
    },

    // Emite um evento, chamando todos os listeners associados
    emitEvent: function (eventName, args) {
      const listeners = this._events && this._events[eventName];
      if (!listeners || !listeners.length) return this;
      const listenersCopy = listeners.slice();
      const onceListeners = this._onceEvents && this._onceEvents[eventName];
      for (const listener of listenersCopy) {
        if (onceListeners && onceListeners[listener]) {
          this.off(eventName, listener);
          delete onceListeners[listener];
        }
        listener.apply(this, args || []);
      }
      return this;
    },

    // Remove todos os listeners
    allOff: function () {
      delete this._events;
      delete this._onceEvents;
      return this;
    },
  };

  // Registra o EvEmitter globalmente
  window.EvEmitter = EvEmitter;

  // Fim da Parte 2
  // Cole este trecho no seu Gist após a Parte 1: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 3 abaixo.
})();
// Parte 3: getSize
// -----------------------------------
// Módulo: getSize
// Calcula as dimensões de elementos HTML (largura, altura, margens, etc.).
// Usado no seu portfólio para determinar o tamanho dos itens no layout 'fitRows'.
// -----------------------------------

(function () {
  // Define a função getSize
  function getSize(element) {
    if (!element) return {};
    // Obtém o estilo computado do elemento
    const style = window.getComputedStyle(element);
    // Cria o objeto com dimensões
    const size = {
      width: parseFloat(style.width) || 0,
      height: parseFloat(style.height) || 0,
      outerWidth: element.offsetWidth || 0,
      outerHeight: element.offsetHeight || 0,
      margin: {
        top: parseFloat(style.marginTop) || 0,
        right: parseFloat(style.marginRight) || 0,
        bottom: parseFloat(style.marginBottom) || 0,
        left: parseFloat(style.marginLeft) || 0,
      },
      padding: {
        top: parseFloat(style.paddingTop) || 0,
        right: parseFloat(style.paddingRight) || 0,
        bottom: parseFloat(style.paddingBottom) || 0,
        left: parseFloat(style.paddingLeft) || 0,
      },
    };
    // Calcula dimensões internas (sem margens)
    size.innerWidth = size.outerWidth - size.margin.left - size.margin.right;
    size.innerHeight = size.outerHeight - size.margin.top - size.margin.bottom;
    // Calcula dimensões com bordas e padding
    size.borderBoxWidth = size.outerWidth - size.padding.left - size.padding.right;
    size.borderBoxHeight = size.outerHeight - size.padding.top - size.padding.bottom;
    return size;
    // Ponto de extensão: Adicione cálculos personalizados
    // Exemplo: size.customWidth = size.innerWidth + 10; // Adicionar margem extra
  }

  // Registra o getSize globalmente
  window.getSize = getSize;

  // Fim da Parte 3
  // Cole este trecho no seu Gist após a Parte 2: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 4 abaixo.
})();
// Parte 4: matchesSelector
// -----------------------------------
// Módulo: matchesSelector
// Verifica se um elemento corresponde a um seletor CSS.
// Usado na filtragem do seu portfólio (ex.: '[data-category="web"]').
// -----------------------------------

(function () {
  // Define a função matchesSelector
  const matchesSelector = (function () {
    const proto = Element.prototype;
    // Usa o método nativo, se disponível
    if (proto.matches) return proto.matches;
    if (proto.webkitMatchesSelector) return proto.webkitMatchesSelector;
    if (proto.mozMatchesSelector) return proto.mozMatchesSelector;
    if (proto.msMatchesSelector) return proto.msMatchesSelector;
    if (proto.oMatchesSelector) return proto.oMatchesSelector;
    // Fallback para navegadores antigos
    return function (elem, selector) {
      const nodes = elem.parentNode.querySelectorAll(selector);
      return Array.prototype.indexOf.call(nodes, elem) !== -1;
    };
  })();

  // Registra o matchesSelector globalmente
  window.matchesSelector = matchesSelector;

  // Fim da Parte 4
  // Cole este trecho no seu Gist após a Parte 3: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 5 abaixo.
})();
// Parte 5: fizzyUIUtils
// -----------------------------------
// Módulo: fizzyUIUtils
// Funções utilitárias para o Isotope, como manipulação de objetos e eventos.
// Usado em várias partes, incluindo o layout 'fitRows' do seu portfólio.
// -----------------------------------

(function () {
  const utils = {};

  // Estende objetos (similar a Object.assign)
  utils.extend = function (a, b) {
    for (let prop in b) {
      if (b.hasOwnProperty(prop)) {
        a[prop] = b[prop];
      }
    }
    return a;
  };

  // Limita a frequência de chamadas de uma função
  utils.debounce = function (func, wait, immediate) {
    let timeout;
    return function () {
      const context = this, args = arguments;
      const later = function () {
        timeout = null;
        if (!immediate) func.apply(context, args);
      };
      const callNow = immediate && !timeout;
      clearTimeout(timeout);
      timeout = setTimeout(later, wait);
      if (callNow) func.apply(context, args);
    };
  };

  // Converte string para número, se possível
  utils.toNumber = function (val) {
    return isNaN(val) ? 0 : Number(val);
  };

  // Obtém valor de estilo CSS
  utils.getStyleValue = function (elem, prop) {
    return parseFloat(window.getComputedStyle(elem)[prop]) || 0;
  };

  // Verifica se é um objeto simples
  utils.isPlainObject = function (obj) {
    return obj && typeof obj === "object" && Object.getPrototypeOf(obj) === Object.prototype;
  };

  // Registra o utils globalmente
  window.fizzyUIUtils = utils;

  // Fim da Parte 5
  // Cole este trecho no seu Gist após a Parte 4: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 6 abaixo.
})();
// Parte 6: Outlayer
// -----------------------------------
// Módulo: Outlayer
// Classe base para layouts dinâmicos, herdada pelo Isotope.
// Gerencia posicionamento e transições, usado no 'fitRows' do seu portfólio.
// -----------------------------------

(function (window, EvEmitter, getSize, utils) {
  // Define a classe Outlayer
  function Outlayer(element, options) {
    this.element = element;
    this.options = utils.extend({}, this.constructor.defaults);
    this.option(options);
    this.items = [];
    this._init();
  }

  Outlayer.defaults = {
    containerStyle: { position: "relative" },
    initLayout: true,
    percentPosition: false,
  };

  const proto = Outlayer.prototype;
  utils.extend(proto, EvEmitter.prototype);

  // Configura opções
  proto.option = function (opts) {
    utils.extend(this.options, opts);
  };

  // Inicializa o layout
  proto._init = function () {
    if (!this._isLayoutInited && this.options.initLayout) {
      this.layout();
    }
    this._isLayoutInited = true;
  };

  // Aplica o layout
  proto.layout = function () {
    if (!this.items.length) return;
    this._resetLayout();
    this._manageStamps();
    this.layoutItems(this.items, true);
    this._emitCompleteOnItems("layout", this.items);
    this._isLayoutInited = true;
    // Dica: No seu portfólio, 'layout' é chamado após filtragem
  };

  // Reseta o layout
  proto._resetLayout = function () {
    this.getSize();
    this._getMeasurement("columnWidth", "outerWidth");
    this._getMeasurement("gutter", "outerWidth");
    const size = this.size;
    this.innerWidth = size.innerWidth;
    this.innerHeight = size.innerHeight;
  };

  // Obtém dimensões do elemento
  proto.getSize = function () {
    this.size = getSize(this.element);
  };

  // Obtém medições (ex.: columnWidth)
  proto._getMeasurement = function (measurement, property) {
    const option = this.options[measurement];
    let value;
    if (!option) {
      value = this.size[property];
    } else if (typeof option === "string") {
      const elem = this.element.querySelector(option);
      value = elem ? getSize(elem)[property] : 0;
    } else {
      value = option;
    }
    this[measurement] = value;
  };

  // Gerencia stamps (elementos fixos)
  proto._manageStamps = function () {
    this.stamps = this.stamps || [];
    this.stamps.forEach(stamp => {
      // Simulação de stamp (não usado no seu portfólio)
    });
  };

  // Posiciona itens
  proto.layoutItems = function (items, isInstant) {
    items.forEach(item => {
      this._layoutItem(item, isInstant);
    });
    // Ponto de extensão: Adicione animações personalizadas
    // Exemplo: items.forEach(item => item.element.style.transition = 'all 0.5s');
  };

  // Posiciona um item
  proto._layoutItem = function (item, isInstant) {
    item.getSize();
    const position = this._getItemLayoutPosition(item);
    item.goTo(position.x, position.y, isInstant);
  };

  // Obtém posição do item (sobrescrito por modos de layout)
  proto._getItemLayoutPosition = function () {
    return { x: 0, y: 0 };
  };

  // Move o item para a posição
  proto.goTo = function (x, y) {
    // Implementado nos itens
  };

  // Emite evento de conclusão
  proto._emitCompleteOnItems = function (eventName, items) {
    items.forEach(item => {
      item.emitEvent(eventName + "Complete", [this]);
    });
    this.emitEvent(eventName + "Complete", [this]);
  };

  // Cria uma nova instância
  Outlayer.create = function (namespace, options) {
    function Layout(element, opts) {
      Outlayer.call(this, element, opts);
    }
    Layout.prototype = Object.create(Outlayer.prototype);
    Layout.prototype.constructor = Layout;
    Layout.defaults = utils.extend({}, Outlayer.defaults, options);
    return Layout;
  };

  // Registra o Outlayer globalmente
  window.Outlayer = Outlayer;

  // Fim da Parte 6
  // Cole este trecho no seu Gist após a Parte 5: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 7 quando pronta.
})();
// Parte 7: Item
// -----------------------------------
// Módulo: Item
// Gerencia itens individuais do Isotope, como os '.grid-item' do seu portfólio.
// Controla posicionamento e transições durante o layout 'fitRows' e filtragem.
// -----------------------------------

(function (window, Outlayer, getSize) {
  // Define a classe Item
  function Item(element, layout) {
    this.element = element;
    this.layout = layout;
    this.position = { x: 0, y: 0 };
    this._create();
  }

  const proto = Item.prototype = Object.create(Outlayer.prototype);
  proto.constructor = Item;

  // Inicializa o item
  proto._create = function () {
    this.id = this.layout.itemGUID++;
    this._reset();
    this.getSize();
  };

  // Reseta o estado do item
  proto._reset = function () {
    this.isHidden = false;
    this.css({ display: "" });
  };

  // Obtém dimensões do item
  proto.getSize = function () {
    this.size = getSize(this.element);
  };

  // Aplica estilos CSS
  proto.css = function (style) {
    const elemStyle = this.element.style;
    for (let prop in style) {
      elemStyle[prop] = style[prop];
    }
  };

  // Move o item para uma posição
  proto.goTo = function (x, y, isInstant) {
    this.position.x = x;
    this.position.y = y;
    const style = {
      position: "absolute",
      left: this.layout.options.percentPosition ? (x / this.layout.size.innerWidth * 100) + "%" : x + "px",
      top: this.layout.options.percentPosition ? (y / this.layout.size.innerHeight * 100) + "%" : y + "px",
    };
    if (isInstant) {
      this.css(style);
    } else {
      this.css({ transition: "all 0.2s" });
      this.css(style);
    }
    // Ponto de extensão: Adicione animações personalizadas
    // Exemplo: this.css({ transform: `translate(${x}px, ${y}px) scale(1.1)` });
  };

  // Esconde o item
  proto.hide = function () {
    this.isHidden = true;
    this.css({ display: "none" });
  };

  // Revela o item
  proto.reveal = function () {
    this.isHidden = false;
    this.css({ display: "" });
    this.layout.positionItem(this, this.position);
  };

  // Registra o Item globalmente
  window.Item = Item;

  // Fim da Parte 7
  // Cole este trecho no seu Gist após a Parte 6: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 8 abaixo.
})();
// Parte 8: LayoutMode e fitRows
// -----------------------------------
// Módulo: LayoutMode e fitRows
// Define a base para modos de layout e implementa 'fitRows', usado no seu portfólio
// para organizar itens em linhas horizontais (3 por linha no desktop, 2 em tablets, 1 no mobile).
// -----------------------------------

(function (window, Outlayer, utils) {
  // Define a classe LayoutMode
  function LayoutMode(isotope) {
    this.isotope = isotope;
    this._resetLayout();
  }

  LayoutMode.prototype = {
    _resetLayout: function () {},
    _getItemLayoutPosition: function () { return { x: 0, y: 0 }; },
    _getContainerSize: function () { return {}; },
  };

  // Cria um novo modo de layout
  LayoutMode.create = function (modeName, options) {
    function Mode(isotope) {
      LayoutMode.call(this, isotope);
    }
    Mode.prototype = Object.create(LayoutMode.prototype);
    Mode.prototype.constructor = Mode;
    Mode.options = options || {};
    Mode.prototype.modeName = modeName;
    Outlayer.LayoutMode.modes[modeName] = Mode;
    return Mode;
  };

  Outlayer.LayoutMode = { modes: {} };

  // Define o modo fitRows
  const FitRows = Outlayer.LayoutMode.create("fitRows", {
    horizontalAlignment: 0, // Alinhamento horizontal (0 = esquerda)
  });

  const fitRowsProto = FitRows.prototype;

  fitRowsProto._resetLayout = function () {
    this.x = 0;
    this.y = 0;
    this.maxY = 0;
    this._getMeasurement("gutter", "outerWidth");
    // Dica: No seu portfólio, use CSS 'body { overflow-y: auto; }' para evitar deslocamentos
  };

  fitRowsProto._getItemLayoutPosition = function (item) {
    item.getSize();
    const itemWidth = item.size.outerWidth + this.gutter;
    const containerWidth = this.isotope.size.innerWidth + this.gutter;
    if (this.x !== 0 && this.x + itemWidth > containerWidth) {
      this.x = 0;
      this.y = this.maxY;
    }
    const position = { x: this.x, y: this.y };
    this.maxY = Math.max(this.maxY, this.y + item.size.outerHeight);
    this.x += itemWidth;
    // Ponto de extensão: Adicione alinhamento personalizado
    // Exemplo: position.x += (containerWidth - item.size.outerWidth) * 0.5; // Centralizar
    return position;
  };

  fitRowsProto._getContainerSize = function () {
    return { height: this.maxY };
    // Ponto de extensão: Suporte a largura dinâmica
    // Exemplo: if (this.isotope.options.fitWidth) return { height: this.maxY, width: this.isotope.size.innerWidth };
  };

  // Fim da Parte 8
  // Cole este trecho no seu Gist após a Parte 7: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 9 abaixo.
})();
// Parte 9: Masonry e vertical
// -----------------------------------
// Módulo: Masonry e vertical
// Implementa os modos de layout 'masonry' (colunas com alturas variadas) e 'vertical'.
// Não usados diretamente no seu portfólio, mas incluídos para completude.
// -----------------------------------

(function (window, Outlayer, getSize, utils) {
  // Define o modo Masonry
  const Masonry = Outlayer.LayoutMode.create("masonry", {
    columnWidth: 0,
    gutter: 0,
  });

  const masonryProto = Masonry.prototype;

  masonryProto._resetLayout = function () {
    this.getSize();
    this._getMeasurement("columnWidth", "outerWidth");
    this._getMeasurement("gutter", "outerWidth");
    const containerWidth = this.isotope.size.innerWidth + this.gutter;
    this.cols = Math.floor((containerWidth + this.gutter) / (this.columnWidth + this.gutter)) || 1;
    this.colYs = [];
    for (let i = 0; i < this.cols; i++) {
      this.colYs.push(0);
    }
    this.maxY = 0;
  };

  masonryProto._getItemLayoutPosition = function (item) {
    item.getSize();
    const colSpan = Math.ceil(item.size.outerWidth / (this.columnWidth + this.gutter)) || 1;
    let colGroup = [];
    for (let i = 0; i < this.cols; i++) {
      colGroup[i] = this.colYs[i];
    }
    let minimumY = Math.min(...colGroup);
    let shortColIndex = colGroup.indexOf(minimumY);
    const position = {
      x: (this.columnWidth + this.gutter) * shortColIndex,
      y: minimumY,
    };
    const setHeight = minimumY + item.size.outerHeight;
    for (let i = 0; i < colSpan && shortColIndex + i < this.cols; i++) {
      this.colYs[shortColIndex + i] = setHeight;
    }
    this.maxY = Math.max(this.maxY, setHeight);
    return position;
  };

  masonryProto._getContainerSize = function () {
    return { height: this.maxY };
  };

  // Define o modo vertical
  const Vertical = Outlayer.LayoutMode.create("vertical");

  const verticalProto = Vertical.prototype;

  verticalProto._resetLayout = function () {
    this.y = 0;
  };

  verticalProto._getItemLayoutPosition = function (item) {
    item.getSize();
    const position = { x: 0, y: this.y };
    this.y += item.size.outerHeight;
    return position;
  };

  verticalProto._getContainerSize = function () {
    return { height: this.y };
  };

  // Fim da Parte 9
  // Cole este trecho no seu Gist após a Parte 8: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Continue com a Parte 10 abaixo.
})();
// Parte 10: Isotope Core
// -----------------------------------
// Módulo: Isotope Core
// Núcleo do Isotope, gerencia inicialização, filtragem, ordenação e layout.
// Central para os filtros e o layout 'fitRows' do seu portfólio.
// -----------------------------------

(function (window, Outlayer, getSize, matchesSelector, utils, Item) {
  // Define opções padrão
  const defaults = {
    layoutMode: "masonry",
    isJQueryFiltering: true,
    sortAscending: true,
    percentPosition: false,
    itemSelector: "",
    filter: "",
  };

  // Cria a classe Isotope
  const Isotope = Outlayer.create("isotope", defaults);
  window.Isotope = Isotope;

  const proto = Isotope.prototype;

  // Inicializa o Isotope
  proto._create = function () {
    this.itemGUID = 0;
    this._sorters = {};
    this._getSorters();
    Outlayer.prototype._create.call(this);
    this.modes = {};
    this.filteredItems = this.items;
    this.sortHistory = ["original-order"];
    for (let modeName in Isotope.LayoutMode.modes) {
      this._initLayoutMode(modeName);
    }
  };

  // Inicializa um modo de layout
  proto._initLayoutMode = function (modeName) {
    const Mode = Isotope.LayoutMode.modes[modeName];
    const modeOptions = this.options[modeName] || {};
    this.options[modeName] = Mode.options ? utils.extend(Mode.options, modeOptions) : modeOptions;
    this.modes[modeName] = new Mode(this);
  };

  // Configura opções
  proto.option = function (opts) {
    utils.extend(this.options, opts);
    if (opts.itemSelector) {
      this.itemSelector = opts.itemSelector;
    }
  };

  // Organiza os itens
  proto.arrange = function (options) {
    if (options) this.option(options);
    this._getIsInstant();
    const filterResult = this._filter(this.items);
    this.filteredItems = filterResult.matches;
    this._bindArrangeComplete();
    if (this._isInstant) {
      this._noTransition(this._hideReveal, [filterResult]);
    } else {
      this._hideReveal(filterResult);
    }
    this._sort();
    this._layout();
    // Ponto de extensão: Adicione eventos
    // Exemplo: this.emitEvent('arrangeComplete', [this.filteredItems]);
  };

  // Verifica se o layout é instantâneo
  proto._getIsInstant = function () {
    const layoutInstant = this._getOption("layoutInstant");
    this._isInstant = layoutInstant !== undefined ? layoutInstant : !this._isLayoutInited;
    return this._isInstant;
  };

  // Filtra os itens
  proto._filter = function (items) {
    const filter = this.options.filter;
    if (!filter) return { matches: items, needReveal: [], needHide: [] };
    const matches = [];
    const needReveal = [];
    const needHide = [];
    const isJQueryFiltering = this._getOption("isJQueryFiltering");
    const test = typeof filter === "function"
      ? item => filter(item.element)
      : item => matchesSelector(item.element, filter);
    items.forEach(item => {
      const isMatch = test(item);
      if (isMatch) {
        matches.push(item);
        if (item.isHidden) needReveal.push(item);
      } else if (!item.isHidden) {
        needHide.push(item);
      }
    });
    // Ponto de extensão: Filtros avançados
    // Exemplo: matches = matches.filter(item => item.element.dataset.date > '2023-01-01');
    return { matches, needReveal, needHide };
  };

  // Revela/esconde itens
  proto._hideReveal = function (filterResult) {
    this.reveal(filterResult.needReveal);
    this.hide(filterResult.needHide);
    // Ponto de extensão: Adicione animações
    // Exemplo: filterResult.needReveal.forEach(item => item.element.style.transition = 'opacity 0.5s');
  };

  // Revela itens
  proto.reveal = function (items) {
    items.forEach(item => item.reveal());
  };

  // Esconde itens
  proto.hide = function (items) {
    items.forEach(item => item.hide());
  };

  // Ordena os itens
  proto._sort = function () {
    const sortBy = this.options.sortBy;
    if (!sortBy) return;
    const sorter = this._getSorter(sortBy);
    this.filteredItems.sort((a, b) => {
      const order = sorter(a.element, b.element);
      return this.options.sortAscending ? order : -order;
    });
  };

  // Obtém função de ordenação
  proto._getSorter = function (sortBy) {
    return this._sorters[sortBy] || function (elemA, elemB) {
      return elemA.dataset[sortBy] - elemB.dataset[sortBy];
    };
  };

  // Configura ordenadores
  proto._getSorters = function () {
    const getSortData = this.options.getSortData;
    for (let key in getSortData) {
      const sorter = getSortData[key];
      this._sorters[key] = typeof sorter === "function" ? sorter : function (elem) {
        return elem.querySelector(sorter).textContent;
      };
    }
  };

  // Aplica o layout
  proto._layout = function () {
    const mode = this.modes[this.options.layoutMode];
    mode.layout();
    this.element.style.height = mode._getContainerSize().height + "px";
    // Dica: No seu portfólio, 'fitRows' é aplicado aqui
  };

  // Vincula eventos de conclusão
  proto._bindArrangeComplete = function () {
    let isLayoutComplete, isHideComplete, isRevealComplete;
    const _this = this;
    function arrangeParallelCallback() {
      if (isLayoutComplete && isHideComplete && isRevealComplete) {
        _this.emitEvent("arrangeComplete", [_this.filteredItems]);
      }
    }
    this.once("layoutComplete", () => {
      isLayoutComplete = true;
      arrangeParallelCallback();
    });
    this.once("hideComplete", () => {
      isHideComplete = true;
      arrangeParallelCallback();
    });
    this.once("revealComplete", () => {
      isRevealComplete = true;
      arrangeParallelCallback();
    });
  };

  // Desativa transições
  proto._noTransition = function (fn, args) {
    const items = this.items;
    items.forEach(item => {
      item.css({ transition: "none" });
    });
    fn.apply(this, args);
    items.forEach(item => {
      item.css({ transition: "" });
    });
  };

  // Obtém opção
  proto._getOption = function (option) {
    return this.options[option] !== undefined ? this.options[option] : defaults[option];
  };

  // Adiciona itens
  proto.addItems = function (elems) {
    const items = this._itemize(elems);
    this.items = this.items.concat(items);
    items.forEach(item => {
      item.getSize();
      this._layoutItem(item, true);
    });
  };

  // Cria itens a partir de elementos
  proto._itemize = function (elems) {
    const itemElems = this._filterFindItemElements(elems);
    const items = [];
    for (let i = 0; i < itemElems.length; i++) {
      const elem = itemElems[i];
      const item = new Item(elem, this);
      items.push(item);
    }
    return items;
  };

  // Filtra elementos de itens
  proto._filterFindItemElements = function (elems) {
    return utils.makeArray(elems).filter(elem => {
      return this._isElementInScope(elem, this.itemSelector);
    });
  };

  // Verifica se o elemento está no escopo
  proto._isElementInScope = function (elem, selector) {
    return selector ? matchesSelector(elem, selector) : true;
  };

  // Fim da Parte 10
  // Cole este trecho no seu Gist após a Parte 9: https://gist.github.com/biruleibenau/b1ccd3a2adaada5a1758cb7bc15d54e0
  // Após colar, o arquivo está completo!
})();
