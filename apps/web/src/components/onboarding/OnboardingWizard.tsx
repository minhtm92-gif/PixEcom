'use client';

import { useState } from 'react';
import { useRouter } from 'next/navigation';
import { Modal } from '@/components/ui/modal';
import { Button } from '@/components/ui/button';
import { useOnboardingStore } from '@/stores/onboarding-store';
import {
  CheckCircle2,
  Circle,
  Building2,
  Package,
  FileText,
  Store,
  ArrowRight,
  X,
} from 'lucide-react';

const stepIcons = {
  workspace: Building2,
  store: Store,
  product: Package,
  sellpage: FileText,
};

const stepActions = {
  workspace: {
    label: 'Go to Settings',
    path: '/admin/settings',
  },
  store: {
    label: 'Create Store',
    path: '/admin/stores',
  },
  product: {
    label: 'Add Product',
    path: '/admin/products',
  },
  sellpage: {
    label: 'Build Sellpage',
    path: '/admin/sellpages',
  },
};

export function OnboardingWizard() {
  const router = useRouter();
  const { showWizard, setShowWizard, steps, currentStep, goToStep, completeOnboarding } =
    useOnboardingStore();

  const currentStepData = steps[currentStep];
  const progress = (steps.filter((s) => s.completed).length / steps.length) * 100;

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      goToStep(currentStep + 1);
    } else {
      completeOnboarding();
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      goToStep(currentStep - 1);
    }
  };

  const handleAction = () => {
    const action = stepActions[currentStepData.id as keyof typeof stepActions];
    if (action) {
      router.push(action.path);
      setShowWizard(false);
    }
  };

  const handleSkip = () => {
    completeOnboarding();
  };

  if (!currentStepData) return null;

  const StepIcon = stepIcons[currentStepData.id as keyof typeof stepIcons] || Circle;

  return (
    <Modal
      isOpen={showWizard}
      onClose={() => setShowWizard(false)}
      title="Welcome to PixEcom!"
      size="lg"
    >
      <div className="space-y-6">
        {/* Progress Bar */}
        <div>
          <div className="mb-2 flex items-center justify-between text-sm">
            <span className="font-medium text-surface-900 dark:text-surface-100">
              Setup Progress
            </span>
            <span className="text-surface-600 dark:text-surface-400">
              {Math.round(progress)}% Complete
            </span>
          </div>
          <div className="h-2 w-full overflow-hidden rounded-full bg-surface-200 dark:bg-surface-700">
            <div
              className="h-full bg-brand-600 transition-all duration-300"
              style={{ width: `${progress}%` }}
            />
          </div>
        </div>

        {/* Steps Navigation */}
        <div className="flex items-center justify-between">
          {steps.map((step, index) => {
            const Icon = stepIcons[step.id as keyof typeof stepIcons] || Circle;
            const isActive = index === currentStep;
            const isCompleted = step.completed;

            return (
              <button
                key={step.id}
                onClick={() => goToStep(index)}
                className={`group relative flex flex-1 flex-col items-center gap-2 ${
                  index !== steps.length - 1 ? 'after:absolute after:left-1/2 after:top-5 after:h-0.5 after:w-full after:bg-surface-200 dark:after:bg-surface-700' : ''
                }`}
              >
                <div
                  className={`relative z-10 flex h-10 w-10 items-center justify-center rounded-full transition-colors ${
                    isCompleted
                      ? 'bg-green-600 text-white'
                      : isActive
                      ? 'bg-brand-600 text-white'
                      : 'bg-surface-200 dark:bg-surface-700 text-surface-600 dark:text-surface-400'
                  }`}
                >
                  {isCompleted ? (
                    <CheckCircle2 className="h-5 w-5" />
                  ) : (
                    <Icon className="h-5 w-5" />
                  )}
                </div>
                <span
                  className={`text-xs font-medium ${
                    isActive
                      ? 'text-surface-900 dark:text-surface-100'
                      : 'text-surface-600 dark:text-surface-400'
                  }`}
                >
                  {step.title.split(' ')[0]}
                </span>
              </button>
            );
          })}
        </div>

        {/* Current Step Content */}
        <div className="rounded-lg border border-surface-200 dark:border-surface-700 bg-surface-50 dark:bg-surface-800 p-6">
          <div className="mb-4 flex items-start gap-4">
            <div className="flex h-12 w-12 items-center justify-center rounded-lg bg-brand-100 dark:bg-brand-900/20 text-brand-600 dark:text-brand-400">
              <StepIcon className="h-6 w-6" />
            </div>
            <div className="flex-1">
              <h3 className="text-lg font-semibold text-surface-900 dark:text-surface-100">
                {currentStepData.title}
              </h3>
              <p className="mt-1 text-sm text-surface-600 dark:text-surface-400">
                {currentStepData.description}
              </p>
            </div>
            {currentStepData.completed && (
              <CheckCircle2 className="h-6 w-6 text-green-600" />
            )}
          </div>

          {/* Step-specific guidance */}
          <div className="mt-4 space-y-2 text-sm text-surface-700 dark:text-surface-300">
            {currentStepData.id === 'workspace' && (
              <ul className="list-inside list-disc space-y-1">
                <li>Set your workspace brand name</li>
                <li>Upload your logo and favicon</li>
                <li>Add contact email and phone</li>
                <li>Choose currency and timezone</li>
              </ul>
            )}
            {currentStepData.id === 'store' && (
              <ul className="list-inside list-disc space-y-1">
                <li>Create your first store</li>
                <li>Set up your custom domain</li>
                <li>Configure store branding</li>
                <li>Set default currency</li>
              </ul>
            )}
            {currentStepData.id === 'product' && (
              <ul className="list-inside list-disc space-y-1">
                <li>Add product name and description</li>
                <li>Upload product images</li>
                <li>Set pricing and compare at price</li>
                <li>Add variants (size, color, etc.)</li>
              </ul>
            )}
            {currentStepData.id === 'sellpage' && (
              <ul className="list-inside list-disc space-y-1">
                <li>Choose a template or start from scratch</li>
                <li>Customize sections and content</li>
                <li>Add social proof and testimonials</li>
                <li>Publish when ready</li>
              </ul>
            )}
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center justify-between border-t border-surface-200 dark:border-surface-700 pt-4">
          <div className="flex gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleSkip}
            >
              Skip Setup
            </Button>
            {currentStep > 0 && (
              <Button
                variant="outline"
                size="sm"
                onClick={handlePrevious}
              >
                Previous
              </Button>
            )}
          </div>

          <div className="flex gap-2">
            <Button
              variant="outline"
              onClick={handleAction}
              leftIcon={<ArrowRight className="h-4 w-4" />}
            >
              {stepActions[currentStepData.id as keyof typeof stepActions]?.label}
            </Button>
            <Button onClick={handleNext}>
              {currentStep < steps.length - 1 ? 'Next Step' : 'Finish'}
            </Button>
          </div>
        </div>
      </div>
    </Modal>
  );
}
