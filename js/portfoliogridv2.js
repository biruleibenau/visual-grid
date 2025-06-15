/*!
 * Isotope PACKAGED v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */

/**
 * Bridget makes jQuery widgets
 * v2.0.1
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Isso permite que o código funcione em diversos contextos, como com RequireJS, Node.js ou diretamente no navegador
( function( window, factory ) {
  // universal module definition
  /*jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD (Asynchronous Module Definition, usado em bibliotecas como RequireJS)
    define( 'jquery-bridget/jquery-bridget',[ 'jquery' ], function( jQuery ) {
      // Define o módulo e passa a janela (window) e o jQuery para a função factory
      return factory( window, jQuery );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS (usado em ambientes como Node.js)
    module.exports = factory(
      window,
      require('jquery') // Carrega o jQuery como dependência
    );
  } else {
    // Browser global: define a função diretamente no objeto window
    window.jQueryBridget = factory(
      window,
      window.jQuery // Usa o jQuery global, se disponível
    );
  }

}( window, function factory( window, jQuery ) {
'use strict';

// ----- utils ----- //

// Armazena o método slice do Array para uso posterior (converte argumentos em array)
var arraySlice = Array.prototype.slice;

// Função auxiliar para logar erros no console, mantendo a cadeia jQuery intacta
// Evita usar $.error, que quebraria o encadeamento de métodos jQuery
var console = window.console;
var logError = typeof console == 'undefined' ? function() {} :
  function( message ) {
    console.error( message ); // Exibe mensagem de erro no console, se disponível
  };

// ----- jQueryBridget ----- //

// Função principal que cria um plugin jQuery para uma classe específica
// namespace: nome do plugin (ex.: 'isotope')
// PluginClass: a classe construtora (ex.: Isotope)
// $: instância do jQuery
function jQueryBridget( namespace, PluginClass, $ ) {
  // Garante que $ seja o jQuery, seja ele passado como argumento ou disponível globalmente
  $ = $ || jQuery || window.jQuery;
  if ( !$ ) {
    return; // Sai se o jQuery não estiver disponível
  }

  // Adiciona o método `option` à classe do plugin, se ainda não existir
  // Permite configurar opções dinamicamente via $().plugin('option', {...})
  if ( !PluginClass.prototype.option ) {
    // option setter
    PluginClass.prototype.option = function( opts ) {
      // Verifica se opts é um objeto válido; se não for, sai sem fazer nada
      if ( !$.isPlainObject( opts ) ){
        return;
      }
      // Mescla as opções fornecidas com as opções existentes, usando $.extend
      // O parâmetro `true` garante uma cópia profunda (deep copy)
      this.options = $.extend( true, this.options, opts );
    };
  }

  // Cria o plugin jQuery no formato $.fn[namespace]
  // Ex.: para o Isotope, cria $.fn.isotope
  $.fn[ namespace ] = function( arg0 /*, arg1 */ ) {
    // Se o primeiro argumento for uma string, é uma chamada de método
    // Ex.: $().isotope('layout')
    if ( typeof arg0 == 'string' ) {
      // Converte os argumentos adicionais em um array, ignorando o primeiro (methodName)
      var args = arraySlice.call( arguments, 1 );
      return methodCall( this, arg0, args ); // Chama a função methodCall para executar o método
    }
    // Caso contrário, é uma inicialização do plugin com opções
    // Ex.: $().isotope({ layoutMode: 'masonry' })
    plainCall( this, arg0 );
    return this; // Mantém o encadeamento jQuery
  };

  // Função interna para lidar com chamadas de métodos
  // Ex.: $().isotope('layout', ...)
  function methodCall( $elems, methodName, args ) {
    var returnValue; // Armazena o valor retornado pelo método, se houver
    var pluginMethodStr = '$().' + namespace + '("' + methodName + '")'; // String para mensagens de erro

    // Itera sobre cada elemento jQuery selecionado
    $elems.each( function( i, elem ) {
      // Obtém a instância do plugin associada ao elemento via $.data
      var instance = $.data( elem, namespace );
      if ( !instance ) {
        // Se não houver instância, exibe um erro e continua
        logError( namespace + ' not initialized. Cannot call methods, i.e. ' +
          pluginMethodStr );
        return;
      }

      // Obtém o método solicitado da instância
      var method = instance[ methodName ];
      if ( !method || methodName.charAt(0) == '_' ) {
        // Se o método não existir ou for privado (começa com '_'), exibe um erro
        logError( pluginMethodStr + ' is not a valide method' );
        return;
      }

      // Aplica o método com os argumentos fornecidos e captura o valor retornado
      var value = method.apply( instance, args );
      // Armazena o primeiro valor retornado, se houver
      returnValue = returnValue === undefined ? value : returnValue;
    });

    // Retorna o valor do método (se houver) ou o conjunto de elementos jQuery
    return returnValue !== undefined ? returnValue : $elems;
  }

  // Função interna para inicializar ou atualizar o plugin
  // Ex.: $().isotope({ options })
  function plainCall( $elems, options ) {
    // Itera sobre cada elemento jQuery selecionado
    $elems.each( function( i, elem ) {
      // Verifica se já existe uma instância do plugin para o elemento
      var instance = $.data( elem, namespace );
      if ( instance ) {
        // Se já existe, atualiza as opções e chama o método _init
        instance.option( options );
        instance._init();
      } else {
        // Se não existe, cria uma nova instância do plugin e a associa ao elemento
        instance = new PluginClass( elem, options );
        $.data( elem, namespace, instance );
      }
    });
  }

  // Atualiza o jQuery com a função bridget, para compatibilidade
  updateJQuery( $ );

}

// ----- updateJQuery ----- //

// Função para garantir compatibilidade com versões anteriores do jQuery
// Adiciona $.bridget ao jQuery, se ainda não estiver presente
function updateJQuery( $ ) {
  if ( !$ || ( $ && $.bridget ) ) {
    return; // Sai se o jQuery não existe ou já tem $.bridget
  }
  $.bridget = jQueryBridget; // Atribui a função jQueryBridget ao jQuery
}

// Chama updateJQuery com o jQuery disponível (global ou passado)
updateJQuery( jQuery || window.jQuery );

// Retorna a função jQueryBridget para uso como módulo
return jQueryBridget;

}));

/**
 * EvEmitter v1.1.0
 * Lil' event emitter
 * MIT License
 */

/* jshint unused: true, undef: true, strict: true */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Permite que o EvEmitter seja usado com RequireJS, Node.js ou diretamente no navegador
( function( global, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, window */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS: define o módulo sem dependências
    define( 'ev-emitter/ev-emitter', factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack: exporta o resultado da factory
    module.exports = factory();
  } else {
    // Browser globals: adiciona EvEmitter ao objeto global (window)
    global.EvEmitter = factory();
  }

}( typeof window != 'undefined' ? window : this, function() {

// Construtor da classe EvEmitter, que será usada para criar instâncias de emissores de eventos
function EvEmitter() {}

var proto = EvEmitter.prototype;

// Método `on`: registra um listener para um evento específico
proto.on = function( eventName, listener ) {
  // Verifica se o nome do evento e o listener são válidos; se não, sai
  if ( !eventName || !listener ) {
    return;
  }
  // Inicializa o objeto de eventos (_events) se ainda não existir
  // _events é um hash onde a chave é o nome do evento e o valor é um array de listeners
  var events = this._events = this._events || {};
  // Inicializa o array de listeners para o evento especificado, se necessário
  var listeners = events[ eventName ] = events[ eventName ] || [];
  // Adiciona o listener apenas se ele ainda não estiver registrado (evita duplicatas)
  if ( listeners.indexOf( listener ) == -1 ) {
    listeners.push( listener );
  }

  // Retorna `this` para permitir encadeamento de métodos (ex.: obj.on().on())
  return this;
};

// Método `once`: registra um listener que será executado apenas uma vez
proto.once = function( eventName, listener ) {
  // Verifica se o nome do evento e o listener são válidos; se não, sai
  if ( !eventName || !listener ) {
    return;
  }
  // Registra o listener usando o método `on`
  this.on( eventName, listener );
  // Inicializa o objeto de eventos "once" (_onceEvents) se ainda não existir
  // _onceEvents rastreia quais listeners devem ser executados apenas uma vez
  var onceEvents = this._onceEvents = this._onceEvents || {};
  // Inicializa o objeto de listeners "once" para o evento especificado
  var onceListeners = onceEvents[ eventName ] = onceEvents[ eventName ] || {};
  // Marca o listener como "once" (será removido após a primeira execução)
  onceListeners[ listener ] = true;

  // Retorna `this` para encadeamento
  return this;
};

// Método `off`: remove um listener de um evento específico
proto.off = function( eventName, listener ) {
  // Obtém o array de listeners para o evento especificado, se existir
  var listeners = this._events && this._events[ eventName ];
  // Sai se não houver listeners ou se o array estiver vazio
  if ( !listeners || !listeners.length ) {
    return;
  }
  // Encontra o índice do listener no array
  var index = listeners.indexOf( listener );
  // Remove o listener se encontrado
  if ( index != -1 ) {
    listeners.splice( index, 1 );
  }

  // Retorna `this` para encadeamento
  return this;
};

// Método `emitEvent`: dispara um evento, chamando todos os listeners associados
proto.emitEvent = function( eventName, args ) {
  // Obtém o array de listeners para o evento, se existir
  var listeners = this._events && this._events[ eventName ];
  // Sai se não houver listeners ou se o array estiver vazio
  if ( !listeners || !listeners.length ) {
    return;
  }
  // Faz uma cópia do array de listeners para evitar problemas se `off` for chamado durante a execução
  listeners = listeners.slice(0);
  // Garante que args seja um array; se não for fornecido, usa array vazio
  args = args || [];
  // Obtém o objeto de listeners "once" para o evento, se existir
  var onceListeners = this._onceEvents && this._onceEvents[ eventName ];

  // Itera sobre os listeners
  for ( var i=0; i < listeners.length; i++ ) {
    var listener = listeners[i];
    // Verifica se o listener é marcado como "once"
    var isOnce = onceListeners && onceListeners[ listener ];
    if ( isOnce ) {
      // Remove o listener antes de executá-lo para evitar recursão
      this.off( eventName, listener );
      // Remove a marca "once" do listener
      delete onceListeners[ listener ];
    }
    // Executa o listener, passando o contexto (`this`) e os argumentos fornecidos
    listener.apply( this, args );
  }

  // Retorna `this` para encadeamento
  return this;
};

// Método `allOff`: remove todos os listeners de todos os eventos
proto.allOff = function() {
  // Deleta os objetos _events e _onceEvents, limpando todos os registros
  delete this._events;
  delete this._onceEvents;
};

// Retorna a classe EvEmitter para uso como módulo
return EvEmitter;

}));

/*!
 * getSize v2.0.3
 * measure size of elements
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */
/* globals console: false */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Permite que o getSize seja usado com RequireJS, Node.js ou diretamente no navegador
( function( window, factory ) {
  /* jshint strict: false */ /* globals define, module */
  if ( typeof define == 'function' && define.amd ) {
    // AMD: define o módulo sem dependências
    define( 'get-size/get-size', factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS: exporta o resultado da factory
    module.exports = factory();
  } else {
    // Browser global: adiciona getSize ao objeto global (window)
    window.getSize = factory();
  }

})( window, function factory() {
'use strict';

// -------------------------- helpers -------------------------- //

// Função auxiliar para obter um número de uma string de estilo, ignorando valores percentuais
// Ex.: converte '200px' em 200, mas ignora '100%' ou valores inválidos
function getStyleSize( value ) {
  var num = parseFloat( value ); // Converte o valor para número flutuante
  // Verifica se o valor não é percentual e é um número válido
  var isValid = value.indexOf('%') == -1 && !isNaN( num );
  return isValid && num; // Retorna o número se válido, ou false se inválido
}

// Função vazia usada como fallback quando o console não está disponível
function noop() {}

// Função auxiliar para logar erros no console, usando noop se console não existir
var logError = typeof console == 'undefined' ? noop :
  function( message ) {
    console.error( message ); // Exibe mensagem de erro no console
  };

// -------------------------- measurements -------------------------- //

// Array com propriedades CSS a serem medidas (padding, margin, bordas)
var measurements = [
  'paddingLeft',
  'paddingRight',
  'paddingTop',
  'paddingBottom',
  'marginLeft',
  'marginRight',
  'marginTop',
  'marginBottom',
  'borderLeftWidth',
  'borderRightWidth',
  'borderTopWidth',
  'borderBottomWidth'
];

// Armazena o tamanho do array de measurements para evitar recalcular
var measurementsLength = measurements.length;

// Função que retorna um objeto com dimensões zeradas para elementos ocultos
function getZeroSize() {
  var size = {
    width: 0, // Largura total
    height: 0, // Altura total
    innerWidth: 0, // Largura interna (sem padding e borda)
    innerHeight: 0, // Altura interna (sem padding e borda)
    outerWidth: 0, // Largura externa (com margem)
    outerHeight: 0 // Altura externa (com margem)
  };
  // Inicializa todas as propriedades de measurements com 0
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    size[ measurement ] = 0;
  }
  return size;
}

// -------------------------- getStyle -------------------------- //

/**
 * getStyle, get style of element, check for Firefox bug
 * https://bugzilla.mozilla.org/show_bug.cgi?id=548397
 */
// Função para obter o estilo computado de um elemento, com verificação de erro no Firefox
function getStyle( elem ) {
  var style = getComputedStyle( elem ); // Obtém o estilo computado (CSS final após aplicação de todas as regras)
  if ( !style ) {
    // Exibe erro se getComputedStyle falhar, comum em iframes ocultos no Firefox
    logError( 'Style returned ' + style +
      '. Are you running this code in a hidden iframe on Firefox? ' +
      'See https://bit.ly/getsizebug1' );
  }
  return style;
}

// -------------------------- setup -------------------------- //

// Variável que indica se a configuração inicial foi feita
var isSetup = false;

// Variável que indica se o box-sizing inclui borda e padding na largura/altura
var isBoxSizeOuter;

/**
 * setup
 * check isBoxSizerOuter
 * do on first getSize() rather than on page load for Firefox bug
 */
// Função de configuração executada na primeira chamada de getSize
// Verifica como o navegador lida com box-sizing para elementos com border-box
function setup() {
  // Executa apenas uma vez
  if ( isSetup ) {
    return;
  }
  isSetup = true;

  // -------------------------- box sizing -------------------------- //

  /**
   * Chrome & Safari measure the outer-width on style.width on border-box elems
   * IE11 & Firefox<29 measures the inner-width
   */
  // Cria um elemento div para testar o comportamento do box-sizing
  var div = document.createElement('div');
  div.style.width = '200px'; // Define largura fixa
  div.style.padding = '1px 2px 3px 4px'; // Padding assimétrico para teste
  div.style.borderStyle = 'solid'; // Define bordas sólidas
  div.style.borderWidth = '1px 2px 3px 4px'; // Bordas assimétricas
  div.style.boxSizing = 'border-box'; // Usa modelo border-box

  // Adiciona o div ao DOM para obter estilos computados
  var body = document.body || document.documentElement;
  body.appendChild( div );
  var style = getStyle( div );
  // Verifica se a largura computada inclui borda e padding (Chrome/Safari) ou não (IE11/Firefox<29)
  // Arredonda o valor para evitar problemas com zoom no navegador
  isBoxSizeOuter = Math.round( getStyleSize( style.width ) ) == 200;
  // Armazena o resultado globalmente para uso em getSize
  getSize.isBoxSizeOuter = isBoxSizeOuter;

  // Remove o div de teste do DOM
  body.removeChild( div );
}

// -------------------------- getSize -------------------------- //

// Função principal que mede as dimensões de um elemento DOM
function getSize( elem ) {
  setup(); // Executa a configuração na primeira chamada

  // Se elem for uma string, usa querySelector para obter o elemento
  if ( typeof elem == 'string' ) {
    elem = document.querySelector( elem );
  }

  // Sai se o elemento não for válido (não é objeto ou não é um nó DOM)
  if ( !elem || typeof elem != 'object' || !elem.nodeType ) {
    return;
  }

  // Obtém o estilo computado do elemento
  var style = getStyle( elem );

  // Se o elemento estiver oculto (display: none), retorna dimensões zeradas
  if ( style.display == 'none' ) {
    return getZeroSize();
  }

  // Inicializa o objeto de dimensões
  var size = {};
  size.width = elem.offsetWidth; // Largura total, incluindo padding e borda
  size.height = elem.offsetHeight; // Altura total, incluindo padding e borda

  // Verifica se o elemento usa box-sizing: border-box
  var isBorderBox = size.isBorderBox = style.boxSizing == 'border-box';

  // Obtém todas as medidas de padding, margin e borda
  for ( var i=0; i < measurementsLength; i++ ) {
    var measurement = measurements[i];
    var value = style[ measurement ]; // Obtém o valor CSS da propriedade
    var num = parseFloat( value ); // Converte para número
    // Valores como 'auto' ou 'medium' resultam em 0
    size[ measurement ] = !isNaN( num ) ? num : 0;
  }

  // Calcula somas de padding, margin e borda para largura e altura
  var paddingWidth = size.paddingLeft + size.paddingRight;
  var paddingHeight = size.paddingTop + size.paddingBottom;
  var marginWidth = size.marginLeft + size.marginRight;
  var marginHeight = size.marginTop + size.marginBottom;
  var borderWidth = size.borderLeftWidth + size.borderRightWidth;
  var borderHeight = size.borderTopWidth + size.borderBottomWidth;

  // Verifica se o box-sizing é border-box e se o navegador inclui borda/padding na largura
  var isBorderBoxSizeOuter = isBorderBox && isBoxSizeOuter;

  // Sobrescreve a largura se puder ser obtida do estilo CSS
  var styleWidth = getStyleSize( style.width );
  if ( styleWidth !== false ) {
    size.width = styleWidth +
      // Adiciona padding e borda se não estiverem inclusos (para content-box ou navegadores que medem inner-width)
      ( isBorderBoxSizeOuter ? 0 : paddingWidth + borderWidth );
  }

  // Sobrescreve a altura se puder ser obtida do estilo CSS
  var styleHeight = getStyleSize( style.height );
  if ( styleHeight !== false ) {
    size.height = styleHeight +
      // Adiciona padding e borda se não estiverem inclusos
      ( isBorderBoxSizeOuter ? 0 : paddingHeight + borderHeight );
  }

  // Calcula largura e altura internas (sem padding e borda)
  size.innerWidth = size.width - ( paddingWidth + borderWidth );
  size.innerHeight = size.height - ( paddingHeight + borderHeight );

  // Calcula largura e altura externas (com margem)
  size.outerWidth = size.width + marginWidth;
  size.outerHeight = size.height + marginHeight;

  // Retorna o objeto com todas as dimensões
  return size;
}

// Retorna a função getSize para uso como módulo
return getSize;

});

