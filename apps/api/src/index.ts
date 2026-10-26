import "dotenv/config";
import { randomBytes, randomUUID, createHash } from "node:crypto";
import express, { type NextFunction, type Request, type Response } from "express";
import cors from "cors";
import helmet from "helmet";
import { rateLimit } from "express-rate-limit";
import bcrypt from "bcryptjs";
import { PrismaNeon } from "@prisma/adapter-neon";
import { BookingStatus, Prisma, PrismaClient } from "@prisma/client";
import { z } from "zod";

const app = express();
const databaseUrl = process.env.DATABASE_URL;
const prisma = databaseUrl
  ? new PrismaClient({
      adapter: new PrismaNeon({ connectionString: databaseUrl }),
    })
  : new PrismaClient();
const port = Number(process.env.API_PORT ?? 4000);
const appBaseUrl = process.env.APP_BASE_URL
  ?? (process.env.VERCEL_URL ? `https://${process.env.VERCEL_URL}` : "http://localhost:5173");
const production = process.env.NODE_ENV === "production";
const cookieName = "as_session";

app.disable("x-powered-by");
app.use(helmet());
app.use(cors({ origin: appBaseUrl, credentials: true, methods: ["GET", "POST", "PATCH", "DELETE"] }));
app.use(express.json({ limit: "32kb" }));

const authLimiter = rateLimit({ windowMs: 15 * 60 * 1000, limit: 12, standardHeaders: "draft-8", legacyHeaders: false });
const inquiryLimiter = rateLimit({ windowMs: 60 * 60 * 1000, limit: 6, standardHeaders: "draft-8", legacyHeaders: false });

type Identity = { id: string; email: string; role: "CLIENT" | "ADMIN" };
type AuthedRequest = Request & { identity: Identity };
class WorkflowConflictError extends Error {}

const emailSchema = z.string().trim().email().max(254).transform((value) => value.toLowerCase());
const bookingSchema = z.object({
  service: z.string().trim().min(1).max(120),
  title: z.string().trim().min(2).max(160),
  description: z.string().trim().min(20).max(5000),
  requirements: z.string().trim().max(5000).optional().default(""),
  budget: z.string().trim().max(80).optional().default(""),
  timeline: z.string().trim().max(80).optional().default(""),
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  phone: z.string().trim().max(40).optional().default(""),
  contact: z.enum(["Email", "Phone", "WhatsApp"]),
  privacy: z.literal(true),
});
const contactSchema = z.object({
  name: z.string().trim().min(2).max(120),
  email: emailSchema,
  message: z.string().trim().min(10).max(5000),
});
const tokenSchema = z.object({ token: z.string().min(32).max(256) });
const resetPasswordSchema = tokenSchema.extend({ password: z.string().min(10).max(128) });
const authSchema = z.object({
  email: emailSchema,
  password: z.string().min(10).max(128),
});
const registerSchema = authSchema.extend({ name: z.string().trim().min(2).max(120) });
const proposalSchema = z.object({
  scope: z.string().trim().min(20).max(12000),
  exclusions: z.string().trim().max(6000).optional().default(""),
  revisionPolicy: z.string().trim().max(1000).optional().default(""),
  terms: z.string().trim().max(6000).optional().default(""),
  amount: z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/, "Enter a valid proposal amount.").refine((value) => Number(value) > 0, "Proposal amount must be greater than zero."),
  taxAmount: z.string().regex(/^\d{1,10}(?:\.\d{1,2})?$/).optional().default("0"),
  currency: z.enum(["INR", "USD"]).default("INR"),
  timeline: z.string().trim().max(200).optional().default(""),
  validityDays: z.number().int().min(1).max(90).default(14),
});

function safeError(res: Response, status: number, message: string) {
  return res.status(status).json({ error: message });
}
function isSameOrigin(req: Request): boolean {
  const origin = req.get("origin");
  if (!origin) return true;
  try {
    return new URL(origin).origin === new URL(appBaseUrl).origin;
  } catch {
    return false;
  }
}
app.use("/api", (req, res, next) => {
  if (!["GET", "HEAD", "OPTIONS"].includes(req.method) && !isSameOrigin(req)) {
    safeError(res, 403, "Request origin is not allowed.");
    return;
  }
  next();
});

