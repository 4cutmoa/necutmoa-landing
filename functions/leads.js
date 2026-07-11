const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

exports.handler = async function (event) {
  const method = event.httpMethod || event.requestContext?.http?.method || "GET";

  const headers = {
    "Access-Control-Allow-Origin": "*",
    "Access-Control-Allow-Methods": "GET,OPTIONS",
    "Access-Control-Allow-Headers": "Content-Type",
    "Content-Type": "application/json",
  };

  if (method === "OPTIONS") return { statusCode: 204, headers, body: "" };
  if (method !== "GET") return { statusCode: 405, headers, body: "" };

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return {
    statusCode: 200,
    headers,
    body: JSON.stringify(data),
  };
};
