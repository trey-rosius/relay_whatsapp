var Ke=Object.defineProperty;var Je=(t,e,s)=>e in t?Ke(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var ve=(t,e,s)=>Je(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))a(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const o of n.addedNodes)o.tagName==="LINK"&&o.rel==="modulepreload"&&a(o)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function a(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();const Qe="modulepreload",Ze=function(t){return"/"+t},Ie={},Xe=function(e,s,a){let i=Promise.resolve();if(s&&s.length>0){let o=function(v){return Promise.all(v.map(f=>Promise.resolve(f).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=o(s.map(v=>{if(v=Ze(v),v in Ie)return;Ie[v]=!0;const f=v.endsWith(".css"),u=f?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${v}"]${u}`))return;const g=document.createElement("link");if(g.rel=f?"stylesheet":Qe,f||(g.as="script"),g.crossOrigin="",g.href=v,d&&g.setAttribute("nonce",d),document.head.appendChild(g),f)return new Promise((x,w)=>{g.addEventListener("load",x),g.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${v}`)))})}))}function n(o){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=o,window.dispatchEvent(l),!l.defaultPrevented)throw o}return i.then(o=>{for(const l of o||[])l.status==="rejected"&&n(l.reason);return e().catch(n)})},et="ApiError";class tt extends Error{constructor(s,a,i){super(s,i!=null&&i.cause?{cause:i.cause}:void 0);ve(this,"status");ve(this,"retriable");this.name=(i==null?void 0:i.name)??et,this.status=a,this.retriable=(i==null?void 0:i.retriable)??!1}}const st="2.0";let it=1;function at(t,e,s){return JSON.stringify({jsonrpc:st,method:`${t}.${e}`,params:s,id:it++})}function ot(t){const e=t;if(e.error){const{code:s,message:a,data:i}=e.error,n=s>0?s:500;throw new tt(a,n,{...i!=null&&i.name?{name:i.name}:{},...(i==null?void 0:i.retriable)===!0?{retriable:!0}:{}})}return e.result}var E={};const nt=typeof window>"u";function rt(){if(!nt||typeof globalThis>"u")return;const t=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!t||typeof t.getStore!="function"))return t.getStore()}let K=null,Y=null;async function lt(){return K||Y||(Y=dt().catch(t=>{throw Y=null,t}),Y)}async function dt(){var s;if(K)return K;function t(a){if(!a||typeof a!="string"||!a.trim()||a==="undefined"||a.startsWith("undefined"))return!0;if(a.startsWith("/"))return!1;try{const i=new URL(a);return i.hostname==="undefined"||i.pathname==="/undefined"||i.pathname.startsWith("/undefined/")}catch{return!0}}function e(a,i){if(!a||typeof a!="string"||t(a))throw new Error(`Blocks API URL is not configured (source: ${i}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return K=a,a}if(typeof process<"u"&&(E!=null&&E.BLOCKS_API_URL)){const a=E.BLOCKS_API_URL;if(/\$\{Token\[/.test(a))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const i=e(a,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",i),i}if(typeof process<"u"&&(E!=null&&E.BLOCKS_CONFIG))try{const a=JSON.parse(E.BLOCKS_CONFIG),i=e(a.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",i),i}catch{}if(typeof process<"u"&&((s=process.versions)!=null&&s.node))try{const a=await Xe(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),i=JSON.parse(a.readFileSync(".blocks-sandbox/config.json","utf-8")),n=e(i.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",n),n}catch{}try{const a=await fetch("/.blocks-sandbox/config.json");if(a.ok){const i=await a.json(),n=e(i.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",n),n}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const we=[];function Ne(t){we.push(t)}async function ct(t){for(const e of we)if(e.onRequest){const s=await e.onRequest(t);s&&(t=s)}return t}function ut(t){for(const e of we)e.onResponse&&(t=e.onResponse(t));return t}function p(t,e){return new Proxy({},{get(s,a){if(typeof a!="symbol")return async(...i)=>{const n=await lt();let o={apiNamespace:t,method:a,args:i,headers:{"Content-Type":"application/json"}};o=await ct(o);const l=rt();if(l){const u="Cookie"in o.headers?"Cookie":"cookie"in o.headers?"cookie":null,g=u?o.headers[u]:void 0;if(u&&u!=="Cookie"&&delete o.headers[u],g){const x=new Set(g.split(";").filter(Boolean).map(fe=>fe.trim().split("=")[0])),w=l.split(";").filter(Boolean).filter(fe=>!x.has(fe.trim().split("=")[0])).join("; ");o.headers.Cookie=w?`${g}; ${w}`:g}else o.headers.Cookie=l}const v=await(await fetch(n,{method:"POST",headers:o.headers,credentials:"include",body:at(o.apiNamespace,o.method,o.args)})).json(),f=ot(v);return ut(f)}}})}function pt(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/download"&&typeof e.url=="string"}function ft(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/upload"&&typeof e.url=="string"}function xe(t){if(pt(t)){const{url:e}=t;return{async download(){const s=await fetch(e);if(!s.ok)throw new Error(`Download failed: ${s.status}`);return s.blob()},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/download",url:e}}}}if(ft(t)){const{url:e,contentType:s}=t;return{async upload(a){const i={};s&&(i["Content-Type"]=s);const n=await fetch(e,{method:"PUT",body:a,headers:i});if(!n.ok)throw new Error(`Upload failed: ${n.status}`)},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/upload",url:e,contentType:s}}}}if(Array.isArray(t))return t.map(xe);if(typeof t=="object"&&t!==null){const e={};for(const[s,a]of Object.entries(t))e[s]=xe(a);return e}return t}Ne({onResponse:xe});const vt=540*1e3,J=new Map;function gt(t,e){let s=J.get(t);if(s)return s;s={ws:void 0,connected:!1,subscriptions:new Map,pendingEstablished:new Map,pendingSubs:[],keepAliveTimer:null,disconnectHandlers:new Set},J.set(t,s);const a=`${t}?token=${encodeURIComponent(e)}`,i=new WebSocket(a);return s.ws=i,i.onopen=()=>{s.connected=!0;for(const n of s.pendingSubs)i.send(JSON.stringify({action:"subscribe",channel:n.channel,token:n.token}));s.pendingSubs.length=0,s.keepAliveTimer=setInterval(()=>{i.readyState===WebSocket.OPEN&&i.send(JSON.stringify({action:"ping"}))},vt)},i.onmessage=n=>{try{const o=JSON.parse(n.data);if(o.type==="subscribe_success"&&o.channel){const l=s.pendingEstablished.get(o.channel);l&&(l.forEach(d=>d.resolve()),s.pendingEstablished.delete(o.channel))}else if(o.type==="error"&&o.channel){const l=s.pendingEstablished.get(o.channel);if(l){const d=new Error(o.message||"Subscription rejected");d.name="ConnectionFailedException",l.forEach(v=>v.reject(d)),s.pendingEstablished.delete(o.channel)}s.subscriptions.delete(o.channel)}else if(o.type==="message"&&o.channel){const l=s.subscriptions.get(o.channel);l&&l.forEach(d=>{try{d(o.data)}catch{}})}}catch{}},i.onerror=()=>{const n=new Error("WebSocket connection failed");n.name="ConnectionFailedException";for(const o of s.pendingEstablished.values())o.forEach(l=>l.reject(n));s.pendingEstablished.clear(),s.disconnectHandlers.forEach(o=>{try{o("error")}catch{}})},i.onclose=n=>{const o=new Error("WebSocket closed");o.name="ConnectionFailedException";for(const d of s.pendingEstablished.values())d.forEach(v=>v.reject(o));s.pendingEstablished.clear(),s.connected=!1,s.keepAliveTimer&&(clearInterval(s.keepAliveTimer),s.keepAliveTimer=null);const l=n.code===1001?"timeout":n.code===1006?"error":"unknown";s.disconnectHandlers.forEach(d=>{try{d(l)}catch{}}),s.disconnectHandlers.clear(),J.delete(t)},s}function ht(t,e,s,a,i,n){var f;const o=gt(t,e);o.subscriptions.has(s)||o.subscriptions.set(s,new Set),o.subscriptions.get(s).add(i),n&&o.disconnectHandlers.add(n);let l,d;const v=new Promise((u,g)=>{l=u,d=g});return o.pendingEstablished.has(s)||o.pendingEstablished.set(s,[]),o.pendingEstablished.get(s).push({resolve:l,reject:d}),o.connected&&((f=o.ws)==null?void 0:f.readyState)===WebSocket.OPEN?o.ws.send(JSON.stringify({action:"subscribe",channel:s,token:a})):o.pendingSubs.push({channel:s,token:a}),{unsubscribe(){var g;if(n){try{n("client")}catch{}o.disconnectHandlers.delete(n)}const u=o.subscriptions.get(s);if(u&&(u.delete(i),u.size===0&&(o.subscriptions.delete(s),o.connected&&((g=o.ws)==null?void 0:g.readyState)===WebSocket.OPEN&&o.ws.send(JSON.stringify({action:"unsubscribe",channel:s})))),o.subscriptions.size===0&&o.ws){o.keepAliveTimer&&(clearInterval(o.keepAliveTimer),o.keepAliveTimer=null),o.ws.onmessage=null,o.ws.onerror=null,o.ws.onclose=null,o.ws.close(),o.connected=!1;for(const[x,w]of J)if(w===o){J.delete(x);break}}},established:v,connection:o.ws}}function mt(t){return typeof t=="object"&&t!==null&&t.__blocks==="realtime/channel"&&typeof t.wsUrl=="string"&&typeof t.connectToken=="string"&&typeof t.token=="string"}function $e(t){if(mt(t)){const{channel:e,wsUrl:s,connectToken:a,token:i}=t;return{subscribe(n){const o=typeof n=="function"?n:n.onMessage,l=typeof n=="function"?void 0:n.onDisconnect;return ht(s,a,e,i,o,l)}}}if(Array.isArray(t))return t.map($e);if(typeof t=="object"&&t!==null){const e={};for(const[s,a]of Object.entries(t))e[s]=$e(a);return e}return t}Ne({onResponse:$e});p("CONDITION_TYPES");p("DOMAIN_TYPES");p("PROVIDER_CATEGORIES");p("SUBJECT_CATALOG");p("activeInventorySchema");const y=p("api");p("buildBuyerMatchMessage");p("buildGroupedCatalogText");p("buildIntentClassificationPrompt");p("buildInteractiveCatalogPayload");p("buildInteractiveOtherGradesPayload");p("buildInteractiveRequestConfirmationPayload");p("buildInteractiveYearSubjectsPayload");p("buildLLMMessagePrompt");p("buildParentActivitySummary");p("buildSellerMatchMessage");p("chunkTextForVectorStore");p("cleanSubjectName");p("demandBoardSchema");p("detectMessageLanguage");p("emitLifecycleEvent");p("ensureUnredactedMessage");p("extractSchoolYear");p("extractSubject");p("formatConditionBadges");p("formatDemandDisplay");p("formatPhoneNumber");p("generateLLMMessage");p("getHelpMessage");p("getWhatsAppCredentials");p("hasExplicitSchoolYear");p("inferDomainFromConcept");p("isMatchingItem");p("maskPromptPII");p("normalizeConceptKey");p("parseParentMessageIntentsWithLLM");p("processWhatsAppInbound");p("sanitizeExtractedTitle");p("sendWhatsAppInteractiveMessage");p("sendWhatsAppTextMessage");p("sweepExpiredHolds");p("truncateWhatsAppText");p("verifyMetaHmacSignature");p("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Q=globalThis,He=t=>t,de=Q.trustedTypes,Me=de?de.createPolicy("lit-html",{createHTML:t=>t}):void 0,ze="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,Oe="?"+H,bt=`<${Oe}>`,z=document,ee=()=>z.createComment(""),te=t=>t===null||typeof t!="object"&&typeof t!="function",Ce=Array.isArray,yt=t=>Ce(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ge=`[ 	
\f\r]`,G=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Te=/-->/g,Le=/>/g,D=RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),De=/'/g,Re=/"/g,je=/^(?:script|style|textarea|title)$/i,xt=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),r=xt(1),se=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),Be=new WeakMap,N=z.createTreeWalker(z,129);function Ue(t,e){if(!Ce(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Me!==void 0?Me.createHTML(e):e}const $t=(t,e)=>{const s=t.length-1,a=[];let i,n=e===2?"<svg>":e===3?"<math>":"",o=G;for(let l=0;l<s;l++){const d=t[l];let v,f,u=-1,g=0;for(;g<d.length&&(o.lastIndex=g,f=o.exec(d),f!==null);)g=o.lastIndex,o===G?f[1]==="!--"?o=Te:f[1]!==void 0?o=Le:f[2]!==void 0?(je.test(f[2])&&(i=RegExp("</"+f[2],"g")),o=D):f[3]!==void 0&&(o=D):o===D?f[0]===">"?(o=i??G,u=-1):f[1]===void 0?u=-2:(u=o.lastIndex-f[2].length,v=f[1],o=f[3]===void 0?D:f[3]==='"'?Re:De):o===Re||o===De?o=D:o===Te||o===Le?o=G:(o=D,i=void 0);const x=o===D&&t[l+1].startsWith("/>")?" ":"";n+=o===G?d+bt:u>=0?(a.push(v),d.slice(0,u)+ze+d.slice(u)+H+x):d+H+(u===-2?l:x)}return[Ue(t,n+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),a]};class ie{constructor({strings:e,_$litType$:s},a){let i;this.parts=[];let n=0,o=0;const l=e.length-1,d=this.parts,[v,f]=$t(e,s);if(this.el=ie.createElement(v,a),N.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=N.nextNode())!==null&&d.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(ze)){const g=f[o++],x=i.getAttribute(u).split(H),w=/([.?@])?(.*)/.exec(g);d.push({type:1,index:n,name:w[2],strings:x,ctor:w[1]==="."?kt:w[1]==="?"?St:w[1]==="@"?wt:ue}),i.removeAttribute(u)}else u.startsWith(H)&&(d.push({type:6,index:n}),i.removeAttribute(u));if(je.test(i.tagName)){const u=i.textContent.split(H),g=u.length-1;if(g>0){i.textContent=de?de.emptyScript:"";for(let x=0;x<g;x++)i.append(u[x],ee()),N.nextNode(),d.push({type:2,index:++n});i.append(u[g],ee())}}}else if(i.nodeType===8)if(i.data===Oe)d.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(H,u+1))!==-1;)d.push({type:7,index:n}),u+=H.length-1}n++}}static createElement(e,s){const a=z.createElement("template");return a.innerHTML=e,a}}function W(t,e,s=t,a){var o,l;if(e===se)return e;let i=a!==void 0?(o=s._$Co)==null?void 0:o[a]:s._$Cl;const n=te(e)?void 0:e._$litDirective$;return(i==null?void 0:i.constructor)!==n&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),n===void 0?i=void 0:(i=new n(t),i._$AT(t,s,a)),a!==void 0?(s._$Co??(s._$Co=[]))[a]=i:s._$Cl=i),i!==void 0&&(e=W(t,i._$AS(t,e.values),i,a)),e}class At{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:a}=this._$AD,i=((e==null?void 0:e.creationScope)??z).importNode(s,!0);N.currentNode=i;let n=N.nextNode(),o=0,l=0,d=a[0];for(;d!==void 0;){if(o===d.index){let v;d.type===2?v=new re(n,n.nextSibling,this,e):d.type===1?v=new d.ctor(n,d.name,d.strings,this,e):d.type===6&&(v=new Ct(n,this,e)),this._$AV.push(v),d=a[++l]}o!==(d==null?void 0:d.index)&&(n=N.nextNode(),o++)}return N.currentNode=z,i}p(e){let s=0;for(const a of this._$AV)a!==void 0&&(a.strings!==void 0?(a._$AI(e,a,s),s+=a.strings.length-2):a._$AI(e[s])),s++}}class re{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,a,i){this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=a,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=W(this,e,s),te(e)?e===b||e==null||e===""?(this._$AH!==b&&this._$AR(),this._$AH=b):e!==this._$AH&&e!==se&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):yt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==b&&te(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){var n;const{values:s,_$litType$:a}=e,i=typeof a=="number"?this._$AC(e):(a.el===void 0&&(a.el=ie.createElement(Ue(a.h,a.h[0]),this.options)),a);if(((n=this._$AH)==null?void 0:n._$AD)===i)this._$AH.p(s);else{const o=new At(i,this),l=o.u(this.options);o.p(s),this.T(l),this._$AH=o}}_$AC(e){let s=Be.get(e.strings);return s===void 0&&Be.set(e.strings,s=new ie(e)),s}k(e){Ce(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let a,i=0;for(const n of e)i===s.length?s.push(a=new re(this.O(ee()),this.O(ee()),this,this.options)):a=s[i],a._$AI(n),i++;i<s.length&&(this._$AR(a&&a._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){var a;for((a=this._$AP)==null?void 0:a.call(this,!1,!0,s);e!==this._$AB;){const i=He(e).nextSibling;He(e).remove(),e=i}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class ue{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,a,i,n){this.type=1,this._$AH=b,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=n,a.length>2||a[0]!==""||a[1]!==""?(this._$AH=Array(a.length-1).fill(new String),this.strings=a):this._$AH=b}_$AI(e,s=this,a,i){const n=this.strings;let o=!1;if(n===void 0)e=W(this,e,s,0),o=!te(e)||e!==this._$AH&&e!==se,o&&(this._$AH=e);else{const l=e;let d,v;for(e=n[0],d=0;d<n.length-1;d++)v=W(this,l[a+d],s,d),v===se&&(v=this._$AH[d]),o||(o=!te(v)||v!==this._$AH[d]),v===b?e=b:e!==b&&(e+=(v??"")+n[d+1]),this._$AH[d]=v}o&&!i&&this.j(e)}j(e){e===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class kt extends ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===b?void 0:e}}class St extends ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==b)}}class wt extends ue{constructor(e,s,a,i,n){super(e,s,a,i,n),this.type=5}_$AI(e,s=this){if((e=W(this,e,s,0)??b)===se)return;const a=this._$AH,i=e===b&&a!==b||e.capture!==a.capture||e.once!==a.once||e.passive!==a.passive,n=e!==b&&(a===b||i);i&&this.element.removeEventListener(this.name,this,a),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class Ct{constructor(e,s,a){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=a}get _$AU(){return this._$AM._$AU}_$AI(e){W(this,e)}}const he=Q.litHtmlPolyfillSupport;he==null||he(ie,re),(Q.litHtmlVersions??(Q.litHtmlVersions=[])).push("3.3.3");const _t=(t,e,s)=>{const a=e;let i=a._$litPart$;return i===void 0&&(a._$litPart$=i=new re(e.insertBefore(ee(),null),null,void 0,{})),i._$AI(t),i},Pt=document.getElementById("app");let m="available",I="all",$=[],A=[],ce=[],Et=null,R=null,ae=!1,Z="",me=null,L="",_="all",M="all",F="all",O="all",C="all",B="holds",P="all",oe="",ne="",X=!0,j=!1,k=null,Ae=!1,V=!1,q="",le="",be="Mathematics",ye="+15550199002";function h(t){Z=t,me&&clearTimeout(me),me=setTimeout(()=>{Z="",c()},1e4)}function _e(t){if(!t)return"Unknown date";const e=Date.now(),s=Math.floor((e-t)/1e3);if(s<60)return"Just now";const a=Math.floor(s/60);if(a<60)return`${a}m ago`;const i=Math.floor(a/60);if(i<24)return`${i}h ago`;const n=Math.floor(i/24);return n===1?"Yesterday":n<30?`${n}d ago`:new Date(t).toLocaleDateString()}function T(t){return t?new Date(t).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function pe(t){switch(t){case"Mathematics":return"badge-math";case"Science":return"badge-science";case"Languages":return"badge-languages";case"Humanities":return"badge-humanities";case"Arts":return"badge-arts";default:return"badge-active"}}function We(t){switch(t){case"PrimarySchool":return"badge-primary";case"MiddleSchool":return"badge-middle";case"HighSchool":return"badge-high";case"UniversityPrep":return"badge-uniprep";default:return"badge-active"}}function It(t){switch(t){case"PrimarySchool":return"Primary (Years 1-6)";case"MiddleSchool":return"Middle School (Years 7-9)";case"HighSchool":return"High School (Years 10-13)";case"UniversityPrep":return"Uni Prep";default:return t||"General"}}function Fe(t){switch(t){case"New":return r`
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">
          Verified New
        </span>
      `;case"LikeNew":return r`
        <span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);">
          Like New
        </span>
      `;case"Good":return r`
        <span class="badge" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);">
          Good Condition
        </span>
      `;case"Acceptable":return r`
        <span class="badge" style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);">
          Acceptable
        </span>
      `;default:return r`<span class="badge badge-active">${t||"Good"}</span>`}}function Ye(t){if(!t)return!0;const e=Date.now();if(P==="today"){const s=new Date;return s.setHours(0,0,0,0),t>=s.getTime()}if(P==="7days"){const s=e-6048e5;return t>=s}if(P==="30days"){const s=e-2592e6;return t>=s}if(P==="custom"){let s=!0;if(oe){const a=new Date(oe).setHours(0,0,0,0);t<a&&(s=!1)}if(ne){const a=new Date(ne).setHours(23,59,59,999);t>a&&(s=!1)}return s}return!0}function Ht(t){return t.filter(e=>{if(L.trim()){const s=L.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(s)||e.concept&&e.concept.toLowerCase().includes(s)||e.description&&e.description.toLowerCase().includes(s)||e.domain&&e.domain.toLowerCase().includes(s)||e.providerCategory&&e.providerCategory.toLowerCase().includes(s)||e.sellerPhone&&e.sellerPhone.toLowerCase().includes(s)))return!1}return!(_!=="all"&&e.domain!==_||M!=="all"&&e.providerCategory!==M||F!=="all"&&e.conditionType!==F||O!=="all"&&e.sellerPhone!==O||C!=="all"&&e.status!==C||!Ye(e.createdAt))}).sort((e,s)=>{const a=e.createdAt||0,i=s.createdAt||0;return X?i-a:a-i})}function ke(t,e){return t.filter(s=>{if(s.status!==e)return!1;if(L.trim()){const a=L.toLowerCase().trim();if(!(s.requestedQuery&&s.requestedQuery.toLowerCase().includes(a)||s.concept&&s.concept.toLowerCase().includes(a)||s.domain&&s.domain.toLowerCase().includes(a)||s.userPhone&&s.userPhone.toLowerCase().includes(a)||s.handoverCode&&s.handoverCode.toLowerCase().includes(a)))return!1}return!(_!=="all"&&s.domain!==_||!Ye(s.createdAt))}).sort((s,a)=>{const i=s.matchedAt||s.createdAt||0,n=a.matchedAt||a.createdAt||0;return X?n-i:i-n})}function Mt(){let t=0;return L.trim()&&t++,_!=="all"&&t++,M!=="all"&&t++,F!=="all"&&t++,O!=="all"&&t++,C!=="all"&&t++,P!=="all"&&t++,t}function Ge(){L="",_="all",M="all",F="all",O="all",C="all",P="all",oe="",ne="",c()}async function S(){ae=!0,c();try{try{await y.releaseExpiredHolds()}catch{}const[t,e,s,a,i]=await Promise.all([y.listInventory(),y.listDemands(),y.getLifecycleEvents(),y.getSecurityObservabilityStatus(),y.getSupplyGaps()]);$=t||[],A=e||[],ce=s||[],Et=a||null,R=i||null}catch(t){console.error("Failed to load dashboard data:",t),h(`❌ Failed to load data: ${t.message}`)}finally{ae=!1,c()}}async function Tt(t){Ae=!0,j=!0,k=null,c();try{k=await y.getSellerStorefront(t)}catch(e){h(`❌ Failed to load seller storefront: ${e.message}`),j=!1}finally{Ae=!1,c()}}async function Lt(){try{const t=await y.verifyWebhook("subscribe","my_verify_token_123",`challenge_${Date.now()}`);t.status===200?h(`✅ Handshake Verified! Echoed challenge: "${t.challenge}"`):h(`❌ Verification failed: ${t.error}`)}catch(t){h(`❌ Error verifying webhook: ${t.message}`)}S()}async function U(t,e="+15550199001"){var s,a,i,n;h(`🚀 Processing simulated WhatsApp message: "${t}"...`),c();try{const o={media_id:`media_${Date.now()}`,from_phone:e,message_text:t},l=await y.handleWebhook(o);((s=l.result)==null?void 0:s.status)==="matched"?(h(`🎉 Match Connected! Matched wishlist ID: ${l.result.matchedDemandId}`),m="matches"):((a=l.result)==null?void 0:a.status)==="needs_year_clarification"?h("ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!"):((i=l.result)==null?void 0:i.status)==="greeting"?h("👋 Greeting Handled: Welcome & Guide sent."):(h(`📦 Book Listed into Inventory! Item ID: ${((n=l.result)==null?void 0:n.itemId)||"saved"}`),m="available")}catch(o){h(`❌ Webhook simulation error: ${o.message}`)}S()}async function Se(t,e,s="Mathematics",a="+15550199002"){h(`⏳ Registering demand for "${e}" (${t})...`),c();try{const i=await y.createDemand(a,e,t,s);h(`✨ Wishlist demand registered: "${i.requestedQuery}"!`),V=!1,m="pendings"}catch(i){h(`❌ Error adding demand: ${i.message}`)}S()}async function qe(t){try{await y.deleteDemand(t),h("🗑️ Removed demand entry."),A=A.filter(e=>e.demandId!==t),c()}catch(e){h(`❌ Error removing demand: ${e.message}`)}}async function Dt(t){try{await y.deleteInventory(t),h("🗑️ Removed inventory item."),$=$.filter(e=>e.itemId!==t),c()}catch(e){h(`❌ Error removing inventory: ${e.message}`)}}async function Ve(){h("🔒 Validating HMAC-SHA256 Payload Signature..."),c();try{const t="secret_key_whatsapp_demo_1234",e=JSON.stringify({test:"hmac-verification",timestamp:Date.now()}),s=new TextEncoder,a=await crypto.subtle.importKey("raw",s.encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),i=await crypto.subtle.sign("HMAC",a,s.encode(e)),n=Array.from(new Uint8Array(i)).map(l=>l.toString(16).padStart(2,"0")).join("");(await y.validateSignature(e,`sha256=${n}`,t)).valid?h("🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified."):h("❌ HMAC Verification Failed!")}catch(t){h(`❌ HMAC test error: ${t.message}`)}S()}function Rt(){const t=A.filter(n=>n.status==="pending").length,e=A.filter(n=>n.status==="matched").length,s=A.filter(n=>n.status==="fulfilled").length||$.filter(n=>n.status==="sold").length,a=$.filter(n=>n.status==="active").length,i=ce.length;return r`
    <div class="stats-row">
      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="available",C="active",c()}}>
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${a}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="pendings",c()}}>
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="matches",B="holds",c()}}>
        <div class="stat-icon" style="background:rgba(99,102,241,0.15);color:#818cf8;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${e}</div>
          <div class="stat-label">48H Active Holds</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="matches",B="completed",c()}}>
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🎓</div>
        <div class="stat-info">
          <div class="stat-value">${s}</div>
          <div class="stat-label">Sold & Completed</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="observability",c()}}>
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">📊</div>
        <div class="stat-info">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Live Events</div>
        </div>
      </div>
    </div>
  `}function Bt(){const t=A.filter(i=>i.status==="pending").length,e=A.filter(i=>i.status==="matched").length,s=A.filter(i=>i.status==="fulfilled").length||$.filter(i=>i.status==="sold").length,a=$.filter(i=>i.status==="active").length;return r`
    <div class="tabs-nav">
      <button
        class="tab-btn ${m==="available"?"active":""}"
        @click=${()=>{m="available",c()}}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${a}</span>
      </button>

      <button
        class="tab-btn ${m==="pendings"?"active":""}"
        @click=${()=>{m="pendings",c()}}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${t}</span>
      </button>

      <button
        class="tab-btn ${m==="matches"?"active":""}"
        @click=${()=>{m="matches",c()}}
      >
        <span>🤝 Matches & Sales</span>
        <span class="tab-count">${e+s}</span>
      </button>

      <button
        class="tab-btn ${m==="webhook"?"active":""}"
        @click=${()=>{m="webhook",c()}}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${m==="observability"?"active":""}"
        @click=${()=>{m="observability",c()}}
      >
        <span>📊 Observability & Stream</span>
      </button>
    </div>
  `}function Nt(){return R?r`
    <div class="card" style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">Community Supply Deficit Alert (Feature 3B)</h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in: 
            <strong>${R.deficitSubjects.map(t=>`${t.domain} (${t.count})`).join(", ")}</strong> 
            and grades <strong>${R.deficitGrades.map(t=>t.grade).join(", ")}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${()=>{h(`📢 Broadcast Dispatched to WhatsApp Group: "${R==null?void 0:R.broadcastMessageEn}"`)}}
          >
            🚀 Broadcast Supply Call
          </button>
        </div>
      </div>
    </div>
  `:""}function Pe(t=!0){const e=Mt(),s=Array.from(new Set($.map(a=>a.sellerPhone).filter(Boolean)));return r`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or phone..."
            .value=${L}
            @input=${a=>{L=a.target.value,c()}}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${_}
          @change=${a=>{_=a.target.value,c()}}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${t?r`
              <select
                class="filter-select"
                .value=${M}
                @change=${a=>{M=a.target.value,c()}}
              >
                <option value="all">🏫 All Classes / Levels</option>
                <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                <option value="UniversityPrep">🏛️ University Prep</option>
              </select>
            `:""}

        <!-- Condition Selector (Feature 3D) -->
        ${t?r`
              <select
                class="filter-select"
                .value=${F}
                @change=${a=>{F=a.target.value,c()}}
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
                .value=${C}
                @change=${a=>{C=a.target.value,c()}}
              >
                <option value="all">📦 All Statuses (${$.length})</option>
                <option value="active">🟢 Available (${$.filter(a=>a.status==="active").length})</option>
                <option value="reserved">⏳ On Hold (${$.filter(a=>a.status==="reserved").length})</option>
                <option value="sold">🎓 Sold & Completed (${$.filter(a=>a.status==="sold").length})</option>
              </select>
            `:""}

        <!-- Seller Filter (Feature 3A) -->
        ${s.length>1?r`
              <select
                class="filter-select"
                .value=${O}
                @change=${a=>{O=a.target.value,c()}}
              >
                <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                ${s.map(a=>r`<option value="${a}">Seller: ${a}</option>`)}
              </select>
            `:""}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${P}
          @change=${a=>{P=a.target.value,c()}}
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
          @click=${()=>{X=!X,c()}}
        >
          ${X?"⬇️ Newest First":"⬆️ Oldest First"}
        </button>

        <!-- Reset Button -->
        ${e>0?r`
              <button class="danger sm" @click=${Ge}>
                ✕ Reset (${e})
              </button>
            `:""}
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${P==="custom"?r`
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;">
              <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;">Custom Created Date:</span>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${oe}
                  @change=${a=>{oe=a.target.value,c()}}
                />
              </div>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${ne}
                  @change=${a=>{ne=a.target.value,c()}}
                />
              </div>
            </div>
          `:""}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${["all","Mathematics","Science","Languages","Humanities","Arts"].map(a=>r`
              <button
                class="pill ${_===a?"active":""}"
                @click=${()=>{_=a,c()}}
              >
                ${a==="all"?"All Subjects":a}
              </button>
            `)}
        </div>

        ${t?r`
              <div class="pill-group">
                <span class="pill-label">Classes:</span>
                ${[{id:"all",label:"All Levels"},{id:"PrimarySchool",label:"Primary"},{id:"MiddleSchool",label:"Middle"},{id:"HighSchool",label:"High"},{id:"UniversityPrep",label:"Uni Prep"}].map(a=>r`
                    <button
                      class="pill ${M===a.id?"active":""}"
                      @click=${()=>{M=a.id,c()}}
                    >
                      ${a.label}
                    </button>
                  `)}
              </div>
            `:""}
      </div>
    </div>
  `}function zt(){const t=Ht($);return r`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>📚 ${C==="sold"?"Sold & Completed Books Archive":C==="reserved"?"On-Hold Inventory":"Available Books Catalog"}</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${C==="sold"?"Archived record of sold books, verified handovers, and buyer details.":C==="reserved"?"Books currently on 48-hour hold awaiting physical exchange.":"Active inventory extracted from WhatsApp parent messages, categorized by class and subject (Sorted newest first)."}
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;">
          <!-- View Grouping Selector -->
          <div style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;">
            <button
              class="sm ${I==="all"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{I="all",c()}}
            >
              Grid
            </button>
            <button
              class="sm ${I==="by-subject"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{I="by-subject",c()}}
            >
              By Subject
            </button>
            <button
              class="sm ${I==="by-class"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{I="by-class",c()}}
            >
              By Class
            </button>
          </div>
          <button class="secondary sm" @click=${S}>
            ${ae?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      <!-- Feature 3B: Supply Gaps Alert -->
      ${Nt()}

      ${Pe(!0)}

      ${t.length===0?r`
            <div class="empty-state">
              <div class="empty-state-icon">📖</div>
              <div class="empty-state-title">No books match your current filters</div>
              <div class="empty-state-text">
                Try clearing your search keyword, selecting "All Subjects" / "All Dates", or simulate a book upload in the Webhook tab.
              </div>
              <button class="secondary sm" style="margin-top:10px;" @click=${Ge}>
                Clear All Filters
              </button>
            </div>
          `:I==="all"?r`
            <div class="items-grid">
              ${t.map(e=>Ee(e))}
            </div>
          `:I==="by-subject"?Ot(t):jt(t)}
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${Ut()}
  `}function Ee(t){const e=t.status==="sold",s=t.status==="reserved";return r`
    <div
      class="item-card"
      style="${e?"border-left: 3px solid var(--success);":s?"border-left: 3px solid #6366f1;":""}"
    >
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${t.title}</div>
          <div class="book-concept">${t.concept}</div>
        </div>
        <div style="display:flex;gap:6px;align-items:center;">
          ${e?r`<span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">SOLD 🎓</span>`:s?r`<span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.35);">HOLD ⏳</span>`:""}
          <span class="badge ${pe(t.domain)}">
            ${t.domain}
          </span>
        </div>
      </div>

      <div class="tags-row">
        <span class="badge ${We(t.providerCategory)}">
          ${It(t.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${Fe(t.conditionType)}
        ${t.handoverCode?r`<span class="badge" style="background:rgba(16,185,129,0.12);color:#34d399;border:1px solid rgba(16,185,129,0.25);">Code: #${t.handoverCode}</span>`:""}
      </div>

      ${t.description?r`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${t.description}</div>`:""}

      ${e?r`
            <div style="background:rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#6ee7b7;display:flex;flex-direction:column;gap:3px;">
              <div>🎓 <strong>Handover Completed</strong> ${t.soldToPhone?r`to <strong style="color:var(--text);">${t.soldToPhone}</strong>`:""}</div>
              ${t.soldAt?r`<div style="font-size:0.75rem;color:var(--text-dim);">Sold on ${T(t.soldAt)}</div>`:""}
            </div>
          `:s?r`
            <div style="background:rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);padding:8px 10px;border-radius:8px;font-size:0.8rem;color:#a5b4fc;">
              ⏳ <strong>Reserved on 48h Hold</strong> ${t.reservedForPhone?r`for <strong style="color:var(--text);">${t.reservedForPhone}</strong>`:""}
            </div>
          `:""}

      <div class="card-footer">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <!-- Feature 3A: Clickable Seller Storefront Link -->
          <div style="font-size:0.75rem;color:var(--text-dim);">
            Seller: 
            <button
              class="secondary sm"
              style="padding:2px 6px;font-size:0.72rem;margin-left:4px;display:inline-flex;"
              title="Click to view full family collection & grade bundles"
              @click=${()=>Tt(t.sellerPhone)}
            >
              👨‍👩‍👧 ${t.sellerPhone||"Parent"} Storefront
            </button>
          </div>
          <div class="date-badge" title="${T(t.createdAt)}">
            📅 ${_e(t.createdAt)} (${T(t.createdAt)})
          </div>
        </div>
        <button
          class="danger sm"
          style="padding:4px 8px;font-size:0.72rem;"
          title="Remove from active inventory"
          @click=${()=>Dt(t.itemId)}
        >
          🗑️
        </button>
      </div>
    </div>
  `}function Ot(t){return r`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${["Mathematics","Science","Languages","Humanities","Arts"].map(s=>{const a=t.filter(i=>i.domain===s);return a.length===0?"":r`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s}</h4>
              <span class="badge ${pe(s)}">${a.length} Available</span>
            </div>
            <div class="items-grid">
              ${a.map(i=>Ee(i))}
            </div>
          </div>
        `})}
    </div>
  `}function jt(t){return r`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[{key:"PrimarySchool",label:"Primary School (Years 1 - 6)"},{key:"MiddleSchool",label:"Middle School (Years 7 - 9)"},{key:"HighSchool",label:"High School (Years 10 - 13)"},{key:"UniversityPrep",label:"University Prep"}].map(s=>{const a=t.filter(i=>i.providerCategory===s.key);return a.length===0?"":r`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s.label}</h4>
              <span class="badge ${We(s.key)}">${a.length} Available</span>
            </div>
            <div class="items-grid">
              ${a.map(i=>Ee(i))}
            </div>
          </div>
        `})}
    </div>
  `}function Ut(){return j?r`
    <div
      style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"
      @click=${t=>{t.target===t.currentTarget&&(j=!1,c())}}
    >
      <div class="card" style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;">
        ${Ae?r`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">Loading Family Storefront...</div>`:k?r`
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">
                <div>
                  <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;">
                    👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                  </div>
                  <h3 style="font-size:1.4rem;">Parent Storefront: ${k.sellerPhone}</h3>
                  <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                    Total <strong>${k.totalBooks} textbooks</strong> available across multiple grades.
                  </p>
                </div>
                <button class="secondary sm" @click=${()=>{j=!1,c()}}>
                  ✕ Close
                </button>
              </div>

              <!-- Grade Bundles Section -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📦 Available Grade Bundles</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;">
                  ${k.bundles.map(t=>r`
                      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;">
                        <div style="font-weight:700;font-size:0.95rem;color:#fff;">${t.grade} Bundle</div>
                        <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">${t.count} Books Available</div>
                        <button
                          class="secondary sm"
                          style="margin-top:8px;width:100%;font-size:0.72rem;"
                          @click=${()=>{h(`💬 WhatsApp Bundle Request sent to seller ${k==null?void 0:k.sellerPhone} for all ${t.count} books in ${t.grade}!`)}}
                        >
                          Request Entire Bundle
                        </button>
                      </div>
                    `)}
                </div>
              </div>

              <!-- Individual Books List -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📖 All Books from this Parent</h4>
                <div style="display:flex;flex-direction:column;gap:8px;max-height:260px;overflow-y:auto;">
                  ${k.items.map(t=>r`
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;">
                        <div>
                          <div style="font-weight:600;font-size:0.88rem;color:#fff;">${t.title}</div>
                          <div style="font-size:0.75rem;color:var(--text-dim);">${t.domain} &bull; ${t.concept}</div>
                        </div>
                        <div>
                          ${Fe(t.conditionType)}
                        </div>
                      </div>
                    `)}
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">
                <button
                  class="secondary"
                  @click=${()=>{O=(k==null?void 0:k.sellerPhone)||"all",j=!1,c()}}
                >
                  Filter Main Catalog by this Seller
                </button>
              </div>
            `:""}
      </div>
    </div>
  `:""}function Wt(){const t=ke(A,"pending");return r`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>⏳ Pending Wishlists & Demands</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="sm" @click=${()=>{V=!0,c()}}>
            + Create Demand
          </button>
          <button class="secondary sm" @click=${S}>
            ${ae?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Pe(!1)}

      ${t.length===0?r`
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <div class="empty-state-title">No pending wishlists found</div>
              <div class="empty-state-text">
                All requests have either been matched or no parents are waiting for books right now.
              </div>
              <button
                class="sm"
                style="margin-top:10px;"
                @click=${()=>Se("Year5Chemistry","Year 5 Chemistry","Science")}
              >
                + Add Demo "Year 5 Chemistry" Demand
              </button>
            </div>
          `:r`
            <div class="items-grid">
              ${t.map(e=>r`
                  <div class="item-card" style="border-left: 3px solid var(--warning);">
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${e.requestedQuery}</div>
                        <div class="book-concept">Concept: ${e.concept}</div>
                      </div>
                      <span class="badge badge-pending">PENDING</span>
                    </div>

                    <div class="tags-row">
                      <span class="badge ${pe(e.domain)}">
                        ${e.domain||"Marketplace"}
                      </span>
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Waiting Parent: <strong style="color:var(--text);">${e.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${T(e.createdAt)}">
                          📅 ${_e(e.createdAt)} (${T(e.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        <button
                          class="secondary sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Simulate seller offering this book to trigger automatic match"
                          @click=${()=>U(`I have ${e.requestedQuery} available for Year parent`,"+15559998888")}
                        >
                          ⚡ Match
                        </button>
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>qe(e.demandId)}
                        >
                          🗑️
                        </button>
                      </div>
                    </div>
                  </div>
                `)}
            </div>
          `}
    </div>

    <!-- Quick Add Demand Modal -->
    ${V?r`
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
            @click=${e=>{e.target===e.currentTarget&&(V=!1,c())}}
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
                    .value=${q}
                    @input=${e=>{q=e.target.value,le=e.target.value.replace(/[^a-zA-Z0-9]/g,"")}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Normalized Concept Key</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="e.g. Year10Physics"
                    style="padding-left:14px;"
                    .value=${le}
                    @input=${e=>{le=e.target.value}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Subject Domain</label>
                  <select
                    class="filter-select"
                    style="width:100%;"
                    .value=${be}
                    @change=${e=>{be=e.target.value}}
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
                    .value=${ye}
                    @input=${e=>{ye=e.target.value}}
                  />
                </div>

                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                  <button class="secondary" @click=${()=>{V=!1,c()}}>
                    Cancel
                  </button>
                  <button
                    @click=${()=>{q.trim()&&Se(le||q.replace(/[^a-zA-Z0-9]/g,""),q,be,ye)}}
                  >
                    Save Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        `:""}
  `}function Ft(){const t=ke(A,"matched"),e=ke(A,"fulfilled"),s=B==="completed",a=s?e:t;return r`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>${s?"🎓 Completed Book Exchanges & Sold Archive":"🤝 Matched Pairs & 48-Hour Reservations"}</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            ${s?"Verified physical handovers. Each record preserves the buyer, seller, handover verification code, and completion date.":"Demands matched with available books. Holds automatically release after 48 hours if handover is not confirmed."}
          </p>
        </div>
        <div style="display:flex;gap:10px;align-items:center;flex-wrap:wrap;">
          <!-- View Toggle: Active Holds vs Completed / Sold -->
          <div style="display:flex;background:rgba(0,0,0,0.4);border:1px solid var(--surface-border);border-radius:8px;padding:3px;">
            <button
              class="sm ${B==="holds"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{B="holds",c()}}
            >
              ⏳ Active Holds (${A.filter(i=>i.status==="matched").length})
            </button>
            <button
              class="sm ${B==="completed"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{B="completed",c()}}
            >
              🎓 Completed & Sold (${A.filter(i=>i.status==="fulfilled").length})
            </button>
          </div>

          ${s?"":r`
                <button
                  class="secondary sm"
                  title="Proactively sweep and release all expired 48H holds"
                  @click=${async()=>{const i=await y.releaseExpiredHolds();h(`🧹 Swept holds: ${i.releasedCount} expired hold(s) released back to active inventory.`),await S()}}
                >
                  🧹 Sweep Holds
                </button>
              `}
          <button class="secondary sm" @click=${S}>
            ${ae?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Pe(!1)}

      ${a.length===0?r`
            <div class="empty-state">
              <div class="empty-state-icon">${s?"🎓":"🤝"}</div>
              <div class="empty-state-title">
                ${s?"No completed book exchanges found":"No active matched pairs found"}
              </div>
              <div class="empty-state-text">
                ${s?"When parents complete a physical book exchange and confirm via WhatsApp or the Mark Sold action, it will appear here.":"When a seller lists a book that matches a waiting parent's wishlist, it will be placed on a 48-hour hold and displayed here."}
              </div>
              ${s?"":r`
                    <div style="margin-top:12px;display:flex;gap:10px;">
                      <button
                        class="secondary sm"
                        @click=${async()=>{await Se("Year8Science","Year 8 Science","Science","+15559990001"),await U("I have Year 8 Science textbook in great shape","+15559990002")}}
                      >
                        ⚡ Run Auto-Match Simulation
                      </button>
                    </div>
                  `}
            </div>
          `:r`
            <div class="items-grid">
              ${a.map(i=>{const n=i.matchedAt||i.createdAt||Date.now(),o=2880*60*1e3,l=n+o-Date.now(),d=i.status!=="fulfilled"&&l<=0,v=Math.max(1,Math.ceil(l/(1e3*60*60))),f=$.find(u=>u.itemId===i.matchedItemId);return r`
                  <div
                    class="item-card"
                    style="border-left: 3px solid ${i.status==="fulfilled"?"var(--success)":d?"#ef4444":"#6366f1"};"
                  >
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${i.requestedQuery}</div>
                        <div class="book-concept">Concept: ${i.concept}</div>
                      </div>
                      ${i.status==="fulfilled"?r`<span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">COMPLETED / SOLD 🎓</span>`:d?r`<span class="badge" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);">HOLD EXPIRED</span>`:r`<span class="badge badge-matched">48H HOLD (${v}h left)</span>`}
                    </div>

                    <div class="tags-row">
                      <span class="badge ${pe(i.domain)}">
                        ${i.domain||"Marketplace"}
                      </span>
                      ${i.handoverCode?r`<span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);">Code: #${i.handoverCode}</span>`:""}
                    </div>

                    <div
                      style="background:${i.status==="fulfilled"?"rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#6ee7b7;":d?"rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;":"rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;"};padding:10px 12px;border-radius:8px;font-size:0.83rem;"
                    >
                      ${i.status==="fulfilled"?r`
                            <div>✅ <strong>Handover verified & completed!</strong> Book marked as sold and removed from active catalog.</div>
                            <div style="margin-top:6px;display:flex;flex-direction:column;gap:3px;font-size:0.8rem;color:var(--text-muted);">
                              ${f!=null&&f.sellerPhone?r`<div>Seller: <strong style="color:var(--text);">${f.sellerPhone}</strong> ${f.title?`(${f.title})`:""}</div>`:""}
                              <div>Buyer: <strong style="color:var(--text);">${i.userPhone}</strong></div>
                              ${f!=null&&f.soldAt||i.matchedAt?r`<div>Completed: <strong>${T((f==null?void 0:f.soldAt)||i.matchedAt)}</strong></div>`:""}
                            </div>
                          `:d?"⚠️ 48-Hour hold has elapsed without physical exchange. Book can be returned to community circulation.":`⏳ 48-Hour Reservation Active (${v}h remaining). Matched parents introduced via WhatsApp.`}
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          ${i.status==="fulfilled"?"Buyer Phone:":"Recipient Parent:"} <strong style="color:var(--text);">${i.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${T(i.createdAt)}">
                          ${_e(i.createdAt)} (${T(i.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        ${i.status!=="fulfilled"?r`
                              <button
                                class="sm"
                                style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                title="Confirm physical handover and mark book sold"
                                @click=${async()=>{await y.confirmHandover({itemId:i.matchedItemId||"",demandId:i.demandId}),h("Handover confirmed! Book marked as sold."),await S()}}
                              >
                                Mark Sold
                              </button>
                            `:""}
                        ${d?r`
                              <button
                                class="secondary sm"
                                style="font-size:0.72rem;padding:4px 8px;"
                                title="Release expired hold back to active community inventory"
                                @click=${async()=>{await y.releaseHold({itemId:i.matchedItemId,demandId:i.demandId}),h("Hold released! Book returned to active catalog."),await S()}}
                              >
                                🔄 Release Hold
                              </button>
                            `:""}
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>qe(i.demandId)}
                        >
                          Delete
                        </button>
                      </div>
                    </div>
                  </div>
                `})}
            </div>
          `}
    </div>
  `}function Yt(){return r`
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
              @click=${()=>U("Year 5 Chemistry Textbook - Pristine Condition")}
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
              @click=${()=>U("I have Year 12 Computer Science Book")}
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
              @click=${()=>U("J'ai un livre de physique pour la classe de 3ème")}
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
              @click=${()=>U("I have Chemistry books available for anyone who wants them")}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;">
          <button @click=${Lt}>
            🔗 Test GET Webhook Handshake (hub.challenge)
          </button>
          <button class="secondary" @click=${Ve}>
            🔐 Test HMAC-SHA256 Payload Signature
          </button>
        </div>
      </div>
    </div>
  `}function Gt(){return r`
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
          <button class="secondary sm" @click=${Ve}>
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
          <button class="secondary sm" @click=${S}>
            🔄 Refresh Stream
          </button>
        </div>

        <div class="terminal-log">
          ${ce.length===0?r`<div style="color:var(--text-muted);padding:12px 0;">Waiting for lifecycle events...</div>`:ce.slice().reverse().map(t=>r`
                    <div class="log-entry">
                      <span class="log-time">[${new Date(t.timestamp).toLocaleTimeString([],{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
                      <span class="log-type">${t.eventType}</span>
                      <span class="log-details">${JSON.stringify(t.details)}</span>
                    </div>
                  `)}
        </div>
      </div>
    </div>
  `}function c(){_t(r`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${Z?r`
              <div class="status-banner">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:1.1rem;">🔔</span>
                  <span>${Z}</span>
                </div>
                <button
                  class="secondary sm"
                  style="padding:2px 8px;font-size:0.75rem;"
                  @click=${()=>{Z="",c()}}
                >
                  ✕
                </button>
              </div>
            `:""}

        <!-- Top Level Stats Summary -->
        ${Rt()}

        <!-- Tab Bar Navigation -->
        ${Bt()}

        <!-- Active Tab Content -->
        ${m==="available"?zt():m==="pendings"?Wt():m==="matches"?Ft():m==="webhook"?Yt():Gt()}
      </div>
    `,Pt)}S();
