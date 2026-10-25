import { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Link, NavLink, Route, Routes, useLocation, useNavigate, useParams, useSearchParams } from "react-router-dom";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import {
  ArrowDown, ArrowDownRight, ArrowLeft, ArrowRight, ArrowUpRight, Asterisk, BadgeCheck, BriefcaseBusiness,
  Check, Code2, Layers3, Menu, MessageCircle, PenTool, Plus, Server,
  ShoppingBag, Sparkles, X,
} from "lucide-react";
import { capabilities, products, projects, services } from "./content";
import { bookingSchema, bookingStepSchemas, contactFormSchema } from "./bookingValidation";
import {
  faqsSchema, publicProductSchema, publicProductsSchema, publicProjectSchema, publicProjectsSchema,
  publicServiceSchema, publicServicesSchema, type PublicProject,
  usePublicRecord, usePublicRecords,
} from "./publicData";

const serviceIcons = [Code2, Server, Layers3, PenTool, ShoppingBag, Sparkles];
const navLinks = [["Home", "/"], ["About", "/about"], ["Projects", "/projects"], ["Services", "/services"], ["Products", "/products"], ["Contact", "/contact"]];

function Header() {
  const [menuOpen, setMenuOpen] = useState(false);
  const [scrolled, setScrolled] = useState(false);
  const location = useLocation();
  useEffect(() => {
    const updateScroll = () => setScrolled(window.scrollY > 12);
    updateScroll();
    window.addEventListener("scroll", updateScroll, { passive: true });
    return () => window.removeEventListener("scroll", updateScroll);
  }, []);
  return <header className={`header ${scrolled ? "header-scrolled" : ""}`}>
    <div className="nav-wrap">
      <Link className="brand" to="/" aria-label="Abhishek Sharma home"><span className="brand-mark">a<span>.</span></span><span>abhishek<span className="brand-muted">sharma</span></span></Link>
      <nav className="desktop-nav" aria-label="Main navigation">{navLinks.map(([label, url]) => <NavLink end={url === "/"} key={url} to={url} className={({ isActive }) => isActive ? "nav-link active" : "nav-link"}>{label}</NavLink>)}</nav>
      <div className="nav-actions"><Link className="login-link" to="/login">Client Login <ArrowUpRight size={13} /></Link><Link className="button button-small button-primary nav-cta" to="/book">Book a Project <ArrowUpRight size={15} /></Link></div>
      <button className="mobile-menu-toggle" onClick={() => setMenuOpen(!menuOpen)} aria-expanded={menuOpen} aria-label={menuOpen ? "Close navigation menu" : "Open navigation menu"}>{menuOpen ? <X /> : <Menu />}</button>
    </div>
    {menuOpen && <nav className="mobile-nav" aria-label="Mobile navigation">{navLinks.map(([label, url]) => <Link key={url} to={url} onClick={() => setMenuOpen(false)}>{label}<ArrowUpRight size={15} /></Link>)}<Link to="/login" onClick={() => setMenuOpen(false)}>Client login<ArrowUpRight size={15} /></Link><Link className="mobile-book" to="/book" onClick={() => setMenuOpen(false)}>Book a project<ArrowUpRight size={15} /></Link></nav>}
    <span className="route-announcer" aria-live="polite">{location.pathname}</span>
  </header>;
}

function Footer() {
  return <footer className="footer"><div className="footer-main"><div className="footer-brand-col"><Link className="brand" to="/"><span className="brand-mark">a<span>.</span></span><span>abhishek<span className="brand-muted">sharma</span></span></Link><p>Thoughtful software, built with care.</p><Link to="/contact">Send a message <ArrowUpRight size={14} /></Link><p className="footer-config-note">Contact and social profiles are not configured yet.</p></div><div className="footer-links"><div><span className="footer-label">EXPLORE</span><Link to="/about">About</Link><Link to="/projects">Projects</Link><Link to="/services">Services</Link></div><div><span className="footer-label">MORE</span><Link to="/products">Products</Link><Link to="/book">Book a project</Link><Link to="/contact">Contact</Link></div><div><span className="footer-label">POLICIES</span><Link to="/privacy">Privacy policy</Link><Link to="/terms">Terms of service</Link><Link to="/refund-policy">Refund policy</Link></div></div></div><div className="footer-bottom"><span>© {new Date().getFullYear()} Abhishek Sharma. All rights reserved.</span><span>Designed with intention <Asterisk size={15} /></span></div></footer>;
}

function Eyebrow({ children }: { children: React.ReactNode }) { return <div className="eyebrow"><span className="eyebrow-dot" />{children}</div>; }
function SectionHeading({ eyebrow, title, text, action }: { eyebrow: string; title: React.ReactNode; text?: string; action?: React.ReactNode }) {
  return <div className="section-heading"><div><Eyebrow>{eyebrow}</Eyebrow><h2>{title}</h2>{text && <p>{text}</p>}</div>{action}</div>;
}
function Reveal({ children, className = "" }: { children: React.ReactNode; className?: string }) {
  const reduceMotion = useReducedMotion();
  return <motion.div className={className} initial={reduceMotion ? false : { opacity: 0, y: 18 }} whileInView={{ opacity: 1, y: 0 }} viewport={{ once: true, amount: 0.12 }} transition={{ duration: reduceMotion ? 0 : 0.48, ease: "easeOut" }}>{children}</motion.div>;
}
function CTA({ compact = false }: { compact?: boolean }) {
  return <section className={`cta-section ${compact ? "cta-compact" : ""}`}><div className="cta-glow" /><Eyebrow>A GOOD PLACE TO START</Eyebrow><h2>Have an idea?<br /><span>Let’s build it.</span></h2><p>Tell me what you’re planning. I’ll help turn the idea into a practical development plan.</p><div className="button-row"><Link className="button button-primary" to="/book">Book a project <ArrowUpRight size={16} /></Link><Link className="button button-quiet" to="/contact">Contact me <ArrowRight size={16} /></Link></div></section>;
}

function Home() {
  const publicProjects = usePublicRecords("/api/projects", publicProjectsSchema);
  return <>
    <main>
      <section className="hero page-shell">
        <div className="hero-copy"><Eyebrow>ABHISHEK SHARMA <span className="eyebrow-sep">•</span> WEB DEVELOPER &amp; SOFTWARE ENGINEER</Eyebrow><h1>Turning ideas into<br /><span className="gradient-text">digital experiences.</span></h1><p className="hero-lede">I’m Abhishek Sharma, a web developer focused on building modern websites, full-stack applications, SaaS platforms, and digital products that solve real problems.</p><div className="button-row"><Link className="button button-primary" to="/book">Start a project <ArrowUpRight size={16} /></Link><Link className="button button-outline" to="/projects">Explore my work <ArrowRight size={16} /></Link></div><Link className="hero-products-link" to="/products">Or explore digital products <ArrowDownRight size={15} /></Link></div>
        <div className="hero-art" aria-label="Abstract, configurable profile image placeholder"><div className="hero-orbit orbit-one" /><div className="hero-orbit orbit-two" /><div className="hero-image-placeholder"><div className="placeholder-grid" /><div className="profile-initials">AS<span>.</span></div><div className="image-caption">YOUR PORTRAIT<br />GOES HERE</div></div><div className="hero-code-card"><span className="code-dots"><i /><i /><i /></span><code><span className="code-purple">const</span> idea = <span className="code-green">"build"</span>;<br /><span className="code-purple">const</span> result = <span className="code-blue">create</span>(idea);<br /><span className="code-comment">// one thoughtful step at a time</span></code></div><div className="floating-label"><span className="availability-dot" />Building useful things</div></div>
        <div className="hero-scroll"><span>SCROLL TO EXPLORE</span><ArrowDown size={14} /></div>
      </section>
      <section className="capability-band"><div className="page-shell capability-inner"><span className="capability-label">WHAT I CAN HELP WITH</span><div className="capability-list">{capabilities.map((item) => <span key={item}><Check size={13} />{item}</span>)}</div></div></section>
      <section className="section page-shell"><SectionHeading eyebrow="SELECTED WORK" title={<>Ideas, shaped into<br /><span className="heading-muted">digital products.</span></>} text="Published project records and concepts. Live or completed status is never implied without confirmation." action={<Link className="text-link" to="/projects">All projects <ArrowUpRight size={16} /></Link>} /><CollectionMessage loading={publicProjects.loading} error={publicProjects.error} empty={!publicProjects.items.length} label="projects" /><ProjectGrid items={publicProjects.items.slice(0, 3)} /></section>
      <section className="section section-tinted"><div className="page-shell"><SectionHeading eyebrow="HOW I CAN HELP" title={<>Small details.<br /><span className="heading-muted">Complete solutions.</span></>} text="Whether you need a new interface or an end-to-end application, let's find the right scope for your goals." action={<Link className="text-link" to="/services">Explore services <ArrowUpRight size={16} /></Link>} /><ServiceGrid limit={3} /></div></section>
      <section className="section page-shell process-section"><SectionHeading eyebrow="A CLEAR PROCESS" title={<>Good work starts<br /><span className="heading-muted">with a conversation.</span></>} text="A collaborative process that keeps the scope clear and the work moving." /><ProcessSteps /></section>
      <section className="section section-tinted"><div className="page-shell"><SectionHeading eyebrow="DIGITAL PRODUCTS" title={<>Useful tools, made<br /><span className="heading-muted">for makers.</span></>} text="A growing collection of resources for developers and product teams. Listings appear here when they’re ready." action={<Link className="text-link" to="/products">Browse products <ArrowUpRight size={16} /></Link>} /><ProductGrid /></div></section>
      <section className="section page-shell faq-section"><SectionHeading eyebrow="A FEW ANSWERS" title={<>Questions worth<br /><span className="heading-muted">asking early.</span></>} text="If your question isn't here, send a note and we can talk it through." action={<Link className="text-link" to="/contact">Ask me directly <ArrowUpRight size={16} /></Link>} /><FAQList /></section>
      <CTA />
    </main>
  </>;
}

