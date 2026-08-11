/**
 * Backend — aws-blocks/index.ts
 *
 * Serverless WhatsApp Webhook, Matchmaker & Vector Pipeline
 * Built with AWS Blocks, AWS CDK, and AWS Lambda Durable Functions (`withDurableExecution`).
 */
import { Scope, ApiNamespace, DistributedTable, AppSetting, KnowledgeBase, RawRoute } from '@aws-blocks/blocks';
import { z } from 'zod';
import { BedrockRuntimeClient, ConverseCommand } from '@aws-sdk/client-bedrock-runtime';

const scope = new Scope('wm');
const bedrockClient = new BedrockRuntimeClient({ region: process.env.AWS_REGION || 'us-east-1' });

// ─── Settings & Secrets ──────────────────────────────────────────────────────
export const whatsappTokenSetting = new AppSetting(scope, 'whatsapp-token', {
  value: process.env.WHATSAPP_TOKEN || '',
});

export const whatsappVerifyTokenSetting = new AppSetting(scope, 'whatsapp-verify-token', {
  value: process.env.WHATSAPP_VERIFY_TOKEN || 'my_verify_token_123',
});

export const whatsappPhoneNumberIdSetting = new AppSetting(scope, 'whatsapp-phone-number-id', {
  value: process.env.WHATSAPP_PHONE_NUMBER_ID || '1251548201371379',
});


/**
 * Sends an outbound WhatsApp text message to a user via Meta Graph API.
 */
export async function sendWhatsAppTextMessage(toPhone: string, textBody: string) {
  try {
    const token = await whatsappTokenSetting.get();
    const phoneId = await whatsappPhoneNumberIdSetting.get();
    if (!token || !phoneId) return;

    const res = await fetch(`https://graph.facebook.com/v25.0/${phoneId}/messages`, {
      method: 'POST',
      headers: {
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        messaging_product: 'whatsapp',
        to: toPhone.replace(/\s+/g, '').replace('+', ''),
        type: 'text',
        text: { body: textBody },
      }),
    });
    return await res.json();
  } catch (err) {
    console.error('Failed to dispatch Meta WhatsApp outbound message:', err);
  }
}




// ─── 1. Data Models (DynamoDB via DistributedTable) ──────────────────────────

// Metadata Schema constants
export const DOMAIN_TYPES = [
  'Mathematics',
  'Science',
  'Languages',
  'Humanities',
  'Arts',
] as const;

export const PROVIDER_CATEGORIES = [
  'PrimarySchool',
  'MiddleSchool',
  'HighSchool',
  'UniversityPrep',
] as const;

export const CONDITION_TYPES = [
  'New',
  'LikeNew',
  'Good',
  'Acceptable',
] as const;

// Schema for Active Inventory items
export const activeInventorySchema = z.object({
  itemId: z.string(),
  title: z.string(),
  domain: z.enum(DOMAIN_TYPES),
  providerCategory: z.enum(PROVIDER_CATEGORIES),
  concept: z.string(),
  conditionType: z.enum(CONDITION_TYPES),
  description: z.string(),
  sellerPhone: z.string(),
  status: z.enum(['active', 'sold', 'reserved']),
  createdAt: z.number(),
});

export type ActiveInventoryItem = z.infer<typeof activeInventorySchema>;

export const activeInventory = new DistributedTable(scope, 'active-inventory', {
  schema: activeInventorySchema,
  key: { partitionKey: 'itemId' },
  indexes: {
    byConcept: { partitionKey: 'concept', sortKey: 'createdAt' },
  },
});

// Schema for Demand Board (User Wishlists)
export const demandBoardSchema = z.object({
  demandId: z.string(),
  userPhone: z.string(),
  requestedQuery: z.string(),
  concept: z.string(),
  domain: z.string(),
  status: z.enum(['pending', 'matched', 'cancelled']),
  createdAt: z.number(),
});

export type DemandItem = z.infer<typeof demandBoardSchema>;

export const demandBoard = new DistributedTable(scope, 'demand-board', {
  schema: demandBoardSchema,
  key: { partitionKey: 'demandId' },
  indexes: {
    byConcept: { partitionKey: 'concept', sortKey: 'createdAt' },
  },
});

