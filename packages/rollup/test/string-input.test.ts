import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';

import { clientRoot, sharedRoot, joinURLToPath } from '../../../scripts/utils';
import openEditor from '../dist';

describe('string-input', async () => {
  test('should inject client code', async () => {
    const bundle = await rollup({
      input: joinURLToPath(import.meta.url, 'app.js'),
      plugins: [nodeResolve(), openEditor()],
    });
    const { output } = await bundle.generate({
      file: 'index.js',
      format: 'esm',
    });

    expect(output[0].moduleIds).toEqual([
      resolve(sharedRoot, 'dist/index.mjs'),
      resolve(clientRoot, 'dist/index.mjs'),
      joinURLToPath(import.meta.url, 'app.js'),
    ]);
  });
});
