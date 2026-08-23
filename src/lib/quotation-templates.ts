/**
 * Starter content for common project types (product-plan.md §6.4).
 *
 * These are static presets, not user-editable records — picking one just
 * pre-fills the quotation's detail fields and seeds a few line items that
 * the user can then edit freely. A reusable/editable template library is a
 * future-phase concern (see docs/future-phases-backlog.md).
 */

export interface QuotationTemplateItem {
  type: "section" | "item";
  title: string;
  description?: string;
  quantity: number;
  unit?: string;
  unitPrice: number;
  taxRate: number;
}

export interface QuotationTemplate {
  id: string;
  name: string;
  description: string;
  scopeOfWork: string;
  deliverables: string;
  timeline: string;
  assumptions: string;
  exclusions: string;
  terms: string;
  items: QuotationTemplateItem[];
}

export const QUOTATION_TEMPLATES: QuotationTemplate[] = [
  {
    id: "website-development",
    name: "Website development",
    description: "Marketing site or business website, design through launch.",
    scopeOfWork:
      "Design and development of a responsive website, including up to 5 pages, a contact form, and basic SEO setup.",
    deliverables:
      "Figma design files\nResponsive, cross-browser website\nContact form wired to email\nBasic on-page SEO (titles, meta descriptions, sitemap)",
    timeline: "Design: 1–2 weeks\nDevelopment: 2–3 weeks\nReview & launch: 1 week",
    assumptions:
      "Client provides content (copy, images) before development starts.\nUp to 2 rounds of design revisions are included.",
    exclusions: "Ongoing hosting, domain registration, and content writing are not included.",
    terms: "50% advance to begin work, balance due before launch. Quote valid for 30 days.",
    items: [
      { type: "section", title: "Design", quantity: 1, unitPrice: 0, taxRate: 0 },
      {
        type: "item",
        title: "UI/UX design (up to 5 pages)",
        description: "Wireframes and high-fidelity mockups in Figma",
        quantity: 1,
        unit: "project",
        unitPrice: 25000,
        taxRate: 18,
      },
      { type: "section", title: "Development", quantity: 1, unitPrice: 0, taxRate: 0 },
      {
        type: "item",
        title: "Frontend development",
        description: "Responsive build of approved designs",
        quantity: 1,
        unit: "project",
        unitPrice: 45000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "Contact form & basic SEO",
        quantity: 1,
        unit: "project",
        unitPrice: 8000,
        taxRate: 18,
      },
    ],
  },
  {
    id: "mobile-app-development",
    name: "Mobile app development",
    description: "Native or cross-platform app, from design to store-ready build.",
    scopeOfWork:
      "Design and development of a cross-platform mobile app (iOS and Android) covering the core feature set discussed.",
    deliverables:
      "Figma design files\niOS and Android app builds\nBackend API integration\nApp store & Play Store submission support",
    timeline:
      "Design: 2 weeks\nDevelopment: 6–8 weeks\nTesting & submission: 1–2 weeks",
    assumptions:
      "Client provides brand assets and API documentation for any third-party integrations.\nUp to 2 rounds of design revisions are included.",
    exclusions:
      "Apple Developer / Google Play account fees, and ongoing maintenance after launch, are not included.",
    terms: "40% advance, 30% at design approval, 30% before store submission. Quote valid for 30 days.",
    items: [
      { type: "section", title: "Design", quantity: 1, unitPrice: 0, taxRate: 0 },
      {
        type: "item",
        title: "App UI/UX design",
        quantity: 1,
        unit: "project",
        unitPrice: 40000,
        taxRate: 18,
      },
      { type: "section", title: "Development", quantity: 1, unitPrice: 0, taxRate: 0 },
      {
        type: "item",
        title: "Cross-platform app development",
        description: "iOS + Android from a single codebase",
        quantity: 1,
        unit: "project",
        unitPrice: 150000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "Backend API integration",
        quantity: 1,
        unit: "project",
        unitPrice: 30000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "Store submission support",
        quantity: 1,
        unit: "project",
        unitPrice: 10000,
        taxRate: 18,
      },
    ],
  },
  {
    id: "ui-ux-design",
    name: "UI/UX design",
    description: "Design-only engagement — wireframes through high-fidelity screens.",
    scopeOfWork:
      "User research review, wireframing, and high-fidelity UI design for the agreed set of screens.",
    deliverables: "User flows\nWireframes\nHigh-fidelity Figma screens\nDesign handoff notes",
    timeline: "Wireframes: 1 week\nHigh-fidelity design: 2 weeks\nHandoff: 2–3 days",
    assumptions:
      "Client provides brand guidelines (or a brand-exploration add-on can be quoted separately).\nUp to 3 rounds of feedback are included.",
    exclusions: "Development/implementation of the designs is not included.",
    terms: "50% advance, balance on final handoff. Quote valid for 30 days.",
    items: [
      {
        type: "item",
        title: "User flows & wireframes",
        quantity: 1,
        unit: "project",
        unitPrice: 15000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "High-fidelity UI design",
        quantity: 1,
        unit: "project",
        unitPrice: 35000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "Design handoff & documentation",
        quantity: 1,
        unit: "project",
        unitPrice: 5000,
        taxRate: 18,
      },
    ],
  },
  {
    id: "software-maintenance",
    name: "Software maintenance",
    description: "Ongoing bug fixes, small updates, and support for an existing product.",
    scopeOfWork:
      "Bug fixes, minor enhancements, and technical support for the existing application on a monthly basis.",
    deliverables:
      "Bug triage and fixes\nMinor feature updates\nMonthly status report",
    timeline: "Ongoing — billed monthly, cancel anytime with 30 days' notice.",
    assumptions: "Covers up to the allotted hours per month; work beyond that is quoted separately.",
    exclusions: "Major new features and infrastructure changes are quoted as separate projects.",
    terms: "Invoiced monthly in advance. Quote valid for 30 days.",
    items: [
      {
        type: "item",
        title: "Monthly maintenance retainer",
        description: "Up to 20 hours/month of bug fixes and minor updates",
        quantity: 1,
        unit: "month",
        unitPrice: 20000,
        taxRate: 18,
      },
    ],
  },
  {
    id: "monthly-development-retainer",
    name: "Monthly development retainer",
    description: "Dedicated development capacity billed on a recurring monthly basis.",
    scopeOfWork:
      "Dedicated development hours each month for ongoing feature work, prioritized from the client's backlog.",
    deliverables: "Sprint planning\nFeature development\nCode reviews\nMonthly demo & report",
    timeline: "Ongoing — monthly cycles, renewable.",
    assumptions:
      "Client provides a prioritized backlog at the start of each month.\nUnused hours do not roll over unless agreed separately.",
    exclusions: "Design work is not included unless added as a separate line item.",
    terms: "Invoiced monthly in advance. 30 days' notice to pause or cancel.",
    items: [
      {
        type: "item",
        title: "Development retainer",
        description: "Dedicated development hours per month",
        quantity: 1,
        unit: "month",
        unitPrice: 60000,
        taxRate: 18,
      },
    ],
  },
  {
    id: "consulting",
    name: "Consulting",
    description: "Advisory engagement — audits, technical strategy, or architecture review.",
    scopeOfWork:
      "Technical audit and strategy consulting covering the current system, with recommendations and a prioritized action plan.",
    deliverables: "Findings document\nPrioritized recommendations\nFollow-up review call",
    timeline: "Engagement: 1–2 weeks from kickoff.",
    assumptions: "Client provides access to relevant systems, code, and stakeholders as needed.",
    exclusions: "Implementation of recommendations is not included and can be quoted separately.",
    terms: "100% advance for engagements under 2 weeks. Quote valid for 30 days.",
    items: [
      {
        type: "item",
        title: "Technical audit & recommendations",
        quantity: 1,
        unit: "project",
        unitPrice: 25000,
        taxRate: 18,
      },
      {
        type: "item",
        title: "Follow-up review call",
        quantity: 1,
        unit: "session",
        unitPrice: 5000,
        taxRate: 18,
      },
    ],
  },
];

export function getQuotationTemplate(id: string | null | undefined): QuotationTemplate | null {
  if (!id) return null;
  return QUOTATION_TEMPLATES.find((t) => t.id === id) ?? null;
}