function cookieToken(req: Request): string | undefined {
  const pair = req.headers.cookie?.split(";").map((value) => value.trim()).find((value) => value.startsWith(`${cookieName}=`));
  return pair?.slice(cookieName.length + 1);
}
function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}
function emailConfigured(): boolean {
  return Boolean(process.env.EMAIL_PROVIDER_API_KEY && process.env.EMAIL_FROM);
}
function escapeHtml(value: string): string {
  return value.replace(/[&<>"']/g, (character) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", "\"": "&quot;", "'": "&#39;" })[character] ?? character);
}
async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const apiKey = process.env.EMAIL_PROVIDER_API_KEY;
  const from = process.env.EMAIL_FROM;
  if (!apiKey || !from) throw new Error("EMAIL_PROVIDER_NOT_CONFIGURED");
  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: { Authorization: `Bearer ${apiKey}`, "Content-Type": "application/json" },
    body: JSON.stringify({ from, to, subject, html }),
  });
  if (!response.ok) throw new Error(`EMAIL_PROVIDER_HTTP_${response.status}`);
}
async function createAccountToken(userId: string, purpose: "EMAIL_VERIFICATION" | "PASSWORD_RESET") {
  const token = randomBytes(32).toString("base64url");
  await prisma.accountToken.create({
    data: {
      userId,
      purpose,
      tokenHash: hashToken(token),
      expiresAt: new Date(Date.now() + (purpose === "EMAIL_VERIFICATION" ? 24 : 1) * 60 * 60 * 1000),
    },
  });
  return token;
}
function routeParam(req: Request, name: string): string | null {
  const value = req.params[name];
  return typeof value === "string" ? value : null;
}
async function findIdentity(req: Request): Promise<Identity | null> {
  const token = cookieToken(req);
  if (!token) return null;
  const session = await prisma.session.findUnique({ where: { tokenHash: hashToken(token) }, include: { user: true } });
  if (!session || session.expiresAt <= new Date()) {
    if (session) await prisma.session.delete({ where: { id: session.id } });
    return null;
  }
  return { id: session.user.id, email: session.user.email, role: session.user.role };
}
function setSessionCookie(res: Response, token: string) {
  res.cookie(cookieName, token, {
    httpOnly: true,
    secure: production,
    sameSite: "lax",
    path: "/",
    maxAge: 7 * 24 * 60 * 60 * 1000,
  });
}
async function createSession(userId: string, res: Response) {
  const token = randomBytes(32).toString("base64url");
  await prisma.session.create({
    data: { userId, tokenHash: hashToken(token), expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000) },
  });
  setSessionCookie(res, token);
}
function requireRole(role: Identity["role"]) {
  return async (req: Request, res: Response, next: NextFunction) => {
    try {
      const identity = await findIdentity(req);
      if (!identity) return safeError(res, 401, "Sign in to continue.");
      if (identity.role !== role) return safeError(res, 403, "You are not authorized to access this resource.");
      (req as AuthedRequest).identity = identity;
      next();
    } catch (error) {
      next(error);
    }
  };
}
const requireClientOrAdmin = async (req: Request, res: Response, next: NextFunction) => {
  try {
    const identity = await findIdentity(req);
    if (!identity) return safeError(res, 401, "Sign in to continue.");
    (req as AuthedRequest).identity = identity;
    next();
  } catch (error) {
    next(error);
  }
};
function parseBody<S extends z.ZodType>(schema: S, req: Request, res: Response): z.output<S> | null {
  const result = schema.safeParse(req.body);
  if (!result.success) {
    safeError(res, 400, result.error.issues.map((issue) => issue.message).join(" "));
    return null;
  }
  return result.data;
}
function dbUnavailable(res: Response) {
  return safeError(res, 503, "The database is not available. Configure DATABASE_URL and run the Prisma schema push.");
}
function asyncRoute(handler: (req: Request, res: Response, next: NextFunction) => Promise<unknown>) {
  return (req: Request, res: Response, next: NextFunction) => {
    void handler(req, res, next).catch(next);
  };
}

