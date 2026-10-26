import "dotenv/config";
import bcrypt from "bcryptjs";
import { PrismaClient } from "@prisma/client";

const directUrl = process.env.DIRECT_URL;
if (!directUrl) {
  throw new Error("DIRECT_URL is required to seed the database.");
}
const prisma = new PrismaClient({
  datasources: {
    db: { url: directUrl },
  },
});
const serviceRecords = [
  { slug: "frontend-development", title: "Frontend Development", category: "Development", description: "Responsive, accessible interfaces that feel considered on every screen.", deliverables: ["React applications", "Responsive interfaces", "Interactive dashboards", "Performance and accessibility"] },
  { slug: "backend-development", title: "Backend Development", category: "Development", description: "Reliable APIs and data foundations to power your product.", deliverables: ["REST API development", "Authentication systems", "Database design", "Third-party integrations"] },
  { slug: "full-stack-development", title: "Full-Stack Development", category: "Development", description: "A complete web application, built from the interface to the database.", deliverables: ["Frontend and backend", "Secure authorization", "Database integration", "Deployment support"] },
  { slug: "ui-ux-design", title: "UI/UX Design & Implementation", category: "Design", description: "Thoughtful product interfaces that turn a design direction into a usable experience.", deliverables: ["Responsive layouts", "Component libraries", "Design systems", "Prototype refinement"] },
  { slug: "ecommerce-development", title: "E-commerce Development", category: "Commerce", description: "Product and commerce experiences designed around your customers and workflow.", deliverables: ["Product catalogs", "Cart and checkout flows", "Order management", "Product administration"] },
  { slug: "saas-mvp-development", title: "SaaS MVP Development", category: "Product development", description: "A practical first version of your software product, scoped to validate the idea.", deliverables: ["Product discovery", "MVP architecture", "User authentication", "Dashboard and integrations"] },
  { slug: "mobile-app-development", title: "Mobile App Development", category: "Mobile", description: "Cross-platform mobile experiences planned around your users, core features, and launch goals.", deliverables: ["Cross-platform app development", "Mobile-first user flows", "API integration", "Device testing and release preparation"] },
  { slug: "cms-website-development", title: "CMS & Website Development", category: "Web & CMS", description: "Content-managed websites that make it straightforward to publish and maintain your pages.", deliverables: ["CMS setup and configuration", "Reusable page templates", "Content migration", "Editor handover"] },
  { slug: "api-integration-development", title: "API & Integration Development", category: "Backend & Integrations", description: "Well-structured APIs and third-party connections that help your software work together.", deliverables: ["REST API design", "Third-party service integration", "Authentication and validation", "API documentation"] },
  { slug: "ai-ml-integration", title: "AI & Machine Learning Integration", category: "AI & Automation", description: "Practical AI features integrated into existing products, with clear limits and human review where appropriate.", deliverables: ["AI use-case discovery", "Model and API integration", "Prompt and response handling", "Evaluation and safeguards"] },
  { slug: "workflow-automation", title: "Workflow & Business Automation", category: "AI & Automation", description: "Reduce repetitive work by connecting tools and automating well-defined business workflows.", deliverables: ["Workflow mapping", "Tool and API connections", "Automated notifications", "Error handling and handover"] },
  { slug: "cloud-deployment", title: "Cloud Setup & Deployment", category: "Cloud & DevOps", description: "A practical cloud environment and deployment path for launching or improving a web application.", deliverables: ["Hosting and environment setup", "Domain and HTTPS configuration", "Deployment pipeline", "Production readiness checklist"] },
  { slug: "devops-ci-cd", title: "DevOps & CI/CD Setup", category: "Cloud & DevOps", description: "Repeatable build, test, and deployment workflows suited to your team and application.", deliverables: ["Build and test automation", "CI/CD pipeline configuration", "Environment management", "Deployment documentation"] },
  { slug: "security-hardening", title: "Application Security Hardening", category: "Security & Reliability", description: "A scoped review of common application security practices and practical hardening improvements.", deliverables: ["Configuration and dependency review", "Authentication and access-control checks", "Security header and input-validation review", "Prioritized remediation guidance"] },
  { slug: "database-design-migration", title: "Database Design & Migration", category: "Data & Databases", description: "Organize application data and plan careful migrations as products and requirements evolve.", deliverables: ["Data-model design", "Schema and index review", "Migration planning", "Backup and verification checklist"] },
  { slug: "qa-testing", title: "QA & Test Automation", category: "Quality & Testing", description: "Improve confidence in releases with focused test plans and automated checks for important user journeys.", deliverables: ["Test strategy and cases", "API and UI test automation", "Cross-browser checks", "Bug reports and release notes"] },
  { slug: "performance-optimization", title: "Performance Optimization", category: "Quality & Testing", description: "Find and address user-facing performance bottlenecks in web applications.", deliverables: ["Performance baseline", "Frontend and asset review", "Database query inspection", "Prioritized improvements"] },
  { slug: "website-maintenance", title: "Website & Application Maintenance", category: "Support & Maintenance", description: "Ongoing updates and fixes to keep an existing website or application dependable.", deliverables: ["Dependency and framework updates", "Bug fixes", "Routine health checks", "Maintenance notes"] },
  { slug: "technical-support", title: "Technical Support & Troubleshooting", category: "Support & Maintenance", description: "Investigate a specific application issue and provide a clear explanation and practical next steps.", deliverables: ["Issue triage", "Reproduction and diagnosis", "Targeted fixes where agreed", "Written findings"] },
  { slug: "legacy-modernization", title: "Legacy Application Modernization", category: "Consulting & Modernization", description: "Improve an existing codebase in manageable stages without assuming a risky full rewrite.", deliverables: ["Codebase assessment", "Modernization roadmap", "Incremental refactoring", "Compatibility and regression checks"] },
  { slug: "technical-consulting", title: "IT Consulting & Solution Architecture", category: "Consulting & Modernization", description: "Get technical guidance to evaluate options, shape an architecture, or plan a product build.", deliverables: ["Requirements and constraints review", "Architecture recommendations", "Technology trade-offs", "Actionable implementation plan"] },
  { slug: "analytics-dashboard-development", title: "Analytics & Reporting Dashboards", category: "Data & Analytics", description: "Turn relevant application or business data into clear dashboards and useful reports.", deliverables: ["Metric and data-source mapping", "Dashboard interface", "Charts and filters", "Data handling and documentation"] },
  { slug: "crm-erp-integration", title: "CRM & Business-System Integration", category: "Backend & Integrations", description: "Connect your application with CRM, ERP, and other business tools using supported integration paths.", deliverables: ["Integration requirements", "API and data mapping", "Synchronization workflow", "Error and retry handling"] },
  { slug: "website-seo-setup", title: "Technical SEO & Website Optimization", category: "Web & CMS", description: "Improve technical foundations that help a website load well and present structured information to search engines.", deliverables: ["Metadata and canonical review", "Sitemap and crawler configuration", "Core page performance checks", "Structured-content recommendations"] },
];
const projectRecords = [
  { slug: "lms", title: "LMS", category: "Full Stack", description: "A learning platform concept for bringing course content, learner progress, and instructor tools together.", stack: ["React", "Node.js", "PostgreSQL"], image: "/projects/lms.svg" },
  { slug: "vmcart", title: "VMcart", category: "E-commerce", description: "An e-commerce platform concept focused on product discovery and checkout.", stack: ["React", "Express", "MongoDB"], image: "/projects/vmcart.svg" },
  { slug: "portfolio-3d", title: "Personal 3D Portfolio", category: "Frontend", description: "An exploratory portfolio concept for interactive storytelling on the web.", stack: ["React", "Three.js", "Motion"], image: "/projects/portfolio-3d.svg" },
  { slug: "finova", title: "FINOVA", category: "SaaS", description: "A finance application concept exploring simple, accessible money views.", stack: ["TypeScript", "React", "Charts"], image: "/projects/finova.svg" },
  { slug: "relay-api-platform", title: "Relay API Platform", category: "Backend", description: "A backend platform concept for organizing secure REST endpoints, service integrations, and operational health checks.", stack: ["Node.js", "Express", "MongoDB"], image: "/projects/relay-api-platform.svg" },
  { slug: "orbit-support-copilot", title: "Orbit Support Copilot", category: "AI Applications", description: "An AI support workspace concept for searching help content, drafting responses, and keeping a human in control of every reply.", stack: ["TypeScript", "React", "AI APIs"], image: "/projects/orbit-support-copilot.svg" },
  { slug: "flowboard", title: "Flowboard", category: "Full Stack", description: "A team planning workspace concept that turns project goals into clear tasks, milestones, and shared progress.", stack: ["React", "TypeScript", "Node.js"], image: "/projects/flowboard.svg" },
  { slug: "greencart", title: "GreenCart", category: "E-commerce", description: "A mindful shopping experience concept for discovering sustainable goods and understanding their impact.", stack: ["React", "Express", "MongoDB"], image: "/projects/greencart.svg" },
  { slug: "caretrack", title: "CareTrack", category: "SaaS", description: "A care coordination dashboard concept for keeping appointments, care plans, and patient updates organized.", stack: ["TypeScript", "React", "Node.js"], image: "/projects/caretrack.svg" },
  { slug: "atlas-analytics", title: "Atlas Analytics", category: "Backend", description: "A data operations dashboard concept for understanding product usage, service health, and key business trends.", stack: ["Node.js", "PostgreSQL", "Charts"], image: "/projects/atlas-analytics.svg" },
  { slug: "pixel-forge", title: "Pixel Forge", category: "Frontend", description: "A responsive design-system playground concept for composing accessible interface components and testing themes.", stack: ["React", "TypeScript", "CSS"], image: "/projects/pixel-forge.svg" },
  { slug: "pocket-pantry", title: "Pocket Pantry", category: "Mobile Apps", description: "A mobile meal-planning concept that turns pantry items into simple recipes and shareable shopping lists.", stack: ["React Native", "Expo", "Node.js"], image: "/projects/pocket-pantry.svg" },
  { slug: "studio-north", title: "Studio North", category: "UI/UX Design", description: "A visual identity and portfolio concept for a small creative studio, focused on expressive typography and calm navigation.", stack: ["Figma", "React", "Motion"], image: "/projects/studio-north.svg" },
  { slug: "shipshape", title: "ShipShape", category: "DevTools", description: "A developer tool concept for tracking build health, release notes, and deployment status in one focused workspace.", stack: ["TypeScript", "Node.js", "GitHub API"], image: "/projects/shipshape.svg" },
  { slug: "brightpath", title: "BrightPath", category: "Education", description: "An online learning concept with guided study paths, bite-sized lessons, and visible learner progress.", stack: ["Next.js", "TypeScript", "MongoDB"], image: "/projects/brightpath.svg" },
  { slug: "citypulse", title: "CityPulse", category: "Data Visualization", description: "A civic data visualization concept that turns local mobility and air-quality indicators into readable maps and trends.", stack: ["React", "D3.js", "Open Data"], image: "/projects/citypulse.svg" },
  { slug: "securegate", title: "SecureGate", category: "Backend", description: "An API access management concept for reviewing application keys, permissions, and service activity.", stack: ["Node.js", "Express", "PostgreSQL"], image: "/projects/securegate.svg" },
  { slug: "wanderly", title: "Wanderly", category: "Travel", description: "A travel-planning concept for collecting destination ideas, mapping an itinerary, and sharing a trip with friends.", stack: ["React", "Maps API", "Firebase"], image: "/projects/wanderly.svg" },
  { slug: "mindful-minute", title: "Mindful Minute", category: "Wellness", description: "A wellness app concept with short guided breathing sessions, gentle reminders, and a private progress journal.", stack: ["React Native", "Expo", "SQLite"], image: "/projects/mindful-minute.svg" },
];
const productRecords = [
  { slug: "react-ui-components", title: "React UI Components", category: "React Components", description: "Reusable interface building blocks for modern React projects.", features: ["Accessible buttons and form controls", "Responsive navigation patterns", "Theme-ready component styles"], requirements: "Concept listing only; no source package is included." },
  { slug: "dashboard-ui-kit", title: "Dashboard UI Kit", category: "Admin Dashboard UI Kits", description: "A considered starting point for data-rich product interfaces.", features: ["Analytics dashboard layouts", "Table and filter patterns", "Responsive sidebar concepts"], requirements: "Concept listing only; no downloadable UI files are included." },
  { slug: "saas-starter-kit", title: "SaaS Starter Kit", category: "SaaS Starter Kits", description: "A foundation for exploring and prototyping a software product.", features: ["SaaS landing page concept", "Account and onboarding screens", "Example settings dashboard"], requirements: "Concept listing only; no application source or deployment is included." },
  { slug: "portfolio-template", title: "Developer Portfolio Template", category: "Website Templates", description: "A polished portfolio website concept for presenting projects, skills, and contact details.", features: ["Responsive portfolio page layouts", "Project showcase cards", "Contact and about sections"], requirements: "Concept preview only; no template files are available." },
  { slug: "api-documentation-starter", title: "API Documentation Starter", category: "Developer Tools", description: "A documentation site concept for helping developers explore an API and understand its endpoints.", features: ["Endpoint reference layout", "Code sample panels", "Search and navigation concepts"], requirements: "Concept listing only; no documentation generator package is included." },
  { slug: "figma-design-system", title: "Product Design System", category: "Design Resources", description: "A design resource concept for organizing reusable product components, colors, and typography.", features: ["Component library structure", "Color and type token examples", "Light and dark theme concepts"], requirements: "Concept preview only; no Figma source file is available." },
  { slug: "launch-checklist", title: "Web App Launch Checklist", category: "Guides & Checklists", description: "A practical checklist concept for preparing a web application for a responsible release.", features: ["Pre-launch review sections", "Deployment and rollback prompts", "Security and accessibility reminders"], requirements: "Concept listing only; no downloadable guide is included." },
  { slug: "icon-pack-concept", title: "Minimal Interface Icon Pack", category: "Design Resources", description: "A cohesive icon set concept for common navigation, product, and dashboard actions.", features: ["Consistent line-weight style", "Common interface symbols", "Light and dark background previews"], requirements: "Concept preview only; no icon files are available." },
];

