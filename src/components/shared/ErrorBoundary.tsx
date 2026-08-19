"use client";

import * as React from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";

interface ErrorBoundaryState {
  hasError: boolean;
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, ErrorBoundaryState> {
  state: ErrorBoundaryState = { hasError: false };

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error: unknown) {
    // eslint-disable-next-line no-console
    console.error("UI error boundary caught:", error);
  }

  render() {
    if (this.state.hasError) {
      // Class component — can't use the useLanguage() hook, so read <html dir> directly
      // instead of threading the language context through a render-prop wrapper.
      const isArabic = typeof document !== "undefined" && document.documentElement.dir === "rtl";
      return (
        <div className="flex flex-col items-center justify-center gap-3 rounded-xl border border-border bg-surface py-16 text-center">
          <AlertTriangle className="h-8 w-8 text-danger" />
          <p className="text-sm font-medium text-primary">
            {isArabic ? "حدث خطأ ما أثناء تحميل هذا القسم." : "Something went wrong loading this section."}
          </p>
          <Button variant="outline" size="sm" onClick={() => this.setState({ hasError: false })}>
            {isArabic ? "إعادة المحاولة" : "Try again"}
          </Button>
        </div>
      );
    }
    return this.props.children;
  }
}
