(function (global, factory) {
	typeof exports === 'object' && typeof module !== 'undefined' ? module.exports = factory() :
	typeof define === 'function' && define.amd ? define(factory) :
	(global.GeminiScrollbar = factory());
}(this, (function () { 'use strict';

function createCommonjsModule(fn, module) {
	return module = { exports: {} }, fn(module, module.exports), module.exports;
}

var EventDispatcher_1 = createCommonjsModule(function (module) {
/**
 * @author mrdoob / http://mrdoob.com/
 */

var EventDispatcher = function () {

	this.addEventListener = EventDispatcher.prototype.addEventListener;
	this.hasEventListener = EventDispatcher.prototype.hasEventListener;
	this.removeEventListener = EventDispatcher.prototype.removeEventListener;
	this.dispatchEvent = EventDispatcher.prototype.dispatchEvent;

};

EventDispatcher.prototype = {

	constructor: EventDispatcher,

	addEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) { this._listeners = {}; }

		var listeners = this._listeners;

		if ( listeners[ type ] === undefined ) {

			listeners[ type ] = [];

		}

		if ( listeners[ type ].indexOf( listener ) === - 1 ) {

			listeners[ type ].push( listener );

		}

	},

	hasEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) { return false; }

		var listeners = this._listeners;

		if ( listeners[ type ] !== undefined && listeners[ type ].indexOf( listener ) !== - 1 ) {

			return true;

		}

		return false;

	},

	removeEventListener: function ( type, listener ) {

		if ( this._listeners === undefined ) { return; }

		var listeners = this._listeners;
		var index = listeners[ type ].indexOf( listener );

		if ( index !== - 1 ) {

			listeners[ type ].splice( index, 1 );

		}

	},

	dispatchEvent: function ( event ) {
		var this$1 = this;


		if ( this._listeners === undefined ) { return; }

		var listeners = this._listeners;
		var listenerArray = listeners[ event.type ];

		if ( listenerArray !== undefined ) {

			event.target = this;

			for ( var i = 0, l = listenerArray.length; i < l; i ++ ) {

				listenerArray[ i ].call( this$1, event );

			}

		}

	}

};

try {
module.exports = EventDispatcher;
} catch( e ) {
	// muettttte!! *_*
}
});

/**
 * lodash (Custom Build) <https://lodash.com/>
 * Build: `lodash modularize exports="npm" -o ./`
 * Copyright jQuery Foundation and other contributors <https://jquery.org/>
 * Released under MIT license <https://lodash.com/license>
 * Based on Underscore.js 1.8.3 <http://underscorejs.org/LICENSE>
 * Copyright Jeremy Ashkenas, DocumentCloud and Investigative Reporters & Editors
 */

/** Used as references for various `Number` constants. */
var MAX_SAFE_INTEGER = 9007199254740991;

/** `Object#toString` result references. */
var argsTag = '[object Arguments]';
var funcTag = '[object Function]';
var genTag = '[object GeneratorFunction]';

/** Used to detect unsigned integer values. */
var reIsUint = /^(?:0|[1-9]\d*)$/;

/**
 * A faster alternative to `Function#apply`, this function invokes `func`
 * with the `this` binding of `thisArg` and the arguments of `args`.
 *
 * @private
 * @param {Function} func The function to invoke.
 * @param {*} thisArg The `this` binding of `func`.
 * @param {Array} args The arguments to invoke `func` with.
 * @returns {*} Returns the result of `func`.
 */
function apply(func, thisArg, args) {
  switch (args.length) {
    case 0: return func.call(thisArg);
    case 1: return func.call(thisArg, args[0]);
    case 2: return func.call(thisArg, args[0], args[1]);
    case 3: return func.call(thisArg, args[0], args[1], args[2]);
  }
  return func.apply(thisArg, args);
}

/**
 * The base implementation of `_.times` without support for iteratee shorthands
 * or max array length checks.
 *
 * @private
 * @param {number} n The number of times to invoke `iteratee`.
 * @param {Function} iteratee The function invoked per iteration.
 * @returns {Array} Returns the array of results.
 */
function baseTimes(n, iteratee) {
  var index = -1,
      result = Array(n);

  while (++index < n) {
    result[index] = iteratee(index);
  }
  return result;
}

/**
 * Creates a unary function that invokes `func` with its argument transformed.
 *
 * @private
 * @param {Function} func The function to wrap.
 * @param {Function} transform The argument transform.
 * @returns {Function} Returns the new function.
 */
