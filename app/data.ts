export type Service = {
  slug: string;
  index: string;
  title: string;
  short: string;
  promise: string;
  description: string;
  outcomes: string[];
  deliverables: string[];
  faqs: { question: string; answer: string }[];
};

export const services: Service[] = [
  {
    slug: "web-design",
    index: "01",
    title: "Web Design",
    short: "Premium, conversion-led websites built to make your business impossible to ignore.",
    promise: "A sharper first impression. A stronger reason to enquire.",
    description:
      "We turn your positioning, customer journey, and commercial goals into a distinct digital experience—designed to earn trust quickly and guide visitors toward action.",
    outcomes: ["Stronger brand perception", "More qualified enquiries", "Clearer customer journeys"],
    deliverables: ["Discovery workshop", "Content architecture", "Responsive visual design", "Conversion strategy", "Interactive prototype", "Design system"],
    faqs: [
      { question: "How long does a website design project take?", answer: "Most focused marketing websites take 4–8 weeks, depending on the number of pages, content readiness, and feedback cycles." },
      { question: "Will the design be custom?", answer: "Yes. Every layout, interaction, and visual decision is shaped around your brand, audience, and growth goals—not a recycled template." },
      { question: "Can you redesign an existing website?", answer: "Absolutely. We audit what is working, identify conversion friction, and rebuild the experience without losing valuable brand equity or SEO signals." },
    ],
  },
  {
    slug: "web-development",
    index: "02",
    title: "Web Development",
    short: "Fast, scalable builds engineered for smooth experiences and dependable growth.",
    promise: "Beautiful on the surface. Serious underneath.",
    description:
      "We develop responsive, accessible, performance-first websites that remain easy to manage as your business grows. Every build is tested across modern devices and browsers.",
    outcomes: ["Faster page loads", "Reliable performance", "Easy future expansion"],
    deliverables: ["Frontend development", "CMS integration", "Technical SEO", "Performance tuning", "Browser testing", "Launch support"],
    faqs: [
      { question: "Which platforms do you use?", answer: "We choose the stack around the project. Modern React and Next.js are strong fits for high-performance marketing sites, while flexible CMS options keep content manageable." },
      { question: "Will I be able to edit the website?", answer: "Yes. We can connect an easy-to-use CMS and structure reusable content so your team can update services, work, testimonials, and articles." },
      { question: "Do you provide maintenance?", answer: "Yes. Ongoing plans cover updates, monitoring, backups, improvements, and priority support after launch." },
    ],
  },
  {
    slug: "ui-ux",
    index: "03",
    title: "UI/UX Design",
    short: "Intuitive digital products that feel clear, polished, and effortless to use.",
    promise: "Less friction. More confidence at every click.",
    description:
      "We simplify complex journeys into interfaces people understand instinctively. Research, structure, interaction, and visual craft work together to improve adoption and conversion.",
    outcomes: ["Higher task completion", "Lower user friction", "Consistent product experience"],
    deliverables: ["UX audit", "User flows", "Wireframes", "Interface design", "Interactive prototype", "Component library"],
    faqs: [
      { question: "Do you design apps as well as websites?", answer: "Yes. We design responsive web apps, dashboards, mobile product experiences, and the systems that keep them consistent." },
      { question: "Can you work with our development team?", answer: "Yes. We provide clear states, specifications, component behaviour, and handoff support so implementation stays faithful to the design." },
      { question: "Do you conduct user research?", answer: "We tailor research to the project—from stakeholder interviews and heuristic reviews to usability testing with target users." },
    ],
  },
  {
    slug: "seo",
    index: "04",
    title: "SEO",
    short: "Search strategies that increase qualified visibility—not vanity traffic.",
    promise: "Be discovered when high-intent customers are searching.",
    description:
      "We combine technical foundations, search intent, local relevance, and useful content to build durable organic growth for businesses in Jaipur and beyond.",
    outcomes: ["More qualified traffic", "Stronger local visibility", "Compounding organic growth"],
    deliverables: ["Technical audit", "Keyword strategy", "On-page SEO", "Local SEO", "Content roadmap", "Monthly reporting"],
    faqs: [
      { question: "How quickly will SEO show results?", answer: "Technical and on-page improvements can surface early, while competitive organic growth usually compounds over 3–6 months and beyond." },
      { question: "Do you offer local SEO in Jaipur?", answer: "Yes. We optimise local landing pages, Google Business Profile signals, content, citations, and conversion paths for Jaipur and Rajasthan searches." },
      { question: "Do you guarantee rankings?", answer: "No credible agency can control search engines. We commit to transparent work, measurable leading indicators, and strategies built around qualified business outcomes." },
    ],
  },
  {
    slug: "google-ads",
    index: "05",
    title: "Google Ads",
    short: "High-intent campaigns built to turn ad spend into genuine opportunities.",
    promise: "Capture demand. Cut waste. Scale what converts.",
    description:
      "We structure search campaigns around commercial intent, focused landing pages, and dependable tracking so every decision is connected to leads and revenue.",
    outcomes: ["Lower wasted spend", "More relevant leads", "Clear conversion visibility"],
    deliverables: ["Account strategy", "Keyword planning", "Campaign build", "Landing page review", "Conversion tracking", "Ongoing optimisation"],
    faqs: [
      { question: "What ad budget do I need?", answer: "It depends on your market, geography, and lead value. We recommend a practical test budget after reviewing expected demand and click costs." },
      { question: "Can you improve an existing account?", answer: "Yes. We audit structure, search terms, tracking, bidding, creative, and landing pages before prioritising the highest-impact fixes." },
      { question: "How do you report performance?", answer: "Reporting focuses on enquiries, cost per qualified lead, conversion rate, and the campaign decisions behind the numbers." },
    ],
  },
  {
    slug: "digital-marketing",
    index: "06",
    title: "Digital Marketing",
    short: "Connected campaigns that turn attention into a repeatable growth engine.",
    promise: "One strategy. Every channel working harder together.",
    description:
      "We align your website, paid acquisition, search, content, and measurement around a focused growth plan—so activity becomes momentum rather than noise.",
    outcomes: ["Clearer channel strategy", "Better conversion economics", "Consistent market presence"],
    deliverables: ["Growth audit", "Channel strategy", "Campaign planning", "Content direction", "Analytics setup", "Performance reviews"],
    faqs: [
      { question: "Which channels will you use?", answer: "We select channels around customer intent and economics. That may include search, paid social, SEO, content, email, and conversion improvements." },
      { question: "Can you work with our internal team?", answer: "Yes. We can lead the strategy, execute selected channels, or operate as a specialist extension of your marketing team." },
      { question: "What does success look like?", answer: "We agree on commercial metrics first—qualified leads, bookings, sales, or pipeline—then map channel measures back to those outcomes." },
    ],
  },
  {
    slug: "social-media-marketing",
    index: "07",
    title: "Social Media",
    short: "Distinctive content and campaigns that build relevance, trust, and demand.",
    promise: "Show up with clarity—not just consistency.",
    description:
      "We give your brand a recognisable point of view across social channels, pairing strategic content with paid distribution when it can accelerate meaningful reach.",
    outcomes: ["Stronger brand recall", "More relevant engagement", "A consistent content engine"],
    deliverables: ["Channel strategy", "Content pillars", "Creative direction", "Content calendar", "Paid social campaigns", "Monthly insights"],
    faqs: [
      { question: "Do you create the content?", answer: "Yes. We can provide concepts, copy, design direction, production coordination, publishing plans, and paid amplification." },
      { question: "Which platforms do you manage?", answer: "We recommend platforms based on your buyers. Instagram and Meta are common for consumer brands; LinkedIn often suits B2B and corporate audiences." },
      { question: "How often should we post?", answer: "Frequency follows quality and audience behaviour. We build a sustainable cadence that protects the brand and creates enough signal to learn." },
    ],
  },
  {
    slug: "branding",
    index: "08",
    title: "Branding",
    short: "Strategic identities designed to be remembered, trusted, and chosen.",
    promise: "A brand system that makes every interaction feel intentional.",
    description:
      "We clarify what your brand stands for, then translate it into a precise visual and verbal system that works across digital, social, sales, and physical touchpoints.",
    outcomes: ["Stronger differentiation", "Consistent brand expression", "Higher perceived value"],
    deliverables: ["Brand strategy", "Visual identity", "Typography and colour", "Messaging direction", "Usage guidelines", "Launch toolkit"],
    faqs: [
      { question: "Can you refresh an existing brand?", answer: "Yes. We can evolve the identity while preserving the recognisable elements and equity that still serve the business." },
      { question: "Do you only design logos?", answer: "A logo is one part of the system. We build the broader strategy, typography, colour, layout, imagery, voice, and usage rules that make it effective." },
      { question: "Will the brand work across print and digital?", answer: "Yes. The system is designed for websites, social content, presentations, signage, packaging, and the practical formats your business uses." },
    ],
  },
];

export const homeFaqs = [
  { question: "How much does a premium website cost?", answer: "Investment depends on scope, content, integrations, and growth goals. After a short discovery call, we provide a clear proposal with deliverables, timing, and no hidden surprises." },
  { question: "How long will my website take?", answer: "Most premium marketing websites launch in 5–10 weeks. Focused landing pages can move faster; larger platforms and custom functionality need more time." },
  { question: "Do you work only with businesses in Jaipur?", answer: "No. ARTH by ANTRIKSH is based in Jaipur and works remotely with ambitious businesses across India and internationally." },
  { question: "Will my website be mobile-friendly and SEO-ready?", answer: "Yes. Responsive behaviour, accessibility, performance, semantic structure, metadata, and technical SEO are built into the process—not added at the end." },
  { question: "Can you help after launch?", answer: "Yes. Maintenance and growth plans can include monitoring, content updates, conversion improvements, SEO, campaigns, and priority support." },
];
