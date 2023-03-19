import Head from 'next/head'
import Image from 'next/image'
import { Inter } from 'next/font/google'
import styles from '@/styles/Home.module.css'
import Organize from './Organize'

const inter = Inter({ subsets: ['latin'] })

export default function Home() {
  return (
    <>
      <Head>
        <title>Review Board Group Organizer</title>
        <meta name="description" content="Organize Groups for Review Board" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="/favicon.ico" />
      </Head>
      <main className="w-full h-full bg-slate-900 text-white">
        <Organize />
      </main>
    </>
  )
}
