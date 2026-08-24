import React from 'react';
import { AlertOctagon, RotateCcw, ChevronDown, ChevronUp, ShieldAlert } from 'lucide-react';
import { ApiService } from '../services/api.js';

export default class ErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    };
  }

  static getDerivedStateFromError(error) {
    return { hasError: true, error };
  }

  componentDidCatch(error, errorInfo) {
    this.setState({ errorInfo });

    // Send exception report to backend SQLite audit trail via centralized ApiService
    try {
      ApiService.logClientError({
        viewName: this.props.viewName || 'React View',
        message: error?.message || String(error),
        stack: error?.stack || null,
        componentStack: errorInfo?.componentStack || null,
        userAgent: navigator.userAgent
      });
    } catch (e) {
      // Ignore network telemetry errors
    }
  }

  handleReset = () => {
    this.setState({
      hasError: false,
      error: null,
      errorInfo: null,
      showDetails: false
    });
    if (this.props.onReset) {
      this.props.onReset();
    }
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="max-w-4xl mx-auto my-8 p-6 bg-white dark:bg-[#0b192e] border-2 border-rose-200 dark:border-rose-900/50 rounded-3xl shadow-xl text-slate-800 dark:text-slate-100 font-sans animate-fade-in">
          <div className="flex items-start gap-4">
            <div className="p-3 bg-rose-100 dark:bg-rose-900/40 rounded-2xl text-rose-600 dark:text-rose-400 shrink-0">
              <AlertOctagon className="h-8 w-8" />
            </div>

            <div className="space-y-2 flex-1">
              <div className="flex items-center gap-2">
                <span className="px-2.5 py-0.5 rounded-full bg-rose-100 dark:bg-rose-900/50 text-rose-700 dark:text-rose-300 text-[11px] font-bold uppercase tracking-wider font-mono">
                  Isolated View Error
                </span>
                <span className="text-xs text-slate-400 font-mono">
                  {this.props.viewName || 'Application Component'}
                </span>
              </div>

              <h3 className="text-lg font-bold text-slate-900 dark:text-white">
                Something went wrong in this view
              </h3>

              <p className="text-xs text-slate-600 dark:text-slate-300 leading-relaxed">
                RevivePay's Error Boundary isolated this crash so the rest of your enterprise dashboard remains fully operational. The exception was cryptographically captured and dispatched to the audit trail.
              </p>

              {this.state.error && (
                <div className="p-3 bg-slate-100 dark:bg-slate-800/60 rounded-xl font-mono text-xs text-rose-700 dark:text-rose-300 break-words">
                  <strong>Error:</strong> {this.state.error.message || String(this.state.error)}
                </div>
              )}

              <div className="pt-2 flex items-center gap-3">
                <button
                  onClick={this.handleReset}
                  className="px-4 py-2 rounded-xl bg-[#0066FF] hover:bg-[#0052cc] text-white text-xs font-bold shadow-md flex items-center gap-2 transition-all"
                >
                  <RotateCcw className="h-3.5 w-3.5" />
                  <span>Reload View</span>
                </button>

                <button
                  onClick={() => this.setState(prev => ({ showDetails: !prev.showDetails }))}
                  className="px-3 py-2 rounded-xl bg-slate-100 dark:bg-slate-800 hover:bg-slate-200 dark:hover:bg-slate-700 text-slate-700 dark:text-slate-300 text-xs font-bold flex items-center gap-1.5 transition-all"
                >
                  <span>{this.state.showDetails ? 'Hide Stack' : 'Show Stack'}</span>
                  {this.state.showDetails ? <ChevronUp className="h-3.5 w-3.5" /> : <ChevronDown className="h-3.5 w-3.5" />}
                </button>
              </div>

              {this.state.showDetails && (
                <pre className="mt-3 p-3 bg-slate-900 text-slate-200 text-[10px] rounded-xl overflow-x-auto font-mono max-h-48">
                  {this.state.error?.stack}
                  {this.state.errorInfo?.componentStack}
                </pre>
              )}
            </div>
          </div>
        </div>
      );
    }

    return this.props.children;
  }
}
