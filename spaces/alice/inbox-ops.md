# Alice OPS Inbox

---

## MSG-OPS-001 through MSG-OPS-005
**Status:** ✅ All complete — _[archived]_

---

## MSG-OPS-006 · 2026-05-13T22:25:00Z · Build Deployment Pack v1
**Status:** 🔴 Open
**Priority:** High
**Source:** Brainstorm decision MSG-005 / BLT-015

### Objective
Build `docs/deployment-pack-v1.md` in `nothinginfinity/parallel-internet-sites` — a structured, human-followable deployment guide that lets anyone deploy a Parallel Internet Site for a client without Alice’s involvement.

### Required sections

**1. Pre-Deployment Checklist**
Gated items that must be confirmed before running the generator or deploying:
- [ ] DNS: `ai.[clientdomain].com` (or chosen subdomain) created and pointed to host
- [ ] Form action URL confirmed (real endpoint for `contact.html` form POST)
- [ ] Jared / client content approval on all rendered pages
- [ ] `comparisons.html` reviewed and approved (or removed pending review)
- [ ] Main-domain AFO files ready to deploy alongside (`llms.txt`, `agent-context.json`, `sitemap-agent.xml` on main domain)
- [ ] Intake JSON fully populated with zero `{{PLACEHOLDER}}` tokens remaining

**2. Generator Run Instructions**
Step-by-step:
```
cd nothinginfinity/parallel-internet-sites
node scripts/generate-site.js templates/intake/client-intake.example.[client].json
```
- Confirm zero unmatched token warnings in output
- Confirm output folder exists at `examples/[client]/site/`
- Spot-check 3 files: `index.html`, `llms.txt`, `agent-context.json`

**3. Netlify Deploy Steps**
- Create new Netlify site
- Drag-and-drop `examples/[client]/site/` folder OR connect to repo
- Set custom domain to `ai.[clientdomain].com`
- Enable HTTPS
- Confirm deploy URL

**4. GitHub Pages Deploy Steps (alternative)**
- Push `examples/[client]/site/` contents to a `gh-pages` branch or `/docs` folder
- Enable GitHub Pages in repo settings
- Set custom domain
- Confirm CNAME file

**5. Post-Deployment Verification Checklist**
Confirm each of these URLs returns a valid response:
- [ ] `https://ai.[clientdomain].com/` — index page loads
- [ ] `https://ai.[clientdomain].com/robots.txt` — valid, references both sitemaps
- [ ] `https://ai.[clientdomain].com/sitemap.xml` — valid XML, all 7 pages listed
- [ ] `https://ai.[clientdomain].com/sitemap-agent.xml` — valid XML, `agent:mainDomain` declared
- [ ] `https://ai.[clientdomain].com/llms.txt` — readable, business name present
- [ ] `https://ai.[clientdomain].com/agent-context.json` — valid JSON, `content_role` = `knowledge-expansion`
- [ ] `https://[clientdomain].com/llms.txt` — main domain AFO live
- [ ] `https://[clientdomain].com/agent-context.json` — main domain AFO live

**6. Prompt Test Schedule**
- **Day 7 (light check):** Confirm site is indexed. Run baseline prompt on one LLM. Note if site appears in any response. Do not publish as proof yet.
- **Day 30 (serious check):** Run full rubric against all 5 LLMs. Compare to pre-deployment baseline. Document delta. First publishable result.
- **Day 60–90 (trend analysis):** Run again. Compare Day 30 → Day 60–90. Produce before/after/trend deliverable for client.

**7. Client Handoff Template**
A brief summary document to send to the client at launch:
- What was deployed and where
- What the agent files do
- How to update content (re-run generator with updated intake JSON)
- What to expect from prompt test monitoring
- Who to contact for changes

### Completion criteria
- `docs/deployment-pack-v1.md` pushed to `nothinginfinity/parallel-internet-sites`
- Commit message: `docs: Deployment Pack v1 (MSG-OPS-006)`
- Report back as MSG-032 in `spaces/alice/mail.md` to: alice

---
