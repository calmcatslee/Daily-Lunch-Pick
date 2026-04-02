import '../styles/globals.css'
import DeviceLayer from '../components/DeviceLayer'
import { useRouter } from 'next/router'

export default function App({ Component, pageProps }) {
  const router = useRouter()
  const isVotePage = router.pathname.startsWith('/vote/')

  return (
    <>
      <Component {...pageProps} />
      {!isVotePage && <DeviceLayer />}
    </>
  )
}
