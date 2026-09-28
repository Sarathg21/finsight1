import React from 'react';

class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error(`[ErrorBoundary${this.props.name ? ` - ${this.props.name}` : ''}] Caught error:`, error, errorInfo);
  }

  handleReset = () => {
    this.setState({ hasError: false, error: null });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      if (this.props.fallback) {
        return typeof this.props.fallback === 'function'
          ? this.props.fallback({ error: this.state.error, reset: this.handleReset })
          : this.props.fallback;
      }

      return (
        <div style={{
          padding: '24px',
          margin: '16px 0',
          background: '#fff',
          border: '1px solid #fecdd3',
          borderRadius: 12,
          boxShadow: '0 4px 12px rgba(225, 29, 72, 0.05)',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          justifyContent: 'center',
          textAlign: 'center',
        }}>
          <div style={{
            width: 44,
            height: 44,
            borderRadius: '50%',
            background: '#ffe4e6',
            color: '#e11d48',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            fontSize: '1.25rem',
            marginBottom: 12,
          }}>
            ⚠
          </div>
          <h4 style={{ margin: '0 0 6px 0', fontSize: '0.95rem', fontWeight: 700, color: '#9f1239' }}>
            {this.props.title || 'Component could not be displayed'}
          </h4>
          <p style={{ margin: '0 0 16px 0', fontSize: '0.78rem', color: '#64748b', maxWidth: 420 }}>
            {this.props.description || 'An unexpected rendering error occurred. You can reset this section or reload the page.'}
          </p>
          <div style={{ display: 'flex', gap: 8 }}>
            <button
              onClick={this.handleReset}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                background: '#4f46e5',
                color: '#fff',
                border: 'none',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Retry
            </button>
            <button
              onClick={() => window.location.reload()}
              style={{
                padding: '6px 16px',
                borderRadius: 8,
                background: '#f1f5f9',
                color: '#334155',
                border: '1px solid #cbd5e1',
                fontSize: '0.75rem',
                fontWeight: 600,
                cursor: 'pointer',
              }}
            >
              Reload Page
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default ErrorBoundary;
