import React, { useState, FormEvent } from "react";
import { MapPin, Phone, Mail, Clock, Facebook, Instagram, Youtube, Twitter, Linkedin, MessageSquare, Send, Globe, ExternalLink } from "lucide-react";
import { AppConfig } from "../types";

interface FooterProps {
  config: AppConfig;
  onNavigateToContact: () => void;
}

export default function Footer({ config, onNavigateToContact }: FooterProps) {
  const { contact, whatsapp } = config;
  const [email, setEmail] = useState("");
  const [submitting, setSubmitting] = useState(false);
  const [status, setStatus] = useState<{ type: "success" | "error"; text: string } | null>(null);

  const handleSubscribe = async (e: FormEvent) => {
    e.preventDefault();
    if (!email) return;
    setSubmitting(true);
    setStatus(null);
    try {
      const res = await fetch("/api/newsletter/subscribe", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email })
      });
      const data = await res.json();
      if (res.ok) {
        setStatus({ type: "success", text: data.message || "¡Suscripción exitosa!" });
        setEmail("");
      } else {
        setStatus({ type: "error", text: data.error || "Ocurrió un error." });
      }
    } catch (err) {
      console.error(err);
      setStatus({ type: "error", text: "Error de red. Intente de nuevo." });
    } finally {
      setSubmitting(false);
      setTimeout(() => setStatus(null), 6000);
    }
  };

  const whatsappPhone = whatsapp?.phone || contact.phone;

  return (
    <footer className="bg-gray-800 text-gray-300 pt-16 pb-8 border-t-4 border-foundation-teal">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-12 mb-12">
          
          {/* Info Contacto */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold tracking-widest uppercase border-b border-gray-700 pb-3">
              Info Contacto
            </h3>
            <ul className="space-y-4">
              <li className="flex items-start gap-3">
                <MapPin className="w-5 h-5 text-foundation-teal flex-shrink-0 mt-0.5" />
                <span className="text-gray-300 text-sm leading-relaxed">{contact.address}</span>
              </li>
              <li className="flex items-center gap-3">
                <Phone className="w-5 h-5 text-foundation-teal flex-shrink-0" />
                <span className="text-gray-300 text-sm">{contact.phone}</span>
              </li>
              <li className="flex items-center gap-3">
                <Mail className="w-5 h-5 text-foundation-teal flex-shrink-0" />
                <a 
                  href={`mailto:${contact.email}`} 
                  className="text-gray-300 hover:text-foundation-teal text-sm transition-colors"
                >
                  {contact.email}
                </a>
              </li>
              <li className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-foundation-teal flex-shrink-0" />
                <span className="text-gray-300 text-sm">{contact.hours}</span>
              </li>
            </ul>

            {/* Social Media Links List */}
            <div className="pt-2 border-t border-gray-700/80 space-y-3">
              <p className="text-xs font-bold text-gray-400 uppercase tracking-wider">Redes Sociales y Canales</p>
              <div className="flex flex-wrap gap-2.5">
                {/* Facebook */}
                {contact.facebookUrl && (
                  <a
                    href={contact.facebookUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-[#1877F2] text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="Facebook"
                  >
                    <Facebook className="w-4 h-4" />
                    <span>Facebook</span>
                  </a>
                )}

                {/* Instagram */}
                {contact.instagramUrl && (
                  <a
                    href={contact.instagramUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-[#E4405F] text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="Instagram"
                  >
                    <Instagram className="w-4 h-4" />
                    <span>Instagram</span>
                  </a>
                )}

                {/* TikTok */}
                {contact.tiktokUrl && (
                  <a
                    href={contact.tiktokUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-black text-gray-200 hover:text-white text-xs font-bold transition-all border border-gray-600/50"
                    title="TikTok"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M19.589 6.686a4.793 4.793 0 0 1-3.77-4.245V2h-3.445v13.672a2.896 2.896 0 0 1-5.201 1.743l-.002-.001a2.895 2.895 0 0 1 3.183-4.51v-3.5a6.329 6.329 0 0 0-5.394 2.155A6.338 6.338 0 0 0 8.012 22a6.338 6.338 0 0 0 6.329-6.329V9.69a8.212 8.212 0 0 0 5.248 1.838v-3.5a4.786 4.786 0 0 1-.001-1.342z"/>
                    </svg>
                    <span>TikTok</span>
                  </a>
                )}

                {/* WhatsApp */}
                {whatsappPhone && (
                  <a
                    href={`https://wa.me/${whatsappPhone.replace(/[^0-9]/g, "")}?text=${encodeURIComponent(whatsapp?.message || "¡Hola! Quisiera más información.")}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-[#25D366] text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="WhatsApp"
                  >
                    <svg className="w-4 h-4 fill-current" viewBox="0 0 24 24">
                      <path d="M.057 24l1.687-6.163c-1.041-1.804-1.588-3.849-1.587-5.946.003-6.556 5.338-11.891 11.893-11.891 3.181.001 6.167 1.24 8.413 3.488 2.245 2.248 3.481 5.236 3.48 8.414-.003 6.557-5.338 11.892-11.893 11.892-1.99-.001-3.951-.5-5.688-1.448l-6.305 1.654zm6.597-3.807c1.676.995 3.276 1.591 5.392 1.592 5.448 0 9.886-4.434 9.889-9.885.002-5.462-4.415-9.89-9.881-9.892-5.452 0-9.887 4.434-9.889 9.884-.001 2.225.651 3.891 1.746 5.634l-.999 3.648 3.742-.981zm11.387-5.464c-.074-.124-.272-.198-.57-.347-.297-.149-1.758-.868-2.031-.967-.272-.099-.47-.149-.669.149-.198.297-.768.967-.941 1.165-.173.198-.347.223-.644.074-.297-.149-1.255-.462-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.297-.347.446-.521.151-.172.2-.296.3-.495.099-.198.05-.372-.025-.521-.075-.148-.669-1.611-.916-2.206-.242-.579-.487-.501-.669-.51l-.57-.01c-.198 0-.52.074-.792.372s-1.04 1.016-1.04 2.479 1.065 2.876 1.213 3.074c.149.198 2.095 3.2 5.076 4.487.709.306 1.263.489 1.694.626.712.226 1.36.194 1.872.118.571-.085 1.758-.719 2.006-1.413.248-.695.248-1.29.173-1.414z"/>
                    </svg>
                    <span>WhatsApp</span>
                  </a>
                )}

                {/* YouTube */}
                {contact.youtubeUrl && (
                  <a
                    href={contact.youtubeUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-[#FF0000] text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="YouTube"
                  >
                    <Youtube className="w-4 h-4" />
                    <span>YouTube</span>
                  </a>
                )}

                {/* Twitter / X */}
                {contact.twitterUrl && (
                  <a
                    href={contact.twitterUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-black text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="Twitter / X"
                  >
                    <Twitter className="w-4 h-4" />
                    <span>X (Twitter)</span>
                  </a>
                )}

                {/* LinkedIn */}
                {contact.linkedinUrl && (
                  <a
                    href={contact.linkedinUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-[#0A66C2] text-gray-200 hover:text-white text-xs font-bold transition-all"
                    title="LinkedIn"
                  >
                    <Linkedin className="w-4 h-4" />
                    <span>LinkedIn</span>
                  </a>
                )}

                {/* Custom Links */}
                {contact.customSocialLinks && contact.customSocialLinks.map((item) => (
                  <a
                    key={item.id}
                    href={item.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-gray-700/80 hover:bg-foundation-teal text-gray-200 hover:text-white text-xs font-bold transition-all"
                  >
                    <Globe className="w-3.5 h-3.5" />
                    <span>{item.label}</span>
                  </a>
                ))}
              </div>
            </div>
          </div>

          {/* Consultas a la Fundación */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold tracking-widest uppercase border-b border-gray-700 pb-3">
              Consultas
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              ¿Tiene alguna duda sobre nuestro programa de patrocinio, voluntariado o cómo realizar un donativo? Nuestro equipo está listo para atenderle.
            </p>
            <button
              onClick={onNavigateToContact}
              className="inline-flex items-center gap-2 px-6 py-3 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-bold rounded-lg shadow-md hover:shadow-lg hover:scale-[1.02] transition-all cursor-pointer"
            >
              <MessageSquare className="w-4 h-4" />
              Realizar Consulta
            </button>
          </div>

          {/* Newsletter */}
          <div className="space-y-6">
            <h3 className="text-white text-lg font-bold tracking-widest uppercase border-b border-gray-700 pb-3">
              Newsletter
            </h3>
            <p className="text-gray-400 text-sm leading-relaxed">
              Suscríbase para recibir noticias, boletines e información sobre las actividades y proyectos de nuestra fundación.
            </p>
            <form onSubmit={handleSubscribe} className="space-y-3">
              <div className="flex flex-col sm:flex-row gap-2">
                <input
                  type="email"
                  required
                  placeholder="Tu correo electrónico"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  className="px-4 py-2 bg-gray-700 text-white rounded-lg text-sm border border-gray-600 focus:outline-none focus:border-foundation-teal flex-grow font-semibold"
                />
                <button
                  type="submit"
                  disabled={submitting}
                  className="px-4 py-2 bg-foundation-teal hover:bg-foundation-teal-dark disabled:bg-gray-600 text-white font-bold text-xs rounded-lg transition-all cursor-pointer flex items-center justify-center gap-1 shrink-0 hover:scale-[1.02]"
                >
                  {submitting ? "..." : (
                    <>
                      <Send className="w-3.5 h-3.5" />
                      Unirse
                    </>
                  )}
                </button>
              </div>
              {status && (
                <p className={`text-xs font-bold mt-1 ${
                  status.type === "success" ? "text-emerald-400" : "text-rose-400"
                }`}>
                  {status.text}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Separator line */}
        <div className="border-t border-gray-700 pt-8 mt-8 flex flex-col items-center justify-center text-center">
          <p className="text-xs text-gray-400 font-medium">
            2026 - Fundación Un Nuevo Comienzo C.R
          </p>
          <p className="text-[11px] text-gray-500 mt-2 max-w-lg leading-normal">
            Diseño por <span className="text-gray-400">Cristhian Martínez, Katherine Martínez, Robert Ramírez y Valeria Rojas</span>
          </p>
        </div>

      </div>
    </footer>
  );
}
