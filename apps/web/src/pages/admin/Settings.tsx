import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { KeyRound, Monitor, Moon, ShieldCheck, Sun, Timer, Upload } from 'lucide-react';
import type { SiteSettings } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { InlineAlert, ListRow, Panel } from '@/components/admin/Card';
import { TagInput } from '@/components/admin/Fields';
import { PageHeader } from '@/components/admin/PageHeader';
import { SaveBar } from '@/components/admin/SaveBar';
import { SegmentedControl } from '@/components/admin/SegmentedControl';
import { PageSkeleton } from '@/components/admin/Skeleton';
import { Button } from '@/components/ui/Button';
import { Input, Switch, Textarea } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { useAppearance, type AppearancePreference } from '@/hooks/useAppearance';
import { useToast } from '@/hooks/useToast';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { QUERY_KEYS } from '@/lib/constants';

const FORM_ID = 'settings-form';

interface FormValues {
  siteTitle: string;
  siteDescription: string;
  seoKeywords: string[];
  ogImageUrl: string;
  twitterHandle: string;
  footerNote: string;
  contactEmail: string;
  analyticsEnabled: boolean;
}

function toForm(settings: SiteSettings): FormValues {
  return {
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    seoKeywords: settings.seoKeywords,
    ogImageUrl: settings.ogImageUrl ?? '',
    twitterHandle: settings.twitterHandle ?? '',
    footerNote: settings.footerNote ?? '',
    contactEmail: settings.contactEmail ?? '',
    analyticsEnabled: settings.analyticsEnabled,
  };
}

const APPEARANCE_OPTIONS = [
  { value: 'system', label: 'Automatic', icon: Monitor },
  { value: 'light', label: 'Light', icon: Sun },
  { value: 'dark', label: 'Dark', icon: Moon },
] as const satisfies ReadonlyArray<{ value: AppearancePreference; label: string; icon: unknown }>;

function AppearancePanel() {
  const { preference, setPreference } = useAppearance();
  return (
    <Panel title="Appearance" description="Applies to the admin on this device only.">
      <SegmentedControl
        label="Admin appearance"
        options={APPEARANCE_OPTIONS}
        value={preference}
        onChange={setPreference}
        fullWidth
      />
    </Panel>
  );
}

function SettingsForm({ settings }: { settings: SiteSettings }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  const [values, setValues] = useState<FormValues>(() => toForm(settings));
  const [error, setError] = useState<string | null>(null);
  const { dirty, saved, markSaved } = useUnsavedChanges(values);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.updateSettings(payload),
    onSuccess: (updated) => {
      const next = toForm(updated);
      setValues(next);
      markSaved(next);
      setError(null);
      toast({ title: 'Settings saved' });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.settings });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminSettings });
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Couldn’t save settings.'),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.siteTitle.trim() || !values.siteDescription.trim()) {
      setError('Site title and description are both required for SEO.');
      return;
    }
    setError(null);
    save.mutate({
      siteTitle: values.siteTitle.trim(),
      siteDescription: values.siteDescription.trim(),
      seoKeywords: values.seoKeywords.filter(Boolean),
      ogImageUrl: values.ogImageUrl.trim() || null,
      twitterHandle: values.twitterHandle.trim() || null,
      footerNote: values.footerNote.trim() || null,
      contactEmail: values.contactEmail.trim() || null,
      analyticsEnabled: values.analyticsEnabled,
    });
  };

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
      <PageHeader
        title="Settings"
        description="Site metadata, SEO defaults and analytics behaviour."
        actions={
          <Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>
            Save
          </Button>
        }
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="grid gap-5 xl:grid-cols-2">
        <Panel title="Search & sharing">
          <div className="space-y-5">
            <Input
              label="Site title"
              required
              value={values.siteTitle}
              onChange={(event) => set('siteTitle', event.target.value)}
              hint="Home page <title>"
            />
            <Textarea
              label="Site description"
              required
              rows={3}
              value={values.siteDescription}
              onChange={(event) => set('siteDescription', event.target.value)}
              hint="Meta and Open Graph fallback"
            />
            <TagInput
              label="Keywords"
              value={values.seoKeywords}
              onChange={(next) => set('seoKeywords', next)}
              placeholder="frontend developer, anime…"
            />
            <Input
              label="Open Graph image URL"
              inputMode="url"
              value={values.ogImageUrl}
              onChange={(event) => set('ogImageUrl', event.target.value)}
            />
            <Input
              label="Twitter / X handle"
              value={values.twitterHandle}
              onChange={(event) => set('twitterHandle', event.target.value)}
              placeholder="@natsu"
            />
          </div>
        </Panel>

        <div className="min-w-0 space-y-5">
          <Panel title="Site">
            <div className="space-y-5">
              <Input
                label="Contact email"
                type="email"
                inputMode="email"
                value={values.contactEmail}
                onChange={(event) => set('contactEmail', event.target.value)}
                hint="Shown to visitors · reply-to"
              />
              <Input
                label="Footer note"
                value={values.footerNote}
                onChange={(event) => set('footerNote', event.target.value)}
              />
              <Switch
                checked={values.analyticsEnabled}
                onChange={(checked) => set('analyticsEnabled', checked)}
                label="Lightweight analytics"
                description="Page views, project views and submissions. No cookies, no personal data."
              />
            </div>
          </Panel>

          <AppearancePanel />

          <Panel title="Security" padded={false}>
            <div className="pb-1.5">
              <ListRow
                icon={KeyRound}
                tone="gray"
                title="Credentials live only in environment variables"
              />
              <ListRow icon={Timer} tone="orange" title="Contact and login are rate limited" />
              <ListRow icon={Upload} tone="blue" title="Uploads are checked for type and size" />
              <ListRow
                icon={ShieldCheck}
                tone="green"
                title="Admin routes reject unauthenticated requests"
              />
            </div>
          </Panel>
        </div>
      </div>

      <SaveBar
        formId={FORM_ID}
        dirty={dirty}
        saving={save.isPending}
        onDiscard={() => {
          setValues(saved);
          setError(null);
        }}
      />
    </form>
  );
}

export default function AdminSettings() {
  const settings = useQuery({
    queryKey: QUERY_KEYS.adminSettings,
    queryFn: () => adminApi.getSettings(),
  });

  if (settings.isLoading) return <PageSkeleton />;

  if (settings.isError || !settings.data) {
    return (
      <Panel>
        <ErrorState
          title="Couldn’t load settings"
          description="Editing is disabled until the stored settings load, so nothing is overwritten."
          onRetry={() => settings.refetch()}
        />
      </Panel>
    );
  }

  return <SettingsForm settings={settings.data} />;
}
