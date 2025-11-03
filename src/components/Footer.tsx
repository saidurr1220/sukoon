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
            Content Attribution
          </h3>
          <div className="space-y-1 text-xs text-sukoon-muted">
            <p>
              Qur'an text and translations sourced from verified Islamic
              databases
            </p>
            <p>Audio recitations by qualified reciters</p>
            <p>All content is used in accordance with respective licenses</p>
          </div>
        </div>

        {/* Licensing Information */}
        <div className="mb-4">
          <h3 className="text-xs font-semibold text-sukoon-text mb-2 uppercase tracking-wide">
            Licensing
          </h3>
          <div className="space-y-1 text-xs text-sukoon-muted">
            <p>Translations are provided under their respective licenses</p>
            <p>
              Please refer to individual translator attributions for specific
              terms
            </p>
          </div>
        </div>

        {/* Disclaimer */}
        <div className="mb-4">
          <p className="text-xs text-sukoon-muted leading-relaxed">
            Sukoon is a tool for personal spiritual reflection. It is not a
            substitute for scholarly tafsir, fiqh resources, or guidance from
            qualified Islamic scholars. For religious rulings or detailed
            interpretations, please consult authentic Islamic sources and
            scholars.
          </p>
        </div>

        {/* Copyright */}
        <div className="text-xs text-sukoon-muted">
          <p>
            © {currentYear} Sukoon. Made with care for the Muslim community.
          </p>
        </div>

        {/* Links */}
        <div className="mt-4 flex justify-center gap-4 text-xs">
          <a
            href="/privacy"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            Privacy
          </a>
          <a
            href="/terms"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            Terms
          </a>
          <a
            href="/about"
            className="text-sukoon-primary hover:text-sukoon-primary/80 focus:outline-none focus:ring-2 focus:ring-sukoon-primary focus:ring-offset-2 rounded px-2 py-1"
          >
            About
          </a>
        </div>
      </div>
    </footer>
  );
}
