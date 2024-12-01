import { type AppProps } from 'next/app';
import Head from 'next/head';
import './_app.css';

export default ({ Component, pageProps }: AppProps) => {
  return (
    <>
      <Head>
        <link rel="icon" type="image/png" href="/logo.png" />
        <title>Open Editor</title>
      </Head>
      <Component {...pageProps} />
    </>
  );
};
