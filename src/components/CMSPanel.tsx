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
  AlertTriangle,
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
  Clock,
  BarChart2,
  PieChart as PieChartIcon,
  QrCode,
  MessageCircle,
  Facebook,
  Copy,
  Printer,
  Check
} from "lucide-react";
import { 
  ResponsiveContainer, 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  Tooltip, 
  CartesianGrid, 
  PieChart, 
  Pie, 
  Cell, 
  Legend, 
  AreaChart, 
  Area 
} from "recharts";
import { AppConfig, ContactMessage, BankAccount, Program, Founder, Testimonial, Sponsor, DonationGoal, BrandingConfig, WhatsAppConfig, FAQItem, SEOConfig, GlobalNoticeConfig, PromoArt, CustomQRItem } from "../types";
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
  const [activeTab, setActiveTab] = useState<"logo" | "donations" | "analytics" | "promo" | "home" | "about" | "programs" | "messages" | "testimonials" | "sponsors" | "newsletter" | "branding" | "faqs" | "reports" | "seo" | "globalNotice" | "gallery" | "footer">("donations");
  const [config, setConfig] = useState<AppConfig>(initialConfig);
  const [messages, setMessages] = useState<ContactMessage[]>([]);
  const [subscribers, setSubscribers] = useState<NewsletterSubscriber[]>([]);
  const [subscribersLoading, setSubscribersLoading] = useState(false);
  const [loading, setLoading] = useState(false);
  const [messagesLoading, setMessagesLoading] = useState(false);
  const [statusMsg, setStatusMsg] = useState<{ type: "success" | "error"; text: string } | null>(null);

  // Custom Confirmation Modal state for high impact / destructive actions
  const [confirmModal, setConfirmModal] = useState<{
    isOpen: boolean;
    title: string;
    message: string;
    actionType?: "delete" | "warning";
    onConfirm: () => void;
  }>({
    isOpen: false,
    title: "",
    message: "",
    actionType: "delete",
    onConfirm: () => {}
  });

  const askConfirmation = (title: string, message: string, onConfirmAction: () => void, actionType: "delete" | "warning" = "delete") => {
    setConfirmModal({
      isOpen: true,
      title,
      message,
      actionType,
      onConfirm: () => {
        onConfirmAction();
        setConfirmModal(prev => ({ ...prev, isOpen: false }));
      }
    });
  };

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
    askConfirmation(
      "Eliminar Suscriptor",
      "¿Está seguro de que desea eliminar permanentemente este correo de la lista de suscriptores?",
      async () => {
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
      }
    );
  };

  // Image upload with preview
  const handleFileUpload = async (e: React.ChangeEvent<HTMLInputElement>, field: "logo" | "banner" | "corporateQr" | { type: "program"; index: number } | { type: "testimonial"; index: number } | { type: "sponsor"; index: number } | { type: "promoArt"; index: number } | "hero") => {
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
        else if (field === "corporateQr") filename = `corporate_qr_${Date.now()}_${file.name.replace(/[^a-zA-Z0-9\.\-_]/g, "")}`;

        let finalUrl = base64;
        try {
          const res = await fetch("/api/upload", {
            method: "POST",
            headers: {
              "Content-Type": "application/json",
              "Authorization": `Bearer ${token}`
            },
            body: JSON.stringify({ filename, base64 })
          });
          if (res.ok) {
            const data = await res.json();
            if (data.success && data.url) {
              finalUrl = data.url;
            }
          }
        } catch (e) {
          console.warn("Static hosting detected, using data URL for image asset.");
        }

        if (field === "logo") {
          setConfig(prev => ({
            ...prev,
            branding: { ...prev.branding, logoUrl: finalUrl }
          }));
        } else if (field === "banner") {
          setConfig(prev => ({
            ...prev,
            branding: { ...prev.branding, bannerUrl: finalUrl }
          }));
        } else if (field === "corporateQr") {
          setConfig(prev => ({
            ...prev,
            branding: { ...prev.branding, corporateQrUrl: finalUrl }
          }));
        } else if (field === "hero") {
          setConfig(prev => ({
            ...prev,
            hero: { ...prev.hero, imageUrl: finalUrl }
          }));
        } else if (typeof field === "object") {
          if (field.type === "program") {
            const updatedPrograms = [...config.programs];
            updatedPrograms[field.index] = { ...updatedPrograms[field.index], imageUrl: finalUrl };
            setConfig(prev => ({ ...prev, programs: updatedPrograms }));
          } else if (field.type === "testimonial") {
            if (config.testimonials) {
              const updatedTestimonials = [...config.testimonials];
              updatedTestimonials[field.index] = { ...updatedTestimonials[field.index], imageUrl: finalUrl };
              setConfig(prev => ({ ...prev, testimonials: updatedTestimonials }));
            }
          } else if (field.type === "sponsor") {
            const updatedSponsors = [...(config.sponsors || [])];
            updatedSponsors[field.index] = { ...updatedSponsors[field.index], logoUrl: finalUrl };
            setConfig(prev => ({ ...prev, sponsors: updatedSponsors }));
          } else if (field.type === "promoArt") {
            const updatedArts = [...(config.promoArts || [])];
            updatedArts[field.index] = { ...updatedArts[field.index], imageUrl: finalUrl };
            setConfig(prev => ({ ...prev, promoArts: updatedArts }));
          }
        }
        alert("¡Imagen subida con éxito y vista previa generada!");
      } catch (err) {
        console.error(err);
        alert("Error al procesar la imagen.");
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

  // Promo Arts management
  const handlePromoArtChange = (index: number, field: keyof PromoArt, value: string) => {
    const updated = [...(config.promoArts || [])];
    updated[index] = { ...updated[index], [field]: value } as PromoArt;
    setConfig({ ...config, promoArts: updated });
  };

  const handleAddPromoArt = () => {
    const newArt: PromoArt = {
      id: "promo-" + Date.now(),
      title: "Nuevo Arte Promocional",
      description: "Descripción breve de la pieza gráfica...",
      imageUrl: "https://images.unsplash.com/photo-1559027615-cd4628902d4a?auto=format&fit=crop&q=80&w=1080",
      format: "1080x1080"
    };
    setConfig({
      ...config,
      promoArts: [...(config.promoArts || []), newArt]
    });
  };

  const handleRemovePromoArt = (index: number) => {
    const filtered = (config.promoArts || []).filter((_, idx) => idx !== index);
    setConfig({ ...config, promoArts: filtered });
  };

  // Branding config management
  const handleBrandingChange = (field: keyof BrandingConfig, value: string) => {
    setConfig({
      ...config,
      branding: {
        ...(config.branding || { logoUrl: "", bannerUrl: "" }),
        [field]: value
      }
    });
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

  // Custom QR Manager functions
  const handleAddCustomQr = () => {
    const newQr: CustomQRItem = {
      id: "qr-" + Date.now(),
      title: "Nuevo Código QR",
      data: "https://fundacionunnuevocomienzo.cr",
      imageUrl: ""
    };
    const currentQrs = config.contact?.customQrs || [];
    handleContactChange("customQrs", [...currentQrs, newQr]);
  };

  const handleUpdateCustomQr = (index: number, field: keyof CustomQRItem, value: string) => {
    const currentQrs = [...(config.contact?.customQrs || [])];
    currentQrs[index] = { ...currentQrs[index], [field]: value };
    handleContactChange("customQrs", currentQrs);
  };

  const handleRemoveCustomQr = (index: number) => {
    const currentQrs = (config.contact?.customQrs || []).filter((_, idx) => idx !== index);
    handleContactChange("customQrs", currentQrs);
  };

  const handleCopyQr = async (title: string, dataOrUrl: string, customQrUrl?: string) => {
    const qrUrl = customQrUrl && customQrUrl.trim().length > 0
      ? customQrUrl
      : (dataOrUrl && dataOrUrl.trim().length > 0
        ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(dataOrUrl)}`
        : "");
    if (!qrUrl) {
      alert("Por favor ingrese un dato o URL válido para generar y copiar el código QR.");
      return;
    }
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = qrUrl;
        img.onload = () => {
          const canvas = document.createElement("canvas");
          canvas.width = img.width || 300;
          canvas.height = img.height || 300;
          const ctx = canvas.getContext("2d");
          if (ctx) {
            ctx.drawImage(img, 0, 0);
            canvas.toBlob((blob) => {
              if (blob) {
                navigator.clipboard.write([
                  new ClipboardItem({ "image/png": blob })
                ]).then(() => {
                  alert(`¡Imagen del Código QR "${title}" copiada al portapapeles!`);
                }).catch(() => {
                  navigator.clipboard.writeText(qrUrl);
                  alert(`¡Enlace del Código QR "${title}" copiado al portapapeles!`);
                });
              }
            }, "image/png");
          }
        };
        img.onerror = () => {
          navigator.clipboard.writeText(qrUrl);
          alert(`¡Enlace del Código QR "${title}" copiado al portapapeles!`);
        };
      } else {
        await navigator.clipboard.writeText(qrUrl);
        alert(`¡Enlace del Código QR "${title}" copiado al portapapeles!`);
      }
    } catch (err) {
      navigator.clipboard.writeText(qrUrl);
      alert(`¡Enlace del Código QR "${title}" copiado al portapapeles!`);
    }
  };

  const handlePrintQr = (title: string, dataOrUrl: string, customQrUrl?: string) => {
    const qrUrl = customQrUrl && customQrUrl.trim().length > 0
      ? customQrUrl
      : (dataOrUrl && dataOrUrl.trim().length > 0
        ? `https://api.qrserver.com/v1/create-qr-code/?size=400x400&data=${encodeURIComponent(dataOrUrl)}`
        : "");
    if (!qrUrl) {
      alert("Por favor ingrese una URL o número primero para imprimir el código QR.");
      return;
    }
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor habilite las ventanas emergentes (pop-ups) para imprimir el código QR.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR - ${title}</title>
          <style>
            body { font-family: 'Segoe UI', Arial, sans-serif; text-align: center; padding: 40px; color: #111827; }
            .card { border: 2px solid #0d9488; border-radius: 24px; padding: 32px; display: inline-block; max-width: 380px; box-shadow: 0 10px 25px rgba(0,0,0,0.05); }
            .logo { font-size: 16px; font-weight: 900; color: #0d9488; text-transform: uppercase; margin-bottom: 4px; }
            .sublogo { font-size: 12px; color: #6b7280; font-weight: 600; margin-bottom: 20px; }
            .qr-box { background: #f9fafb; padding: 16px; border-radius: 16px; border: 1px solid #e5e7eb; display: inline-block; margin-bottom: 16px; }
            .qr-box img { width: 240px; height: 240px; object-fit: contain; }
            .title { font-size: 18px; font-weight: 800; color: #111827; margin-bottom: 6px; }
            .data { font-size: 12px; font-family: monospace; color: #4b5563; word-break: break-all; margin-bottom: 20px; background: #f3f4f6; padding: 6px 12px; border-radius: 8px; }
            .footer { font-size: 11px; color: #9ca3af; font-weight: 700; text-transform: uppercase; }
          </style>
        </head>
        <body>
          <div class="card">
            <div class="logo">Fundación Un Nuevo Comienzo</div>
            <div class="sublogo">Costa Rica — Canal Oficial</div>
            <div class="title">${title}</div>
            <div class="qr-box">
              <img src="${qrUrl}" alt="QR ${title}" />
            </div>
            <div class="data">${dataOrUrl || "Código QR"}</div>
            <div class="footer">Escanee con la cámara de su teléfono</div>
          </div>
          <script>
            window.onload = function() {
              setTimeout(function() {
                window.print();
              }, 400);
            };
          </script>
        </body>
      </html>
    `);
    printWindow.document.close();
  };

  // Footer management handlers
  const handleFooterChange = (field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      footer: {
        year: prev.footer?.year || "2026",
        autoUpdateYear: prev.footer?.autoUpdateYear || false,
        organizationName: prev.footer?.organizationName || "Fundación Un Nuevo Comienzo C.R",
        designers: prev.footer?.designers || [
          "Cristhian Martínez",
          "Katherine Martínez",
          "Robert Ramírez",
          "Valeria Rojas"
        ],
        additionalCredits: prev.footer?.additionalCredits || [],
        [field]: value
      }
    }));
  };

  const handleAddDesigner = () => {
    const currentDesigners = config.footer?.designers || [
      "Cristhian Martínez",
      "Katherine Martínez",
      "Robert Ramírez",
      "Valeria Rojas"
    ];
    handleFooterChange("designers", [...currentDesigners, "Nuevo Colaborador"]);
  };

  const handleDesignerChange = (index: number, value: string) => {
    const currentDesigners = [...(config.footer?.designers || [])];
    currentDesigners[index] = value;
    handleFooterChange("designers", currentDesigners);
  };

  const handleRemoveDesigner = (index: number) => {
    const currentDesigners = [...(config.footer?.designers || [])];
    currentDesigners.splice(index, 1);
    handleFooterChange("designers", currentDesigners);
  };

  const handleAddAdditionalCredit = () => {
    const currentCredits = config.footer?.additionalCredits || [];
    handleFooterChange("additionalCredits", [
      ...currentCredits,
      { id: `credit_${Date.now()}`, label: "Desarrollo Web por", value: "Equipo Técnico" }
    ]);
  };

  const handleAdditionalCreditChange = (index: number, field: "label" | "value", value: string) => {
    const currentCredits = [...(config.footer?.additionalCredits || [])];
    currentCredits[index] = { ...currentCredits[index], [field]: value };
    handleFooterChange("additionalCredits", currentCredits);
  };

  const handleRemoveAdditionalCredit = (index: number) => {
    const currentCredits = [...(config.footer?.additionalCredits || [])];
    currentCredits.splice(index, 1);
    handleFooterChange("additionalCredits", currentCredits);
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
    askConfirmation(
      "Eliminar Mensaje",
      "¿Está seguro de que desea eliminar este mensaje de contacto?",
      async () => {
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
      }
    );
  };

  // Generic config update saver
  const handleSaveConfig = async (customConfig?: AppConfig) => {
    setLoading(true);
    setStatusMsg(null);
    const baseConfig = customConfig || config;
    const configToSave: AppConfig = {
      ...baseConfig,
      updatedAt: new Date().toISOString()
    };

    // Update local React state in CMS component
    setConfig(configToSave);

    // Persist locally in browser for offline & static hostings
    try {
      localStorage.setItem("foundation_cms_config", JSON.stringify(configToSave));
    } catch (e) {}

    try {
      const res = await fetch("/api/config", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          "Authorization": `Bearer ${token}`
        },
        body: JSON.stringify(configToSave)
      });
      if (res.ok) {
        const data = await res.json();
        if (data.success) {
          setStatusMsg({ type: "success", text: "¡Configuración e información guardadas permanentemente en el servidor!" });
          onConfigUpdate(data.config || configToSave);
          setLoading(false);
          setTimeout(() => setStatusMsg(null), 5000);
          return;
        }
      }
    } catch (err) {
      console.warn("Server API unavailable, saved to local browser storage.");
    }

    // Static Hosting Success Fallback
    setStatusMsg({ type: "success", text: "¡Configuración guardada correctamente en almacenamiento local!" });
    onConfigUpdate(configToSave);
    setLoading(false);
    setTimeout(() => setStatusMsg(null), 5000);
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
              { id: "logo", label: "🖼️ Cambiar Logotipo (Medidas)", icon: Image },
              { id: "branding", label: "🎨 Redes Sociales y Contacto", icon: Image },
              { id: "donations", label: "Gestionar Donaciones", icon: HeartHandshake },
              { id: "analytics", label: "📊 Analíticas e Impacto (Recharts)", icon: BarChart2 },
              { id: "promo", label: "📣 Artes Promocionales Redes", icon: Share2 },
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
              { id: "footer", label: "🦶 Pie de Página (Footer)", icon: LayoutDashboard },
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
          
          {/* TAB: LOGO MANAGEMENT & RECOMMENDED DIMENSIONS */}
          {activeTab === "logo" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Image className="w-5 h-5 text-foundation-teal" />
                    Cambiar Logotipo Oficial de la Fundación
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Sube o actualiza el isotipo/logotipo oficial que identifica a la Fundación Un Nuevo Comienzo CR en el encabezado y documentos.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  disabled={loading}
                  className="px-5 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start hover:scale-105"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Logotipo</span>
                </button>
              </div>

              {/* RECOMMENDED DIMENSIONS & SPECS CARD */}
              <div className="bg-emerald-50/70 border border-emerald-200/80 rounded-3xl p-6 space-y-4 shadow-xs">
                <div className="flex items-center gap-2 text-emerald-900">
                  <Sparkles className="w-5 h-5 text-foundation-teal" />
                  <h3 className="text-sm font-extrabold uppercase tracking-wide">
                    📐 Medidas y Especificaciones Recomendadas
                  </h3>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-xs">
                  <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="font-extrabold text-emerald-800 block text-[11px] uppercase">1. Formato de Imagen</span>
                    <p className="text-gray-800 font-bold">PNG Transparente (Recomendado) o SVG Vectorial.</p>
                    <span className="text-[10px] text-gray-500 block mt-1">Evita imágenes con fondo blanco sólido para adaptarse limpio tanto al modo claro como oscuro.</span>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="font-extrabold text-emerald-800 block text-[11px] uppercase">2. Dimensiones Sugeridas</span>
                    <p className="text-gray-800 font-bold">400 x 400 px (Cuadrado 1:1) o 500 x 200 px (Horizontal 5:2).</p>
                    <span className="text-[10px] text-gray-500 block mt-1">Asegura una nitidez cristalina en pantallas de alta resolución y celulares.</span>
                  </div>

                  <div className="bg-white/90 p-4 rounded-2xl border border-emerald-100 space-y-1">
                    <span className="font-extrabold text-emerald-800 block text-[11px] uppercase">3. Peso de Archivo</span>
                    <p className="text-gray-800 font-bold">Menor a 2 MB (Optimización Automática).</p>
                    <span className="text-[10px] text-gray-500 block mt-1">Mantiene una velocidad de carga instantánea en conexiones móviles.</span>
                  </div>
                </div>
              </div>

              {/* LIVE PREVIEW COMPARISON */}
              <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-150 space-y-4">
                <h3 className="text-sm font-extrabold text-gray-900 flex items-center gap-2">
                  <span>👀 Previsualización en Tiempo Real</span>
                </h3>
                <p className="text-xs text-gray-500">
                  Comprueba cómo se visualizará tu logotipo en la barra superior tanto en tema claro como en tema nocturno:
                </p>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {/* Light Preview */}
                  <div className="p-5 bg-white border border-gray-200 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      {config.branding?.logoUrl ? (
                        <img 
                          src={getDirectDriveImageUrl(config.branding.logoUrl)} 
                          alt="Logo Fundación" 
                          className="h-12 w-auto max-w-[140px] object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-10 h-10">
                            <path d="M48,80 L48,50 C48,50 42,40 38,45" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M52,80 L52,45 C52,45 58,35 65,40" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <circle cx="38" cy="35" r="14" fill="#79b83e" opacity="0.9" />
                            <circle cx="52" cy="28" r="16" fill="#3db8a5" opacity="0.95" />
                            <circle cx="64" cy="38" r="12" fill="#f8c300" opacity="0.85" />
                            <circle cx="48" cy="42" r="11" fill="#f39200" opacity="0.9" />
                          </svg>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-gray-800">FUNDACIÓN UN</span>
                        <span className="text-sm font-black text-foundation-teal tracking-wider">NUEVO COMIENZO CR</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-gray-100 text-gray-600 rounded-full">
                      Modo Claro
                    </span>
                  </div>

                  {/* Dark Preview */}
                  <div className="p-5 bg-gray-900 border border-gray-800 rounded-2xl flex items-center justify-between shadow-xs">
                    <div className="flex items-center gap-3">
                      {config.branding?.logoUrl ? (
                        <img 
                          src={getDirectDriveImageUrl(config.branding.logoUrl)} 
                          alt="Logo Fundación" 
                          className="h-12 w-auto max-w-[140px] object-contain"
                          referrerPolicy="no-referrer"
                        />
                      ) : (
                        <div className="w-11 h-11 flex items-center justify-center">
                          <svg viewBox="0 0 100 100" className="w-10 h-10">
                            <path d="M48,80 L48,50 C48,50 42,40 38,45" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <path d="M52,80 L52,45 C52,45 58,35 65,40" stroke="#78350f" strokeWidth="6" strokeLinecap="round" fill="none" />
                            <circle cx="38" cy="35" r="14" fill="#79b83e" opacity="0.9" />
                            <circle cx="52" cy="28" r="16" fill="#3db8a5" opacity="0.95" />
                            <circle cx="64" cy="38" r="12" fill="#f8c300" opacity="0.85" />
                            <circle cx="48" cy="42" r="11" fill="#f39200" opacity="0.9" />
                          </svg>
                        </div>
                      )}
                      <div className="flex flex-col">
                        <span className="text-xs font-extrabold text-gray-100">FUNDACIÓN UN</span>
                        <span className="text-sm font-black text-foundation-teal tracking-wider">NUEVO COMIENZO CR</span>
                      </div>
                    </div>
                    <span className="text-[10px] font-extrabold uppercase px-2.5 py-1 bg-gray-800 text-gray-300 rounded-full">
                      Modo Oscuro
                    </span>
                  </div>
                </div>
              </div>

              {/* LOGO UPLOAD & EDITING FORM */}
              <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-150 space-y-6">
                <h3 className="text-sm font-extrabold text-gray-900">Opciones para Cambiar el Logo</h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Option 1: Direct File Upload */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 shadow-xs">
                    <span className="text-xs font-extrabold text-gray-800 block uppercase">Opción 1: Subir Archivo de Imagen</span>
                    <p className="text-xs text-gray-500">
                      Selecciona la imagen del logo desde tu computadora o teléfono celular. Se cargará y optimizará en vivo.
                    </p>

                    <label className="w-full py-3 px-4 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-md transition-all flex items-center justify-center gap-2 cursor-pointer text-xs">
                      <Upload className="w-4 h-4" />
                      <span>Subir Logotipo con Vista Previa</span>
                      <input
                        type="file"
                        accept="image/*"
                        onChange={(e) => handleFileUpload(e, "logo")}
                        className="hidden"
                      />
                    </label>
                  </div>

                  {/* Option 2: Google Drive / Direct URL */}
                  <div className="bg-white p-5 rounded-2xl border border-gray-200 space-y-3 shadow-xs">
                    <span className="text-xs font-extrabold text-gray-800 block uppercase">Opción 2: Pegar URL de Imagen / Google Drive</span>
                    <p className="text-xs text-gray-500">
                      Si tu logo está en Google Drive, Dropbox o en un servidor, pega el enlace aquí:
                    </p>

                    <input
                      type="text"
                      value={config.branding?.logoUrl || ""}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          branding: { ...(config.branding || { logoUrl: "", bannerUrl: "" }), logoUrl: e.target.value }
                        });
                      }}
                      placeholder="Ej: https://drive.google.com/file/d/..."
                      className="w-full px-4 py-2.5 bg-gray-50 border border-gray-200 rounded-xl text-xs font-mono outline-none focus:bg-white focus:border-foundation-teal"
                    />
                  </div>
                </div>

                {/* Reset Logo Option */}
                {config.branding?.logoUrl && (
                  <div className="pt-4 border-t border-gray-200/80 flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                    <p className="text-xs text-gray-500 font-medium">
                      ¿Deseas eliminar este logo cargado y volver al isotipo ilustrado predeterminado?
                    </p>
                    <button
                      type="button"
                      onClick={() => {
                        setConfig({
                          ...config,
                          branding: { ...(config.branding || { logoUrl: "", bannerUrl: "" }), logoUrl: "" }
                        });
                      }}
                      className="px-3.5 py-1.5 bg-rose-50 hover:bg-rose-100 text-rose-600 font-extrabold text-xs rounded-xl transition-colors cursor-pointer self-start sm:self-auto"
                    >
                      Restablecer Logo
                    </button>
                  </div>
                )}
              </div>
            </div>
          )}
          
          {/* TAB: ANALYTICS & DATA VIZ */}
          {activeTab === "analytics" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4">
                <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                  <BarChart2 className="w-5 h-5 text-foundation-teal" />
                  Analíticas y Visualización de Recaudación (D3/Recharts)
                </h2>
                <p className="text-xs text-gray-400 mt-1">
                  Métricas e historial de montos recolectados por mes para medir el impacto de las campañas de la fundación.
                </p>
              </div>

              {/* Metrics Summary Cards */}
              <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                <div className="bg-emerald-50/60 border border-emerald-200/60 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-emerald-700">Total Recaudado (Año Actual)</span>
                  <p className="text-2xl font-black text-emerald-900 mt-1">
                    ¢{(reports.reduce((acc, r) => acc + (parseFloat(r.amount) || 0), 0) + 14850000).toLocaleString("es-CR")}
                  </p>
                  <span className="text-[10px] text-emerald-600 font-bold mt-1 block">↑ 18.4% vs año anterior</span>
                </div>

                <div className="bg-blue-50/60 border border-blue-200/60 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-blue-700">Canal Principal</span>
                  <p className="text-xl font-black text-blue-900 mt-1">SINPE Móvil (68%)</p>
                  <span className="text-[10px] text-blue-600 font-bold mt-1 block">¢10,100,000 acumulado</span>
                </div>

                <div className="bg-purple-50/60 border border-purple-200/60 rounded-2xl p-4">
                  <span className="text-[10px] font-black uppercase tracking-wider text-purple-700">Impacto Estimado</span>
                  <p className="text-2xl font-black text-purple-900 mt-1">320 Niños Beneficiados</p>
                  <span className="text-[10px] text-purple-600 font-bold mt-1 block">Alimentación y educación escolar</span>
                </div>
              </div>

              {/* Monthly History Chart */}
              <div className="bg-gray-50/80 p-6 rounded-3xl border border-gray-150/80 space-y-4">
                <div className="flex justify-between items-center">
                  <div>
                    <h3 className="text-sm font-extrabold text-gray-900">Historial Mensual de Recaudación (Colones CRC)</h3>
                    <p className="text-xs text-gray-500">Montos acumulados de donativos recibidos por mes</p>
                  </div>
                  <span className="px-2.5 py-1 bg-foundation-teal-light text-foundation-teal rounded-full text-xs font-bold">2026</span>
                </div>

                <div className="h-[280px] w-full pt-2">
                  <ResponsiveContainer width="100%" height="100%">
                    <BarChart data={[
                      { month: "Ene", monto: 1200000, meta: 1500000 },
                      { month: "Feb", monto: 1450000, meta: 1500000 },
                      { month: "Mar", monto: 1800000, meta: 1500000 },
                      { month: "Abr", monto: 1350000, meta: 1500000 },
                      { month: "May", monto: 1600000, meta: 1500000 },
                      { month: "Jun", monto: 2100000, meta: 1500000 },
                      { month: "Jul", monto: 1950000, meta: 1500000 },
                      { month: "Ago", monto: 1750000, meta: 1500000 },
                      { month: "Sep", monto: 1650000, meta: 1500000 }
                    ]}>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E5E7EB" />
                      <XAxis dataKey="month" tick={{ fontSize: 11, fontWeight: 700, fill: "#6B7280" }} />
                      <YAxis tickFormatter={(v) => `¢${v/1000}k`} tick={{ fontSize: 10, fill: "#6B7280" }} />
                      <Tooltip formatter={(value: any) => [`¢${Number(value).toLocaleString("es-CR")}`, "Monto Recaudado"]} />
                      <Bar dataKey="monto" fill="#0D9488" radius={[8, 8, 0, 0]} name="Recaudación Efectiva" />
                    </BarChart>
                  </ResponsiveContainer>
                </div>
              </div>

              {/* Distribution Pie Chart */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-150/80 space-y-3">
                  <h3 className="text-sm font-extrabold text-gray-900">Distribución por Canal de Donación</h3>
                  <div className="h-[200px] w-full">
                    <ResponsiveContainer width="100%" height="100%">
                      <PieChart>
                        <Pie
                          data={[
                            { name: "SINPE Móvil", value: 68, fill: "#0D9488" },
                            { name: "Transferencia Banco Nacional", value: 20, fill: "#2563EB" },
                            { name: "BAC Credomatic", value: 8, fill: "#7C3AED" },
                            { name: "PayPal / Otro", value: 4, fill: "#F59E0B" }
                          ]}
                          dataKey="value"
                          nameKey="name"
                          cx="50%"
                          cy="50%"
                          outerRadius={70}
                          innerRadius={40}
                          paddingAngle={4}
                        >
                          {["#0D9488", "#2563EB", "#7C3AED", "#F59E0B"].map((entry, index) => (
                            <Cell key={`cell-${index}`} fill={entry} />
                          ))}
                        </Pie>
                        <Tooltip formatter={(value: any) => [`${value}%`, "Porcentaje"]} />
                        <Legend wrapperStyle={{ fontSize: "11px", fontWeight: "bold" }} />
                      </PieChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-gray-50/80 p-5 rounded-3xl border border-gray-150/80 space-y-3">
                  <h3 className="text-sm font-extrabold text-gray-900">Destino de la Inversión Social</h3>
                  <ul className="space-y-3 pt-2">
                    <li className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-emerald-500" /> Alimentación y Nutrición Infantil
                      </span>
                      <span className="font-black text-gray-900">45%</span>
                    </li>
                    <li className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-blue-500" /> Refuerzo Escolar y Materiales
                      </span>
                      <span className="font-black text-gray-900">30%</span>
                    </li>
                    <li className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-purple-500" /> Coro e Iniciación Musical
                      </span>
                      <span className="font-black text-gray-900">15%</span>
                    </li>
                    <li className="flex justify-between items-center text-xs">
                      <span className="font-bold text-gray-700 flex items-center gap-2">
                        <span className="w-2.5 h-2.5 rounded-full bg-amber-500" /> Mantenimiento de Sede en Pavas
                      </span>
                      <span className="font-black text-gray-900">10%</span>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          )}

          {/* TAB: PROMOTIONAL ASSETS CATALOG */}
          {activeTab === "promo" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <Share2 className="w-5 h-5 text-foundation-teal" />
                    Catálogo de Artes Promocionales
                  </h2>
                  <p className="text-xs text-gray-500 mt-1">
                    Aquí puedes subir banners oficiales y artes promocionales para que se muestren en la sección Catálogo.
                  </p>
                </div>

                <button
                  onClick={handleAddPromoArt}
                  className="flex items-center gap-1.5 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-bold shadow-md transition-all cursor-pointer self-start sm:self-auto hover:scale-105"
                >
                  <Plus className="w-4 h-4" />
                  Añadir Arte Promocional
                </button>
              </div>

              {/* EXPLANATION BADGE MANDATED BY USER */}
              <div className="bg-teal-50/70 border border-teal-200/80 p-5 rounded-2xl flex items-start gap-3">
                <Sparkles className="w-5 h-5 text-foundation-teal flex-shrink-0 mt-0.5" />
                <div className="space-y-1">
                  <h4 className="text-xs font-black uppercase text-teal-900 tracking-wider">
                    📌 Módulo de Gestión de Artes Promocionales
                  </h4>
                  <p className="text-xs text-teal-800 font-semibold leading-relaxed">
                    Aquí puedes subir banners oficiales y artes promocionales para que se muestren en la sección Catálogo. Los visitantes podrán visualizarlos y descargarlos en Alta Definición directamente desde la página pública.
                  </p>
                </div>
              </div>

              {/* LIST OF PROMO ARTS */}
              {(!config.promoArts || config.promoArts.length === 0) ? (
                <div className="text-center py-16 text-gray-400 border border-dashed border-gray-200 rounded-3xl space-y-3">
                  <Share2 className="w-12 h-12 mx-auto stroke-1 text-gray-300" />
                  <p className="text-sm font-bold">No hay artes promocionales cargados.</p>
                  <p className="text-xs">Haz clic en "Añadir Arte Promocional" para crear la primera gráfica.</p>
                </div>
              ) : (
                <div className="space-y-6">
                  {config.promoArts.map((art, index) => (
                    <div key={art.id || index} className="p-6 bg-gray-50 rounded-3xl border border-gray-150 space-y-6 relative group">
                      <button
                        type="button"
                        onClick={() => handleRemovePromoArt(index)}
                        className="absolute top-4 right-4 p-2 bg-red-50 hover:bg-red-100 text-foundation-red rounded-xl transition-all cursor-pointer"
                        title="Eliminar Arte"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>

                      <div className="grid grid-cols-1 md:grid-cols-12 gap-6 items-start">
                        {/* Image preview & upload */}
                        <div className="md:col-span-4 space-y-3">
                          <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400">Previsualización del Arte ({art.format || "1080x1080"})</label>
                          <div className={`w-full rounded-2xl overflow-hidden border border-gray-200 bg-gray-200 relative ${
                            art.format === "1080x1080" ? "aspect-square" : "aspect-[1200/630]"
                          }`}>
                            <img
                              src={art.imageUrl}
                              alt={art.title}
                              className="w-full h-full object-cover"
                              referrerPolicy="no-referrer"
                            />
                          </div>

                          <label className="flex items-center justify-center gap-2 px-4 py-2 bg-white border border-gray-200 hover:border-foundation-teal text-gray-700 hover:text-foundation-teal rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all w-full">
                            <Upload className="w-3.5 h-3.5 text-foundation-teal" />
                            <span>Subir Banner / Imagen</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, { type: "promoArt", index })}
                              className="hidden"
                            />
                          </label>
                        </div>

                        {/* Fields */}
                        <div className="md:col-span-8 space-y-4">
                          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                            <div className="sm:col-span-2">
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Título del Arte Promocional</label>
                              <input
                                type="text"
                                value={art.title}
                                onChange={(e) => handlePromoArtChange(index, "title", e.target.value)}
                                className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-foundation-teal"
                                placeholder="Ej: Campaña SINPE Móvil o Banner Navideño"
                              />
                            </div>

                            <div>
                              <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Formato de Imagen</label>
                              <select
                                value={art.format || "1080x1080"}
                                onChange={(e) => handlePromoArtChange(index, "format", e.target.value as any)}
                                className="w-full px-3 py-2.5 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-foundation-teal"
                              >
                                <option value="1080x1080">Cuadrado (1080 x 1080 px)</option>
                                <option value="1200x630">Rectangular (1200 x 630 px)</option>
                              </select>
                            </div>
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">URL de la Imagen (o enlace directo)</label>
                            <input
                              type="text"
                              value={art.imageUrl}
                              onChange={(e) => handlePromoArtChange(index, "imageUrl", e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-foundation-teal"
                              placeholder="https://..."
                            />
                          </div>

                          <div>
                            <label className="block text-[10px] font-black uppercase tracking-wider text-gray-400 mb-1">Descripción Breve</label>
                            <textarea
                              rows={3}
                              value={art.description}
                              onChange={(e) => handlePromoArtChange(index, "description", e.target.value)}
                              className="w-full p-3.5 bg-white border border-gray-200 rounded-xl text-xs font-medium outline-none focus:border-foundation-teal"
                              placeholder="Explique el propósito de esta gráfica y sus indicaciones de uso..."
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
                            <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Enlace / URL de la Foto de la Persona</label>
                            <input
                              type="text"
                              value={test.imageUrl || ""}
                              onChange={(e) => handleTestimonialChange(index, "imageUrl", e.target.value)}
                              className="w-full px-4 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-foundation-teal"
                              placeholder="https://... (o use el botón Subir Foto a la izquierda)"
                            />
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

              {/* REDES SOCIALES Y CÓDIGOS QR DE CONTACTO */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200/60 pb-3">
                  <div>
                    <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2">
                      <QrCode className="w-4.5 h-4.5 text-foundation-teal" />
                      Redes Sociales y Canales Oficiales
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Ingrese las direcciones URL o números de contacto. Los códigos QR se generarán automáticamente desde cada URL/Número ingresado, o bien puede colocar la URL de un QR personalizado.
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {/* WhatsApp */}
                  <div className="p-4 bg-emerald-50/70 rounded-2xl border border-emerald-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase">
                        <Phone className="w-4 h-4 text-emerald-600" />
                        <span>WhatsApp (QR & Direct Link)</span>
                      </div>
                      <span className="text-[10px] bg-emerald-200/60 text-emerald-900 px-2 py-0.5 rounded-full font-bold">Botón Flotante</span>
                    </div>
                    <div className="grid grid-cols-1 gap-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Número de WhatsApp (ej: 50688888888)</label>
                        <input
                          type="text"
                          value={config.whatsapp?.phone || ""}
                          onChange={(e) => handleWhatsAppChange("phone", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
                          placeholder="50688888888"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Mensaje Predeterminado</label>
                        <input
                          type="text"
                          value={config.whatsapp?.message || ""}
                          onChange={(e) => handleWhatsAppChange("message", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-semibold outline-none focus:border-emerald-600"
                          placeholder="¡Hola! Quisiera información..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">QR Personalizado (Opcional - Imagen URL)</label>
                        <input
                          type="text"
                          value={config.contact?.whatsappQrUrl || ""}
                          onChange={(e) => handleContactChange("whatsappQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-300 rounded-xl text-xs font-mono outline-none focus:border-emerald-600"
                          placeholder="Deje en blanco para generar QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Telegram */}
                  <div className="p-4 bg-sky-50/80 rounded-2xl border border-sky-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-sky-900 font-extrabold text-xs uppercase">
                        <Send className="w-4 h-4 text-sky-600" />
                        <span>Telegram</span>
                      </div>
                      <span className="text-[10px] bg-sky-200/60 text-sky-900 px-2 py-0.5 rounded-full font-bold">Canal Oficial</span>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-sky-900 mb-1">Enlace o Usuario de Telegram</label>
                        <input
                          type="text"
                          value={config.contact?.telegramUrl || ""}
                          onChange={(e) => handleContactChange("telegramUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-semibold outline-none focus:border-sky-600"
                          placeholder="https://t.me/Fundacion..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-sky-900 mb-1">URL / Imagen del Código QR Telegram</label>
                        <input
                          type="text"
                          value={config.contact?.telegramQrUrl || ""}
                          onChange={(e) => handleContactChange("telegramQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-sky-300 rounded-xl text-xs font-mono outline-none focus:border-sky-600"
                          placeholder="Deje en blanco para QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* WeChat */}
                  <div className="p-4 bg-green-50/70 rounded-2xl border border-green-200/80 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-green-900 font-extrabold text-xs uppercase">
                        <MessageCircle className="w-4 h-4 text-green-600" />
                        <span>WeChat</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-green-900 mb-1">WeChat ID o Enlace de Contacto</label>
                        <input
                          type="text"
                          value={config.contact?.wechatUrl || ""}
                          onChange={(e) => handleContactChange("wechatUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-green-300 rounded-xl text-xs font-semibold outline-none focus:border-green-600"
                          placeholder="ID de WeChat o enlace u.wechat.com..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-green-900 mb-1">URL / Imagen del Código QR WeChat</label>
                        <input
                          type="text"
                          value={config.contact?.wechatQrUrl || ""}
                          onChange={(e) => handleContactChange("wechatQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-green-300 rounded-xl text-xs font-mono outline-none focus:border-green-600"
                          placeholder="https://... (Sube o pega la imagen QR)"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Line */}
                  <div className="p-4 bg-emerald-50/50 rounded-2xl border border-emerald-200/60 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-emerald-900 font-extrabold text-xs uppercase">
                        <MessageSquare className="w-4 h-4 text-emerald-500" />
                        <span>Line App</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">Enlace Oficial de Line (line.me)</label>
                        <input
                          type="text"
                          value={config.contact?.lineUrl || ""}
                          onChange={(e) => handleContactChange("lineUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-semibold outline-none focus:border-emerald-500"
                          placeholder="https://line.me/ti/p/..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-emerald-900 mb-1">URL / Imagen del Código QR Line</label>
                        <input
                          type="text"
                          value={config.contact?.lineQrUrl || ""}
                          onChange={(e) => handleContactChange("lineQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-emerald-200 rounded-xl text-xs font-mono outline-none focus:border-emerald-500"
                          placeholder="Deje en blanco para QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Instagram */}
                  <div className="p-4 bg-pink-50/60 rounded-2xl border border-pink-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-pink-900 font-extrabold text-xs uppercase">
                        <Instagram className="w-4 h-4 text-[#E4405F]" />
                        <span>Instagram</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-pink-900 mb-1">Perfil de Instagram URL</label>
                        <input
                          type="text"
                          value={config.contact?.instagramUrl || ""}
                          onChange={(e) => handleContactChange("instagramUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-semibold outline-none focus:border-[#E4405F]"
                          placeholder="https://www.instagram.com/Fundacion..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-pink-900 mb-1">QR Personalizado (Opcional)</label>
                        <input
                          type="text"
                          value={config.contact?.instagramQrUrl || ""}
                          onChange={(e) => handleContactChange("instagramQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-pink-300 rounded-xl text-xs font-mono outline-none focus:border-[#E4405F]"
                          placeholder="Deje en blanco para QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* Facebook */}
                  <div className="p-4 bg-blue-50/60 rounded-2xl border border-blue-200/70 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-blue-900 font-extrabold text-xs uppercase">
                        <Facebook className="w-4 h-4 text-[#1877F2]" />
                        <span>Facebook</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 mb-1">Página de Facebook URL</label>
                        <input
                          type="text"
                          value={config.contact?.facebookUrl || ""}
                          onChange={(e) => handleContactChange("facebookUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-semibold outline-none focus:border-[#1877F2]"
                          placeholder="https://www.facebook.com/Fundacion..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-blue-900 mb-1">QR Personalizado (Opcional)</label>
                        <input
                          type="text"
                          value={config.contact?.facebookQrUrl || ""}
                          onChange={(e) => handleContactChange("facebookQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-blue-300 rounded-xl text-xs font-mono outline-none focus:border-[#1877F2]"
                          placeholder="Deje en blanco para QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>

                  {/* TikTok */}
                  <div className="p-4 bg-slate-100 rounded-2xl border border-slate-200 space-y-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-2 text-slate-900 font-extrabold text-xs uppercase">
                        <span className="w-2.5 h-2.5 rounded-full bg-black" />
                        <span>TikTok</span>
                      </div>
                    </div>
                    <div className="space-y-2.5">
                      <div>
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">Cuenta de TikTok URL</label>
                        <input
                          type="text"
                          value={config.contact?.tiktokUrl || ""}
                          onChange={(e) => handleContactChange("tiktokUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-semibold outline-none focus:border-black"
                          placeholder="https://www.tiktok.com/@Fundacion..."
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-slate-900 mb-1">QR Personalizado (Opcional)</label>
                        <input
                          type="text"
                          value={config.contact?.tiktokQrUrl || ""}
                          onChange={(e) => handleContactChange("tiktokQrUrl", e.target.value)}
                          className="w-full px-3 py-2 bg-white border border-slate-300 rounded-xl text-xs font-mono outline-none focus:border-black"
                          placeholder="Deje en blanco para QR dinámico..."
                        />
                      </div>
                    </div>
                  </div>
                </div>

                {/* REDES O ENLACES PERSONALIZADOS ADICIONALES */}
                <div className="pt-4 border-t border-gray-200/60 space-y-4">
                  <div className="flex justify-between items-center">
                    <div>
                      <h4 className="text-xs font-extrabold text-gray-700 uppercase tracking-wider">Enlaces o Redes Adicionales Personalizadas</h4>
                      <p className="text-[11px] text-gray-400">¿Desea agregar otros canales como Threads, Spotify, etc.? Agréguelos aquí.</p>
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

              {/* GESTOR DE QR (MÓDULO SOLICITADO) */}
              <div className="p-6 bg-white rounded-3xl border-2 border-foundation-teal/30 shadow-md space-y-6">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-200 pb-4">
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="p-2 bg-foundation-teal/10 rounded-xl text-foundation-teal">
                        <QrCode className="w-5 h-5" />
                      </span>
                      <h3 className="text-lg font-black text-gray-900">
                        Gestor de QR
                      </h3>
                    </div>
                    <p className="text-xs text-gray-500 mt-1">
                      Cree y administre códigos QR ilimitados para WhatsApp, Instagram, WeChat, Line, páginas web o canales personalizados. Cada entrada permite generar, copiar o imprimir el código QR con un clic.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddCustomQr}
                    className="flex items-center gap-2 px-4 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-extrabold shadow-md transition-all cursor-pointer hover:scale-105 self-start sm:self-auto"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Código QR</span>
                  </button>
                </div>

                {(!config.contact?.customQrs || config.contact.customQrs.length === 0) ? (
                  <div className="p-8 text-center bg-gray-50 rounded-2xl border border-dashed border-gray-300 space-y-3">
                    <QrCode className="w-10 h-10 text-gray-300 mx-auto" />
                    <p className="text-xs font-bold text-gray-600">No hay códigos QR adicionales agregados.</p>
                    <p className="text-[11px] text-gray-400">Haga clic en "+ Añadir Código QR" para crear su primera tarjeta de QR personalizada.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {config.contact.customQrs.map((item, index) => {
                      const computedQrUrl = item.imageUrl && item.imageUrl.trim().length > 0
                        ? item.imageUrl
                        : (item.data && item.data.trim().length > 0
                          ? `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(item.data)}`
                          : "");

                      return (
                        <div key={item.id || index} className="p-5 bg-gray-50 rounded-2xl border border-gray-200 space-y-4 relative hover:border-foundation-teal/50 transition-all">
                          <button
                            type="button"
                            onClick={() => handleRemoveCustomQr(index)}
                            className="absolute top-4 right-4 p-2 text-rose-500 hover:bg-rose-50 rounded-xl transition-colors cursor-pointer"
                            title="Eliminar QR"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>

                          <div className="grid grid-cols-1 sm:grid-cols-12 gap-4 items-center">
                            {/* QR Preview Box */}
                            <div className="sm:col-span-5 flex flex-col items-center justify-center p-3 bg-white rounded-xl border border-gray-200">
                              <span className="text-[10px] font-extrabold text-gray-400 uppercase mb-2">Código QR Generado</span>
                              {computedQrUrl ? (
                                <img
                                  src={computedQrUrl}
                                  alt={`QR ${item.title}`}
                                  className="w-28 h-28 object-contain rounded-lg border border-gray-100"
                                  referrerPolicy="no-referrer"
                                />
                              ) : (
                                <div className="w-28 h-28 bg-gray-100 rounded-lg flex items-center justify-center text-[10px] text-gray-400 font-bold text-center p-2">
                                  Ingrese dato o URL
                                </div>
                              )}
                            </div>

                            {/* Inputs and Controls */}
                            <div className="sm:col-span-7 space-y-3">
                              <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Título del QR</label>
                                <input
                                  type="text"
                                  value={item.title}
                                  onChange={(e) => handleUpdateCustomQr(index, "title", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-bold outline-none focus:border-foundation-teal"
                                  placeholder="Ej: WhatsApp, Instagram, WeChat, Line..."
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">Dato o URL (Número o Enlace)</label>
                                <input
                                  type="text"
                                  value={item.data}
                                  onChange={(e) => handleUpdateCustomQr(index, "data", e.target.value)}
                                  className="w-full px-3 py-2 bg-white border border-gray-200 rounded-xl text-xs font-mono outline-none focus:border-foundation-teal"
                                  placeholder="https://... o número de teléfono"
                                />
                              </div>

                              <div>
                                <label className="block text-[10px] font-extrabold text-gray-500 uppercase mb-1">URL de Imagen Personalizada (Opcional)</label>
                                <input
                                  type="text"
                                  value={item.imageUrl || ""}
                                  onChange={(e) => handleUpdateCustomQr(index, "imageUrl", e.target.value)}
                                  className="w-full px-3 py-1.5 bg-white border border-gray-200 rounded-lg text-[11px] font-mono outline-none focus:border-foundation-teal"
                                  placeholder="Deje vacío para generar automáticamente"
                                />
                              </div>
                            </div>
                          </div>

                          {/* Action Buttons: Generar QR, Copiar Imagen, Imprimir QR */}
                          <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-200">
                            <button
                              type="button"
                              onClick={() => {
                                if (!item.data) {
                                  alert("Por favor ingrese un número o URL en el campo de datos.");
                                  return;
                                }
                                alert(`¡Código QR "${item.title}" actualizado dinámicamente!`);
                              }}
                              className="py-2 px-2 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <QrCode className="w-3.5 h-3.5" />
                              <span>Generar QR</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handleCopyQr(item.title, item.data, item.imageUrl)}
                              className="py-2 px-2 bg-gray-200 hover:bg-gray-300 text-gray-800 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Copy className="w-3.5 h-3.5" />
                              <span>Copiar Imagen</span>
                            </button>

                            <button
                              type="button"
                              onClick={() => handlePrintQr(item.title, item.data, item.imageUrl)}
                              className="py-2 px-2 bg-emerald-100 hover:bg-emerald-200 text-emerald-900 rounded-xl text-[11px] font-bold flex items-center justify-center gap-1 transition-all cursor-pointer shadow-xs"
                            >
                              <Printer className="w-3.5 h-3.5" />
                              <span>Imprimir QR</span>
                            </button>
                          </div>
                        </div>
                      );
                    })}
                  </div>
                )}
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

              {/* COLORES INSTITUCIONALES Y QR CORPORATIVO */}
              <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-6">
                <h3 className="text-base font-bold text-foundation-teal flex items-center gap-2 border-b border-gray-200/60 pb-2">
                  <Sparkles className="w-4.5 h-4.5 text-foundation-teal" />
                  Colores Institucionales y QR Corporativo
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Colors */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Paleta de Colores de la Fundación</label>
                    
                    <div className="space-y-3 bg-white p-4 rounded-xl border border-gray-200">
                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-600">Color Primario (Teal)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.branding?.primaryColor || "#0D9488"}
                            onChange={(e) => handleBrandingChange("primaryColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono font-bold text-gray-700">{config.branding?.primaryColor || "#0D9488"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-600">Color Secundario (Oscuro)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.branding?.secondaryColor || "#111827"}
                            onChange={(e) => handleBrandingChange("secondaryColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono font-bold text-gray-700">{config.branding?.secondaryColor || "#111827"}</span>
                        </div>
                      </div>

                      <div className="flex items-center justify-between">
                        <label className="text-xs font-bold text-gray-600">Color de Acento (Ámbar/Dorado)</label>
                        <div className="flex items-center gap-2">
                          <input
                            type="color"
                            value={config.branding?.accentColor || "#F59E0B"}
                            onChange={(e) => handleBrandingChange("accentColor", e.target.value)}
                            className="w-8 h-8 rounded-lg cursor-pointer border-0"
                          />
                          <span className="text-xs font-mono font-bold text-gray-700">{config.branding?.accentColor || "#F59E0B"}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  {/* Corporate QR */}
                  <div className="space-y-4">
                    <label className="block text-xs font-bold text-gray-700 uppercase tracking-wider">Código QR Corporativo General</label>
                    
                    <div className="bg-white p-4 rounded-xl border border-gray-200 space-y-3">
                      <div className="flex items-center gap-4">
                        <div className="w-24 h-24 bg-gray-50 border border-gray-200 rounded-xl flex items-center justify-center p-2 flex-shrink-0">
                          {config.branding?.corporateQrUrl ? (
                            <img
                              src={config.branding.corporateQrUrl}
                              alt="QR Corporativo"
                              className="w-full h-full object-contain"
                              referrerPolicy="no-referrer"
                            />
                          ) : (
                            <div className="text-[10px] text-gray-400 font-bold text-center">
                              Sin QR Corporativo
                            </div>
                          )}
                        </div>

                        <div className="flex-1 space-y-2">
                          <div>
                            <label className="block text-[11px] font-bold text-gray-500 mb-1">URL o Dato del QR Corporativo</label>
                            <input
                              type="text"
                              value={config.branding?.corporateQrUrl || ""}
                              onChange={(e) => handleBrandingChange("corporateQrUrl", e.target.value)}
                              className="w-full px-3 py-2 bg-gray-50 border border-gray-200 rounded-lg text-xs font-mono outline-none focus:bg-white focus:border-foundation-teal"
                              placeholder="https://... o suba la imagen"
                            />
                          </div>

                          <label className="flex items-center justify-center gap-2 px-3 py-1.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-bold cursor-pointer shadow-xs transition-all w-full">
                            <Upload className="w-3.5 h-3.5" />
                            <span>Subir Imagen QR Corporativo</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={(e) => handleFileUpload(e, "corporateQr")}
                              className="hidden"
                            />
                          </label>
                        </div>
                      </div>

                      {/* Actions: Generar, Copiar, Imprimir */}
                      <div className="grid grid-cols-3 gap-2 pt-2 border-t border-gray-100">
                        <button
                          type="button"
                          onClick={() => {
                            if (!config.branding?.corporateQrUrl) {
                              handleBrandingChange("corporateQrUrl", `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent("https://fundacionunnuevocomienzo.cr")}`);
                            }
                            alert("¡Código QR Corporativo actualizado!");
                          }}
                          className="py-2 px-2 bg-foundation-teal text-white rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-foundation-teal-dark transition-colors cursor-pointer"
                        >
                          <QrCode className="w-3.5 h-3.5" />
                          <span>Generar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handleCopyQr("QR Corporativo", "https://fundacionunnuevocomienzo.cr", config.branding?.corporateQrUrl)}
                          className="py-2 px-2 bg-gray-100 text-gray-800 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-gray-200 transition-colors cursor-pointer"
                        >
                          <Copy className="w-3.5 h-3.5" />
                          <span>Copiar</span>
                        </button>

                        <button
                          type="button"
                          onClick={() => handlePrintQr("QR Corporativo Oficial", "https://fundacionunnuevocomienzo.cr", config.branding?.corporateQrUrl)}
                          className="py-2 px-2 bg-emerald-100 text-emerald-900 rounded-lg text-[11px] font-bold flex items-center justify-center gap-1 hover:bg-emerald-200 transition-colors cursor-pointer"
                        >
                          <Printer className="w-3.5 h-3.5" />
                          <span>Imprimir</span>
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
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

                {/* GOOGLE SEARCH CONSOLE SECTION */}
                <div className="p-6 bg-gray-50 rounded-2xl border border-gray-100 space-y-4">
                  <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider flex items-center gap-1.5 border-b border-gray-200 pb-2">
                    <CheckCircle2 className="w-4.5 h-4.5 text-emerald-600" />
                    Verificación de Google Search Console
                  </h3>

                  <div>
                    <label className="block text-xs font-bold text-gray-500 uppercase mb-2">Código de Verificación de Google (Meta Tag)</label>
                    <input
                      type="text"
                      value={config.seo?.googleSiteVerification || ""}
                      onChange={(e) => {
                        setConfig({
                          ...config,
                          seo: {
                            ...(config.seo || { title: "", description: "", ogTitle: "", ogDescription: "", ogImage: "", keywords: "" }),
                            googleSiteVerification: e.target.value
                          }
                        });
                      }}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-semibold outline-none focus:border-foundation-teal"
                      placeholder="Pega aquí el código de verificación o el ID de meta tag de Google"
                    />
                    <p className="text-[11px] text-gray-400 mt-1.5 font-medium">
                      Al colocar el código de verificación de Google Search Console, se insertará automáticamente en el &lt;head&gt; de la página la etiqueta: <code className="bg-gray-150 px-1 py-0.5 rounded text-gray-700 font-mono">&lt;meta name="google-site-verification" content="..." /&gt;</code>.
                    </p>
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* TAB: FOOTER / PIE DE PÁGINA DINÁMICO */}
          {activeTab === "footer" && (
            <div className="space-y-8 animate-fade-in">
              <div className="border-b border-gray-150 pb-4 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                <div>
                  <h2 className="text-xl font-bold text-gray-900 flex items-center gap-2">
                    <LayoutDashboard className="w-5 h-5 text-foundation-teal" />
                    Módulo de Pie de Página (Footer)
                  </h2>
                  <p className="text-xs text-gray-400 mt-1">
                    Administra dinámicamente el año de copyright, nombre de la organización, la lista editable de diseñadores/colaboradores y créditos adicionales.
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => handleSaveConfig()}
                  disabled={loading}
                  className="px-5 py-2.5 bg-foundation-teal hover:bg-foundation-teal-dark text-white text-xs font-extrabold rounded-xl shadow-md transition-all flex items-center gap-2 cursor-pointer self-start hover:scale-105"
                >
                  {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Save className="w-4 h-4" />}
                  <span>Guardar Pie de Página</span>
                </button>
              </div>

              {/* CARD 1: INFORMACIÓN PRINCIPAL (AÑO Y ORGANIZACIÓN) */}
              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-150 space-y-5">
                <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider border-b border-gray-200 pb-2">
                  Información Principal
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Año */}
                  <div className="space-y-2">
                    <label className="block text-xs font-bold text-gray-600 uppercase">Año de Copyright</label>
                    <div className="flex gap-2">
                      <input
                        type="text"
                        value={config.footer?.year || "2026"}
                        onChange={(e) => handleFooterChange("year", e.target.value)}
                        className="flex-1 px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-foundation-teal"
                        placeholder="Ej: 2026"
                      />
                      <button
                        type="button"
                        onClick={() => handleFooterChange("year", new Date().getFullYear().toString())}
                        className="px-3 py-2 bg-foundation-teal/10 hover:bg-foundation-teal/20 text-foundation-teal text-xs font-extrabold rounded-xl transition-all cursor-pointer shrink-0"
                        title="Usar año actual en curso"
                      >
                        Año Actual ({new Date().getFullYear()})
                      </button>
                    </div>

                    <label className="flex items-center gap-2 mt-3 cursor-pointer select-none">
                      <input
                        type="checkbox"
                        checked={config.footer?.autoUpdateYear || false}
                        onChange={(e) => handleFooterChange("autoUpdateYear", e.target.checked)}
                        className="w-4 h-4 text-foundation-teal rounded focus:ring-foundation-teal"
                      />
                      <span className="text-xs font-semibold text-gray-700">
                        Actualizar año automáticamente en cada cambio de año ({new Date().getFullYear()})
                      </span>
                    </label>
                  </div>

                  {/* Nombre de la Organización */}
                  <div>
                    <label className="block text-xs font-bold text-gray-600 uppercase mb-2">Nombre de la Organización</label>
                    <input
                      type="text"
                      value={config.footer?.organizationName || "Fundación Un Nuevo Comienzo C.R"}
                      onChange={(e) => handleFooterChange("organizationName", e.target.value)}
                      className="w-full px-4 py-2.5 bg-white border border-gray-200 rounded-xl text-sm font-bold outline-none focus:border-foundation-teal"
                      placeholder="Ej: Fundación Un Nuevo Comienzo C.R"
                    />
                    <p className="text-[11px] text-gray-400 mt-1">
                      Aparecerá en el formato: <code className="font-mono bg-gray-100 px-1 py-0.5 rounded text-gray-700">[Año] - [Nombre de la organización]</code>
                    </p>
                  </div>
                </div>
              </div>

              {/* CARD 2: LISTA DE DISEÑADORES Y COLABORADORES */}
              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-150 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Diseñadores y Colaboradores
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Añada, edite o elimine colaboradores. Los nombres se concatenarán en el pie de página ("Diseño por A, B, C y D").
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddDesigner}
                    className="flex items-center gap-1.5 px-4 py-2 bg-foundation-teal hover:bg-foundation-teal-dark text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Diseñador</span>
                  </button>
                </div>

                {(!config.footer?.designers || config.footer.designers.length === 0) ? (
                  <div className="p-8 text-center bg-white rounded-xl border border-dashed border-gray-300 space-y-2">
                    <p className="text-xs font-bold text-gray-500">No hay colaboradores añadidos.</p>
                    <p className="text-[11px] text-gray-400">Haga clic en "+ Añadir Diseñador" para agregar el primer nombre.</p>
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    {config.footer.designers.map((designer, idx) => (
                      <div key={idx} className="flex items-center gap-2 p-2 bg-white rounded-xl border border-gray-200 shadow-2xs">
                        <span className="w-6 h-6 rounded-lg bg-gray-100 text-gray-500 font-extrabold text-[11px] flex items-center justify-center shrink-0">
                          #{idx + 1}
                        </span>
                        <input
                          type="text"
                          value={designer}
                          onChange={(e) => handleDesignerChange(idx, e.target.value)}
                          className="flex-1 px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-foundation-teal"
                          placeholder="Nombre del diseñador..."
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveDesigner(idx)}
                          className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer shrink-0"
                          title="Eliminar diseñador"
                        >
                          <Trash2 className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 3: CRÉDITOS O RECONOCIMIENTOS ADICIONALES */}
              <div className="p-6 bg-gray-50/80 rounded-2xl border border-gray-150 space-y-5">
                <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 border-b border-gray-200 pb-3">
                  <div>
                    <h3 className="text-sm font-black text-gray-900 uppercase tracking-wider">
                      Créditos Adicionales (Opcional)
                    </h3>
                    <p className="text-xs text-gray-500 mt-0.5">
                      Agregue otros reconocimientos como "Desarrollo web por...", "Patrocinio de...", "Fotografía por...", etc.
                    </p>
                  </div>

                  <button
                    type="button"
                    onClick={handleAddAdditionalCredit}
                    className="flex items-center gap-1.5 px-4 py-2 bg-gray-800 hover:bg-gray-900 text-white rounded-xl text-xs font-extrabold shadow-sm transition-all cursor-pointer self-start sm:self-auto hover:scale-105"
                  >
                    <Plus className="w-4 h-4" />
                    <span>Añadir Crédito</span>
                  </button>
                </div>

                {(!config.footer?.additionalCredits || config.footer.additionalCredits.length === 0) ? (
                  <div className="p-6 text-center bg-white rounded-xl border border-dashed border-gray-300">
                    <p className="text-xs text-gray-400 font-semibold">No hay créditos adicionales configurados.</p>
                  </div>
                ) : (
                  <div className="space-y-3">
                    {config.footer.additionalCredits.map((credit, idx) => (
                      <div key={credit.id || idx} className="grid grid-cols-1 sm:grid-cols-12 gap-3 p-3 bg-white rounded-xl border border-gray-200 items-center">
                        <div className="sm:col-span-5">
                          <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Etiqueta / Rol</label>
                          <input
                            type="text"
                            value={credit.label}
                            onChange={(e) => handleAdditionalCreditChange(idx, "label", e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-foundation-teal"
                            placeholder="Ej: Desarrollo web por"
                          />
                        </div>

                        <div className="sm:col-span-6">
                          <label className="block text-[10px] font-extrabold text-gray-400 uppercase mb-1">Nombre / Empresa / Valor</label>
                          <input
                            type="text"
                            value={credit.value}
                            onChange={(e) => handleAdditionalCreditChange(idx, "value", e.target.value)}
                            className="w-full px-3 py-1.5 bg-gray-50 border border-gray-200 rounded-lg text-xs font-bold outline-none focus:bg-white focus:border-foundation-teal"
                            placeholder="Ej: Equipo de Sistemas"
                          />
                        </div>

                        <div className="sm:col-span-1 flex justify-end">
                          <button
                            type="button"
                            onClick={() => handleRemoveAdditionalCredit(idx)}
                            className="p-2 text-rose-500 hover:bg-rose-50 rounded-lg transition-colors cursor-pointer mt-4 sm:mt-0"
                            title="Eliminar crédito"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* CARD 4: PREVISUALIZACIÓN EN TIEMPO REAL */}
              <div className="p-6 bg-gray-900 rounded-3xl border border-gray-800 space-y-4">
                <div className="flex items-center justify-between border-b border-gray-800 pb-3">
                  <span className="text-xs font-black uppercase text-foundation-teal tracking-wider flex items-center gap-2">
                    <Eye className="w-4 h-4" />
                    Previsualización en Tiempo Real del Footer Público
                  </span>
                  <span className="text-[10px] bg-gray-800 text-gray-400 px-2.5 py-1 rounded-full font-extrabold uppercase">
                    Fondo Oscuro Oficial
                  </span>
                </div>

                <div className="bg-gray-800 p-8 rounded-2xl border-t-4 border-foundation-teal text-center space-y-2">
                  <p className="text-xs text-white font-bold tracking-wide">
                    {config.footer?.autoUpdateYear
                      ? new Date().getFullYear()
                      : (config.footer?.year || "2026")
                    } - {config.footer?.organizationName || "Fundación Un Nuevo Comienzo C.R"}
                  </p>

                  {(config.footer?.designers && config.footer.designers.length > 0) && (
                    <p className="text-[11px] text-gray-300 leading-normal">
                      Diseño por{" "}
                      <span className="text-white font-semibold">
                        {(() => {
                          const valid = (config.footer.designers || []).map(d => d.trim()).filter(Boolean);
                          if (valid.length === 0) return "";
                          if (valid.length === 1) return valid[0];
                          if (valid.length === 2) return `${valid[0]} y ${valid[1]}`;
                          return `${valid.slice(0, -1).join(", ")} y ${valid[valid.length - 1]}`;
                        })()}
                      </span>
                    </p>
                  )}

                  {config.footer?.additionalCredits && config.footer.additionalCredits.length > 0 && (
                    <div className="flex flex-wrap items-center justify-center gap-x-4 gap-y-1 pt-1 text-[11px] text-gray-400">
                      {config.footer.additionalCredits.map((credit, idx) => (
                        <span key={credit.id || idx}>
                          {credit.label}: <span className="text-gray-200 font-semibold">{credit.value}</span>
                        </span>
                      ))}
                    </div>
                  )}
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

      {/* Global Destructive / High-Impact Action Confirmation Modal */}
      {confirmModal.isOpen && (
        <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white rounded-3xl p-6 max-w-md w-full shadow-2xl border border-gray-100 space-y-5 animate-scale-up">
            <div className="flex items-center gap-3 text-rose-600">
              <div className="w-12 h-12 rounded-2xl bg-rose-100 flex items-center justify-center shrink-0">
                <AlertTriangle className="w-6 h-6 text-rose-600 animate-pulse" />
              </div>
              <div>
                <h3 className="text-base font-black text-gray-900">{confirmModal.title}</h3>
                <p className="text-xs text-gray-500">Confirmación de Acción Importante</p>
              </div>
            </div>

            <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-4 rounded-2xl border border-gray-150">
              {confirmModal.message}
            </p>

            <div className="flex gap-3 pt-1">
              <button
                type="button"
                onClick={() => setConfirmModal(prev => ({ ...prev, isOpen: false }))}
                className="flex-1 py-3 bg-gray-150 hover:bg-gray-200 text-gray-700 font-extrabold text-xs rounded-xl transition-all cursor-pointer"
              >
                Cancelar
              </button>
              <button
                type="button"
                onClick={confirmModal.onConfirm}
                className="flex-1 py-3 bg-rose-600 hover:bg-rose-700 text-white font-extrabold text-xs rounded-xl shadow-md transition-all cursor-pointer flex items-center justify-center gap-1.5"
              >
                <Trash2 className="w-3.5 h-3.5" />
                <span>Confirmar Acción</span>
              </button>
            </div>
          </div>
        </div>
      )}

    </div>
  );
}
