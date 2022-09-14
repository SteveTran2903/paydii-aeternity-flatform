import { Html, Head, Main, NextScript } from 'next/document'

export default function Document() {
  return (
    <Html>
      <Head>
      <meta name="twitter:card" content="summary" />
      <meta property="og:url" content="https://paydii.com/" />
      <meta property="og:title" content="Paydii.com is a decentralized marketplace platform for the digital products secured on Bitcoin via Stacks" />
      <meta property="og:description" content="Paydii.com is a decentralized marketplace platform for the digital products. 
You can easily create a product and sell it on Paydii for free. All of your data will be saved on the Stacks blockchain" />
      <meta property="og:image" content="https://i.ibb.co/pRBk0Sq/OG-IMAGE.png" />
      
      <meta property="og:url"  content="https://paydii.com/" />
      <meta property="og:type" content="website" />
      <meta property="og:title" content="Paydii.com is a decentralized marketplace platform for the digital products secured on Bitcoin via Stacks" />
      <meta property="og:description"  content="Paydii.com is a decentralized marketplace platform for the digital products. 
You can easily create a product and sell it on Paydii for free. All of your data will be saved on the Stacks blockchain" />
      <meta property="og:image"    content="https://i.ibb.co/pRBk0Sq/OG-IMAGE.png" />
      <link rel="icon" href="/favicon.ico" />
      </Head>
      <body className='body-app'>
        <Main />
        <NextScript />
      </body>
    </Html>
  )
}
