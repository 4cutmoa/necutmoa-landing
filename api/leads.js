const { createClient } = require("@supabase/supabase-js");

const supabase = createClient(
  process.env.SUPABASE_URL,
  process.env.SUPABASE_KEY
);

module.exports = async function handler(req, res) {
  res.setHeader("Access-Control-Allow-Origin", "*");

  if (req.method !== "GET") return res.status(405).end();

  const { data } = await supabase
    .from("leads")
    .select("*")
    .order("created_at", { ascending: false });

  return res.status(200).json(data);
};
