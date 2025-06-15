/*!
 * Isotope v3.0.6 - Código Unificado Completo
 * Inclui masonry, fitRows, get-size, desandro-matches-selector, fizzy-ui-utils
 * Suporta jQuery para filtragem
 * Licenciado sob GPLv3 para uso open source ou Licença Comercial
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */

( function( window, factory ) {
  // Módulo universal (UMD) para suportar AMD, CommonJS e navegador
  if ( typeof define === 'function' && define.amd ) {
    define( factory );
  } else if ( typeof module === 'object' && module.exports ) {
    module.exports = factory();
  } else {
    window.Isotope = factory();
  }
}( window, function factory() {
'use strict';

// -------------------------- get-size -------------------------- //

// Módulo para medir dimensões de elementos
var getSize = ( function() {
  function getStyleSize( value ) {
    var num = parseFloat( value );
    return isNaN( num ) ? 0 : num;
  }

  function getZeroSize() {
    return { width: 0, height: 0, innerWidth: 0, innerHeight: 0, outerWidth: 0, outerHeight: 0 };
  }

  function getStyle( elem ) {
    return window.getComputedStyle ? getComputedStyle( elem ) : elem.currentStyle;
  }

  function getSize( elem ) {
    var style = getStyle( elem );
    if ( !style ) return getZeroSize();

    var size = {
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
})();

// -------------------------- desandro-matches-selector -------------------------- //

// Módulo para suportar seletores CSS
var matchesSelector = ( function() {
  var matchesMethod = ( function() {
    var ElemProto = Element.prototype;
    if ( ElemProto.matches ) return 'matches';
    if ( ElemProto.webkitMatchesSelector ) return 'webkitMatchesSelector';
    if ( ElemProto.mozMatchesSelector ) return 'mozMatchesSelector';
    if ( ElemProto.msMatchesSelector ) return 'msMatchesSelector';
    if ( ElemProto.oMatchesSelector ) return 'oMatchesSelector';
  })();

  if ( matchesMethod ) {
    return function( elem, selector ) {
      return elem[ matchesMethod ]( selector );
    };
  }

  return function( elem, selector ) {
    var nodes = elem.parentNode.querySelectorAll( selector );
    for ( var i=0; i < nodes.length; i++ ) {
      if ( nodes[i] === elem ) return true;
    }
    return false;
  };
})();

// -------------------------- fizzy-ui-utils -------------------------- //

// Módulo de utilitários
var utils = ( function() {
  var utils = {};

  utils.extend = function( a, b ) {
    for ( var prop in b ) {
      if ( b.hasOwnProperty( prop ) ) {
        a[ prop ] = b[ prop ];
      }
    }
    return a;
  };

  utils.makeArray = function( obj ) {
    if ( Array.isArray( obj ) ) return obj;
    if ( obj == null ) return [];
    var arr = [];
    if ( typeof obj.length === 'number' ) {
      for ( var i=0; i < obj.length; i++ ) arr.push( obj[i] );
    } else {
      arr.push( obj );
    }
    return arr;
  };

  utils.removeFrom = function( arr, item ) {
    var index = arr.indexOf( item );
    if ( index !== -1 ) arr.splice( index, 1 );
  };

  return utils;
})();

// -------------------------- Outlayer -------------------------- //

// Classe base para layouts
function Outlayer( element, options ) {
  this.element = element;
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );
  this.items = [];
}

Outlayer.defaults = {
  transitionDuration: 0.4
};

var proto = Outlayer.prototype;

proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

proto._create = function() {
  this._getItems();
  this.layoutItems( this.items );
};

proto._getItems = function() {
  var items = this._itemize( this.element.children );
  this.items = items;
};

proto._itemize = function( elems ) {
  var itemElems = utils.makeArray( elems );
  var items = [];
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new this.constructor.Item( elem, this );
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
  var stampElems = this._getOption('stamp');
  stampElems = stampElems ? utils.makeArray( stampElems ) : [];
  for ( var i=0; i < stampElems.length; i++ ) {
    this._manageStamp( stampElems[i] );
  }
};

proto.layoutItems = function( items, isInstant ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    if ( item.isIgnored ) continue;
    var position = this._getItemLayoutPosition( item );
    item.applyPosition( position, isInstant );
  }
};

proto._getElementOffset = function( elem ) {
  var rect = elem.getBoundingClientRect();
  var containerRect = this.element.getBoundingClientRect();
  return {
    left: rect.left - containerRect.left,
    top: rect.top - containerRect.top
  };
};

proto._getMeasurement = function( measure, styleProp ) {
  var option = this._getOption( measure );
  if ( typeof option === 'number' ) {
    this[ measure ] = option;
    return;
  }
  var elem = option || this.items[0].element;
  this[ measure ] = elem ? parseFloat( getComputedStyle( elem )[ styleProp ] ) : 0;
};

proto.addItems = function( elems ) {
  var items = this._itemize( elems );
  this.items = this.items.concat( items );
  return items;
};

proto.remove = function( elems ) {
  var items = this.getItems( elems );
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    item.element.parentNode.removeChild( item.element );
    utils.removeFrom( this.items, item );
  }
};

proto.dispatchEvent = function( type, event, args ) {
  var evt = new CustomEvent( type, { detail: args });
  this.element.dispatchEvent( evt );
};

proto.once = function( type, listener ) {
  var _this = this;
  function handler() {
    _this.element.removeEventListener( type, handler );
    listener.apply( this, arguments );
  }
  this.element.addEventListener( type, handler );
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

// -------------------------- Outlayer Item -------------------------- //

Outlayer.Item = function( element, outlayer ) {
  this.element = element;
  this.outlayer = outlayer;
};

var itemProto = Outlayer.Item.prototype;

itemProto.getSize = function() {
  this.size = getSize( this.element );
};

itemProto.applyPosition = function( position, isInstant ) {
  var style = this.element.style;
  style.position = 'absolute';
  style.left = position.x + 'px';
  style.top = position.y + 'px';
};

// -------------------------- Masonry -------------------------- //

var Masonry = Outlayer.create('masonry');
Masonry.compatOptions.fitWidth = 'isFitWidth';

proto = Masonry.prototype;

proto._resetLayout = function() {
  this.getSize();
  this._getMeasurement( 'columnWidth', 'outerWidth' );
  this._getMeasurement( 'gutter', 'outerWidth' );
  this.measureColumns();
  this.colYs = [];
  for ( var i=0; i < this.cols; i++ ) {
    this.colYs.push( 0 );
  }
  this.maxY = 0;
  this.horizontalColIndex = 0;
};

proto.measureColumns = function() {
  this.getContainerWidth();
  if ( !this.columnWidth ) {
    var firstItem = this.items[0];
    var firstItemElem = firstItem && firstItem.element;
    this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth || this.containerWidth;
  }
  var columnWidth = this.columnWidth += this.gutter;
  var containerWidth = this.containerWidth + this.gutter;
  var cols = containerWidth / columnWidth;
  var excess = columnWidth - containerWidth % columnWidth;
  var mathMethod = excess && excess < 1 ? 'round' : 'floor';
  cols = Math[ mathMethod ]( cols );
  this.cols = Math.max( cols, 1 );
};

proto.getContainerWidth = function() {
  var isFitWidth = this._getOption('fitWidth');
  var container = isFitWidth ? this.element.parentNode : this.element;
  var size = getSize( container );
  this.containerWidth = size && size.innerWidth;
};

proto._getItemLayoutPosition = function( item ) {
  item.getSize();
  var remainder = item.size.outerWidth % this.columnWidth;
  var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
  var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
  colSpan = Math.min( colSpan, this.cols );
  var colPosMethod = this.options.horizontalOrder ? '_getHorizontalColPosition' : '_getTopColPosition';
  var colPosition = this[ colPosMethod ]( colSpan, item );
  var position = {
    x: this.columnWidth * colPosition.col,
    y: colPosition.y
  };
  var setHeight = colPosition.y + item.size.outerHeight;
  var setMax = colSpan + colPosition.col;
  for ( var i = colPosition.col; i < setMax; i++ ) {
    this.colYs[i] = setHeight;
  }
  return position;
};

proto._getTopColPosition = function( colSpan ) {
  var colGroup = this._getTopColGroup( colSpan );
  var minimumY = Math.min.apply( Math, colGroup );
  return {
    col: colGroup.indexOf( minimumY ),
    y: minimumY
  };
};

proto._getTopColGroup = function( colSpan ) {
  if ( colSpan < 2 ) return this.colYs;
  var colGroup = [];
  var groupCount = this.cols + 1 - colSpan;
  for ( var i = 0; i < groupCount; i++ ) {
    colGroup[i] = this._getColGroupY( i, colSpan );
  }
  return colGroup;
};

proto._getColGroupY = function( col, colSpan ) {
  if ( colSpan < 2 ) return this.colYs[ col ];
  var groupColYs = this.colYs.slice( col, col + colSpan );
  return Math.max.apply( Math, groupColYs );
};

proto._getHorizontalColPosition = function( colSpan, item ) {
  var col = this.horizontalColIndex % this.cols;
  var isOver = colSpan > 1 && col + colSpan > this.cols;
  col = isOver ? 0 : col;
  var hasSize = item.size.outerWidth && item.size.outerHeight;
  this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;
  return {
    col: col,
    y: this._getColGroupY( col, colSpan )
  };
};

proto._manageStamp = function( stamp ) {
  var stampSize = getSize( stamp );
  var offset = this._getElementOffset( stamp );
  var isOriginLeft = this._getOption('originLeft');
  var firstX = isOriginLeft ? offset.left : offset.right;
  var lastX = firstX + stampSize.outerWidth;
  var firstCol = Math.floor( firstX / this.columnWidth );
  firstCol = Math.max( 0, firstCol );
  var lastCol = Math.floor( lastX / this.columnWidth );
  lastCol -= lastX % this.columnWidth ? 0 : 1;
  lastCol = Math.min( this.cols - 1, lastCol );
  var isOriginTop = this._getOption('originTop');
  var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) + stampSize.outerHeight;
  for ( var i = firstCol; i <= lastCol; i++ ) {
    this.colYs[i] = Math.max( stampMaxY, this.colYs[i] );
  }
};

proto._getContainerSize = function() {
  this.maxY = Math.max.apply( Math, this.colYs );
  var size = { height: this.maxY };
  if ( this._getOption('fitWidth') ) {
    size.width = this._getContainerFitWidth();
  }
  return size;
};

proto._getContainerFitWidth = function() {
  var unusedCols = 0;
  var i = this.cols;
  while ( --i ) {
    if ( this.colYs[i] !== 0 ) break;
    unusedCols++;
  }
  return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
};

proto.needsResizeLayout = function() {
  var previousWidth = this.containerWidth;
  this.getContainerWidth();
  return previousWidth !== this.containerWidth;
};

// -------------------------- LayoutMode -------------------------- //

function LayoutMode( isotope ) {
  this.isotope = isotope;
  if ( isotope ) {
    this.options = utils.extend( {}, this.constructor.options );
    this.element = isotope.element;
  }
}

LayoutMode.prototype._create = function() {};

LayoutMode.prototype._resetLayout = function() {};

LayoutMode.prototype._getItemLayoutPosition = function() {
  return { x: 0, y: 0 };
};

LayoutMode.prototype._manageStamp = function() {};

LayoutMode.prototype._getContainerSize = function() {
  return {};
};

LayoutMode.prototype.needsResizeLayout = function() {
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

// -------------------------- Masonry Layout Mode -------------------------- //

var MasonryMode = LayoutMode.create('masonry');

proto = MasonryMode.prototype;

var keepModeMethods = {
  _getElementOffset: true,
  layout: true,
  _getMeasurement: true
};

for ( var method in Masonry.prototype ) {
  if ( !keepModeMethods[ method ] ) {
    proto[ method ] = Masonry.prototype[ method ];
  }
}

var measureColumns = proto.measureColumns;
proto.measureColumns = function() {
  this.items = this.isotope.filteredItems;
  measureColumns.call( this );
};

var _getOption = proto._getOption;
proto._getOption = function( option ) {
  if ( option === 'fitWidth' ) {
    return this.options.isFitWidth !== undefined ? this.options.isFitWidth : this.options.fitWidth;
  }
  return _getOption.apply( this.isotope, arguments );
};

// -------------------------- fitRows Layout Mode -------------------------- //

var FitRows = LayoutMode.create('fitRows');

proto = FitRows.prototype;

proto._resetLayout = function() {
  this.x = 0;
  this.y = 0;
  this.maxY = 0;
  this._getMeasurement( 'gutter', 'outerWidth' );
};

proto._getItemLayoutPosition = function( item ) {
  item.getSize();
  var itemWidth = item.size.outerWidth + this.gutter;
  var containerWidth = this.isotope.size.innerWidth + this.gutter;
  if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
    this.x = 0;
    this.y = this.maxY;
  }
  var position = { x: this.x, y: this.y };
  this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
  this.x += itemWidth;
  return position;
};

proto._getContainerSize = function() {
  return { height: this.maxY };
};

// -------------------------- Isotope Item -------------------------- //

function Item( element, isotope ) {
  Outlayer.Item.call( this, element, isotope );
  this.sortData = {};
}

Item.prototype = Object.create( Outlayer.Item.prototype );
Item.prototype.constructor = Item;

Item.prototype.updateSortData = function() {
  if ( this.isIgnored ) return;
  this.sortData.id = this.id;
  this.sortData['original-order'] = this.id;
  var getSortData = this.outlayer.options.getSortData;
  for ( var key in getSortData ) {
    var sorter = this.outlayer._sorters[ key ];
    this.sortData[ key ] = sorter( this.element, this );
  }
};

// -------------------------- Isotope -------------------------- //

var trim = String.prototype.trim ?
  function( str ) { return str.trim(); } :
  function( str ) { return str.replace( /^\s+|\s+$/g, '' ); };

var Isotope = Outlayer.create( 'isotope', {
  layoutMode: 'masonry',
  sortAscending: true,
  isJQueryFiltering: true
});

Isotope.Item = Item;
Isotope.LayoutMode = LayoutMode;

proto = Isotope.prototype;

proto._create = function() {
  this.itemGUID = 0;
  this._sorters = {};
  this._getSorters();
  Outlayer.prototype._create.call( this );
  this.modes = {};
  this.filteredItems = this.items;
  this.sortHistory = [ 'original-order' ];
  for ( var name in LayoutMode.modes ) {
    this._initLayoutMode( name );
  }
};

proto.reloadItems = function() {
  this.itemGUID = 0;
  Outlayer.prototype.reloadItems.call( this );
};

proto._itemize = function() {
  var items = Outlayer.prototype._itemize.apply( this, arguments );
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    item.id = this.itemGUID++;
  }
  this._updateItemsSortData( items );
  return items;
};

proto._initLayoutMode = function( name ) {
  var Mode = LayoutMode.modes[ name ];
  var initialOpts = this.options[ name ] || {};
  this.options[ name ] = Mode.options ? utils.extend( Mode.options, initialOpts ) : initialOpts;
  this.modes[ name ] = new Mode( this );
};

proto.layout = function() {
  if ( !this._isLayoutInited && this._getOption('initLayout') ) {
    this.arrange();
    return;
  }
  this._layout();
};

proto._layout = function() {
  var isInstant = this._getIsInstant();
  this._resetLayout();
  this._manageStamps();
  this.layoutItems( this.filteredItems, isInstant );
  this._isLayoutInited = true;
};

proto.arrange = function( opts ) {
  this.option( opts );
  this._getIsInstant();
  var filtered = this._filter( this.items );
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
  var isLayoutInstant = this._getOption('layoutInstant');
  var isInstant = isLayoutInstant !== undefined ? isLayoutInstant : !this._isLayoutInited;
  this._isInstant = isInstant;
  return isInstant;
};

proto._bindArrangeComplete = function() {
  var isLayoutComplete, isHideComplete, isRevealComplete;
  var _this = this;
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
  var filter = this.options.filter || '*';
  var matches = [];
  var hiddenMatched = [];
  var visibleUnmatched = [];
  var test = this._getFilterTest( filter );
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    if ( item.isIgnored ) continue;
    var isMatched = test( item );
    if ( isMatched ) matches.push( item );
    if ( isMatched && item.isHidden ) hiddenMatched.push( item );
    else if ( !isMatched && !item.isHidden ) visibleUnmatched.push( item );
  }
  return {
    matches: matches,
    needReveal: hiddenMatched,
    needHide: visibleUnmatched
  };
};