app.get("/api/health", asyncRoute(async (_req, res) => {
  try {
    await prisma.$queryRaw`SELECT 1`;
    res.json({ status: "ok", database: "connected" });
  } catch (error) {
    const details = error instanceof Prisma.PrismaClientInitializationError
      ? { name: error.name, code: error.errorCode }
      : { name: error instanceof Error ? error.name : "UnknownError" };
    console.error("Database health check failed", details);
    safeError(res, 503, "API is running, but the database is not connected.");
  }
}));

app.get("/api/projects", asyncRoute(async (_req, res) => {
  try {
    const items = await prisma.project.findMany({
      where: { status: "PUBLISHED" },
      orderBy: [{ featured: "desc" }, { sortOrder: "asc" }],
      include: { technologies: { select: { name: true } }, projectCategory: { select: { name: true, slug: true } } },
    });
    res.json(items.map(({ technologies, projectCategory, ...project }) => ({ ...project, category: projectCategory, technologies: technologies.map((item) => item.name) })));
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) return dbUnavailable(res);
    throw error;
  }
}));
app.get("/api/projects/:slug", asyncRoute(async (req, res) => {
  const slug = routeParam(req, "slug");
  if (!slug) return safeError(res, 400, "A valid project slug is required.");
  const project = await prisma.project.findFirst({
    where: { slug, status: "PUBLISHED" },
    include: { technologies: { select: { name: true } }, projectCategory: { select: { name: true, slug: true } } },
  });
  if (!project) return safeError(res, 404, "Project not found.");
  const { technologies, projectCategory, ...data } = project;
  res.json({ ...data, category: projectCategory, technologies: technologies.map((item) => item.name) });
}));
app.get("/api/services", asyncRoute(async (_req, res) => {
  const items = await prisma.service.findMany({ where: { status: "PUBLISHED", available: true }, orderBy: { sortOrder: "asc" }, include: { serviceCategory: { select: { name: true, slug: true } } } });
  res.json(items);
}));
app.get("/api/services/:slug", asyncRoute(async (req, res) => {
  const slug = routeParam(req, "slug");
  if (!slug) return safeError(res, 400, "A valid service slug is required.");
  const item = await prisma.service.findFirst({ where: { slug, status: "PUBLISHED", available: true }, include: { serviceCategory: { select: { name: true, slug: true } } } });
  if (!item) return safeError(res, 404, "Service not found.");
  res.json(item);
}));
app.get("/api/products", asyncRoute(async (_req, res) => {
  const items = await prisma.product.findMany({ where: { status: "PUBLISHED" }, orderBy: { createdAt: "desc" }, include: { productCategory: { select: { name: true, slug: true } } } });
  res.json(items.map(({ productCategory, ...product }) => ({ ...product, category: productCategory })));
}));
app.get("/api/products/:slug", asyncRoute(async (req, res) => {
  const slug = routeParam(req, "slug");
  if (!slug) return safeError(res, 400, "A valid product slug is required.");
  const item = await prisma.product.findFirst({ where: { slug, status: "PUBLISHED" }, include: { files: { where: { isPublic: true } }, productCategory: { select: { name: true, slug: true } } } });
  if (!item) return safeError(res, 404, "Product not found.");
  const { productCategory, ...product } = item;
  res.json({ ...product, category: productCategory });
}));
app.get("/api/site-settings/public", asyncRoute(async (_req, res) => {
  const settings = await prisma.siteSetting.findMany({ where: { key: { in: ["brand", "contact", "social", "availability", "seo"] } } });
  res.json(Object.fromEntries(settings.map(({ key, value }) => [key, value])));
}));
app.get("/api/faqs", asyncRoute(async (_req, res) => {
  res.json(await prisma.fAQ.findMany({ where: { published: true }, orderBy: { sortOrder: "asc" }, select: { id: true, question: true, answer: true } }));
}));

