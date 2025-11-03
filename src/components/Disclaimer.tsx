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
            গুরুত্বপূর্ণ নোটিশ
          </h3>
          <p className="text-xs text-amber-800 leading-relaxed">
            সুকূন ব্যক্তিগত চিন্তাভাবনা এবং আধ্যাত্মিক শান্তির জন্য কুরআনের
            আয়াত প্রদান করে। এটি তাফসীর বা ফিকহ সম্পদের বিকল্প নয়।
          </p>

          {isExpanded && (
            <div className="mt-3 space-y-2 text-xs text-amber-800">
              <p>
                <strong>বিষয়বস্তুর সত্যতা:</strong> সমস্ত কুরআনের পাঠ্য
                যাচাইকৃত ডাটাবেস থেকে নেওয়া এবং কখনও AI দ্বারা তৈরি, পরিবর্তিত
                বা ব্যাখ্যা করা হয় না।
              </p>
              <p>
                <strong>অনুবাদ:</strong> সমস্ত অনুবাদ লাইসেন্সপ্রাপ্ত অনুবাদক
                এবং পণ্ডিতদের দ্বারা প্রদান করা হয়। প্রতিটি আয়াতের সাথে
                অনুবাদক ক্রেডিট প্রদর্শিত হয়।
              </p>
              <p>
                <strong>আয়াত নির্বাচন:</strong> আয়াতগুলি একটি পূর্ব-অনুমোদিত
                ডেটাসেট থেকে মুড সংযোগের উপর ভিত্তি করে নির্বাচিত হয়। নির্বাচন
                প্রক্রিয়া শুধুমাত্র বিদ্যমান আয়াত থেকে বেছে নিতে AI ব্যবহার
                করে।
              </p>
              <p>
                <strong>পণ্ডিত নির্দেশনা:</strong> বিস্তারিত ব্যাখ্যা, আইনি রায়
                বা ধর্মীয় নির্দেশনার জন্য, দয়া করে যোগ্য ইসলামিক পণ্ডিত এবং
                প্রামাণিক তাফসীর সম্পদের সাথে পরামর্শ করুন।
              </p>
            </div>
          )}

          <button
            onClick={() => setIsExpanded(!isExpanded)}
            className="mt-2 text-xs font-medium text-amber-900 hover:text-amber-700 focus:outline-none focus:ring-2 focus:ring-amber-500 focus:ring-offset-1 rounded px-1 py-0.5"
            aria-expanded={isExpanded}
            aria-label={isExpanded ? "কম তথ্য দেখান" : "আরও জানুন"}
          >
            {isExpanded ? "কম দেখান" : "আরও জানুন"}
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