function overArg(func, transform) {
  return function(arg) {
    return func(transform(arg));
  };
}

/** Used for built-in method references. */
var objectProto = Object.prototype;

/** Used to check objects for own properties. */
var hasOwnProperty = objectProto.hasOwnProperty;

/**
 * Used to resolve the
 * [`toStringTag`](http://ecma-international.org/ecma-262/7.0/#sec-object.prototype.tostring)
 * of values.
 */
var objectToString = objectProto.toString;

/** Built-in value references. */
var propertyIsEnumerable = objectProto.propertyIsEnumerable;

/* Built-in method references for those with the same name as other `lodash` methods. */
var nativeKeys = overArg(Object.keys, Object);
var nativeMax = Math.max;

/** Detect if properties shadowing those on `Object.prototype` are non-enumerable. */
var nonEnumShadows = !propertyIsEnumerable.call({ 'valueOf': 1 }, 'valueOf');

/**
 * Creates an array of the enumerable property names of the array-like `value`.
 *
 * @private
 * @param {*} value The value to query.
 * @param {boolean} inherited Specify returning inherited property names.
 * @returns {Array} Returns the array of property names.
 */
function arrayLikeKeys(value, inherited) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  // Safari 9 makes `arguments.length` enumerable in strict mode.
  var result = (isArray(value) || isArguments(value))
    ? baseTimes(value.length, String)
    : [];

  var length = result.length,
      skipIndexes = !!length;

  for (var key in value) {
    if ((inherited || hasOwnProperty.call(value, key)) &&
        !(skipIndexes && (key == 'length' || isIndex(key, length)))) {
      result.push(key);
    }
  }
  return result;
}

/**
 * Assigns `value` to `key` of `object` if the existing value is not equivalent
 * using [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * for equality comparisons.
 *
 * @private
 * @param {Object} object The object to modify.
 * @param {string} key The key of the property to assign.
 * @param {*} value The value to assign.
 */
function assignValue(object, key, value) {
  var objValue = object[key];
  if (!(hasOwnProperty.call(object, key) && eq(objValue, value)) ||
      (value === undefined && !(key in object))) {
    object[key] = value;
  }
}

/**
 * The base implementation of `_.keys` which doesn't treat sparse arrays as dense.
 *
 * @private
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 */
function baseKeys(object) {
  if (!isPrototype(object)) {
    return nativeKeys(object);
  }
  var result = [];
  for (var key in Object(object)) {
    if (hasOwnProperty.call(object, key) && key != 'constructor') {
      result.push(key);
    }
  }
  return result;
}

/**
 * The base implementation of `_.rest` which doesn't validate or coerce arguments.
 *
 * @private
 * @param {Function} func The function to apply a rest parameter to.
 * @param {number} [start=func.length-1] The start position of the rest parameter.
 * @returns {Function} Returns the new function.
 */
function baseRest(func, start) {
  start = nativeMax(start === undefined ? (func.length - 1) : start, 0);
  return function() {
    var args = arguments,
        index = -1,
        length = nativeMax(args.length - start, 0),
        array = Array(length);

    while (++index < length) {
      array[index] = args[start + index];
    }
    index = -1;
    var otherArgs = Array(start + 1);
    while (++index < start) {
      otherArgs[index] = args[index];
    }
    otherArgs[start] = array;
    return apply(func, this, otherArgs);
  };
}

/**
 * Copies properties of `source` to `object`.
 *
 * @private
 * @param {Object} source The object to copy properties from.
 * @param {Array} props The property identifiers to copy.
 * @param {Object} [object={}] The object to copy properties to.
 * @param {Function} [customizer] The function to customize copied values.
 * @returns {Object} Returns `object`.
 */
function copyObject(source, props, object, customizer) {
  object || (object = {});

  var index = -1,
      length = props.length;

  while (++index < length) {
    var key = props[index];

    var newValue = customizer
      ? customizer(object[key], source[key], key, object, source)
      : undefined;

    assignValue(object, key, newValue === undefined ? source[key] : newValue);
  }
  return object;
}

/**
 * Creates a function like `_.assign`.
 *
 * @private
 * @param {Function} assigner The function to assign values.
 * @returns {Function} Returns the new assigner function.
 */
