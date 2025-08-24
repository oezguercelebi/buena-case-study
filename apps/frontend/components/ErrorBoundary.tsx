import React, { Component, ErrorInfo, ReactNode } from 'react'
import { AlertTriangle, RefreshCw, Home, Bug } from 'lucide-react'

interface Props {
  children?: ReactNode
  fallback?: ReactNode
  onError?: (error: Error, errorInfo: ErrorInfo) => void
  level?: 'page' | 'component' | 'section'
  resetKeys?: Array<string | number>
  resetOnPropsChange?: boolean
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
  retryCount: number
  errorId: string
}

class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
    retryCount: 0,
    errorId: ''
  }

  private maxRetries = 3

  public static getDerivedStateFromError(error: Error): Partial<State> {
    const errorId = `error_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`
    return { 
      hasError: true, 
      error, 
      errorInfo: null, 
      errorId
    }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('ErrorBoundary caught an error:', {
      error: error.toString(),
      stack: error.stack,
      componentStack: errorInfo.componentStack,
      errorId: this.state.errorId,
      level: this.props.level || 'component',
      retryCount: this.state.retryCount
    })

    this.setState({
      error,
      errorInfo
    })

    // Call custom error handler if provided
    if (this.props.onError) {
      this.props.onError(error, errorInfo)
    }

    // In production, you might want to send this to an error reporting service
    if (process.env.NODE_ENV === 'production') {
      // Example: sendErrorToService(error, errorInfo, this.state.errorId)
    }
  }

  private handleReset = () => {
    this.setState((prevState) => ({
      hasError: false,
      error: null,
      errorInfo: null,
      retryCount: prevState.retryCount + 1,
      errorId: ''
    }))
  }

  private canRetry = (): boolean => {
    return this.state.retryCount < this.maxRetries
  }

  private getErrorSeverity = (): 'low' | 'medium' | 'high' => {
    const error = this.state.error
    if (!error) return 'low'

    // Check for critical errors
    if (error.message.includes('ChunkLoadError') || 
        error.message.includes('Loading chunk')) {
      return 'medium' // Usually resolvable with refresh
    }

    if (error.name === 'TypeError' || 
        error.name === 'ReferenceError') {
      return 'high' // Critical runtime errors
    }

    return 'medium'
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }

      const severity = this.getErrorSeverity()
      const level = this.props.level || 'component'
      const canRetry = this.canRetry()

      // Component-level error boundary (smaller, inline errors)
      if (level === 'component') {
        return (
          <div className="border border-red-200 bg-red-50 rounded-lg p-4 m-2">
            <div className="flex items-start space-x-3">
              <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5" />
              <div className="flex-1">
                <h3 className="text-sm font-medium text-red-800">
                  Component Error
                </h3>
                <p className="text-xs text-red-600 mt-1">
                  This section encountered an error and couldn't be displayed.
                </p>
                {canRetry && (
                  <button
                    onClick={this.handleReset}
                    className="mt-2 text-xs bg-red-100 hover:bg-red-200 text-red-800 px-2 py-1 rounded transition-colors inline-flex items-center gap-1"
                  >
                    <RefreshCw className="h-3 w-3" />
                    Retry ({this.maxRetries - this.state.retryCount} attempts left)
                  </button>
                )}
              </div>
            </div>
          </div>
        )
      }

      // Section-level error boundary
      if (level === 'section') {
        return (
          <div className="border border-red-200 bg-red-50 rounded-lg p-6 m-4">
            <div className="text-center">
              <AlertTriangle className="h-8 w-8 text-red-600 mx-auto mb-3" />
              <h3 className="text-lg font-medium text-red-800 mb-2">
                Section Unavailable
              </h3>
              <p className="text-sm text-red-600 mb-4">
                This section encountered a problem and couldn't load properly.
              </p>
              <div className="flex justify-center gap-3">
                {canRetry && (
                  <button
                    onClick={this.handleReset}
                    className="inline-flex items-center gap-2 px-3 py-2 bg-red-100 hover:bg-red-200 text-red-800 rounded-md transition-colors text-sm"
                  >
                    <RefreshCw className="h-4 w-4" />
                    Retry Section
                  </button>
                )}
                <button
                  onClick={() => window.location.reload()}
                  className="px-3 py-2 border border-red-300 text-red-700 rounded-md hover:bg-red-50 transition-colors text-sm"
                >
                  Refresh Page
                </button>
              </div>
            </div>
          </div>
        )
      }

      // Page-level error boundary (full screen)
      return (
        <div className="min-h-screen flex items-center justify-center bg-gray-50 p-6">
          <div className="max-w-lg w-full space-y-6">
            <div className="text-center">
              <div className={`inline-flex items-center justify-center w-16 h-16 rounded-full mb-4 ${
                severity === 'high' ? 'bg-red-100' : 
                severity === 'medium' ? 'bg-yellow-100' : 'bg-blue-100'
              }`}>
                <AlertTriangle className={`h-8 w-8 ${
                  severity === 'high' ? 'text-red-600' : 
                  severity === 'medium' ? 'text-yellow-600' : 'text-blue-600'
                }`} />
              </div>
              <h1 className="text-2xl font-semibold text-gray-900 mb-2">
                Oops! Something went wrong
              </h1>
              <p className="text-gray-600 mb-6">
                {severity === 'high' 
                  ? 'A critical error occurred. Please try refreshing the page or contact support if the problem persists.'
                  : severity === 'medium'
                  ? 'We encountered an unexpected issue. This is usually temporary and can be resolved by trying again.'
                  : 'A minor issue occurred. You can try again or continue with other features.'}
              </p>
            </div>

            {/* Error ID for support */}
            <div className="bg-gray-100 border border-gray-200 rounded-lg p-3 text-center">
              <p className="text-xs text-gray-500">Error ID for support:</p>
              <code className="text-xs font-mono text-gray-700">{this.state.errorId}</code>
            </div>

            {/* Development error details */}
            {process.env.NODE_ENV === 'development' && this.state.error && (
              <div className="bg-gray-100 border border-gray-300 rounded-lg p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Bug className="h-4 w-4 text-gray-600" />
                  <h4 className="text-sm font-semibold text-gray-700">Development Details</h4>
                </div>
                <p className="text-xs font-mono text-gray-600 mb-2">
                  {this.state.error.toString()}
                </p>
                {this.state.errorInfo && (
                  <details className="cursor-pointer">
                    <summary className="text-xs text-gray-500 hover:text-gray-700">Component Stack Trace</summary>
                    <pre className="text-xs mt-2 whitespace-pre-wrap overflow-x-auto bg-white p-2 rounded border max-h-32 overflow-y-auto">
                      {this.state.errorInfo.componentStack}
                    </pre>
                  </details>
                )}
              </div>
            )}

            {/* Action buttons */}
            <div className="flex flex-col sm:flex-row gap-3">
              {canRetry && (
                <button
                  onClick={this.handleReset}
                  className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 bg-blue-600 hover:bg-blue-700 text-white rounded-lg transition-colors font-medium"
                >
                  <RefreshCw className="h-4 w-4" />
                  Try Again ({this.maxRetries - this.state.retryCount} left)
                </button>
              )}
              <button
                onClick={() => window.location.reload()}
                className="flex-1 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                Refresh Page
              </button>
              <button
                onClick={() => window.location.href = '/'}
                className="flex-1 inline-flex items-center justify-center gap-2 px-4 py-3 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors font-medium"
              >
                <Home className="h-4 w-4" />
                Go Home
              </button>
            </div>

            {!canRetry && (
              <div className="text-center text-sm text-gray-500">
                Maximum retry attempts reached. Please refresh the page or contact support.
              </div>
            )}
          </div>
        </div>
      )
    }

    return this.props.children
  }
}

export default ErrorBoundary