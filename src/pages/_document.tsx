import { Html, Head, Main, NextScript, DocumentContext, DocumentInitialProps } from "next/document";

import METADATA from "@constants/metadata";
import { createCache, extractStyle, StyleProvider } from "@ant-design/cssinjs";
import NextDocument from "next/document";

export default function Document() {
  return (
    <Html lang="en">
      <Head>
        <meta charSet="utf-8" />
        <meta name="application-name" content={METADATA.APP_NAME} />
        <meta name="apple-mobile-web-app-title" content={METADATA.APP_NAME} />
        <meta name="description" content={METADATA.APP_DESCRIPTION} />
        <meta content={METADATA.KEYWORDS} name="keywords" />
        <link rel="shortcut icon" href="/favicon.ico" />
        <title>{METADATA.APP_NAME}</title>
      </Head>
      <body>

        <div id="modal-root"></div>
        <Main />
        <NextScript />
      </body>
    </Html>
  );


}

// Document.getServerSideProps = async (ctx: DocumentContext): Promise<any> => {
//   const cache = createCache();
//   const originalRenderPage = ctx.renderPage;
//   ctx.renderPage = () =>
//     originalRenderPage({
//       enhanceApp: (App) => (props) =>
//         (
//           <StyleProvider cache={cache}>
//             <App {...props} />
//           </StyleProvider>
//         ),
//     });

//   const initialProps = await Document.getServerSideProps(ctx);
//   const style = extractStyle(cache, true);
//   return {
//     ...initialProps,
//     styles: (
//       <>
//         {initialProps.styles}
//         <style dangerouslySetInnerHTML={{ __html: style }} />
//       </>
//     ),
//   };
// };

Document.getInitialProps = async (ctx: DocumentContext): Promise<DocumentInitialProps> => {
  const cache = createCache();
  const originalRenderPage = ctx.renderPage;
  ctx.renderPage = () =>
    originalRenderPage({
      enhanceApp: (App) => (props) => (
        <StyleProvider cache={cache}>
          <App {...props} />
        </StyleProvider>
      ),
    });

  const initialProps = await NextDocument.getInitialProps(ctx);
  const style = extractStyle(cache, true);
  return {
    ...initialProps,
    styles: (
      <>
        {initialProps.styles}
        <style dangerouslySetInnerHTML={{ __html: style }} />
      </>
    ),
  };
};