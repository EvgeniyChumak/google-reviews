module.exports = async (req, res) => {
  // CORS
  const origin = req.headers.origin || "*";
  res.setHeader("Access-Control-Allow-Origin", origin);
  res.setHeader("Access-Control-Allow-Methods", "GET, OPTIONS");
  res.setHeader("Access-Control-Allow-Headers", "Content-Type, Authorization");
  res.setHeader("Vary", "Origin");

  if (req.method === "OPTIONS") {
    return res.status(204).end();
  }

  // ---- 1. Читаем place_id ----
  const placeId = req.query.pid;

  if (!placeId) {
    return res.status(400).json({
      error: "pid_required",
      message: "You must provide ?pid=PLACE_ID",
    });
  }

  // ---- 2. Кэш на 7 дней, отдельно для каждого place_id ----
  // Создаём ключ кэша уникальный для каждого placeId
  res.setHeader(
    "Cache-Control",
    "s-maxage=604800, stale-while-revalidate=86400"
  );
  res.setHeader("Vary", "Origin, Query");

  /*
    ⚡ s-maxage=604800 — 7 дней хранится в Edge CDN
    ⚡ stale-while-revalidate=86400 — если протухло → 24ч отдаётся старое,
       а Vercel обновляет фоном
    ⚡ Vary: Query → ДАННЫЕ КЭШИРУЮТСЯ ПОТ PLACE_ID!!!
       То есть google?pid=AAA и google?pid=BBB будут иметь свой отдельный кеш.
  */

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

    // ---- 3. Возвращаем данные (будут сохранены в кеш) ----
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
