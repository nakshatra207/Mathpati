// CommonJS preload to make test runner environment compatible with libraries
// that expect well-formed typed-array property descriptors (webidl-conversions).
// This file is intended to be required before Vitest starts (via NODE_OPTIONS).

try {
  var sym = Symbol.toStringTag;
  if (sym) {
    var typedArrayNames = [
      'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
      'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
      'Float64Array', 'BigInt64Array', 'BigUint64Array'
    ];

    for (var i = 0; i < typedArrayNames.length; i++) {
      var name = typedArrayNames[i];
      var ctor = global[name];
      if (typeof ctor === 'function') {
        var proto = ctor.prototype;
        var desc = Object.getOwnPropertyDescriptor(proto, sym);
        if (!desc) {
          Object.defineProperty(proto, sym, {
            configurable: true,
            enumerable: false,
            get: function () {
              return name;
            }
          });
        }
      }
    }
  }
} catch (e) {
  // best-effort shim — do not crash test runner if this fails
  // eslint-disable-next-line no-console
  console.warn('vitest-preload.cjs: shim failed', e && e.stack ? e.stack : e);
}
