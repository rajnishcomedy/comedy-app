import React from 'react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null, info: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, info) {
    this.setState({ info });
    console.error('ErrorBoundary caught error:', error, info);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh', display: 'flex', flexDirection: 'column',
          alignItems: 'center', justifyContent: 'center', padding: 24,
          background: 'var(--bg)', color: 'var(--text)',
        }}>
          <h1 style={{ marginBottom: 12 }}>Something went wrong</h1>
          <p style={{ maxWidth: 560, textAlign: 'center', marginBottom: 18 }}>
            An unexpected error occurred. Our team has been notified. Please refresh the page to try again.
          </p>
          <button
            onClick={() => window.location.reload()}
            style={{ padding: '10px 18px', borderRadius: 8, border: 'none', background: 'var(--accent)', color: '#0A0A0A', fontWeight: 700, cursor: 'pointer' }}
          >
            Reload Page
          </button>
          {this.state.error && (
            <pre style={{ marginTop: 24, width: '100%', maxWidth: 640, textAlign: 'left', whiteSpace: 'pre-wrap', color: 'var(--text3)' }}>
              {String(this.state.error)}
            </pre>
          )}
        </div>
      );
    }

    return this.props.children;
  }
}
