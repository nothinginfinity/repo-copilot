var __create = Object.create;
var __defProp = Object.defineProperty;
var __getOwnPropDesc = Object.getOwnPropertyDescriptor;
var __getOwnPropNames = Object.getOwnPropertyNames;
var __getProtoOf = Object.getPrototypeOf;
var __hasOwnProp = Object.prototype.hasOwnProperty;
var __require = /* @__PURE__ */ ((x2) => typeof require !== "undefined" ? require : typeof Proxy !== "undefined" ? new Proxy(x2, {
  get: (a2, b2) => (typeof require !== "undefined" ? require : a2)[b2]
}) : x2)(function(x2) {
  if (typeof require !== "undefined") return require.apply(this, arguments);
  throw Error('Dynamic require of "' + x2 + '" is not supported');
});
var __esm = (fn2, res, err2) => function __init() {
  if (err2) throw err2[0];
  try {
    return fn2 && (res = (0, fn2[__getOwnPropNames(fn2)[0]])(fn2 = 0)), res;
  } catch (e2) {
    throw err2 = [e2], e2;
  }
};
var __commonJS = (cb, mod) => function __require3() {
  try {
    return mod || (0, cb[__getOwnPropNames(cb)[0]])((mod = { exports: {} }).exports, mod), mod.exports;
  } catch (e2) {
    throw mod = 0, e2;
  }
};
var __export = (target, all) => {
  for (var name in all)
    __defProp(target, name, { get: all[name], enumerable: true });
};
var __copyProps = (to2, from, except, desc) => {
  if (from && typeof from === "object" || typeof from === "function") {
    for (let key of __getOwnPropNames(from))
      if (!__hasOwnProp.call(to2, key) && key !== except)
        __defProp(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc(from, key)) || desc.enumerable });
  }
  return to2;
};
var __reExport = (target, mod, secondTarget) => (__copyProps(target, mod, "default"), secondTarget && __copyProps(secondTarget, mod, "default"));
var __toESM = (mod, isNodeMode, target) => (target = mod != null ? __create(__getProtoOf(mod)) : {}, __copyProps(
  // If the importer is in node compatibility mode or this is not an ESM
  // file that has been converted to a CommonJS file using a Babel-
  // compatible transform (i.e. "__esModule" has not been set), then set
  // "default" to the CommonJS "module.exports" for node compatibility.
  isNodeMode || !mod || !mod.__esModule ? __defProp(target, "default", { value: mod, enumerable: true }) : target,
  mod
));

// node_modules/json-stringify-safe/stringify.js
var require_stringify = __commonJS({
  "node_modules/json-stringify-safe/stringify.js"(exports, module) {
    exports = module.exports = stringify3;
    exports.getSerialize = serializer;
    function stringify3(obj, replacer, spaces, cycleReplacer) {
      return JSON.stringify(obj, serializer(replacer, cycleReplacer), spaces);
    }
    function serializer(replacer, cycleReplacer) {
      var stack = [], keys = [];
      if (cycleReplacer == null) cycleReplacer = function(key, value) {
        if (stack[0] === value) return "[Circular ~]";
        return "[Circular ~." + keys.slice(0, stack.indexOf(value)).join(".") + "]";
      };
      return function(key, value) {
        if (stack.length > 0) {
          var thisPos = stack.indexOf(this);
          ~thisPos ? stack.splice(thisPos + 1) : stack.push(this);
          ~thisPos ? keys.splice(thisPos, Infinity, key) : keys.push(key);
          if (~stack.indexOf(value)) value = cycleReplacer.call(this, key, value);
        } else stack.push(value);
        return replacer == null ? value : replacer.call(this, key, value);
      };
    }
  }
});

// node_modules/serialize-error-cjs/dist/constructors.js
var require_constructors = __commonJS({
  "node_modules/serialize-error-cjs/dist/constructors.js"(exports, module) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to2, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to2, key) && key !== except)
            __defProp2(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to2;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var constructors_exports = {};
    __export2(constructors_exports, {
      errorConstructors: () => errorConstructors3
    });
    module.exports = __toCommonJS(constructors_exports);
    var list = [
      Error,
      EvalError,
      RangeError,
      ReferenceError,
      SyntaxError,
      TypeError,
      URIError,
      globalThis.DOMException,
      globalThis.AssertionError,
      globalThis.SystemError
    ].filter(Boolean).map(
      (constructor) => [constructor.name, constructor]
    );
    var errorConstructors3 = new Map(list);
  }
});

// node_modules/serialize-error-cjs/dist/index.js
var require_dist = __commonJS({
  "node_modules/serialize-error-cjs/dist/index.js"(exports, module) {
    var __defProp2 = Object.defineProperty;
    var __getOwnPropDesc2 = Object.getOwnPropertyDescriptor;
    var __getOwnPropNames2 = Object.getOwnPropertyNames;
    var __hasOwnProp2 = Object.prototype.hasOwnProperty;
    var __export2 = (target, all) => {
      for (var name in all)
        __defProp2(target, name, { get: all[name], enumerable: true });
    };
    var __copyProps2 = (to2, from, except, desc) => {
      if (from && typeof from === "object" || typeof from === "function") {
        for (let key of __getOwnPropNames2(from))
          if (!__hasOwnProp2.call(to2, key) && key !== except)
            __defProp2(to2, key, { get: () => from[key], enumerable: !(desc = __getOwnPropDesc2(from, key)) || desc.enumerable });
      }
      return to2;
    };
    var __toCommonJS = (mod) => __copyProps2(__defProp2({}, "__esModule", { value: true }), mod);
    var index_exports = {};
    __export2(index_exports, {
      deserializeError: () => deserializeError2,
      errorConstructors: () => import_constructors.errorConstructors,
      serializeError: () => serializeError2
    });
    module.exports = __toCommonJS(index_exports);
    var import_constructors = require_constructors();
    var getErrorConstructor = (name) => {
      var _a2;
      return (_a2 = import_constructors.errorConstructors.get(name)) != null ? _a2 : Error;
    };
    var commonProperties = [
      {
        property: "message",
        enumerable: false
      },
      {
        property: "stack",
        enumerable: false
      },
      {
        property: "code",
        enumerable: true
      },
      {
        property: "cause",
        enumerable: false
      }
    ];
    function serializeError2(subject) {
      const data = {
        name: "Error",
        message: "",
        stack: ""
      };
      for (const { property } of commonProperties) {
        if (!(property in subject)) continue;
        data[property] = subject[property];
      }
      if (globalThis.DOMException && subject instanceof globalThis.DOMException) {
        data.name = "DOMException";
      } else {
        data.name = Object.getPrototypeOf(subject).name;
      }
      return data;
    }
    function deserializeError2(subject) {
      const fn2 = getErrorConstructor(subject.name);
      const output = new fn2();
      for (const { property, enumerable } of commonProperties) {
        if (!(property in subject)) continue;
        Object.defineProperty(output, property, {
          value: subject[property],
          enumerable,
          configurable: true,
          writable: true
        });
      }
      return output;
    }
  }
});

// node_modules/ms/index.js
var require_ms = __commonJS({
  "node_modules/ms/index.js"(exports, module) {
    var s2 = 1e3;
    var m2 = s2 * 60;
    var h2 = m2 * 60;
    var d2 = h2 * 24;
    var w2 = d2 * 7;
    var y2 = d2 * 365.25;
    module.exports = function(val, options) {
      options = options || {};
      var type = typeof val;
      if (type === "string" && val.length > 0) {
        return parse(val);
      } else if (type === "number" && isFinite(val)) {
        return options.long ? fmtLong(val) : fmtShort(val);
      }
      throw new Error(
        "val is not a non-empty string or a valid number. val=" + JSON.stringify(val)
      );
    };
    function parse(str) {
      str = String(str);
      if (str.length > 100) {
        return;
      }
      var match = /^(-?(?:\d+)?\.?\d+) *(milliseconds?|msecs?|ms|seconds?|secs?|s|minutes?|mins?|m|hours?|hrs?|h|days?|d|weeks?|w|years?|yrs?|y)?$/i.exec(
        str
      );
      if (!match) {
        return;
      }
      var n2 = parseFloat(match[1]);
      var type = (match[2] || "ms").toLowerCase();
      switch (type) {
        case "years":
        case "year":
        case "yrs":
        case "yr":
        case "y":
          return n2 * y2;
        case "weeks":
        case "week":
        case "w":
          return n2 * w2;
        case "days":
        case "day":
        case "d":
          return n2 * d2;
        case "hours":
        case "hour":
        case "hrs":
        case "hr":
        case "h":
          return n2 * h2;
        case "minutes":
        case "minute":
        case "mins":
        case "min":
        case "m":
          return n2 * m2;
        case "seconds":
        case "second":
        case "secs":
        case "sec":
        case "s":
          return n2 * s2;
        case "milliseconds":
        case "millisecond":
        case "msecs":
        case "msec":
        case "ms":
          return n2;
        default:
          return void 0;
      }
    }
    function fmtShort(ms5) {
      var msAbs = Math.abs(ms5);
      if (msAbs >= d2) {
        return Math.round(ms5 / d2) + "d";
      }
      if (msAbs >= h2) {
        return Math.round(ms5 / h2) + "h";
      }
      if (msAbs >= m2) {
        return Math.round(ms5 / m2) + "m";
      }
      if (msAbs >= s2) {
        return Math.round(ms5 / s2) + "s";
      }
      return ms5 + "ms";
    }
    function fmtLong(ms5) {
      var msAbs = Math.abs(ms5);
      if (msAbs >= d2) {
        return plural(ms5, msAbs, d2, "day");
      }
      if (msAbs >= h2) {
        return plural(ms5, msAbs, h2, "hour");
      }
      if (msAbs >= m2) {
        return plural(ms5, msAbs, m2, "minute");
      }
      if (msAbs >= s2) {
        return plural(ms5, msAbs, s2, "second");
      }
      return ms5 + " ms";
    }
    function plural(ms5, msAbs, n2, name) {
      var isPlural = msAbs >= n2 * 1.5;
      return Math.round(ms5 / n2) + " " + name + (isPlural ? "s" : "");
    }
  }
});

// node_modules/debug/src/common.js
var require_common = __commonJS({
  "node_modules/debug/src/common.js"(exports, module) {
    function setup(env) {
      createDebug.debug = createDebug;
      createDebug.default = createDebug;
      createDebug.coerce = coerce2;
      createDebug.disable = disable;
      createDebug.enable = enable;
      createDebug.enabled = enabled;
      createDebug.humanize = require_ms();
      createDebug.destroy = destroy;
      Object.keys(env).forEach((key) => {
        createDebug[key] = env[key];
      });
      createDebug.names = [];
      createDebug.skips = [];
      createDebug.formatters = {};
      function selectColor(namespace) {
        let hash = 0;
        for (let i2 = 0; i2 < namespace.length; i2++) {
          hash = (hash << 5) - hash + namespace.charCodeAt(i2);
          hash |= 0;
        }
        return createDebug.colors[Math.abs(hash) % createDebug.colors.length];
      }
      createDebug.selectColor = selectColor;
      function createDebug(namespace) {
        let prevTime;
        let enableOverride = null;
        let namespacesCache;
        let enabledCache;
        function debug(...args) {
          if (!debug.enabled) {
            return;
          }
          const self2 = debug;
          const curr = Number(/* @__PURE__ */ new Date());
          const ms5 = curr - (prevTime || curr);
          self2.diff = ms5;
          self2.prev = prevTime;
          self2.curr = curr;
          prevTime = curr;
          args[0] = createDebug.coerce(args[0]);
          if (typeof args[0] !== "string") {
            args.unshift("%O");
          }
          let index = 0;
          args[0] = args[0].replace(/%([a-zA-Z%])/g, (match, format) => {
            if (match === "%%") {
              return "%";
            }
            index++;
            const formatter = createDebug.formatters[format];
            if (typeof formatter === "function") {
              const val = args[index];
              match = formatter.call(self2, val);
              args.splice(index, 1);
              index--;
            }
            return match;
          });
          createDebug.formatArgs.call(self2, args);
          const logFn = self2.log || createDebug.log;
          logFn.apply(self2, args);
        }
        debug.namespace = namespace;
        debug.useColors = createDebug.useColors();
        debug.color = createDebug.selectColor(namespace);
        debug.extend = extend;
        debug.destroy = createDebug.destroy;
        Object.defineProperty(debug, "enabled", {
          enumerable: true,
          configurable: false,
          get: () => {
            if (enableOverride !== null) {
              return enableOverride;
            }
            if (namespacesCache !== createDebug.namespaces) {
              namespacesCache = createDebug.namespaces;
              enabledCache = createDebug.enabled(namespace);
            }
            return enabledCache;
          },
          set: (v2) => {
            enableOverride = v2;
          }
        });
        if (typeof createDebug.init === "function") {
          createDebug.init(debug);
        }
        return debug;
      }
      function extend(namespace, delimiter) {
        const newDebug = createDebug(this.namespace + (typeof delimiter === "undefined" ? ":" : delimiter) + namespace);
        newDebug.log = this.log;
        return newDebug;
      }
      function enable(namespaces) {
        createDebug.save(namespaces);
        createDebug.namespaces = namespaces;
        createDebug.names = [];
        createDebug.skips = [];
        const split = (typeof namespaces === "string" ? namespaces : "").trim().replace(/\s+/g, ",").split(",").filter(Boolean);
        for (const ns2 of split) {
          if (ns2[0] === "-") {
            createDebug.skips.push(ns2.slice(1));
          } else {
            createDebug.names.push(ns2);
          }
        }
      }
      function matchesTemplate(search, template) {
        let searchIndex = 0;
        let templateIndex = 0;
        let starIndex = -1;
        let matchIndex = 0;
        while (searchIndex < search.length) {
          if (templateIndex < template.length && (template[templateIndex] === search[searchIndex] || template[templateIndex] === "*")) {
            if (template[templateIndex] === "*") {
              starIndex = templateIndex;
              matchIndex = searchIndex;
              templateIndex++;
            } else {
              searchIndex++;
              templateIndex++;
            }
          } else if (starIndex !== -1) {
            templateIndex = starIndex + 1;
            matchIndex++;
            searchIndex = matchIndex;
          } else {
            return false;
          }
        }
        while (templateIndex < template.length && template[templateIndex] === "*") {
          templateIndex++;
        }
        return templateIndex === template.length;
      }
      function disable() {
        const namespaces = [
          ...createDebug.names,
          ...createDebug.skips.map((namespace) => "-" + namespace)
        ].join(",");
        createDebug.enable("");
        return namespaces;
      }
      function enabled(name) {
        for (const skip of createDebug.skips) {
          if (matchesTemplate(name, skip)) {
            return false;
          }
        }
        for (const ns2 of createDebug.names) {
          if (matchesTemplate(name, ns2)) {
            return true;
          }
        }
        return false;
      }
      function coerce2(val) {
        if (val instanceof Error) {
          return val.stack || val.message;
        }
        return val;
      }
      function destroy() {
        console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
      }
      createDebug.enable(createDebug.load());
      return createDebug;
    }
    module.exports = setup;
  }
});

// node_modules/debug/src/browser.js
var require_browser = __commonJS({
  "node_modules/debug/src/browser.js"(exports, module) {
    exports.formatArgs = formatArgs;
    exports.save = save;
    exports.load = load;
    exports.useColors = useColors;
    exports.storage = localstorage();
    exports.destroy = /* @__PURE__ */ (() => {
      let warned = false;
      return () => {
        if (!warned) {
          warned = true;
          console.warn("Instance method `debug.destroy()` is deprecated and no longer does anything. It will be removed in the next major version of `debug`.");
        }
      };
    })();
    exports.colors = [
      "#0000CC",
      "#0000FF",
      "#0033CC",
      "#0033FF",
      "#0066CC",
      "#0066FF",
      "#0099CC",
      "#0099FF",
      "#00CC00",
      "#00CC33",
      "#00CC66",
      "#00CC99",
      "#00CCCC",
      "#00CCFF",
      "#3300CC",
      "#3300FF",
      "#3333CC",
      "#3333FF",
      "#3366CC",
      "#3366FF",
      "#3399CC",
      "#3399FF",
      "#33CC00",
      "#33CC33",
      "#33CC66",
      "#33CC99",
      "#33CCCC",
      "#33CCFF",
      "#6600CC",
      "#6600FF",
      "#6633CC",
      "#6633FF",
      "#66CC00",
      "#66CC33",
      "#9900CC",
      "#9900FF",
      "#9933CC",
      "#9933FF",
      "#99CC00",
      "#99CC33",
      "#CC0000",
      "#CC0033",
      "#CC0066",
      "#CC0099",
      "#CC00CC",
      "#CC00FF",
      "#CC3300",
      "#CC3333",
      "#CC3366",
      "#CC3399",
      "#CC33CC",
      "#CC33FF",
      "#CC6600",
      "#CC6633",
      "#CC9900",
      "#CC9933",
      "#CCCC00",
      "#CCCC33",
      "#FF0000",
      "#FF0033",
      "#FF0066",
      "#FF0099",
      "#FF00CC",
      "#FF00FF",
      "#FF3300",
      "#FF3333",
      "#FF3366",
      "#FF3399",
      "#FF33CC",
      "#FF33FF",
      "#FF6600",
      "#FF6633",
      "#FF9900",
      "#FF9933",
      "#FFCC00",
      "#FFCC33"
    ];
    function useColors() {
      if (typeof window !== "undefined" && window.process && (window.process.type === "renderer" || window.process.__nwjs)) {
        return true;
      }
      if (typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/(edge|trident)\/(\d+)/)) {
        return false;
      }
      let m2;
      return typeof document !== "undefined" && document.documentElement && document.documentElement.style && document.documentElement.style.WebkitAppearance || // Is firebug? http://stackoverflow.com/a/398120/376773
      typeof window !== "undefined" && window.console && (window.console.firebug || window.console.exception && window.console.table) || // Is firefox >= v31?
      // https://developer.mozilla.org/en-US/docs/Tools/Web_Console#Styling_messages
      typeof navigator !== "undefined" && navigator.userAgent && (m2 = navigator.userAgent.toLowerCase().match(/firefox\/(\d+)/)) && parseInt(m2[1], 10) >= 31 || // Double check webkit in userAgent just in case we are in a worker
      typeof navigator !== "undefined" && navigator.userAgent && navigator.userAgent.toLowerCase().match(/applewebkit\/(\d+)/);
    }
    function formatArgs(args) {
      args[0] = (this.useColors ? "%c" : "") + this.namespace + (this.useColors ? " %c" : " ") + args[0] + (this.useColors ? "%c " : " ") + "+" + module.exports.humanize(this.diff);
      if (!this.useColors) {
        return;
      }
      const c2 = "color: " + this.color;
      args.splice(1, 0, c2, "color: inherit");
      let index = 0;
      let lastC = 0;
      args[0].replace(/%[a-zA-Z%]/g, (match) => {
        if (match === "%%") {
          return;
        }
        index++;
        if (match === "%c") {
          lastC = index;
        }
      });
      args.splice(lastC, 0, c2);
    }
    exports.log = console.debug || console.log || (() => {
    });
    function save(namespaces) {
      try {
        if (namespaces) {
          exports.storage.setItem("debug", namespaces);
        } else {
          exports.storage.removeItem("debug");
        }
      } catch (error) {
      }
    }
    function load() {
      let r2;
      try {
        r2 = exports.storage.getItem("debug") || exports.storage.getItem("DEBUG");
      } catch (error) {
      }
      if (!r2 && typeof process !== "undefined" && "env" in process) {
        r2 = process.env.DEBUG;
      }
      return r2;
    }
    function localstorage() {
      try {
        return localStorage;
      } catch (error) {
      }
    }
    module.exports = require_common()(exports);
    var { formatters } = module.exports;
    formatters.j = function(v2) {
      try {
        return JSON.stringify(v2);
      } catch (error) {
        return "[UnexpectedJSONParseError]: " + error.message;
      }
    };
  }
});

// node_modules/minimalistic-assert/index.js
var require_minimalistic_assert = __commonJS({
  "node_modules/minimalistic-assert/index.js"(exports, module) {
    module.exports = assert;
    function assert(val, msg) {
      if (!val)
        throw new Error(msg || "Assertion failed");
    }
    assert.equal = function assertEqual(l2, r2, msg) {
      if (l2 != r2)
        throw new Error(msg || "Assertion failed: " + l2 + " != " + r2);
    };
  }
});

// node_modules/inherits/inherits_browser.js
var require_inherits_browser = __commonJS({
  "node_modules/inherits/inherits_browser.js"(exports, module) {
    if (typeof Object.create === "function") {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          ctor.prototype = Object.create(superCtor.prototype, {
            constructor: {
              value: ctor,
              enumerable: false,
              writable: true,
              configurable: true
            }
          });
        }
      };
    } else {
      module.exports = function inherits(ctor, superCtor) {
        if (superCtor) {
          ctor.super_ = superCtor;
          var TempCtor = function() {
          };
          TempCtor.prototype = superCtor.prototype;
          ctor.prototype = new TempCtor();
          ctor.prototype.constructor = ctor;
        }
      };
    }
  }
});

// node_modules/hash.js/lib/hash/utils.js
var require_utils = __commonJS({
  "node_modules/hash.js/lib/hash/utils.js"(exports) {
    "use strict";
    var assert = require_minimalistic_assert();
    var inherits = require_inherits_browser();
    exports.inherits = inherits;
    function isSurrogatePair(msg, i2) {
      if ((msg.charCodeAt(i2) & 64512) !== 55296) {
        return false;
      }
      if (i2 < 0 || i2 + 1 >= msg.length) {
        return false;
      }
      return (msg.charCodeAt(i2 + 1) & 64512) === 56320;
    }
    function toArray(msg, enc) {
      if (Array.isArray(msg))
        return msg.slice();
      if (!msg)
        return [];
      var res = [];
      if (typeof msg === "string") {
        if (!enc) {
          var p2 = 0;
          for (var i2 = 0; i2 < msg.length; i2++) {
            var c2 = msg.charCodeAt(i2);
            if (c2 < 128) {
              res[p2++] = c2;
            } else if (c2 < 2048) {
              res[p2++] = c2 >> 6 | 192;
              res[p2++] = c2 & 63 | 128;
            } else if (isSurrogatePair(msg, i2)) {
              c2 = 65536 + ((c2 & 1023) << 10) + (msg.charCodeAt(++i2) & 1023);
              res[p2++] = c2 >> 18 | 240;
              res[p2++] = c2 >> 12 & 63 | 128;
              res[p2++] = c2 >> 6 & 63 | 128;
              res[p2++] = c2 & 63 | 128;
            } else {
              res[p2++] = c2 >> 12 | 224;
              res[p2++] = c2 >> 6 & 63 | 128;
              res[p2++] = c2 & 63 | 128;
            }
          }
        } else if (enc === "hex") {
          msg = msg.replace(/[^a-z0-9]+/ig, "");
          if (msg.length % 2 !== 0)
            msg = "0" + msg;
          for (i2 = 0; i2 < msg.length; i2 += 2)
            res.push(parseInt(msg[i2] + msg[i2 + 1], 16));
        }
      } else {
        for (i2 = 0; i2 < msg.length; i2++)
          res[i2] = msg[i2] | 0;
      }
      return res;
    }
    exports.toArray = toArray;
    function toHex(msg) {
      var res = "";
      for (var i2 = 0; i2 < msg.length; i2++)
        res += zero2(msg[i2].toString(16));
      return res;
    }
    exports.toHex = toHex;
    function htonl(w2) {
      var res = w2 >>> 24 | w2 >>> 8 & 65280 | w2 << 8 & 16711680 | (w2 & 255) << 24;
      return res >>> 0;
    }
    exports.htonl = htonl;
    function toHex32(msg, endian) {
      var res = "";
      for (var i2 = 0; i2 < msg.length; i2++) {
        var w2 = msg[i2];
        if (endian === "little")
          w2 = htonl(w2);
        res += zero8(w2.toString(16));
      }
      return res;
    }
    exports.toHex32 = toHex32;
    function zero2(word) {
      if (word.length === 1)
        return "0" + word;
      else
        return word;
    }
    exports.zero2 = zero2;
    function zero8(word) {
      if (word.length === 7)
        return "0" + word;
      else if (word.length === 6)
        return "00" + word;
      else if (word.length === 5)
        return "000" + word;
      else if (word.length === 4)
        return "0000" + word;
      else if (word.length === 3)
        return "00000" + word;
      else if (word.length === 2)
        return "000000" + word;
      else if (word.length === 1)
        return "0000000" + word;
      else
        return word;
    }
    exports.zero8 = zero8;
    function join32(msg, start, end, endian) {
      var len = end - start;
      assert(len % 4 === 0);
      var res = new Array(len / 4);
      for (var i2 = 0, k2 = start; i2 < res.length; i2++, k2 += 4) {
        var w2;
        if (endian === "big")
          w2 = msg[k2] << 24 | msg[k2 + 1] << 16 | msg[k2 + 2] << 8 | msg[k2 + 3];
        else
          w2 = msg[k2 + 3] << 24 | msg[k2 + 2] << 16 | msg[k2 + 1] << 8 | msg[k2];
        res[i2] = w2 >>> 0;
      }
      return res;
    }
    exports.join32 = join32;
    function split32(msg, endian) {
      var res = new Array(msg.length * 4);
      for (var i2 = 0, k2 = 0; i2 < msg.length; i2++, k2 += 4) {
        var m2 = msg[i2];
        if (endian === "big") {
          res[k2] = m2 >>> 24;
          res[k2 + 1] = m2 >>> 16 & 255;
          res[k2 + 2] = m2 >>> 8 & 255;
          res[k2 + 3] = m2 & 255;
        } else {
          res[k2 + 3] = m2 >>> 24;
          res[k2 + 2] = m2 >>> 16 & 255;
          res[k2 + 1] = m2 >>> 8 & 255;
          res[k2] = m2 & 255;
        }
      }
      return res;
    }
    exports.split32 = split32;
    function rotr32(w2, b2) {
      return w2 >>> b2 | w2 << 32 - b2;
    }
    exports.rotr32 = rotr32;
    function rotl32(w2, b2) {
      return w2 << b2 | w2 >>> 32 - b2;
    }
    exports.rotl32 = rotl32;
    function sum32(a2, b2) {
      return a2 + b2 >>> 0;
    }
    exports.sum32 = sum32;
    function sum32_3(a2, b2, c2) {
      return a2 + b2 + c2 >>> 0;
    }
    exports.sum32_3 = sum32_3;
    function sum32_4(a2, b2, c2, d2) {
      return a2 + b2 + c2 + d2 >>> 0;
    }
    exports.sum32_4 = sum32_4;
    function sum32_5(a2, b2, c2, d2, e2) {
      return a2 + b2 + c2 + d2 + e2 >>> 0;
    }
    exports.sum32_5 = sum32_5;
    function sum64(buf, pos, ah, al) {
      var bh = buf[pos];
      var bl = buf[pos + 1];
      var lo2 = al + bl >>> 0;
      var hi2 = (lo2 < al ? 1 : 0) + ah + bh;
      buf[pos] = hi2 >>> 0;
      buf[pos + 1] = lo2;
    }
    exports.sum64 = sum64;
    function sum64_hi(ah, al, bh, bl) {
      var lo2 = al + bl >>> 0;
      var hi2 = (lo2 < al ? 1 : 0) + ah + bh;
      return hi2 >>> 0;
    }
    exports.sum64_hi = sum64_hi;
    function sum64_lo(ah, al, bh, bl) {
      var lo2 = al + bl;
      return lo2 >>> 0;
    }
    exports.sum64_lo = sum64_lo;
    function sum64_4_hi(ah, al, bh, bl, ch, cl, dh, dl) {
      var carry = 0;
      var lo2 = al;
      lo2 = lo2 + bl >>> 0;
      carry += lo2 < al ? 1 : 0;
      lo2 = lo2 + cl >>> 0;
      carry += lo2 < cl ? 1 : 0;
      lo2 = lo2 + dl >>> 0;
      carry += lo2 < dl ? 1 : 0;
      var hi2 = ah + bh + ch + dh + carry;
      return hi2 >>> 0;
    }
    exports.sum64_4_hi = sum64_4_hi;
    function sum64_4_lo(ah, al, bh, bl, ch, cl, dh, dl) {
      var lo2 = al + bl + cl + dl;
      return lo2 >>> 0;
    }
    exports.sum64_4_lo = sum64_4_lo;
    function sum64_5_hi(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var carry = 0;
      var lo2 = al;
      lo2 = lo2 + bl >>> 0;
      carry += lo2 < al ? 1 : 0;
      lo2 = lo2 + cl >>> 0;
      carry += lo2 < cl ? 1 : 0;
      lo2 = lo2 + dl >>> 0;
      carry += lo2 < dl ? 1 : 0;
      lo2 = lo2 + el >>> 0;
      carry += lo2 < el ? 1 : 0;
      var hi2 = ah + bh + ch + dh + eh + carry;
      return hi2 >>> 0;
    }
    exports.sum64_5_hi = sum64_5_hi;
    function sum64_5_lo(ah, al, bh, bl, ch, cl, dh, dl, eh, el) {
      var lo2 = al + bl + cl + dl + el;
      return lo2 >>> 0;
    }
    exports.sum64_5_lo = sum64_5_lo;
    function rotr64_hi(ah, al, num) {
      var r2 = al << 32 - num | ah >>> num;
      return r2 >>> 0;
    }
    exports.rotr64_hi = rotr64_hi;
    function rotr64_lo(ah, al, num) {
      var r2 = ah << 32 - num | al >>> num;
      return r2 >>> 0;
    }
    exports.rotr64_lo = rotr64_lo;
    function shr64_hi(ah, al, num) {
      return ah >>> num;
    }
    exports.shr64_hi = shr64_hi;
    function shr64_lo(ah, al, num) {
      var r2 = ah << 32 - num | al >>> num;
      return r2 >>> 0;
    }
    exports.shr64_lo = shr64_lo;
  }
});

// node_modules/hash.js/lib/hash/common.js
var require_common2 = __commonJS({
  "node_modules/hash.js/lib/hash/common.js"(exports) {
    "use strict";
    var utils = require_utils();
    var assert = require_minimalistic_assert();
    function BlockHash() {
      this.pending = null;
      this.pendingTotal = 0;
      this.blockSize = this.constructor.blockSize;
      this.outSize = this.constructor.outSize;
      this.hmacStrength = this.constructor.hmacStrength;
      this.padLength = this.constructor.padLength / 8;
      this.endian = "big";
      this._delta8 = this.blockSize / 8;
      this._delta32 = this.blockSize / 32;
    }
    exports.BlockHash = BlockHash;
    BlockHash.prototype.update = function update(msg, enc) {
      msg = utils.toArray(msg, enc);
      if (!this.pending)
        this.pending = msg;
      else
        this.pending = this.pending.concat(msg);
      this.pendingTotal += msg.length;
      if (this.pending.length >= this._delta8) {
        msg = this.pending;
        var r2 = msg.length % this._delta8;
        this.pending = msg.slice(msg.length - r2, msg.length);
        if (this.pending.length === 0)
          this.pending = null;
        msg = utils.join32(msg, 0, msg.length - r2, this.endian);
        for (var i2 = 0; i2 < msg.length; i2 += this._delta32)
          this._update(msg, i2, i2 + this._delta32);
      }
      return this;
    };
    BlockHash.prototype.digest = function digest(enc) {
      this.update(this._pad());
      assert(this.pending === null);
      return this._digest(enc);
    };
    BlockHash.prototype._pad = function pad() {
      var len = this.pendingTotal;
      var bytes = this._delta8;
      var k2 = bytes - (len + this.padLength) % bytes;
      var res = new Array(k2 + this.padLength);
      res[0] = 128;
      for (var i2 = 1; i2 < k2; i2++)
        res[i2] = 0;
      len <<= 3;
      if (this.endian === "big") {
        for (var t2 = 8; t2 < this.padLength; t2++)
          res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = len >>> 24 & 255;
        res[i2++] = len >>> 16 & 255;
        res[i2++] = len >>> 8 & 255;
        res[i2++] = len & 255;
      } else {
        res[i2++] = len & 255;
        res[i2++] = len >>> 8 & 255;
        res[i2++] = len >>> 16 & 255;
        res[i2++] = len >>> 24 & 255;
        res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = 0;
        res[i2++] = 0;
        for (t2 = 8; t2 < this.padLength; t2++)
          res[i2++] = 0;
      }
      return res;
    };
  }
});

// node_modules/hash.js/lib/hash/sha/common.js
var require_common3 = __commonJS({
  "node_modules/hash.js/lib/hash/sha/common.js"(exports) {
    "use strict";
    var utils = require_utils();
    var rotr32 = utils.rotr32;
    function ft_1(s2, x2, y2, z2) {
      if (s2 === 0)
        return ch32(x2, y2, z2);
      if (s2 === 1 || s2 === 3)
        return p32(x2, y2, z2);
      if (s2 === 2)
        return maj32(x2, y2, z2);
    }
    exports.ft_1 = ft_1;
    function ch32(x2, y2, z2) {
      return x2 & y2 ^ ~x2 & z2;
    }
    exports.ch32 = ch32;
    function maj32(x2, y2, z2) {
      return x2 & y2 ^ x2 & z2 ^ y2 & z2;
    }
    exports.maj32 = maj32;
    function p32(x2, y2, z2) {
      return x2 ^ y2 ^ z2;
    }
    exports.p32 = p32;
    function s0_256(x2) {
      return rotr32(x2, 2) ^ rotr32(x2, 13) ^ rotr32(x2, 22);
    }
    exports.s0_256 = s0_256;
    function s1_256(x2) {
      return rotr32(x2, 6) ^ rotr32(x2, 11) ^ rotr32(x2, 25);
    }
    exports.s1_256 = s1_256;
    function g0_256(x2) {
      return rotr32(x2, 7) ^ rotr32(x2, 18) ^ x2 >>> 3;
    }
    exports.g0_256 = g0_256;
    function g1_256(x2) {
      return rotr32(x2, 17) ^ rotr32(x2, 19) ^ x2 >>> 10;
    }
    exports.g1_256 = g1_256;
  }
});

// node_modules/hash.js/lib/hash/sha/1.js
var require__ = __commonJS({
  "node_modules/hash.js/lib/hash/sha/1.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var common = require_common2();
    var shaCommon = require_common3();
    var rotl32 = utils.rotl32;
    var sum32 = utils.sum32;
    var sum32_5 = utils.sum32_5;
    var ft_1 = shaCommon.ft_1;
    var BlockHash = common.BlockHash;
    var sha1_K = [
      1518500249,
      1859775393,
      2400959708,
      3395469782
    ];
    function SHA1() {
      if (!(this instanceof SHA1))
        return new SHA1();
      BlockHash.call(this);
      this.h = [
        1732584193,
        4023233417,
        2562383102,
        271733878,
        3285377520
      ];
      this.W = new Array(80);
    }
    utils.inherits(SHA1, BlockHash);
    module.exports = SHA1;
    SHA1.blockSize = 512;
    SHA1.outSize = 160;
    SHA1.hmacStrength = 80;
    SHA1.padLength = 64;
    SHA1.prototype._update = function _update(msg, start) {
      var W2 = this.W;
      for (var i2 = 0; i2 < 16; i2++)
        W2[i2] = msg[start + i2];
      for (; i2 < W2.length; i2++)
        W2[i2] = rotl32(W2[i2 - 3] ^ W2[i2 - 8] ^ W2[i2 - 14] ^ W2[i2 - 16], 1);
      var a2 = this.h[0];
      var b2 = this.h[1];
      var c2 = this.h[2];
      var d2 = this.h[3];
      var e2 = this.h[4];
      for (i2 = 0; i2 < W2.length; i2++) {
        var s2 = ~~(i2 / 20);
        var t2 = sum32_5(rotl32(a2, 5), ft_1(s2, b2, c2, d2), e2, W2[i2], sha1_K[s2]);
        e2 = d2;
        d2 = c2;
        c2 = rotl32(b2, 30);
        b2 = a2;
        a2 = t2;
      }
      this.h[0] = sum32(this.h[0], a2);
      this.h[1] = sum32(this.h[1], b2);
      this.h[2] = sum32(this.h[2], c2);
      this.h[3] = sum32(this.h[3], d2);
      this.h[4] = sum32(this.h[4], e2);
    };
    SHA1.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
  }
});

// node_modules/hash.js/lib/hash/sha/256.js
var require__2 = __commonJS({
  "node_modules/hash.js/lib/hash/sha/256.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var common = require_common2();
    var shaCommon = require_common3();
    var assert = require_minimalistic_assert();
    var sum32 = utils.sum32;
    var sum32_4 = utils.sum32_4;
    var sum32_5 = utils.sum32_5;
    var ch32 = shaCommon.ch32;
    var maj32 = shaCommon.maj32;
    var s0_256 = shaCommon.s0_256;
    var s1_256 = shaCommon.s1_256;
    var g0_256 = shaCommon.g0_256;
    var g1_256 = shaCommon.g1_256;
    var BlockHash = common.BlockHash;
    var sha256_K = [
      1116352408,
      1899447441,
      3049323471,
      3921009573,
      961987163,
      1508970993,
      2453635748,
      2870763221,
      3624381080,
      310598401,
      607225278,
      1426881987,
      1925078388,
      2162078206,
      2614888103,
      3248222580,
      3835390401,
      4022224774,
      264347078,
      604807628,
      770255983,
      1249150122,
      1555081692,
      1996064986,
      2554220882,
      2821834349,
      2952996808,
      3210313671,
      3336571891,
      3584528711,
      113926993,
      338241895,
      666307205,
      773529912,
      1294757372,
      1396182291,
      1695183700,
      1986661051,
      2177026350,
      2456956037,
      2730485921,
      2820302411,
      3259730800,
      3345764771,
      3516065817,
      3600352804,
      4094571909,
      275423344,
      430227734,
      506948616,
      659060556,
      883997877,
      958139571,
      1322822218,
      1537002063,
      1747873779,
      1955562222,
      2024104815,
      2227730452,
      2361852424,
      2428436474,
      2756734187,
      3204031479,
      3329325298
    ];
    function SHA256() {
      if (!(this instanceof SHA256))
        return new SHA256();
      BlockHash.call(this);
      this.h = [
        1779033703,
        3144134277,
        1013904242,
        2773480762,
        1359893119,
        2600822924,
        528734635,
        1541459225
      ];
      this.k = sha256_K;
      this.W = new Array(64);
    }
    utils.inherits(SHA256, BlockHash);
    module.exports = SHA256;
    SHA256.blockSize = 512;
    SHA256.outSize = 256;
    SHA256.hmacStrength = 192;
    SHA256.padLength = 64;
    SHA256.prototype._update = function _update(msg, start) {
      var W2 = this.W;
      for (var i2 = 0; i2 < 16; i2++)
        W2[i2] = msg[start + i2];
      for (; i2 < W2.length; i2++)
        W2[i2] = sum32_4(g1_256(W2[i2 - 2]), W2[i2 - 7], g0_256(W2[i2 - 15]), W2[i2 - 16]);
      var a2 = this.h[0];
      var b2 = this.h[1];
      var c2 = this.h[2];
      var d2 = this.h[3];
      var e2 = this.h[4];
      var f2 = this.h[5];
      var g2 = this.h[6];
      var h2 = this.h[7];
      assert(this.k.length === W2.length);
      for (i2 = 0; i2 < W2.length; i2++) {
        var T1 = sum32_5(h2, s1_256(e2), ch32(e2, f2, g2), this.k[i2], W2[i2]);
        var T2 = sum32(s0_256(a2), maj32(a2, b2, c2));
        h2 = g2;
        g2 = f2;
        f2 = e2;
        e2 = sum32(d2, T1);
        d2 = c2;
        c2 = b2;
        b2 = a2;
        a2 = sum32(T1, T2);
      }
      this.h[0] = sum32(this.h[0], a2);
      this.h[1] = sum32(this.h[1], b2);
      this.h[2] = sum32(this.h[2], c2);
      this.h[3] = sum32(this.h[3], d2);
      this.h[4] = sum32(this.h[4], e2);
      this.h[5] = sum32(this.h[5], f2);
      this.h[6] = sum32(this.h[6], g2);
      this.h[7] = sum32(this.h[7], h2);
    };
    SHA256.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
  }
});

// node_modules/hash.js/lib/hash/sha/224.js
var require__3 = __commonJS({
  "node_modules/hash.js/lib/hash/sha/224.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var SHA256 = require__2();
    function SHA224() {
      if (!(this instanceof SHA224))
        return new SHA224();
      SHA256.call(this);
      this.h = [
        3238371032,
        914150663,
        812702999,
        4144912697,
        4290775857,
        1750603025,
        1694076839,
        3204075428
      ];
    }
    utils.inherits(SHA224, SHA256);
    module.exports = SHA224;
    SHA224.blockSize = 512;
    SHA224.outSize = 224;
    SHA224.hmacStrength = 192;
    SHA224.padLength = 64;
    SHA224.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h.slice(0, 7), "big");
      else
        return utils.split32(this.h.slice(0, 7), "big");
    };
  }
});

// node_modules/hash.js/lib/hash/sha/512.js
var require__4 = __commonJS({
  "node_modules/hash.js/lib/hash/sha/512.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var common = require_common2();
    var assert = require_minimalistic_assert();
    var rotr64_hi = utils.rotr64_hi;
    var rotr64_lo = utils.rotr64_lo;
    var shr64_hi = utils.shr64_hi;
    var shr64_lo = utils.shr64_lo;
    var sum64 = utils.sum64;
    var sum64_hi = utils.sum64_hi;
    var sum64_lo = utils.sum64_lo;
    var sum64_4_hi = utils.sum64_4_hi;
    var sum64_4_lo = utils.sum64_4_lo;
    var sum64_5_hi = utils.sum64_5_hi;
    var sum64_5_lo = utils.sum64_5_lo;
    var BlockHash = common.BlockHash;
    var sha512_K = [
      1116352408,
      3609767458,
      1899447441,
      602891725,
      3049323471,
      3964484399,
      3921009573,
      2173295548,
      961987163,
      4081628472,
      1508970993,
      3053834265,
      2453635748,
      2937671579,
      2870763221,
      3664609560,
      3624381080,
      2734883394,
      310598401,
      1164996542,
      607225278,
      1323610764,
      1426881987,
      3590304994,
      1925078388,
      4068182383,
      2162078206,
      991336113,
      2614888103,
      633803317,
      3248222580,
      3479774868,
      3835390401,
      2666613458,
      4022224774,
      944711139,
      264347078,
      2341262773,
      604807628,
      2007800933,
      770255983,
      1495990901,
      1249150122,
      1856431235,
      1555081692,
      3175218132,
      1996064986,
      2198950837,
      2554220882,
      3999719339,
      2821834349,
      766784016,
      2952996808,
      2566594879,
      3210313671,
      3203337956,
      3336571891,
      1034457026,
      3584528711,
      2466948901,
      113926993,
      3758326383,
      338241895,
      168717936,
      666307205,
      1188179964,
      773529912,
      1546045734,
      1294757372,
      1522805485,
      1396182291,
      2643833823,
      1695183700,
      2343527390,
      1986661051,
      1014477480,
      2177026350,
      1206759142,
      2456956037,
      344077627,
      2730485921,
      1290863460,
      2820302411,
      3158454273,
      3259730800,
      3505952657,
      3345764771,
      106217008,
      3516065817,
      3606008344,
      3600352804,
      1432725776,
      4094571909,
      1467031594,
      275423344,
      851169720,
      430227734,
      3100823752,
      506948616,
      1363258195,
      659060556,
      3750685593,
      883997877,
      3785050280,
      958139571,
      3318307427,
      1322822218,
      3812723403,
      1537002063,
      2003034995,
      1747873779,
      3602036899,
      1955562222,
      1575990012,
      2024104815,
      1125592928,
      2227730452,
      2716904306,
      2361852424,
      442776044,
      2428436474,
      593698344,
      2756734187,
      3733110249,
      3204031479,
      2999351573,
      3329325298,
      3815920427,
      3391569614,
      3928383900,
      3515267271,
      566280711,
      3940187606,
      3454069534,
      4118630271,
      4000239992,
      116418474,
      1914138554,
      174292421,
      2731055270,
      289380356,
      3203993006,
      460393269,
      320620315,
      685471733,
      587496836,
      852142971,
      1086792851,
      1017036298,
      365543100,
      1126000580,
      2618297676,
      1288033470,
      3409855158,
      1501505948,
      4234509866,
      1607167915,
      987167468,
      1816402316,
      1246189591
    ];
    function SHA512() {
      if (!(this instanceof SHA512))
        return new SHA512();
      BlockHash.call(this);
      this.h = [
        1779033703,
        4089235720,
        3144134277,
        2227873595,
        1013904242,
        4271175723,
        2773480762,
        1595750129,
        1359893119,
        2917565137,
        2600822924,
        725511199,
        528734635,
        4215389547,
        1541459225,
        327033209
      ];
      this.k = sha512_K;
      this.W = new Array(160);
    }
    utils.inherits(SHA512, BlockHash);
    module.exports = SHA512;
    SHA512.blockSize = 1024;
    SHA512.outSize = 512;
    SHA512.hmacStrength = 192;
    SHA512.padLength = 128;
    SHA512.prototype._prepareBlock = function _prepareBlock(msg, start) {
      var W2 = this.W;
      for (var i2 = 0; i2 < 32; i2++)
        W2[i2] = msg[start + i2];
      for (; i2 < W2.length; i2 += 2) {
        var c0_hi = g1_512_hi(W2[i2 - 4], W2[i2 - 3]);
        var c0_lo = g1_512_lo(W2[i2 - 4], W2[i2 - 3]);
        var c1_hi = W2[i2 - 14];
        var c1_lo = W2[i2 - 13];
        var c2_hi = g0_512_hi(W2[i2 - 30], W2[i2 - 29]);
        var c2_lo = g0_512_lo(W2[i2 - 30], W2[i2 - 29]);
        var c3_hi = W2[i2 - 32];
        var c3_lo = W2[i2 - 31];
        W2[i2] = sum64_4_hi(
          c0_hi,
          c0_lo,
          c1_hi,
          c1_lo,
          c2_hi,
          c2_lo,
          c3_hi,
          c3_lo
        );
        W2[i2 + 1] = sum64_4_lo(
          c0_hi,
          c0_lo,
          c1_hi,
          c1_lo,
          c2_hi,
          c2_lo,
          c3_hi,
          c3_lo
        );
      }
    };
    SHA512.prototype._update = function _update(msg, start) {
      this._prepareBlock(msg, start);
      var W2 = this.W;
      var ah = this.h[0];
      var al = this.h[1];
      var bh = this.h[2];
      var bl = this.h[3];
      var ch = this.h[4];
      var cl = this.h[5];
      var dh = this.h[6];
      var dl = this.h[7];
      var eh = this.h[8];
      var el = this.h[9];
      var fh = this.h[10];
      var fl = this.h[11];
      var gh = this.h[12];
      var gl = this.h[13];
      var hh = this.h[14];
      var hl = this.h[15];
      assert(this.k.length === W2.length);
      for (var i2 = 0; i2 < W2.length; i2 += 2) {
        var c0_hi = hh;
        var c0_lo = hl;
        var c1_hi = s1_512_hi(eh, el);
        var c1_lo = s1_512_lo(eh, el);
        var c2_hi = ch64_hi(eh, el, fh, fl, gh, gl);
        var c2_lo = ch64_lo(eh, el, fh, fl, gh, gl);
        var c3_hi = this.k[i2];
        var c3_lo = this.k[i2 + 1];
        var c4_hi = W2[i2];
        var c4_lo = W2[i2 + 1];
        var T1_hi = sum64_5_hi(
          c0_hi,
          c0_lo,
          c1_hi,
          c1_lo,
          c2_hi,
          c2_lo,
          c3_hi,
          c3_lo,
          c4_hi,
          c4_lo
        );
        var T1_lo = sum64_5_lo(
          c0_hi,
          c0_lo,
          c1_hi,
          c1_lo,
          c2_hi,
          c2_lo,
          c3_hi,
          c3_lo,
          c4_hi,
          c4_lo
        );
        c0_hi = s0_512_hi(ah, al);
        c0_lo = s0_512_lo(ah, al);
        c1_hi = maj64_hi(ah, al, bh, bl, ch, cl);
        c1_lo = maj64_lo(ah, al, bh, bl, ch, cl);
        var T2_hi = sum64_hi(c0_hi, c0_lo, c1_hi, c1_lo);
        var T2_lo = sum64_lo(c0_hi, c0_lo, c1_hi, c1_lo);
        hh = gh;
        hl = gl;
        gh = fh;
        gl = fl;
        fh = eh;
        fl = el;
        eh = sum64_hi(dh, dl, T1_hi, T1_lo);
        el = sum64_lo(dl, dl, T1_hi, T1_lo);
        dh = ch;
        dl = cl;
        ch = bh;
        cl = bl;
        bh = ah;
        bl = al;
        ah = sum64_hi(T1_hi, T1_lo, T2_hi, T2_lo);
        al = sum64_lo(T1_hi, T1_lo, T2_hi, T2_lo);
      }
      sum64(this.h, 0, ah, al);
      sum64(this.h, 2, bh, bl);
      sum64(this.h, 4, ch, cl);
      sum64(this.h, 6, dh, dl);
      sum64(this.h, 8, eh, el);
      sum64(this.h, 10, fh, fl);
      sum64(this.h, 12, gh, gl);
      sum64(this.h, 14, hh, hl);
    };
    SHA512.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "big");
      else
        return utils.split32(this.h, "big");
    };
    function ch64_hi(xh, xl, yh, yl, zh) {
      var r2 = xh & yh ^ ~xh & zh;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function ch64_lo(xh, xl, yh, yl, zh, zl) {
      var r2 = xl & yl ^ ~xl & zl;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function maj64_hi(xh, xl, yh, yl, zh) {
      var r2 = xh & yh ^ xh & zh ^ yh & zh;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function maj64_lo(xh, xl, yh, yl, zh, zl) {
      var r2 = xl & yl ^ xl & zl ^ yl & zl;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function s0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 28);
      var c1_hi = rotr64_hi(xl, xh, 2);
      var c2_hi = rotr64_hi(xl, xh, 7);
      var r2 = c0_hi ^ c1_hi ^ c2_hi;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function s0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 28);
      var c1_lo = rotr64_lo(xl, xh, 2);
      var c2_lo = rotr64_lo(xl, xh, 7);
      var r2 = c0_lo ^ c1_lo ^ c2_lo;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function s1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 14);
      var c1_hi = rotr64_hi(xh, xl, 18);
      var c2_hi = rotr64_hi(xl, xh, 9);
      var r2 = c0_hi ^ c1_hi ^ c2_hi;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function s1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 14);
      var c1_lo = rotr64_lo(xh, xl, 18);
      var c2_lo = rotr64_lo(xl, xh, 9);
      var r2 = c0_lo ^ c1_lo ^ c2_lo;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function g0_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 1);
      var c1_hi = rotr64_hi(xh, xl, 8);
      var c2_hi = shr64_hi(xh, xl, 7);
      var r2 = c0_hi ^ c1_hi ^ c2_hi;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function g0_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 1);
      var c1_lo = rotr64_lo(xh, xl, 8);
      var c2_lo = shr64_lo(xh, xl, 7);
      var r2 = c0_lo ^ c1_lo ^ c2_lo;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function g1_512_hi(xh, xl) {
      var c0_hi = rotr64_hi(xh, xl, 19);
      var c1_hi = rotr64_hi(xl, xh, 29);
      var c2_hi = shr64_hi(xh, xl, 6);
      var r2 = c0_hi ^ c1_hi ^ c2_hi;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
    function g1_512_lo(xh, xl) {
      var c0_lo = rotr64_lo(xh, xl, 19);
      var c1_lo = rotr64_lo(xl, xh, 29);
      var c2_lo = shr64_lo(xh, xl, 6);
      var r2 = c0_lo ^ c1_lo ^ c2_lo;
      if (r2 < 0)
        r2 += 4294967296;
      return r2;
    }
  }
});

// node_modules/hash.js/lib/hash/sha/384.js
var require__5 = __commonJS({
  "node_modules/hash.js/lib/hash/sha/384.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var SHA512 = require__4();
    function SHA384() {
      if (!(this instanceof SHA384))
        return new SHA384();
      SHA512.call(this);
      this.h = [
        3418070365,
        3238371032,
        1654270250,
        914150663,
        2438529370,
        812702999,
        355462360,
        4144912697,
        1731405415,
        4290775857,
        2394180231,
        1750603025,
        3675008525,
        1694076839,
        1203062813,
        3204075428
      ];
    }
    utils.inherits(SHA384, SHA512);
    module.exports = SHA384;
    SHA384.blockSize = 1024;
    SHA384.outSize = 384;
    SHA384.hmacStrength = 192;
    SHA384.padLength = 128;
    SHA384.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h.slice(0, 12), "big");
      else
        return utils.split32(this.h.slice(0, 12), "big");
    };
  }
});

// node_modules/hash.js/lib/hash/sha.js
var require_sha = __commonJS({
  "node_modules/hash.js/lib/hash/sha.js"(exports) {
    "use strict";
    exports.sha1 = require__();
    exports.sha224 = require__3();
    exports.sha256 = require__2();
    exports.sha384 = require__5();
    exports.sha512 = require__4();
  }
});

// node_modules/hash.js/lib/hash/ripemd.js
var require_ripemd = __commonJS({
  "node_modules/hash.js/lib/hash/ripemd.js"(exports) {
    "use strict";
    var utils = require_utils();
    var common = require_common2();
    var rotl32 = utils.rotl32;
    var sum32 = utils.sum32;
    var sum32_3 = utils.sum32_3;
    var sum32_4 = utils.sum32_4;
    var BlockHash = common.BlockHash;
    function RIPEMD160() {
      if (!(this instanceof RIPEMD160))
        return new RIPEMD160();
      BlockHash.call(this);
      this.h = [1732584193, 4023233417, 2562383102, 271733878, 3285377520];
      this.endian = "little";
    }
    utils.inherits(RIPEMD160, BlockHash);
    exports.ripemd160 = RIPEMD160;
    RIPEMD160.blockSize = 512;
    RIPEMD160.outSize = 160;
    RIPEMD160.hmacStrength = 192;
    RIPEMD160.padLength = 64;
    RIPEMD160.prototype._update = function update(msg, start) {
      var A2 = this.h[0];
      var B2 = this.h[1];
      var C2 = this.h[2];
      var D2 = this.h[3];
      var E2 = this.h[4];
      var Ah = A2;
      var Bh = B2;
      var Ch = C2;
      var Dh = D2;
      var Eh = E2;
      for (var j2 = 0; j2 < 80; j2++) {
        var T2 = sum32(
          rotl32(
            sum32_4(A2, f2(j2, B2, C2, D2), msg[r2[j2] + start], K2(j2)),
            s2[j2]
          ),
          E2
        );
        A2 = E2;
        E2 = D2;
        D2 = rotl32(C2, 10);
        C2 = B2;
        B2 = T2;
        T2 = sum32(
          rotl32(
            sum32_4(Ah, f2(79 - j2, Bh, Ch, Dh), msg[rh[j2] + start], Kh(j2)),
            sh[j2]
          ),
          Eh
        );
        Ah = Eh;
        Eh = Dh;
        Dh = rotl32(Ch, 10);
        Ch = Bh;
        Bh = T2;
      }
      T2 = sum32_3(this.h[1], C2, Dh);
      this.h[1] = sum32_3(this.h[2], D2, Eh);
      this.h[2] = sum32_3(this.h[3], E2, Ah);
      this.h[3] = sum32_3(this.h[4], A2, Bh);
      this.h[4] = sum32_3(this.h[0], B2, Ch);
      this.h[0] = T2;
    };
    RIPEMD160.prototype._digest = function digest(enc) {
      if (enc === "hex")
        return utils.toHex32(this.h, "little");
      else
        return utils.split32(this.h, "little");
    };
    function f2(j2, x2, y2, z2) {
      if (j2 <= 15)
        return x2 ^ y2 ^ z2;
      else if (j2 <= 31)
        return x2 & y2 | ~x2 & z2;
      else if (j2 <= 47)
        return (x2 | ~y2) ^ z2;
      else if (j2 <= 63)
        return x2 & z2 | y2 & ~z2;
      else
        return x2 ^ (y2 | ~z2);
    }
    function K2(j2) {
      if (j2 <= 15)
        return 0;
      else if (j2 <= 31)
        return 1518500249;
      else if (j2 <= 47)
        return 1859775393;
      else if (j2 <= 63)
        return 2400959708;
      else
        return 2840853838;
    }
    function Kh(j2) {
      if (j2 <= 15)
        return 1352829926;
      else if (j2 <= 31)
        return 1548603684;
      else if (j2 <= 47)
        return 1836072691;
      else if (j2 <= 63)
        return 2053994217;
      else
        return 0;
    }
    var r2 = [
      0,
      1,
      2,
      3,
      4,
      5,
      6,
      7,
      8,
      9,
      10,
      11,
      12,
      13,
      14,
      15,
      7,
      4,
      13,
      1,
      10,
      6,
      15,
      3,
      12,
      0,
      9,
      5,
      2,
      14,
      11,
      8,
      3,
      10,
      14,
      4,
      9,
      15,
      8,
      1,
      2,
      7,
      0,
      6,
      13,
      11,
      5,
      12,
      1,
      9,
      11,
      10,
      0,
      8,
      12,
      4,
      13,
      3,
      7,
      15,
      14,
      5,
      6,
      2,
      4,
      0,
      5,
      9,
      7,
      12,
      2,
      10,
      14,
      1,
      3,
      8,
      11,
      6,
      15,
      13
    ];
    var rh = [
      5,
      14,
      7,
      0,
      9,
      2,
      11,
      4,
      13,
      6,
      15,
      8,
      1,
      10,
      3,
      12,
      6,
      11,
      3,
      7,
      0,
      13,
      5,
      10,
      14,
      15,
      8,
      12,
      4,
      9,
      1,
      2,
      15,
      5,
      1,
      3,
      7,
      14,
      6,
      9,
      11,
      8,
      12,
      2,
      10,
      0,
      4,
      13,
      8,
      6,
      4,
      1,
      3,
      11,
      15,
      0,
      5,
      12,
      2,
      13,
      9,
      7,
      10,
      14,
      12,
      15,
      10,
      4,
      1,
      5,
      8,
      7,
      6,
      2,
      13,
      14,
      0,
      3,
      9,
      11
    ];
    var s2 = [
      11,
      14,
      15,
      12,
      5,
      8,
      7,
      9,
      11,
      13,
      14,
      15,
      6,
      7,
      9,
      8,
      7,
      6,
      8,
      13,
      11,
      9,
      7,
      15,
      7,
      12,
      15,
      9,
      11,
      7,
      13,
      12,
      11,
      13,
      6,
      7,
      14,
      9,
      13,
      15,
      14,
      8,
      13,
      6,
      5,
      12,
      7,
      5,
      11,
      12,
      14,
      15,
      14,
      15,
      9,
      8,
      9,
      14,
      5,
      6,
      8,
      6,
      5,
      12,
      9,
      15,
      5,
      11,
      6,
      8,
      13,
      12,
      5,
      12,
      13,
      14,
      11,
      8,
      5,
      6
    ];
    var sh = [
      8,
      9,
      9,
      11,
      13,
      15,
      15,
      5,
      7,
      7,
      8,
      11,
      14,
      14,
      12,
      6,
      9,
      13,
      15,
      7,
      12,
      8,
      9,
      11,
      7,
      7,
      12,
      7,
      6,
      15,
      13,
      11,
      9,
      7,
      15,
      11,
      8,
      6,
      6,
      14,
      12,
      13,
      5,
      14,
      13,
      13,
      7,
      5,
      15,
      5,
      8,
      11,
      14,
      14,
      6,
      14,
      6,
      9,
      12,
      9,
      12,
      5,
      15,
      8,
      8,
      5,
      12,
      9,
      12,
      5,
      14,
      6,
      8,
      13,
      6,
      5,
      15,
      13,
      11,
      11
    ];
  }
});

// node_modules/hash.js/lib/hash/hmac.js
var require_hmac = __commonJS({
  "node_modules/hash.js/lib/hash/hmac.js"(exports, module) {
    "use strict";
    var utils = require_utils();
    var assert = require_minimalistic_assert();
    function Hmac(hash, key, enc) {
      if (!(this instanceof Hmac))
        return new Hmac(hash, key, enc);
      this.Hash = hash;
      this.blockSize = hash.blockSize / 8;
      this.outSize = hash.outSize / 8;
      this.inner = null;
      this.outer = null;
      this._init(utils.toArray(key, enc));
    }
    module.exports = Hmac;
    Hmac.prototype._init = function init(key) {
      if (key.length > this.blockSize)
        key = new this.Hash().update(key).digest();
      assert(key.length <= this.blockSize);
      for (var i2 = key.length; i2 < this.blockSize; i2++)
        key.push(0);
      for (i2 = 0; i2 < key.length; i2++)
        key[i2] ^= 54;
      this.inner = new this.Hash().update(key);
      for (i2 = 0; i2 < key.length; i2++)
        key[i2] ^= 106;
      this.outer = new this.Hash().update(key);
    };
    Hmac.prototype.update = function update(msg, enc) {
      this.inner.update(msg, enc);
      return this;
    };
    Hmac.prototype.digest = function digest(enc) {
      this.outer.update(this.inner.digest());
      return this.outer.digest(enc);
    };
  }
});

// node_modules/hash.js/lib/hash.js
var require_hash = __commonJS({
  "node_modules/hash.js/lib/hash.js"(exports) {
    var hash = exports;
    hash.utils = require_utils();
    hash.common = require_common2();
    hash.sha = require_sha();
    hash.ripemd = require_ripemd();
    hash.hmac = require_hmac();
    hash.sha1 = hash.sha.sha1;
    hash.sha256 = hash.sha.sha256;
    hash.sha224 = hash.sha.sha224;
    hash.sha384 = hash.sha.sha384;
    hash.sha512 = hash.sha.sha512;
    hash.ripemd160 = hash.ripemd.ripemd160;
  }
});

// node_modules/canonicalize/lib/canonicalize.js
var require_canonicalize = __commonJS({
  "node_modules/canonicalize/lib/canonicalize.js"(exports, module) {
    "use strict";
    module.exports = function serialize(object) {
      if (object === null || typeof object !== "object" || object.toJSON != null) {
        return JSON.stringify(object);
      }
      if (Array.isArray(object)) {
        return "[" + object.reduce((t2, cv, ci2) => {
          const comma = ci2 === 0 ? "" : ",";
          const value = cv === void 0 || typeof cv === "symbol" ? null : cv;
          return t2 + comma + serialize(value);
        }, "") + "]";
      }
      return "{" + Object.keys(object).sort().reduce((t2, cv, ci2) => {
        if (object[cv] === void 0 || typeof object[cv] === "symbol") {
          return t2;
        }
        const comma = t2.length === 0 ? "" : ",";
        return t2 + comma + serialize(cv) + ":" + serialize(object[cv]);
      }, "") + "}";
    };
  }
});

// node_modules/@inngest/ai/dist/adapters/anthropic.js
var require_anthropic = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/anthropic.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@inngest/ai/dist/adapters/gemini.js
var require_gemini = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/gemini.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.GeminiAiAdapter = void 0;
    var GeminiAiAdapter;
    (function(GeminiAiAdapter2) {
      let HarmCategory;
      (function(HarmCategory2) {
        HarmCategory2["HARM_CATEGORY_UNSPECIFIED"] = "HARM_CATEGORY_UNSPECIFIED";
        HarmCategory2["HARM_CATEGORY_HATE_SPEECH"] = "HARM_CATEGORY_HATE_SPEECH";
        HarmCategory2["HARM_CATEGORY_SEXUALLY_EXPLICIT"] = "HARM_CATEGORY_SEXUALLY_EXPLICIT";
        HarmCategory2["HARM_CATEGORY_DANGEROUS_CONTENT"] = "HARM_CATEGORY_DANGEROUS_CONTENT";
        HarmCategory2["HARM_CATEGORY_HARASSMENT"] = "HARM_CATEGORY_HARASSMENT";
        HarmCategory2["HARM_CATEGORY_CIVIC_INTEGRITY"] = "HARM_CATEGORY_CIVIC_INTEGRITY";
      })(HarmCategory = GeminiAiAdapter2.HarmCategory || (GeminiAiAdapter2.HarmCategory = {}));
      let HarmBlockThreshold;
      (function(HarmBlockThreshold2) {
        HarmBlockThreshold2["HARM_BLOCK_THRESHOLD_UNSPECIFIED"] = "HARM_BLOCK_THRESHOLD_UNSPECIFIED";
        HarmBlockThreshold2["BLOCK_LOW_AND_ABOVE"] = "BLOCK_LOW_AND_ABOVE";
        HarmBlockThreshold2["BLOCK_MEDIUM_AND_ABOVE"] = "BLOCK_MEDIUM_AND_ABOVE";
        HarmBlockThreshold2["BLOCK_ONLY_HIGH"] = "BLOCK_ONLY_HIGH";
        HarmBlockThreshold2["BLOCK_NONE"] = "BLOCK_NONE";
        HarmBlockThreshold2["OFF"] = "OFF";
      })(HarmBlockThreshold = GeminiAiAdapter2.HarmBlockThreshold || (GeminiAiAdapter2.HarmBlockThreshold = {}));
    })(GeminiAiAdapter || (exports.GeminiAiAdapter = GeminiAiAdapter = {}));
  }
});

// node_modules/@inngest/ai/dist/adapters/openai.js
var require_openai = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/openai.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@inngest/ai/dist/adapters/azure-openai.js
var require_azure_openai = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/azure-openai.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@inngest/ai/dist/adapters/grok.js
var require_grok = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/grok.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@inngest/ai/dist/adapters/openai-responses.js
var require_openai_responses = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/openai-responses.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
  }
});

// node_modules/@inngest/ai/dist/adapters/index.js
var require_adapters = __commonJS({
  "node_modules/@inngest/ai/dist/adapters/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o2, k22, desc);
    }) : (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o2[k22] = m2[k2];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_anthropic(), exports);
    __exportStar(require_gemini(), exports);
    __exportStar(require_openai(), exports);
    __exportStar(require_azure_openai(), exports);
    __exportStar(require_grok(), exports);
    __exportStar(require_openai_responses(), exports);
  }
});

// node_modules/@inngest/ai/dist/env.js
var require_env = __commonJS({
  "node_modules/@inngest/ai/dist/env.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.envKeys = exports.processEnv = exports.allProcessEnv = void 0;
    var allProcessEnv2 = () => {
      try {
        if (process.env) {
          return process.env;
        }
      } catch (_err) {
      }
      try {
        const env = Deno.env.toObject();
        if (env) {
          return env;
        }
      } catch (_err) {
      }
      try {
        const env = Netlify.env.toObject();
        if (env) {
          return env;
        }
      } catch (_err) {
      }
      return {};
    };
    exports.allProcessEnv = allProcessEnv2;
    var processEnv = (key) => {
      return (0, exports.allProcessEnv)()[key];
    };
    exports.processEnv = processEnv;
    var envKeys2;
    (function(envKeys3) {
      envKeys3["OpenAiApiKey"] = "OPENAI_API_KEY";
      envKeys3["GeminiApiKey"] = "GEMINI_API_KEY";
      envKeys3["AnthropicApiKey"] = "ANTHROPIC_API_KEY";
      envKeys3["DeepSeekApiKey"] = "DEEPSEEK_API_KEY";
      envKeys3["GrokApiKey"] = "XAI_API_KEY";
      envKeys3["AzureOpenAiApiKey"] = "AZURE_OPENAI_API_KEY";
    })(envKeys2 || (exports.envKeys = envKeys2 = {}));
  }
});

// node_modules/@inngest/ai/dist/models/anthropic.js
var require_anthropic2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/anthropic.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.anthropic = void 0;
    var env_1 = require_env();
    var anthropic = (options) => {
      var _a2, _b;
      const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.AnthropicApiKey) || "";
      let baseUrl = options.baseUrl || "https://api.anthropic.com/v1/";
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      const url = new URL("messages", baseUrl);
      const headers = {
        "anthropic-version": "2023-06-01"
      };
      if ((((_a2 = options.betaHeaders) === null || _a2 === void 0 ? void 0 : _a2.length) || 0) > 0) {
        headers["anthropic-beta"] = ((_b = options.betaHeaders) === null || _b === void 0 ? void 0 : _b.join(",")) || "";
      }
      return {
        url: url.href,
        authKey,
        format: "anthropic",
        onCall(_2, body) {
          Object.assign(body, options.defaultParameters);
          body.model || (body.model = options.model);
        },
        headers,
        options
      };
    };
    exports.anthropic = anthropic;
  }
});

// node_modules/@inngest/ai/dist/models/gemini.js
var require_gemini2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/gemini.js"(exports) {
    "use strict";
    var __rest = exports && exports.__rest || function(s2, e2) {
      var t2 = {};
      for (var p2 in s2) if (Object.prototype.hasOwnProperty.call(s2, p2) && e2.indexOf(p2) < 0)
        t2[p2] = s2[p2];
      if (s2 != null && typeof Object.getOwnPropertySymbols === "function")
        for (var i2 = 0, p2 = Object.getOwnPropertySymbols(s2); i2 < p2.length; i2++) {
          if (e2.indexOf(p2[i2]) < 0 && Object.prototype.propertyIsEnumerable.call(s2, p2[i2]))
            t2[p2[i2]] = s2[p2[i2]];
        }
      return t2;
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.gemini = void 0;
    var env_1 = require_env();
    var gemini = (options) => {
      const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.GeminiApiKey) || "";
      let baseUrl = options.baseUrl || "https://generativelanguage.googleapis.com/v1beta/";
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      const url = new URL(`models/${options.model}:generateContent?key=${authKey}`, baseUrl);
      const headers = {};
      return {
        url: url.href,
        authKey,
        format: "gemini",
        onCall(_2, body) {
          var _a2;
          if (!options.defaultParameters) {
            return;
          }
          const _b = options.defaultParameters, { generationConfig: defaultGenerationConfig } = _b, otherDefaults = __rest(_b, ["generationConfig"]);
          Object.assign(body, Object.assign(Object.assign({}, otherDefaults), body));
          if (defaultGenerationConfig) {
            body.generationConfig = Object.assign(Object.assign(Object.assign({}, defaultGenerationConfig), body.generationConfig || {}), {
              // And ensure nested thinkingConfig is also deep-merged
              thinkingConfig: Object.assign(Object.assign({}, defaultGenerationConfig.thinkingConfig), ((_a2 = body.generationConfig) === null || _a2 === void 0 ? void 0 : _a2.thinkingConfig) || {})
            });
          }
        },
        headers,
        options
      };
    };
    exports.gemini = gemini;
  }
});

// node_modules/@inngest/ai/dist/models/openai.js
var require_openai2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/openai.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openai = void 0;
    var env_1 = require_env();
    var openai = (options) => {
      const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.OpenAiApiKey) || "";
      let baseUrl = options.baseUrl || "https://api.openai.com/v1/";
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      const url = new URL("chat/completions", baseUrl);
      return {
        url: url.href,
        authKey,
        format: "openai-chat",
        onCall(_2, body) {
          Object.assign(body, options.defaultParameters);
          body.model || (body.model = options.model);
        },
        options
      };
    };
    exports.openai = openai;
  }
});

// node_modules/@inngest/ai/dist/models/azure-openai.js
var require_azure_openai2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/azure-openai.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.azureOpenai = void 0;
    var env_js_1 = require_env();
    var openai_js_1 = require_openai2();
    var azureOpenai = (options) => {
      if (!options.endpoint) {
        throw new Error("Azure OpenAI endpoint is required");
      }
      const authKey = options.apiKey || (0, env_js_1.processEnv)(env_js_1.envKeys.AzureOpenAiApiKey) || "";
      const baseModel = (0, openai_js_1.openai)({
        model: options.model,
        apiKey: authKey,
        baseUrl: options.endpoint,
        defaultParameters: options.defaultParameters
      });
      const url = new URL(`openai/deployments/${options.deployment}/chat/completions`, options.endpoint);
      url.searchParams.set("api-version", options.apiVersion);
      return Object.assign(Object.assign({}, baseModel), {
        url: url.href,
        format: "azure-openai",
        onCall(_2, body) {
          Object.assign(body, options.defaultParameters);
          body.model || (body.model = options.model);
        },
        // Override headers to use Azure's API key format
        headers: {
          "api-key": baseModel.authKey,
          "Content-Type": "application/json"
        },
        options
      });
    };
    exports.azureOpenai = azureOpenai;
  }
});

// node_modules/@inngest/ai/dist/models/deepseek.js
var require_deepseek = __commonJS({
  "node_modules/@inngest/ai/dist/models/deepseek.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.deepseek = void 0;
    var env_1 = require_env();
    var deepseek = (options) => {
      const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.DeepSeekApiKey) || "";
      let baseUrl = options.baseUrl || "https://api.deepseek.com/v1/";
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      const url = new URL("chat/completions", baseUrl);
      return {
        url: url.href,
        authKey,
        format: "openai-chat",
        onCall(_2, body) {
          Object.assign(body, options.defaultParameters);
          body.model || (body.model = options.model);
        },
        options
      };
    };
    exports.deepseek = deepseek;
  }
});

// node_modules/@inngest/ai/dist/models/grok.js
var require_grok2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/grok.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.grok = void 0;
    var env_1 = require_env();
    var openai_js_1 = require_openai2();
    var grok = (options) => {
      const apiKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.GrokApiKey);
      const baseUrl = options.baseUrl || "https://api.x.ai/v1";
      const model = options.model;
      const adapter = (0, openai_js_1.openai)(Object.assign(Object.assign({}, options), {
        apiKey,
        baseUrl,
        model
      }));
      adapter.format = "grok";
      return adapter;
    };
    exports.grok = grok;
  }
});

// node_modules/@inngest/ai/dist/models/openai-responses.js
var require_openai_responses2 = __commonJS({
  "node_modules/@inngest/ai/dist/models/openai-responses.js"(exports) {
    "use strict";
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.openaiResponses = void 0;
    var env_1 = require_env();
    var openaiResponses = (options) => {
      const authKey = options.apiKey || (0, env_1.processEnv)(env_1.envKeys.OpenAiApiKey) || "";
      let baseUrl = options.baseUrl || "https://api.openai.com/v1/";
      if (!baseUrl.endsWith("/")) {
        baseUrl += "/";
      }
      const url = new URL("responses", baseUrl);
      return {
        url: url.href,
        authKey,
        format: "openai-responses",
        onCall(_2, body) {
          Object.assign(body, options.defaultParameters);
          body.model || (body.model = options.model);
        },
        options
      };
    };
    exports.openaiResponses = openaiResponses;
  }
});

// node_modules/@inngest/ai/dist/models/index.js
var require_models = __commonJS({
  "node_modules/@inngest/ai/dist/models/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o2, k22, desc);
    }) : (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o2[k22] = m2[k2];
    }));
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    Object.defineProperty(exports, "__esModule", { value: true });
    __exportStar(require_anthropic2(), exports);
    __exportStar(require_gemini2(), exports);
    __exportStar(require_openai2(), exports);
    __exportStar(require_azure_openai2(), exports);
    __exportStar(require_deepseek(), exports);
    __exportStar(require_grok2(), exports);
    __exportStar(require_openai_responses2(), exports);
  }
});

// node_modules/@inngest/ai/dist/index.js
var require_dist2 = __commonJS({
  "node_modules/@inngest/ai/dist/index.js"(exports) {
    "use strict";
    var __createBinding = exports && exports.__createBinding || (Object.create ? (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      var desc = Object.getOwnPropertyDescriptor(m2, k2);
      if (!desc || ("get" in desc ? !m2.__esModule : desc.writable || desc.configurable)) {
        desc = { enumerable: true, get: function() {
          return m2[k2];
        } };
      }
      Object.defineProperty(o2, k22, desc);
    }) : (function(o2, m2, k2, k22) {
      if (k22 === void 0) k22 = k2;
      o2[k22] = m2[k2];
    }));
    var __setModuleDefault = exports && exports.__setModuleDefault || (Object.create ? (function(o2, v2) {
      Object.defineProperty(o2, "default", { enumerable: true, value: v2 });
    }) : function(o2, v2) {
      o2["default"] = v2;
    });
    var __exportStar = exports && exports.__exportStar || function(m2, exports2) {
      for (var p2 in m2) if (p2 !== "default" && !Object.prototype.hasOwnProperty.call(exports2, p2)) __createBinding(exports2, m2, p2);
    };
    var __importStar = exports && exports.__importStar || /* @__PURE__ */ (function() {
      var ownKeys = function(o2) {
        ownKeys = Object.getOwnPropertyNames || function(o3) {
          var ar2 = [];
          for (var k2 in o3) if (Object.prototype.hasOwnProperty.call(o3, k2)) ar2[ar2.length] = k2;
          return ar2;
        };
        return ownKeys(o2);
      };
      return function(mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) {
          for (var k2 = ownKeys(mod), i2 = 0; i2 < k2.length; i2++) if (k2[i2] !== "default") __createBinding(result, mod, k2[i2]);
        }
        __setModuleDefault(result, mod);
        return result;
      };
    })();
    Object.defineProperty(exports, "__esModule", { value: true });
    exports.models = void 0;
    __exportStar(require_adapters(), exports);
    __exportStar(require_models(), exports);
    exports.models = __importStar(require_models());
  }
});

// node_modules/ulid/stubs/crypto.js
var require_crypto = __commonJS({
  "node_modules/ulid/stubs/crypto.js"() {
  }
});

// node_modules/ulid/dist/index.esm.js
var index_esm_exports = {};
__export(index_esm_exports, {
  decodeTime: () => decodeTime,
  detectPrng: () => detectPrng,
  encodeRandom: () => encodeRandom,
  encodeTime: () => encodeTime,
  factory: () => factory,
  incrementBase32: () => incrementBase32,
  monotonicFactory: () => monotonicFactory,
  randomChar: () => randomChar,
  replaceCharAt: () => replaceCharAt,
  ulid: () => ulid
});
function createError(message) {
  const err2 = new Error(message);
  err2.source = "ulid";
  return err2;
}
function replaceCharAt(str, index, char) {
  if (index > str.length - 1) {
    return str;
  }
  return str.substr(0, index) + char + str.substr(index + 1);
}
function incrementBase32(str) {
  let done = void 0;
  let index = str.length;
  let char;
  let charIndex;
  const maxCharIndex = ENCODING_LEN - 1;
  while (!done && index-- >= 0) {
    char = str[index];
    charIndex = ENCODING.indexOf(char);
    if (charIndex === -1) {
      throw createError("incorrectly encoded string");
    }
    if (charIndex === maxCharIndex) {
      str = replaceCharAt(str, index, ENCODING[0]);
      continue;
    }
    done = replaceCharAt(str, index, ENCODING[charIndex + 1]);
  }
  if (typeof done === "string") {
    return done;
  }
  throw createError("cannot increment this string");
}
function randomChar(prng) {
  let rand = Math.floor(prng() * ENCODING_LEN);
  if (rand === ENCODING_LEN) {
    rand = ENCODING_LEN - 1;
  }
  return ENCODING.charAt(rand);
}
function encodeTime(now, len) {
  if (isNaN(now)) {
    throw new Error(now + " must be a number");
  }
  if (now > TIME_MAX) {
    throw createError("cannot encode time greater than " + TIME_MAX);
  }
  if (now < 0) {
    throw createError("time must be positive");
  }
  if (Number.isInteger(Number(now)) === false) {
    throw createError("time must be an integer");
  }
  let mod;
  let str = "";
  for (; len > 0; len--) {
    mod = now % ENCODING_LEN;
    str = ENCODING.charAt(mod) + str;
    now = (now - mod) / ENCODING_LEN;
  }
  return str;
}
function encodeRandom(len, prng) {
  let str = "";
  for (; len > 0; len--) {
    str = randomChar(prng) + str;
  }
  return str;
}
function decodeTime(id) {
  if (id.length !== TIME_LEN + RANDOM_LEN) {
    throw createError("malformed ulid");
  }
  var time = id.substr(0, TIME_LEN).split("").reverse().reduce((carry, char, index) => {
    const encodingIndex = ENCODING.indexOf(char);
    if (encodingIndex === -1) {
      throw createError("invalid character found: " + char);
    }
    return carry += encodingIndex * Math.pow(ENCODING_LEN, index);
  }, 0);
  if (time > TIME_MAX) {
    throw createError("malformed ulid, timestamp too large");
  }
  return time;
}
function detectPrng(allowInsecure = false, root) {
  if (!root) {
    root = typeof window !== "undefined" ? window : null;
  }
  const browserCrypto = root && (root.crypto || root.msCrypto);
  if (browserCrypto) {
    return () => {
      const buffer = new Uint8Array(1);
      browserCrypto.getRandomValues(buffer);
      return buffer[0] / 255;
    };
  } else {
    try {
      const nodeCrypto = require_crypto();
      return () => nodeCrypto.randomBytes(1).readUInt8() / 255;
    } catch (e2) {
    }
  }
  if (allowInsecure) {
    try {
      console.error("secure crypto unusable, falling back to insecure Math.random()!");
    } catch (e2) {
    }
    return () => Math.random();
  }
  throw createError("secure crypto unusable, insecure Math.random not allowed");
}
function factory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  return function ulid2(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    return encodeTime(seedTime, TIME_LEN) + encodeRandom(RANDOM_LEN, currPrng);
  };
}
function monotonicFactory(currPrng) {
  if (!currPrng) {
    currPrng = detectPrng();
  }
  let lastTime = 0;
  let lastRandom;
  return function ulid2(seedTime) {
    if (isNaN(seedTime)) {
      seedTime = Date.now();
    }
    if (seedTime <= lastTime) {
      const incrementedRandom = lastRandom = incrementBase32(lastRandom);
      return encodeTime(lastTime, TIME_LEN) + incrementedRandom;
    }
    lastTime = seedTime;
    const newRandom = lastRandom = encodeRandom(RANDOM_LEN, currPrng);
    return encodeTime(seedTime, TIME_LEN) + newRandom;
  };
}
var ENCODING, ENCODING_LEN, TIME_MAX, TIME_LEN, RANDOM_LEN, ulid;
var init_index_esm = __esm({
  "node_modules/ulid/dist/index.esm.js"() {
    ENCODING = "0123456789ABCDEFGHJKMNPQRSTVWXYZ";
    ENCODING_LEN = ENCODING.length;
    TIME_MAX = Math.pow(2, 48) - 1;
    TIME_LEN = 10;
    RANDOM_LEN = 16;
    ulid = factory();
  }
});

// node_modules/inngest/helpers/consts.js
var queryKeys = /* @__PURE__ */ (function(queryKeys$1) {
  queryKeys$1["DeployId"] = "deployId";
  queryKeys$1["FnId"] = "fnId";
  queryKeys$1["Probe"] = "probe";
  queryKeys$1["StepId"] = "stepId";
  return queryKeys$1;
})({});
var probe = /* @__PURE__ */ (function(probe$1) {
  probe$1["Trust"] = "trust";
  return probe$1;
})({});
var envKeys = /* @__PURE__ */ (function(envKeys$1) {
  envKeys$1["InngestSigningKey"] = "INNGEST_SIGNING_KEY";
  envKeys$1["InngestSigningKeyFallback"] = "INNGEST_SIGNING_KEY_FALLBACK";
  envKeys$1["InngestEventKey"] = "INNGEST_EVENT_KEY";
  envKeys$1["InngestDevServerUrl"] = "INNGEST_DEVSERVER_URL";
  envKeys$1["InngestEnvironment"] = "INNGEST_ENV";
  envKeys$1["InngestBaseUrl"] = "INNGEST_BASE_URL";
  envKeys$1["InngestEventApiBaseUrl"] = "INNGEST_EVENT_API_BASE_URL";
  envKeys$1["InngestApiBaseUrl"] = "INNGEST_API_BASE_URL";
  envKeys$1["InngestServeHost"] = "INNGEST_SERVE_HOST";
  envKeys$1["InngestServePath"] = "INNGEST_SERVE_PATH";
  envKeys$1["InngestServeOrigin"] = "INNGEST_SERVE_ORIGIN";
  envKeys$1["InngestStreaming"] = "INNGEST_STREAMING";
  envKeys$1["InngestDevMode"] = "INNGEST_DEV";
  envKeys$1["InngestAllowInBandSync"] = "INNGEST_ALLOW_IN_BAND_SYNC";
  envKeys$1["InngestEnableUnauthedSync"] = "INNGEST_ENABLE_UNAUTHED_SYNC";
  envKeys$1["InngestConnectMaxWorkerConcurrency"] = "INNGEST_CONNECT_MAX_WORKER_CONCURRENCY";
  envKeys$1["InngestConnectIsolateExecution"] = "INNGEST_CONNECT_ISOLATE_EXECUTION";
  envKeys$1["InngestConnectGatewayUrl"] = "INNGEST_CONNECT_GATEWAY_URL";
  envKeys$1["BranchName"] = "BRANCH_NAME";
  envKeys$1["VercelBranch"] = "VERCEL_GIT_COMMIT_REF";
  envKeys$1["IsVercel"] = "VERCEL";
  envKeys$1["CloudflarePagesBranch"] = "CF_PAGES_BRANCH";
  envKeys$1["IsCloudflarePages"] = "CF_PAGES";
  envKeys$1["NetlifyBranch"] = "BRANCH";
  envKeys$1["IsNetlify"] = "NETLIFY";
  envKeys$1["RenderBranch"] = "RENDER_GIT_BRANCH";
  envKeys$1["IsRender"] = "RENDER";
  envKeys$1["RailwayBranch"] = "RAILWAY_GIT_BRANCH";
  envKeys$1["RailwayEnvironment"] = "RAILWAY_ENVIRONMENT";
  envKeys$1["VercelEnvKey"] = "VERCEL_ENV";
  envKeys$1["NodeEnv"] = "NODE_ENV";
  envKeys$1["Context"] = "CONTEXT";
  envKeys$1["Environment"] = "ENVIRONMENT";
  envKeys$1["DenoDeployment"] = "DENO_DEPLOYMENT_ID";
  envKeys$1["OpenAiApiKey"] = "OPENAI_API_KEY";
  envKeys$1["GeminiApiKey"] = "GEMINI_API_KEY";
  envKeys$1["AnthropicApiKey"] = "ANTHROPIC_API_KEY";
  envKeys$1["ReactAppInngestBaseUrl"] = "REACT_APP_INNGEST_BASE_URL";
  envKeys$1["ReactAppInngestDevMode"] = "REACT_APP_INNGEST_DEV";
  envKeys$1["NextPublicInngestBaseUrl"] = "NEXT_PUBLIC_INNGEST_BASE_URL";
  envKeys$1["NextPublicInngestDevMode"] = "NEXT_PUBLIC_INNGEST_DEV";
  return envKeys$1;
})({});
var headerKeys = /* @__PURE__ */ (function(headerKeys$1) {
  headerKeys$1["ContentType"] = "content-type";
  headerKeys$1["Host"] = "host";
  headerKeys$1["ForwardedFor"] = "x-forwarded-for";
  headerKeys$1["RealIp"] = "x-real-ip";
  headerKeys$1["Location"] = "location";
  headerKeys$1["ContentLength"] = "content-length";
  headerKeys$1["Signature"] = "x-inngest-signature";
  headerKeys$1["SdkVersion"] = "x-inngest-sdk";
  headerKeys$1["Environment"] = "x-inngest-env";
  headerKeys$1["Platform"] = "x-inngest-platform";
  headerKeys$1["Framework"] = "x-inngest-framework";
  headerKeys$1["NoRetry"] = "x-inngest-no-retry";
  headerKeys$1["RequestId"] = "x-request-id";
  headerKeys$1["GenerationId"] = "x-inngest-generation-id";
  headerKeys$1["InngestJobId"] = "x-inngest-job-id";
  headerKeys$1["RequestVersion"] = "x-inngest-req-version";
  headerKeys$1["RetryAfter"] = "retry-after";
  headerKeys$1["InngestServerKind"] = "x-inngest-server-kind";
  headerKeys$1["InngestExpectedServerKind"] = "x-inngest-expected-server-kind";
  headerKeys$1["InngestSyncKind"] = "x-inngest-sync-kind";
  headerKeys$1["EventIdSeed"] = "x-inngest-event-id-seed";
  headerKeys$1["TraceParent"] = "traceparent";
  headerKeys$1["TraceState"] = "tracestate";
  headerKeys$1["InngestRunId"] = "x-run-id";
  headerKeys$1["InngestStepId"] = "x-inngest-step-id";
  headerKeys$1["InngestForceStepPlan"] = "x-inngest-force-step-plan";
  headerKeys$1["SdkHandled"] = "x-inngest-sdk-handled";
  return headerKeys$1;
})({});
var forwardedHeaders = [headerKeys.TraceParent, headerKeys.TraceState];
var defaultInngestApiBaseUrl = "https://api.inngest.com/";
var defaultInngestEventBaseUrl = "https://inn.gs/";
var defaultDevServerHost = "http://localhost:8288/";
var internalEvents = /* @__PURE__ */ (function(internalEvents$1) {
  internalEvents$1["FunctionFailed"] = "inngest/function.failed";
  internalEvents$1["FunctionInvoked"] = "inngest/function.invoked";
  internalEvents$1["FunctionFinished"] = "inngest/function.finished";
  internalEvents$1["FunctionCancelled"] = "inngest/function.cancelled";
  internalEvents$1["ScheduledTimer"] = "inngest/scheduled.timer";
  internalEvents$1["HttpRequest"] = "inngest/http.request";
  internalEvents$1["DeferredSchedule"] = "inngest/deferred.schedule";
  return internalEvents$1;
})({});
var logPrefix = "[Inngest]";
var debugPrefix = "inngest";
var dummyEventKey = "NO_EVENT_KEY_SET";
var syncKind = /* @__PURE__ */ (function(syncKind$1) {
  syncKind$1["InBand"] = "in_band";
  syncKind$1["OutOfBand"] = "out_of_band";
  return syncKind$1;
})({});
var ExecutionVersion = /* @__PURE__ */ (function(ExecutionVersion$1) {
  ExecutionVersion$1[ExecutionVersion$1["V1"] = 1] = "V1";
  ExecutionVersion$1[ExecutionVersion$1["V2"] = 2] = "V2";
  return ExecutionVersion$1;
})({});
var defaultMaxRetries = 3;

// node_modules/inngest/helpers/enum.js
var enumFromValue = (enumType2, value) => {
  if (Object.values(enumType2).includes(value)) return value;
};

// node_modules/inngest/version.js
var version = "4.7.0";

// node_modules/inngest/_virtual/rolldown_runtime.js
var __require2 = /* @__PURE__ */ ((x2) => typeof __require !== "undefined" ? __require : typeof Proxy !== "undefined" ? new Proxy(x2, { get: (a2, b2) => (typeof __require !== "undefined" ? __require : a2)[b2] }) : x2)(function(x2) {
  if (typeof __require !== "undefined") return __require.apply(this, arguments);
  throw Error('Calling `require` for "' + x2 + "\" in an environment that doesn't expose the `require` function.");
});

// node_modules/inngest/helpers/env.js
function checkModeConfiguration({ internalLogger, mode, signingKey }) {
  if (mode === "cloud" && !signingKey) {
    internalLogger.error(`In cloud mode but no signing key found. For local dev, set the INNGEST_DEV=1 env var. For production, set the ${envKeys.InngestSigningKey} env var`);
    return false;
  }
  return true;
}
var normalizeUrl = (urlString, scheme = "http://") => {
  if (urlString === "undefined") throw new Error("URL undefined");
  if (urlString.includes("://")) return urlString;
  return `${scheme}${urlString}`;
};
var getEnvironmentName = (env = getProcessEnv()) => {
  return env[envKeys.InngestEnvironment] || env[envKeys.BranchName] || env[envKeys.VercelBranch] || env[envKeys.NetlifyBranch] || env[envKeys.CloudflarePagesBranch] || env[envKeys.RenderBranch] || env[envKeys.RailwayBranch];
};
function getProcessEnv() {
  const env = {};
  const whitelist = Object.values(envKeys);
  for (const [k2, v2] of Object.entries(allProcessEnv())) {
    if (!whitelist.includes(k2)) continue;
    env[k2] = v2;
  }
  return protectEnv(env);
}
function protectEnv(env) {
  return {
    ...env,
    toJSON: () => {
      return {};
    }
  };
}
var allProcessEnv = () => {
  try {
    if (process.env) return process.env;
  } catch (_err) {
  }
  try {
    const env = Deno.env.toObject();
    if (env) return env;
  } catch (_err) {
  }
  try {
    const env = Netlify.env.toObject();
    if (env) return env;
  } catch (_err) {
  }
  return {};
};
var inngestHeaders = (opts) => {
  const sdkVersion = `inngest-js:v${version}`;
  const headers = {
    "Content-Type": "application/json",
    "User-Agent": sdkVersion,
    [headerKeys.SdkVersion]: sdkVersion,
    [headerKeys.SdkHandled]: "true"
  };
  if (opts?.framework) headers[headerKeys.Framework] = opts.framework;
  if (opts?.expectedServerKind) headers[headerKeys.InngestExpectedServerKind] = opts.expectedServerKind;
  const env = {
    ...getProcessEnv(),
    ...opts?.env
  };
  const inngestEnv = opts?.inngestEnv || getEnvironmentName(env);
  if (inngestEnv) headers[headerKeys.Environment] = inngestEnv;
  const platform = getPlatformName(env);
  if (platform) headers[headerKeys.Platform] = platform;
  return {
    ...headers,
    ...opts?.client?.["headers"],
    ...opts?.extras
  };
};
var platformChecks = {
  vercel: (env) => env[envKeys.IsVercel] === "1" || typeof EdgeRuntime === "string",
  netlify: (env) => env[envKeys.IsNetlify] === "true",
  "cloudflare-pages": (env) => env[envKeys.IsCloudflarePages] === "1",
  render: (env) => env[envKeys.IsRender] === "true",
  railway: (env) => Boolean(env[envKeys.RailwayEnvironment])
};
var getPlatformName = (env) => {
  return Object.keys(platformChecks).find((key) => {
    return platformChecks[key](env);
  });
};
var CUSTOM_FETCH_MARKER = /* @__PURE__ */ Symbol("Custom fetch implementation");
var getFetch = (logger, givenFetch) => {
  if (givenFetch) {
    if (CUSTOM_FETCH_MARKER in givenFetch) return givenFetch;
    const customFetch = async (...args) => {
      try {
        return await givenFetch(...args);
      } catch (err2) {
        if (!(err2 instanceof Error) || !err2.message?.startsWith("fetch failed")) logger.error({ err: err2 }, "A request failed when using a custom fetch implementation; this may be a misconfiguration. Make sure that your fetch client is correctly bound to the global scope.");
        throw err2;
      }
    };
    Object.defineProperties(customFetch, {
      [CUSTOM_FETCH_MARKER]: {},
      name: { value: givenFetch.name },
      length: { value: givenFetch.length }
    });
    return customFetch;
  }
  try {
    if (typeof globalThis !== "undefined" && "fetch" in globalThis) return fetch.bind(globalThis);
  } catch (_err) {
  }
  if (typeof fetch !== "undefined") return fetch;
  return __require2("cross-fetch");
};
var parseAsBoolean = (value) => {
  if (typeof value === "boolean") return value;
  if (typeof value === "number") return Boolean(value);
  if (typeof value === "string") {
    const trimmed = value.trim().toLowerCase();
    if (trimmed === "undefined") return;
    if (["true", "1"].includes(trimmed)) return true;
    if (["false", "0"].includes(trimmed)) return false;
  }
};

// node_modules/inngest/components/NonRetriableError.js
var NonRetriableError = class extends Error {
  /**
  * The underlying cause of the error, if any.
  *
  * This will be serialized and sent to Inngest.
  */
  cause;
  constructor(message, options) {
    super(message);
    this.cause = options?.cause;
    this.name = "NonRetriableError";
  }
};

// node_modules/zod/v3/external.js
var external_exports = {};
__export(external_exports, {
  BRAND: () => BRAND,
  DIRTY: () => DIRTY,
  EMPTY_PATH: () => EMPTY_PATH,
  INVALID: () => INVALID,
  NEVER: () => NEVER,
  OK: () => OK,
  ParseStatus: () => ParseStatus,
  Schema: () => ZodType,
  ZodAny: () => ZodAny,
  ZodArray: () => ZodArray,
  ZodBigInt: () => ZodBigInt,
  ZodBoolean: () => ZodBoolean,
  ZodBranded: () => ZodBranded,
  ZodCatch: () => ZodCatch,
  ZodDate: () => ZodDate,
  ZodDefault: () => ZodDefault,
  ZodDiscriminatedUnion: () => ZodDiscriminatedUnion,
  ZodEffects: () => ZodEffects,
  ZodEnum: () => ZodEnum,
  ZodError: () => ZodError,
  ZodFirstPartyTypeKind: () => ZodFirstPartyTypeKind,
  ZodFunction: () => ZodFunction,
  ZodIntersection: () => ZodIntersection,
  ZodIssueCode: () => ZodIssueCode,
  ZodLazy: () => ZodLazy,
  ZodLiteral: () => ZodLiteral,
  ZodMap: () => ZodMap,
  ZodNaN: () => ZodNaN,
  ZodNativeEnum: () => ZodNativeEnum,
  ZodNever: () => ZodNever,
  ZodNull: () => ZodNull,
  ZodNullable: () => ZodNullable,
  ZodNumber: () => ZodNumber,
  ZodObject: () => ZodObject,
  ZodOptional: () => ZodOptional,
  ZodParsedType: () => ZodParsedType,
  ZodPipeline: () => ZodPipeline,
  ZodPromise: () => ZodPromise,
  ZodReadonly: () => ZodReadonly,
  ZodRecord: () => ZodRecord,
  ZodSchema: () => ZodType,
  ZodSet: () => ZodSet,
  ZodString: () => ZodString,
  ZodSymbol: () => ZodSymbol,
  ZodTransformer: () => ZodEffects,
  ZodTuple: () => ZodTuple,
  ZodType: () => ZodType,
  ZodUndefined: () => ZodUndefined,
  ZodUnion: () => ZodUnion,
  ZodUnknown: () => ZodUnknown,
  ZodVoid: () => ZodVoid,
  addIssueToContext: () => addIssueToContext,
  any: () => anyType,
  array: () => arrayType,
  bigint: () => bigIntType,
  boolean: () => booleanType,
  coerce: () => coerce,
  custom: () => custom,
  date: () => dateType,
  datetimeRegex: () => datetimeRegex,
  defaultErrorMap: () => en_default,
  discriminatedUnion: () => discriminatedUnionType,
  effect: () => effectsType,
  enum: () => enumType,
  function: () => functionType,
  getErrorMap: () => getErrorMap,
  getParsedType: () => getParsedType,
  instanceof: () => instanceOfType,
  intersection: () => intersectionType,
  isAborted: () => isAborted,
  isAsync: () => isAsync,
  isDirty: () => isDirty,
  isValid: () => isValid,
  late: () => late,
  lazy: () => lazyType,
  literal: () => literalType,
  makeIssue: () => makeIssue,
  map: () => mapType,
  nan: () => nanType,
  nativeEnum: () => nativeEnumType,
  never: () => neverType,
  null: () => nullType,
  nullable: () => nullableType,
  number: () => numberType,
  object: () => objectType,
  objectUtil: () => objectUtil,
  oboolean: () => oboolean,
  onumber: () => onumber,
  optional: () => optionalType,
  ostring: () => ostring,
  pipeline: () => pipelineType,
  preprocess: () => preprocessType,
  promise: () => promiseType,
  quotelessJson: () => quotelessJson,
  record: () => recordType,
  set: () => setType,
  setErrorMap: () => setErrorMap,
  strictObject: () => strictObjectType,
  string: () => stringType,
  symbol: () => symbolType,
  transformer: () => effectsType,
  tuple: () => tupleType,
  undefined: () => undefinedType,
  union: () => unionType,
  unknown: () => unknownType,
  util: () => util,
  void: () => voidType
});

// node_modules/zod/v3/helpers/util.js
var util;
(function(util2) {
  util2.assertEqual = (_2) => {
  };
  function assertIs(_arg) {
  }
  util2.assertIs = assertIs;
  function assertNever(_x) {
    throw new Error();
  }
  util2.assertNever = assertNever;
  util2.arrayToEnum = (items) => {
    const obj = {};
    for (const item of items) {
      obj[item] = item;
    }
    return obj;
  };
  util2.getValidEnumValues = (obj) => {
    const validKeys = util2.objectKeys(obj).filter((k2) => typeof obj[obj[k2]] !== "number");
    const filtered = {};
    for (const k2 of validKeys) {
      filtered[k2] = obj[k2];
    }
    return util2.objectValues(filtered);
  };
  util2.objectValues = (obj) => {
    return util2.objectKeys(obj).map(function(e2) {
      return obj[e2];
    });
  };
  util2.objectKeys = typeof Object.keys === "function" ? (obj) => Object.keys(obj) : (object) => {
    const keys = [];
    for (const key in object) {
      if (Object.prototype.hasOwnProperty.call(object, key)) {
        keys.push(key);
      }
    }
    return keys;
  };
  util2.find = (arr, checker) => {
    for (const item of arr) {
      if (checker(item))
        return item;
    }
    return void 0;
  };
  util2.isInteger = typeof Number.isInteger === "function" ? (val) => Number.isInteger(val) : (val) => typeof val === "number" && Number.isFinite(val) && Math.floor(val) === val;
  function joinValues(array, separator = " | ") {
    return array.map((val) => typeof val === "string" ? `'${val}'` : val).join(separator);
  }
  util2.joinValues = joinValues;
  util2.jsonStringifyReplacer = (_2, value) => {
    if (typeof value === "bigint") {
      return value.toString();
    }
    return value;
  };
})(util || (util = {}));
var objectUtil;
(function(objectUtil2) {
  objectUtil2.mergeShapes = (first, second2) => {
    return {
      ...first,
      ...second2
      // second overwrites first
    };
  };
})(objectUtil || (objectUtil = {}));
var ZodParsedType = util.arrayToEnum([
  "string",
  "nan",
  "number",
  "integer",
  "float",
  "boolean",
  "date",
  "bigint",
  "symbol",
  "function",
  "undefined",
  "null",
  "array",
  "object",
  "unknown",
  "promise",
  "void",
  "never",
  "map",
  "set"
]);
var getParsedType = (data) => {
  const t2 = typeof data;
  switch (t2) {
    case "undefined":
      return ZodParsedType.undefined;
    case "string":
      return ZodParsedType.string;
    case "number":
      return Number.isNaN(data) ? ZodParsedType.nan : ZodParsedType.number;
    case "boolean":
      return ZodParsedType.boolean;
    case "function":
      return ZodParsedType.function;
    case "bigint":
      return ZodParsedType.bigint;
    case "symbol":
      return ZodParsedType.symbol;
    case "object":
      if (Array.isArray(data)) {
        return ZodParsedType.array;
      }
      if (data === null) {
        return ZodParsedType.null;
      }
      if (data.then && typeof data.then === "function" && data.catch && typeof data.catch === "function") {
        return ZodParsedType.promise;
      }
      if (typeof Map !== "undefined" && data instanceof Map) {
        return ZodParsedType.map;
      }
      if (typeof Set !== "undefined" && data instanceof Set) {
        return ZodParsedType.set;
      }
      if (typeof Date !== "undefined" && data instanceof Date) {
        return ZodParsedType.date;
      }
      return ZodParsedType.object;
    default:
      return ZodParsedType.unknown;
  }
};

// node_modules/zod/v3/ZodError.js
var ZodIssueCode = util.arrayToEnum([
  "invalid_type",
  "invalid_literal",
  "custom",
  "invalid_union",
  "invalid_union_discriminator",
  "invalid_enum_value",
  "unrecognized_keys",
  "invalid_arguments",
  "invalid_return_type",
  "invalid_date",
  "invalid_string",
  "too_small",
  "too_big",
  "invalid_intersection_types",
  "not_multiple_of",
  "not_finite"
]);
var quotelessJson = (obj) => {
  const json = JSON.stringify(obj, null, 2);
  return json.replace(/"([^"]+)":/g, "$1:");
};
var ZodError = class _ZodError extends Error {
  get errors() {
    return this.issues;
  }
  constructor(issues) {
    super();
    this.issues = [];
    this.addIssue = (sub) => {
      this.issues = [...this.issues, sub];
    };
    this.addIssues = (subs = []) => {
      this.issues = [...this.issues, ...subs];
    };
    const actualProto = new.target.prototype;
    if (Object.setPrototypeOf) {
      Object.setPrototypeOf(this, actualProto);
    } else {
      this.__proto__ = actualProto;
    }
    this.name = "ZodError";
    this.issues = issues;
  }
  format(_mapper) {
    const mapper = _mapper || function(issue) {
      return issue.message;
    };
    const fieldErrors = { _errors: [] };
    const processError = (error) => {
      for (const issue of error.issues) {
        if (issue.code === "invalid_union") {
          issue.unionErrors.map(processError);
        } else if (issue.code === "invalid_return_type") {
          processError(issue.returnTypeError);
        } else if (issue.code === "invalid_arguments") {
          processError(issue.argumentsError);
        } else if (issue.path.length === 0) {
          fieldErrors._errors.push(mapper(issue));
        } else {
          let curr = fieldErrors;
          let i2 = 0;
          while (i2 < issue.path.length) {
            const el = issue.path[i2];
            const terminal = i2 === issue.path.length - 1;
            if (!terminal) {
              curr[el] = curr[el] || { _errors: [] };
            } else {
              curr[el] = curr[el] || { _errors: [] };
              curr[el]._errors.push(mapper(issue));
            }
            curr = curr[el];
            i2++;
          }
        }
      }
    };
    processError(this);
    return fieldErrors;
  }
  static assert(value) {
    if (!(value instanceof _ZodError)) {
      throw new Error(`Not a ZodError: ${value}`);
    }
  }
  toString() {
    return this.message;
  }
  get message() {
    return JSON.stringify(this.issues, util.jsonStringifyReplacer, 2);
  }
  get isEmpty() {
    return this.issues.length === 0;
  }
  flatten(mapper = (issue) => issue.message) {
    const fieldErrors = {};
    const formErrors = [];
    for (const sub of this.issues) {
      if (sub.path.length > 0) {
        const firstEl = sub.path[0];
        fieldErrors[firstEl] = fieldErrors[firstEl] || [];
        fieldErrors[firstEl].push(mapper(sub));
      } else {
        formErrors.push(mapper(sub));
      }
    }
    return { formErrors, fieldErrors };
  }
  get formErrors() {
    return this.flatten();
  }
};
ZodError.create = (issues) => {
  const error = new ZodError(issues);
  return error;
};

// node_modules/zod/v3/locales/en.js
var errorMap = (issue, _ctx) => {
  let message;
  switch (issue.code) {
    case ZodIssueCode.invalid_type:
      if (issue.received === ZodParsedType.undefined) {
        message = "Required";
      } else {
        message = `Expected ${issue.expected}, received ${issue.received}`;
      }
      break;
    case ZodIssueCode.invalid_literal:
      message = `Invalid literal value, expected ${JSON.stringify(issue.expected, util.jsonStringifyReplacer)}`;
      break;
    case ZodIssueCode.unrecognized_keys:
      message = `Unrecognized key(s) in object: ${util.joinValues(issue.keys, ", ")}`;
      break;
    case ZodIssueCode.invalid_union:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_union_discriminator:
      message = `Invalid discriminator value. Expected ${util.joinValues(issue.options)}`;
      break;
    case ZodIssueCode.invalid_enum_value:
      message = `Invalid enum value. Expected ${util.joinValues(issue.options)}, received '${issue.received}'`;
      break;
    case ZodIssueCode.invalid_arguments:
      message = `Invalid function arguments`;
      break;
    case ZodIssueCode.invalid_return_type:
      message = `Invalid function return type`;
      break;
    case ZodIssueCode.invalid_date:
      message = `Invalid date`;
      break;
    case ZodIssueCode.invalid_string:
      if (typeof issue.validation === "object") {
        if ("includes" in issue.validation) {
          message = `Invalid input: must include "${issue.validation.includes}"`;
          if (typeof issue.validation.position === "number") {
            message = `${message} at one or more positions greater than or equal to ${issue.validation.position}`;
          }
        } else if ("startsWith" in issue.validation) {
          message = `Invalid input: must start with "${issue.validation.startsWith}"`;
        } else if ("endsWith" in issue.validation) {
          message = `Invalid input: must end with "${issue.validation.endsWith}"`;
        } else {
          util.assertNever(issue.validation);
        }
      } else if (issue.validation !== "regex") {
        message = `Invalid ${issue.validation}`;
      } else {
        message = "Invalid";
      }
      break;
    case ZodIssueCode.too_small:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `more than`} ${issue.minimum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? "exactly" : issue.inclusive ? `at least` : `over`} ${issue.minimum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "bigint")
        message = `Number must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${issue.minimum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly equal to ` : issue.inclusive ? `greater than or equal to ` : `greater than `}${new Date(Number(issue.minimum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.too_big:
      if (issue.type === "array")
        message = `Array must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `less than`} ${issue.maximum} element(s)`;
      else if (issue.type === "string")
        message = `String must contain ${issue.exact ? `exactly` : issue.inclusive ? `at most` : `under`} ${issue.maximum} character(s)`;
      else if (issue.type === "number")
        message = `Number must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "bigint")
        message = `BigInt must be ${issue.exact ? `exactly` : issue.inclusive ? `less than or equal to` : `less than`} ${issue.maximum}`;
      else if (issue.type === "date")
        message = `Date must be ${issue.exact ? `exactly` : issue.inclusive ? `smaller than or equal to` : `smaller than`} ${new Date(Number(issue.maximum))}`;
      else
        message = "Invalid input";
      break;
    case ZodIssueCode.custom:
      message = `Invalid input`;
      break;
    case ZodIssueCode.invalid_intersection_types:
      message = `Intersection results could not be merged`;
      break;
    case ZodIssueCode.not_multiple_of:
      message = `Number must be a multiple of ${issue.multipleOf}`;
      break;
    case ZodIssueCode.not_finite:
      message = "Number must be finite";
      break;
    default:
      message = _ctx.defaultError;
      util.assertNever(issue);
  }
  return { message };
};
var en_default = errorMap;

// node_modules/zod/v3/errors.js
var overrideErrorMap = en_default;
function setErrorMap(map) {
  overrideErrorMap = map;
}
function getErrorMap() {
  return overrideErrorMap;
}

// node_modules/zod/v3/helpers/parseUtil.js
var makeIssue = (params) => {
  const { data, path, errorMaps, issueData } = params;
  const fullPath = [...path, ...issueData.path || []];
  const fullIssue = {
    ...issueData,
    path: fullPath
  };
  if (issueData.message !== void 0) {
    return {
      ...issueData,
      path: fullPath,
      message: issueData.message
    };
  }
  let errorMessage2 = "";
  const maps = errorMaps.filter((m2) => !!m2).slice().reverse();
  for (const map of maps) {
    errorMessage2 = map(fullIssue, { data, defaultError: errorMessage2 }).message;
  }
  return {
    ...issueData,
    path: fullPath,
    message: errorMessage2
  };
};
var EMPTY_PATH = [];
function addIssueToContext(ctx, issueData) {
  const overrideMap = getErrorMap();
  const issue = makeIssue({
    issueData,
    data: ctx.data,
    path: ctx.path,
    errorMaps: [
      ctx.common.contextualErrorMap,
      // contextual error map is first priority
      ctx.schemaErrorMap,
      // then schema-bound map if available
      overrideMap,
      // then global override map
      overrideMap === en_default ? void 0 : en_default
      // then global default map
    ].filter((x2) => !!x2)
  });
  ctx.common.issues.push(issue);
}
var ParseStatus = class _ParseStatus {
  constructor() {
    this.value = "valid";
  }
  dirty() {
    if (this.value === "valid")
      this.value = "dirty";
  }
  abort() {
    if (this.value !== "aborted")
      this.value = "aborted";
  }
  static mergeArray(status, results) {
    const arrayValue = [];
    for (const s2 of results) {
      if (s2.status === "aborted")
        return INVALID;
      if (s2.status === "dirty")
        status.dirty();
      arrayValue.push(s2.value);
    }
    return { status: status.value, value: arrayValue };
  }
  static async mergeObjectAsync(status, pairs) {
    const syncPairs = [];
    for (const pair of pairs) {
      const key = await pair.key;
      const value = await pair.value;
      syncPairs.push({
        key,
        value
      });
    }
    return _ParseStatus.mergeObjectSync(status, syncPairs);
  }
  static mergeObjectSync(status, pairs) {
    const finalObject = {};
    for (const pair of pairs) {
      const { key, value } = pair;
      if (key.status === "aborted")
        return INVALID;
      if (value.status === "aborted")
        return INVALID;
      if (key.status === "dirty")
        status.dirty();
      if (value.status === "dirty")
        status.dirty();
      if (key.value !== "__proto__" && (typeof value.value !== "undefined" || pair.alwaysSet)) {
        finalObject[key.value] = value.value;
      }
    }
    return { status: status.value, value: finalObject };
  }
};
var INVALID = Object.freeze({
  status: "aborted"
});
var DIRTY = (value) => ({ status: "dirty", value });
var OK = (value) => ({ status: "valid", value });
var isAborted = (x2) => x2.status === "aborted";
var isDirty = (x2) => x2.status === "dirty";
var isValid = (x2) => x2.status === "valid";
var isAsync = (x2) => typeof Promise !== "undefined" && x2 instanceof Promise;

// node_modules/zod/v3/helpers/errorUtil.js
var errorUtil;
(function(errorUtil2) {
  errorUtil2.errToObj = (message) => typeof message === "string" ? { message } : message || {};
  errorUtil2.toString = (message) => typeof message === "string" ? message : message?.message;
})(errorUtil || (errorUtil = {}));

// node_modules/zod/v3/types.js
var ParseInputLazyPath = class {
  constructor(parent, value, path, key) {
    this._cachedPath = [];
    this.parent = parent;
    this.data = value;
    this._path = path;
    this._key = key;
  }
  get path() {
    if (!this._cachedPath.length) {
      if (Array.isArray(this._key)) {
        this._cachedPath.push(...this._path, ...this._key);
      } else {
        this._cachedPath.push(...this._path, this._key);
      }
    }
    return this._cachedPath;
  }
};
var handleResult = (ctx, result) => {
  if (isValid(result)) {
    return { success: true, data: result.value };
  } else {
    if (!ctx.common.issues.length) {
      throw new Error("Validation failed but no issues detected.");
    }
    return {
      success: false,
      get error() {
        if (this._error)
          return this._error;
        const error = new ZodError(ctx.common.issues);
        this._error = error;
        return this._error;
      }
    };
  }
};
function processCreateParams(params) {
  if (!params)
    return {};
  const { errorMap: errorMap2, invalid_type_error, required_error, description } = params;
  if (errorMap2 && (invalid_type_error || required_error)) {
    throw new Error(`Can't use "invalid_type_error" or "required_error" in conjunction with custom error map.`);
  }
  if (errorMap2)
    return { errorMap: errorMap2, description };
  const customMap = (iss, ctx) => {
    const { message } = params;
    if (iss.code === "invalid_enum_value") {
      return { message: message ?? ctx.defaultError };
    }
    if (typeof ctx.data === "undefined") {
      return { message: message ?? required_error ?? ctx.defaultError };
    }
    if (iss.code !== "invalid_type")
      return { message: ctx.defaultError };
    return { message: message ?? invalid_type_error ?? ctx.defaultError };
  };
  return { errorMap: customMap, description };
}
var ZodType = class {
  get description() {
    return this._def.description;
  }
  _getType(input) {
    return getParsedType(input.data);
  }
  _getOrReturnCtx(input, ctx) {
    return ctx || {
      common: input.parent.common,
      data: input.data,
      parsedType: getParsedType(input.data),
      schemaErrorMap: this._def.errorMap,
      path: input.path,
      parent: input.parent
    };
  }
  _processInputParams(input) {
    return {
      status: new ParseStatus(),
      ctx: {
        common: input.parent.common,
        data: input.data,
        parsedType: getParsedType(input.data),
        schemaErrorMap: this._def.errorMap,
        path: input.path,
        parent: input.parent
      }
    };
  }
  _parseSync(input) {
    const result = this._parse(input);
    if (isAsync(result)) {
      throw new Error("Synchronous parse encountered promise.");
    }
    return result;
  }
  _parseAsync(input) {
    const result = this._parse(input);
    return Promise.resolve(result);
  }
  parse(data, params) {
    const result = this.safeParse(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  safeParse(data, params) {
    const ctx = {
      common: {
        issues: [],
        async: params?.async ?? false,
        contextualErrorMap: params?.errorMap
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const result = this._parseSync({ data, path: ctx.path, parent: ctx });
    return handleResult(ctx, result);
  }
  "~validate"(data) {
    const ctx = {
      common: {
        issues: [],
        async: !!this["~standard"].async
      },
      path: [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    if (!this["~standard"].async) {
      try {
        const result = this._parseSync({ data, path: [], parent: ctx });
        return isValid(result) ? {
          value: result.value
        } : {
          issues: ctx.common.issues
        };
      } catch (err2) {
        if (err2?.message?.toLowerCase()?.includes("encountered")) {
          this["~standard"].async = true;
        }
        ctx.common = {
          issues: [],
          async: true
        };
      }
    }
    return this._parseAsync({ data, path: [], parent: ctx }).then((result) => isValid(result) ? {
      value: result.value
    } : {
      issues: ctx.common.issues
    });
  }
  async parseAsync(data, params) {
    const result = await this.safeParseAsync(data, params);
    if (result.success)
      return result.data;
    throw result.error;
  }
  async safeParseAsync(data, params) {
    const ctx = {
      common: {
        issues: [],
        contextualErrorMap: params?.errorMap,
        async: true
      },
      path: params?.path || [],
      schemaErrorMap: this._def.errorMap,
      parent: null,
      data,
      parsedType: getParsedType(data)
    };
    const maybeAsyncResult = this._parse({ data, path: ctx.path, parent: ctx });
    const result = await (isAsync(maybeAsyncResult) ? maybeAsyncResult : Promise.resolve(maybeAsyncResult));
    return handleResult(ctx, result);
  }
  refine(check, message) {
    const getIssueProperties = (val) => {
      if (typeof message === "string" || typeof message === "undefined") {
        return { message };
      } else if (typeof message === "function") {
        return message(val);
      } else {
        return message;
      }
    };
    return this._refinement((val, ctx) => {
      const result = check(val);
      const setError = () => ctx.addIssue({
        code: ZodIssueCode.custom,
        ...getIssueProperties(val)
      });
      if (typeof Promise !== "undefined" && result instanceof Promise) {
        return result.then((data) => {
          if (!data) {
            setError();
            return false;
          } else {
            return true;
          }
        });
      }
      if (!result) {
        setError();
        return false;
      } else {
        return true;
      }
    });
  }
  refinement(check, refinementData) {
    return this._refinement((val, ctx) => {
      if (!check(val)) {
        ctx.addIssue(typeof refinementData === "function" ? refinementData(val, ctx) : refinementData);
        return false;
      } else {
        return true;
      }
    });
  }
  _refinement(refinement) {
    return new ZodEffects({
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "refinement", refinement }
    });
  }
  superRefine(refinement) {
    return this._refinement(refinement);
  }
  constructor(def) {
    this.spa = this.safeParseAsync;
    this._def = def;
    this.parse = this.parse.bind(this);
    this.safeParse = this.safeParse.bind(this);
    this.parseAsync = this.parseAsync.bind(this);
    this.safeParseAsync = this.safeParseAsync.bind(this);
    this.spa = this.spa.bind(this);
    this.refine = this.refine.bind(this);
    this.refinement = this.refinement.bind(this);
    this.superRefine = this.superRefine.bind(this);
    this.optional = this.optional.bind(this);
    this.nullable = this.nullable.bind(this);
    this.nullish = this.nullish.bind(this);
    this.array = this.array.bind(this);
    this.promise = this.promise.bind(this);
    this.or = this.or.bind(this);
    this.and = this.and.bind(this);
    this.transform = this.transform.bind(this);
    this.brand = this.brand.bind(this);
    this.default = this.default.bind(this);
    this.catch = this.catch.bind(this);
    this.describe = this.describe.bind(this);
    this.pipe = this.pipe.bind(this);
    this.readonly = this.readonly.bind(this);
    this.isNullable = this.isNullable.bind(this);
    this.isOptional = this.isOptional.bind(this);
    this["~standard"] = {
      version: 1,
      vendor: "zod",
      validate: (data) => this["~validate"](data)
    };
  }
  optional() {
    return ZodOptional.create(this, this._def);
  }
  nullable() {
    return ZodNullable.create(this, this._def);
  }
  nullish() {
    return this.nullable().optional();
  }
  array() {
    return ZodArray.create(this);
  }
  promise() {
    return ZodPromise.create(this, this._def);
  }
  or(option) {
    return ZodUnion.create([this, option], this._def);
  }
  and(incoming) {
    return ZodIntersection.create(this, incoming, this._def);
  }
  transform(transform) {
    return new ZodEffects({
      ...processCreateParams(this._def),
      schema: this,
      typeName: ZodFirstPartyTypeKind.ZodEffects,
      effect: { type: "transform", transform }
    });
  }
  default(def) {
    const defaultValueFunc = typeof def === "function" ? def : () => def;
    return new ZodDefault({
      ...processCreateParams(this._def),
      innerType: this,
      defaultValue: defaultValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodDefault
    });
  }
  brand() {
    return new ZodBranded({
      typeName: ZodFirstPartyTypeKind.ZodBranded,
      type: this,
      ...processCreateParams(this._def)
    });
  }
  catch(def) {
    const catchValueFunc = typeof def === "function" ? def : () => def;
    return new ZodCatch({
      ...processCreateParams(this._def),
      innerType: this,
      catchValue: catchValueFunc,
      typeName: ZodFirstPartyTypeKind.ZodCatch
    });
  }
  describe(description) {
    const This = this.constructor;
    return new This({
      ...this._def,
      description
    });
  }
  pipe(target) {
    return ZodPipeline.create(this, target);
  }
  readonly() {
    return ZodReadonly.create(this);
  }
  isOptional() {
    return this.safeParse(void 0).success;
  }
  isNullable() {
    return this.safeParse(null).success;
  }
};
var cuidRegex = /^c[^\s-]{8,}$/i;
var cuid2Regex = /^[0-9a-z]+$/;
var ulidRegex = /^[0-9A-HJKMNP-TV-Z]{26}$/i;
var uuidRegex = /^[0-9a-fA-F]{8}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{4}\b-[0-9a-fA-F]{12}$/i;
var nanoidRegex = /^[a-z0-9_-]{21}$/i;
var jwtRegex = /^[A-Za-z0-9-_]+\.[A-Za-z0-9-_]+\.[A-Za-z0-9-_]*$/;
var durationRegex = /^[-+]?P(?!$)(?:(?:[-+]?\d+Y)|(?:[-+]?\d+[.,]\d+Y$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:(?:[-+]?\d+W)|(?:[-+]?\d+[.,]\d+W$))?(?:(?:[-+]?\d+D)|(?:[-+]?\d+[.,]\d+D$))?(?:T(?=[\d+-])(?:(?:[-+]?\d+H)|(?:[-+]?\d+[.,]\d+H$))?(?:(?:[-+]?\d+M)|(?:[-+]?\d+[.,]\d+M$))?(?:[-+]?\d+(?:[.,]\d+)?S)?)??$/;
var emailRegex = /^(?!\.)(?!.*\.\.)([A-Z0-9_'+\-\.]*)[A-Z0-9_+-]@([A-Z0-9][A-Z0-9\-]*\.)+[A-Z]{2,}$/i;
var _emojiRegex = `^(\\p{Extended_Pictographic}|\\p{Emoji_Component})+$`;
var emojiRegex;
var ipv4Regex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])$/;
var ipv4CidrRegex = /^(?:(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\.){3}(?:25[0-5]|2[0-4][0-9]|1[0-9][0-9]|[1-9][0-9]|[0-9])\/(3[0-2]|[12]?[0-9])$/;
var ipv6Regex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))$/;
var ipv6CidrRegex = /^(([0-9a-fA-F]{1,4}:){7,7}[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,7}:|([0-9a-fA-F]{1,4}:){1,6}:[0-9a-fA-F]{1,4}|([0-9a-fA-F]{1,4}:){1,5}(:[0-9a-fA-F]{1,4}){1,2}|([0-9a-fA-F]{1,4}:){1,4}(:[0-9a-fA-F]{1,4}){1,3}|([0-9a-fA-F]{1,4}:){1,3}(:[0-9a-fA-F]{1,4}){1,4}|([0-9a-fA-F]{1,4}:){1,2}(:[0-9a-fA-F]{1,4}){1,5}|[0-9a-fA-F]{1,4}:((:[0-9a-fA-F]{1,4}){1,6})|:((:[0-9a-fA-F]{1,4}){1,7}|:)|fe80:(:[0-9a-fA-F]{0,4}){0,4}%[0-9a-zA-Z]{1,}|::(ffff(:0{1,4}){0,1}:){0,1}((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])|([0-9a-fA-F]{1,4}:){1,4}:((25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9])\.){3,3}(25[0-5]|(2[0-4]|1{0,1}[0-9]){0,1}[0-9]))\/(12[0-8]|1[01][0-9]|[1-9]?[0-9])$/;
var base64Regex = /^([0-9a-zA-Z+/]{4})*(([0-9a-zA-Z+/]{2}==)|([0-9a-zA-Z+/]{3}=))?$/;
var base64urlRegex = /^([0-9a-zA-Z-_]{4})*(([0-9a-zA-Z-_]{2}(==)?)|([0-9a-zA-Z-_]{3}(=)?))?$/;
var dateRegexSource = `((\\d\\d[2468][048]|\\d\\d[13579][26]|\\d\\d0[48]|[02468][048]00|[13579][26]00)-02-29|\\d{4}-((0[13578]|1[02])-(0[1-9]|[12]\\d|3[01])|(0[469]|11)-(0[1-9]|[12]\\d|30)|(02)-(0[1-9]|1\\d|2[0-8])))`;
var dateRegex = new RegExp(`^${dateRegexSource}$`);
function timeRegexSource(args) {
  let secondsRegexSource = `[0-5]\\d`;
  if (args.precision) {
    secondsRegexSource = `${secondsRegexSource}\\.\\d{${args.precision}}`;
  } else if (args.precision == null) {
    secondsRegexSource = `${secondsRegexSource}(\\.\\d+)?`;
  }
  const secondsQuantifier = args.precision ? "+" : "?";
  return `([01]\\d|2[0-3]):[0-5]\\d(:${secondsRegexSource})${secondsQuantifier}`;
}
function timeRegex(args) {
  return new RegExp(`^${timeRegexSource(args)}$`);
}
function datetimeRegex(args) {
  let regex = `${dateRegexSource}T${timeRegexSource(args)}`;
  const opts = [];
  opts.push(args.local ? `Z?` : `Z`);
  if (args.offset)
    opts.push(`([+-]\\d{2}:?\\d{2})`);
  regex = `${regex}(${opts.join("|")})`;
  return new RegExp(`^${regex}$`);
}
function isValidIP(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4Regex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6Regex.test(ip)) {
    return true;
  }
  return false;
}
function isValidJWT(jwt, alg) {
  if (!jwtRegex.test(jwt))
    return false;
  try {
    const [header] = jwt.split(".");
    if (!header)
      return false;
    const base64 = header.replace(/-/g, "+").replace(/_/g, "/").padEnd(header.length + (4 - header.length % 4) % 4, "=");
    const decoded = JSON.parse(atob(base64));
    if (typeof decoded !== "object" || decoded === null)
      return false;
    if ("typ" in decoded && decoded?.typ !== "JWT")
      return false;
    if (!decoded.alg)
      return false;
    if (alg && decoded.alg !== alg)
      return false;
    return true;
  } catch {
    return false;
  }
}
function isValidCidr(ip, version2) {
  if ((version2 === "v4" || !version2) && ipv4CidrRegex.test(ip)) {
    return true;
  }
  if ((version2 === "v6" || !version2) && ipv6CidrRegex.test(ip)) {
    return true;
  }
  return false;
}
var ZodString = class _ZodString extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = String(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.string) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.string,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.length < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.length > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "string",
            inclusive: true,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "length") {
        const tooBig = input.data.length > check.value;
        const tooSmall = input.data.length < check.value;
        if (tooBig || tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          if (tooBig) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_big,
              maximum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          } else if (tooSmall) {
            addIssueToContext(ctx, {
              code: ZodIssueCode.too_small,
              minimum: check.value,
              type: "string",
              inclusive: true,
              exact: true,
              message: check.message
            });
          }
          status.dirty();
        }
      } else if (check.kind === "email") {
        if (!emailRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "email",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "emoji") {
        if (!emojiRegex) {
          emojiRegex = new RegExp(_emojiRegex, "u");
        }
        if (!emojiRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "emoji",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "uuid") {
        if (!uuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "uuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "nanoid") {
        if (!nanoidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "nanoid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid") {
        if (!cuidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cuid2") {
        if (!cuid2Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cuid2",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ulid") {
        if (!ulidRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ulid",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "url") {
        try {
          new URL(input.data);
        } catch {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "regex") {
        check.regex.lastIndex = 0;
        const testResult = check.regex.test(input.data);
        if (!testResult) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "regex",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "trim") {
        input.data = input.data.trim();
      } else if (check.kind === "includes") {
        if (!input.data.includes(check.value, check.position)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { includes: check.value, position: check.position },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "toLowerCase") {
        input.data = input.data.toLowerCase();
      } else if (check.kind === "toUpperCase") {
        input.data = input.data.toUpperCase();
      } else if (check.kind === "startsWith") {
        if (!input.data.startsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { startsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "endsWith") {
        if (!input.data.endsWith(check.value)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: { endsWith: check.value },
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "datetime") {
        const regex = datetimeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "datetime",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "date") {
        const regex = dateRegex;
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "date",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "time") {
        const regex = timeRegex(check);
        if (!regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_string,
            validation: "time",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "duration") {
        if (!durationRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "duration",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "ip") {
        if (!isValidIP(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "ip",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "jwt") {
        if (!isValidJWT(input.data, check.alg)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "jwt",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "cidr") {
        if (!isValidCidr(input.data, check.version)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "cidr",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64") {
        if (!base64Regex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "base64url") {
        if (!base64urlRegex.test(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            validation: "base64url",
            code: ZodIssueCode.invalid_string,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _regex(regex, validation, message) {
    return this.refinement((data) => regex.test(data), {
      validation,
      code: ZodIssueCode.invalid_string,
      ...errorUtil.errToObj(message)
    });
  }
  _addCheck(check) {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  email(message) {
    return this._addCheck({ kind: "email", ...errorUtil.errToObj(message) });
  }
  url(message) {
    return this._addCheck({ kind: "url", ...errorUtil.errToObj(message) });
  }
  emoji(message) {
    return this._addCheck({ kind: "emoji", ...errorUtil.errToObj(message) });
  }
  uuid(message) {
    return this._addCheck({ kind: "uuid", ...errorUtil.errToObj(message) });
  }
  nanoid(message) {
    return this._addCheck({ kind: "nanoid", ...errorUtil.errToObj(message) });
  }
  cuid(message) {
    return this._addCheck({ kind: "cuid", ...errorUtil.errToObj(message) });
  }
  cuid2(message) {
    return this._addCheck({ kind: "cuid2", ...errorUtil.errToObj(message) });
  }
  ulid(message) {
    return this._addCheck({ kind: "ulid", ...errorUtil.errToObj(message) });
  }
  base64(message) {
    return this._addCheck({ kind: "base64", ...errorUtil.errToObj(message) });
  }
  base64url(message) {
    return this._addCheck({
      kind: "base64url",
      ...errorUtil.errToObj(message)
    });
  }
  jwt(options) {
    return this._addCheck({ kind: "jwt", ...errorUtil.errToObj(options) });
  }
  ip(options) {
    return this._addCheck({ kind: "ip", ...errorUtil.errToObj(options) });
  }
  cidr(options) {
    return this._addCheck({ kind: "cidr", ...errorUtil.errToObj(options) });
  }
  datetime(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "datetime",
        precision: null,
        offset: false,
        local: false,
        message: options
      });
    }
    return this._addCheck({
      kind: "datetime",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      offset: options?.offset ?? false,
      local: options?.local ?? false,
      ...errorUtil.errToObj(options?.message)
    });
  }
  date(message) {
    return this._addCheck({ kind: "date", message });
  }
  time(options) {
    if (typeof options === "string") {
      return this._addCheck({
        kind: "time",
        precision: null,
        message: options
      });
    }
    return this._addCheck({
      kind: "time",
      precision: typeof options?.precision === "undefined" ? null : options?.precision,
      ...errorUtil.errToObj(options?.message)
    });
  }
  duration(message) {
    return this._addCheck({ kind: "duration", ...errorUtil.errToObj(message) });
  }
  regex(regex, message) {
    return this._addCheck({
      kind: "regex",
      regex,
      ...errorUtil.errToObj(message)
    });
  }
  includes(value, options) {
    return this._addCheck({
      kind: "includes",
      value,
      position: options?.position,
      ...errorUtil.errToObj(options?.message)
    });
  }
  startsWith(value, message) {
    return this._addCheck({
      kind: "startsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  endsWith(value, message) {
    return this._addCheck({
      kind: "endsWith",
      value,
      ...errorUtil.errToObj(message)
    });
  }
  min(minLength, message) {
    return this._addCheck({
      kind: "min",
      value: minLength,
      ...errorUtil.errToObj(message)
    });
  }
  max(maxLength, message) {
    return this._addCheck({
      kind: "max",
      value: maxLength,
      ...errorUtil.errToObj(message)
    });
  }
  length(len, message) {
    return this._addCheck({
      kind: "length",
      value: len,
      ...errorUtil.errToObj(message)
    });
  }
  /**
   * Equivalent to `.min(1)`
   */
  nonempty(message) {
    return this.min(1, errorUtil.errToObj(message));
  }
  trim() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "trim" }]
    });
  }
  toLowerCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toLowerCase" }]
    });
  }
  toUpperCase() {
    return new _ZodString({
      ...this._def,
      checks: [...this._def.checks, { kind: "toUpperCase" }]
    });
  }
  get isDatetime() {
    return !!this._def.checks.find((ch) => ch.kind === "datetime");
  }
  get isDate() {
    return !!this._def.checks.find((ch) => ch.kind === "date");
  }
  get isTime() {
    return !!this._def.checks.find((ch) => ch.kind === "time");
  }
  get isDuration() {
    return !!this._def.checks.find((ch) => ch.kind === "duration");
  }
  get isEmail() {
    return !!this._def.checks.find((ch) => ch.kind === "email");
  }
  get isURL() {
    return !!this._def.checks.find((ch) => ch.kind === "url");
  }
  get isEmoji() {
    return !!this._def.checks.find((ch) => ch.kind === "emoji");
  }
  get isUUID() {
    return !!this._def.checks.find((ch) => ch.kind === "uuid");
  }
  get isNANOID() {
    return !!this._def.checks.find((ch) => ch.kind === "nanoid");
  }
  get isCUID() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid");
  }
  get isCUID2() {
    return !!this._def.checks.find((ch) => ch.kind === "cuid2");
  }
  get isULID() {
    return !!this._def.checks.find((ch) => ch.kind === "ulid");
  }
  get isIP() {
    return !!this._def.checks.find((ch) => ch.kind === "ip");
  }
  get isCIDR() {
    return !!this._def.checks.find((ch) => ch.kind === "cidr");
  }
  get isBase64() {
    return !!this._def.checks.find((ch) => ch.kind === "base64");
  }
  get isBase64url() {
    return !!this._def.checks.find((ch) => ch.kind === "base64url");
  }
  get minLength() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxLength() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodString.create = (params) => {
  return new ZodString({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodString,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
function floatSafeRemainder(val, step2) {
  const valDecCount = (val.toString().split(".")[1] || "").length;
  const stepDecCount = (step2.toString().split(".")[1] || "").length;
  const decCount = valDecCount > stepDecCount ? valDecCount : stepDecCount;
  const valInt = Number.parseInt(val.toFixed(decCount).replace(".", ""));
  const stepInt = Number.parseInt(step2.toFixed(decCount).replace(".", ""));
  return valInt % stepInt / 10 ** decCount;
}
var ZodNumber = class _ZodNumber extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
    this.step = this.multipleOf;
  }
  _parse(input) {
    if (this._def.coerce) {
      input.data = Number(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.number) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.number,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "int") {
        if (!util.isInteger(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.invalid_type,
            expected: "integer",
            received: "float",
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            minimum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            maximum: check.value,
            type: "number",
            inclusive: check.inclusive,
            exact: false,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (floatSafeRemainder(input.data, check.value) !== 0) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "finite") {
        if (!Number.isFinite(input.data)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_finite,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodNumber({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodNumber({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  int(message) {
    return this._addCheck({
      kind: "int",
      message: errorUtil.toString(message)
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: 0,
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  finite(message) {
    return this._addCheck({
      kind: "finite",
      message: errorUtil.toString(message)
    });
  }
  safe(message) {
    return this._addCheck({
      kind: "min",
      inclusive: true,
      value: Number.MIN_SAFE_INTEGER,
      message: errorUtil.toString(message)
    })._addCheck({
      kind: "max",
      inclusive: true,
      value: Number.MAX_SAFE_INTEGER,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
  get isInt() {
    return !!this._def.checks.find((ch) => ch.kind === "int" || ch.kind === "multipleOf" && util.isInteger(ch.value));
  }
  get isFinite() {
    let max = null;
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "finite" || ch.kind === "int" || ch.kind === "multipleOf") {
        return true;
      } else if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      } else if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return Number.isFinite(min) && Number.isFinite(max);
  }
};
ZodNumber.create = (params) => {
  return new ZodNumber({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodNumber,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodBigInt = class _ZodBigInt extends ZodType {
  constructor() {
    super(...arguments);
    this.min = this.gte;
    this.max = this.lte;
  }
  _parse(input) {
    if (this._def.coerce) {
      try {
        input.data = BigInt(input.data);
      } catch {
        return this._getInvalidInput(input);
      }
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.bigint) {
      return this._getInvalidInput(input);
    }
    let ctx = void 0;
    const status = new ParseStatus();
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        const tooSmall = check.inclusive ? input.data < check.value : input.data <= check.value;
        if (tooSmall) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            type: "bigint",
            minimum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        const tooBig = check.inclusive ? input.data > check.value : input.data >= check.value;
        if (tooBig) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            type: "bigint",
            maximum: check.value,
            inclusive: check.inclusive,
            message: check.message
          });
          status.dirty();
        }
      } else if (check.kind === "multipleOf") {
        if (input.data % check.value !== BigInt(0)) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.not_multiple_of,
            multipleOf: check.value,
            message: check.message
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return { status: status.value, value: input.data };
  }
  _getInvalidInput(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.bigint,
      received: ctx.parsedType
    });
    return INVALID;
  }
  gte(value, message) {
    return this.setLimit("min", value, true, errorUtil.toString(message));
  }
  gt(value, message) {
    return this.setLimit("min", value, false, errorUtil.toString(message));
  }
  lte(value, message) {
    return this.setLimit("max", value, true, errorUtil.toString(message));
  }
  lt(value, message) {
    return this.setLimit("max", value, false, errorUtil.toString(message));
  }
  setLimit(kind, value, inclusive, message) {
    return new _ZodBigInt({
      ...this._def,
      checks: [
        ...this._def.checks,
        {
          kind,
          value,
          inclusive,
          message: errorUtil.toString(message)
        }
      ]
    });
  }
  _addCheck(check) {
    return new _ZodBigInt({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  positive(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  negative(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: false,
      message: errorUtil.toString(message)
    });
  }
  nonpositive(message) {
    return this._addCheck({
      kind: "max",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  nonnegative(message) {
    return this._addCheck({
      kind: "min",
      value: BigInt(0),
      inclusive: true,
      message: errorUtil.toString(message)
    });
  }
  multipleOf(value, message) {
    return this._addCheck({
      kind: "multipleOf",
      value,
      message: errorUtil.toString(message)
    });
  }
  get minValue() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min;
  }
  get maxValue() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max;
  }
};
ZodBigInt.create = (params) => {
  return new ZodBigInt({
    checks: [],
    typeName: ZodFirstPartyTypeKind.ZodBigInt,
    coerce: params?.coerce ?? false,
    ...processCreateParams(params)
  });
};
var ZodBoolean = class extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = Boolean(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.boolean) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.boolean,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodBoolean.create = (params) => {
  return new ZodBoolean({
    typeName: ZodFirstPartyTypeKind.ZodBoolean,
    coerce: params?.coerce || false,
    ...processCreateParams(params)
  });
};
var ZodDate = class _ZodDate extends ZodType {
  _parse(input) {
    if (this._def.coerce) {
      input.data = new Date(input.data);
    }
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.date) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.date,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    if (Number.isNaN(input.data.getTime())) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_date
      });
      return INVALID;
    }
    const status = new ParseStatus();
    let ctx = void 0;
    for (const check of this._def.checks) {
      if (check.kind === "min") {
        if (input.data.getTime() < check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_small,
            message: check.message,
            inclusive: true,
            exact: false,
            minimum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else if (check.kind === "max") {
        if (input.data.getTime() > check.value) {
          ctx = this._getOrReturnCtx(input, ctx);
          addIssueToContext(ctx, {
            code: ZodIssueCode.too_big,
            message: check.message,
            inclusive: true,
            exact: false,
            maximum: check.value,
            type: "date"
          });
          status.dirty();
        }
      } else {
        util.assertNever(check);
      }
    }
    return {
      status: status.value,
      value: new Date(input.data.getTime())
    };
  }
  _addCheck(check) {
    return new _ZodDate({
      ...this._def,
      checks: [...this._def.checks, check]
    });
  }
  min(minDate, message) {
    return this._addCheck({
      kind: "min",
      value: minDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  max(maxDate, message) {
    return this._addCheck({
      kind: "max",
      value: maxDate.getTime(),
      message: errorUtil.toString(message)
    });
  }
  get minDate() {
    let min = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "min") {
        if (min === null || ch.value > min)
          min = ch.value;
      }
    }
    return min != null ? new Date(min) : null;
  }
  get maxDate() {
    let max = null;
    for (const ch of this._def.checks) {
      if (ch.kind === "max") {
        if (max === null || ch.value < max)
          max = ch.value;
      }
    }
    return max != null ? new Date(max) : null;
  }
};
ZodDate.create = (params) => {
  return new ZodDate({
    checks: [],
    coerce: params?.coerce || false,
    typeName: ZodFirstPartyTypeKind.ZodDate,
    ...processCreateParams(params)
  });
};
var ZodSymbol = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.symbol) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.symbol,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodSymbol.create = (params) => {
  return new ZodSymbol({
    typeName: ZodFirstPartyTypeKind.ZodSymbol,
    ...processCreateParams(params)
  });
};
var ZodUndefined = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.undefined,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodUndefined.create = (params) => {
  return new ZodUndefined({
    typeName: ZodFirstPartyTypeKind.ZodUndefined,
    ...processCreateParams(params)
  });
};
var ZodNull = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.null) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.null,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodNull.create = (params) => {
  return new ZodNull({
    typeName: ZodFirstPartyTypeKind.ZodNull,
    ...processCreateParams(params)
  });
};
var ZodAny = class extends ZodType {
  constructor() {
    super(...arguments);
    this._any = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodAny.create = (params) => {
  return new ZodAny({
    typeName: ZodFirstPartyTypeKind.ZodAny,
    ...processCreateParams(params)
  });
};
var ZodUnknown = class extends ZodType {
  constructor() {
    super(...arguments);
    this._unknown = true;
  }
  _parse(input) {
    return OK(input.data);
  }
};
ZodUnknown.create = (params) => {
  return new ZodUnknown({
    typeName: ZodFirstPartyTypeKind.ZodUnknown,
    ...processCreateParams(params)
  });
};
var ZodNever = class extends ZodType {
  _parse(input) {
    const ctx = this._getOrReturnCtx(input);
    addIssueToContext(ctx, {
      code: ZodIssueCode.invalid_type,
      expected: ZodParsedType.never,
      received: ctx.parsedType
    });
    return INVALID;
  }
};
ZodNever.create = (params) => {
  return new ZodNever({
    typeName: ZodFirstPartyTypeKind.ZodNever,
    ...processCreateParams(params)
  });
};
var ZodVoid = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.undefined) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.void,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return OK(input.data);
  }
};
ZodVoid.create = (params) => {
  return new ZodVoid({
    typeName: ZodFirstPartyTypeKind.ZodVoid,
    ...processCreateParams(params)
  });
};
var ZodArray = class _ZodArray extends ZodType {
  _parse(input) {
    const { ctx, status } = this._processInputParams(input);
    const def = this._def;
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (def.exactLength !== null) {
      const tooBig = ctx.data.length > def.exactLength.value;
      const tooSmall = ctx.data.length < def.exactLength.value;
      if (tooBig || tooSmall) {
        addIssueToContext(ctx, {
          code: tooBig ? ZodIssueCode.too_big : ZodIssueCode.too_small,
          minimum: tooSmall ? def.exactLength.value : void 0,
          maximum: tooBig ? def.exactLength.value : void 0,
          type: "array",
          inclusive: true,
          exact: true,
          message: def.exactLength.message
        });
        status.dirty();
      }
    }
    if (def.minLength !== null) {
      if (ctx.data.length < def.minLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.minLength.message
        });
        status.dirty();
      }
    }
    if (def.maxLength !== null) {
      if (ctx.data.length > def.maxLength.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxLength.value,
          type: "array",
          inclusive: true,
          exact: false,
          message: def.maxLength.message
        });
        status.dirty();
      }
    }
    if (ctx.common.async) {
      return Promise.all([...ctx.data].map((item, i2) => {
        return def.type._parseAsync(new ParseInputLazyPath(ctx, item, ctx.path, i2));
      })).then((result2) => {
        return ParseStatus.mergeArray(status, result2);
      });
    }
    const result = [...ctx.data].map((item, i2) => {
      return def.type._parseSync(new ParseInputLazyPath(ctx, item, ctx.path, i2));
    });
    return ParseStatus.mergeArray(status, result);
  }
  get element() {
    return this._def.type;
  }
  min(minLength, message) {
    return new _ZodArray({
      ...this._def,
      minLength: { value: minLength, message: errorUtil.toString(message) }
    });
  }
  max(maxLength, message) {
    return new _ZodArray({
      ...this._def,
      maxLength: { value: maxLength, message: errorUtil.toString(message) }
    });
  }
  length(len, message) {
    return new _ZodArray({
      ...this._def,
      exactLength: { value: len, message: errorUtil.toString(message) }
    });
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodArray.create = (schema, params) => {
  return new ZodArray({
    type: schema,
    minLength: null,
    maxLength: null,
    exactLength: null,
    typeName: ZodFirstPartyTypeKind.ZodArray,
    ...processCreateParams(params)
  });
};
function deepPartialify(schema) {
  if (schema instanceof ZodObject) {
    const newShape = {};
    for (const key in schema.shape) {
      const fieldSchema = schema.shape[key];
      newShape[key] = ZodOptional.create(deepPartialify(fieldSchema));
    }
    return new ZodObject({
      ...schema._def,
      shape: () => newShape
    });
  } else if (schema instanceof ZodArray) {
    return new ZodArray({
      ...schema._def,
      type: deepPartialify(schema.element)
    });
  } else if (schema instanceof ZodOptional) {
    return ZodOptional.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodNullable) {
    return ZodNullable.create(deepPartialify(schema.unwrap()));
  } else if (schema instanceof ZodTuple) {
    return ZodTuple.create(schema.items.map((item) => deepPartialify(item)));
  } else {
    return schema;
  }
}
var ZodObject = class _ZodObject extends ZodType {
  constructor() {
    super(...arguments);
    this._cached = null;
    this.nonstrict = this.passthrough;
    this.augment = this.extend;
  }
  _getCached() {
    if (this._cached !== null)
      return this._cached;
    const shape = this._def.shape();
    const keys = util.objectKeys(shape);
    this._cached = { shape, keys };
    return this._cached;
  }
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.object) {
      const ctx2 = this._getOrReturnCtx(input);
      addIssueToContext(ctx2, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx2.parsedType
      });
      return INVALID;
    }
    const { status, ctx } = this._processInputParams(input);
    const { shape, keys: shapeKeys } = this._getCached();
    const extraKeys = [];
    if (!(this._def.catchall instanceof ZodNever && this._def.unknownKeys === "strip")) {
      for (const key in ctx.data) {
        if (!shapeKeys.includes(key)) {
          extraKeys.push(key);
        }
      }
    }
    const pairs = [];
    for (const key of shapeKeys) {
      const keyValidator = shape[key];
      const value = ctx.data[key];
      pairs.push({
        key: { status: "valid", value: key },
        value: keyValidator._parse(new ParseInputLazyPath(ctx, value, ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (this._def.catchall instanceof ZodNever) {
      const unknownKeys = this._def.unknownKeys;
      if (unknownKeys === "passthrough") {
        for (const key of extraKeys) {
          pairs.push({
            key: { status: "valid", value: key },
            value: { status: "valid", value: ctx.data[key] }
          });
        }
      } else if (unknownKeys === "strict") {
        if (extraKeys.length > 0) {
          addIssueToContext(ctx, {
            code: ZodIssueCode.unrecognized_keys,
            keys: extraKeys
          });
          status.dirty();
        }
      } else if (unknownKeys === "strip") {
      } else {
        throw new Error(`Internal ZodObject error: invalid unknownKeys value.`);
      }
    } else {
      const catchall = this._def.catchall;
      for (const key of extraKeys) {
        const value = ctx.data[key];
        pairs.push({
          key: { status: "valid", value: key },
          value: catchall._parse(
            new ParseInputLazyPath(ctx, value, ctx.path, key)
            //, ctx.child(key), value, getParsedType(value)
          ),
          alwaysSet: key in ctx.data
        });
      }
    }
    if (ctx.common.async) {
      return Promise.resolve().then(async () => {
        const syncPairs = [];
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          syncPairs.push({
            key,
            value,
            alwaysSet: pair.alwaysSet
          });
        }
        return syncPairs;
      }).then((syncPairs) => {
        return ParseStatus.mergeObjectSync(status, syncPairs);
      });
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get shape() {
    return this._def.shape();
  }
  strict(message) {
    errorUtil.errToObj;
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strict",
      ...message !== void 0 ? {
        errorMap: (issue, ctx) => {
          const defaultError = this._def.errorMap?.(issue, ctx).message ?? ctx.defaultError;
          if (issue.code === "unrecognized_keys")
            return {
              message: errorUtil.errToObj(message).message ?? defaultError
            };
          return {
            message: defaultError
          };
        }
      } : {}
    });
  }
  strip() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "strip"
    });
  }
  passthrough() {
    return new _ZodObject({
      ...this._def,
      unknownKeys: "passthrough"
    });
  }
  // const AugmentFactory =
  //   <Def extends ZodObjectDef>(def: Def) =>
  //   <Augmentation extends ZodRawShape>(
  //     augmentation: Augmentation
  //   ): ZodObject<
  //     extendShape<ReturnType<Def["shape"]>, Augmentation>,
  //     Def["unknownKeys"],
  //     Def["catchall"]
  //   > => {
  //     return new ZodObject({
  //       ...def,
  //       shape: () => ({
  //         ...def.shape(),
  //         ...augmentation,
  //       }),
  //     }) as any;
  //   };
  extend(augmentation) {
    return new _ZodObject({
      ...this._def,
      shape: () => ({
        ...this._def.shape(),
        ...augmentation
      })
    });
  }
  /**
   * Prior to zod@1.0.12 there was a bug in the
   * inferred type of merged objects. Please
   * upgrade if you are experiencing issues.
   */
  merge(merging) {
    const merged = new _ZodObject({
      unknownKeys: merging._def.unknownKeys,
      catchall: merging._def.catchall,
      shape: () => ({
        ...this._def.shape(),
        ...merging._def.shape()
      }),
      typeName: ZodFirstPartyTypeKind.ZodObject
    });
    return merged;
  }
  // merge<
  //   Incoming extends AnyZodObject,
  //   Augmentation extends Incoming["shape"],
  //   NewOutput extends {
  //     [k in keyof Augmentation | keyof Output]: k extends keyof Augmentation
  //       ? Augmentation[k]["_output"]
  //       : k extends keyof Output
  //       ? Output[k]
  //       : never;
  //   },
  //   NewInput extends {
  //     [k in keyof Augmentation | keyof Input]: k extends keyof Augmentation
  //       ? Augmentation[k]["_input"]
  //       : k extends keyof Input
  //       ? Input[k]
  //       : never;
  //   }
  // >(
  //   merging: Incoming
  // ): ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"],
  //   NewOutput,
  //   NewInput
  // > {
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  setKey(key, schema) {
    return this.augment({ [key]: schema });
  }
  // merge<Incoming extends AnyZodObject>(
  //   merging: Incoming
  // ): //ZodObject<T & Incoming["_shape"], UnknownKeys, Catchall> = (merging) => {
  // ZodObject<
  //   extendShape<T, ReturnType<Incoming["_def"]["shape"]>>,
  //   Incoming["_def"]["unknownKeys"],
  //   Incoming["_def"]["catchall"]
  // > {
  //   // const mergedShape = objectUtil.mergeShapes(
  //   //   this._def.shape(),
  //   //   merging._def.shape()
  //   // );
  //   const merged: any = new ZodObject({
  //     unknownKeys: merging._def.unknownKeys,
  //     catchall: merging._def.catchall,
  //     shape: () =>
  //       objectUtil.mergeShapes(this._def.shape(), merging._def.shape()),
  //     typeName: ZodFirstPartyTypeKind.ZodObject,
  //   }) as any;
  //   return merged;
  // }
  catchall(index) {
    return new _ZodObject({
      ...this._def,
      catchall: index
    });
  }
  pick(mask) {
    const shape = {};
    for (const key of util.objectKeys(mask)) {
      if (mask[key] && this.shape[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  omit(mask) {
    const shape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (!mask[key]) {
        shape[key] = this.shape[key];
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => shape
    });
  }
  /**
   * @deprecated
   */
  deepPartial() {
    return deepPartialify(this);
  }
  partial(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      const fieldSchema = this.shape[key];
      if (mask && !mask[key]) {
        newShape[key] = fieldSchema;
      } else {
        newShape[key] = fieldSchema.optional();
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  required(mask) {
    const newShape = {};
    for (const key of util.objectKeys(this.shape)) {
      if (mask && !mask[key]) {
        newShape[key] = this.shape[key];
      } else {
        const fieldSchema = this.shape[key];
        let newField = fieldSchema;
        while (newField instanceof ZodOptional) {
          newField = newField._def.innerType;
        }
        newShape[key] = newField;
      }
    }
    return new _ZodObject({
      ...this._def,
      shape: () => newShape
    });
  }
  keyof() {
    return createZodEnum(util.objectKeys(this.shape));
  }
};
ZodObject.create = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.strictCreate = (shape, params) => {
  return new ZodObject({
    shape: () => shape,
    unknownKeys: "strict",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
ZodObject.lazycreate = (shape, params) => {
  return new ZodObject({
    shape,
    unknownKeys: "strip",
    catchall: ZodNever.create(),
    typeName: ZodFirstPartyTypeKind.ZodObject,
    ...processCreateParams(params)
  });
};
var ZodUnion = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const options = this._def.options;
    function handleResults(results) {
      for (const result of results) {
        if (result.result.status === "valid") {
          return result.result;
        }
      }
      for (const result of results) {
        if (result.result.status === "dirty") {
          ctx.common.issues.push(...result.ctx.common.issues);
          return result.result;
        }
      }
      const unionErrors = results.map((result) => new ZodError(result.ctx.common.issues));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return Promise.all(options.map(async (option) => {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        return {
          result: await option._parseAsync({
            data: ctx.data,
            path: ctx.path,
            parent: childCtx
          }),
          ctx: childCtx
        };
      })).then(handleResults);
    } else {
      let dirty = void 0;
      const issues = [];
      for (const option of options) {
        const childCtx = {
          ...ctx,
          common: {
            ...ctx.common,
            issues: []
          },
          parent: null
        };
        const result = option._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: childCtx
        });
        if (result.status === "valid") {
          return result;
        } else if (result.status === "dirty" && !dirty) {
          dirty = { result, ctx: childCtx };
        }
        if (childCtx.common.issues.length) {
          issues.push(childCtx.common.issues);
        }
      }
      if (dirty) {
        ctx.common.issues.push(...dirty.ctx.common.issues);
        return dirty.result;
      }
      const unionErrors = issues.map((issues2) => new ZodError(issues2));
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union,
        unionErrors
      });
      return INVALID;
    }
  }
  get options() {
    return this._def.options;
  }
};
ZodUnion.create = (types, params) => {
  return new ZodUnion({
    options: types,
    typeName: ZodFirstPartyTypeKind.ZodUnion,
    ...processCreateParams(params)
  });
};
var getDiscriminator = (type) => {
  if (type instanceof ZodLazy) {
    return getDiscriminator(type.schema);
  } else if (type instanceof ZodEffects) {
    return getDiscriminator(type.innerType());
  } else if (type instanceof ZodLiteral) {
    return [type.value];
  } else if (type instanceof ZodEnum) {
    return type.options;
  } else if (type instanceof ZodNativeEnum) {
    return util.objectValues(type.enum);
  } else if (type instanceof ZodDefault) {
    return getDiscriminator(type._def.innerType);
  } else if (type instanceof ZodUndefined) {
    return [void 0];
  } else if (type instanceof ZodNull) {
    return [null];
  } else if (type instanceof ZodOptional) {
    return [void 0, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodNullable) {
    return [null, ...getDiscriminator(type.unwrap())];
  } else if (type instanceof ZodBranded) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodReadonly) {
    return getDiscriminator(type.unwrap());
  } else if (type instanceof ZodCatch) {
    return getDiscriminator(type._def.innerType);
  } else {
    return [];
  }
};
var ZodDiscriminatedUnion = class _ZodDiscriminatedUnion extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const discriminator = this.discriminator;
    const discriminatorValue = ctx.data[discriminator];
    const option = this.optionsMap.get(discriminatorValue);
    if (!option) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_union_discriminator,
        options: Array.from(this.optionsMap.keys()),
        path: [discriminator]
      });
      return INVALID;
    }
    if (ctx.common.async) {
      return option._parseAsync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    } else {
      return option._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
    }
  }
  get discriminator() {
    return this._def.discriminator;
  }
  get options() {
    return this._def.options;
  }
  get optionsMap() {
    return this._def.optionsMap;
  }
  /**
   * The constructor of the discriminated union schema. Its behaviour is very similar to that of the normal z.union() constructor.
   * However, it only allows a union of objects, all of which need to share a discriminator property. This property must
   * have a different value for each object in the union.
   * @param discriminator the name of the discriminator property
   * @param types an array of object schemas
   * @param params
   */
  static create(discriminator, options, params) {
    const optionsMap = /* @__PURE__ */ new Map();
    for (const type of options) {
      const discriminatorValues = getDiscriminator(type.shape[discriminator]);
      if (!discriminatorValues.length) {
        throw new Error(`A discriminator value for key \`${discriminator}\` could not be extracted from all schema options`);
      }
      for (const value of discriminatorValues) {
        if (optionsMap.has(value)) {
          throw new Error(`Discriminator property ${String(discriminator)} has duplicate value ${String(value)}`);
        }
        optionsMap.set(value, type);
      }
    }
    return new _ZodDiscriminatedUnion({
      typeName: ZodFirstPartyTypeKind.ZodDiscriminatedUnion,
      discriminator,
      options,
      optionsMap,
      ...processCreateParams(params)
    });
  }
};
function mergeValues(a2, b2) {
  const aType = getParsedType(a2);
  const bType = getParsedType(b2);
  if (a2 === b2) {
    return { valid: true, data: a2 };
  } else if (aType === ZodParsedType.object && bType === ZodParsedType.object) {
    const bKeys = util.objectKeys(b2);
    const sharedKeys = util.objectKeys(a2).filter((key) => bKeys.indexOf(key) !== -1);
    const newObj = { ...a2, ...b2 };
    for (const key of sharedKeys) {
      const sharedValue = mergeValues(a2[key], b2[key]);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newObj[key] = sharedValue.data;
    }
    return { valid: true, data: newObj };
  } else if (aType === ZodParsedType.array && bType === ZodParsedType.array) {
    if (a2.length !== b2.length) {
      return { valid: false };
    }
    const newArray = [];
    for (let index = 0; index < a2.length; index++) {
      const itemA = a2[index];
      const itemB = b2[index];
      const sharedValue = mergeValues(itemA, itemB);
      if (!sharedValue.valid) {
        return { valid: false };
      }
      newArray.push(sharedValue.data);
    }
    return { valid: true, data: newArray };
  } else if (aType === ZodParsedType.date && bType === ZodParsedType.date && +a2 === +b2) {
    return { valid: true, data: a2 };
  } else {
    return { valid: false };
  }
}
var ZodIntersection = class extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const handleParsed = (parsedLeft, parsedRight) => {
      if (isAborted(parsedLeft) || isAborted(parsedRight)) {
        return INVALID;
      }
      const merged = mergeValues(parsedLeft.value, parsedRight.value);
      if (!merged.valid) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.invalid_intersection_types
        });
        return INVALID;
      }
      if (isDirty(parsedLeft) || isDirty(parsedRight)) {
        status.dirty();
      }
      return { status: status.value, value: merged.data };
    };
    if (ctx.common.async) {
      return Promise.all([
        this._def.left._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        }),
        this._def.right._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        })
      ]).then(([left, right]) => handleParsed(left, right));
    } else {
      return handleParsed(this._def.left._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }), this._def.right._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      }));
    }
  }
};
ZodIntersection.create = (left, right, params) => {
  return new ZodIntersection({
    left,
    right,
    typeName: ZodFirstPartyTypeKind.ZodIntersection,
    ...processCreateParams(params)
  });
};
var ZodTuple = class _ZodTuple extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.array) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.array,
        received: ctx.parsedType
      });
      return INVALID;
    }
    if (ctx.data.length < this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_small,
        minimum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      return INVALID;
    }
    const rest = this._def.rest;
    if (!rest && ctx.data.length > this._def.items.length) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.too_big,
        maximum: this._def.items.length,
        inclusive: true,
        exact: false,
        type: "array"
      });
      status.dirty();
    }
    const items = [...ctx.data].map((item, itemIndex) => {
      const schema = this._def.items[itemIndex] || this._def.rest;
      if (!schema)
        return null;
      return schema._parse(new ParseInputLazyPath(ctx, item, ctx.path, itemIndex));
    }).filter((x2) => !!x2);
    if (ctx.common.async) {
      return Promise.all(items).then((results) => {
        return ParseStatus.mergeArray(status, results);
      });
    } else {
      return ParseStatus.mergeArray(status, items);
    }
  }
  get items() {
    return this._def.items;
  }
  rest(rest) {
    return new _ZodTuple({
      ...this._def,
      rest
    });
  }
};
ZodTuple.create = (schemas, params) => {
  if (!Array.isArray(schemas)) {
    throw new Error("You must pass an array of schemas to z.tuple([ ... ])");
  }
  return new ZodTuple({
    items: schemas,
    typeName: ZodFirstPartyTypeKind.ZodTuple,
    rest: null,
    ...processCreateParams(params)
  });
};
var ZodRecord = class _ZodRecord extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.object) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.object,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const pairs = [];
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    for (const key in ctx.data) {
      pairs.push({
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, key)),
        value: valueType._parse(new ParseInputLazyPath(ctx, ctx.data[key], ctx.path, key)),
        alwaysSet: key in ctx.data
      });
    }
    if (ctx.common.async) {
      return ParseStatus.mergeObjectAsync(status, pairs);
    } else {
      return ParseStatus.mergeObjectSync(status, pairs);
    }
  }
  get element() {
    return this._def.valueType;
  }
  static create(first, second2, third) {
    if (second2 instanceof ZodType) {
      return new _ZodRecord({
        keyType: first,
        valueType: second2,
        typeName: ZodFirstPartyTypeKind.ZodRecord,
        ...processCreateParams(third)
      });
    }
    return new _ZodRecord({
      keyType: ZodString.create(),
      valueType: first,
      typeName: ZodFirstPartyTypeKind.ZodRecord,
      ...processCreateParams(second2)
    });
  }
};
var ZodMap = class extends ZodType {
  get keySchema() {
    return this._def.keyType;
  }
  get valueSchema() {
    return this._def.valueType;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.map) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.map,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const keyType = this._def.keyType;
    const valueType = this._def.valueType;
    const pairs = [...ctx.data.entries()].map(([key, value], index) => {
      return {
        key: keyType._parse(new ParseInputLazyPath(ctx, key, ctx.path, [index, "key"])),
        value: valueType._parse(new ParseInputLazyPath(ctx, value, ctx.path, [index, "value"]))
      };
    });
    if (ctx.common.async) {
      const finalMap = /* @__PURE__ */ new Map();
      return Promise.resolve().then(async () => {
        for (const pair of pairs) {
          const key = await pair.key;
          const value = await pair.value;
          if (key.status === "aborted" || value.status === "aborted") {
            return INVALID;
          }
          if (key.status === "dirty" || value.status === "dirty") {
            status.dirty();
          }
          finalMap.set(key.value, value.value);
        }
        return { status: status.value, value: finalMap };
      });
    } else {
      const finalMap = /* @__PURE__ */ new Map();
      for (const pair of pairs) {
        const key = pair.key;
        const value = pair.value;
        if (key.status === "aborted" || value.status === "aborted") {
          return INVALID;
        }
        if (key.status === "dirty" || value.status === "dirty") {
          status.dirty();
        }
        finalMap.set(key.value, value.value);
      }
      return { status: status.value, value: finalMap };
    }
  }
};
ZodMap.create = (keyType, valueType, params) => {
  return new ZodMap({
    valueType,
    keyType,
    typeName: ZodFirstPartyTypeKind.ZodMap,
    ...processCreateParams(params)
  });
};
var ZodSet = class _ZodSet extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.set) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.set,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const def = this._def;
    if (def.minSize !== null) {
      if (ctx.data.size < def.minSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_small,
          minimum: def.minSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.minSize.message
        });
        status.dirty();
      }
    }
    if (def.maxSize !== null) {
      if (ctx.data.size > def.maxSize.value) {
        addIssueToContext(ctx, {
          code: ZodIssueCode.too_big,
          maximum: def.maxSize.value,
          type: "set",
          inclusive: true,
          exact: false,
          message: def.maxSize.message
        });
        status.dirty();
      }
    }
    const valueType = this._def.valueType;
    function finalizeSet(elements2) {
      const parsedSet = /* @__PURE__ */ new Set();
      for (const element of elements2) {
        if (element.status === "aborted")
          return INVALID;
        if (element.status === "dirty")
          status.dirty();
        parsedSet.add(element.value);
      }
      return { status: status.value, value: parsedSet };
    }
    const elements = [...ctx.data.values()].map((item, i2) => valueType._parse(new ParseInputLazyPath(ctx, item, ctx.path, i2)));
    if (ctx.common.async) {
      return Promise.all(elements).then((elements2) => finalizeSet(elements2));
    } else {
      return finalizeSet(elements);
    }
  }
  min(minSize, message) {
    return new _ZodSet({
      ...this._def,
      minSize: { value: minSize, message: errorUtil.toString(message) }
    });
  }
  max(maxSize, message) {
    return new _ZodSet({
      ...this._def,
      maxSize: { value: maxSize, message: errorUtil.toString(message) }
    });
  }
  size(size, message) {
    return this.min(size, message).max(size, message);
  }
  nonempty(message) {
    return this.min(1, message);
  }
};
ZodSet.create = (valueType, params) => {
  return new ZodSet({
    valueType,
    minSize: null,
    maxSize: null,
    typeName: ZodFirstPartyTypeKind.ZodSet,
    ...processCreateParams(params)
  });
};
var ZodFunction = class _ZodFunction extends ZodType {
  constructor() {
    super(...arguments);
    this.validate = this.implement;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.function) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.function,
        received: ctx.parsedType
      });
      return INVALID;
    }
    function makeArgsIssue(args, error) {
      return makeIssue({
        data: args,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_arguments,
          argumentsError: error
        }
      });
    }
    function makeReturnsIssue(returns, error) {
      return makeIssue({
        data: returns,
        path: ctx.path,
        errorMaps: [ctx.common.contextualErrorMap, ctx.schemaErrorMap, getErrorMap(), en_default].filter((x2) => !!x2),
        issueData: {
          code: ZodIssueCode.invalid_return_type,
          returnTypeError: error
        }
      });
    }
    const params = { errorMap: ctx.common.contextualErrorMap };
    const fn2 = ctx.data;
    if (this._def.returns instanceof ZodPromise) {
      const me2 = this;
      return OK(async function(...args) {
        const error = new ZodError([]);
        const parsedArgs = await me2._def.args.parseAsync(args, params).catch((e2) => {
          error.addIssue(makeArgsIssue(args, e2));
          throw error;
        });
        const result = await Reflect.apply(fn2, this, parsedArgs);
        const parsedReturns = await me2._def.returns._def.type.parseAsync(result, params).catch((e2) => {
          error.addIssue(makeReturnsIssue(result, e2));
          throw error;
        });
        return parsedReturns;
      });
    } else {
      const me2 = this;
      return OK(function(...args) {
        const parsedArgs = me2._def.args.safeParse(args, params);
        if (!parsedArgs.success) {
          throw new ZodError([makeArgsIssue(args, parsedArgs.error)]);
        }
        const result = Reflect.apply(fn2, this, parsedArgs.data);
        const parsedReturns = me2._def.returns.safeParse(result, params);
        if (!parsedReturns.success) {
          throw new ZodError([makeReturnsIssue(result, parsedReturns.error)]);
        }
        return parsedReturns.data;
      });
    }
  }
  parameters() {
    return this._def.args;
  }
  returnType() {
    return this._def.returns;
  }
  args(...items) {
    return new _ZodFunction({
      ...this._def,
      args: ZodTuple.create(items).rest(ZodUnknown.create())
    });
  }
  returns(returnType) {
    return new _ZodFunction({
      ...this._def,
      returns: returnType
    });
  }
  implement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  strictImplement(func) {
    const validatedFunc = this.parse(func);
    return validatedFunc;
  }
  static create(args, returns, params) {
    return new _ZodFunction({
      args: args ? args : ZodTuple.create([]).rest(ZodUnknown.create()),
      returns: returns || ZodUnknown.create(),
      typeName: ZodFirstPartyTypeKind.ZodFunction,
      ...processCreateParams(params)
    });
  }
};
var ZodLazy = class extends ZodType {
  get schema() {
    return this._def.getter();
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const lazySchema = this._def.getter();
    return lazySchema._parse({ data: ctx.data, path: ctx.path, parent: ctx });
  }
};
ZodLazy.create = (getter, params) => {
  return new ZodLazy({
    getter,
    typeName: ZodFirstPartyTypeKind.ZodLazy,
    ...processCreateParams(params)
  });
};
var ZodLiteral = class extends ZodType {
  _parse(input) {
    if (input.data !== this._def.value) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_literal,
        expected: this._def.value
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
  get value() {
    return this._def.value;
  }
};
ZodLiteral.create = (value, params) => {
  return new ZodLiteral({
    value,
    typeName: ZodFirstPartyTypeKind.ZodLiteral,
    ...processCreateParams(params)
  });
};
function createZodEnum(values, params) {
  return new ZodEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodEnum,
    ...processCreateParams(params)
  });
}
var ZodEnum = class _ZodEnum extends ZodType {
  _parse(input) {
    if (typeof input.data !== "string") {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(this._def.values);
    }
    if (!this._cache.has(input.data)) {
      const ctx = this._getOrReturnCtx(input);
      const expectedValues = this._def.values;
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get options() {
    return this._def.values;
  }
  get enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Values() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  get Enum() {
    const enumValues = {};
    for (const val of this._def.values) {
      enumValues[val] = val;
    }
    return enumValues;
  }
  extract(values, newDef = this._def) {
    return _ZodEnum.create(values, {
      ...this._def,
      ...newDef
    });
  }
  exclude(values, newDef = this._def) {
    return _ZodEnum.create(this.options.filter((opt) => !values.includes(opt)), {
      ...this._def,
      ...newDef
    });
  }
};
ZodEnum.create = createZodEnum;
var ZodNativeEnum = class extends ZodType {
  _parse(input) {
    const nativeEnumValues = util.getValidEnumValues(this._def.values);
    const ctx = this._getOrReturnCtx(input);
    if (ctx.parsedType !== ZodParsedType.string && ctx.parsedType !== ZodParsedType.number) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        expected: util.joinValues(expectedValues),
        received: ctx.parsedType,
        code: ZodIssueCode.invalid_type
      });
      return INVALID;
    }
    if (!this._cache) {
      this._cache = new Set(util.getValidEnumValues(this._def.values));
    }
    if (!this._cache.has(input.data)) {
      const expectedValues = util.objectValues(nativeEnumValues);
      addIssueToContext(ctx, {
        received: ctx.data,
        code: ZodIssueCode.invalid_enum_value,
        options: expectedValues
      });
      return INVALID;
    }
    return OK(input.data);
  }
  get enum() {
    return this._def.values;
  }
};
ZodNativeEnum.create = (values, params) => {
  return new ZodNativeEnum({
    values,
    typeName: ZodFirstPartyTypeKind.ZodNativeEnum,
    ...processCreateParams(params)
  });
};
var ZodPromise = class extends ZodType {
  unwrap() {
    return this._def.type;
  }
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    if (ctx.parsedType !== ZodParsedType.promise && ctx.common.async === false) {
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.promise,
        received: ctx.parsedType
      });
      return INVALID;
    }
    const promisified = ctx.parsedType === ZodParsedType.promise ? ctx.data : Promise.resolve(ctx.data);
    return OK(promisified.then((data) => {
      return this._def.type.parseAsync(data, {
        path: ctx.path,
        errorMap: ctx.common.contextualErrorMap
      });
    }));
  }
};
ZodPromise.create = (schema, params) => {
  return new ZodPromise({
    type: schema,
    typeName: ZodFirstPartyTypeKind.ZodPromise,
    ...processCreateParams(params)
  });
};
var ZodEffects = class extends ZodType {
  innerType() {
    return this._def.schema;
  }
  sourceType() {
    return this._def.schema._def.typeName === ZodFirstPartyTypeKind.ZodEffects ? this._def.schema.sourceType() : this._def.schema;
  }
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    const effect = this._def.effect || null;
    const checkCtx = {
      addIssue: (arg) => {
        addIssueToContext(ctx, arg);
        if (arg.fatal) {
          status.abort();
        } else {
          status.dirty();
        }
      },
      get path() {
        return ctx.path;
      }
    };
    checkCtx.addIssue = checkCtx.addIssue.bind(checkCtx);
    if (effect.type === "preprocess") {
      const processed = effect.transform(ctx.data, checkCtx);
      if (ctx.common.async) {
        return Promise.resolve(processed).then(async (processed2) => {
          if (status.value === "aborted")
            return INVALID;
          const result = await this._def.schema._parseAsync({
            data: processed2,
            path: ctx.path,
            parent: ctx
          });
          if (result.status === "aborted")
            return INVALID;
          if (result.status === "dirty")
            return DIRTY(result.value);
          if (status.value === "dirty")
            return DIRTY(result.value);
          return result;
        });
      } else {
        if (status.value === "aborted")
          return INVALID;
        const result = this._def.schema._parseSync({
          data: processed,
          path: ctx.path,
          parent: ctx
        });
        if (result.status === "aborted")
          return INVALID;
        if (result.status === "dirty")
          return DIRTY(result.value);
        if (status.value === "dirty")
          return DIRTY(result.value);
        return result;
      }
    }
    if (effect.type === "refinement") {
      const executeRefinement = (acc) => {
        const result = effect.refinement(acc, checkCtx);
        if (ctx.common.async) {
          return Promise.resolve(result);
        }
        if (result instanceof Promise) {
          throw new Error("Async refinement encountered during synchronous parse operation. Use .parseAsync instead.");
        }
        return acc;
      };
      if (ctx.common.async === false) {
        const inner = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inner.status === "aborted")
          return INVALID;
        if (inner.status === "dirty")
          status.dirty();
        executeRefinement(inner.value);
        return { status: status.value, value: inner.value };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((inner) => {
          if (inner.status === "aborted")
            return INVALID;
          if (inner.status === "dirty")
            status.dirty();
          return executeRefinement(inner.value).then(() => {
            return { status: status.value, value: inner.value };
          });
        });
      }
    }
    if (effect.type === "transform") {
      if (ctx.common.async === false) {
        const base = this._def.schema._parseSync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (!isValid(base))
          return INVALID;
        const result = effect.transform(base.value, checkCtx);
        if (result instanceof Promise) {
          throw new Error(`Asynchronous transform encountered during synchronous parse operation. Use .parseAsync instead.`);
        }
        return { status: status.value, value: result };
      } else {
        return this._def.schema._parseAsync({ data: ctx.data, path: ctx.path, parent: ctx }).then((base) => {
          if (!isValid(base))
            return INVALID;
          return Promise.resolve(effect.transform(base.value, checkCtx)).then((result) => ({
            status: status.value,
            value: result
          }));
        });
      }
    }
    util.assertNever(effect);
  }
};
ZodEffects.create = (schema, effect, params) => {
  return new ZodEffects({
    schema,
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    effect,
    ...processCreateParams(params)
  });
};
ZodEffects.createWithPreprocess = (preprocess, schema, params) => {
  return new ZodEffects({
    schema,
    effect: { type: "preprocess", transform: preprocess },
    typeName: ZodFirstPartyTypeKind.ZodEffects,
    ...processCreateParams(params)
  });
};
var ZodOptional = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.undefined) {
      return OK(void 0);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodOptional.create = (type, params) => {
  return new ZodOptional({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodOptional,
    ...processCreateParams(params)
  });
};
var ZodNullable = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType === ZodParsedType.null) {
      return OK(null);
    }
    return this._def.innerType._parse(input);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodNullable.create = (type, params) => {
  return new ZodNullable({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodNullable,
    ...processCreateParams(params)
  });
};
var ZodDefault = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    let data = ctx.data;
    if (ctx.parsedType === ZodParsedType.undefined) {
      data = this._def.defaultValue();
    }
    return this._def.innerType._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  removeDefault() {
    return this._def.innerType;
  }
};
ZodDefault.create = (type, params) => {
  return new ZodDefault({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodDefault,
    defaultValue: typeof params.default === "function" ? params.default : () => params.default,
    ...processCreateParams(params)
  });
};
var ZodCatch = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const newCtx = {
      ...ctx,
      common: {
        ...ctx.common,
        issues: []
      }
    };
    const result = this._def.innerType._parse({
      data: newCtx.data,
      path: newCtx.path,
      parent: {
        ...newCtx
      }
    });
    if (isAsync(result)) {
      return result.then((result2) => {
        return {
          status: "valid",
          value: result2.status === "valid" ? result2.value : this._def.catchValue({
            get error() {
              return new ZodError(newCtx.common.issues);
            },
            input: newCtx.data
          })
        };
      });
    } else {
      return {
        status: "valid",
        value: result.status === "valid" ? result.value : this._def.catchValue({
          get error() {
            return new ZodError(newCtx.common.issues);
          },
          input: newCtx.data
        })
      };
    }
  }
  removeCatch() {
    return this._def.innerType;
  }
};
ZodCatch.create = (type, params) => {
  return new ZodCatch({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodCatch,
    catchValue: typeof params.catch === "function" ? params.catch : () => params.catch,
    ...processCreateParams(params)
  });
};
var ZodNaN = class extends ZodType {
  _parse(input) {
    const parsedType = this._getType(input);
    if (parsedType !== ZodParsedType.nan) {
      const ctx = this._getOrReturnCtx(input);
      addIssueToContext(ctx, {
        code: ZodIssueCode.invalid_type,
        expected: ZodParsedType.nan,
        received: ctx.parsedType
      });
      return INVALID;
    }
    return { status: "valid", value: input.data };
  }
};
ZodNaN.create = (params) => {
  return new ZodNaN({
    typeName: ZodFirstPartyTypeKind.ZodNaN,
    ...processCreateParams(params)
  });
};
var BRAND = /* @__PURE__ */ Symbol("zod_brand");
var ZodBranded = class extends ZodType {
  _parse(input) {
    const { ctx } = this._processInputParams(input);
    const data = ctx.data;
    return this._def.type._parse({
      data,
      path: ctx.path,
      parent: ctx
    });
  }
  unwrap() {
    return this._def.type;
  }
};
var ZodPipeline = class _ZodPipeline extends ZodType {
  _parse(input) {
    const { status, ctx } = this._processInputParams(input);
    if (ctx.common.async) {
      const handleAsync = async () => {
        const inResult = await this._def.in._parseAsync({
          data: ctx.data,
          path: ctx.path,
          parent: ctx
        });
        if (inResult.status === "aborted")
          return INVALID;
        if (inResult.status === "dirty") {
          status.dirty();
          return DIRTY(inResult.value);
        } else {
          return this._def.out._parseAsync({
            data: inResult.value,
            path: ctx.path,
            parent: ctx
          });
        }
      };
      return handleAsync();
    } else {
      const inResult = this._def.in._parseSync({
        data: ctx.data,
        path: ctx.path,
        parent: ctx
      });
      if (inResult.status === "aborted")
        return INVALID;
      if (inResult.status === "dirty") {
        status.dirty();
        return {
          status: "dirty",
          value: inResult.value
        };
      } else {
        return this._def.out._parseSync({
          data: inResult.value,
          path: ctx.path,
          parent: ctx
        });
      }
    }
  }
  static create(a2, b2) {
    return new _ZodPipeline({
      in: a2,
      out: b2,
      typeName: ZodFirstPartyTypeKind.ZodPipeline
    });
  }
};
var ZodReadonly = class extends ZodType {
  _parse(input) {
    const result = this._def.innerType._parse(input);
    const freeze = (data) => {
      if (isValid(data)) {
        data.value = Object.freeze(data.value);
      }
      return data;
    };
    return isAsync(result) ? result.then((data) => freeze(data)) : freeze(result);
  }
  unwrap() {
    return this._def.innerType;
  }
};
ZodReadonly.create = (type, params) => {
  return new ZodReadonly({
    innerType: type,
    typeName: ZodFirstPartyTypeKind.ZodReadonly,
    ...processCreateParams(params)
  });
};
function cleanParams(params, data) {
  const p2 = typeof params === "function" ? params(data) : typeof params === "string" ? { message: params } : params;
  const p22 = typeof p2 === "string" ? { message: p2 } : p2;
  return p22;
}
function custom(check, _params = {}, fatal) {
  if (check)
    return ZodAny.create().superRefine((data, ctx) => {
      const r2 = check(data);
      if (r2 instanceof Promise) {
        return r2.then((r3) => {
          if (!r3) {
            const params = cleanParams(_params, data);
            const _fatal = params.fatal ?? fatal ?? true;
            ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
          }
        });
      }
      if (!r2) {
        const params = cleanParams(_params, data);
        const _fatal = params.fatal ?? fatal ?? true;
        ctx.addIssue({ code: "custom", ...params, fatal: _fatal });
      }
      return;
    });
  return ZodAny.create();
}
var late = {
  object: ZodObject.lazycreate
};
var ZodFirstPartyTypeKind;
(function(ZodFirstPartyTypeKind2) {
  ZodFirstPartyTypeKind2["ZodString"] = "ZodString";
  ZodFirstPartyTypeKind2["ZodNumber"] = "ZodNumber";
  ZodFirstPartyTypeKind2["ZodNaN"] = "ZodNaN";
  ZodFirstPartyTypeKind2["ZodBigInt"] = "ZodBigInt";
  ZodFirstPartyTypeKind2["ZodBoolean"] = "ZodBoolean";
  ZodFirstPartyTypeKind2["ZodDate"] = "ZodDate";
  ZodFirstPartyTypeKind2["ZodSymbol"] = "ZodSymbol";
  ZodFirstPartyTypeKind2["ZodUndefined"] = "ZodUndefined";
  ZodFirstPartyTypeKind2["ZodNull"] = "ZodNull";
  ZodFirstPartyTypeKind2["ZodAny"] = "ZodAny";
  ZodFirstPartyTypeKind2["ZodUnknown"] = "ZodUnknown";
  ZodFirstPartyTypeKind2["ZodNever"] = "ZodNever";
  ZodFirstPartyTypeKind2["ZodVoid"] = "ZodVoid";
  ZodFirstPartyTypeKind2["ZodArray"] = "ZodArray";
  ZodFirstPartyTypeKind2["ZodObject"] = "ZodObject";
  ZodFirstPartyTypeKind2["ZodUnion"] = "ZodUnion";
  ZodFirstPartyTypeKind2["ZodDiscriminatedUnion"] = "ZodDiscriminatedUnion";
  ZodFirstPartyTypeKind2["ZodIntersection"] = "ZodIntersection";
  ZodFirstPartyTypeKind2["ZodTuple"] = "ZodTuple";
  ZodFirstPartyTypeKind2["ZodRecord"] = "ZodRecord";
  ZodFirstPartyTypeKind2["ZodMap"] = "ZodMap";
  ZodFirstPartyTypeKind2["ZodSet"] = "ZodSet";
  ZodFirstPartyTypeKind2["ZodFunction"] = "ZodFunction";
  ZodFirstPartyTypeKind2["ZodLazy"] = "ZodLazy";
  ZodFirstPartyTypeKind2["ZodLiteral"] = "ZodLiteral";
  ZodFirstPartyTypeKind2["ZodEnum"] = "ZodEnum";
  ZodFirstPartyTypeKind2["ZodEffects"] = "ZodEffects";
  ZodFirstPartyTypeKind2["ZodNativeEnum"] = "ZodNativeEnum";
  ZodFirstPartyTypeKind2["ZodOptional"] = "ZodOptional";
  ZodFirstPartyTypeKind2["ZodNullable"] = "ZodNullable";
  ZodFirstPartyTypeKind2["ZodDefault"] = "ZodDefault";
  ZodFirstPartyTypeKind2["ZodCatch"] = "ZodCatch";
  ZodFirstPartyTypeKind2["ZodPromise"] = "ZodPromise";
  ZodFirstPartyTypeKind2["ZodBranded"] = "ZodBranded";
  ZodFirstPartyTypeKind2["ZodPipeline"] = "ZodPipeline";
  ZodFirstPartyTypeKind2["ZodReadonly"] = "ZodReadonly";
})(ZodFirstPartyTypeKind || (ZodFirstPartyTypeKind = {}));
var instanceOfType = (cls, params = {
  message: `Input not instance of ${cls.name}`
}) => custom((data) => data instanceof cls, params);
var stringType = ZodString.create;
var numberType = ZodNumber.create;
var nanType = ZodNaN.create;
var bigIntType = ZodBigInt.create;
var booleanType = ZodBoolean.create;
var dateType = ZodDate.create;
var symbolType = ZodSymbol.create;
var undefinedType = ZodUndefined.create;
var nullType = ZodNull.create;
var anyType = ZodAny.create;
var unknownType = ZodUnknown.create;
var neverType = ZodNever.create;
var voidType = ZodVoid.create;
var arrayType = ZodArray.create;
var objectType = ZodObject.create;
var strictObjectType = ZodObject.strictCreate;
var unionType = ZodUnion.create;
var discriminatedUnionType = ZodDiscriminatedUnion.create;
var intersectionType = ZodIntersection.create;
var tupleType = ZodTuple.create;
var recordType = ZodRecord.create;
var mapType = ZodMap.create;
var setType = ZodSet.create;
var functionType = ZodFunction.create;
var lazyType = ZodLazy.create;
var literalType = ZodLiteral.create;
var enumType = ZodEnum.create;
var nativeEnumType = ZodNativeEnum.create;
var promiseType = ZodPromise.create;
var effectsType = ZodEffects.create;
var optionalType = ZodOptional.create;
var nullableType = ZodNullable.create;
var preprocessType = ZodEffects.createWithPreprocess;
var pipelineType = ZodPipeline.create;
var ostring = () => stringType().optional();
var onumber = () => numberType().optional();
var oboolean = () => booleanType().optional();
var coerce = {
  string: ((arg) => ZodString.create({ ...arg, coerce: true })),
  number: ((arg) => ZodNumber.create({ ...arg, coerce: true })),
  boolean: ((arg) => ZodBoolean.create({
    ...arg,
    coerce: true
  })),
  bigint: ((arg) => ZodBigInt.create({ ...arg, coerce: true })),
  date: ((arg) => ZodDate.create({ ...arg, coerce: true }))
};
var NEVER = INVALID;

// node_modules/inngest/helpers/errors.js
var import_json_stringify_safe = __toESM(require_stringify(), 1);
var import_serialize_error_cjs = __toESM(require_dist(), 1);
var SERIALIZED_KEY = "__serialized";
var SERIALIZED_VALUE = true;
import_serialize_error_cjs.errorConstructors.set("NonRetriableError", NonRetriableError);
var serializeError$1 = (subject, allowUnknown = false) => {
  try {
    const existingSerializedError = isSerializedError(subject);
    if (existingSerializedError) return existingSerializedError;
    if (typeof subject === "object" && subject !== null) {
      const serializedErr = (0, import_serialize_error_cjs.serializeError)(subject);
      if (!serializedErr.name && allowUnknown) return subject;
      const ret = {
        ...serializedErr,
        name: serializedErr.name || "Error",
        message: serializedErr.message || (0, import_json_stringify_safe.default)(subject) || "Unknown error; error serialization could not find a message.",
        stack: serializedErr.stack || "",
        [SERIALIZED_KEY]: SERIALIZED_VALUE
      };
      let target = ret;
      const maxDepth = 5;
      for (let i2 = 0; i2 < maxDepth; i2++) {
        if (typeof target === "object" && target !== null && "cause" in target && target.cause) {
          target = target.cause = serializeError$1(target.cause, true);
          continue;
        }
        break;
      }
      return ret;
    }
    throw new Error("Error is not an object; strange throw value.");
  } catch {
    if (allowUnknown) return subject;
    try {
      return {
        ...serializeError$1(new Error(typeof subject === "string" ? subject : (0, import_json_stringify_safe.default)(subject)), false),
        stack: "",
        [SERIALIZED_KEY]: SERIALIZED_VALUE
      };
    } catch {
      return {
        name: "Could not serialize source error",
        message: "Serializing the source error failed.",
        stack: "",
        [SERIALIZED_KEY]: SERIALIZED_VALUE
      };
    }
  }
};
var isSerializedError = (value) => {
  try {
    if (typeof value === "string") {
      const parsed = external_exports.object({
        [SERIALIZED_KEY]: external_exports.literal(SERIALIZED_VALUE),
        name: external_exports.enum([...Array.from(import_serialize_error_cjs.errorConstructors.keys())]),
        message: external_exports.string(),
        stack: external_exports.string()
      }).passthrough().safeParse(JSON.parse(value));
      if (parsed.success) return parsed.data;
    }
    if (typeof value === "object" && value !== null) {
      if (Object.hasOwn(value, SERIALIZED_KEY) && value[SERIALIZED_KEY] === SERIALIZED_VALUE) return value;
    }
  } catch {
  }
};
var deserializeError$1 = (subject, allowUnknown = false) => {
  const requiredFields = ["name", "message"];
  try {
    if (!requiredFields.every((field) => {
      return Object.hasOwn(subject, field);
    })) throw new Error();
    const deserializedErr = (0, import_serialize_error_cjs.deserializeError)(subject);
    if ("cause" in deserializedErr) deserializedErr.cause = deserializeError$1(deserializedErr.cause, true);
    return deserializedErr;
  } catch {
    if (allowUnknown) return subject;
    const err2 = /* @__PURE__ */ new Error("Unknown error; could not reserialize");
    err2.stack = void 0;
    return err2;
  }
};
var ErrCode = /* @__PURE__ */ (function(ErrCode$1) {
  ErrCode$1["NESTING_STEPS"] = "NESTING_STEPS";
  ErrCode$1["NON_DETERMINISTIC_FUNCTION"] = "NON_DETERMINISTIC_FUNCTION";
  ErrCode$1["ASYNC_DETECTED_AFTER_MEMOIZATION"] = "ASYNC_DETECTED_AFTER_MEMOIZATION";
  ErrCode$1["STEP_USED_AFTER_ASYNC"] = "STEP_USED_AFTER_ASYNC";
  ErrCode$1["AUTOMATIC_PARALLEL_INDEXING"] = "AUTOMATIC_PARALLEL_INDEXING";
  ErrCode$1["NONDETERMINISTIC_STEPS"] = "NONDETERMINISTIC_STEPS";
  return ErrCode$1;
})({});
var getErrorMessage = (err2, fallback) => {
  const { message } = external_exports.object({ message: external_exports.string().min(1) }).catch({ message: fallback }).parse(err2);
  return message;
};
var fixEventKeyMissingSteps = ["Set the `INNGEST_EVENT_KEY` environment variable", `Pass a key to the \`new Inngest()\` constructor using the \`eventKey\` option`];
var rethrowError = (prefix) => {
  return (err2) => {
    try {
      err2.message &&= `${prefix}; ${err2.message}`;
    } catch (_noopErr) {
    } finally {
      throw err2;
    }
  };
};

// node_modules/inngest/types.js
var baseJsonErrorSchema = external_exports.object({
  name: external_exports.string().trim().optional(),
  error: external_exports.string().trim().optional(),
  message: external_exports.string().trim().optional(),
  stack: external_exports.string().trim().optional()
});
var maybeJsonErrorSchema = external_exports.lazy(() => external_exports.object({
  name: external_exports.string().trim(),
  message: external_exports.string().trim(),
  stack: external_exports.string().trim().optional(),
  cause: external_exports.union([maybeJsonErrorSchema, external_exports.unknown()]).optional()
}));
var jsonErrorSchema = baseJsonErrorSchema.extend({ cause: external_exports.union([maybeJsonErrorSchema, external_exports.unknown()]).optional() }).passthrough().catch({}).transform((val) => {
  return {
    ...val,
    name: val.name || "Error",
    message: val.message || val.error || "Unknown error",
    stack: val.stack
  };
});
var StepOpCode = /* @__PURE__ */ (function(StepOpCode$1) {
  StepOpCode$1["WaitForSignal"] = "WaitForSignal";
  StepOpCode$1["WaitForEvent"] = "WaitForEvent";
  StepOpCode$1["Step"] = "Step";
  StepOpCode$1["StepRun"] = "StepRun";
  StepOpCode$1["StepError"] = "StepError";
  StepOpCode$1["StepFailed"] = "StepFailed";
  StepOpCode$1["StepPlanned"] = "StepPlanned";
  StepOpCode$1["Sleep"] = "Sleep";
  StepOpCode$1["StepNotFound"] = "StepNotFound";
  StepOpCode$1["InvokeFunction"] = "InvokeFunction";
  StepOpCode$1["AiGateway"] = "AIGateway";
  StepOpCode$1["Gateway"] = "Gateway";
  StepOpCode$1["RunComplete"] = "RunComplete";
  StepOpCode$1["DiscoveryRequest"] = "DiscoveryRequest";
  StepOpCode$1["DeferAdd"] = "DeferAdd";
  StepOpCode$1["DeferAbort"] = "DeferAbort";
  return StepOpCode$1;
})({});
var StepMode = /* @__PURE__ */ (function(StepMode$1) {
  StepMode$1["Sync"] = "sync";
  StepMode$1["Async"] = "async";
  StepMode$1["AsyncCheckpointing"] = "async_checkpointing";
  return StepMode$1;
})({});
var AsyncResponseType = /* @__PURE__ */ (function(AsyncResponseType$1) {
  AsyncResponseType$1["Redirect"] = "redirect";
  AsyncResponseType$1["Token"] = "token";
  return AsyncResponseType$1;
})({});
var incomingOpSchema = external_exports.object({
  id: external_exports.string().min(1),
  data: external_exports.any().optional(),
  error: external_exports.any().optional(),
  input: external_exports.any().optional()
});
var sendEventResponseSchema = external_exports.object({
  ids: external_exports.array(external_exports.string()).default([]),
  status: external_exports.number().default(0),
  error: external_exports.string().optional()
});
var defaultCheckpointingOptions = {
  bufferedSteps: 1,
  maxInterval: 0
};
var DefaultMaxRuntime = {
  connect: 300 * 1e3,
  serve: 1e4
};
var concurrencyOptionSchema = external_exports.strictObject({
  limit: external_exports.number(),
  key: external_exports.string().optional(),
  scope: external_exports.enum([
    "fn",
    "env",
    "account"
  ]).optional()
});
var functionConfigSchema = external_exports.strictObject({
  name: external_exports.string().optional(),
  id: external_exports.string(),
  triggers: external_exports.array(external_exports.union([external_exports.strictObject({
    event: external_exports.string(),
    expression: external_exports.string().optional()
  }), external_exports.strictObject({
    cron: external_exports.string(),
    jitter: external_exports.string().optional()
  })])),
  steps: external_exports.record(external_exports.strictObject({
    id: external_exports.string(),
    name: external_exports.string(),
    runtime: external_exports.strictObject({
      type: external_exports.union([external_exports.literal("http"), external_exports.literal("ws")]),
      url: external_exports.string()
    }),
    retries: external_exports.strictObject({ attempts: external_exports.number().optional() }).optional()
  })),
  idempotency: external_exports.string().optional(),
  batchEvents: external_exports.strictObject({
    maxSize: external_exports.number(),
    timeout: external_exports.string(),
    key: external_exports.string().optional(),
    if: external_exports.string().optional()
  }).optional(),
  rateLimit: external_exports.strictObject({
    key: external_exports.string().optional(),
    limit: external_exports.number(),
    period: external_exports.string().transform((x2) => x2)
  }).optional(),
  throttle: external_exports.strictObject({
    key: external_exports.string().optional(),
    limit: external_exports.number(),
    period: external_exports.string().transform((x2) => x2),
    burst: external_exports.number().optional()
  }).optional(),
  singleton: external_exports.strictObject({
    key: external_exports.string().optional(),
    mode: external_exports.enum(["skip", "cancel"])
  }).optional(),
  cancel: external_exports.array(external_exports.strictObject({
    event: external_exports.string(),
    if: external_exports.string().optional(),
    timeout: external_exports.string().optional()
  })).optional(),
  debounce: external_exports.strictObject({
    key: external_exports.string().optional(),
    period: external_exports.string().transform((x2) => x2),
    timeout: external_exports.string().transform((x2) => x2).optional()
  }).optional(),
  timeouts: external_exports.strictObject({
    start: external_exports.string().transform((x2) => x2).optional(),
    finish: external_exports.string().transform((x2) => x2).optional()
  }).optional(),
  priority: external_exports.strictObject({ run: external_exports.string().optional() }).optional(),
  concurrency: external_exports.union([
    external_exports.number(),
    concurrencyOptionSchema.transform((x2) => x2),
    external_exports.array(concurrencyOptionSchema.transform((x2) => x2)).min(1).max(2)
  ]).optional()
});
var ok = (data) => {
  return {
    ok: true,
    value: data
  };
};
var err = (error) => {
  return {
    ok: false,
    error
  };
};
var inBandSyncRequestBodySchema = external_exports.strictObject({ url: external_exports.string() });

// node_modules/inngest/components/execution/InngestExecution.js
var import_debug = __toESM(require_browser(), 1);
var PREFERRED_ASYNC_EXECUTION_VERSION = ExecutionVersion.V2;
var InngestExecution = class {
  devDebug;
  constructor(options) {
    this.options = options;
    this.devDebug = (0, import_debug.default)(`${debugPrefix}:${this.options.runId}`);
  }
};

// node_modules/inngest/helpers/types.js
function isRecord(value) {
  return typeof value === "object" && value !== null && !Array.isArray(value);
}

// node_modules/inngest/helpers/log.js
var loggedKeys = /* @__PURE__ */ new Set();
function logOnce(logger, level, key, ...args) {
  if (loggedKeys.has(key)) return;
  loggedKeys.add(key);
  logger[level](...args);
}
function warnOnce(logger, key, ...args) {
  logOnce(logger, "warn", key, ...args);
}
function wrapStringFirstLogger(logger) {
  function wrap(method) {
    return (...args) => {
      if (args.length > 1 && isRecord(args[0]) && typeof args[1] === "string") {
        const [fields, message, ...rest] = args;
        logger[method](message, fields, ...rest);
      } else logger[method](...args);
    };
  }
  return {
    info: wrap("info"),
    warn: wrap("warn"),
    error: wrap("error"),
    debug: wrap("debug")
  };
}
function formatLogMessage(opts) {
  return [
    opts.message,
    opts.explanation,
    opts.action && `To fix: ${opts.action}`,
    opts.docs && `See: ${opts.docs}`,
    opts.code && `[${opts.code}]`
  ].filter(Boolean).join(" ");
}

// node_modules/inngest/api/schema.js
var errorSchema = external_exports.object({
  error: external_exports.string(),
  status: external_exports.number()
});
var stepSchema = external_exports.record(external_exports.object({
  type: external_exports.literal("data").optional().default("data"),
  data: external_exports.any().refine((v2) => typeof v2 !== "undefined", { message: "Data in steps must be defined" })
}).strict().or(external_exports.object({
  type: external_exports.literal("error").optional().default("error"),
  error: jsonErrorSchema
}).strict()).or(external_exports.object({
  type: external_exports.literal("input").optional().default("input"),
  input: external_exports.any().refine((v2) => typeof v2 !== "undefined", { message: "If input is present it must not be `undefined`" })
}).strict()).or(external_exports.any().transform((v2) => ({
  type: "data",
  data: v2
})))).default({});
var batchSchema = external_exports.array(external_exports.record(external_exports.any()).transform((v2) => v2));

// node_modules/inngest/helpers/functions.js
var import_debug2 = __toESM(require_browser(), 1);
var devDebug = (0, import_debug2.default)(`${debugPrefix}:functions`);
var undefinedToNull = (v2) => {
  return typeof v2 === "undefined" ? null : v2;
};
var createVersionSchema = (internalLogger) => external_exports.literal(-1).or(external_exports.literal(0)).or(external_exports.literal(1)).or(external_exports.literal(2)).optional().transform((v2) => {
  if (typeof v2 === "undefined") {
    devDebug("No request version specified by executor; using default");
    return {
      sdkDecided: true,
      version: PREFERRED_ASYNC_EXECUTION_VERSION
    };
  }
  if (v2 === 0) {
    internalLogger.error("V0 execution version is no longer supported");
    throw new Error("V0 execution version is no longer supported");
  }
  if (v2 === -1) return {
    sdkDecided: true,
    version: PREFERRED_ASYNC_EXECUTION_VERSION
  };
  return {
    sdkDecided: false,
    version: v2
  };
});
var parseFnData = (data, headerVersion, internalLogger) => {
  const versionSchema = createVersionSchema(internalLogger);
  const fnDataVersionSchema = external_exports.object({ version: versionSchema });
  let version2;
  let sdkDecided = true;
  try {
    if (typeof headerVersion !== "undefined") try {
      const res = versionSchema.parse(headerVersion);
      version2 = res.version;
      sdkDecided = res.sdkDecided;
    } catch {
    }
    if (typeof version2 === "undefined") {
      const parsedVersionData = fnDataVersionSchema.parse(data);
      version2 = parsedVersionData.version.version;
      sdkDecided = parsedVersionData.version.sdkDecided;
    }
    return {
      version: version2,
      sdkDecided,
      ...external_exports.object({
        event: external_exports.record(external_exports.any()),
        events: external_exports.array(external_exports.record(external_exports.any())).default([]),
        steps: stepSchema,
        defers: external_exports.record(external_exports.unknown()).optional().default({}),
        ctx: external_exports.object({
          run_id: external_exports.string(),
          fn_id: external_exports.string().optional(),
          attempt: external_exports.number().default(0),
          max_attempts: external_exports.number().optional(),
          disable_immediate_execution: external_exports.boolean().default(false),
          use_api: external_exports.boolean().default(false),
          qi_id: external_exports.string().optional(),
          stack: external_exports.object({
            stack: external_exports.array(external_exports.string()).nullable().transform((v2) => Array.isArray(v2) ? v2 : []),
            current: external_exports.number()
          }).optional().nullable()
        }).optional().nullable()
      }).parse(data)
    };
  } catch (err$1) {
    throw new Error(parseFailureErr(err$1));
  }
};
var fetchAllFnData = async ({ data, api, logger }) => {
  const result = { ...data };
  try {
    if (result.ctx?.use_api) {
      if (!result.ctx?.run_id) return err(formatLogMessage({
        message: "Failed to attempt retrieving data from API",
        explanation: "Function execution can't continue. run_id is missing from context."
      }));
      const [evtResp, stepResp] = await Promise.all([api.getRunBatch(result.ctx.run_id), api.getRunSteps(result.ctx.run_id)]);
      if (evtResp.ok) result.events = evtResp.value;
      else return err(formatLogMessage({
        message: "Failed to retrieve list of events",
        explanation: `Function execution can't continue.${evtResp.error?.error ? ` ${evtResp.error.error}` : ""}`
      }));
      if (stepResp.ok) result.steps = stepResp.value;
      else return err(formatLogMessage({
        message: "Failed to retrieve steps for function run",
        explanation: `Function execution can't continue.${stepResp.error?.error ? ` ${stepResp.error.error}` : ""}`
      }));
    }
    const stepIds = Object.keys(result.steps || {});
    if (stepIds.length && !result.ctx?.stack?.stack?.length) result.ctx = {
      ...result.ctx,
      stack: {
        stack: stepIds,
        current: stepIds.length - 1
      }
    };
    return ok(result);
  } catch (error) {
    logger.error({ err: error }, "Failed to fetch all function data");
    return err(parseFailureErr(error));
  }
};
var parseFailureErr = (err$1) => {
  let why;
  if (err$1 instanceof ZodError) why = err$1.toString();
  return formatLogMessage({
    message: "Failed to parse data from executor",
    explanation: `Function execution can't continue.${why ? ` ${why}` : ""}`,
    action: "Make sure that your API is set up to parse incoming request bodies as JSON, like body-parser for Express.",
    docs: "https://expressjs.com/en/resources/middleware/body-parser.html"
  });
};

// node_modules/inngest/helpers/marker.js
var markerKey = "~inngest";
function getMarker(value) {
  if (typeof value !== "object" || value === null) return;
  const m2 = value[markerKey];
  if (typeof m2 !== "object" || m2 === null) return;
  return m2;
}
function isDeferredFunction(value) {
  return getMarker(value)?.kind === "DeferredFunction";
}
function isStaleDispatchError(value) {
  return getMarker(value)?.kind === "StaleDispatchError";
}

// node_modules/inngest/helpers/temporal.js
var isTemporalDuration = (input) => {
  try {
    return input[Symbol.toStringTag] === "Temporal.Duration";
  } catch {
    return false;
  }
};
var isTemporalInstant = (input) => {
  try {
    return input[Symbol.toStringTag] === "Temporal.Instant";
  } catch {
    return false;
  }
};
var isTemporalZonedDateTime = (input) => {
  try {
    return input[Symbol.toStringTag] === "Temporal.ZonedDateTime";
  } catch {
    return false;
  }
};
var getISOString = (time) => {
  if (typeof time === "string") return new Date(time).toISOString();
  if (time instanceof Date) return time.toISOString();
  if (isTemporalZonedDateTime(time)) return time.toInstant().toString();
  if (isTemporalInstant(time)) return time.toString();
  throw new TypeError("Invalid date input");
};

// node_modules/inngest/helpers/strings.js
var import_json_stringify_safe2 = __toESM(require_stringify(), 1);
var import_hash = __toESM(require_hash(), 1);
var import_ms = __toESM(require_ms(), 1);

// node_modules/temporal-polyfill/chunks/internal.js
function clampProp(e2, n2, t2, o2, r2) {
  return clampEntity(n2, getDefinedProp(e2, n2), t2, o2, r2);
}
function clampEntity(e2, n2, t2, o2, r2, i2) {
  const a2 = clampNumber(n2, t2, o2);
  if (r2 && n2 !== a2) {
    throw new RangeError(numberOutOfRange(e2, n2, t2, o2, i2));
  }
  return a2;
}
function getDefinedProp(e2, n2) {
  const t2 = e2[n2];
  if (void 0 === t2) {
    throw new TypeError(missingField(n2));
  }
  return t2;
}
function z(e2) {
  return null !== e2 && /object|function/.test(typeof e2);
}
function Jn(e2, n2 = Map) {
  const t2 = new n2();
  return (n3, ...o2) => {
    if (t2.has(n3)) {
      return t2.get(n3);
    }
    const r2 = e2(n3, ...o2);
    return t2.set(n3, r2), r2;
  };
}
function D(e2) {
  return p({
    name: e2
  }, 1);
}
function p(e2, n2) {
  return T(((e3) => ({
    value: e3,
    configurable: 1,
    writable: !n2
  })), e2);
}
function O(e2) {
  return T(((e3) => ({
    get: e3,
    configurable: 1
  })), e2);
}
function h(e2) {
  return {
    [Symbol.toStringTag]: {
      value: e2,
      configurable: 1
    }
  };
}
function zipProps(e2, n2) {
  const t2 = {};
  let o2 = e2.length;
  for (const r2 of n2) {
    t2[e2[--o2]] = r2;
  }
  return t2;
}
function T(e2, n2, t2) {
  const o2 = {};
  for (const r2 in n2) {
    o2[r2] = e2(n2[r2], r2, t2);
  }
  return o2;
}
function b(e2, n2, t2) {
  const o2 = {};
  for (let r2 = 0; r2 < n2.length; r2++) {
    const i2 = n2[r2];
    o2[i2] = e2(i2, r2, t2);
  }
  return o2;
}
function remapProps(e2, n2, t2) {
  const o2 = {};
  for (let r2 = 0; r2 < e2.length; r2++) {
    o2[n2[r2]] = t2[e2[r2]];
  }
  return o2;
}
function Vn(e2, n2) {
  const t2 = {};
  for (const o2 of e2) {
    t2[o2] = n2[o2];
  }
  return t2;
}
function V(e2, n2) {
  const t2 = {};
  for (const o2 in n2) {
    e2.has(o2) || (t2[o2] = n2[o2]);
  }
  return t2;
}
function nn(e2) {
  e2 = {
    ...e2
  };
  const n2 = Object.keys(e2);
  for (const t2 of n2) {
    void 0 === e2[t2] && delete e2[t2];
  }
  return e2;
}
function C(e2, n2) {
  for (const t2 of n2) {
    if (!(t2 in e2)) {
      return 0;
    }
  }
  return 1;
}
function allPropsEqual(e2, n2, t2) {
  for (const o2 of e2) {
    if (n2[o2] !== t2[o2]) {
      return 0;
    }
  }
  return 1;
}
function zeroOutProps(e2, n2, t2) {
  const o2 = {
    ...t2
  };
  for (let t3 = 0; t3 < n2; t3++) {
    o2[e2[t3]] = 0;
  }
  return o2;
}
function E(e2, ...n2) {
  return (...t2) => e2(...n2, ...t2);
}
function capitalize(e2) {
  return e2[0].toUpperCase() + e2.substring(1);
}
function sortStrings(e2) {
  return e2.slice().sort();
}
function padNumber(e2, n2) {
  return String(n2).padStart(e2, "0");
}
function compareNumbers(e2, n2) {
  return Math.sign(e2 - n2);
}
function clampNumber(e2, n2, t2) {
  return Math.min(Math.max(e2, n2), t2);
}
function divModFloor(e2, n2) {
  return [Math.floor(e2 / n2), modFloor(e2, n2)];
}
function modFloor(e2, n2) {
  return (e2 % n2 + n2) % n2;
}
function divModTrunc(e2, n2) {
  return [divTrunc(e2, n2), modTrunc(e2, n2)];
}
function divTrunc(e2, n2) {
  return Math.trunc(e2 / n2) || 0;
}
function modTrunc(e2, n2) {
  return e2 % n2 || 0;
}
function hasHalf(e2) {
  return 0.5 === Math.abs(e2 % 1);
}
function givenFieldsToBigNano(e2, n2, t2) {
  let o2 = 0, r2 = 0;
  for (let i3 = 0; i3 <= n2; i3++) {
    const n3 = e2[t2[i3]], a3 = Xr[i3], s2 = Qr / a3, [c2, u2] = divModTrunc(n3, s2);
    o2 += u2 * a3, r2 += c2;
  }
  const [i2, a2] = divModTrunc(o2, Qr);
  return [r2 + i2, a2];
}
function nanoToGivenFields(e2, n2, t2) {
  const o2 = {};
  for (let r2 = n2; r2 >= 0; r2--) {
    const n3 = Xr[r2];
    o2[t2[r2]] = divTrunc(e2, n3), e2 = modTrunc(e2, n3);
  }
  return o2;
}
function un(e2) {
  return e2 === X ? si : [];
}
function cn(e2) {
  return e2 === X ? li : [];
}
function ln(e2) {
  return e2 === X ? ["year", "day"] : [];
}
function l(e2) {
  if (void 0 !== e2) {
    return m(e2);
  }
}
function S(e2) {
  if (void 0 !== e2) {
    return d(e2);
  }
}
function c(e2) {
  if (void 0 !== e2) {
    return u(e2);
  }
}
function d(e2) {
  return requireNumberIsPositive(u(e2));
}
function u(e2) {
  return requireNumberIsInteger(Mi(e2));
}
function on(e2) {
  if (null == e2) {
    throw new TypeError("Cannot be null or undefined");
  }
  return e2;
}
function requirePropDefined(e2, n2) {
  if (null == n2) {
    throw new RangeError(missingField(e2));
  }
  return n2;
}
function de(e2) {
  if (!z(e2)) {
    throw new TypeError(hr);
  }
  return e2;
}
function requireType(e2, n2, t2 = e2) {
  if (typeof n2 !== e2) {
    throw new TypeError(invalidEntity(t2, n2));
  }
  return n2;
}
function requireNumberIsInteger(e2, n2 = "number") {
  if (!Number.isInteger(e2)) {
    throw new RangeError(expectedInteger(n2, e2));
  }
  return e2 || 0;
}
function requireNumberIsPositive(e2, n2 = "number") {
  if (e2 <= 0) {
    throw new RangeError(expectedPositive(n2, e2));
  }
  return e2;
}
function toString(e2) {
  if ("symbol" == typeof e2) {
    throw new TypeError(pr);
  }
  return String(e2);
}
function toStringViaPrimitive(e2, n2) {
  return z(e2) ? String(e2) : m(e2, n2);
}
function toBigInt(e2) {
  if ("string" == typeof e2) {
    return BigInt(e2);
  }
  if ("bigint" != typeof e2) {
    throw new TypeError(invalidBigInt(e2));
  }
  return e2;
}
function toNumber(e2, n2 = "number") {
  if ("bigint" == typeof e2) {
    throw new TypeError(forbiddenBigIntToNumber(n2));
  }
  if (e2 = Number(e2), !Number.isFinite(e2)) {
    throw new RangeError(expectedFinite(n2, e2));
  }
  return e2;
}
function toInteger(e2, n2) {
  return Math.trunc(toNumber(e2, n2)) || 0;
}
function toStrictInteger(e2, n2) {
  return requireNumberIsInteger(toNumber(e2, n2), n2);
}
function toPositiveInteger(e2, n2) {
  return requireNumberIsPositive(toInteger(e2, n2), n2);
}
function createBigNano(e2, n2) {
  let [t2, o2] = divModTrunc(n2, Qr), r2 = e2 + t2;
  const i2 = Math.sign(r2);
  return i2 && i2 === -Math.sign(o2) && (r2 -= i2, o2 += i2 * Qr), [r2, o2];
}
function addBigNanos(e2, n2, t2 = 1) {
  return createBigNano(e2[0] + n2[0] * t2, e2[1] + n2[1] * t2);
}
function moveBigNano(e2, n2) {
  return createBigNano(e2[0], e2[1] + n2);
}
function re(e2, n2) {
  return addBigNanos(n2, e2, -1);
}
function te(e2, n2) {
  return compareNumbers(e2[0], n2[0]) || compareNumbers(e2[1], n2[1]);
}
function bigNanoOutside(e2, n2, t2) {
  return -1 === te(e2, n2) || 1 === te(e2, t2);
}
function bigIntToBigNano(e2, n2 = 1) {
  const t2 = BigInt(Qr / n2);
  return [Number(e2 / t2), Number(e2 % t2) * n2];
}
function he(e2, n2 = 1) {
  const t2 = Qr / n2, [o2, r2] = divModTrunc(e2, t2);
  return [o2, r2 * n2];
}
function bigNanoToBigInt(e2, n2 = 1) {
  const [t2, o2] = e2, r2 = Math.floor(o2 / n2), i2 = Qr / n2;
  return BigInt(t2) * BigInt(i2) + BigInt(r2);
}
function oe(e2, n2 = 1, t2) {
  const [o2, r2] = e2, [i2, a2] = divModTrunc(r2, n2);
  return o2 * (Qr / n2) + (i2 + (t2 ? a2 / n2 : 0));
}
function divModBigNano(e2, n2, t2 = divModFloor) {
  const [o2, r2] = e2, [i2, a2] = t2(r2, n2);
  return [o2 * (Qr / n2) + i2, a2];
}
function hashIntlFormatParts(e2, n2) {
  const t2 = e2.formatToParts(n2), o2 = {};
  for (const e3 of t2) {
    o2[e3.type] = e3.value;
  }
  return o2;
}
function checkIsoYearMonthInBounds(e2) {
  return clampProp(e2, "isoYear", Li, Ai, 1), e2.isoYear === Li ? clampProp(e2, "isoMonth", 4, 12, 1) : e2.isoYear === Ai && clampProp(e2, "isoMonth", 1, 9, 1), e2;
}
function checkIsoDateInBounds(e2) {
  return checkIsoDateTimeInBounds({
    ...e2,
    ...Dt,
    isoHour: 12
  }), e2;
}
function checkIsoDateTimeInBounds(e2) {
  const n2 = clampProp(e2, "isoYear", Li, Ai, 1), t2 = n2 === Li ? 1 : n2 === Ai ? -1 : 0;
  return t2 && checkEpochNanoInBounds(isoToEpochNano({
    ...e2,
    isoDay: e2.isoDay + t2,
    isoNanosecond: e2.isoNanosecond - t2
  })), e2;
}
function checkEpochNanoInBounds(e2) {
  if (!e2 || bigNanoOutside(e2, Ui, qi)) {
    throw new RangeError(Cr);
  }
  return e2;
}
function isoTimeFieldsToNano(e2) {
  return givenFieldsToBigNano(e2, 5, j)[1];
}
function nanoToIsoTimeAndDay(e2) {
  const [n2, t2] = divModFloor(e2, Qr);
  return [nanoToGivenFields(t2, 5, j), n2];
}
function epochNanoToSec(e2) {
  return epochNanoToSecMod(e2)[0];
}
function epochNanoToSecMod(e2) {
  return divModBigNano(e2, _r);
}
function isoToEpochMilli(e2) {
  return isoArgsToEpochMilli(e2.isoYear, e2.isoMonth, e2.isoDay, e2.isoHour, e2.isoMinute, e2.isoSecond, e2.isoMillisecond);
}
function isoToEpochNano(e2) {
  const n2 = isoToEpochMilli(e2);
  if (void 0 !== n2) {
    const [t2, o2] = divModTrunc(n2, Gr);
    return [t2, o2 * be + (e2.isoMicrosecond || 0) * Vr + (e2.isoNanosecond || 0)];
  }
}
function isoToEpochNanoWithOffset(e2, n2) {
  const [t2, o2] = nanoToIsoTimeAndDay(isoTimeFieldsToNano(e2) - n2);
  return checkEpochNanoInBounds(isoToEpochNano({
    ...e2,
    isoDay: e2.isoDay + o2,
    ...t2
  }));
}
function isoArgsToEpochSec(...e2) {
  return isoArgsToEpochMilli(...e2) / Hr;
}
function isoArgsToEpochMilli(...e2) {
  const [n2, t2] = isoToLegacyDate(...e2), o2 = n2.valueOf();
  if (!isNaN(o2)) {
    return o2 - t2 * Gr;
  }
}
function isoToLegacyDate(e2, n2 = 1, t2 = 1, o2 = 0, r2 = 0, i2 = 0, a2 = 0) {
  const s2 = e2 === Li ? 1 : e2 === Ai ? -1 : 0, c2 = /* @__PURE__ */ new Date();
  return c2.setUTCHours(o2, r2, i2, a2), c2.setUTCFullYear(e2, n2 - 1, t2 + s2), [c2, s2];
}
function Ie(e2, n2) {
  let [t2, o2] = moveBigNano(e2, n2);
  o2 < 0 && (o2 += Qr, t2 -= 1);
  const [r2, i2] = divModFloor(o2, be), [a2, s2] = divModFloor(i2, Vr);
  return epochMilliToIso(t2 * Gr + r2, a2, s2);
}
function epochMilliToIso(e2, n2 = 0, t2 = 0) {
  const o2 = Math.ceil(Math.max(0, Math.abs(e2) - zi) / Gr) * Math.sign(e2), r2 = new Date(e2 - o2 * Gr);
  return zipProps(wi, [r2.getUTCFullYear(), r2.getUTCMonth() + 1, r2.getUTCDate() + o2, r2.getUTCHours(), r2.getUTCMinutes(), r2.getUTCSeconds(), r2.getUTCMilliseconds(), n2, t2]);
}
function computeIsoDateParts(e2) {
  return [e2.isoYear, e2.isoMonth, e2.isoDay];
}
function computeIsoMonthsInYear() {
  return xi;
}
function computeIsoDaysInMonth(e2, n2) {
  switch (n2) {
    case 2:
      return computeIsoInLeapYear(e2) ? 29 : 28;
    case 4:
    case 6:
    case 9:
    case 11:
      return 30;
  }
  return 31;
}
function computeIsoDaysInYear(e2) {
  return computeIsoInLeapYear(e2) ? 366 : 365;
}
function computeIsoInLeapYear(e2) {
  return e2 % 4 == 0 && (e2 % 100 != 0 || e2 % 400 == 0);
}
function computeIsoDayOfWeek(e2) {
  const [n2, t2] = isoToLegacyDate(e2.isoYear, e2.isoMonth, e2.isoDay);
  return modFloor(n2.getUTCDay() - t2, 7) || 7;
}
function computeGregoryEraParts({ isoYear: e2 }) {
  return e2 < 1 ? ["bce", 1 - e2] : ["ce", e2];
}
function computeJapaneseEraParts(e2) {
  const n2 = isoToEpochMilli(e2);
  if (n2 < $i) {
    return computeGregoryEraParts(e2);
  }
  const t2 = hashIntlFormatParts(La(Ti), n2), { era: o2, eraYear: r2 } = parseIntlYear(t2, Ti);
  return [o2, r2];
}
function checkIsoDateTimeFields(e2) {
  return checkIsoDateFields(e2), constrainIsoTimeFields(e2, 1), e2;
}
function checkIsoDateFields(e2) {
  return constrainIsoDateFields(e2, 1), e2;
}
function isIsoDateFieldsValid(e2) {
  return allPropsEqual(Oi, e2, constrainIsoDateFields(e2));
}
function constrainIsoDateFields(e2, n2) {
  const { isoYear: t2 } = e2, o2 = clampProp(e2, "isoMonth", 1, computeIsoMonthsInYear(), n2);
  return {
    isoYear: t2,
    isoMonth: o2,
    isoDay: clampProp(e2, "isoDay", 1, computeIsoDaysInMonth(t2, o2), n2)
  };
}
function constrainIsoTimeFields(e2, n2) {
  return zipProps(j, [clampProp(e2, "isoHour", 0, 23, n2), clampProp(e2, "isoMinute", 0, 59, n2), clampProp(e2, "isoSecond", 0, 59, n2), clampProp(e2, "isoMillisecond", 0, 999, n2), clampProp(e2, "isoMicrosecond", 0, 999, n2), clampProp(e2, "isoNanosecond", 0, 999, n2)]);
}
function H(e2) {
  return void 0 === e2 ? 0 : ua(de(e2));
}
function wn(e2, n2 = 0) {
  e2 = normalizeOptions(e2);
  const t2 = la(e2), o2 = fa(e2, n2);
  return [ua(e2), o2, t2];
}
function ve(e2) {
  return la(normalizeOptions(e2));
}
function _t(e2) {
  return e2 = normalizeOptions(e2), sa(e2, 9, 6, 1);
}
function refineDiffOptions(e2, n2, t2, o2 = 9, r2 = 0, i2 = 4) {
  n2 = normalizeOptions(n2);
  let a2 = sa(n2, o2, r2), s2 = parseRoundingIncInteger(n2), c2 = ha(n2, i2);
  const u2 = aa(n2, o2, r2, 1);
  return null == a2 ? a2 = Math.max(t2, u2) : checkLargestSmallestUnit(a2, u2), s2 = refineRoundingInc(s2, u2, 1), e2 && (c2 = ((e3) => e3 < 4 ? (e3 + 2) % 4 : e3)(c2)), [a2, u2, s2, c2];
}
function refineRoundingOptions(e2, n2 = 6, t2) {
  let o2 = parseRoundingIncInteger(e2 = normalizeOptionsOrString(e2, Hi));
  const r2 = ha(e2, 7);
  let i2 = aa(e2, n2);
  return i2 = requirePropDefined(Hi, i2), o2 = refineRoundingInc(o2, i2, void 0, t2), [i2, o2, r2];
}
function refineDateDisplayOptions(e2) {
  return da(normalizeOptions(e2));
}
function refineTimeDisplayOptions(e2, n2) {
  return refineTimeDisplayTuple(normalizeOptions(e2), n2);
}
function refineTimeDisplayTuple(e2, n2 = 4) {
  const t2 = refineSubsecDigits(e2);
  return [ha(e2, 4), ...refineSmallestUnitAndSubsecDigits(aa(e2, n2), t2)];
}
function refineSmallestUnitAndSubsecDigits(e2, n2) {
  return null != e2 ? [Xr[e2], e2 < 4 ? 9 - 3 * e2 : -1] : [void 0 === n2 ? 1 : 10 ** (9 - n2), n2];
}
function parseRoundingIncInteger(e2) {
  const n2 = e2[_i];
  return void 0 === n2 ? 1 : toInteger(n2, _i);
}
function refineRoundingInc(e2, n2, t2, o2) {
  const r2 = o2 ? Qr : Xr[n2 + 1];
  if (r2) {
    const t3 = Xr[n2];
    if (r2 % ((e2 = clampEntity(_i, e2, 1, r2 / t3 - (o2 ? 0 : 1), 1)) * t3)) {
      throw new RangeError(invalidEntity(_i, e2));
    }
  } else {
    e2 = clampEntity(_i, e2, 1, t2 ? 10 ** 9 : 1, 1);
  }
  return e2;
}
function refineSubsecDigits(e2) {
  let n2 = e2[Ji];
  if (void 0 !== n2) {
    if ("number" != typeof n2) {
      if ("auto" === toString(n2)) {
        return;
      }
      throw new RangeError(invalidEntity(Ji, n2));
    }
    n2 = clampEntity(Ji, Math.floor(n2), 0, 9, 1);
  }
  return n2;
}
function normalizeOptions(e2) {
  return void 0 === e2 ? {} : de(e2);
}
function normalizeOptionsOrString(e2, n2) {
  return "string" == typeof e2 ? {
    [n2]: e2
  } : de(e2);
}
function U(e2) {
  if (void 0 !== e2) {
    if (z(e2)) {
      return Object.assign(/* @__PURE__ */ Object.create(null), e2);
    }
    throw new TypeError(hr);
  }
}
function overrideOverflowOptions(e2, n2) {
  return e2 && Object.assign(/* @__PURE__ */ Object.create(null), e2, {
    overflow: Xi[n2]
  });
}
function refineUnitOption(e2, n2, t2 = 9, o2 = 0, r2) {
  let i2 = n2[e2];
  if (void 0 === i2) {
    return r2 ? o2 : void 0;
  }
  if (i2 = toString(i2), "auto" === i2) {
    return r2 ? o2 : null;
  }
  let a2 = $r[i2];
  if (void 0 === a2 && (a2 = Ei[i2]), void 0 === a2) {
    throw new RangeError(invalidChoice(e2, i2, $r));
  }
  return clampEntity(e2, a2, o2, t2, 1, Et), a2;
}
function refineChoiceOption(e2, n2, t2, o2 = 0) {
  const r2 = t2[e2];
  if (void 0 === r2) {
    return o2;
  }
  const i2 = toString(r2), a2 = n2[i2];
  if (void 0 === a2) {
    throw new RangeError(invalidChoice(e2, i2, n2));
  }
  return a2;
}
function checkLargestSmallestUnit(e2, n2) {
  if (n2 > e2) {
    throw new RangeError(Ar);
  }
}
function _(e2) {
  return {
    branding: Oe,
    epochNanoseconds: e2
  };
}
function Yn(e2, n2, t2) {
  return {
    branding: Te,
    calendar: t2,
    timeZone: n2,
    epochNanoseconds: e2
  };
}
function ee(e2, n2 = e2.calendar) {
  return {
    branding: We,
    calendar: n2,
    ...Vn(Yi, e2)
  };
}
function v(e2, n2 = e2.calendar) {
  return {
    branding: J,
    calendar: n2,
    ...Vn(Bi, e2)
  };
}
function createPlainYearMonthSlots(e2, n2 = e2.calendar) {
  return {
    branding: L,
    calendar: n2,
    ...Vn(Bi, e2)
  };
}
function createPlainMonthDaySlots(e2, n2 = e2.calendar) {
  return {
    branding: q,
    calendar: n2,
    ...Vn(Bi, e2)
  };
}
function Ge(e2) {
  return {
    branding: xe,
    ...Vn(ki, e2)
  };
}
function Vt(e2) {
  return {
    branding: qt,
    sign: computeDurationSign(e2),
    ...Vn(Ni, e2)
  };
}
function M(e2) {
  return epochNanoToSec(e2.epochNanoseconds);
}
function y(e2) {
  return divModBigNano(e2.epochNanoseconds, be)[0];
}
function N(e2) {
  return bigNanoToBigInt(e2.epochNanoseconds, Vr);
}
function B(e2) {
  return bigNanoToBigInt(e2.epochNanoseconds);
}
function extractEpochNano(e2) {
  return e2.epochNanoseconds;
}
function I(e2) {
  return "string" == typeof e2 ? e2 : m(e2.id);
}
function isIdLikeEqual(e2, n2) {
  return e2 === n2 || I(e2) === I(n2);
}
function Ut(e2, n2, t2, o2, r2) {
  const i2 = getMaxDurationUnit(o2), [a2, s2] = ((e3, n3) => {
    const t3 = n3((e3 = normalizeOptionsOrString(e3, Vi))[Ki]);
    let o3 = ca(e3);
    return o3 = requirePropDefined(Vi, o3), [o3, t3];
  })(r2, e2);
  if (isUniformUnit(Math.max(a2, i2), s2)) {
    return totalDayTimeDuration(o2, a2);
  }
  if (!s2) {
    throw new RangeError(zr);
  }
  const [c2, u2, l2] = createMarkerSystem(n2, t2, s2), f2 = createMarkerToEpochNano(l2), d2 = createMoveMarker(l2), m2 = createDiffMarkers(l2), p2 = d2(u2, c2, o2), h2 = m2(u2, c2, p2, a2);
  return isUniformUnit(a2, s2) ? totalDayTimeDuration(h2, a2) : ((e3, n3, t3, o3, r3, i3, a3) => {
    const s3 = computeDurationSign(e3), [c3, u3] = clampRelativeDuration(o3, bi(t3, e3), t3, s3, r3, i3, a3), l3 = computeEpochNanoFrac(n3, c3, u3);
    return e3[F[t3]] + l3 * s3;
  })(h2, f2(p2), a2, u2, c2, f2, d2);
}
function totalDayTimeDuration(e2, n2) {
  return oe(durationFieldsToBigNano(e2), Xr[n2], 1);
}
function clampRelativeDuration(e2, n2, t2, o2, r2, i2, a2) {
  const s2 = F[t2], c2 = {
    ...n2,
    [s2]: n2[s2] + o2
  }, u2 = a2(e2, r2, n2), l2 = a2(e2, r2, c2);
  return [i2(u2), i2(l2)];
}
function computeEpochNanoFrac(e2, n2, t2) {
  const o2 = oe(re(n2, t2));
  if (!o2) {
    throw new RangeError(vr);
  }
  return oe(re(n2, e2)) / o2;
}
function ce(e2, n2) {
  const [t2, o2, r2] = refineRoundingOptions(n2, 5, 1);
  return _(roundBigNano(e2.epochNanoseconds, t2, o2, r2, 1));
}
function Pn(e2, n2, t2) {
  let { epochNanoseconds: o2, timeZone: r2, calendar: i2 } = n2;
  const [a2, s2, c2] = refineRoundingOptions(t2);
  if (0 === a2 && 1 === s2) {
    return n2;
  }
  const u2 = e2(r2);
  if (6 === a2) {
    o2 = ((e3, n3, t3, o3) => {
      const r3 = fn(t3, n3), [i3, a3] = e3(r3), s3 = t3.epochNanoseconds, c3 = we(n3, i3), u3 = we(n3, a3);
      if (bigNanoOutside(s3, c3, u3)) {
        throw new RangeError(vr);
      }
      return roundWithMode(computeEpochNanoFrac(s3, c3, u3), o3) ? u3 : c3;
    })(computeDayInterval, u2, n2, c2);
  } else {
    const e3 = u2.getOffsetNanosecondsFor(o2);
    o2 = getMatchingInstantFor(u2, roundDateTime(Ie(o2, e3), a2, s2, c2), e3, 2, 0, 1);
  }
  return Yn(o2, r2, i2);
}
function dt(e2, n2) {
  return ee(roundDateTime(e2, ...refineRoundingOptions(n2)), e2.calendar);
}
function Ee(e2, n2) {
  const [t2, o2, r2] = refineRoundingOptions(n2, 5);
  var i2;
  return Ge((i2 = r2, roundTimeToNano(e2, computeNanoInc(t2, o2), i2)[0]));
}
function dn(e2, n2) {
  const t2 = e2(n2.timeZone), o2 = fn(n2, t2), [r2, i2] = computeDayInterval(o2), a2 = oe(re(we(t2, r2), we(t2, i2)), Kr, 1);
  if (a2 <= 0) {
    throw new RangeError(vr);
  }
  return a2;
}
function Cn(e2, n2) {
  const { timeZone: t2, calendar: o2 } = n2, r2 = ((e3, n3, t3) => we(n3, e3(fn(t3, n3))))(computeDayFloor, e2(t2), n2);
  return Yn(r2, t2, o2);
}
function roundDateTime(e2, n2, t2, o2) {
  return roundDateTimeToNano(e2, computeNanoInc(n2, t2), o2);
}
function roundDateTimeToNano(e2, n2, t2) {
  const [o2, r2] = roundTimeToNano(e2, n2, t2);
  return checkIsoDateTimeInBounds({
    ...moveByDays(e2, r2),
    ...o2
  });
}
function roundTimeToNano(e2, n2, t2) {
  return nanoToIsoTimeAndDay(roundByInc(isoTimeFieldsToNano(e2), n2, t2));
}
function roundToMinute(e2) {
  return roundByInc(e2, Jr, 7);
}
function computeNanoInc(e2, n2) {
  return Xr[e2] * n2;
}
function computeDayInterval(e2) {
  const n2 = computeDayFloor(e2);
  return [n2, moveByDays(n2, 1)];
}
function computeDayFloor(e2) {
  return Ci(6, e2);
}
function roundDayTimeDurationByInc(e2, n2, t2) {
  const o2 = Math.min(getMaxDurationUnit(e2), 6);
  return nanoToDurationDayTimeFields(roundBigNanoByInc(durationFieldsToBigNano(e2, o2), n2, t2), o2);
}
function roundRelativeDuration(e2, n2, t2, o2, r2, i2, a2, s2, c2, u2) {
  if (0 === o2 && 1 === r2) {
    return e2;
  }
  const l2 = isUniformUnit(o2, s2) ? isZonedEpochSlots(s2) && o2 < 6 && t2 >= 6 ? nudgeZonedTimeDuration : nudgeDayTimeDuration : nudgeRelativeDuration;
  let [f2, d2, m2] = l2(e2, n2, t2, o2, r2, i2, a2, s2, c2, u2);
  return m2 && 7 !== o2 && (f2 = ((e3, n3, t3, o3, r3, i3, a3, s3) => {
    const c3 = computeDurationSign(e3);
    for (let u3 = o3 + 1; u3 <= t3; u3++) {
      if (7 === u3 && 7 !== t3) {
        continue;
      }
      const o4 = bi(u3, e3);
      o4[F[u3]] += c3;
      const l3 = oe(re(a3(s3(r3, i3, o4)), n3));
      if (l3 && Math.sign(l3) !== c3) {
        break;
      }
      e3 = o4;
    }
    return e3;
  })(f2, d2, t2, Math.max(6, o2), a2, s2, c2, u2)), f2;
}
function roundBigNano(e2, n2, t2, o2, r2) {
  if (6 === n2) {
    const n3 = ((e3) => e3[0] + e3[1] / Qr)(e2);
    return [roundByInc(n3, t2, o2), 0];
  }
  return roundBigNanoByInc(e2, computeNanoInc(n2, t2), o2, r2);
}
function roundBigNanoByInc(e2, n2, t2, o2) {
  let [r2, i2] = e2;
  o2 && i2 < 0 && (i2 += Qr, r2 -= 1);
  const [a2, s2] = divModFloor(roundByInc(i2, n2, t2), Qr);
  return createBigNano(r2 + a2, s2);
}
function roundByInc(e2, n2, t2) {
  return roundWithMode(e2 / n2, t2) * n2;
}
function roundWithMode(e2, n2) {
  return ga[n2](e2);
}
function nudgeDayTimeDuration(e2, n2, t2, o2, r2, i2) {
  const a2 = computeDurationSign(e2), s2 = durationFieldsToBigNano(e2), c2 = roundBigNano(s2, o2, r2, i2), u2 = re(s2, c2), l2 = Math.sign(c2[0] - s2[0]) === a2, f2 = nanoToDurationDayTimeFields(c2, Math.min(t2, 6));
  return [{
    ...e2,
    ...f2
  }, addBigNanos(n2, u2), l2];
}
function nudgeZonedTimeDuration(e2, n2, t2, o2, r2, i2, a2, s2, c2, u2) {
  const l2 = computeDurationSign(e2), f2 = oe(durationFieldsToBigNano(e2, 5)), d2 = computeNanoInc(o2, r2);
  let m2 = roundByInc(f2, d2, i2);
  const [p2, h2] = clampRelativeDuration(a2, {
    ...e2,
    ...Fi
  }, 6, l2, s2, c2, u2), g2 = m2 - oe(re(p2, h2));
  let T2 = 0;
  g2 && Math.sign(g2) !== l2 ? n2 = moveBigNano(p2, m2) : (T2 += l2, m2 = roundByInc(g2, d2, i2), n2 = moveBigNano(h2, m2));
  const D2 = nanoToDurationTimeFields(m2);
  return [{
    ...e2,
    ...D2,
    days: e2.days + T2
  }, n2, Boolean(T2)];
}
function nudgeRelativeDuration(e2, n2, t2, o2, r2, i2, a2, s2, c2, u2) {
  const l2 = computeDurationSign(e2), f2 = F[o2], d2 = bi(o2, e2);
  7 === o2 && (e2 = {
    ...e2,
    weeks: e2.weeks + Math.trunc(e2.days / 7)
  });
  const m2 = divTrunc(e2[f2], r2) * r2;
  d2[f2] = m2;
  const [p2, h2] = clampRelativeDuration(a2, d2, o2, r2 * l2, s2, c2, u2), g2 = m2 + computeEpochNanoFrac(n2, p2, h2) * l2 * r2, T2 = roundByInc(g2, r2, i2), D2 = Math.sign(T2 - g2) === l2;
  return d2[f2] = T2, [d2, D2 ? h2 : p2, D2];
}
function me(e2, n2, t2, o2) {
  const [r2, i2, a2, s2] = ((e3) => {
    const n3 = refineTimeDisplayTuple(e3 = normalizeOptions(e3));
    return [e3.timeZone, ...n3];
  })(o2), c2 = void 0 !== r2;
  return ((e3, n3, t3, o3, r3, i3) => {
    t3 = roundBigNanoByInc(t3, r3, o3, 1);
    const a3 = n3.getOffsetNanosecondsFor(t3);
    return formatIsoDateTimeFields(Ie(t3, a3), i3) + (e3 ? Fe(roundToMinute(a3)) : "Z");
  })(c2, n2(c2 ? e2(r2) : Ta), t2.epochNanoseconds, i2, a2, s2);
}
function In(e2, n2, t2) {
  const [o2, r2, i2, a2, s2, c2] = ((e3) => {
    e3 = normalizeOptions(e3);
    const n3 = da(e3), t3 = refineSubsecDigits(e3), o3 = pa(e3), r3 = ha(e3, 4), i3 = aa(e3, 4);
    return [n3, ma(e3), o3, r3, ...refineSmallestUnitAndSubsecDigits(i3, t3)];
  })(t2);
  return ((e3, n3, t3, o3, r3, i3, a3, s3, c3, u2) => {
    o3 = roundBigNanoByInc(o3, c3, s3, 1);
    const l2 = e3(t3).getOffsetNanosecondsFor(o3);
    return formatIsoDateTimeFields(Ie(o3, l2), u2) + Fe(roundToMinute(l2), a3) + ((e4, n4) => 1 !== n4 ? "[" + (2 === n4 ? "!" : "") + I(e4) + "]" : "")(t3, i3) + formatCalendar(n3, r3);
  })(e2, n2.calendar, n2.timeZone, n2.epochNanoseconds, o2, r2, i2, a2, s2, c2);
}
function Tt(e2, n2) {
  const [t2, o2, r2, i2] = ((e3) => (e3 = normalizeOptions(e3), [da(e3), ...refineTimeDisplayTuple(e3)]))(n2);
  return a2 = e2.calendar, s2 = t2, c2 = i2, formatIsoDateTimeFields(roundDateTimeToNano(e2, r2, o2), c2) + formatCalendar(a2, s2);
  var a2, s2, c2;
}
function yt(e2, n2) {
  return t2 = e2.calendar, o2 = e2, r2 = refineDateDisplayOptions(n2), formatIsoDateFields(o2) + formatCalendar(t2, r2);
  var t2, o2, r2;
}
function et(e2, n2) {
  return formatDateLikeIso(e2.calendar, formatIsoYearMonthFields, e2, refineDateDisplayOptions(n2));
}
function W(e2, n2) {
  return formatDateLikeIso(e2.calendar, formatIsoMonthDayFields, e2, refineDateDisplayOptions(n2));
}
function qe(e2, n2) {
  const [t2, o2, r2] = refineTimeDisplayOptions(n2);
  return i2 = r2, formatIsoTimeFields(roundTimeToNano(e2, o2, t2)[0], i2);
  var i2;
}
function zt(e2, n2) {
  const [t2, o2, r2] = refineTimeDisplayOptions(n2, 3);
  return o2 > 1 && (e2 = {
    ...e2,
    ...roundDayTimeDurationByInc(e2, o2, t2)
  }), ((e3, n3) => {
    const { sign: t3 } = e3, o3 = -1 === t3 ? negateDurationFields(e3) : e3, { hours: r3, minutes: i2 } = o3, [a2, s2] = divModBigNano(durationFieldsToBigNano(o3, 3), _r, divModTrunc);
    checkDurationTimeUnit(a2);
    const c2 = formatSubsecNano(s2, n3), u2 = n3 >= 0 || !t3 || c2;
    return (t3 < 0 ? "-" : "") + "P" + formatDurationFragments({
      Y: formatDurationNumber(o3.years),
      M: formatDurationNumber(o3.months),
      W: formatDurationNumber(o3.weeks),
      D: formatDurationNumber(o3.days)
    }) + (r3 || i2 || a2 || u2 ? "T" + formatDurationFragments({
      H: formatDurationNumber(r3),
      M: formatDurationNumber(i2),
      S: formatDurationNumber(a2, u2) + c2
    }) : "");
  })(e2, r2);
}
function formatDateLikeIso(e2, n2, t2, o2) {
  const r2 = I(e2), i2 = o2 > 1 || 0 === o2 && r2 !== X;
  return 1 === o2 ? r2 === X ? n2(t2) : formatIsoDateFields(t2) : i2 ? formatIsoDateFields(t2) + formatCalendarId(r2, 2 === o2) : n2(t2);
}
function formatDurationFragments(e2) {
  const n2 = [];
  for (const t2 in e2) {
    const o2 = e2[t2];
    o2 && n2.push(o2, t2);
  }
  return n2.join("");
}
function formatIsoDateTimeFields(e2, n2) {
  return formatIsoDateFields(e2) + "T" + formatIsoTimeFields(e2, n2);
}
function formatIsoDateFields(e2) {
  return formatIsoYearMonthFields(e2) + "-" + xr(e2.isoDay);
}
function formatIsoYearMonthFields(e2) {
  const { isoYear: n2 } = e2;
  return (n2 < 0 || n2 > 9999 ? getSignStr(n2) + padNumber(6, Math.abs(n2)) : padNumber(4, n2)) + "-" + xr(e2.isoMonth);
}
function formatIsoMonthDayFields(e2) {
  return xr(e2.isoMonth) + "-" + xr(e2.isoDay);
}
function formatIsoTimeFields(e2, n2) {
  const t2 = [xr(e2.isoHour), xr(e2.isoMinute)];
  return -1 !== n2 && t2.push(xr(e2.isoSecond) + ((e3, n3, t3, o2) => formatSubsecNano(e3 * be + n3 * Vr + t3, o2))(e2.isoMillisecond, e2.isoMicrosecond, e2.isoNanosecond, n2)), t2.join(":");
}
function Fe(e2, n2 = 0) {
  if (1 === n2) {
    return "";
  }
  const [t2, o2] = divModFloor(Math.abs(e2), Kr), [r2, i2] = divModFloor(o2, Jr), [a2, s2] = divModFloor(i2, _r);
  return getSignStr(e2) + xr(t2) + ":" + xr(r2) + (a2 || s2 ? ":" + xr(a2) + formatSubsecNano(s2) : "");
}
function formatCalendar(e2, n2) {
  if (1 !== n2) {
    const t2 = I(e2);
    if (n2 > 1 || 0 === n2 && t2 !== X) {
      return formatCalendarId(t2, 2 === n2);
    }
  }
  return "";
}
function formatCalendarId(e2, n2) {
  return "[" + (n2 ? "!" : "") + "u-ca=" + e2 + "]";
}
function formatSubsecNano(e2, n2) {
  let t2 = padNumber(9, e2);
  return t2 = void 0 === n2 ? t2.replace(Na, "") : t2.slice(0, n2), t2 ? "." + t2 : "";
}
function getSignStr(e2) {
  return e2 < 0 ? "-" : "+";
}
function formatDurationNumber(e2, n2) {
  return e2 || n2 ? e2.toLocaleString("fullwide", {
    useGrouping: 0
  }) : "";
}
function _zonedEpochSlotsToIso(e2, n2) {
  const { epochNanoseconds: t2 } = e2, o2 = (n2.getOffsetNanosecondsFor ? n2 : n2(e2.timeZone)).getOffsetNanosecondsFor(t2), r2 = Ie(t2, o2);
  return {
    calendar: e2.calendar,
    ...r2,
    offsetNanoseconds: o2
  };
}
function mn(e2, n2) {
  const t2 = fn(n2, e2);
  return {
    calendar: n2.calendar,
    ...Vn(Yi, t2),
    offset: Fe(t2.offsetNanoseconds),
    timeZone: n2.timeZone
  };
}
function getMatchingInstantFor(e2, n2, t2, o2 = 0, r2 = 0, i2, a2) {
  if (void 0 !== t2 && 1 === o2 && (1 === o2 || a2)) {
    return isoToEpochNanoWithOffset(n2, t2);
  }
  const s2 = e2.getPossibleInstantsFor(n2);
  if (void 0 !== t2 && 3 !== o2) {
    const e3 = ((e4, n3, t3, o3) => {
      const r3 = isoToEpochNano(n3);
      o3 && (t3 = roundToMinute(t3));
      for (const n4 of e4) {
        let e5 = oe(re(n4, r3));
        if (o3 && (e5 = roundToMinute(e5)), e5 === t3) {
          return n4;
        }
      }
    })(s2, n2, t2, i2);
    if (void 0 !== e3) {
      return e3;
    }
    if (0 === o2) {
      throw new RangeError(kr);
    }
  }
  return a2 ? isoToEpochNano(n2) : we(e2, n2, r2, s2);
}
function we(e2, n2, t2 = 0, o2 = e2.getPossibleInstantsFor(n2)) {
  if (1 === o2.length) {
    return o2[0];
  }
  if (1 === t2) {
    throw new RangeError(Yr);
  }
  if (o2.length) {
    return o2[3 === t2 ? 1 : 0];
  }
  const r2 = isoToEpochNano(n2), i2 = ((e3, n3) => {
    const t3 = e3.getOffsetNanosecondsFor(moveBigNano(n3, -Qr));
    return ne(e3.getOffsetNanosecondsFor(moveBigNano(n3, Qr)) - t3);
  })(e2, r2), a2 = i2 * (2 === t2 ? -1 : 1);
  return (o2 = e2.getPossibleInstantsFor(Ie(r2, a2)))[2 === t2 ? 0 : o2.length - 1];
}
function ae(e2) {
  if (Math.abs(e2) >= Qr) {
    throw new RangeError(wr);
  }
  return e2;
}
function ne(e2) {
  if (e2 > Qr) {
    throw new RangeError(Br);
  }
  return e2;
}
function se(e2, n2, t2) {
  return _(checkEpochNanoInBounds(addBigNanos(n2.epochNanoseconds, ((e3) => {
    if (durationHasDateParts(e3)) {
      throw new RangeError(qr);
    }
    return durationFieldsToBigNano(e3, 5);
  })(e2 ? negateDurationFields(t2) : t2))));
}
function hn(e2, n2, t2, o2, r2, i2 = /* @__PURE__ */ Object.create(null)) {
  const a2 = n2(o2.timeZone), s2 = e2(o2.calendar);
  return {
    ...o2,
    ...moveZonedEpochs(a2, s2, o2, t2 ? negateDurationFields(r2) : r2, i2)
  };
}
function ct(e2, n2, t2, o2, r2 = /* @__PURE__ */ Object.create(null)) {
  const { calendar: i2 } = t2;
  return ee(moveDateTime(e2(i2), t2, n2 ? negateDurationFields(o2) : o2, r2), i2);
}
function bt(e2, n2, t2, o2, r2) {
  const { calendar: i2 } = t2;
  return v(moveDate(e2(i2), t2, n2 ? negateDurationFields(o2) : o2, r2), i2);
}
function Qe(e2, n2, t2, o2, r2 = /* @__PURE__ */ Object.create(null)) {
  const i2 = t2.calendar, a2 = e2(i2);
  let s2 = moveToDayOfMonthUnsafe(a2, t2);
  n2 && (o2 = xt(o2)), o2.sign < 0 && (s2 = a2.dateAdd(s2, {
    ...Si,
    months: 1
  }), s2 = moveByDays(s2, -1));
  const c2 = a2.dateAdd(s2, o2, r2);
  return createPlainYearMonthSlots(moveToDayOfMonthUnsafe(a2, c2), i2);
}
function Ye(e2, n2, t2) {
  return Ge(moveTime(n2, e2 ? negateDurationFields(t2) : t2)[0]);
}
function moveZonedEpochs(e2, n2, t2, o2, r2) {
  const i2 = durationFieldsToBigNano(o2, 5);
  let a2 = t2.epochNanoseconds;
  if (durationHasDateParts(o2)) {
    const s2 = fn(t2, e2);
    a2 = addBigNanos(we(e2, {
      ...moveDate(n2, s2, {
        ...o2,
        ...Fi
      }, r2),
      ...Vn(j, s2)
    }), i2);
  } else {
    a2 = addBigNanos(a2, i2), H(r2);
  }
  return {
    epochNanoseconds: checkEpochNanoInBounds(a2)
  };
}
function moveDateTime(e2, n2, t2, o2) {
  const [r2, i2] = moveTime(n2, t2);
  return checkIsoDateTimeInBounds({
    ...moveDate(e2, n2, {
      ...t2,
      ...Fi,
      days: t2.days + i2
    }, o2),
    ...r2
  });
}
function moveDate(e2, n2, t2, o2) {
  if (t2.years || t2.months || t2.weeks) {
    return e2.dateAdd(n2, t2, o2);
  }
  H(o2);
  const r2 = t2.days + durationFieldsToBigNano(t2, 5)[0];
  return r2 ? checkIsoDateInBounds(moveByDays(n2, r2)) : n2;
}
function moveToDayOfMonthUnsafe(e2, n2, t2 = 1) {
  return moveByDays(n2, t2 - e2.day(n2));
}
function moveTime(e2, n2) {
  const [t2, o2] = durationFieldsToBigNano(n2, 5), [r2, i2] = nanoToIsoTimeAndDay(isoTimeFieldsToNano(e2) + o2);
  return [r2, t2 + i2];
}
function moveByDays(e2, n2) {
  return n2 ? {
    ...e2,
    ...epochMilliToIso(isoToEpochMilli(e2) + n2 * Gr)
  } : e2;
}
function createMarkerSystem(e2, n2, t2) {
  const o2 = e2(t2.calendar);
  return isZonedEpochSlots(t2) ? [t2, o2, n2(t2.timeZone)] : [{
    ...t2,
    ...Dt
  }, o2];
}
function createMarkerToEpochNano(e2) {
  return e2 ? extractEpochNano : isoToEpochNano;
}
function createMoveMarker(e2) {
  return e2 ? E(moveZonedEpochs, e2) : moveDateTime;
}
function createDiffMarkers(e2) {
  return e2 ? E(diffZonedEpochsExact, e2) : diffDateTimesExact;
}
function isZonedEpochSlots(e2) {
  return e2 && e2.epochNanoseconds;
}
function isUniformUnit(e2, n2) {
  return e2 <= 6 - (isZonedEpochSlots(n2) ? 1 : 0);
}
function Wt(e2, n2, t2, o2, r2, i2, a2) {
  const s2 = e2(normalizeOptions(a2).relativeTo), c2 = Math.max(getMaxDurationUnit(r2), getMaxDurationUnit(i2));
  if (isUniformUnit(c2, s2)) {
    return Vt(checkDurationUnits(((e3, n3, t3, o3) => {
      const r3 = addBigNanos(durationFieldsToBigNano(e3), durationFieldsToBigNano(n3), o3 ? -1 : 1);
      if (!Number.isFinite(r3[0])) {
        throw new RangeError(Cr);
      }
      return {
        ...Si,
        ...nanoToDurationDayTimeFields(r3, t3)
      };
    })(r2, i2, c2, o2)));
  }
  if (!s2) {
    throw new RangeError(zr);
  }
  o2 && (i2 = negateDurationFields(i2));
  const [u2, l2, f2] = createMarkerSystem(n2, t2, s2), d2 = createMoveMarker(f2), m2 = createDiffMarkers(f2), p2 = d2(l2, u2, r2);
  return Vt(m2(l2, u2, d2(l2, p2, i2), c2));
}
function Gt(e2, n2, t2, o2, r2) {
  const i2 = getMaxDurationUnit(o2), [a2, s2, c2, u2, l2] = ((e3, n3, t3) => {
    e3 = normalizeOptionsOrString(e3, Hi);
    let o3 = sa(e3);
    const r3 = t3(e3[Ki]);
    let i3 = parseRoundingIncInteger(e3);
    const a3 = ha(e3, 7);
    let s3 = aa(e3);
    if (void 0 === o3 && void 0 === s3) {
      throw new RangeError(Ur);
    }
    return null == s3 && (s3 = 0), null == o3 && (o3 = Math.max(s3, n3)), checkLargestSmallestUnit(o3, s3), i3 = refineRoundingInc(i3, s3, 1), [o3, s3, i3, a3, r3];
  })(r2, i2, e2), f2 = Math.max(i2, a2);
  if (!isZonedEpochSlots(l2) && f2 <= 6) {
    return Vt(checkDurationUnits(((e3, n3, t3, o3, r3) => {
      const i3 = roundBigNano(durationFieldsToBigNano(e3), t3, o3, r3);
      return {
        ...Si,
        ...nanoToDurationDayTimeFields(i3, n3)
      };
    })(o2, a2, s2, c2, u2)));
  }
  if (!l2) {
    throw new RangeError(zr);
  }
  const [d2, m2, p2] = createMarkerSystem(n2, t2, l2), h2 = createMarkerToEpochNano(p2), g2 = createMoveMarker(p2), T2 = createDiffMarkers(p2), D2 = g2(m2, d2, o2);
  let I2 = T2(m2, d2, D2, a2);
  const M2 = o2.sign, N2 = computeDurationSign(I2);
  if (M2 && N2 && M2 !== N2) {
    throw new RangeError(vr);
  }
  return N2 && (I2 = roundRelativeDuration(I2, h2(D2), a2, s2, c2, u2, m2, d2, h2, g2)), Vt(I2);
}
function Rt(e2) {
  return -1 === e2.sign ? xt(e2) : e2;
}
function xt(e2) {
  return Vt(negateDurationFields(e2));
}
function negateDurationFields(e2) {
  const n2 = {};
  for (const t2 of F) {
    n2[t2] = -1 * e2[t2] || 0;
  }
  return n2;
}
function Jt(e2) {
  return !e2.sign;
}
function computeDurationSign(e2, n2 = F) {
  let t2 = 0;
  for (const o2 of n2) {
    const n3 = Math.sign(e2[o2]);
    if (n3) {
      if (t2 && t2 !== n3) {
        throw new RangeError(Rr);
      }
      t2 = n3;
    }
  }
  return t2;
}
function checkDurationUnits(e2) {
  for (const n2 of vi) {
    clampEntity(n2, e2[n2], -ya, ya, 1);
  }
  return checkDurationTimeUnit(oe(durationFieldsToBigNano(e2), _r)), e2;
}
function checkDurationTimeUnit(e2) {
  if (!Number.isSafeInteger(e2)) {
    throw new RangeError(Zr);
  }
}
function durationFieldsToBigNano(e2, n2 = 6) {
  return givenFieldsToBigNano(e2, n2, F);
}
function nanoToDurationDayTimeFields(e2, n2 = 6) {
  const [t2, o2] = e2, r2 = nanoToGivenFields(o2, n2, F);
  if (r2[F[n2]] += t2 * (Qr / Xr[n2]), !Number.isFinite(r2[F[n2]])) {
    throw new RangeError(Cr);
  }
  return r2;
}
function nanoToDurationTimeFields(e2, n2 = 5) {
  return nanoToGivenFields(e2, n2, F);
}
function durationHasDateParts(e2) {
  return Boolean(computeDurationSign(e2, Pi));
}
function getMaxDurationUnit(e2) {
  let n2 = 9;
  for (; n2 > 0 && !e2[F[n2]]; n2--) {
  }
  return n2;
}
function createSplitTuple(e2, n2) {
  return [e2, n2];
}
function computePeriod(e2) {
  const n2 = Math.floor(e2 / Da) * Da;
  return [n2, n2 + Da];
}
function pe(e2) {
  const n2 = parseDateTimeLike(e2 = toStringViaPrimitive(e2));
  if (!n2) {
    throw new RangeError(failedParse(e2));
  }
  let t2;
  if (n2.m) {
    t2 = 0;
  } else {
    if (!n2.offset) {
      throw new RangeError(failedParse(e2));
    }
    t2 = parseOffsetNano(n2.offset);
  }
  return n2.timeZone && parseOffsetNanoMaybe(n2.timeZone, 1), _(isoToEpochNanoWithOffset(checkIsoDateTimeFields(n2), t2));
}
function Xt(e2) {
  const n2 = parseDateTimeLike(m(e2));
  if (!n2) {
    throw new RangeError(failedParse(e2));
  }
  if (n2.timeZone) {
    return finalizeZonedDateTime(n2, n2.offset ? parseOffsetNano(n2.offset) : void 0);
  }
  if (n2.m) {
    throw new RangeError(failedParse(e2));
  }
  return finalizeDate(n2);
}
function Mn(e2, n2) {
  const t2 = parseDateTimeLike(m(e2));
  if (!t2 || !t2.timeZone) {
    throw new RangeError(failedParse(e2));
  }
  const { offset: o2 } = t2, r2 = o2 ? parseOffsetNano(o2) : void 0, [, i2, a2] = wn(n2);
  return finalizeZonedDateTime(t2, r2, i2, a2);
}
function parseOffsetNano(e2) {
  const n2 = parseOffsetNanoMaybe(e2);
  if (void 0 === n2) {
    throw new RangeError(failedParse(e2));
  }
  return n2;
}
function Ct(e2) {
  const n2 = parseDateTimeLike(m(e2));
  if (!n2 || n2.m) {
    throw new RangeError(failedParse(e2));
  }
  return ee(finalizeDateTime(n2));
}
function At(e2) {
  const n2 = parseDateTimeLike(m(e2));
  if (!n2 || n2.m) {
    throw new RangeError(failedParse(e2));
  }
  return v(n2.p ? finalizeDateTime(n2) : finalizeDate(n2));
}
function ot(e2, n2) {
  const t2 = parseYearMonthOnly(m(n2));
  if (t2) {
    return requireIsoCalendar(t2), createPlainYearMonthSlots(checkIsoYearMonthInBounds(checkIsoDateFields(t2)));
  }
  const o2 = At(n2);
  return createPlainYearMonthSlots(moveToDayOfMonthUnsafe(e2(o2.calendar), o2));
}
function requireIsoCalendar(e2) {
  if (e2.calendar !== X) {
    throw new RangeError(invalidSubstring(e2.calendar));
  }
}
function Q(e2, n2) {
  const t2 = parseMonthDayOnly(m(n2));
  if (t2) {
    return requireIsoCalendar(t2), createPlainMonthDaySlots(checkIsoDateFields(t2));
  }
  const o2 = At(n2), { calendar: r2 } = o2, i2 = e2(r2), [a2, s2, c2] = i2.h(o2), [u2, l2] = i2.I(a2, s2), [f2, d2] = i2.N(u2, l2, c2);
  return createPlainMonthDaySlots(checkIsoDateInBounds(i2.P(f2, d2, c2)), r2);
}
function ze(e2) {
  let n2, t2 = ((e3) => {
    const n3 = Ca.exec(e3);
    return n3 ? (organizeAnnotationParts(n3[10]), organizeTimeParts(n3)) : void 0;
  })(m(e2));
  if (!t2) {
    if (t2 = parseDateTimeLike(e2), !t2) {
      throw new RangeError(failedParse(e2));
    }
    if (!t2.p) {
      throw new RangeError(failedParse(e2));
    }
    if (t2.m) {
      throw new RangeError(invalidSubstring("Z"));
    }
    requireIsoCalendar(t2);
  }
  if ((n2 = parseYearMonthOnly(e2)) && isIsoDateFieldsValid(n2)) {
    throw new RangeError(failedParse(e2));
  }
  if ((n2 = parseMonthDayOnly(e2)) && isIsoDateFieldsValid(n2)) {
    throw new RangeError(failedParse(e2));
  }
  return Ge(constrainIsoTimeFields(t2, 1));
}
function Kt(e2) {
  const n2 = ((e3) => {
    const n3 = za.exec(e3);
    return n3 ? ((e4) => {
      function parseUnit(e5, r3, i2) {
        let a2 = 0, s2 = 0;
        if (i2 && ([a2, o2] = divModFloor(o2, Xr[i2])), void 0 !== e5) {
          if (t2) {
            throw new RangeError(invalidSubstring(e5));
          }
          s2 = ((e6) => {
            const n5 = parseInt(e6);
            if (!Number.isFinite(n5)) {
              throw new RangeError(invalidSubstring(e6));
            }
            return n5;
          })(e5), n4 = 1, r3 && (o2 = parseSubsecNano(r3) * (Xr[i2] / _r), t2 = 1);
        }
        return a2 + s2;
      }
      let n4 = 0, t2 = 0, o2 = 0, r2 = {
        ...zipProps(F, [parseUnit(e4[2]), parseUnit(e4[3]), parseUnit(e4[4]), parseUnit(e4[5]), parseUnit(e4[6], e4[7], 5), parseUnit(e4[8], e4[9], 4), parseUnit(e4[10], e4[11], 3)]),
        ...nanoToGivenFields(o2, 2, F)
      };
      if (!n4) {
        throw new RangeError(noValidFields(F));
      }
      return parseSign(e4[1]) < 0 && (r2 = negateDurationFields(r2)), r2;
    })(n3) : void 0;
  })(m(e2));
  if (!n2) {
    throw new RangeError(failedParse(e2));
  }
  return Vt(checkDurationUnits(n2));
}
function sn(e2) {
  const n2 = parseDateTimeLike(e2) || parseYearMonthOnly(e2) || parseMonthDayOnly(e2);
  return n2 ? n2.calendar : e2;
}
function Ne(e2) {
  const n2 = parseDateTimeLike(e2);
  return n2 && (n2.timeZone || n2.m && Ta || n2.offset) || e2;
}
function finalizeZonedDateTime(e2, n2, t2 = 0, o2 = 0) {
  const r2 = ye(e2.timeZone), i2 = ie(r2);
  return Yn(getMatchingInstantFor(i2, checkIsoDateTimeFields(e2), n2, t2, o2, !i2.v, e2.m), r2, an(e2.calendar));
}
function finalizeDateTime(e2) {
  return resolveSlotsCalendar(checkIsoDateTimeInBounds(checkIsoDateTimeFields(e2)));
}
function finalizeDate(e2) {
  return resolveSlotsCalendar(checkIsoDateInBounds(checkIsoDateFields(e2)));
}
function resolveSlotsCalendar(e2) {
  return {
    ...e2,
    calendar: an(e2.calendar)
  };
}
function parseDateTimeLike(e2) {
  const n2 = Ya.exec(e2);
  return n2 ? ((e3) => {
    const n3 = e3[10], t2 = "Z" === (n3 || "").toUpperCase();
    return {
      isoYear: organizeIsoYearParts(e3),
      isoMonth: parseInt(e3[4]),
      isoDay: parseInt(e3[5]),
      ...organizeTimeParts(e3.slice(5)),
      ...organizeAnnotationParts(e3[16]),
      p: Boolean(e3[6]),
      m: t2,
      offset: t2 ? void 0 : n3
    };
  })(n2) : void 0;
}
function parseYearMonthOnly(e2) {
  const n2 = Ba.exec(e2);
  return n2 ? ((e3) => ({
    isoYear: organizeIsoYearParts(e3),
    isoMonth: parseInt(e3[4]),
    isoDay: 1,
    ...organizeAnnotationParts(e3[5])
  }))(n2) : void 0;
}
function parseMonthDayOnly(e2) {
  const n2 = ka.exec(e2);
  return n2 ? ((e3) => ({
    isoYear: ji,
    isoMonth: parseInt(e3[1]),
    isoDay: parseInt(e3[2]),
    ...organizeAnnotationParts(e3[3])
  }))(n2) : void 0;
}
function parseOffsetNanoMaybe(e2, n2) {
  const t2 = Za.exec(e2);
  return t2 ? ((e3, n3) => {
    const t3 = e3[4] || e3[5];
    if (n3 && t3) {
      throw new RangeError(invalidSubstring(t3));
    }
    return ae((parseInt0(e3[2]) * Kr + parseInt0(e3[3]) * Jr + parseInt0(e3[4]) * _r + parseSubsecNano(e3[5] || "")) * parseSign(e3[1]));
  })(t2, n2) : void 0;
}
function organizeIsoYearParts(e2) {
  const n2 = parseSign(e2[1]), t2 = parseInt(e2[2] || e2[3]);
  if (n2 < 0 && !t2) {
    throw new RangeError(invalidSubstring(-0));
  }
  return n2 * t2;
}
function organizeTimeParts(e2) {
  const n2 = parseInt0(e2[3]);
  return {
    ...nanoToIsoTimeAndDay(parseSubsecNano(e2[4] || ""))[0],
    isoHour: parseInt0(e2[1]),
    isoMinute: parseInt0(e2[2]),
    isoSecond: 60 === n2 ? 59 : n2
  };
}
function organizeAnnotationParts(e2) {
  let n2, t2;
  const o2 = [];
  if (e2.replace(Ra, ((e3, r2, i2) => {
    const a2 = Boolean(r2), [s2, c2] = i2.split("=").reverse();
    if (c2) {
      if ("u-ca" === c2) {
        o2.push(s2), n2 || (n2 = a2);
      } else if (a2 || /[A-Z]/.test(c2)) {
        throw new RangeError(invalidSubstring(e3));
      }
    } else {
      if (t2) {
        throw new RangeError(invalidSubstring(e3));
      }
      t2 = s2;
    }
    return "";
  })), o2.length > 1 && n2) {
    throw new RangeError(invalidSubstring(e2));
  }
  return {
    timeZone: t2,
    calendar: o2[0] || X
  };
}
function parseSubsecNano(e2) {
  return parseInt(e2.padEnd(9, "0"));
}
function createRegExp(e2) {
  return new RegExp(`^${e2}$`, "i");
}
function parseSign(e2) {
  return e2 && "+" !== e2 ? -1 : 1;
}
function parseInt0(e2) {
  return void 0 === e2 ? 0 : parseInt(e2);
}
function Me(e2) {
  return ye(m(e2));
}
function ye(e2) {
  const n2 = getTimeZoneEssence(e2);
  return "number" == typeof n2 ? Fe(n2) : n2 ? ((e3) => {
    if (Ua.test(e3)) {
      throw new RangeError(br);
    }
    return e3.toLowerCase().split("/").map(((e4, n3) => (e4.length <= 3 || /\d/.test(e4)) && !/etc|yap/.test(e4) ? e4.toUpperCase() : e4.replace(/baja|dumont|[a-z]+/g, ((e5, t2) => e5.length <= 2 && !n3 || "in" === e5 || "chat" === e5 ? e5.toUpperCase() : e5.length > 2 || !t2 ? capitalize(e5).replace(/island|noronha|murdo|rivadavia|urville/, capitalize) : e5)))).join("/");
  })(e2) : Ta;
}
function getTimeZoneAtomic(e2) {
  const n2 = getTimeZoneEssence(e2);
  return "number" == typeof n2 ? n2 : n2 ? n2.resolvedOptions().timeZone : Ta;
}
function getTimeZoneEssence(e2) {
  const n2 = parseOffsetNanoMaybe(e2 = e2.toUpperCase(), 1);
  return void 0 !== n2 ? n2 : e2 !== Ta ? qa(e2) : void 0;
}
function Ze(e2, n2) {
  return te(e2.epochNanoseconds, n2.epochNanoseconds);
}
function yn(e2, n2) {
  return te(e2.epochNanoseconds, n2.epochNanoseconds);
}
function $t(e2, n2, t2, o2, r2, i2) {
  const a2 = e2(normalizeOptions(i2).relativeTo), s2 = Math.max(getMaxDurationUnit(o2), getMaxDurationUnit(r2));
  if (allPropsEqual(F, o2, r2)) {
    return 0;
  }
  if (isUniformUnit(s2, a2)) {
    return te(durationFieldsToBigNano(o2), durationFieldsToBigNano(r2));
  }
  if (!a2) {
    throw new RangeError(zr);
  }
  const [c2, u2, l2] = createMarkerSystem(n2, t2, a2), f2 = createMarkerToEpochNano(l2), d2 = createMoveMarker(l2);
  return te(f2(d2(u2, c2, o2)), f2(d2(u2, c2, r2)));
}
function gt(e2, n2) {
  return rt(e2, n2) || He(e2, n2);
}
function rt(e2, n2) {
  return compareNumbers(isoToEpochMilli(e2), isoToEpochMilli(n2));
}
function He(e2, n2) {
  return compareNumbers(isoTimeFieldsToNano(e2), isoTimeFieldsToNano(n2));
}
function ue(e2, n2) {
  return !Ze(e2, n2);
}
function gn(e2, n2) {
  return !yn(e2, n2) && !!je(e2.timeZone, n2.timeZone) && isIdLikeEqual(e2.calendar, n2.calendar);
}
function ft(e2, n2) {
  return !gt(e2, n2) && isIdLikeEqual(e2.calendar, n2.calendar);
}
function It(e2, n2) {
  return !rt(e2, n2) && isIdLikeEqual(e2.calendar, n2.calendar);
}
function $e(e2, n2) {
  return !rt(e2, n2) && isIdLikeEqual(e2.calendar, n2.calendar);
}
function x(e2, n2) {
  return !rt(e2, n2) && isIdLikeEqual(e2.calendar, n2.calendar);
}
function Ve(e2, n2) {
  return !He(e2, n2);
}
function je(e2, n2) {
  if (e2 === n2) {
    return 1;
  }
  const t2 = I(e2), o2 = I(n2);
  if (t2 === o2) {
    return 1;
  }
  try {
    return getTimeZoneAtomic(t2) === getTimeZoneAtomic(o2);
  } catch (e3) {
  }
}
function le(e2, n2, t2, o2) {
  const r2 = refineDiffOptions(e2, U(o2), 3, 5), i2 = diffEpochNanos(n2.epochNanoseconds, t2.epochNanoseconds, ...r2);
  return Vt(e2 ? negateDurationFields(i2) : i2);
}
function Dn(e2, n2, t2, o2, r2, i2) {
  const a2 = getCommonCalendarSlot(o2.calendar, r2.calendar), s2 = U(i2), [c2, u2, l2, f2] = refineDiffOptions(t2, s2, 5), d2 = o2.epochNanoseconds, m2 = r2.epochNanoseconds, p2 = te(m2, d2);
  let h2;
  if (p2) {
    if (c2 < 6) {
      h2 = diffEpochNanos(d2, m2, c2, u2, l2, f2);
    } else {
      const t3 = n2(((e3, n3) => {
        if (!je(e3, n3)) {
          throw new RangeError(Fr);
        }
        return e3;
      })(o2.timeZone, r2.timeZone)), i3 = e2(a2);
      h2 = diffZonedEpochsBig(i3, t3, o2, r2, p2, c2, s2), h2 = roundRelativeDuration(h2, m2, c2, u2, l2, f2, i3, o2, extractEpochNano, E(moveZonedEpochs, t3));
    }
  } else {
    h2 = Si;
  }
  return Vt(t2 ? negateDurationFields(h2) : h2);
}
function ut(e2, n2, t2, o2, r2) {
  const i2 = getCommonCalendarSlot(t2.calendar, o2.calendar), a2 = U(r2), [s2, c2, u2, l2] = refineDiffOptions(n2, a2, 6), f2 = isoToEpochNano(t2), d2 = isoToEpochNano(o2), m2 = te(d2, f2);
  let p2;
  if (m2) {
    if (s2 <= 6) {
      p2 = diffEpochNanos(f2, d2, s2, c2, u2, l2);
    } else {
      const n3 = e2(i2);
      p2 = diffDateTimesBig(n3, t2, o2, m2, s2, a2), p2 = roundRelativeDuration(p2, d2, s2, c2, u2, l2, n3, t2, isoToEpochNano, moveDateTime);
    }
  } else {
    p2 = Si;
  }
  return Vt(n2 ? negateDurationFields(p2) : p2);
}
function Ft(e2, n2, t2, o2, r2) {
  const i2 = getCommonCalendarSlot(t2.calendar, o2.calendar), a2 = U(r2);
  return diffDateLike(n2, (() => e2(i2)), t2, o2, ...refineDiffOptions(n2, a2, 6, 9, 6), a2);
}
function Xe(e2, n2, t2, o2, r2) {
  const i2 = getCommonCalendarSlot(t2.calendar, o2.calendar), a2 = U(r2), s2 = refineDiffOptions(n2, a2, 9, 9, 8), c2 = e2(i2);
  return diffDateLike(n2, (() => c2), moveToDayOfMonthUnsafe(c2, t2), moveToDayOfMonthUnsafe(c2, o2), ...s2, a2);
}
function diffDateLike(e2, n2, t2, o2, r2, i2, a2, s2, c2) {
  const u2 = isoToEpochNano(t2), l2 = isoToEpochNano(o2);
  let f2;
  if (te(l2, u2)) {
    if (6 === r2) {
      f2 = diffEpochNanos(u2, l2, r2, i2, a2, s2);
    } else {
      const e3 = n2();
      f2 = e3.dateUntil(t2, o2, r2, c2), 6 === i2 && 1 === a2 || (f2 = roundRelativeDuration(f2, l2, r2, i2, a2, s2, e3, t2, isoToEpochNano, moveDate));
    }
  } else {
    f2 = Si;
  }
  return Vt(e2 ? negateDurationFields(f2) : f2);
}
function Ae(e2, n2, t2, o2) {
  const r2 = U(o2), [i2, a2, s2, c2] = refineDiffOptions(e2, r2, 5, 5), u2 = roundByInc(diffTimes(n2, t2), computeNanoInc(a2, s2), c2), l2 = {
    ...Si,
    ...nanoToDurationTimeFields(u2, i2)
  };
  return Vt(e2 ? negateDurationFields(l2) : l2);
}
function diffZonedEpochsExact(e2, n2, t2, o2, r2, i2) {
  const a2 = te(o2.epochNanoseconds, t2.epochNanoseconds);
  return a2 ? r2 < 6 ? diffEpochNanosExact(t2.epochNanoseconds, o2.epochNanoseconds, r2) : diffZonedEpochsBig(n2, e2, t2, o2, a2, r2, i2) : Si;
}
function diffDateTimesExact(e2, n2, t2, o2, r2) {
  const i2 = isoToEpochNano(n2), a2 = isoToEpochNano(t2), s2 = te(a2, i2);
  return s2 ? o2 <= 6 ? diffEpochNanosExact(i2, a2, o2) : diffDateTimesBig(e2, n2, t2, s2, o2, r2) : Si;
}
function diffZonedEpochsBig(e2, n2, t2, o2, r2, i2, a2) {
  const [s2, c2, u2] = ((e3, n3, t3, o3) => {
    function updateMid() {
      return l3 = {
        ...moveByDays(a3, c3++ * -o3),
        ...i3
      }, f3 = we(e3, l3), te(s3, f3) === -o3;
    }
    const r3 = fn(n3, e3), i3 = Vn(j, r3), a3 = fn(t3, e3), s3 = t3.epochNanoseconds;
    let c3 = 0;
    const u3 = diffTimes(r3, a3);
    let l3, f3;
    if (Math.sign(u3) === -o3 && c3++, updateMid() && (-1 === o3 || updateMid())) {
      throw new RangeError(vr);
    }
    const d2 = oe(re(f3, s3));
    return [r3, l3, d2];
  })(n2, t2, o2, r2);
  var l2, f2;
  return {
    ...6 === i2 ? (l2 = s2, f2 = c2, {
      ...Si,
      days: diffDays(l2, f2)
    }) : e2.dateUntil(s2, c2, i2, a2),
    ...nanoToDurationTimeFields(u2)
  };
}
function diffDateTimesBig(e2, n2, t2, o2, r2, i2) {
  const [a2, s2, c2] = ((e3, n3, t3) => {
    let o3 = n3, r3 = diffTimes(e3, n3);
    return Math.sign(r3) === -t3 && (o3 = moveByDays(n3, -t3), r3 += Qr * t3), [e3, o3, r3];
  })(n2, t2, o2);
  return {
    ...e2.dateUntil(a2, s2, r2, i2),
    ...nanoToDurationTimeFields(c2)
  };
}
function diffEpochNanos(e2, n2, t2, o2, r2, i2) {
  return {
    ...Si,
    ...nanoToDurationDayTimeFields(roundBigNano(re(e2, n2), o2, r2, i2), t2)
  };
}
function diffEpochNanosExact(e2, n2, t2) {
  return {
    ...Si,
    ...nanoToDurationDayTimeFields(re(e2, n2), t2)
  };
}
function diffDays(e2, n2) {
  return diffEpochMilliByDay(isoToEpochMilli(e2), isoToEpochMilli(n2));
}
function diffEpochMilliByDay(e2, n2) {
  return Math.trunc((n2 - e2) / Gr);
}
function diffTimes(e2, n2) {
  return isoTimeFieldsToNano(n2) - isoTimeFieldsToNano(e2);
}
function getCommonCalendarSlot(e2, n2) {
  if (!isIdLikeEqual(e2, n2)) {
    throw new RangeError(Er);
  }
  return e2;
}
function createIntlCalendar(e2) {
  function epochMilliToIntlFields(e3) {
    return ((e4, n3) => ({
      ...parseIntlYear(e4, n3),
      F: e4.month,
      day: parseInt(e4.day)
    }))(hashIntlFormatParts(n2, e3), t2);
  }
  const n2 = La(e2), t2 = computeCalendarIdBase(e2);
  return {
    id: e2,
    O: createIntlFieldCache(epochMilliToIntlFields),
    B: createIntlYearDataCache(epochMilliToIntlFields)
  };
}
function createIntlFieldCache(e2) {
  return Jn(((n2) => {
    const t2 = isoToEpochMilli(n2);
    return e2(t2);
  }), WeakMap);
}
function createIntlYearDataCache(e2) {
  const n2 = e2(0).year - Wi;
  return Jn(((t2) => {
    let o2, r2 = isoArgsToEpochMilli(t2 - n2);
    const i2 = [], a2 = [];
    do {
      r2 += 400 * Gr;
    } while ((o2 = e2(r2)).year <= t2);
    do {
      r2 += (1 - o2.day) * Gr, o2.year === t2 && (i2.push(r2), a2.push(o2.F)), r2 -= Gr;
    } while ((o2 = e2(r2)).year >= t2);
    return {
      k: i2.reverse(),
      C: Wr(a2.reverse())
    };
  }));
}
function parseIntlYear(e2, n2) {
  let t2, o2, r2 = parseIntlPartsYear(e2);
  if (e2.era) {
    const i2 = Di[n2];
    void 0 !== i2 && (t2 = "islamic" === n2 ? "ah" : e2.era.normalize("NFD").toLowerCase().replace(/[^a-z0-9]/g, ""), "bc" === t2 || "b" === t2 ? t2 = "bce" : "ad" !== t2 && "a" !== t2 || (t2 = "ce"), o2 = r2, r2 = eraYearToYear(o2, i2[t2] || 0));
  }
  return {
    era: t2,
    eraYear: o2,
    year: r2
  };
}
function parseIntlPartsYear(e2) {
  return parseInt(e2.relatedYear || e2.year);
}
function computeIntlDateParts(e2) {
  const { year: n2, F: t2, day: o2 } = this.O(e2), { C: r2 } = this.B(n2);
  return [n2, r2[t2] + 1, o2];
}
function computeIntlEpochMilli(e2, n2 = 1, t2 = 1) {
  return this.B(e2).k[n2 - 1] + (t2 - 1) * Gr;
}
function computeIntlLeapMonth(e2) {
  const n2 = queryMonthStrings(this, e2), t2 = queryMonthStrings(this, e2 - 1), o2 = n2.length;
  if (o2 > t2.length) {
    const e3 = getCalendarLeapMonthMeta(this);
    if (e3 < 0) {
      return -e3;
    }
    for (let e4 = 0; e4 < o2; e4++) {
      if (n2[e4] !== t2[e4]) {
        return e4 + 1;
      }
    }
  }
}
function computeIntlDaysInYear(e2) {
  return diffEpochMilliByDay(computeIntlEpochMilli.call(this, e2), computeIntlEpochMilli.call(this, e2 + 1));
}
function computeIntlDaysInMonth(e2, n2) {
  const { k: t2 } = this.B(e2);
  let o2 = n2 + 1, r2 = t2;
  return o2 > t2.length && (o2 = 1, r2 = this.B(e2 + 1).k), diffEpochMilliByDay(t2[n2 - 1], r2[o2 - 1]);
}
function computeIntlMonthsInYear(e2) {
  return this.B(e2).k.length;
}
function queryMonthStrings(e2, n2) {
  return Object.keys(e2.B(n2).C);
}
function rn(e2) {
  return an(m(e2));
}
function an(e2) {
  if ((e2 = e2.toLowerCase()) !== X && e2 !== gi && computeCalendarIdBase(e2) !== computeCalendarIdBase(La(e2).resolvedOptions().calendar)) {
    throw new RangeError(invalidCalendar(e2));
  }
  return e2;
}
function computeCalendarIdBase(e2) {
  return "islamicc" === e2 && (e2 = "islamic"), e2.split("-")[0];
}
function computeNativeWeekOfYear(e2) {
  return this.R(e2)[0];
}
function computeNativeYearOfWeek(e2) {
  return this.R(e2)[1];
}
function computeNativeDayOfYear(e2) {
  const [n2] = this.h(e2);
  return diffEpochMilliByDay(this.q(n2), isoToEpochMilli(e2)) + 1;
}
function parseMonthCode(e2) {
  const n2 = Wa.exec(e2);
  if (!n2) {
    throw new RangeError(invalidMonthCode(e2));
  }
  return [parseInt(n2[1]), Boolean(n2[2])];
}
function monthCodeNumberToMonth(e2, n2, t2) {
  return e2 + (n2 || t2 && e2 >= t2 ? 1 : 0);
}
function monthToMonthCodeNumber(e2, n2) {
  return e2 - (n2 && e2 >= n2 ? 1 : 0);
}
function eraYearToYear(e2, n2) {
  return (n2 + e2) * (Math.sign(n2) || 1) || 0;
}
function getCalendarEraOrigins(e2) {
  return Di[getCalendarIdBase(e2)];
}
function getCalendarLeapMonthMeta(e2) {
  return Ii[getCalendarIdBase(e2)];
}
function getCalendarIdBase(e2) {
  return computeCalendarIdBase(e2.id || X);
}
function Qt(e2, n2, t2, o2) {
  const r2 = refineCalendarFields(t2, o2, en, [], ri);
  if (void 0 !== r2.timeZone) {
    const o3 = t2.dateFromFields(r2), i2 = refineTimeBag(r2), a2 = e2(r2.timeZone);
    return {
      epochNanoseconds: getMatchingInstantFor(n2(a2), {
        ...o3,
        ...i2
      }, void 0 !== r2.offset ? parseOffsetNano(r2.offset) : void 0),
      timeZone: a2
    };
  }
  return {
    ...t2.dateFromFields(r2),
    ...Dt
  };
}
function jn(e2, n2, t2, o2, r2, i2) {
  const a2 = refineCalendarFields(t2, r2, en, ti, ri), s2 = e2(a2.timeZone), [c2, u2, l2] = wn(i2), f2 = t2.dateFromFields(a2, overrideOverflowOptions(i2, c2)), d2 = refineTimeBag(a2, c2);
  return Yn(getMatchingInstantFor(n2(s2), {
    ...f2,
    ...d2
  }, void 0 !== a2.offset ? parseOffsetNano(a2.offset) : void 0, u2, l2), s2, o2);
}
function Pt(e2, n2, t2) {
  const o2 = refineCalendarFields(e2, n2, en, [], w), r2 = H(t2);
  return ee(checkIsoDateTimeInBounds({
    ...e2.dateFromFields(o2, overrideOverflowOptions(t2, r2)),
    ...refineTimeBag(o2, r2)
  }));
}
function Yt(e2, n2, t2, o2 = []) {
  const r2 = refineCalendarFields(e2, n2, en, o2);
  return e2.dateFromFields(r2, t2);
}
function nt(e2, n2, t2, o2) {
  const r2 = refineCalendarFields(e2, n2, fi, o2);
  return e2.yearMonthFromFields(r2, t2);
}
function K(e2, n2, t2, o2, r2 = []) {
  const i2 = refineCalendarFields(e2, t2, en, r2);
  return n2 && void 0 !== i2.month && void 0 === i2.monthCode && void 0 === i2.year && (i2.year = ji), e2.monthDayFromFields(i2, o2);
}
function Ue(e2, n2) {
  const t2 = H(n2);
  return Ge(refineTimeBag(refineFields(e2, ei, [], 1), t2));
}
function Ht(e2) {
  const n2 = refineFields(e2, Ni);
  return Vt(checkDurationUnits({
    ...Si,
    ...n2
  }));
}
function refineCalendarFields(e2, n2, t2, o2 = [], r2 = []) {
  return refineFields(n2, [...e2.fields(t2), ...r2].sort(), o2);
}
function refineFields(e2, n2, t2, o2 = !t2) {
  const r2 = {};
  let i2, a2 = 0;
  for (const o3 of n2) {
    if (o3 === i2) {
      throw new RangeError(duplicateFields(o3));
    }
    if ("constructor" === o3 || "__proto__" === o3) {
      throw new RangeError(tn(o3));
    }
    let n3 = e2[o3];
    if (void 0 !== n3) {
      a2 = 1, Ga[o3] && (n3 = Ga[o3](n3, o3)), r2[o3] = n3;
    } else if (t2) {
      if (t2.includes(o3)) {
        throw new TypeError(missingField(o3));
      }
      r2[o3] = hi[o3];
    }
    i2 = o3;
  }
  if (o2 && !a2) {
    throw new TypeError(noValidFields(n2));
  }
  return r2;
}
function refineTimeBag(e2, n2) {
  return constrainIsoTimeFields(Ha({
    ...hi,
    ...e2
  }), n2);
}
function Sn(e2, n2, t2, o2, r2, i2) {
  const a2 = U(i2), { calendar: s2, timeZone: c2 } = t2;
  return Yn(((e3, n3, t3, o3, r3) => {
    const i3 = mergeCalendarFields(e3, t3, o3, en, oi, ni), [a3, s3, c3] = wn(r3, 2);
    return getMatchingInstantFor(n3, {
      ...e3.dateFromFields(i3, overrideOverflowOptions(r3, a3)),
      ...refineTimeBag(i3, a3)
    }, parseOffsetNano(i3.offset), s3, c3);
  })(e2(s2), n2(c2), o2, r2, a2), c2, s2);
}
function at(e2, n2, t2, o2, r2) {
  const i2 = U(r2);
  return ee(((e3, n3, t3, o3) => {
    const r3 = mergeCalendarFields(e3, n3, t3, en, w), i3 = H(o3);
    return checkIsoDateTimeInBounds({
      ...e3.dateFromFields(r3, overrideOverflowOptions(o3, i3)),
      ...refineTimeBag(r3, i3)
    });
  })(e2(n2.calendar), t2, o2, i2));
}
function Zt(e2, n2, t2, o2, r2) {
  const i2 = U(r2);
  return ((e3, n3, t3, o3) => {
    const r3 = mergeCalendarFields(e3, n3, t3, en);
    return e3.dateFromFields(r3, o3);
  })(e2(n2.calendar), t2, o2, i2);
}
function Ke(e2, n2, t2, o2, r2) {
  const i2 = U(r2);
  return createPlainYearMonthSlots(((e3, n3, t3, o3) => {
    const r3 = mergeCalendarFields(e3, n3, t3, fi);
    return e3.yearMonthFromFields(r3, o3);
  })(e2(n2.calendar), t2, o2, i2));
}
function k(e2, n2, t2, o2, r2) {
  const i2 = U(r2);
  return ((e3, n3, t3, o3) => {
    const r3 = mergeCalendarFields(e3, n3, t3, en);
    return e3.monthDayFromFields(r3, o3);
  })(e2(n2.calendar), t2, o2, i2);
}
function Be(e2, n2, t2) {
  return Ge(((e3, n3, t3) => {
    const o2 = H(t3);
    return refineTimeBag({
      ...Vn(ei, e3),
      ...refineFields(n3, ei)
    }, o2);
  })(e2, n2, t2));
}
function kt(e2, n2) {
  return Vt((t2 = e2, o2 = n2, checkDurationUnits({
    ...t2,
    ...refineFields(o2, Ni)
  })));
  var t2, o2;
}
function mergeCalendarFields(e2, n2, t2, o2, r2 = [], i2 = []) {
  const a2 = [...e2.fields(o2), ...r2].sort();
  let s2 = refineFields(n2, a2, i2);
  const c2 = refineFields(t2, a2);
  return s2 = e2.mergeFields(s2, c2), refineFields(s2, a2, []);
}
function convertToPlainMonthDay(e2, n2) {
  const t2 = refineCalendarFields(e2, n2, pi);
  return e2.monthDayFromFields(t2);
}
function convertToPlainYearMonth(e2, n2, t2) {
  const o2 = refineCalendarFields(e2, n2, di);
  return e2.yearMonthFromFields(o2, t2);
}
function convertToIso(e2, n2, t2, o2, r2) {
  n2 = Vn(t2 = e2.fields(t2), n2), o2 = refineFields(o2, r2 = e2.fields(r2), []);
  let i2 = e2.mergeFields(n2, o2);
  return i2 = refineFields(i2, [...t2, ...r2].sort(), []), e2.dateFromFields(i2);
}
function refineYear(e2, n2) {
  let { era: t2, eraYear: o2, year: r2 } = n2;
  const i2 = getCalendarEraOrigins(e2);
  if (void 0 !== t2 || void 0 !== o2) {
    if (void 0 === t2 || void 0 === o2) {
      throw new TypeError(Dr);
    }
    if (!i2) {
      throw new RangeError(gr);
    }
    const e3 = i2[t2];
    if (void 0 === e3) {
      throw new RangeError(invalidEra(t2));
    }
    const n3 = eraYearToYear(o2, e3);
    if (void 0 !== r2 && r2 !== n3) {
      throw new RangeError(Ir);
    }
    r2 = n3;
  } else if (void 0 === r2) {
    throw new TypeError(missingYear(i2));
  }
  return r2;
}
function refineMonth(e2, n2, t2, o2) {
  let { month: r2, monthCode: i2 } = n2;
  if (void 0 !== i2) {
    const n3 = ((e3, n4, t3, o3) => {
      const r3 = e3.U(t3), [i3, a2] = parseMonthCode(n4);
      let s2 = monthCodeNumberToMonth(i3, a2, r3);
      if (a2) {
        const n5 = getCalendarLeapMonthMeta(e3);
        if (void 0 === n5) {
          throw new RangeError(Pr);
        }
        if (n5 > 0) {
          if (s2 > n5) {
            throw new RangeError(Pr);
          }
          if (void 0 === r3) {
            if (1 === o3) {
              throw new RangeError(Pr);
            }
            s2--;
          }
        } else {
          if (s2 !== -n5) {
            throw new RangeError(Pr);
          }
          if (void 0 === r3 && 1 === o3) {
            throw new RangeError(Pr);
          }
        }
      }
      return s2;
    })(e2, i2, t2, o2);
    if (void 0 !== r2 && r2 !== n3) {
      throw new RangeError(Mr);
    }
    r2 = n3, o2 = 1;
  } else if (void 0 === r2) {
    throw new TypeError(Nr);
  }
  return clampEntity("month", r2, 1, e2.L(t2), o2);
}
function refineDay(e2, n2, t2, o2, r2) {
  return clampProp(n2, "day", 1, e2.j(o2, t2), r2);
}
function spliceFields(e2, n2, t2, o2) {
  let r2 = 0;
  const i2 = [];
  for (const e3 of t2) {
    void 0 !== n2[e3] ? r2 = 1 : i2.push(e3);
  }
  if (Object.assign(e2, n2), r2) {
    for (const n3 of o2 || i2) {
      delete e2[n3];
    }
  }
}
function Se(e2) {
  return _(checkEpochNanoInBounds(bigIntToBigNano(toBigInt(e2))));
}
function vn(e2, n2, t2, o2, r2 = X) {
  return Yn(checkEpochNanoInBounds(bigIntToBigNano(toBigInt(t2))), n2(o2), e2(r2));
}
function pt(e2, n2, t2, o2, r2 = 0, i2 = 0, a2 = 0, s2 = 0, c2 = 0, u2 = 0, l2 = X) {
  return ee(checkIsoDateTimeInBounds(checkIsoDateTimeFields(T(toInteger, zipProps(wi, [n2, t2, o2, r2, i2, a2, s2, c2, u2])))), e2(l2));
}
function Nt(e2, n2, t2, o2, r2 = X) {
  return v(checkIsoDateInBounds(checkIsoDateFields(T(toInteger, {
    isoYear: n2,
    isoMonth: t2,
    isoDay: o2
  }))), e2(r2));
}
function tt(e2, n2, t2, o2 = X, r2 = 1) {
  const i2 = toInteger(n2), a2 = toInteger(t2), s2 = e2(o2);
  return createPlainYearMonthSlots(checkIsoYearMonthInBounds(checkIsoDateFields({
    isoYear: i2,
    isoMonth: a2,
    isoDay: toInteger(r2)
  })), s2);
}
function G(e2, n2, t2, o2 = X, r2 = ji) {
  const i2 = toInteger(n2), a2 = toInteger(t2), s2 = e2(o2);
  return createPlainMonthDaySlots(checkIsoDateInBounds(checkIsoDateFields({
    isoYear: toInteger(r2),
    isoMonth: i2,
    isoDay: a2
  })), s2);
}
function ke(e2 = 0, n2 = 0, t2 = 0, o2 = 0, r2 = 0, i2 = 0) {
  return Ge(constrainIsoTimeFields(T(toInteger, zipProps(j, [e2, n2, t2, o2, r2, i2])), 1));
}
function Lt(e2 = 0, n2 = 0, t2 = 0, o2 = 0, r2 = 0, i2 = 0, a2 = 0, s2 = 0, c2 = 0, u2 = 0) {
  return Vt(checkDurationUnits(T(toStrictInteger, zipProps(F, [e2, n2, t2, o2, r2, i2, a2, s2, c2, u2]))));
}
function fe(e2, n2, t2 = X) {
  return Yn(e2.epochNanoseconds, n2, t2);
}
function Zn(e2) {
  return _(e2.epochNanoseconds);
}
function ht(e2, n2) {
  return ee(fn(n2, e2));
}
function Bt(e2, n2) {
  return v(fn(n2, e2));
}
function bn(e2, n2, t2) {
  return convertToPlainYearMonth(e2(n2.calendar), t2);
}
function Fn(e2, n2, t2) {
  return convertToPlainMonthDay(e2(n2.calendar), t2);
}
function Re(e2, n2) {
  return Ge(fn(n2, e2));
}
function mt(e2, n2, t2, o2) {
  const r2 = ((e3, n3, t3, o3) => {
    const r3 = ve(o3);
    return we(e3(n3), t3, r3);
  })(e2, t2, n2, o2);
  return Yn(checkEpochNanoInBounds(r2), t2, n2.calendar);
}
function St(e2, n2, t2) {
  const o2 = e2(n2.calendar);
  return createPlainYearMonthSlots({
    ...n2,
    ...convertToPlainYearMonth(o2, t2)
  });
}
function Ot(e2, n2, t2) {
  return convertToPlainMonthDay(e2(n2.calendar), t2);
}
function vt(e2, n2, t2, o2, r2) {
  const i2 = e2(r2.timeZone), a2 = r2.plainTime, s2 = void 0 !== a2 ? n2(a2) : Dt;
  return Yn(we(t2(i2), {
    ...o2,
    ...s2
  }), i2, o2.calendar);
}
function wt(e2, n2 = Dt) {
  return ee(checkIsoDateTimeInBounds({
    ...e2,
    ...n2
  }));
}
function jt(e2, n2, t2) {
  return convertToPlainYearMonth(e2(n2.calendar), t2);
}
function Mt(e2, n2, t2) {
  return convertToPlainMonthDay(e2(n2.calendar), t2);
}
function _e(e2, n2, t2, o2) {
  return ((e3, n3, t3) => convertToIso(e3, n3, di, de(t3), li))(e2(n2.calendar), t2, o2);
}
function R(e2, n2, t2, o2) {
  return ((e3, n3, t3) => convertToIso(e3, n3, pi, de(t3), si))(e2(n2.calendar), t2, o2);
}
function Je(e2, n2, t2, o2, r2) {
  const i2 = de(r2), a2 = n2(i2.plainDate), s2 = e2(i2.timeZone);
  return Yn(we(t2(s2), {
    ...a2,
    ...o2
  }), s2, a2.calendar);
}
function Le(e2, n2) {
  return ee(checkIsoDateTimeInBounds({
    ...e2,
    ...n2
  }));
}
function De(e2) {
  return _(checkEpochNanoInBounds(he(e2, _r)));
}
function Pe(e2) {
  return _(checkEpochNanoInBounds(he(e2, be)));
}
function Ce(e2) {
  return _(checkEpochNanoInBounds(bigIntToBigNano(toBigInt(e2), Vr)));
}
function ge(e2) {
  return _(checkEpochNanoInBounds(bigIntToBigNano(toBigInt(e2))));
}
function pn(e2, n2, t2 = Dt) {
  const o2 = n2.timeZone, r2 = e2(o2), i2 = {
    ...fn(n2, r2),
    ...t2
  };
  return Yn(getMatchingInstantFor(r2, i2, i2.offsetNanoseconds, 2), o2, n2.calendar);
}
function Tn(e2, n2, t2) {
  const o2 = n2.timeZone, r2 = e2(o2), i2 = {
    ...fn(n2, r2),
    ...t2
  }, a2 = getPreferredCalendarSlot(n2.calendar, t2.calendar);
  return Yn(getMatchingInstantFor(r2, i2, i2.offsetNanoseconds, 2), o2, a2);
}
function lt(e2, n2 = Dt) {
  return ee({
    ...e2,
    ...n2
  });
}
function st(e2, n2) {
  return ee({
    ...e2,
    ...n2
  }, getPreferredCalendarSlot(e2.calendar, n2.calendar));
}
function it(e2, n2) {
  return {
    ...e2,
    calendar: n2
  };
}
function On(e2, n2) {
  return {
    ...e2,
    timeZone: n2
  };
}
function getPreferredCalendarSlot(e2, n2) {
  if (e2 === n2) {
    return e2;
  }
  const t2 = I(e2), o2 = I(n2);
  if (t2 === o2 || t2 === X) {
    return n2;
  }
  if (o2 === X) {
    return e2;
  }
  throw new RangeError(Er);
}
function createNativeOpsCreator(e2, n2) {
  return (t2) => t2 === X ? e2 : t2 === gi || t2 === Ti ? Object.assign(Object.create(e2), {
    id: t2
  }) : Object.assign(Object.create(n2), Aa(t2));
}
function createOptionsTransformer(e2, n2, t2) {
  const o2 = new Set(t2);
  return (r2) => (((e3, n3) => {
    for (const t3 of n3) {
      if (t3 in e3) {
        return 1;
      }
    }
    return 0;
  })(r2 = V(o2, r2), e2) || Object.assign(r2, n2), t2 && (r2.timeZone = Ta, ["full", "long"].includes(r2.timeStyle) && (r2.timeStyle = "medium")), r2);
}
function e(e2, n2 = qn) {
  const [t2, , , o2] = e2;
  return (r2, i2 = Ns, ...a2) => {
    const s2 = n2(o2 && o2(...a2), r2, i2, t2), c2 = s2.resolvedOptions();
    return [s2, ...toEpochMillis(e2, c2, a2)];
  };
}
function qn(e2, n2, t2, o2) {
  if (t2 = o2(t2), e2) {
    if (void 0 !== t2.timeZone) {
      throw new TypeError(Lr);
    }
    t2.timeZone = e2;
  }
  return new En(n2, t2);
}
function toEpochMillis(e2, n2, t2) {
  const [, o2, r2] = e2;
  return t2.map(((e3) => (e3.calendar && ((e4, n3, t3) => {
    if ((t3 || e4 !== X) && e4 !== n3) {
      throw new RangeError(Er);
    }
  })(I(e3.calendar), n2.calendar, r2), o2(e3, n2))));
}
function An(e2) {
  const n2 = Bn();
  return Ie(n2, e2.getOffsetNanosecondsFor(n2));
}
function Bn() {
  return he(Date.now(), be);
}
function Nn() {
  return ys || (ys = new En().resolvedOptions().timeZone);
}
var expectedInteger = (e2, n2) => `Non-integer ${e2}: ${n2}`;
var expectedPositive = (e2, n2) => `Non-positive ${e2}: ${n2}`;
var expectedFinite = (e2, n2) => `Non-finite ${e2}: ${n2}`;
var forbiddenBigIntToNumber = (e2) => `Cannot convert bigint to ${e2}`;
var invalidBigInt = (e2) => `Invalid bigint: ${e2}`;
var pr = "Cannot convert Symbol to string";
var hr = "Invalid object";
var numberOutOfRange = (e2, n2, t2, o2, r2) => r2 ? numberOutOfRange(e2, r2[n2], r2[t2], r2[o2]) : invalidEntity(e2, n2) + `; must be between ${t2}-${o2}`;
var invalidEntity = (e2, n2) => `Invalid ${e2}: ${n2}`;
var missingField = (e2) => `Missing ${e2}`;
var tn = (e2) => `Invalid field ${e2}`;
var duplicateFields = (e2) => `Duplicate field ${e2}`;
var noValidFields = (e2) => "No valid fields: " + e2.join();
var Z = "Invalid bag";
var invalidChoice = (e2, n2, t2) => invalidEntity(e2, n2) + "; must be " + Object.keys(t2).join();
var A = "Cannot use valueOf";
var P = "Invalid calling context";
var gr = "Forbidden era/eraYear";
var Dr = "Mismatching era/eraYear";
var Ir = "Mismatching year/eraYear";
var invalidEra = (e2) => `Invalid era: ${e2}`;
var missingYear = (e2) => "Missing year" + (e2 ? "/era/eraYear" : "");
var invalidMonthCode = (e2) => `Invalid monthCode: ${e2}`;
var Mr = "Mismatching month/monthCode";
var Nr = "Missing month/monthCode";
var yr = "Cannot guess year";
var Pr = "Invalid leap month";
var g = "Invalid protocol";
var vr = "Invalid protocol results";
var Er = "Mismatching Calendars";
var invalidCalendar = (e2) => `Invalid Calendar: ${e2}`;
var Fr = "Mismatching TimeZones";
var br = "Forbidden ICU TimeZone";
var wr = "Out-of-bounds offset";
var Br = "Out-of-bounds TimeZone gap";
var kr = "Invalid TimeZone offset";
var Yr = "Ambiguous offset";
var Cr = "Out-of-bounds date";
var Zr = "Out-of-bounds duration";
var Rr = "Cannot mix duration signs";
var zr = "Missing relativeTo";
var qr = "Cannot use large units";
var Ur = "Required smallestUnit or largestUnit";
var Ar = "smallestUnit > largestUnit";
var failedParse = (e2) => `Cannot parse: ${e2}`;
var invalidSubstring = (e2) => `Invalid substring: ${e2}`;
var Ln = (e2) => `Cannot format ${e2}`;
var kn = "Mismatching types for formatting";
var Lr = "Cannot specify TimeZone";
var Wr = /* @__PURE__ */ E(b, ((e2, n2) => n2));
var jr = /* @__PURE__ */ E(b, ((e2, n2, t2) => t2));
var xr = /* @__PURE__ */ E(padNumber, 2);
var $r = {
  nanosecond: 0,
  microsecond: 1,
  millisecond: 2,
  second: 3,
  minute: 4,
  hour: 5,
  day: 6,
  week: 7,
  month: 8,
  year: 9
};
var Et = /* @__PURE__ */ Object.keys($r);
var Gr = 864e5;
var Hr = 1e3;
var Vr = 1e3;
var be = 1e6;
var _r = 1e9;
var Jr = 6e10;
var Kr = 36e11;
var Qr = 864e11;
var Xr = [1, Vr, be, _r, Jr, Kr, Qr];
var w = /* @__PURE__ */ Et.slice(0, 6);
var ei = /* @__PURE__ */ sortStrings(w);
var ni = ["offset"];
var ti = ["timeZone"];
var oi = /* @__PURE__ */ w.concat(ni);
var ri = /* @__PURE__ */ oi.concat(ti);
var ii = ["era", "eraYear"];
var ai = /* @__PURE__ */ ii.concat(["year"]);
var si = ["year"];
var ci = ["monthCode"];
var ui = /* @__PURE__ */ ["month"].concat(ci);
var li = ["day"];
var fi = /* @__PURE__ */ ui.concat(si);
var di = /* @__PURE__ */ ci.concat(si);
var en = /* @__PURE__ */ li.concat(fi);
var mi = /* @__PURE__ */ li.concat(ui);
var pi = /* @__PURE__ */ li.concat(ci);
var hi = /* @__PURE__ */ jr(w, 0);
var X = "iso8601";
var gi = "gregory";
var Ti = "japanese";
var Di = {
  [gi]: {
    bce: -1,
    ce: 0
  },
  [Ti]: {
    bce: -1,
    ce: 0,
    meiji: 1867,
    taisho: 1911,
    showa: 1925,
    heisei: 1988,
    reiwa: 2018
  },
  ethioaa: {
    era0: 0
  },
  ethiopic: {
    era0: 0,
    era1: 5500
  },
  coptic: {
    era0: -1,
    era1: 0
  },
  roc: {
    beforeroc: -1,
    minguo: 0
  },
  buddhist: {
    be: 0
  },
  islamic: {
    ah: 0
  },
  indian: {
    saka: 0
  },
  persian: {
    ap: 0
  }
};
var Ii = {
  chinese: 13,
  dangi: 13,
  hebrew: -6
};
var m = /* @__PURE__ */ E(requireType, "string");
var f = /* @__PURE__ */ E(requireType, "boolean");
var Mi = /* @__PURE__ */ E(requireType, "number");
var $ = /* @__PURE__ */ E(requireType, "function");
var F = /* @__PURE__ */ Et.map(((e2) => e2 + "s"));
var Ni = /* @__PURE__ */ sortStrings(F);
var yi = /* @__PURE__ */ F.slice(0, 6);
var Pi = /* @__PURE__ */ F.slice(6);
var vi = /* @__PURE__ */ Pi.slice(1);
var Ei = /* @__PURE__ */ Wr(F);
var Si = /* @__PURE__ */ jr(F, 0);
var Fi = /* @__PURE__ */ jr(yi, 0);
var bi = /* @__PURE__ */ E(zeroOutProps, F);
var j = ["isoNanosecond", "isoMicrosecond", "isoMillisecond", "isoSecond", "isoMinute", "isoHour"];
var Oi = ["isoDay", "isoMonth", "isoYear"];
var wi = /* @__PURE__ */ j.concat(Oi);
var Bi = /* @__PURE__ */ sortStrings(Oi);
var ki = /* @__PURE__ */ sortStrings(j);
var Yi = /* @__PURE__ */ sortStrings(wi);
var Dt = /* @__PURE__ */ jr(ki, 0);
var Ci = /* @__PURE__ */ E(zeroOutProps, wi);
var En = Intl.DateTimeFormat;
var Zi = "en-GB";
var Ri = 1e8;
var zi = Ri * Gr;
var qi = [Ri, 0];
var Ui = [-Ri, 0];
var Ai = 275760;
var Li = -271821;
var Wi = 1970;
var ji = 1972;
var xi = 12;
var $i = /* @__PURE__ */ isoArgsToEpochMilli(1868, 9, 8);
var Gi = /* @__PURE__ */ Jn(computeJapaneseEraParts, WeakMap);
var Hi = "smallestUnit";
var Vi = "unit";
var _i = "roundingIncrement";
var Ji = "fractionalSecondDigits";
var Ki = "relativeTo";
var Qi = {
  constrain: 0,
  reject: 1
};
var Xi = /* @__PURE__ */ Object.keys(Qi);
var ea = {
  compatible: 0,
  reject: 1,
  earlier: 2,
  later: 3
};
var na = {
  reject: 0,
  use: 1,
  prefer: 2,
  ignore: 3
};
var ta = {
  auto: 0,
  never: 1,
  critical: 2,
  always: 3
};
var oa = {
  auto: 0,
  never: 1,
  critical: 2
};
var ra = {
  auto: 0,
  never: 1
};
var ia = {
  floor: 0,
  halfFloor: 1,
  ceil: 2,
  halfCeil: 3,
  trunc: 4,
  halfTrunc: 5,
  expand: 6,
  halfExpand: 7,
  halfEven: 8
};
var aa = /* @__PURE__ */ E(refineUnitOption, Hi);
var sa = /* @__PURE__ */ E(refineUnitOption, "largestUnit");
var ca = /* @__PURE__ */ E(refineUnitOption, Vi);
var ua = /* @__PURE__ */ E(refineChoiceOption, "overflow", Qi);
var la = /* @__PURE__ */ E(refineChoiceOption, "disambiguation", ea);
var fa = /* @__PURE__ */ E(refineChoiceOption, "offset", na);
var da = /* @__PURE__ */ E(refineChoiceOption, "calendarName", ta);
var ma = /* @__PURE__ */ E(refineChoiceOption, "timeZoneName", oa);
var pa = /* @__PURE__ */ E(refineChoiceOption, "offset", ra);
var ha = /* @__PURE__ */ E(refineChoiceOption, "roundingMode", ia);
var L = "PlainYearMonth";
var q = "PlainMonthDay";
var J = "PlainDate";
var We = "PlainDateTime";
var xe = "PlainTime";
var Te = "ZonedDateTime";
var Oe = "Instant";
var qt = "Duration";
var ga = [Math.floor, (e2) => hasHalf(e2) ? Math.floor(e2) : Math.round(e2), Math.ceil, (e2) => hasHalf(e2) ? Math.ceil(e2) : Math.round(e2), Math.trunc, (e2) => hasHalf(e2) ? Math.trunc(e2) || 0 : Math.round(e2), (e2) => e2 < 0 ? Math.floor(e2) : Math.ceil(e2), (e2) => Math.sign(e2) * Math.round(Math.abs(e2)) || 0, (e2) => hasHalf(e2) ? (e2 = Math.trunc(e2) || 0) + e2 % 2 : Math.round(e2)];
var Ta = "UTC";
var Da = 5184e3;
var Ia = /* @__PURE__ */ isoArgsToEpochSec(1847);
var Ma = /* @__PURE__ */ isoArgsToEpochSec(/* @__PURE__ */ (/* @__PURE__ */ new Date()).getUTCFullYear() + 10);
var Na = /0+$/;
var fn = /* @__PURE__ */ Jn(_zonedEpochSlotsToIso, WeakMap);
var ya = 2 ** 32 - 1;
var ie = /* @__PURE__ */ Jn(((e2) => {
  const n2 = getTimeZoneEssence(e2);
  return "object" == typeof n2 ? new IntlTimeZone(n2) : new FixedTimeZone(n2 || 0);
}));
var FixedTimeZone = class {
  constructor(e2) {
    this.v = e2;
  }
  getOffsetNanosecondsFor() {
    return this.v;
  }
  getPossibleInstantsFor(e2) {
    return [isoToEpochNanoWithOffset(e2, this.v)];
  }
  l() {
  }
};
var IntlTimeZone = class {
  constructor(e2) {
    this.$ = ((e3) => {
      function getOffsetSec(e4) {
        const i2 = clampNumber(e4, o2, r2), [a2, s2] = computePeriod(i2), c2 = n2(a2), u2 = n2(s2);
        return c2 === u2 ? c2 : pinch(t2(a2, s2), c2, u2, e4);
      }
      function pinch(n3, t3, o3, r3) {
        let i2, a2;
        for (; (void 0 === r3 || void 0 === (i2 = r3 < n3[0] ? t3 : r3 >= n3[1] ? o3 : void 0)) && (a2 = n3[1] - n3[0]); ) {
          const t4 = n3[0] + Math.floor(a2 / 2);
          e3(t4) === o3 ? n3[1] = t4 : n3[0] = t4 + 1;
        }
        return i2;
      }
      const n2 = Jn(e3), t2 = Jn(createSplitTuple);
      let o2 = Ia, r2 = Ma;
      return {
        G(e4) {
          const n3 = getOffsetSec(e4 - 86400), t3 = getOffsetSec(e4 + 86400), o3 = e4 - n3, r3 = e4 - t3;
          if (n3 === t3) {
            return [o3];
          }
          const i2 = getOffsetSec(o3);
          return i2 === getOffsetSec(r3) ? [e4 - i2] : n3 > t3 ? [o3, r3] : [];
        },
        V: getOffsetSec,
        l(e4, i2) {
          const a2 = clampNumber(e4, o2, r2);
          let [s2, c2] = computePeriod(a2);
          const u2 = Da * i2, l2 = i2 < 0 ? () => c2 > o2 || (o2 = a2, 0) : () => s2 < r2 || (r2 = a2, 0);
          for (; l2(); ) {
            const o3 = n2(s2), r3 = n2(c2);
            if (o3 !== r3) {
              const n3 = t2(s2, c2);
              pinch(n3, o3, r3);
              const a3 = n3[0];
              if ((compareNumbers(a3, e4) || 1) === i2) {
                return a3;
              }
            }
            s2 += u2, c2 += u2;
          }
        }
      };
    })(/* @__PURE__ */ ((e3) => (n2) => {
      const t2 = hashIntlFormatParts(e3, n2 * Hr);
      return isoArgsToEpochSec(parseIntlPartsYear(t2), parseInt(t2.month), parseInt(t2.day), parseInt(t2.hour), parseInt(t2.minute), parseInt(t2.second)) - n2;
    })(e2));
  }
  getOffsetNanosecondsFor(e2) {
    return this.$.V(epochNanoToSec(e2)) * _r;
  }
  getPossibleInstantsFor(e2) {
    const [n2, t2] = [isoArgsToEpochSec((o2 = e2).isoYear, o2.isoMonth, o2.isoDay, o2.isoHour, o2.isoMinute, o2.isoSecond), o2.isoMillisecond * be + o2.isoMicrosecond * Vr + o2.isoNanosecond];
    var o2;
    return this.$.G(n2).map(((e3) => checkEpochNanoInBounds(moveBigNano(he(e3, _r), t2))));
  }
  l(e2, n2) {
    const [t2, o2] = epochNanoToSecMod(e2), r2 = this.$.l(t2 + (n2 > 0 || o2 ? 1 : 0), n2);
    if (void 0 !== r2) {
      return he(r2, _r);
    }
  }
};
var Pa = "([+\u2212-])";
var va = "(?:[.,](\\d{1,9}))?";
var Ea = `(?:(?:${Pa}(\\d{6}))|(\\d{4}))-?(\\d{2})`;
var Sa = "(\\d{2})(?::?(\\d{2})(?::?(\\d{2})" + va + ")?)?";
var Fa = Pa + Sa;
var ba = Ea + "-?(\\d{2})(?:[T ]" + Sa + "(Z|" + Fa + ")?)?";
var Oa = "\\[(!?)([^\\]]*)\\]";
var wa = `((?:${Oa}){0,9})`;
var Ba = /* @__PURE__ */ createRegExp(Ea + wa);
var ka = /* @__PURE__ */ createRegExp("(?:--)?(\\d{2})-?(\\d{2})" + wa);
var Ya = /* @__PURE__ */ createRegExp(ba + wa);
var Ca = /* @__PURE__ */ createRegExp("T?" + Sa + "(?:" + Fa + ")?" + wa);
var Za = /* @__PURE__ */ createRegExp(Fa);
var Ra = /* @__PURE__ */ new RegExp(Oa, "g");
var za = /* @__PURE__ */ createRegExp(`${Pa}?P(\\d+Y)?(\\d+M)?(\\d+W)?(\\d+D)?(?:T(?:(\\d+)${va}H)?(?:(\\d+)${va}M)?(?:(\\d+)${va}S)?)?`);
var qa = /* @__PURE__ */ Jn(((e2) => new En(Zi, {
  timeZone: e2,
  era: "short",
  year: "numeric",
  month: "numeric",
  day: "numeric",
  hour: "numeric",
  minute: "numeric",
  second: "numeric"
})));
var Ua = /^(AC|AE|AG|AR|AS|BE|BS|CA|CN|CS|CT|EA|EC|IE|IS|JS|MI|NE|NS|PL|PN|PR|PS|SS|VS)T$/;
var Aa = /* @__PURE__ */ Jn(createIntlCalendar);
var La = /* @__PURE__ */ Jn(((e2) => new En(Zi, {
  calendar: e2,
  timeZone: Ta,
  era: "short",
  year: "numeric",
  month: "short",
  day: "numeric"
})));
var Wa = /^M(\d{2})(L?)$/;
var ja = {
  era: toStringViaPrimitive,
  eraYear: toInteger,
  year: toInteger,
  month: toPositiveInteger,
  monthCode: toStringViaPrimitive,
  day: toPositiveInteger
};
var xa = /* @__PURE__ */ jr(w, toInteger);
var $a = /* @__PURE__ */ jr(F, toStrictInteger);
var Ga = /* @__PURE__ */ Object.assign({}, ja, xa, $a, {
  offset: toStringViaPrimitive
});
var Ha = /* @__PURE__ */ E(remapProps, w, j);
var Va = {
  dateAdd(e2, n2, t2) {
    const o2 = H(t2);
    let r2, { years: i2, months: a2, weeks: s2, days: c2 } = n2;
    if (c2 += durationFieldsToBigNano(n2, 5)[0], i2 || a2) {
      r2 = ((e3, n3, t3, o3, r3) => {
        let [i3, a3, s3] = e3.h(n3);
        if (t3) {
          const [n4, o4] = e3.I(i3, a3);
          i3 += t3, a3 = monthCodeNumberToMonth(n4, o4, e3.U(i3)), a3 = clampEntity("month", a3, 1, e3.L(i3), r3);
        }
        return o3 && ([i3, a3] = e3._(i3, a3, o3)), s3 = clampEntity("day", s3, 1, e3.j(i3, a3), r3), e3.q(i3, a3, s3);
      })(this, e2, i2, a2, o2);
    } else {
      if (!s2 && !c2) {
        return e2;
      }
      r2 = isoToEpochMilli(e2);
    }
    return r2 += (7 * s2 + c2) * Gr, checkIsoDateInBounds(epochMilliToIso(r2));
  },
  dateUntil(e2, n2, t2) {
    if (t2 <= 7) {
      let o3 = 0, r3 = diffDays({
        ...e2,
        ...Dt
      }, {
        ...n2,
        ...Dt
      });
      return 7 === t2 && ([o3, r3] = divModTrunc(r3, 7)), {
        ...Si,
        weeks: o3,
        days: r3
      };
    }
    const o2 = this.h(e2), r2 = this.h(n2);
    let [i2, a2, s2] = ((e3, n3, t3, o3, r3, i3, a3) => {
      let s3 = r3 - n3, c2 = i3 - t3, u2 = a3 - o3;
      if (s3 || c2) {
        const l2 = Math.sign(s3 || c2);
        let f2 = e3.j(r3, i3), d2 = 0;
        if (Math.sign(u2) === -l2) {
          const o4 = f2;
          [r3, i3] = e3._(r3, i3, -l2), s3 = r3 - n3, c2 = i3 - t3, f2 = e3.j(r3, i3), d2 = l2 < 0 ? -o4 : f2;
        }
        if (u2 = a3 - Math.min(o3, f2) + d2, s3) {
          const [o4, a4] = e3.I(n3, t3), [u3, f3] = e3.I(r3, i3);
          if (c2 = u3 - o4 || Number(f3) - Number(a4), Math.sign(c2) === -l2) {
            const t4 = l2 < 0 && -e3.L(r3);
            s3 = (r3 -= l2) - n3, c2 = i3 - monthCodeNumberToMonth(o4, a4, e3.U(r3)) + (t4 || e3.L(r3));
          }
        }
      }
      return [s3, c2, u2];
    })(this, ...o2, ...r2);
    return 8 === t2 && (a2 += this.J(i2, o2[0]), i2 = 0), {
      ...Si,
      years: i2,
      months: a2,
      days: s2
    };
  },
  dateFromFields(e2, n2) {
    const t2 = H(n2), o2 = refineYear(this, e2), r2 = refineMonth(this, e2, o2, t2), i2 = refineDay(this, e2, r2, o2, t2);
    return v(checkIsoDateInBounds(this.P(o2, r2, i2)), this.id || X);
  },
  yearMonthFromFields(e2, n2) {
    const t2 = H(n2), o2 = refineYear(this, e2), r2 = refineMonth(this, e2, o2, t2);
    return createPlainYearMonthSlots(checkIsoYearMonthInBounds(this.P(o2, r2, 1)), this.id || X);
  },
  monthDayFromFields(e2, n2) {
    const t2 = H(n2), o2 = !this.id, { monthCode: r2, year: i2, month: a2 } = e2;
    let s2, c2, u2, l2, f2;
    if (void 0 !== r2) {
      [s2, c2] = parseMonthCode(r2), f2 = getDefinedProp(e2, "day");
      const n3 = this.N(s2, c2, f2);
      if (!n3) {
        throw new RangeError(yr);
      }
      if ([u2, l2] = n3, void 0 !== a2 && a2 !== l2) {
        throw new RangeError(Mr);
      }
      o2 && (l2 = clampEntity("month", l2, 1, xi, 1), f2 = clampEntity("day", f2, 1, computeIsoDaysInMonth(void 0 !== i2 ? i2 : u2, l2), t2));
    } else {
      u2 = void 0 === i2 && o2 ? ji : refineYear(this, e2), l2 = refineMonth(this, e2, u2, t2), f2 = refineDay(this, e2, l2, u2, t2);
      const n3 = this.U(u2);
      c2 = l2 === n3, s2 = monthToMonthCodeNumber(l2, n3);
      const r3 = this.N(s2, c2, f2);
      if (!r3) {
        throw new RangeError(yr);
      }
      [u2, l2] = r3;
    }
    return createPlainMonthDaySlots(checkIsoDateInBounds(this.P(u2, l2, f2)), this.id || X);
  },
  fields(e2) {
    return getCalendarEraOrigins(this) && e2.includes("year") ? [...e2, ...ii] : e2;
  },
  mergeFields(e2, n2) {
    const t2 = Object.assign(/* @__PURE__ */ Object.create(null), e2);
    return spliceFields(t2, n2, ui), getCalendarEraOrigins(this) && (spliceFields(t2, n2, ai), this.id === Ti && spliceFields(t2, n2, mi, ii)), t2;
  },
  inLeapYear(e2) {
    const [n2] = this.h(e2);
    return this.K(n2);
  },
  monthsInYear(e2) {
    const [n2] = this.h(e2);
    return this.L(n2);
  },
  daysInMonth(e2) {
    const [n2, t2] = this.h(e2);
    return this.j(n2, t2);
  },
  daysInYear(e2) {
    const [n2] = this.h(e2);
    return this.X(n2);
  },
  dayOfYear: computeNativeDayOfYear,
  era(e2) {
    return this.ee(e2)[0];
  },
  eraYear(e2) {
    return this.ee(e2)[1];
  },
  monthCode(e2) {
    const [n2, t2] = this.h(e2), [o2, r2] = this.I(n2, t2);
    return ((e3, n3) => "M" + xr(e3) + (n3 ? "L" : ""))(o2, r2);
  },
  dayOfWeek: computeIsoDayOfWeek,
  daysInWeek() {
    return 7;
  }
};
var _a = {
  dayOfYear: computeNativeDayOfYear,
  h: computeIsoDateParts,
  q: isoArgsToEpochMilli
};
var Ja = /* @__PURE__ */ Object.assign({}, _a, {
  weekOfYear: computeNativeWeekOfYear,
  yearOfWeek: computeNativeYearOfWeek,
  R(e2) {
    function computeWeekShift(e3) {
      return (7 - e3 < n2 ? 7 : 0) - e3;
    }
    function computeWeeksInYear(e3) {
      const n3 = computeIsoDaysInYear(l2 + e3), t3 = e3 || 1, o3 = computeWeekShift(modFloor(a2 + n3 * t3, 7));
      return c2 = (n3 + (o3 - s2) * t3) / 7;
    }
    const n2 = this.id ? 1 : 4, t2 = computeIsoDayOfWeek(e2), o2 = this.dayOfYear(e2), r2 = modFloor(t2 - 1, 7), i2 = o2 - 1, a2 = modFloor(r2 - i2, 7), s2 = computeWeekShift(a2);
    let c2, u2 = Math.floor((i2 - s2) / 7) + 1, l2 = e2.isoYear;
    return u2 ? u2 > computeWeeksInYear(0) && (u2 = 1, l2++) : (u2 = computeWeeksInYear(-1), l2--), [u2, l2, c2];
  }
});
var Ka = {
  dayOfYear: computeNativeDayOfYear,
  h: computeIntlDateParts,
  q: computeIntlEpochMilli,
  weekOfYear: computeNativeWeekOfYear,
  yearOfWeek: computeNativeYearOfWeek,
  R() {
    return [];
  }
};
var Y = /* @__PURE__ */ createNativeOpsCreator(/* @__PURE__ */ Object.assign({}, Va, Ja, {
  h: computeIsoDateParts,
  ee(e2) {
    return this.id === gi ? computeGregoryEraParts(e2) : this.id === Ti ? Gi(e2) : [];
  },
  I: (e2, n2) => [n2, 0],
  N(e2, n2) {
    if (!n2) {
      return [ji, e2];
    }
  },
  K: computeIsoInLeapYear,
  U() {
  },
  L: computeIsoMonthsInYear,
  J: (e2) => e2 * xi,
  j: computeIsoDaysInMonth,
  X: computeIsoDaysInYear,
  P: (e2, n2, t2) => ({
    isoYear: e2,
    isoMonth: n2,
    isoDay: t2
  }),
  q: isoArgsToEpochMilli,
  _: (e2, n2, t2) => (e2 += divTrunc(t2, xi), (n2 += modTrunc(t2, xi)) < 1 ? (e2--, n2 += xi) : n2 > xi && (e2++, n2 -= xi), [e2, n2]),
  year(e2) {
    return e2.isoYear;
  },
  month(e2) {
    return e2.isoMonth;
  },
  day: (e2) => e2.isoDay
}), /* @__PURE__ */ Object.assign({}, Va, Ka, {
  h: computeIntlDateParts,
  ee(e2) {
    const n2 = this.O(e2);
    return [n2.era, n2.eraYear];
  },
  I(e2, n2) {
    const t2 = computeIntlLeapMonth.call(this, e2);
    return [monthToMonthCodeNumber(n2, t2), t2 === n2];
  },
  N(e2, n2, t2) {
    let [o2, r2, i2] = computeIntlDateParts.call(this, {
      isoYear: ji,
      isoMonth: xi,
      isoDay: 31
    });
    const a2 = computeIntlLeapMonth.call(this, o2), s2 = r2 === a2;
    1 === (compareNumbers(e2, monthToMonthCodeNumber(r2, a2)) || compareNumbers(Number(n2), Number(s2)) || compareNumbers(t2, i2)) && o2--;
    for (let r3 = 0; r3 < 100; r3++) {
      const i3 = o2 - r3, a3 = computeIntlLeapMonth.call(this, i3), s3 = monthCodeNumberToMonth(e2, n2, a3);
      if (n2 === (s3 === a3) && t2 <= computeIntlDaysInMonth.call(this, i3, s3)) {
        return [i3, s3];
      }
    }
  },
  K(e2) {
    const n2 = computeIntlDaysInYear.call(this, e2);
    return n2 > computeIntlDaysInYear.call(this, e2 - 1) && n2 > computeIntlDaysInYear.call(this, e2 + 1);
  },
  U: computeIntlLeapMonth,
  L: computeIntlMonthsInYear,
  J(e2, n2) {
    const t2 = n2 + e2, o2 = Math.sign(e2), r2 = o2 < 0 ? -1 : 0;
    let i2 = 0;
    for (let e3 = n2; e3 !== t2; e3 += o2) {
      i2 += computeIntlMonthsInYear.call(this, e3 + r2);
    }
    return i2;
  },
  j: computeIntlDaysInMonth,
  X: computeIntlDaysInYear,
  P(e2, n2, t2) {
    return epochMilliToIso(computeIntlEpochMilli.call(this, e2, n2, t2));
  },
  q: computeIntlEpochMilli,
  _(e2, n2, t2) {
    if (t2) {
      if (n2 += t2, !Number.isSafeInteger(n2)) {
        throw new RangeError(Cr);
      }
      if (t2 < 0) {
        for (; n2 < 1; ) {
          n2 += computeIntlMonthsInYear.call(this, --e2);
        }
      } else {
        let t3;
        for (; n2 > (t3 = computeIntlMonthsInYear.call(this, e2)); ) {
          n2 -= t3, e2++;
        }
      }
    }
    return [e2, n2];
  },
  year(e2) {
    return this.O(e2).year;
  },
  month(e2) {
    const { year: n2, F: t2 } = this.O(e2), { C: o2 } = this.B(n2);
    return o2[t2] + 1;
  },
  day(e2) {
    return this.O(e2).day;
  }
}));
var Qa = "numeric";
var Xa = ["timeZoneName"];
var es = {
  month: Qa,
  day: Qa
};
var ns = {
  year: Qa,
  month: Qa
};
var ts = /* @__PURE__ */ Object.assign({}, ns, {
  day: Qa
});
var os = {
  hour: Qa,
  minute: Qa,
  second: Qa
};
var rs = /* @__PURE__ */ Object.assign({}, ts, os);
var is = /* @__PURE__ */ Object.assign({}, rs, {
  timeZoneName: "short"
});
var as = /* @__PURE__ */ Object.keys(ns);
var ss = /* @__PURE__ */ Object.keys(es);
var cs = /* @__PURE__ */ Object.keys(ts);
var us = /* @__PURE__ */ Object.keys(os);
var ls = ["dateStyle"];
var fs = /* @__PURE__ */ as.concat(ls);
var ds = /* @__PURE__ */ ss.concat(ls);
var ms = /* @__PURE__ */ cs.concat(ls, ["weekday"]);
var ps = /* @__PURE__ */ us.concat(["dayPeriod", "timeStyle"]);
var hs = /* @__PURE__ */ ms.concat(ps);
var gs = /* @__PURE__ */ hs.concat(Xa);
var Ts = /* @__PURE__ */ Xa.concat(ps);
var Ds = /* @__PURE__ */ Xa.concat(ms);
var Is = /* @__PURE__ */ Xa.concat(["day", "weekday"], ps);
var Ms = /* @__PURE__ */ Xa.concat(["year", "weekday"], ps);
var Ns = {};
var t = [/* @__PURE__ */ createOptionsTransformer(hs, rs), y];
var s = [/* @__PURE__ */ createOptionsTransformer(gs, is), y, 0, (e2, n2) => {
  const t2 = I(e2.timeZone);
  if (n2 && I(n2.timeZone) !== t2) {
    throw new RangeError(Fr);
  }
  return t2;
}];
var n = [/* @__PURE__ */ createOptionsTransformer(hs, rs, Xa), isoToEpochMilli];
var o = [/* @__PURE__ */ createOptionsTransformer(ms, ts, Ts), isoToEpochMilli];
var r = [/* @__PURE__ */ createOptionsTransformer(ps, os, Ds), (e2) => isoTimeFieldsToNano(e2) / be];
var a = [/* @__PURE__ */ createOptionsTransformer(fs, ns, Is), isoToEpochMilli, 1];
var i = [/* @__PURE__ */ createOptionsTransformer(ds, es, Ms), isoToEpochMilli, 1];
var ys;

// node_modules/temporal-polyfill/chunks/classApi.js
function createSlotClass(e2, t2, n2, o2, r2) {
  function Class(...e3) {
    if (!(this instanceof Class)) {
      throw new TypeError(P);
    }
    oo(this, t2(...e3));
  }
  function bindMethod(e3, t3) {
    return Object.defineProperties((function(...t4) {
      return e3.call(this, getSpecificSlots(this), ...t4);
    }), D(t3));
  }
  function getSpecificSlots(t3) {
    const n3 = no(t3);
    if (!n3 || n3.branding !== e2) {
      throw new TypeError(P);
    }
    return n3;
  }
  return Object.defineProperties(Class.prototype, {
    ...O(T(bindMethod, n2)),
    ...p(T(bindMethod, o2)),
    ...h("Temporal." + e2)
  }), Object.defineProperties(Class, {
    ...p(r2),
    ...D(e2)
  }), [Class, (e3) => {
    const t3 = Object.create(Class.prototype);
    return oo(t3, e3), t3;
  }, getSpecificSlots];
}
function createProtocolValidator(e2) {
  return e2 = e2.concat("id").sort(), (t2) => {
    if (!C(t2, e2)) {
      throw new TypeError(g);
    }
    return t2;
  };
}
function rejectInvalidBag(e2) {
  if (no(e2) || void 0 !== e2.calendar || void 0 !== e2.timeZone) {
    throw new TypeError(Z);
  }
  return e2;
}
function createCalendarFieldMethods(e2, t2) {
  const n2 = {};
  for (const o2 in e2) {
    n2[o2] = ({ o: e3 }, n3) => {
      const r2 = no(n3) || {}, { branding: a2 } = r2, i2 = a2 === J || t2.includes(a2) ? r2 : toPlainDateSlots(n3);
      return e3[o2](i2);
    };
  }
  return n2;
}
function createCalendarGetters(e2) {
  const t2 = {};
  for (const n2 in e2) {
    t2[n2] = (e3) => {
      const { calendar: t3 } = e3;
      return (o2 = t3, "string" == typeof o2 ? Y(o2) : (r2 = o2, Object.assign(Object.create(co), {
        i: r2
      })))[n2](e3);
      var o2, r2;
    };
  }
  return t2;
}
function neverValueOf() {
  throw new TypeError(A);
}
function createCalendarFromSlots({ calendar: e2 }) {
  return "string" == typeof e2 ? new lr(e2) : e2;
}
function toPlainMonthDaySlots(e2, t2) {
  if (t2 = U(t2), z(e2)) {
    const n3 = no(e2);
    if (n3 && n3.branding === q) {
      return H(t2), n3;
    }
    const o2 = extractCalendarSlotFromBag(e2);
    return K(Qo(o2 || X), !o2, e2, t2);
  }
  const n2 = Q(Y, e2);
  return H(t2), n2;
}
function getOffsetNanosecondsForAdapter(e2, t2, n2) {
  return o2 = t2.call(e2, Co(_(n2))), ae(u(o2));
  var o2;
}
function createAdapterOps(e2, t2 = ho) {
  const n2 = Object.keys(t2).sort(), o2 = {};
  for (const r2 of n2) {
    o2[r2] = E(t2[r2], e2, $(e2[r2]));
  }
  return o2;
}
function createTimeZoneOps(e2, t2) {
  return "string" == typeof e2 ? ie(e2) : createAdapterOps(e2, t2);
}
function createTimeZoneOffsetOps(e2) {
  return createTimeZoneOps(e2, Do);
}
function toInstantSlots(e2) {
  if (z(e2)) {
    const t2 = no(e2);
    if (t2) {
      switch (t2.branding) {
        case Oe:
          return t2;
        case Te:
          return _(t2.epochNanoseconds);
      }
    }
  }
  return pe(e2);
}
function getImplTransition(e2, t2, n2) {
  const o2 = t2.l(toInstantSlots(n2).epochNanoseconds, e2);
  return o2 ? Co(_(o2)) : null;
}
function refineTimeZoneSlot(e2) {
  return z(e2) ? (no(e2) || {}).timeZone || Fo(e2) : ((e3) => ye(Ne(m(e3))))(e2);
}
function toPlainTimeSlots(e2, t2) {
  if (z(e2)) {
    const n2 = no(e2) || {};
    switch (n2.branding) {
      case xe:
        return H(t2), n2;
      case We:
        return H(t2), Ge(n2);
      case Te:
        return H(t2), Re(createTimeZoneOffsetOps, n2);
    }
    return Ue(e2, t2);
  }
  return H(t2), ze(e2);
}
function optionalToPlainTimeFields(e2) {
  return void 0 === e2 ? void 0 : toPlainTimeSlots(e2);
}
function toPlainYearMonthSlots(e2, t2) {
  if (t2 = U(t2), z(e2)) {
    const n3 = no(e2);
    return n3 && n3.branding === L ? (H(t2), n3) : nt(Ho(getCalendarSlotFromBag(e2)), e2, t2);
  }
  const n2 = ot(Y, e2);
  return H(t2), n2;
}
function toPlainDateTimeSlots(e2, t2) {
  if (t2 = U(t2), z(e2)) {
    const n3 = no(e2) || {};
    switch (n3.branding) {
      case We:
        return H(t2), n3;
      case J:
        return H(t2), ee({
          ...n3,
          ...Dt
        });
      case Te:
        return H(t2), ht(createTimeZoneOffsetOps, n3);
    }
    return Pt(Ko(getCalendarSlotFromBag(e2)), e2, t2);
  }
  const n2 = Ct(e2);
  return H(t2), n2;
}
function toPlainDateSlots(e2, t2) {
  if (t2 = U(t2), z(e2)) {
    const n3 = no(e2) || {};
    switch (n3.branding) {
      case J:
        return H(t2), n3;
      case We:
        return H(t2), v(n3);
      case Te:
        return H(t2), Bt(createTimeZoneOffsetOps, n3);
    }
    return Yt(Ko(getCalendarSlotFromBag(e2)), e2, t2);
  }
  const n2 = At(e2);
  return H(t2), n2;
}
function dayAdapter(e2, t2, n2) {
  return d(t2.call(e2, Yo(v(n2, e2))));
}
function createCompoundOpsCreator(e2) {
  return (t2) => "string" == typeof t2 ? Y(t2) : ((e3, t3) => {
    const n2 = Object.keys(t3).sort(), o2 = {};
    for (const r2 of n2) {
      o2[r2] = E(t3[r2], e3, e3[r2]);
    }
    return o2;
  })(t2, e2);
}
function toDurationSlots(e2) {
  if (z(e2)) {
    const t2 = no(e2);
    return t2 && t2.branding === qt ? t2 : Ht(e2);
  }
  return Kt(e2);
}
function refinePublicRelativeTo(e2) {
  if (void 0 !== e2) {
    if (z(e2)) {
      const t2 = no(e2) || {};
      switch (t2.branding) {
        case Te:
        case J:
          return t2;
        case We:
          return v(t2);
      }
      const n2 = getCalendarSlotFromBag(e2);
      return {
        ...Qt(refineTimeZoneSlot, createTimeZoneOps, Ko(n2), e2),
        calendar: n2
      };
    }
    return Xt(e2);
  }
}
function getCalendarSlotFromBag(e2) {
  return extractCalendarSlotFromBag(e2) || X;
}
function extractCalendarSlotFromBag(e2) {
  const { calendar: t2 } = e2;
  if (void 0 !== t2) {
    return refineCalendarSlot(t2);
  }
}
function refineCalendarSlot(e2) {
  return z(e2) ? (no(e2) || {}).calendar || cr(e2) : ((e3) => an(sn(m(e3))))(e2);
}
function toZonedDateTimeSlots(e2, t2) {
  if (t2 = U(t2), z(e2)) {
    const n2 = no(e2);
    if (n2 && n2.branding === Te) {
      return wn(t2), n2;
    }
    const o2 = getCalendarSlotFromBag(e2);
    return jn(refineTimeZoneSlot, createTimeZoneOps, Ko(o2), o2, e2, t2);
  }
  return Mn(e2, t2);
}
function adaptDateMethods(e2) {
  return T(((e3) => (t2) => e3(slotsToIso(t2))), e2);
}
function slotsToIso(e2) {
  return fn(e2, createTimeZoneOffsetOps);
}
function createDateTimeFormatClass() {
  const e2 = En.prototype, t2 = Object.getOwnPropertyDescriptors(e2), n2 = Object.getOwnPropertyDescriptors(En), DateTimeFormat = function(e3, t3 = {}) {
    if (!(this instanceof DateTimeFormat)) {
      return new DateTimeFormat(e3, t3);
    }
    Or.set(this, ((e4, t4 = {}) => {
      const n3 = new En(e4, t4), o2 = n3.resolvedOptions(), r2 = o2.locale, a2 = Vn(Object.keys(t4), o2), i2 = Jn(createFormatPrepperForBranding), prepFormat = (...e5) => {
        let t5;
        const o3 = e5.map(((e6, n4) => {
          const o4 = no(e6), r3 = (o4 || {}).branding;
          if (n4 && t5 && t5 !== r3) {
            throw new TypeError(kn);
          }
          return t5 = r3, o4;
        }));
        return t5 ? i2(t5)(r2, a2, ...o3) : [n3, ...e5];
      };
      return prepFormat.u = n3, prepFormat;
    })(e3, t3));
  };
  for (const e3 in t2) {
    const n3 = t2[e3], o2 = e3.startsWith("format") && createFormatMethod(e3);
    "function" == typeof n3.value ? n3.value = "constructor" === e3 ? DateTimeFormat : o2 || createProxiedMethod(e3) : o2 && (n3.get = function() {
      return o2.bind(this);
    });
  }
  return n2.prototype.value = Object.create(e2, t2), Object.defineProperties(DateTimeFormat, n2), DateTimeFormat;
}
function createFormatMethod(e2) {
  return function(...t2) {
    const n2 = Or.get(this), [o2, ...r2] = n2(...t2);
    return o2[e2](...r2);
  };
}
function createProxiedMethod(e2) {
  return function(...t2) {
    return Or.get(this).u[e2](...t2);
  };
}
function createFormatPrepperForBranding(t2) {
  const n2 = xn[t2];
  if (!n2) {
    throw new TypeError(Ln(t2));
  }
  return e(n2, Jn(qn));
}
var xn = {
  Instant: t,
  PlainDateTime: n,
  PlainDate: o,
  PlainTime: r,
  PlainYearMonth: a,
  PlainMonthDay: i
};
var Rn = /* @__PURE__ */ e(t);
var Wn = /* @__PURE__ */ e(s);
var Gn = /* @__PURE__ */ e(n);
var Un = /* @__PURE__ */ e(o);
var zn = /* @__PURE__ */ e(r);
var Hn = /* @__PURE__ */ e(a);
var Kn = /* @__PURE__ */ e(i);
var Qn = {
  era: l,
  eraYear: c,
  year: u,
  month: d,
  daysInMonth: d,
  daysInYear: d,
  inLeapYear: f,
  monthsInYear: d
};
var Xn = {
  monthCode: m
};
var $n = {
  day: d
};
var _n = {
  dayOfWeek: d,
  dayOfYear: d,
  weekOfYear: S,
  yearOfWeek: c,
  daysInWeek: d
};
var eo = /* @__PURE__ */ Object.assign({}, Qn, Xn, $n, _n);
var to = /* @__PURE__ */ new WeakMap();
var no = /* @__PURE__ */ to.get.bind(to);
var oo = /* @__PURE__ */ to.set.bind(to);
var ro = {
  ...createCalendarFieldMethods(Qn, [L]),
  ...createCalendarFieldMethods(_n, []),
  ...createCalendarFieldMethods(Xn, [L, q]),
  ...createCalendarFieldMethods($n, [q])
};
var ao = /* @__PURE__ */ createCalendarGetters(eo);
var io = /* @__PURE__ */ createCalendarGetters({
  ...Qn,
  ...Xn
});
var so = /* @__PURE__ */ createCalendarGetters({
  ...Xn,
  ...$n
});
var lo = {
  calendarId: (e2) => I(e2.calendar)
};
var co = /* @__PURE__ */ T(((e2, t2) => function(n2) {
  const { i: o2 } = this;
  return e2(o2[t2](Yo(v(n2, o2))));
}), eo);
var uo = /* @__PURE__ */ b(((e2) => (t2) => t2[e2]), F.concat("sign"));
var fo = /* @__PURE__ */ b(((e2, t2) => (e3) => e3[j[t2]]), w);
var mo = {
  epochSeconds: M,
  epochMilliseconds: y,
  epochMicroseconds: N,
  epochNanoseconds: B
};
var So = /* @__PURE__ */ E(V, /* @__PURE__ */ new Set(["branding"]));
var [Oo, To, po] = createSlotClass(q, E(G, refineCalendarSlot), {
  ...lo,
  ...so
}, {
  getISOFields: So,
  getCalendar: createCalendarFromSlots,
  with(e2, t2, n2) {
    return To(k(_o, e2, this, rejectInvalidBag(t2), n2));
  },
  equals: (e2, t2) => x(e2, toPlainMonthDaySlots(t2)),
  toPlainDate(e2, t2) {
    return Yo(R($o, e2, this, t2));
  },
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = Kn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: W,
  toJSON: (e2) => W(e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => To(toPlainMonthDaySlots(e2, t2))
});
var ho = {
  getOffsetNanosecondsFor: getOffsetNanosecondsForAdapter,
  getPossibleInstantsFor(e2, t2, n2) {
    const o2 = [...t2.call(e2, No(ee(n2, X)))].map(((e3) => go(e3).epochNanoseconds)), r2 = o2.length;
    return r2 > 1 && (o2.sort(te), ne(oe(re(o2[0], o2[r2 - 1])))), o2;
  }
};
var Do = {
  getOffsetNanosecondsFor: getOffsetNanosecondsForAdapter
};
var [Po, Co, go] = createSlotClass(Oe, Se, mo, {
  add: (e2, t2) => Co(se(0, e2, toDurationSlots(t2))),
  subtract: (e2, t2) => Co(se(1, e2, toDurationSlots(t2))),
  until: (e2, t2, n2) => ar(le(0, e2, toInstantSlots(t2), n2)),
  since: (e2, t2, n2) => ar(le(1, e2, toInstantSlots(t2), n2)),
  round: (e2, t2) => Co(ce(e2, t2)),
  equals: (e2, t2) => ue(e2, toInstantSlots(t2)),
  toZonedDateTime(e2, t2) {
    const n2 = de(t2);
    return dr(fe(e2, refineTimeZoneSlot(n2.timeZone), refineCalendarSlot(n2.calendar)));
  },
  toZonedDateTimeISO: (e2, t2) => dr(fe(e2, refineTimeZoneSlot(t2))),
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = Rn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: (e2, t2) => me(refineTimeZoneSlot, createTimeZoneOffsetOps, e2, t2),
  toJSON: (e2) => me(refineTimeZoneSlot, createTimeZoneOffsetOps, e2),
  valueOf: neverValueOf
}, {
  from: (e2) => Co(toInstantSlots(e2)),
  fromEpochSeconds: (e2) => Co(De(e2)),
  fromEpochMilliseconds: (e2) => Co(Pe(e2)),
  fromEpochMicroseconds: (e2) => Co(Ce(e2)),
  fromEpochNanoseconds: (e2) => Co(ge(e2)),
  compare: (e2, t2) => Ze(toInstantSlots(e2), toInstantSlots(t2))
});
var [Zo, bo] = createSlotClass("TimeZone", ((e2) => {
  const t2 = Me(e2);
  return {
    branding: "TimeZone",
    id: t2,
    o: ie(t2)
  };
}), {
  id: (e2) => e2.id
}, {
  getPossibleInstantsFor: ({ o: e2 }, t2) => e2.getPossibleInstantsFor(toPlainDateTimeSlots(t2)).map(((e3) => Co(_(e3)))),
  getOffsetNanosecondsFor: ({ o: e2 }, t2) => e2.getOffsetNanosecondsFor(toInstantSlots(t2).epochNanoseconds),
  getOffsetStringFor(e2, t2) {
    const n2 = toInstantSlots(t2).epochNanoseconds, o2 = createAdapterOps(this, Do).getOffsetNanosecondsFor(n2);
    return Fe(o2);
  },
  getPlainDateTimeFor(e2, t2, n2 = X) {
    const o2 = toInstantSlots(t2).epochNanoseconds, r2 = createAdapterOps(this, Do).getOffsetNanosecondsFor(o2);
    return No(ee(Ie(o2, r2), refineCalendarSlot(n2)));
  },
  getInstantFor(e2, t2, n2) {
    const o2 = toPlainDateTimeSlots(t2), r2 = ve(n2), a2 = createAdapterOps(this);
    return Co(_(we(a2, o2, r2)));
  },
  getNextTransition: ({ o: e2 }, t2) => getImplTransition(1, e2, t2),
  getPreviousTransition: ({ o: e2 }, t2) => getImplTransition(-1, e2, t2),
  equals(e2, t2) {
    return !!je(this, refineTimeZoneSlot(t2));
  },
  toString: (e2) => e2.id,
  toJSON: (e2) => e2.id
}, {
  from(e2) {
    const t2 = refineTimeZoneSlot(e2);
    return "string" == typeof t2 ? new Zo(t2) : t2;
  }
});
var Fo = /* @__PURE__ */ createProtocolValidator(Object.keys(ho));
var [Io, vo] = createSlotClass(xe, ke, fo, {
  getISOFields: So,
  with(e2, t2, n2) {
    return vo(Be(this, rejectInvalidBag(t2), n2));
  },
  add: (e2, t2) => vo(Ye(0, e2, toDurationSlots(t2))),
  subtract: (e2, t2) => vo(Ye(1, e2, toDurationSlots(t2))),
  until: (e2, t2, n2) => ar(Ae(0, e2, toPlainTimeSlots(t2), n2)),
  since: (e2, t2, n2) => ar(Ae(1, e2, toPlainTimeSlots(t2), n2)),
  round: (e2, t2) => vo(Ee(e2, t2)),
  equals: (e2, t2) => Ve(e2, toPlainTimeSlots(t2)),
  toZonedDateTime: (e2, t2) => dr(Je(refineTimeZoneSlot, toPlainDateSlots, createTimeZoneOps, e2, t2)),
  toPlainDateTime: (e2, t2) => No(Le(e2, toPlainDateSlots(t2))),
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = zn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: qe,
  toJSON: (e2) => qe(e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => vo(toPlainTimeSlots(e2, t2)),
  compare: (e2, t2) => He(toPlainTimeSlots(e2), toPlainTimeSlots(t2))
});
var [wo, jo, Mo] = createSlotClass(L, E(tt, refineCalendarSlot), {
  ...lo,
  ...io
}, {
  getISOFields: So,
  getCalendar: createCalendarFromSlots,
  with(e2, t2, n2) {
    return jo(Ke(Xo, e2, this, rejectInvalidBag(t2), n2));
  },
  add: (e2, t2, n2) => jo(Qe(nr, 0, e2, toDurationSlots(t2), n2)),
  subtract: (e2, t2, n2) => jo(Qe(nr, 1, e2, toDurationSlots(t2), n2)),
  until: (e2, t2, n2) => ar(Xe(or, 0, e2, toPlainYearMonthSlots(t2), n2)),
  since: (e2, t2, n2) => ar(Xe(or, 1, e2, toPlainYearMonthSlots(t2), n2)),
  equals: (e2, t2) => $e(e2, toPlainYearMonthSlots(t2)),
  toPlainDate(e2, t2) {
    return Yo(_e($o, e2, this, t2));
  },
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = Hn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: et,
  toJSON: (e2) => et(e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => jo(toPlainYearMonthSlots(e2, t2)),
  compare: (e2, t2) => rt(toPlainYearMonthSlots(e2), toPlainYearMonthSlots(t2))
});
var [yo, No] = createSlotClass(We, E(pt, refineCalendarSlot), {
  ...lo,
  ...ao,
  ...fo
}, {
  getISOFields: So,
  getCalendar: createCalendarFromSlots,
  with(e2, t2, n2) {
    return No(at($o, e2, this, rejectInvalidBag(t2), n2));
  },
  withCalendar: (e2, t2) => No(it(e2, refineCalendarSlot(t2))),
  withPlainDate: (e2, t2) => No(st(e2, toPlainDateSlots(t2))),
  withPlainTime: (e2, t2) => No(lt(e2, optionalToPlainTimeFields(t2))),
  add: (e2, t2, n2) => No(ct(er, 0, e2, toDurationSlots(t2), n2)),
  subtract: (e2, t2, n2) => No(ct(er, 1, e2, toDurationSlots(t2), n2)),
  until: (e2, t2, n2) => ar(ut(tr, 0, e2, toPlainDateTimeSlots(t2), n2)),
  since: (e2, t2, n2) => ar(ut(tr, 1, e2, toPlainDateTimeSlots(t2), n2)),
  round: (e2, t2) => No(dt(e2, t2)),
  equals: (e2, t2) => ft(e2, toPlainDateTimeSlots(t2)),
  toZonedDateTime: (e2, t2, n2) => dr(mt(createTimeZoneOps, e2, refineTimeZoneSlot(t2), n2)),
  toPlainDate: (e2) => Yo(v(e2)),
  toPlainTime: (e2) => vo(Ge(e2)),
  toPlainYearMonth(e2) {
    return jo(St(Ho, e2, this));
  },
  toPlainMonthDay(e2) {
    return To(Ot(Qo, e2, this));
  },
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = Gn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: Tt,
  toJSON: (e2) => Tt(e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => No(toPlainDateTimeSlots(e2, t2)),
  compare: (e2, t2) => gt(toPlainDateTimeSlots(e2), toPlainDateTimeSlots(t2))
});
var [Bo, Yo, Ao] = createSlotClass(J, E(Nt, refineCalendarSlot), {
  ...lo,
  ...ao
}, {
  getISOFields: So,
  getCalendar: createCalendarFromSlots,
  with(e2, t2, n2) {
    return Yo(Zt($o, e2, this, rejectInvalidBag(t2), n2));
  },
  withCalendar: (e2, t2) => Yo(it(e2, refineCalendarSlot(t2))),
  add: (e2, t2, n2) => Yo(bt(er, 0, e2, toDurationSlots(t2), n2)),
  subtract: (e2, t2, n2) => Yo(bt(er, 1, e2, toDurationSlots(t2), n2)),
  until: (e2, t2, n2) => ar(Ft(tr, 0, e2, toPlainDateSlots(t2), n2)),
  since: (e2, t2, n2) => ar(Ft(tr, 1, e2, toPlainDateSlots(t2), n2)),
  equals: (e2, t2) => It(e2, toPlainDateSlots(t2)),
  toZonedDateTime(e2, t2) {
    const n2 = !z(t2) || t2 instanceof Zo ? {
      timeZone: t2
    } : t2;
    return dr(vt(refineTimeZoneSlot, toPlainTimeSlots, createTimeZoneOps, e2, n2));
  },
  toPlainDateTime: (e2, t2) => No(wt(e2, optionalToPlainTimeFields(t2))),
  toPlainYearMonth(e2) {
    return jo(jt(Ho, e2, this));
  },
  toPlainMonthDay(e2) {
    return To(Mt(Qo, e2, this));
  },
  toLocaleString(e2, t2, n2) {
    const [o2, r2] = Un(t2, n2, e2);
    return o2.format(r2);
  },
  toString: yt,
  toJSON: (e2) => yt(e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => Yo(toPlainDateSlots(e2, t2)),
  compare: (e2, t2) => rt(toPlainDateSlots(e2), toPlainDateSlots(t2))
});
var Eo = {
  fields(e2, t2, n2) {
    return [...t2.call(e2, n2)];
  }
};
var Vo = /* @__PURE__ */ Object.assign({
  dateFromFields(e2, t2, n2, o2) {
    return Ao(t2.call(e2, Object.assign(/* @__PURE__ */ Object.create(null), n2), o2));
  }
}, Eo);
var Jo = /* @__PURE__ */ Object.assign({
  yearMonthFromFields(e2, t2, n2, o2) {
    return Mo(t2.call(e2, Object.assign(/* @__PURE__ */ Object.create(null), n2), o2));
  }
}, Eo);
var Lo = /* @__PURE__ */ Object.assign({
  monthDayFromFields(e2, t2, n2, o2) {
    return po(t2.call(e2, Object.assign(/* @__PURE__ */ Object.create(null), n2), o2));
  }
}, Eo);
var qo = {
  mergeFields(e2, t2, n2, o2) {
    return de(t2.call(e2, Object.assign(/* @__PURE__ */ Object.create(null), n2), Object.assign(/* @__PURE__ */ Object.create(null), o2)));
  }
};
var ko = /* @__PURE__ */ Object.assign({}, Vo, qo);
var xo = /* @__PURE__ */ Object.assign({}, Jo, qo);
var Ro = /* @__PURE__ */ Object.assign({}, Lo, qo);
var Wo = {
  dateAdd(e2, t2, n2, o2, r2) {
    return Ao(t2.call(e2, Yo(v(n2, e2)), ar(Vt(o2)), r2));
  }
};
var Go = /* @__PURE__ */ Object.assign({}, Wo, {
  dateUntil(e2, t2, n2, o2, r2, a2) {
    return ir(t2.call(e2, Yo(v(n2, e2)), Yo(v(o2, e2)), Object.assign(/* @__PURE__ */ Object.create(null), a2, {
      largestUnit: Et[r2]
    })));
  }
});
var Uo = /* @__PURE__ */ Object.assign({}, Wo, {
  day: dayAdapter
});
var zo = /* @__PURE__ */ Object.assign({}, Go, {
  day: dayAdapter
});
var Ho = /* @__PURE__ */ createCompoundOpsCreator(Jo);
var Ko = /* @__PURE__ */ createCompoundOpsCreator(Vo);
var Qo = /* @__PURE__ */ createCompoundOpsCreator(Lo);
var Xo = /* @__PURE__ */ createCompoundOpsCreator(xo);
var $o = /* @__PURE__ */ createCompoundOpsCreator(ko);
var _o = /* @__PURE__ */ createCompoundOpsCreator(Ro);
var er = /* @__PURE__ */ createCompoundOpsCreator(Wo);
var tr = /* @__PURE__ */ createCompoundOpsCreator(Go);
var nr = /* @__PURE__ */ createCompoundOpsCreator(Uo);
var or = /* @__PURE__ */ createCompoundOpsCreator(zo);
var [rr, ar, ir] = createSlotClass(qt, Lt, {
  ...uo,
  blank: Jt
}, {
  with: (e2, t2) => ar(kt(e2, t2)),
  negated: (e2) => ar(xt(e2)),
  abs: (e2) => ar(Rt(e2)),
  add: (e2, t2, n2) => ar(Wt(refinePublicRelativeTo, tr, createTimeZoneOps, 0, e2, toDurationSlots(t2), n2)),
  subtract: (e2, t2, n2) => ar(Wt(refinePublicRelativeTo, tr, createTimeZoneOps, 1, e2, toDurationSlots(t2), n2)),
  round: (e2, t2) => ar(Gt(refinePublicRelativeTo, tr, createTimeZoneOps, e2, t2)),
  total: (e2, t2) => Ut(refinePublicRelativeTo, tr, createTimeZoneOps, e2, t2),
  toLocaleString(e2, t2, n2) {
    return Intl.DurationFormat ? new Intl.DurationFormat(t2, n2).format(this) : zt(e2);
  },
  toString: zt,
  toJSON: (e2) => zt(e2),
  valueOf: neverValueOf
}, {
  from: (e2) => ar(toDurationSlots(e2)),
  compare: (e2, t2, n2) => $t(refinePublicRelativeTo, er, createTimeZoneOps, toDurationSlots(e2), toDurationSlots(t2), n2)
});
var sr = {
  toString: (e2) => e2.id,
  toJSON: (e2) => e2.id,
  ...ro,
  dateAdd: ({ id: e2, o: t2 }, n2, o2, r2) => Yo(v(t2.dateAdd(toPlainDateSlots(n2), toDurationSlots(o2), r2), e2)),
  dateUntil: ({ o: e2 }, t2, n2, o2) => ar(Vt(e2.dateUntil(toPlainDateSlots(t2), toPlainDateSlots(n2), _t(o2)))),
  dateFromFields: ({ id: e2, o: t2 }, n2, o2) => Yo(Yt(t2, n2, o2, ln(e2))),
  yearMonthFromFields: ({ id: e2, o: t2 }, n2, o2) => jo(nt(t2, n2, o2, un(e2))),
  monthDayFromFields: ({ id: e2, o: t2 }, n2, o2) => To(K(t2, 0, n2, o2, cn(e2))),
  fields({ o: e2 }, t2) {
    const n2 = new Set(en), o2 = [];
    for (const e3 of t2) {
      if (m(e3), !n2.has(e3)) {
        throw new RangeError(tn(e3));
      }
      n2.delete(e3), o2.push(e3);
    }
    return e2.fields(o2);
  },
  mergeFields: ({ o: e2 }, t2, n2) => e2.mergeFields(nn(on(t2)), nn(on(n2)))
};
var [lr] = createSlotClass("Calendar", ((e2) => {
  const t2 = rn(e2);
  return {
    branding: "Calendar",
    id: t2,
    o: Y(t2)
  };
}), {
  id: (e2) => e2.id
}, sr, {
  from(e2) {
    const t2 = refineCalendarSlot(e2);
    return "string" == typeof t2 ? new lr(t2) : t2;
  }
});
var cr = /* @__PURE__ */ createProtocolValidator(Object.keys(sr).slice(4));
var [ur, dr] = createSlotClass(Te, E(vn, refineCalendarSlot, refineTimeZoneSlot), {
  ...mo,
  ...lo,
  ...adaptDateMethods(ao),
  ...adaptDateMethods(fo),
  offset: (e2) => Fe(slotsToIso(e2).offsetNanoseconds),
  offsetNanoseconds: (e2) => slotsToIso(e2).offsetNanoseconds,
  timeZoneId: (e2) => I(e2.timeZone),
  hoursInDay: (e2) => dn(createTimeZoneOps, e2)
}, {
  getISOFields: (e2) => mn(createTimeZoneOffsetOps, e2),
  getCalendar: createCalendarFromSlots,
  getTimeZone: ({ timeZone: e2 }) => "string" == typeof e2 ? new Zo(e2) : e2,
  with(e2, t2, n2) {
    return dr(Sn($o, createTimeZoneOps, e2, this, rejectInvalidBag(t2), n2));
  },
  withCalendar: (e2, t2) => dr(it(e2, refineCalendarSlot(t2))),
  withTimeZone: (e2, t2) => dr(On(e2, refineTimeZoneSlot(t2))),
  withPlainDate: (e2, t2) => dr(Tn(createTimeZoneOps, e2, toPlainDateSlots(t2))),
  withPlainTime: (e2, t2) => dr(pn(createTimeZoneOps, e2, optionalToPlainTimeFields(t2))),
  add: (e2, t2, n2) => dr(hn(er, createTimeZoneOps, 0, e2, toDurationSlots(t2), n2)),
  subtract: (e2, t2, n2) => dr(hn(er, createTimeZoneOps, 1, e2, toDurationSlots(t2), n2)),
  until: (e2, t2, n2) => ar(Vt(Dn(tr, createTimeZoneOps, 0, e2, toZonedDateTimeSlots(t2), n2))),
  since: (e2, t2, n2) => ar(Vt(Dn(tr, createTimeZoneOps, 1, e2, toZonedDateTimeSlots(t2), n2))),
  round: (e2, t2) => dr(Pn(createTimeZoneOps, e2, t2)),
  startOfDay: (e2) => dr(Cn(createTimeZoneOps, e2)),
  equals: (e2, t2) => gn(e2, toZonedDateTimeSlots(t2)),
  toInstant: (e2) => Co(Zn(e2)),
  toPlainDateTime: (e2) => No(ht(createTimeZoneOffsetOps, e2)),
  toPlainDate: (e2) => Yo(Bt(createTimeZoneOffsetOps, e2)),
  toPlainTime: (e2) => vo(Re(createTimeZoneOffsetOps, e2)),
  toPlainYearMonth(e2) {
    return jo(bn(Ho, e2, this));
  },
  toPlainMonthDay(e2) {
    return To(Fn(Qo, e2, this));
  },
  toLocaleString(e2, t2, n2 = {}) {
    const [o2, r2] = Wn(t2, n2, e2);
    return o2.format(r2);
  },
  toString: (e2, t2) => In(createTimeZoneOffsetOps, e2, t2),
  toJSON: (e2) => In(createTimeZoneOffsetOps, e2),
  valueOf: neverValueOf
}, {
  from: (e2, t2) => dr(toZonedDateTimeSlots(e2, t2)),
  compare: (e2, t2) => yn(toZonedDateTimeSlots(e2), toZonedDateTimeSlots(t2))
});
var fr = /* @__PURE__ */ Object.defineProperties({}, {
  ...h("Temporal.Now"),
  ...p({
    timeZoneId: () => Nn(),
    instant: () => Co(_(Bn())),
    zonedDateTime: (e2, t2 = Nn()) => dr(Yn(Bn(), refineTimeZoneSlot(t2), refineCalendarSlot(e2))),
    zonedDateTimeISO: (e2 = Nn()) => dr(Yn(Bn(), refineTimeZoneSlot(e2), X)),
    plainDateTime: (e2, t2 = Nn()) => No(ee(An(createTimeZoneOffsetOps(refineTimeZoneSlot(t2))), refineCalendarSlot(e2))),
    plainDateTimeISO: (e2 = Nn()) => No(ee(An(createTimeZoneOffsetOps(refineTimeZoneSlot(e2))), X)),
    plainDate: (e2, t2 = Nn()) => Yo(v(An(createTimeZoneOffsetOps(refineTimeZoneSlot(t2))), refineCalendarSlot(e2))),
    plainDateISO: (e2 = Nn()) => Yo(v(An(createTimeZoneOffsetOps(refineTimeZoneSlot(e2))), X)),
    plainTimeISO: (e2 = Nn()) => vo(Ge(An(createTimeZoneOffsetOps(refineTimeZoneSlot(e2)))))
  })
});
var mr = /* @__PURE__ */ Object.defineProperties({}, {
  ...h("Temporal"),
  ...p({
    PlainYearMonth: wo,
    PlainMonthDay: Oo,
    PlainDate: Bo,
    PlainTime: Io,
    PlainDateTime: yo,
    ZonedDateTime: ur,
    Instant: Po,
    Calendar: lr,
    TimeZone: Zo,
    Duration: rr,
    Now: fr
  })
});
var Sr = /* @__PURE__ */ createDateTimeFormatClass();
var Or = /* @__PURE__ */ new WeakMap();
var Tr = /* @__PURE__ */ Object.defineProperties(Object.create(Intl), p({
  DateTimeFormat: Sr
}));

// node_modules/inngest/helpers/strings.js
var { sha256 } = import_hash.default;
function timingSafeEqual(a2, b2) {
  if (a2.length !== b2.length) return false;
  let diff = 0;
  for (let i2 = 0; i2 < a2.length; i2++) diff |= a2.charCodeAt(i2) ^ b2.charCodeAt(i2);
  return diff === 0;
}
var stringify$1 = (input) => {
  return (0, import_json_stringify_safe2.default)(input, (_key, value) => {
    if (typeof value !== "bigint") return value;
  });
};
var slugify = (str) => {
  const join = "-";
  return str.toLowerCase().replace(/[^a-z0-9-]+/g, join).replace(/-+/g, join).split(join).filter(Boolean).join(join);
};
var second = 1 * 1e3;
var minute = second * 60;
var hour = minute * 60;
var day = hour * 24;
var periods = [
  ["w", day * 7],
  ["d", day],
  ["h", hour],
  ["m", minute],
  ["s", second]
];
var timeStr = (input) => {
  if (input instanceof Date) return input.toISOString();
  if (isTemporalInstant(input) || isTemporalZonedDateTime(input)) return getISOString(input);
  let milliseconds;
  if (isTemporalDuration(input)) milliseconds = input.total({
    unit: "milliseconds",
    relativeTo: mr.Now.plainDateTimeISO("UTC").toString()
  });
  else if (typeof input === "string") milliseconds = (0, import_ms.default)(input);
  else milliseconds = input;
  const [, timeStr$1] = periods.reduce(([num, str], [suffix, period]) => {
    const numPeriods = Math.floor(num / period);
    if (numPeriods > 0) return [num % period, `${str}${numPeriods}${suffix}`];
    return [num, str];
  }, [milliseconds, ""]);
  return timeStr$1;
};
var hashEventKey = (eventKey) => {
  return sha256().update(eventKey).digest("hex");
};
var hashSigningKey = (signingKey) => {
  if (!signingKey) return "";
  const prefix = signingKey.match(/^signkey-[\w]+-/)?.shift() || "";
  const key = removeSigningKeyPrefix(signingKey);
  return `${prefix}${sha256().update(key, "hex").digest("hex")}`;
};
function removeSigningKeyPrefix(signingKey) {
  return signingKey.replace(/^signkey-[\w]+-/, "");
}

// node_modules/inngest/helpers/net.js
var import_canonicalize = __toESM(require_canonicalize(), 1);
var import_hash2 = __toESM(require_hash(), 1);
var { hmac, sha256: sha2562 } = import_hash2.default;
async function fetchWithAuthFallback({ authToken, authTokenFallback, fetch: fetch3, options, url }) {
  let res = await fetch3(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${authToken}`
    }
  });
  if ([401, 403].includes(res.status) && authTokenFallback) res = await fetch3(url, {
    ...options,
    headers: {
      ...options?.headers,
      Authorization: `Bearer ${authTokenFallback}`
    }
  });
  return res;
}
function signWithHashJs(data, signingKey, ts2) {
  const encoded = typeof data === "string" ? data : (0, import_canonicalize.default)(data);
  return hmac(sha2562, removeSigningKeyPrefix(signingKey)).update(encoded).update(ts2).digest("hex");
}
var cryptoKeyCache = /* @__PURE__ */ new Map();
async function signWithNative(subtle, data, signingKey, ts2) {
  const encoded = typeof data === "string" ? data : (0, import_canonicalize.default)(data);
  const key = removeSigningKeyPrefix(signingKey);
  let cryptoKey = cryptoKeyCache.get(key);
  if (!cryptoKey) {
    cryptoKey = await subtle.importKey("raw", new TextEncoder().encode(key), {
      name: "HMAC",
      hash: "SHA-256"
    }, false, ["sign"]);
    cryptoKeyCache.set(key, cryptoKey);
  }
  const signature = await subtle.sign("HMAC", cryptoKey, new TextEncoder().encode(encoded + ts2));
  return Array.from(new Uint8Array(signature)).map((b2) => b2.toString(16).padStart(2, "0")).join("");
}
async function signDataWithKey(data, signingKey, ts2, logger) {
  const subtle = globalThis.crypto?.subtle;
  logOnce(logger, "debug", "crypto-implementation", subtle ? "Using native Web Crypto for request signing" : "Using hash.js fallback for request signing (native crypto unavailable)");
  if (subtle) try {
    return await signWithNative(subtle, data, signingKey, ts2);
  } catch (err2) {
    logger.debug({ err: err2 }, "Native crypto failed, falling back to hash.js");
  }
  return signWithHashJs(data, signingKey, ts2);
}

// node_modules/inngest/helpers/promises.js
var shimQueueMicrotask = (callback) => {
  Promise.resolve().then(callback);
};
var resolveAfterPending = (count = 100) => {
  return new Promise((resolve) => {
    let i2 = 0;
    const iterate = () => {
      shimQueueMicrotask(() => {
        if (i2++ > count) return resolve();
        iterate();
      });
    };
    iterate();
  });
};
var createDeferredPromise = () => {
  let resolve;
  let reject;
  return {
    promise: new Promise((_resolve, _reject) => {
      resolve = (value) => {
        _resolve(value);
        return createDeferredPromise();
      };
      reject = (reason) => {
        _reject(reason);
        return createDeferredPromise();
      };
    }),
    resolve,
    reject
  };
};
var createDeferredPromiseWithStack = () => {
  const settledPromises = [];
  let rotateQueue = () => {
  };
  const results = (async function* () {
    while (true) {
      const next = settledPromises.shift();
      if (next) yield next;
      else await new Promise((resolve) => {
        rotateQueue = resolve;
      });
    }
  })();
  const shimDeferredPromise = (deferred) => {
    const originalResolve = deferred.resolve;
    const originalReject = deferred.reject;
    deferred.resolve = (value) => {
      settledPromises.push(deferred.promise);
      rotateQueue();
      return shimDeferredPromise(originalResolve(value));
    };
    deferred.reject = (reason) => {
      settledPromises.push(deferred.promise);
      rotateQueue();
      return shimDeferredPromise(originalReject(reason));
    };
    return deferred;
  };
  return {
    deferred: shimDeferredPromise(createDeferredPromise()),
    results
  };
};
var createTimeoutPromise = (duration) => {
  const { promise, resolve } = createDeferredPromise();
  let timeout;
  let ret;
  const start = () => {
    if (timeout) return ret;
    timeout = setTimeout(() => {
      resolve();
    }, duration);
    return ret;
  };
  const clear = () => {
    clearTimeout(timeout);
    timeout = void 0;
  };
  const reset = () => {
    clear();
    return start();
  };
  ret = Object.assign(promise, {
    start,
    clear,
    reset
  });
  return ret;
};
var runAsPromise = (fn2) => {
  return Promise.resolve().then(fn2);
};
var resolveNextTick = () => {
  return new Promise((resolve) => setTimeout(resolve));
};
var retryWithBackoff = async (fn2, opts) => {
  const maxAttempts = opts?.maxAttempts || 5;
  const baseDelay = opts?.baseDelay ?? 100;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) try {
    return await fn2();
  } catch (err2) {
    if (attempt >= maxAttempts || opts?.shouldRetry?.(err2) === false) throw err2;
    const jitter = Math.random() * baseDelay;
    const delay = baseDelay * Math.pow(2, attempt - 1) + jitter;
    await new Promise((resolve) => setTimeout(resolve, delay));
  }
  throw new Error("Max retries reached; this should be unreachable.");
};
var goIntervalTiming = async (fn2) => {
  const start = Date.now();
  const resultPromise = runAsPromise(fn2);
  try {
    await resultPromise;
  } catch {
  }
  const end = Date.now();
  return {
    resultPromise,
    interval: {
      a: start * 1e6,
      b: (end - start) * 1e6
    }
  };
};

// node_modules/inngest/helpers/ServerTiming.js
var ServerTiming = class {
  timings = {};
  logger;
  constructor(logger) {
    this.logger = logger;
  }
  /**
  * Start a timing. Returns a function that, when called, will stop the timing
  * and add it to the header.
  */
  start(name, description) {
    if (!this.timings[name]) this.timings[name] = {
      description: description ?? "",
      timers: []
    };
    const index = this.timings[name].timers.push({ start: Date.now() }) - 1;
    return () => {
      const target = this.timings[name];
      if (!target) return this.logger.warn({ timing: name }, "Timing does not exist");
      const timer = target.timers[index];
      if (!timer) return this.logger.warn({
        timing: name,
        index
      }, "Timer does not exist");
      timer.end = Date.now();
    };
  }
  /**
  * Add a piece of arbitrary, untimed information to the header. Common use
  * cases would be cache misses.
  *
  * @example
  * ```
  * timer.append("cache", "miss");
  * ```
  */
  append(key, value) {
    this.timings[key] = {
      description: value,
      timers: []
    };
  }
  /**
  * Wrap a function in a timing. The timing will be stopped and added to the
  * header when the function resolves or rejects.
  *
  * The return value of the function will be returned from this function.
  */
  async wrap(name, fn2, description) {
    const stop = this.start(name, description);
    try {
      return await runAsPromise(fn2);
    } finally {
      stop();
    }
  }
  /**
  * Generate the `Server-Timing` header.
  */
  getHeader() {
    return Object.entries(this.timings).reduce((acc, [name, { description, timers }]) => {
      if (!timers.some((timer) => timer.end)) return acc;
      const dur = timers.reduce((acc$1, { start, end }) => {
        if (!start || !end) return acc$1;
        return acc$1 + (end - start);
      }, 0);
      const entry = [
        name,
        description ? `desc="${description}"` : "",
        dur ? `dur=${dur}` : ""
      ].filter(Boolean).join(";");
      return [...acc, entry];
    }, []).join(", ");
  }
};

// node_modules/inngest/helpers/stream.js
var createStream = (opts) => {
  let passFinalize;
  const finalizeP = new Promise((resolve) => {
    passFinalize = resolve;
  });
  const interval = opts?.interval ?? 3e3;
  const value = opts?.value ?? " ";
  return new Promise(async (resolve, reject) => {
    try {
      resolve({
        stream: new ReadableStream({ start(controller) {
          const encoder = new TextEncoder();
          const heartbeat = setInterval(() => {
            controller.enqueue(encoder.encode(value));
          }, interval);
          const finalize = (data) => {
            clearInterval(heartbeat);
            Promise.resolve(data).then((resolvedData) => {
              controller.enqueue(encoder.encode(stringify$1(resolvedData)));
              controller.close();
            });
          };
          passFinalize(finalize);
        } }),
        finalize: await finalizeP
      });
    } catch (err2) {
      reject(err2);
    }
  });
};

// node_modules/inngest/components/execution/als.js
var alsSymbol = /* @__PURE__ */ Symbol.for("inngest:als");
var getCache = () => {
  const g2 = globalThis;
  if (!g2[alsSymbol]) g2[alsSymbol] = createCache();
  return g2[alsSymbol];
};
var createCache = () => {
  const cache = {};
  cache.promise = initializeALS(cache);
  return cache;
};
var initializeALS = async (cache) => {
  try {
    const { AsyncLocalStorage } = await import("node:async_hooks");
    const als = new AsyncLocalStorage();
    cache.resolved = als;
    cache.isFallback = false;
    return als;
  } catch {
    const fallback = {
      getStore: () => void 0,
      run: (_2, fn2) => fn2()
    };
    cache.resolved = fallback;
    cache.isFallback = true;
    console.warn("node:async_hooks is not supported in this runtime. Async context is disabled.");
    return fallback;
  }
};
var isALSFallback = () => {
  return getCache().isFallback;
};
var getAsyncCtx = async () => {
  return getAsyncLocalStorage().then((als) => als.getStore());
};
var getAsyncCtxSync = () => {
  return getCache().resolved?.getStore();
};
var getAsyncLocalStorage = async () => {
  return getCache().promise;
};

// node_modules/inngest/components/triggers/triggers.js
function cron(schedule) {
  return { cron: schedule };
}
var EventType = class {
  /**
  * The event name. This is the same as the `name` property, but is necessary
  * to make the event type compatible with other features (e.g. event
  * triggers).
  */
  event;
  name;
  schema;
  version;
  constructor({ name, schema, version: version2 }) {
    this.event = name;
    this.name = name;
    this.schema = schema;
    this.version = version2;
  }
  /**
  * Creates an event to send.
  *
  * The returned event object includes a `validate()` method that can be called
  * to validate the event data against the schema (if one was provided). The
  * `validate()` method returns a new event object with the validated data,
  * including any transforms defined in the schema.
  *
  * Validation is not performed within this method because validation may be async.
  *
  * @param data - Event data (required if schema is defined, optional otherwise)
  * @param options - Optional event options including id, timestamp, and version
  */
  create(...args) {
    const [data, options] = args;
    return {
      name: this.name,
      data,
      id: options?.id,
      ts: options?.ts,
      v: options?.v ?? this.version,
      meta: options?.meta,
      validate: async () => {
        if (this.schema) {
          if (!data) throw new Error("data is required");
          const check = await this.schema["~standard"].validate(data);
          if (check.issues) throw new Error(check.issues.map((issue) => {
            if (issue.path && issue.path.length > 0) return `${issue.path.join(".")}: ${issue.message}`;
            return issue.message;
          }).join(", "));
        }
      }
    };
  }
};
function eventType(name, { schema, version: version2 } = {}) {
  return new EventType({
    name,
    schema,
    version: version2
  });
}
function staticSchema() {
  return { "~standard": {
    version: 1,
    vendor: "inngest",
    validate: (value) => ({ value })
  } };
}
function invoke(schema) {
  return new EventType({
    name: "inngest/function.invoked",
    schema
  });
}

// node_modules/inngest/api/api.js
var StaleDispatchError = class extends Error {
  constructor(message) {
    super(message);
    this.name = "StaleDispatchError";
  }
  [markerKey] = { kind: "StaleDispatchError" };
};
var realtimeSubscriptionTokenSchema = external_exports.object({ jwt: external_exports.string() });
var sendSignalSuccessResponseSchema = external_exports.object({ data: external_exports.object({ run_id: external_exports.string().min(1) }) });
var checkpointNewRunResponseSchema = external_exports.object({ data: external_exports.object({
  fn_id: external_exports.string().min(1),
  app_id: external_exports.string().min(1),
  run_id: external_exports.string().min(1),
  token: external_exports.string().min(1).optional(),
  realtime_token: external_exports.string().min(1)
}) });
var InngestApi = class {
  _signingKey;
  _signingKeyFallback;
  _apiBaseUrl;
  _fetch;
  constructor({ baseUrl, signingKey, signingKeyFallback, fetch: fetch3 }) {
    this._apiBaseUrl = baseUrl;
    this._signingKey = signingKey;
    this._signingKeyFallback = signingKeyFallback;
    this._fetch = fetch3;
  }
  get apiBaseUrl() {
    return this._apiBaseUrl();
  }
  get signingKey() {
    return this._signingKey();
  }
  get signingKeyFallback() {
    return this._signingKeyFallback();
  }
  get hashedKey() {
    return hashSigningKey(this.signingKey);
  }
  get hashedFallbackKey() {
    if (!this.signingKeyFallback) return;
    return hashSigningKey(this.signingKeyFallback);
  }
  async getTargetUrl(path) {
    return new URL(path, this.apiBaseUrl);
  }
  async req(url, options) {
    const finalUrl = typeof url === "string" ? await this.getTargetUrl(url) : url;
    try {
      return ok(await fetchWithAuthFallback({
        authToken: this.hashedKey,
        authTokenFallback: this.hashedFallbackKey,
        fetch: this._fetch(),
        url: finalUrl,
        options: {
          ...options,
          headers: {
            "Content-Type": "application/json",
            ...options?.headers
          }
        }
      }));
    } catch (error) {
      return err(error);
    }
  }
  async getRunSteps(runId) {
    const result = await this.req(`/v0/runs/${encodeURIComponent(runId)}/actions`);
    if (result.ok) {
      const res = result.value;
      const data = await res.json();
      if (res.ok) return ok(stepSchema.parse(data));
      return err(errorSchema.parse(data));
    }
    return err({
      error: getErrorMessage(result.error, "Unknown error retrieving step data"),
      status: 500
    });
  }
  async getRunBatch(runId) {
    const result = await this.req(`/v0/runs/${encodeURIComponent(runId)}/batch`);
    if (result.ok) {
      const res = result.value;
      const data = await res.json();
      if (res.ok) return ok(batchSchema.parse(data));
      return err(errorSchema.parse(data));
    }
    return err({
      error: getErrorMessage(result.error, "Unknown error retrieving event batch"),
      status: 500
    });
  }
  async publish(publishOptions, data) {
    const isStream = data instanceof ReadableStream;
    const url = await this.getTargetUrl("/v1/realtime/publish");
    url.searchParams.set("channel", publishOptions.channel || "");
    if (publishOptions.runId) url.searchParams.set("run_id", publishOptions.runId);
    for (const topic of publishOptions.topics) url.searchParams.append("topic", topic);
    const result = await this.req(url, {
      body: isStream ? data : typeof data === "string" ? data : JSON.stringify(data),
      method: "POST",
      headers: { "Content-Type": isStream ? "text/stream" : "application/json" },
      ...isStream ? { duplex: "half" } : {}
    });
    if (result.ok) {
      const res = result.value;
      if (!res.ok) throw new Error(`Failed to publish event: ${res.status} ${res.statusText}`);
      return ok(void 0);
    }
    return err({
      error: getErrorMessage(result.error, "Unknown error publishing event"),
      status: 500
    });
  }
  async sendSignal(signalOptions, options) {
    const url = await this.getTargetUrl("/v1/signals");
    const body = {
      signal: signalOptions.signal,
      data: signalOptions.data
    };
    return fetchWithAuthFallback({
      authToken: this.hashedKey,
      authTokenFallback: this.hashedFallbackKey,
      fetch: this._fetch(),
      url,
      options: {
        method: "POST",
        body: JSON.stringify(body),
        headers: {
          "Content-Type": "application/json",
          ...options?.headers
        }
      }
    }).then(async (res) => {
      if (res.status === 404) return ok({ runId: void 0 });
      const resClone = res.clone();
      let json;
      try {
        json = await res.json();
      } catch {
        return err({
          error: `Failed to send signal: ${res.status} ${res.statusText} - ${await resClone.text()}`,
          status: res.status
        });
      }
      if (!res.ok) try {
        return err(errorSchema.parse(json));
      } catch {
        return err({
          error: `Failed to send signal: ${res.status} ${res.statusText} - ${await res.text()}`,
          status: res.status
        });
      }
      const parseRes = sendSignalSuccessResponseSchema.safeParse(json);
      if (!parseRes.success) return err({
        error: `Successfully sent signal, but response parsing failed: ${res.status} ${res.statusText} - ${await resClone.text()}`,
        status: res.status
      });
      return ok({ runId: parseRes.data.data.run_id });
    }).catch((error) => {
      return err({
        error: getErrorMessage(error, "Unknown error sending signal"),
        status: 500
      });
    });
  }
  async getSubscriptionToken(channel2, topics) {
    const url = await this.getTargetUrl("/v1/realtime/token");
    const body = topics.map((topic) => ({
      channel: channel2,
      name: topic,
      kind: "run"
    }));
    return fetchWithAuthFallback({
      authToken: this.hashedKey,
      authTokenFallback: this.hashedFallbackKey,
      fetch: this._fetch(),
      url,
      options: {
        method: "POST",
        body: JSON.stringify(body),
        headers: { "Content-Type": "application/json" }
      }
    }).then(async (res) => {
      if (!res.ok) throw new Error(`Failed to get subscription token: ${res.status} ${res.statusText} - ${await res.text()}`);
      return realtimeSubscriptionTokenSchema.parse(await res.json()).jwt;
    }).catch((error) => {
      throw new Error(getErrorMessage(error, "Unknown error getting subscription token"));
    });
  }
  async updateMetadata(args, options) {
    const payload = {
      target: args.target,
      metadata: args.metadata
    };
    const result = await this.req(`/v1/runs/${encodeURIComponent(args.target.run_id)}/metadata`, {
      method: "POST",
      body: JSON.stringify(payload),
      headers: options?.headers
    });
    if (!result.ok) return err({
      error: getErrorMessage(result.error, "Unknown error updating metadata"),
      status: 500
    });
    const res = result.value;
    if (res.ok) return ok(void 0);
    const resClone = res.clone();
    let json;
    try {
      json = await res.json();
    } catch {
      return err({
        error: `Failed to update metadata: ${res.status} ${res.statusText} - ${await resClone.text()}`,
        status: res.status
      });
    }
    try {
      return err(errorSchema.parse(json));
    } catch {
      return err({
        error: `Failed to update metadata: ${res.status} ${res.statusText}`,
        status: res.status
      });
    }
  }
  /**
  * Start a new run, optionally passing in a number of steps to initialize the
  * run with.
  */
  async checkpointNewRun(args) {
    const body = JSON.stringify({
      run_id: args.runId,
      event: args.event,
      steps: args.steps,
      ts: (/* @__PURE__ */ new Date()).valueOf(),
      request_version: args.executionVersion,
      retries: args.retries
    });
    const result = await this.req("/v1/checkpoint", {
      method: "POST",
      body
    });
    if (!result.ok) throw new Error(getErrorMessage(result.error, "Unknown error checkpointing new run"));
    const res = result.value;
    if (res.ok) {
      const rawData = await res.json();
      return checkpointNewRunResponseSchema.parse(rawData);
    }
    throw new Error(`Failed to checkpoint new run: ${res.status} ${res.statusText} - ${await res.text()}`);
  }
  /**
  * Checkpoint steps for a given sync run.
  */
  async checkpointSteps(args) {
    const body = JSON.stringify({
      fn_id: args.fnId,
      app_id: args.appId,
      run_id: args.runId,
      steps: args.steps,
      ts: (/* @__PURE__ */ new Date()).valueOf()
    });
    const result = await this.req(`/v1/checkpoint/${encodeURIComponent(args.runId)}/steps`, {
      method: "POST",
      body
    });
    if (!result.ok) throw new Error(getErrorMessage(result.error, "Unknown error checkpointing steps"));
    const res = result.value;
    if (!res.ok) throw new Error(`Failed to checkpoint steps: ${res.status} ${res.statusText} - ${await res.text()}`);
  }
  /**
  * Checkpoint steps for a given async run.
  */
  async checkpointStepsAsync(args) {
    const body = JSON.stringify({
      run_id: args.runId,
      fn_id: args.fnId,
      qi_id: args.queueItemId,
      request_id: args.requestId,
      generation_id: args.generationId,
      request_started_at: args.requestStartedAt,
      steps: args.steps,
      ts: (/* @__PURE__ */ new Date()).valueOf()
    });
    const result = await this.req(`/v1/checkpoint/${encodeURIComponent(args.runId)}/async`, {
      method: "POST",
      body
    });
    if (!result.ok) throw new Error(getErrorMessage(result.error, "Unknown error checkpointing async"));
    const res = result.value;
    if (res.status === 409) throw new StaleDispatchError(`Stale dispatch: checkpoint returned 409 (run ${args.runId})`);
    if (!res.ok) throw new Error(`Failed to checkpoint async: ${res.status} ${res.statusText} - ${await res.text()}`);
  }
  /**
  * POST stream data to the realtime publish/tee endpoint, forwarding raw
  * bytes to all subscribers via the broadcaster.
  */
  async checkpointStream(args) {
    const url = await this.getTargetUrl(`/v1/realtime/publish/tee?channel=${encodeURIComponent(args.runId)}`);
    const res = await fetchWithAuthFallback({
      authToken: this.hashedKey,
      authTokenFallback: this.hashedFallbackKey,
      fetch: this._fetch(),
      url,
      options: {
        method: "POST",
        body: args.body,
        headers: { "Content-Type": "application/octet-stream" },
        duplex: "half"
      }
    });
    if (!res.ok) throw new Error(`Failed to stream checkpoint: ${res.status} ${res.statusText} - ${await res.text()}`);
  }
  /**
  * Build the full SSE URL for a run's stream channel using the given token.
  */
  async getRealtimeStreamRedirect(token) {
    const sseUrl = await this.getTargetUrl("/v1/realtime/sse");
    sseUrl.searchParams.set("token", token);
    return { url: sseUrl.toString() };
  }
  /**
  * Fetch the output of a completed run using a token.
  *
  * This uses token-based auth (not signing key) and is intended for use by
  * proxy endpoints that fetch results on behalf of users.
  *
  * @param runId - The ID of the run to fetch output for
  * @param token - The token used to authenticate the request
  * @returns The raw Response from the API
  */
  async getRunOutput(runId, token) {
    const url = await this.getTargetUrl(`/v1/http/runs/${encodeURIComponent(runId)}/output`);
    url.searchParams.set("token", token);
    return this._fetch()(url.toString(), {
      method: "GET",
      headers: { "Content-Type": "application/json" }
    });
  }
};

// node_modules/inngest/helpers/crypto.js
function createEntropy(byteLength) {
  const bytes = new Uint8Array(byteLength);
  const { crypto: crypto2 } = globalThis;
  if (!crypto2) throw new Error("missing crypto module");
  if (!crypto2.getRandomValues) throw new Error("missing crypto.getRandomValues");
  crypto2.getRandomValues(bytes);
  return bytes;
}

// node_modules/inngest/helpers/sessions.js
var normalizeEventSessions = (sessions) => {
  if (sessions === void 0 || sessions === null) return;
  if (typeof sessions !== "object" || Array.isArray(sessions)) throw new Error("Event sessions must be an object");
  const entries = Object.entries(sessions);
  if (entries.length === 0) return;
  const normalized = [];
  for (const [key, value] of entries) {
    if (!key) throw new Error("Event session keys cannot be empty");
    if (typeof value !== "string" && typeof value !== "number") throw new Error(`Event session "${key}" must be a string or number`);
    if (typeof value === "number" && !Number.isFinite(value)) throw new Error(`Event session "${key}" must be a finite number`);
    const id = String(value);
    if (!id) throw new Error(`Event session "${key}" cannot have an empty ID`);
    normalized.push([key, id]);
  }
  return Object.fromEntries(normalized);
};
var normalizeEventMeta = (meta) => {
  if (meta === void 0 || meta === null) return;
  if (typeof meta !== "object" || Array.isArray(meta)) throw new Error("Event meta must be an object");
  const sessions = normalizeEventSessions(meta.sessions);
  if (sessions === void 0) return;
  return { sessions };
};

// node_modules/inngest/middleware/logger.js
var LOG_LEVEL_RANK = {
  debug: 0,
  info: 1,
  warn: 2,
  error: 3
};
var ConsoleLogger = class {
  level;
  constructor(opts = {}) {
    this.level = opts.level ?? "info";
  }
  info(...args) {
    if (this.shouldLog("info")) this.logFormatted(console.info, args);
  }
  warn(...args) {
    if (this.shouldLog("warn")) this.logFormatted(console.warn, args);
  }
  error(...args) {
    if (this.shouldLog("error")) this.logFormatted(console.error, args);
  }
  debug(...args) {
    if (this.shouldLog("debug")) this.logFormatted(console.debug, args);
  }
  /**
  * Detect Pino-style `(object, string, ...rest)` calls and reformat for
  * console readability: message first, then structured fields.
  */
  logFormatted(fn2, args) {
    if (args.length > 1 && isRecord(args[0]) && typeof args[1] === "string") {
      const fields = args[0];
      const nonErrFields = Object.fromEntries(Object.entries(fields).filter(([key]) => {
        return key !== "err";
      }));
      const [, message, ...rest] = args;
      fn2(message);
      if (fields.err) fn2(fields.err);
      if (Object.keys(nonErrFields).length > 0) fn2(nonErrFields);
      if (rest.length > 0) fn2(...rest);
      return;
    }
    fn2(...args);
  }
  shouldLog(level) {
    if (this.level === "silent") return false;
    let effectiveLevel = "info";
    if (this.level === "fatal") effectiveLevel = "error";
    else if (this.level in LOG_LEVEL_RANK) effectiveLevel = this.level;
    return LOG_LEVEL_RANK[level] >= LOG_LEVEL_RANK[effectiveLevel];
  }
};
var ProxyLogger = class {
  logger;
  enabled = false;
  constructor(logger) {
    this.logger = logger;
    return new Proxy(this, { get(target, prop, receiver) {
      if (prop in target) return Reflect.get(target, prop, receiver);
      return Reflect.get(target.logger, prop, receiver);
    } });
  }
  info(...args) {
    if (!this.enabled) return;
    this.logger.info(...args);
  }
  warn(...args) {
    if (!this.enabled) return;
    this.logger.warn(...args);
  }
  error(...args) {
    if (!this.enabled) return;
    this.logger.error(...args);
  }
  debug(...args) {
    if (!this.enabled || !(typeof this.logger.debug === "function")) return;
    this.logger.debug(...args);
  }
  enable() {
    this.enabled = true;
  }
  disable() {
    this.enabled = false;
  }
  async flush() {
    if (this.logger.constructor.name == ConsoleLogger.name) return;
    const logger = this.logger;
    if (typeof logger.flush === "function") {
      await logger.flush();
      return;
    }
    await resolveNextTick();
  }
};

// node_modules/inngest/components/execution/otel/aiExtractor.js
var Convention = /* @__PURE__ */ (function(Convention$1) {
  Convention$1[Convention$1["Langfuse"] = 1] = "Langfuse";
  Convention$1[Convention$1["Semconv"] = 2] = "Semconv";
  Convention$1[Convention$1["OpenInference"] = 3] = "OpenInference";
  Convention$1[Convention$1["Vercel"] = 4] = "Vercel";
  return Convention$1;
})(Convention || {});
var langfuseUsagePrefix = "__langfuse.usage_details.";
var expandLangfuseUsageDetails = (value) => {
  if (typeof value !== "string" || value === "") return {};
  let counts;
  try {
    counts = JSON.parse(value);
  } catch {
    return {};
  }
  if (typeof counts !== "object" || counts === null) return {};
  const input = counts.input;
  if (typeof input !== "number") return {};
  return { [`${langfuseUsagePrefix}input`]: input };
};
var keyFieldMap = {
  "langfuse.observation.usage_details": {
    convention: Convention.Langfuse,
    expand: expandLangfuseUsageDetails
  },
  [`${langfuseUsagePrefix}input`]: {
    field: "inputTokens",
    convention: Convention.Langfuse
  },
  "gen_ai.request.model": {
    field: "model",
    convention: Convention.Semconv
  },
  "gen_ai.usage.input_tokens": {
    field: "inputTokens",
    convention: Convention.Semconv
  },
  "llm.model_name": {
    field: "model",
    convention: Convention.OpenInference
  },
  "llm.token_count.prompt": {
    field: "inputTokens",
    convention: Convention.OpenInference
  },
  "ai.model.id": {
    field: "model",
    convention: Convention.Vercel
  },
  "ai.usage.inputTokens": {
    field: "inputTokens",
    convention: Convention.Vercel
  },
  "ai.usage.tokens": {
    field: "inputTokens",
    convention: Convention.Vercel
  }
};
var extractAIMetadataFromAttributes = (attributes) => {
  const candidates = {};
  const record = (mapping, value) => {
    if (!mapping.field) return;
    const existing = candidates[mapping.field];
    if (!existing || mapping.convention < existing.convention) candidates[mapping.field] = {
      value,
      convention: mapping.convention
    };
  };
  for (const [key, value] of Object.entries(attributes)) {
    if (value === void 0) continue;
    const mapping = keyFieldMap[key];
    if (!mapping) continue;
    if (mapping.expand) {
      for (const [childKey, childValue] of Object.entries(mapping.expand(value))) {
        const childMapping = keyFieldMap[childKey];
        if (childMapping) record(childMapping, childValue);
      }
      continue;
    }
    record(mapping, value);
  }
  const metadata = {};
  const model = candidates.model?.value;
  if (typeof model === "string" && model !== "") metadata.model = model;
  const inputTokens = candidates.inputTokens?.value;
  if (inputTokens !== void 0) {
    const n2 = Number(inputTokens);
    if (!Number.isNaN(n2)) metadata.inputTokens = n2;
  }
  return metadata;
};
var aggregate = (a2, b2) => {
  const metadata = {};
  const model = a2.model ?? b2.model;
  if (model !== void 0) metadata.model = model;
  if (a2.inputTokens !== void 0 || b2.inputTokens !== void 0) metadata.inputTokens = (a2.inputTokens ?? 0) + (b2.inputTokens ?? 0);
  return metadata;
};
var toInngestAIMetadataValues = (metadata) => {
  const values = {};
  if (metadata.model !== void 0) values.model = metadata.model;
  if (metadata.inputTokens !== void 0) values.input_tokens = metadata.inputTokens;
  if (Object.keys(values).length === 0) return;
  return values;
};

// node_modules/inngest/components/execution/otel/consts.js
var debugPrefix2 = "inngest:otel";

// node_modules/inngest/components/execution/otel/metadataProcessor.js
var import_debug3 = __toESM(require_browser(), 1);

// node_modules/@opentelemetry/api/build/esm/version.js
var VERSION = "1.9.1";

// node_modules/@opentelemetry/api/build/esm/internal/semver.js
var re2 = /^(\d+)\.(\d+)\.(\d+)(-(.+))?$/;
function _makeCompatibilityCheck(ownVersion) {
  const acceptedVersions = /* @__PURE__ */ new Set([ownVersion]);
  const rejectedVersions = /* @__PURE__ */ new Set();
  const myVersionMatch = ownVersion.match(re2);
  if (!myVersionMatch) {
    return () => false;
  }
  const ownVersionParsed = {
    major: +myVersionMatch[1],
    minor: +myVersionMatch[2],
    patch: +myVersionMatch[3],
    prerelease: myVersionMatch[4]
  };
  if (ownVersionParsed.prerelease != null) {
    return function isExactmatch(globalVersion) {
      return globalVersion === ownVersion;
    };
  }
  function _reject(v2) {
    rejectedVersions.add(v2);
    return false;
  }
  function _accept(v2) {
    acceptedVersions.add(v2);
    return true;
  }
  return function isCompatible2(globalVersion) {
    if (acceptedVersions.has(globalVersion)) {
      return true;
    }
    if (rejectedVersions.has(globalVersion)) {
      return false;
    }
    const globalVersionMatch = globalVersion.match(re2);
    if (!globalVersionMatch) {
      return _reject(globalVersion);
    }
    const globalVersionParsed = {
      major: +globalVersionMatch[1],
      minor: +globalVersionMatch[2],
      patch: +globalVersionMatch[3],
      prerelease: globalVersionMatch[4]
    };
    if (globalVersionParsed.prerelease != null) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major !== globalVersionParsed.major) {
      return _reject(globalVersion);
    }
    if (ownVersionParsed.major === 0) {
      if (ownVersionParsed.minor === globalVersionParsed.minor && ownVersionParsed.patch <= globalVersionParsed.patch) {
        return _accept(globalVersion);
      }
      return _reject(globalVersion);
    }
    if (ownVersionParsed.minor <= globalVersionParsed.minor) {
      return _accept(globalVersion);
    }
    return _reject(globalVersion);
  };
}
var isCompatible = _makeCompatibilityCheck(VERSION);

// node_modules/@opentelemetry/api/build/esm/internal/global-utils.js
var major = VERSION.split(".")[0];
var GLOBAL_OPENTELEMETRY_API_KEY = /* @__PURE__ */ Symbol.for(`opentelemetry.js.api.${major}`);
var _global = typeof globalThis === "object" ? globalThis : typeof self === "object" ? self : typeof window === "object" ? window : typeof global === "object" ? global : {};
function registerGlobal(type, instance, diag, allowOverride = false) {
  var _a2;
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY] = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) !== null && _a2 !== void 0 ? _a2 : {
    version: VERSION
  };
  if (!allowOverride && api[type]) {
    const err2 = new Error(`@opentelemetry/api: Attempted duplicate registration of API: ${type}`);
    diag.error(err2.stack || err2.message);
    return false;
  }
  if (api.version !== VERSION) {
    const err2 = new Error(`@opentelemetry/api: Registration of version v${api.version} for ${type} does not match previously registered API v${VERSION}`);
    diag.error(err2.stack || err2.message);
    return false;
  }
  api[type] = instance;
  diag.debug(`@opentelemetry/api: Registered a global for ${type} v${VERSION}.`);
  return true;
}
function getGlobal(type) {
  var _a2, _b;
  const globalVersion = (_a2 = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _a2 === void 0 ? void 0 : _a2.version;
  if (!globalVersion || !isCompatible(globalVersion)) {
    return;
  }
  return (_b = _global[GLOBAL_OPENTELEMETRY_API_KEY]) === null || _b === void 0 ? void 0 : _b[type];
}
function unregisterGlobal(type, diag) {
  diag.debug(`@opentelemetry/api: Unregistering a global for ${type} v${VERSION}.`);
  const api = _global[GLOBAL_OPENTELEMETRY_API_KEY];
  if (api) {
    delete api[type];
  }
}

// node_modules/@opentelemetry/api/build/esm/diag/ComponentLogger.js
var DiagComponentLogger = class {
  constructor(props) {
    this._namespace = props.namespace || "DiagComponentLogger";
  }
  debug(...args) {
    return logProxy("debug", this._namespace, args);
  }
  error(...args) {
    return logProxy("error", this._namespace, args);
  }
  info(...args) {
    return logProxy("info", this._namespace, args);
  }
  warn(...args) {
    return logProxy("warn", this._namespace, args);
  }
  verbose(...args) {
    return logProxy("verbose", this._namespace, args);
  }
};
function logProxy(funcName, namespace, args) {
  const logger = getGlobal("diag");
  if (!logger) {
    return;
  }
  return logger[funcName](namespace, ...args);
}

// node_modules/@opentelemetry/api/build/esm/diag/types.js
var DiagLogLevel;
(function(DiagLogLevel2) {
  DiagLogLevel2[DiagLogLevel2["NONE"] = 0] = "NONE";
  DiagLogLevel2[DiagLogLevel2["ERROR"] = 30] = "ERROR";
  DiagLogLevel2[DiagLogLevel2["WARN"] = 50] = "WARN";
  DiagLogLevel2[DiagLogLevel2["INFO"] = 60] = "INFO";
  DiagLogLevel2[DiagLogLevel2["DEBUG"] = 70] = "DEBUG";
  DiagLogLevel2[DiagLogLevel2["VERBOSE"] = 80] = "VERBOSE";
  DiagLogLevel2[DiagLogLevel2["ALL"] = 9999] = "ALL";
})(DiagLogLevel || (DiagLogLevel = {}));

// node_modules/@opentelemetry/api/build/esm/diag/internal/logLevelLogger.js
function createLogLevelDiagLogger(maxLevel, logger) {
  if (maxLevel < DiagLogLevel.NONE) {
    maxLevel = DiagLogLevel.NONE;
  } else if (maxLevel > DiagLogLevel.ALL) {
    maxLevel = DiagLogLevel.ALL;
  }
  logger = logger || {};
  function _filterFunc(funcName, theLevel) {
    const theFunc = logger[funcName];
    if (typeof theFunc === "function" && maxLevel >= theLevel) {
      return theFunc.bind(logger);
    }
    return function() {
    };
  }
  return {
    error: _filterFunc("error", DiagLogLevel.ERROR),
    warn: _filterFunc("warn", DiagLogLevel.WARN),
    info: _filterFunc("info", DiagLogLevel.INFO),
    debug: _filterFunc("debug", DiagLogLevel.DEBUG),
    verbose: _filterFunc("verbose", DiagLogLevel.VERBOSE)
  };
}

// node_modules/@opentelemetry/api/build/esm/api/diag.js
var API_NAME = "diag";
var DiagAPI = class _DiagAPI {
  /** Get the singleton instance of the DiagAPI API */
  static instance() {
    if (!this._instance) {
      this._instance = new _DiagAPI();
    }
    return this._instance;
  }
  /**
   * Private internal constructor
   * @private
   */
  constructor() {
    function _logProxy(funcName) {
      return function(...args) {
        const logger = getGlobal("diag");
        if (!logger)
          return;
        return logger[funcName](...args);
      };
    }
    const self2 = this;
    const setLogger = (logger, optionsOrLogLevel = { logLevel: DiagLogLevel.INFO }) => {
      var _a2, _b, _c;
      if (logger === self2) {
        const err2 = new Error("Cannot use diag as the logger for itself. Please use a DiagLogger implementation like ConsoleDiagLogger or a custom implementation");
        self2.error((_a2 = err2.stack) !== null && _a2 !== void 0 ? _a2 : err2.message);
        return false;
      }
      if (typeof optionsOrLogLevel === "number") {
        optionsOrLogLevel = {
          logLevel: optionsOrLogLevel
        };
      }
      const oldLogger = getGlobal("diag");
      const newLogger = createLogLevelDiagLogger((_b = optionsOrLogLevel.logLevel) !== null && _b !== void 0 ? _b : DiagLogLevel.INFO, logger);
      if (oldLogger && !optionsOrLogLevel.suppressOverrideMessage) {
        const stack = (_c = new Error().stack) !== null && _c !== void 0 ? _c : "<failed to generate stacktrace>";
        oldLogger.warn(`Current logger will be overwritten from ${stack}`);
        newLogger.warn(`Current logger will overwrite one already registered from ${stack}`);
      }
      return registerGlobal("diag", newLogger, self2, true);
    };
    self2.setLogger = setLogger;
    self2.disable = () => {
      unregisterGlobal(API_NAME, self2);
    };
    self2.createComponentLogger = (options) => {
      return new DiagComponentLogger(options);
    };
    self2.verbose = _logProxy("verbose");
    self2.debug = _logProxy("debug");
    self2.info = _logProxy("info");
    self2.warn = _logProxy("warn");
    self2.error = _logProxy("error");
  }
};

// node_modules/@opentelemetry/api/build/esm/context/context.js
function createContextKey(description) {
  return Symbol.for(description);
}
var BaseContext = class _BaseContext {
  /**
   * Construct a new context which inherits values from an optional parent context.
   *
   * @param parentContext a context from which to inherit values
   */
  constructor(parentContext) {
    const self2 = this;
    self2._currentContext = parentContext ? new Map(parentContext) : /* @__PURE__ */ new Map();
    self2.getValue = (key) => self2._currentContext.get(key);
    self2.setValue = (key, value) => {
      const context = new _BaseContext(self2._currentContext);
      context._currentContext.set(key, value);
      return context;
    };
    self2.deleteValue = (key) => {
      const context = new _BaseContext(self2._currentContext);
      context._currentContext.delete(key);
      return context;
    };
  }
};
var ROOT_CONTEXT = new BaseContext();

// node_modules/@opentelemetry/api/build/esm/context/NoopContextManager.js
var NoopContextManager = class {
  active() {
    return ROOT_CONTEXT;
  }
  with(_context, fn2, thisArg, ...args) {
    return fn2.call(thisArg, ...args);
  }
  bind(_context, target) {
    return target;
  }
  enable() {
    return this;
  }
  disable() {
    return this;
  }
};

// node_modules/@opentelemetry/api/build/esm/api/context.js
var API_NAME2 = "context";
var NOOP_CONTEXT_MANAGER = new NoopContextManager();
var ContextAPI = class _ContextAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
  }
  /** Get the singleton instance of the Context API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new _ContextAPI();
    }
    return this._instance;
  }
  /**
   * Set the current context manager.
   *
   * @returns true if the context manager was successfully registered, else false
   */
  setGlobalContextManager(contextManager) {
    return registerGlobal(API_NAME2, contextManager, DiagAPI.instance());
  }
  /**
   * Get the currently active context
   */
  active() {
    return this._getContextManager().active();
  }
  /**
   * Execute a function with an active context
   *
   * @param context context to be active during function execution
   * @param fn function to execute in a context
   * @param thisArg optional receiver to be used for calling fn
   * @param args optional arguments forwarded to fn
   */
  with(context, fn2, thisArg, ...args) {
    return this._getContextManager().with(context, fn2, thisArg, ...args);
  }
  /**
   * Bind a context to a target function or event emitter
   *
   * @param context context to bind to the event emitter or function. Defaults to the currently active context
   * @param target function or event emitter to bind
   */
  bind(context, target) {
    return this._getContextManager().bind(context, target);
  }
  _getContextManager() {
    return getGlobal(API_NAME2) || NOOP_CONTEXT_MANAGER;
  }
  /** Disable and remove the global context manager */
  disable() {
    this._getContextManager().disable();
    unregisterGlobal(API_NAME2, DiagAPI.instance());
  }
};

// node_modules/@opentelemetry/api/build/esm/trace/trace_flags.js
var TraceFlags;
(function(TraceFlags2) {
  TraceFlags2[TraceFlags2["NONE"] = 0] = "NONE";
  TraceFlags2[TraceFlags2["SAMPLED"] = 1] = "SAMPLED";
})(TraceFlags || (TraceFlags = {}));

// node_modules/@opentelemetry/api/build/esm/trace/invalid-span-constants.js
var INVALID_SPANID = "0000000000000000";
var INVALID_TRACEID = "00000000000000000000000000000000";
var INVALID_SPAN_CONTEXT = {
  traceId: INVALID_TRACEID,
  spanId: INVALID_SPANID,
  traceFlags: TraceFlags.NONE
};

// node_modules/@opentelemetry/api/build/esm/trace/NonRecordingSpan.js
var NonRecordingSpan = class {
  constructor(spanContext = INVALID_SPAN_CONTEXT) {
    this._spanContext = spanContext;
  }
  // Returns a SpanContext.
  spanContext() {
    return this._spanContext;
  }
  // By default does nothing
  setAttribute(_key, _value) {
    return this;
  }
  // By default does nothing
  setAttributes(_attributes) {
    return this;
  }
  // By default does nothing
  addEvent(_name, _attributes) {
    return this;
  }
  addLink(_link) {
    return this;
  }
  addLinks(_links) {
    return this;
  }
  // By default does nothing
  setStatus(_status) {
    return this;
  }
  // By default does nothing
  updateName(_name) {
    return this;
  }
  // By default does nothing
  end(_endTime) {
  }
  // isRecording always returns false for NonRecordingSpan.
  isRecording() {
    return false;
  }
  // By default does nothing
  recordException(_exception, _time) {
  }
};

// node_modules/@opentelemetry/api/build/esm/trace/context-utils.js
var SPAN_KEY = createContextKey("OpenTelemetry Context Key SPAN");
function getSpan(context) {
  return context.getValue(SPAN_KEY) || void 0;
}
function getActiveSpan() {
  return getSpan(ContextAPI.getInstance().active());
}
function setSpan(context, span) {
  return context.setValue(SPAN_KEY, span);
}
function deleteSpan(context) {
  return context.deleteValue(SPAN_KEY);
}
function setSpanContext(context, spanContext) {
  return setSpan(context, new NonRecordingSpan(spanContext));
}
function getSpanContext(context) {
  var _a2;
  return (_a2 = getSpan(context)) === null || _a2 === void 0 ? void 0 : _a2.spanContext();
}

// node_modules/@opentelemetry/api/build/esm/trace/spancontext-utils.js
var isHex = new Uint8Array([
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  0,
  1,
  1,
  1,
  1,
  1,
  1
]);
function isValidHex(id, length) {
  if (typeof id !== "string" || id.length !== length)
    return false;
  let r2 = 0;
  for (let i2 = 0; i2 < id.length; i2 += 4) {
    r2 += (isHex[id.charCodeAt(i2)] | 0) + (isHex[id.charCodeAt(i2 + 1)] | 0) + (isHex[id.charCodeAt(i2 + 2)] | 0) + (isHex[id.charCodeAt(i2 + 3)] | 0);
  }
  return r2 === length;
}
function isValidTraceId(traceId) {
  return isValidHex(traceId, 32) && traceId !== INVALID_TRACEID;
}
function isValidSpanId(spanId) {
  return isValidHex(spanId, 16) && spanId !== INVALID_SPANID;
}
function isSpanContextValid(spanContext) {
  return isValidTraceId(spanContext.traceId) && isValidSpanId(spanContext.spanId);
}
function wrapSpanContext(spanContext) {
  return new NonRecordingSpan(spanContext);
}

// node_modules/@opentelemetry/api/build/esm/trace/NoopTracer.js
var contextApi = ContextAPI.getInstance();
var NoopTracer = class {
  // startSpan starts a noop span.
  startSpan(name, options, context = contextApi.active()) {
    const root = Boolean(options === null || options === void 0 ? void 0 : options.root);
    if (root) {
      return new NonRecordingSpan();
    }
    const parentFromContext = context && getSpanContext(context);
    if (isSpanContext(parentFromContext) && isSpanContextValid(parentFromContext)) {
      return new NonRecordingSpan(parentFromContext);
    } else {
      return new NonRecordingSpan();
    }
  }
  startActiveSpan(name, arg2, arg3, arg4) {
    let opts;
    let ctx;
    let fn2;
    if (arguments.length < 2) {
      return;
    } else if (arguments.length === 2) {
      fn2 = arg2;
    } else if (arguments.length === 3) {
      opts = arg2;
      fn2 = arg3;
    } else {
      opts = arg2;
      ctx = arg3;
      fn2 = arg4;
    }
    const parentContext = ctx !== null && ctx !== void 0 ? ctx : contextApi.active();
    const span = this.startSpan(name, opts, parentContext);
    const contextWithSpanSet = setSpan(parentContext, span);
    return contextApi.with(contextWithSpanSet, fn2, void 0, span);
  }
};
function isSpanContext(spanContext) {
  return spanContext !== null && typeof spanContext === "object" && "spanId" in spanContext && typeof spanContext["spanId"] === "string" && "traceId" in spanContext && typeof spanContext["traceId"] === "string" && "traceFlags" in spanContext && typeof spanContext["traceFlags"] === "number";
}

// node_modules/@opentelemetry/api/build/esm/trace/ProxyTracer.js
var NOOP_TRACER = new NoopTracer();
var ProxyTracer = class {
  constructor(provider, name, version2, options) {
    this._provider = provider;
    this.name = name;
    this.version = version2;
    this.options = options;
  }
  startSpan(name, options, context) {
    return this._getTracer().startSpan(name, options, context);
  }
  startActiveSpan(_name, _options, _context, _fn) {
    const tracer = this._getTracer();
    return Reflect.apply(tracer.startActiveSpan, tracer, arguments);
  }
  /**
   * Try to get a tracer from the proxy tracer provider.
   * If the proxy tracer provider has no delegate, return a noop tracer.
   */
  _getTracer() {
    if (this._delegate) {
      return this._delegate;
    }
    const tracer = this._provider.getDelegateTracer(this.name, this.version, this.options);
    if (!tracer) {
      return NOOP_TRACER;
    }
    this._delegate = tracer;
    return this._delegate;
  }
};

// node_modules/@opentelemetry/api/build/esm/trace/NoopTracerProvider.js
var NoopTracerProvider = class {
  getTracer(_name, _version, _options) {
    return new NoopTracer();
  }
};

// node_modules/@opentelemetry/api/build/esm/trace/ProxyTracerProvider.js
var NOOP_TRACER_PROVIDER = new NoopTracerProvider();
var ProxyTracerProvider = class {
  /**
   * Get a {@link ProxyTracer}
   */
  getTracer(name, version2, options) {
    var _a2;
    return (_a2 = this.getDelegateTracer(name, version2, options)) !== null && _a2 !== void 0 ? _a2 : new ProxyTracer(this, name, version2, options);
  }
  getDelegate() {
    var _a2;
    return (_a2 = this._delegate) !== null && _a2 !== void 0 ? _a2 : NOOP_TRACER_PROVIDER;
  }
  /**
   * Set the delegate tracer provider
   */
  setDelegate(delegate) {
    this._delegate = delegate;
  }
  getDelegateTracer(name, version2, options) {
    var _a2;
    return (_a2 = this._delegate) === null || _a2 === void 0 ? void 0 : _a2.getTracer(name, version2, options);
  }
};

// node_modules/@opentelemetry/api/build/esm/api/trace.js
var API_NAME3 = "trace";
var TraceAPI = class _TraceAPI {
  /** Empty private constructor prevents end users from constructing a new instance of the API */
  constructor() {
    this._proxyTracerProvider = new ProxyTracerProvider();
    this.wrapSpanContext = wrapSpanContext;
    this.isSpanContextValid = isSpanContextValid;
    this.deleteSpan = deleteSpan;
    this.getSpan = getSpan;
    this.getActiveSpan = getActiveSpan;
    this.getSpanContext = getSpanContext;
    this.setSpan = setSpan;
    this.setSpanContext = setSpanContext;
  }
  /** Get the singleton instance of the Trace API */
  static getInstance() {
    if (!this._instance) {
      this._instance = new _TraceAPI();
    }
    return this._instance;
  }
  /**
   * Set the current global tracer.
   *
   * @returns true if the tracer provider was successfully registered, else false
   */
  setGlobalTracerProvider(provider) {
    const success = registerGlobal(API_NAME3, this._proxyTracerProvider, DiagAPI.instance());
    if (success) {
      this._proxyTracerProvider.setDelegate(provider);
    }
    return success;
  }
  /**
   * Returns the global tracer provider.
   */
  getTracerProvider() {
    return getGlobal(API_NAME3) || this._proxyTracerProvider;
  }
  /**
   * Returns a tracer from the global tracer provider.
   */
  getTracer(name, version2) {
    return this.getTracerProvider().getTracer(name, version2);
  }
  /** Remove the global tracer provider */
  disable() {
    unregisterGlobal(API_NAME3, DiagAPI.instance());
    this._proxyTracerProvider = new ProxyTracerProvider();
  }
};

// node_modules/@opentelemetry/api/build/esm/trace-api.js
var trace = TraceAPI.getInstance();

// node_modules/inngest/components/execution/otel/metadataProcessor.js
var processorDevDebug = (0, import_debug3.default)(`${debugPrefix2}:InngestMetadataSpanProcessor`);
var getGlobalProvider = () => {
  const globalProvider = trace.getTracerProvider();
  if (!globalProvider) return;
  return ("getDelegate" in globalProvider && typeof globalProvider.getDelegate === "function" ? globalProvider.getDelegate() : globalProvider) ?? void 0;
};
var attachToProvider = (provider, processor) => {
  if ("addSpanProcessor" in provider && typeof provider.addSpanProcessor === "function") {
    provider.addSpanProcessor(processor);
    return true;
  }
  const spanProcessors = getInternalSpanProcessors(provider);
  if (spanProcessors) {
    spanProcessors.push(processor);
    return true;
  }
  return false;
};
function getInternalSpanProcessors(provider) {
  if (!isRecord(provider)) return;
  try {
    const active = provider._activeSpanProcessor;
    if (!isRecord(active)) return void 0;
    const arr = active._spanProcessors;
    return Array.isArray(arr) ? arr : void 0;
  } catch {
    return;
  }
}
var spanSinkKey = (traceId, spanId) => `${traceId}:${spanId}`;
var InngestMetadataSpanProcessor = class {
  /**
  * A map of tracked spans to their sink.
  *
  * We use traceId:spanID as the key, which uniquely identifies each span. See
  * {@link spanSinkKey}
  *
  * The engine seeds the map during {@link declareStartingSpan} with the root
  * span and its sink.
  *
  * During onStart, the processor looks up the span's parent's sink and then
  * records the span as also using that sink. If the parent is not found, then
  * the span is not descended from a root step span, and therefore does not
  * need to have a sink.
  *
  * All spans with the same root span that started the step will share the
  * same sink.
  */
  #spanSinks = /* @__PURE__ */ new Map();
  /**
  * A registry used to clean up items from `#spanSinks` when spans fall out of
  * reference without ending. Avoids leaking entries (and the engine sink
  * closures they reference) for spans that are never ended and are GC'd.
  */
  #spanCleanup = new FinalizationRegistry((key) => {
    if (key) this.#spanSinks.delete(key);
  });
  /**
  * Latches once this processor has been attached to a global OTel provider, so
  * {@link attach} can never push it into a provider's processor list twice
  * (which would double-process every span and double-count tokens).
  */
  #attached = false;
  /**
  * Idempotently attach this processor to the global OTel provider that already
  * exists, so it begins receiving span lifecycle events.
  */
  attach() {
    if (this.#attached) return;
    const provider = getGlobalProvider();
    if (!provider) return;
    if (attachToProvider(provider, this)) {
      this.#attached = true;
      processorDevDebug("attached to global OTel provider");
    }
  }
  /**
  * Declare the step's root span. Seeds tracking so that the root and all of
  * its descendants share the same AIMetadata sink.
  */
  declareStartingSpan({ span, traceparent, onAIMetadata }) {
    if (!this.#attached) return;
    if (!traceparent) return processorDevDebug("no traceparent found for span", span.spanContext().spanId, "so skipping it");
    this.trackSpan(span, onAIMetadata);
  }
  /**
  * Mark a span as tracked, recording its step's sink and registering it for
  * cleanup.
  *
  * Read-only: unlike the Extended Traces processor, no attributes
  * are stamped on the span.
  */
  trackSpan(span, sink) {
    const { traceId, spanId } = span.spanContext();
    const key = spanSinkKey(traceId, spanId);
    this.#spanCleanup.register(span, key, span);
    this.#spanSinks.set(key, sink);
  }
  /**
  * Clean up references to a span that has ended (or been GC'd).
  */
  cleanupSpan(span) {
    const { traceId, spanId } = span.spanContext();
    this.#spanCleanup.unregister(span);
    this.#spanSinks.delete(spanSinkKey(traceId, spanId));
  }
  /**
  * Track children of spans we already care about, so the whole subtree under a
  * declared root is captured.
  */
  onStart(span, parentContext) {
    const parentSpanId = trace.getSpanContext(parentContext)?.spanId;
    if (!parentSpanId) return;
    const sink = this.#spanSinks.get(spanSinkKey(span.spanContext().traceId, parentSpanId));
    if (!sink) return;
    this.trackSpan(span, sink);
  }
  /**
  * On end, extract any AI metadata from the span's attributes and push it to
  * its sink, then clean up the span's tracking entry.
  */
  onEnd(span) {
    const { traceId, spanId } = span.spanContext();
    try {
      const sink = this.#spanSinks.get(spanSinkKey(traceId, spanId));
      if (!sink) return;
      const aiMetadata = extractAIMetadataFromAttributes(span.attributes);
      if (Object.keys(aiMetadata).length === 0) return;
      sink(aiMetadata);
    } finally {
      this.cleanupSpan(span);
    }
  }
  async forceFlush() {
  }
  async shutdown() {
  }
};
var metadataSpanProcessor = new InngestMetadataSpanProcessor();

// node_modules/inngest/components/middleware/middleware.js
var Middleware;
(function(_Middleware) {
  class BaseMiddleware {
    client;
    constructor({ client }) {
      this.client = client;
    }
  }
  _Middleware.BaseMiddleware = BaseMiddleware;
})(Middleware || (Middleware = {}));

// node_modules/inngest/components/InngestMetadata.js
var UnscopedMetadataBuilder = class UnscopedMetadataBuilder2 {
  constructor(client, config = {}) {
    this.client = client;
    this.config = config;
  }
  run(id) {
    return new UnscopedMetadataBuilder2(this.client, {
      ...this.config,
      runId: id ?? null
    });
  }
  step(id, index) {
    return new UnscopedMetadataBuilder2(this.client, {
      ...this.config,
      stepId: id ?? null,
      stepIndex: index ?? 0
    });
  }
  attempt(attempt) {
    return new UnscopedMetadataBuilder2(this.client, {
      ...this.config,
      attempt: attempt ?? null
    });
  }
  span(id) {
    return new UnscopedMetadataBuilder2(this.client, {
      ...this.config,
      spanId: id
    });
  }
  async update(values, kind = "default") {
    await performOp(this.client, this.config, values, `userland.${kind}`, "merge");
  }
  toJSON() {
    return this.config;
  }
};
function buildTarget(config, ctx) {
  const ctxExecution = ctx?.execution;
  const ctxRunId = ctxExecution?.ctx?.runId;
  const ctxStepId = ctxExecution?.executingStep?.id;
  const ctxAttempt = ctxExecution?.ctx?.attempt;
  const targetRunId = config.runId ?? ctxRunId;
  if (!targetRunId) throw new Error("No run context available");
  const isSameRunAsCtx = ctxRunId !== void 0 && targetRunId === ctxRunId;
  const stepCtxReason = !ctxExecution ? "no function execution context is available" : !ctxExecution.executingStep ? "you are not inside a step.run() callback" : "you are targeting a different run";
  if (config.attempt === null && (!isSameRunAsCtx || !ctxExecution?.executingStep)) throw new Error(`attempt() was called without a value, but ${stepCtxReason}`);
  if (config.stepId === null && (!isSameRunAsCtx || !ctxExecution?.executingStep)) throw new Error(`step() was called without a value, but ${stepCtxReason}`);
  if (config.spanId !== void 0) return {
    run_id: targetRunId,
    step_id: config.stepId ?? ctxStepId,
    step_index: config.stepIndex,
    step_attempt: config.attempt ?? ctxAttempt,
    span_id: config.spanId
  };
  else if (config.stepId !== void 0) return {
    run_id: targetRunId,
    step_id: config.stepId ?? ctxStepId,
    step_index: config.stepIndex,
    step_attempt: config.attempt ?? ctxAttempt
  };
  else if (config.runId !== void 0) return { run_id: targetRunId };
  else if (ctxStepId && ctxAttempt !== void 0) return {
    run_id: targetRunId,
    step_id: ctxStepId,
    step_attempt: ctxAttempt
  };
  else return { run_id: targetRunId };
}
function createMetadataPayload(kind, op, metadata) {
  return [{
    kind,
    op,
    values: metadata
  }];
}
async function sendMetadataViaAPI(client, target, kind, op, metadata, headers) {
  const metadataArray = createMetadataPayload(kind, op, metadata);
  await client["updateMetadata"]({
    target,
    metadata: metadataArray,
    headers
  });
}
function getBatchScope(config) {
  if (config.spanId !== void 0) return "extended_trace";
  if (config.stepId !== void 0) return "step";
  if (config.runId !== void 0) return "run";
  return "step";
}
async function performOp(client, config, values, kind, op) {
  const ctx = await getAsyncCtx();
  const target = buildTarget(config, ctx);
  const isInsideRun = !!ctx?.execution;
  const isInsideStep = !!ctx?.execution?.executingStep;
  if (isInsideRun && !isInsideStep) client[internalLoggerSymbol].warn("metadata.update() called outside of a step; this metadata may be lost on retries. Wrap the call in step.run() for durable metadata.");
  const runId = config.runId ?? ctx?.execution?.ctx?.runId;
  const stepId = config.stepId ?? ctx?.execution?.executingStep?.id;
  const attempt = config.attempt ?? ctx?.execution?.ctx?.attempt;
  if (runId === ctx?.execution?.ctx?.runId && stepId === ctx?.execution?.executingStep?.id && attempt === ctx?.execution?.ctx?.attempt && !config.spanId) {
    const executingStep = ctx?.execution?.executingStep;
    const execInstance = ctx?.execution?.instance;
    const scope = getBatchScope(config);
    if (executingStep?.id && execInstance && execInstance.addMetadata(executingStep.id, kind, scope, op, values)) return;
  }
  await sendMetadataViaAPI(client, target, kind, op, values, ctx?.execution?.instance?.options?.headers ?? void 0);
}
var metadataSymbol = /* @__PURE__ */ Symbol.for("inngest.step.metadata");

// node_modules/inngest/components/Fetch.js
var import_debug4 = __toESM(require_browser(), 1);
var globalFetch = globalThis.fetch;
var devDebug2 = (0, import_debug4.default)("inngest:fetch");
var createFetchShim = () => {
  let stepFetch;
  const fetch$1 = async (input, init) => {
    const ctx = await getAsyncCtx();
    if (!ctx?.execution) {
      if (!stepFetch.fallback) throw new Error("step.fetch() called outside of a function and had no fallback set");
      devDebug2("step.fetch() called outside of a function; falling back to global fetch");
      return stepFetch.fallback(input, init);
    }
    if (ctx.execution.executingStep) {
      if (!stepFetch.fallback) throw new Error(`step.fetch() called inside step "${ctx.execution.executingStep.id}" and had no fallback set`);
      devDebug2(`step.fetch() called inside step "${ctx.execution.executingStep.id}"; falling back to global fetch`);
      return stepFetch.fallback(input, init);
    }
    const targetUrl = new URL(input instanceof Request ? input.url : input.toString());
    devDebug2("step.fetch() shimming request to", targetUrl.hostname);
    const jsonRes = await ctx.execution.ctx.step[gatewaySymbol](`step.fetch: ${targetUrl.hostname}`, input, init);
    return new Response(jsonRes.body, {
      headers: jsonRes.headers,
      status: jsonRes.status_code
    });
  };
  const optionsRef = { fallback: globalFetch };
  const extras = {
    config: (options) => {
      Object.assign(optionsRef, options);
      Object.assign(stepFetch, optionsRef);
      return stepFetch;
    },
    ...optionsRef
  };
  stepFetch = Object.assign(fetch$1, extras);
  return stepFetch;
};
var fetch2 = createFetchShim();

// node_modules/inngest/components/InngestFunctionReference.js
var InngestFunctionReference = class InngestFunctionReference2 {
  get [Symbol.toStringTag]() {
    return InngestFunctionReference2.Tag;
  }
  constructor(opts) {
    this.opts = opts;
  }
};
var referenceFunction = ({ functionId, appId }) => {
  return new InngestFunctionReference({
    functionId,
    appId
  });
};
(function(_InngestFunctionReference) {
  _InngestFunctionReference.Tag = "Inngest.FunctionReference";
})(InngestFunctionReference || (InngestFunctionReference = {}));

// node_modules/inngest/components/InngestStepTools.js
var import_ai = __toESM(require_dist2(), 1);
var getStepOptions = (options) => {
  if (typeof options === "string") return { id: options };
  return options;
};
var STEP_INDEXING_SUFFIX = ":";
var createStepTools = (client, execution, stepHandler) => {
  const createTool = (matchOp, opts) => {
    const wrappedMatchOp = (stepOptions, ...rest) => {
      const op = matchOp(stepOptions, ...rest);
      const alsCtx = getAsyncCtxSync()?.execution;
      if (alsCtx?.insideExperimentSelect) throw new NonRetriableError("Step tools (step.run, step.sleep, etc.) cannot be called inside an experiment select() callback. Move step calls into variant callbacks instead.");
      const parallelMode = stepOptions.parallelMode ?? alsCtx?.parallelMode;
      if (parallelMode) op.opts = {
        ...op.opts,
        parallelMode
      };
      const experimentContext = alsCtx?.experimentContext;
      if (experimentContext) op.opts = {
        ...op.opts,
        ...experimentContext
      };
      const tracker = alsCtx?.experimentStepTracker;
      if (tracker) tracker.found = true;
      return op;
    };
    return (async (...args) => {
      return stepHandler({
        args,
        matchOp: wrappedMatchOp,
        opts
      });
    });
  };
  const createStepRun = (type) => {
    return createTool(({ id, name }, _fn, ...input) => {
      const opts = {
        ...input.length ? { input } : {},
        ...type ? { type } : {}
      };
      return {
        id,
        mode: StepMode.Sync,
        op: StepOpCode.StepPlanned,
        name: id,
        displayName: name ?? id,
        ...Object.keys(opts).length ? { opts } : {},
        userland: { id }
      };
    }, { fn: (_2, __, fn2, ...input) => fn2(...input) });
  };
  const createStepMetadataWrapper = (memoizationId, builder) => {
    if (!client["experimentalMetadataEnabled"]) throw new Error('step.metadata() is experimental. Enable it by adding metadataMiddleware() from "inngest/experimental" to your client middleware.');
    const withBuilder = (next) => createStepMetadataWrapper(memoizationId, next);
    if (!builder) builder = new UnscopedMetadataBuilder(client).run();
    return {
      run: (runId) => withBuilder(builder.run(runId)),
      step: (stepId, index) => withBuilder(builder.step(stepId, index)),
      attempt: (attemptIndex) => withBuilder(builder.attempt(attemptIndex)),
      span: (spanId) => withBuilder(builder.span(spanId)),
      update: async (values, kind = "default") => {
        await tools.run(memoizationId, async () => {
          await builder.update(values, kind);
        });
      },
      do: async (fn2) => {
        await tools.run(memoizationId, async () => {
          await fn2(builder);
        });
      }
    };
  };
  const tools = {
    sendEvent: createTool(({ id, name }) => {
      return {
        id,
        mode: StepMode.Sync,
        op: StepOpCode.StepPlanned,
        name: "sendEvent",
        displayName: name ?? id,
        opts: { type: "step.sendEvent" },
        userland: { id }
      };
    }, { fn: (_ctx, _idOrOptions, payload) => {
      const fn2 = execution["options"]["fn"];
      return client["_send"]({
        payload,
        headers: execution["options"]["headers"],
        fnMiddleware: fn2.opts.middleware ?? [],
        fn: fn2
      });
    } }),
    waitForSignal: createTool(({ id, name }, opts) => {
      return {
        id,
        mode: StepMode.Async,
        op: StepOpCode.WaitForSignal,
        name: opts.signal,
        displayName: name ?? id,
        opts: {
          signal: opts.signal,
          timeout: timeStr(opts.timeout),
          conflict: opts.onConflict
        },
        userland: { id }
      };
    }),
    realtime: { publish: createTool(({ id, name }) => {
      return {
        id,
        mode: StepMode.Sync,
        op: StepOpCode.StepPlanned,
        displayName: name ?? id,
        opts: { type: "step.realtime.publish" },
        userland: { id }
      };
    }, { fn: async (ctx, _idOrOptions, topicRef, data) => {
      const topicConfig = topicRef.config;
      if (topicConfig && "schema" in topicConfig && topicConfig.schema) {
        if ((await topicConfig.schema["~standard"].validate(data)).issues) throw new Error(`Schema validation failed for topic "${topicRef.topic}"`);
      }
      const res = await client["inngestApi"].publish({
        topics: [topicRef.topic],
        channel: topicRef.channel,
        runId: ctx.runId
      }, data);
      if (!res.ok) throw new Error(`Failed to publish to realtime: ${res.error?.error || "Unknown error"}`);
      return data;
    } }) },
    sendSignal: createTool(({ id, name }, opts) => {
      return {
        id,
        mode: StepMode.Sync,
        op: StepOpCode.StepPlanned,
        name: "sendSignal",
        displayName: name ?? id,
        opts: {
          type: "step.sendSignal",
          signal: opts.signal
        },
        userland: { id }
      };
    }, { fn: (_ctx, _idOrOptions, opts) => {
      return client["_sendSignal"]({
        signal: opts.signal,
        data: opts.data,
        headers: execution["options"]["headers"]
      });
    } }),
    waitForEvent: createTool(({ id, name }, opts) => {
      const matchOpts = { timeout: timeStr(typeof opts === "string" ? opts : opts.timeout) };
      if (typeof opts !== "string") {
        if (opts?.match) matchOpts.if = `event.${opts.match} == async.${opts.match}`;
        else if (opts?.if) matchOpts.if = opts.if;
      }
      const eventName = typeof opts.event === "string" ? opts.event : opts.event.name;
      return {
        id,
        mode: StepMode.Async,
        op: StepOpCode.WaitForEvent,
        name: eventName,
        opts: matchOpts,
        displayName: name ?? id,
        userland: { id }
      };
    }),
    run: createStepRun(),
    ai: {
      infer: createTool(({ id, name }, options) => {
        const { model, body, ...rest } = options;
        const modelCopy = { ...model };
        options.model.onCall?.(modelCopy, options.body);
        return {
          id,
          mode: StepMode.Async,
          op: StepOpCode.AiGateway,
          displayName: name ?? id,
          opts: {
            type: "step.ai.infer",
            url: modelCopy.url,
            headers: modelCopy.headers,
            auth_key: modelCopy.authKey,
            format: modelCopy.format,
            body,
            ...rest
          },
          userland: { id }
        };
      }),
      wrap: createStepRun("step.ai.wrap"),
      models: { ...import_ai.models }
    },
    sleep: createTool(({ id, name }, time) => {
      const msTimeStr = timeStr(time);
      return {
        id,
        mode: StepMode.Async,
        op: StepOpCode.Sleep,
        name: msTimeStr,
        displayName: name ?? id,
        userland: { id }
      };
    }),
    sleepUntil: createTool(({ id, name }, time) => {
      try {
        const iso = getISOString(time);
        return {
          id,
          mode: StepMode.Async,
          op: StepOpCode.Sleep,
          name: iso,
          displayName: name ?? id,
          userland: { id }
        };
      } catch (err2) {
        client[internalLoggerSymbol].warn({ err: err2 }, "Invalid `Date`, date string, `Temporal.Instant`, or `Temporal.ZonedDateTime` passed to sleepUntil");
        throw new Error(`Invalid \`Date\`, date string, \`Temporal.Instant\`, or \`Temporal.ZonedDateTime\` passed to sleepUntil: ${time}`);
      }
    }),
    invoke: createTool(({ id, name }, invokeOpts) => {
      const optsSchema = invokePayloadSchema.extend({ timeout: external_exports.custom((v$1) => typeof v$1 === "number" || typeof v$1 === "string" || v$1 instanceof Date || isTemporalDuration(v$1) || isTemporalInstant(v$1) || isTemporalZonedDateTime(v$1), { message: "Invalid timeout" }).optional() });
      const parsedFnOpts = optsSchema.extend({
        _type: external_exports.literal("fnInstance").optional().default("fnInstance"),
        function: external_exports.instanceof(InngestFunction)
      }).or(optsSchema.extend({
        _type: external_exports.literal("refInstance").optional().default("refInstance"),
        function: external_exports.instanceof(InngestFunctionReference)
      })).safeParse(invokeOpts);
      if (!parsedFnOpts.success) throw new Error(`Invalid invocation options passed to invoke; must include a function instance or referenceFunction().`);
      const { _type, function: fn2, data, v: v2, meta, timeout } = parsedFnOpts.data;
      const opts = {
        payload: {
          data,
          v: v2,
          meta: normalizeEventMeta(meta)
        },
        function_id: "",
        timeout: typeof timeout === "undefined" ? void 0 : timeStr(timeout)
      };
      switch (_type) {
        case "fnInstance":
          opts.function_id = fn2.id(fn2["client"].id);
          break;
        case "refInstance":
          opts.function_id = [fn2.opts.appId || client.id, fn2.opts.functionId].filter(Boolean).join("-");
          break;
      }
      return {
        id,
        mode: StepMode.Async,
        op: StepOpCode.InvokeFunction,
        displayName: name ?? id,
        opts,
        userland: { id }
      };
    }),
    fetch: fetch2
  };
  tools[metadataSymbol] = (memoizationId) => createStepMetadataWrapper(memoizationId);
  tools[experimentStepRunSymbol] = createStepRun("group.experiment");
  tools[gatewaySymbol] = createTool(({ id, name }, input, init) => {
    const url = input instanceof Request ? input.url : input.toString();
    const headers = {};
    if (input instanceof Request) input.headers.forEach((value, key) => {
      headers[key] = value;
    });
    else if (init?.headers) new Headers(init.headers).forEach((value, key) => {
      headers[key] = value;
    });
    return {
      id,
      mode: StepMode.Async,
      op: StepOpCode.Gateway,
      displayName: name ?? id,
      opts: {
        url,
        method: init?.method ?? "GET",
        headers,
        body: init?.body
      },
      userland: { id }
    };
  });
  return tools;
};
var gatewaySymbol = /* @__PURE__ */ Symbol.for("inngest.step.gateway");
var experimentStepRunSymbol = /* @__PURE__ */ Symbol.for("inngest.group.experiment");
var step = {
  fetch: null,
  ai: {
    infer: (...args) => getDeferredStepTooling().then((tools) => tools.ai.infer(...args)),
    wrap: (...args) => getDeferredStepTooling().then((tools) => tools.ai.wrap(...args)),
    models: { ...import_ai.models }
  },
  invoke: (...args) => getDeferredStepTooling().then((tools) => tools.invoke(...args)),
  run: (...args) => getDeferredStepTooling().then((tools) => tools.run(...args)),
  sendEvent: (...args) => getDeferredStepTooling().then((tools) => tools.sendEvent(...args)),
  sendSignal: (...args) => getDeferredStepTooling().then((tools) => tools.sendSignal(...args)),
  sleep: (...args) => getDeferredStepTooling().then((tools) => tools.sleep(...args)),
  sleepUntil: (...args) => getDeferredStepTooling().then((tools) => tools.sleepUntil(...args)),
  waitForEvent: (...args) => getDeferredStepTooling().then((tools) => tools.waitForEvent(...args)),
  waitForSignal: (...args) => getDeferredStepTooling().then((tools) => tools.waitForSignal(...args)),
  realtime: { publish: (...args) => getDeferredStepTooling().then((tools) => tools.realtime.publish(...args)) }
};
var getDeferredStepTooling = async () => {
  const ctx = await getAsyncCtx();
  if (!ctx) throw new Error("`step` tools can only be used within Inngest function executions; no context was found");
  if (!ctx.app) throw new Error("`step` tools can only be used within Inngest function executions; no Inngest client was found in the execution context");
  if (!ctx.execution) throw new Error("`step` tools can only be used within Inngest function executions; no execution context was found");
  return ctx.execution.ctx.step;
};
var getDeferredGroupTooling = async () => {
  const ctx = await getAsyncCtx();
  if (!ctx) throw new Error("`group` tools can only be used within Inngest function executions; no context was found");
  if (!ctx.execution) throw new Error("`group` tools can only be used within Inngest function executions; no execution context was found");
  return ctx.execution.ctx.group;
};
var group = {
  parallel: (...args) => getDeferredGroupTooling().then((tools) => tools.parallel(...args)),
  experiment: (...args) => getDeferredGroupTooling().then((tools) => tools.experiment(...args))
};
var invokePayloadSchema = external_exports.object({
  data: external_exports.record(external_exports.any()).optional(),
  v: external_exports.string().optional(),
  meta: external_exports.object({ sessions: external_exports.record(external_exports.any()).optional() }).optional()
});

// node_modules/inngest/components/middleware/utils.js
function isSleepInput(value) {
  return typeof value === "string" || typeof value === "number" || value instanceof Date || isTemporalDuration(value);
}
function buildWrapSendEventChain(middleware, handler2, payloads, fn2) {
  let chain = handler2;
  for (let i2 = middleware.length - 1; i2 >= 0; i2--) {
    const mw = middleware[i2];
    if (mw?.wrapSendEvent) {
      const next = chain;
      chain = () => mw.wrapSendEvent({
        next,
        events: payloads,
        fn: fn2
      });
    }
  }
  return chain;
}
function buildWrapRequestChain({ fn: fn2, handler: handler2, middleware, requestArgs, requestInfo, runId }) {
  let chain = handler2;
  for (let i2 = middleware.length - 1; i2 >= 0; i2--) {
    const mw = middleware[i2];
    if (mw?.wrapRequest) {
      const next = chain;
      chain = () => mw.wrapRequest({
        next,
        requestArgs,
        requestInfo,
        runId,
        fn: fn2
      });
    }
  }
  return chain;
}
function stepTypeFromOpCode(op, opts, logger) {
  if (op === StepOpCode.AiGateway) {
    if (opts?.type === "step.ai.infer") return "ai.infer";
    if (opts?.type === "step.ai.wrap") return "ai.wrap";
  } else if (op === StepOpCode.Gateway) return "fetch";
  else if (op === StepOpCode.InvokeFunction) return "invoke";
  else if (op === StepOpCode.StepPlanned) {
    if (opts?.type === void 0) return "run";
    if (opts?.type === "step.sendEvent") return "sendEvent";
    if (opts?.type === "step.realtime.publish") return "realtime.publish";
    if (opts?.type === "group.experiment") return "group.experiment";
  } else if (op === StepOpCode.Sleep) return "sleep";
  else if (op === StepOpCode.WaitForEvent) return "waitForEvent";
  else if (op === StepOpCode.WaitForSignal) return "waitForSignal";
  logger.warn({
    op,
    type: opts?.type
  }, "Unknown step type");
  return "unknown";
}
function stepInputFromOpts(stepType, opts) {
  if (stepType === "invoke" || stepType === "waitForEvent") return [opts];
  if (Array.isArray(opts?.input)) return opts.input;
}
function optsFromStepInput(stepType, input) {
  if (input === void 0) return;
  if (stepType === "invoke" || stepType === "waitForEvent") {
    const opts = input[0];
    if (isRecord(opts)) return opts;
  }
}
var UnreachableError = class extends Error {
  constructor(...args) {
    super(...args);
    this.name = this.constructor.name;
  }
};

// node_modules/inngest/components/realtime/types.js
var Realtime;
(function(_Realtime) {
  _Realtime.messageSchema = external_exports.object({
    channel: external_exports.string().optional(),
    topic: external_exports.string().optional(),
    data: external_exports.any(),
    run_id: external_exports.string().optional(),
    fn_id: external_exports.string().optional(),
    created_at: external_exports.string().optional().transform((v2) => v2 ? new Date(v2) : void 0),
    env_id: external_exports.string().optional(),
    stream_id: external_exports.string().optional(),
    kind: external_exports.enum([
      "step",
      "run",
      "data",
      "ping",
      "pong",
      "closing",
      "event",
      "sub",
      "unsub",
      "datastream-start",
      "datastream-end",
      "chunk"
    ])
  }).transform(({ data, ...rest }) => {
    return {
      ...rest,
      data: data ?? void 0
    };
  });
})(Realtime || (Realtime = {}));

// node_modules/inngest/components/realtime/subscribe/StreamFanout.js
var StreamFanout = class {
  #writers = /* @__PURE__ */ new Set();
  createStream(transform) {
    const { readable, writable } = new TransformStream({ transform: (chunk, controller) => {
      controller.enqueue(transform ? transform(chunk) : chunk);
    } });
    const writer = writable.getWriter();
    this.#writers.add(writer);
    writer.closed.catch(() => {
    }).finally(() => {
      this.#writers.delete(writer);
    });
    return readable;
  }
  write(chunk) {
    for (const writer of this.#writers) writer.ready.then(() => writer.write(chunk)).catch(() => this.#writers.delete(writer));
  }
  close() {
    for (const writer of this.#writers) try {
      writer.close().catch(() => {
      });
    } catch {
    }
    this.#writers.clear();
  }
  size() {
    return this.#writers.size;
  }
};

// node_modules/inngest/components/realtime/subscribe/TokenSubscription.js
var import_debug5 = __toESM(require_browser(), 1);
var extractSchema = (topicEntry) => {
  if (!topicEntry || typeof topicEntry !== "object") return;
  if ("schema" in topicEntry && topicEntry.schema) return topicEntry.schema;
};
var TokenSubscription = class {
  #apiBaseUrl;
  #channelId;
  #debug = (0, import_debug5.default)("inngest:realtime");
  #encoder = new TextEncoder();
  #fanout = new StreamFanout();
  #running = false;
  #topics;
  #ws = null;
  #signingKey;
  #signingKeyFallback;
  #validate;
  #getSubscriptionToken;
  #chunkStreams = /* @__PURE__ */ new Map();
  token;
  constructor(options) {
    this.token = options.token;
    this.#apiBaseUrl = options.apiBaseUrl;
    this.#signingKey = options.signingKey;
    this.#signingKeyFallback = options.signingKeyFallback;
    this.#validate = options.validate ?? true;
    this.#getSubscriptionToken = options.getSubscriptionToken;
    const channel2 = this.token.channel;
    if (typeof channel2 === "string") {
      this.#channelId = channel2;
      this.#topics = new Map(this.token.topics.map((name) => [name, void 0]));
    } else {
      this.#channelId = channel2.name;
      this.#topics = new Map(this.token.topics.map((name) => [name, channel2.topics?.[name]]));
    }
  }
  getWsUrl(token) {
    const path = "/v1/realtime/connect";
    let url;
    if (this.#apiBaseUrl) url = new URL(path, this.#apiBaseUrl);
    else url = new URL(path, "https://api.inngest.com/");
    url.protocol = url.protocol === "http:" ? "ws:" : "wss:";
    url.searchParams.set("token", token);
    return url;
  }
  isExpectedChannel(channel2) {
    if (channel2 === this.#channelId) return true;
    this.#debug(`Received message for unexpected channel "${channel2}" (expected "${this.#channelId}")`);
    return false;
  }
  async connect() {
    this.#debug(`Establishing connection to channel "${this.#channelId}" with topics ${JSON.stringify([...this.#topics.keys()])}...`);
    if (typeof WebSocket === "undefined") throw new Error("WebSockets not supported in current environment");
    let key = this.token.key;
    if (!key) {
      this.#debug("No subscription token key passed; attempting to retrieve one automatically...");
      key = await this.lazilyGetSubscriptionToken();
      if (!key) throw new Error("No subscription token key passed and failed to retrieve one automatically");
    }
    const ret = createDeferredPromise();
    let isConnectSettled = false;
    let hasOpened = false;
    const resolveConnect = () => {
      if (isConnectSettled) return;
      isConnectSettled = true;
      ret.resolve();
    };
    const rejectConnect = (err2) => {
      if (isConnectSettled) return;
      isConnectSettled = true;
      ret.reject(err2);
    };
    try {
      this.#running = true;
      this.#ws = new WebSocket(this.getWsUrl(key));
      this.#ws.onopen = () => {
        this.#debug("WebSocket connection established");
        hasOpened = true;
        resolveConnect();
      };
      this.#ws.onmessage = async (event) => {
        let parsedJson;
        try {
          parsedJson = JSON.parse(event.data);
        } catch (err2) {
          this.#debug("Received non-JSON message:", err2);
          return;
        }
        const parseRes = await Realtime.messageSchema.safeParseAsync(parsedJson);
        if (!parseRes.success) {
          this.#debug("Received invalid message:", parseRes.error);
          return;
        }
        const msg = parseRes.data;
        if (!this.#running) {
          this.#debug(`Received message on channel "${msg.channel}" for topic "${msg.topic}" but stream is closed`);
          return;
        }
        switch (msg.kind) {
          case "data": {
            if (!msg.channel) {
              this.#debug(`Received message on channel "${msg.channel}" with no channel`);
              return;
            }
            if (!this.isExpectedChannel(msg.channel)) return;
            if (!msg.topic) {
              this.#debug(`Received message on channel "${msg.channel}" with no topic`);
              return;
            }
            if (!this.#topics.has(msg.topic)) {
              this.#debug(`Received message on channel "${msg.channel}" for unknown topic "${msg.topic}"`);
              return;
            }
            const schema = extractSchema(this.#topics.get(msg.topic));
            if (this.#validate && schema) {
              const validateRes = await schema["~standard"].validate(msg.data);
              if (validateRes.issues) {
                console.error(`Received message on channel "${msg.channel}" for topic "${msg.topic}" that failed schema validation:`, validateRes.issues);
                return;
              }
              msg.data = validateRes.value;
            }
            this.#debug(`Received message on channel "${msg.channel}" for topic "${msg.topic}":`, msg.data);
            return this.#fanout.write({
              channel: msg.channel,
              topic: msg.topic,
              data: msg.data,
              fnId: msg.fn_id,
              createdAt: msg.created_at || /* @__PURE__ */ new Date(),
              runId: msg.run_id,
              kind: "data",
              envId: msg.env_id
            });
          }
          case "run":
            if (msg.channel && !this.isExpectedChannel(msg.channel)) return;
            this.#debug(`Received run lifecycle message on "${msg.channel}"`);
            return this.#fanout.write({
              channel: msg.channel,
              topic: msg.topic,
              data: msg.data,
              fnId: msg.fn_id,
              createdAt: msg.created_at || /* @__PURE__ */ new Date(),
              runId: msg.run_id,
              kind: "run",
              envId: msg.env_id
            });
          case "datastream-start": {
            if (!msg.channel || !msg.topic) {
              this.#debug(`Received message on channel "${msg.channel}" with no channel or topic`);
              return;
            }
            if (!this.isExpectedChannel(msg.channel)) return;
            const streamId = msg.data;
            if (typeof streamId !== "string" || !streamId) {
              this.#debug(`Received message on channel "${msg.channel}" with no stream ID`);
              return;
            }
            if (this.#chunkStreams.has(streamId)) {
              this.#debug(`Received message on channel "${msg.channel}" to create stream ID "${streamId}" that already exists`);
              return;
            }
            const stream = new ReadableStream({
              start: (controller) => {
                this.#chunkStreams.set(streamId, {
                  stream,
                  controller
                });
              },
              cancel: () => {
                this.#chunkStreams.delete(streamId);
              }
            });
            this.#debug(`Created stream ID "${streamId}" on channel "${msg.channel}"`);
            return this.#fanout.write({
              channel: msg.channel,
              topic: msg.topic,
              kind: "datastream-start",
              data: streamId,
              streamId,
              fnId: msg.fn_id,
              runId: msg.run_id,
              stream
            });
          }
          case "datastream-end": {
            if (!msg.channel || !msg.topic) {
              this.#debug(`Received message on channel "${msg.channel}" with no channel or topic`);
              return;
            }
            if (!this.isExpectedChannel(msg.channel)) return;
            const endStreamId = msg.data;
            if (typeof endStreamId !== "string" || !endStreamId) {
              this.#debug(`Received message on channel "${msg.channel}" with no stream ID`);
              return;
            }
            const endStream = this.#chunkStreams.get(endStreamId);
            if (!endStream) {
              this.#debug(`Received message on channel "${msg.channel}" to close stream ID "${endStreamId}" that doesn't exist`);
              return;
            }
            endStream.controller.close();
            this.#chunkStreams.delete(endStreamId);
            this.#debug(`Closed stream ID "${endStreamId}" on channel "${msg.channel}"`);
            return this.#fanout.write({
              channel: msg.channel,
              topic: msg.topic,
              kind: "datastream-end",
              data: endStreamId,
              streamId: endStreamId,
              fnId: msg.fn_id,
              runId: msg.run_id,
              stream: endStream.stream
            });
          }
          case "chunk": {
            if (!msg.channel || !msg.topic) {
              this.#debug(`Received message on channel "${msg.channel}" with no channel or topic`);
              return;
            }
            if (!this.isExpectedChannel(msg.channel)) return;
            if (!msg.stream_id) {
              this.#debug(`Received message on channel "${msg.channel}" with no stream ID`);
              return;
            }
            const chunkStream = this.#chunkStreams.get(msg.stream_id);
            if (!chunkStream) {
              this.#debug(`Received message on channel "${msg.channel}" for unknown stream ID "${msg.stream_id}"`);
              return;
            }
            this.#debug(`Received chunk on channel "${msg.channel}" for stream ID "${msg.stream_id}":`, msg.data);
            chunkStream.controller.enqueue(msg.data);
            return this.#fanout.write({
              channel: msg.channel,
              topic: msg.topic,
              kind: "chunk",
              data: msg.data,
              streamId: msg.stream_id,
              fnId: msg.fn_id,
              runId: msg.run_id,
              stream: chunkStream.stream
            });
          }
          default:
            this.#debug(`Received message on channel "${msg.channel}" with unhandled kind "${msg.kind}"`);
            return;
        }
      };
      this.#ws.onerror = (event) => {
        console.error("WebSocket error observed:", event);
        rejectConnect(event);
      };
      this.#ws.onclose = (event) => {
        this.#debug("WebSocket closed:", event.reason);
        if (!hasOpened) rejectConnect(/* @__PURE__ */ new Error(`WebSocket closed before opening${event.reason ? `: ${event.reason}` : ""}`));
        this.close();
      };
    } catch (err2) {
      this.#running = false;
      ret.reject(err2);
    }
    return ret.promise;
  }
  async lazilyGetSubscriptionToken() {
    const channelId = this.#channelId;
    if (!channelId) throw new Error("Channel ID is required to create a subscription token");
    if (this.#getSubscriptionToken) return this.#getSubscriptionToken(channelId, this.token.topics);
    throw new Error("No getSubscriptionToken handler provided. Pass an Inngest client or provide a token key.");
  }
  close(reason = "Userland closed connection") {
    if (!this.#running) return;
    this.#debug("close() called; closing connection...");
    this.#running = false;
    this.#ws?.close(1e3, reason);
    this.#ws = null;
    for (const { controller } of this.#chunkStreams.values()) try {
      controller.close();
    } catch {
    }
    this.#chunkStreams.clear();
    this.#debug(`Closing ${this.#fanout.size()} streams...`);
    this.#fanout.close();
  }
  getJsonStream() {
    return this.#fanout.createStream();
  }
  getEncodedStream() {
    return this.#fanout.createStream((chunk) => {
      return this.#encoder.encode(`data: ${JSON.stringify(chunk)}

`);
    });
  }
  useCallback(callback, stream = this.getJsonStream(), onError) {
    (async () => {
      const reader = stream.getReader();
      try {
        while (this.#running) {
          const { done, value } = await reader.read();
          if (done || !this.#running) break;
          try {
            await callback(value);
          } catch (err2) {
            if (onError) onError(err2);
            else console.error("Realtime subscription callback failed:", err2);
          }
        }
      } finally {
        reader.releaseLock();
      }
    })();
  }
};

// node_modules/inngest/components/realtime/subscribe/index.js
async function subscribe(token, callback) {
  const app = token.app;
  const getSubscriptionToken$1 = app ? (channel2, topics) => app["inngestApi"].getSubscriptionToken(channel2, topics) : void 0;
  const subscription = new TokenSubscription({
    token,
    apiBaseUrl: token.apiBaseUrl ?? app?.apiBaseUrl,
    getSubscriptionToken: getSubscriptionToken$1,
    validate: token.validate
  });
  await subscription.connect();
  const extras = {
    getJsonStream: () => subscription.getJsonStream(),
    getEncodedStream: () => subscription.getEncodedStream(),
    close: (reason) => subscription.close(reason),
    unsubscribe: (reason) => subscription.close(reason)
  };
  const onMessage = token.onMessage || callback;
  if (onMessage) {
    const callbackStream = subscription.getJsonStream();
    subscription.useCallback(onMessage, callbackStream, token.onError);
  }
  if (token.onMessage) return extras;
  const retStream = subscription.getJsonStream();
  return Object.assign(retStream, extras);
}
var getSubscriptionToken = async (app, args) => {
  const channelId = typeof args.channel === "string" ? args.channel : args.channel.name;
  if (!channelId) throw new Error("Channel ID is required to create a subscription token");
  const key = await app["inngestApi"].getSubscriptionToken(channelId, args.topics);
  return {
    channel: args.channel,
    topics: args.topics,
    key,
    apiBaseUrl: app?.apiBaseUrl
  };
};

// node_modules/inngest/components/triggers/typeHelpers.js
function isValidatable(value) {
  if (typeof value !== "object" || value === null) return false;
  if (!("validate" in value)) return false;
  return typeof value.validate === "function";
}

// node_modules/inngest/components/Inngest.js
var internalLoggerSymbol = /* @__PURE__ */ Symbol.for("inngest.internalLogger");
var Inngest = class Inngest2 {
  get [Symbol.toStringTag]() {
    return Inngest2.Tag;
  }
  /**
  * The ID of this instance, most commonly a reference to the application it
  * resides in.
  *
  * The ID of your client should remain the same for its lifetime; if you'd
  * like to change the name of your client as it appears in the Inngest UI,
  * change the `name` property instead.
  */
  id;
  /**
  * Stores the options so we can remember explicit settings the user has
  * provided.
  */
  options;
  inngestApi;
  _userProvidedFetch;
  _cachedFetch;
  _logger;
  /**
  * Logger for SDK internal messages. Falls back to the user's `logger` if
  * `internalLogger` is not provided in client options.
  *
  * @internal
  */
  [internalLoggerSymbol];
  localFns = [];
  /**
  * Middleware instances that provide simpler hooks.
  */
  middleware;
  _env = {};
  _appVersion;
  /**
  * @internal
  * Flag set by metadataMiddleware to enable step.metadata()
  */
  experimentalMetadataEnabled = false;
  /**
  * A dummy Inngest function used in Durable Endpoints. This is necessary
  * because the vast majority of middleware hooks require the Inngest function.
  * But for Durable Endpoints, there is no Inngest function. So we need some
  * placeholder.
  */
  dummyDurableEndpointFunction = null;
  getDummyDurableEndpointFunction() {
    if (this.dummyDurableEndpointFunction) return this.dummyDurableEndpointFunction;
    this.dummyDurableEndpointFunction = new InngestFunction(this, {
      id: "__proxy__",
      triggers: []
    }, async () => {
    });
    return this.dummyDurableEndpointFunction;
  }
  /**
  * Try to parse the `INNGEST_DEV` environment variable as a URL.
  * Returns the URL if valid, otherwise `undefined`.
  */
  get explicitDevUrl() {
    const devEnvValue = this._env[envKeys.InngestDevMode];
    if (typeof devEnvValue !== "string" || !devEnvValue) return;
    if (parseAsBoolean(devEnvValue) !== void 0) return;
    try {
      return new URL(normalizeUrl(devEnvValue));
    } catch {
      return;
    }
  }
  /**
  * Given a default cloud URL, return the appropriate URL based on the
  * current mode and environment variables.
  *
  * If `INNGEST_DEV` is set to a URL, that URL is used. Otherwise, we use
  * the default cloud URL in cloud mode or the default dev server host in
  * dev mode.
  */
  resolveDefaultUrl(cloudUrl) {
    const explicitDevUrl = this.explicitDevUrl;
    if (explicitDevUrl) return explicitDevUrl.href;
    return this.mode === "cloud" ? cloudUrl : defaultDevServerHost;
  }
  get apiBaseUrl() {
    return this.options.baseUrl || this._env[envKeys.InngestApiBaseUrl] || this._env[envKeys.InngestBaseUrl] || this.resolveDefaultUrl(defaultInngestApiBaseUrl);
  }
  get eventBaseUrl() {
    return this.options.baseUrl || this._env[envKeys.InngestEventApiBaseUrl] || this._env[envKeys.InngestBaseUrl] || this.resolveDefaultUrl(defaultInngestEventBaseUrl);
  }
  get eventKey() {
    return this.options.eventKey || this._env[envKeys.InngestEventKey] || void 0;
  }
  get fetch() {
    if (!this._cachedFetch) this._cachedFetch = this._userProvidedFetch ? getFetch(this[internalLoggerSymbol], this._userProvidedFetch) : getFetch(this[internalLoggerSymbol], globalThis.fetch);
    return this._cachedFetch;
  }
  get signingKey() {
    return this.options.signingKey || this._env[envKeys.InngestSigningKey];
  }
  get signingKeyFallback() {
    return this.options.signingKeyFallback || this._env[envKeys.InngestSigningKeyFallback];
  }
  get headers() {
    return inngestHeaders({
      inngestEnv: this.options.env,
      env: this._env
    });
  }
  /**
  * The base logger for this client. Passed to user functions as `ctx.logger`.
  */
  get logger() {
    return this._logger;
  }
  get env() {
    return this.headers[headerKeys.Environment] ?? null;
  }
  get appVersion() {
    return this._appVersion;
  }
  /**
  * Access the metadata builder for updating run and step metadata.
  *
  * @example
  * ```ts
  * // Update metadata for the current run
  * await inngest.metadata.update({ status: "processing" });
  *
  * // Update metadata for a different run
  * await inngest.metadata.run(otherRunId).update({ key: "val" });
  *
  * ```
  */
  get metadata() {
    if (!this.experimentalMetadataEnabled) throw new Error('inngest.metadata is experimental. Enable it by adding metadataMiddleware() from "inngest/experimental" to your client middleware.');
    return new UnscopedMetadataBuilder(this);
  }
  /**
  * A client used to interact with the Inngest API by sending or reacting to
  * events.
  *
  * ```ts
  * const inngest = new Inngest({ id: "my-app" });
  * ```
  */
  constructor(options) {
    this.options = options;
    const { id, logger, middleware, appVersion } = this.options;
    if (!id) throw new Error("An `id` must be passed to create an Inngest instance.");
    this.id = id;
    this._env = protectEnv({ ...getProcessEnv() });
    this._userProvidedFetch = options.fetch;
    this.inngestApi = new InngestApi({
      baseUrl: () => this.apiBaseUrl,
      signingKey: () => this.signingKey,
      signingKeyFallback: () => this.signingKeyFallback,
      fetch: () => this.fetch
    });
    this._logger = logger ?? new ConsoleLogger();
    this[internalLoggerSymbol] = this.options.internalLogger ?? this._logger;
    if (this.options.optimizeParallelism === false) warnOnce(this[internalLoggerSymbol], `optimize-parallelism-deprecated:${this.id}`, '`optimizeParallelism: false` is deprecated; use `group.parallel({ mode: "race" }, ...)` for race semantics instead');
    this.middleware = [...builtInMiddleware(this._logger), ...middleware ?? []];
    for (const mw of this.middleware) mw.onRegister?.({
      client: this,
      fn: null
    });
    metadataSpanProcessor.attach();
    this._appVersion = appVersion;
  }
  /**
  * Returns a `Promise` that resolves when the app is ready and all middleware
  * has been initialized.
  */
  get ready() {
    return Promise.resolve();
  }
  /**
  * Set the environment variables for this client. This is useful if you are
  * passed environment variables at runtime instead of as globals and need to
  * update the client with those values as requests come in.
  */
  setEnvVars(env = getProcessEnv()) {
    this._env = protectEnv({
      ...this._env,
      ...env
    });
    return this;
  }
  get mode() {
    if (typeof this.options.isDev === "boolean") return this.options.isDev ? "dev" : "cloud";
    const envIsDev = parseAsBoolean(this._env[envKeys.InngestDevMode]);
    if (typeof envIsDev === "boolean") return envIsDev ? "dev" : "cloud";
    if (this.explicitDevUrl) return "dev";
    return "cloud";
  }
  /**
  * Given a response from Inngest, relay the error to the caller.
  */
  async getResponseError(response, rawBody, foundErr = "Unknown error") {
    let errorMessage2 = foundErr;
    if (errorMessage2 === "Unknown error") switch (response.status) {
      case 401:
        errorMessage2 = "Event key Not Found";
        break;
      case 400:
        errorMessage2 = "Cannot process event payload";
        break;
      case 403:
        errorMessage2 = "Forbidden";
        break;
      case 404:
        errorMessage2 = "Event key not found";
        break;
      case 406:
        errorMessage2 = `${JSON.stringify(await rawBody)}`;
        break;
      case 409:
      case 412:
        errorMessage2 = "Event transformation failed";
        break;
      case 413:
        errorMessage2 = "Event payload too large";
        break;
      case 500:
        errorMessage2 = "Internal server error";
        break;
      default:
        try {
          errorMessage2 = await response.text();
        } catch (_err) {
          errorMessage2 = `${JSON.stringify(await rawBody)}`;
        }
        break;
    }
    return /* @__PURE__ */ new Error(`Inngest API Error: ${response.status} ${errorMessage2}`);
  }
  eventKeySet() {
    return this.eventKey !== void 0;
  }
  /**
  * EXPERIMENTAL: This API is not yet stable and may change in the future
  * without a major version bump.
  *
  * Send a Signal to Inngest.
  */
  async sendSignal({ signal, data, env }) {
    const headers = { ...env ? { [headerKeys.Environment]: env } : {} };
    return this._sendSignal({
      signal,
      data,
      headers
    });
  }
  async _sendSignal({ signal, data, headers }) {
    const res = await this.inngestApi.sendSignal({
      signal,
      data
    }, {
      ...this.headers,
      ...headers
    });
    if (res.ok) return res.value;
    throw new Error(`Failed to send signal: ${res.error?.error || "Unknown error"}`);
  }
  async updateMetadata({ target, metadata, headers }) {
    const res = await this.inngestApi.updateMetadata({
      target,
      metadata
    }, { headers });
    if (res.ok) return res.value;
    throw new Error(`Failed to update metadata: ${res.error?.error || "Unknown error"}`);
  }
  async warnMetadata(target, kind, log) {
    const fields = {};
    if (log.code) fields.code = log.code;
    if (log.explanation) fields.explanation = log.explanation;
    if (log.action) fields.action = log.action;
    if (log.docs) fields.docs = log.docs;
    if (Object.keys(fields).length > 0) this[internalLoggerSymbol].warn(fields, log.message);
    else this[internalLoggerSymbol].warn(log.message);
    if (!this.experimentalMetadataEnabled) return;
    await this.updateMetadata({
      target,
      metadata: [{
        kind: "inngest.warnings",
        op: "merge",
        values: { [`sdk.${kind}`]: formatLogMessage(log) }
      }]
    });
  }
  /**
  * Realtime-related functionality for this Inngest client.
  */
  realtime = {
    publish: async (topicRef, data) => {
      const topicConfig = topicRef.config;
      if (topicConfig && "schema" in topicConfig && topicConfig.schema) {
        if ((await topicConfig.schema["~standard"].validate(data)).issues) throw new Error(`Schema validation failed for topic "${topicRef.topic}"`);
      }
      const runId = (await getAsyncCtx())?.execution?.ctx.runId;
      const res = await this.inngestApi.publish({
        channel: topicRef.channel,
        topics: [topicRef.topic],
        runId
      }, data);
      if (!res.ok) throw new Error(`Failed to publish to realtime: ${res.error?.error || "Unknown error"}`);
    },
    subscribe: async (opts) => {
      return subscribe({
        ...opts,
        app: this
      });
    },
    token: async (opts) => {
      return getSubscriptionToken(this, opts);
    }
  };
  endpoint(handler2) {
    if (!this.options.endpointAdapter) throw new Error("No endpoint adapter configured for this Inngest client.");
    return this.options.endpointAdapter({ client: this })(handler2);
  }
  /**
  * Creates a proxy handler that polls Inngest for durable endpoint results.
  *
  * The proxy:
  * - Extracts `runId` and `token` from query params
  * - Fetches the result from Inngest API
  * - Runs the response through middleware (e.g., decryption)
  * - Adds CORS headers
  *
  * Use this in combination with the `asyncRedirectUrl` option on your
  * endpoint adapter to redirect users to your own proxy endpoint instead
  * of directly to Inngest.
  *
  * @example
  * ```ts
  * import { Inngest } from "inngest";
  * import { endpointAdapter } from "inngest/edge";
  *
  * const inngest = new Inngest({
  *   id: "my-app",
  *   endpointAdapter: endpointAdapter.withOptions({
  *     asyncRedirectUrl: "/api/inngest/poll",
  *   }),
  * });
  *
  * // Durable endpoint
  * export const GET = inngest.endpoint(async (req) => {
  *   const result = await step.run("work", () => "done");
  *   return new Response(result);
  * });
  *
  * // Proxy endpoint at /api/inngest/poll
  * export const GET = inngest.endpointProxy();
  * ```
  */
  endpointProxy() {
    if (!this.options.endpointAdapter) throw new Error("No endpoint adapter configured for this Inngest client.");
    if (!this.options.endpointAdapter.createProxyHandler) throw new Error("The configured endpoint adapter does not support proxy handlers.");
    return this.options.endpointAdapter.createProxyHandler({ client: this });
  }
  /**
  * Decrypt a proxy response using the client's middleware stack.
  *
  * Runs `transformFunctionInput` on each middleware instance to decrypt
  * step data (used by encryption middleware).
  *
  * Uses type assertions because we're creating a minimal "fake" execution
  * context just to run the decryption middleware hooks - not a full execution.
  *
  * @internal
  */
  async decryptProxyResult(result) {
    if (!result.data) return result;
    const mwInstances = this.middleware.map((Cls) => {
      return new Cls({ client: this });
    });
    const dummyEvent = {
      name: "__proxy__",
      data: {}
    };
    let transformArgs = {
      ctx: {
        event: dummyEvent,
        events: [dummyEvent],
        runId: "__proxy__",
        attempt: 0,
        step
      },
      fn: this.getDummyDurableEndpointFunction(),
      steps: { __result__: {
        type: "data",
        data: result.data
      } }
    };
    for (const mw of mwInstances) if (mw.transformFunctionInput) transformArgs = await mw.transformFunctionInput(transformArgs);
    const decryptedStep = transformArgs.steps?.__result__;
    let decryptedData = result.data;
    if (decryptedStep && "data" in decryptedStep) decryptedData = decryptedStep.data;
    return {
      ...result,
      data: decryptedData
    };
  }
  /**
  * Send one or many events to Inngest. Takes an entire payload (including
  * name) as each input.
  *
  * ```ts
  * await inngest.send({ name: "app/user.created", data: { id: 123 } });
  * ```
  *
  * Returns a promise that will resolve if the event(s) were sent successfully,
  * else throws with an error explaining what went wrong.
  */
  async send(payload, options) {
    const headers = { ...options?.env ? { [headerKeys.Environment]: options.env } : {} };
    return this._send({
      payload,
      headers,
      fnMiddleware: [],
      fn: null
    });
  }
  /**
  * Internal method for sending an event, used to allow Inngest internals to
  * further customize the request sent to an Inngest Server.
  */
  async _send({ payload, headers, fn: fn2, fnMiddleware }) {
    const nowMillis = (/* @__PURE__ */ new Date()).getTime();
    let maxAttempts = 5;
    try {
      const entropy = createEntropy(10);
      const entropyBase64 = Buffer.from(entropy).toString("base64");
      headers = {
        ...headers,
        [headerKeys.EventIdSeed]: `${nowMillis},${entropyBase64}`
      };
    } catch (err2) {
      this[internalLoggerSymbol].debug({ err: err2 }, "Event-sending retries disabled");
      maxAttempts = 1;
    }
    let payloads = Array.isArray(payload) ? payload : payload ? [payload] : [];
    const mwInstances = [...this.middleware, ...fnMiddleware].map((Cls) => new Cls({ client: this }));
    for (const mw of mwInstances) if (mw?.transformSendEvent) {
      const transformed = await mw.transformSendEvent({
        events: payloads,
        fn: fn2 ?? null
      });
      if (transformed !== void 0) payloads = transformed.events;
    }
    for (const payload$1 of payloads) if (isValidatable(payload$1)) await payload$1.validate();
    payloads = payloads.map((p2) => {
      const { sessions: _sessions, ctx: _ctx, ...rest } = p2;
      return {
        ...rest,
        id: p2.id,
        ts: p2.ts || nowMillis,
        data: p2.data || {},
        meta: normalizeEventMeta(p2.meta)
      };
    });
    if (!payloads.length) {
      this[internalLoggerSymbol].warn("inngest.send() called with no events; the returned promise will resolve, but no events have been sent");
      return { ids: [] };
    }
    if (this.mode === "cloud" && !this.eventKeySet()) throw new Error(formatLogMessage({
      message: "Failed to send event",
      explanation: "Your event or events were not sent to Inngest. We couldn't find an event key to use to send events to Inngest.",
      action: fixEventKeyMissingSteps.join("; ")
    }));
    const innerHandler = async () => {
      return { ids: (await retryWithBackoff(async () => {
        let rawBody;
        let body;
        const url = new URL(`e/${this.eventKey ?? dummyEventKey}`, this.eventBaseUrl);
        const response = await this.fetch(url.href, {
          method: "POST",
          body: stringify$1(payloads),
          headers: {
            ...this.headers,
            ...headers
          }
        });
        try {
          rawBody = await response.json();
          body = await sendEventResponseSchema.parseAsync(rawBody);
        } catch (_err) {
          throw await this.getResponseError(response, rawBody);
        }
        if (body.status !== 200 || body.error) throw await this.getResponseError(response, rawBody, body.error);
        return body;
      }, {
        maxAttempts,
        baseDelay: 100
      })).ids };
    };
    return await buildWrapSendEventChain(mwInstances, innerHandler, payloads, fn2)();
  }
  createFunction = (rawOptions, handler2) => {
    const fn2 = this._createFunction(rawOptions, handler2);
    for (const mw of fn2.opts.middleware ?? []) mw.onRegister?.({
      client: this,
      fn: fn2
    });
    this.localFns.push(fn2);
    return fn2;
  };
  get funcs() {
    return this.localFns;
  }
  _createFunction = (rawOptions, handler2) => {
    if (typeof handler2 !== "function") throw new Error(`"createFunction" expected a handler function as the second argument. Triggers belong in the first argument: createFunction({ id, triggers: { event: "..." } }, handler)`);
    const options = {
      ...rawOptions,
      triggers: this.sanitizeTriggers(rawOptions.triggers)
    };
    return new InngestFunction(this, options, handler2);
  };
  /**
  * Runtime-only validation.
  */
  sanitizeTriggers(triggers) {
    if (triggers === void 0) return [];
    if (!Array.isArray(triggers)) return [triggers];
    return triggers;
  }
};
function builtInMiddleware(baseLogger) {
  return [class LoggerMiddleware extends Middleware.BaseMiddleware {
    id = "inngest:logger";
    proxyLogger = new ProxyLogger(baseLogger);
    transformFunctionInput(arg) {
      let logger = baseLogger;
      if ("child" in logger) try {
        const childMetadata = {
          runID: arg.ctx.runId,
          eventName: arg.ctx.event.name
        };
        if (typeof arg.ctx.requestId !== "undefined") childMetadata.requestId = arg.ctx.requestId;
        if (typeof arg.ctx.jobId !== "undefined") childMetadata.jobId = arg.ctx.jobId;
        logger = logger.child(childMetadata);
      } catch (err2) {
        logger.error({ err: err2 }, 'failed to create "childLogger" with error');
      }
      this.proxyLogger = new ProxyLogger(logger);
      return {
        ...arg,
        ctx: Object.assign({}, arg.ctx, { logger: this.proxyLogger })
      };
    }
    onMemoizationEnd() {
      this.proxyLogger.enable();
    }
    onStepError(arg) {
      this.proxyLogger.error({ err: arg.error }, "Inngest step error");
    }
    wrapFunctionHandler({ next }) {
      return next().catch((err2) => {
        this.proxyLogger.error({ err: err2 }, "Inngest function error");
        throw err2;
      });
    }
    wrapRequest({ next }) {
      return next().finally(() => this.proxyLogger.flush());
    }
  }];
}
(function(_Inngest) {
  _Inngest.Tag = "Inngest.App";
})(Inngest || (Inngest = {}));

// node_modules/inngest/components/middleware/manager.js
var MiddlewareManager = class {
  fnArg;
  getStepState;
  /**
  * Whether any middleware defines `transformStepInput`. Used for perf
  * optimization.
  */
  hasTransformStepInput;
  /**
  * Whether memoization has ended. Used for idempotency, since memoization must
  * only call once per request.
  */
  memoizationEnded = false;
  fn;
  middleware;
  internalLogger;
  /**
  * Infinite recursion guard for `wrapStep`. Prevents a middleware from
  * wrapping steps it creates inside its own `wrapStep` via `ctx.step.run`.
  */
  activeWrapStep = /* @__PURE__ */ new Set();
  constructor(fnArg, getStepState, middleware = [], fn2, logger) {
    this.fnArg = fnArg;
    this.getStepState = getStepState;
    this.middleware = middleware;
    this.fn = fn2;
    this.internalLogger = logger;
    this.hasTransformStepInput = middleware.some((mw) => Boolean(mw?.transformStepInput));
  }
  hasMiddleware() {
    return this.middleware.length > 0;
  }
  /**
  * Derives step-kind, extracts input, runs `transformStepInput` middleware,
  * and creates a deferred handler entry point. Does NOT build the wrapStep
  * chain — the caller should do that after any post-processing (e.g. ID
  * collision resolution) so middleware sees final values.
  */
  async applyToStep(input) {
    const stepType = stepTypeFromOpCode(input.op, input.opts, this.internalLogger);
    const stepInput = stepInputFromOpts(stepType, input.opts);
    const stepInfo = this.buildStepInfo({
      hashedId: input.hashedId,
      userlandId: input.userlandId,
      displayName: input.displayName,
      memoized: input.memoized,
      stepType,
      input: stepInput
    });
    if (this.hasTransformStepInput) {
      const originalInput = stepInfo.input;
      const transformed = await this.transformStepInput(stepInfo);
      stepInfo.options = transformed.stepOptions;
      if (originalInput === void 0 && transformed.input.length === 0) stepInfo.input = void 0;
      else stepInfo.input = transformed.input;
    }
    let opName;
    if (stepType === "sleep" && stepInfo.input !== void 0) {
      if (!isSleepInput(stepInfo.input[0])) throw new Error("Sleep time must be a string, number, Date, or Temporal.Duration");
      opName = timeStr(stepInfo.input[0]);
    }
    const opOpts = optsFromStepInput(stepType, stepInfo.input);
    let actualHandler;
    const entryPoint = async () => {
      if (!actualHandler) throw new Error("Handler not initialized");
      return actualHandler();
    };
    const setActualHandler = (handler2) => {
      actualHandler = handler2;
    };
    return {
      entryPoint,
      opName,
      opOpts,
      setActualHandler,
      stepInfo
    };
  }
  buildStepInfo(opts) {
    return {
      hashedId: opts.hashedId,
      input: opts.input,
      memoized: opts.memoized,
      options: {
        id: opts.userlandId,
        ...opts.displayName !== void 0 && { name: opts.displayName }
      },
      stepType: opts.stepType
    };
  }
  buildSteps() {
    const result = {};
    const stepState = this.getStepState();
    for (const [id, op] of Object.entries(stepState)) if (op.error !== void 0) result[id] = {
      type: "error",
      error: op.error
    };
    else if (op.input !== void 0) result[id] = {
      type: "input",
      input: op.input
    };
    else result[id] = {
      type: "data",
      data: op.data
    };
    return result;
  }
  /**
  * Apply transformFunctionInput middleware in forward order.
  * Each middleware builds on the previous result.
  */
  async transformFunctionInput() {
    let result = {
      ctx: this.fnArg,
      fn: this.fn,
      steps: this.buildSteps()
    };
    for (const mw of this.middleware) if (mw?.transformFunctionInput) result = await mw.transformFunctionInput(result);
    return result;
  }
  /**
  * Wrap a run handler with wrapFunctionHandler middlewares (reverse order for
  * onion layering, same pattern as wrapStepHandler).
  */
  wrapRunHandler(handler2) {
    let chain = handler2;
    for (let i2 = this.middleware.length - 1; i2 >= 0; i2--) {
      const mw = this.middleware[i2];
      if (mw?.wrapFunctionHandler) {
        const next = chain;
        chain = () => mw.wrapFunctionHandler({
          ctx: this.fnArg,
          fn: this.fn,
          next
        });
      }
    }
    return chain;
  }
  /**
  * Apply transformStepInput middleware in forward order.
  * Each middleware builds on the previous result.
  */
  async transformStepInput(stepInfo) {
    let result = {
      fn: this.fn,
      stepInfo: {
        hashedId: stepInfo.hashedId,
        memoized: stepInfo.memoized,
        stepType: stepInfo.stepType
      },
      stepOptions: { ...stepInfo.options },
      input: [...stepInfo.input ?? []]
    };
    for (const mw of this.middleware) if (mw?.transformStepInput) result = await mw.transformStepInput(result);
    return result;
  }
  /**
  * Wrap a step handler with wrapStep middlewares (reverse order for
  * onion layering). Returns the wrapped handler.
  */
  buildWrapStepChain(handler2, stepInfo) {
    let chain = handler2;
    for (let i2 = this.middleware.length - 1; i2 >= 0; i2--) {
      const mw = this.middleware[i2];
      if (mw?.wrapStep) {
        const next = chain;
        chain = () => {
          if (!mw.wrapStep) throw new UnreachableError("wrapStep is undefined");
          if (this.activeWrapStep.has(mw)) return next();
          this.activeWrapStep.add(mw);
          const guardedNext = () => {
            this.activeWrapStep.delete(mw);
            return next().finally(() => {
              this.activeWrapStep.add(mw);
            });
          };
          return mw.wrapStep({
            ctx: this.fnArg,
            fn: this.fn,
            next: guardedNext,
            stepInfo
          }).finally(() => {
            this.activeWrapStep.delete(mw);
          });
        };
      }
    }
    return chain;
  }
  async onStepStart(stepInfo) {
    for (const mw of this.middleware) if (mw?.onStepStart) try {
      await mw.onStepStart({
        ctx: this.fnArg,
        fn: this.fn,
        stepInfo
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onStepStart",
        mw: mw.id
      }, "middleware error");
    }
  }
  async onStepComplete(stepInfo, output) {
    for (const mw of this.middleware) if (mw?.onStepComplete) try {
      await mw.onStepComplete({
        ctx: this.fnArg,
        fn: this.fn,
        output,
        stepInfo
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onStepComplete",
        mw: mw.id
      }, "middleware error");
    }
  }
  /**
  * Build a wrapStepHandler chain around the actual step handler.
  * Called once per `step.run` attempt (not for memoized steps).
  * Simpler than buildWrapStepChain — no recursion guard needed.
  */
  buildWrapStepHandlerChain(handler2, stepInfo) {
    let chain = handler2;
    for (let i2 = this.middleware.length - 1; i2 >= 0; i2--) {
      const mw = this.middleware[i2];
      if (mw?.wrapStepHandler) {
        const next = chain;
        chain = () => mw.wrapStepHandler({
          ctx: this.fnArg,
          fn: this.fn,
          next,
          stepInfo
        });
      }
    }
    return chain;
  }
  async onStepError(stepInfo, error, isFinalAttempt) {
    for (const mw of this.middleware) if (mw?.onStepError) try {
      await mw.onStepError({
        ctx: this.fnArg,
        error,
        fn: this.fn,
        isFinalAttempt,
        stepInfo
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onStepError",
        mw: mw.id
      }, "middleware error");
    }
  }
  /**
  * Idempotent: safe to call from every code path that might end memoization.
  */
  async onMemoizationEnd() {
    if (this.memoizationEnded) return;
    this.memoizationEnded = true;
    for (const mw of this.middleware) if (mw?.onMemoizationEnd) try {
      await mw.onMemoizationEnd({
        ctx: this.fnArg,
        fn: this.fn
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onMemoizationEnd",
        mw: mw.id
      }, "middleware error");
    }
  }
  async onRunStart() {
    for (const mw of this.middleware) if (mw?.onRunStart) try {
      await mw.onRunStart({
        ctx: this.fnArg,
        fn: this.fn
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onRunStart",
        mw: mw.id
      }, "middleware error");
    }
  }
  async onRunComplete(output) {
    for (const mw of this.middleware) if (mw?.onRunComplete) try {
      await mw.onRunComplete({
        ctx: this.fnArg,
        fn: this.fn,
        output
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onRunComplete",
        mw: mw.id
      }, "middleware error");
    }
  }
  async onRunError(error, isFinalAttempt) {
    for (const mw of this.middleware) if (mw?.onRunError) try {
      await mw.onRunError({
        ctx: this.fnArg,
        error,
        fn: this.fn,
        isFinalAttempt
      });
    } catch (err2) {
      this.internalLogger.error({
        err: err2,
        hook: "onRunError",
        mw: mw.id
      }, "middleware error");
    }
  }
};

// node_modules/inngest/components/InngestGroupTools.js
var parallel = async (optionsOrCallback, maybeCallback) => {
  const options = typeof optionsOrCallback === "function" ? {} : optionsOrCallback;
  const callback = typeof optionsOrCallback === "function" ? optionsOrCallback : maybeCallback;
  if (!callback) throw new Error("`group.parallel()` requires a callback function");
  const currentCtx = getAsyncCtxSync();
  if (!currentCtx?.execution) throw new Error("`group.parallel()` must be called within an Inngest function execution");
  const als = await getAsyncLocalStorage();
  if (isALSFallback()) throw new Error('`group.parallel()` requires AsyncLocalStorage support, which is not available in this runtime. Workaround: Pass `parallelMode` directly to each step:\n  step.run({ id: "my-step", parallelMode: "race" }, fn)');
  const nestedCtx = {
    ...currentCtx,
    execution: {
      ...currentCtx.execution,
      parallelMode: options.mode ?? "race"
    }
  };
  return als.run(nestedCtx, callback);
};
var createGroupTools = (deps) => {
  const experiment2 = (async (idOrOptions, options) => {
    if (!deps?.experimentStepRun) throw new Error("`group.experiment()` requires step tools to be available. Ensure you are calling this within an Inngest function execution.");
    const { variants, select, withVariant } = options;
    const variantNames = Object.keys(variants);
    if (variantNames.length === 0) throw new Error("`group.experiment()` requires at least one variant to be defined.");
    if (isALSFallback()) throw new Error("`group.experiment()` requires AsyncLocalStorage support, which is not available in this runtime.");
    const stepOpts = getStepOptions(idOrOptions);
    let experimentStepHashedId;
    const selectedVariant = await deps.experimentStepRun(idOrOptions, async () => {
      experimentStepHashedId = getAsyncCtxSync()?.execution?.executingStep?.id;
      const alsInstance = await getAsyncLocalStorage();
      const currentCtx$1 = getAsyncCtxSync();
      const selectCtx = {
        ...currentCtx$1,
        execution: {
          ...currentCtx$1.execution,
          insideExperimentSelect: true
        }
      };
      const result$1 = await alsInstance.run(selectCtx, () => select(variantNames));
      if (!variantNames.includes(result$1)) throw new NonRetriableError(`group.experiment("${stepOpts.id}"): select() returned "${result$1}" which is not a known variant. Available variants: ${variantNames.join(", ")}`);
      const execInstance = getAsyncCtxSync()?.execution?.instance;
      if (execInstance && experimentStepHashedId) {
        execInstance.addMetadata(experimentStepHashedId, "inngest.experiment", "step", "merge", {
          name: stepOpts.id,
          variant: result$1,
          selection_strategy: select.__experimentConfig.strategy,
          available_variants: variantNames,
          ...select.__experimentConfig.weights && { variant_weights: select.__experimentConfig.weights }
        });
        if (select.__experimentConfig.nullishBucket) execInstance.addMetadata(experimentStepHashedId, "inngest.warnings", "step", "merge", { "sdk.group.experiment.nullishBucket": 'experiment.bucket() received a null/undefined value; hashing empty string "" for variant selection' });
      }
      return result$1;
    });
    const variantFn = variants[selectedVariant];
    if (!variantFn) throw new Error(`group.experiment("${stepOpts.id}"): variant "${selectedVariant}" was selected but is not defined. Available variants: ${variantNames.join(", ")}`);
    const currentCtx = getAsyncCtxSync();
    const stepTracker = { found: false };
    let result;
    if (currentCtx?.execution && !isALSFallback()) {
      const als = await getAsyncLocalStorage();
      const nestedCtx = {
        ...currentCtx,
        execution: {
          ...currentCtx.execution,
          experimentContext: {
            experimentStepID: experimentStepHashedId ?? "",
            experimentName: stepOpts.id,
            variant: selectedVariant,
            selectionStrategy: select.__experimentConfig.strategy
          },
          experimentStepTracker: stepTracker
        }
      };
      result = await als.run(nestedCtx, () => variantFn());
    } else result = await variantFn();
    if (!stepTracker.found && !isALSFallback()) throw new NonRetriableError(`group.experiment("${stepOpts.id}"): variant "${selectedVariant}" did not invoke any step tools. Wrap your variant logic in step.run() to ensure it is memoized and not re-executed on replay.`);
    if (withVariant) return {
      result,
      variant: selectedVariant
    };
    return result;
  });
  return {
    parallel,
    experiment: experiment2
  };
};

// node_modules/inngest/components/RetryAfterError.js
var import_ms2 = __toESM(require_ms(), 1);
var RetryAfterError = class extends Error {
  /**
  * The underlying cause of the error, if any.
  *
  * This will be serialized and sent to Inngest.
  */
  cause;
  /**
  * The time after which the function should be retried. Represents either a
  * number of milliseconds or a RFC3339 date.
  */
  retryAfter;
  constructor(message, retryAfter, options) {
    super(message);
    this.name = "RetryAfterError";
    if (retryAfter instanceof Date) this.retryAfter = retryAfter.toISOString();
    else {
      const seconds = `${Math.ceil((typeof retryAfter === "string" ? (0, import_ms2.default)(retryAfter) : retryAfter) / 1e3)}`;
      if (!isFinite(Number(seconds))) throw new Error("retryAfter must be a number of milliseconds, a ms-compatible string, or a Date");
      this.retryAfter = seconds;
    }
    this.cause = options?.cause;
  }
};

// node_modules/inngest/components/StepError.js
var StepError = class extends Error {
  cause;
  constructor(stepId, err2) {
    const parsedErr = jsonErrorSchema.parse(err2);
    super(parsedErr.message);
    this.stepId = stepId;
    this.name = parsedErr.name;
    this.stepId = stepId;
    this.stack = parsedErr.stack ?? void 0;
    this.cause = parsedErr.cause ? deserializeError$1(parsedErr.cause, true) : void 0;
  }
};

// node_modules/inngest/components/execution/streaming.js
var sseMetadataSchema = external_exports.object({
  type: external_exports.literal("inngest.metadata"),
  runId: external_exports.string()
});
var sseStreamSchema = external_exports.object({
  type: external_exports.literal("inngest.stream"),
  data: external_exports.unknown(),
  hashedStepId: external_exports.string().optional()
});
var sseCommitSchema = external_exports.object({
  type: external_exports.literal("inngest.commit"),
  hashedStepId: external_exports.string().nullable()
});
var sseRollbackSchema = external_exports.object({
  type: external_exports.literal("inngest.rollback"),
  hashedStepId: external_exports.string().nullable()
});
var sseResultSchema = external_exports.object({
  type: external_exports.literal("inngest.response"),
  status: external_exports.union([external_exports.literal("succeeded"), external_exports.literal("failed")]),
  response: external_exports.object({
    body: external_exports.string(),
    headers: external_exports.record(external_exports.string()),
    statusCode: external_exports.number()
  })
});
var sseRedirectSchema = external_exports.object({
  type: external_exports.literal("inngest.redirect_info"),
  runId: external_exports.string(),
  url: external_exports.string()
});
function buildSseEvent(event, data) {
  return `event: ${event}
data: ${JSON.stringify(data ?? null)}

`;
}
function buildSseMetadataEvent(runId) {
  return buildSseEvent("inngest.metadata", { runId });
}
function buildSseStreamEvent(data, hashedStepId) {
  const payload = { data };
  if (hashedStepId) payload.hashedStepId = hashedStepId;
  return buildSseEvent("inngest.stream", payload);
}
function buildSseSucceededEvent(response) {
  return buildSseEvent("inngest.response", {
    status: "succeeded",
    response
  });
}
function buildSseFailedEvent(error) {
  return buildSseEvent("inngest.response", {
    status: "failed",
    response: {
      body: JSON.stringify(error),
      statusCode: 500,
      headers: { "content-type": "application/json" }
    }
  });
}
function buildSseRedirectEvent(data) {
  return buildSseEvent("inngest.redirect_info", data);
}
function prependToStream(prefix, stream) {
  return new ReadableStream({ async start(controller) {
    controller.enqueue(prefix);
    const reader = stream.getReader();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        controller.enqueue(value);
      }
      controller.close();
    } catch (err2) {
      controller.error(err2);
    } finally {
      reader.releaseLock();
    }
  } });
}
function buildSseCommitEvent(hashedStepId) {
  return buildSseEvent("inngest.commit", { hashedStepId });
}
function buildSseRollbackEvent(hashedStepId) {
  return buildSseEvent("inngest.rollback", { hashedStepId });
}

// node_modules/inngest/components/StreamTools.js
var Stream = class {
  transform;
  writer;
  encoder = new TextEncoder();
  _activated = false;
  _errored = false;
  writeChain = Promise.resolve();
  /**
  * Optional callback invoked the first time `push` or `pipe` is called.
  * Used by the execution engine to fire a checkpoint that returns the SSE
  * Response to the client immediately.
  */
  onActivated;
  /**
  * Optional callback invoked when a write to the underlying stream fails
  * (e.g. the client disconnected or the transform stream errored). Used by
  * the execution engine to emit diagnostic logs.
  */
  onWriteError;
  constructor(opts) {
    this.onActivated = opts?.onActivated;
    this.onWriteError = opts?.onWriteError;
    let readableStrategy;
    try {
      readableStrategy = new CountQueuingStrategy({ highWaterMark: 1024 });
    } catch {
    }
    this.transform = new TransformStream(void 0, void 0, readableStrategy);
    this.writer = this.transform.writable.getWriter();
  }
  /**
  * Whether `push` or `pipe` has been called at least once.
  */
  get activated() {
    return this._activated;
  }
  /**
  * The readable side of the underlying transform stream. Consumers (i.e. the
  * HTTP response) read SSE events from here.
  */
  get readable() {
    return this.transform.readable;
  }
  /**
  * Resolve the current hashed step ID for stream events. Returns the
  * executing step's hashed ID (read from ALS), or undefined if outside a step.
  */
  currentHashedStepId() {
    return getAsyncCtxSync()?.execution?.executingStep?.hashedId;
  }
  activate() {
    if (!this._activated) {
      this._activated = true;
      this.onActivated?.();
    }
  }
  /**
  * Encode and write an SSE event string to the underlying writer.
  */
  writeEncoded(sseEvent) {
    return this.writer.write(this.encoder.encode(sseEvent));
  }
  /**
  * Enqueue a pre-built SSE event string onto the write chain.
  */
  enqueue(sseEvent) {
    if (this._errored) return;
    this.writeChain = this.writeChain.then(() => this.writeEncoded(sseEvent)).catch((err2) => {
      this._errored = true;
      this.onWriteError?.(err2);
    });
  }
  /**
  * Emit an `inngest.commit` SSE event indicating that uncommitted streamed data
  * should be committed (i.e. will not be rolled back). Internal use only.
  */
  commit(hashedStepId) {
    this.enqueue(buildSseCommitEvent(hashedStepId));
  }
  /**
  * Emit an `inngest.rollback` SSE event indicating the uncommitted streamed
  * data should be discarded (e.g. step errored). Internal use only.
  */
  rollback(hashedStepId) {
    this.enqueue(buildSseRollbackEvent(hashedStepId));
  }
  /**
  * Serialize `data` into an SSE stream event and enqueue it. Returns `false`
  * if serialization fails (e.g. circular reference) so callers can skip.
  */
  enqueueStreamEvent(data, hashedStepId) {
    let sseEvent;
    try {
      sseEvent = buildSseStreamEvent(data, hashedStepId);
    } catch {
      return false;
    }
    this.enqueue(sseEvent);
    return true;
  }
  /**
  * Write a single SSE stream event containing `data`. The current step's
  * hashed ID is automatically included as stepId for rollback tracking.
  */
  push(data) {
    this.activate();
    this.enqueueStreamEvent(data, this.currentHashedStepId());
  }
  /**
  * Pipe a source to the client, writing each chunk as an SSE stream event.
  * Returns the concatenated content of all chunks.
  */
  async pipe(source) {
    this.activate();
    let iterable;
    if (source instanceof ReadableStream) iterable = this.readableToAsyncIterable(source);
    else if (typeof source === "function") iterable = source();
    else iterable = source;
    return this.pipeIterable(iterable);
  }
  /**
  * Adapt a ReadableStream into an AsyncIterable<string>. TypeScript's
  * ReadableStream type doesn't declare Symbol.asyncIterator, so we use the
  * reader API for type safety.
  */
  async *readableToAsyncIterable(readable) {
    const reader = readable.getReader();
    const decoder = new TextDecoder();
    try {
      while (true) {
        const { done, value } = await reader.read();
        if (done) break;
        yield typeof value === "string" ? value : decoder.decode(value, { stream: true });
      }
      const final = decoder.decode();
      if (final) yield final;
    } finally {
      reader.releaseLock();
    }
  }
  /**
  * Core pipe loop: iterate an async iterable, writing each chunk as an SSE
  * stream event and collecting the concatenated result.
  */
  async pipeIterable(source) {
    const hashedStepId = this.currentHashedStepId();
    const chunks = [];
    for await (const chunk of source) {
      if (this._errored) break;
      chunks.push(chunk);
      if (!this.enqueueStreamEvent(chunk, hashedStepId)) continue;
      await this.writeChain;
    }
    return chunks.join("");
  }
  /**
  * Write a redirect info event. Tells the client where to reconnect if the
  * durable endpoint goes async. Does NOT close the writer — more stream
  * events may follow before the durable endpoint actually switches to async
  * mode. Internal use only.
  */
  sendRedirectInfo(data) {
    this.enqueue(buildSseRedirectEvent(data));
  }
  /**
  * Write a succeeded result event and close the writer. Internal use only.
  */
  closeSucceeded(response) {
    let sseEvent;
    try {
      sseEvent = buildSseSucceededEvent(response);
    } catch {
      sseEvent = buildSseFailedEvent("Failed to serialize result");
    }
    this.closeWriter(sseEvent);
  }
  /**
  * Write a failed result event and close the writer. Internal use only.
  */
  closeFailed(error) {
    this.closeWriter(buildSseFailedEvent(error));
  }
  /**
  * Optionally write a final SSE event, then close the writer.
  */
  closeWriter(finalEvent) {
    this.writeChain = this.writeChain.then(async () => {
      if (finalEvent) await this.writeEncoded(finalEvent);
      await this.writer.close();
    }).catch((err2) => {
      this.onWriteError?.(err2);
    });
  }
  /**
  * Close the writer without writing a result event. Used when the durable endpoint goes
  * async and the real result will arrive on the redirected stream.
  */
  end() {
    this.closeWriter();
  }
};

// node_modules/inngest/components/triggers/utils.js
var EventValidationError = class EventValidationError2 extends NonRetriableError {
  constructor(message) {
    super(message);
    this.name = this.constructor.name;
  }
  static fromIssues(issues) {
    if (issues.length === 0) return new EventValidationError2("Validation failed");
    return new EventValidationError2(issues.map((issue) => {
      let path = "value";
      if (issue.path && issue.path.length > 0) path = issue.path.join(".");
      return `${path}: ${issue.message}`;
    }).join(", "));
  }
};
async function validateAgainstSchema(schema, data) {
  const result = await schema["~standard"].validate(data);
  if (result.issues) throw EventValidationError.fromIssues(result.issues);
}
function findWildcardValidators(eventName, validators) {
  const matchingValidators = [];
  for (const [triggerName, validator] of Object.entries(validators)) {
    if (!triggerName.endsWith("*")) continue;
    const wildcardPrefix = triggerName.slice(0, -1);
    if (eventName.startsWith(wildcardPrefix)) matchingValidators.push(validator);
  }
  return matchingValidators;
}
function createUnionValidator(validators) {
  const nonNullValidators = validators.filter(isNotNull);
  if (nonNullValidators.length === 0) return null;
  return async (data) => {
    await throwIfAllRejected(nonNullValidators.map((validator) => {
      return validator(data);
    }));
  };
}
async function validateEvents(events, triggers) {
  const validatorsByTrigger = createValidatorsByTrigger(createSchemasByTrigger(triggers));
  const validationPromises = [];
  for (const event of events) {
    const validator = getValidatorForEvent(event.name, validatorsByTrigger);
    if (validator === null) continue;
    validationPromises.push(validator(event.data));
  }
  await Promise.all(validationPromises);
}
function getValidatorForEvent(eventName, validatorsByEvent) {
  const directValidator = validatorsByEvent[eventName];
  if (directValidator !== void 0) return directValidator;
  const wildcardValidators = findWildcardValidators(eventName, validatorsByEvent);
  if (wildcardValidators.length > 0) return createUnionValidator(wildcardValidators);
  throw new EventValidationError(`Event not found in triggers: ${eventName}`);
}
function parseTrigger(trigger) {
  if (trigger instanceof EventType) return {
    eventName: trigger.name,
    schema: trigger.schema
  };
  if (trigger.event instanceof EventType) return {
    eventName: trigger.event.name,
    schema: trigger.event.schema
  };
  if (typeof trigger.event === "string") return {
    eventName: trigger.event,
    schema: null
  };
  if (trigger.cron) return {
    eventName: internalEvents.ScheduledTimer,
    schema: null
  };
  throw new EventValidationError("Invalid trigger");
}
function createSchemasByTrigger(triggers) {
  const schemasByEvent = {};
  for (const trigger of triggers) {
    const { eventName, schema } = parseTrigger(trigger);
    if (schema) schemasByEvent[eventName] = [...schemasByEvent[eventName] ?? [], schema];
    else schemasByEvent[eventName] = schemasByEvent[eventName] ?? [];
  }
  return schemasByEvent;
}
function createSchemaUnionValidator(schemas) {
  if (schemas.length === 0) return null;
  return async (data) => {
    await throwIfAllRejected(schemas.map((schema) => validateAgainstSchema(schema, data)));
  };
}
function createValidatorsByTrigger(schemasByTrigger) {
  const validatorsByTrigger = {};
  for (const [triggerName, schemas] of Object.entries(schemasByTrigger)) validatorsByTrigger[triggerName] = createSchemaUnionValidator(schemas);
  if (!(validatorsByTrigger[internalEvents.FunctionInvoked] !== void 0)) {
    const allSchemas = Object.values(schemasByTrigger).flat();
    validatorsByTrigger[internalEvents.FunctionInvoked] = createSchemaUnionValidator(allSchemas);
  }
  return validatorsByTrigger;
}
async function throwIfAllRejected(promises) {
  const settled = await Promise.allSettled(promises);
  let error;
  for (const result of settled) {
    if (result.status === "rejected") error = result.reason;
    if (result.status === "fulfilled") return;
  }
  if (error) throw error;
}
function isNotNull(value) {
  return value !== null;
}

// node_modules/inngest/components/execution/lazyOps.js
var LazyOps = class {
  buffer = [];
  pushedIds = /* @__PURE__ */ new Set();
  /**
  * Number of ops waiting to ship.
  */
  get length() {
    return this.buffer.length;
  }
  /**
  * Whether an op with this hashed id has been pushed in this execution
  * (whether or not it has since been drained).
  */
  hasId(id) {
    return this.pushedIds.has(id);
  }
  /**
  * Take ownership of buffered ops and clear the buffer. Callers ship them on
  * whichever wire message comes next.
  */
  drain() {
    if (this.buffer.length === 0) return [];
    const ops = this.buffer;
    this.buffer = [];
    return ops;
  }
  /**
  * Buffer an op for later shipment.
  */
  push(op) {
    this.buffer.push(op);
    this.pushedIds.add(op.id);
  }
  /**
  * Record that an id has been observed in this execution without buffering
  * an op for it. Used to consume a `priorDefers` replay match so that
  * subsequent encounters of the same id surface as duplicates.
  */
  markSeen(id) {
    this.pushedIds.add(id);
  }
};
function isLazyOp(opts, opId) {
  return !opts?.fn && opId.mode === StepMode.Sync;
}

// node_modules/inngest/components/execution/otel/access.js
var clientProcessorMap = /* @__PURE__ */ new WeakMap();

// node_modules/inngest/components/execution/engine.js
var import_hash3 = __toESM(require_hash(), 1);
var import_ms3 = __toESM(require_ms(), 1);
var { sha1 } = import_hash3.default;
var CHECKPOINT_RETRY_OPTIONS = {
  maxAttempts: 5,
  baseDelay: 100
};
function errorMessage(error) {
  if (error instanceof Error) return error.message;
  if (isRecord(error) && typeof error.message === "string") return error.message;
  return String(error);
}
var RUN_COMPLETE_STEP_ID = "complete";
var STEP_NOT_FOUND_MAX_FOUND_STEPS = 25;
var createExecutionEngine = (options) => {
  return new InngestExecutionEngine(options);
};
function extractSseResponse(response, body) {
  const headers = {};
  response.headers.forEach((value, key) => {
    headers[key] = value;
  });
  return {
    body,
    statusCode: response.status,
    headers
  };
}
function defaultSseResponse(data) {
  return {
    body: JSON.stringify(data),
    statusCode: 200,
    headers: { "content-type": "application/json" }
  };
}
function jsonResponse(data, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: { "Content-Type": "application/json" }
  });
}
var InngestExecutionEngine = class extends InngestExecution {
  version = ExecutionVersion.V2;
  state;
  fnArg;
  checkpointHandlers;
  timeoutDuration = 1e3 * 10;
  execution;
  userFnToRun;
  middlewareManager;
  /**
  * Close the stream via {@link streamCloseSucceeded}, {@link streamCloseFailed},
  * or {@link streamEnd} — never call `streamTools.close*`/`end` directly, as
  * the wrappers ensure the redirect event is flushed first.
  */
  streamTools;
  /**
  * Resolved when `stream.push()`/`pipe()` is first called in sync mode,
  * allowing `_start()` to return the SSE Response to the HTTP layer while
  * the core loop continues executing steps in the background.
  */
  earlyStreamResponse;
  /**
  * Whether the `inngest.redirect_info` SSE event has already been sent.
  * Prevents duplicate redirect events.
  */
  redirectSent = false;
  /**
  * Promise that resolves once the redirect event has been written (or the
  * attempt completes). Stored so that `checkpointAndSwitchToAsync` can
  * await it before closing the writer.
  */
  redirectPromise = Promise.resolve();
  /**
  * If we're supposed to run a particular step via `requestedRunStep`, this
  * will be a `Promise` that resolves after no steps have been found for
  * `timeoutDuration` milliseconds.
  *
  * If we're not supposed to run a particular step, this will be `undefined`.
  */
  timeout;
  rootSpanId;
  /**
  * If we're checkpointing and have been given a maximum runtime, this will be
  * a `Promise` that resolves after that duration has elapsed, allowing us to
  * ensure that we end the execution in good time, especially in serverless
  * environments.
  */
  checkpointingMaxRuntimeTimer;
  /**
  * If we're checkpointing and have been given a maximum buffer interval, this
  * will be a `Promise` that resolves after that duration has elapsed, allowing
  * us to periodically checkpoint even if the step buffer hasn't filled.
  */
  checkpointingMaxBufferIntervalTimer;
  constructor(rawOptions) {
    const options = {
      ...rawOptions,
      stepMode: rawOptions.stepMode ?? StepMode.Async
    };
    super(options);
    if (this.options.stepMode === StepMode.Sync) {
      if (!this.options.createResponse) throw new Error("createResponse is required for sync step mode");
    }
    this.userFnToRun = this.getUserFnToRun();
    this.streamTools = new Stream({
      onActivated: () => this.handleStreamActivated(),
      onWriteError: (err2) => this.devDebug("stream write error (client may have disconnected):", err2)
    });
    this.state = this.createExecutionState();
    this.fnArg = this.createFnArg();
    const mwInstances = this.options.middlewareInstances ?? (this.options.client.middleware || []).map((Cls) => {
      return new Cls({ client: this.options.client });
    });
    this.middlewareManager = new MiddlewareManager(this.fnArg, () => this.state.stepState, mwInstances, this.options.fn, this.options.client[internalLoggerSymbol]);
    this.checkpointHandlers = this.createCheckpointHandlers();
    this.initializeTimer(this.state);
    this.initializeCheckpointRuntimeTimer(this.state);
    this.devDebug("created new V1 execution for run;", this.options.requestedRunStep ? `wanting to run step "${this.options.requestedRunStep}"` : "discovering steps");
    this.devDebug("existing state keys:", Object.keys(this.state.stepState));
  }
  /**
  * Idempotently start the execution of the user's function.
  */
  start() {
    if (!this.execution) {
      this.devDebug("starting V1 execution");
      const tracer = trace.getTracer("inngest", version);
      this.execution = getAsyncLocalStorage().then((als) => {
        return als.run({
          app: this.options.client,
          execution: {
            ctx: this.fnArg,
            instance: this,
            stream: this.streamTools
          }
        }, async () => {
          return tracer.startActiveSpan("inngest.execution", (span) => {
            this.rootSpanId = span.spanContext().spanId;
            clientProcessorMap.get(this.options.client)?.declareStartingSpan({
              span,
              runId: this.options.runId,
              traceparent: this.options.headers[headerKeys.TraceParent],
              tracestate: this.options.headers[headerKeys.TraceState]
            });
            metadataSpanProcessor.declareStartingSpan({
              span,
              traceparent: this.options.headers[headerKeys.TraceParent],
              onAIMetadata: (aiMetadata) => {
                if (!this.state.executingStep) return;
                this.state.executingStepAIMetadata = this.state.executingStepAIMetadata ? aggregate(this.state.executingStepAIMetadata, aiMetadata) : aiMetadata;
              }
            });
            return this._start().then((result) => {
              this.devDebug("result:", result);
              return result;
            }).finally(() => {
              span.end();
            });
          });
        });
      });
    }
    return this.execution;
  }
  addMetadata(stepId, kind, scope, op, values) {
    if (!this.state.metadata) this.state.metadata = /* @__PURE__ */ new Map();
    const updates = this.state.metadata.get(stepId) ?? [];
    updates.push({
      kind,
      scope,
      op,
      values
    });
    this.state.metadata.set(stepId, updates);
    return true;
  }
  /**
  * Starts execution of the user's function and the core loop.
  */
  async _start() {
    if (this.options.stepMode === StepMode.Sync && this.options.acceptsSse) this.earlyStreamResponse = createDeferredPromise();
    const coreLoop = this.runCoreLoop();
    if (this.earlyStreamResponse) {
      coreLoop.catch((err2) => {
        this.options.client[internalLoggerSymbol].error({ err: err2 }, "Core loop rejected after early stream response was sent");
      });
      return Promise.race([this.earlyStreamResponse.promise, coreLoop]);
    }
    return coreLoop;
  }
  /**
  * The core checkpoint loop: processes checkpoints until a handler returns
  * a result.
  */
  async runCoreLoop() {
    try {
      const allCheckpointHandler = this.getCheckpointHandler("");
      await this.startExecution();
      let i2 = 0;
      for await (const checkpoint of this.state.loop) {
        await allCheckpointHandler(checkpoint, i2);
        const result = await this.getCheckpointHandler(checkpoint.type)(checkpoint, i2++);
        if (result) return result;
      }
    } catch (error) {
      if (this.earlyStreamResponse) {
        await this.streamCloseFailed("Internal execution error");
        const result = this.transformOutput({ error });
        this.earlyStreamResponse.resolve(result);
        return result;
      }
      return this.transformOutput({ error });
    } finally {
      this.state.loop.return();
    }
    throw new Error("Core loop finished without returning a value");
  }
  async checkpoint(steps) {
    const lazyOps = this.state.lazyOps.drain();
    if (lazyOps.length > 0) steps = [...steps, ...lazyOps];
    if (this.options.stepMode === StepMode.Sync) if (!this.state.checkpointedRun) {
      const res = await retryWithBackoff(() => this.options.client["inngestApi"].checkpointNewRun({
        runId: this.fnArg.runId,
        event: this.fnArg.event,
        steps,
        executionVersion: this.version,
        retries: this.fnArg.maxAttempts ?? defaultMaxRetries
      }), CHECKPOINT_RETRY_OPTIONS);
      this.state.checkpointedRun = {
        appId: res.data.app_id,
        fnId: res.data.fn_id,
        token: res.data.token,
        realtimeToken: res.data.realtime_token
      };
      this.sendRedirectIfReady();
    } else await retryWithBackoff(() => this.options.client["inngestApi"].checkpointSteps({
      appId: this.state.checkpointedRun.appId,
      fnId: this.state.checkpointedRun.fnId,
      runId: this.fnArg.runId,
      steps
    }), CHECKPOINT_RETRY_OPTIONS);
    else if (this.options.stepMode === StepMode.AsyncCheckpointing) {
      const { internalFnId, queueItemId } = this.options;
      if (!queueItemId) throw new Error("Missing queueItemId for async checkpointing. This is a bug in the Inngest SDK.");
      if (!internalFnId) throw new Error("Missing internalFnId for async checkpointing. This is a bug in the Inngest SDK.");
      await retryWithBackoff(() => this.options.client["inngestApi"].checkpointStepsAsync({
        runId: this.fnArg.runId,
        fnId: internalFnId,
        queueItemId,
        requestId: this.options.requestId,
        generationId: this.options.generationId,
        requestStartedAt: this.options.requestStartedAt,
        steps
      }), {
        ...CHECKPOINT_RETRY_OPTIONS,
        shouldRetry: (err2) => !isStaleDispatchError(err2)
      });
    } else throw new Error("Checkpointing is only supported in Sync and AsyncCheckpointing step modes. This is a bug in the Inngest SDK.");
  }
  async checkpointAndSwitchToAsync(steps, stepError) {
    await this.checkpoint(steps);
    if (!this.state.checkpointedRun?.token) throw new Error("Failed to checkpoint and switch to async mode");
    const token = this.state.checkpointedRun.token;
    if (this.streamTools.activated) if (stepError && !this.retriability(stepError)) await this.streamCloseFailed(errorMessage(stepError));
    else await this.streamEnd();
    else if (this.options.acceptsSse) {
      await this.streamEnd();
      return {
        type: "function-resolved",
        ctx: this.fnArg,
        ops: this.ops,
        data: this.buildSyncSseResponse()
      };
    }
    return {
      type: "change-mode",
      ctx: this.fnArg,
      ops: this.ops,
      to: StepMode.Async,
      token
    };
  }
  /**
  * Prepend the `inngest.metadata` SSE event to the stream's readable side.
  * The returned stream can be used as a fetch body or Response body.
  *
  * NOTE: `this.streamTools.readable` can only be consumed once, so only one
  * of `buildSyncSseResponse` or `postCheckpointStream` may be called per
  * execution.
  */
  buildMetadataPrefixedStream() {
    const metadataEvent = buildSseMetadataEvent(this.fnArg.runId);
    return prependToStream(new TextEncoder().encode(metadataEvent), this.streamTools.readable);
  }
  /**
  * Build the initial SSE `Response` that marks the start of streaming to the
  * client. Only used in sync mode. In async mode, the stream is POSTed to the
  * Inngest Server via {@link postCheckpointStream} instead.
  *
  * The response body is the stream's readable side, prefixed with the
  * `inngest.metadata` SSE event.
  */
  buildSyncSseResponse() {
    return new Response(this.buildMetadataPrefixedStream(), {
      status: 200,
      headers: {
        "Content-Type": "text/event-stream",
        "Cache-Control": "no-cache"
      }
    });
  }
  /**
  * Wraps a plain return value as an SSE Response.
  *
  * Used when the client sent `Accept: text/event-stream` but
  * `stream.push()`/`pipe()` was NOT called during execution. The
  * checkpointable data is the function's return value. The SSE events are just
  * a delivery mechanism.
  */
  async wrapResultAsSse(checkpoint, sseResponse) {
    const resultData = checkpoint.data;
    await this.streamCloseSucceeded(sseResponse);
    const clientResponse = this.buildSyncSseResponse();
    const streamingResult = {
      ...this.transformOutput({ data: resultData }),
      data: clientResponse
    };
    this.checkpointReturnValue(resultData);
    return streamingResult;
  }
  /**
  * Called when `stream.push()`/`pipe()` is first invoked during sync
  * execution. Resolves {@link earlyStreamResponse} so that `_start()` can
  * return the SSE Response to the HTTP layer immediately, while the core
  * checkpoint loop keeps running steps in the background.
  */
  handleStreamActivated() {
    if (this.earlyStreamResponse) {
      this.earlyStreamResponse.resolve({
        type: "function-resolved",
        ctx: this.fnArg,
        ops: this.ops,
        data: this.buildSyncSseResponse()
      });
      this.sendRedirectIfReady();
      return;
    }
    if (this.options.stepMode !== StepMode.Sync) this.postCheckpointStream();
    this.sendRedirectIfReady();
  }
  /**
  * Sends the `inngest.redirect_info` SSE event when both conditions are met:
  * 1. The client accepts SSE (so there's a stream to write the event to)
  * 2. We have a realtime token (first checkpoint has completed)
  *
  * Called after the first checkpoint AND on stream activation, whichever
  * comes second, so the redirect is sent as early as possible.
  */
  sendRedirectIfReady() {
    if (this.redirectSent) return;
    if (!this.options.acceptsSse) return;
    if (!this.state.checkpointedRun) return;
    this.redirectSent = true;
    const { realtimeToken } = this.state.checkpointedRun;
    this.redirectPromise = (async () => {
      try {
        const redirect = await this.options.client["inngestApi"].getRealtimeStreamRedirect(realtimeToken);
        this.streamTools.sendRedirectInfo({
          runId: this.fnArg.runId,
          url: redirect.url
        });
      } catch (err2) {
        this.options.client[internalLoggerSymbol].warn({ err: err2 }, "Failed to fetch realtime stream redirect URL");
      }
    })();
  }
  /**
  * Await the pending redirect-info fetch, then close the stream with a
  * succeeded result. Awaiting first guarantees the redirect event is
  * enqueued on the write chain before the close event.
  */
  async streamCloseSucceeded(response) {
    await this.redirectPromise;
    this.streamTools.closeSucceeded(response);
  }
  /**
  * Await the pending redirect-info fetch, then close the stream with a
  * failed result.
  */
  async streamCloseFailed(error) {
    await this.redirectPromise;
    this.streamTools.closeFailed(error);
  }
  /**
  * Await the pending redirect-info fetch, then close the stream without
  * a result event.
  */
  async streamEnd() {
    await this.redirectPromise;
    this.streamTools.end();
  }
  /**
  * POST stream data to the checkpoint stream ingest endpoint.
  *
  * Called eagerly from handleStreamActivated so chunks flow in
  * real-time, or after completion if stream.push() was never called.
  */
  postCheckpointStream() {
    try {
      this.options.client["inngestApi"].checkpointStream({
        runId: this.fnArg.runId,
        body: this.buildMetadataPrefixedStream()
      }).catch((err2) => {
        this.devDebug("checkpoint stream POST error:", err2);
      });
    } catch (err2) {
      this.devDebug("checkpoint stream POST error:", err2);
    }
  }
  /**
  * Checkpoints the return value of a function that was delivered via SSE.
  * Runs in the background so it doesn't block the client stream.
  */
  async checkpointReturnValue(data) {
    try {
      if (this.options.createResponse) await this.checkpoint([{
        op: StepOpCode.RunComplete,
        id: hashId(RUN_COMPLETE_STEP_ID),
        data: await this.options.createResponse(jsonResponse(data))
      }]);
    } catch (err2) {
      this.devDebug("error during background checkpoint of SSE result, client stream unaffected:", err2);
    }
  }
  /**
  * Creates a handler for every checkpoint type, defining what to do when we
  * reach that checkpoint in the core loop.
  */
  createCheckpointHandlers() {
    const commonCheckpointHandler = (checkpoint) => {
      this.devDebug(`${this.options.stepMode} checkpoint:`, checkpoint);
    };
    const stepRanHandler = async (stepResult) => {
      const transformResult = await this.transformOutput(stepResult);
      if (transformResult.type === "function-resolved") return {
        type: "step-ran",
        ctx: transformResult.ctx,
        ops: transformResult.ops,
        step: {
          ...stepResult,
          data: transformResult.data
        }
      };
      else if (transformResult.type === "function-rejected") {
        const stepForResponse = {
          ...stepResult,
          error: transformResult.error
        };
        if (stepResult.op === StepOpCode.StepFailed) {
          const ser = serializeError$1(transformResult.error);
          stepForResponse.data = {
            __serialized: true,
            name: ser.name,
            message: ser.message,
            stack: ""
          };
        }
        return {
          type: "step-ran",
          ctx: transformResult.ctx,
          ops: transformResult.ops,
          retriable: transformResult.retriable,
          step: stepForResponse
        };
      }
      return transformResult;
    };
    const maybeReturnNewSteps = async () => {
      const allSteps = [...await this.filterNewSteps(Array.from(this.state.steps.values())) ?? [], ...this.state.lazyOps.drain()];
      if (allSteps.length === 0) return;
      return {
        type: "steps-found",
        ctx: this.fnArg,
        ops: this.ops,
        steps: allSteps
      };
    };
    const attemptCheckpointAndResume = async (stepResult, resume = true, force = false) => {
      if (stepResult) {
        if ((this.options.data?.attempt ?? 0) > 0 && resume) {
          delete this.state.executingStep;
          return stepRanHandler(stepResult);
        }
        const stepToResume = this.resumeStepWithResult(stepResult, resume);
        delete this.state.executingStep;
        this.state.checkpointingStepBuffer.push({
          ...stepToResume,
          data: stepResult.data
        });
      }
      if (force || !this.options.checkpointingConfig?.bufferedSteps || this.state.checkpointingStepBuffer.length >= this.options.checkpointingConfig.bufferedSteps) {
        this.devDebug("checkpointing and resuming execution after step run");
        try {
          this.devDebug(`checkpointing all buffered steps:`, this.state.checkpointingStepBuffer.map((op) => op.displayName || op.id).join(", "));
          await this.checkpoint(this.state.checkpointingStepBuffer);
          return;
        } catch (err2) {
          if (isStaleDispatchError(err2)) {
            this.devDebug("stale dispatch detected; halting execution");
            return {
              type: "function-rejected",
              ctx: this.fnArg,
              ops: {},
              error: serializeError$1(err2),
              retriable: false
            };
          }
          this.devDebug("error checkpointing after step run, so falling back to async", err2);
          const buffered = this.state.checkpointingStepBuffer;
          if (buffered.length) return {
            type: "steps-found",
            ctx: this.fnArg,
            ops: this.ops,
            steps: buffered
          };
          return;
        } finally {
          this.state.checkpointingStepBuffer = [];
        }
      } else this.devDebug(`not checkpointing yet, continuing execution as we haven't reached buffered step limit of ${this.options.checkpointingConfig?.bufferedSteps}`);
    };
    const syncHandlers = {
      "": commonCheckpointHandler,
      "function-resolved": async (checkpoint) => {
        const usingSseStream = !!this.earlyStreamResponse;
        if (this.streamTools.activated) {
          let resultData = checkpoint.data;
          let sseResponse;
          if (checkpoint.data instanceof Response) {
            const body = await (usingSseStream ? checkpoint.data.text() : checkpoint.data.clone().text());
            sseResponse = extractSseResponse(checkpoint.data, body);
            resultData = body;
          } else sseResponse = defaultSseResponse(resultData);
          await this.streamCloseSucceeded(sseResponse);
          if (usingSseStream) {
            this.checkpointReturnValue(resultData);
            return this.transformOutput({ data: resultData });
          }
        }
        if (this.options.acceptsSse) {
          let sseResponse;
          if (checkpoint.data instanceof Response) {
            const body = await checkpoint.data.text();
            sseResponse = extractSseResponse(checkpoint.data, body);
            checkpoint = {
              ...checkpoint,
              data: body
            };
          } else sseResponse = defaultSseResponse(checkpoint.data);
          return this.wrapResultAsSse(checkpoint, sseResponse);
        }
        if (checkpoint.data instanceof Response) {
          this.checkpointReturnValue(null);
          return this.transformOutput({ data: checkpoint.data });
        }
        await this.checkpoint([{
          op: StepOpCode.RunComplete,
          id: hashId(RUN_COMPLETE_STEP_ID),
          data: await this.options.createResponse(jsonResponse(checkpoint.data))
        }]);
        return this.transformOutput({ data: checkpoint.data });
      },
      "function-rejected": async (checkpoint) => {
        const usingSseStream = !!this.earlyStreamResponse;
        const isFinal = !this.retriability(checkpoint.error);
        if (this.streamTools.activated && usingSseStream) {
          (async () => {
            try {
              await this.checkpoint([{
                id: hashId(RUN_COMPLETE_STEP_ID),
                op: isFinal ? StepOpCode.StepFailed : StepOpCode.StepError,
                error: checkpoint.error
              }]);
            } catch (err2) {
              this.options.client[internalLoggerSymbol].warn({ err: err2 }, "Failed to checkpoint function error");
            }
            if (isFinal) await this.streamCloseFailed(errorMessage(checkpoint.error));
            else await this.streamEnd();
          })();
          return this.transformOutput({ error: checkpoint.error });
        }
        if (isFinal) return this.transformOutput({ error: checkpoint.error });
        return this.checkpointAndSwitchToAsync([{
          id: hashId(RUN_COMPLETE_STEP_ID),
          op: StepOpCode.StepError,
          error: checkpoint.error
        }]);
      },
      "step-not-found": () => {
        return {
          type: "function-rejected",
          ctx: this.fnArg,
          error: /* @__PURE__ */ new Error("Step not found when checkpointing; this should never happen"),
          ops: this.ops,
          retriable: false
        };
      },
      "steps-found": async ({ steps }) => {
        if (steps.length !== 1 || steps[0].mode !== StepMode.Sync) return this.checkpointAndSwitchToAsync(steps.map((step2) => ({
          ...step2,
          id: step2.hashedId
        })));
        const result = await this.executeStep(steps[0]);
        const transformed = await stepRanHandler(result);
        if (transformed.type !== "step-ran") throw new Error("Unexpected checkpoint handler result type after running step in sync mode");
        if (result.error) return this.checkpointAndSwitchToAsync([transformed.step], result.error);
        const stepToResume = this.resumeStepWithResult(result);
        delete this.state.executingStep;
        const stepForCheckpoint = {
          ...stepToResume,
          data: transformed.step.data
        };
        await this.checkpoint([stepForCheckpoint]);
      },
      "checkpointing-runtime-reached": () => {
        return this.checkpointAndSwitchToAsync([{
          op: StepOpCode.DiscoveryRequest,
          id: _internals.hashId(`discovery-request-${Date.now()}`)
        }]);
      },
      "checkpointing-buffer-interval-reached": () => {
        return attemptCheckpointAndResume(void 0, false, true);
      }
    };
    const asyncHandlers = {
      "": commonCheckpointHandler,
      "function-resolved": async ({ data }) => {
        let resultData = data;
        let sseResponse;
        if (data instanceof Response) {
          const body = await data.text();
          sseResponse = extractSseResponse(data, body);
          resultData = body;
        } else sseResponse = defaultSseResponse(resultData);
        const newSteps = await this.filterNewSteps(Array.from(this.state.steps.values()));
        if (newSteps?.length) return this.attachLazyOps({
          type: "steps-found",
          ctx: this.fnArg,
          ops: this.ops,
          steps: newSteps
        });
        await this.streamCloseSucceeded(sseResponse);
        if (this.options.isDurableEndpoint && !this.streamTools.activated) this.postCheckpointStream();
        if (this.options.createResponse) data = await this.options.createResponse(jsonResponse(resultData));
        return this.attachLazyOps(this.transformOutput({ data }));
      },
      "function-rejected": async (checkpoint) => {
        if (!this.retriability(checkpoint.error)) await this.streamCloseFailed(errorMessage(checkpoint.error));
        else await this.streamEnd();
        if (this.options.isDurableEndpoint && !this.streamTools.activated) this.postCheckpointStream();
        return this.attachLazyOps(this.transformOutput({ error: checkpoint.error }));
      },
      "steps-found": async ({ steps }) => {
        const stepResult = await this.tryExecuteStep(steps);
        if (!stepResult) return maybeReturnNewSteps();
        if (this.state.lazyOps.length === 0) return stepRanHandler(stepResult);
        const transformed = await stepRanHandler(stepResult);
        if (transformed.type !== "step-ran") return transformed;
        return this.attachLazyOps({
          type: "steps-found",
          ctx: transformed.ctx,
          ops: transformed.ops,
          steps: [transformed.step]
        });
      },
      "step-not-found": ({ step: step2 }) => {
        const { foundSteps, totalFoundSteps } = this.getStepNotFoundDetails();
        return {
          type: "step-not-found",
          ctx: this.fnArg,
          ops: this.ops,
          step: step2,
          foundSteps,
          totalFoundSteps
        };
      },
      "checkpointing-runtime-reached": () => {
        throw new Error("Checkpointing maximum runtime reached, but this is not in a checkpointing step mode. This is a bug in the Inngest SDK.");
      },
      "checkpointing-buffer-interval-reached": () => {
        throw new Error("Checkpointing maximum buffer interval reached, but this is not in a checkpointing step mode. This is a bug in the Inngest SDK.");
      }
    };
    const asyncCheckpointingHandlers = {
      "": commonCheckpointHandler,
      "function-resolved": async (checkpoint, i2) => {
        const lazyOps = this.state.lazyOps.drain();
        const output = await asyncHandlers["function-resolved"](checkpoint, i2);
        if (output?.type === "function-resolved") {
          const steps = [
            ...this.state.checkpointingStepBuffer,
            ...lazyOps,
            {
              op: StepOpCode.RunComplete,
              id: hashId(RUN_COMPLETE_STEP_ID),
              data: output.data
            }
          ];
          if (isNonEmpty(steps)) return {
            type: "steps-found",
            ctx: output.ctx,
            ops: output.ops,
            steps
          };
        }
        if (output?.type === "steps-found" && lazyOps.length) return {
          ...output,
          steps: [...output.steps, ...lazyOps]
        };
        return output;
      },
      "function-rejected": async (checkpoint) => {
        if (this.state.checkpointingStepBuffer.length || this.state.lazyOps.length > 0) {
          const fallback = await attemptCheckpointAndResume(void 0, false, true);
          if (fallback) return fallback;
        }
        return await this.transformOutput({ error: checkpoint.error });
      },
      "step-not-found": asyncHandlers["step-not-found"],
      "steps-found": async ({ steps }) => {
        const { stepsToResume, newSteps } = steps.reduce((acc, step2) => {
          if (!step2.hasStepState) acc.newSteps.push(step2);
          else if (!step2.fulfilled) acc.stepsToResume.push(step2);
          return acc;
        }, {
          stepsToResume: [],
          newSteps: []
        });
        this.devDebug("split found steps in to:", {
          stepsToResume: stepsToResume.length,
          newSteps: newSteps.length
        });
        if (!this.options.requestedRunStep && newSteps.length) {
          if (this.state.checkpointingRuntimeExceeded) {
            if (this.state.checkpointingStepBuffer.length) {
              const fallback = await attemptCheckpointAndResume(void 0, false, true);
              if (fallback) return fallback;
            }
            return maybeReturnNewSteps();
          }
          const stepResult = await this.tryExecuteStep(newSteps);
          if (stepResult) {
            this.devDebug(`executed step "${stepResult.id}" successfully`);
            if (stepResult.error) {
              if (this.state.checkpointingStepBuffer.length) {
                const fallback = await attemptCheckpointAndResume(void 0, false, true);
                if (fallback) return fallback;
              }
              return stepRanHandler(stepResult);
            }
            return await attemptCheckpointAndResume(stepResult);
          }
          if (this.state.checkpointingStepBuffer.length) {
            const fallback = await attemptCheckpointAndResume(void 0, false, true);
            if (fallback) return fallback;
          }
          return maybeReturnNewSteps();
        }
        if (stepsToResume.length) {
          this.devDebug(`resuming ${stepsToResume.length} steps`);
          for (const st2 of stepsToResume) this.resumeStepWithResult({
            ...st2,
            id: st2.hashedId
          });
        }
      },
      "checkpointing-runtime-reached": async () => {
        this.state.checkpointingRuntimeExceeded = true;
      },
      "checkpointing-buffer-interval-reached": () => {
        return attemptCheckpointAndResume(void 0, false, true);
      }
    };
    return {
      [StepMode.Async]: asyncHandlers,
      [StepMode.Sync]: syncHandlers,
      [StepMode.AsyncCheckpointing]: asyncCheckpointingHandlers
    };
  }
  getCheckpointHandler(type) {
    return this.checkpointHandlers[this.options.stepMode][type];
  }
  async tryExecuteStep(steps) {
    const hashedStepIdToRun = this.options.requestedRunStep || this.getEarlyExecRunStep(steps);
    if (!hashedStepIdToRun) return;
    const step2 = steps.find((step$1) => step$1.hashedId === hashedStepIdToRun && step$1.fn);
    if (step2) return await this.executeStep(step2);
    this.timeout?.reset();
  }
  /**
  * Given a list of outgoing ops, decide if we can execute an op early and
  * return the ID of the step to execute if we can.
  */
  getEarlyExecRunStep(steps) {
    if (this.options.disableImmediateExecution) return;
    const unfulfilledSteps = steps.filter((step2) => !step2.fulfilled);
    if (unfulfilledSteps.length !== 1) return;
    const op = unfulfilledSteps[0];
    if (op && op.op === StepOpCode.StepPlanned) return op.hashedId;
  }
  async filterNewSteps(foundSteps) {
    if (this.options.requestedRunStep) return;
    const newSteps = foundSteps.reduce((acc, step2) => {
      if (!step2.hasStepState) acc.push(step2);
      return acc;
    }, []);
    if (!newSteps.length) return;
    await this.middlewareManager.onMemoizationEnd();
    const stepList = newSteps.map((step2) => {
      return {
        displayName: step2.displayName,
        op: step2.op,
        id: step2.hashedId,
        name: step2.name,
        opts: step2.opts,
        userland: step2.userland
      };
    });
    if (!isNonEmpty(stepList)) throw new UnreachableError("stepList is empty");
    return stepList;
  }
  async executeStep(foundStep) {
    const { id, name, opts, fn: fn2, displayName, userland, hashedId } = foundStep;
    const { stepInfo, wrappedHandler, setActualHandler } = foundStep.middleware;
    this.devDebug(`preparing to execute step "${id}"`);
    this.timeout?.clear();
    const outgoingOp = {
      id: hashedId,
      op: StepOpCode.StepRun,
      name,
      opts,
      displayName,
      userland
    };
    this.state.executingStep = outgoingOp;
    const store = await getAsyncCtx();
    if (store?.execution) store.execution.executingStep = {
      id,
      name: displayName,
      hashedId
    };
    this.devDebug(`executing step "${id}"`);
    if (this.rootSpanId && this.options.checkpointingConfig) clientProcessorMap.get(this.options.client)?.declareStepExecution(this.rootSpanId, userland.id ?? "", userland.index ?? 0, hashedId, this.options.data?.attempt ?? 0);
    this.state.executingStepAIMetadata = void 0;
    let interval;
    const actualHandler = () => runAsPromise(fn2);
    await this.middlewareManager.onMemoizationEnd();
    await this.middlewareManager.onStepStart(stepInfo);
    if (!foundStep.memoizationDeferred) {
      const deferred = createDeferredPromise();
      foundStep.memoizationDeferred = deferred;
      setActualHandler(() => deferred.promise);
      foundStep.transformedResultPromise = wrappedHandler();
      foundStep.transformedResultPromise.catch(() => {
      });
    }
    const wrappedActualHandler = this.middlewareManager.buildWrapStepHandlerChain(actualHandler, stepInfo);
    return goIntervalTiming(() => wrappedActualHandler()).finally(() => {
      this.devDebug(`finished executing step "${id}"`);
      this.state.executingStep = void 0;
      if (this.rootSpanId && this.options.checkpointingConfig) clientProcessorMap.get(this.options.client)?.clearStepExecution(this.rootSpanId);
      const aiMetadata = this.state.executingStepAIMetadata;
      this.state.executingStepAIMetadata = void 0;
      const aiValues = aiMetadata && toInngestAIMetadataValues(aiMetadata);
      if (aiValues) this.addMetadata(id, "inngest.ai", "step", "merge", aiValues);
      if (store?.execution) delete store.execution.executingStep;
    }).then(async ({ resultPromise, interval: _interval }) => {
      interval = _interval;
      const metadata = this.state.metadata?.get(id);
      const serverData = await resultPromise;
      await this.middlewareManager.onStepComplete(stepInfo, serverData);
      this.streamTools.commit(hashedId);
      return {
        ...outgoingOp,
        data: serverData,
        ...metadata && metadata.length > 0 ? { metadata } : {}
      };
    }).catch((error) => {
      return this.buildStepErrorOp({
        error,
        id,
        outgoingOp,
        stepInfo
      });
    }).then((op) => ({
      ...op,
      timing: interval
    }));
  }
  /**
  * Starts execution of the user's function, including triggering checkpoints
  * and middleware hooks where appropriate.
  */
  async startExecution() {
    this.timeout?.start();
    this.checkpointingMaxRuntimeTimer?.start();
    this.checkpointingMaxBufferIntervalTimer?.start();
    const fnInputResult = await this.middlewareManager.transformFunctionInput();
    this.applyFunctionInputMutations(fnInputResult);
    if (this.state.allStateUsed()) await this.middlewareManager.onMemoizationEnd();
    if (this.state.stepsToFulfill === 0 && this.fnArg.attempt === 0) await this.middlewareManager.onRunStart();
    const innerHandler = async () => {
      await this.validateEventSchemas();
      return this.userFnToRun(this.fnArg);
    };
    runAsPromise(this.middlewareManager.wrapRunHandler(innerHandler)).then(async (data) => {
      await this.middlewareManager.onRunComplete(data);
      this.state.setCheckpoint({
        type: "function-resolved",
        data
      });
    }).catch(async (error) => {
      let err2;
      if (error instanceof Error) err2 = error;
      else if (typeof error === "object") err2 = new Error(JSON.stringify(error));
      else err2 = new Error(String(error));
      await this.middlewareManager.onRunError(err2, !this.retriability(err2));
      this.state.setCheckpoint({
        type: "function-rejected",
        error: err2
      });
    });
  }
  /**
  * Determine whether the given error is retriable. Returns `false` when the
  * run should not be retried, a duration string for `RetryAfterError`, or
  * `true` for normal retry behavior.
  */
  retriability(error) {
    if (this.fnArg.maxAttempts && this.fnArg.maxAttempts - 1 === this.fnArg.attempt) return false;
    if (error instanceof NonRetriableError || error?.name === "NonRetriableError") return false;
    if (error instanceof StepError && error === this.state.recentlyRejectedStepError) return false;
    if (error instanceof RetryAfterError || error?.name === "RetryAfterError") return error.retryAfter;
    return true;
  }
  /**
  * Build the OutgoingOp for a failed step, notifying middleware and choosing
  * retriable vs non-retriable opcode.
  */
  async buildStepErrorOp({ error, id, outgoingOp, stepInfo }) {
    const isFinal = !this.retriability(error);
    const metadata = this.state.metadata?.get(id);
    await this.middlewareManager.onStepError(stepInfo, error instanceof Error ? error : new Error(String(error)), isFinal);
    this.streamTools.rollback(outgoingOp.id);
    return {
      ...outgoingOp,
      error,
      op: isFinal ? StepOpCode.StepFailed : StepOpCode.StepError,
      ...metadata && metadata.length > 0 ? { metadata } : {}
    };
  }
  /**
  * Validate event data against schemas defined in function triggers.
  */
  async validateEventSchemas() {
    if (this.options.handlerKind === "failure") return;
    if (this.options.handlerKind === "defer") {
      await this.validateDeferEventSchema();
      return;
    }
    const triggers = this.options.fn.opts.triggers;
    if (!triggers || triggers.length === 0) return;
    const fnArgEvents = this.fnArg.events;
    if (!fnArgEvents || fnArgEvents.length === 0) return;
    await validateEvents(fnArgEvents.map((event) => ({
      name: event.name,
      data: event.data
    })), triggers);
  }
  /**
  * Validate the deferred event's data against the defer function's own
  * schema (set via `createDefer`'s `opts.schema`).
  */
  async validateDeferEventSchema() {
    const fn2 = this.options.fn;
    if (!isDeferredFunction(fn2) || !fn2.schema) return;
    const eventData = this.fnArg.event?.data;
    const result = await fn2.schema["~standard"].validate(eventData);
    if (result.issues) throw new NonRetriableError(`defer handler "${fn2.id(this.options.client.id)}" schema validation failed: ${JSON.stringify(result.issues)}`);
  }
  /**
  * Using middleware, transform output before returning.
  */
  transformOutput(dataOrError) {
    const { data, error } = dataOrError;
    if (typeof error !== "undefined") {
      const retriable = this.retriability(error);
      const serializedError = serializeError$1(error);
      return {
        type: "function-rejected",
        ctx: this.fnArg,
        ops: this.ops,
        error: serializedError,
        retriable
      };
    }
    return {
      type: "function-resolved",
      ctx: this.fnArg,
      ops: this.ops,
      data: undefinedToNull(data)
    };
  }
  /**
  * Drain buffered lazy ops (e.g. `DeferAdd` from `defer()`) and merge them
  * into `result` so they ship in the same outbound message. Lazy ops are
  * fire-and-forget and have no natural shipping moment, so each terminal code
  * path must ship them or they're silently dropped.
  */
  attachLazyOps(result, extras = []) {
    const lazyOps = this.state.lazyOps.drain();
    if (lazyOps.length === 0 && extras.length === 0) return result;
    switch (result.type) {
      case "function-resolved": {
        const steps = [
          ...extras,
          ...lazyOps,
          {
            op: StepOpCode.RunComplete,
            id: hashId(RUN_COMPLETE_STEP_ID),
            data: undefinedToNull(result.data)
          }
        ];
        return {
          type: "steps-found",
          ctx: result.ctx,
          ops: result.ops,
          steps
        };
      }
      case "function-rejected": {
        const isFinal = result.retriable === false;
        const steps = [
          ...extras,
          ...lazyOps,
          {
            op: isFinal ? StepOpCode.StepFailed : StepOpCode.StepError,
            id: hashId(RUN_COMPLETE_STEP_ID),
            error: result.error
          }
        ];
        return {
          type: "steps-found",
          ctx: result.ctx,
          ops: result.ops,
          steps
        };
      }
      case "steps-found":
        return {
          ...result,
          steps: [
            ...result.steps,
            ...extras,
            ...lazyOps
          ]
        };
      default:
        for (const op of lazyOps) this.state.lazyOps.push(op);
        return result;
    }
  }
  createExecutionState() {
    const d2 = createDeferredPromiseWithStack();
    let checkpointResolve = d2.deferred.resolve;
    const checkpointResults = d2.results;
    const loop = (async function* (cleanUp) {
      try {
        while (true) {
          const res = (await checkpointResults.next()).value;
          if (res) yield res;
        }
      } finally {
        cleanUp?.();
      }
    })(() => {
      this.timeout?.clear();
      this.checkpointingMaxRuntimeTimer?.clear();
      this.checkpointingMaxBufferIntervalTimer?.clear();
      checkpointResults.return();
    });
    const stepsToFulfill = Object.keys(this.options.stepState).length;
    return {
      stepState: this.options.stepState,
      priorDefers: this.options.priorDefers ?? {},
      stepsToFulfill,
      steps: /* @__PURE__ */ new Map(),
      loop,
      hasSteps: Boolean(stepsToFulfill),
      stepCompletionOrder: [...this.options.stepCompletionOrder],
      remainingStepsToBeSeen: new Set(this.options.stepCompletionOrder),
      setCheckpoint: (checkpoint) => {
        this.devDebug("setting checkpoint:", checkpoint.type);
        ({ resolve: checkpointResolve } = checkpointResolve(checkpoint));
      },
      allStateUsed: () => {
        return this.state.remainingStepsToBeSeen.size === 0;
      },
      checkpointingStepBuffer: [],
      lazyOps: new LazyOps(),
      metadata: /* @__PURE__ */ new Map()
    };
  }
  get ops() {
    return Object.fromEntries(this.state.steps);
  }
  createFnArg() {
    const { step: step2, defer } = this.createStepTools();
    const experimentStepRun = step2[experimentStepRunSymbol];
    let fnArg = {
      ...this.options.data,
      step: step2,
      group: createGroupTools({ experimentStepRun }),
      defer
    };
    if (this.options.handlerKind === "defer") {
      delete fnArg.event.data._inngest;
      for (const event of fnArg.events) delete event.data._inngest;
    }
    if (this.options.handlerKind === "failure") {
      const eventData = external_exports.object({ error: jsonErrorSchema }).parse(fnArg.event?.data);
      fnArg = {
        ...fnArg,
        error: deserializeError$1(eventData.error)
      };
    }
    return this.options.transformCtx?.(fnArg) ?? fnArg;
  }
  /**
  * Apply mutations from `transformFunctionInput` back to execution state.
  * Allows middleware to modify event data, step tools, memoized step data,
  * and inject custom fields into the handler context.
  */
  applyFunctionInputMutations(result) {
    const { event, events, step: step2, ...extensions } = result.ctx;
    if (event !== this.fnArg.event) this.fnArg.event = event;
    if (events !== this.fnArg.events) this.fnArg.events = events;
    if (step2 !== this.fnArg.step) this.fnArg.step = step2;
    if (Object.keys(extensions).length > 0) Object.assign(this.fnArg, extensions);
    for (const [hashedId, stepData] of Object.entries(result.steps)) {
      const existing = this.state.stepState[hashedId];
      if (existing && stepData && stepData.type === "data" && stepData.data !== existing.data) this.state.stepState[hashedId] = {
        ...existing,
        data: stepData.data
      };
    }
  }
  createStepTools() {
    const foundStepsToReport = /* @__PURE__ */ new Map();
    const unhandledFoundStepsToReport = /* @__PURE__ */ new Map();
    const expectedNextStepIndexes = /* @__PURE__ */ new Map();
    const remainingStepCompletionOrder = this.state.stepCompletionOrder.slice();
    let foundStepsReportPromise;
    let warnOfParallelIndexing = false;
    let tickExtensionCount = 0;
    const maybeWarnOfParallelIndexing = (userlandCollisionId) => {
      if (warnOfParallelIndexing) return;
      const hashedCollisionId = _internals.hashId(userlandCollisionId);
      if (this.state.steps.has(hashedCollisionId)) {
        if (!foundStepsToReport.has(hashedCollisionId)) {
          warnOfParallelIndexing = true;
          this.options.client["warnMetadata"]({ run_id: this.fnArg.runId }, ErrCode.AUTOMATIC_PARALLEL_INDEXING, {
            message: `Duplicate step ID "${userlandCollisionId}" detected across parallel chains`,
            explanation: "Using the same ID for steps in different parallel chains can cause unexpected behaviour. Your function is still running.",
            action: "Use a unique ID for each step, especially those in parallel.",
            code: ErrCode.AUTOMATIC_PARALLEL_INDEXING
          });
        }
      }
    };
    const reportNextTick = () => {
      if (foundStepsReportPromise) return;
      let extensionPromise;
      if (++tickExtensionCount >= 10) {
        tickExtensionCount = 0;
        extensionPromise = resolveNextTick();
      } else extensionPromise = resolveAfterPending();
      foundStepsReportPromise = extensionPromise.then(() => {
        foundStepsReportPromise = void 0;
        for (let i2 = 0; i2 < remainingStepCompletionOrder.length; i2++) {
          const nextStepId = remainingStepCompletionOrder[i2];
          if (!nextStepId) continue;
          if (unhandledFoundStepsToReport.get(nextStepId)?.handle()) {
            remainingStepCompletionOrder.splice(i2, 1);
            unhandledFoundStepsToReport.delete(nextStepId);
            reportNextTick();
            return;
          }
        }
        const steps = [...foundStepsToReport.values()];
        foundStepsToReport.clear();
        unhandledFoundStepsToReport.clear();
        if (!isNonEmpty(steps)) return;
        this.state.setCheckpoint({
          type: "steps-found",
          steps
        });
      });
    };
    const pushStepToReport = (step2) => {
      foundStepsToReport.set(step2.hashedId, step2);
      unhandledFoundStepsToReport.set(step2.hashedId, step2);
      reportNextTick();
    };
    const stepHandler = async ({ args, matchOp, opts }) => {
      const opId = matchOp(getStepOptions(args[0]), ...args.slice(1));
      if (isLazyOp(opts, opId)) {
        const hashedId$1 = _internals.hashId(opId.id);
        if (this.state.lazyOps.hasId(hashedId$1)) {
          this.options.client[internalLoggerSymbol].warn({
            runId: this.fnArg.runId,
            id: opId.userland?.id ?? opId.id
          }, "defer skipped: duplicate ID within run");
          return;
        }
        if (this.state.priorDefers[hashedId$1]) {
          this.state.lazyOps.markSeen(hashedId$1);
          return;
        }
        this.state.lazyOps.push({
          id: hashedId$1,
          op: opId.op,
          name: opId.name,
          displayName: opId.displayName ?? opId.id,
          opts: opId.opts,
          userland: opId.userland,
          data: null
        });
        return;
      }
      if (this.state.executingStep)
        this.options.client["warnMetadata"]({ run_id: this.fnArg.runId }, ErrCode.NESTING_STEPS, {
          message: `Nested step tooling detected in "${opId.displayName ?? opId.id}"`,
          explanation: "Nesting step.* calls is not supported. This warning may also appear if steps are separated by regular async calls, which is fine.",
          action: "Avoid using step.* inside other step.* calls. Use a separate async function or promise chaining to compose steps.",
          code: ErrCode.NESTING_STEPS
        });
      const { hashedId, isFulfilled, setActualHandler, stepInfo, stepState, wrappedHandler } = await this.applyMiddlewareToStep(opId, expectedNextStepIndexes, maybeWarnOfParallelIndexing);
      const { promise, resolve, reject } = createDeferredPromise();
      let extraOpts;
      let fnArgs = [...args];
      if (typeof stepState?.input !== "undefined" && Array.isArray(stepState.input)) switch (opId.op) {
        case StepOpCode.StepPlanned:
          fnArgs = [...args.slice(0, 2), ...stepState.input];
          extraOpts = { input: [...stepState.input] };
          break;
        case StepOpCode.AiGateway:
          extraOpts = { body: {
            ...typeof opId.opts?.body === "object" ? { ...opId.opts.body } : {},
            ...stepState.input[0]
          } };
          break;
      }
      if (!extraOpts && Array.isArray(stepInfo.input)) fnArgs = [...args.slice(0, 2), ...stepInfo.input];
      const step2 = {
        ...opId,
        opts: {
          ...opId.opts,
          ...extraOpts
        },
        rawArgs: fnArgs,
        hashedId,
        input: stepState?.input,
        fn: opts?.fn ? () => opts.fn?.(this.fnArg, ...fnArgs) : void 0,
        promise,
        fulfilled: isFulfilled,
        hasStepState: Boolean(stepState),
        displayName: opId.displayName ?? opId.id,
        handled: false,
        middleware: {
          wrappedHandler,
          stepInfo,
          setActualHandler
        },
        handle: () => {
          if (step2.handled) return false;
          this.devDebug(`handling step "${hashedId}"`);
          step2.handled = true;
          const result = this.state.stepState[hashedId];
          if (step2.fulfilled && result) {
            result.fulfilled = true;
            Promise.all([
              result.data,
              result.error,
              result.input
            ]).then(async () => {
              if (step2.transformedResultPromise) {
                if (step2.memoizationDeferred) if (typeof result.data !== "undefined") step2.memoizationDeferred.resolve(await result.data);
                else {
                  const stepError = new StepError(opId.id, result.error);
                  this.state.recentlyRejectedStepError = stepError;
                  step2.memoizationDeferred.reject(stepError);
                }
                step2.transformedResultPromise.then(resolve, reject);
                return;
              }
              step2.middleware.stepInfo.memoized = true;
              if (typeof result.data !== "undefined") {
                if (opId.op === StepOpCode.WaitForEvent && result.data !== null) {
                  const { event } = step2.rawArgs?.[1] ?? {};
                  if (!event) throw new Error("Missing event option in waitForEvent");
                  try {
                    await validateEvents([result.data], [{ event }]);
                  } catch (err2) {
                    this.state.recentlyRejectedStepError = new StepError(opId.id, err2);
                    reject(this.state.recentlyRejectedStepError);
                    return;
                  }
                }
                step2.middleware.setActualHandler(() => Promise.resolve(result.data));
                step2.middleware.wrappedHandler().then(resolve);
              } else {
                const stepError = new StepError(opId.id, result.error);
                this.state.recentlyRejectedStepError = stepError;
                step2.middleware.setActualHandler(() => Promise.reject(stepError));
                step2.middleware.wrappedHandler().catch(reject);
              }
            });
          }
          return true;
        }
      };
      this.state.steps.set(hashedId, step2);
      this.state.hasSteps = true;
      if (!isFulfilled && !stepState && step2.fn) {
        const deferred = createDeferredPromise();
        step2.memoizationDeferred = deferred;
        setActualHandler(() => {
          pushStepToReport(step2);
          return deferred.promise;
        });
        step2.transformedResultPromise = wrappedHandler();
        step2.transformedResultPromise.catch((error) => {
          reject(error);
        });
      } else pushStepToReport(step2);
      return promise;
    };
    return {
      step: createStepTools(this.options.client, this, stepHandler),
      defer: this.buildDefer(stepHandler)
    };
  }
  /**
  * Build the `defer(idOrOptions, { function, data })` method exposed on
  * every handler context. Validates `data` against the target function's
  * schema (if any) and emits a `DeferAdd` opcode that routes to the
  * target's companion function slug.
  *
  * `defer()` is fire-and-forget: a misuse should not derail the user's
  * handler. Validation failures (wrong function, async schema validator,
  * schema mismatch) are logged and the call is silently skipped.
  */
  buildDefer(stepHandler) {
    return (idOrOptions, { function: deferFn, data }) => {
      const log = this.options.client[internalLoggerSymbol];
      const runId = this.fnArg.runId;
      try {
        if (!isDeferredFunction(deferFn)) {
          log.error({ runId }, "defer skipped: function not created via createDefer");
          return;
        }
        const { schema } = deferFn;
        const deferFnSlug = deferFn.id(this.options.client.id);
        let input = data;
        if (schema) {
          const result = schema["~standard"].validate(data);
          if (result instanceof Promise) {
            log.error({ runId }, "defer() requires a synchronous schema validator. The defer call was skipped.");
            return;
          }
          if (result.issues) {
            log.error({
              runId,
              issues: result.issues
            }, "defer skipped: schema validation failed");
            return;
          }
          input = result.value ?? data;
        }
        stepHandler({
          args: [idOrOptions, input],
          matchOp: (stepOptions, inputArg) => ({
            id: stepOptions.id,
            mode: StepMode.Sync,
            op: StepOpCode.DeferAdd,
            name: stepOptions.name ?? stepOptions.id,
            displayName: stepOptions.name ?? stepOptions.id,
            opts: {
              fn_slug: deferFnSlug,
              input: inputArg
            },
            userland: { id: stepOptions.id }
          })
        }).catch((err2) => {
          log.error({
            runId,
            err: err2
          }, "defer skipped: unexpected error");
        });
      } catch (err2) {
        log.error({
          runId,
          err: err2
        }, "defer skipped: unexpected error");
      }
    };
  }
  /**
  * Applies middleware transformations to a step, resolves ID collisions,
  * and performs memoization lookup.
  */
  async applyMiddlewareToStep(opId, expectedNextStepIndexes, maybeWarnOfParallelIndexing) {
    const initialCollision = resolveStepIdCollision({
      baseId: opId.id,
      expectedIndexes: expectedNextStepIndexes,
      stepsMap: this.state.steps
    });
    if (initialCollision.finalId !== opId.id) {
      maybeWarnOfParallelIndexing(opId.id);
      opId.id = initialCollision.finalId;
      if (initialCollision.index !== void 0) opId.userland.index = initialCollision.index;
    }
    const originalId = opId.userland.id;
    let hashedId = _internals.hashId(opId.id);
    const { entryPoint, opName, opOpts, setActualHandler, stepInfo } = await this.middlewareManager.applyToStep({
      displayName: opId.displayName ?? opId.userland.id,
      hashedId,
      memoized: Boolean(this.state.stepState[hashedId]) && typeof this.state.stepState[hashedId]?.input === "undefined",
      op: opId.op,
      opts: opId.opts,
      userlandId: opId.userland.id
    });
    if (opName !== void 0) opId.name = opName;
    if (opOpts !== void 0) opId.opts = opOpts;
    if (stepInfo.options.id !== originalId) {
      opId.id = stepInfo.options.id;
      opId.userland.id = stepInfo.options.id;
      const secondCollision = resolveStepIdCollision({
        baseId: stepInfo.options.id,
        expectedIndexes: expectedNextStepIndexes,
        stepsMap: this.state.steps
      });
      if (secondCollision.finalId !== stepInfo.options.id) {
        opId.id = secondCollision.finalId;
        opId.userland.id = secondCollision.finalId;
        stepInfo.options.id = secondCollision.finalId;
        if (secondCollision.index !== void 0) opId.userland.index = secondCollision.index;
      }
      hashedId = _internals.hashId(opId.id);
      stepInfo.hashedId = hashedId;
    }
    const stepState = this.state.stepState[hashedId];
    let isFulfilled = false;
    if (stepState) {
      stepState.seen = true;
      this.state.remainingStepsToBeSeen.delete(hashedId);
      if (this.state.allStateUsed()) await this.middlewareManager.onMemoizationEnd();
      if (typeof stepState.input === "undefined") isFulfilled = true;
      stepInfo.memoized = isFulfilled;
    } else stepInfo.memoized = false;
    const wrappedHandler = this.middlewareManager.buildWrapStepChain(entryPoint, stepInfo);
    return {
      hashedId,
      stepInfo,
      wrappedHandler,
      setActualHandler,
      stepState,
      isFulfilled
    };
  }
  resumeStepWithResult(resultOp, resume = true) {
    const userlandStep = this.state.steps.get(resultOp.id);
    if (!userlandStep) throw new Error("Step not found in memoization state during async checkpointing; this should never happen and is a bug in the Inngest SDK");
    userlandStep.data = undefinedToNull(resultOp.data);
    userlandStep.timing = resultOp.timing;
    userlandStep.op = resultOp.op;
    userlandStep.id = resultOp.id;
    userlandStep.metadata = resultOp.metadata;
    if (resume) {
      userlandStep.fulfilled = true;
      userlandStep.hasStepState = true;
      this.state.stepState[resultOp.id] = userlandStep;
      userlandStep.handle();
    }
    return userlandStep;
  }
  getUserFnToRun() {
    switch (this.options.handlerKind) {
      case "defer":
        return this.options.fn["fn"];
      case "failure":
        if (!this.options.fn["onFailureFn"])
          throw new Error("Cannot find function `onFailure` handler");
        return this.options.fn["onFailureFn"];
      default:
        return this.options.fn["fn"];
    }
  }
  initializeTimer(state) {
    if (!this.options.requestedRunStep) return;
    this.timeout = createTimeoutPromise(this.timeoutDuration);
    this.timeout.then(async () => {
      await this.middlewareManager.onMemoizationEnd();
      const { foundSteps, totalFoundSteps } = this.getStepNotFoundDetails();
      state.setCheckpoint({
        type: "step-not-found",
        step: {
          id: this.options.requestedRunStep,
          op: StepOpCode.StepNotFound
        },
        foundSteps,
        totalFoundSteps
      });
    });
  }
  getStepNotFoundDetails() {
    const foundSteps = [...this.state.steps.values()].filter((step2) => !step2.hasStepState).map((step2) => ({
      id: step2.hashedId,
      name: step2.name,
      displayName: step2.displayName
    })).sort((a2, b2) => a2.id.localeCompare(b2.id));
    return {
      foundSteps: foundSteps.slice(0, STEP_NOT_FOUND_MAX_FOUND_STEPS),
      totalFoundSteps: foundSteps.length
    };
  }
  initializeCheckpointRuntimeTimer(state) {
    this.devDebug("initializing checkpointing runtime timers", this.options.checkpointingConfig);
    if (this.options.checkpointingConfig?.maxRuntime) {
      const maxRuntimeMs = isTemporalDuration(this.options.checkpointingConfig.maxRuntime) ? this.options.checkpointingConfig.maxRuntime.total({ unit: "milliseconds" }) : typeof this.options.checkpointingConfig.maxRuntime === "string" ? (0, import_ms3.default)(this.options.checkpointingConfig.maxRuntime) : this.options.checkpointingConfig.maxRuntime;
      if (Number.isFinite(maxRuntimeMs) && maxRuntimeMs > 0) {
        this.checkpointingMaxRuntimeTimer = createTimeoutPromise(maxRuntimeMs);
        this.checkpointingMaxRuntimeTimer.then(async () => {
          await this.middlewareManager.onMemoizationEnd();
          state.setCheckpoint({ type: "checkpointing-runtime-reached" });
        });
      }
    }
    if (this.options.checkpointingConfig?.maxInterval) {
      const maxIntervalMs = isTemporalDuration(this.options.checkpointingConfig.maxInterval) ? this.options.checkpointingConfig.maxInterval.total({ unit: "milliseconds" }) : typeof this.options.checkpointingConfig.maxInterval === "string" ? (0, import_ms3.default)(this.options.checkpointingConfig.maxInterval) : this.options.checkpointingConfig.maxInterval;
      if (Number.isFinite(maxIntervalMs) && maxIntervalMs > 0) {
        this.checkpointingMaxBufferIntervalTimer = createTimeoutPromise(maxIntervalMs);
        this.checkpointingMaxBufferIntervalTimer.then(async () => {
          state.setCheckpoint({ type: "checkpointing-buffer-interval-reached" });
          this.checkpointingMaxBufferIntervalTimer?.reset();
        });
      }
    }
  }
};
var hashId = (id) => {
  return sha1().update(id).digest("hex");
};
var hashOp = (op) => {
  return {
    ...op,
    id: hashId(op.id)
  };
};
function resolveStepIdCollision({ baseId, expectedIndexes, stepsMap }) {
  const hashedBaseId = hashId(baseId);
  if (!stepsMap.has(hashedBaseId) && !expectedIndexes.has(baseId)) {
    expectedIndexes.set(baseId, 1);
    return { finalId: baseId };
  }
  const expectedNextIndex = expectedIndexes.get(baseId) ?? 1;
  const maxIndex = expectedNextIndex + stepsMap.size + 1;
  for (let i2 = expectedNextIndex; i2 < maxIndex; i2++) {
    const indexedId = baseId + STEP_INDEXING_SUFFIX + i2;
    const hashedIndexedId = hashId(indexedId);
    if (!stepsMap.has(hashedIndexedId)) {
      expectedIndexes.set(baseId, i2 + 1);
      return {
        finalId: indexedId,
        index: i2
      };
    }
  }
  throw new UnreachableError(`Could not resolve step ID collision for "${baseId}" after ${stepsMap.size + 1} attempts`);
}
function isNonEmpty(arr) {
  return arr.length > 0;
}
var _internals = {
  hashOp,
  hashId,
  resolveStepIdCollision
};

// node_modules/inngest/components/InngestFunction.js
var InngestFunction = class InngestFunction2 {
  static stepId = "step";
  static failureSuffix = "-failure";
  get [Symbol.toStringTag]() {
    return InngestFunction2.Tag;
  }
  opts;
  fn;
  onFailureFn;
  client;
  /**
  * A stateless Inngest function, wrapping up function configuration and any
  * in-memory steps to run when triggered.
  *
  * This function can be "registered" to create a handler that Inngest can
  * trigger remotely.
  */
  constructor(client, opts, fn2) {
    this.client = client;
    this.opts = opts;
    this.fn = fn2;
    this.onFailureFn = this.opts.onFailure;
    if (this.opts.optimizeParallelism === false) warnOnce(this.client[internalLoggerSymbol], `optimize-parallelism-deprecated:${this.opts.id}`, '`optimizeParallelism: false` is deprecated; use `group.parallel({ mode: "race" }, ...)` for race semantics instead');
  }
  /**
  * The generated or given ID for this function.
  */
  id(prefix) {
    return [prefix, this.opts.id].filter(Boolean).join("-");
  }
  /**
  * The generated or given ID for this function, prefixed with the app ID. This
  * is used for routing invokes and identifying the function across apps.
  */
  get absoluteId() {
    return this.id(this.client.id);
  }
  /**
  * The name of this function as it will appear in the Inngest Cloud UI.
  */
  get name() {
    return this.opts.name || this.id();
  }
  /**
  * The description of this function.
  */
  get description() {
    return this.opts.description;
  }
  /**
  * Retrieve the Inngest config for this function.
  */
  getConfig({ baseUrl, appPrefix, isConnect }) {
    const fnId = this.id(appPrefix);
    const stepUrl = new URL(baseUrl.href);
    stepUrl.searchParams.set(queryKeys.FnId, fnId);
    stepUrl.searchParams.set(queryKeys.StepId, InngestFunction2.stepId);
    const { retries: attempts, cancelOn, idempotency, batchEvents, rateLimit, throttle, concurrency, debounce, timeouts, priority, singleton } = this.opts;
    const retries = typeof attempts === "undefined" ? void 0 : { attempts };
    const triggers = this.getConfigTriggers(fnId);
    const fn2 = {
      id: fnId,
      name: this.name,
      triggers,
      steps: { [InngestFunction2.stepId]: {
        id: InngestFunction2.stepId,
        name: InngestFunction2.stepId,
        runtime: {
          type: isConnect ? "ws" : "http",
          url: stepUrl.href
        },
        retries
      } },
      idempotency,
      batchEvents,
      rateLimit,
      throttle,
      concurrency,
      debounce,
      priority,
      timeouts,
      singleton
    };
    if (cancelOn) fn2.cancel = cancelOn.map(({ event, timeout, if: ifStr, match }) => {
      let eventName;
      if (typeof event === "string") eventName = event;
      else eventName = event.name;
      const ret = { event: eventName };
      if (timeout) ret.timeout = timeStr(timeout);
      if (match) ret.if = `event.${match} == async.${match}`;
      else if (ifStr) ret.if = ifStr;
      return ret;
    }, []);
    const config = [fn2];
    if (this.onFailureFn) {
      const id = `${fn2.id}${InngestFunction2.failureSuffix}`;
      const name = `${fn2.name ?? fn2.id} (failure)`;
      const failureStepUrl = new URL(stepUrl.href);
      failureStepUrl.searchParams.set(queryKeys.FnId, id);
      config.push({
        id,
        name,
        triggers: [{
          event: internalEvents.FunctionFailed,
          expression: `event.data.function_id == '${fnId}'`
        }],
        steps: { [InngestFunction2.stepId]: {
          id: InngestFunction2.stepId,
          name: InngestFunction2.stepId,
          runtime: {
            type: "http",
            url: failureStepUrl.href
          },
          retries: { attempts: 1 }
        } }
      });
    }
    return config;
  }
  /**
  * Build the trigger list for this function's `getConfig` payload. Subclasses
  * (e.g. `DeferredFunction`) override this to emit implicit triggers.
  */
  getConfigTriggers(_fnId) {
    const triggers = [];
    for (const trigger of this.opts.triggers ?? []) {
      if (trigger.cron) {
        const cronTrigger = trigger;
        triggers.push({
          cron: cronTrigger.cron,
          ...cronTrigger.jitter ? { jitter: cronTrigger.jitter } : {}
        });
        continue;
      }
      if (!trigger.event) continue;
      let eventName = trigger.event;
      if (eventName instanceof EventType) eventName = eventName.name;
      if (eventName === internalEvents.FunctionInvoked) continue;
      triggers.push({
        event: eventName,
        expression: trigger.if
      });
    }
    return triggers;
  }
  createExecution(opts) {
    return createExecutionEngine({
      fn: this,
      ...opts.partialOptions
    });
  }
  shouldOptimizeParallelism() {
    return this.opts.optimizeParallelism ?? this.client["options"].optimizeParallelism ?? true;
  }
  shouldAsyncCheckpoint(requestedRunStep, internalFnId, disableImmediateExecution, defaultMaxRuntime) {
    if (requestedRunStep || !internalFnId || disableImmediateExecution) return;
    const userCfg = this.opts.checkpointing ?? this.client["options"].checkpointing ?? this.opts.experimentalCheckpointing ?? this.client["options"].experimentalCheckpointing ?? true;
    if (!userCfg) return;
    if (userCfg === true) return {
      ...defaultCheckpointingOptions,
      maxRuntime: defaultMaxRuntime
    };
    return {
      bufferedSteps: userCfg.bufferedSteps ?? defaultCheckpointingOptions.bufferedSteps,
      maxRuntime: userCfg.maxRuntime ?? defaultMaxRuntime,
      maxInterval: userCfg.maxInterval ?? defaultCheckpointingOptions.maxInterval
    };
  }
};
(function(_InngestFunction) {
  _InngestFunction.Tag = "Inngest.Function";
})(InngestFunction || (InngestFunction = {}));

// node_modules/inngest/components/InngestCommHandler.js
var internalServerErrorResponse = {
  body: stringify$1({ code: "internal_server_error" }),
  headers: { "Content-Type": "application/json" },
  status: 500,
  version: void 0
};
var registerResSchema = external_exports.object({
  status: external_exports.number().default(200),
  skipped: external_exports.boolean().optional().default(false),
  modified: external_exports.boolean().optional().default(false),
  error: external_exports.string().default("Successfully registered")
});
var InngestCommHandler = class {
  /**
  * The handler specified during instantiation of the class.
  */
  handler;
  /**
  * The URL of the Inngest function registration endpoint.
  */
  inngestRegisterUrl;
  /**
  * The name of the framework this handler is designed for. Should be
  * lowercase, alphanumeric characters inclusive of `-` and `/`.
  */
  frameworkName;
  /**
  * The origin used to access the Inngest serve endpoint, e.g.:
  *
  *     "https://myapp.com" or "https://myapp.com:1234"
  *
  * By default, the library will try to infer this using request details such
  * as the "Host" header and request path, but sometimes this isn't possible
  * (e.g. when running in a more controlled environments such as AWS Lambda or
  * when dealing with proxies/redirects).
  *
  * Provide the custom origin here to ensure that the path is reported
  * correctly when registering functions with Inngest.
  *
  * To also provide a custom path, use `servePath`.
  */
  _serveOrigin;
  /**
  * The path to the Inngest serve endpoint. e.g.:
  *
  *     "/some/long/path/to/inngest/endpoint"
  *
  * By default, the library will try to infer this using request details such
  * as the "Host" header and request path, but sometimes this isn't possible
  * (e.g. when running in a more controlled environments such as AWS Lambda or
  * when dealing with proxies/redirects).
  *
  * Provide the custom path (excluding the hostname) here to ensure that the
  * path is reported correctly when registering functions with Inngest.
  *
  * To also provide a custom hostname, use `serveOrigin`.
  */
  _servePath;
  streaming;
  /**
  * Whether unauthenticated `PUT` (sync) requests are accepted. Set via the
  * `enableUnauthedSync` serve option or `INNGEST_ENABLE_UNAUTHED_SYNC` env
  * var; serve option wins. Only applies in cloud mode.
  *
  * `undefined` here means "unset" — the env var is consulted at request
  * time so it picks up dynamic values in edge environments.
  */
  enableUnauthedSync;
  /**
  * A private collection of just Inngest functions, as they have been passed
  * when instantiating the class.
  */
  rawFns;
  client;
  /**
  * A private collection of functions that are being served. This map is used
  * to find and register functions when interacting with Inngest Cloud.
  */
  fns = {};
  env = getProcessEnv();
  allowExpiredSignatures;
  _options;
  skipSignatureValidation;
  defaultMaxRuntime;
  constructor(options) {
    this._options = options;
    if (Object.hasOwn(options, "eventKey")) throw new Error(`${logPrefix} You've passed an Inngest client as the first argument to your serve handler. This is no longer supported in v3; please pass the Inngest client as the \`client\` property of an options object instead. See https://www.inngest.com/docs/sdk/migration`);
    this.frameworkName = options.frameworkName;
    this.client = options.client;
    this.defaultMaxRuntime = options.defaultMaxRuntime ?? DefaultMaxRuntime.serve;
    this.handler = options.handler;
    this.allowExpiredSignatures = Boolean(arguments["0"]?.__testingAllowExpiredSignatures);
    this.rawFns = options.functions?.filter(Boolean) ?? [];
    if (this.rawFns.length !== (options.functions ?? []).length) this.client[internalLoggerSymbol].warn(`Some functions passed to serve() are undefined and misconfigured.  Please check your imports.`);
    const entries = {};
    for (const fn2 of this.rawFns) {
      const isDefer = isDeferredFunction(fn2);
      const failureId = `${fn2.id(this.client.id)}${InngestFunction.failureSuffix}`;
      const configs = fn2["getConfig"]({
        baseUrl: new URL("https://example.com"),
        appPrefix: this.client.id
      });
      for (const { id } of configs) {
        if (entries[id]) throw new Error(`Duplicate function ID "${id}"; please change a function's name or provide an explicit ID to avoid conflicts.`);
        let handlerKind;
        if (isDefer) handlerKind = "defer";
        else if (id === failureId) handlerKind = "failure";
        else handlerKind = "main";
        entries[id] = {
          fn: fn2,
          handlerKind
        };
      }
    }
    this.fns = entries;
    this.inngestRegisterUrl = new URL("/fn/register", this.client.apiBaseUrl);
    this._serveOrigin = options.serveOrigin || this.env[envKeys.InngestServeOrigin];
    this._servePath = options.servePath || this.env[envKeys.InngestServePath];
    this.skipSignatureValidation = options.skipSignatureValidation || false;
    const defaultStreamingOption = false;
    this.streaming = external_exports.boolean().default(defaultStreamingOption).catch((ctx) => {
      this.client[internalLoggerSymbol].warn({
        input: ctx.input,
        default: defaultStreamingOption
      }, "Unknown streaming option; using default");
      return defaultStreamingOption;
    }).parse(options.streaming || parseAsBoolean(this.env[envKeys.InngestStreaming]));
    this.enableUnauthedSync = options.enableUnauthedSync;
    this.client.setEnvVars(this.env);
  }
  /**
  * The origin used to access the Inngest serve endpoint, e.g.:
  *
  *     "https://myapp.com"
  *
  * By default, the library will try to infer this using request details such
  * as the "Host" header and request path, but sometimes this isn't possible
  * (e.g. when running in a more controlled environments such as AWS Lambda or
  * when dealing with proxies/redirects).
  *
  * Provide the custom origin here to ensure that the path is reported
  * correctly when registering functions with Inngest.
  *
  * To also provide a custom path, use `servePath`.
  */
  get serveOrigin() {
    if (this._serveOrigin) return this._serveOrigin;
    const envOrigin = this.env[envKeys.InngestServeOrigin];
    if (envOrigin) return envOrigin;
    const envHost = this.env[envKeys.InngestServeHost];
    if (envHost) {
      warnOnce(this.client[internalLoggerSymbol], "serve-host-deprecated", "INNGEST_SERVE_HOST is deprecated; use INNGEST_SERVE_ORIGIN instead");
      return envHost;
    }
  }
  /**
  * The path to the Inngest serve endpoint. e.g.:
  *
  *     "/some/long/path/to/inngest/endpoint"
  *
  * By default, the library will try to infer this using request details such
  * as the "Host" header and request path, but sometimes this isn't possible
  * (e.g. when running in a more controlled environments such as AWS Lambda or
  * when dealing with proxies/redirects).
  *
  * Provide the custom path (excluding the hostname) here to ensure that the
  * path is reported correctly when registering functions with Inngest.
  *
  * To also provide a custom hostname, use `serveOrigin`.
  *
  * This is a getter to encourage checking the environment for the serve path
  * each time it's accessed, as it may change during execution.
  */
  get servePath() {
    return this._servePath || this.env[envKeys.InngestServePath];
  }
  get hashedEventKey() {
    if (!this.client.eventKey) return;
    return hashEventKey(this.client.eventKey);
  }
  get hashedSigningKey() {
    if (!this.client.signingKey) return;
    return hashSigningKey(this.client.signingKey);
  }
  get hashedSigningKeyFallback() {
    if (!this.client.signingKeyFallback) return;
    return hashSigningKey(this.client.signingKeyFallback);
  }
  /**
  * Returns a `boolean` representing whether this handler will stream responses
  * or not. Takes into account the user's preference and the platform's
  * capabilities.
  */
  async shouldStream(actions) {
    if (await actions.queryStringWithDefaults("testing for probe", queryKeys.Probe) !== void 0) return false;
    const envStreaming = this.env[envKeys.InngestStreaming];
    if (envStreaming === "allow" || envStreaming === "force") warnOnce(this.client[internalLoggerSymbol], "streaming-allow-force-deprecated", { value: envStreaming }, `INNGEST_STREAMING="${envStreaming}" is deprecated; set INNGEST_STREAMING=true instead`);
    const streamingRequested = this.streaming === true || parseAsBoolean(this.env[envKeys.InngestStreaming]) === true || envStreaming === "allow" || envStreaming === "force";
    if (!actions.transformStreamingResponse) {
      if (streamingRequested) throw new Error(`${logPrefix} Streaming has been forced but the serve handler does not support streaming. Please either remove the streaming option or use a serve handler that supports streaming.`);
      return false;
    }
    return streamingRequested;
  }
  async isInngestReq(actions) {
    const reqMessage = `checking if this is an Inngest request`;
    const [runId, signature] = await Promise.all([actions.headers(reqMessage, headerKeys.InngestRunId), actions.headers(reqMessage, headerKeys.Signature)]);
    return Boolean(runId && typeof signature === "string");
  }
  /**
  * Start handling a request, setting up environments, modes, and returning
  * some helpers.
  */
  async initRequest(...args) {
    const timer = new ServerTiming(this.client[internalLoggerSymbol]);
    const actions = await this.getActions(timer, ...args);
    const [env, expectedServerKind] = await Promise.all([actions.env?.("starting to handle request"), actions.headers("checking expected server kind", headerKeys.InngestServerKind)]);
    this.env = protectEnv({
      ...getProcessEnv(),
      ...env
    });
    this.client.setEnvVars(this.env);
    const headerPromises = forwardedHeaders.map(async (header) => {
      return {
        header,
        value: await actions.headers(`fetching ${header} for forwarding`, header)
      };
    });
    const headersToForwardP = Promise.all(headerPromises).then((fetchedHeaders) => {
      return fetchedHeaders.reduce((acc, { header, value }) => {
        if (value) acc[header] = value;
        return acc;
      }, {});
    });
    const getHeaders = async () => ({
      ...inngestHeaders({
        env: this.env,
        framework: this.frameworkName,
        client: this.client,
        expectedServerKind: expectedServerKind || void 0,
        extras: { "Server-Timing": timer.getHeader() }
      }),
      ...await headersToForwardP
    });
    return {
      timer,
      actions,
      getHeaders
    };
  }
  /**
  * `createSyncHandler` should be used to return a type-equivalent version of
  * the `handler` specified during instantiation.
  */
  createSyncHandler() {
    return (handler2) => {
      return this.wrapHandler((async (...args) => {
        const reqInit = await this.initRequest(...args);
        const fn2 = new InngestFunction(this.client, {
          id: this._options.syncOptions?.functionId ?? "",
          retries: this._options.syncOptions?.retries ?? defaultMaxRetries
        }, () => handler2(...args));
        if (await this.isInngestReq(reqInit.actions)) return this.handleAsyncRequest({
          ...reqInit,
          forceExecution: true,
          args,
          fns: [fn2]
        });
        return this.handleSyncRequest({
          ...reqInit,
          args,
          asyncMode: this._options.syncOptions?.asyncResponse ?? AsyncResponseType.Redirect,
          asyncRedirectUrl: this._options.syncOptions?.asyncRedirectUrl,
          fn: fn2
        });
      }));
    };
  }
  /**
  * `createHandler` should be used to return a type-equivalent version of the
  * `handler` specified during instantiation.
  *
  * @example
  * ```
  * // my-custom-handler.ts
  * import {
  *   InngestCommHandler,
  *   type ServeHandlerOptions,
  * } from "./components/InngestCommHandler";
  *
  * export const serve = (options: ServeHandlerOptions) => {
  *   const handler = new InngestCommHandler({
  *     frameworkName: "my-custom-handler",
  *     ...options,
  *     handler: (req: Request) => {
  *       return {
  *         body: () => req.json(),
  *         headers: (key) => req.headers.get(key),
  *         method: () => req.method,
  *         url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
  *         transformResponse: ({ body, status, headers }) => {
  *           return new Response(body, { status, headers });
  *         },
  *       };
  *     },
  *   });
  *
  *   return handler.createHandler();
  * };
  * ```
  */
  createHandler() {
    return this.wrapHandler((async (...args) => {
      return this.handleAsyncRequest({
        ...await this.initRequest(...args),
        args
      });
    }));
  }
  /**
  * Given a set of actions that let us access the incoming request, create an
  * event that repesents a run starting from an HTTP request.
  */
  async createHttpEvent(actions, fn2) {
    const reason = "creating sync event";
    const contentTypePromise = actions.headers(reason, headerKeys.ContentType).then((v2) => v2 ?? "");
    const ipPromise = actions.headers(reason, headerKeys.ForwardedFor).then((v2) => {
      if (v2) return v2;
      return actions.headers(reason, headerKeys.RealIp).then((v$1) => v$1 ?? "");
    });
    const methodPromise = actions.method(reason);
    const urlPromise = actions.url(reason).then((v2) => this.reqUrl(v2));
    const domainPromise = urlPromise.then((url) => `${url.protocol}//${url.host}`);
    const pathPromise = urlPromise.then((url) => url.pathname);
    const queryParamsPromise = urlPromise.then((url) => url.searchParams.toString());
    const bodyPromise = actions.body(reason).then((body$1) => {
      return typeof body$1 === "string" ? body$1 : stringify$1(body$1);
    });
    const [contentType, domain, ip, method, path, queryParams, body] = await Promise.all([
      contentTypePromise,
      domainPromise,
      ipPromise,
      methodPromise,
      pathPromise,
      queryParamsPromise,
      bodyPromise
    ]);
    return {
      name: internalEvents.HttpRequest,
      data: {
        content_type: contentType,
        domain,
        ip,
        method,
        path,
        query_params: queryParams,
        body,
        fn: fn2.id()
      }
    };
  }
  async handleSyncRequest({ timer, actions, fn: fn2, asyncMode, asyncRedirectUrl, args }) {
    if (!actions.experimentalTransformSyncResponse) throw new Error("This platform does not support synchronous Inngest function executions.");
    if (await getAsyncCtx()) throw new Error("We already seem to be in the context of an Inngest execution, but didn't expect to be. Did you already wrap this handler?");
    const { ulid: ulid2 } = await Promise.resolve().then(() => (init_index_esm(), index_esm_exports));
    const runId = ulid2();
    const event = await this.createHttpEvent(actions, fn2);
    const acceptsSse = (await actions.headers("checking accept header", "Accept"))?.includes("text/event-stream") ?? false;
    const exeVersion = ExecutionVersion.V2;
    const result = await fn2["createExecution"]({ partialOptions: {
      client: this.client,
      data: {
        runId,
        event,
        attempt: 0,
        events: [event],
        maxAttempts: fn2.opts.retries ?? defaultMaxRetries
      },
      isDurableEndpoint: true,
      runId,
      headers: {},
      reqArgs: args,
      stepCompletionOrder: [],
      stepState: {},
      disableImmediateExecution: false,
      handlerKind: "main",
      acceptsSse,
      timer,
      createResponse: (data) => actions.experimentalTransformSyncResponse("creating sync execution", data).then((res) => ({
        ...res,
        version: exeVersion
      })),
      stepMode: StepMode.Sync
    } }).start();
    const resultHandler = {
      "step-not-found": () => {
        throw new Error("We should not get the result 'step-not-found' when checkpointing. This is a bug in the `inngest` SDK");
      },
      "steps-found": () => {
        throw new Error("We should not get the result 'steps-found' when checkpointing. This is a bug in the `inngest` SDK");
      },
      "step-ran": () => {
        throw new Error("We should not get the result 'step-ran' when checkpointing. This is a bug in the `inngest` SDK");
      },
      "function-rejected": (result$1) => {
        return actions.transformResponse("creating sync error response", {
          status: result$1.retriable ? 500 : 400,
          headers: {
            "Content-Type": "application/json",
            [headerKeys.NoRetry]: result$1.retriable ? "false" : "true",
            ...typeof result$1.retriable === "string" ? { [headerKeys.RetryAfter]: result$1.retriable } : {}
          },
          version: exeVersion,
          body: stringify$1(undefinedToNull(result$1.error))
        });
      },
      "function-resolved": ({ data }) => {
        if (data instanceof Response) return data;
        return actions.transformResponse("creating sync success response", {
          status: 200,
          headers: { "Content-Type": "application/json" },
          version: exeVersion,
          body: stringify$1(undefinedToNull(data))
        });
      },
      "change-mode": async ({ token }) => {
        switch (asyncMode) {
          case AsyncResponseType.Redirect: {
            let redirectUrl;
            if (asyncRedirectUrl) if (typeof asyncRedirectUrl === "function") redirectUrl = await asyncRedirectUrl({
              runId,
              token
            });
            else {
              const baseUrl = await actions.url("getting request origin");
              const url = new URL(asyncRedirectUrl, baseUrl.origin);
              url.searchParams.set("runId", runId);
              url.searchParams.set("token", token);
              redirectUrl = url.toString();
            }
            else redirectUrl = await this.client["inngestApi"]["getTargetUrl"](`/v1/http/runs/${runId}/output?token=${token}`).then((url) => url.toString());
            return actions.transformResponse("creating sync->async redirect response", {
              status: 302,
              headers: { [headerKeys.Location]: redirectUrl },
              version: exeVersion,
              body: ""
            });
          }
          case AsyncResponseType.Token:
            return actions.transformResponse("creating sync->async token response", {
              status: 200,
              headers: {},
              version: exeVersion,
              body: stringify$1({
                run_id: runId,
                token
              })
            });
          default:
            break;
        }
        throw new Error("Not implemented: change-mode");
      }
    }[result.type];
    if (!resultHandler) throw new Error(`No handler for execution result type: ${result.type}. This is a bug in the \`inngest\` SDK`);
    return resultHandler(result);
  }
  async handleAsyncRequest({ timer, actions, args, getHeaders, forceExecution, fns }) {
    if (forceExecution && !actions.experimentalTransformSyncResponse) throw new Error("This platform does not support async executions in Inngest for APIs.");
    const methodP = actions.method("starting to handle request");
    const [signature, method, body] = await Promise.all([
      actions.headers("checking signature for request", headerKeys.Signature).then((headerSignature) => {
        return headerSignature ?? void 0;
      }),
      methodP,
      methodP.then(async (method$1) => {
        if (method$1 === "POST" || method$1 === "PUT") {
          const body$1 = await actions.body(`checking body for request signing as method is ${method$1}`);
          if (!body$1) return "";
          if (typeof body$1 === "string") return JSON.parse(body$1);
          return body$1;
        }
        return "";
      })
    ]);
    const signatureValidation = this.validateSignature(signature, body);
    const mwInstances = this.client.middleware.map((Cls) => new Cls({ client: this.client }));
    const prepareActionRes = async (res) => {
      const headers = {
        ...await getHeaders(),
        ...res.headers,
        ...res.version === null ? {} : { [headerKeys.RequestVersion]: (res.version ?? PREFERRED_ASYNC_EXECUTION_VERSION).toString() }
      };
      let signature$1;
      try {
        signature$1 = await signatureValidation.then(async (result) => {
          if (!result.success || !result.keyUsed) return;
          return await this.getResponseSignature(result.keyUsed, res.body);
        });
      } catch (err2) {
        return {
          ...res,
          headers,
          body: stringify$1(serializeError$1(err2)),
          status: 500
        };
      }
      if (signature$1) headers[headerKeys.Signature] = signature$1;
      return {
        ...res,
        headers
      };
    };
    let actionResponseVersion;
    const handleAndPrepare = async () => {
      const rawRes = await timer.wrap("action", () => this.handleAction({
        actions,
        timer,
        getHeaders,
        reqArgs: args,
        signatureValidation,
        body,
        method,
        forceExecution: Boolean(forceExecution),
        fns,
        mwInstances
      }));
      actionResponseVersion = rawRes.version;
      const prepared = await prepareActionRes(rawRes);
      if (!(await signatureValidation).success) {
        const filteredHeaders = {};
        for (const [k2, v2] of Object.entries(prepared.headers)) {
          const lower = k2.toLowerCase();
          if (lower === "user-agent") continue;
          if (lower.startsWith("x-inngest-") && lower !== headerKeys.SdkHandled.toLowerCase()) continue;
          filteredHeaders[k2] = v2;
        }
        return {
          ...prepared,
          headers: filteredHeaders
        };
      }
      return prepared;
    };
    let chainResult;
    if (method === "POST") {
      const url = await actions.url("building requestInfo for middleware");
      const fnId = url.searchParams.get(queryKeys.FnId);
      const matchedFn = fnId ? this.fns[fnId] : void 0;
      const fnMw = matchedFn?.fn?.opts?.middleware ?? [];
      mwInstances.push(...fnMw.map((Cls) => {
        return new Cls({ client: this.client });
      }));
      const fn2 = matchedFn?.fn ?? null;
      const requestInfo = {
        headers: Object.freeze({ ...await getHeaders() }),
        method,
        url,
        body: () => Promise.resolve(body)
      };
      let runId = "";
      if (isRecord(body) && isRecord(body.ctx) && body.ctx.run_id && typeof body.ctx.run_id === "string") runId = body.ctx.run_id;
      const innerHandler = async () => {
        const prepared = await handleAndPrepare();
        return {
          status: prepared.status,
          headers: prepared.headers,
          body: prepared.body
        };
      };
      chainResult = buildWrapRequestChain({
        fn: fn2,
        handler: innerHandler,
        middleware: mwInstances,
        requestArgs: args,
        requestInfo,
        runId
      })();
    } else chainResult = handleAndPrepare().then((prepared) => ({
      status: prepared.status,
      headers: prepared.headers,
      body: prepared.body
    }));
    const safeChainResult = chainResult.catch((err2) => ({
      status: 500,
      headers: { "Content-Type": "application/json" },
      body: stringify$1({
        type: "internal",
        ...serializeError$1(err2)
      })
    }));
    let shouldStream;
    try {
      shouldStream = await this.shouldStream(actions);
    } catch (err2) {
      return actions.transformResponse("sending back response", {
        status: 500,
        headers: {
          ...await getHeaders(),
          "Content-Type": "application/json"
        },
        body: stringify$1(serializeError$1(err2)),
        version: void 0
      });
    }
    if (shouldStream) {
      if (await actions.method("starting streaming response") === "POST") {
        const { stream, finalize } = await createStream();
        safeChainResult.then((res) => {
          return finalize(Promise.resolve({
            ...res,
            version: actionResponseVersion
          }));
        });
        return timer.wrap("res", async () => {
          return actions.transformStreamingResponse?.("starting streaming response", {
            status: 201,
            headers: await getHeaders(),
            body: stream,
            version: null
          });
        });
      }
    }
    return timer.wrap("res", async () => {
      return safeChainResult.then((res) => {
        return actions.transformResponse("sending back response", {
          ...res,
          version: actionResponseVersion
        });
      });
    });
  }
  async getActions(timer, ...args) {
    const lastArg = args[args.length - 1];
    const actionOverrides = typeof lastArg === "object" && lastArg !== null && "actionOverrides" in lastArg && typeof lastArg["actionOverrides"] === "object" && lastArg["actionOverrides"] !== null ? lastArg["actionOverrides"] : {};
    const rawActions = {
      ...await timer.wrap("handler", () => this.handler(...args)).catch(rethrowError("Serve handler failed to run")),
      ...actionOverrides
    };
    const actions = {
      ...Object.entries(rawActions).reduce((acc, [key, value]) => {
        if (typeof value !== "function") return acc;
        return {
          ...acc,
          [key]: (reason, ...args$1) => {
            const errMessage = [`Failed calling \`${key}\` from serve handler`, reason].filter(Boolean).join(" when ");
            const fn2 = () => value(...args$1);
            return runAsPromise(fn2).catch(rethrowError(errMessage)).catch((err2) => {
              this.client[internalLoggerSymbol].error({ err: err2 }, errMessage);
              throw err2;
            });
          }
        };
      }, {}),
      queryStringWithDefaults: async (reason, key) => {
        const url = await actions.url(reason);
        return await actions.queryString?.(reason, key, url) || url.searchParams.get(key) || void 0;
      },
      ...actionOverrides
    };
    return actions;
  }
  wrapHandler(handler2) {
    Object.defineProperties(handler2, {
      name: { value: "InngestHandler" },
      length: { value: this.handler.length }
    });
    return handler2;
  }
  /**
  * Given a set of functions to check if an action is available from the
  * instance's handler, enact any action that is found.
  *
  * This method can fetch varying payloads of data, but ultimately is the place
  * where _decisions_ are made regarding functionality.
  *
  * For example, if we find that we should be viewing the UI, this function
  * will decide whether the UI should be visible based on the payload it has
  * found (e.g. env vars, options, etc).
  */
  async handleAction({ actions, timer, getHeaders, reqArgs, signatureValidation, body: rawBody, method, forceExecution, fns, mwInstances }) {
    if (!this.checkModeConfiguration()) return internalServerErrorResponse;
    const isMissingBody = !rawBody;
    let body = rawBody;
    try {
      let url = await actions.url("starting to handle request");
      const enableUnauthedSync = this.enableUnauthedSync ?? parseAsBoolean(this.env[envKeys.InngestEnableUnauthedSync]) ?? true;
      if (this.client.mode === "cloud" && !enableUnauthedSync) {
        const sigCheck = await signatureValidation;
        if (!sigCheck.success) {
          this.client[internalLoggerSymbol].error({
            err: sigCheck.err,
            method
          }, "Signature validation failed");
          return unauthorizedResponse;
        }
      }
      if (method === "POST" || forceExecution) {
        if (!forceExecution && isMissingBody) {
          this.client[internalLoggerSymbol].error("Missing body when executing, possibly due to missing request body middleware");
          return unauthorizedResponse;
        }
        const validationResult = await signatureValidation;
        if (!validationResult.success) {
          this.client[internalLoggerSymbol].error({
            err: validationResult.err,
            method
          }, "Signature validation failed");
          return unauthorizedResponse;
        }
        let fn2;
        let fnId;
        if (forceExecution) {
          fn2 = fns?.length && fns[0] ? {
            fn: fns[0],
            handlerKind: "main"
          } : Object.values(this.fns)[0];
          fnId = fn2?.fn.id();
          let die = false;
          const dieHeader = await actions.headers("getting step plan force control for forced execution", headerKeys.InngestForceStepPlan);
          if (dieHeader) {
            const parsed = parseAsBoolean(dieHeader);
            if (typeof parsed === "boolean") die = parsed;
            else this.client[internalLoggerSymbol].warn({
              header: headerKeys.InngestForceStepPlan,
              value: dieHeader
            }, "Invalid boolean header value; defaulting to false");
          }
          body = {
            event: {},
            events: [],
            steps: {},
            version: PREFERRED_ASYNC_EXECUTION_VERSION,
            sdkDecided: true,
            ctx: {
              attempt: 0,
              disable_immediate_execution: die,
              use_api: true,
              max_attempts: Infinity,
              run_id: await actions.headers("getting run ID for forced execution", headerKeys.InngestRunId),
              stack: {
                stack: [],
                current: 0
              }
            }
          };
        } else {
          const rawProbe = await actions.queryStringWithDefaults("testing for probe", queryKeys.Probe);
          if (rawProbe) {
            const probe$1 = enumFromValue(probe, rawProbe);
            if (!probe$1) return {
              status: 400,
              headers: { "Content-Type": "application/json" },
              body: stringify$1(serializeError$1(/* @__PURE__ */ new Error(`Unknown probe "${rawProbe}"`))),
              version: void 0
            };
            return { [probe.Trust]: () => ({
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: "",
              version: void 0
            }) }[probe$1]();
          }
          fnId = await actions.queryStringWithDefaults("processing run request", queryKeys.FnId);
          if (!fnId) throw new Error("No function ID found in async request");
          fn2 = this.fns[fnId];
        }
        if (typeof fnId === "undefined" || !fn2) throw new Error("No function ID found in request");
        const stepId = await actions.queryStringWithDefaults("processing run request", queryKeys.StepId) || await actions.headers("processing run request", headerKeys.InngestStepId) || null;
        let headerReqVersion;
        try {
          const rawVersionHeader = await actions.headers("processing run request", headerKeys.RequestVersion);
          if (rawVersionHeader && Number.isFinite(Number(rawVersionHeader))) {
            const res = createVersionSchema(this.client[internalLoggerSymbol]).parse(Number(rawVersionHeader));
            if (!res.sdkDecided) headerReqVersion = res.version;
          }
        } catch {
        }
        const resolvedHeaders = await getHeaders();
        const { version: version$1, result } = this.runStep({
          functionId: fnId,
          data: body,
          stepId,
          timer,
          reqArgs,
          headers: resolvedHeaders,
          fn: fn2,
          forceExecution,
          actions,
          headerReqVersion,
          requestInfo: {
            headers: Object.freeze({ ...resolvedHeaders }),
            method,
            url,
            body: () => Promise.resolve(body)
          },
          mwInstances
        });
        const stepOutput = await result;
        const opDataUndefinedToNull = (op) => {
          op.data = undefinedToNull(op.data);
          return op;
        };
        const handler2 = {
          "function-rejected": (result$1) => {
            return {
              status: result$1.retriable ? 500 : 400,
              headers: {
                "Content-Type": "application/json",
                [headerKeys.NoRetry]: result$1.retriable ? "false" : "true",
                ...typeof result$1.retriable === "string" ? { [headerKeys.RetryAfter]: result$1.retriable } : {}
              },
              body: stringify$1(undefinedToNull(result$1.error)),
              version: version$1
            };
          },
          "function-resolved": (result$1) => {
            if (forceExecution) {
              const runCompleteOp = {
                id: _internals.hashId("complete"),
                op: StepOpCode.RunComplete,
                data: undefinedToNull(result$1.data)
              };
              return {
                status: 206,
                headers: { "Content-Type": "application/json" },
                body: stringify$1(runCompleteOp),
                version: version$1
              };
            }
            return {
              status: 200,
              headers: { "Content-Type": "application/json" },
              body: stringify$1(undefinedToNull(result$1.data)),
              version: version$1
            };
          },
          "step-not-found": (result$1) => {
            let error = `Could not find step "${result$1.step.displayName || result$1.step.id}" to run; timed out.`;
            if (result$1.foundSteps.length > 0) {
              const foundStepsSummary = result$1.foundSteps.map((step2) => {
                return `${step2.displayName || step2.id} (${step2.id})`;
              }).join("\n");
              error = `${error} Found new steps: 
${foundStepsSummary}.`;
            }
            if (result$1.totalFoundSteps > result$1.foundSteps.length) error = `${error} (showing ${result$1.foundSteps.length} of ${result$1.totalFoundSteps})`;
            return {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                [headerKeys.NoRetry]: "false"
              },
              body: stringify$1({
                error,
                requestedStep: result$1.step.id,
                foundSteps: result$1.foundSteps,
                totalFoundSteps: result$1.totalFoundSteps
              }),
              version: version$1
            };
          },
          "step-ran": (result$1) => {
            const step2 = opDataUndefinedToNull(result$1.step);
            return {
              status: 206,
              headers: {
                "Content-Type": "application/json",
                ...typeof result$1.retriable !== "undefined" ? {
                  [headerKeys.NoRetry]: result$1.retriable ? "false" : "true",
                  ...typeof result$1.retriable === "string" ? { [headerKeys.RetryAfter]: result$1.retriable } : {}
                } : {}
              },
              body: stringify$1([step2]),
              version: version$1
            };
          },
          "steps-found": (result$1) => {
            const steps = result$1.steps.map(opDataUndefinedToNull);
            return {
              status: 206,
              headers: { "Content-Type": "application/json" },
              body: stringify$1(steps),
              version: version$1
            };
          },
          "change-mode": (result$1) => {
            return {
              status: 500,
              headers: {
                "Content-Type": "application/json",
                [headerKeys.NoRetry]: "true"
              },
              body: stringify$1({ error: `We wanted to change mode to "${result$1.to}", but this is not supported within the InngestCommHandler. This is a bug in the Inngest SDK.` }),
              version: version$1
            };
          }
        }[stepOutput.type];
        try {
          return await handler2(stepOutput);
        } catch (err2) {
          this.client[internalLoggerSymbol].error({ err: err2 }, "Error handling execution result");
          throw err2;
        }
      }
      const env = (await getHeaders())[headerKeys.Environment] ?? null;
      if (method === "GET") {
        if (this.client.mode === "cloud") {
          const validationResult = await signatureValidation;
          if (!validationResult.success) {
            this.client[internalLoggerSymbol].error({
              err: validationResult.err,
              method
            }, "Signature validation failed");
            return unauthorizedResponse;
          }
        }
        return {
          status: 200,
          body: stringify$1(await this.introspectionBody({
            actions,
            env,
            signatureValidation,
            url
          })),
          headers: { "Content-Type": "application/json" },
          version: void 0
        };
      }
      if (method === "PUT") {
        const [deployId, inBandSyncRequested] = await Promise.all([actions.queryStringWithDefaults("processing deployment request", queryKeys.DeployId).then((deployId$1) => {
          return deployId$1 === "undefined" ? void 0 : deployId$1;
        }), Promise.resolve(parseAsBoolean(this.env[envKeys.InngestAllowInBandSync])).then((allowInBandSync) => {
          if (allowInBandSync !== void 0 && !allowInBandSync) return syncKind.OutOfBand;
          return actions.headers("processing deployment request", headerKeys.InngestSyncKind);
        }).then((kind) => {
          return kind === syncKind.InBand;
        })]);
        if (inBandSyncRequested) {
          if (isMissingBody) {
            this.client[internalLoggerSymbol].error("Missing body when syncing, possibly due to missing request body middleware");
            return {
              status: 500,
              headers: { "Content-Type": "application/json" },
              body: stringify$1(serializeError$1(/* @__PURE__ */ new Error("Missing request body when syncing, possibly due to missing request body middleware"))),
              version: void 0
            };
          }
          const sigCheck = await signatureValidation;
          if (!sigCheck.success) {
            this.client[internalLoggerSymbol].error({
              err: sigCheck.err,
              method
            }, "Signature validation failed");
            return unauthorizedResponse;
          }
          const res = inBandSyncRequestBodySchema.safeParse(body);
          if (!res.success) return {
            status: 400,
            body: stringify$1({
              code: "invalid_request",
              message: res.error.message
            }),
            headers: { "Content-Type": "application/json" },
            version: void 0
          };
          url = this.reqUrl(new URL(res.data.url));
          return {
            status: 200,
            body: stringify$1(await this.inBandRegisterBody({
              actions,
              deployId,
              env,
              signatureValidation,
              url
            })),
            headers: {
              "Content-Type": "application/json",
              [headerKeys.InngestSyncKind]: syncKind.InBand
            },
            version: void 0
          };
        }
        const { status, message, modified } = await this.register(this.reqUrl(url), deployId, getHeaders);
        return {
          status,
          body: stringify$1({
            message,
            modified
          }),
          headers: {
            "Content-Type": "application/json",
            [headerKeys.InngestSyncKind]: syncKind.OutOfBand
          },
          version: void 0
        };
      }
    } catch (err2) {
      return {
        status: 500,
        body: stringify$1({
          type: "internal",
          ...serializeError$1(err2)
        }),
        headers: { "Content-Type": "application/json" },
        version: void 0
      };
    }
    this.client[internalLoggerSymbol].error({ method }, "Received unhandled HTTP method; expected POST, PUT, or GET");
    return {
      status: 405,
      body: JSON.stringify({ message: "Method not allowed" }),
      headers: { "Content-Type": "application/json" },
      version: void 0
    };
  }
  runStep({ actions, functionId, stepId, data, timer, reqArgs, headers, fn: fn2, forceExecution, headerReqVersion, requestInfo, mwInstances }) {
    const requestStartedAt = Date.now();
    if (!fn2) throw new Error(`Could not find function with ID "${functionId}"`);
    const immediateFnData = parseFnData(data, headerReqVersion, this.client[internalLoggerSymbol]);
    const { sdkDecided } = immediateFnData;
    let version$1 = ExecutionVersion.V2;
    if (version$1 === ExecutionVersion.V2 && sdkDecided && fn2.fn["shouldOptimizeParallelism"]?.() === false) version$1 = ExecutionVersion.V1;
    const result = runAsPromise(async () => {
      const anyFnData = await fetchAllFnData({
        data: immediateFnData,
        api: this.client["inngestApi"],
        logger: this.client[internalLoggerSymbol]
      });
      if (!anyFnData.ok) throw new Error(anyFnData.error);
      const createResponse = forceExecution && actions.experimentalTransformSyncResponse ? (data$1) => actions.experimentalTransformSyncResponse("created sync->async response", data$1).then((res) => ({
        ...res,
        version: version$1
      })) : void 0;
      const { defers, event, events, steps, ctx } = anyFnData.value;
      const requestId = await actions.headers("getting request ID for execution", headerKeys.RequestId);
      const rawGenerationId = await actions.headers("getting generation ID for execution", headerKeys.GenerationId);
      const parsedGenerationId = Number(rawGenerationId);
      const generationId = rawGenerationId && Number.isInteger(parsedGenerationId) ? parsedGenerationId : void 0;
      const jobId = await actions.headers("getting job ID for execution", headerKeys.InngestJobId);
      const stepState = Object.entries(steps ?? {}).reduce((acc, [id, result$1]) => {
        return {
          ...acc,
          [id]: result$1.type === "data" ? {
            id,
            data: result$1.data
          } : result$1.type === "input" ? {
            id,
            input: result$1.input
          } : {
            id,
            error: result$1.error
          }
        };
      }, {});
      const requestedRunStep = stepId === "step" ? void 0 : stepId || void 0;
      const checkpointingConfig = fn2.fn["shouldAsyncCheckpoint"](requestedRunStep, ctx?.fn_id, Boolean(ctx?.disable_immediate_execution), this.defaultMaxRuntime);
      const executionOptions = { partialOptions: {
        client: this.client,
        runId: ctx?.run_id || "",
        stepMode: checkpointingConfig ? StepMode.AsyncCheckpointing : StepMode.Async,
        checkpointingConfig,
        data: {
          event,
          events,
          runId: ctx?.run_id || "",
          attempt: ctx?.attempt ?? 0,
          maxAttempts: ctx?.max_attempts,
          requestId: requestId ?? void 0,
          jobId: jobId ?? void 0
        },
        internalFnId: ctx?.fn_id,
        isDurableEndpoint: forceExecution,
        queueItemId: ctx?.qi_id,
        requestId: requestId ?? void 0,
        generationId: generationId ?? void 0,
        requestStartedAt,
        stepState,
        priorDefers: defers,
        requestedRunStep,
        timer,
        handlerKind: fn2.handlerKind,
        disableImmediateExecution: ctx?.disable_immediate_execution,
        stepCompletionOrder: ctx?.stack?.stack ?? [],
        reqArgs,
        headers,
        createResponse,
        requestInfo,
        middlewareInstances: mwInstances
      } };
      return fn2.fn["createExecution"](executionOptions).start();
    });
    return {
      version: version$1,
      result
    };
  }
  configs(url) {
    const configs = this.rawFns.reduce((acc, fn2) => [...acc, ...fn2["getConfig"]({
      baseUrl: url,
      appPrefix: this.client.id
    })], []);
    for (const config of configs) {
      const check = functionConfigSchema.safeParse(config);
      if (!check.success) {
        const errors = check.error.errors.map((err2) => err2.message).join("; ");
        this.client[internalLoggerSymbol].warn({
          functionId: config.id,
          errors
        }, "Invalid function config");
      }
    }
    return configs;
  }
  /**
  * Return an Inngest serve endpoint URL given a potential `path` and `host`.
  *
  * Will automatically use the `serveOrigin` and `servePath` if they have been
  * set when registering.
  */
  reqUrl(url) {
    let ret = new URL(url);
    const servePath = this.servePath || this.env[envKeys.InngestServePath];
    if (servePath) ret.pathname = servePath;
    if (this.serveOrigin) ret = new URL(ret.pathname + ret.search, this.serveOrigin);
    return ret;
  }
  registerBody({ url, deployId }) {
    return {
      url: url.href,
      deployType: "ping",
      framework: this.frameworkName,
      appName: this.client.id,
      functions: this.configs(url),
      sdk: `js:v${version}`,
      v: "0.1",
      deployId: deployId || void 0,
      capabilities: {
        trust_probe: "v1",
        connect: "v1"
      },
      appVersion: this.client.appVersion
    };
  }
  async inBandRegisterBody({ actions, deployId, env, signatureValidation, url }) {
    const registerBody = this.registerBody({
      deployId,
      url
    });
    const introspectionBody = await this.introspectionBody({
      actions,
      env,
      signatureValidation,
      url
    });
    const body = {
      app_id: this.client.id,
      appVersion: this.client.appVersion,
      capabilities: registerBody.capabilities,
      env,
      framework: registerBody.framework,
      functions: registerBody.functions,
      inspection: introspectionBody,
      platform: getPlatformName({
        ...getProcessEnv(),
        ...this.env
      }),
      sdk_author: "inngest",
      sdk_language: "",
      sdk_version: "",
      sdk: registerBody.sdk,
      url: registerBody.url
    };
    if ("authentication_succeeded" in introspectionBody && introspectionBody.authentication_succeeded) {
      body.sdk_language = introspectionBody.sdk_language;
      body.sdk_version = introspectionBody.sdk_version;
    }
    return body;
  }
  async introspectionBody({ actions, env, signatureValidation, url }) {
    const registerBody = this.registerBody({
      url: this.reqUrl(url),
      deployId: null
    });
    if (!this.client.mode) throw new Error("No mode set; cannot introspect without mode");
    let introspection = {
      extra: { native_crypto: globalThis.crypto?.subtle ? true : false },
      has_event_key: this.client["eventKeySet"](),
      has_signing_key: Boolean(this.client.signingKey),
      function_count: registerBody.functions.length,
      mode: this.client.mode,
      schema_version: "2024-05-24"
    };
    if (this.client.mode === "cloud") try {
      if (!(await signatureValidation).success) throw new Error("Signature validation failed");
      let signingKeyHash = null;
      if (this.hashedSigningKey) signingKeyHash = removeSigningKeyPrefix(this.hashedSigningKey).slice(0, 12);
      let signingKeyFallbackHash = null;
      if (this.hashedSigningKeyFallback) signingKeyFallbackHash = removeSigningKeyPrefix(this.hashedSigningKeyFallback).slice(0, 12);
      introspection = {
        ...introspection,
        authentication_succeeded: true,
        api_origin: this.client.apiBaseUrl,
        app_id: this.client.id,
        capabilities: {
          trust_probe: "v1",
          connect: "v1"
        },
        env,
        event_api_origin: this.client.eventBaseUrl,
        event_key_hash: this.hashedEventKey ?? null,
        extra: {
          ...introspection.extra,
          is_streaming: await this.shouldStream(actions),
          native_crypto: globalThis.crypto?.subtle ? true : false
        },
        framework: this.frameworkName,
        sdk_language: "js",
        sdk_version: version,
        serve_origin: this.serveOrigin ?? null,
        serve_path: this.servePath ?? null,
        signing_key_fallback_hash: signingKeyFallbackHash,
        signing_key_hash: signingKeyHash
      };
    } catch {
      introspection = { ...introspection };
    }
    return introspection;
  }
  async register(url, deployId, getHeaders) {
    const body = this.registerBody({
      url,
      deployId
    });
    let res;
    const registerUrl = new URL(this.inngestRegisterUrl.href);
    if (deployId) registerUrl.searchParams.set(queryKeys.DeployId, deployId);
    try {
      res = await fetchWithAuthFallback({
        authToken: this.hashedSigningKey,
        authTokenFallback: this.hashedSigningKeyFallback,
        fetch: this.client.fetch,
        url: registerUrl.href,
        options: {
          method: "POST",
          body: stringify$1(body),
          headers: {
            ...await getHeaders(),
            [headerKeys.InngestSyncKind]: syncKind.OutOfBand
          },
          redirect: "follow"
        }
      });
    } catch (err2) {
      this.client[internalLoggerSymbol].error({ err: err2 }, "Failed to register");
      return {
        status: 500,
        message: `Failed to register${err2 instanceof Error ? `; ${err2.message}` : ""}`,
        modified: false
      };
    }
    const raw = await res.text();
    let data = {};
    try {
      data = JSON.parse(raw);
    } catch (err2) {
      this.client[internalLoggerSymbol].warn({ err: err2 }, "Couldn't unpack register response");
      let message = "Failed to register";
      if (err2 instanceof Error) message += `; ${err2.message}`;
      message += `; status code: ${res.status}`;
      return {
        status: 500,
        message,
        modified: false
      };
    }
    let status;
    let error;
    let skipped;
    let modified;
    try {
      ({ status, error, skipped, modified } = registerResSchema.parse(data));
    } catch (err2) {
      this.client[internalLoggerSymbol].warn({ err: err2 }, "Invalid register response schema");
      let message = "Failed to register";
      if (err2 instanceof Error) message += `; ${err2.message}`;
      message += `; status code: ${res.status}`;
      return {
        status: 500,
        message,
        modified: false
      };
    }
    if (!skipped) this.client[internalLoggerSymbol].debug("Registered inngest functions");
    return {
      status,
      message: error,
      modified
    };
  }
  /**
  * Check that the current mode has the configuration it requires.
  * Returns `true` if valid, `false` if not.
  */
  checkModeConfiguration() {
    this.client.setEnvVars(this.env);
    return checkModeConfiguration({
      mode: this.client.mode,
      signingKey: this.client.signingKey,
      internalLogger: this.client[internalLoggerSymbol]
    });
  }
  /**
  * Validate the signature of a request and return the signing key used to
  * validate it.
  */
  async validateSignature(sig, body) {
    try {
      if (this.skipSignatureValidation) return {
        success: true,
        keyUsed: ""
      };
      if (this.client.mode !== "cloud") return {
        success: true,
        keyUsed: ""
      };
      if (!this.client.signingKey) throw new Error(`No signing key found in client options or ${envKeys.InngestSigningKey} env var. Find your keys at https://app.inngest.com/env/production/manage/signing-key`);
      if (!sig) throw new Error(`No ${headerKeys.Signature} provided`);
      return {
        success: true,
        keyUsed: await new RequestSignature(sig).verifySignature({
          body,
          allowExpiredSignatures: this.allowExpiredSignatures,
          signingKey: this.client.signingKey,
          signingKeyFallback: this.client.signingKeyFallback,
          logger: this.client[internalLoggerSymbol]
        })
      };
    } catch (err2) {
      return {
        success: false,
        err: err2
      };
    }
  }
  async getResponseSignature(key, body) {
    const now = Math.round(Date.now() / 1e3);
    return `t=${now}&s=${await signDataWithKey(body, key, now.toString(), this.client[internalLoggerSymbol])}`;
  }
};
var RequestSignature = class {
  timestamp;
  signature;
  constructor(sig) {
    const params = new URLSearchParams(sig);
    this.timestamp = params.get("t") || "";
    this.signature = params.get("s") || "";
    if (!this.timestamp || !this.signature) throw new Error(`Invalid ${headerKeys.Signature} provided`);
  }
  hasExpired(allowExpiredSignatures) {
    if (allowExpiredSignatures) return false;
    const ts2 = Number.parseInt(this.timestamp, 10);
    if (!Number.isFinite(ts2)) return true;
    const delta = Date.now() - ts2 * 1e3;
    return Math.abs(delta) > 1e3 * 60 * 5;
  }
  async #verifySignature({ body, signingKey, allowExpiredSignatures, logger }) {
    if (this.hasExpired(allowExpiredSignatures)) throw new Error("Signature has expired");
    if (!timingSafeEqual(await signDataWithKey(body, signingKey, this.timestamp, logger), this.signature)) throw new Error("Invalid signature");
  }
  async verifySignature({ body, signingKey, signingKeyFallback, allowExpiredSignatures, logger }) {
    try {
      await this.#verifySignature({
        body,
        signingKey,
        allowExpiredSignatures,
        logger
      });
      return signingKey;
    } catch (err2) {
      if (!signingKeyFallback) throw err2;
      await this.#verifySignature({
        body,
        signingKey: signingKeyFallback,
        allowExpiredSignatures,
        logger
      });
      return signingKeyFallback;
    }
  }
};
var unauthorizedResponse = {
  status: 401,
  headers: { "Content-Type": "application/json" },
  body: stringify$1({ message: "Unauthorized" }),
  version: void 0
};

// node_modules/inngest/cloudflare.js
var frameworkName = "cloudflare-pages";
var deriveHandlerArgs = (args) => {
  if (!Array.isArray(args) || args.length < 1) throw new Error("No arguments passed to serve handler");
  if (typeof args[0] === "object" && "request" in args[0] && "env" in args[0]) return {
    req: args[0].request,
    env: args[0].env
  };
  if (args.length > 1 && typeof args[1] === "object") return {
    req: args[0],
    env: args[1]
  };
  throw new Error("Could not derive handler arguments from input; are you sure you're using serve() correctly?");
};
var serve = (options) => {
  const handler2 = new InngestCommHandler({
    frameworkName,
    ...options,
    handler: (...args) => {
      const { req, env } = deriveHandlerArgs(args);
      return {
        body: () => req.text(),
        headers: (key) => req.headers.get(key),
        method: () => req.method,
        env: () => env,
        url: () => new URL(req.url, `https://${req.headers.get("host") || ""}`),
        transformResponse: ({ body, status, headers }) => {
          return new Response(body, {
            status,
            headers
          });
        },
        transformStreamingResponse: ({ body, status, headers }) => {
          return new Response(body, {
            status,
            headers
          });
        }
      };
    }
  });
  return Object.defineProperties(handler2.createHandler(), { length: { value: 2 } });
};

// node_modules/inngest/index.js
var inngest_exports = {};
__export(inngest_exports, {
  ConsoleLogger: () => ConsoleLogger,
  EventType: () => EventType,
  Inngest: () => Inngest,
  InngestCommHandler: () => InngestCommHandler,
  Middleware: () => Middleware,
  NonRetriableError: () => NonRetriableError,
  ProxyLogger: () => ProxyLogger,
  RetryAfterError: () => RetryAfterError,
  StepError: () => StepError,
  cron: () => cron,
  dependencyInjectionMiddleware: () => dependencyInjectionMiddleware,
  eventType: () => eventType,
  experiment: () => experiment,
  fetch: () => fetch2,
  group: () => group,
  headerKeys: () => headerKeys,
  internalEvents: () => internalEvents,
  invoke: () => invoke,
  isInngest: () => isInngest,
  isInngestFunction: () => isInngestFunction,
  isInngestRequest: () => isInngestRequest,
  queryKeys: () => queryKeys,
  realtime: () => realtime,
  referenceFunction: () => referenceFunction,
  serializeError: () => serializeError$1,
  slugify: () => slugify,
  staticSchema: () => staticSchema,
  step: () => step,
  version: () => version,
  wrapStringFirstLogger: () => wrapStringFirstLogger
});

// node_modules/inngest/components/ExperimentStrategies.js
var import_hash4 = __toESM(require_hash(), 1);
var { sha256: sha2563 } = import_hash4.default;
var hashToFloat = (str) => {
  const hex = sha2563().update(str).digest("hex").slice(0, 8);
  return Number.parseInt(hex, 16) / 4294967296;
};
var selectByWeight = (hash01, weights) => {
  const entries = Object.entries(weights).sort(([a2], [b2]) => a2.localeCompare(b2));
  const total = entries.reduce((sum, [, w2]) => sum + w2, 0);
  let cursor = 0;
  for (const [name, weight] of entries) {
    cursor += weight / total;
    if (hash01 < cursor) return name;
  }
  return entries[entries.length - 1][0];
};
var equalWeights = (variantNames) => {
  return Object.fromEntries(variantNames.map((name) => [name, 1]));
};
var validateWeights = (weights) => {
  for (const [name, w2] of Object.entries(weights)) {
    if (!Number.isFinite(w2)) throw new Error(`experiment.weighted(): weight for "${name}" is not a finite number (${w2}); weights must be finite numbers >= 0`);
    if (w2 < 0) throw new Error(`experiment.weighted(): weight for "${name}" is negative (${w2}); weights must be >= 0`);
  }
  if (Object.values(weights).reduce((sum, w2) => sum + w2, 0) <= 0) throw new Error("experiment.weighted(): all weights are zero; at least one weight must be positive");
};
var createSelectFn = (fn2, config) => {
  return Object.assign(fn2, { __experimentConfig: config });
};
var experiment = {
  fixed(variantName) {
    return createSelectFn(() => variantName, { strategy: "fixed" });
  },
  weighted(weights) {
    validateWeights(weights);
    const frozen = { ...weights };
    return createSelectFn(() => {
      return selectByWeight(hashToFloat(getAsyncCtxSync()?.execution?.ctx.runId ?? crypto.randomUUID()), frozen);
    }, {
      strategy: "weighted",
      weights: frozen
    });
  },
  bucket(value, options) {
    if (options?.weights) validateWeights(options.weights);
    const str = value == null ? "" : String(value);
    return createSelectFn((variantNames) => {
      const weights = options?.weights ?? (variantNames ? equalWeights(variantNames) : void 0);
      if (!weights) throw new Error("experiment.bucket() requires either explicit weights or variant names from group.experiment()");
      return selectByWeight(hashToFloat(str), weights);
    }, {
      strategy: "bucket",
      weights: options?.weights,
      ...value == null && { nullishBucket: true }
    });
  },
  custom(fn2) {
    return createSelectFn(fn2, { strategy: "custom" });
  }
};

// node_modules/inngest/components/realtime/channel.js
var createTopicAccessors = (channelName, topics) => {
  const accessors = {};
  for (const [topicName, config] of Object.entries(topics)) accessors[topicName] = {
    channel: channelName,
    topic: topicName,
    config
  };
  return accessors;
};
var channel = (options) => {
  const { name, topics } = options;
  if (typeof name === "function") {
    const def = (...args) => {
      const resolvedName = name(...args);
      return {
        name: resolvedName,
        topics,
        ...createTopicAccessors(resolvedName, topics)
      };
    };
    Object.defineProperties(def, {
      topics: {
        value: topics,
        enumerable: true
      },
      $infer: { get: () => topics },
      $params: { get: () => void 0 }
    });
    return def;
  }
  return {
    name,
    topics,
    ...createTopicAccessors(name, topics),
    get $infer() {
      return topics;
    }
  };
};

// node_modules/inngest/components/realtime/index.js
var realtime = { channel };

// node_modules/inngest/helpers/assertions.js
var isInngest = (input) => {
  return input[Symbol.toStringTag] === Inngest.Tag;
};
var isInngestFunction = (input) => {
  return input[Symbol.toStringTag] === InngestFunction.Tag;
};
var isInngestRequest = (input) => {
  try {
    const runId = input.headers.get(headerKeys.InngestRunId);
    const signature = input.headers.get(headerKeys.Signature);
    return Boolean(runId && typeof signature === "string");
  } catch {
    return false;
  }
};

// node_modules/inngest/middleware/dependencyInjection.js
var dependencyInjectionMiddleware = (ctx) => {
  class DependencyInjectionMiddleware extends Middleware.BaseMiddleware {
    id = "inngest:dependency-injection";
    transformFunctionInput(arg) {
      return {
        ...arg,
        ctx: {
          ...arg.ctx,
          ...ctx
        }
      };
    }
  }
  return DependencyInjectionMiddleware;
};

// node_modules/inngest/index.js
__reExport(inngest_exports, __toESM(require_dist2(), 1));

// src/functions.js
var inngest = new Inngest({ id: "afo-platform" });
var triggerDemoSnapshot = inngest.createFunction(
  { id: "trigger-demo-snapshot", retries: 3 },
  { event: "afo/business.injected" },
  async ({ event, step: step2 }) => {
    const { worker_url, slug } = event.data;
    const result = await step2.run("trigger-snapshot", async () => {
      if (!worker_url) throw new Error("event.data.worker_url is required");
      const res = await fetch(`${worker_url}/api/publish`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ slug: slug || null })
      });
      const text = await res.text();
      if (!res.ok) throw new Error(`Snapshot trigger failed: HTTP ${res.status} - ${text.slice(0, 300)}`);
      let parsed;
      try {
        parsed = JSON.parse(text);
      } catch {
        parsed = { raw: text };
      }
      return { status: res.status, body: parsed };
    });
    return { ok: true, slug: slug || null, snapshot_result: result };
  }
);
var pingTest = inngest.createFunction(
  { id: "afo-ping-test" },
  { event: "afo/ping" },
  async ({ event, step: step2 }) => {
    const echoed = await step2.run("echo", async () => {
      return { received: event.data || {}, at: (/* @__PURE__ */ new Date()).toISOString() };
    });
    return { ok: true, echoed };
  }
);

// src/index.js
var handler = serve({
  client: inngest,
  functions: [triggerDemoSnapshot, pingTest]
});
var index_default = {
  fetch(request, env, ctx) {
    return handler(request, env, ctx);
  }
};
export {
  index_default as default
};
