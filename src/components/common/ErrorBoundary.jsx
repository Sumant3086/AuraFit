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
          background: '#1a0505', border: '1px solid #ff444433',
          borderRadius: 12, margin: 16,
        }}>
          <p style={{ color: '#ff6666', fontSize: 14, margin: '0 0 8px' }}>Something went wrong loading this section.</p>
          <button
            onClick={() => this.setState({ hasError: false, error: null })}
            style={{
              padding: '7px 16px', background: 'transparent', border: '1px solid #ff4444',
              borderRadius: 8, color: '#ff4444', cursor: 'pointer', fontSize: 13,
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
        background: '#0a0a0a', padding: 40,
      }}>
        <div style={{ textAlign: 'center', maxWidth: 400 }}>
          <div style={{ fontSize: 56, marginBottom: 16 }}>⚠️</div>
          <h2 style={{ color: '#fff', fontSize: 22, fontWeight: 700, margin: '0 0 10px' }}>Something went wrong</h2>
          <p style={{ color: '#555', fontSize: 15, lineHeight: 1.6, margin: '0 0 24px' }}>
            An unexpected error occurred. Try refreshing the page or contact support if this keeps happening.
          </p>
          <div style={{ display: 'flex', gap: 10, justifyContent: 'center' }}>
            <button
              onClick={() => this.setState({ hasError: false, error: null })}
              style={{
                padding: '11px 22px', background: 'linear-gradient(135deg, #9d00ff, #00d4ff)',
                border: 'none', borderRadius: 10, color: '#fff', cursor: 'pointer', fontSize: 15, fontWeight: 700,
              }}
            >
              Try again
            </button>
            <button
              onClick={() => window.location.href = '/'}
              style={{
                padding: '11px 22px', background: '#111', border: '1px solid #222',
                borderRadius: 10, color: '#888', cursor: 'pointer', fontSize: 15,
              }}
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
