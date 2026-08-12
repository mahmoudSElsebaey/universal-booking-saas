import { Component, type ErrorInfo, type ReactNode } from 'react'
import { Button } from '@/components/ui/Button'

interface Props {
  children: ReactNode
}

interface State {
  hasError: boolean
  message?: string
}

export class ErrorBoundary extends Component<Props, State> {
  state: State = { hasError: false }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, message: error.message }
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error('[ErrorBoundary]', error, info.componentStack)
  }

  handleReload = () => {
    this.setState({ hasError: false, message: undefined })
    window.location.href = '/'
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="min-h-screen flex items-center justify-center bg-background p-6">
          <div className="w-full max-w-lg space-y-4 text-center">
            <h1 className="text-h2 text-text">Something went wrong</h1>
            <p className="text-body-sm text-text-secondary">
              An unexpected error occurred. Please try again.
            </p>
            {import.meta.env.DEV && this.state.message && (
              <pre className="text-xs text-start bg-surface-muted p-3 rounded-md overflow-auto">
                {this.state.message}
              </pre>
            )}
            <Button onClick={this.handleReload}>Go home</Button>
          </div>
        </div>
      )
    }

    return this.props.children
  }
}
