const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "POST,OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") return res.status(204).end();
  if (req.method !== "POST") return res.status(405).end();

  // body 파싱 (Vercel은 자동 파싱 안 될 수 있음)
  let payload = req.body;
  if (typeof payload === "string") {
    try { payload = JSON.parse(payload); } catch { payload = {}; }
  }
  payload = payload || {};

  const email = String(payload.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return res.status(400).json({ error: "Invalid email" });
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
      user_agent: req.headers["user-agent"] || "",
      created_at: payload.createdAt || now,
      updated_at: now,
      count: 1,
    });
  }

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  return res.status(200).json({ ok: true, count });
};
