import Document, { Html, Head, Main, NextScript } from 'next/document';

class MyDocument extends Document {
  render() {
    return (
      <Html lang="tr">
        <Head>
          <link
            href="https://fonts.googleapis.com/css2?family=Inter:wght@300;400;500;600;700&display=swap"
            rel="stylesheet"
          />
        </Head>
        <body>
          <Main />
          <NextScript />
          <noscript>
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              minHeight: '100vh',
              padding: '20px',
              textAlign: 'center',
              fontFamily: 'Inter, sans-serif',
            }}>
              <p>
                Bu uygulamayı kullanmak için lütfen JavaScript'i etkinleştirin.
              </p>
            </div>
          </noscript>
        </body>
      </Html>
    );
  }
}

export default MyDocument;
