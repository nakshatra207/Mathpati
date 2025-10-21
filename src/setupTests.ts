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
