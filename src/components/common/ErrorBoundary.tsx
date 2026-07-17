import React, { Component } from 'react'
import type { ErrorInfo, ReactNode } from 'react'
import { reportError } from '@/services/errorMonitoring'
import { ErrorState } from '@/components/ui/FeedbackStates'

interface Props {
  children: ReactNode
  fallback?: ReactNode
}

interface State {
  hasError: boolean
}

export class ErrorBoundary extends Component<Props, State> {
  public state: State = {
    hasError: false
  }

  public static getDerivedStateFromError(_: Error): State {
    return { hasError: true }
  }

  public componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    reportError(error, {
      componentName: 'ErrorBoundary',
      extra: { errorInfo }
    })
  }

  private handleReset = () => {
    this.setState({ hasError: false })
  }

  public render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback
      }
      
      return (
        <div className="max-w-7xl mx-auto px-4 py-16 flex items-center justify-center min-h-[400px]">
          <ErrorState
            title="Component Error Encountered"
            description="The sandbox environment encountered a rendering exception. No proprietary data was leaked."
            retryText="Reset Sandbox"
            onRetry={this.handleReset}
          />
        </div>
      )
    }

    return this.props.children
  }
}
