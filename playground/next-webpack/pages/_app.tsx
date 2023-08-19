import '@/styles/globals.css';
import type { AppContext, AppProps } from 'next/app';
import Head from 'next/head';

export default function App({
  Component,
  pageProps,
  https,
}: AppProps & { https?: boolean }) {
  return (
    <>
      <Head>
        {https && (
          <meta
            httpEquiv="Content-Security-Policy"
            content="upgrade-insecure-requests"
          />
        )}
      </Head>
      <Component {...pageProps} />
    </>
  );
}

App.getInitialProps = (app: AppContext) => {
  return {
    https: app.ctx.req?.headers.referer?.startsWith('https'),
  };
};