function CollectionMessage({ loading, error, empty, label }: { loading: boolean; error: string; empty: boolean; label: string }) {
  if (loading) return <p className="collection-message" role="status">Loading published {label}…</p>;
  if (error) return <p className="collection-message collection-error" role="alert">{error}</p>;
  if (empty) return <p className="collection-message">No {label} have been published yet.</p>;
  return null;
}
function projectColor(slug: string) {
  const palette = ["violet", "blue", "pink", "green"];
  return palette[[...slug].reduce((sum, char) => sum + char.charCodeAt(0), 0) % palette.length];
}
function ProjectGrid({ items }: { items: PublicProject[] }) {
  return <div className="project-grid">{items.map((project, index) => <Reveal className="project-card-wrap" key={project.slug}><Link to={`/projects/${project.slug}`} className={`project-card project-${projectColor(project.slug)}`}><div className="project-visual">{project.coverImage ? <img className="project-cover-image" src={project.coverImage} alt={`${project.title} project preview`} loading="lazy" /> : <><div className="project-grid-lines" /><div className={`project-art project-art-${index + 1}`}><div className="art-window"><span /><span /><span /><div className="art-content"><i /><i /><i /></div></div><div className="art-orbit" /></div></>}<span className="project-index">{String(index + 1).padStart(2, "0")} / {project.sampleRecord ? "CONCEPT" : "PROJECT"}</span><span className="project-arrow"><ArrowUpRight size={17} /></span></div><div className="project-meta"><div><span className="project-category">{project.category.name}</span><h3>{project.title}</h3></div><ArrowUpRight className="meta-arrow" size={18} /></div><p className="project-description">{project.description}</p><div className="tag-row">{project.technologies.map((tech) => <span className="tag" key={tech}>{tech}</span>)}</div></Link></Reveal>)}</div>;
}
function ServiceGrid({ limit, showFilters = false }: { limit?: number; showFilters?: boolean }) {
  const records = usePublicRecords("/api/services", publicServicesSchema);
  const [filter, setFilter] = useState("All services");
  const categories = [...new Set(records.items.map((service) => service.serviceCategory.name))];
  const visibleServices = records.items.filter((service) => filter === "All services" || service.serviceCategory.name === filter);
  const visible = visibleServices.slice(0, limit ?? visibleServices.length);
  return <><CollectionMessage loading={records.loading} error={records.error} empty={!records.items.length} label="services" />{showFilters && <div className="filter-row service-filter-row" aria-label="Filter services by category">{["All services", ...categories].map((category) => <button type="button" key={category} className={`filter-chip ${filter === category ? "selected" : ""}`} aria-pressed={filter === category} onClick={() => setFilter(category)}>{category}</button>)}</div>}<div className="service-grid">{visible.map((service, index) => { const knownIndex = services.findIndex((item) => item.slug === service.slug); const Icon = serviceIcons[knownIndex < 0 ? index % serviceIcons.length : knownIndex]; return <Reveal key={service.slug}><article className="service-card"><div className="service-card-top"><span className="service-icon"><Icon size={19} /></span><span className="service-number">{String(index + 1).padStart(2, "0")}</span></div><span className="service-category-label">{service.serviceCategory.name}</span><h3>{service.title}</h3><p>{service.description}</p><Link className="service-card-link" to={`/services/${service.slug}`}>Explore service <ArrowUpRight size={15} /></Link></article></Reveal>; })}</div></>;
}
function ProcessSteps() {
  const steps = [["01", "Discovery", "Understand your goals, users, and what success should look like."], ["02", "Planning", "Define the scope, deliverables, priorities, and milestones together."], ["03", "Design & development", "Build the agreed solution and share progress along the way."], ["04", "Testing & delivery", "Test, deploy, and hand over the finished work with care."]];
  return <div className="process-grid">{steps.map(([n, title, desc]) => <Reveal key={n}><article className="process-card"><span>{n}</span><h3>{title}</h3><p>{desc}</p><div className="process-line" /></article></Reveal>)}</div>;
}
function ProductGrid() {
  const records = usePublicRecords("/api/products", publicProductsSchema);
  return <><CollectionMessage loading={records.loading} error={records.error} empty={!records.items.length} label="products" /><div className="product-grid">{records.items.map((product, index) => <Reveal key={product.slug}><Link to={`/products/${product.slug}`} className="product-card"><div className={`product-cover product-cover-${index % 3 + 1}`}><span className="product-symbol">{product.title.slice(0, 1)}</span><span className="product-coming">{product.sampleRecord ? "DEMO · NOT FOR SALE" : product.price === "0" ? "FREE" : product.price ? "AVAILABLE" : "PRICE ON REQUEST"}</span></div><div className="product-info"><span className="product-category">{product.category.name}</span><h3>{product.title}</h3><p>{product.description}</p><span className="product-link">Details <ArrowUpRight size={14} /></span></div></Link></Reveal>)}</div></>;
}
function FAQList() {
  const [open, setOpen] = useState<number | null>(0);
  const records = usePublicRecords("/api/faqs", faqsSchema);
  return <><CollectionMessage loading={records.loading} error={records.error} empty={!records.items.length} label="FAQs" /><div className="faq-list">{records.items.map(({ id, question, answer }, index) => <div className={`faq-item ${open === index ? "faq-open" : ""}`} key={id}><button aria-expanded={open === index} onClick={() => setOpen(open === index ? null : index)}><span>{question}</span><Plus size={17} /></button>{open === index && <p>{answer}</p>}</div>)}</div></>;
}

