import type {
  Benefit,
  Capability,
  FaqItem,
  FeatureHighlight,
  HowToUseStep,
  PricingPlan,
  Testimonial,
  ValueProp,
} from "../types/content";

// ─── Trusted section ─────────────────────────────────────────────────────────
export const restaurantCategories = [
  "Restaurants",
  "Cafés",
  "Quick-Service Restaurants",
  "Cloud Kitchens",
  "Food Courts",
  "Fine Dining",
  "Casual Dining",
  "Bakeries",
];

// ─── Value propositions (Proof section) ──────────────────────────────────────
export const valueProps: ValueProp[] = [
  {
    title: "QR Ordering & Menu",
    description: "Let customers order directly from their table with instant digital menus.",
    icon: "/icons/benefit-seamless.svg",
  },
  {
    title: "Live Kitchen Operations",
    description: "Connect table orders to kitchen KOTs and staff in real time without delays.",
    icon: "/icons/capability-cross-platform.svg",
  },
  {
    title: "Inventory, CRM & Analytics",
    description: "Manage ingredients, retain repeat customers and monitor revenue from one dashboard.",
    icon: "/icons/benefit-personalized.svg",
  },
];

// ─── Benefits ────────────────────────────────────────────────────────────────
export const benefits: Benefit[] = [
  {
    title: "Faster Table Turnaround",
    description: "Guests scan, order and pay without waiting for waiters, increasing table capacity.",
    icon: "/icons/benefit-seamless.svg",
  },
  {
    title: "Zero App Download",
    description: "Works instantly on any mobile browser. Just scan the table QR code to start.",
    icon: "/icons/benefit-global-reach.svg",
  },
  {
    title: "Live Kitchen / KOT",
    description: "Orders dispatch straight to kitchen display systems or receipt printers in seconds.",
    icon: "/icons/benefit-community.svg",
  },
  {
    title: "Waiter Assistance",
    description: "Staff can take table orders, modify items and respond to customer call requests.",
    icon: "/icons/benefit-authentic-connections.svg",
  },
  {
    title: "Real-Time Analytics",
    description: "Track top-selling dishes, peak dining hours, staff performance and daily revenue.",
    icon: "/icons/benefit-personalized.svg",
  },
  {
    title: "Multi-Outlet Management",
    description: "Control multiple restaurant branches, menus, and staff roles from a single account.",
    icon: "/icons/benefit-privacy.svg",
  },
];

// ─── Key Feature highlights ───────────────────────────────────────────────────
export const featureHighlights: FeatureHighlight[] = [
  {
    label: "Never Run Out of Stock — track inventory & low-stock items.",
    icon: "/icons/feature-smart-matching.svg",
  },
  {
    label: "Know Your Customers — manage relationships, loyalty and repeat visits.",
    icon: "/icons/feature-custom-profile.svg",
  },
  {
    label: "Bring Customers Back — create targeted marketing campaigns.",
    icon: "/icons/feature-notifications.svg",
  },
];

export const allFeatures = [
  "QR Ordering",
  "Digital Menu",
  "Live Orders",
  "KOT / Kitchen Operations",
  "Tables & QR Codes",
  "Menu Management",
  "Inventory Management",
  "CRM",
  "Customer Loyalty",
  "Marketing Campaigns",
  "Business Analytics",
  "Restaurant Dashboard",
];

// ─── Capabilities ─────────────────────────────────────────────────────────────
export const capabilities: Capability[] = [
  {
    label: "Live Orders & KOT — route orders to kitchen instantly.",
    icon: "/icons/capability-search-filters.svg",
  },
  {
    label: "Tables & QR Codes — assign dynamic QR codes to tables.",
    icon: "/icons/capability-calendar.svg",
  },
  {
    label: "Inventory Management — prevent stockouts with low-stock alerts.",
    icon: "/icons/capability-cross-platform.svg",
  },
  {
    label: "CRM & Marketing — reward loyal guests and drive repeat visits.",
    icon: "/icons/capability-translation.svg",
  },
];

