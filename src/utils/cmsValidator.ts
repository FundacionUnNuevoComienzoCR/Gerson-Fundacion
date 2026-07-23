export interface ValidationResult {
  isValid: boolean;
  errors: string[];
  warnings: string[];
}

export function validateCMSConfig(config: any): ValidationResult {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (!config || typeof config !== "object") {
    return { isValid: false, errors: ["El objeto de configuración no es válido."], warnings: [] };
  }

  // 1. Hero Section Check
  if (!config.hero?.title?.trim()) {
    warnings.push("El título principal del Hero está vacío.");
  }

  // 2. Sobre Nosotros (About) Check
  if (!config.about?.whoWeAreTitle?.trim()) {
    warnings.push("El título de '¿Quiénes Somos?' en Sobre Nosotros está vacío.");
  }

  // 3. Founders (Fundadores) Check
  if (Array.isArray(config.founders)) {
    config.founders.forEach((founder: any, index: number) => {
      const idxStr = `#${index + 1}`;
      if (!founder.name?.trim()) {
        warnings.push(`Fundador ${idxStr}: Se sugiere ingresar un nombre.`);
      }
    });
  }

  // 4. Testimonios Check
  if (Array.isArray(config.testimonials)) {
    config.testimonials.forEach((testimony: any, index: number) => {
      const idxStr = `#${index + 1}`;
      if (!testimony.name?.trim()) {
        warnings.push(`Testimonio ${idxStr}: Se sugiere asignar un nombre.`);
      }
    });
  }

  // 5. Footer Check
  if (!config.footer?.organizationName?.trim()) {
    warnings.push("Footer: Se sugiere verificar el nombre de la organización.");
  }

  return {
    isValid: errors.length === 0,
    errors,
    warnings
  };
}

