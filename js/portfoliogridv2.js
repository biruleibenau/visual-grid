/*!
 * Isotope v3.0.6
 * Licensed under MIT
 * https://isotope.metafizzy.co
 * Sortable, filterable layouts
 */

// Comentário: O código começa com uma função anônima autoexecutável (IIFE) para evitar poluição do escopo global
// e garantir que o Isotope seja definido de forma segura, com dependências externas (como jQuery) carregadas corretamente.
(function(window, factory) {
  // universal module definition
  // Comentário: Define o suporte para diferentes sistemas de módulos (CommonJS, AMD, ou global).
  if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
        window,
        require('jquery')
    );
  } else if ( typeof define == 'function' && define.amd ) {
    // AMD
    define( [
        'jquery'
      ],
      function( jQuery ) {
        return factory( window, jQuery );
      });
  } else {
    // browser global
    window.Isotope = factory(
        window,
        window.jQuery
    );
  }
}( window, function factory( window, jQuery ) {
'use strict';

// Comentário: Define atalhos para objetos globais usados frequentemente, como setTimeout e console,
// para melhorar a legibilidade e evitar dependência direta do objeto window.
var setTimeout = window.setTimeout;
var console = window.console;

// Comentário: Verifica se o jQuery está disponível; caso contrário, lança um erro.
if ( !jQuery ) {
  console.error('Isotope requires jQuery');
  return;
}

// Comentário: Cria o namespace principal do Isotope e suas dependências internas.
// O objeto Outlayer será usado para funcionalidades de layout base.
var Outlayer = window.Outlayer = window.Outlayer || {};
Outlayer.Item = Outlayer.Item || {};

// Comentário: Inicializa o objeto Isotope com suas propriedades e métodos principais.
function Isotope( element, options ) {
  // Comentário: Garante que o Isotope seja instanciado com a palavra-chave 'new'.
  if ( !( this instanceof Isotope ) ) {
    return new Isotope( element, options );
  }
  // Comentário: Armazena o elemento DOM onde o Isotope será aplicado.
  this.element = element;
  // Comentário: Mescla opções padrão com as fornecidas pelo usuário.
  this.options = jQuery.extend( {}, this.constructor.defaults );
  this.option( options );
  // Comentário: Inicializa o layout e os itens.
  this.getItems();
  this.initLayout();
}

// Comentário: Define as opções padrão do Isotope.
Isotope.defaults = {
  itemSelector: '.item', // Seletor CSS para os itens do grid
  layoutMode: 'masonry', // Modo de layout padrão (pode ser masonry, fitRows, etc.)
  percentPosition: true,  // Usa posicionamento em porcentagem para maior responsividade
  transitionDuration: '0.6s', // Duração padrão das animações
  stagger: 30 // Intervalo entre animações de itens (em milissegundos)
};

// Comentário: Estende o protótipo do Isotope com métodos do Outlayer, que fornece funcionalidades base de layout.
jQuery.extend( Isotope.prototype, Outlayer.prototype );

// Comentário: Método para configurar opções do Isotope.
Isotope.prototype.option = function( opts ) {
  if ( jQuery.isPlainObject( opts ) ) {
    this.options = jQuery.extend( true, this.options, opts );
  }
};

// Comentário: Método para obter os itens do grid com base no seletor definido.
Isotope.prototype.getItems = function() {
  this.items = [];
  var itemElems = this.element.querySelectorAll( this.options.itemSelector );
  for ( var i=0; i < itemElems.length; i++ ) {
    this.items.push( new Isotope.Item( itemElems[i], this ) );
  }
};

// Fim da Parte 1
// Comentário: Método para inicializar o layout do Isotope, configurando o comportamento do grid.
Isotope.prototype.initLayout = function() {
  // Comentário: Chama o método _resetLayout para limpar estados anteriores e preparar o layout.
  this._resetLayout();
  // Comentário: Configura o modo de layout (ex.: masonry, fitRows) com base nas opções.
  this._getLayoutMode();
  // Comentário: Aplica o layout inicial aos itens do grid.
  this.layout();
};

// Comentário: Reseta as propriedades do layout, como tamanhos e posições, para evitar conflitos.
Isotope.prototype._resetLayout = function() {
  // Comentário: Inicializa o objeto para armazenar medidas do layout.
  this._getMeasurement( 'columnWidth', 'width' );
  this._getMeasurement( 'gutter', 'width' );
  // Comentário: Reseta propriedades de estilo do elemento principal.
  this.element.style.position = 'relative';
  // Comentário: Inicializa o objeto fitsRows, usado em layouts específicos.
  this.fitsRows = {};
};

// Comentário: Obtém o modo de layout especificado nas opções e configura suas funções.
Isotope.prototype._getLayoutMode = function() {
  var layoutMode = this.options.layoutMode;
  // Comentário: Verifica se o modo de layout existe; caso contrário, usa 'masonry' como padrão.
  var LayoutMode = Isotope.LayoutMode.modes[ layoutMode ];
  if ( !LayoutMode ) {
    console.warn( 'No layout mode: ' + layoutMode );
    layoutMode = 'masonry';
    LayoutMode = Isotope.LayoutMode.modes.masonry;
  }
  // Comentário: Instancia o modo de layout e associa ao Isotope.
  this.layoutMode = new LayoutMode( this );
};

// Comentário: Aplica o layout aos itens do grid, organizando-os visualmente.
Isotope.prototype.layout = function() {
  // Comentário: Verifica se há itens para organizar; caso contrário, sai.
  if ( !this.items.length ) {
    return;
  }
  // Comentário: Chama o método de layout do modo selecionado (ex.: masonry, fitRows).
  this.layoutMode.layout();
  // Comentário: Aplica transições visuais, se habilitadas.
  this._manageStamps();
  this._postLayout();
};

// Comentário: Gerencia elementos "stamps" (itens fixos que afetam o layout, como cabeçalhos).
Isotope.prototype._manageStamps = function() {
  // Comentário: Obtém elementos com a classe definida em options.stamps.
  var stampElems = this.element.querySelectorAll( this.options.stamps );
  this.stamps = [];
  for ( var i=0; i < stampElems.length; i++ ) {
    this.stamps.push( stampElems[i] );
  }
  // Comentário: Aplica posicionamento aos stamps para integrá-los ao layout.
  Outlayer.prototype._manageStamps.call( this );
};

// Comentário: Ações realizadas após o layout ser aplicado, como atualizar estilos.
Isotope.prototype._postLayout = function() {
  // Comentário: Atualiza as dimensões do container para refletir o layout.
  this.resizeContainer();
  // Comentário: Emite evento para notificar que o layout foi concluído.
  this.emitEvent( 'layoutComplete', [ this ] );
};

// Comentário: Ajusta o tamanho do container com base nos itens organizados.
Isotope.prototype.resizeContainer = function() {
  // Comentário: Calcula a altura necessária para o container no modo masonry.
  if ( this.options.layoutMode == 'masonry' ) {
    var maxY = Math.max.apply( Math, this.items.map(function( item ) {
      return item.position.y + item.size.height;
    }));
    this.element.style.height = maxY + this.gutter + 'px';
  }
};

// Fim da Parte 2
// Comentário: Método para adicionar novos itens ao grid dinamicamente.
Isotope.prototype.addItems = function( elements ) {
  // Comentário: Converte elementos em um array e cria instâncias de Item para cada um.
  var items = this._itemize( elements );
  // Comentário: Adiciona os novos itens à lista existente.
  if ( items.length ) {
    this.items = this.items.concat( items );
    // Comentário: Atualiza o layout para refletir os novos itens.
    this.layout();
  }
  return items;
};

// Comentário: Converte elementos DOM em instâncias de Isotope.Item.
Isotope.prototype._itemize = function( elems ) {
  var itemElems = this._filterFindItemElements( elems );
  var items = [];
  // Comentário: Cria uma instância de Item para cada elemento encontrado.
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new Isotope.Item( elem, this );
    items.push( item );
  }
  return items;
};

// Comentário: Filtra e encontra elementos que correspondem ao seletor de itens.
Isotope.prototype._filterFindItemElements = function( elems ) {
  // Comentário: Normaliza o input para um array, caso seja um NodeList ou elemento único.
  var elements = jQuery.makeArray( elems );
  var itemSelector = this.options.itemSelector;
  var filtered = [];
  // Comentário: Verifica cada elemento contra o seletor de itens.
  for ( var i=0; i < elements.length; i++ ) {
    var elem = elements[i];
    if ( !itemSelector || jQuery( elem ).is( itemSelector ) ) {
      filtered.push( elem );
    }
    // Comentário: Inclui elementos filhos que correspondam ao seletor.
    filtered = filtered.concat( jQuery( elem ).find( itemSelector ).get() );
  }
  return filtered;
};

// Comentário: Remove itens do grid.
Isotope.prototype.remove = function( elements ) {
  var items = this._itemize( elements );
  // Comentário: Remove os itens da lista interna.
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    var index = this.items.indexOf( item );
    if ( index != -1 ) {
      this.items.splice( index, 1 );
      // Comentário: Remove o elemento do DOM e limpa suas referências.
      item.destroy();
    }
  }
  // Comentário: Atualiza o layout após a remoção.
  this.layout();
};

