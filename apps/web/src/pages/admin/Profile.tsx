import { useState, type FormEvent } from 'react';
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import type { Profile, ProfileStat } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { InlineAlert, Panel } from '@/components/admin/Card';
import { TagInput } from '@/components/admin/Fields';
import { ImageUploader } from '@/components/admin/ImageUploader';
import { PageHeader } from '@/components/admin/PageHeader';
import { SaveBar } from '@/components/admin/SaveBar';
import { PageSkeleton } from '@/components/admin/Skeleton';
import { SocialLinksPanel } from '@/components/admin/profile/SocialLinksPanel';
import { StatsEditor } from '@/components/admin/profile/StatsEditor';
import { Button } from '@/components/ui/Button';
import { Input, Switch, Textarea } from '@/components/ui/Field';
import { ErrorState } from '@/components/ui/States';
import { useToast } from '@/hooks/useToast';
import { useUnsavedChanges } from '@/hooks/useUnsavedChanges';
import { QUERY_KEYS } from '@/lib/constants';

const FORM_ID = 'profile-form';

interface FormValues {
  name: string;
  role: string;
  headline: string;
  tagline: string;
  bio: string;
  longBio: string;
  avatarUrl: string | null;
  heroImageUrl: string | null;
  location: string;
  email: string;
  availabilityLabel: string;
  availableForWork: boolean;
  resumeUrl: string;
  japanesePhrase: string;
  techPills: string[];
  musicTrackTitle: string;
  musicTrackArtist: string;
  musicAudioUrl: string;
  musicCoverUrl: string | null;
  stats: ProfileStat[];
}

function toForm(profile: Profile): FormValues {
  return {
    name: profile.name,
    role: profile.role,
    headline: profile.headline ?? '',
    tagline: profile.tagline ?? '',
    bio: profile.bio,
    longBio: profile.longBio ?? '',
    avatarUrl: profile.avatarUrl,
    heroImageUrl: profile.heroImageUrl,
    location: profile.location ?? '',
    email: profile.email ?? '',
    availabilityLabel: profile.availabilityLabel ?? '',
    availableForWork: profile.availableForWork,
    resumeUrl: profile.resumeUrl ?? '',
    japanesePhrase: profile.japanesePhrase ?? '',
    techPills: profile.techPills,
    musicTrackTitle: profile.musicTrackTitle ?? '',
    musicTrackArtist: profile.musicTrackArtist ?? '',
    musicAudioUrl: profile.musicAudioUrl ?? '',
    musicCoverUrl: profile.musicCoverUrl,
    stats: [...profile.stats].sort((a, b) => a.order - b.order),
  };
}

function toPayload(values: FormValues): Record<string, unknown> {
  return {
    name: values.name.trim(),
    role: values.role.trim(),
    headline: values.headline.trim() || null,
    tagline: values.tagline.trim() || null,
    bio: values.bio.trim(),
    longBio: values.longBio.trim() || null,
    avatarUrl: values.avatarUrl,
    heroImageUrl: values.heroImageUrl,
    location: values.location.trim() || null,
    email: values.email.trim() || null,
    availabilityLabel: values.availabilityLabel.trim() || null,
    availableForWork: values.availableForWork,
    resumeUrl: values.resumeUrl.trim() || null,
    japanesePhrase: values.japanesePhrase.trim() || null,
    techPills: values.techPills.filter(Boolean),
    musicTrackTitle: values.musicTrackTitle.trim() || null,
    musicTrackArtist: values.musicTrackArtist.trim() || null,
    musicAudioUrl: values.musicAudioUrl.trim() || null,
    musicCoverUrl: values.musicCoverUrl,
    // Statistics are replaced wholesale, so every stored entry — published or
    // not — must be sent back or it would be deleted.
    stats: values.stats.map((stat, index) => ({
      label: stat.label.trim(),
      value: stat.value.trim(),
      suffix: stat.suffix,
      icon: stat.icon,
      order: index,
      published: stat.published,
    })),
  };
}

