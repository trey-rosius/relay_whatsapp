/**
 * Frontend — src/index.ts
 *
 * WhatsApp Bot & Marketplace Dashboard
 * Features:
 * - Distinct Tabs for Available Books, Pending Demands, Matched Demands, Webhook Controls, and Telemetry
 * - Feature 3A: Multi-Book "Parent Bundle" / Family Storefront (View full family collections & Grade Bundles)
 * - Feature 3B: Proactive Supply Deficit & Inbound Broadcast Campaigns
 * - Feature 3D: Verified Condition & Quality Badges (New, Like New, Good, Acceptable)
 * - Multi-attribute Filtering (Search, Class, Subject, Condition, Seller)
 * - Date-Range Filtering (Presets & Custom Date Picker)
 * - Strict Descending Date Ordering with Relative & Absolute Timestamps
 */
import { api } from 'aws-blocks';
import { html, render } from 'lit-html';

const appEl = document.getElementById('app')!;

export type ActiveInventoryItem = {
  itemId: string;
  title: string;
  domain: 'Mathematics' | 'Science' | 'Languages' | 'Humanities' | 'Arts';
  providerCategory: 'PrimarySchool' | 'MiddleSchool' | 'HighSchool' | 'UniversityPrep';
  concept: string;
  conditionType: 'New' | 'LikeNew' | 'Good' | 'Acceptable';
  description: string;
  sellerPhone: string;
  status: 'active' | 'sold' | 'reserved';
  preferredLang?: 'en' | 'fr';
  reservedUntil?: number;
  reservedForPhone?: string;
  matchedDemandId?: string;
  soldAt?: number;
  soldToPhone?: string;
  handoverCode?: string;
  createdAt: number;
};

export type DemandItem = {
  demandId: string;
  userPhone: string;
  requestedQuery: string;
  concept: string;
  domain: string;
  status: 'pending' | 'matched' | 'fulfilled' | 'cancelled';
  preferredLang?: 'en' | 'fr';
  matchedItemId?: string;
  matchedAt?: number;
  handoverCode?: string;
  createdAt: number;
};

export type LifecycleEvent = {
  eventId: string;
  eventType: string;
  timestamp: number;
  details: Record<string, any>;
};

export type SecurityObservabilityStatus = {
  wafEnabled: boolean;
  hmacValidationEnabled: boolean;
  bedrockGuardrailActive: boolean;
  kmsEncryptionKeyAlias: string;
  s3LifecyclePolicyDays: number;
  distributedTracingActive: boolean;
  emfMetricNamespace: string;
};

export type SellerStorefrontData = {
  sellerPhone: string;
  totalBooks: number;
  bundles: Array<{ grade: string; count: number; items: ActiveInventoryItem[] }>;
  items: ActiveInventoryItem[];
};

export type SupplyGapsData = {
  totalInventory: number;
  pendingDemandsCount: number;
  deficitSubjects: Array<{ domain: string; count: number }>;
  deficitGrades: Array<{ grade: string; count: number }>;
  broadcastMessageEn: string;
  broadcastMessageFr: string;
};

type ActiveTab = 'available' | 'pendings' | 'matches' | 'webhook' | 'observability' | 'learn';
type ViewGrouping = 'all' | 'by-subject' | 'by-class';
type DatePreset = 'all' | 'today' | '7days' | '30days' | 'custom';

// ─── Application State ────────────────────────────────────────────────────────

let activeTab: ActiveTab = 'available';
let viewGrouping: ViewGrouping = 'all';

let inventory: ActiveInventoryItem[] = [];
let demands: DemandItem[] = [];
let events: LifecycleEvent[] = [];
let _securityStatus: SecurityObservabilityStatus | null = null;
let supplyGaps: SupplyGapsData | null = null;

// Relay Learn (AI Socratic Tutor & S3 Vectors) State
let learningStats: any = null;
let simPhone = '+15550009988';
let simTrack: 'math_shapes' | 'cs_unplugged' | 'math_foundations' | 'digital_literacy' | 'stem_openstax' = 'math_shapes';
let simActiveCard: any = null;
let simFeedback: any = null;
let simLoading = false;

let dynamoCurriculum: any[] = [];
let vectorSearchQuery = '';
let vectorSearchResults: Array<{ content: string; score?: number; location?: string }> = [];
let vectorSearching = false;

async function loadLearningStats() {
  try {
    const stats = await (api as any).getLearningDashboardStats();
    learningStats = stats;
    redraw();
  } catch (err) {
    console.warn('Failed to load learning stats:', err);
  }
}

async function loadDynamoCurriculum() {
  try {
    const cur = await (api as any).getCurriculumFromDynamoDB();
    dynamoCurriculum = cur || [];
    redraw();
  } catch (err) {
    console.warn('Failed to load dynamo curriculum:', err);
  }
}

async function executeVectorSearch() {
  if (!vectorSearchQuery.trim()) return;
  vectorSearching = true;
  redraw();
  try {
    const res = await (api as any).searchCurriculumS3Vectors(vectorSearchQuery);
    vectorSearchResults = res || [];
  } catch (err) {
    console.error('Vector search error:', err);
  } finally {
    vectorSearching = false;
    redraw();
  }
}

async function startSimSession() {
  simLoading = true;
  simFeedback = null;
  redraw();
  try {
    const res = await (api as any).startStudySession(simPhone, simTrack, 'en');
    simActiveCard = res;
  } catch (err) {
    console.error('Failed to start sim session:', err);
  } finally {
    simLoading = false;
    redraw();
  }
}

async function submitSimChoice(choiceIndex: number) {
  simLoading = true;
  redraw();
  try {
    const feedback = await (api as any).submitStudyAnswer(simPhone, choiceIndex, 'en');
    simFeedback = feedback;
    if (feedback.isCorrect) {
      loadLearningStats();
    }
  } catch (err) {
    console.error('Failed to submit sim choice:', err);
  } finally {
    simLoading = false;
    redraw();
  }
}

async function handleSimNext() {
  simFeedback = null;
  simLoading = true;
  redraw();
  try {
    const res = await (api as any).processWhatsAppWebhook({
      from_phone: simPhone,
      interactive: { id: 'learn_next', title: 'Next Task 🚀' },
    });
    const replyText = res?.result?.replyMessage || '';
    simActiveCard = {
      text: replyText,
      imageUrl:
        replyText.includes('biscuit') || replyText.includes('snack')
          ? 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/biscuit_circle.jpg'
          : replyText.includes('notebook') || replyText.includes('Rectangles')
            ? 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/notebook_rectangle.jpg'
            : undefined,
    };
  } catch (err) {
    console.error('handleSimNext error:', err);
    startSimSession();
  } finally {
    simLoading = false;
    redraw();
  }
}

let autogenLoading = false;
let autogenStatusText = '';

async function triggerAutogen(subject: string = 'all') {
  autogenLoading = true;
  autogenStatusText = `⚡ Autogenerating questions & visual diagrams for ${subject}...`;
  redraw();
  try {
    const job = await (api as any).autogenerateCurriculum(subject, false);
    autogenStatusText = `✅ Created ${job.lessonsGenerated} lessons, ${job.tasksGenerated} questions, and ${job.imagesGenerated} diagrams!`;
    await loadLearningStats();
  } catch (err: any) {
    autogenStatusText = `❌ Autogen failed: ${err.message}`;
  } finally {
    autogenLoading = false;
    redraw();
    setTimeout(() => {
      autogenStatusText = '';
      redraw();
    }, 8000);
  }
}

let isLoading = false;
let statusMessage = '';
let statusTimeout: any = null;

// Filter & Sort State
let searchQuery = '';
let filterDomain: string = 'all';
let filterClass: string = 'all';
let filterCondition: string = 'all';
let filterSeller: string = 'all';
let filterStatus: 'all' | 'active' | 'reserved' | 'sold' = 'all';
let matchSubTab: 'holds' | 'completed' = 'holds';
let datePreset: DatePreset = 'all';
let customDateFrom: string = '';
let customDateTo: string = '';
let sortDescending: boolean = true; // Default descending order

// Modal & Storefront State (Feature 3A)
let showStorefrontModal = false;
let selectedStorefront: SellerStorefrontData | null = null;
let isLoadingStorefront = false;

// Modal & Quick-Add State
let showAddDemandModal = false;
let newDemandQuery = '';
let newDemandConcept = '';
let newDemandDomain = 'Mathematics';
let newDemandPhone = '+15550199002';

// ─── Helper Utilities ─────────────────────────────────────────────────────────

function setBannerMessage(msg: string) {
  statusMessage = msg;
  if (statusTimeout) clearTimeout(statusTimeout);
  statusTimeout = setTimeout(() => {
    statusMessage = '';
    redraw();
  }, 10000);
}

function formatRelativeTime(timestamp: number): string {
  if (!timestamp) return 'Unknown date';
  const now = Date.now();
  const diffSec = Math.floor((now - timestamp) / 1000);
  if (diffSec < 60) return 'Just now';
  const diffMin = Math.floor(diffSec / 60);
  if (diffMin < 60) return `${diffMin}m ago`;
  const diffHour = Math.floor(diffMin / 60);
  if (diffHour < 24) return `${diffHour}h ago`;
  const diffDays = Math.floor(diffHour / 24);
  if (diffDays === 1) return 'Yesterday';
  if (diffDays < 30) return `${diffDays}d ago`;
  return new Date(timestamp).toLocaleDateString();
}

function formatExactDate(timestamp: number): string {
  if (!timestamp) return '';
  return new Date(timestamp).toLocaleString(undefined, {
    year: 'numeric',
    month: 'short',
    day: 'numeric',
    hour: '2-digit',
    minute: '2-digit',
  });
}

function getDomainBadgeClass(domain: string): string {
  switch (domain) {
    case 'Mathematics':
      return 'badge-math';
    case 'Science':
      return 'badge-science';
    case 'Languages':
      return 'badge-languages';
    case 'Humanities':
      return 'badge-humanities';
    case 'Arts':
      return 'badge-arts';
    default:
      return 'badge-active';
  }
}

