/**
 * Strands Decider 2B Client & System One Typed Decision Interface
 *
 * Implements the typed decision contract for AWS Strands Agents' open-source
 * Strands Decider 2B model (StrandsAgents/strands-decider-2B-hobson-v19).
 *
 * References:
 * - https://strandsagents.com/blog/introducing-strands-decider/
 * - https://github.com/strands-labs/strands-decider
 */

export interface DeciderChoiceQuestion {
  type: 'choice';
  instructions: string;
  options: Record<string, string>;
}

export interface DeciderNoulQuestion {
  type: 'noul';
  instructions: string;
  anchors?: {
    true?: string;
    false?: string;
  };
}

export interface DeciderScoreQuestion {
  type: 'score';
  instructions: string;
  rubric?: string[] | Record<string, string>;
}

export type DeciderQuestion =
  | DeciderChoiceQuestion
  | DeciderNoulQuestion
  | DeciderScoreQuestion;

export interface DeciderSystemOneRequest {
  state: string | Record<string, unknown>;
  questions: Record<string, DeciderQuestion>;
  model?: string;
}

export interface DeciderChoiceAnswer {
  type: 'choice';
  choice: string;
  confidence: number;
  probabilities: Record<string, number>;
}

export interface DeciderNoulAnswer {
  type: 'noul';
  noul: number;
  confidence?: number;
}

export interface DeciderScoreAnswer {
  type: 'score';
  score: number;
  confidence?: number;
}

export type DeciderAnswer =
  | DeciderChoiceAnswer
  | DeciderNoulAnswer
  | DeciderScoreAnswer;

export interface DeciderSystemOneResponse {
  model: string;
  answers: Record<string, DeciderAnswer>;
  usage?: {
    input_tokens: number;
    output_tokens: number;
  };
  latency_ms: number;
}

/**
 * Creates a discrete multi-choice question for Strands Decider.
 */
export function deciderChoice(
  instructions: string,
  options: Record<string, string>
): DeciderChoiceQuestion {
  return {
    type: 'choice',
    instructions,
    options,
  };
}

/**
 * Creates a calibrated yes/no probability question (0 to 1) for Strands Decider.
 */
export function deciderNoul(
  instructions: string,
  anchors?: { true?: string; false?: string }
): DeciderNoulQuestion {
  return {
    type: 'noul',
    instructions,
    anchors,
  };
}

/**
 * Creates an ordered rubric score question for Strands Decider.
 */
export function deciderScore(
  instructions: string,
  rubric?: string[] | Record<string, string>
): DeciderScoreQuestion {
  return {
    type: 'score',
    instructions,
    rubric,
  };
}

export interface StrandsDeciderClientOptions {
  endpoint?: string;
  apiKey?: string;
  model?: string;
  timeoutMs?: number;
}

export class StrandsDeciderClient {
  public readonly endpoint: string;
  public readonly apiKey?: string;
  public readonly defaultModel: string;
  public readonly timeoutMs: number;

  constructor(options?: StrandsDeciderClientOptions) {
    this.endpoint = (
      options?.endpoint ||
      process.env.STRANDS_DECIDER_URL ||
      process.env.STRANDS_DECIDER_ENDPOINT ||
      'http://localhost:8000'
    ).replace(/\/+$/, '');
    this.apiKey = options?.apiKey || process.env.STRANDS_DECIDER_API_KEY;
    this.defaultModel =
      options?.model ||
      process.env.STRANDS_DECIDER_MODEL ||
      'StrandsAgents/strands-decider-2B-hobson-v19';
    this.timeoutMs = options?.timeoutMs || 5000;
  }

  /**
   * Executes parallel decision queries against the Strands Decider 2B server.
   */
  async systemOne(req: DeciderSystemOneRequest): Promise<DeciderSystemOneResponse> {
    const url = `${this.endpoint}/v1/systemone`;
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), this.timeoutMs);

    try {
      const headers: Record<string, string> = {
        'Content-Type': 'application/json',
      };
      if (this.apiKey) {
        headers['Authorization'] = `Bearer ${this.apiKey}`;
      }

      const res = await fetch(url, {
        method: 'POST',
        headers,
        body: JSON.stringify({
          model: req.model || this.defaultModel,
          state: req.state,
          questions: req.questions,
        }),
        signal: controller.signal,
      });

      if (!res.ok) {
        const bodyText = await res.text().catch(() => '');
        throw new Error(
          `Strands Decider server error (${res.status} ${res.statusText}): ${bodyText}`
        );
      }

      const data = (await res.json()) as DeciderSystemOneResponse;
      return data;
    } finally {
      clearTimeout(timeoutId);
    }
  }
}

let customDeciderClient: StrandsDeciderClient | null = null;

export function setCustomDeciderClient(client: StrandsDeciderClient | null) {
  customDeciderClient = client;
}

export function getStrandsDeciderClient(): StrandsDeciderClient | null {
  if (customDeciderClient) return customDeciderClient;
  const endpoint =
    process.env.STRANDS_DECIDER_URL ||
    process.env.STRANDS_DECIDER_ENDPOINT;
  if (!endpoint && !process.env.STRANDS_DECIDER_ENABLED) {
    return null;
  }
  return new StrandsDeciderClient({
    endpoint: endpoint || 'http://localhost:8000',
  });
}
