'use client';

interface LegalPolicy {
  id: string;
  title: string;
  slug: string;
  policyType: string;
}

interface Store {
  name: string;
  slug: string;
  logoUrl?: string | null;
  brandColor?: string | null;
  primaryDomain?: string | null;
}

interface SellpageFooterProps {
  store: Store;
  legalPolicies?: LegalPolicy[];
}

export function SellpageFooter({ store, legalPolicies = [] }: SellpageFooterProps) {
  const year = new Date().getFullYear();

  return (
    <footer className="w-full bg-gray-50 border-t border-gray-200 mt-16">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10">
        <div className="flex flex-col md:flex-row items-center justify-between gap-6">
          {/* Logo or store name */}
          <div className="flex-shrink-0">
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-8 w-auto opacity-70"
              />
            ) : (
              <span className="text-base font-semibold text-gray-700">
                {store.name}
              </span>
            )}
          </div>

          {/* Legal links */}
          {legalPolicies.length > 0 && (
            <nav className="flex flex-wrap justify-center gap-x-6 gap-y-2">
              {legalPolicies.map((policy) => (
                <a
                  key={policy.id}
                  href={`/legal/${policy.slug}`}
                  className="text-sm text-gray-500 hover:text-gray-800 transition-colors"
                >
                  {policy.title}
                </a>
              ))}
            </nav>
          )}
        </div>

        <div className="mt-8 pt-6 border-t border-gray-200 text-center">
          <p className="text-xs text-gray-400">
            &copy; {year} {store.name}. All rights reserved.
          </p>
        </div>
      </div>
    </footer>
  );
}
