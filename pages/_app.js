import '../styles/globals.css'
import DeviceLayer from '../components/DeviceLayer'
import { useRouter } from 'next/router'
import Script from 'next/script'
import { Analytics } from '@vercel/analytics/react'

const GA_ID = 'G-GLZ8BBPL9Q'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isVotePage = router.pathname.startsWith('/vote/')

  return (
    <>
      <Script
        src={`https://www.googletagmanager.com/gtag/js?id=${GA_ID}`}
        strategy="afterInteractive"
      />
      <Script id="gtag-init" strategy="afterInteractive">
        {`
          window.dataLayer = window.dataLayer || [];
          function gtag(){dataLayer.push(arguments);}
          gtag('js', new Date());
          gtag('config', '${GA_ID}');
        `}
      </Script>
      <Component {...pageProps} />
      {!isVotePage && <DeviceLayer />}
      <Analytics />
    </>
  )
}
