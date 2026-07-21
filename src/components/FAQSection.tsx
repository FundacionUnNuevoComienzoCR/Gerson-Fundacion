import React, { useState } from "react";
import { motion, AnimatePresence } from "motion/react";
import { HelpCircle, ChevronDown, ChevronUp, Search, Heart, Users, Info } from "lucide-react";
import { FAQItem } from "../types";

interface FAQSectionProps {
  faqs?: FAQItem[];
  defaultCategory?: "donaciones" | "voluntariado" | "general" | "all";
}

export default function FAQSection({ faqs = [], defaultCategory = "all" }: FAQSectionProps) {
  const [activeCategory, setActiveCategory] = useState<"donaciones" | "voluntariado" | "general" | "all">(defaultCategory);
  const [searchQuery, setSearchQuery] = useState("");
  const [expandedId, setExpandedId] = useState<string | null>(null);

  const toggleExpand = (id: string) => {
    setExpandedId((prev) => (prev === id ? null : id));
  };

  // Filter FAQs based on search and active category
  const filteredFaqs = faqs.filter((faq) => {
    const matchesCategory = activeCategory === "all" || faq.category === activeCategory;
    const matchesSearch =
      faq.question.toLowerCase().includes(searchQuery.toLowerCase()) ||
      faq.answer.toLowerCase().includes(searchQuery.toLowerCase());
    return matchesCategory && matchesSearch;
  });

  const categories = [
    { id: "all", label: "Todas", icon: HelpCircle },
    { id: "donaciones", label: "Donaciones", icon: Heart },
    { id: "voluntariado", label: "Voluntariado", icon: Users },
    { id: "general", label: "General", icon: Info },
  ] as const;

  return (
    <div className="w-full max-w-4xl mx-auto px-4 py-8" id="preguntas-frecuentes">
      {/* Search and Filter Area */}
      <div className="space-y-6 mb-8">
        <div className="relative">
          <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none text-gray-400 dark:text-gray-500">
            <Search className="w-5 h-5" />
          </div>
          <input
            type="text"
            placeholder="Buscar preguntas frecuentes..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full pl-10 pr-4 py-3 bg-white dark:bg-gray-850 border border-gray-200 dark:border-gray-800 rounded-2xl text-sm font-semibold outline-none focus:ring-2 focus:ring-foundation-teal/20 focus:border-foundation-teal transition-all text-gray-800 dark:text-gray-150 shadow-sm"
          />
        </div>

        {/* Category Selector Pills */}
        <div className="flex flex-wrap gap-2 justify-center sm:justify-start">
          {categories.map((cat) => {
            const Icon = cat.icon;
            const isActive = activeCategory === cat.id;
            return (
              <button
                key={cat.id}
                onClick={() => {
                  setActiveCategory(cat.id);
                  setExpandedId(null); // Close any open questions when switching tabs
                }}
                className={`flex items-center gap-2 px-4 py-2.5 rounded-full text-xs font-bold transition-all duration-200 cursor-pointer ${
                  isActive
                    ? "bg-foundation-teal text-white shadow-md shadow-foundation-teal/15"
                    : "bg-gray-50 dark:bg-gray-800 text-gray-600 dark:text-gray-400 hover:bg-gray-100 dark:hover:bg-gray-700 border border-gray-150 dark:border-gray-750"
                }`}
              >
                <Icon className="w-3.5 h-3.5" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>
      </div>

      {/* Accordion Questions List */}
      <div className="space-y-4">
        {filteredFaqs.length === 0 ? (
          <div className="text-center py-12 bg-gray-50 dark:bg-gray-850/50 rounded-2xl border border-gray-150 dark:border-gray-800 text-gray-500 dark:text-gray-400">
            <HelpCircle className="w-10 h-10 mx-auto stroke-1 mb-2 text-gray-300" />
            <p className="text-sm font-bold">No se encontraron preguntas frecuentes.</p>
            <p className="text-xs mt-1">Prueba con otro término de búsqueda o selecciona otra pestaña.</p>
          </div>
        ) : (
          filteredFaqs.map((faq) => {
            const isExpanded = expandedId === faq.id;
            return (
              <div
                key={faq.id}
                className={`bg-white dark:bg-gray-850 border rounded-2xl transition-all duration-200 ${
                  isExpanded
                    ? "border-foundation-teal dark:border-foundation-teal/40 shadow-md ring-1 ring-foundation-teal/10"
                    : "border-gray-150 dark:border-gray-800 hover:border-foundation-teal/40 hover:shadow-sm"
                }`}
              >
                <button
                  onClick={() => toggleExpand(faq.id)}
                  className="w-full flex items-center justify-between p-5 text-left font-bold text-sm sm:text-base text-gray-800 dark:text-gray-100 cursor-pointer select-none"
                >
                  <span className="pr-4">{faq.question}</span>
                  <div className={`p-1.5 rounded-xl bg-gray-50 dark:bg-gray-800 text-gray-500 dark:text-gray-400 transition-transform duration-200 ${isExpanded ? "rotate-180 text-foundation-teal" : ""}`}>
                    <ChevronDown className="w-4 h-4" />
                  </div>
                </button>

                <AnimatePresence initial={false}>
                  {isExpanded && (
                    <motion.div
                      initial={{ height: 0, opacity: 0 }}
                      animate={{ height: "auto", opacity: 1 }}
                      exit={{ height: 0, opacity: 0 }}
                      transition={{ duration: 0.25, ease: "easeInOut" }}
                      className="overflow-hidden"
                    >
                      <div className="px-5 pb-5 pt-1 text-sm leading-relaxed text-gray-600 dark:text-gray-300 font-medium border-t border-gray-50 dark:border-gray-800/50">
                        {faq.answer}
                      </div>
                    </motion.div>
                  )}
                </AnimatePresence>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
