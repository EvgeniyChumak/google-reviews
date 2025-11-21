module.exports = async (req, res) => {
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const placeId = req.query.pid;

  if (!placeId) {
    return res.status(400).json({
      error: "pid_required",
      message: "You must provide ?pid=PLACE_ID",
    });
  }

  res.setHeader("Cache-Control", "no-store");

  try {
    const apiKey = process.env.GOOGLE_API_KEY;
    const fetch = require("node-fetch");

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`;
    const gRes = await fetch(url);
    const data = await gRes.json();

    if (data.status !== "OK") {
      return res.status(400).json({
        error: data.status,
        message: data.error_message || "Failed to fetch place details",
      });
    }

    return res.status(200).json({
      rating: data.result.rating,
      total: data.result.user_ratings_total,
    });
  } catch (err) {
    console.error("Google Reviews API Error:", err);

    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    });
  }
};
