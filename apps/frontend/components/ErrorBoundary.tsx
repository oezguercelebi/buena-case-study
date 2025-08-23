import React, { Component, ErrorInfo, ReactNode } from 'react'
import { Callout, Container, Heading, Text, Button, Flex } from '@radix-ui/themes'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo
    })
  }

  private handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null
    })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      return (
        <Container size="2" p="6">
          <Flex direction="column" gap="4">
            <Callout.Root color="red" variant="surface">
              <Callout.Icon>
                <svg width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 1.5L1.5 15H16.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="13" r="0.5" fill="currentColor"/>
                </svg>
              </Callout.Icon>
              <Callout.Text>
                <Heading size="4" mb="2">Something went wrong</Heading>
                <Text size="2">An unexpected error occurred. The error has been logged.</Text>
              </Callout.Text>
            </Callout.Root>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <Callout.Root color="gray" variant="soft">
                <Callout.Text>
                  <Heading size="3" mb="2">Error Details (Development Only)</Heading>
                  <Text size="1" style={{ fontFamily: 'monospace' }}>
                    {this.state.error.toString()}
                  </Text>
                  {this.state.errorInfo && (
                    <details style={{ marginTop: '8px', cursor: 'pointer' }}>
                      <summary>Component Stack</summary>
                      <pre style={{ fontSize: '11px', marginTop: '8px', whiteSpace: 'pre-wrap' }}>
                        {this.state.errorInfo.componentStack}
                      </pre>
                    </details>
                  )}
                </Callout.Text>
              </Callout.Root>
            )}

            <Flex gap="3">
              <Button onClick={this.handleReset} variant="soft">
                Try Again
              </Button>
              <Button onClick={() => window.location.href = '/'} variant="outline">
                Go to Home
              </Button>
            </Flex>
          </Flex>
        </Container>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary