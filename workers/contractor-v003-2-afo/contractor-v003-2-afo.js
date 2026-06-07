// contractor-v003-2-afo — CCS Services Group — v0.5.1
// Phase 5: CMS, snapshot publish, articles on homepage, D1-driven contact constants
// All customer-specific content (services, projects, reviews, process, contact) lives in D1.
// To create a new customer instance: fork repo, create new CF resources, update wrangler.toml.

const VERSION = '0.5.1';
const WORKER = 'contractor-v003-2-afo';
const ADMIN_PASS = 'demo';
const R2_PREFIX = 'contractor-v003-2/';
const EMBED_MODEL = '@cf/baai/bge-base-en-v1.5';
const CHAT_MODEL = '@cf/meta/llama-3.1-8b-instruct';

// These defaults are overridden at runtime by the contact section in D1 site_content.
// To customize for a new customer: update the contact section in admin and publish.
const COMPANY = 'CCS Services Group';
const PHONE = '(818) 624-7212';
const PHONE_URL = 'tel:+18186247212';
const LICENSE = 'CSLB #890991';

// See deployed worker on Cloudflare for full source (113KB — exceeds GitHub commit inline limit).
// Source of truth for code: this repo. Source of truth for data: D1 database.
// Deploy pipeline: push to main -> GitHub Action runs wrangler deploy -> live on Cloudflare.
// Note: GitHub Action requires CLOUDFLARE_API_TOKEN secret set in repo settings.
