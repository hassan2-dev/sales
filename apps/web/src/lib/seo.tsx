import { Helmet } from 'react-helmet-async';

const SITE = 'Energy Horizon';
const BASE = 'https://energy-horizon.net';

export function Seo({
  title,
  description = 'Industrial oil & gas equipment, engineering services, and trusted supply from Energy Horizon.',
  path = '/',
  image,
}: {
  title: string;
  description?: string;
  path?: string;
  image?: string;
}) {
  const fullTitle = title === SITE ? title : `${title} | ${SITE}`;
  const url = `${BASE}${path}`;

  return (
    <Helmet>
      <title>{fullTitle}</title>
      <meta name="description" content={description} />
      <link rel="canonical" href={url} />
      <meta property="og:title" content={fullTitle} />
      <meta property="og:description" content={description} />
      <meta property="og:url" content={url} />
      <meta property="og:type" content="website" />
      {image ? <meta property="og:image" content={image} /> : null}
      <meta name="twitter:card" content="summary_large_image" />
    </Helmet>
  );
}