/**
 * matchesSelector v2.0.2
 * matchesSelector( element, '.selector' )
 * MIT license
 */

/* jshint browser: true, strict: true, undef: true, unused: true */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Permite que o matchesSelector seja usado com RequireJS, Node.js ou diretamente no navegador
( function( window, factory ) {
  /* global define: false, module: false */
  'use strict';
  // universal module definition
  if ( typeof define == 'function' && define.amd ) {
    // AMD: define o módulo sem dependências
    define( 'desandro-matches-selector/matches-selector', factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS: exporta o resultado da factory
    module.exports = factory();
  } else {
    // Browser global: adiciona matchesSelector ao objeto global (window)
    window.matchesSelector = factory();
  }

}( window, function factory() {
  'use strict';

  // Função IIFE (Immediately Invoked Function Expression) para detectar o método de correspondência de seletores
  // Verifica qual método nativo está disponível no navegador para Element.prototype
  var matchesMethod = ( function() {
    var ElemProto = window.Element.prototype; // Obtém o protótipo do elemento DOM
    // Verifica primeiro o método padrão `matches`
    if ( ElemProto.matches ) {
      return 'matches'; // Retorna 'matches' se disponível
    }
    // Verifica o método sem prefixo `matchesSelector`
    if ( ElemProto.matchesSelector ) {
      return 'matchesSelector'; // Retorna 'matchesSelector' se disponível
    }
    // Verifica métodos com prefixos de fornecedor (webkit, moz, ms, o)
    var prefixes = [ 'webkit', 'moz', 'ms', 'o' ];

    for ( var i=0; i < prefixes.length; i++ ) {
      var prefix = prefixes[i];
      var method = prefix + 'MatchesSelector'; // Ex.: webkitMatchesSelector
      if ( ElemProto[ method ] ) {
        return method; // Retorna o método com prefixo se encontrado
      }
    }
  })();

  // Retorna a função matchesSelector, que verifica se um elemento corresponde a um seletor CSS
  return function matchesSelector( elem, selector ) {
    return elem[ matchesMethod ]( selector ); // Chama o método nativo detectado com o seletor fornecido
  };

}));

/**
 * Fizzy UI utils v2.0.7
 * MIT license
 */

/* jshint browser: true, undef: true, unused: true, strict: true */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Permite que o Fizzy UI Utils seja usado com RequireJS, Node.js ou diretamente no navegador
( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */

  if ( typeof define == 'function' && define.amd ) {
    // AMD: define o módulo com dependência do matchesSelector
    define( 'fizzy-ui-utils/utils', [
      'desandro-matches-selector/matches-selector'
    ], function( matchesSelector ) {
      return factory( window, matchesSelector );
    });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS: exporta o resultado da factory com require do matchesSelector
    module.exports = factory(
      window,
      require('desandro-matches-selector')
    );
  } else {
    // Browser global: adiciona fizzyUIUtils ao objeto global (window)
    window.fizzyUIUtils = factory(
      window,
      window.matchesSelector
    );
  }

}( window, function factory( window, matchesSelector ) {

'use strict';

// Objeto que contém todas as funções utilitárias
var utils = {};

// ----- extend ----- //

// Função que mescla propriedades de um objeto `b` em um objeto `a`
// Similar ao Object.assign, mas mais simples
utils.extend = function( a, b ) {
  for ( var prop in b ) {
    a[ prop ] = b[ prop ]; // Copia cada propriedade de b para a
  }
  return a; // Retorna o objeto mesclado
};

// ----- modulo ----- //

// Função que calcula o módulo de um número, lidando com números negativos
// Ex.: utils.modulo(-1, 3) retorna 2
utils.modulo = function( num, div ) {
  return ( ( num % div ) + div ) % div; // Garante resultado positivo
};

// ----- makeArray ----- //

// Armazena o método slice do Array para uso posterior
var arraySlice = Array.prototype.slice;

// Converte um objeto (ex.: NodeList, elemento único) em um array
utils.makeArray = function( obj ) {
  // Se já for um array, retorna diretamente
  if ( Array.isArray( obj ) ) {
    return obj;
  }
  // Retorna array vazio para null ou undefined
  if ( obj === null || obj === undefined ) {
    return [];
  }

  // Verifica se é um objeto com propriedade length (ex.: NodeList)
  var isArrayLike = typeof obj == 'object' && typeof obj.length == 'number';
  if ( isArrayLike ) {
    // Converte NodeList ou similar em array usando slice
    return arraySlice.call( obj );
  }

  // Para objetos não-array-like, retorna array com o objeto como único item
  return [ obj ];
};

// ----- removeFrom ----- //

// Remove um item específico de um array
utils.removeFrom = function( ary, obj ) {
  var index = ary.indexOf( obj ); // Encontra o índice do item
  if ( index != -1 ) {
    ary.splice( index, 1 ); // Remove o item se encontrado
  }
};

// ----- getParent ----- //

// Encontra o ancestral de um elemento que corresponde a um seletor CSS
utils.getParent = function( elem, selector ) {
  // Percorre os pais até encontrar um que corresponda ou atingir document.body
  while ( elem.parentNode && elem != document.body ) {
    elem = elem.parentNode; // Avança para o próximo pai
    if ( matchesSelector( elem, selector ) ) {
      return elem; // Retorna o elemento se corresponder ao seletor
    }
  }
  // Retorna undefined se nenhum ancestral corresponder
};

// ----- getQueryElement ----- //

// Converte uma string seletora em um elemento DOM ou retorna o elemento se já for um
utils.getQueryElement = function( elem ) {
  if ( typeof elem == 'string' ) {
    // Se for string, usa querySelector para obter o elemento
    return document.querySelector( elem );
  }
  // Se já for um elemento, retorna diretamente
  return elem;
};

// ----- handleEvent ----- //

// Função que permite disparar métodos do tipo `onEventType` a partir de addEventListener
utils.handleEvent = function( event ) {
  var method = 'on' + event.type; // Ex.: 'onclick' para evento 'click'
  if ( this[ method ] ) {
    // Chama o método correspondente, se existir, passando o evento
    this[ method ]( event );
  }
};

// ----- filterFindElements ----- //

// Filtra elementos e encontra descendentes que correspondem a um seletor
utils.filterFindElements = function( elems, selector ) {
  // Converte os elementos fornecidos em array
  elems = utils.makeArray( elems );
  var ffElems = []; // Array para armazenar elementos encontrados

  // Itera sobre os elementos fornecidos
  elems.forEach( function( elem ) {
    // Verifica se é um elemento HTML válido
    if ( !( elem instanceof HTMLElement ) ) {
      return;
    }
    // Se não houver seletor, adiciona o elemento diretamente
    if ( !selector ) {
      ffElems.push( elem );
      return;
    }
    // Se o elemento corresponder ao seletor, adiciona ao resultado
    if ( matchesSelector( elem, selector ) ) {
      ffElems.push( elem );
    }
    // Busca descendentes que correspondam ao seletor
    var childElems = elem.querySelectorAll( selector );
    // Adiciona os descendentes encontrados ao resultado
    for ( var i=0; i < childElems.length; i++ ) {
      ffElems.push( childElems[i] );
    }
  });

  return ffElems; // Retorna array com elementos filtrados e encontrados
};

// ----- debounceMethod ----- //

// Adiciona funcionalidade de debounce a um método de uma classe
// Evita chamadas repetidas em um curto intervalo de tempo
utils.debounceMethod = function( _class, methodName, threshold ) {
  threshold = threshold || 100; // Define intervalo padrão de 100ms
  // Armazena o método original
  var method = _class.prototype[ methodName ];
  var timeoutName = methodName + 'Timeout'; // Nome da propriedade de timeout

  // Substitui o método original por uma versão debounced
  _class.prototype[ methodName ] = function() {
    var timeout = this[ timeoutName ]; // Obtém o timeout atual, se existir
    clearTimeout( timeout ); // Limpa o timeout anterior

    var args = arguments; // Captura os argumentos da chamada
    var _this = this; // Armazena o contexto
    // Agenda a execução do método após o intervalo
    this[ timeoutName ] = setTimeout( function() {
      method.apply( _this, args ); // Executa o método original com os argumentos
      delete _this[ timeoutName ]; // Remove o timeout após a execução
    }, threshold );
  };
};

// ----- docReady ----- //

// Executa um callback quando o DOM estiver pronto
utils.docReady = function( callback ) {
  var readyState = document.readyState;
  // Se o DOM já estiver carregado, executa o callback assincronamente
  if ( readyState == 'complete' || readyState == 'interactive' ) {
    setTimeout( callback );
  } else {
    // Caso contrário, adiciona um listener para o evento DOMContentLoaded
    document.addEventListener( 'DOMContentLoaded', callback );
  }
};

// ----- htmlInit ----- //

// Converte camelCase para dashed-case (ex.: widgetName -> widget-name)
utils.toDashed = function( str ) {
  return str.replace( /(.)([A-Z])/g, function( match, $1, $2 ) {
    return $1 + '-' + $2; // Adiciona hífen antes de letras maiúsculas
  }).toLowerCase(); // Converte tudo para minúsculas
};

// Armazena a referência ao console
var console = window.console;

/**
 * allow user to initialize classes via [data-namespace] or .js-namespace class
 * htmlInit( Widget, 'widgetName' )
 * options are parsed from data-namespace-options
 */
// Inicializa instâncias de uma classe com base em atributos HTML
utils.htmlInit = function( WidgetClass, namespace ) {
  // Executa quando o DOM estiver pronto
  utils.docReady( function() {
    var dashedNamespace = utils.toDashed( namespace ); // Converte namespace para dashed-case
    var dataAttr = 'data-' + dashedNamespace; // Ex.: data-isotope
    var dataAttrElems = document.querySelectorAll( '[' + dataAttr + ']' ); // Seleciona elementos com o atributo
    var jsDashElems = document.querySelectorAll( '.js-' + dashedNamespace ); // Seleciona elementos com a classe
    // Combina elementos encontrados em um array
    var elems = utils.makeArray( dataAttrElems )
      .concat( utils.makeArray( jsDashElems ) );
    var dataOptionsAttr = dataAttr + '-options'; // Ex.: data-isotope-options
    var jQuery = window.jQuery; // Verifica se jQuery está disponível

    // Itera sobre os elementos encontrados
    elems.forEach( function( elem ) {
      // Obtém opções do atributo data-namespace ou data-namespace-options
      var attr = elem.getAttribute( dataAttr ) ||
        elem.getAttribute( dataOptionsAttr );
      var options;
      try {
        // Tenta parsear o atributo como JSON
        options = attr && JSON.parse( attr );
      } catch ( error ) {
        // Se falhar, loga o erro e continua
        if ( console ) {
          console.error( 'Error parsing ' + dataAttr + ' on ' + elem.className +
            ': ' + error );
        }
        return;
      }
      // Cria uma nova instância da classe com o elemento e opções
      var instance = new WidgetClass( elem, options );
      // Se jQuery estiver disponível, armazena a instância via $.data
      if ( jQuery ) {
        jQuery.data( elem, namespace, instance );
      }
    });

  });
};

// Retorna o objeto utils com todas as funções utilitárias
return utils;

}));

