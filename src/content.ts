export type Project = {
  slug: string;
  title: string;
  category: string;
  description: string;
  stack: string[];
  mark: string;
  color: string;
  status: "Concept / sample record";
};

export const projects: Project[] = [
  { slug: "lms", title: "LMS", category: "Full Stack", description: "A learning platform concept for bringing course content, learner progress, and instructor tools together.", stack: ["React", "Node.js", "PostgreSQL"], mark: "learn", color: "violet", status: "Concept / sample record" },
  { slug: "vmcart", title: "VMcart", category: "E-commerce", description: "An e-commerce platform concept focused on a clear product discovery and checkout experience.", stack: ["React", "Express", "MongoDB"], mark: "shop", color: "blue", status: "Concept / sample record" },
  { slug: "portfolio-3d", title: "Personal 3D Portfolio", category: "Frontend", description: "An exploratory portfolio concept for expressive, interactive storytelling on the web.", stack: ["React", "Three.js", "Motion"], mark: "folio", color: "pink", status: "Concept / sample record" },
  { slug: "finova", title: "FINOVA", category: "SaaS", description: "A finance application concept exploring simple, accessible views of personal money.", stack: ["TypeScript", "React", "Charts"], mark: "finova", color: "green", status: "Concept / sample record" },
];

export const services = [
  { slug: "frontend-development", number: "01", title: "Frontend Development", icon: "code", description: "Responsive, accessible interfaces that feel considered on every screen.", points: ["React applications", "Responsive interfaces", "Interactive dashboards", "Performance & accessibility"] },
  { slug: "backend-development", number: "02", title: "Backend Development", icon: "server", description: "Reliable APIs and data foundations to power your product.", points: ["REST API development", "Authentication systems", "Database design", "Third-party integrations"] },
  { slug: "full-stack-development", number: "03", title: "Full-Stack Development", icon: "layers", description: "A complete web application, built from the interface to the database.", points: ["Frontend & backend", "Secure authorization", "Database integration", "Deployment support"] },
  { slug: "ui-ux-design", number: "04", title: "UI/UX Design & Implementation", icon: "pen", description: "Thoughtful product interfaces that turn a design direction into a usable experience.", points: ["Responsive layouts", "Component libraries", "Design systems", "Prototype refinement"] },
  { slug: "ecommerce-development", number: "05", title: "E-commerce Development", icon: "shopping", description: "Product and commerce experiences designed around your customers and workflow.", points: ["Product catalogs", "Cart & checkout flows", "Order management", "Product administration"] },
  { slug: "saas-mvp-development", number: "06", title: "SaaS MVP Development", icon: "spark", description: "A practical first version of your software product, scoped to validate the idea.", points: ["Product discovery", "MVP architecture", "User authentication", "Dashboard & integrations"] },
];

export const faqs = [
  ["How long does a project take?", "It depends on the scope, requirements, and feedback cycle. After an initial discussion, I can help define a realistic plan and timeline."],
  ["How do you price projects?", "Pricing depends on the work involved. Share your goals and budget range in the project inquiry and I’ll respond with next steps."],
  ["Can you build frontend and backend?", "Yes. Projects can cover frontend interfaces, backend APIs, data storage, or a complete application."],
  ["How do revisions work?", "The scope and revision approach are agreed in the proposal before work begins, so expectations are clear for both sides."],
  ["Do you offer ongoing maintenance?", "Maintenance and improvements can be discussed as part of a project or as follow-up work."],
  ["Do you work remotely?", "Yes. Project discussions and updates can be handled remotely with an agreed communication method."],
];

export const products = [
  { slug: "react-ui-components", title: "React UI Components", category: "React Components", description: "Reusable interface building blocks for modern React projects.", icon: "⌘" },
  { slug: "dashboard-ui-kit", title: "Dashboard UI Kit", category: "Admin Dashboard UI Kits", description: "A considered starting point for data-rich product interfaces.", icon: "▦" },
  { slug: "saas-starter-kit", title: "SaaS Starter Kit", category: "SaaS Starter Kits", description: "A foundation for exploring and prototyping a software product.", icon: "✳" },
];

export const capabilities = ["Frontend Development", "Backend Development", "Full-Stack Applications", "SaaS Development", "UI/UX Implementation", "API Integration"];
