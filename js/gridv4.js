console.log('Iniciando gridv4.js');
(function(window, factory) {
  console.log('Dentro do IIFE');
  if (typeof define === 'function' && define.amd) {
    console.log('Usando AMD');
    define(factory);
  } else if (typeof module === 'object' && module.exports) {
    console.log('Usando CommonJS');
    module.exports = factory();
  } else {
    console.log('Definindo window.Isotope');
    var Isotope = factory(); // <-- aqui sim, factory() retorna a classe final
    window.Isotope = Isotope;
    console.log('window.Isotope definido:', !!window.Isotope);

    if (window.jQuery) {
      console.log('Registrando plugin jQuery');
      jQuery.fn.isotope = function(options, callback) {
        return this.each(function() {
          var $this = jQuery(this);
          var instance = $this.data('isotope');
          if (!instance && typeof options === 'object') {
            instance = new Isotope(this, options); // use 'Isotope' aqui
            $this.data('isotope', instance);
          } else if (instance) {
            if (typeof options === 'string') {
              instance[options].apply(instance, Array.prototype.slice.call(arguments, 1));
            } else if (typeof options === 'object') {
              instance.option(options);
              instance.arrange();
            }
          }
          if (typeof callback === 'function') {
            instance.once('arrangeComplete', callback);
          }
        });
      };
    }
  }
})(window, function factory() {
  'use strict';
  console.log('Executando factory');


  // -------------------------- Utils -------------------------- //
  /**
   * Funções utilitárias (fizzy-ui-utils)
   */
  const utils = {
    extend( a, b ) {
      for ( let prop in b ) {
        if ( b.hasOwnProperty( prop ) ) {
          a[ prop ] = b[ prop ];
        }
      }
      return a;
    },
    makeArray( obj ) {
      if ( Array.isArray( obj ) ) return obj;
      if ( obj == null ) return [];
      let arr = [];
      if ( typeof obj.length === 'number' ) {
        for ( let i = 0; i < obj.length; i++ ) arr.push( obj[i] );
      } else {
        arr.push( obj );
      }
      return arr;
    },
    removeFrom( arr, item ) {
      let index = arr.indexOf( item );
      if ( index !== -1 ) arr.splice( index, 1 );
    }
  };
  console.log('Utils definido'); // fim parte 2
  
  // -------------------------- Get Size -------------------------- //
  /**
   * Mede tamanhos e margens de elementos (get-size)
   */
  const getSize = ( function() {
    function getStyleSize( value ) {
      let num = parseFloat( value );
      return isNaN( num ) ? 0 : num;
    }
    function getZeroSize() {
      return { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 };
    }
    function getStyle( elem ) {
      return window.getComputedStyle ? getComputedStyle( elem ) : elem.currentStyle;
    }
    function getSize( elem ) {
      let style = getStyle( elem );
      if ( !style ) return getZeroSize();
      let size = {
        width: getStyleSize( style.width ),
        height: getStyleSize( style.height ),
        marginLeft: getStyleSize( style.marginLeft ),
        marginRight: getStyleSize( style.marginRight ),
        marginTop: getStyleSize( style.marginTop ),
        marginBottom: getStyleSize( style.marginBottom ),
        paddingLeft: getStyleSize( style.paddingLeft ),
        paddingRight: getStyleSize( style.paddingRight ),
        paddingTop: getStyleSize( style.paddingTop ),
        paddingBottom: getStyleSize( style.paddingBottom )
      };
      size.innerWidth = size.width - size.paddingLeft - size.paddingRight;
      size.innerHeight = size.height - size.paddingTop - size.paddingBottom;
      size.outerWidth = size.width + size.marginLeft + size.marginRight;
      size.outerHeight = size.height + size.marginTop + size.marginBottom;
      return size;
    }
    return getSize;
  } )();
  console.log('GetSize definido'); // fim parte 3

  // -------------------------- Matches Selector -------------------------- //
  /**
   * Verifica se um elemento corresponde a um seletor CSS (matches-selector)
   */
  const matchesSelector = ( function() {
    let matchesMethod = ( function() {
      let ElemProto = Element.prototype;
      if ( ElemProto.matches ) return 'matches';
      if ( ElemProto.webkitMatchesSelector ) return 'webkitMatchesSelector';
      if ( ElemProto.mozMatchesSelector ) return 'mozMatchesSelector';
      if ( ElemProto.msMatchesSelector ) return 'msMatchesSelector';
      if ( ElemProto.oMatchesSelector ) return 'oMatchesSelector';
    } )();
    if ( matchesMethod ) {
      return function( elem, selector ) {
        return elem[ matchesMethod ]( selector );
      };
    }
    return function( elem, selector ) {
      let nodes = elem.parentNode.querySelectorAll( selector );
      for ( let i = 0; i < nodes.length; i++ ) {
        if ( nodes[i] === elem ) return true;
      }
      return false;
    };
  } )();
console.log('MatchesSelector definido'); // parte 4 M
  // -------------------------- Outlayer -------------------------- //
  /**
   * Classe base para layouts (Outlayer)
   */
  function Outlayer( element, options ) {
  this.element = typeof element === 'string' ? document.querySelector( element ) : element;
  if ( !this.element || !( this.element instanceof HTMLElement ) ) {
    console.error( 'Isotope: Elemento inválido fornecido:', element );
    this.element = document.createElement( 'div' ); // Fallback
  }
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );
  this.items = [];
  // console.log('Outlayer instanciado');
}

Outlayer.defaults = {
  transitionDuration: 0.4
};

  let proto = Outlayer.prototype;

  proto.option = function( opts ) {
    utils.extend( this.options, opts );
  };

  proto._getOption = function( option ) {
    return this.options[ option ];
  };

  proto._create = function() {
    this._getItems();
    this.layoutItems( this.items );
  };

  proto._getItems = function() {
    let items = this._itemize( this.element.children );
    this.items = items;
  };

  proto._itemize = function( elems ) {
    let itemElems = utils.makeArray( elems );
    let items = [];
    for ( let i = 0; i < itemElems.length; i++ ) {
      let elem = itemElems[i];
      let item = new this.constructor.Item( elem, this );
      items.push( item );
    }
    return items;
  };

  proto.layout = function() {
    this._resetLayout();
    this._manageStamps();
    this.layoutItems( this.items );
  };

  proto._resetLayout = function() {
    this.getSize();
  };

  proto.getSize = function() {
    this.size = getSize( this.element );
  };

  proto._manageStamps = function() {
    let stampElems = this._getOption( 'stamp' );
    stampElems = stampElems ? utils.makeArray( stampElems ) : [];
    for ( let i = 0; i < stampElems.length; i++ ) {
      this._manageStamp( stampElems[i] );
    }
  };

  proto.layoutItems = function( items, isInstant ) {
  for ( let i = 0; i < items.length; i++ ) {
    let item = items[i];
    if ( item.isIgnored ) continue;
    let position = this._getItemLayoutPosition( item );
    item.applyPosition( position, isInstant );
  }
};

  proto._getElementOffset = function( elem ) {
    let rect = elem.getBoundingClientRect();
    let containerRect = this.element.getBoundingClientRect();
    return {
      left: rect.left - containerRect.left,
      top: rect.top - containerRect.top
    };
  };

  proto._getMeasurement = function( measure, styleProp ) {
    let option = this._getOption( measure );
    if ( typeof option === 'number' ) {
      this[ measure ] = option;
      return;
    }
    let elem = option || this.items[0].element;
    this[ measure ] = elem ? parseFloat( getComputedStyle( elem )[ styleProp ] ) : 0;
  };

  proto.addItems = function( elems ) {
    let items = this._itemize( elems );
    this.items = this.items.concat( items );
    return items;
  };

  proto.remove = function( elems ) {
    elems = utils.makeArray( elems );
    let removeItems = this.getItems( elems );
    for ( let i = 0; i < removeItems.length; i++ ) {
      let item = removeItems[i];
      if ( item.element.parentNode ) {
        item.element.parentNode.removeChild( item.element );
      }
      utils.removeFrom( this.items, item );
    }
  };

  proto.dispatchEvent = function( type, event, args ) {
    let evt = new CustomEvent( type, { detail: args } );
    this.element.dispatchEvent( evt );
  };

  proto.once = function( type, listener ) {
    let _this = this;
    function handler() {
      if ( _this.element && _this.element.removeEventListener ) {
        _this.element.removeEventListener( type, handler );
      }
      listener.apply( this, arguments );
    }
    if ( this.element && this.element.addEventListener ) {
      this.element.addEventListener( type, handler );
    } else {
      console.warn( 'Isotope: Não foi possível adicionar ouvinte de evento. Elemento inválido:', this.element );
      listener.apply( this );
    }
  };

  proto.reveal = function( items ) {
  if ( !items || !items.length ) return;
  for ( let i = 0; i < items.length; i++ ) {
    items[i].element.classList.remove('isotope-hidden');
    items[i].element.style.opacity = '1';
    items[i].element.style.transform = 'none';
    console.log('Item revelado:', items[i].element.className);
  }
  this.dispatchEvent( 'revealComplete', null, [ items ] );
};

  proto.hide = function( items ) {
  if ( !items || !items.length ) return;
  for ( let i = 0; i < items.length; i++ ) {
    items[i].element.classList.add('isotope-hidden');
    console.log('Item escondido:', items[i].element.className);
  }
  this.dispatchEvent( 'hideComplete', null, [ items ] );
};

  Outlayer.create = function( namespace, options ) {
    function Class() {
      Outlayer.apply( this, arguments );
    }
    Object.defineProperty( Class, 'defaults', {
      value: utils.extend( {}, Outlayer.defaults, options )
    });
    Class.prototype = Object.create( Outlayer.prototype );
    Class.prototype.constructor = Class;
    Class.namespace = namespace;
    return Class;
  }; 
  
  //// parte 5 fim

  // -------------------------- Outlayer Item -------------------------- //
  /**
   * Item individual do layout
   */
  Outlayer.Item = function( element, outlayer ) {
    this.element = element;
    this.outlayer = outlayer;
  };

  let itemProto = Outlayer.Item.prototype;


  itemProto.getSize = function() {
    this.size = getSize( this.element );
  };

  itemProto.applyPosition = function( position, isInstant ) {
  let style = this.element.style;
  style.position = 'absolute';
  style.left = position.x + 'px';
  style.top = position.y + 'px';
  if ( !isInstant ) {
    style.transition = `all ${ this.outlayer.options.transitionDuration }s`;
  } else {
    style.transition = 'none';
  }
};

  itemProto.reveal = function() {
  this.element.style.display = '';
  this.element.style.opacity = '1';
  this.element.style.transform = 'none';
};

  itemProto.hide = function() {
    this.element.style.display = 'none';
  };

  console.log('Dependências iniciais:', {
  utils: !!utils,
  getSize: !!getSize,
  matchesSelector: !!matchesSelector,
  Outlayer: !!Outlayer
}); // fim parte 6
// -------------------------- Layout Mode -------------------------- //
/**
 * Classe base para modos de layout
 */
function LayoutMode( isotope ) {
  // console.log('entrou aqui 5'); // Removido para produção
  this.isotope = isotope;
  if ( isotope ) {
    this.options = utils.extend( {}, this.constructor.options );
    this.element = isotope.element;
  }
}

let layoutModeProto = LayoutMode.prototype;


layoutModeProto._create = function() {};
layoutModeProto._resetLayout = function() {};
layoutModeProto._getItemLayoutPosition = function() {
  return { x: 0, y: 0 };
};
layoutModeProto._manageStamp = function() {};
layoutModeProto._getContainerSize = function() {
  return {};
};
layoutModeProto.needsResizeLayout = function() {
  return false;
};

LayoutMode.modes = {};

LayoutMode.create = function( namespace, options ) {
  function Mode() {
    LayoutMode.apply( this, arguments );
  }
  Mode.prototype = Object.create( LayoutMode.prototype );
  Mode.prototype.constructor = Mode;
  Mode.options = options || {};
  Mode.namespace = namespace;
  LayoutMode.modes[ namespace ] = Mode;
  return Mode;
};

LayoutMode.prototype.getSize = function() {
  this.size = getSize(this.element);
};
// -------------------------- Masonry Mode -------------------------- //
/**
 * Modo de layout Masonry
 */
 console.log('Iniciando layout mansonry');

// Definir Outlayer
function Outlayer(element, options) {
  this.element = element;
  this.options = utils.extend({}, this.constructor.defaults);
  this.getSize();
}
Outlayer.prototype.getSize = function() {
  this.size = getSize(this.element);
};
Outlayer.prototype._getMeasurement = function(measurement, size) {
  var option = this.options[measurement];
  var elem;
  if (!option) {
    this[measurement] = 0;
  } else if (typeof option === 'string') {
    elem = this.element.querySelector(option);
  } else if (option instanceof HTMLElement) {
    elem = option;
  }
  this[measurement] = elem ? getSize(elem)[size] : option;
};
console.log('Outlayer._getMeasurement definido:', !!Outlayer.prototype._getMeasurement);

// Definir LayoutMode
function LayoutMode(isotope) {
  this.isotope = isotope;
  if (isotope) {
    this.options = utils.extend({}, this.constructor.options);
    this.element = isotope.element;
  }
}
LayoutMode.modes = {};
LayoutMode.create = function(name) {
  function Mode() {
    Outlayer.apply(this, arguments);
  }
  Mode.prototype = Object.create(Outlayer.prototype);
  Mode.prototype.constructor = Mode;
  utils.extend(Mode.prototype, LayoutMode.prototype);
  LayoutMode.modes[name] = Mode;
  console.log('Criando modo:', name, 'Mode herda _getMeasurement:', !!Mode.prototype._getMeasurement);
  return Mode;
};
// Criar MasonryMode
let MasonryMode = LayoutMode.create('masonry');
console.log('MasonryMode definido:', !!MasonryMode, 'LayoutMode.modes:', Object.keys(LayoutMode.modes));
console.log('MasonryMode herda _getMeasurement:', !!MasonryMode.prototype._getMeasurement);
  
MasonryMode.prototype._resetLayout = function() {
  this.getSize();
  this._getMeasurement('columnWidth', 'outerWidth');
  this._getMeasurement('gutter', 'outerWidth');
  this.measureColumns();
  this.colYs = Array(this.cols).fill(0);
  this.maxY = 0;
  this.horizontalColIndex = 0;
  console.log('MasonryMode._resetLayout executado:', {
    columnWidth: this.columnWidth,
    gutter: this.gutter,
    cols: this.cols
  });
  };

MasonryMode.prototype.measureColumns = function() {
  this.getSize();
  if (!this.columnWidth) {
    this._getMeasurement('columnWidth', 'outerWidth');
  }
  if (!this.gutter) {
    this._getMeasurement('gutter', 'outerWidth');
  }
  var containerWidth = this.size.width + this.gutter;
  this.cols = Math.floor((containerWidth + this.gutter) / (this.columnWidth + this.gutter)) || 1;
  console.log('measureColumns:', { cols: this.cols, containerWidth: containerWidth });
};

MasonryMode.prototype.getContainerWidth = function() {
  let isFitWidth = this.isotope._getOption('fitWidth');
  let container = isFitWidth ? this.element.parentNode : this.element;
  let size = getSize(container);
  this.containerWidth = size && size.innerWidth;
};

MasonryMode.prototype._getItemLayoutPosition = function(item) {
  item.getSize();
  let remainder = item.size.outerWidth % this.columnWidth;
  let mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
  let colSpan = Math[mathMethod](item.size.outerWidth / this.columnWidth);
  colSpan = Math.min(colSpan, this.cols);
  let colPosMethod = this.options.horizontalOrder ? '_getHorizontalColPosition' : '_getTopColPosition';
  let colPosition = this[colPosMethod](colSpan, item);
  let position = { x: this.columnWidth * colPosition.col, y: colPosition.y };
  let setHeight = colPosition.y + item.size.outerHeight;
  for (let i = colPosition.col; i < colPosition.col + colSpan; i++) {
    this.colYs[i] = setHeight;
  }
  return position;
};

MasonryMode.prototype._getTopColPosition = function(colSpan) {
  let colGroup = this._getTopColGroup(colSpan);
  let minY = Math.min(...colGroup);
  return { col: colGroup.indexOf(minY), y: minY };
};

MasonryMode.prototype._getTopColGroup = function(colSpan) {
  if (colSpan < 2) return this.colYs;
  let colGroup = [];
  for (let i = 0; i <= this.cols - colSpan; i++) {
    colGroup[i] = this._getColGroupY(i, colSpan);
  }
  return colGroup;
};

MasonryMode.prototype._getColGroupY = function(col, colSpan) {
  return colSpan < 2 ? this.colYs[col] : Math.max(...this.colYs.slice(col, col + colSpan));
};

MasonryMode.prototype._getHorizontalColPosition = function(colSpan, item) {
  let col = this.horizontalColIndex % this.cols;
  if (colSpan > 1 && col + colSpan > this.cols) col = 0;
  if (item.size.outerWidth && item.size.outerHeight) {
    this.horizontalColIndex = col + colSpan;
  }
  return { col, y: this._getColGroupY(col, colSpan) };
};

MasonryMode.prototype._manageStamp = function(stamp) {
  let stampSize = getSize(stamp);
  let offset = this.isotope._getElementOffset(stamp);
  let isOriginLeft = this.isotope._getOption('originLeft');
  let firstX = isOriginLeft ? offset.left : offset.right;
  let lastX = firstX + stampSize.outerWidth;
  let firstCol = Math.floor(firstX / this.columnWidth);
  firstCol = Math.max(0, firstCol);
  let lastCol = Math.floor(lastX / this.columnWidth);
  if (!(lastX % this.columnWidth)) lastCol -= 1;
  lastCol = Math.min(this.cols - 1, lastCol);
  let isOriginTop = this.isotope._getOption('originTop');
  let stampMaxY = (isOriginTop ? offset.top : offset.bottom) + stampSize.outerHeight;
  for (let i = firstCol; i <= lastCol; i++) {
    this.colYs[i] = Math.max(stampMaxY, this.colYs[i]);
  }
};

MasonryMode.prototype._getContainerSize = function() {
  this.maxY = Math.max(...this.colYs);
  let size = { height: this.maxY };
  if (this.isotope._getOption('fitWidth')) {
    size.width = this._getContainerFitWidth();
  }
  return size;
};

MasonryMode.prototype._getContainerFitWidth = function() {
  let unusedCols = 0;
  for (let i = this.cols - 1; i >= 0; i--) {
    if (this.colYs[i] !== 0) break;
    unusedCols++;
  }
  return (this.cols - unusedCols) * this.columnWidth - this.gutter;
};

MasonryMode.prototype.needsResizeLayout = function() {
  let previousWidth = this.containerWidth;
  this.getContainerWidth();
  return previousWidth !== this.containerWidth;
};

MasonryMode.prototype._getOption = function(option) {
  return option === 'fitWidth'
    ? this.options.isFitWidth !== undefined
      ? this.options.isFitWidth
      : this.options.fitWidth
    : this.isotope._getOption(option);
};

//// fim parte 8
// -------------------------- FitRows -------------------------- //
/**
 * Modo de layout FitRows
 */
let FitRows = LayoutMode.create( 'fitRows' );
console.log('FitRows definido:', !!FitRows, 'LayoutMode.modes:', Object.keys(LayoutMode.modes));

FitRows.prototype._resetLayout = function() {
  this.x = 0;
  this.y = 0;
  this.maxY = 0;
  this._getMeasurement('gutter', 'outerWidth');
};

FitRows.prototype._getItemLayoutPosition = function(item) {
  item.getSize();
  let itemWidth = item.size.outerWidth + this.gutter;
  let containerWidth = this.isotope.size.innerWidth + this.gutter;
  if (this.x !== 0 && itemWidth + this.x > containerWidth) {
    this.x = 0;
    this.y = this.maxY;
  }
  let position = { x: this.x, y: this.y };
  this.maxY = Math.max(this.maxY, this.y + item.size.outerHeight);
  this.x += itemWidth;
  return position;
};

FitRows.prototype._getContainerSize = function() {
  return { height: this.maxY };
};


// fim parte 9
  // -------------------------- Isotope Item -------------------------- //
  /**
   * Item individual do Isotope
   */
  function Item( element, isotope ) {
    Outlayer.Item.call( this, element, isotope );
    this.sortData = {};
  }

  Item.prototype = Object.create( Outlayer.Item.prototype );
  Item.prototype.constructor = Item;

  proto = Item.prototype;

  proto.updateSortData = function() {
    if ( this.isIgnored ) return;
    this.sortData.id = this.id;
    this.sortData[ 'original-order' ] = this.id;
    let getSortData = this.outlayer.options.getSortData;
    for ( let key in getSortData ) {
      let sorter = this.outlayer._sorters[ key ];
      this.sortData[ key ] = sorter( this.element, this );
    }
  };

  // -------------------------- Isotope -------------------------- //
  /**
   * Classe principal do Isotope
   */
  let Isotope = Outlayer.create( 'isotope', {
    layoutMode: 'masonry',
    sortAscending: true,
    isJQueryFiltering: true
  });

  Isotope.Item = Item;
  Isotope.LayoutMode = LayoutMode;

  proto = Isotope.prototype;
  proto._create = function() {
  console.log('Iniciando _create');
  this.itemGUID = 0;
  this._sorters = {};
  this._getSorters();
  console.log('Após getSorters');
  Outlayer.prototype._create.call( this );
  console.log('Após Outlayer._create');
  this.modes = {};
  this.filteredItems = this.items;
  this.sortHistory = [ 'original-order' ];
  console.log('Modos disponíveis antes de registrar:', Object.keys(LayoutMode.modes));
  for ( let name in LayoutMode.modes ) {
    console.log('Registrando modo:', name);
    this._initLayoutMode( name );
  }
  console.log('Modos registrados:', Object.keys(this.modes));
  if (!this.modes.masonry) {
    console.error('Modo masonry não registrado! Tentando corrigir...');
    this._initLayoutMode('masonry');
  }
  console.log('Finalizando _create');
};
  
  proto.reloadItems = function() {
    this.itemGUID = 0;
    Outlayer.prototype.reloadItems.call( this );
  };

  proto._itemize = function() {
    let items = Outlayer.prototype._itemize.apply( this, arguments );
    for ( let i = 0; i < items.length; i++ ) {
      let item = items[i];
      item.id = this.itemGUID++;
    }
    this._updateItemsSortData( items );
    return items;
  };

  proto._initLayoutMode = function( name ) {
  console.log('Inicializando modo:', name);
  let Mode = LayoutMode.modes[ name ];
  if (!Mode) {
    console.error('Modo não encontrado:', name);
    return;
  }
  console.log('Modo encontrado:', !!Mode, 'Namespace:', Mode.namespace);
  let initialOpts = this.options[ name ] || {};
  console.log('Opções iniciais para', name, ':', initialOpts);
  this.options[ name ] = Mode.options ? utils.extend( Mode.options, initialOpts ) : initialOpts;
  try {
    this.modes[ name ] = new Mode( this );
    console.log('Modo registrado com sucesso:', name, !!this.modes[ name ]);
  } catch (error) {
    console.error('Erro ao criar instância do modo:', name, error);
  }
};
  
  proto.layout = function() {
    if ( !this._isLayoutInited && this._getOption( 'initLayout' ) ) {
      this.arrange();
      return;
    }
    this._layout();
  };

  proto._layout = function() {
    let isInstant = this._getIsInstant();
    this._resetLayout();
    this._manageStamps();
    this.layoutItems( this.filteredItems, isInstant );
    this._isLayoutInited = true;
  };

  proto.arrange = function( opts ) {
    this.option( opts );
    this._getIsInstant();
    let filtered = this._filter( this.items );
    this.filteredItems = filtered.matches;
    this._bindArrangeComplete();
    if ( this._isInstant ) {
      this._noTransition( this._hideReveal, [ filtered ] );
    } else {
      this._hideReveal( filtered );
    }
    this._sort();
    this._layout();
  };

  proto._init = proto.arrange;

  proto._hideReveal = function( filtered ) {
    this.reveal( filtered.needReveal );
    this.hide( filtered.needHide );
  };

  proto._getIsInstant = function() {
    let isLayoutInstant = this._getOption( 'layoutInstant' );
    let isInstant = isLayoutInstant !== undefined ? isLayoutInstant : !this._isLayoutInited;
    this._isInstant = isInstant;
    return isInstant;
  };

  proto._bindArrangeComplete = function() {
    let isLayoutComplete, isHideComplete, isRevealComplete;
    let _this = this;
    function arrangeParallelCallback() {
      if ( isLayoutComplete && isHideComplete && isRevealComplete ) {
        _this.dispatchEvent( 'arrangeComplete', null, [ _this.filteredItems ] );
      }
    }
    this.once( 'layoutComplete', function() {
      isLayoutComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'hideComplete', function() {
      isHideComplete = true;
      arrangeParallelCallback();
    });
    this.once( 'revealComplete', function() {
      isRevealComplete = true;
      arrangeParallelCallback();
    });
  };

proto._filter = function( items ) {
  let filter = this.options.filter || '*';
  let matches = [];
  let hiddenMatched = [];
  let visibleUnmatched = [];
  let test = this._getFilterTest( filter );
  console.log('Filtrando com:', filter, 'Total de itens:', items.length);
  for ( let i = 0; i < items.length; i++ ) {
    let item = items[i];
    if ( item.isIgnored ) {
      console.log('Item ignorado:', item.element.className);
      continue;
    }
    let isMatched = test( item );
    console.log('Item:', item.element.className, 'isMatched:', isMatched, 'isHidden:', item.isHidden);
    if ( isMatched ) matches.push( item );
    if ( isMatched && item.isHidden ) hiddenMatched.push( item );
    else if ( !isMatched && !item.isHidden ) visibleUnmatched.push( item );
  }
  console.log('Resultado do filtro:', {
    matches: matches.length,
    needReveal: hiddenMatched.length,
    needHide: visibleUnmatched.length,
    matchedClasses: matches.map(item => item.element.className)
  });
  return {
    matches: matches,
    needReveal: hiddenMatched,
    needHide: visibleUnmatched
  };
};

proto._getFilterTest = function( filter ) {
  console.log('Criando teste de filtro para:', filter);
  if ( window.jQuery && this._getOption( 'isJQueryFiltering' ) ) {
    console.log('Usando jQuery para filtro');
    return function( item ) {
      console.log('Testando item:', item.element.className, 'Seletor:', filter);
      let $elem = jQuery( item.element );
      let result = $elem.is( filter );
      console.log('jQuery.is(', filter, ') para', item.element.className, ':', result);
      let manualResult = item.element.classList.contains( filter.replace('.', '') );
      console.log('Manual check para', filter, 'em', item.element.className, ':', manualResult);
      // Log adicional para classes do elemento
      console.log('Classes do elemento:', item.element.className.split(' '));
      return result;
    };
  }
  if ( typeof filter === 'function' ) {
    console.log('Usando função personalizada para filtro');
    return function( item ) {
      return filter( item.element );
    };
  }
  console.log('Usando matchesSelector para filtro');
  return function( item ) {
    let result = matchesSelector( item.element, filter );
    console.log('matchesSelector(', filter, ') para', item.element.className, ':', result);
    return result;
  };
};

  proto.updateSortData = function( elems ) {
    let items = elems ? this.getItems( utils.makeArray( elems ) ) : this.items;
    this._getSorters();
    this._updateItemsSortData( items );
  };

  proto._getSorters = function() {
    let getSortData = this.options.getSortData;
    for ( let key in getSortData ) {
      this._sorters[ key ] = mungeSorter( getSortData[ key ] );
    }
  };

  proto._updateItemsSortData = function( items ) {
    for ( let i = 0; i < items.length; i++ ) {
      items[i].updateSortData();
    }
  };

  const mungeSorter = ( function() {
    function mungeSorter( sorter ) {
      if ( typeof sorter !== 'string' ) return sorter;
      let args = sorter.trim().split( ' ' );
      let query = args[0];
      let attrMatch = query.match( /^\[(.+)\]$/ );
      let attr = attrMatch && attrMatch[1];
      let getValue = getValueGetter( attr, query );
      let parser = Isotope.sortDataParsers[ args[1] ];
      return parser ? function( elem ) {
        return elem && parser( getValue( elem ) );
      } : function( elem ) {
        return elem && getValue( elem );
      };
    }
    function getValueGetter( attr, query ) {
      if ( attr ) {
        return function( elem ) {
          return elem.getAttribute( attr );
        };
      }
      return function( elem ) {
        let child = elem.querySelector( query );
        return child && child.textContent;
      };
    }
    return mungeSorter;
  } )();

  Isotope.sortDataParsers = {
    parseInt: function( val ) {
      return parseInt( val, 10 );
    },
    parseFloat: function( val ) {
      return parseFloat( val );
    }
  };

  proto._sort = function() {
    if ( !this.options.sortBy ) return;
    let sortBys = utils.makeArray( this.options.sortBy );
    if ( !this._getIsSameSortBy( sortBys ) ) {
      this.sortHistory = sortBys.concat( this.sortHistory );
    }
    let itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
    this.filteredItems.sort( itemSorter );
  };

  proto._getIsSameSortBy = function( sortBys ) {
    for ( let i = 0; i < sortBys.length; i++ ) {
      if ( sortBys[i] !== this.sortHistory[i] ) return false;
    }
    return true;
  };

  function getItemSorter( sortBys, sortAsc ) {
    return function( itemA, itemB ) {
      for ( let i = 0; i < sortBys.length; i++ ) {
        let sortBy = sortBys[i];
        let a = itemA.sortData[ sortBy ];
        let b = itemB.sortData[ sortBy ];
        if ( a > b || a < b ) {
          let isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
          let direction = isAscending ? 1 : -1;
          return ( a > b ? 1 : -1 ) * direction;
        }
      }
      return 0;
    };
  }

 proto._mode = function() {
  // Garantir que this.modes exista antes de usar
  if (!this.modes) {
    console.warn('this.modes não está definido ainda. Inicializando como objeto vazio.');
    this.modes = {};
  }

  let layoutMode = this.options.layoutMode;
  console.log('Acessando modo:', layoutMode, 'Modos disponíveis:', Object.keys(this.modes));

  let mode = this.modes[ layoutMode ];
  if ( !mode ) {
    console.warn('Modo não encontrado:', layoutMode, 'Tentando recriar...');
    this._initLayoutMode( layoutMode );
    mode = this.modes[ layoutMode ];
    if ( !mode ) {
      throw new Error( 'No layout mode: ' + layoutMode );
    }
  }

  mode.options = this.options[ layoutMode ] || {};
  return mode;
};


  proto._resetLayout = function() {
    Outlayer.prototype._resetLayout.call( this );
    this._mode()._resetLayout();
  };

  proto._getItemLayoutPosition = function( item ) {
    return this._mode()._getItemLayoutPosition( item );
  };

  proto._manageStamp = function( stamp ) {
    this._mode()._manageStamp( stamp );
  };

  proto._getContainerSize = function() {
    return this._mode()._getContainerSize();
  };

  proto.needsResizeLayout = function() {
    return this._mode().needsResizeLayout();
  };

  proto.appended = function( elems ) {
    let items = this.addItems( elems );
    if ( !items.length ) return;
    let filteredItems = this._filterRevealAdded( items );
    this.filteredItems = this.filteredItems.concat( filteredItems );
  };

  proto.prepended = function( elems ) {
    let items = this._itemize( elems );
    if ( !items.length ) return;
    this._resetLayout();
    this._manageStamps();
    let filteredItems = this._filterRevealAdded( items );
    this.layoutItems( this.filteredItems );
    this.filteredItems = filteredItems.concat( this.filteredItems );
    this.items = items.concat( this.items );
  };

  proto._filterRevealAdded = function( items ) {
    let filtered = this._filter( items );
    this.hide( filtered.needHide );
    this.reveal( filtered.matches );
    this.layoutItems( filtered.matches, true );
    return filtered.matches;
  };

  proto.insert = function( elems ) {
    let items = this.addItems( elems );
    if ( !items.length ) return;
    for ( let i = 0; i < items.length; i++ ) {
      this.element.appendChild( items[i].element );
    }
    let filteredInsertItems = this._filter( items ).matches;
    for ( let i = 0; i < items.length; i++ ) {
      items[i].isLayoutInstant = true;
    }
    this.arrange();
    for ( let i = 0; i < items.length; i++ ) {
      delete items[i].isLayoutInstant;
    }
    this.reveal( filteredInsertItems );
  };

  let _remove = proto.remove;
  proto.remove = function( elems ) {
    elems = utils.makeArray( elems );
    let removeItems = this.getItems( elems );
    _remove.call( this, elems );
    let len = removeItems && removeItems.length;
    for ( let i = 0; len && i < len; i++ ) {
      utils.removeFrom( this.filteredItems, removeItems[i] );
    }
  };

  proto.shuffle = function() {
    for ( let i = 0; i < this.items.length; i++ ) {
      this.items[i].sortData.random = Math.random();
    }
    this.options.sortBy = 'random';
    this._sort();
    this._layout();
  };

  proto._noTransition = function( fn, args ) {
    let transitionDuration = this._getOption( 'transitionDuration' );
    this.options.transitionDuration = 0;
    let returnValue = fn.apply( this, args );
    this.options.transitionDuration = transitionDuration;
    return returnValue;
  };

  proto.getFilteredItemElements = function() {
    return this.filteredItems.map( function( item ) {
      return item.element;
    } );
  };
  
  
// Registro manual dos modos no Isotope
Isotope.prototype._modes = Isotope.prototype._modes || {};
Isotope.prototype._modes['masonry'] = MasonryMode;
Isotope.prototype._modes['fitRows'] = FitRows;
console.log('Modos registrados:', Object.keys(Isotope.prototype._modes));
  console.log('Retornando Isotope:', Isotope);
  return Isotope;
});
console.log('grid.js carregado completamente');