// Comentário: Método utilitário para obter medidas (ex.: columnWidth, gutter) a partir de opções ou elementos.
Isotope.prototype._getMeasurement = function( measure, dimension ) {
  var option = this.options[ measure ];
  var value;
  // Comentário: Se a opção for um número, usa diretamente.
  if ( !option ) {
    value = 0;
  } else if ( typeof option == 'string' ) {
    // Comentário: Se for um seletor CSS, obtém a medida do primeiro elemento correspondente.
    var elem = this.element.querySelector( option );
    value = elem && jQuery( elem ).css( dimension );
    value = value && parseFloat( value );
  } else {
    value = option;
  }
  this[ measure ] = value || 0;
};

// Fim da Parte 3
// Comentário: Define o namespace para os modos de layout do Isotope.
Isotope.LayoutMode = function( isotope ) {
  // Comentário: Associa a instância do Isotope ao modo de layout.
  this.isotope = isotope;
};

// Comentário: Objeto que armazena os diferentes modos de layout disponíveis (ex.: masonry, fitRows).
Isotope.LayoutMode.modes = {};

// Comentário: Cria um modo de layout específico, extendendo o protótipo base.
Isotope.LayoutMode.create = function( modeName ) {
  var Mode = function( isotope ) {
    Isotope.LayoutMode.call( this, isotope );
  };
  // Comentário: Estende o protótipo do modo de layout com métodos específicos.
  Mode.prototype = new Isotope.LayoutMode();
  Mode.prototype.constructor = Mode;
  Mode.prototype._modeName = modeName;
  // Comentário: Registra o modo de layout no objeto de modos.
  Isotope.LayoutMode.modes[ modeName ] = Mode;
  return Mode;
};

// Comentário: Método base para o layout, sobrescrito por cada modo específico (ex.: masonry).
Isotope.LayoutMode.prototype.layout = function() {
  // Comentário: Chama o método de posicionamento dos itens.
  this.isotope._resetLayout();
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona os itens no grid de acordo com o modo de layout.
Isotope.LayoutMode.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Aplica a posição calculada ao item.
    item.layout();
  }
  // Comentário: Emite evento para sinalizar que o layout foi aplicado.
  this.isotope.emitEvent( 'layoutComplete', [ this.isotope, items ] );
};

