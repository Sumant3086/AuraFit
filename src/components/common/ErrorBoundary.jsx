import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    // Log to console in dev; wire to error tracker in prod
    if (import.meta.env.DEV) {
      console.error('[ErrorBoundary]', error, info.componentStack);
    }
  }

  render() {
    if (!this.state.hasError) return this.props.children;

    const { fallback, minimal } = this.props;

    if (fallback) return fallback;

    if (minimal) {
      return (
        <div style={{
          padding: '20px', textAlign: 'center',
          background: 'var(--red-dim)', border: '1px solid rgba(220,38,38,0.2)',
          borderRadius: 12, margin: 16,
        }}>
          <p style={{ color: 'var(--red)', fontSize: 14, margin: '0 0 8px' }}>Something went wrong loading this section.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '7px 16px', background: 'transparent', border: '1px solid var(--red)',
              borderRadius: 8, color: 'var(--red)', cursor: 'pointer', fontSize: 13,
            }}
          >
            Try again
          </button>
        </div>
      );
    }

    return (
      <div style={{
        minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center',
        background: 'var(--bg)', padding: 40,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 48, marginBottom: 16, opacity: 0.5 }}>⚠️</div>
          <h2 style={{ color: 'var(--text-1)', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Something went wrong</h2>
          <p style={{ color: 'var(--text-3)', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            An unexpected error occurred. Try refreshing the page or contact support if this keeps happening.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              className="btn btn-primary btn-lg"
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              className="btn btn-secondary btn-lg"
            >
              Go home
            </button>
          </div>
          {import.meta.env.DEV && this.state.error && (
            <pre style={{ color: '#ff6666', fontSize: 11, marginTop: 24, textAlign: 'left', overflow: 'auto', maxHeight: 200 }}>
              {this.state.error.toString()}
            </pre>
          )}
        </div>
      </div>
    );
  }
}
