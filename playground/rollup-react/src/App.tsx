import rollupLogo from '../public/rollup.svg';
import reactLogo from '../public/react.svg';
import Notes from './Notes';
import './App.css';

export default function App() {
  return (
    <>
      <div>
        <a href="https://rollupjs.org" target="_blank">
          <img src={rollupLogo} className="logo" alt="Rollup logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src={reactLogo} className="logo react" alt="React logo" />
        </a>
      </div>
      <h1>Rollup + React</h1>
      <div className="card">
        <Notes />
      </div>
      <p className="read-the-docs">
        <a target="_black" href="https://github.com/zjxxxxxxxxx/open-editor">
          Click to Github
        </a>
      </p>
    </>
  );
}
