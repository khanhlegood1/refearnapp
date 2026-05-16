# Contributing to RefearnApp 🚀

First off, thank you for considering contributing to RefearnApp! It's people like you who make open-source tools great.

Whether you're fixing a typo, squashing a bug, or proposing a massive new feature, your time and interest are deeply appreciated.

---

## 💬 Connect & Self-Host

Before you start coding, we highly recommend checking our documentation. It contains the full guide for **Self-Hosting** RefearnApp if you wish to run a production-like instance. If you run into issues during setup, our Discord community is the best place to ask for help.

- [Explore the Docs (Self-Hosting Guide) »](https://refearnapp.com/docs)
- [Discord Support](https://discord.gg/fHw9j7P3w9)

1. **GitHub Issues:** Best for bug reports and formal feature proposals.
2. **Discord:** Best for quick questions and real-time brainstorming.

---

## 🛠 Local Development Setup

RefearnApp uses a modern monorepo stack: **Next.js**, **Cloudflare Workers**, **Drizzle ORM**, and **pnpm workspaces**.

### Prerequisites

1. Node.js (LTS)
2. pnpm (Package Manager)
3. Bun (Required for database scripts)
4. PostgreSQL (Local or hosted)
5. **Mailpit** (For capturing outgoing emails locally)
6. **Caddy** (Required for routing the affiliate portal and subdomains)
7. **ngrok** (For testing payment gateway webhooks locally)

---

### 1. Getting Started

```bash
git clone https://github.com/YOUR_USERNAME/refearnapp.git
cd refearnapp
pnpm install
```

### 2. Local DNS Configurations (`/etc/hosts`)

Before running Caddy or configuring local multi-tenant subdomains, you must map the local loops in your operating system's hosts file.

Open `/etc/hosts` (Linux/macOS) or `C:\Windows\System32\drivers\etc\hosts` (Windows as Admin) and append the following block:

```
127.0.0.1 refearnapp.com
127.0.0.1 xyz.refearnapp.com
127.0.0.1 xmm.refearnapp.com
127.0.0.1 shipfast.refearnapp.com
127.0.0.1 shipfast.com
127.0.0.1 my.shipfast.com
127.0.0.1 simulator.test
```
> 💡 **Pro-Tip (Switching Back to Production):** > When your local hosts file points `refearnapp.com` to `127.0.0.1`, your browser will try to load your local machine instead of the live website. If you stop running Caddy and need to access the real production platforms or documentation, simply open your hosts file again and comment out these lines by adding a `#` in front of them:
> ```text
> # 127.0.0.1 refearnapp.com
> # 127.0.0.1 xyz.refearnapp.com
> ```

### 3. Environment Configurations

You must configure the environment variables across the distinct sub-packages to test end-to-end functionality.

#### A. Main Dashboard Application

Copy the template:

```bash
cp apps/dashboard/.env.example apps/dashboard/.env
```

Open `apps/dashboard/.env` and update the core parameters. For testing tracking redirects locally, you must first start ngrok in a separate terminal to expose your local server:

```bash
ngrok http 3000
```

Copy the generated tunnel URL (e.g., `https://your-tunnel-id.ngrok-free.app`) and assign it here:

```
NEXT_PUBLIC_REDIRECTION_URL=https://your-tunnel-id.ngrok-free.app
```

> **Stripe Connect Setup NOTE:** To test standard Stripe Connect structures successfully, ensure you add your local callbacks (e.g., `http://localhost:3000/api/auth/callback/...`) into your main Stripe Account App integration settings.

#### B. Tracking Worker (Cloudflare Worker)

Create a `.dev.vars` file inside the tracking worker directory:

```bash
touch apps/tracking-worker/.dev.vars
```

Populate `apps/tracking-worker/.dev.vars` with the following template:

```
# General
ENVIRONMENT=development
IS_SELF_HOSTED=false
INTERNAL_SECRET=your_secret_key

# Local Routing - No ngrok needed for basic UI/Click testing
MAIN_APP_URL=http://localhost:3000
PAGES_URL=http://localhost:4321
PRIMARY_HOST=localhost:8787

# Simulator Routing
SIMULATOR_URL=http://localhost:3001
UPSTASH_REDIS_REST_URL="https://your-instance.upstash.io"
UPSTASH_REDIS_REST_TOKEN="AXzOAAIncDJjNDczNDdiZWYyZmE0..."
```

#### C. Simulator Sandbox Integration

Create an environment file inside your local simulator:

```bash
touch apps/simulator/.env
```

Populate `apps/simulator/.env` with your sandbox test credentials:

```
# --- Stripe Integration ---
# (Note: Use credentials associated with the Connected/Merchant Test Accounts here, NOT the Main platform account)
STRIPE_SECRET_KEY=sk_test_...
NEXT_PUBLIC_STRIPE_PLAN_20_ID=price_...
NEXT_PUBLIC_STRIPE_PLAN_40_ID=price_...
NEXT_PUBLIC_STRIPE_LIFETIME_ID=price_...

# --- Paddle Integration ---
# (Note: Use Sandbox tokens and mapping configurations)
PADDLE_NOTIFICATION_SETTING_ID=ntf_...
NEXT_PUBLIC_PADDLE_PRICE_PRO=pri_...
NEXT_PUBLIC_PADDLE_PRICE_ULTIMATE=pri_...
NEXT_PUBLIC_PADDLE_PRICE_ONE_TIME=pri_...

PADDLE_SECRET_TOKEN=pdl_sdbx_apikey_...
PADDLE_API_KEY=pdl_sdbx_apikey_...
PADDLE_WEBHOOK_PUBLIC_KEY="-----BEGIN PUBLIC KEY-----\n..."
```

### 4. Database Management

The easiest way to set up your database is using the root scripts:

- **Setup & Sync:** `pnpm db:setup` — Initializes schema and core system data
- **Seed Sandbox Data:** `pnpm db:seed` — Populates the DB with demo data to verify the dashboard

> **Sandbox Account Credentials:** After seeding, you can log in to any seeded account using its email address. The standard sandbox password is `12345678`. If that doesn't work, try `123456789`.

### 5. Running the Application

You can launch all apps concurrently from the root directory or pick specific filters to minimize system resources.

#### Option A: Spin Up Everything (Global Workspace)

```bash
pnpm dev
```

#### Option B: Target Specific Services (Recommended)

Open multiple terminal sessions or single-out dependencies via pnpm workspace filters:

```bash
# Main UI Dashboard App (Port: 3000)
pnpm dev --filter @repo/dashboard

# Tracking Cloudflare Worker Engine (Port: 8787)
pnpm dev --filter @repo/tracking-worker

# Payment Flow Sandbox Simulator (Port: 3001)
pnpm dev --filter simulator

# Marketing / Landing Page Resource Container
pnpm dev --filter @repo/landing-page
```

### 6. Local Routing Services & Utilities

To verify end-to-end functionality, make sure your auxiliary background services are running:

**Local Mail Engine:** Install Mailpit and run it globally to intercept all testing transactional emails:

```bash
mailpit
```

**Subdomain Proxy Routing:** Navigate to the main dashboard container and execute Caddy to map local multitenancy profiles using your `/etc/hosts` layers:

```bash
cd apps/dashboard
caddy run
```

---

## 📏 Contribution Rules

- 🚫 **No Automated AI Contributions** — Pull Requests generated primarily by automated AI tools without deep manual code refinement are not accepted.
- **Large Structural Changes** — Discuss via GitHub Issues or Discord first before refactoring core state.
- **Small Changes** — Docs fixes, typing corrections, layout adjustments → Submit a Pull Request directly.

---

## 🚀 How to Submit Your Changes

1. Create a scoped feature branch:
   ```bash
   git checkout -b feature/amazing-feature
   ```

2. Commit your incremental changes using structured convention prefixes:
   ```bash
   git commit -m "feat: add email notifications"
   ```

3. Push up to your fork:
   ```bash
   git push origin feature/amazing-feature
   ```

4. Open a clean Pull Request explaining precisely what changed and why.

---

## 📖 Types of Contributions

- **Code:** Structural features, bug fixes, performance micro-optimizations.
- **Documentation:** Structural refinements to the codebase or guides.
- **Feedback:** Feature requests, issue replication scripts, integration feedback.