/**
 * Outlayer Item
 */

// Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
// Permite que o Outlayer Item seja usado com RequireJS, Node.js ou diretamente no navegador
( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /* globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS: define o módulo com dependências EvEmitter e getSize
    define( 'outlayer/item', [
        'ev-emitter/ev-emitter',
        'get-size/get-size'
      ],
      factory
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack: exporta o módulo com require
    module.exports = factory(
      require('ev-emitter'),
      require('get-size')
    );
  } else {
    // Browser global: adiciona Outlayer.Item ao objeto global (window)
    window.Outlayer = {};
    window.Outlayer.Item = factory(
      window.EvEmitter,
      window.getSize
    );
  }

}( window, function factory( EvEmitter, getSize ) {
'use strict';

// ----- helpers ----- //

// Função auxiliar que verifica se um objeto está vazio
function isEmptyObj( obj ) {
  for ( var prop in obj ) {
    return false; // Retorna false se encontrar qualquer propriedade
  }
  prop = null; // Limpa a variável prop
  return true; // Retorna true se o objeto estiver vazio
}

// -------------------------- CSS3 support -------------------------- //

// Obtém o estilo do elemento raiz do documento (html)
var docElemStyle = document.documentElement.style;

// Determina a propriedade de transição com base no suporte do navegador
// Usa 'WebkitTransition' como fallback para navegadores antigos (ex.: Safari antigo)
var transitionProperty = typeof docElemStyle.transition == 'string' ?
  'transition' : 'WebkitTransition';

// Determina a propriedade de transformação CSS com base no suporte do navegador
// Usa 'WebkitTransform' como fallback para navegadores antigos
var transformProperty = typeof docElemStyle.transform == 'string' ?
  'transform' : 'webkitTransform';

// Mapeia o evento de fim de transição correspondente à propriedade de transição
var transitionEndEvent = {
  WebkitTransition: 'webkitTransitionEnd',
  transition: 'transitionend'
}[ transitionProperty ];

// Cache de propriedades CSS que podem ter prefixos de fornecedor
var vendorProperties = {
  transform: transformProperty, // Ex.: transform ou WebkitTransform
  transition: transitionProperty, // Ex.: transition ou WebkitTransition
  transitionDuration: transitionProperty + 'Duration', // Ex.: transitionDuration ou WebkitTransitionDuration
  transitionProperty: transitionProperty + 'Property', // Ex.: transitionProperty ou WebkitTransitionProperty
  transitionDelay: transitionProperty + 'Delay' // Ex.: transitionDelay ou WebkitTransitionDelay
};

// -------------------------- Item -------------------------- //

// Construtor da classe Item, que representa um elemento individual no layout
function Item( element, layout ) {
  // Sai se não houver elemento
  if ( !element ) return; 

  // Armazena o elemento DOM
  this.element = element;
  // Armazena a instância do layout pai (ex.: Isotope, Masonry, ou Packery)
  this.layout = layout;
  // Inicializa a posição do item (coordenadas x, y)
  this.position = {
    x: 0,
    y: 0
  };

  // Chama o método de inicialização
  this._create();
}

// Faz Item herdar de EvEmitter para suportar eventos personalizados
var proto = Item.prototype = Object.create( EvEmitter.prototype );
proto.constructor = Item; // Define o construtor corretamente

// Método de inicialização do item
proto._create = function() {
  // Inicializa o objeto de transição (_transn) para gerenciar propriedades CSS animadas
  this._transn = {
    ingProperties: {}, // Propriedades sendo animadas (ex.: transform)
    clean: {}, // Propriedades que foram finalizadas
    onEnd: {} // Callbacks para o fim de transições
  };

  // Aplica estilo inicial ao elemento, definindo position: absolute
  // Necessário para posicionamento dinâmico no layout
  this.css({
    position: 'absolute'
  });
};

// Método que lida com eventos DOM, chamando métodos do tipo onEventType
proto.handleEvent = function( event ) {
  var method = 'on' + event.type; // Ex.: onclick para evento click
  if ( this[ method ] ) {
    // Chama o método correspondente, se existir
    this[ method ]( event );
  }
};

// Método que obtém as dimensões do elemento usando a biblioteca getSize
proto.getSize = function() {
  this.size = getSize( this.element ); // Armazena o resultado em this.size
};


/**
 * apply CSS styles to element
 * @param {Object} style
 */
// Método para aplicar estilos CSS ao elemento
proto.css = function( style ) {
  var elemStyle = this.element.style; // Obtém o objeto de estilo do elemento

  // Itera sobre as propriedades do objeto de estilo fornecido
  for ( var prop in style ) {
    // Usa a propriedade com prefixo de fornecedor, se disponível (ex.: WebkitTransform)
    var supportedProp = vendorProperties[ prop ] || prop;
    // Aplica o valor da propriedade ao estilo do elemento
    elemStyle[ supportedProp ] = style[ prop ];
  }
};

// Método para medir e definir a posição atual do elemento
proto.getPosition = function() {
  var style = getComputedStyle( this.element ); // Obtém os estilos computados
  // Verifica se o layout usa origem à esquerda (originLeft: true) ou à direita
  var isOriginLeft = this.layout._getOption('originLeft');
  // Verifica se o layout usa origem no topo (originTop: true) ou na base
  var isOriginTop = this.layout._getOption('originTop');
  // Obtém o valor de left ou right com base na origem
  var xValue = style[ isOriginLeft ? 'left' : 'right' ];
  // Obtém o valor de top ou bottom com base na origem
  var yValue = style[ isOriginTop ? 'top' : 'bottom' ];
  var x = parseFloat( xValue ); // Converte o valor x para número
  var y = parseFloat( yValue ); // Converte o valor y para número
  var layoutSize = this.layout.size; // Obtém as dimensões do contêiner do layout
  // Converte valores percentuais para pixels, se necessário
  if ( xValue.indexOf('%') != -1 ) {
    x = ( x / 100 ) * layoutSize.width;
  }
  if ( yValue.indexOf('%') != -1 ) {
    y = ( y / 100 ) * layoutSize.height;
  }
  // Limpa valores inválidos (ex.: 'auto') definindo como 0
  x = isNaN( x ) ? 0 : x;
  y = isNaN( y ) ? 0 : y;
  // Remove o padding do contêiner da medição, dependendo da origem
  x -= isOriginLeft ? layoutSize.paddingLeft : layoutSize.paddingRight;
  y -= isOriginTop ? layoutSize.paddingTop : layoutSize.paddingBottom;

  // Atualiza a posição do item
  this.position.x = x;
  this.position.y = y;
};

// Método para definir a posição final do item, aplicando padding
proto.layoutPosition = function() {
  var layoutSize = this.layout.size; // Obtém as dimensões do contêiner
  var style = {}; // Objeto para armazenar estilos a serem aplicados
  var isOriginLeft = this.layout._getOption('originLeft'); // Verifica origem x
  var isOriginTop = this.layout._getOption('originTop'); // Verifica origem y

  // Configura a coordenada x
  var xPadding = isOriginLeft ? 'paddingLeft' : 'paddingRight'; // Escolhe padding
  var xProperty = isOriginLeft ? 'left' : 'right'; // Propriedade CSS (left/right)
  var xResetProperty = isOriginLeft ? 'right' : 'left'; // Propriedade oposta

  var x = this.position.x + layoutSize[ xPadding ]; // Ajusta x com padding
  // Define o valor de x em porcentagem ou pixels
  style[ xProperty ] = this.getXValue( x );
  // Reseta a propriedade oposta
  style[ xResetProperty ] = '';

  // Configura a coordenada y
  var yPadding = isOriginTop ? 'paddingTop' : 'paddingBottom'; // Escolhe padding
  var yProperty = isOriginTop ? 'top' : 'bottom'; // Propriedade CSS (top/bottom)
  var yResetProperty = isOriginTop ? 'bottom' : 'top'; // Propriedade oposta

  var y = this.position.y + layoutSize[ yPadding ]; // Ajusta y com padding
  // Define o valor de y em porcentagem ou pixels
  style[ yProperty ] = this.getYValue( y );
  // Reseta a propriedade oposta
  style[ yResetProperty ] = '';

  // Aplica os estilos calculados
  this.css( style );
  // Emite um evento 'layout' para notificar que o item foi posicionado
  this.emitEvent( 'layout', [ this ] );
};

// Método para obter o valor x formatado (pixels ou porcentagem)
proto.getXValue = function( x ) {
  var isHorizontal = this.layout._getOption('horizontal'); // Verifica orientação
  // Usa porcentagem se percentPosition estiver ativado e não for horizontal
  return this.layout.options.percentPosition && !isHorizontal ?
    ( ( x / this.layout.size.width ) * 100 ) + '%' : x + 'px';
};

// Método para obter o valor y formatado (pixels ou porcentagem)
proto.getYValue = function( y ) {
  var isHorizontal = this.layout._getOption('horizontal'); // Verifica orientação
  // Usa porcentagem se percentPosition estiver ativado e for horizontal
  return this.layout.options.percentPosition && isHorizontal ?
    ( ( y / this.layout.size.height ) * 100 ) + '%' : y + 'px';
};

// Método para realizar uma transição animada para uma nova posição (x, y)
proto._transitionTo = function( x, y ) {
  this.getPosition(); // Obtém a posição atual
  var curX = this.position.x; // Posição x atual
  var curY = this.position.y; // Posição y atual

  // Verifica se não houve mudança de posição
  var didNotMove = x == this.position.x && y == this.position.y;

  // Define a nova posição
  this.setPosition( x, y );

  // Se não houve movimento e não está em transição, apenas posiciona
  if ( didNotMove && !this.isTransitioning ) {
    this.layoutPosition();
    return;
  }

  // Calcula o deslocamento para a transição
  var transX = x - curX;
  var transY = y - curY;
  var transitionStyle = {};
  // Define a transformação CSS usando translate3d
  transitionStyle.transform = this.getTranslate( transX, transY );

  // Inicia a transição com os estilos calculados
  this.transition({
    to: transitionStyle, // Estilos finais
    onTransitionEnd: {
      transform: this.layoutPosition // Callback para após a transição
    },
    isCleaning: true // Remove estilos após a transição
  });
};

// Método para obter a string de transformação translate3d
proto.getTranslate = function( x, y ) {
  var isOriginLeft = this.layout._getOption('originLeft'); // Verifica origem x
  var isOriginTop = this.layout._getOption('originTop'); // Verifica origem y
  // Inverte coordenadas se a origem for à direita ou na base
  x = isOriginLeft ? x : -x;
  y = isOriginTop ? y : -y;
  // Retorna a string translate3d para uso em CSS
  return 'translate3d(' + x + 'px, ' + y + 'px, 0)';
};

// Método para mover diretamente para uma posição sem transição
proto.goTo = function( x, y ) {
  this.setPosition( x, y ); // Define a nova posição
  this.layoutPosition(); // Aplica a posição
};

// Alias para _transitionTo, usado para mover com transição
proto.moveTo = proto._transitionTo;

// Método para atualizar as coordenadas do item
proto.setPosition = function( x, y ) {
  this.position.x = parseFloat( x ); // Define x como número
  this.position.y = parseFloat( y ); // Define y como número
};

// ----- transition ----- //

/**
 * @param {Object} style - CSS
 * @param {Function} onTransitionEnd
 */

// Método para executar sem transição, aplicando estilos diretamente
proto._nonTransition = function( args ) {
  this.css( args.to ); // Aplica os estilos finais
  if ( args.isCleaning ) {
    // Remove os estilos após aplicação, se necessário
    this._removeStyles( args.to );
  }
  // Executa callbacks de fim de transição, se fornecidos
  for ( var prop in args.onTransitionEnd ) {
    args.onTransitionEnd[ prop ].call( this );
  }
};

/**
 * proper transition
 * @param {Object} args - arguments
 *   @param {Object} to - style to transition to
 *   @param {Object} from - style to start transition from
 *   @param {Boolean} isCleaning - removes transition styles after transition
 *   @param {Function} onTransitionEnd - callback
 */
// Método para executar uma transição CSS
proto.transition = function( args ) {
  // Redireciona para _nonTransition se não houver duração de transição
  if ( !parseFloat( this.layout.options.transitionDuration ) ) {
    this._nonTransition( args );
    return;
  }

  var _transition = this._transn; // Objeto que gerencia a transição
  // Registra callbacks de fim de transição
  for ( var prop in args.onTransitionEnd ) {
    _transition.onEnd[ prop ] = args.onTransitionEnd[ prop ];
  }
  // Registra propriedades que estão em transição
  for ( prop in args.to ) {
    _transition.ingProperties[ prop ] = true; // Marca como em transição
    if ( args.isCleaning ) {
      _transition.clean[ prop ] = true; // Marca para limpeza após transição
    }
  }

  // Aplica estilos iniciais, se fornecidos
  if ( args.from ) {
    this.css( args.from );
    // Força redesenho para evitar bugs em transições CSS
    var h = this.element.offsetHeight;
    h = null; // Limpa variável não usada
  }
  // Ativa a transição CSS
  this.enableTransition( args.to );
  // Aplica os estilos finais
  this.css( args.to );

  // Marca o item como em transição
  this.isTransitioning = true;
};

// Função auxiliar para converter camelCase em dashed-case (ex.: WebkitTransform -> -webkit-transform)
function toDashedAll( str ) {
  return str.replace( /([A-Z])/g, function( $1 ) {
    return '-' + $1.toLowerCase(); // Adiciona hífen antes de letras maiúsculas
  });
}

// Define as propriedades CSS que serão usadas na transição (opacity e transform)
var transitionProps = 'opacity,' + toDashedAll( transformProperty );

// Método para ativar transições CSS
proto.enableTransition = function(/* style */) {
  // Evita alterações durante uma transição ativa para prevenir saltos
  if ( this.isTransitioning ) {
    return;
  }

  // Obtém a duração da transição do layout
  var duration = this.layout.options.transitionDuration;
  // Converte número para milissegundos, se necessário
  duration = typeof duration == 'number' ? duration + 'ms' : duration;
  // Aplica estilos de transição
  this.css({
    transitionProperty: transitionProps, // Propriedades a animar (opacity, transform)
    transitionDuration: duration, // Duração da transição
    transitionDelay: this.staggerDelay || 0 // Atraso, se definido
  });
  // Adiciona listener para o evento de fim de transição
  this.element.addEventListener( transitionEndEvent, this, false );
};

// ----- events ----- //

// Handler para o evento webkitTransitionEnd
proto.onwebkitTransitionEnd = function( event ) {
  this.ontransitionend( event ); // Redireciona para ontransitionend
};

// Handler para o evento otransitionend (Opera)
proto.onotransitionend = function( event ) {
  this.ontransitionend( event ); // Redireciona para ontransitionend
};

// Mapeia propriedades com prefixo para suas versões sem prefixo
var dashedVendorProperties = {
  '-webkit-transform': 'transform'
};

// Handler principal para o evento de fim de transição
proto.ontransitionend = function( event ) {
  // Ignora eventos propagados de elementos filhos
  if ( event.target !== this.element ) {
    return;
  }
  var _transition = this._transn; // Objeto de transição
  // Normaliza o nome da propriedade (ex.: -webkit-transform -> transform)
  var propertyName = dashedVendorProperties[ event.propertyName ] || event.propertyName;

  // Remove a propriedade da lista de transições ativas
  delete _transition.ingProperties[ propertyName ];
  // Verifica se todas as transições terminaram
  if ( isEmptyObj( _transition.ingProperties ) ) {
    // Desativa a transição se não houver mais propriedades animando
    this.disableTransition();
  }
  // Limpa o estilo, se marcado para limpeza
  if ( propertyName in _transition.clean ) {
    this.element.style[ event.propertyName ] = '';
    delete _transition.clean[ propertyName ];
  }
  // Executa o callback de fim de transição, se existir
  if ( propertyName in _transition.onEnd ) {
    var onTransitionEnd = _transition.onEnd[ propertyName ];
    onTransitionEnd.call( this );
    delete _transition.onEnd[ propertyName ];
  }

  // Emite um evento 'transitionEnd' para notificar o fim da transição
  this.emitEvent( 'transitionEnd', [ this ] );
};

// Método para desativar transições CSS
proto.disableTransition = function() {
  this.removeTransitionStyles(); // Remove estilos de transição
  // Remove o listener do evento de fim de transição
  this.element.removeEventListener( transitionEndEvent, this, false );
  // Marca o item como não mais em transição
  this.isTransitioning = false;
};

/**
 * removes style property from element
 * @param {Object} style
**/
// Método para remover estilos CSS do elemento
proto._removeStyles = function( style ) {
  var cleanStyle = {}; // Cria objeto com valores vazios
  for ( var prop in style ) {
    cleanStyle[ prop ] = ''; // Define cada propriedade como vazia
  }
  this.css( cleanStyle ); // Aplica os estilos vazios
};

// Objeto com estilos de transição vazios para limpeza
var cleanTransitionStyle = {
  transitionProperty: '',
  transitionDuration: '',
  transitionDelay: ''
};

// Método para remover estilos de transição
proto.removeTransitionStyles = function() {
  this.css( cleanTransitionStyle ); // Aplica estilos de transição vazios
};

// ----- stagger ----- //

// Método para definir um atraso (stagger) para transições
proto.stagger = function( delay ) {
  delay = isNaN( delay ) ? 0 : delay; // Garante que o atraso seja válido
  this.staggerDelay = delay + 'ms'; // Armazena o atraso em milissegundos
};

// ----- show/hide/remove ----- //

// Método para remover o elemento do DOM
proto.removeElem = function() {
  // Remove o elemento do pai no DOM
  this.element.parentNode.removeChild( this.element );
  // Remove display: none para evitar efeitos colaterais
  this.css({ display: '' });
  // Emite um evento 'remove' para notificar a remoção
  this.emitEvent( 'remove', [ this ] );
};

// Método para remover o elemento, com suporte a transição
proto.remove = function() {
  // Remove diretamente se não houver suporte a transição ou duração
  if ( !transitionProperty || !parseFloat( this.layout.options.transitionDuration ) ) {
    this.removeElem();
    return;
  }

  // Aguarda o fim da transição antes de remover
  this.once( 'transitionEnd', function() {
    this.removeElem();
  });
  // Inicia a transição para ocultar o elemento
  this.hide();
};

// Método para revelar (mostrar) o elemento
proto.reveal = function() {
  delete this.isHidden; // Remove a marca de oculto
  // Remove display: none para garantir visibilidade
  this.css({ display: '' });

  var options = this.layout.options; // Obtém opções do layout

  var onTransitionEnd = {}; // Configura callbacks de fim de transição
  // Obtém a propriedade usada para transição de revelação
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('visibleStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onRevealTransitionEnd;

  // Inicia a transição de revelação
  this.transition({
    from: options.hiddenStyle, // Estilo inicial (oculto)
    to: options.visibleStyle, // Estilo final (visível)
    isCleaning: true, // Limpa estilos após a transição
    onTransitionEnd: onTransitionEnd // Callbacks de fim
  });
};

// Callback executado ao final da transição de revelação
proto.onRevealTransitionEnd = function() {
  // Verifica se o item ainda está visível
  if ( !this.isHidden ) {
    // Emite um evento 'reveal' para notificar a revelação
    this.emitEvent('reveal');
  }
};

/**
 * get style property use for hide/reveal transition end
 * @param {String} styleProperty - hiddenStyle/visibleStyle
 * @returns {String}
 */
// Método para determinar a propriedade usada para transições de ocultar/revelar
proto.getHideRevealTransitionEndProperty = function( styleProperty ) {
  var optionStyle = this.layout.options[ styleProperty ]; // Obtém o estilo (hiddenStyle ou visibleStyle)
  // Usa 'opacity' se estiver definida
  if ( optionStyle.opacity ) {
    return 'opacity';
  }
  // Retorna a primeira propriedade encontrada no estilo
  for ( var prop in optionStyle ) {
    return prop;
  }
};

// Método para ocultar o elemento
proto.hide = function() {
  this.isHidden = true; // Marca o item como oculto
  // Remove display: none para permitir transição
  this.css({ display: '' });

  var options = this.layout.options; // Obtém opções do layout

  var onTransitionEnd = {}; // Configura callbacks de fim de transição
  // Obtém a propriedade usada para transição de ocultação
  var transitionEndProperty = this.getHideRevealTransitionEndProperty('hiddenStyle');
  onTransitionEnd[ transitionEndProperty ] = this.onHideTransitionEnd;

  // Inicia a transição de ocultação
  this.transition({
    from: options.visibleStyle, // Estilo inicial (visível)
    to: options.hiddenStyle, // Estilo final (oculto)
    isCleaning: true, // Limpa estilos após a transição
    onTransitionEnd: onTransitionEnd // Callbacks de fim
  });
};

// Callback executado ao final da transição de ocultação
proto.onHideTransitionEnd = function() {
  // Verifica se o item ainda está oculto
  if ( this.isHidden ) {
    // Aplica display: none para ocultar completamente
    this.css({ display: 'none' });
    // Emite um evento 'hide' para notificar a ocultação
    this.emitEvent('hide');
  }
};

// Método para destruir o item, removendo estilos aplicados
proto.destroy = function() {
  // Remove todos os estilos relevantes para resetar o elemento
  this.css({
    position: '',
    left: '',
    right: '',
    top: '',
    bottom: '',
    transition: '',
    transform: ''
  });
};

// Retorna a classe Item para uso como módulo
return Item;

})); //////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/*!
 * Outlayer v2.1.1
 * the brains and guts of a layout library
 * MIT license
 */