// ─── How It Works steps ───────────────────────────────────────────────────────
export const howToUseSteps: HowToUseStep[] = [
  {
    title: "Scan the table QR",
    description: "Guests scan the dynamic QR code placed on their table to instantly access your digital menu.",
    screen: "/images/app-step-scan.png",
    screenAlt: "Scan the table QR code to view the digital menu",
  },
  {
    title: "Browse the menu and order",
    description: "Customers can browse beautiful digital menus, customize dishes, and place orders directly.",
    screen: "/images/app-step-order.png",
    screenAlt: "Browse digital menu categories and place orders",
  },
  {
    title: "Kitchen gets the order instantly",
    description: "Orders are sent straight to the kitchen (KOT), reducing errors and speeding up preparation.",
    screen: "/images/app-step-serve.png",
    screenAlt: "Kitchen order tickets and real-time status",
  },
  {
    title: "Pay when your meal is ready",
    description: "Customers request the bill and pay online or via cash, finishing their dining experience seamlessly.",
    screen: "/images/app-step-pay.png",
    screenAlt: "Pay for the order securely via the digital menu",
  },
];

// ─── Pricing ──────────────────────────────────────────────────────────────────
export const pricingPlans: PricingPlan[] = [
  {
    name: "Starter",
    priceMonthly: "Contact Us",
    priceYearly: "Contact Us",
    period: "",
    description: "For small cafés and bistros getting started with digital table ordering.",
    cta: { label: "Get Started", href: "/#cta" },
    features: [
      { label: "QR Ordering & Digital Menu", included: true },
      { label: "Live Orders & KOT", included: true },
      { label: "Tables & QR Codes", included: true },
      { label: "Inventory Management", included: false },
      { label: "CRM & Customer Loyalty", included: false },
      { label: "Marketing Campaigns", included: false },
    ],
  },
  {
    name: "Growth",
    priceMonthly: "Contact Us",
    priceYearly: "Contact Us",
    period: "",
    description: "For high-volume restaurants requiring full kitchen, table and inventory operations.",
    cta: { label: "Get Started", href: "/#cta" },
    tag: "Most Popular",
    features: [
      { label: "QR Ordering & Digital Menu", included: true },
      { label: "Live Orders & KOT Operations", included: true },
      { label: "Tables & QR Management", included: true },
      { label: "Inventory Management", included: true },
      { label: "CRM & Customer Loyalty", included: true },
      { label: "Business Analytics Dashboard", included: true },
    ],
  },
  {
    name: "Enterprise",
    priceMonthly: "Contact Us",
    priceYearly: "Contact Us",
    period: "",
    description: "For multi-outlet restaurant chains, food courts, and hospitality groups.",
    cta: { label: "Talk to Us", href: "mailto:hello@ordio.in" },
    features: [
      { label: "Everything in Growth", included: true },
      { label: "Multi-Outlet Management", included: true },
      { label: "Marketing Campaigns & Automation", included: true },
      { label: "Custom POS & Printer Integrations", included: true },
      { label: "Dedicated Account Manager", included: true },
      { label: "Custom Analytics & Reports", included: true },
    ],
  },
];

// ─── Testimonials (Product Pillar Highlights) ─────────────────────────────────
export const testimonialsRowOne: Testimonial[] = [
  {
    name: "QR Ordering",
    category: "Guest Experience",
    avatar: "/icons/benefit-seamless.svg",
    quote: "Guests scan table QR codes, browse rich menus with photos, customize orders, and submit in seconds without waiter delays.",
  },
  {
    name: "Live Kitchen / KOT",
    category: "Kitchen Operations",
    avatar: "/icons/capability-cross-platform.svg",
    quote: "Eliminate misplaced paper tickets. Orders flow directly to kitchen display systems with preparation countdowns and item statuses.",
  },
  {
    name: "Inventory Management",
    category: "Stock Control",
    avatar: "/icons/capability-search-filters.svg",
    quote: "Real-time ingredient deduction as orders are prepared. Receive automated alerts before key items run out of stock.",
  },
  {
    name: "Tables & QR Codes",
    category: "Floor Management",
    avatar: "/icons/capability-calendar.svg",
    quote: "Generate custom QR codes per table or section. Monitor occupancy, active orders and waiter calls in real-time.",
  },
];

