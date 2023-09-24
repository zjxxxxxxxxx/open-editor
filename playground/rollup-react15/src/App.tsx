import Tree from './components/tree';
import Notes from './components/Notes';
import './App.css';

export default function App(): React.JSX.Element {
  return (
    <div>
      <div>
        <a href="https://rollupjs.org" target="_blank">
          <img src="../public/rollup.svg" className="logo" alt="Rollup logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img
            src="../public/react.svg"
            className="logo react"
            alt="React logo"
          />
        </a>
      </div>
      <h1>Rollup + React15</h1>
      <Tree />
      <div className="card">
        <Notes />
      </div>
      <p className="read-the-docs">
        <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
          Github
        </a>
      </p>
    </div>
  );
}
