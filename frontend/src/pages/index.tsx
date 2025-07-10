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
      <main className={inter.className}>
        <div className="container mx-auto px-4 py-8">
          <h1 className="text-3xl font-bold text-center mb-8">
            Welcome to CourseCast
          </h1>
          <p className="text-center text-gray-600 mb-8">
            Optimize your course schedule using Monte Carlo simulation
          </p>
          
          <div className="mt-8">
            <h2 className="text-2xl font-semibold mb-4">Course Catalog</h2>
            <CourseCatalogTable courses={courses} />
          </div>
        </div>
      </main>
    </>
  )
}