function PageIntro({ eyebrow, title, text }: { eyebrow: string; title: React.ReactNode; text: string }) {
  return <section className="page-intro page-shell"><Eyebrow>{eyebrow}</Eyebrow><h1>{title}</h1><p>{text}</p></section>;
}
function About() {
  const groups = [["Frontend", "HTML", "CSS", "JavaScript", "TypeScript", "React", "Next.js"], ["Backend", "Node.js", "Express.js", "REST APIs"], ["Databases", "MongoDB", "PostgreSQL", "MySQL"], ["Tools", "Git", "GitHub", "Vite", "Netlify", "Vercel"]];
  return <main><PageIntro eyebrow="ABHISHEK SHARMA · WEB DEVELOPER & SOFTWARE ENGINEER" title={<>Turning Requirements Into<br /><span className="heading-muted">Useful Experiences.</span></>} text="I'm Abhishek Sharma, a web developer passionate about building modern, user-friendly websites and software applications. I focus on creating responsive interfaces, reliable backend systems, and digital experiences that combine clean code with thoughtful design." /><section className="section page-shell about-grid"><div className="about-photo"><div className="profile-initials">AS<span>.</span></div><span>PROFILE IMAGE PLACEHOLDER</span></div><div className="about-copy"><Eyebrow>THE PERSON BEHIND THE CODE</Eyebrow><p>From portfolio websites to full-stack applications and SaaS products, I enjoy transforming ideas into practical digital solutions.</p><div className="profile-facts"><div><span>BASED IN</span><strong>Dehradun, Uttarakhand, India</strong></div><div><span>EDUCATION</span><strong>Diploma in IT · B.Tech CSE</strong></div><div><span>FOCUS</span><strong>Web Development &amp; Software Engineering</strong></div></div><Link className="button button-primary" to="/book">Let’s work together <ArrowUpRight size={16} /></Link></div></section><section className="section section-tinted"><div className="page-shell"><SectionHeading eyebrow="TOOLS OF THE TRADE" title={<>A practical toolkit,<br /><span className="heading-muted">always evolving.</span></>} text="Skills and technologies shown here are configurable profile information; only keep the ones that accurately represent your experience." /><div className="skill-grid">{groups.map(([title, ...items]) => <article className="skill-card" key={title}><span>{title}</span><div>{items.map((item) => <span className="tag" key={item}>{item}</span>)}</div></article>)}</div></div></section><section className="section page-shell"><SectionHeading eyebrow="HOW I APPROACH THE WORK" title={<>Strong foundations.<br /><span className="heading-muted">Thoughtful outcomes.</span></>} /><div className="values-grid">{[["Problem solving", "Start by understanding the actual problem, not only the requested feature."], ["Maintainable code", "Favor clear structure and reliable foundations that are easier to extend."], ["User focused", "Make useful, accessible experiences that work across devices."], ["Continuous learning", "Stay curious and choose tools that fit the problem at hand."]].map(([title, text], i) => <article className="value-card" key={title}><span>0{i + 1}</span><h3>{title}</h3><p>{text}</p></article>)}</div></section><CTA compact /></main>;
}

function ProjectsPage() {
  const [filter, setFilter] = useState("All projects");
  const records = usePublicRecords("/api/projects", publicProjectsSchema);
  const filters = ["All projects", "Frontend", "Backend", "Full Stack", "SaaS", "E-commerce", "AI Applications", "Mobile Apps", "UI/UX Design", "DevTools", "Education", "Data Visualization", "Travel", "Wellness"];
  const visible = records.items.filter((project) => filter === "All projects" || project.category.name === filter);
  return <main><PageIntro eyebrow="A SELECTION OF WORK" title={<>Projects & experiments.<br /><span className="heading-muted">Made with intent.</span></>} text="Browse published project records and concepts. Live or completed status is never implied without confirmation." /><section className="section page-shell"><div className="filter-row">{filters.map((item) => <button key={item} className={`filter-chip ${filter === item ? "selected" : ""}`} onClick={() => setFilter(item)}>{item}</button>)}</div><CollectionMessage loading={records.loading} error={records.error} empty={!visible.length} label="projects in this category" />{visible.length > 0 && <ProjectGrid items={visible} />}{!records.loading && !records.error && !visible.length && <div className="empty-state"><Sparkles /><h3>No projects in this category yet</h3><p>Try another filter, or get in touch about a similar idea.</p><Link to="/book" className="text-link">Discuss a project <ArrowRight size={15} /></Link></div>}</section><CTA compact /></main>;
}
function ProjectDetail() {
  const { slug } = useParams();
  const { item: project, loading, error } = usePublicRecord(`/api/projects/${encodeURIComponent(slug ?? "")}`, publicProjectSchema);
  if (loading) return <main className="page-shell detail-load"><CollectionMessage loading error="" empty={false} label="project" /></main>;
  if (error || !project) return <main className="page-shell detail-load"><div className="data-feedback data-error" role="alert">{error || "Project not found."}</div><Link to="/projects" className="text-link">Back to projects <ArrowLeft size={15} /></Link></main>;
  const color = projectColor(project.slug);
  return <main><section className="project-detail-hero page-shell"><Link to="/projects" className="back-link"><ArrowLeft size={15} /> All projects</Link><Eyebrow>{project.category.name.toUpperCase()} <span className="eyebrow-sep">•</span> {project.sampleRecord ? "CONCEPT / SAMPLE RECORD" : "PUBLISHED PROJECT"}</Eyebrow><h1>{project.title}<br /><span className="heading-muted">{project.sampleRecord ? "Project concept." : "Project overview."}</span></h1><p>{project.description}</p><div className="tag-row">{project.technologies.map((tag) => <span className="tag" key={tag}>{tag}</span>)}</div><div className={`project-detail-visual project-${color}`}>{project.coverImage ? <img className="project-cover-image" src={project.coverImage} alt={`${project.title} project preview`} /> : <><div className="project-art project-art-2"><div className="art-window"><span /><span /><span /><div className="art-content"><i /><i /><i /></div></div></div><span className="detail-placeholder">PROJECT PREVIEW PLACEHOLDER</span></>}</div></section><section className="section page-shell detail-copy-grid"><div><Eyebrow>OVERVIEW</Eyebrow><h2>A starting point for<br />the right conversation.</h2></div><div><p>{project.sampleRecord ? "This is a sample project record, not a claim that a finished client project exists." : "Verified project information can be managed here as the content management workflow is completed."} Project outcomes, screenshots, demo URLs, and case-study details are only published when confirmed.</p><p>Architecture, challenges, role, and outcomes should be filled in from actual work before publication.</p><Link className="button button-primary" to="/book">Book a similar project <ArrowUpRight size={16} /></Link></div></section></main>;
}
function ServicesPage() {
  return <main><PageIntro eyebrow="WAYS TO WORK TOGETHER" title={<>Services built around<br /><span className="heading-muted">your real needs.</span></>} text="Explore software development, mobile apps, cloud and DevOps, security, data, testing, maintenance, and technical consulting. Every engagement is scoped to your needs; availability and pricing are confirmed after a conversation." /><section className="section page-shell"><ServiceGrid showFilters /></section><section className="section section-tinted"><div className="page-shell"><SectionHeading eyebrow="FROM FIRST HELLO TO HANDOVER" title={<>A steady process,<br /><span className="heading-muted">with no guesswork.</span></>} /><ProcessSteps /></div></section><CTA compact /></main>;
}
function ServiceDetail() {
  const { serviceSlug } = useParams();
  const { item: service, loading, error } = usePublicRecord(`/api/services/${encodeURIComponent(serviceSlug ?? "")}`, publicServiceSchema);
  if (loading) return <main className="page-shell detail-load"><CollectionMessage loading error="" empty={false} label="service" /></main>;
  if (error || !service) return <main className="page-shell detail-load"><div className="data-feedback data-error" role="alert">{error || "Service not found."}</div><Link to="/services" className="text-link">Back to services <ArrowLeft size={15} /></Link></main>;
  const price = service.startingPrice ? new Intl.NumberFormat("en-IN", { style: "currency", currency: service.currency }).format(Number(service.startingPrice)) : "Request a Quote";
  return <main><PageIntro eyebrow={`${service.serviceCategory.name.toUpperCase()} · SERVICE ${String(service.sortOrder + 1).padStart(2, "0")}`} title={<>{service.title}.<br /><span className="heading-muted">Scoped to your goals.</span></>} text={service.description} /><section className="section page-shell service-detail-layout"><div><Eyebrow>WHAT WE CAN COVER</Eyebrow><h2>A clear scope,<br />built together.</h2><ul className="check-list">{service.deliverables.map((point) => <li key={point}><Check size={16} />{point}</li>)}</ul><p className="muted-note">Complexity: {service.complexity || "Discuss after reviewing your requirements."} No delivery date is promised before scope is agreed.</p></div><div className="service-detail-card"><span className="service-icon"><BriefcaseBusiness size={20} /></span><span className="footer-label">STARTING PRICE</span><h3>{price}</h3><p>Project pricing and scope are confirmed after a conversation. Share your goals and any existing references.</p><Link className="button button-primary button-full" to={`/book/${service.slug}`}>Book this service <ArrowUpRight size={16} /></Link></div></section><section className="section section-tinted"><div className="page-shell"><SectionHeading eyebrow="RELATED SERVICES" title="More ways to build." /><ServiceGrid limit={3} /></div></section></main>;
}
function ProductsPage() {
  return <main><PageIntro eyebrow="DIGITAL PRODUCTS" title={<>Made for the people<br /><span className="heading-muted">building what’s next.</span></>} text="Explore demo listings for practical developer resources, design kits, and build guides. Each listing is backed by the database and clearly marked as a concept." /><section className="section page-shell"><div className="notice-box"><Sparkles size={17} /><span>These demo listings showcase the product catalog only. No product files or downloads are available, and checkout is disabled.</span></div><ProductGrid /></section></main>;
}
function ProductDetail() {
  const { productSlug } = useParams();
  const { item: product, loading, error } = usePublicRecord(`/api/products/${encodeURIComponent(productSlug ?? "")}`, publicProductSchema);
  if (loading) return <main className="page-shell detail-load"><CollectionMessage loading error="" empty={false} label="product" /></main>;
  if (error || !product) return <main className="page-shell detail-load"><div className="data-feedback data-error" role="alert">{error || "Product not found."}</div><Link to="/products" className="text-link">Back to products <ArrowLeft size={15} /></Link></main>;
  const features = Array.isArray(product.features) ? product.features.filter((feature): feature is string => typeof feature === "string") : [];
  return <main><PageIntro eyebrow={product.sampleRecord ? `DEMO LISTING · ${product.category.name.toUpperCase()}` : product.category.name.toUpperCase()} title={<>{product.title}.<br /><span className="heading-muted">A resource for your next build.</span></>} text={product.description} /><section className="section page-shell product-detail-layout"><div className="product-detail-cover"><span>{product.title.slice(0, 1)}</span><small>{product.sampleRecord ? "DEMO PREVIEW · NOT FOR SALE" : product.coverImage ? "PRODUCT PREVIEW" : "PREVIEW IMAGE NOT CONFIGURED"}</small></div><div><div className="notice-box"><Sparkles size={17} /><span>{product.sampleRecord ? "This is a demo listing to showcase the marketplace. No product files are available and it cannot be purchased." : "Checkout and payment are not enabled yet. This listing cannot be purchased through this application."}</span></div><Eyebrow>PRODUCT INFORMATION</Eyebrow><h2>{product.sampleRecord ? "Demo product" : product.price === "0" ? "Free product" : product.price ? `${product.currency} ${product.price}` : "Price not configured"}</h2>{features.length > 0 && <ul className="check-list">{features.map((feature) => <li key={feature}><Check size={16} />{feature}</li>)}</ul>}<p>{product.requirements || "Requirements have not been configured."}</p><p>Version: {product.version || "Not configured"} · License: {product.license || "Not configured"}</p><Link to="/products" className="text-link">Back to products <ArrowLeft size={15} /></Link></div></section></main>;
}

