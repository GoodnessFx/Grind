import React from "react";
import { ArrowLeft, Home, Search } from "lucide-react";

interface NotFoundProps {
  onGoHome?: () => void;
}

export function NotFound({ onGoHome }: NotFoundProps) {
  return (
    <div className="h-full bg-gradient-to-b from-accent/5 to-white flex flex-col items-center justify-center px-6 py-16">
      {/* Illustration / Icon */}
      <div className="w-24 h-24 rounded-full bg-grind-accent-light flex items-center justify-center mb-6 shadow-lg">
        <Search className="w-12 h-12 text-accent" />
      </div>

      {/* Heading */}
      <h1 className="text-4xl font-black text-gray-900 text-center mb-2 tracking-tight">
        Page Not Found
      </h1>

      {/* Subheading */}
      <p className="text-center text-gray-600 text-base font-medium mb-2 leading-relaxed max-w-sm">
        We couldn't find what you were looking for. It might have been removed or the link is broken.
      </p>

      {/* Error Code */}
      <p className="text-gray-400 text-sm font-bold uppercase tracking-widest mb-8">
        Error 404
      </p>

      {/* Action Buttons */}
      <div className="flex flex-col gap-3 w-full max-w-xs">
        <button
          onClick={onGoHome}
          className="w-full bg-accent text-white py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-grind-accent-dark"
        >
          <Home className="w-5 h-5" />
          Go Home
        </button>
        <button
          onClick={() => window.history.back()}
          className="w-full bg-gray-100 text-gray-700 py-3 rounded-2xl font-bold text-base flex items-center justify-center gap-2 active:scale-95 transition-transform hover:bg-gray-200"
        >
          <ArrowLeft className="w-5 h-5" />
          Go Back
        </button>
      </div>

      {/* Optional: Helpful links */}
      <div className="mt-12 pt-8 border-t border-gray-100 w-full text-center">
        <p className="text-gray-500 text-xs font-semibold uppercase tracking-wide mb-4">
          Need help?
        </p>
        <div className="flex items-center justify-center gap-4 flex-wrap">
          <a href="mailto:support@grind.market" className="text-accent text-sm font-bold hover:underline">
            Contact Support
          </a>
          <span className="text-gray-300">•</span>
          <a href="/terms" className="text-accent text-sm font-bold hover:underline">
            Terms
          </a>
          <span className="text-gray-300">•</span>
          <a href="/privacy" className="text-accent text-sm font-bold hover:underline">
            Privacy
          </a>
        </div>
      </div>
    </div>
  );
}