function getClassBadgeClass(category: string): string {
  switch (category) {
    case 'PrimarySchool':
      return 'badge-primary';
    case 'MiddleSchool':
      return 'badge-middle';
    case 'HighSchool':
      return 'badge-high';
    case 'UniversityPrep':
      return 'badge-uniprep';
    default:
      return 'badge-active';
  }
}

function getHumanClassLabel(category: string): string {
  switch (category) {
    case 'PrimarySchool':
      return 'Primary (Years 1-6)';
    case 'MiddleSchool':
      return 'Middle School (Years 7-9)';
    case 'HighSchool':
      return 'High School (Years 10-13)';
    case 'UniversityPrep':
      return 'Uni Prep';
    default:
      return category || 'General';
  }
}

// ─── Feature 3D: Verified Condition Badges ─────────────────────────────────────

function renderConditionBadge(condition: string) {
  switch (condition) {
    case 'New':
      return html`
        <span
          class="badge"
          style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
        >
          Verified New
        </span>
      `;
    case 'LikeNew':
      return html`
        <span
          class="badge"
          style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);"
        >
          Like New
        </span>
      `;
    case 'Good':
      return html`
        <span
          class="badge"
          style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);"
        >
          Good Condition
        </span>
      `;
    case 'Acceptable':
      return html`
        <span
          class="badge"
          style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);"
        >
          Acceptable
        </span>
      `;
    default:
      return html`<span class="badge badge-active">${condition || 'Good'}</span>`;
  }
}

// ─── Filter Evaluation ────────────────────────────────────────────────────────

function passesDateFilter(timestamp: number): boolean {
  if (!timestamp) return true;
  const now = Date.now();

  if (datePreset === 'today') {
    const startOfToday = new Date();
    startOfToday.setHours(0, 0, 0, 0);
    return timestamp >= startOfToday.getTime();
  }

  if (datePreset === '7days') {
    const sevenDaysAgo = now - 7 * 24 * 60 * 60 * 1000;
    return timestamp >= sevenDaysAgo;
  }

  if (datePreset === '30days') {
    const thirtyDaysAgo = now - 30 * 24 * 60 * 60 * 1000;
    return timestamp >= thirtyDaysAgo;
  }

  if (datePreset === 'custom') {
    let matches = true;
    if (customDateFrom) {
      const fromTime = new Date(customDateFrom).setHours(0, 0, 0, 0);
      if (timestamp < fromTime) matches = false;
    }
    if (customDateTo) {
      const toTime = new Date(customDateTo).setHours(23, 59, 59, 999);
      if (timestamp > toTime) matches = false;
    }
    return matches;
  }

  return true;
}

function filterInventoryItems(items: ActiveInventoryItem[]): ActiveInventoryItem[] {
  return items
    .filter((item) => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.concept && item.concept.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.domain && item.domain.toLowerCase().includes(q)) ||
          (item.providerCategory && item.providerCategory.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Domain / Subject filter
      if (filterDomain !== 'all' && item.domain !== filterDomain) {
        return false;
      }

      // Class / Category filter
      if (filterClass !== 'all' && item.providerCategory !== filterClass) {
        return false;
      }

      // Condition filter (Feature 3D)
      if (filterCondition !== 'all' && item.conditionType !== filterCondition) {
        return false;
      }

      // Seller filter (Feature 3A)
      if (filterSeller !== 'all' && item.sellerPhone !== filterSeller) {
        return false;
      }

      // Status filter (Active / Reserved / Sold)
      if (filterStatus !== 'all' && item.status !== filterStatus) {
        return false;
      }

      // Date filter
      if (!passesDateFilter(item.createdAt)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
      return sortDescending ? timeB - timeA : timeA - timeB;
    });
}

function filterDemandItems(
  items: DemandItem[],
  status: 'pending' | 'matched' | 'fulfilled'
): DemandItem[] {
  return items
    .filter((item) => {
      if (item.status !== status) return false;

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (item.requestedQuery && item.requestedQuery.toLowerCase().includes(q)) ||
          (item.concept && item.concept.toLowerCase().includes(q)) ||
          (item.domain && item.domain.toLowerCase().includes(q)) ||
          (item.handoverCode && item.handoverCode.toLowerCase().includes(q));
        if (!matchesSearch) return false;
      }

      // Domain / Subject filter
      if (filterDomain !== 'all' && item.domain !== filterDomain) {
        return false;
      }

      // Date filter
      if (!passesDateFilter(item.createdAt)) {
        return false;
      }

      return true;
    })
    .sort((a, b) => {
      const timeA = a.matchedAt || a.createdAt || 0;
      const timeB = b.matchedAt || b.createdAt || 0;
      return sortDescending ? timeB - timeA : timeA - timeB;
    });
}

function countActiveFilters(): number {
  let count = 0;
  if (searchQuery.trim()) count++;
  if (filterDomain !== 'all') count++;
  if (filterClass !== 'all') count++;
  if (filterCondition !== 'all') count++;
  if (filterSeller !== 'all') count++;
  if (filterStatus !== 'all') count++;
  if (datePreset !== 'all') count++;
  return count;
}

function resetAllFilters() {
  searchQuery = '';
  filterDomain = 'all';
  filterClass = 'all';
  filterCondition = 'all';
  filterSeller = 'all';
  filterStatus = 'all';
  datePreset = 'all';
  customDateFrom = '';
  customDateTo = '';
  redraw();
}

// ─── API Operations ───────────────────────────────────────────────────────────

async function loadData() {
  isLoading = true;
  redraw();
  try {
    // Proactively sweep any expired holds
    try {
      await api.releaseExpiredHolds();
    } catch {
      // Non-blocking in case of offline/local mock
    }

    const [inv, dem, ev, sec, gaps] = await Promise.all([
      api.listInventory(),
      api.listDemands(),
      api.getLifecycleEvents(),
      api.getSecurityObservabilityStatus(),
      api.getSupplyGaps(),
    ]);

    inventory = (inv as ActiveInventoryItem[]) || [];
    demands = (dem as DemandItem[]) || [];
    events = (ev as LifecycleEvent[]) || [];
    _securityStatus = (sec as SecurityObservabilityStatus) || null;
    supplyGaps = (gaps as SupplyGapsData) || null;
  } catch (err: any) {
    console.error('Failed to load dashboard data:', err);
    setBannerMessage(`❌ Failed to load data: ${err.message}`);
  } finally {
    isLoading = false;
    redraw();
  }
}

// Feature 3A: Open Family Storefront
async function openSellerStorefront(phone: string) {
  isLoadingStorefront = true;
  showStorefrontModal = true;
  selectedStorefront = null;
  redraw();

  try {
    const data = await api.getSellerStorefront(phone);
    selectedStorefront = data as SellerStorefrontData;
  } catch (err: any) {
    setBannerMessage(`❌ Failed to load seller storefront: ${err.message}`);
    showStorefrontModal = false;
  } finally {
    isLoadingStorefront = false;
    redraw();
  }
}

async function handleWebhookHandshake() {
  try {
    const response = await api.verifyWebhook(
      'subscribe',
      'my_verify_token_123',
      `challenge_${Date.now()}`
    );
    if (response.status === 200) {
      setBannerMessage(`✅ Handshake Verified! Echoed challenge: "${response.challenge}"`);
    } else {
      setBannerMessage(`❌ Verification failed: ${response.error}`);
    }
  } catch (err: any) {
    setBannerMessage(`❌ Error verifying webhook: ${err.message}`);
  }
  loadData();
}

async function handleSimulateInboundMedia(messageText: string, phone: string = '+15550199001') {
  setBannerMessage(`🚀 Processing simulated WhatsApp message: "${messageText}"...`);
  redraw();

  try {
    const payload = {
      media_id: `media_${Date.now()}`,
      from_phone: phone,
      message_text: messageText,
    };
    const res = await api.handleWebhook(payload);
    if (res.result?.status === 'matched') {
      setBannerMessage(`🎉 Match Connected! Matched wishlist ID: ${res.result.matchedDemandId}`);
      activeTab = 'matches';
    } else if (res.result?.status === 'needs_year_clarification') {
      setBannerMessage(
        `ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!`
      );
    } else if (res.result?.status === 'greeting') {
      setBannerMessage(`👋 Greeting Handled: Welcome & Guide sent.`);
    } else {
      setBannerMessage(`📦 Book Listed into Inventory! Item ID: ${res.result?.itemId || 'saved'}`);
      activeTab = 'available';
    }
  } catch (err: any) {
    setBannerMessage(`❌ Webhook simulation error: ${err.message}`);
  }
  loadData();
}

async function handleAddWishlistDemand(
  concept: string,
  query: string,
  domain: string = 'Mathematics',
  phone: string = '+15550199002'
) {
  setBannerMessage(`⏳ Registering demand for "${query}" (${concept})...`);
  redraw();

  try {
    const res = await api.createDemand(phone, query, concept, domain);
    setBannerMessage(`✨ Wishlist demand registered: "${res.requestedQuery}"!`);
    showAddDemandModal = false;
    activeTab = 'pendings';
  } catch (err: any) {
    setBannerMessage(`❌ Error adding demand: ${err.message}`);
  }
  loadData();
}

async function handleDeleteDemand(demandId: string) {
  try {
    await api.deleteDemand(demandId);
    setBannerMessage(`🗑️ Removed demand entry.`);
    demands = demands.filter((d) => d.demandId !== demandId);
    redraw();
  } catch (err: any) {
    setBannerMessage(`❌ Error removing demand: ${err.message}`);
  }
}

async function handleDeleteInventory(itemId: string) {
  try {
    await api.deleteInventory(itemId);
    setBannerMessage(`🗑️ Removed inventory item.`);
    inventory = inventory.filter((i) => i.itemId !== itemId);
    redraw();
  } catch (err: any) {
    setBannerMessage(`❌ Error removing inventory: ${err.message}`);
  }
}

