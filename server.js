import { createServer } from "node:http";
import { existsSync } from "node:fs";
import { createReadStream } from "node:fs";
import { stat } from "node:fs/promises";
import { Readable } from "node:stream";
import { pipeline } from "node:stream/promises";
import { extname, resolve, sep } from "node:path";
import { fileURLToPath } from "node:url";

const rootDir = resolve(fileURLToPath(new URL(".", import.meta.url)));
const clientDir = resolve(rootDir, "dist/client");
const serverEntryPath = resolve(rootDir, "dist/server/index.js");

if (!existsSync(serverEntryPath)) {
  throw new Error("Build output not found. Run `npm run build` before `npm run start`.");
}

const serverEntry = await import("./dist/server/index.js");
const fetchHandler =
  typeof serverEntry.default === "function"
    ? serverEntry.default
    : typeof serverEntry.default?.fetch === "function"
      ? serverEntry.default.fetch.bind(serverEntry.default)
      : null;

if (!fetchHandler) {
  throw new Error("TanStack Start server entry did not expose a fetch handler.");
}

let buildLoaded = true;

const START_TIME = Date.now();

const MIME_TYPES = new Map([
  [".css", "text/css; charset=utf-8"],
  [".js", "text/javascript; charset=utf-8"],
  [".mjs", "text/javascript; charset=utf-8"],
  [".json", "application/json; charset=utf-8"],
  [".map", "application/json; charset=utf-8"],
  [".svg", "image/svg+xml"],
  [".png", "image/png"],
  [".jpg", "image/jpeg"],
  [".jpeg", "image/jpeg"],
  [".webp", "image/webp"],
  [".ico", "image/x-icon"],
  [".txt", "text/plain; charset=utf-8"],
  [".xml", "application/xml; charset=utf-8"],
  [".webmanifest", "application/manifest+json; charset=utf-8"],
  [".woff", "font/woff"],
  [".woff2", "font/woff2"],
]);

function buildHeaders(source) {
  const headers = new Headers();
  for (const [key, value] of Object.entries(source)) {
    if (value === undefined) continue;
    if (Array.isArray(value)) {
      for (const item of value) headers.append(key, item);
      continue;
    }
    headers.set(key, value);
  }
  return headers;
}

function getContentType(filePath) {
  return MIME_TYPES.get(extname(filePath).toLowerCase()) ?? "application/octet-stream";
}

function tryHealth(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const host = request.headers["x-forwarded-host"] ?? request.headers.host ?? "localhost";
  const proto = request.headers["x-forwarded-proto"] ?? "http";
  const url = new URL(request.url ?? "/", `${proto}://${host}`);

  if (url.pathname !== "/health") return false;

  response.statusCode = 200;
  response.setHeader("Content-Type", "application/json; charset=utf-8");
  response.setHeader("Cache-Control", "no-cache, no-store, must-revalidate");

  const health = {
    status: "ok",
    timestamp: new Date().toISOString(),
    uptime: Math.floor((Date.now() - START_TIME) / 1000),
    buildLoaded,
  };

  const body = JSON.stringify(health);
  response.setHeader("Content-Length", String(Buffer.byteLength(body)));

  if (request.method === "HEAD") {
    response.end();
    return true;
  }

  response.end(body);
  return true;
}

async function tryServeStatic(request, response) {
  if (request.method !== "GET" && request.method !== "HEAD") return false;

  const host = request.headers["x-forwarded-host"] ?? request.headers.host ?? "localhost";
  const proto = request.headers["x-forwarded-proto"] ?? "http";
  const url = new URL(request.url ?? "/", `${proto}://${host}`);
  let pathname;
  try {
    pathname = decodeURIComponent(url.pathname);
  } catch {
    return false;
  }
  const candidatePath = resolve(clientDir, `.${pathname}`);

  if (candidatePath !== clientDir && !candidatePath.startsWith(`${clientDir}${sep}`)) {
    return false;
  }

  let fileStat;
  try {
    fileStat = await stat(candidatePath);
  } catch {
    return false;
  }

  if (!fileStat.isFile()) return false;

  response.statusCode = 200;
  response.setHeader("Content-Type", getContentType(candidatePath));
  response.setHeader("Content-Length", String(fileStat.size));
  response.setHeader(
    "Cache-Control",
    pathname.startsWith("/assets/")
      ? "public, max-age=31536000, immutable"
      : "public, max-age=0, must-revalidate",
  );

  if (request.method === "HEAD") {
    response.end();
    return true;
  }

  await pipeline(createReadStream(candidatePath), response);
  return true;
}

async function handleRequest(request, response) {
  try {
    if (tryHealth(request, response)) return;
    if (await tryServeStatic(request, response)) return;

    const host = request.headers["x-forwarded-host"] ?? request.headers.host ?? "localhost";
    const proto = request.headers["x-forwarded-proto"] ?? "http";
    const headers = buildHeaders(request.headers);
    const url = new URL(request.url ?? "/", `${proto}://${host}`);
    const init = {
      method: request.method,
      headers,
    };

    if (request.method && request.method !== "GET" && request.method !== "HEAD") {
      init.body = Readable.toWeb(request);
      init.duplex = "half";
    }

    const requestInit = new Request(url, init);
    const handlerResponse = await fetchHandler(requestInit);

    response.statusCode = handlerResponse.status;
    response.statusMessage = handlerResponse.statusText;

    handlerResponse.headers.forEach((value, key) => {
      response.setHeader(key, value);
    });

    if (request.method === "HEAD" || !handlerResponse.body) {
      if (handlerResponse.body && request.method === "HEAD") {
        const reader = handlerResponse.body.getReader();
        reader.cancel().catch(() => {});
      }
      response.end();
      return;
    }

    await pipeline(Readable.fromWeb(handlerResponse.body), response);
  } catch (error) {
    console.error("[server] request failed", error);
    if (!response.headersSent) {
      response.statusCode = 500;
      response.setHeader("Content-Type", "text/plain; charset=utf-8");
      response.end("Internal Server Error");
    } else {
      response.destroy();
    }
  }
}

const port = Number(process.env.PORT ?? 3000);
const host = process.env.HOST ?? "0.0.0.0";

const server = createServer((req, res) => {
  void handleRequest(req, res);
});

server.listen(port, host, () => {
  console.log(`[server] listening on http://${host}:${port}`);
});

for (const signal of ["SIGINT", "SIGTERM"]) {
  process.on(signal, () => {
    server.close(() => process.exit(0));
  });
}
