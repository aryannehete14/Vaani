import { parseWithRules } from './ruleParser.js';
import { parseWithClaude } from './claudeParser.js';
import { normalizeStore } from './normalize.js';

export function activeEngine() {
  if (process.env.AI_ENGINE === 'rules') return 'rules';
  return process.env.ANTHROPIC_API_KEY ? 'claude' : 'rules';
}

/**
 * Transcript -> validated store config.
 * @param {string} transcript
 * @param {{ engine?: 'auto' | 'rules', claude?: typeof parseWithClaude }} [opts]
 * @returns {Promise<{ store: object, engine: 'claude' | 'rules', warnings: string[] }>}
 */
export async function generateStore(transcript, { engine = 'auto', claude = parseWithClaude } = {}) {
  const notices = [];
  if (engine !== 'rules' && activeEngine() === 'claude') {
    try {
      const raw = await claude(transcript);
      const { store, warnings } = normalizeStore(raw);
      return { store, engine: 'claude', warnings };
    } catch (err) {
      console.warn('[ai] Claude parse failed, using offline parser:', err.message);
      notices.push('AI engine unavailable, so we used the offline parser. Double-check the details below.');
    }
  }
  const { store, warnings } = normalizeStore(parseWithRules(transcript));
  return { store, engine: 'rules', warnings: [...notices, ...warnings] };
}
