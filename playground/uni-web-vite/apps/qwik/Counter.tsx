import { component$, useSignal } from '@builder.io/qwik';

const Counter = component$(() => {
  const count = useSignal(0);

  return <button onClick$={() => count.value++}>count is {count.value}</button>;
});

export default Counter;
