import '@testing-library/jest-dom';

// Ensure window is available
if (typeof window !== 'undefined') {
  // jsdom doesn't implement HTMLMediaElement playback APIs; mock to avoid errors
  if (window.HTMLMediaElement) {
    Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
      configurable: true,
      value: () => Promise.resolve(),
    });

    Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
      configurable: true,
      value: () => {},
    });
  }
}

// Workaround for test environment: some libraries (webidl-conversions / whatwg-url)
// access the Symbol.toStringTag getter on typed array prototypes. In some
// lightweight DOM/test environments the descriptor may be missing which causes
// a runtime error when the library tries to read `.get`. Define a safe getter
// when it's not present.
try {
  const typedArrayProto = Object.getPrototypeOf(Uint8Array).prototype;
  const desc = Object.getOwnPropertyDescriptor(typedArrayProto, Symbol.toStringTag);
  if (!desc || typeof desc.get !== 'function') {
    Object.defineProperty(typedArrayProto, Symbol.toStringTag, {
      configurable: true,
      get() {
        // return the constructor name as a sensible default
        // e.g., 'Uint8Array', 'Int16Array', etc.
        return this && this.constructor ? this.constructor.name : 'TypedArray';
      },
    });
  }
} catch (e) {
  // If anything goes wrong, don't fail tests setup — keep it silent.
}
