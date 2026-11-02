export const HISTORY_PAGE = `<!doctype html>
<html lang="en">
  <head>
    <meta charset="utf-8" />
    <meta name="viewport" content="width=device-width, initial-scale=1" />
    <title>IsItDown?</title>
    <link rel="icon" type="image/svg+xml" href="/logo.svg" />
    <link rel="preconnect" href="https://fonts.googleapis.com" />
    <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin />
    <link href="https://fonts.googleapis.com/css2?family=Ubuntu+Mono&amp;display=swap" rel="stylesheet" />
    <style>
      :root { color-scheme: dark; }
      body { margin: 0; background: #0f1115; color: #e6e8eb; font: 16px/1.5 "Ubuntu Mono", ui-monospace, monospace; }
      main { max-width: 44rem; margin: 0 auto; padding: 3rem 1rem; }
      h1 { display: flex; align-items: center; gap: 0.75rem; margin: 0 0 1.5rem; font-size: 1.25rem; font-weight: 400; }
      h1 img { height: 2.5rem; width: auto; }
      form { display: flex; flex-wrap: wrap; gap: 0.5rem; }
      input, select, button { font: inherit; color: inherit; background: #171a21; border: 1px solid #2a303c; border-radius: 6px; padding: 0.5rem 0.75rem; }
      input { flex: 1; min-width: 14rem; }
      button { background: #e6e8eb; color: #0f1115; border-color: #e6e8eb; cursor: pointer; }
      input:focus-visible, select:focus-visible, button:focus-visible { outline: 2px solid #5b9cf5; outline-offset: 1px; }
      #summary { margin: 1.5rem 0 0.5rem; color: #8b93a1; }
      table { width: 100%; border-collapse: collapse; }
      th, td { text-align: left; padding: 0.5rem 0; border-bottom: 1px solid #232833; }
      th { color: #8b93a1; font-weight: 400; font-size: 14px; }
      td:first-child { color: #8b93a1; }
      .up { color: #4ade80; }
      .down { color: #f87171; }
    </style>
  </head>
  <body>
    <main>
      <h1><img src="/logo.svg" alt="" />IsItDown?</h1>
      <form id="form">
        <input id="url" type="url" required placeholder="https://example.com" />
        <select id="period">
          <option value="1h">Last hour</option>
          <option value="24h" selected>Last 24 hours</option>
          <option value="7d">Last 7 days</option>
        </select>
        <button type="submit">Show history</button>
      </form>
      <p id="summary"></p>
      <table id="table" hidden>
        <thead>
          <tr><th>Time</th><th>Status</th><th>Details</th></tr>
        </thead>
        <tbody id="rows"></tbody>
      </table>
    </main>
    <script>
      const form = document.getElementById("form");
      const urlInput = document.getElementById("url");
      const periodSelect = document.getElementById("period");
      const summary = document.getElementById("summary");
      const table = document.getElementById("table");
      const rows = document.getElementById("rows");

      function addCell(row, text, className) {
        const cell = document.createElement("td");
        cell.textContent = text;
        if (className) cell.className = className;
        row.appendChild(cell);
      }

      form.addEventListener("submit", async (event) => {
        event.preventDefault();
        const params = new URLSearchParams({ url: urlInput.value, period: periodSelect.value });
        summary.textContent = "Loading...";
        rows.replaceChildren();
        table.hidden = true;

        try {
          const response = await fetch("/api/history?" + params.toString());
          const body = await response.json();
          if (!response.ok) {
            summary.textContent = body.error;
            return;
          }

          summary.textContent =
            body.uptimePercent === null
              ? "No results in this period."
              : "Uptime: " + body.uptimePercent + " %";

          for (const result of body.results) {
            const row = document.createElement("tr");
            addCell(row, new Date(result.checkedAt).toLocaleString());
            addCell(row, result.status.toUpperCase(), result.status);
            addCell(
              row,
              result.outcome === "responded"
                ? "HTTP " + result.httpStatus + ", " + result.responseTimeMS + " ms"
                : result.error,
            );
            rows.appendChild(row);
          }
          table.hidden = body.results.length === 0;
        } catch {
          summary.textContent = "Could not load the history.";
        }
      });
    </script>
  </body>
</html>
`;