proto._getFilterTest = function( filter ) {
  if ( window.jQuery && this._getOption('isJQueryFiltering') ) {
    return function( item ) {
      return jQuery( item.element ).is( filter );
    };
  }
  if ( typeof filter === 'function' ) {
    return function( item ) {
      return filter( item.element );
    };
  }
  return function( item ) {
    return matchesSelector( item.element, filter );
  };
};

proto.updateSortData = function( elems ) {
  var items = elems ? this.getItems( utils.makeArray( elems ) ) : this.items;
  this._getSorters();
  this._updateItemsSortData( items );
};

proto._getSorters = function() {
  var getSortData = this.options.getSortData;
  for ( var key in getSortData ) {
    this._sorters[ key ] = mungeSorter( getSortData[ key ] );
  }
};

proto._updateItemsSortData = function( items ) {
  for ( var i=0, len=items.length; i < len; i++ ) {
    items[i].updateSortData();
  }
};

var mungeSorter = ( function() {
  function mungeSorter( sorter ) {
    if ( typeof sorter !== 'string' ) return sorter;
    var args = trim( sorter ).split(' ');
    var query = args[0];
    var attrMatch = query.match( /^\[(.+)\]$/ );
    var attr = attrMatch && attrMatch[1];
    var getValue = getValueGetter( attr, query );
    var parser = Isotope.sortDataParsers[ args[1] ];
    return parser ? function( elem ) {
      return elem && parser( getValue( elem ) );
    } : function( elem ) {
      return elem && getValue( elem );
    };
  }
  function getValueGetter( attr, query ) {
    if ( attr ) {
      return function( elem ) { return elem.getAttribute( attr ); };
    }
    return function( elem ) {
      var child = elem.querySelector( query );
      return child && child.textContent;
    };
  }
  return mungeSorter;
})();

