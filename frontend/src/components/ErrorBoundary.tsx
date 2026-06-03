import React, { Component, ErrorInfo, ReactNode } from 'react'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  error: Error | null
  errorInfo: ErrorInfo | null
}

export default class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false,
    error: null,
    errorInfo: null,
  }

  public static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error, errorInfo: null }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('Uncaught error:', error, errorInfo)
    this.setState({
      error,
      errorInfo,
    })
  }

  public render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center min-h-screen p-4 bg-red-50">
          <div className="text-center max-w-md">
            <h1 className="text-3xl font-bold text-red-900 mb-2">⚠️ Something went wrong</h1>
            <p className="text-red-700 mb-4">
              An unexpected error occurred. Please try refreshing the page.
            </p>
            
            {this.state.error && (
              <details className="mt-4 p-4 bg-white rounded-lg border border-red-300 text-left">
                <summary className="cursor-pointer font-semibold text-red-900">
                  Error details
                </summary>
                <pre className="mt-2 text-xs text-red-700 overflow-auto max-h-48">
                  {this.state.error.toString()}
                  {this.state.errorInfo?.componentStack}
                </pre>
              </details>
            )}
            
            <button
              onClick={() => window.location.reload()}
              className="mt-6 w-full bg-red-600 hover:bg-red-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Refresh Page
            </button>
            
            <button
              onClick={() => window.location.href = '/'}
              className="mt-2 w-full bg-gray-600 hover:bg-gray-700 text-white font-semibold py-3 px-6 rounded-lg"
            >
              Go to Home
            </button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
