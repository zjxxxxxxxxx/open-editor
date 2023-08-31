import { component$ } from '@builder.io/qwik';
import viteLogo from '/vite.svg';
import qwikLogo from '/qwik.svg';
import Notes from './Notes';
import Tree from './tree';
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
        <Notes />
      </div>
      <Tree />
      <p class="read-the-docs">
        <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
          Click to Github
        </a>
      </p>
    </>
  );
});
