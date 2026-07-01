import { Component, type ErrorInfo, type ReactNode } from "react";

type Props = {
  children: ReactNode;
};

type State = {
  error: Error | null;
};

export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    console.error("Tool render failed", error, info.componentStack);
  }

  render() {
    if (this.state.error) {
      return (
        <div className="error-panel" role="alert">
          <strong>工具加载失败</strong>
          <span>{this.state.error.message}</span>
        </div>
      );
    }

    return this.props.children;
  }
}