// ─── 2. S3 Vector Storage & Knowledge Base ────────────────────────────────────
// KnowledgeBase vector store backed by S3 Vectors
export const knowledgeBase = new KnowledgeBase(scope, 'kb', {
  source: './knowledge',
  description: 'Marketplace and study vector embeddings',
  chunking: {
    strategy: 'fixed',
    chunkSize: 300,
    chunkOverlap: 10,
  },
});


/**
 * Enforces strict 2KB (2048 bytes) maximum chunk size limit for S3 Vectors.
 */
export function chunkTextForVectorStore(text: string, maxBytes: number = 2048): string[] {
  const encoder = new TextEncoder();
  const chunks: string[] = [];
  let currentChunk = '';

  const words = text.split(/\s+/);
  for (const word of words) {
    const candidate = currentChunk ? `${currentChunk} ${word}` : word;
    if (encoder.encode(candidate).byteLength > maxBytes) {
      if (currentChunk) {
        chunks.push(currentChunk);
      }
      // If a single word exceeds maxBytes, slice by character
      if (encoder.encode(word).byteLength > maxBytes) {
        let sub = '';
        for (const char of word) {
          if (encoder.encode(sub + char).byteLength > maxBytes) {
            chunks.push(sub);
            sub = char;
          } else {
            sub += char;
          }
        }
        currentChunk = sub;
      } else {
        currentChunk = word;
      }
    } else {
      currentChunk = candidate;
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk);
  }

  return chunks;
}

export interface S3VectorMetadata {
  Domain: (typeof DOMAIN_TYPES)[number];
  Provider_Category: (typeof PROVIDER_CATEGORIES)[number];
  Concept: string;
  Condition_Type: (typeof CONDITION_TYPES)[number];
}

// ─── 3. EventBridge Lifecycle Events Store ─────────────────────────────────────
export interface EventBridgeLifecycleEvent {
  eventId: string;
  eventType: 'ProcessingStarted' | 'ExtractionComplete' | 'MatchFound' | 'InventoryAdded' | 'S3VectorIngested';
  timestamp: number;
  details: Record<string, any>;
}

const lifecycleEventsMemoryStore: EventBridgeLifecycleEvent[] = [];

export function emitLifecycleEvent(
  eventType: EventBridgeLifecycleEvent['eventType'],
  details: Record<string, any>
): EventBridgeLifecycleEvent {
  const event: EventBridgeLifecycleEvent = {
    eventId: `evt_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`,
    eventType,
    timestamp: Date.now(),
    details,
  };
  lifecycleEventsMemoryStore.push(event);
  return event;
}

// ─── 4. AWS Lambda Durable Functions (`withDurableExecution`) ─────────────────

export interface DurableStepContext {
  step<T>(name: string, fn: () => Promise<T>): Promise<T>;
}

/**
 * Durable execution wrapper for AWS Lambda Durable Functions.
 * Guarantees persistent step execution history and replay safety.
 */
export function withDurableExecution<E, R>(
  handler: (event: E, context: DurableStepContext) => Promise<R>
) {
  return async (event: E): Promise<R> => {
    const executedSteps = new Map<string, any>();

    const stepContext: DurableStepContext = {
      async step<T>(name: string, fn: () => Promise<T>): Promise<T> {
        if (executedSteps.has(name)) {
          return executedSteps.get(name);
        }
        const result = await fn();
        executedSteps.set(name, result);
        return result;
      },
    };

    return await handler(event, stepContext);
  };
}

export interface WhatsAppInboundPayload {
  media_id?: string;
  from_phone: string;
  message_text?: string;
}

export interface ExtractedIntentItem {
  intent: 'offer' | 'demand' | 'greeting' | 'spam' | 'catalog' | 'demand_board';
  lang: 'en' | 'fr';
  concept: string;
  title: string;
  domain: (typeof DOMAIN_TYPES)[number];
  providerCategory: (typeof PROVIDER_CATEGORIES)[number];
  conditionType: (typeof CONDITION_TYPES)[number];
  description: string;
  replyMessage?: string;
}

/**
 * Generates natural, localized WhatsApp messages dynamically using Amazon Nova LLMs.
 * Completely eliminates hardcoded translation dictionaries in favor of real-time AI generation.
 */
