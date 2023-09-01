import { getComponentNameByFile } from '../util';

export function resolveSourceFromSvelte(
  meta?: { loc: { file?: string } } | null,
) {
  if (!meta) return [];

  return [
    {
      name: getComponentNameByFile(meta.loc.file, 'svelte'),
      file: meta.loc.file,
    },
  ];
}
