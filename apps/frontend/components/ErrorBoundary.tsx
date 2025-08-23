import React, { Component, ErrorInfo, ReactNode } from 'react'

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
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-md w-full space-y-4">
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-start">
                <svg className="h-5 w-5 text-red-600 mt-0.5 mr-3" width="18" height="18" viewBox="0 0 18 18" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M9 1.5L1.5 15H16.5L9 1.5Z" stroke="currentColor" strokeWidth="1.5" strokeLinejoin="round"/>
                  <path d="M9 6V10" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                  <circle cx="9" cy="13" r="0.5" fill="currentColor"/>
                </svg>
                <div>
                  <h3 className="text-lg font-semibold text-red-800 mb-1">Something went wrong</h3>
                  <p className="text-sm text-red-700">An unexpected error occurred. The error has been logged.</p>
                </div>
              </div>
            </div>

            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <h4 className="text-sm font-semibold text-gray-700 mb-2">Error Details (Development Only)</h4>
                <p className="text-xs font-mono text-gray-600">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="mt-2 cursor-pointer">
                    <summary className="text-xs text-gray-500">Component Stack</summary>
                    <pre className="text-xs mt-2 whitespace-pre-wrap overflow-x-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            <div className="flex gap-3">
              <button
                onClick={this.handleReset}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 transition-colors"
              >
                Try Again
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 transition-colors"
              >
                Go to Home
              </button>
            </div>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary