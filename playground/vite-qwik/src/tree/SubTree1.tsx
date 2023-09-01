import { component$ } from '@builder.io/qwik';
import SubTree2 from './SubTree2';

const SubTree1 = component$(() => {
  return <SubTree2 />;
});

export default SubTree1;
