export const logger = {
  log: process.env.NODE_ENV !== 'production' 
    ? (...args: any[]) => console.log(...args)
    : () => {},
  warn: process.env.NODE_ENV !== 'production'
    ? (...args: any[]) => console.warn(...args)
    : () => {},
  error: (...args: any[]) => console.error(...args)
}; 