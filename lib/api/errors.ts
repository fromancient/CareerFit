export function formatApiError(error: unknown, fallback: string): string {
  if (!(error instanceof Error)) return fallback;

  const message = error.message;

  if (message.includes("insufficient_quota") || message.includes("429")) {
    return "OpenAI API quota exceeded. Check billing at platform.openai.com and try again.";
  }
  if (message.includes("401") || message.includes("invalid_api_key")) {
    return "Invalid OpenAI API key. Update OPENAI_API_KEY in your .env file.";
  }
  if (message.includes("rate_limit")) {
    return "OpenAI rate limit hit. Wait a moment and try again.";
  }

  return message || fallback;
}