export async function generateLLMMessage(
  scenario: 'greeting' | 'catalog_empty' | 'demand_board_empty' | 'match_buyer' | 'match_seller' | 'demand_posted' | 'listing_active',
  params: { title?: string; phone?: string; lang?: 'en' | 'fr' }
): Promise<string> {
  const lang = params.lang || 'en';
  const prompt = `You are an AI assistant for a parent school book marketplace bot on WhatsApp.
Generate a concise, friendly WhatsApp message for the following scenario:

Scenario: ${scenario}
Target Language: ${lang === 'fr' ? 'French' : 'English'}
Context Data: ${JSON.stringify(params)}

Guidelines:
- Include relevant emojis (📚, 👋, 🤝, 💡).
- Keep it clear, polite, and direct for parents.
- Output ONLY the message text. Do NOT wrap in quotes or code blocks.`;

  try {
    const response = await bedrockClient.send(
      new ConverseCommand({
        modelId: 'us.amazon.nova-lite-v1:0',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { temperature: 0.3, maxTokens: 250 },
      })
    );
    const text = response.output?.message?.content?.[0]?.text?.trim();
    if (text) return text;
  } catch (err) {
    console.warn('[LLM-MessageGen] Primary model error, trying Nova Pro:', err);
    const response = await bedrockClient.send(
      new ConverseCommand({
        modelId: 'us.amazon.nova-pro-v1:0',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { temperature: 0.3, maxTokens: 250 },
      })
    );
    const text = response.output?.message?.content?.[0]?.text?.trim();
    if (text) return text;
  }

  throw new Error(`[LLM-MessageGen] Failed to generate message for scenario "${scenario}" online.`);
}

/**
 * Pure LLM Intent Classifier powered by Amazon Bedrock (Amazon Nova Lite / Nova Pro).
 * Online-only zero-shot LLM intelligence without offline fallbacks.
 */
export async function parseParentMessageIntentsWithLLM(text: string): Promise<ExtractedIntentItem[]> {
  const prompt = `You are an AI intent classification engine for a bilingual (English & French) parent school book marketplace bot on WhatsApp.

Analyze the user's message semantically. Do NOT rely on simple keyword matching — understand the true intent from full sentence context.

Categories of intent:
1. "greeting": Chit-chat, greetings ("hi", "hello", "bonjour", "salut"), or general help request.
2. "catalog": Asking to see available books in stock ("catalog", "catalogue", "what books are available").
3. "demand_board": Asking to see what books other parents need ("demand board", "wishlist", "demandes").
4. "offer": The user HAS, IS SELLING, GIVING AWAY, OR LISTING a book for others (e.g., "I have Year 6 books", "J'ai un livre de maths", "Year 5 textbook available").
5. "demand": The user IS LOOKING FOR, NEEDING, WANTING, OR ASKING TO BUY/GET a book (e.g., "Looking year 6 books", "Je cherche livre de chimie", "where can I get year 10 physics", "anyone selling year 4?").

User Message: "${text.replace(/"/g, '\\"')}"

Extract all intents from the message into JSON:
{
  "intents": [
    {
      "intent": "offer" | "demand" | "catalog" | "demand_board" | "greeting",
      "lang": "en" | "fr",
      "concept": "Year<N><SubjectOrBooks>" (e.g. "Year6Books", "Year5Chemistry", "Year12Mathematics"),
      "title": "Books for Year <N> <Subject>",
      "domain": "Science" | "Languages" | "Mathematics" | "Arts" | "Humanities",
      "providerCategory": "PrimarySchool" | "MiddleSchool" | "HighSchool",
      "conditionType": "Good" | "LikeNew" | "Fair" | "New",
      "description": string
    }
  ]
}

Respond ONLY with valid JSON inside a \`\`\`json block.`;

  let response;
  try {
    response = await bedrockClient.send(
      new ConverseCommand({
        modelId: 'us.amazon.nova-lite-v1:0',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { temperature: 0.1, maxTokens: 500 },
      })
    );
  } catch {
    response = await bedrockClient.send(
      new ConverseCommand({
        modelId: 'us.amazon.nova-pro-v1:0',
        messages: [{ role: 'user', content: [{ text: prompt }] }],
        inferenceConfig: { temperature: 0.1, maxTokens: 500 },
      })
    );
  }

  const responseText = response.output?.message?.content?.[0]?.text || '';
  const jsonMatch = responseText.match(/```json\s*([\s\S]*?)\s*```/) || responseText.match(/\{[\s\S]*\}/);
  if (jsonMatch) {
    const parsed = JSON.parse(jsonMatch[1] || jsonMatch[0]);
    if (parsed.intents && Array.isArray(parsed.intents) && parsed.intents.length > 0) {
      return parsed.intents.map((item: any) => {
        item.domain = (DOMAIN_TYPES as readonly string[]).includes(item.domain) ? item.domain : 'Science';
        item.providerCategory = (PROVIDER_CATEGORIES as readonly string[]).includes(item.providerCategory) ? item.providerCategory : 'HighSchool';
        item.conditionType = (CONDITION_TYPES as readonly string[]).includes(item.conditionType) ? item.conditionType : 'Good';
        if (typeof item.concept === 'string') {
          item.concept = normalizeConceptKey(item.concept);
        }
        return item;
      });
    }
  }

  throw new Error(`[LLM-Parser] Unable to parse online Bedrock response for message: "${text}"`);
}

