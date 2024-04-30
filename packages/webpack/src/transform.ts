import type webpack from 'webpack';
import { injectClient } from '@open-editor/shared';

export default function transform(
  this: webpack.LoaderContext<AnyObject>,
  code: string,
) {
  this.cacheable(false);
  return injectClient(code, <AnyObject>this.query);
}
