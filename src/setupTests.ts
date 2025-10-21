import '@testing-library/jest-dom';

// jsdom doesn't implement HTMLMediaElement playback APIs; mock to avoid errors
if (typeof window !== 'undefined' && window.HTMLMediaElement) {
  Object.defineProperty(window.HTMLMediaElement.prototype, 'play', {
    configurable: true,
    value: () => Promise.resolve(),
  });

  Object.defineProperty(window.HTMLMediaElement.prototype, 'pause', {
    configurable: true,
    value: () => {},
  });
}