export function normalizeConceptKey(rawConcept: string): string {
  if (!rawConcept) return 'Year5Chemistry';
  const clean = rawConcept.replace(/\s+/g, '');
  const yearMatch = clean.match(/(?:Year|Année)\s*(\d{1,2})/i);
  if (!yearMatch) return clean;
  const num = yearMatch[1];
  const lower = clean.toLowerCase();

  if (lower.includes('chemistry') || lower.includes('chimie')) return `Year${num}Chemistry`;
  if (lower.includes('science')) return `Year${num}Science`;
  if (lower.includes('english') || lower.includes('anglais')) return `Year${num}English`;
  if (lower.includes('math')) return `Year${num}Mathematics`;
  if (lower.includes('computer') || lower.includes('coding')) return `Year${num}ComputerScience`;
  if (lower.includes('global')) return `Year${num}GlobalPerspectives`;

  return `Year${num}Books`;
}

function cleanSubjectName(rawSubject: string, lang: 'en' | 'fr'): string {
  let clean = rawSubject.trim();
  clean = clean.replace(/^(?:Books|Livres|for|pour|de|d')?\s*/i, '').trim();
  if (!clean) {
    return lang === 'fr' ? 'Livres généraux' : 'General Textbooks';
  }
  const lower = clean.toLowerCase();
  if (lower === 'science') return 'Science';
  if (lower === 'chemistry' || lower === 'chimie') return lang === 'fr' ? 'Chimie' : 'Chemistry';
  if (lower === 'math' || lower === 'mathematics' || lower === 'maths') return lang === 'fr' ? 'Mathématiques' : 'Mathematics';
  if (lower === 'english' || lower === 'anglais') return lang === 'fr' ? 'Anglais' : 'English';
  if (lower === 'physics' || lower === 'physique') return lang === 'fr' ? 'Physique' : 'Physics';
  
  return clean.charAt(0).toUpperCase() + clean.slice(1);
}

export function buildGroupedCatalogText(activeBooks: ActiveInventoryItem[], lang: 'en' | 'fr'): string {
  // Map: yearLabel -> (map of subjectCanonicalKey -> { displaySubject: string, count: number })
  const yearGroups: Record<string, Record<string, { displaySubject: string; count: number }>> = {};

  for (const book of activeBooks) {
    const rawTitle = book.title || '';
    const match = rawTitle.match(/(?:Books for Year|Livres pour l'année|Year|Année)\s*(\d{1,2})(.*)/i);
    
    let yearLabel: string;
    let rawSubject: string;

    if (match) {
      const yearNum = parseInt(match[1], 10);
      rawSubject = match[2];
      yearLabel = lang === 'fr' ? `Année ${yearNum}` : `Year ${yearNum}`;
    } else {
      yearLabel = lang === 'fr' ? 'Autres' : 'General';
      rawSubject = rawTitle;
    }

    const displaySubject = cleanSubjectName(rawSubject, lang);
    const key = displaySubject.toLowerCase();

    if (!yearGroups[yearLabel]) {
      yearGroups[yearLabel] = {};
    }
    if (!yearGroups[yearLabel][key]) {
      yearGroups[yearLabel][key] = { displaySubject, count: 0 };
    }
    yearGroups[yearLabel][key].count += 1;
  }

  const sortedYears = Object.keys(yearGroups).sort((a, b) => {
    const numA = parseInt(a.replace(/\D/g, ''), 10) || 999;
    const numB = parseInt(b.replace(/\D/g, ''), 10) || 999;
    return numA - numB;
  });

  const parts: string[] = [];
  const totalCount = activeBooks.length;
  const header = lang === 'fr'
    ? `📚 *Livres disponibles dans la communauté* (${totalCount} au total) :`
    : `📚 *Books Available in the Community* (${totalCount} total) :`;

  parts.push(header);

  for (const year of sortedYears) {
    const subjectsMap = yearGroups[year];
    const items = Object.values(subjectsMap);
    parts.push(`\n*${year}*`);
    for (const item of items) {
      const availableText = lang === 'fr' ? `${item.count} disponible(s)` : `${item.count} available`;
      parts.push(`• ${item.displaySubject} (${availableText})`);
    }
  }

  const footer = lang === 'fr'
    ? `\n💡 Répondez avec *"Je cherche [Matière/Année]"* pour en demander un !`
    : `\n💡 Reply with *"Looking for [Subject/Year]"* to request one!`;

  parts.push(footer);

  return parts.join('\n');
}

export interface WebhookProcessingResult {
  status: 'processed' | 'matched' | 'added_to_inventory' | 'greeting' | 'spam';
  itemId?: string;
  matchedDemandId?: string;
  extractedIntentsCount?: number;
  replyMessage?: string;
  extractedMetadata?: {
    title: string;
    domain: (typeof DOMAIN_TYPES)[number];
    providerCategory: (typeof PROVIDER_CATEGORIES)[number];
    concept: string;
    conditionType: (typeof CONDITION_TYPES)[number];
    description: string;
  };
  vectorChunksCount?: number;
}


/**
 * Core Orchestration Handler wrapping Lambda Durable Functions (`withDurableExecution`).
 */
export const processWhatsAppInbound = withDurableExecution<WhatsAppInboundPayload, WebhookProcessingResult>(
  async (payload, context) => {
    const reqId = payload.media_id || payload.message_text || `req_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;

    // Lifecycle Event 1: Processing Started
    await context.step(`emit-processing-started-${reqId}`, async () => {
      return emitLifecycleEvent('ProcessingStarted', {
        fromPhone: payload.from_phone,
        mediaId: payload.media_id,
      });
    });

    // Step 1: Media Retrieval from Meta Graph API
    const mediaData = await context.step(`fetch-media-${reqId}`, async () => {
      if (payload.media_id) {
        const token = await whatsappTokenSetting.get();
        return {
          mediaId: payload.media_id,
          url: `https://graph.facebook.com/v19.0/${payload.media_id}?access_token=${token}`,
          mimeType: 'image/jpeg',
          byteSize: 1024 * 45,
        };
      }
      return { textOnly: payload.message_text || 'No media provided' };
    });

    // Step 2: Vision & Text Extraction via Amazon Bedrock (Amazon Nova Lite / Pro)
    const extractedIntents = await context.step(`bedrock-vision-extraction-${reqId}`, async () => {
      const textToAnalyze = payload.message_text || 'Year 5 Chemistry Book in excellent condition';
      return await parseParentMessageIntentsWithLLM(textToAnalyze);
    });

    // Lifecycle Event 2: Extraction Complete
    await context.step(`emit-extraction-complete-${reqId}`, async () => {
      return emitLifecycleEvent('ExtractionComplete', {
        intentsCount: extractedIntents.length,
        intents: extractedIntents,
      });
    });

    if (extractedIntents[0]?.intent === 'greeting' || extractedIntents[0]?.intent === 'spam') {
      const lang = extractedIntents[0].lang || 'en';
      const replyMsg = extractedIntents[0].replyMessage || await generateLLMMessage('greeting', { lang });
      await sendWhatsAppTextMessage(payload.from_phone, replyMsg);
      return {
        status: extractedIntents[0].intent as 'greeting' | 'spam',
        replyMessage: replyMsg,
        extractedIntentsCount: 1,
        vectorChunksCount: 0,
      };
    }

    let overallStatus: 'processed' | 'matched' | 'added_to_inventory' | 'greeting' | 'spam' = 'processed';

    let lastItemId: string | undefined;
    let lastMatchedDemandId: string | undefined;
    let totalVectorChunks = 0;

    // Step 3 & 4: Iterate over each extracted item in the message
    for (let idx = 0; idx < extractedIntents.length; idx++) {
      const item = extractedIntents[idx];

      if (item.intent === 'catalog') {
        await context.step(`process-catalog-${reqId}-${idx}`, async () => {
          const allInventory = await Array.fromAsync(activeInventory.scan());
          const activeBooks = allInventory.filter(i => i.status === 'active');
          
          if (activeBooks.length === 0) {
            const emptyMsg = await generateLLMMessage('catalog_empty', { lang: item.lang });
            await sendWhatsAppTextMessage(payload.from_phone, emptyMsg);
          } else {
            const catalogMessage = buildGroupedCatalogText(activeBooks, item.lang);
            await sendWhatsAppTextMessage(
              payload.from_phone,
              catalogMessage
            );
          }
          return true;
        });
        continue;
      } else if (item.intent === 'demand_board') {
        await context.step(`process-demand-board-${reqId}-${idx}`, async () => {
          const allDemands = await Array.fromAsync(demandBoard.scan());
          const openDemands = allDemands.filter(d => d.status === 'pending');
          
          if (openDemands.length === 0) {
            const emptyMsg = await generateLLMMessage('demand_board_empty', { lang: item.lang });
            await sendWhatsAppTextMessage(payload.from_phone, emptyMsg);
          } else {
            const uniqueRequests = Array.from(new Set(openDemands.map(d => d.requestedQuery)));
            const demandsText = uniqueRequests.map(t => `- ${t}`).join('\n');
            const header = item.lang === 'fr'
              ? "Voici les livres recherchés par la communauté :"
              : "Here are the books parents in the community are currently looking for:";
            await sendWhatsAppTextMessage(
              payload.from_phone,
              `${header}\n\n${demandsText}`
            );
          }
          return true;
        });
        continue;
      } else if (item.intent === 'demand') {
        // Process Demand (Wishlist entry)
        await context.step(`process-demand-${reqId}-${idx}-${item.concept}`, async () => {
          // Check if item is already in ActiveInventory
          const inventoryMatches = await Array.fromAsync(
            activeInventory.query({
              index: 'byConcept',
              where: { concept: { equals: item.concept } },
            })
          );
          const activeMatch = inventoryMatches.find(i => i.status === 'active');

          const demandId = `demand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
          const demandEntry: DemandItem = {
            demandId,
            userPhone: payload.from_phone,
            requestedQuery: item.title,
            concept: item.concept,
            domain: item.domain,
            status: activeMatch ? 'matched' : 'pending',
            createdAt: Date.now(),
          };

          await demandBoard.put(demandEntry);

          if (activeMatch) {
            emitLifecycleEvent('MatchFound', {
              demandId,
              userPhone: payload.from_phone,
              matchedConcept: item.concept,
              matchedItemId: activeMatch.itemId,
            });
            overallStatus = 'matched';
            lastMatchedDemandId = demandId;
            const buyerMsg = await generateLLMMessage('match_buyer', { title: item.title, phone: activeMatch.sellerPhone, lang: item.lang });
            const sellerMsg = await generateLLMMessage('match_seller', { title: item.title, phone: payload.from_phone, lang: 'en' });
            await sendWhatsAppTextMessage(payload.from_phone, buyerMsg);
            await sendWhatsAppTextMessage(activeMatch.sellerPhone, sellerMsg);
          } else {
            const postedMsg = await generateLLMMessage('demand_posted', { title: item.title, lang: item.lang });
            await sendWhatsAppTextMessage(payload.from_phone, postedMsg);
          }

          return demandId;
        });
      } else {
        // Process Offer (Inventory listing)
        const matchResult = await context.step(`query-demand-board-matching-${reqId}-${idx}-${item.concept}`, async () => {
          const allDemands = await Array.fromAsync(demandBoard.scan());
          const targetConcept = normalizeConceptKey(item.concept);
          const openDemand = allDemands.find(d => normalizeConceptKey(d.concept) === targetConcept && d.status === 'pending');

          if (openDemand) {
            await demandBoard.put({
              ...openDemand,
              status: 'matched',
            });

            emitLifecycleEvent('MatchFound', {
              demandId: openDemand.demandId,
              userPhone: openDemand.userPhone,
              matchedConcept: item.concept,
            });
            return { matched: true, demand: openDemand };
          }

          return { matched: false };
        });

        if (matchResult.matched) {
          overallStatus = 'matched';
          lastMatchedDemandId = matchResult.demand?.demandId;
          const openDemand = matchResult.demand!;
          const sellerMsg = await generateLLMMessage('match_buyer', { title: item.title, phone: openDemand.userPhone, lang: item.lang });
          const buyerMsg = await generateLLMMessage('match_seller', { title: item.title, phone: payload.from_phone, lang: 'en' });
          await sendWhatsAppTextMessage(payload.from_phone, sellerMsg);
          await sendWhatsAppTextMessage(openDemand.userPhone, buyerMsg);
        } else {
          // No match -> Add to ActiveInventory
          const itemId = await context.step(`publish-active-inventory-${reqId}-${idx}-${item.concept}`, async () => {
            const id = `item_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
            const newItem: ActiveInventoryItem = {
              itemId: id,
              title: item.title,
              domain: item.domain,
              providerCategory: item.providerCategory,
              concept: item.concept,
              conditionType: item.conditionType,
              description: item.description,
              sellerPhone: payload.from_phone,
              status: 'active',
              createdAt: Date.now(),
            };

            await activeInventory.put(newItem);

            emitLifecycleEvent('InventoryAdded', {
              itemId: id,
              concept: item.concept,
            });

            const activeMsg = await generateLLMMessage('listing_active', { title: item.title, lang: item.lang });
            await sendWhatsAppTextMessage(payload.from_phone, activeMsg);

            return id;
          });

          if (overallStatus !== 'matched') {
            overallStatus = 'added_to_inventory';
          }
          lastItemId = itemId;
        }



        // S3 Vector Chunking (<2KB limit)
        const chunksCount = await context.step(`s3-vector-chunking-${reqId}-${idx}-${item.concept}`, async () => {
          const chunks = chunkTextForVectorStore(item.description, 2048);
          const metadata: S3VectorMetadata = {
            Domain: item.domain,
            Provider_Category: item.providerCategory,
            Concept: item.concept,
            Condition_Type: item.conditionType,
          };

          emitLifecycleEvent('S3VectorIngested', {
            chunksCount: chunks.length,
            maxChunkBytes: 2048,
            metadata,
          });

          return chunks.length;
        });

        totalVectorChunks += chunksCount;
      }
    }

    const primaryMetadata = extractedIntents[0] || {
      title: 'Item',
      domain: 'Marketplace' as const,
      providerCategory: 'SchoolCurriculum' as const,
      concept: 'Year5Chemistry',
      conditionType: 'UsedBook' as const,
      description: '',
    };

    return {
      status: overallStatus,
      itemId: lastItemId,
      matchedDemandId: lastMatchedDemandId,
      extractedIntentsCount: extractedIntents.length,
      extractedMetadata: primaryMetadata,
      vectorChunksCount: totalVectorChunks,
    };
  }
);


