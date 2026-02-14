'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { apiClient, ApiClientError } from '@/lib/api-client';
import { useAuthStore } from '@/stores/auth-store';
import { Mail, Lock, User } from 'lucide-react';

interface RegisterResponse {
  accessToken: string;
  refreshToken: string;
  user: {
    id: string;
    email: string;
    firstName: string;
    lastName: string;
    role: string;
  };
  workspace?: {
    id: string;
    name: string;
    slug: string;
    plan: string;
  };
}

export default function RegisterPage() {
  const router = useRouter();
  const { login } = useAuthStore();

  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [confirmPassword, setConfirmPassword] = useState('');
  const [error, setError] = useState('');
  const [fieldErrors, setFieldErrors] = useState<Record<string, string>>({});
  const [isLoading, setIsLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError('');
    setFieldErrors({});

    if (password !== confirmPassword) {
      setFieldErrors({ confirmPassword: 'Passwords do not match' });
      return;
    }

    if (password.length < 8) {
      setFieldErrors({ password: 'Password must be at least 8 characters' });
      return;
    }

    setIsLoading(true);

    try {
      const data = await apiClient.post<RegisterResponse>(
        '/auth/register',
        { firstName, lastName, email, password },
        { skipAuth: true }
      );

      login({
        accessToken: data.accessToken,
        refreshToken: data.refreshToken,
        user: data.user,
        workspace: data.workspace,
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
    <div className="flex min-h-screen items-center justify-center bg-surface-50 px-4 py-8">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="mb-8 text-center">
          <div className="mx-auto mb-4 flex h-12 w-12 items-center justify-center rounded-xl bg-brand-600">
            <span className="text-xl font-bold text-white">P</span>
          </div>
          <h1 className="text-2xl font-bold text-surface-900">
            Create your account
          </h1>
          <p className="mt-1 text-sm text-surface-500">
            Get started with PixEcom in minutes
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
            <div className="grid grid-cols-2 gap-4">
              <Input
                label="First name"
                type="text"
                placeholder="John"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                error={fieldErrors.firstName}
                leftIcon={<User className="h-4 w-4" />}
                required
                autoComplete="given-name"
              />
              <Input
                label="Last name"
                type="text"
                placeholder="Doe"
                value={lastName}
                onChange={(e) => setLastName(e.target.value)}
                error={fieldErrors.lastName}
                required
                autoComplete="family-name"
              />
            </div>

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
              placeholder="At least 8 characters"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              error={fieldErrors.password}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
              hint="Must be at least 8 characters"
            />

            <Input
              label="Confirm password"
              type="password"
              placeholder="Confirm your password"
              value={confirmPassword}
              onChange={(e) => setConfirmPassword(e.target.value)}
              error={fieldErrors.confirmPassword}
              leftIcon={<Lock className="h-4 w-4" />}
              required
              autoComplete="new-password"
            />

            <div className="flex items-start gap-2">
              <input
                type="checkbox"
                required
                className="mt-1 h-4 w-4 rounded border-surface-300 text-brand-600 focus:ring-brand-500"
              />
              <span className="text-sm text-surface-600">
                I agree to the{' '}
                <Link
                  href="/terms"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Terms of Service
                </Link>{' '}
                and{' '}
                <Link
                  href="/privacy"
                  className="font-medium text-brand-600 hover:text-brand-700"
                >
                  Privacy Policy
                </Link>
              </span>
            </div>

            <Button
              type="submit"
              className="w-full"
              isLoading={isLoading}
            >
              Create Account
            </Button>
          </form>
        </div>

        {/* Footer */}
        <p className="mt-6 text-center text-sm text-surface-500">
          Already have an account?{' '}
          <Link
            href="/login"
            className="font-medium text-brand-600 hover:text-brand-700"
          >
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