function ProfileForm({ profile }: { profile: Profile }) {
  const queryClient = useQueryClient();
  const { toast } = useToast();
  // Seeded once: later refetches (e.g. after editing a social link) must not
  // overwrite edits in progress.
  const [values, setValues] = useState<FormValues>(() => toForm(profile));
  const [error, setError] = useState<string | null>(null);
  const { dirty, saved, markSaved } = useUnsavedChanges(values);

  const set = <K extends keyof FormValues>(key: K, value: FormValues[K]) =>
    setValues((current) => ({ ...current, [key]: value }));

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.updateProfile(payload),
    onSuccess: (updated) => {
      const next = toForm(updated);
      setValues(next);
      markSaved(next);
      setError(null);
      toast({ title: 'Profile saved' });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.profile });
      void queryClient.invalidateQueries({ queryKey: QUERY_KEYS.adminProfile });
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Couldn’t save the profile.'),
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim() || !values.bio.trim()) {
      setError('Name and short bio are required.');
      return;
    }
    if (values.stats.some((stat) => !stat.label.trim() || !stat.value.trim())) {
      setError('Every statistic needs a label and a value — or remove it.');
      return;
    }
    setError(null);
    save.mutate(toPayload(values));
  };

  return (
    <form id={FORM_ID} onSubmit={onSubmit} noValidate className="space-y-6">
      <PageHeader
        title="Profile"
        description="Identity, hero content, statistics and social links."
        actions={
          <Button type="submit" size="sm" loading={save.isPending} disabled={!dirty}>
            Save
          </Button>
        }
      />

      {error && <InlineAlert>{error}</InlineAlert>}

      <div className="grid gap-5 xl:grid-cols-[1.5fr_1fr]">
        <div className="min-w-0 space-y-5">
          <Panel title="Identity">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  required
                  value={values.name}
                  onChange={(event) => set('name', event.target.value)}
                />
                <Input
                  label="Role"
                  value={values.role}
                  onChange={(event) => set('role', event.target.value)}
                  placeholder="Frontend Developer · Anime Creator"
                />
              </div>
              <Input
                label="Headline"
                value={values.headline}
                onChange={(event) => set('headline', event.target.value)}
                hint="About page heading"
              />
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Japanese tagline"
                  value={values.tagline}
                  onChange={(event) => set('tagline', event.target.value)}
                  placeholder="アニメで広がる、もっと特別な世界。"
                />
                <Input
                  label="Japanese phrase"
                  value={values.japanesePhrase}
                  onChange={(event) => set('japanesePhrase', event.target.value)}
                  hint="Vertical annotation"
                />
              </div>
              <Textarea
                label="Short bio"
                required
                rows={3}
                value={values.bio}
                onChange={(event) => set('bio', event.target.value)}
              />
              <Textarea
                label="Long bio"
                rows={5}
                value={values.longBio}
                onChange={(event) => set('longBio', event.target.value)}
                hint="About page only"
              />
              <TagInput
                label="Hero tech pills"
                value={values.techPills}
                onChange={(next) => set('techPills', next)}
                placeholder="React, TypeScript…"
              />
            </div>
          </Panel>

          <Panel title="Contact & availability">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  inputMode="email"
                  value={values.email}
                  onChange={(event) => set('email', event.target.value)}
                />
                <Input
                  label="Location"
                  value={values.location}
                  onChange={(event) => set('location', event.target.value)}
                />
              </div>
              <Input
                label="Availability label"
                value={values.availabilityLabel}
                onChange={(event) => set('availabilityLabel', event.target.value)}
                placeholder="Available for collaboration"
              />
              <Switch
                checked={values.availableForWork}
                onChange={(checked) => set('availableForWork', checked)}
                label="Available for work"
                description="Shows the pulsing status indicator in the hero and on the contact page."
              />
              <Input
                label="Résumé URL"
                inputMode="url"
                value={values.resumeUrl}
                onChange={(event) => set('resumeUrl', event.target.value)}
              />
            </div>
          </Panel>

          <StatsEditor stats={values.stats} onChange={(stats) => set('stats', stats)} />
        </div>

        <div className="min-w-0 space-y-5">
          <Panel title="Images">
            <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-1">
              <ImageUploader
                label="Avatar / portrait"
                value={values.avatarUrl}
                onChange={(url) => set('avatarUrl', url)}
                folder="profile"
                aspect="aspect-[4/5]"
              />
              <ImageUploader
                label="Hero artwork"
                value={values.heroImageUrl}
                onChange={(url) => set('heroImageUrl', url)}
                folder="profile"
                aspect="aspect-[3/4]"
              />
              <p className="text-xs text-sys-secondary sm:col-span-2 xl:col-span-1">
                Leave the hero artwork empty to use the generated scene.
              </p>
            </div>
          </Panel>

          <Panel title="Music widget" description="Playback never starts automatically.">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-1">
                <Input
                  label="Track title"
                  value={values.musicTrackTitle}
                  onChange={(event) => set('musicTrackTitle', event.target.value)}
                />
                <Input
                  label="Artist"
                  value={values.musicTrackArtist}
                  onChange={(event) => set('musicTrackArtist', event.target.value)}
                />
              </div>
              <Input
                label="Audio URL"
                inputMode="url"
                value={values.musicAudioUrl}
                onChange={(event) => set('musicAudioUrl', event.target.value)}
              />
              <ImageUploader
                label="Cover"
                value={values.musicCoverUrl}
                onChange={(url) => set('musicCoverUrl', url)}
                folder="profile"
                aspect="aspect-square"
                className="max-w-[16rem]"
              />
            </div>
          </Panel>

          <SocialLinksPanel links={[...profile.socialLinks].sort((a, b) => a.order - b.order)} />
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

export default function AdminProfile() {
  const profile = useQuery({
    queryKey: QUERY_KEYS.adminProfile,
    queryFn: () => adminApi.getProfile(),
  });

  if (profile.isLoading) return <PageSkeleton />;

  if (profile.isError || !profile.data) {
    return (
      <Panel>
        <ErrorState
          title="Couldn’t load the profile"
          description="Editing is disabled until the stored profile loads, so nothing is overwritten."
          onRetry={() => profile.refetch()}
        />
      </Panel>
    );
  }

  return <ProfileForm profile={profile.data} />;
}