export const testimonialsRowTwo: Testimonial[] = [
  {
    name: "CRM & Loyalty",
    category: "Customer Retention",
    avatar: "/icons/benefit-personalized.svg",
    quote: "Automatically track guest dining preferences, visit frequency and spend history to build loyalty programs that bring customers back.",
  },
  {
    name: "Digital Bills & Payments",
    category: "Checkout Speed",
    avatar: "/icons/benefit-community.svg",
    quote: "Enable instant bill requests, bill splitting, and direct online UPI or card payments straight from the smartphone screen.",
  },
  {
    name: "Marketing Campaigns",
    category: "Growth & Sales",
    avatar: "/icons/benefit-global-reach.svg",
    quote: "Launch targeted WhatsApp and SMS promotional campaigns for festival offers, happy hours, and lapsed customer win-backs.",
  },
  {
    name: "Business Analytics",
    category: "Data & Insights",
    avatar: "/icons/capability-translation.svg",
    quote: "Gain total visibility into daily revenue, peak table turnover hours, most profitable menu items, and staff operational efficiency.",
  },
];

export const testimonialsMobile: Testimonial[] = [
  {
    name: "QR Ordering",
    category: "Guest Experience",
    avatar: "/icons/benefit-seamless.svg",
    quote: "Guests scan table QR codes, browse rich menus, customize dishes, and submit orders in seconds without waiting for staff.",
  },
  {
    name: "Live Kitchen / KOT",
    category: "Kitchen Operations",
    avatar: "/icons/capability-cross-platform.svg",
    quote: "Orders flow directly to kitchen display systems with preparation countdowns and instant station routing.",
  },
  {
    name: "Inventory Management",
    category: "Stock Control",
    avatar: "/icons/capability-search-filters.svg",
    quote: "Real-time ingredient deduction and automated low-stock warnings keep your restaurant running smoothly.",
  },
  {
    name: "CRM & Analytics",
    category: "Business Intelligence",
    avatar: "/icons/benefit-personalized.svg",
    quote: "Comprehensive dashboards tracking customer repeat visits, average table spend, and operational metrics.",
  },
];

// ─── FAQ ─────────────────────────────────────────────────────────────────────
export const faqs: FaqItem[] = [
  {
    question: "What is Ordio?",
    answer: "Ordio is an all-in-one restaurant and cafe SaaS platform that manages QR ordering, digital menus, live kitchen KOTs, tables, inventory, CRM, marketing campaigns, and analytics from one unified dashboard.",
  },
  {
    question: "Do customers need to download an app?",
    answer: "No. Customers simply scan the QR code placed on their table using their phone camera and can immediately browse, order, and pay directly in their mobile browser.",
  },
  {
    question: "How does Ordio help kitchen and waiter operations?",
    answer: "When an order is placed, it is instantly routed to the kitchen (KOT) and table dashboard. Waiters can assist guests, modify orders, and receive call notifications directly on their devices.",
  },
  {
    question: "Can I manage inventory and low-stock alerts with Ordio?",
    answer: "Yes. Ordio tracks recipe ingredients and stock levels in real time as orders are served, automatically alerting your kitchen before critical items run out.",
  },
  {
    question: "Can I manage multiple restaurants or food court outlets?",
    answer: "Yes. Ordio supports multi-outlet restaurant management, allowing business owners to monitor multiple locations, menus, and staff roles from a single account.",
  },
  {
    question: "How do digital payments and billing work?",
    answer: "Guests can request bills and pay seamlessly using UPI, credit/debit cards, or net banking. Restaurant staff can also process offline cash/card payments with automatic status sync.",
  },
  {
    question: "Does Ordio include customer CRM and marketing tools?",
    answer: "Yes. Ordio captures customer visit frequency, average order values, and dining preferences, allowing you to run targeted loyalty offers and promotional campaigns.",
  },
];

export const featureCards = [
  "/images/app-feature-card-1.png",
  "/images/app-feature-card-2.png",
  "/images/app-feature-card-3.png",
];
