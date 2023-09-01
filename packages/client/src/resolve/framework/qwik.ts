import { ElementSourceMeta } from '../resolveSource';

const qwikPosRE = /:(\d+):(\d+)$/;
export function resolveSourceFromQwik(debug?: any | null, deep?: boolean) {
  const tree: Partial<ElementSourceMeta>[] = [];

  let { $element$, $parent$ } = debug;
  while ($parent$) {
    if ($parent$.$componentQrl$) {
      const { displayName, file } = $parent$.$componentQrl$.dev;
      const [, line, column] =
        $element$?.getAttribute('data-qwik-inspector')?.match(qwikPosRE) ?? [];

      tree.push({
        name: displayName.replace(/_component$/, ''),
        file,
        line,
        column,
      });

      if (!deep) {
        return tree;
      }
    }

    $element$ = $parent$.$element$;
    $parent$ = $parent$.$parent$;
  }

  return tree;
}
