# Changelog

All notable changes to **Owntemp** will be documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.0.0/),
and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

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
