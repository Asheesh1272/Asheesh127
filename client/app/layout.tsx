import type { Metadata } from 'next'
import { Inter } from 'next/font/google'
import './globals.css'
import { ThemeProvider } from '@/components/theme-provider'
import { WalletContextProvider } from '@/context/Wallet'
import { Toaster } from '@/components/ui/sonner'
import Navbar from '@/components/Navbar';
import Footer from '@/components/Footer';


const inter = Inter({ subsets: ['latin'] })

export const metadata: Metadata = {
  title: 'Voice Chain',
  description: 'Voice Chain is a decentralized platform that leverages blockchain technology to create an immutable record of corruption reports while protecting whistleblower identities.',
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en">
      <head>
        <link rel="shortcut icon" href="https://res.cloudinary.com/djyk287ep/image/upload/v1752266605/logoipsum-359_st42rg.png" type="image/x-icon" />
        <link rel="apple-touch-icon" href="https://res.cloudinary.com/djyk287ep/image/upload/v1752266547/ChatGPT_Image_Jul_8_2025_05_24_17_PM_ttdnys.png" />
      </head>
      <body className={inter.className}>
        <ThemeProvider
          attribute="class"
          defaultTheme="dark"
          enableSystem
          disableTransitionOnChange
        >
          <WalletContextProvider>
            <Navbar />
            {children}
          </WalletContextProvider>
          <Toaster position="top-center" />
        </ThemeProvider>
      </body>
    </html>
  )
}