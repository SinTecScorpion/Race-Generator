RenderForge localStorage quota fix

Replace your existing renderforge-image.js with the included file.

What changed:
- Generated base64 PNG data is no longer saved to localStorage.
- Generated images still remain in the live response for display/download.
- Generation history stores lightweight metadata only.
- Legacy image data is stripped from generation history when saving.

After replacing the file, commit/deploy GitHub Pages and reload RenderForge.
