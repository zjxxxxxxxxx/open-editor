import { resolve } from 'node:path';
import { describe, expect, test } from 'vitest';
import { rollup } from 'rollup';
import nodeResolve from '@rollup/plugin-node-resolve';
import commonjs from '@rollup/plugin-commonjs';

import { clientRoot, sharedRoot, joinURLToPath } from '../../../scripts/utils';
import OpenEditor from '../dist';

describe('string-input', async () => {
  test('should inject client code', async () => {
    const bundle = await rollup({
      input: joinURLToPath(import.meta.url, 'app.js'),
      plugins: [nodeResolve(), commonjs(), OpenEditor()],
    });
    const { output } = await bundle.generate({
      file: 'index.js',
      format: 'esm',
    });

    expect(
      output[0].moduleIds.includes(resolve(sharedRoot, 'dist/index.mjs')),
    ).toBeTruthy();
    expect(
      output[0].moduleIds.includes(resolve(clientRoot, 'dist/index.mjs')),
    ).toBeTruthy();
    expect(
      output[0].moduleIds.includes(joinURLToPath(import.meta.url, 'app.js')),
    ).toBeTruthy();
  });
});
