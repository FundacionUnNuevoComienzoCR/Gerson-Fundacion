import React, { useState } from "react";
import { Download, Share2, Sparkles, Image as ImageIcon, Eye, ExternalLink, CheckCircle2 } from "lucide-react";
import { PromoArt } from "../types";

interface PromoCatalogSectionProps {
  promoArts?: PromoArt[];
  className?: string;
}

export default function PromoCatalogSection({ promoArts = [], className = "" }: PromoCatalogSectionProps) {
  const [selectedArt, setSelectedArt] = useState<PromoArt | null>(null);
  const [downloadingId, setDownloadingId] = useState<string | null>(null);
  const [filterFormat, setFilterFormat] = useState<"all" | "1080x1080" | "1200x630">("all");

  const filteredArts = promoArts.filter(art => {
    if (filterFormat === "all") return true;
    return art.format === filterFormat;
  });

  const handleDownloadHD = async (art: PromoArt) => {
    setDownloadingId(art.id);
    try {
      const response = await fetch(art.imageUrl);
      const blob = await response.blob();
      const url = window.URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${art.title.toLowerCase().replace(/[^a-z0-9]/g, "_")}_hd.jpg`;
      document.body.appendChild(a);
      a.click();
      window.URL.revokeObjectURL(url);
      document.body.removeChild(a);
    } catch (err) {
      // Fallback: open image in new tab for direct download
      window.open(art.imageUrl, "_blank");
    } finally {
      setDownloadingId(null);
    }
  };

  return (
    <div className={`space-y-12 animate-fade-in ${className}`}>
      
      {/* Header Banner */}
      <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white py-16 px-6 sm:px-12 text-center shadow-lg">
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-30 scale-105" 
          style={{ backgroundImage: `url(https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1200)` }}
        />
        <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/70 to-transparent" />
        
        <div className="relative z-10 max-w-3xl mx-auto space-y-4">
          <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-foundation-teal/20 border border-foundation-teal/30 text-foundation-teal text-xs font-extrabold uppercase tracking-widest">
            <Share2 className="w-4 h-4" />
            <span>Material Promocional Oficial</span>
          </div>
          
          <h1 className="text-3xl sm:text-5xl font-black tracking-tight text-white">
            Catálogo de Artes y Banners HD
          </h1>
          
          <p className="text-sm sm:text-base text-gray-300 font-semibold max-w-2xl mx-auto leading-relaxed">
            Descarga afiches, banners y gráficos oficiales de la Fundación Un Nuevo Comienzo CR para compartir en tus redes sociales o proyectar en eventos.
          </p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
        <div className="flex items-center gap-2">
          <ImageIcon className="w-5 h-5 text-foundation-teal" />
          <h2 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
            Piezas Promocionales ({filteredArts.length})
          </h2>
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setFilterFormat("all")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filterFormat === "all"
                ? "bg-foundation-teal text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Todos los Formatos
          </button>
          <button
            onClick={() => setFilterFormat("1080x1080")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filterFormat === "1080x1080"
                ? "bg-foundation-teal text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Cuadrados (1080x1080)
          </button>
          <button
            onClick={() => setFilterFormat("1200x630")}
            className={`px-4 py-2 rounded-xl text-xs font-extrabold transition-all cursor-pointer ${
              filterFormat === "1200x630"
                ? "bg-foundation-teal text-white shadow-md"
                : "bg-gray-100 dark:bg-gray-800 text-gray-600 dark:text-gray-300 hover:bg-gray-200"
            }`}
          >
            Rectangulares (1200x630)
          </button>
        </div>
      </div>

      {/* Grid of Promo Arts */}
      {filteredArts.length > 0 ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
          {filteredArts.map((art) => (
            <div
              key={art.id}
              className="bg-white dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 overflow-hidden shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col justify-between group hover:-translate-y-1"
            >
              <div className="space-y-4">
                {/* Image Container with Format Proportion */}
                <div 
                  className={`relative overflow-hidden bg-gray-100 dark:bg-gray-800 ${
                    art.format === "1080x1080" ? "aspect-square" : "aspect-[1200/630]"
                  }`}
                >
                  <img
                    src={art.imageUrl}
                    alt={art.title}
                    className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                    referrerPolicy="no-referrer"
                  />
                  
                  <div className="absolute top-3 left-3 bg-black/60 backdrop-blur-xs text-white px-3 py-1 rounded-full text-[10px] font-extrabold uppercase tracking-widest border border-white/20">
                    {art.format || "HD"}
                  </div>

                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity flex items-center justify-center gap-3">
                    <button
                      onClick={() => setSelectedArt(art)}
                      className="px-4 py-2 bg-white text-gray-900 font-extrabold text-xs rounded-xl shadow-lg hover:scale-105 transition-transform flex items-center gap-1.5 cursor-pointer"
                    >
                      <Eye className="w-4 h-4 text-foundation-teal" />
                      <span>Ver Arte HD</span>
                    </button>
                  </div>
                </div>

                {/* Info Text */}
                <div className="p-6 space-y-2">
                  <h3 className="text-base font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-foundation-teal transition-colors">
                    {art.title}
                  </h3>
                  <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-3 leading-relaxed">
                    {art.description}
                  </p>
                </div>
              </div>

              {/* Download Action Footer */}
              <div className="px-6 pb-6 pt-2 border-t border-gray-100 dark:border-gray-800/80 flex items-center justify-between gap-3">
                <span className="text-[11px] font-bold text-gray-400 dark:text-gray-500 flex items-center gap-1">
                  <CheckCircle2 className="w-3.5 h-3.5 text-emerald-500" /> Listo para descargar
                </span>

                <button
                  onClick={() => handleDownloadHD(art)}
                  disabled={downloadingId === art.id}
                  className="px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer hover:scale-105"
                >
                  <Download className="w-4 h-4" />
                  <span>{downloadingId === art.id ? "Descargando..." : "Descargar en HD"}</span>
                </button>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-16 bg-gray-50 dark:bg-gray-900 rounded-3xl border border-gray-150 dark:border-gray-800 space-y-4">
          <ImageIcon className="w-12 h-12 text-gray-400 mx-auto" />
          <p className="text-sm font-extrabold text-gray-600 dark:text-gray-300">
            No hay artes promocionales cargados en este formato.
          </p>
          <p className="text-xs text-gray-400">
            Puedes agregar nuevos artes y banners desde el Panel de Administración (CMS → Catálogo de Artes).
          </p>
        </div>
      )}

      {/* Lightbox Modal */}
      {selectedArt && (
        <div className="fixed inset-0 z-50 bg-black/80 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-2xl w-full space-y-6 shadow-2xl border border-gray-100 dark:border-gray-800 relative">
            <button
              onClick={() => setSelectedArt(null)}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-1">
              <span className="text-[10px] font-black uppercase tracking-widest text-foundation-teal">
                Formato {selectedArt.format || "HD"}
              </span>
              <h3 className="text-xl font-black text-gray-900 dark:text-gray-100">
                {selectedArt.title}
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {selectedArt.description}
              </p>
            </div>

            <div className="bg-gray-100 dark:bg-gray-800 rounded-2xl overflow-hidden border border-gray-200 max-h-[60vh] flex items-center justify-center">
              <img
                src={selectedArt.imageUrl}
                alt={selectedArt.title}
                className="max-h-[60vh] max-w-full object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-between gap-4 pt-2">
              <a
                href={selectedArt.imageUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="text-xs font-bold text-gray-500 hover:text-foundation-teal flex items-center gap-1"
              >
                <ExternalLink className="w-3.5 h-3.5" /> Abrir imagen original en nueva pestaña
              </a>

              <div className="flex items-center gap-3 w-full sm:w-auto">
                <button
                  onClick={() => setSelectedArt(null)}
                  className="px-4 py-2.5 bg-gray-100 dark:bg-gray-800 text-gray-700 dark:text-gray-300 font-extrabold text-xs rounded-xl hover:bg-gray-200 transition-colors cursor-pointer w-full sm:w-auto"
                >
                  Cerrar
                </button>
                <button
                  onClick={() => handleDownloadHD(selectedArt)}
                  className="px-5 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold text-xs rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer w-full sm:w-auto"
                >
                  <Download className="w-4 h-4" />
                  <span>Descargar en Alta Definición</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
