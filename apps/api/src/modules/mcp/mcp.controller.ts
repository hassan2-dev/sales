import {
  All,
  Controller,
  Get,
  Header,
  Req,
  Res,
} from '@nestjs/common';
import type { Request, Response } from 'express';
import { StreamableHTTPServerTransport } from '@modelcontextprotocol/sdk/server/streamableHttp.js';
import { Public } from '../../common/decorators/auth.decorators.js';
import { McpService } from './mcp.service.js';

@Public()
@Controller('mcp')
export class McpController {
  constructor(private readonly mcp: McpService) {}

  @Get('server-card')
  @Header('Content-Type', 'application/mcp-server-card+json; charset=utf-8')
  @Header('Access-Control-Allow-Origin', '*')
  serverCard() {
    return this.mcp.serverCard();
  }

  @All()
  async handle(@Req() req: Request, @Res() res: Response) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization, Mcp-Session-Id');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, DELETE, OPTIONS');

    if (req.method === 'OPTIONS') {
      res.status(204).end();
      return;
    }

    if (req.method === 'GET' || req.method === 'DELETE') {
      res.status(405).json({
        jsonrpc: '2.0',
        error: { code: -32000, message: 'Method not allowed.' },
        id: null,
      });
      return;
    }

    const server = this.mcp.createServer();
    try {
      const transport = new StreamableHTTPServerTransport({
        sessionIdGenerator: undefined,
        enableJsonResponse: true,
      });
      await server.connect(transport);
      await transport.handleRequest(req, res, req.body);
      res.on('close', () => {
        void transport.close();
        void server.close();
      });
    } catch (error) {
      // eslint-disable-next-line no-console
      console.error('MCP request failed', error);
      if (!res.headersSent) {
        res.status(500).json({
          jsonrpc: '2.0',
          error: { code: -32603, message: 'Internal server error' },
          id: null,
        });
      }
    }
  }
}
