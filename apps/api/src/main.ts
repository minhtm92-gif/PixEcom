import { NestFactory } from '@nestjs/core';
import { ValidationPipe } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { SwaggerModule, DocumentBuilder } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import * as cookieParser from 'cookie-parser';
import * as express from 'express';
import { join, isAbsolute } from 'path';
import helmet from 'helmet';
import { AppModule } from './app.module';
import { TransformInterceptor } from './common/interceptors/transform.interceptor';
import { GlobalExceptionFilter } from './common/filters/http-exception.filter';
import { CacheControlInterceptor } from './common/interceptors/cache-control.interceptor';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  const config = app.get(ConfigService);
  const port = config.get<number>('API_PORT', 3001);
  const devMode = config.get<string>('DEV_MODE', 'false') === 'true';
  const uploadDir = config.get<string>('UPLOAD_DIR', './uploads');

  // Serve static files FIRST, before any other middleware
  // Handle both absolute paths (e.g., /var/www/pixecom/uploads) and relative paths (e.g., ./uploads)
  const uploadsPath = isAbsolute(uploadDir) ? uploadDir : join(process.cwd(), uploadDir);
  console.log(`Serving static files from: ${uploadsPath}`);
  app.use('/uploads', express.static(uploadsPath));

  app.setGlobalPrefix('api');
  app.use(cookieParser());
  app.use(helmet());

  // CORS configuration
  // In production, the API is behind nginx on the same server as the frontend,
  // and custom domains (e.g., stretchactive.circlekar.com) need access too.
  // Use a callback to dynamically allow origins.
  const frontendUrl = config.get<string>('FRONTEND_URL', 'http://localhost:3000');
  const appUrl = config.get<string>('NEXT_PUBLIC_APP_URL', 'http://localhost:3000');

  app.enableCors({
    origin: devMode
      ? true
      : (origin: string | undefined, callback: (err: Error | null, allow?: boolean) => void) => {
          // Allow requests with no origin (same-origin, server-to-server, curl)
          if (!origin) return callback(null, true);
          // Allow configured frontend URLs
          if (origin === frontendUrl || origin === appUrl) return callback(null, true);
          // Allow Cloudflare Pages preview URLs
          if (origin.endsWith('.pages.dev')) return callback(null, true);
          // Allow any custom domain that goes through our nginx (same server)
          // Custom domains are proxied by nginx, so they're trusted
          if (origin.startsWith('https://') || origin.startsWith('http://localhost')) {
            return callback(null, true);
          }
          callback(null, false);
        },
    credentials: true,
    methods: ['GET', 'POST', 'PUT', 'PATCH', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization', 'X-Workspace-Id'],
  });

  app.useGlobalFilters(new GlobalExceptionFilter());
  app.useGlobalInterceptors(
    new TransformInterceptor(),
    new CacheControlInterceptor(),
  );

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      forbidNonWhitelisted: true,
      transform: true,
      transformOptions: { enableImplicitConversion: true },
    }),
  );

  if (devMode) {
    const swaggerConfig = new DocumentBuilder()
      .setTitle('PixEcom API')
      .setDescription('OnePage OneProduct Store Builder API')
      .setVersion('2.0.0')
      .addBearerAuth()
      .addApiKey({ type: 'apiKey', name: 'X-Workspace-Id', in: 'header' }, 'workspace-id')
      .build();
    const document = SwaggerModule.createDocument(app, swaggerConfig);
    SwaggerModule.setup('api/docs', app, document);
  }

  await app.listen(port);
  console.log(`PixEcom API running on port ${port}${devMode ? ' (DEV_MODE)' : ''}`);
}

bootstrap();
