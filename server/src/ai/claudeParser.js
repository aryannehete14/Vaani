import Anthropic from '@anthropic-ai/sdk';
import { zodOutputFormat } from '@anthropic-ai/sdk/helpers/zod';
import { LlmStoreSchema } from './schema.js';

export const CLAUDE_MODEL = process.env.CLAUDE_MODEL || 'claude-opus-5-5';

const SYSTEM = `You turn a small shop owner's spoken description of their shop into a storefront configuration.

The input is a raw speech-to-text transcript: expect missing punctuation, filler words, Hinglish or Hindi, and numbers written as words ("dedh sau" = 150, "nine to eight" = 09:00-20:00).

Rules:
- Only use facts the owner stated. Never invent phone numbers, emails, addresses, prices or products. Use "" (or 0 for price) for anything not mentioned.
- storeName: as the owner says it, properly capitalised ("maya's bakery" -> "Maya's Bakery").
- hours: convert to 24h HH:MM. Shops rarely close in the morning, so "9 to 8" means 09:00-20:00. "Closed on Sunday" with no other days means days "Mon-Sat".
- products: one entry per distinct item that was named. Keep plural/singular as spoken but in Title Case. A unit like "per kg" goes in the description.
- currency: INR unless another currency is clearly used.
- tagline, about and product descriptions: warm, specific, plain English a customer would enjoy; no exaggerated claims.
- theme: the storefront colour family that suits the shop.
- image: the outline icon that best matches each product. Never use emoji anywhere.
- about: only facts the owner shared about the shop itself (how long it has run, who runs it). Leave it empty otherwise.
- Do not use em dashes in any text you write.`;

/**
 * Parse a transcript with Claude structured outputs.
 * Throws on any failure so the pipeline can fall back to the offline parser.
 */
export async function parseWithClaude(transcript, { timeoutMs = 20_000 } = {}) {
  const client = new Anthropic({ timeout: timeoutMs, maxRetries: 1 });
  const response = await client.messages.parse({
    model: CLAUDE_MODEL,
    max_tokens: 8000,
    output_config: { effort: 'low', format: zodOutputFormat(LlmStoreSchema) },
    system: SYSTEM,
    messages: [{ role: 'user', content: `Shop owner's description:\n\n${transcript}` }],
  });

  if (response.stop_reason === 'refusal' || response.stop_reason === 'max_tokens') {
    throw new Error(`Claude stopped early (${response.stop_reason})`);
  }
  if (!response.parsed_output) throw new Error('Claude returned no parsable output');
  return response.parsed_output;
}
