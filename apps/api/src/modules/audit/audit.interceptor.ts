import {
  CallHandler,
  ExecutionContext,
  Injectable,
  NestInterceptor,
} from '@nestjs/common';
import { tap } from 'rxjs';
import type { AuthUser } from '../auth/types/jwt-payload.type.js';
import { AuditService } from './audit.service.js';

const SKIP = ['/analytics/visit', '/auth/otp/request', '/auth/refresh', '/audit-logs'];

@Injectable()
export class AuditInterceptor implements NestInterceptor {
  constructor(private readonly audit: AuditService) {}

  intercept(context: ExecutionContext, next: CallHandler) {
    const req = context.switchToHttp().getRequest();
    const method = String(req.method || 'GET');
    if (!['POST', 'PUT', 'PATCH', 'DELETE'].includes(method)) return next.handle();

    const path = String(req.originalUrl || req.url || '').split('?')[0];
    if (SKIP.some((part) => path.includes(part))) return next.handle();

    return next.handle().pipe(
      tap(() => {
        const user = req.user as AuthUser | undefined;
        const parts = path.replace(/^\/api\/?/, '').split('/').filter(Boolean);
        const entity = parts[0] || 'api';
        const entityId = parts.find((part) => /^[0-9a-f-]{36}$/i.test(part)) ?? null;
        const action =
          method === 'POST' ? 'CREATE' : method === 'DELETE' ? 'DELETE' : 'UPDATE';
        const agent = req.headers?.['user-agent'];
        void this.audit
          .log({
            userId: user?.id ?? null,
            action,
            entity,
            entityId,
            metadata: { method, path },
            ipAddress: typeof req.ip === 'string' ? req.ip : null,
            userAgent: typeof agent === 'string' ? agent.slice(0, 255) : null,
          })
          .catch(() => undefined);
      }),
    );
  }
}
