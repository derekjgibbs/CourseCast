import Head from 'next/head'
import { Inter } from 'next/font/google'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>CourseCast</title>
        <meta name="description" content="Course optimization using Monte Carlo simulation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={inter.className}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Welcome to CourseCast
          </h1>
          <p className="text-center text-gray-600">
            Optimize your course schedule using Monte Carlo simulation
          </p>
        </div>
      </main>
    </>
  )
}