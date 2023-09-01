import { component$ } from '@builder.io/qwik';
import SubTree3 from './SubTree3';

const SubTree2 = component$(() => {
  return (
    <div>
      <SubTree3 />
    </div>
  );
});

export default SubTree2;
