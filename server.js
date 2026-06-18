// ─── Entry Point Fallback ─────────────────────────────────────────────────────
// Hostinger might look for either "server.js" or "app.js" depending on its
// internal configuration. This file ensures that if Passenger looks for
// server.js, it simply redirects to our main app.js logic.
// ──────────────────────────────────────────────────────────────────────────────

require('./app.js');
