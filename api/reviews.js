export default async function handler(req, res) {
  const cors = () => {
    res.setHeader("Access-Control-Allow-Origin", "*");
    res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
    res.setHeader("Access-Control-Allow-Headers", "Content-Type");
  };

  cors();

  if (req.method === "OPTIONS") {
    return res.status(200).end();
  }

  const placeId = req.query.pid;

  if (!placeId) {
    cors();
    return res.status(400).json({
      error: "pid_required",
      message: "You must provide ?pid=PLACE_ID",
    });
  }

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
      cors();
      return res.status(400).json({
        error: data.status,
        message: data.error_message || "Failed to fetch place details",
      });
    }

    cors();
    return res.status(200).json({
      rating: data.result.rating,
      total: data.result.user_ratings_total,
    });
  } catch (err) {
    console.error("Google Reviews API Error:", err);
    cors();
    return res.status(500).json({
      error: "server_error",
      message: "Internal server error",
    });
  }
}