function createAssigner(assigner) {
  return baseRest(function(object, sources) {
    var index = -1,
        length = sources.length,
        customizer = length > 1 ? sources[length - 1] : undefined,
        guard = length > 2 ? sources[2] : undefined;

    customizer = (assigner.length > 3 && typeof customizer == 'function')
      ? (length--, customizer)
      : undefined;

    if (guard && isIterateeCall(sources[0], sources[1], guard)) {
      customizer = length < 3 ? undefined : customizer;
      length = 1;
    }
    object = Object(object);
    while (++index < length) {
      var source = sources[index];
      if (source) {
        assigner(object, source, index, customizer);
      }
    }
    return object;
  });
}

/**
 * Checks if `value` is a valid array-like index.
 *
 * @private
 * @param {*} value The value to check.
 * @param {number} [length=MAX_SAFE_INTEGER] The upper bounds of a valid index.
 * @returns {boolean} Returns `true` if `value` is a valid index, else `false`.
 */
function isIndex(value, length) {
  length = length == null ? MAX_SAFE_INTEGER : length;
  return !!length &&
    (typeof value == 'number' || reIsUint.test(value)) &&
    (value > -1 && value % 1 == 0 && value < length);
}

/**
 * Checks if the given arguments are from an iteratee call.
 *
 * @private
 * @param {*} value The potential iteratee value argument.
 * @param {*} index The potential iteratee index or key argument.
 * @param {*} object The potential iteratee object argument.
 * @returns {boolean} Returns `true` if the arguments are from an iteratee call,
 *  else `false`.
 */
function isIterateeCall(value, index, object) {
  if (!isObject(object)) {
    return false;
  }
  var type = typeof index;
  if (type == 'number'
        ? (isArrayLike(object) && isIndex(index, object.length))
        : (type == 'string' && index in object)
      ) {
    return eq(object[index], value);
  }
  return false;
}

/**
 * Checks if `value` is likely a prototype object.
 *
 * @private
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a prototype, else `false`.
 */
function isPrototype(value) {
  var Ctor = value && value.constructor,
      proto = (typeof Ctor == 'function' && Ctor.prototype) || objectProto;

  return value === proto;
}

/**
 * Performs a
 * [`SameValueZero`](http://ecma-international.org/ecma-262/7.0/#sec-samevaluezero)
 * comparison between two values to determine if they are equivalent.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to compare.
 * @param {*} other The other value to compare.
 * @returns {boolean} Returns `true` if the values are equivalent, else `false`.
 * @example
 *
 * var object = { 'a': 1 };
 * var other = { 'a': 1 };
 *
 * _.eq(object, object);
 * // => true
 *
 * _.eq(object, other);
 * // => false
 *
 * _.eq('a', 'a');
 * // => true
 *
 * _.eq('a', Object('a'));
 * // => false
 *
 * _.eq(NaN, NaN);
 * // => true
 */
function eq(value, other) {
  return value === other || (value !== value && other !== other);
}

/**
 * Checks if `value` is likely an `arguments` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an `arguments` object,
 *  else `false`.
 * @example
 *
 * _.isArguments(function() { return arguments; }());
 * // => true
 *
 * _.isArguments([1, 2, 3]);
 * // => false
 */
function isArguments(value) {
  // Safari 8.1 makes `arguments.callee` enumerable in strict mode.
  return isArrayLikeObject(value) && hasOwnProperty.call(value, 'callee') &&
    (!propertyIsEnumerable.call(value, 'callee') || objectToString.call(value) == argsTag);
}

/**
 * Checks if `value` is classified as an `Array` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array, else `false`.
 * @example
 *
 * _.isArray([1, 2, 3]);
 * // => true
 *
 * _.isArray(document.body.children);
 * // => false
 *
 * _.isArray('abc');
 * // => false
 *
 * _.isArray(_.noop);
 * // => false
 */
var isArray = Array.isArray;

/**
 * Checks if `value` is array-like. A value is considered array-like if it's
 * not a function and has a `value.length` that's an integer greater than or
 * equal to `0` and less than or equal to `Number.MAX_SAFE_INTEGER`.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is array-like, else `false`.
 * @example
 *
 * _.isArrayLike([1, 2, 3]);
 * // => true
 *
 * _.isArrayLike(document.body.children);
 * // => true
 *
 * _.isArrayLike('abc');
 * // => true
 *
 * _.isArrayLike(_.noop);
 * // => false
 */
function isArrayLike(value) {
  return value != null && isLength(value.length) && !isFunction(value);
}

