import { useState, useRef, useEffect } from "react";
import { Menu, X, Heart, Settings, LogOut, ChevronRight, Sun, Moon, Search, FileText, HelpCircle, ArrowRight } from "lucide-react";
import { getDirectDriveImageUrl } from "../utils/drive";
import { AppConfig } from "../types";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  logoUrl?: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
  config?: AppConfig;
}

export default function Header({ currentView, onViewChange, isLoggedIn, onLogout, logoUrl, theme, onToggleTheme, config }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [searchOpen, setSearchOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const searchInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (searchOpen) {
      setTimeout(() => searchInputRef.current?.focus(), 100);
    }
  }, [searchOpen]);

  // Search logic
  const programs = config?.programs || [];
  const faqs = config?.faqs || [];

  const filteredPrograms = searchQuery.trim()
    ? programs.filter(
        p =>
          (p.name || "").toLowerCase().includes(searchQuery.toLowerCase()) ||
          (p.description || "").toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const filteredFaqs = searchQuery.trim()
    ? faqs.filter(
        f =>
          f.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
          f.answer.toLowerCase().includes(searchQuery.toLowerCase())
      )
    : [];

  const hasResults = filteredPrograms.length > 0 || filteredFaqs.length > 0;

  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "sobre-nosotros", label: "Sobre Nosotros" },
    { id: "patrocinios", label: "Patrocinios" },
    { id: "galeria", label: "Galería" },
    { id: "catalogo", label: "Catálogo de Artes" },
    { id: "donaciones", label: "Donaciones", isHighlight: true },
    { id: "contactenos", label: "Contáctenos" },
  ];

  const handleNav = (viewId: string) => {
    onViewChange(viewId);
    setMobileMenuOpen(false);
  };

  const resolvedLogoUrl = logoUrl ? getDirectDriveImageUrl(logoUrl) : "";

  return (
    <header className="sticky top-0 z-40 bg-white/95 dark:bg-gray-900/95 backdrop-blur-sm border-b border-gray-100 dark:border-gray-800 transition-all duration-300">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="flex justify-between items-center h-20">
          
          {/* Logo container */}
          <div 
            onClick={() => handleNav("inicio")} 
            className="flex items-center gap-3 cursor-pointer group"
          >
            {resolvedLogoUrl ? (
              <div className="w-16 h-16 flex-shrink-0 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <img 
                  src={resolvedLogoUrl} 
                  alt="Fundación Logo" 
                  className="max-h-full max-w-full object-contain"
                  referrerPolicy="no-referrer"
                />
              </div>
            ) : (
              <div className="w-12 h-12 flex-shrink-0 relative flex items-center justify-center group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-11 h-11 drop-shadow-xs">
                  {/* Trunk */}
                  <path d="M48,80 L48,50 C48,50 42,40 38,45" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                  <path d="M52,80 L52,45 C52,45 58,35 65,40" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                  {/* Ladder */}
                  <path d="M40,78 L43,62" stroke="#92400e" strokeWidth="2.5" />
                  <path d="M44,79 L47,63" stroke="#92400e" strokeWidth="2.5" />
                  <line x1="41" y1="74" x2="45" y2="75" stroke="#92400e" strokeWidth="2" />
                  <line x1="42" y1="69" x2="46" y2="70" stroke="#92400e" strokeWidth="2" />
                  {/* Foliage leaves */}
                  <circle cx="38" cy="35" r="14" fill="#79b83e" opacity="0.9" />
                  <circle cx="52" cy="28" r="16" fill="#3db8a5" opacity="0.95" />
                  <circle cx="64" cy="38" r="12" fill="#f8c300" opacity="0.85" />
                  <circle cx="48" cy="42" r="11" fill="#f39200" opacity="0.9" />
                  {/* Tiny child illustration simplified */}
                  <circle cx="34" cy="65" r="3" fill="#e41b13" />
                  <line x1="34" y1="68" x2="34" y2="74" stroke="#e41b13" strokeWidth="1.5" />
                </svg>
              </div>
            )}
            
            <div className="flex flex-col">
              <span className="text-lg font-extrabold tracking-tight leading-none text-gray-800 dark:text-gray-100 flex items-center gap-1">
                FUNDACIÓN UN
              </span>
              <span className="text-xl font-black tracking-widest text-foundation-teal leading-none">
                NUEVO COMIENZO CR
              </span>
              <span className="text-[9px] uppercase tracking-widest text-gray-400 dark:text-gray-500 font-bold leading-none mt-0.5">
                Por un cambio en nuestra niñez
              </span>
            </div>
          </div>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-1 lg:space-x-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-all duration-200 cursor-pointer ${
                  item.isHighlight
                    ? currentView === item.id
                      ? "bg-foundation-red text-white shadow-md shadow-foundation-red/20 scale-105"
                      : "bg-foundation-teal text-white hover:bg-foundation-teal-dark shadow-sm hover:shadow-md hover:scale-105"
                    : currentView === item.id
                    ? "text-foundation-teal bg-foundation-teal-light dark:bg-foundation-teal/15 dark:text-foundation-teal"
                    : "text-gray-600 dark:text-gray-300 hover:text-foundation-teal dark:hover:text-foundation-teal hover:bg-gray-50 dark:hover:bg-gray-800/50"
                }`}
              >
                <span className="flex items-center gap-1">
                  {item.isHighlight && <Heart className="w-3.5 h-3.5 fill-current" />}
                  {item.label}
                </span>
              </button>
            ))}

            <div className="h-5 w-[1px] bg-gray-200 dark:bg-gray-800 mx-2" />

            {/* Search Trigger button */}
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foundation-teal dark:hover:text-foundation-teal transition-all cursor-pointer mr-1 relative"
              title="Buscar Programas y Preguntas Frecuentes"
            >
              <Search className="w-5 h-5" />
            </button>

            {/* Dark Mode Toggle button */}
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foundation-teal dark:hover:text-foundation-teal transition-all cursor-pointer mr-1"
              title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            >
              {theme === "light" ? <Moon className="w-5 h-5" /> : <Sun className="w-5 h-5" />}
            </button>

            {isLoggedIn ? (
              <div className="flex items-center gap-1">
                <button
                  onClick={() => handleNav("admin-panel")}
                  className={`px-3.5 py-2 rounded-xl text-xs font-black flex items-center gap-1.5 transition-all shadow-xs cursor-pointer ${
                    currentView === "admin-panel"
                      ? "bg-foundation-teal text-white shadow-md shadow-foundation-teal/20"
                      : "bg-foundation-teal-light dark:bg-foundation-teal/15 text-foundation-teal hover:bg-foundation-teal hover:text-white"
                  }`}
                  title="Panel de Administración: Cambiar Logos, Redes y Contenidos"
                >
                  <Settings className="w-4 h-4 animate-spin-slow" />
                  <span>CMS (Logos y Contenido)</span>
                </button>
                <button
                  onClick={onLogout}
                  title="Cerrar Sesión"
                  className="p-2 rounded-lg text-gray-400 hover:text-foundation-red hover:bg-red-50 dark:hover:bg-red-950/20 transition-colors cursor-pointer"
                >
                  <LogOut className="w-4 h-4" />
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav("iniciar-sesion")}
                className={`px-3 py-2 rounded-lg text-sm font-semibold transition-colors cursor-pointer ${
                  currentView === "iniciar-sesion"
                    ? "text-foundation-teal bg-foundation-teal-light dark:bg-foundation-teal/15"
                    : "text-gray-500 dark:text-gray-400 hover:text-foundation-teal hover:bg-gray-50 dark:hover:bg-gray-800"
                }`}
              >
                Iniciar Sesión
              </button>
            )}
          </nav>

          {/* Mobile menu button */}
          <div className="md:hidden flex items-center gap-2">
            <button
              type="button"
              onClick={() => setSearchOpen(!searchOpen)}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
              title="Buscar en el sitio"
            >
              <Search className="w-5.5 h-5.5" />
            </button>
            <button
              type="button"
              onClick={onToggleTheme}
              className="p-2 rounded-lg text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-800 transition-all cursor-pointer"
              title={theme === "light" ? "Modo Oscuro" : "Modo Claro"}
            >
              {theme === "light" ? <Moon className="w-5.5 h-5.5" /> : <Sun className="w-5.5 h-5.5" />}
            </button>
            {isLoggedIn && (
              <button
                onClick={() => handleNav("admin-panel")}
                className="p-2 rounded-lg text-foundation-teal hover:bg-foundation-teal-light dark:hover:bg-foundation-teal/15 transition-all"
              >
                <Settings className="w-5 h-5 animate-spin-slow" />
              </button>
            )}
            <button
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              className="p-2 rounded-lg text-gray-600 dark:text-gray-300 hover:text-foundation-teal hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors cursor-pointer"
            >
              {mobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </div>

        </div>
      </div>

      {/* Search Bar Popup Overlay */}
      {searchOpen && (
        <div className="absolute top-20 left-0 w-full bg-white dark:bg-gray-900 border-b border-gray-200 dark:border-gray-800 shadow-2xl p-4 sm:p-6 z-50 animate-fade-in">
          <div className="max-w-3xl mx-auto space-y-4">
            <div className="relative flex items-center">
              <Search className="w-5 h-5 absolute left-4 text-foundation-teal" />
              <input
                ref={searchInputRef}
                type="text"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
                placeholder="Buscar programas, proyectos o preguntas frecuentes (FAQ)..."
                className="w-full pl-12 pr-10 py-3 bg-gray-50 dark:bg-gray-800 border-2 border-foundation-teal/30 focus:border-foundation-teal rounded-2xl text-sm font-bold text-gray-900 dark:text-gray-100 outline-none transition-all"
              />
              {searchQuery && (
                <button
                  type="button"
                  onClick={() => setSearchQuery("")}
                  className="absolute right-3 p-1.5 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200"
                >
                  <X className="w-4 h-4" />
                </button>
              )}
            </div>

            {/* Results dropdown */}
            {searchQuery.trim() !== "" && (
              <div className="max-h-80 overflow-y-auto space-y-3 pt-2">
                {!hasResults ? (
                  <p className="text-xs font-semibold text-gray-400 text-center py-6">
                    No se encontraron resultados para "{searchQuery}".
                  </p>
                ) : (
                  <>
                    {/* Programs matching */}
                    {filteredPrograms.length > 0 && (
                      <div className="space-y-1.5">
                        <p className="text-[11px] font-black uppercase tracking-wider text-foundation-teal flex items-center gap-1.5">
                          <FileText className="w-3.5 h-3.5" />
                          Programas y Proyectos ({filteredPrograms.length})
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {filteredPrograms.map((prog) => (
                            <div
                              key={prog.id}
                              onClick={() => {
                                handleNav("sobre-nosotros");
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-foundation-teal/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-foundation-teal transition-colors">
                                  {prog.name}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {prog.description}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-foundation-teal opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}

                    {/* FAQs matching */}
                    {filteredFaqs.length > 0 && (
                      <div className="space-y-1.5 pt-2">
                        <p className="text-[11px] font-black uppercase tracking-wider text-foundation-teal flex items-center gap-1.5">
                          <HelpCircle className="w-3.5 h-3.5" />
                          Preguntas Frecuentes ({filteredFaqs.length})
                        </p>
                        <div className="grid grid-cols-1 gap-1.5">
                          {filteredFaqs.map((faq) => (
                            <div
                              key={faq.id}
                              onClick={() => {
                                handleNav("contactenos");
                                setSearchOpen(false);
                                setSearchQuery("");
                              }}
                              className="p-3 bg-gray-50 dark:bg-gray-800/60 hover:bg-foundation-teal/10 rounded-xl cursor-pointer transition-colors flex items-center justify-between group"
                            >
                              <div>
                                <h4 className="text-xs font-extrabold text-gray-900 dark:text-gray-100 group-hover:text-foundation-teal transition-colors">
                                  {faq.question}
                                </h4>
                                <p className="text-[11px] text-gray-500 dark:text-gray-400 line-clamp-1">
                                  {faq.answer}
                                </p>
                              </div>
                              <ArrowRight className="w-4 h-4 text-foundation-teal opacity-0 group-hover:opacity-100 transition-opacity flex-shrink-0" />
                            </div>
                          ))}
                        </div>
                      </div>
                    )}
                  </>
                )}
              </div>
            )}
            
            <div className="flex justify-between items-center text-[10px] text-gray-400 pt-1 border-t border-gray-100 dark:border-gray-800">
              <span>Busque por palabras clave de nuestros programas sociales o FAQs</span>
              <button
                type="button"
                onClick={() => setSearchOpen(false)}
                className="font-bold text-foundation-teal hover:underline cursor-pointer"
              >
                Cerrar búsqueda
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Mobile Menu Drawer */}
      {mobileMenuOpen && (
        <div className="md:hidden border-t border-gray-100 dark:border-gray-800 bg-white dark:bg-gray-900 shadow-xl animate-fade-in absolute top-20 left-0 w-full z-30">
          <div className="px-4 pt-3 pb-6 space-y-2">
            {menuItems.map((item) => (
              <button
                key={item.id}
                onClick={() => handleNav(item.id)}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center justify-between transition-all ${
                  item.isHighlight
                    ? "bg-foundation-teal text-white shadow-md"
                    : currentView === item.id
                    ? "bg-foundation-teal-light dark:bg-foundation-teal/15 text-foundation-teal"
                    : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-850 hover:text-foundation-teal"
                }`}
              >
                <span className="flex items-center gap-2">
                  {item.isHighlight && <Heart className="w-4 h-4 fill-current text-white" />}
                  {item.label}
                </span>
                <ChevronRight className="w-4 h-4" />
              </button>
            ))}

            <div className="border-t border-gray-100 dark:border-gray-800 my-3 pt-3" />

            {isLoggedIn ? (
              <div className="space-y-2">
                <button
                  onClick={() => handleNav("admin-panel")}
                  className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center gap-2 ${
                    currentView === "admin-panel" ? "bg-foundation-teal-light dark:bg-foundation-teal/15 text-foundation-teal" : "text-gray-700 dark:text-gray-300"
                  }`}
                >
                  <Settings className="w-5 h-5 animate-spin-slow text-foundation-teal" />
                  <span>CMS (Cambiar Logos y Contenidos)</span>
                </button>
                <button
                  onClick={() => {
                    onLogout();
                    setMobileMenuOpen(false);
                  }}
                  className="w-full text-left px-4 py-3 rounded-xl font-bold text-foundation-red hover:bg-red-50 dark:hover:bg-red-950/20 flex items-center gap-2"
                >
                  <LogOut className="w-5 h-5" />
                  Cerrar Sesión
                </button>
              </div>
            ) : (
              <button
                onClick={() => handleNav("iniciar-sesion")}
                className={`w-full text-left px-4 py-3 rounded-xl font-bold flex items-center justify-between ${
                  currentView === "iniciar-sesion" ? "bg-foundation-teal-light dark:bg-foundation-teal/15 text-foundation-teal" : "text-gray-500 dark:text-gray-400 hover:bg-gray-50 dark:hover:bg-gray-850"
                }`}
              >
                <span>Iniciar Sesión</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        </div>
      )}
    </header>
  );
}
