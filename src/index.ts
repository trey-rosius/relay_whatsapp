/**
 * Frontend — src/index.ts
 *
 * WhatsApp Bot & Marketplace Dashboard
 * Interface for Webhook verification, Demand Board wishlist, Active Inventory,
 * Bedrock vision extraction, and EventBridge lifecycle events monitoring.
 */
import { api } from 'aws-blocks';
import { html, render } from 'lit-html';

const appEl = document.getElementById('app')!;

type ActiveInventoryItem = {
  itemId: string;
  title: string;
  domain: string;
  providerCategory: string;
  concept: string;
  conditionType: string;
  description: string;
  sellerPhone: string;
  status: 'active' | 'sold' | 'reserved';
  createdAt: number;
};

type DemandItem = {
  demandId: string;
  userPhone: string;
  requestedQuery: string;
  concept: string;
  domain: string;
  status: 'pending' | 'matched' | 'cancelled';
  createdAt: number;
};

type LifecycleEvent = {
  eventId: string;
  eventType: string;
  timestamp: number;
  details: Record<string, any>;
};

let inventory: ActiveInventoryItem[] = [];
let demands: DemandItem[] = [];
let events: LifecycleEvent[] = [];
let statusMessage = '';

async function loadData() {
  try {
    inventory = (await api.listInventory()) as ActiveInventoryItem[];
    demands = (await api.listDemands()) as DemandItem[];
    events = (await api.getLifecycleEvents()) as LifecycleEvent[];
  } catch (err: any) {
    console.error('Failed to load dashboard data:', err);
  }
  redraw();
}

async function handleWebhookHandshake() {
  const mode = 'subscribe';
  const verifyToken = 'my_verify_token_123';
  const challenge = 'challenge_echo_8877';

  try {
    const response = await api.verifyWebhook(mode, verifyToken, challenge);
    if (response.status === 200) {
      statusMessage = `✅ Handshake Verified! Echoed challenge: "${response.challenge}"`;
    } else {
      statusMessage = `❌ Verification failed: ${response.error}`;
    }
  } catch (err: any) {
    statusMessage = `❌ Error verifying webhook: ${err.message}`;
  }
  loadData();
}

async function handleSimulateInboundMedia(messageText: string) {
  statusMessage = '🚀 Processing inbound WhatsApp media message...';
  redraw();

  try {
    const payload = {
      media_id: `media_${Date.now()}`,
      from_phone: '+15550199001',
      message_text: messageText,
    };
    const res = await api.handleWebhook(payload);
    if (res.result.status === 'matched') {
      statusMessage = `🎉 Match Found! Matched demand ID: ${res.result.matchedDemandId}`;
    } else {
      statusMessage = `📦 Item added to ActiveInventory! Item ID: ${res.result.itemId}`;
    }
  } catch (err: any) {
    statusMessage = `❌ Webhook processing error: ${err.message}`;
  }
  loadData();
}

async function handleAddWishlistDemand(concept: string, query: string) {
  statusMessage = `⏳ Adding request to DemandBoard for concept: ${concept}...`;
  redraw();

  try {
    await api.createDemand('+15550199002', query, concept, 'Marketplace');
    statusMessage = `✨ Wishlist demand saved to DemandBoard for "${query}"!`;
  } catch (err: any) {
    statusMessage = `❌ Error adding demand: ${err.message}`;
  }
  loadData();
}

