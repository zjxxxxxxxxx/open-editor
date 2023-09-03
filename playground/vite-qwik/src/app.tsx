import { component$ } from '@builder.io/qwik';
import Notes from './Notes';
import './app.css';

export const App = component$(() => {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" class="logo" alt="Vite logo" />
        </a>
        <a href="https://qwik.builder.io" target="_blank">
          <img src="/qwik.svg" class="logo qwik" alt="Qwik logo" />
        </a>
      </div>
      <h1>Vite + Qwik</h1>
      <div class="card">
        <Notes />
      </div>
      <p class="read-the-docs">
        <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
          Github
        </a>
      </p>
    </>
  );
});