/**
 * This method is like `_.isArrayLike` except that it also checks if `value`
 * is an object.
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an array-like object,
 *  else `false`.
 * @example
 *
 * _.isArrayLikeObject([1, 2, 3]);
 * // => true
 *
 * _.isArrayLikeObject(document.body.children);
 * // => true
 *
 * _.isArrayLikeObject('abc');
 * // => false
 *
 * _.isArrayLikeObject(_.noop);
 * // => false
 */
function isArrayLikeObject(value) {
  return isObjectLike(value) && isArrayLike(value);
}

/**
 * Checks if `value` is classified as a `Function` object.
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a function, else `false`.
 * @example
 *
 * _.isFunction(_);
 * // => true
 *
 * _.isFunction(/abc/);
 * // => false
 */
function isFunction(value) {
  // The use of `Object#toString` avoids issues with the `typeof` operator
  // in Safari 8-9 which returns 'object' for typed array and other constructors.
  var tag = isObject(value) ? objectToString.call(value) : '';
  return tag == funcTag || tag == genTag;
}

/**
 * Checks if `value` is a valid array-like length.
 *
 * **Note:** This method is loosely based on
 * [`ToLength`](http://ecma-international.org/ecma-262/7.0/#sec-tolength).
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is a valid length, else `false`.
 * @example
 *
 * _.isLength(3);
 * // => true
 *
 * _.isLength(Number.MIN_VALUE);
 * // => false
 *
 * _.isLength(Infinity);
 * // => false
 *
 * _.isLength('3');
 * // => false
 */
function isLength(value) {
  return typeof value == 'number' &&
    value > -1 && value % 1 == 0 && value <= MAX_SAFE_INTEGER;
}

/**
 * Checks if `value` is the
 * [language type](http://www.ecma-international.org/ecma-262/7.0/#sec-ecmascript-language-types)
 * of `Object`. (e.g. arrays, functions, objects, regexes, `new Number(0)`, and `new String('')`)
 *
 * @static
 * @memberOf _
 * @since 0.1.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is an object, else `false`.
 * @example
 *
 * _.isObject({});
 * // => true
 *
 * _.isObject([1, 2, 3]);
 * // => true
 *
 * _.isObject(_.noop);
 * // => true
 *
 * _.isObject(null);
 * // => false
 */
function isObject(value) {
  var type = typeof value;
  return !!value && (type == 'object' || type == 'function');
}

/**
 * Checks if `value` is object-like. A value is object-like if it's not `null`
 * and has a `typeof` result of "object".
 *
 * @static
 * @memberOf _
 * @since 4.0.0
 * @category Lang
 * @param {*} value The value to check.
 * @returns {boolean} Returns `true` if `value` is object-like, else `false`.
 * @example
 *
 * _.isObjectLike({});
 * // => true
 *
 * _.isObjectLike([1, 2, 3]);
 * // => true
 *
 * _.isObjectLike(_.noop);
 * // => false
 *
 * _.isObjectLike(null);
 * // => false
 */
function isObjectLike(value) {
  return !!value && typeof value == 'object';
}

/**
 * Assigns own enumerable string keyed properties of source objects to the
 * destination object. Source objects are applied from left to right.
 * Subsequent sources overwrite property assignments of previous sources.
 *
 * **Note:** This method mutates `object` and is loosely based on
 * [`Object.assign`](https://mdn.io/Object/assign).
 *
 * @static
 * @memberOf _
 * @since 0.10.0
 * @category Object
 * @param {Object} object The destination object.
 * @param {...Object} [sources] The source objects.
 * @returns {Object} Returns `object`.
 * @see _.assignIn
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 * }
 *
 * function Bar() {
 *   this.c = 3;
 * }
 *
 * Foo.prototype.b = 2;
 * Bar.prototype.d = 4;
 *
 * _.assign({ 'a': 0 }, new Foo, new Bar);
 * // => { 'a': 1, 'c': 3 }
 */
var assign = createAssigner(function(object, source) {
  if (nonEnumShadows || isPrototype(source) || isArrayLike(source)) {
    copyObject(source, keys(source), object);
    return;
  }
  for (var key in source) {
    if (hasOwnProperty.call(source, key)) {
      assignValue(object, key, source[key]);
    }
  }
});

