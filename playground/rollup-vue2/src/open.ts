// eslint-disable-next-line @typescript-eslint/no-unused-vars
interface Window {
  __OPEN_EDITOR_LISTENERED__?: boolean;
}
if (typeof window !== 'undefined' && !window.__OPEN_EDITOR_LISTENERED__) {
  const { hostname } = window.location;
  if (hostname.endsWith('webcontainer.io')) {
    window.__OPEN_EDITOR_LISTENERED__ = true;
    window.addEventListener('openeditor', (event) => {
      const openURL = (event as CustomEvent<URL>).detail;
      if (openURL.port) {
        openURL.hostname = hostname.replace(/--(\d+)--/, ($1, $2) =>
          $1.replace($2, openURL.port),
        );
        openURL.port = '';
      }
    });
  }
}