( function( window, factory ) {
  'use strict';
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  // Permite que o Outlayer seja usado com RequireJS, Node.js ou diretamente no navegador
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS: define o módulo com dependências
    define( 'outlayer/outlayer', [
        'ev-emitter/ev-emitter',
        'get-size/get-size',
        'fizzy-ui-utils/utils',
        './item'
      ],
      function( EvEmitter, getSize, utils, Item ) {
        return factory( window, EvEmitter, getSize, utils, Item );
      }
    );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack: exporta o módulo com require
    module.exports = factory(
      window,
      require('ev-emitter'),
      require('get-size'),
      require('fizzy-ui-utils'),
      require('./item')
    );
  } else {
    // Browser global: adiciona Outlayer ao objeto global (window)
    window.Outlayer = factory(
      window,
      window.EvEmitter,
      window.getSize,
      window.fizzyUIUtils,
      window.Outlayer.Item
    );
  }

}( window, function factory( window, EvEmitter, getSize, utils, Item ) {
'use strict';

// ----- vars ----- //

var console = window.console; // Referência ao console para log de erros
var jQuery = window.jQuery; // Referência ao jQuery, se disponível
var noop = function() {}; // Função vazia usada como fallback

// -------------------------- Outlayer -------------------------- //

// Identificadores únicos globais para instâncias
var GUID = 0;
// Armazena todas as instâncias do Outlayer por ID
var instances = {};

/**
 * @param {Element, String} element
 * @param {Object} options
 * @constructor
 */
// Construtor da classe Outlayer
function Outlayer( element, options ) {
  // Converte elemento ou seletor em elemento DOM usando utils.getQueryElement
  var queryElement = utils.getQueryElement( element );
  // Sai com erro se o elemento for inválido
  if ( !queryElement ) {
    if ( console ) {
      console.error( 'Bad element for ' + this.constructor.namespace +
        ': ' + ( queryElement || element ) );
    }
    return;
  }
  // Armazena o elemento DOM
  this.element = queryElement;
  // Adiciona suporte ao jQuery, se disponível
  if ( jQuery ) {
    this.$element = jQuery( this.element );
  }

  // Inicializa opções mesclando defaults com opções fornecidas
  this.options = utils.extend( {}, this.constructor.defaults );
  this.option( options );

  // Atribui um ID único à instância
  var id = ++GUID;
  this.element.outlayerGUID = id; // Adiciona ID ao elemento (expando)
  instances[ id ] = this; // Associa instância ao ID

  // Inicia a configuração
  this._create();

  // Executa layout inicial, se initLayout for true
  var isInitLayout = this._getOption('initLayout');
  if ( isInitLayout ) {
    this.layout();
  }
}

// Define namespace e associa a classe Item
Outlayer.namespace = 'outlayer';
Outlayer.Item = Item;

// Opções padrão do Outlayer
Outlayer.defaults = {
  containerStyle: {
    position: 'relative' // Define position: relative para o contêiner
  },
  initLayout: true, // Realiza layout inicial automaticamente
  originLeft: true, // Origem do layout à esquerda
  originTop: true, // Origem do layout no topo
  resize: true, // Vincula evento de redimensionamento
  resizeContainer: true, // Redimensiona o contêiner automaticamente
  transitionDuration: '0.4s', // Duração padrão das transições
  hiddenStyle: {
    opacity: 0, // Estilo para itens ocultos
    transform: 'scale(0.001)'
  },
  visibleStyle: {
    opacity: 1, // Estilo para itens visíveis
    transform: 'scale(1)'
  }
};

// Faz Outlayer herdar de EvEmitter para suporte a eventos
var proto = Outlayer.prototype;
utils.extend( proto, EvEmitter.prototype );

/**
 * set options
 * @param {Object} opts
 */
// Método para definir opções, mesclando com as atuais
proto.option = function( opts ) {
  utils.extend( this.options, opts );
};

/**
 * get backwards compatible option value, check old name
 */
// Método para obter valor de opção, considerando nomes antigos para compatibilidade
proto._getOption = function( option ) {
  var oldOption = this.constructor.compatOptions[ option ];
  // Retorna valor do nome antigo, se existir, ou do nome atual
  return oldOption && this.options[ oldOption ] !== undefined ?
    this.options[ oldOption ] : this.options[ option ];
};

// Mapeamento de opções para compatibilidade com versões anteriores
Outlayer.compatOptions = {
  initLayout: 'isInitLayout',
  horizontal: 'isHorizontal',
  layoutInstant: 'isLayoutInstant',
  originLeft: 'isOriginLeft',
  originTop: 'isOriginTop',
  resize: 'isResizeBound',
  resizeContainer: 'isResizingContainer'
};

// Método de inicialização da instância
proto._create = function() {
  // Carrega os itens filhos do contêiner
  this.reloadItems();
  // Inicializa array de stamps (elementos que afetam o layout, mas não são movidos)
  this.stamps = [];
  this.stamp( this.options.stamp ); // Aplica stamps iniciais
  // Aplica estilos ao contêiner
  utils.extend( this.element.style, this.options.containerStyle );

  // Vincula evento de redimensionamento, se ativado
  var canBindResize = this._getOption('resize');
  if ( canBindResize ) {
    this.bindResize();
  }
};

// Recarrega todos os itens filhos do contêiner
proto.reloadItems = function() {
  // Coleta e inicializa itens usando _itemize
  this.items = this._itemize( this.element.children );
};

/**
 * turn elements into Outlayer.Items to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - collection of new Outlayer Items
 */
// Converte elementos DOM em instâncias de Outlayer.Item
proto._itemize = function( elems ) {
  // Filtra e encontra elementos válidos usando _filterFindItemElements
  var itemElems = this._filterFindItemElements( elems );
  var Item = this.constructor.Item; // Referência à classe Item

  // Cria novas instâncias de Item
  var items = [];
  for ( var i=0; i < itemElems.length; i++ ) {
    var elem = itemElems[i];
    var item = new Item( elem, this ); // Cria item associado à instância do layout
    items.push( item );
  }

  return items;
};

/**
 * get item elements to be used in layout
 * @param {Array or NodeList or HTMLElement} elems
 * @returns {Array} items - item elements
 */
// Filtra e encontra elementos de itens usando utils.filterFindElements
proto._filterFindItemElements = function( elems ) {
  return utils.filterFindElements( elems, this.options.itemSelector );
};

/**
 * getter method for getting item elements
 * @returns {Array} elems - collection of item elements
 */
// Retorna os elementos DOM dos itens
proto.getItemElements = function() {
  return this.items.map( function( item ) {
    return item.element;
  });
};

// ----- init & layout ----- //

/**
 * lays out all items
 */
// Método principal para realizar o layout
proto.layout = function() {
  this._resetLayout(); // Reseta o layout
  this._manageStamps(); // Gerencia stamps

  // Determina se o layout deve ser instantâneo (sem animações)
  var layoutInstant = this._getOption('layoutInstant');
  var isInstant = layoutInstant !== undefined ?
    layoutInstant : !this._isLayoutInited;
  // Realiza o layout dos itens
  this.layoutItems( this.items, isInstant );

  // Marca o layout como inicializado
  this._isLayoutInited = true;
};

// Alias para layout
proto._init = proto.layout;

/**
 * logic before any new layout
 */
// Reseta o layout antes de novas alterações
proto._resetLayout = function() {
  this.getSize(); // Obtém as dimensões do contêiner
};

// Obtém as dimensões do contêiner usando getSize
proto.getSize = function() {
  this.size = getSize( this.element ); // Armazena o resultado em this.size
};

/**
 * get measurement from option, for columnWidth, rowHeight, gutter
 * if option is String -> get element from selector string, & get size of element
 * if option is Element -> get size of element
 * else use option as a number
 *
 * @param {String} measurement
 * @param {String} size - width or height
 * @private
 */
// Obtém medidas (ex.: columnWidth, gutter) a partir de opções
proto._getMeasurement = function( measurement, size ) {
  var option = this.options[ measurement ];
  var elem;
  if ( !option ) {
    // Se não houver opção, define como 0
    this[ measurement ] = 0;
  } else {
    // Se a opção for uma string, busca elemento com querySelector
    if ( typeof option == 'string' ) {
      elem = this.element.querySelector( option );
    } else if ( option instanceof HTMLElement ) {
      // Se for um elemento, usa diretamente
      elem = option;
    }
    // Usa o tamanho do elemento, se disponível; caso contrário, usa o valor da opção
    this[ measurement ] = elem ? getSize( elem )[ size ] : option;
  }
};

/**
 * layout a collection of item elements
 * @api public
 */
// Realiza o layout de uma coleção de itens
proto.layoutItems = function( items, isInstant ) {
  // Filtra itens a serem dispostos
  items = this._getItemsForLayout( items );

  // Executa o layout dos itens
  this._layoutItems( items, isInstant );

  // Realiza ações pós-layout
  this._postLayout();
};

/**
 * get the items to be laid out
 * @param {Array} items
 * @returns {Array} items
 */
// Filtra itens ignorados (ex.: itens ocultos)
proto._getItemsForLayout = function( items ) {
  return items.filter( function( item ) {
    return !item.isIgnored; // Retorna apenas itens não ignorados
  });
};

/**
 * layout items
 * @param {Array} items
 * @param {Boolean} isInstant
 */
// Executa o layout dos itens
proto._layoutItems = function( items, isInstant ) {
  // Emite evento de layout completo para os itens
  this._emitCompleteOnItems( 'layout', items );

  // Sai se não houver itens
  if ( !items || !items.length ) {
    return;
  }

  var queue = []; // Fila para processar posições

  // Itera sobre os itens
  items.forEach( function( item ) {
    // Obtém a posição do item
    var position = this._getItemLayoutPosition( item );
    // Adiciona item e informações à fila
    position.item = item;
    position.isInstant = isInstant || item.isLayoutInstant;
    queue.push( position );
  }, this );

  // Processa a fila de layout
  this._processLayoutQueue( queue );
};

/**
 * get item layout position
 * @param {Outlayer.Item} item
 * @returns {Object} x and y position
 */
// Método placeholder para obter a posição de um item (sobrescrito por subclasses)
proto._getItemLayoutPosition = function( /* item */ ) {
  return {
    x: 0,
    y: 0
  };
};

/**
 * iterate over array and position each item
 * Reason being - separating this logic prevents 'layout invalidation'
 * thx @paul_irish
 * @param {Array} queue
 */
// Processa a fila de layout, posicionando cada item
proto._processLayoutQueue = function( queue ) {
  this.updateStagger(); // Atualiza o atraso (stagger) para transições
  queue.forEach( function( obj, i ) {
    // Posiciona o item com base nas coordenadas
    this._positionItem( obj.item, obj.x, obj.y, obj.isInstant, i );
  }, this );
};

// Atualiza o atraso (stagger) para animações
proto.updateStagger = function() {
  var stagger = this.options.stagger; // Obtém a opção de stagger
  if ( stagger === null || stagger === undefined ) {
    this.stagger = 0; // Define como 0 se não especificado
    return;
  }
  // Converte o valor de stagger para milissegundos
  this.stagger = getMilliseconds( stagger );
  return this.stagger;
};

/**
 * Sets position of item in DOM
 * @param {Outlayer.Item} item
 * @param {Number} x - horizontal position
 * @param {Number} y - vertical position
 * @param {Boolean} isInstant - disables transitions
 */
// Posiciona um item no DOM
proto._positionItem = function( item, x, y, isInstant, i ) {
  if ( isInstant ) {
    // Sem transição, apenas define a posição
    item.goTo( x, y );
  } else {
    // Com transição, aplica stagger e move
    item.stagger( i * this.stagger );
    item.moveTo( x, y );
  }
};

/**
 * Any logic you want to do after each layout,
 * i.e. size the container
 */
// Executa ações após o layout
proto._postLayout = function() {
  this.resizeContainer(); // Redimensiona o contêiner, se necessário
};

// Redimensiona o contêiner com base no layout
proto.resizeContainer = function() {
  var isResizingContainer = this._getOption('resizeContainer');
  if ( !isResizingContainer ) {
    return;
  }
  var size = this._getContainerSize(); // Obtém o tamanho necessário
  if ( size ) {
    // Aplica largura e altura ao contêiner
    this._setContainerMeasure( size.width, true );
    this._setContainerMeasure( size.height, false );
  }
};

/**
 * Sets width or height of container if returned
 * @returns {Object} size
 *   @param {Number} width
 *   @param {Number} height
 */
// Método placeholder para obter o tamanho do contêiner (sobrescrito por subclasses)
proto._getContainerSize = noop;

/**
 * @param {Number} measure - size of width or height
 * @param {Boolean} isWidth
 */
// Define a largura ou altura do contêiner
proto._setContainerMeasure = function( measure, isWidth ) {
  if ( measure === undefined ) {
    return;
  }

  var elemSize = this.size; // Obtém as dimensões do contêiner
  // Adiciona padding e borda se box-sizing for border-box
  if ( elemSize.isBorderBox ) {
    measure += isWidth ? elemSize.paddingLeft + elemSize.paddingRight +
      elemSize.borderLeftWidth + elemSize.borderRightWidth :
      elemSize.paddingBottom + elemSize.paddingTop +
      elemSize.borderTopWidth + elemSize.borderBottomWidth;
  }

  // Garante que a medida seja no mínimo 0
  measure = Math.max( measure, 0 );
  // Aplica a medida ao estilo do contêiner
  this.element.style[ isWidth ? 'width' : 'height' ] = measure + 'px';
};

/**
 * emit eventComplete on a collection of items events
 * @param {String} eventName
 * @param {Array} items - Outlayer.Items
 */
// Emite evento de conclusão para uma coleção de itens
proto._emitCompleteOnItems = function( eventName, items ) {
  var _this = this;
  function onComplete() {
    // Emite evento com sufixo 'Complete'
    _this.dispatchEvent( eventName + 'Complete', null, [ items ] );
  }

  var count = items.length;
  // Se não houver itens, emite o evento imediatamente
  if ( !items || !count ) {
    onComplete();
    return;
  }

  var doneCount = 0;
  function tick() {
    doneCount++;
    // Emite o evento quando todos os itens terminarem
    if ( doneCount == count ) {
      onComplete();
    }
  }

  // Vincula callback para cada item
  items.forEach( function( item ) {
    item.once( eventName, tick );
  });
};

/**
 * emits events via EvEmitter and jQuery events
 * @param {String} type - name of event
 * @param {Event} event - original event
 * @param {Array} args - extra arguments
 */
// Emite eventos usando EvEmitter e jQuery, se disponível
proto.dispatchEvent = function( type, event, args ) {
  // Combina argumentos com o evento, se fornecido
  var emitArgs = event ? [ event ].concat( args ) : args;
  // Emite evento via EvEmitter
  this.emitEvent( type, emitArgs );

  if ( jQuery ) {
    // Inicializa $element, se necessário
    this.$element = this.$element || jQuery( this.element );
    if ( event ) {
      // Cria evento jQuery, se houver evento original
      var $event = jQuery.Event( event );
      $event.type = type;
      this.$element.trigger( $event, args );
    } else {
      // Dispara evento jQuery diretamente
      this.$element.trigger( type, args );
    }
  }
};

// -------------------------- ignore & stamps -------------------------- //

// Nota: O código foi cortado antes da definição de métodos relacionados a stamps e ignore

}); ////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////////

