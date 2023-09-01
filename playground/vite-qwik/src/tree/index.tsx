import { component$ } from '@builder.io/qwik';
import SubTree1 from './SubTree1';

const Tree = component$(() => {
  return <SubTree1 />;
});

export default Tree;
