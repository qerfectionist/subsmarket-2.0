import { Component, ErrorInfo, ReactNode } from 'react';

interface Props {
    children: ReactNode;
    fallback?: ReactNode;
}

interface State {
    hasError: boolean;
    error: Error | null;
}

/**
 * Error Boundary component to catch JavaScript errors in child components.
 * Displays a fallback UI instead of crashing the entire app.
 */
export class ErrorBoundary extends Component<Props, State> {
    constructor(props: Props) {
        super(props);
        this.state = { hasError: false, error: null };
    }

    static getDerivedStateFromError(error: Error): State {
        return { hasError: true, error };
    }

    componentDidCatch(error: Error, errorInfo: ErrorInfo) {
        // Log error to console (in production, send to error tracking service)
        console.error('ErrorBoundary caught an error:', error, errorInfo);
    }

    handleRetry = () => {
        this.setState({ hasError: false, error: null });
    };

    render() {
        if (this.state.hasError) {
            if (this.props.fallback) {
                return this.props.fallback;
            }

            return (
                <div className="min-h-screen flex items-center justify-center p-4">
                    <div className="card text-center max-w-md">
                        <div className="text-4xl mb-4">😵</div>
                        <h2 className="text-xl font-bold mb-2">Что-то пошло не так</h2>
                        <p className="text-secondary mb-4">
                            Произошла непредвиденная ошибка. Попробуйте перезагрузить страницу.
                        </p>
                        {this.state.error && (
                            <details className="text-left text-xs text-secondary mb-4">
                                <summary className="cursor-pointer">Подробности</summary>
                                <pre className="mt-2 p-2 bg-[var(--color-bg-tertiary)] rounded overflow-auto">
                                    {this.state.error.message}
                                </pre>
                            </details>
                        )}
                        <div className="flex gap-2 justify-center">
                            <button
                                onClick={this.handleRetry}
                                className="btn btn-secondary"
                            >
                                Попробовать снова
                            </button>
                            <button
                                onClick={() => window.location.reload()}
                                className="btn btn-primary"
                            >
                                Перезагрузить
                            </button>
                        </div>
                    </div>
                </div>
            );
        }

        return this.props.children;
    }
}
