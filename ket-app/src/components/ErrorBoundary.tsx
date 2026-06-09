import React from 'react';

interface Props {
  children: React.ReactNode;
  fallback?: React.ReactNode;
}

interface State {
  hasError: boolean;
  error?: Error;
}

export class ErrorBoundary extends React.Component<Props, State> {
  constructor(props: Props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError(error: Error): State {
    return { hasError: true, error };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      const fallback = this.props.fallback || (
        <div className="text-center py-20 px-4">
          <p className="text-5xl mb-4">⚠️</p>
          <h3 className="text-lg font-bold text-red-700 mb-2">页面出错了</h3>
          <p className="text-sm text-gray-500 mb-4 font-mono bg-gray-100 p-2 rounded">
            {this.state.error?.message || '未知错误'}
          </p>
          <button
            onClick={() => this.setState({ hasError: false })}
            className="btn-primary"
          >
            重试
          </button>
        </div>
      );
      return fallback;
    }

    return this.props.children;
  }
}
