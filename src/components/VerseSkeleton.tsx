"use client";

export default function VerseSkeleton() {
  return (
    <div className="w-full max-w-2xl mx-auto px-6 py-8 rounded-2xl shadow-2xl bg-white animate-pulse">
      {/* Reference skeleton */}
      <div className="text-center mb-4">
        <div className="h-4 w-24 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Arabic text skeleton */}
      <div className="text-center mb-6 px-2 space-y-3">
        <div className="h-8 bg-gray-200 rounded w-full"></div>
        <div className="h-8 bg-gray-200 rounded w-5/6 mx-auto"></div>
        <div className="h-8 bg-gray-200 rounded w-4/6 mx-auto"></div>
      </div>

      {/* Translation skeleton */}
      <div className="text-center mb-4 px-2 space-y-2">
        <div className="h-4 bg-gray-200 rounded w-full"></div>
        <div className="h-4 bg-gray-200 rounded w-11/12 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-10/12 mx-auto"></div>
        <div className="h-4 bg-gray-200 rounded w-9/12 mx-auto"></div>
      </div>

      {/* Translator skeleton */}
      <div className="text-center mb-4">
        <div className="h-3 w-32 bg-gray-200 rounded mx-auto"></div>
      </div>

      {/* Notice skeleton */}
      <div className="text-center px-2 space-y-2">
        <div className="h-3 bg-gray-100 rounded w-full"></div>
        <div className="h-3 bg-gray-100 rounded w-5/6 mx-auto"></div>
      </div>

      {/* Pulsing effect */}
      <style jsx>{`
        @keyframes pulse {
          0%,
          100% {
            opacity: 1;
          }
          50% {
            opacity: 0.5;
          }
        }
      `}</style>
    </div>
  );
}
