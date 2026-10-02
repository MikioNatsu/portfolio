import { Component, type ErrorInfo, type ReactNode } from 'react';
import { Button } from '@/components/ui/Button';
import { Sparkle } from '@/components/layout/Logomark';

interface Props {
  children: ReactNode;
}

interface State {
  error: Error | null;
}

/**
 * Last line of defence: a render error should never leave the visitor with a
 * blank page. The public shell stays intact and a retry is always offered.
 */
export class ErrorBoundary extends Component<Props, State> {
  state: State = { error: null };

  static getDerivedStateFromError(error: Error): State {
    return { error };
  }

  componentDidCatch(error: Error, info: ErrorInfo) {
    if (import.meta.env.DEV) {
      // eslint-disable-next-line no-console
      console.error('[Natsu] Unhandled render error', error, info.componentStack);
    }
  }

  private reset = () => {
    this.setState({ error: null });
  };

  render() {
    const { error } = this.state;

    if (!error) return this.props.children;

    return (
      <div className="flex min-h-[70vh] items-center justify-center px-6 py-20">
        <div className="glass-strong w-full max-w-lg space-y-5 rounded-3xl p-8 text-center">
          <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-violet/30 bg-accent-violet/10">
            <Sparkle size={18} className="text-accent-fuchsia" />
          </span>
          <div className="space-y-2">
            <h1 className="font-display text-2xl text-haze-100">Something broke on this page</h1>
            <p className="text-sm text-haze-400">
              The rest of the site is fine — try reloading this section.
            </p>
            {import.meta.env.DEV && (
              <pre className="mt-3 max-h-40 overflow-auto rounded-xl border border-white/10 bg-black/40 p-3 text-left text-2xs text-rose-200">
                {error.message}
              </pre>
            )}
          </div>
          <div className="flex flex-wrap justify-center gap-3">
            <Button onClick={this.reset}>Try again</Button>
            <Button variant="secondary" onClick={() => window.location.assign('/')}>
              Back home
            </Button>
          </div>
        </div>
      </div>
    );
  }
}