// Comentário: Define o modo de layout 'masonry', que organiza itens em colunas.
Isotope.LayoutMode.create('masonry');

// Comentário: Implementação específica do layout masonry.
Isotope.LayoutMode.modes.masonry.prototype.layout = function() {
  // Comentário: Reseta o estado do layout e inicializa variáveis para posicionamento.
  this.isotope._resetLayout();
  this.isotope._getMeasurement( 'columnWidth', 'width' );
  this.isotope._getMeasurement( 'gutter', 'width' );
  var containerWidth = this.isotope.element.offsetWidth;
  // Comentário: Calcula o número de colunas com base na largura do container.
  this.columnWidth = this.isotope.columnWidth || this.isotope.items[0] && this.isotope.items[0].size.outerWidth || containerWidth;
  this.columnWidth += this.isotope.gutter;
  this.cols = Math.floor( ( containerWidth + this.isotope.gutter ) / this.columnWidth );
  this.cols = Math.max( this.cols, 1 );
  // Comentário: Armazena as alturas de cada coluna para posicionamento.
  this.colYs = [];
  for ( var i=0; i < this.cols; i++ ) {
    this.colYs.push( 0 );
  }
  // Comentário: Posiciona cada item na coluna com menor altura.
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona um item no layout masonry.
Isotope.LayoutMode.modes.masonry.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Encontra a coluna com menor altura para posicionar o item.
    var minCol = Math.min.apply( Math, this.colYs );
    var col = this.colYs.indexOf( minCol );
    item.position.x = col * this.columnWidth;
    item.position.y = this.colYs[ col ];
    // Comentário: Atualiza a altura da coluna após adicionar o item.
    this.colYs[ col ] += item.size.outerHeight;
    item.layout();
  }
};

// Fim da Parte 4
// Comentário: Define o modo de layout 'fitRows', que organiza itens em linhas horizontais.
Isotope.LayoutMode.create('fitRows');

// Comentário: Implementação específica do layout fitRows.
Isotope.LayoutMode.modes.fitRows.prototype.layout = function() {
  // Comentário: Reseta o estado do layout e inicializa variáveis.
  this.isotope._resetLayout();
  this.isotope._getMeasurement( 'columnWidth', 'width' );
  this.isotope._getMeasurement( 'gutter', 'width' );
  var containerWidth = this.isotope.element.offsetWidth;
  // Comentário: Inicializa variáveis para rastrear a posição atual na linha.
  this.x = 0;
  this.y = 0;
  this.maxY = 0;
  // Comentário: Posiciona os itens em linhas, ajustando a posição x e y.
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona os itens no layout fitRows.
Isotope.LayoutMode.modes.fitRows.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Verifica se o item cabe na linha atual; se não, move para a próxima linha.
    if ( this.x != 0 && this.x + item.size.outerWidth > this.isotope.element.offsetWidth ) {
      this.x = 0;
      this.y = this.maxY;
    }
    // Comentário: Define a posição do item.
    item.position.x = this.x;
    item.position.y = this.y;
    // Comentário: Atualiza as coordenadas para o próximo item.
    this.x += item.size.outerWidth + this.isotope.gutter;
    this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
    item.layout();
  }
};

// Comentário: Define o modo de layout 'vertical', que empilha itens verticalmente.
Isotope.LayoutMode.create('vertical');

// Comentário: Implementação específica do layout vertical.
Isotope.LayoutMode.modes.vertical.prototype.layout = function() {
  // Comentário: Reseta o estado do layout.
  this.isotope._resetLayout();
  this.y = 0;
  // Comentário: Posiciona os itens empilhados verticalmente.
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona os itens no layout vertical.
Isotope.LayoutMode.modes.vertical.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Define a posição do item, empilhando-o abaixo do anterior.
    item.position.x = 0;
    item.position.y = this.y;
    this.y += item.size.outerHeight + this.isotope.gutter;
    item.layout();
  }
};

// Comentário: Método para aplicar a posição de um item no DOM com transições, se habilitadas.
Isotope.Item.prototype.layout = function() {
  // Comentário: Aplica estilos CSS para posicionar o item.
  var style = {};
  if ( this.isotope.options.percentPosition ) {
    // Comentário: Usa posicionamento em porcentagem para responsividade, se configurado.
    style.left = ( this.position.x / this.isotope.element.offsetWidth ) * 100 + '%';
    style.top = ( this.position.y / this.isotope.element.offsetHeight ) * 100 + '%';
  } else {
    style.left = this.position.x + 'px';
    style.top = this.position.y + 'px';
  }
  // Comentário: Aplica transformações CSS, se necessário.
  var transform = this.isotope.options.transformsEnabled ?
    'translate3d(' + this.position.x + 'px, ' + this.position.y + 'px, 0)' : '';
  if ( transform ) {
    style.transform = transform;
  }
  // Comentário: Aplica os estilos ao elemento com jQuery.
  jQuery( this.element ).css( style );
};

// Fim da Parte 5
// Comentário: Método para filtrar itens no grid com base em uma função ou seletor.
Isotope.prototype.filter = function( filter ) {
  // Comentário: Armazena a função de filtro ou converte um seletor CSS em uma função.
  var filterFn = typeof filter == 'function' ? filter :
    typeof filter == 'string' ? function( item ) {
      return jQuery( item.element ).is( filter );
    } : function() { return true; };
  
  // Comentário: Aplica o filtro a cada item e atualiza sua visibilidade.
  this._filter( filterFn );
  // Comentário: Reorganiza o layout após o filtro.
  this.layout();
};

