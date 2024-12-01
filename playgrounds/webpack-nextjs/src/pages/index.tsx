import Notes from '@/components/Notes';

export default function App() {
  return (
    <div className="app">
      <div>
        <a href="https://webpack.js.org" target="_blank">
          <img src="/webpack.svg" className="logo" alt="Webpack logo" />
        </a>
        <a href="https://nextjs.org" target="_blank">
          <picture>
            <source
              media="(prefers-color-scheme: dark)"
              srcSet="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_dark_background.png"
            />
            <img
              className="logo next"
              src="https://assets.vercel.com/image/upload/v1662130559/nextjs/Icon_light_background.png"
              alt="Next logo"
            />
          </picture>
        </a>
        <a href="https://github.com/zjxxxxxxxxx/open-editor" target="_blank">
          <img src="/logo.png" className="logo open-editor" alt="OpenEditor logo" />
        </a>
      </div>
      <h1>Webpack + Nextjs</h1>
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
