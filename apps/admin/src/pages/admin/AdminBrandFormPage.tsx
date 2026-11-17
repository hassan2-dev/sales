import { useEffect, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/States';
import { Field, FormSection } from '@/components/admin/Field';
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
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
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
      <div className="flex items-center gap-2">
        <Link to={adminPath('brands')}>
          <Button variant="outline" size="sm" className="gap-1.5">
            <BackIcon className="h-4 w-4" />
            {t.admin.back}
          </Button>
        </Link>
        <div>
          <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
            {isEdit ? t.admin.editFlow : t.admin.createFlow}
          </p>
          <h1 className="text-xl font-bold text-fg sm:text-2xl">
            {isEdit ? t.admin.editBrand : t.admin.newBrand}
          </h1>
        </div>
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormSection title={t.admin.brandDetails} description={t.admin.brandsBilingualHint}>
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
        </FormSection>

        <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
          <Button type="submit" disabled={saving} className="min-w-[8rem]">
            {saving ? t.common.loading : isEdit ? t.common.save : t.common.create}
          </Button>
          <Link to={adminPath('brands')}>
            <Button type="button" variant="outline">
              {t.admin.cancel}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
