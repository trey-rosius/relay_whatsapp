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

type ActiveTab = 'available' | 'pendings' | 'matches' | 'webhook' | 'observability';
type ViewGrouping = 'all' | 'by-subject' | 'by-class';
type DatePreset = 'all' | 'today' | '7days' | '30days' | 'custom';

// ─── Application State ────────────────────────────────────────────────────────

let activeTab: ActiveTab = 'available';
let viewGrouping: ViewGrouping = 'all';

let inventory: ActiveInventoryItem[] = [];
let demands: DemandItem[] = [];
let events: LifecycleEvent[] = [];
let securityStatus: SecurityObservabilityStatus | null = null;
let supplyGaps: SupplyGapsData | null = null;

let isLoading = false;
let statusMessage = '';
let statusTimeout: any = null;

// Filter & Sort State
let searchQuery = '';
let filterDomain: string = 'all';
let filterClass: string = 'all';
let filterCondition: string = 'all';
let filterSeller: string = 'all';
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
    case 'Mathematics': return 'badge-math';
    case 'Science': return 'badge-science';
    case 'Languages': return 'badge-languages';
    case 'Humanities': return 'badge-humanities';
    case 'Arts': return 'badge-arts';
    default: return 'badge-active';
  }
}

function getClassBadgeClass(category: string): string {
  switch (category) {
    case 'PrimarySchool': return 'badge-primary';
    case 'MiddleSchool': return 'badge-middle';
    case 'HighSchool': return 'badge-high';
    case 'UniversityPrep': return 'badge-uniprep';
    default: return 'badge-active';
  }
}

function getHumanClassLabel(category: string): string {
  switch (category) {
    case 'PrimarySchool': return 'Primary (Years 1-6)';
    case 'MiddleSchool': return 'Middle School (Years 7-9)';
    case 'HighSchool': return 'High School (Years 10-13)';
    case 'UniversityPrep': return 'Uni Prep';
    default: return category || 'General';
  }
}

// ─── Feature 3D: Verified Condition Badges ─────────────────────────────────────

