const http = require("node:http");
const fs = require("node:fs/promises");
const path = require("node:path");
const { createClient } = require("@supabase/supabase-js");

const root = __dirname;
const port = Number(process.env.PORT || 4173);

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

const mimeTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".gif": "image/gif",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
  ".ttf": "font/ttf",
  ".otf": "font/otf"
};

const corsHeaders = {
  "Access-Control-Allow-Origin": "*",
  "Access-Control-Allow-Methods": "GET,POST,OPTIONS",
  "Access-Control-Allow-Headers": "Content-Type"
};

async function saveLead(payload, request) {
  const email = String(payload.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { status: 400, body: { error: "Invalid email" } };
  }

  const now = new Date().toISOString();

  const { data: existing } = await supabase
    .from("leads")
    .select("id, count")
    .eq("email", email)
    .single();

  if (existing) {
    await supabase
      .from("leads")
      .update({ updated_at: now, count: existing.count + 1, page: payload.page || "" })
      .eq("email", email);
  } else {
    await supabase.from("leads").insert({
      email,
      page: payload.page || "",
      user_agent: request.headers["user-agent"] || "",
      created_at: payload.createdAt || now,
      updated_at: now,
      count: 1
    });
  }

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  return { status: 200, body: { ok: true, count } };
}

function readBody(request) {
  return new Promise((resolve, reject) => {
    let body = "";
    request.on("data", (chunk) => {
      body += chunk;
      if (body.length > 1_000_000) {
        request.destroy();
        reject(new Error("Request body too large"));
      }
    });
    request.on("end", () => resolve(body));
    request.on("error", reject);
  });
}

async function serveStatic(request, response) {
  const url = new URL(request.url, `http://${request.headers.host}`);
  const requestedPath = decodeURIComponent(url.pathname === "/" ? "/index.html" : url.pathname);
  const filePath = path.normalize(path.join(root, requestedPath));

  if (!filePath.startsWith(root)) {
    response.writeHead(403);
    response.end("Forbidden");
    return;
  }

  try {
    const content = await fs.readFile(filePath);
    const ext = path.extname(filePath).toLowerCase();
    response.writeHead(200, { "Content-Type": mimeTypes[ext] || "application/octet-stream" });
    response.end(content);
  } catch {
    response.writeHead(404, { "Content-Type": "text/plain; charset=utf-8" });
    response.end("Not found");
  }
}

const server = http.createServer(async (request, response) => {
  try {
    if (request.method === "OPTIONS") {
      response.writeHead(204, corsHeaders);
      response.end();
      return;
    }

    if (request.method === "POST" && request.url === "/api/notify") {
      const body = await readBody(request);
      const result = await saveLead(JSON.parse(body || "{}"), request);
      response.writeHead(result.status, { "Content-Type": "application/json; charset=utf-8", ...corsHeaders });
      response.end(JSON.stringify(result.body));
      return;
    }

    if (request.method === "GET" && request.url === "/api/leads") {
      const { data } = await supabase.from("leads").select("*").order("created_at", { ascending: false });
      response.writeHead(200, { "Content-Type": "application/json; charset=utf-8", ...corsHeaders });
      response.end(JSON.stringify(data, null, 2));
      return;
    }

    await serveStatic(request, response);
  } catch (error) {
    response.writeHead(500, { "Content-Type": "application/json; charset=utf-8" });
    response.end(JSON.stringify({ error: "Internal server error" }));
  }
});

server.listen(port, () => {
  console.log(`necutmoa landing server: http://localhost:${port}`);
});
