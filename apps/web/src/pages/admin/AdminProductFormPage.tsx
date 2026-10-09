import { useEffect, useMemo, useState, type DragEvent } from 'react';
import { Link, useNavigate, useParams } from 'react-router-dom';
import { useQuery, useQueryClient } from '@tanstack/react-query';
import { useForm } from 'react-hook-form';
import { z } from 'zod';
import { zodResolver } from '@hookform/resolvers/zod';
import { toast } from 'sonner';
import {
  ArrowLeft,
  ArrowRight,
  Copy,
  FileText,
  ImageIcon,
  Plus,
  Power,
  Star,
  Trash2,
  Upload,
  X,
} from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { Input } from '@/components/ui/Input';
import { Select } from '@/components/ui/Select';
import { Textarea } from '@/components/ui/Textarea';
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/components/ui/card';
import { LoadingState } from '@/components/ui/States';
import { useI18n } from '@/i18n/i18n-context';
import { statusLabel } from '@/i18n/dictionaries';
import { catalogApi, mediaApi } from '@/services/endpoints';
import { cn } from '@/lib/cn';
import { adminPath } from '@/lib/urls';
import type { Product } from '@/types';

const productSchema = z.object({
  name: z.string().min(2),
  sku: z.string().min(1),
  price: z.number().min(0),
  stock: z.number().min(0),
  shortDescription: z.string().optional(),
  description: z.string().optional(),
  status: z.enum(['DRAFT', 'ACTIVE', 'ARCHIVED']),
  availability: z.enum(['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PREORDER']),
  currency: z.string(),
  categoryId: z.string().optional(),
  brandId: z.string().optional(),
  featured: z.boolean(),
});

type ProductForm = z.infer<typeof productSchema>;
type SpecRow = { id: string; key: string; value: string };

function specsFromProduct(p?: Product | null): { variantLabel: string; rows: SpecRow[] } {
  const raw = p?.specifications;
  if (!raw || typeof raw !== 'object') return { variantLabel: '', rows: [] };
  const entries = Object.entries(raw as Record<string, unknown>);
  const variantLabel = String(
    entries.find(([k]) => k.toLowerCase() === 'variant')?.[1] ?? '',
  );
  const rows = entries
    .filter(([k]) => k.toLowerCase() !== 'variant')
    .map(([key, value]) => ({
      id: `${key}-${Math.random().toString(36).slice(2, 7)}`,
      key,
      value: String(value ?? ''),
    }));
  return { variantLabel, rows };
}

function buildSpecifications(variantLabel: string, rows: SpecRow[]) {
  const out: Record<string, string> = {};
  if (variantLabel.trim()) out.Variant = variantLabel.trim();
  for (const row of rows) {
    if (row.key.trim()) out[row.key.trim()] = row.value;
  }
  return out;
}

