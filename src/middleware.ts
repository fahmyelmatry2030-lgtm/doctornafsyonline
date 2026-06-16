// Middleware removed to avoid Node.js fs/path edge runtime issues with settings JSON read.
// Maintenance mode is instead checked inside root page rendering.
export async function middleware() {
  return;
}