/**
 * Creates an array of the own enumerable property names of `object`.
 *
 * **Note:** Non-object values are coerced to objects. See the
 * [ES spec](http://ecma-international.org/ecma-262/7.0/#sec-object.keys)
 * for more details.
 *
 * @static
 * @since 0.1.0
 * @memberOf _
 * @category Object
 * @param {Object} object The object to query.
 * @returns {Array} Returns the array of property names.
 * @example
 *
 * function Foo() {
 *   this.a = 1;
 *   this.b = 2;
 * }
 *
 * Foo.prototype.c = 3;
 *
 * _.keys(new Foo);
 * // => ['a', 'b'] (iteration order is not guaranteed)
 *
 * _.keys('hi');
 * // => ['0', '1']
 */
function keys(object) {
  return isArrayLike(object) ? arrayLikeKeys(object) : baseKeys(object);
}

var index$1 = assign;

var version = "0.1.4";

var DPR = index$1({
  VERSION: version,
  DELAY: 500
}, EventDispatcher_1.prototype);

var _dpr = window.devicePixelRatio;
var _timeout;

function _debounce (fn) {
  window.clearTimeout(_timeout);
  _timeout = window.setTimeout(fn, DPR.DELAY);
}

function _handleResize () {
  var devicePixelRatio = window.devicePixelRatio;

  if (_dpr !== devicePixelRatio) {
    _dpr = devicePixelRatio;

    DPR.dispatchEvent({
      devicePixelRatio: devicePixelRatio ,
      type: 'change'
    });
  }
}

window.addEventListener('resize', _debounce.bind(null, _handleResize));

/* Copyright (c) 2011 David Walsh
 * http://davidwalsh.name/detect-scrollbar-width
 */
function getScrollbarWidth() {
  var e = document.createElement('div');
  var scrollbar_width = 0;

  e.style.position = 'absolute';
  e.style.top = '-9999px';
  e.style.width = '100px';
  e.style.height = '100px';
  e.style.overflow = 'scroll';
  e.style.msOverflowStyle = 'scrollbar';
  document.body.appendChild(e);
  scrollbar_width = (e.offsetWidth - e.clientWidth);
  document.body.removeChild(e);

  return scrollbar_width;
}

/* Copyright (c) 2015 Lucas Wiener
 * https://github.com/wnr/element-resize-detector
 */
function isIE$1() {
  var agent = navigator.userAgent.toLowerCase();
  return agent.indexOf('msie') !== -1 || agent.indexOf('trident') !== -1 || agent.indexOf(' edge/') !== -1;
}

function addClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(function (cl) {
      el.classList.add(cl);
    });
  }
  el.className += " " + (classNames.join(' '));
}

function removeClass(el, classNames) {
  if (el.classList) {
    return classNames.forEach(function (cl) {
      el.classList.remove(cl);
    });
  }
  el.className = el.className.replace(new RegExp(("(^|\\b)" + (classNames.join('|')) + "(\\b|$)"), 'gi'), ' ');
}

var CLASSNAMES = {
  element: 'gm-scrollbar-container',
  verticalScrollbar: 'gm-scrollbar -vertical',
  horizontalScrollbar: 'gm-scrollbar -horizontal',
  thumb: 'thumb',
  view: 'gm-scroll-view',
  autoshow: 'gm-autoshow',
  disable: 'gm-scrollbar-disable-selection',
  prevented: 'gm-prevented',
  resizeTrigger: 'gm-resize-trigger',
};

var isIE = isIE$1();

var SCROLLBAR_WIDTH = 0;

DPR.addEventListener('change', function (r) { return console.log(r); });

var GeminiScrollbar = function GeminiScrollbar(config) {
  if ( config === void 0 ) config = {};

  this.opts = Object.assign(this._defaults, config);

  SCROLLBAR_WIDTH = getScrollbarWidth();
  this.DONT_CREATE_GEMINI = ((SCROLLBAR_WIDTH === 0) && (this.opts.forceGemini === false));

  if (this.DONT_CREATE_GEMINI) {
    addClass(this.opts.element, [CLASSNAMES.prevented]);
    return this;
  }

  this._dom = {};
  this._handlers = {};
  this._cursorDown = false;
  this._prevPageX = 0;
  this._prevPageY = 0;

  this._dom.doc = document;
  this._dom.body = document.body;

  if (this.opts.createElements === true) { this._createElements(); }
  else { this._cacheElements(); }

  this._dom.resizeObject = (this.opts._createResizeObject)
    ? this._createResizeTrigger()
    : this.opts.element.querySelector(("." + (CLASSNAMES.resizeTrigger)));

  if (this.opts.autoshow) { addClass(this.opts.element, [CLASSNAMES.autoshow]); }
  addClass(this.opts.element, [CLASSNAMES.element]);
  addClass(this._dom.view, [CLASSNAMES.view]);
  addClass(this._dom.vscrollbar, CLASSNAMES.verticalScrollbar.split(/\s/));
  addClass(this._dom.hscrollbar, CLASSNAMES.horizontalScrollbar.split(/\s/));
  addClass(this._dom.vthumb, [CLASSNAMES.thumb]);
  addClass(this._dom.hthumb, [CLASSNAMES.thumb]);

  return this._bindEvents().update();
};

