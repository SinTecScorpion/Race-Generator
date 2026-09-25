RenderForge Free Test Engine — Cloudflare Workers AI / FLUX.1 Schnell

REPLACE in your RenderForge folder:
• RenderForge_index.html
• renderforge-connector.js
• renderforge-image.js
• sw.js

CLOUDFLARE SETUP:
1. Create/sign into a Cloudflare account on Workers Free.
2. Create a Worker named renderforge-image.
3. Add a Workers AI binding named exactly AI.
4. Deploy renderforge-cloudflare-worker.js (or use the included wrangler.toml).
5. Copy the resulting workers.dev URL.
6. In RenderForge, paste it into RenderForge Worker URL, save, and tap Test Free Engine.
7. Prepare a prompt and Generate Image.

The free Workers AI allocation resets daily. The Worker uses @cf/black-forest-labs/flux-1-schnell.