/**
 * keep item in collection, but do not lay it out
 * ignored items do not get skipped in layout
 * @param {Element} elem
 */
// Marca um item como ignorado, mantendo-o na coleção, mas sem posicioná-lo
proto.ignore = function( elem ) {
  var item = this.getItem( elem ); // Obtém o item correspondente ao elemento
  if ( item ) {
    item.isIgnored = true; // Define a propriedade isIgnored
  }
};

/**
 * return item to layout collection
 * @param {Element} elem
 */
// Remove a marca de ignorado, permitindo que o item seja posicionado novamente
proto.unignore = function( elem ) {
  var item = this.getItem( elem ); // Obtém o item correspondente ao elemento
  if ( item ) {
    delete item.isIgnored; // Remove a propriedade isIgnored
  }
};

/**
 * adds elements to stamps
 * @param {NodeList, Array, Element, or String} elems
 */
// Adiciona elementos como stamps (elementos fixos que afetam o layout)
proto.stamp = function( elems ) {
  elems = this._find( elems ); // Converte elementos em array
  if ( !elems ) {
    return; // Sai se não houver elementos
  }

  // Adiciona elementos ao array de stamps
  this.stamps = this.stamps.concat( elems );
  // Marca cada stamp como ignorado para não ser posicionado
  elems.forEach( this.ignore, this );
};

/**
 * removes elements to stamps
 * @param {NodeList, Array, or Element} elems
 */
// Remove elementos dos stamps
proto.unstamp = function( elems ) {
  elems = this._find( elems ); // Converte elementos em array
  if ( !elems ) {
    return; // Sai se não houver elementos
  }

  // Remove cada elemento do array de stamps e desmarca como ignorado
  elems.forEach( function( elem ) {
    utils.removeFrom( this.stamps, elem ); // Remove do array de stamps
    this.unignore( elem ); // Remove a marca de ignorado
  }, this );
};

/**
 * finds child elements
 * @param {NodeList, Array, Element, or String} elems
 * @returns {Array} elems
 */
// Converte seletores ou elementos em um array de elementos DOM
proto._find = function( elems ) {
  if ( !elems ) {
    return; // Sai se não houver elementos
  }
  // Se for string, usa querySelectorAll para encontrar elementos
  if ( typeof elems == 'string' ) {
    elems = this.element.querySelectorAll( elems );
  }
  // Converte para array usando utils.makeArray
  elems = utils.makeArray( elems );
  return elems;
};

// Gerencia os stamps, atualizando suas posições no layout
proto._manageStamps = function() {
  if ( !this.stamps || !this.stamps.length ) {
    return; // Sai se não houver stamps
  }

  // Obtém o retângulo delimitador do contêiner
  this._getBoundingRect();

  // Processa cada stamp
  this.stamps.forEach( this._manageStamp, this );
};

// Calcula o retângulo delimitador do contêiner, ajustado por padding e bordas
proto._getBoundingRect = function() {
  var boundingRect = this.element.getBoundingClientRect(); // Obtém retângulo do elemento
  var size = this.size; // Obtém dimensões do contêiner
  // Calcula limites ajustados
  this._boundingRect = {
    left: boundingRect.left + size.paddingLeft + size.borderLeftWidth,
    top: boundingRect.top + size.paddingTop + size.borderTopWidth,
    right: boundingRect.right - ( size.paddingRight + size.borderRightWidth ),
    bottom: boundingRect.bottom - ( size.paddingBottom + size.borderBottomWidth )
  };
};

/**
 * @param {Element} stamp
**/
// Método placeholder para gerenciar um stamp individual (sobrescrito por subclasses)
proto._manageStamp = noop;

/**
 * get x/y position of element relative to container element
 * @param {Element} elem
 * @returns {Object} offset - has left, top, right, bottom
 */
// Obtém a posição de um elemento relativa ao contêiner
proto._getElementOffset = function( elem ) {
  var boundingRect = elem.getBoundingClientRect(); // Retângulo do elemento
  var thisRect = this._boundingRect; // Retângulo do contêiner
  var size = getSize( elem ); // Dimensões do elemento
  // Calcula offsets ajustados por margens
  var offset = {
    left: boundingRect.left - thisRect.left - size.marginLeft,
    top: boundingRect.top - thisRect.top - size.marginTop,
    right: thisRect.right - boundingRect.right - size.marginRight,
    bottom: thisRect.bottom - boundingRect.bottom - size.marginBottom
  };
  return offset;
};

// -------------------------- resize -------------------------- //

// Vincula o manipulador de eventos usando utils.handleEvent
proto.handleEvent = utils.handleEvent;

/**
 * Bind layout to window resizing
 */
// Vincula o layout ao evento de redimensionamento da janela
proto.bindResize = function() {
  window.addEventListener( 'resize', this ); // Adiciona listener
  this.isResizeBound = true; // Marca como vinculado
};

/**
 * Unbind layout to window resizing
 */
// Desvincula o layout do evento de redimensionamento
proto.unbindResize = function() {
  window.removeEventListener( 'resize', this ); // Remove listener
  this.isResizeBound = false; // Marca como desvinculado
};

// Manipulador do evento de redimensionamento
proto.onresize = function() {
  this.resize(); // Chama o método resize
};

// Aplica debounce ao método onresize para evitar chamadas frequentes
utils.debounceMethod( Outlayer, 'onresize', 100 );

/**
 * check if layout is needed post layout
 * @returns Boolean
 */
// Verifica se o layout precisa ser atualizado após redimensionamento
proto.needsResizeLayout = function() {
  var size = getSize( this.element ); // Obtém dimensões atuais
  // Verifica se as dimensões internas mudaram
  var hasSizes = this.size && size;
  return hasSizes && size.innerWidth !== this.size.innerWidth;
};

// -------------------------- methods -------------------------- //

/**
 * add items to Outlayer instance
 * @param {Array or NodeList or Element} elems
 * @returns {Array} items - Outlayer.Items
**/
// Adiciona novos itens à instância
proto.addItems = function( elems ) {
  var items = this._itemize( elems ); // Converte elementos em itens
  // Adiciona itens à coleção
  if ( items.length ) {
    this.items = this.items.concat( items );
  }
  return items;
};

/**
 * Layout newly-appended item elements
 * @param {Array or NodeList or Element} elems
 */
// Realiza layout de itens recém-adicionados ao final
proto.appended = function( elems ) {
  var items = this.addItems( elems ); // Adiciona os itens
  if ( !items.length ) {
    return; // Sai se não houver itens
  }
  // Realiza layout apenas dos novos itens, sem transição
  this.layoutItems( items, true );
  // Revela os novos itens
  this.reveal( items );
};

/**
 * Layout prepended elements
 * @param {Array or NodeList or Element} elems
 */
// Realiza layout de itens adicionados ao início
proto.prepended = function( elems ) {
  var items = this._itemize( elems ); // Converte elementos em itens
  if ( !items.length ) {
    return; // Sai se não houver itens
  }
  // Adiciona itens ao início da coleção
  var previousItems = this.items.slice(0);
  this.items = items.concat( previousItems );
  // Reinicia o layout
  this._resetLayout();
  this._manageStamps();
  // Realiza layout dos novos itens sem transição
  this.layoutItems( items, true );
  this.reveal( items );
  // Realiza layout dos itens anteriores
  this.layoutItems( previousItems );
};

/**
 * reveal a collection of items
 * @param {Array of Outlayer.Items} items
 */
