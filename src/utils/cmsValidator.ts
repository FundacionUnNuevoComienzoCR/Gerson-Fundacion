export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCMSConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config) {
    return { isValid: false, errors: ["El objeto de configuración está vacío."], warnings: [] };
  }

  // 1. Hero Section Validation
  if (!config.hero?.title?.trim()) {
    errors.push("El título principal del Hero no puede estar vacío.");
  }
  if (!config.hero?.subtitle?.trim()) {
    warnings.push("Se recomienda definir un subtítulo para la portada (Hero).");
  }

  // 2. Sobre Nosotros (About) Validation
  if (!config.about?.whoWeAreTitle?.trim()) {
    errors.push("El título de '¿Quiénes Somos?' en Sobre Nosotros es requerido.");
  }

  // 3. Founders (Fundadores) Validation
  if (Array.isArray(config.founders)) {
    config.founders.forEach((founder: any, index: number) => {
      const idxStr = `#${index + 1}`;
      if (!founder.name?.trim()) {
        errors.push(`Fundador ${idxStr}: El nombre completo es obligatorio.`);
      }
      if (!founder.role?.trim()) {
        errors.push(`Fundador ${idxStr} (${founder.name || "Sin Nombre"}): El cargo o rol es obligatorio.`);
      }
      if (!founder.description?.trim()) {
        warnings.push(`Fundador ${idxStr} (${founder.name || "Sin Nombre"}): Se recomienda agregar una breve reseña.`);
      }
      if (!founder.imageUrl?.trim()) {
        warnings.push(`Fundador ${idxStr} (${founder.name || "Sin Nombre"}): Falta asignar una imagen de perfil o avatar.`);
      }
    });
  } else {
    warnings.push("No se encontró la lista de fundadores.");
  }

  // 4. Testimonios Validation
  if (Array.isArray(config.testimonials)) {
    config.testimonials.forEach((testimony: any, index: number) => {
      const idxStr = `#${index + 1}`;
      if (!testimony.name?.trim()) {
        errors.push(`Testimonio ${idxStr}: El nombre de la persona es obligatorio.`);
      }
      if (!testimony.text?.trim()) {
        errors.push(`Testimonio ${idxStr} (${testimony.name || "Sin Nombre"}): El texto del testimonio no puede estar vacío.`);
      }
      if (!testimony.imageUrl?.trim()) {
        warnings.push(`Testimonio ${idxStr} (${testimony.name || "Sin Nombre"}): Se sugiere agregar la foto del testimonio.`);
      }
    });
  }

  // 5. Footer Validation
  if (!config.footer?.year?.toString().trim()) {
    errors.push("Footer: El año del pie de página es obligatorio.");
  }
  if (!config.footer?.organizationName?.trim()) {
    errors.push("Footer: El nombre oficial de la fundación es obligatorio.");
  }
  if (!Array.isArray(config.footer?.designers) || config.footer.designers.length === 0 || !config.footer.designers.some((d: string) => d.trim())) {
    warnings.push("Footer: Se recomienda registrar al menos un diseñador/desarrollador en los créditos.");
  }

  // 6. Contact Information Validation
  if (!config.contact?.email?.trim()) {
    errors.push("Contacto: El correo electrónico institucional es obligatorio.");
  } else if (!config.contact.email.includes("@")) {
    errors.push("Contacto: El correo electrónico ingresado no tiene un formato válido (@).");
  }

  if (!config.contact?.phone?.trim()) {
    warnings.push("Contacto: Se recomienda especificar un teléfono institucional.");
  }

  // 7. SINPE / Payment Info Validation
  if (!config.sinpe?.phone?.trim()) {
    warnings.push("Donaciones: No hay número telefónico asignado a SINPE Móvil.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}
