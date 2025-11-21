export default async function handler(req, res) {
  // CORS
  res.setHeader("Access-Control-Allow-Origin", "*");
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  if (req.method === "OPTIONS") return res.status(200).end();

  // Вытаскиваем place_id
  const placeId = req.query.pid;

  if (!placeId) {
    return res.status(400).json({
      error: "pid_required",
      message: "You must provide ?pid=PLACE_ID",
    });
  }

  // Cache-Control
  res.setHeader(
    "Cache-Control",
    "s-maxage=604800, stale-while-revalidate=86400"
  );

  try {
    const apiKey = process.env.GOOGLE_API_KEY;

    const url = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total&key=${apiKey}`;

    const gRes = await fetch(url);
    const data = await gRes.json();

    if (data.status !== "OK") {
      return res.status(400).json({
        error: data.status,
        message: data.error_message || "Failed to fetch place details",
      });
    }

    const rating = data.result.rating;
    const total = data.result.user_ratings_total;

    return res.status(200).json({ rating, total });
  } catch (err) {
    console.error("Google Reviews API Error:", err);
    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    });
  }
}
