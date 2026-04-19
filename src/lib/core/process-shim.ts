// path-bool reads process.env at module eval time, which breaks in browsers
// that don't have a bundler-level define. This runs before path-bool is
// imported so its reads resolve against a stub.
const g = globalThis as unknown as { process?: { env: Record<string, string | undefined> } }
if (!g.process) g.process = { env: {} }
else if (!g.process.env) g.process.env = {}
