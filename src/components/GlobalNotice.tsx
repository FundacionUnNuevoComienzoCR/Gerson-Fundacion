import { useState } from "react";
import { Megaphone, X, ArrowRight } from "lucide-react";
import { GlobalNoticeConfig } from "../types";

interface GlobalNoticeProps {
  config?: GlobalNoticeConfig;
  onViewChange?: (view: string) => void;
}

export default function GlobalNotice({ config, onViewChange }: GlobalNoticeProps) {
  const [visible, setVisible] = useState(true);

  if (!config || !config.active || !visible) return null;

  const bgStyles = {
    info: "bg-foundation-teal text-white border-foundation-teal-dark/10",
    alert: "bg-amber-500 text-white border-amber-600/10",
    success: "bg-emerald-500 text-white border-emerald-600/10",
  };

  const badgeStyles = {
    info: "bg-white/20 text-white",
    alert: "bg-white/20 text-white",
    success: "bg-white/20 text-white",
  };

  const currentBg = bgStyles[config.type] || bgStyles.info;
  const currentBadge = badgeStyles[config.type] || badgeStyles.info;

  const isExternal = config.ctaLink && (config.ctaLink.startsWith("http://") || config.ctaLink.startsWith("https://") || config.ctaLink.includes("."));

  return (
    <div className={`relative border-b ${currentBg} py-2 px-4 transition-all duration-300 z-50`}>
      <div className="max-w-7xl mx-auto flex flex-col sm:flex-row items-center justify-between gap-2 pr-8">
        <div className="flex flex-col sm:flex-row items-center gap-2 text-center sm:text-left">
          <span className={`text-[10px] font-black uppercase tracking-wider px-2 py-0.5 rounded-full ${currentBadge} flex items-center gap-1`}>
            <Megaphone className="w-3 h-3" />
            Anuncio
          </span>
          <p className="text-xs sm:text-sm font-bold leading-relaxed">
            {config.text}
          </p>
        </div>

        {config.ctaText && config.ctaLink && (
          isExternal ? (
            <a
              href={config.ctaLink}
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-900 font-extrabold text-[11px] rounded-lg shadow-xs hover:shadow-sm transition-all"
            >
              <span>{config.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </a>
          ) : (
            <button
              onClick={() => onViewChange?.(config.ctaLink || "inicio")}
              className="flex items-center gap-1 px-3 py-1 bg-white hover:bg-gray-50 text-gray-900 font-extrabold text-[11px] rounded-lg shadow-xs hover:shadow-sm transition-all cursor-pointer"
            >
              <span>{config.ctaText}</span>
              <ArrowRight className="w-3.5 h-3.5 text-foundation-teal" />
            </button>
          )
        )}
      </div>

      <button
        onClick={() => setVisible(false)}
        className="absolute top-1/2 -translate-y-1/2 right-3 p-1 rounded-md text-white/80 hover:text-white hover:bg-white/10 transition-colors"
        title="Ocultar anuncio"
      >
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
