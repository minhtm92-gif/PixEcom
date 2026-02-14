'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Mail, Lock } from 'lucide-react';

interface LoginResponse {
  accessToken: string;
  refreshToken?: string;
  user: {
    id: string;
    email: string;
    displayName?: string;
    firstName?: string;
    lastName?: string;
    role?: string;
    isSuperadmin?: boolean;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
  };
}

export default function LoginPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});
    setIsLoading(true);

    try {
      const data = await apiClient.post<LoginResponse>(
        '/auth/login',
        { email, password },
        { skipAuth: true }
      );

      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken || '',
        user: {
          id: data.user.id,
          email: data.user.email,
          firstName: data.user.displayName?.split(' ')[0] || '',
          lastName: data.user.displayName?.split(' ').slice(1).join(' ') || '',
          role: data.user.isSuperadmin ? 'superadmin' : (data.user.role || 'user'),
        },
        workspace: data.workspace
          ? { ...data.workspace, plan: 'free' }
          : undefined,
      });

      router.push('/admin');
    } catch (err) {
      if (err instanceof ApiClientError) {
        if (err.errors) {
          const mapped: Record<string, string> = {};
          for (const [key, messages] of Object.entries(err.errors)) {
            mapped[key] = messages[0];
          }
          setFieldErrors(mapped);
        } else {
          setError(err.message);
        }
      } else {
        setError('An unexpected error occurred. Please try again.');
      }
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">
            Welcome back
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Sign in to your PixEcom account
          </p>
        </div>

        {/* Form */}
        <div className="rounded-xl border border-surface-200 bg-white p-6 shadow-card">
          {error && (
            <div className="mb-4 rounded-lg bg-red-50 px-4 py-3 text-sm text-red-700">
              {error}
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-4">
            <Input
              label="Email address"
              type="email"
              placeholder="you@example.com"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              error={fieldErrors.email}
              leftIcon={<Mail className="h-4 w-4" />}
              required
              autoComplete="email"
            />

            <Input
              label="Password"
              type="password"
              placeholder="Enter your password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              autoComplete="current-password"
            />

            <div className="flex items-center justify-between">
              <label className="flex items-center gap-2">
                <input
                  type="checkbox"
                  className="h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
                />
                <span className="text-sm text-surface-600">Remember me</span>
              </label>
              <Link
                href="/forgot-password"
                className="text-sm font-medium text-brand-600 hover:text-brand-700"
              >
                Forgot password?
              </Link>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Sign In
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-surface-500">
          Don&apos;t have an account?{' '}
          <Link
            href="/register"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Create an account
          </Link>
        </p>
      </div>
    </div>
  );
}