async function handleTestHmacValidation() {
  setBannerMessage('🔒 Validating HMAC-SHA256 Payload Signature...');
  redraw();

  try {
    const testSecret = 'secret_key_whatsapp_demo_1234';
    const testPayload = JSON.stringify({ test: 'hmac-verification', timestamp: Date.now() });

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      'raw',
      encoder.encode(testSecret),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign']
    );
    const signatureBuffer = await crypto.subtle.sign('HMAC', key, encoder.encode(testPayload));
    const hexSignature = Array.from(new Uint8Array(signatureBuffer))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const res = await api.validateSignature(testPayload, `sha256=${hexSignature}`, testSecret);
    if (res.valid) {
      setBannerMessage(
        `🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified.`
      );
    } else {
      setBannerMessage(`❌ HMAC Verification Failed!`);
    }
  } catch (err: any) {
    setBannerMessage(`❌ HMAC test error: ${err.message}`);
  }
  loadData();
}

// ─── Component Renderers ──────────────────────────────────────────────────────

function renderStatsOverview() {
  const pendingCount = demands.filter((d) => d.status === 'pending').length;
  const matchedCount = demands.filter((d) => d.status === 'matched').length;
  const soldCount =
    demands.filter((d) => d.status === 'fulfilled').length ||
    inventory.filter((i) => i.status === 'sold').length;
  const activeCount = inventory.filter((i) => i.status === 'active').length;
  const eventsCount = events.length;

  return html`
    <div class="stats-row">
      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${() => {
          activeTab = 'available';
          filterStatus = 'active';
          redraw();
        }}
      >
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${activeCount}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${() => {
          activeTab = 'pendings';
          redraw();
        }}
      >
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${() => {
          activeTab = 'matches';
          matchSubTab = 'holds';
          redraw();
        }}
      >
        <div class="stat-icon" style="background:rgba(99,102,241,0.15);color:#818cf8;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${matchedCount}</div>
          <div class="stat-label">48H Active Holds</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${() => {
          activeTab = 'matches';
          matchSubTab = 'completed';
          redraw();
        }}
      >
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🎓</div>
        <div class="stat-info">
          <div class="stat-value">${soldCount}</div>
          <div class="stat-label">Sold & Completed</div>
        </div>
      </div>

      <div
        class="stat-card"
        style="cursor:pointer;"
        @click=${() => {
          activeTab = 'observability';
          redraw();
        }}
      >
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">📊</div>
        <div class="stat-info">
          <div class="stat-value">${eventsCount}</div>
          <div class="stat-label">Live Events</div>
        </div>
      </div>
    </div>
  `;
}

function renderTabsNavigation() {
  const pendingCount = demands.filter((d) => d.status === 'pending').length;
  const matchedCount = demands.filter((d) => d.status === 'matched').length;
  const completedCount =
    demands.filter((d) => d.status === 'fulfilled').length ||
    inventory.filter((i) => i.status === 'sold').length;
  const activeCount = inventory.filter((i) => i.status === 'active').length;

  return html`
    <div class="tabs-nav">
      <button
        class="tab-btn ${activeTab === 'available' ? 'active' : ''}"
        @click=${() => {
          activeTab = 'available';
          redraw();
        }}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${activeCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'pendings' ? 'active' : ''}"
        @click=${() => {
          activeTab = 'pendings';
          redraw();
        }}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${pendingCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'matches' ? 'active' : ''}"
        @click=${() => {
          activeTab = 'matches';
          redraw();
        }}
      >
        <span>🤝 Matches & Sales</span>
        <span class="tab-count">${matchedCount + completedCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'webhook' ? 'active' : ''}"
        @click=${() => {
          activeTab = 'webhook';
          redraw();
        }}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'observability' ? 'active' : ''}"
        @click=${() => {
          activeTab = 'observability';
          redraw();
        }}
      >
        <span>📊 Observability & Stream</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'learn' ? 'active' : ''}"
        style="${activeTab === 'learn'
          ? 'border-color: #6366f1; background: rgba(99, 102, 241, 0.2); box-shadow: 0 0 12px rgba(99, 102, 241, 0.3);'
          : 'border-color: rgba(99, 102, 241, 0.4);'}"
        @click=${() => {
          activeTab = 'learn';
          loadLearningStats();
          loadDynamoCurriculum();
          if (!simActiveCard) startSimSession();
          redraw();
        }}
      >
        <span>🧠 Relay Learn (AI Tutor)</span>
        <span
          style="background: #6366f1; color: white; padding: 2px 7px; border-radius: 999px; font-size: 10px; font-weight: 800; margin-left: 6px; letter-spacing: 0.05em;"
          >NEW</span
        >
      </button>
    </div>
  `;
}

// ─── Feature 3B: Supply Gaps Banner Widget ─────────────────────────────────────

function renderSupplyGapsBanner() {
  if (!supplyGaps) return '';

  return html`
    <div
      class="card"
      style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;"
    >
      <div
        style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;"
      >
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">
              Community Supply Deficit Alert (Feature 3B)
            </h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in:
            <strong
              >${supplyGaps.deficitSubjects.map((s) => `${s.domain} (${s.count})`).join(', ')}</strong
            >
            and grades <strong>${supplyGaps.deficitGrades.map((g) => g.grade).join(', ')}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${() => {
              setBannerMessage(
                `📢 Broadcast Dispatched to WhatsApp Group: "${supplyGaps?.broadcastMessageEn}"`
              );
            }}
          >
            🚀 Broadcast Supply Call
          </button>
        </div>
      </div>
    </div>
  `;
}

function renderFilterToolbar(showClassFilter = true) {
  const activeCount = countActiveFilters();

  // Distinct sellers list for filter
  const distinctSellers = Array.from(new Set(inventory.map((i) => i.sellerPhone).filter(Boolean)));

  return html`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or grades..."
            .value=${searchQuery}
            @input=${(e: any) => {
              searchQuery = e.target.value;
              redraw();
            }}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${filterDomain}
          @change=${(e: any) => {
            filterDomain = e.target.value;
            redraw();
          }}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${
          showClassFilter
            ? html`
                <select
                  class="filter-select"
                  .value=${filterClass}
                  @change=${(e: any) => {
                    filterClass = e.target.value;
                    redraw();
                  }}
                >
                  <option value="all">🏫 All Classes / Levels</option>
                  <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                  <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                  <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                  <option value="UniversityPrep">🏛️ University Prep</option>
                </select>
              `
            : ''
        }

        <!-- Condition Selector (Feature 3D) -->
        ${
          showClassFilter
            ? html`
                <select
                  class="filter-select"
                  .value=${filterCondition}
                  @change=${(e: any) => {
                    filterCondition = e.target.value;
                    redraw();
                  }}
                >
                  <option value="all">All Conditions</option>
                  <option value="New">New</option>
                  <option value="LikeNew">Like New</option>
                  <option value="Good">Good</option>
                  <option value="Acceptable">Acceptable</option>
                </select>

                <!-- Status Selector (Active / Reserved / Sold) -->
                <select
                  class="filter-select"
                  .value=${filterStatus}
                  @change=${(e: any) => {
                    filterStatus = e.target.value;
                    redraw();
                  }}
                >
                  <option value="all">📦 All Statuses (${inventory.length})</option>
                  <option value="active">
                    🟢 Available (${inventory.filter((i) => i.status === 'active').length})
                  </option>
                  <option value="reserved">
                    ⏳ On Hold (${inventory.filter((i) => i.status === 'reserved').length})
                  </option>
                  <option value="sold">
                    🎓 Sold & Completed (${inventory.filter((i) => i.status === 'sold').length})
                  </option>
                </select>
              `
            : ''
        }

        <!-- Seller Filter (Feature 3A) -->
        ${
          distinctSellers.length > 1
            ? html`
                <select
                  class="filter-select"
                  .value=${filterSeller}
                  @change=${(e: any) => {
                    filterSeller = e.target.value;
                    redraw();
                  }}
                >
                  <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                  ${distinctSellers.map((s, idx) => html`<option value="${s}">Family Collection #${idx + 1}</option>`)}
                </select>
              `
            : ''
        }

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${datePreset}
          @change=${(e: any) => {
            datePreset = e.target.value;
            redraw();
          }}
        >
          <option value="all">📅 All Dates</option>
          <option value="today">Today</option>
          <option value="7days">Last 7 Days</option>
          <option value="30days">Last 30 Days</option>
          <option value="custom">Custom Date Range...</option>
        </select>

        <!-- Sort Order Indicator (Descending by default) -->
        <button
          class="secondary sm"
          title="Click to toggle sorting order"
          @click=${() => {
            sortDescending = !sortDescending;
            redraw();
          }}
        >
          ${sortDescending ? '⬇️ Newest First' : '⬆️ Oldest First'}
        </button>

        <!-- Reset Button -->
        ${
          activeCount > 0
            ? html`
                <button class="danger sm" @click=${resetAllFilters}>
                  ✕ Reset (${activeCount})
                </button>
              `
            : ''
        }
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${
        datePreset === 'custom'
          ? html`
              <div
                style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;"
              >
                <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;"
                  >Custom Created Date:</span
                >
                <div class="date-filter-group">
                  <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                  <input
                    type="date"
                    class="date-input"
                    .value=${customDateFrom}
                    @change=${(e: any) => {
                      customDateFrom = e.target.value;
                      redraw();
                    }}
                  />
                </div>
                <div class="date-filter-group">
                  <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                  <input
                    type="date"
                    class="date-input"
                    .value=${customDateTo}
                    @change=${(e: any) => {
                      customDateTo = e.target.value;
                      redraw();
                    }}
                  />
                </div>
              </div>
            `
          : ''
      }

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${['all', 'Mathematics', 'Science', 'Languages', 'Humanities', 'Arts'].map(
            (dom) => html`
              <button
                class="pill ${filterDomain === dom ? 'active' : ''}"
                @click=${() => {
                  filterDomain = dom;
                  redraw();
                }}
              >
                ${dom === 'all' ? 'All Subjects' : dom}
              </button>
            `
          )}
        </div>

        ${
          showClassFilter
            ? html`
                <div class="pill-group">
                  <span class="pill-label">Classes:</span>
                  ${[
                    { id: 'all', label: 'All Levels' },
                    { id: 'PrimarySchool', label: 'Primary' },
                    { id: 'MiddleSchool', label: 'Middle' },
                    { id: 'HighSchool', label: 'High' },
                    { id: 'UniversityPrep', label: 'Uni Prep' },
                  ].map(
                    (cls) => html`
                      <button
                        class="pill ${filterClass === cls.id ? 'active' : ''}"
                        @click=${() => {
                          filterClass = cls.id;
                          redraw();
                        }}
                      >
                        ${cls.label}
                      </button>
                    `
                  )}
                </div>
              `
            : ''
        }
      </div>
    </div>
  `;
}