function BookingPage() {
  const { serviceSlug } = useParams();
  const availableServices = usePublicRecords("/api/services", publicServicesSchema);
  const selectedService = services.find((item) => item.slug === serviceSlug)?.title ?? "";
  const [step, setStep] = useState(1);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState("");
  const [sent, setSent] = useState(false);
  const [form, setForm] = useState({ service: selectedService, title: "", description: "", requirements: "", budget: "", timeline: "", name: "", email: "", phone: "", contact: "Email", privacy: false });
  useEffect(() => {
    const current = availableServices.items.find((item) => item.slug === serviceSlug);
    if (current) setForm((value) => ({ ...value, service: current.title }));
  }, [availableServices.items, serviceSlug]);
  const update = (key: keyof typeof form, value: string | boolean) => setForm((current) => ({ ...current, [key]: value }));
  const next = () => {
    setError("");
    const validation = bookingStepSchemas[step - 1].safeParse(form);
    if (!validation.success) return setError(validation.error.issues[0]?.message ?? "Check the required fields.");
    setStep((current) => Math.min(4, current + 1));
  };
  const submit = async (event: React.FormEvent) => {
    event.preventDefault();
    const validation = bookingSchema.safeParse(form);
    if (!validation.success) return setError(validation.error.issues[0]?.message ?? "Check the required fields.");
    setBusy(true); setError("");
    try {
      const response = await fetch("/api/bookings", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data) });
      const result = await response.json();
      if (!response.ok) throw new Error(result.error || "Your inquiry could not be submitted.");
      sessionStorage.setItem("bookingReference", result.reference);
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Unable to send your request. Please try again.");
    } finally { setBusy(false); }
  };
  if (sent) return <main className="success-page page-shell"><div className="success-icon"><Check /></div><Eyebrow>INQUIRY RECEIVED</Eyebrow><h1>Thanks for getting<br /><span className="heading-muted">the conversation started.</span></h1><p>Your project request has been recorded. This is an inquiry only—not a confirmed booking, proposal, or payment.</p><p className="reference">REFERENCE <strong>{sessionStorage.getItem("bookingReference")}</strong></p><Link to="/" className="button button-primary">Back to home <ArrowRight size={16} /></Link></main>;
  const steps = ["Service", "Project", "Details", "Review"];
  const budgetOptions = ["Under ₹10,000", "₹10,000–₹25,000", "₹25,000–₹50,000", "₹50,000–₹1,00,000", "Above ₹1,00,000", "Not decided"];
  const timelineOptions = ["Flexible", "Within 2 weeks", "Within 1 month", "Within 2–3 months", "Discuss later"];
  return <main className="booking-page page-shell"><div className="booking-heading"><Eyebrow>PROJECT INQUIRY</Eyebrow><h1>Let’s make a<br /><span className="heading-muted">thoughtful plan.</span></h1><p>Share a little about what you have in mind. Timelines and pricing are confirmed only after reviewing the scope.</p></div><div className="booking-panel"><div className="stepper">{steps.map((label, index) => <div className={`stepper-item ${step === index + 1 ? "current" : ""} ${step > index + 1 ? "complete" : ""}`} key={label}><span>{step > index + 1 ? <Check size={13} /> : `0${index + 1}`}</span><small>{label}</small></div>)}</div><form onSubmit={submit} noValidate>
    {step === 1 && <div className="form-step"><span className="footer-label">STEP 01 — CHOOSE A SERVICE</span><h2>What can I help with?</h2><CollectionMessage loading={availableServices.loading} error={availableServices.error} empty={!availableServices.items.length} label="services" /><div className="service-choice-grid">{availableServices.items.map((service, i) => { const knownIndex = services.findIndex((item) => item.slug === service.slug); const Icon = serviceIcons[knownIndex < 0 ? i % serviceIcons.length : knownIndex]; return <button type="button" className={`service-choice ${form.service === service.title ? "chosen" : ""}`} key={service.slug} onClick={() => update("service", service.title)}><Icon size={18} /><span>{service.title}</span>{form.service === service.title && <Check size={15} />}</button>; })}<button type="button" className={`service-choice ${form.service === "Custom Project" ? "chosen" : ""}`} onClick={() => update("service", "Custom Project")}><Asterisk size={18} /><span>Custom project</span>{form.service === "Custom Project" && <Check size={15} />}</button></div></div>}
    {step === 2 && <div className="form-step"><span className="footer-label">STEP 02 — PROJECT INFORMATION</span><h2>Tell me about the idea.</h2><label>Project title<input value={form.title} onChange={(e) => update("title", e.target.value)} placeholder="e.g. A website for my business" required /></label><label>Project description<textarea value={form.description} onChange={(e) => update("description", e.target.value)} placeholder="What are you hoping to build? What should it help you achieve?" rows={4} required /></label><label>Features or requirements<textarea value={form.requirements} onChange={(e) => update("requirements", e.target.value)} placeholder="Anything specific you already know you need" rows={3} /></label><div className="form-two-col"><label>Budget range<select value={form.budget} onChange={(e) => update("budget", e.target.value)}><option value="">Choose a range</option>{budgetOptions.map((x) => <option key={x}>{x}</option>)}</select></label><label>Preferred timeline<select value={form.timeline} onChange={(e) => update("timeline", e.target.value)}><option value="">Choose a timeline</option>{timelineOptions.map((x) => <option key={x}>{x}</option>)}</select></label></div><p className="field-hint">Budget ranges are for discussion only. Timeline requires confirmation after requirements review.</p></div>}
    {step === 3 && <div className="form-step"><span className="footer-label">STEP 03 — CONTACT DETAILS</span><h2>How can I reach you?</h2><label>Full name<input value={form.name} onChange={(e) => update("name", e.target.value)} placeholder="Your name" autoComplete="name" required /></label><label>Email address<input type="email" value={form.email} onChange={(e) => update("email", e.target.value)} placeholder="you@example.com" autoComplete="email" required /></label><div className="form-two-col"><label>Phone number <span className="optional">(optional)</span><input value={form.phone} onChange={(e) => update("phone", e.target.value)} placeholder="+91" autoComplete="tel" /></label><label>Preferred contact<select value={form.contact} onChange={(e) => update("contact", e.target.value)}><option>Email</option><option>Phone</option><option>WhatsApp</option></select></label></div><p className="field-hint">Attachments can be shared after the initial conversation through a secure channel.</p></div>}
    {step === 4 && <div className="form-step"><span className="footer-label">STEP 04 — REVIEW & SUBMIT</span><h2>Does this look right?</h2><div className="review-summary">{[["Service", form.service], ["Project", form.title], ["Description", form.description], ["Budget", form.budget || "Not specified"], ["Timeline", form.timeline || "Not specified"], ["Contact", `${form.name} · ${form.email}`]].map(([label, value]) => <div key={label}><span>{label}</span><strong>{value}</strong></div>)}</div><label className="checkbox-label"><input type="checkbox" checked={form.privacy} onChange={(e) => update("privacy", e.target.checked)} /><span>I agree to the <Link to="/privacy" target="_blank">privacy policy</Link> and consent to being contacted about this inquiry.</span></label><p className="field-hint">Submitting creates a new inquiry for review; it does not confirm a project or charge a payment.</p></div>}
    {error && <div className="form-error" role="alert">{error}</div>}<div className="form-actions">{step > 1 ? <button type="button" className="button button-outline" onClick={() => { setError(""); setStep((current) => current - 1); }}><ArrowLeft size={15} /> Back</button> : <span />}{step < 4 ? <button type="button" className="button button-primary" onClick={next}>Continue <ArrowRight size={15} /></button> : <button className="button button-primary" disabled={busy}>{busy ? "Sending…" : "Send project inquiry"} <ArrowUpRight size={16} /></button>}</div>
  </form></div></main>;
}

