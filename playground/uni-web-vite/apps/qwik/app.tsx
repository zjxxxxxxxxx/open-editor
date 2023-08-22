import { component$ } from '@builder.io/qwik';
import viteLogo from '/vite.svg';
import qwikLogo from '/qwik.svg';
import Counter from './Counter';
import './app.css';

export const App = component$(() => {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src={viteLogo} class="logo" alt="Vite logo" />
        </a>
        <a href="https://qwik.builder.io" target="_blank">
          <img src={qwikLogo} class="logo qwik" alt="Qwik logo" />
        </a>
      </div>
      <h1>Vite + Qwik</h1>
      <div class="card">
        <Counter />
      </div>
      <p class="read-the-docs">
        Click on the Vite and Qwik logos to learn more
      </p>
    </>
  );
});