// Comentário: Aplica a função de filtro aos itens, marcando-os como visíveis ou ocultos.
Isotope.prototype._filter = function( filterFn ) {
  this.filteredItems = [];
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    // Comentário: Verifica se o item passa pelo filtro.
    var isFiltered = filterFn.call( this, item );
    item.isHidden = !isFiltered;
    // Comentário: Adiciona itens filtrados à lista de itens visíveis.
    if ( isFiltered ) {
      this.filteredItems.push( item );
    }
    // Comentário: Aplica estilos para ocultar ou mostrar o item.
    item._updateStyle();
  }
};

// Comentário: Método para ordenar itens no grid com base em uma função de comparação.
Isotope.prototype.sort = function( sortBy ) {
  // Comentário: Armazena a função de ordenação ou cria uma com base em uma propriedade.
  var sortFn = typeof sortBy == 'function' ? sortBy :
    typeof sortBy == 'string' ? function( item ) {
      return jQuery( item.element ).attr( sortBy );
    } : function() { return 0; };
  
  // Comentário: Ordena os itens com base na função fornecida.
  this.items.sort( sortFn );
  // Comentário: Reorganiza o layout após a ordenação.
  this.layout();
};

// Comentário: Método para atualizar o estilo de um item (ex.: ocultar/mostrar).
Isotope.Item.prototype._updateStyle = function() {
  var style = {};
  // Comentário: Define a visibilidade do item com base no estado isHidden.
  if ( this.isHidden ) {
    style.display = 'none';
  } else {
    style.display = '';
    // Comentário: Reaplica a posição do item, se necessário.
    this.layout();
  }
  // Comentário: Aplica os estilos ao elemento com jQuery.
  jQuery( this.element ).css( style );
};

// Comentário: Método para destruir um item, removendo-o do DOM e limpando referências.
Isotope.Item.prototype.destroy = function() {
  // Comentário: Remove o elemento do DOM.
  jQuery( this.element ).remove();
};

// Comentário: Método para obter o tamanho de um item, incluindo margens.
Isotope.Item.prototype.getSize = function() {
  this.size = this.size || {};
  var elem = jQuery( this.element );
  // Comentário: Calcula dimensões externas, incluindo margens.
  this.size.width = elem.outerWidth( true );
  this.size.outerWidth = this.size.width;
  this.size.height = elem.outerHeight( true );
  this.size.outerHeight = this.size.height;
};

// Fim da Parte 6
// Comentário: Método para emitir eventos personalizados, permitindo que outros scripts escutem ações do Isotope.
Isotope.prototype.emitEvent = function( eventName, args ) {
  // Comentário: Cria um evento jQuery personalizado com o namespace do Isotope.
  var event = jQuery.Event( eventName );
  event.isotope = this;
  // Comentário: Dispara o evento no elemento principal.
  jQuery( this.element ).trigger( event, args );
};

// Comentário: Método para vincular um manipulador de eventos a um tipo de evento específico.
Isotope.prototype.on = function( eventName, listener ) {
  // Comentário: Usa o jQuery para adicionar o ouvinte de eventos ao elemento.
  jQuery( this.element ).on( eventName, listener );
};

// Comentário: Método para remover um manipulador de eventos.
Isotope.prototype.off = function( eventName, listener ) {
  // Comentário: Usa o jQuery para remover o ouvinte de eventos.
  jQuery( this.element ).off( eventName, listener );
};

// Comentário: Método para configurar transições CSS para animações.
Isotope.prototype._setupTransition = function() {
  // Comentário: Verifica se as transições estão habilitadas nas opções.
  if ( !this.options.transitionDuration ) {
    return;
  }
  // Comentário: Define a propriedade CSS de transição com base na duração especificada.
  var transitionValue = 'all ' + this.options.transitionDuration + ' ease';
  jQuery( this.element ).css({
    transition: transitionValue
  });
  // Comentário: Aplica a mesma transição aos itens do grid.
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i].element.style.transition = transitionValue;
  }
};

// Comentário: Método para desabilitar transições temporariamente (ex.: durante layouts instantâneos).
Isotope.prototype._disableTransition = function() {
  var style = {
    transition: ''
  };
  // Comentário: Remove a propriedade de transição do container e dos itens.
  jQuery( this.element ).css( style );
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i].element.style.transition = '';
  }
};

// Comentário: Método para executar um layout sem transições e restaurar transições depois.
Isotope.prototype._layoutNoTransition = function() {
  // Comentário: Desabilita transições para evitar animações durante o layout.
  this._disableTransition();
  // Comentário: Executa o layout.
  this.layout();
  // Comentário: Restaura as transições após o layout.
  this._setupTransition();
};

// Comentário: Método utilitário para obter o valor de uma propriedade CSS com unidade (ex.: px, %).
Isotope.prototype._getStyleValue = function( style, prop ) {
  var value = style[ prop ];
  // Comentário: Se o valor for um número, assume que é em pixels.
  if ( typeof value == 'number' ) {
    value = value + 'px';
  }
  return value;
};

// Fim da Parte 7
// Comentário: Método para gerenciar elementos "stamps" (itens fixos que afetam o layout, como cabeçalhos).
Isotope.prototype._manageStamp = function( stamp ) {
  // Comentário: Obtém as dimensões e posição do elemento stamp.
  var $stamp = jQuery( stamp );
  var offset = $stamp.position();
  var width = $stamp.outerWidth( true );
  var height = $stamp.outerHeight( true );
  // Comentário: Registra o stamp no layout para que os itens o contornem.
  this.stamps.push( stamp );
  // Comentário: Aplica posicionamento fixo ao stamp, se necessário.
  this.layoutMode._manageStamp( stamp, offset.left, offset.top, width, height );
};

