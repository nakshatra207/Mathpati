// Minimal preload to make test runner environment compatible with libraries
// that expect well-formed typed-array property descriptors (webidl-conversions).
// This file is intended to be required before Vitest starts (via NODE_OPTIONS).

try {
  // Ensure Symbol.toStringTag exists on typed-array prototypes when missing.
  const sym = Symbol.toStringTag;
  if (sym) {
    const typedArrayNames = [
      'Int8Array', 'Uint8Array', 'Uint8ClampedArray', 'Int16Array',
      'Uint16Array', 'Int32Array', 'Uint32Array', 'Float32Array',
      'Float64Array', 'BigInt64Array', 'BigUint64Array'
    ];

    for (const name of typedArrayNames) {
      const ctor = global[name];
      if (typeof ctor === 'function') {
        const proto = ctor.prototype;
        const desc = Object.getOwnPropertyDescriptor(proto, sym);
        if (!desc) {
          Object.defineProperty(proto, sym, {
            configurable: true,
            enumerable: false,
            get() {
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
  console.warn('vitest-preload: shim failed', e && e.stack ? e.stack : e);
}
