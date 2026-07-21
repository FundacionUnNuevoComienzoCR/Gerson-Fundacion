import React, { useState, useEffect } from "react";
import { 
  Save, 
  Trash2, 
  Plus, 
  MessageSquare, 
  LayoutDashboard, 
  FileText, 
  HeartHandshake, 
  Users, 
  Sparkles, 
  Loader2, 
  CheckCircle2, 
  AlertCircle,
  Image,
  Quote,
  Send,
  Mail,
  Upload,
  Eye,
  Phone,
  HelpCircle,
  X,
  Download,
  Globe,
  Megaphone,
  Building2,
  Share2,
  Instagram,
  Youtube,
  Twitter,
  Linkedin,
  MapPin,
  Clock
} from "lucide-react";
import { AppConfig, ContactMessage, BankAccount, Program, Founder, Testimonial, Sponsor, DonationGoal, BrandingConfig, WhatsAppConfig, FAQItem, SEOConfig, GlobalNoticeConfig } from "../types";
import { getDirectDriveImageUrl } from "../utils/drive";
import { compressImage } from "../utils/compressor";

interface CMSPanelProps {
  initialConfig: AppConfig;
  token: string;
  onConfigUpdate: (updatedConfig: AppConfig) => void;
}

interface NewsletterSubscriber {
  id: string;
  email: string;
  createdAt: string;
}

