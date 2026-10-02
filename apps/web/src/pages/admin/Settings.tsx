import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Check, Save } from 'lucide-react';
import { adminApi, ApiError } from '@/api/client';
import { AdminPageHeader, Panel } from '@/components/admin/AdminUI';
import { StringListInput } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input, Switch, Textarea } from '@/components/ui/Field';
import { useSettings } from '@/hooks/useContent';

export default function AdminSettings() {
  const { settings } = useSettings();
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
    siteTitle: settings.siteTitle,
    siteDescription: settings.siteDescription,
    seoKeywords: settings.seoKeywords,
    ogImageUrl: settings.ogImageUrl ?? '',
    twitterHandle: settings.twitterHandle ?? '',
    footerNote: settings.footerNote ?? '',
    contactEmail: settings.contactEmail ?? '',
    analyticsEnabled: settings.analyticsEnabled,
  });
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    setValues({
      siteTitle: settings.siteTitle,
      siteDescription: settings.siteDescription,
      seoKeywords: settings.seoKeywords,
      ogImageUrl: settings.ogImageUrl ?? '',
      twitterHandle: settings.twitterHandle ?? '',
      footerNote: settings.footerNote ?? '',
      contactEmail: settings.contactEmail ?? '',
      analyticsEnabled: settings.analyticsEnabled,
    });
  }, [settings]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.updateSettings(payload),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['settings'] });
      window.setTimeout(() => setSaved(false), 2500);
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Could not save settings.'),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.siteTitle.trim() || !values.siteDescription.trim()) {
      setError('Site title and description are both required for SEO.');
      return;
    }

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
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminPageHeader
        title="Settings"
        description="Site metadata, SEO defaults and analytics behaviour."
        actions={
          <Button
            type="submit"
            size="sm"
            loading={save.isPending}
            iconLeft={saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          >
            {saved ? 'Saved' : 'Save settings'}
          </Button>
        }
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

      <div className="grid gap-6 xl:grid-cols-2">
        <Panel title="SEO defaults">
          <div className="space-y-5">
            <Input
              label="Site title"
              required
              value={values.siteTitle}
              onChange={(event) => setValues({ ...values, siteTitle: event.target.value })}
              hint="Used as the home page <title>"
            />
            <Textarea
              label="Site description"
              required
              rows={3}
              value={values.siteDescription}
              onChange={(event) => setValues({ ...values, siteDescription: event.target.value })}
              hint="Meta description and Open Graph fallback"
            />
            <StringListInput
              label="Keywords"
              multiline={false}
              value={values.seoKeywords}
              onChange={(next) => setValues({ ...values, seoKeywords: next })}
              placeholder="frontend developer"
            />
            <Input
              label="Open Graph image URL"
              value={values.ogImageUrl}
              onChange={(event) => setValues({ ...values, ogImageUrl: event.target.value })}
            />
            <Input
              label="Twitter / X handle"
              value={values.twitterHandle}
              onChange={(event) => setValues({ ...values, twitterHandle: event.target.value })}
              placeholder="@natsu"
            />
          </div>
        </Panel>

        <div className="space-y-6">
          <Panel title="Site">
            <div className="space-y-5">
              <Input
                label="Contact email"
                type="email"
                value={values.contactEmail}
                onChange={(event) => setValues({ ...values, contactEmail: event.target.value })}
                hint="Shown to visitors and used as the reply-to address"
              />
              <Input
                label="Footer note"
                value={values.footerNote}
                onChange={(event) => setValues({ ...values, footerNote: event.target.value })}
              />
              <Switch
                checked={values.analyticsEnabled}
                onChange={(checked) => setValues({ ...values, analyticsEnabled: checked })}
                label="Lightweight analytics"
                description="Records page views, project views and submissions. No cookies, no personal data."
              />
            </div>
          </Panel>

          <Panel title="Security notes">
            <ul className="space-y-2.5 text-sm text-haze-400">
              <li>· Credentials live only in environment variables — never in the database.</li>
              <li>· Contact and login endpoints are rate limited.</li>
              <li>· Uploads are validated by MIME type and size on the server.</li>
              <li>· Admin routes reject unauthenticated requests at the API layer.</li>
            </ul>
          </Panel>
        </div>
      </div>
    </form>
  );
}
