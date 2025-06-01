import {
  type ElementNode,
  type AttributeNode,
  type RootNode,
  type TextNode,
  parse,
  transform,
} from '@vue/compiler-dom';
import { transformJSX } from './transformJSX';

export const NodeTypes = <const>{
  ELEMENT: 1,
};

export const TagTypes = [
  0, // ELEMENT
  1, // COMPONENT
];

export function transformSFC(
  code: string,
  cb: (index: number, line: number, column: number) => void,
) {
  const ast = parse(code);
  transform(ast, {
    nodeTransforms: [
      (node) => {
        if (node.type === NodeTypes.ELEMENT && TagTypes.includes(node.tagType)) {
          const index = node.props.length
            ? Math.max(...node.props.map((i) => i.loc.end.offset))
            : node.loc.start.offset + node.tag.length + 1;
          const { line, column } = node.loc.start;

          cb(index, line, column);
        }
      },
    ],
  });

  const jsxOpts = resolveJsxOpts(ast);
  if (jsxOpts) {
    transformJSX(jsxOpts.code, cb, jsxOpts);
  }
}

function resolveJsxOpts(ast: RootNode) {
  const scriptNode = (ast.children as ElementNode[]).find((node) => node.tag === 'script');
  if (!scriptNode) return;
  const codeNode = scriptNode.children[0] as TextNode | undefined;
  if (!codeNode) return;
  const langProp = scriptNode.props.find((prop) => prop.name === 'lang') as AttributeNode;
  if (!langProp) return;

  const lang = langProp.value?.content || '';
  // <script lang="jsx">...</script>
  // <script lang="tsx">...</script>
  if (/[jt]sx/.test(lang)) {
    const { offset, line, column } = codeNode.loc.start;
    return {
      isTsx: lang === 'tsx',
      startIndex: offset,
      startLine: line,
      startColumn: column,
      code: codeNode.content,
    };
  }
}
