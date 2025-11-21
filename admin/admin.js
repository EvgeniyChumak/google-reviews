document.addEventListener("DOMContentLoaded", () => {
  const input = document.getElementById("pid-input");
  const result = document.getElementById("result");
  const generateBtn = document.getElementById("generate-btn");
  const copyBtn = document.getElementById("copy-btn");

  const BASE_URL =
    "https://google-reviews-evgeniychumaks-projects.vercel.app/api/reviews";

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
    const res = await fetch("${BASE_URL}?pid=${pid}");
    const data = await res.json();

    document.querySelector("[google-rating]").textContent = data.rating;
    document.querySelector("[google-total]").textContent = data.total;
  } catch (err) {
    console.error("Google Reviews error:", err);
  }
});
</script>`.trim();

    result.value = script;
  });

  copyBtn.addEventListener("click", () => {
    result.select();
    document.execCommand("copy");
    copyBtn.textContent = "Copied!";
    setTimeout(() => (copyBtn.textContent = "Copy"), 1200);
  });
});
