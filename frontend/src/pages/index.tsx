import Head from 'next/head'
import { Inter } from 'next/font/google'
import { useQuery } from 'convex/react'
import { api } from '../../convex/_generated/api'
import CourseCatalogTable from '../components/CourseCatalogTable'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  const courses = useQuery(api.courses.list) || []

  return (
    <>
      <Head>
        <title>CourseCast</title>
        <meta name="description" content="Course optimization using Monte Carlo simulation" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className={`${inter.className} min-h-screen bg-purple-50`}>
        <div className="max-w-7xl mx-auto px-6 py-8">
          <CourseCatalogTable courses={courses} />
        </div>
      </main>
    </>
  )
}