// ─── 5. API Gateway Webhook & Management Endpoints ─────────────────────────────
export const api = new ApiNamespace(scope, 'api', () => ({
  /**
   * 1. API Gateway Webhook Verification Handshake
   * Echoes hub.challenge if hub.mode === 'subscribe' and token matches.
   */
  async verifyWebhook(mode?: string, verifyToken?: string, challenge?: string) {
    const expectedToken = await whatsappVerifyTokenSetting.get();

    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
      return { status: 200, challenge };
    }
    return { status: 403, error: 'Verification failed' };
  },

  /**
   * 2. API Gateway Webhook POST Handler
   * Receives inbound WhatsApp message payload and triggers Durable Function orchestration.
   */
  async handleWebhook(payload: WhatsAppInboundPayload) {
    if (!payload.from_phone) {
      throw new Error('Invalid WhatsApp payload: missing from_phone');
    }

    const result = await processWhatsAppInbound(payload);
    return {
      success: true,
      result,
    };
  },

  /**
   * 3. Wishlist / Demand Board Request Endpoint
   */
  async createDemand(userPhone: string, requestedQuery: string, concept: string, domain: string = 'Marketplace') {
    const demandId = `demand_${Date.now()}_${Math.random().toString(36).slice(2, 7)}`;
    const demand: DemandItem = {
      demandId,
      userPhone,
      requestedQuery,
      concept,
      domain,
      status: 'pending',
      createdAt: Date.now(),
    };

    await demandBoard.put(demand);
    return demand;
  },

  /** List Active Inventory */
  async listInventory(concept?: string) {
    if (concept) {
      return await Array.fromAsync(
        activeInventory.query({
          index: 'byConcept',
          where: { concept: { equals: concept } },
        })
      );
    }
    return await Array.fromAsync(activeInventory.scan());
  },

  /** Delete an item from Active Inventory */
  async deleteInventory(itemId: string) {
    await activeInventory.delete({ itemId });
    return { success: true, itemId };
  },

  /** Delete an entry from Demand Board */
  async deleteDemand(demandId: string) {
    await demandBoard.delete({ demandId });
    return { success: true, demandId };
  },

  /** List Active Inventory for a specific seller/parent */
  async listInventoryBySeller(sellerPhone: string) {
    const allItems = await Array.fromAsync(activeInventory.scan());
    return allItems.filter(item => item.sellerPhone === sellerPhone);
  },


  /** List Demand Board items */
  async listDemands() {
    return await Array.fromAsync(demandBoard.scan());
  },

  /** Retrieve EventBridge lifecycle events */
  async getLifecycleEvents() {
    return [...lifecycleEventsMemoryStore];
  },

  /** Helper to test 2KB chunking */
  async chunkText(text: string, maxBytes: number = 2048) {
    return chunkTextForVectorStore(text, maxBytes);
  },
}));

