export const debug = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.debug(...args);
  }
};

export const warn = (...args: unknown[]): void => {
  if (import.meta.env.DEV) {
    // eslint-disable-next-line no-console
    console.warn(...args);
  }
};

export const error = (...args: unknown[]): void => {
  // Always surface errors regardless of environment
  // eslint-disable-next-line no-console
  console.error(...args);
};