function redraw() {
  render(
    html`
      <div style="display:flex;flex-direction:column;gap:32px">
        <!-- System Status Banner -->
        ${statusMessage
          ? html`
              <div class="status-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ${statusMessage}
              </div>
            `
          : ''}

        <!-- Webhook Handshake & Simulator Card -->
        <div class="card">
          <h3>Webhook Controls & Simulation</h3>
          <p>
            Test API Gateway webhook verification handshake and simulate inbound media processing.
          </p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
            <button @click=${handleWebhookHandshake}>Verify GET Handshake</button>
            <button
              class="secondary"
              @click=${() => handleSimulateInboundMedia('Year 5 Chemistry Textbook - Pristine Condition')}
            >
              Simulate "Year 5 Chemistry"
            </button>
            <button
              class="secondary"
              @click=${() => handleSimulateInboundMedia('AWS Lambda Architecture Reference Book')}
            >
              Simulate "AWS Lambda"
            </button>
          </div>
        </div>

        <div class="grid">
          <!-- Wishlist / Demand Board -->
          <div class="card">
            <h3>Demand Board (Wishlists)</h3>
            <p>
              Proactive Matchmaker checks pending requests before publishing to inventory.
            </p>
            <div style="margin-top:16px;margin-bottom:24px;display:flex;gap:12px">
              <button @click=${() => handleAddWishlistDemand('Year5Chemistry', 'Year 5 Chemistry')}>
                + Request "Year 5 Chemistry"
              </button>
              <button
                class="secondary"
                @click=${() => handleAddWishlistDemand('Year12ComputerScience', 'Year 12 Computer Science')}
              >
                + Request "Year 12 CS"
              </button>
            </div>
            <div class="item-list">
              ${demands.length === 0
                ? html`<div style="color:var(--text-muted);text-align:center;padding:24px 0">No demand requests yet.</div>`
                : demands.map(
                    d => html`
                      <div class="list-item">
                        <div class="item-info">
                          <span class="item-title">${d.requestedQuery}</span>
                          <span class="item-meta">
                            <span>Concept: ${d.concept}</span>
                            ${d.createdAt ? html`<span style="color:var(--text-muted);font-size:0.8rem;">📅 ${new Date(d.createdAt).toLocaleString()}</span>` : ''}
                          </span>
                        </div>
                        <span
                          class="badge ${d.status === 'matched'
                            ? 'badge-matched'
                            : 'badge-pending'}"
                        >
                          ${d.status}
                        </span>
                      </div>
                    `
                  )}
            </div>
          </div>

          <!-- Active Inventory -->
          <div class="card">
            <h3>Active Inventory</h3>
            <p>
              Items extracted via Bedrock vision and chunked into S3 Vectors.
            </p>
              ${(() => {
                if (inventory.length === 0) {
                  return html`<div style="color:var(--text-muted);text-align:center;padding:24px 0">No active inventory items.</div>`;
                }
                const grouped = inventory.reduce((acc, item) => {
                  if (!acc[item.title]) {
                    acc[item.title] = {
                      title: item.title,
                      domain: item.domain,
                      providerCategory: item.providerCategory,
                      count: 0,
                      phones: [] as string[],
                      latestCreatedAt: item.createdAt || 0
                    };
                  }
                  acc[item.title].count += 1;
                  if (item.sellerPhone && !acc[item.title].phones.includes(item.sellerPhone)) {
                    acc[item.title].phones.push(item.sellerPhone);
                  }
                  if ((item.createdAt || 0) > acc[item.title].latestCreatedAt) {
                    acc[item.title].latestCreatedAt = item.createdAt || 0;
                  }
                  return acc;
                }, {} as Record<string, { title: string; domain: string; providerCategory: string; count: number; phones: string[]; latestCreatedAt: number }>);

                return Object.values(grouped)
                  .sort((a, b) => b.latestCreatedAt - a.latestCreatedAt)
                  .map(
                  g => html`
                    <div class="list-item" style="flex-direction:column;align-items:flex-start;">
                      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                        <div class="item-info">
                          <span class="item-title">${g.title}</span>
                          <span class="item-meta">
                            <span>${g.domain} &bull; ${g.providerCategory}</span>
                            ${g.latestCreatedAt ? html`<span style="color:var(--text-muted);font-size:0.8rem;">📅 ${new Date(g.latestCreatedAt).toLocaleString()}</span>` : ''}
                          </span>
                        </div>
                        <span class="badge badge-active">${g.count} Available</span>
                      </div>
                      ${g.phones.length > 0 ? html`
                      <div style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">
                        <strong>Sellers:</strong> ${g.phones.join(', ')}
                      </div>` : ''}
                    </div>
                  `
                );
              })()}
            </div>
          </div>
        </div>

        <!-- EventBridge Lifecycle Events -->
        <div class="card">
          <h3>EventBridge Lifecycle Stream</h3>
          <p>
            Real-time events: ProcessingStarted, ExtractionComplete, MatchFound, InventoryAdded, S3VectorIngested.
          </p>
          <div class="terminal-log">
            ${events.length === 0
              ? html`<div style="color:var(--text-muted);">Waiting for lifecycle events...</div>`
              : events
                  .slice()
                  .reverse()
                  .map(
                    e => html`
                      <div class="log-entry">
                        <span class="log-time">[${new Date(e.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute:'2-digit', second:'2-digit'})}]</span>
                        <span class="log-type">${e.eventType}</span>
                        <span class="log-details">${JSON.stringify(e.details)}</span>
                      </div>
                    `
                  )}
          </div>
        </div>
      </div>
    `,
    appEl
  );
}

loadData();