// Comentário: Método no modo de layout para integrar stamps ao posicionamento dos itens.
Isotope.LayoutMode.prototype._manageStamp = function( stamp, x, y, width, height ) {
  // Comentário: No modo masonry, ajusta as alturas das colunas afetadas pelo stamp.
  if ( this.isotope.options.layoutMode == 'masonry' ) {
    var colStart = Math.floor( x / this.columnWidth );
    var colEnd = Math.floor( ( x + width ) / this.columnWidth );
    colStart = Math.max( 0, colStart );
    colEnd = Math.min( this.cols - 1, colEnd );
    // Comentário: Atualiza a altura das colunas onde o stamp está presente.
    for ( var i = colStart; i <= colEnd; i++ ) {
      this.colYs[ i ] = Math.max( this.colYs[ i ], y + height );
    }
  }
};

// Comentário: Método para remover stamps do layout.
Isotope.prototype.unstamp = function( elements ) {
  var $elems = jQuery( elements );
  // Comentário: Remove os elementos da lista de stamps.
  for ( var i=0; i < $elems.length; i++ ) {
    var index = this.stamps.indexOf( $elems[i] );
    if ( index != -1 ) {
      this.stamps.splice( index, 1 );
    }
  }
  // Comentário: Reorganiza o layout após remover os stamps.
  this.layout();
};

// Comentário: Método para atualizar as dimensões dos itens (ex.: após redimensionamento).
Isotope.prototype._updateItemsSizes = function() {
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i].getSize();
  }
};

// Comentário: Método utilitário para verificar se um elemento está contido no grid.
Isotope.prototype._checkIfContained = function( elem ) {
  return jQuery.contains( this.element, elem );
};

// Comentário: Método para destruir a instância do Isotope, limpando configurações e eventos.
Isotope.prototype.destroy = function() {
  // Comentário: Remove estilos aplicados ao container.
  this.element.style.position = '';
  this.element.style.height = '';
  // Comentário: Remove transições e estilos dos itens.
  this._disableTransition();
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i].destroy();
  }
  // Comentário: Remove manipuladores de eventos.
  jQuery( this.element ).off( '.isotope' );
  // Comentário: Limpa referências internas.
  this.items = [];
  this.stamps = [];
  this.layoutMode = null;
};

// Fim da Parte 8
// Comentário: Integra o Isotope como um plugin jQuery, permitindo chamadas como $(selector).isotope().
jQuery.fn.isotope = function( arg0, arg1 ) {
  var isMethodCall = typeof arg0 == 'string';
  var args = Array.prototype.slice.call( arguments, 1 );
  // Comentário: Itera sobre cada elemento selecionado pelo jQuery.
  return this.each(function() {
    var $this = jQuery( this );
    var instance = $this.data( 'isotope' );
    // Comentário: Se não há instância, cria uma nova com as opções fornecidas.
    if ( !instance && !isMethodCall ) {
      $this.data( 'isotope', new Isotope( this, arg0 ) );
    } else if ( isMethodCall && instance ) {
      // Comentário: Se for uma chamada de método, executa o método na instância.
      if ( typeof instance[ arg0 ] == 'function' ) {
        instance[ arg0 ].apply( instance, args );
      } else {
        console.warn( 'No such method ' + arg0 + ' for Isotope' );
      }
    }
  });
};

// Comentário: Método para obter a instância do Isotope associada a um elemento.
jQuery.fn.isotope.data = function( elem ) {
  return jQuery( elem ).data( 'isotope' );
};

// Comentário: Adiciona métodos de conveniência ao plugin jQuery para ações comuns.
jQuery.each( [
  'addItems',
  'remove',
  'filter',
  'sort',
  'layout',
  'destroy'
], function( i, method ) {
  // Comentário: Cria métodos como $(selector).isotope('method', args).
  jQuery.fn.isotope[ method ] = function() {
    var args = Array.prototype.slice.call( arguments );
    args.unshift( method );
    return this.isotope.apply( this, args );
  };
});

// Comentário: Método para inicializar o Isotope em elementos após o carregamento de imagens.
Isotope.prototype.imagesLoaded = function( callback ) {
  // Comentário: Requer o plugin imagesLoaded (não incluído no Isotope).
  if ( !jQuery.fn.imagesLoaded ) {
    console.warn( 'imagesLoaded not available' );
    callback();
    return;
  }
  // Comentário: Executa o layout após todas as imagens serem carregadas.
  jQuery( this.element ).imagesLoaded().always( function() {
    this.layout();
    callback();
  }.bind( this ));
};

// Comentário: Método para configurar o Isotope com opções após a inicialização.
Isotope.prototype.option = function( opts ) {
  // Comentário: Mescla as novas opções com as existentes e atualiza o layout.
  if ( jQuery.isPlainObject( opts ) ) {
    this.options = jQuery.extend( true, this.options, opts );
    this.layout();
  }
};

// Comentário: Método para recarregar itens do grid (ex.: após mudanças no DOM).
Isotope.prototype.reloadItems = function() {
  // Comentário: Limpa a lista de itens e recarrega com base no seletor.
  this.items = [];
  this.getItems();
  this.layout();
};

// Fim da Parte 9
// Comentário: Método para lidar com redimensionamento do container, ajustando o layout.
Isotope.prototype._resize = function() {
  // Comentário: Executa o layout para reorganizar os itens com base no novo tamanho.
  this.layout();
};

// Comentário: Método para configurar o evento de redimensionamento (resize) no elemento.
Isotope.prototype.bindResize = function() {
  // Comentário: Vincula o evento de redimensionamento à janela, com um debounce para evitar chamadas excessivas.
  var _this = this;
  var isResizing = false;
  jQuery( window ).on( 'resize.isotope', function() {
    if ( isResizing ) {
      return;
    }
    isResizing = true;
    setTimeout( function() {
      _this._resize();
      isResizing = false;
    }, 100 );
  });
};

