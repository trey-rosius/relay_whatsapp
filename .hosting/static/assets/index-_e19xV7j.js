var le=Object.defineProperty;var ce=(i,e,s)=>e in i?le(i,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):i[e]=s;var M=(i,e,s)=>ce(i,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const t of document.querySelectorAll('link[rel="modulepreload"]'))n(t);new MutationObserver(t=>{for(const o of t)if(o.type==="childList")for(const r of o.addedNodes)r.tagName==="LINK"&&r.rel==="modulepreload"&&n(r)}).observe(document,{childList:!0,subtree:!0});function s(t){const o={};return t.integrity&&(o.integrity=t.integrity),t.referrerPolicy&&(o.referrerPolicy=t.referrerPolicy),t.crossOrigin==="use-credentials"?o.credentials="include":t.crossOrigin==="anonymous"?o.credentials="omit":o.credentials="same-origin",o}function n(t){if(t.ep)return;t.ep=!0;const o=s(t);fetch(t.href,o)}})();const de="modulepreload",he=function(i){return"/"+i},Y={},ue=function(e,s,n){let t=Promise.resolve();if(s&&s.length>0){let r=function(d){return Promise.all(d.map(h=>Promise.resolve(h).then(l=>({status:"fulfilled",value:l}),l=>({status:"rejected",reason:l}))))};document.getElementsByTagName("link");const c=document.querySelector("meta[property=csp-nonce]"),a=(c==null?void 0:c.nonce)||(c==null?void 0:c.getAttribute("nonce"));t=r(s.map(d=>{if(d=he(d),d in Y)return;Y[d]=!0;const h=d.endsWith(".css"),l=h?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${d}"]${l}`))return;const u=document.createElement("link");if(u.rel=h?"stylesheet":de,h||(u.as="script"),u.crossOrigin="",u.href=d,a&&u.setAttribute("nonce",a),document.head.appendChild(u),h)return new Promise((m,$)=>{u.addEventListener("load",m),u.addEventListener("error",()=>$(new Error(`Unable to preload CSS for ${d}`)))})}))}function o(r){const c=new Event("vite:preloadError",{cancelable:!0});if(c.payload=r,window.dispatchEvent(c),!c.defaultPrevented)throw r}return t.then(r=>{for(const c of r||[])c.status==="rejected"&&o(c.reason);return e().catch(o)})},pe="ApiError";class fe extends Error{constructor(s,n,t){super(s,t!=null&&t.cause?{cause:t.cause}:void 0);M(this,"status");M(this,"retriable");this.name=(t==null?void 0:t.name)??pe,this.status=n,this.retriable=(t==null?void 0:t.retriable)??!1}}const me="2.0";let ge=1;function ve(i,e,s){return JSON.stringify({jsonrpc:me,method:`${i}.${e}`,params:s,id:ge++})}function $e(i){const e=i;if(e.error){const{code:s,message:n,data:t}=e.error,o=s>0?s:500;throw new fe(n,o,{...t!=null&&t.name?{name:t.name}:{},...(t==null?void 0:t.retriable)===!0?{retriable:!0}:{}})}return e.result}var A={};const Ae=typeof window>"u";function ye(){if(!Ae||typeof globalThis>"u")return;const i=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!i||typeof i.getStore!="function"))return i.getStore()}let k=null,w=null;async function _e(){return k||w||(w=be().catch(i=>{throw w=null,i}),w)}async function be(){var s;if(k)return k;function i(n){if(!n||typeof n!="string"||!n.trim()||n==="undefined"||n.startsWith("undefined"))return!0;if(n.startsWith("/"))return!1;try{const t=new URL(n);return t.hostname==="undefined"||t.pathname==="/undefined"||t.pathname.startsWith("/undefined/")}catch{return!0}}function e(n,t){if(!n||typeof n!="string"||i(n))throw new Error(`Blocks API URL is not configured (source: ${t}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return k=n,n}if(typeof process<"u"&&(A!=null&&A.BLOCKS_API_URL)){const n=A.BLOCKS_API_URL;if(/\$\{Token\[/.test(n))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const t=e(n,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",t),t}if(typeof process<"u"&&(A!=null&&A.BLOCKS_CONFIG))try{const n=JSON.parse(A.BLOCKS_CONFIG),t=e(n.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",t),t}catch{}if(typeof process<"u"&&((s=process.versions)!=null&&s.node))try{const n=await ue(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),t=JSON.parse(n.readFileSync(".blocks-sandbox/config.json","utf-8")),o=e(t.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",o),o}catch{}try{const n=await fetch("/.blocks-sandbox/config.json");if(n.ok){const t=await n.json(),o=e(t.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",o),o}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const ne=[];async function xe(i){for(const e of ne)if(e.onRequest){const s=await e.onRequest(i);s&&(i=s)}return i}function Ce(i){for(const e of ne)e.onResponse&&(i=e.onResponse(i));return i}function f(i,e){return new Proxy({},{get(s,n){if(typeof n!="symbol")return async(...t)=>{const o=await _e();let r={apiNamespace:i,method:n,args:t,headers:{"Content-Type":"application/json"}};r=await xe(r);const c=ye();if(c){const l="Cookie"in r.headers?"Cookie":"cookie"in r.headers?"cookie":null,u=l?r.headers[l]:void 0;if(l&&l!=="Cookie"&&delete r.headers[l],u){const m=new Set(u.split(";").filter(Boolean).map(U=>U.trim().split("=")[0])),$=c.split(";").filter(Boolean).filter(U=>!m.has(U.trim().split("=")[0])).join("; ");r.headers.Cookie=$?`${u}; ${$}`:u}else r.headers.Cookie=c}const d=await(await fetch(o,{method:"POST",headers:r.headers,credentials:"include",body:ve(r.apiNamespace,r.method,r.args)})).json(),h=$e(d);return Ce(h)}}})}f("CONDITION_TYPES");f("DOMAIN_TYPES");f("PROVIDER_CATEGORIES");f("activeInventorySchema");const C=f("api");f("buildGroupedCatalogText");f("chunkTextForVectorStore");f("demandBoardSchema");f("emitLifecycleEvent");f("normalizeConceptKey");f("parseParentMessageIntents");f("parseParentMessageIntentsWithLLM");f("processWhatsAppInbound");f("sendWhatsAppTextMessage");f("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const E=globalThis,G=i=>i,T=E.trustedTypes,z=T?T.createPolicy("lit-html",{createHTML:i=>i}):void 0,ie="$lit$",y=`lit$${Math.random().toFixed(9).slice(2)}$`,re="?"+y,Se=`<${re}>`,x=document,P=()=>x.createComment(""),L=i=>i===null||typeof i!="object"&&typeof i!="function",F=Array.isArray,we=i=>F(i)||typeof(i==null?void 0:i[Symbol.iterator])=="function",D=`[ 	
\f\r]`,I=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,J=/-->/g,Z=/>/g,_=RegExp(`>|${D}(?:([^\\s"'>=/]+)(${D}*=${D}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),Q=/'/g,X=/"/g,oe=/^(?:script|style|textarea|title)$/i,Ie=i=>(e,...s)=>({_$litType$:i,strings:e,values:s}),v=Ie(1),N=Symbol.for("lit-noChange"),p=Symbol.for("lit-nothing"),ee=new WeakMap,b=x.createTreeWalker(x,129);function ae(i,e){if(!F(i)||!i.hasOwnProperty("raw"))throw Error("invalid template strings array");return z!==void 0?z.createHTML(e):e}const ke=(i,e)=>{const s=i.length-1,n=[];let t,o=e===2?"<svg>":e===3?"<math>":"",r=I;for(let c=0;c<s;c++){const a=i[c];let d,h,l=-1,u=0;for(;u<a.length&&(r.lastIndex=u,h=r.exec(a),h!==null);)u=r.lastIndex,r===I?h[1]==="!--"?r=J:h[1]!==void 0?r=Z:h[2]!==void 0?(oe.test(h[2])&&(t=RegExp("</"+h[2],"g")),r=_):h[3]!==void 0&&(r=_):r===_?h[0]===">"?(r=t??I,l=-1):h[1]===void 0?l=-2:(l=r.lastIndex-h[2].length,d=h[1],r=h[3]===void 0?_:h[3]==='"'?X:Q):r===X||r===Q?r=_:r===J||r===Z?r=I:(r=_,t=void 0);const m=r===_&&i[c+1].startsWith("/>")?" ":"";o+=r===I?a+Se:l>=0?(n.push(d),a.slice(0,l)+ie+a.slice(l)+y+m):a+y+(l===-2?c:m)}return[ae(i,o+(i[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),n]};class R{constructor({strings:e,_$litType$:s},n){let t;this.parts=[];let o=0,r=0;const c=e.length-1,a=this.parts,[d,h]=ke(e,s);if(this.el=R.createElement(d,n),b.currentNode=this.el.content,s===2||s===3){const l=this.el.content.firstChild;l.replaceWith(...l.childNodes)}for(;(t=b.nextNode())!==null&&a.length<c;){if(t.nodeType===1){if(t.hasAttributes())for(const l of t.getAttributeNames())if(l.endsWith(ie)){const u=h[r++],m=t.getAttribute(l).split(y),$=/([.?@])?(.*)/.exec(u);a.push({type:1,index:o,name:$[2],strings:m,ctor:$[1]==="."?Pe:$[1]==="?"?Le:$[1]==="@"?Ne:B}),t.removeAttribute(l)}else l.startsWith(y)&&(a.push({type:6,index:o}),t.removeAttribute(l));if(oe.test(t.tagName)){const l=t.textContent.split(y),u=l.length-1;if(u>0){t.textContent=T?T.emptyScript:"";for(let m=0;m<u;m++)t.append(l[m],P()),b.nextNode(),a.push({type:2,index:++o});t.append(l[u],P())}}}else if(t.nodeType===8)if(t.data===re)a.push({type:2,index:o});else{let l=-1;for(;(l=t.data.indexOf(y,l+1))!==-1;)a.push({type:7,index:o}),l+=y.length-1}o++}}static createElement(e,s){const n=x.createElement("template");return n.innerHTML=e,n}}function S(i,e,s=i,n){var r,c;if(e===N)return e;let t=n!==void 0?(r=s._$Co)==null?void 0:r[n]:s._$Cl;const o=L(e)?void 0:e._$litDirective$;return(t==null?void 0:t.constructor)!==o&&((c=t==null?void 0:t._$AO)==null||c.call(t,!1),o===void 0?t=void 0:(t=new o(i),t._$AT(i,s,n)),n!==void 0?(s._$Co??(s._$Co=[]))[n]=t:s._$Cl=t),t!==void 0&&(e=S(i,t._$AS(i,e.values),t,n)),e}class Ee{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:n}=this._$AD,t=((e==null?void 0:e.creationScope)??x).importNode(s,!0);b.currentNode=t;let o=b.nextNode(),r=0,c=0,a=n[0];for(;a!==void 0;){if(r===a.index){let d;a.type===2?d=new O(o,o.nextSibling,this,e):a.type===1?d=new a.ctor(o,a.name,a.strings,this,e):a.type===6&&(d=new Re(o,this,e)),this._$AV.push(d),a=n[++c]}r!==(a==null?void 0:a.index)&&(o=b.nextNode(),r++)}return b.currentNode=x,t}p(e){let s=0;for(const n of this._$AV)n!==void 0&&(n.strings!==void 0?(n._$AI(e,n,s),s+=n.strings.length-2):n._$AI(e[s])),s++}}class O{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,n,t){this.type=2,this._$AH=p,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=n,this.options=t,this._$Cv=(t==null?void 0:t.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=S(this,e,s),L(e)?e===p||e==null||e===""?(this._$AH!==p&&this._$AR(),this._$AH=p):e!==this._$AH&&e!==N&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):we(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==p&&L(this._$AH)?this._$AA.nextSibling.data=e:this.T(x.createTextNode(e)),this._$AH=e}$(e){var o;const{values:s,_$litType$:n}=e,t=typeof n=="number"?this._$AC(e):(n.el===void 0&&(n.el=R.createElement(ae(n.h,n.h[0]),this.options)),n);if(((o=this._$AH)==null?void 0:o._$AD)===t)this._$AH.p(s);else{const r=new Ee(t,this),c=r.u(this.options);r.p(s),this.T(c),this._$AH=r}}_$AC(e){let s=ee.get(e.strings);return s===void 0&&ee.set(e.strings,s=new R(e)),s}k(e){F(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let n,t=0;for(const o of e)t===s.length?s.push(n=new O(this.O(P()),this.O(P()),this,this.options)):n=s[t],n._$AI(o),t++;t<s.length&&(this._$AR(n&&n._$AB.nextSibling,t),s.length=t)}_$AR(e=this._$AA.nextSibling,s){var n;for((n=this._$AP)==null?void 0:n.call(this,!1,!0,s);e!==this._$AB;){const t=G(e).nextSibling;G(e).remove(),e=t}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class B{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,n,t,o){this.type=1,this._$AH=p,this._$AN=void 0,this.element=e,this.name=s,this._$AM=t,this.options=o,n.length>2||n[0]!==""||n[1]!==""?(this._$AH=Array(n.length-1).fill(new String),this.strings=n):this._$AH=p}_$AI(e,s=this,n,t){const o=this.strings;let r=!1;if(o===void 0)e=S(this,e,s,0),r=!L(e)||e!==this._$AH&&e!==N,r&&(this._$AH=e);else{const c=e;let a,d;for(e=o[0],a=0;a<o.length-1;a++)d=S(this,c[n+a],s,a),d===N&&(d=this._$AH[a]),r||(r=!L(d)||d!==this._$AH[a]),d===p?e=p:e!==p&&(e+=(d??"")+o[a+1]),this._$AH[a]=d}r&&!t&&this.j(e)}j(e){e===p?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class Pe extends B{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===p?void 0:e}}class Le extends B{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==p)}}class Ne extends B{constructor(e,s,n,t,o){super(e,s,n,t,o),this.type=5}_$AI(e,s=this){if((e=S(this,e,s,0)??p)===N)return;const n=this._$AH,t=e===p&&n!==p||e.capture!==n.capture||e.once!==n.once||e.passive!==n.passive,o=e!==p&&(n===p||t);t&&this.element.removeEventListener(this.name,this,n),o&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class Re{constructor(e,s,n){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=n}get _$AU(){return this._$AM._$AU}_$AI(e){S(this,e)}}const j=E.litHtmlPolyfillSupport;j==null||j(R,O),(E.litHtmlVersions??(E.litHtmlVersions=[])).push("3.3.3");const Oe=(i,e,s)=>{const n=e;let t=n._$litPart$;return t===void 0&&(n._$litPart$=t=new O(e.insertBefore(P(),null),null,void 0,{})),t._$AI(i),t},Te=document.getElementById("app");let W=[],K=[],V=[],g="";async function H(){try{W=await C.listInventory(),K=await C.listDemands(),V=await C.getLifecycleEvents()}catch(i){console.error("Failed to load dashboard data:",i)}q()}async function Be(){const i="subscribe",e="my_verify_token_123",s="challenge_echo_8877";try{const n=await C.verifyWebhook(i,e,s);n.status===200?g=`✅ Handshake Verified! Echoed challenge: "${n.challenge}"`:g=`❌ Verification failed: ${n.error}`}catch(n){g=`❌ Error verifying webhook: ${n.message}`}H()}async function te(i){g="🚀 Processing inbound WhatsApp media message...",q();try{const e={media_id:`media_${Date.now()}`,from_phone:"+15550199001",message_text:i},s=await C.handleWebhook(e);s.result.status==="matched"?g=`🎉 Match Found! Matched demand ID: ${s.result.matchedDemandId}`:g=`📦 Item added to ActiveInventory! Item ID: ${s.result.itemId}`}catch(e){g=`❌ Webhook processing error: ${e.message}`}H()}async function se(i,e){g=`⏳ Adding request to DemandBoard for concept: ${i}...`,q();try{await C.createDemand("+15550199002",e,i,"Marketplace"),g=`✨ Wishlist demand saved to DemandBoard for "${e}"!`}catch(s){g=`❌ Error adding demand: ${s.message}`}H()}function q(){Oe(v`
      <div style="display:flex;flex-direction:column;gap:32px">
        <!-- System Status Banner -->
        ${g?v`
              <div class="status-banner">
                <svg width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                ${g}
              </div>
            `:""}

        <!-- Webhook Handshake & Simulator Card -->
        <div class="card">
          <h3>Webhook Controls & Simulation</h3>
          <p>
            Test API Gateway webhook verification handshake and simulate inbound media processing.
          </p>
          <div style="display:flex;gap:12px;flex-wrap:wrap;margin-top:20px">
            <button @click=${Be}>Verify GET Handshake</button>
            <button
              class="secondary"
              @click=${()=>te("Year 5 Chemistry Textbook - Pristine Condition")}
            >
              Simulate "Year 5 Chemistry"
            </button>
            <button
              class="secondary"
              @click=${()=>te("AWS Lambda Architecture Reference Book")}
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
              <button @click=${()=>se("Year5Chemistry","Year 5 Chemistry")}>
                + Request "Year 5 Chemistry"
              </button>
              <button
                class="secondary"
                @click=${()=>se("Year12ComputerScience","Year 12 Computer Science")}
              >
                + Request "Year 12 CS"
              </button>
            </div>
            <div class="item-list">
              ${K.length===0?v`<div style="color:var(--text-muted);text-align:center;padding:24px 0">No demand requests yet.</div>`:K.map(i=>v`
                      <div class="list-item">
                        <div class="item-info">
                          <span class="item-title">${i.requestedQuery}</span>
                          <span class="item-meta">
                            <span>Concept: ${i.concept}</span>
                            ${i.createdAt?v`<span style="color:var(--text-muted);font-size:0.8rem;">📅 ${new Date(i.createdAt).toLocaleString()}</span>`:""}
                          </span>
                        </div>
                        <span
                          class="badge ${i.status==="matched"?"badge-matched":"badge-pending"}"
                        >
                          ${i.status}
                        </span>
                      </div>
                    `)}
            </div>
          </div>

          <!-- Active Inventory -->
          <div class="card">
            <h3>Active Inventory</h3>
            <p>
              Items extracted via Bedrock vision and chunked into S3 Vectors.
            </p>
              ${(()=>{if(W.length===0)return v`<div style="color:var(--text-muted);text-align:center;padding:24px 0">No active inventory items.</div>`;const i=W.reduce((e,s)=>(e[s.title]||(e[s.title]={title:s.title,domain:s.domain,providerCategory:s.providerCategory,count:0,phones:[],latestCreatedAt:s.createdAt||0}),e[s.title].count+=1,s.sellerPhone&&!e[s.title].phones.includes(s.sellerPhone)&&e[s.title].phones.push(s.sellerPhone),(s.createdAt||0)>e[s.title].latestCreatedAt&&(e[s.title].latestCreatedAt=s.createdAt||0),e),{});return Object.values(i).sort((e,s)=>s.latestCreatedAt-e.latestCreatedAt).map(e=>v`
                    <div class="list-item" style="flex-direction:column;align-items:flex-start;">
                      <div style="display:flex;justify-content:space-between;width:100%;align-items:center;">
                        <div class="item-info">
                          <span class="item-title">${e.title}</span>
                          <span class="item-meta">
                            <span>${e.domain} &bull; ${e.providerCategory}</span>
                            ${e.latestCreatedAt?v`<span style="color:var(--text-muted);font-size:0.8rem;">📅 ${new Date(e.latestCreatedAt).toLocaleString()}</span>`:""}
                          </span>
                        </div>
                        <span class="badge badge-active">${e.count} Available</span>
                      </div>
                      ${e.phones.length>0?v`
                      <div style="font-size:0.85rem;color:var(--text-muted);margin-top:8px;">
                        <strong>Sellers:</strong> ${e.phones.join(", ")}
                      </div>`:""}
                    </div>
                  `)})()}
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
            ${V.length===0?v`<div style="color:var(--text-muted);">Waiting for lifecycle events...</div>`:V.slice().reverse().map(i=>v`
                      <div class="log-entry">
                        <span class="log-time">[${new Date(i.timestamp).toLocaleTimeString([],{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
                        <span class="log-type">${i.eventType}</span>
                        <span class="log-details">${JSON.stringify(i.details)}</span>
                      </div>
                    `)}
          </div>
        </div>
      </div>
    `,Te)}H();
