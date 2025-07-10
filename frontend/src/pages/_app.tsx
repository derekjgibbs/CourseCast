import type { AppProps } from 'next/app'
import { ConvexProvider, ConvexReactClient } from 'convex/react'
import '../styles/globals.css'

const convex = new ConvexReactClient(process.env.NEXT_PUBLIC_CONVEX_URL!)

export default function App({ Component, pageProps }: AppProps) {
  return (
    <ConvexProvider client={convex}>
      <Component {...pageProps} />
    </ConvexProvider>
  )
}