function Contact() {
  const [status, setStatus] = useState("");
  const { register, handleSubmit, reset, formState: { errors, isSubmitting } } = useForm<{ name: string; email: string; message: string }>();
  const submit = handleSubmit(async (values) => {
    setStatus("Sending…");
    const validation = contactFormSchema.safeParse(values);
    if (!validation.success) { setStatus(validation.error.issues[0]?.message ?? "Check the form fields."); return; }
    try {
      const response = await fetch("/api/contact", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(validation.data) });
      const data = await response.json();
      if (!response.ok) throw new Error(data.error || "Message could not be sent.");
      setStatus("Message sent. Thanks for reaching out.");
      reset();
    } catch (error) { setStatus(error instanceof Error ? error.message : "Unable to send your message. Try again."); }
  });
  return <main><PageIntro eyebrow="GET IN TOUCH" title={<>Have a question?<br /><span className="heading-muted">Let’s talk.</span></>} text="A quick note is a good place to start. Tell me what you’re thinking about and I’ll get back to you." /><section className="section page-shell contact-layout"><div className="contact-aside"><div className="contact-card"><span className="service-icon"><MessageCircle size={19} /></span><span className="footer-label">CONTACT</span><Link to="/contact">Use the contact form <ArrowUpRight size={15} /></Link></div><div className="contact-card"><span className="footer-label">LOCATION</span><p>Dehradun, Uttarakhand, India</p></div><p className="muted-note">Availability and social profiles are not stated until configured. Please send an inquiry to discuss current capacity.</p></div><form className="contact-form" onSubmit={submit} noValidate><label>Your name<input {...register("name", { required: "Enter your name.", minLength: { value: 2, message: "Enter at least 2 characters." } })} placeholder="Full name" />{errors.name && <span className="form-error" role="alert">{errors.name.message}</span>}</label><label>Email address<input type="email" {...register("email", { required: "Enter your email address." })} placeholder="you@example.com" />{errors.email && <span className="form-error" role="alert">{errors.email.message}</span>}</label><label>What would you like to discuss?<textarea {...register("message", { required: "Enter a message.", minLength: { value: 10, message: "Write at least 10 characters." } })} rows={5} placeholder="A few details about your question or project…" />{errors.message && <span className="form-error" role="alert">{errors.message.message}</span>}</label><button className="button button-primary" disabled={isSubmitting}>{isSubmitting ? "Sending…" : "Send message"} <ArrowUpRight size={15} /></button>{status && <p className="form-status" role="status">{status}</p>}</form></section></main>;
}

