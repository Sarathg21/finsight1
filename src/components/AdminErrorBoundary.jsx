import React from 'react';

class AdminErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false, error: null };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    console.error("[AdminErrorBoundary] Caught error:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div style={{ padding: '40px', textAlign: 'center', fontFamily: 'system-ui, sans-serif', color: '#334155', minHeight: '80vh', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          <div style={{ maxWidth: '500px', width: '100%', background: '#fff', border: '1px solid #e2e8f0', borderRadius: '8px', padding: '32px', boxShadow: '0 4px 6px -1px rgb(0 0 0 / 0.1)' }}>
            <h2 style={{ color: '#ef4444', marginTop: 0, marginBottom: '16px' }}>Admin page could not be loaded.</h2>
            <p style={{ marginBottom: '24px', fontSize: '15px' }}>
              An unexpected error occurred while loading the Admin module.
            </p>
            <button 
              onClick={this.handleReload}
              style={{
                background: '#0f172a', color: '#fff', padding: '10px 20px', border: 'none', 
                borderRadius: '6px', fontWeight: '500', cursor: 'pointer', fontSize: '14px'
              }}
            >
              Reload
            </button>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}

export default AdminErrorBoundary;
