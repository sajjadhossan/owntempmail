# Changelog

All notable changes to **Owntemp** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [2.5.0] - 2026-11-01
### Added
- **Clean Modern UI Overhaul**: Full design cleanup addressing cognitive overload and visual clutter across PC, Web, and Mobile platforms.
- **Desktop Dual-Pane Master-Detail View (`lg:grid lg:grid-cols-12`)**: Left column (5 cols) hosts active email card, locked inboxes tray, floating OTP widget, and message feed; Right column (7 cols) hosts a live desktop reading pane with HTML/text toggle, verification link chips, attachment downloads, and EML/TXT exports without full-screen modal interruptions.
- **Mobile Bottom Navigation Bar (`lg:hidden`)**: Fixed thumb-accessible bottom tab bar featuring Inbox, Domains (50k+ directory), Simulator, and Settings.
- **Header Decluttering**: Streamlined top navigation bar from 8 cluttered buttons down to essential controls: Simulator pill, Voice OTP toggle, Audio chime toggle, Language switcher, and unified Settings Hub trigger.
- **Floating Quick-OTP Action Banner**: High-priority glowing widget appearing right above the feed when an email with an OTP arrives, allowing 1-click copy and voice recitation without even opening the email.
- **Active Email Feed Highlighting**: Visual focus ring and accent background confirming which email is currently active in the desktop preview pane.

## [2.4.0] - 2026-11-01
### Added
- **Blue-Green Zero-Downtime Deployment Hub**: Complete enterprise controller managing Blue and Green environment slots.
- **1-Click Traffic Cutover & Instant Rollback**: Switch 100% of live traffic between Blue and Green without interrupting active users.
- **Canary Traffic Split Controller**: Interactive slider allowing incremental traffic routing (e.g. 10%, 25%, 50%) to standby releases.
- **Automated Health Probing**: Live probe verifying latency, database integrity, and OTP engine health for both deployment slots.
- **Cutover Audit Trail**: Comprehensive audit log recording timestamp, actor, previous slot, target slot, and cutover reason.
- **GitHub Actions Blue-Green Pipeline (`.github/workflows/blue-green-deploy.yml`)**: Automated CI/CD workflow for deploying, smoke-testing, and cutting over traffic.

## [2.3.0] - 2026-11-01
### Added
- **Browser In-Memory Cache**: Zero-latency (0ms) instant pagination, category switching, and instant rendering without network lag.
- **Edge CDN Optimization (`next.config.ts`)**: Cloudflare & Vercel Edge CDN headers (`Cache-Control: public, max-age=3600, s-maxage=86400, stale-while-revalidate=86400`, `CDN-Cache-Control`, `Cloudflare-CDN-Cache-Control`).
- **Gzip & Brotli HTTP Compression**: Enabled via `compress: true` for minimum data usage and maximum asset delivery speed.
- **Strict Zero-Cache Isolation**: Inbound webhook and `/api/inbox/:path*` strictly isolated with `no-store, no-cache, must-revalidate` ensuring live OTPs are delivered instantaneously.
- **Browser Cache Purge & Status Monitor**: Settings modal and directory modal equipped with real-time CDN badges and 1-click cache purge button.

## [2.2.0] - 2026-11-01
### Added
- **Full 50,000+ Domain Explorer & Browser**: Complete access to browse every single domain in the 51,774 MX-verified dataset.
- **Customizable Batch Size**: Select between 50, 150, 300, 500, or 1,000 domains per page.
- **Full Pagination Suite**: Direct First, Previous, Next, and Last page controls with exact range indicator (`Showing 1–150 of 5,593 domains (Page 1 of 38)`).
- **Continuous "Load More"**: In-grid continuous loading button to dynamically append +150 domains without losing scroll position.
- **Dynamic Category Counters**: Real-time counts on every category pill (All 51,774, Short 11,192, ccTLD 5,593, Temp 610, Dev 864, Privacy 187, Mailinator 39, Guerrilla 14).

## [2.1.0] - 2026-11-01
### Added
- **50,000+ Ultra-Mega Domain Fleet** (`data/disposable-domains-50k.json` with 51,774 active MX-verified domains).
- **ccTLD Country-Code Filter**: Filter by international country extensions (`.de`, `.fr`, `.uk`, `.jp`, `.es`, `.it`, `.in`, `.br`, etc.).
- **Voice OTP Announcer**: Browser-native Web Speech API (`SpeechSynthesisUtterance`) reciting verification codes in clear, spaced digits in both Bengali (`bn-BD`) and English (`en-US`).
- **Interactive OTP Voice Button**: 1-click speaker icon on every OTP badge in inbox and modal viewer.
- **Telegram Bot Real-Time Alerts**: Integrated Bot API token and Chat ID configuration in Settings Hub (`/api/telegram`) with test connection and automatic forwarding of newly arrived emails and OTPs.
- **Enhanced Mega Directory UI**: Updated badge count (`50,000+ Domains Live`), ccTLD filter tab, and instant responsive search.

