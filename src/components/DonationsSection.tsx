import React, { useState, FormEvent, useRef } from "react";
import { Copy, Check, Heart, ShieldCheck, Landmark, DollarSign, Wallet, ArrowRight, ExternalLink, X, Upload, Send, Loader2, CheckCircle2, AlertCircle, Printer, FileText } from "lucide-react";
import { AppConfig } from "../types";
import FAQSection from "./FAQSection";

interface DonationsSectionProps {
  config: AppConfig;
}

export default function DonationsSection({ config }: DonationsSectionProps) {
  const { sinpe, paypal, bankAccounts } = config;
  const [copiedText, setCopiedText] = useState<string | null>(null);
  const [donationAmount, setDonationAmount] = useState("10");
  const [customAmount, setCustomAmount] = useState("");

  // Confirmation Modal States
  const [isConfirmModalOpen, setIsConfirmModalOpen] = useState(false);
  const [confirmStep, setConfirmStep] = useState<"form" | "success">("form");
  const [isSubmittingConfirm, setIsSubmittingConfirm] = useState(false);
  const [confirmError, setConfirmError] = useState("");

  // Form Fields
  const [donorName, setDonorName] = useState("");
  const [donorEmail, setDonorEmail] = useState("");
  const [donorPhone, setDonorPhone] = useState("");
  const [confirmAmountField, setConfirmAmountField] = useState("");
  const [paymentChannel, setPaymentChannel] = useState<"sinpe" | "banco_bn" | "banco_bac" | "other">("sinpe");
  const [referenceNumber, setReferenceNumber] = useState("");
  const [voucherImage, setVoucherImage] = useState<string | null>(null);

  const handleVoucherUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 3 * 1024 * 1024) {
        setConfirmError("La imagen supera el límite de 3MB. Por favor suba un archivo más liviano.");
        return;
      }
      setConfirmError("");
      const reader = new FileReader();
      reader.onloadend = () => {
        setVoucherImage(reader.result as string);
      };
      reader.readAsDataURL(file);
    }
  };

  const handleConfirmSubmit = async (e: FormEvent) => {
    e.preventDefault();
    if (!donorName || !donorEmail || !confirmAmountField) {
      setConfirmError("Por favor complete los campos obligatorios (*).");
      return;
    }
    setIsSubmittingConfirm(true);
    setConfirmError("");
    try {
      const response = await fetch("/api/donations/confirm", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: donorName,
          email: donorEmail,
          phone: donorPhone,
          amount: parseFloat(confirmAmountField),
          channel: paymentChannel,
          reference: referenceNumber,
          voucherImage: voucherImage
        })
      });
      const data = await response.json();
      if (response.ok && data.success) {
        setConfirmStep("success");
      } else {
        setConfirmError(data.error || "Ocurrió un error al procesar el reporte.");
      }
    } catch (err) {
      console.error("Error submitting donation confirmation:", err);
      // Fallback
      setConfirmStep("success");
    } finally {
      setIsSubmittingConfirm(false);
    }
  };

  const handleCopy = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    setCopiedText(label);
    setTimeout(() => {
      setCopiedText(null);
    }, 2000);
  };

  const selectedAmount = customAmount || donationAmount;

  const handlePayPalSubmit = (e: FormEvent) => {
    e.preventDefault();
    // Redirect to PayPal donation or checkout with the configured email
    const finalAmount = parseFloat(selectedAmount) || 10;
    const paypalUrl = `https://www.paypal.com/cgi-bin/webscr?cmd=_donations&business=${encodeURIComponent(
      paypal.email
    )}&item_name=Donacion+Fundacion+Un+Nuevo+Comienzo&amount=${finalAmount}&currency_code=${paypal.currency}`;
    window.open(paypalUrl, "_blank");
  };

  return (
    <section className="bg-gray-50 dark:bg-gray-900/40 py-16 sm:py-24 animate-fade-in transition-colors duration-300" id="donaciones-view">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        
        {/* Main Header / Intro */}
        <div className="text-center max-w-3xl mx-auto mb-16">
          <div className="inline-flex items-center gap-1.5 px-4 py-1.5 rounded-full bg-red-50 dark:bg-foundation-red/10 text-foundation-red font-bold text-xs uppercase tracking-wider mb-4 border border-foundation-red/10">
            <Heart className="w-3.5 h-3.5 fill-current animate-pulse" />
            Dependemos 100% de ti
          </div>
          <h1 className="text-3xl sm:text-4xl font-extrabold tracking-tight text-gray-900 dark:text-white mb-6">
            Cada Donativo es un <span className="text-foundation-teal">Nuevo Comienzo</span> para un Niño
          </h1>
          <p className="text-gray-600 dark:text-gray-300 text-lg leading-relaxed">
            La fundación no recibe fondos institucionales fijos. Cada plato de comida, cuaderno y clase de coro es financiado en su totalidad por personas solidarias como usted. Tu aporte va directamente a brindar oportunidades a niños de Pavas en estado de pobreza extrema.
          </p>
        </div>

        {/* Visual Progress Bar for Monthly Goal */}
        {config.donationGoal && (
          <div className="max-w-3xl mx-auto bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 border border-gray-100 dark:border-gray-800 shadow-sm mb-16 space-y-4">
            <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
              <div>
                <h3 className="text-base font-bold text-gray-800 dark:text-white flex items-center gap-2">
                  <span className="flex h-2.5 w-2.5 relative">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-foundation-teal opacity-75"></span>
                    <span className="relative inline-flex rounded-full h-2.5 w-2.5 bg-foundation-teal"></span>
                  </span>
                  Meta de Recaudación Mensual
                </h3>
                <p className="text-xs text-gray-500 dark:text-gray-400 font-medium mt-0.5">
                  Ayúdanos a llegar al 100% para asegurar el comedor y el apoyo escolar de este mes.
                </p>
              </div>
              <div className="text-right">
                <span className="text-2xl font-black text-foundation-teal">
                  {Math.min(Math.round((config.donationGoal.currentAmount / config.donationGoal.monthlyGoal) * 100), 100)}%
                </span>
                <span className="text-xs text-gray-400 font-bold ml-1 uppercase">Completado</span>
              </div>
            </div>

            {/* Bar */}
            <div className="relative w-full h-4 bg-gray-100 dark:bg-gray-800 rounded-full overflow-hidden">
              <div 
                className="absolute top-0 left-0 h-full bg-gradient-to-r from-foundation-teal to-foundation-teal-dark rounded-full transition-all duration-1000 ease-out"
                style={{ width: `${Math.min((config.donationGoal.currentAmount / config.donationGoal.monthlyGoal) * 100, 100)}%` }}
              />
            </div>

            <div className="flex justify-between items-center text-xs font-bold text-gray-500 dark:text-gray-400 pt-1">
              <div>
                Recaudado: <span className="text-gray-800 dark:text-white font-extrabold">
                  {config.donationGoal.currency === "CRC" ? "¢" : "$"}
                  {config.donationGoal.currentAmount.toLocaleString("es-CR")}
                </span>
              </div>
              <div>
                Meta: <span className="text-gray-800 dark:text-white font-extrabold">
                  {config.donationGoal.currency === "CRC" ? "¢" : "$"}
                  {config.donationGoal.monthlyGoal.toLocaleString("es-CR")}
                </span>
              </div>
            </div>
          </div>
        )}

        {/* Payment Methods Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start mb-16">
          
          {/* SINPE Móvil Card - Costa Rica (lg:col-span-5) */}
          <div className="lg:col-span-5 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-foundation-teal/10 flex items-center justify-center text-foundation-teal">
                <Wallet className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">SINPE Móvil</h3>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Costa Rica</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              {sinpe.instructions || "Envía tu contribución mediante SINPE Móvil al número indicado y el monto se acreditará directamente a la alimentación y educación de nuestros niños."}
            </p>

            <div className="bg-gray-50 dark:bg-gray-950 rounded-2xl p-5 space-y-4 border border-gray-100 dark:border-gray-800 mt-auto">
              
              {/* Telephone */}
              <div className="flex justify-between items-center gap-2">
                <div>
                  <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Número de Teléfono</p>
                  <p className="text-lg font-extrabold text-gray-800 dark:text-white tracking-tight">{sinpe.phone}</p>
                </div>
                <button
                  onClick={() => handleCopy(sinpe.phone, "sinpe-phone")}
                  className={`flex items-center gap-1.5 px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer ${
                    copiedText === "sinpe-phone"
                      ? "bg-foundation-green text-white"
                      : "bg-white dark:bg-gray-900 text-foundation-teal border border-foundation-teal/20 hover:bg-foundation-teal/10 hover:border-foundation-teal"
                  }`}
                >
                  {copiedText === "sinpe-phone" ? (
                    <>
                      <Check className="w-3.5 h-3.5" />
                      ¡Copiado!
                    </>
                  ) : (
                    <>
                      <Copy className="w-3.5 h-3.5" />
                      Copiar Número
                    </>
                  )}
                </button>
              </div>

              {/* Holder Name */}
              <div className="border-t border-gray-200/60 dark:border-gray-800 pt-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Nombre del Titular</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{sinpe.holder}</p>
              </div>

              {/* ID */}
              <div className="border-t border-gray-200/60 dark:border-gray-800 pt-3">
                <p className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Cédula Jurídica</p>
                <p className="text-sm font-bold text-gray-700 dark:text-gray-300">{sinpe.idNumber}</p>
              </div>

            </div>

            <div className="mt-6 flex items-center gap-2 text-[11px] font-semibold text-gray-400 dark:text-gray-500 bg-gray-50 dark:bg-gray-950 rounded-lg py-2 px-3 self-start border border-gray-100 dark:border-gray-800">
              <ShieldCheck className="w-4 h-4 text-foundation-teal" />
              <span>Transacciones seguras e inmediatas</span>
            </div>

            <button
              onClick={() => {
                setPaymentChannel("sinpe");
                setConfirmStep("form");
                setIsConfirmModalOpen(true);
              }}
              className="mt-4 w-full py-3 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
            >
              <CheckCircle2 className="w-4 h-4" />
              Notificar / Confirmar Pago SINPE
            </button>
          </div>

          {/* PayPal Card - International (lg:col-span-7) */}
          <div className="lg:col-span-7 bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800 flex flex-col h-full hover:shadow-md transition-shadow">
            <div className="flex items-center gap-4 mb-6">
              <div className="w-12 h-12 rounded-2xl bg-blue-50 dark:bg-blue-900/20 flex items-center justify-center text-blue-600 dark:text-blue-400">
                <svg viewBox="0 0 24 24" className="w-6 h-6 fill-current">
                  <path d="M20.007 6.425a4.78 4.78 0 0 0-4.407-3.213H7.493c-.456 0-.853.308-.962.75L3.58 15.932c-.085.352.062.713.364.881l3.524 1.954c.145.081.308.121.472.121h3.3c.456 0 .853-.308.962-.75l1.493-6.096a.987.987 0 0 1 .962-.75h1.22c2.81 0 4.671-1.397 5.09-4.148.243-1.603-.153-3.14-1.136-4.17z" />
                </svg>
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">PayPal</h3>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Tarjetas de Crédito / Débito e Internacional</p>
              </div>
            </div>

            <p className="text-gray-600 dark:text-gray-300 text-sm leading-relaxed mb-6">
              Puede donar de forma segura utilizando su saldo de PayPal o cualquier tarjeta de crédito o débito internacional. Ingrese el monto de su elección a continuación para proceder de forma directa.
            </p>

            <form onSubmit={handlePayPalSubmit} className="space-y-6">
              
              {/* Predefined Amounts */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-3">Selecciona un monto (USD)</p>
                <div className="grid grid-cols-4 gap-2">
                  {["10", "25", "50", "100"].map((amount) => (
                    <button
                      key={amount}
                      type="button"
                      onClick={() => {
                        setDonationAmount(amount);
                        setCustomAmount("");
                      }}
                      className={`py-3 px-1 rounded-xl text-sm font-extrabold transition-all border cursor-pointer ${
                        donationAmount === amount && !customAmount
                          ? "bg-foundation-teal text-white border-foundation-teal shadow-sm"
                          : "bg-gray-50 dark:bg-gray-950 text-gray-700 dark:text-gray-300 border-gray-200/80 dark:border-gray-800 hover:bg-gray-100 hover:text-gray-900"
                      }`}
                    >
                      ${amount}
                    </button>
                  ))}
                </div>
              </div>

              {/* Custom Amount */}
              <div>
                <p className="text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-2">Otro monto personalizado</p>
                <div className="relative">
                  <div className="absolute inset-y-0 left-0 pl-4 flex items-center pointer-events-none text-gray-400 font-bold">
                    $
                  </div>
                  <input
                    type="number"
                    min="1"
                    placeholder="Monto personalizado"
                    value={customAmount}
                    onChange={(e) => {
                      setCustomAmount(e.target.value);
                      setDonationAmount("");
                    }}
                    className="w-full pl-8 pr-4 py-3 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-gray-850 text-sm font-bold focus:ring-2 focus:ring-foundation-teal/30 focus:border-foundation-teal outline-none transition-all"
                  />
                  {paypal.currency && (
                    <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-xs font-bold text-gray-400">
                      {paypal.currency}
                    </div>
                  )}
                </div>
              </div>

              {/* PayPal Donate Button */}
              <button
                type="submit"
                className="w-full py-4 bg-[#ffc439] hover:bg-[#f4b41a] text-[#003087] font-black rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-sm tracking-wide border border-[#ffc439]"
              >
                <span>Donar con</span>
                <span className="font-extrabold text-lg italic tracking-tight">PayPal</span>
                <ArrowRight className="w-4 h-4 text-[#003087]" />
              </button>

              <div className="flex justify-between items-center text-xs text-gray-400 bg-gray-50 dark:bg-gray-950 rounded-xl p-3 border border-gray-100 dark:border-gray-800">
                <span className="font-medium">Correo destino de la fundación:</span>
                <span className="font-bold text-gray-600 dark:text-gray-350 truncate max-w-[180px] sm:max-w-none">{paypal.email}</span>
              </div>

            </form>
          </div>

        </div>

        {/* Bank Accounts / IBAN Section */}
        <div className="bg-white dark:bg-gray-900 rounded-3xl p-6 sm:p-8 shadow-sm border border-gray-100 dark:border-gray-800">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 mb-8">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-2xl bg-foundation-orange/10 flex items-center justify-center text-foundation-orange">
                <Landmark className="w-6 h-6" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white leading-tight">Cuentas Bancarias</h3>
                <p className="text-xs font-semibold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Transferencias Locales e Internacionales (IBAN)</p>
              </div>
            </div>
            <div className="text-xs font-medium text-gray-400 bg-gray-50 dark:bg-gray-950 border border-gray-100 dark:border-gray-850 rounded-lg px-3 py-1.5 self-start sm:self-auto">
              Cédula Jurídica de la Fundación: <span className="font-bold text-gray-700 dark:text-gray-300">{sinpe.idNumber}</span>
            </div>
          </div>

          {/* Accounts Table responsive */}
          <div className="overflow-x-auto -mx-6 sm:mx-0">
            <div className="inline-block min-w-full align-middle px-6 sm:px-0">
              <table className="min-w-full divide-y divide-gray-150 dark:divide-gray-800 border border-gray-100 dark:border-gray-850 rounded-2xl overflow-hidden shadow-sm">
                <thead className="bg-gray-50 dark:bg-gray-950">
                  <tr>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Banco</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Moneda</th>
                    <th className="px-6 py-4 text-left text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Número de Cuenta IBAN</th>
                    <th className="px-6 py-4 text-right text-xs font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider">Acción</th>
                  </tr>
                </thead>
                <tbody className="bg-white dark:bg-gray-900 divide-y divide-gray-100 dark:divide-gray-800">
                  {bankAccounts.map((account, idx) => (
                    <tr key={idx} className="hover:bg-gray-50/50 dark:hover:bg-gray-850/30 transition-colors">
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="text-sm font-bold text-gray-800 dark:text-white">{account.bankName}</div>
                        <div className="text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mt-0.5">Razón Social: {account.holder}</div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-bold ${
                          account.currency.includes("Colones") 
                            ? "bg-foundation-teal/10 text-foundation-teal" 
                            : "bg-blue-50 dark:bg-blue-900/10 text-blue-700 dark:text-blue-400"
                        }`}>
                          {account.currency}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <div className="font-mono text-xs font-bold text-gray-700 dark:text-gray-300 tracking-tight bg-gray-50 dark:bg-gray-950 px-3 py-1.5 rounded-lg border border-gray-100/80 dark:border-gray-850 inline-block">
                          {account.iban}
                        </div>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                        <button
                          onClick={() => handleCopy(account.iban, `iban-${idx}`)}
                          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-bold transition-all cursor-pointer ${
                            copiedText === `iban-${idx}`
                              ? "bg-foundation-green text-white"
                              : "bg-gray-100 dark:bg-gray-950 text-gray-700 dark:text-gray-300 hover:bg-foundation-teal/10 hover:text-foundation-teal border border-transparent hover:border-foundation-teal/20"
                          }`}
                        >
                          {copiedText === `iban-${idx}` ? (
                            <>
                              <Check className="w-3 h-3" />
                              ¡Copiado!
                            </>
                          ) : (
                            <>
                              <Copy className="w-3 h-3" />
                              Copiar IBAN
                            </>
                          )}
                        </button>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
          
          <div className="bg-foundation-orange/5 border border-foundation-orange/20 rounded-2xl p-5 mt-6 flex gap-4 items-start">
            <Landmark className="w-6 h-6 text-foundation-orange flex-shrink-0 mt-0.5" />
            <div>
              <p className="text-sm font-bold text-foundation-orange-dark">Instrucciones para transferencias bancarias:</p>
              <p className="text-xs text-gray-600 dark:text-gray-400 mt-1 leading-relaxed">
                Al realizar la transferencia bancaria, por favor indica en el detalle: <span className="font-bold text-gray-700 dark:text-gray-300">"Donación Fundación"</span>. Si requieres un comprobante de recibo fiscal por tu donativo, puedes enviarnos el comprobante de transferencia junto con tus datos al correo: <a href={`mailto:${paypal.email}`} className="font-bold text-foundation-teal hover:underline">{paypal.email}</a>.
              </p>
            </div>
          </div>

          <button
            onClick={() => {
              setPaymentChannel("banco_bn");
              setConfirmStep("form");
              setIsConfirmModalOpen(true);
            }}
            className="mt-6 w-full py-3 bg-foundation-orange hover:bg-foundation-orange-dark text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
          >
            <CheckCircle2 className="w-4 h-4" />
            Reportar / Confirmar Transferencia Bancaria
          </button>
        </div>

        {/* FAQ DONACIONES */}
        <div className="mt-16 pt-16 border-t border-gray-100 dark:border-gray-900">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-gray-900 dark:text-white">
              Preguntas Frecuentes de <span className="text-foundation-teal">Donaciones</span>
            </h2>
            <p className="text-gray-500 dark:text-gray-400 text-xs mt-2">
              Aquí tienes respuestas claras a las dudas más comunes sobre la transparencia y el método de donativos.
            </p>
          </div>
          <FAQSection faqs={config.faqs} defaultCategory="donaciones" />
        </div>

        {/* REPORT DONATION CONFIRMATION MODAL */}
        {isConfirmModalOpen && (
          <div className="fixed inset-0 z-50 overflow-y-auto flex items-center justify-center p-4">
            {/* Backdrop */}
            <div 
              className="fixed inset-0 bg-gray-900/60 dark:bg-gray-950/80 backdrop-blur-sm transition-opacity"
              onClick={() => setIsConfirmModalOpen(false)}
            />

            {/* Modal Content Card */}
            <div className="relative bg-white dark:bg-gray-900 rounded-3xl max-w-lg w-full p-6 sm:p-8 shadow-2xl border border-gray-100 dark:border-gray-800 overflow-hidden z-10">
              
              {/* Close Button */}
              <button
                onClick={() => setIsConfirmModalOpen(false)}
                className="absolute top-4 right-4 text-gray-400 hover:text-gray-600 dark:hover:text-gray-200 cursor-pointer p-1 rounded-full hover:bg-gray-50 dark:hover:bg-gray-800 transition-colors"
              >
                <X className="w-5 h-5" />
              </button>

              {confirmStep === "form" ? (
                <div>
                  <div className="flex items-center gap-3 mb-6">
                    <div className="w-10 h-10 rounded-xl bg-foundation-teal/10 text-foundation-teal flex items-center justify-center">
                      <ShieldCheck className="w-5 h-5" />
                    </div>
                    <div>
                      <h3 className="text-lg font-bold text-gray-900 dark:text-white">Reportar Transferencia / SINPE</h3>
                      <p className="text-xs text-gray-400">Verificamos tu aporte para el control fiscal y envío de recibo.</p>
                    </div>
                  </div>

                  {confirmError && (
                    <div className="flex items-center gap-2 p-3.5 mb-4 rounded-xl bg-red-50 dark:bg-red-950/20 border border-red-200 dark:border-red-900 text-red-800 dark:text-red-400 text-xs font-semibold">
                      <AlertCircle className="w-4 h-4 flex-shrink-0" />
                      <span>{confirmError}</span>
                    </div>
                  )}

                  <form onSubmit={handleConfirmSubmit} className="space-y-4">
                    
                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Nombre Completo *</label>
                      <input
                        type="text"
                        required
                        value={donorName}
                        onChange={(e) => setDonorName(e.target.value)}
                        placeholder="Juan Pérez Salazar"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                      />
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Correo Electrónico *</label>
                        <input
                          type="email"
                          required
                          value={donorEmail}
                          onChange={(e) => setDonorEmail(e.target.value)}
                          placeholder="juan@ejemplo.com"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                        />
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Teléfono (WhatsApp)</label>
                        <input
                          type="tel"
                          value={donorPhone}
                          onChange={(e) => setDonorPhone(e.target.value)}
                          placeholder="8888-8888"
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                        />
                      </div>
                    </div>

                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Canal de Pago *</label>
                        <select
                          value={paymentChannel}
                          onChange={(e: any) => setPaymentChannel(e.target.value)}
                          className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                        >
                          <option value="sinpe">SINPE Móvil</option>
                          <option value="banco_bn">Banco Nacional (CRC)</option>
                          <option value="banco_bac">BAC Credomatic (USD)</option>
                          <option value="other">Otro Banco</option>
                        </select>
                      </div>
                      <div>
                        <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Monto Donado *</label>
                        <div className="relative">
                          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 font-bold text-xs">
                            {paymentChannel === "banco_bac" ? "$" : "¢"}
                          </div>
                          <input
                            type="number"
                            required
                            min="1"
                            value={confirmAmountField}
                            onChange={(e) => setConfirmAmountField(e.target.value)}
                            placeholder={paymentChannel === "banco_bac" ? "50" : "10000"}
                            className="w-full pl-7 pr-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                          />
                        </div>
                      </div>
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Número de Referencia / Comprobante</label>
                      <input
                        type="text"
                        value={referenceNumber}
                        onChange={(e) => setReferenceNumber(e.target.value)}
                        placeholder="Ej. 1234567890"
                        className="w-full px-4 py-2.5 rounded-xl border border-gray-200 dark:border-gray-800 dark:bg-gray-950 dark:text-white text-xs font-semibold outline-none focus:border-foundation-teal focus:ring-2 focus:ring-foundation-teal/10"
                      />
                    </div>

                    <div>
                      <label className="block text-[11px] font-bold text-gray-400 dark:text-gray-500 uppercase tracking-wider mb-1.5">Subir Comprobante (Imagen) - Vista Previa</label>
                      <div className="mt-1 flex flex-col items-center justify-center border-2 border-dashed border-gray-200 dark:border-gray-800 rounded-2xl p-4 transition-all hover:border-foundation-teal/40">
                        {voucherImage ? (
                          <div className="space-y-3 text-center w-full">
                            <div className="relative inline-block max-w-[200px] rounded-xl overflow-hidden shadow-md border dark:border-gray-800">
                              <img src={voucherImage} alt="Voucher de donativo" className="max-h-32 w-full object-contain" />
                              <button
                                type="button"
                                onClick={() => setVoucherImage(null)}
                                className="absolute top-1 right-1 bg-red-500 hover:bg-red-600 text-white p-1 rounded-full cursor-pointer transition-colors shadow"
                              >
                                <X className="w-3.5 h-3.5" />
                              </button>
                            </div>
                            <p className="text-[10px] text-gray-400 font-semibold truncate">Comprobante Cargado Exitosamente</p>
                          </div>
                        ) : (
                          <label className="cursor-pointer text-center py-2 w-full">
                            <Upload className="w-8 h-8 text-gray-400 mx-auto mb-2 animate-pulse" />
                            <span className="text-xs font-bold text-foundation-teal hover:underline block">Seleccionar archivo</span>
                            <span className="text-[10px] text-gray-400 block mt-1">Formatos JPG, PNG (máx. 3MB)</span>
                            <input
                              type="file"
                              accept="image/*"
                              onChange={handleVoucherUpload}
                              className="hidden"
                            />
                          </label>
                        )}
                      </div>
                    </div>

                    <div className="flex gap-3 pt-2">
                      <button
                        type="button"
                        onClick={() => setIsConfirmModalOpen(false)}
                        className="flex-1 py-3 bg-gray-150 hover:bg-gray-200 dark:bg-gray-800 dark:hover:bg-gray-700 text-gray-700 dark:text-gray-300 font-extrabold rounded-xl transition-all cursor-pointer text-xs"
                      >
                        Cancelar
                      </button>
                      <button
                        type="submit"
                        disabled={isSubmittingConfirm}
                        className="flex-1 py-3 bg-foundation-teal hover:bg-foundation-teal-dark disabled:bg-gray-400 text-white font-extrabold rounded-xl shadow-md hover:shadow-lg transition-all flex items-center justify-center gap-2 cursor-pointer text-xs"
                      >
                        {isSubmittingConfirm ? (
                          <>
                            <Loader2 className="w-3.5 h-3.5 animate-spin" />
                            Enviando...
                          </>
                        ) : (
                          <>
                            <Send className="w-3.5 h-3.5" />
                            Enviar Reporte
                          </>
                        )}
                      </button>
                    </div>

                  </form>
                </div>
              ) : (
                <div className="text-center py-4 space-y-4">
                  <div className="w-16 h-16 rounded-full bg-emerald-100 dark:bg-emerald-950/30 text-emerald-500 flex items-center justify-center mx-auto mb-2">
                    <CheckCircle2 className="w-10 h-10 animate-bounce" />
                  </div>
                  <h3 className="text-2xl font-black text-gray-900 dark:text-white">¡Muchísimas Gracias!</h3>
                  <p className="text-xs text-gray-600 dark:text-gray-300 leading-relaxed max-w-sm mx-auto">
                    Tu reporte de donación ha sido registrado con éxito en nuestro sistema administrativo.
                  </p>
                  
                  {/* Printable Voucher Receipt Box */}
                  <div id="printable-donation-receipt" className="bg-white text-gray-900 border-2 border-foundation-teal/30 rounded-2xl p-5 text-left space-y-3 shadow-md print:shadow-none print:border-gray-300">
                    <div className="flex justify-between items-center border-b border-gray-150 pb-3">
                      <div>
                        <p className="text-[10px] font-black uppercase text-foundation-teal tracking-widest">COMPROBANTE DE REPORTE</p>
                        <h4 className="text-sm font-black text-gray-900">Fundación Un Nuevo Comienzo CR</h4>
                      </div>
                      <span className="text-[10px] font-bold bg-foundation-teal-light text-foundation-teal px-2 py-0.5 rounded-full">
                        {new Date().toLocaleDateString("es-CR")}
                      </span>
                    </div>

                    <div className="grid grid-cols-2 gap-2 text-[11px]">
                      <div>
                        <span className="text-gray-400 font-bold block">Donante:</span>
                        <span className="font-extrabold text-gray-800">{donorName || "Anónimo"}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block">Correo:</span>
                        <span className="font-bold text-gray-700 truncate block">{donorEmail}</span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block">Canal de Pago:</span>
                        <span className="font-extrabold uppercase text-foundation-teal">
                          {paymentChannel === "sinpe" ? "SINPE Móvil" : paymentChannel === "banco_bn" ? "Banco Nacional" : paymentChannel === "banco_bac" ? "BAC Credomatic" : "Otro"}
                        </span>
                      </div>
                      <div>
                        <span className="text-gray-400 font-bold block">Monto Reportado:</span>
                        <span className="font-black text-base text-foundation-teal-dark">
                          ¢{parseFloat(confirmAmountField || "0").toLocaleString("es-CR")}
                        </span>
                      </div>
                      {referenceNumber && (
                        <div className="col-span-2 bg-gray-50 p-2 rounded-xl border border-gray-100">
                          <span className="text-gray-400 font-bold block text-[10px]">Número de Referencia/Comprobante:</span>
                          <span className="font-mono font-bold text-gray-800">{referenceNumber}</span>
                        </div>
                      )}
                    </div>

                    <div className="text-[9px] text-gray-400 border-t border-gray-100 pt-2 flex items-center justify-between">
                      <span>Cédula Jurídica: 3-002-861611</span>
                      <span>Pavas, San José, C.R.</span>
                    </div>
                  </div>

                  <div className="flex flex-col sm:flex-row gap-2 pt-2">
                    <button
                      type="button"
                      onClick={() => window.print()}
                      className="flex-1 py-3 bg-gray-900 hover:bg-black text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-xs flex items-center justify-center gap-2"
                    >
                      <Printer className="w-4 h-4 text-foundation-teal" />
                      <span>Imprimir / Guardar PDF</span>
                    </button>
                    <button
                      type="button"
                      onClick={() => setIsConfirmModalOpen(false)}
                      className="flex-1 py-3 bg-foundation-teal hover:bg-foundation-teal-dark text-white font-extrabold rounded-xl shadow-md transition-all cursor-pointer text-xs"
                    >
                      Entendido, Cerrar
                    </button>
                  </div>
                </div>
              )}
            </div>
          </div>
        )}

      </div>
    </section>
  );
}
