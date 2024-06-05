import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { OutputChunk, rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import { clientRoot, sharedRoot, joinURLToPath } from '../../../scripts/utils';
import OpenEditor from '../dist';

describe('string-input', async () => {
  test('should inject client code', async () => {
    const bundle = await rollup({
      input: {
        app: joinURLToPath(import.meta.url, 'app.js'),
        app2: joinURLToPath(import.meta.url, 'app2.js'),
      },
      plugins: [nodeResolve(), commonjs(), OpenEditor()],
    });
    const { output } = await bundle.generate({
      dir: 'dist',
      format: 'esm',
    });

    expect(
      output[0].moduleIds.includes(joinURLToPath(import.meta.url, 'app.js')),
    ).toBeTruthy();
    expect(
      (<OutputChunk>output[1]).moduleIds.includes(
        joinURLToPath(import.meta.url, 'app2.js'),
      ),
    ).toBeTruthy();
    expect(
      (<OutputChunk>output[2]).moduleIds.includes(
        resolve(sharedRoot, 'dist/index.mjs'),
      ),
    ).toBeTruthy();
    expect(
      (<OutputChunk>output[2]).moduleIds.includes(
        resolve(clientRoot, 'dist/index.mjs'),
      ),
    ).toBeTruthy();
  });
});
