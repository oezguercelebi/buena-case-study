import '@/styles/globals.css'
import '@radix-ui/themes/styles.css'
import type { AppProps } from 'next/app'
import { QueryClient, QueryClientProvider } from '@tanstack/react-query'
import { useState } from 'react'
import { Theme } from '@radix-ui/themes'
import ErrorBoundary from '@/components/ErrorBoundary'

export default function App({ Component, pageProps }: AppProps) {
  const [queryClient] = useState(() => new QueryClient())

  return (
    <ErrorBoundary>
      <QueryClientProvider client={queryClient}>
        <Theme accentColor="crimson" grayColor="sand" radius="medium" scaling="95%">
          <Component {...pageProps} />
        </Theme>
      </QueryClientProvider>
    </ErrorBoundary>
  )
}