function AuthPage({ register = false }: { register?: boolean }) {
  const [status, setStatus] = useState("");
  const navigate = useNavigate();
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setStatus("Checking your account…");
    const values = Object.fromEntries(new FormData(event.currentTarget));
    try { const response = await fetch(`/api/auth/${register ? "register" : "login"}`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify(values) }); const data = await response.json(); if (!response.ok) throw new Error(data.error || "Authentication is not available."); if (register) setStatus(data.message); else { setStatus("Signed in."); navigate("/dashboard"); } }
    catch (error) { setStatus(error instanceof Error ? error.message : "Unable to authenticate. Please try again."); }
  };
  return <main className="auth-page page-shell"><div className="auth-panel"><Link className="back-link" to="/"><ArrowLeft size={15} /> Back to website</Link><Eyebrow>CLIENT PORTAL</Eyebrow><h1>{register ? "Create your account." : "Welcome back."}</h1><p>{register ? "Create an account to keep project updates and proposals in one place. Email verification is required." : "Sign in to view your projects, proposals, and updates."}</p><form onSubmit={submit} className="contact-form">{register && <label>Full name<input name="name" autoComplete="name" required minLength={2} /></label>}<label>Email address<input type="email" name="email" autoComplete="email" required /></label><label>Password<input type="password" name="password" autoComplete={register ? "new-password" : "current-password"} minLength={10} required /></label><button className="button button-primary button-full">{register ? "Create account" : "Sign in"} <ArrowRight size={15} /></button></form>{status && <p className="form-status" role="status">{status}</p>}{!register && <p className="auth-switch"><Link to="/forgot-password">Forgot your password?</Link></p>}{register && <p className="auth-switch"><Link to="/verify-email">Resend verification email</Link></p>}<p className="auth-switch">{register ? "Already have an account?" : "New to the client portal?"} <Link to={register ? "/login" : "/register"}>{register ? "Sign in" : "Create an account"}</Link></p></div></main>;
}
function VerifyEmailPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token");
  const [status, setStatus] = useState(token ? "Verifying your email…" : "");
  const [error, setError] = useState("");
  useEffect(() => {
    if (!token) return;
    let active = true;
    apiRequest<{ user: { id: string } }>("/api/auth/verify-email", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token }) }).then(() => { if (active) setStatus("Email verified. Your account is ready."); }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Email verification failed."); });
    return () => { active = false; };
  }, [token]);
  const resend = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setStatus("Sending…");
    const email = new FormData(event.currentTarget).get("email");
    try { const result = await apiRequest<{ message: string }>("/api/auth/resend-verification", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setStatus(result.message); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to send a verification email."); setStatus(""); }
  };
  return <main className="auth-page page-shell"><div className="auth-panel"><Eyebrow>EMAIL VERIFICATION</Eyebrow><h1>Verify your email.</h1><p>Verify the email address on your account to access the client portal.</p>{!token && <form onSubmit={resend} className="contact-form"><label>Email address<input type="email" name="email" required /></label><button className="button button-primary button-full">Send verification link</button></form>}{status && <p className="form-status" role="status">{status}</p>}{error && <p className="form-error" role="alert">{error}</p>}<Link className="text-link" to="/login">Go to sign in <ArrowRight size={14} /></Link></div></main>;
}
function ForgotPasswordPage() {
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setStatus("Sending…");
    const email = new FormData(event.currentTarget).get("email");
    try { const result = await apiRequest<{ message: string }>("/api/auth/forgot-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ email }) }); setStatus(result.message); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to request password recovery."); setStatus(""); }
  };
  return <main className="auth-page page-shell"><div className="auth-panel"><Eyebrow>ACCOUNT RECOVERY</Eyebrow><h1>Reset your password.</h1><p>If the email matches an account, a time-limited reset link will be sent.</p><form onSubmit={submit} className="contact-form"><label>Email address<input type="email" name="email" required /></label><button className="button button-primary button-full">Send reset link</button></form>{status && <p className="form-status" role="status">{status}</p>}{error && <p className="form-error" role="alert">{error}</p>}<Link className="text-link" to="/login">Back to sign in <ArrowLeft size={14} /></Link></div></main>;
}
function ResetPasswordPage() {
  const [searchParams] = useSearchParams();
  const token = searchParams.get("token") ?? "";
  const [status, setStatus] = useState("");
  const [error, setError] = useState("");
  const submit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault(); setError(""); setStatus("Updating password…");
    const values = new FormData(event.currentTarget);
    const password = String(values.get("password") ?? "");
    if (password !== values.get("confirmPassword")) { setError("Passwords do not match."); setStatus(""); return; }
    try { const result = await apiRequest<{ message: string }>("/api/auth/reset-password", { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ token, password }) }); setStatus(result.message); }
    catch (failure) { setError(failure instanceof Error ? failure.message : "Unable to reset the password."); setStatus(""); }
  };
  return <main className="auth-page page-shell"><div className="auth-panel"><Eyebrow>ACCOUNT RECOVERY</Eyebrow><h1>Choose a new password.</h1><p>Use at least 10 characters. This reset link expires after one hour.</p><form onSubmit={submit} className="contact-form"><label>New password<input type="password" name="password" minLength={10} maxLength={128} autoComplete="new-password" required /></label><label>Confirm password<input type="password" name="confirmPassword" minLength={10} maxLength={128} autoComplete="new-password" required /></label><button className="button button-primary button-full" disabled={!token}>Update password</button></form>{status && <p className="form-status" role="status">{status}</p>}{error && <p className="form-error" role="alert">{error}</p>}<Link className="text-link" to="/login">Back to sign in <ArrowLeft size={14} /></Link></div></main>;
}
async function apiRequest<T>(url: string, init?: RequestInit): Promise<T> {
  const response = await fetch(url, init);
  const body: unknown = response.status === 204 ? null : await response.json();
  if (!response.ok) {
    const message = typeof body === "object" && body !== null && "error" in body && typeof body.error === "string" ? body.error : "The request could not be completed.";
    throw new Error(message);
  }
  return body as T;
}
function DataFeedback({ loading, error }: { loading: boolean; error: string }) {
  if (loading) return <div className="data-feedback" role="status">Loading account data…</div>;
  if (error) return <div className="data-feedback data-error" role="alert">{error} <Link to="/login">Sign in</Link> or check the API setup.</div>;
  return null;
}
type AdminBooking = { id: string; reference: string; title: string; name: string; email: string; serviceName: string; clientId: string | null; status: string; createdAt: string; service: { title: string } | null };
type AdminClient = { id: string; email: string; profile: { fullName: string | null } | null };
const bookingTransitionsUI: Record<string, string[]> = {
  NEW_INQUIRY: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["REQUIREMENTS_DISCUSSION", "CANCELLED"],
  REQUIREMENTS_DISCUSSION: ["CANCELLED"],
  PROPOSAL_SENT: ["AWAITING_APPROVAL", "AWAITING_PAYMENT", "CANCELLED"],
  AWAITING_APPROVAL: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["IN_PROGRESS", "COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
function AdminBookings() {
  const [items, setItems] = useState<AdminBooking[]>([]);
  const [clients, setClients] = useState<AdminClient[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  const [saving, setSaving] = useState("");
  const [notice, setNotice] = useState("");
  const [proposalTarget, setProposalTarget] = useState<AdminBooking | null>(null);
  useEffect(() => {
    let active = true;
    Promise.all([apiRequest<{ items: AdminBooking[] }>("/api/admin/bookings"), apiRequest<AdminClient[]>("/api/admin/clients")]).then(([bookings, accounts]) => { if (active) { setItems(bookings.items); setClients(accounts); } }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Could not load inquiries and client accounts."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, []);
  const changeStatus = async (booking: AdminBooking, status: string) => {
    setSaving(booking.id); setNotice(""); setError("");
    try {
      const updated = await apiRequest<AdminBooking>(`/api/admin/bookings/${booking.id}/status`, { method: "PATCH", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ status }) });
      setItems((current) => current.map((item) => item.id === booking.id ? { ...item, status: updated.status } : item));
      setNotice(`Inquiry ${booking.reference} updated to ${updated.status.replaceAll("_", " ").toLowerCase()}.`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The inquiry status could not be changed."); }
    finally { setSaving(""); }
  };
  const linkClient = async (booking: AdminBooking, clientId: string) => {
    setSaving(booking.id); setError(""); setNotice("");
    try {
      await apiRequest(`/api/admin/bookings/${booking.id}/link-client`, { method: "POST", headers: { "Content-Type": "application/json" }, body: JSON.stringify({ clientId }) });
      setItems((current) => current.map((item) => item.id === booking.id ? { ...item, clientId } : item));
      setNotice(`Matched account linked to inquiry ${booking.reference}.`);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The account could not be linked."); }
    finally { setSaving(""); }
  };
  const createProposal = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    if (!proposalTarget) return;
    setSaving(proposalTarget.id); setError(""); setNotice("");
    const values = new FormData(event.currentTarget);
    try {
      await apiRequest(`/api/admin/bookings/${proposalTarget.id}/proposals`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ scope: values.get("scope"), exclusions: values.get("exclusions"), amount: values.get("amount"), taxAmount: values.get("taxAmount") || "0", currency: values.get("currency"), timeline: values.get("timeline"), validityDays: Number(values.get("validityDays")) }),
      });
      setItems((current) => current.map((item) => item.id === proposalTarget.id ? { ...item, status: "PROPOSAL_SENT" } : item));
      setNotice(`Proposal created for ${proposalTarget.reference}. The client can review it after signing in.`);
      setProposalTarget(null);
    } catch (failure) { setError(failure instanceof Error ? failure.message : "The proposal could not be created."); }
    finally { setSaving(""); }
  };
  return <section className="admin-bookings-content"><DataFeedback loading={loading} error={error} />{notice && <p className="form-status" role="status">{notice}</p>}{!loading && !error && items.length === 0 && <div className="data-feedback">No project inquiries have been submitted.</div>}{items.length > 0 && <div className="data-table-wrap"><table className="data-table"><thead><tr><th>Reference</th><th>Project</th><th>Client</th><th>Service</th><th>Account / Proposal</th><th>Status</th><th>Received</th></tr></thead><tbody>{items.map((booking) => { const matchingClient = clients.find((client) => client.email.toLowerCase() === booking.email.toLowerCase()); const choices = bookingTransitionsUI[booking.status] ?? []; return <tr key={booking.id}><td>{booking.reference}</td><td>{booking.title}</td><td>{booking.name}<small>{booking.email}</small></td><td>{booking.service?.title ?? booking.serviceName}</td><td>{booking.clientId ? booking.status === "UNDER_REVIEW" || booking.status === "REQUIREMENTS_DISCUSSION" ? <button className="table-action" onClick={() => setProposalTarget(booking)}>Create proposal</button> : "Account linked" : matchingClient ? <button disabled={saving === booking.id} className="table-action" onClick={() => void linkClient(booking, matchingClient.id)}>Link matching account</button> : <small>No matching account yet</small>}</td><td><select aria-label={`Change status for ${booking.reference}`} value={booking.status} disabled={saving === booking.id || choices.length === 0} onChange={(event) => void changeStatus(booking, event.target.value)}>{[booking.status, ...choices].map((status) => <option key={status} value={status}>{status.replaceAll("_", " ")}</option>)}</select></td><td>{new Date(booking.createdAt).toLocaleDateString()}</td></tr>; })}</tbody></table></div>}{proposalTarget && <form className="proposal-form" onSubmit={createProposal}><div className="proposal-form-heading"><div><span className="footer-label">NEW PROPOSAL · {proposalTarget.reference}</span><h3>{proposalTarget.title}</h3></div><button type="button" className="button button-outline" onClick={() => setProposalTarget(null)}>Cancel</button></div><label>Scope of work<textarea name="scope" required minLength={20} maxLength={12000} rows={5} placeholder="Describe scope, deliverables, and the agreed approach" /></label><label>Exclusions<textarea name="exclusions" maxLength={6000} rows={2} placeholder="Optional exclusions" /></label><div className="form-two-col"><label>Price<input name="amount" type="number" min="0.01" step="0.01" required /></label><label>Tax amount<input name="taxAmount" type="number" min="0" step="0.01" defaultValue="0" /></label></div><div className="form-two-col"><label>Currency<select name="currency"><option>INR</option><option>USD</option></select></label><label>Estimated timeline<input name="timeline" maxLength={200} placeholder="To be agreed" /></label></div><label>Validity (days)<input name="validityDays" type="number" min="1" max="90" defaultValue="14" required /></label><button className="button button-primary" disabled={Boolean(saving)}>Create proposal <ArrowUpRight size={15} /></button></form>}</section>;
}
type PortalStats = { projects: number; pendingProposals: number; orders: number };
type ClientProjectRecord = { id: string; title: string; status: string; milestones: { id: string; title: string; status: string }[]; updates: { id: string; message: string; createdAt: string }[] };
type ClientProposal = { id: string; reference: string; scope: string; amount: string; currency: string; validUntil: string | null; acceptedAt: string | null; rejectedAt: string | null };
type ClientOrder = { id: string; reference: string; status: string; total: string; currency: string; createdAt: string; items: { product: { title: string } }[]; payments: { status: string; amount: string }[] };
function ClientPortalData() {
  const location = useLocation();
  const path = location.pathname;
  const projectId = path.startsWith("/dashboard/projects/") ? path.slice("/dashboard/projects/".length) : "";
  const url = projectId ? `/api/client/projects/${encodeURIComponent(projectId)}` : path === "/dashboard/projects" ? "/api/client/projects" : path === "/dashboard/proposals" ? "/api/client/proposals" : path === "/dashboard/payments" || path === "/dashboard/orders" ? "/api/client/orders" : path === "/dashboard/files" ? "/api/client/downloads" : "/api/client/dashboard";
  const [data, setData] = useState<PortalStats | ClientProjectRecord | ClientProjectRecord[] | ClientProposal[] | ClientOrder[] | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");
  useEffect(() => {
    let active = true;
    setLoading(true); setError("");
    apiRequest<typeof data>(url).then((result) => { if (active) setData(result); }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Account information could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [url]);
  const [notice, setNotice] = useState("");
  const respondToProposal = async (proposalId: string, action: "accept" | "reject") => {
    setNotice(""); setError("");
    try {
      await apiRequest(`/api/client/proposals/${proposalId}/${action}`, { method: "POST" });
      setNotice(`Proposal ${action}ed successfully.`);
      setData((current) => Array.isArray(current) ? current.map((proposal) => "id" in proposal && proposal.id === proposalId ? { ...proposal, acceptedAt: action === "accept" ? new Date().toISOString() : null, rejectedAt: action === "reject" ? new Date().toISOString() : null } : proposal) as typeof current : current);
    } catch (failure) { setError(failure instanceof Error ? failure.message : `Unable to ${action} the proposal.`); }
  };
  const isProjects = path === "/dashboard/projects";
  const isProjectDetail = Boolean(projectId);
  const isProposals = path === "/dashboard/proposals";
  const isOrders = path === "/dashboard/payments" || path === "/dashboard/orders";
  return <><DataFeedback loading={loading} error={error} />{notice && <p className="form-status" role="status">{notice}</p>}
    {!loading && !error && path === "/dashboard" && data && !Array.isArray(data) && "projects" in data && <div className="dashboard-cards">{[["01", "Projects", data.projects], ["02", "Pending proposals", data.pendingProposals], ["03", "Orders", data.orders]].map(([number, title, count]) => <div className="dashboard-card" key={title}><span>{number}</span><div><h3>{title}</h3><p>{count} recorded for your account</p></div></div>)}</div>}
    {!loading && !error && isProjects && Array.isArray(data) && <div className="portal-list">{(data as ClientProjectRecord[]).map((project) => <article className="portal-row" key={project.id}><div><h3>{project.title}</h3><p>Status: {project.status.replaceAll("_", " ")}</p>{project.milestones.map((milestone) => <span className="tag" key={milestone.id}>{milestone.title}: {milestone.status.replaceAll("_", " ")}</span>)}</div><Link to={`/dashboard/projects/${project.id}`} className="text-link">Project details <ArrowUpRight size={14} /></Link></article>)}{data.length === 0 && <div className="data-feedback">No projects are linked to your account yet.</div>}</div>}
    {!loading && !error && isProjectDetail && data && !Array.isArray(data) && "milestones" in data && <article className="portal-row project-portal-detail"><div><h2>{data.title}</h2><p>Status: {data.status.replaceAll("_", " ")}</p><h3>Milestones</h3>{data.milestones.map((milestone) => <p key={milestone.id}>{milestone.title} — {milestone.status.replaceAll("_", " ")}</p>)}<h3>Updates</h3>{data.updates.map((update) => <p key={update.id}>{new Date(update.createdAt).toLocaleDateString()}: {update.message}</p>)}</div></article>}
    {!loading && !error && isProposals && Array.isArray(data) && <div className="portal-list">{(data as ClientProposal[]).map((proposal) => <article className="portal-row" key={proposal.id}><div><h3>{proposal.reference}</h3><p>{proposal.scope}</p><strong>{proposal.currency} {proposal.amount}</strong><p>{proposal.acceptedAt ? "Accepted" : proposal.rejectedAt ? "Declined" : proposal.validUntil ? `Valid until ${new Date(proposal.validUntil).toLocaleDateString()}` : "Awaiting your response"}</p></div>{!proposal.acceptedAt && !proposal.rejectedAt && <div className="button-row"><button className="button button-outline" onClick={() => void respondToProposal(proposal.id, "reject")}>Decline</button><button className="button button-primary" onClick={() => void respondToProposal(proposal.id, "accept")}>Accept proposal <Check size={14} /></button></div>}</article>)}{data.length === 0 && <div className="data-feedback">There are no proposals for your account.</div>}</div>}
    {!loading && !error && isOrders && Array.isArray(data) && <div className="portal-list">{(data as ClientOrder[]).map((order) => <article className="portal-row" key={order.id}><div><h3>Order {order.reference}</h3><p>{order.items.map((item) => item.product.title).join(", ")}</p><p>Status: {order.status.replaceAll("_", " ")} · {new Date(order.createdAt).toLocaleDateString()}</p><strong>{order.currency} {order.total}</strong></div><span>{order.payments.map((payment) => payment.status).join(", ") || "No payment recorded"}</span></article>)}{data.length === 0 && <div className="data-feedback">No orders or payments are recorded for your account.</div>}</div>}
    {!loading && !error && path === "/dashboard/files" && <div className="data-feedback">Files are only exposed through verified project access and short-lived secure links. No files are available in this environment.</div>}
  </>;
}
function DashboardPage({ admin = false }: { admin?: boolean }) {
  const location = useLocation();
  const adminBookings = admin && location.pathname === "/admin/bookings";
  const adminNav = [["Overview", "/admin"], ["Bookings", "/admin/bookings"]];
  const clientNav = [["Overview", "/dashboard"], ["Projects", "/dashboard/projects"], ["Proposals", "/dashboard/proposals"], ["Payments", "/dashboard/payments"], ["Files", "/dashboard/files"]];
  const isAdmin = admin;
  const pageTitle = adminBookings ? "Booking requests." : isAdmin ? "Platform overview." : location.pathname === "/dashboard/projects" ? "Your projects." : location.pathname === "/dashboard/proposals" ? "Your proposals." : location.pathname === "/dashboard/files" ? "Project files." : location.pathname === "/dashboard/payments" ? "Order & payment history." : "Your workspace.";
  const [stats, setStats] = useState<{ inquiries: number; newInquiries: number; activeProjects: number; pendingProposals: number; orders: number; successfulPaymentCount: number } | null>(null);
  const [loading, setLoading] = useState(isAdmin && !adminBookings);
  const [error, setError] = useState("");
  useEffect(() => {
    if (!isAdmin || adminBookings) return;
    let active = true;
    apiRequest<typeof stats>("/api/admin/dashboard").then((result) => { if (active) setStats(result); }).catch((failure: unknown) => { if (active) setError(failure instanceof Error ? failure.message : "Admin information could not be loaded."); }).finally(() => { if (active) setLoading(false); });
    return () => { active = false; };
  }, [isAdmin, adminBookings]);
  return <main className="dashboard-page page-shell"><div className="dashboard-top"><div><Eyebrow>{isAdmin ? "ADMINISTRATION" : "CLIENT PORTAL"}</Eyebrow><h1>{pageTitle}</h1><p>{adminBookings ? "Review real inquiries and move them through the validated status workflow." : isAdmin ? "Overview counts are loaded from the database; no sample analytics are shown." : "Your projects, proposals, orders, and updates in one place."}</p></div><Link to="/" className="button button-outline">Back to website <ArrowUpRight size={15} /></Link></div><nav className="portal-nav" aria-label={isAdmin ? "Admin navigation" : "Client dashboard navigation"}>{(isAdmin ? adminNav : clientNav).map(([label, path]) => <NavLink key={path} end to={path}>{label}</NavLink>)}</nav>
    {adminBookings ? <><div className="subpage-heading"><Eyebrow>INQUIRIES</Eyebrow><h2>Project requests</h2></div><AdminBookings /></> : isAdmin ? <><DataFeedback loading={loading} error={error} />{stats && !error && <div className="dashboard-cards">{[["01", "All inquiries", stats.inquiries], ["02", "New inquiries", stats.newInquiries], ["03", "Active projects", stats.activeProjects], ["04", "Pending proposals", stats.pendingProposals], ["05", "Product orders", stats.orders], ["06", "Verified payments", stats.successfulPaymentCount]].map(([number, title, count]) => <div className="dashboard-card" key={title}><span>{number}</span><div><h3>{title}</h3><p>{count} recorded</p></div></div>)}</div>}<Link className="button button-primary admin-bookings-link" to="/admin/bookings">Review inquiries <ArrowRight size={15} /></Link></> : <ClientPortalData />}
  </main>;
}

function PolicyPage() {
  const { policySlug } = useParams();
  const title = policySlug === "privacy" ? "Privacy Policy" : policySlug === "terms" ? "Terms of Service" : policySlug === "service-agreement" ? "Service Agreement" : policySlug === "product-license" ? "Digital Product License" : policySlug === "payment-policy" ? "Payment Policy" : "Refund & Cancellation Policy";
  return <main><PageIntro eyebrow="POLICIES & BUSINESS INFORMATION" title={<>{title}.<br /><span className="heading-muted">A template for review.</span></>} text="This editable policy outline is not legal advice. Review and adapt it for the actual business, services, data processing, payment provider, and applicable laws before publishing." /><section className="section page-shell policy-copy"><div className="notice-box"><BadgeCheck size={17} /><span>Template only — business-specific terms, contact details, retention periods, and jurisdiction need review before launch.</span></div><h2>Purpose and scope</h2><p>This page provides a starting structure for Abhishek Sharma’s website and service platform. Its wording does not assert a business registration, legal approval, or guarantee.</p><h2>Information and service terms</h2><p>Project requests are inquiries only. A project becomes confirmed only after the scope, proposal, terms, and any agreed payment schedule are explicitly accepted.</p><h2>Payments and digital products</h2><p>Payment processing must remain disabled until provider credentials, webhook verification, product details, refund rules, and business policies have been configured and reviewed.</p><h2>Contact and updates</h2><p>Replace this template with reviewed, accurate business information before using this website in production.</p></section></main>;
}
function BookingSuccess() { return <main className="success-page page-shell"><div className="success-icon"><Check /></div><Eyebrow>PROJECT INQUIRY</Eyebrow><h1>Thanks for reaching<br /><span className="heading-muted">out.</span></h1><p>Check the reference on your confirmation. An inquiry is not a confirmed booking or payment.</p><Link to="/" className="button button-primary">Back to home <ArrowRight size={16} /></Link></main>; }
function NotFound() { return <main className="not-found page-shell"><span>404</span><h1>That page isn’t here.</h1><p>The link may have moved, or the page may not exist yet.</p><Link to="/" className="button button-primary">Back to home <ArrowLeft size={16} /></Link></main>; }

export default function App() {
  const location = useLocation();
  const reduceMotion = useReducedMotion();
  useEffect(() => {
    const privateRoute = /^\/(dashboard|admin|login|register|verify-email|forgot-password|reset-password|orders|downloads|checkout|cart)(\/|$)/.test(location.pathname);
    const titleForPath = location.pathname === "/" ? "Abhishek Sharma | Web Developer & Software Engineer"
      : location.pathname === "/about" ? "About Abhishek Sharma | Web Developer & Software Engineer"
      : location.pathname.startsWith("/projects/") ? `${projects.find((item) => item.slug === location.pathname.split("/").pop())?.title ?? "Project"} — Abhishek Sharma`
      : location.pathname === "/projects" ? "Projects — Abhishek Sharma"
      : location.pathname.startsWith("/services/") ? `${services.find((item) => item.slug === location.pathname.split("/").pop())?.title ?? "Service"} — Abhishek Sharma`
      : location.pathname === "/services" ? "Services — Abhishek Sharma"
      : location.pathname.startsWith("/products/") ? `${products.find((item) => item.slug === location.pathname.split("/").pop())?.title ?? "Product"} — Abhishek Sharma`
      : location.pathname === "/products" ? "Digital Products — Abhishek Sharma"
      : `${location.pathname.slice(1).replaceAll("-", " ").replace(/\b\w/g, (letter) => letter.toUpperCase())} — Abhishek Sharma`;
    document.title = titleForPath;
    const descriptionForPath = location.pathname === "/"
      ? "Meet Abhishek Sharma, a web developer focused on modern websites, React applications, full-stack development, and digital products."
      : location.pathname === "/about"
        ? "I'm Abhishek Sharma, a web developer passionate about building modern, user-friendly websites and software applications."
        : "Abhishek Sharma builds thoughtful websites, full-stack applications, and digital products.";
    const description = document.querySelector<HTMLMetaElement>('meta[name="description"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "description" }));
    description.content = privateRoute ? "Private account area." : descriptionForPath;
    const robots = document.querySelector<HTMLMetaElement>('meta[name="robots"]') ?? document.head.appendChild(Object.assign(document.createElement("meta"), { name: "robots" }));
    robots.content = privateRoute ? "noindex, nofollow" : "index, follow";
    const canonical = document.querySelector<HTMLLinkElement>('link[rel="canonical"]') ?? document.head.appendChild(Object.assign(document.createElement("link"), { rel: "canonical" }));
    canonical.href = `https://abhisheksharma.tech${location.pathname}`;
    const ogTitle = document.querySelector<HTMLMetaElement>('meta[property="og:title"]');
    if (ogTitle) ogTitle.content = titleForPath;
    const ogDescription = document.querySelector<HTMLMetaElement>('meta[property="og:description"]');
    if (ogDescription) ogDescription.content = privateRoute ? "Private account area." : descriptionForPath;
    const ogUrl = document.querySelector<HTMLMetaElement>('meta[property="og:url"]');
    if (ogUrl) ogUrl.content = canonical.href;
    const twitterTitle = document.querySelector<HTMLMetaElement>('meta[name="twitter:title"]');
    if (twitterTitle) twitterTitle.content = titleForPath;
    const twitterDescription = document.querySelector<HTMLMetaElement>('meta[name="twitter:description"]');
    if (twitterDescription) twitterDescription.content = privateRoute ? "Private account area." : descriptionForPath;
  }, [location.pathname]);
  return <div className="app"><a className="skip-link" href="#main-content">Skip to main content</a><Header /><AnimatePresence mode="wait"><motion.div id="main-content" tabIndex={-1} key={location.pathname} initial={reduceMotion ? false : { opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }} transition={{ duration: reduceMotion ? 0 : 0.16 }}><Routes>
    <Route path="/" element={<Home />} /><Route path="/about" element={<About />} /><Route path="/projects" element={<ProjectsPage />} /><Route path="/projects/:slug" element={<ProjectDetail />} />
    <Route path="/services" element={<ServicesPage />} /><Route path="/services/:serviceSlug" element={<ServiceDetail />} /><Route path="/products" element={<ProductsPage />} /><Route path="/products/:productSlug" element={<ProductDetail />} />
    <Route path="/book" element={<BookingPage />} /><Route path="/book/:serviceSlug" element={<BookingPage />} /><Route path="/booking-success" element={<BookingSuccess />} /><Route path="/contact" element={<Contact />} />
    <Route path="/login" element={<AuthPage />} /><Route path="/register" element={<AuthPage register />} /><Route path="/verify-email" element={<VerifyEmailPage />} /><Route path="/forgot-password" element={<ForgotPasswordPage />} /><Route path="/reset-password" element={<ResetPasswordPage />} /><Route path="/dashboard/*" element={<DashboardPage />} /><Route path="/admin/*" element={<DashboardPage admin />} />
    <Route path="/privacy" element={<PolicyPage />} /><Route path="/terms" element={<PolicyPage />} /><Route path="/service-agreement" element={<PolicyPage />} /><Route path="/product-license" element={<PolicyPage />} /><Route path="/payment-policy" element={<PolicyPage />} /><Route path="/refund-policy" element={<PolicyPage />} /><Route path="*" element={<NotFound />} />
  </Routes></motion.div></AnimatePresence><Footer /></div>;
}