var prototypeAccessors = { _defaults: {} };

/*
 * Recalculates the dimensions of the created DOMElements.
 * @public
 * @return GeminiScrollbar
 */
prototypeAccessors._defaults.get = function () {
  return {
    element: null,
    autoshow: false,
    createElements: true,
    forceGemini: false,
    onResize: null,
    _createResizeObject: true
  };
};

GeminiScrollbar.prototype.update = function update () {
  if (this.DONT_CREATE_GEMINI) { return this; }

  SCROLLBAR_WIDTH = getScrollbarWidth();

  var heightPercentage, widthPercentage;

  this._dom.view.style.width = (this.opts.element.offsetWidth + SCROLLBAR_WIDTH) + "px";
  this._dom.view.style.height = (this.opts.element.offsetHeight + SCROLLBAR_WIDTH) + "px";

  heightPercentage = (this._dom.view.clientHeight * 100 / this._dom.view.scrollHeight);
  widthPercentage = (this._dom.view.clientWidth * 100 / this._dom.view.scrollWidth);

  this._dom.vthumb.style.height = (heightPercentage < 100) ? (heightPercentage + "%") : '';
  this._dom.hthumb.style.width = (widthPercentage < 100) ? (widthPercentage + "%") : '';

  this._scrollHandler();

  return this;
};

GeminiScrollbar.prototype.destroy = function destroy () {
  if (this._dom.resizeObject) {
    this._dom.resizeObject.contentDocument.defaultView.removeEventListener('resize', this._handlers._resizeHandler);
    this.opts.element.removeChild(this._dom.resizeObject);
  }

  if (this.DONT_CREATE_GEMINI) { return this; }

  this._unbinEvents();

  removeClass(this.opts.element, [CLASSNAMES.element, CLASSNAMES.autoshow]);

  if (this.opts.createElements === true) { this._destroyElements(); }
  else { this._resetElements(); }

  this._handlers = null;
  this._dom = null;

  return null;
};

/* Returns the cached viewElement reference (the main scrolling-box)
 * @public
 * @return {NodeElement} this._dom.view
 */
GeminiScrollbar.prototype.getViewElement = function getViewElement () {
  return this._dom.view;
};

/* @private */
GeminiScrollbar.prototype._createElements = function _createElements () {
    var this$1 = this;

  this._dom.view = document.createElement('div');
  this._dom.vscrollbar = document.createElement('div');
  this._dom.vthumb = document.createElement('div');
  this._dom.hscrollbar = document.createElement('div');
  this._dom.hthumb = document.createElement('div');

  while(this.opts.element.childNodes.length > 0) {
    this$1._dom.view.appendChild(this$1.opts.element.childNodes[0]);
  }

  this._dom.vscrollbar.appendChild(this._dom.vthumb);
  this._dom.hscrollbar.appendChild(this._dom.hthumb);

  this.opts.element.appendChild(this._dom.vscrollbar);
  this.opts.element.appendChild(this._dom.hscrollbar);
  this.opts.element.appendChild(this._dom.view);
};

  /* @private */
GeminiScrollbar.prototype._cacheElements = function _cacheElements () {
  this._dom.view = this.opts.element.querySelector(("." + (CLASSNAMES.view)));
  this._dom.vscrollbar = this.opts.element.querySelector(("." + (CLASSNAMES.verticalScrollbar.split(' ').join('.'))));
  this._dom.vthumb = this._dom.vscrollbar.querySelector(("." + (CLASSNAMES.thumb)));
  this._dom.hscrollbar = this.opts.element.querySelector(("." + (CLASSNAMES.horizontalScrollbar.split(' ').join('.'))));
  this._dom.hthumb = this._dom.hscrollbar.querySelector(("." + (CLASSNAMES.thumb)));
};

