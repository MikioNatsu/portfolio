import { useEffect, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { CircleAlert, ArrowRight, Lock, Mail } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Field';
import { Sparkle } from '@/components/layout/Logomark';
import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { ApiError } from '@/api/client';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);

  usePageMeta({ title: 'Sign in — Natsu Admin', noindex: true });

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string } | null)?.from ?? '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      setError('Email and password are both required.');
      return;
    }

    try {
      await login.mutateAsync({ email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch (caught) {
      setError(
        caught instanceof ApiError
          ? caught.status === 401
            ? 'Those credentials do not match our records.'
            : caught.message
          : 'Unable to sign in right now.',
      );
    }
  };

  return (
    <div className="relative flex min-h-dvh items-center justify-center overflow-hidden bg-ink-950 px-4 py-12">
      <div className="absolute inset-0 grid-bg opacity-[0.2]" aria-hidden="true" />
      <div
        className="absolute left-1/2 top-0 h-[36rem] w-[36rem] -translate-x-1/2 -translate-y-1/3 rounded-full blur-[140px]"
        style={{ background: 'radial-gradient(circle, rgba(124,58,237,0.32), transparent 70%)' }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6, ease: [0.22, 1, 0.36, 1] }}
        className="relative w-full max-w-md"
      >
        <div className="rounded-[2rem] border border-white/[0.08] bg-ink-800/70 p-7 backdrop-blur-2xl sm:p-9">
          <div className="flex flex-col items-center gap-3 text-center">
            <span className="flex h-12 w-12 items-center justify-center rounded-2xl border border-accent-violet/30 bg-accent-violet/12">
              <Sparkle size={18} className="text-accent-fuchsia" />
            </span>
            <div className="space-y-1">
              <h1 className="font-display text-2xl font-semibold text-haze-100">Welcome back</h1>
              <p className="text-sm text-haze-400">Sign in to manage the portfolio content.</p>
            </div>
          </div>

          <form onSubmit={onSubmit} className="mt-8 space-y-5" noValidate>
            <Input
              label="Email"
              type="email"
              name="email"
              autoComplete="username"
              placeholder="admin@example.com"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              required
              disabled={login.isPending}
            />

            <Input
              label="Password"
              type="password"
              name="password"
              autoComplete="current-password"
              placeholder="••••••••"
              value={password}
              onChange={(event) => setPassword(event.target.value)}
              required
              disabled={login.isPending}
            />

            {error && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <Button
              type="submit"
              fullWidth
              size="lg"
              loading={login.isPending}
              iconRight={<ArrowRight className="h-4 w-4" />}
            >
              {login.isPending ? 'Signing in' : 'Sign in'}
            </Button>
          </form>

          <div className="mt-7 space-y-2.5 border-t border-white/[0.06] pt-6">
            <p className="flex items-center gap-2 text-2xs text-haze-400">
              <Mail className="h-3 w-3" />
              Seeded credentials come from <code className="text-haze-300">ADMIN_EMAIL</code>
            </p>
            <p className="flex items-center gap-2 text-2xs text-haze-400">
              <Lock className="h-3 w-3" />
              Sessions are JWT-based and expire automatically
            </p>
          </div>
        </div>

        <p className="mt-6 text-center text-2xs text-haze-400">
          Protected area — activity is logged.
        </p>
      </motion.div>
    </div>
  );
}
