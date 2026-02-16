import { create } from 'zustand';
import { persist } from 'zustand/middleware';

export interface OnboardingStep {
  id: string;
  title: string;
  description: string;
  completed: boolean;
}

interface OnboardingState {
  isOnboardingComplete: boolean;
  currentStep: number;
  steps: OnboardingStep[];
  showWizard: boolean;
  setShowWizard: (show: boolean) => void;
  completeStep: (stepId: string) => void;
  goToStep: (stepIndex: number) => void;
  completeOnboarding: () => void;
  resetOnboarding: () => void;
}

const initialSteps: OnboardingStep[] = [
  {
    id: 'workspace',
    title: 'Set Up Your Workspace',
    description: 'Configure your brand name, logo, and contact information',
    completed: false,
  },
  {
    id: 'store',
    title: 'Create Your Store',
    description: 'Set up your first store with domain and branding',
    completed: false,
  },
  {
    id: 'product',
    title: 'Add Your First Product',
    description: 'Create a product with images, pricing, and variants',
    completed: false,
  },
  {
    id: 'sellpage',
    title: 'Build a Sellpage',
    description: 'Create a beautiful sales page for your product',
    completed: false,
  },
];

export const useOnboardingStore = create<OnboardingState>()(
  persist(
    (set, get) => ({
      isOnboardingComplete: false,
      currentStep: 0,
      steps: initialSteps,
      showWizard: false,

      setShowWizard: (show) => set({ showWizard: show }),

      completeStep: (stepId) =>
        set((state) => {
          const updatedSteps = state.steps.map((step) =>
            step.id === stepId ? { ...step, completed: true } : step
          );
          const allCompleted = updatedSteps.every((step) => step.completed);
          return {
            steps: updatedSteps,
            isOnboardingComplete: allCompleted,
          };
        }),

      goToStep: (stepIndex) => set({ currentStep: stepIndex }),

      completeOnboarding: () =>
        set({
          isOnboardingComplete: true,
          showWizard: false,
        }),

      resetOnboarding: () =>
        set({
          isOnboardingComplete: false,
          currentStep: 0,
          steps: initialSteps,
          showWizard: true,
        }),
    }),
    {
      name: 'pixecom-onboarding',
    }
  )
);