// Comentário: Método para remover o evento de redimensionamento.
Isotope.prototype.unbindResize = function() {
  // Comentário: Desvincula o evento de resize da janela.
  jQuery( window ).off( 'resize.isotope' );
};

// Comentário: Método para verificar se o layout precisa ser atualizado devido a mudanças no container.
Isotope.prototype.needsResizeLayout = function() {
  // Comentário: Verifica se a largura do container mudou desde o último layout.
  var width = jQuery( this.element ).width();
  if ( this._previousWidth !== width ) {
    this._previousWidth = width;
    return true;
  }
  return false;
};

// Comentário: Método para obter a posição de um item no grid.
Isotope.Item.prototype.getPosition = function() {
  this.position = this.position || {};
  var style = jQuery( this.element ).css( [ 'left', 'top' ] );
  // Comentário: Extrai as posições left e top do estilo CSS do item.
  this.position.x = parseFloat( style.left ) || 0;
  this.position.y = parseFloat( style.top ) || 0;
};

// Comentário: Método para atualizar as dimensões do container após mudanças no layout.
Isotope.prototype._updateContainerSize = function() {
  // Comentário: Ajusta a altura do container com base no modo de layout.
  if ( this.options.layoutMode == 'masonry' ) {
    var maxY = Math.max.apply( Math, this.items.map(function( item ) {
      return item.position.y + item.size.height;
    }));
    this.element.style.height = maxY + this.gutter + 'px';
  } else if ( this.options.layoutMode == 'fitRows' ) {
    this.element.style.height = this.layoutMode.maxY + this.gutter + 'px';
  } else if ( this.options.layoutMode == 'vertical' ) {
    this.element.style.height = this.layoutMode.y + this.gutter + 'px';
  }
};

// Fim da Parte 10
// Comentário: Método para mostrar itens previamente ocultos.
Isotope.prototype.revealItemElements = function( elems ) {
  // Comentário: Converte elementos em instâncias de Item e marca como visíveis.
  var items = this._itemize( elems );
  for ( var i=0; i < items.length; i++ ) {
    items[i].isHidden = false;
    items[i]._updateStyle();
  }
  // Comentário: Atualiza o layout para refletir os itens revelados.
  this.layout();
};

// Comentário: Método para ocultar itens no grid.
Isotope.prototype.hideItemElements = function( elems ) {
  // Comentário: Converte elementos em instâncias de Item e marca como ocultos.
  var items = this._itemize( elems );
  for ( var i=0; i < items.length; i++ ) {
    items[i].isHidden = true;
    items[i]._updateStyle();
  }
  // Comentário: Atualiza o layout após ocultar os itens.
  this.layout();
};

// Comentário: Método para alternar a visibilidade de itens (mostrar/ocultar).
Isotope.prototype.toggleItemElements = function( elems ) {
  // Comentário: Converte elementos em instâncias de Item e inverte o estado de visibilidade.
  var items = this._itemize( elems );
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    item.isHidden = !item.isHidden;
    item._updateStyle();
  }
  // Comentário: Atualiza o layout após a alternância.
  this.layout();
};

// Comentário: Método para aplicar transições de opacidade, se habilitadas.
Isotope.Item.prototype._updateOpacity = function() {
  // Comentário: Define a opacidade com base no estado de visibilidade.
  var style = {
    opacity: this.isHidden ? 0 : 1
  };
  // Comentário: Adiciona transição de opacidade, se configurada.
  if ( this.isotope.options.transitionDuration ) {
    style.transition = 'opacity ' + this.isotope.options.transitionDuration;
  }
  jQuery( this.element ).css( style );
};

// Comentário: Método para obter todos os itens visíveis no grid.
Isotope.prototype.getFilteredItemElements = function() {
  // Comentário: Retorna os elementos DOM dos itens que não estão ocultos.
  var filtered = [];
  for ( var i=0; i < this.items.length; i++ ) {
    if ( !this.items[i].isHidden ) {
      filtered.push( this.items[i].element );
    }
  }
  return filtered;
};

// Comentário: Método para obter todos os itens do grid, visíveis ou não.
Isotope.prototype.getItemElements = function() {
  // Comentário: Retorna os elementos DOM de todos os itens.
  var elements = [];
  for ( var i=0; i < this.items.length; i++ ) {
    elements.push( this.items[i].element );
  }
  return elements;
};

// Fim da Parte 11
// Comentário: Método para integrar com o plugin packery (se disponível), que é um layout alternativo.
Isotope.prototype.packery = function( arg0, arg1 ) {
  // Comentário: Verifica se o modo de layout packery está disponível.
  if ( !Isotope.LayoutMode.modes.packery ) {
    console.warn( 'Packery layout mode not available' );
    return;
  }
  // Comentário: Configura o modo de layout como packery e aplica argumentos.
  this.options.layoutMode = 'packery';
  this._getLayoutMode();
  if ( typeof arg0 == 'string' ) {
    this.layoutMode[ arg0 ].apply( this.layoutMode, Array.prototype.slice.call( arguments, 1 ) );
  } else {
    this.layout();
  }
};

// Comentário: Método para integrar com o plugin draggable (ex.: jQuery UI Draggable).
Isotope.prototype.draggable = function( arg0, arg1 ) {
  // Comentário: Verifica se o jQuery UI Draggable está disponível.
  if ( !jQuery.fn.draggable ) {
    console.warn( 'jQuery UI Draggable not available' );
    return;
  }
  // Comentário: Aplica a funcionalidade draggable aos itens do grid.
  var $items = jQuery( this.getItemElements() );
  $items.draggable( arg0 );
  // Comentário: Vincula eventos de arrastar para atualizar o layout.
  var _this = this;
  $items.on( 'dragstop.isotope', function( event, ui ) {
    var item = _this._getItemByElement( this );
    if ( item ) {
      item.getPosition();
      _this.layout();
    }
  });
};

