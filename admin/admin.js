document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pid-input");
  const result = document.getElementById("result");
  const generateBtn = document.getElementById("generate-btn");
  const copyBtn = document.getElementById("copy-btn");

  const BASE_URL = "https://google-reviews-rho.vercel.app/api/reviews";

  generateBtn.addEventListener("click", () => {
    const pid = input.value.trim();

    if (!pid) {
      result.value = "Error: place_id is empty.";
      return;
    }

    const script = `
<script defer>
document.addEventListener("DOMContentLoaded", async () => {
  try {
    const res = await fetch("${BASE_URL}?pid=${pid}", {
      method: "GET",
      mode: "cors",
      headers: { "Accept": "application/json" }
    });

    const data = await res.json();

    document.querySelector("[google-rating]").textContent = data.rating;
    document.querySelector("[google-total]").textContent = data.total;
  } catch (err) {
    console.error("Google Reviews error:", err);
  }
});
</script>
`;

    const instructions = `
-----------------------------
✨ FINAL 2 STEPS:

1) Copy the code above and paste it into:
   - Project Settings → Custom Code → Before </body>
     (if you need the rating on the entire website)
   OR
   - Page Settings → Custom Code → Before </body>
     (if the rating is needed only on one page)

2) Add attributes:
   [google-rating]  – element that must contain the average rating  
   [google-total]   – element that must contain the reviews count

   Tip: If the text is inside a paragraph, wrap only the necessary part in <span>
   and apply the attribute to that <span>.
-----------------------------
`;

    result.value = script.trim() + "\n\n" + instructions.trim();
  });

  copyBtn.addEventListener("click", () => {
    result.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });
});
