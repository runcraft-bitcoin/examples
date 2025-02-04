var Run =
/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};
/******/
/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {
/******/
/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId]) {
/******/ 			return installedModules[moduleId].exports;
/******/ 		}
/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			i: moduleId,
/******/ 			l: false,
/******/ 			exports: {}
/******/ 		};
/******/
/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);
/******/
/******/ 		// Flag the module as loaded
/******/ 		module.l = true;
/******/
/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}
/******/
/******/
/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;
/******/
/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;
/******/
/******/ 	// define getter function for harmony exports
/******/ 	__webpack_require__.d = function(exports, name, getter) {
/******/ 		if(!__webpack_require__.o(exports, name)) {
/******/ 			Object.defineProperty(exports, name, { enumerable: true, get: getter });
/******/ 		}
/******/ 	};
/******/
/******/ 	// define __esModule on exports
/******/ 	__webpack_require__.r = function(exports) {
/******/ 		if(typeof Symbol !== 'undefined' && Symbol.toStringTag) {
/******/ 			Object.defineProperty(exports, Symbol.toStringTag, { value: 'Module' });
/******/ 		}
/******/ 		Object.defineProperty(exports, '__esModule', { value: true });
/******/ 	};
/******/
/******/ 	// create a fake namespace object
/******/ 	// mode & 1: value is a module id, require it
/******/ 	// mode & 2: merge all properties of value into the ns
/******/ 	// mode & 4: return value when already ns object
/******/ 	// mode & 8|1: behave like require
/******/ 	__webpack_require__.t = function(value, mode) {
/******/ 		if(mode & 1) value = __webpack_require__(value);
/******/ 		if(mode & 8) return value;
/******/ 		if((mode & 4) && typeof value === 'object' && value && value.__esModule) return value;
/******/ 		var ns = Object.create(null);
/******/ 		__webpack_require__.r(ns);
/******/ 		Object.defineProperty(ns, 'default', { enumerable: true, value: value });
/******/ 		if(mode & 2 && typeof value != 'string') for(var key in value) __webpack_require__.d(ns, key, function(key) { return value[key]; }.bind(null, key));
/******/ 		return ns;
/******/ 	};
/******/
/******/ 	// getDefaultExport function for compatibility with non-harmony modules
/******/ 	__webpack_require__.n = function(module) {
/******/ 		var getter = module && module.__esModule ?
/******/ 			function getDefault() { return module['default']; } :
/******/ 			function getModuleExports() { return module; };
/******/ 		__webpack_require__.d(getter, 'a', getter);
/******/ 		return getter;
/******/ 	};
/******/
/******/ 	// Object.prototype.hasOwnProperty.call
/******/ 	__webpack_require__.o = function(object, property) { return Object.prototype.hasOwnProperty.call(object, property); };
/******/
/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "";
/******/
/******/
/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(__webpack_require__.s = 60);
/******/ })
/************************************************************************/
/******/ ([
/* 0 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * misc.js
 *
 * Various helper methods
 */

const { InternalError, TimeoutError } = __webpack_require__(11)
const { _sudo } = __webpack_require__(4)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// Creations are only creations if they are in these weak sets.
// This gives us control over what is and isn't a creation.
const _JIGS = new WeakSet()
const _CODE = new WeakSet() // Jig code and sidekick code
const _BERRIES = new WeakSet()

// ------------------------------------------------------------------------------------------------
// _RESERVED
// ------------------------------------------------------------------------------------------------

// Some methods like auth and destroy are safe to call inside other methods. Therefore, they
// are not reserved. Other methods are not safe in this way. Below are reserved words.

// Not sure exactly how these will be used yet, so setting aside for later
const _RESERVED_PROPS = [
  // Future bindings
  'encryption',
  'blockhash',
  'blocktime',
  'blockheight',

  // Time methods
  'latest',
  'recent',
  'mustBeLatest',
  'mustBeRecent',
  'checkForUpdates',

  // Control methods
  'recover',
  'replicate',
  'makeBackup',
  'restricts',
  'delegate',
  'consume',
  'eject',
  'armored',
  'armoured'
]

const _RESERVED_CODE_PROPS = [
  'toString', // interfers with source code generation
  'upgrade', // upgrade is only supported as a top-level action right now
  'sync', // sync only works externally and as a top-level command
  'destroy', // eventually destroy should not be reserved
  'auth', // eventually auth should not be reserved
  'load', // load is used on jigs and berries and not currently supported on sidekick code
  'init' // Will be used for static initializers in the future
]

const _RESERVED_JIG_PROPS = [
  'sync', // sync only works externally and as a top-level command
  'interactive'
]

// Currently there are no reserved berry instance methods
const _RESERVED_BERRY_PROPS = [
  'interactive'
]

// Final properties are properties which cannot be set/deleted/changed in any way
const _FINAL_CODE_PROPS = [..._RESERVED_CODE_PROPS, 'deps']
const _FINAL_JIG_PROPS = [..._RESERVED_JIG_PROPS, 'init'] // destroy and auth are not protected
const _FINAL_BERRY_PROPS = [..._RESERVED_BERRY_PROPS, 'init']

// ------------------------------------------------------------------------------------------------
// _kernel
// ------------------------------------------------------------------------------------------------

/**
 * Returns the active kernel
 */
function _activeKernel () {
  const Kernel = __webpack_require__(43)
  if (!Kernel._instance) throw new Error('Run instance not active')
  return Kernel._instance
}

// ------------------------------------------------------------------------------------------------
// _assert
// ------------------------------------------------------------------------------------------------

/**
 * Internal assertion that is expected to be true.
 */
function _assert (condition, msg) {
  if (!condition) throw new InternalError(msg || 'assert failed')
}

// ------------------------------------------------------------------------------------------------
// _bsvNetwork
// ------------------------------------------------------------------------------------------------

/**
 * Gets a bsv library network string from a Run network string
 *
 * All networks that start with 'main' are considered mainnet. Everything else is testnet. This
 * lets us have potentially many "testnet" networks - ie. stn, mock, dev - that are clearly
 * distinct from mainnets. There might be multiple "mainnet" networks too if we have a hybrid
 * on-chain and off-chain system such as Overpool, which could be, for example, 'main-overpool'.
 * @param {string} network Run network string
 */
function _bsvNetwork (network) {
  return network.startsWith('main') ? 'mainnet' : 'testnet'
}

// ------------------------------------------------------------------------------------------------
// _parent
// ------------------------------------------------------------------------------------------------

/**
 * Gets the parent class of T, or undefined if none exists
 */
function _parent (T) {
  if (typeof T !== 'function') return
  const Sandbox = __webpack_require__(6)
  const Code = __webpack_require__(1)
  const SO = Sandbox._intrinsics.Object
  const HO = Sandbox._hostIntrinsics.Object
  const P = Object.getPrototypeOf(T)
  const hasParent = P !== HO.getPrototypeOf(HO) && P !== SO.getPrototypeOf(SO) &&
    P !== Code.prototype
  if (hasParent) return P
}

// ------------------------------------------------------------------------------------------------
// _parentName
// ------------------------------------------------------------------------------------------------

/**
 * Gets the parent class name out of the source code, or null if there is no parent
 */
function _parentName (src) {
  const parentRegex = /^\s*class\s+[a-zA-Z0-9_$]+\s+extends\s+([a-zA-Z0-9_$]+)\s*{/
  const parentMatch = src.match(parentRegex)
  return parentMatch && parentMatch[1]
}

// ------------------------------------------------------------------------------------------------
// _extendsFrom
// ------------------------------------------------------------------------------------------------

/**
 * Returns whether A extends from B somewhere in its class chain
 */
function _extendsFrom (A, B) {
  while (A) {
    A = Object.getPrototypeOf(A)
    if (A === B) return true
  }
  return false
}

// ------------------------------------------------------------------------------------------------
// _text
// ------------------------------------------------------------------------------------------------

/*
 * Converts any value into a short string form usable in error messages and logs.
 * @param {*} x Value to stringify
 */
function _text (x) {
  return _sudo(() => {
    switch (typeof x) {
      case 'string': return `"${x.length > 20 ? x.slice(0, 20) + '…' : x}"`

      case 'object': {
        if (!x) return 'null'
        if (!x.constructor.name) return '[anonymous object]'
        const Jig = __webpack_require__(7)
        const Berry = __webpack_require__(13)
        const kind = x instanceof Jig ? 'jig' : x instanceof Berry ? 'berry' : 'object'
        return `[${kind} ${x.constructor.name}]`
      }

      case 'function': {
        let src = null
        const Code = __webpack_require__(1)
        if (x instanceof Code) {
          src = Code.prototype.toString.apply(x)
        } else {
          const safeToString = typeof x.toString === 'function' && !x.toString.toString().startsWith('class')
          src = safeToString ? x.toString() : Function.prototype.toString.apply(x)
        }

        const isAnonymousFunction =
          /^\(/.test(src) || // () => {}
          /^function\s*\(/.test(src) || // function() {}
          /^[a-zA-Z0-9_$]+\s*=>/.test(src) // x => x

        if (isAnonymousFunction) return '[anonymous function]'
        const isAnonymousClass = /^class\s*{/.test(src)
        if (isAnonymousClass) return '[anonymous class]'

        return x.name
      }

      case 'undefined': return 'undefined'

      default: return x.toString()
    }
  })
}

// ------------------------------------------------------------------------------------------------
// Type detection
// ------------------------------------------------------------------------------------------------

function _basicObject (x) {
  return typeof x === 'object' && !!x && _protoLen(x) === 2
}

// ------------------------------------------------------------------------------------------------

function _basicArray (x) {
  return Array.isArray(x) && _protoLen(x) === 3
}

// ------------------------------------------------------------------------------------------------

function _basicSet (x) {
  const Sandbox = __webpack_require__(6)
  const SI = Sandbox._intrinsics
  const HI = Sandbox._hostIntrinsics
  return (x instanceof HI.Set || x instanceof SI.Set) && _protoLen(x) === 3
}

// ------------------------------------------------------------------------------------------------

function _basicMap (x) {
  const Sandbox = __webpack_require__(6)
  const SI = Sandbox._intrinsics
  const HI = Sandbox._hostIntrinsics
  return (x instanceof HI.Map || x instanceof SI.Map) && _protoLen(x) === 3
}

// ------------------------------------------------------------------------------------------------

function _basicUint8Array (x) {
  const Sandbox = __webpack_require__(6)
  const SI = Sandbox._intrinsics
  const HI = Sandbox._hostIntrinsics
  return (x instanceof HI.Uint8Array || x instanceof SI.Uint8Array) && _protoLen(x) === 4
}

// ------------------------------------------------------------------------------------------------

function _arbitraryObject (x) {
  if (typeof x !== 'object' || !x) return false
  const Code = __webpack_require__(1)
  if (!(x.constructor instanceof Code)) return false
  const Jig = __webpack_require__(7)
  if (x instanceof Jig) return false
  const Berry = __webpack_require__(13)
  if (x instanceof Berry) return false
  return true
}

// ------------------------------------------------------------------------------------------------

function _defined (x) {
  return typeof x !== 'undefined'
}

// ------------------------------------------------------------------------------------------------

function _negativeZero (x) {
  // Object.is(x, -0) is not reliable on Firefox
  return x === 0 && 1 / x === -Infinity
}

// ------------------------------------------------------------------------------------------------

function _intrinsic (x) {
  const Sandbox = __webpack_require__(6)
  if (Sandbox._hostIntrinsicSet.has(x)) return true
  if (Sandbox._intrinsicSet.has(x)) return true
  return false
}

// ------------------------------------------------------------------------------------------------

function _serializable (x) {
  const { _deepVisit } = __webpack_require__(14)
  let serializable = true
  try {
    _sudo(() => _deepVisit(x, x => { serializable = serializable && _serializableValue(x) }))
  } catch (e) { }
  return serializable
}

// ------------------------------------------------------------------------------------------------

function _serializableValue (x) {
  if (typeof x === 'undefined') return true
  if (typeof x === 'boolean') return true
  if (typeof x === 'number') return true
  if (typeof x === 'string') return true
  if (x === null) return true
  if (_intrinsic(x)) return false
  if (_basicObject(x)) return true
  if (_basicArray(x)) return true
  if (_basicSet(x)) return true
  if (_basicMap(x)) return true
  if (_basicUint8Array(x)) return true
  if (_arbitraryObject(x)) return true
  const Creation = __webpack_require__(3)
  if (x instanceof Creation) return true
  return false // Symbols, intrinsic, non-code functions, and extended intrinsics
}

// ------------------------------------------------------------------------------------------------

const ANON_CLASS_REGEX = /^class\s*{/
const ANON_CLASS_EXTENDS_REGEX = /^class\s+(extends)?\s+\S+\s*{/
const ANON_FUNCTION_REGEX = /^function\s*\(/

function _anonymous (x) {
  if (typeof x !== 'function') return false
  if (!x.name) return true
  const s = x.toString()
  if (!s.startsWith('class') && !s.startsWith('function')) return true
  return ANON_CLASS_REGEX.test(s) || ANON_CLASS_EXTENDS_REGEX.test(s) || ANON_FUNCTION_REGEX.test(s)
}

// ------------------------------------------------------------------------------------------------

/**
 * Gets the length of the prototype chain
 */
function _protoLen (x) {
  if (!x) return 0
  let n = 0
  do {
    n++
    x = Object.getPrototypeOf(x)
  } while (x)
  return n
}

// ------------------------------------------------------------------------------------------------
// _getOwnProperty
// ------------------------------------------------------------------------------------------------

function _getOwnProperty (x, name) {
  if (!x || (typeof x !== 'function' && typeof x !== 'object')) return undefined
  const desc = Object.getOwnPropertyDescriptor(x, name)
  return desc && desc.value
}

// ------------------------------------------------------------------------------------------------
// _hasOwnProperty
// ------------------------------------------------------------------------------------------------

function _hasOwnProperty (x, name) {
  if (!x || (typeof x !== 'function' && typeof x !== 'object')) return false
  if (typeof name === 'string') return Object.getOwnPropertyNames(x).includes(name)
  if (typeof name === 'symbol') return Object.getOwnPropertySymbols(x).includes(name)
}

// ------------------------------------------------------------------------------------------------
// _setOwnProperty
// ------------------------------------------------------------------------------------------------

function _setOwnProperty (x, name, value) {
  let desc = Object.getOwnPropertyDescriptor(x, name)
  if (!desc || desc.get || desc.set) desc = { configurable: true, enumerable: true, writable: true }
  desc.value = value
  const { _deterministicDefineProperty } = __webpack_require__(17)
  _deterministicDefineProperty(x, name, desc)
}

// ------------------------------------------------------------------------------------------------
// _defineGetter
// ------------------------------------------------------------------------------------------------

function _defineGetter (target, name, getter) {
  Object.defineProperty(target, name, {
    get: getter,
    configurable: true,
    enumerable: true
  })
}

// ------------------------------------------------------------------------------------------------
// _ownGetters
// ------------------------------------------------------------------------------------------------

function _ownGetters (x) {
  return Object.getOwnPropertyNames(x)
    .concat(Object.getOwnPropertySymbols(x))
    .filter(prop => Object.getOwnPropertyDescriptor(x, prop).get)
}

// ------------------------------------------------------------------------------------------------
// _ownMethods
// ------------------------------------------------------------------------------------------------

function _ownMethods (x) {
  return Object.getOwnPropertyNames(x)
    .concat(Object.getOwnPropertySymbols(x))
    .filter(prop => prop !== 'constructor')
    .filter(prop => typeof Object.getOwnPropertyDescriptor(x, prop).value === 'function')
}

// ------------------------------------------------------------------------------------------------
// _limit
// ------------------------------------------------------------------------------------------------

function _limit (limit, name = 'limit') {
  if (limit === null) return Number.MAX_VALUE
  if (limit === -1) return Number.MAX_VALUE
  if (limit === Infinity) return Number.MAX_VALUE
  if (typeof limit !== 'number' || limit < 0) throw new Error(`Invalid ${name}: ${_text(limit)}`)
  return limit
}

// -------------------------------------------------------------------------------------------------
// _Timeout
// ------------------------------------------------------------------------------------------------

// A object that can track an operation's duration across multiple methods.
// _check() should be called periodically after every long-running or async operation.
class _Timeout {
  constructor (method, timeout, data) {
    this._start = new Date()
    this._method = method
    this._timeout = timeout
    this._data = data
  }

  _check () {
    if (new Date() - this._start > _limit(this._timeout, 'timeout')) {
      const data = this._data ? ` (${this._data})` : ''
      throw new TimeoutError(`${this._method} timeout${data})`)
    }
  }
}

// ------------------------------------------------------------------------------------------------
// _filterInPlace
// ------------------------------------------------------------------------------------------------

function _filterInPlace (arr, f) {
  let len = 0
  arr.forEach((x, n) => { if (f(x, n, arr)) arr[len++] = x })
  arr.length = len
  return arr
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _JIGS,
  _CODE,
  _BERRIES,
  _RESERVED_PROPS,
  _RESERVED_CODE_PROPS,
  _RESERVED_JIG_PROPS,
  _RESERVED_BERRY_PROPS,
  _FINAL_CODE_PROPS,
  _FINAL_JIG_PROPS,
  _FINAL_BERRY_PROPS,
  _activeKernel,
  _assert,
  _bsvNetwork,
  _parent,
  _parentName,
  _extendsFrom,
  _text,
  _basicObject,
  _basicArray,
  _basicSet,
  _basicMap,
  _basicUint8Array,
  _arbitraryObject,
  _defined,
  _negativeZero,
  _intrinsic,
  _serializable,
  _serializableValue,
  _anonymous,
  _protoLen,
  _getOwnProperty,
  _hasOwnProperty,
  _setOwnProperty,
  _defineGetter,
  _ownGetters,
  _ownMethods,
  _limit,
  _Timeout,
  _filterInPlace
}


/***/ }),
/* 1 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * code.js
 *
 * User-facing Code object that can also be referenced in jigs
 */

// ------------------------------------------------------------------------------------------------
// CodeDeps
// ------------------------------------------------------------------------------------------------

class CodeDeps {
  static get _Action () { return __webpack_require__(21) }
  static get _Editor () { return __webpack_require__(9) }
  static get _Log () { return __webpack_require__(2) }
  static get _misc () { return __webpack_require__(0) }
  static get _Record () { return __webpack_require__(10) }
  static get _sudo () { return __webpack_require__(4)._sudo }
  static get _sync () { return __webpack_require__(53) }
  static get _TAG () { return 'Code' }
  static get _Transaction () { return __webpack_require__(27) }
}

// ------------------------------------------------------------------------------------------------
// NativeCode
// ------------------------------------------------------------------------------------------------

/**
 * Code is to a code jig as Function is to a standard class
 *
 * Unlike Function, Code instances will not extend from this prototype but their methods will
 * be made available via the membrane and instanceof checks will pass.
 */
class Code {
  constructor () {
    throw new Error('Cannot instantiate Code')
  }

  // --------------------------------------------------------------------------

  /**
   * Gets the source code
   */
  toString () {
    const Editor = CodeDeps._Editor
    const _sudo = CodeDeps._sudo
    const { _assert } = CodeDeps._misc

    // Non-code children have their source code calculated intact
    const editor = Editor._get(this)
    if (!editor) return _sudo(() => this.toString())

    // Get the source code
    const D = editor._D
    const src = editor._src
    _assert(src)

    // If non-native, return the source code directly
    if (!editor._native) return src

    // Otherwise, modify the source code to be clearly native code
    if (src.startsWith('class')) {
      return `class ${D.name} { [native code] }`
    } else {
      return `function ${D.name}() { [native code] }`
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Updates the code to its latest state
   *
   * @param {?object} options
   * @param {boolean} options.forward Whether to forward sync or just wait for pending updates. Default true.
   * @param {boolean} options.inner Whether to forward sync inner jigs if forward syncing. Default true.
   */
  sync (options = {}) {
    const Editor = CodeDeps._Editor
    const Log = CodeDeps._Log
    const _sync = CodeDeps._sync
    const TAG = CodeDeps._TAG
    const { _text } = CodeDeps._misc
    const Transaction = CodeDeps._Transaction
    const Record = CodeDeps._Record
    const CURRENT_RECORD = Record._CURRENT_RECORD

    if (Log._debugOn) Log._debug(TAG, 'Sync', _text(this))

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('sync disabled during atomic update')

    // sync only available outside the jig
    if (CURRENT_RECORD._stack.length) throw new Error('sync cannot be called internally')

    // Can't sync a non-code child class
    const editor = Editor._get(this)
    if (!editor) throw new Error('sync unavailable')

    // Nothing to sync if native. Not an error.
    if (editor._native) return

    // Sync it. Return self for chaining
    return _sync(this, options).then(() => this)
  }

  // --------------------------------------------------------------------------

  upgrade (T) {
    const Editor = CodeDeps._Editor
    Editor._upgradeCode(this, T)

    // Return self for chaining
    return this
  }

  // --------------------------------------------------------------------------

  auth () {
    const Action = CodeDeps._Action
    const Editor = CodeDeps._Editor
    const { _text } = CodeDeps._misc
    const Record = CodeDeps._Record
    const Log = CodeDeps._Log
    const TAG = CodeDeps._TAG

    if (Log._debugOn) Log._debug(TAG, 'Auth', _text(this))

    // Non-jig child classes and native code cannot be signed. Errors.
    const editor = Editor._get(this)
    if (!editor) throw new Error('auth unavailable on non-jigs')
    if (editor._native) throw new Error('auth unavailable on native jigs')

    // We cannot auth code just created because there is no input
    if (Record._CURRENT_RECORD._creates._has(this)) throw new Error('auth unavailable on new jigs')

    // Record an auth action
    Action._auth(this)

    // Return self for chaining
    return this
  }

  // --------------------------------------------------------------------------

  destroy () {
    const Action = CodeDeps._Action
    const Editor = CodeDeps._Editor
    const Log = CodeDeps._Log
    const { _text } = CodeDeps._misc
    const TAG = CodeDeps._TAG

    if (Log._debugOn) Log._debug(TAG, 'Destroy', _text(this))

    // Non-jig child classes and native code cannot be destroyed. Errors.
    const editor = Editor._get(this)
    if (!editor || editor._native) throw new Error('destroy unavailable')

    // Record a destroy action
    Action._destroy(this)

    // Return self for chaining
    return this
  }

  // --------------------------------------------------------------------------

  [Symbol.hasInstance] (x) {
    const Editor = CodeDeps._Editor
    const _sudo = CodeDeps._sudo

    // If x is not an object, then nothing to check
    if (typeof x !== 'object' || !x) return false

    // Get the sandboxed version of the class
    const C = Editor._lookupCodeByType(this)

    // If didn't find this code, then it couldn't be an instance.
    if (!C) return false

    // Check if this class's prototype is in the prototype chain of the instance
    // We only check origins, not locations, because (1) locations change frequently
    // for certain class jigs, and to users syncing would be annoying, and (2) inside
    // jig code there will only ever be one location for a jig class at a time.
    return _sudo(() => {
      let type = Object.getPrototypeOf(x)
      while (type) {
        if (type.constructor.origin && type.constructor.origin === C.origin) return true
        type = Object.getPrototypeOf(type)
      }

      return false
    })
  }

  // --------------------------------------------------------------------------

  static [Symbol.hasInstance] (x) {
    return CodeDeps._misc._CODE.has(x)
  }
}

Code.deps = { CodeDeps }
Code.sealed = true

// ------------------------------------------------------------------------------------------------

Code.toString() // Preserves the class name during compilation

const NativeCode = CodeDeps._Editor._createCode()
const editor = CodeDeps._Editor._get(NativeCode)
const internal = false
editor._installNative(Code, internal)

// ------------------------------------------------------------------------------------------------

module.exports = NativeCode


/***/ }),
/* 2 */
/***/ (function(module, exports) {

/**
 * log.js
 *
 * The logger used throughout Run. It wraps another logger to add date and tag information,
 * and also provides a consistent API when different loggers don't implement all methods.
 *
 * Setup:
 *
 *    Assign Log._logger to an object with any of info(), warn(), error(), or debug() methods.
 *
 *    Log._logger = console
 *
 * Usage:
 *
 *    if (Log._infoOn) Log._info(TAG, 'arg1', 'arg2')
 *
 *    We recommend checking the "on" booleans first to avoid unnecessary string serialization.
 *
 *    TAG is typically the filename or class where the log is ocurring.
 */

// ------------------------------------------------------------------------------------------------
// Log
// ------------------------------------------------------------------------------------------------

const Log = {
  // The log sink where all messages are forwarded to
  _logger: null,

  // The key functions used to log
  _info (...args) { this._log('info', ...args) },
  _warn (...args) { this._log('warn', ...args) },
  _error (...args) { this._log('error', ...args) },
  _debug (...args) { this._log('debug', ...args) },

  // Boolean checkers for whether the log will actually occur
  get _infoOn () { return !!this._logger && !!this._logger.info && typeof this._logger.info === 'function' },
  get _warnOn () { return !!this._logger && !!this._logger.warn && typeof this._logger.warn === 'function' },
  get _errorOn () { return !!this._logger && !!this._logger.error && typeof this._logger.error === 'function' },
  get _debugOn () { return !!this._logger && !!this._logger.debug && typeof this._logger.debug === 'function' },

  // Interal log function
  _log (method, tag, ...args) {
    if (!this._logger || !this._logger[method] || typeof this._logger[method] !== 'function') return

    this._logger[method](new Date().toISOString(), method.toUpperCase(), `[${tag}]`, ...args)
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Log


/***/ }),
/* 3 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * creation.js
 *
 * Common base for jigs, sidekicks, and berries
 */

// ------------------------------------------------------------------------------------------------
// CreationDeps
// ------------------------------------------------------------------------------------------------

class CreationDeps {
  static get _Editor () { return __webpack_require__(9) }
  static get _misc () { return __webpack_require__(0) }
}

// ------------------------------------------------------------------------------------------------
// Creation
// ------------------------------------------------------------------------------------------------

/**
 * A JavaScript asset that can be loaded by Run. There are three kinds:
 *
 *      - Jigs (code and objects)
 *      - Sidekicks (code)
 *      - Berries (objects)
 *
 * All creations have bindings - location, origin, nonce, owner, and satoshis. These bindings may
 * or may not all be used, but they are required. The location, origin, and nonce are the
 * "Location Bindings". The owner and satoshis are the "UTXO Bindings". When a creation does not
 * have a UTXO, whether because of it being destroyed, or because it is a berry and never had one,
 * owner should be null and satoshis should be 0.
 *
 * Creations can be referenced by other creations. They have membranes that track their actions
 * and enforce their rules.
 */
class Creation {
  static [Symbol.hasInstance] (x) {
    const { _JIGS, _CODE, _BERRIES } = CreationDeps._misc
    if (_JIGS.has(x)) return true
    if (_CODE.has(x)) return true
    if (_BERRIES.has(x)) return true
    return false
  }
}

Creation.deps = { CreationDeps }
Creation.sealed = true

// ------------------------------------------------------------------------------------------------

Creation.toString() // Preserves the class name during compilation

const NativeCreation = CreationDeps._Editor._createCode()
const editor = CreationDeps._Editor._get(NativeCreation)
const internal = false
editor._installNative(Creation, internal)

module.exports = NativeCreation


/***/ }),
/* 4 */
/***/ (function(module, exports) {

/**
 * admin.js
 *
 * Enables and checks for admin mode
 */

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

let ADMIN = false

// ------------------------------------------------------------------------------------------------
// _sudo
// ------------------------------------------------------------------------------------------------

/**
 * Enables admin mode for the duration of f.
 *
 * Many internal objects, including jigs, code, and code prototypes, are proxies to the external
 * users. This enables Run to enforce restrictions on the user, such as preventing certain
 * functions from being called. However internally we often need to bypass such restrictions.
 * _sudo() and _admin() are the two methods to achieve this.
 */
function _sudo (f) {
  const prevAdmin = ADMIN
  try {
    ADMIN = true
    return f()
  } finally {
    ADMIN = prevAdmin
  }
}

// ------------------------------------------------------------------------------------------------
// _admin
// ------------------------------------------------------------------------------------------------

function _admin () {
  return ADMIN
}

// ------------------------------------------------------------------------------------------------

module.exports = { _sudo, _admin }


/***/ }),
/* 5 */
/***/ (function(module, exports) {

module.exports = bsv;

/***/ }),
/* 6 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process, global) {/**
 * sandbox.js
 *
 * The universal code sandbox used within Run.
 *
 * All third-party code that Run loads uses this sandbox. The Sandbox class is a singleton. We
 * use a single sandbox so that even if we load objects from multiple Run instances, they all
 * come from the same "realm" and share the same intrinsics. This is important! Because any
 * internal Run logic that depends on the intrinsics (ie. "instanceof Uint8Array") can now
 * assume the intrinsics will all come from the same realm. Anything else would be a nightmare.
 */

const DeterministicRealm = __webpack_require__(49)
const { _defineGetter } = __webpack_require__(0)
const Source = __webpack_require__(24)
const Log = __webpack_require__(2)

// ------------------------------------------------------------------------------------------------
// Sandbox
// ------------------------------------------------------------------------------------------------

const TAG = 'Sandbox'

/**
 * The universal code sandbox
 */
class Sandbox {
  constructor () {
    this._cover = []

    if (Log._debugOn) Log._debug(TAG, 'Creating deterministic realm')

    this._realm = new DeterministicRealm()
    this._sandboxes = new WeakSet()

    // Keep track of common intrinsics shared between realms. The SES realm creates
    // these, and we just evaluate a list of them and store them here.
    const compartment = this._realm.makeCompartment()
    this._intrinsics = compartment.evaluate(_getIntrinsicsSrc)
    this._hostIntrinsics = eval(_getIntrinsicsSrc) // eslint-disable-line

    this._intrinsicSet = new Set(Object.entries(this._intrinsics).map(([x, y]) => y))
    this._hostIntrinsicSet = new Set(Object.entries(this._hostIntrinsics).map(([x, y]) => y))
  }

  _sandboxType (T, env, native = false, anonymize = false) {
    let originalSource = T.toString()

    // If we're in cover, we have to specially handle our evals
    const cover = process.env.COVER && (native || this._cover.includes(T.name))
    if (cover) {
      const sandboxed = this._sandboxes.has(T)

      // If we're in the global realm, just leave intact so we collect coverage
      if (!sandboxed) {
        const globalThis = typeof global !== 'undefined' ? global : window
        return [T, globalThis]
      }

      // Strip coverage from the source code
      originalSource = Source._uncover(originalSource)
    }

    // Create the source code
    const src = Source._sandbox(originalSource, T)
    const src2 = anonymize ? Source._anonymize(src) : src

    // Evaluate the source code
    return this._evaluate(src2, env)
  }

  _evaluate (src, env = {}) {
    const compartment = this._realm.makeCompartment()

    Object.assign(compartment.global, this._intrinsics, env)

    // When a function is anonymous, it will be named the variable it is assigned. We give it
    // a friendly anonymous name to distinguish it from named classes and functions.
    const anon = src.startsWith('class') ? 'AnonymousClass' : 'anonymousFunction'
    const script = `const ${anon}=${src};${anon}`

    // Show a nice error when we try to access Date and Math

    if (!('Math' in env)) {
      _defineGetter(compartment.global, 'Math', () => {
        const hint = 'Hint: Math is disabled because it is non-deterministic.'
        throw new ReferenceError(`Math is not defined\n\n${hint}`)
      })
    }

    if (!('Date' in env)) {
      _defineGetter(compartment.global, 'Date', () => {
        const hint = 'Hint: Date is disabled because it is non-deterministic.'
        throw new ReferenceError(`Date is not defined\n\n${hint}`)
      })
    }

    const result = compartment.evaluate(script)

    if (typeof result === 'function') this._sandboxes.add(result)

    return [result, compartment.global]
  }
}

// ------------------------------------------------------------------------------------------------
// Intrinsics
// ------------------------------------------------------------------------------------------------

// See: https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects
const _intrinsicNames = [
  // Global functions
  'console', 'eval', 'isFinite', 'isNaN', 'parseFloat', 'parseInt', 'decodeURI',
  'decodeURIComponent', 'encodeURI', 'encodeURIComponent', 'escape',
  // Fundamental objects
  'Object', 'Function', 'Boolean', 'Symbol', 'Error', 'EvalError', 'RangeError',
  'ReferenceError', 'SyntaxError', 'TypeError', 'URIError',
  // Numbers and dates
  'Number', 'BigInt', 'Math', 'Date',
  // Text processing
  'String', 'RegExp',
  // Indexed collections
  'Array', 'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array', 'Uint16Array',
  'Int32Array', 'Uint32Array', 'Float32Array', 'Float64Array', 'BigInt64Array',
  'BigUint64Array',
  // Keyed collections
  'Map', 'Set', 'WeakMap', 'WeakSet',
  // Structured data
  'ArrayBuffer', 'DataView', 'JSON',
  // Control abstraction objects
  'Promise', 'Generator', 'GeneratorFunction', 'AsyncFunction',
  // Reflection
  'Reflect', 'Proxy',
  // Internationalization
  'Intl',
  // WebAssembly
  'WebAssembly'
]

let _getIntrinsicsSrc = 'const x = {}\n'
_intrinsicNames.forEach(name => {
  _getIntrinsicsSrc += `x.${name} = typeof ${name} !== 'undefined' ? ${name} : undefined\n`
})
_getIntrinsicsSrc += 'x'

// ------------------------------------------------------------------------------------------------

module.exports = new Sandbox()

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30), __webpack_require__(42)))

/***/ }),
/* 7 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * jig.js
 *
 * Jig class users extend from to create digital property
 */

// ------------------------------------------------------------------------------------------------
// JigDeps
// ------------------------------------------------------------------------------------------------

class JigDeps {
  static get _Action () { return __webpack_require__(21) }
  static get _Bindings () { return __webpack_require__(8) }
  static get _Code () { return __webpack_require__(1) }
  static get _deep () { return __webpack_require__(14) }
  static get _Editor () { return __webpack_require__(9) }
  static get _load () { return __webpack_require__(16) }
  static get _Log () { return __webpack_require__(2) }
  static get _Membrane () { return __webpack_require__(19) }
  static get _misc () { return __webpack_require__(0) }
  static get _NativeJig () { return __webpack_require__(7) }
  static get _Record () { return __webpack_require__(10) }
  static get _Rules () { return __webpack_require__(22) }
  static get _Sandbox () { return __webpack_require__(6) }
  static get _sudo () { return __webpack_require__(4)._sudo }
  static get _sync () { return __webpack_require__(53) }
  static get _Transaction () { return __webpack_require__(27) }
  static get _TAG () { return 'Jig' }
}

// ------------------------------------------------------------------------------------------------
// Jig
// ------------------------------------------------------------------------------------------------

class Jig {
  constructor (...args) {
    const Action = JigDeps._Action
    const Bindings = JigDeps._Bindings
    const Code = JigDeps._Code
    const Editor = JigDeps._Editor
    const deepClone = JigDeps._deep._deepClone
    const JIGS = JigDeps._misc._JIGS
    const Membrane = JigDeps._Membrane
    const NativeJig = JigDeps._NativeJig
    const Record = JigDeps._Record
    const Rules = JigDeps._Rules
    const SI = JigDeps._Sandbox._intrinsics
    const sudo = JigDeps._sudo
    const CURRENT_RECORD = Record._CURRENT_RECORD

    // Check that the jig has been extended
    if (this.constructor === NativeJig) throw new Error('Jig must be extended')

    // Sandbox and deploy the code. This allows users to do new MyJig() without first deploying.
    if (!(this.constructor instanceof Code)) {
      return CURRENT_RECORD._capture(() => {
        const C = Editor._lookupOrCreateCode(this.constructor)
        Editor._get(C)._deploy()
        return new C(...args)
      })
    } else {
      Editor._get(this.constructor)._deploy()
    }

    // Assign initial bindings
    Bindings._markUndeployed(this)
    const stack = CURRENT_RECORD._stack
    const creator = stack.length && stack[stack.length - 1]
    if (creator) this.owner = sudo(() => deepClone(creator.owner, SI))

    // Wrap ourselves in a proxy so that every action is tracked
    const initialized = false
    const rules = Rules._jigObject(initialized)
    const proxy = new Membrane(this, rules)

    // Add ourselves to the official jig set to pass instanceof checks.
    JIGS.add(proxy)

    // If the creator was bound, then our jig is bound. Otherwise, it is unbound.
    const unbound = !creator || CURRENT_RECORD._isUnbound(creator, true)

    // Create the new action in the record, which will also call init()
    Action._new(this.constructor, proxy, args, unbound)

    return proxy
  }

  // --------------------------------------------------------------------------

  init () { }

  // --------------------------------------------------------------------------

  sync (options = {}) {
    const Log = JigDeps._Log
    const TAG = JigDeps._TAG
    const sync = JigDeps._sync
    const text = JigDeps._misc._text
    const NativeJig = JigDeps._NativeJig
    const Record = JigDeps._Record
    const CURRENT_RECORD = Record._CURRENT_RECORD
    const Transaction = JigDeps._Transaction

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('sync disabled during atomic update')

    if (Log._debugOn) Log._debug(TAG, 'Sync', text(this))

    // sync cannot be applied to a non-jig
    if (!(this instanceof NativeJig)) throw new Error('sync unavailable')

    // sync only available outside the jig
    if (CURRENT_RECORD._stack.length) throw new Error('sync cannot be called internally')

    // Sync it
    return sync(this, options).then(() => this)
  }

  // --------------------------------------------------------------------------

  destroy () {
    const Log = JigDeps._Log
    const TAG = JigDeps._TAG
    const text = JigDeps._misc._text
    const NativeJig = JigDeps._NativeJig
    const Action = JigDeps._Action

    if (Log._debugOn) Log._debug(TAG, 'Destroy', text(this))

    // destroy cannot be applied to a non-jig
    if (!(this instanceof NativeJig)) throw new Error('destroy unavailable')

    // Record a destroy only
    Action._destroy(this)

    // Return self for chaining
    return this
  }

  // --------------------------------------------------------------------------

  auth () {
    const Log = JigDeps._Log
    const TAG = JigDeps._TAG
    const text = JigDeps._misc._text
    const NativeJig = JigDeps._NativeJig
    const Action = JigDeps._Action
    const Record = JigDeps._Record

    if (Log._debugOn) Log._debug(TAG, 'Auth', text(this))

    // auth cannot be applied to a non-jig
    if (!(this instanceof NativeJig)) throw new Error('auth unavailable on native jigs')

    // We cannot auth jigs just created because there is no input
    if (Record._CURRENT_RECORD._creates._has(this)) throw new Error('auth unavailable on new jigs')

    // Record an auth action
    Action._auth(this)

    // Return self for chaining
    return this
  }

  // --------------------------------------------------------------------------

  toString () { return `[jig ${this.constructor.name}]` }

  // --------------------------------------------------------------------------

  static load (location) {
    const { _activeKernel, _text, _extendsFrom } = JigDeps._misc
    const _load = JigDeps._load
    const NativeJig = JigDeps._NativeJig
    const Record = JigDeps._Record
    const CURRENT_RECORD = Record._CURRENT_RECORD
    const Transaction = JigDeps._Transaction

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('load disabled during atomic update')

    // load cannot be applied to a non-jig
    if (this !== NativeJig && !_extendsFrom(this, NativeJig)) throw new Error('load unavailable')

    // load only available outside the jig
    if (CURRENT_RECORD._stack.length) throw new Error('load cannot be called internally')

    const loadAsync = async () => {
      const jig = await _load(location, undefined, _activeKernel())
      if (jig instanceof this) return jig
      throw new Error(`Cannot load ${location}\n\n${_text(jig)} not an instance of ${_text(this)}`)
    }

    return loadAsync()
  }

  // --------------------------------------------------------------------------

  static [Symbol.hasInstance] (x) {
    // Prevent users from creating "jigs" via Object.setPrototypeOf. This also solves
    // the issues of Dragon.prototype instanceof Dragon returning true.
    if (!JigDeps._misc._JIGS.has(x)) return false

    // If we aren't checking a particular class, we are done
    if (this === JigDeps._NativeJig) return true

    // Get the sandboxed version of the class
    const C = JigDeps._Editor._lookupCodeByType(this)

    // If didn't find this code, then it couldn't be an instance.
    if (!C) return false

    // Check if this class's prototype is in the prototype chain of the instance
    // We only check origins, not locations, because (1) locations change frequently
    // for certain class jigs, and to users syncing would be annoying, and (2) inside
    // jig code there will only ever be one location for a jig class at a time.
    return JigDeps._sudo(() => {
      let type = Object.getPrototypeOf(x)
      while (type) {
        if (type.constructor.origin === C.origin) return true
        type = Object.getPrototypeOf(type)
      }

      return false
    })
  }
}

Jig.deps = { JigDeps }
Jig.sealed = false

// ------------------------------------------------------------------------------------------------

Jig.toString() // Preserves the class name during compilation

const NativeJig = JigDeps._Editor._createCode()
const editor = JigDeps._Editor._get(NativeJig)
const internal = false
editor._installNative(Jig, internal)

module.exports = NativeJig


/***/ }),
/* 8 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * bindings.js
 *
 * Helpers to parse bindings
 *
 * Bindings are the properties on a creation that link it to the blockchain. Some bindings
 * are configurable. Other bindings are set only by Run. There are five supported bindings
 * that can be divided into two categories:
 *
 *    Location bindings - identify place and time for the creation
 *
 *      location - Current location
 *      origin - Starting location
 *      nonce - Number of transactions
 *
 *    UTXO bindings - describe UTXO-specific properties
 *
 *      owner - Owner Lock
 *      satoshis - satoshis value
 *
 * UTXO bindings are configurable by jig code. Location bindings are always set by Run.
 */

const bsv = __webpack_require__(5)
const { _text, _setOwnProperty, _defined, _assert, _activeKernel } = __webpack_require__(0)
const { _sudo } = __webpack_require__(4)
const { _version } = __webpack_require__(15)

// ------------------------------------------------------------------------------------------------
// Constants
// ------------------------------------------------------------------------------------------------

/**
 * The maximum amount of satoshis able to be set on a blockchain object. Currently 1 BSV. We
 * restrict this today for security. There will be an option to disable this in the future.
 */
const MAX_SATOSHIS = 100000000

// Location regexes
const ERROR_LOCATION = /^(?<protocol>error):\/\/(?<error>.*)/s
const NATIVE_LOCATION = /^(?<protocol>native):\/\/(?<native>[a-zA-Z0-9_$]+)/s
const RECORD_LOCATION = /^(?<protocol>record):\/\/(?<record>[a-f0-9]{64})_(?:o(?<vout>[0-9]+)|(?:d(?<vdel>[0-9]+)))$/
const JIG_LOCATION = /^(?<txid>[a-f0-9]{64})?_(?:(?:o(?<vout>[0-9]+))|(?:d(?<vdel>[0-9]+)))$/s
const BERRY_LOCATION = /^(?<txid>[a-f0-9]{64})_(?:(?:o(?<vout>[0-9]+))|(?:d(?<vdel>[0-9]+)))(?:\?berry=(?<berry>[a-zA-Z0-9\-_.!~*'()%]*)(&hash=(?<hash>[a-f0-9]{64}))?(&version=(?<version>[1-9][0-9]*))?)?$/s

// List of properties that are reserved for bindings
const _LOCATION_BINDINGS = ['location', 'origin', 'nonce']
const _UTXO_BINDINGS = ['owner', 'satoshis']
const _BINDINGS = _LOCATION_BINDINGS.concat(_UTXO_BINDINGS)

// Properties when not deployed
const _UNDEPLOYED_LOCATION = 'error://Undeployed'
const _UNDEPLOYED_NONCE = 0
const _UNDEPLOYED_OWNER = undefined
const _UNDEPLOYED_SATOSHIS = undefined

// ------------------------------------------------------------------------------------------------
// _location
// ------------------------------------------------------------------------------------------------

/**
 * Parses a location string
 *
 * Locations are URLs for the blockchain. Run uses them to uniquely and deterministically identify
 * blockchain objects. They are also designed to be double-clickable in browsers and consistently
 * lower-case. The allowed characters in user-facing locations are a-z, 0-9 and _.
 *
 * The most basic location is a jig location. It is a transaction id and an output index:
 *
 *    0000000000000000000000000000000000000000000000000000000000000000_o1
 *
 * Jigs may be deleted in a transaction, ending in _d<vdel>
 *
 *    0000000000000000000000000000000000000000000000000000000000000000_d0
 *
 * Instance and code jigs both use this format. Berries are extensions of a code jig location to
 * include its berry path, state hash, and protocol version, because this information will not
 * be present in any transaction:
 *
 *    0000000000000000000000000000000000000000000000000000000000000000_o1?\
 *        berry=1111111111111111111111111111111111111111111111111111111111111111&\
 *        hash=2222222222222222222222222222222222222222222222222222222222222222&\
 *        version=5
 *
 * The query parameters are sorted alphabetically, and berry paths are URI-component encoded.
 * The hash may not be present before the berry is created.
 *
 * native:// is for locations of built-in Run types. They ship with Run and are not on the
 * blockchain. They include Jig and Berry.
 *
 *    native://Jig
 *
 * These are the only valid user-facing locations. However, Run internally has other kinds of
 * locations. In state locations may not always have a txid to refer to the current transaction:
 *
 *    _o1 or _d1
 *
 * Run also has other "special" locations that are prefixed with a protocol. These look vaguely
 * like URIs, and the supported prefixes are record:// and error://.
 *
 * record:// is also used while recording and after its commit
 *
 *    record://0000000000000000000000000000000000000000000000000000000000000000_o2
 *
 * error:// is for locations that are no longer valid. It may contain an error string afterwards
 * that does not have to follow the normal character rules.
 *
 *    error://Something bad happened
 *
 * A special error://Undeployed is used to indicate that a jig is intentionally not yet deployed.
 *
 * @param {string} s Location string
 * @returns {_txid, _vout, _vdel, _berry, _hash, _version, _error, _record, _native, _undeployed, _partial }
 */
function _location (s) {
  if (typeof s !== 'string') throw new Error(`Location is not a string: ${_text(s)}`)

  const match =
    s.match(JIG_LOCATION) ||
    s.match(BERRY_LOCATION) ||
    s.match(RECORD_LOCATION) ||
    s.match(ERROR_LOCATION) ||
    s.match(NATIVE_LOCATION)

  if (match) {
    const ret = {}
    const groups = match.groups

    if (groups.protocol === 'record') { ret._record = groups.record }
    if (groups.protocol === 'error') { ret._error = groups.error }
    if (groups.protocol === 'native') { ret._native = groups.native }

    if (_defined(groups.txid)) { ret._txid = groups.txid }
    if (_defined(groups.vout)) { ret._vout = parseInt(groups.vout) }
    if (_defined(groups.vdel)) { ret._vdel = parseInt(groups.vdel) }
    if (_defined(groups.berry)) { ret._berry = decodeURIComponent(groups.berry) }
    if (_defined(groups.hash)) { ret._hash = groups.hash }
    if (_defined(groups.version)) { ret._version = _version(parseInt(groups.version)) }

    if (s === _UNDEPLOYED_LOCATION) ret._undeployed = true

    return ret
  }

  throw new Error(`Bad location: ${_text(s)}`)
}

// ------------------------------------------------------------------------------------------------
// _compileLocation
// ------------------------------------------------------------------------------------------------

/**
 * The opposite of _location(). Puts together a location string from its parts.
 *
 * When parts conflict, behavior is undefined.
 *
 * @param {_txid, _vout, _vdel, _berry, _hash, _version, _error, _record, _native} parts
 * @returns {string} Location string
 */
function _compileLocation (parts) {
  _assert(typeof parts === 'object' && parts)

  // Errors
  if (_defined(parts._error)) return `error://${parts._error}`

  // Native
  if (_defined(parts._native)) return `native://${parts._native}`

  // Prefix
  let prefix = ''
  if (_defined(parts._record)) prefix = `record://${parts._record}`
  if (_defined(parts._txid)) prefix = parts._txid

  // Suffix
  let suffix = ''
  if (_defined(parts._vout)) suffix = `_o${parts._vout}`
  if (_defined(parts._vdel)) suffix = `_d${parts._vdel}`

  // Query params
  const params = []
  if (_defined(parts._berry)) {
    params.push(`berry=${encodeURIComponent(parts._berry)}`)
    if (_defined(parts._hash)) params.push(`hash=${parts._hash}`)
    if (_defined(parts._version)) params.push(`version=${parts._version}`)
  }
  const query = params.length ? `?${params.join('&')}` : ''

  // Combine location
  return `${prefix}${suffix}${query}`
}

// ------------------------------------------------------------------------------------------------
// _nonce
// ------------------------------------------------------------------------------------------------

// The number of transactions that the jig has been updated in
function _nonce (nonce) {
  if (Number.isInteger(nonce) && nonce >= 1) return nonce
  throw new Error(`Invalid nonce: ${_text(nonce)}`)
}

// ------------------------------------------------------------------------------------------------
// _owner
// ------------------------------------------------------------------------------------------------

/**
 * Returns the Lock for this creation owner or null, or throws an error
 *
 * If owner is null, then the creation does not have an output (deleted, or berry).
 */
function _owner (owner, allowNull = false, bsvNetwork = undefined) {
  const CommonLock = __webpack_require__(44)

  if (typeof owner === 'string') {
    // Try parsing it as a public key
    try {
      // Public key owners are converted into address scripts because
      // the public APIs more frequently support P2PKH UTXO queries and
      // we want as much compatibility as posible for the common use case.
      // Public key owners enable encryption that isn't possible with
      // address owners, no matter how the UTXO is represented.
      const pubkey = new bsv.PublicKey(owner, { network: bsvNetwork })
      const testnet = bsvNetwork ? bsvNetwork === 'testnet' : undefined
      return new CommonLock(pubkey.toAddress().toString(), testnet)
    } catch (e) { }

    // Try parsing it as an address
    try {
      // The base58 check does a sha256d, which is quite slow. This is a user feature. We will
      // expect owners have correct base58 checksums and not enforce it in the protocol.
      const testnet = bsvNetwork ? bsvNetwork === 'testnet' : bsvNetwork === 'mainnet' ? false : undefined
      const commonLock = new CommonLock(owner, testnet)
      commonLock.script() // Check that address is formatted correctly and for the network
      return commonLock
    } catch (e) { }
  }

  // Check if it is a custom owner
  const { Lock } = __webpack_require__(54)
  if (owner instanceof Lock) {
    return owner
  }

  // Null may be used if the jig is deleted and we are reading its owner
  if (owner === null && allowNull) return null

  throw new Error(`Invalid owner: ${_text(owner)}`)
}

// ------------------------------------------------------------------------------------------------
// _satoshis
// ------------------------------------------------------------------------------------------------

/**
 * Checks that the satoshis property of a creation is a non-negative number within a certain range
 */
function _satoshis (satoshis, allowMaxInt) {
  if (typeof satoshis !== 'number') throw new Error('satoshis must be a number')
  if (!Number.isInteger(satoshis)) throw new Error('satoshis must be an integer')
  if (satoshis < 0) throw new Error('satoshis must be non-negative')
  let kernel = null
  try {
    kernel = _activeKernel()
  } catch (e) { /* swallow for now, until we have a Run global */ }
  const limit = allowMaxInt ? Number.MAX_SAFE_INTEGER : (kernel ? kernel._backingLimit : MAX_SATOSHIS)
  if (satoshis > limit) throw new Error(`satoshis must be <= ${limit}`)
  return satoshis
}

// ------------------------------------------------------------------------------------------------
// _markUndeployed
// ------------------------------------------------------------------------------------------------

function _markUndeployed (jig) {
  _sudo(() => {
    _setOwnProperty(jig, 'location', _UNDEPLOYED_LOCATION)
    _setOwnProperty(jig, 'origin', _UNDEPLOYED_LOCATION)
    _setOwnProperty(jig, 'nonce', _UNDEPLOYED_NONCE)
    _setOwnProperty(jig, 'owner', _UNDEPLOYED_OWNER)
    _setOwnProperty(jig, 'satoshis', _UNDEPLOYED_SATOSHIS)
  })
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _location,
  _compileLocation,
  _nonce,
  _owner,
  _satoshis,
  _markUndeployed,
  _LOCATION_BINDINGS,
  _UTXO_BINDINGS,
  _BINDINGS,
  _UNDEPLOYED_LOCATION,
  _UNDEPLOYED_NONCE
}


/***/ }),
/* 9 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * editor.js
 *
 * Manager for jig and sidekick code
 */

const {
  _text, _activeKernel, _parent, _anonymous, _defined, _CODE,
  _basicObject, _hasOwnProperty, _setOwnProperty, _assert, _extendsFrom,
  _RESERVED_PROPS, _RESERVED_CODE_PROPS, _RESERVED_JIG_PROPS
} = __webpack_require__(0)
const CreationSet = __webpack_require__(25)
const { _unifyForMethod } = __webpack_require__(32)
const Dynamic = __webpack_require__(50)
const Log = __webpack_require__(2)
const { _deepClone, _deepVisit } = __webpack_require__(14)
const Bindings = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const { _BINDINGS, _location, _nonce, _owner, _satoshis } = Bindings
const Rules = __webpack_require__(22)
const Sandbox = __webpack_require__(6)
const Proxy2 = __webpack_require__(26)
const { ArgumentError } = __webpack_require__(11)
const Source = __webpack_require__(24)
const SI = Sandbox._intrinsics

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Editor'

// Mapping of code to their editors
const EDITORS = new WeakMap() // Code -> Editor

// Mapping of local types to their network-specific code
const REPOSITORY = {} // { [network]: Map<T, C> }

// Preinstalls that will move into an actual repository once run is activated
const PREINSTALLS = new Map() // T -> C

// Map of names to native code
const NATIVE = {} // { [name]: Code }

// ------------------------------------------------------------------------------------------------
// Editor
// ------------------------------------------------------------------------------------------------

/**
 * Every code jig has an editor that may be used to perform internal operations
 */
class Editor {
  _init (C, D) {
    this._T = undefined // Installed type, which changes with upgrades
    this._D = D // Dynamic type
    this._C = C // Code type
    this._name = undefined
    this._src = undefined
    this._preinstalled = false // Whether this class was partially installed
    this._installed = false // Whether anything was installed
    this._local = false // Whether code is a local type
    this._network = '' // Network, if non-native and installed
    try { this._network = _activeKernel()._blockchain.network } catch (e) { }
    this._native = undefined // Whether a native type
    this._internal = false // Whether internal-only if native
  }

  // --------------------------------------------------------------------------

  /**
   * Sets the inner type of this code jig and ensures it is valid for a jig
   *
   * This is used by both deploy and upgrade.
   *
   * If local is false, then T is assumed to already be sandboxed via makeSandbox.
   */
  _install (T, local = true, newCode = [], src) {
    const Code = __webpack_require__(1)

    if (Log._debugOn) Log._debug(TAG, 'Install', _text(T))

    // If preinstalled, finish installing
    if (this._preinstalled) {
      _assert(T === this._T || T === this._C)
      return this._postinstall()
    }

    // Native code cannot be upgraded
    _assert(!this._native)

    // Save the old inner type that we're replacing, in case of a rollback
    const oldInnerType = Dynamic._getInnerType(this._D)

    // Create a repository for the network if one doesn't exist
    REPOSITORY[this._network] = REPOSITORY[this._network] || new Map()

    // Pre-emptively add the new type to the repository if its local
    REPOSITORY[this._network].delete(this._T)
    if (local) REPOSITORY[this._network].set(T, this._C)

    try {
      this._setupBehavior(T, local, newCode)
      this._setupPresets()
      this._setupBindings(this._installed ? oldInnerType : null)

      // Success. Update the editor.
      this._T = T
      this._name = T.name
      this._src = src || Source._deanonymize(this._D.toString(), this._name)
      this._local = local
      this._preinstalled = false
      this._installed = true
      this._native = false
      this._internal = false

      // If there were presets, we have a couple other things to do
      if (_hasOwnProperty(T, 'presets') && _hasOwnProperty(T.presets, this._network) &&
        _hasOwnProperty(T.presets[this._network], 'location')) {
        // First, make sure all code referenced by this code are also deployed
        _sudo(() => _deepVisit(this._C, x => {
          if (x instanceof Code && x !== this._C) {
            if (_location(x.location)._undeployed) {
              throw new ArgumentError(`${_text(x)} must have presets`)
            }
          }
        }))

        // Second, apply presets to the local type as if we received a publish event
        this._copyBindingsToLocalType(this._T.presets[this._network])
      }
    } catch (e) {
      // Failure. Set the repository back to storing the old local type
      REPOSITORY[this._network].delete(T)
      if (this.local) REPOSITORY[this._network].set(this._T, this._C)

      // Set back the old local type onto the dynamic
      Dynamic._setInnerType(this._D, oldInnerType)

      // Rethrow
      throw e
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Removes the local type for this code. The code may continue to be used.
   */
  _uninstall () {
    if (this._native) throw new Error('Cannot uninstall native code')

    // Remove from repository
    if (this._installed) {
      REPOSITORY[this._network].delete(this._T)
      this._installed = false
    }

    // Remove from preinstalls
    if (this._preinstalled) {
      PREINSTALLS.delete(this._T)
      this._preinstalled = false
    }

    // Delete bindings and presets off of original type
    if (this._T) {
      _BINDINGS.forEach(name => { delete this._T[name] })
      delete this._T.presets
    }

    // Delete the custom hasInstance attachment if we added it
    if (_hasOwnProperty(this._T, Symbol.hasInstance)) {
      delete this._T[Symbol.hasInstance]
    }

    // Clear settings
    this._T = undefined
    this._local = false
  }

  // --------------------------------------------------------------------------

  _preinstall (T) {
    // If already preinstalled, nothing to do
    if (this._preinstalled) return

    // If we've already activated run and have a network, then just install
    let active = true
    try { _activeKernel() } catch (e) { active = false }
    if (active) { this._install(T); return }

    if (Log._debugOn) Log._debug(TAG, 'Preinstall', _text(T))

    // Make sure user is not preinstalling an already installed class
    if (this._installed || this._native) throw new Error(`Cannot preinstall ${_text(T)}`)

    // Save this class into our preinstall set
    PREINSTALLS.set(T, this._C)

    try {
      // Setup our behavior. We don't setup presets or bindings.
      this._setupBehavior(T, true)

      // Success. Update the editor.
      this._T = T
      this._name = T.name
      this._src = Source._deanonymize(this._D.toString(), this._name)
      this._local = true
      this._preinstalled = true
      this._installed = false
      this._native = false
      this._internal = false
    } catch (e) {
      PREINSTALLS.delete(T)

      // Rethrow
      throw e
    }
  }

  // --------------------------------------------------------------------------

  _postinstall () {
    if (!this._preinstalled) return

    if (Log._debugOn) Log._debug(TAG, 'Postinstall', _text(this._T))

    // Try getting the new network
    this._network = _activeKernel()._blockchain.network

    try {
      // Remove from the preinstall set
      PREINSTALLS.delete(this._T)

      // Create a repository for the network if one doesn't exist
      REPOSITORY[this._network] = REPOSITORY[this._network] || new Map()

      // Pre-emptively add the new type to the repository if its local
      REPOSITORY[this._network].set(this._T, this._C)

      // Finish configuring the code with our now-known network
      this._setupPresets()
      this._setupBindings()

      // Update the editor
      this._preinstalled = false
      this._installed = true

      // Postinstall all dependencies
      const Code = __webpack_require__(1)
      const postinstallDep = x => { if (x instanceof Code) Editor._get(x)._postinstall() }
      _sudo(() => _deepVisit(this._C, postinstallDep))
    } catch (e) {
      PREINSTALLS.set(this._T, this._C)
      REPOSITORY[this._network].delete(this._T)
      this._network = ''
      throw e
    }
  }

  // --------------------------------------------------------------------------

  _setupBehavior (T, local = false, newCode = []) {
    // Create the sandbox if T is not sandboxed
    const S = local ? makeSandbox(this._C, T, local, newCode)[0] : T

    const Jig = __webpack_require__(7)
    const Berry = __webpack_require__(13)

    // Determine the membrane rules for this type of code
    let rules = null
    if (_extendsFrom(T, Jig)) {
      rules = Rules._jigCode()
    } else {
      const isClass = T.toString().startsWith('class')
      rules = Rules._sidekickCode(isClass)
    }

    // Configure the membrane for these rules
    Proxy2._getHandler(this._C)._rules = rules

    // Make sure we only upgrade jigs to jigs, and non-jigs to non-jigs
    if (this._installed) {
      const beforeJig = _extendsFrom(this._T, Jig)
      const afterJig = _extendsFrom(T, Jig)
      if (beforeJig !== afterJig) throw new Error('Cannot change jigs to sidekicks, or vice versa')
    }

    // Make sure we do not allow berries to be upgraded from or to
    if (this._installed && _extendsFrom(this._T, Berry)) {
      throw new Error(`Cannot upgrade from berry class: ${_text(this._T)}`)
    }
    if (this._installed && _extendsFrom(T, Berry)) {
      throw new Error(`Cannot upgrade to berry class: ${_text(T)}`)
    }

    // Turn the prototype methods into membranes. Must do this before the inner type is set.
    addMembranesToPrototypeMethods(S, this._C)

    // Make instanceof checks pass with the local type
    hijackLocalInstanceof(T)

    // Set the sandboxed type to the jig
    Dynamic._setInnerType(this._D, S)
  }

  // --------------------------------------------------------------------------

  _setupPresets () {
    _sudo(() => {
      // Apply presets onto the sandbox
      if (_hasOwnProperty(this._C, 'presets')) {
        const npresets = this._C.presets[this._network]
        const presetNames = Object.getOwnPropertyNames(npresets || {})
        presetNames.forEach(name => _setOwnProperty(this._C, name, npresets[name]))

        // Remove presets from code jigs. They are for local types only.
        delete this._C.presets
      }
    })
  }

  // --------------------------------------------------------------------------

  _setupBindings (bindingsToCopy) {
    _sudo(() => {
      if (bindingsToCopy) {
        // Upgrade. Copy over bindings.
        _BINDINGS.forEach(name => _setOwnProperty(this._C, name, bindingsToCopy[name]))
      } else {
        // New install. Setup first-time bindings if no presets.
        if (!_hasOwnProperty(this._C, 'location')) Bindings._markUndeployed(this._C)
      }
    })
  }

  // --------------------------------------------------------------------------

  _installNative (T, internal = false) {
    if (Log._debugOn) Log._debug(TAG, 'Install native', _text(T))

    // Cannot install non-native code to native code
    _assert(this._native === undefined)

    // Parents not allowed
    _assert(!_parent(T))

    // Only one name allowed for native code
    _assert(!(T.name in NATIVE))

    // Sandbox the native code. Props not copied.
    const env = {}
    const native = true
    const anonymize = false
    const [S, SGlobal] = Sandbox._sandboxType(T, env, native, anonymize)
    Object.assign(SGlobal, T.deps)

    // Save allowed options in case we delete them in the next line
    const sealed = T.sealed
    const upgradable = T.upgradable
    const interactive = T.interactive

    // If in cover mode, delete the props. Because otherwise when S === T deps cause problems.
    if (process.env.COVER) Object.keys(S).forEach(key => { delete S[key] })

    // Copy allowed options onto sandbox
    if (_defined(sealed)) _setOwnProperty(S, 'sealed', sealed)
    if (_defined(upgradable)) _setOwnProperty(S, 'upgradable', upgradable)
    if (_defined(interactive)) _setOwnProperty(S, 'interactive', interactive)

    // Turn the prototype methods into membranes. Must do this before the inner type is set.
    addMembranesToPrototypeMethods(S, this._C)

    // Set the sandboxed type to the code
    Dynamic._setInnerType(this._D, S)

    // Set native bindings
    S.origin = `native://${T.name}`
    S.location = `native://${T.name}`
    S.nonce = 0
    S.owner = null
    S.satoshis = 0

    // Add this as a native type
    NATIVE[T.name] = this._C

    // Configure the membrane for native code
    Proxy2._getHandler(this._C)._rules = Rules._nativeCode()

    // Set editor properties
    this._T = T
    this._name = T.name
    this._src = Source._deanonymize(this._D.toString(), this._name)
    this._preinstalled = false
    this._installed = true
    this._local = true
    this._native = true
    this._internal = internal
  }

  // --------------------------------------------------------------------------

  _deploy () {
    if (Log._infoOn) Log._info(TAG, 'Deploy', _text(this._C))

    // Native code does not deploy
    if (this._native) return

    // Post install if necessary
    this._postinstall()

    // Use our deploy helper with only ourselves
    deployMultiple(this._C)
  }

  // --------------------------------------------------------------------------

  // For easy of use, local types that are not sandboxed nor jigs are still assigned locations
  // after their code is deployed. This allows local code to check locations and origins
  // easily. However, it is not fully reliable because updated props are not copied over.
  // As a jig is updated, these local types are not updated with them. We save just the
  // initial deployment bindings.
  _copyBindingsToLocalType (bindings) {
    // If not a local type, nothing to copy
    if (!this._local) return
    const T = this._T

    // Create slots for the presets if they aren't there
    if (!_hasOwnProperty(T, 'presets')) _setOwnProperty(T, 'presets', {})
    if (!_hasOwnProperty(T.presets, this._network)) _setOwnProperty(T.presets, this._network, {})

    // Set each binding only once if we don't have it
    _sudo(() => {
      _BINDINGS.forEach(x => {
        const presets = T.presets[this._network]
        if (!_hasOwnProperty(presets, x)) _setOwnProperty(presets, x, bindings[x])
        if (!_hasOwnProperty(T, x)) _setOwnProperty(T, x, bindings[x])
      })
    })
  }

  // --------------------------------------------------------------------------

  /**
   * Checkpoints a version of this code in case of a revert
   */
  _save () {
    return {
      _C: this._C,
      _T: this._T,
      _name: this._name,
      _src: this._src,
      _innerType: Dynamic._getInnerType(this._D)
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Restores a previous checkpoint
   */
  _restore (savepoint) {
    _assert(this._C === savepoint._C)
    this._T = savepoint._T
    this._name = savepoint._name
    this._src = savepoint._src
    Dynamic._setInnerType(this._D, savepoint._innerType)
  }
}

// ------------------------------------------------------------------------------------------------
// createCode
// ------------------------------------------------------------------------------------------------

/**
   * Creates a blank code jig
   *
   * Notes
   *  - This is intended only to be called internally.
   *  - If T is specified, the Code will automatically create Code for T.
   *  - If local is true, T will be sandboxed and its bindings updated.
   */
function createCode (T, local = true, newCode = []) {
  // Check if T is already installed as code
  _assert(!lookupCodeByType(T))

  // Create a new dynamic type that allows for upgrades
  const D = new Dynamic()

  // Also create an editor that allows us to store metadata and act on this code
  const editor = new Editor()

  // Wrap the dynamic type in the membrane to create the code
  const Membrane = __webpack_require__(19)
  const C = new Membrane(D)

  // Make the dynamic's outer type, its constructor, be the new code
  Dynamic._setOuterType(D, C)

  // Initialize the editor with the code jig and also the dynamic type
  editor._init(C, D)

  // Add the code and editor enabling instanceof checks and other lookups
  EDITORS.set(C, editor)

  // Add the code to the creation set
  _CODE.add(C)

  // Install T if it was provided
  if (T) editor._install(T, local, newCode)

  // Also add ourselves to the new code list
  newCode.push(C)

  // Return the code jig, not this instance, to the caller.
  // The membrane will hook up the methods below.
  return C
}

// ------------------------------------------------------------------------------------------------
// lookupOrCreateCode
// ------------------------------------------------------------------------------------------------

function lookupOrCreateCode (T, local = true, newCode = []) {
  return lookupCodeByType(T) || createCode(T, local, newCode)
}

// ------------------------------------------------------------------------------------------------
// upgradeCode
// ------------------------------------------------------------------------------------------------

function upgradeCode (C, T, local = true, src = undefined) {
  const Record = __webpack_require__(10)
  const Snapshot = __webpack_require__(36)
  const Action = __webpack_require__(21)

  if (Log._debugOn) Log._debug(TAG, 'Upgrade', _text(C), 'to', _text(T))

  // Upgrade can only be called externally
  if (Record._CURRENT_RECORD._stack.length) throw new Error('upgrade unavailable')

  // Non-jig child classes and native code cannot be upgraded. Errors.
  const editor = Editor._get(C)
  if (!editor || editor._native) throw new Error('upgrade unavailable')

  // Non-upgradable code cannot be upgraded
  const upgradable = _sudo(() => !_hasOwnProperty(C, 'upgradable') || C.upgradable)
  if (!upgradable) throw new Error(`${_text(C)} is non-upgradable`)

  // Save a snapshot in case we need to rollback
  const snapshot = new Snapshot(C)

  try {
    // Install the new type on our code to upgrade it
    const newCode = []
    editor._install(T, local, newCode, src)

    // Record potentially multiple actions for upgrade
    Record._CURRENT_RECORD._capture(() => {
      // Deploy each new code needed to upgrade
      if (newCode.length) deployMultiple(...newCode)

      // Upgrade the code
      Action._upgrade(C, snapshot)
    })
  } catch (e) {
    snapshot._rollback(e)
    throw e
  }
}

// ------------------------------------------------------------------------------------------------
// Install helpers
// ------------------------------------------------------------------------------------------------

function checkType (T) {
  const Jig = __webpack_require__(7)
  const Berry = __webpack_require__(13)
  if (typeof T !== 'function') throw new ArgumentError(`Only functions and classes are supported: ${_text(T)}`)
  checkNoReservedWords(T)
  if (_extendsFrom(T, Jig)) checkValidJigClass(T)
  if (_extendsFrom(T, Berry)) checkValidBerryClass(T)
  if (T.prototype && T.prototype.constructor !== T) throw new ArgumentError(`Prototypal inheritance not supported: ${_text(T)}`)
  if (_anonymous(T)) throw new ArgumentError(`Anonymous types not supported: ${_text(T)}`)
  if (T.toString().indexOf('[native code]') !== -1) throw new ArgumentError(`Cannot install intrinsic: ${_text(T)}`)
  checkNoSymbolMethods(T)
  checkNoAccessors(T)
}

// ------------------------------------------------------------------------------------------------

function checkDeps (T, ParentCode) {
  if (!_hasOwnProperty(T, 'deps')) return

  // Deps must be an object if it exists
  if (!_basicObject(T.deps)) throw new ArgumentError('deps must be a basic object')

  // Ensure that if there is a parent, it matches what's actually the parent
  if (ParentCode) {
    const DepParent = T.deps[ParentCode.name]
    const DepParentCode = lookupCodeByType(DepParent)
    if (DepParent && !CreationSet._sameCreation(DepParentCode, ParentCode)) throw new ArgumentError('Parent dependency mismatch')
  }

  // Ensure there are no dependencies named T
  if (T.name in T.deps) throw new ArgumentError('Illegal dependency')
}

// ------------------------------------------------------------------------------------------------

function checkPresets (T) {
  if (!_hasOwnProperty(T, 'presets')) return

  const presets = T.presets
  if (!_basicObject(presets)) throw new ArgumentError('presets must be a basic object')

  for (const network of Object.keys(presets)) {
    const npresets = presets[network]
    if (!_basicObject(npresets)) throw new ArgumentError(`Presets for ${network} network must be an object`)

    // Check that either presets have all bindings or none at all
    const anyBindings = _BINDINGS.some(prop => _defined(npresets[prop]))
    const missingBinding = _BINDINGS.find(prop => !_defined(npresets[prop]))
    if (anyBindings && missingBinding) throw new ArgumentError(`${network} presets not fully defined: ${missingBinding} missing`)

    // Check that the preset bindings are valid if they exist
    if (anyBindings) {
      const loc = _location(npresets.location)
      if (!(loc._txid && (_defined(loc._vout) || _defined(loc._vdel)) && !_defined(loc._berry))) {
        throw new ArgumentError(`Bad location: ${_text(T)}`)
      }

      const orig = _location(npresets.origin)
      if (!(orig._txid && (_defined(orig._vout) || _defined(orig._vdel)) && !_defined(orig._berry))) {
        throw new ArgumentError(`Bad origin: ${_text(T)}`)
      }

      _nonce(npresets.nonce)
      _owner(npresets.owner, true)
      _satoshis(npresets.satoshis)

      if (npresets.nonce > 1 && npresets.origin === npresets.location) {
        throw new ArgumentError(`Bad nonce or location: ${_text(T)}`)
      }
    }

    // Check for reserved words in presets
    if ('deps' in npresets) throw new ArgumentError(`${network} presets must not contain deps`)
    if ('presets' in npresets) throw new ArgumentError(`${network} presets must not contain presets`)
    checkNoReservedWords(npresets)

    // Check for valid options in presets
    checkOptions(npresets)
  }
}

// ------------------------------------------------------------------------------------------------

function checkOptions (T) {
  if (_hasOwnProperty(T, 'sealed')) checkSealedOption(T.sealed)
  if (_hasOwnProperty(T, 'upgradable')) checkUpgradableOption(T.upgradable)
  if (_hasOwnProperty(T, 'interactive')) checkInteractiveOption(T.interactive)
}

// ------------------------------------------------------------------------------------------------

function checkSealedOption (value) {
  if (value !== true && value !== false && value !== 'owner') {
    throw new ArgumentError(`Invalid sealed option: ${value}`)
  }
}

// ------------------------------------------------------------------------------------------------

function checkUpgradableOption (value) {
  if (value !== true && value !== false) {
    throw new ArgumentError(`Invalid upgradable option: ${value}`)
  }
}

// ------------------------------------------------------------------------------------------------

function checkInteractiveOption (value) {
  if (value !== true && value !== false) {
    throw new ArgumentError(`Invalid interactive option: ${value}`)
  }
}

// ------------------------------------------------------------------------------------------------

function checkNoBindings (T) {
  const propNames = Object.getOwnPropertyNames(T)
  const badBinding = _BINDINGS.find(binding => propNames.includes(binding))
  if (badBinding) throw new ArgumentError(`Must not have any bindings: ${badBinding}`)
}

// ------------------------------------------------------------------------------------------------

function checkNoReservedWords (props) {
  const propNames = Object.getOwnPropertyNames(props)
  const badWord = _RESERVED_PROPS.find(word => propNames.includes(word)) ||
   _RESERVED_CODE_PROPS.find(word => propNames.includes(word))
  if (badWord) throw new ArgumentError(`Must not have any reserved words: ${badWord}`)
}

// ------------------------------------------------------------------------------------------------

function checkValidJigClass (T) {
  // Check for jig-specific reserved words
  const propNames = Object.getOwnPropertyNames(T.prototype)
  const badWord = _RESERVED_PROPS.find(word => propNames.includes(word)) ||
   _RESERVED_JIG_PROPS.find(word => propNames.includes(word)) ||
   _BINDINGS.find(word => propNames.includes(word))
  if (badWord) throw new ArgumentError(`Must not have any reserved jig words: ${badWord}`)

  // Check that the jig doesn't have a constructor. Force users to use init.
  const Jig = __webpack_require__(7)
  const childClasses = []
  let type = T
  while (type !== Jig) {
    childClasses.push(type)
    type = Object.getPrototypeOf(type)
  }
  const constructorRegex = /\s+constructor\s*\(/
  if (childClasses.some(type => constructorRegex.test(type.toString()))) {
    throw new Error('Jig must use init() instead of constructor()')
  }
}

// ------------------------------------------------------------------------------------------------

function checkValidBerryClass (T) {
  // Check for berry-specific reserved words
  const propNames = Object.getOwnPropertyNames(T.prototype)
  const badWord = _RESERVED_PROPS.find(word => propNames.includes(word)) ||
    _BINDINGS.find(word => propNames.includes(word))
  if (badWord) throw new ArgumentError(`Must not have any reserved berry words: ${badWord}`)

  // Check that the berry class doesn't have a constructor. Force users to use init.
  const Berry = __webpack_require__(13)
  const childClasses = []
  let type = T
  while (type !== Berry) {
    childClasses.push(type)
    type = Object.getPrototypeOf(type)
  }
  const constructorRegex = /\s+constructor\s*\(/
  if (childClasses.some(type => constructorRegex.test(type.toString()))) {
    throw new Error('Berry must use init() instead of constructor()')
  }
}

// ------------------------------------------------------------------------------------------------

function checkNoSymbolMethods (T) {
  _sudo(() => {
    if (Object.getOwnPropertySymbols(T).length ||
      Object.getOwnPropertySymbols(T.prototype).length) {
      throw new Error('Symbol methods not supported')
    }
  })
}

// ------------------------------------------------------------------------------------------------

function checkNoAccessors (T) {
  const check = desc => {
    if ('get' in desc || 'set' in desc) {
      throw new Error('Getters and setters not supported')
    }
  }

  _sudo(() => {
    Object.getOwnPropertyNames(T)
      .map(name => Object.getOwnPropertyDescriptor(T, name))
      .forEach(desc => check(desc))
    Object.getOwnPropertyNames(T.prototype)
      .map(name => Object.getOwnPropertyDescriptor(T.prototype, name))
      .forEach(desc => check(desc))
  })
}

// ------------------------------------------------------------------------------------------------

function checkUpgradable (T, editor) {
  // Only run these checks if we're upgrading
  if (!editor._installed) return

  // Disallow upgrading native code
  if (editor._native) throw new Error('Cannot upgrade native code')

  // Disallow upgrading to a jig
  const Code = __webpack_require__(1)
  if (T instanceof Code) throw new ArgumentError('Cannot upgrade to a code jig')

  // Check no presets. Upgrading with presets is not supported.
  if (_hasOwnProperty(T, 'presets')) {
    const npresets = T.presets[editor._network]
    const checkNoPresets = x => {
      if (x in npresets) {
        throw new Error('Preset bindings not supported for upgrades')
      }
    }
    Bindings._BINDINGS.forEach(x => checkNoPresets(x))
  }

  // Undeployed code cannot be upgraded because there needs to be an output to spend
  const origin = _sudo(() => editor._C.origin)
  if (origin === Bindings._UNDEPLOYED_LOCATION) throw new Error('Cannot upgrade undeployed code')
}

// ------------------------------------------------------------------------------------------------

function makeSandbox (C, T, local = false, newCode = undefined) {
  // Check if T is an installable class or function
  checkType(T)
  checkUpgradable(T, EDITORS.get(C))

  // Create the parent first
  const Parent = _parent(T)
  const ParentCode = Parent && lookupOrCreateCode(Parent, local, newCode)
  if (ParentCode) {
    if (ParentCode.sealed === true) throw new ArgumentError(`${_text(ParentCode)} is sealed`)
    Editor._get(ParentCode)._postinstall()
  }

  // Check no duplicate parents
  const visited = new Set([C])
  let current = _parent(T)
  while (current) {
    if (visited.has(current)) throw new Error('Cannot extend the self')
    visited.add(C)
    current = _parent(current)
  }

  // Check properties
  checkDeps(T, ParentCode)
  checkPresets(T)
  checkOptions(T)
  checkNoBindings(T)

  // Create the sandbox type with no dependencies or properties except the parent
  const env = {}
  if (ParentCode) env[ParentCode.name] = ParentCode
  const native = false
  const anonymize = true
  const [S, SGlobal] = Sandbox._sandboxType(T, env, native, anonymize)

  // Since anonymized, add the name back in
  Object.defineProperty(S, 'name', { value: T.name, configurable: true })

  // Recreate deps in the sandbox
  const props = Object.assign({}, T)
  const makeCode = x => typeof x === 'function' ? lookupOrCreateCode(x, local, newCode) : undefined
  const Sprops = _deepClone(props, SI, makeCode)

  // Unify the props and deps
  _unifyForMethod(Sprops)

  // There must always be a deps property. Otherwise, user may be confused with parent deps.
  if (!('deps' in Sprops)) Sprops.deps = new SI.Object()

  // Add the implicit parent
  if (ParentCode) Sprops.deps[ParentCode.name] = ParentCode

  // Assign deps as globals
  Object.keys(Sprops.deps || {}).forEach(name => {
    const get = () => C.deps[name]
    const set = (value) => { C.deps[name] = value }
    Object.defineProperty(SGlobal, name, { get, set, configurable: true, enumerable: true })
  })

  // Add the proxy because we strip out the source code name
  _setOwnProperty(SGlobal, T.name, C)

  // Wrap deps to update globals. Always call target first because the proxy handles errors.
  Sprops.deps = makeDeps(C, SGlobal, Sprops.deps)

  // Assign props on sandbox
  Object.keys(Sprops).forEach(name => _setOwnProperty(S, name, Sprops[name]))

  // Create special caller property
  defineCaller(SGlobal)

  return [S, SGlobal]
}

// ------------------------------------------------------------------------------------------------

function makeDeps (C, SGlobal, deps) {
  // Wrap deps to update globals. Always call target first because the proxy handles errors.
  return new SI.Proxy(deps, {
    defineProperty: (target, prop, desc) => {
      const ret = Reflect.defineProperty(target, prop, desc)
      const get = () => C.deps[prop]
      const set = (value) => { C.deps[prop] = value }
      Object.defineProperty(SGlobal, prop, { get, set, configurable: true, enumerable: true })
      return ret
    },

    deleteProperty: (target, prop) => {
      const ret = Reflect.deleteProperty(target, prop)
      Reflect.deleteProperty(SGlobal, prop)
      if (prop === 'caller') defineCaller(SGlobal)
      return ret
    },

    set: (target, prop, value, receiver) => {
      // Safari doesn't like Reflect.set
      _setOwnProperty(target, prop, value)
      const ret = true
      const get = () => C.deps[prop]
      const set = (value) => { C.deps[prop] = value }
      Object.defineProperty(SGlobal, prop, { get, set, configurable: true, enumerable: true })
      return ret
    }
  })
}

// ------------------------------------------------------------------------------------------------

function defineCaller (SGlobal) {
  // If caller is already a global, don't override
  if ('caller' in SGlobal) return

  const Record = __webpack_require__(10)

  // Define our special "caller" property that is accessible in all jigs.
  Object.defineProperty(SGlobal, 'caller', {
    get: () => Record._CURRENT_RECORD._caller(),
    set: () => { throw new Error('Cannot set caller') },
    configurable: true,
    enumerable: true
  })
}

// ------------------------------------------------------------------------------------------------

function addMembranesToPrototypeMethods (S, C) {
  const methods = Object.getOwnPropertyNames(S.prototype)
    .concat(Object.getOwnPropertySymbols(S.prototype))
    .filter(x => x !== 'constructor')

  methods.forEach(method => {
    const Membrane = __webpack_require__(19)
    const methodRules = Rules._childProperty(C, true)
    S.prototype[method] = new Membrane(S.prototype[method], methodRules)
  })
}

// ------------------------------------------------------------------------------------------------

function hijackLocalInstanceof (T) {
  const Jig = __webpack_require__(7)
  const Berry = __webpack_require__(13)

  // For non-jigs and non-berries, hook up special code instanceof checks on the local.
  // Jigs and berries have their own hasInstance. Installed code has its own too.
  if (!_extendsFrom(T, Jig) && !_extendsFrom(T, Berry) && !_hasOwnProperty(T, Symbol.hasInstance)) {
    const desc = { configurable: true, enumerable: true, writable: false }
    const Code = __webpack_require__(1)
    desc.value = Code.prototype[Symbol.hasInstance]
    Object.defineProperty(T, Symbol.hasInstance, desc)
  }
}

// ------------------------------------------------------------------------------------------------

function preinstall (T) {
  const prev = lookupCodeByType(T)
  if (prev) return prev
  const C = Editor._createCode()
  Editor._get(C)._preinstall(T)
  return C
}

// ------------------------------------------------------------------------------------------------
// Deploy helpers
// ------------------------------------------------------------------------------------------------

function deployMultiple (...jigs) {
  const Action = __webpack_require__(21)
  const deploySet = new Set()

  // Find all inner jigs to deploy
  jigs.forEach(jig => {
    // Must only deploy non-native code
    const editor = EDITORS.get(jig)
    _assert(!editor._native)

    jig = lookupCodeByType(jig)
    const innerJigs = whatNeedsToBeDeployed(jig)
    innerJigs.forEach(jig => deploySet.add(jig))
  })

  // Check if there is anything to deploy
  if (!deploySet.size) return

  // Create the action
  Action._deploy([...deploySet])
}

// ------------------------------------------------------------------------------------------------

function whatNeedsToBeDeployed (creation, set = new Set()) {
  const Code = __webpack_require__(1)
  _assert(creation instanceof Code)

  if (set.has(creation)) return

  // Finish installing so the creation has a location
  Editor._get(creation)._postinstall()

  // Check if we should add this creation to the set
  const location = _sudo(() => creation.location)
  const { _undeployed } = _location(location)
  if (!_undeployed) return set

  // Check if the parent needs to be deployed
  const Parent = _parent(creation)
  if (Parent) whatNeedsToBeDeployed(Parent, set)

  // Add the current creation
  set.add(creation)

  const props = _sudo(() => Object.assign({}, creation))

  // Check each inner property to find code to deploy
  const Creation = __webpack_require__(3)
  _sudo(() => _deepVisit(props, x => {
    if (x instanceof Code) whatNeedsToBeDeployed(x, set)
    if (x instanceof Creation) return false
    return true
  }))

  return set
}

// ------------------------------------------------------------------------------------------------
// Code Lookup
// ------------------------------------------------------------------------------------------------

function lookupCodeByType (T) {
  // If T is already code, return it
  if (EDITORS.has(T)) return T

  // If we've preinstalled T, return the origin
  if (PREINSTALLS.has(T)) return PREINSTALLS.get(T)

  // Find the repository for this network
  let network = ''
  try { network = _activeKernel()._blockchain.network } catch (e) { }
  const repository = REPOSITORY[network]
  if (!repository) return

  // Check if T is a local type with code already installed
  if (repository.has(T)) return repository.get(T)

  // If that didn't work, try finding C by its preset
  const presetLocation =
    _hasOwnProperty(T, 'presets') &&
    _hasOwnProperty(T.presets, network) &&
    T.presets[network].location
  if (!presetLocation) return

  for (const C of repository.values()) {
    if (_sudo(() => C.location) === presetLocation) return C
  }
}

// ------------------------------------------------------------------------------------------------

function lookupNativeCodeByName (name) {
  // Find the native code
  const C = NATIVE[name]
  if (!C) return undefined

  // Internal native code cannot be looked up. It must be known internally.
  if (EDITORS.get(C)._internal) throw new Error(`${name} is internal to RUN and cannot be deployed`)

  return C
}

// ------------------------------------------------------------------------------------------------
// Deactivate
// ------------------------------------------------------------------------------------------------

function deactivate () {
  let network = ''
  try { network = _activeKernel()._blockchain.network } catch (e) { }

  // Get the repository for the network being deactivated
  if (Log._infoOn) Log._info(TAG, 'Deactivate', network, 'bindings')

  if (!REPOSITORY[network]) return

  // Remove bindings from each local type
  function deactivateBindings (C, T) {
    // Don't remove bindings during coverage. Bindings will persist.
    if (Sandbox._cover.includes(T.name)) return

    _BINDINGS.forEach(name => { delete T[name] })

    delete T[Symbol.hasInstance]
  }

  // When local classes extends from Code classes, we still need to sudo
  _sudo(() => REPOSITORY[network].forEach(deactivateBindings))
}

// ------------------------------------------------------------------------------------------------
// Activate
// ------------------------------------------------------------------------------------------------

function activate () {
  let network = ''
  try { network = _activeKernel()._blockchain.network } catch (e) { }

  if (Log._infoOn) Log._info(TAG, 'Activate', network, 'bindings')

  // Finish install preinstalls. This is mainly needed for berries.
  Array.from(PREINSTALLS.values()).forEach(T => Editor._get(T)._postinstall())

  // Get the repository for the network being activated
  if (!REPOSITORY[network]) return

  // Set bindings for each local type from their presets
  function activateBindings (C, T) {
    const hasPresets = _hasOwnProperty(T, 'presets') && _hasOwnProperty(T.presets, network)

    if (hasPresets) {
      _BINDINGS.forEach(name => _setOwnProperty(T, name, T.presets[network][name]))
    } else {
      // Only clear bindings if we aren't in coverage, because otherwise we need them
      if (!Sandbox._cover.includes(T.name)) Bindings._markUndeployed(T)
    }

    hijackLocalInstanceof(T)
  }

  // When local classes extends from Code classes, we still need to sudo
  _sudo(() => REPOSITORY[network].forEach(activateBindings))
}

// ------------------------------------------------------------------------------------------------

Editor._createCode = createCode
Editor._lookupOrCreateCode = lookupOrCreateCode
Editor._upgradeCode = upgradeCode
Editor._lookupCodeByType = lookupCodeByType
Editor._lookupNativeCodeByName = lookupNativeCodeByName
Editor._deactivate = deactivate
Editor._activate = activate
Editor._makeSandbox = makeSandbox
Editor._makeDeps = makeDeps
Editor._preinstall = preinstall
Editor._get = T => EDITORS.get(T)
Editor._checkSealedOption = checkSealedOption
Editor._checkUpgradableOption = checkUpgradableOption
Editor._checkInteractiveOption = checkInteractiveOption
Editor._EDITORS = EDITORS

module.exports = Editor

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 10 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * record.js
 *
 * A live recording of actions on creations
 */

const bsv = __webpack_require__(5)
const { crypto } = bsv
const { _assert, _text, _activeKernel, _defined } = __webpack_require__(0)
const CreationSet = __webpack_require__(25)
const { _location, _compileLocation, _UNDEPLOYED_LOCATION } = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const Snapshot = __webpack_require__(36)
const Log = __webpack_require__(2)
const Proxy2 = __webpack_require__(26)
const { _deepVisit } = __webpack_require__(14)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Record'

// ------------------------------------------------------------------------------------------------
// Record
// ------------------------------------------------------------------------------------------------

class Record {
  constructor () {
    // Generate a unique id
    this._id = crypto.Random.getRandomBuffer(32).toString('hex')

    // Nested recording block depth
    this._nested = 0

    // Top-level actions
    this._actions = []

    // [Creation]
    this._stack = []

    // Error
    this._error = null

    // Live recording sets. Creations may belong to multiple.
    this._creates = new CreationSet()
    this._reads = new CreationSet()
    this._updates = new CreationSet()
    this._deletes = new CreationSet()
    this._auths = new CreationSet()
    this._unbound = new CreationSet()

    // Transaction sets. Generated from the recording sets.
    this._inputs = new CreationSet()
    this._outputs = new CreationSet()
    this._refs = new CreationSet()

    // Commits we depend on
    this._upstream = []

    // Full snapshots for incoming creations
    this._before = new Map()

    // Whether to create a commit and then publish automatically
    this._autopublish = true

    // Whether this record is being created to replay a transaction
    this._replaying = false

    // If rolled back, we can't use this record again. A new one must be created
    this._rolledBack = false

    // The kernel used when creating the record
    this._kernel = null
  }

  // --------------------------------------------------------------------------

  /**
   * Begins a new group of actions
   */
  _begin () {
    _assert(!this._rolledBack)
    if (Log._debugOn) Log._debug(TAG, 'Begin')
    this._nested++
  }

  // --------------------------------------------------------------------------

  /**
   * Ends a previous group of actions
   */
  _end () {
    _assert(this._nested)
    if (Log._debugOn) Log._debug(TAG, 'End')
    this._nested--
    if (!this._nested && this._autopublish && !this._rolledBack) this._commit()
  }

  // --------------------------------------------------------------------------

  /**
   * Pushes an creation onto the call stack
   */
  _push (creation) {
    const Creation = __webpack_require__(3)
    _assert(!this._rolledBack)
    _assert(creation instanceof Creation)
    if (Log._debugOn) Log._debug(TAG, `Push ${_text(creation)}`)
    this._stack.push(creation)
  }

  // --------------------------------------------------------------------------

  /**
   * Pops an action from the stack
   */
  _pop () {
    _assert(this._stack.length)
    const creation = this._stack.pop()
    if (Log._debugOn) Log._debug(TAG, `Pop ${_text(creation)}`)
  }

  // --------------------------------------------------------------------------

  /**
   * Record a top-level action
   */
  _action (action) {
    _assert(!this._stack.length)

    if (Log._debugOn) Log._debug(TAG, `Action ${action}`)
    this._actions.push(action)

    // Generate derived record properties
    this._finalize()

    if (!this._replaying) {
      const kernel = this._assignKernel()
      this._outputs._forEach(creation => kernel._emit('update', creation))
      this._deletes._forEach(creation => kernel._emit('update', creation))
    }

    if (!this._nested && this._autopublish) this._commit()
  }

  // --------------------------------------------------------------------------

  _finalize () {
    // The transaction sets are needed to assign record locations.
    _regenerateTransactionSets(this)

    // Locations are assigned at the end of every top-level action. This
    // allows locations to be read in the middle of an action if needed.
    _assignRecordLocations(this)
  }

  // --------------------------------------------------------------------------

  _unbind (creation) {
    _assert(!this._rolledBack)
    if (this._unbound._has(creation)) return
    if (Log._debugOn) Log._debug(TAG, `Unbind ${_text(creation)}`)
    this._unbound._add(creation)
  }

  // --------------------------------------------------------------------------

  /**
   * Converts the record into a commit
   */
  _commit () {
    _assert(!this._rolledBack)

    const Commit = __webpack_require__(37)

    if (Log._debugOn) Log._debug(TAG, 'Commit')

    // If we are committing the current record, create a new current record
    if (this._id === Record._CURRENT_RECORD._id) {
      _assert(!Record._CURRENT_RECORD._nested)
      Record._CURRENT_RECORD = new Record()
    }

    // If there are no actions, then there should be no changed creations
    if (!this._actions.length) {
      if (Log._warnOn) Log._warn(TAG, 'No actions found')
      _assert(!this._creates._size)
      _assert(!this._updates._size)
      _assert(!this._deletes._size)
      _assert(!this._auths._size)
      return
    }

    // If this was a readonly action, like berry plucks, then no commit is generated
    if (this._actions.length && !this._creates._size && !this._updates._size &&
        !this._deletes._size && !this._auths._size) {
      return
    }

    // Check that interactivity is respected
    this._checkInteractivity()

    // Convert this record to a commit
    try {
      return new Commit(this) // eslint-disable-line
    } catch (e) {
      this._rollback(e)
      throw e
    }
  }

  // --------------------------------------------------------------------------

  _checkInteractivity () {
    const Code = __webpack_require__(1)
    const Creation = __webpack_require__(3)

    // Jig and Berry instances use their code to determine interactivity. It's hard to imagine
    // instances being non-interactive but classes interactive. It's also more intuitive I think.

    const creations = this._outputs._arr().concat(this._deletes._arr()).concat(this._refs._arr())
    const code = creations.map(creation => creation instanceof Code ? creation : creation.constructor)
    const nonInteractiveCode = code.filter(C => C.interactive === false)

    // We use the after state of the code to determine the allowed set because this allows
    // the allowed set to change over time.

    nonInteractiveCode.forEach(C => {
      const allowed = new Set([C])

      _sudo(() => _deepVisit(C, x => {
        if (x instanceof Creation) {
          allowed.add(x)
        }
      }))

      const badInteraction = code.find(C2 => !allowed.has(C2))
      if (badInteraction) throw new Error(`${C.name} is not permitted to interact with ${badInteraction.name}`)
    })
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a creation to the CREATE set
   */
  _create (creation) {
    this._checkNotWithinBerry(creation, 'create')

    _assert(!this._rolledBack)
    if (this._creates._has(creation)) { this._authCallers(); return }
    if (Log._debugOn) Log._debug(TAG, 'Create', _text(creation))

    const Code = __webpack_require__(1)
    const Jig = __webpack_require__(7)
    _assert(creation instanceof Code || creation instanceof Jig)
    const native = _sudo(() => _location(creation.origin)._native)
    _assert(!_defined(native))
    _assert(!this._updates._has(creation))
    _assert(!this._deletes._has(creation))
    _assert(!this._auths._has(creation))
    _assert(!this._unbound._has(creation))

    this._creates._add(creation)
    this._link(creation, false, 'create')
    this._snapshot(creation)
    this._authCallers(creation)
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a creation to the READ set
   */
  _read (creation) {
    _assert(!this._rolledBack)
    if (this._reads._has(creation)) return
    if (Log._debugOn) Log._debug(TAG, 'Read', _text(creation))

    const Creation = __webpack_require__(3)
    _assert(creation instanceof Creation)

    this._reads._add(creation)
    this._link(creation, true, 'read')
    this._snapshot(creation, undefined, true)
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a creation to the UPDATE set
   */
  _update (creation, existingSnapshot = undefined) {
    this._checkNotWithinBerry(creation, 'update')

    _assert(!this._rolledBack)
    if (this._updates._has(creation)) {
      this._checkBound(creation, 'update')
      this._authCallers(creation)
      return
    }

    if (Log._debugOn) Log._debug(TAG, 'Update', _text(creation))

    const Code = __webpack_require__(1)
    const Jig = __webpack_require__(7)
    _assert(creation instanceof Code || creation instanceof Jig)
    const undeployed = _sudo(() => creation.origin === _UNDEPLOYED_LOCATION)
    _assert(!undeployed || this._creates._has(creation))
    const native = _sudo(() => _location(creation.origin)._native)
    _assert(!_defined(native))
    this._checkBound(creation, 'update')

    this._updates._add(creation)
    this._link(creation, false, 'update')
    this._snapshot(creation, existingSnapshot)
    this._authCallers(creation)
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a creation to the DELETE set
   */
  _delete (creation) {
    this._checkNotWithinBerry(creation, 'delete')

    _assert(!this._rolledBack)
    if (this._deletes._has(creation)) {
      this._checkBound(creation, 'delete')
      this._authCallers(creation)
      return
    }

    if (Log._debugOn) Log._debug(TAG, 'Delete', _text(creation))

    const Code = __webpack_require__(1)
    const Jig = __webpack_require__(7)
    _assert(creation instanceof Code || creation instanceof Jig)
    const native = _sudo(() => _location(creation.origin)._native)
    _assert(!_defined(native))
    this._checkBound(creation, 'delete')

    this._deletes._add(creation)
    this._link(creation, false, 'delete')
    this._snapshot(creation)
    this._authCallers(creation)

    // Set the creation's UTXO bindings
    _sudo(() => {
      creation.owner = null
      creation.satoshis = 0
    })
  }

  // --------------------------------------------------------------------------

  /**
   * Adds a creation to the AUTH set
   */
  _auth (creation, caller) {
    this._checkNotWithinBerry(creation, 'auth')

    _assert(!this._rolledBack)
    if (this._auths._has(creation)) {
      this._checkBound(creation, 'auth', !caller)
      if (!caller) this._authCallers(creation)
      return
    }

    if (Log._debugOn) Log._debug(TAG, 'Auth', _text(creation))

    const Code = __webpack_require__(1)
    const Jig = __webpack_require__(7)
    _assert(creation instanceof Code || creation instanceof Jig)
    _assert(!this._creates._has(creation))
    this._checkBound(creation, 'auth', !caller)

    this._auths._add(creation)
    this._link(creation, false, 'auth')
    this._snapshot(creation)
    this._authCallers(creation)
  }

  // --------------------------------------------------------------------------

  /**
   * Auths all creations used to produce some action
   *
   * We auth callers because intuitively it makes more sense than the alternative. We could imagine
   * an alternative Run where calling a method on a jig that produced a change in another, or created
   * another, like event.createTicket(), didn't require a spend. In fact, it's easy to even imagine
   * use cases. You could call private methods and write transaction-like code that is not possible
   * with sidekick functions attached to jigs. The problem simply is that it feels weird. Imagine jigs
   * are machines. A getter that doesn't change anything is like reading a display off the machine. But
   * if that machine produced something or changed something else, it cannot do so passively. There
   * must be actual interactions. And therefore we say those interactions have to be authed. We try
   * to use physical analogies to jigs because they are more like physical things purely digital.
   * There is also the other issue of the initial owner being assigned to the caller. Is this right
   * behavior if the caller never approved?
   */
  _authCallers (target) {
    _assert(!this._rolledBack)
    this._stack
      .filter(creation => target !== creation)
      .filter(creation => !!creation)
      .filter(creation => !this._creates._has(creation))
      .forEach(creation => this._auth(creation, true))
  }

  // --------------------------------------------------------------------------

  /**
   * Checks that a change to a creation can be signed by its UTXO in its current state
   */
  _checkBound (creation, method, pending) {
    const unbound = this._isUnbound(creation, pending)
    if (unbound) {
      const reason = this._deletes._has(creation)
        ? `${_text(creation)} deleted`
        : `${_text(creation)} has an unbound owner or satoshis value`
      throw new Error(`${method} disabled: ${reason}`)
    }
  }

  // --------------------------------------------------------------------------

  _isUnbound (creation, pending) {
    return this._unbound._has(creation) ||
      (pending && Proxy2._getHandler(creation)._pendingUnbind())
  }

  // --------------------------------------------------------------------------

  /**
   * Checks that we are not currently loading a berry. Many operations are disabled in this case.
   */
  _checkNotWithinBerry (creation, method) {
    if (!this._stack.length) return
    const Berry = __webpack_require__(13)
    const withinBerry = this._stack.some(creation => creation instanceof Berry)
    if (withinBerry) throw new Error(`Cannot ${method} ${_text(creation)} in berry`)
  }

  // --------------------------------------------------------------------------

  /**
   * Takes a snapshot of a creation if it has not already been captured
   */
  _snapshot (creation, existingSnapshot, readOnly) {
    const rollbacks = this._assignKernel()._rollbacks
    const bindingsOnly = readOnly || !rollbacks

    // If we have a pre-existing snapshot, make a full snapshot if this is bindings only
    const prevss = this._before.get(creation)
    if (prevss) {
      if (!bindingsOnly && prevss._bindingsOnly) prevss._captureCompletely()
      if (!readOnly) prevss._rollbackEnabled = true
      return
    }

    const snapshot = existingSnapshot || new Snapshot(creation, bindingsOnly, readOnly)
    this._before.set(creation, snapshot)
  }

  // --------------------------------------------------------------------------

  /**
   * Hooks up this commit to the upstream commit the creation is in
   */
  _link (creation, readonly, method) {
    _assert(!this._rolledBack)

    const location = _sudo(() => creation.location)
    const loc = _location(location)

    if (_defined(loc._record)) {
      // If we are linking to ourselves, ie. in a transaction, don't add it to our upstream set
      if (loc._record === this._id) return

      const Commit = __webpack_require__(37)
      const commit = Commit._findPublishing(loc._record)

      // Reading from an open transaction is safe. Writing is definitely not.
      if (!commit && !readonly) throw new Error(`Cannot ${method} ${_text(creation)}: open transaction`)

      // If the commit is not published, then link to it
      if (commit && !this._upstream.includes(commit) && !commit._published) {
        this._upstream.push(commit)
      }
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Rolls back changes to the record
   */
  _rollback (e) {
    if (this._rolledBack) return

    if (Log._debugOn) Log._debug(TAG, 'Rollback')

    // Roll back each creation modified
    this._before.forEach(snapshot => snapshot._rollback(e))

    // If we rolled back the current record, create a new one
    if (this._id === Record._CURRENT_RECORD._id) {
      Record._CURRENT_RECORD = new Record()
    }

    // Notify of the rollback if any code is checking
    const kernel = this._assignKernel()
    this._outputs._forEach(creation => kernel._emit('update', creation))
    this._deletes._forEach(creation => kernel._emit('update', creation))

    // Mark rolled back so that we don't use it again
    this._rolledBack = true
  }

  // --------------------------------------------------------------------------

  /**
   * Gets the calling creation for the currently running action
   */
  _caller () {
    // If we're not in an action within another action, then there's no caller
    if (this._stack.length < 2) return null

    // The second-most top-of-stack is our caller
    return this._stack[this._stack.length - 2]
  }

  // --------------------------------------------------------------------------

  /**
   * Records updates to the record and rolls back if there are errors
   *
   * All updates should be in a capture operation to be safe.
   */
  _capture (f) {
    try {
      this._begin()
      const ret = f()
      this._end()
      return ret
    } catch (e) {
      this._rollback(e)
      throw e
    }
  }

  // --------------------------------------------------------------------------

  _assignKernel () {
    const kernel = _activeKernel()
    if (!this._kernel) {
      this._kernel = kernel
    } else {
      if (kernel !== this._kernel) throw new Error('Different Run instances must not be used to produce a single update')
    }
    return this._kernel
  }
}

// ------------------------------------------------------------------------------------------------
// _regenerateTransactionSets
// ------------------------------------------------------------------------------------------------

function _regenerateTransactionSets (record, readonly) {
  // INPUTS = UPDATES + AUTHS + DELETES - CREATES
  record._inputs = new CreationSet()
  for (const x of record._updates) { record._inputs._add(x) }
  for (const x of record._auths) { record._inputs._add(x) }
  for (const x of record._deletes) { record._inputs._add(x) }
  for (const x of record._creates) { record._inputs._delete(x) }

  // OUTPUTS = INPUTS + CREATES - DELETES
  record._outputs = new CreationSet()
  for (const x of record._inputs) { record._outputs._add(x) }
  for (const x of record._creates) { record._outputs._add(x) }
  for (const x of record._deletes) { record._outputs._delete(x) }

  // REFS = READS - INPUTS - OUTPUTS - DELETES
  record._refs = new CreationSet()
  for (const x of record._reads) { record._refs._add(x) }
  for (const x of record._inputs) { record._refs._delete(x) }
  for (const x of record._outputs) { record._refs._delete(x) }
  for (const x of record._deletes) { record._refs._delete(x) }
}

// ------------------------------------------------------------------------------------------------
// _assignRecordLocations
// ------------------------------------------------------------------------------------------------

function _assignRecordLocations (record) {
  const requiresOrigin = creation => {
    const loc = _location(creation.origin)
    return loc._undeployed || loc._record === record._id
  }

  _sudo(() => {
    record._outputs._forEach((creation, n) => {
      creation.location = _compileLocation({ _record: record._id, _vout: n })
      if (requiresOrigin(creation)) creation.origin = creation.location
      creation.nonce = record._before.get(creation)._props.nonce + 1
    })

    record._deletes._forEach((creation, n) => {
      creation.location = _compileLocation({ _record: record._id, _vdel: n })
      if (requiresOrigin(creation)) creation.origin = creation.location
      creation.nonce = record._before.get(creation)._props.nonce + 1
    })
  })
}

// ------------------------------------------------------------------------------------------------

Record._CURRENT_RECORD = new Record()

module.exports = Record


/***/ }),
/* 11 */
/***/ (function(module, exports) {

/**
 * errors.js
 *
 * Custom Error classes thrown by Run.
 *
 * Custom errors are used when the user is expected to be able to respond differently for them,
 * or when there is custom data that should be attached to the error.
 */

// ------------------------------------------------------------------------------------------------
// ArgumentError
// ------------------------------------------------------------------------------------------------

class ArgumentError extends Error {
  constructor (message = 'Unknown reason') {
    super(message)
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// ClientModeError
// ------------------------------------------------------------------------------------------------

/**
 * Error when performing disallowed actions in client mode
 */
class ClientModeError extends Error {
  constructor (data, type) {
    const hint = `Only cached ${type}s may be loaded in client mode`
    const message = `Cannot load ${data}\n\n${hint}`
    super(message)
    this.data = data
    this.type = type
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// ExecutionError
// ------------------------------------------------------------------------------------------------

/**
 * Error for a deterministic failure to load a jig
 */
class ExecutionError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// InternalError
// ------------------------------------------------------------------------------------------------

class InternalError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// NotImplementedError
// ------------------------------------------------------------------------------------------------

/**
 * Error when a method is deliberately not implemented
 */
class NotImplementedError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// TimeoutError
// ------------------------------------------------------------------------------------------------

/**
 * Error when an async call times out
 */
class TimeoutError extends Error {
  constructor (message) {
    super(message)
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// TrustError
// ------------------------------------------------------------------------------------------------

/**
 * Error when a txid is not trusted and has code Run tried to execute
 */
class TrustError extends Error {
  constructor (txid, from) {
    const hint = 'Hint: Trust this txid using run.trust(txid) if you know it is safe'
    const message = `Cannot load untrusted code${from ? ' via ' + from : ''}: ${txid}\n\n${hint}`
    super(message)
    this.txid = txid
    this.from = from
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  ArgumentError,
  ClientModeError,
  ExecutionError,
  InternalError,
  NotImplementedError,
  TimeoutError,
  TrustError
}


/***/ }),
/* 12 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * bsv.js
 *
 * Patches for the bsv library and helpers to use in Run
 */

const bsv = __webpack_require__(5)

const { Script, Transaction } = bsv
const { Interpreter } = Script
const { Input } = Transaction
const { ECDSA, Signature } = bsv.crypto
const { BufferReader, BufferWriter } = bsv.encoding
const { BN } = bsv.deps.bnjs

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const SCRIPTHASH_CACHE = new Map() // LRU Cache
const SCRIPTHASH_CACHE_SIZE = 100

// ------------------------------------------------------------------------------------------------
// _patchBsv
// ------------------------------------------------------------------------------------------------

/**
 * Patches the bsv library to support Run.
 *
 * These changes should all be optional within Run. They may improve performance, handle edge
 * cases, etc., but not change the core functionality. Sometimes multiple bsv instances happen
 * and we want to minimize any monkey patches.
 * @param {object} bsv bsv library instance
 */
function _patchBsv (bsv) {
  if (bsv._patchedByRun) return
  bsv._patchedByRun = true

  // On Bitcoin SV, 0.05 sats/kb is working
  Transaction.FEE_PER_KB = 50

  // Lower the dust amount to 1
  Transaction.DUST_AMOUNT = 1

  // Modify sign() to skip isValidSignature(), which is slow and unnecessary
  const oldSign = Transaction.prototype.sign
  Transaction.prototype.sign = function (...args) {
    const oldIsValidSignature = Input.prototype.isValidSignature
    Input.prototype.isValidSignature = () => true
    const ret = oldSign.call(this, ...args)
    Input.prototype.isValidSignature = oldIsValidSignature
    return ret
  }

  // Disable signature errors, because we support custom scripts, and check custom scripts
  // using the bsv library's interpreter.
  Input.prototype.clearSignatures = () => {}
  Input.prototype.getSignatures = () => []
  Input.prototype.isFullySigned = function () { return !!this.script.toBuffer().length }
  Transaction.prototype.isFullySigned = function () {
    return !this.inputs.some(input => !input.isFullySigned())
  }
  Transaction.prototype.isValidSignature = function (signature) {
    const interpreter = new Interpreter()
    const vin = signature.inputIndex
    const input = this.inputs[vin]
    const flags = Interpreter.SCRIPT_VERIFY_STRICTENC |
      Interpreter.SCRIPT_VERIFY_DERSIG |
      Interpreter.SCRIPT_VERIFY_LOW_S |
      Interpreter.SCRIPT_VERIFY_NULLDUMMY |
      Interpreter.SCRIPT_VERIFY_SIGPUSHONLY |
      Interpreter.SCRIPT_ENABLE_MONOLITH_OPCODES |
      Interpreter.SCRIPT_ENABLE_MAGNETIC_OPCODES |
      Interpreter.SCRIPT_ENABLE_SIGHASH_FORKID
    return interpreter.verify(input.script, input.output.script, this, vin, flags, input.output.satoshisBN)
  }
}

// ------------------------------------------------------------------------------------------------
// _calculateDust
// ------------------------------------------------------------------------------------------------

function _calculateDust (scriptLen, feePerKb) {
  return 1
}

// ------------------------------------------------------------------------------------------------
// _scripthash
// ------------------------------------------------------------------------------------------------

/**
 * Calculates the hash of a script for use in APIs
 * @param {string} script Script string in hex
 * @returns {string} Scripthash string in hex
 */
async function _scripthash (script) {
  // If we've calculated this scripthash already, bump it to the top and return
  const prevhash = SCRIPTHASH_CACHE.get(script)
  if (prevhash) {
    SCRIPTHASH_CACHE.delete(script)
    SCRIPTHASH_CACHE.set(script, prevhash)
    return prevhash
  }

  const hash = (await _sha256(new bsv.Script(script).toBuffer())).reverse().toString('hex')

  SCRIPTHASH_CACHE.set(script, hash)

  if (SCRIPTHASH_CACHE.size > SCRIPTHASH_CACHE_SIZE) {
    const oldestKey = SCRIPTHASH_CACHE.keys().next().value
    SCRIPTHASH_CACHE.delete(oldestKey)
  }

  return hash
}

// ------------------------------------------------------------------------------------------------
// _sighash
// ------------------------------------------------------------------------------------------------

// A modified sighash function from bsv library that caches values
async function _sighash (tx, sighashType, inputNumber, subscript, satoshisBN) {
  const input = tx.inputs[inputNumber]

  async function getPrevoutsHash () {
    if (tx._hashPrevouts) return tx._hashPrevouts
    const writer = new BufferWriter()
    tx.inputs.forEach(input => {
      writer.writeReverse(input.prevTxId)
      writer.writeUInt32LE(input.outputIndex)
    })
    const buf = writer.toBuffer()
    tx._hashPrevouts = await _sha256d(buf)
    return tx._hashPrevouts
  }

  async function getSequenceHash () {
    if (tx._hashSequence) return tx._hashSequence
    const writer = new BufferWriter()
    tx.inputs.forEach(input => {
      writer.writeUInt32LE(input.sequenceNumber)
    })
    const buf = writer.toBuffer()
    tx._hashSequence = await _sha256d(buf)
    return tx._hashSequence
  }

  async function getOutputsHash (n) {
    const writer = new BufferWriter()
    if (typeof n === 'undefined') {
      if (tx._hashOutputsAll) return tx._hashOutputsAll
      tx.outputs.forEach(output => {
        output.toBufferWriter(writer)
      })
    } else {
      tx.outputs[n].toBufferWriter(writer)
    }
    const buf = writer.toBuffer()
    const hash = await _sha256d(buf)
    if (typeof n === 'undefined') tx._hashOutputsAll = hash
    return hash
  }

  let hashPrevouts = Buffer.alloc(32)
  let hashSequence = Buffer.alloc(32)
  let hashOutputs = Buffer.alloc(32)

  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY)) {
    hashPrevouts = await getPrevoutsHash()
  }

  if (!(sighashType & Signature.SIGHASH_ANYONECANPAY) &&
        (sighashType & 31) !== Signature.SIGHASH_SINGLE &&
        (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashSequence = await getSequenceHash()
  }

  if ((sighashType & 31) !== Signature.SIGHASH_SINGLE && (sighashType & 31) !== Signature.SIGHASH_NONE) {
    hashOutputs = await getOutputsHash()
  } else if ((sighashType & 31) === Signature.SIGHASH_SINGLE && inputNumber < tx.outputs.length) {
    hashOutputs = await getOutputsHash(inputNumber)
  }

  const writer = new BufferWriter()
  writer.writeInt32LE(tx.version)
  writer.write(hashPrevouts)
  writer.write(hashSequence)
  writer.writeReverse(input.prevTxId)
  writer.writeUInt32LE(input.outputIndex)
  writer.writeVarintNum(subscript.toBuffer().length)
  writer.write(subscript.toBuffer())
  writer.writeUInt64LEBN(satoshisBN)
  writer.writeUInt32LE(input.sequenceNumber)
  writer.write(hashOutputs)
  writer.writeUInt32LE(tx.nLockTime)
  writer.writeUInt32LE(sighashType >>> 0)

  const buf = writer.toBuffer()
  const hash = await _sha256d(buf)
  return new BufferReader(hash).readReverse()
}

// ------------------------------------------------------------------------------------------------
// _signature
// ------------------------------------------------------------------------------------------------

async function _signature (tx, vin, script, satoshis, privateKey, sighashType = Signature.SIGHASH_ALL) {
  sighashType |= Signature.SIGHASH_FORKID
  const satoshisBN = new BN(satoshis)
  const hashbuf = await _sighash(tx, sighashType, vin, script, satoshisBN)
  const sig = ECDSA.sign(hashbuf, privateKey, 'little')
  const sigbuf = Buffer.from(sig.toDER())
  const buf = Buffer.concat([sigbuf, Buffer.from([sighashType & 0xff])])
  return buf.toString('hex')
}

// ------------------------------------------------------------------------------------------------
// _sha256Internal
// ------------------------------------------------------------------------------------------------

function _sha256Internal (data) {
  const bsvbuf = bsv.deps.Buffer.from(data)
  const hash = bsv.crypto.Hash.sha256(bsvbuf)
  return new Uint8Array(hash)
}

// ------------------------------------------------------------------------------------------------
// _sha256
// ------------------------------------------------------------------------------------------------

async function _sha256 (data) {
  const sha256 = __webpack_require__(43)._sha256
  const uint8arrayHash = await sha256(data)
  return bsv.deps.Buffer.from(uint8arrayHash)
}

// ------------------------------------------------------------------------------------------------
// _sha256d
// ------------------------------------------------------------------------------------------------

async function _sha256d (data) {
  const hash = await _sha256(data)
  return await _sha256(hash)
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _patchBsv,
  _calculateDust,
  _scripthash,
  _sighash,
  _signature,
  _sha256,
  _sha256Internal
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(33).Buffer))

/***/ }),
/* 13 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * berry.js
 *
 * Third-party protocol support through berries
 */

// ------------------------------------------------------------------------------------------------
// BerryDeps
// ------------------------------------------------------------------------------------------------

class BerryDeps {
  static get _Action () { return __webpack_require__(21) }
  static get _Bindings () { return __webpack_require__(8) }
  static get _Editor () { return __webpack_require__(9) }
  static get _load () { return __webpack_require__(16) }
  static get _Membrane () { return __webpack_require__(19) }
  static get _misc () { return __webpack_require__(0) }
  static get _NativeBerry () { return __webpack_require__(13) }
  static get _Record () { return __webpack_require__(10) }
  static get _Rules () { return __webpack_require__(22) }
  static get _sudo () { return __webpack_require__(4)._sudo }
  static get _Transaction () { return __webpack_require__(27) }
}

// ------------------------------------------------------------------------------------------------
// Berry
// ------------------------------------------------------------------------------------------------

class Berry {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (...args) {
    const Action = BerryDeps._Action
    const BERRIES = BerryDeps._misc._BERRIES
    const NativeBerry = BerryDeps._NativeBerry
    const Membrane = BerryDeps._Membrane
    const claimBerry = BerryDeps._load._claimBerry
    const Rules = BerryDeps._Rules
    const { _UNDEPLOYED_LOCATION } = BerryDeps._Bindings

    // Check that the berry class has been extended
    if (this.constructor === NativeBerry) throw new Error('Berry must be extended')

    // Claim the berry
    claimBerry(this.constructor)

    // Assign the location which comes from the load
    this.location = _UNDEPLOYED_LOCATION
    this.origin = _UNDEPLOYED_LOCATION
    this.nonce = 0
    this.owner = null
    this.satoshis = 0

    // Wrap ourselves in a proxy so that every action is tracked
    const initialized = false
    const rules = Rules._berryObject(initialized)
    const proxy = new Membrane(this, rules)

    // Add ourselves to the list of berries
    BERRIES.add(proxy)

    // Create the new action in the record, which will also call init()
    rules._immutable = false
    Action._pluck(this.constructor, proxy, args)
    rules._immutable = true

    // Return the proxy
    return proxy
  }

  // --------------------------------------------------------------------------
  // hasInstance
  // --------------------------------------------------------------------------

  static [Symbol.hasInstance] (x) {
    // Prevent users from creating "berries" via Object.setPrototypeOf. This also solves
    // the issues of Dragon.prototype instanceof Dragon returning true.
    if (!BerryDeps._misc._BERRIES.has(x)) return false

    // If we aren't checking a particular class, we are done
    if (this === BerryDeps._NativeBerry) return true

    // Get the sandboxed version of the class
    const C = BerryDeps._Editor._lookupCodeByType(this)

    // If didn't find this code, then it couldn't be an instance.
    if (!C) return false

    // Check if the berry class matches
    return BerryDeps._sudo(() => {
      let type = Object.getPrototypeOf(x)
      while (type) {
        if (type.constructor.location === C.location) return true
        type = Object.getPrototypeOf(type)
      }

      return false
    })
  }

  // --------------------------------------------------------------------------
  // pluck
  // --------------------------------------------------------------------------

  static async pluck (location, fetch, pluck) {
    return new this()
  }

  // --------------------------------------------------------------------------

  static load (location) {
    const { _activeKernel, _text, _extendsFrom } = BerryDeps._misc
    const _load = BerryDeps._load
    const NativeBerry = BerryDeps._NativeBerry
    const Record = BerryDeps._Record
    const CURRENT_RECORD = Record._CURRENT_RECORD
    const Transaction = BerryDeps._Transaction

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('load disabled during atomic update')

    // load cannot be applied to a non-berry class
    if (this !== NativeBerry && !_extendsFrom(this, NativeBerry)) throw new Error('load unavailable')

    // load only available outside jigs
    if (CURRENT_RECORD._stack.length) throw new Error('load cannot be called internally')

    const kernel = _activeKernel()
    const B = this === NativeBerry ? undefined : this
    const promise = _load(location, B, kernel)

    const loadAsync = async () => {
      const berry = await promise
      if (berry instanceof this) return berry
      throw new Error(`Cannot load ${location}\n\n${_text(berry)} not an instance of ${_text(this)}`)
    }

    return loadAsync()
  }

  // --------------------------------------------------------------------------
  // init
  // --------------------------------------------------------------------------

  init (...args) { }
}

Berry.deps = { BerryDeps }
Berry.sealed = false

// ------------------------------------------------------------------------------------------------

Berry.toString() // Preserves the class name during compilation

const NativeBerry = BerryDeps._Editor._createCode()
const editor = BerryDeps._Editor._get(NativeBerry)
const internal = false
editor._installNative(Berry, internal)

module.exports = NativeBerry


/***/ }),
/* 14 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * deep.js
 *
 * Deep object inspection and processing
 */

const {
  _basicArray, _basicObject, _text, _basicSet, _basicMap, _basicUint8Array,
  _arbitraryObject, _setOwnProperty, _assert
} = __webpack_require__(0)
const { _deterministicObjectKeys } = __webpack_require__(17)
const CreationSet = __webpack_require__(25)
const Sandbox = __webpack_require__(6)
const HI = Sandbox._hostIntrinsics
const SI = Sandbox._intrinsics
const HIS = Sandbox._hostIntrinsicSet
const SIS = Sandbox._intrinsicSet
const HO = HI.Object
const SO = SI.Object

// ------------------------------------------------------------------------------------------------
// _deepVisit
// ------------------------------------------------------------------------------------------------

/**
 * Deeply traverses an object, calling the callback for every internal object and function,
 * including the object itself.
 *
 * This will traverse not just an object's properties, but also the class it belongs to, and
 * internal properties on sets and maps. It will not however traverse class prototype objects.
 * Properties will be traversed in a deterministic order.
 *
 * Callbacks should return true or false for whether to dive down deeper.
 *
 * @param {*} x Object to traverse
 * @param {function} callback Callback for each object
 */
function _deepVisit (x, callback, visited = new Set()) {
  if ((typeof x !== 'function' && typeof x !== 'object') || !x) {
    callback(x)
    return
  }

  if (visited.has(x)) return
  visited.add(x)

  if (callback(x) === false) return

  // Traverse set entries
  if (x instanceof HI.Set || x instanceof SI.Set) {
    for (const y of x) {
      _deepVisit(y, callback, visited)
    }
  }

  // Traverse map keys and values
  if (x instanceof HI.Map || x instanceof SI.Map) {
    for (const [key, value] of x) {
      _deepVisit(key, callback, visited)
      _deepVisit(value, callback, visited)
    }
  }

  // Traverse standard properties
  _deterministicObjectKeys(x).forEach(key => {
    _deepVisit(x[key], callback, visited)
  })

  // Traverse the constructor
  if (typeof x === 'object' && !HIS.has(x.constructor) && !SIS.has(x.constructor)) {
    _deepVisit(x.constructor, callback, visited)
  }

  // Traverse the parent
  const X = Object.getPrototypeOf(x)
  if (typeof x === 'function' && X !== HO.getPrototypeOf(HO) && X !== SO.getPrototypeOf(SO)) {
    _deepVisit(X, callback, visited)
  }
}

// ------------------------------------------------------------------------------------------------
// _deepReplace
// ------------------------------------------------------------------------------------------------

/**
 * Deeply traverses an object, replacing objects and functions in-place with new objects and
 * functions before traversing deeper. Replaced objects are also traversed. Properties are
 * traversed in a deterministic order.
 *
 * The replacer is passed an object and returns a new object.
 *
 * @param {*} x Object to traverse
 * @param {function} replacer Callback to replace each object
 * @returns {*} Replaced object
 */
function _deepReplace (x, replacer, visited = new Map()) {
  if ((typeof x !== 'function' && typeof x !== 'object') || !x) return x

  if (visited.has(x)) return visited.get(x)

  let recurse = true
  const setRecurse = r => { recurse = r }
  const x2 = replacer(x, setRecurse) || x
  visited.set(x, x2)

  if ((typeof x2 !== 'function' && typeof x2 !== 'object') || !x2 || !recurse) return x2

  const Sandbox = __webpack_require__(6)
  const Code = __webpack_require__(1)
  const HI = Sandbox._hostIntrinsics
  const SI = Sandbox._intrinsics
  const HIS = Sandbox._hostIntrinsicSet
  const SIS = Sandbox._intrinsicSet
  const HO = HI.Object
  const SO = SI.Object

  // Traverse set entries
  if (x2 instanceof HI.Set || x2 instanceof SI.Set) {
    const entries = Array.from(x2)
    for (let i = 0; i < entries.length; i++) {
      entries[i] = _deepReplace(entries[i], replacer, visited)
    }
    x2.clear()
    entries.forEach(y => x2.add(y))
  }

  // Traverse map entries
  if (x2 instanceof HI.Map || (x2 instanceof SI.Map)) {
    const entries = Array.from(x2)
    for (let i = 0; i < entries.length; i++) {
      entries[i][0] = _deepReplace(entries[i][0], replacer, visited)
      entries[i][1] = _deepReplace(entries[i][1], replacer, visited)
    }
    x2.clear()
    entries.forEach(entry => x2.set(entry[0], entry[1]))
  }

  // Traverse standard properties
  _deterministicObjectKeys(x2).forEach(key => {
    const y = x2[key]
    const y2 = _deepReplace(y, replacer, visited)
    if (y !== y2) _setOwnProperty(x2, key, y2)
  })

  // Traverse the constructor
  if (typeof x2 === 'object' && !HIS.has(x2.constructor) && !SIS.has(x2.constructor)) {
    const X = _deepReplace(x2.constructor, replacer, visited)
    if (Object.getPrototypeOf(x2) !== X.prototype) Object.setPrototypeOf(x2, X.prototype)
  }

  // Traverse the parent
  const X = Object.getPrototypeOf(x2)
  if (typeof x2 === 'function' && X !== HO.getPrototypeOf(HO) && X !== SO.getPrototypeOf(SO)) {
    // Replace the parent class
    const Y = _deepReplace(X, replacer, visited)
    if (X !== Y) {
      _assert(x2 !== Y)
      Object.setPrototypeOf(x2, Y)

      // Code jigs have two prototypes for every class
      const x2proto = x2 instanceof Code ? Object.getPrototypeOf(x2.prototype) : x2.prototype
      Object.setPrototypeOf(x2proto, Y.prototype)
    }
  }

  return x2
}

// ------------------------------------------------------------------------------------------------
// _deepClone
// ------------------------------------------------------------------------------------------------

/**
 * Deeply clones an object, replacing all internal objects with new clones.
 *
 * Creations are not cloned but passed through. This is because they are designed to cross
 * sandbox boundaries and also because they are unique objects.
 *
 * The datatypes that are cloneable are the same as those that are serializable. They are:
 *
 *    - Primitive types (number, string, boolean, null)
 *    - Basic objects
 *    - Basic arrays
 *    - Sets
 *    - Maps
 *    - Uint8Array
 *    - Arbitrary objects
 *    - Creations: Jig, Code, Berry
 *
 * Key order is not preserved. The keys are deterministically traversed and sorted.
 *
 * @param {object|function} x Object to clone
 * @param {?object} intrinsics Output intrinsics. Defaults to host intrinsics.
 * @param {function} replacer Optional replace function to use for objects instead of clone
 * @returns {object|function} Cloned version of x
 */
function _deepClone (x, intrinsics, replacer, visited = new Map()) {
  if (typeof x === 'symbol') throw new Error(`Cannot clone: ${_text(x)}`)
  if ((typeof x !== 'function' && typeof x !== 'object') || !x) return x

  if (visited.has(x)) return visited.get(x)

  if (replacer) {
    const y = replacer(x)
    if (y) {
      visited.set(x, y)
      return y
    }
  }

  const Sandbox = __webpack_require__(6)
  const Creation = __webpack_require__(3)

  const HI = Sandbox._hostIntrinsics
  const HIS = Sandbox._hostIntrinsicSet
  const SIS = Sandbox._intrinsicSet

  intrinsics = intrinsics || HI

  if (x instanceof Creation) return x

  if (typeof x === 'function') {
    throw new Error(`Cannot clone non-code function: ${_text(x)}`)
  }

  if (HIS.has(x) || SIS.has(x)) {
    throw new Error(`Cannot clone intrinsic: ${_text(x)}`)
  }

  let y = null

  if (_basicArray(x)) {
    y = new intrinsics.Array()
  }

  if (_basicObject(x)) {
    y = new intrinsics.Object()
  }

  if (_basicUint8Array(x)) {
    return new intrinsics.Uint8Array(intrinsics.Array.from(x))
  }

  if (_basicSet(x)) {
    y = new intrinsics.Set()
  }

  if (_basicMap(x)) {
    y = new intrinsics.Map()
  }

  // Fall through case. We will act as if it's an arbitrary object until the end.
  let arbitraryObject = false
  if (!y) {
    arbitraryObject = true
    y = new intrinsics.Object()
  }

  if (!y) throw new Error(`Cannot clone: ${_text(x)}`)

  visited.set(x, y)

  // Clone set entries
  if (y instanceof intrinsics.Set) {
    for (const entry of x) {
      const clonedEntry = _deepClone(entry, intrinsics, replacer, visited)
      y.add(clonedEntry)
    }
  }

  // Clone map entries
  if (y instanceof intrinsics.Map) {
    for (const entry of x) {
      const key = _deepClone(entry[0], intrinsics, replacer, visited)
      const value = _deepClone(entry[1], intrinsics, replacer, visited)
      y.set(key, value)
    }
  }

  // Clone standard properties
  _deterministicObjectKeys(x).forEach(key => {
    if (typeof key === 'symbol') throw new Error(`Cannot clone: ${_text(key)}`)
    _setOwnProperty(y, key, _deepClone(x[key], intrinsics, replacer, visited))
  })

  // Clone the arbitrary object's class
  if (!HIS.has(x.constructor) && !SIS.has(x.constructor)) {
    const Y = _deepClone(x.constructor, intrinsics, replacer, visited)
    Object.setPrototypeOf(y, Y.prototype)
  }

  if (arbitraryObject && !_arbitraryObject(y)) throw new Error(`Cannot clone: ${_text(x)}`)

  return y
}

// ------------------------------------------------------------------------------------------------
// _deepEqual
// ------------------------------------------------------------------------------------------------

/**
 * Deeply compares whether two objects are equal, meaning all subproperties have the same value.
 * The two objects need not be the same. Key order is checked as being insertion order.
 */
function _deepEqual (a, b, options = {}) {
  if (typeof a !== typeof b) return false
  if (typeof a === 'number' && isNaN(a) && isNaN(b)) return true

  const Creation = __webpack_require__(3)
  if (a instanceof Creation) {
    return CreationSet._sameCreation(a, b)
  }

  if (typeof a !== 'object' || !a || !b) return a === b

  // Get object keys via getOwnPropertyNames which is insertion ordered + filter non-enumerables!
  const aOwnKeys = Object.getOwnPropertyNames(a)
  const bOwnKeys = Object.getOwnPropertyNames(b)
  const aDescs = Object.getOwnPropertyDescriptors(a)
  const bDescs = Object.getOwnPropertyDescriptors(b)
  const aKeys = aOwnKeys.filter(key => aDescs[key].enumerable)
  const bKeys = bOwnKeys.filter(key => bDescs[key].enumerable)

  if (aKeys.length !== bKeys.length) return false
  if (options._ordering) {
    for (let i = 0; i < aKeys.length; i++) {
      const aKey = aKeys[i]
      const bKey = bKeys[i]
      if (aKey !== bKey) return false
      if (!_deepEqual(a[aKey], b[bKey])) return false
    }
  } else {
    if (aKeys.some(key => !bKeys.includes(key))) return false
    if (aKeys.some(key => !_deepEqual(a[key], b[key], options))) return false
  }

  if (_basicObject(a)) {
    if (!_basicObject(b)) return false
    return true
  }

  if (_basicArray(a)) {
    if (!_basicArray(b)) return false
    return true
  }

  if (_basicSet(a)) {
    if (!_basicSet(b)) return false
    if (a.size !== b.size) return false
    if (!_deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false
    return true
  }

  if (_basicMap(a)) {
    if (!_basicMap(b)) return false
    if (a.size !== b.size) return false
    if (!_deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false
    return true
  }

  if (_basicUint8Array(a)) {
    if (!_basicUint8Array(b)) return false
    return true
  }

  throw new Error(`Unsupported: ${a}`)
}

// ------------------------------------------------------------------------------------------------

module.exports = { _deepVisit, _deepReplace, _deepClone, _deepEqual }


/***/ }),
/* 15 */
/***/ (function(module, exports) {


/**
 * version.js
 *
 * Describes the version changes that have occurred to the protocol.
 *
 * Summary
 *
 *      Name            Protocol        Changes
 *      ----------      ----------      ----------
 *      0.6             5               Initial launch
 *
 * Notes
 *
 *      - The RUN protocol is designed to evolve
 *      - Jigs created with previous RUN versions will continue to be supported
 *      - Jigs cannot be used in a tx with an earlier protocol version than themselves had
 */

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const PROTOCOL_VERSION = 5

// ------------------------------------------------------------------------------------------------
// Functions
// ------------------------------------------------------------------------------------------------

function version (ver) {
  if (ver !== PROTOCOL_VERSION) throw new Error(`Unsupported version: ${ver}`)
  return ver
}

// ------------------------------------------------------------------------------------------------

function parseMetadataVersion (metadataVersion) {
  const version = typeof metadataVersion === 'string' && metadataVersion.length === 2 && parseInt(metadataVersion, 16)
  if (version === 5) return 5
  const hint = version > 5 ? '\n\nHint: Upgrade your Run SDK to load this transaction' : ''
  throw new Error(`Unsupported RUN transaction version: ${metadataVersion}${hint}`)
}

// ------------------------------------------------------------------------------------------------

function parseStateVersion (stateVersion) {
  // In the initial launch of RUN, the state and protocol versions were considered separate,
  // and the initial protocol was 5 but the state was 4. This is unified to mean a single
  // version, 5, before launch, but due to jigs already deployed this state version persists.
  if (stateVersion === '04') return PROTOCOL_VERSION
  throw new Error(`Unsupported state version: ${stateVersion}`)
}

// ------------------------------------------------------------------------------------------------

function getMetadataVersion (protocolVersion) {
  if (protocolVersion === 5) return '05'
  throw new Error(`Unsupported protocol version: ${protocolVersion}`)
}

// ------------------------------------------------------------------------------------------------

function getStateVersion (protocolVersion) {
  // See comment in parseStateVersion
  if (protocolVersion === 5) return '04'
  throw new Error(`Unsupported protocol version: ${protocolVersion}`)
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _PROTOCOL_VERSION: PROTOCOL_VERSION,
  _version: version,
  _parseMetadataVersion: parseMetadataVersion,
  _parseStateVersion: parseStateVersion,
  _getMetadataVersion: getMetadataVersion,
  _getStateVersion: getStateVersion
}


/***/ }),
/* 16 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * load.js
 *
 * Loads a creation and all its dependencies in parallel
 */

const bsv = __webpack_require__(5)
const { Transaction } = bsv
const Log = __webpack_require__(2)
const { _assert, _extendsFrom, _text, _Timeout, _defined } = __webpack_require__(0)
const { _deterministicJSONStringify } = __webpack_require__(17)
const { _location, _compileLocation, _UNDEPLOYED_LOCATION } = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const Sandbox = __webpack_require__(6)
const { ArgumentError, ClientModeError, TrustError } = __webpack_require__(11)
const { _PROTOCOL_VERSION } = __webpack_require__(15)
const { _sha256 } = __webpack_require__(12)
const { _extractMetadata } = __webpack_require__(34)
const { ExecutionError } = __webpack_require__(11)
const Code = __webpack_require__(1)
const Editor = __webpack_require__(9)
const SI = Sandbox._intrinsics
const HI = Sandbox._hostIntrinsics

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Load'

// We try not to duplicate replays. Even if we can't re-use their jigs, it's better for one replay
// to wait for the other so that the cache is hydrated. Because replaying is very expensive.
const ALL_REPLAYS = new Map() // txid -> Promise

// Berry classes being plucked, to make sure we are plucking correctly, as a safety check.
let UNCLAIMED_BERRIES = []

// Berry loading errors - any errors fail all because with async we can't distinguish
let PLUCK_COUNT = 0
let PLUCK_ERROR = null

// ------------------------------------------------------------------------------------------------
// Session
// ------------------------------------------------------------------------------------------------

/**
 * Notes
 *  - A load session *may* dedup jigs that are loaded in parallel.
 *  - Replays of any kind (jigs, berry plucks) use different sessions for safety.
 *  - There may be duplicate inner jigs created when replaying. These are still safe to use.
 *  - State cache jigs are loaded in two phases. Completers store a promise for the second phase.
 */
class Session {
  constructor () {
    // Promises for the individual loads in progress
    this._loads = new Map() // Location -> Promise<Jig>

    // Promises for replays in progress
    this._replays = new Map() // Txid -> Promise<Commit>

    // Promises to complete any partial loads
    this._completers = []
  }
}

// ------------------------------------------------------------------------------------------------
// _load
// ------------------------------------------------------------------------------------------------

/**
 * Loads a jig or berry at a location
 *
 * BerryClass forces the berry to be plucked using that class, whether deployed or not.
 */
async function load (location, BerryClass, kernel, session, timeout, complete = true) {
  _assert(kernel)
  session = session || new Session()
  timeout = timeout || new _Timeout('load', kernel._timeout, location)

  try {
    timeout._check()

    // Piggy back on an existing load if there is one.
    // Except when there's a berry class. The location is not the real location in that case.
    if (!BerryClass) {
      const prev = session._loads.get(location)
      if (prev) return prev
    }

    // Start a new load. This may partially load the jig and create a completer.
    const promise = _loadFresh(location, BerryClass, kernel, session, timeout)

    // Save the promise so future loads won't load the same jig twice
    // Except when there's a berry class. Same reason as above.
    if (!BerryClass) {
      session._loads.set(location, promise)
    }

    // Wait for the load to finish
    const jig = await promise

    // If we are returning a complete load to the user, finish all inner loads.
    // Completers might create more completers so we loop.
    if (complete) {
      while (session._completers.length) {
        const completers = session._completers
        session._completers = []
        await Promise.all(completers)
      }
    }

    return jig
  } catch (e) {
    if (PLUCK_COUNT) PLUCK_ERROR = PLUCK_ERROR || e
    throw e
  }
}

// ------------------------------------------------------------------------------------------------
// _loadFresh
// ------------------------------------------------------------------------------------------------

/**
 * Loads a jig assuming it is not already being loaded
 */
async function _loadFresh (location, BerryClass, kernel, session, timeout) {
  timeout._check()

  if (BerryClass) {
    if (Log._infoOn) Log._info(TAG, 'Load', location, 'with', _text(BerryClass))
  } else {
    if (Log._infoOn) Log._info(TAG, 'Load', location)
  }

  const start = new Date()

  try {
    // If the user specified a berry class, use it to load the location
    if (BerryClass) {
      return await _loadWithUserBerryClass(location, BerryClass, kernel, session, timeout)
    }

    // Parse the location
    const loc = _location(location)

    // Check that the location is not an error or unpublished
    if (_defined(loc._error) || _defined(loc._record)) {
      throw new ArgumentError(`Bad location: ${location}`)
    }

    // If the location is native, get and return it right away
    if (_defined(loc._native)) {
      return _loadNative(location, timeout)
    }

    // If non-native, check that we can load it
    if (!loc._txid) throw new ArgumentError(`Bad location: ${location}`)

    // Load the jig, code, or berry from its location
    if (_defined(loc._berry)) {
      return await _loadBerryFromLocation(location, kernel, session, timeout)
    } else {
      return await _loadJigFromLocation(location, kernel, session, timeout)
    }
  } finally {
    if (Log._debugOn) Log._debug(TAG, 'Load (end): ' + (new Date() - start) + 'ms')
  }
}

// ------------------------------------------------------------------------------------------------
// _loadBerryFromLocation
// ------------------------------------------------------------------------------------------------

async function _loadBerryFromLocation (location, kernel, session, timeout) {
  const loadFunction = async () => {
    timeout._check()

    // Parse the location to determine if it is a full location
    const loc = _location(location)
    const classLocation = loc._txid + (_defined(loc._vout) ? `_o${loc._vout}` : `'_d${loc._vdel}`)
    const berry = loc._berry
    const hash = loc._hash
    const version = loc._version || _PROTOCOL_VERSION

    // Try loading from the cache first
    const partialLocation = _compileLocation({
      _txid: loc._txid,
      _vdel: loc._vdel,
      _vout: loc._vout,
      _berry: berry,
      _version: version
    })

    // Get the state from the cache if it exists
    const key = `${location.includes('?') ? 'berry' : 'jig'}://${partialLocation}`
    const options = { all: true, tx: !kernel._trustlist.has('state') }
    const state = kernel._state && await kernel._state.pull(key, options)

    if (state) {
      // Recreate the berry from the cached state
      const _recreate = __webpack_require__(45)
      const partial = await _recreate(location, state, hash, kernel, session, timeout)
      session._completers.push(partial._completer)
      return partial._value
    } else {
      // Use a fresh session because we can't wait for the completions here.
      const BerryClass = await load(classLocation, null, kernel, new Session(), timeout)

      // Pluck the damn berry
      return _pluckBerry(berry, hash, version, BerryClass, kernel, session, timeout)
    }
  }

  return await _loadFromLocationWithBanCheck(location, loadFunction, kernel, session, timeout)
}

// ------------------------------------------------------------------------------------------------
// _loadJigFromLocation
// ------------------------------------------------------------------------------------------------

async function _loadJigFromLocation (location, kernel, session, timeout) {
  const loadFunction = async () => {
    timeout._check()

    // Get the state from the cache if it exists
    const key = `${location.includes('?') ? 'berry' : 'jig'}://${location}`
    const options = { all: true, tx: !kernel._trustlist.has('state') }
    const state = kernel._state && await kernel._state.pull(key, options)

    // If there is no cached state, load it via replay. Show!
    if (state) {
      return _loadJigFromState(location, state, kernel, session, timeout)
    }

    return _loadJigViaReplay(location, kernel, session, timeout)
  }

  return await _loadFromLocationWithBanCheck(location, loadFunction, kernel, session, timeout)
}

// ------------------------------------------------------------------------------------------------
// _loadJigFromState
// ------------------------------------------------------------------------------------------------

async function _loadJigFromState (location, state, kernel, session, timeout) {
  const { _txid: txid, _vout: vout, _vdel: vdel } = _location(location)

  let hash = null

  // Get the state hash from the transaction if we don't trust all of the cache.
  if (!kernel._trustlist.has('state')) {
    // Get the transaction and metadata if we are loading a non-berry.
    // Do this here once we already have a state, to allow the cache to populate from State API.
    const rawtx = await kernel._fetch(txid)
    const tx = new Transaction(rawtx)

    // Extract the metadata
    const metadata = _extractMetadata(tx)

    // Check that our location is in range
    const hasVout = typeof vout === 'number' && vout > metadata.vrun && vout < metadata.out.length + metadata.vrun + 1
    const hasVdel = typeof vdel === 'number' && vdel >= 0 && vdel < metadata.del.length
    if (!hasVout && !hasVdel) throw new ArgumentError(`Not a jig: ${location}`)

    hash = hasVout ? metadata.out[vout - metadata.vrun - 1] : metadata.del[vdel]
  }

  // Try recreating from the state cache
  const _recreate = __webpack_require__(45)
  const partial = await _recreate(location, state, hash, kernel, session, timeout)
  session._completers.push(partial._completer)
  return partial._value
}

// ------------------------------------------------------------------------------------------------
// _loadJigViaReplay
// ------------------------------------------------------------------------------------------------

async function _loadJigViaReplay (location, kernel, session, timeout) {
  timeout._check()

  if (kernel._client) throw new ClientModeError(location, 'jig')

  const { _txid: txid, _vout: vout, _vdel: vdel } = _location(location)

  // Get the transaction and metadata
  const rawtx = await kernel._fetch(txid)
  const tx = new Transaction(rawtx)
  let metadata = null
  try {
    metadata = _extractMetadata(tx)
  } catch (e) {
    throw new ExecutionError(e.message)
  }

  let commit = null

  if (session._replays.has(txid)) {
    // If this load session is already replaying, then we re-use the resulting jigs.
    commit = await session._replays.get(txid)
  } else if (ALL_REPLAYS.has(txid)) {
    // If another relpay of this txid is in progress wait for that and then load again
    // Because that replay should add this jig to the cache. Then we can recreate.
    await ALL_REPLAYS.get(txid)

    return await _loadJigFromLocation(location, kernel, session, timeout)
  } else {
    try {
      // Replay the transaction
      const _replay = __webpack_require__(35)
      const published = true
      const jigToSync = null
      const preverify = false
      const promise = _replay(tx, txid, metadata, kernel, published, jigToSync, timeout, preverify)

      session._replays.set(txid, promise)
      ALL_REPLAYS.set(txid, promise)

      commit = await promise
    } finally {
      session._replays.delete(txid)
      ALL_REPLAYS.delete(txid)
    }
  }

  // Notify about jigs from the replay
  const record = commit._record
  record._outputs._forEach(jig => kernel._emit('load', jig))
  record._deletes._forEach(jig => kernel._emit('load', jig))

  // Get the jig out of the commit. Outputs are 1-indexed b/c of the metadata.
  if (typeof vout === 'number' && vout > metadata.vrun && vout < record._outputs._size + metadata.vrun + 1) {
    return record._outputs._arr()[vout - metadata.vrun - 1]
  }
  if (typeof vdel === 'number' && vdel >= 0 && vdel < record._deletes._size) {
    return record._deletes._arr()[vdel]
  }

  // No luck. No jig.
  throw new ArgumentError(`Jig not found: ${location}`)
}

// ------------------------------------------------------------------------------------------------
// _loadWithUserBerryClass
// ------------------------------------------------------------------------------------------------

/**
 * Loads a jig using the user-provided berry class
 */
async function _loadWithUserBerryClass (path, BerryClass, kernel, session, timeout) {
  timeout._check()

  const Berry = __webpack_require__(13)

  // Check that BerryClass extends from Berry
  if (!_extendsFrom(BerryClass, Berry)) throw new ArgumentError('Berry class must extend from Berry')

  // Check that the path is valid
  if (typeof path !== 'string') throw new ArgumentError('Berry path must be a string')

  // Find or install the berry class
  const B = Editor._lookupOrCreateCode(BerryClass)

  // If the berry class was deployed, see if we can load it from the cache
  const berryClassDeployed = !!_sudo(() => _location(B.location))._txid
  if (berryClassDeployed) {
    const opts = { _berry: path, _version: _PROTOCOL_VERSION }
    const parts = Object.assign(_location(B.location), opts)
    const partialLocation = _compileLocation(parts)

    // Get the state from the cache if it exists
    const key = `${partialLocation.includes('?') ? 'berry' : 'jig'}://${partialLocation}`
    const options = { all: true, tx: !kernel._trustlist.has('state') }
    const state = kernel._state && await kernel._state.pull(key, options)

    if (state) {
      const _recreate = __webpack_require__(45)
      const partial = await _recreate(partialLocation, state, undefined, kernel, session, timeout)
      session._completers.push(partial._completer)
      return partial._value
    }
  }

  // Pluck the berry using the class and path
  return _pluckBerry(path, null, _PROTOCOL_VERSION, B, kernel, session, timeout)
}

// ------------------------------------------------------------------------------------------------
// _pluckBerry
// ------------------------------------------------------------------------------------------------

/**
 * Recreates a berry from scratch using a berry class's pluck function
 */
async function _pluckBerry (path, hash, version, B, kernel, session, timeout) {
  timeout._check()

  _assert(B instanceof Code)

  if (Log._infoOn) Log._info(TAG, 'Pluck', _text(B), path)

  // Create the secure fetch function. Make sure we set CURRENT_RECORD._error
  // in case of fetch errors so that the user code cannot swallow it.
  const fetchCode = `async function(txid) {
    try {
      return await f(txid)
    } catch (e) {
      se(e)
      throw e
    }
  }`
  const fetchEnv = {
    f: kernel._fetch.bind(kernel),
    se: e => { PLUCK_ERROR = PLUCK_ERROR || e }
  }
  const [fetch] = Sandbox._evaluate(fetchCode, fetchEnv)
  Object.freeze(fetch)

  try {
    // Determine the berry's partial location. Undeployed berry clases are errors.
    const berryClassDeployed = !!_sudo(() => _location(B.location))._txid
    let partialLocation = _UNDEPLOYED_LOCATION
    if (berryClassDeployed) {
      partialLocation = _compileLocation(
        Object.assign(_location(B.location), { _berry: path, _version: version }))
    }

    // Set the pluck class and location to be taken inside pluck()
    UNCLAIMED_BERRIES.push(B)
    PLUCK_COUNT++

    if (PLUCK_ERROR) throw PLUCK_ERROR

    // Pluck the berry
    const promise = B.pluck(path, fetch)
    if (!(promise instanceof SI.Promise || promise instanceof HI.Promise)) {
      throw new Error('pluck method must be async')
    }
    const berry = await promise

    // Check the berry is allowed for this berry class
    if (!berry || berry.constructor !== B) throw new Error(`Berry must be an instance of ${_text(B)}`)

    // Cache the berry and determine its final location
    if (berryClassDeployed) {
      // Set the initial location for state capture
      _sudo(() => { berry.location = berry.origin = partialLocation })

      // Calculate the berry state
      const { _captureBerry } = __webpack_require__(52)
      const state = _captureBerry(berry, version)

      // Calculate the berry state hash
      const stateString = _deterministicJSONStringify(state)
      const stateBuffer = new bsv.deps.Buffer(stateString, 'utf8')
      const stateHash = await _sha256(stateBuffer)
      const stateHashHex = stateHash.toString('hex')

      // Make sure the state hash matches if possible
      if (hash && hash !== stateHashHex) throw new Error('Berry state mismatch')

      // Assign the full location to the berry
      const fullLocation = _compileLocation(Object.assign({ _hash: stateHashHex }, _location(partialLocation)))
      _sudo(() => { berry.location = berry.origin = fullLocation })

      // Berries are keyed by their partial location
      const key = `berry://${partialLocation}`
      await kernel._cache.set(key, state)
    }

    if (PLUCK_ERROR) throw PLUCK_ERROR

    return berry
  } catch (e) {
    PLUCK_ERROR = PLUCK_ERROR || e
    throw e
  } finally {
    if (--PLUCK_COUNT === 0) {
      UNCLAIMED_BERRIES = []
      PLUCK_ERROR = null
    }
  }
}

// ------------------------------------------------------------------------------------------------
// _loadFromLocationWithBanCheck
// ------------------------------------------------------------------------------------------------

async function _loadFromLocationWithBanCheck (location, loadFunction, kernel, session, timeout) {
  // Check if we've previously tried to load this creation and it failed. Don't try again.
  let bannedValue
  try {
    bannedValue = await kernel._state.pull(`ban://${location}`)
  } catch (e) {
    // Swallow cache get failures, because it's a cache.
    if (Log._warnOn) Log._warn(TAG, `Failure to get from cache ban://${location}\n\n${e.toString()}`)
  }

  // If banned due to a trust issue, but now that txid is trusted, unban it.
  // If the ban was due to a prior RunConnect plugin bug, also unban it.
  let banned = typeof bannedValue === 'object' && bannedValue
  if (banned) {
    const dueToTrustButNowTrusted = bannedValue.untrusted && await kernel._trusted(bannedValue.untrusted)
    const dueToStateServerDown = banned.reason.includes('Cannot convert undefined or null to object')
    const unban = dueToTrustButNowTrusted || dueToStateServerDown

    if (unban) {
      try {
        await kernel._cache.set(`ban://${location}`, false)
      } catch (e) {
        // Swallow cache set failures, because it's a cache.
        if (Log._warnOn) Log._warn(TAG, `Failure to unban from cache ${location}\n\n${e.toString()}`)
      }
      banned = false
    }
  }

  // Banned jigs do not load
  if (banned) {
    // If the jig was banned due to trust, present the original error as is
    if (bannedValue.untrusted) throw new Error(bannedValue.reason)

    const hint = `Hint: If you wish to unban this location: await run.cache.set('ban://${location}', false)`
    throw new Error(`Failed to load banned location: ${location}\n\nReason: ${bannedValue.reason}\n\n${hint}`)
  }

  try {
    return await loadFunction(location)
  } catch (e) {
    // Only internal deterministic execution errors should result in a ban.
    if (e instanceof ExecutionError || e instanceof TrustError) {
      try {
        const value = { reason: e.toString() }
        if (e instanceof TrustError) value.untrusted = e.txid
        await kernel._cache.set(`ban://${location}`, value)
      } catch (e) {
        // Swallow cache set failures by default
        if (Log._warnOn) Log._warn(TAG, `Swallowing failure to cache set ban://${location}`, e.toString())
      }
    }

    throw e
  }
}

// ------------------------------------------------------------------------------------------------
// _loadNative
// ------------------------------------------------------------------------------------------------

/**
 * Specifically loads a built-in class as a dependency
 *
 * Example: native://Jig
 */
function _loadNative (location, timeout) {
  timeout._check()

  const { _native: native } = _location(location)

  // Find the native code
  const C = Editor._lookupNativeCodeByName(native)
  if (!C) throw new ArgumentError(`Native code not found: ${native}`)

  // Make sure it's not internal
  const editor = Editor._get(C)
  if (editor._internal) throw new ArgumentError(`${_text(C)} cannot be a dependency`)

  // Return the jig
  return C
}

// ------------------------------------------------------------------------------------------------
// claimBerry
// ------------------------------------------------------------------------------------------------

function claimBerry (B) {
  // Ensures that we only pluck once. The async nature of the pluck() function means that
  // we can't 100% ensure that all berries are plucked from their class, so we will move to
  // a non-async pluck() function in v0.7, and ban any berries that do this, but it is unlikely
  // this flaw will be discovered before then.
  const index = UNCLAIMED_BERRIES.indexOf(B)
  if (index === -1) {
    throw new Error('Must only create berry from its berry class')
  }
  UNCLAIMED_BERRIES.splice(index, 1)
}

// ------------------------------------------------------------------------------------------------

load._Session = Session
load._claimBerry = claimBerry

module.exports = load


/***/ }),
/* 17 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * determinism.js
 *
 * Code to make the sandbox deterministic or detect non-determinism
 */

const { _basicUint8Array } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// _makeDeterministic
// ------------------------------------------------------------------------------------------------

/**
 * Stubs JavaScript implementations to make the current realm deterministic.
 *
 * This builds expects SES's lockdown() function to be called and does not duplicate that work.
 * For example, lockdown() already shuts down the Date object. We also expect that
 * the nonDeterministicIntrinsics below will be disabled by the realm.
 *
 * This all has to be in one function because its code will be executed in the realm.
 */
function _makeDeterministic (stableJSONStringify) {
  const defaultCompare = (x, y) => {
    if (x === y) return 0
    if (x === undefined) return 1
    if (y === undefined) return -1
    const xs = x === null ? 'null' : x.toString()
    const ys = y === null ? 'null' : y.toString()
    return xs < ys ? -1 : xs > ys ? 1 : 0
  }

  // Make Array.prototype.sort stable. The spec does not guarantee this.
  // All major browsers are now stable: https://github.com/tc39/ecma262/pull/1340
  // So is Node 11+: https://github.com/nodejs/node/issues/29446
  // However, Node 10, is not stable. We fix it everywhere just in case.
  const oldSort = Array.prototype.sort
  function sort (compareFunc = defaultCompare) {
    const indices = new Map()
    this.forEach((x, n) => indices.set(x, n))
    const newCompareFunc = (a, b) => {
      const result = compareFunc(a, b)
      if (result !== 0) return result
      return indices.get(a) - indices.get(b)
    }
    return oldSort.call(this, newCompareFunc)
  }
  Array.prototype.sort = sort // eslint-disable-line

  // Disallow localeCompare. We probably could allow it in some cases in the future, but it's safer
  // to just turn it off for now.
  delete String.prototype.localeCompare

  // Make Object.keys() and similar methods deterministic. To do this, we make them behave like
  // Object.getOwnPropertyNames except it won't include non-enumerable properties like that does.
  // This hopefully will not affect many VMs anymore. For more details, see [1] [2] [3]
  //
  // [1] https://github.com/tc39/proposal-for-in-order
  // [2] https://esdiscuss.org/topic/property-ordering-of-enumerate-getownpropertynames
  // [3] https://stackoverflow.com/questions/5525795/does-javascript-guarantee-object-property-order

  const oldObjectKeys = Object.keys
  Object.keys = function keys (target) {
    const keys = oldObjectKeys(target)
    const props = Object.getOwnPropertyNames(target)
    return keys.sort((a, b) => props.indexOf(a) - props.indexOf(b))
  }

  Object.values = function values (target) {
    return Object.keys(target).map(key => target[key])
  }

  Object.entries = function entries (target) {
    return Object.keys(target).map(key => [key, target[key]])
  }

  // Uint8array elements should all be configurable when returned.
  // See: 2020-10-17 https://webkit.googlesource.com/WebKit/+/master/Source/JavaScriptCore/ChangeLog
  // See: Description https://github.com/tc39/ecma262/pull/2164
  // Node.js and some browsers return non-configurable entries, even though they may be changed.
  const oldReflectGetOwnPropertyDescriptor = Reflect.getOwnPropertyDescriptor
  Reflect.getOwnPropertyDescriptor = Object.getOwnPropertyDescriptor = function getOwnPropertyDescriptor (o, p) {
    const desc = oldReflectGetOwnPropertyDescriptor(o, p)
    if (desc && typeof p === 'string' && o instanceof Uint8Array) desc.configurable = true
    return desc
  }

  // When Uint8Array elements are set, define property may fail on older JS VMs. So we use direct sets.
  const oldReflectDefineProperty = Reflect.defineProperty
  Reflect.defineProperty = Object.defineProperty = function defineProperty (o, p, desc) {
    if (desc && typeof p === 'string' && o instanceof Uint8Array && desc.writable && desc.enumerable && desc.configurable) {
      Reflect.set(o, p, desc.value)
      return o
    }
    return oldReflectDefineProperty(o, p, desc)
  }

  const nativeStringify = JSON.stringify
  JSON.stringify = (value, replacer, space) => stableJSONStringify(value, replacer, space, null, nativeStringify)

  // Function.prototype.toString() in general is not deterministic. Whitespace, line terminators,
  // and semicolons may be different, and in Safari, the browser also inserts "function" before
  // method.toString(), where as Node and other browsers do not. We cannot fix all aspects of
  // non-determinism, but we can fix the "function" issue. We will not change the whitespace,
  // because whitespace may be important to the execution of the code. Without an interpreter
  // we cannot know.
  const oldFunctionToString = Function.prototype.toString
  function toString () { // eslint-disable-line
    // Hide our custom implementations
    if (this === Array.prototype.sort) return 'function sort() { [native code ] }'
    if (this === Object.keys) return 'function keys() { [native code ] }'
    if (this === Object.values) return 'function values() { [native code ] }'
    if (this === Object.entries) return 'function entries() { [native code ] }'
    if (this === JSON.stringify) return 'function stringify() { [native code ] }'
    if (this === toString) return 'function toString() { [native code ] }'
    if (this === Object.getOwnPropertyDescriptor) return 'function getOwnPropertyDescriptor() { [native code ] }'
    if (this === Reflect.getOwnPropertyDescriptor) return 'function getOwnPropertyDescriptor() { [native code ] }'
    if (this === Object.defineProperty) return 'function defineProperty() { [native code ] }'
    if (this === Reflect.defineProperty) return 'function defineProperty() { [native code ] }'

    const s = oldFunctionToString.call(this)
    const match = s.match(/^([a-zA-Z0-9_$]+)\s*\(/)
    return (match && match[1] !== 'function') ? `function ${s}` : s
  }
  Function.prototype.toString = toString // eslint-disable-line
}

// ------------------------------------------------------------------------------------------------
// Non-deterministic Intrinsics
// ------------------------------------------------------------------------------------------------

// Will be disabled
const _nonDeterministicIntrinsics = [
  'Date',
  'Math',
  'eval',
  'XMLHttpRequest',
  'FileReader',
  'WebSocket',
  'setTimeout',
  'setInterval'
]

// ------------------------------------------------------------------------------------------------
// _stableJSONStringify
// ------------------------------------------------------------------------------------------------

/*
 * A JSON.stringify implementation that stably sorts keys
 *
 * Based on https://github.com/substack/json-stable-stringify
 */
function _stableJSONStringify (value, replacer, space, cmp, nativeStringify) {
  if (typeof space === 'number') space = Array(space + 1).join(' ')
  if (typeof space !== 'string') space = ''

  const seen = new Set()

  function stringify (parent, key, node, level) {
    const indent = space ? ('\n' + new Array(level + 1).join(space)) : ''
    const colonSeparator = space ? ': ' : ':'

    if (node && typeof node.toJSON === 'function') node = node.toJSON()

    node = replacer ? replacer.call(parent, key, node) : node

    if (node === undefined) return undefined
    if (typeof node !== 'object' || node === null) return nativeStringify(node)

    if (seen.has(node)) throw new TypeError('Converting circular structure to JSON')
    seen.add(node)

    let result
    if (Array.isArray(node)) {
      const out = []
      for (let i = 0; i < node.length; i++) {
        const item = stringify(node, i, node[i], level + 1) || nativeStringify(null)
        out.push(indent + space + item)
      }
      result = '[' + out.join(',') + (out.length ? indent : '') + ']'
    } else {
      let keys = Object.keys(node)
      if (cmp) keys = keys.sort(cmp)
      const out = []
      for (let i = 0; i < keys.length; i++) {
        const key = keys[i]
        const value = stringify(node, key, node[key], level + 1)
        if (!value) continue
        const keyValue = nativeStringify(key) + colonSeparator + value
        out.push(indent + space + keyValue)
      }
      result = '{' + out.join(',') + (out.length ? indent : '') + '}'
    }

    seen.delete(node)
    return result
  }

  // This matches the real JSON.stringify implementation
  return stringify({ '': value }, '', value, 0)
}

// ------------------------------------------------------------------------------------------------
// _deterministicJSONStringify
// ------------------------------------------------------------------------------------------------

// The JSON.stringify method uses Object.keys() to order its keys. Key order is non-deterministic
// in ES2015 using Object.keys() [1], so JSON.stringify is too. This is bad. We'ved tried various
// approaches to keep order intact, but ultimately it seemed simpler to just canonically order
// keys, in this case alphabetically.
//
// In 2020, key order is deterministic to spec on Node, Chrome, Firefox, and Edge. In Safari, it is
// mostly correct, but using proxies it still returns wrong values. Run uses proxies.
//
// [1] https://stackoverflow.com/questions/30076219/does-es6-introduce-a-well-defined-order-of-enumeration-for-object-properties

const _deterministicJSONStringify = (value, replacer, space) => {
  return _stableJSONStringify(value, replacer, space, _deterministicCompareKeys, JSON.stringify)
}

// ------------------------------------------------------------------------------------------------
// _deterministicObjectKeys
// ------------------------------------------------------------------------------------------------

// Object.keys() is not deterministic. Object.getOwnPropertyNames() is deterministic but returns
// non-enumerable properties. We create a safe version of Object.keys() that is deterministic.

function _deterministicObjectKeys (x) {
  return Object.keys(x).sort(_deterministicCompareKeys)
}

// ------------------------------------------------------------------------------------------------
// _deterministicCompareKeys
// ------------------------------------------------------------------------------------------------

function _deterministicCompareKeys (a, b) {
  if (typeof a !== typeof b) return typeof a === 'symbol' ? 1 : -1
  if (typeof a === 'symbol') a = a.toString()
  if (typeof b === 'symbol') b = b.toString()
  const aInt = parseInt(a)
  const bInt = parseInt(b)
  const aIsInteger = aInt.toString() === a
  const bIsInteger = bInt.toString() === b
  if (aIsInteger && !bIsInteger) return -1
  if (bIsInteger && !aIsInteger) return 1
  if (aIsInteger && bIsInteger) return aInt - bInt
  return a < b ? -1 : b < a ? 1 : 0
}

// ------------------------------------------------------------------------------------------------
// _deterministicDefineProperty
// ------------------------------------------------------------------------------------------------

function _deterministicDefineProperty (o, p, desc) {
  // When Uint8Array elements are set, define property may fail on older JS VMs that have configurable
  // to be false. But we can bypass this with direct sets, so we do.
  if (desc && typeof p === 'string' && _basicUint8Array(o) && desc.writable && desc.enumerable && desc.configurable) {
    Reflect.set(o, p, desc.value)
    return o
  }
  return Reflect.defineProperty(o, p, desc)
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _makeDeterministic,
  _nonDeterministicIntrinsics,
  _stableJSONStringify,
  _deterministicJSONStringify,
  _deterministicObjectKeys,
  _deterministicCompareKeys,
  _deterministicDefineProperty
}


/***/ }),
/* 18 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * request.js
 *
 * Lightweight API to make REST requests in node and the browser
 */

/* global VARIANT */

const Log = __webpack_require__(2)
const { TimeoutError } = __webpack_require__(11)
const { _limit } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Request'

// Cache of string->[Promise] for deduping http requests
const REQUESTS = {}

// Cache of response values and their expiration time
const RESPONSES = {}

// ------------------------------------------------------------------------------------------------
// RequestError
// ------------------------------------------------------------------------------------------------

/**
 * Error when a network request does not return 200
 */
class RequestError extends Error {
  constructor (reason, status, statusText, method, url) {
    super(`${status} ${statusText}\n\n${method} ${url}\n\n${reason}`)
    this.reason = reason
    this.status = status
    this.statusText = statusText
    this.method = method
    this.url = url
    this.name = this.constructor.name
  }
}

// ------------------------------------------------------------------------------------------------
// request
// ------------------------------------------------------------------------------------------------

/**
 * Makes an HTTP request
 * @param {string} url URL to access
 * @param {?object} options Configuration object
 * @param {?string} options.method HTTP method
 * @param {?object} options.body JSON body
 * @param {?object} options.headers Custom request headers in key-value
 * @param {?number} options.timeout Timeout in milliseconds
 * @param {?number} options.retries Number of time to retry
 * @param {?boolean} options.dedup Whether to dedup this request with other GET requests
 * @param {?number} options.cache How long to cache this GET response for
 * @param {?function} options.response Response handler that processes raw responses
 * @returns {*} JSON object or string response
 */
async function request (url, options = {}) {
  options = Object.assign({}, request.defaults, options)

  const id = `${options.method} ${url}`

  // Performs a request once
  async function singleRequest () {
    if (Log._infoOn) Log._info(TAG, id)

    let result = null
    try {
      result = await requestInternal(url, options.method, options.body, options.timeout, options.headers)
    } catch (e) {
      // Add the url to the request error
      e.message += `\n\n${options.method} ${url}`
      throw e
    }

    // Parse the result
    const { data, status, statusText } = result

    // Success
    if (status >= 200 && status < 300) return data

    // Error. Report it.
    const message = data && data.message ? (data.message.message || data.message) : data
    const reason = data && data.name && message ? `${data.name}: ${message}` : (data && data.name) || message
    throw new RequestError(reason, status, statusText, options.method, url)
  }

  const dedup = options.method === 'GET' && options.dedup ? _dedup : (cache, id, f) => f()
  const cache = options.method === 'GET' && !!options.cache ? _cache : (cache, id, ms, f) => f()
  const response = async f => options.response ? options.response(await f()) : await f()

  return await dedup(REQUESTS, id, async () => {
    return await cache(RESPONSES, id, options.cache, async () => {
      return await response(async () => {
        return await _retry(options.retries, id, async () => {
          return await singleRequest()
        })
      })
    })
  })
}

// ------------------------------------------------------------------------------------------------
// Internal request function
// ------------------------------------------------------------------------------------------------

/**
 * Makes an HTTP request.
 *
 * This is set differently for browser or node
 * @param {string} url Url to request
 * @param {string} method GET or POST
 * @param {?object} body Optional body for POST methods
 * @param {number} timeout Timeout in milliseconds
 * @param {object} headers Custom HTTP headers
 * @returns {Promise<{data, status, statusText}>} Response data, status code, and status message
 */
let requestInternal = null

// ------------------------------------------------------------------------------------------------
// Browser request function
// ------------------------------------------------------------------------------------------------

if (true) {
  requestInternal = async function (url, method, body, timeout, headers) {
    const { AbortController, fetch } = window

    // Make a copy of the headers, because we will change it
    headers = Object.assign({}, headers)

    const controller = new AbortController()
    headers.accept = 'application/json'

    const assumeJson = body && !headers['content-type']
    if (assumeJson) {
      headers['content-type'] = 'application/json'
      body = JSON.stringify(body)
    }

    const options = { method, body: body, headers, signal: controller.signal }
    let timedOut = false
    const timerId = setTimeout(() => { timedOut = true; controller.abort() }, _limit(timeout, 'timeout'))

    try {
      const res = await fetch(url, options)

      let data = null
      const contentTypeHeaders = res.headers.get('content-type')
      if (contentTypeHeaders && contentTypeHeaders.includes('application/json')) {
        data = await res.json()
      } else if (contentTypeHeaders && contentTypeHeaders.includes('application/octet-stream')) {
        data = await res.arrayBuffer()
        data = Buffer.from(data)
      } else {
        data = await res.text()
      }

      return { data, status: res.status, statusText: res.statusText }
    } catch (e) {
      if (timedOut) throw new TimeoutError(`Request timed out after ${timeout}ms`)
      throw e
    } finally {
      clearTimeout(timerId)
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Node request function
// ------------------------------------------------------------------------------------------------

if (false) {}

// ------------------------------------------------------------------------------------------------
// _retry
// ------------------------------------------------------------------------------------------------

/**
 *
 * @param {number} retries
 * @param {string} id String that uniquely identifies this request
 * @param {function} f Async function to perform
 * @returns {*} Result of the async function
 */
async function _retry (retries, id, f) {
  // Retries a single request
  for (let i = 0; i <= retries; i++) {
    try {
      return await f()
    } catch (e) {
      if (i === retries) throw e
      if (Log._warnOn) Log._warn(e.toString())
      if (Log._infoOn) Log._info(TAG, id, `(Retry ${i + 1}/${retries})`)
    }
  }
}

// ------------------------------------------------------------------------------------------------
// _dedup
// ------------------------------------------------------------------------------------------------

/**
 * Dedups async tasks that return the same value
 * @param {object} cache Cache to store duplicate task
 * @param {string} id String that uniquely identifies this request
 * @param {function} f Async function to perform
 * @returns {*} Result of the async function
 */
async function _dedup (cache, id, f) {
  const prev = cache[id]

  if (prev) {
    return new Promise((resolve, reject) => prev.push({ resolve, reject }))
  }

  const promises = cache[id] = []

  try {
    const result = await f()

    promises.forEach(x => x.resolve(result))

    return result
  } catch (e) {
    promises.forEach(x => x.reject(e))

    throw e
  } finally {
    delete cache[id]
  }
}

// ------------------------------------------------------------------------------------------------
// _cache
// ------------------------------------------------------------------------------------------------

/**
 * Caches the result or error of an async task for a period of time
 * @param {object} cache Cache to store results
 * @param {string} id String that uniquely identifies this task
 * @param {number} ms Milliseconds to cache the result
 * @param {function} f Async function to perform the task
 * @returns {*} Result of the async function
 */
async function _cache (cache, id, ms, f) {
  const now = Date.now()
  for (const cachedKey of Object.keys(cache)) {
    if (now > cache[cachedKey].expires) {
      delete cache[cachedKey]
    }
  }

  const prev = cache[id]
  if (prev && now < prev.expires) {
    if (prev.error) throw prev.error
    return prev.result
  }

  if (!ms) return await f()

  try {
    const result = await f()
    cache[id] = { expires: now + ms, result }
    return result
  } catch (error) {
    cache[id] = { expires: now + ms, error }
    throw error
  }
}

// ------------------------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------------------------

request.defaults = {}
request.defaults.method = 'GET'
request.defaults.body = undefined
request.defaults.headers = {}
request.defaults.timeout = 30000
request.defaults.retries = 2
request.defaults.dedup = true
request.defaults.cache = 0

// ------------------------------------------------------------------------------------------------

request._RequestError = RequestError
request._retry = _retry
request._dedup = _dedup
request._cache = _cache

module.exports = request

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(33).Buffer))

/***/ }),
/* 19 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * membrane.js
 *
 * A flexible proxy handler for jigs, code, berries, their owned inner objects, and method args.
 */

const { _admin, _sudo } = __webpack_require__(4)
const {
  _assert, _text, _hasOwnProperty, _setOwnProperty, _serializable, _serializableValue,
  _RESERVED_PROPS, _RESERVED_CODE_PROPS, _RESERVED_JIG_PROPS, _RESERVED_BERRY_PROPS,
  _FINAL_CODE_PROPS, _FINAL_JIG_PROPS, _FINAL_BERRY_PROPS,
  _getOwnProperty, _basicSet, _basicMap, _defined, _basicUint8Array
} = __webpack_require__(0)
const { _deterministicCompareKeys, _deterministicDefineProperty } = __webpack_require__(17)
const { _location, _owner, _satoshis, _LOCATION_BINDINGS, _UTXO_BINDINGS } = __webpack_require__(8)
const { _deepClone, _deepVisit, _deepReplace } = __webpack_require__(14)
const Sandbox = __webpack_require__(6)
const SI = Sandbox._intrinsics
const HI = Sandbox._hostIntrinsics
const Proxy2 = __webpack_require__(26)
const { _unifyForMethod } = __webpack_require__(32)
const Rules = __webpack_require__(22)
const Editor = __webpack_require__(9)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const RECORD = () => __webpack_require__(10)._CURRENT_RECORD
const STACK = () => RECORD()._stack

const CODE_METHOD = name => _sudo(() => Object.getPrototypeOf(__webpack_require__(1).prototype)[name])

let CODE_METHOD_NAME_CACHE
function CODE_METHOD_NAMES () {
  if (!CODE_METHOD_NAME_CACHE) {
    const proto = _sudo(() => Object.getPrototypeOf(__webpack_require__(1).prototype))
    CODE_METHOD_NAME_CACHE = Object.getOwnPropertyNames(proto).concat(Object.getOwnPropertySymbols(proto))
  }
  return CODE_METHOD_NAME_CACHE
}

// Objects that were assigned to the creation in one of its methods that is not yet finished.
// They are owned by the creation, but any gets should not return a proxy, because they
// need to match how they were assigned. Once all the creation methods complete, this
// set will be finalized and cleared, and future "gets" from other creations or the creation
// itself will be membranes. Inside pending is a membrane set under _membranes. There is also
// an _unbind boolean, as well as a _creation property for which jig is in pending.
let PENDING = null // { _membranes: Set, _unbind: boolean, _creation: Creation }

// ------------------------------------------------------------------------------------------------
// Membrane
// ------------------------------------------------------------------------------------------------

class Membrane {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (target, rules = new Rules()) {
    // Make sure the target really is a target
    _assert(!Proxy2._getTarget(target))

    // The proxy around the target that uses this membrane as its handler
    this._proxy = new Proxy2(target, this)

    // The rules for the membrane the determine the behavior below
    this._rules = rules

    // Determine the creation that the target is owned by
    this._creation = rules._creation || this._proxy

    // Proxies for inner objects so that we don't create new membranes
    if (!rules._creation) this._childProxies = new WeakMap() // Target -> Proxy

    // Return the proxy, not the membrane/handler, to the user
    return this._proxy
  }

  // --------------------------------------------------------------------------
  // Handlers
  // --------------------------------------------------------------------------

  _apply (target, thisArg, args) {
    if (this._isAdmin()) return Reflect.apply(target, thisArg, args)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Sidekick functions clear thisArg. It appears to be set by the sandbox. However, undefined
      // thisArg will be replaced with the global when in non-strict mode, so it is important
      // that all membraned functions operate in strict mode.
      // See https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Function/call`
      const functionRules = this._rules
      if (functionRules._thisless) thisArg = undefined

      // Calling a function requires a read of the code jig for the function
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      // Distinguish betweent the target and the function rules. Both matter in methods.
      let thisArgMembrane = Proxy2._getHandler(thisArg)
      let thisArgRules = thisArgMembrane && thisArgMembrane._rules

      // Detect pass-through functions, which do not wrap arguments or get added to the record.
      // Pass-through functions might be sidekick functions. This may also be be init() on the
      // jig itself. If there's no init() method on a jig, then by design init() is pass-through
      // and the top-level action is the "new" action. The same is true for init() on berries and
      // the pluck action. Thsi is because the base init() method on Jig and other native code
      // does not record calls.
      let passThrough = !thisArgMembrane || !thisArgRules._recordableTarget || !functionRules._recordCalls

      // If pass through, see if we can make it not pass through! This might happen if
      // we are calling a sidekick function, like MyToken.mint, on an uninstalled class.
      if (functionRules._autocode && passThrough && typeof thisArg === 'function') {
        thisArg = Editor._lookupOrCreateCode(thisArg)
        thisArgMembrane = Proxy2._getHandler(thisArg)
        thisArgRules = thisArgMembrane && thisArgMembrane._rules
        passThrough = !thisArgMembrane || !thisArgRules._recordableTarget || !functionRules._recordCalls
      }

      // Berries require special handling to not be passthrough because they are sidekick code
      // We should find a better way to do this.
      const Berry = __webpack_require__(13)
      if (thisArg instanceof Berry && target.name === 'init') passThrough = false

      // Check that this method isn't disabled, like happens with init() for jigs and berries
      const disabledMethods = thisArgMembrane && thisArgMembrane._rules._disabledMethods
      const disabled = disabledMethods && disabledMethods.includes(target.name)
      if (disabled) throw new Error(`${target.name} disabled`)

      // We can only call recordable calls on other jigs
      if (functionRules._recordCalls && !thisArgMembrane) {
        throw new Error(`Cannot call ${target.name} on ${_text(thisArg)}`)
      }

      // If this method is pass through, then we run it directly. This is used for
      // sidekick code and inner methods. They don't need special handling. For inner
      // property methods, like a.arr.find(...), any gets will be handled by _get and
      // _intrinsicOut, which will have ownership protection.
      if (passThrough) return Reflect.apply(target, thisArg, args)

      // Detect when we are entering this creation from outside the sandbox or from another creation
      const crossing = !thisArgMembrane._inside()

      return RECORD()._capture(() => {
        // If entering the creation from outside, deep clone the args and unify worldview.
        // We only need to do this once at the top level. Inner args will already be prepared.
        if (!STACK().length) args = prepareArgs(thisArg, args)

        // Even internal method args need to have serializable args. Maybe we'll loosen this later.
        if (STACK().length) checkSerializable(args)

        // Check that we have access. Private methods cannot be called even from outside.
        thisArgMembrane._checkNotPrivate(target.name, 'call')

        // Clone the args whenever we cross membranes. We do this even if they are from the
        // outside and already cloned in prepareArgs, because this protects the top-level action.
        const callArgs = crossing ? _sudo(() => _deepClone(args, SI)) : args

        // We will wrap the return value at the end
        let ret = null

        // Save pending in case we are crossing to restore back after
        const savedPending = PENDING

        try {
          if (crossing || !PENDING) {
            PENDING = { _membranes: new Set(), _unbind: false, _creation: thisArg }
          }

          const performCall = () => {
            // Get the method on the target object from its name. This also checks that the target
            // method is the same. We do this to allow for class unification on jig objects. As
            // long as a function with the same name exists, we allow it to be called.
            const latestFunction = getLatestFunction(thisArg, this._proxy)
            if (!latestFunction) throw new Error(`Cannot call ${target.name} on ${_text(thisArg)}`)

            // Extract the target and creation from the function
            const latestFunctionTarget = Proxy2._getTarget(latestFunction)
            const latestFunctionCreation = Proxy2._getHandler(latestFunction)._creation

            // Calling a function requires a read of the code jig being called
            // We perform this again in case it wasn't captured above.
            if (this._shouldRecordRead()) RECORD()._read(latestFunctionCreation)

            // Perform the method
            ret = Reflect.apply(latestFunctionTarget, thisArg, callArgs)

            // Async methods are not supported. Even though the serializability check will catch
            // this, we check for it specifically here to provide a better error message.
            const wasAsyncMethod = ret instanceof SI.Promise || ret instanceof HI.Promise
            if (wasAsyncMethod) throw new Error('async methods not supported')

            // Check that the return value is serializable as a precaution before wrapping
            // The method may be returning anything. Wrappers won't catch it all right away.
            checkSerializable(ret)

            // Wrap the return value so that the caller knows we own it
            ret = thisArgMembrane._return(ret, crossing)

            // The pending membranes may have properties that need to be claimed, or unserializable
            // properties that are really uncaught errors. Handle both when we cross back.
            if (crossing) thisArgMembrane._finalizePending()
          }

          // Perform the call, whether recorded or not
          const recorded = !thisArgMembrane._rules._unrecordedMethods ||
            !thisArgMembrane._rules._unrecordedMethods.includes(target.name)
          const Action = __webpack_require__(21)
          Action._call(thisArg, target.name, args, performCall, recorded)

          // As a safety check, as we are leaving this jig, check that any internal properties are
          // either targets, or they are creations. No proxies should be set internally. Because
          // otherwise, this will affect state generation. When confidence is 100%, we'll remove.
          if (crossing) {
            const Creation = __webpack_require__(3)
            _sudo(() => _deepVisit(Proxy2._getTarget(thisArg), x => {
              if (x instanceof Creation) return false // No traversing into other jigs
              _assert(!Proxy2._getTarget(x)) // All set properties must be targets
            }))
          }

          // Wrap the return value so the caller knows we own it
          return ret
        } finally {
          // No matter on error or not, save back pending before returning so membranes finalize
          PENDING = savedPending
        }
      })
    })
  }

  // --------------------------------------------------------------------------

  // Called when constructing arbitrary objects, and also jigs and berries. Construct is
  // pass-through. Jigs and berries have additional logic in their init() to become actions.

  _construct (target, args, newTarget) {
    if (this._isAdmin()) return Reflect.construct(target, args, newTarget)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Constructing an instance (a jig, a berry, or an arbitrary object), requires a read
      // of the class being constructed. If that constructor calls super, then it will read
      // the parent too, but to instantiate we only need to read the current class.
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      // Construct is passed through. We do not record constructions for replayability.
      // That is left up to the individual classes being created to record. For example,
      // the buit-in Jig class records the creation of new jigs, not this membrane.
      return Reflect.construct(target, args, newTarget)
    })
  }

  // --------------------------------------------------------------------------

  _defineProperty (target, prop, desc) {
    if (this._isAdmin()) return _deterministicDefineProperty(target, prop, desc)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Check if we can set this property
      this._checkCanChangeProp(prop, desc.value, 'define')

      // Only allow configurable, writable, enumerable value properties
      checkSetValidDescriptor(desc, true)

      // Defining a property requires an update to the jig
      if (this._shouldRecordUpdate()) RECORD()._update(this._creation)

      // Assign ownership of this value to ourselves, which may involve a copy
      desc.value = this._claim(desc.value)

      // When utxo bindings are set, the creation becomes unbound
      if (this._isUtxoBinding(prop)) PENDING._unbind = true

      // Define the property
      return _deterministicDefineProperty(target, prop, desc)
    })
  }

  // --------------------------------------------------------------------------

  _deleteProperty (target, prop) {
    if (this._isAdmin()) return Reflect.deleteProperty(target, prop)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      this._checkCanChangeProp(prop, undefined, 'delete')

      // Deleting a property requires an update to the jig
      if (this._shouldRecordUpdate()) RECORD()._update(this._creation)

      return Reflect.deleteProperty(target, prop)
    })
  }

  // --------------------------------------------------------------------------

  _get (target, prop, receiver) {
    if (this._isAdmin()) return Reflect.get(target, prop, receiver)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Code methods are returned directly. They are not reads since they don't change.
      // They also cannot be overriden, so we return them directly. The one exception
      // is Symbol.hasInstance, which our native Jig class overrides.
      const hasInstanceOverride = prop === Symbol.hasInstance &&
        target[Symbol.hasInstance] !== SI.Function.prototype[Symbol.hasInstance] &&
        target[Symbol.hasInstance] !== HI.Function.prototype[Symbol.hasInstance]
      if (this._isCodeMethod(prop) && !hasInstanceOverride) return CODE_METHOD(prop)

      // Unoverridable code, jig, or berry methods are not counted as reads
      if (this._isNativeProp(prop)) return Reflect.get(target, prop, receiver)

      // Make sure we are the class being read and not a child
      const isBinding = this._isLocationBinding(prop) || this._isUtxoBinding(prop)
      const differentReceiver = receiver !== this._proxy
      if (isBinding && differentReceiver) return undefined

      // Record this read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      // If this is a special property that we return directly, return it
      if (this._isPassThroughProp(prop)) return Reflect.get(target, prop, receiver)

      // Check if we are allowed to read this property
      this._checkCanGetProp(prop, 'get')

      // Read the value
      let value = Reflect.get(target, prop, receiver)
      if (!value) return value

      // Prepare the value for export
      const ownerCreation = this._getOwnerByName(prop)
      if (ownerCreation) value = Proxy2._getHandler(ownerCreation)._export(value)

      return value
    })
  }

  // --------------------------------------------------------------------------

  _getOwnPropertyDescriptor (target, prop) {
    if (this._isAdmin()) return Reflect.getOwnPropertyDescriptor(target, prop)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Props both final and reserved are never owned. They are also not reads.
      if (this._isNativeProp(prop)) return undefined

      // Record this read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      // If this is a special property that we return directly, return it
      if (this._isPassThroughProp(prop)) return Reflect.getOwnPropertyDescriptor(target, prop)

      // Check if we are allowed to read this property
      this._checkCanGetProp(prop, 'get descriptor for')

      // Read the descriptor
      const desc = Reflect.getOwnPropertyDescriptor(target, prop)
      if (!desc) return desc

      // Wrap this object with a membrane that enforces parent rules
      desc.value = this._export(desc.value)

      return desc
    })
  }

  // --------------------------------------------------------------------------

  _getPrototypeOf (target) {
    if (this._isAdmin()) return Reflect.getPrototypeOf(target)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Getting a prototype is a read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      return Reflect.getPrototypeOf(target)
    })
  }

  // --------------------------------------------------------------------------

  _has (target, prop) {
    if (this._isAdmin()) return Reflect.has(target, prop)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Checking a property is a read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      // Code, jig, and berry methods are part of the object, but not owned properties
      if (this._isFinalProp(prop)) return true

      // Check if we can access private properties
      this._checkNotPrivate(prop, 'check')

      // Some property names may be reserved for later, and no logic should depend on them
      this._checkNotReserved(prop, 'check')

      return Reflect.has(target, prop)
    })
  }

  // --------------------------------------------------------------------------

  _isExtensible (target) {
    if (this._isAdmin()) return Reflect.isExtensible(target)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Membrane targets are marked extensible by design. Immutability, if enabled, is enforced
      // in the membrane, not JavaScript, because non-extensibility can make JavaScript annoying.
      return true
    })
  }

  // --------------------------------------------------------------------------

  _ownKeys (target) {
    if (this._isAdmin()) return Reflect.ownKeys(target)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Getting key values is a read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)

      let keys = Reflect.ownKeys(target)

      // Always sort keys deterministically inside the membrane.
      keys = keys.sort(_deterministicCompareKeys)

      // Filter out private keys if we are not able to view them
      keys = keys.filter(key => this._hasPrivateAccess(key))

      return keys
    })
  }

  // --------------------------------------------------------------------------

  _preventExtensions (target) {
    if (this._isAdmin()) return Reflect.preventExtensions(target)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // This membrane does not support freezing the underlying object
      throw new Error('preventExtensions disabled')
    })
  }

  // --------------------------------------------------------------------------

  _set (target, prop, value, receiver) {
    // Using Reflect.set doesn't work. Parent proxies will intercept for classes.
    if (this._isAdmin()) { _setOwnProperty(target, prop, value); return true }

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // A creation may be trying to override a non-jig child class's sets
      if (receiver !== this._proxy) {
        _setOwnProperty(receiver, prop, value)
        return true
      }

      // Check if we can set this property
      this._checkCanChangeProp(prop, value, 'set')

      // Setting a value causes a spend
      if (this._shouldRecordUpdate()) RECORD()._update(this._creation)

      // Assign ownership this to ourselves, which may involve a copy
      value = this._claim(value)

      // When utxo bindings are set, the creation becomes unbound
      if (this._isUtxoBinding(prop)) PENDING._unbind = true

      // Using Reflect.set doesn't work. Parent proxies will intercept for classes.
      _sudo(() => _setOwnProperty(target, prop, value))

      return true
    })
  }

  // --------------------------------------------------------------------------

  _setPrototypeOf (target, prototype) {
    if (this._isAdmin()) return Reflect.setPrototypeOf(target, prototype)

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Changing prototypes is something only Run can do by design
      throw new Error('setPrototypeOf disabled')
    })
  }

  // --------------------------------------------------------------------------

  _intrinsicGetMethod () {
    if (this._isAdmin()) return

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Getting a method, even on an intrinsic, is a read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)
    })
  }

  // --------------------------------------------------------------------------

  _intrinsicOut (value) {
    if (this._isAdmin()) return value

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Wrap this object with a membrane that enforces parent rules
      return this._export(value)
    })
  }

  // --------------------------------------------------------------------------

  _intrinsicIn (value) {
    if (this._isAdmin()) return value

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Make sure this value is serializable
      checkSerializable(value)

      // Assign ownership of this value to ourselves, which may involve a copy
      value = this._claim(value)

      return value
    })
  }

  // --------------------------------------------------------------------------

  _intrinsicRead () {
    if (this._isAdmin()) return

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Getting a inner stored value, even on an intrinsic, is a read
      if (this._shouldRecordRead()) RECORD()._read(this._creation)
    })
  }

  // --------------------------------------------------------------------------

  _intrinsicUpdate () {
    if (this._isAdmin()) return

    return this._captureRecordErrors(() => {
      this._throwCreationError()

      // Updating a inner stored value, even on an intrinsic, is an update
      if (this._shouldRecordUpdate()) RECORD()._update(this._creation)

      // Check that the jig is updatable
      this._checkChangable('update', _text(this._creation))
    })
  }

  // --------------------------------------------------------------------------
  // _captureRecordErrors
  // --------------------------------------------------------------------------

  // Handler errors should not be caught by internal creation code because they are not part of
  // consensus. If they happen, we detect them ourselves to prevent them from being swallowed
  // and always rethrow them within the current action.
  _captureRecordErrors (f) {
    const CURRENT_RECORD = RECORD()

    try {
      const ret = f()
      // Check if there is an error again after the action to rethrow
      if (CURRENT_RECORD._error) throw CURRENT_RECORD._error

      // No error. Return the return value
      return ret
    } catch (e) {
      // Store the first error we see while in a method. They will get thrown on every handler hereafter.
      if (CURRENT_RECORD._stack.length && !CURRENT_RECORD._error) {
        CURRENT_RECORD._error = e
      }

      // Throw this error up to the outer action if there is one
      throw e
    }
  }

  // --------------------------------------------------------------------------
  // _throwCreationError
  // --------------------------------------------------------------------------

  // Every trap checks if the creation in an error state from a prior action. A creation will go
  // into an error state if the user fails to sync and there was an error while publishing.
  _throwCreationError () {
    // If location is not defined, then we are setting up the creation and not in an error state.
    // For example, toString() should still be allowed to be called when setting up.
    const creationTarget = Proxy2._getTarget(this._creation)
    if (!_hasOwnProperty(creationTarget, 'location')) return

    // Undeployed jigs can still be used because they will be deployed after the action completes.
    const { _error, _undeployed } = _location(creationTarget.location)
    if (_error && !_undeployed) throw new Error(_error)
  }

  // --------------------------------------------------------------------------
  // _checkCanChangeProp
  // --------------------------------------------------------------------------

  _checkCanChangeProp (prop, value, method) {
    // Prototype cannot be set directly
    if (prop === '__proto__') throw new Error(`${method} __proto__ disabled`)

    // Ensure the the property name is not a symbol
    if (typeof prop === 'symbol') throw new Error(`Cannot ${method} symbol property`)

    // Code, jig, and berry methods are permanent and cannot be overridden
    if (this._isFinalProp(prop)) throw new Error(`Cannot ${method} ${prop}: reserved`)

    // If this is a code option, check that it is a valid value
    this._checkCanChangeCodeOption(prop, value, method)

    // Only some bindings may be set by jig code
    this._checkCanChangeLocationBinding(prop, value, method)
    this._checkCanChangeUtxoBinding(prop, value, method)

    // Some property names may be reserved for later
    this._checkNotReserved(prop, method)

    // Check if we can set a private property
    this._checkNotPrivate(prop, method)

    // Check that the creation can be changed at all
    this._checkChangable(method, prop)

    // Ensure the the property value is serializable
    checkSerializable(value)
  }

  // --------------------------------------------------------------------------
  // _checkChangable
  // --------------------------------------------------------------------------

  _checkChangable (method, prop) {
    // Enforce immutability for static and native code
    if (this._rules._immutable) throw new Error(`Cannot ${method} ${prop}: immutable`)

    // Updates must be performed in one of the jig's methods
    this._checkIfSetInMethod()

    // The creation must not be unbound in its record
    if (RECORD()._unbound._has(this._creation)) throw new Error(`Cannot ${method} ${prop}: unbound`)
  }

  // --------------------------------------------------------------------------
  // _checkCanGetProp
  // --------------------------------------------------------------------------

  _checkCanGetProp (prop, method) {
    // Bindings are not always readable
    this._checkCanGetLocationBinding(prop)
    this._checkCanGetUtxoBinding(prop)

    // Check if we can access if it is a private property
    this._checkNotPrivate(prop, method)

    // Some property names may be reserved for later.
    // Reading them before they exist might break consensus.
    this._checkNotReserved(prop, method)
  }

  // --------------------------------------------------------------------------
  // _isPassThroughProp
  // --------------------------------------------------------------------------

  _isPassThroughProp (prop) {
    // Function prototypes must be returned directly. No wrapping. Run handles.
    if (typeof this._proxy === 'function' && prop === 'prototype') return true

    // Same for constructor
    if (prop === 'constructor') return true

    // Symbol properties are passed through because they aren't settable by the user
    if (typeof prop === 'symbol') return true

    return false
  }

  // --------------------------------------------------------------------------
  // _checkCanGetLocationBinding
  // --------------------------------------------------------------------------

  _checkCanGetLocationBinding (prop) {
    // Inner objects don't have bindings. Berry locations aren't mutable.
    if (!this._isLocationBinding(prop)) return

    try {
      const target = Proxy2._getTarget(this._proxy)

      // Check location, origin, or nonce. These are assigned by Run.
      if (prop === 'location' || prop === 'origin' || prop === 'nonce') {
        const val = Reflect.get(target, prop)

        // Treat nonce the same as location for determining readability
        const loc = _location(prop === 'nonce' ? target.location : val)

        if (_defined(loc._undeployed)) throw new Error('Hint: Sync the jig to deploy it')
        if (_defined(loc._error)) throw new Error(`A previous error occurred\n\n${loc._error}`)

        // Native code bindings can always be read
        if (_defined(loc._native)) return

        // If no txid, then the location is not determined.  The jig is in a pending commit.
        // Jig code won't encounter this but it protects users from getting temp locs.
        if (!_defined(loc._txid)) throw new Error('Hint: Sync the jig to assign it in a transaction')

        // Partial locations are unreadable
        if (_defined(loc._berry) && !_defined(loc._hash)) throw new Error()
      }
    } catch (e) {
      throw new Error(`Cannot read ${prop}${e.message ? '\n\n' + e.message : ''}`)
    }
  }

  // --------------------------------------------------------------------------
  // _checkCanGetUtxoBinding
  // --------------------------------------------------------------------------

  _checkCanGetUtxoBinding (prop) {
    // Inner objects don't have bindings. Berry locations aren't mutable.
    if (!this._isUtxoBinding(prop)) return

    try {
      const target = Proxy2._getTarget(this._proxy)

      // Check owner or satoshis. These are assigned by users and by Run.
      if (prop === 'owner' || prop === 'satoshis') {
        const value = Reflect.get(target, prop)

        const undetermined = typeof value === 'undefined'
        if (undetermined) throw new Error('Hint: Sync the jig to bind it in a transaction')

        const allowNull = true
        if (prop === 'owner') _owner(value, allowNull)

        const allowMaxInt = true
        if (prop === 'satoshis') _satoshis(value, allowMaxInt)
      }
    } catch (e) {
      throw new Error(`Cannot read ${prop}\n\n${e.message}`)
    }
  }

  // --------------------------------------------------------------------------
  // _checkCanChangeLocationBinding
  // --------------------------------------------------------------------------

  _checkCanChangeLocationBinding (prop, value, method) {
    // Inner objects can have properties with binding names set, but only Run
    // Run can set the origin, location and nonce on the creation.
    if (this._isLocationBinding(prop)) throw new Error(`Cannot ${method} ${prop}`)
  }

  // --------------------------------------------------------------------------
  // _checkCanChangeUtxoBinding
  // --------------------------------------------------------------------------

  _checkCanChangeUtxoBinding (prop, value, method) {
    // Inner objects can have properties with binding names set
    if (!this._isUtxoBinding(prop)) return

    // Prevent deleting any utxo bindings
    if (method === 'delete') throw new Error(`Cannot ${method} ${prop}`)

    // Once the jig is destroyed, UTXO bindings cannot change anymore
    if (this._deleted()) throw new Error(`Cannot ${method} ${prop}`)

    // Check the value being set is valid. Users cannot set owners to null, only Run.
    const allowNull = false
    if (prop === 'owner') _owner(value, allowNull)
    if (prop === 'satoshis') _satoshis(value)
  }

  // --------------------------------------------------------------------------
  // _checkCanChangeCodeOption
  // --------------------------------------------------------------------------

  _checkCanChangeCodeOption (prop, value, method) {
    if (!this._rules._codeProps) return
    if (prop === 'sealed' && method !== 'delete') Editor._checkSealedOption(value)
    if (prop === 'upgradable' && method !== 'delete') Editor._checkUpgradableOption(value)
    if (prop === 'interactive' && method !== 'delete') Editor._checkInteractiveOption(value)
  }

  // --------------------------------------------------------------------------
  // _checkNotReserved
  // --------------------------------------------------------------------------

  _checkNotReserved (prop, method) {
    if (!this._rules._reserved) return
    const throwReservedError = () => {
      const error = `Cannot ${method} ${typeof prop === 'symbol' ? prop.toString() : prop}: reserved`
      throw new Error(error)
    }
    if (_RESERVED_PROPS.includes(prop)) throwReservedError()
    if (this._rules._jigProps && _RESERVED_JIG_PROPS.includes(prop)) throwReservedError()
    if (this._rules._codeProps && _RESERVED_CODE_PROPS.includes(prop)) throwReservedError()
    if (this._rules._berryProps && _RESERVED_BERRY_PROPS.includes(prop)) throwReservedError()
  }

  // --------------------------------------------------------------------------
  // _checkNotPrivate
  // --------------------------------------------------------------------------

  _checkNotPrivate (prop, method) {
    const calling = method === 'call'
    const type = calling ? 'method' : 'property'
    const noAccess = !this._hasPrivateAccess(prop, calling)
    if (noAccess) throw new Error(`Cannot ${method} private ${type} ${prop}`)
  }

  // --------------------------------------------------------------------------
  // _hasPrivateAccess
  // --------------------------------------------------------------------------

  _hasPrivateAccess (prop, calling = false) {
    // Targets without private properties are always accessible
    if (!this._rules._privacy) return true

    // If this doesn't start with an unscore, its accessible
    if (typeof prop !== 'string' || !prop.startsWith('_')) return true

    // Prototype can always be retrieved
    if (prop === '__proto__') return true

    const Jig = __webpack_require__(7)
    const Berry = __webpack_require__(13)
    const stack = STACK()

    // Outside of a jig, private properties are always accessible.
    // Private methods however cannot be called even from outside.
    if (!stack.length) return !calling

    // Get the top of the stack
    const accessor = stack[stack.length - 1]

    // For jig code, the current class may access its private properties.
    // Also, any jig instances may call private methods on the jig class,
    // because they share the same code.
    if (typeof this._creation === 'function') {
      return accessor === this._creation || accessor.constructor === this._creation
    }

    // Handle jig and berry instances. Other kinds of proxies should not be here.
    _assert(this._creation instanceof Jig || this._creation instanceof Berry)

    // For jig instances, jigs of the same jig class may access the private properties.
    // Also, the jig class may access private properties of its instances. Same for berries.
    return accessor.constructor === this._creation.constructor ||
      accessor === this._creation.constructor
  }

  // --------------------------------------------------------------------------
  // _checkIfSetInMethod
  // --------------------------------------------------------------------------

  _checkIfSetInMethod () {
    if (!this._rules._smartAPI) return
    if (this._inside()) return
    throw new Error(`Attempt to update ${_text(this._creation)} outside of a method`)
  }

  // --------------------------------------------------------------------------
  // _export
  // --------------------------------------------------------------------------

  _export (value) {
    // Primitives are returned directly
    if (isBasicType(value)) return value

    // Creations are returned directly
    const Creation = __webpack_require__(3)
    if (value instanceof Creation) return value

    // If this was just created and claimed, and we're still inside the frame that created it,
    // then don't add a membrane. This ensures the following:
    //
    //    method() {
    //      const x = { }       // create local
    //      this.x = x          // claim it
    //      x === this.x        // true
    //    }
    //
    if (this._pending(value)) return value

    // Claimed and either not pending or exporting outside. Add our rules.
    return this._addParentRules(value)
  }

  // --------------------------------------------------------------------------
  // _return
  // --------------------------------------------------------------------------

  _return (value, crossing, unclaimed = new Set()) {
    // If this is a primitive type, it can't have a membrane
    if (isBasicType(value)) return value

    // If we've already detected this value is unclaimed, perhaps in a circular data structure,
    // then we should return it directly. Claimed values will not be recursing this way.
    if (unclaimed.has(value)) return value

    // If it already has a membrane, which will happen for prototype methods on native code,
    // and properties of other jigs, and also creations, then return it directly, because
    // it doesn't need additional wrapping. It'll be self-protected.
    if (Proxy2._getTarget(value)) return value

    // We know it has no membrane. Get whether we've already claimed it as ours.
    const pending = this._pending(value)

    // If this value is unclaimed, then we'll leave it intact, but we need to check inner objects
    // that might have gone undetected and if any are claimed then wrap them. Shallow replace is
    // essentially breadth-first traversal, which is what we want. We want to early-out as soon
    // as we hit a claimed object to wrap, because it'll wrap its sub-objects.
    if (!pending) {
      unclaimed.add(value)
      const wrapInner = x => this._return(x, crossing, unclaimed)
      _sudo(() => shallowReplace(value, wrapInner))
      return value
    }

    // If pending and returning internally to another of our method, then no membrane
    if (!crossing && pending) return value

    // Claimed and either not pending or exporting outside. Add our rules.
    return this._addParentRules(value)
  }

  // --------------------------------------------------------------------------
  // _addParentRules
  // --------------------------------------------------------------------------

  _addParentRules (value) {
    // Primitive types need no membranes
    if (isBasicType(value)) return value

    // If this value is already wrapped, then we won't wrap it again
    // This applies to creations and also prototype methods.
    if (Proxy2._getTarget(value)) return value

    // If we've already created a membrane for this target, return that one
    const childProxies = this._creationChildProxies()
    if (childProxies.has(value)) return childProxies.get(value)

    // Create a new membrane
    const method = typeof value === 'function'
    const rules = Rules._childProperty(this._creation, method)
    const proxy = new Membrane(value, rules)

    // Save the membrane to avoid dedups
    childProxies.set(value, proxy)

    return proxy
  }

  // --------------------------------------------------------------------------
  // _claim
  // --------------------------------------------------------------------------

  // Take ownership of the object and return it as an unproxied target suitable for storage
  _claim (value) {
    // Basic objects are never replaced because they are passed by value
    if (isBasicType(value)) return value

    // If this is a top-level jig, then it has its own owner
    const Creation = __webpack_require__(3)
    if (value instanceof Creation) return value

    const membrane = Proxy2._getHandler(value)
    const target = Proxy2._getTarget(value) || value

    // If there is no membrane, then we're dealing with a newly created object in the
    // jig's method, an unclaimed returned from another jig, or an object passed from
    // the user realm. In all cases, we take ownership by marking it pending. Objects inside
    // may be anything, but because once it goes pending it won't have a wrapper, we treat
    // all objects inside a pending object as unknown. Finalize will fix them. If we were to
    // dive recursively and remove membranes, we would mistakenly think values are pending
    // in future calls that aren't! We need to keep the membranes if they are in a pending.
    if (!membrane) {
      if (STACK().length && PENDING._membranes) PENDING._membranes.add(target)
      return target
    }

    // We already own it, so nothing to do. Its internals will already be ours.
    if (membrane._rules._creation === this._creation) return target

    // If the value is owned by another jig, make a clone. A new membrane will be created when
    // it is read. Do this without _sudo so that we can filter out private properties. We don't
    // actually need to record reads, because we would have done it already.
    return _deepClone(membrane._proxy, SI)
  }

  // --------------------------------------------------------------------------
  // _getOwnerByName
  // --------------------------------------------------------------------------

  // Determines the owner. The owner may be on a prototype. Assumes it exists.
  _getOwnerByName (prop) {
    let creation = this._creation
    let container = this._proxy

    // Walk up the prototype chain to find our prop. These will read.
    while (!_hasOwnProperty(container, prop)) {
      container = Object.getPrototypeOf(container)

      // The property should always exist if we are in this method
      _assert(container)

      // Get the class if we are on its prototype
      creation = typeof container === 'object' ? container.constructor : container

      // Make sure it is a creation. If not, it's an intrinsic like Object or Function, not a creation.
      const Creation = __webpack_require__(3)
      if (!(creation instanceof Creation)) creation = null

      // Because the prototype chain is not membraned, we record reads manually
      if (creation && this._shouldRecordRead() && Proxy2._getHandler(creation)._shouldRecordRead()) {
        RECORD()._read(creation)
      }
    }

    return creation
  }

  // --------------------------------------------------------------------------
  // _finalizePending
  // --------------------------------------------------------------------------

  _finalizePending () {
    _assert(PENDING)

    // Walk through all inner properties of the pending membranes and make sure
    // their values are allowed, performing the same checks we would do in "set".
    // This has to be done at the end of a method because for pending membranes the
    // user is able to directly set values without checks and we can't stop that then.
    _deepReplace(PENDING._membranes, (x, recurse) => {
      // x must be serializable on its own. Ignore deep serializability, because deepReplace.
      if (!_serializableValue(x)) throw new Error(`Not serializable: ${_text(x)}`)

      // Primitives are always safe
      if (isBasicType(x)) return

      // Creations are left intact, and we don't recurse into them, because
      // we are only considering pending membranes on the current jig.
      const Creation = __webpack_require__(3)
      if (x instanceof Creation) { recurse(false); return }

      // Check that the object has only valid names - no reserved, symbols, getters, etc.
      checkValidPropFields(x)

      // Non-proxied objects are left intact, but we have to traverse to check their inners.
      // These would be objects created or unclaimed from another jig, and then assigned in the
      // current method.
      const xmembrane = Proxy2._getHandler(x)
      if (!xmembrane) { recurse(true); return }

      // We know it is proxied either from us or from another creation
      const target = Proxy2._getTarget(x)

      // By having a membrane, one of our invariants is that we know the target was already
      // checked for serializability. Therefore, we don't need to recurse.
      recurse(false)

      // If its ours, remove the membrane and assign. We only store targets.
      if (xmembrane._rules._creation === this._creation) return target

      // The creation is not ours. It must be a property from another jig. We clone it.
      // Don't use _sudo() because this allows us to filter out private properties.
      return _deepClone(xmembrane._proxy, SI)
    })

    // Deleted creations are by definition unbound
    if (this._deleted()) PENDING._unbind = true

    // If either the owner or satoshis were changed, the creation becomes unbound
    if (PENDING._unbind) RECORD()._unbind(this._creation)
  }

  // --------------------------------------------------------------------------
  // _pending
  // --------------------------------------------------------------------------

  _pending (value) {
    // If we have no pending set, and not in a method, then value can't be pending
    if (!PENDING) return false

    // If the value has a proxy, it can't be pending. Pending is only for new objects.
    if (Proxy2._getTarget(value)) return false

    // The pending membrane set is only valid for the creation at the top of the stack
    const stack = RECORD()._stack
    const inside = stack.length && stack[stack.length - 1] === this._creation
    if (!inside) return false

    // Return claimed and pending membranes we know about. We might not know them all.
    if (PENDING._membranes.has(value)) return true

    // We may have assigned to a pending claim. It would not be in our PENDING membranes set,
    // so we must deep traverse to see if its ours. As we traverse, if we hit another
    // proxy object, we can stop, because any pending values that were assigned to that
    // proxy would already be accessible from non-pending objects in the PENDING membranes set.
    // This includes creations.
    let pending = false
    _deepVisit(PENDING._membranes, x => {
      if (pending) return false // Stop traversing once we know we're pending
      if (Proxy2._getTarget(x)) return false
      if (x === value) { pending = true; return false }
    })

    // Save pending for quicker checks later
    if (pending) PENDING._membranes.add(value)

    return pending
  }

  // --------------------------------------------------------------------------
  // Misc Helpers
  // --------------------------------------------------------------------------

  _isAdmin () { return this._rules._admin && _admin() }
  _isCodeMethod (prop) { return this._rules._codeProps && CODE_METHOD_NAMES().includes(prop) }
  _isFinalProp (prop) { return this._isFinalCodeProp(prop) || this._isFinalJigProp(prop) || this._isFinalBerryProp(prop) }
  _isFinalCodeProp (prop) { return this._rules._codeProps && _FINAL_CODE_PROPS.includes(prop) }
  _isFinalJigProp (prop) { return this._rules._jigProps && _FINAL_JIG_PROPS.includes(prop) }
  _isFinalBerryProp (prop) { return this._rules._berryProps && _FINAL_BERRY_PROPS.includes(prop) }
  _isNativeProp (prop) {
    return (this._isFinalCodeProp(prop) && _RESERVED_CODE_PROPS.includes(prop)) ||
        (this._isFinalJigProp(prop) && _RESERVED_JIG_PROPS.includes(prop)) ||
        (this._isFinalBerryProp(prop) && _RESERVED_BERRY_PROPS.includes(prop))
  }

  _shouldRecordRead () { return this._rules._recordReads && STACK().length }
  _shouldRecordUpdate () { return this._rules._recordUpdates && STACK().length }
  _isLocationBinding (prop) { return this._rules._locationBindings && _LOCATION_BINDINGS.includes(prop) }
  _isUtxoBinding (prop) { return this._rules._utxoBindings && _UTXO_BINDINGS.includes(prop) }
  _inside () { const s = STACK(); return s.length && s[s.length - 1] === this._creation }

  _creationChildProxies () { return Proxy2._getHandler(this._creation)._childProxies }
  _deleted () {
    const target = Proxy2._getTarget(this._creation)
    return target.owner === null && target.satoshis === 0
  }

  _pendingUnbind () { return PENDING && PENDING._creation === this._creation && PENDING._unbind }
}

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

function isBasicType (value) {
  const basicTypes = ['undefined', 'boolean', 'number', 'string', 'symbol']
  return basicTypes.includes(typeof value) || value === null
}

// ------------------------------------------------------------------------------------------------

function checkSetValidDescriptor (desc, mustBeConfigurable = true) {
  // On Chrome and Firefox, properties are copied from their existing descriptor.
  // On Safari, properties must be specified. We require Safari's conservative behavior.

  if (!('value' in desc)) throw new Error('Descriptor must have a value')
  if ('get' in desc) throw new Error('Getters are not supported')
  if ('set' in desc) throw new Error('Getters are not supported')
  if (mustBeConfigurable && !desc.configurable) throw new Error('Descriptor must be configurable')
  if (!desc.writable) throw new Error('Descriptor must be writable')
  if (!desc.enumerable) throw new Error('Descriptor must be enumerable')
}

// ------------------------------------------------------------------------------------------------

function checkSerializable (value) {
  if (!_serializable(value)) throw new Error(`Not serializable: ${_text(value)}`)
}

// ------------------------------------------------------------------------------------------------

function checkValidPropFields (x) {
  _sudo(() => {
    // Symbol properties are allowed because we cannot serialize them
    const symbols = Object.getOwnPropertySymbols(x).length
    if (symbols) throw new Error('Symbol properties not supported')

    // Array length is non-configurable and non-enumerable and allowed
    const filter = []
    if (x instanceof SI.Array || x instanceof HI.Array) filter.push('length')

    // Uint8array elements should all be configurable when returned.
    // See: 2020-10-17 https://webkit.googlesource.com/WebKit/+/master/Source/JavaScriptCore/ChangeLog
    // See: Description https://github.com/tc39/ecma262/pull/2164
    // Still, node.js and some browsers return non-configurable entries, even though they may be changed.
    const mustBeConfigurable = !_basicUint8Array(x)

    // Getters and setters are not supported
    Object.getOwnPropertyNames(x)
      .filter(name => !filter.includes(name))
      .map(name => Object.getOwnPropertyDescriptor(x, name))
      .forEach(desc => checkSetValidDescriptor(desc, mustBeConfigurable))
  })
}

// ------------------------------------------------------------------------------------------------

function getLatestFunction (thisArg, functionProxy) {
  // No this, then we are always the latest
  if (!thisArg) return functionProxy

  // Only creations can have creation methods called on them
  const Creation = __webpack_require__(3)
  if (!(thisArg instanceof Creation)) return null

  const functionTarget = Proxy2._getTarget(functionProxy)
  const functionName = functionTarget.name

  // If a method of this name is not on the this target, then we can't call it
  if (typeof thisArg[functionName] !== 'function') return null

  // If this is our method, then we can call it
  if (thisArg[functionName] === functionProxy) return functionProxy

  const functionCreation = Proxy2._getHandler(functionProxy)._creation
  const functionCreationOrigin = _sudo(() => functionCreation.origin)
  const functionCreationNonce = _sudo(() => functionCreation.nonce)

  const thisArgMembrane = Proxy2._getHandler(thisArg)
  const thisArgFunctionCreation = thisArgMembrane._getOwnerByName(functionName)
  const thisArgFunctionCreationOrigin = _sudo(() => thisArgFunctionCreation.origin)
  const thisArgFunctionCreationNonce = _sudo(() => thisArgFunctionCreation.nonce)

  // If thisArg's class was replaced with a newer version of the function, check that the
  // origins are the same, and that we aren't using an older version! Then we can use it.
  if (thisArgFunctionCreationOrigin === functionCreationOrigin) {
    if (thisArgFunctionCreationNonce < functionCreationNonce) throw new Error('Method time travel')
    return thisArg[functionName]
  }

  // The method we are trying to call is not the one on the creation's public API. It may be
  // a super method, which we allow only from inside the current jig.

  // Check if we are inside one of the current jig's methods.
  const stack = RECORD()._stack
  const inside = stack.length >= 2 && stack[stack.length - 2] === thisArg
  if (!inside) return null

  // We are inside, so now find out if this method is in our class chain
  let prototype = Object.getPrototypeOf(thisArg)
  while (prototype) {
    const prototypeMethod = _getOwnProperty(prototype, functionName)
    if (prototypeMethod === functionProxy) return prototypeMethod

    // If the method was upgraded on a parent but its still part of the same class, we can call it
    const prototypeMethodContainer = typeof prototype === 'function' ? prototype : prototype.constructor

    if (prototypeMethod && _sudo(() => prototypeMethodContainer.origin === functionCreationOrigin)) {
      _sudo(() => {
        if (prototypeMethodContainer.nonce < functionCreationNonce) throw new Error('Method time travel')
      })
      return prototypeMethod
    }

    prototype = Object.getPrototypeOf(prototype)
  }

  // Attempt to call a method that is not our own
  return null
}

// ------------------------------------------------------------------------------------------------

function prepareArgs (thisArg, args) {
  const Code = __webpack_require__(1)

  // If thisArg is already code, make sure its deployed
  if (thisArg instanceof Code) Editor._get(thisArg)._deploy()

  // Clone the value using sandbox intrinsics
  const Creation = __webpack_require__(3)
  const clonedArgs = _deepClone(args, SI, x => {
    if (typeof x === 'function' && !(x instanceof Creation)) {
      const C = Editor._lookupOrCreateCode(x)
      Editor._get(C)._deploy()
      return C
    }

    // If x is already code, make sure its deployed
    if (x instanceof Code) Editor._get(x)._deploy()
  })

  _unifyForMethod([thisArg, clonedArgs], [thisArg])

  return clonedArgs
}

// ------------------------------------------------------------------------------------------------

function shallowReplace (x, replacer) {
  Object.keys(x).forEach(name => {
    _setOwnProperty(x, name, replacer(x[name]))
  })

  if (_basicSet(x)) {
    const values = Array.from(x.values())
    x.clear()
    values.forEach(value => x.add(replacer(value)))
  }

  if (_basicMap(x)) {
    const entries = Array.from(x.entries())
    x.clear()
    entries.forEach(([key, value]) => x.set(replacer(key), replacer(value)))
  }
}

// ------------------------------------------------------------------------------------------------

Membrane._prepareArgs = prepareArgs

module.exports = Membrane


/***/ }),
/* 20 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * publish.js
 *
 * Creates and broadcasts a transaction for a commit
 */

const bsv = __webpack_require__(5)
const _load = __webpack_require__(16)
const { _assert, _text, _bsvNetwork, _Timeout, _defined } = __webpack_require__(0)
const { _deterministicJSONStringify } = __webpack_require__(17)
const { _sha256 } = __webpack_require__(12)
const { _deepClone, _deepVisit } = __webpack_require__(14)
const Log = __webpack_require__(2)
const Json = __webpack_require__(23)
const { _calculateDust } = __webpack_require__(12)
const { _location, _owner } = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const SerialTaskQueue = __webpack_require__(51)
const SI = __webpack_require__(6)._sandboxIntrinsics
const { _getMetadataVersion } = __webpack_require__(15)
const Editor = __webpack_require__(9)
const Record = __webpack_require__(10)
const CreationSet = __webpack_require__(25)
const { Transaction, Script } = bsv

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Publish'

// Serializes the assignment of new owners to prevent circular dependencies
const OWNER_SAFETY_QUEUE = new SerialTaskQueue()

// Serializes a portion of the publish function for purses to work more reliably
const PURSE_SAFETY_QUEUE = new SerialTaskQueue()

// ------------------------------------------------------------------------------------------------
// _publish
// ------------------------------------------------------------------------------------------------

async function _publish (commit) {
  try {
    if (Log._debugOn) Log._debug(TAG, 'Publish', commit._record._id)

    const start = new Date()
    const kernel = commit._kernel
    const record = commit._record

    if (!commit._publishing()) commit._setPublishing(true)

    // Create a timeout
    const timeout = new _Timeout('publish', kernel._timeout)

    // Assigns initial owners in the jigs after snapshots
    await assignInitialOwners(commit)
    timeout._check()

    // Generate the output scripts which might add new refs
    const outputScripts = await generateOutputScripts(commit)
    timeout._check()

    // Verify no referenced jigs are older than prior references
    await checkNoTimeTravel(commit, timeout)
    timeout._check()

    // Make owners and satoshis bound properties
    finalizeOwnersAndSatoshis(commit)

    // Create the sorted master list used to serialize actions
    const masterList = createMasterList(record)

    // Calculate the serialized states of output and deleted jigs
    const states = await captureStates(commit, timeout)
    timeout._check()

    // Calculate state hashes
    const hashes = await hashStates(commit, states)

    // Convert the actions to executable statements
    const exec = createExec(record, masterList)

    // Create the OP_RETURN metadata json
    const metadata = createMetadata(commit, hashes, exec, masterList)

    // Create the unpaid and unsigned tx
    const feePerKb = bsv.Transaction.FEE_PER_KB
    const partialtx = createPartialTx(commit, metadata, outputScripts, feePerKb)

    // Preverify the transaction we generated so we have some assurance it will load.
    // This is a safety check for Run bugs. It is not intended to catch consensus failures.
    await preverify(kernel, record, states, metadata, partialtx, timeout)
    timeout._check()

    // Serialize from pay to broadcast because the purse may consume outputs that should not be
    // consumed again in another parallel publish, but the purse may not mark them as spent right
    // away. In the future we might consider making this serialization optional for smarter purses.
    const txid = await PURSE_SAFETY_QUEUE._enqueue(async () => {
      // Add inputs and outputs to pay for the transaction
      const paidtx = await payForTx(partialtx, commit, feePerKb)
      timeout._check()

      let signedtx = null

      try {
        // Sign the jig owners
        signedtx = await signTx(paidtx, commit, feePerKb)
        timeout._check()

        // Check that we have all signatures and the tx didn't change
        checkTx(signedtx, record, partialtx)
      } catch (e) {
        try {
          await cancelPaidTx(paidtx, kernel._purse)
        } catch (e) {
          if (Log._errorOn) Log._error(TAG, e)
        }
        throw e
      }

      // Broadcast
      let txid = null
      try {
        txid = await broadcastTx(commit, signedtx, timeout)
      } catch (e) {
        try {
          await cancelPaidTx(paidtx, kernel._purse)
        } catch (e) {
          if (Log._errorOn) Log._error(TAG, e)
        }
        throw e
      }

      const badTxid = typeof txid !== 'string' || txid.length !== 64
      if (badTxid) throw new Error(`Invalid txid: ${_text(txid)}`)

      timeout._check()

      return txid
    })
    timeout._check()

    // Apply bindings to output and deleted jigs and their after snapshots
    finalizeLocationsAndOrigins(commit, txid)

    // Add to cache, both outputs and deleted states
    await cacheStates(commit, states, txid)
    timeout._check()

    // Add this txid to the trusted set if there were any deploys or upgrades
    const anythingToTrust =
      metadata.exec.some(action => action.op === 'DEPLOY') ||
      metadata.exec.some(action => action.op === 'UPGRADE')

    if (anythingToTrust) {
      kernel._trustlist.add(txid)
    }

    commit._onPublishSucceed()

    if (Log._debugOn) Log._debug(TAG, 'Publish (end): ' + (new Date() - start) + 'ms')
  } catch (e) {
    commit._onPublishFail(e)
  }
}

// ------------------------------------------------------------------------------------------------

async function checkNoTimeTravel (commit, timeout) {
  const refmap = await commit._buildRefmap()

  const record = commit._record

  for (const jig of record._refs) {
    const before = record._before.get(jig)

    if (!(before._props.origin in refmap)) continue

    const refmapNonce = refmap[before._props.origin][1]
    if (before._props.nonce < refmapNonce) throw new Error(`Time travel for ${_text(jig)}`)
  }
}

// ------------------------------------------------------------------------------------------------

async function assignInitialOwners (commit) {
  const Creation = __webpack_require__(3)
  const record = commit._record

  if (Log._debugOn) Log._debug(TAG, 'Assign owners')

  async function generateInitialOwners () {
    const initialOwners = []
    for (let i = 0; i < record._creates._size; i++) {
      const jig = record._creates._arr()[i]
      const after = commit._after.get(jig)
      const prevowner = after._props.owner
      const needsOwner = typeof prevowner === 'undefined'
      const owner = needsOwner && await commit._kernel._owner.nextOwner()
      initialOwners.push(owner)
    }
    return initialOwners
  }

  function addOwnerRefs (owners) {
    _deepVisit(owners, x => {
      if (x instanceof Creation) {
        commit._record._read(x)
        return false // Don't traverse to 2nd levels, because not used in states
      }
    })
  }

  // Get owners for every new creation that requires it. We synchronize this
  // to ensure that within a single deployment, all new owners that change
  // the record do not create loops in the commit dependency graph.
  await OWNER_SAFETY_QUEUE._enqueue(async () => {
    const initialOwners = await generateInitialOwners()

    // Deploy each new owner if necessary
    const deployedOwners = []
    const savedRecord = Record._CURRENT_RECORD
    try {
      Record._CURRENT_RECORD = commit._record
      commit._record._autopublish = false

      for (const owner of initialOwners) {
        if (!owner) { deployedOwners.push(owner); continue }

        const deployCode = x => {
          if (typeof x !== 'function') return
          const C = Editor._lookupOrCreateCode(x)
          Editor._get(C)._deploy()
          return C
        }

        const deployedOwner = _deepClone(owner, SI, deployCode)
        deployedOwners.push(deployedOwner)
      }
    } finally {
      Record._CURRENT_RECORD = savedRecord
    }

    // Add references to each creation used in the new owners so that they can
    // be saved in the state. We may also create new upstream dependencies.
    addOwnerRefs(deployedOwners)

    // Generate the after state for the new jigs
    commit._generateAfterStates()

    // Assign new owners to the after state. We don't assign directly to the jig
    // because we are in async code, and that jig may already be updated. The
    // finalizeOwnersAndSatoshis() method will determine whether to set on the jig.
    deployedOwners.forEach((owner, n) => {
      if (!owner) return
      const jig = record._creates._arr()[n]
      const after = commit._after.get(jig)
      after._props.owner = owner
    })

    // Generate additional initial owners for any new deployed owners!
    // We only do this once. No loops allowed.
    const initialOwners2 = await generateInitialOwners()

    // Clone the owner for use in sandboxed code
    const deployedOwners2 = []
    for (const owner of initialOwners2) {
      if (!owner) { deployedOwners2.push(owner); continue }

      const getDeployedCode = x => {
        if (typeof x !== 'function') return
        const C = Editor._lookupOrCreateCode(x)
        return C
      }

      const deployedOwner2 = _deepClone(owner, SI, getDeployedCode)
      deployedOwners2.push(deployedOwner2)
    }

    // Assign our new owners
    deployedOwners2.forEach((owner, n) => {
      if (!owner) return
      const jig = record._creates._arr()[n]
      const after = commit._after.get(jig)
      after._props.owner = owner
    })

    // Add new refs again
    addOwnerRefs(deployedOwners2)

    // After adding refs and deploying, we need to finalize the record again
    commit._record._finalize()
  })

  // Wait for any new upstream commits to publish
  await commit._onReady()
}

// ------------------------------------------------------------------------------------------------

async function generateOutputScripts (commit) {
  const bsvNetwork = _bsvNetwork(commit._kernel._blockchain.network)
  const allowNullOwner = false
  const scripts = []

  const savedRecord = Record._CURRENT_RECORD
  try {
    Record._CURRENT_RECORD = commit._record
    commit._record._outputs._forEach(creation => {
      try {
        commit._record._push(creation)
        const after = commit._after.get(creation)
        const owner = after._props.owner
        const lock = _owner(owner, allowNullOwner, bsvNetwork)
        const script = lock.script()
        scripts.push(script)
      } finally {
        commit._record._pop()
      }
    })
    commit._record._finalize()
  } finally {
    Record._CURRENT_RECORD = savedRecord
  }

  // The calling of script() may generate new refs that we have to wait on
  await commit._onReady()

  return scripts
}

// ------------------------------------------------------------------------------------------------

function finalizeOwnersAndSatoshis (commit) {
  const record = commit._record

  record._outputs._forEach(creation => {
    const after = commit._after.get(creation)
    const props = after._props

    props.satoshis = props.satoshis || 0

    _sudo(() => {
      if (!_defined(creation.owner)) creation.owner = props.owner
      if (!_defined(creation.satoshis)) creation.satoshis = props.satoshis
    })
  })

  record._deletes._forEach(creation => {
    _sudo(() => {
      _assert(creation.owner === null)
      _assert(creation.satoshis === 0)
    })
  })
}

// ------------------------------------------------------------------------------------------------

function createMasterList (record) {
  // Deletes don't need to be added, because anything deleted must be an input or create
  const masterSet = new CreationSet()
  for (const x of record._inputs) { masterSet._add(x) }
  for (const x of record._refs) { masterSet._add(x) }
  for (const x of record._creates) { masterSet._add(x) }
  return masterSet._arr()
}

// ------------------------------------------------------------------------------------------------

async function captureStates (commit, timeout) {
  if (commit._states) return commit._states

  const { _captureJig } = __webpack_require__(52)

  const states = new Map()
  const record = commit._record
  const jigs = []
  const outputIndices = new Map()
  const deleteIndices = new Map()

  record._outputs._forEach((jig, i) => { jigs.push(jig); outputIndices.set(jig, i) })
  record._deletes._forEach((jig, i) => { jigs.push(jig); deleteIndices.set(jig, i) })

  for (const jig of jigs) {
    const state = await _captureJig(jig, commit, outputIndices, deleteIndices, timeout)
    states.set(jig, state)
  }

  commit._states = states

  return states
}

// ------------------------------------------------------------------------------------------------

async function _hashState (state) {
  const stateString = _deterministicJSONStringify(state)
  const stateBuffer = bsv.deps.Buffer.from(stateString, 'utf8')

  const stateHashBuffer = await _sha256(stateBuffer)
  const stateHashString = stateHashBuffer.toString('hex')

  return stateHashString
}

// ------------------------------------------------------------------------------------------------

async function hashStates (commit, states) {
  if (commit._stateHashes) return commit._stateHashes

  const hashes = new Map()
  const promises = []

  for (const [jig, state] of states) {
    if (hashes.has(jig)) continue

    const promise = await _hashState(state)
      .then(hash => hashes.set(jig, hash))

    promises.push(promise)
  }

  await Promise.all(promises)

  commit._stateHashes = hashes

  return hashes
}

// ------------------------------------------------------------------------------------------------

function createExec (record, masterList) {
  const encodeOptions = {
    _encodeJig: (x) => {
      const index = masterList.indexOf(x)
      _assert(index >= 0)
      return index
    }
  }

  return record._actions.map(action => {
    const op = action.op()
    const data = Json._encode(action.data(), encodeOptions)
    return { op, data }
  })
}

// ------------------------------------------------------------------------------------------------

function createMetadata (commit, hashes, exec, masterList) {
  const record = commit._record

  const out = record._outputs._arr().map(jig => hashes.get(jig))
  const del = record._deletes._arr().map(jig => hashes.get(jig))

  const encodeOptions = {
    _encodeJig: (x) => {
      const index = masterList.indexOf(x)
      _assert(index >= 0)
      return index
    }
  }

  const owners = record._creates._arr().map(jig => commit._after.get(jig)._props.owner)
  const cre = owners.map(owner => Json._encode(owner, encodeOptions))

  const ref = record._refs._arr().map(jig => record._before.get(jig)._props.location)

  const app = commit._app
  const version = commit._version
  const base = commit._base.toString('hex')
  const vrun = commit._base.outputs.length

  const metadata = {
    app,
    version,
    base,
    vrun,
    in: record._inputs._size,
    ref,
    out,
    del,
    cre,
    exec
  }

  if (Log._debugOn) Log._debug(TAG, 'Metadata', JSON.stringify(metadata, 0, 2))

  return metadata
}

// ------------------------------------------------------------------------------------------------

function createPartialTx (commit, metadata, outputScripts, feePerKb) {
  if (Log._debugOn) Log._debug(TAG, 'Create partial tx')

  const tx = new Transaction(commit._base.toString('hex'))

  const Buffer = bsv.deps.Buffer
  const prefix = Buffer.from('run', 'utf8')
  const protocolHex = _getMetadataVersion(metadata.version)
  const protocol = Buffer.from(protocolHex, 'hex')
  const app = Buffer.from(metadata.app, 'utf8')
  const jsonObj = Object.assign({}, metadata)
  delete jsonObj.app
  delete jsonObj.version
  delete jsonObj.vrun
  delete jsonObj.base
  const json = Buffer.from(JSON.stringify(jsonObj), 'utf8')
  const script = Script.buildSafeDataOut([prefix, protocol, app, json])
  const metadataOutput = new Transaction.Output({ script, satoshis: 0 })

  tx.addOutput(metadataOutput)

  const bsvNetwork = _bsvNetwork(commit._kernel._blockchain.network)
  const allowNullOwner = false
  const record = commit._record

  record._inputs._forEach(jig => {
    const before = record._before.get(jig)
    const location = before._props.location
    const { _txid, _vout } = _location(location)
    const satoshis = before._props.satoshis
    const owner = before._props.owner
    const lock = _owner(owner, allowNullOwner, bsvNetwork)
    const scriptHex = lock.script()
    const script = Script.fromHex(scriptHex)
    const utxo = { txid: _txid, vout: _vout, script, satoshis }
    tx.from(utxo)
  })

  record._outputs._forEach((jig, i) => {
    const after = commit._after.get(jig)
    const scriptLen = outputScripts[i].length / 2
    const satoshis = Math.max(after._props.satoshis, _calculateDust(scriptLen, feePerKb))
    const script = Script.fromHex(outputScripts[i])
    tx.addOutput(new Transaction.Output({ script, satoshis }))
    i++
  })

  return tx
}

// ------------------------------------------------------------------------------------------------

async function preverify (kernel, record, states, metadata, partialtx, timeout) {
  if (kernel._preverify) {
    if (Log._infoOn) Log._info(TAG, 'Preverify')

    const start = new Date()

    try {
      const _replay = __webpack_require__(35)
      const { _Preverify } = _replay
      const mocktxid = '0000000000000000000000000000000000000000000000000000000000000000'
      const published = false
      const jigToSync = null
      const preverify = new _Preverify(record, states)
      await _replay(partialtx, mocktxid, metadata, kernel, published, jigToSync, timeout, preverify)
    } catch (e) {
      if (Log._errorOn) Log._error(TAG, e)
      throw new Error(`Pre-verification failed: ${e.message}`)
    }

    if (Log._debugOn) Log._debug(TAG, 'Preverify (end): ' + (new Date() - start) + 'ms')
  }
}

// ------------------------------------------------------------------------------------------------

function finalizeLocationsAndOrigins (commit, txid) {
  const Code = __webpack_require__(1)
  const record = commit._record

  record._outputs._forEach((jig, i) => {
    const vout = commit._base.outputs.length + 1 + i
    const after = commit._after.get(jig)
    const location = `${txid}_o${vout}`

    if (after._props.origin.startsWith('record://')) after._props.origin = location
    after._props.location = location

    _sudo(() => {
      if (jig.origin.startsWith('record://')) jig.origin = location
      if (!commit._spentDownstream(jig)) jig.location = location
    })

    // Set local bindings for ease of learning Run
    if (jig instanceof Code) {
      Editor._get(jig)._copyBindingsToLocalType(after._props)
    }
  })

  record._deletes._forEach((jig, i) => {
    const after = commit._after.get(jig)
    const location = `${txid}_d${i}`

    if (after._props.origin.startsWith('record://')) after._props.origin = location
    after._props.location = location

    _sudo(() => {
      if (jig.origin.startsWith('record://')) jig.origin = location
      jig.location = location
    })

    // Set local bindings for ease of learning Run
    if (jig instanceof Code) {
      Editor._get(jig)._copyBindingsToLocalType(after._props)
    }
  })
}

// ------------------------------------------------------------------------------------------------

async function payForTx (tx, commit, feePerKb) {
  const Buffer = bsv.deps.Buffer

  const locks = getInputLocks(commit._record)
  const parents = await getParents(tx, commit._kernel)

  // Add placeholder scripts for jig inputs
  const placeholders = locks.map(lock => Buffer.alloc(lock.domain()))
  const indices = [...Array(locks.length).keys()].filter(i => !tx.inputs[i].script.toBuffer().length)
  indices.forEach(i => tx.inputs[i].setScript(placeholders[i]))

  // Pay for the transaction
  const rawtx = tx.toString('hex')
  const paidhex = await commit._kernel._purse.pay(rawtx, parents)
  let paidtx = null
  try {
    if (typeof paidhex !== 'string') throw new Error()
    paidtx = new Transaction(paidhex)
  } catch (e) {
    throw new Error(`Invalid raw transaction returned by purse: ${paidhex}`)
  }

  // Check that the tx is functionally the same
  const modifiedTx =
    tx.version !== paidtx.version ||
    tx.nLockTime !== paidtx.nLockTime ||
    tx.inputs.length > paidtx.inputs.length ||
    tx.inputs.some((input, n) => paidtx.inputs[n].prevTxId.toString('hex') !== input.prevTxId.toString('hex')) ||
    tx.inputs.some((input, n) => paidtx.inputs[n].outputIndex !== input.outputIndex) ||
    tx.inputs.some((input, n) => paidtx.inputs[n].sequenceNumber !== input.sequenceNumber) ||
    tx.outputs.length > paidtx.outputs.length ||
    tx.outputs.some((output, n) => paidtx.outputs[n].script.toHex() !== output.script.toHex()) ||
    tx.outputs.some((output, n) => paidtx.outputs[n].satoshis !== output.satoshis)
  if (modifiedTx) throw new Error('Purse illegally modified tx during payment')

  // Remove placeholder scripts
  indices.forEach(i => paidtx.inputs[i].setScript(''))

  return paidtx
}

// ------------------------------------------------------------------------------------------------

function getInputLocks (record) {
  const locks = record._inputs._arr()
    .map(jig => record._before.get(jig))
    .map(snapshot => snapshot._props.owner)
    .map(owner => _owner(owner))

  return locks
}

// ------------------------------------------------------------------------------------------------

async function getParents (tx, kernel) {
  const inputs = tx.inputs
  const prevtxids = inputs.map(input => input.prevTxId.toString('hex'))
  const rawTransactions = await Promise.all(prevtxids.map(prevtxid => kernel._fetch(prevtxid)))
  const transactions = rawTransactions.map(rawtx => new bsv.Transaction(rawtx))
  const outputs = inputs.map((input, n) => transactions[n].outputs[input.outputIndex])
  const scripts = outputs.map(output => output.script.toHex())
  const satoshis = outputs.map(output => output.satoshis)
  const parents = scripts.map((script, i) => { return { script, satoshis: satoshis[i] } })
  return parents
}

// ------------------------------------------------------------------------------------------------

async function cancelPaidTx (paidtx, purse) {
  if (Log._infoOn) Log._info(TAG, 'Cancelling payment')

  if (typeof purse.cancel === 'function') {
    await purse.cancel(paidtx.toString('hex'))
  }
}

// ------------------------------------------------------------------------------------------------

async function signTx (tx, commit, feePerKb) {
  const record = commit._record
  const locks = getInputLocks(record)
  const parents = await getParents(tx, commit._kernel)

  // Sign the transaction
  const rawtx = tx.toString('hex')
  const signedhex = await commit._kernel._owner.sign(rawtx, parents, locks)
  let signedtx = null
  try {
    if (typeof signedhex !== 'string') throw new Error()
    signedtx = new Transaction(signedhex)
  } catch (e) {
    throw new Error(`Invalid raw transaction returned by owner: ${signedhex}`)
  }

  // Check that the tx is functionally the same
  const modifiedTx =
    tx.version !== signedtx.version ||
    tx.nLockTime !== signedtx.nLockTime ||
    tx.inputs.length > signedtx.inputs.length ||
    tx.inputs.some((input, n) => signedtx.inputs[n].prevTxId.toString('hex') !== input.prevTxId.toString('hex')) ||
    tx.inputs.some((input, n) => signedtx.inputs[n].outputIndex !== input.outputIndex) ||
    tx.inputs.some((input, n) => signedtx.inputs[n].sequenceNumber !== input.sequenceNumber) ||
    tx.outputs.length > signedtx.outputs.length ||
    tx.outputs.some((output, n) => signedtx.outputs[n].script.toHex() !== output.script.toHex()) ||
    tx.outputs.some((output, n) => signedtx.outputs[n].satoshis !== output.satoshis)
  if (modifiedTx) throw new Error('Owner illegally modified tx during payment')

  return signedtx
}

// ------------------------------------------------------------------------------------------------

function checkTx (tx, record, partialtx) {
  record._inputs._forEach((jig, i) => {
    if (tx.inputs[i].isFullySigned()) return
    const before = record._before.get(jig)
    const line1 = `origin: ${before._props.origin}`
    const line2 = `location: ${before._props.location}`
    const line3 = `owner: ${before._props.owner}`
    const details = `${line1}\n${line2}\n${line3}`
    const reason = tx.inputs[i].script.toBuffer().length ? 'Bad signature' : 'Missing signature'
    throw new Error(`${reason} for ${_text(jig)}\n\n${details}`)
  })

  for (let vin = 0; vin < partialtx.inputs.length; vin++) {
    if (partialtx.inputs[vin].prevTxId.toString('hex') !== tx.inputs[vin].prevTxId.toString('hex') ||
      partialtx.inputs[vin].outputIndex !== tx.inputs[vin].outputIndex) {
      throw new Error(`Transaction input ${vin} changed`)
    }
  }

  for (let vout = 0; vout < partialtx.outputs.length; vout++) {
    if (partialtx.outputs[vout].script.toHex() !== tx.outputs[vout].script.toHex()) {
      throw new Error(`Transaction output ${vout} changed`)
    }
  }
}

// ------------------------------------------------------------------------------------------------

async function broadcastTx (commit, tx, timeout) {
  let txid = null

  // Notify the purse of the broadcast. If the purse can't handle the broadcast, for example if
  // it has an internal issue updating the utxos, it can put the broadcast on hold.
  if (typeof commit._kernel._purse.broadcast === 'function') {
    try {
      await commit._kernel._purse.broadcast(tx.toString('hex'))
    } catch (e) {
      throw await addDetailsToBroadcastError(e, commit, tx, timeout)
    }
  }

  // Broadcast to the blockchain
  try {
    txid = await commit._kernel._blockchain.broadcast(tx.toString('hex'))
  } catch (e) {
    throw await addDetailsToBroadcastError(e, commit, tx, timeout)
  }

  // Notify the state api of the new transaction to index
  if (typeof commit._kernel._state.broadcast === 'function') {
    await commit._kernel._state.broadcast(tx.toString('hex'))
  }

  return txid
}

// ------------------------------------------------------------------------------------------------

async function addDetailsToBroadcastError (e, commit, tx, timeout) {
  const eString = e.toString()
  let message = `Broadcast failed: ${e.message}`

  // These errors are hints that the transaction is unpaid for
  if (eString.indexOf('tx has no inputs') !== -1 || eString.indexOf('insufficient priority') !== -1) {
    const suggestion = 'Hint: Is the purse funded to pay for this transaction?'
    message = `${message}\n\n${suggestion}`
  }

  // These errors are hints that an input was already spent
  if (eString.indexOf('Missing inputs') !== -1 || eString.indexOf('txn-mempool-conflict') !== -1) {
    // Figure out which input was spent
    for (const input of tx.inputs) {
      try {
        const prevtxid = input.prevTxId.toString('hex')
        const prevvout = input.outputIndex
        const prevlocation = `${prevtxid}_o${prevvout}`
        const prevspend = await commit._kernel._spends(prevtxid, prevvout)
        if (!prevspend) continue

        let typeString = 'Payment'
        try {
          const jig = await _load(prevlocation, undefined, commit._kernel, undefined, timeout)
          const Code = __webpack_require__(1)
          typeString = jig instanceof Code ? jig.name : jig.toString()
        } catch (e) { }

        message = `${message}\n\n${typeString} was spent in another transaction\n`
        message = `${message}\nLocation: ${prevlocation}`
        message = `${message}\nSpending Tx: ${prevspend}`
      } catch (e) {
        // Ignore errors in this error handler
      }
    }
  }

  return new Error(message)
}

// ------------------------------------------------------------------------------------------------

async function cacheStates (commit, states, txid) {
  const promises = []

  const record = commit._record

  record._outputs._forEach((jig, i) => {
    const state = states.get(jig)
    _assert(state)
    const vout = commit._base.outputs.length + 1 + i
    const key = `jig://${txid}_o${vout}`
    promises.push(commit._kernel._cache.set(key, state))
  })

  record._deletes._forEach((jig, i) => {
    const state = states.get(jig)
    _assert(state)
    const vdel = i
    const key = `jig://${txid}_d${vdel}`
    promises.push(commit._kernel._cache.set(key, state))
  })

  await Promise.all(promises)
}

// ------------------------------------------------------------------------------------------------

_publish._checkNoTimeTravel = checkNoTimeTravel
_publish._assignInitialOwners = assignInitialOwners
_publish._generateOutputScripts = generateOutputScripts
_publish._finalizeOwnersAndSatoshis = finalizeOwnersAndSatoshis
_publish._createMasterList = createMasterList
_publish._captureStates = captureStates
_publish._hashStates = hashStates
_publish._createExec = createExec
_publish._createMetadata = createMetadata
_publish._createPartialTx = createPartialTx
_publish._preverify = preverify
_publish._PURSE_SAFETY_QUEUE = PURSE_SAFETY_QUEUE
_publish._payForTx = payForTx
_publish._cancelPaidTx = cancelPaidTx
_publish._signTx = signTx
_publish._checkTx = checkTx
_publish._broadcastTx = broadcastTx
_publish._finalizeLocationsAndOrigins = finalizeLocationsAndOrigins
_publish._cacheStates = cacheStates

module.exports = _publish


/***/ }),
/* 21 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * action.js
 *
 * Defines and records actions that happened on creations
 */

const { _prepareArgs } = __webpack_require__(19)
const { _BINDINGS, _location } = __webpack_require__(8)
const { _assert, _text, _parent, _hasOwnProperty, _defined } = __webpack_require__(0)
const { _deepVisit, _deepClone } = __webpack_require__(14)
const { NotImplementedError } = __webpack_require__(11)
const { _sudo } = __webpack_require__(4)
const Log = __webpack_require__(2)
const Proxy2 = __webpack_require__(26)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Action'

// ------------------------------------------------------------------------------------------------
// _Action
// ------------------------------------------------------------------------------------------------

/**
 * Base class for all actions stored in the record
 *
 * If an action has a creation, then it will be spent when callers are signed.
 */
class _Action {
  constructor (creation) {
    this._creation = creation
  }

  // Friendly string for logging
  toString () { return `${this.constructor.name}` }

  // Name of the opcode in the exec part of the metadata
  op () { throw new NotImplementedError() }

  // The unserialized data that will be encoded for this particular action
  data () { throw new NotImplementedError() }
}

// ------------------------------------------------------------------------------------------------
// _DeployAction
// ------------------------------------------------------------------------------------------------

class _DeployAction extends _Action {
  constructor () {
    super(null)
    this._srcList = []
    this._propsList = []
  }

  toString () {
    const count = this._srcList.length
    return `Deploy (count: ${count})`
  }

  op () {
    return 'DEPLOY'
  }

  data () {
    _assert(this._srcList.length === this._propsList.length)
    const data = []
    for (let i = 0; i < this._srcList.length; i++) {
      const src = this._srcList[i]
      const props = this._propsList[i]
      data.push(src)
      data.push(props)
    }
    return data
  }
}

// ------------------------------------------------------------------------------------------------
// _UpgradeAction
// ------------------------------------------------------------------------------------------------

class _UpgradeAction extends _Action {
  constructor (C, src, props) {
    super(C)
    this._src = src
    this._props = props
  }

  toString () {
    return `Upgrade ${_text(this._creation)}`
  }

  op () {
    return 'UPGRADE'
  }

  data () {
    const data = []
    data.push(this._creation)
    data.push(this._src)
    data.push(this._props)
    return data
  }
}

// ------------------------------------------------------------------------------------------------
// _CallAction
// ------------------------------------------------------------------------------------------------

class _CallAction extends _Action {
  constructor (creation, method, args) {
    super(creation)
    this._method = method
    this._args = args
  }

  toString () {
    return `Call ${_text(this._creation)} ${this._method}`
  }

  op () {
    return 'CALL'
  }

  data () {
    const data = []
    data.push(this._creation)
    data.push(this._method)
    data.push(this._args)
    return data
  }
}

// ------------------------------------------------------------------------------------------------
// _NewAction
// ------------------------------------------------------------------------------------------------

class _NewAction extends _Action {
  constructor (classJig, jig, args) {
    super(jig)
    this._classJig = classJig
    this._args = args
  }

  toString () {
    return `New ${_text(this._creation)}`
  }

  op () {
    return 'NEW'
  }

  data () {
    const params = []
    params.push(this._classJig)
    params.push(this._args)
    return params
  }
}

// ------------------------------------------------------------------------------------------------
// _deploy
// ------------------------------------------------------------------------------------------------

function _deploy (creations) {
  const Code = __webpack_require__(1)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  _assert(creations.length)
  _assert(creations.every(C => C instanceof Code))

  if (Log._debugOn) Log._debug(TAG, 'Deploy', creations.map(C => _text(C)).join(', '))

  CURRENT_RECORD._capture(() => {
    // Add deploy code to the CREATE set
    creations.forEach(C => CURRENT_RECORD._create(C))

    // Add parent classes to the AUTH set
    creations.forEach(C => authParents(C, 'deploy'))

    // Each new deploy is also unbound
    creations.forEach(C => CURRENT_RECORD._unbind(C))

    // Create the deploy action
    const action = new _DeployAction()

    for (const C of creations) {
      // Object.assign() will only copy owned class props, not parent props. This is good.
      const src = C.toString()
      const props = _sudo(() => _deepClone(Object.assign({}, C)))

      // Add all creation properties as reads
      addReadRefs(props)

      // Remove bindings from the props because they won't be deployed
      _BINDINGS.forEach(x => delete props[x])

      // Presets should also never be present on code creations
      _assert(!props.presets)

      action._srcList.push(src)
      action._propsList.push(props)
    }

    // Add the action as a top-level action
    CURRENT_RECORD._action(action)
  })
}

// ------------------------------------------------------------------------------------------------
// _upgrade
// ------------------------------------------------------------------------------------------------

function _upgrade (C, snapshot) {
  const Code = __webpack_require__(1)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  _assert(C instanceof Code)

  if (Log._debugOn) Log._debug(TAG, 'Upgrade', _text(C))

  // If already destroyed, then we can't upgrade
  const destroyed = _defined(_location(_sudo(() => C.location))._vdel)
  if (destroyed) throw new Error('Cannot upgrade destroyed jig')

  CURRENT_RECORD._capture(() => {
    authParents(C, 'upgrade')

    // Create the deploy action
    const src = C.toString()
    const props = _sudo(() => _deepClone(Object.assign({}, C)))

    // Add all code properties as reads
    addReadRefs(props)

    // Remove bindings from the props because they won't be deployed
    _BINDINGS.forEach(x => delete props[x])

    // Presets should also never be present on code jigs
    _assert(!props.presets)

    const action = new _UpgradeAction(C, src, props)

    // Spend the code jig being updated
    CURRENT_RECORD._update(C, snapshot)

    // Add the action as a top-level action
    CURRENT_RECORD._action(action)
  })
}

// ------------------------------------------------------------------------------------------------
// _destroy
// ------------------------------------------------------------------------------------------------

function _destroy (creation) {
  const Record = __webpack_require__(10)
  const Code = __webpack_require__(1)
  const Jig = __webpack_require__(7)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  _assert(creation instanceof Code || creation instanceof Jig)

  if (Log._infoOn) Log._info(TAG, 'Destroy', _text(creation))

  // If already destroyed, then nothing to do
  const destroyed = _defined(_location(_sudo(() => creation.location))._vdel)
  if (destroyed) return

  CURRENT_RECORD._capture(() => {
    CURRENT_RECORD._delete(creation)

    // Only add the action if there is not already an action in progress
    const top = !CURRENT_RECORD._stack.length
    if (top) {
      const action = new _CallAction(creation, 'destroy', [])
      CURRENT_RECORD._action(action)
    }
  })
}

// ------------------------------------------------------------------------------------------------
// _auth
// ------------------------------------------------------------------------------------------------

function _auth (creation) {
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD
  const Code = __webpack_require__(1)
  const Jig = __webpack_require__(7)

  _assert(creation instanceof Code || creation instanceof Jig)

  if (Log._infoOn) Log._info(TAG, 'Auth', _text(creation))

  // If already destroyed, then we can't auth
  const destroyed = _defined(_location(_sudo(() => creation.location))._vdel)
  if (destroyed) throw new Error('Cannot auth destroyed jigs')

  CURRENT_RECORD._capture(() => {
    CURRENT_RECORD._auth(creation)

    // Only add the action if there is not already an action in progress
    const top = !CURRENT_RECORD._stack.length
    if (top) {
      const action = new _CallAction(creation, 'auth', [])
      CURRENT_RECORD._action(action)
    }
  })
}

// ------------------------------------------------------------------------------------------------
// _call
// ------------------------------------------------------------------------------------------------

function _call (creation, method, args, f, recorded = true) {
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  if (Log._infoOn) Log._info(TAG, 'Call', _text(creation), method)

  CURRENT_RECORD._capture(() => {
    // Add creation args as references
    addReadRefs(args)

    // Add the creation to the stack before diving in
    CURRENT_RECORD._push(creation)
    f()
    CURRENT_RECORD._pop()

    // Submit the action if there's nothing left
    const top = !CURRENT_RECORD._stack.length
    if (top && recorded) {
      const action = new _CallAction(creation, method, args)
      CURRENT_RECORD._action(action)
    }
  })
}

// ------------------------------------------------------------------------------------------------
// _new
// ------------------------------------------------------------------------------------------------

function _new (classJig, jig, args, unbound) {
  const Jig = __webpack_require__(7)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  if (Log._infoOn) Log._info(TAG, 'New', _text(classJig))

  CURRENT_RECORD._capture(() => {
    // Read all classes in the chain since they were part of the creation
    let T = classJig
    while (T !== Jig) {
      CURRENT_RECORD._read(T)
      T = Object.getPrototypeOf(T)
    }

    // Prepare args, deploying code in the process
    const preparedArgs = _prepareArgs(jig, args)

    // Add jig args as references. If the jig has an init method, then this isn't necessary,
    // but because native code isn't recordable this is needed when there isn't an init method.
    addReadRefs(preparedArgs)

    // Record the create of the new jig
    CURRENT_RECORD._create(jig)

    // Call the init method with a jig on the stack so that we don't create a CALL action
    const ret = jig.init(...preparedArgs)
    if (typeof ret !== 'undefined') throw new Error('init must not return a value')

    // After calling init, the creation is usually unbound. The one exception is if the
    // creator jig was bound then we have an initial authorizer.
    if (unbound) CURRENT_RECORD._unbind(jig)

    // Disable this jig from calling ever init again
    Proxy2._getHandler(jig)._rules._disabledMethods.push('init')

    // Record the action if we're at the top of the stack
    const top = !CURRENT_RECORD._stack.length
    if (top) {
      const action = new _NewAction(classJig, jig, preparedArgs)
      CURRENT_RECORD._action(action)
    }
  })
}

// ------------------------------------------------------------------------------------------------
// _pluck
// ------------------------------------------------------------------------------------------------

function _pluck (berryClass, berry, args) {
  const Berry = __webpack_require__(13)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  if (Log._infoOn) Log._info(TAG, 'Pluck', _text(berryClass))

  // Even though we use the current record to capture reads and check that they are allowed, we
  // don't allow and actions and will roll it back at the end.
  CURRENT_RECORD._autopublish = false

  CURRENT_RECORD._capture(() => {
    // Read all classes in the chain since they were part of the creation
    let T = berryClass
    while (T !== Berry) {
      CURRENT_RECORD._read(T)
      T = Object.getPrototypeOf(T)
    }

    // Prepare args, deploying code in the process
    const preparedArgs = _prepareArgs(berry, args)

    // Add args as references. If the berry has an init method, then this isn't necessary,
    // but because native code isn't recordable this is needed when there isn't an init method.
    addReadRefs(preparedArgs)

    // Call the init method. We manually push/pop because berries are like sidekicks and passthrough.
    const ret = berry.init(...preparedArgs)
    if (typeof ret !== 'undefined') throw new Error('init must not return a value')

    // Disable this berry from calling ever init again
    Proxy2._getHandler(berry)._rules._disabledMethods.push('init')
  })

  if (CURRENT_RECORD._actions.length) throw new Error('Not actions allowed during pluck')

  CURRENT_RECORD._rollback()
}

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

function authParents (C, method) {
  const Editor = __webpack_require__(9)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  const Parent = _parent(C)
  if (!Parent) return

  // Parents up the chain must all approve. This allows modding hierarchies where a company
  // allows other companies to extend their base class but still not create children that might
  // break instanceof checks.
  authParents(Parent, method)

  const parentEditor = Editor._get(Parent)
  if (parentEditor._native) return

  const parentSealed = _hasOwnProperty(Parent, 'sealed') ? Parent.sealed : 'owner'
  switch (parentSealed) {
    case 'owner':
      if (!CURRENT_RECORD._creates._has(Parent)) {
        CURRENT_RECORD._auth(Parent)
      }
      break
    case true:
      throw new Error(`Cannot ${method}: ${_text(Parent)} is sealed`)
    case false:
      break
    default:
      throw new Error(`Invalid sealed option: ${parentSealed}`)
  }
}

// ------------------------------------------------------------------------------------------------

function addReadRefs (obj) {
  const Creation = __webpack_require__(3)
  const Record = __webpack_require__(10)
  const CURRENT_RECORD = Record._CURRENT_RECORD

  _sudo(() => _deepVisit(obj, x => {
    if (x instanceof Creation) {
      CURRENT_RECORD._read(x)

      // Only add top-level refs. Do not traverse deeply because they
      // are not part of the recorded state in the args.
      return false
    }
  }))
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _Action,
  _DeployAction,
  _UpgradeAction,
  _CallAction,
  _NewAction,
  _deploy,
  _upgrade,
  _destroy,
  _auth,
  _call,
  _new,
  _pluck
}


/***/ }),
/* 22 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * rules.js
 *
 * Rules for the different membranes that surround creations and their properties
 */

const { _assert } = __webpack_require__(0)
const Proxy2 = __webpack_require__(26)
const { _PROTOCOL_VERSION } = __webpack_require__(15)

// ------------------------------------------------------------------------------------------------
// Rules
// ------------------------------------------------------------------------------------------------

class Rules {
  constructor () {
    // The owning parent creation (undefined = self)
    this._creation = undefined
    // Whether to allow admin mode to override everything
    this._admin = true
    // Whether this target has location bindings that need protection
    this._locationBindings = false
    // Whether this target has utxo bindings that need protection
    this._utxoBindings = false
    // Whether this target cannot set or define reserved properties
    this._reserved = false
    // Whether this object is code and should have Code methods on it
    this._codeProps = false
    // Whether this object is a jig object
    this._jigProps = false
    // Whether this object is a berry instance
    this._berryProps = false
    // Whether this target protects private properties
    this._privacy = false
    // Whether this target cannot be changed
    this._immutable = false
    // Whether we should record reads for the creation
    this._recordReads = false
    // Whether we should record changes for the creation
    this._recordUpdates = false
    // Whether static and instance methods should be recorded as actions to be replayed
    this._recordCalls = false
    // Whether this object should record method performed calls on it
    this._recordableTarget = false
    // Whether its properties are only updatable by its owner in a method
    this._smartAPI = false
    // Whether the function should never have a thisArg when called
    this._thisless = false
    // Methods that don't ever get recorded on-chain
    this._unrecordedMethods = []
    // List of method names that cannot be called on this target
    this._disabledMethods = []
    // Whether methods should automatically convert local types thisArgs into code
    this._autocode = false
    // Version of the protocol
    this._version = _PROTOCOL_VERSION
  }

  static _jigCode () {
    const rules = new Rules()
    rules._creation = undefined
    rules._admin = true
    rules._locationBindings = true
    rules._utxoBindings = true
    rules._reserved = true
    rules._codeProps = true
    rules._jigProps = false
    rules._berryProps = false
    rules._privacy = true
    rules._immutable = false
    rules._recordReads = true
    rules._recordUpdates = true
    rules._recordCalls = true
    rules._recordableTarget = true
    rules._smartAPI = true
    rules._thisless = false
    rules._disabledMethods = []
    rules._unrecordedMethods = []
    rules._autocode = true
    return rules
  }

  static _sidekickCode (isClass) {
    const rules = new Rules()
    rules._creation = undefined
    rules._admin = true
    rules._locationBindings = true
    rules._utxoBindings = true
    rules._reserved = true
    rules._codeProps = true
    rules._jigProps = false
    rules._berryProps = false
    rules._privacy = false
    rules._immutable = true
    rules._recordReads = true
    rules._recordUpdates = false
    rules._recordCalls = false
    rules._recordableTarget = false
    rules._smartAPI = false
    rules._thisless = !isClass
    rules._disabledMethods = []
    rules._unrecordedMethods = []
    rules._autocode = false
    return rules
  }

  static _nativeCode () {
    const rules = new Rules()
    rules._creation = undefined
    rules._admin = true
    rules._locationBindings = true
    rules._utxoBindings = true
    rules._reserved = false
    rules._codeProps = true
    rules._jigProps = false
    rules._berryProps = false
    rules._privacy = false
    rules._immutable = true
    rules._recordReads = false // Native code never changes. No ref needed unless its referenced directly.
    rules._recordUpdates = false
    rules._recordCalls = false
    rules._recordableTarget = false
    rules._smartAPI = true
    rules._thisless = false
    rules._disabledMethods = []
    rules._unrecordedMethods = []
    rules._autocode = false
    return rules
  }

  static _jigObject (initialized) {
    const rules = new Rules()
    rules._creation = undefined
    rules._admin = true
    rules._locationBindings = true
    rules._utxoBindings = true
    rules._reserved = true
    rules._codeProps = false
    rules._jigProps = true
    rules._berryProps = false
    rules._privacy = true
    rules._immutable = false
    rules._recordReads = true
    rules._recordUpdates = true
    rules._recordCalls = true
    rules._recordableTarget = true
    rules._smartAPI = true
    rules._thisless = false
    rules._disabledMethods = initialized ? ['init'] : []
    rules._unrecordedMethods = ['init']
    rules._autocode = false
    return rules
  }

  static _berryObject (initialized) {
    const rules = new Rules()
    rules._creation = undefined
    rules._admin = true
    rules._locationBindings = true
    rules._utxoBindings = true
    rules._reserved = true
    rules._codeProps = false
    rules._jigProps = false
    rules._berryProps = true
    rules._privacy = false
    rules._immutable = true
    rules._recordReads = true
    rules._recordUpdates = false
    rules._recordCalls = false
    rules._recordableTarget = false
    rules._smartAPI = false
    rules._thisless = false
    rules._disabledMethods = initialized ? ['init'] : []
    rules._unrecordedMethods = ['init']
    rules._autocode = false
    return rules
  }

  static _childProperty (creation, method) {
    const creationMembrane = Proxy2._getHandler(creation)
    _assert(creationMembrane)
    const creationRules = creationMembrane._rules
    const rules = new Rules()
    rules._creation = creation
    rules._admin = creationRules._admin
    rules._locationBindings = false
    rules._utxoBindings = false
    rules._reserved = false
    rules._codeProps = false
    rules._jigProps = false
    rules._berryProps = false
    rules._privacy = creationRules._privacy
    rules._immutable = creationRules._immutable || method
    rules._recordReads = creationRules._recordReads
    rules._recordUpdates = creationRules._recordUpdates
    rules._recordCalls = creationRules._recordCalls
    rules._recordableTarget = false
    rules._smartAPI = creationRules._smartAPI
    rules._thisless = creationRules._thisless // Would inherit to both static + prototype methods
    rules._disabledMethods = []
    rules._unrecordedMethods = []
    rules._autocode = creationRules._autocode
    return rules
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Rules


/***/ }),
/* 23 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * json.js
 *
 * Converts complex javascript objects with jigs into JSON
 *
 * This conversion is basically what determines what kinds of data may be stored in jigs, stored
 * as class properties, or passed into functions. If we were to support a new kind of data type,
 * we would start by supporting it here.
 *
 * We use a custom JSON notation encoding because we haven't found any other suitable format
 * to-date. This encoding is JSON and may be used as such. However, it is also special JSON.
 * The JSON represents a complex JS object, and through decoding, we can convert it back into
 * a rich object.
 *
 * We use what we call "$ objects" to do this. $ objects are JSON objects with a single property
 * that begins with '$'. This means it contains a special value that JSON is unable to
 * represent. Through this approach, in addition to standard JSON, we support the following:
 *
 *      Type                    $ Prefix        Example
 *      ---------               --------        -----------
 *      Undefined               $und            { $und: 1 }
 *      NaN                     $nan            { $nan: 1 }
 *      Infinity                $inf            { $inf: 1 }
 *      Negative infinity       $ninf           { $ninf: 1 }
 *      Negative zero           $n0             { $n0: 1 }
 *      Set instance            $set            { $set: [1], props: { n: 1 } }
 *      Map instance            $map            { $map: [[1, 2]], props: { n: 1 } }
 *      Uint8Array instance     $ui8a           { $ui8a: '<base64data>' }
 *      Jig/Code/Berry          $jig            { $jig: 1 }
 *      Arbitrary object        $arb            { $arb: { n: 1 }, T: { $jig: 1 } }
 *      Object                  $obj            { $obj: { $n: 1 } }
 *      Sparse array            $arr            { $arr: { 0: 'a', 100: 'c' } }
 *      Duplicate object        $dup            { $dup: ['n', 'm', '0'] }
 *
 * Order of properties is important and must be preserved during encode and decode. Duplicate paths
 * are arrays into the encoded object, not the original object.
 */

const {
  _text, _basicObject, _basicArray, _basicSet, _basicMap, _basicUint8Array,
  _defined, _negativeZero
} = __webpack_require__(0)
const { _deterministicObjectKeys } = __webpack_require__(17)
const Sandbox = __webpack_require__(6)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const SIS = Sandbox._intrinsicSet
const HIS = Sandbox._hostIntrinsicSet

// Run could be made to work with these words allowed, but it opens the door to user bugs
const RESERVED_PROPS = new Set(['constructor', 'prototype'])

const BASE64_CHARS = new Set()
'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/='
  .split('').forEach(x => BASE64_CHARS.add(x))

const _throwEnc = (x, reason) => { throw new Error(`Cannot encode ${_text(x)}\n\n${reason}`) }
const _throwDec = (x, reason) => { throw new Error(`Cannot decode ${_text(JSON.stringify(x))}\n\n${reason}`) }

// ------------------------------------------------------------------------------------------------
// encode
// ------------------------------------------------------------------------------------------------

/**
 * Encodes x into $json
 * @param {object} x Object to encode
 * @param {?function} options._encodeJig Gets an encoded id for a jig
 * @param {?object} options._intrinsics Intrinsics to use for the encoded json
 * @returns Encoded json
 */
function encode (x, options = {}) {
  const paths = options._paths || new Map()
  const intrinsics = options._intrinsics || Sandbox._hostIntrinsics
  return _encodeAny(x, [], paths, intrinsics, options._encodeJig)
}

// ------------------------------------------------------------------------------------------------
// _encodeAny
// ------------------------------------------------------------------------------------------------

function _encodeAny (x, path, paths, intrinsics, encodeJig) {
  switch (typeof x) {
    case 'undefined': return _encodeUndefined(intrinsics)
    case 'string': return x
    case 'boolean': return x
    case 'number': return _encodeNumber(x, intrinsics)
    case 'symbol': break
    case 'object': return _encodeObject(x, path, paths, intrinsics, encodeJig)
    case 'function': return _encodeObject(x, path, paths, intrinsics, encodeJig)
  }
  _throwEnc(x, `Unsupported type ${_text(typeof x)}`)
}

// ------------------------------------------------------------------------------------------------
// _encodeUndefined
// ------------------------------------------------------------------------------------------------

function _encodeUndefined (intrinsics) {
  const y = new intrinsics.Object()
  y.$und = 1
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeNumber
// ------------------------------------------------------------------------------------------------

function _encodeNumber (x, intrinsics) {
  if (isNaN(x) || !isFinite(x) || _negativeZero(x)) {
    const y = new intrinsics.Object()
    if (isNaN(x)) y.$nan = 1
    if (x === Infinity) y.$inf = 1
    if (x === -Infinity) y.$ninf = 1
    if (_negativeZero(x)) y.$n0 = 1
    return y
  }
  return x
}

// ------------------------------------------------------------------------------------------------
// _encodeObject
// ------------------------------------------------------------------------------------------------

function _encodeObject (x, path, paths, intrinsics, encodeJig) {
  if (!x) return null

  // Check for dups
  if (paths.has(x)) {
    const y = new intrinsics.Object()
    y.$dup = intrinsics.Array.from(paths.get(x))
    return y
  }

  // Remember potential dups
  paths.set(x, path)

  // Check that this not an intrinsic type
  if (SIS.has(x) || HIS.has(x)) _throwEnc(x, 'Unsupported intrinsic')

  if (_basicObject(x)) return _encodeBasicObject(x, path, paths, intrinsics, encodeJig)
  if (_basicArray(x)) return _encodeBasicArray(x, path, paths, intrinsics, encodeJig)
  if (_basicSet(x)) return _encodeBasicSet(x, path, paths, intrinsics, encodeJig)
  if (_basicMap(x)) return _encodeBasicMap(x, path, paths, intrinsics, encodeJig)
  if (_basicUint8Array(x)) return _encodeBasicUint8Array(x, path, paths, intrinsics, encodeJig)

  // Handle jigs and arbitrary objects
  if (encodeJig) {
    const Creation = __webpack_require__(3)
    if (x instanceof Creation) return _encodeJig(x, path, paths, intrinsics, encodeJig)
    if (Object.getPrototypeOf(x).constructor instanceof Creation) return _encodeArbitraryObject(x, path, paths, intrinsics, encodeJig)
  }

  _throwEnc(x, 'Unsupported object')
}

// ------------------------------------------------------------------------------------------------
// _encodeBasicObject
// ------------------------------------------------------------------------------------------------

function _encodeBasicObject (x, path, paths, intrinsics, encodeJig) {
  const $ = _deterministicObjectKeys(x).some(key => key.startsWith('$'))
  const y = new intrinsics.Object()
  let yobj = y
  let ypath = path
  if ($) {
    y.$obj = new intrinsics.Object()
    yobj = y.$obj
    ypath = path.concat(['$obj'])
  }
  _deterministicObjectKeys(x).forEach(key => {
    if (RESERVED_PROPS.has(key)) _throwEnc(x, `Reserved key: ${_text(key)}`)
    const subpath = ypath.concat([key.toString()])
    yobj[key] = _encodeAny(x[key], subpath, paths, intrinsics, encodeJig)
  })
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeBasicArray
// ------------------------------------------------------------------------------------------------

function _encodeBasicArray (x, path, paths, intrinsics, encodeJig) {
  const keys = _deterministicObjectKeys(x)
  if (keys.length === x.length) {
    const y = new intrinsics.Array()
    keys.forEach(key => {
      const subpath = path.concat([key.toString()])
      const subvalue = _encodeAny(x[key], subpath, paths, intrinsics, encodeJig)
      y.push(subvalue)
    })
    return y
  } else {
    // Sparse array
    const y = new intrinsics.Object()
    const yarr = new intrinsics.Object()
    const ypath = path.concat(['$arr'])
    keys.forEach(key => {
      if (RESERVED_PROPS.has(key)) _throwEnc(x, `Reserved key: ${_text(key)}`)
      const subpath = ypath.concat([key.toString()])
      yarr[key] = _encodeAny(x[key], subpath, paths, intrinsics, encodeJig)
    })
    y.$arr = yarr
    return y
  }
}

// ------------------------------------------------------------------------------------------------
// _encodeBasicSet
// ------------------------------------------------------------------------------------------------

function _encodeBasicSet (x, path, paths, intrinsics, encodeJig) {
  const y = new intrinsics.Object()
  y.$set = new intrinsics.Array()
  let i = 0
  const ypath = path.concat(['$set'])
  for (const v of x) {
    const subpath = ypath.concat([i.toString()])
    const subvalue = _encodeAny(v, subpath, paths, intrinsics, encodeJig)
    y.$set.push(subvalue)
    i++
  }
  if (_deterministicObjectKeys(x).length) {
    y.props = new intrinsics.Object()
    const ypropspath = path.concat(['props'])
    _deterministicObjectKeys(x).forEach(key => {
      if (RESERVED_PROPS.has(key)) _throwEnc(x, `Reserved key: ${_text(key)}`)
      const subpath = ypropspath.concat([key.toString()])
      y.props[key] = _encodeAny(x[key], subpath, paths, intrinsics, encodeJig)
    })
  }
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeBasicMap
// ------------------------------------------------------------------------------------------------

function _encodeBasicMap (x, path, paths, intrinsics, encodeJig) {
  const y = new intrinsics.Object()
  y.$map = new intrinsics.Array()
  let i = 0
  const ypath = path.concat(['$map'])
  for (const [k, v] of x) {
    const entry = new intrinsics.Array()
    entry.push(_encodeAny(k, ypath.concat([i.toString(), '0']), paths, intrinsics, encodeJig))
    entry.push(_encodeAny(v, ypath.concat([i.toString(), '1']), paths, intrinsics, encodeJig))
    y.$map.push(entry)
    i++
  }
  if (_deterministicObjectKeys(x).length) {
    y.props = new intrinsics.Object()
    const ypropspath = path.concat(['props'])
    _deterministicObjectKeys(x).forEach(key => {
      if (RESERVED_PROPS.has(key)) _throwEnc(x, `Reserved key: ${_text(key)}`)
      const subpath = ypropspath.concat([key.toString()])
      y.props[key] = _encodeAny(x[key], subpath, paths, intrinsics, encodeJig)
    })
  }
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeBasicUint8Array
// ------------------------------------------------------------------------------------------------

function _encodeBasicUint8Array (x, path, paths, intrinsics, encodeJig) {
  const keys = _deterministicObjectKeys(x)
  if (keys.length !== x.length) _throwEnc(x, 'Uint8Arrays must not contain props')
  const y = new intrinsics.Object()
  // Convert to Uint8Array to fix a bug in browsers if x is a sandbox intrinsic
  const b = Buffer.from(new Uint8Array(x))
  y.$ui8a = b.toString('base64')
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeJig
// ------------------------------------------------------------------------------------------------

function _encodeJig (x, path, paths, intrinsics, encodeJig) {
  const y = new intrinsics.Object()
  y.$jig = encodeJig(x)
  return y
}

// ------------------------------------------------------------------------------------------------
// _encodeArbitraryObject
// ------------------------------------------------------------------------------------------------

function _encodeArbitraryObject (x, path, paths, intrinsics, encodeJig) {
  const y = new intrinsics.Object()
  const xprops = Object.assign({}, x)
  const yarbpath = path.concat(['$arb'])
  const yTpath = path.concat(['T'])
  Object.keys(xprops).forEach(key => {
    if (RESERVED_PROPS.has(key)) _throwEnc(x, `Reserved key: ${_text(key)}`)
  })
  y.$arb = _encodeAny(xprops, yarbpath, paths, intrinsics, encodeJig)
  y.T = _encodeAny(Object.getPrototypeOf(x).constructor, yTpath, paths, intrinsics, encodeJig)
  return y
}

// ------------------------------------------------------------------------------------------------
// decode
// ------------------------------------------------------------------------------------------------

/**
 * Decodes from JSON to a rich object
 * @param {object} y JSON to decode
 * @param {object} options._intrinsics The set of intrinsics to use when decoding
 * @param {function} options._decodeJig Gets a jig from its encoded id
 */
function decode (y, options = {}) {
  const root = y
  const decs = new Map() // enc -> dec
  const intrinsics = options._intrinsics || Sandbox._hostIntrinsics
  return _decodeAny(y, root, decs, intrinsics, options._decodeJig)
}

// ------------------------------------------------------------------------------------------------
// _decodeAny
// ------------------------------------------------------------------------------------------------

function _decodeAny (y, root, decs, intrinsics, decodeJig) {
  switch (typeof y) {
    case 'string': return y
    case 'boolean': return y
    case 'number':return _decodeNumber(y)
    case 'object': return _decodeObject(y, root, decs, intrinsics, decodeJig)
    case 'function': return _decodeObject(y, root, decs, intrinsics, decodeJig)
  }
  _throwDec(y, `Unsupported type ${_text(typeof y)}`)
}

// ------------------------------------------------------------------------------------------------
// _decodeNumber
// ------------------------------------------------------------------------------------------------

function _decodeNumber (y) {
  if (isNaN(y) || !isFinite(y)) _throwDec(y, `Unsupported number ${_text(y)}`)
  // Firefox special case. Decodeing -0 to 0 should be safe because -0 should not be encoded.
  if (_negativeZero(y)) return 0
  return y
}

// ------------------------------------------------------------------------------------------------
// _decodeObject
// ------------------------------------------------------------------------------------------------

function _decodeObject (y, root, decs, intrinsics, decodeJig) {
  if (!y) return null

  if (_basicObject(y)) {
    // Check if there are any special props
    let $
    Object.keys(y).forEach(key => {
      if (key.startsWith('$')) {
        if ($) _throwDec(y, 'Multiple $ keys')
        $ = key
      }
    })

    // Primitives
    if ($ === '$und' && y.$und === 1) return undefined
    if ($ === '$n0' && y.$n0 === 1) return -0
    if ($ === '$nan' && y.$nan === 1) return NaN
    if ($ === '$inf' && y.$inf === 1) return Infinity
    if ($ === '$ninf' && y.$ninf === 1) return -Infinity

    // Objects
    if (!$) return _decodeBasicObject(y, root, decs, intrinsics, decodeJig)
    if ($ === '$obj') return _decodeNonstandardObject(y, root, decs, intrinsics, decodeJig)
    if ($ === '$arr') return _decodeSparseArray(y, root, decs, intrinsics, decodeJig)
    if ($ === '$dup') return _decodeDup(y, root, decs, intrinsics, decodeJig)
    if ($ === '$set') return _decodeBasicSet(y, root, decs, intrinsics, decodeJig)
    if ($ === '$map') return _decodeBasicMap(y, root, decs, intrinsics, decodeJig)
    if ($ === '$ui8a') return _decodeBasicUint8Array(y, root, decs, intrinsics, decodeJig)
  }

  if (_basicArray(y)) return _decodeBasicArray(y, root, decs, intrinsics, decodeJig)

  // Revive jigs and arbitrary objects
  if (decodeJig) {
    if (_basicObject(y) && _defined(y.$jig)) return _decodeJig(y, root, decs, intrinsics, decodeJig)
    if (_basicObject(y) && _defined(y.$arb) && _defined(y.T)) return _decodeArbitraryObject(y, root, decs, intrinsics, decodeJig)
  }

  _throwDec(y, `Unsupported object ${_text(y)}`)
}

// ------------------------------------------------------------------------------------------------
// _decodeBasicObject
// ------------------------------------------------------------------------------------------------

function _decodeBasicObject (y, root, decs, intrinsics, decodeJig) {
  const x = new intrinsics.Object()
  decs.set(y, x)
  _deterministicObjectKeys(y).forEach(key => {
    if (RESERVED_PROPS.has(key)) _throwDec(x, `Reserved key: ${_text(key)}`)
    x[key] = _decodeAny(y[key], root, decs, intrinsics, decodeJig)
  })
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeNonstandardObject
// ------------------------------------------------------------------------------------------------

function _decodeNonstandardObject (y, root, decs, intrinsics, decodeJig) {
  const yobj = y.$obj
  if (!(_basicObject(yobj) && yobj)) _throwDec(y, 'Invalid $obj')
  const x = new intrinsics.Object()
  decs.set(y, x)
  _deterministicObjectKeys(yobj).forEach(key => {
    if (RESERVED_PROPS.has(key)) _throwDec(x, `Reserved key: ${_text(key)}`)
    x[key] = _decodeAny(yobj[key], root, decs, intrinsics, decodeJig)
  })
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeSparseArray
// ------------------------------------------------------------------------------------------------

function _decodeSparseArray (y, root, decs, intrinsics, decodeJig) {
  if (!(_basicObject(y.$arr) && y.$arr)) _throwDec(y, 'Invalid $arr')
  const x = new intrinsics.Array()
  decs.set(y, x)
  const yarr = y.$arr
  _deterministicObjectKeys(yarr).forEach(key => {
    if (RESERVED_PROPS.has(key)) _throwDec(x, `Reserved key: ${_text(key)}`)
    x[key] = _decodeAny(yarr[key], root, decs, intrinsics, decodeJig)
  })
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeDup
// ------------------------------------------------------------------------------------------------

function _decodeDup (y, root, decs, intrinsics, decodeJig) {
  const ydup = y.$dup
  if (!(_basicArray(ydup))) _throwDec(y, 'Invalid $dup')
  let enc = root
  for (let i = 0; i < ydup.length; i++) {
    const key = ydup[i]
    if (!(key in enc)) _throwDec(y, 'Invalid dup path')
    enc = enc[key]
  }
  if (!decs.has(enc)) _throwDec(y, 'Invalid dup path')
  const x = decs.get(enc)
  decs.set(y, x)
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeBasicSet
// ------------------------------------------------------------------------------------------------

function _decodeBasicSet (y, root, decs, intrinsics, decodeJig) {
  if (!_basicArray(y.$set)) _throwDec(y, 'Invalid $set')
  if (!(!_defined(y.props) || _basicObject(y.props))) _throwDec(y, 'Invalid $set props')
  const x = new intrinsics.Set()
  decs.set(y, x)
  for (const val of y.$set) {
    x.add(_decodeAny(val, root, decs, intrinsics, decodeJig))
  }
  const props = y.props
  if (props) {
    _deterministicObjectKeys(props).forEach(key => {
      if (RESERVED_PROPS.has(key)) _throwDec(x, `Reserved key: ${_text(key)}`)
      x[key] = _decodeAny(props[key], root, decs, intrinsics, decodeJig)
    })
  }
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeBasicMap
// ------------------------------------------------------------------------------------------------

function _decodeBasicMap (y, root, decs, intrinsics, decodeJig) {
  if (!_basicArray(y.$map)) _throwDec(y, 'Invalid $map')
  if (!(!_defined(y.props) || _basicObject(y.props))) _throwDec(y, 'Invalid $map props')
  const x = new intrinsics.Map()
  decs.set(y, x)
  for (const val of y.$map) {
    if (!_basicArray(val) || val.length !== 2) _throwDec(y)
    const subkey = _decodeAny(val[0], root, decs, intrinsics, decodeJig)
    const subval = _decodeAny(val[1], root, decs, intrinsics, decodeJig)
    x.set(subkey, subval)
  }
  const props = y.props
  if (props) {
    _deterministicObjectKeys(props).forEach(key => {
      if (RESERVED_PROPS.has(key)) _throwDec(x, `Reserved key: ${_text(key)}`)
      x[key] = _decodeAny(props[key], root, decs, intrinsics, decodeJig)
    })
  }
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeBasicUint8Array
// ------------------------------------------------------------------------------------------------

function _decodeBasicUint8Array (y, root, decs, intrinsics, decodeJig) {
  if (typeof y.$ui8a !== 'string') _throwDec(y, 'Invalid $ui8a')
  if (y.$ui8a.split('').some(c => !BASE64_CHARS.has(c))) _throwDec(y, 'Invalid $ui8a base64')
  const buf = Buffer.from(y.$ui8a, 'base64')
  // Safari/WebKit throws if we use TypedArray.from(). So we use new Uint8Array instead.
  const x = new intrinsics.Uint8Array(buf)
  decs.set(x, x)
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeBasicArray
// ------------------------------------------------------------------------------------------------

function _decodeBasicArray (y, root, decs, intrinsics, decodeJig) {
  const x = new intrinsics.Array()
  decs.set(y, x)
  for (const v of y) {
    x.push(_decodeAny(v, root, decs, intrinsics, decodeJig))
  }
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeJig
// ------------------------------------------------------------------------------------------------

function _decodeJig (y, root, decs, intrinsics, decodeJig) {
  const x = decodeJig(y.$jig)
  if (!x) _throwDec(y, 'Not a jig')
  decs.set(y, x)
  return x
}

// ------------------------------------------------------------------------------------------------
// _decodeArbitraryObject
// ------------------------------------------------------------------------------------------------

function _decodeArbitraryObject (y, root, decs, intrinsics, decodeJig) {
  const x = new intrinsics.Object()
  decs.set(y, x)
  const props = _decodeAny(y.$arb, root, decs, intrinsics, decodeJig)
  if (!_basicObject(props)) _throwDec(y, 'Invalid $arb')
  Object.assign(x, props)
  const T = _decodeAny(y.T, root, decs, intrinsics, decodeJig)
  if (!T) _throwDec(y, 'Not code')
  Object.setPrototypeOf(x, T.prototype)
  return x
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _encode: encode,
  _decode: decode
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(33).Buffer))

/***/ }),
/* 24 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * source.js
 *
 * Functionality related to processing raw source code
 */

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// Regexes to capture what is in between brackets
const FUNCTION_INSIDE_REGEX = /^\s*function\s+[a-zA-Z0-9$_]+\s*\(.*?{(.*)}\s*$/s
const CLASS_INSIDE_REGEX = /^\s*class\s+[a-zA-Z0-9$_]+\s*{(.*)}\s*$/s
const CHILD_INSIDE_REGEX = /^\s*class\s+[a-zA-Z0-9$_]+\s+extends\s+[a-zA-Z0-9$_]+\s*{(.*)}\s*$/s

// Regexes to extract the names of code
const FUNCTION_NAME_REGEX = /^(function\s+)([a-zA-Z0-9$_]+)(\s*)\((.*)$/s
const CLASS_NAME_REGEX = /^(class\s+)([a-zA-Z0-9$_]+)(\s*){(.*)$/s
const CHILD_NAME_REGEX = /^(class\s+)([a-zA-Z0-9$_]+)(\s*)extends(.*)$/s

// Regex to match class extension syntax
const CLASS_EXTENSION = /^\s*class\s+[a-zA-Z0-9_$]+\s+extends\s+[a-zA-Z0-9_.$]+\s*{/s

// Regex to match a class method in Safari
const SAFARI_METHOD = /^([a-zA-Z0-9_$]+)\s*\(/s

// Strip coverage from the source code
const UNCOVER_REGEX = /(cov_[a-zA-Z0-9]+\(\).[a-zA-Z0-9\[\]]+\+\+,?)/g // eslint-disable-line

// ------------------------------------------------------------------------------------------------
// _sandbox
// ------------------------------------------------------------------------------------------------

/**
 * Transforms class or function source code that is safe to be evaluted in a sandbox.
 *
 * For classes, if T is a class that extends another class, we make sure the parent class name in
 * the extends expression is the actual name of the parent class, because sometimes the code will
 * be "class X extends SomeLibrary.Y" and what is deployed should be "class X extends Y", or an
 * obfuscator will change the variable name.
 *
 * For functions, Safari sometimes ignores the "function" keyword when printing method calls. We
 * add that back in so that we always can parse the code.
 *
 * Lastly, this may still return slightly different results in different environments, usually
 * related to line returns and whitespace. Functionally though, according to the spec, the code
 * should be the same.
 */
function _sandbox (src, T) {
  const Parent = Object.getPrototypeOf(T)

  if (Parent.prototype) {
    return src.replace(CLASS_EXTENSION, `class ${T.name} extends ${Parent.name} {`)
  }

  const safariMethodMatch = src.match(SAFARI_METHOD)
  if (safariMethodMatch && safariMethodMatch[1] !== 'function') return `function ${src}`

  return src
}

// ------------------------------------------------------------------------------------------------
// _anonymize
// ------------------------------------------------------------------------------------------------

/**
 * Strip out the class or function name from source code
 */
function _anonymize (src) {
  const functionMatches = src.match(FUNCTION_NAME_REGEX)
  if (functionMatches) return `${functionMatches[1]}${functionMatches[3]}(${functionMatches[4]}`

  const classMatches = src.match(CLASS_NAME_REGEX)
  if (classMatches) return `${classMatches[1]}${classMatches[3]}{${classMatches[4]}`

  const childMatches = src.match(CHILD_NAME_REGEX)
  if (childMatches) return `${childMatches[1]}${childMatches[3]}extends${childMatches[4]}`

  throw new Error(`Bad source code: ${src}`)
}

// ------------------------------------------------------------------------------------------------
// _deanonymize
// ------------------------------------------------------------------------------------------------

/**
 * Adds back in the class or function name to anonymized source code
 */
function _deanonymize (src, name) {
  // Code that is excluded for code coverage should not be anonymized. Breaks.
  if (__webpack_require__(6)._cover.includes(name)) return src

  const functionMatches = src.match(/^(function\s)(.*)/s)
  if (functionMatches) return `${functionMatches[1]}${name}${functionMatches[2]}`

  const classMatches = src.match(/^(class\s)(.*)/s)
  if (classMatches) return `${classMatches[1]}${name}${classMatches[2]}`

  throw new Error(`Bad source code: ${src}`)
}

// ------------------------------------------------------------------------------------------------
// _uncover
// ------------------------------------------------------------------------------------------------

function _uncover (src) {
  return process.env.COVER ? src.replace(UNCOVER_REGEX, '') : src
}

// ------------------------------------------------------------------------------------------------
// _check
// ------------------------------------------------------------------------------------------------

/**
 * Checks that some source code can be executed by Run
 */
function _check (src) {
  const match =
    src.match(FUNCTION_INSIDE_REGEX) ||
    src.match(CLASS_INSIDE_REGEX) ||
    src.match(CHILD_INSIDE_REGEX)
  if (!match) throw new Error(`Bad source code: ${src}`)

  let inside = match[1]

  const replaceAll = (string, search, replace) => string.split(search).join(replace)

  // Strip comments out of the inside code
  inside = replaceAll(inside, /\/\/.*?([\n\r])/s, '\n')
  inside = replaceAll(inside, /\/\*.*?\*\//s, '')

  // Strip strings out too
  inside = replaceAll(inside, /(?:`(?:(?:\\`)|[^`])*?`)|(?:"(?:(?:\\")|[^"])*?")|(?:'(?:(?:\\')|[^'])*?')/s, '\'\'')

  // Check that there are not multiple classes or functions like "class A{};class B{}"
  // We can do this by getting the inside of the brackets "};classB{" and then check that
  // there are always matching brackets, ignoring all comments and strings.
  let brackets = 0
  for (let i = 0; i < inside.length; i++) {
    if (inside[i] === '{') brackets++
    if (inside[i] === '}') brackets--
    if (brackets < 0) {
      throw new Error(`Multiple definitions not permitted: ${src}`)
    }
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = { _sandbox, _anonymize, _deanonymize, _uncover, _check }

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 25 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * creation-set.js
 *
 * A ordered set that can quickly check for the existance of creations used in a transaction
 */

const { _sudo } = __webpack_require__(4)
const { _assert, _text } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// CreationSet
// ------------------------------------------------------------------------------------------------

class CreationSet {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor () {
    this._creations = new Set()
    this._deployed = new Map() // origin -> Creation
    this._array = null
  }

  // --------------------------------------------------------------------------
  // _add
  // --------------------------------------------------------------------------

  _add (x) {
    // If we already have it, then stop
    if (this._creations.has(x)) {
      return
    }

    // Ensure it is a creation
    const Creation = __webpack_require__(3)
    _assert(x instanceof Creation)

    // If its not deployed yet, and we don't have it, add it
    const xOrigin = _sudo(() => x.origin)
    if (xOrigin.startsWith('error://') || xOrigin.startsWith('record://')) {
      this._creations.add(x)
      this._array = null
      return
    }

    // Check if there is an existing jig, that it has the same location
    const y = this._deployed.get(xOrigin)
    if (y) {
      const xLocation = _sudo(() => x.location)
      const yLocation = _sudo(() => y.location)
      if (xLocation !== yLocation) {
        const xinfo = `${_text(x)}: ${xLocation}`
        const yinfo = `${_text(y)}: ${yLocation}`
        throw new Error(`Inconsistent worldview\n\n${xinfo}\n${yinfo}`)
      }
      return
    }

    // The jig doesn't exist. Add it.
    this._creations.add(x)
    this._deployed.set(xOrigin, x)
    this._array = null
  }

  // --------------------------------------------------------------------------
  // _delete
  // --------------------------------------------------------------------------

  _delete (x) {
    // If we have this exact creation, remove it
    if (this._creations.has(x)) {
      const xOrigin = _sudo(() => x.origin)
      this._deployed.delete(xOrigin)
      this._creations.delete(x)
      this._array = null
    }

    // Ensure it is a creation
    const Creation = __webpack_require__(3)
    _assert(x instanceof Creation)

    // If its not deployed yet, then we don't have it
    const xOrigin = _sudo(() => x.origin)
    if (xOrigin.startsWith('error://') || xOrigin.startsWith('record://')) {
      return
    }

    // If we have another of the same origin, delete it
    const y = this._deployed.get(xOrigin)
    if (!y) return

    const xLocation = _sudo(() => x.location)
    const yLocation = _sudo(() => y.location)
    if (xLocation !== yLocation) {
      const xinfo = `${_text(x)}: ${xLocation}`
      const yinfo = `${_text(y)}: ${yLocation}`
      throw new Error(`Inconsistent worldview\n\n${xinfo}\n${yinfo}`)
    }

    this._creations.delete(y)
    this._deployed.delete(xOrigin)
    this._array = null
  }

  // --------------------------------------------------------------------------
  // _has
  // --------------------------------------------------------------------------

  _has (x) {
    // If we have this exact creation, return true
    if (this._creations.has(x)) return true

    // Ensure it is a creation
    const Creation = __webpack_require__(3)
    if (!(x instanceof Creation)) return false

    // If its not deployed yet, then we don't have it
    const xOrigin = _sudo(() => x.origin)
    if (xOrigin.startsWith('error://') || xOrigin.startsWith('record://')) {
      return false
    }

    // Check if we have another creation with the same origin
    const y = this._deployed.get(xOrigin)
    if (!y) return false

    const xLocation = _sudo(() => x.location)
    const yLocation = _sudo(() => y.location)
    if (xLocation !== yLocation) {
      const xinfo = `${_text(x)}: ${xLocation}`
      const yinfo = `${_text(y)}: ${yLocation}`
      throw new Error(`Inconsistent worldview\n\n${xinfo}\n${yinfo}`)
    }

    return true
  }

  // --------------------------------------------------------------------------
  // _get
  // --------------------------------------------------------------------------

  _get (x) {
    // If we have this exact creation, return true
    if (this._creations.has(x)) return x

    // Ensure it is a creation
    const Creation = __webpack_require__(3)
    if (!(x instanceof Creation)) return undefined

    // If its not deployed yet, then we don't have it
    const xOrigin = _sudo(() => x.origin)
    if (xOrigin.startsWith('error://') || xOrigin.startsWith('record://')) {
      return undefined
    }

    // Check if we have another creation with the same origin
    const y = this._deployed.get(xOrigin)
    if (!y) return undefined

    const xLocation = _sudo(() => x.location)
    const yLocation = _sudo(() => y.location)
    if (xLocation !== yLocation) {
      const xinfo = `${_text(x)}: ${xLocation}`
      const yinfo = `${_text(y)}: ${yLocation}`
      throw new Error(`Inconsistent worldview\n\n${xinfo}\n${yinfo}`)
    }

    return y
  }

  // --------------------------------------------------------------------------
  // _forEach
  // --------------------------------------------------------------------------

  _forEach (f) {
    let i = 0
    for (const jig of this._creations) {
      f(jig, i++)
    }
  }

  // --------------------------------------------------------------------------
  // _arr
  // --------------------------------------------------------------------------

  _arr () {
    this._array = this._array || Array.from(this._creations)
    return this._array
  }

  // --------------------------------------------------------------------------
  // _size
  // --------------------------------------------------------------------------

  get _size () {
    return this._creations.size
  }

  // --------------------------------------------------------------------------
  // [Symbol.iterator]
  // --------------------------------------------------------------------------

  [Symbol.iterator] () {
    return this._creations[Symbol.iterator]()
  }

  // --------------------------------------------------------------------------
  // static _sameCreation
  // --------------------------------------------------------------------------

  static _sameCreation (x, y) {
    const Creation = __webpack_require__(3)
    if (!(x instanceof Creation)) return false
    if (!(y instanceof Creation)) return false

    if (x === y) return true

    const { _location } = __webpack_require__(8)
    return _sudo(() => {
      if (_location(x.origin)._error) return false
      if (_location(y.origin)._error) return false

      if (x.origin !== y.origin) return false

      if (x.location !== y.location) {
        const xinfo = `${_text(x)}: ${x.location}`
        const yinfo = `${_text(y)}: ${y.location}`
        throw new Error(`Inconsistent worldview\n\n${xinfo}\n${yinfo}`)
      }

      return true
    })
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = CreationSet


/***/ }),
/* 26 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * proxy2.js
 *
 * A proxy that supports intrinsics supported by Run including:
 *
 *    Set
 *    Map
 *    Uint8Array
 *
 * These intrinsics have methods that modify their internal state that proxies don't naturally
 * handle. This is unlike Object and Array instances where every method, even complex ones
 * like sort(), calls proxy handlers. Proxy2 creates new traps for these new intrinsics.
 *
 * Proxy2 also allows the underlying target to be changed. This is an advanced operation. If
 * the underlying target changes, it is important that higher-level handlers are able to deal
 * with the proxy invariants, which affects "prototype":
 *
 *    https://www.ecma-international.org/ecma-262/8.0/#sec-proxy-object-internal-methods-and-internal-slots-get-p-receiver
 *
 * It is not necessary to use Proxy2 everywhere in Run. Proxy2 is used in jigs and inner jig objects.
 *
 * The following handler methods are supported in Proxy2:
 *
 *    Standard traps:           // With underscore prefix
 *
 *      _apply (target, thisArg, args)
 *      _construct (target, args, newTarget)
 *      _defineProperty (target, prop, desc)
 *      _deleteProperty (target, prop)
 *      _get (target, prop, receiver)
 *      _getOwnPropertyDescriptor (target, prop)
 *      _getPrototypeOf (target)
 *      _has (target, prop)
 *      _isExtensible (target)
 *      _ownKeys (target)
 *      _preventExtensions (target)
 *      _set (target, prop, value, receiver)
 *      _setPrototypeOf (target, prototype)
 *
 *    New traps:                // For Set, Map, and Uint8Array targets
 *
 *      _intrinsicGetMethod ()     // Access intrinsic method
 *      _intrinsicOut (value)      // ie. get(), forEach(): object -> object
 *      _intrinsicIn (value)       // ie. add(), set(): object -> object
 *      _intrinsicRead ()          // ie. has(), includes()
 *      _intrinsicUpdate ()        // ie. clear(), delete(), sort()
 */

const {
  _basicSet, _basicMap, _basicUint8Array, _ownGetters, _ownMethods, _assert
} = __webpack_require__(0)
const Sandbox = __webpack_require__(6)
const SI = Sandbox._intrinsics

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TARGETS = new WeakMap() // Proxy -> Target
const HANDLERS = new WeakMap() // Target | Proxy -> Handler
const ORIGINAL_HANDLERS = new WeakMap() // Proxy -> Original Handler

const INTRINSIC_METHODS = new WeakMap() // Target Method -> Proxy Method

const SET_GETTERS = _ownGetters(Set.prototype)
const MAP_GETTERS = _ownGetters(Map.prototype)
const UINT8ARRAY_GETTERS = _ownGetters(Uint8Array.prototype)
  .concat(_ownGetters(Object.getPrototypeOf(Uint8Array.prototype)))

const SET_METHODS = _ownMethods(Set.prototype)
const MAP_METHODS = _ownMethods(Map.prototype)
const UINT8ARRAY_METHODS = _ownMethods(Uint8Array.prototype)
  .concat(_ownMethods(Object.getPrototypeOf(Uint8Array.prototype)))

// JavaScript nicely splits method names across Set, Map, and Uint8Array into reads/updates
const UPDATE_METHODS = ['add', 'clear', 'copyWithin', 'delete', 'fill', 'reverse', 'set', 'sort']
const READ_METHODS = ['entries', 'every', 'filter', 'find', 'findIndex', 'forEach', 'get',
  'has', 'includes', 'indexOf', 'join', 'keys', 'lastIndexOf', 'map', 'reduce', 'reduceRight',
  'slice', 'some', 'subarray', 'toLocaleString', 'toString', 'values', Symbol.iterator]

// ------------------------------------------------------------------------------------------------
// Proxy2
// ------------------------------------------------------------------------------------------------

class Proxy2 {
  constructor (target, handler) {
    const proxy = new SI.Proxy(target, this)

    TARGETS.set(proxy, target)
    HANDLERS.set(target, handler)
    HANDLERS.set(proxy, handler)
    ORIGINAL_HANDLERS.set(proxy, this)

    this._handler = handler
    this._target = target

    // Determine the type of target
    this._isSet = _basicSet(target)
    this._isMap = _basicMap(target)
    this._isUint8Array = _basicUint8Array(target)

    return proxy
  }

  // Standard proxy handlers

  apply (target, thisArg, args) {
    if (!this._handler._apply) return Reflect.apply(this._target, thisArg, args)
    return this._handler._apply(this._target, thisArg, args)
  }

  construct (target, args, newTarget) {
    if (!this._handler._construct) return Reflect.construct(this._target, args, newTarget)
    return this._handler._construct(this._target, args, newTarget)
  }

  defineProperty (target, prop, desc) {
    if (!this._handler._defineProperty) return Reflect.defineProperty(this._target, prop, desc)
    return this._handler._defineProperty(this._target, prop, desc)
  }

  deleteProperty (target, prop) {
    if (!this._handler._deleteProperty) return Reflect.deleteProperty(this._target, prop)
    return this._handler._deleteProperty(this._target, prop)
  }

  getOwnPropertyDescriptor (target, prop) {
    if (!this._handler._getOwnPropertyDescriptor) return Reflect.getOwnPropertyDescriptor(this._target, prop)
    return this._handler._getOwnPropertyDescriptor(this._target, prop)
  }

  getPrototypeOf (target) {
    if (!this._handler._getPrototypeOf) return Reflect.getPrototypeOf(this._target)
    return this._handler._getPrototypeOf(this._target)
  }

  has (target, prop) {
    if (!this._handler._has) return Reflect.has(this._target, prop)
    return this._handler._has(this._target, prop)
  }

  isExtensible (target) {
    if (!this._handler._isExtensible) return Reflect.isExtensible(this._target)
    return this._handler._isExtensible(this._target)
  }

  ownKeys (target) {
    // Safari and Firefox don't like upgrading classes. They update the order of length
    // and name on the proxy, and only the proxy. We could move these properties back to their
    // original position to keep jigs deterministic, but instead we sort them in the membrane.
    if (!this._handler._ownKeys) return Reflect.ownKeys(this._target)
    return this._handler._ownKeys(this._target)
  }

  preventExtensions (target) {
    if (!this._handler._preventExtensions) return Reflect.preventExtensions(this._target)
    return this._handler._preventExtensions(this._target)
  }

  set (target, prop, value, receiver) {
    if (!this._handler._set) return Reflect.set(this._target, prop, value, receiver)
    return this._handler._set(this._target, prop, value, receiver)
  }

  setPrototypeOf (target, prototype) {
    if (!this._handler._setPrototypeOf) return Reflect.setPrototypeOf(this._target, prototype)
    return this._handler._setPrototypeOf(this._target, prototype)
  }

  // Modify get to handle all intrinsic methods using the special traps. Getters and methods are
  // not owned properties, so we don't need to handle getOwnPropertyDescriptor.
  get (target, prop, receiver) {
    // Determine if this prop is a getter on an intrinsic type
    const isIntrinsicGetter =
      (this._isSet && SET_GETTERS.includes(prop)) ||
      (this._isMap && MAP_GETTERS.includes(prop)) ||
      (this._isUint8Array && UINT8ARRAY_GETTERS.includes(prop))

    // Run intrinsic getters directly on target. Otherwise, they fail.
    if (isIntrinsicGetter) {
      // Notify on getting a intrinsic method
      if (this._handler._intrinsicGetMethod) this._handler._intrinsicGetMethod()

      // Getters for these supported types don't return inner values
      return Reflect.get(this._target, prop, this._target)
    }

    // Determine if this is a method on an intrinsic type
    const isIntrinsicMethod =
      (this._isSet && SET_METHODS.includes(prop)) ||
      (this._isMap && MAP_METHODS.includes(prop)) ||
      (this._isUint8Array && UINT8ARRAY_METHODS.includes(prop))

    // Wrap intrinsic methods
    if (isIntrinsicMethod) {
      const value = Reflect.get(this._target, prop, receiver)

      // Notify on getting a intrinsic method
      if (this._handler._intrinsicGetMethod) this._handler._intrinsicGetMethod()

      // If already wrapped, return directly
      if (INTRINSIC_METHODS.has(value)) return INTRINSIC_METHODS.get(value)

      // Otherwise, create a new wrapping and save it to be re-used
      // This wrapped method, like intrinsic prototype methods, is not specific to the instance
      const methodHandler = new IntrinsicMethodHandler(this._isSet, this._isMap, this._isUint8Array, prop)
      const methodProxy = new Proxy(value, methodHandler)
      INTRINSIC_METHODS.set(value, methodProxy)
      return methodProxy
    }

    // Otherwise, use the handler's get
    return this._handler._get
      ? this._handler._get(this._target, prop, receiver)
      : Reflect.get(this._target, prop, receiver)
  }

  static _getHandler (x) { return HANDLERS.get(x) }
  static _getTarget (x) { return TARGETS.get(x) }

  // Advanced. Be very sure you know what you are doing.
  static _setTarget (proxy, newTarget) {
    const oldTarget = TARGETS.get(proxy)
    const handler = HANDLERS.get(proxy)
    const originalHandler = ORIGINAL_HANDLERS.get(proxy)

    _assert(oldTarget)
    originalHandler._target = newTarget

    HANDLERS.delete(oldTarget)
    HANDLERS.set(newTarget, handler)
    TARGETS.set(proxy, newTarget)
  }
}

// ------------------------------------------------------------------------------------------------
// IntrinsicMethodHandler
// ------------------------------------------------------------------------------------------------

// Assumes intrinsic methods are already immutable and require no special handling
class IntrinsicMethodHandler {
  constructor (isSet, isMap, isUint8Array, prop) {
    this._isSet = isSet
    this._isMap = isMap
    this._basicUint8Array = isUint8Array

    this._prop = prop

    this._read = READ_METHODS.includes(prop)
    this._update = UPDATE_METHODS.includes(prop)

    this._returnsThis =
      (isSet && ['add'].includes(prop)) ||
      (isMap && ['set'].includes(prop)) ||
      (isUint8Array && ['copyWithin', 'fill', 'reverse', 'sort'].includes(prop))

    // Uint8Array instances don't need a proxy iterator because their values are primitives
    this._returnsWrappedIterator =
      (isSet && ['entries', 'values', Symbol.iterator].includes(prop)) ||
      (isMap && ['entries', 'keys', 'values', Symbol.iterator].includes(prop))

    // Most iterators return a single value each time. Pair iterators return two.
    this._pairIterator = this._returnsWrappedIterator && prop === 'entries'

    // Uint8Array instances don't need find to return a proxy value because it is a primitive
    this._returnsValue = isMap && prop === 'get'

    this._passesInFirstValue =
      (isSet && ['add', 'delete', 'has'].includes(prop)) ||
      (isMap && ['delete', 'get', 'has', 'set'].includes(prop))

    this._passesInSecondValue = isMap && prop === 'set'

    this._forEachCallback = (isSet && prop === 'forEach') || (isMap && prop === 'forEach')
  }

  apply (target, thisArg, args) {
    const handler = Proxy2._getHandler(thisArg)

    // Record inner reads and inner updates based on the method
    if (handler) {
      if (handler._intrinsicRead && this._read) handler._intrinsicRead()
      if (handler._intrinsicUpdate && this._update) handler._intrinsicUpdate()
    }

    // Convert arguments passed to callback functions if necessary
    if (this._forEachCallback) {
      args[0] = x => handler && handler._intrinsicOut && x ? handler._intrinsicOut(x) : x
    }

    // Convert the first argument going in if necessary
    if (this._passesInFirstValue && args[0] && handler && handler._intrinsicIn) {
      args[0] = handler._intrinsicIn(args[0])
    }

    // Convert the second argument going in if necessary
    if (this._passesInSecondValue && args[1] && handler && handler._intrinsicIn) {
      args[1] = handler._intrinsicIn(args[1])
    }

    // The the underlying intrinsic type if it exists
    const thisArgTarget = Proxy2._getTarget(thisArg) || thisArg

    // Run the function with the modified args on the original target
    const ret = Reflect.apply(target, thisArgTarget, args)

    // If this method is supposed to return self, return it
    if (this._returnsThis) return thisArg

    // If this method returns a single value, convert and return it
    if (this._returnsValue) return handler && handler._intrinsicOut && ret ? handler._intrinsicOut(ret) : ret

    // Iterator need to be specially handled
    if (this._returnsWrappedIterator) {
      return new SandboxedWrappedIterator(ret, handler, this._pairIterator)
    }

    // Otherwise, return the original return value, which is some non-inner object
    return ret
  }
}

// ------------------------------------------------------------------------------------------------
// SandboxedWrappedIterator
// ------------------------------------------------------------------------------------------------

// Iterator that can replace every value using a handler's _intrinsicOut method
class WrappedIterator {
  constructor (it, handler, pair) {
    this._it = it
    this._handler = handler
    this._pair = pair
  }

  next () {
    const n = this._it.next()

    const ret = {}
    ret.done = n.done
    ret.value = n.value

    if (this._handler && this._handler._intrinsicOut) {
      if (this._pair && ret.value) {
        const a = ret.value[0] ? this._handler._intrinsicOut(ret.value[0]) : ret.value[0]
        const b = ret.value[1] ? this._handler._intrinsicOut(ret.value[1]) : ret.value[1]
        ret.value = [a, b]
      } else {
        ret.value = ret.value ? this._handler._intrinsicOut(ret.value) : ret.value
      }
    }

    return ret
  }

  [Symbol.iterator] () { return this }
}

const native = true
const anonymize = false
const SandboxedWrappedIterator = Sandbox._sandboxType(WrappedIterator, {}, native, anonymize)[0]

// ------------------------------------------------------------------------------------------------

module.exports = Proxy2


/***/ }),
/* 27 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * transaction.js
 *
 * Transaction API for building transactions manually
 */

const bsv = __webpack_require__(5)
const Record = __webpack_require__(10)
const _replay = __webpack_require__(35)
const Log = __webpack_require__(2)
const { _assert, _text, _Timeout, _activeKernel } = __webpack_require__(0)
const { _extractMetadata } = __webpack_require__(34)
const { ArgumentError } = __webpack_require__(11)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Transaction'

// ------------------------------------------------------------------------------------------------
// Transaction
// ------------------------------------------------------------------------------------------------

class Transaction {
  constructor () {
    this._record = new Record()
    this._record._replaying = false
    this._record._autopublish = false
    this._base = new bsv.Transaction()

    this._commit = null // Replayed or built commit
    this._tx = null // Replayed or built tx
    this._txid = null

    this._buildPromise = null
    this._payPromise = null
    this._signPromise = null
    this._exportPromise = null
    this._publishPromise = null
    this._cachePromise = null

    this._published = false // Record whether published to prevent further updates
    this._cached = false // Record whether cached to prevent further updates
  }

  // --------------------------------------------------------------------------
  // setters
  // --------------------------------------------------------------------------

  set base (rawtx) {
    const tx = new bsv.Transaction(rawtx)
    if (tx.inputs.length) {
      throw new Error('Only custom outputs are supported in base transactions')
    }
    this._base = tx
  }

  // --------------------------------------------------------------------------
  // getters
  // --------------------------------------------------------------------------

  get base () {
    return this._base.toString('hex')
  }

  // --------------------------------------------------------------------------

  get outputs () {
    return [...this._record._outputs]
  }

  // --------------------------------------------------------------------------

  get deletes () {
    return [...this._record._deletes]
  }

  // --------------------------------------------------------------------------
  // update
  // --------------------------------------------------------------------------

  update (callback) {
    if (typeof callback !== 'function') throw new ArgumentError('Invalid callback')

    if (Log._infoOn) Log._info(TAG, 'Update')

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('update disabled during atomic update')
    if (this._exportPromise) throw new Error('update disabled during export')
    if (this._publishPromise) throw new Error('update disabled during publish')
    if (this._payPromise) throw new Error('update disabled during pay')
    if (this._signPromise) throw new Error('update disabled during sign')
    if (this._buildPromise) throw new Error('update disabled during build')
    if (this._cachePromise) throw new Error('update disabled during cache')
    if (this._published) throw new Error('update disabled once published')
    if (this._cached) throw new Error('update disabled once cached')

    // Any updates clear the saved commit
    this._commit = null
    this._tx = null
    this._txid = null

    const savedRecord = Record._CURRENT_RECORD

    try {
      // Replace the current record with ours
      Record._CURRENT_RECORD = this._record

      // Begin recording
      Record._CURRENT_RECORD._begin()

      // Perform updates atomically
      let ret = null
      try {
        Transaction._ATOMICALLY_UPDATING = true
        ret = callback()
      } finally {
        Transaction._ATOMICALLY_UPDATING = false
      }

      // Async updates are not allowed because we require atomicity
      if (ret instanceof Promise) throw new Error('async transactions not supported')

      // Stop recording
      Record._CURRENT_RECORD._end()

      // Return the return value of the callback
      return ret
    } catch (e) {
      // When an error occurs, all changes are reverted
      this.rollback()

      // Rethrow
      throw e
    } finally {
      Record._CURRENT_RECORD = savedRecord
    }
  }

  // --------------------------------------------------------------------------
  // pay
  // --------------------------------------------------------------------------

  pay () {
    if (Transaction._ATOMICALLY_UPDATING) throw new Error('pay disabled during atomic update')
    if (this._signPromise) throw new Error('pay disabled during sign')
    if (this._exportPromise) throw new Error('pay disabled during export')
    if (this._publishPromise) throw new Error('pay disabled during publish')
    if (this._payPromise) return this._payPromise
    if (this._buildPromise) throw new Error('pay disabled during build')
    if (this._cachePromise) throw new Error('pay disabled during cache')
    if (this._published) throw new Error('pay disabled once published')
    if (this._cached) throw new Error('pay disabled once cached')

    const kernel = _activeKernel()
    const timeout = new _Timeout('pay', kernel._timeout)

    const payAsync = async () => {
      const { _PURSE_SAFETY_QUEUE, _payForTx } = __webpack_require__(20)
      await _PURSE_SAFETY_QUEUE._enqueue(async () => {
        const feePerKb = bsv.Transaction.FEE_PER_KB
        this._tx = await _payForTx(this._tx, this._commit, feePerKb)
        this._txid = null
        timeout._check()
      })
    }

    this._payPromise = this._build(timeout, false).then(() => payAsync())

    this._payPromise
      .then(() => { this._payPromise = null })
      .catch(e => { this._payPromise = null; throw e })

    return this._payPromise
  }

  // --------------------------------------------------------------------------
  // sign
  // --------------------------------------------------------------------------

  sign () {
    if (Transaction._ATOMICALLY_UPDATING) throw new Error('sign disabled during atomic update')
    if (this._payPromise) throw new Error('sign disabled during pay')
    if (this._exportPromise) throw new Error('sign disabled during export')
    if (this._publishPromise) throw new Error('sign disabled during publish')
    if (this._signPromise) return this._signPromise
    if (this._buildPromise) throw new Error('sign disabled during build')
    if (this._cachePromise) throw new Error('sign disabled during cache')
    if (this._published) throw new Error('sign disabled once published')
    if (this._cached) throw new Error('sign disabled once cached')

    const kernel = _activeKernel()
    const timeout = new _Timeout('sign', kernel._timeout)

    const signAsync = async () => {
      const { _PURSE_SAFETY_QUEUE, _signTx } = __webpack_require__(20)
      await _PURSE_SAFETY_QUEUE._enqueue(async () => {
        const feePerKb = bsv.Transaction.FEE_PER_KB
        this._tx = await _signTx(this._tx, this._commit, feePerKb)
        this._txid = null
        timeout._check()
      })
    }

    this._signPromise = this._build(timeout, false).then(() => signAsync())

    this._signPromise
      .then(() => { this._signPromise = null })
      .catch(e => { this._signPromise = null; throw e })

    return this._signPromise
  }

  // --------------------------------------------------------------------------
  // cache
  // --------------------------------------------------------------------------

  cache () {
    if (Log._infoOn) Log._info(TAG, 'Cache')

    const start = new Date()

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('cache disabled during atomic update')
    if (this._payPromise) throw new Error('cache disabled during pay')
    if (this._signPromise) throw new Error('cache disabled during sign')
    if (this._exportPromise) throw new Error('cache disabled during export')
    if (this._publishPromise) throw new Error('cache disabled during publish')
    if (this._buildPromise) throw new Error('cache disabled during build')
    if (this._cachePromise) return this._cachePromise
    if (this._cached) return true

    const kernel = _activeKernel()
    const timeout = new _Timeout('cache', kernel._timeout)

    const cacheAsync = async () => {
      const { _cacheStates, _finalizeLocationsAndOrigins } = __webpack_require__(20)

      // Add to cache, both outputs and deleted states
      this._txid = this._txid || this._tx.hash
      await _cacheStates(this._commit, this._commit._states, this._txid)
      timeout._check()

      // Apply bindings to output and deleted jigs and their after snapshots
      _finalizeLocationsAndOrigins(this._commit, this._txid)
    }

    this._cachePromise = this._build(timeout, false)
      .then(() => cacheAsync())

    const logEnd = () => { if (Log._debugOn) Log._debug(TAG, 'Cache (end): ' + (new Date() - start) + 'ms') }

    // Wait for publish to finish
    this._cachePromise
      .then(() => { logEnd(); this._cached = true; this._cachePromise = null })
      .catch(e => { this._cachePromise = null; throw e })

    return this._cachePromise
  }

  // --------------------------------------------------------------------------
  // publish
  // --------------------------------------------------------------------------

  publish (options = { }) {
    if (Log._infoOn) Log._info(TAG, 'Publish')

    const start = new Date()

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('publish disabled during atomic update')
    if (this._payPromise) throw new Error('publish disabled during pay')
    if (this._signPromise) throw new Error('publish disabled during sign')
    if (this._exportPromise) throw new Error('publish disabled during export')
    if (this._publishPromise) return this._publishPromise
    if (this._published) return true
    if (this._buildPromise) throw new Error('publish disabled during build')
    if (this._cachePromise) throw new Error('publish disabled during cache')

    if (typeof options.pay !== 'undefined' && typeof options.pay !== 'boolean') {
      throw new ArgumentError(`Invalid pay: ${_text(options.pay)}`)
    }

    if (typeof options.sign !== 'undefined' && typeof options.sign !== 'boolean') {
      throw new ArgumentError(`Invalid sign: ${_text(options.sign)}`)
    }

    const pay = typeof options.pay === 'undefined' ? true : options.pay
    const sign = typeof options.sign === 'undefined' ? true : options.sign

    if (this._cached && pay) throw new Error('pay disabled once cached')
    if (this._cached && sign) throw new Error('sign disabled once cached')

    const kernel = _activeKernel()
    const timeout = new _Timeout('publish', kernel._timeout)

    this._publishPromise = this._build(timeout, true)
      .then(() => this._finishAndPublish(pay, sign, timeout))

    const logEnd = () => { if (Log._debugOn) Log._debug(TAG, 'Publish (end): ' + (new Date() - start) + 'ms') }

    // Wait for publish to finish
    this._publishPromise = this._publishPromise
      .then(() => { logEnd(); this._published = true; this._publishPromise = null })
      .catch(e => { this._publishPromise = null; throw e })

    // Return the txid
    this._publishPromise = this._publishPromise.then(() => this._txid)

    return this._publishPromise
  }

  // --------------------------------------------------------------------------
  // export
  // --------------------------------------------------------------------------

  export (options = {}) {
    if (Log._infoOn) Log._info(TAG, 'Export')

    const start = new Date()

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('export disabled during atomic update')
    if (this._payPromise) throw new Error('export disabled during pay')
    if (this._signPromise) throw new Error('export disabled during sign')
    if (this._publishPromise) throw new Error('export disabled during publish')
    if (this._cachePromise) throw new Error('export disabled during cache')
    if (this._exportPromise) return this._exportPromise

    if (typeof options.pay !== 'undefined' && typeof options.pay !== 'boolean') {
      throw new ArgumentError(`Invalid pay: ${_text(options.pay)}`)
    }

    if (typeof options.sign !== 'undefined' && typeof options.sign !== 'boolean') {
      throw new ArgumentError(`Invalid sign: ${_text(options.sign)}`)
    }

    const pay = typeof options.pay === 'undefined' ? true : options.pay
    const sign = typeof options.sign === 'undefined' ? true : options.sign

    if (this._cached && pay) throw new Error('pay disabled once cached')
    if (this._cached && sign) throw new Error('sign disabled once cached')
    if (this._published && pay) throw new Error('pay disabled once published')
    if (this._published && sign) throw new Error('sign disabled once published')

    const kernel = _activeKernel()
    const timeout = new _Timeout('export', kernel._timeout)

    this._exportPromise = this._build(timeout, false)
      .then(() => this._finishAndExport(pay, sign, timeout))

    const logEnd = () => { if (Log._debugOn) Log._debug(TAG, 'Export (end): ' + (new Date() - start) + 'ms') }

    this._exportPromise
      .then(rawtx => { logEnd(); this._exportPromise = null; return rawtx })
      .catch(e => { this._exportPromise = null; throw e })

    return this._exportPromise
  }

  // --------------------------------------------------------------------------
  // rollback
  // --------------------------------------------------------------------------

  rollback () {
    if (Log._infoOn) Log._info(TAG, 'Rollback')

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('rollback disabled during atomic update')

    // Cannot rollback in the middle of publishing or exporting
    if (this._exportPromise) throw new Error('rollback disabled during export')
    if (this._publishPromise) throw new Error('rollback disabled during publish')
    if (this._payPromise) throw new Error('rollback disabled during pay')
    if (this._signPromise) throw new Error('rollback disabled during sign')
    if (this._buildPromise) throw new Error('rollback disabled during build')
    if (this._cachePromise) throw new Error('rollback disabled during cache')
    if (this._published) throw new Error('rollback disabled once published')

    // Roll back the record which rolls back all states
    this._record._rollback()
    this._record = new Record()
    this._record._replaying = false
    this._record._autopublish = false
  }

  // --------------------------------------------------------------------------
  // import
  // --------------------------------------------------------------------------

  static async _import (tx, txid, kernel) {
    if (Log._infoOn) Log._info(TAG, 'Replay')

    const metadata = _extractMetadata(tx)
    const published = false
    const jigToSync = null
    const timeout = undefined
    const preverify = false
    const commit = await _replay(tx, txid, metadata, kernel, published, jigToSync, timeout, preverify)

    const transaction = new Transaction()
    transaction._record = commit._record
    transaction._commit = commit
    transaction._tx = tx
    transaction._txid = txid
    return transaction
  }

  // --------------------------------------------------------------------------
  // _build
  // --------------------------------------------------------------------------

  _build (timeout, publishing) {
    // Only build once
    if (this._commit && this._tx) {
      if (publishing) this._commit._setPublishing(true)
      return Promise.resolve()
    }
    _assert(!this._commit && !this._tx)

    // If already building, piggy-back on that
    if (this._buildPromise) return this._buildPromise

    // Convert the record into a commit
    const commit = this._record._commit()

    // If no commit, then nothing to export
    if (!commit) throw new Error('Nothing to commit')

    // Set the base transaction
    commit._base = this._base

    // If we need this commit activated (in run.transaction), do it now
    if (publishing) commit._setPublishing(true)

    this._buildPromise = this._buildAsync(commit, timeout)

    this._buildPromise
      .then(rawtx => { this._buildPromise = null; return rawtx })
      .catch(e => { this._buildPromise = null; throw e })

    return this._buildPromise
  }

  // --------------------------------------------------------------------------

  async _buildAsync (commit, timeout) {
    try {
      // Wait for upstream dependencies to publish
      await commit._onReady()

      const record = commit._record

      // There must be no upstream dependencies
      _assert(!record._upstream.length)

      const {
        _checkNoTimeTravel,
        _assignInitialOwners,
        _generateOutputScripts,
        _finalizeOwnersAndSatoshis,
        _createMasterList,
        _captureStates,
        _hashStates,
        _createExec,
        _createMetadata,
        _createPartialTx,
        _preverify
      } = __webpack_require__(20)

      // Assigns initial owners in the jigs after snapshots
      await _assignInitialOwners(commit)
      timeout._check()

      // Generate the output scripts
      const outputScripts = await _generateOutputScripts(commit)
      timeout._check()

      // Make sure references do not go back in time
      await _checkNoTimeTravel(commit, timeout)
      timeout._check()

      // Make owners and satoshis bound properties
      _finalizeOwnersAndSatoshis(commit)

      // Create the sorted master list used to serialize actions
      const masterList = _createMasterList(record)

      // Calculate the serialized states of output and deleted jigs
      const states = await _captureStates(commit, timeout)
      timeout._check()

      // Calculate state hashes
      const hashes = await _hashStates(commit, states)

      // Convert the actions to executable statements
      const exec = _createExec(record, masterList)

      // Create the OP_RETURN metadata json
      const metadata = _createMetadata(commit, hashes, exec, masterList)

      // Create the unpaid and unsigned tx
      const feePerKb = bsv.Transaction.FEE_PER_KB
      const partialtx = _createPartialTx(commit, metadata, outputScripts, feePerKb)

      // Preverify the transaction we generated so we have some assurance it will load.
      // This is a safety check for Run bugs. It is not intended to catch consensus failures.
      await _preverify(commit._kernel, record, states, metadata, partialtx, timeout)
      timeout._check()

      // Save the built tx
      this._commit = commit
      this._tx = partialtx
      this._txid = null
    } catch (e) {
      if (commit._publishing()) commit._onPublishFail(e)
      throw e
    }
  }

  // --------------------------------------------------------------------------
  // _finishAndPublish
  // --------------------------------------------------------------------------

  /**
   * Pays and signs for an existing transaction before publishing it
   */
  async _finishAndPublish (pay, sign, timeout) {
    const {
      _captureStates,
      _PURSE_SAFETY_QUEUE,
      _payForTx,
      _cancelPaidTx,
      _signTx,
      _checkTx,
      _broadcastTx,
      _finalizeLocationsAndOrigins,
      _cacheStates
    } = __webpack_require__(20)

    if (!this._commit._publishing()) this._commit._setPublishing(true)

    try {
      const record = this._commit._record

      // Calculate the serialized states of output and deleted jigs
      const states = await _captureStates(this._commit, timeout)
      timeout._check()

      this._txid = await _PURSE_SAFETY_QUEUE._enqueue(async () => {
        const partialtx = this._tx
        const feePerKb = bsv.Transaction.FEE_PER_KB

        // Add inputs and outputs to pay for the transaction
        const paidtx = pay ? await _payForTx(partialtx, this._commit, feePerKb) : partialtx
        timeout._check()

        let signedtx = null

        try {
          // Sign the jig owners
          signedtx = sign ? await _signTx(paidtx, this._commit, feePerKb) : paidtx
          timeout._check()

          // Check that all signatures are present. This provides a nicer error.
          _checkTx(signedtx, record, partialtx)
        } catch (e) {
          try {
            await _cancelPaidTx(paidtx, this._commit._kernel._purse)
          } catch (e) {
            if (Log._errorOn) Log._error(TAG, e)
          }
          throw e
        }

        // Broadcast the rawtx to the blockchain
        let txid = null
        try {
          txid = await _broadcastTx(this._commit, signedtx, timeout)
        } catch (e) {
          try {
            await _cancelPaidTx(paidtx, this._commit._kernel._purse)
          } catch (e) {
            if (Log._errorOn) Log._error(TAG, e)
          }
          throw e
        }

        const badTxid = typeof txid !== 'string' || txid.length !== 64
        if (badTxid) throw new Error(`Invalid txid: ${_text(txid)}`)

        timeout._check()

        // Return the paid and signed transaction
        return txid
      })
      timeout._check()

      // Apply bindings to output and deleted jigs and their after snapshots
      _finalizeLocationsAndOrigins(this._commit, this._txid)

      // Add to cache, both outputs and deleted states
      await _cacheStates(this._commit, states, this._txid)
      timeout._check()

      // Add this txid to the trusted set if there were any deploys or upgrades
      const anythingToTrust =
        record._actions.some(action => action.op() === 'DEPLOY') ||
        record._actions.some(action => action.op() === 'UPGRADE')

      if (anythingToTrust) {
        this._commit._kernel._trustlist.add(this._txid)
      }

      this._commit._onPublishSucceed()
    } catch (e) {
      this._commit._onPublishFail(e)
      throw e
    }
  }

  // --------------------------------------------------------------------------
  // _finishAndExport
  // --------------------------------------------------------------------------

  /**
   * Signs and pays for an already-existing transaction before exporting
   */
  async _finishAndExport (pay, sign, timeout) {
    const {
      _PURSE_SAFETY_QUEUE,
      _payForTx,
      _cancelPaidTx,
      _signTx
    } = __webpack_require__(20)

    // Serialize from pay to broadcast because the purse may consume outputs that should not be
    // consumed again in another parallel publish, but the purse may not mark them as spent right
    // away. In the future we might consider making this serialization optional for smarter purses.
    const tx = await _PURSE_SAFETY_QUEUE._enqueue(async () => {
      const partialTx = this._tx
      const feePerKb = bsv.Transaction.FEE_PER_KB

      // Add inputs and outputs to pay for the transaction
      const paidtx = pay ? await _payForTx(partialTx, this._commit, feePerKb) : partialTx
      timeout._check()

      let signedtx = null

      try {
        // Sign the jig owners
        signedtx = sign ? await _signTx(paidtx, this._commit, feePerKb) : paidtx
        timeout._check()
      } catch (e) {
        try {
          await _cancelPaidTx(paidtx, this._commit._kernel._purse)
        } catch (e) {
          if (Log._errorOn) Log._error(TAG, e)
        }
        throw e
      }

      // Return the paid and signed transaction
      return signedtx
    })
    timeout._check()

    return tx.toString('hex')
  }
}

// ------------------------------------------------------------------------------------------------

// Variable indicating whether we are in an update() and should not allow changes to Run
Transaction._ATOMICALLY_UPDATING = false

module.exports = Transaction


/***/ }),
/* 28 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(Buffer) {/**
 * state-filter.js
 *
 * A specialized bloom filter used to filter states returned from the Run State API.
 *
 * The local state filter you build is a JSON object. You call functions to change it.
 * The bloom filter internally uses the murmur3 hash with a seed of 1.
 *
 * USAGE
 * -----
 *
 * Creating a new state filter
 *
 *      const filter = StateFilter.create()
 *
 * Adding and removing keys
 *
 *      StateFilter.add(filter, key)
 *      StateFilter.remove(filter, key)
 *
 * Converting to and from base64
 *
 *      const base64 = StateFilter.toBase64(filter)
 *      const filter = StateFilter.fromBase64(base64)
 *
 * CONFIGURATION
 * -------------
 *
 * The default settings are for filtering out a small number (< 100) of Code (contract) states,
 * because those are usually the ones that we already have before we make the API call. If that
 * is your case, then you do not need to pass parameters into the constructor. Apps with a larger
 * number of filtered states may should bump up the default settings to get good behavior. You
 * may use https://hur.st/bloomfilter to pick a good size and number of hashes.
 *
 * REMOVALS
 * --------
 *
 * The StateFilter supports removals of keys. This can be used to remove states that are expired
 * from your state cache from the filter so they are retrieved again next time. The StateFilter
 * does this by storing a count in each bucket instead of a simple boolean. Only keys which
 * were previously added may be removed.
 *
 * SERIALIZATION
 * -------------
 *
 * The StateFilter supports two serializations - one as JSON, which is its default form, which
 * stores all of the counts in the filter, which is used locally, and supports removals. The second
 * is as a Base64 string which may be used in an API call, which does not store the counts, and is
 * efficiently encoded.
 */

// ------------------------------------------------------------------------------------------------
// create
// ------------------------------------------------------------------------------------------------

function create (size = 960, numHashes = 7) {
  if (typeof size !== 'number' || !Number.isInteger(size) || size <= 0) throw new Error('invalid size: ' + size)
  if (size % 8 !== 0) throw new Error('size must be a multiple of 8: ' + size)
  if (typeof numHashes !== 'number' || !Number.isInteger(numHashes) || numHashes <= 0) throw new Error('invalid numHashes: ' + numHashes)

  return {
    buckets: new Array(size).fill(0),
    numHashes: numHashes
  }
}

// ------------------------------------------------------------------------------------------------
// add
// ------------------------------------------------------------------------------------------------

function add (filter, key) {
  if (typeof key !== 'string') throw new Error('invalid key: ' + key)

  if (this.possiblyHas(filter, key)) return

  for (let i = 1; i <= filter.numHashes; i++) {
    const n = hash(key, i) % filter.buckets.length
    filter.buckets[n]++
  }
}

// ------------------------------------------------------------------------------------------------
// remove
// ------------------------------------------------------------------------------------------------

function remove (filter, key) {
  if (typeof key !== 'string') throw new Error('invalid key: ' + key)

  const buckets = []
  for (let i = 1; i <= filter.numHashes; i++) {
    const n = hash(key, i) % filter.buckets.length
    if (!filter.buckets[n]) return false
    buckets.push(n)
  }

  buckets.forEach(n => filter.buckets[n]--)

  return true
}

// ------------------------------------------------------------------------------------------------
// possiblyHas
// ------------------------------------------------------------------------------------------------

function possiblyHas (filter, key) {
  for (let i = 1; i <= filter.numHashes; i++) {
    const n = hash(key, i) % filter.buckets.length
    if (!filter.buckets[n]) return false
  }
  return true
}

// ------------------------------------------------------------------------------------------------
// toBase64
// ------------------------------------------------------------------------------------------------

function toBase64 (filter) {
  const b = filter.buckets

  const data = new Array(1 + b.length / 8)

  data[0] = filter.numHashes

  for (let i = 0, j = 1; i < b.length; i += 8, j++) {
    data[j] =
        ((b[i + 0] > 0) << 7) |
        ((b[i + 1] > 0) << 6) |
        ((b[i + 2] > 0) << 5) |
        ((b[i + 3] > 0) << 4) |
        ((b[i + 4] > 0) << 3) |
        ((b[i + 5] > 0) << 2) |
        ((b[i + 6] > 0) << 1) |
        ((b[i + 7] > 0) << 0)
  }

  return Buffer.from(data).toString('base64')
}

// ------------------------------------------------------------------------------------------------
// fromBase64
// ------------------------------------------------------------------------------------------------

function fromBase64 (base64) {
  const data = Buffer.from(base64, 'base64')

  const numHashes = data[0]
  const buckets = new Array((data.length - 1) * 8)

  for (let i = 1, j = 0; i < data.length; i++, j += 8) {
    buckets[j + 0] = (data[i] >> 7) & 1
    buckets[j + 1] = (data[i] >> 6) & 1
    buckets[j + 2] = (data[i] >> 5) & 1
    buckets[j + 3] = (data[i] >> 4) & 1
    buckets[j + 4] = (data[i] >> 3) & 1
    buckets[j + 5] = (data[i] >> 2) & 1
    buckets[j + 6] = (data[i] >> 1) & 1
    buckets[j + 7] = (data[i] >> 0) & 1
  }

  return { numHashes, buckets }
}

// ------------------------------------------------------------------------------------------------
// murmurhash3_32_gc
// ------------------------------------------------------------------------------------------------

/**
 * JS Implementation of MurmurHash3 (r136) (as of May 20, 2011)
 *
 * @author <a href="mailto:gary.court@gmail.com">Gary Court</a>
 * @see http://github.com/garycourt/murmurhash-js
 * @author <a href="mailto:aappleby@gmail.com">Austin Appleby</a>
 * @see http://sites.google.com/site/murmurhash/
 *
 * @param {string} key ASCII only
 * @param {number} seed Positive integer only
 * @return {number} 32-bit positive integer hash
 */
function hash (key, seed) {
  const remainder = key.length & 3 // key.length % 4
  const bytes = key.length - remainder
  let h1 = seed
  const c1 = 0xcc9e2d51
  const c2 = 0x1b873593
  let i = 0
  let h1b = 0
  let k1 = 0

  while (i < bytes) {
    k1 =
        ((key.charCodeAt(i) & 0xff)) |
        ((key.charCodeAt(++i) & 0xff) << 8) |
        ((key.charCodeAt(++i) & 0xff) << 16) |
        ((key.charCodeAt(++i) & 0xff) << 24)
    ++i

    k1 = ((((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16))) & 0xffffffff
    k1 = (k1 << 15) | (k1 >>> 17)
    k1 = ((((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16))) & 0xffffffff

    h1 ^= k1
    h1 = (h1 << 13) | (h1 >>> 19)
    h1b = ((((h1 & 0xffff) * 5) + ((((h1 >>> 16) * 5) & 0xffff) << 16))) & 0xffffffff
    h1 = (((h1b & 0xffff) + 0x6b64) + ((((h1b >>> 16) + 0xe654) & 0xffff) << 16))
  }

  k1 = 0

  switch (remainder) {
    case 3: k1 ^= (key.charCodeAt(i + 2) & 0xff) << 16 // eslint-disable-line
    case 2: k1 ^= (key.charCodeAt(i + 1) & 0xff) << 8 // eslint-disable-line
    case 1: k1 ^= (key.charCodeAt(i) & 0xff) // eslint-disable-line

      k1 = (((k1 & 0xffff) * c1) + ((((k1 >>> 16) * c1) & 0xffff) << 16)) & 0xffffffff
      k1 = (k1 << 15) | (k1 >>> 17)
      k1 = (((k1 & 0xffff) * c2) + ((((k1 >>> 16) * c2) & 0xffff) << 16)) & 0xffffffff
      h1 ^= k1
  }

  h1 ^= key.length

  h1 ^= h1 >>> 16
  h1 = (((h1 & 0xffff) * 0x85ebca6b) + ((((h1 >>> 16) * 0x85ebca6b) & 0xffff) << 16)) & 0xffffffff
  h1 ^= h1 >>> 13
  h1 = ((((h1 & 0xffff) * 0xc2b2ae35) + ((((h1 >>> 16) * 0xc2b2ae35) & 0xffff) << 16))) & 0xffffffff
  h1 ^= h1 >>> 16

  return h1 >>> 0
}

// ------------------------------------------------------------------------------------------------

module.exports = { create, add, remove, possiblyHas, toBase64, fromBase64 }

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(33).Buffer))

/***/ }),
/* 29 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(process) {/**
 * environment.js
 *
 * Checks that the environment is valid for the Run kernel
 */

const bsv = __webpack_require__(5)

// ------------------------------------------------------------------------------------------------
// _nodejs
// ------------------------------------------------------------------------------------------------

function _nodejs() {
  return process && process.version
}

// ------------------------------------------------------------------------------------------------
// _browser
// ------------------------------------------------------------------------------------------------

function _browser() {
  return typeof window !== 'undefined' && window.document && window.navigator
}

// ------------------------------------------------------------------------------------------------
// _check
// ------------------------------------------------------------------------------------------------

function _check() {
  _checkBsvLibrary()
  _checkNode()
  _checkBrowser()
}

// ------------------------------------------------------------------------------------------------
// _checkBsvLibrary
// ------------------------------------------------------------------------------------------------

function _checkBsvLibrary() {
  if (typeof bsv.version !== 'string' || !bsv.version.startsWith('v1.')) {
    const hint = 'Hint: Please install bsv version 1.5.4 or install the Run SDK from NPM'
    throw new Error(`Run requires version 1.x of the bsv library\n\n${hint}`)
  }
}

// ------------------------------------------------------------------------------------------------
// _checkNode
// ------------------------------------------------------------------------------------------------

function _checkNode() {
  if (!_nodejs()) return

  const nodeVersion = Number(process.version.match(/^v(\d+\.\d+)/)[1])
  if (nodeVersion < 10) throw new Error('Run is supported only on Node 10 and above')
  if (nodeVersion >= 17) throw new Error('Run is supported only on Node 16 and below, check https://bit.ly/lowernode')
}

// ------------------------------------------------------------------------------------------------
// _checkBrowser
// ------------------------------------------------------------------------------------------------

function _checkBrowser() {
  if (!_browser()) return

  // IE not supported
  const userAgent = window.navigator.userAgent
  const ie = userAgent.indexOf('MSIE') !== -1 || userAgent.indexOf('Trident') !== -1
  if (ie) throw new Error('Run is not supported on Internet Explorer. Please upgrade to Edge.')

  // iOS <= 12 not supported
  if (/iP(hone|od|ad)/.test(navigator.platform)) {
    var v = (navigator.appVersion).match(/OS (\d+)_(\d+)_?(\d+)?/)
    const version = [parseInt(v[1], 10), parseInt(v[2], 10), parseInt(v[3] || 0, 10)]
    if (version[0] < 13) throw new Error('Run is not supported on this iOS version. Please upgrade to iOS 13 or above.')
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _nodejs,
  _browser,
  _check,
  _checkBsvLibrary,
  _checkNode,
  _checkBrowser
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(30)))

/***/ }),
/* 30 */
/***/ (function(module, exports) {

// shim for using process in browser
var process = module.exports = {};

// cached from whatever global is present so that test runners that stub it
// don't break things.  But we need to wrap it in a try catch in case it is
// wrapped in strict mode code which doesn't define any globals.  It's inside a
// function because try/catches deoptimize in certain engines.

var cachedSetTimeout;
var cachedClearTimeout;

function defaultSetTimout() {
    throw new Error('setTimeout has not been defined');
}
function defaultClearTimeout () {
    throw new Error('clearTimeout has not been defined');
}
(function () {
    try {
        if (typeof setTimeout === 'function') {
            cachedSetTimeout = setTimeout;
        } else {
            cachedSetTimeout = defaultSetTimout;
        }
    } catch (e) {
        cachedSetTimeout = defaultSetTimout;
    }
    try {
        if (typeof clearTimeout === 'function') {
            cachedClearTimeout = clearTimeout;
        } else {
            cachedClearTimeout = defaultClearTimeout;
        }
    } catch (e) {
        cachedClearTimeout = defaultClearTimeout;
    }
} ())
function runTimeout(fun) {
    if (cachedSetTimeout === setTimeout) {
        //normal enviroments in sane situations
        return setTimeout(fun, 0);
    }
    // if setTimeout wasn't available but was latter defined
    if ((cachedSetTimeout === defaultSetTimout || !cachedSetTimeout) && setTimeout) {
        cachedSetTimeout = setTimeout;
        return setTimeout(fun, 0);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedSetTimeout(fun, 0);
    } catch(e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't trust the global object when called normally
            return cachedSetTimeout.call(null, fun, 0);
        } catch(e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error
            return cachedSetTimeout.call(this, fun, 0);
        }
    }


}
function runClearTimeout(marker) {
    if (cachedClearTimeout === clearTimeout) {
        //normal enviroments in sane situations
        return clearTimeout(marker);
    }
    // if clearTimeout wasn't available but was latter defined
    if ((cachedClearTimeout === defaultClearTimeout || !cachedClearTimeout) && clearTimeout) {
        cachedClearTimeout = clearTimeout;
        return clearTimeout(marker);
    }
    try {
        // when when somebody has screwed with setTimeout but no I.E. maddness
        return cachedClearTimeout(marker);
    } catch (e){
        try {
            // When we are in I.E. but the script has been evaled so I.E. doesn't  trust the global object when called normally
            return cachedClearTimeout.call(null, marker);
        } catch (e){
            // same as above but when it's a version of I.E. that must have the global object for 'this', hopfully our context correct otherwise it will throw a global error.
            // Some versions of I.E. have different rules for clearTimeout vs setTimeout
            return cachedClearTimeout.call(this, marker);
        }
    }



}
var queue = [];
var draining = false;
var currentQueue;
var queueIndex = -1;

function cleanUpNextTick() {
    if (!draining || !currentQueue) {
        return;
    }
    draining = false;
    if (currentQueue.length) {
        queue = currentQueue.concat(queue);
    } else {
        queueIndex = -1;
    }
    if (queue.length) {
        drainQueue();
    }
}

function drainQueue() {
    if (draining) {
        return;
    }
    var timeout = runTimeout(cleanUpNextTick);
    draining = true;

    var len = queue.length;
    while(len) {
        currentQueue = queue;
        queue = [];
        while (++queueIndex < len) {
            if (currentQueue) {
                currentQueue[queueIndex].run();
            }
        }
        queueIndex = -1;
        len = queue.length;
    }
    currentQueue = null;
    draining = false;
    runClearTimeout(timeout);
}

process.nextTick = function (fun) {
    var args = new Array(arguments.length - 1);
    if (arguments.length > 1) {
        for (var i = 1; i < arguments.length; i++) {
            args[i - 1] = arguments[i];
        }
    }
    queue.push(new Item(fun, args));
    if (queue.length === 1 && !draining) {
        runTimeout(drainQueue);
    }
};

// v8 likes predictible objects
function Item(fun, array) {
    this.fun = fun;
    this.array = array;
}
Item.prototype.run = function () {
    this.fun.apply(null, this.array);
};
process.title = 'browser';
process.browser = true;
process.env = {};
process.argv = [];
process.version = ''; // empty string to avoid regexp issues
process.versions = {};

function noop() {}

process.on = noop;
process.addListener = noop;
process.once = noop;
process.off = noop;
process.removeListener = noop;
process.removeAllListeners = noop;
process.emit = noop;
process.prependListener = noop;
process.prependOnceListener = noop;

process.listeners = function (name) { return [] }

process.binding = function (name) {
    throw new Error('process.binding is not supported');
};

process.cwd = function () { return '/' };
process.chdir = function (dir) {
    throw new Error('process.chdir is not supported');
};
process.umask = function() { return 0; };


/***/ }),
/* 31 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * index.js
 *
 * Primary library export and Run class
 */

// Bsv
const bsv = __webpack_require__(5)
const { PrivateKey, PublicKey, Address } = bsv

// Kernel
const Kernel = __webpack_require__(43)
const { Blockchain, Cache, Lock, Logger, Owner, Purse, State } = __webpack_require__(54)
const Jig = __webpack_require__(7)
const Berry = __webpack_require__(13)
const Code = __webpack_require__(1)
const Editor = __webpack_require__(9)
const Commit = __webpack_require__(37)
const _load = __webpack_require__(16)
const Creation = __webpack_require__(3)
const CommonLock = __webpack_require__(44)
const Transaction = __webpack_require__(27)
const { _unifyForMethod } = __webpack_require__(32)
const Sandbox = __webpack_require__(6)
const Log = __webpack_require__(2)
const { _text, _limit } = __webpack_require__(0)
const { _browser, _nodejs } = __webpack_require__(29)
const request = __webpack_require__(18)
const { ArgumentError } = __webpack_require__(11)
const { _extractMetadata, _extractTxDeps } = __webpack_require__(34)

// Plugins
const BrowserCache = __webpack_require__(66)
const DiskCache = __webpack_require__(67)
const IndexedDbCache = __webpack_require__(55)
const Inventory = __webpack_require__(68)
const LocalCache = __webpack_require__(39)
const LocalOwner = __webpack_require__(56)
const LocalPurse = __webpack_require__(71)
const LocalState = __webpack_require__(72)
const Mockchain = __webpack_require__(73)
const NodeCache = __webpack_require__(74)
const PayServer = __webpack_require__(75)
const RunConnect = __webpack_require__(59)
const RunDB = __webpack_require__(76)
const StateServer = __webpack_require__(77)
const Viewer = __webpack_require__(78)
const WhatsOnChain = __webpack_require__(79)

// Wrappers
const BlockchainWrapper = __webpack_require__(41)
const CacheWrapper = __webpack_require__(38)
const OwnerWrapper = __webpack_require__(46)
const PurseWrapper = __webpack_require__(48)
const StateWrapper = __webpack_require__(40)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Run'

// ------------------------------------------------------------------------------------------------
// Run
// ------------------------------------------------------------------------------------------------

/**
 * The Run class that the user creates.
 *
 * It is essentially a wrapper around the kernel.
 * It sets up the kernel with users provided options or defaults and exposes an API to the user.
 */
class Run {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor(options = {}) {
    if (Log._infoOn) Log._info(TAG, 'Create')

    checkIfOptionsCompatible(options)
    checkIfOptionsCompatible(Run.defaults)

    const keys = Object.keys(options)

    // Setup non-kernel properties
    this._api = parseApi(options.api, keys.includes('api'), options.blockchain || Run.defaults.blockchain, options.network || Run.defaults.network)
    this._apiKey = parseApiKey(options.apiKey, keys.includes('apiKey'))
    this._stateServerHost = parseStateServerHost(options.stateServerHost, keys.includes('stateServerHost'))
    this._autofund = parseAutofund(options.autofund, keys.includes('autofund'))
    this._debug = parseDebug(options.debug, keys.includes('debug'))
    this._logger = parseLogger(options.logger, keys.includes('logger'))
    this._networkRetries = parseNetworkRetries(options.networkRetries, keys.includes('networkRetries'))
    this._networkTimeout = parseNetworkTimeout(options.networkTimeout, keys.includes('networkTimeout'))

    const network = parseNetwork(options.network, keys.includes('network'))
    const wallet = parseWallet(options.wallet, keys.includes('wallet'))

    // Setup kernel
    this._kernel = new Kernel()
    this._kernel._backingLimit = parseBackingLimit(options.backingLimit, keys.includes('backingLimit'))
    this._kernel._client = parseClient(options.client, keys.includes('client'))
    this._kernel._cache = parseCache(options.cache, keys.includes('cache'), network)
    this._kernel._blockchain = parseBlockchain(options.blockchain, keys.includes('blockchain'), this._api, this._apiKey, network)
    this._kernel._state = parseState(options.state, keys.includes('state'), network, this._api, this._stateServerHost, this._apiKey)
    this._kernel._purse = parsePurse(options.purse, keys.includes('purse'), this._kernel._blockchain, wallet)
    this._kernel._app = parseApp(options.app, keys.includes('app'))
    this._kernel._owner = parseOwner(options.owner, keys.includes('owner'), this._kernel._blockchain, wallet)
    this._kernel._timeout = parseTimeout(options.timeout, keys.includes('timeout'))
    this._kernel._trustlist = parseTrust(options.trust, keys.includes('trust'))
    this._kernel._preverify = parsePreverify(options.preverify, keys.includes('preverify'))
    this._kernel._rollbacks = parseRollbacks(options.rollbacks, keys.includes('rollbacks'))

    // Hook plugins
    hookPlugins(this)

    // Setup inventory last, because it requires the kernel
    this._inventory = parseInventory(options.inventory, keys.includes('inventory'))

    // If using the mockchain and local purse, automatically fund the purse with some money
    autofundPurse(this)

    this.activate()
  }

  // --------------------------------------------------------------------------
  // Getters
  //
  // These should return the same objects assigned, even if internally we wrap.
  // --------------------------------------------------------------------------

  get api() { return this._api }
  get apiKey() { return this._apiKey }
  get app() { return this._kernel._app }
  get autofund() { return this._autofund }
  get backingLimit() { return this._kernel._backingLimit }
  get blockchain() { return this._kernel._blockchain }
  get cache() { return this._kernel._cache }
  get client() { return this._kernel._client }
  get debug() { return this._debug }
  get inventory() { return this._inventory }
  get logger() { return this._logger }
  get network() { return this.blockchain.network }
  get networkRetries() { return this._networkRetries }
  get networkTimeout() { return this._networkTimeout }
  get owner() { return this._kernel._owner }
  get preverify() { return this._kernel._preverify }
  get purse() { return this._kernel._purse }
  get rollbacks() { return this._kernel._rollbacks }
  get timeout() { return this._kernel._timeout }
  get state() { return this._kernel._state }
  get wallet() { return this._kernel._purse === this._kernel._owner ? this._kernel._purse : undefined }

  // --------------------------------------------------------------------------
  // Setters
  // --------------------------------------------------------------------------

  set api(api) {
    api = parseApi(api, true)
    this._kernel._blockchain = parseBlockchain(undefined, false, api, this._apiKey, this.network)
    this._kernel._state = parseState(undefined, false, this.blockchain.network, api, this._stateServerHost, this._apiKey)
    hookPlugins(this)
    this._api = api
  }

  set apiKey(apiKey) {
    apiKey = parseApiKey(apiKey, true)
    this._kernel._blockchain = parseBlockchain(undefined, false, this._api, apiKey, this.network)
    this._kernel._state = parseState(undefined, false, this.blockchain.network, this._api, this._stateServerHost, apiKey)
    hookPlugins(this)
    this._apiKey = apiKey
  }

  set stateServerHost(stateServerHost) {
    stateServerHost = parseStateServerHost(stateServerHost, true)
    this._kernel._state = parseState(undefined, false, this.blockchain.network, this._api, _stateServerHost, this._apiKey)
    hookPlugins(this)
    this._stateServerHost = stateServerHost
  }

  set app(app) {
    this._kernel._app = parseApp(app, true)
  }

  set autofund(autofund) {
    this._autofund = parseAutofund(autofund, true)
    autofundPurse(this)
  }

  set backingLimit(backingLimit) {
    backingLimit = parseBackingLimit(backingLimit, true)
    this._kernel._backingLimit = backingLimit
  }

  set blockchain(blockchain) {
    this._kernel._blockchain = parseBlockchain(blockchain, true)
    this._api = undefined
    this._apiKey = undefined
    if (this._kernel._purse instanceof LocalPurse) {
      this._kernel._purse.blockchain = this._kernel._blockchain
    }
    hookPlugins(this)
    autofundPurse(this)
  }

  set cache(cache) {
    this._kernel._cache = parseCache(cache, true, this.network)
    hookPlugins(this)
  }

  set client(client) {
    this._kernel._client = parseClient(client, true)
  }

  set debug(debug) {
    this._debug = parseDebug(debug, true)
    activateLogger(this)
  }

  set inventory(inventory) {
    if (this._inventory) this._inventory.detach(this)
    this._inventory = parseInventory(inventory, true)
    if (this._inventory) this._inventory.attach(this)
  }

  set logger(logger) {
    this._logger = parseLogger(logger, true)
    activateLogger(this)
  }

  set network(network) {
    parseNetwork(network, true)
    this._kernel._blockchain = parseBlockchain(undefined, false, this._api, this._apiKey, network)
    this._kernel._state = parseState(undefined, false, network, this._api, this._stateServerHost, this._apiKey)
    hookPlugins(this)
  }

  set networkRetries(networkRetries) {
    this._networkRetries = parseNetworkRetries(networkRetries, true)
    if (isActive(this)) request.defaults.retries = this._networkRetries
  }

  set networkTimeout(networkTimeout) {
    this._networkTimeout = parseNetworkTimeout(networkTimeout, true)
    if (isActive(this)) request.defaults.timeout = this._networkTimeout
  }

  set owner(owner) {
    const newOwner = parseOwner(owner, true, this._kernel._blockchain, null)
    if (newOwner === this._kernel._owner) return
    this._kernel._owner = newOwner
    hookPlugins(this)
    if (this._inventory) this._inventory.detach(this)
    this._inventory = new Inventory()
    this._inventory.attach(this)
  }

  set preverify(preverify) {
    this._kernel._preverify = parsePreverify(preverify, true)
  }

  set purse(purse) {
    this._kernel._purse = parsePurse(purse, true, this.blockchain, null)
    hookPlugins(this)
  }

  set rollbacks(rollbacks) {
    this._kernel._rollbacks = parseRollbacks(rollbacks, true)
  }

  set state(state) {
    this._kernel._state = parseState(state, true, this.network, this.api, this.stateServerHost, this.apiKey)
    hookPlugins(this)
  }

  set timeout(timeout) {
    this._kernel._timeout = parseTimeout(timeout, true)
  }

  set wallet(wallet) {
    parseWallet(wallet, true)
    this.purse = wallet
    this.owner = wallet
  }

  // --------------------------------------------------------------------------
  // Methods
  // --------------------------------------------------------------------------

  load(location, options = {}) {
    checkActive(this)
    if (Transaction._ATOMICALLY_UPDATING) throw new Error('load disabled during atomic update')
    if (options.trust) this.trust(location.slice(0, 64))
    return _load(location, undefined, this._kernel)
  }

  sync() {
    if (Transaction._ATOMICALLY_UPDATING) throw new Error('sync all disabled during atomic update')
    return Commit._syncAll()
  }

  deploy(T) {
    checkActive(this)
    const C = install(T)
    Editor._get(C)._deploy()
    return C
  }

  transaction(f) {
    checkActive(this)
    const transaction = new Transaction()
    const ret = transaction.update(f)
    transaction.publish()
    return ret
  }

  import(rawtx, options = {}) {
    if (Transaction._ATOMICALLY_UPDATING) throw new Error('import disabled during atomic update')
    const tx = new bsv.Transaction(rawtx)
    const txid = options.txid || tx.hash
    if (options.trust) this.trust(txid)
    return Transaction._import(tx, txid, this._kernel)
  }

  trust(x) {
    if (x instanceof Array) { x.forEach(y => this.trust(y)); return }
    if (Log._infoOn) Log._info(TAG, 'Trust', x)
    if (!trustable(x)) throw new ArgumentError(`Not trustable: ${_text(x)}`)
    if (x === 'cache') x = 'state'
    this._kernel._trustlist.add(x)
  }

  on(_event, _listener) {
    if (!Kernel._EVENTS.includes(_event)) throw new ArgumentError(`Invalid event: ${_text(_event)}`)
    if (typeof _listener !== 'function') throw new ArgumentError(`Invalid listener: ${_text(_limit)}`)
    if (this._kernel._listeners.some(x => x._event === _event && x._listener === _listener)) return
    this._kernel._listeners.push({ _event, _listener })
  }

  off(event, listener) {
    if (!Kernel._EVENTS.includes(event)) throw new ArgumentError(`Invalid event: ${_text(event)}`)
    if (typeof listener !== 'function') throw new ArgumentError(`Invalid listener: ${_text(listener)}`)
    const matches = x => x._event === event && x._listener === listener
    this._kernel._listeners = this._kernel._listeners.filter(x => !matches(x))
  }

  activate() {
    if (Log._infoOn) Log._info(TAG, 'Activate')

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('activate disabled during atomic update')

    Run.instance = this

    if (this._inventory) this._inventory.attach(this)

    this._kernel._activate()

    // Configure globals defined by this instance by setting their properties here again.
    this.logger = this._logger
    this.debug = this._debug
    this.networkRetries = this._networkRetries
    this.networkTimeout = this._networkTimeout

    return this
  }

  deactivate() {
    if (Log._infoOn) Log._info(TAG, 'Deactivate')

    if (Transaction._ATOMICALLY_UPDATING) throw new Error('deactivate disabled during atomic update')

    Run.instance = null

    if (this._inventory) this._inventory.detach(this)

    this._kernel._deactivate()

    return this
  }
}

Run.instance = null

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

function isActive(run) {
  return Kernel._instance === run._kernel
}

// ------------------------------------------------------------------------------------------------

function checkActive(run) {
  if (Kernel._instance !== run._kernel) {
    const hint = 'Hint: Call run.activate() on this instance first'
    throw new Error(`This Run instance is not active\n\n${hint}`)
  }
}

// ------------------------------------------------------------------------------------------------

function autofundPurse(run) {
  if (run.blockchain instanceof Mockchain && run.purse instanceof LocalPurse && run.autofund) {
    run.blockchain.fund(run.purse.bsvAddress, 10000000000)
  }
}

// ------------------------------------------------------------------------------------------------

function hookPlugins(run) {
  if (run._kernel._blockchain instanceof BlockchainWrapper) {
    run._kernel._blockchain.cache = run._kernel._cache
  }

  if (run._kernel._state instanceof StateWrapper) {
    run._kernel._state.cache = run._kernel._cache
  }

  if (run._kernel._purse instanceof PurseWrapper) {
    run._kernel._purse.blockchain = run._kernel._blockchain
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function checkIfOptionsCompatible(options) {
  const apiMismatch = options.blockchain && typeof options.api !== 'undefined' && options.blockchain.api !== options.api
  if (apiMismatch) throw new Error(`Blockchain mismatch with "${options.api}" api`)

  const apiKeyMismatch = options.blockchain && typeof options.apiKey !== 'undefined' && options.blockchain.apiKey !== options.apiKey
  if (apiKeyMismatch) throw new Error(`Blockchain mismatch with "${options.apiKey}" apiKey`)

  const networkMismatch = options.blockchain && typeof options.network !== 'undefined' && options.blockchain.network !== options.network
  if (networkMismatch) throw new Error(`Blockchain mismatch with "${options.network}" network`)
}

// ------------------------------------------------------------------------------------------------

function parseApi(api, specified, blockchain, network) {

  // case: valid apis, we just return it as-is
  if (api === 'run' || api === 'whatsonchain') return api

  // case: undefined, we return a default api
  if (typeof api === 'undefined' && !specified) {
    if (typeof Run.defaults.api === 'string') {
      return parseApi(Run.defaults.api, true, undefined, network)
    }

    if (typeof blockchain === 'undefined') {
      // todo we could reactivate this by checking fo an env var to a run-like-api's host
      // if (network === 'main' || network === 'test') return 'run'
      if (network === 'main' || network === 'test') return 'whatsonchain'
      if (network === 'stn') return 'whatsonchain'
    }

    return undefined
  }
  throw new Error(`Invalid api: ${_text(api)}`)
}

// ------------------------------------------------------------------------------------------------

function parseApiKey(apiKey, specified) {
  if (typeof apiKey === 'string') return apiKey
  if (typeof apiKey === 'undefined' && !specified) return Run.defaults.apiKey
  throw new Error(`Invalid apiKey: ${_text(apiKey)}`)
}

// ------------------------------------------------------------------------------------------------

function parseStateServerHost(stateServerHost, specified) {
  if (typeof stateServerHost === 'string') return stateServerHost
  if (typeof stateServerHost === 'undefined' && !specified) return Run.defaults.stateServerHost
  throw new Error(`Invalid stateServerHost: ${_text(stateServerHost)}`)
}


// ------------------------------------------------------------------------------------------------

function parseApp(app, specified) {
  if (typeof app === 'string') return app
  if (typeof app === 'undefined' && !specified) return parseApp(Run.defaults.app, true)
  throw new Error(`Invalid app: ${_text(app)}`)
}

// ------------------------------------------------------------------------------------------------

function parseAutofund(autofund, specified) {
  if (typeof autofund === 'boolean') return autofund
  if (typeof autofund === 'undefined' && !specified) return parseAutofund(Run.defaults.autofund, true)
  throw new Error(`Invalid autofund: ${_text(autofund)}`)
}

// ------------------------------------------------------------------------------------------------

function parseBackingLimit(backingLimit, specified) {
  if (backingLimit >= 0) return backingLimit
  if (typeof backingLimit === 'undefined' && !specified) return parseBackingLimit(Run.defaults.backingLimit, true)
  throw new Error(`Invalid backingLimit: ${_text(backingLimit)}`)
}

// ------------------------------------------------------------------------------------------------

function parseBlockchain(blockchain, specified, api, apiKey, network, feePerKb) {
  if (blockchain instanceof Blockchain) return blockchain

  const lastBlockchain = Kernel._instance && Kernel._instance._blockchain

  // If no blockchain is passed in, create one
  if (typeof blockchain === 'undefined' && !specified) {
    switch (network) {
      case 'mock':
        if (typeof api !== 'undefined') throw new Error(`"mock" network is not compatible with the "${api}" api`)
        return lastBlockchain instanceof Mockchain ? lastBlockchain : new Mockchain()

      case 'main':
      case 'test':
      case 'stn': {
        const isRemoteBlockchain =
          lastBlockchain instanceof RunConnect ||
          lastBlockchain instanceof WhatsOnChain

        if (isRemoteBlockchain &&
          lastBlockchain.api === api &&
          lastBlockchain.apiKey === apiKey &&
          lastBlockchain.network === network) {
          return lastBlockchain
        }

        const options = { apiKey, network }

        switch (typeof api) {
          case 'string':
            switch (api) {
              case 'run': return new RunConnect(options)
              case 'whatsonchain': return new WhatsOnChain(options)
            }
            break

          case 'undefined':
            // Only whatsonchain supports STN right now
            return network === 'stn' ? new WhatsOnChain(options) : new RunConnect(options)

          default:
            throw new Error(`Invalid api: ${_text(api)}`)
        }
      } break

      default:
        return parseBlockchain(Run.defaults.blockchain, true)
    }
  }

  throw new Error(`Invalid blockchain: ${_text(blockchain)}`)
}

// ------------------------------------------------------------------------------------------------

function parseCache(cache, specified, network) {
  if (cache instanceof Cache) return cache

  if (typeof cache === 'undefined' && !specified) {
    const lastCache = Kernel._instance && Kernel._instance._cache
    const lastBlockchain = Kernel._instance && Kernel._instance._blockchain
    const lastNetwork = lastBlockchain && lastBlockchain.network

    // If our last run instance had a cache on the same network, reuse it
    if (lastCache && lastNetwork === network) {
      return lastCache
    }

    // Otherwise, see if we have a default cache to prefer
    if (Run.defaults.cache instanceof Cache) {
      return Run.defaults.cache
    }

    // No default cache. Create one based on the environment.
    return _browser() ? new BrowserCache() : _nodejs() ? new NodeCache() : new LocalCache()
  }

  if (cache instanceof RunDB) {
    const error = 'The RunDB plugin is now a state provider, not a cache'
    const hint = 'Hint: Try run.state = new RunDB()'
    throw new Error(`${error}\n\n${hint}`)
  }

  throw new Error(`Invalid cache: ${_text(cache)}`)
}

// ------------------------------------------------------------------------------------------------

function parseClient(client, specified) {
  if (typeof client === 'boolean') return client
  if (typeof client === 'undefined' && !specified) return parseClient(Run.defaults.client, true)
  throw new Error(`Invalid client: ${_text(client)}`)
}

// ------------------------------------------------------------------------------------------------

function parseDebug(debug, specified) {
  if (typeof debug === 'boolean') return debug
  if (typeof debug === 'undefined' && !specified) return parseDebug(Run.defaults.debug, true)
  throw new Error(`Invalid debug: ${_text(debug)}`)
}

// ------------------------------------------------------------------------------------------------

function parseInventory(inventory, specified) {
  if (inventory instanceof Inventory) return inventory
  if (specified) throw new Error(`Invalid inventory: ${_text(inventory)}`)
  return new Inventory()
}

// ------------------------------------------------------------------------------------------------

function parseLogger(logger, specified) {
  if (logger instanceof Logger) return logger
  if (logger === null) return null
  if (typeof logger === 'undefined' && !specified) return Run.defaults.logger
  throw new Error(`Invalid logger: ${_text(logger)}`)
}

// ------------------------------------------------------------------------------------------------

function parseNetwork(network, specified) {
  if (network === 'mock' || network === 'main' || network === 'test' || network === 'stn') return network
  if (typeof network === 'undefined' && !specified) return Run.defaults.network
  throw new Error(`Invalid network: ${_text(network)}`)
}

// ------------------------------------------------------------------------------------------------

function parseNetworkRetries(networkRetries, specified) {
  if (networkRetries >= 0 && Number.isSafeInteger(networkRetries)) return networkRetries
  if (typeof networkRetries === 'undefined' && !specified) return parseNetworkRetries(Run.defaults.networkRetries, true)
  throw new Error(`Invalid network retries: ${_text(networkRetries)}`)
}

// ------------------------------------------------------------------------------------------------

function parseNetworkTimeout(networkTimeout, specified) {
  if (typeof networkTimeout === 'number' && networkTimeout >= 0 && !Number.isNaN(networkTimeout)) return networkTimeout
  if (typeof networkTimeout === 'undefined' && !specified) return parseNetworkTimeout(Run.defaults.networkTimeout, true)
  throw new Error(`Invalid network timeout: ${_text(networkTimeout)}`)
}

// ------------------------------------------------------------------------------------------------

function parseOwner(owner, specified, blockchain, wallet) {
  if (wallet) {
    if (owner && specified && owner !== wallet) throw new Error('Cannot set different owner and wallet')
    return wallet
  }

  if (owner instanceof Owner) return owner

  // If user didn't specify an owner, create one
  if (typeof owner === 'undefined' && !specified) {
    if (Run.defaults.owner instanceof Owner) {
      return Run.defaults.owner
    }

    if (typeof Run.defaults.owner === 'string' || Run.defaults.owner instanceof PrivateKey) {
      try {
        return new LocalOwner(Run.defaults.owner, blockchain.network)
      } catch (e) { }
    }

    return new LocalOwner(undefined, blockchain.network)
  }

  // If user did specify an owner, see if it's a private key
  if (typeof owner === 'string' || owner instanceof PrivateKey) {
    try {
      return new LocalOwner(owner, blockchain.network)
    } catch (e) { /* no-op */ }
  }

  // Try creating Viewer from public keys and addresses
  if (typeof owner === 'string' || owner instanceof PublicKey || owner instanceof Address) {
    try {
      return new Viewer(owner.toString(), blockchain.network)
    } catch (e) { /* no-op */ }
  }

  // Try creating Viewer from a custom lock
  if (typeof owner === 'object') {
    try {
      return new Viewer(owner)
    } catch (e) { /* no-op */ }
  }

  throw new Error(`Invalid owner: ${_text(owner)}`)
}

// ------------------------------------------------------------------------------------------------

function parsePreverify(preverify, specified) {
  if (typeof preverify === 'boolean') return preverify
  if (typeof preverify === 'undefined' && !specified) return parsePreverify(Run.defaults.preverify, true)
  throw new Error(`Invalid preverify: ${_text(preverify)}`)
}

// ------------------------------------------------------------------------------------------------

function parsePurse(purse, specified, blockchain, wallet) {
  if (wallet) {
    if (purse && specified && purse !== wallet) throw new Error('Cannot set different purse and wallet')
    return wallet
  }

  if (purse instanceof Purse) return purse

  // If user did not specify a purse, create one
  if (typeof purse === 'undefined' && !specified) {
    if (Run.defaults.purse instanceof Purse) {
      return Run.defaults.purse
    }

    if (typeof Run.defaults.purse === 'string' || Run.defaults.purse instanceof PrivateKey) {
      try {
        return new LocalPurse({ privkey: Run.defaults.purse, blockchain })
      } catch (e) { }
    }

    return new LocalPurse({ blockchain })
  }

  // See if the purse is a private key
  if (typeof purse === 'string' || purse instanceof PrivateKey) {
    try {
      return new LocalPurse({ privkey: purse, blockchain })
    } catch (e) { /* no-op */ }
  }

  throw new Error(`Invalid purse: ${_text(purse)}`)
}

// ------------------------------------------------------------------------------------------------

function parseRollbacks(rollbacks, specified) {
  if (typeof rollbacks === 'boolean') return rollbacks
  if (typeof rollbacks === 'undefined' && !specified) return parseRollbacks(Run.defaults.rollbacks, true)
  throw new Error(`Invalid rollbacks: ${_text(rollbacks)}`)
}

// ------------------------------------------------------------------------------------------------

function parseState(state, specified, network, api, stateServerHost, apiKey) {
  if (state instanceof State) return state

  if (typeof state === 'undefined' && !specified) {
    const lastState = Kernel._instance && Kernel._instance._state
    const lastBlockchain = Kernel._instance && Kernel._instance._blockchain
    const lastNetwork = lastBlockchain && lastBlockchain.network
    const lastApi = lastState && lastState.api
    const lastApiKey = lastState && lastState.apiKey

    // If our last run instance had a state on the same network and api, reuse it
    if (lastState && lastNetwork === network && lastApi === api && lastApiKey === apiKey) {
      return lastState
    }

    // See if we have a default state to prefer
    if (Run.defaults.state instanceof State) {
      return Run.defaults.state
    }

    // If we are on mainnet or testnet, then use a Run's State Server
    if (network === 'main' || network === 'test') {
      if (stateServerHost) {
        // apiKey = api === 'run' ? apiKey : undefined  // useless?
        return new StateServer({ stateServerHost, apiKey })
      }
    }

    // Otheruse, use local state
    return new LocalState()
  }

  throw new Error(`Invalid state: ${_text(state)}`)
}

// ------------------------------------------------------------------------------------------------

function parseTimeout(timeout, specified) {
  if (typeof timeout === 'number' && timeout >= 0 && !Number.isNaN(timeout)) return timeout

  if (typeof timeout === 'undefined' && !specified) {
    return Run.defaults.timeout
  }

  throw new Error(`Invalid timeout: ${_text(timeout)}`)
}

// ------------------------------------------------------------------------------------------------

function parseTrust(trust, specified) {
  let all = []

  if (typeof trust === 'string') {
    // If user wants to trust a single entry, add it
    if (!trustable(trust)) throw new Error(`Not trustable: ${_text(trust)}`)
    if (trust === 'cache') trust = 'state'
    all.push(trust)
  } else if (Array.isArray(trust)) {
    // If user wants to trust an array, add them all
    for (const x of trust) {
      if (!trustable(x)) {
        throw new Error(`Not trustable: ${_text(x)}`)
      }
    }
    all = all.concat(trust.map(x => x === 'cache' ? 'state' : x))
  } else if (typeof trust === 'undefined' && !specified) {
    // If user wants to use the defaults, pull from previous instance
    const lastTrusts = Kernel._instance && Kernel._instance._trustlist
    if (lastTrusts) {
      all = all.concat(Array.from(lastTrusts))
    } else if (Run.defaults.trust) {
      // If no previous instance, pull from defaults
      all = all.concat(Array.from(parseTrust(Run.defaults.trust, true)))
    }
  } else {
    throw new Error(`Not trustable: ${_text(trust)}`)
  }

  // Merge with our trustlist
  const defaultTrustlist = [
    /**
     * Run ▸ Extras
     */
    '61e1265acb3d93f1bf24a593d70b2a6b1c650ec1df90ddece8d6954ae3cdd915', // asm
    '49145693676af7567ebe20671c5cb01369ac788c20f3b1c804f624a1eda18f3f', // asm
    '284ce17fd34c0f41835435b03eed149c4e0479361f40132312b4001093bb158f', // asm
    '6fe169894d313b44bd54154f88e1f78634c7f5a23863d1713342526b86a39b8b', // B
    '5332c013476cd2a2c18710a01188695bc27a5ef1748a51d4a5910feb1111dab4', // B (v2)
    '81bcef29b0e4ed745f3422c0b764a33c76d0368af2d2e7dd139db8e00ee3d8a6', // Base58
    '71fba386341b932380ec5bfedc3a40bce43d4974decdc94c419a94a8ce5dfc23', // expect
    '780ab8919cb89323707338070323c24ce42cdec2f57d749bd7aceef6635e7a4d', // Group
    '90a3ece416f696731430efac9657d28071cc437ebfff5fb1eaf710fe4b3c8d4e', // Group
    '727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011', // Hex
    '3b7ef411185bbe3d01caeadbe6f115b0103a546c4ef0ac7474aa6fbb71aff208', // sha256
    'b17a9af70ab0f46809f908b2e900e395ba40996000bf4f00e3b27a1e93280cf1', // Token (v1)
    '72a61eb990ffdb6b38e5f955e194fed5ff6b014f75ac6823539ce5613aea0be8', // Token (v2)
    '312985bd960ae4c59856b3089b04017ede66506ea181333eec7c9bb88b11c490', // Tx, txo
    '05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb', // txo, Tx, B(v2)

    /**
     * RelayX
     */
    'd792d10294a0d9b05a30049f187a1704ced14840ecf41d00663d79c695f86633', // USDC
    '318d2a009e29cb3a202b2a167773341dcd39809b967889a7e306d504cc266faf', // OKBSV
    '5a8d4b4da7c5f27a39adac3a9256a7e15e03a7266c81ac8369a3b634560e7814', // OKBSV
    'd7273b6790a4dec4aa116661aff0ec35381794e552807014ca6a536f4454976d', // OKBSV
    'd6170025a62248d8df6dc14e3806e68b8df3d804c800c7bfb23b0b4232862505', // OrderLock

    /**
     * Tokens
     */
    'ce8629aa37a1777d6aa64d0d33cd739fd4e231dc85cfe2f9368473ab09078b78', // SHUA
    'ca1818540d2865c5b6a53e06650eafadc10b478703aa7cf324145f848fec629b', // SHUA
    '1de3951603784df7c872519c096445a415d9b0d3dce7bbe3b7a36ca82cf1a91c', // SHUA
    '367b4980287f8abae5ee4b0c538232164d5b2463068067ec1e510c91114bced2', // SHUA

    /**
     * Run ▸ Extras (testnet)
     */
    '1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e', // asm, Hex
    '8b9380d445b6fe01ec7230d8363febddc99feee6064d969ae8f98fdb25e1393f', // asm
    '03e21aa8fcf08fa6985029ad2e697a2309962527700246d47d891add3cfce3ac', // asm
    '5435ae2760dc35f4329501c61c42e24f6a744861c22f8e0f04735637c20ce987', // B
    'b44a203acd6215d2d24b33a41f730e9acf2591c4ae27ecafc8d88ef83da9ddea', // B (v2)
    '424abf066be56b9dd5203ed81cf1f536375351d29726d664507fdc30eb589988', // Base58
    'f97d4ac2a3d6f5ed09fad4a4f341619dc5a3773d9844ff95c99c5d4f8388de2f', // expect
    '63e0e1268d8ab021d1c578afb8eaa0828ccbba431ffffd9309d04b78ebeb6e56', // Group
    '03320f1244e509bb421e6f1ff724bf1156182890c3768cfa4ea127a78f9913d2', // Group
    '4a1929527605577a6b30710e6001b9379400421d8089d34bb0404dd558529417', // sha256
    '0bdf33a334a60909f4c8dab345500cbb313fbfd50b1d98120227eae092b81c39', // Token (v1)
    '7d14c868fe39439edffe6982b669e7b4d3eb2729eee7c262ec2494ee3e310e99', // Token (v2)
    '33e78fa7c43b6d7a60c271d783295fa180b7e9fce07d41ff1b52686936b3e6ae', // Tx, txo
    'd476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff', // Tx, txo, B (v2)

    /**
     * Other
     */
    '24cde3638a444c8ad397536127833878ffdfe1b04d5595489bd294e50d77105a', // B (old)
    'bfa5180e601e92af23d80782bf625b102ac110105a392e376fe7607e4e87dc8d', // Class with logo
    'c0a79e8afb7cabe5f25bdaa398683d6dfe68a2912b29fe948ed130d14e3a2380', // TimeLock
    '3f9de452f0c3c96be737d42aa0941b27412211976688967adb3174ee18b04c64' // Tutorial jigs
  ]

  return new Set(all.concat(defaultTrustlist))
}

// ------------------------------------------------------------------------------------------------

function parseWallet(wallet, specified) {
  if (typeof wallet === 'undefined' && !specified) return wallet
  if (typeof wallet !== 'object' || wallet === null) throw new Error(`Invalid wallet: ${_text(wallet)}`)
  if (!(wallet instanceof Owner)) throw new Error('wallet does not implement the Owner API')
  if (!(wallet instanceof Purse)) throw new Error('wallet does not implement the Purse API')
  return wallet
}

// ------------------------------------------------------------------------------------------------

function trustable(x) {
  if (x === '*') return true
  if (x === 'cache') return true
  if (x === 'state') return true
  if (typeof x !== 'string') return false
  if (x.length !== 64) return false
  return /[a-fA-F0-9]+/.test(x)
}

// ------------------------------------------------------------------------------------------------

function activateLogger(run) {
  if (!isActive(run)) return
  const logger = {}
  if (run._logger && run._logger.info) logger.info = run._logger.info.bind(run._logger)
  if (run._logger && run._logger.warn) logger.warn = run._logger.warn.bind(run._logger)
  if (run._logger && run._logger.error) logger.error = run._logger.error.bind(run._logger)
  if (run._logger && run._logger.debug && run._debug) logger.debug = run._logger.debug.bind(run._logger)
  Log._logger = logger
}

// ------------------------------------------------------------------------------------------------
// Defaults
// ------------------------------------------------------------------------------------------------

// Default settings that Run uses when an option is not provided or undefined
Run.defaults = {}
Run.defaults.api = undefined
Run.defaults.apiKey = undefined
Run.defaults.stateServerHost = undefined
Run.defaults.app = ''
Run.defaults.autofund = true
Run.defaults.backingLimit = 100000000
Run.defaults.blockchain = undefined
Run.defaults.cache = undefined
Run.defaults.client = false
Run.defaults.debug = false
Run.defaults.inventory = undefined
Run.defaults.logger = { warn: console.warn, error: console.error }
Run.defaults.network = 'main'
Run.defaults.networkRetries = 2
Run.defaults.networkTimeout = 10000
Run.defaults.owner = undefined
Run.defaults.preverify = true
Run.defaults.purse = undefined
Run.defaults.rollbacks = true
Run.defaults.state = undefined
Run.defaults.timeout = 30000
Run.defaults.trust = []

// ------------------------------------------------------------------------------------------------
// configure
// ------------------------------------------------------------------------------------------------

/**
 * Configures the Run defaults
 */
Run.configure = (env, network) => {
  Run.defaults = Object.assign({}, Run.defaults)

  // App
  if (env.APP) Run.defaults.app = env.APP

  // Network
  network = network || env.NETWORK || Run.defaults.network
  Run.defaults.network = network

  // Logger
  if (env.LOGGER === 'debug') {
    Run.defaults.logger = console
    Run.defaults.debug = true
  } else if (env.LOGGER && JSON.parse(env.LOGGER)) {
    Run.defaults.logger = console
    Run.defaults.debug = false
  } else if (env.LOGGER && !JSON.parse(env.LOGGER)) {
    Run.defaults.logger = {}
  }
  Log._logger = Run.defaults.logger

  // Purse
  const purse = env.PURSE || env[`PURSE_${network.toUpperCase()}`]
  if (typeof purse !== 'undefined') Run.defaults.purse = purse

  // Owner
  const owner = env.OWNER || env[`OWNER_${network.toUpperCase()}`]
  if (typeof owner !== 'undefined') Run.defaults.owner = owner

  // Api
  if (typeof env.API !== 'undefined') Run.defaults.api = env.API

  // Api key
  const apiKey = env.APIKEY || env[`APIKEY_${(Run.defaults.api || '').toUpperCase()}`]
  if (typeof apiKey !== 'undefined') Run.defaults.apiKey = apiKey
}

// ------------------------------------------------------------------------------------------------
// install
// ------------------------------------------------------------------------------------------------

function install(T) {
  const C = Editor._lookupCodeByType(T) || Editor._createCode()
  const editor = Editor._get(C)
  if (!Run.instance) {
    editor._preinstall(T)
  } else if (!editor._installed) {
    editor._install(T)
  }
  return C
}

// ------------------------------------------------------------------------------------------------
// uninstall
// ------------------------------------------------------------------------------------------------

function uninstall(T) {
  const C = Editor._lookupCodeByType(T)
  if (!C) return
  const editor = Editor._get(C)
  editor._uninstall()
}

// ------------------------------------------------------------------------------------------------
// unify
// ------------------------------------------------------------------------------------------------

function unify(...creations) {
  if (!creations.length) throw new ArgumentError('No creations to unify')
  if (creations.some(creation => !(creation instanceof Creation))) throw new ArgumentError('Must only unify creations')
  _unifyForMethod(creations, creations)
}

// ------------------------------------------------------------------------------------------------
// cover
// ------------------------------------------------------------------------------------------------

// Enables collecting code coverage for a class or function
// load() and import() are not supported in cover tests, and there may be random bugs
Run.cover = name => { if (!Sandbox._cover.includes(name)) Sandbox._cover.push(name) }

// ------------------------------------------------------------------------------------------------
// Additional exports
// ------------------------------------------------------------------------------------------------

// Kernel
Run.Berry = Berry
Run.Code = Code
Run.Jig = Jig
Run.Creation = Creation
Run.Transaction = Transaction

// Plugins
Run.plugins = {}
Run.plugins.BrowserCache = BrowserCache
Run.plugins.DiskCache = DiskCache
Run.plugins.IndexedDbCache = IndexedDbCache
Run.plugins.Inventory = Inventory
Run.plugins.LocalCache = LocalCache
Run.plugins.LocalOwner = LocalOwner
Run.plugins.LocalPurse = LocalPurse
Run.plugins.LocalState = LocalState
Run.plugins.Mockchain = Mockchain
Run.plugins.NodeCache = NodeCache
Run.plugins.PayServer = PayServer
Run.plugins.RunConnect = RunConnect
Run.plugins.RunDB = RunDB
Run.plugins.StateServer = StateServer
Run.plugins.Viewer = Viewer
Run.plugins.WhatsOnChain = WhatsOnChain

// Wrappers
Run.plugins.BlockchainWrapper = BlockchainWrapper
Run.plugins.CacheWrapper = CacheWrapper
Run.plugins.OwnerWrapper = OwnerWrapper
Run.plugins.PurseWrapper = PurseWrapper
Run.plugins.StateWrapper = StateWrapper

// Extra
Run.extra = __webpack_require__(47)

// Hidden
Run._admin = __webpack_require__(4)._admin
Run._Bindings = __webpack_require__(8)
Run._bsv = __webpack_require__(12)
Run._CreationSet = __webpack_require__(25)
Run._deep = __webpack_require__(14)
Run._determinism = __webpack_require__(17)
Run._DeterministicRealm = __webpack_require__(49)
Run._Dynamic = __webpack_require__(50)
Run._EDITORS = __webpack_require__(9)._EDITORS
Run._environment = __webpack_require__(29)
Run._Json = __webpack_require__(23)
Run._Log = __webpack_require__(2)
Run._Membrane = __webpack_require__(19)
Run._misc = __webpack_require__(0)
Run._Proxy2 = __webpack_require__(26)
Run._RecentBroadcasts = __webpack_require__(58)
Run._Record = __webpack_require__(10)
Run._request = __webpack_require__(18)
Run._RESERVED_PROPS = __webpack_require__(0)._RESERVED_PROPS
Run._RESERVED_CODE_PROPS = __webpack_require__(0)._RESERVED_CODE_PROPS
Run._RESERVED_JIG_PROPS = __webpack_require__(0)._RESERVED_JIG_PROPS
Run._Rules = __webpack_require__(22)
Run._Sandbox = Sandbox
Run._SerialTaskQueue = __webpack_require__(51)
Run._sighash = __webpack_require__(12)._sighash
Run._Snapshot = __webpack_require__(36)
Run._source = __webpack_require__(24)
Run._StateFilter = __webpack_require__(28)
Run._sudo = __webpack_require__(4)._sudo
Run._version = __webpack_require__(15)

// Api
Run.api = {}
Run.api.Blockchain = Blockchain
Run.api.Logger = Logger
Run.api.Purse = Purse
Run.api.Cache = Cache
Run.api.Lock = Lock
Run.api.Owner = Owner
Run.api.State = State

// Errors
Run.errors = __webpack_require__(11)
Run.errors.RequestError = __webpack_require__(18)._RequestError

// Util
Run.util = {}
Run.util.CommonLock = CommonLock
Run.util.deps = rawtx => {
  if (typeof rawtx !== 'string' || !rawtx.length) throw new Error(`Invalid transaction: ${_text(rawtx)}`)
  return _extractTxDeps(new bsv.Transaction(rawtx))
}
Run.util.metadata = rawtx => {
  if (typeof rawtx !== 'string' || !rawtx.length) throw new Error(`Invalid transaction: ${_text(rawtx)}`)
  return _extractMetadata(new bsv.Transaction(rawtx))
}
Run.util.install = install
Run.util.recreateJigsFromStates = __webpack_require__(57)
Run.util.unify = unify
Run.util.uninstall = uninstall
Object.defineProperty(Run.util, 'sha256', {
  get: () => Kernel._sha256,
  set: (x) => {
    if (typeof x !== 'function') {
      throw new Error(`'Invalid sha256: ${_text(x)}`)
    }
    Kernel._sha256 = x
  },
  configurable: true,
  enumerable: true
})

/* global VERSION */
Run.version = ( true && "0.6.43") || false
Run.protocol = __webpack_require__(15)._PROTOCOL_VERSION

// Add the bsv library Run uses as a property for now. Later, when we move away from bsv lib,
// we should remove this, but it serves a purpose today, for example setting fees rates.
Run.bsv = bsv

// ------------------------------------------------------------------------------------------------

module.exports = Run


/***/ }),
/* 32 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * unify.js
 *
 * Unify: make jigs that interact together all use the same jigs in their latest common states
 *
 * Unifification happens automatically. When a user calls a method:
 *
 *    a.f(b, c)
 *
 * then a, b, c, and also all their inner references, are unified. Similar for deploy and upgrade.
 *
 * We unify so that within a method, distinct jigs are distinct, and same jigs are same,
 * and there is a consistent worldview of jigs at locations, so that when users say is x === y,
 * they get consistent answers that make sense, and over time inner references are updated.
 *
 * However...
 *
 * The state of a jig is just its own properties. It may include references to other jigs,
 * but whatever is in those other jigs are not part of the base jig state. Why does it matter?
 *
 * Because when jigs are unified for a method, the *indirect jigs*, those jigs that are
 * references of references, are unified too. But when they are not part of any jig being
 * updated, those indirect jigs mustn't stay unified after the method is complete. They
 * must revert to their former state as it was referenced by the jigs before the method.
 *
 * This process, called de-unification, is used during replays. It's not crucial for user
 * method calls though. Also, during replays, we only unify the inputs and refs once during load.
 * We don't have to unify every action if we know they were all unified at the beginning.
 */

const { _text, _assert, _hasOwnProperty } = __webpack_require__(0)
const { _deepVisit, _deepReplace } = __webpack_require__(14)
const { _sudo } = __webpack_require__(4)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

// Unificatoin for method gets disabled during replay because we unify ahead of time
let UNIFY_FOR_METHOD_ENABLED = true

// ------------------------------------------------------------------------------------------------
// _unifyForReplay
// ------------------------------------------------------------------------------------------------

function _unifyForReplay (inputs, refs, jigToSync) {
  return _sudo(() => {
    // All incoming jigs must have unique origins
    const incoming = inputs.concat(refs)
    const incomingByOrigin = {}
    incoming.forEach(x => {
      const y = incomingByOrigin[x.origin]
      if (y) {
        const line1 = `1st location: ${x.location}`
        const line2 = `2nd location: ${y.location}`
        const error = `Inconsistent reference: ${_text(x)}\n\n${line1}\n${line2}`
        throw new Error(error)
      }
      incomingByOrigin[x.origin] = x
    })

    const worldview = { }
    const allJigs = new Set()
    const deunifyMap = new Map()

    // Add all incoming jigs to the worldview first
    incoming.forEach(x => { worldview[x.origin] = x })

    // Calculate the latest versions of every referenced jig
    const Creation = __webpack_require__(3)
    _sudo(() => _deepVisit(incoming, x => {
      if (x instanceof Creation) {
        allJigs.add(x)
        const xOrigin = x.origin
        const incomingY = incomingByOrigin[xOrigin]
        if (incomingY && x.nonce > incomingY.nonce) {
          const line1 = `1st location: ${x.location}`
          const line2 = `2nd location: ${incomingY.location}`
          throw new Error(`Time travel: ${_text(x)}\n\n${line1}\n${line2}`)
        }
        const y = worldview[xOrigin]
        if (!y || x.nonce > y.nonce) worldview[xOrigin] = x
      }
    }))

    // Override the worldview so that all inner refs use the jig to sync
    if (jigToSync) worldview[jigToSync.origin] = jigToSync

    // Unify the jig to sync with the worldview, potentially reversing inner syncs
    _deepReplace(jigToSync, (x, recurse) => {
      if (x !== jigToSync && x instanceof Creation) {
        recurse(false)
        return worldview[x.origin]
      }
    })

    // Now update the jigs of all other references. Do so shallowly to track jigs for deunification.
    for (const jig of allJigs) {
      const refs = new Map()
      _deepReplace(jig, (x, recurse) => {
        if (x !== jig && x instanceof Creation) {
          const y = worldview[x.origin]
          if (x !== y) refs.set(y, x)
          _assert(y)
          recurse(false)
          return y
        }
      })
      if (!inputs.includes(jig)) deunifyMap.set(jig, refs)
    }

    // Build a refmap from the worldview which we will use to save state later
    const refmap = {}
    Object.entries(worldview).forEach(([origin, jig]) => {
      refmap[origin] = [jig.location, jig.nonce]
    })

    return { _refmap: refmap, _deunifyMap: deunifyMap }
  })
}

// ------------------------------------------------------------------------------------------------
// _deunifyForReplay
// ------------------------------------------------------------------------------------------------

function _deunifyForReplay (deunifyMap) {
  _sudo(() => {
    for (const [jig, value] of deunifyMap.entries()) {
      const Creation = __webpack_require__(3)
      _deepReplace(jig, (x, recurse) => {
        if (x !== jig && x instanceof Creation) {
          recurse(false)
          return value.get(x) || x
        }
      })
    }
  })
}

// ------------------------------------------------------------------------------------------------
// _unifyForMethod
// ------------------------------------------------------------------------------------------------

function _unifyForMethod (obj, fixed = []) {
  const Creation = __webpack_require__(3)

  if (!UNIFY_FOR_METHOD_ENABLED) return

  const getKey = x => _sudo(() => {
    if (!_hasOwnProperty(x, 'origin') || x.origin.startsWith('error://')) return x
    return x.origin
  })

  return _sudo(() => {
    const worldview = new Map() // Origin | Jig -> Creation

    // Add fixed jigs so they don't get replaced
    fixed.forEach(jig => {
      _assert(jig instanceof Creation)
      const xkey = getKey(jig)
      const consistent = !worldview.has(xkey) || worldview.get(xkey).nonce === jig.nonce
      if (!consistent) {
        const details = _sudo(() => `There are conflicting jigs for ${jig.origin}, nonces ${worldview.get(xkey).nonce}, ${jig.nonce}`)
        throw new Error(`Cannot unify inconsistent ${_text(jig)}\n\n${details}`)
      }
      worldview.set(xkey, jig)
    })

    // Find the most recent versions of every inner jig
    _sudo(() => _deepVisit(obj, x => {
      if (x instanceof Creation) {
        const xkey = getKey(x)
        const y = worldview.get(xkey) || x
        if (!worldview.has(xkey)) worldview.set(xkey, x)

        if (x.nonce > y.nonce) {
          if (fixed.includes(y)) {
            const line1 = `1st location: ${x.location}`
            const line2 = `2nd location: ${y.location}`
            throw new Error(`Cannot unify inconsistent ${_text(x)}\n\n${line1}\n${line2}`)
          }

          worldview.set(xkey, x)
        }
      }
    }))

    return _deepReplace(obj, x => {
      if (x instanceof Creation) {
        return worldview.get(getKey(x))
      }
    })
  })
}

// ------------------------------------------------------------------------------------------------

function _setUnifyForMethodEnabled (enabled) {
  UNIFY_FOR_METHOD_ENABLED = enabled
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _unifyForReplay,
  _deunifyForReplay,
  _unifyForMethod,
  _setUnifyForMethodEnabled
}


/***/ }),
/* 33 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";
/* WEBPACK VAR INJECTION */(function(global) {/*!
 * The buffer module from node.js, for the browser.
 *
 * @author   Feross Aboukhadijeh <http://feross.org>
 * @license  MIT
 */
/* eslint-disable no-proto */



var base64 = __webpack_require__(62)
var ieee754 = __webpack_require__(63)
var isArray = __webpack_require__(64)

exports.Buffer = Buffer
exports.SlowBuffer = SlowBuffer
exports.INSPECT_MAX_BYTES = 50

/**
 * If `Buffer.TYPED_ARRAY_SUPPORT`:
 *   === true    Use Uint8Array implementation (fastest)
 *   === false   Use Object implementation (most compatible, even IE6)
 *
 * Browsers that support typed arrays are IE 10+, Firefox 4+, Chrome 7+, Safari 5.1+,
 * Opera 11.6+, iOS 4.2+.
 *
 * Due to various browser bugs, sometimes the Object implementation will be used even
 * when the browser supports typed arrays.
 *
 * Note:
 *
 *   - Firefox 4-29 lacks support for adding new properties to `Uint8Array` instances,
 *     See: https://bugzilla.mozilla.org/show_bug.cgi?id=695438.
 *
 *   - Chrome 9-10 is missing the `TypedArray.prototype.subarray` function.
 *
 *   - IE10 has a broken `TypedArray.prototype.subarray` function which returns arrays of
 *     incorrect length in some situations.

 * We detect these buggy browsers and set `Buffer.TYPED_ARRAY_SUPPORT` to `false` so they
 * get the Object implementation, which is slower but behaves correctly.
 */
Buffer.TYPED_ARRAY_SUPPORT = global.TYPED_ARRAY_SUPPORT !== undefined
  ? global.TYPED_ARRAY_SUPPORT
  : typedArraySupport()

/*
 * Export kMaxLength after typed array support is determined.
 */
exports.kMaxLength = kMaxLength()

function typedArraySupport () {
  try {
    var arr = new Uint8Array(1)
    arr.__proto__ = {__proto__: Uint8Array.prototype, foo: function () { return 42 }}
    return arr.foo() === 42 && // typed array instances can be augmented
        typeof arr.subarray === 'function' && // chrome 9-10 lack `subarray`
        arr.subarray(1, 1).byteLength === 0 // ie10 has broken `subarray`
  } catch (e) {
    return false
  }
}

function kMaxLength () {
  return Buffer.TYPED_ARRAY_SUPPORT
    ? 0x7fffffff
    : 0x3fffffff
}

function createBuffer (that, length) {
  if (kMaxLength() < length) {
    throw new RangeError('Invalid typed array length')
  }
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = new Uint8Array(length)
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    if (that === null) {
      that = new Buffer(length)
    }
    that.length = length
  }

  return that
}

/**
 * The Buffer constructor returns instances of `Uint8Array` that have their
 * prototype changed to `Buffer.prototype`. Furthermore, `Buffer` is a subclass of
 * `Uint8Array`, so the returned instances will have all the node `Buffer` methods
 * and the `Uint8Array` methods. Square bracket notation works as expected -- it
 * returns a single octet.
 *
 * The `Uint8Array` prototype remains unmodified.
 */

function Buffer (arg, encodingOrOffset, length) {
  if (!Buffer.TYPED_ARRAY_SUPPORT && !(this instanceof Buffer)) {
    return new Buffer(arg, encodingOrOffset, length)
  }

  // Common case.
  if (typeof arg === 'number') {
    if (typeof encodingOrOffset === 'string') {
      throw new Error(
        'If encoding is specified then the first argument must be a string'
      )
    }
    return allocUnsafe(this, arg)
  }
  return from(this, arg, encodingOrOffset, length)
}

Buffer.poolSize = 8192 // not used by this implementation

// TODO: Legacy, not needed anymore. Remove in next major version.
Buffer._augment = function (arr) {
  arr.__proto__ = Buffer.prototype
  return arr
}

function from (that, value, encodingOrOffset, length) {
  if (typeof value === 'number') {
    throw new TypeError('"value" argument must not be a number')
  }

  if (typeof ArrayBuffer !== 'undefined' && value instanceof ArrayBuffer) {
    return fromArrayBuffer(that, value, encodingOrOffset, length)
  }

  if (typeof value === 'string') {
    return fromString(that, value, encodingOrOffset)
  }

  return fromObject(that, value)
}

/**
 * Functionally equivalent to Buffer(arg, encoding) but throws a TypeError
 * if value is a number.
 * Buffer.from(str[, encoding])
 * Buffer.from(array)
 * Buffer.from(buffer)
 * Buffer.from(arrayBuffer[, byteOffset[, length]])
 **/
Buffer.from = function (value, encodingOrOffset, length) {
  return from(null, value, encodingOrOffset, length)
}

if (Buffer.TYPED_ARRAY_SUPPORT) {
  Buffer.prototype.__proto__ = Uint8Array.prototype
  Buffer.__proto__ = Uint8Array
  if (typeof Symbol !== 'undefined' && Symbol.species &&
      Buffer[Symbol.species] === Buffer) {
    // Fix subarray() in ES2016. See: https://github.com/feross/buffer/pull/97
    Object.defineProperty(Buffer, Symbol.species, {
      value: null,
      configurable: true
    })
  }
}

function assertSize (size) {
  if (typeof size !== 'number') {
    throw new TypeError('"size" argument must be a number')
  } else if (size < 0) {
    throw new RangeError('"size" argument must not be negative')
  }
}

function alloc (that, size, fill, encoding) {
  assertSize(size)
  if (size <= 0) {
    return createBuffer(that, size)
  }
  if (fill !== undefined) {
    // Only pay attention to encoding if it's a string. This
    // prevents accidentally sending in a number that would
    // be interpretted as a start offset.
    return typeof encoding === 'string'
      ? createBuffer(that, size).fill(fill, encoding)
      : createBuffer(that, size).fill(fill)
  }
  return createBuffer(that, size)
}

/**
 * Creates a new filled Buffer instance.
 * alloc(size[, fill[, encoding]])
 **/
Buffer.alloc = function (size, fill, encoding) {
  return alloc(null, size, fill, encoding)
}

function allocUnsafe (that, size) {
  assertSize(size)
  that = createBuffer(that, size < 0 ? 0 : checked(size) | 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) {
    for (var i = 0; i < size; ++i) {
      that[i] = 0
    }
  }
  return that
}

/**
 * Equivalent to Buffer(num), by default creates a non-zero-filled Buffer instance.
 * */
Buffer.allocUnsafe = function (size) {
  return allocUnsafe(null, size)
}
/**
 * Equivalent to SlowBuffer(num), by default creates a non-zero-filled Buffer instance.
 */
Buffer.allocUnsafeSlow = function (size) {
  return allocUnsafe(null, size)
}

function fromString (that, string, encoding) {
  if (typeof encoding !== 'string' || encoding === '') {
    encoding = 'utf8'
  }

  if (!Buffer.isEncoding(encoding)) {
    throw new TypeError('"encoding" must be a valid string encoding')
  }

  var length = byteLength(string, encoding) | 0
  that = createBuffer(that, length)

  var actual = that.write(string, encoding)

  if (actual !== length) {
    // Writing a hex string, for example, that contains invalid characters will
    // cause everything after the first invalid character to be ignored. (e.g.
    // 'abxxcd' will be treated as 'ab')
    that = that.slice(0, actual)
  }

  return that
}

function fromArrayLike (that, array) {
  var length = array.length < 0 ? 0 : checked(array.length) | 0
  that = createBuffer(that, length)
  for (var i = 0; i < length; i += 1) {
    that[i] = array[i] & 255
  }
  return that
}

function fromArrayBuffer (that, array, byteOffset, length) {
  array.byteLength // this throws if `array` is not a valid ArrayBuffer

  if (byteOffset < 0 || array.byteLength < byteOffset) {
    throw new RangeError('\'offset\' is out of bounds')
  }

  if (array.byteLength < byteOffset + (length || 0)) {
    throw new RangeError('\'length\' is out of bounds')
  }

  if (byteOffset === undefined && length === undefined) {
    array = new Uint8Array(array)
  } else if (length === undefined) {
    array = new Uint8Array(array, byteOffset)
  } else {
    array = new Uint8Array(array, byteOffset, length)
  }

  if (Buffer.TYPED_ARRAY_SUPPORT) {
    // Return an augmented `Uint8Array` instance, for best performance
    that = array
    that.__proto__ = Buffer.prototype
  } else {
    // Fallback: Return an object instance of the Buffer class
    that = fromArrayLike(that, array)
  }
  return that
}

function fromObject (that, obj) {
  if (Buffer.isBuffer(obj)) {
    var len = checked(obj.length) | 0
    that = createBuffer(that, len)

    if (that.length === 0) {
      return that
    }

    obj.copy(that, 0, 0, len)
    return that
  }

  if (obj) {
    if ((typeof ArrayBuffer !== 'undefined' &&
        obj.buffer instanceof ArrayBuffer) || 'length' in obj) {
      if (typeof obj.length !== 'number' || isnan(obj.length)) {
        return createBuffer(that, 0)
      }
      return fromArrayLike(that, obj)
    }

    if (obj.type === 'Buffer' && isArray(obj.data)) {
      return fromArrayLike(that, obj.data)
    }
  }

  throw new TypeError('First argument must be a string, Buffer, ArrayBuffer, Array, or array-like object.')
}

function checked (length) {
  // Note: cannot use `length < kMaxLength()` here because that fails when
  // length is NaN (which is otherwise coerced to zero.)
  if (length >= kMaxLength()) {
    throw new RangeError('Attempt to allocate Buffer larger than maximum ' +
                         'size: 0x' + kMaxLength().toString(16) + ' bytes')
  }
  return length | 0
}

function SlowBuffer (length) {
  if (+length != length) { // eslint-disable-line eqeqeq
    length = 0
  }
  return Buffer.alloc(+length)
}

Buffer.isBuffer = function isBuffer (b) {
  return !!(b != null && b._isBuffer)
}

Buffer.compare = function compare (a, b) {
  if (!Buffer.isBuffer(a) || !Buffer.isBuffer(b)) {
    throw new TypeError('Arguments must be Buffers')
  }

  if (a === b) return 0

  var x = a.length
  var y = b.length

  for (var i = 0, len = Math.min(x, y); i < len; ++i) {
    if (a[i] !== b[i]) {
      x = a[i]
      y = b[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

Buffer.isEncoding = function isEncoding (encoding) {
  switch (String(encoding).toLowerCase()) {
    case 'hex':
    case 'utf8':
    case 'utf-8':
    case 'ascii':
    case 'latin1':
    case 'binary':
    case 'base64':
    case 'ucs2':
    case 'ucs-2':
    case 'utf16le':
    case 'utf-16le':
      return true
    default:
      return false
  }
}

Buffer.concat = function concat (list, length) {
  if (!isArray(list)) {
    throw new TypeError('"list" argument must be an Array of Buffers')
  }

  if (list.length === 0) {
    return Buffer.alloc(0)
  }

  var i
  if (length === undefined) {
    length = 0
    for (i = 0; i < list.length; ++i) {
      length += list[i].length
    }
  }

  var buffer = Buffer.allocUnsafe(length)
  var pos = 0
  for (i = 0; i < list.length; ++i) {
    var buf = list[i]
    if (!Buffer.isBuffer(buf)) {
      throw new TypeError('"list" argument must be an Array of Buffers')
    }
    buf.copy(buffer, pos)
    pos += buf.length
  }
  return buffer
}

function byteLength (string, encoding) {
  if (Buffer.isBuffer(string)) {
    return string.length
  }
  if (typeof ArrayBuffer !== 'undefined' && typeof ArrayBuffer.isView === 'function' &&
      (ArrayBuffer.isView(string) || string instanceof ArrayBuffer)) {
    return string.byteLength
  }
  if (typeof string !== 'string') {
    string = '' + string
  }

  var len = string.length
  if (len === 0) return 0

  // Use a for loop to avoid recursion
  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'ascii':
      case 'latin1':
      case 'binary':
        return len
      case 'utf8':
      case 'utf-8':
      case undefined:
        return utf8ToBytes(string).length
      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return len * 2
      case 'hex':
        return len >>> 1
      case 'base64':
        return base64ToBytes(string).length
      default:
        if (loweredCase) return utf8ToBytes(string).length // assume utf8
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}
Buffer.byteLength = byteLength

function slowToString (encoding, start, end) {
  var loweredCase = false

  // No need to verify that "this.length <= MAX_UINT32" since it's a read-only
  // property of a typed array.

  // This behaves neither like String nor Uint8Array in that we set start/end
  // to their upper/lower bounds if the value passed is out of range.
  // undefined is handled specially as per ECMA-262 6th Edition,
  // Section 13.3.3.7 Runtime Semantics: KeyedBindingInitialization.
  if (start === undefined || start < 0) {
    start = 0
  }
  // Return early if start > this.length. Done here to prevent potential uint32
  // coercion fail below.
  if (start > this.length) {
    return ''
  }

  if (end === undefined || end > this.length) {
    end = this.length
  }

  if (end <= 0) {
    return ''
  }

  // Force coersion to uint32. This will also coerce falsey/NaN values to 0.
  end >>>= 0
  start >>>= 0

  if (end <= start) {
    return ''
  }

  if (!encoding) encoding = 'utf8'

  while (true) {
    switch (encoding) {
      case 'hex':
        return hexSlice(this, start, end)

      case 'utf8':
      case 'utf-8':
        return utf8Slice(this, start, end)

      case 'ascii':
        return asciiSlice(this, start, end)

      case 'latin1':
      case 'binary':
        return latin1Slice(this, start, end)

      case 'base64':
        return base64Slice(this, start, end)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return utf16leSlice(this, start, end)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = (encoding + '').toLowerCase()
        loweredCase = true
    }
  }
}

// The property is used by `Buffer.isBuffer` and `is-buffer` (in Safari 5-7) to detect
// Buffer instances.
Buffer.prototype._isBuffer = true

function swap (b, n, m) {
  var i = b[n]
  b[n] = b[m]
  b[m] = i
}

Buffer.prototype.swap16 = function swap16 () {
  var len = this.length
  if (len % 2 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 16-bits')
  }
  for (var i = 0; i < len; i += 2) {
    swap(this, i, i + 1)
  }
  return this
}

Buffer.prototype.swap32 = function swap32 () {
  var len = this.length
  if (len % 4 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 32-bits')
  }
  for (var i = 0; i < len; i += 4) {
    swap(this, i, i + 3)
    swap(this, i + 1, i + 2)
  }
  return this
}

Buffer.prototype.swap64 = function swap64 () {
  var len = this.length
  if (len % 8 !== 0) {
    throw new RangeError('Buffer size must be a multiple of 64-bits')
  }
  for (var i = 0; i < len; i += 8) {
    swap(this, i, i + 7)
    swap(this, i + 1, i + 6)
    swap(this, i + 2, i + 5)
    swap(this, i + 3, i + 4)
  }
  return this
}

Buffer.prototype.toString = function toString () {
  var length = this.length | 0
  if (length === 0) return ''
  if (arguments.length === 0) return utf8Slice(this, 0, length)
  return slowToString.apply(this, arguments)
}

Buffer.prototype.equals = function equals (b) {
  if (!Buffer.isBuffer(b)) throw new TypeError('Argument must be a Buffer')
  if (this === b) return true
  return Buffer.compare(this, b) === 0
}

Buffer.prototype.inspect = function inspect () {
  var str = ''
  var max = exports.INSPECT_MAX_BYTES
  if (this.length > 0) {
    str = this.toString('hex', 0, max).match(/.{2}/g).join(' ')
    if (this.length > max) str += ' ... '
  }
  return '<Buffer ' + str + '>'
}

Buffer.prototype.compare = function compare (target, start, end, thisStart, thisEnd) {
  if (!Buffer.isBuffer(target)) {
    throw new TypeError('Argument must be a Buffer')
  }

  if (start === undefined) {
    start = 0
  }
  if (end === undefined) {
    end = target ? target.length : 0
  }
  if (thisStart === undefined) {
    thisStart = 0
  }
  if (thisEnd === undefined) {
    thisEnd = this.length
  }

  if (start < 0 || end > target.length || thisStart < 0 || thisEnd > this.length) {
    throw new RangeError('out of range index')
  }

  if (thisStart >= thisEnd && start >= end) {
    return 0
  }
  if (thisStart >= thisEnd) {
    return -1
  }
  if (start >= end) {
    return 1
  }

  start >>>= 0
  end >>>= 0
  thisStart >>>= 0
  thisEnd >>>= 0

  if (this === target) return 0

  var x = thisEnd - thisStart
  var y = end - start
  var len = Math.min(x, y)

  var thisCopy = this.slice(thisStart, thisEnd)
  var targetCopy = target.slice(start, end)

  for (var i = 0; i < len; ++i) {
    if (thisCopy[i] !== targetCopy[i]) {
      x = thisCopy[i]
      y = targetCopy[i]
      break
    }
  }

  if (x < y) return -1
  if (y < x) return 1
  return 0
}

// Finds either the first index of `val` in `buffer` at offset >= `byteOffset`,
// OR the last index of `val` in `buffer` at offset <= `byteOffset`.
//
// Arguments:
// - buffer - a Buffer to search
// - val - a string, Buffer, or number
// - byteOffset - an index into `buffer`; will be clamped to an int32
// - encoding - an optional encoding, relevant is val is a string
// - dir - true for indexOf, false for lastIndexOf
function bidirectionalIndexOf (buffer, val, byteOffset, encoding, dir) {
  // Empty buffer means no match
  if (buffer.length === 0) return -1

  // Normalize byteOffset
  if (typeof byteOffset === 'string') {
    encoding = byteOffset
    byteOffset = 0
  } else if (byteOffset > 0x7fffffff) {
    byteOffset = 0x7fffffff
  } else if (byteOffset < -0x80000000) {
    byteOffset = -0x80000000
  }
  byteOffset = +byteOffset  // Coerce to Number.
  if (isNaN(byteOffset)) {
    // byteOffset: it it's undefined, null, NaN, "foo", etc, search whole buffer
    byteOffset = dir ? 0 : (buffer.length - 1)
  }

  // Normalize byteOffset: negative offsets start from the end of the buffer
  if (byteOffset < 0) byteOffset = buffer.length + byteOffset
  if (byteOffset >= buffer.length) {
    if (dir) return -1
    else byteOffset = buffer.length - 1
  } else if (byteOffset < 0) {
    if (dir) byteOffset = 0
    else return -1
  }

  // Normalize val
  if (typeof val === 'string') {
    val = Buffer.from(val, encoding)
  }

  // Finally, search either indexOf (if dir is true) or lastIndexOf
  if (Buffer.isBuffer(val)) {
    // Special case: looking for empty string/buffer always fails
    if (val.length === 0) {
      return -1
    }
    return arrayIndexOf(buffer, val, byteOffset, encoding, dir)
  } else if (typeof val === 'number') {
    val = val & 0xFF // Search for a byte value [0-255]
    if (Buffer.TYPED_ARRAY_SUPPORT &&
        typeof Uint8Array.prototype.indexOf === 'function') {
      if (dir) {
        return Uint8Array.prototype.indexOf.call(buffer, val, byteOffset)
      } else {
        return Uint8Array.prototype.lastIndexOf.call(buffer, val, byteOffset)
      }
    }
    return arrayIndexOf(buffer, [ val ], byteOffset, encoding, dir)
  }

  throw new TypeError('val must be string, number or Buffer')
}

function arrayIndexOf (arr, val, byteOffset, encoding, dir) {
  var indexSize = 1
  var arrLength = arr.length
  var valLength = val.length

  if (encoding !== undefined) {
    encoding = String(encoding).toLowerCase()
    if (encoding === 'ucs2' || encoding === 'ucs-2' ||
        encoding === 'utf16le' || encoding === 'utf-16le') {
      if (arr.length < 2 || val.length < 2) {
        return -1
      }
      indexSize = 2
      arrLength /= 2
      valLength /= 2
      byteOffset /= 2
    }
  }

  function read (buf, i) {
    if (indexSize === 1) {
      return buf[i]
    } else {
      return buf.readUInt16BE(i * indexSize)
    }
  }

  var i
  if (dir) {
    var foundIndex = -1
    for (i = byteOffset; i < arrLength; i++) {
      if (read(arr, i) === read(val, foundIndex === -1 ? 0 : i - foundIndex)) {
        if (foundIndex === -1) foundIndex = i
        if (i - foundIndex + 1 === valLength) return foundIndex * indexSize
      } else {
        if (foundIndex !== -1) i -= i - foundIndex
        foundIndex = -1
      }
    }
  } else {
    if (byteOffset + valLength > arrLength) byteOffset = arrLength - valLength
    for (i = byteOffset; i >= 0; i--) {
      var found = true
      for (var j = 0; j < valLength; j++) {
        if (read(arr, i + j) !== read(val, j)) {
          found = false
          break
        }
      }
      if (found) return i
    }
  }

  return -1
}

Buffer.prototype.includes = function includes (val, byteOffset, encoding) {
  return this.indexOf(val, byteOffset, encoding) !== -1
}

Buffer.prototype.indexOf = function indexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, true)
}

Buffer.prototype.lastIndexOf = function lastIndexOf (val, byteOffset, encoding) {
  return bidirectionalIndexOf(this, val, byteOffset, encoding, false)
}

function hexWrite (buf, string, offset, length) {
  offset = Number(offset) || 0
  var remaining = buf.length - offset
  if (!length) {
    length = remaining
  } else {
    length = Number(length)
    if (length > remaining) {
      length = remaining
    }
  }

  // must be an even number of digits
  var strLen = string.length
  if (strLen % 2 !== 0) throw new TypeError('Invalid hex string')

  if (length > strLen / 2) {
    length = strLen / 2
  }
  for (var i = 0; i < length; ++i) {
    var parsed = parseInt(string.substr(i * 2, 2), 16)
    if (isNaN(parsed)) return i
    buf[offset + i] = parsed
  }
  return i
}

function utf8Write (buf, string, offset, length) {
  return blitBuffer(utf8ToBytes(string, buf.length - offset), buf, offset, length)
}

function asciiWrite (buf, string, offset, length) {
  return blitBuffer(asciiToBytes(string), buf, offset, length)
}

function latin1Write (buf, string, offset, length) {
  return asciiWrite(buf, string, offset, length)
}

function base64Write (buf, string, offset, length) {
  return blitBuffer(base64ToBytes(string), buf, offset, length)
}

function ucs2Write (buf, string, offset, length) {
  return blitBuffer(utf16leToBytes(string, buf.length - offset), buf, offset, length)
}

Buffer.prototype.write = function write (string, offset, length, encoding) {
  // Buffer#write(string)
  if (offset === undefined) {
    encoding = 'utf8'
    length = this.length
    offset = 0
  // Buffer#write(string, encoding)
  } else if (length === undefined && typeof offset === 'string') {
    encoding = offset
    length = this.length
    offset = 0
  // Buffer#write(string, offset[, length][, encoding])
  } else if (isFinite(offset)) {
    offset = offset | 0
    if (isFinite(length)) {
      length = length | 0
      if (encoding === undefined) encoding = 'utf8'
    } else {
      encoding = length
      length = undefined
    }
  // legacy write(string, encoding, offset, length) - remove in v0.13
  } else {
    throw new Error(
      'Buffer.write(string, encoding, offset[, length]) is no longer supported'
    )
  }

  var remaining = this.length - offset
  if (length === undefined || length > remaining) length = remaining

  if ((string.length > 0 && (length < 0 || offset < 0)) || offset > this.length) {
    throw new RangeError('Attempt to write outside buffer bounds')
  }

  if (!encoding) encoding = 'utf8'

  var loweredCase = false
  for (;;) {
    switch (encoding) {
      case 'hex':
        return hexWrite(this, string, offset, length)

      case 'utf8':
      case 'utf-8':
        return utf8Write(this, string, offset, length)

      case 'ascii':
        return asciiWrite(this, string, offset, length)

      case 'latin1':
      case 'binary':
        return latin1Write(this, string, offset, length)

      case 'base64':
        // Warning: maxLength not taken into account in base64Write
        return base64Write(this, string, offset, length)

      case 'ucs2':
      case 'ucs-2':
      case 'utf16le':
      case 'utf-16le':
        return ucs2Write(this, string, offset, length)

      default:
        if (loweredCase) throw new TypeError('Unknown encoding: ' + encoding)
        encoding = ('' + encoding).toLowerCase()
        loweredCase = true
    }
  }
}

Buffer.prototype.toJSON = function toJSON () {
  return {
    type: 'Buffer',
    data: Array.prototype.slice.call(this._arr || this, 0)
  }
}

function base64Slice (buf, start, end) {
  if (start === 0 && end === buf.length) {
    return base64.fromByteArray(buf)
  } else {
    return base64.fromByteArray(buf.slice(start, end))
  }
}

function utf8Slice (buf, start, end) {
  end = Math.min(buf.length, end)
  var res = []

  var i = start
  while (i < end) {
    var firstByte = buf[i]
    var codePoint = null
    var bytesPerSequence = (firstByte > 0xEF) ? 4
      : (firstByte > 0xDF) ? 3
      : (firstByte > 0xBF) ? 2
      : 1

    if (i + bytesPerSequence <= end) {
      var secondByte, thirdByte, fourthByte, tempCodePoint

      switch (bytesPerSequence) {
        case 1:
          if (firstByte < 0x80) {
            codePoint = firstByte
          }
          break
        case 2:
          secondByte = buf[i + 1]
          if ((secondByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0x1F) << 0x6 | (secondByte & 0x3F)
            if (tempCodePoint > 0x7F) {
              codePoint = tempCodePoint
            }
          }
          break
        case 3:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0xC | (secondByte & 0x3F) << 0x6 | (thirdByte & 0x3F)
            if (tempCodePoint > 0x7FF && (tempCodePoint < 0xD800 || tempCodePoint > 0xDFFF)) {
              codePoint = tempCodePoint
            }
          }
          break
        case 4:
          secondByte = buf[i + 1]
          thirdByte = buf[i + 2]
          fourthByte = buf[i + 3]
          if ((secondByte & 0xC0) === 0x80 && (thirdByte & 0xC0) === 0x80 && (fourthByte & 0xC0) === 0x80) {
            tempCodePoint = (firstByte & 0xF) << 0x12 | (secondByte & 0x3F) << 0xC | (thirdByte & 0x3F) << 0x6 | (fourthByte & 0x3F)
            if (tempCodePoint > 0xFFFF && tempCodePoint < 0x110000) {
              codePoint = tempCodePoint
            }
          }
      }
    }

    if (codePoint === null) {
      // we did not generate a valid codePoint so insert a
      // replacement char (U+FFFD) and advance only 1 byte
      codePoint = 0xFFFD
      bytesPerSequence = 1
    } else if (codePoint > 0xFFFF) {
      // encode to utf16 (surrogate pair dance)
      codePoint -= 0x10000
      res.push(codePoint >>> 10 & 0x3FF | 0xD800)
      codePoint = 0xDC00 | codePoint & 0x3FF
    }

    res.push(codePoint)
    i += bytesPerSequence
  }

  return decodeCodePointsArray(res)
}

// Based on http://stackoverflow.com/a/22747272/680742, the browser with
// the lowest limit is Chrome, with 0x10000 args.
// We go 1 magnitude less, for safety
var MAX_ARGUMENTS_LENGTH = 0x1000

function decodeCodePointsArray (codePoints) {
  var len = codePoints.length
  if (len <= MAX_ARGUMENTS_LENGTH) {
    return String.fromCharCode.apply(String, codePoints) // avoid extra slice()
  }

  // Decode in chunks to avoid "call stack size exceeded".
  var res = ''
  var i = 0
  while (i < len) {
    res += String.fromCharCode.apply(
      String,
      codePoints.slice(i, i += MAX_ARGUMENTS_LENGTH)
    )
  }
  return res
}

function asciiSlice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i] & 0x7F)
  }
  return ret
}

function latin1Slice (buf, start, end) {
  var ret = ''
  end = Math.min(buf.length, end)

  for (var i = start; i < end; ++i) {
    ret += String.fromCharCode(buf[i])
  }
  return ret
}

function hexSlice (buf, start, end) {
  var len = buf.length

  if (!start || start < 0) start = 0
  if (!end || end < 0 || end > len) end = len

  var out = ''
  for (var i = start; i < end; ++i) {
    out += toHex(buf[i])
  }
  return out
}

function utf16leSlice (buf, start, end) {
  var bytes = buf.slice(start, end)
  var res = ''
  for (var i = 0; i < bytes.length; i += 2) {
    res += String.fromCharCode(bytes[i] + bytes[i + 1] * 256)
  }
  return res
}

Buffer.prototype.slice = function slice (start, end) {
  var len = this.length
  start = ~~start
  end = end === undefined ? len : ~~end

  if (start < 0) {
    start += len
    if (start < 0) start = 0
  } else if (start > len) {
    start = len
  }

  if (end < 0) {
    end += len
    if (end < 0) end = 0
  } else if (end > len) {
    end = len
  }

  if (end < start) end = start

  var newBuf
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    newBuf = this.subarray(start, end)
    newBuf.__proto__ = Buffer.prototype
  } else {
    var sliceLen = end - start
    newBuf = new Buffer(sliceLen, undefined)
    for (var i = 0; i < sliceLen; ++i) {
      newBuf[i] = this[i + start]
    }
  }

  return newBuf
}

/*
 * Need to make sure that buffer isn't trying to write out of bounds.
 */
function checkOffset (offset, ext, length) {
  if ((offset % 1) !== 0 || offset < 0) throw new RangeError('offset is not uint')
  if (offset + ext > length) throw new RangeError('Trying to access beyond buffer length')
}

Buffer.prototype.readUIntLE = function readUIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }

  return val
}

Buffer.prototype.readUIntBE = function readUIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    checkOffset(offset, byteLength, this.length)
  }

  var val = this[offset + --byteLength]
  var mul = 1
  while (byteLength > 0 && (mul *= 0x100)) {
    val += this[offset + --byteLength] * mul
  }

  return val
}

Buffer.prototype.readUInt8 = function readUInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  return this[offset]
}

Buffer.prototype.readUInt16LE = function readUInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return this[offset] | (this[offset + 1] << 8)
}

Buffer.prototype.readUInt16BE = function readUInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  return (this[offset] << 8) | this[offset + 1]
}

Buffer.prototype.readUInt32LE = function readUInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return ((this[offset]) |
      (this[offset + 1] << 8) |
      (this[offset + 2] << 16)) +
      (this[offset + 3] * 0x1000000)
}

Buffer.prototype.readUInt32BE = function readUInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] * 0x1000000) +
    ((this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    this[offset + 3])
}

Buffer.prototype.readIntLE = function readIntLE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var val = this[offset]
  var mul = 1
  var i = 0
  while (++i < byteLength && (mul *= 0x100)) {
    val += this[offset + i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readIntBE = function readIntBE (offset, byteLength, noAssert) {
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) checkOffset(offset, byteLength, this.length)

  var i = byteLength
  var mul = 1
  var val = this[offset + --i]
  while (i > 0 && (mul *= 0x100)) {
    val += this[offset + --i] * mul
  }
  mul *= 0x80

  if (val >= mul) val -= Math.pow(2, 8 * byteLength)

  return val
}

Buffer.prototype.readInt8 = function readInt8 (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 1, this.length)
  if (!(this[offset] & 0x80)) return (this[offset])
  return ((0xff - this[offset] + 1) * -1)
}

Buffer.prototype.readInt16LE = function readInt16LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset] | (this[offset + 1] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt16BE = function readInt16BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 2, this.length)
  var val = this[offset + 1] | (this[offset] << 8)
  return (val & 0x8000) ? val | 0xFFFF0000 : val
}

Buffer.prototype.readInt32LE = function readInt32LE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset]) |
    (this[offset + 1] << 8) |
    (this[offset + 2] << 16) |
    (this[offset + 3] << 24)
}

Buffer.prototype.readInt32BE = function readInt32BE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)

  return (this[offset] << 24) |
    (this[offset + 1] << 16) |
    (this[offset + 2] << 8) |
    (this[offset + 3])
}

Buffer.prototype.readFloatLE = function readFloatLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, true, 23, 4)
}

Buffer.prototype.readFloatBE = function readFloatBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 4, this.length)
  return ieee754.read(this, offset, false, 23, 4)
}

Buffer.prototype.readDoubleLE = function readDoubleLE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, true, 52, 8)
}

Buffer.prototype.readDoubleBE = function readDoubleBE (offset, noAssert) {
  if (!noAssert) checkOffset(offset, 8, this.length)
  return ieee754.read(this, offset, false, 52, 8)
}

function checkInt (buf, value, offset, ext, max, min) {
  if (!Buffer.isBuffer(buf)) throw new TypeError('"buffer" argument must be a Buffer instance')
  if (value > max || value < min) throw new RangeError('"value" argument is out of bounds')
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
}

Buffer.prototype.writeUIntLE = function writeUIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var mul = 1
  var i = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUIntBE = function writeUIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  byteLength = byteLength | 0
  if (!noAssert) {
    var maxBytes = Math.pow(2, 8 * byteLength) - 1
    checkInt(this, value, offset, byteLength, maxBytes, 0)
  }

  var i = byteLength - 1
  var mul = 1
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    this[offset + i] = (value / mul) & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeUInt8 = function writeUInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0xff, 0)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  this[offset] = (value & 0xff)
  return offset + 1
}

function objectWriteUInt16 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 2); i < j; ++i) {
    buf[offset + i] = (value & (0xff << (8 * (littleEndian ? i : 1 - i)))) >>>
      (littleEndian ? i : 1 - i) * 8
  }
}

Buffer.prototype.writeUInt16LE = function writeUInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeUInt16BE = function writeUInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0xffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

function objectWriteUInt32 (buf, value, offset, littleEndian) {
  if (value < 0) value = 0xffffffff + value + 1
  for (var i = 0, j = Math.min(buf.length - offset, 4); i < j; ++i) {
    buf[offset + i] = (value >>> (littleEndian ? i : 3 - i) * 8) & 0xff
  }
}

Buffer.prototype.writeUInt32LE = function writeUInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset + 3] = (value >>> 24)
    this[offset + 2] = (value >>> 16)
    this[offset + 1] = (value >>> 8)
    this[offset] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeUInt32BE = function writeUInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0xffffffff, 0)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

Buffer.prototype.writeIntLE = function writeIntLE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = 0
  var mul = 1
  var sub = 0
  this[offset] = value & 0xFF
  while (++i < byteLength && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i - 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeIntBE = function writeIntBE (value, offset, byteLength, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) {
    var limit = Math.pow(2, 8 * byteLength - 1)

    checkInt(this, value, offset, byteLength, limit - 1, -limit)
  }

  var i = byteLength - 1
  var mul = 1
  var sub = 0
  this[offset + i] = value & 0xFF
  while (--i >= 0 && (mul *= 0x100)) {
    if (value < 0 && sub === 0 && this[offset + i + 1] !== 0) {
      sub = 1
    }
    this[offset + i] = ((value / mul) >> 0) - sub & 0xFF
  }

  return offset + byteLength
}

Buffer.prototype.writeInt8 = function writeInt8 (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 1, 0x7f, -0x80)
  if (!Buffer.TYPED_ARRAY_SUPPORT) value = Math.floor(value)
  if (value < 0) value = 0xff + value + 1
  this[offset] = (value & 0xff)
  return offset + 1
}

Buffer.prototype.writeInt16LE = function writeInt16LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
  } else {
    objectWriteUInt16(this, value, offset, true)
  }
  return offset + 2
}

Buffer.prototype.writeInt16BE = function writeInt16BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 2, 0x7fff, -0x8000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 8)
    this[offset + 1] = (value & 0xff)
  } else {
    objectWriteUInt16(this, value, offset, false)
  }
  return offset + 2
}

Buffer.prototype.writeInt32LE = function writeInt32LE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value & 0xff)
    this[offset + 1] = (value >>> 8)
    this[offset + 2] = (value >>> 16)
    this[offset + 3] = (value >>> 24)
  } else {
    objectWriteUInt32(this, value, offset, true)
  }
  return offset + 4
}

Buffer.prototype.writeInt32BE = function writeInt32BE (value, offset, noAssert) {
  value = +value
  offset = offset | 0
  if (!noAssert) checkInt(this, value, offset, 4, 0x7fffffff, -0x80000000)
  if (value < 0) value = 0xffffffff + value + 1
  if (Buffer.TYPED_ARRAY_SUPPORT) {
    this[offset] = (value >>> 24)
    this[offset + 1] = (value >>> 16)
    this[offset + 2] = (value >>> 8)
    this[offset + 3] = (value & 0xff)
  } else {
    objectWriteUInt32(this, value, offset, false)
  }
  return offset + 4
}

function checkIEEE754 (buf, value, offset, ext, max, min) {
  if (offset + ext > buf.length) throw new RangeError('Index out of range')
  if (offset < 0) throw new RangeError('Index out of range')
}

function writeFloat (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 4, 3.4028234663852886e+38, -3.4028234663852886e+38)
  }
  ieee754.write(buf, value, offset, littleEndian, 23, 4)
  return offset + 4
}

Buffer.prototype.writeFloatLE = function writeFloatLE (value, offset, noAssert) {
  return writeFloat(this, value, offset, true, noAssert)
}

Buffer.prototype.writeFloatBE = function writeFloatBE (value, offset, noAssert) {
  return writeFloat(this, value, offset, false, noAssert)
}

function writeDouble (buf, value, offset, littleEndian, noAssert) {
  if (!noAssert) {
    checkIEEE754(buf, value, offset, 8, 1.7976931348623157E+308, -1.7976931348623157E+308)
  }
  ieee754.write(buf, value, offset, littleEndian, 52, 8)
  return offset + 8
}

Buffer.prototype.writeDoubleLE = function writeDoubleLE (value, offset, noAssert) {
  return writeDouble(this, value, offset, true, noAssert)
}

Buffer.prototype.writeDoubleBE = function writeDoubleBE (value, offset, noAssert) {
  return writeDouble(this, value, offset, false, noAssert)
}

// copy(targetBuffer, targetStart=0, sourceStart=0, sourceEnd=buffer.length)
Buffer.prototype.copy = function copy (target, targetStart, start, end) {
  if (!start) start = 0
  if (!end && end !== 0) end = this.length
  if (targetStart >= target.length) targetStart = target.length
  if (!targetStart) targetStart = 0
  if (end > 0 && end < start) end = start

  // Copy 0 bytes; we're done
  if (end === start) return 0
  if (target.length === 0 || this.length === 0) return 0

  // Fatal error conditions
  if (targetStart < 0) {
    throw new RangeError('targetStart out of bounds')
  }
  if (start < 0 || start >= this.length) throw new RangeError('sourceStart out of bounds')
  if (end < 0) throw new RangeError('sourceEnd out of bounds')

  // Are we oob?
  if (end > this.length) end = this.length
  if (target.length - targetStart < end - start) {
    end = target.length - targetStart + start
  }

  var len = end - start
  var i

  if (this === target && start < targetStart && targetStart < end) {
    // descending copy from end
    for (i = len - 1; i >= 0; --i) {
      target[i + targetStart] = this[i + start]
    }
  } else if (len < 1000 || !Buffer.TYPED_ARRAY_SUPPORT) {
    // ascending copy from start
    for (i = 0; i < len; ++i) {
      target[i + targetStart] = this[i + start]
    }
  } else {
    Uint8Array.prototype.set.call(
      target,
      this.subarray(start, start + len),
      targetStart
    )
  }

  return len
}

// Usage:
//    buffer.fill(number[, offset[, end]])
//    buffer.fill(buffer[, offset[, end]])
//    buffer.fill(string[, offset[, end]][, encoding])
Buffer.prototype.fill = function fill (val, start, end, encoding) {
  // Handle string cases:
  if (typeof val === 'string') {
    if (typeof start === 'string') {
      encoding = start
      start = 0
      end = this.length
    } else if (typeof end === 'string') {
      encoding = end
      end = this.length
    }
    if (val.length === 1) {
      var code = val.charCodeAt(0)
      if (code < 256) {
        val = code
      }
    }
    if (encoding !== undefined && typeof encoding !== 'string') {
      throw new TypeError('encoding must be a string')
    }
    if (typeof encoding === 'string' && !Buffer.isEncoding(encoding)) {
      throw new TypeError('Unknown encoding: ' + encoding)
    }
  } else if (typeof val === 'number') {
    val = val & 255
  }

  // Invalid ranges are not set to a default, so can range check early.
  if (start < 0 || this.length < start || this.length < end) {
    throw new RangeError('Out of range index')
  }

  if (end <= start) {
    return this
  }

  start = start >>> 0
  end = end === undefined ? this.length : end >>> 0

  if (!val) val = 0

  var i
  if (typeof val === 'number') {
    for (i = start; i < end; ++i) {
      this[i] = val
    }
  } else {
    var bytes = Buffer.isBuffer(val)
      ? val
      : utf8ToBytes(new Buffer(val, encoding).toString())
    var len = bytes.length
    for (i = 0; i < end - start; ++i) {
      this[i + start] = bytes[i % len]
    }
  }

  return this
}

// HELPER FUNCTIONS
// ================

var INVALID_BASE64_RE = /[^+\/0-9A-Za-z-_]/g

function base64clean (str) {
  // Node strips out invalid characters like \n and \t from the string, base64-js does not
  str = stringtrim(str).replace(INVALID_BASE64_RE, '')
  // Node converts strings with length < 2 to ''
  if (str.length < 2) return ''
  // Node allows for non-padded base64 strings (missing trailing ===), base64-js does not
  while (str.length % 4 !== 0) {
    str = str + '='
  }
  return str
}

function stringtrim (str) {
  if (str.trim) return str.trim()
  return str.replace(/^\s+|\s+$/g, '')
}

function toHex (n) {
  if (n < 16) return '0' + n.toString(16)
  return n.toString(16)
}

function utf8ToBytes (string, units) {
  units = units || Infinity
  var codePoint
  var length = string.length
  var leadSurrogate = null
  var bytes = []

  for (var i = 0; i < length; ++i) {
    codePoint = string.charCodeAt(i)

    // is surrogate component
    if (codePoint > 0xD7FF && codePoint < 0xE000) {
      // last char was a lead
      if (!leadSurrogate) {
        // no lead yet
        if (codePoint > 0xDBFF) {
          // unexpected trail
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        } else if (i + 1 === length) {
          // unpaired lead
          if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
          continue
        }

        // valid lead
        leadSurrogate = codePoint

        continue
      }

      // 2 leads in a row
      if (codePoint < 0xDC00) {
        if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
        leadSurrogate = codePoint
        continue
      }

      // valid surrogate pair
      codePoint = (leadSurrogate - 0xD800 << 10 | codePoint - 0xDC00) + 0x10000
    } else if (leadSurrogate) {
      // valid bmp char, but last char was a lead
      if ((units -= 3) > -1) bytes.push(0xEF, 0xBF, 0xBD)
    }

    leadSurrogate = null

    // encode utf8
    if (codePoint < 0x80) {
      if ((units -= 1) < 0) break
      bytes.push(codePoint)
    } else if (codePoint < 0x800) {
      if ((units -= 2) < 0) break
      bytes.push(
        codePoint >> 0x6 | 0xC0,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x10000) {
      if ((units -= 3) < 0) break
      bytes.push(
        codePoint >> 0xC | 0xE0,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else if (codePoint < 0x110000) {
      if ((units -= 4) < 0) break
      bytes.push(
        codePoint >> 0x12 | 0xF0,
        codePoint >> 0xC & 0x3F | 0x80,
        codePoint >> 0x6 & 0x3F | 0x80,
        codePoint & 0x3F | 0x80
      )
    } else {
      throw new Error('Invalid code point')
    }
  }

  return bytes
}

function asciiToBytes (str) {
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    // Node's code seems to be doing this and not & 0x7F..
    byteArray.push(str.charCodeAt(i) & 0xFF)
  }
  return byteArray
}

function utf16leToBytes (str, units) {
  var c, hi, lo
  var byteArray = []
  for (var i = 0; i < str.length; ++i) {
    if ((units -= 2) < 0) break

    c = str.charCodeAt(i)
    hi = c >> 8
    lo = c % 256
    byteArray.push(lo)
    byteArray.push(hi)
  }

  return byteArray
}

function base64ToBytes (str) {
  return base64.toByteArray(base64clean(str))
}

function blitBuffer (src, dst, offset, length) {
  for (var i = 0; i < length; ++i) {
    if ((i + offset >= dst.length) || (i >= src.length)) break
    dst[i + offset] = src[i]
  }
  return i
}

function isnan (val) {
  return val !== val // eslint-disable-line no-self-compare
}

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(42)))

/***/ }),
/* 34 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * metadata.js
 *
 * Parses RUN transaction metadata
 */

const bsv = __webpack_require__(5)
const { _location } = __webpack_require__(8)

// ------------------------------------------------------------------------------------------------
// _extractMetadata
// ------------------------------------------------------------------------------------------------

function _extractMetadata (tx) {
  const { _parseMetadataVersion } = __webpack_require__(15)

  const BAD_PROTOCOL_ERROR = 'Not a RUN transaction: invalid OP_RETURN protocol'
  const BAD_METADATA_ERROR = 'Not a RUN transaction: invalid RUN metadata'

  if (!tx.outputs.length) throw new Error(BAD_PROTOCOL_ERROR)

  let chunks = null
  const base = new bsv.Transaction()

  for (let i = 0; i < tx.outputs.length; i++) {
    chunks = tx.outputs[i].script.chunks

    const badProtocol =
      chunks.length !== 6 ||
      chunks[0].opcodenum !== 0 || // OP_FALSE
      chunks[1].opcodenum !== 106 || // OP_RETURN
      chunks[2].buf.toString() !== 'run'

    if (!badProtocol) {
      break
    } else {
      base.addOutput(tx.outputs[i])
      chunks = null
    }
  }

  if (!chunks) throw new Error(BAD_PROTOCOL_ERROR)

  const version = _parseMetadataVersion(chunks[3].buf.toString('hex'))
  const app = chunks[4].buf ? chunks[4].buf.toString() : ''

  try {
    const json = chunks[5].buf.toString('utf8')
    const metadata = JSON.parse(json)

    const badMetadata =
      Object.keys(metadata).length !== 6 ||
      typeof metadata.in !== 'number' ||
      !Array.isArray(metadata.ref) ||
      !Array.isArray(metadata.out) ||
      !Array.isArray(metadata.del) ||
      !Array.isArray(metadata.cre) ||
      !Array.isArray(metadata.exec) ||
      metadata.ref.some(ref => typeof ref !== 'string') ||
      metadata.out.some(hash => typeof hash !== 'string') ||
      metadata.del.some(hash => typeof hash !== 'string') ||
      metadata.exec.some(hash => typeof hash !== 'object')

    if (badMetadata) throw new Error(BAD_METADATA_ERROR)

    metadata.app = app
    metadata.version = version
    metadata.base = base.toString('hex')
    metadata.vrun = base.outputs.length

    return metadata
  } catch (e) {
    throw new Error(BAD_METADATA_ERROR)
  }
}

// ------------------------------------------------------------------------------------------------
// _extractTxDeps
// ------------------------------------------------------------------------------------------------

function _extractTxDeps (tx) {
  const metadata = _extractMetadata(tx)

  const txids = new Set()

  // Add inputs
  for (let i = 0; i < metadata.in; i++) {
    const txid = tx.inputs[i].prevTxId.toString('hex')
    txids.add(txid)
  }

  // Add refs, including berries
  for (const location of metadata.ref) {
    // Native jigs do not have txids
    if (location.startsWith('native://')) continue

    // Extract the txid of the jig or berry class
    const txid = location.slice(0, 64)
    txids.add(txid)

    // If a berry, extract other txids used to load it from the berry path. This only works for
    // Run 0.6 for fixed berries we support. In Run 0.7, we will include all txids in the location.
    const isBerry = location.includes('?berry=')
    if (isBerry) {
      const loc = _location(location)
      let berryTxid = loc._berry
      if (berryTxid.length > 64) {
        try {
          berryTxid = JSON.parse(loc._berry).txid
        } catch (e) { }
      }
      if (berryTxid.length === 64) {
        txids.add(berryTxid)
      }
    }
  }

  return Array.from(txids)
}

// ------------------------------------------------------------------------------------------------

module.exports = { _extractMetadata, _extractTxDeps }


/***/ }),
/* 35 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * replay.js
 *
 * Replays a transaction and generates a commit with live objects
 */

const bsv = __webpack_require__(5)
const { _text, _Timeout } = __webpack_require__(0)
const { _deterministicJSONStringify } = __webpack_require__(17)
const Log = __webpack_require__(2)
const _load = __webpack_require__(16)
const Record = __webpack_require__(10)
const { _unifyForReplay, _deunifyForReplay, _setUnifyForMethodEnabled } = __webpack_require__(32)
const { _sudo } = __webpack_require__(4)
const Json = __webpack_require__(23)
const Sandbox = __webpack_require__(6)
const {
  _createMasterList, _finalizeOwnersAndSatoshis, _captureStates, _hashStates, _generateOutputScripts,
  _createExec, _createMetadata, _createPartialTx, _finalizeLocationsAndOrigins, _cacheStates
} = __webpack_require__(20)
const CreationSet = __webpack_require__(25)
const { TrustError, ExecutionError } = __webpack_require__(11)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Replay'

// ------------------------------------------------------------------------------------------------
// _Preverify
// ------------------------------------------------------------------------------------------------

class _Preverify {
  constructor (record, states) { this._record = record; this._states = states }
  _output (n) { return this._states.get(this._record._outputs._arr()[n]) }
  _delete (n) { return this._states.get(this._record._deletes._arr()[n]) }
}

// ------------------------------------------------------------------------------------------------
// _replay
// ------------------------------------------------------------------------------------------------

/**
 * Creates a record by replaying a transaction. The returned record must be published
 */
async function _replay (tx, txid, metadata, kernel, published, jigToSync, timeout, preverify) {
  const _execute = __webpack_require__(65)

  if (Log._infoOn) Log._info(TAG, 'Replay', txid)

  const start = new Date()

  timeout = timeout || new _Timeout('replay', kernel._timeout, txid)
  timeout._check()

  // Check that the code is trusted to load
  const anythingToTrust = !preverify &&
    (metadata.exec.some(action => action.op === 'DEPLOY') ||
    metadata.exec.some(action => action.op === 'UPGRADE'))

  if (anythingToTrust) {
    if (!(await kernel._trusted(txid, 'replay'))) throw new TrustError(txid, 'replay')
  }

  let inputs = []
  let refs = []

  // Share a load session for replays and cache loads
  const session = new _load._Session()

  // Load inputs
  for (let vin = 0; vin < metadata.in; vin++) {
    const input = tx.inputs[vin]
    if (!input) throw new Error(`Jig input missing for _i${vin}`)
    const txid = input.prevTxId.toString('hex')
    const vout = input.outputIndex
    const location = `${txid}_o${vout}`
    const promise = _load(location, undefined, kernel, session, timeout)
    inputs.push(promise)
  }

  // Load refs
  for (let vref = 0; vref < metadata.ref.length; vref++) {
    const location = metadata.ref[vref]
    const promise = _load(location, undefined, kernel, session, timeout)
    refs.push(promise)
  }

  // Wait for all inputs and ref loads to complete
  inputs = await Promise.all(inputs)
  refs = await Promise.all(refs)

  // Make sure the jig to sync exists
  if (jigToSync) {
    if (!inputs.some(x => x.location === jigToSync.location)) {
      throw new Error(`${_text(jigToSync)} not found in the transaction\n\ntxid: ${txid}\njig: ${jigToSync.location}`)
    }
  }

  // Create a new record to replay
  const record = new Record()

  // We will manually commit and then verify the record
  record._replaying = true
  record._autopublish = false

  // Save the current record to replace back after we finish executing this replay
  const savedRecord = Record._CURRENT_RECORD

  // Disable method unification because we already unified everything
  _setUnifyForMethodEnabled(false)

  // Set the backing limit to a max value, overriding user value, to make it a soft cap and keep consensus
  const oldBackingLimit = kernel._backingLimit
  kernel._backingLimit = Number.MAX_SAFE_INTEGER

  let refmap = null
  let deunifyMap = null

  // Replay the actions, creating a record
  try {
    // Update the references for each incoming jig with other incoming jigs
    // Also build the refmap. This is faster than building it during capture states.
    const unifyResult = _unifyForReplay(inputs, refs, jigToSync)
    refmap = unifyResult._refmap
    deunifyMap = unifyResult._deunifyMap

    // Replace the input with the jig to sync
    if (jigToSync) {
      inputs[inputs.findIndex(x => x.location === jigToSync.location)] = jigToSync
    }

    // Add the incoming jigs to the record.
    // We add inputs to UPDATE instead of AUTH to ensure they are ordered first in the commit.
    inputs.forEach(jig => record._update(jig))
    refs.forEach(jig => record._read(jig))

    // Replace the current record with ours while we execute actions
    Record._CURRENT_RECORD = record

    // Execute each action
    for (const entry of metadata.exec) {
      const { op, data } = entry

      if (Object.keys(entry).length !== 2) throw new Error('Invalid exec')
      if (typeof op !== 'string') throw new Error(`Invalid op: ${op}`)
      if (typeof data !== 'object' || !data) throw new Error(`Invalid data: ${data}`)

      const masterSet = new CreationSet()
      for (const x of inputs) { masterSet._add(x) }
      for (const x of refs) { masterSet._add(x) }
      for (const x of record._creates) { masterSet._add(x) }
      const masterList = masterSet._arr()

      _execute(op, data, masterList)
    }
  } catch (e) {
    // Probably not needed, but roll back the current record anyway
    record._rollback(e)

    throw new ExecutionError(e.message)
  } finally {
    // Restore the previous record
    Record._CURRENT_RECORD = savedRecord

    // Reset back the max backed satoshis
    kernel._backingLimit = oldBackingLimit

    // Re-enable method unification
    _setUnifyForMethodEnabled(true)
  }

  // Save the commit to make sure it's deactivated at the end
  let commit = null

  // Capture the states after verify
  let states = null

  // Convert the record a commit and verify it
  try {
    // Create a commit
    commit = record._commit()
    if (!commit) throw new Error('Invalid metadata: no commit generated')

    // Apply the app and version to the record
    commit._app = metadata.app
    commit._version = metadata.version
    commit._base = new bsv.Transaction(metadata.base)

    // Apply the refmap we already generated
    commit._refmap = refmap

    // Verify the commit
    states = await verify(commit, tx, txid, metadata, timeout, preverify)
  } catch (e) {
    throw new ExecutionError(e.message)
  }

  if (published) {
    // Finalize jig bindings
    _finalizeLocationsAndOrigins(commit, txid)

    // Add the state to the cache
    await _cacheStates(commit, states, txid)
    timeout._check()
  }

  // Note: We don't emit jig events because we haven't checked if jigs are unspent.

  // Before returning deunify so that we get the same references whether
  // loading from cache or via replay
  _deunifyForReplay(deunifyMap)

  if (Log._debugOn) Log._debug(TAG, 'Replay (end): ' + (new Date() - start) + 'ms')

  // Return the commit to be used. Its record may even be analyzed.
  return commit
}

// ------------------------------------------------------------------------------------------------
// verify
// ------------------------------------------------------------------------------------------------

async function verify (commit, tx, txid, txmetadata, timeout, preverify) {
  if (Log._debugOn) Log._debug(TAG, 'Verify', txid)

  const start = new Date()
  const record = commit._record

  // Create the sorted master list used to serialize actions
  const masterList = _createMasterList(record)

  // Assign initial owners for new creates from the tx metadata
  _assignOwnersFromMetadata(commit, txmetadata, masterList)

  // Generate the output scripts, adding refs as needed
  const outputScripts = await _generateOutputScripts(commit)

  // Make owner and satoshis bound
  _finalizeOwnersAndSatoshis(commit)

  // Calculate the serialized states of output and deleted jigs
  const states = await _captureStates(commit, timeout)
  timeout._check()

  // Calculate state hashes
  const hashes = await _hashStates(commit, states)

  // Convert the actions to executable statements
  const exec = _createExec(record, masterList)

  // Create the OP_RETURN metadata json
  const metadata = _createMetadata(commit, hashes, exec, masterList)

  // Create the unpaid and unsigned tx. Use 0 dust, because we don't really care what the dust
  // used in the original transaction was, as long as the satoshis outputted meet a minimum.
  // The dust is a calculation of the minimum relay fee.
  const feePerKb = 0
  const partialtx = _createPartialTx(commit, metadata, outputScripts, feePerKb)

  // Compare metadata. Key order does not matter in the metadata.
  if (_deterministicJSONStringify(metadata) !== _deterministicJSONStringify(txmetadata)) {
    _throwMetadataMismatchError(txmetadata, metadata, record, states, preverify)
  }

  // Compare inputs
  for (let i = 0; i < metadata.in; i++) {
    const txin1 = tx.inputs[i]
    const txin2 = partialtx.inputs[i]
    const prevtxid1 = txin1.prevTxId.toString('hex')
    const prevtxid2 = txin2.prevTxId.toString('hex')
    if (prevtxid1 !== prevtxid2) throw new Error(`Txid mismatch on input ${i}`)
    if (txin1.outputIndex !== txin2.outputIndex) throw new Error(`Vout mismatch on input ${i}`)
  }

  // Compare outputs
  for (let i = 0; i < metadata.out.length; i++) {
    const txout1 = tx.outputs[i + metadata.vrun + 1]
    const txout2 = partialtx.outputs[i + metadata.vrun + 1]
    if (!txout1) throw new Error(`Jig output missing for _o${i + metadata.vrun + 1}`)
    const script1 = txout1.script.toString('hex')
    const script2 = txout2.script.toString('hex')
    if (script1 !== script2) throw new Error(`Script mismatch on output ${i + metadata.vrun + 1}`)
    if (txout1.satoshis < txout2.satoshis) {
      const hint = `Hint: Transaction has ${txout1.satoshis} but expected ${txout2.satoshis}`
      throw new Error(`Satoshis mismatch on output ${i + metadata.vrun + 1}\n\n${hint}`)
    }
  }

  if (Log._debugOn) Log._debug(TAG, 'Verify (end): ' + (new Date() - start) + 'ms')

  return states
}

// ------------------------------------------------------------------------------------------------

function _throwMetadataMismatchError (expected, actual, record, states, preverify) {
  if (Log._errorOn) Log._error(TAG, 'Expected metadata:', JSON.stringify(expected, 0, 3))
  if (Log._errorOn) Log._error(TAG, 'Actual metadata:', JSON.stringify(actual, 0, 3))

  // The most common error is state hash mismatches, and these are the hardest to debug.
  // Print debugging information in these cases if we know this is the cause.
  function logBadState (expectedHash, actualHash, jig, preverifyState) {
    if (expectedHash === actualHash) return

    const state = states.get(jig)

    // If we caught this during pre-verify, then we have the before state and should print it.
    // Otherwise, just print the current state in hopes that it might show an obvious error.
    if (preverifyState) {
      Log._error(TAG, 'Expected state:', JSON.stringify(preverifyState, 0, 3))
      Log._error(TAG, 'Actual state:', JSON.stringify(state, 0, 3))
    } else {
      Log._error(TAG, 'State mismatch:', JSON.stringify(state, 0, 3))
    }
  }

  if (Log._errorOn) {
    // Log differences in outputs if any
    if (expected.out.length === actual.out.length) {
      expected.out.forEach((expectedHash, n) => {
        logBadState(expectedHash, actual.out[n], record._outputs._arr()[n], preverify && preverify._output(n))
      })
    } else {
      Log._error(TAG, `Expected ${expected.out.length} outputs but actual was ${actual.out.length}`)
    }

    // Log differences in deletes if any
    if (expected.del.length === actual.del.length) {
      expected.del.forEach((expectedHash, n) => {
        logBadState(expectedHash, actual.del[n], record._deletes._arr()[n], preverify && preverify._delete(n))
      })
    } else {
      Log._error(TAG, `Expected ${expected.del.length} deletes but actual was ${actual.del.length}`)
    }
  }

  throw new Error('Metadata mismatch\n\nHint: See logs')
}

// ------------------------------------------------------------------------------------------------

function _assignOwnersFromMetadata (commit, txmetadata, masterList) {
  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (n) => masterList[n]
  }

  // Inflate the owners
  const owners = txmetadata.cre.map(lock => Json._decode(lock, decodeOptions))

  // Check that the owners list length matches the number of creates
  if (commit._record._creates._size !== txmetadata.cre.length) throw new Error('Invalid number of cre entries')

  // Assign the owners to the new creates and after state
  for (let i = 0; i < owners.length; i++) {
    const owner = owners[i]
    const jig = commit._record._creates._arr()[i]
    const state = commit._after.get(jig)

    _sudo(() => { jig.owner = owner })
    state._props.owner = owner
  }
}

// ------------------------------------------------------------------------------------------------

_replay._Preverify = _Preverify

module.exports = _replay


/***/ }),
/* 36 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * snapshot.js
 *
 * A savepoint for a jig, code, or berry so that it can be rolled back if necessary
 * or evolve in a parallel update in the case of a read.
 *
 * This is not the same as the state, because snapshots are of live creations, but
 * snapshots can be converted into states.
 *
 * Snapshots can be created in bindingsOnly mode, which will only save location,
 * owner, etc. and not all deep properties, or they can capture a creation completely.
 * bindingsOnly mode is an optimization when we are only reading a jig and don't need
 * to worry about a rollback but still want to capture its identifying information.
 * bindingsOnly mode may also be used if rollbacks are disabled in the kernel.
 */

const { _text, _setOwnProperty } = __webpack_require__(0)
const { _deepClone } = __webpack_require__(14)
const { _sudo } = __webpack_require__(4)
const { _UNDEPLOYED_LOCATION, _compileLocation } = __webpack_require__(8)
const SI = __webpack_require__(6)._intrinsics
const Log = __webpack_require__(2)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Snapshot'

// ------------------------------------------------------------------------------------------------
// Snapshot
// ------------------------------------------------------------------------------------------------

class Snapshot {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  /**
   * Creates a savepoint for a creation
   * @param {Creation} creation Jig, code or berry to save
   * @param {boolean} bindingsOnly Whether to only capture location and other bindings and not all state
   * @param {boolean} disableRollback Whether the snapshot will not be rolled back
   */
  constructor (creation, bindingsOnly, disableRollback) {
    if (Log._debugOn) Log._debug(TAG, 'Snapshot', _text(creation), bindingsOnly ? '(bindings only)' : '')

    this._creation = creation
    this._bindingsOnly = bindingsOnly
    this._rollbackEnabled = !disableRollback

    // If we are only capturing bindings, get them an return
    if (bindingsOnly) {
      const props = this._props = {}
      _sudo(() => {
        props.location = creation.location
        props.origin = creation.origin
        props.nonce = creation.nonce
        props.owner = _deepClone(creation.owner, SI)
        props.satoshis = creation.satoshis
      })
      return
    }

    // Otherwise, capture all properties
    this._captureCompletely()
  }

  // --------------------------------------------------------------------------
  // _captureCompletely
  // --------------------------------------------------------------------------

  /**
   * Capture all states for a jig. This is used if we had previously only captured bindings.
   */
  _captureCompletely () {
    const creation = this._creation

    this._bindingsOnly = false
    this._rollbackEnabled = true

    // Lazy dependencies for linking reasons
    const Jig = __webpack_require__(7)
    const Code = __webpack_require__(1)
    const Berry = __webpack_require__(13)
    const Editor = __webpack_require__(9)

    // Get the creation type
    if (creation instanceof Jig) {
      this._kind = 'jig'
    } else if (creation instanceof Code) {
      this._kind = Editor._get(creation)._native ? 'native' : 'code'
    } else if (creation instanceof Berry) {
      this._kind = 'berry'
    } else {
      throw new Error(`Not a creation: ${_text(creation)}`)
    }

    // Save the properties of the creation
    _sudo(() => {
      const props = Object.assign({}, creation)
      const clonedProps = _deepClone(props, SI)
      this._props = clonedProps
    })

    // Save the class
    if (this._kind === 'jig' || this._kind === 'berry') {
      this._cls = _sudo(() => creation.constructor)
    }

    // Save the source code and inner type
    if (this._kind === 'code') {
      const editor = Editor._get(creation)
      this._src = editor._src
      this._savepoint = editor._save()
    }
  }

  // --------------------------------------------------------------------------
  // _rollback
  // --------------------------------------------------------------------------

  /**
   * Reverts the creation to the snapshot point if _rollbackEnabled is true
   * @param {?Error} e The error that caused the rollback if available
   */
  _rollback (e) {
    // Native code cannot be rolled back
    if (this._kind === 'native') return

    // If the snapshot is not for rolling back, skip
    if (!this._rollbackEnabled) return

    return _sudo(() => {
      // If we are only storing bindings, then we go into an error state
      if (this._bindingsOnly) {
        if (e) {
          const errorLocation = _compileLocation({ _error: `A previous error occurred\n\n${e}` })
          _setOwnProperty(this._creation, 'location', errorLocation)
        } else {
          _setOwnProperty(this._creation, 'location', _UNDEPLOYED_LOCATION)
        }
        return
      }

      // Restore the code for the class
      if (this._kind === 'code') {
        const Editor = __webpack_require__(9)
        const editor = Editor._get(this._creation)
        editor._restore(this._savepoint)
      }

      // Delete each existing owned property
      Object.keys(this._creation).forEach(key => { delete this._creation[key] })

      // Assign each new property as an owned property. Owned is important.
      Object.keys(this._props).forEach(key => {
        _setOwnProperty(this._creation, key, this._props[key])
      })

      // For undeployed creations, a rollback is unrecoverable. Code can be redeployed.
      if (e) {
        const Jig = __webpack_require__(7)
        const Code = __webpack_require__(1)

        if ((this._creation instanceof Jig || this._creation instanceof Code) &&
          this._props.location === _UNDEPLOYED_LOCATION) {
          const errorLocation = _compileLocation({ _error: `Deploy failed\n\n${e}` })
          _setOwnProperty(this._creation, 'origin', errorLocation)
          _setOwnProperty(this._creation, 'location', errorLocation)
        }
      }
    })
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Snapshot


/***/ }),
/* 37 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * Commit.js
 *
 * A record that has been locked in and may be published or exported
 */

const bsv = __webpack_require__(5)
const { _assert, _defined } = __webpack_require__(0)
const { _sudo } = __webpack_require__(4)
const { _deepVisit } = __webpack_require__(14)
const { _BINDINGS, _compileLocation } = __webpack_require__(8)
const Snapshot = __webpack_require__(36)
const Log = __webpack_require__(2)
const _publish = __webpack_require__(20)
const { _PROTOCOL_VERSION } = __webpack_require__(15)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Commit'

// All commits being published. This is tracked globally so we can look up commits.
const COMMITS_PUBLISHING = new Map() // ID -> Commit

// ------------------------------------------------------------------------------------------------
// Commit
// ------------------------------------------------------------------------------------------------

class Commit {
  /**
   * Creates a new commit from a record and starts publishing it
   */
  constructor (record) {
    if (Log._debugOn) Log._debug(TAG, 'Create', record._id)

    // Store the record that has all of the changes in this commit
    _assert(record._actions.length)
    _assert(record._inputs._size || record._outputs._size || record._deletes._size)
    this._record = record

    // Save the kernel used to publish this commit
    this._kernel = record._kernel

    // Lock in the app and protocol version for this commit
    this._app = this._kernel._app
    this._version = _PROTOCOL_VERSION

    // Set the base transaction
    this._base = new bsv.Transaction()

    // Commits that depend on us
    this._downstream = []

    // Create the after snapshots
    this._after = new Map()
    this._generateAfterStates()

    // No refmap to start
    this._refmap = null

    // Set of listeners when the commit has no more dependencies (ready),
    // and also when the tx is broadcast or fails to broadcast (publish).
    this._readyListeners = []
    this._publishListeners = []

    // State of publishing
    this._published = false

    // Publish when ready
    if (this._record._autopublish) {
      this._setPublishing(true)
      this._onReady().then(() => _publish(this))
    }

    // Notify outputs and deletes
    if (!this._record._replaying) {
      this._record._outputs._forEach(creation => this._kernel._emit('update', creation))
      this._record._deletes._forEach(creation => this._kernel._emit('update', creation))
    }

    // States and state hashes
    this.states = null
    this.stateHashes = null
  }

  // --------------------------------------------------------------------------

  _generateAfterStates () {
    const generateAfterState = creation => {
      if (!this._after.has(creation)) {
        const snapshot = new Snapshot(creation)
        this._after.set(creation, snapshot)
      }
    }

    this._record._outputs._forEach(creation => generateAfterState(creation))
    this._record._deletes._forEach(creation => generateAfterState(creation))
  }

  // --------------------------------------------------------------------------

  _setPublishing (publishing) {
    if (publishing) {
      _assert(!this._published)
      _assert(!COMMITS_PUBLISHING.has(this._record._id))

      COMMITS_PUBLISHING.set(this._record._id, this)
    } else {
      COMMITS_PUBLISHING.delete(this._record._id)

      // We should have notified all publish listeners and downstream commits by now
      _assert(!this._publishListeners.length)
      _assert(!this._downstream.length)
    }
  }

  // --------------------------------------------------------------------------

  _publishing () {
    return COMMITS_PUBLISHING.has(this._record._id)
  }

  // --------------------------------------------------------------------------

  async _onReady () {
    const record = this._record

    // First, filter out commits already published
    record._upstream = record._upstream.filter(commit => !commit._published)

    // If no more, then return
    if (!record._upstream.length) return

    // Hook up this commit to its unpublished upstream commits
    record._upstream
      .filter(commit => !commit._downstream.includes(this))
      .forEach(commit => commit._downstream.push(this))

    // Wait for upstream to finish
    await new Promise((resolve, reject) => this._readyListeners.push({ resolve, reject }))
  }

  // --------------------------------------------------------------------------

  async _onPublish () {
    _assert(this._publishing())
    await new Promise((resolve, reject) => this._publishListeners.push({ resolve, reject }))
  }

  // --------------------------------------------------------------------------

  /**
   * Notification when an upstream commit is published to start publishing this one.
   */
  _onUpstreamPublished (commit) {
    const record = this._record

    // Update our various local state with the newly published bindings
    for (const [creation, prevafter] of commit._after) {
      const ours = record._inputs._get(creation) || record._refs._get(creation)
      if (!ours) continue

      // Update the before snapshots with new bindings
      const before = record._before.get(ours)
      if (before) _BINDINGS.forEach(binding => { before._props[binding] = prevafter._props[binding] })

      // Update the after states with assigned bindings
      const after = this._after.get(ours)
      if (after) {
        const props = after._props
        after._props.origin = prevafter._props.origin
        if (!_defined(props.owner)) props.owner = prevafter._props.owner
        if (!_defined(props.satoshis)) props.satoshis = prevafter._props.satoshis
      }

      // Update the jig with assigned bindings. Location and nonce not required.
      _sudo(() => {
        ours.origin = prevafter._props.origin
        if (!_defined(ours.owner)) ours.owner = prevafter._props.owner
        if (!_defined(ours.satoshis)) ours.satoshis = prevafter._props.satoshis
      })
    }

    // Filter out this published commit from our upstream set
    record._upstream = record._upstream.filter(c => c !== commit)

    // If there are no more upstream commits, then fire the ready listener
    if (!record._upstream.length) {
      this._readyListeners.forEach(s => s.resolve())
      this._readyListeners = []
    }
  }

  // --------------------------------------------------------------------------

  /**
   * Returns whether the creation is an input in a downstream commit
   */
  _spentDownstream (creation) {
    return this._downstream.some(commit => commit._record._inputs._has(creation))
  }

  // --------------------------------------------------------------------------

  async _buildRefmap (timeout) {
    if (this._refmap) return this._refmap

    // Get the creations as they will be loaded by a future replay
    const _load = __webpack_require__(16)
    const session = new _load._Session()
    const record = this._record
    const incoming = record._inputs._arr().concat(record._refs._arr())
    const beforeLocations = incoming.map(creation => record._before.get(creation)._props.location)
    const beforeCreations = await Promise.all(beforeLocations.map(location =>
      _load(location, undefined, this._kernel, session, timeout)))

    // Generate the refmap from those input creations
    this._refmap = Commit._buildRefmapForIncoming(beforeCreations, timeout)
    return this._refmap
  }

  // --------------------------------------------------------------------------

  static async _buildRefmapForIncoming (incoming, timeout) {
    if (Log._debugOn) Log._debug(TAG, 'Build refmap')

    const Creation = __webpack_require__(3)
    const refmap = {}

    // Map all inner origins to locations
    _sudo(() => _deepVisit(incoming, x => {
      if (x instanceof Creation) {
        _sudo(() => {
          if (!(x.origin in refmap) || refmap[x.origin][1] <= x.nonce) {
            refmap[x.origin] = [x.location, x.nonce]
          }
        })

        // Don't traverse deeply. Deep references are not part of a creation's state.
        // They should not contribute towards the refmap used to capture state nor
        // to the unification with other creations.
        return incoming.includes(x)
      }
    }))

    return refmap
  }

  // --------------------------------------------------------------------------

  /**
   * Called by the publisher on success
   */
  _onPublishSucceed () {
    // Mark published
    this._published = true

    // Notify listeners
    this._publishListeners.forEach(s => s.resolve())
    this._publishListeners = []

    // Notify downstream commits to start publishing
    this._downstream.forEach(commit => commit._onUpstreamPublished(this))

    // Emit publish events
    const emitPublishEvent = creation => {
      if (!this._spentDownstream(creation)) {
        this._kernel._emit('publish', creation)
      }
    }
    this._record._outputs._forEach(creation => emitPublishEvent(creation))
    this._record._deletes._forEach(creation => emitPublishEvent(creation))

    // Clear our downstream
    this._downstream = []

    // Mark not publishing anymore
    this._setPublishing(false)
  }

  // --------------------------------------------------------------------------

  /**
   * Called by the publisher on error
   */
  _onPublishFail (e) {
    _assert(e)

    const record = this._record

    // Mark not published
    this._published = false

    // Notify downstream commits, which will roll them back
    this._downstream.forEach(commit => commit._onPublishFail(e))
    this._downstream = []

    const unhandled = e && this._publishListeners.length === 0

    if (Log._errorOn) Log._error(TAG, unhandled ? 'Unhandled' : '', e)

    // Rollback the creations
    this._record._rollback(e)

    // If unhandled, all outputs and deleted have the error
    if (unhandled) {
      const errorLocation = _compileLocation({ _error: `Unhandled ${e}` })

      _sudo(() => {
        record._outputs._forEach(creation => { creation.location = errorLocation })
        record._deletes._forEach(creation => { creation.location = errorLocation })
      })
    }

    // Notify of the rollback
    if (!record._replaying) {
      record._outputs._forEach(creation => this._kernel._emit('update', creation))
      record._deletes._forEach(creation => this._kernel._emit('update', creation))
    }

    // Notify sync listeners of the failure if it is a failure
    if (e) {
      this._publishListeners.forEach(listener => listener.reject(e))
      this._publishListeners = []
    }

    // Mark not publishing anymore
    this._setPublishing(false)
  }
}

// ------------------------------------------------------------------------------------------------
// _get
// ------------------------------------------------------------------------------------------------

/**
 * Looks up a commit being published from its commit id
 */
Commit._findPublishing = id => {
  return COMMITS_PUBLISHING.get(id)
}

// ------------------------------------------------------------------------------------------------
// _sync
// ------------------------------------------------------------------------------------------------

/**
 * Waits for all current commits to finish publishing
 */
Commit._syncAll = async () => {
  const promises = []
  for (const commit of COMMITS_PUBLISHING.values()) {
    promises.push(commit._onPublish())
  }
  return Promise.all(promises)
}

// ------------------------------------------------------------------------------------------------

module.exports = Commit


/***/ }),
/* 38 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * cache-wrapper.js
 *
 * Wraps a Run Cache implementation to add common functionality:
 *
 *    - Logging calls
 *    - Logging performance
 *    - Validating arguments and responses
 *    - Ensuring immutable entries don't change
 *    - Updating the config://code-filter key
 *
 * To use, either wrap a cache instance:
 *
 *    new CacheWrapper(myCache)
 *
 * or extend your class from it:
 *
 *    class MyCache extends CacheWrapper { ... }
 */

const Log = __webpack_require__(2)
const StateFilter = __webpack_require__(28)
const { _deepEqual } = __webpack_require__(14)
const { _text, _basicObject, _basicArray } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const IMMUTABLE_KEYS = ['jig', 'berry', 'tx']

// ------------------------------------------------------------------------------------------------
// CacheWrapper
// ------------------------------------------------------------------------------------------------

class CacheWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (cache = this) {
    this.tag = cache.constructor.name === 'Object' ? 'Cache' : cache.constructor.name

    this.unwrappedCache = cache
    this.unwrappedGet = cache.get
    this.unwrappedSet = cache.set

    this.setWrappingEnabled(true)
  }

  // --------------------------------------------------------------------------
  // setWrappingEnabled
  // --------------------------------------------------------------------------

  setWrappingEnabled (enabled) {
    if (enabled) {
      this.get = CacheWrapper.prototype.wrappedGet
      this.set = CacheWrapper.prototype.wrappedSet
    } else {
      this.get = this.unwrappedGet
      this.set = this.unwrappedSet
    }
  }

  // --------------------------------------------------------------------------
  // wrappedGet
  // --------------------------------------------------------------------------

  async wrappedGet (key) {
    // Check the key is valid
    if (typeof key !== 'string' || !key.length) throw new Error(`Invalid key: ${_text(key)}`)

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Get', key)
    const start = new Date()
    const value = await this.unwrappedGet.call(this.unwrappedCache, key)
    if (Log._debugOn) Log._debug(this.tag, 'Get (end): ' + (new Date() - start) + 'ms')
    if (Log._debugOn) Log._debug(this.tag, 'Value:', JSON.stringify(value, 0, 3))

    // Check the response
    if (typeof value !== 'undefined' && !_isJson(value)) throw new Error(`Invalid value retrieved for ${key}: ${value}`)

    return value
  }

  // ------------------------------------------------------------------------
  // wrappedSet
  // ------------------------------------------------------------------------

  async wrappedSet (key, value) {
    // Check the key is valid
    if (typeof key !== 'string' || !key.length) throw new Error(`Invalid key: ${_text(key)}`)

    // Check the value is JSON
    if (!_isJson(value)) throw new Error(`Cannot cache ${_text(value)}`)

    // If we are overwriting an immutable previous value, check that the values are the same.
    const immutable = IMMUTABLE_KEYS.includes(key.split('://')[0])
    if (immutable) {
      const previousValue = await this.unwrappedGet.call(this.unwrappedCache, key)
      if (typeof previousValue !== 'undefined' && !_deepEqual(value, previousValue)) {
        if (Log._errorOn) Log._error(this.tag, 'Expected:', JSON.stringify(previousValue, 0, 3))
        if (Log._errorOn) Log._error(this.tag, 'Actual:', JSON.stringify(value, 0, 3))

        const hint = 'This is an internal Run bug. Please report it to the library developers.'
        throw new Error(`Attempt to set different values for the same key: ${key}\n\n${hint}`)
      }
    }

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Set', key)
    if (Log._debugOn) Log._debug(this.tag, 'Value:', JSON.stringify(value, 0, 3))
    const start = new Date()
    const ret = await this.unwrappedSet.call(this.unwrappedCache, key, value)
    if (Log._debugOn) Log._debug(this.tag, 'Set (end): ' + (new Date() - start) + 'ms')

    // Update the code filter
    if (key.startsWith('jig://') && value.kind === 'code') {
      const filter = await this.unwrappedGet.call(this.unwrappedCache, 'config://code-filter') || StateFilter.create()
      StateFilter.add(filter, key)
      await this.unwrappedSet.call(this.unwrappedCache, 'config://code-filter', filter)
    }

    return ret
  }
}

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

function _isJson (x) {
  switch (typeof x) {
    case 'undefined': return false
    case 'boolean': return true
    case 'number': return Number.isFinite(x)
    case 'string': return true
    case 'object': {
      if (x === null) return true
      if (_basicObject(x)) return !Object.keys(x).some(key => !_isJson(x[key]))
      if (_basicArray(x)) return x.length === Object.keys(x).length && !Object.keys(x).some(key => !_isJson(x[key]))
      return false
    }
    case 'function': return false
    case 'symbol': return false
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = CacheWrapper


/***/ }),
/* 39 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * local-cache.js
 *
 * In-memory implementation of the Cache API
 */

const Log = __webpack_require__(2)
const { _text, _limit } = __webpack_require__(0)
const StateFilter = __webpack_require__(28)
const CacheWrapper = __webpack_require__(38)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'LocalCache'

// ------------------------------------------------------------------------------------------------
// LocalCache
// ------------------------------------------------------------------------------------------------

/**
 * Default implementation of the Cache API that caches data in memory in a 10MB LRU cache
 */
class LocalCache extends CacheWrapper {
  constructor (options = {}) {
    super()

    this._map = new Map()
    this._sizeBytes = 0
    this._maxSizeBytes = parseMaxSizeMB(options.maxSizeMB) * 1000 * 1000
  }

  // --------------------------------------------------------------------------

  get maxSizeMB () {
    return this._maxSizeBytes / 1000 / 1000
  }

  // --------------------------------------------------------------------------

  set maxSizeMB (value) {
    this._maxSizeBytes = parseMaxSizeMB(value) * 1000 * 1000
    this._reduceToFit()
  }

  get sizeBytes () { return this._sizeBytes }

  // --------------------------------------------------------------------------

  async get (key) {
    const had = this._map.has(key)
    const value = this._map.get(key)

    if (had) {
      // Bump the entry to the top
      this._map.delete(key)
      this._map.set(key, value)

      return value
    }
  }

  // --------------------------------------------------------------------------

  async set (key, value) {
    const had = this._map.has(key)

    // Bump the entry to the top, or set the new value
    this._map.delete(key)
    this._map.set(key, value)

    if (had) return

    this._sizeBytes += LocalCache._estimateSize(key)
    this._sizeBytes += LocalCache._estimateSize(value)

    this._reduceToFit()
  }

  // --------------------------------------------------------------------------

  clear () {
    if (Log._debugOn) Log._debug(TAG, 'Clear')

    this._map.clear()
    this._sizeBytes = 0
  }

  // --------------------------------------------------------------------------

  _reduceToFit () {
    if (this._sizeBytes <= _limit(this._maxSizeBytes)) return

    // Move certain keys to the front to preserve them if possible
    this._moveToFront('config://code-filter')
    this._moveToFront('config://recent-broadcasts')

    while (this._sizeBytes > _limit(this._maxSizeBytes)) {
      const oldestKey = this._map.keys().next().value
      const oldestValue = this._map.get(oldestKey)

      // Update the code filter
      if (oldestKey.startsWith('jig://') && oldestValue.kind === 'code') {
        const filter = this._map.get('config://code-filter')
        if (filter) {
          // Size does not change when we just remove an item
          StateFilter.remove(filter, oldestKey)
          this._map.set('config://code-filter', filter)
        }
      }

      this._map.delete(oldestKey)
      this._sizeBytes -= LocalCache._estimateSize(oldestKey)
      this._sizeBytes -= LocalCache._estimateSize(oldestValue)
    }
  }

  // --------------------------------------------------------------------------

  static _estimateSize (value) {
    // Assumes only JSON-serializable values
    // Assume each property has a 1 byte type field, and pointers are 4 bytes
    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Data_structures
    switch (typeof value) {
      case 'undefined': throw new Error('Cannot cache undefined')
      case 'boolean': return 5
      case 'number':
        if (Number.isFinite(value)) return 9
        throw new Error(`Cannot cache number: ${_text(value)}`)
      case 'string': return value.length * 2 + 1
      case 'object': {
        if (!value) return 5
        const keys = Object.keys(value)
        let size = 1 + keys.length * 4
        keys.forEach(key => {
          size += LocalCache._estimateSize(key)
          size += LocalCache._estimateSize(value[key])
        })
        return size
      }
      case 'function': throw new Error(`Cannot cache function: ${_text(value)}`)
      case 'symbol': throw new Error(`Cannot cache symbol: ${_text(value)}`)
    }
  }

  // --------------------------------------------------------------------------

  _moveToFront (key) {
    const value = this._map.get(key)
    if (typeof value !== 'undefined') {
      this._map.delete(key)
      this._map.set(key, value)
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function parseMaxSizeMB (maxSizeMB) {
  if (typeof maxSizeMB === 'undefined') return 10
  if (typeof maxSizeMB === 'number' && !Number.isNaN(maxSizeMB) && maxSizeMB >= 0) return maxSizeMB
  throw new Error(`Invalid maxSizeMB: ${_text(maxSizeMB)}`)
}

// ------------------------------------------------------------------------------------------------

module.exports = LocalCache


/***/ }),
/* 40 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * state-wrapper.js
 *
 * Base class for a State implementation that adds the following functionality:
 *
 *    - Log calls
 *    - Log performance in debug mode
 *    - Verify the API responses
 *    - Allows paying without providing parents
 *    - Cache state locally
 *    - Query the local cache before making a server call
 *
 * This allows the implementation to just focus on making API calls.
 */

const bsv = __webpack_require__(5)
const { _text } = __webpack_require__(0)
const Log = __webpack_require__(2)
const StateFilter = __webpack_require__(28)
const LocalCache = __webpack_require__(39)

// ------------------------------------------------------------------------------------------------
// StateWrapper
// ------------------------------------------------------------------------------------------------

class StateWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (state = this, cache = new LocalCache()) {
    this.tag = state.constructor.name === 'Object' ? 'State' : state.constructor.name

    this.cache = cache

    this.unwrappedState = state
    this.unwrappedPull = state.pull
    this.unwrappedBroadcast = state.broadcast
    this.unwrappedLocations = state.locations

    this.setWrappingEnabled(true)
  }

  // --------------------------------------------------------------------------
  // setWrappingEnabled
  // --------------------------------------------------------------------------

  setWrappingEnabled (enabled) {
    if (enabled) {
      this.pull = StateWrapper.prototype.wrappedPull
      this.broadcast = this.unwrappedBroadcast && StateWrapper.prototype.wrappedBroadcast
      this.locations = this.unwrappedLocations && StateWrapper.prototype.wrappedLocations
    } else {
      this.pull = this.unwrappedPull
      this.broadcast = this.unwrappedBroadcast
      this.locations = this.unwrappedLocations
    }
  }

  // ------------------------------------------------------------------------
  // wrappedPull
  // ------------------------------------------------------------------------

  async wrappedPull (key, options) {
    // Check that the key is valid
    if (typeof key !== 'string' || !key.length) throw new Error(`Invalid key: ${_text(key)}`)

    // Check the the options are valid
    if (typeof options !== 'undefined' && !(typeof options === 'object' && options)) throw new Error(`Invalid options: ${_text(options)}`)

    options = options || {}

    // Check if we have it in the cache
    const cachedValue = this.cache && await this.cache.get(key)
    if (typeof cachedValue !== 'undefined') return cachedValue

    // If we are making an API call, changes the options to filter out what we already have
    if (!options.filter) {
      const codeFilter = await this.cache.get('config://code-filter')
      if (codeFilter) options.filter = StateFilter.toBase64(codeFilter)
    }

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Pull', key, _text(options))
    const start = new Date()
    const value = await this.unwrappedPull.call(this.unwrappedState, key, options)
    if (Log._debugOn) Log._debug(this.tag, 'Pull (end): ' + (new Date() - start) + 'ms')

    // We intentionally check for truthy. Trust will return true/false, and we don't want
    // to set false in our local cache to allow for changes in the Run-DB instance.
    if (value && this.cache) {
      await this.cache.set(key, value)
    }

    return value
  }

  // ------------------------------------------------------------------------
  // wrappedLocations
  // ------------------------------------------------------------------------

  async wrappedLocations (script) {
    // Allow the user to pass an address, or bsv objects
    if (typeof script === 'string') {
      try {
        script = bsv.Script.fromAddress(script).toHex()
      } catch (e) {
        try {
          script = new bsv.Script(script).toHex()
        } catch (e2) {
          throw new Error(`Invalid script: ${_text(script)}`)
        }
      }
    } else if (script instanceof bsv.Address) {
      script = bsv.Script.fromAddress(script).toHex()
    } else if (script instanceof bsv.Script) {
      script = script.toHex()
    } else {
      throw new Error(`Invalid script: ${_text(script)}`)
    }

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Locations', script)
    const start = new Date()
    let locations = await this.unwrappedLocations.call(this.unwrappedState, script)
    if (Log._debugOn) Log._debug(this.tag, 'Trusted (end): ' + (new Date() - start) + 'ms')

    // Check the response
    if (!Array.isArray(locations) || locations.some(location => typeof location !== 'string')) {
      throw new Error(`Received invalid locations: ${_text(locations)}`)
    }

    // Filter out duplicates
    const locationSet = new Set()
    locations = locations.filter(location => {
      if (!locationSet.has(location)) {
        locationSet.add(location)
        return true
      } else {
        if (Log._warnOn) Log._warn(this.tag, 'Duplicate utxo returned from server:', location)
        return false
      }
    })

    return locations
  }

  // ------------------------------------------------------------------------
  // wrappedBroadcast
  // ------------------------------------------------------------------------

  async wrappedBroadcast (rawtx) {
    if (typeof rawtx !== 'string' || !rawtx.length) {
      throw new Error(`Invalid rawtx: ${_text(rawtx)}`)
    }

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Broadcast')
    const start = new Date()
    await this.unwrappedBroadcast.call(this.unwrappedState, rawtx)
    if (Log._debugOn) Log._debug(this.tag, 'Broadcast (end): ' + (new Date() - start) + 'ms')
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = StateWrapper


/***/ }),
/* 41 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * blockchain-wrapper.js
 *
 * Wraps a Run Blockchain implementation to add common functionality:
 *
 *    - Logging calls
 *    - Logging performance
 *    - Caching API responses
 *    - Validating parameters and responses
 *    - Correcting returned UTXOs with known recently-broadcasted transactions
 *    - Allowing an address to be passed to utxos()
 *    - Allowing a bsv.Transaction to be passed to broadcast()
 *
 * Other notes
 *
 *    - The cache property will be set to a Cache implementation by Run
 *
 * To use, either wrap a blockchain instance:
 *
 *    new BlockchainWrapper(myBlockchain)
 *
 * or extend your class from it:
 *
 *    class MyBlockchain extends BlockchainWrapper { ... }
 */

const bsv = __webpack_require__(5)
const RecentBroadcasts = __webpack_require__(58)
const Log = __webpack_require__(2)
const LocalCache = __webpack_require__(39)
const { _text, _defineGetter } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const HEX_REGEX = /^(?:[a-fA-F0-9][a-fA-F0-9])*$/

// ------------------------------------------------------------------------------------------------
// BlockchainWrapper
// ------------------------------------------------------------------------------------------------

class BlockchainWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (blockchain = this, cache = new LocalCache()) {
    this.tag = blockchain.constructor.name === 'Object' ? 'Blockchain' : blockchain.constructor.name

    this.cache = cache

    this.unwrappedBlockchain = blockchain
    this.unwrappedBroadcast = blockchain.broadcast
    this.unwrappedFetch = blockchain.fetch
    this.unwrappedUtxos = blockchain.utxos
    this.unwrappedSpends = blockchain.spends
    this.unwrappedTime = blockchain.time

    if (this !== this.unwrappedBlockchain) {
      _defineGetter(this, 'network', () => this.unwrappedBlockchain.network)
    }

    this.setWrappingEnabled(true)
  }

  // --------------------------------------------------------------------------
  // setWrappingEnabled
  // --------------------------------------------------------------------------

  setWrappingEnabled (enabled) {
    if (enabled) {
      this.broadcast = BlockchainWrapper.prototype.wrappedBroadcast
      this.fetch = BlockchainWrapper.prototype.wrappedFetch
      this.utxos = BlockchainWrapper.prototype.wrappedUtxos
      this.spends = BlockchainWrapper.prototype.wrappedSpends
      this.time = BlockchainWrapper.prototype.wrappedTime
    } else {
      this.broadcast = this.unwrappedBroadcast
      this.fetch = this.unwrappedFetch
      this.utxos = this.unwrappedUtxos
      this.spends = this.unwrappedSpends
      this.time = this.unwrappedTime
    }
  }

  // --------------------------------------------------------------------------
  // wrappedBroadcast
  // --------------------------------------------------------------------------

  async wrappedBroadcast (rawtx) {
    // Allow both raw transactions and bsv transactions
    let tx = null
    try {
      tx = new bsv.Transaction(rawtx)
    } catch (e) {
      throw new Error(`Invalid transaction: ${_text(e.toString())}`)
    }
    rawtx = typeof rawtx === 'string' ? rawtx : tx.toString()

    // Basic transaction checks
    if (tx.inputs.length === 0) throw new Error('tx has no inputs')
    if (tx.outputs.length === 0) throw new Error('tx has no outputs')
    try {
      if (tx.verify() !== true) throw new Error(tx.verify())
    } catch (e) {
      if (e.message.includes('duplicate input')) {
        throw new Error('bad-txns-inputs-duplicate')
      } else {
        throw e
      }
    }

    // Check if we recently broadcasted this transaction already
    if (this.cache) {
      const recentBroadcasts = await this.cache.get('config://recent-broadcasts')
      const existing = recentBroadcasts && recentBroadcasts.find(x => x.rawtx === rawtx)
      if (existing) {
        if (Log._infoOn) Log._info(this.tag, 'Already broadcasted', existing.txid)
        return existing.txid
      }
    }

    // Broadcast the transaction
    if (Log._infoOn) Log._info(this.tag, 'Broadcast', tx.hash)
    const start = new Date()
    const txid = await this.unwrappedBroadcast.call(this.unwrappedBlockchain, rawtx)
    if (Log._debugOn) Log._debug(this.tag, 'Broadcast (end): ' + (new Date() - start) + 'ms')

    // Validate the txid
    const badTxid = typeof txid !== 'string' || txid.length !== 64 || !HEX_REGEX.test(txid)
    if (badTxid) throw new Error(`Invalid response txid: ${txid}`)
    if (Log._debugOn && tx.hash !== txid) throw new Error(`Txid response mismatch: ${txid}`)

    // Cache the transaction
    if (this.cache) {
      const cacheSets = []

      // Store the transaction time. Allow errors if there are dups.
      const previousTime = await this.cache.get(`time://${txid}`)
      if (typeof previousTime === 'undefined') {
        const promise = this.cache.set(`time://${txid}`, Date.now())
        if (promise instanceof Promise) promise.catch(e => {})
        cacheSets.push(promise)
      }

      // Mark inputs as spent
      for (const input of tx.inputs) {
        const prevtxid = input.prevTxId.toString('hex')
        const location = `${prevtxid}_o${input.outputIndex}`
        cacheSets.push(this.cache.set(`spend://${location}`, txid))
      }

      // Cache the transaction itself
      cacheSets.push(this.cache.set(`tx://${txid}`, rawtx))

      // Update our recent broadcasts
      cacheSets.push(RecentBroadcasts._addToCache(this.cache, tx, txid))

      // Wait for all cache updates to finish
      await Promise.all(cacheSets)
    }

    return txid
  }

  // ------------------------------------------------------------------------
  // wrappedFetch
  // ------------------------------------------------------------------------

  async wrappedFetch (txid) {
    // Validate the txid
    const badTxid = typeof txid !== 'string' || txid.length !== 64 || !HEX_REGEX.test(txid)
    if (badTxid) throw new Error(`Invalid txid: ${_text(txid)}`)

    // Check the cache. In client mode, we must use the cache.
    const cachedTx = this.cache ? await this.cache.get(`tx://${txid}`) : undefined
    if (typeof cachedTx !== 'undefined') return cachedTx

    // Fetch
    if (Log._infoOn) Log._info(this.tag, 'Fetch', txid)
    const start = new Date()
    const rawtx = await this.unwrappedFetch.call(this.unwrappedBlockchain, txid)
    if (Log._debugOn) Log._debug(this.tag, 'Fetch (end): ' + (new Date() - start) + 'ms')

    // Check the response is correct
    if (typeof rawtx !== 'string' || !rawtx.length || !HEX_REGEX.test(rawtx)) {
      throw new Error(`Invalid rawtx fetched for ${txid}: ${rawtx}`)
    }
    if (Log._debugOn && new bsv.Transaction(rawtx).hash !== txid) {
      throw new Error(`Transaction fetch mismatch for ${txid}`)
    }

    // Cache the transaction and its spends
    if (this.cache) {
      const cacheSets = []

      cacheSets.push(this.cache.set(`tx://${txid}`, rawtx))

      const bsvtx = new bsv.Transaction(rawtx)
      bsvtx.inputs.forEach(input => {
        const prevtxid = input.prevTxId.toString('hex')
        const location = `${prevtxid}_o${input.outputIndex}`
        cacheSets.push(this.cache.set(`spend://${location}`, txid))
      })

      await Promise.all(cacheSets)
    }

    return rawtx
  }

  // ------------------------------------------------------------------------
  // wrappedUtxos
  // ------------------------------------------------------------------------

  async wrappedUtxos (script) {
    // Allow the user to pass an address, or bsv objects
    if (typeof script === 'string') {
      try {
        script = bsv.Script.fromAddress(script).toHex()
      } catch (e) {
        try {
          script = new bsv.Script(script).toHex()
        } catch (e2) {
          throw new Error(`Invalid script: ${_text(script)}`)
        }
      }
    } else if (script instanceof bsv.Address) {
      script = bsv.Script.fromAddress(script).toHex()
    } else if (script instanceof bsv.Script) {
      script = script.toHex()
    } else {
      throw new Error(`Invalid script: ${_text(script)}`)
    }

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Utxos', script)
    const start = new Date()
    let utxos = await this.unwrappedUtxos.call(this.unwrappedBlockchain, script)
    if (Log._debugOn) Log._debug(this.tag, 'Utxos (end): ' + (new Date() - start) + 'ms')

    // Check the response
    if (!Array.isArray(utxos) || utxos.some(utxo => {
      if (typeof utxo.txid !== 'string') return true
      if (utxo.txid.length !== 64) return true
      if (!HEX_REGEX.test(utxo.txid)) return true
      if (typeof utxo.vout !== 'number') return true
      if (!Number.isInteger(utxo.vout)) return true
      if (utxo.vout < 0) return true
      if (typeof utxo.script !== 'string') return true
      if (!HEX_REGEX.test(utxo.script)) return true
      if (typeof utxo.satoshis !== 'number') return true
      if (!Number.isInteger(utxo.satoshis)) return true
      if (utxo.satoshis < 0) return true
    })) {
      throw new Error(`Received invalid utxos: ${_text(utxos)}`)
    }

    // In case the server has a bug, Run must be able to handle duplicate utxos returned. If we
    // don't dedup, then later we may create a transaction with more than one of the same input,
    // for example in Token combines.
    const locations = new Set()
    utxos = utxos.filter(utxo => {
      const location = `${utxo.txid}_o${utxo.vout}`
      if (!locations.has(location)) {
        locations.add(location)
        return true
      } else {
        if (Log._warnOn) Log._warn(this.tag, 'Duplicate utxo returned from server:', location)
        return false
      }
    })

    // Correct utxos with known recent broadcasts
    if (this.cache) {
      await RecentBroadcasts._correctUtxosUsingCache(this.cache, utxos, script)
    }

    return utxos
  }

  // ------------------------------------------------------------------------
  // wrappedSpends
  // ------------------------------------------------------------------------

  async wrappedSpends (txid, vout) {
    // Validate the txid
    const badTxid = typeof txid !== 'string' || txid.length !== 64 || !HEX_REGEX.test(txid)
    if (badTxid) {
      // Check if it is a location string
      try {
        const location = txid
        const parts = location.split('_o')
        txid = parts[0]
        vout = parseInt(parts[1])
        const badTxid = typeof txid !== 'string' || txid.length !== 64 || !HEX_REGEX.test(txid)
        if (badTxid) throw new Error()
      } catch (e) {
        throw new Error(`Invalid txid: ${_text(txid)}`)
      }
    }

    // Validate the vout
    const badVout = typeof vout !== 'number' || !Number.isInteger(vout) || vout < 0
    if (badVout) throw new Error(`Invalid vout: ${_text(vout)}`)

    // Check the cache. In client mode, we must use the cache.
    const cachedSpend = this.cache ? await this.cache.get(`spend://${txid}_o${vout}`) : undefined
    if (typeof cachedSpend !== 'undefined') return cachedSpend

    // Call the API
    if (Log._infoOn) Log._info(this.tag, `Spends ${txid}_o${vout}`)
    const start = new Date()
    const spend = await this.unwrappedSpends.call(this.unwrappedBlockchain, txid, vout)
    if (Log._debugOn) Log._debug(this.tag, 'Spends (end): ' + (new Date() - start) + 'ms')

    // Check the response
    if (spend !== null && !(typeof spend === 'string' && spend.length === 64 && HEX_REGEX.test(spend))) {
      throw new Error(`Invalid spend txid fetched for ${txid}_o${vout}: ${spend}`)
    }

    // Cache the spend
    if (spend && this.cache) {
      await this.cache.set(`spend://${txid}_o${vout}`, spend)
    }

    return spend
  }

  // --------------------------------------------------------------------------
  // wrappedTime
  // --------------------------------------------------------------------------

  async wrappedTime (txid) {
    // Validate the txid
    const badTxid = typeof txid !== 'string' || txid.length !== 64 || !HEX_REGEX.test(txid)
    if (badTxid) throw new Error(`Invalid txid: ${_text(txid)}`)

    // Check the cache. In client mode, we must use the cache.
    const cachedTime = this.cache ? await this.cache.get(`time://${txid}`) : undefined
    if (typeof cachedTime !== 'undefined') return cachedTime

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Time', txid)
    const start = new Date()
    const time = await this.unwrappedTime.call(this.unwrappedBlockchain, txid)
    if (Log._debugOn) Log._debug(this.tag, 'Time (end): ' + (new Date() - start) + 'ms')

    // Check the response
    if (typeof time !== 'number' || time < 0) throw new Error(`Invalid time fetched for ${txid}: ${time}`)

    // Cache the time
    if (this.cache) {
      await this.cache.set(`time://${txid}`, time)
    }

    return time
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = BlockchainWrapper


/***/ }),
/* 42 */
/***/ (function(module, exports) {

var g;

// This works in non-strict mode
g = (function() {
	return this;
})();

try {
	// This works if eval is allowed (see CSP)
	g = g || new Function("return this")();
} catch (e) {
	// This works if the window reference is available
	if (typeof window === "object") g = window;
}

// g can still be undefined, but nothing to do about it...
// We return undefined, instead of nothing here, so it's
// easier to handle this case. if(!global) { ...}

module.exports = g;


/***/ }),
/* 43 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * kernel.js
 *
 * Run's core that loads jigs and creates transactions
 */

const bsv = __webpack_require__(5)
const { _assert, _bsvNetwork } = __webpack_require__(0)
const Editor = __webpack_require__(9)
const { _sha256Internal } = __webpack_require__(12)
const { ClientModeError } = __webpack_require__(11)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const EVENTS = ['load', 'sync', 'publish', 'update']

// ------------------------------------------------------------------------------------------------
// Kernel
// ------------------------------------------------------------------------------------------------

class Kernel {
  constructor () {
    // Blockchain API implementation
    this._blockchain = undefined

    // State API implementation
    this._state = undefined

    // Cache API implementation
    this._cache = undefined

    // Owner API implementation
    this._owner = undefined

    // Purse API implementation
    this._purse = undefined

    // App name string for transactions
    this._app = undefined

    // Event listeners in the form { _event, _listener }
    this._listeners = []

    // Default max satoshis in a backed jig
    this._backingLimit = 100000000

    // Timeout for kernel actions
    this._timeout = 10000

    // Trusted code. Defaults to none. They are txids, and there are two special values, "*" and "cache".
    this._trustlist = new Set()

    // Whether to check that a transaction does not have any locally-detectable verification
    // errors before publishing. This does not check consensus but it may find Run bugs. It will
    // slow down publishing however. We will keep this on until we are 100% confident in Run.
    this._preverify = true

    // Client mode will only load jigs from the cache. This is a setting for browsers and apps to work reliably.
    this._client = false

    // Whether jigs should be rolled back to their last safe state if there is an error
    this._rollbacks = false
  }

  // --------------------------------------------------------------------------

  /**
   * Activates this kernel instance so its owner, blockchain, transaction queue and more are used.
   */
  _activate () {
    if (Kernel._instance === this) return
    if (Kernel._instance) Kernel._instance._deactivate()

    Kernel._instance = this
    bsv.Networks.defaultNetwork = bsv.Networks[_bsvNetwork(this._blockchain.network)]

    Editor._activate()
  }

  // --------------------------------------------------------------------------

  /**
   * Deactivates the current run instance, cleaning up anything in the process
   */
  _deactivate () {
    if (!Kernel._instance) return

    Editor._deactivate()
    Kernel._instance = null
  }

  // --------------------------------------------------------------------------

  _emit (event, data) {
    _assert(EVENTS.includes(event))

    this._listeners
      .filter(x => x._event === event)
      .forEach(x => x._listener(event, data))
  }

  // --------------------------------------------------------------------------

  // The trust list works off TXIDs because locations are not known when the code
  // is about to be executed during replay.
  async _trusted (txid, from) {
    return this._trustlist.has('*') ||
      this._trustlist.has(txid) ||
      (from === 'state' && this._trustlist.has('state')) ||
      await this._state.pull(`trust://${txid}`)
  }

  // --------------------------------------------------------------------------

  async _fetch (txid) {
    const cachedTx = await this._state.pull(`tx://${txid}`)
    if (typeof cachedTx !== 'undefined') return cachedTx

    // In client mode, we must use the cache.
    if (this._client) throw new ClientModeError(txid, 'transaction')

    return await this._blockchain.fetch(txid)
  }

  // --------------------------------------------------------------------------

  async _spends (txid, vout) {
    const cachedSpend = await this._state.pull(`spend://${txid}_o${vout}`)
    if (typeof cachedSpend !== 'undefined') return cachedSpend

    // In client mode, we must use the cache
    if (this._client) return

    return await this._blockchain.spends(txid, vout)
  }

  // --------------------------------------------------------------------------

  async _time (txid) {
    const cachedTime = await this._state.pull(`time://${txid}`)
    if (typeof cachedTime !== 'undefined') return cachedTime

    // In client mode, we must use the cache.
    if (this._client) return

    return await this._blockchain.time(txid)
  }
}

// ------------------------------------------------------------------------------------------------

// No kernel instance is active by default
Kernel._instance = null

// The sha256 function used by the kernel is our internal one
Kernel._sha256 = _sha256Internal

// ------------------------------------------------------------------------------------------------

Kernel._EVENTS = EVENTS

module.exports = Kernel


/***/ }),
/* 44 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * common-lock.js
 *
 * The most common lock to create a P2PKH output for an jig's address
 */

const Editor = __webpack_require__(9)

// ------------------------------------------------------------------------------------------------
// CommonLock
// ------------------------------------------------------------------------------------------------

/**
 * The default lock in Run used to generate a P2PKH output.
 *
 * When you set an address string or a public key string as the owner of a jig, Run generates
 * a standard lock for it. By standardizing this output, we reduce blockchain API queries.
 */
class CommonLock {
  constructor (address, testnet) {
    this.address = address
    this.testnet = testnet
  }

  script () {
    if (typeof this.address !== 'string') {
      throw new Error(`Address is not a string: ${this.address}`)
    }

    // Based on https://gist.github.com/diafygi/90a3e80ca1c2793220e5/
    const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'
    const d = [] // the array for storing the stream of decoded bytes
    const b = [] // the result byte array that will be returned
    let j // the iterator variable for the byte array (d)
    let c // the carry amount variable that is used to overflow from the current byte to the next byte
    let n // a temporary placeholder variable for the current byte
    const s = this.address
    for (let i = 0; i < s.length; i++) {
      j = 0 // reset the byte iterator
      c = A.indexOf(s[i]) // set the initial carry amount equal to the current base58 digit
      if (c < 0) throw new Error(`Invalid character in address: ${s}\n\nDetails: i=${i}, c=${s[i]}`)
      if (!(c || b.length ^ i)) b.push(0) // prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)
      while (j in d || c) { // start looping through the bytes until there are no more bytes and no carry amount
        n = d[j] // set the placeholder for the current byte
        n = n ? n * 58 + c : c // shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)
        c = n >> 8 // find the new carry amount (1-byte shift of current byte value)
        d[j] = n % 256 // reset the current byte to the remainder (the carry amount will pass on the overflow)
        j++ // iterate to the next byte
      }
    }
    while (j--) { b.push(d[j]) } // since the byte array is backwards, loop through it in reverse order, and append
    if (b.length < 6) throw new Error(`Address too short: ${s}`)
    if (b[0] !== 0 && b[0] !== 111) throw new Error(`Address may only be a P2PKH type: ${s}`)
    const badNetwork = (this.testnet === true && b[0] === 0) || (this.testnet === false && b[0] === 111)
    if (badNetwork) throw new Error('Invalid network')
    const hash160 = b.slice(1, b.length - 4)
    const scriptBytes = [118, 169, 20, ...hash160, 136, 172] // OP_DUP OP_HASH160 <PKH> OP_EQUALVERIFY OP_CHECKSIG

    return scriptBytes
      .map(x => x.toString('16'))
      .map(x => x.length === 1 ? '0' + x : x)
      .join('')
  }

  domain () {
    return 108 // 1 + 73 (sig) + 1 + 33 (compressed pubkey)
  }
}

CommonLock.sealed = true

// ------------------------------------------------------------------------------------------------

CommonLock.toString() // Preserves the class name during compilation

const NativeCommonLock = Editor._createCode()
const editor = Editor._get(NativeCommonLock)
const internal = true
editor._installNative(CommonLock, internal)

module.exports = NativeCommonLock


/***/ }),
/* 45 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * recreate.js
 *
 * Recreates jig and berries from cached state
 */

const bsv = __webpack_require__(5)
const Log = __webpack_require__(2)
const { _assert, _parentName, _setOwnProperty, _JIGS, _BERRIES, _text } = __webpack_require__(0)
const { _deterministicJSONStringify } = __webpack_require__(17)
const { _location, _compileLocation } = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const { _sha256 } = __webpack_require__(12)
const Editor = __webpack_require__(9)
const Membrane = __webpack_require__(19)
const Rules = __webpack_require__(22)
const Json = __webpack_require__(23)
const Sandbox = __webpack_require__(6)
const { _parseStateVersion } = __webpack_require__(15)
const { TrustError } = __webpack_require__(11)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Recreate'

// ------------------------------------------------------------------------------------------------
// _Partial
// ------------------------------------------------------------------------------------------------

/**
 * A partially loaded jig or berry from the state cache.
 *
 * The completer finishes the load but it may be referenced before then.
 */
class _Partial {
  constructor (value, completer) {
    _assert(completer instanceof Promise)
    this._value = value
    this._completer = completer
  }
}

// ------------------------------------------------------------------------------------------------
// _recreate
// ------------------------------------------------------------------------------------------------

/**
 * Recreates a jig or berry from the cache
 *
 * @returns {?_Partial} A partial load if the state doesn't exist in the cache
 */
async function _recreate (location, state, hash, kernel, session, timeout) {
  if (Log._infoOn) Log._info(TAG, 'Recreate', location)

  // Check that the version is supported
  _parseStateVersion(state.version)

  // Check that the hash matches

  let stateHashHex = null

  if (state.kind === 'berry' || (hash && !kernel._trustlist.has('state'))) {
    const stateString = _deterministicJSONStringify(state)
    const stateBuffer = new bsv.deps.Buffer(stateString, 'utf8')
    const stateHash = await _sha256(stateBuffer)
    stateHashHex = stateHash.toString('hex')

    if (hash && stateHashHex !== hash) {
      const result = `Cannot recreate ${location} from an incorrect state`
      const detail = `State: ${JSON.stringify(state)}`
      const hint = 'Hint: Is the cache corrupted or returning wrong values?'
      const message = `${result}\n\n${detail}\n\n${hint}`
      throw new Error(message)
    }
  }

  // Get the referenced jigs out of the state by decoding with dummy jigs
  // Dummy jigs are classes so that setPrototypeOf works for arbitrary objects
  const refs = new Map()
  const makeDummyJig = x => { class A {}; A.location = x; return A }
  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (x) => { refs.set(x, null); return makeDummyJig(x) }
  }

  // Extract referenced jigs from props
  const decodedProps = Json._decode(state.props, decodeOptions)

  // Extract referenced jigs from the class
  if (state.cls) Json._decode(state.cls, decodeOptions)

  switch (state.kind) {
    case 'code': {
      const txid = location.split('_')[0]
      return _recreateCode(state, decodedProps, refs, txid, kernel, session, timeout)
    }

    case 'jig': {
      const txid = location.split('_')[0]
      return _recreateJig(state, decodedProps, refs, txid, kernel, session, timeout)
    }

    case 'berry': {
      return _recreateBerry(state, decodedProps, refs, stateHashHex, kernel, session, timeout)
    }

    default: {
      const result = `Cannot recreate ${location} from an invalid state`
      const reason = `Invalid jig kind: ${_text(state.kind)}`
      const message = `${result}\n\n${reason}`
      throw new Error(message)
    }
  }
}

// ------------------------------------------------------------------------------------------------

async function _recreateCode (state, decodedProps, refs, txid, kernel, session, timeout) {
  const env = {}

  // If the state is code, make sure it is trusted. For cached state, we trust any code loaded from its
  // origin. This is not ideal, but it is necessary in the v5 protocol, because state cache entries have
  // no reference to which transaction the code was deployed.
  const origintxid = decodedProps.origin.startsWith('_') ? txid : decodedProps.origin.slice(0, 64)
  try {
    if (!(await kernel._trusted(origintxid, 'state'))) throw new TrustError(origintxid, 'state')
  } catch (e) {
    if (!(await kernel._trusted(txid, 'state'))) throw new TrustError(txid, 'state')
  }

  // Preload the parent if there is one
  const parentName = _parentName(state.src)
  if (parentName) {
    const parentLocation = decodedProps.deps[parentName].location
    const parentFullLocation = _compileLocation(Object.assign({ _txid: txid }, _location(parentLocation)))
    const _load = __webpack_require__(16)
    const Parent = await _load(parentFullLocation, undefined, kernel, session, timeout, false)
    refs.set(parentLocation, Parent)
    env[parentName] = Parent
  }

  // Create the code without any properties
  const C = Editor._createCode()

  // Sandbox and load the code
  const T = Sandbox._evaluate(state.src, env)[0]
  const [S, SGlobal] = Editor._makeSandbox(C, T)
  const local = false
  Editor._get(C)._install(S, local)

  // Finishing loading the jig in parallel in a completer
  const complete = async () => {
    // Load the remaining refs
    for (const ref of refs.keys()) {
      if (refs.get(ref)) continue
      const fullLocation = _compileLocation(Object.assign({ _txid: txid }, _location(ref)))
      const _load = __webpack_require__(16)
      const jig = await _load(fullLocation, undefined, kernel, session, timeout, false)
      refs.set(ref, jig)
    }

    // Re-decode the props with the partially loaded refs
    const decodeOptions = {
      _intrinsics: Sandbox._intrinsics,
      _decodeJig: (x) => {
        const jig = refs.get(x)
        const fullLocation = _compileLocation(Object.assign({ _txid: txid }, _location(x)))
        if (!jig) throw new Error(`Jig not loaded: ${fullLocation}`)
        return jig
      }
    }

    const redecodedProps = Json._decode(state.props, decodeOptions)

    // Apply the now loaded props to the code
    _sudo(() => {
      // Delete all the existing keys first. Particularly bindings. Otherwise, ordering bugs.
      Object.keys(C).forEach(key => { delete C[key] })
      Object.keys(redecodedProps).forEach(key => _setOwnProperty(C, key, redecodedProps[key]))
    })

    // Apply final bindings to the code
    _sudo(() => {
      C.location = _compileLocation(Object.assign({ _txid: txid }, _location(C.location)))
      C.origin = _compileLocation(Object.assign({ _txid: txid }, _location(C.origin)))
    })

    // Make the deps update the globals in the sandbox as we'd expect
    _sudo(() => {
      const deps = Editor._makeDeps(C, SGlobal, C.deps)
      _setOwnProperty(C, 'deps', deps)
      // Update the globals with the new dependencies using the new deps wrapper.
      Object.keys(redecodedProps.deps || {}).forEach(prop => {
        C.deps[prop] = redecodedProps.deps[prop]
      })
    })

    // Notify listeners
    kernel._emit('load', C)
  }

  const promise = complete()

  return new _Partial(C, promise)
}

// ------------------------------------------------------------------------------------------------

async function _recreateJig (state, decodedState, refs, txid, kernel, session, timeout) {
  // Wrap the decoded state in a jig membrane
  const initialized = true
  const rules = Rules._jigObject(initialized)
  const jig = new Membrane(decodedState, rules)

  // Force it to be a jig
  _JIGS.add(jig)

  async function complete () {
    // Load the remaining refs
    for (const ref of refs.keys()) {
      if (refs.get(ref)) continue
      const fullLocation = _compileLocation(Object.assign({ _txid: txid }, _location(ref)))
      const _load = __webpack_require__(16)
      const jig = await _load(fullLocation, undefined, kernel, session, timeout, false)
      refs.set(ref, jig)
    }

    // Assign the class onto the jig
    const C = refs.get(state.cls.$jig)
    _sudo(() => Object.setPrototypeOf(jig, C.prototype))

    // Re-decode the props with the partially loaded refs
    const decodeOptions = {
      _intrinsics: Sandbox._intrinsics,
      _decodeJig: (x) => {
        const jig = refs.get(x)
        const fullLocation = _compileLocation(Object.assign({ _txid: txid }, _location(x)))
        if (!jig) throw new Error(`Jig not loaded: ${fullLocation}`)
        return jig
      }
    }

    const redecodedProps = Json._decode(state.props, decodeOptions)

    // Apply now loaded props to the jig
    _sudo(() => {
      Object.keys(redecodedProps).forEach(key => {
        _setOwnProperty(jig, key, redecodedProps[key])
      })
    })

    // Apply final bindings to the jig
    _sudo(() => {
      jig.location = _compileLocation(Object.assign({ _txid: txid }, _location(jig.location)))
      jig.origin = _compileLocation(Object.assign({ _txid: txid }, _location(jig.origin)))
    })

    // Notify listeners
    kernel._emit('load', jig)
  }

  const promise = complete()

  return new _Partial(jig, promise)
}

// ------------------------------------------------------------------------------------------------

async function _recreateBerry (state, decodedState, refs, hash, kernel, session, timeout) {
  // Wrap the decoded state in a berry membrane
  const initialized = true
  const rules = Rules._berryObject(initialized)
  const berry = new Membrane(decodedState, rules)

  // Force it to be a berry
  _BERRIES.add(berry)

  async function complete () {
    // Load the remaining refs
    for (const ref of refs.keys()) {
      if (refs.get(ref)) continue
      const fullLocation = _compileLocation(Object.assign({ _hash: hash }, _location(ref)))
      const _load = __webpack_require__(16)
      const jig = await _load(fullLocation, undefined, kernel, session, timeout, false)
      refs.set(ref, jig)
    }

    // Assign the class onto the berry
    const B = refs.get(state.cls.$jig)
    _sudo(() => Object.setPrototypeOf(berry, B.prototype))

    // Re-decode the props with the partially loaded refs
    const decodeOptions = {
      _intrinsics: Sandbox._intrinsics,
      _decodeJig: (x) => {
        const jig = refs.get(x)
        const fullLocation = _compileLocation(Object.assign({ _hash: hash }, _location(x)))
        if (!jig) throw new Error(`Jig not loaded: ${fullLocation}`)
        return jig
      }
    }

    const redecodedProps = Json._decode(state.props, decodeOptions)

    // Apply now loaded props to the berry
    _sudo(() => {
      Object.keys(redecodedProps).forEach(key => {
        _setOwnProperty(berry, key, redecodedProps[key])
      })
    })

    // Apply final bindings to the berry
    _sudo(() => {
      berry.location = _compileLocation(Object.assign({ _hash: hash }, _location(berry.location)))
      berry.origin = _compileLocation(Object.assign({ _hash: hash }, _location(berry.origin)))
    })

    // Notify listeners
    kernel._emit('load', berry)
  }

  const promise = complete()

  return new _Partial(berry, promise)
}

// ------------------------------------------------------------------------------------------------

module.exports = _recreate


/***/ }),
/* 46 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * owner-wrapper.js
 *
 * Wraps a Run Owner implementation to add common functionality:
 *
 *    - Logging calls
 *    - Logging performance
 *    - Validating parameters and responses
 *    - Allowing signing without passing parents or locks
 *
 * To use, either wrap an owner instance:
 *
 *    new OwnerWrapper(myOwner)
 *
 * or extend your class from it:
 *
 *    class MyOwner extends OwnerWrapper { ... }
 */

const Log = __webpack_require__(2)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const HEX_REGEX = /^(?:[a-fA-F0-9][a-fA-F0-9])*$/

// ------------------------------------------------------------------------------------------------
// OwnerWrapper
// ------------------------------------------------------------------------------------------------

class OwnerWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (owner = this) {
    this.tag = owner.constructor.name === 'Object' ? 'Owner' : owner.constructor.name

    this.unwrappedOwner = owner
    this.unwrappedNextOwner = owner.nextOwner
    this.unwrappedSign = owner.sign

    this.setWrappingEnabled(true)
  }

  // --------------------------------------------------------------------------
  // setWrappingEnabled
  // --------------------------------------------------------------------------

  setWrappingEnabled (enabled) {
    if (enabled) {
      this.nextOwner = OwnerWrapper.prototype.wrappedNextOwner
      this.sign = OwnerWrapper.prototype.wrappedSign
    } else {
      this.nextOwner = this.unwrappedNextOwner
      this.sign = this.unwrappedSign
    }
  }

  // ------------------------------------------------------------------------
  // wrappedNextOwner
  // ------------------------------------------------------------------------

  async wrappedNextOwner () {
    if (Log._infoOn) Log._info(this.tag, 'Next owner')
    const start = new Date()
    const owner = await this.unwrappedNextOwner.call(this.unwrappedOwner)
    if (Log._debugOn) Log._debug(this.tag, 'Next owner (end): ' + (new Date() - start) + 'ms')
    return owner
  }

  // ------------------------------------------------------------------------
  // wrappedSign
  // ------------------------------------------------------------------------

  async wrappedSign (rawtx, parents, locks) {
    // Allow parents and locks to be null when user is calling
    parents = parents || []
    locks = locks || []

    // Check that rawtx is a valid hex string
    if (typeof rawtx !== 'string' || !HEX_REGEX.test(rawtx)) throw new Error(`Invalid tx to sign: ${rawtx}`)

    if (Log._infoOn) Log._info(this.tag, 'Sign')
    const start = new Date()
    const signedtx = await this.unwrappedSign.call(this.unwrappedOwner, rawtx, parents, locks)
    if (Log._debugOn) Log._debug(this.tag, 'Sign (end): ' + (new Date() - start) + 'ms')

    // Check that signedtx is valid
    if (typeof signedtx !== 'string' || !HEX_REGEX.test(signedtx)) throw new Error(`Invalid signed tx: ${signedtx}`)

    return signedtx
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = OwnerWrapper


/***/ }),
/* 47 */
/***/ (function(module, exports, __webpack_require__) {

const recreateJigsFromStates = __webpack_require__(57)

const mainnetStates = __webpack_require__(69)
const testnetStates = __webpack_require__(70)

const mainnetJigs = recreateJigsFromStates(mainnetStates)
const testnetJigs = recreateJigsFromStates(testnetStates)

const main = {
  asm: mainnetJigs['284ce17fd34c0f41835435b03eed149c4e0479361f40132312b4001093bb158f_o1'],
  B: mainnetJigs['05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o3'],
  Base58: mainnetJigs['81bcef29b0e4ed745f3422c0b764a33c76d0368af2d2e7dd139db8e00ee3d8a6_o1'],
  expect: mainnetJigs['71fba386341b932380ec5bfedc3a40bce43d4974decdc94c419a94a8ce5dfc23_o1'],
  Group: mainnetJigs['780ab8919cb89323707338070323c24ce42cdec2f57d749bd7aceef6635e7a4d_o1'],
  Hex: mainnetJigs['727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1'],
  NFT: mainnetJigs.b2f52f369d6ac4210585e0d173020106bd338197f136e02bc4d1fb2af3ef789f_o1,
  sha256: mainnetJigs['3b7ef411185bbe3d01caeadbe6f115b0103a546c4ef0ac7474aa6fbb71aff208_o1'],
  Token: mainnetJigs['72a61eb990ffdb6b38e5f955e194fed5ff6b014f75ac6823539ce5613aea0be8_o1'],
  Token10: mainnetJigs.b17a9af70ab0f46809f908b2e900e395ba40996000bf4f00e3b27a1e93280cf1_o1,
  Token20: mainnetJigs['72a61eb990ffdb6b38e5f955e194fed5ff6b014f75ac6823539ce5613aea0be8_o1'],
  Tx: mainnetJigs['05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o1'],
  txo: mainnetJigs['05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o2']
}

const test = {
  asm: testnetJigs['03e21aa8fcf08fa6985029ad2e697a2309962527700246d47d891add3cfce3ac_o1'],
  B: testnetJigs.d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o3,
  Base58: testnetJigs['424abf066be56b9dd5203ed81cf1f536375351d29726d664507fdc30eb589988_o1'],
  expect: testnetJigs.f97d4ac2a3d6f5ed09fad4a4f341619dc5a3773d9844ff95c99c5d4f8388de2f_o1,
  Group: testnetJigs['63e0e1268d8ab021d1c578afb8eaa0828ccbba431ffffd9309d04b78ebeb6e56_o1'],
  Hex: testnetJigs['1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2'],
  NFT: testnetJigs['8554b58e95bbd7a1899b54ca1318cc3ce140c6cd7ed64789dcaf5ea5dcfdb1f1_o1'],
  sha256: testnetJigs['4a1929527605577a6b30710e6001b9379400421d8089d34bb0404dd558529417_o1'],
  Token: testnetJigs['7d14c868fe39439edffe6982b669e7b4d3eb2729eee7c262ec2494ee3e310e99_o1'],
  Token10: testnetJigs['0bdf33a334a60909f4c8dab345500cbb313fbfd50b1d98120227eae092b81c39_o1'],
  Token20: testnetJigs['7d14c868fe39439edffe6982b669e7b4d3eb2729eee7c262ec2494ee3e310e99_o1'],
  Tx: testnetJigs.d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o1,
  txo: testnetJigs.d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o2
}

main.states = mainnetStates
test.states = testnetStates

module.exports.main = {}
module.exports.test = {}

Object.assign(module.exports.main, main)
Object.assign(module.exports.test, test)

Object.assign(module.exports, main)


/***/ }),
/* 48 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * purse-wrapper.js
 *
 * Wraps a Run Purse implementation to add common functionality:
 *
 *    - Logging calls
 *    - Logging performance
 *    - Validate responses
 *    - Allows paying without passing parents
 *    - send() method to make a payment
 *
 * To use, either wrap an owner instance:
 *
 *    new PurseWrapper(myPurse)
 *
 * or extend your class from it:
 *
 *    class MyPurse extends PurseWrapper { ... }
 */

const bsv = __webpack_require__(5)
const Log = __webpack_require__(2)
const { _text } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const HEX_REGEX = /^(?:[a-fA-F0-9][a-fA-F0-9])*$/

// ------------------------------------------------------------------------------------------------
// PurseWrapper
// ------------------------------------------------------------------------------------------------

class PurseWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (purse = this, blockchain = null) {
    this.tag = purse.constructor.name === 'Object' ? 'Purse' : purse.constructor.name

    this.blockchain = blockchain

    this.unwrappedPurse = purse
    this.unwrappedPay = purse.pay
    this.unwrappedBroadcast = purse.broadcast
    this.unwrappedCancel = purse.cancel

    this.setWrappingEnabled(true)
  }

  // --------------------------------------------------------------------------
  // setWrappingEnabled
  // --------------------------------------------------------------------------

  setWrappingEnabled (enabled) {
    if (enabled) {
      this.pay = PurseWrapper.prototype.wrappedPay
      this.broadcast = this.unwrappedBroadcast && PurseWrapper.prototype.wrappedBroadcast
      this.cancel = this.unwrappedCancel && PurseWrapper.prototype.wrappedCancel
    } else {
      this.pay = this.unwrappedPay
      this.broadcast = this.unwrappedBroadcast
      this.cancel = this.unwrappedCancel
    }
  }

  // ------------------------------------------------------------------------
  // wrappedPay
  // ------------------------------------------------------------------------

  async wrappedPay (rawtx, parents) {
    // Allow both raw transactions and bsv transactions
    if (rawtx instanceof bsv.Transaction) rawtx = rawtx.toString()

    // Check that rawtx is a valid hex string
    const throwBadTx = () => { throw new Error(`Invalid tx to pay: ${_text(rawtx)}`) }
    if (typeof rawtx !== 'string' || !HEX_REGEX.test(rawtx)) throwBadTx()
    try { new bsv.Transaction(rawtx) } catch (e) { throwBadTx() } // eslint-disable-line

    // Allow parents to be null when user is calling
    if (typeof parents === 'undefined') parents = []

    // Validate parents
    const badParents =
      !Array.isArray(parents) ||
      parents.some(x => typeof x.script !== 'string') ||
      parents.some(x => typeof x.satoshis !== 'number')
    if (badParents) throw new Error(`Invalid parents: ${_text(parents)}`)

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Pay')
    const start = new Date()
    const paidtx = await this.unwrappedPay.call(this.unwrappedPurse, rawtx, parents)
    if (Log._debugOn) Log._debug(this.tag, 'Pay (end): ' + (new Date() - start) + 'ms')

    // Check that paidtx is valid
    if (typeof paidtx !== 'string' || !HEX_REGEX.test(paidtx)) throw new Error(`Invalid paid tx: ${paidtx}`)

    return paidtx
  }

  // ------------------------------------------------------------------------
  // wrappedBroadcast
  // ------------------------------------------------------------------------

  async wrappedBroadcast (rawtx) {
    // Check that rawtx is a valid hex string
    const throwBadTx = () => { throw new Error(`Invalid tx to broadcast: ${_text(rawtx)}`) }
    if (typeof rawtx !== 'string' || !HEX_REGEX.test(rawtx)) throwBadTx()
    try { new bsv.Transaction(rawtx) } catch (e) { throwBadTx() } // eslint-disable-line

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Broadcast')
    const start = new Date()
    const ret = await this.unwrappedBroadcast.call(this.unwrappedPurse, rawtx)
    if (Log._debugOn) Log._debug(this.tag, 'Broadcast (end): ' + (new Date() - start) + 'ms')

    return ret
  }

  // ------------------------------------------------------------------------
  // wrappedCancel
  // ------------------------------------------------------------------------

  async wrappedCancel (rawtx) {
    // Check that rawtx is a valid hex string
    const throwBadTx = () => { throw new Error(`Invalid tx to cancel: ${_text(rawtx)}`) }
    if (typeof rawtx !== 'string' || !HEX_REGEX.test(rawtx)) throwBadTx()
    try { new bsv.Transaction(rawtx) } catch (e) { throwBadTx() } // eslint-disable-line

    // Call the API
    if (Log._infoOn) Log._info(this.tag, 'Cancel')
    const start = new Date()
    const ret = await this.unwrappedCancel.call(this.unwrappedPurse, rawtx)
    if (Log._debugOn) Log._debug(this.tag, 'Cancel (end): ' + (new Date() - start) + 'ms')

    return ret
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = PurseWrapper


/***/ }),
/* 49 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * realm.js
 *
 * Deterministic realm
 */

const ses = __webpack_require__(61)
const { _makeDeterministic, _nonDeterministicIntrinsics, _stableJSONStringify } = __webpack_require__(17)
const { _sudo } = __webpack_require__(4)
const { _uncover } = __webpack_require__(24)

/* global VARIANT */

// ------------------------------------------------------------------------------------------------
// DeterministicRealm
// ------------------------------------------------------------------------------------------------

/**
 * A Realm implementation that is nearly deterministic
 */
class DeterministicRealm {
  constructor () {
    const makeDet = `var n=${_uncover(_stableJSONStringify.toString())};var m=${_uncover(_makeDeterministic.toString())};m(n);`
    const setup = `(()=>{
      ${ses};
      ${makeDet};
      SES.lockdown();
      var C = this.Compartment;
      delete this.SES;
      delete this.Compartment;
      return C
    })()`

    if (true) {
      // Create a hidden iframe to evaluate code. This creates a new browser realm.
      const iframe = document.createElement('iframe')
      if (!iframe.style) iframe.style = {}
      iframe.style.display = 'none'
      document.documentElement.appendChild(iframe)

      // Grab the code evaluator
      this.iframeEval = iframe.contentWindow.eval

      // Secure the realm
      this.Compartment = this.iframeEval(setup)
    } else {}

    // Each non-deterministic global is disabled
    this.globalOverrides = {}
    _nonDeterministicIntrinsics.forEach(name => { this.globalOverrides[name] = undefined })

    // We also overwrite console so that console.log in sandboxed code is relogged outside
    const consoleCode = `
      const o = { }
      Object.keys(c).forEach(name => {
        o[name] = (...args) => s(() => c[name](...args))
      })
      o
    `
    const consoleCompartment = this._makeNondeterministicCompartment()
    consoleCompartment.global.c = console
    consoleCompartment.global.s = _sudo
    this.globalOverrides.console = consoleCompartment.evaluate(consoleCode)
  }

  makeCompartment () {
    const compartment = this._makeNondeterministicCompartment()

    Object.assign(compartment.global, this.globalOverrides)

    const global = new Proxy({}, {
      set: (target, prop, value) => {
        target[prop] = compartment.global[prop] = value
        return true
      },
      deleteProperty: (target, prop) => {
        delete target[prop]
        if (prop in this.globalOverrides) {
          compartment.global[prop] = this.globalOverrides[prop]
        } else {
          delete compartment.global[prop]
        }
        return true
      },
      defineProperty: (target, prop, descriptor) => {
        Object.defineProperty(target, prop, descriptor)
        Object.defineProperty(compartment.global, prop, descriptor)
        return true
      }
    })

    const evaluate = src => {
      this._checkDeterministic(src)
      return compartment.evaluate(src)
    }

    return { evaluate, global }
  }

  _makeNondeterministicCompartment () {
    return new this.Compartment()
  }

  _checkDeterministic (src) {
    const FOR_IN_REGEX = /for\s*\([^)]+\s+in\s+\S+\)/g
    if (FOR_IN_REGEX.test(src)) throw new Error('for-in loops are not supported')
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = DeterministicRealm


/***/ }),
/* 50 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * dynamic.js
 *
 * A class or function that can be dynamically changed at run-time
 */

const Sandbox = __webpack_require__(6)
const { _text } = __webpack_require__(0)
const { _admin } = __webpack_require__(4)
const { ArgumentError } = __webpack_require__(11)
const SI = Sandbox._intrinsics

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const BASE_SRC = 'function dynamic() {}'

// Dynamic | OuterType -> DynamicHandler
const HANDLERS = new WeakMap()

// Helper method to get a handler or throw an error
function getHandler (D) {
  const handler = HANDLERS.get(D)
  if (!handler) throw new ArgumentError(`Not a dynamic type: ${_text(D)}`)
  return handler
}

// Special toString that returns the code for the inner type not the proxy
function toString () {
  const handler = HANDLERS.get(this)
  const toStringTarget = handler ? handler._innerType : this
  return SI.Function.prototype.toString.apply(toStringTarget)
}

// ------------------------------------------------------------------------------------------------
// Dynamic
// ------------------------------------------------------------------------------------------------

/**
 * A container for a class or function that can be swapped at run-time
 *
 * To implement this, we create a proxy base class. We configure its prototype chain so that only
 * the proxy can change its prototypes methods. We allow users to change or get the inner type
 * with special methods outside the type: Dynamic._getInnerType and Dynamic._setInnerType.
 *
 * For the most part, this dynamic type will act the same as its inner type. However, the prototype
 * (and therefore instanceof) and the constructor will be the same even as the underlying type
 * changes. Also, calling Object.getOwnPropertyNames(D.prototype) will return an empty array. The
 * user must call this on the prototype's prototype for its actual methods.
 *
 * Usage:
 *
 *    const D = new Dynamic()
 *    Dynamic._setInnerType(D, class A {})
 *
 *    const instance = new D()
 *    // instance.constructor.name === 'A'
 *
 *    Dynamic._setInnerType(D, class B {})
 *    // instance.constructor.name === 'B'
 *
 * Sometimes when a dynamic is wrapped in a proxy, it is useful to set the outer type - that is,
 * the class returned from A.prototype.constructor and a.constructor for instances. For that,
 * there are two special methods: Dynamic._getOuterType and Dynamic._setOuterType. Only one
 * outer type at a time is supported for a given dynamic but it may be changed.
 */
class Dynamic {
  constructor () {
    // Create the base class that gets proxied
    const Base = Sandbox._evaluate(BASE_SRC)[0]

    // Delete all methods from the base to remove its functionality
    const deleteMethod = method => { delete Base.prototype[method] }
    Object.getOwnPropertyNames(Base.prototype).forEach(deleteMethod)
    Object.getOwnPropertySymbols(Base.prototype).forEach(deleteMethod)

    // Setup a method table that allows us to replace the base behavior
    const methodTable = {}
    const methodTableHandler = new MethodTableHandler()
    const methodTableProxy = new Proxy(methodTable, methodTableHandler)

    // Insert the method table in between our base and its prototype.
    // Dynamic types now will have two prototypes, the base and the method table.
    // We can't proxy the base prototype but we can proxy our insertion.
    const protoproto = Object.getPrototypeOf(Base.prototype)
    Object.setPrototypeOf(methodTable, protoproto)
    Object.setPrototypeOf(Base.prototype, methodTableProxy)

    // Freeze the base prototype to the user. The proxy is already protected.
    Object.freeze(Base.prototype)

    // Return a proxy to the base with our custom dynamic handler
    const dynamicHandler = new DynamicHandler()
    methodTableHandler._init(methodTableProxy, dynamicHandler)
    const proxy = new Proxy(Base, dynamicHandler)
    dynamicHandler._init(Base, methodTable, proxy)
    HANDLERS.set(proxy, dynamicHandler)
    return proxy
  }

  static _getInnerType (D) { return getHandler(D)._innerType }
  static _setInnerType (D, T) { getHandler(D)._setInnerType(T) }

  static _getOuterType (D) { return getHandler(D)._outerType }
  static _setOuterType (D, T) { getHandler(D)._setOuterType(T) }
}

// ------------------------------------------------------------------------------------------------
// DynamicHandler
// ------------------------------------------------------------------------------------------------

/**
 * Proxy handler for the dynamic type
 */
class DynamicHandler {
  _init (Base, methodTable, proxy) {
    this._baseType = Base
    this._innerType = Base
    this._outerType = proxy
    this._proxy = proxy
    this._methodTable = methodTable
  }

  apply (target, thisArg, args) {
    // If the type is a function, call the inner type
    return Reflect.apply(this._innerType, thisArg, args)
  }

  construct (target, args, newTarget) {
    // If a child class, newTarget will be the child and outer type should reflect that
    let outerType = newTarget
    try { outerType = Dynamic._getOuterType(newTarget) } catch (e) { }

    // Create an instance of the inner type with the constructor of the outer type
    return Reflect.construct(this._innerType, args, outerType)
  }

  defineProperty (target, prop, desc) {
    // Don't allow special methods to be changed directly
    if (prop === 'prototype') throw new Error('Cannot define prototype')
    if (prop === 'toString') throw new Error('Cannot define toString')

    // Prevent non-configurable properties because proxies don't like when they're not
    // present on the base and it becomes a problem when a new inner type is set.
    if (!desc.configurable) throw new Error('Cannot define nonconfigurable property')

    // Other properties are defined on the inner type
    Reflect.defineProperty(this._innerType, prop, desc)

    return true
  }

  deleteProperty (target, prop) {
    // Don't allow special methods to be deleted
    if (prop === 'prototype') throw new Error('Cannot delete prototype')
    if (prop === 'toString') throw new Error('Cannot delete toString')

    // Delete everything else on the inner type
    Reflect.deleteProperty(this._innerType, prop)

    return true
  }

  get (target, prop, receiver) {
    // Proxy prototypes must be returned from the base type. Always.
    if (prop === 'prototype') return this._baseType.prototype

    // toString requires special handling. Other functions will run directly on on the receiver.
    if (prop === 'toString') return toString

    // Return all other value types directly on the inner type
    return Reflect.get(this._innerType, prop, receiver)
  }

  getPrototypeOf (target) {
    return Reflect.getPrototypeOf(this._innerType)
  }

  getOwnPropertyDescriptor (target, prop) {
    // Proxy prototypes must be returned from the base type. Always.
    if (prop === 'prototype') return Object.getOwnPropertyDescriptor(this._baseType, prop)

    // Get own property describe on the inner type.
    // toString is not an owned method so it will return undefined.
    const desc = Reflect.getOwnPropertyDescriptor(this._innerType, prop)
    if (!desc) return desc

    // Configurability must be the same as the underlying target.
    // This becomes a problem with Function.arguments and Function.caller in cover mode because
    // they are not present on the dynamic but they are non-configurable on the original code.
    const targetDesc = Reflect.getOwnPropertyDescriptor(target, prop)
    if (!targetDesc || targetDesc.configurable) desc.configurable = true
    return desc
  }

  has (target, prop) {
    // Get has on the inner type
    return Reflect.has(this._innerType, prop)
  }

  isExtensible (target) {
    // Base type defines whether it is extensible or not
    return Reflect.isExtensible(this._baseType)
  }

  ownKeys (target) {
    // Get property names of inner type
    return Reflect.ownKeys(this._innerType)
  }

  preventExtensions (target) {
    // Prevent extensions is permanent on both base and inner type
    Object.preventExtensions(this._baseType)
    Object.preventExtensions(this._innerType)
    return true
  }

  set (target, prop, value, receiver) {
    // Proxy prototypes cannot be changed
    if (prop === 'prototype') throw new Error('Cannot set prototype')

    // toString cannot be set
    if (prop === 'toString') throw new Error('Cannot set toString')

    // All other properties are set on the inner type
    Reflect.set(this._innerType, prop, value)

    return true
  }

  setPrototypeOf (target, prototype) {
    // This is risky. Only call this if you know what you are doing, because it skips over the
    // checks in _setInnerType. Prefer calling that with the new class and parent!
    Reflect.setPrototypeOf(this._innerType, prototype)

    return true
  }

  _setInnerType (T) {
    // We can only change dynamic to another function type
    if (typeof T !== 'function') throw new ArgumentError(`Inner type must be a function type: ${_text(T)}`)

    // Check all types in the inheritance chain
    let x = T
    while (x) {
      if (x === Function.prototype) break
      if (x === SI.Function.prototype) break

      // The new type must not have a special toString property
      if (Object.getOwnPropertyNames(x).includes('toString')) {
        throw new ArgumentError(`toString is a reserved property: ${T}`)
      }

      x = Reflect.getPrototypeOf(x)
    }

    // If either the base type or new inner type is non-extensible, then so is the other
    // This is because Object.preventExtensions is permanant on the base type.
    if (!Reflect.isExtensible(this._baseType) || !Reflect.isExtensible(T)) {
      Reflect.preventExtensions(this._baseType)
      Reflect.preventExtensions(T)
    }

    // Classes can only change to classes and functions to functions
    // Why? Because other code might rely on this for example to instantiate.
    const skipMismatchCheck = this._innerType === this._baseType || T === this._baseType
    const wasClass = this._innerType.toString().startsWith('class')
    const willBeClass = T.toString().startsWith('class')
    if (!skipMismatchCheck && wasClass !== willBeClass) {
      throw new ArgumentError(`Classes can only be changed to classes and functions to functions: ${_text(T)}`)
    }

    // Delete all methods from the method table
    const deleteMethod = method => { delete this._methodTable[method] }
    Object.getOwnPropertyNames(this._methodTable).forEach(deleteMethod)
    Object.getOwnPropertySymbols(this._methodTable).forEach(deleteMethod)

    // Update the prototype of the method table
    const protoproto = Reflect.getPrototypeOf(T.prototype)
    Reflect.setPrototypeOf(this._methodTable, protoproto)

    // Copy over the new methods to the method table
    const methods = Object.getOwnPropertyNames(T.prototype)
      .concat(Object.getOwnPropertySymbols(T.prototype))
    methods.forEach(method => {
      const desc = Reflect.getOwnPropertyDescriptor(T.prototype, method)
      Reflect.defineProperty(this._methodTable, method, desc)
    })

    // Make sure to point the constructor back to the code jig
    this._methodTable.constructor = this._outerType

    // Change the inner type
    this._innerType = T
  }

  _setOuterType (T) {
    if (this._outerType !== this._proxy) HANDLERS.delete(this._outerType)
    HANDLERS.set(T, this)
    this._outerType = T
    this._methodTable.constructor = T
  }
}

// ------------------------------------------------------------------------------------------------
// MethodTableHandler
// ------------------------------------------------------------------------------------------------

/**
 * Intercepts changes to the method table and prevents them
 *
 * The method table is also in the prototype chain for instances, so some parts are tricky!
 */
class MethodTableHandler {
  _init (methodTableProxy, dynamicHandler) {
    this._proxy = methodTableProxy
    this._dynamicHandler = dynamicHandler
  }

  defineProperty (target, prop, desc) {
    throw new Error('defineProperty disabled')
  }

  deleteProperty (target, prop) {
    throw new Error('deleteProperty disabled')
  }

  preventExtensions () {
    throw new Error('preventExtensions disabled')
  }

  set (target, prop, value, receiver) {
    // Prevent sets on ourselves
    if (receiver === this._proxy) throw new Error('Cannot set property')

    // We also get called when instances or children of our prototype are set.
    // For these, disable the prototype chain and try again!
    const proto = Reflect.getPrototypeOf(receiver)
    try {
      Reflect.setPrototypeOf(receiver, Reflect.getPrototypeOf(Object))
      receiver[prop] = value
      return true
    } catch (e) {
      // Can't change prototype? It's the frozen base prototype. Disallow.
      throw new Error('Cannot set property')
    } finally {
      // Set back.
      Reflect.setPrototypeOf(receiver, proto)
    }
  }

  setPrototypeOf (target, prototype) {
    // No changing the prototype! Method table is off limits
    if (!_admin()) throw new Error('setPrototypeOf disabled')

    Reflect.setPrototypeOf(target, prototype)
    Reflect.setPrototypeOf(this._dynamicHandler._innerType.prototype, prototype)
    return true
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Dynamic


/***/ }),
/* 51 */
/***/ (function(module, exports) {

/**
 * queue.js
 *
 * Task queue when async jobs must run in serial
 */

// ------------------------------------------------------------------------------------------------
// SerialTaskQueue
// ------------------------------------------------------------------------------------------------

class SerialTaskQueue {
  constructor () {
    this.tasks = []
  }

  async _enqueue (func) {
    return new Promise((resolve, reject) => {
      this.tasks.push({ func, reject, resolve })
      if (this.tasks.length === 1) this._execNext()
    })
  }

  async _execNext () {
    const next = this.tasks[0]
    try {
      const result = next.func()
      next.resolve(result instanceof Promise ? await result : result)
    } catch (e) {
      next.reject(e)
    } finally {
      this.tasks.shift()
      if (this.tasks.length) this._execNext()
    }
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = SerialTaskQueue


/***/ }),
/* 52 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * capture.js
 *
 * Captures jig and berry state for the cache
 */

const Log = __webpack_require__(2)
const { _assert, _text, _defined } = __webpack_require__(0)
const { _location } = __webpack_require__(8)
const { _sudo } = __webpack_require__(4)
const { _getStateVersion } = __webpack_require__(15)
const Json = __webpack_require__(23)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Capture'

// ------------------------------------------------------------------------------------------------
// _captureJig
// ------------------------------------------------------------------------------------------------

async function _captureJig (jig, commit, outputIndices, deleteIndices, timeout) {
  if (Log._debugOn) Log._debug(TAG, 'Capture', _text(jig))

  const record = commit._record

  const after = commit._after.get(jig)
  _assert(after)

  // Load the previous state's references to use when we don't spend
  const refmap = await commit._buildRefmap(timeout)
  timeout._check()

  const encodeOptions = {
    _encodeJig: (x) => {
      const vout = outputIndices.get(x)
      if (_defined(vout)) return `_o${commit._base.outputs.length + 1 + vout}`

      const vdel = deleteIndices.get(x)
      if (_defined(vdel)) return `_d${vdel}`

      const ref = record._refs._get(x)
      if (ref) return record._before.get(ref)._props.location

      const origin = _sudo(() => x.origin)
      if (origin.startsWith('native://')) return origin

      const beforeRefLocation = refmap[origin] && refmap[origin][0]
      _assert(beforeRefLocation)
      return beforeRefLocation
    }
  }

  // Create the state, which is order-independent
  const state = {}

  // cls
  if (after._cls) state.cls = Json._encode(after._cls, encodeOptions)

  // kind
  state.kind = after._kind

  // props
  const props = Object.assign({}, after._props)
  const vout = outputIndices.get(jig)
  const vdel = deleteIndices.get(jig)
  const localLocation = _defined(vout) ? `_o${commit._base.outputs.length + 1 + vout}` : `_d${vdel}`
  props.location = localLocation
  _assert(!props.origin.startsWith('record://') || props.origin.startsWith(`record://${record._id}`))
  if (props.origin.startsWith(`record://${record._id}`)) props.origin = localLocation
  state.props = Json._encode(props, encodeOptions)

  // src
  if (after._src) state.src = after._src

  // version
  state.version = _getStateVersion(commit._version)

  return state
}

// ------------------------------------------------------------------------------------------------
// _captureBerry
// ------------------------------------------------------------------------------------------------

function _captureBerry (berry, version) {
  // The encoder assumes all referenced jigs are fixed in location and deployed
  const encodeOptions = {
    _encodeJig: (x) => {
      const xLocation = _sudo(() => x.location)
      const loc = _location(xLocation)
      _assert(_defined(loc._txid) && !_defined(loc._record) && !_defined(loc._error))
      return xLocation
    }
  }

  // Create the state, which is order-independent
  const state = {}

  // cls
  state.cls = Json._encode(berry.constructor, encodeOptions)

  // kind
  state.kind = 'berry'

  // props
  const props = _sudo(() => Object.assign({}, berry))
  state.props = Json._encode(props, encodeOptions)

  // version
  state.version = _getStateVersion(version)

  return state
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _captureJig,
  _captureBerry
}


/***/ }),
/* 53 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * sync.js
 *
 * Syncs jigs to their latest state
 */

const bsv = __webpack_require__(5)
const { _assert, _text, _Timeout, _defined, _activeKernel } = __webpack_require__(0)
const Log = __webpack_require__(2)
const { _deepVisit, _deepReplace } = __webpack_require__(14)
const { _sudo } = __webpack_require__(4)
const { _location } = __webpack_require__(8)
const { _extractMetadata } = __webpack_require__(34)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Sync'

// ------------------------------------------------------------------------------------------------
// _sync
// ------------------------------------------------------------------------------------------------

async function _sync (jig, options = {}) {
  const Jig = __webpack_require__(7)
  const Code = __webpack_require__(1)
  const Editor = __webpack_require__(9)

  const Transaction = __webpack_require__(27)
  if (Transaction._ATOMICALLY_UPDATING) throw new Error('sync disabled in atomic update')

  _assert(jig instanceof Jig || jig instanceof Code)

  const kernel = _activeKernel()

  // Setup the options
  options._timeout = options._timeout || new _Timeout('sync', kernel._timeout)
  options._syncing = options._syncing || new Map() // Jig -> Forward Synced

  if (Log._infoOn) Log._info(TAG, 'Sync', _text(jig))

  const start = new Date()

  // Dedup our syncs
  if (options._syncing.has(jig)) return

  // Deploy if not deployed
  if (jig instanceof Code && _sudo(() => _location(jig.location))._undeployed) {
    Editor._get(jig)._deploy()
  }

  // Update this jig to its latest state
  let waitedToPublish = false
  let publishError = null
  async function publishAndSyncForward () {
    try {
      waitedToPublish = await publishPending(jig, options, kernel)
    } catch (e) {
      // If there is an error publishing, syncing may fix so don't throw right away
      publishError = e
    }
    options._timeout._check()

    try {
      // If just published, we don't need to forward sync because its the latest
      if (!waitedToPublish) await forwardSync(jig, options, kernel)
    } catch (e) {
      publishError = publishError || e
    }
    options._timeout._check()

    return jig
  }

  const promise = publishAndSyncForward()
  options._syncing.set(jig, promise)
  options._syncing.set(_sudo(() => jig.origin), promise)
  await promise

  // Update this jig's inner jigs to their latest states
  // If we published, then we don't inner sync by default.
  try {
    await innerSync(jig, options, waitedToPublish)
  } catch (e) {
    if (!publishError) throw e
  }
  options._timeout._check()

  if (publishError) throw publishError

  if (Log._debugOn) Log._debug(TAG, 'Sync (end): ' + (new Date() - start) + 'ms')
}

// ------------------------------------------------------------------------------------------------

async function publishPending (jig, options, kernel) {
  const Commit = __webpack_require__(37)
  let waitedToPublish = false

  while (true) {
    const location = _sudo(() => jig.location)
    const loc = _location(location)
    if (_defined(loc._error)) throw new Error(`Cannot sync\n\n${loc._error}`)
    if (!_defined(loc._record)) break

    if (Log._debugOn) Log._debug(TAG, `Waiting to publish ${_text(jig)}`)
    waitedToPublish = true
    const commit = Commit._findPublishing(loc._record)
    if (!commit) throw new Error(`Cannot sync ${_text(jig)}: transaction in progress`)

    if (Log._debugOn) Log._debug(TAG, 'Sync', commit._record._id)
    await commit._onPublish()

    options._timeout._check()
  }

  kernel._emit('sync', jig)

  return waitedToPublish
}

// ------------------------------------------------------------------------------------------------

async function forwardSync (jig, options, kernel) {
  if (options.forward === false) return

  let location = _sudo(() => jig.location)
  let loc = _location(location)

  while (true) {
    options._timeout._check()

    if (_defined(loc._vdel)) break
    if (_defined(loc._record)) throw new Error(`Cannot sync ${_text(jig)}: transaction in progress`)
    _assert(_defined(loc._txid) && _defined(loc._vout))

    const spendtxid = await kernel._spends(loc._txid, loc._vout)
    if (!spendtxid) break
    options._timeout._check()

    if (Log._infoOn) Log._info(TAG, 'Forward syncing to', spendtxid)

    const rawSpendTx = await kernel._fetch(spendtxid)
    options._timeout._check()
    const spendtx = new bsv.Transaction(rawSpendTx)
    let metadata = null

    // If metadata throws, the transaction is invalid, but we don't break the jig or fail.
    try {
      metadata = _extractMetadata(spendtx)
    } catch (e) {
      if (Log._errorOn) Log._error(TAG, e)
      break
    }

    // Use a replay to update the jig
    const _replay = __webpack_require__(35)
    const published = true
    const jigToSync = jig
    const preverify = false
    await _replay(spendtx, spendtxid, metadata, kernel, published, jigToSync, options._timeout, preverify)
    options._timeout._check()

    // Get the next location, and loop again
    location = _sudo(() => jig.location)
    loc = _location(location)
  }

  kernel._emit('sync', jig)
}

// ------------------------------------------------------------------------------------------------

async function innerSync (jig, options, published) {
  // Don't inner sync if we published and the user didn't explicitely ask to sync inner.
  // This is because the most common sync after an update is to just publish that update.
  if (options.inner === false) return
  if (typeof options.inner === 'undefined' && published) return

  if (Log._debugOn) Log._debug(TAG, 'Inner sync')

  const Jig = __webpack_require__(7)
  const Code = __webpack_require__(1)

  // Get all inner jigs
  const innerJigs = new Set()
  _sudo(() => _deepVisit(jig, x => {
    // Recurse into the current jig
    if (x === jig) return true

    // Dont recurse into inner jigs because they will be synced
    if (x instanceof Jig || x instanceof Code) {
      innerJigs.add(x)
      return false
    }
  }))

  const syncs = []
  const dedups = new Map()

  // Sync all inner jigs
  for (const innerJig of innerJigs) {
    const prev = options._syncing.get(innerJig) || options._syncing.get(_sudo(() => innerJig.origin))
    if (options.forward !== false && prev) {
      dedups.set(innerJig, prev)
    } else {
      syncs.push(innerJig.sync(options))
    }
  }

  // Wait for all inner syncs to finish
  await Promise.all(syncs)
  for (const key of dedups.keys()) { dedups.set(key, await dedups.get(key)) }
  options._timeout._check()

  // When we are syncing forward inner jigs, replace them with ones already synced
  if (options.forward !== false) _sudo(() => _deepReplace(jig, x => dedups.get(x)))
}

// ------------------------------------------------------------------------------------------------

module.exports = _sync


/***/ }),
/* 54 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * api.js
 *
 * External APIs whose implementations may be plugged into the kernel.
 *
 * APIs should not implement consensus-critical logic. These are add-ons to the core.
 */

const { NotImplementedError } = __webpack_require__(11)

// ------------------------------------------------------------------------------------------------
// Blockchain
// ------------------------------------------------------------------------------------------------

/**
 * The API the kernel uses to interface with the blockchain
 */
class Blockchain {
  /**
   * Friendly network string.
   *
   * This is usually one of 'main', 'test', 'stn', or 'mock', however it may be any string.
   * If the network starts with 'main', the Run library will use mainnet settings wherever it
   * matters. For all other networks, Run will use testnet settings.
   *
   * @returns {string} Network string
   */
  get network () { throw new NotImplementedError() }

  /**
   * Submits a transaction to the network
   *
   * @param {string} rawtx Transaction in hex format
   * @returns {string} Transaction ID in hex format
   */
  async broadcast (rawtx) { throw new NotImplementedError() }

  /**
   * Queries the network for a transaction
   *
   * @param {string} txid Transaction ID
   * @returns {string} Transaction in hex format
   */
  async fetch (txid) { throw new NotImplementedError() }

  /**
   * Queries the utxos for a particular output script
   *
   * Often times, implementations will index UTXOs by the script's hash, rather than the
   * original script, especially after Genesis, because script hashes are fixed in length. The
   * script hash is calculated via
   *
   *    sha256(new Script(script).toBuffer()).reverse().toString('hex')
   *
   * We don't pass in a script hash though to support partial compatibility. Blockchain APIs
   * that only support querying for addresses may still be used when we can parse the script.
   *
   * @param {string} script Locking script to query in hex
   * @returns {Array<{txid: string, vout: number, script: string, satoshis: number}>} UTXOs
   */
  async utxos (script) { throw new NotImplementedError() }

  /**
   * Gets the block time that a transaction was confirmed, or the mempool acceptance time if not
   * yet in a block, in milliseconds since the unix epoch.
   *
   * @param {string} txid Transaction ID to check
   * @returns {number} Transaction time in milliseconds since the unix epoch
   */
  async time (txid) { throw new NotImplementedError() }

  /**
   * Gets the transaction that spends the output passed
   *
   * @param {string} txid Transaction ID
   * @param {number} vout Output index
   * @returns {?string} Spending transaction ID, or null if unspent
   */
  async spends (txid, vout) { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Blockchain
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    if (typeof instance.network !== 'string') return false
    if (typeof instance.broadcast !== 'function') return false
    if (typeof instance.fetch !== 'function') return false
    if (typeof instance.utxos !== 'function') return false
    if (typeof instance.time !== 'function') return false
    if (typeof instance.spends !== 'function') return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------
// Cache
// ------------------------------------------------------------------------------------------------

/**
 * API to store jig state, transactions, and other data locally.
 *
 * Keys are specially formatted with a prefix:
 *
 *      tx://<txid>               transaction in hex                        hex string
 *      time://<txid>             transaction time in ms since unix epoch   number
 *      spend://<location>        spending transaction id                   txid string
 *      jig://<location>          jig state at a particular location        <state json>
 *      berry://<location>        berry state at a particular location      <state json>
 *      trust://<txid>            whether a txid should be trusted          true, false, or undefined
 *      ban://<location>          whether a jig should not be loaded        { reason, ?untrusted } if banned, or falsey
 *      config://<key>            local configuration setting               <depends>
 *
 * Configuration keys include:
 *
 *      config://code-filter        StateFilter of code stored in the cache
 *      config://recent-broadcasts  Array of recently broadcasted transaction
 *
 * config:// keys should be preserved over other keys if possible if cache entries are deleted.
 *
 * All values are JSON-serializable. However, they should not be modified or created by hand.
 */
class Cache {
  /**
   * Gets an entry from the cache
   *
   * If this is an LRU cache, get() should also bump the key to the front.
   *
   * @param {string} key Key string
   * @returns JSON-serializable value, or undefined if it does not exist
   */
  async get (key) { throw new NotImplementedError() }

  /**
   * Saves an entry into the cache
   *
   * @param {string} key Jig location to save
   * @param {object} value JSON-serializable value
   */
  async set (key, value) { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Cache
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    if (typeof instance.get !== 'function') return false
    if (typeof instance.set !== 'function') return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------
// Lock
// ------------------------------------------------------------------------------------------------

/**
 * An object that can be turned into a Bitcoin output script
 *
 * Locks may be assigned as owners on jigs to give them non-standard ownership rules. They
 * may be created inside jigs, or passed as arguments to a method. For example:
 *
 *    token.send(new Group(2, pubkeys))
 *
 * Therefore, locks must be serializable. That means no `bsv` library objects may be stored,
 * like bsv.Address, etc. Only simple types that you could save in a Jig.
 *
 * The script property should calculate the output script each time it is called from the
 * properties defined on the object. This lets other code depend on these properties and know
 * the output script is deterministically generated from them.
 */
class Lock {
  /**
   * Gets the locking script hex
   * @returns {string} Script hex
   */
  script () { throw new NotImplementedError() }

  /**
   * Gets an upper bound on the unlocking script size, for calculating purse fees.
   * @returns {number} Maximum unlocking script size in bytes
   */
  domain () { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Lock
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' || !instance) return false

    // Make sure script is a function
    if (typeof instance.constructor.prototype.script !== 'function') return false

    // Make sure the script is not otherwise defined on the object
    if (Object.getOwnPropertyNames(instance).includes('script')) return false

    // Make sure the script returned is a hex string
    const script = instance.script()
    if (script.length % 2 !== 0) return false
    const HEX_CHARS = '01234567890abcdefABCDEF'.split('')
    if (script.split('').some(x => !HEX_CHARS.includes(x))) return false

    // Make sure domain is a function or undefined
    const domain = instance.constructor.prototype.domain
    if (typeof domain !== 'function') return false

    // Make sure domain is not otherwise defined on the object
    if (Object.getOwnPropertyNames(instance).includes('domain')) return false

    // Make sure domain returns a non-negative integer
    if (!Number.isSafeInteger(instance.domain())) return false
    if (instance.domain() < 0) return false

    return true
  }
}

// ------------------------------------------------------------------------------------------------
// Logger
// ------------------------------------------------------------------------------------------------

/**
 * The API the kernel uses to log internal messages.
 *
 * This is a subset of `console`, and wherever logger is used, console may be used instead.
 */
class Logger {
  info (...args) { /* no-op */ }
  debug (...args) { /* no-op */ }
  warn (...args) { /* no-op */ }
  error (...args) { /* no-op */ }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Logger
   */
  static [Symbol.hasInstance] (instance) {
    if (Array.isArray(instance)) return false
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------
// Owner
// ------------------------------------------------------------------------------------------------

/**
 * API used to sign transactions with particular locks
 */
class Owner {
  /**
   * Signs the jig inputs of a transaction.
   *
   * The first two parameters are useful for reconstructing the transaction, and the third may
   * be used to determine which inputs to sign.
   *
   * @param {string} rawtx Transaction to sign in serialized hex format
   * @param {Array<?{satoshis: number, script: string}>} parents Array of UTXOs spent in this
   *    transaction mapped 1-1 with the inputs. If a UTXO is undefined, then Run doesn't know
   *    about this input and/or it is not relevant to the method.
   * @param {Array<?Lock>} locks Array of jig owners. Each jig input will have a lock in this
   *    array. Each lock is essentially a higher-level representation of the script.
   * @returns {string} Signed transaction in raw hex format
   */
  async sign (rawtx, parents, locks) { throw new NotImplementedError() }

  /**
   * Returns the next owner value assigned to new jigs.
   *
   * If an array, then the first owner will be used to create new jigs.
   * @returns {string|Lock|Array<string|Lock>} Address, pubkey, or lock, or an array of them
   */
  async nextOwner () { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Key
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    if (typeof instance.sign !== 'function') return false
    // owner() is deprecated but we still support it in 0.6
    if (typeof instance.nextOwner !== 'function' &&
      typeof instance.owner !== 'function') return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------
// Purse
// ------------------------------------------------------------------------------------------------

/**
 * The API the kernel uses to pay for transactions
 */
class Purse {
  /**
   * Adds inputs and outputs to pay for a transaction, and then signs the tx.
   *
   * The partial transaction passed will likely not be acceptable to miners. It will not have
   * enough fees, and the unlocking scripts for jigs will be placeholders until the tx is signed.
   *
   * @param {string} rawtx Transaction to sign in serialized hex format
   * @param {Array<{satoshis: number, script: string}>} parents Array of spent UTXOs spent in this
   *    transaction mapped 1-1 with the inputs
   * @returns {string} Paid transaction in raw hex format
   */
  async pay (rawtx, parents) { throw new NotImplementedError() }

  /**
   * Request to the purse to broadcast the transaction so that it knows UTXOs were spent.
   *
   * This is called before Blockchain.broadcast(), and any errors will cancel the transaction.
   *
   * This method is optional.
   *
   * @param {string} rawtx Transaction to broadcast in serialized hex
   */
  async broadcast (rawtx) { throw new NotImplementedError() }

  /**
   * Notification that the transaction will not be broadcasted by Run anymore.
   *
   * This method is optional. It also cannot be relied upon 100% of the time to be
   * called after pay(), because the user may export the transaction and broadcast
   * it separately.
   *
   * @param {string} rawtx Transaction which was previously returned from pay()
   */
  async cancel (rawtx) { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of Purse
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    if (typeof instance.pay !== 'function') return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------
// State
// ------------------------------------------------------------------------------------------------

/**
 * API that Run uses to fetch higher-level information about jigs efficiently
 */
class State {
  /**
   * Fetches previously calculated states
   *
   * The protocols that may be fetched are the same as the cache, except for config://.
   *
   * This method is required
   * @param {string} key Cache key to query
   * @param {?object} options Optional parameters to more efficiently query related states
   * @param {?boolean} options.all Whether to also fetch and cache all related state needed to use the state
   * @param {?boolean} options.tx Whether to also fetch and cache corresponding tx:// entries for states
   * @param {?string} options.filter Base64 state filter string to eliminate results when all=true
   * @returns {?object} Stored value, or undefined is missing
   */
  async pull (key, options) { throw new NotImplementedError() }

  /**
   * Returns the UTXO locations for jigs owned by a particular locking script
   *
   * This method is optional
   * @param {string} script UTXO locking script owner hex string
   * @returns {Array<string>} Array of locations for the given script, which may be empty
   */
  async locations (script) { throw new NotImplementedError() }

  /**
   * Called when a transaction is broadcasted so that the state server may index it.
   *
   * This method is optional
   * @param {string} rawtx Hex string for raw transaction
   */
  async broadcast (rawtx) { throw new NotImplementedError() }

  /**
   * @returns {boolean} Whether instance is a valid implementation of State
   */
  static [Symbol.hasInstance] (instance) {
    if (typeof instance !== 'object' && typeof instance !== 'function') return false
    if (!instance) return false
    if (typeof instance.pull !== 'function') return false
    return true
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  Blockchain,
  Cache,
  Lock,
  Logger,
  Owner,
  Purse,
  State
}


/***/ }),
/* 55 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * indexeddb-cache.js
 *
 * A persistent cache for use in the browser
 */

/* global VARIANT */

if (true) {
  const CacheWrapper = __webpack_require__(38)
  const { _browser } = __webpack_require__(29)

  // ----------------------------------------------------------------------------------------------
  // Globals
  // ----------------------------------------------------------------------------------------------

  const DATABASE_NAME = 'run-browser-cache'
  const DATABASE_VERSION = 1
  const DATABASE_STORE = 'run-objects'

  // ----------------------------------------------------------------------------------------------
  // IndexedDbCache
  // ----------------------------------------------------------------------------------------------

  class IndexedDbCache extends CacheWrapper {
    constructor (options = { }) {
      super()

      // Make sure we are running in a browser environment with indexedDB
      if (!_browser() || typeof window.indexedDB === 'undefined') {
        throw new Error('Your browser doesn\'t support IndexedDB')
      }

      // Parse settings
      this._name = typeof options.dbName !== 'undefined' ? options.dbName : DATABASE_NAME
      this._version = typeof options.dbVersion !== 'undefined' ? options.dbVersion : DATABASE_VERSION
      this._store = typeof options.dbStore !== 'undefined' ? options.dbStore : DATABASE_STORE

      // Setup initial cache state
      let dbResolve, dbReject
      this._dbPromise = new Promise((resolve, reject) => { dbResolve = resolve; dbReject = reject })

      // Open the database asyncronously
      const request = window.indexedDB.open(this._name, this._version)
      request.onsuccess = () => dbResolve(request.result)
      request.onerror = () => dbReject(new Error(`Cannot access database: ${request.error.message}`))
      request.onblocked = () => dbReject(new Error('Upgrade not supported'))
      request.onupgradeneeded = event => {
        if (event.oldVersion !== 0) { dbReject(new Error('Upgrade not supported')); return }
        const db = request.result
        db.createObjectStore(this._store)
      }
    }

    async set (key, value) {
    // Open the object store that has all keys
      const db = await this._dbPromise
      const tx = db.transaction(this._store, 'readwrite')
      const objs = tx.objectStore(this._store)

      // Add the value with the key
      return new Promise((resolve, reject) => {
        const request = objs.put(value, key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(request.error)
      })
    }

    async get (key) {
    // Open the object store that has all keys in read-only mode
      const db = await this._dbPromise
      const tx = db.transaction(this._store, 'readonly')
      const objs = tx.objectStore(this._store)

      // Get the value using the key
      return new Promise((resolve, reject) => {
        const request = objs.get(key)
        request.onsuccess = () => resolve(request.result)
        request.onerror = () => resolve(request.error)
      })
    }
  }

  // ----------------------------------------------------------------------------------------------

  module.exports = IndexedDbCache
} else {}


/***/ }),
/* 56 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * local-owner.js
 *
 * Default implementation of the Owner API
 */

const bsv = __webpack_require__(5)
const { PrivateKey, Script, Transaction } = bsv
const { _bsvNetwork, _text } = __webpack_require__(0)
const { _signature, _sighash } = __webpack_require__(12)
const OwnerWrapper = __webpack_require__(46)

// ------------------------------------------------------------------------------------------------
// LocalOwner
// ------------------------------------------------------------------------------------------------

/**
 * An owner that is derived from a local private key
 */
class LocalOwner extends OwnerWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  /**
   * Creates a new LocalOwner
   * @param {?string|PrivateKey} privkey A private key string or object, or undefined to generate
   * @param {?string} network Optional blockchain network to use if generating a privkey
   */
  constructor (privkey, network = undefined) {
    super()

    // Get network if don't have one
    network = network || (__webpack_require__(31).instance && __webpack_require__(31).instance.blockchain.network)
    const bsvNetwork = network && _bsvNetwork(network)

    // Check that the private key passed in is one of our suported types
    if (typeof privkey !== 'undefined' && typeof privkey !== 'string' && !(privkey instanceof PrivateKey)) {
      throw new Error(`Invalid private key: ${_text(privkey)}`)
    }

    // Check the network matches if we've received a private key
    if (bsvNetwork && privkey && privkey instanceof PrivateKey && privkey.network.name !== bsvNetwork) {
      throw new Error('Private key network mismatch')
    }

    // Generate a random key if none is specified
    try {
      this.bsvPrivateKey = new PrivateKey(privkey, bsvNetwork)
    } catch (e) {
      throw new Error(`Invalid private key: ${_text(privkey)}\n\n${e}`)
    }

    // If the private key does not match what's passed in, then it's not a private key
    if (privkey && this.bsvPrivateKey.toString() !== privkey.toString()) {
      throw new Error(`Invalid private key: ${_text(privkey)}`)
    }

    // Setup a bunch of other useful properties
    this.bsvPublicKey = this.bsvPrivateKey.publicKey
    this.bsvAddress = this.bsvPublicKey.toAddress()
    this.privkey = this.bsvPrivateKey.toString()
    this.pubkey = this.bsvPublicKey.toString()
    this.address = this.bsvAddress.toString()
  }

  // --------------------------------------------------------------------------
  // sign
  // --------------------------------------------------------------------------

  async sign (rawtx, parents, locks) {
    const CommonLock = __webpack_require__(44)
    const MainnetGroup = __webpack_require__(47).main.Group
    const TestnetGroup = __webpack_require__(47).test.Group

    const tx = new Transaction(rawtx)

    // Populate previous outputs
    parents.forEach((parent, n) => {
      if (!parent) return

      tx.inputs[n].output = new Transaction.Output({
        satoshis: parent.satoshis,
        script: new Script(parent.script)
      })
    })

    for (let i = 0; i < tx.inputs.length; i++) {
      // Sign P2PKH inputs

      const isCommonLock = locks[i] instanceof CommonLock

      const isPayToPublicKeyHashOut = tx.inputs[i].output &&
        tx.inputs[i].output.script.isPublicKeyHashOut() &&
        tx.inputs[i].output.script.toAddress().toString() === this.address

      if (isCommonLock || isPayToPublicKeyHashOut) {
        const parentScript = new Script(parents[i].script)
        if (parentScript.toAddress().toString() !== this.address) continue

        const sig = await _signature(tx, i, parentScript, parents[i].satoshis, this.bsvPrivateKey)
        const script = Script.fromASM(`${sig} ${this.pubkey}`)
        tx.inputs[i].setScript(script)
      }

      // Sign multi-sig inputs

      const isGroup = (locks[i] instanceof MainnetGroup || locks[i] instanceof TestnetGroup) &&
        locks[i].pubkeys.includes(this.pubkey) &&
        tx.inputs[i].script.chunks.length <= locks[i].required

      if (isGroup) {
        // Get the pubkeys for all existing signatures
        const sigs = tx.inputs[i].script.chunks.slice(1).map(chunk => chunk.buf.toString('hex'))
        const prevout = { script: new bsv.Script(parents[i].script), satoshis: parents[i].satoshis }
        const signedPubkeys = await getSignedPubkeys(tx, i, prevout, sigs, locks[i].pubkeys)

        // If we already signed it, dont sign again
        if (signedPubkeys.includes(this.pubkey)) continue

        // Create a signature
        const parentScript = new Script(parents[i].script)
        const sig = await _signature(tx, i, parentScript, parents[i].satoshis, this.bsvPrivateKey)

        // Add the signature in pubkey order
        const newsigs = locks[i].pubkeys.map(pubkey => {
          const signedPubkeyIndex = signedPubkeys.indexOf(pubkey)
          if (signedPubkeyIndex !== -1) return sigs[signedPubkeyIndex]
          if (pubkey === this.pubkey) return sig
          return null
        }).filter(sig => sig !== null)

        const script = Script.fromASM(`OP_0 ${newsigs.join(' ')}`)
        tx.inputs[i].setScript(script)
      }
    }

    return tx.toString('hex')
  }

  // --------------------------------------------------------------------------
  // nextOwner
  // --------------------------------------------------------------------------

  async nextOwner () { return this.address }
}

// ------------------------------------------------------------------------------------------------
// getSignedPubkeys
// ------------------------------------------------------------------------------------------------

async function getSignedPubkeys (tx, vin, prevout, sigs, pubkeys) {
  const sighashType = bsv.crypto.Signature.SIGHASH_ALL | bsv.crypto.Signature.SIGHASH_FORKID
  const satoshisBN = new bsv.crypto.BN(prevout.satoshis)
  const hashbuf = await _sighash(tx, sighashType, vin, prevout.script, satoshisBN)
  const bsvpubkeys = pubkeys.map(pubkey => new bsv.PublicKey(pubkey))

  // Get the index of each sig
  const nsigs = sigs.map(sig => {
    const sighex = sig.slice(0, sig.length - 2)
    const sigbuf = bsv.deps.Buffer.from(sighex, 'hex')
    const bsvsig = bsv.crypto.Signature.fromDER(sigbuf)
    return bsvpubkeys.findIndex(pubkey => bsv.crypto.ECDSA.verify(hashbuf, bsvsig, pubkey, 'little'))
  })

  const badSigIndex = nsigs.findIndex(n => n === -1)
  if (badSigIndex !== -1) throw new Error(`Bad signature at index ${badSigIndex}`)

  return nsigs.map(n => pubkeys[n])
}

// ------------------------------------------------------------------------------------------------

LocalOwner._getSignedPubkeys = getSignedPubkeys

module.exports = LocalOwner


/***/ }),
/* 57 */
/***/ (function(module, exports, __webpack_require__) {

const Editor = __webpack_require__(9)
const Rules = __webpack_require__(22)
const Membrane = __webpack_require__(19)
const Sandbox = __webpack_require__(6)
const { _sudo } = __webpack_require__(4)
const Json = __webpack_require__(23)
const { _parentName, _setOwnProperty, _JIGS, _BERRIES } = __webpack_require__(0)
const { _location, _compileLocation } = __webpack_require__(8)
const { _parseStateVersion } = __webpack_require__(15)

function recreateJigsFromStates (states) {
  const shells = {}

  const keys = {}

  for (const [key, state] of Object.entries(states)) {
    if (!key.startsWith('jig://') && !key.startsWith('berry://')) {
      continue
    }

    const location = key.split('://')[1]

    _location(location)

    _parseStateVersion(state.version)

    keys[location] = key
    shells[location] = createJigShell(location, state)
  }

  for (const [location, shell] of Object.entries(shells)) {
    hydrateJigShell(shell, location, states[keys[location]], shells)
  }

  return shells
}

function createJigShell (location, state) {
  switch (state.kind) {
    case 'code': return createCodeShell(location, state)
    case 'jig': return createInstanceShell(location, state)
    case 'berry': return createBerryShell(location, state)
    default: throw new Error(`Unknown kind: ${state.kind}`)
  }
}

function createCodeShell (location, state) {
  const C = Editor._createCode()
  _sudo(() => { C.location = location })
  return C
}

function createInstanceShell (location, state) {
  const initialized = true
  const props = new Sandbox._intrinsics.Object()
  const rules = Rules._jigObject(initialized)
  const jig = new Membrane(props, rules)
  _JIGS.add(jig)
  return jig
}

function createBerryShell (location, state) {
  const initialized = true
  const props = new Sandbox._intrinsics.Object()
  const rules = Rules._berryObject(initialized)
  const berry = new Membrane(props, rules)
  _BERRIES.add(berry)
}

function hydrateJigShell (shell, location, state, jigs) {
  switch (state.kind) {
    case 'code': hydrateCodeShell(shell, location, state, jigs); break
    case 'jig': hydrateInstanceShell(shell, location, state, jigs); break
    case 'berry': hydrateBerryShell(shell, location, state, jigs); break
    default: throw new Error(`Unknown kind: ${state.kind}`)
  }
}

function hydrateCodeShell (shell, location, state, jigs) {
  const txid = location.split('_')[0]

  const props = Json._decode(state.props, {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: partialLocation => {
      const parts = _location(partialLocation)
      if (parts._native) {
        const C = Editor._lookupNativeCodeByName(parts._native)
        if (!C) throw new Error(`Native code not found: ${parts._native}`)
        return C
      }
      const fullLocation = _compileLocation(Object.assign({ _txid: txid }, parts))
      if (!(fullLocation in jigs)) throw new Error(`Missing ref: ${fullLocation}`)
      return jigs[fullLocation]
    }
  })

  const env = {}

  // Setup the parent class if there is one
  const parentName = _parentName(state.src)
  if (parentName) {
    const parentLocation = props.deps[parentName].location
    const parts = _location(parentLocation)
    let Parent = null
    if (parts._native) {
      Parent = Editor._lookupNativeCodeByName(parts._native)
    } else {
      const parentFullLocation = _compileLocation(Object.assign({ _txid: txid }, parts))
      Parent = jigs[parentFullLocation]
    }
    if (!Parent) throw new Error(`Missing parent: ${parentLocation}`)
    env[parentName] = Parent
  }

  // Sandbox and load the code
  const T = Sandbox._evaluate(state.src, env)[0]
  const [S, SGlobal] = Editor._makeSandbox(shell, T)
  const local = false
  Editor._get(shell)._install(S, local)

  // Apply the now loaded props to the code
  _sudo(() => {
    // Delete all the existing keys first. Particularly bindings. Otherwise, ordering bugs.
    Object.keys(shell).forEach(key => { delete shell[key] })
    Object.keys(props).forEach(key => _setOwnProperty(shell, key, props[key]))
  })

  // Apply final bindings to the code
  _sudo(() => {
    shell.location = _compileLocation(Object.assign({ _txid: txid }, _location(shell.location)))
    shell.origin = _compileLocation(Object.assign({ _txid: txid }, _location(shell.origin)))
  })

  // Make the deps update the globals in the sandbox as we'd expect
  _sudo(() => {
    const deps = Editor._makeDeps(shell, SGlobal, shell.deps)
    _setOwnProperty(shell, 'deps', deps)
    // Update the globals with the new dependencies using the new deps wrapper.
    Object.keys(props.deps || {}).forEach(prop => {
      shell.deps[prop] = props.deps[prop]
    })
  })
}

function hydrateInstanceShell (shell, location, state, jigs) {
  const txid = location.split('_')[0]

  const props = Json._decode(state.props, {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: partialLocation => {
      const parts = _location(partialLocation)
      if (parts._native) {
        const C = Editor._lookupNativeCodeByName(parts._native)
        if (!C) throw new Error(`Native code not found: ${parts._native}`)
        return C
      }
      const fullLocation = _compileLocation(Object.assign({ _txid: txid }, parts))
      if (!(fullLocation in jigs)) throw new Error(`Missing ref: ${location}`)
      return jigs[fullLocation]
    }
  })

  // Assign the class onto the jig
  const C = jigs[state.cls.$jig]
  if (!C) throw new Error(`Missing ref: ${state.cls.$jig}`)
  _sudo(() => Object.setPrototypeOf(shell, C.prototype))

  // Apply now loaded props to the jig
  _sudo(() => {
    Object.keys(props).forEach(key => {
      _setOwnProperty(shell, key, props[key])
    })
  })

  // Apply final bindings to the jig
  _sudo(() => {
    shell.location = _compileLocation(Object.assign({ _txid: txid }, _location(shell.location)))
    shell.origin = _compileLocation(Object.assign({ _txid: txid }, _location(shell.origin)))
  })
}

function hydrateBerryShell (shell, location, state, jigs) {
  const txid = location.split('_')[0]

  const props = Json._decode(state.props, {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: partialLocation => {
      const parts = _location(partialLocation)
      if (parts._native) {
        const C = Editor._lookupNativeCodeByName(parts._native)
        if (!C) throw new Error(`Native code not found: ${parts._native}`)
        return C
      }
      const fullLocation = _compileLocation(Object.assign({ _txid: txid }, parts))
      if (!(fullLocation in jigs)) throw new Error(`Missing ref: ${location}`)
      return jigs[fullLocation]
    }
  })

  // Assign the class onto the berry
  const B = jigs[state.cls.$jig]
  if (!B) throw new Error(`Missing ref: ${state.cls.$jig}`)
  _sudo(() => Object.setPrototypeOf(shell, B.prototype))

  // Apply now loaded props to the berry
  _sudo(() => {
    Object.keys(props).forEach(key => {
      _setOwnProperty(shell, key, props[key])
    })
  })
}

module.exports = recreateJigsFromStates


/***/ }),
/* 58 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * recent-broadcasts.js
 *
 * A data structure stored in the cache that keeps track of recently broadcasted transactions
 * in order to correct UTXOs returned from a server that might have delayed indexing.
 *
 * The recent broadcasts are stored in the cache under config://recent-broadcasts as an array
 * with the following structure:
 *
 *    [
 *      {
 *        txid: string,
 *        time: number,
 *        inputs: [{ txid: string, vout: number }],
 *        outputs: [{ txid: string, vout: number, script: string, satoshis: number }]
 *      }
 *    ]
 */

const { _filterInPlace } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const DEFAULT_UTXO_INDEXING_DELAY = 10000

const CONFIG_KEY_RECENT_BROADCASTS = 'config://recent-broadcasts'

// ------------------------------------------------------------------------------------------------
// _addToCache
// ------------------------------------------------------------------------------------------------

async function _addToCache (cache, bsvtx, txid, expiration = DEFAULT_UTXO_INDEXING_DELAY) {
  const recentBroadcasts = await cache.get(CONFIG_KEY_RECENT_BROADCASTS) || []
  _removeExpired(recentBroadcasts, expiration)
  _add(recentBroadcasts, bsvtx, txid)
  await cache.set(CONFIG_KEY_RECENT_BROADCASTS, recentBroadcasts)
}

// ------------------------------------------------------------------------------------------------
// _correctUtxosUsingCache
// ------------------------------------------------------------------------------------------------

async function _correctUtxosUsingCache (cache, utxos, script, expiration = DEFAULT_UTXO_INDEXING_DELAY) {
  const recentBroadcasts = await cache.get(CONFIG_KEY_RECENT_BROADCASTS)
  if (!recentBroadcasts) return
  _removeExpired(recentBroadcasts, expiration)
  _correctUtxos(recentBroadcasts, utxos, script)
}

// ------------------------------------------------------------------------------------------------
// _add
// ------------------------------------------------------------------------------------------------

function _add (recentBroadcasts, bsvtx, txid) {
  const inputs = bsvtx.inputs.map(input => {
    return {
      txid: input.prevTxId.toString('hex'),
      vout: input.outputIndex
    }
  })

  const outputs = bsvtx.outputs.map((output, vout) => {
    const script = output.script.toHex()
    const satoshis = output.satoshis
    return { txid, vout, script, satoshis }
  })

  const rawtx = bsvtx.toString()

  const recentTx = { rawtx, txid, time: Date.now(), inputs, outputs }

  recentBroadcasts.push(recentTx)
}

// ------------------------------------------------------------------------------------------------
// _correctUtxos
// ------------------------------------------------------------------------------------------------

function _correctUtxos (recentBroadcasts, utxos, script) {
  // Add all utxos from our recent broadcasts for this script that aren't already there
  recentBroadcasts.forEach(tx => {
    tx.outputs.forEach(output => {
      if (output.script !== script) return
      if (utxos.some(utxo => utxo.txid === output.txid && utxo.vout === output.vout)) return
      utxos.push(output)
    })
  })

  // Remove all utxos that we know are spent because they are in our broadcast cache
  _filterInPlace(utxos, utxo => {
    return !recentBroadcasts.some(tx => tx.inputs.some(input => input.txid === utxo.txid && input.vout === utxo.vout))
  })
}

// ------------------------------------------------------------------------------------------------
// _removeExpired
// ------------------------------------------------------------------------------------------------

function _removeExpired (recentBroadcasts, expiration = DEFAULT_UTXO_INDEXING_DELAY) {
  _filterInPlace(recentBroadcasts, tx => Date.now() - tx.time < expiration)
}

// ------------------------------------------------------------------------------------------------

module.exports = {
  _addToCache,
  _correctUtxosUsingCache,
  _add,
  _correctUtxos,
  _removeExpired
}


/***/ }),
/* 59 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * run-connect.js
 *
 * Run Connect Blockchain API that can be used as both a Blockchain implementation
 */

const { _scripthash } = __webpack_require__(12)
const request = __webpack_require__(18)
const BlockchainWrapper = __webpack_require__(41)
const { _RequestError } = request

// ------------------------------------------------------------------------------------------------
// RunConnect
// ------------------------------------------------------------------------------------------------

class RunConnect extends BlockchainWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  /**
   * @param {?object} options Optional configurations options
   * @param {?string} options.network Network string. Defaults to main.
   */
  constructor(options = {}) {
    super()

    this.api = 'run'
    // this.host = 'https://api.run.network'  // deprecated
    this.host = options.host

    this.network = _parseNetwork(options.network)
    this.request = request
  }

  // --------------------------------------------------------------------------
  // broadcast
  // --------------------------------------------------------------------------

  async broadcast(rawtx) {
    const url = `${this.host}/v1/${this.network}/tx`
    const options = { method: 'POST', body: { rawtx } }
    const txid = await this.request(url, options)
    return txid
  }

  // --------------------------------------------------------------------------
  // fetch
  // --------------------------------------------------------------------------

  async fetch(txid) {
    const url = `${this.host}/v1/${this.network}/rawtx/${txid}`
    const resp = await this.request(url)
    return resp.toString('hex')
  }

  // --------------------------------------------------------------------------
  // utxos
  // --------------------------------------------------------------------------

  async utxos(script) {
    const scripthash = await _scripthash(script)
    const url = `${this.host}/v1/${this.network}/utxos/${scripthash}`
    const utxos = await this.request(url, { cache: 1000 })
    return utxos
  }

  // --------------------------------------------------------------------------
  // time
  // --------------------------------------------------------------------------

  async time(txid) {
    const url = `${this.host}/v1/${this.network}/tx/${txid}`
    const options = { cache: 1000 }
    const json = await this.request(url, options)
    if (this.cache) {
      const cacheSets = []
      cacheSets.push(this.cache.set(`tx://${txid}`, json.hex))
      json.vout.forEach((x, n) => { if (x.spentTxId) cacheSets.push(this.cache.set(`spend://${txid}_o${n}`, x.spentTxId)) })
      await Promise.all(cacheSets)
    }
    return json.time * 1000 || Date.now()
  }

  // --------------------------------------------------------------------------
  // spends
  // --------------------------------------------------------------------------

  async spends(txid, vout) {
    try {
      const url = `${this.host}/v1/${this.network}/spends/${txid}_o${vout}`
      const json = await this.request(url)
      return json.spentTxId
    } catch (e) {
      if (e instanceof _RequestError && e.status === 404) return null
      throw e
    }
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function _parseNetwork(network) {
  if (typeof network === 'undefined') return 'main'
  if (typeof network !== 'string') throw new Error(`Invalid network: ${network}`)
  if (network !== 'main' && network !== 'test') throw new Error(`RunConnect API does not support the "${network}" network`)
  return network
}

// ------------------------------------------------------------------------------------------------

module.exports = RunConnect


/***/ }),
/* 60 */
/***/ (function(module, exports, __webpack_require__) {

/* WEBPACK VAR INJECTION */(function(global) {/**
 * index.js
 *
 * Primary library export, environment checks, and global sets
 */

// Environment checks
__webpack_require__(29)._check()

const bsv = __webpack_require__(5)
const Run = __webpack_require__(31)
const { _patchBsv } = __webpack_require__(12)
const { _defineGetter } = __webpack_require__(0)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

global.Jig = Run.Jig
global.Berry = Run.Berry

// Preinstalled extras are defined with getters to facilitate code coverage
_defineGetter(global, 'Token', () => { return Run.extra.Token })

// ------------------------------------------------------------------------------------------------
// Patch BSV
// ------------------------------------------------------------------------------------------------

_patchBsv(bsv)

// ------------------------------------------------------------------------------------------------

module.exports = Run

/* WEBPACK VAR INJECTION */}.call(this, __webpack_require__(42)))

/***/ }),
/* 61 */
/***/ (function(module) {

module.exports = JSON.parse("\"!function(t,o){\\\"object\\\"==typeof exports&&\\\"undefined\\\"!=typeof module?o(exports):\\\"function\\\"==typeof define&&define.amd?define([\\\"exports\\\"],o):o((t=t||self).SES={})}(this,(function(t){\\\"use strict\\\";function o(t,o){if(!t)throw new TypeError(o)}const{getPrototypeOf:r}=Object;const{getOwnPropertyDescriptor:e,getPrototypeOf:n}=Object;function a(t){return n(t).constructor}const i=[\\\"Array\\\",\\\"ArrayBuffer\\\",\\\"ArrayBufferPrototype\\\",\\\"ArrayIteratorPrototype\\\",\\\"ArrayPrototype\\\",\\\"AsyncFunction\\\",\\\"AsyncFunctionPrototype\\\",\\\"AsyncGenerator\\\",\\\"AsyncGeneratorFunction\\\",\\\"AsyncGeneratorPrototype\\\",\\\"AsyncIteratorPrototype\\\",\\\"Atomics\\\",\\\"BigInt\\\",\\\"BigIntPrototype\\\",\\\"BigInt64Array\\\",\\\"BigInt64ArrayPrototype\\\",\\\"BigUint64Array\\\",\\\"BigUint64ArrayPrototype\\\",\\\"Boolean\\\",\\\"BooleanPrototype\\\",\\\"DataView\\\",\\\"DataViewPrototype\\\",\\\"Date\\\",\\\"DatePrototype\\\",\\\"decodeURI\\\",\\\"decodeURIComponent\\\",\\\"encodeURI\\\",\\\"encodeURIComponent\\\",\\\"Error\\\",\\\"ErrorPrototype\\\",\\\"eval\\\",\\\"EvalError\\\",\\\"EvalErrorPrototype\\\",\\\"Float32Array\\\",\\\"Float32ArrayPrototype\\\",\\\"Float64Array\\\",\\\"Float64ArrayPrototype\\\",\\\"Function\\\",\\\"FunctionPrototype\\\",\\\"Generator\\\",\\\"GeneratorFunction\\\",\\\"GeneratorPrototype\\\",\\\"Int8Array\\\",\\\"Int8ArrayPrototype\\\",\\\"Int16Array\\\",\\\"Int16ArrayPrototype\\\",\\\"Int32Array\\\",\\\"Int32ArrayPrototype\\\",\\\"isFinite\\\",\\\"isNaN\\\",\\\"IteratorPrototype\\\",\\\"JSON\\\",\\\"Map\\\",\\\"MapIteratorPrototype\\\",\\\"MapPrototype\\\",\\\"Math\\\",\\\"Number\\\",\\\"NumberPrototype\\\",\\\"Object\\\",\\\"ObjectPrototype\\\",\\\"parseFloat\\\",\\\"parseInt\\\",\\\"Promise\\\",\\\"PromisePrototype\\\",\\\"Proxy\\\",\\\"RangeError\\\",\\\"RangeErrorPrototype\\\",\\\"ReferenceError\\\",\\\"ReferenceErrorPrototype\\\",\\\"Reflect\\\",\\\"RegExp\\\",\\\"RegExpPrototype\\\",\\\"RegExpStringIteratorPrototype\\\",\\\"Set\\\",\\\"SetIteratorPrototype\\\",\\\"SetPrototype\\\",\\\"SharedArrayBuffer\\\",\\\"SharedArrayBufferPrototype\\\",\\\"String\\\",\\\"StringIteratorPrototype\\\",\\\"StringPrototype\\\",\\\"Symbol\\\",\\\"SymbolPrototype\\\",\\\"SyntaxError\\\",\\\"SyntaxErrorPrototype\\\",\\\"ThrowTypeError\\\",\\\"TypedArray\\\",\\\"TypedArrayPrototype\\\",\\\"TypeError\\\",\\\"TypeErrorPrototype\\\",\\\"Uint8Array\\\",\\\"Uint8ArrayPrototype\\\",\\\"Uint8ClampedArray\\\",\\\"Uint8ClampedArrayPrototype\\\",\\\"Uint16Array\\\",\\\"Uint16ArrayPrototype\\\",\\\"Uint32Array\\\",\\\"Uint32ArrayPrototype\\\",\\\"URIError\\\",\\\"URIErrorPrototype\\\",\\\"WeakMap\\\",\\\"WeakMapPrototype\\\",\\\"WeakSet\\\",\\\"WeakSetPrototype\\\",\\\"escape\\\",\\\"unescape\\\",\\\"FunctionPrototypeConstructor\\\",\\\"Compartment\\\",\\\"CompartmentPrototype\\\",\\\"harden\\\"],{getOwnPropertyDescriptor:c}=Object;function p(t,r){const e=c(t,r);return o(!(\\\"get\\\"in e||\\\"set\\\"in e),`unexpected accessor on global property: ${r}`),e.value}const{apply:s}=Reflect,y=(t=>(o,...r)=>s(t,o,r))(Object.prototype.hasOwnProperty);function l(){const t={__proto__:null},c=function(){const t=Function.prototype.constructor,o=typeof Symbol&&Symbol.iterator||\\\"@@iterator\\\",r=typeof Symbol&&Symbol.matchAll||\\\"@@matchAll\\\",i=e(arguments,\\\"callee\\\").get,c=(new String)[o](),p=n(c);let s=null,y=null;r in new RegExp&&(s=(new RegExp)[r](),y=n(s));const l=(new Array)[o](),u=n(l),g=n(Float32Array),f=(new Map)[o](),P=n(f),b=(new Set)[o](),m=n(b),d=n(u);function*h(){}const A=a(h),E=A.prototype;async function*S(){}const _=a(S),w=_.prototype,I=w.prototype,F=n(I);async function T(){}const v=a(T),O={FunctionPrototypeConstructor:t,ArrayIteratorPrototype:u,AsyncFunction:v,AsyncGenerator:w,AsyncGeneratorFunction:_,AsyncGeneratorPrototype:I,AsyncIteratorPrototype:F,Generator:E,GeneratorFunction:A,IteratorPrototype:d,MapIteratorPrototype:P,RegExpStringIteratorPrototype:y,SetIteratorPrototype:m,StringIteratorPrototype:p,ThrowTypeError:i,TypedArray:g};return O}();!function(t){const{FunctionPrototypeConstructor:e,ArrayIteratorPrototype:n,AsyncFunction:a,AsyncGenerator:i,AsyncGeneratorFunction:c,AsyncGeneratorPrototype:p,AsyncIteratorPrototype:s,Generator:y,GeneratorFunction:l,IteratorPrototype:u,MapIteratorPrototype:g,RegExpStringIteratorPrototype:f,SetIteratorPrototype:P,StringIteratorPrototype:b,ThrowTypeError:m,TypedArray:d}=t;o(r(m)===Function.prototype,\\\"ThrowTypeError.__proto__ should be Function.prototype\\\"),o(r(b)===u,\\\"StringIteratorPrototype.__proto__ should be IteratorPrototype\\\"),f&&o(r(f)===u,\\\"RegExpStringIteratorPrototype.__proto__ should be IteratorPrototype\\\"),o(r(d)===Function.prototype,\\\"TypedArray.__proto__ should be Function.prototype\\\"),o(r(g)===u,\\\"MapIteratorPrototype.__proto__ should be IteratorPrototype\\\"),o(r(P)===u,\\\"SetIteratorPrototype.__proto__ should be IteratorPrototype\\\"),o(r(u)===Object.prototype,\\\"IteratorPrototype.__proto__ should be Object.prototype\\\"),o(r(s)===Object.prototype,\\\"AsyncIteratorPrototype.__proto__ should be Object.prototype\\\"),o(r(n)===u,\\\"AsyncIteratorPrototype.__proto__ should be IteratorPrototype\\\"),o(r(l)===e,\\\"GeneratorFunction.__proto__ should be Function\\\"),o(\\\"GeneratorFunction\\\"===l.name,'GeneratorFunction.name should be \\\"GeneratorFunction\\\"'),o(r(y)===Function.prototype,\\\"Generator.__proto__ should be Function.prototype\\\"),o(r(c)===e,\\\"AsyncGeneratorFunction.__proto__ should be Function\\\"),o(\\\"AsyncGeneratorFunction\\\"===c.name,'AsyncGeneratorFunction.name should be \\\"AsyncGeneratorFunction\\\"'),o(r(i)===Function.prototype,\\\"AsyncGenerator.__proto__ should be Function.prototype\\\"),o(r(p)===s,\\\"AsyncGeneratorPrototype.__proto__ should be AsyncIteratorPrototype\\\"),o(r(a)===e,\\\"AsyncFunction.__proto__ should be Function\\\"),o(\\\"AsyncFunction\\\"===a.name,'AsyncFunction.name should be \\\"AsyncFunction\\\"')}(c);for(const o of i){if(y(c,o)){t[o]=c[o];continue}if(y(globalThis,o)){t[o]=p(globalThis,o);continue}if(o.endsWith(\\\"Prototype\\\")){const r=o.slice(0,-\\\"Prototype\\\".length);if(y(c,r)){const e=c[r];t[o]=e.prototype;continue}if(y(globalThis,r)){const e=p(globalThis,r);t[o]=e.prototype;continue}}}return function(t){Object.keys(t).forEach(o=>{if(void 0===t[o])throw new TypeError(`Malformed intrinsic: ${o}`)})}(t),t}const u={\\\"**proto**\\\":\\\"FunctionPrototype\\\",length:\\\"number\\\",name:\\\"string\\\"},g=u,f={get:g,set:\\\"undefined\\\"};function P(t){return{\\\"**proto**\\\":\\\"Error\\\",prototype:t,length:\\\"number\\\",name:\\\"string\\\"}}function b(t){return{\\\"**proto**\\\":\\\"ErrorPrototype\\\",constructor:t,message:\\\"string\\\",name:\\\"string\\\",toString:g}}function m(t){return{\\\"**proto**\\\":\\\"TypedArray\\\",length:\\\"number\\\",name:\\\"string\\\",BYTES_PER_ELEMENT:\\\"number\\\",prototype:t}}function d(t){return{\\\"**proto**\\\":\\\"TypedArrayPrototype\\\",BYTES_PER_ELEMENT:\\\"number\\\",constructor:t}}var h=function(t){return(typeof Symbol&&Symbol.matchAll||\\\"@@matchAll\\\")in new RegExp||delete t.RegExpStringIteratorPrototype,t}({\\\"**proto**\\\":null,ThrowTypeError:g,Infinity:\\\"number\\\",NaN:\\\"number\\\",undefined:\\\"undefined\\\",eval:g,isFinite:g,isNaN:g,parseFloat:g,parseInt:g,decodeURI:g,decodeURIComponent:g,encodeURI:g,encodeURIComponent:g,Object:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",assign:g,create:g,defineProperties:g,defineProperty:g,entries:g,freeze:g,fromEntries:g,getOwnPropertyDescriptor:g,getOwnPropertyDescriptors:g,getOwnPropertyNames:g,getOwnPropertySymbols:g,getPrototypeOf:g,is:g,isExtensible:g,isFrozen:g,isSealed:g,keys:g,preventExtensions:g,prototype:\\\"ObjectPrototype\\\",seal:g,setPrototypeOf:g,values:g},ObjectPrototype:{\\\"**proto**\\\":null,constructor:\\\"Object\\\",hasOwnProperty:g,isPrototypeOf:g,propertyIsEnumerable:g,toLocaleString:g,toString:g,valueOf:g,__defineGetter__:g,__defineSetter__:g,__lookupGetter__:g,__lookupSetter__:g},Function:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",length:\\\"number\\\",prototype:\\\"FunctionPrototype\\\"},FunctionPrototype:{length:\\\"number\\\",name:\\\"string\\\",apply:g,bind:g,call:g,constructor:\\\"FunctionPrototypeConstructor\\\",toString:g,\\\"@@hasInstance\\\":g},Boolean:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"BooleanPrototype\\\"},BooleanPrototype:{constructor:\\\"Boolean\\\",toString:g,valueOf:g},Symbol:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",asyncIterator:\\\"symbol\\\",for:g,hasInstance:\\\"symbol\\\",isConcatSpreadable:\\\"symbol\\\",iterator:\\\"symbol\\\",keyFor:g,match:\\\"symbol\\\",matchAll:\\\"symbol\\\",prototype:\\\"SymbolPrototype\\\",replace:\\\"symbol\\\",search:\\\"symbol\\\",species:\\\"symbol\\\",split:\\\"symbol\\\",toPrimitive:\\\"symbol\\\",toStringTag:\\\"symbol\\\",unscopables:\\\"symbol\\\"},SymbolPrototype:{constructor:\\\"Symbol\\\",description:f,toString:g,valueOf:g,\\\"@@toPrimitive\\\":g,\\\"@@toStringTag\\\":\\\"string\\\"},Error:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"ErrorPrototype\\\",captureStackTrace:g,stackTraceLimit:\\\"number\\\"},ErrorPrototype:{constructor:\\\"Error\\\",message:\\\"string\\\",name:\\\"string\\\",toString:g},EvalError:P(\\\"EvalErrorPrototype\\\"),RangeError:P(\\\"RangeErrorPrototype\\\"),ReferenceError:P(\\\"ReferenceErrorPrototype\\\"),SyntaxError:P(\\\"SyntaxErrorPrototype\\\"),TypeError:P(\\\"TypeErrorPrototype\\\"),URIError:P(\\\"URIErrorPrototype\\\"),EvalErrorPrototype:b(\\\"EvalError\\\"),RangeErrorPrototype:b(\\\"RangeError\\\"),ReferenceErrorPrototype:b(\\\"ReferenceError\\\"),SyntaxErrorPrototype:b(\\\"SyntaxError\\\"),TypeErrorPrototype:b(\\\"TypeError\\\"),URIErrorPrototype:b(\\\"URIError\\\"),Number:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",EPSILON:\\\"number\\\",isFinite:g,isInteger:g,isNaN:g,isSafeInteger:g,MAX_SAFE_INTEGER:\\\"number\\\",MAX_VALUE:\\\"number\\\",MIN_SAFE_INTEGER:\\\"number\\\",MIN_VALUE:\\\"number\\\",NaN:\\\"number\\\",NEGATIVE_INFINITY:\\\"number\\\",parseFloat:g,parseInt:g,POSITIVE_INFINITY:\\\"number\\\",prototype:\\\"NumberPrototype\\\"},NumberPrototype:{constructor:\\\"Number\\\",toExponential:g,toFixed:g,toLocaleString:g,toPrecision:g,toString:g,valueOf:g},BigInt:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",asIntN:g,asUintN:g,prototype:\\\"BigIntPrototype\\\"},BigIntPrototype:{constructor:\\\"BigInt\\\",toLocaleString:g,toString:g,valueOf:g,\\\"@@toStringTag\\\":\\\"string\\\"},Math:{E:\\\"number\\\",LN10:\\\"number\\\",LN2:\\\"number\\\",LOG10E:\\\"number\\\",LOG2E:\\\"number\\\",PI:\\\"number\\\",SQRT1_2:\\\"number\\\",SQRT2:\\\"number\\\",\\\"@@toStringTag\\\":\\\"string\\\",abs:g,acos:g,acosh:g,asin:g,asinh:g,atan:g,atanh:g,atan2:g,cbrt:g,ceil:g,clz32:g,cos:g,cosh:g,exp:g,expm1:g,floor:g,fround:g,hypot:g,imul:g,log:g,log1p:g,log10:g,log2:g,max:g,min:g,pow:g,random:g,round:g,sign:g,sin:g,sinh:g,sqrt:g,tan:g,tanh:g,trunc:g},Date:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",now:g,parse:g,prototype:\\\"DatePrototype\\\",UTC:g},DatePrototype:{constructor:\\\"Date\\\",getDate:g,getDay:g,getFullYear:g,getHours:g,getMilliseconds:g,getMinutes:g,getMonth:g,getSeconds:g,getTime:g,getTimezoneOffset:g,getUTCDate:g,getUTCDay:g,getUTCFullYear:g,getUTCHours:g,getUTCMilliseconds:g,getUTCMinutes:g,getUTCMonth:g,getUTCSeconds:g,setDate:g,setFullYear:g,setHours:g,setMilliseconds:g,setMinutes:g,setMonth:g,setSeconds:g,setTime:g,setUTCDate:g,setUTCFullYear:g,setUTCHours:g,setUTCMilliseconds:g,setUTCMinutes:g,setUTCMonth:g,setUTCSeconds:g,toDateString:g,toISOString:g,toJSON:g,toLocaleDateString:g,toLocaleString:g,toLocaleTimeString:g,toString:g,toTimeString:g,toUTCString:g,valueOf:g,\\\"@@toPrimitive\\\":g,getYear:g,setYear:g,toGMTString:g},String:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",fromCharCode:g,fromCodePoint:g,prototype:\\\"StringPrototype\\\",raw:g},StringPrototype:{length:\\\"number\\\",charAt:g,charCodeAt:g,codePointAt:g,concat:g,constructor:\\\"String\\\",endsWith:g,includes:g,indexOf:g,lastIndexOf:g,localeCompare:g,match:g,matchAll:g,normalize:g,padEnd:g,padStart:g,repeat:g,replace:g,search:g,slice:g,split:g,startsWith:g,substring:g,toLocaleLowerCase:g,toLocaleUpperCase:g,toLowerCase:g,toString:g,toUpperCase:g,trim:g,trimEnd:g,trimStart:g,valueOf:g,\\\"@@iterator\\\":g,substr:g,anchor:g,big:g,blink:g,bold:g,fixed:g,fontcolor:g,fontsize:g,italics:g,link:g,small:g,strike:g,sub:g,sup:g,trimLeft:g,trimRight:g},StringIteratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",next:g,\\\"@@toStringTag\\\":\\\"string\\\"},RegExp:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"RegExpPrototype\\\",\\\"@@species\\\":f},RegExpPrototype:{constructor:\\\"RegExp\\\",exec:g,dotAll:f,flags:f,global:f,ignoreCase:f,\\\"@@match\\\":g,\\\"@@matchAll\\\":g,multiline:f,\\\"@@replace\\\":g,\\\"@@search\\\":g,source:f,\\\"@@split\\\":g,sticky:f,test:g,toString:g,unicode:f,compile:!1},RegExpStringIteratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",next:g,\\\"@@toStringTag\\\":\\\"string\\\"},Array:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",from:g,isArray:g,of:g,prototype:\\\"ArrayPrototype\\\",\\\"@@species\\\":f},ArrayPrototype:{length:\\\"number\\\",concat:g,constructor:\\\"Array\\\",copyWithin:g,entries:g,every:g,fill:g,filter:g,find:g,findIndex:g,flat:g,flatMap:g,forEach:g,includes:g,indexOf:g,join:g,keys:g,lastIndexOf:g,map:g,pop:g,push:g,reduce:g,reduceRight:g,reverse:g,shift:g,slice:g,some:g,sort:g,splice:g,toLocaleString:g,toString:g,unshift:g,values:g,\\\"@@iterator\\\":g,\\\"@@unscopables\\\":{\\\"**proto**\\\":null,copyWithin:\\\"boolean\\\",entries:\\\"boolean\\\",fill:\\\"boolean\\\",find:\\\"boolean\\\",findIndex:\\\"boolean\\\",flat:\\\"boolean\\\",flatMap:\\\"boolean\\\",includes:\\\"boolean\\\",keys:\\\"boolean\\\",values:\\\"boolean\\\"}},ArrayIteratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",next:g,\\\"@@toStringTag\\\":\\\"string\\\"},TypedArray:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",from:g,of:g,prototype:\\\"TypedArrayPrototype\\\",\\\"@@species\\\":f},TypedArrayPrototype:{buffer:f,byteLength:f,byteOffset:f,constructor:\\\"TypedArray\\\",copyWithin:g,entries:g,every:g,fill:g,filter:g,find:g,findIndex:g,forEach:g,includes:g,indexOf:g,join:g,keys:g,lastIndexOf:g,length:f,map:g,reduce:g,reduceRight:g,reverse:g,set:g,slice:g,some:g,sort:g,subarray:g,toLocaleString:g,toString:g,values:g,\\\"@@iterator\\\":g,\\\"@@toStringTag\\\":f},BigInt64Array:m(\\\"BigInt64ArrayPrototype\\\"),BigUint64Array:m(\\\"BigUint64ArrayPrototype\\\"),Float32Array:m(\\\"Float32ArrayPrototype\\\"),Float64Array:m(\\\"Float64ArrayPrototype\\\"),Int16Array:m(\\\"Int16ArrayPrototype\\\"),Int32Array:m(\\\"Int32ArrayPrototype\\\"),Int8Array:m(\\\"Int8ArrayPrototype\\\"),Uint16Array:m(\\\"Uint16ArrayPrototype\\\"),Uint32Array:m(\\\"Uint32ArrayPrototype\\\"),Uint8Array:m(\\\"Uint8ArrayPrototype\\\"),Uint8ClampedArray:m(\\\"Uint8ClampedArrayPrototype\\\"),BigInt64ArrayPrototype:d(\\\"BigInt64Array\\\"),BigUint64ArrayPrototype:d(\\\"BigUint64Array\\\"),Float32ArrayPrototype:d(\\\"Float32Array\\\"),Float64ArrayPrototype:d(\\\"Float64Array\\\"),Int16ArrayPrototype:d(\\\"Int16Array\\\"),Int32ArrayPrototype:d(\\\"Int32Array\\\"),Int8ArrayPrototype:d(\\\"Int8Array\\\"),Uint16ArrayPrototype:d(\\\"Uint16Array\\\"),Uint32ArrayPrototype:d(\\\"Uint32Array\\\"),Uint8ArrayPrototype:d(\\\"Uint8Array\\\"),Uint8ClampedArrayPrototype:d(\\\"Uint8ClampedArray\\\"),Map:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",\\\"@@species\\\":f,prototype:\\\"MapPrototype\\\"},MapPrototype:{clear:g,constructor:\\\"Map\\\",delete:g,entries:g,forEach:g,get:g,has:g,keys:g,set:g,size:f,values:g,\\\"@@iterator\\\":g,\\\"@@toStringTag\\\":\\\"string\\\"},MapIteratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",next:g,\\\"@@toStringTag\\\":\\\"string\\\"},Set:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"SetPrototype\\\",\\\"@@species\\\":f},SetPrototype:{add:g,clear:g,constructor:\\\"Set\\\",delete:g,entries:g,forEach:g,has:g,keys:g,size:f,values:g,\\\"@@iterator\\\":g,\\\"@@toStringTag\\\":\\\"string\\\"},SetIteratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",next:g,\\\"@@toStringTag\\\":\\\"string\\\"},WeakMap:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"WeakMapPrototype\\\"},WeakMapPrototype:{constructor:\\\"WeakMap\\\",delete:g,get:g,has:g,set:g,\\\"@@toStringTag\\\":\\\"string\\\"},WeakSet:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"WeakSetPrototype\\\"},WeakSetPrototype:{add:g,constructor:\\\"WeakSet\\\",delete:g,has:g,\\\"@@toStringTag\\\":\\\"string\\\"},ArrayBuffer:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",isView:g,prototype:\\\"ArrayBufferPrototype\\\",\\\"@@species\\\":f},ArrayBufferPrototype:{byteLength:f,constructor:\\\"ArrayBuffer\\\",slice:g,\\\"@@toStringTag\\\":\\\"string\\\"},SharedArrayBuffer:!1,DataView:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"DataViewPrototype\\\"},DataViewPrototype:{buffer:f,byteLength:f,byteOffset:f,constructor:\\\"DataView\\\",getBigInt64:g,getBigUint64:g,getFloat32:g,getFloat64:g,getInt8:g,getInt16:g,getInt32:g,getUint8:g,getUint16:g,getUint32:g,setBigInt64:g,setBigUint64:g,setFloat32:g,setFloat64:g,setInt8:g,setInt16:g,setInt32:g,setUint8:g,setUint16:g,setUint32:g,\\\"@@toStringTag\\\":\\\"string\\\"},Atomics:!1,JSON:{parse:g,stringify:g,\\\"@@toStringTag\\\":\\\"string\\\"},IteratorPrototype:{\\\"@@iterator\\\":g},AsyncIteratorPrototype:{\\\"@@asyncIterator\\\":g},GeneratorFunction:{\\\"**proto**\\\":\\\"FunctionPrototypeConstructor\\\",name:\\\"string\\\",length:\\\"number\\\",prototype:\\\"Generator\\\"},Generator:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",constructor:\\\"GeneratorFunction\\\",prototype:\\\"GeneratorPrototype\\\"},AsyncGeneratorFunction:{\\\"**proto**\\\":\\\"FunctionPrototypeConstructor\\\",name:\\\"string\\\",length:\\\"number\\\",prototype:\\\"AsyncGenerator\\\"},AsyncGenerator:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",constructor:\\\"AsyncGeneratorFunction\\\",prototype:\\\"AsyncGeneratorPrototype\\\",\\\"@@toStringTag\\\":\\\"string\\\"},GeneratorPrototype:{\\\"**proto**\\\":\\\"IteratorPrototype\\\",constructor:\\\"Generator\\\",next:g,return:g,throw:g,\\\"@@toStringTag\\\":\\\"string\\\"},AsyncGeneratorPrototype:{\\\"**proto**\\\":\\\"AsyncIteratorPrototype\\\",constructor:\\\"AsyncGenerator\\\",next:g,return:g,throw:g,\\\"@@toStringTag\\\":\\\"string\\\"},Promise:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",all:g,allSettled:g,prototype:\\\"PromisePrototype\\\",race:g,reject:g,resolve:g,\\\"@@species\\\":f},PromisePrototype:{catch:g,constructor:\\\"Promise\\\",finally:g,then:g,\\\"@@toStringTag\\\":\\\"string\\\"},AsyncFunction:{\\\"**proto**\\\":\\\"FunctionPrototypeConstructor\\\",name:\\\"string\\\",length:\\\"number\\\",prototype:\\\"AsyncFunctionPrototype\\\"},AsyncFunctionPrototype:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",constructor:\\\"AsyncFunction\\\",\\\"@@toStringTag\\\":\\\"string\\\"},Reflect:{apply:g,construct:g,defineProperty:g,deleteProperty:g,get:g,getOwnPropertyDescriptor:g,getPrototypeOf:g,has:g,isExtensible:g,ownKeys:g,preventExtensions:g,set:g,setPrototypeOf:g},Proxy:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",revocable:g},escape:g,unescape:g,FunctionPrototypeConstructor:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",length:\\\"number\\\",prototype:\\\"FunctionPrototype\\\"},Compartment:{\\\"**proto**\\\":\\\"FunctionPrototype\\\",prototype:\\\"CompartmentPrototype\\\"},CompartmentPrototype:{constructor:\\\"Compartment\\\",evaluate:g,global:f},harden:g});const{getPrototypeOf:A,getOwnPropertyDescriptor:E}=Object,{apply:S,ownKeys:_}=Reflect,w=(t=>(o,...r)=>S(t,o,r))(Object.prototype.hasOwnProperty);function I(t,o){if(\\\"string\\\"==typeof o)return o;if(\\\"symbol\\\"==typeof o)return`@@${o.toString().slice(14,-1)}`;throw new TypeError(`Unexpected property name type ${t} ${o}`)}function F(t){const o=[\\\"undefined\\\",\\\"boolean\\\",\\\"number\\\",\\\"string\\\",\\\"symbol\\\"];function r(r,e,n,i){if(\\\"object\\\"==typeof i)return a(r,e,i),!0;if(!1===i)return!1;if(\\\"string\\\"==typeof i)if(\\\"prototype\\\"===n||\\\"constructor\\\"===n){if(w(t,i))return e===t[i]}else if(o.includes(i))return typeof e===i;throw new TypeError(`Unexpected whitelist permit ${r}`)}function e(t,o,e,n){const a=E(o,e);return w(a,\\\"value\\\")?r(t,a.value,e,n):r(`${t}<get>`,a.get,e,n.get)&&r(`${t}<set>`,a.set,e,n.set)}function n(t,o){return w(t,o)?t[o]:\\\"FunctionPrototype\\\"===t[\\\"**proto**\\\"]&&w(u,o)?u[o]:void 0}function a(o,r,a){!function(o,r,e){const n=A(r);if(null!==n||null!==e){if(void 0!==e&&\\\"string\\\"!=typeof e)throw new TypeError(`Malformed whitelist permit ${o}.__proto__`);if(n!==t[e||\\\"ObjectPrototype\\\"])throw new Error(`Unexpected intrinsic ${o}.__proto__`)}}(o,r,a[\\\"**proto**\\\"]);for(const t of _(r)){if(\\\"__proto__\\\"===t)continue;const i=I(o,t),c=`${o}.${i}`,p=n(a,i);if(!p||!e(c,r,t,p))try{delete r[t]}catch(t){}}}a(\\\"intrinsics\\\",t,h)}const{defineProperties:T,getOwnPropertyDescriptors:v}=Object;const{getOwnPropertyDescriptor:O}=Object;const{defineProperties:U,getOwnPropertyDescriptors:x,getOwnPropertyDescriptor:R}=Object;const C=!0;var M={ObjectPrototype:\\\"*\\\",ArrayPrototype:\\\"*\\\",FunctionPrototype:{constructor:C,bind:C,name:C,toString:C},ErrorPrototype:{constructor:C,message:C,name:C},PromisePrototype:{constructor:C},TypedArrayPrototype:\\\"*\\\",Generator:{constructor:C,name:C,toString:C},IteratorPrototype:\\\"*\\\"};const{defineProperties:j,getOwnPropertyNames:G,getOwnPropertyDescriptor:k,getOwnPropertyDescriptors:N}=Object,{ownKeys:$}=Reflect;function D(t){return null!==t&&\\\"object\\\"==typeof t}const{assign:B,freeze:L,defineProperties:W,getOwnPropertyDescriptor:V,getOwnPropertyNames:z,getPrototypeOf:Y,setPrototypeOf:J,prototype:H}=Object,{apply:K,get:Q,set:X}=Reflect,{isArray:q,prototype:Z}=Array,{revocable:tt}=Proxy,{prototype:ot}=RegExp,{prototype:rt}=String,{prototype:et}=WeakMap,nt=t=>(o,...r)=>K(t,o,r),at=nt(H.hasOwnProperty),it=(nt(Z.filter),nt(Z.join)),ct=(nt(Z.push),nt(Z.pop)),pt=nt(Z.includes),st=nt(ot.test),yt=(nt(rt.match),nt(rt.search)),lt=nt(rt.slice),ut=nt(rt.split),gt=(nt(et.get),nt(et.set),nt(et.has),t=>Q(Y(t),\\\"constructor\\\")),ft=L({__proto__:null});function Pt(t,o){const r=`please report internal shim error: ${t}`;throw console.error(r),o&&(console.error(`${o}`),console.error(`${o.stack}`)),TypeError(r)}function bt(t,o){t||Pt(o)}const mt=[\\\"await\\\",\\\"break\\\",\\\"case\\\",\\\"catch\\\",\\\"class\\\",\\\"const\\\",\\\"continue\\\",\\\"debugger\\\",\\\"default\\\",\\\"delete\\\",\\\"do\\\",\\\"else\\\",\\\"export\\\",\\\"extends\\\",\\\"finally\\\",\\\"for\\\",\\\"function\\\",\\\"if\\\",\\\"import\\\",\\\"in\\\",\\\"instanceof\\\",\\\"new\\\",\\\"return\\\",\\\"super\\\",\\\"switch\\\",\\\"this\\\",\\\"throw\\\",\\\"try\\\",\\\"typeof\\\",\\\"var\\\",\\\"void\\\",\\\"while\\\",\\\"with\\\",\\\"yield\\\",\\\"let\\\",\\\"static\\\",\\\"enum\\\",\\\"implements\\\",\\\"package\\\",\\\"protected\\\",\\\"interface\\\",\\\"private\\\",\\\"public\\\",\\\"await\\\",\\\"null\\\",\\\"true\\\",\\\"false\\\",\\\"this\\\",\\\"arguments\\\"],dt=new RegExp(\\\"^[a-zA-Z_$][\\\\\\\\w$]*$\\\");function ht(t){return\\\"eval\\\"!==t&&!pt(mt,t)&&st(dt,t)}function At(t,o){const r=V(t,o);return(!1===r.configurable&&!1===r.writable&&at(r,\\\"value\\\"))}const Et=new Proxy(ft,{get(t,o){Pt(`unexpected scope handler trap called: ${String(o)}`)}});function St(t,o){const r=yt(t,o);return r<0?-1:ut(lt(t,0,r),\\\"\\\\n\\\").length}const _t=new RegExp(\\\"(?:\\\\x3c!--|--\\\\x3e)\\\");const wt=new RegExp(\\\"\\\\\\\\bimport\\\\\\\\s*(?:\\\\\\\\(|/[/*])\\\");const It=new RegExp(\\\"\\\\\\\\beval\\\\\\\\s*(?:\\\\\\\\(|/[/*])\\\");const Ft={rewrite:t=>(function(t){const o=St(t,_t);if(o<0)return t;throw new SyntaxError(`possible html comment syntax rejected around line ${o}`)}(t.src),function(t){const o=St(t,wt);if(o<0)return t;throw new SyntaxError(`possible import expression rejected around line ${o}`)}(t.src),function(t){const o=St(t,It);if(o<0)return t;throw new SyntaxError(`possible direct eval expression rejected around line ${o}`)}(t.src),t)};function Tt(t,o=[]){const r=function(t){return 0===t.length?\\\"\\\":`const {${it(t,\\\",\\\")}} = this;`}(o);return t.intrinsics.Function(`\\\\n    with (this) {\\\\n      ${r}\\\\n      return function() {\\\\n        'use strict';\\\\n        return eval(arguments[0]);\\\\n      };\\\\n    }\\\\n  `)}function vt(t,o,r,e={},{localTransforms:n=[],globalTransforms:a=[],sloppyGlobalsMode:i=!1}={}){let c={src:o,endowments:e};c=function(t,o){for(const r of o)\\\"function\\\"==typeof r.rewrite&&(t=r.rewrite(t));return t}(c,[...n,...a,Ft]);const p=function(t,o,r={},{sloppyGlobalsMode:e=!1}={}){return{__proto__:Et,useUnsafeEvaluator:!1,get(e,n){if(\\\"symbol\\\"!=typeof n)return\\\"eval\\\"===n&&!0===this.useUnsafeEvaluator?(this.useUnsafeEvaluator=!1,t.intrinsics.eval):n in r?Q(r,n,o):Q(o,n)},set(t,e,n){if(e in r){return\\\"value\\\"in V(r,e)?X(r,e,n):X(r,e,n,o)}return X(o,e,n)},has:(t,n)=>!!(e||\\\"eval\\\"===n||n in r||n in o||n in globalThis),getPrototypeOf:()=>null}}(t,r,c.endowments,{sloppyGlobalsMode:i}),s=tt(ft,p),y=Tt(t,function(t,o={}){const r=z(t),e=z(o),n=e.filter(t=>ht(t)&&At(o,t));return[...r.filter(o=>!e.includes(o)&&ht(o)&&At(t,o)),...n]}(r,c.endowments)),l=K(y,s.proxy,[]);let u;p.useUnsafeEvaluator=!0;try{return K(l,r,[c.src])}catch(t){throw u=t,t}finally{!0===p.useUnsafeEvaluator&&(Pt(\\\"handler did not revoke useUnsafeEvaluator\\\",u),s.revoke())}}const Ot=(t,o,r={})=>{const e=e=>\\\"string\\\"!=typeof e?e:vt(t,e,o,{},r);return W(e,{toString:{value:()=>\\\"function eval() { [native code] }\\\",writable:!1,enumerable:!1,configurable:!0}}),bt(gt(e)!==Function,\\\"eval constructor is Function\\\"),bt(gt(e)!==t.intrinsics.Function,\\\"eval contructions is %Function%\\\"),e};function Ut(t,o,r={}){const e=function(e){const n=`${ct(arguments)||\\\"\\\"}`,a=`${it(arguments,\\\",\\\")}`;new t.intrinsics.Function(a,n);const i=`(function anonymous(${a}\\\\n) {\\\\n${n}\\\\n})`;return vt(t,i,o,{},r)};return W(e,{prototype:{value:t.intrinsics.Function.prototype,writable:!1,enumerable:!1,configurable:!1},toString:{value:()=>\\\"function Function() { [native code] }\\\",writable:!1,enumerable:!1,configurable:!0}}),bt(Y(Function)===Function.prototype),bt(Y(e)===Function.prototype),bt(gt(e)!==Function),bt(gt(e)!==t.intrinsics.Function),e}const xt=[\\\"eval\\\",\\\"isFinite\\\",\\\"isNaN\\\",\\\"parseFloat\\\",\\\"parseInt\\\",\\\"decodeURI\\\",\\\"decodeURIComponent\\\",\\\"encodeURI\\\",\\\"encodeURIComponent\\\",\\\"Array\\\",\\\"ArrayBuffer\\\",\\\"Boolean\\\",\\\"DataView\\\",\\\"Date\\\",\\\"Error\\\",\\\"EvalError\\\",\\\"Float32Array\\\",\\\"Float64Array\\\",\\\"Function\\\",\\\"Int8Array\\\",\\\"Int16Array\\\",\\\"Int32Array\\\",\\\"Map\\\",\\\"Number\\\",\\\"Object\\\",\\\"Promise\\\",\\\"Proxy\\\",\\\"RangeError\\\",\\\"ReferenceError\\\",\\\"RegExp\\\",\\\"Set\\\",\\\"String\\\",\\\"Symbol\\\",\\\"SyntaxError\\\",\\\"TypeError\\\",\\\"Uint8Array\\\",\\\"Uint8ClampedArray\\\",\\\"Uint16Array\\\",\\\"Uint32Array\\\",\\\"URIError\\\",\\\"WeakMap\\\",\\\"WeakSet\\\",\\\"JSON\\\",\\\"Math\\\",\\\"Reflect\\\",\\\"escape\\\",\\\"unescape\\\",\\\"globalThis\\\",\\\"Compartment\\\",\\\"harden\\\"];const{getOwnPropertyDescriptor:Rt}=Object,Ct=[\\\"eval\\\",\\\"isFinite\\\",\\\"isNaN\\\",\\\"parseFloat\\\",\\\"parseInt\\\",\\\"decodeURI\\\",\\\"decodeURIComponent\\\",\\\"encodeURI\\\",\\\"encodeURIComponent\\\",\\\"Array\\\",\\\"ArrayBuffer\\\",\\\"Boolean\\\",\\\"DataView\\\",\\\"Date\\\",\\\"Error\\\",\\\"EvalError\\\",\\\"Float32Array\\\",\\\"Float64Array\\\",\\\"Function\\\",\\\"Int8Array\\\",\\\"Int16Array\\\",\\\"Int32Array\\\",\\\"Map\\\",\\\"Number\\\",\\\"Object\\\",\\\"Promise\\\",\\\"Proxy\\\",\\\"RangeError\\\",\\\"ReferenceError\\\",\\\"RegExp\\\",\\\"Set\\\",\\\"String\\\",\\\"Symbol\\\",\\\"SyntaxError\\\",\\\"TypeError\\\",\\\"Uint8Array\\\",\\\"Uint8ClampedArray\\\",\\\"Uint16Array\\\",\\\"Uint32Array\\\",\\\"URIError\\\",\\\"WeakMap\\\",\\\"WeakSet\\\",\\\"JSON\\\",\\\"Math\\\",\\\"Reflect\\\",\\\"escape\\\",\\\"unescape\\\",\\\"globalThis\\\",\\\"Compartment\\\",\\\"harden\\\"];let Mt;function jt(){if(Mt)return Mt;const t=function(){const t={__proto__:null};for(const o of Ct){const r=Rt(globalThis,o);if(r){if(\\\"get\\\"in r||\\\"set\\\"in r)throw new TypeError(`Unexpected accessor on global property: ${o}`);t[o]=r.value}}return t}();return Mt={__proto__:null,intrinsics:t},L(Mt)}const Gt=new WeakMap;class kt{constructor(t,o,r={}){const{transforms:e=[]}=r,n=[...e],a=function(t,{globalTransforms:o}){const r={},e={Infinity:{value:1/0,enumerable:!1},NaN:{value:NaN,enumerable:!1},undefined:{value:void 0,enumerable:!1}};for(const n of xt){if(!at(t.intrinsics,n))continue;let a;switch(n){case\\\"eval\\\":a=Ot(t,r,{globalTransforms:o});break;case\\\"Function\\\":a=Ut(t,r,{globalTransforms:o});break;case\\\"globalThis\\\":a=r;break;default:a=t.intrinsics[n]}e[n]={value:a,configurable:!0,writable:!0,enumerable:!1}}return W(r,e),bt(r.eval!==t.intrinsics.eval,\\\"eval on global object\\\"),bt(r.Function!==t.intrinsics.Function,\\\"Function on global object\\\"),r}(jt(),{globalTransforms:n});B(a,t),Gt.set(this,{globalTransforms:n,globalObject:a})}get global(){return Gt.get(this).globalObject}evaluate(t,o={}){if(\\\"string\\\"!=typeof t)throw new TypeError(\\\"first argument of evaluate() must be a string\\\");const{endowments:r={},transforms:e=[],sloppyGlobalsMode:n=!1}=o,a=[...e],{globalTransforms:i,globalObject:c}=Gt.get(this);return vt(jt(),t,c,r,{globalTransforms:i,localTransforms:a,sloppyGlobalsMode:n})}toString(){return\\\"[object Compartment]\\\"}static toString(){return\\\"function Compartment() { [shim code] }\\\"}}let Nt;function $t(t,o){if(!t)throw new TypeError(o)}\\\"object\\\"!=typeof globalThis&&(Object.prototype.__defineGetter__(\\\"__magic__\\\",(function(){return this})),__magic__.globalThis=__magic__,delete Object.prototype.__magic__),t.lockdown=function(t={}){const{noTameDate:o=!1,noTameError:r=!1,noTameMath:e=!1,noTameRegExp:n=!1,registerOnly:a=!1,...i}=t,c=Object.keys(i);$t(0===c.length,`lockdown(): non supported option ${c.join(\\\", \\\")}`);const p={noTameDate:o,noTameError:r,noTameMath:e,noTameRegExp:n,registerOnly:a};if(Nt)return Object.keys(p).forEach(t=>{$t(p[t]===Nt[t],`lockdown(): cannot re-invoke with different option ${t}`)}),!1;Nt=p,function(){try{(0,Function.prototype.constructor)(\\\"return 1\\\")}catch(t){return}const{defineProperties:t,getPrototypeOf:o,setPrototypeOf:r}=Object;function e(e,n){let a;try{a=(0,eval)(n)}catch(t){if(t instanceof SyntaxError)return;throw t}const i=o(a),c=function(){throw new TypeError(\\\"Not available\\\")};t(c,{name:{value:e,writable:!1,enumerable:!1,configurable:!0},toString:{value:()=>`function ${e}() { [native code] }`,writable:!1,enumerable:!1,configurable:!0}}),t(i,{constructor:{value:c}}),t(c,{prototype:{value:i}}),c!==Function.prototype.constructor&&r(c,Function.prototype.constructor)}e(\\\"Function\\\",\\\"(function(){})\\\"),e(\\\"GeneratorFunction\\\",\\\"(function*(){})\\\"),e(\\\"AsyncFunction\\\",\\\"(async function(){})\\\"),e(\\\"AsyncGeneratorFunction\\\",\\\"(async function*(){})\\\")}(),o||function(){const t={now:()=>NaN};Date.now=t.now;const o={toLocaleString:()=>NaN};Date.prototype.toLocaleString=o.toLocaleString;const r=Date,e=function(){return void 0===new.target?\\\"Invalid Date\\\":arguments.length>0?Reflect.construct(r,arguments,new.target):Reflect.construct(r,[NaN],new.target)},n=v(r);T(e,n);const a=v(r.prototype);a.constructor.value=e,T(e.prototype,a),globalThis.Date=e;const i={toLocaleString(){throw new TypeError(\\\"Object.prototype.toLocaleString is disabled\\\")}};Object.prototype.toLocaleString=i.toLocaleString}(),r||function(){if(delete Error.captureStackTrace,O(Error,\\\"captureStackTrace\\\"))throw Error(\\\"Cannot remove Error.captureStackTrace\\\");if(delete Error.stackTraceLimit,O(Error,\\\"stackTraceLimit\\\"))throw Error(\\\"Cannot remove Error.stackTraceLimit\\\")}(),e||function(){const t={random(){throw TypeError(\\\"Math.random() is disabled\\\")}};Math.random=t.random}(),n||function(){delete RegExp.prototype.compile;const t=RegExp,o=function(){return Reflect.construct(t,arguments,new.target)},r=R(t,Symbol.species);U(o,Symbol.species,r);const e=x(t.prototype);e.constructor.value=o,U(o.prototype,e),globalThis.RegExp=o}();const s=function(t,o={}){const{freeze:r,getOwnPropertyDescriptors:e,getPrototypeOf:n}=Object,{ownKeys:a}=Reflect;let{fringeSet:i}=o;if(i){if(\\\"function\\\"!=typeof i.add||\\\"function\\\"!=typeof i.has)throw new TypeError(\\\"options.fringeSet must have add() and has() methods\\\");if(t)for(const o of t)i.add(o)}else i=new WeakSet(t);const c=o&&o.naivePrepareObject,{harden:p}={harden(t){const o=new Set,p=new Map,s=new WeakMap;function y(t,r){if(Object(t)!==t)return;const e=typeof t;if(\\\"object\\\"!==e&&\\\"function\\\"!==e)throw new TypeError(`Unexpected typeof: ${e}`);i.has(t)||o.has(t)||(o.add(t),s.set(t,r))}function l(t){c&&c(t),r(t);const o=n(t),i=e(t),l=s.get(t)||\\\"unknown\\\";null===o||p.has(o)||(p.set(o,l),s.set(o,`${l}.__proto__`)),a(i).forEach(t=>{const o=`${l}.${String(t)}`,r=i[t];\\\"value\\\"in r?y(r.value,`${o}`):(y(r.get,`${o}(get)`),y(r.set,`${o}(set)`))})}return y(t),o.forEach(l),p.forEach((t,r)=>{if(!o.has(r)&&!i.has(r)){let o;try{o=`prototype ${r} of ${t} is not already in the fringeSet`}catch(e){o=\\\"a prototype of something is not already in the fringeset (and .toString failed)\\\";try{console.log(o),console.log(\\\"the prototype:\\\",r),console.log(\\\"of something:\\\",t)}catch(t){}}throw new TypeError(o)}}),o.forEach(i.add,i),t}};return p}();Object.defineProperties(globalThis,{harden:{value:s,configurable:!0,writable:!0,enumerable:!1},Compartment:{value:kt,configurable:!0,writable:!0,enumerable:!1}});const y=l();F(y),function(){try{(0,Object.prototype.__lookupGetter__)(\\\"x\\\")}catch(t){return}const{defineProperty:t,defineProperties:o,getOwnPropertyDescriptor:r,getPrototypeOf:e,prototype:n}=Object;function a(t){if(null==t)throw new TypeError(\\\"can't convert undefined or null to object\\\");return Object(t)}function i(t){return\\\"symbol\\\"==typeof t?t:`${t}`}function c(t,o){if(\\\"function\\\"!=typeof t)throw TypeError(`invalid ${o} usage`);return t}o(n,{__defineGetter__:{value:function(o,r){const e=a(this);t(e,o,{get:c(r,\\\"getter\\\"),enumerable:!0,configurable:!0})}},__defineSetter__:{value:function(o,r){const e=a(this);t(e,o,{set:c(r,\\\"setter\\\"),enumerable:!0,configurable:!0})}},__lookupGetter__:{value:function(t){let o,n=a(this);for(t=i(t);n&&!(o=r(n,t));)n=e(n);return o&&o.get}},__lookupSetter__:{value:function(t){let o,n=a(this);for(t=i(t);n&&!(o=r(n,t));)n=e(n);return o&&o.set}}})}();const u=function(t){const o={};function r(t,r,e,n){if(\\\"value\\\"in n&&n.configurable){const{value:a}=n;o[t]=a,j(r,{[e]:{get:function(){return a},set:function(o){if(r===this)throw new TypeError(`Cannot assign to read only property '${e}' of '${t}'`);hasOwnProperty.call(this,e)?this[e]=o:j(this,{[e]:{value:o,writable:!0,enumerable:n.enumerable,configurable:n.configurable}})},enumerable:n.enumerable,configurable:n.configurable}})}}function e(t,o,e){const n=k(o,e);n&&r(t,o,e,n)}function n(t,o){const e=N(o);e&&$(e).forEach(n=>r(t,o,n,e[n]))}return function t(o,r,a){for(const i of G(a)){const c=k(r,i);if(!c||c.get||c.set)continue;const p=`${o}.${i}`,s=a[i];if(!0===s)e(p,r,i);else if(\\\"*\\\"===s)n(p,c.value);else{if(!D(s))throw new TypeError(`Unexpected override enablement plan ${p}`);t(p,c.value,s)}}}(\\\"root\\\",t,M),o}(y);return s(y,a),s(u,a),!0},Object.defineProperty(t,\\\"__esModule\\\",{value:!0})}));\\n\"");

/***/ }),
/* 62 */
/***/ (function(module, exports, __webpack_require__) {

"use strict";


exports.byteLength = byteLength
exports.toByteArray = toByteArray
exports.fromByteArray = fromByteArray

var lookup = []
var revLookup = []
var Arr = typeof Uint8Array !== 'undefined' ? Uint8Array : Array

var code = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/'
for (var i = 0, len = code.length; i < len; ++i) {
  lookup[i] = code[i]
  revLookup[code.charCodeAt(i)] = i
}

// Support decoding URL-safe base64 strings, as Node.js does.
// See: https://en.wikipedia.org/wiki/Base64#URL_applications
revLookup['-'.charCodeAt(0)] = 62
revLookup['_'.charCodeAt(0)] = 63

function getLens (b64) {
  var len = b64.length

  if (len % 4 > 0) {
    throw new Error('Invalid string. Length must be a multiple of 4')
  }

  // Trim off extra bytes after placeholder bytes are found
  // See: https://github.com/beatgammit/base64-js/issues/42
  var validLen = b64.indexOf('=')
  if (validLen === -1) validLen = len

  var placeHoldersLen = validLen === len
    ? 0
    : 4 - (validLen % 4)

  return [validLen, placeHoldersLen]
}

// base64 is 4/3 + up to two characters of the original data
function byteLength (b64) {
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function _byteLength (b64, validLen, placeHoldersLen) {
  return ((validLen + placeHoldersLen) * 3 / 4) - placeHoldersLen
}

function toByteArray (b64) {
  var tmp
  var lens = getLens(b64)
  var validLen = lens[0]
  var placeHoldersLen = lens[1]

  var arr = new Arr(_byteLength(b64, validLen, placeHoldersLen))

  var curByte = 0

  // if there are placeholders, only get up to the last complete 4 chars
  var len = placeHoldersLen > 0
    ? validLen - 4
    : validLen

  var i
  for (i = 0; i < len; i += 4) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 18) |
      (revLookup[b64.charCodeAt(i + 1)] << 12) |
      (revLookup[b64.charCodeAt(i + 2)] << 6) |
      revLookup[b64.charCodeAt(i + 3)]
    arr[curByte++] = (tmp >> 16) & 0xFF
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 2) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 2) |
      (revLookup[b64.charCodeAt(i + 1)] >> 4)
    arr[curByte++] = tmp & 0xFF
  }

  if (placeHoldersLen === 1) {
    tmp =
      (revLookup[b64.charCodeAt(i)] << 10) |
      (revLookup[b64.charCodeAt(i + 1)] << 4) |
      (revLookup[b64.charCodeAt(i + 2)] >> 2)
    arr[curByte++] = (tmp >> 8) & 0xFF
    arr[curByte++] = tmp & 0xFF
  }

  return arr
}

function tripletToBase64 (num) {
  return lookup[num >> 18 & 0x3F] +
    lookup[num >> 12 & 0x3F] +
    lookup[num >> 6 & 0x3F] +
    lookup[num & 0x3F]
}

function encodeChunk (uint8, start, end) {
  var tmp
  var output = []
  for (var i = start; i < end; i += 3) {
    tmp =
      ((uint8[i] << 16) & 0xFF0000) +
      ((uint8[i + 1] << 8) & 0xFF00) +
      (uint8[i + 2] & 0xFF)
    output.push(tripletToBase64(tmp))
  }
  return output.join('')
}

function fromByteArray (uint8) {
  var tmp
  var len = uint8.length
  var extraBytes = len % 3 // if we have 1 byte left, pad 2 bytes
  var parts = []
  var maxChunkLength = 16383 // must be multiple of 3

  // go through the array every three bytes, we'll deal with trailing stuff later
  for (var i = 0, len2 = len - extraBytes; i < len2; i += maxChunkLength) {
    parts.push(encodeChunk(uint8, i, (i + maxChunkLength) > len2 ? len2 : (i + maxChunkLength)))
  }

  // pad the end with zeros, but make sure to not forget the extra bytes
  if (extraBytes === 1) {
    tmp = uint8[len - 1]
    parts.push(
      lookup[tmp >> 2] +
      lookup[(tmp << 4) & 0x3F] +
      '=='
    )
  } else if (extraBytes === 2) {
    tmp = (uint8[len - 2] << 8) + uint8[len - 1]
    parts.push(
      lookup[tmp >> 10] +
      lookup[(tmp >> 4) & 0x3F] +
      lookup[(tmp << 2) & 0x3F] +
      '='
    )
  }

  return parts.join('')
}


/***/ }),
/* 63 */
/***/ (function(module, exports) {

/*! ieee754. BSD-3-Clause License. Feross Aboukhadijeh <https://feross.org/opensource> */
exports.read = function (buffer, offset, isLE, mLen, nBytes) {
  var e, m
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var nBits = -7
  var i = isLE ? (nBytes - 1) : 0
  var d = isLE ? -1 : 1
  var s = buffer[offset + i]

  i += d

  e = s & ((1 << (-nBits)) - 1)
  s >>= (-nBits)
  nBits += eLen
  for (; nBits > 0; e = (e * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  m = e & ((1 << (-nBits)) - 1)
  e >>= (-nBits)
  nBits += mLen
  for (; nBits > 0; m = (m * 256) + buffer[offset + i], i += d, nBits -= 8) {}

  if (e === 0) {
    e = 1 - eBias
  } else if (e === eMax) {
    return m ? NaN : ((s ? -1 : 1) * Infinity)
  } else {
    m = m + Math.pow(2, mLen)
    e = e - eBias
  }
  return (s ? -1 : 1) * m * Math.pow(2, e - mLen)
}

exports.write = function (buffer, value, offset, isLE, mLen, nBytes) {
  var e, m, c
  var eLen = (nBytes * 8) - mLen - 1
  var eMax = (1 << eLen) - 1
  var eBias = eMax >> 1
  var rt = (mLen === 23 ? Math.pow(2, -24) - Math.pow(2, -77) : 0)
  var i = isLE ? 0 : (nBytes - 1)
  var d = isLE ? 1 : -1
  var s = value < 0 || (value === 0 && 1 / value < 0) ? 1 : 0

  value = Math.abs(value)

  if (isNaN(value) || value === Infinity) {
    m = isNaN(value) ? 1 : 0
    e = eMax
  } else {
    e = Math.floor(Math.log(value) / Math.LN2)
    if (value * (c = Math.pow(2, -e)) < 1) {
      e--
      c *= 2
    }
    if (e + eBias >= 1) {
      value += rt / c
    } else {
      value += rt * Math.pow(2, 1 - eBias)
    }
    if (value * c >= 2) {
      e++
      c /= 2
    }

    if (e + eBias >= eMax) {
      m = 0
      e = eMax
    } else if (e + eBias >= 1) {
      m = ((value * c) - 1) * Math.pow(2, mLen)
      e = e + eBias
    } else {
      m = value * Math.pow(2, eBias - 1) * Math.pow(2, mLen)
      e = 0
    }
  }

  for (; mLen >= 8; buffer[offset + i] = m & 0xff, i += d, m /= 256, mLen -= 8) {}

  e = (e << mLen) | m
  eLen += mLen
  for (; eLen > 0; buffer[offset + i] = e & 0xff, i += d, e /= 256, eLen -= 8) {}

  buffer[offset + i - d] |= s * 128
}


/***/ }),
/* 64 */
/***/ (function(module, exports) {

var toString = {}.toString;

module.exports = Array.isArray || function (arr) {
  return toString.call(arr) == '[object Array]';
};


/***/ }),
/* 65 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * execute.js
 *
 * Runs the actions in a program
 */

const Log = __webpack_require__(2)
const Json = __webpack_require__(23)
const Sandbox = __webpack_require__(6)
const { _assert, _setOwnProperty, _text, _extendsFrom } = __webpack_require__(0)
const Action = __webpack_require__(21)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Execute'

// ------------------------------------------------------------------------------------------------
// _execute
// ------------------------------------------------------------------------------------------------

function _execute (op, data, masterList) {
  if (Log._debugOn) Log._debug(TAG, 'Executing', op, JSON.stringify(data))

  switch (op) {
    case 'DEPLOY': return _executeDeploy(data, masterList)
    case 'UPGRADE': return _executeUpgrade(data, masterList)
    case 'CALL': return _executeCall(data, masterList)
    case 'NEW': return _executeNew(data, masterList)
    default: throw new Error(`Unknown op: ${op}`)
  }
}

// ------------------------------------------------------------------------------------------------
// _executeDeploy
// ------------------------------------------------------------------------------------------------

function _executeDeploy (encdata, masterList) {
  const Editor = __webpack_require__(9)
  const Source = __webpack_require__(24)

  _assert(encdata instanceof Array, 'DEPLOY data must be an array')
  _assert(encdata.length % 2 === 0, 'Invalid DEPLOY data length')

  // Create temporary code for each source
  const ncode = encdata.length / 2
  const code = []
  for (let i = 0; i < ncode; i++) code.push(Editor._createCode())

  // Create a special decoder that returns jigs in the newly created code before they are installed
  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (n) => {
      const jig = masterList[n] || code[n - masterList.length]
      if (!jig) throw new Error(`Invalid local jig reference: ${n}`)
      return jig
    }
  }

  const data = Json._decode(encdata, decodeOptions)

  // Install each code
  for (let i = 0; i < ncode; i++) {
    const src = data[i * 2 + 0]
    const props = data[i * 2 + 1]

    _assert(typeof src === 'string', 'DEPLOY src must be a string')
    _assert(typeof props === 'object' && !Array.isArray(props) && props, 'DEPLOY props must be an object')

    // Check that the source code is either a single class or function
    Source._check(src)

    // Create the local type from the source
    const [T] = Sandbox._evaluate(src, props.deps)

    _assert(typeof T === 'function', `DEPLOY src not supported: ${src}`)

    Object.keys(props).forEach(key => {
      _setOwnProperty(T, key, props[key])
    })

    // Create the sandbox
    const C = code[i]
    const local = false
    const [S] = Editor._makeSandbox(C, T, local)

    // Install the code into the sandbox
    const editor = Editor._get(C)
    editor._install(S, local, [], src)
  }

  // Deploy each code
  Action._deploy(code)
}

// ------------------------------------------------------------------------------------------------
// _executeUpgrade
// ------------------------------------------------------------------------------------------------

function _executeUpgrade (encdata, masterList) {
  const Code = __webpack_require__(1)
  const Editor = __webpack_require__(9)
  const Source = __webpack_require__(24)

  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (n) => masterList[n]
  }

  const data = Json._decode(encdata, decodeOptions)

  _assert(Array.isArray(data), 'UPGRADE data must be an array')
  _assert(data.length === 3, 'Invalid UPGRADE data length')
  _assert(data[0] instanceof Code, 'Must only upgrade code')
  _assert(typeof data[1] === 'string', 'UPGRADE src must be a string')
  _assert(typeof data[2] === 'object' && !Array.isArray(data[2]) && data[2], 'UPGRADE props must be an object')

  const [C, src, props] = data

  // Check that the source code is either a single class or function
  Source._check(src)

  // Create the source
  const [T] = Sandbox._evaluate(src, props.deps)
  Object.keys(props).forEach(key => {
    _setOwnProperty(T, key, props[key])
  })

  // Create the sandbox
  const [S] = Editor._makeSandbox(C, T)

  // Upgrade the code
  const local = false
  Editor._upgradeCode(C, S, local, src)
}

// ------------------------------------------------------------------------------------------------
// _executeCall
// ------------------------------------------------------------------------------------------------

function _executeCall (encdata, masterList) {
  const Code = __webpack_require__(1)
  const Jig = __webpack_require__(7)

  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (n) => masterList[n]
  }

  const data = Json._decode(encdata, decodeOptions)

  _assert(data.length === 3, 'Invalid CALL data length')
  _assert((data[0] instanceof Code && (_extendsFrom(data[0], Jig) ||
    data[1] === 'auth' || data[1] === 'destroy')) ||
    data[0] instanceof Jig, 'Must only execute CALL on jigs or code')
  _assert(typeof data[1] === 'string', 'CALL method must be a string: ' + data[1])
  _assert(Array.isArray(data[2]), 'CALL args must be an array')
  _assert(data[0] instanceof Jig || data[1] !== 'upgrade', 'Cannot execute upgrade() with CALL')

  const [x, method, args] = data
  if (typeof x[method] !== 'function') throw new Error(`Cannot call ${_text(x)}.${method}()`)
  x[method](...args)
}

// ------------------------------------------------------------------------------------------------
// _executeNew
// ------------------------------------------------------------------------------------------------

function _executeNew (encdata, masterList) {
  const Code = __webpack_require__(1)
  const Jig = __webpack_require__(7)

  const decodeOptions = {
    _intrinsics: Sandbox._intrinsics,
    _decodeJig: (n) => masterList[n]
  }

  const data = Json._decode(encdata, decodeOptions)

  _assert(data.length === 2, 'Invalid NEW data length')
  _assert(data[0] instanceof Code, 'Must only execute NEW on code')
  _assert(_extendsFrom(data[0], Jig), 'Must only execute NEW on a jig class')
  _assert(Array.isArray(data[1]), 'NEW args must be an array')

  const [C, args] = data

  new C(...args) // eslint-disable-line
}

// ------------------------------------------------------------------------------------------------

module.exports = _execute


/***/ }),
/* 66 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * browser-cache.js
 *
 * A cache that stores both in local memory and in IndexedDB
 */

/* global VARIANT */

if (true) {
  const CacheWrapper = __webpack_require__(38)
  const LocalCache = __webpack_require__(39)
  const IndexedDbCache = __webpack_require__(55)

  // ----------------------------------------------------------------------------------------------
  // BrowserCache
  // ----------------------------------------------------------------------------------------------

  class BrowserCache extends CacheWrapper {
    constructor (options = { }) {
      super()

      this.localCache = new LocalCache({
        maxSizeMB: options.maxMemorySizeMB
      })

      this.indexedDbCache = new IndexedDbCache({
        dbName: options.dbName,
        dbStore: options.dbStore,
        dbVersion: options.dbVersion
      })

      this.localCache.setWrappingEnabled(false)
      this.indexedDbCache.setWrappingEnabled(false)
    }

    get maxMemorySizeMB () { return this.localCache.maxSizeMB }
    set maxMemorySizeMB (value) { this.localCache.maxSizeMB = value }

    async get (key) {
      const localValue = await this.localCache.get(key)
      if (typeof localValue !== 'undefined') return localValue

      const indexedDbValue = await this.indexedDbCache.get(key)
      if (typeof indexedDbValue !== 'undefined') {
        await this.localCache.set(key, indexedDbValue)
        return indexedDbValue
      }
    }

    async set (key, value) {
      return Promise.all([
        this.localCache.set(key, value),
        this.indexedDbCache.set(key, value)
      ])
    }
  }

  // ----------------------------------------------------------------------------------------------

  module.exports = BrowserCache
} else {}


/***/ }),
/* 67 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * disk-cache.js
 *
 * Cache that stores state in files on the disk
 */

/* global VARIANT */

if (false) {} else {
  module.exports = null
}


/***/ }),
/* 68 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * inventory.js
 *
 * An object that tracks the jigs and code for the current owner
 */

const Log = __webpack_require__(2)
const { _owner } = __webpack_require__(8)
const { _text, _Timeout } = __webpack_require__(0)
const { _sudo } = __webpack_require__(4)
const { TimeoutError } = __webpack_require__(11)
const { _RequestError } = __webpack_require__(18)
const LocalOwner = __webpack_require__(56)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'Inventory'

// ------------------------------------------------------------------------------------------------
// Inventory
// ------------------------------------------------------------------------------------------------

class Inventory {
  constructor () {
    this._listener = (event, data) => this._detect(data)
    this._creations = []
  }

  // --------------------------------------------------------------------------
  // attach
  // --------------------------------------------------------------------------

  attach (run) {
    this.detach()

    if (Log._debugOn) Log._debug(TAG, 'Attach')
    this._run = run

    run.on('update', this._listener)
    run.on('publish', this._listener)
    run.on('sync', this._listener)

    this._lock = null
    this._pending = []

    if (run.owner instanceof LocalOwner) {
      this._lock = _owner(run.owner.address)
    }
  }

  // --------------------------------------------------------------------------
  // detach
  // --------------------------------------------------------------------------

  detach (run) {
    if (!this._run) return

    if (Log._debugOn) Log._debug(TAG, 'Detach')

    this._run.off('update', this._listener)
    this._run.off('publish', this._listener)
    this._run.off('sync', this._listener)

    this._run = null
    this._lock = null
    this._pending = null
  }

  // --------------------------------------------------------------------------
  // jigs
  // --------------------------------------------------------------------------

  get jigs () {
    this._filterNotOurs()
    const Jig = __webpack_require__(7)
    return this._creations.filter(x => x instanceof Jig)
  }

  // --------------------------------------------------------------------------
  // code
  // --------------------------------------------------------------------------

  get code () {
    this._filterNotOurs()
    const Code = __webpack_require__(1)
    return this._creations.filter(x => x instanceof Code)
  }

  // --------------------------------------------------------------------------
  // sync
  // --------------------------------------------------------------------------

  async sync () {
    if (Log._infoOn) Log._info(TAG, 'Sync')

    // Get the initial lock
    if (!this._lock) {
      try {
        if (!this._run || !this._run._kernel._owner.nextOwner) {
          throw new Error('Inventory cannot determine owner')
        }
        const owner = await this._run._kernel._owner.nextOwner()
        this._lock = _owner(owner)
        if (Log._debugOn) Log._debug(TAG, 'Owner', owner)
        if (this._pending) this._pending.forEach(creation => this._detect(creation))
      } finally {
        this._pending = null
      }
    }

    // Make sure we have a lock
    if (!this._lock) return

    // One sync at a time
    if (this._sync) return this._sync

    // Lock if off and return the promise
    this._sync = this._syncLatest()
      .then(() => { this._sync = null })
      .catch(e => { this._sync = null; throw e })

    return this._sync
  }

  // --------------------------------------------------------------------------
  // Helpers
  // --------------------------------------------------------------------------

  async _syncLatest () {
    let locations

    // If we can get locations to load from our state API, do that instead of
    // UTXOs, as there is no risk of non-jigs in that. Otherwise, use utxos.
    if (typeof this._run.state.locations === 'function') {
      const script = this._lock.script()
      locations = await this._run.state.locations(script)
    } else {
      const script = this._lock.script()
      const utxos = await this._run.blockchain.utxos(script)
      locations = utxos.map(utxo => `${utxo.txid}_o${utxo.vout}`)
    }

    // Get current locations of creations in the inventory
    const existingLocations = _sudo(() => this._creations.map(creation => creation.location))

    // Create a shared load session and a shared timeout
    const _load = __webpack_require__(16)
    const session = new _load._Session()
    const timeout = new _Timeout('inventory sync', this._run._kernel._timeout)

    // Add all new creations we don't know about
    for (const location of locations) {
      // Keep existing creations in the inventory when there are no updates
      if (existingLocations.includes(location)) continue

      // Try loading the creation, but if it fails to load, just move on to the next.
      // Otherwise, baddies might crash apps by sending users creations that don't load.
      let creation = null
      try {
        creation = await _load(location, undefined, this._run._kernel, session, timeout)
      } catch (e) {
        // Timeout and Request errors are intermittent errors and should not be swalloed
        if (e instanceof TimeoutError) throw e
        if (e instanceof _RequestError) throw e

        // Assume all other errors are due to non-creation utxos or other invalid transactions
        if (Log._warnOn) Log._warn(TAG, `Failed to load ${location}\n\n${e.toString()}`)
        continue
      }

      this._detect(creation)
    }

    // Remove creations that are not ours
    this._filterNotOurs()
  }

  // --------------------------------------------------------------------------

  _detect (creation) {
    // If we don't have a lock yet, add this creation to a pending set to redetect once there's an owner
    // We will run the remaining detection because if owner is undefined, it will be ours.
    if (!this._lock && this._pending) this._pending.push(creation)

    // If there is an existing creation, prefer the newer one
    const existing = this._creations.find(x => this._sameOrigin(x, creation))
    if (existing && _sudo(() => existing.nonce > creation.nonce)) return

    // Remove the existing creation. We will prefer our new one.
    this._creations = this._creations.filter(x => x !== existing)

    if (this._ours(creation)) {
      if (!existing && Log._infoOn) Log._info(TAG, 'Add', _text(creation))
      this._creations.push(creation)
    } else {
      if (existing && Log._infoOn) Log._info(TAG, 'Remove', _text(creation))
    }
  }

  // --------------------------------------------------------------------------

  _sameOrigin (x, y) {
    if (x === y) return true
    const xOrigin = _sudo(() => x.origin)
    const yOrigin = _sudo(() => y.origin)
    if (xOrigin.startsWith('error://')) return false
    if (yOrigin.startsWith('error://')) return false
    return xOrigin === yOrigin
  }

  // --------------------------------------------------------------------------

  _ours (creation) {
    try {
      // Errored creations are not owned because they can't be used
      if (_sudo(() => creation.location).startsWith('error://')) return false

      // Assume creations with undefined owners will become ours
      const creationOwner = _sudo(() => creation.owner)
      if (typeof creationOwner === 'undefined') return true

      // If we don't have a lock, and its owned by another, its not ours
      if (!this._lock) return false

      // Otherwise, check the scripts that will be generated
      const creationLock = _owner(creationOwner)
      const creationScript = creationLock.script()
      const ourScript = this._lock.script()
      return creationScript === ourScript
    } catch (e) {
      return false
    }
  }

  // --------------------------------------------------------------------------

  _filterNotOurs () {
    this._creations = this._creations.filter(creation => {
      if (this._ours(creation)) return true
      if (Log._infoOn) Log._info(TAG, 'Remove', _text(creation))
      return false
    })
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Inventory


/***/ }),
/* 69 */
/***/ (function(module) {

module.exports = JSON.parse("{\"jig://05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o2\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\"},\"Tx\":{\"$jig\":\"_o1\"}},\"location\":\"_o2\",\"nonce\":2,\"origin\":\"312985bd960ae4c59856b3089b04017ede66506ea181333eec7c9bb88b11c490_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"function txo (rawtx) {\\n  const ret = { }\\n\\n  function chunks (script) {\\n    const b = Hex.stringToBytes(script)\\n    let i = 0\\n\\n    function u8 () { return b[i++] }\\n    function u16 () { return u8() + u8() * 256 }\\n    function u32 () { return u16() + u16() * 256 * 256 }\\n    function buf (n) { const h = Hex.bytesToString(b.slice(i, i + n)); i += n; return h }\\n\\n    const OP_PUSHDATA1 = 0x4c\\n    const OP_PUSHDATA2 = 0x4d\\n    const OP_PUSHDATA4 = 0x4e\\n\\n    const chunks = []\\n    while (i < b.length) {\\n      const opcodenum = u8()\\n      if (opcodenum > 0 && opcodenum < OP_PUSHDATA1) {\\n        chunks.push({ buf: buf(opcodenum), len: opcodenum, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA1) {\\n        const len = u8()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA2) {\\n        const len = u16()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA4) {\\n        const len = u32()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else {\\n        chunks.push({ opcodenum })\\n      }\\n    }\\n    return chunks\\n  }\\n\\n  // https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript\\n  function bytesToBase64 (arr) {\\n    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' // base64 alphabet\\n    const bin = n => n.toString(2).padStart(8, 0) // convert num to 8-bit binary string\\n    const l = arr.length\\n    let result = ''\\n    for (let i = 0; i <= (l - 1) / 3; i++) {\\n      const c1 = i * 3 + 1 >= l // case when \\\"=\\\" is on end\\n      const c2 = i * 3 + 2 >= l // case when \\\"=\\\" is on end\\n      const chunk = bin(arr[3 * i]) + bin(c1 ? 0 : arr[3 * i + 1]) + bin(c2 ? 0 : arr[3 * i + 2])\\n      const r = chunk.match(/.{1,6}/g).map((x, j) => j === 3 && c2 ? '=' : (j === 2 && c1 ? '=' : abc[+('0b' + x)]))\\n      result += r.join('')\\n    }\\n    return result\\n  }\\n\\n  function xput (script, output) {\\n    const ret = { }\\n    chunks(script).forEach((c, n) => {\\n      if (c.buf) {\\n        ret['b' + n] = bytesToBase64(Hex.stringToBytes(c.buf))\\n        const enc = c.buf.replace(/[0-9a-f]{2}/g, '%$&')\\n        if (output) try { ret['s' + n] = decodeURIComponent(enc) } catch (e) { }\\n        if (output) ret['h' + n] = c.buf\\n      } else {\\n        ret['b' + n] = { op: c.opcodenum }\\n      }\\n    })\\n    return ret\\n  }\\n\\n  function input (txin, i) {\\n    const ret = xput(txin.script)\\n    ret.e = { h: txin.prevTxId, i: txin.outputIndex }\\n    ret.i = i\\n    ret.seq = txin.sequenceNumber\\n    return ret\\n  }\\n\\n  function output (txout, i) {\\n    const ret = xput(txout.script, true)\\n    ret.e = { v: txout.satoshis, i }\\n    ret.i = i\\n    return ret\\n  }\\n\\n  const tx = new Tx(rawtx)\\n  ret.in = tx.inputs.map(input)\\n  ret.out = tx.outputs.map(output)\\n  ret.lock = tx.nLockTime\\n  return ret\\n}\",\"version\":\"04\"},\"jig://727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"class Hex {\\n  static stringToBytes (s) {\\n    if (typeof s !== 'string' || s.length % 2 !== 0) {\\n      throw new Error(`Bad hex: ${s}`)\\n    }\\n\\n    s = s.toLowerCase()\\n\\n    const HEX_CHARS = '0123456789abcdef'.split('')\\n    const bytes = []\\n\\n    for (let i = 0; i < s.length; i += 2) {\\n      const high = HEX_CHARS.indexOf(s[i])\\n      const low = HEX_CHARS.indexOf(s[i + 1])\\n\\n      if (high === -1 || low === -1) {\\n        throw new Error(`Bad hex: ${s}`)\\n      }\\n\\n      bytes.push(high * 16 + low)\\n    }\\n\\n    return bytes\\n  }\\n\\n  static bytesToString (b) {\\n    if (!Array.isArray(b)) throw new Error(`Bad bytes: ${b}`)\\n\\n    const validDigit = x => Number.isInteger(x) && x >= 0 && x < 256\\n    b.forEach(x => { if (!validDigit(x)) throw new Error(`Bad digit: ${x}`) })\\n\\n    return b\\n      .map(x => x.toString('16'))\\n      .map(x => x.length === 1 ? '0' + x : x)\\n      .join('')\\n  }\\n}\",\"version\":\"04\"},\"jig://05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\"}},\"location\":\"_o1\",\"nonce\":2,\"origin\":\"312985bd960ae4c59856b3089b04017ede66506ea181333eec7c9bb88b11c490_o2\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"class Tx {\\n  constructor (rawtx) {\\n    const b = Hex.stringToBytes(rawtx)\\n    let i = 0\\n\\n    function u8 () { return b[i++] }\\n    function u16 () { return u8() + u8() * 256 }\\n    function u32 () { return u16() + u16() * 256 * 256 }\\n    function u64 () { return u32() + u32() * 256 * 256 * 256 * 256 }\\n    function varint () { const b0 = u8(); return b0 === 0xff ? u64() : b0 === 0xfe ? u32() : b0 === 0xfd ? u16() : b0 }\\n    function txid () { const h = Hex.bytesToString(b.slice(i, i + 32).reverse()); i += 32; return h }\\n    function script () { const n = varint(); const h = Hex.bytesToString(b.slice(i, i + n)); i += n; return h }\\n\\n    this.version = u32()\\n\\n    const nin = varint()\\n    this.inputs = []\\n    for (let vin = 0; vin < nin; vin++) {\\n      this.inputs.push({\\n        prevTxId: txid(),\\n        outputIndex: u32(),\\n        script: script(),\\n        sequenceNumber: u32()\\n      })\\n    }\\n\\n    const nout = varint()\\n    this.outputs = []\\n    for (let vout = 0; vout < nout; vout++) {\\n      this.outputs.push({\\n        satoshis: u64(),\\n        script: script()\\n      })\\n    }\\n\\n    this.nLockTime = u32()\\n  }\\n}\",\"version\":\"04\"},\"jig://72a61eb990ffdb6b38e5f955e194fed5ff6b014f75ac6823539ce5613aea0be8_o1\":{\"kind\":\"code\",\"props\":{\"decimals\":0,\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"icon\":{\"emoji\":null},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"symbol\":null,\"version\":\"2.0\"},\"src\":\"class Token extends Jig {\\n  init (amount, owner) {\\n    this._checkAmount(amount)\\n\\n    // The base Token class cannot be created on its own\\n    const extended = this.constructor !== Token\\n    if (!extended) throw new Error('Token must be extended')\\n\\n    // Make sure we are calling from ourself\\n    const minting = caller === this.constructor\\n    const sending = caller && caller.constructor === this.constructor\\n    if (!minting && !sending) throw new Error('Must create token using mint()')\\n\\n    this.sender = sending ? caller.owner : null\\n    this.amount = amount\\n    if (owner) this.owner = owner\\n  }\\n\\n  static mint (amount, owner) {\\n    this.supply += amount\\n    return new this(amount, owner)\\n  }\\n\\n  send (to, amount = this.amount) {\\n    this._checkAmount(amount)\\n\\n    if (this.amount === amount) {\\n      this.destroy()\\n    } else if (this.amount > amount) {\\n      this.amount -= amount\\n    } else {\\n      throw new Error('Not enough funds')\\n    }\\n\\n    return new this.constructor(amount, to)\\n  }\\n\\n  combine (...tokens) {\\n    // If no tokens to combine, nothing to do\\n    if (!tokens.length) return this\\n\\n    // Each token to combine must all be of this type\\n    const all = tokens.concat(this)\\n    if (all.some(token => token.constructor !== this.constructor)) {\\n      throw new Error('Cannot combine different token classes')\\n    }\\n\\n    // Check for duplicate tokens in the array\\n    const countOf = token => all.reduce((count, next) => next === token ? count + 1 : count, 0)\\n    if (all.some(token => countOf(token) > 1)) throw new Error('Cannot combine duplicate tokens')\\n\\n    // Destroy each token, absorbing it into this one\\n    tokens.forEach(token => {\\n      this.amount += token.amount\\n      token.destroy()\\n    })\\n\\n    // There is no sender for combined tokens\\n    this.sender = null\\n\\n    // Make sure our new amount is within safe range\\n    this._checkAmount(this.amount)\\n\\n    return this\\n  }\\n\\n  destroy () {\\n    super.destroy()\\n\\n    this.amount = 0\\n    this.sender = null\\n  }\\n\\n  _checkAmount (amount) {\\n    if (typeof amount !== 'number') throw new Error('amount is not a number')\\n    if (!Number.isInteger(amount)) throw new Error('amount must be an integer')\\n    if (amount <= 0) throw new Error('amount must be positive')\\n    if (amount > Number.MAX_SAFE_INTEGER) throw new Error('amount too large')\\n  }\\n}\",\"version\":\"04\"},\"jig://b17a9af70ab0f46809f908b2e900e395ba40996000bf4f00e3b27a1e93280cf1_o1\":{\"kind\":\"code\",\"props\":{\"decimals\":0,\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"icon\":{\"emoji\":null},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"symbol\":null},\"src\":\"class Token extends Jig {\\n  init (...tokens) {\\n    // The base Token class cannot be created on its own\\n    if (Object.getPrototypeOf(this.constructor) === Jig) {\\n      throw new Error('Token must be extended')\\n    }\\n\\n    // Case: Mint\\n    if (caller === this.constructor) {\\n      this._checkAmount(caller.mintAmount)\\n      this.amount = caller.mintAmount\\n      this.sender = null\\n      return\\n    }\\n\\n    // Case: Send\\n    if (caller && caller.constructor === this.constructor) {\\n      this._checkAmount(caller.sendAmount)\\n      this.amount = caller.sendAmount\\n      this.owner = caller.sendOwner\\n      this.sender = caller.owner\\n      return\\n    }\\n\\n    // Case: Combine\\n    if (!Array.isArray(tokens) || tokens.length < 2) {\\n      throw new Error('Invalid tokens to combine')\\n    }\\n\\n    // Each token to combine must all be of this type\\n    if (tokens.some(token => token.constructor !== this.constructor)) {\\n      throw new Error('Cannot combine different token classes')\\n    }\\n\\n    // Check for duplicate tokens in the array\\n    const countOf = token => tokens.reduce((count, next) => next === token ? count + 1 : count, 0)\\n    if (tokens.some(token => countOf(token) > 1)) throw new Error('Cannot combine duplicate tokens')\\n\\n    // Destroy each token, absorbing it into this one\\n    this.amount = 0\\n    tokens.forEach(token => {\\n      this.amount += token.amount\\n      token.destroy()\\n    })\\n\\n    // There is no sender for combined tokens\\n    this.sender = null\\n\\n    // Make sure our new amount is within safe range\\n    this._checkAmount(this.amount)\\n  }\\n\\n  static mint (amount) {\\n    this.mintAmount = amount\\n    const token = new this()\\n    delete this.mintAmount\\n    this.supply += amount\\n    return token\\n  }\\n\\n  destroy () {\\n    super.destroy()\\n\\n    this.amount = 0\\n    this.sender = null\\n  }\\n\\n  send (to, amount = this.amount) {\\n    this._checkAmount(amount)\\n\\n    if (amount > this.amount) {\\n      throw new Error('Not enough funds')\\n    }\\n\\n    this.sendAmount = amount\\n    this.sendOwner = to\\n    const sent = new this.constructor()\\n    delete this.sendAmount\\n    delete this.sendOwner\\n\\n    if (this.amount === amount) {\\n      this.destroy()\\n    } else {\\n      this.amount -= amount\\n      this.sender = null\\n    }\\n\\n    return sent\\n  }\\n\\n  _checkAmount (amount) {\\n    if (typeof amount !== 'number') throw new Error('amount is not a number')\\n    if (!Number.isInteger(amount)) throw new Error('amount must be an integer')\\n    if (amount <= 0) throw new Error('amount must be positive')\\n    if (amount > Number.MAX_SAFE_INTEGER) throw new Error('amount too large')\\n  }\\n}\",\"version\":\"04\"},\"jig://3b7ef411185bbe3d01caeadbe6f115b0103a546c4ef0ac7474aa6fbb71aff208_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"function sha256 (message) {\\n  if (!Array.isArray(message)) throw new Error(`Invalid bytes: ${message}`)\\n\\n  // Based off https://github.com/emn178/js-sha256/blob/master/src/sha256.js\\n\\n  const EXTRA = [-2147483648, 8388608, 32768, 128]\\n  const SHIFT = [24, 16, 8, 0]\\n  const K = [\\n    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,\\n    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,\\n    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,\\n    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,\\n    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,\\n    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,\\n    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,\\n    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2\\n  ]\\n\\n  const blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]\\n\\n  let h0 = 0x6a09e667\\n  let h1 = 0xbb67ae85\\n  let h2 = 0x3c6ef372\\n  let h3 = 0xa54ff53a\\n  let h4 = 0x510e527f\\n  let h5 = 0x9b05688c\\n  let h6 = 0x1f83d9ab\\n  let h7 = 0x5be0cd19\\n\\n  let block = 0\\n  let start = 0\\n  let bytes = 0\\n  let hBytes = 0\\n  let first = true\\n  let hashed = false\\n  let lastByteIndex = 0\\n\\n  update()\\n  finalize()\\n  return digest()\\n\\n  function update () {\\n    let i\\n    let index = 0\\n    const length = message.length\\n\\n    while (index < length) {\\n      if (hashed) {\\n        hashed = false\\n        blocks[0] = block\\n        blocks[16] = blocks[1] = blocks[2] = blocks[3] =\\n                blocks[4] = blocks[5] = blocks[6] = blocks[7] =\\n                blocks[8] = blocks[9] = blocks[10] = blocks[11] =\\n                blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0\\n      }\\n\\n      for (i = start; index < length && i < 64; ++index) {\\n        blocks[i >> 2] |= message[index] << SHIFT[i++ & 3]\\n      }\\n\\n      lastByteIndex = i\\n      bytes += i - start\\n      if (i >= 64) {\\n        block = blocks[16]\\n        start = i - 64\\n        hash()\\n        hashed = true\\n      } else {\\n        start = i\\n      }\\n    }\\n\\n    if (bytes > 4294967295) {\\n      hBytes += bytes / 4294967296 << 0\\n      bytes = bytes % 4294967296\\n    }\\n  }\\n\\n  function finalize () {\\n    blocks[16] = block\\n    blocks[lastByteIndex >> 2] |= EXTRA[lastByteIndex & 3]\\n    block = blocks[16]\\n    if (lastByteIndex >= 56) {\\n      if (!hashed) {\\n        hash()\\n      }\\n      blocks[0] = block\\n      blocks[16] = blocks[1] = blocks[2] = blocks[3] =\\n            blocks[4] = blocks[5] = blocks[6] = blocks[7] =\\n            blocks[8] = blocks[9] = blocks[10] = blocks[11] =\\n            blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0\\n    }\\n    blocks[14] = hBytes << 3 | bytes >>> 29\\n    blocks[15] = bytes << 3\\n    hash()\\n  }\\n\\n  function hash () {\\n    let a = h0\\n    let b = h1\\n    let c = h2\\n    let d = h3\\n    let e = h4\\n    let f = h5\\n    let g = h6\\n    let h = h7\\n    let j\\n    let s0\\n    let s1\\n    let maj\\n    let t1\\n    let t2\\n    let ch\\n    let ab\\n    let da\\n    let cd\\n    let bc\\n\\n    for (j = 16; j < 64; ++j) {\\n      t1 = blocks[j - 15]\\n      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3)\\n      t1 = blocks[j - 2]\\n      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10)\\n      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0\\n    }\\n\\n    bc = b & c\\n    for (j = 0; j < 64; j += 4) {\\n      if (first) {\\n        ab = 704751109\\n        t1 = blocks[0] - 210244248\\n        h = t1 - 1521486534 << 0\\n        d = t1 + 143694565 << 0\\n        first = false\\n      } else {\\n        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))\\n        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))\\n        ab = a & b\\n        maj = ab ^ (a & c) ^ bc\\n        ch = (e & f) ^ (~e & g)\\n        t1 = h + s1 + ch + K[j] + blocks[j]\\n        t2 = s0 + maj\\n        h = d + t1 << 0\\n        d = t1 + t2 << 0\\n      }\\n      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10))\\n      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7))\\n      da = d & a\\n      maj = da ^ (d & b) ^ ab\\n      ch = (h & e) ^ (~h & f)\\n      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1]\\n      t2 = s0 + maj\\n      g = c + t1 << 0\\n      c = t1 + t2 << 0\\n      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10))\\n      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7))\\n      cd = c & d\\n      maj = cd ^ (c & a) ^ da\\n      ch = (g & h) ^ (~g & e)\\n      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2]\\n      t2 = s0 + maj\\n      f = b + t1 << 0\\n      b = t1 + t2 << 0\\n      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10))\\n      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7))\\n      bc = b & c\\n      maj = bc ^ (b & d) ^ cd\\n      ch = (f & g) ^ (~f & h)\\n      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3]\\n      t2 = s0 + maj\\n      e = a + t1 << 0\\n      a = t1 + t2 << 0\\n    }\\n\\n    h0 = h0 + a << 0\\n    h1 = h1 + b << 0\\n    h2 = h2 + c << 0\\n    h3 = h3 + d << 0\\n    h4 = h4 + e << 0\\n    h5 = h5 + f << 0\\n    h6 = h6 + g << 0\\n    h7 = h7 + h << 0\\n  }\\n\\n  function digest () {\\n    return [\\n      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,\\n      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,\\n      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,\\n      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,\\n      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,\\n      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,\\n      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF,\\n      (h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF\\n    ]\\n  }\\n}\",\"version\":\"04\"},\"jig://b2f52f369d6ac4210585e0d173020106bd338197f136e02bc4d1fb2af3ef789f_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"total\":0,\"version\":\"1.0\"},\"src\":\"class NFT extends Jig {\\n  init (owner, number, metadata) {\\n    // The base NFT class cannot be created on its own\\n    const extended = this.constructor !== NFT\\n    if (!extended) throw new Error('NFT must be extended')\\n\\n    // Make sure we are calling from ourself\\n    const minting = caller === this.constructor\\n    if (!minting) throw new Error('Must create token using mint()')\\n\\n    if (owner) this.owner = owner\\n    if (metadata) this.metadata = metadata\\n\\n    if (number) {\\n      this.number = number\\n      this.no = number // relay compat\\n    }\\n  }\\n\\n  static mint (owner, metadata) {\\n    const max = this.maxSupply || this.max // relay compat\\n    if (max && this.supply >= max) {\\n      throw new Error('Maximum supply exceeded')\\n    }\\n\\n    this.supply++\\n    this.total++ // relay compat\\n\\n    return new this(owner, this.supply, metadata)\\n  }\\n\\n  send (to) {\\n    this.sender = this.owner\\n    this.owner = to\\n  }\\n}\",\"version\":\"04\"},\"jig://780ab8919cb89323707338070323c24ce42cdec2f57d749bd7aceef6635e7a4d_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\"},\"asm\":{\"$jig\":\"61e1265acb3d93f1bf24a593d70b2a6b1c650ec1df90ddece8d6954ae3cdd915_o1\"}},\"location\":\"_o1\",\"nonce\":2,\"origin\":\"90a3ece416f696731430efac9657d28071cc437ebfff5fb1eaf710fe4b3c8d4e_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0,\"sealed\":false},\"src\":\"class Group {\\n      constructor (pubkeys, required) {\\n        this.pubkeys = pubkeys\\n        this.required = typeof required === 'undefined' ? this.pubkeys.length : required\\n      }\\n\\n      script () {\\n        // Check pubkeys\\n        if (!Array.isArray(this.pubkeys)) throw new Error('pubkeys not an array')\\n        if (this.pubkeys.length < 1) throw new Error('pubkeys must have at least one entry')\\n        if (this.pubkeys.length > 16) throw new Error('No more than 16 pubkeys allowed')\\n        const set = new Set()\\n        for (const pubkey of this.pubkeys) set.add(pubkey)\\n        if (set.size !== this.pubkeys.length) throw new Error('pubkeys contains duplicates')\\n        this.pubkeys.forEach(pubkey => Hex.stringToBytes(pubkey))\\n\\n        // Check m\\n        const badRequired = typeof this.required !== 'number' || !Number.isInteger(this.required) || this.required < 1\\n        if (badRequired) throw new Error('required must be a non-negative integer')\\n        if (this.required > this.pubkeys.length) throw new Error('required must be <= the number of pubkeys')\\n\\n        // Create script\\n        // ie. OP_2 <pk1> <pk2> <pk3> OP_3 OP_CHECKMULTISIG\\n        return asm(`OP_${this.required} ${this.pubkeys.join(' ')} OP_${this.pubkeys.length} OP_CHECKMULTISIG`)\\n      }\\n\\n      domain () {\\n        return 1 + this.required * 74 // 1 (OP_0) + (1 + 73) * nsigs\\n      }\\n\\n      add (pubkey) {\\n        if (!this.pubkeys.includes(pubkey)) {\\n          this.pubkeys.push(pubkey)\\n        }\\n      }\\n    }\",\"version\":\"04\"},\"jig://61e1265acb3d93f1bf24a593d70b2a6b1c650ec1df90ddece8d6954ae3cdd915_o1\":{\"kind\":\"code\",\"props\":{\"OP_CODES\":{\"OP_0\":0,\"OP_0NOTEQUAL\":146,\"OP_1\":81,\"OP_10\":90,\"OP_11\":91,\"OP_12\":92,\"OP_13\":93,\"OP_14\":94,\"OP_15\":95,\"OP_16\":96,\"OP_1ADD\":139,\"OP_1NEGATE\":79,\"OP_1SUB\":140,\"OP_2\":82,\"OP_2DROP\":109,\"OP_2DUP\":110,\"OP_2OVER\":112,\"OP_2ROT\":113,\"OP_2SWAP\":114,\"OP_3\":83,\"OP_3DUP\":111,\"OP_4\":84,\"OP_5\":85,\"OP_6\":86,\"OP_7\":87,\"OP_8\":88,\"OP_9\":89,\"OP_ABS\":144,\"OP_ADD\":147,\"OP_AND\":132,\"OP_BIN2NUM\":129,\"OP_BOOLAND\":154,\"OP_BOOLOR\":155,\"OP_CAT\":126,\"OP_CHECKMULTISIG\":174,\"OP_CHECKMULTISIGVERIFY\":175,\"OP_CHECKSIG\":172,\"OP_CHECKSIGVERIFY\":173,\"OP_CODESEPARATOR\":171,\"OP_DEPTH\":116,\"OP_DIV\":150,\"OP_DROP\":117,\"OP_DUP\":118,\"OP_ELSE\":103,\"OP_ENDIF\":104,\"OP_EQUAL\":135,\"OP_EQUALVERIFY\":136,\"OP_FALSE\":0,\"OP_FROMALTSTACK\":108,\"OP_GREATERTHAN\":160,\"OP_GREATERTHANOREQUAL\":162,\"OP_HASH160\":169,\"OP_HASH256\":170,\"OP_IF\":99,\"OP_IFDUP\":115,\"OP_INVALIDOPCODE\":255,\"OP_INVERT\":131,\"OP_LESSTHAN\":159,\"OP_LESSTHANOREQUAL\":161,\"OP_LSHIFT\":152,\"OP_MAX\":164,\"OP_MIN\":163,\"OP_MOD\":151,\"OP_MUL\":149,\"OP_NEGATE\":143,\"OP_NIP\":119,\"OP_NOP\":97,\"OP_NOP1\":176,\"OP_NOP10\":185,\"OP_NOP2\":177,\"OP_NOP3\":178,\"OP_NOP4\":179,\"OP_NOP5\":180,\"OP_NOP6\":181,\"OP_NOP7\":182,\"OP_NOP8\":183,\"OP_NOP9\":184,\"OP_NOT\":145,\"OP_NOTIF\":100,\"OP_NUM2BIN\":128,\"OP_NUMEQUAL\":156,\"OP_NUMEQUALVERIFY\":157,\"OP_NUMNOTEQUAL\":158,\"OP_OR\":133,\"OP_OVER\":120,\"OP_PICK\":121,\"OP_PUBKEY\":254,\"OP_PUBKEYHASH\":253,\"OP_PUSHDATA1\":76,\"OP_PUSHDATA2\":77,\"OP_PUSHDATA4\":78,\"OP_RETURN\":106,\"OP_RIPEMD160\":166,\"OP_ROLL\":122,\"OP_ROT\":123,\"OP_RSHIFT\":153,\"OP_SHA1\":167,\"OP_SHA256\":168,\"OP_SIZE\":130,\"OP_SPLIT\":127,\"OP_SUB\":148,\"OP_SWAP\":124,\"OP_TOALTSTACK\":107,\"OP_TRUE\":81,\"OP_TUCK\":125,\"OP_VERIFY\":105,\"OP_WITHIN\":165,\"OP_XOR\":134},\"deps\":{\"Hex\":{\"$jig\":\"727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"function asm (s) {\\n  const parts = s.split(' ')\\n  let out = []\\n\\n  for (const part of parts) {\\n    // If one of our predefined op-codes\\n    if (typeof asm.OP_CODES[part] !== 'undefined') {\\n      out.push(asm.OP_CODES[part])\\n      continue\\n    }\\n\\n    // Hex data\\n    const bytes = Hex.stringToBytes(part.length === 1 ? '0' + part : part)\\n\\n    // OP_0\\n    if (bytes[0] === 0) {\\n      out.push(bytes[0]) // OP_0\\n      continue\\n    }\\n\\n    // OP_1-OP_16\\n    if (bytes.length === 1 && bytes[0] >= 1 && bytes[0] <= 16) {\\n      out.push(bytes[0] + 0x50)\\n      continue\\n    }\\n\\n    // OP_PUSH+[1-75] <bytes>\\n    if (bytes.length <= 75) {\\n      out = out.concat(bytes.length).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA1 <len> <bytes>\\n    if (bytes.length < 256) {\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA1).concat([bytes.length]).concat(bytes)\\n      continue\\n    }\\n\\n    const floor = x => parseInt(x.toString(), 10)\\n\\n    // OP_PUSHDATA2 <len> <bytes>\\n    if (bytes.length < 256 * 256) {\\n      const len = [floor(bytes.length / 256), bytes.length % 256]\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA2).concat(len).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA4 <len> <bytes>\\n    const len = [\\n      floor(bytes.length / 256 / 256 / 256),\\n      floor(bytes.length / 256 / 256) % 256,\\n      floor(bytes.length / 256) % 256,\\n      bytes.length % 256\\n    ]\\n    out = out.concat(asm.OP_CODES.OP_PUSHDATA4).concat(len).concat(bytes)\\n    continue\\n  }\\n\\n  return Hex.bytesToString(out)\\n}\",\"version\":\"04\"},\"jig://284ce17fd34c0f41835435b03eed149c4e0479361f40132312b4001093bb158f_o1\":{\"kind\":\"code\",\"props\":{\"OP_CODES\":{\"OP_0\":0,\"OP_0NOTEQUAL\":146,\"OP_1\":81,\"OP_10\":90,\"OP_11\":91,\"OP_12\":92,\"OP_13\":93,\"OP_14\":94,\"OP_15\":95,\"OP_16\":96,\"OP_1ADD\":139,\"OP_1NEGATE\":79,\"OP_1SUB\":140,\"OP_2\":82,\"OP_2DROP\":109,\"OP_2DUP\":110,\"OP_2OVER\":112,\"OP_2ROT\":113,\"OP_2SWAP\":114,\"OP_3\":83,\"OP_3DUP\":111,\"OP_4\":84,\"OP_5\":85,\"OP_6\":86,\"OP_7\":87,\"OP_8\":88,\"OP_9\":89,\"OP_ABS\":144,\"OP_ADD\":147,\"OP_AND\":132,\"OP_BIN2NUM\":129,\"OP_BOOLAND\":154,\"OP_BOOLOR\":155,\"OP_CAT\":126,\"OP_CHECKMULTISIG\":174,\"OP_CHECKMULTISIGVERIFY\":175,\"OP_CHECKSIG\":172,\"OP_CHECKSIGVERIFY\":173,\"OP_CODESEPARATOR\":171,\"OP_DEPTH\":116,\"OP_DIV\":150,\"OP_DROP\":117,\"OP_DUP\":118,\"OP_ELSE\":103,\"OP_ENDIF\":104,\"OP_EQUAL\":135,\"OP_EQUALVERIFY\":136,\"OP_FALSE\":0,\"OP_FROMALTSTACK\":108,\"OP_GREATERTHAN\":160,\"OP_GREATERTHANOREQUAL\":162,\"OP_HASH160\":169,\"OP_HASH256\":170,\"OP_IF\":99,\"OP_IFDUP\":115,\"OP_INVALIDOPCODE\":255,\"OP_INVERT\":131,\"OP_LESSTHAN\":159,\"OP_LESSTHANOREQUAL\":161,\"OP_LSHIFT\":152,\"OP_MAX\":164,\"OP_MIN\":163,\"OP_MOD\":151,\"OP_MUL\":149,\"OP_NEGATE\":143,\"OP_NIP\":119,\"OP_NOP\":97,\"OP_NOP1\":176,\"OP_NOP10\":185,\"OP_NOP2\":177,\"OP_NOP3\":178,\"OP_NOP4\":179,\"OP_NOP5\":180,\"OP_NOP6\":181,\"OP_NOP7\":182,\"OP_NOP8\":183,\"OP_NOP9\":184,\"OP_NOT\":145,\"OP_NOTIF\":100,\"OP_NUM2BIN\":128,\"OP_NUMEQUAL\":156,\"OP_NUMEQUALVERIFY\":157,\"OP_NUMNOTEQUAL\":158,\"OP_OR\":133,\"OP_OVER\":120,\"OP_PICK\":121,\"OP_PUBKEY\":254,\"OP_PUBKEYHASH\":253,\"OP_PUSHDATA1\":76,\"OP_PUSHDATA2\":77,\"OP_PUSHDATA4\":78,\"OP_RETURN\":106,\"OP_RIPEMD160\":166,\"OP_ROLL\":122,\"OP_ROT\":123,\"OP_RSHIFT\":153,\"OP_SHA1\":167,\"OP_SHA256\":168,\"OP_SIZE\":130,\"OP_SPLIT\":127,\"OP_SUB\":148,\"OP_SWAP\":124,\"OP_TOALTSTACK\":107,\"OP_TRUE\":81,\"OP_TUCK\":125,\"OP_VERIFY\":105,\"OP_WITHIN\":165,\"OP_XOR\":134},\"deps\":{\"Hex\":{\"$jig\":\"727e7b423b7ee40c0b5be87fba7fa5673ea2d20a74259040a7295d9c32a90011_o1\"}},\"location\":\"_o1\",\"nonce\":3,\"origin\":\"61e1265acb3d93f1bf24a593d70b2a6b1c650ec1df90ddece8d6954ae3cdd915_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"function asm (s) {\\n  const parts = s.split(' ')\\n  let out = []\\n\\n  for (const part of parts) {\\n    // If one of our predefined op-codes\\n    if (typeof asm.OP_CODES[part] !== 'undefined') {\\n      out.push(asm.OP_CODES[part])\\n      continue\\n    }\\n\\n    // Hex data\\n    const bytes = Hex.stringToBytes(part.length === 1 ? '0' + part : part)\\n\\n    // OP_0\\n    if (bytes.length === 1 && bytes[0] === 0) {\\n      out.push(bytes[0]) // OP_0\\n      continue\\n    }\\n\\n    // OP_1-OP_16\\n    if (bytes.length === 1 && bytes[0] >= 1 && bytes[0] <= 16) {\\n      out.push(bytes[0] + 0x50)\\n      continue\\n    }\\n\\n    // OP_PUSH+[1-75] <bytes>\\n    if (bytes.length <= 75) {\\n      out = out.concat(bytes.length).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA1 <len> <bytes>\\n    if (bytes.length < 256) {\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA1).concat([bytes.length]).concat(bytes)\\n      continue\\n    }\\n\\n    const floor = x => parseInt(x.toString(), 10)\\n\\n    // OP_PUSHDATA2 <len> <bytes>\\n    // len must be little endian\\n    if (bytes.length < 256 * 256) {\\n      const len = [bytes.length % 256, floor(bytes.length / 256)]\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA2).concat(len).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA4 <len> <bytes>\\n    // len must be little endian\\n    const len = [\\n      bytes.length % 256,\\n      floor(bytes.length / 256) % 256,\\n      floor(bytes.length / 256 / 256) % 256,\\n      floor(bytes.length / 256 / 256 / 256)\\n    ]\\n    out = out.concat(asm.OP_CODES.OP_PUSHDATA4).concat(len).concat(bytes)\\n    continue\\n  }\\n\\n  return Hex.bytesToString(out)\\n}\",\"version\":\"04\"},\"jig://71fba386341b932380ec5bfedc3a40bce43d4974decdc94c419a94a8ce5dfc23_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"function expect (subject) {\\n  let negated = false\\n\\n  const stringify = x => {\\n    if (typeof x !== 'object' || !x) return x\\n    try { return JSON.stringify(x) } catch (e) { return x.toString() }\\n  }\\n\\n  function check (condition, conditionString, message) {\\n    if (negated ? condition : !condition) {\\n      throw new Error(message || `expected value${negated ? ' not' : ''} to be ${conditionString} but was ${stringify(subject)}`)\\n    }\\n  }\\n\\n  function deepEqual (a, b) {\\n    if (a === b) return true\\n\\n    if (typeof a !== typeof b) return false\\n\\n    if (typeof a !== 'object') return false\\n\\n    if (a === null || b === null) return false\\n\\n    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false\\n\\n    if (Object.keys(a).length !== Object.keys(b).length) return false\\n\\n    if (!Object.keys(a).every(key => deepEqual(a[key], b[key]))) return false\\n\\n    if (a instanceof Set) {\\n      if (a.size !== b.size) return false\\n      if (!deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false\\n    }\\n\\n    if (a instanceof Map) {\\n      if (a.size !== b.size) return false\\n      if (!deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false\\n    }\\n\\n    return true\\n  }\\n\\n  function extendsFrom (a, b) {\\n    if (typeof a !== 'function') return false\\n    if (typeof b !== 'function') return false\\n    while (a) {\\n      a = Object.getPrototypeOf(a)\\n      if (a === b) return true\\n    }\\n    return false\\n  }\\n\\n  return {\\n    get not () { negated = !negated; return this },\\n\\n    toBe: (value, message) => check(subject === value, `${stringify(value)}`, message),\\n    toEqual: (value, message) => check(deepEqual(subject, value), `equal to ${stringify(value)}`, message),\\n    toBeInstanceOf: (Class, message) => check(subject && subject instanceof Class, `an instance of ${Class && Class.name}`, message),\\n\\n    toBeDefined: message => check(typeof subject !== 'undefined', 'defined', message),\\n    toBeNull: message => check(subject === null, 'null', message),\\n\\n    toBeNumber: message => check(typeof subject === 'number', 'a number', message),\\n    toBeInteger: message => check(Number.isInteger(subject), 'an integer', message),\\n    toBeLessThan: (value, message) => check(subject < value && typeof subject === 'number' && typeof value === 'number', `less than ${value}`, message),\\n    toBeLessThanOrEqualTo: (value, message) => check(subject <= value && typeof subject === 'number' && typeof value === 'number', `less than or equal to ${value}`, message),\\n    toBeGreaterThan: (value, message) => check(subject > value && typeof subject === 'number' && typeof value === 'number', `greater than ${value}`, message),\\n    toBeGreaterThanOrEqualTo: (value, message) => check(subject >= value && typeof subject === 'number' && typeof value === 'number', `greater than or equal to ${value}`, message),\\n\\n    toBeBoolean: message => check(typeof subject === 'boolean', 'a boolean', message),\\n    toBeString: message => check(typeof subject === 'string', 'a string', message),\\n    toBeObject: message => check(subject && typeof subject === 'object', 'an object', message),\\n    toBeArray: message => check(Array.isArray(subject), 'an array', message),\\n    toBeSet: message => check(subject instanceof Set, 'a set', message),\\n    toBeMap: message => check(subject instanceof Map, 'a map', message),\\n    toBeUint8Array: message => check(subject instanceof Uint8Array, 'a uint8array', message),\\n\\n    toBeClass: message => check(typeof subject === 'function' && subject.toString().startsWith('class'), 'a class', message),\\n    toBeFunction: message => check(typeof subject === 'function' && !subject.toString().startsWith('class'), 'a function', message),\\n    toBeJigClass: message => check(typeof subject === 'function' && subject.toString().startsWith('class') && extendsFrom(subject, Jig), 'a jig class', message),\\n    toExtendFrom: (Class, message) => check(extendsFrom(subject, Class), `an extension of ${Class && Class.name}`, message)\\n  }\\n}\",\"version\":\"04\"},\"jig://81bcef29b0e4ed745f3422c0b764a33c76d0368af2d2e7dd139db8e00ee3d8a6_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"class Base58 {\\n  static decode (s) {\\n    // Based on https://gist.github.com/diafygi/90a3e80ca1c2793220e5/\\n    if (typeof s !== 'string') throw new Error(`Cannot decode: ${s}`)\\n    const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'\\n    const d = [] // the array for storing the stream of decoded bytes\\n    const b = [] // the result byte array that will be returned\\n    let j // the iterator variable for the byte array (d)\\n    let c // the carry amount variable that is used to overflow from the current byte to the next byte\\n    let n // a temporary placeholder variable for the current byte\\n    for (let i = 0; i < s.length; i++) {\\n      j = 0 // reset the byte iterator\\n      c = A.indexOf(s[i]) // set the initial carry amount equal to the current base58 digit\\n      if (c < 0) throw new Error(`Invalid base58 character: ${s}\\\\n\\\\nDetails: i=${i}, c=${s[i]}`)\\n      if (!(c || b.length ^ i)) b.push(0) // prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)\\n      while (j in d || c) { // start looping through the bytes until there are no more bytes and no carry amount\\n        n = d[j] // set the placeholder for the current byte\\n        n = n ? n * 58 + c : c // shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)\\n        c = n >> 8 // find the new carry amount (1-byte shift of current byte value)\\n        d[j] = n % 256 // reset the current byte to the remainder (the carry amount will pass on the overflow)\\n        j++ // iterate to the next byte\\n      }\\n    }\\n    while (j--) { b.push(d[j]) } // since the byte array is backwards, loop through it in reverse order, and append\\n    if (b.length < 5) throw new Error(`Base58 string too short: ${s}`)\\n    // We assume the checksum and version are correct\\n    return b.slice(1, b.length - 4)\\n  }\\n}\",\"version\":\"04\"},\"jig://05f67252e696160a7c0099ae8d1ec23c39592378773b3a5a55f16bd1286e7dcb_o3\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Berry\":{\"$jig\":\"native://Berry\"},\"txo\":{\"$jig\":\"_o2\"}},\"location\":\"_o3\",\"metadata\":{\"author\":\"Run ▸ Extra\",\"license\":\"MIT\",\"website\":\"https://www.run.network\"},\"nonce\":2,\"origin\":\"5332c013476cd2a2c18710a01188695bc27a5ef1748a51d4a5910feb1111dab4_o1\",\"owner\":\"1PytriYokKN3GpKw84L4vvrGBwUvTYzCpx\",\"satoshis\":0},\"src\":\"class B extends Berry {\\n  init (base64Data, mediaType, encoding, filename, metadata = {}) {\\n    this.base64Data = base64Data\\n    this.mediaType = mediaType\\n    this.encoding = encoding\\n    this.filename = filename\\n    this.metadata = metadata\\n\\n    if (mediaType === 'image/svg+xml' || mediaType === 'image/png') {\\n      this.metadata.image = this\\n    }\\n  }\\n\\n  static async pluck (path, fetch) {\\n    const txid = path.length === 64 ? path : JSON.parse(path).txid\\n    const metadata = path.length === 64 ? {} : JSON.parse(path).metadata\\n    const data = txo(await fetch(txid))\\n    const out = data.out.find(o => o.s2 === '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut')\\n    if (!out) throw new Error(`Cannot find B:// data in ${txid}`)\\n    return new B(out.b3, out.s4, out.s5, out.s6, metadata)\\n  }\\n\\n  static async loadWithMetadata (txid, metadata) {\\n    return this.load(JSON.stringify({ txid, metadata }))\\n  }\\n}\",\"version\":\"04\"}}");

/***/ }),
/* 70 */
/***/ (function(module) {

module.exports = JSON.parse("{\"jig://d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o2\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2\"},\"Tx\":{\"$jig\":\"_o1\"}},\"location\":\"_o2\",\"nonce\":2,\"origin\":\"33e78fa7c43b6d7a60c271d783295fa180b7e9fce07d41ff1b52686936b3e6ae_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"function txo (rawtx) {\\n  const ret = { }\\n\\n  function chunks (script) {\\n    const b = Hex.stringToBytes(script)\\n    let i = 0\\n\\n    function u8 () { return b[i++] }\\n    function u16 () { return u8() + u8() * 256 }\\n    function u32 () { return u16() + u16() * 256 * 256 }\\n    function buf (n) { const h = Hex.bytesToString(b.slice(i, i + n)); i += n; return h }\\n\\n    const OP_PUSHDATA1 = 0x4c\\n    const OP_PUSHDATA2 = 0x4d\\n    const OP_PUSHDATA4 = 0x4e\\n\\n    const chunks = []\\n    while (i < b.length) {\\n      const opcodenum = u8()\\n      if (opcodenum > 0 && opcodenum < OP_PUSHDATA1) {\\n        chunks.push({ buf: buf(opcodenum), len: opcodenum, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA1) {\\n        const len = u8()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA2) {\\n        const len = u16()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else if (opcodenum === OP_PUSHDATA4) {\\n        const len = u32()\\n        chunks.push({ buf: buf(len), len, opcodenum })\\n      } else {\\n        chunks.push({ opcodenum })\\n      }\\n    }\\n    return chunks\\n  }\\n\\n  // https://stackoverflow.com/questions/23190056/hex-to-base64-converter-for-javascript\\n  function bytesToBase64 (arr) {\\n    const abc = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789+/' // base64 alphabet\\n    const bin = n => n.toString(2).padStart(8, 0) // convert num to 8-bit binary string\\n    const l = arr.length\\n    let result = ''\\n    for (let i = 0; i <= (l - 1) / 3; i++) {\\n      const c1 = i * 3 + 1 >= l // case when \\\"=\\\" is on end\\n      const c2 = i * 3 + 2 >= l // case when \\\"=\\\" is on end\\n      const chunk = bin(arr[3 * i]) + bin(c1 ? 0 : arr[3 * i + 1]) + bin(c2 ? 0 : arr[3 * i + 2])\\n      const r = chunk.match(/.{1,6}/g).map((x, j) => j === 3 && c2 ? '=' : (j === 2 && c1 ? '=' : abc[+('0b' + x)]))\\n      result += r.join('')\\n    }\\n    return result\\n  }\\n\\n  function xput (script, output) {\\n    const ret = { }\\n    chunks(script).forEach((c, n) => {\\n      if (c.buf) {\\n        ret['b' + n] = bytesToBase64(Hex.stringToBytes(c.buf))\\n        const enc = c.buf.replace(/[0-9a-f]{2}/g, '%$&')\\n        if (output) try { ret['s' + n] = decodeURIComponent(enc) } catch (e) { }\\n        if (output) ret['h' + n] = c.buf\\n      } else {\\n        ret['b' + n] = { op: c.opcodenum }\\n      }\\n    })\\n    return ret\\n  }\\n\\n  function input (txin, i) {\\n    const ret = xput(txin.script)\\n    ret.e = { h: txin.prevTxId, i: txin.outputIndex }\\n    ret.i = i\\n    ret.seq = txin.sequenceNumber\\n    return ret\\n  }\\n\\n  function output (txout, i) {\\n    const ret = xput(txout.script, true)\\n    ret.e = { v: txout.satoshis, i }\\n    ret.i = i\\n    return ret\\n  }\\n\\n  const tx = new Tx(rawtx)\\n  ret.in = tx.inputs.map(input)\\n  ret.out = tx.outputs.map(output)\\n  ret.lock = tx.nLockTime\\n  return ret\\n}\",\"version\":\"04\"},\"jig://1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o2\",\"nonce\":1,\"origin\":\"_o2\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"class Hex {\\n  static stringToBytes (s) {\\n    if (typeof s !== 'string' || s.length % 2 !== 0) {\\n      throw new Error(`Bad hex: ${s}`)\\n    }\\n\\n    s = s.toLowerCase()\\n\\n    const HEX_CHARS = '0123456789abcdef'.split('')\\n    const bytes = []\\n\\n    for (let i = 0; i < s.length; i += 2) {\\n      const high = HEX_CHARS.indexOf(s[i])\\n      const low = HEX_CHARS.indexOf(s[i + 1])\\n\\n      if (high === -1 || low === -1) {\\n        throw new Error(`Bad hex: ${s}`)\\n      }\\n\\n      bytes.push(high * 16 + low)\\n    }\\n\\n    return bytes\\n  }\\n\\n  static bytesToString (b) {\\n    if (!Array.isArray(b)) throw new Error(`Bad bytes: ${b}`)\\n\\n    const validDigit = x => Number.isInteger(x) && x >= 0 && x < 256\\n    b.forEach(x => { if (!validDigit(x)) throw new Error(`Bad digit: ${x}`) })\\n\\n    return b\\n      .map(x => x.toString('16'))\\n      .map(x => x.length === 1 ? '0' + x : x)\\n      .join('')\\n  }\\n}\",\"version\":\"04\"},\"jig://d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2\"}},\"location\":\"_o1\",\"nonce\":2,\"origin\":\"33e78fa7c43b6d7a60c271d783295fa180b7e9fce07d41ff1b52686936b3e6ae_o2\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"class Tx {\\n  constructor (rawtx) {\\n    const b = Hex.stringToBytes(rawtx)\\n    let i = 0\\n\\n    function u8 () { return b[i++] }\\n    function u16 () { return u8() + u8() * 256 }\\n    function u32 () { return u16() + u16() * 256 * 256 }\\n    function u64 () { return u32() + u32() * 256 * 256 * 256 * 256 }\\n    function varint () { const b0 = u8(); return b0 === 0xff ? u64() : b0 === 0xfe ? u32() : b0 === 0xfd ? u16() : b0 }\\n    function txid () { const h = Hex.bytesToString(b.slice(i, i + 32).reverse()); i += 32; return h }\\n    function script () { const n = varint(); const h = Hex.bytesToString(b.slice(i, i + n)); i += n; return h }\\n\\n    this.version = u32()\\n\\n    const nin = varint()\\n    this.inputs = []\\n    for (let vin = 0; vin < nin; vin++) {\\n      this.inputs.push({\\n        prevTxId: txid(),\\n        outputIndex: u32(),\\n        script: script(),\\n        sequenceNumber: u32()\\n      })\\n    }\\n\\n    const nout = varint()\\n    this.outputs = []\\n    for (let vout = 0; vout < nout; vout++) {\\n      this.outputs.push({\\n        satoshis: u64(),\\n        script: script()\\n      })\\n    }\\n\\n    this.nLockTime = u32()\\n  }\\n}\",\"version\":\"04\"},\"jig://7d14c868fe39439edffe6982b669e7b4d3eb2729eee7c262ec2494ee3e310e99_o1\":{\"kind\":\"code\",\"props\":{\"decimals\":0,\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"icon\":{\"emoji\":null},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"symbol\":null,\"version\":\"2.0\"},\"src\":\"class Token extends Jig {\\n  init (amount, owner) {\\n    this._checkAmount(amount)\\n\\n    // The base Token class cannot be created on its own\\n    const extended = this.constructor !== Token\\n    if (!extended) throw new Error('Token must be extended')\\n\\n    // Make sure we are calling from ourself\\n    const minting = caller === this.constructor\\n    const sending = caller && caller.constructor === this.constructor\\n    if (!minting && !sending) throw new Error('Must create token using mint()')\\n\\n    this.sender = sending ? caller.owner : null\\n    this.amount = amount\\n    if (owner) this.owner = owner\\n  }\\n\\n  static mint (amount, owner) {\\n    this.supply += amount\\n    return new this(amount, owner)\\n  }\\n\\n  send (to, amount = this.amount) {\\n    this._checkAmount(amount)\\n\\n    if (this.amount === amount) {\\n      this.destroy()\\n    } else if (this.amount > amount) {\\n      this.amount -= amount\\n    } else {\\n      throw new Error('Not enough funds')\\n    }\\n\\n    return new this.constructor(amount, to)\\n  }\\n\\n  combine (...tokens) {\\n    // If no tokens to combine, nothing to do\\n    if (!tokens.length) return this\\n\\n    // Each token to combine must all be of this type\\n    const all = tokens.concat(this)\\n    if (all.some(token => token.constructor !== this.constructor)) {\\n      throw new Error('Cannot combine different token classes')\\n    }\\n\\n    // Check for duplicate tokens in the array\\n    const countOf = token => all.reduce((count, next) => next === token ? count + 1 : count, 0)\\n    if (all.some(token => countOf(token) > 1)) throw new Error('Cannot combine duplicate tokens')\\n\\n    // Destroy each token, absorbing it into this one\\n    tokens.forEach(token => {\\n      this.amount += token.amount\\n      token.destroy()\\n    })\\n\\n    // There is no sender for combined tokens\\n    this.sender = null\\n\\n    // Make sure our new amount is within safe range\\n    this._checkAmount(this.amount)\\n\\n    return this\\n  }\\n\\n  destroy () {\\n    super.destroy()\\n\\n    this.amount = 0\\n    this.sender = null\\n  }\\n\\n  _checkAmount (amount) {\\n    if (typeof amount !== 'number') throw new Error('amount is not a number')\\n    if (!Number.isInteger(amount)) throw new Error('amount must be an integer')\\n    if (amount <= 0) throw new Error('amount must be positive')\\n    if (amount > Number.MAX_SAFE_INTEGER) throw new Error('amount too large')\\n  }\\n}\",\"version\":\"04\"},\"jig://0bdf33a334a60909f4c8dab345500cbb313fbfd50b1d98120227eae092b81c39_o1\":{\"kind\":\"code\",\"props\":{\"decimals\":0,\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"icon\":{\"emoji\":null},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"symbol\":null},\"src\":\"class Token extends Jig {\\n  init (...tokens) {\\n    // The base Token class cannot be created on its own\\n    if (Object.getPrototypeOf(this.constructor) === Jig) {\\n      throw new Error('Token must be extended')\\n    }\\n\\n    // Case: Mint\\n    if (caller === this.constructor) {\\n      this._checkAmount(caller.mintAmount)\\n      this.amount = caller.mintAmount\\n      this.sender = null\\n      return\\n    }\\n\\n    // Case: Send\\n    if (caller && caller.constructor === this.constructor) {\\n      this._checkAmount(caller.sendAmount)\\n      this.amount = caller.sendAmount\\n      this.owner = caller.sendOwner\\n      this.sender = caller.owner\\n      return\\n    }\\n\\n    // Case: Combine\\n    if (!Array.isArray(tokens) || tokens.length < 2) {\\n      throw new Error('Invalid tokens to combine')\\n    }\\n\\n    // Each token to combine must all be of this type\\n    if (tokens.some(token => token.constructor !== this.constructor)) {\\n      throw new Error('Cannot combine different token classes')\\n    }\\n\\n    // Check for duplicate tokens in the array\\n    const countOf = token => tokens.reduce((count, next) => next === token ? count + 1 : count, 0)\\n    if (tokens.some(token => countOf(token) > 1)) throw new Error('Cannot combine duplicate tokens')\\n\\n    // Destroy each token, absorbing it into this one\\n    this.amount = 0\\n    tokens.forEach(token => {\\n      this.amount += token.amount\\n      token.destroy()\\n    })\\n\\n    // There is no sender for combined tokens\\n    this.sender = null\\n\\n    // Make sure our new amount is within safe range\\n    this._checkAmount(this.amount)\\n  }\\n\\n  static mint (amount) {\\n    this.mintAmount = amount\\n    const token = new this()\\n    delete this.mintAmount\\n    this.supply += amount\\n    return token\\n  }\\n\\n  destroy () {\\n    super.destroy()\\n\\n    this.amount = 0\\n    this.sender = null\\n  }\\n\\n  send (to, amount = this.amount) {\\n    this._checkAmount(amount)\\n\\n    if (amount > this.amount) {\\n      throw new Error('Not enough funds')\\n    }\\n\\n    this.sendAmount = amount\\n    this.sendOwner = to\\n    const sent = new this.constructor()\\n    delete this.sendAmount\\n    delete this.sendOwner\\n\\n    if (this.amount === amount) {\\n      this.destroy()\\n    } else {\\n      this.amount -= amount\\n      this.sender = null\\n    }\\n\\n    return sent\\n  }\\n\\n  _checkAmount (amount) {\\n    if (typeof amount !== 'number') throw new Error('amount is not a number')\\n    if (!Number.isInteger(amount)) throw new Error('amount must be an integer')\\n    if (amount <= 0) throw new Error('amount must be positive')\\n    if (amount > Number.MAX_SAFE_INTEGER) throw new Error('amount too large')\\n  }\\n}\",\"version\":\"04\"},\"jig://4a1929527605577a6b30710e6001b9379400421d8089d34bb0404dd558529417_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"function sha256 (message) {\\n  if (!Array.isArray(message)) throw new Error(`Invalid bytes: ${message}`)\\n\\n  // Based off https://github.com/emn178/js-sha256/blob/master/src/sha256.js\\n\\n  const EXTRA = [-2147483648, 8388608, 32768, 128]\\n  const SHIFT = [24, 16, 8, 0]\\n  const K = [\\n    0x428a2f98, 0x71374491, 0xb5c0fbcf, 0xe9b5dba5, 0x3956c25b, 0x59f111f1, 0x923f82a4, 0xab1c5ed5,\\n    0xd807aa98, 0x12835b01, 0x243185be, 0x550c7dc3, 0x72be5d74, 0x80deb1fe, 0x9bdc06a7, 0xc19bf174,\\n    0xe49b69c1, 0xefbe4786, 0x0fc19dc6, 0x240ca1cc, 0x2de92c6f, 0x4a7484aa, 0x5cb0a9dc, 0x76f988da,\\n    0x983e5152, 0xa831c66d, 0xb00327c8, 0xbf597fc7, 0xc6e00bf3, 0xd5a79147, 0x06ca6351, 0x14292967,\\n    0x27b70a85, 0x2e1b2138, 0x4d2c6dfc, 0x53380d13, 0x650a7354, 0x766a0abb, 0x81c2c92e, 0x92722c85,\\n    0xa2bfe8a1, 0xa81a664b, 0xc24b8b70, 0xc76c51a3, 0xd192e819, 0xd6990624, 0xf40e3585, 0x106aa070,\\n    0x19a4c116, 0x1e376c08, 0x2748774c, 0x34b0bcb5, 0x391c0cb3, 0x4ed8aa4a, 0x5b9cca4f, 0x682e6ff3,\\n    0x748f82ee, 0x78a5636f, 0x84c87814, 0x8cc70208, 0x90befffa, 0xa4506ceb, 0xbef9a3f7, 0xc67178f2\\n  ]\\n\\n  const blocks = [0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0, 0]\\n\\n  let h0 = 0x6a09e667\\n  let h1 = 0xbb67ae85\\n  let h2 = 0x3c6ef372\\n  let h3 = 0xa54ff53a\\n  let h4 = 0x510e527f\\n  let h5 = 0x9b05688c\\n  let h6 = 0x1f83d9ab\\n  let h7 = 0x5be0cd19\\n\\n  let block = 0\\n  let start = 0\\n  let bytes = 0\\n  let hBytes = 0\\n  let first = true\\n  let hashed = false\\n  let lastByteIndex = 0\\n\\n  update()\\n  finalize()\\n  return digest()\\n\\n  function update () {\\n    let i\\n    let index = 0\\n    const length = message.length\\n\\n    while (index < length) {\\n      if (hashed) {\\n        hashed = false\\n        blocks[0] = block\\n        blocks[16] = blocks[1] = blocks[2] = blocks[3] =\\n                blocks[4] = blocks[5] = blocks[6] = blocks[7] =\\n                blocks[8] = blocks[9] = blocks[10] = blocks[11] =\\n                blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0\\n      }\\n\\n      for (i = start; index < length && i < 64; ++index) {\\n        blocks[i >> 2] |= message[index] << SHIFT[i++ & 3]\\n      }\\n\\n      lastByteIndex = i\\n      bytes += i - start\\n      if (i >= 64) {\\n        block = blocks[16]\\n        start = i - 64\\n        hash()\\n        hashed = true\\n      } else {\\n        start = i\\n      }\\n    }\\n\\n    if (bytes > 4294967295) {\\n      hBytes += bytes / 4294967296 << 0\\n      bytes = bytes % 4294967296\\n    }\\n  }\\n\\n  function finalize () {\\n    blocks[16] = block\\n    blocks[lastByteIndex >> 2] |= EXTRA[lastByteIndex & 3]\\n    block = blocks[16]\\n    if (lastByteIndex >= 56) {\\n      if (!hashed) {\\n        hash()\\n      }\\n      blocks[0] = block\\n      blocks[16] = blocks[1] = blocks[2] = blocks[3] =\\n            blocks[4] = blocks[5] = blocks[6] = blocks[7] =\\n            blocks[8] = blocks[9] = blocks[10] = blocks[11] =\\n            blocks[12] = blocks[13] = blocks[14] = blocks[15] = 0\\n    }\\n    blocks[14] = hBytes << 3 | bytes >>> 29\\n    blocks[15] = bytes << 3\\n    hash()\\n  }\\n\\n  function hash () {\\n    let a = h0\\n    let b = h1\\n    let c = h2\\n    let d = h3\\n    let e = h4\\n    let f = h5\\n    let g = h6\\n    let h = h7\\n    let j\\n    let s0\\n    let s1\\n    let maj\\n    let t1\\n    let t2\\n    let ch\\n    let ab\\n    let da\\n    let cd\\n    let bc\\n\\n    for (j = 16; j < 64; ++j) {\\n      t1 = blocks[j - 15]\\n      s0 = ((t1 >>> 7) | (t1 << 25)) ^ ((t1 >>> 18) | (t1 << 14)) ^ (t1 >>> 3)\\n      t1 = blocks[j - 2]\\n      s1 = ((t1 >>> 17) | (t1 << 15)) ^ ((t1 >>> 19) | (t1 << 13)) ^ (t1 >>> 10)\\n      blocks[j] = blocks[j - 16] + s0 + blocks[j - 7] + s1 << 0\\n    }\\n\\n    bc = b & c\\n    for (j = 0; j < 64; j += 4) {\\n      if (first) {\\n        ab = 704751109\\n        t1 = blocks[0] - 210244248\\n        h = t1 - 1521486534 << 0\\n        d = t1 + 143694565 << 0\\n        first = false\\n      } else {\\n        s0 = ((a >>> 2) | (a << 30)) ^ ((a >>> 13) | (a << 19)) ^ ((a >>> 22) | (a << 10))\\n        s1 = ((e >>> 6) | (e << 26)) ^ ((e >>> 11) | (e << 21)) ^ ((e >>> 25) | (e << 7))\\n        ab = a & b\\n        maj = ab ^ (a & c) ^ bc\\n        ch = (e & f) ^ (~e & g)\\n        t1 = h + s1 + ch + K[j] + blocks[j]\\n        t2 = s0 + maj\\n        h = d + t1 << 0\\n        d = t1 + t2 << 0\\n      }\\n      s0 = ((d >>> 2) | (d << 30)) ^ ((d >>> 13) | (d << 19)) ^ ((d >>> 22) | (d << 10))\\n      s1 = ((h >>> 6) | (h << 26)) ^ ((h >>> 11) | (h << 21)) ^ ((h >>> 25) | (h << 7))\\n      da = d & a\\n      maj = da ^ (d & b) ^ ab\\n      ch = (h & e) ^ (~h & f)\\n      t1 = g + s1 + ch + K[j + 1] + blocks[j + 1]\\n      t2 = s0 + maj\\n      g = c + t1 << 0\\n      c = t1 + t2 << 0\\n      s0 = ((c >>> 2) | (c << 30)) ^ ((c >>> 13) | (c << 19)) ^ ((c >>> 22) | (c << 10))\\n      s1 = ((g >>> 6) | (g << 26)) ^ ((g >>> 11) | (g << 21)) ^ ((g >>> 25) | (g << 7))\\n      cd = c & d\\n      maj = cd ^ (c & a) ^ da\\n      ch = (g & h) ^ (~g & e)\\n      t1 = f + s1 + ch + K[j + 2] + blocks[j + 2]\\n      t2 = s0 + maj\\n      f = b + t1 << 0\\n      b = t1 + t2 << 0\\n      s0 = ((b >>> 2) | (b << 30)) ^ ((b >>> 13) | (b << 19)) ^ ((b >>> 22) | (b << 10))\\n      s1 = ((f >>> 6) | (f << 26)) ^ ((f >>> 11) | (f << 21)) ^ ((f >>> 25) | (f << 7))\\n      bc = b & c\\n      maj = bc ^ (b & d) ^ cd\\n      ch = (f & g) ^ (~f & h)\\n      t1 = e + s1 + ch + K[j + 3] + blocks[j + 3]\\n      t2 = s0 + maj\\n      e = a + t1 << 0\\n      a = t1 + t2 << 0\\n    }\\n\\n    h0 = h0 + a << 0\\n    h1 = h1 + b << 0\\n    h2 = h2 + c << 0\\n    h3 = h3 + d << 0\\n    h4 = h4 + e << 0\\n    h5 = h5 + f << 0\\n    h6 = h6 + g << 0\\n    h7 = h7 + h << 0\\n  }\\n\\n  function digest () {\\n    return [\\n      (h0 >> 24) & 0xFF, (h0 >> 16) & 0xFF, (h0 >> 8) & 0xFF, h0 & 0xFF,\\n      (h1 >> 24) & 0xFF, (h1 >> 16) & 0xFF, (h1 >> 8) & 0xFF, h1 & 0xFF,\\n      (h2 >> 24) & 0xFF, (h2 >> 16) & 0xFF, (h2 >> 8) & 0xFF, h2 & 0xFF,\\n      (h3 >> 24) & 0xFF, (h3 >> 16) & 0xFF, (h3 >> 8) & 0xFF, h3 & 0xFF,\\n      (h4 >> 24) & 0xFF, (h4 >> 16) & 0xFF, (h4 >> 8) & 0xFF, h4 & 0xFF,\\n      (h5 >> 24) & 0xFF, (h5 >> 16) & 0xFF, (h5 >> 8) & 0xFF, h5 & 0xFF,\\n      (h6 >> 24) & 0xFF, (h6 >> 16) & 0xFF, (h6 >> 8) & 0xFF, h6 & 0xFF,\\n      (h7 >> 24) & 0xFF, (h7 >> 16) & 0xFF, (h7 >> 8) & 0xFF, h7 & 0xFF\\n    ]\\n  }\\n}\",\"version\":\"04\"},\"jig://8554b58e95bbd7a1899b54ca1318cc3ce140c6cd7ed64789dcaf5ea5dcfdb1f1_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0,\"sealed\":false,\"supply\":0,\"total\":0,\"version\":\"1.0\"},\"src\":\"class NFT extends Jig {\\n  init (owner, number, metadata) {\\n    // The base NFT class cannot be created on its own\\n    const extended = this.constructor !== NFT\\n    if (!extended) throw new Error('NFT must be extended')\\n\\n    // Make sure we are calling from ourself\\n    const minting = caller === this.constructor\\n    if (!minting) throw new Error('Must create token using mint()')\\n\\n    if (owner) this.owner = owner\\n    if (metadata) this.metadata = metadata\\n\\n    if (number) {\\n      this.number = number\\n      this.no = number // relay compat\\n    }\\n  }\\n\\n  static mint (owner, metadata) {\\n    const max = this.maxSupply || this.max // relay compat\\n    if (max && this.supply >= max) {\\n      throw new Error('Maximum supply exceeded')\\n    }\\n\\n    this.supply++\\n    this.total++ // relay compat\\n\\n    return new this(owner, this.supply, metadata)\\n  }\\n\\n  send (to) {\\n    this.sender = this.owner\\n    this.owner = to\\n  }\\n}\",\"version\":\"04\"},\"jig://63e0e1268d8ab021d1c578afb8eaa0828ccbba431ffffd9309d04b78ebeb6e56_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Hex\":{\"$jig\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2\"},\"asm\":{\"$jig\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o1\"}},\"location\":\"_o1\",\"nonce\":3,\"origin\":\"03320f1244e509bb421e6f1ff724bf1156182890c3768cfa4ea127a78f9913d2_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0,\"sealed\":false},\"src\":\"class Group {\\n      constructor (pubkeys, required) {\\n        this.pubkeys = pubkeys\\n        this.required = typeof required === 'undefined' ? this.pubkeys.length : required\\n      }\\n\\n      script () {\\n        // Check pubkeys\\n        if (!Array.isArray(this.pubkeys)) throw new Error('pubkeys not an array')\\n        if (this.pubkeys.length < 1) throw new Error('pubkeys must have at least one entry')\\n        if (this.pubkeys.length > 16) throw new Error('No more than 16 pubkeys allowed')\\n        const set = new Set()\\n        for (const pubkey of this.pubkeys) set.add(pubkey)\\n        if (set.size !== this.pubkeys.length) throw new Error('pubkeys contains duplicates')\\n        this.pubkeys.forEach(pubkey => Hex.stringToBytes(pubkey))\\n\\n        // Check m\\n        const badRequired = typeof this.required !== 'number' || !Number.isInteger(this.required) || this.required < 1\\n        if (badRequired) throw new Error('required must be a non-negative integer')\\n        if (this.required > this.pubkeys.length) throw new Error('required must be <= the number of pubkeys')\\n\\n        // Create script\\n        // ie. OP_2 <pk1> <pk2> <pk3> OP_3 OP_CHECKMULTISIG\\n        return asm(`OP_${this.required} ${this.pubkeys.join(' ')} OP_${this.pubkeys.length} OP_CHECKMULTISIG`)\\n      }\\n\\n      domain () {\\n        return 1 + this.required * 74 // 1 (OP_0) + (1 + 73) * nsigs\\n      }\\n\\n      add (pubkey) {\\n        if (!this.pubkeys.includes(pubkey)) {\\n          this.pubkeys.push(pubkey)\\n        }\\n      }\\n    }\",\"version\":\"04\"},\"jig://1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o1\":{\"kind\":\"code\",\"props\":{\"OP_CODES\":{\"OP_0\":0,\"OP_0NOTEQUAL\":146,\"OP_1\":81,\"OP_10\":90,\"OP_11\":91,\"OP_12\":92,\"OP_13\":93,\"OP_14\":94,\"OP_15\":95,\"OP_16\":96,\"OP_1ADD\":139,\"OP_1NEGATE\":79,\"OP_1SUB\":140,\"OP_2\":82,\"OP_2DROP\":109,\"OP_2DUP\":110,\"OP_2OVER\":112,\"OP_2ROT\":113,\"OP_2SWAP\":114,\"OP_3\":83,\"OP_3DUP\":111,\"OP_4\":84,\"OP_5\":85,\"OP_6\":86,\"OP_7\":87,\"OP_8\":88,\"OP_9\":89,\"OP_ABS\":144,\"OP_ADD\":147,\"OP_AND\":132,\"OP_BIN2NUM\":129,\"OP_BOOLAND\":154,\"OP_BOOLOR\":155,\"OP_CAT\":126,\"OP_CHECKMULTISIG\":174,\"OP_CHECKMULTISIGVERIFY\":175,\"OP_CHECKSIG\":172,\"OP_CHECKSIGVERIFY\":173,\"OP_CODESEPARATOR\":171,\"OP_DEPTH\":116,\"OP_DIV\":150,\"OP_DROP\":117,\"OP_DUP\":118,\"OP_ELSE\":103,\"OP_ENDIF\":104,\"OP_EQUAL\":135,\"OP_EQUALVERIFY\":136,\"OP_FALSE\":0,\"OP_FROMALTSTACK\":108,\"OP_GREATERTHAN\":160,\"OP_GREATERTHANOREQUAL\":162,\"OP_HASH160\":169,\"OP_HASH256\":170,\"OP_IF\":99,\"OP_IFDUP\":115,\"OP_INVALIDOPCODE\":255,\"OP_INVERT\":131,\"OP_LESSTHAN\":159,\"OP_LESSTHANOREQUAL\":161,\"OP_LSHIFT\":152,\"OP_MAX\":164,\"OP_MIN\":163,\"OP_MOD\":151,\"OP_MUL\":149,\"OP_NEGATE\":143,\"OP_NIP\":119,\"OP_NOP\":97,\"OP_NOP1\":176,\"OP_NOP10\":185,\"OP_NOP2\":177,\"OP_NOP3\":178,\"OP_NOP4\":179,\"OP_NOP5\":180,\"OP_NOP6\":181,\"OP_NOP7\":182,\"OP_NOP8\":183,\"OP_NOP9\":184,\"OP_NOT\":145,\"OP_NOTIF\":100,\"OP_NUM2BIN\":128,\"OP_NUMEQUAL\":156,\"OP_NUMEQUALVERIFY\":157,\"OP_NUMNOTEQUAL\":158,\"OP_OR\":133,\"OP_OVER\":120,\"OP_PICK\":121,\"OP_PUBKEY\":254,\"OP_PUBKEYHASH\":253,\"OP_PUSHDATA1\":76,\"OP_PUSHDATA2\":77,\"OP_PUSHDATA4\":78,\"OP_RETURN\":106,\"OP_RIPEMD160\":166,\"OP_ROLL\":122,\"OP_ROT\":123,\"OP_RSHIFT\":153,\"OP_SHA1\":167,\"OP_SHA256\":168,\"OP_SIZE\":130,\"OP_SPLIT\":127,\"OP_SUB\":148,\"OP_SWAP\":124,\"OP_TOALTSTACK\":107,\"OP_TRUE\":81,\"OP_TUCK\":125,\"OP_VERIFY\":105,\"OP_WITHIN\":165,\"OP_XOR\":134},\"deps\":{\"Hex\":{\"$jig\":\"_o2\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"function asm (s) {\\n  const parts = s.split(' ')\\n  let out = []\\n\\n  for (const part of parts) {\\n    // If one of our predefined op-codes\\n    if (typeof asm.OP_CODES[part] !== 'undefined') {\\n      out.push(asm.OP_CODES[part])\\n      continue\\n    }\\n\\n    // Hex data\\n    const bytes = Hex.stringToBytes(part.length === 1 ? '0' + part : part)\\n\\n    // OP_0\\n    if (bytes[0] === 0) {\\n      out.push(bytes[0]) // OP_0\\n      continue\\n    }\\n\\n    // OP_1-OP_16\\n    if (bytes.length === 1 && bytes[0] >= 1 && bytes[0] <= 16) {\\n      out.push(bytes[0] + 0x50)\\n      continue\\n    }\\n\\n    // OP_PUSH+[1-75] <bytes>\\n    if (bytes.length <= 75) {\\n      out = out.concat(bytes.length).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA1 <len> <bytes>\\n    if (bytes.length < 256) {\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA1).concat([bytes.length]).concat(bytes)\\n      continue\\n    }\\n\\n    const floor = x => parseInt(x.toString(), 10)\\n\\n    // OP_PUSHDATA2 <len> <bytes>\\n    if (bytes.length < 256 * 256) {\\n      const len = [floor(bytes.length / 256), bytes.length % 256]\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA2).concat(len).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA4 <len> <bytes>\\n    const len = [\\n      floor(bytes.length / 256 / 256 / 256),\\n      floor(bytes.length / 256 / 256) % 256,\\n      floor(bytes.length / 256) % 256,\\n      bytes.length % 256\\n    ]\\n    out = out.concat(asm.OP_CODES.OP_PUSHDATA4).concat(len).concat(bytes)\\n    continue\\n  }\\n\\n  return Hex.bytesToString(out)\\n}\",\"version\":\"04\"},\"jig://03e21aa8fcf08fa6985029ad2e697a2309962527700246d47d891add3cfce3ac_o1\":{\"kind\":\"code\",\"props\":{\"OP_CODES\":{\"OP_0\":0,\"OP_0NOTEQUAL\":146,\"OP_1\":81,\"OP_10\":90,\"OP_11\":91,\"OP_12\":92,\"OP_13\":93,\"OP_14\":94,\"OP_15\":95,\"OP_16\":96,\"OP_1ADD\":139,\"OP_1NEGATE\":79,\"OP_1SUB\":140,\"OP_2\":82,\"OP_2DROP\":109,\"OP_2DUP\":110,\"OP_2OVER\":112,\"OP_2ROT\":113,\"OP_2SWAP\":114,\"OP_3\":83,\"OP_3DUP\":111,\"OP_4\":84,\"OP_5\":85,\"OP_6\":86,\"OP_7\":87,\"OP_8\":88,\"OP_9\":89,\"OP_ABS\":144,\"OP_ADD\":147,\"OP_AND\":132,\"OP_BIN2NUM\":129,\"OP_BOOLAND\":154,\"OP_BOOLOR\":155,\"OP_CAT\":126,\"OP_CHECKMULTISIG\":174,\"OP_CHECKMULTISIGVERIFY\":175,\"OP_CHECKSIG\":172,\"OP_CHECKSIGVERIFY\":173,\"OP_CODESEPARATOR\":171,\"OP_DEPTH\":116,\"OP_DIV\":150,\"OP_DROP\":117,\"OP_DUP\":118,\"OP_ELSE\":103,\"OP_ENDIF\":104,\"OP_EQUAL\":135,\"OP_EQUALVERIFY\":136,\"OP_FALSE\":0,\"OP_FROMALTSTACK\":108,\"OP_GREATERTHAN\":160,\"OP_GREATERTHANOREQUAL\":162,\"OP_HASH160\":169,\"OP_HASH256\":170,\"OP_IF\":99,\"OP_IFDUP\":115,\"OP_INVALIDOPCODE\":255,\"OP_INVERT\":131,\"OP_LESSTHAN\":159,\"OP_LESSTHANOREQUAL\":161,\"OP_LSHIFT\":152,\"OP_MAX\":164,\"OP_MIN\":163,\"OP_MOD\":151,\"OP_MUL\":149,\"OP_NEGATE\":143,\"OP_NIP\":119,\"OP_NOP\":97,\"OP_NOP1\":176,\"OP_NOP10\":185,\"OP_NOP2\":177,\"OP_NOP3\":178,\"OP_NOP4\":179,\"OP_NOP5\":180,\"OP_NOP6\":181,\"OP_NOP7\":182,\"OP_NOP8\":183,\"OP_NOP9\":184,\"OP_NOT\":145,\"OP_NOTIF\":100,\"OP_NUM2BIN\":128,\"OP_NUMEQUAL\":156,\"OP_NUMEQUALVERIFY\":157,\"OP_NUMNOTEQUAL\":158,\"OP_OR\":133,\"OP_OVER\":120,\"OP_PICK\":121,\"OP_PUBKEY\":254,\"OP_PUBKEYHASH\":253,\"OP_PUSHDATA1\":76,\"OP_PUSHDATA2\":77,\"OP_PUSHDATA4\":78,\"OP_RETURN\":106,\"OP_RIPEMD160\":166,\"OP_ROLL\":122,\"OP_ROT\":123,\"OP_RSHIFT\":153,\"OP_SHA1\":167,\"OP_SHA256\":168,\"OP_SIZE\":130,\"OP_SPLIT\":127,\"OP_SUB\":148,\"OP_SWAP\":124,\"OP_TOALTSTACK\":107,\"OP_TRUE\":81,\"OP_TUCK\":125,\"OP_VERIFY\":105,\"OP_WITHIN\":165,\"OP_XOR\":134},\"deps\":{\"Hex\":{\"$jig\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o2\"}},\"location\":\"_o1\",\"nonce\":3,\"origin\":\"1f0abf8d94477b1cb57629d861376616f6e1d7b78aba23a19da3e6169caf489e_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"function asm (s) {\\n  const parts = s.split(' ')\\n  let out = []\\n\\n  for (const part of parts) {\\n    // If one of our predefined op-codes\\n    if (typeof asm.OP_CODES[part] !== 'undefined') {\\n      out.push(asm.OP_CODES[part])\\n      continue\\n    }\\n\\n    // Hex data\\n    const bytes = Hex.stringToBytes(part.length === 1 ? '0' + part : part)\\n\\n    // OP_0\\n    if (bytes.length === 1 && bytes[0] === 0) {\\n      out.push(bytes[0]) // OP_0\\n      continue\\n    }\\n\\n    // OP_1-OP_16\\n    if (bytes.length === 1 && bytes[0] >= 1 && bytes[0] <= 16) {\\n      out.push(bytes[0] + 0x50)\\n      continue\\n    }\\n\\n    // OP_PUSH+[1-75] <bytes>\\n    if (bytes.length <= 75) {\\n      out = out.concat(bytes.length).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA1 <len> <bytes>\\n    if (bytes.length < 256) {\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA1).concat([bytes.length]).concat(bytes)\\n      continue\\n    }\\n\\n    const floor = x => parseInt(x.toString(), 10)\\n\\n    // OP_PUSHDATA2 <len> <bytes>\\n    // len must be little endian\\n    if (bytes.length < 256 * 256) {\\n      const len = [bytes.length % 256, floor(bytes.length / 256)]\\n      out = out.concat(asm.OP_CODES.OP_PUSHDATA2).concat(len).concat(bytes)\\n      continue\\n    }\\n\\n    // OP_PUSHDATA4 <len> <bytes>\\n    // len must be little endian\\n    const len = [\\n      bytes.length % 256,\\n      floor(bytes.length / 256) % 256,\\n      floor(bytes.length / 256 / 256) % 256,\\n      floor(bytes.length / 256 / 256 / 256)\\n    ]\\n    out = out.concat(asm.OP_CODES.OP_PUSHDATA4).concat(len).concat(bytes)\\n    continue\\n  }\\n\\n  return Hex.bytesToString(out)\\n}\",\"version\":\"04\"},\"jig://f97d4ac2a3d6f5ed09fad4a4f341619dc5a3773d9844ff95c99c5d4f8388de2f_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Jig\":{\"$jig\":\"native://Jig\"}},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"function expect (subject) {\\n  let negated = false\\n\\n  const stringify = x => {\\n    if (typeof x !== 'object' || !x) return x\\n    try { return JSON.stringify(x) } catch (e) { return x.toString() }\\n  }\\n\\n  function check (condition, conditionString, message) {\\n    if (negated ? condition : !condition) {\\n      throw new Error(message || `expected value${negated ? ' not' : ''} to be ${conditionString} but was ${stringify(subject)}`)\\n    }\\n  }\\n\\n  function deepEqual (a, b) {\\n    if (a === b) return true\\n\\n    if (typeof a !== typeof b) return false\\n\\n    if (typeof a !== 'object') return false\\n\\n    if (a === null || b === null) return false\\n\\n    if (Object.getPrototypeOf(a) !== Object.getPrototypeOf(b)) return false\\n\\n    if (Object.keys(a).length !== Object.keys(b).length) return false\\n\\n    if (!Object.keys(a).every(key => deepEqual(a[key], b[key]))) return false\\n\\n    if (a instanceof Set) {\\n      if (a.size !== b.size) return false\\n      if (!deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false\\n    }\\n\\n    if (a instanceof Map) {\\n      if (a.size !== b.size) return false\\n      if (!deepEqual(Array.from(a.entries()), Array.from(b.entries()))) return false\\n    }\\n\\n    return true\\n  }\\n\\n  function extendsFrom (a, b) {\\n    if (typeof a !== 'function') return false\\n    if (typeof b !== 'function') return false\\n    while (a) {\\n      a = Object.getPrototypeOf(a)\\n      if (a === b) return true\\n    }\\n    return false\\n  }\\n\\n  return {\\n    get not () { negated = !negated; return this },\\n\\n    toBe: (value, message) => check(subject === value, `${stringify(value)}`, message),\\n    toEqual: (value, message) => check(deepEqual(subject, value), `equal to ${stringify(value)}`, message),\\n    toBeInstanceOf: (Class, message) => check(subject && subject instanceof Class, `an instance of ${Class && Class.name}`, message),\\n\\n    toBeDefined: message => check(typeof subject !== 'undefined', 'defined', message),\\n    toBeNull: message => check(subject === null, 'null', message),\\n\\n    toBeNumber: message => check(typeof subject === 'number', 'a number', message),\\n    toBeInteger: message => check(Number.isInteger(subject), 'an integer', message),\\n    toBeLessThan: (value, message) => check(subject < value && typeof subject === 'number' && typeof value === 'number', `less than ${value}`, message),\\n    toBeLessThanOrEqualTo: (value, message) => check(subject <= value && typeof subject === 'number' && typeof value === 'number', `less than or equal to ${value}`, message),\\n    toBeGreaterThan: (value, message) => check(subject > value && typeof subject === 'number' && typeof value === 'number', `greater than ${value}`, message),\\n    toBeGreaterThanOrEqualTo: (value, message) => check(subject >= value && typeof subject === 'number' && typeof value === 'number', `greater than or equal to ${value}`, message),\\n\\n    toBeBoolean: message => check(typeof subject === 'boolean', 'a boolean', message),\\n    toBeString: message => check(typeof subject === 'string', 'a string', message),\\n    toBeObject: message => check(subject && typeof subject === 'object', 'an object', message),\\n    toBeArray: message => check(Array.isArray(subject), 'an array', message),\\n    toBeSet: message => check(subject instanceof Set, 'a set', message),\\n    toBeMap: message => check(subject instanceof Map, 'a map', message),\\n    toBeUint8Array: message => check(subject instanceof Uint8Array, 'a uint8array', message),\\n\\n    toBeClass: message => check(typeof subject === 'function' && subject.toString().startsWith('class'), 'a class', message),\\n    toBeFunction: message => check(typeof subject === 'function' && !subject.toString().startsWith('class'), 'a function', message),\\n    toBeJigClass: message => check(typeof subject === 'function' && subject.toString().startsWith('class') && extendsFrom(subject, Jig), 'a jig class', message),\\n    toExtendFrom: (Class, message) => check(extendsFrom(subject, Class), `an extension of ${Class && Class.name}`, message)\\n  }\\n}\",\"version\":\"04\"},\"jig://424abf066be56b9dd5203ed81cf1f536375351d29726d664507fdc30eb589988_o1\":{\"kind\":\"code\",\"props\":{\"deps\":{},\"location\":\"_o1\",\"nonce\":1,\"origin\":\"_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"class Base58 {\\n  static decode (s) {\\n    // Based on https://gist.github.com/diafygi/90a3e80ca1c2793220e5/\\n    if (typeof s !== 'string') throw new Error(`Cannot decode: ${s}`)\\n    const A = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz'\\n    const d = [] // the array for storing the stream of decoded bytes\\n    const b = [] // the result byte array that will be returned\\n    let j // the iterator variable for the byte array (d)\\n    let c // the carry amount variable that is used to overflow from the current byte to the next byte\\n    let n // a temporary placeholder variable for the current byte\\n    for (let i = 0; i < s.length; i++) {\\n      j = 0 // reset the byte iterator\\n      c = A.indexOf(s[i]) // set the initial carry amount equal to the current base58 digit\\n      if (c < 0) throw new Error(`Invalid base58 character: ${s}\\\\n\\\\nDetails: i=${i}, c=${s[i]}`)\\n      if (!(c || b.length ^ i)) b.push(0) // prepend the result array with a zero if the base58 digit is zero and non-zero characters haven't been seen yet (to ensure correct decode length)\\n      while (j in d || c) { // start looping through the bytes until there are no more bytes and no carry amount\\n        n = d[j] // set the placeholder for the current byte\\n        n = n ? n * 58 + c : c // shift the current byte 58 units and add the carry amount (or just add the carry amount if this is a new byte)\\n        c = n >> 8 // find the new carry amount (1-byte shift of current byte value)\\n        d[j] = n % 256 // reset the current byte to the remainder (the carry amount will pass on the overflow)\\n        j++ // iterate to the next byte\\n      }\\n    }\\n    while (j--) { b.push(d[j]) } // since the byte array is backwards, loop through it in reverse order, and append\\n    if (b.length < 5) throw new Error(`Base58 string too short: ${s}`)\\n    // We assume the checksum and version are correct\\n    return b.slice(1, b.length - 4)\\n  }\\n}\",\"version\":\"04\"},\"jig://d476fd7309a0eeb8b92d715e35c6e273ad63c0025ff6cca927bd0f0b64ed88ff_o3\":{\"kind\":\"code\",\"props\":{\"deps\":{\"Berry\":{\"$jig\":\"native://Berry\"},\"txo\":{\"$jig\":\"_o2\"}},\"location\":\"_o3\",\"metadata\":{\"author\":\"Run ▸ Extra\",\"license\":\"MIT\",\"website\":\"https://www.run.network\"},\"nonce\":2,\"origin\":\"b44a203acd6215d2d24b33a41f730e9acf2591c4ae27ecafc8d88ef83da9ddea_o1\",\"owner\":\"n3CiECgxW1pB1rGbYiX67e4U7AnS3MpJeE\",\"satoshis\":0},\"src\":\"class B extends Berry {\\n  init (base64Data, mediaType, encoding, filename, metadata = {}) {\\n    this.base64Data = base64Data\\n    this.mediaType = mediaType\\n    this.encoding = encoding\\n    this.filename = filename\\n    this.metadata = metadata\\n\\n    if (mediaType === 'image/svg+xml' || mediaType === 'image/png') {\\n      this.metadata.image = this\\n    }\\n  }\\n\\n  static async pluck (path, fetch) {\\n    const txid = path.length === 64 ? path : JSON.parse(path).txid\\n    const metadata = path.length === 64 ? {} : JSON.parse(path).metadata\\n    const data = txo(await fetch(txid))\\n    const out = data.out.find(o => o.s2 === '19HxigV4QyBv3tHpQVcUEQyq1pzZVdoAut')\\n    if (!out) throw new Error(`Cannot find B:// data in ${txid}`)\\n    return new B(out.b3, out.s4, out.s5, out.s6, metadata)\\n  }\\n\\n  static async loadWithMetadata (txid, metadata) {\\n    return this.load(JSON.stringify({ txid, metadata }))\\n  }\\n}\",\"version\":\"04\"}}");

/***/ }),
/* 71 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * local-purse.js
 *
 * Default implementation of the Purse API
 */

const bsv = __webpack_require__(5)
const { PrivateKey, Script, Transaction } = bsv
const { _bsvNetwork, _text } = __webpack_require__(0)
const Log = __webpack_require__(2)
const { _signature } = __webpack_require__(12)
const PurseWrapper = __webpack_require__(48)

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'LocalPurse'

// Script: PUSH + SIG + PUSH + PUBKEY
const P2PKH_SIGSCRIPT_SIZE = 1 + 73 + 1 + 33

// Output: Satoshis + Varint + Script
// Script: OP_DUP + OP_HASH16 + PUSH + HASH + OP_EQUAL + OP_CHECKSIG
const P2PKH_OUTPUT_SIZE = 8 + 1 + 1 + 1 + 1 + 20 + 1 + 1

// Input: Outpoint + Push + Signature + Sequence
const P2PKH_INPUT_SIZE = 36 + 1 + P2PKH_SIGSCRIPT_SIZE + 4

// A default sigscript size when we don't know. Allows up to 3-3 multisig.
const DEFAULT_UNLOCK_SCRIPT_SIZE = 500

// ------------------------------------------------------------------------------------------------
// Local Purse
// ------------------------------------------------------------------------------------------------

/**
 * Local wallet that implements the Purse API
 *
 * It will automatically split UTXOs to avoid the mempool chain limit. However, by design, it will
 * not consolidate UTXOs back together to lower the number of splits. That has to be done outside
 * of the purse. 'splits' should be thought of as minimum splits.
 */
class LocalPurse extends PurseWrapper {
  /**
   * Creates a new LocalPurse
   * @param {object} options Purse configuration
   * @param {Blockchain} options.blockchain Blockchain API (required)
   * @param {string} options.privkey Private key string
   * @param {?number} options.splits Minimum number of UTXO splits. Default: 10.
   * @param {?feePerKb} options.feePerKb Transaction fee in satoshis per kilobyte. Default: 1000.
   */
  constructor (options = {}) {
    super(undefined, parseBlockchain(options.blockchain))

    this._splits = parseSplits(options.splits)
    this._feePerKb = parseFeePerKb(options.feePerKb)

    this.bsvPrivateKey = new PrivateKey(options.privkey, _bsvNetwork(this.blockchain.network))
    this.bsvAddress = this.bsvPrivateKey.toAddress()
    this.bsvScript = Script.fromAddress(this.bsvAddress)

    this.privkey = this.bsvPrivateKey.toString()
    this.address = this.bsvAddress.toString()
    this.script = this.bsvScript.toHex()

    // If the private key does not match what's passed in, then it's not a private key
    if (options.privkey && this.bsvPrivateKey.toString() !== options.privkey.toString()) {
      throw new Error(`Invalid private key: ${_text(options.privkey)}`)
    }

    this.jigFilter = true
    this.cacheUtxos = true

    this._utxos = []
    this._pendingSpends = new Map() // rawtx -> []
  }

  // --------------------------------------------------------------------------

  get splits () { return this._splits }
  set splits (value) { this._splits = parseSplits(value) }

  get feePerKb () { return this._feePerKb }
  set feePerKb (value) { this._feePerKb = parseFeePerKb(value) }

  // --------------------------------------------------------------------------
  // pay
  // --------------------------------------------------------------------------

  async pay (rawtx, parents) {
    if (!this.cacheUtxos || !this._utxos.length) {
      // Some of these UTXOs may not be purse outputs. We filter below.
      this._utxos = await this.blockchain.utxos(this.script)
      this._pendingSpends.clear()
    }

    const tx = new bsv.Transaction(rawtx)
    const numInputsBefore = tx.inputs.length

    const paidTx = await payWithUtxos(tx, parents, this._utxos, this.blockchain, this.bsvPrivateKey, this.bsvAddress,
      this.feePerKb, this.splits, this.jigFilter)

    const paidHex = paidTx.toString()

    if (this.cacheUtxos) {
      const pendingSpends = []

      for (let i = numInputsBefore; i < tx.inputs.length; i++) {
        const input = tx.inputs[i]
        const txid = input.prevTxId.toString('hex')
        const vout = input.outputIndex
        const utxoIndex = this._utxos.findIndex(utxo => utxo.txid === txid && utxo.vout === vout)
        const utxo = this._utxos[utxoIndex]
        this._utxos.splice(utxoIndex, 1)
        pendingSpends.push(utxo)
      }

      this._pendingSpends.set(paidHex, pendingSpends)
    }

    return paidHex
  }

  // --------------------------------------------------------------------------
  // broadcast
  // --------------------------------------------------------------------------

  async broadcast (rawtx) {
    // Broadcast the transaction
    await this.blockchain.broadcast(rawtx)

    if (!this.cacheUtxos) return

    // Add new UTXOs

    const tx = new bsv.Transaction(rawtx)
    const txid = tx.hash

    tx.outputs.forEach((output, vout) => {
      if (output.script.toHex() !== this.script) return

      this._utxos.push({
        txid,
        vout,
        script: this.script,
        satoshis: output.satoshis
      })
    })

    this._pendingSpends.delete(rawtx)
  }

  // --------------------------------------------------------------------------
  // cancel
  // --------------------------------------------------------------------------

  async cancel (rawtx) {
    if (!this.cacheUtxos) return

    // Add back spent UTXOs

    const pendingSpends = this._pendingSpends.get(rawtx)

    if (pendingSpends) pendingSpends.forEach(utxo => this._utxos.push(utxo))

    this._pendingSpends.delete(rawtx)
  }

  // --------------------------------------------------------------------------
  // balance
  // --------------------------------------------------------------------------

  async balance () {
    return (await this.utxos()).reduce((sum, utxo) => sum + utxo.satoshis, 0)
  }

  // --------------------------------------------------------------------------
  // utxos
  // --------------------------------------------------------------------------

  async utxos () {
    if (!this.cacheUtxos || !this._utxos.length) {
      this._utxos = await this.blockchain.utxos(this.script)
      this._pendingSpends.clear()
    }

    const txns = await Promise.all(this._utxos.map(o => this.blockchain.fetch(o.txid)))

    return this._utxos.filter((o, i) => !this.jigFilter || !isJig(txns[i], o.vout))
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function parseSplits (splits) {
  switch (typeof splits) {
    case 'number':
      if (!Number.isInteger(splits)) throw new Error(`splits must be an integer: ${splits}`)
      if (splits <= 0) throw new Error(`splits must be at least 1: ${splits}`)
      return splits
    case 'undefined':
      // The mempool chain limit to used by 25, but now it is 1000. When it was 25, the
      // default splits was 10. This was because with 10 splits to choose from, this creates
      // a binomial distribution where we would expect not to hit the limit 98.7% of the
      // time after 120 transactions. This would support one transaction every 5 seconds on
      // average. However, with the ancestor limit raised to 1000, we have no need anymore.
      return 1
    default: throw new Error(`Invalid splits: ${splits}`)
  }
}

// ------------------------------------------------------------------------------------------------

function parseFeePerKb (feePerKb) {
  switch (typeof feePerKb) {
    case 'number':
      if (!Number.isFinite(feePerKb)) throw new Error(`feePerKb must be finite: ${feePerKb}`)
      if (feePerKb < 0) throw new Error(`feePerKb must be non-negative: ${feePerKb}`)
      return feePerKb
    case 'undefined':
      // Current safe fees are 0.5 sat per byte, even though many miners are accepting 0.25
      return Transaction.FEE_PER_KB
    default: throw new Error(`Invalid feePerKb: ${feePerKb}`)
  }
}

// ------------------------------------------------------------------------------------------------

function parseBlockchain (blockchain) {
  switch (typeof blockchain) {
    case 'undefined': throw new Error('blockchain is required')
    case 'object': if (blockchain && blockchain.network) return blockchain; break
  }
  throw new Error(`Invalid blockchain: ${_text(blockchain)}`)
}

// ------------------------------------------------------------------------------------------------
// Helpers
// ------------------------------------------------------------------------------------------------

async function payWithUtxos (tx, parents, utxos, blockchain, privateKey, address, feePerKb,
  splits, jigFilter) {
  const DUST = Transaction.DUST_AMOUNT

  // Set fees to our custom fee level
  tx.feePerKb(feePerKb)
  const _feeFactor = feePerKb / 1000.0

  // Populate previous outputs
  parents.forEach((parent, n) => {
    if (!parent) return

    tx.inputs[n].output = new Transaction.Output({
      satoshis: parent.satoshis,
      script: new Script(parent.script)
    })
  })

  // Populate placeholder unlock scripts
  const indices = []
  tx.inputs.forEach((input, n) => {
    if (!input.script.toBuffer().length) {
      indices.push(n)
      input.setScript(bsv.deps.Buffer.alloc(DEFAULT_UNLOCK_SCRIPT_SIZE))
    }
  })

  // If there are no outputs, add one change output to ourselves
  const minChangeAmount = tx.outputs.length === 0 ? DUST : 0

  // Get starting input and output amounts
  const inputAmountBefore = tx._getInputAmount()
  const outputAmountBefore = tx._getOutputAmount()

  // Check if we need to pay for anything. Sometimes, there's backed jigs.
  if (inputAmountBefore - outputAmountBefore - minChangeAmount >= tx.toBuffer().length * _feeFactor) {
    if (Log._debugOn) Log._debug(TAG, 'Transaction already paid for. Skipping.')

    // Collect change if leftover after fees is bigger than the tx fee + P2PKH_OUTPUT_SIZE
    const fee = Math.ceil((P2PKH_OUTPUT_SIZE + tx.toBuffer().length) * _feeFactor)
    if (inputAmountBefore - outputAmountBefore > DUST + fee) {
      tx._fee = fee // Fee estimation is not right inside change
      tx.change(address)
    }

    indices.forEach(n => tx.inputs[n].setScript(''))
    return tx
  }

  // Shuffle the UTXOs so that when we start to add them, we don't always start in
  // the same order. This often reduces mempool chain limit errors.
  function shuffle (a) {
    for (let i = a.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [a[i], a[j]] = [a[j], a[i]]
    }
    return a
  }
  utxos = shuffle(utxos)

  // We check UTXOs after we check if we need to even pay anything
  if (!utxos.length) {
    const suggestion = `Hint: Have you funded the purse address ${address}?`
    throw new Error(`Not enough funds\n\n${suggestion}`)
  }

  // Track how many inputs existed before, so we know which ones to sign
  const numInputsBefore = tx.inputs.length

  // Calculate fee required
  let feeRequired = tx.toBuffer().length * _feeFactor

  // The satoshisRequired is an amount that is updated for each UTXO added that
  // estimates an upper bound on the amount of satoshis we have left to add. As soon
  // as this goes to zero or negative, we are done.
  let satoshisRequired = feeRequired + outputAmountBefore - inputAmountBefore

  // The number of UTXOs we've added as inputs. This reduces our splits.
  let numUtxosSpent = 0

  // The number of outputs we will create after adding all UTXOs.
  // We always need at least one change output
  let numOutputsToCreate = 1
  feeRequired += P2PKH_OUTPUT_SIZE * _feeFactor
  satoshisRequired += P2PKH_OUTPUT_SIZE * _feeFactor
  satoshisRequired += DUST // There is a minimum dust required in each output

  // Walk through each UTXO and stop when we have enough
  for (const utxo of utxos) {
    // Check that our UTXO is not a jig output
    const prevTx = await blockchain.fetch(utxo.txid)
    if (jigFilter && isJig(prevTx, utxo.vout)) continue

    // Note: As soon as we call tx.from(), the placeholder signatures are cleared,
    // and tx._estimateFee() is no longer accurate.
    tx.from(utxo)
    satoshisRequired -= utxo.satoshis
    numUtxosSpent++
    feeRequired += P2PKH_INPUT_SIZE * _feeFactor
    satoshisRequired += P2PKH_INPUT_SIZE * _feeFactor

    const numOutputsToAdd = splits - utxos.length + numUtxosSpent - numOutputsToCreate
    for (let i = 0; i < numOutputsToAdd; i++) {
      feeRequired += P2PKH_OUTPUT_SIZE * _feeFactor
      satoshisRequired += P2PKH_OUTPUT_SIZE * _feeFactor
      satoshisRequired += DUST // There is a minimum dust required in each output
      numOutputsToCreate++
    }

    // As soon as we have enough satoshis, we're done. We can add the real outputs.
    if (satoshisRequired < 0) break
  }
  feeRequired = Math.ceil(feeRequired)
  satoshisRequired = Math.ceil(satoshisRequired)

  // Check that we didn't run out of UTXOs
  if (satoshisRequired > 0) {
    const info = `Required ${satoshisRequired} more satoshis`
    throw new Error(`Not enough funds\n\n${info}`)
  }

  // Calculate how much satoshis we have to distribute among out change and split outputs
  // We subtract DUST for each output, because that dust was added as a minimum above, and
  // isn't the real amount that goes into each output.
  const satoshisLeftover = -satoshisRequired + numOutputsToCreate * DUST
  const satoshisPerOutput = Math.max(DUST, Math.floor(satoshisLeftover / numOutputsToCreate))
  for (let i = 0; i < numOutputsToCreate; i++) {
    if (i === numOutputsToCreate - 1) {
      tx._fee = feeRequired
      tx.change(address)
    } else {
      tx.to(address, satoshisPerOutput)
    }
  }

  // Sign the new inputs
  for (let i = numInputsBefore; i < tx.inputs.length; i++) {
    const prevout = tx.inputs[i].output
    const sig = await _signature(tx, i, prevout.script, prevout.satoshis, privateKey)
    const pubkey = privateKey.publicKey.toString()
    const script = Script.fromASM(`${sig} ${pubkey}`)
    tx.inputs[i].setScript(script)
  }

  // Log what we paid
  const spent = tx._getInputAmount() - inputAmountBefore
  const received = tx._getOutputAmount() - outputAmountBefore
  const paid = spent - received
  if (Log._debugOn) Log._debug(TAG, 'Paid about', paid, 'satoshis')

  indices.forEach(n => tx.inputs[n].setScript(''))
  return tx
}

// ------------------------------------------------------------------------------------------------

function isJig (rawtx, vout) {
  try {
    const Run = __webpack_require__(31)
    const metadata = Run.util.metadata(rawtx)
    return vout > metadata.vrun && vout < metadata.out.length + metadata.vrun + 1
  } catch (e) {
    return false
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = LocalPurse


/***/ }),
/* 72 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * local-state.js
 *
 * A local state API that uses the cache to store and retrieve results
 */

const StateWrapper = __webpack_require__(40)

// ------------------------------------------------------------------------------------------------
// LocalState
// ------------------------------------------------------------------------------------------------

class LocalState extends StateWrapper {
  async pull () { /* no-op */ }
}

// ------------------------------------------------------------------------------------------------

module.exports = LocalState


/***/ }),
/* 73 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * mockchain.js
 *
 * In-memory Blockchain implementation
 */

const bsv = __webpack_require__(5)
const { Address, Script, Transaction } = bsv
const Log = __webpack_require__(2)
const { _scripthash } = __webpack_require__(12)
const { _limit } = __webpack_require__(0)
const { sha256 } = bsv.crypto.Hash
const BlockchainWrapper = __webpack_require__(41)

// ------------------------------------------------------------------------------------------------
// Mockchain
// ------------------------------------------------------------------------------------------------

const TAG = 'Mockchain'

/**
 * An in-memory blockchain implementation.
 *
 * It simulates the mempool and blocks, keeps a UTXO index, checks the mempool chain limit, and
 * generally attempts to create errors that are similar to a real network node or service.
 */
class Mockchain extends BlockchainWrapper {
  constructor () {
    super()

    this.network = 'mock'
    this.mempoolChainLimit = 1000

    this._transactions = new Map() // txid -> rawtx
    this._times = new Map() // txid -> time
    this._spends = new Map() // location -> txid

    this._utxos = new Map() // location -> utxo
    this._ulocations = new Map() // scripthash -> Set<location>

    this._mempool = new Map() // txid -> chainlen
  }

  // --------------------------------------------------------------------------

  async broadcast (rawtx) {
    // Allow both raw transactions and bsv transactions
    const tx = new Transaction(rawtx)
    const txid = tx.hash

    // If we already have this transaction, return silently with a warning
    if (this._transactions.has(txid)) {
      if (Log._warnOn) Log._warn(TAG, 'Already have transaction', txid)
      return txid
    }

    // Process the inputs
    tx.inputs.forEach((input, vin) => {
      const prevtxid = input.prevTxId.toString('hex')
      const location = `${prevtxid}_o${input.outputIndex}`

      // Check that this this input is a UTXO
      const utxo = this._utxos.get(location)
      if (!utxo) {
        const spendtxid = this._spends.get(location)
        const spentInMempool = this._mempool.has(spendtxid)
        throw new Error(spentInMempool ? 'txn-mempool-conflict' : 'Missing inputs')
      }

      // Add the known UTXO
      input.output = new Transaction.Output(utxo)
    })

    // Basic transaction checks on top of BlockchainWrapper
    const satoshisIn = tx.inputs.reduce((prev, curr) => prev + curr.output.satoshis, 0)
    const satoshisOut = tx.outputs.reduce((prev, curr) => prev + curr.satoshis, 0)
    if (satoshisIn < satoshisOut) throw new Error('bad-txns-in-belowout')
    if (tx.getFee() < tx.toBuffer().length * Transaction.FEE_PER_KB / 1000) throw new Error('insufficient priority')

    // Check signatures
    if (tx.isFullySigned() !== true) throw new Error('mandatory-script-verify-flag-failed')
    for (let i = 0; i < tx.inputs.length; i++) {
      if (!tx.isValidSignature({ inputIndex: i })) {
        throw new Error('mandatory-script-verify-flag-failed')
      }
    }

    // Check that the mempool chain length is less than the mempool chain limit
    const chainlen = tx.inputs
      .map(input => input.prevTxId.toString('hex'))
      .map(txid => this._mempool.get(txid) + 1)
      .reduce((max, next) => Math.max(max, next), 0)

    if (chainlen > _limit(this.mempoolChainLimit, 'mempoolChainLimit')) {
      const suggestion = 'Hint: Use run.blockchain.block() to produce blocks on the mockchain.'
      throw new Error(`too-long-mempool-chain\n\n${suggestion}`)
    }

    // Add the transaction to the mockchain
    this._transactions.set(txid, rawtx)
    this._times.set(txid, Date.now())
    this._mempool.set(txid, chainlen)

    // Remove spent outputs
    tx.inputs.forEach((input, vin) => {
      const prevtxid = input.prevTxId.toString('hex')
      const location = `${prevtxid}_o${input.outputIndex}`

      const prevrawtx = this._transactions.get(prevtxid)
      const prevtx = new bsv.Transaction(prevrawtx)
      const prevout = prevtx.outputs[input.outputIndex]
      const prevscripthash = sha256(prevout.script.toBuffer()).reverse().toString('hex')

      this._utxos.delete(location)
      this._ulocations.get(prevscripthash).delete(location)
      this._spends.set(location, txid)
    })

    // Add unspent outputs
    tx.outputs.forEach((output, vout) => {
      const location = `${txid}_o${vout}`
      this._spends.set(location, null)

      const utxo = { txid, vout, script: output.script.toHex(), satoshis: output.satoshis }
      this._utxos.set(location, utxo)

      const scripthash = sha256(output.script.toBuffer()).reverse().toString('hex')
      const ulocations = this._ulocations.get(scripthash) || new Set()
      ulocations.add(location)
      this._ulocations.set(scripthash, ulocations)
    })

    return txid
  }

  // --------------------------------------------------------------------------

  async fetch (txid) {
    const rawtx = this._transactions.get(txid)
    if (!rawtx) throw new Error(`No such mempool or blockchain transaction: ${txid}`)
    return rawtx
  }

  // --------------------------------------------------------------------------

  async utxos (script) {
    const scripthash = await _scripthash(script)
    const ulocations = this._ulocations.get(scripthash)
    if (!ulocations) return []
    return Array.from(ulocations).map(location => this._utxos.get(location))
  }

  // --------------------------------------------------------------------------

  async spends (txid, vout) {
    const location = `${txid}_o${vout}`
    const spend = this._spends.get(location)
    return spend || null
  }

  // --------------------------------------------------------------------------

  async time (txid) {
    const time = this._times.get(txid)
    if (!time) throw new Error(`No such mempool or blockchain transaction: ${txid}`)
    return time
  }

  // --------------------------------------------------------------------------

  /**
   * Directly provides satoshis to an address
   *
   * @param {string} address Address string
   * @param {number} satoshis Amount of satoshis
   * @returns {string} Transaction hash
   */
  fund (address, satoshis) {
    if (Log._infoOn) Log._info(TAG, 'Fund', address.toString(), 'with', satoshis)

    // Create a unique tx
    const random = Math.random().toString()
    const tx = new Transaction()
      .addData(random)
      .to(new Address(address, 'testnet'), satoshis)
    const txid = tx.hash
    const rawtx = tx.toString('hex')

    // Index the tx
    this._transactions.set(txid, rawtx)
    this._times.set(txid, Date.now())
    this._mempool.set(txid, 0)

    // Create the utxo
    const utxo = {
      txid,
      vout: 1,
      script: tx.outputs[1].script.toHex(),
      satoshis: tx.outputs[1].satoshis
    }

    // Index the utxo
    const location = `${txid}_o1`
    this._utxos.set(location, utxo)

    // Index the ulocation
    const script = Script.fromAddress(address)
    const scripthash = sha256(script.toBuffer()).reverse().toString('hex')
    const ulocations = this._ulocations.get(scripthash) || new Set()
    ulocations.add(location)
    this._ulocations.set(scripthash, ulocations)

    return txid
  }

  // --------------------------------------------------------------------------

  block () {
    if (Log._debugOn) Log._debug(TAG, 'Block')

    this._mempool.clear()
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Mockchain


/***/ }),
/* 74 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * node-cache.js
 *
 * Cache that stores state in files on the disk and also has a memory cache
 */

/* global VARIANT */

if (false) {} else {
  module.exports = null
}


/***/ }),
/* 75 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * pay-server.js
 *
 * API to connect to the Run Pay Server
 */

const bsv = __webpack_require__(5)
const request = __webpack_require__(18)
const { _text } = __webpack_require__(0)
const PurseWrapper = __webpack_require__(48)
const RunConnect = __webpack_require__(59)

// ------------------------------------------------------------------------------------------------

/**
 * A Purse implementation that pays for transactions using Run's remote server
 *
 * To generate an API key: https://api.run.network/v1/test/pay/generate
 */
class PayServer extends PurseWrapper {
  constructor(apiKey, host) {
    super()

    let hdkey = null
    try {
      hdkey = new bsv.HDPublicKey(apiKey)
    } catch (e) {
      throw new Error(`Invalid API key: ${_text(apiKey)}`)
    }

    this.network = hdkey.network.name === 'mainnet' || hdkey.network.name === 'livenet' ? 'main' : 'test'
    this.apiKey = apiKey
    this.timeout = 5000
    this.request = request
    // this.host = 'https://api.run.network' // deprecated
    this.host = host
  }

  // --------------------------------------------------------------------------
  // pay
  // --------------------------------------------------------------------------

  async pay(rawtx, parents) {
    const url = `${this.host}/v1/${this.network}/pay`
    const body = { rawtx, parents, key: this.apiKey }
    const options = { method: 'POST', body, timeout: this.timeout }
    const response = await this.request(url, options)
    return response.rawtx
  }

  // --------------------------------------------------------------------------
  // broadcast
  // --------------------------------------------------------------------------

  async broadcast(rawtx) {
    // If our blockchain instance of RunConnect, use it to notify about the tx
    if (this.blockchain instanceof RunConnect && this.network === this.blockchain.network) {
      await this.blockchain.broadcast(rawtx)
      return
    }

    // For all other APIs, broadcast to our server anyway, so we know about it soon
    const url = `${this.host}/v1/${this.network}/tx`
    const body = { rawtx }
    const options = { method: 'POST', body, timeout: this.timeout }
    await this.request(url, options)
  }

  // --------------------------------------------------------------------------
  // cancel
  // --------------------------------------------------------------------------

  async cancel(rawtx) {
    // In the future, we should notify server about the cancelled payment
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = PayServer


/***/ }),
/* 76 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * run-db.js
 *
 * Cache that connects to a Run-DB instnace
 */

const { _scripthash } = __webpack_require__(12)
const request = __webpack_require__(18)
const StateWrapper = __webpack_require__(40)

// ------------------------------------------------------------------------------------------------
// RunDB
// ------------------------------------------------------------------------------------------------

class RunDB extends StateWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  constructor (host) {
    super()

    this.host = host
    this.request = request
  }

  // --------------------------------------------------------------------------
  // pull
  // --------------------------------------------------------------------------

  async pull (key, options) {
    const [protocol, path] = key.split('://')

    let url = null

    switch (protocol) {
      case 'jig': { url = `${this.host}/jig/${path}`; break }
      case 'berry': { url = `${this.host}/berry/${encodeURIComponent(path)}`; break }
      case 'trust': { url = `${this.host}/trust/${path}`; break }
      // Bans are not pulled from Run-DB, because if Run-DB bans, then the jig state is also gone
      case 'ban': return
      case 'tx': { url = `${this.host}/tx/${path}`; break }
      case 'spend': { url = `${this.host}/spends/${path}`; break }
      case 'time': { url = `${this.host}/time/${path}`; break }
      // Anything else is not supported
      default: return
    }

    let value
    try {
      value = await this.request(url)
    } catch (e) {
      if (e.status === 404) return undefined
      throw e
    }

    // If we are getting a jig, get its tx too
    if (options && options.tx && protocol === 'jig' && this.cache) {
      try {
        const txid = path.slice(0, 64)
        const txurl = `${this.host}/tx/${txid}`
        const rawtx = await this.request(txurl)
        await this.cache.set(`tx://${txid}`, rawtx)
      } catch (e) { if (e.status !== 404) throw e }
    }

    // Note: The all and filter options are not supported with RundB yet

    return value
  }

  // --------------------------------------------------------------------------
  // locations
  // --------------------------------------------------------------------------

  async locations (script) {
    const scripthash = await _scripthash(script)
    const url = `${this.host}/unspent?scripthash=${scripthash}`
    return await this.request(url)
  }

  // --------------------------------------------------------------------------
  // broadcast
  // --------------------------------------------------------------------------

  async broadcast (rawtx) {
    await this.request(`${this.host}/tx`, {
      method: 'POST',
      body: rawtx,
      headers: { 'content-type': 'text/plain' }
    })
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = RunDB


/***/ }),
/* 77 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * state-server.js
 *
 * Run Connect State API that can be used as a State implementation
 */

const request = __webpack_require__(18)
const StateFilter = __webpack_require__(28)
const StateWrapper = __webpack_require__(40)

// ------------------------------------------------------------------------------------------------
// StateServer
// ------------------------------------------------------------------------------------------------

class StateServer extends StateWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  /**
   * @param {?object} options Optional configurations options
   * @param {?string} options.network Network string. Defaults to main.
   */
  constructor(options = {}) {
    super()

    this.network = _parseNetwork(options.network)
    this.request = request
    // this.host = 'https://api.run.network'  // deprecated
    this.host = options.host
  }

  // --------------------------------------------------------------------------
  // pull
  // --------------------------------------------------------------------------

  async pull(key, options) {
    let states = {}
    let error = null

    // Our API only returns creation states
    const [protocol, location] = key.split('://')
    if (protocol !== 'jig' && protocol !== 'berry') return

    // Call the API
    try {
      options = options || {}
      const all = options.all ? 1 : 0
      const tx = options.tx ? 1 : 0
      const filter = options.filter || StateFilter.toBase64(StateFilter.create())
      const url = `${this.host}/v1/${this.network}/state/${encodeURIComponent(location)}?all=${all}&tx=${tx}&filter=${filter}`
      const requestOptions = { cache: 1000 }
      states = await this.request(url, requestOptions)
    } catch (e) {
      // Even if the state is missing, transaction data might still be present
      states = typeof e.reason === 'object' ? e.reason : {}
      if (e.status !== 404) error = e
    }

    // Cache the states, except for the one we requested, because StateWrapper will cache that
    if (this.cache) {
      await Promise.all(
        Object.entries(states)
          .filter(([k, _]) => k !== key)
          .map(([k, v]) => this.cache.set(k, v))
      )
    }

    // Throw any errors after caching
    if (error) throw error

    // Return the one state we requested
    return states[key]
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function _parseNetwork(network) {
  if (typeof network === 'undefined') return 'main'
  if (typeof network !== 'string') throw new Error(`Invalid network: ${network}`)
  if (network !== 'main' && network !== 'test') throw new Error(`RunConnect API does not support the "${network}" network`)
  return network
}

// ------------------------------------------------------------------------------------------------

module.exports = StateServer


/***/ }),
/* 78 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * viewer.js
 *
 * A Run Owner for loading another person's jigs but being unable to sign them.
 */

const { _text, _bsvNetwork } = __webpack_require__(0)
const { _owner } = __webpack_require__(8)
const bsv = __webpack_require__(5)
const { Script } = bsv
const Log = __webpack_require__(2)
const OwnerWrapper = __webpack_require__(46)

// ------------------------------------------------------------------------------------------------
// Viewer
// ------------------------------------------------------------------------------------------------

const TAG = 'Viewer'

class Viewer extends OwnerWrapper {
  /**
   * Creates a new Viewer
   * @param {string|object} owner Address string, pubkey string, or custom lock
   * @param {?string} network Optional network string
   */
  constructor (owner, network) {
    super()

    this.owner = owner
    this.script = Script.fromHex(_owner(this.owner, false, network && _bsvNetwork(network)).script())
  }

  async sign (rawtx, parents, locks) {
    if (Log._warnOn) Log._warn(TAG, 'Viewer cannot sign ', _text(this.owner))

    return rawtx
  }

  nextOwner () {
    return this.owner
  }
}

// ------------------------------------------------------------------------------------------------

module.exports = Viewer


/***/ }),
/* 79 */
/***/ (function(module, exports, __webpack_require__) {

/**
 * whatsonchain.js
 *
 * WhatsOnChain Blockchain API
 */

const { _scripthash } = __webpack_require__(12)
const Log = __webpack_require__(2)
const { NotImplementedError } = __webpack_require__(11)
const request = __webpack_require__(18)
const BlockchainWrapper = __webpack_require__(41)
const { _RequestError } = request

// ------------------------------------------------------------------------------------------------
// Globals
// ------------------------------------------------------------------------------------------------

const TAG = 'WhatsOnChain'

// ------------------------------------------------------------------------------------------------
// WhatsOnChain
// ------------------------------------------------------------------------------------------------

class WhatsOnChain extends BlockchainWrapper {
  // --------------------------------------------------------------------------
  // constructor
  // --------------------------------------------------------------------------

  /**
   * @param {?object} options Optional configurations options
   * @param {?string} options.apiKey API key
   * @param {?string} options.network Network string. Defaults to main.
   */
  constructor(options = {}) {
    super()

    this.api = 'whatsonchain'
    this.apiKey = _parseApiKey(options.apiKey)
    this.network = _parseNetwork(options.network)
    this.request = request
  }

  // --------------------------------------------------------------------------
  // Blockchain API
  // --------------------------------------------------------------------------

  async broadcast(rawtx) {
    const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/tx/raw`
    const headers = this.apiKey ? { 'woc-api-key': this.apiKey } : {}
    const options = { method: 'POST', body: { txhex: rawtx }, headers }
    const txid = await this.request(url, options)
    return txid
  }

  // --------------------------------------------------------------------------

  async fetch(txid) {
    try {
      const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/tx/${txid}/hex`
      const headers = this.apiKey ? { 'woc-api-key': this.apiKey } : {}
      const options = { headers, cache: 1000 }
      const json = await this.request(url, options)
      return json
    } catch (e) {
      if (e instanceof _RequestError && (e.status === 404 || e.status === 500)) {
        throw new Error('No such mempool or blockchain transaction')
      } else {
        throw e
      }
    }
  }

  // --------------------------------------------------------------------------

  async utxos(script) {
    if (this.network === 'stn') {
      if (Log._warnOn) Log._warn(TAG, 'Utxos are not available on STN')
      return []
    }

    const scripthash = await _scripthash(script)
    const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/script/${scripthash}/unspent`
    const headers = this.apiKey ? { 'woc-api-key': this.apiKey } : {}
    const data = await this.request(url, { headers, cache: 1000 })
    const utxos = data.map(o => { return { txid: o.tx_hash, vout: o.tx_pos, satoshis: o.value, script } })
    return utxos
  }

  // --------------------------------------------------------------------------

  async time(txid) {
    try {
      const url = `https://api.whatsonchain.com/v1/bsv/${this.network}/tx/hash/${txid}`
      const headers = this.apiKey ? { 'woc-api-key': this.apiKey } : {}
      const options = { headers, cache: 1000 }
      const json = await this.request(url, options)
      return json.time * 1000 || Date.now()
    } catch (e) {
      if (e instanceof _RequestError && (e.status === 404 || e.status === 500)) {
        throw new Error('No such mempool or blockchain transaction')
      } else {
        throw e
      }
    }
  }

  // --------------------------------------------------------------------------

  async spends(txid, vout) {
    throw new NotImplementedError('WhatsOnChain API does not support spends')
  }
}

// ------------------------------------------------------------------------------------------------
// Parameter validation
// ------------------------------------------------------------------------------------------------

function _parseApiKey(apiKey) {
  if (typeof apiKey === 'undefined' || typeof apiKey === 'string') return apiKey
  throw new Error(`Invalid API key: ${apiKey}`)
}

// ------------------------------------------------------------------------------------------------

function _parseNetwork(network) {
  if (typeof network === 'undefined') return 'main'
  if (typeof network !== 'string') throw new Error(`Invalid network: ${network}`)
  if (network !== 'main' && network !== 'test' && network !== 'stn') throw new Error(`WhatsOnChain API does not support the "${network}" network`)
  return network
}

// ------------------------------------------------------------------------------------------------

module.exports = WhatsOnChain


/***/ })
/******/ ]);