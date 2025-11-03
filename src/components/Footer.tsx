"use client";

export default function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      className="mt-12 text-center px-4 max-w-2xl mx-auto"
      role="contentinfo"
    >
      <div className="border-t border-gray-200 pt-6 pb-4">
        {/* Attribution */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-sukoon-text mb-2 uppercase tracking-wide">
            বিষয়বস্তুর উৎস
          </h3>
          <div className="space-y-1 text-xs text-sukoon-muted">
            <p>কুরআনের পাঠ্য এবং অনুবাদ যাচাইকৃত ইসলামিক ডাটাবেস থেকে নেওয়া</p>
            <p>সমস্ত বিষয়বস্তু সংশ্লিষ্ট লাইসেন্স অনুযায়ী ব্যবহার করা হয়</p>
          </div>
        </div>

        {/* Licensing Information */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-sukoon-text mb-2 uppercase tracking-wide">
            লাইসেন্সিং
          </h3>
          <div className="space-y-1 text-xs text-sukoon-muted">
            <p>অনুবাদগুলি তাদের নিজ নিজ লাইসেন্সের অধীনে প্রদান করা হয়</p>
            <p>
              নির্দিষ্ট শর্তাবলীর জন্য দয়া করে পৃথক অনুবাদক অ্যাট্রিবিউশন দেখুন
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-4">
          <p className="text-xs text-sukoon-muted leading-relaxed">
            সুকূন ব্যক্তিগত আধ্যাত্মিক চিন্তাভাবনার জন্য একটি সরঞ্জাম। এটি
            তাফসীর, ফিকহ সম্পদ বা যোগ্য ইসলামিক পণ্ডিতদের নির্দেশনার বিকল্প নয়।
            ধর্মীয় রায় বা বিস্তারিত ব্যাখ্যার জন্য, দয়া করে প্রামাণিক ইসলামিক
            উৎস এবং পণ্ডিতদের সাথে পরামর্শ করুন।
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-sukoon-muted">
          <p>
            © {currentYear} সুকূন। মুসলিম সম্প্রদায়ের জন্য যত্ন সহকারে তৈরি।
          </p>
        </div>

        {/* Links */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <a
            href="/privacy"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            গোপনীয়তা
          </a>
          <a
            href="/terms"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            শর্তাবলী
          </a>
          <a
            href="/about"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            সম্পর্কে
          </a>
        </div>
      </div>
    </footer>
  );
}
