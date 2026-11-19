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
  description: '',
  descriptionAr: '',
};

export function AdminBrandFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t, dir } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';
  const [form, setForm] = useState(emptyForm);
  const [saving, setSaving] = useState(false);

  const existing = useQuery({
    queryKey: ['admin-brand', id],
    enabled: isEdit && Boolean(id),
    queryFn: async () => (await adminCmsApi.brandById(id!)).data,
  });

  useEffect(() => {
    if (!existing.data) return;
    setForm({
      name: existing.data.name ?? '',
      nameAr: existing.data.nameAr ?? '',
      description: existing.data.description ?? '',
      descriptionAr: existing.data.descriptionAr ?? '',
    });
  }, [existing.data?.id]);

  if (isEdit && !id) return <Navigate to={adminPath('brands')} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    try {
      if (isEdit && id) {
        await adminCmsApi.updateBrand(id, form);
        toast.success(t.admin.brandUpdated);
        await qc.invalidateQueries({ queryKey: ['admin-brands'] });
        await qc.invalidateQueries({ queryKey: ['admin-brand', id] });
      } else {
        const { data } = await adminCmsApi.createBrand({
          ...form,
          status: 'PUBLISHED',
          slug: form.name.toLowerCase().replace(/\s+/g, '-'),
        });
        toast.success(t.admin.created);
        await qc.invalidateQueries({ queryKey: ['admin-brands'] });
        navigate(adminPath(`brands/${data.id}/edit`));
      }
    } catch {
      toast.error(isEdit ? t.admin.saveFailed : t.admin.createFailed);
    } finally {
      setSaving(false);
    }
  }

  if (isEdit && existing.isLoading) return <LoadingState variant="form" />;

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <StudioHero
        backTo={adminPath('brands')}
        backLabel={t.admin.back}
        eyebrow={isEdit ? t.admin.editFlow : t.admin.createFlow}
        title={isEdit ? form.name || t.admin.editBrand : t.admin.newBrand}
        meta={t.admin.brandsBilingualHint}
        dir={dir}
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <StudioPanel id="details" step="01" title={t.admin.brandDetails} description={t.admin.brandsBilingualHint}>
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
          <Link to={adminPath('brands')}>
            <Button type="button" variant="outline">
              {t.admin.cancel}
            </Button>
          </Link>
        </StudioDock>
      </form>
    </div>
  );
}
