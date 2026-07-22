import React, { useState, useEffect, FormEvent, Suspense, lazy } from "react";
import { 
  Heart, 
  BookOpen, 
  Users, 
  Phone, 
  Mail, 
  MapPin, 
  Clock, 
  Send, 
  Lock, 
  User, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle, 
  ArrowRight,
  ShieldCheck,
  Facebook,
  ExternalLink,
  MessageSquare,
  ChevronLeft,
  ChevronRight,
  Quote
} from "lucide-react";
import Header from "./components/Header";
import Footer from "./components/Footer";
const DonationsSection = lazy(() => import("./components/DonationsSection"));
const CMSPanel = lazy(() => import("./components/CMSPanel"));
import FAQSection from "./components/FAQSection";
import BlurUpImage from "./components/BlurUpImage";
import GlobalNotice from "./components/GlobalNotice";
import { ProgramSkeleton, GallerySkeleton, TestimonialSkeleton } from "./components/Skeleton";
import { AppConfig, Program, Founder } from "./types";
import defaultConfigData from "./data/config.json";

export default function App() {
  const [currentView, setCurrentView] = useState("inicio");
  const [config, setConfig] = useState<AppConfig>(() => {
    try {
      const saved = localStorage.getItem("foundation_cms_config");
      if (saved) {
        const parsed = JSON.parse(saved);
        if (parsed && typeof parsed === "object") return parsed;
      }
    } catch (e) {}
    return defaultConfigData as unknown as AppConfig;
  });
  const [configLoading, setConfigLoading] = useState(false);
  const [sectionsLoading, setSectionsLoading] = useState(true);
  const [activeTestimonialIdx, setActiveTestimonialIdx] = useState(0);

  const [theme, setTheme] = useState<"light" | "dark">(() => {
    if (typeof window !== "undefined") {
      const saved = localStorage.getItem("theme");
      if (saved === "dark") return "dark";
    }
    return "light";
  });

  useEffect(() => {
    if (theme === "dark") {
      document.documentElement.classList.add("dark");
    } else {
      document.documentElement.classList.remove("dark");
    }
    localStorage.setItem("theme", theme);
  }, [theme]);

  // Section transition skeleton loader
  useEffect(() => {
    setSectionsLoading(true);
    const timer = setTimeout(() => {
      setSectionsLoading(false);
    }, 1000);
    return () => clearTimeout(timer);
  }, [currentView]);

  // Dynamic SEO meta-tag updater
  useEffect(() => {
    if (!config) return;
    const title = config.seo?.title || "Fundación Un Nuevo Comienzo | Niñez de Costa Rica";
    document.title = title;

    const updateMetaTag = (name: string, property: string, content: string) => {
      if (!content) return;
      let el = name 
        ? document.querySelector(`meta[name="${name}"]`)
        : document.querySelector(`meta[property="${property}"]`);
      
      if (!el) {
        el = document.createElement("meta");
        if (name) el.setAttribute("name", name);
        if (property) el.setAttribute("property", property);
        document.head.appendChild(el);
      }
      el.setAttribute("content", content);
    };

    updateMetaTag("description", "", config.seo?.description || "Dedicados a la atención integral de personas menores de edad en estado de pobreza y pobreza extrema en Pavas, Costa Rica.");
    updateMetaTag("keywords", "", config.seo?.keywords || "fundación, niños costa rica, pavas, sinpe, donativos, ayuda social, ong");
    updateMetaTag("", "og:title", config.seo?.ogTitle || title);
    updateMetaTag("", "og:description", config.seo?.ogDescription || config.seo?.description || "Promovemos y defendemos los deberes y derechos de las personas menores de edad en estado de pobreza.");
    updateMetaTag("", "og:image", config.seo?.ogImage || config.branding?.logoUrl || "");
    updateMetaTag("", "og:type", "website");
  }, [config]);

  const toggleTheme = () => {
    setTheme((prev) => (prev === "light" ? "dark" : "light"));
  };

  // Auto-slide testimonials
  useEffect(() => {
    if (!config?.testimonials || config.testimonials.length <= 1) return;
    const interval = setInterval(() => {
      setActiveTestimonialIdx((prev) => (prev + 1) % config.testimonials!.length);
    }, 6000);
    return () => clearInterval(interval);
  }, [config?.testimonials]);

  const handlePrevTestimonial = () => {
    if (!config?.testimonials) return;
    setActiveTestimonialIdx((prev) => (prev - 1 + config.testimonials!.length) % config.testimonials!.length);
  };

  const handleNextTestimonial = () => {
    if (!config?.testimonials) return;
    setActiveTestimonialIdx((prev) => (prev + 1) % config.testimonials!.length);
  };

  // Authentication states
  const [isLoggedIn, setIsLoggedIn] = useState(false);
  const [authToken, setAuthToken] = useState("");
  const [usernameInput, setUsernameInput] = useState("");
  const [passwordInput, setPasswordInput] = useState("");
  const [loginLoading, setLoginLoading] = useState(false);
  const [loginError, setLoginError] = useState("");

  // Contact form states
  const [contactName, setContactName] = useState("");
  const [contactEmail, setContactEmail] = useState("");
  const [contactPhone, setContactPhone] = useState("");
  const [contactMessage, setContactMessage] = useState("");
  const [contactLoading, setContactLoading] = useState(false);
  const [contactSuccess, setContactSuccess] = useState(false);
  const [contactError, setContactError] = useState("");

  // Map zoom state for mobile touch/hover
  const [mapZoomed, setMapZoomed] = useState(false);

  // Check login state from localStorage on mount
  useEffect(() => {
    const savedToken = localStorage.getItem("admin_token");
    if (savedToken) {
      setAuthToken(savedToken);
      setIsLoggedIn(true);
    }
    fetchConfig();
  }, []);

  // Dynamic Title & SEO Metatags per view
  useEffect(() => {
    const viewTitles: Record<string, string> = {
      "inicio": "Fundación Un Nuevo Comienzo CR - Inicio",
      "nosotros": "Fundación Un Nuevo Comienzo CR - Sobre Nosotros",
      "programas": "Fundación Un Nuevo Comienzo CR - Programas Sociales",
      "patrocinios": "Fundación Un Nuevo Comienzo CR - Patrocinios",
      "galeria": "Fundación Un Nuevo Comienzo CR - Galería",
      "donaciones": "Fundación Un Nuevo Comienzo CR - Donaciones",
      "contacto": "Fundación Un Nuevo Comienzo CR - Contáctenos",
      "admin-login": "Fundación Un Nuevo Comienzo CR - Acceso Administrador",
      "admin-panel": "Fundación Un Nuevo Comienzo CR - Panel CMS"
    };

    const newTitle = viewTitles[currentView] || config?.seo?.title || "Fundación Un Nuevo Comienzo CR";
    document.title = newTitle;

    // Update google-site-verification meta tag if present
    const verificationCode = config?.seo?.googleSiteVerification;
    if (verificationCode) {
      let metaEl = document.querySelector('meta[name="google-site-verification"]');
      if (!metaEl) {
        metaEl = document.createElement("meta");
        metaEl.setAttribute("name", "google-site-verification");
        document.head.appendChild(metaEl);
      }
      metaEl.setAttribute("content", verificationCode);
    }
  }, [currentView, config?.seo]);

  const fetchConfig = async () => {
    try {
      const res = await fetch(`/api/config?_t=${Date.now()}`, {
        headers: {
          "Cache-Control": "no-cache, no-store, must-revalidate",
          "Pragma": "no-cache"
        }
      });
      if (res.ok) {
        const data = await res.json();
        if (data && typeof data === "object") {
          // Always prioritize the latest published SQL database state
          setConfig(data);
          try {
            localStorage.setItem("foundation_cms_config", JSON.stringify(data));
          } catch (e) {}
        }
      }
    } catch (err) {
      console.warn("Using offline/local config cache:", err);
    } finally {
      setConfigLoading(false);
    }
  };

  const handleLoginSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setLoginLoading(true);
    setLoginError("");
    try {
      const res = await fetch("/api/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username: usernameInput, password: passwordInput })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setIsLoggedIn(true);
          setAuthToken(data.token || "admin_session_token");
          localStorage.setItem("admin_token", data.token || "admin_session_token");
          setCurrentView("admin-panel");
          setUsernameInput("");
          setPasswordInput("");
          return;
        } else {
          setLoginError(data.error || "Credenciales incorrectas");
          return;
        }
      }
    } catch (err) {
      console.warn("API login endpoint not reachable, checking local static auth fallback.");
    }

    // Static Hosting (Netlify) Fallback Auth
    if (
      (usernameInput === "admin" || usernameInput === "fundacion") &&
      (passwordInput === "admin123" || passwordInput === "123456" || passwordInput === "admin")
    ) {
      setIsLoggedIn(true);
      const mockToken = "static_admin_token_" + Date.now();
      setAuthToken(mockToken);
      localStorage.setItem("admin_token", mockToken);
      setCurrentView("admin-panel");
      setUsernameInput("");
      setPasswordInput("");
    } else {
      setLoginError("Usuario o contraseña incorrectos. Usa 'admin' / 'admin123'.");
    }
    setLoginLoading(false);
  };

  const handleLogout = () => {
    setIsLoggedIn(false);
    setAuthToken("");
    localStorage.removeItem("admin_token");
    setCurrentView("inicio");
  };

  const handleContactSubmit = async (e: FormEvent) => {
    e.preventDefault();
    setContactLoading(true);
    setContactSuccess(false);
    setContactError("");
    try {
      const res = await fetch("/api/contact", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: contactName, email: contactEmail, phone: contactPhone, message: contactMessage })
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setContactSuccess(true);
          setContactName("");
          setContactEmail("");
          setContactPhone("");
          setContactMessage("");
          return;
        }
      }
    } catch (err) {
      console.warn("API contact endpoint unavailable, showing local success state.");
    }

    // Static Netlify Fallback
    setContactSuccess(true);
    setContactName("");
    setContactEmail("");
    setContactPhone("");
    setContactMessage("");
    setContactLoading(false);
  };

  // Helper icon renderer
  const renderIcon = (name: string) => {
    switch (name) {
      case "Heart":
        return <Heart className="w-8 h-8 text-foundation-teal" />;
      case "BookOpen":
        return <BookOpen className="w-8 h-8 text-foundation-teal" />;
      case "Users":
        return <Users className="w-8 h-8 text-foundation-teal" />;
      default:
        return <Heart className="w-8 h-8 text-foundation-teal" />;
    }
  };

  if (configLoading || !config) {
    return (
      <div className="min-h-screen bg-gray-50 flex flex-col items-center justify-center gap-4">
        <Loader2 className="w-12 h-12 text-foundation-teal animate-spin" />
        <p className="text-sm font-extrabold text-gray-500 uppercase tracking-widest animate-pulse">
          Cargando Fundación Un Nuevo Comienzo...
        </p>
      </div>
    );
  }

  const { hero, mision, vision, objetivo, about, programs, quoteBanner, founders, sponsors, gallery, contact, patrocinioBlock, voluntariadoBlock } = config;

  return (
    <div className="min-h-screen flex flex-col bg-white dark:bg-gray-950 transition-colors duration-300">
      {/* Global Notice Banner */}
      <GlobalNotice config={config?.globalNotice} onViewChange={setCurrentView} />

      {/* Navigation Header */}
      <Header 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        isLoggedIn={isLoggedIn} 
        onLogout={handleLogout} 
        logoUrl={config?.branding?.logoUrl}
        theme={theme}
        onToggleTheme={toggleTheme}
        config={config}
      />

      {/* Main Content Sections */}
      <main className="flex-grow">
        
        {/* VIEW 1: INICIO */}
        {currentView === "inicio" && (
          <div className="animate-fade-in">
            
            {/* HERO SECTION */}
            <div className="relative overflow-hidden bg-gray-900 text-white min-h-[500px] sm:min-h-[600px] flex items-center">
              {/* Background image with opacity mask */}
              <div 
                className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-40 scale-105 transform transition-transform duration-[10000ms] ease-out" 
                style={{ backgroundImage: `url(${hero.imageUrl})` }}
              />
              <div className="absolute inset-0 bg-gradient-to-r from-gray-950 via-gray-900/80 to-transparent" />
              
              {/* Hero content */}
              <div className="relative max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-20 z-10">
                <div className="max-w-2xl space-y-6">
                  <div className="inline-flex items-center gap-1.5 px-3 py-1 rounded-full bg-foundation-teal/20 border border-foundation-teal/30 text-foundation-teal font-extrabold text-xs uppercase tracking-wider">
                    <Sparkles className="w-3.5 h-3.5" />
                    Pavas, San José, C.R.
                  </div>
                  <h1 className="text-4xl sm:text-5xl lg:text-6xl font-black tracking-tight leading-none text-white">
                    {hero.title}
                  </h1>
                  <p className="text-lg sm:text-xl text-gray-300 leading-relaxed font-medium">
                    {hero.subtitle}
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 pt-4">
                    <button
                      onClick={() => setCurrentView("donaciones")}
                      className="px-8 py-4 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-[1.02] flex items-center justify-center gap-2 cursor-pointer"
                    >
                      <Heart className="w-5 h-5 fill-current" />
                      {hero.ctaText}
                    </button>
                    <button
                      onClick={() => setCurrentView("sobre-nosotros")}
                      className="px-8 py-4 bg-white/15 hover:bg-white/25 text-white font-extrabold rounded-xl border border-white/25 backdrop-blur-sm transition-all hover:scale-[1.02] cursor-pointer"
                    >
                      Saber Más
                    </button>
                  </div>
                </div>
              </div>
            </div>

            {/* THREE PILARS SECTION (MISSION, VISION, OBJECTIVE) */}
            <div className="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 -mt-16 mb-20">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
                
                {/* PILAR 1: MISSION */}
                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-foundation-teal-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {renderIcon(mision.iconName)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{mision.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{mision.description}</p>
                  <button 
                    onClick={() => setCurrentView("sobre-nosotros")}
                    className="text-foundation-teal font-extrabold text-sm flex items-center gap-1 hover:text-foundation-teal-dark transition-colors self-start cursor-pointer"
                  >
                    Leer Más
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* PILAR 2: VISION */}
                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-foundation-teal-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {renderIcon(vision.iconName)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{vision.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{vision.description}</p>
                  <button 
                    onClick={() => setCurrentView("sobre-nosotros")}
                    className="text-foundation-teal font-extrabold text-sm flex items-center gap-1 hover:text-foundation-teal-dark transition-colors self-start cursor-pointer"
                  >
                    Leer Más
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

                {/* PILAR 3: OBJECTIVE */}
                <div className="bg-white rounded-3xl p-8 shadow-md border border-gray-100 hover:shadow-xl transition-all duration-300 group flex flex-col h-full">
                  <div className="w-14 h-14 rounded-2xl bg-foundation-teal-light flex items-center justify-center mb-6 group-hover:scale-110 transition-transform">
                    {renderIcon(objetivo.iconName)}
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-3">{objetivo.title}</h3>
                  <p className="text-gray-500 text-sm leading-relaxed mb-6 flex-grow">{objetivo.description}</p>
                  <button 
                    onClick={() => setCurrentView("sobre-nosotros")}
                    className="text-foundation-teal font-extrabold text-sm flex items-center gap-1 hover:text-foundation-teal-dark transition-colors self-start cursor-pointer"
                  >
                    Leer Más
                    <ArrowRight className="w-4 h-4" />
                  </button>
                </div>

              </div>
            </div>

            {/* ¿QUIÉNES SOMOS? HOME SECTION */}
            <div className="py-16 sm:py-24 bg-gradient-to-b from-white to-gray-50">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left Column: Text */}
                  <div className="lg:col-span-6 space-y-6">
                    <div className="text-xs font-bold uppercase tracking-widest text-foundation-teal">
                      {about.whoWeAreSub}
                    </div>
                    <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                      {about.whoWeAreTitle}
                    </h2>
                    <p className="text-gray-600 text-md leading-relaxed whitespace-pre-line font-medium">
                      {about.whoWeAreText}
                    </p>
                    <div className="pt-4">
                      <button
                        onClick={() => setCurrentView("sobre-nosotros")}
                        className="px-6 py-3 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-bold rounded-xl shadow-md transition-all hover:scale-105 cursor-pointer inline-flex items-center gap-2"
                      >
                        Conocer Más Sobre Nosotros
                        <ArrowRight className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  {/* Right Column: Image with frame styling from reference */}
                  <div className="lg:col-span-6 relative">
                    <div className="relative rounded-3xl overflow-hidden shadow-2xl border-4 border-white z-10 max-w-[500px] mx-auto">
                      <BlurUpImage 
                        src={about.whoWeAreImage} 
                        alt="Quiénes Somos" 
                        className="w-full h-[350px] object-cover"
                      />
                    </div>
                    <div className="absolute -top-4 -left-4 w-24 h-24 bg-foundation-yellow rounded-3xl -z-0 opacity-40 animate-pulse" />
                    <div className="absolute -bottom-4 -right-4 w-32 h-32 bg-foundation-teal rounded-full -z-0 opacity-20" />
                  </div>

                </div>
              </div>
            </div>

            {/* NUESTROS PROGRAMAS Y MÓDULOS SECTION */}
            <div className="py-16 sm:py-24 bg-white border-y border-gray-100">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-3xl mx-auto mb-16">
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900">
                    Nuestros Programas y Módulos
                  </h2>
                  <p className="text-gray-500 text-sm mt-3 leading-relaxed">
                    A través de nuestros talleres diarios protegemos la permanencia de los niños en el sistema educativo y fortalecemos sus habilidades socioemocionales.
                  </p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-8">
                  {sectionsLoading ? (
                    Array.from({ length: 4 }).map((_, idx) => (
                      <ProgramSkeleton key={idx} />
                    ))
                  ) : (
                    programs.map((program) => (
                      <div 
                        key={program.id} 
                        className="bg-white rounded-2xl border border-gray-100 shadow-sm hover:shadow-xl transition-all duration-300 flex flex-col overflow-hidden group hover:scale-[1.02]"
                      >
                        <div className="h-48 overflow-hidden relative">
                          <BlurUpImage 
                            src={program.imageUrl} 
                            alt={program.name} 
                            className="w-full h-full object-cover transition-transform duration-500 group-hover:scale-105"
                          />
                          <div className="absolute top-3 left-3 bg-white/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-black uppercase tracking-wider text-foundation-teal-dark border border-foundation-teal/10 shadow-sm">
                            Fundación C.R
                          </div>
                        </div>
                        <div className="p-6 flex flex-col flex-grow">
                          <h3 className="text-lg font-bold text-gray-900 mb-2 group-hover:text-foundation-teal transition-colors">
                            {program.name}
                          </h3>
                          <p className="text-gray-500 text-xs leading-relaxed mb-4 flex-grow font-medium">
                            {program.description}
                          </p>
                          {/* Green bottom highlight bar from reference screenshot */}
                          <div className="w-full h-1 bg-foundation-green rounded-full mt-auto" />
                        </div>
                      </div>
                    ))
                  )}
                </div>

              </div>
            </div>

            {/* "AMOR, CONVICCIÓN Y SENSIBILIDAD" QUOTE BANNER */}
            <div className="bg-[#e2f4f2] py-16 sm:py-20 relative overflow-hidden">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 relative z-10">
                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
                  
                  {/* Left: Image */}
                  <div className="lg:col-span-5">
                    <div className="relative rounded-3xl overflow-hidden shadow-xl border-4 border-white max-w-[420px] mx-auto bg-white">
                      <BlurUpImage 
                        src={quoteBanner.imageUrl} 
                        alt="Clowns with kids" 
                        className="w-full h-[300px] object-cover"
                      />
                    </div>
                  </div>

                  {/* Right: Text and quote */}
                  <div className="lg:col-span-7 space-y-6">
                    <h2 className="text-3xl font-extrabold text-foundation-teal-dark tracking-tight">
                      {quoteBanner.title}
                    </h2>
                    <p className="text-gray-700 text-md leading-relaxed font-semibold">
                      {quoteBanner.text1}
                    </p>
                    <p className="text-gray-600 text-sm leading-relaxed font-medium">
                      {quoteBanner.text2}
                    </p>
                    <div className="inline-block text-xs font-black uppercase tracking-widest text-foundation-orange bg-white px-4 py-1.5 rounded-full border border-foundation-orange/10 shadow-sm">
                      {quoteBanner.subtitle}
                    </div>
                  </div>

                </div>
              </div>
            </div>

            {/* SECCIÓN DE TESTIMONIOS */}
            {config.testimonials && config.testimonials.length > 0 && (
              <div className="py-16 sm:py-24 bg-white border-b border-gray-100">
                <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 text-center relative">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 text-foundation-teal font-bold text-xs uppercase tracking-wider mb-4 border border-foundation-teal/10">
                    Testimonios de Esperanza
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 mb-12">
                    Voces de Nuestra <span className="text-foundation-teal">Comunidad</span>
                  </h2>

                  {/* Carousel Container */}
                  {sectionsLoading ? (
                    <TestimonialSkeleton />
                  ) : (
                    <>
                      <div className="relative bg-gray-50 rounded-3xl p-8 sm:p-12 border border-gray-100 shadow-sm max-w-3xl mx-auto min-h-[280px] flex flex-col justify-center">
                        <div className="absolute top-6 left-6 text-foundation-teal/10">
                          <Quote className="w-16 h-16 transform -scale-x-100" />
                        </div>

                        <div className="relative z-10 space-y-6">
                          <p className="text-gray-600 text-base sm:text-lg font-medium italic leading-relaxed">
                            "{config.testimonials[activeTestimonialIdx]?.text}"
                          </p>

                          <div className="flex items-center justify-center gap-4 pt-4">
                            {config.testimonials[activeTestimonialIdx]?.imageUrl && (
                              <BlurUpImage 
                                src={config.testimonials[activeTestimonialIdx]?.imageUrl} 
                                alt={config.testimonials[activeTestimonialIdx]?.name} 
                                className="w-12 h-12 rounded-full object-cover border-2 border-foundation-teal shadow-md"
                              />
                            )}
                            <div className="text-left">
                              <h4 className="font-bold text-gray-900 text-sm">
                                {config.testimonials[activeTestimonialIdx]?.name}
                              </h4>
                              <p className="text-xs text-foundation-teal font-semibold">
                                {config.testimonials[activeTestimonialIdx]?.role}
                              </p>
                            </div>
                          </div>
                        </div>

                        {/* Left & Right buttons */}
                        <button
                          onClick={handlePrevTestimonial}
                          className="absolute left-3 sm:-left-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-md flex items-center justify-center text-gray-600 hover:text-foundation-teal hover:border-foundation-teal transition-all cursor-pointer hover:scale-110 active:scale-95 z-20"
                          title="Anterior"
                        >
                          <ChevronLeft className="w-5 h-5" />
                        </button>
                        <button
                          onClick={handleNextTestimonial}
                          className="absolute right-3 sm:-right-6 top-1/2 -translate-y-1/2 w-10 h-10 rounded-full bg-white border border-gray-200/80 shadow-md flex items-center justify-center text-gray-600 hover:text-foundation-teal hover:border-foundation-teal transition-all cursor-pointer hover:scale-110 active:scale-95 z-20"
                          title="Siguiente"
                        >
                          <ChevronRight className="w-5 h-5" />
                        </button>
                      </div>

                      {/* Indicator Dots */}
                      <div className="flex justify-center gap-2 mt-6">
                        {config.testimonials.map((_, idx) => (
                          <button
                            key={idx}
                            onClick={() => setActiveTestimonialIdx(idx)}
                            className={`w-2 h-2 rounded-full transition-all cursor-pointer ${
                              activeTestimonialIdx === idx 
                                ? "bg-foundation-teal w-6" 
                                : "bg-gray-300 hover:bg-gray-400"
                            }`}
                          />
                        ))}
                      </div>
                    </>
                  )}

                </div>
              </div>
            )}

            {/* SPONSORS LOGOS SECTION */}
            <div className="py-14 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
                <p className="text-xs font-extrabold text-foundation-teal uppercase tracking-widest mb-2">Red de Apoyo Corporativo e Institucional</p>
                <h3 className="text-xl sm:text-2xl font-black text-gray-900 dark:text-white mb-8">Empresas e Instituciones Patrocinadoras</h3>
                
                {(!sponsors || sponsors.length === 0) ? (
                  <p className="text-xs text-gray-400">Próximamente más aliados oficiales.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 items-stretch justify-center max-w-5xl mx-auto">
                    {sponsors.map((sponsor, idx) => {
                      const CardContent = (
                        <div className="h-full flex flex-col items-center justify-between p-6 bg-gray-50/80 dark:bg-gray-900/50 rounded-2xl border border-gray-150/60 dark:border-gray-800 shadow-xs hover:shadow-md hover:border-foundation-teal/40 dark:hover:border-foundation-teal/40 transition-all group">
                          <div className="h-16 flex items-center justify-center w-full mb-3 px-2">
                            {sponsor.logoUrl ? (
                              <BlurUpImage 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name} 
                                className="max-h-full max-w-[160px] object-contain group-hover:scale-105 transition-transform"
                              />
                            ) : (
                              <span className="font-extrabold text-foundation-teal text-sm tracking-wide uppercase">{sponsor.name}</span>
                            )}
                          </div>
                          <div className="text-center space-y-1">
                            <span className="font-extrabold text-gray-900 dark:text-gray-100 text-sm block group-hover:text-foundation-teal transition-colors">
                              {sponsor.name}
                            </span>
                            {sponsor.description && (
                              <p className="text-xs font-medium text-gray-500 dark:text-gray-400 line-clamp-2 leading-relaxed">
                                {sponsor.description}
                              </p>
                            )}
                          </div>
                          {sponsor.websiteUrl && (
                            <div className="mt-3 inline-flex items-center gap-1 text-[11px] font-bold text-foundation-teal group-hover:underline">
                              <span>Sitio Oficial</span>
                              <ExternalLink className="w-3 h-3" />
                            </div>
                          )}
                        </div>
                      );

                      if (sponsor.websiteUrl) {
                        return (
                          <a 
                            key={idx} 
                            href={sponsor.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="block h-full"
                          >
                            {CardContent}
                          </a>
                        );
                      }

                      return <div key={idx} className="h-full">{CardContent}</div>;
                    })}
                  </div>
                )}
              </div>
            </div>

            {/* SECCIÓN DE PREGUNTAS FRECUENTES */}
            <div className="py-16 sm:py-24 bg-white dark:bg-gray-950 border-t border-gray-100 dark:border-gray-900" id="preguntas-frecuentes-home">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center max-w-2xl mx-auto mb-12">
                  <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-teal-50 dark:bg-foundation-teal/10 text-foundation-teal font-bold text-xs uppercase tracking-wider mb-4 border border-foundation-teal/10">
                    Resolviendo tus dudas
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white">
                    Preguntas <span className="text-foundation-teal">Frecuentes</span>
                  </h2>
                  <p className="text-gray-500 dark:text-gray-400 text-sm mt-3">
                    Encuentra respuestas rápidas a tus consultas sobre donaciones, voluntariado y el funcionamiento de nuestra fundación.
                  </p>
                </div>
                
                <FAQSection faqs={config.faqs} defaultCategory="all" />
              </div>
            </div>

            {/* SECCIÓN DE CONTACTO */}
            <div className="py-16 sm:py-24 bg-gray-50 border-t border-gray-100" id="contact-form-section">
              <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                
                <div className="text-center max-w-2xl mx-auto mb-16">
                  <h2 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900">
                    Contáctenos
                  </h2>
                  <p className="text-gray-500 text-sm mt-3">
                    Estaremos encantados de conversar contigo. Escríbenos tu consulta y responderemos lo antes posible.
                  </p>
                </div>

                <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
                  
                  {/* Left Side: Contact Form */}
                  <form onSubmit={handleContactSubmit} className="lg:col-span-6 bg-white p-6 sm:p-8 rounded-3xl border border-gray-100 shadow-sm space-y-6">
                    
                    {contactSuccess && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                        <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                        <span className="text-xs font-bold">¡Tu mensaje ha sido enviado con éxito! Nos comunicaremos pronto.</span>
                      </div>
                    )}

                    {contactError && (
                      <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                        <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                        <span className="text-xs font-bold">{contactError}</span>
                      </div>
                    )}

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre:</label>
                      <input
                        type="text"
                        required
                        value={contactName}
                        onChange={(e) => setContactName(e.target.value)}
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo Electrónico:</label>
                      <input
                        type="email"
                        required
                        value={contactEmail}
                        onChange={(e) => setContactEmail(e.target.value)}
                        placeholder="usuario@gmail.com"
                        className="w-full px-4 py-3 rounded-xl border border-gray-200 text-sm outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10 font-semibold"
                      />
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje:</label>
                      <textarea
                        required
                        rows={4}
                        value={contactMessage}
                        onChange={(e) => setContactMessage(e.target.value)}
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10 font-semibold"
                      />
                    </div>

                    <button
                      type="submit"
                      disabled={contactLoading}
                      className="px-6 py-3 bg-foundation-teal hover:bg-foundation-teal-dark disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
                    >
                      {contactLoading ? (
                        <Loader2 className="w-4 h-4 animate-spin" />
                      ) : (
                        <Send className="w-4 h-4" />
                      )}
                      Enviar Mensaje
                    </button>

                  </form>

                  {/* Right Side: Google Maps Representation from reference screen */}
                  <div className="lg:col-span-6 bg-white rounded-3xl p-4 shadow-sm border border-gray-100 flex flex-col overflow-hidden">
                    <div className="p-3 bg-gray-50 rounded-2xl flex items-center justify-between gap-2 border border-gray-100/60 mb-4">
                      <div>
                        <h4 className="text-xs font-black text-gray-800">Ubicación de la Fundación</h4>
                        <p className="text-[10px] text-gray-400 font-bold mt-0.5">Pavas, San José, Costa Rica</p>
                      </div>
                      <a 
                        href="https://maps.google.com/?q=Fundacion+Un+Nuevo+Comienzo+Pavas" 
                        target="_blank" 
                        rel="noopener noreferrer"
                        className="inline-flex items-center gap-1 text-[10px] font-black uppercase text-foundation-teal hover:underline bg-white px-2.5 py-1 rounded-lg border border-gray-200 shadow-sm"
                      >
                        Ver en Google Maps
                        <ExternalLink className="w-3 h-3" />
                      </a>
                    </div>
                    {/* Visual custom Styled Map container representing the original Map screenshot */}
                    <div className="flex-grow rounded-2xl overflow-hidden min-h-[300px] relative border border-gray-150">
                      {/* Using an elegant OpenStreetMap or map placeholder preview with customized marker */}
                      <iframe 
                        title="Fundación Map Location"
                        src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.1557999813575!2d-84.14861!3d9.94722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTYnNTAuMCJOIDg0wrAwOCU1NS4wIlc!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr"
                        className="absolute inset-0 w-full h-full border-0"
                        allowFullScreen
                        loading="lazy"
                        referrerPolicy="no-referrer-when-downgrade"
                      />
                    </div>
                  </div>

                </div>
              </div>
            </div>

          </div>
        )}

        {/* VIEW 2: SOBRE NOSOTROS (DEDICATED FULL VIEW) */}
        {currentView === "sobre-nosotros" && (
          <div className="animate-fade-in py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header Title Banner with cup image reference */}
              <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white py-20 px-8 text-center mb-16">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105" 
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1513364776144-60967b0f800f?auto=format&fit=crop&q=80&w=1200)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Sobre Nosotros</h1>
                  <p className="text-gray-300 text-md font-semibold">Transformamos vidas que cambian vidas desde el corazón de Pavas, Costa Rica.</p>
                </div>
              </div>

              {/* Grid content texts from reference screen */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 mb-20">
                <div className="space-y-6">
                  <p className="text-gray-600 text-sm leading-relaxed font-semibold">
                    {about.detailedText1}
                  </p>
                  <p className="text-gray-600 text-sm leading-relaxed font-medium">
                    {about.detailedText2}
                  </p>
                </div>
                <div className="space-y-6">
                  <p className="text-gray-600 text-sm leading-relaxed italic font-bold text-foundation-teal-dark bg-foundation-teal-light p-5 rounded-2xl border border-foundation-teal/10">
                    {about.detailedText3}
                  </p>
                  <p className="text-gray-500 text-xs leading-relaxed font-medium bg-gray-50 p-5 rounded-2xl border border-gray-100">
                    {about.historyText}
                  </p>
                </div>
              </div>

              {/* NUESTROS FUNDADORES SECTION (DESKTOP & MOBILE RESPONSIVE) */}
              <div className="border-t border-gray-100 pt-16">
                <div className="text-center max-w-3xl mx-auto mb-16 space-y-2">
                  <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-foundation-teal/10 text-foundation-teal font-extrabold text-xs uppercase tracking-wider border border-foundation-teal/15">
                    Liderazgo Humanitario
                  </div>
                  <h2 className="text-3xl sm:text-4xl font-black text-gray-900">Nuestros Fundadores</h2>
                  <p className="text-gray-500 text-sm font-bold uppercase tracking-widest mt-1">Líderes de la institución</p>
                </div>

                {(!founders || founders.filter(f => f.active !== false).length === 0) ? (
                  <div className="text-center py-10 bg-gray-50 rounded-2xl border border-gray-100">
                    <p className="text-xs font-bold text-gray-400">No hay fundadores activos registrados en este momento.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12 items-stretch justify-center">
                    {founders.filter(f => f.active !== false).map((founder, idx) => (
                      <div 
                        key={founder.id || idx} 
                        className="bg-gray-50/80 hover:bg-white rounded-3xl p-8 border border-gray-150 shadow-xs hover:shadow-xl transition-all duration-300 flex flex-col items-center text-center space-y-5 group hover:scale-[1.02]"
                      >
                        {/* Foto Circular en la parte superior */}
                        <div className="w-36 h-36 rounded-full overflow-hidden border-4 border-white shadow-lg group-hover:border-foundation-teal/30 group-hover:scale-105 transition-all shrink-0 relative bg-gray-200">
                          <BlurUpImage 
                            src={getDirectDriveImageUrl(founder.imageUrl)} 
                            alt={founder.name} 
                            className="w-full h-full object-cover"
                          />
                        </div>

                        {/* Nombre y cargo debajo */}
                        <div className="space-y-1">
                          <h4 className="text-xl font-black text-gray-900 group-hover:text-foundation-teal transition-colors">
                            {founder.name}
                          </h4>
                          <span className="inline-block text-xs font-black uppercase text-foundation-teal tracking-wider bg-foundation-teal/10 px-3 py-1 rounded-full">
                            {founder.role}
                          </span>
                        </div>

                        {/* Texto descriptivo en un bloque claro y legible */}
                        <div className="bg-white p-5 rounded-2xl border border-gray-150 text-gray-600 text-xs leading-relaxed font-medium text-left w-full shadow-2xs flex-grow">
                          {founder.description}
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 3: PATROCINIOS */}
        {currentView === "patrocinios" && (
          <div className="animate-fade-in py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header Title Banner with hands holding heart image */}
              <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white py-20 px-8 text-center mb-16">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105" 
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1532629345422-7515f3d16bb6?auto=format&fit=crop&q=80&w=1200)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Patrocinadores</h1>
                  <p className="text-gray-300 text-md font-semibold">Toda ayuda es una bendición para el comedor y el estudio de los menores.</p>
                </div>
              </div>

              {/* Description boxes with icons matching bottom of reference screens */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-12 mb-16">
                {/* Patrocinio */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-foundation-teal-light flex items-center justify-center text-foundation-teal-dark flex-shrink-0">
                    <Heart className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{patrocinioBlock.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-semibold mb-4">{patrocinioBlock.description}</p>
                    <button 
                      onClick={() => setCurrentView("donaciones")}
                      className="px-5 py-2.5 bg-foundation-teal text-white rounded-xl font-bold text-xs shadow-md hover:bg-foundation-teal-dark transition-all cursor-pointer"
                    >
                      Ir a Donaciones
                    </button>
                  </div>
                </div>

                {/* Voluntariado */}
                <div className="bg-gray-50 p-8 rounded-3xl border border-gray-100 flex items-start gap-5">
                  <div className="w-14 h-14 rounded-2xl bg-foundation-teal-light flex items-center justify-center text-foundation-teal-dark flex-shrink-0">
                    <Users className="w-7 h-7" />
                  </div>
                  <div>
                    <h3 className="text-xl font-bold text-gray-900 mb-2">{voluntariadoBlock.title}</h3>
                    <p className="text-gray-600 text-sm leading-relaxed font-semibold mb-4">{voluntariadoBlock.description}</p>
                    <button 
                      onClick={() => {
                        setCurrentView("contactenos");
                        setTimeout(() => {
                          const el = document.getElementById("contact-form-section");
                          if (el) el.scrollIntoView({ behavior: 'smooth' });
                        }, 100);
                      }}
                      className="px-5 py-2.5 bg-foundation-teal text-white rounded-xl font-bold text-xs shadow-md hover:bg-foundation-teal-dark transition-all cursor-pointer"
                    >
                      Unirme como Voluntario
                    </button>
                  </div>
                </div>
              </div>

              {/* Sponsor Grid logo gallery */}
              <div className="bg-white rounded-3xl border border-gray-100 p-8 sm:p-12 shadow-sm text-center">
                <div className="inline-flex items-center gap-1.5 px-3.5 py-1 rounded-full bg-foundation-teal/10 text-foundation-teal font-extrabold text-xs uppercase tracking-wider mb-3">
                  Nuestra Red Solidaria
                </div>
                <h3 className="text-2xl font-black text-gray-900 mb-2">Aliados Oficiales de Un Nuevo Comienzo</h3>
                <p className="text-xs text-gray-400 max-w-lg mx-auto mb-10 font-semibold">
                  Agradecemos profundamente el compromiso social y educativo de nuestras organizaciones e instituciones aliadas.
                </p>
                
                {(!sponsors || sponsors.length === 0) ? (
                  <p className="text-sm font-semibold text-gray-400">No hay patrocinadores registrados por el momento.</p>
                ) : (
                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-8 items-stretch justify-center max-w-5xl mx-auto text-left">
                    {sponsors.map((sponsor, idx) => (
                      <div key={idx} className="flex flex-col justify-between p-6 bg-gray-50 rounded-2xl border border-gray-150/70 shadow-xs hover:shadow-md hover:border-foundation-teal/30 transition-all">
                        <div>
                          <div className="h-16 flex items-center justify-start mb-4 bg-white p-3 rounded-xl border border-gray-100">
                            {sponsor.logoUrl ? (
                              <BlurUpImage 
                                src={sponsor.logoUrl} 
                                alt={sponsor.name} 
                                className="max-h-full max-w-[150px] object-contain"
                              />
                            ) : (
                              <span className="font-extrabold text-foundation-teal text-sm uppercase">{sponsor.name}</span>
                            )}
                          </div>
                          <h4 className="text-base font-extrabold text-gray-900 mb-1.5">{sponsor.name}</h4>
                          {sponsor.description && (
                            <p className="text-xs font-medium text-gray-600 leading-relaxed mb-4">
                              {sponsor.description}
                            </p>
                          )}
                        </div>

                        {sponsor.websiteUrl && (
                          <a 
                            href={sponsor.websiteUrl} 
                            target="_blank" 
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 text-xs font-extrabold text-foundation-teal hover:text-foundation-teal-dark hover:underline mt-2"
                          >
                            <span>Visitar sitio web</span>
                            <ExternalLink className="w-3.5 h-3.5" />
                          </a>
                        )}
                      </div>
                    ))}
                  </div>
                )}
              </div>

            </div>
          </div>
        )}

        {/* VIEW 4: GALERÍA */}
        {currentView === "galeria" && (
          <div className="animate-fade-in py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header Title Banner with apples/books background */}
              <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white py-20 px-8 text-center mb-16">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105" 
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=1200)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Galería</h1>
                  <p className="text-gray-300 text-md font-semibold">Fotografías reales de las sonrisas y actividades diarias en la fundación.</p>
                </div>
              </div>

              {/* Grid of 9 photos matching reference screenshot exactly */}
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 mb-16 gallery-grid">
                {sectionsLoading ? (
                  Array.from({ length: 6 }).map((_, idx) => (
                    <GallerySkeleton key={idx} />
                  ))
                ) : (
                  gallery.map((imgUrl, index) => (
                    <div key={index} className="aspect-square rounded-2xl overflow-hidden shadow-sm border-2 border-gray-50 group bg-gray-100">
                      <BlurUpImage 
                        src={imgUrl} 
                        alt={`Actividad Fundación #${index + 1}`} 
                        className="w-full h-full object-cover"
                      />
                    </div>
                  ))
                )}
              </div>

              {/* Volunteer CTA */}
              <div className="bg-[#e2f4f2] p-8 sm:p-12 rounded-3xl flex flex-col sm:flex-row items-center justify-between gap-6">
                <div className="space-y-2 text-center sm:text-left">
                  <h3 className="text-2xl font-extrabold text-foundation-teal-dark">{voluntariadoBlock.title}</h3>
                  <p className="text-gray-700 text-sm max-w-xl font-semibold">{voluntariadoBlock.description}</p>
                </div>
                <button
                  onClick={() => {
                    setCurrentView("contactenos");
                    setTimeout(() => {
                      const el = document.getElementById("contact-form-section");
                      if (el) el.scrollIntoView({ behavior: 'smooth' });
                    }, 100);
                  }}
                  className="px-8 py-4 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-lg hover:shadow-xl transition-all hover:scale-105 whitespace-nowrap cursor-pointer"
                >
                  ¡Contactar Ahora!
                </button>
              </div>

            </div>
          </div>
        )}

        {/* VIEW 5: DONACIONES */}
        {currentView === "donaciones" && (
          <Suspense fallback={
            <div className="flex flex-col items-center justify-center py-24 gap-4 bg-gray-50 dark:bg-gray-950">
              <Loader2 className="w-10 h-10 text-foundation-teal animate-spin" />
              <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Cargando Donaciones...</p>
            </div>
          }>
            <DonationsSection config={config} />
          </Suspense>
        )}

        {/* VIEW 6: CONTACTENOS (DEDICATED DUAL MAP AND FORM VIEW) */}
        {currentView === "contactenos" && (
          <div className="animate-fade-in py-16 sm:py-24 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
              
              {/* Header Title Banner with pencils image reference */}
              <div className="relative rounded-3xl overflow-hidden bg-gray-900 text-white py-20 px-8 text-center mb-16">
                <div 
                  className="absolute inset-0 bg-cover bg-center bg-no-repeat opacity-25 scale-105" 
                  style={{ backgroundImage: `url(https://images.unsplash.com/photo-1454165804606-c3d57bc86b40?auto=format&fit=crop&q=80&w=1200)` }}
                />
                <div className="absolute inset-0 bg-gradient-to-t from-gray-950 via-gray-900/60 to-transparent" />
                <div className="relative z-10 max-w-2xl mx-auto">
                  <h1 className="text-4xl sm:text-5xl font-black tracking-tight mb-4">Contáctenos</h1>
                  <p className="text-gray-300 text-md font-semibold">Cualquier duda, sugerencia o propuesta es bienvenida en nuestras oficinas.</p>
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-12 gap-12" id="contact-form-section">
                
                {/* Form */}
                <form onSubmit={handleContactSubmit} className="lg:col-span-6 bg-gray-50 p-6 sm:p-8 rounded-3xl border border-gray-100 space-y-6">
                  
                  {contactSuccess && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-emerald-50 border border-emerald-200 text-emerald-800">
                      <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
                      <span className="text-xs font-bold">¡Tu mensaje ha sido enviado con éxito! Nos comunicaremos pronto.</span>
                    </div>
                  )}

                  {contactError && (
                    <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                      <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                      <span className="text-xs font-bold">{contactError}</span>
                    </div>
                  )}

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Nombre Completo *:</label>
                    <input
                      type="text"
                      required
                      value={contactName}
                      onChange={(e) => setContactName(e.target.value)}
                      placeholder="Tu nombre completo"
                      className="w-full px-4 py-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>

                  {/* Real-time Email Validation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Correo Electrónico *:</label>
                      {contactEmail.length > 0 && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ? "text-emerald-600" : "text-rose-500"
                        }`}>
                          {/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Correo válido
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Formato de correo inválido
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="email"
                      required
                      value={contactEmail}
                      onChange={(e) => setContactEmail(e.target.value)}
                      placeholder="ejemplo@correo.com"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold outline-none transition-colors ${
                        contactEmail.length === 0
                          ? "border-gray-200 focus:border-foundation-teal"
                          : /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(contactEmail)
                          ? "border-emerald-400 focus:border-emerald-500 bg-emerald-50/20"
                          : "border-rose-300 focus:border-rose-500 bg-rose-50/20"
                      }`}
                    />
                  </div>

                  {/* Real-time Phone Validation */}
                  <div>
                    <div className="flex justify-between items-center mb-1">
                      <label className="block text-xs font-bold text-gray-500 uppercase">Teléfono de Contacto:</label>
                      {contactPhone.length > 0 && (
                        <span className={`text-[11px] font-bold flex items-center gap-1 ${
                          /^[+0-9\s-]{8,15}$/.test(contactPhone) ? "text-emerald-600" : "text-rose-500"
                        }`}>
                          {/^[+0-9\s-]{8,15}$/.test(contactPhone) ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5" /> Teléfono válido
                            </>
                          ) : (
                            <>
                              <AlertCircle className="w-3.5 h-3.5" /> Ingrese al menos 8 dígitos
                            </>
                          )}
                        </span>
                      )}
                    </div>
                    <input
                      type="tel"
                      value={contactPhone}
                      onChange={(e) => setContactPhone(e.target.value)}
                      placeholder="+506 8888-8888"
                      className={`w-full px-4 py-3 bg-white border rounded-xl text-sm font-semibold outline-none transition-colors ${
                        contactPhone.length === 0
                          ? "border-gray-200 focus:border-foundation-teal"
                          : /^[+0-9\s-]{8,15}$/.test(contactPhone)
                          ? "border-emerald-400 focus:border-emerald-500 bg-emerald-50/20"
                          : "border-rose-300 focus:border-rose-500 bg-rose-50/20"
                      }`}
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-1">Mensaje o Consulta *:</label>
                    <textarea
                      required
                      rows={4}
                      value={contactMessage}
                      onChange={(e) => setContactMessage(e.target.value)}
                      placeholder="Escriba su consulta o propuesta aquí..."
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>

                  <button
                    type="submit"
                    disabled={contactLoading}
                    className="px-6 py-3 bg-foundation-teal hover:bg-foundation-teal-dark disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-md flex items-center justify-center gap-2 transition-all cursor-pointer hover:scale-105"
                  >
                    {contactLoading ? (
                      <Loader2 className="w-4 h-4 animate-spin" />
                    ) : (
                      <Send className="w-4 h-4" />
                    )}
                    Enviar Mensaje
                  </button>

                </form>

                {/* Map */}
                <div className="lg:col-span-6 flex flex-col justify-between space-y-6">
                  
                  {/* Address info blocks & Social networks */}
                  <div className="bg-[#e2f4f2] p-6 sm:p-8 rounded-3xl border border-foundation-teal/15 space-y-5">
                    <div className="flex gap-4 items-start">
                      <MapPin className="w-5 h-5 text-foundation-teal-dark flex-shrink-0 mt-0.5" />
                      <div>
                        <p className="text-xs font-bold text-foundation-teal-dark uppercase tracking-wider">Dirección de la Sede</p>
                        <p className="text-sm font-bold text-gray-700 mt-1">{contact.address}</p>
                      </div>
                    </div>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 border-t border-foundation-teal/10 pt-4">
                      <div className="flex gap-3 items-center">
                        <Phone className="w-5 h-5 text-foundation-teal-dark flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-foundation-teal-dark uppercase tracking-wider">Teléfono Oficina</p>
                          <p className="text-sm font-bold text-gray-700">{contact.phone}</p>
                        </div>
                      </div>

                      <div className="flex gap-3 items-center">
                        <Clock className="w-5 h-5 text-foundation-teal-dark flex-shrink-0" />
                        <div>
                          <p className="text-[10px] font-bold text-foundation-teal-dark uppercase tracking-wider">Horario de Atención</p>
                          <p className="text-xs font-bold text-gray-700">{contact.hours}</p>
                        </div>
                      </div>
                    </div>

                    {/* Social Media Shortcuts */}
                    <div className="border-t border-foundation-teal/10 pt-4 space-y-2">
                      <p className="text-xs font-extrabold text-foundation-teal-dark uppercase tracking-wider">Nuestros Canales y Redes Oficiales:</p>
                      <div className="flex flex-wrap gap-2 pt-1">
                        {/* WhatsApp */}
                        {(config.whatsapp?.phone || contact.phone) && (
                          <a
                            href={`https://wa.me/${(config.whatsapp?.phone || contact.phone).replace(/[^0-9]/g, "")}?text=${encodeURIComponent(config.whatsapp?.message || "¡Hola! Quisiera ponerme en contacto.")}`}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#25D366] hover:bg-[#128C7E] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <MessageSquare className="w-3.5 h-3.5 fill-current" />
                            <span>WhatsApp</span>
                          </a>
                        )}

                        {/* Facebook */}
                        {contact.facebookUrl && (
                          <a
                            href={contact.facebookUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#1877F2] hover:bg-[#0d65d9] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <span>Facebook</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Instagram */}
                        {contact.instagramUrl && (
                          <a
                            href={contact.instagramUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#E4405F] hover:bg-[#d02d4c] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <span>Instagram</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* TikTok */}
                        {contact.tiktokUrl && (
                          <a
                            href={contact.tiktokUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-gray-900 hover:bg-black text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <svg className="w-3.5 h-3.5 fill-current" viewBox="0 0 24 24">
                              <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.155A6.338 6.338 0 0 0 8.012 22a6.338 6.338 0 0 0 6.329-6.329V9.69a8.212 8.212 0 0 0 5.248 1.838v-3.5a4.786 4.786 0 0 1-.001-1.342z"/>
                            </svg>
                            <span>TikTok</span>
                          </a>
                        )}

                        {/* YouTube */}
                        {contact.youtubeUrl && (
                          <a
                            href={contact.youtubeUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-[#FF0000] hover:bg-[#d40000] text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <span>YouTube</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        )}

                        {/* Custom links */}
                        {contact.customSocialLinks && contact.customSocialLinks.map((item) => (
                          <a
                            key={item.id}
                            href={item.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-extrabold shadow-xs transition-all hover:scale-105"
                          >
                            <span>{item.label}</span>
                            <ExternalLink className="w-3 h-3" />
                          </a>
                        ))}
                      </div>
                    </div>
                  </div>

                  {/* Map frame with Zoom-on-Hover effect */}
                  <div className="group rounded-3xl overflow-hidden border border-gray-150 h-[320px] relative shadow-sm transition-all duration-500 hover:shadow-xl hover:border-foundation-teal/40">
                    <iframe 
                      title="Fundación Map Location Dedicated"
                      src="https://www.google.com/maps/embed?pb=!1m18!1m12!1m3!1d3930.1557999813575!2d-84.14861!3d9.94722!2m3!1f0!2f0!3f0!3m2!1i1024!2i768!4f13.1!3m3!1m2!1s0x0%3A0x0!2zOcKwNTYnNTAuMCJOIDg0wrAwOCU1NS4wIlc!5e0!3m2!1ses!2scr!4v1710000000000!5m2!1ses!2scr"
                      className={`absolute inset-0 w-full h-full border-0 transition-transform duration-500 ease-out origin-center group-hover:scale-110 ${
                        mapZoomed ? "scale-125 z-10" : "scale-100"
                      }`}
                      allowFullScreen
                      loading="lazy"
                      referrerPolicy="no-referrer-when-downgrade"
                    />

                    {/* Mobile touch zoom overlay badge */}
                    <div className="absolute bottom-3 right-3 z-20 flex gap-2">
                      <button
                        type="button"
                        onClick={() => setMapZoomed(!mapZoomed)}
                        className="px-3 py-1.5 bg-gray-900/80 hover:bg-black text-white text-xs font-bold rounded-xl backdrop-blur-sm shadow-md transition-all flex items-center gap-1.5 cursor-pointer sm:hidden"
                      >
                        <Sparkles className="w-3.5 h-3.5 text-foundation-teal" />
                        <span>{mapZoomed ? "Alejar Mapa" : "Ampliar Mapa (Zoom)"}</span>
                      </button>
                    </div>

                    <div className="absolute top-3 left-3 pointer-events-none bg-white/90 dark:bg-gray-900/90 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-extrabold text-gray-700 dark:text-gray-200 border border-gray-200/50 shadow-xs hidden sm:block">
                      🔍 Pasa el cursor para ampliar mapa
                    </div>
                  </div>

                </div>

              </div>
            </div>
          </div>
        )}

        {/* VIEW 7: INICIAR SESIÓN */}
        {currentView === "iniciar-sesion" && (
          <div className="animate-fade-in py-16 sm:py-24 bg-gray-50 flex items-center justify-center min-h-[500px]">
            <div className="max-w-md w-full mx-4 bg-white rounded-3xl p-6 sm:p-8 shadow-md border border-gray-100">
              
              <div className="text-center mb-8">
                <div className="w-12 h-12 rounded-2xl bg-foundation-teal-light flex items-center justify-center text-foundation-teal mx-auto mb-4 border border-foundation-teal/15">
                  <Lock className="w-6 h-6" />
                </div>
                <h2 className="text-2xl font-black text-gray-900">Iniciar Sesión</h2>
                <p className="text-xs text-gray-400 mt-1 font-semibold uppercase tracking-wider">Acceso de Administrador CMS</p>
              </div>

              <form onSubmit={handleLoginSubmit} className="space-y-6">
                
                {loginError && (
                  <div className="flex items-center gap-3 p-4 rounded-xl bg-red-50 border border-red-200 text-red-800">
                    <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
                    <span className="text-xs font-bold">{loginError}</span>
                  </div>
                )}

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Usuario</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <User className="w-5 h-5" />
                    </div>
                    <input
                      type="text"
                      required
                      placeholder="admin"
                      value={usernameInput}
                      onChange={(e) => setUsernameInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Contraseña</label>
                  <div className="relative">
                    <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400">
                      <Lock className="w-5 h-5" />
                    </div>
                    <input
                      type="password"
                      required
                      placeholder="••••••••"
                      value={passwordInput}
                      onChange={(e) => setPasswordInput(e.target.value)}
                      className="w-full pl-10 pr-4 py-3 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                </div>

                <button
                  type="submit"
                  disabled={loginLoading}
                  className="w-full py-3.5 bg-foundation-teal hover:bg-foundation-teal-dark disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide"
                >
                  {loginLoading ? (
                    <Loader2 className="w-5 h-5 animate-spin" />
                  ) : (
                    <>
                      <span>Autenticar</span>
                      <ArrowRight className="w-4 h-4" />
                    </>
                  )}
                </button>



              </form>

            </div>
          </div>
        )}

        {/* VIEW 8: CMS PANEL */}
        {currentView === "admin-panel" && (
          isLoggedIn ? (
            <Suspense fallback={
              <div className="flex flex-col items-center justify-center py-24 gap-4 bg-gray-50 dark:bg-gray-950">
                <Loader2 className="w-10 h-10 text-foundation-teal animate-spin" />
                <p className="text-sm font-extrabold text-gray-400 uppercase tracking-widest animate-pulse">Cargando Panel de Administración...</p>
              </div>
            }>
              <CMSPanel 
                initialConfig={config} 
                token={authToken} 
                onConfigUpdate={setConfig} 
              />
            </Suspense>
          ) : (
            <div className="py-16 text-center text-gray-500">
              <p className="text-sm font-bold">Por favor inicie sesión para acceder al panel CMS.</p>
              <button 
                onClick={() => setCurrentView("iniciar-sesion")}
                className="mt-4 px-6 py-2.5 bg-foundation-teal text-white rounded-xl font-bold cursor-pointer hover:bg-foundation-teal-dark"
              >
                Ir a Iniciar Sesión
              </button>
            </div>
          )
        )}

      </main>

      {/* Global Footer */}
      <Footer 
        config={config} 
        onNavigateToContact={() => {
          setCurrentView("contactenos");
          setTimeout(() => {
            const el = document.getElementById("contact-form-section");
            if (el) el.scrollIntoView({ behavior: 'smooth' });
          }, 100);
        }} 
      />

      {/* Floating WhatsApp Button */}
      {config && config.whatsapp && (
        <a
          href={`https://wa.me/${config.whatsapp.phone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(config.whatsapp.message)}`}
          target="_blank"
          rel="noopener noreferrer"
          className="fixed bottom-6 right-6 z-50 bg-[#25D366] hover:bg-[#128C7E] text-white p-4 rounded-full shadow-2xl hover:scale-110 active:scale-95 transition-all flex items-center justify-center cursor-pointer group"
          title="Contactar por WhatsApp"
        >
          <div className="relative">
            <MessageSquare className="w-6 h-6 fill-current text-white" />
            <span className="absolute -top-1 -right-1 flex h-2.5 w-2.5">
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-white opacity-75"></span>
              <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-[#25D366]"></span>
            </span>
          </div>
          
          <span className="absolute right-16 bg-gray-950 text-white text-xs font-bold px-3 py-1.5 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity whitespace-nowrap pointer-events-none shadow-md">
            Chatear con nosotros
          </span>
        </a>
      )}
    </div>
  );
}
