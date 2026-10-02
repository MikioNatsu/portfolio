import { useState, type FormEvent } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { CircleAlert, CircleCheck, Send } from 'lucide-react';
import { publicApi, ApiError } from '@/api/client';
import { CONTACT_SUBJECTS } from '@/lib/constants';
import { isEmail } from '@/lib/utils';
import { Button } from '@/components/ui/Button';
import { Input, Select, Textarea } from '@/components/ui/Field';
import { track } from '@/hooks/useAnalytics';

type Status = 'idle' | 'loading' | 'success' | 'error';

interface FormState {
  name: string;
  email: string;
  subject: string;
  message: string;
  company: string;
}

const EMPTY: FormState = {
  name: '',
  email: '',
  subject: CONTACT_SUBJECTS[0],
  message: '',
  company: '',
};

function validate(values: FormState): Partial<Record<keyof FormState, string>> {
  const errors: Partial<Record<keyof FormState, string>> = {};
  if (!values.name.trim()) errors.name = 'Please tell me your name.';
  else if (values.name.trim().length < 2) errors.name = 'That looks a little short.';
  if (!values.email.trim()) errors.email = 'An email address is required so I can reply.';
  else if (!isEmail(values.email.trim())) errors.email = 'That email address looks invalid.';
  if (!values.subject.trim()) errors.subject = 'Pick or write a subject.';
  if (!values.message.trim()) errors.message = 'The message is empty.';
  else if (values.message.trim().length < 12) errors.message = 'A few more words, please.';
  return errors;
}

export function ContactForm({ className }: { className?: string }) {
  const [values, setValues] = useState<FormState>(EMPTY);
  const [errors, setErrors] = useState<Partial<Record<keyof FormState, string>>>({});
  const [status, setStatus] = useState<Status>('idle');
  const [serverError, setServerError] = useState<string | null>(null);

  const update = (key: keyof FormState) => (event: { target: { value: string } }) => {
    setValues((current) => ({ ...current, [key]: event.target.value }));
    if (errors[key]) setErrors((current) => ({ ...current, [key]: undefined }));
  };

  const onSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const nextErrors = validate(values);
    setErrors(nextErrors);
    if (Object.keys(nextErrors).length > 0) return;

    setStatus('loading');
    setServerError(null);

    try {
      await publicApi.submitContact({
        name: values.name.trim(),
        email: values.email.trim(),
        subject: values.subject.trim(),
        message: values.message.trim(),
        company: values.company,
      });
      setStatus('success');
      setValues(EMPTY);
      track('contact_submitted');
    } catch (error) {
      setStatus('error');
      setServerError(
        error instanceof ApiError
          ? error.message
          : 'Something went wrong while sending. Please try again.',
      );
    }
  };

  return (
    <div className={className}>
      <AnimatePresence mode="wait">
        {status === 'success' ? (
          <motion.div
            key="success"
            initial={{ opacity: 0, scale: 0.96 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.5, ease: [0.22, 1, 0.36, 1] }}
            className="flex flex-col items-center gap-4 rounded-3xl border border-emerald-400/25 bg-emerald-400/[0.06] px-6 py-14 text-center"
            role="status"
          >
            <motion.span
              initial={{ scale: 0.5, rotate: -20 }}
              animate={{ scale: 1, rotate: 0 }}
              transition={{ delay: 0.1, type: 'spring', stiffness: 220, damping: 16 }}
              className="flex h-14 w-14 items-center justify-center rounded-full border border-emerald-400/40 bg-emerald-400/15 text-emerald-200"
            >
              <CircleCheck className="h-6 w-6" />
            </motion.span>
            <div className="space-y-1.5">
              <h3 className="font-display text-xl text-haze-100">Message received</h3>
              <p className="max-w-sm text-sm text-haze-300">
                Thanks for reaching out — I&apos;ll get back to you as soon as I can.
              </p>
            </div>
            <Button variant="secondary" size="sm" onClick={() => setStatus('idle')}>
              Send another message
            </Button>
          </motion.div>
        ) : (
          <motion.form
            key="form"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onSubmit={onSubmit}
            noValidate
            className="space-y-5"
            aria-busy={status === 'loading'}
          >
            <div className="grid gap-5 sm:grid-cols-2">
              <Input
                label="Name"
                name="name"
                autoComplete="name"
                placeholder="Your name"
                required
                value={values.name}
                onChange={update('name')}
                error={errors.name}
                disabled={status === 'loading'}
              />
              <Input
                label="Email"
                name="email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                required
                value={values.email}
                onChange={update('email')}
                error={errors.email}
                disabled={status === 'loading'}
              />
            </div>

            <Select
              label="Subject"
              name="subject"
              required
              value={values.subject}
              onChange={update('subject')}
              error={errors.subject}
              disabled={status === 'loading'}
              options={CONTACT_SUBJECTS.map((subject) => ({ value: subject, label: subject }))}
            />

            <Textarea
              label="Message"
              name="message"
              required
              rows={6}
              placeholder="Tell me about the project, the idea, or the thing you want to build…"
              value={values.message}
              onChange={update('message')}
              error={errors.message}
              disabled={status === 'loading'}
            />

            {/* Honeypot — hidden from users, catches naive bots. */}
            <div className="absolute left-[-9999px] h-0 w-0 overflow-hidden" aria-hidden="true">
              <label htmlFor="company">Company</label>
              <input
                id="company"
                name="company"
                tabIndex={-1}
                autoComplete="off"
                value={values.company}
                onChange={update('company')}
              />
            </div>

            {serverError && (
              <div
                role="alert"
                className="flex items-start gap-2.5 rounded-2xl border border-rose-400/30 bg-rose-500/[0.08] px-4 py-3 text-sm text-rose-200"
              >
                <CircleAlert className="mt-0.5 h-4 w-4 shrink-0" />
                <span>{serverError}</span>
              </div>
            )}

            <div className="flex flex-wrap items-center gap-4">
              <Button
                type="submit"
                size="lg"
                loading={status === 'loading'}
                iconRight={<Send className="h-3.5 w-3.5" />}
              >
                {status === 'loading' ? 'Sending' : 'Send message'}
              </Button>
              <p className="text-2xs text-haze-400">
                Your details are only used to reply to this message.
              </p>
            </div>
          </motion.form>
        )}
      </AnimatePresence>
    </div>
  );
}