// Comentário: Método utilitário para encontrar um item pelo seu elemento DOM.
Isotope.prototype._getItemByElement = function( elem ) {
  // Comentário: Busca o item correspondente ao elemento na lista de itens.
  for ( var i=0; i < this.items.length; i++ ) {
    if ( this.items[i].element == elem ) {
      return this.items[i];
    }
  }
};

// Comentário: Método para obter a instância do Isotope associada a um elemento.
Isotope.data = function( elem ) {
  // Comentário: Usa o método de dados do jQuery para recuperar a instância.
  return jQuery.fn.isotope.data( elem );
};

// Comentário: Finaliza a definição do Isotope, retornando a classe para uso global ou modular.
return Isotope;

// Comentário: Fecha a função factory e a IIFE (Immediately Invoked Function Expression).
}));

// Comentário: Fim do código principal do Isotope. As próximas seções podem incluir extensões ou dependências.

// Comentário: Define o objeto Item, usado para representar cada elemento do grid.
Isotope.Item = function( elem, isotope ) {
  // Comentário: Inicializa o item com o elemento DOM e a instância do Isotope.
  this.element = elem;
  this.isotope = isotope;
  this.isHidden = false;
  // Comentário: Calcula o tamanho inicial do item.
  this.getSize();
  this.getPosition();
};

// Fim da Parte 12
// Comentário: Estende o protótipo do Item com métodos do Outlayer.Item, se disponível.
Isotope.Item.prototype = jQuery.extend( {}, Outlayer.Item.prototype );

// Comentário: Método para inicializar um item (chamado automaticamente na criação).
Isotope.Item.prototype._create = function() {
  // Comentário: Define o ID único do item para rastreamento interno.
  this.id = this.isotope.itemGUID ? ++this.isotope.itemGUID : 0;
  // Comentário: Inicializa as propriedades de posicionamento e tamanho.
  this.getSize();
  this.getPosition();
  // Comentário: Aplica estilos iniciais ao elemento, como posicionamento absoluto.
  jQuery( this.element ).css({ position: 'absolute' });
};

// Comentário: Método para atualizar a posição de um item no DOM.
Isotope.Item.prototype._updatePosition = function() {
  // Comentário: Aplica a posição calculada (x, y) ao elemento com base nas opções.
  var style = {};
  if ( this.isotope.options.percentPosition ) {
    style.left = ( this.position.x / this.isotope.element.offsetWidth ) * 100 + '%';
    style.top = ( this.position.y / this.isotope.element.offsetHeight ) * 100 + '%';
  } else {
    style.left = this.position.x + 'px';
    style.top = this.position.y + 'px';
  }
  jQuery( this.element ).css( style );
};

// Comentário: Define o modo de layout 'cellsByRow', que organiza itens em uma grade de células.
Isotope.LayoutMode.create('cellsByRow');

// Comentário: Implementação específica do layout cellsByRow.
Isotope.LayoutMode.modes.cellsByRow.prototype.layout = function() {
  // Comentário: Reseta o estado do layout e inicializa variáveis.
  this.isotope._resetLayout();
  this.isotope._getMeasurement( 'columnWidth', 'width' );
  this.isotope._getMeasurement( 'gutter', 'width' );
  var containerWidth = this.isotope.element.offsetWidth;
  // Comentário: Calcula o número de colunas com base na largura do container.
  this.columnWidth = this.isotope.columnWidth || this.isotope.items[0] && this.isotope.items[0].size.outerWidth || containerWidth;
  this.cols = Math.floor( ( containerWidth + this.isotope.gutter ) / this.columnWidth );
  this.cols = Math.max( this.cols, 1 );
  this.rowHeight = this.isotope.options.rowHeight || this.isotope.items[0] && this.isotope.items[0].size.outerHeight || this.columnWidth;
  // Comentário: Posiciona os itens em uma grade de células (linhas e colunas).
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona os itens no layout cellsByRow.
Isotope.LayoutMode.modes.cellsByRow.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Calcula a posição do item com base na linha e coluna.
    var col = i % this.cols;
    var row = Math.floor( i / this.cols );
    item.position.x = col * ( this.columnWidth + this.isotope.gutter );
    item.position.y = row * ( this.rowHeight + this.isotope.gutter );
    item.layout();
  }
};

// Fim da Parte 13
// Comentário: Define o modo de layout 'horizontal', que organiza itens em uma linha horizontal.
Isotope.LayoutMode.create('horizontal');

// Comentário: Implementação específica do layout horizontal.
Isotope.LayoutMode.modes.horizontal.prototype.layout = function() {
  // Comentário: Reseta o estado do layout e inicializa variáveis.
  this.isotope._resetLayout();
  this.isotope._getMeasurement( 'rowHeight', 'height' );
  this.isotope._getMeasurement( 'gutter', 'width' );
  // Comentário: Inicializa a posição x para organizar itens horizontalmente.
  this.x = 0;
  // Comentário: Posiciona os itens em uma linha horizontal.
  this._layoutItems( this.isotope.items );
};

// Comentário: Posiciona os itens no layout horizontal.
Isotope.LayoutMode.modes.horizontal.prototype._layoutItems = function( items ) {
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    // Comentário: Define a posição do item na linha horizontal.
    item.position.x = this.x;
    item.position.y = 0;
    // Comentário: Atualiza a posição x para o próximo item.
    this.x += item.size.outerWidth + this.isotope.gutter;
    item.layout();
  }
  // Comentário: Ajusta a largura do container para acomodar todos os itens.
  this.isotope.element.style.width = this.x + 'px';
};

