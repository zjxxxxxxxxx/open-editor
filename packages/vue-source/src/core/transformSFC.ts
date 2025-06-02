import {
  type ElementNode,
  type AttributeNode,
  type RootNode,
  type TextNode,
  type TemplateChildNode,
  parse,
  transform,
  NodeTypes,
  ElementTypes,
} from '@vue/compiler-dom';
import { transformJSX } from './transformJSX';

const TAG_TYPES = new Set([ElementTypes.ELEMENT, ElementTypes.COMPONENT]);
const IGNORE_TAGS = new Set(['template', 'script', 'style']);

export function transformSFC(
  code: string,
  cb: (index: number, line: number, column: number) => void,
) {
  const ast = parse(code);

  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (shouldTransform(node)) {
          const hasProps = node.props.length > 0;
          const index = hasProps
            ? Math.max(...node.props.map((prop) => prop.loc.end.offset))
            : node.loc.start.offset + node.tag.length + 1;

          const { line, column } = node.loc.start;
          cb(index, line, column);
        }
      },
    ],
  });

  const jsxOpts = extractJsxOptions(ast);
  if (jsxOpts) {
    transformJSX(jsxOpts.code, cb, jsxOpts);
  }
}

function shouldTransform(node: RootNode | TemplateChildNode): node is ElementNode {
  if (node.type !== NodeTypes.ELEMENT) {
    return false;
  }

  return TAG_TYPES.has(node.tagType) && !IGNORE_TAGS.has(node.tag);
}

function extractJsxOptions(ast: RootNode) {
  const scriptNode = (ast.children as ElementNode[]).find((node) => node.tag === 'script');
  if (!scriptNode) return;
  const codeNode = scriptNode.children[0] as TextNode | undefined;
  if (!codeNode) return;
  const langProp = scriptNode.props.find((prop) => prop.name === 'lang') as AttributeNode;
  if (!langProp) return;
  const lang = langProp.value?.content || '';
  if (!/[jt]sx/.test(lang)) return;

  const { offset, line, column } = codeNode.loc.start;
  return {
    isTsx: lang === 'tsx',
    startIndex: offset,
    startLine: line,
    startColumn: column,
    code: codeNode.content,
  };
}
