"use client";

export default function OfflinePage() {
  return (
    <div className="flex flex-col items-center justify-center min-h-[80vh] text-center px-4">
      <div className="max-w-md">
        <svg
          className="w-24 h-24 mx-auto mb-6 text-sukoon-muted"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
          aria-hidden="true"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M18.364 5.636a9 9 0 010 12.728m0 0l-2.829-2.829m2.829 2.829L21 21M15.536 8.464a5 5 0 010 7.072m0 0l-2.829-2.829m-4.243 2.829a4.978 4.978 0 01-1.414-2.83m-1.414 5.658a9 9 0 01-2.167-9.238m7.824 2.167a1 1 0 111.414 1.414m-1.414-1.414L3 3m8.293 8.293l1.414 1.414"
          />
        </svg>

        <h1 className="text-2xl font-bold text-sukoon-text mb-3">
          You're offline
        </h1>

        <p className="text-sukoon-muted mb-6">
          Sukoon requires an internet connection to select and display Qur'an
          verses. Please check your connection and try again.
        </p>

        <button
          onClick={() => window.location.reload()}
          className="px-6 py-3 bg-sukoon-primary text-white rounded-full hover:bg-sukoon-primary/90 transition-colors focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-sukoon-primary min-h-[44px]"
        >
          Try again
        </button>
      </div>
    </div>
  );
}
