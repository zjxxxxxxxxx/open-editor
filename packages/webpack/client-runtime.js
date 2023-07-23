const qs = require('querystring');
const { setupClient } = require('@open-editor/client');

if (typeof window !== 'undefined') {
  const query = qs.parse(__resourceQuery.slice(1));
  setupClient({
    enablePointer: query.enablePointer === 'true',
    serverAddress: query.serverAddress,
  });
}
