export type UrlValidation =
  | { readonly valid: true; readonly url: string }
  | { readonly valid: false; readonly message: string };

export function validateUrl(input: string): UrlValidation {
  const trimmed = input.trim();
  if (trimmed === "") {
    return { valid: false, message: "Enter a URL" };
  }

  let url: URL;
  try {
    url = new URL(trimmed);
  } catch {
    return { valid: false, message: "This is not a valid URL" };
  }

  if (url.protocol !== "http:" && url.protocol !== "https:") {
    return { valid: false, message: "Only http and https URLs are supported" };
  }

  return { valid: true, url: url.href };
}
