import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { OutputChunk, rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

import { clientRoot, sharedRoot, joinURLToPath } from '../../../scripts/utils';
import openEditor from '../dist';

describe('string-input', async () => {
  test('should inject client code', async () => {
    const bundle = await rollup({
      input: {
        app: joinURLToPath(import.meta.url, 'app.js'),
        app2: joinURLToPath(import.meta.url, 'app2.js'),
      },
      plugins: [nodeResolve(), openEditor()],
    });
    const { output } = await bundle.generate({
      dir: 'dist',
      format: 'esm',
    });

    expect(output[0].moduleIds).toEqual([
      joinURLToPath(import.meta.url, 'app.js'),
    ]);

    expect((<OutputChunk>output[1]).moduleIds).toEqual([
      joinURLToPath(import.meta.url, 'app2.js'),
    ]);

    expect((<OutputChunk>output[2]).moduleIds).toEqual([
      resolve(sharedRoot, 'dist/index.mjs'),
      resolve(clientRoot, 'dist/index.mjs'),
      resolve(clientRoot, 'dist/client.js'),
    ]);
  });
});
