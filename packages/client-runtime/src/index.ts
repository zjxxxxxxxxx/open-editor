import qs from 'querystring';
import { setupClient } from '@open-editor/client';

/**
 * [__resourceQuery (webpack-specific)](https://webpack.docschina.org/api/module-variables/#__resourcequery-webpack-specific)
 */
declare const __resourceQuery: string;

if (typeof window !== 'undefined') {
  let query: qs.ParsedUrlQuery = {};

  if (typeof __resourceQuery !== 'undefined') {
    query = qs.parse(__resourceQuery.slice(1));
  }

  setupClient({
    enablePointer: query.enablePointer === 'true',
    port: Number(query.port),
  });
}
