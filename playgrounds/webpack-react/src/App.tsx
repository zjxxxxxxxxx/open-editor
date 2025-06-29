import TestCrossIframe from './components/TestCrossIframe';
import TestComponentTree from './components/TestComponentTree';
import Notes from './components/Notes';
import './App.css';

export default function App() {
  if (location.pathname === '/test-cross-iframe') {
    return <TestCrossIframe />;
  }
  if (location.pathname === '/test-component-tree') {
    return <TestComponentTree />;
  }

  return (
    <div className="app">
      <div>
        <a href="https://webpack.js.org" target="_blank">
          <img src="/webpack.svg" className="logo" alt="Webpack logo" />
        </a>

        <a href="https://react.dev" target="_blank">
          <img src="/react.svg" className="logo react" alt="React logo" />
        </a>
        <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
          <img src="/logo.png" className="logo open-editor" alt="openEditor logo" />
        </a>
      </div>
      <h1>Webpack + React</h1>
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