// Revela (mostra) uma coleção de itens com animação
proto.reveal = function( items ) {
  this._emitCompleteOnItems( 'reveal', items ); // Emite evento de revelação
  if ( !items || !items.length ) {
    return; // Sai se não houver itens
  }
  var stagger = this.updateStagger(); // Obtém o atraso para animações
  // Revela cada item com stagger
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.reveal();
  });
};

/**
 * hide a collection of items
 * @param {Array of Outlayer.Items} items
 */
// Oculta uma coleção de itens com animação
proto.hide = function( items ) {
  this._emitCompleteOnItems( 'hide', items ); // Emite evento de ocultação
  if ( !items || !items.length ) {
    return; // Sai se não houver itens
  }
  var stagger = this.updateStagger(); // Obtém o atraso para animações
  // Oculta cada item com stagger
  items.forEach( function( item, i ) {
    item.stagger( i * stagger );
    item.hide();
  });
};

/**
 * reveal item elements
 * @param {Array}, {Element}, {NodeList} items
 */
// Revela elementos DOM convertendo-os em itens
proto.revealItemElements = function( elems ) {
  var items = this.getItems( elems ); // Obtém itens correspondentes
  this.reveal( items ); // Revela os itens
};

/**
 * hide item elements
 * @param {Array}, {Element}, {NodeList} items
 */
// Oculta elementos DOM convertendo-os em itens
proto.hideItemElements = function( elems ) {
  var items = this.getItems( elems ); // Obtém itens correspondentes
  this.hide( items ); // Oculta os itens
};

/**
 * get Outlayer.Item, given an Element
 * @param {Element} elem
 * @param {Function} callback
 * @returns {Outlayer.Item} item
 */
// Obtém um item correspondente a um elemento DOM
proto.getItem = function( elem ) {
  // Itera sobre os itens para encontrar correspondência
  for ( var i=0; i < this.items.length; i++ ) {
    var item = this.items[i];
    if ( item.element == elem ) {
      return item; // Retorna o item encontrado
    }
  }
};

/**
 * get collection of Outlayer.Items, given Elements
 * @param {Array} elems
 * @returns {Array} items - Outlayer.Items
 */
// Obtém uma coleção de itens correspondentes a elementos DOM
proto.getItems = function( elems ) {
  elems = utils.makeArray( elems ); // Converte para array
  var items = [];
  // Itera sobre os elementos para encontrar itens correspondentes
  elems.forEach( function( elem ) {
    var item = this.getItem( elem );
    if ( item ) {
      items.push( item );
    }
  }, this );

  return items;
};

/**
 * remove element(s) from instance and DOM
 * @param {Array or NodeList or Element} elems
 */
// Remove elementos da instância e do DOM
proto.remove = function( elems ) {
  var removeItems = this.getItems( elems ); // Obtém itens correspondentes

  this._emitCompleteOnItems( 'remove', removeItems ); // Emite evento de remoção

  if ( !removeItems || !removeItems.length ) {
    return; // Sai se não houver itens
  }

  // Remove cada item do DOM e da coleção
  removeItems.forEach( function( item ) {
    item.remove(); // Remove o item do DOM
    utils.removeFrom( this.items, item ); // Remove da coleção
  }, this );
};

// ----- destroy ----- //

// Remove e desativa a instância do Outlayer
proto.destroy = function() {
  // Limpa estilos dinâmicos do contêiner
  var style = this.element.style;
  style.height = '';
  style.position = '';
  style.width = '';
  // Destroi cada item
  this.items.forEach( function( item ) {
    item.destroy();
  });

  // Desvincula evento de redimensionamento
  this.unbindResize();

  // Remove referência à instância
  var id = this.element.outlayerGUID;
  delete instances[ id ]; // Remove do registro de instâncias
  delete this.element.outlayerGUID;
  // Remove dados do jQuery, se disponível
  if ( jQuery ) {
    jQuery.removeData( this.element, this.constructor.namespace );
  }
};

// ----- data ----- //

/**
 * get Outlayer instance from element
 * @param {Element} elem
 * @returns {Outlayer}
 */
// Obtém instância do Outlayer associada a um elemento
Outlayer.data = function( elem ) {
  elem = utils.getQueryElement( elem ); // Converte seletor em elemento
  var id = elem && elem.outlayerGUID; // Obtém o ID da instância
  return id && instances[ id ]; // Retorna a instância associada
};

// -------------------------- create Outlayer class -------------------------- //

// Nota: O código foi cortado antes da finalização da criação da classe

// -------------------------- create Outlayer class -------------------------- //

/**
 * create a layout class
 * @param {String} namespace
 */
Outlayer.create = function( namespace, options ) {
  // Cria uma subclasse de Outlayer
  var Layout = subclass( Outlayer );
  // Mescla opções padrão do Outlayer com as fornecidas
  Layout.defaults = utils.extend( {}, Outlayer.defaults );
  utils.extend( Layout.defaults, options );
  // Mescla opções de compatibilidade
  Layout.compatOptions = utils.extend( {}, Outlayer.compatOptions );

  // Define o namespace da nova classe
  Layout.namespace = namespace;

  // Reutiliza o método data do Outlayer
  Layout.data = Outlayer.data;

  // Cria uma subclasse de Item específica para a nova classe
  Layout.Item = subclass( Item );

  // -------------------------- declarative -------------------------- //

  // Habilita inicialização declarativa via atributos HTML (ex.: data-isotope)
  utils.htmlInit( Layout, namespace );

  // -------------------------- jQuery bridge -------------------------- //

  // Integra com jQuery, se disponível e com jQuery.bridget
  if ( jQuery && jQuery.bridget ) {
    jQuery.bridget( namespace, Layout ); // Transforma em plugin jQuery
  }

  return Layout; // Retorna a nova classe
};

// Função auxiliar para criar subclasses
function subclass( Parent ) {
  // Define a função construtora da subclasse
  function SubClass() {
    Parent.apply( this, arguments ); // Chama o construtor da classe pai
  }

  // Configura herança prototípica
  SubClass.prototype = Object.create( Parent.prototype );
  SubClass.prototype.constructor = SubClass; // Corrige o construtor

  return SubClass; // Retorna a subclasse
}

// ----- helpers ----- //

// Mapeia unidades de tempo para milissegundos
var msUnits = {
  ms: 1, // Milissegundos
  s: 1000 // Segundos
};

// Converte valores de tempo em milissegundos (ex.: '0.4s' -> 400)
function getMilliseconds( time ) {
  if ( typeof time == 'number' ) {
    return time; // Retorna diretamente se for número
  }
  // Extrai número e unidade (ex.: '0.4s' -> ['0.4', 's'])
  var matches = time.match( /(^\d*\.?\d*)(\w*)/ );
  var num = matches && matches[1];
  var unit = matches && matches[2];
  if ( !num.length ) {
    return 0; // Retorna 0 se o valor for inválido
  }
  num = parseFloat( num ); // Converte para número
  var mult = msUnits[ unit ] || 1; // Obtém multiplicador da unidade
  return num * mult; // Retorna valor em milissegundos
}

// ----- fin ----- //

// Restaura referência global para Outlayer.Item
Outlayer.Item = Item;

return Outlayer; // Retorna a classe Outlayer como módulo

}));

/**
 * Isotope Item
**/

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'isotope-layout/js/item', [
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('outlayer')
    );
  } else {
    // Browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.Item = factory(
      window.Outlayer
    );
  }

}( window, function factory( Outlayer ) {
'use strict';

// -------------------------- Item -------------------------- //

// Subclasse de Outlayer.Item
function Item() {
  Outlayer.Item.apply( this, arguments ); // Chama o construtor da classe pai
}

// Configura herança prototípica
var proto = Item.prototype = Object.create( Outlayer.Item.prototype );

var _create = proto._create;
// Sobrescreve o método _create para adicionar funcionalidade específica
proto._create = function() {
  // Atribui um ID único para ordenação (usado em original-order)
  this.id = this.layout.itemGUID++;
  _create.call( this ); // Chama o método original
  // Inicializa objeto para armazenar dados de ordenação
  this.sortData = {};
};

// Atualiza os dados usados para ordenação
proto.updateSortData = function() {
  if ( this.isIgnored ) {
    return; // Sai se o item estiver ignorado
  }
  // Dados padrão para ordenação
  this.sortData.id = this.id; // ID do item
  this.sortData['original-order'] = this.id; // Para compatibilidade com ordenação original
  this.sortData.random = Math.random(); // Valor aleatório para ordenação randômica
  // Aplica funções de ordenação definidas em getSortData
  var getSortData = this.layout.options.getSortData; // Configurações de ordenação
  var sorters = this.layout._sorters; // Funções de ordenação
  for ( var key in getSortData ) {
    var sorter = sorters[ key ];
    // Armazena o resultado da função de ordenação
    this.sortData[ key ] = sorter( this.element, this );
  }
};

var _destroy = proto.destroy;
// Sobrescreve o método destroy para adicionar limpeza extra
proto.destroy = function() {
  _destroy.apply( this, arguments ); // Chama o método original
  // Reseta display para evitar efeitos colaterais (#741)
  this.css({
    display: ''
  });
};

return Item; // Retorna a classe Item

}));

/**
 * Isotope LayoutMode
 */

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'isotope-layout/js/layout-mode', [
        'get-size/get-size',
        'outlayer/outlayer'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('get-size'),
      require('outlayer')
    );
  } else {
    // Browser global
    window.Isotope = window.Isotope || {};
    window.Isotope.LayoutMode = factory(
      window.getSize,
      window.Outlayer
    );
  }

}( window, function factory( getSize, Outlayer ) {
  'use strict';

  // Classe base para modos de layout
  function LayoutMode( isotope ) {
    this.isotope = isotope; // Referência à instância do Isotope
    // Vincula propriedades à instância do Isotope
    if ( isotope ) {
      this.options = isotope.options[ this.namespace ]; // Opções específicas do modo
      this.element = isotope.element; // Elemento contêiner
      this.items = isotope.filteredItems; // Itens filtrados
      this.size = isotope.size; // Dimensões do contêiner
    }
  }

  var proto = LayoutMode.prototype;

  /**
   * some methods should just defer to default Outlayer method
   * and reference the Isotope instance as `this`
  **/
  // Lista de métodos que delegam diretamente ao Outlayer
  var facadeMethods = [
    '_resetLayout',
    '_getItemLayoutPosition',
    '_manageStamp',
    '_getContainerSize',
    '_getElementOffset',
    'needsResizeLayout',
    '_getOption'
  ];

  // Configura delegação para métodos do Outlayer
  facadeMethods.forEach( function( methodName ) {
    proto[ methodName ] = function() {
      return Outlayer.prototype[ methodName ].apply( this.isotope, arguments );
    };
  });

  // Verifica se o layout precisa de redimensionamento vertical
  proto.needsVerticalResizeLayout = function() {
    var size = getSize( this.isotope.element ); // Obtém dimensões atuais
    // Verifica se a altura interna mudou
    var hasSizes = this.isotope.size && size;
    return hasSizes && size.innerHeight != this.isotope.size.innerHeight;
  };

  // ----- measurements ----- //

  // Delega medição ao Isotope
  proto._getMeasurement = function() {
    this.isotope._getMeasurement.apply( this, arguments );
  };

  // Obtém a largura da coluna
  proto.getColumnWidth = function() {
    this.getSegmentSize( 'column', 'Width' ); // Chama getSegmentSize para coluna
  };

  // Obtém a altura da linha
  proto.getRowHeight = function() {
    this.getSegmentSize( 'row', 'Height' ); // Chama getSegmentSize para linha
  };

  /**
   * get columnWidth or rowHeight
   * segment: 'column' or 'row'
   * size 'Width' or 'Height'
  **/
  // Obtém tamanho de segmento (coluna ou linha)
  proto.getSegmentSize = function( segment, size ) {
    var segmentName = segment + size; // Ex.: columnWidth, rowHeight
    var outerSize = 'outer' + size; // Ex.: outerWidth, outerHeight
    this._getMeasurement( segmentName, outerSize ); // Obtém medida
    if ( this[ segmentName ] ) {
      return; // Sai se a medida já estiver definida
    }
    // Fallback: usa o tamanho do primeiro item filtrado ou do contêiner
    var firstItemSize = this.getFirstItemSize();
    this[ segmentName ] = firstItemSize && firstItemSize[ outerSize ] ||
      this.isotope.size[ 'inner' + size ];
  };

  // Obtém o tamanho do primeiro item filtrado
  proto.getFirstItemSize = function() {
    var firstItem = this.isotope.filteredItems[0]; // Primeiro item filtrado
    return firstItem && firstItem.element && getSize( firstItem.element ); // Retorna dimensões
  };

  // ----- methods that should reference isotope ----- //

  // Delega layout ao Isotope
  proto.layout = function() {
    this.isotope.layout.apply( this.isotope, arguments );
  };

  // Obtém tamanho do contêiner via Isotope
  proto.getSize = function() {
    this.isotope.getSize();
    this.size = this.isotope.size;
  };

  // -------------------------- create -------------------------- //

  // Registro de modos de layout
  LayoutMode.modes = {};

  // Cria um novo modo de layout
  LayoutMode.create = function( namespace, options ) {
    function Mode() {
      LayoutMode.apply( this, arguments ); // Chama o construtor da classe pai
    }

    // Configura herança prototípica
    Mode.prototype = Object.create( proto );
    Mode.prototype.constructor = Mode;

    // Define opções padrão, se fornecidas
    if ( options ) {
      Mode.options = options;
    }

    // Define namespace e registra o modo
    Mode.prototype.namespace = namespace;
    LayoutMode.modes[ namespace ] = Mode;

    return Mode; // Retorna a nova classe de modo
  };

  return LayoutMode; // Retorna a classe LayoutMode

}));