GeminiScrollbar.prototype._destroyElements = function _destroyElements () {
    var this$1 = this;

  this.opts.element.removeChild(this._dom.vscrollbar);
  this.opts.element.removeChild(this._dom.hscrollbar);
  while(this._dom.view.childNodes.length > 0) {
    this$1.opts.element.appendChild(this$1._dom.view.childNodes[0]);
  }
  this.opts.element.removeChild(this._dom.view);
};

GeminiScrollbar.prototype._resetElements = function _resetElements () {
  this._dom.view.style.width = '';
  this._dom.view.style.height = '';
  this._dom.vscrollbar.style.display = 'none';
  this._dom.hscrollbar.style.display = 'none';
 };

GeminiScrollbar.prototype._createResizeTrigger = function _createResizeTrigger () {
  // const _this = this;
  // this._handlers._resizeHandler = this._resizeHandler.bind(this);

  var obj = document.createElement('object');
  addClass(obj, [CLASSNAMES.resizeTrigger]);
  obj.type = 'text/html';
  // obj.onload = function () {
  // obj.contentDocument.defaultView.addEventListener('resize', _this._handlers._resizeHandler);
  // };

  //IE: Does not like that this happens before, even if it is also added after.
  if (!isIE) {
    obj.data = 'about:blank';
  }

  this.opts.element.appendChild(obj);

  //IE: This must occur after adding the object to the DOM.
  if (isIE) {
    obj.data = 'about:blank';
  }

  // this._dom.resizeObject = obj;
  return obj;
};

// _bindResizeEvent() {
// }

/* @private */
GeminiScrollbar.prototype._bindEvents = function _bindEvents () {
  this._handlers._scrollHandler = this._scrollHandler.bind(this);

  this._handlers._clickVerticalTrackHandler = this._clickVerticalTrackHandler.bind(this);
  this._handlers._clickHorizontalTrackHandler = this._clickHorizontalTrackHandler.bind(this);

  this._handlers._clickVerticalThumbHandler = this._clickVerticalThumbHandler.bind(this);
  this._handlers._clickHorizontalThumbHandler = this._clickHorizontalThumbHandler.bind(this);

  this._handlers._mouseUpDocumentHandler = this._mouseUpDocumentHandler.bind(this);
  this._handlers._mouseMoveDocumentHandler = this._mouseMoveDocumentHandler.bind(this);

  this._handlers._resizeHandler = this._resizeHandler.bind(this);

  this._dom.view.addEventListener('scroll', this._handlers._scrollHandler);

  this._dom.vscrollbar.addEventListener('mousedown', this._handlers._clickVerticalTrackHandler);
  this._dom.hscrollbar.addEventListener('mousedown', this._handlers._clickHorizontalTrackHandler);

  this._dom.vthumb.addEventListener('mousedown', this._handlers._clickVerticalThumbHandler);
  this._dom.hthumb.addEventListener('mousedown', this._handlers._clickHorizontalThumbHandler);

  this._dom.doc.addEventListener('mouseup', this._handlers._mouseUpDocumentHandler);

  // this._dom.resizeObject.onload = function () {
  // this._dom.resizeObject.contentDocument.defaultView.addEventListener('resize', _this._handlers._resizeHandler);
  // }

  this._dom.resizeObject.contentDocument.defaultView.addEventListener('resize', this._handlers._resizeHandler);

  return this;
};

GeminiScrollbar.prototype._unbinEvents = function _unbinEvents () {
  this._dom.view.removeEventListener('scroll', this._handlers._scrollHandler);

  this._dom.vscrollbar.removeEventListener('mousedown', this._handlers._clickVerticalTrackHandler);
  this._dom.hscrollbar.removeEventListener('mousedown', this._handlers._clickHorizontalTrackHandler);

  this._dom.vthumb.removeEventListener('mousedown', this._handlers._clickVerticalThumbHandler);
  this._dom.hthumb.removeEventListener('mousedown', this._handlers._clickHorizontalThumbHandler);

  this._dom.doc.removeEventListener('mouseup', this._handlers._mouseUpDocumentHandler);
  this._dom.doc.removeEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);

  return this;
};

