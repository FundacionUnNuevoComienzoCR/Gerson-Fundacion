export interface SINPEConfig {
  phone: string;
  holder: string;
  idNumber: string;
  instructions: string;
}

export interface PayPalConfig {
  email: string;
  currency: string;
  active: boolean;
}

export interface BankAccount {
  bankName: string;
  currency: string;
  iban: string;
  holder: string;
  idType: string;
  idNumber: string;
}

export interface HeroConfig {
  title: string;
  subtitle: string;
  imageUrl: string;
  ctaText: string;
}

export interface SectionConfig {
  title: string;
  description: string;
  iconName: string;
}

export interface AboutConfig {
  whoWeAreTitle: string;
  whoWeAreSub: string;
  whoWeAreText: string;
  whoWeAreImage: string;
  detailedText1: string;
  detailedText2: string;
  detailedText3: string;
  historyText: string;
}

export interface Program {
  id: string;
  name: string;
  description: string;
  imageUrl: string;
}

export interface QuoteBanner {
  title: string;
  text1: string;
  text2: string;
  subtitle: string;
  imageUrl: string;
}

export interface Founder {
  id: string;
  name: string;
  role: string;
  description: string;
  imageUrl: string;
}

export interface Sponsor {
  id?: string;
  name: string;
  logoUrl?: string;
  description?: string;
  websiteUrl?: string;
}

export interface TextBlock {
  title: string;
  description: string;
}

export interface Testimonial {
  id: string;
  name: string;
  role: string;
  text: string;
  imageUrl?: string;
}

export interface DonationGoal {
  monthlyGoal: number;
  currentAmount: number;
  currency: string;
}

export interface BrandingConfig {
  logoUrl?: string;
  bannerUrl?: string;
}

export interface WhatsAppConfig {
  phone: string;
  message: string;
}

export interface CustomSocialLink {
  id: string;
  label: string;
  url: string;
}

export interface ContactConfig {
  address: string;
  phone: string;
  email: string;
  hours: string;
  facebookUrl?: string;
  instagramUrl?: string;
  tiktokUrl?: string;
  youtubeUrl?: string;
  twitterUrl?: string;
  linkedinUrl?: string;
  customSocialLinks?: CustomSocialLink[];
  coordinates?: {
    lat: number;
    lng: number;
  };
}

export interface AppConfig {
  sinpe: SINPEConfig;
  paypal: PayPalConfig;
  bankAccounts: BankAccount[];
  hero: HeroConfig;
  mision: SectionConfig;
  vision: SectionConfig;
  objetivo: SectionConfig;
  about: AboutConfig;
  programs: Program[];
  quoteBanner: QuoteBanner;
  founders: Founder[];
  sponsors: Sponsor[];
  gallery: string[];
  contact: ContactConfig;
  patrocinioBlock: TextBlock;
  voluntariadoBlock: TextBlock;
  donationGoal?: DonationGoal;
  testimonials?: Testimonial[];
  branding?: BrandingConfig;
  whatsapp?: WhatsAppConfig;
  faqs?: FAQItem[];
  seo?: SEOConfig;
  globalNotice?: GlobalNoticeConfig;
}

export interface SEOConfig {
  title: string;
  description: string;
  keywords: string;
  ogTitle: string;
  ogDescription: string;
  ogImage: string;
}

export interface GlobalNoticeConfig {
  active: boolean;
  text: string;
  type: "info" | "alert" | "success";
  ctaText?: string;
  ctaLink?: string;
}

export interface FAQItem {
  id: string;
  question: string;
  answer: string;
  category: "donaciones" | "voluntariado" | "general";
}

export interface ContactMessage {
  id: string;
  name: string;
  email: string;
  message: string;
  createdAt: string;
}