/*!
 * Masonry v4.2.1
 * Cascading grid layout library
 * https://masonry.desandro.com
 * MIT License
 * by David DeSandro
 */

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'masonry-layout/masonry', [
        'outlayer/outlayer',
        'get-size/get-size'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('outlayer'),
      require('get-size')
    );
  } else {
    // Browser global
    window.Masonry = factory(
      window.Outlayer,
      window.getSize
    );
  }

}( window, function factory( Outlayer, getSize ) {

'use strict';

// -------------------------- masonryDefinition -------------------------- //

  // Cria uma classe de layout Masonry usando Outlayer.create
  var Masonry = Outlayer.create('masonry');
  // Mapeia opção antiga isFitWidth para fitWidth
  Masonry.compatOptions.fitWidth = 'isFitWidth';

  var proto = Masonry.prototype;

  // Reseta o layout, preparando para nova disposição
  proto._resetLayout = function() {
    this.getSize(); // Obtém dimensões do contêiner
    // Obtém medidas de columnWidth e gutter
    this._getMeasurement( 'columnWidth', 'outerWidth' );
    this._getMeasurement( 'gutter', 'outerWidth' );
    this.measureColumns(); // Calcula número de colunas

    // Inicializa array de alturas das colunas (colYs)
    this.colYs = [];
    for ( var i=0; i < this.cols; i++ ) {
      this.colYs.push( 0 ); // Altura inicial 0 para cada coluna
    }

    this.maxY = 0; // Altura máxima do layout
    this.horizontalColIndex = 0; // Índice para posicionamento horizontal
  };

  // Calcula o número de colunas com base na largura do contêiner
  proto.measureColumns = function() {
    this.getContainerWidth(); // Obtém largura do contêiner
    // Se columnWidth não estiver definido, usa fallback
    if ( !this.columnWidth ) {
      var firstItem = this.items[0];
      var firstItemElem = firstItem && firstItem.element;
      // Usa largura do primeiro item ou do contêiner
      this.columnWidth = firstItemElem && getSize( firstItemElem ).outerWidth ||
        this.containerWidth;
    }

    // Adiciona gutter à largura da coluna
    var columnWidth = this.columnWidth += this.gutter;

    // Calcula número de colunas
    var containerWidth = this.containerWidth + this.gutter;
    var cols = containerWidth / columnWidth;
    // Corrige erros de arredondamento
    var excess = columnWidth - containerWidth % columnWidth;
    var mathMethod = excess && excess < 1 ? 'round' : 'floor';
    cols = Math[ mathMethod ]( cols );
    // Garante pelo menos uma coluna
    this.cols = Math.max( cols, 1 );
  };

  // Obtém a largura do contêiner
  proto.getContainerWidth = function() {
    // Usa o pai se fitWidth estiver ativado, senão usa o elemento
    var isFitWidth = this._getOption('fitWidth');
    var container = isFitWidth ? this.element.parentNode : this.element;
    var size = getSize( container ); // Obtém dimensões
    // Armazena largura interna
    this.containerWidth = size && size.innerWidth;
  };

  // Calcula a posição de um item no layout
  proto._getItemLayoutPosition = function( item ) {
    item.getSize(); // Obtém dimensões do item
    // Calcula quantas colunas o item ocupa
    var remainder = item.size.outerWidth % this.columnWidth;
    var mathMethod = remainder && remainder < 1 ? 'round' : 'ceil';
    var colSpan = Math[ mathMethod ]( item.size.outerWidth / this.columnWidth );
    colSpan = Math.min( colSpan, this.cols ); // Limita ao número de colunas

    // Escolhe método de posicionamento (horizontal ou topo)
    var colPosMethod = this.options.horizontalOrder ?
      '_getHorizontalColPosition' : '_getTopColPosition';
    var colPosition = this[ colPosMethod ]( colSpan, item );
    // Define a posição do item
    var position = {
      x: this.columnWidth * colPosition.col, // Coordenada x
      y: colPosition.y // Coordenada y
    };
    // Atualiza alturas das colunas afetadas
    var setHeight = colPosition.y + item.size.outerHeight;
    var setMax = colSpan + colPosition.col;
    for ( var i = colPosition.col; i < setMax; i++ ) {
      this.colYs[i] = setHeight; // Define nova altura para colunas
    }

    return position;
  };

  // Obtém a posição na coluna com menor altura
  proto._getTopColPosition = function( colSpan ) {
    var colGroup = this._getTopColGroup( colSpan ); // Obtém grupo de colunas
    // Encontra a menor altura
    var minimumY = Math.min.apply( Math, colGroup );

    return {
      col: colGroup.indexOf( minimumY ), // Índice da coluna
      y: minimumY, // Altura mínima
    };
  };

  /**
   * @param {Number} colSpan - number of columns the element spans
   * @returns {Array} colGroup
   */
  // Obtém grupo de colunas para posicionamento
  proto._getTopColGroup = function( colSpan ) {
    if ( colSpan < 2 ) {
      return this.colYs; // Retorna todas as colunas se ocupar uma só
    }

    var colGroup = [];
    // Calcula quantas posições horizontais são possíveis
    var groupCount = this.cols + 1 - colSpan;
    // Para cada posição possível
    for ( var i = 0; i < groupCount; i++ ) {
      colGroup[i] = this._getColGroupY( i, colSpan ); // Obtém altura do grupo
    }
    return colGroup;
  };

  // Obtém a altura máxima de um grupo de colunas
  proto._getColGroupY = function( col, colSpan ) {
    if ( colSpan < 2 ) {
      return this.colYs[ col ]; // Retorna altura da coluna se ocupar uma só
    }
    // Obtém alturas das colunas do grupo
    var groupColYs = this.colYs.slice( col, col + colSpan );
    // Retorna a altura máxima
    return Math.max.apply( Math, groupColYs );
  };

  // Obtém posição baseada em ordem horizontal
  proto._getHorizontalColPosition = function( colSpan, item ) {
    var col = this.horizontalColIndex % this.cols; // Coluna atual
    // Verifica se o item cabe na linha atual
    var isOver = colSpan > 1 && col + colSpan > this.cols;
    col = isOver ? 0 : col; // Move para próxima linha se necessário
    // Verifica se o item tem tamanho
    var hasSize = item.size.outerWidth && item.size.outerHeight;
    // Atualiza índice horizontal
    this.horizontalColIndex = hasSize ? col + colSpan : this.horizontalColIndex;

    return {
      col: col, // Coluna escolhida
      y: this._getColGroupY( col, colSpan ), // Altura do grupo
    };
  };

  // Gerencia um stamp (elemento fixo)
  proto._manageStamp = function( stamp ) {
    var stampSize = getSize( stamp ); // Obtém dimensões do stamp
    var offset = this._getElementOffset( stamp ); // Obtém posição relativa
    // Determina colunas afetadas pelo stamp
    var isOriginLeft = this._getOption('originLeft');
    var firstX = isOriginLeft ? offset.left : offset.right;
    var lastX = firstX + stampSize.outerWidth;
    var firstCol = Math.floor( firstX / this.columnWidth );
    firstCol = Math.max( 0, firstCol );
    var lastCol = Math.floor( lastX / this.columnWidth );
    // Ajusta última coluna
    lastCol -= lastX % this.columnWidth ? 0 : 1;
    lastCol = Math.min( this.cols - 1, lastCol );
    // Define altura das colunas afetadas
    var isOriginTop = this._getOption('originTop');
    var stampMaxY = ( isOriginTop ? offset.top : offset.bottom ) +
      stampSize.outerHeight;
    for ( var i = firstCol; i <= lastCol; i++ ) {
      this.colYs[i] = Math.max( stampMaxY, this.colYs[i] ); // Atualiza altura
    }
  };

  // Obtém o tamanho do contêiner após o layout
  proto._getContainerSize = function() {
    this.maxY = Math.max.apply( Math, this.colYs ); // Altura máxima das colunas
    var size = {
      height: this.maxY // Define altura do contêiner
    };

    // Ajusta largura se fitWidth estiver ativado
    if ( this._getOption('fitWidth') ) {
      size.width = this._getContainerFitWidth();
    }

    return size;
  };

  // Calcula largura ajustada para fitWidth
  proto._getContainerFitWidth = function() {
    var unusedCols = 0;
    // Conta colunas não usadas
    var i = this.cols;
    while ( --i ) {
      if ( this.colYs[i] !== 0 ) {
        break;
      }
      unusedCols++;
    }
    // Calcula largura baseada nas colunas usadas
    return ( this.cols - unusedCols ) * this.columnWidth - this.gutter;
  };

  // Verifica se o layout precisa de redimensionamento
  proto.needsResizeLayout = function() {
    var previousWidth = this.containerWidth; // Largura anterior
    this.getContainerWidth(); // Atualiza largura
    return previousWidth != this.containerWidth; // Compara com nova largura
  };

  return Masonry; // Retorna a classe Masonry

}));
/*!
 * Masonry layout mode
 * sub-classes Masonry
 * https://masonry.desandro.com
 */

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'isotope-layout/js/layout-modes/masonry', [
        '../layout-mode',
        'masonry-layout/masonry'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Browserify, Webpack
    module.exports = factory(
      require('../layout-mode'),
      require('masonry-layout')
    );
  } else {
    // Browser global
    factory(
      window.Isotope.LayoutMode,
      window.Masonry
    );
  }

}( window, function factory( LayoutMode, Masonry ) {
'use strict';

// -------------------------- masonryDefinition -------------------------- //

  // Cria uma classe de layout Masonry para o Isotope usando LayoutMode.create
  var MasonryMode = LayoutMode.create('masonry');

  var proto = MasonryMode.prototype;

  // Define métodos que devem ser mantidos do LayoutMode (não sobrescritos por Masonry)
  var keepModeMethods = {
    _getElementOffset: true,
    layout: true,
    _getMeasurement: true
  };

  // Herda métodos do protótipo do Masonry, exceto os métodos protegidos
  for ( var method in Masonry.prototype ) {
    // Copia métodos do Masonry que não estão em keepModeMethods
    if ( !keepModeMethods[ method ] ) {
      proto[ method ] = Masonry.prototype[ method ];
    }
  }

  // Armazena o método original measureColumns
  var measureColumns = proto.measureColumns;
  // Sobrescreve measureColumns para usar itens filtrados do Isotope
  proto.measureColumns = function() {
    // Define os itens como os filtrados do Isotope
    this.items = this.isotope.filteredItems;
    measureColumns.call( this ); // Chama o método original
  };

  // Armazena o método original _getOption
  var _getOption = proto._getOption;
  // Sobrescreve _getOption para suportar compatibilidade com isFitWidth
  proto._getOption = function( option ) {
    if ( option == 'fitWidth' ) {
      // Retorna isFitWidth se definido, senão fitWidth
      return this.options.isFitWidth !== undefined ?
        this.options.isFitWidth : this.options.fitWidth;
    }
    return _getOption.apply( this.isotope, arguments ); // Chama o método original
  };

  return MasonryMode; // Retorna a classe MasonryMode

}));

/**
 * fitRows layout mode
 */

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'isotope-layout/js/layout-modes/fit-rows', [
        '../layout-mode'
      ],
      factory );
  } else if ( typeof exports == 'object' ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // Browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

// Cria a classe de layout fitRows usando LayoutMode.create
var FitRows = LayoutMode.create('fitRows');

var proto = FitRows.prototype;

// Reseta o layout, inicializando coordenadas e medidas
proto._resetLayout = function() {
  this.x = 0; // Coordenada x inicial
  this.y = 0; // Coordenada y inicial
  this.maxY = 0; // Altura máxima do layout
  this._getMeasurement( 'gutter', 'outerWidth' ); // Obtém o valor do gutter
};

// Calcula a posição de um item no layout
proto._getItemLayoutPosition = function( item ) {
  item.getSize(); // Obtém dimensões do item

  var itemWidth = item.size.outerWidth + this.gutter; // Largura do item com gutter
  // Verifica se o item cabe na linha atual
  var containerWidth = this.isotope.size.innerWidth + this.gutter;
  if ( this.x !== 0 && itemWidth + this.x > containerWidth ) {
    this.x = 0; // Reseta x para começar nova linha
    this.y = this.maxY; // Move y para a altura máxima da linha anterior
  }

  // Define a posição do item
  var position = {
    x: this.x,
    y: this.y
  };

  // Atualiza a altura máxima do layout
  this.maxY = Math.max( this.maxY, this.y + item.size.outerHeight );
  this.x += itemWidth; // Avança x para o próximo item

  return position;
};

// Define o tamanho do contêiner após o layout
proto._getContainerSize = function() {
  return { height: this.maxY }; // Altura baseada na máxima y
};

return FitRows; // Retorna a classe FitRows

}));

/**
 * vertical layout mode
 */