/* @private */
GeminiScrollbar.prototype._scrollHandler = function _scrollHandler () {
  var viewElement = this._dom.view;
  var y = ((viewElement.scrollTop * 100) / viewElement.clientHeight);
  var x = ((viewElement.scrollLeft * 100) / viewElement.clientWidth);

  // utils.transformX(this._dom.hthumb, x);
  // utils.transformY(this._dom.vthumb, y);
  this._dom.hthumb.style.transform = "translate3d(" + x + "%,0,0)";
  this._dom.vthumb.style.transform = "translate3d(0," + y + "%,0)";
};

/* @private */
GeminiScrollbar.prototype._resizeHandler = function _resizeHandler () {
  this.update();
  if (typeof this.opts.onResize === 'function') { this.opts.onResize(); }
};

/* @private */
GeminiScrollbar.prototype._clickVerticalTrackHandler = function _clickVerticalTrackHandler (e) {
  var offset = Math.abs(e.target.getBoundingClientRect().top - e.clientY);
  var thumbHalf = (this._dom.vthumb.offsetHeight / 2);
  var thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._dom.vscrollbar.offsetHeight);
  this._dom.view.scrollTop = (thumbPositionPercentage * this._dom.view.scrollHeight / 100);
};

/* @private */
GeminiScrollbar.prototype._clickHorizontalTrackHandler = function _clickHorizontalTrackHandler (e) {
  var offset = Math.abs(e.target.getBoundingClientRect().left - e.clientX);
  var thumbHalf = (this._dom.hthumb.offsetWidth / 2);
  var thumbPositionPercentage = ((offset - thumbHalf) * 100 / this._dom.hscrollbar.offsetWidth);
  this._dom.view.scrollLeft = (thumbPositionPercentage * this._dom.view.scrollWidth / 100);
};

/* @private */
GeminiScrollbar.prototype._clickVerticalThumbHandler = function _clickVerticalThumbHandler (e) {
  this._startDrag(e);
  this._prevPageY = (e.currentTarget.offsetHeight - (e.clientY - e.currentTarget.getBoundingClientRect().top));
};

/* @private */
GeminiScrollbar.prototype._clickHorizontalThumbHandler = function _clickHorizontalThumbHandler (e) {
  this._startDrag(e);
  this._prevPageX = (e.currentTarget.offsetWidth - (e.clientX - e.currentTarget.getBoundingClientRect().left));
};

/* @private */
GeminiScrollbar.prototype._startDrag = function _startDrag (e) {
  e.stopImmediatePropagation();
  this._cursorDown = true;
  addClass(this._dom.body, [CLASSNAMES.disable]);
  this._dom.doc.addEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);
  this._dom.doc.onselectstart = function() {return false;};
};

/* @private */
GeminiScrollbar.prototype._mouseUpDocumentHandler = function _mouseUpDocumentHandler () {
  this._cursorDown = false;
  this._prevPageX = this._prevPageY = 0;
  removeClass(this._dom.body, [CLASSNAMES.disable]);
  this._dom.doc.removeEventListener('mousemove', this._handlers._mouseMoveDocumentHandler);
  this._dom.doc.onselectstart = null;
};

/* @private */
GeminiScrollbar.prototype._mouseMoveDocumentHandler = function _mouseMoveDocumentHandler (e) {
  if (this._cursorDown === false) { return void 0; }

  var offset, thumbClickPosition, thumbPositionPercentage;
  if (this._prevPageY) {
    offset = ((this._dom.vscrollbar.getBoundingClientRect().top - e.clientY) * -1);
    thumbClickPosition = (this._dom.vthumb.offsetHeight - this._prevPageY);
    thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._dom.vscrollbar.offsetHeight);
    this._dom.view.scrollTop = (thumbPositionPercentage * this._dom.view.scrollHeight / 100);
  } else if (this._prevPageX) {
    offset = ((this._dom.hscrollbar.getBoundingClientRect().left - e.clientX) * -1);
    thumbClickPosition = (this._dom.hthumb.offsetWidth - this._prevPageX);
    thumbPositionPercentage = ((offset - thumbClickPosition) * 100 / this._dom.hscrollbar.offsetWidth);
    this._dom.view.scrollLeft = (thumbPositionPercentage * this._dom.view.scrollWidth / 100);
  }

  offset = thumbClickPosition = thumbPositionPercentage = null;

  return void 0;
};

Object.defineProperties( GeminiScrollbar.prototype, prototypeAccessors );

return GeminiScrollbar;

})));
