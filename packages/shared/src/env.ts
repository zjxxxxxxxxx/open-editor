export function isDev() {
  const env = process.env.NODE_ENV;
  return !env || env === 'development';
}
