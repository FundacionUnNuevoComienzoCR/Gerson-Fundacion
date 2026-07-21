import { useState } from "react";
import { Menu, X, Heart, Settings, LogOut, ChevronRight, Sun, Moon } from "lucide-react";
import { getDirectDriveImageUrl } from "../utils/drive";

interface HeaderProps {
  currentView: string;
  onViewChange: (view: string) => void;
  isLoggedIn: boolean;
  onLogout: () => void;
  logoUrl?: string;
  theme: "light" | "dark";
  onToggleTheme: () => void;
}

export default function Header({ currentView, onViewChange, isLoggedIn, onLogout, logoUrl, theme, onToggleTheme }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);

  const menuItems = [
    { id: "inicio", label: "Inicio" },
    { id: "sobre-nosotros", label: "Sobre Nosotros" },
    { id: "patrocinios", label: "Patrocinios" },
    { id: "galeria", label: "Galería" },
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
              <div className="w-12 h-12 flex-shrink-0 relative bg-foundation-teal-light dark:bg-foundation-teal/10 rounded-xl flex items-center justify-center border border-foundation-teal/20 group-hover:scale-105 transition-transform duration-300">
                <svg viewBox="0 0 100 100" className="w-9 h-9">
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
                  className={`px-3 py-2 rounded-lg text-sm font-semibold flex items-center gap-1.5 transition-colors cursor-pointer ${
                    currentView === "admin-panel"
                      ? "bg-foundation-teal-light dark:bg-foundation-teal/15 text-foundation-teal"
                      : "text-gray-700 dark:text-gray-300 hover:bg-gray-50 dark:hover:bg-gray-800 hover:text-foundation-teal"
                  }`}
                >
                  <Settings className="w-4 h-4 animate-spin-slow" />
                  CMS
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
                  <Settings className="w-5 h-5 animate-spin-slow" />
                  Panel de Administración
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
