import '@testing-library/jest-dom';

// jsdom doesn't implement HTMLMediaElement playback APIs; mock to avoid errors
Object.defineProperty(global.window.HTMLMediaElement.prototype, 'play', {
  configurable: true,
  value: () => Promise.resolve(),
});

Object.defineProperty(global.window.HTMLMediaElement.prototype, 'pause', {
  configurable: true,
  value: () => {},
});

