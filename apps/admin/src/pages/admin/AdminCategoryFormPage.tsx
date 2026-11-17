import { useEffect, useMemo, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ArrowLeft, ArrowRight, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/States';
import { Field, FormSection } from '@/components/admin/Field';
import { useI18n } from '@/i18n/i18n-context';
import { statusLabel } from '@/i18n/dictionaries';
import { catalogApi } from '@/services/endpoints';
import { adminPath } from '@/lib/urls';

export function AdminCategoryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t, locale, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [saving, setSaving] = useState(false);

  const existing = useQuery({
    queryKey: ['admin-category', id],
    enabled: isEdit && Boolean(id),
    queryFn: async () => (await catalogApi.categoryById(id!)).data,
  });

  const list = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await catalogApi.categoriesAdmin()).data,
  });

  const parents = useMemo(
    () => (list.data ?? []).filter((c) => c.id !== id && !c.parentId),
    [list.data, id],
  );

  useEffect(() => {
    if (!existing.data) return;
    setName(existing.data.name ?? '');
    setDescription(existing.data.description ?? '');
    setParentId(existing.data.parentId ?? existing.data.parent?.id ?? '');
    setSortOrder(existing.data.sortOrder ?? 0);
    const st = existing.data.status;
    setStatus(
      st === 'DRAFT' || st === 'PUBLISHED' || st === 'ARCHIVED' ? st : 'PUBLISHED',
    );
  }, [existing.data?.id]);

  if (isEdit && !id) return <Navigate to={adminPath('categories')} replace />;

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setSaving(true);
    const payload = {
      name: name.trim(),
      description: description.trim() || null,
      parentId: parentId || null,
      sortOrder: Number.isFinite(sortOrder) ? sortOrder : 0,
      status,
      slug: name
        .trim()
        .toLowerCase()
        .replace(/\s+/g, '-')
        .replace(/[^a-z0-9-]/g, ''),
    };
    try {
      if (isEdit && id) {
        await catalogApi.updateCategory(id, payload);
        toast.success(t.admin.categoryUpdated);
        await qc.invalidateQueries({ queryKey: ['admin-categories'] });
        await qc.invalidateQueries({ queryKey: ['admin-category', id] });
      } else {
        const { data } = await catalogApi.createCategory(payload);
        toast.success(t.admin.categoryCreated);
        await qc.invalidateQueries({ queryKey: ['admin-categories'] });
        navigate(adminPath(`categories/${data.id}/edit`));
      }
    } catch {
      toast.error(t.admin.saveFailed);
    } finally {
      setSaving(false);
    }
  }

  async function onDelete() {
    if (!id || !window.confirm(t.admin.confirmDeleteCategory)) return;
    try {
      await catalogApi.deleteCategory(id);
      toast.success(t.admin.categoryDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
      navigate(adminPath('categories'));
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  if (isEdit && existing.isLoading) return <LoadingState variant="form" />;
  if (isEdit && (existing.isError || !existing.data)) {
    return (
      <div className="space-y-4">
        <p className="text-sm text-muted-foreground">{t.admin.emptyList}</p>
        <Link to={adminPath('categories')}>
          <Button variant="outline">{t.admin.back}</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="mx-auto max-w-3xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex min-w-0 items-center gap-2">
          <Link to={adminPath('categories')}>
            <Button variant="outline" size="sm" className="gap-1.5">
              <BackIcon className="h-4 w-4" />
              {t.admin.back}
            </Button>
          </Link>
          <div className="min-w-0">
            <p className="text-xs font-bold uppercase tracking-[0.16em] text-muted-foreground">
              {t.admin.categories}
            </p>
            <h1 className="truncate text-xl font-bold text-fg sm:text-2xl">
              {isEdit ? t.admin.editCategory : t.admin.newCategory}
            </h1>
          </div>
        </div>
        {isEdit ? (
          <Button variant="danger" size="sm" className="gap-1.5" onClick={() => void onDelete()}>
            <Trash2 className="h-3.5 w-3.5" />
            {t.admin.delete}
          </Button>
        ) : null}
      </div>

      <form onSubmit={onSubmit} className="space-y-5">
        <FormSection
          title={t.admin.categoryDetails}
          description={t.admin.categoryDetailsHint}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.common.name} required className="sm:col-span-2">
              <Input value={name} onChange={(e) => setName(e.target.value)} required />
            </Field>
            <Field label={t.admin.parentCategory} hint={t.admin.parentCategoryHint}>
              <Select value={parentId} onChange={(e) => setParentId(e.target.value)}>
                <option value="">{t.admin.noParentCategory}</option>
                {parents.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.name}
                  </option>
                ))}
              </Select>
            </Field>
            <Field label={t.admin.sortOrder}>
              <Input
                type="number"
                min={0}
                value={sortOrder}
                onChange={(e) => setSortOrder(Number(e.target.value) || 0)}
              />
            </Field>
            <Field label={t.common.status}>
              <Select
                value={status}
                onChange={(e) =>
                  setStatus(e.target.value as 'DRAFT' | 'PUBLISHED' | 'ARCHIVED')
                }
              >
                <option value="DRAFT">{statusLabel(locale, 'DRAFT')}</option>
                <option value="PUBLISHED">{statusLabel(locale, 'PUBLISHED')}</option>
                <option value="ARCHIVED">{statusLabel(locale, 'ARCHIVED')}</option>
              </Select>
            </Field>
            <Field label={t.admin.description} className="sm:col-span-2">
              <Textarea
                rows={5}
                value={description}
                onChange={(e) => setDescription(e.target.value)}
              />
            </Field>
          </div>
        </FormSection>

        <div className="sticky bottom-3 z-10 flex flex-wrap gap-2 rounded-2xl border border-border bg-card/95 p-3 shadow-lg backdrop-blur">
          <Button type="submit" disabled={saving} className="min-w-[8rem]">
            {saving ? t.common.loading : isEdit ? t.common.save : t.common.create}
          </Button>
          <Link to={adminPath('categories')}>
            <Button type="button" variant="outline">
              {t.admin.cancel}
            </Button>
          </Link>
        </div>
      </form>
    </div>
  );
}
