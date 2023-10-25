import Tree from './components/tree';
import Notes from './components/Notes';
import './App.css';

export default function App() {
  return (
    <>
      <div>
        <a href="https://vitejs.dev" target="_blank">
          <img src="/vite.svg" className="logo" alt="Vite logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
        <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
          <img
            src="/logo.png"
            className="logo open-editor"
            alt="OpenEditor logo"
          />
        </a>
      </div>
      <h1>Vite + React</h1>
      <Tree />
      <div className="card">
        <Notes />
      </div>
      <p className="read-the-docs">
        <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
          Github
        </a>
      </p>
    </>
  );
}
