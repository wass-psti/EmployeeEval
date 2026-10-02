import React from 'react';
import { AlertTriangle, RefreshCw } from 'lucide-react';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { error: null };
  }

  static getDerivedStateFromError(error) {
    return { error };
  }

  componentDidCatch(error, info) {
    console.error('Employee Evaluation render failure', error, info);
  }

  render() {
    if (!this.state.error) return this.props.children;
    return <div className="screen-center app-crash-screen">
      <div className="error-panel">
        <AlertTriangle size={32} />
        <h2>Employee Evaluation could not continue</h2>
        <p>The interface encountered an unexpected rendering error. No recovery write was attempted.</p>
        <button className="btn primary" onClick={() => window.location.reload()}><RefreshCw size={16}/> Reload Application</button>
      </div>
    </div>;
  }
}
