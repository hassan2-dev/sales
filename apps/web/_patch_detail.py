from pathlib import Path

path = Path(r"c:\Users\lenovo\Desktop\hassan\engin\apps\web\src\pages\store\StorePages.tsx")
text = path.read_text(encoding="utf-8")
start = text.index("export function ProductDetailPage()")
end = text.index("export function CartPage()")

new = r'''export function ProductDetailPage() {
  const { locale } = useI18n();
  const { slug = '' } = useParams();
  const { cart, addItem, updateItem, removeItem, loading } = useCart();
  const [qty, setQty] = useState(1);
  const [busy, setBusy] = useState(false);
  const query = useQuery({
    queryKey: ['product', slug],
    queryFn: async () => (await catalogApi.productBySlug(slug)).data,
  });

  const similarFallback = useQuery({
    queryKey: ['product-similar', query.data?.id, query.data?.category?.id],
    enabled: Boolean(query.data?.id && query.data?.category?.id && !(query.data.similar?.length)),
    queryFn: async () =>
      (
        await catalogApi.products({
          categoryId: query.data!.category!.id,
          excludeId: query.data!.id,
          limit: 8,
        })
      ).data.data,
  });

  if (query.isLoading) return <LoadingState variant="page" />;
  if (query.isError || !query.data) {
    return (
      <ErrorState
        title={locale === 'ar' ? 'المنتج غير موجود' : 'Product not found'}
        onRetry={() => void query.refetch()}
      />
    );
  }

  const p = query.data;
  const similar = (p.similar?.length ? p.similar : similarFallback.data) ?? [];
  const line = cart?.items?.find((i) => i.productId === p.id || i.product?.id === p.id);
  const inCartQty = line?.quantity ?? 0;
  const maxStock = Math.max(1, Number(p.stock ?? 99));
  const disabled = busy || loading;

  async function run(action: () => Promise<void>) {
    setBusy(true);
    try {
      await action();
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <Seo
        title={p.name}
        path={storePath(`products/${slug}`)}
        description={p.shortDescription || undefined}
      />
      <div className="mx-auto max-w-[90rem] px-4 py-12 sm:px-6 lg:px-10">
        <div className="grid gap-10 lg:grid-cols-2">
          <div className="flex min-h-72 items-center justify-center overflow-hidden rounded-2xl border border-line bg-[var(--card)]">
            {p.images?.[0]?.url ? (
              <img
                src={p.images[0].url}
                alt={p.name}
                className="max-h-[420px] w-full object-contain"
              />
            ) : (
              <span className="text-muted">
                {locale === 'ar' ? 'بدون صورة' : 'No product image'}
              </span>
            )}
          </div>
          <div>
            <div className="flex flex-wrap items-center gap-2 text-sm text-muted">
              {p.category ? (
                <Link
                  to={storePath(`categories/${p.category.slug}`)}
                  className="font-semibold text-accent hover:text-accent-soft"
                >
                  {p.category.name}
                </Link>
              ) : null}
              {p.brand ? (
                <>
                  <span>·</span>
                  <span>{p.brand.name}</span>
                </>
              ) : null}
              <span>·</span>
              <span>SKU {p.sku}</span>
            </div>
            <h1 className="mt-3 text-3xl font-extrabold tracking-tight text-fg sm:text-4xl">
              {p.name}
            </h1>
            <p className="mt-4 text-2xl font-extrabold text-accent">
              {formatMoney(p.price, p.currency)}
            </p>
            <p className="mt-2 text-sm text-muted">
              {locale === 'ar' ? 'التوفر' : 'Availability'}: {p.availability} ·{' '}
              {locale === 'ar' ? 'المخزون' : 'Stock'}: {p.stock}
            </p>
            <p className="mt-4 leading-relaxed text-muted">
              {p.shortDescription || p.description}
            </p>
            <div className="mt-6 flex flex-wrap items-center gap-3">
              {inCartQty > 0 && line ? (
                <div className="flex h-11 items-center gap-2 rounded-xl border border-accent/35 bg-accent/10 px-2">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled}
                    className="h-8 w-8 rounded-lg p-0"
                    onClick={() =>
                      void run(async () => {
                        if (inCartQty <= 1) await removeItem(line.id);
                        else await updateItem(line.id, inCartQty - 1);
                      })
                    }
                  >
                    −
                  </Button>
                  <span className="min-w-10 text-center text-base font-extrabold tabular-nums">
                    {inCartQty}
                  </span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    disabled={disabled || inCartQty >= maxStock}
                    className="h-8 w-8 rounded-lg p-0"
                    onClick={() => void run(() => updateItem(line.id, inCartQty + 1))}
                  >
                    +
                  </Button>
                </div>
              ) : (
                <>
                  <Input
                    type="number"
                    min={1}
                    max={maxStock}
                    value={qty}
                    onChange={(e) =>
                      setQty(Math.min(maxStock, Math.max(1, Number(e.target.value) || 1)))
                    }
                    className="w-24 rounded-xl"
                  />
                  <Button
                    className="rounded-xl"
                    disabled={disabled}
                    onClick={() => void run(() => addItem(p.id, qty))}
                  >
                    {locale === 'ar' ? 'أضف للسلة' : 'Add to cart'}
                  </Button>
                </>
              )}
              {p.category ? (
                <Link to={storePath(`categories/${p.category.slug}`)}>
                  <Button variant="outline" className="rounded-xl">
                    {locale === 'ar' ? `منتجات ${p.category.name}` : `${p.category.name} products`}
                  </Button>
                </Link>
              ) : null}
            </div>
            {p.description && p.shortDescription ? (
              <div className="mt-8 whitespace-pre-wrap border-t border-line pt-6 text-sm leading-relaxed text-muted">
                {p.description}
              </div>
            ) : null}
          </div>
        </div>

        {similar.length > 0 ? (
          <div className="mt-16 border-t border-line pt-12">
            <div className="mb-8 flex flex-wrap items-end justify-between gap-4">
              <div>
                <p className="text-xs font-bold uppercase tracking-[0.25em] text-accent">
                  {locale === 'ar' ? 'ذات صلة' : 'Related'}
                </p>
                <h2 className="mt-2 text-2xl font-extrabold tracking-tight sm:text-3xl">
                  {locale === 'ar' ? 'منتجات مشابهة' : 'Similar products'}
                </h2>
              </div>
              {p.category ? (
                <Link
                  to={storePath(`categories/${p.category.slug}`)}
                  className="text-sm font-bold text-accent hover:text-accent-soft"
                >
                  {locale === 'ar' ? 'عرض كل القسم' : 'View category'}
                </Link>
              ) : null}
            </div>
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
              {similar.map((item) => (
                <ProductCard key={item.id} product={item} />
              ))}
            </div>
          </div>
        ) : null}
      </div>
    </>
  );
}

'''

path.write_text(text[:start] + new + text[end:], encoding="utf-8")
print("replaced ProductDetailPage")