app.post("/api/bookings", inquiryLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(bookingSchema, req, res);
  if (!input) return;
  try {
    const serviceSlug = input.service.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
    const service = await prisma.service.findFirst({ where: { OR: [{ slug: serviceSlug }, { title: input.service }], status: "PUBLISHED", available: true } });
    const reference = `ASH-${randomUUID().slice(0, 8).toUpperCase()}`;
    const booking = await prisma.booking.create({
      data: {
        reference,
        serviceId: service?.id,
        serviceName: input.service,
        name: input.name,
        email: input.email,
        phone: input.phone || null,
        contactMethod: input.contact,
        title: input.title,
        description: input.description,
        requirements: input.requirements || null,
        budget: input.budget || null,
        timeline: input.timeline || null,
        privacyAccepted: true,
        status: "NEW_INQUIRY",
      },
      select: { reference: true, status: true, createdAt: true },
    });
    let emailStatus: "sent" | "not_configured" | "failed" = "not_configured";
    if (emailConfigured()) {
      const adminEmail = process.env.ADMIN_NOTIFICATION_EMAIL ?? process.env.ADMIN_BOOTSTRAP_EMAIL;
      try {
        await sendEmail(input.email, `Project inquiry received · ${booking.reference}`, `<p>Hi ${escapeHtml(input.name)},</p><p>Your project inquiry has been received for review. Reference: <strong>${booking.reference}</strong>.</p><p>This is an inquiry, not a confirmed booking or payment.</p>`);
        if (adminEmail) await sendEmail(adminEmail, `New project inquiry · ${booking.reference}`, `<p>A new project inquiry was submitted.</p><p>Reference: <strong>${booking.reference}</strong><br>Project: ${escapeHtml(input.title)}</p>`);
        emailStatus = "sent";
      } catch (error) {
        console.error("Booking email delivery failed.", { code: error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR" });
        emailStatus = "failed";
      }
    }
    res.status(201).json({ ...booking, emailStatus });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) return dbUnavailable(res);
    throw error;
  }
}));
app.post("/api/contact", inquiryLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(contactSchema, req, res);
  if (!input) return;
  try {
    const message = await prisma.contactMessage.create({ data: input, select: { id: true, createdAt: true } });
    res.status(201).json({ received: true, id: message.id });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientInitializationError) return dbUnavailable(res);
    throw error;
  }
}));

