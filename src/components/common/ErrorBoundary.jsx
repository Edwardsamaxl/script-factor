import { Component } from 'react'

export default class ErrorBoundary extends Component {
  constructor(props) {
    super(props)
    this.state = { hasError: false, error: null }
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error }
  }

  componentDidCatch(error, errorInfo) {
    console.error('ErrorBoundary caught:', error, errorInfo)
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex flex-col items-center justify-center py-16 px-4">
          <div className="w-16 h-16 rounded-2xl bg-red-50 flex items-center justify-center mb-4">
            <svg width="28" height="28" viewBox="0 0 28 28" fill="none" className="text-red-500">
              <circle cx="14" cy="14" r="10" stroke="currentColor" strokeWidth="1.5"/>
              <path d="M14 9v6M14 18v1" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
            </svg>
          </div>
          <p className="text-lg font-semibold text-ink-900 mb-2">页面出错了</p>
          <p className="text-sm text-ink-500 mb-6 text-center">发生了一个意外错误，请刷新页面重试</p>
          <button
            onClick={() => window.location.reload()}
            className="px-6 py-2 rounded-xl bg-ink-900 text-paper-100 text-sm font-medium hover:bg-ink-700 transition-colors"
          >
            刷新页面
          </button>
        </div>
      )
    }

    return this.props.children
  }
}