export default function CMSPanel({ initialConfig, token, onConfigUpdate }: CMSPanelProps) {
  // Local state for all fields
  const [activeTab, setActiveTab] = useState<"donations" | "home" | "about" | "programs" | "messages" | "testimonials" | "sponsors" | "newsletter" | "branding" | "faqs" | "reports" | "seo" | "globalNotice" | "gallery">("donations");
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Image compression options state
  const [compressBeforeUpload, setCompressBeforeUpload] = useState<boolean>(true);
  const [compressMaxWidth, setCompressMaxWidth] = useState<number>(1000);
  const [compressQuality, setCompressQuality] = useState<number>(0.8);

  // Donation logs filters state
  const [logSearch, setLogSearch] = useState("");
  const [logStatus, setLogStatus] = useState("all");
  const [logChannel, setLogChannel] = useState("all");
  const [logMinAmount, setLogMinAmount] = useState<string>("");
  const [logMaxAmount, setLogMaxAmount] = useState<string>("");

  // Donation confirmation reports
  const [reports, setReports] = useState<any[]>([]);
  const [reportsLoading, setReportsLoading] = useState(false);
  const [selectedVoucherUrl, setSelectedVoucherUrl] = useState<string | null>(null);

  // Sync state with initialConfig updates
  useEffect(() => {
    setConfig(initialConfig);
    // Fetch reports on mount too to update the badge count initially
    fetchDonationReports();
  }, [initialConfig]);

  // Load received contact messages or newsletter subscribers based on active tab
  useEffect(() => {
    if (activeTab === "messages") {
      fetchMessages();
    } else if (activeTab === "newsletter") {
      fetchNewsletterSubscribers();
    } else if (activeTab === "reports") {
      fetchDonationReports();
    }
  }, [activeTab]);

  const fetchNewsletterSubscribers = async () => {
    setSubscribersLoading(true);
    try {
      const res = await fetch("/api/newsletter/subscribers", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setSubscribers(data);
      }
    } catch (err) {
      console.error("Error loading newsletter subscribers:", err);
    } finally {
      setSubscribersLoading(false);
    }
  };

  const handleDeleteSubscriber = async (subId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este suscriptor del newsletter?")) return;
    try {
      const res = await fetch(`/api/newsletter/subscribers/${subId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setSubscribers(subscribers.filter(sub => sub.id !== subId));
      }
    } catch (err) {
      console.error("Error deleting newsletter subscriber:", err);
    }
  };

  // Image upload with preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner" | { type: "program"; index: number } | { type: "testimonial"; index: number } | { type: "sponsor"; index: number } | "hero") => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo de imagen válido.");
      return;
    }

    const reader = new FileReader();
    reader.onload = async () => {
      let base64 = reader.result as string;
      if (compressBeforeUpload) {
        try {
          base64 = await compressImage(base64, compressMaxWidth, compressQuality);
        } catch (err) {
          console.error("Error compressing image:", err);
        }
      }
      try {
        let filename = `upload_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "")}`;
        if (field === "logo") filename = `logo_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "")}`;
        else if (field === "banner") filename = `banner_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "")}`;

        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ filename, base64 })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          if (field === "logo") {
            setConfig(prev => ({
              ...prev,
              branding: { ...prev.branding, logoUrl: data.url }
            }));
          } else if (field === "banner") {
            setConfig(prev => ({
              ...prev,
              branding: { ...prev.branding, bannerUrl: data.url }
            }));
          } else if (field === "hero") {
            setConfig(prev => ({
              ...prev,
              hero: { ...prev.hero, imageUrl: data.url }
            }));
          } else if (typeof field === "object") {
            if (field.type === "program") {
              const updatedPrograms = [...config.programs];
              updatedPrograms[field.index] = { ...updatedPrograms[field.index], imageUrl: data.url };
              setConfig(prev => ({ ...prev, programs: updatedPrograms }));
            } else if (field.type === "testimonial") {
              if (config.testimonials) {
                const updatedTestimonials = [...config.testimonials];
                updatedTestimonials[field.index] = { ...updatedTestimonials[field.index], imageUrl: data.url };
                setConfig(prev => ({ ...prev, testimonials: updatedTestimonials }));
              }
            } else if (field.type === "sponsor") {
              const updatedSponsors = [...(config.sponsors || [])];
              updatedSponsors[field.index] = { ...updatedSponsors[field.index], logoUrl: data.url };
              setConfig(prev => ({ ...prev, sponsors: updatedSponsors }));
            }
          }
          alert("¡Imagen subida con éxito y vista previa generada!");
        } else {
          alert(data.error || "Ocurrió un error al subir la imagen.");
        }
      } catch (err) {
        console.error(err);
        alert("Error de red al subir la imagen.");
      }
    };
    reader.readAsDataURL(file);
  };

  // Sponsors management
  const handleSponsorChange = (index: number, field: keyof Sponsor, value: string) => {
    const updated = [...(config.sponsors || [])];
    updated[index] = { ...updated[index], [field]: value };
    setConfig({ ...config, sponsors: updated });
  };

  const handleAddSponsor = () => {
    const newSponsor: Sponsor = {
      id: "sp-" + Date.now(),
      name: "Nuevo Patrocinador",
      logoUrl: "",
      description: "Empresa o institución aliada a la Fundación",
      websiteUrl: ""
    };
    setConfig({
      ...config,
      sponsors: [...(config.sponsors || []), newSponsor]
    });
  };

  const handleRemoveSponsor = (index: number) => {
    const filtered = (config.sponsors || []).filter((_, idx) => idx !== index);
    setConfig({ ...config, sponsors: filtered });
  };

  // Testimonials management
  const handleTestimonialChange = (index: number, field: keyof Testimonial, value: string) => {
    if (!config.testimonials) return;
    const updated = [...config.testimonials];
    updated[index] = { ...updated[index], [field]: value } as Testimonial;
    setConfig({ ...config, testimonials: updated });
  };

  const handleAddTestimonial = () => {
    const newTestimonial: Testimonial = {
      id: "t-" + Date.now(),
      name: "Nuevo Colaborador/Beneficiario",
      role: "Colaborador",
      text: "Escriba aquí el testimonio...",
      imageUrl: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?auto=format&fit=crop&q=80&w=200"
    };
    setConfig({
      ...config,
      testimonials: [...(config.testimonials || []), newTestimonial]
    });
  };

  const handleRemoveTestimonial = (index: number) => {
    if (!config.testimonials) return;
    const filtered = config.testimonials.filter((_, idx) => idx !== index);
    setConfig({ ...config, testimonials: filtered });
  };

  // Donation goals management
  const handleDonationGoalChange = (field: keyof DonationGoal, value: any) => {
    setConfig({
      ...config,
      donationGoal: {
        ...(config.donationGoal || { monthlyGoal: 2500000, currentAmount: 1350000, currency: "CRC" }),
        [field]: value
      }
    });
  };

  // WhatsApp management
  const handleWhatsAppChange = (field: keyof WhatsAppConfig, value: string) => {
    setConfig({
      ...config,
      whatsapp: {
        ...(config.whatsapp || { phone: "50688888888", message: "" }),
        [field]: value
      }
    });
  };

  // Contact & Social Media management
  const handleContactChange = (field: string, value: any) => {
    setConfig({
      ...config,
      contact: {
        ...config.contact,
        [field]: value
      }
    });
  };

  const handleAddCustomSocialLink = () => {
    const newLink = {
      id: "social-" + Date.now(),
      label: "Nueva Red / Enlace",
      url: "https://"
    };
    const currentLinks = config.contact?.customSocialLinks || [];
    handleContactChange("customSocialLinks", [...currentLinks, newLink]);
  };

  const handleUpdateCustomSocialLink = (index: number, field: "label" | "url", value: string) => {
    const currentLinks = [...(config.contact?.customSocialLinks || [])];
    currentLinks[index] = { ...currentLinks[index], [field]: value };
    handleContactChange("customSocialLinks", currentLinks);
  };

  const handleRemoveCustomSocialLink = (index: number) => {
    const currentLinks = (config.contact?.customSocialLinks || []).filter((_, idx) => idx !== index);
    handleContactChange("customSocialLinks", currentLinks);
  };

  // FAQs management
  const handleFAQChange = (index: number, field: keyof FAQItem, value: string) => {
    if (!config.faqs) return;
    const updated = [...config.faqs];
    updated[index] = { ...updated[index], [field]: value } as FAQItem;
    setConfig({ ...config, faqs: updated });
  };

  const handleAddFAQ = () => {
    const newFAQ: FAQItem = {
      id: "faq-" + Date.now(),
      question: "¿Nueva pregunta?",
      answer: "Escriba aquí la respuesta...",
      category: "general"
    };
    setConfig({
      ...config,
      faqs: [...(config.faqs || []), newFAQ]
    });
  };

  const handleRemoveFAQ = (index: number) => {
    if (!config.faqs) return;
    const filtered = config.faqs.filter((_, idx) => idx !== index);
    setConfig({ ...config, faqs: filtered });
  };

  const fetchDonationReports = async () => {
    setReportsLoading(true);
    try {
      const res = await fetch("/api/donations", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setReports(data);
      }
    } catch (err) {
      console.error("Error loading donation reports:", err);
    } finally {
      setReportsLoading(false);
    }
  };

  const handleUpdateReportStatus = async (reportId: string, status: "approved" | "rejected" | "pending") => {
    try {
      const res = await fetch(`/api/donations/${reportId}/status`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify({ status })
      });
      if (res.ok) {
        setReports(prev => prev.map(rep => rep.id === reportId ? { ...rep, status } : rep));
        alert(`Reporte de donación marcado como: ${status === "approved" ? "APROBADO" : status === "rejected" ? "RECHAZADO" : "PENDIENTE"}`);
      } else {
        alert("Error al actualizar el estado de la donación.");
      }
    } catch (err) {
      console.error("Error updating report status:", err);
      alert("Error de red al actualizar el estado.");
    }
  };

  const fetchMessages = async () => {
    setMessagesLoading(true);
    try {
      const res = await fetch("/api/messages", {
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        const data = await res.json();
        setMessages(data);
      }
    } catch (err) {
      console.error("Error loading messages:", err);
    } finally {
      setMessagesLoading(false);
    }
  };

  const handleDeleteMessage = async (msgId: string) => {
    if (!confirm("¿Está seguro de que desea eliminar este mensaje?")) return;
    try {
      const res = await fetch(`/api/messages/${msgId}`, {
        method: "DELETE",
        headers: {
          "Authorization": `Bearer ${token}`
        }
      });
      if (res.ok) {
        setMessages(messages.filter(msg => msg.id !== msgId));
      }
    } catch (err) {
      console.error("Error deleting message:", err);
    }
  };

  // Generic config update saver
  const handleSaveConfig = async (customConfig?: AppConfig) => {
    setLoading(true);
    setStatusMsg(null);
    const configToSave = customConfig || config;
    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(configToSave)
      });
      const data = await res.json();
      if (res.ok && data.success) {
        setStatusMsg({ type: "success", text: "¡Configuración guardada correctamente en config.json!" });
        onConfigUpdate(configToSave);
      } else {
        setStatusMsg({ type: "error", text: data.error || "Ocurrió un error al guardar la configuración." });
      }
    } catch (err) {
      console.error("Error saving config:", err);
      setStatusMsg({ type: "error", text: "Error de red al conectar con el servidor." });
    } finally {
      setLoading(false);
      // Auto clear alert
      setTimeout(() => setStatusMsg(null), 5000);
    }
  };

  const handleDownloadBackup = () => {
    try {
      const dataStr = "data:text/json;charset=utf-8," + encodeURIComponent(JSON.stringify(config, null, 2));
      const downloadAnchor = document.createElement('a');
      downloadAnchor.setAttribute("href", dataStr);
      downloadAnchor.setAttribute("download", `config_backup_${new Date().toISOString().slice(0, 10)}.json`);
      document.body.appendChild(downloadAnchor);
      downloadAnchor.click();
      downloadAnchor.remove();
      alert("¡Respaldo de configuración generado y descargado con éxito!");
    } catch (err) {
      console.error(err);
      alert("Error al descargar el respaldo.");
    }
  };

  // Updates for nested structures
  const handleSINPEChange = (field: string, value: string) => {
    setConfig({
      ...config,
      sinpe: { ...config.sinpe, [field]: value }
    });
  };

  const handlePayPalChange = (field: string, value: any) => {
    setConfig({
      ...config,
      paypal: { ...config.paypal, [field]: value }
    });
  };

  const handleBankAccountChange = (index: number, field: keyof BankAccount, value: string) => {
    const updatedAccounts = [...config.bankAccounts];
    updatedAccounts[index] = { ...updatedAccounts[index], [field]: value };
    setConfig({ ...config, bankAccounts: updatedAccounts });
  };

  const handleAddBankAccount = () => {
    const newAccount: BankAccount = {
      bankName: "Nuevo Banco",
      currency: "Colones (CRC)",
      iban: "CR...",
      holder: config.sinpe.holder,
      idType: "Cédula Jurídica",
      idNumber: config.sinpe.idNumber
    };
    setConfig({
      ...config,
      bankAccounts: [...config.bankAccounts, newAccount]
    });
  };

  const handleRemoveBankAccount = (index: number) => {
    const filtered = config.bankAccounts.filter((_, idx) => idx !== index);
    setConfig({ ...config, bankAccounts: filtered });
  };

  const handleHeroChange = (field: string, value: string) => {
    setConfig({
      ...config,
      hero: { ...config.hero, [field]: value }
    });
  };

  const handleSectionChange = (section: "mision" | "vision" | "objetivo", field: string, value: string) => {
    setConfig({
      ...config,
      [section]: { ...config[section], [field]: value }
    });
  };

  const handleAboutChange = (field: string, value: string) => {
    setConfig({
      ...config,
      about: { ...config.about, [field]: value }
    });
  };

  const handleProgramChange = (index: number, field: keyof Program, value: string) => {
    const updatedPrograms = [...config.programs];
    updatedPrograms[index] = { ...updatedPrograms[index], [field]: value } as Program;
    setConfig({ ...config, programs: updatedPrograms });
  };

  const filteredReports = (reports || []).filter(r => {
    // Search
    const searchLower = logSearch.toLowerCase();
    const nameMatch = r.name?.toLowerCase().includes(searchLower) || false;
    const emailMatch = r.email?.toLowerCase().includes(searchLower) || false;
    const refMatch = r.reference?.toLowerCase().includes(searchLower) || false;
    const textMatch = !logSearch || nameMatch || emailMatch || refMatch;

    // Status
    const statusMatch = logStatus === "all" || r.status === logStatus;

    // Channel
    const channelMatch = logChannel === "all" || r.channel === logChannel;

    // Amount
    const minVal = logMinAmount ? parseFloat(logMinAmount) : null;
    const maxVal = logMaxAmount ? parseFloat(logMaxAmount) : null;
    const amountMatch = (minVal === null || r.amount >= minVal) && (maxVal === null || r.amount <= maxVal);

    return textMatch && statusMatch && channelMatch && amountMatch;
  });

  const handleGalleryUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    if (!file.type.startsWith("image/")) {
      alert("Por favor, seleccione un archivo de imagen válido.");
      return;
    }
    const reader = new FileReader();
    reader.onload = async () => {
      let base64 = reader.result as string;
      if (compressBeforeUpload) {
        try {
          base64 = await compressImage(base64, compressMaxWidth, compressQuality);
        } catch (err) {
          console.error("Error compressing gallery image:", err);
        }
      }
      try {
        const filename = `gallery_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "")}`;
        const res = await fetch("/api/upload", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Authorization": `Bearer ${token}`
          },
          body: JSON.stringify({ filename, base64 })
        });
        const data = await res.json();
        if (res.ok && data.success) {
          setConfig(prev => ({
            ...prev,
            gallery: [...(prev.gallery || []), data.url]
          }));
          alert("¡Foto agregada a la galería con éxito!");
        } else {
          alert(data.error || "Ocurrió un error al subir la imagen.");
        }
      } catch (err) {
        console.error(err);
        alert("Error de red al conectar con el servidor.");
      }
    };
    reader.readAsDataURL(file);
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-10 sm:py-16 animate-fade-in">
      
      {/* Title */}
      <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-10 border-b border-gray-100 pb-6">
        <div>
          <h1 className="text-3xl font-black text-gray-900 flex items-center gap-2">
            <LayoutDashboard className="w-8 h-8 text-foundation-teal" />
            Panel de Administración CMS
          </h1>
          <p className="text-gray-500 text-sm mt-1">
            Modifica visualmente los contenidos de la página pública y las cuentas de donativos. Los cambios se guardan directamente en <code className="font-mono text-xs bg-gray-100 px-1 py-0.5 text-foundation-teal rounded">config.json</code>.
          </p>
        </div>
        <button
          onClick={() => handleSaveConfig()}
          disabled={loading}
          className="flex items-center justify-center gap-2 px-6 py-3 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-md disabled:bg-gray-400 transition-all cursor-pointer"
        >
          {loading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <Save className="w-5 h-5" />
          )}
          Guardar Cambios
        </button>
      </div>

      {/* Save Status Notification */}
      {statusMsg && (
        <div className={`flex items-center gap-3 p-4 rounded-xl mb-8 border ${
          statusMsg.type === "success" 
            ? "bg-emerald-50 border-emerald-200 text-emerald-800" 
            : "bg-red-50 border-red-200 text-red-800"
        }`}>
          {statusMsg.type === "success" ? (
            <CheckCircle2 className="w-5 h-5 text-emerald-500 flex-shrink-0" />
          ) : (
            <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0" />
          )}
          <span className="text-sm font-bold">{statusMsg.text}</span>
        </div>
      )}

      {/* Tabs Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
        
        {/* Navigation Sidebar Tabs */}
        <div className="lg:col-span-1 space-y-4">
          <div className="space-y-1.5 bg-gray-50/50 p-2 rounded-2xl border border-gray-150/60">
            {[
              { id: "donations", label: "Gestionar Donaciones", icon: HeartHandshake },
              { id: "reports", label: "Verificaciones de SINPE/Banco", icon: CheckCircle2, badge: reports.filter(r => r.status === "pending").length || undefined },
              { id: "home", label: "Sección Inicio (Hero/Pilares)", icon: Sparkles },
              { id: "about", label: "Sobre Nosotros", icon: Users },
              { id: "programs", label: "Programas y Módulos", icon: FileText },
              { id: "testimonials", label: "Testimonios", icon: Quote },
              { id: "sponsors", label: "Patrocinadores", icon: Building2, badge: config.sponsors?.length || undefined },
              { id: "gallery", label: "Galería de Fotos", icon: Image },
              { id: "globalNotice", label: "Anuncio Banner Global", icon: Megaphone },
              { id: "seo", label: "SEO y Metatags", icon: Globe },
              { id: "faqs", label: "Preguntas Frecuentes (FAQ)", icon: HelpCircle },
              { id: "branding", label: "Contacto, Redes y Branding", icon: Share2 },
              { id: "newsletter", label: "Suscriptores Newsletter", icon: Mail, badge: subscribers.length || undefined },
              { id: "messages", label: "Mensajes de Contacto", icon: MessageSquare, badge: messages.length || undefined },
            ].map((tab) => {
              const Icon = tab.icon;
              const isActive = activeTab === tab.id;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id as any)}
                  className={`w-full flex items-center justify-between px-3 py-2.5 rounded-xl font-bold text-[13px] transition-all text-left cursor-pointer ${
                    isActive
                      ? "bg-foundation-teal text-white shadow-md shadow-foundation-teal/10"
                      : "bg-white text-gray-600 hover:bg-gray-50 hover:text-foundation-teal border border-gray-150/40"
                  }`}
                >
                  <div className="flex items-center gap-2.5">
                    <Icon className="w-4 h-4 flex-shrink-0" />
                    <span>{tab.label}</span>
                  </div>
                  {tab.badge && (
                    <span className={`text-[9px] px-1.5 py-0.5 rounded-full font-black ${
                      isActive ? "bg-white text-foundation-teal" : "bg-foundation-red text-white"
                    }`}>
                      {tab.badge}
                    </span>
                  )}
                </button>
              );
            })}
          </div>

          <div className="pt-1">
            <button
              onClick={handleDownloadBackup}
              type="button"
              className="w-full flex items-center justify-center gap-2 px-4 py-3 bg-white hover:bg-gray-50 border border-gray-200 text-gray-700 hover:text-gray-900 rounded-xl font-extrabold text-xs transition-all cursor-pointer shadow-xs"
            >
              <Download className="w-4 h-4 text-foundation-teal" />
              <span>Respaldar config.json</span>
            </button>
          </div>
        </div>

        {/* CMS Tab Body */}
        <div className="lg:col-span-3 bg-white rounded-3xl p-6 sm:p-8 border border-gray-100 shadow-sm">
          
          {/* TAB 1: DONATIONS */}
          {activeTab === "donations" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Configuración de Pasarela de Donaciones</h2>
                <p className="text-xs text-gray-400 mt-1">Los cambios aquí se verán reflejados en tiempo real en la página pública de donaciones.</p>
              </div>

              {/* SINPE MÓVIL SECTION */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foundation-teal" />
                  SINPE Móvil (Costa Rica)
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Número de Teléfono</label>
                    <input
                      type="text"
                      value={config.sinpe.phone}
                      onChange={(e) => handleSINPEChange("phone", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Titular de la Cuenta</label>
                    <input
                      type="text"
                      value={config.sinpe.holder}
                      onChange={(e) => handleSINPEChange("holder", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cédula Física o Jurídica</label>
                    <input
                      type="text"
                      value={config.sinpe.idNumber}
                      onChange={(e) => handleSINPEChange("idNumber", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Instrucciones al Donante</label>
                    <input
                      type="text"
                      value={config.sinpe.instructions}
                      onChange={(e) => handleSINPEChange("instructions", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                </div>
              </div>

              {/* PAYPAL SECTION */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-blue-600 flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-blue-600" />
                  PayPal
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo de PayPal de la Fundación</label>
                    <input
                      type="email"
                      value={config.paypal.email}
                      onChange={(e) => handlePayPalChange("email", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moneda PayPal</label>
                    <select
                      value={config.paypal.currency}
                      onChange={(e) => handlePayPalChange("currency", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                    >
                      <option value="USD">Dólares (USD)</option>
                      <option value="EUR">Euros (EUR)</option>
                      <option value="CRC">Colones (CRC)</option>
                    </select>
                  </div>
                </div>
              </div>

              {/* BANK ACCOUNTS SECTION */}
              <div className="space-y-4">
                <div className="flex justify-between items-center border-b border-gray-100 pb-2">
                  <h3 className="text-base font-bold text-foundation-orange flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-foundation-orange" />
                    Cuentas Bancarias e IBAN
                  </h3>
                  <button
                    onClick={handleAddBankAccount}
                    className="flex items-center gap-1 text-xs bg-foundation-orange-light text-foundation-orange-dark hover:bg-foundation-orange hover:text-white px-3 py-1.5 rounded-lg font-bold transition-all cursor-pointer"
                  >
                    <Plus className="w-3.5 h-3.5" />
                    Añadir Cuenta
                  </button>
                </div>

                <div className="space-y-6">
                  {config.bankAccounts.map((account, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative">
                      <button
                        onClick={() => handleRemoveBankAccount(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-foundation-red p-1 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar Cuenta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Banco</label>
                          <input
                            type="text"
                            value={account.bankName}
                            onChange={(e) => handleBankAccountChange(index, "bankName", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moneda</label>
                          <input
                            type="text"
                            value={account.currency}
                            onChange={(e) => handleBankAccountChange(index, "currency", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Cuenta IBAN</label>
                          <input
                            type="text"
                            value={account.iban}
                            onChange={(e) => handleBankAccountChange(index, "iban", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                      </div>

                      <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pr-10">
                        <div className="sm:col-span-1">
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Tipo Identificación</label>
                          <input
                            type="text"
                            value={account.idType}
                            onChange={(e) => handleBankAccountChange(index, "idType", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Número Cédula</label>
                          <input
                            type="text"
                            value={account.idNumber}
                            onChange={(e) => handleBankAccountChange(index, "idNumber", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Razón Social</label>
                          <input
                            type="text"
                            value={account.holder}
                            onChange={(e) => handleBankAccountChange(index, "holder", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* METAS MENSUALES DE RECAUDACIÓN (BARRA DE PROGRESO) */}
              <div className="space-y-4 pt-6 border-t border-gray-150">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-1.5 border-b border-gray-100 pb-2">
                  <span className="w-1.5 h-1.5 rounded-full bg-foundation-teal" />
                  Meta Mensual de Recaudación (Barra de Progreso)
                </h3>
                <p className="text-xs text-gray-400">
                  Defina la meta monetaria del mes y lo recaudado hasta el momento para alimentar la barra de progreso en la sección de donaciones pública.
                </p>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Meta Mensual de Donativos</label>
                    <input
                      type="number"
                      value={config.donationGoal?.monthlyGoal || 2500000}
                      onChange={(e) => handleDonationGoalChange("monthlyGoal", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Monto Recaudado Actual</label>
                    <input
                      type="number"
                      value={config.donationGoal?.currentAmount || 1350000}
                      onChange={(e) => handleDonationGoalChange("currentAmount", parseFloat(e.target.value) || 0)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Moneda de Visualización</label>
                    <select
                      value={config.donationGoal?.currency || "CRC"}
                      onChange={(e) => handleDonationGoalChange("currency", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    >
                      <option value="CRC">Colones (CRC - ¢)</option>
                      <option value="USD">Dólares (USD - $)</option>
                    </select>
                  </div>
                </div>

                {/* Interactive visual bar inside CMS */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-150 space-y-2 mt-2">
                  <div className="flex justify-between items-center text-xs font-bold text-gray-600">
                    <span>Vista Previa en Tiempo Real:</span>
                    <span className="text-foundation-teal font-extrabold">
                      {Math.min(Math.round(((config.donationGoal?.currentAmount || 1350000) / (config.donationGoal?.monthlyGoal || 2500000)) * 100), 100)}% Completado
                    </span>
                  </div>
                  <div className="w-full h-3 bg-gray-200 rounded-full overflow-hidden">
                    <div 
                      className="h-full bg-foundation-teal rounded-full transition-all duration-300"
                      style={{ width: `${Math.min(((config.donationGoal?.currentAmount || 1350000) / (config.donationGoal?.monthlyGoal || 2500000)) * 100, 100)}%` }}
                    />
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB: REPORTS (DONATIONS VERIFICATION) */}
          {activeTab === "reports" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 dark:border-gray-800 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Verificaciones de SINPE y Transferencias</h2>
                  <p className="text-xs text-gray-400 mt-1">Verifica los comprobantes y estados de las donaciones reportadas por los donantes.</p>
                </div>
                <button
                  onClick={fetchDonationReports}
                  disabled={reportsLoading}
                  className="px-4 py-2 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-xl flex items-center gap-1.5 cursor-pointer transition-all self-start sm:self-auto"
                >
                  {reportsLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin text-foundation-teal" /> : null}
                  Actualizar Lista
                </button>
              </div>

              {reportsLoading ? (
                <div className="py-20 text-center text-gray-400 space-y-3">
                  <Loader2 className="w-10 h-10 animate-spin text-foundation-teal mx-auto" />
                  <p className="text-sm font-semibold">Cargando reportes de donación...</p>
                </div>
              ) : reports.length === 0 ? (
                <div className="py-20 text-center text-gray-400">
                  <HeartHandshake className="w-12 h-12 text-gray-300 mx-auto mb-3" />
                  <p className="text-sm font-semibold">No se han registrado reportes de donaciones aún.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {reports.map((report) => (
                    <div 
                      key={report.id} 
                      className={`p-5 sm:p-6 rounded-2xl border transition-all ${
                        report.status === "pending"
                          ? "bg-amber-50/50 border-amber-200"
                          : report.status === "approved"
                          ? "bg-emerald-50/40 border-emerald-200"
                          : "bg-red-50/40 border-red-200"
                      }`}
                    >
                      <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-4">
                        <div className="space-y-1.5">
                          <div className="flex items-center gap-2 flex-wrap">
                            <span className="text-sm font-black text-gray-900">{report.name}</span>
                            <span className={`px-2.5 py-0.5 rounded-full text-[10px] font-black uppercase tracking-wider ${
                              report.status === "pending"
                                ? "bg-amber-100 text-amber-800"
                                : report.status === "approved"
                                ? "bg-emerald-100 text-emerald-800"
                                : "bg-red-100 text-red-800"
                            }`}>
                              {report.status === "pending" ? "Pendiente" : report.status === "approved" ? "Aprobado" : "Rechazado"}
                            </span>
                            <span className="text-[10px] font-bold text-gray-400">
                              {new Date(report.createdAt).toLocaleString()}
                            </span>
                          </div>

                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-1 text-xs font-semibold text-gray-500">
                            <div>Correo: <span className="text-gray-700 font-bold">{report.email}</span></div>
                            <div>Teléfono: <span className="text-gray-700 font-bold">{report.phone || "No indicado"}</span></div>
                            <div>Canal: <span className="text-gray-700 font-bold uppercase">{report.channel === "sinpe" ? "SINPE Móvil" : report.channel}</span></div>
                            <div>Monto: <span className="text-foundation-teal font-extrabold">{report.channel === "banco_bac" ? "$" : "¢"}{report.amount}</span></div>
                            {report.reference && (
                              <div className="sm:col-span-2">Referencia / Comprobante: <span className="text-gray-700 font-extrabold">{report.reference}</span></div>
                            )}
                          </div>
                        </div>

                        {/* Actions */}
                        <div className="flex flex-row sm:flex-col gap-2 self-end sm:self-start">
                          {report.status === "pending" && (
                            <>
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, "approved")}
                                className="px-3 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                Aprobar Donativo
                              </button>
                              <button
                                onClick={() => handleUpdateReportStatus(report.id, "rejected")}
                                className="px-3 py-1.5 bg-red-500 hover:bg-red-600 text-white text-xs font-extrabold rounded-lg shadow-sm transition-all cursor-pointer"
                              >
                                Rechazar
                              </button>
                            </>
                          )}
                          {report.status !== "pending" && (
                            <button
                              onClick={() => handleUpdateReportStatus(report.id, "pending")}
                              className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 text-xs font-bold rounded-lg transition-all cursor-pointer"
                            >
                              Revertir a Pendiente
                            </button>
                          )}
                        </div>
                      </div>

                      {/* Receipt/Voucher Image Viewer */}
                      {report.voucherImage && (
                        <div className="mt-4 pt-4 border-t border-gray-100 dark:border-gray-800 flex items-center gap-3">
                          <div className="relative w-16 h-16 rounded-lg overflow-hidden border border-gray-200 flex-shrink-0">
                            <img src={report.voucherImage} alt="Voucher" className="w-full h-full object-cover" />
                          </div>
                          <div>
                            <p className="text-xs font-bold text-gray-800 font-sans">Comprobante de Pago Adjunto</p>
                            <p className="text-[10px] text-gray-400">Suministrado por el donante para verificación de fondos.</p>
                            <button
                              type="button"
                              onClick={() => setSelectedVoucherUrl(report.voucherImage)}
                              className="mt-1 flex items-center gap-1 text-[11px] font-bold text-foundation-teal hover:underline cursor-pointer"
                            >
                              <Eye className="w-3.5 h-3.5" />
                              Ver Comprobante Completo
                            </button>
                          </div>
                        </div>
                      )}
                    </div>
                  ))}
                </div>
              )}

              {/* Fullscreen Image Modal */}
              {selectedVoucherUrl && (
                <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4 bg-gray-950/80 backdrop-blur-sm">
                  <div className="relative max-w-3xl w-full bg-white dark:bg-gray-900 rounded-3xl p-4 sm:p-6 shadow-2xl border dark:border-gray-800">
                    <button
                      onClick={() => setSelectedVoucherUrl(null)}
                      className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-250 cursor-pointer p-1.5 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
                    >
                      <X className="w-6 h-6" />
                    </button>
                    <h3 className="text-lg font-bold text-gray-900 dark:text-white mb-4">Comprobante de Donativo</h3>
                    <div className="flex justify-center bg-gray-50 dark:bg-gray-950 rounded-2xl overflow-hidden max-h-[70vh] border border-gray-100 dark:border-gray-850 p-2">
                      <img src={selectedVoucherUrl} alt="Voucher Fullscreen" className="max-h-full object-contain rounded-xl" />
                    </div>
                    <button
                      onClick={() => setSelectedVoucherUrl(null)}
                      className="mt-6 w-full py-3 bg-foundation-teal text-white font-extrabold rounded-xl text-xs shadow-md cursor-pointer"
                    >
                      Cerrar Vista
                    </button>
                  </div>
                </div>
              )}

              {/* HISTORIAL Y FILTRADO DE INTENTOS DE DONACIÓN */}
              <div className="space-y-6 pt-10 border-t-2 border-dashed border-gray-150">
                <div>
                  <h3 className="text-lg font-bold text-gray-900 flex items-center gap-2">
                    <HeartHandshake className="w-5 h-5 text-foundation-teal" />
                    Historial de Intentos y Montos de Donaciones
                  </h3>
                  <p className="text-xs text-gray-400 mt-1">
                    Buscador y filtros avanzados de todos los intentos de donación con opción de exportar reportes en CSV.
                  </p>
                </div>

                {/* Filter Controls Grid */}
                <div className="bg-gray-50/70 p-5 rounded-2xl border border-gray-150 grid grid-cols-1 md:grid-cols-5 gap-4">
                  {/* Search */}
                  <div className="md:col-span-2">
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Búsqueda (Nombre / Correo / Referencia)</label>
                    <input
                      type="text"
                      value={logSearch}
                      onChange={(e) => setLogSearch(e.target.value)}
                      placeholder="Ej: Juan Pérez o CR001..."
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:border-foundation-teal"
                    />
                  </div>

                  {/* Status */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Estado</label>
                    <select
                      value={logStatus}
                      onChange={(e) => setLogStatus(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:border-foundation-teal"
                    >
                      <option value="all">Todos los Estados</option>
                      <option value="pending">Pendientes</option>
                      <option value="approved">Aprobados</option>
                      <option value="rejected">Rechazados</option>
                    </select>
                  </div>

                  {/* Channel */}
                  <div>
                    <label className="block text-[10px] font-black text-gray-400 uppercase mb-1.5">Canal / Medio</label>
                    <select
                      value={logChannel}
                      onChange={(e) => setLogChannel(e.target.value)}
                      className="w-full px-3.5 py-2 rounded-xl border border-gray-200 text-xs font-semibold outline-none bg-white focus:border-foundation-teal"
                    >
                      <option value="all">Todos los Medios</option>
                      <option value="sinpe">SINPE Móvil</option>
                      <option value="banco_bac">BAC (Dólares)</option>
                      <option value="banco_bcr">BCR (Colones)</option>
                    </select>
                  </div>

                  {/* Actions / Export / Clear */}
                  <div className="flex items-end gap-2">
                    <button
                      type="button"
                      onClick={() => {
                        setLogSearch("");
                        setLogStatus("all");
                        setLogChannel("all");
                        setLogMinAmount("");
                        setLogMaxAmount("");
                      }}
                      className="flex-1 py-2 border border-gray-200 bg-white hover:bg-gray-50 text-gray-500 hover:text-gray-700 text-xs font-bold rounded-xl transition-colors cursor-pointer"
                    >
                      Limpiar
                    </button>
                    <button
                      type="button"
                      onClick={() => {
                        // Export to CSV
                        const headers = ["Fecha", "Nombre", "Correo", "Telefono", "Canal", "Monto", "Referencia", "Estado"];
                        const rows = filteredReports.map(r => [
                          new Date(r.createdAt).toLocaleString(),
                          r.name,
                          r.email,
                          r.phone || "",
                          r.channel,
                          r.amount.toString(),
                          r.reference || "",
                          r.status
                        ]);
                        const csvContent = "data:text/csv;charset=utf-8," 
                          + [headers.join(","), ...rows.map(e => e.map(val => `"${val.replace(/"/g, '""')}"`).join(","))].join("\n");
                        const encodedUri = encodeURI(csvContent);
                        const link = document.createElement("a");
                        link.setAttribute("href", encodedUri);
                        link.setAttribute("download", `reporte_donaciones_${new Date().toISOString().slice(0,10)}.csv`);
                        document.body.appendChild(link);
                        link.click();
                        link.remove();
                      }}
                      className="flex-1 py-2 bg-foundation-teal text-white hover:bg-foundation-teal-dark text-xs font-bold rounded-xl transition-colors cursor-pointer text-center"
                    >
                      Exportar CSV
                    </button>
                  </div>
                </div>

                {/* Min/Max Amount Row */}
                <div className="bg-gray-50/50 p-4 rounded-xl border border-gray-150 grid grid-cols-1 sm:grid-cols-4 gap-4 items-center">
                  <div className="text-xs font-black text-gray-400 uppercase sm:col-span-1">Rango de Monto:</div>
                  <div className="sm:col-span-3 grid grid-cols-2 gap-4">
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Mín:</span>
                      <input
                        type="number"
                        placeholder="Ej: 5000"
                        value={logMinAmount}
                        onChange={(e) => setLogMinAmount(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-foundation-teal bg-white"
                      />
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-xs font-bold text-gray-400">Máx:</span>
                      <input
                        type="number"
                        placeholder="Ej: 50000"
                        value={logMaxAmount}
                        onChange={(e) => setLogMaxAmount(e.target.value)}
                        className="w-full px-3 py-1.5 rounded-lg border border-gray-200 text-xs outline-none focus:border-foundation-teal bg-white"
                      />
                    </div>
                  </div>
                </div>

                {/* Donation Log Table */}
                {filteredReports.length === 0 ? (
                  <div className="text-center py-10 bg-white border border-gray-150 rounded-2xl text-gray-400">
                    <AlertCircle className="w-8 h-8 mx-auto mb-2 stroke-1 text-gray-300" />
                    <p className="text-xs font-bold uppercase tracking-wider">No se encontraron donaciones con los filtros aplicados.</p>
                  </div>
                ) : (
                  <div className="bg-white border border-gray-150 rounded-2xl overflow-hidden shadow-xs">
                    <div className="overflow-x-auto">
                      <table className="w-full text-left border-collapse text-xs">
                        <thead>
                          <tr className="bg-gray-50 border-b border-gray-150 font-bold text-gray-400 uppercase tracking-wider">
                            <th className="px-4 py-3">Fecha</th>
                            <th className="px-4 py-3">Donante</th>
                            <th className="px-4 py-3">Canal</th>
                            <th className="px-4 py-3">Monto</th>
                            <th className="px-4 py-3">Referencia</th>
                            <th className="px-4 py-3">Estado</th>
                            <th className="px-4 py-3 text-right">Comprobante</th>
                          </tr>
                        </thead>
                        <tbody className="divide-y divide-gray-100 font-semibold text-gray-700">
                          {filteredReports.map((report) => (
                            <tr key={report.id} className="hover:bg-gray-50/40">
                              <td className="px-4 py-3 text-gray-400 whitespace-nowrap">
                                {new Date(report.createdAt).toLocaleDateString()} {new Date(report.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                              </td>
                              <td className="px-4 py-3">
                                <div className="font-bold text-gray-900">{report.name}</div>
                                <div className="text-[10px] text-gray-400">{report.email}</div>
                              </td>
                              <td className="px-4 py-3 uppercase text-gray-500 font-black">
                                {report.channel === "sinpe" ? "SINPE" : report.channel === "banco_bac" ? "BAC $" : "BCR ¢"}
                              </td>
                              <td className="px-4 py-3 font-extrabold text-foundation-teal">
                                {report.channel === "banco_bac" ? "$" : "¢"}{report.amount.toLocaleString()}
                              </td>
                              <td className="px-4 py-3 font-mono text-[11px] text-gray-500">{report.reference || "-"}</td>
                              <td className="px-4 py-3">
                                <span className={`px-2 py-0.5 rounded-full text-[9px] font-black uppercase tracking-wider ${
                                  report.status === "pending"
                                    ? "bg-amber-100 text-amber-800"
                                    : report.status === "approved"
                                    ? "bg-emerald-100 text-emerald-800"
                                    : "bg-red-100 text-red-800"
                                }`}>
                                  {report.status === "pending" ? "Pendiente" : report.status === "approved" ? "Aprobado" : "Rechazado"}
                                </span>
                              </td>
                              <td className="px-4 py-3 text-right">
                                {report.voucherImage ? (
                                  <button
                                    onClick={() => setSelectedVoucherUrl(report.voucherImage)}
                                    className="px-2 py-1 bg-gray-100 hover:bg-foundation-teal hover:text-white rounded text-[10px] font-bold transition-colors cursor-pointer"
                                  >
                                    Ver
                                  </button>
                                ) : (
                                  <span className="text-[10px] text-gray-300 font-medium">Ninguno</span>
                                )}
                              </td>
                            </tr>
                          ))}
                        </tbody>
                      </table>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB 2: SECCIÓN INICIO */}
          {activeTab === "home" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Sección Inicio (Hero y Pilares)</h2>
                <p className="text-xs text-gray-400 mt-1">Modifica el texto principal de bienvenida y los tres pilares institucionales de Misión, Visión y Objetivo.</p>
              </div>

              {/* HERO SECTION */}
              <div className="space-y-4">
                <h3 className="text-base font-bold text-foundation-teal border-b border-gray-100 pb-2">Sección Principal (Hero)</h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título de Bienvenida</label>
                    <input
                      type="text"
                      value={config.hero.title}
                      onChange={(e) => handleHeroChange("title", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Texto del Botón CTA</label>
                    <input
                      type="text"
                      value={config.hero.ctaText}
                      onChange={(e) => handleHeroChange("ctaText", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtítulo Hero</label>
                  <input
                    type="text"
                    value={config.hero.subtitle}
                    onChange={(e) => handleHeroChange("subtitle", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                  />
                </div>
                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL Imagen de Fondo Hero</label>
                  <input
                    type="text"
                    value={config.hero.imageUrl}
                    onChange={(e) => handleHeroChange("imageUrl", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block font-medium">Soporta enlaces de compartir de Google Drive de manera automática.</span>
                </div>
              </div>

              {/* THREE PILARS */}
              <div className="space-y-6">
                <h3 className="text-base font-bold text-foundation-teal border-b border-gray-100 pb-2">Pilares Organizacionales</h3>
                
                {/* MISION */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Pilar: Misión</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={config.mision.title}
                      onChange={(e) => handleSectionChange("mision", "title", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                    />
                    <textarea
                      value={config.mision.description}
                      onChange={(e) => handleSectionChange("mision", "description", e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* VISION */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Pilar: Visión</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={config.vision.title}
                      onChange={(e) => handleSectionChange("vision", "title", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                    />
                    <textarea
                      value={config.vision.description}
                      onChange={(e) => handleSectionChange("vision", "description", e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

                {/* OBJETIVO */}
                <div className="p-4 bg-gray-50 rounded-2xl border border-gray-100">
                  <h4 className="text-sm font-bold text-gray-800 mb-2">Pilar: Objetivo</h4>
                  <div className="space-y-3">
                    <input
                      type="text"
                      value={config.objetivo.title}
                      onChange={(e) => handleSectionChange("objetivo", "title", e.target.value)}
                      className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-sm font-bold"
                    />
                    <textarea
                      value={config.objetivo.description}
                      onChange={(e) => handleSectionChange("objetivo", "description", e.target.value)}
                      rows={2}
                      className="w-full p-3 bg-white border border-gray-200 rounded-lg text-sm font-semibold"
                    />
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 3: SOBRE NOSOTROS */}
          {activeTab === "about" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Sección: Sobre Nosotros</h2>
                <p className="text-xs text-gray-400 mt-1">Edita la descripción general, historia jurídica de la fundación y la imagen institucional.</p>
              </div>

              <div className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título ¿Quiénes Somos?</label>
                    <input
                      type="text"
                      value={config.about.whoWeAreTitle}
                      onChange={(e) => handleAboutChange("whoWeAreTitle", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Subtítulo Institucional</label>
                    <input
                      type="text"
                      value={config.about.whoWeAreSub}
                      onChange={(e) => handleAboutChange("whoWeAreSub", e.target.value)}
                      className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                    />
                  </div>
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción Corta Principal</label>
                  <textarea
                    value={config.about.whoWeAreText}
                    onChange={(e) => handleAboutChange("whoWeAreText", e.target.value)}
                    rows={3}
                    className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                  />
                </div>

                <div>
                  <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL Imagen Principal</label>
                  <input
                    type="text"
                    value={config.about.whoWeAreImage}
                    onChange={(e) => handleAboutChange("whoWeAreImage", e.target.value)}
                    className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal font-mono"
                  />
                  <span className="text-[10px] text-gray-400 mt-1 block font-medium">Soporta enlaces de compartir de Google Drive de manera automática.</span>
                </div>

                <div className="border-t border-gray-100 pt-6 mt-6">
                  <h3 className="text-base font-bold text-gray-800 mb-4">Texto Detallado (Pestaña Sobre Nosotros)</h3>
                  
                  <div className="space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bloque de Texto 1 (Acreditación PANI)</label>
                      <textarea
                        value={config.about.detailedText1}
                        onChange={(e) => handleAboutChange("detailedText1", e.target.value)}
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bloque de Texto 2 (Labor en Pavas)</label>
                      <textarea
                        value={config.about.detailedText2}
                        onChange={(e) => handleAboutChange("detailedText2", e.target.value)}
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bloque de Texto 3 (Líderes Comunitarios)</label>
                      <textarea
                        value={config.about.detailedText3}
                        onChange={(e) => handleAboutChange("detailedText3", e.target.value)}
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Bloque de Texto 4 (Historia y Registro Legal)</label>
                      <textarea
                        value={config.about.historyText}
                        onChange={(e) => handleAboutChange("historyText", e.target.value)}
                        rows={4}
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold"
                      />
                    </div>
                  </div>
                </div>

              </div>
            </div>
          )}

          {/* TAB 4: PROGRAMAS */}
          {activeTab === "programs" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Programas y Módulos de Trabajo</h2>
                <p className="text-xs text-gray-400 mt-1">Edita las tarjetas explicativas de los diferentes talleres impartidos a los niños.</p>
              </div>

              <div className="space-y-8">
                {config.programs.map((program, index) => (
                  <div key={program.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                    <h3 className="text-sm font-extrabold text-foundation-teal-dark">
                      Módulo #{index + 1}: {program.name}
                    </h3>
                    
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre del Programa</label>
                        <input
                          type="text"
                          value={program.name}
                          onChange={(e) => handleProgramChange(index, "name", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold"
                        />
                      </div>
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen URL</label>
                        <input
                          type="text"
                          value={program.imageUrl}
                          onChange={(e) => handleProgramChange(index, "imageUrl", e.target.value)}
                          className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-mono text-xs"
                        />
                        <span className="text-[10px] text-gray-400 mt-1 block font-medium">Soporta enlaces de compartir de Google Drive de manera automática.</span>
                      </div>
                    </div>

                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción</label>
                      <textarea
                        value={program.description}
                        onChange={(e) => handleProgramChange(index, "description", e.target.value)}
                        rows={3}
                        className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold"
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* TAB 5: MESSAGES */}
          {activeTab === "messages" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Consultas de Contacto Recibidas</h2>
                  <p className="text-xs text-gray-400 mt-1">Lista en tiempo real de los mensajes enviados a través de la sección de contacto pública.</p>
                </div>
                <button 
                  onClick={fetchMessages}
                  disabled={messagesLoading}
                  className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                >
                  Actualizar Lista
                </button>
              </div>

              {messagesLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-foundation-teal animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando mensajes...</p>
                </div>
              ) : messages.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <MessageSquare className="w-12 h-12 mx-auto stroke-1 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">No se han recibido consultas todavía.</p>
                  <p className="text-xs mt-1">Cualquier mensaje que se envíe por el formulario de la página aparecerá aquí.</p>
                </div>
              ) : (
                <div className="space-y-4">
                  {messages.map((msg) => (
                    <div key={msg.id} className="p-5 rounded-2xl border border-gray-100 hover:border-gray-200 bg-gray-50/50 hover:bg-gray-50 transition-all flex flex-col justify-between gap-4">
                      
                      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-100 pb-3">
                        <div>
                          <p className="text-sm font-black text-gray-800">{msg.name}</p>
                          <a href={`mailto:${msg.email}`} className="text-xs font-bold text-foundation-teal hover:underline mt-0.5 inline-block">
                            {msg.email}
                          </a>
                        </div>
                        <span className="text-[10px] font-mono font-bold text-gray-400 self-start sm:self-auto">
                          {new Date(msg.createdAt).toLocaleDateString()} {new Date(msg.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                        </span>
                      </div>

                      <p className="text-gray-600 text-sm leading-relaxed whitespace-pre-wrap font-semibold bg-white p-4 rounded-xl border border-gray-100">
                        {msg.message}
                      </p>

                      <div className="flex justify-end">
                        <button
                          onClick={() => handleDeleteMessage(msg.id)}
                          className="flex items-center gap-1.5 px-3 py-1.5 bg-red-50 hover:bg-red-100 text-foundation-red font-bold text-xs rounded-lg transition-colors cursor-pointer"
                        >
                          <Trash2 className="w-3.5 h-3.5" />
                          Eliminar Consulta
                        </button>
                      </div>

                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 6: TESTIMONIALS */}
          {activeTab === "testimonials" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Carrusel de Testimonios de la Página de Inicio</h2>
                  <p className="text-xs text-gray-400 mt-1">Gestione los testimonios de beneficiarios o colaboradores que aparecen en el carrusel interactivo.</p>
                </div>
                <button
                  onClick={handleAddTestimonial}
                  className="flex items-center gap-1.5 text-xs bg-foundation-teal hover:bg-foundation-teal-dark text-white px-4 py-2 rounded-xl font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Nuevo Testimonio
                </button>
              </div>

              {(!config.testimonials || config.testimonials.length === 0) ? (
                <div className="text-center py-16 text-gray-400">
                  <Quote className="w-12 h-12 mx-auto stroke-1 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">No hay testimonios configurados.</p>
                  <p className="text-xs mt-1">Haga clic en "Nuevo Testimonio" para añadir uno nuevo.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {config.testimonials.map((test, index) => (
                    <div key={test.id} className="p-5 bg-gray-50 rounded-2xl border border-gray-100 space-y-4 relative">
                      <button
                        onClick={() => handleRemoveTestimonial(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-foundation-red p-1.5 rounded-lg hover:bg-red-50 transition-colors"
                        title="Eliminar Testimonio"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
                        {/* Image Preview and File Upload */}
                        <div className="md:col-span-3 flex flex-col items-center justify-center space-y-2 border-r border-gray-100 pr-0 md:pr-6">
                          <label className="block text-xs font-bold text-gray-500 uppercase text-center w-full mb-1">Foto de Perfil</label>
                          <div className="relative w-20 h-20 rounded-full overflow-hidden border-2 border-foundation-teal shadow-md bg-white flex-shrink-0">
                            {test.imageUrl ? (
                              <img 
                                src={test.imageUrl} 
                                alt={test.name} 
                                className="w-full h-full object-cover"
                                referrerPolicy="no-referrer"
                              />
                            ) : (
                              <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                                <Users className="w-8 h-8" />
                              </div>
                            )}
                          </div>
                          
                          <label className="flex items-center gap-1 px-3 py-1 bg-white border border-gray-200 hover:border-foundation-teal rounded-lg text-[10px] font-black text-gray-600 hover:text-foundation-teal cursor-pointer shadow-sm mt-2 transition-all">
                            <Upload className="w-3 h-3" />
                            <span>Subir Foto</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, { type: "testimonial", index })}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Text inputs */}
                        <div className="md:col-span-9 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre Completo</label>
                              <input
                                type="text"
                                value={test.name}
                                onChange={(e) => handleTestimonialChange(index, "name", e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                              />
                            </div>
                            <div>
                              <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Rol / Cargo</label>
                              <input
                                type="text"
                                value={test.role}
                                onChange={(e) => handleTestimonialChange(index, "role", e.target.value)}
                                className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                              />
                            </div>
                          </div>

                          <div>
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje / Testimonio</label>
                            <textarea
                              value={test.text}
                              onChange={(e) => handleTestimonialChange(index, "text", e.target.value)}
                              rows={3}
                              className="w-full p-3 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                              placeholder="Su gran ayuda ha transformado mi vida..."
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB 7: BRANDING, CONTACT & SOCIAL MEDIA */}
          {activeTab === "branding" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Contacto, Redes Sociales y Branding</h2>
                <p className="text-xs text-gray-400 mt-1">Administre toda la información de contacto, enlaces a redes sociales (WhatsApp, Instagram, TikTok, Facebook, etc.), logotipos y banners de la fundación.</p>
              </div>

              {/* INFORMACIÓN DE CONTACTO BÁSICA */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <MapPin className="w-4.5 h-4.5" />
                  Información de Contacto de la Sede
                </h3>
                
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Dirección Física de la Sede</label>
                    <input
                      type="text"
                      value={config.contact?.address || ""}
                      onChange={(e) => handleContactChange("address", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="Dirección física completa..."
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Teléfono Principal de Oficina</label>
                    <input
                      type="text"
                      value={config.contact?.phone || ""}
                      onChange={(e) => handleContactChange("phone", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="+506 4031 6633"
                    />
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Correo Electrónico Oficial</label>
                    <input
                      type="email"
                      value={config.contact?.email || ""}
                      onChange={(e) => handleContactChange("email", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="fundacion@gmail.com"
                    />
                  </div>

                  <div className="sm:col-span-2">
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Horario de Atención Público</label>
                    <input
                      type="text"
                      value={config.contact?.hours || ""}
                      onChange={(e) => handleContactChange("hours", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="Lunes — Viernes 8:00am - 5:00pm"
                    />
                  </div>
                </div>
              </div>

              {/* REDES SOCIALES Y CANALES OFICIALES */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <Share2 className="w-4.5 h-4.5" />
                  Redes Sociales y Canales Oficiales
                </h3>
                <p className="text-xs text-gray-500">
                  Agregue o modifique los enlaces a sus perfiles en redes sociales. Deje el campo en blanco si no desea mostrar esa red social en el sitio público.
                </p>

                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {/* WhatsApp */}
                  <div className="sm:col-span-2 p-4 bg-emerald-50/60 rounded-xl border border-emerald-200/60 space-y-3">
                    <div className="flex items-center gap-2 text-emerald-800 font-bold text-xs uppercase">
                      <Phone className="w-4 h-4 text-emerald-600" />
                      <span>WhatsApp Oficial (Botón Flotante y Footer)</span>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Número WhatsApp (sin espacios ni guiones, con código país)</label>
                        <input
                          type="text"
                          value={config.whatsapp?.phone || ""}
                          onChange={(e) => handleWhatsAppChange("phone", e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold outline-none focus:border-emerald-500"
                          placeholder="50688888888"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-600 mb-1">Mensaje Predeterminado de Inicio</label>
                        <input
                          type="text"
                          value={config.whatsapp?.message || ""}
                          onChange={(e) => handleWhatsAppChange("message", e.target.value)}
                          className="w-full px-3.5 py-2 bg-white border border-emerald-200 rounded-lg text-xs font-semibold outline-none focus:border-emerald-500"
                          placeholder="¡Hola! Quisiera más información..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-[#1877F2]" />
                      Facebook URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.facebookUrl || ""}
                      onChange={(e) => handleContactChange("facebookUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#1877F2]"
                      placeholder="https://www.facebook.com/Fundacion..."
                    />
                  </div>

                  {/* Instagram */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <Instagram className="w-3.5 h-3.5 text-[#E4405F]" />
                      Instagram URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.instagramUrl || ""}
                      onChange={(e) => handleContactChange("instagramUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#E4405F]"
                      placeholder="https://www.instagram.com/Fundacion..."
                    />
                  </div>

                  {/* TikTok */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <span className="w-2 h-2 rounded-full bg-black" />
                      TikTok URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.tiktokUrl || ""}
                      onChange={(e) => handleContactChange("tiktokUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-black"
                      placeholder="https://www.tiktok.com/@Fundacion..."
                    />
                  </div>

                  {/* YouTube */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <Youtube className="w-3.5 h-3.5 text-[#FF0000]" />
                      YouTube URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.youtubeUrl || ""}
                      onChange={(e) => handleContactChange("youtubeUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#FF0000]"
                      placeholder="https://www.youtube.com/@Fundacion..."
                    />
                  </div>

                  {/* Twitter / X */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <Twitter className="w-3.5 h-3.5 text-gray-800" />
                      X / Twitter URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.twitterUrl || ""}
                      onChange={(e) => handleContactChange("twitterUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-gray-800"
                      placeholder="https://x.com/Fundacion..."
                    />
                  </div>

                  {/* LinkedIn */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-1.5 flex items-center gap-1.5">
                      <Linkedin className="w-3.5 h-3.5 text-[#0A66C2]" />
                      LinkedIn URL
                    </label>
                    <input
                      type="text"
                      value={config.contact?.linkedinUrl || ""}
                      onChange={(e) => handleContactChange("linkedinUrl", e.target.value)}
                      className="w-full px-3.5 py-2 bg-white border border-gray-200 rounded-lg text-xs font-medium outline-none focus:border-[#0A66C2]"
                      placeholder="https://www.linkedin.com/company/Fundacion..."
                    />
                  </div>
                </div>

                {/* REDES O ENLACES PERSONALIZADOS ADICIONALES */}
                <div className="pt-4 border-t border-gray-200/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Enlaces o Redes Adicionales Personalizadas</h4>
                      <p className="text-[11px] text-gray-400">¿Desea agregar otros canales como Telegram, Threads, Spotify, etc.? Agréguelos aquí.</p>
                    </div>
                    <button
                      type="button"
                      onClick={handleAddCustomSocialLink}
                      className="flex items-center gap-1.5 px-3 py-1.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-lg text-xs font-bold transition-all cursor-pointer"
                    >
                      <Plus className="w-3.5 h-3.5" />
                      Añadir Enlace
                    </button>
                  </div>

                  {(!config.contact?.customSocialLinks || config.contact.customSocialLinks.length === 0) ? (
                    <p className="text-xs text-gray-400 italic bg-white p-3 rounded-lg border border-dashed border-gray-200 text-center">
                      No hay enlaces adicionales personalizados creados. Haga clic en "Añadir Enlace" si desea agregar más.
                    </p>
                  ) : (
                    <div className="space-y-3">
                      {config.contact.customSocialLinks.map((item, idx) => (
                        <div key={item.id || idx} className="flex items-center gap-2 bg-white p-3 rounded-xl border border-gray-200 shadow-xs">
                          <Globe className="w-4 h-4 text-foundation-teal flex-shrink-0" />
                          <input
                            type="text"
                            value={item.label}
                            onChange={(e) => handleUpdateCustomSocialLink(idx, "label", e.target.value)}
                            placeholder="Nombre del canal (Ej: Telegram)"
                            className="w-1/3 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-foundation-teal"
                          />
                          <input
                            type="text"
                            value={item.url}
                            onChange={(e) => handleUpdateCustomSocialLink(idx, "url", e.target.value)}
                            placeholder="https://..."
                            className="flex-grow px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-medium outline-none focus:bg-white focus:border-foundation-teal"
                          />
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomSocialLink(idx)}
                            className="p-1.5 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer"
                            title="Eliminar enlace"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* LOGOTIPO SECTION */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <Image className="w-4.5 h-4.5" />
                  Logotipo Oficial de la Fundación
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-3">Previsualización</span>
                    <div className="h-16 flex items-center justify-center max-w-full">
                      {config.branding?.logoUrl ? (
                        <img 
                          src={getDirectDriveImageUrl(config.branding.logoUrl)} 
                          alt="Logo Fundación" 
                          className="max-h-full object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <span className="text-xs text-gray-400 font-bold">Sin logotipo</span>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL del Logotipo</label>
                      <input
                        type="text"
                        value={config.branding?.logoUrl || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            branding: { ...(config.branding || { logoUrl: "", bannerUrl: "" }), logoUrl: e.target.value }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-foundation-teal"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block font-medium">Soporta enlaces directos y de compartir de Google Drive de manera automática.</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Subir Logotipo con Vista Previa</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "logo")}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-400 font-medium">Formatos recomendados: PNG transparente o SVG.</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* BANNER REY DE REYES SECTION */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <Image className="w-4.5 h-4.5" />
                  Banner Principal / Imagen de Fondo Hero
                </h3>
                
                <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-center">
                  <div className="md:col-span-4 flex flex-col items-center justify-center p-4 bg-white rounded-2xl border border-gray-200/80 shadow-sm">
                    <span className="text-[10px] font-bold text-gray-400 uppercase mb-3">Previsualización</span>
                    <div className="h-24 w-full rounded-lg overflow-hidden border border-gray-150">
                      {config.hero?.imageUrl ? (
                        <img 
                          src={getDirectDriveImageUrl(config.hero.imageUrl)} 
                          alt="Banner Hero" 
                          className="w-full h-full object-cover"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-full h-full flex items-center justify-center bg-gray-100 text-gray-300">
                          <span className="text-xs">Sin banner</span>
                        </div>
                      )}
                    </div>
                  </div>

                  <div className="md:col-span-8 space-y-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL de Imagen del Banner Hero</label>
                      <input
                        type="text"
                        value={config.hero?.imageUrl || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            hero: { ...config.hero, imageUrl: e.target.value }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-foundation-teal"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block font-medium">Soporta enlaces directos y de compartir de Google Drive de manera automática.</span>
                    </div>

                    <div className="flex items-center gap-3">
                      <label className="flex items-center gap-2 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all">
                        <Upload className="w-4 h-4" />
                        <span>Subir Banner con Vista Previa</span>
                        <input
                          type="file"
                          accept="image/*"
                          onChange={(e) => handleFileUpload(e, "hero")}
                          className="hidden"
                        />
                      </label>
                      <span className="text-xs text-gray-400 font-medium">Imagen principal que adorna la parte superior del portal.</span>
                    </div>
                  </div>
                </div>
              </div>

            </div>
          )}

          {/* TAB 8: NEWSLETTER SUBSCRIBERS */}
          {activeTab === "newsletter" && (
            <div className="space-y-6 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex justify-between items-center">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Suscriptores del Newsletter de Noticias</h2>
                  <p className="text-xs text-gray-400 mt-1">Lista en tiempo real de los correos electrónicos inscritos para recibir novedades de la fundación.</p>
                </div>
                <div className="flex gap-2">
                  <button 
                    onClick={() => {
                      const emails = subscribers.map(s => s.email).join("\n");
                      navigator.clipboard.writeText(emails);
                      alert("¡Correos copiados al portapapeles listos para pegar en Mailchimp o Excel!");
                    }}
                    disabled={subscribers.length === 0}
                    className="px-3 py-1.5 bg-foundation-teal-light text-foundation-teal font-bold text-xs rounded-lg transition-colors cursor-pointer hover:bg-foundation-teal hover:text-white"
                  >
                    Copiar Todos los Correos
                  </button>
                  <button 
                    onClick={fetchNewsletterSubscribers}
                    disabled={subscribersLoading}
                    className="px-3 py-1.5 bg-gray-100 hover:bg-gray-200 text-gray-700 font-bold text-xs rounded-lg transition-colors cursor-pointer"
                  >
                    Actualizar Lista
                  </button>
                </div>
              </div>

              {subscribersLoading ? (
                <div className="flex flex-col items-center justify-center py-16 gap-3">
                  <Loader2 className="w-8 h-8 text-foundation-teal animate-spin" />
                  <p className="text-xs font-bold text-gray-400 uppercase tracking-widest">Cargando suscriptores...</p>
                </div>
              ) : subscribers.length === 0 ? (
                <div className="text-center py-16 text-gray-400">
                  <Mail className="w-12 h-12 mx-auto stroke-1 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">No hay suscriptores registrados.</p>
                  <p className="text-xs mt-1">Los correos de las personas que se unan al boletín al pie de página aparecerán aquí.</p>
                </div>
              ) : (
                <div className="bg-white rounded-2xl border border-gray-150 overflow-hidden shadow-sm">
                  <div className="overflow-x-auto">
                    <table className="w-full text-left border-collapse">
                      <thead>
                        <tr className="bg-gray-50 border-b border-gray-150 text-[10px] font-bold text-gray-400 uppercase tracking-wider">
                          <th className="px-6 py-4">Correo Electrónico</th>
                          <th className="px-6 py-4">Fecha de Registro</th>
                          <th className="px-6 py-4 text-right">Acciones</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-gray-100">
                        {subscribers.map((sub) => (
                          <tr key={sub.id} className="hover:bg-gray-50/50 text-sm font-medium text-gray-700">
                            <td className="px-6 py-4 font-bold text-gray-900">{sub.email}</td>
                            <td className="px-6 py-4 text-xs text-gray-500">
                              {new Date(sub.createdAt).toLocaleDateString()} {new Date(sub.createdAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
                            </td>
                            <td className="px-6 py-4 text-right">
                              <button
                                onClick={() => handleDeleteSubscriber(sub.id)}
                                className="inline-flex items-center gap-1 px-2.5 py-1.5 bg-red-50 hover:bg-red-100 text-foundation-red rounded-lg text-xs font-bold transition-all cursor-pointer"
                              >
                                <Trash2 className="w-3.5 h-3.5" />
                                Eliminar
                              </button>
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* TAB 9: FAQs */}
          {activeTab === "faqs" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Preguntas Frecuentes (FAQ)</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Crea y edita preguntas sobre donaciones, voluntariado o generales para aumentar la confianza de los visitantes.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddFAQ}
                  className="flex items-center justify-center gap-1.5 px-4 py-2 bg-foundation-teal hover:bg-foundation-teal-dark text-white text-xs font-extrabold rounded-xl shadow-sm transition-all cursor-pointer hover:scale-105 self-start"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Pregunta
                </button>
              </div>

              {(!config.faqs || config.faqs.length === 0) ? (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                  <HelpCircle className="w-12 h-12 mx-auto stroke-1 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">No hay preguntas frecuentes.</p>
                  <p className="text-xs mt-1">Haz clic en "Agregar Pregunta" para crear la primera.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {config.faqs.map((faq, index) => (
                    <div key={faq.id || index} className="p-6 bg-gray-50 rounded-2xl border border-gray-150 relative group">
                      <button
                        type="button"
                        onClick={() => handleRemoveFAQ(index)}
                        className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-foundation-red rounded-xl transition-all cursor-pointer opacity-100 sm:opacity-0 group-hover:opacity-100"
                        title="Eliminar Pregunta"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 gap-4 pr-8">
                        <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
                          <div className="sm:col-span-3">
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Pregunta</label>
                            <input
                              type="text"
                              value={faq.question}
                              onChange={(e) => handleFAQChange(index, "question", e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                              placeholder="¿Cuál es la pregunta?"
                            />
                          </div>
                          <div>
                            <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Categoría</label>
                            <select
                              value={faq.category}
                              onChange={(e) => handleFAQChange(index, "category", e.target.value as any)}
                              className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                            >
                              <option value="general">General</option>
                              <option value="donaciones">Donaciones</option>
                              <option value="voluntariado">Voluntariado</option>
                            </select>
                          </div>
                        </div>

                        <div>
                          <label className="block text-[10px] font-bold text-gray-400 uppercase mb-1">Respuesta</label>
                          <textarea
                            rows={3}
                            value={faq.answer}
                            onChange={(e) => handleFAQChange(index, "answer", e.target.value)}
                            className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                            placeholder="Escriba la respuesta detallada..."
                          />
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* TAB: GALLERY MANAGEMENT */}
          {activeTab === "gallery" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gestión de Galería de Fotos</h2>
                  <p className="text-xs text-gray-400 mt-1">Agrega, elimina o edita las fotografías mostradas en la sección pública de Galería. Todas cuentan con vista previa en tiempo real.</p>
                </div>
                <label className="flex items-center gap-2 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-bold cursor-pointer shadow-md transition-all self-start sm:self-auto">
                  <Upload className="w-4 h-4" />
                  <span>Subir Nueva Foto</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>
              </div>

              {/* IMAGE OPTIMIZATION OPTIONS BOX */}
              <div className="bg-emerald-50/50 border border-emerald-100 p-5 rounded-2xl space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="text-sm font-extrabold text-emerald-800 flex items-center gap-1.5">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    Compresor de Imágenes del Frontend (Activo)
                  </h4>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={compressBeforeUpload}
                      onChange={(e) => setCompressBeforeUpload(e.target.checked)}
                      className="sr-only peer"
                    />
                    <div className="w-9 h-5 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-4 after:w-4 after:transition-all peer-checked:bg-emerald-500 font-sans"></div>
                  </label>
                </div>
                <p className="text-xs text-emerald-700 leading-relaxed font-semibold">
                  Esta funcionalidad comprime y redimensiona las fotos en tu navegador antes de subirlas al servidor. Optimiza automáticamente el tamaño para que la página cargue en menos de un segundo.
                </p>

                {compressBeforeUpload && (
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2 border-t border-emerald-100">
                    <div>
                      <label className="block text-[10px] font-black text-emerald-800 uppercase mb-1">Ancho Máximo (px)</label>
                      <input
                        type="number"
                        value={compressMaxWidth}
                        onChange={(e) => setCompressMaxWidth(parseInt(e.target.value) || 1000)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                    <div>
                      <label className="block text-[10px] font-black text-emerald-800 uppercase mb-1">Calidad (0.1 a 1.0)</label>
                      <input
                        type="number"
                        step="0.05"
                        min="0.1"
                        max="1.0"
                        value={compressQuality}
                        onChange={(e) => setCompressQuality(parseFloat(e.target.value) || 0.8)}
                        className="w-full px-3 py-1.5 bg-white border border-emerald-200 rounded-lg text-xs font-bold text-emerald-800 outline-none focus:border-emerald-500"
                      />
                    </div>
                  </div>
                )}
              </div>

              {/* LIST OF GALLERY PHOTOS WITH INPUTS AND PREVIEWS */}
              {(!config.gallery || config.gallery.length === 0) ? (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-3xl">
                  <Image className="w-12 h-12 mx-auto stroke-1 mb-3 text-gray-300" />
                  <p className="text-sm font-bold">La galería está vacía.</p>
                  <p className="text-xs mt-1">Haz clic en "Subir Nueva Foto" o agrega un enlace de imagen abajo.</p>
                </div>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {config.gallery.map((imgUrl, index) => (
                    <div key={index} className="p-4 bg-gray-50 rounded-2xl border border-gray-150 flex flex-col gap-4 relative group">
                      <button
                        type="button"
                        onClick={() => {
                          const updated = config.gallery.filter((_, idx) => idx !== index);
                          setConfig({ ...config, gallery: updated });
                        }}
                        className="absolute top-3 right-3 p-1.5 bg-red-50 hover:bg-red-100 text-foundation-red rounded-xl transition-all cursor-pointer shadow-xs"
                        title="Eliminar Foto"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      {/* Preview Image Frame */}
                      <div className="w-full h-44 rounded-xl overflow-hidden bg-gray-100 border border-gray-200 shadow-inner relative">
                        <img 
                          src={getDirectDriveImageUrl(imgUrl)} 
                          alt={`Previsualización Galería #${index + 1}`}
                          className="w-full h-full object-cover" 
                          onError={(e) => {
                            (e.target as any).src = "https://images.unsplash.com/photo-1594708767771-a7502209ff51?auto=format&fit=crop&q=80&w=600";
                          }}
                        />
                        <div className="absolute bottom-2 left-2 px-2 py-0.5 bg-gray-950/60 backdrop-blur-xs text-[10px] text-white font-black rounded-sm uppercase tracking-widest">
                          Posición #{index + 1}
                        </div>
                      </div>

                      {/* Manual link editor */}
                      <div className="space-y-1">
                        <label className="block text-[10px] font-black text-gray-400 uppercase">Enlace Directo de la Foto (Google Drive o Unsplash)</label>
                        <input
                          type="text"
                          value={imgUrl}
                          onChange={(e) => {
                            const updated = [...config.gallery];
                            updated[index] = e.target.value;
                            setConfig({ ...config, gallery: updated });
                          }}
                          className="w-full px-3 py-2 bg-white border border-gray-200 rounded-lg text-xs font-mono outline-none focus:border-foundation-teal"
                          placeholder="https://..."
                        />
                      </div>
                    </div>
                  ))}
                </div>
              )}

              {/* Add manual link button */}
              <div className="flex justify-end pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={() => {
                    setConfig({
                      ...config,
                      gallery: [...(config.gallery || []), "https://images.unsplash.com/photo-1503676260728-1c00da094a0b?auto=format&fit=crop&q=80&w=600"]
                    });
                  }}
                  className="flex items-center gap-1 text-xs bg-gray-100 hover:bg-gray-200 text-gray-700 px-4 py-2.5 rounded-xl font-bold transition-all cursor-pointer"
                >
                  <Plus className="w-4 h-4" />
                  Agregar Enlace Manualmente
                </button>
              </div>
            </div>
          )}

          {/* TAB: GLOBAL NOTICE BANNER */}
          {activeTab === "globalNotice" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">Anuncio Banner Global</h2>
                <p className="text-xs text-gray-400 mt-1">Administra el mensaje de alerta o aviso urgente que aparece en la cabecera superior del portal de la fundación.</p>
              </div>

              {/* Controls */}
              <div className="space-y-6">
                {/* Active Checkbox */}
                <div className="flex items-center justify-between p-5 bg-gray-50 rounded-2xl border border-gray-150">
                  <div>
                    <h4 className="text-sm font-bold text-gray-900">Mostrar Banner de Anuncio</h4>
                    <p className="text-xs text-gray-400 mt-0.5">Activa o desactiva de forma global el cintillo promocional/informativo.</p>
                  </div>
                  <label className="relative inline-flex items-center cursor-pointer">
                    <input
                      type="checkbox"
                      checked={config.globalNotice?.active || false}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          globalNotice: {
                            ...(config.globalNotice || { active: false, text: "", type: "info" }),
                            active: e.target.checked
                          }
                        });
                      }}
                      className="sr-only peer"
                    />
                    <div className="w-11 h-6 bg-gray-200 peer-focus:outline-none rounded-full peer peer-checked:after:translate-x-full peer-checked:after:border-white after:content-[''] after:absolute after:top-[2px] after:left-[2px] after:bg-white after:border-gray-300 after:border after:rounded-full after:h-5 after:w-5 after:transition-all peer-checked:bg-foundation-teal font-sans"></div>
                  </label>
                </div>

                {config.globalNotice?.active && (
                  <div className="space-y-4 p-5 border border-gray-150 rounded-2xl bg-white">
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      {/* Type Select */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Estilo de Alerta / Tipo</label>
                        <select
                          value={config.globalNotice?.type || "info"}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              globalNotice: {
                                ...(config.globalNotice || { active: true, text: "", type: "info" }),
                                type: e.target.value as any
                              }
                            });
                          }}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                        >
                          <option value="info">Celeste Informativo (Información General)</option>
                          <option value="alert">Naranja Alerta (Urgente / Campañas)</option>
                          <option value="success">Verde Éxito (Celebración / Logros)</option>
                        </select>
                      </div>

                      {/* CTA label */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Texto del Enlace / Botón Acción (CTA)</label>
                        <input
                          type="text"
                          value={config.globalNotice?.ctaText || ""}
                          onChange={(e) => {
                            setConfig({
                              ...config,
                              globalNotice: {
                                ...(config.globalNotice || { active: true, text: "", type: "info" }),
                                ctaText: e.target.value
                              }
                            });
                          }}
                          placeholder="Ej: ¡Quiero donar ahora!"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                        />
                      </div>
                    </div>

                    {/* Notice Text */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Mensaje del Anuncio</label>
                      <textarea
                        rows={2}
                        value={config.globalNotice?.text || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            globalNotice: {
                              ...(config.globalNotice || { active: true, text: "", type: "info" }),
                              text: e.target.value
                            }
                          });
                        }}
                        placeholder="Escriba aquí el anuncio general que se mostrará arriba del menú..."
                        className="w-full p-4 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                      />
                    </div>

                    {/* CTA link */}
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enlace de Destino (URL o sección)</label>
                      <input
                        type="text"
                        value={config.globalNotice?.ctaLink || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            globalNotice: {
                              ...(config.globalNotice || { active: true, text: "", type: "info" }),
                              ctaLink: e.target.value
                            }
                          });
                        }}
                        placeholder="Ej: donaciones o https://google.com"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none focus:border-foundation-teal"
                      />
                      <span className="text-[10px] text-gray-400 mt-1 block">Escriba un enlace completo (comenzando con https://) o use palabras clave del menú como <code className="bg-gray-150 px-1 py-0.5 rounded font-mono">donaciones</code>, <code className="bg-gray-150 px-1 py-0.5 rounded font-mono">inicio</code>, etc.</span>
                    </div>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* TAB: SEO & METATAGS */}
          {activeTab === "seo" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900">SEO y Metatags para Visibilidad en Buscadores</h2>
                <p className="text-xs text-gray-400 mt-1">Controla los títulos de página, palabras clave, descripciones meta y etiquetas Open Graph para optimizar la indexación en Google y redes sociales.</p>
              </div>

              {/* SEO Configurations */}
              <div className="space-y-6">
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                    <Globe className="w-4.5 h-4.5 text-foundation-teal" />
                    Básico (Metas Generales)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título del Sitio Web</label>
                      <input
                        type="text"
                        value={config.seo?.title || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            seo: {
                              ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                              title: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                        placeholder="Fundación Un Nuevo Comienzo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Palabras Clave (Separadas por comas)</label>
                      <input
                        type="text"
                        value={config.seo?.keywords || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            seo: {
                              ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                              keywords: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                        placeholder="fundación, niños, ayuda social, costa rica"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción Meta (Para Google y Bing)</label>
                    <textarea
                      rows={3}
                      value={config.seo?.description || ""}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          seo: {
                            ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                            description: e.target.value
                          }
                        });
                      }}
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="Somos una fundación sin fines de lucro costarricense que asiste a personas y niños en riesgo social..."
                    />
                  </div>
                </div>

                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                    <Users className="w-4.5 h-4.5 text-blue-600" />
                    Open Graph (Compartidos en WhatsApp, Facebook, X)
                  </h3>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Título de Compartido (OG Title)</label>
                      <input
                        type="text"
                        value={config.seo?.ogTitle || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            seo: {
                              ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                              ogTitle: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                        placeholder="Fundación Un Nuevo Comienzo"
                      />
                    </div>
                    <div>
                      <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Imagen de Compartido (OG Image URL)</label>
                      <input
                        type="text"
                        value={config.seo?.ogImage || ""}
                        onChange={(e) => {
                          setConfig({
                            ...config,
                            seo: {
                              ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                              ogImage: e.target.value
                            }
                          });
                        }}
                        className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                        placeholder="https://images.unsplash.com/photo-..."
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Descripción de Compartido (OG Description)</label>
                    <textarea
                      rows={3}
                      value={config.seo?.ogDescription || ""}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          seo: {
                            ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                            ogDescription: e.target.value
                          }
                        });
                      }}
                      className="w-full p-4 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="Conoce nuestras actividades diarias y entérate de cómo puedes donar o ser voluntario..."
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: SPONSORS / PATROCINADORES */}
          {activeTab === "sponsors" && (
            <div className="space-y-8 animate-fade-in">
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 pb-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900">Gestión de Patrocinadores y Aliados</h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Administra las empresas e instituciones patrocinadoras. Agrega o elimina aliados, personaliza sus logos, nombres, descripciones y enlaces web oficiales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={handleAddSponsor}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl font-bold text-xs shadow-md transition-all cursor-pointer self-start sm:self-auto"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Patrocinador
                </button>
              </div>

              <div className="space-y-6">
                {(!config.sponsors || config.sponsors.length === 0) ? (
                  <div className="text-center py-12 bg-gray-50 rounded-2xl border border-dashed border-gray-200">
                    <Building2 className="w-10 h-10 text-gray-300 mx-auto mb-2" />
                    <p className="text-sm font-bold text-gray-500">No hay patrocinadores registrados</p>
                    <p className="text-xs text-gray-400 mt-1">Haga clic en "Añadir Patrocinador" para agregar la primera empresa o institución aliada.</p>
                  </div>
                ) : (
                  config.sponsors.map((sponsor, index) => (
                    <div key={index} className="p-6 bg-gray-50/70 rounded-2xl border border-gray-150 space-y-4 relative hover:border-foundation-teal/30 transition-all">
                      <button
                        type="button"
                        onClick={() => handleRemoveSponsor(index)}
                        className="absolute top-4 right-4 text-gray-400 hover:text-foundation-red p-2 rounded-xl hover:bg-red-50 transition-colors"
                        title="Eliminar Patrocinador"
                      >
                        <Trash2 className="w-4.5 h-4.5" />
                      </button>

                      <div className="flex items-center gap-3 border-b border-gray-200/60 pb-3 pr-10">
                        <span className="w-7 h-7 rounded-lg bg-foundation-teal/10 text-foundation-teal font-black text-xs flex items-center justify-center">
                          #{index + 1}
                        </span>
                        <h3 className="font-extrabold text-gray-800 text-sm">{sponsor.name || "Patrocinador sin nombre"}</h3>
                      </div>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        {/* Name */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Nombre de la Empresa / Institución</label>
                          <input
                            type="text"
                            value={sponsor.name}
                            onChange={(e) => handleSponsorChange(index, "name", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                            placeholder="Ej: Instituto Costarricense de Electricidad (ICE)"
                          />
                        </div>

                        {/* Website URL */}
                        <div>
                          <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enlace Sitio Web Oficial (Opcional)</label>
                          <input
                            type="text"
                            value={sponsor.websiteUrl || ""}
                            onChange={(e) => handleSponsorChange(index, "websiteUrl", e.target.value)}
                            className="w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                            placeholder="https://ejemplo.com"
                          />
                        </div>
                      </div>

                      {/* Description / Text */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Texto Descriptivo / Detalle del Apoyo</label>
                        <textarea
                          rows={2}
                          value={sponsor.description || ""}
                          onChange={(e) => handleSponsorChange(index, "description", e.target.value)}
                          className="w-full p-3 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                          placeholder="Ej: Colaboración tecnológica y académica para el desarrollo integral de los niños de Pavas."
                        />
                      </div>

                      {/* Logo Image URL & File Upload */}
                      <div>
                        <label className="block text-xs font-bold text-gray-500 uppercase mb-2">URL o Subida del Logo (Imagen)</label>
                        <div className="flex flex-col sm:flex-row gap-3 items-start sm:items-center">
                          <input
                            type="text"
                            value={sponsor.logoUrl || ""}
                            onChange={(e) => handleSponsorChange(index, "logoUrl", e.target.value)}
                            className="flex-grow w-full px-4 py-2.5 rounded-xl border border-gray-200 text-sm font-semibold outline-none bg-white focus:border-foundation-teal"
                            placeholder="https://ejemplo.com/logo.png"
                          />
                          <label className="flex items-center gap-2 px-4 py-2.5 bg-white border border-gray-200 hover:bg-gray-100 rounded-xl font-extrabold text-xs text-gray-700 cursor-pointer shadow-xs transition-all shrink-0">
                            <Upload className="w-4 h-4 text-foundation-teal" />
                            <span>Subir Logo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, { type: "sponsor", index })}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Image Preview */}
                        {sponsor.logoUrl && (
                          <div className="mt-3 p-3 bg-white border border-gray-200 rounded-xl flex items-center gap-4 w-fit">
                            <img
                              src={sponsor.logoUrl}
                              alt={sponsor.name}
                              className="h-10 max-w-[120px] object-contain"
                              onError={(e) => {
                                (e.target as HTMLElement).style.display = 'none';
                              }}
                            />
                            <span className="text-xs text-gray-400 font-semibold">Vista previa del logo</span>
                          </div>
                        )}
                      </div>

                    </div>
                  ))
                )}
              </div>
            </div>
          )}

        </div>

      </div>

    </div>
  );
}