app.post("/api/auth/register", authLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(registerSchema, req, res);
  if (!input) return;
  if (!emailConfigured()) return safeError(res, 503, "Email verification is not configured. An account cannot be created until email delivery is available.");
  try {
    const passwordHash = await bcrypt.hash(input.password, 12);
    const user = await prisma.user.create({
      data: { email: input.email, passwordHash, profile: { create: { fullName: input.name } } },
      select: { id: true, email: true, role: true },
    });
    const token = await createAccountToken(user.id, "EMAIL_VERIFICATION");
    const verificationUrl = `${appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;
    try {
      await sendEmail(user.email, "Verify your email address", `<p>Complete account registration by <a href="${verificationUrl}">verifying your email address</a>.</p><p>This link expires in 24 hours.</p>`);
    } catch (error) {
      console.error("Verification email delivery failed.", { code: error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR" });
      return safeError(res, 502, "Your account was created, but the verification email could not be sent. Request another verification email.");
    }
    res.status(201).json({ message: "Account created. Check your inbox to verify your email before signing in." });
  } catch (error) {
    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") return safeError(res, 409, "An account with this email already exists.");
    if (error instanceof Prisma.PrismaClientInitializationError) return dbUnavailable(res);
    throw error;
  }
}));
app.post("/api/auth/verify-email", authLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(tokenSchema, req, res);
  if (!input) return;
  const record = await prisma.accountToken.findFirst({ where: { tokenHash: hashToken(input.token), purpose: "EMAIL_VERIFICATION", expiresAt: { gt: new Date() } }, include: { user: true } });
  if (!record) return safeError(res, 400, "This verification link is invalid or expired. Request a new one.");
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { emailVerifiedAt: new Date() } });
    await tx.accountToken.deleteMany({ where: { userId: record.userId, purpose: "EMAIL_VERIFICATION" } });
  });
  await createSession(record.userId, res);
  res.json({ user: { id: record.user.id, email: record.user.email, role: record.user.role } });
}));
app.post("/api/auth/resend-verification", authLimiter, asyncRoute(async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) return safeError(res, 400, "Enter a valid email address.");
  if (!emailConfigured()) return safeError(res, 503, "Email delivery is not configured.");
  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (user && !user.emailVerifiedAt) {
    await prisma.accountToken.deleteMany({ where: { userId: user.id, purpose: "EMAIL_VERIFICATION" } });
    const token = await createAccountToken(user.id, "EMAIL_VERIFICATION");
    const verificationUrl = `${appBaseUrl}/verify-email?token=${encodeURIComponent(token)}`;
    try {
      await sendEmail(user.email, "Verify your email address", `<p><a href="${verificationUrl}">Verify your email address</a> to finish setting up your account.</p><p>This link expires in 24 hours.</p>`);
    } catch (error) {
      console.error("Verification email delivery failed.", { code: error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR" });
      return safeError(res, 502, "The verification email could not be sent. Please try again later.");
    }
  }
  res.status(202).json({ message: "If an unverified account exists for that email, a verification link has been sent." });
}));
app.post("/api/auth/forgot-password", authLimiter, asyncRoute(async (req, res) => {
  const body = z.object({ email: emailSchema }).safeParse(req.body);
  if (!body.success) return safeError(res, 400, "Enter a valid email address.");
  if (!emailConfigured()) return safeError(res, 503, "Password recovery email is not configured.");
  const user = await prisma.user.findUnique({ where: { email: body.data.email } });
  if (user) {
    await prisma.accountToken.deleteMany({ where: { userId: user.id, purpose: "PASSWORD_RESET" } });
    const token = await createAccountToken(user.id, "PASSWORD_RESET");
    const resetUrl = `${appBaseUrl}/reset-password?token=${encodeURIComponent(token)}`;
    try {
      await sendEmail(user.email, "Reset your password", `<p><a href="${resetUrl}">Reset your password</a>. This link expires in one hour.</p><p>If you did not request this, ignore this email.</p>`);
    } catch (error) {
      console.error("Password reset email delivery failed.", { code: error instanceof Error ? error.message : "UNKNOWN_EMAIL_ERROR" });
      return safeError(res, 502, "The recovery email could not be sent. Please try again later.");
    }
  }
  res.status(202).json({ message: "If an account exists for that email, a password reset link has been sent." });
}));
app.post("/api/auth/reset-password", authLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(resetPasswordSchema, req, res);
  if (!input) return;
  const record = await prisma.accountToken.findFirst({ where: { tokenHash: hashToken(input.token), purpose: "PASSWORD_RESET", expiresAt: { gt: new Date() } } });
  if (!record) return safeError(res, 400, "This reset link is invalid or expired. Request a new one.");
  const passwordHash = await bcrypt.hash(input.password, 12);
  await prisma.$transaction(async (tx) => {
    await tx.user.update({ where: { id: record.userId }, data: { passwordHash } });
    await tx.session.deleteMany({ where: { userId: record.userId } });
    await tx.accountToken.deleteMany({ where: { userId: record.userId, purpose: "PASSWORD_RESET" } });
  });
  res.json({ message: "Password updated. Sign in with your new password." });
}));
app.post("/api/auth/login", authLimiter, asyncRoute(async (req, res) => {
  const input = parseBody(authSchema, req, res);
  if (!input) return;
  const user = await prisma.user.findUnique({ where: { email: input.email } });
  if (!user || !(await bcrypt.compare(input.password, user.passwordHash))) return safeError(res, 401, "Email or password is incorrect.");
  if (!user.emailVerifiedAt) return safeError(res, 403, "Verify your email before signing in.");
  await createSession(user.id, res);
  res.json({ user: { id: user.id, email: user.email, role: user.role } });
}));
app.post("/api/auth/logout", asyncRoute(async (req, res) => {
  const token = cookieToken(req);
  if (token) await prisma.session.deleteMany({ where: { tokenHash: hashToken(token) } });
  res.clearCookie(cookieName, { httpOnly: true, secure: production, sameSite: "lax", path: "/" });
  res.status(204).end();
}));
app.get("/api/auth/me", asyncRoute(async (req, res) => {
  const identity = await findIdentity(req);
  if (!identity) return safeError(res, 401, "Sign in to continue.");
  res.json({ user: identity });
}));

app.get("/api/client/dashboard", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const userId = (req as AuthedRequest).identity.id;
  const [projects, proposals, orders] = await Promise.all([
    prisma.clientProject.count({ where: { clientId: userId } }),
    prisma.proposal.count({ where: { clientId: userId, acceptedAt: null, rejectedAt: null } }),
    prisma.order.count({ where: { userId } }),
  ]);
  res.json({ projects, pendingProposals: proposals, orders });
}));
app.get("/api/client/projects", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  res.json(await prisma.clientProject.findMany({
    where: { clientId: identity.id },
    include: { milestones: { orderBy: { sortOrder: "asc" } }, updates: { orderBy: { createdAt: "desc" } } },
    orderBy: { updatedAt: "desc" },
  }));
}));
app.get("/api/client/projects/:id", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid project ID is required.");
  const project = await prisma.clientProject.findFirst({
    where: { id, clientId: identity.id },
    include: { milestones: { orderBy: { sortOrder: "asc" } }, updates: { orderBy: { createdAt: "desc" } }, proposal: true },
  });
  if (!project) return safeError(res, 404, "Project not found.");
  res.json(project);
}));
app.get("/api/client/proposals", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  res.json(await prisma.proposal.findMany({ where: { clientId: identity.id }, include: { items: true }, orderBy: { createdAt: "desc" } }));
}));
app.post("/api/client/proposals/:id/accept", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid proposal ID is required.");
  const proposal = await prisma.proposal.findFirst({ where: { id, clientId: identity.id } });
  if (!proposal) return safeError(res, 404, "Proposal not found.");
  if (proposal.rejectedAt || proposal.acceptedAt) return safeError(res, 409, "This proposal has already been answered.");
  if (proposal.validUntil && proposal.validUntil < new Date()) return safeError(res, 409, "This proposal has expired.");
  const booking = await prisma.booking.findFirst({ where: { id: proposal.bookingId, status: { in: ["PROPOSAL_SENT", "AWAITING_APPROVAL"] } } });
  if (!booking) return safeError(res, 409, "This proposal is not awaiting a client decision.");
  const created = await prisma.$transaction(async (tx) => {
    const acceptedAt = new Date();
    const updated = await tx.proposal.updateMany({
      where: { id: proposal.id, acceptedAt: null, rejectedAt: null, OR: [{ validUntil: null }, { validUntil: { gte: acceptedAt } }] },
      data: { acceptedAt },
    });
    if (updated.count !== 1) throw new WorkflowConflictError("This proposal has already been answered or has expired.");
    const bookingUpdate = await tx.booking.updateMany({ where: { id: proposal.bookingId, status: { in: ["PROPOSAL_SENT", "AWAITING_APPROVAL"] } }, data: { status: "CONFIRMED" } });
    if (bookingUpdate.count !== 1) throw new WorkflowConflictError("This proposal is no longer awaiting a client decision.");
    const project = await tx.clientProject.create({
      data: { clientId: identity.id, proposalId: proposal.id, title: booking.title, milestones: { create: { title: "Discovery and requirements", description: "Confirm project requirements, scope, and next steps.", sortOrder: 0 } } },
    });
    await tx.auditLog.create({ data: { actorId: identity.id, action: "PROPOSAL_ACCEPTED", resource: "Proposal", resourceId: proposal.id } });
    return { project };
  });
  res.json(created);
}));
app.post("/api/client/proposals/:id/reject", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid proposal ID is required.");
  const proposal = await prisma.proposal.findFirst({ where: { id, clientId: identity.id } });
  if (!proposal) return safeError(res, 404, "Proposal not found.");
  if (proposal.rejectedAt || proposal.acceptedAt) return safeError(res, 409, "This proposal has already been answered.");
  const rejectedAt = new Date();
  await prisma.$transaction(async (tx) => {
    const changed = await tx.proposal.updateMany({ where: { id: proposal.id, acceptedAt: null, rejectedAt: null }, data: { rejectedAt } });
    if (changed.count !== 1) throw new WorkflowConflictError("This proposal has already been answered.");
    await tx.booking.updateMany({ where: { id: proposal.bookingId, status: "PROPOSAL_SENT" }, data: { status: "REQUIREMENTS_DISCUSSION" } });
    await tx.auditLog.create({ data: { actorId: identity.id, action: "PROPOSAL_REJECTED", resource: "Proposal", resourceId: proposal.id } });
  });
  res.json({ id: proposal.id, rejectedAt });
}));
app.get("/api/client/orders", requireClientOrAdmin, asyncRoute(async (req, res) => {
  const identity = (req as AuthedRequest).identity;
  res.json(await prisma.order.findMany({ where: { userId: identity.id }, include: { items: { include: { product: { select: { title: true, slug: true } } } }, payments: true }, orderBy: { createdAt: "desc" } }));
}));
app.get("/api/client/downloads", requireClientOrAdmin, asyncRoute(async (_req, res) => {
  res.status(503).json({ error: "Secure downloads are unavailable until private object storage and verified purchase flows are configured." });
}));

app.get("/api/admin/dashboard", requireRole("ADMIN"), asyncRoute(async (_req, res) => {
  const [inquiries, newInquiries, activeProjects, pendingProposals, orders, successfulPaymentCount] = await Promise.all([
    prisma.booking.count(),
    prisma.booking.count({ where: { status: "NEW_INQUIRY" } }),
    prisma.clientProject.count({ where: { status: { not: "COMPLETED" } } }),
    prisma.proposal.count({ where: { acceptedAt: null, rejectedAt: null } }),
    prisma.order.count(),
    prisma.payment.count({ where: { status: "SUCCESSFUL" } }),
  ]);
  res.json({ inquiries, newInquiries, activeProjects, pendingProposals, orders, successfulPaymentCount });
}));
app.get("/api/admin/bookings", requireRole("ADMIN"), asyncRoute(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 25));
  const cursor = typeof req.query.cursor === "string" ? req.query.cursor : undefined;
  const bookings = await prisma.booking.findMany({
    take: limit + 1,
    ...(cursor ? { skip: 1, cursor: { id: cursor } } : {}),
    orderBy: { createdAt: "desc" },
    include: { service: { select: { title: true } } },
  });
  const hasMore = bookings.length > limit;
  const items = hasMore ? bookings.slice(0, limit) : bookings;
  res.json({ items, nextCursor: hasMore ? items[items.length - 1]?.id : null });
}));
app.get("/api/admin/clients", requireRole("ADMIN"), asyncRoute(async (req, res) => {
  const limit = Math.min(100, Math.max(1, Number(req.query.limit) || 50));
  res.json(await prisma.user.findMany({
    take: limit,
    where: { role: "CLIENT", emailVerifiedAt: { not: null } },
    orderBy: { createdAt: "desc" },
    select: { id: true, email: true, createdAt: true, profile: { select: { fullName: true } } },
  }));
}));
app.post("/api/admin/bookings/:id/link-client", requireRole("ADMIN"), asyncRoute(async (req, res) => {
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid booking ID is required.");
  const body = z.object({ clientId: z.string().min(1) }).safeParse(req.body);
  if (!body.success) return safeError(res, 400, "A client account is required.");
  const [booking, client] = await Promise.all([
    prisma.booking.findUnique({ where: { id } }),
    prisma.user.findUnique({ where: { id: body.data.clientId }, select: { id: true, email: true } }),
  ]);
  if (!booking || !client) return safeError(res, 404, "Booking or client account not found.");
  if (booking.email.toLowerCase() !== client.email.toLowerCase()) return safeError(res, 409, "The booking email does not match the selected client account.");
  const identity = (req as AuthedRequest).identity;
  const linked = await prisma.$transaction(async (tx) => {
    const updated = await tx.booking.update({ where: { id }, data: { clientId: client.id } });
    await tx.auditLog.create({ data: { actorId: identity.id, action: "BOOKING_CLIENT_LINKED", resource: "Booking", resourceId: id } });
    return updated;
  });
  res.json(linked);
}));
app.post("/api/admin/bookings/:id/proposals", requireRole("ADMIN"), asyncRoute(async (req, res) => {
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid booking ID is required.");
  const input = parseBody(proposalSchema, req, res);
  if (!input) return;
  const booking = await prisma.booking.findUnique({ where: { id } });
  if (!booking) return safeError(res, 404, "Booking not found.");
  if (!booking.clientId) return safeError(res, 409, "Link this inquiry to a matching client account before creating a proposal.");
  const clientId = booking.clientId;
  if (!["UNDER_REVIEW", "REQUIREMENTS_DISCUSSION"].includes(booking.status)) return safeError(res, 409, "Move this inquiry to review before sending a proposal.");
  const identity = (req as AuthedRequest).identity;
  const created = await prisma.$transaction(async (tx) => {
    const moved = await tx.booking.updateMany({
      where: { id: booking.id, status: { in: ["UNDER_REVIEW", "REQUIREMENTS_DISCUSSION"] }, clientId },
      data: { status: "PROPOSAL_SENT" },
    });
    if (moved.count !== 1) throw new WorkflowConflictError("The inquiry changed or is no longer ready for a proposal.");
    const proposal = await tx.proposal.create({
      data: {
        reference: `ASH-P-${randomUUID().slice(0, 8).toUpperCase()}`,
        bookingId: booking.id,
        clientId,
        scope: input.scope,
        exclusions: input.exclusions || null,
        revisionPolicy: input.revisionPolicy || null,
        terms: input.terms || null,
        amount: input.amount,
        taxAmount: input.taxAmount,
        currency: input.currency,
        timeline: input.timeline || null,
        validUntil: new Date(Date.now() + (input.validityDays ?? 14) * 24 * 60 * 60 * 1000),
      },
      include: { items: true },
    });
    await tx.auditLog.create({ data: { actorId: identity.id, action: "PROPOSAL_CREATED", resource: "Proposal", resourceId: proposal.id } });
    return proposal;
  });
  res.status(201).json(created);
}));
const transitions: Record<BookingStatus, BookingStatus[]> = {
  NEW_INQUIRY: ["UNDER_REVIEW", "CANCELLED"],
  UNDER_REVIEW: ["REQUIREMENTS_DISCUSSION", "CANCELLED"],
  REQUIREMENTS_DISCUSSION: ["CANCELLED"],
  PROPOSAL_SENT: ["AWAITING_APPROVAL", "AWAITING_PAYMENT", "REQUIREMENTS_DISCUSSION", "CONFIRMED", "CANCELLED"],
  AWAITING_APPROVAL: ["AWAITING_PAYMENT", "CONFIRMED", "CANCELLED"],
  AWAITING_PAYMENT: ["CONFIRMED", "CANCELLED"],
  CONFIRMED: ["IN_PROGRESS", "CANCELLED"],
  IN_PROGRESS: ["IN_REVIEW", "CANCELLED"],
  IN_REVIEW: ["IN_PROGRESS", "COMPLETED"],
  COMPLETED: [],
  CANCELLED: [],
};
app.patch("/api/admin/bookings/:id/status", requireRole("ADMIN"), asyncRoute(async (req, res) => {
  const body = z.object({ status: z.nativeEnum(BookingStatus) }).safeParse(req.body);
  if (!body.success) return safeError(res, 400, "A valid booking status is required.");
  const id = routeParam(req, "id");
  if (!id) return safeError(res, 400, "A valid booking ID is required.");
  const current = await prisma.booking.findUnique({ where: { id } });
  if (!current) return safeError(res, 404, "Booking not found.");
  if (!transitions[current.status].includes(body.data.status)) return safeError(res, 409, `Booking cannot move from ${current.status} to ${body.data.status}.`);
  const identity = (req as AuthedRequest).identity;
  const updated = await prisma.$transaction(async (tx) => {
    const booking = await tx.booking.update({ where: { id: current.id }, data: { status: body.data.status } });
    await tx.auditLog.create({ data: { actorId: identity.id, action: "BOOKING_STATUS_CHANGED", resource: "Booking", resourceId: current.id, metadata: { from: current.status, to: body.data.status } } });
    return booking;
  });
  res.json(updated);
}));

app.use((_req, res) => safeError(res, 404, "API route not found."));
app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  if (error instanceof WorkflowConflictError) return safeError(res, 409, error.message);
  if (error instanceof Prisma.PrismaClientInitializationError) return dbUnavailable(res);
  if (error instanceof Prisma.PrismaClientKnownRequestError) {
    console.error("Database request failed", { code: error.code });
    return safeError(res, 500, "The request could not be completed.");
  }
  console.error("API request failed", error instanceof Error ? error.message : "Unknown error");
  return safeError(res, 500, "The request could not be completed.");
});

export default app;

if (!process.env.VERCEL) {
  const server = app.listen(port, () => console.log(`API listening on http://localhost:${port}`));
  async function shutdown() {
    server.close();
    await prisma.$disconnect();
  }
  process.on("SIGINT", () => void shutdown());
  process.on("SIGTERM", () => void shutdown());
}
