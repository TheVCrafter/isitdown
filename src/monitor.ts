import { checkUrl } from "./check-url.js";
import { readIntervalMs } from "./config.js";
import { startScheduler } from "./scheduler.js";
import { SqliteStorage } from "./sqlite-storage.js";
import { validateUrl } from "./validate-url.js";

function main(): void {
  const inputs = process.argv.slice(2);

  if (inputs.length === 0) {
    console.error("Usage: npm run monitor -- <url> [<url> ...]");
    console.error("Example: npm run monitor -- https://example.com https://github.com");
    process.exitCode = 1;
    return;
  }

  const urls: string[] = [];
  for (const input of inputs) {
    const validated = validateUrl(input);
    if (validated.valid) {
      urls.push(validated.url);
    } else {
      console.error(`${input}: ${validated.message}`);
      process.exitCode = 1;
    }
  }

  if (urls.length === 0) {
    return;
  }

  let intervalMs: number;
  try {
    intervalMs = readIntervalMs(process.env.CHECK_INTERVAL_SECONDS);
  } catch (error: unknown) {
    console.error(error instanceof Error ? error.message : String(error));
    process.exitCode = 1;
    return;
  }

  const storage = new SqliteStorage(process.env.DATABASE_PATH ?? "isitdown.db");
  const stop = startScheduler({ urls, intervalMs, storage, check: checkUrl });

  console.log(
    `Monitoring ${urls.length} URL(s) every ${intervalMs / 1000} seconds. Press Ctrl+C to stop.`,
  );

  process.on("SIGINT", () => {
    stop();
    storage.close();
    console.log("Stopped.");
  });
}

main();