async function main() {
  const projectCategoryNames = [...new Set(projectRecords.map((item) => item.category))];
  for (const name of projectCategoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.projectCategory.upsert({ where: { slug }, update: {}, create: { slug, name } });
  }
  const serviceCategoryNames = [...new Set(serviceRecords.map((item) => item.category))];
  for (const name of serviceCategoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.serviceCategory.upsert({ where: { slug }, update: {}, create: { slug, name } });
  }
  const productCategoryNames = [...new Set(productRecords.map((item) => item.category))];
  for (const name of productCategoryNames) {
    const slug = name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    await prisma.productCategory.upsert({ where: { slug }, update: {}, create: { slug, name } });
  }
  for (const [sortOrder, item] of serviceRecords.entries()) {
    const categorySlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await prisma.serviceCategory.findUniqueOrThrow({ where: { slug: categorySlug } });
    await prisma.service.upsert({
      where: { slug: item.slug },
      update: {},
      create: { slug: item.slug, title: item.title, categoryId: category.id, description: item.description, deliverables: item.deliverables, requirements: ["Project goals", "Required features", "Existing references"], complexity: "Discuss after requirements review", sortOrder },
    });
  }
  for (const [sortOrder, item] of projectRecords.entries()) {
    const categorySlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await prisma.projectCategory.findUniqueOrThrow({ where: { slug: categorySlug } });
    await prisma.project.upsert({
      where: { slug: item.slug },
      update: { coverImage: item.image },
      create: {
        slug: item.slug,
        title: item.title,
        categoryId: category.id,
        description: item.description,
        coverImage: item.image,
        status: "PUBLISHED",
        featured: sortOrder < 3,
        sampleRecord: true,
        sortOrder,
        technologies: { create: item.stack.map((name) => ({ name })) },
      },
    });
  }
  for (const item of productRecords) {
    const categorySlug = item.category.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const category = await prisma.productCategory.findUniqueOrThrow({ where: { slug: categorySlug } });
    await prisma.product.upsert({
      where: { slug: item.slug },
      update: { status: "PUBLISHED", sampleRecord: true, features: item.features, requirements: item.requirements },
      create: { slug: item.slug, title: item.title, categoryId: category.id, description: item.description, features: item.features, requirements: item.requirements, status: "PUBLISHED", sampleRecord: true },
    });
  }
  for (const [sortOrder, [question, answer]] of [
    ["How long does a project take?", "It depends on the scope, requirements, and feedback cycle. A realistic timeline can be discussed after an initial review."],
    ["How do you price projects?", "Pricing depends on the agreed scope. Share your goals and budget range in the project inquiry."],
    ["Can you build frontend and backend?", "Projects can cover frontend interfaces, backend APIs, data storage, or a complete application."],
    ["How do revisions work?", "The scope and revision approach are agreed in a proposal before work begins."],
    ["Do you offer maintenance?", "Maintenance and improvements can be discussed as part of a project or as follow-up work."],
    ["Do you work remotely?", "Project discussions and updates can be handled remotely with an agreed communication method."],
  ].entries()) {
    await prisma.fAQ.upsert({
      where: { id: `faq-seed-${sortOrder + 1}` },
      update: {},
      create: { id: `faq-seed-${sortOrder + 1}`, question, answer, sortOrder },
    });
  }

  const adminEmail = process.env.ADMIN_BOOTSTRAP_EMAIL?.trim().toLowerCase();
  const adminPassword = process.env.ADMIN_BOOTSTRAP_PASSWORD;
  if (adminEmail && adminPassword) {
    const existingAdmin = await prisma.user.findUnique({ where: { email: adminEmail } });
    if (!existingAdmin) {
      await prisma.user.create({
        data: { email: adminEmail, passwordHash: await bcrypt.hash(adminPassword, 12), role: "ADMIN", emailVerifiedAt: new Date() },
      });
      console.log(`Created the configured initial administrator: ${adminEmail}`);
    } else if (existingAdmin.role !== "ADMIN") {
      throw new Error("ADMIN_BOOTSTRAP_EMAIL already belongs to a non-admin account; refusing to promote it automatically.");
    }
  } else {
    console.log("No admin bootstrap credentials configured; no administrator account was created.");
  }
  console.log("Seeded service records, sample project concepts and product listings, and editable FAQs.");
}

main()
  .catch((error: unknown) => {
    console.error("Database seeding failed.", error);
    process.exitCode = 1;
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
