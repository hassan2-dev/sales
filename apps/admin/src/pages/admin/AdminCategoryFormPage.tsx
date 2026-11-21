import { useEffect, useMemo, useRef, useState } from 'react';
import { Link, Navigate, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { toast } from 'sonner';
import { ImageIcon, Trash2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import { LoadingState } from '@/components/ui/States';
import { Field } from '@/components/admin/Field';
import { StudioDock, StudioHero, StudioPanel } from '@/components/admin/FormStudio';
import { confirmAction } from '@/components/admin/confirm';
import { useI18n } from '@/i18n/i18n-context';
import { statusLabel } from '@/i18n/dictionaries';
import { catalogApi, mediaApi } from '@/services/endpoints';
import { adminPath } from '@/lib/urls';

export function AdminCategoryFormPage({ mode }: { mode: 'create' | 'edit' }) {
  const { t, locale, dir } = useI18n();
  const { id } = useParams();
  const navigate = useNavigate();
  const qc = useQueryClient();
  const isEdit = mode === 'edit';

  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [imageUrl, setImageUrl] = useState('');
  const [parentId, setParentId] = useState('');
  const [sortOrder, setSortOrder] = useState(0);
  const [status, setStatus] = useState<'DRAFT' | 'PUBLISHED' | 'ARCHIVED'>('PUBLISHED');
  const [saving, setSaving] = useState(false);
  const [uploading, setUploading] = useState(false);
  const imageInput = useRef<HTMLInputElement>(null);

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
    setImageUrl(existing.data.imageUrl ?? '');
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
      imageUrl: imageUrl.trim() || null,
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
    if (
      !id ||
      !(await confirmAction({
        title: t.admin.delete,
        description: t.admin.confirmDeleteCategory,
        confirmLabel: t.admin.delete,
        cancelLabel: t.admin.cancel,
        danger: true,
      }))
    ) {
      return;
    }
    try {
      await catalogApi.deleteCategory(id);
      toast.success(t.admin.categoryDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-categories'] });
      navigate(adminPath('categories'));
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  async function onImage(file: File | undefined) {
    if (!file || !file.type.startsWith('image/')) return;
    setUploading(true);
    try {
      const { data } = await mediaApi.upload(file, {
        alt: name.trim() || file.name,
        folder: 'categories/images',
      });
      setImageUrl(data.url);
    } catch {
      toast.error(t.admin.uploadFailed);
    } finally {
      setUploading(false);
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
      <StudioHero
        backTo={adminPath('categories')}
        backLabel={t.admin.back}
        eyebrow={isEdit ? t.admin.editFlow : t.admin.createFlow}
        title={isEdit ? t.admin.editCategory : t.admin.newCategory}
        meta={isEdit ? existing.data?.slug : t.admin.categoryDetailsHint}
        dir={dir}
        actions={
          isEdit ? (
            <Button variant="danger" size="sm" className="gap-1.5" onClick={() => void onDelete()}>
              <Trash2 className="h-3.5 w-3.5" />
              {t.admin.delete}
            </Button>
          ) : null
        }
      />

      <form onSubmit={onSubmit} className="space-y-5">
        <StudioPanel
          id="details"
          step="01"
          title={t.admin.categoryDetails}
          description={t.admin.categoryDetailsHint}
        >
          <div className="grid gap-4 sm:grid-cols-2">
            <Field label={t.admin.categoryImage} hint={t.admin.categoryImageHint} className="sm:col-span-2">
              <div className="flex items-center gap-4">
                <span className="flex h-20 w-32 shrink-0 items-center justify-center overflow-hidden rounded-lg border border-border bg-muted">
                  {imageUrl ? (
                    <img src={imageUrl} alt="" className="h-full w-full object-cover" />
                  ) : (
                    <ImageIcon className="h-5 w-5 text-muted-foreground" />
                  )}
                </span>
                <div className="flex flex-wrap gap-2">
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    disabled={uploading}
                    onClick={() => imageInput.current?.click()}
                  >
                    {uploading ? t.common.loading : t.admin.uploadImage}
                  </Button>
                  {imageUrl ? (
                    <Button type="button" variant="ghost" size="sm" onClick={() => setImageUrl('')}>
                      {t.admin.removeImage}
                    </Button>
                  ) : null}
                  <input
                    ref={imageInput}
                    type="file"
                    accept="image/*"
                    className="sr-only"
                    onChange={(e) => {
                      void onImage(e.target.files?.[0]);
                      e.target.value = '';
                    }}
                  />
                </div>
              </div>
            </Field>
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
        </StudioPanel>

        <StudioDock>
          <Button type="submit" disabled={saving} className="min-w-[8rem]">
            {saving ? t.common.loading : isEdit ? t.common.save : t.common.create}
          </Button>
          <Link to={adminPath('categories')}>
            <Button type="button" variant="outline">
              {t.admin.cancel}
            </Button>
          </Link>
        </StudioDock>
      </form>
    </div>
  );
}
