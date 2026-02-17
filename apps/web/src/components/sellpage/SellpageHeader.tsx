'use client';

import { useState } from 'react';

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

interface SellpageHeaderProps {
  store: Store;
  sellpageSlug?: string;
  legalPolicies?: LegalPolicy[];
}

export function SellpageHeader({ store, sellpageSlug, legalPolicies = [] }: SellpageHeaderProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const brandColor = store.brandColor || '#111827';

  return (
    <>
      {/* Header bar */}
      <header className="w-full bg-white border-b border-gray-100 relative z-40">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16 relative">

            {/* Left: Hamburger menu button */}
            <button
              onClick={() => setSidebarOpen(true)}
              className="flex flex-col justify-center items-center gap-1.5 w-10 h-10 rounded-md hover:bg-gray-100 transition-colors flex-shrink-0"
              aria-label="Open menu"
            >
              <span className="block w-5 h-0.5 bg-gray-700"></span>
              <span className="block w-5 h-0.5 bg-gray-700"></span>
              <span className="block w-5 h-0.5 bg-gray-700"></span>
            </button>

            {/* Center: Logo */}
            <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
              {store.logoUrl ? (
                <img
                  src={store.logoUrl}
                  alt={store.name}
                  className="h-10 w-auto object-contain max-w-[180px]"
                />
              ) : (
                <span
                  className="text-xl font-bold whitespace-nowrap"
                  style={{ color: brandColor }}
                >
                  {store.name}
                </span>
              )}
            </div>

            {/* Right: empty spacer to balance the hamburger */}
            <div className="w-10 flex-shrink-0" />
          </div>
        </div>
      </header>

      {/* Sidebar overlay */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black bg-opacity-40 z-50"
          onClick={() => setSidebarOpen(false)}
        />
      )}

      {/* Sidebar drawer */}
      <aside
        className={`fixed top-0 left-0 h-full w-72 bg-white z-50 shadow-2xl transform transition-transform duration-300 ease-in-out ${
          sidebarOpen ? 'translate-x-0' : '-translate-x-full'
        }`}
      >
        {/* Sidebar header */}
        <div className="flex items-center justify-between px-5 py-4 border-b border-gray-100">
          <div>
            {store.logoUrl ? (
              <img
                src={store.logoUrl}
                alt={store.name}
                className="h-8 w-auto object-contain max-w-[140px]"
              />
            ) : (
              <span className="font-bold text-gray-800">{store.name}</span>
            )}
          </div>
          <button
            onClick={() => setSidebarOpen(false)}
            className="w-8 h-8 flex items-center justify-center rounded-full hover:bg-gray-100 transition-colors text-gray-500"
            aria-label="Close menu"
          >
            <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
              <path d="M2 2L14 14M14 2L2 14" stroke="currentColor" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </button>
        </div>

        {/* Sidebar links */}
        <nav className="py-4">
          {legalPolicies.length > 0 ? (
            <>
              <p className="px-5 py-2 text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Legal
              </p>
              {legalPolicies.map((policy) => (
                <a
                  key={policy.id}
                  href={`/legal/${policy.slug}`}
                  className="flex items-center px-5 py-3 text-sm text-gray-700 hover:bg-gray-50 hover:text-gray-900 transition-colors"
                  onClick={() => setSidebarOpen(false)}
                >
                  <span className="mr-3 text-gray-400">
                    <svg width="16" height="16" viewBox="0 0 16 16" fill="none">
                      <path d="M3 2h10a1 1 0 011 1v10a1 1 0 01-1 1H3a1 1 0 01-1-1V3a1 1 0 011-1z" stroke="currentColor" strokeWidth="1.5"/>
                      <path d="M5 6h6M5 8h6M5 10h4" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round"/>
                    </svg>
                  </span>
                  {policy.title}
                </a>
              ))}
            </>
          ) : (
            <p className="px-5 py-3 text-sm text-gray-400">No pages available</p>
          )}
        </nav>
      </aside>
    </>
  );
}
