import { checkUrl } from "./check-url.js";
import { formatResult } from "./format-result.js";
import { validateUrl } from "./validate-url.js";

const inputs = process.argv.slice(2);

if (inputs.length === 0) {
  console.error("Usage: npm start -- <url> [<url> ...]");
  console.error("Example: npm start -- https://example.com https://github.com");
  process.exitCode = 1;
}

for (const input of inputs) {
  const validated = validateUrl(input);
  if (!validated.valid) {
    console.error(`${input}: ${validated.message}`);
    process.exitCode = 1;
    continue;
  }

  const result = await checkUrl(validated.url);
  console.log(formatResult(result));
}