function renderConditionBadge(condition: string) {
  switch (condition) {
    case 'New':
      return html`
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">
          Verified New
        </span>
      `;
    case 'LikeNew':
      return html`
        <span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);">
          Like New
        </span>
      `;
    case 'Good':
      return html`
        <span class="badge" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);">
          Good Condition
        </span>
      `;
    case 'Acceptable':
      return html`
        <span class="badge" style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);">
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
    .filter(item => {
      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (item.title && item.title.toLowerCase().includes(q)) ||
          (item.concept && item.concept.toLowerCase().includes(q)) ||
          (item.description && item.description.toLowerCase().includes(q)) ||
          (item.domain && item.domain.toLowerCase().includes(q)) ||
          (item.providerCategory && item.providerCategory.toLowerCase().includes(q)) ||
          (item.sellerPhone && item.sellerPhone.toLowerCase().includes(q));
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

function filterDemandItems(items: DemandItem[], status: 'pending' | 'matched'): DemandItem[] {
  return items
    .filter(item => {
      if (item.status !== status) return false;

      // Search text filter
      if (searchQuery.trim()) {
        const q = searchQuery.toLowerCase().trim();
        const matchesSearch =
          (item.requestedQuery && item.requestedQuery.toLowerCase().includes(q)) ||
          (item.concept && item.concept.toLowerCase().includes(q)) ||
          (item.domain && item.domain.toLowerCase().includes(q)) ||
          (item.userPhone && item.userPhone.toLowerCase().includes(q));
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
      const timeA = a.createdAt || 0;
      const timeB = b.createdAt || 0;
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
  if (datePreset !== 'all') count++;
  return count;
}

function resetAllFilters() {
  searchQuery = '';
  filterDomain = 'all';
  filterClass = 'all';
  filterCondition = 'all';
  filterSeller = 'all';
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
    securityStatus = (sec as SecurityObservabilityStatus) || null;
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
    const response = await api.verifyWebhook('subscribe', 'my_verify_token_123', `challenge_${Date.now()}`);
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
      setBannerMessage(`ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!`);
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

async function handleAddWishlistDemand(concept: string, query: string, domain: string = 'Mathematics', phone: string = '+15550199002') {
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
    demands = demands.filter(d => d.demandId !== demandId);
    redraw();
  } catch (err: any) {
    setBannerMessage(`❌ Error removing demand: ${err.message}`);
  }
}

async function handleDeleteInventory(itemId: string) {
  try {
    await api.deleteInventory(itemId);
    setBannerMessage(`🗑️ Removed inventory item.`);
    inventory = inventory.filter(i => i.itemId !== itemId);
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
      .map(b => b.toString(16).padStart(2, '0'))
      .join('');

    const res = await api.validateSignature(testPayload, `sha256=${hexSignature}`, testSecret);
    if (res.valid) {
      setBannerMessage(`🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified.`);
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
  const pendingCount = demands.filter(d => d.status === 'pending').length;
  const matchedCount = demands.filter(d => d.status === 'matched').length;
  const availableCount = inventory.length;
  const eventsCount = events.length;

  return html`
    <div class="stats-row">
      <div class="stat-card" style="cursor:pointer;" @click=${() => { activeTab = 'available'; redraw(); }}>
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${availableCount}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${() => { activeTab = 'pendings'; redraw(); }}>
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${pendingCount}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${() => { activeTab = 'matches'; redraw(); }}>
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${matchedCount}</div>
          <div class="stat-label">Matched Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${() => { activeTab = 'observability'; redraw(); }}>
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
  const pendingCount = demands.filter(d => d.status === 'pending').length;
  const matchedCount = demands.filter(d => d.status === 'matched').length;
  const availableCount = inventory.length;

  return html`
    <div class="tabs-nav">
      <button
        class="tab-btn ${activeTab === 'available' ? 'active' : ''}"
        @click=${() => { activeTab = 'available'; redraw(); }}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${availableCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'pendings' ? 'active' : ''}"
        @click=${() => { activeTab = 'pendings'; redraw(); }}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${pendingCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'matches' ? 'active' : ''}"
        @click=${() => { activeTab = 'matches'; redraw(); }}
      >
        <span>🤝 Matched Pairs</span>
        <span class="tab-count">${matchedCount}</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'webhook' ? 'active' : ''}"
        @click=${() => { activeTab = 'webhook'; redraw(); }}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${activeTab === 'observability' ? 'active' : ''}"
        @click=${() => { activeTab = 'observability'; redraw(); }}
      >
        <span>📊 Observability & Stream</span>
      </button>
    </div>
  `;
}

// ─── Feature 3B: Supply Gaps Banner Widget ─────────────────────────────────────

function renderSupplyGapsBanner() {
  if (!supplyGaps) return '';

  return html`
    <div class="card" style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">Community Supply Deficit Alert (Feature 3B)</h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in: 
            <strong>${supplyGaps.deficitSubjects.map(s => `${s.domain} (${s.count})`).join(', ')}</strong> 
            and grades <strong>${supplyGaps.deficitGrades.map(g => g.grade).join(', ')}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${() => {
              setBannerMessage(`📢 Broadcast Dispatched to WhatsApp Group: "${supplyGaps?.broadcastMessageEn}"`);
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
  const distinctSellers = Array.from(new Set(inventory.map(i => i.sellerPhone).filter(Boolean)));

  return html`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or phone..."
            .value=${searchQuery}
            @input=${(e: any) => { searchQuery = e.target.value; redraw(); }}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${filterDomain}
          @change=${(e: any) => { filterDomain = e.target.value; redraw(); }}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${showClassFilter
          ? html`
              <select
                class="filter-select"
                .value=${filterClass}
                @change=${(e: any) => { filterClass = e.target.value; redraw(); }}
              >
                <option value="all">🏫 All Classes / Levels</option>
                <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                <option value="UniversityPrep">🏛️ University Prep</option>
              </select>
            `
          : ''}

        <!-- Condition Selector (Feature 3D) -->
        ${showClassFilter
          ? html`
              <select
                class="filter-select"
                .value=${filterCondition}
                @change=${(e: any) => { filterCondition = e.target.value; redraw(); }}
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="LikeNew">Like New</option>
                <option value="Good">Good</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            `
          : ''}

        <!-- Seller Filter (Feature 3A) -->
        ${distinctSellers.length > 1
          ? html`
              <select
                class="filter-select"
                .value=${filterSeller}
                @change=${(e: any) => { filterSeller = e.target.value; redraw(); }}
              >
                <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                ${distinctSellers.map(
                  s => html`<option value="${s}">Seller: ${s}</option>`
                )}
              </select>
            `
          : ''}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${datePreset}
          @change=${(e: any) => { datePreset = e.target.value; redraw(); }}
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
          @click=${() => { sortDescending = !sortDescending; redraw(); }}
        >
          ${sortDescending ? '⬇️ Newest First' : '⬆️ Oldest First'}
        </button>

        <!-- Reset Button -->
        ${activeCount > 0
          ? html`
              <button class="danger sm" @click=${resetAllFilters}>
                ✕ Reset (${activeCount})
              </button>
            `
          : ''}
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${datePreset === 'custom'
        ? html`
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;">
              <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;">Custom Created Date:</span>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${customDateFrom}
                  @change=${(e: any) => { customDateFrom = e.target.value; redraw(); }}
                />
              </div>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${customDateTo}
                  @change=${(e: any) => { customDateTo = e.target.value; redraw(); }}
                />
              </div>
            </div>
          `
        : ''}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${['all', 'Mathematics', 'Science', 'Languages', 'Humanities', 'Arts'].map(
            dom => html`
              <button
                class="pill ${filterDomain === dom ? 'active' : ''}"
                @click=${() => { filterDomain = dom; redraw(); }}
              >
                ${dom === 'all' ? 'All Subjects' : dom}
              </button>
            `
          )}
        </div>

        ${showClassFilter
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
                  cls => html`
                    <button
                      class="pill ${filterClass === cls.id ? 'active' : ''}"
                      @click=${() => { filterClass = cls.id; redraw(); }}
                    >
                      ${cls.label}
                    </button>
                  `
                )}
              </div>
            `
          : ''}
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
          <h3>📚 Available Books Catalog</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Active inventory extracted from WhatsApp parent messages, categorized by class and subject (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <!-- View Grouping Selector -->
          <div style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;">
            <button
              class="sm ${viewGrouping === 'all' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => { viewGrouping = 'all'; redraw(); }}
            >
              Grid
            </button>
            <button
              class="sm ${viewGrouping === 'by-subject' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => { viewGrouping = 'by-subject'; redraw(); }}
            >
              By Subject
            </button>
            <button
              class="sm ${viewGrouping === 'by-class' ? '' : 'secondary'}"
              style="border-radius:6px;box-shadow:none;"
              @click=${() => { viewGrouping = 'by-class'; redraw(); }}
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
      ${renderSupplyGapsBanner()}

      ${renderFilterToolbar(true)}

      ${filtered.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">📖</div>
              <div class="empty-state-title">No books match your current filters</div>
              <div class="empty-state-text">
                Try clearing your search keyword, selecting "All Subjects" / "All Dates", or simulate a book upload in the Webhook tab.
              </div>
              <button class="secondary sm" style="margin-top:10px;" @click=${resetAllFilters}>
                Clear All Filters
              </button>
            </div>
          `
        : viewGrouping === 'all'
        ? html`
            <div class="items-grid">
              ${filtered.map(item => renderBookCard(item))}
            </div>
          `
        : viewGrouping === 'by-subject'
        ? renderGroupedBySubject(filtered)
        : renderGroupedByClass(filtered)}
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${renderStorefrontModal()}
  `;
}

function renderBookCard(item: ActiveInventoryItem) {
  return html`
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${item.title}</div>
          <div class="book-concept">${item.concept}</div>
        </div>
        <span class="badge ${getDomainBadgeClass(item.domain)}">
          ${item.domain}
        </span>
      </div>

      <div class="tags-row">
        <span class="badge ${getClassBadgeClass(item.providerCategory)}">
          ${getHumanClassLabel(item.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${renderConditionBadge(item.conditionType)}
      </div>

      ${item.description
        ? html`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${item.description}</div>`
        : ''}

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
              👨‍👩‍👧 ${item.sellerPhone || 'Parent'} Storefront
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
      ${domains.map(dom => {
        const groupItems = items.filter(i => i.domain === dom);
        if (groupItems.length === 0) return '';
        return html`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${dom}</h4>
              <span class="badge ${getDomainBadgeClass(dom)}">${groupItems.length} Available</span>
            </div>
            <div class="items-grid">
              ${groupItems.map(item => renderBookCard(item))}
            </div>
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
      ${categories.map(cat => {
        const groupItems = items.filter(i => i.providerCategory === cat.key);
        if (groupItems.length === 0) return '';
        return html`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${cat.label}</h4>
              <span class="badge ${getClassBadgeClass(cat.key)}">${groupItems.length} Available</span>
            </div>
            <div class="items-grid">
              ${groupItems.map(item => renderBookCard(item))}
            </div>
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
      @click=${(e: any) => { if (e.target === e.currentTarget) { showStorefrontModal = false; redraw(); } }}
    >
      <div class="card" style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;">
        ${isLoadingStorefront
          ? html`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">Loading Family Storefront...</div>`
          : selectedStorefront
          ? html`
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">
                <div>
                  <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;">
                    👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                  </div>
                  <h3 style="font-size:1.4rem;">Parent Storefront: ${selectedStorefront.sellerPhone}</h3>
                  <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                    Total <strong>${selectedStorefront.totalBooks} textbooks</strong> available across multiple grades.
                  </p>
                </div>
                <button class="secondary sm" @click=${() => { showStorefrontModal = false; redraw(); }}>
                  ✕ Close
                </button>
              </div>

              <!-- Grade Bundles Section -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📦 Available Grade Bundles</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;">
                  ${selectedStorefront.bundles.map(
                    b => html`
                      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;">
                        <div style="font-weight:700;font-size:0.95rem;color:#fff;">${b.grade} Bundle</div>
                        <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">${b.count} Books Available</div>
                        <button
                          class="secondary sm"
                          style="margin-top:8px;width:100%;font-size:0.72rem;"
                          @click=${() => {
                            setBannerMessage(`💬 WhatsApp Bundle Request sent to seller ${selectedStorefront?.sellerPhone} for all ${b.count} books in ${b.grade}!`);
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
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📖 All Books from this Parent</h4>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;">
                  ${selectedStorefront.items.map(
                    item => html`
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;">
                        <div>
                          <div style="font-weight:600;font-size:0.88rem;color:#fff;">${item.title}</div>
                          <div style="font-size:0.75rem;color:var(--text-dim);">${item.domain} &bull; ${item.concept}</div>
                        </div>
                        <div>
                          ${renderConditionBadge(item.conditionType)}
                        </div>
                      </div>
                    `
                  )}
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">
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
          : ''}
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
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="sm" @click=${() => { showAddDemandModal = true; redraw(); }}>
            + Create Demand
          </button>
          <button class="secondary sm" @click=${loadData}>
            ${isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
          </button>
        </div>
      </div>

      ${renderFilterToolbar(false)}

      ${pendings.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <div class="empty-state-title">No pending wishlists found</div>
              <div class="empty-state-text">
                All requests have either been matched or no parents are waiting for books right now.
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
                d => html`
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
                          Waiting Parent: <strong style="color:var(--text);">${d.userPhone}</strong>
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
          `}
    </div>

    <!-- Quick Add Demand Modal -->
    ${showAddDemandModal
      ? html`
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
            @click=${(e: any) => { if (e.target === e.currentTarget) { showAddDemandModal = false; redraw(); } }}
          >
            <div class="card" style="width:100%;max-width:480px;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.8);">
              <h3>Create Parent Wishlist Request</h3>
              <p style="margin:4px 0 18px 0;font-size:0.85rem;color:var(--text-muted);">
                Add a demand for a textbook that isn't currently in stock.
              </p>

              <div style="display:flex;flex-direction:column;gap:14px;">
                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Book Title / Request Query</label>
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
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Normalized Concept Key</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="e.g. Year10Physics"
                    style="padding-left:14px;"
                    .value=${newDemandConcept}
                    @input=${(e: any) => { newDemandConcept = e.target.value; }}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Subject Domain</label>
                  <select
                    class="filter-select"
                    style="width:100%;"
                    .value=${newDemandDomain}
                    @change=${(e: any) => { newDemandDomain = e.target.value; }}
                  >
                    <option value="Mathematics">Mathematics</option>
                    <option value="Science">Science</option>
                    <option value="Languages">Languages</option>
                    <option value="Humanities">Humanities</option>
                    <option value="Arts">Arts</option>
                  </select>
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Parent WhatsApp Phone Number</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="+15550199002"
                    style="padding-left:14px;"
                    .value=${newDemandPhone}
                    @input=${(e: any) => { newDemandPhone = e.target.value; }}
                  />
                </div>

                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                  <button class="secondary" @click=${() => { showAddDemandModal = false; redraw(); }}>
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
      : ''}
  `;
}

// ─── Tab View: Matched Demands ────────────────────────────────────────────────

function renderMatchedDemandsTab() {
  const matches = filterDemandItems(demands, 'matched');

  return html`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>🤝 Matched Pairs & Successful Connections</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Demands successfully connected with available books via the Proactive Bedrock Matchmaker (Sorted newest first).
          </p>
        </div>
        <button class="secondary sm" @click=${loadData}>
          ${isLoading ? '⏳ Refreshing...' : '🔄 Refresh'}
        </button>
      </div>

      ${renderFilterToolbar(false)}

      ${matches.length === 0
        ? html`
            <div class="empty-state">
              <div class="empty-state-icon">🤝</div>
              <div class="empty-state-title">No matched pairs found yet</div>
              <div class="empty-state-text">
                When a seller lists a book that matches a waiting parent's wishlist, it will be displayed here in real time.
              </div>
              <div style="margin-top:12px;display:flex;gap:10px;">
                <button
                  class="secondary sm"
                  @click=${async () => {
                    await handleAddWishlistDemand('Year8Science', 'Year 8 Science', 'Science', '+15559990001');
                    await handleSimulateInboundMedia('I have Year 8 Science textbook in great shape', '+15559990002');
                  }}
                >
                  ⚡ Run Auto-Match Simulation
                </button>
              </div>
            </div>
          `
        : html`
            <div class="items-grid">
              ${matches.map(
                m => html`
                  <div class="item-card" style="border-left: 3px solid var(--success);">
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${m.requestedQuery}</div>
                        <div class="book-concept">Concept: ${m.concept}</div>
                      </div>
                      <span class="badge badge-matched">${m.status === 'fulfilled' ? 'COMPLETED / SOLD' : '48H HOLD'}</span>
                    </div>

                    <div class="tags-row">
                      <span class="badge ${getDomainBadgeClass(m.domain)}">
                        ${m.domain || 'Marketplace'}
                      </span>
                      ${m.handoverCode
                        ? html`<span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);">Code: #${m.handoverCode}</span>`
                        : ''}
                    </div>

                    <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:10px 12px;border-radius:8px;font-size:0.83rem;color:#6ee7b7;">
                      ${m.status === 'fulfilled'
                        ? 'Handover completed! Book marked as sold and removed from active catalog.'
                        : '48-Hour Reservation Active. Matched parents introduced via WhatsApp.'}
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Recipient Parent: <strong style="color:var(--text);">${m.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${formatExactDate(m.createdAt)}">
                          ${formatRelativeTime(m.createdAt)} (${formatExactDate(m.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        ${m.status !== 'fulfilled'
                          ? html`
                              <button
                                class="sm"
                                style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                title="Confirm physical handover and mark book sold"
                                @click=${async () => {
                                  await api.confirmHandover({ itemId: m.matchedItemId || '', demandId: m.demandId });
                                  setBannerMessage('Handover confirmed! Book marked as sold.');
                                  await loadData();
                                }}
                              >
                                Mark Sold
                              </button>
                            `
                          : ''}
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
                `
              )}
            </div>
          `}
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
          Simulate inbound parent WhatsApp group messages, media uploads, and test API Gateway webhook verification handshakes.
        </p>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(280px, 1fr));gap:16px;">
          <!-- Simulation 1: Inbound Book Offer -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">📦 Inbound Book Listing (Offer)</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate parent sending "Year 5 Chemistry Textbook" with photo cover.</div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('Year 5 Chemistry Textbook - Pristine Condition')}
            >
              Simulate "Year 5 Chemistry"
            </button>
          </div>

          <!-- Simulation 2: Inbound High School CS -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">💻 Computer Science Book</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate parent offering "Year 12 Computer Science" textbook.</div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('I have Year 12 Computer Science Book')}
            >
              Simulate "Year 12 CS"
            </button>
          </div>

          <!-- Simulation 3: Bilingual French Message -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">🇫🇷 French Message (Collège)</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate French parent offering "Manuel de Physique 3ème".</div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia("J'ai un livre de physique pour la classe de 3ème")}
            >
              Simulate "Physique 3ème"
            </button>
          </div>

          <!-- Simulation 4: Clarification Flow -->
          <div style="background:rgba(255,255,255,0.03);border:1px solid var(--surface-border);border-radius:12px;padding:18px;display:flex;flex-direction:column;justify-content:space-between;gap:12px;">
            <div>
              <div style="font-weight:600;font-size:1rem;color:#fff;margin-bottom:4px;">❓ Year Clarification Prompt</div>
              <div style="font-size:0.83rem;color:var(--text-muted);">Simulate offer with missing school year (triggers conversational clarification).</div>
            </div>
            <button
              class="secondary sm"
              @click=${() => handleSimulateInboundMedia('I have Chemistry books available for anyone who wants them')}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;">
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
        <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:12px;">
          <div>
            <h3 style="margin:0 0 4px 0;">Enterprise Security, Governance & Observability</h3>
            <p style="margin:0;font-size:0.9rem;color:var(--text-muted);">
              Real-time telemetry, perimeter defense, encryption at rest, and Bedrock Guardrails.
            </p>
          </div>
          <button class="secondary sm" @click=${handleTestHmacValidation}>
            🔐 Validate HMAC
          </button>
        </div>

        <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(220px, 1fr));gap:12px;margin-top:18px;">
          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Perimeter Defense</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#10b981;">🛡️ AWS WAF & Rate Limit</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">2,000 req/5min per IP</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Data Governance</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#3b82f6;">🔒 Bedrock Guardrails</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">PII Redaction (Phone, Address)</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Encryption & Storage</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#a855f7;">🔑 AWS KMS CMK</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">30-Day S3 Image Expiration</div>
          </div>

          <div style="background:rgba(255,255,255,0.03);padding:14px 16px;border-radius:10px;border:1px solid rgba(255,255,255,0.08);">
            <div style="font-size:0.75rem;color:var(--text-muted);text-transform:uppercase;letter-spacing:0.05em;">Telemetry & Observability</div>
            <div style="font-size:0.95rem;font-weight:600;margin-top:4px;color:#f59e0b;">📊 X-Ray Tracing + EMF</div>
            <div style="font-size:0.75rem;color:var(--text-muted);margin-top:2px;">Zero-latency CloudWatch EMF</div>
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
          <button class="secondary sm" @click=${loadData}>
            🔄 Refresh Stream
          </button>
        </div>

        <div class="terminal-log">
          ${events.length === 0
            ? html`<div style="color:var(--text-muted);padding:12px 0;">Waiting for lifecycle events...</div>`
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
  `;
}

// ─── Main Application Render Loop ─────────────────────────────────────────────

function redraw() {
  render(
    html`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${statusMessage
          ? html`
              <div class="status-banner">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:1.1rem;">🔔</span>
                  <span>${statusMessage}</span>
                </div>
                <button
                  class="secondary sm"
                  style="padding:2px 8px;font-size:0.75rem;"
                  @click=${() => { statusMessage = ''; redraw(); }}
                >
                  ✕
                </button>
              </div>
            `
          : ''}

        <!-- Top Level Stats Summary -->
        ${renderStatsOverview()}

        <!-- Tab Bar Navigation -->
        ${renderTabsNavigation()}

        <!-- Active Tab Content -->
        ${activeTab === 'available'
          ? renderAvailableBooksTab()
          : activeTab === 'pendings'
          ? renderPendingDemandsTab()
          : activeTab === 'matches'
          ? renderMatchedDemandsTab()
          : activeTab === 'webhook'
          ? renderWebhookTab()
          : renderObservabilityTab()}
      </div>
    `,
    appEl
  );
}

// Initial Data Load
loadData();
