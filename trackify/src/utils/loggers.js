const isDev = __DEV__  // Expo's built-in flag, true in dev, false in production

export const log = (...args) => { if (isDev) console.log(...args) }
export const errorLog = (...args) => { if (isDev) console.error(...args) }
export const warn = (...args) => { if (isDev) console.warn(...args) }
