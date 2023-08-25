import Head from 'next/head';
import builderLogo from '../public/webpack.svg';
import Notes from './Notes';

function App() {
  return (
    <>
      <Head>
        <title>Open Editor</title>
      </Head>
      <div>
        <a href="https://rollupjs.org" target="_blank">
          <img src={builderLogo.src} className="logo" alt="Webpack logo" />
        </a>
        <a href="https://react.dev" target="_blank">
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
      </div>
      <h1>Webpack + Next</h1>
      <div className="card">
        <Notes />
      </div>
      <p className="read-the-docs">
        Click on the Rollup and React logos to learn more
      </p>
    </>
  );
}

export default App;
