import { useEffect, useState, type FormEvent } from 'react';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { CircleAlert, Check, Plus, Save, Trash2 } from 'lucide-react';
import type { ProfileStat, SocialLink } from '@natsu/types';
import { adminApi, ApiError } from '@/api/client';
import { SOCIAL_ICON_NAMES } from '@/lib/constants';
import { AdminModal, AdminPageHeader, Panel } from '@/components/admin/AdminUI';
import { ImageUploader, StringListInput } from '@/components/admin/ImageUploader';
import { Button } from '@/components/ui/Button';
import { Input, Select, Switch, Textarea } from '@/components/ui/Field';
import { Icon } from '@/components/ui/Icon';
import { useProfile } from '@/hooks/useContent';

export default function AdminProfile() {
  const { profile } = useProfile();
  const queryClient = useQueryClient();

  const [values, setValues] = useState({
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
  });

  const [stats, setStats] = useState<ProfileStat[]>(profile.stats);
  const [links, setLinks] = useState<SocialLink[]>(profile.socialLinks);
  const [saved, setSaved] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [linkModal, setLinkModal] = useState(false);
  const [editingLink, setEditingLink] = useState<SocialLink | null>(null);
  const [linkDraft, setLinkDraft] = useState({ label: '', url: '', icon: 'github', handle: '' });

  useEffect(() => {
    setValues({
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
    });
    setStats(profile.stats);
    setLinks(profile.socialLinks);
  }, [profile]);

  const save = useMutation({
    mutationFn: (payload: Record<string, unknown>) => adminApi.updateProfile(payload),
    onSuccess: () => {
      setSaved(true);
      setError(null);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      window.setTimeout(() => setSaved(false), 2500);
    },
    onError: (caught) =>
      setError(caught instanceof ApiError ? caught.message : 'Could not save the profile.'),
  });

  const saveLink = useMutation({
    mutationFn: (payload: Record<string, unknown>) =>
      editingLink
        ? adminApi.updateSocialLink(editingLink.id, payload)
        : adminApi.createSocialLink(payload),
    onSuccess: () => {
      setLinkModal(false);
      setEditingLink(null);
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const removeLink = useMutation({
    mutationFn: (id: string) => adminApi.deleteSocialLink(id),
    onSuccess: () => {
      void queryClient.invalidateQueries({ queryKey: ['profile'] });
      void queryClient.invalidateQueries({ queryKey: ['social-links'] });
    },
  });

  const onSubmit = (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!values.name.trim() || !values.bio.trim()) {
      setError('Name and bio are required.');
      return;
    }

    save.mutate({
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
      stats: stats.map((stat, index) => ({
        label: stat.label,
        value: stat.value,
        suffix: stat.suffix,
        icon: stat.icon,
        order: index,
        published: stat.published,
      })),
    });
  };

  return (
    <form onSubmit={onSubmit} className="space-y-6">
      <AdminPageHeader
        title="Profile"
        description="Identity, hero content, statistics and social links — all editable."
        actions={
          <Button
            type="submit"
            size="sm"
            loading={save.isPending}
            iconLeft={saved ? <Check className="h-3.5 w-3.5" /> : <Save className="h-3.5 w-3.5" />}
          >
            {saved ? 'Saved' : 'Save profile'}
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

      <div className="grid gap-6 xl:grid-cols-[1.5fr_1fr]">
        <div className="space-y-6">
          <Panel title="Identity">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Name"
                  required
                  value={values.name}
                  onChange={(event) => setValues({ ...values, name: event.target.value })}
                />
                <Input
                  label="Role"
                  value={values.role}
                  onChange={(event) => setValues({ ...values, role: event.target.value })}
                  placeholder="Frontend Developer · Anime Creator"
                />
              </div>

              <Input
                label="Headline"
                value={values.headline}
                onChange={(event) => setValues({ ...values, headline: event.target.value })}
                hint="Used as the About heading"
              />

              <Input
                label="Japanese tagline"
                value={values.tagline}
                onChange={(event) => setValues({ ...values, tagline: event.target.value })}
                placeholder="アニメで広がる、もっと特別な世界。"
              />

              <Textarea
                label="Short bio"
                required
                rows={3}
                value={values.bio}
                onChange={(event) => setValues({ ...values, bio: event.target.value })}
              />

              <Textarea
                label="Long bio"
                rows={5}
                value={values.longBio}
                onChange={(event) => setValues({ ...values, longBio: event.target.value })}
                hint="Shown on the About page only"
              />

              <StringListInput
                label="Hero tech pills"
                multiline={false}
                value={values.techPills}
                onChange={(next) => setValues({ ...values, techPills: next })}
                placeholder="React"
              />
            </div>
          </Panel>

          <Panel title="Contact details">
            <div className="space-y-5">
              <div className="grid gap-5 sm:grid-cols-2">
                <Input
                  label="Email"
                  type="email"
                  value={values.email}
                  onChange={(event) => setValues({ ...values, email: event.target.value })}
                />
                <Input
                  label="Location"
                  value={values.location}
                  onChange={(event) => setValues({ ...values, location: event.target.value })}
                />
              </div>

              <Input
                label="Availability label"
                value={values.availabilityLabel}
                onChange={(event) =>
                  setValues({ ...values, availabilityLabel: event.target.value })
                }
                placeholder="Available for collaboration"
              />

              <Switch
                checked={values.availableForWork}
                onChange={(checked) => setValues({ ...values, availableForWork: checked })}
                label="Available for work"
                description="Shows the pulsing status indicator in the hero and contact page."
              />

              <Input
                label="Résumé URL"
                value={values.resumeUrl}
                onChange={(event) => setValues({ ...values, resumeUrl: event.target.value })}
              />
            </div>
          </Panel>

          <Panel
            title="Statistics"
            description="Leave a statistic out and it disappears from the public site — nothing is hardcoded."
            actions={
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={() =>
                  setStats([
                    ...stats,
                    {
                      id: `new-${Date.now()}`,
                      label: '',
                      value: '',
                      suffix: null,
                      icon: 'sparkles',
                      order: stats.length,
                      published: true,
                    },
                  ])
                }
                iconLeft={<Plus className="h-3.5 w-3.5" />}
              >
                Add
              </Button>
            }
          >
            {stats.length === 0 ? (
              <p className="text-sm text-haze-400">
                No statistics configured. Add one only if you can stand behind the number.
              </p>
            ) : (
              <ul className="space-y-3">
                {stats.map((stat, index) => (
                  <li
                    key={stat.id}
                    className="grid gap-3 rounded-2xl border border-white/[0.07] bg-white/[0.02] p-3.5 sm:grid-cols-[1.4fr_0.8fr_0.6fr_0.9fr_auto]"
                  >
                    <Input
                      label="Label"
                      value={stat.label}
                      onChange={(event) => {
                        const next = [...stats];
                        next[index] = { ...stat, label: event.target.value };
                        setStats(next);
                      }}
                    />
                    <Input
                      label="Value"
                      value={stat.value}
                      onChange={(event) => {
                        const next = [...stats];
                        next[index] = { ...stat, value: event.target.value };
                        setStats(next);
                      }}
                    />
                    <Input
                      label="Suffix"
                      value={stat.suffix ?? ''}
                      onChange={(event) => {
                        const next = [...stats];
                        next[index] = { ...stat, suffix: event.target.value || null };
                        setStats(next);
                      }}
                    />
                    <Select
                      label="Icon"
                      value={stat.icon ?? 'sparkles'}
                      onChange={(event) => {
                        const next = [...stats];
                        next[index] = { ...stat, icon: event.target.value };
                        setStats(next);
                      }}
                      options={[
                        { value: 'sparkles', label: 'Sparkles' },
                        { value: 'heart', label: 'Heart' },
                        { value: 'layers', label: 'Layers' },
                        { value: 'zap', label: 'Zap' },
                        { value: 'star', label: 'Star' },
                        { value: 'briefcase', label: 'Briefcase' },
                        { value: 'users', label: 'Users' },
                      ]}
                    />
                    <button
                      type="button"
                      aria-label={`Remove ${stat.label || 'statistic'}`}
                      onClick={() => setStats(stats.filter((entry) => entry.id !== stat.id))}
                      className="mt-6 flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-white/10 text-haze-400 transition-colors hover:border-rose-400/50 hover:text-rose-200"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                    </button>
                  </li>
                ))}
              </ul>
            )}
          </Panel>
        </div>

        <div className="space-y-6">
          <Panel title="Images">
            <div className="space-y-5">
              <ImageUploader
                label="Avatar / portrait"
                value={values.avatarUrl}
                onChange={(url) => setValues({ ...values, avatarUrl: url })}
                folder="profile"
                aspect="aspect-[4/5]"
              />
              <ImageUploader
                label="Hero artwork"
                value={values.heroImageUrl}
                onChange={(url) => setValues({ ...values, heroImageUrl: url })}
                folder="profile"
                aspect="aspect-[3/4]"
              />
              <p className="text-2xs text-haze-400">
                Leave the hero artwork empty to use the generated scene.
              </p>
            </div>
          </Panel>

          <Panel title="Music widget">
            <div className="space-y-5">
              <Input
                label="Track title"
                value={values.musicTrackTitle}
                onChange={(event) => setValues({ ...values, musicTrackTitle: event.target.value })}
              />
              <Input
                label="Artist"
                value={values.musicTrackArtist}
                onChange={(event) => setValues({ ...values, musicTrackArtist: event.target.value })}
              />
              <Input
                label="Audio URL"
                value={values.musicAudioUrl}
                onChange={(event) => setValues({ ...values, musicAudioUrl: event.target.value })}
                hint="Playback never starts automatically"
              />
              <ImageUploader
                label="Cover"
                value={values.musicCoverUrl}
                onChange={(url) => setValues({ ...values, musicCoverUrl: url })}
                folder="profile"
                aspect="aspect-square"
              />
            </div>
          </Panel>

          <Panel
            title="Social links"
            actions={
              <Button
                type="button"
                variant="subtle"
                size="sm"
                onClick={() => {
                  setEditingLink(null);
                  setLinkDraft({ label: '', url: '', icon: 'github', handle: '' });
                  setLinkModal(true);
                }}
                iconLeft={<Plus className="h-3.5 w-3.5" />}
              >
                Add
              </Button>
            }
          >
            <ul className="space-y-2.5">
              {links.map((link) => (
                <li
                  key={link.id}
                  className="flex items-center gap-3 rounded-xl border border-white/[0.07] bg-white/[0.02] px-3.5 py-2.5"
                >
                  <Icon name={link.icon} size={16} className="text-haze-300" />
                  <span className="min-w-0 flex-1">
                    <span className="block truncate text-sm text-haze-100">{link.label}</span>
                    <span className="block truncate text-2xs text-haze-400">{link.url}</span>
                  </span>
                  <button
                    type="button"
                    aria-label={`Edit ${link.label}`}
                    onClick={() => {
                      setEditingLink(link);
                      setLinkDraft({
                        label: link.label,
                        url: link.url,
                        icon: link.icon,
                        handle: link.handle ?? '',
                      });
                      setLinkModal(true);
                    }}
                    className="text-2xs uppercase tracking-[0.14em] text-haze-400 hover:text-white"
                  >
                    Edit
                  </button>
                  <button
                    type="button"
                    aria-label={`Delete ${link.label}`}
                    onClick={() => removeLink.mutate(link.id)}
                    className="text-haze-400 transition-colors hover:text-rose-300"
                  >
                    <Trash2 className="h-3.5 w-3.5" />
                  </button>
                </li>
              ))}
              {links.length === 0 && (
                <li className="text-sm text-haze-400">No social links yet.</li>
              )}
            </ul>
          </Panel>
        </div>
      </div>

      <AdminModal
        open={linkModal}
        onClose={() => setLinkModal(false)}
        title={editingLink ? `Edit ${editingLink.label}` : 'New social link'}
        size="sm"
        footer={
          <>
            <Button variant="ghost" size="sm" type="button" onClick={() => setLinkModal(false)}>
              Cancel
            </Button>
            <Button
              size="sm"
              type="button"
              loading={saveLink.isPending}
              onClick={() =>
                saveLink.mutate({
                  label: linkDraft.label.trim(),
                  url: linkDraft.url.trim(),
                  icon: linkDraft.icon,
                  handle: linkDraft.handle.trim() || null,
                })
              }
            >
              {editingLink ? 'Save' : 'Create'}
            </Button>
          </>
        }
      >
        <div className="space-y-5">
          <Input
            label="Label"
            value={linkDraft.label}
            onChange={(event) => setLinkDraft({ ...linkDraft, label: event.target.value })}
            placeholder="GitHub"
          />
          <Input
            label="URL"
            type="url"
            value={linkDraft.url}
            onChange={(event) => setLinkDraft({ ...linkDraft, url: event.target.value })}
            placeholder="https://github.com/…"
          />
          <Select
            label="Icon"
            value={linkDraft.icon}
            onChange={(event) => setLinkDraft({ ...linkDraft, icon: event.target.value })}
            options={SOCIAL_ICON_NAMES.map((icon) => ({ value: icon, label: icon }))}
          />
          <Input
            label="Handle"
            value={linkDraft.handle}
            onChange={(event) => setLinkDraft({ ...linkDraft, handle: event.target.value })}
            placeholder="@natsu"
          />
        </div>
      </AdminModal>
    </form>
  );
}