Isotope.sortDataParsers = {
  parseInt: function( val ) { return parseInt( val, 10 ); },
  parseFloat: function( val ) { return parseFloat( val ); }
};

proto._sort = function() {
  if ( !this.options.sortBy ) return;
  var sortBys = utils.makeArray( this.options.sortBy );
  if ( !this._getIsSameSortBy( sortBys ) ) {
    this.sortHistory = sortBys.concat( this.sortHistory );
  }
  var itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
  this.filteredItems.sort( itemSorter );
};

proto._getIsSameSortBy = function( sortBys ) {
  for ( var i=0; i < sortBys.length; i++ ) {
    if ( sortBys[i] !== this.sortHistory[i] ) return false;
  }
  return true;
};

function getItemSorter( sortBys, sortAsc ) {
  return function( itemA, itemB ) {
    for ( var i = 0; i < sortBys.length; i++ ) {
      var sortBy = sortBys[i];
      var a = itemA.sortData[ sortBy ];
      var b = itemB.sortData[ sortBy ];
      if ( a > b || a < b ) {
        var isAscending = sortAsc[ sortBy ] !== undefined ? sortAsc[ sortBy ] : sortAsc;
        var direction = isAscending ? 1 : -1;
        return ( a > b ? 1 : -1 ) * direction;
      }
    }
    return 0;
  };
};