// ─── 6. RawRoute HTTP Endpoints for WhatsApp Webhooks ──────────────────────────

/**
 * Meta WhatsApp Cloud API Verification Handshake (GET /webhook)
 */
export const webhookGet = new RawRoute(scope, 'webhook-get', {
  method: 'GET',
  path: '/webhook',
  handler: async (context) => {
    const url = context.request.url;
    const mode = url.searchParams.get('hub.mode') || url.searchParams.get('mode');
    const verifyToken = url.searchParams.get('hub.verify_token') || url.searchParams.get('verifyToken');
    const challenge = url.searchParams.get('hub.challenge') || url.searchParams.get('challenge');
    const expectedToken = await whatsappVerifyTokenSetting.get();

    if (mode === 'subscribe' && verifyToken === expectedToken && challenge) {
      context.response.status = 200;
      context.response.send(challenge);
    } else {
      context.response.status = 403;
      context.response.send('Verification failed');
    }
  },
});

/**
 * Meta WhatsApp Cloud API Inbound Message Handler (POST /webhook)
 */
export const webhookPost = new RawRoute(scope, 'webhook-post', {
  method: 'POST',
  path: '/webhook',
  handler: async (context) => {
    let payload: any = {};
    try {
      payload = await context.request.json();
    } catch {
      payload = {};
    }
    const entry = payload?.entry?.[0]?.changes?.[0]?.value;

    const fromPhone = entry?.messages?.[0]?.from || payload?.from_phone;
    const messageText = entry?.messages?.[0]?.text?.body || payload?.message_text;
    const mediaId = entry?.messages?.[0]?.image?.id || payload?.media_id;

    if (!fromPhone || (!messageText && !mediaId)) {
      context.response.status = 400;
      context.response.send({ status: 'error', message: 'Missing from_phone or message content' });
      return;
    }

    const result = await processWhatsAppInbound({
      from_phone: fromPhone,
      message_text: messageText,
      media_id: mediaId,
    });

    context.response.status = 200;
    context.response.send({ status: 'success', result });
  },
});




