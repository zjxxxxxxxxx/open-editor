import TestCrossIframe from './components/TestCrossIframe';
import TestComponentTree from './components/TestComponentTree';
import Notes from './components/Notes';
import './App.css';

export default function App(): React.JSX.Element {
  if (location.pathname === '/test-cross-iframe') {
    return <TestCrossIframe />;
  }
  if (location.pathname === '/test-component-tree') {
    return <TestComponentTree />;
  }

  return (
    <div className="app">
      <div>
        <a href="https://rollupjs.org" target="_blank">
          <img src="../public/rollup.svg" className="logo" alt="Rollup logo" />
        </a>
        <a href="https://react.dev" target="_blank">
          <img src="../public/react.svg" className="logo react" alt="React logo" />
        </a>
        <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
          <img src="../public/logo.png" className="logo open-editor" alt="OpenEditor logo" />
        </a>
      </div>
      <h1>Rollup + React15</h1>
      <iframe scrolling="no" src="/test-cross-iframe" />
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