proto._mode = function() {
  var layoutMode = this.options.layoutMode;
  var mode = this.modes[ layoutMode ];
  if ( !mode ) throw new Error( 'No layout mode: ' + layoutMode );
  mode.options = this.options[ layoutMode ];
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
  var items = this.addItems( elems );
  if ( !items.length ) return;
  var filteredItems = this._filterRevealAdded( items );
  this.filteredItems = this.filteredItems.concat( filteredItems );
};

proto.prepended = function( elems ) {
  var items = this._itemize( elems );
  if ( !items.length ) return;
  this._resetLayout();
  this._manageStamps();
  var filteredItems = this._filterRevealAdded( items );
  this.layoutItems( this.filteredItems );
  this.filteredItems = filteredItems.concat( this.filteredItems );
  this.items = items.concat( this.items );
};

proto._filterRevealAdded = function( items ) {
  var filtered = this._filter( items );
  this.hide( filtered.needHide );
  this.reveal( filtered.matches );
  this.layoutItems( filtered.matches, true );
  return filtered.matches;
};

proto.insert = function( elems ) {
  var items = this.addItems( elems );
  if ( !items.length ) return;
  for ( var i=0, len=items.length; i < len; i++ ) {
    this.element.appendChild( items[i].element );
  }
  var filteredInsertItems = this._filter( items ).matches;
  for ( var i=0; i < len; i++ ) {
    items[i].isLayoutInstant = true;
  }
  this.arrange();
  for ( var i=0; i < len; i++ ) {
    delete items[i].isLayoutInstant;
  }
  this.reveal( filteredInsertItems );
};

var _remove = proto.remove;
proto.remove = function( elems ) {
  elems = utils.makeArray( elems );
  var removeItems = this.getItems( elems );
  _remove.call( this, elems );
  var len = removeItems && removeItems.length;
  for ( var i=0; len && i < len; i++ ) {
    utils.removeFrom( this.filteredItems, removeItems[i] );
  }
};

proto.shuffle = function() {
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i].sortData.random = Math.random();
  }
  this.options.sortBy = 'random';
  this._sort();
  this._layout();
};

proto._noTransition = function( fn, args ) {
  var transitionDuration = this.options.transitionDuration;
  this.options.transitionDuration = 0;
  var returnValue = fn.apply( this, args );
  this.options.transitionDuration = transitionDuration;
  return returnValue;
};

proto.getFilteredItemElements = function() {
  return this.filteredItems.map( function( item ) {
    return item.element;
  });
};

return Isotope;

}));
