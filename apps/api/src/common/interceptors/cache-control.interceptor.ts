import {
  Injectable,
  NestInterceptor,
  ExecutionContext,
  CallHandler,
} from '@nestjs/common';
import { Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

/**
 * Interceptor to set Cache-Control headers for Cloudflare CDN
 */
@Injectable()
export class CacheControlInterceptor implements NestInterceptor {
  intercept(context: ExecutionContext, next: CallHandler): Observable<any> {
    const ctx = context.switchToHttp();
    const response = ctx.getResponse();
    const request = ctx.getRequest();

    return next.handle().pipe(
      tap(() => {
        const method = request.method;
        const path = request.url;

        // Only cache GET requests
        if (method !== 'GET') {
          response.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate');
          return;
        }

        // Public product/sellpage endpoints - cache for 2 hours
        if (
          path.includes('/api/public/products') ||
          path.includes('/api/public/sellpages') ||
          path.includes('/api/public/stores')
        ) {
          response.setHeader(
            'Cache-Control',
            'public, max-age=7200, s-maxage=7200, stale-while-revalidate=3600',
          );
          response.setHeader('CDN-Cache-Control', 'max-age=7200');
          return;
        }

        // Static assets (uploads) - cache for 1 year
        if (path.includes('/uploads/')) {
          response.setHeader(
            'Cache-Control',
            'public, max-age=31536000, immutable',
          );
          response.setHeader('CDN-Cache-Control', 'max-age=31536000');
          return;
        }

        // Admin/private endpoints - no cache
        if (path.includes('/api/admin/') || path.includes('/api/auth/')) {
          response.setHeader('Cache-Control', 'private, no-cache, no-store, must-revalidate');
          return;
        }

        // Default: short cache for other GET endpoints
        response.setHeader(
          'Cache-Control',
          'public, max-age=300, s-maxage=300',
        );
      }),
    );
  }
}