( function( window, factory ) {
  // Início do módulo universal (UMD) para suportar diferentes ambientes (AMD, CommonJS, browser global)
  if ( typeof define == 'function' && define.amd ) {
    // AMD - RequireJS
    define( 'isotope-layout/js/layout-modes/vertical', [
        '../layout-mode'
      ],
      factory );
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS
    module.exports = factory(
      require('../layout-mode')
    );
  } else {
    // Browser global
    factory(
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( LayoutMode ) {
'use strict';

// Cria a classe de layout vertical com opção padrão
var Vertical = LayoutMode.create( 'vertical', {
  horizontalAlignment: 0 // Alinhamento à esquerda por padrão (0 = esquerda, 0.5 = centro, 1 = direita)
});

var proto = Vertical.prototype;

// Reseta o layout, inicializando a coordenada y
proto._resetLayout = function() {
  this.y = 0; // Coordenada y inicial
};

// Calcula a posição de um item no layout
proto._getItemLayoutPosition = function( item ) {
  item.getSize(); // Obtém dimensões do item
  // Calcula x com base no alinhamento horizontal
  var x = ( this.isotope.size.innerWidth - item.size.outerWidth ) *
    this.options.horizontalAlignment;
  var y = this.y; // Usa y atual
  this.y += item.size.outerHeight; // Avança y para o próximo item
  return { x: x, y: y }; // Retorna posição
};

// Define o tamanho do contêiner após o layout
proto._getContainerSize = function() {
  return { height: this.y }; // Altura baseada no último y
};

return Vertical; // Retorna a classe Vertical

}));

/*!
 * Isotope v3.0.6
 *
 * Licensed GPLv3 for open source use
 * or Isotope Commercial License for commercial use
 *
 * https://isotope.metafizzy.co
 * Copyright 2010-2018 Metafizzy
 */

( function( window, factory ) {
  // universal module definition
  /* jshint strict: false */ /*globals define, module, require */
  if ( typeof define == 'function' && define.amd ) {
    // AMD - Suporte para módulos AMD (ex: RequireJS)
    define( [
        'outlayer/outlayer',
        'get-size/get-size',
        'desandro-matches-selector/matches-selector',
        'fizzy-ui-utils/utils',
        'isotope-layout/js/item',
        'isotope-layout/js/layout-mode',
        // include default layout modes
        'isotope-layout/js/layout-modes/masonry',
        'isotope-layout/js/layout-modes/fit-rows',
        'isotope-layout/js/layout-modes/vertical'
      ],
      function( Outlayer, getSize, matchesSelector, utils, Item, LayoutMode ) {
        return factory( window, Outlayer, getSize, matchesSelector, utils, Item, LayoutMode );
      });
  } else if ( typeof module == 'object' && module.exports ) {
    // CommonJS - Suporte para Node.js e ambientes de build (ex: Webpack)
    module.exports = factory(
      window,
      require('outlayer'),
      require('get-size'),
      require('desandro-matches-selector'),
      require('fizzy-ui-utils'),
      require('isotope-layout/js/item'),
      require('isotope-layout/js/layout-mode'),
      // include default layout modes
      require('isotope-layout/js/layout-modes/masonry'),
      require('isotope-layout/js/layout-modes/fit-rows'),
      require('isotope-layout/js/layout-modes/vertical')
    );
  } else {
    // browser global - Fallback para uso direto em scripts no navegador
    window.Isotope = factory(
      window,
      window.Outlayer,
      window.getSize,
      window.matchesSelector,
      window.fizzyUIUtils,
      window.Isotope.Item,
      window.Isotope.LayoutMode
    );
  }

}( window, function factory( window, Outlayer, getSize, matchesSelector, utils,
  Item, LayoutMode ) {


// -------------------------- vars -------------------------- //

var jQuery = window.jQuery; // Usa o jQuery global, se disponível

// -------------------------- helpers -------------------------- //

var trim = String.prototype.trim ?
  function( str ) {
    return str.trim(); // Usa trim nativo se suportado
  } :
  function( str ) {
    return str.replace( /^\s+|\s+$/g, '' ); // Fallback para navegadores antigos
  };

// -------------------------- isotopeDefinition -------------------------- //

  // Cria uma classe de layout baseada em Outlayer chamada 'isotope'
  var Isotope = Outlayer.create( 'isotope', {
    layoutMode: 'masonry', // Layout padrão
    isJQueryFiltering: true, // Suporte para filtro via jQuery
    sortAscending: true // Ordem padrão de ordenação
  });

  Isotope.Item = Item;
  Isotope.LayoutMode = LayoutMode;

  var proto = Isotope.prototype;

  proto._create = function() {
    this.itemGUID = 0; // ID único incremental para itens
    // funções de ordenação personalizadas
    this._sorters = {};
    this._getSorters(); // inicializa as funções de ordenação
    // chama o método _create da superclasse (Outlayer)
    Outlayer.prototype._create.call( this );

    // inicializa os modos de layout registrados
    this.modes = {};
    // começa com todos os itens como filtrados
    this.filteredItems = this.items;
    // histórico das chaves de ordenação usadas
    this.sortHistory = [ 'original-order' ];
    // inicializa os modos de layout disponíveis
    for ( var name in LayoutMode.modes ) {
      this._initLayoutMode( name );
    }
  };

  proto.reloadItems = function() {
    // reinicia o contador de IDs dos itens
    this.itemGUID = 0;
    // chama o método da superclasse
    Outlayer.prototype.reloadItems.call( this );
  };

  proto._itemize = function() {
    var items = Outlayer.prototype._itemize.apply( this, arguments );
    // atribui um ID único a cada item para manter a ordem original
    for ( var i=0; i < items.length; i++ ) {
      var item = items[i];
      item.id = this.itemGUID++;
    }
    // atualiza os dados de ordenação para os itens
    this._updateItemsSortData( items );
    return items;
  };
  // -------------------------- layout -------------------------- //

  proto._initLayoutMode = function( name ) {
    var Mode = LayoutMode.modes[ name ];
    // define as opções do modo de layout
    // HACK: mescla as opções iniciais com as opções padrão do modo
    var initialOpts = this.options[ name ] || {};
    this.options[ name ] = Mode.options ?
      utils.extend( Mode.options, initialOpts ) : initialOpts;
    // cria uma instância do modo de layout
    this.modes[ name ] = new Mode( this );
  };

  proto.layout = function() {
    // se for a primeira vez que o layout está sendo feito
    if ( !this._isLayoutInited && this._getOption('initLayout') ) {
      this.arrange(); // executa todo o processo: filtro, ordenação, layout
      return;
    }
    this._layout(); // caso contrário, apenas faz o layout
  };

  // método interno usado por layout() e arrange()
  proto._layout = function() {
    var isInstant = this._getIsInstant(); // determina se o layout deve ser instantâneo
    this._resetLayout(); // reseta o estado do layout
    this._manageStamps(); // reposiciona elementos fixos (stamps)
    this.layoutItems( this.filteredItems, isInstant ); // aplica layout aos itens filtrados
    this._isLayoutInited = true; // marca como layout inicializado
  };

  // método principal que aplica filtro, ordenação e layout
  proto.arrange = function( opts ) {
    this.option( opts ); // aplica opções recebidas
    this._getIsInstant(); // verifica se o layout deve ser instantâneo

    // filtra os itens
    var filtered = this._filter( this.items );
    this.filteredItems = filtered.matches; // salva os itens que passaram no filtro

    this._bindArrangeComplete(); // vincula eventos para saber quando tudo terminou

    if ( this._isInstant ) {
      // sem animação
      this._noTransition( this._hideReveal, [ filtered ] );
    } else {
      this._hideReveal( filtered ); // animação de esconder/revelar
    }

    this._sort(); // ordena os itens
    this._layout(); // aplica o layout
  };

  // atalho para _init ser um alias de arrange
  proto._init = proto.arrange;

  // revela os itens necessários e esconde os que não foram filtrados
  proto._hideReveal = function( filtered ) {
    this.reveal( filtered.needReveal );
    this.hide( filtered.needHide );
  };

  // HACK: evita animações no primeiro layout ou se layoutInstant for true
  proto._getIsInstant = function() {
    var isLayoutInstant = this._getOption('layoutInstant');
    var isInstant = isLayoutInstant !== undefined ? isLayoutInstant :
      !this._isLayoutInited;
    this._isInstant = isInstant;
    return isInstant;
  };

  // escuta eventos (layout, hide, reveal) para emitir evento arrangeComplete
  proto._bindArrangeComplete = function() {
    // escuta 3 eventos para emitir o arrangeComplete
    var isLayoutComplete, isHideComplete, isRevealComplete;
    var _this = this;

    function arrangeParallelCallback() {
      // só dispara arrangeComplete quando os 3 eventos terminarem
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
  // -------------------------- filter -------------------------- //

  // Função que filtra os itens com base na opção `filter` (string CSS selector ou função)
  proto._filter = function( items ) {
    var filter = this.options.filter;
    filter = filter || '*'; // caso não haja filtro, usa '*' (seleciona todos)
    var matches = [];
    var hiddenMatched = [];
    var visibleUnmatched = [];

    var test = this._getFilterTest( filter ); // obtém função de teste baseada no filtro

    // testa cada item
    for ( var i=0; i < items.length; i++ ) {
      var item = items[i];
      if ( item.isIgnored ) {
        continue; // ignora se estiver marcado como ignorado
      }

      var isMatched = test( item ); // aplica filtro
      if ( isMatched ) {
        matches.push( item ); // item passou no filtro
      }

      // organiza os itens que precisam ser escondidos ou revelados
      if ( isMatched && item.isHidden ) {
        hiddenMatched.push( item );
      } else if ( !isMatched && !item.isHidden ) {
        visibleUnmatched.push( item );
      }
    }

    // retorna agrupamentos: os que passaram, os que precisam aparecer, e os que precisam sumir
    return {
      matches: matches,
      needReveal: hiddenMatched,
      needHide: visibleUnmatched
    };
  };

  // Obtém uma função de teste de filtro com base no tipo de filtro fornecido
  proto._getFilterTest = function( filter ) {
    if ( jQuery && this.options.isJQueryFiltering ) {
      // se estiver usando jQuery, usa o método is()
      return function( item ) {
        return jQuery( item.element ).is( filter );
      };
    }
    if ( typeof filter == 'function' ) {
      // se o filtro for uma função, utiliza diretamente
      return function( item ) {
        return filter( item.element );
      };
    }
    // caso contrário, usa como seletor CSS padrão
    return function( item ) {
      return matchesSelector( item.element, filter );
    };
  };

  // -------------------------- sorting -------------------------- //

  /**
   * Atualiza os dados de ordenação dos elementos fornecidos
   * @params {Array} elems
   * @public
   */
  proto.updateSortData = function( elems ) {
    var items;
    if ( elems ) {
      elems = utils.makeArray( elems ); // garante que é um array
      items = this.getItems( elems ); // recupera os itens correspondentes
    } else {
      items = this.items; // usa todos os itens caso não haja parâmetro
    }

    this._getSorters(); // atualiza definidores de ordenação
    this._updateItemsSortData( items ); // aplica ordenação nos dados dos itens
  };

  // Cria funções de ordenação com base nas opções de getSortData
  proto._getSorters = function() {
    var getSortData = this.options.getSortData;
    for ( var key in getSortData ) {
      var sorter = getSortData[ key ];
      this._sorters[ key ] = mungeSorter( sorter ); // cria função de ordenação
    }
  };

  /**
   * Atualiza os dados de ordenação para cada item
   * @params {Array} items - de Isotope.Items
   * @private
   */
  proto._updateItemsSortData = function( items ) {
    var len = items && items.length;

    for ( var i=0; len && i < len; i++ ) {
      var item = items[i];
      item.updateSortData(); // método definido nos itens individuais
    }
  };

  // ----- munge sorter ----- //

  // Função que interpreta um "sorter" (definição de ordenação) e retorna uma função apropriada
  var mungeSorter = ( function() {

    // Função principal que transforma o sort string/função em função de acesso e parse
    function mungeSorter( sorter ) {
      if ( typeof sorter != 'string' ) {
        return sorter; // se não for string, assume que já é uma função válida
      }

      var args = trim( sorter ).split(' '); // divide string para separar seletor e parser
      var query = args[0];

      // verifica se o seletor é um atributo (ex: [data-order])
      var attrMatch = query.match( /^\[(.+)\]$/ );
      var attr = attrMatch && attrMatch[1];

      var getValue = getValueGetter( attr, query ); // função que extrai o valor

      var parser = Isotope.sortDataParsers[ args[1] ]; // parser adicional, como parseInt, parseFloat...

      // retorna função final que aplica parser se existir
      sorter = parser ? function( elem ) {
        return elem && parser( getValue( elem ) );
      } :
      function( elem ) {
        return elem && getValue( elem );
      };

      return sorter;
    }

    // Gera uma função que extrai valor: ou atributo ou texto do elemento filho
    function getValueGetter( attr, query ) {
      if ( attr ) {
        // se for atributo
        return function getAttribute( elem ) {
          return elem.getAttribute( attr );
        };
      }

      // caso contrário, assume que é seletor e retorna o texto
      return function getChildText( elem ) {
        var child = elem.querySelector( query );
        return child && child.textContent;
      };
    }

    return mungeSorter; // retorna a função externa
  })();
  // Parsers utilizados nas strings de atalho para sort
  Isotope.sortDataParsers = {
    'parseInt': function( val ) {
      return parseInt( val, 10 );
    },
    'parseFloat': function( val ) {
      return parseFloat( val );
    }
  };

  // -------------------------- método de ordenação -------------------------- //

  // Ordena os itens filtrados com base em sortBy e sortAscending
  proto._sort = function() {
    if ( !this.options.sortBy ) {
      return;
    }

    var sortBys = utils.makeArray( this.options.sortBy );

    // Atualiza histórico de ordenação, se necessário
    if ( !this._getIsSameSortBy( sortBys ) ) {
      this.sortHistory = sortBys.concat( this.sortHistory );
    }

    var itemSorter = getItemSorter( this.sortHistory, this.options.sortAscending );
    this.filteredItems.sort( itemSorter );
  };

  // Verifica se o sortBy atual é igual ao início do sortHistory
  proto._getIsSameSortBy = function( sortBys ) {
    for ( var i=0; i < sortBys.length; i++ ) {
      if ( sortBys[i] != this.sortHistory[i] ) {
        return false;
      }
    }
    return true;
  };

  // Retorna função usada para ordenação dos itens
  function getItemSorter( sortBys, sortAsc ) {
    return function sorter( itemA, itemB ) {
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
  }

  // -------------------------- métodos de layout -------------------------- //

  // Obtém o modo de layout atual (ex: masonry, fitRows, etc)
  proto._mode = function() {
    var layoutMode = this.options.layoutMode;
    var mode = this.modes[ layoutMode ];
    if ( !mode ) {
      throw new Error( 'No layout mode: ' + layoutMode );
    }
    // Garante que as opções do modo estejam sincronizadas
    mode.options = this.options[ layoutMode ];
    return mode;
  };

  proto._resetLayout = function() {
    Outlayer.prototype._resetLayout.call( this );
    this._mode()._resetLayout();
  };

  proto._getItemLayoutPosition = function( item  ) {
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

  // -------------------------- adicionar & remover -------------------------- //

  // Sobrescreve o método appended do Outlayer
  proto.appended = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }
    var filteredItems = this._filterRevealAdded( items );
    this.filteredItems = this.filteredItems.concat( filteredItems );
  };

  // Sobrescreve o método prepended do Outlayer
  proto.prepended = function( elems ) {
    var items = this._itemize( elems );
    if ( !items.length ) {
      return;
    }
    this._resetLayout();
    this._manageStamps();
    var filteredItems = this._filterRevealAdded( items );
    this.layoutItems( this.filteredItems );
    this.filteredItems = filteredItems.concat( this.filteredItems );
    this.items = items.concat( this.items );
  };

  // Filtra, revela e posiciona novos itens
  proto._filterRevealAdded = function( items ) {
    var filtered = this._filter( items );
    this.hide( filtered.needHide );
    this.reveal( filtered.matches );
    this.layoutItems( filtered.matches, true ); // sem transição
    return filtered.matches;
  };

  /**
   * Insere elementos (append), aplica filtro e layout
   */
  proto.insert = function( elems ) {
    var items = this.addItems( elems );
    if ( !items.length ) {
      return;
    }

    var i, item;
    var len = items.length;

    for ( i=0; i < len; i++ ) {
      item = items[i];
      this.element.appendChild( item.element );
    }

    var filteredInsertItems = this._filter( items ).matches;

    for ( i=0; i < len; i++ ) {
      items[i].isLayoutInstant = true; // marca como instantâneo
    }

    this.arrange();

    for ( i=0; i < len; i++ ) {
      delete items[i].isLayoutInstant;
    }

    this.reveal( filteredInsertItems );
  };

  // Sobrescreve o método remove padrão
  var _remove = proto.remove;
  proto.remove = function( elems ) {
    elems = utils.makeArray( elems );
    var removeItems = this.getItems( elems );

    _remove.call( this, elems );

    var len = removeItems && removeItems.length;

    for ( var i=0; len && i < len; i++ ) {
      var item = removeItems[i];
      utils.removeFrom( this.filteredItems, item );
    }
  };

  // Método para embaralhar os itens
  proto.shuffle = function() {
    for ( var i=0; i < this.items.length; i++ ) {
      var item = this.items[i];
      item.sortData.random = Math.random();
    }
    this.options.sortBy = 'random';
    this._sort();
    this._layout();
  };

  /**
   * Executa uma função sem aplicar transição (útil para ações instantâneas)
   */
  proto._noTransition = function( fn, args ) {
    var transitionDuration = this.options.transitionDuration;
    this.options.transitionDuration = 0;
    var returnValue = fn.apply( this, args );
    this.options.transitionDuration = transitionDuration;
    return returnValue;
  };

  // -------------------------- helpers -------------------------- //

  /**
   * Retorna elementos DOM dos itens filtrados
   */
  proto.getFilteredItemElements = function() {
    return this.filteredItems.map( function( item ) {
      return item.element;
    });
  };

  // Finaliza o módulo, retornando o construtor Isotope
  return Isotope;

}));
