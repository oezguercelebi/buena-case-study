'use client'

import * as React from 'react'
import { Theme } from '@radix-ui/themes'
import type { ThemeProps } from '@radix-ui/themes'

interface ThemeProviderProps extends Omit<ThemeProps, 'children'> {
  children: React.ReactNode
  defaultTheme?: 'light' | 'dark'
  storageKey?: string
}

export function ThemeProvider({
  children,
  defaultTheme = 'light',
  storageKey = 'buena-theme',
  ...props
}: ThemeProviderProps) {
  return (
    <Theme
      accentColor="blue"
      grayColor="slate"
      radius="medium"
      scaling="100%"
      appearance={defaultTheme}
      {...props}
    >
      {children}
    </Theme>
  )
}