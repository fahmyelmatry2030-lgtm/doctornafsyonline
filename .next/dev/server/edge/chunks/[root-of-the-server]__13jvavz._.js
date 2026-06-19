(globalThis["TURBOPACK"] || (globalThis["TURBOPACK"] = [])).push(["chunks/[root-of-the-server]__13jvavz._.js",
"[externals]/node:buffer [external] (node:buffer, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:buffer", () => require("node:buffer"));

module.exports = mod;
}),
"[externals]/node:async_hooks [external] (node:async_hooks, cjs)", ((__turbopack_context__, module, exports) => {

const mod = __turbopack_context__.x("node:async_hooks", () => require("node:async_hooks"));

module.exports = mod;
}),
"[project]/src/middleware.ts [middleware-edge] (ecmascript)", ((__turbopack_context__) => {
"use strict";

// Middleware removed to avoid Node.js fs/path edge runtime issues with settings JSON read.
// Maintenance mode is instead checked inside root page rendering.
__turbopack_context__.s([
    "middleware",
    ()=>middleware
]);
async function middleware() {
    return;
}
}),
]);

//# sourceMappingURL=%5Broot-of-the-server%5D__13jvavz._.js.map