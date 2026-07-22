import React, { useState } from "react";
import { MessageSquare, ExternalLink, QrCode, Download, Sparkles, Printer, Copy, Check, Share2, Send } from "lucide-react";
import { ContactConfig } from "../types";

interface SocialQRGridProps {
  contact: ContactConfig;
  className?: string;
}

export default function SocialQRGrid({ contact, className = "" }: SocialQRGridProps) {
  const [selectedQr, setSelectedQr] = useState<{ name: string; url: string; qrImg: string; color: string } | null>(null);
  const [copiedStatus, setCopiedStatus] = useState<boolean>(false);

  const getQrUrl = (url: string, customQr?: string) => {
    if (customQr && customQr.trim().length > 0) return customQr;
    if (!url || url.trim().length === 0) return "";
    return `https://api.qrserver.com/v1/create-qr-code/?size=300x300&data=${encodeURIComponent(url)}`;
  };

  const handleCopyQrImage = async (name: string, url: string, qrImg: string) => {
    try {
      if (navigator.clipboard && window.ClipboardItem) {
        const img = new Image();
        img.crossOrigin = "anonymous";
        img.src = qrImg;
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
                  setCopiedStatus(true);
                  setTimeout(() => setCopiedStatus(false), 3000);
                }).catch(() => {
                  navigator.clipboard.writeText(qrImg);
                  setCopiedStatus(true);
                  setTimeout(() => setCopiedStatus(false), 3000);
                });
              }
            }, "image/png");
          }
        };
        img.onerror = () => {
          navigator.clipboard.writeText(qrImg);
          setCopiedStatus(true);
          setTimeout(() => setCopiedStatus(false), 3000);
        };
      } else {
        await navigator.clipboard.writeText(qrImg);
        setCopiedStatus(true);
        setTimeout(() => setCopiedStatus(false), 3000);
      }
    } catch (e) {
      navigator.clipboard.writeText(qrImg);
      setCopiedStatus(true);
      setTimeout(() => setCopiedStatus(false), 3000);
    }
  };

  const handlePrintQr = (name: string, url: string, qrImg: string) => {
    const printWindow = window.open("", "_blank");
    if (!printWindow) {
      alert("Por favor habilite las ventanas emergentes (pop-ups) para imprimir el código QR.");
      return;
    }
    printWindow.document.write(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>Imprimir QR - ${name}</title>
          <style>
            body { font-family: sans-serif; text-align: center; padding: 40px; color: #111827; }
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
            <div class="title">${name}</div>
            <div class="qr-box">
              <img src="${qrImg}" alt="QR ${name}" />
            </div>
            <div class="data">${url}</div>
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

  const socialNetworks = [
    {
      id: "whatsapp",
      name: "WhatsApp",
      url: contact.whatsappUrl || (contact.phone ? `https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}` : ""),
      qrImg: getQrUrl(
        contact.whatsappUrl || (contact.phone ? `https://wa.me/${contact.phone.replace(/[^0-9]/g, "")}` : ""),
        contact.whatsappQrUrl
      ),
      bgColor: "bg-[#25D366]",
      textColor: "text-[#25D366]",
      borderColor: "border-[#25D366]/30",
      hoverBg: "hover:bg-[#128C7E]",
      icon: (
        <MessageSquare className="w-5 h-5 text-white fill-current" />
      ),
      description: "Chat directo de atención rápida y donaciones SINPE."
    },
    {
      id: "telegram",
      name: "Telegram",
      url: contact.telegramUrl || "",
      qrImg: getQrUrl(contact.telegramUrl || "", contact.telegramQrUrl),
      bgColor: "bg-[#229ED9]",
      textColor: "text-[#229ED9]",
      borderColor: "border-[#229ED9]/30",
      hoverBg: "hover:bg-[#1a81b3]",
      icon: (
        <Send className="w-5 h-5 text-white fill-current" />
      ),
      description: "Canal oficial de noticias, avisos y mensajería en Telegram."
    },
    {
      id: "facebook",
      name: "Facebook",
      url: contact.facebookUrl || "https://www.facebook.com/FundacionUnNuevoComienzoCR",
      qrImg: getQrUrl(contact.facebookUrl || "https://www.facebook.com/FundacionUnNuevoComienzoCR", contact.facebookQrUrl),
      bgColor: "bg-[#1877F2]",
      textColor: "text-[#1877F2]",
      borderColor: "border-[#1877F2]/30",
      hoverBg: "hover:bg-[#0d65d9]",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      ),
      description: "Página oficial de eventos, noticias e informes."
    },
    {
      id: "instagram",
      name: "Instagram",
      url: contact.instagramUrl || "https://www.instagram.com/fundacionunnuevocomienzocr",
      qrImg: getQrUrl(contact.instagramUrl || "https://www.instagram.com/fundacionunnuevocomienzocr", contact.instagramQrUrl),
      bgColor: "bg-gradient-to-tr from-[#f09433] via-[#dc2743] to-[#bc1888]",
      textColor: "text-[#E4405F]",
      borderColor: "border-[#E4405F]/30",
      hoverBg: "hover:opacity-90",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/>
        </svg>
      ),
      description: "Historias, fotos de actividades y momentos diarios."
    },
    {
      id: "tiktok",
      name: "TikTok",
      url: contact.tiktokUrl || "https://www.tiktok.com/@fundacionunnuevocomienzocr",
      qrImg: getQrUrl(contact.tiktokUrl || "https://www.tiktok.com/@fundacionunnuevocomienzocr", contact.tiktokQrUrl),
      bgColor: "bg-gray-900",
      textColor: "text-gray-900 dark:text-gray-100",
      borderColor: "border-gray-800/30",
      hoverBg: "hover:bg-black",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.155A6.338 6.338 0 0 0 8.012 22a6.338 6.338 0 0 0 6.329-6.329V9.69a8.212 8.212 0 0 0 5.248 1.838v-3.5a4.786 4.786 0 0 1-.001-1.342z"/>
        </svg>
      ),
      description: "Videos de impacto comunitario y dinamismo juvenil."
    },
    {
      id: "wechat",
      name: "WeChat",
      url: contact.wechatUrl || "",
      qrImg: getQrUrl(contact.wechatUrl || "", contact.wechatQrUrl),
      bgColor: "bg-[#07C160]",
      textColor: "text-[#07C160]",
      borderColor: "border-[#07C160]/30",
      hoverBg: "hover:bg-[#06a552]",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M8.691 2.188C3.891 2.188 0 5.476 0 9.53c0 2.212 1.17 4.203 3.06 5.547l-.766 2.298 2.665-1.332c1.112.35 2.302.548 3.532.548 4.8 0 8.691-3.288 8.691-7.342 0-4.054-3.891-7.342-8.691-7.342zm-2.07 4.29a.98.98 0 1 1 0 1.96.98.98 0 0 1 0-1.96zm4.14 0a.98.98 0 1 1 0 1.96.98.98 0 0 1 0-1.96zm8.85 5.54c-.312 0-.623.018-.93.052 2.766 1.488 4.604 3.864 4.604 6.577 0 1.396-.492 2.703-1.385 3.774l1.838 1.838-.532-1.597a7.53 7.53 0 0 0 1.947-2.616c.451-.97.688-2.019.688-3.084 0-3.327-3.04-6.023-6.666-6.023zm-1.895 3.328a.807.807 0 1 1 0 1.614.807.807 0 0 1 0-1.614zm3.411 0a.807.807 0 1 1 0 1.614.807.807 0 0 1 0-1.614z"/>
        </svg>
      ),
      description: "Canal de contacto internacional para aliados y donantes."
    },
    {
      id: "line",
      name: "Line",
      url: contact.lineUrl || "",
      qrImg: getQrUrl(contact.lineUrl || "", contact.lineQrUrl),
      bgColor: "bg-[#00B900]",
      textColor: "text-[#00B900]",
      borderColor: "border-[#00B900]/30",
      hoverBg: "hover:bg-[#009900]",
      icon: (
        <svg className="w-5 h-5 fill-current text-white" viewBox="0 0 24 24">
          <path d="M19.34 10.28c0-3.92-3.87-7.1-8.64-7.1S2.06 6.36 2.06 10.28c0 3.51 3.07 6.45 7.23 6.99.28.06.67.19.77.43.09.22.06.56.03.78l-.13.78c-.04.24-.19.93.82.51 1.01-.42 5.45-3.21 7.43-5.49 1.12-1.24 1.13-2.62 1.13-4.02zm-12.7 1.72H5.16a.48.48 0 0 1-.48-.48V8.12c0-.26.22-.48.48-.48s.48.22.48.48v2.92h1a.48.48 0 0 1 0 .96zm2.23 0h-.48a.48.48 0 0 1-.48-.48V8.12c0-.26.22-.48.48-.48s.48.22.48.48v3.4c0 .26-.22.48-.48.48zm4.4 0h-.48a.48.48 0 0 1-.43-.27l-1.85-2.58v2.37c0 .26-.22.48-.48.48s-.48-.22-.48-.48V8.12c0-.26.22-.48.48-.48h.48a.48.48 0 0 1 .43.27l1.85 2.58V8.12c0-.26.22-.48.48-.48s.48.22.48.48v3.4c0 .26-.22.48-.48.48zm3.84-1.86h-1.48v.9h1.48a.48.48 0 0 1 0 .96h-1.96a.48.48 0 0 1-.48-.48V8.12c0-.26.22-.48.48-.48h1.96a.48.48 0 1 1 0 .96h-1.48v.9h1.48a.48.48 0 0 1 0 .96z"/>
        </svg>
      ),
      description: "Mensajería instantánea directa y canal de difusión."
    }
  ];

  // Append custom QRs if available
  const customQrsList = (contact.customQrs || []).map(cq => ({
    id: cq.id,
    name: cq.title,
    url: cq.data,
    qrImg: getQrUrl(cq.data, cq.imageUrl),
    bgColor: "bg-foundation-teal",
    textColor: "text-foundation-teal",
    borderColor: "border-foundation-teal/30",
    hoverBg: "hover:bg-foundation-teal-dark",
    icon: <QrCode className="w-5 h-5 text-white" />,
    description: "Código QR personalizado de la Fundación."
  }));

  const activeNetworks = [...socialNetworks, ...customQrsList].filter(item => item.url && item.url.trim().length > 0);

  return (
    <div className={`space-y-6 ${className}`}>
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 border-b border-gray-150 dark:border-gray-800 pb-4">
        <div>
          <h3 className="text-lg font-black text-gray-900 dark:text-gray-100 flex items-center gap-2">
            <QrCode className="w-5 h-5 text-foundation-teal" />
            <span>Códigos QR e Iconos Directos de Redes Sociales</span>
          </h3>
          <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
            Escanea con la cámara de tu celular o haz clic directamente en el icono de la red social para ingresar a nuestros canales oficiales.
          </p>
        </div>

        <div className="flex items-center gap-1.5 px-3 py-1.5 bg-foundation-teal/10 rounded-xl text-foundation-teal text-xs font-bold self-start sm:self-auto">
          <Sparkles className="w-4 h-4" />
          <span>Generador Automático de QR</span>
        </div>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6">
        {activeNetworks.map((net) => (
          <div
            key={net.id}
            className={`group bg-white dark:bg-gray-900 p-5 rounded-3xl border ${net.borderColor} hover:border-foundation-teal/50 shadow-xs hover:shadow-lg transition-all duration-300 flex flex-col justify-between space-y-4`}
          >
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2.5">
                  <div className={`w-9 h-9 rounded-2xl ${net.bgColor} flex items-center justify-center shadow-xs group-hover:scale-110 transition-transform`}>
                    {net.icon}
                  </div>
                  <div>
                    <h4 className="text-sm font-black text-gray-900 dark:text-gray-100">{net.name}</h4>
                    <span className="text-[10px] font-extrabold text-gray-400 dark:text-gray-500 uppercase tracking-widest">
                      Escanear o Clic
                    </span>
                  </div>
                </div>

                <a
                  href={net.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className={`p-2 rounded-xl text-xs font-extrabold text-white ${net.bgColor} ${net.hoverBg} shadow-xs transition-all flex items-center gap-1 hover:scale-105`}
                  title={`Abrir ${net.name}`}
                >
                  <ExternalLink className="w-3.5 h-3.5" />
                </a>
              </div>

              <p className="text-xs text-gray-500 dark:text-gray-400 font-medium line-clamp-2">
                {net.description}
              </p>
            </div>

            {/* QR Code Container */}
            {net.qrImg ? (
              <div 
                onClick={() => setSelectedQr({ name: net.name, url: net.url, qrImg: net.qrImg, color: net.bgColor })}
                className="bg-gray-50 dark:bg-gray-800/80 p-4 rounded-2xl border border-gray-100 dark:border-gray-700/60 flex flex-col items-center justify-center gap-2 cursor-pointer group/qr hover:bg-white dark:hover:bg-gray-800 transition-colors"
              >
                <div className="relative p-2 bg-white rounded-xl shadow-xs border border-gray-200/80 group-hover/qr:scale-105 transition-transform">
                  <img
                    src={net.qrImg}
                    alt={`QR ${net.name}`}
                    className="w-28 h-28 object-contain rounded-lg"
                    referrerPolicy="no-referrer"
                  />
                  <div className="absolute inset-0 bg-black/40 opacity-0 group-hover/qr:opacity-100 rounded-xl transition-opacity flex items-center justify-center text-white text-[10px] font-extrabold gap-1">
                    <QrCode className="w-4 h-4" /> Ampliar QR
                  </div>
                </div>

                <span className="text-[11px] font-extrabold text-gray-600 dark:text-gray-300 flex items-center gap-1 group-hover/qr:text-foundation-teal">
                  <span>Código QR {net.name}</span>
                </span>
              </div>
            ) : (
              <div className="bg-gray-50 dark:bg-gray-800 p-4 rounded-2xl text-center text-xs text-gray-400 font-semibold">
                Sin URL configurada
              </div>
            )}
          </div>
        ))}
      </div>

      {/* Enlarged QR Modal */}
      {selectedQr && (
        <div className="fixed inset-0 z-50 bg-black/70 backdrop-blur-xs flex items-center justify-center p-4 animate-fade-in">
          <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 max-w-sm w-full space-y-6 shadow-2xl border border-gray-100 dark:border-gray-800 text-center relative">
            <button
              onClick={() => { setSelectedQr(null); setCopiedStatus(false); }}
              className="absolute top-4 right-4 p-2 rounded-full bg-gray-100 dark:bg-gray-800 hover:bg-gray-200 dark:hover:bg-gray-700 text-gray-600 dark:text-gray-300 transition-colors cursor-pointer"
            >
              ✕
            </button>

            <div className="space-y-2">
              <span className={`inline-block px-3 py-1 rounded-full text-xs font-black text-white ${selectedQr.color}`}>
                {selectedQr.name}
              </span>
              <h3 className="text-xl font-extrabold text-gray-900 dark:text-gray-100">
                Código QR Oficial
              </h3>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                Apunta con la cámara de tu smartphone para abrir la página oficial en {selectedQr.name}.
              </p>
            </div>

            <div className="p-4 bg-white rounded-2xl border border-gray-200 shadow-md inline-block">
              <img
                src={selectedQr.qrImg}
                alt={`QR ${selectedQr.name}`}
                className="w-52 h-52 object-contain"
                referrerPolicy="no-referrer"
              />
            </div>

            {/* Actions: Copy & Print */}
            <div className="grid grid-cols-2 gap-2">
              <button
                type="button"
                onClick={() => handleCopyQrImage(selectedQr.name, selectedQr.url, selectedQr.qrImg)}
                className="py-2.5 px-3 bg-gray-100 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-800 dark:text-gray-200 font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                {copiedStatus ? (
                  <>
                    <Check className="w-3.5 h-3.5 text-emerald-600" />
                    <span className="text-emerald-600">¡Copiado!</span>
                  </>
                ) : (
                  <>
                    <Copy className="w-3.5 h-3.5" />
                    <span>Copiar Imagen</span>
                  </>
                )}
              </button>

              <button
                type="button"
                onClick={() => handlePrintQr(selectedQr.name, selectedQr.url, selectedQr.qrImg)}
                className="py-2.5 px-3 bg-foundation-teal/10 hover:bg-foundation-teal/20 text-foundation-teal font-extrabold text-xs rounded-xl flex items-center justify-center gap-1.5 transition-all cursor-pointer"
              >
                <Printer className="w-3.5 h-3.5" />
                <span>Imprimir QR</span>
              </button>
            </div>

            <div className="flex flex-col gap-2 pt-2">
              <a
                href={selectedQr.url}
                target="_blank"
                rel="noopener noreferrer"
                className={`w-full py-3 px-4 ${selectedQr.color} text-white font-extrabold text-xs rounded-xl shadow-md flex items-center justify-center gap-2 hover:opacity-95 transition-opacity`}
              >
                <ExternalLink className="w-4 h-4" />
                <span>Abrir Enlace Directo en {selectedQr.name}</span>
              </a>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
