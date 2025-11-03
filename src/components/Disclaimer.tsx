"use client";

import { useState } from "react";

export default function Disclaimer() {
  const [isExpanded, setIsExpanded] = useState(false);

  return (
    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
      <div className="flex items-start gap-3">
        <div className="flex-shrink-0 mt-0.5">
          <InfoIcon />
        </div>
        <div className="flex-1">
          <h3 className="text-sm font-semibold text-amber-900 mb-1">
            Important Notice
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            Sukoon provides Qur'an verses for personal reflection and spiritual
            comfort. This is not a substitute for scholarly tafsir (exegesis) or
            fiqh (jurisprudence) resources.
          </p>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-xs text-amber-800">
              <p>
                <strong>Content Authenticity:</strong> All Qur'an text is
                sourced from verified databases and is never generated,
                modified, or paraphrased by AI systems.
              </p>
              <p>
                <strong>Translations:</strong> All translations are provided by
                licensed translators and scholars. Translation credits are
                displayed with each verse.
              </p>
              <p>
                <strong>Audio Recitations:</strong> Audio recitations are
                provided by qualified reciters. Audio credits and sources are
                included where available.
              </p>
              <p>
                <strong>Verse Selection:</strong> Verses are selected based on
                mood associations from a pre-approved dataset. The selection
                process uses AI only to choose from existing verses, never to
                generate or modify content.
              </p>
              <p>
                <strong>Scholarly Guidance:</strong> For detailed
                interpretation, legal rulings, or religious guidance, please
                consult qualified Islamic scholars and authentic tafsir
                resources.
              </p>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs font-medium text-amber-900 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded px-1 py-0.5"
            aria-expanded={isExpanded}
            aria-label={
              isExpanded ? "Show less information" : "Show more information"
            }
          >
            {isExpanded ? "Show less" : "Learn more"}
          </button>
        </div>
      </div>
    </div>
  );
}

function InfoIcon() {
  return (
    <svg
      width="20"
      height="20"
      viewBox="0 0 20 20"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
      className="text-amber-600"
      aria-hidden="true"
    >
      <circle cx="10" cy="10" r="9" />
      <line x1="10" y1="14" x2="10" y2="10" />
      <circle cx="10" cy="6.5" r="0.5" fill="currentColor" />
    </svg>
  );
}