export function AdminProductFormPage() {
  const { t, locale, dir } = useI18n();
  const BackIcon = dir === 'rtl' ? ArrowRight : ArrowLeft;
  const { id } = useParams();
  const isNew = !id || id === 'new';
  const navigate = useNavigate();
  const qc = useQueryClient();
  const [uploading, setUploading] = useState(false);
  const [dragOver, setDragOver] = useState<'images' | 'sheets' | null>(null);
  const [variantLabel, setVariantLabel] = useState('');
  const [specRows, setSpecRows] = useState<SpecRow[]>([]);

  const existing = useQuery({
    queryKey: ['admin-product', id],
    enabled: !isNew,
    queryFn: async () => (await catalogApi.productById(id!)).data,
  });
  const categories = useQuery({
    queryKey: ['admin-categories'],
    queryFn: async () => (await catalogApi.categoriesAdmin()).data,
  });
  const brands = useQuery({
    queryKey: ['admin-brands'],
    queryFn: async () => (await catalogApi.brands()).data,
  });
  const siblings = useQuery({
    queryKey: ['admin-product-siblings', existing.data?.category?.id, id],
    enabled: Boolean(!isNew && existing.data?.category?.id),
    queryFn: async () =>
      (
        await catalogApi.productsAdmin({
          categoryId: existing.data!.category!.id,
          limit: 40,
        })
      ).data,
  });

  const form = useForm<ProductForm>({
    resolver: zodResolver(productSchema) as never,
    defaultValues: {
      name: '',
      sku: '',
      price: 0,
      stock: 0,
      shortDescription: '',
      description: '',
      status: 'DRAFT',
      availability: 'IN_STOCK',
      currency: 'USD',
      categoryId: '',
      brandId: '',
      featured: false,
    },
    values: existing.data
      ? {
          name: existing.data.name,
          sku: existing.data.sku,
          price: Number(existing.data.price),
          stock: existing.data.stock,
          shortDescription: existing.data.shortDescription || '',
          description: existing.data.description || '',
          status: (['DRAFT', 'ACTIVE', 'ARCHIVED'].includes(existing.data.status)
            ? existing.data.status
            : 'DRAFT') as ProductForm['status'],
          availability: (['IN_STOCK', 'LOW_STOCK', 'OUT_OF_STOCK', 'PREORDER'].includes(
            existing.data.availability,
          )
            ? existing.data.availability
            : 'IN_STOCK') as ProductForm['availability'],
          currency: existing.data.currency,
          categoryId: existing.data.category?.id || '',
          brandId: existing.data.brand?.id || '',
          featured: Boolean(existing.data.featured),
        }
      : undefined,
  });

  useEffect(() => {
    if (!existing.data) return;
    const parsed = specsFromProduct(existing.data);
    setVariantLabel(parsed.variantLabel);
    setSpecRows(parsed.rows);
  }, [existing.data?.id]);

  const images = existing.data?.images ?? [];
  const documents = existing.data?.documents ?? [];
  const siblingList = useMemo(
    () => (siblings.data?.data ?? []).filter((p) => p.id !== id),
    [siblings.data, id],
  );

  async function refreshProduct() {
    await qc.invalidateQueries({ queryKey: ['admin-product', id] });
    await qc.invalidateQueries({ queryKey: ['admin-products'] });
    await qc.invalidateQueries({ queryKey: ['admin-product-siblings'] });
  }

  async function onSubmit(values: ProductForm) {
    const payload = {
      ...values,
      categoryId: values.categoryId || null,
      brandId: values.brandId || null,
      specifications: buildSpecifications(variantLabel, specRows),
    };
    try {
      if (isNew) {
        const { data } = await catalogApi.createProduct(payload);
        toast.success(t.admin.productCreated);
        await qc.invalidateQueries({ queryKey: ['admin-products'] });
        navigate(adminPath(`products/${data.id}`));
      } else {
        await catalogApi.updateProduct(id!, payload);
        toast.success(t.admin.productUpdated);
        await refreshProduct();
      }
    } catch {
      toast.error(t.admin.saveFailed);
    }
  }

  async function uploadImages(files: FileList | File[] | null) {
    if (!files || !('length' in files) || !files.length || isNew || !id) return;
    setUploading(true);
    try {
      const list = Array.from(files);
      const hasPrimary = images.some((img) => img.isPrimary);
      for (let i = 0; i < list.length; i += 1) {
        const file = list[i];
        if (!file.type.startsWith('image/')) continue;
        const { data: media } = await mediaApi.upload(file, {
          alt: existing.data?.name || file.name,
          folder: 'products/images',
        });
        await catalogApi.addProductImage(id, {
          url: media.url,
          alt: existing.data?.name || file.name,
          isPrimary: !hasPrimary && i === 0,
          sortOrder: images.length + i,
        });
      }
      toast.success(t.admin.productUpdated);
      await refreshProduct();
    } catch {
      toast.error(t.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  async function uploadSheets(files: FileList | File[] | null) {
    if (!files || !('length' in files) || !files.length || isNew || !id) return;
    setUploading(true);
    try {
      for (const file of Array.from(files)) {
        const { data: media } = await mediaApi.upload(file, {
          folder: 'products/documents',
        });
        await catalogApi.addProductDocument(id, {
          name: file.name,
          url: media.url,
          mimeType: media.mimeType || file.type,
          size: media.size || file.size,
        });
      }
      toast.success(t.admin.productUpdated);
      await refreshProduct();
    } catch {
      toast.error(t.admin.uploadFailed);
    } finally {
      setUploading(false);
    }
  }

  async function setPrimary(imageId: string) {
    if (!id) return;
    try {
      await catalogApi.setPrimaryProductImage(id, imageId);
      await refreshProduct();
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  async function removeImage(imageId: string) {
    if (!id) return;
    try {
      await catalogApi.removeProductImage(id, imageId);
      await refreshProduct();
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  async function removeDocument(documentId: string) {
    if (!id) return;
    try {
      await catalogApi.removeProductDocument(id, documentId);
      await refreshProduct();
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  async function onDelete() {
    if (!id || !window.confirm(t.admin.confirmDeleteProduct)) return;
    try {
      await catalogApi.deleteProduct(id);
      toast.success(t.admin.productDeleted);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate(adminPath('products'));
    } catch {
      toast.error(t.admin.deleteFailed);
    }
  }

  async function onToggleActive() {
    if (!id || !existing.data) return;
    const next = existing.data.status === 'ACTIVE' ? 'ARCHIVED' : 'ACTIVE';
    if (next === 'ARCHIVED' && !window.confirm(t.admin.confirmDeactivate)) return;
    try {
      await catalogApi.updateProduct(id, { status: next });
      toast.success(next === 'ACTIVE' ? t.admin.productActivated : t.admin.productDeactivated);
      await refreshProduct();
    } catch {
      toast.error(t.admin.updateFailed);
    }
  }

  async function duplicateAsVariant() {
    if (!existing.data) return;
    const base = existing.data;
    const suffix = Date.now().toString(36).slice(-4).toUpperCase();
    try {
      const { data } = await catalogApi.createProduct({
        name: base.name,
        sku: `${base.sku}-${suffix}`.slice(0, 48),
        price: Number(base.price),
        stock: 0,
        currency: base.currency || 'USD',
        categoryId: base.category?.id || null,
        brandId: base.brand?.id || null,
        shortDescription: base.shortDescription || '',
        description: base.description || '',
        status: 'DRAFT',
        availability: base.availability || 'IN_STOCK',
        featured: false,
        specifications: buildSpecifications(
          variantLabel || (locale === 'ar' ? 'فارينت جديد' : 'New variant'),
          specRows,
        ),
      });
      toast.success(t.admin.productCreated);
      await qc.invalidateQueries({ queryKey: ['admin-products'] });
      navigate(adminPath(`products/${data.id}`));
    } catch {
      toast.error(t.admin.saveFailed);
    }
  }

  function onDrop(zone: 'images' | 'sheets', e: DragEvent) {
    e.preventDefault();
    setDragOver(null);
    const files = e.dataTransfer.files;
    if (zone === 'images') void uploadImages(files);
    else void uploadSheets(files);
  }

  if (!isNew && existing.isLoading) return <LoadingState variant="form" />;

  return (
    <div className="mx-auto max-w-5xl space-y-5 sm:space-y-6">
      <div className="flex flex-col gap-3 sm:flex-row sm:flex-wrap sm:items-center sm:justify-between">
        <div className="flex min-w-0 items-center gap-2 sm:gap-3">
          <Link to={adminPath('products')} className="shrink-0">
            <Button variant="outline" size="sm" className="gap-1.5">
              <BackIcon className="h-4 w-4" />
              <span className="hidden sm:inline">{t.admin.back}</span>
            </Button>
          </Link>
          <div className="min-w-0">
            <h1 className="truncate text-xl font-bold text-fg sm:text-2xl">
              {isNew ? t.admin.newProduct : t.admin.editProduct}
            </h1>
            {!isNew && existing.data ? (
              <p className="mt-0.5 truncate font-mono text-xs text-muted">{existing.data.sku}</p>
            ) : null}
          </div>
        </div>
        {!isNew ? (
          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 sm:flex-none"
              onClick={() => void duplicateAsVariant()}
            >
              <Copy className="h-3.5 w-3.5" />
              <span className="truncate">{t.admin.createVariant}</span>
            </Button>
            <Button
              variant="outline"
              size="sm"
              className="flex-1 gap-1.5 sm:flex-none"
              onClick={() => void onToggleActive()}
            >
              <Power className="h-3.5 w-3.5" />
              {existing.data?.status === 'ACTIVE' ? t.admin.deactivate : t.admin.activate}
            </Button>
            <Button
              variant="danger"
              size="sm"
              className="gap-1.5"
              onClick={() => void onDelete()}
            >
              <Trash2 className="h-3.5 w-3.5" />
              {t.admin.delete}
            </Button>
          </div>
        ) : null}
      </div>

      <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
        <div className="grid gap-6 lg:grid-cols-5">
          <Card className="lg:col-span-3">
            <CardHeader>
              <CardTitle>{t.admin.productBasics}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input placeholder={t.common.name} {...form.register('name')} />
              <Input placeholder={t.common.sku} {...form.register('sku')} />
              <div className="grid gap-3 sm:grid-cols-2">
                <Select {...form.register('categoryId')}>
                  <option value="">{t.admin.noCategory}</option>
                  {(categories.data ?? []).map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </Select>
                <Select {...form.register('brandId')}>
                  <option value="">{t.admin.noBrand}</option>
                  {(brands.data ?? []).map((b) => (
                    <option key={b.id} value={b.id}>
                      {b.name}
                    </option>
                  ))}
                </Select>
              </div>
              <Textarea
                placeholder={t.admin.shortDescription}
                rows={2}
                {...form.register('shortDescription')}
              />
              <Textarea placeholder={t.admin.description} rows={5} {...form.register('description')} />
              <label className="flex cursor-pointer items-center gap-2 text-sm font-medium text-fg">
                <input type="checkbox" className="h-4 w-4 accent-accent" {...form.register('featured')} />
                {t.admin.featuredProduct}
              </label>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>{t.admin.productPricing}</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Input
                type="number"
                step="0.01"
                placeholder={t.common.price}
                {...form.register('price', { valueAsNumber: true })}
              />
              <Input
                type="number"
                placeholder={t.common.stock}
                {...form.register('stock', { valueAsNumber: true })}
              />
              <Input placeholder={t.admin.currency} {...form.register('currency')} />
              <Select {...form.register('availability')}>
                <option value="IN_STOCK">{statusLabel(locale, 'IN_STOCK')}</option>
                <option value="LOW_STOCK">{statusLabel(locale, 'LOW_STOCK')}</option>
                <option value="OUT_OF_STOCK">{statusLabel(locale, 'OUT_OF_STOCK')}</option>
                <option value="PREORDER">{statusLabel(locale, 'PREORDER')}</option>
              </Select>
              <Select {...form.register('status')}>
                <option value="DRAFT">{statusLabel(locale, 'DRAFT')}</option>
                <option value="ACTIVE">{statusLabel(locale, 'ACTIVE')}</option>
                <option value="ARCHIVED">{statusLabel(locale, 'ARCHIVED')}</option>
              </Select>
            </CardContent>
          </Card>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>{t.admin.productVariants}</CardTitle>
            <CardDescription>{t.admin.variantLabelHint}</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div>
              <label className="mb-1 block text-xs font-bold uppercase tracking-wide text-muted">
                {t.admin.variantLabel}
              </label>
              <Input
                value={variantLabel}
                onChange={(e) => setVariantLabel(e.target.value)}
                placeholder='e.g. 1" / DN25'
              />
            </div>

            <div className="space-y-2">
              {specRows.map((row) => (
                <div key={row.id} className="flex flex-wrap gap-2">
                  <Input
                    className="min-w-[8rem] flex-1"
                    placeholder={t.admin.specKey}
                    value={row.key}
                    onChange={(e) =>
                      setSpecRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, key: e.target.value } : r)),
                      )
                    }
                  />
                  <Input
                    className="min-w-[8rem] flex-1"
                    placeholder={t.admin.specValue}
                    value={row.value}
                    onChange={(e) =>
                      setSpecRows((prev) =>
                        prev.map((r) => (r.id === row.id ? { ...r, value: e.target.value } : r)),
                      )
                    }
                  />
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    className="px-2"
                    onClick={() => setSpecRows((prev) => prev.filter((r) => r.id !== row.id))}
                  >
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              ))}
              <Button
                type="button"
                variant="outline"
                size="sm"
                className="gap-1.5"
                onClick={() =>
                  setSpecRows((prev) => [
                    ...prev,
                    { id: Math.random().toString(36).slice(2), key: '', value: '' },
                  ])
                }
              >
                <Plus className="h-3.5 w-3.5" />
                {t.admin.addSpec}
              </Button>
            </div>

            {!isNew && siblingList.length ? (
              <div className="border-t border-border pt-4">
                <p className="mb-2 text-xs font-bold uppercase tracking-wide text-muted">
                  {t.admin.siblingVariants}
                </p>
                <div className="flex flex-wrap gap-2">
                  {siblingList.map((p) => {
                    const label =
                      p.specifications && typeof p.specifications === 'object'
                        ? String(
                            (p.specifications as Record<string, unknown>).Variant ?? p.sku,
                          )
                        : p.sku;
                    return (
                      <Link
                        key={p.id}
                        to={adminPath(`products/${p.id}`)}
                        className="rounded-lg border border-border bg-page px-3 py-1.5 text-xs font-semibold text-fg transition hover:border-accent hover:text-accent"
                      >
                        {label}
                      </Link>
                    );
                  })}
                </div>
                <p className="mt-2 text-xs text-muted">{t.admin.createVariantHint}</p>
              </div>
            ) : null}
          </CardContent>
          <CardFooter className="gap-2">
            <Button type="submit">{t.common.save}</Button>
            <Link to={adminPath('products')}>
              <Button type="button" variant="outline">
                {t.admin.back}
              </Button>
            </Link>
          </CardFooter>
        </Card>
      </form>

      <div className="grid gap-6 lg:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <ImageIcon className="h-4 w-4" />
              {t.admin.productImages}
            </CardTitle>
            <CardDescription>
              {isNew ? t.admin.mediaAfterSave : t.admin.productImagesHint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isNew ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver('images');
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDrop('images', e)}
                className={cn(
                  'flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition',
                  dragOver === 'images'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-border text-muted hover:border-accent/50 hover:text-fg',
                  uploading && 'pointer-events-none opacity-50',
                )}
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">
                  {uploading ? t.admin.uploading : t.admin.dropImages}
                </span>
                <input
                  type="file"
                  accept="image/*"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    void uploadImages(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            ) : null}

            {images.length ? (
              <div className="grid grid-cols-2 gap-3 sm:grid-cols-3">
                {images.map((img) => (
                  <div
                    key={img.id}
                    className={cn(
                      'group relative overflow-hidden rounded-xl border bg-card',
                      img.isPrimary ? 'border-accent ring-2 ring-accent/30' : 'border-border',
                    )}
                  >
                    <img src={img.url} alt="" className="aspect-square w-full object-cover" />
                    <div className="absolute inset-x-0 bottom-0 flex items-center justify-between gap-1 bg-gradient-to-t from-black/70 to-transparent p-2">
                      <button
                        type="button"
                        className={cn(
                          'inline-flex h-8 items-center gap-1 rounded-lg px-2 text-[11px] font-bold text-white transition',
                          img.isPrimary ? 'bg-accent' : 'bg-white/15 hover:bg-accent',
                        )}
                        onClick={() => void setPrimary(img.id)}
                        title={t.admin.makePrimary}
                      >
                        <Star className={cn('h-3.5 w-3.5', img.isPrimary && 'fill-current')} />
                        {img.isPrimary ? t.admin.setPrimary : t.admin.makePrimary}
                      </button>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg bg-red-600/90 text-white"
                        onClick={() => void removeImage(img.id)}
                        aria-label={t.admin.removeImage}
                      >
                        <Trash2 className="h-3.5 w-3.5" />
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-muted">{t.admin.noImagesYet}</p>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <FileText className="h-4 w-4" />
              {t.admin.datasheets}
            </CardTitle>
            <CardDescription>
              {isNew ? t.admin.mediaAfterSave : t.admin.datasheetsHint}
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            {!isNew ? (
              <label
                onDragOver={(e) => {
                  e.preventDefault();
                  setDragOver('sheets');
                }}
                onDragLeave={() => setDragOver(null)}
                onDrop={(e) => onDrop('sheets', e)}
                className={cn(
                  'flex min-h-[7rem] cursor-pointer flex-col items-center justify-center gap-2 rounded-xl border-2 border-dashed px-4 py-6 text-center text-sm transition',
                  dragOver === 'sheets'
                    ? 'border-accent bg-accent/5 text-accent'
                    : 'border-border text-muted hover:border-accent/50 hover:text-fg',
                  uploading && 'pointer-events-none opacity-50',
                )}
              >
                <Upload className="h-5 w-5" />
                <span className="font-semibold">
                  {uploading ? t.admin.uploading : t.admin.dropSheets}
                </span>
                <input
                  type="file"
                  accept=".pdf,.doc,.docx,.xls,.xlsx,.csv,application/pdf,application/msword,application/vnd.openxmlformats-officedocument.spreadsheetml.sheet,application/vnd.ms-excel"
                  multiple
                  className="sr-only"
                  disabled={uploading}
                  onChange={(e) => {
                    void uploadSheets(e.target.files);
                    e.target.value = '';
                  }}
                />
              </label>
            ) : null}

            {documents.length ? (
              <ul className="space-y-2">
                {documents.map((doc) => (
                  <li
                    key={doc.id}
                    className="flex flex-wrap items-center justify-between gap-3 rounded-xl border border-border bg-page px-3 py-2.5 text-sm"
                  >
                    <a
                      href={doc.url}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex min-w-0 items-center gap-2 font-semibold text-accent hover:underline"
                    >
                      <FileText className="h-4 w-4 shrink-0" />
                      <span className="truncate">{doc.name}</span>
                    </a>
                    <Button
                      type="button"
                      variant="danger"
                      size="sm"
                      onClick={() => void removeDocument(doc.id)}
                    >
                      {t.admin.removeDocument}
                    </Button>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="text-sm text-muted">{t.admin.noSheetsYet}</p>
            )}
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
