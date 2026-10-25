import { Component, type ErrorInfo, type ReactNode } from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

interface ErrorBoundaryProps {
  children: ReactNode;
  fallback?: ReactNode;
}

interface ErrorBoundaryState {
  hasError: boolean;
  error: Error | null;
}

/**
 * Enterprise Production Error Boundary to prevent application crashes
 * and provide a user-friendly recovery interface while maintaining saved data integrity.
 */
export class ErrorBoundary extends Component<ErrorBoundaryProps, ErrorBoundaryState> {
  public override state: ErrorBoundaryState = {
    hasError: false,
    error: null,
  };

  public static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { hasError: true, error };
  }

  public override componentDidCatch(error: Error, errorInfo: ErrorInfo): void {
    console.error('CelebrateAI ErrorBoundary captured an unhandled render error:', error, errorInfo);
  }

  private handleReset = (): void => {
    this.setState({ hasError: false, error: null });
  };

  public override render(): ReactNode {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return this.props.fallback;
      }

      return (
        <div
          role="alert"
          style={{
            padding: '48px 24px',
            textAlign: 'center',
            maxWidth: 520,
            margin: '40px auto',
            background: 'var(--bg-card, #1e293b)',
            borderRadius: 'var(--radius-lg, 16px)',
            border: '1px solid var(--border-medium, rgba(255, 255, 255, 0.12))',
            boxShadow: 'var(--shadow-lg, 0 10px 25px -5px rgba(0, 0, 0, 0.3))',
            color: 'var(--text-primary, #f8fafc)',
          }}
        >
          <div
            style={{
              width: 52,
              height: 52,
              borderRadius: '50%',
              background: 'rgba(239, 68, 68, 0.15)',
              color: '#ef4444',
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              marginBottom: 16,
            }}
          >
            <AlertTriangle size={28} />
          </div>
          <h2 style={{ fontSize: '1.35rem', marginBottom: 8 }}>Something went wrong</h2>
          <p
            style={{
              color: 'var(--text-secondary, #94a3b8)',
              fontSize: '0.9rem',
              marginBottom: 20,
              lineHeight: 1.5,
            }}
          >
            An unexpected error occurred while rendering this view. Your saved celebration data remains
            safely intact in browser storage.
          </p>
          {this.state.error && (
            <pre
              style={{
                background: 'rgba(0, 0, 0, 0.25)',
                padding: '10px 14px',
                borderRadius: '8px',
                fontSize: '0.75rem',
                color: '#cbd5e1',
                textAlign: 'left',
                overflowX: 'auto',
                marginBottom: 20,
              }}
            >
              {this.state.error.message}
            </pre>
          )}
          <button
            className="btn btn-primary"
            onClick={this.handleReset}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: 8,
              padding: '10px 20px',
              borderRadius: '8px',
              background: 'linear-gradient(135deg, #6366f1 0%, #ec4899 100%)',
              color: 'white',
              border: 'none',
              cursor: 'pointer',
              fontWeight: 600,
            }}
          >
            <RefreshCw size={15} />
            <span>Try Again</span>
          </button>
        </div>
      );
    }

    return this.props.children;
  }
}
