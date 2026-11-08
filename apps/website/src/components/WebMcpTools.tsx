import { useNavigate } from 'react-router-dom';
import { useWebMCP } from 'use-webmcp-tool';
import { cmsApi } from '@/services/endpoints';
import { SITE_URL, STORE_URL } from '@/lib/urls';
import type { Brand, CmsProject, CmsService } from '@/types';

type ListItem = {
  name?: string;
  slug?: string;
  shortDescription?: string | null;
  description?: string | null;
};

function summarize(items: ListItem[], basePath: string, limit = 12) {
  return items.slice(0, limit).map((item) => ({
    name: item.name,
    slug: item.slug,
    summary: item.shortDescription || item.description || null,
    url: item.slug ? `${SITE_URL}${basePath}/${item.slug}` : null,
  }));
}

/**
 * Registers browser WebMCP tools when `document.modelContext` is available.
 * No-ops on unsupported browsers (feature-detected by use-webmcp-tool).
 */
export function WebMcpTools() {
  const navigate = useNavigate();

  useWebMCP({
    name: 'search_services',
    description:
      'Search published Energy Horizon industrial services (drilling, PPE, manpower, procurement, etc.).',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional free-text filter against service name/description',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ query }: { query?: string }) => {
      const { data } = await cmsApi.services();
      const q = String(query || '')
        .trim()
        .toLowerCase();
      const filtered = q
        ? data.filter((s: CmsService) =>
            [s.name, s.shortDescription, s.description]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(q),
          )
        : data;
      return {
        count: filtered.length,
        services: summarize(filtered, '/services'),
        indexUrl: `${SITE_URL}/services`,
      };
    },
  });

  useWebMCP({
    name: 'search_brands',
    description: 'Search brands and manufacturers represented by Energy Horizon.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional free-text filter against brand name/description',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ query }: { query?: string }) => {
      const { data } = await cmsApi.brands();
      const q = String(query || '')
        .trim()
        .toLowerCase();
      const filtered = q
        ? data.filter((b: Brand) =>
            [b.name, b.description]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(q),
          )
        : data;
      return {
        count: filtered.length,
        brands: summarize(filtered, '/brands'),
        indexUrl: `${SITE_URL}/brands`,
        storeUrl: STORE_URL,
      };
    },
  });

  useWebMCP({
    name: 'search_projects',
    description: 'Search published Energy Horizon project references and field work.',
    inputSchema: {
      type: 'object',
      properties: {
        query: {
          type: 'string',
          description: 'Optional free-text filter against project title/description',
        },
      },
    },
    annotations: { readOnlyHint: true },
    execute: async ({ query }: { query?: string }) => {
      const { data } = await cmsApi.projects();
      const q = String(query || '')
        .trim()
        .toLowerCase();
      const filtered = q
        ? data.filter((p: CmsProject) =>
            [p.title, p.shortDescription, p.description]
              .filter(Boolean)
              .join(' ')
              .toLowerCase()
              .includes(q),
          )
        : data;
      return {
        count: filtered.length,
        projects: summarize(
          filtered.map((p: CmsProject) => ({
            name: p.title,
            slug: p.slug,
            shortDescription: p.shortDescription,
            description: p.description,
          })),
          '/projects',
        ),
        indexUrl: `${SITE_URL}/projects`,
      };
    },
  });

  useWebMCP({
    name: 'open_contact_inquiry',
    description:
      'Open the Energy Horizon contact page so a human can send a commercial inquiry. Does not submit forms automatically.',
    inputSchema: {
      type: 'object',
      properties: {
        topic: {
          type: 'string',
          description: 'Optional topic hint shown in the page hash for the user',
        },
      },
    },
    execute: async ({ topic }: { topic?: string }) => {
      const path = topic ? `/contact#${encodeURIComponent(topic)}` : '/contact';
      navigate(path);
      return {
        opened: true,
        url: `${SITE_URL}${path}`,
        note: 'Contact managers and offices are listed on the page; agents should not invent OAuth or post private quotes without approval.',
      };
    },
  });

  return null;
}