## [2.0.0] - 2026-11-01
### Added
- Mega 3,500+ Verified Active Disposable Domain Database (`data/disposable-domains-3500.json`).
- Company-Categorized Search API (`/api/domains/search`) with real-time autocompletion and filtering by flagship networks:
  - 👑 Mailinator Network
  - 🚀 Guerrilla Mail Network
  - ✈️ Mail.tm & FL Dubai
  - ⏱️ 10 Minute Mail
  - ⚡ Ultra-Short (6-8 chars)
  - 🛠️ Developer OTP Gateways
  - 🛡️ Privacy Shields
- Interactive 3,500+ Mega Domain Directory Modal with instant search, character length chips, and 1-click address activation.
- Full lifetime PIN lock vault and custom alias support across the entire 3,500+ domain fleet.

## [1.9.0] - 2026-11-01
### Added
- Complete Master 65-Domain Fleet imported across 4 specialized categories (Ultra-Short, Global Public, Security Shield, and Developer Gateways).
- Full compatibility with Guerrilla Mail API, Mail.tm, Maildrop, and Cloud Gateway dispatchers.
- Unified lifetime lock vault and custom username support for all 65 domains.

## [1.8.1] - 2026-11-01
### Added
- Imported Ultra-Short easy-to-type public domains fleet (`grr.la`, `dis.es`, `box.im`, `mail.tm`, `mail.gw`, `0box.eu`, `tmail.ws`, `inbox.si`, `mohmal.im`, `tmpbox.net`, `10mail.org`).
- Priority sorting placing ultra-short 6-8 character domains at the top of the selector.
- Full custom alias support across the entire expanded fleet with instant OTP extraction and lifetime PIN lock.

## [1.8.0] - 2026-11-01
### Added
- Complete fleet of 16 active international free public domains (`sharklasers.com`, `grr.la`, `guerrillamail.*`, `fldubai.com`, `maildrop.cc`, `1secmail.*`, `kzccv.com`, `qiott.com`).
- Multi-Gateway Synchronization Engine (Guerrilla Mail REST API + Mail.tm + Maildrop).
- Custom alias support across all 16 domains with instant address switching.
- Lifetime Inbox Protection Vault: Locked inboxes are protected permanently against any auto-reset, expiry, or background cleanup.

## [1.7.1] - 2026-11-01
### Added
- Prominent dynamic version badge (`v1.7.1`) in Header with glowing status pulse.
- Real-time synchronized version display across Top Navigation, Settings Hub, and Footer.
- Full parity enforcement ensuring app screen always displays current build version.

## [1.7.0] - 2026-11-01
### Added
- Dual Engine: Free Public Domain Gateway (`lib/public-mail-service.ts`) integrated with Mail.tm global network.
- Receive real external emails and OTPs from Google, Facebook, etc. without owning or purchasing any domain.
- Support for custom username aliases (e.g. `sajjad@fldubai.com`, `ceo@fldubai.com`, etc.).
- Professional Business Domain support (`/api/business` & `/api/domains`) for custom corporate email setups.
- Real-time inbound OTP extractor with chime notification on public inboxes.

## [1.6.0] - 2026-11-01
### Added
- Master Unified Settings & Cloudflare API Hub directly inside the Settings modal.
- Target Domain input with editable live feedback in Cloudflare setup form.
- High-visibility inline status result cards (green success / red error) inside Settings.
- Quick Cloudflare API trigger button in the main navigation header.
- Localhost direct verification and debugging engine.

## [1.5.0] - 2026-11-01
### Added
- Cloudflare Automated Setup API endpoint (`/api/cloudflare/setup`) via API Token.
- Custom Vercel live website URL configuration field.
- Step-by-step A-to-Z setup guides for automated and manual Cloudflare routing.
- Instant 1-click Google test OTP button.
- LocalStorage persistence for active inboxes to prevent state resets.

## [1.4.0] - 2026-11-01
### Added
- Custom Business Workspace setup & Branding (`/api/business`).
- Direct custom domain input field with automatic DNS record generator.
- Multi-domain selector with custom business branding support.

## [1.3.0] - 2026-11-01
### Added
- Capacitor Native Android project (`android/`) with package ID `live.owntemp.app`.
- Dual Storage Engine (JSON persistence + Postgres / Supabase ready schema).
- Automated cleanup cron (`/api/cron/cleanup`) preserving lifetime locked inboxes.
- Security PIN brute-force protection with cooldown restrictions.

## [1.2.0] - 2026-10-31
### Added
- Multi-platform packaging for Android APK, Windows PC (.exe), and macOS Universal (.dmg).
- Vercel deployment configuration (`vercel.json`).
- Application Settings & download hub modal.

## [1.1.0] - 2026-10-31
### Added
- Permanent locked inboxes tray (`/api/inbox/locked`).
- Real-time search and filter by OTP.
- QR code generation for quick email sharing on mobile.
- Web Audio API notification chime on incoming email.
- Complete email backup export in JSON format.

## [1.0.0] - 2026-10-31
### Added
- Initial core disposable email engine with lifetime lock mechanism.
- High-precision regex engine for 4-8 digit OTPs and verification URLs.
- Dual language support (Bengali & English) with BDT default.
