import React from "react";

interface AppErrorBoundaryState {
  hasError: boolean;
  message: string;
}

interface AppErrorBoundaryProps {
  children: React.ReactNode;
}

export class AppErrorBoundary extends React.Component<
  AppErrorBoundaryProps,
  AppErrorBoundaryState
> {
  state: AppErrorBoundaryState = {
    hasError: false,
    message: "",
  };

  static getDerivedStateFromError(error: Error): AppErrorBoundaryState {
    return {
      hasError: true,
      message: error?.message || "Unexpected application error",
    };
  }

  componentDidCatch(error: Error, errorInfo: React.ErrorInfo) {
    console.error("AppErrorBoundary caught:", error, errorInfo);
  }

  handleReload = () => {
    window.location.reload();
  };

  render() {
    if (this.state.hasError) {
      return (
        <div className="flex min-h-screen items-center justify-center bg-background px-4">
          <div className="w-full max-w-lg rounded-[24px] border border-destructive/20 bg-card p-8 text-center shadow-lg">
            <h1 className="mb-3 text-2xl text-destructive">Application Error</h1>
            <p className="mb-6 text-sm text-muted-foreground">
              {this.state.message || "Something went wrong. Please reload the page."}
            </p>
            <button
              className="rounded-xl bg-primary px-5 py-3 text-sm text-white transition-colors hover:bg-[#1557CC]"
              onClick={this.handleReload}
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