// ─── Tab View: Available Books ────────────────────────────────────────────────

function renderAvailableBooksTab() {
  const filtered = filterInventoryItems(inventory);

  return html`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>
            📚
            ${filterStatus === 'sold' ? 'Sold & Completed Books Archive' : filterStatus === 'reserved' ? 'On-Hold Inventory' : 'Available Books Catalog'}
          </h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${
              filterStatus === 'sold'
                ? 'Archived record of sold books, verified handovers, and buyer details.'
                : filterStatus === 'reserved'
                  ? 'Books currently on 48-hour hold awaiting physical exchange.'
                  : 'Active inventory extracted from WhatsApp parent messages, categorized by class and subject (Sorted newest first).'
            }
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <!-- View Grouping Selector -->
          <div
            style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;"
          >
            <button
              class="sm ${viewGrouping === 'all' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => {
                viewGrouping = 'all';
                redraw();
              }}
            >
              Grid
            </button>
            <button
              class="sm ${viewGrouping === 'by-subject' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => {
                viewGrouping = 'by-subject';
                redraw();
              }}
            >
              By Subject
            </button>
            <button
              class="sm ${viewGrouping === 'by-class' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => {
                viewGrouping = 'by-class';
                redraw();
              }}
            >
              By Class
            </button>
          </div>
          <button class="secondary sm" @click=${loadData}>
            ${isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      <!-- Feature 3B: Supply Gaps Alert -->
      ${renderSupplyGapsBanner()} ${renderFilterToolbar(true)}
      ${
        filtered.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon">📖</div>
                <div class="empty-state-title">No books match your current filters</div>
                <div class="empty-state-text">
                  Try clearing your search keyword, selecting "All Subjects" / "All Dates", or
                  simulate a book upload in the Webhook tab.
                </div>
                <button class="secondary sm" style="margin-top:10px;" @click=${resetAllFilters}>
                  Clear All Filters
                </button>
              </div>
            `
          : viewGrouping === 'all'
            ? html` <div class="items-grid">${filtered.map((item) => renderBookCard(item))}</div> `
            : viewGrouping === 'by-subject'
              ? renderGroupedBySubject(filtered)
              : renderGroupedByClass(filtered)
      }
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${renderStorefrontModal()}
  `;
}

function renderBookCard(item: ActiveInventoryItem) {
  const isSold = item.status === 'sold';
  const isReserved = item.status === 'reserved';

  return html`
    <div
      class="item-card"
      style="${isSold ? 'border-left: 3px solid var(--success);' : isReserved ? 'border-left: 3px solid #6366f1;' : ''}"
    >
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${item.title}</div>
          <div class="book-concept">${item.concept}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${
            isSold
              ? html`<span
                  class="badge"
                  style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
                  >SOLD 🎓</span
                >`
              : isReserved
                ? html`<span
                    class="badge"
                    style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.35);"
                    >HOLD ⏳</span
                  >`
                : ''
          }
          <span class="badge ${getDomainBadgeClass(item.domain)}"> ${item.domain} </span>
        </div>
      </div>

      <div class="tags-row">
        <span class="badge ${getClassBadgeClass(item.providerCategory)}">
          ${getHumanClassLabel(item.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${renderConditionBadge(item.conditionType)}
        ${item.handoverCode ? html`<span class="badge" style="background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.25);">Code: #${item.handoverCode}</span>` : ''}
      </div>

      ${
        item.description
          ? html`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">
              ${item.description}
            </div>`
          : ''
      }
      ${
        isSold
          ? html`
              <div
                style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#6ee7b7;display:flex;flex-direction:column;gap:3px;"
              >
                <div>
                  🎓
                  <strong>Handover Completed</strong>
                  to <strong style="color:var(--text);">Community Parent</strong>
                </div>
                ${item.soldAt ? html`<div style="font-size:0.75rem;color:var(--text-dim);">Sold on ${formatExactDate(item.soldAt)}</div>` : ''}
              </div>
            `
          : isReserved
            ? html`
                <div
                  style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#a5b4fc;"
                >
                  ⏳
                  <strong>Reserved on 48h Hold</strong>
                  for <strong style="color:var(--text);">Community Parent</strong>
                </div>
              `
            : ''
      }

      <div class="card-footer">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <!-- Feature 3A: Clickable Seller Storefront Link -->
          <div style="font-size:0.75rem;color:var(--text-dim);">
            Seller:
            <button
              class="secondary sm"
              style="padding:2px 6px;font-size:0.72rem;margin-left:4px;display:inline-flex;"
              title="Click to view full family collection & grade bundles"
              @click=${() => openSellerStorefront(item.sellerPhone)}
            >
              👨‍👩‍👧 Family Storefront
            </button>
          </div>
          <div class="date-badge" title="${formatExactDate(item.createdAt)}">
            📅 ${formatRelativeTime(item.createdAt)} (${formatExactDate(item.createdAt)})
          </div>
        </div>
        <button
          class="danger sm"
          style="padding:4px 8px;font-size:0.72rem;"
          title="Remove from active inventory"
          @click=${() => handleDeleteInventory(item.itemId)}
        >
          🗑️
        </button>
      </div>
    </div>
  `;
}

function renderGroupedBySubject(items: ActiveInventoryItem[]) {
  const domains = ['Mathematics', 'Science', 'Languages', 'Humanities', 'Arts'] as const;
  return html`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${domains.map((dom) => {
        const groupItems = items.filter((i) => i.domain === dom);
        if (groupItems.length === 0) return '';
        return html`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${dom}</h4>
              <span class="badge ${getDomainBadgeClass(dom)}">${groupItems.length} Available</span>
            </div>
            <div class="items-grid">${groupItems.map((item) => renderBookCard(item))}</div>
          </div>
        `;
      })}
    </div>
  `;
}

function renderGroupedByClass(items: ActiveInventoryItem[]) {
  const categories = [
    { key: 'PrimarySchool', label: 'Primary School (Years 1 - 6)' },
    { key: 'MiddleSchool', label: 'Middle School (Years 7 - 9)' },
    { key: 'HighSchool', label: 'High School (Years 10 - 13)' },
    { key: 'UniversityPrep', label: 'University Prep' },
  ] as const;

  return html`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${categories.map((cat) => {
        const groupItems = items.filter((i) => i.providerCategory === cat.key);
        if (groupItems.length === 0) return '';
        return html`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${cat.label}</h4>
              <span class="badge ${getClassBadgeClass(cat.key)}"
                >${groupItems.length} Available</span
              >
            </div>
            <div class="items-grid">${groupItems.map((item) => renderBookCard(item))}</div>
          </div>
        `;
      })}
    </div>
  `;
}

// ─── Feature 3A: Seller Storefront Modal Component ─────────────────────────────

function renderStorefrontModal() {
  if (!showStorefrontModal) return '';

  return html`
    <div
      style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"
      @click=${(e: any) => {
        if (e.target === e.currentTarget) {
          showStorefrontModal = false;
          redraw();
        }
      }}
    >
      <div
        class="card"
        style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;"
      >
        ${
          isLoadingStorefront
            ? html`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">
                Loading Family Storefront...
              </div>`
            : selectedStorefront
              ? html`
                  <div
                    style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;"
                  >
                    <div>
                      <div
                        style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;"
                      >
                        👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                      </div>
                      <h3 style="font-size:1.4rem;">
                        Community Family Storefront
                      </h3>
                      <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                        Total <strong>${selectedStorefront.totalBooks} textbooks</strong> available
                        across multiple grades.
                      </p>
                    </div>
                    <button
                      class="secondary sm"
                      @click=${() => {
                        showStorefrontModal = false;
                        redraw();
                      }}
                    >
                      ✕ Close
                    </button>
                  </div>

                  <!-- Grade Bundles Section -->
                  <div>
                    <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">
                      📦 Available Grade Bundles
                    </h4>
                    <div
                      style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;"
                    >
                      ${selectedStorefront.bundles.map(
                        (b) => html`
                          <div
                            style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;"
                          >
                            <div style="font-weight:700;font-size:0.95rem;color:#fff;">
                              ${b.grade} Bundle
                            </div>
                            <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">
                              ${b.count} Books Available
                            </div>
                            <button
                              class="secondary sm"
                              style="margin-top:8px;width:100%;font-size:0.72rem;"
                              @click=${() => {
                                setBannerMessage(
                                  `💬 WhatsApp Bundle Request sent to family for all ${b.count} books in ${b.grade}!`
                                );
                              }}
                            >
                              Request Entire Bundle
                            </button>
                          </div>
                        `
                      )}
                    </div>
                  </div>

                  <!-- Individual Books List -->
                  <div>
                    <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">
                      📖 All Books from this Parent
                    </h4>
                    <div
                      style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;"
                    >
                      ${selectedStorefront.items.map(
                        (item) => html`
                          <div
                            style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;"
                          >
                            <div>
                              <div style="font-weight:600;font-size:0.88rem;color:#fff;">
                                ${item.title}
                              </div>
                              <div style="font-size:0.75rem;color:var(--text-dim);">
                                ${item.domain} &bull; ${item.concept}
                              </div>
                            </div>
                            <div>${renderConditionBadge(item.conditionType)}</div>
                          </div>
                        `
                      )}
                    </div>
                  </div>

                  <div
                    style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;"
                  >
                    <button
                      class="secondary"
                      @click=${() => {
                        filterSeller = selectedStorefront?.sellerPhone || 'all';
                        showStorefrontModal = false;
                        redraw();
                      }}
                    >
                      Filter Main Catalog by this Seller
                    </button>
                  </div>
                `
              : ''
        }
      </div>
    </div>
  `;
}

// ─── Tab View: Pending Demands ────────────────────────────────────────────────

function renderPendingDemandsTab() {
  const pendings = filterDemandItems(demands, 'pending');

  return html`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>⏳ Pending Wishlists & Demands</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs
            them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button
            class="sm"
            @click=${() => {
              showAddDemandModal = true;
              redraw();
            }}
          >
            + Create Demand
          </button>
          <button class="secondary sm" @click=${loadData}>
            ${isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      ${renderFilterToolbar(false)}
      ${
        pendings.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon">⏳</div>
                <div class="empty-state-title">No pending wishlists found</div>
                <div class="empty-state-text">
                  All requests have either been matched or no parents are waiting for books right
                  now.
                </div>
                <button
                  class="sm"
                  style="margin-top:10px;"
                  @click=${() => handleAddWishlistDemand('Year5Chemistry', 'Year 5 Chemistry', 'Science')}
                >
                  + Add Demo "Year 5 Chemistry" Demand
                </button>
              </div>
            `
          : html`
              <div class="items-grid">
                ${pendings.map(
                  (d) => html`
                    <div class="item-card" style="border-left: 3px solid var(--warning);">
                      <div class="item-card-header">
                        <div class="item-title-wrap">
                          <div class="book-title">${d.requestedQuery}</div>
                          <div class="book-concept">Concept: ${d.concept}</div>
                        </div>
                        <span class="badge badge-pending">PENDING</span>
                      </div>

                      <div class="tags-row">
                        <span class="badge ${getDomainBadgeClass(d.domain)}">
                          ${d.domain || 'Marketplace'}
                        </span>
                      </div>

                      <div class="card-footer">
                        <div style="display:flex;flex-direction:column;gap:2px;">
                          <div style="font-size:0.75rem;color:var(--text-dim);">
                            Waiting Parent:
                            <strong style="color:var(--text);">Community Parent</strong>
                          </div>
                          <div class="date-badge" title="${formatExactDate(d.createdAt)}">
                            📅 ${formatRelativeTime(d.createdAt)} (${formatExactDate(d.createdAt)})
                          </div>
                        </div>
                        <div style="display:flex;gap:6px;">
                          <button
                            class="secondary sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Simulate seller offering this book to trigger automatic match"
                            @click=${() => handleSimulateInboundMedia(`I have ${d.requestedQuery} available for Year parent`, '+15559998888')}
                          >
                            ⚡ Match
                          </button>
                          <button
                            class="danger sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Delete demand"
                            @click=${() => handleDeleteDemand(d.demandId)}
                          >
                            🗑️
                          </button>
                        </div>
                      </div>
                    </div>
                  `
                )}
              </div>
            `
      }
    </div>

    <!-- Quick Add Demand Modal -->
    ${
      showAddDemandModal
        ? html`
            <div
              style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
              @click=${(e: any) => {
                if (e.target === e.currentTarget) {
                  showAddDemandModal = false;
                  redraw();
                }
              }}
            >
              <div
                class="card"
                style="width:100%;max-width:480px;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);"
              >
                <h3>Create Parent Wishlist Request</h3>
                <p style="margin:4px 0 18px 0;font-size:0.85rem;color:var(--text-muted);">
                  Add a demand for a textbook that isn't currently in stock.
                </p>

                <div style="display:flex;flex-direction:column;gap:14px;">
                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Book Title / Request Query</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="e.g. Year 10 Physics Textbook"
                      style="padding-left:14px;"
                      .value=${newDemandQuery}
                      @input=${(e: any) => {
                        newDemandQuery = e.target.value;
                        newDemandConcept = e.target.value.replace(/[^a-zA-Z0-9]/g, '');
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Normalized Concept Key</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="e.g. Year10Physics"
                      style="padding-left:14px;"
                      .value=${newDemandConcept}
                      @input=${(e: any) => {
                        newDemandConcept = e.target.value;
                      }}
                    />
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Subject Domain</label
                    >
                    <select
                      class="filter-select"
                      style="width:100%;"
                      .value=${newDemandDomain}
                      @change=${(e: any) => {
                        newDemandDomain = e.target.value;
                      }}
                    >
                      <option value="Mathematics">Mathematics</option>
                      <option value="Science">Science</option>
                      <option value="Languages">Languages</option>
                      <option value="Humanities">Humanities</option>
                      <option value="Arts">Arts</option>
                    </select>
                  </div>

                  <div>
                    <label
                      style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;"
                      >Parent WhatsApp Phone Number</label
                    >
                    <input
                      type="text"
                      class="search-input"
                      placeholder="+15550199002"
                      style="padding-left:14px;"
                      .value=${newDemandPhone}
                      @input=${(e: any) => {
                        newDemandPhone = e.target.value;
                      }}
                    />
                  </div>

                  <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                    <button
                      class="secondary"
                      @click=${() => {
                        showAddDemandModal = false;
                        redraw();
                      }}
                    >
                      Cancel
                    </button>
                    <button
                      @click=${() => {
                        if (!newDemandQuery.trim()) return;
                        handleAddWishlistDemand(
                          newDemandConcept || newDemandQuery.replace(/[^a-zA-Z0-9]/g, ''),
                          newDemandQuery,
                          newDemandDomain,
                          newDemandPhone
                        );
                      }}
                    >
                      Save Request
                    </button>
                  </div>
                </div>
              </div>
            </div>
          `
        : ''
    }
  `;
}

// ─── Tab View: Matched Demands ────────────────────────────────────────────────

function renderMatchedDemandsTab() {
  const activeHolds = filterDemandItems(demands, 'matched');
  const completedDemands = filterDemandItems(demands, 'fulfilled');
  const isCompletedView = matchSubTab === 'completed';
  const itemsToRender = isCompletedView ? completedDemands : activeHolds;

  return html`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>
            ${isCompletedView ? '🎓 Completed Book Exchanges & Sold Archive' : '🤝 Matched Pairs & 48-Hour Reservations'}
          </h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${
              isCompletedView
                ? 'Verified physical handovers. Each record preserves the buyer, seller, handover verification code, and completion date.'
                : 'Demands matched with available books. Holds automatically release after 48 hours if handover is not confirmed.'
            }
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <!-- View Toggle: Active Holds vs Completed / Sold -->
          <div
            style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;"
          >
            <button
              class="sm ${matchSubTab === 'holds' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => {
                matchSubTab = 'holds';
                redraw();
              }}
            >
              ⏳ Active Holds (${demands.filter((d) => d.status === 'matched').length})
            </button>
            <button
              class="sm ${matchSubTab === 'completed' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => {
                matchSubTab = 'completed';
                redraw();
              }}
            >
              🎓 Completed & Sold (${demands.filter((d) => d.status === 'fulfilled').length})
            </button>
          </div>

          ${
            !isCompletedView
              ? html`
                  <button
                    class="secondary sm"
                    title="Proactively sweep and release all expired 48H holds"
                    @click=${async () => {
                      const res = await api.releaseExpiredHolds();
                      setBannerMessage(
                        `🧹 Swept holds: ${res.releasedCount} expired hold(s) released back to active inventory.`
                      );
                      await loadData();
                    }}
                  >
                    🧹 Sweep Holds
                  </button>
                `
              : ''
          }
          <button class="secondary sm" @click=${loadData}>
            ${isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      ${renderFilterToolbar(false)}
      ${
        itemsToRender.length === 0
          ? html`
              <div class="empty-state">
                <div class="empty-state-icon">${isCompletedView ? '🎓' : '🤝'}</div>
                <div class="empty-state-title">
                  ${isCompletedView ? 'No completed book exchanges found' : 'No active matched pairs found'}
                </div>
                <div class="empty-state-text">
                  ${
                    isCompletedView
                      ? 'When parents complete a physical book exchange and confirm via WhatsApp or the Mark Sold action, it will appear here.'
                      : "When a seller lists a book that matches a waiting parent's wishlist, it will be placed on a 48-hour hold and displayed here."
                  }
                </div>
                ${
                  !isCompletedView
                    ? html`
                        <div style="margin-top:12px;display:flex;gap:10px;">
                          <button
                            class="secondary sm"
                            @click=${async () => {
                              await handleAddWishlistDemand(
                                'Year8Science',
                                'Year 8 Science',
                                'Science',
                                '+15559990001'
                              );
                              await handleSimulateInboundMedia(
                                'I have Year 8 Science textbook in great shape',
                                '+15559990002'
                              );
                            }}
                          >
                            ⚡ Run Auto-Match Simulation
                          </button>
                        </div>
                      `
                    : ''
                }
              </div>
            `
          : html`
              <div class="items-grid">
                ${itemsToRender.map((m) => {
                  const matchTime = m.matchedAt || m.createdAt || Date.now();
                  const holdDurationMs = 48 * 60 * 60 * 1000;
                  const remainingMs = matchTime + holdDurationMs - Date.now();
                  const isExpired = m.status !== 'fulfilled' && remainingMs <= 0;
                  const remainingHours = Math.max(1, Math.ceil(remainingMs / (1000 * 60 * 60)));
                  const matchedBook = inventory.find((i) => i.itemId === m.matchedItemId);

                  return html`
                    <div
                      class="item-card"
                      style="border-left: 3px solid ${m.status === 'fulfilled' ? 'var(--success)' : isExpired ? '#ef4444' : '#6366f1'};"
                    >
                      <div class="item-card-header">
                        <div class="item-title-wrap">
                          <div class="book-title">${m.requestedQuery}</div>
                          <div class="book-concept">Concept: ${m.concept}</div>
                        </div>
                        ${
                          m.status === 'fulfilled'
                            ? html`<span
                                class="badge"
                                style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
                                >COMPLETED / SOLD 🎓</span
                              >`
                            : isExpired
                              ? html`<span
                                  class="badge"
                                  style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);"
                                  >HOLD EXPIRED</span
                                >`
                              : html`<span class="badge badge-matched"
                                  >48H HOLD (${remainingHours}h left)</span
                                >`
                        }
                      </div>

                      <div class="tags-row">
                        <span class="badge ${getDomainBadgeClass(m.domain)}">
                          ${m.domain || 'Marketplace'}
                        </span>
                        ${
                          m.handoverCode
                            ? html`<span
                                class="badge"
                                style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);"
                                >Code: #${m.handoverCode}</span
                              >`
                            : ''
                        }
                      </div>

                      <div
                        style="background:${
                          m.status === 'fulfilled'
                            ? 'rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#6ee7b7;'
                            : isExpired
                              ? 'rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;'
                              : 'rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;'
                        };padding:10px 12px;border-radius:8px;font-size:0.83rem;"
                      >
                        ${
                          m.status === 'fulfilled'
                            ? html`
                                <div>
                                  ✅ <strong>Handover verified & completed!</strong> Book marked as
                                  sold and removed from active catalog.
                                </div>
                                <div
                                  style="margin-top:6px;display:flex;flex-direction:column;gap:3px;font-size:0.8rem;color:var(--text-muted);"
                                >
                                  ${matchedBook?.title ? html`<div>Book: <strong style="color:var(--text);">${matchedBook.title}</strong></div>` : ''}
                                  <div>
                                    Exchange:
                                    <strong style="color:var(--text);">Verified Community Parents</strong>
                                  </div>
                                  ${matchedBook?.soldAt || m.matchedAt ? html`<div>Completed: <strong>${formatExactDate(matchedBook?.soldAt || m.matchedAt!)}</strong></div>` : ''}
                                </div>
                              `
                            : isExpired
                              ? '⚠️ 48-Hour hold has elapsed without physical exchange. Book can be returned to community circulation.'
                              : `⏳ 48-Hour Reservation Active (${remainingHours}h remaining). Matched parents introduced via WhatsApp.`
                        }
                      </div>

                      <div class="card-footer">
                        <div style="display:flex;flex-direction:column;gap:2px;">
                          <div style="font-size:0.75rem;color:var(--text-dim);">
                            ${m.status === 'fulfilled' ? 'Status:' : 'Hold Recipient:'}
                            <strong style="color:var(--text);">${m.status === 'fulfilled' ? 'Handover Verified' : 'Community Parent'}</strong>
                          </div>
                          <div class="date-badge" title="${formatExactDate(m.createdAt)}">
                            ${formatRelativeTime(m.createdAt)} (${formatExactDate(m.createdAt)})
                          </div>
                        </div>
                        <div style="display:flex;gap:6px;">
                          ${
                            m.status !== 'fulfilled'
                              ? html`
                                  <button
                                    class="sm"
                                    style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                    title="Confirm physical handover and mark book sold"
                                    @click=${async () => {
                                      await api.confirmHandover({
                                        itemId: m.matchedItemId || '',
                                        demandId: m.demandId,
                                      });
                                      setBannerMessage('Handover confirmed! Book marked as sold.');
                                      await loadData();
                                    }}
                                  >
                                    Mark Sold
                                  </button>
                                `
                              : ''
                          }
                          ${
                            isExpired
                              ? html`
                                  <button
                                    class="secondary sm"
                                    style="font-size:0.72rem;padding:4px 8px;"
                                    title="Release expired hold back to active community inventory"
                                    @click=${async () => {
                                      await api.releaseHold({
                                        itemId: m.matchedItemId,
                                        demandId: m.demandId,
                                      });
                                      setBannerMessage(
                                        'Hold released! Book returned to active catalog.'
                                      );
                                      await loadData();
                                    }}
                                  >
                                    🔄 Release Hold
                                  </button>
                                `
                              : ''
                          }
                          <button
                            class="danger sm"
                            style="font-size:0.72rem;padding:4px 8px;"
                            title="Delete demand"
                            @click=${() => handleDeleteDemand(m.demandId)}
                          >
                            Delete
                          </button>
                        </div>
                      </div>
                    </div>
                  `;
                })}
              </div>
            `
      }
    </div>
  `;
}

// ─── Tab View: Webhook & Simulations ──────────────────────────────────────────

function renderWebhookTab() {
  return html`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <div class="card">
        <h3>⚡ WhatsApp Webhook Controls & Live Simulator</h3>
        <p style="margin:4px 0 20px 0;font-size:0.92rem;color:var(--text-muted);">
          Simulate inbound parent WhatsApp group messages, media uploads, and test API Gateway
          webhook verification handshakes.
        </p>

        <div
          style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;"
        >
          <!-- Simulation 1: Inbound Book Offer -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                📦 Inbound Book Listing (Offer)
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate parent sending "Year 5 Chemistry Textbook" with photo cover.
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('Year 5 Chemistry Textbook - Pristine Condition')}
            >
              Simulate "Year 5 Chemistry"
            </button>
          </div>

          <!-- Simulation 2: Inbound High School CS -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                💻 Computer Science Book
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate parent offering "Year 12 Computer Science" textbook.
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('I have Year 12 Computer Science Book')}
            >
              Simulate "Year 12 CS"
            </button>
          </div>

          <!-- Simulation 3: Bilingual French Message -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                🇫🇷 French Message (Collège)
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate French parent offering "Manuel de Physique 3ème".
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia("J'ai un livre de physique pour la classe de 3ème")}
            >
              Simulate "Physique 3ème"
            </button>
          </div>

          <!-- Simulation 4: Clarification Flow -->
          <div
            style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;"
          >
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">
                ❓ Year Clarification Prompt
              </div>
              <div style="font-size:0.83rem;color:var(--text-muted);">
                Simulate offer with missing school year (triggers conversational clarification).
              </div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('I have Chemistry books available for anyone who wants them')}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div
          style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;"
        >
          <button @click=${handleWebhookHandshake}>
            🔗 Test GET Webhook Handshake (hub.challenge)
          </button>
          <button class="secondary" @click=${handleTestHmacValidation}>
            🔐 Test HMAC-SHA256 Payload Signature
          </button>
        </div>
      </div>
    </div>
  `;
}

// ─── Tab View: Telemetry & Observability ───────────────────────────────────────

function renderObservabilityTab() {
  return html`
    <div style="display:flex;flex-direction:column;gap:24px;">
      <!-- Enterprise Security & Governance Overview -->
      <div class="card" style="border-left: 4px solid var(--accent, #6366f1)">
        <div
          style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;"
        >
          <div>
            <h3 style="margin:0 0 4px 0;">Enterprise Security, Governance & Observability</h3>
            <p style="margin:0;font-size:0.9rem;color:var(--text-muted);">
              Real-time telemetry, perimeter defense, encryption at rest, and Bedrock Guardrails.
            </p>
          </div>
          <button class="secondary sm" @click=${handleTestHmacValidation}>🔐 Validate HMAC</button>
        </div>

        <div
          style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-top:18px;"
        >
          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Perimeter Defense
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#10b981;">
              🛡️ AWS WAF & Rate Limit
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              2,000 req/5min per IP
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Data Governance
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#3b82f6;">
              🔒 Bedrock Guardrails
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              PII Redaction (Phone, Address)
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Encryption & Storage
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#a855f7;">
              🔑 AWS KMS CMK
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              30-Day S3 Image Expiration
            </div>
          </div>

          <div
            style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);"
          >
            <div
              style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;"
            >
              Telemetry & Observability
            </div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#f59e0b;">
              📊 X-Ray Tracing + EMF
            </div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">
              Zero-latency CloudWatch EMF
            </div>
          </div>
        </div>
      </div>

      <!-- EventBridge Lifecycle Stream -->
      <div class="card">
        <div class="card-header">
          <div>
            <h3>EventBridge Lifecycle Stream</h3>
            <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
              Real-time events: ProcessingStarted, ExtractionComplete, MatchFound, S3VectorIngested.
            </p>
          </div>
          <button class="secondary sm" @click=${loadData}>🔄 Refresh Stream</button>
        </div>

        <div class="terminal-log">
          ${
            events.length === 0
              ? html`<div style="color:var(--text-muted);padding:12px 0;">
                  Waiting for lifecycle events...
                </div>`
              : events
                  .slice()
                  .reverse()
                  .map(
                    (e) => html`
                      <div class="log-entry">
                        <span class="log-time"
                          >[${new Date(e.timestamp).toLocaleTimeString([], { hour12: false, hour: '2-digit', minute: '2-digit', second: '2-digit' })}]</span
                        >
                        <span class="log-type">${e.eventType}</span>
                        <span class="log-details">${JSON.stringify(e.details)}</span>
                      </div>
                    `
                  )
          }
        </div>
      </div>
    </div>
  `;
}

// ─── Relay Learn: AI Socratic Tutor Tab ──────────────────────────────────────

function renderRelayLearnTab() {
  const stats = learningStats || {
    totalStudents: 0,
    totalQuestions: 0,
    totalCorrect: 0,
    totalPoints: 0,
    accuracyRate: 0,
    activeTracks: [
      { id: 'math_shapes', name: '2-D Everyday Shapes (Visual CPA)', students: 0, lessons: 1 },
      { id: 'cs_unplugged', name: 'CS Unplugged (CC BY-SA 4.0)', students: 0, lessons: 3 },
      { id: 'math_foundations', name: 'OSSU Pre-College Math (MIT)', students: 0, lessons: 2 },
      { id: 'digital_literacy', name: 'Literacy for Kids (CC BY-NC-SA 4.0)', students: 0, lessons: 2 },
      { id: 'stem_openstax', name: 'OpenStax STEM Calculus (CC BY 4.0)', students: 0, lessons: 1 },
    ],
    recentAchievements: [],
  };

  return html`
    <div style="display: flex; flex-direction: column; gap: 24px;">
      <!-- Hero Banner -->
      <div class="card" style="background: linear-gradient(135deg, #1e1b4b 0%, #312e81 50%, #4338ca 100%); color: white; border: 1px solid rgba(99, 102, 241, 0.4); padding: 28px; border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: flex-start; flex-wrap: wrap; gap: 16px;">
          <div>
            <div style="display: inline-flex; align-items: center; gap: 8px; background: rgba(99, 102, 241, 0.3); padding: 4px 12px; border-radius: 999px; font-size: 12px; font-weight: 600; text-transform: uppercase; letter-spacing: 0.05em; margin-bottom: 12px; border: 1px solid rgba(255, 255, 255, 0.2);">
              <span>🏆 AWS "Zero to Shipped" Hackathon Entry</span>
            </div>
            <h2 style="font-size: 28px; font-weight: 800; margin: 0 0 8px 0; color: #ffffff;">
              Relay Learn: Socratic AI WhatsApp Tutor
            </h2>
            <p style="font-size: 15px; color: #c7d2fe; max-width: 680px; margin: 0; line-height: 1.6;">
              Self-paced micro-learning via WhatsApp. Powered exclusively by verified open-source educational repositories ingested into <strong>Amazon Bedrock S3 Vectors</strong> & <strong>DynamoDB</strong> with zero synthetic/mocked statistics.
            </p>
          </div>
          <div style="display: flex; flex-direction: column; gap: 10px;">
            <a
              href="https://wa.me/1251548201371379?text=learn"
              target="_blank"
              rel="noopener noreferrer"
              class="btn"
              style="background: #22c55e; color: white; font-weight: 700; padding: 12px 20px; border-radius: 12px; text-decoration: none; display: inline-flex; align-items: center; gap: 8px; box-shadow: 0 4px 14px rgba(34, 197, 94, 0.4);"
            >
              <span>💬 Test Live on WhatsApp</span>
              <span>📱</span>
            </a>
            <span style="font-size: 12px; color: #a5b4fc; text-align: center;">Send "learn" or "#learn"</span>
          </div>
        </div>
      </div>

      <!-- Real-Time Database Metrics Overview (100% Real DynamoDB Data) -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(220px, 1fr)); gap: 16px;">
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Active Students</div>
            <span style="font-size: 10px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">DYNAMODB</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #38bdf8; margin-top: 6px;">${stats.totalStudents}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Verified registered profiles</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Questions Answered</div>
            <span style="font-size: 10px; color: #a855f7; background: rgba(168, 85, 247, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">INBOUND</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #a855f7; margin-top: 6px;">${stats.totalQuestions}</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Real student interactions</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Mastery Accuracy</div>
            <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">VERIFIED</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #22c55e; margin-top: 6px;">${stats.accuracyRate}%</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">${stats.totalCorrect} correct answers</div>
        </div>
        <div class="card" style="padding: 20px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 12px;">
          <div style="display: flex; justify-content: space-between; align-items: center;">
            <div style="font-size: 12px; color: #94a3b8; font-weight: 600; text-transform: uppercase;">Total XP Earned</div>
            <span style="font-size: 10px; color: #eab308; background: rgba(234, 179, 8, 0.15); padding: 1px 6px; border-radius: 4px; font-weight: 700;">POINTS</span>
          </div>
          <div style="font-size: 32px; font-weight: 800; color: #eab308; margin-top: 6px;">${stats.totalPoints.toLocaleString()} pts</div>
          <div style="font-size: 12px; color: #64748b; margin-top: 4px;">Earned across active sessions</div>
        </div>
      </div>

      <!-- S3 Vector Semantic Search & Knowledge Base Query -->
      <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(99, 102, 241, 0.3); border-radius: 16px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 12px; flex-wrap: wrap; gap: 8px;">
          <div style="font-size: 17px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
            <span>🔍 Bedrock S3 Vector Knowledge Base Explorer</span>
          </div>
          <span style="font-size: 11px; color: #38bdf8; background: rgba(56, 189, 248, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600;">
            Source: ./knowledge (*.md) via Titan Text Embeddings
          </span>
        </div>
        <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
          Query the raw Markdown educational repositories ingested directly into Amazon S3 vector storage:
        </p>
        <div style="display: flex; gap: 10px; margin-bottom: 16px;">
          <input
            type="text"
            placeholder="e.g. binary dot cards, barter trade and double coincidence, fractions of a set, velocity rate of change..."
            style="flex: 1; padding: 10px 14px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.15); border-radius: 8px; color: #ffffff; font-size: 13px;"
            .value=${vectorSearchQuery}
            @input=${(e: any) => { vectorSearchQuery = e.target.value; }}
            @keydown=${(e: KeyboardEvent) => { if (e.key === 'Enter') executeVectorSearch(); }}
          />
          <button
            class="btn"
            style="background: #6366f1; color: white; font-weight: 700; padding: 10px 18px; border-radius: 8px; white-space: nowrap;"
            ?disabled=${vectorSearching}
            @click=${() => executeVectorSearch()}
          >
            ${vectorSearching ? 'Searching...' : 'Search Vectors 🔍'}
          </button>
        </div>

        ${vectorSearchResults.length > 0
          ? html`
              <div style="display: flex; flex-direction: column; gap: 10px;">
                <div style="font-size: 12px; color: #64748b; font-weight: 600; text-transform: uppercase;">
                  Retrieved S3 Vector Chunks (${vectorSearchResults.length} Results):
                </div>
                ${vectorSearchResults.map(
                  (res) => html`
                    <div style="background: #0f172a; border-radius: 8px; padding: 14px; border: 1px solid rgba(255, 255, 255, 0.08); font-size: 13px;">
                      <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 8px;">
                        <span style="font-family: monospace; color: #38bdf8; font-size: 11px;">${res.location || 'S3 Vector Chunk'}</span>
                        ${res.score !== undefined ? html`<span style="color: #22c55e; font-size: 11px; font-weight: 700;">Score: ${(res.score * 100).toFixed(1)}%</span>` : ''}
                      </div>
                      <div style="color: #cbd5e1; line-height: 1.5; white-space: pre-wrap; font-family: monospace; font-size: 12px;">${res.content}</div>
                    </div>
                  `
                )}
              </div>
            `
          : ''}
      </div>

      <!-- Interactive Web Simulator & Live Curriculum Columns -->
      <div style="display: grid; grid-template-columns: repeat(auto-fit, minmax(360px, 1fr)); gap: 20px;">
        <!-- Left: Interactive WhatsApp Tutor Simulator -->
        <div class="card" style="padding: 24px; background: #0f172a; border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
          <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 16px;">
            <div style="font-size: 18px; font-weight: 700; color: #ffffff; display: flex; align-items: center; gap: 8px;">
              <span>📱 In-Browser WhatsApp Simulator</span>
            </div>
            <span style="font-size: 12px; color: #22c55e; background: rgba(34, 197, 94, 0.15); padding: 2px 8px; border-radius: 6px; font-weight: 600;">LIVE API</span>
          </div>

          <!-- Track Selector -->
          <div style="display: flex; gap: 8px; margin-bottom: 16px; flex-wrap: wrap;">
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${simTrack === 'math_shapes' ? 'background: #6366f1; color: white;' : 'background: #1e293b; color: #94a3b8;'}"
              @click=${() => {
                simTrack = 'math_shapes';
                startSimSession();
              }}
            >
              📐 2-D Shapes (Visual)
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${simTrack === 'cs_unplugged' ? 'background: #6366f1; color: white;' : 'background: #1e293b; color: #94a3b8;'}"
              @click=${() => {
                simTrack = 'cs_unplugged';
                startSimSession();
              }}
            >
              💻 CS Unplugged
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${simTrack === 'math_foundations' ? 'background: #6366f1; color: white;' : 'background: #1e293b; color: #94a3b8;'}"
              @click=${() => {
                simTrack = 'math_foundations';
                startSimSession();
              }}
            >
              🔢 Math Mastery
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${simTrack === 'digital_literacy' ? 'background: #6366f1; color: white;' : 'background: #1e293b; color: #94a3b8;'}"
              @click=${() => {
                simTrack = 'digital_literacy';
                startSimSession();
              }}
            >
              💡 Digital Safety
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; ${simTrack === 'stem_openstax' ? 'background: #6366f1; color: white;' : 'background: #1e293b; color: #94a3b8;'}"
              @click=${() => {
                simTrack = 'stem_openstax';
                startSimSession();
              }}
            >
              📈 STEM OpenStax
            </button>
            <button
              class="btn"
              style="padding: 6px 12px; font-size: 12px; border-radius: 8px; background: linear-gradient(135deg, #10b981, #059669); color: white; font-weight: 700; border: none; cursor: pointer; display: flex; align-items: center; gap: 6px;"
              ?disabled=${autogenLoading}
              @click=${() => triggerAutogen(simTrack)}
            >
              <span>${autogenLoading ? '⏳' : '⚡'}</span>
              <span>${autogenLoading ? 'Generating...' : 'Autogen This Subject'}</span>
            </button>
          </div>

          <!-- Autogen Live Progress Banner -->
          ${autogenStatusText
            ? html`
                <div style="padding: 8px 12px; border-radius: 8px; background: rgba(16, 185, 129, 0.15); border: 1px solid rgba(16, 185, 129, 0.3); color: #34d399; font-size: 12px; font-weight: 600; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
                  <span>⚙️</span>
                  <span>${autogenStatusText}</span>
                </div>
              `
            : ''}

          <!-- WhatsApp Chat Bubble Window -->
          <div style="background: #0b141a; border-radius: 12px; padding: 16px; border: 1px solid rgba(255, 255, 255, 0.08); min-height: 280px; display: flex; flex-direction: column; justify-content: space-between;">
            <div>
              ${simLoading
                ? html`<div style="color: #94a3b8; font-style: italic; text-align: center; padding: 40px 0;">🤖 Relay Tutor is retrieving curriculum from DynamoDB...</div>`
                : simActiveCard
                  ? html`
                      ${simActiveCard.imageUrl
                        ? html`
                            <div style="margin-bottom: 12px; text-align: center; background: #000; border-radius: 10px; overflow: hidden; border: 1px solid rgba(255,255,255,0.15);">
                              <img
                                src="${simActiveCard.imageUrl}"
                                alt="Visual Task Diagram"
                                style="max-height: 240px; width: 100%; object-fit: contain; display: block;"
                              />
                            </div>
                          `
                        : ''}

                      <div style="background: #202c33; color: #e9edef; padding: 14px; border-radius: 10px; font-family: monospace; font-size: 13px; line-height: 1.5; white-space: pre-wrap; margin-bottom: 12px; border-left: 4px solid #6366f1;">
${simActiveCard.text}
                      </div>

                      <!-- Warmup Step Button -->
                      ${simActiveCard.interactive?.action?.buttons?.[0]?.reply?.id === 'learn_warmup_start' || (simActiveCard.text && simActiveCard.text.includes("warm up"))
                        ? html`
                            <button
                              class="btn"
                              style="width: 100%; background: #22c55e; color: white; font-weight: 700; padding: 12px; border-radius: 8px; margin-top: 8px; font-size: 14px;"
                              @click=${async () => {
                                simLoading = true;
                                redraw();
                                try {
                                  simActiveCard = {
                                    imageUrl: 'https://d3cdc2mtpqk5ut.cloudfront.net/lessons/shapes_2d.jpg',
                                    text: '━━━━━━━━━━━━━━━━━━━━━━\n📐 *Everyday Shapes • 2-D Shapes in Everyday Life*\n[ 🟩 ⬜ ⬜ ] 33% • Streak: 🔥 1 day\n━━━━━━━━━━━━━━━━━━━━━━\n\n2-D shapes are flat shapes that have only length and width. Look at the labeled shapes diagram! 📐\n\n❓ *Task:*\nLook at the diagram. Which shape has exactly 3 straight sides?\n\nA) Triangle\nB) Circle\nC) Square\nD) Rectangle\n\n👇 _Reply A, B, C, or D (or tap a button below)_\n_Tip: Type "hint" if you are stuck!_',
                                  };
                                } finally {
                                  simLoading = false;
                                  redraw();
                                }
                              }}
                            >
                              🚀 Start lesson!
                            </button>
                          `
                        : ''}

                      <!-- Interactive Quick-Reply Feedback -->
                      ${simFeedback
                        ? html`
                            <div style="background: ${simFeedback.isCorrect ? 'rgba(34, 197, 94, 0.2)' : 'rgba(239, 68, 68, 0.2)'}; border: 1px solid ${simFeedback.isCorrect ? '#22c55e' : '#ef4444'}; color: #e9edef; padding: 12px; border-radius: 8px; font-size: 13px; margin-bottom: 12px; white-space: pre-wrap;">
${simFeedback.text}
                            </div>
                            ${simFeedback.interactiveButton
                              ? html`
                                  <button
                                    class="btn"
                                    style="width: 100%; background: #6366f1; color: white; font-weight: 700; padding: 10px; border-radius: 8px; margin-top: 8px;"
                                    @click=${() => handleSimNext()}
                                  >
                                    ${simFeedback.interactiveButton.title}
                                  </button>
                                `
                              : ''}
                          `
                        : ''}

                      ${!simFeedback?.isCorrect && !(simActiveCard.text && simActiveCard.text.includes("warm up"))
                        ? html`
                            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 8px; margin-top: 10px;">
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${() => submitSimChoice(0)}
                              >
                                🔘 Choice A
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${() => submitSimChoice(1)}
                              >
                                🔘 Choice B
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${() => submitSimChoice(2)}
                              >
                                🔘 Choice C
                              </button>
                              <button
                                class="btn"
                                style="background: #111b21; color: #53bdeb; border: 1px solid rgba(83, 189, 235, 0.4); text-align: left; padding: 10px 14px; border-radius: 8px; font-size: 13px;"
                                @click=${() => submitSimChoice(3)}
                              >
                                🔘 Choice D
                              </button>
                            </div>
                          `
                        : ''}
                    `
                  : html`
                      <div style="text-align: center; padding: 40px 20px; color: #94a3b8;">
                        <p style="font-size: 14px; margin-bottom: 16px;">Test the Socratic learning experience directly inside this browser window:</p>
                        <button
                          class="btn"
                          style="background: #6366f1; color: white; font-weight: 700; padding: 10px 20px; border-radius: 8px;"
                          @click=${() => startSimSession()}
                        >
                          Start Interactive Lesson 🚀
                        </button>
                      </div>
                    `}
            </div>
          </div>

          <!-- Quick WhatsApp Autogen Commands Palette -->
          <div style="margin-top: 12px; display: flex; gap: 8px; flex-wrap: wrap; align-items: center;">
            <span style="font-size: 11px; color: #94a3b8; font-weight: 600;">⚡ Background Commands:</span>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${() => triggerAutogen('shapes')}
            >
              📐 #generate shapes
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${() => triggerAutogen('math')}
            >
              🔢 #generate math
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${() => triggerAutogen('cs')}
            >
              💻 #generate cs
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${() => triggerAutogen('digital')}
            >
              💡 #generate digital
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: #1e293b; color: #cbd5e1; border: 1px solid rgba(255,255,255,0.1); cursor: pointer;"
              @click=${() => triggerAutogen('stem')}
            >
              📈 #generate stem
            </button>
            <button
              class="btn sm"
              style="font-size: 11px; padding: 4px 10px; border-radius: 6px; background: linear-gradient(135deg, rgba(99,102,241,0.3), rgba(168,85,247,0.3)); color: #e2e8f0; border: 1px solid rgba(168,85,247,0.4); cursor: pointer; font-weight: 700;"
              @click=${() => triggerAutogen('all')}
            >
              🌟 #generate all
            </button>
          </div>
        </div>

        <!-- Right: Accredited Open-Source Repositories (Grounding Sources) -->
        <div style="display: flex; flex-direction: column; gap: 16px;">
          <!-- Open Source Curriculum Box -->
          <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
            <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>📚 Open-Source Curricula Sources (Vector DB)</span>
            </div>
            <p style="font-size: 13px; color: #94a3b8; margin: 0 0 16px 0; line-height: 1.5;">
              Grounding LLM reasoning in verified K–12 open-source Markdown repositories to guarantee pedagogical rigor without hallucination:
            </p>
            <div style="display: flex; flex-direction: column; gap: 10px;">
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #38bdf8;">CS Unplugged (CC BY-SA 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/uccser/cs-unplugged • Binary, searching, error detection</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #a855f7;">OSSU Pre-College Math (MIT)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/ossu/precollege-math • Arithmetic, fractions, pre-algebra</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #eab308;">Literacy for Kids (CC BY-NC-SA 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/literacy-for-kids • Computer & financial barter literacy</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
              <div style="padding: 10px 14px; background: #0f172a; border-radius: 8px; border: 1px solid rgba(255, 255, 255, 0.05); font-size: 13px; display: flex; justify-content: space-between; align-items: center;">
                <div>
                  <strong style="color: #ec4899;">OpenStax STEM Calculus (CC BY 4.0)</strong>
                  <div style="font-size: 11px; color: #64748b;">github.com/philschatz/calculus-book • Rates of change & velocity</div>
                </div>
                <span style="font-size: 10px; color: #22c55e; background: rgba(34, 197, 94, 0.1); padding: 2px 6px; border-radius: 4px; font-weight: 700;">S3 VECTOR</span>
              </div>
            </div>
          </div>

          <!-- Hackathon Zero to Shipped Architecture Card -->
          <div class="card" style="padding: 24px; background: rgba(30, 41, 59, 0.7); border: 1px solid rgba(255, 255, 255, 0.1); border-radius: 16px;">
            <div style="font-size: 17px; font-weight: 700; color: #ffffff; margin-bottom: 12px; display: flex; align-items: center; gap: 8px;">
              <span>⚙️ AWS Zero to Shipped Architecture</span>
            </div>
            <div style="display: grid; grid-template-columns: 1fr 1fr; gap: 10px; font-size: 12px;">
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Vector Retrieval</div>
                <div style="color: #ffffff; font-weight: 700;">S3 Vectors + Bedrock KB</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Database Layer</div>
                <div style="color: #ffffff; font-weight: 700;">DynamoDB (3 Tables)</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Pedagogy Engine</div>
                <div style="color: #ffffff; font-weight: 700;">Socratic & TaRL Method</div>
              </div>
              <div style="background: #0f172a; padding: 10px; border-radius: 8px;">
                <div style="color: #94a3b8;">Agent Toolkit</div>
                <div style="color: #ffffff; font-weight: 700;">AWS IAM Caller Verified</div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  `;
}

// ─── Main Application Render Loop ─────────────────────────────────────────────

function redraw() {
  render(
    html`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${
          statusMessage
            ? html`
                <div class="status-banner">
                  <div style="display:flex;align-items:center;gap:10px;">
                    <span style="font-size:1.1rem;">🔔</span>
                    <span>${statusMessage}</span>
                  </div>
                  <button
                    class="secondary sm"
                    style="padding:2px 8px;font-size:0.75rem;"
                    @click=${() => {
                      statusMessage = '';
                      redraw();
                    }}
                  >
                    ✕
                  </button>
                </div>
              `
            : ''
        }

        <!-- Top Level Stats Summary -->
        ${renderStatsOverview()}

        <!-- Tab Bar Navigation -->
        ${renderTabsNavigation()}

        <!-- Active Tab Content -->
        ${
          activeTab === 'available'
            ? renderAvailableBooksTab()
            : activeTab === 'pendings'
              ? renderPendingDemandsTab()
              : activeTab === 'matches'
                ? renderMatchedDemandsTab()
                : activeTab === 'webhook'
                  ? renderWebhookTab()
                  : activeTab === 'learn'
                    ? renderRelayLearnTab()
                    : renderObservabilityTab()
        }
      </div>
    `,
    appEl
  );
}

// Initial Data Load
loadData();
