import { Injectable } from '@nestjs/common';
import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { z } from 'zod/v4';
import { ServicesService } from '../services/services.service.js';
import { BrandsService } from '../brands/brands.service.js';
import { ProjectsService } from '../projects/projects.service.js';
import { OfficesService } from '../offices/offices.service.js';

const SITE = 'https://www.energy-horizon.net';

@Injectable()
export class McpService {
  constructor(
    private readonly services: ServicesService,
    private readonly brands: BrandsService,
    private readonly projects: ProjectsService,
    private readonly offices: OfficesService,
  ) {}

  createServer() {
    const server = new McpServer({
      name: 'energy-horizon.net/public-cms',
      version: '1.0.0',
      websiteUrl: SITE,
    });

    server.registerTool(
      'list_services',
      {
        title: 'List services',
        description: 'List published Energy Horizon industrial services',
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe('Optional free-text filter'),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ query }) => {
        const rows = await this.services.findAllPublic();
        const q = String(query || '')
          .trim()
          .toLowerCase();
        const filtered = q
          ? rows.filter(
              (s: { name: string; shortDescription?: string | null; description?: string | null }) =>
                [s.name, s.shortDescription, s.description]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(q),
            )
          : rows;
        const payload = filtered.map(
          (s: {
            name: string;
            slug: string;
            shortDescription?: string | null;
            description?: string | null;
          }) => ({
            name: s.name,
            slug: s.slug,
            summary: s.shortDescription || s.description,
            url: `${SITE}/services/${s.slug}`,
          }),
        );
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ count: payload.length, services: payload }, null, 2) }],
        };
      },
    );

    server.registerTool(
      'list_brands',
      {
        title: 'List brands',
        description: 'List brands represented by Energy Horizon',
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe('Optional free-text filter'),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ query }) => {
        const rows = await this.brands.findAllPublic();
        const q = String(query || '')
          .trim()
          .toLowerCase();
        const filtered = q
          ? rows.filter((b: { name: string; description?: string | null }) =>
              [b.name, b.description]
                .filter(Boolean)
                .join(' ')
                .toLowerCase()
                .includes(q),
            )
          : rows;
        const payload = filtered.map(
          (b: { name: string; slug: string; description?: string | null }) => ({
            name: b.name,
            slug: b.slug,
            summary: b.description,
            url: `${SITE}/brands/${b.slug}`,
          }),
        );
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ count: payload.length, brands: payload }, null, 2) }],
        };
      },
    );

    server.registerTool(
      'list_projects',
      {
        title: 'List projects',
        description: 'List published Energy Horizon project references',
        inputSchema: {
          query: z
            .string()
            .optional()
            .describe('Optional free-text filter'),
        },
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async ({ query }) => {
        const rows = await this.projects.findAllPublic();
        const q = String(query || '')
          .trim()
          .toLowerCase();
        const filtered = q
          ? rows.filter(
              (p: {
                title: string;
                shortDescription?: string | null;
                description?: string | null;
              }) =>
                [p.title, p.shortDescription, p.description]
                  .filter(Boolean)
                  .join(' ')
                  .toLowerCase()
                  .includes(q),
            )
          : rows;
        const payload = filtered.map(
          (p: {
            title: string;
            slug: string;
            shortDescription?: string | null;
            description?: string | null;
          }) => ({
            name: p.title,
            slug: p.slug,
            summary: p.shortDescription || p.description,
            url: `${SITE}/projects/${p.slug}`,
          }),
        );
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ count: payload.length, projects: payload }, null, 2) }],
        };
      },
    );

    server.registerTool(
      'list_offices',
      {
        title: 'List offices',
        description: 'List Energy Horizon offices and contact points in Iraq',
        inputSchema: {},
        annotations: { readOnlyHint: true, openWorldHint: false },
      },
      async () => {
        const rows = await this.offices.findAllPublic();
        const payload = rows.map(
          (o: {
            name: string;
            city?: string | null;
            country?: string | null;
            phone?: string | null;
            email?: string | null;
          }) => ({
            name: o.name,
            city: o.city,
            country: o.country,
            phone: o.phone,
            email: o.email,
          }),
        );
        return {
          content: [
            {
              type: 'text' as const,
              text: JSON.stringify(
                { count: payload.length, offices: payload, contactUrl: `${SITE}/contact` },
                null,
                2,
              ),
            },
          ],
        };
      },
    );

    return server;
  }

  serverCard() {
    return {
      $schema: 'https://static.modelcontextprotocol.io/schemas/v1/server-card.schema.json',
      name: 'energy-horizon.net/public-cms',
      version: '1.0.0',
      description: 'Public CMS tools for Energy Horizon services, brands, and projects.',
      title: 'Energy Horizon Public CMS',
      websiteUrl: SITE,
      remotes: [
        {
          type: 'streamable-http' as const,
          url: 'https://api.energy-horizon.net/mcp',
          supportedProtocolVersions: ['2025-06-18', '2025-03-26'],
        },
      ],
    };
  }
}
