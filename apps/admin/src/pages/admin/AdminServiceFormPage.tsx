import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/States';
import { Field } from '@/components/admin/Field';
import { StudioDock, StudioHero, StudioPanel } from '@/components/admin/FormStudio';
import { useI18n } from '@/i18n/i18n-context';
import { adminCmsApi } from '@/services/endpoints';
import { adminPath } from '@/lib/urls';

const emptyForm = {
  name: '',
  nameAr: '',
  shortDescription: '',
  shortDescriptionAr: '',
  description: '',
  descriptionAr: '',
};

export function AdminServiceFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t, dir } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const existing = useQuery({
    queryKey: ['admin-service', id],
    enabled: isEdit && Boolean(id),
    queryFn: async () => (await adminCmsApi.serviceById(id!)).data,
  });

  useEffect(() => {
    if (!existing.data) return;
    setForm({
      name: existing.data.name ?? '',
      nameAr: existing.data.nameAr ?? '',
      shortDescription: existing.data.shortDescription ?? '',
      shortDescriptionAr: existing.data.shortDescriptionAr ?? '',
      description: existing.data.description ?? '',
      descriptionAr: existing.data.descriptionAr ?? '',
    });
  }, [existing.data?.id]);

  if (isEdit && !id) return <Navigate to={adminPath('services')} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await adminCmsApi.updateService(id, form);
        toast.success(t.admin.serviceUpdated);
        await qc.invalidateQueries({ queryKey: ['admin-services'] });
        await qc.invalidateQueries({ queryKey: ['admin-service', id] });
      } else {
        const { data } = await adminCmsApi.createService({
          ...form,
          status: 'PUBLISHED',
          slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast.success(t.admin.created);
        await qc.invalidateQueries({ queryKey: ['admin-services'] });
        navigate(adminPath(`services/${data.id}/edit`));
      }
    } catch {
      toast.error(isEdit ? t.admin.saveFailed : t.admin.createFailed);
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && existing.isLoading) return <LoadingState variant="form" />;

  return (
    <div className="mx-auto max-w-4xl space-y-5">
      <StudioHero
        backTo={adminPath('services')}
        backLabel={t.admin.back}
        eyebrow={isEdit ? t.admin.editFlow : t.admin.createFlow}
        title={isEdit ? form.name || t.admin.editService : t.admin.newService}
        meta={t.admin.servicesBilingualHint}
        dir={dir}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <StudioPanel id="details" step="01" title={t.admin.serviceDetails} description={t.admin.servicesBilingualHint}>
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.admin.nameEn} required>
              <Input
                value={form.name}
                onChange={(e) => setForm({ ...form, name: e.target.value })}
                required
              />
            </Field>
            <Field label={t.admin.nameAr}>
              <Input
                value={form.nameAr}
                onChange={(e) => setForm({ ...form, nameAr: e.target.value })}
                dir="rtl"
              />
            </Field>
            <Field label={t.admin.shortDescriptionEn}>
              <Textarea
                rows={3}
                value={form.shortDescription}
                onChange={(e) => setForm({ ...form, shortDescription: e.target.value })}
              />
            </Field>
            <Field label={t.admin.shortDescriptionAr}>
              <Textarea
                rows={3}
                dir="rtl"
                value={form.shortDescriptionAr}
                onChange={(e) => setForm({ ...form, shortDescriptionAr: e.target.value })}
              />
            </Field>
            <Field label={t.admin.descriptionEn}>
              <Textarea
                rows={6}
                value={form.description}
                onChange={(e) => setForm({ ...form, description: e.target.value })}
              />
            </Field>
            <Field label={t.admin.descriptionAr}>
              <Textarea
                rows={6}
                dir="rtl"
                value={form.descriptionAr}
                onChange={(e) => setForm({ ...form, descriptionAr: e.target.value })}
              />
            </Field>
          </div>
        </StudioPanel>

        <StudioDock>
          <Button type="submit" disabled={saving} className="min-w-[8rem]">
            {saving ? t.common.loading : isEdit ? t.common.save : t.common.create}
          </Button>
          <Link to={adminPath('services')}>
            <Button type="button" variant="outline">
              {t.admin.cancel}
            </Button>
          </Link>
        </StudioDock>
      </form>
    </div>
  );
}
