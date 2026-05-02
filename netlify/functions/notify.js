const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event) {
  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "POST,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
  };

  if (event.httpMethod === "OPTIONS") {
    return { statusCode: 204, headers, body: "" };
  }
  if (event.httpMethod !== "POST") {
    return { statusCode: 405, headers, body: "" };
  }

  let payload = {};
  try { payload = JSON.parse(event.body || "{}"); } catch {}

  const email = String(payload.email || "").trim().toLowerCase();
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    return { statusCode: 400, headers, body: JSON.stringify({ error: "Invalid email" }) };
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
      user_agent: event.headers["user-agent"] || "",
      created_at: payload.createdAt || now,
      updated_at: now,
      count: 1,
    });
  }

  const { count } = await supabase
    .from("leads")
    .select("*", { count: "exact", head: true });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify({ ok: true, count }),
  };
};