// Comentário: Método para obter a largura total do grid (usado em layouts como horizontal).
Isotope.prototype.getHorizontalWidth = function() {
  // Comentário: Calcula a largura total com base nos itens visíveis.
  var width = 0;
  for ( var i=0; i < this.items.length; i++ ) {
    if ( !this.items[i].isHidden ) {
      width += this.items[i].size.outerWidth + this.gutter;
    }
  }
  return width;
};

// Comentário: Método para atualizar a visibilidade dos itens com base no filtro.
Isotope.prototype._updateItemsSortData = function( items ) {
  // Comentário: Atualiza os dados de ordenação de cada item, se necessário.
  for ( var i=0; i < items.length; i++ ) {
    var item = items[i];
    item._updateSortData();
  }
};

// Comentário: Método para atualizar os dados de ordenação de um item.
Isotope.Item.prototype._updateSortData = function() {
  // Comentário: Armazena dados usados para ordenação, como atributos do elemento.
  if ( this.isotope.options.getSortData ) {
    var _this = this;
    this.sortData = {};
    jQuery.each( this.isotope.options.getSortData, function( key, getSortValue ) {
      _this.sortData[ key ] = getSortValue( _this.element, _this );
    });
  }
};

// Fim da Parte 14
// Comentário: Método para obter os dados de ordenação de todos os itens.
Isotope.prototype.getSortData = function() {
  // Comentário: Coleta os dados de ordenação de cada item visível.
  var sortData = {};
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( !item.isHidden ) {
      sortData[ item.id ] = item.sortData;
    }
  }
  return sortData;
};

// Comentário: Método para aplicar uma ordenação específica com base em uma chave.
Isotope.prototype.arrangeBy = function( sortBy ) {
  // Comentário: Configura a função de ordenação com base na chave fornecida.
  var sortFn = this.options.getSortData && this.options.getSortData[ sortBy ] ?
    function( item ) {
      return item.sortData[ sortBy ];
    } : function() { return 0; };
  // Comentário: Aplica a ordenação e atualiza o layout.
  this.sort( sortFn );
};

// Comentário: Método para verificar se um item está no layout atual.
Isotope.prototype._isItemInLayout = function( item ) {
  // Comentário: Verifica se o item está na lista de itens filtrados (visíveis).
  return this.filteredItems.indexOf( item ) != -1;
};

// Comentário: Método para atualizar a lista de itens filtrados após mudanças.
Isotope.prototype._updateFilteredItems = function() {
  // Comentário: Reaplica o filtro atual para atualizar a lista de itens visíveis.
  this._filter( this._filterFn || function() { return true; } );
};

// Comentário: Método para obter o elemento DOM associado a um item.
Isotope.Item.prototype.getElement = function() {
  return this.element;
};

// Comentário: Método para clonar um item, criando uma cópia no grid.
Isotope.Item.prototype.clone = function() {
  // Comentário: Cria uma cópia do elemento DOM e adiciona ao grid.
  var $clone = jQuery( this.element ).clone();
  this.isotope.element.append( $clone );
  return new Isotope.Item( $clone[0], this.isotope );
};

// Comentário: Método para atualizar a classe CSS de um item com base em seu estado.
Isotope.Item.prototype._updateClasses = function() {
  // Comentário: Adiciona ou remove classes como 'is-hidden' com base no estado.
  jQuery( this.element )
    .toggleClass( 'is-hidden', this.isHidden );
};

// Fim da Parte 15
// Comentário: Método para atualizar o layout após mudanças nos itens ou opções.
Isotope.prototype.updateSortData = function( elems ) {
  // Comentário: Converte elementos em instâncias de Item, se necessário.
  var items;
  if ( elems ) {
    items = this._itemize( elems );
  } else {
    items = this.items;
  }
  // Comentário: Atualiza os dados de ordenação para os itens especificados.
  this._updateItemsSortData( items );
};

// Comentário: Método para verificar se o layout precisa ser atualizado.
Isotope.prototype.needsLayout = function() {
  // Comentário: Verifica se houve mudanças no tamanho do container ou nos itens.
  if ( this.needsResizeLayout() ) {
    return true;
  }
  // Comentário: Verifica se algum item mudou de tamanho ou posição.
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( item.needsUpdate ) {
      return true;
    }
  }
  return false;
};

// Comentário: Método para marcar um item como necessitando de atualização.
Isotope.Item.prototype._setNeedsUpdate = function() {
  this.needsUpdate = true;
};

// Comentário: Método para verificar se um item precisa de atualização.
Isotope.Item.prototype._checkIfNeedsUpdate = function() {
  // Comentário: Compara o tamanho atual do item com o armazenado.
  var size = this.getSize();
  if ( size.width != this.size.width || size.height != this.size.height ) {
    this.size = size;
    this.needsUpdate = true;
  }
};

// Comentário: Método para aplicar classes CSS ao container com base no estado.
Isotope.prototype._updateClasses = function() {
  // Comentário: Adiciona classes como 'isotope' ao container.
  jQuery( this.element ).addClass( 'isotope' );
  // Comentário: Atualiza classes de todos os itens.
  for ( var i=0; i < this.items.length; i++ ) {
    this.items[i]._updateClasses();
  }
};

// Comentário: Método para inicializar o Isotope automaticamente após a criação.
Isotope.prototype._init = function() {
  // Comentário: Configura transições, classes e eventos de redimensionamento.
  this._setupTransition();
  this._updateClasses();
  this.bindResize();
  // Comentário: Executa o layout inicial.
  this.layout();
};

// Fim da Parte 16
