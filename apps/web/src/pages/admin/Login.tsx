import { useEffect, useId, useRef, useState, type FormEvent } from 'react';
import { Navigate, useLocation, useNavigate } from 'react-router-dom';
import { motion, useAnimationControls } from 'framer-motion';
import { ArrowRight, CircleAlert, LoaderCircle, LockKeyhole } from 'lucide-react';
import { ApiError } from '@/api/client';
import { EASE_IOS } from '@/animations/variants';
import { Sparkle } from '@/components/layout/Logomark';
import { useAuth } from '@/hooks/useAuth';
import { usePageMeta } from '@/hooks/usePageMeta';
import { SITE_NAME } from '@/lib/constants';
import { cn } from '@/lib/utils';

/** The macOS login-window "no" shake. */
const SHAKE = { x: [0, -12, 11, -8, 7, -4, 2, 0], transition: { duration: 0.5, ease: 'easeOut' } };

const ROW =
  'block w-full bg-transparent px-4 py-3.5 text-base text-sys-label placeholder:text-sys-tertiary focus:outline-none disabled:opacity-60 sm:text-[15px]';

export default function AdminLogin() {
  const navigate = useNavigate();
  const location = useLocation();
  const { login, isAuthenticated } = useAuth();
  const shake = useAnimationControls();
  const emailId = useId();
  const passwordId = useId();
  const errorId = useId();
  const emailRef = useRef<HTMLInputElement>(null);
  const passwordRef = useRef<HTMLInputElement>(null);

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [failures, setFailures] = useState(0);

  usePageMeta({ title: `Sign in — ${SITE_NAME} Admin`, noindex: true });

  useEffect(() => {
    if (isAuthenticated) {
      const from = (location.state as { from?: string } | null)?.from ?? '/admin';
      navigate(from, { replace: true });
    }
  }, [isAuthenticated, location.state, navigate]);

  // After a failed attempt, return focus to the first field that needs it.
  // Runs once the inputs are re-enabled (they're disabled while signing in).
  useEffect(() => {
    if (failures === 0 || login.isPending) return;
    const target = emailRef.current?.value.trim() ? passwordRef.current : emailRef.current;
    target?.focus();
  }, [failures, login.isPending]);

  if (isAuthenticated) return <Navigate to="/admin" replace />;

  const fail = (message: string) => {
    setError(message);
    setFailures((count) => count + 1);
    void shake.start(SHAKE);
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!email.trim() || !password) {
      fail('Enter your email and password.');
      return;
    }

    try {
      await login.mutateAsync({ email: email.trim(), password });
      navigate('/admin', { replace: true });
    } catch (caught) {
      setPassword('');
      fail(
        caught instanceof ApiError
          ? caught.status === 401
            ? 'Incorrect email or password.'
            : caught.message
          : 'Unable to sign in right now.',
      );
    }
  };

  return (
    <div className="relative flex min-h-dvh flex-col items-center justify-center overflow-hidden bg-sys-canvas px-4 py-12">
      <div
        className="pointer-events-none absolute left-1/2 top-[-18rem] h-[36rem] w-[36rem] -translate-x-1/2 rounded-full opacity-60 blur-[120px]"
        style={{
          background: 'radial-gradient(circle, rgb(var(--sys-accent) / 0.35), transparent 70%)',
        }}
        aria-hidden="true"
      />

      <motion.div
        initial={{ opacity: 0, y: 16, scale: 0.98 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ duration: 0.6, ease: EASE_IOS }}
        className="relative w-full max-w-[22rem] text-center"
      >
        <span className="mx-auto flex h-16 w-16 items-center justify-center rounded-[18px] bg-gradient-to-br from-[#8E44EC] to-[#FF2D78] text-white shadow-[0_12px_32px_-10px_rgba(142,68,236,0.7),inset_0_1px_0_rgba(255,255,255,0.25)]">
          <Sparkle size={26} />
        </span>
        <h1 className="mt-6 text-[28px] font-semibold tracking-[-0.025em] text-sys-label">
          Sign in to {SITE_NAME}
        </h1>
        <p className="mt-1.5 text-[15px] text-sys-secondary">Manage your portfolio content.</p>

        <motion.form animate={shake} onSubmit={onSubmit} noValidate className="mt-8 text-left">
          <div
            className={cn(
              'overflow-hidden rounded-[14px] border bg-sys-field shadow-[0_1px_2px_rgba(0,0,0,0.04)] transition-[border-color,box-shadow] duration-200 focus-within:border-sys-accent focus-within:ring-4 focus-within:ring-sys-accent/20',
              error ? 'border-sys-red' : 'border-sys-field-border',
            )}
          >
            <label htmlFor={emailId} className="sr-only">
              Email
            </label>
            <input
              ref={emailRef}
              id={emailId}
              type="email"
              name="email"
              autoComplete="username"
              placeholder="Email"
              value={email}
              onChange={(event) => setEmail(event.target.value)}
              disabled={login.isPending}
              aria-invalid={Boolean(error)}
              aria-describedby={error ? errorId : undefined}
              required
              autoFocus
              className={ROW}
            />
            <div className="mx-4 h-px bg-sys-separator" />
            <div className="flex items-center pr-2">
              <label htmlFor={passwordId} className="sr-only">
                Password
              </label>
              <input
                ref={passwordRef}
                id={passwordId}
                type="password"
                name="password"
                autoComplete="current-password"
                placeholder="Password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                disabled={login.isPending}
                aria-invalid={Boolean(error)}
                aria-describedby={error ? errorId : undefined}
                required
                className={ROW}
              />
              <button
                type="submit"
                aria-label="Sign in"
                disabled={login.isPending}
                className={cn(
                  'flex h-8 w-8 shrink-0 items-center justify-center rounded-full border transition-[background-color,border-color,color,transform] duration-200 active:scale-90',
                  email && password
                    ? 'border-transparent bg-sys-accent-fill text-white'
                    : 'border-sys-field-border text-sys-secondary',
                )}
              >
                {login.isPending ? (
                  <LoaderCircle className="h-4 w-4 animate-spin" aria-hidden="true" />
                ) : (
                  <ArrowRight className="h-4 w-4" aria-hidden="true" />
                )}
              </button>
            </div>
          </div>

          <div className="min-h-[2.75rem] pt-3" aria-live="assertive">
            {error && (
              <motion.p
                id={errorId}
                initial={{ opacity: 0, y: -4 }}
                animate={{ opacity: 1, y: 0 }}
                className="flex items-center justify-center gap-1.5 text-[13px] font-medium text-sys-red-ink"
              >
                <CircleAlert className="h-3.5 w-3.5" aria-hidden="true" />
                {error}
              </motion.p>
            )}
          </div>
        </motion.form>

        <p className="mt-6 flex items-center justify-center gap-1.5 text-[12px] text-sys-secondary">
          <LockKeyhole className="h-3 w-3" aria-hidden="true" />
          Protected area. Sessions expire automatically.
        </p>
      </motion.div>
    </div>
  );
}
