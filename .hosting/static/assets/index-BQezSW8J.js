var qe=Object.defineProperty;var Ke=(t,e,s)=>e in t?qe(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var pe=(t,e,s)=>Ke(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const a of document.querySelectorAll('link[rel="modulepreload"]'))i(a);new MutationObserver(a=>{for(const r of a)if(r.type==="childList")for(const n of r.addedNodes)n.tagName==="LINK"&&n.rel==="modulepreload"&&i(n)}).observe(document,{childList:!0,subtree:!0});function s(a){const r={};return a.integrity&&(r.integrity=a.integrity),a.referrerPolicy&&(r.referrerPolicy=a.referrerPolicy),a.crossOrigin==="use-credentials"?r.credentials="include":a.crossOrigin==="anonymous"?r.credentials="omit":r.credentials="same-origin",r}function i(a){if(a.ep)return;a.ep=!0;const r=s(a);fetch(a.href,r)}})();const Ve="modulepreload",Je=function(t){return"/"+t},_e={},Qe=function(e,s,i){let a=Promise.resolve();if(s&&s.length>0){let n=function(p){return Promise.all(p.map(g=>Promise.resolve(g).then(c=>({status:"fulfilled",value:c}),c=>({status:"rejected",reason:c}))))};document.getElementsByTagName("link");const o=document.querySelector("meta[property=csp-nonce]"),l=(o==null?void 0:o.nonce)||(o==null?void 0:o.getAttribute("nonce"));a=n(s.map(p=>{if(p=Je(p),p in _e)return;_e[p]=!0;const g=p.endsWith(".css"),c=g?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${p}"]${c}`))return;const h=document.createElement("link");if(h.rel=g?"stylesheet":Ve,g||(h.as="script"),h.crossOrigin="",h.href=p,l&&h.setAttribute("nonce",l),document.head.appendChild(h),g)return new Promise((x,w)=>{h.addEventListener("load",x),h.addEventListener("error",()=>w(new Error(`Unable to preload CSS for ${p}`)))})}))}function r(n){const o=new Event("vite:preloadError",{cancelable:!0});if(o.payload=n,window.dispatchEvent(o),!o.defaultPrevented)throw n}return a.then(n=>{for(const o of n||[])o.status==="rejected"&&r(o.reason);return e().catch(r)})},Ze="ApiError";class Xe extends Error{constructor(s,i,a){super(s,a!=null&&a.cause?{cause:a.cause}:void 0);pe(this,"status");pe(this,"retriable");this.name=(a==null?void 0:a.name)??Ze,this.status=i,this.retriable=(a==null?void 0:a.retriable)??!1}}const et="2.0";let tt=1;function st(t,e,s){return JSON.stringify({jsonrpc:et,method:`${t}.${e}`,params:s,id:tt++})}function it(t){const e=t;if(e.error){const{code:s,message:i,data:a}=e.error,r=s>0?s:500;throw new Xe(i,r,{...a!=null&&a.name?{name:a.name}:{},...(a==null?void 0:a.retriable)===!0?{retriable:!0}:{}})}return e.result}var _={};const at=typeof window>"u";function nt(){if(!at||typeof globalThis>"u")return;const t=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!t||typeof t.getStore!="function"))return t.getStore()}let q=null,W=null;async function rt(){return q||W||(W=ot().catch(t=>{throw W=null,t}),W)}async function ot(){var s;if(q)return q;function t(i){if(!i||typeof i!="string"||!i.trim()||i==="undefined"||i.startsWith("undefined"))return!0;if(i.startsWith("/"))return!1;try{const a=new URL(i);return a.hostname==="undefined"||a.pathname==="/undefined"||a.pathname.startsWith("/undefined/")}catch{return!0}}function e(i,a){if(!i||typeof i!="string"||t(i))throw new Error(`Blocks API URL is not configured (source: ${a}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return q=i,i}if(typeof process<"u"&&(_!=null&&_.BLOCKS_API_URL)){const i=_.BLOCKS_API_URL;if(/\$\{Token\[/.test(i))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const a=e(i,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",a),a}if(typeof process<"u"&&(_!=null&&_.BLOCKS_CONFIG))try{const i=JSON.parse(_.BLOCKS_CONFIG),a=e(i.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",a),a}catch{}if(typeof process<"u"&&((s=process.versions)!=null&&s.node))try{const i=await Qe(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),a=JSON.parse(i.readFileSync(".blocks-sandbox/config.json","utf-8")),r=e(a.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",r),r}catch{}try{const i=await fetch("/.blocks-sandbox/config.json");if(i.ok){const a=await i.json(),r=e(a.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",r),r}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const Ae=[];function Le(t){Ae.push(t)}async function lt(t){for(const e of Ae)if(e.onRequest){const s=await e.onRequest(t);s&&(t=s)}return t}function dt(t){for(const e of Ae)e.onResponse&&(t=e.onResponse(t));return t}function f(t,e){return new Proxy({},{get(s,i){if(typeof i!="symbol")return async(...a)=>{const r=await rt();let n={apiNamespace:t,method:i,args:a,headers:{"Content-Type":"application/json"}};n=await lt(n);const o=nt();if(o){const c="Cookie"in n.headers?"Cookie":"cookie"in n.headers?"cookie":null,h=c?n.headers[c]:void 0;if(c&&c!=="Cookie"&&delete n.headers[c],h){const x=new Set(h.split(";").filter(Boolean).map(ue=>ue.trim().split("=")[0])),w=o.split(";").filter(Boolean).filter(ue=>!x.has(ue.trim().split("=")[0])).join("; ");n.headers.Cookie=w?`${h}; ${w}`:h}else n.headers.Cookie=o}const p=await(await fetch(r,{method:"POST",headers:n.headers,credentials:"include",body:st(n.apiNamespace,n.method,n.args)})).json(),g=it(p);return dt(g)}}})}function ct(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/download"&&typeof e.url=="string"}function ut(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/upload"&&typeof e.url=="string"}function be(t){if(ct(t)){const{url:e}=t;return{async download(){const s=await fetch(e);if(!s.ok)throw new Error(`Download failed: ${s.status}`);return s.blob()},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/download",url:e}}}}if(ut(t)){const{url:e,contentType:s}=t;return{async upload(i){const a={};s&&(a["Content-Type"]=s);const r=await fetch(e,{method:"PUT",body:i,headers:a});if(!r.ok)throw new Error(`Upload failed: ${r.status}`)},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/upload",url:e,contentType:s}}}}if(Array.isArray(t))return t.map(be);if(typeof t=="object"&&t!==null){const e={};for(const[s,i]of Object.entries(t))e[s]=be(i);return e}return t}Le({onResponse:be});const pt=540*1e3,K=new Map;function ft(t,e){let s=K.get(t);if(s)return s;s={ws:void 0,connected:!1,subscriptions:new Map,pendingEstablished:new Map,pendingSubs:[],keepAliveTimer:null,disconnectHandlers:new Set},K.set(t,s);const i=`${t}?token=${encodeURIComponent(e)}`,a=new WebSocket(i);return s.ws=a,a.onopen=()=>{s.connected=!0;for(const r of s.pendingSubs)a.send(JSON.stringify({action:"subscribe",channel:r.channel,token:r.token}));s.pendingSubs.length=0,s.keepAliveTimer=setInterval(()=>{a.readyState===WebSocket.OPEN&&a.send(JSON.stringify({action:"ping"}))},pt)},a.onmessage=r=>{try{const n=JSON.parse(r.data);if(n.type==="subscribe_success"&&n.channel){const o=s.pendingEstablished.get(n.channel);o&&(o.forEach(l=>l.resolve()),s.pendingEstablished.delete(n.channel))}else if(n.type==="error"&&n.channel){const o=s.pendingEstablished.get(n.channel);if(o){const l=new Error(n.message||"Subscription rejected");l.name="ConnectionFailedException",o.forEach(p=>p.reject(l)),s.pendingEstablished.delete(n.channel)}s.subscriptions.delete(n.channel)}else if(n.type==="message"&&n.channel){const o=s.subscriptions.get(n.channel);o&&o.forEach(l=>{try{l(n.data)}catch{}})}}catch{}},a.onerror=()=>{const r=new Error("WebSocket connection failed");r.name="ConnectionFailedException";for(const n of s.pendingEstablished.values())n.forEach(o=>o.reject(r));s.pendingEstablished.clear(),s.disconnectHandlers.forEach(n=>{try{n("error")}catch{}})},a.onclose=r=>{const n=new Error("WebSocket closed");n.name="ConnectionFailedException";for(const l of s.pendingEstablished.values())l.forEach(p=>p.reject(n));s.pendingEstablished.clear(),s.connected=!1,s.keepAliveTimer&&(clearInterval(s.keepAliveTimer),s.keepAliveTimer=null);const o=r.code===1001?"timeout":r.code===1006?"error":"unknown";s.disconnectHandlers.forEach(l=>{try{l(o)}catch{}}),s.disconnectHandlers.clear(),K.delete(t)},s}function vt(t,e,s,i,a,r){var g;const n=ft(t,e);n.subscriptions.has(s)||n.subscriptions.set(s,new Set),n.subscriptions.get(s).add(a),r&&n.disconnectHandlers.add(r);let o,l;const p=new Promise((c,h)=>{o=c,l=h});return n.pendingEstablished.has(s)||n.pendingEstablished.set(s,[]),n.pendingEstablished.get(s).push({resolve:o,reject:l}),n.connected&&((g=n.ws)==null?void 0:g.readyState)===WebSocket.OPEN?n.ws.send(JSON.stringify({action:"subscribe",channel:s,token:i})):n.pendingSubs.push({channel:s,token:i}),{unsubscribe(){var h;if(r){try{r("client")}catch{}n.disconnectHandlers.delete(r)}const c=n.subscriptions.get(s);if(c&&(c.delete(a),c.size===0&&(n.subscriptions.delete(s),n.connected&&((h=n.ws)==null?void 0:h.readyState)===WebSocket.OPEN&&n.ws.send(JSON.stringify({action:"unsubscribe",channel:s})))),n.subscriptions.size===0&&n.ws){n.keepAliveTimer&&(clearInterval(n.keepAliveTimer),n.keepAliveTimer=null),n.ws.onmessage=null,n.ws.onerror=null,n.ws.onclose=null,n.ws.close(),n.connected=!1;for(const[x,w]of K)if(w===n){K.delete(x);break}}},established:p,connection:n.ws}}function gt(t){return typeof t=="object"&&t!==null&&t.__blocks==="realtime/channel"&&typeof t.wsUrl=="string"&&typeof t.connectToken=="string"&&typeof t.token=="string"}function ye(t){if(gt(t)){const{channel:e,wsUrl:s,connectToken:i,token:a}=t;return{subscribe(r){const n=typeof r=="function"?r:r.onMessage,o=typeof r=="function"?void 0:r.onDisconnect;return vt(s,i,e,a,n,o)}}}if(Array.isArray(t))return t.map(ye);if(typeof t=="object"&&t!==null){const e={};for(const[s,i]of Object.entries(t))e[s]=ye(i);return e}return t}Le({onResponse:ye});f("CONDITION_TYPES");f("DEMO_MATCH_DATA");f("DOMAIN_TYPES");f("PROVIDER_CATEGORIES");f("SUBJECT_CATALOG");f("activeInventorySchema");const b=f("api");f("buildGroupedCatalogText");f("buildIntentClassificationPrompt");f("buildInteractiveCatalogPayload");f("buildInteractiveRequestConfirmationPayload");f("buildInteractiveYearSubjectsPayload");f("buildLLMMessagePrompt");f("chunkTextForVectorStore");f("cleanSubjectName");f("demandBoardSchema");f("emitLifecycleEvent");f("formatConditionBadges");f("formatDemandDisplay");f("generateLLMMessage");f("getHelpMessage");f("getWhatsAppCredentials");f("hasExplicitSchoolYear");f("inferDomainFromConcept");f("maskPromptPII");f("normalizeConceptKey");f("parseParentMessageIntentsWithLLM");f("processWhatsAppInbound");f("sanitizeExtractedTitle");f("sendWhatsAppInteractiveMessage");f("sendWhatsAppTextMessage");f("sweepExpiredHolds");f("truncateWhatsAppText");f("verifyMetaHmacSignature");f("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const V=globalThis,Pe=t=>t,oe=V.trustedTypes,Ee=oe?oe.createPolicy("lit-html",{createHTML:t=>t}):void 0,Re="$lit$",E=`lit$${Math.random().toFixed(9).slice(2)}$`,Be="?"+E,ht=`<${Be}>`,L=document,Z=()=>L.createComment(""),X=t=>t===null||typeof t!="object"&&typeof t!="function",we=Array.isArray,mt=t=>we(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",fe=`[ 	
\f\r]`,F=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Ie=/-->/g,Me=/>/g,D=RegExp(`>|${fe}(?:([^\\s"'>=/]+)(${fe}*=${fe}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),De=/'/g,Te=/"/g,Ne=/^(?:script|style|textarea|title)$/i,bt=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),d=bt(1),ee=Symbol.for("lit-noChange"),y=Symbol.for("lit-nothing"),He=new WeakMap,H=L.createTreeWalker(L,129);function ze(t,e){if(!we(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Ee!==void 0?Ee.createHTML(e):e}const yt=(t,e)=>{const s=t.length-1,i=[];let a,r=e===2?"<svg>":e===3?"<math>":"",n=F;for(let o=0;o<s;o++){const l=t[o];let p,g,c=-1,h=0;for(;h<l.length&&(n.lastIndex=h,g=n.exec(l),g!==null);)h=n.lastIndex,n===F?g[1]==="!--"?n=Ie:g[1]!==void 0?n=Me:g[2]!==void 0?(Ne.test(g[2])&&(a=RegExp("</"+g[2],"g")),n=D):g[3]!==void 0&&(n=D):n===D?g[0]===">"?(n=a??F,c=-1):g[1]===void 0?c=-2:(c=n.lastIndex-g[2].length,p=g[1],n=g[3]===void 0?D:g[3]==='"'?Te:De):n===Te||n===De?n=D:n===Ie||n===Me?n=F:(n=D,a=void 0);const x=n===D&&t[o+1].startsWith("/>")?" ":"";r+=n===F?l+ht:c>=0?(i.push(p),l.slice(0,c)+Re+l.slice(c)+E+x):l+E+(c===-2?o:x)}return[ze(t,r+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),i]};class te{constructor({strings:e,_$litType$:s},i){let a;this.parts=[];let r=0,n=0;const o=e.length-1,l=this.parts,[p,g]=yt(e,s);if(this.el=te.createElement(p,i),H.currentNode=this.el.content,s===2||s===3){const c=this.el.content.firstChild;c.replaceWith(...c.childNodes)}for(;(a=H.nextNode())!==null&&l.length<o;){if(a.nodeType===1){if(a.hasAttributes())for(const c of a.getAttributeNames())if(c.endsWith(Re)){const h=g[n++],x=a.getAttribute(c).split(E),w=/([.?@])?(.*)/.exec(h);l.push({type:1,index:r,name:w[2],strings:x,ctor:w[1]==="."?$t:w[1]==="?"?At:w[1]==="@"?wt:de}),a.removeAttribute(c)}else c.startsWith(E)&&(l.push({type:6,index:r}),a.removeAttribute(c));if(Ne.test(a.tagName)){const c=a.textContent.split(E),h=c.length-1;if(h>0){a.textContent=oe?oe.emptyScript:"";for(let x=0;x<h;x++)a.append(c[x],Z()),H.nextNode(),l.push({type:2,index:++r});a.append(c[h],Z())}}}else if(a.nodeType===8)if(a.data===Be)l.push({type:2,index:r});else{let c=-1;for(;(c=a.data.indexOf(E,c+1))!==-1;)l.push({type:7,index:r}),c+=E.length-1}r++}}static createElement(e,s){const i=L.createElement("template");return i.innerHTML=e,i}}function O(t,e,s=t,i){var n,o;if(e===ee)return e;let a=i!==void 0?(n=s._$Co)==null?void 0:n[i]:s._$Cl;const r=X(e)?void 0:e._$litDirective$;return(a==null?void 0:a.constructor)!==r&&((o=a==null?void 0:a._$AO)==null||o.call(a,!1),r===void 0?a=void 0:(a=new r(t),a._$AT(t,s,i)),i!==void 0?(s._$Co??(s._$Co=[]))[i]=a:s._$Cl=a),a!==void 0&&(e=O(t,a._$AS(t,e.values),a,i)),e}class xt{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:i}=this._$AD,a=((e==null?void 0:e.creationScope)??L).importNode(s,!0);H.currentNode=a;let r=H.nextNode(),n=0,o=0,l=i[0];for(;l!==void 0;){if(n===l.index){let p;l.type===2?p=new ne(r,r.nextSibling,this,e):l.type===1?p=new l.ctor(r,l.name,l.strings,this,e):l.type===6&&(p=new kt(r,this,e)),this._$AV.push(p),l=i[++o]}n!==(l==null?void 0:l.index)&&(r=H.nextNode(),n++)}return H.currentNode=L,a}p(e){let s=0;for(const i of this._$AV)i!==void 0&&(i.strings!==void 0?(i._$AI(e,i,s),s+=i.strings.length-2):i._$AI(e[s])),s++}}class ne{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,i,a){this.type=2,this._$AH=y,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=i,this.options=a,this._$Cv=(a==null?void 0:a.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=O(this,e,s),X(e)?e===y||e==null||e===""?(this._$AH!==y&&this._$AR(),this._$AH=y):e!==this._$AH&&e!==ee&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):mt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==y&&X(this._$AH)?this._$AA.nextSibling.data=e:this.T(L.createTextNode(e)),this._$AH=e}$(e){var r;const{values:s,_$litType$:i}=e,a=typeof i=="number"?this._$AC(e):(i.el===void 0&&(i.el=te.createElement(ze(i.h,i.h[0]),this.options)),i);if(((r=this._$AH)==null?void 0:r._$AD)===a)this._$AH.p(s);else{const n=new xt(a,this),o=n.u(this.options);n.p(s),this.T(o),this._$AH=n}}_$AC(e){let s=He.get(e.strings);return s===void 0&&He.set(e.strings,s=new te(e)),s}k(e){we(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let i,a=0;for(const r of e)a===s.length?s.push(i=new ne(this.O(Z()),this.O(Z()),this,this.options)):i=s[a],i._$AI(r),a++;a<s.length&&(this._$AR(i&&i._$AB.nextSibling,a),s.length=a)}_$AR(e=this._$AA.nextSibling,s){var i;for((i=this._$AP)==null?void 0:i.call(this,!1,!0,s);e!==this._$AB;){const a=Pe(e).nextSibling;Pe(e).remove(),e=a}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class de{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,i,a,r){this.type=1,this._$AH=y,this._$AN=void 0,this.element=e,this.name=s,this._$AM=a,this.options=r,i.length>2||i[0]!==""||i[1]!==""?(this._$AH=Array(i.length-1).fill(new String),this.strings=i):this._$AH=y}_$AI(e,s=this,i,a){const r=this.strings;let n=!1;if(r===void 0)e=O(this,e,s,0),n=!X(e)||e!==this._$AH&&e!==ee,n&&(this._$AH=e);else{const o=e;let l,p;for(e=r[0],l=0;l<r.length-1;l++)p=O(this,o[i+l],s,l),p===ee&&(p=this._$AH[l]),n||(n=!X(p)||p!==this._$AH[l]),p===y?e=y:e!==y&&(e+=(p??"")+r[l+1]),this._$AH[l]=p}n&&!a&&this.j(e)}j(e){e===y?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class $t extends de{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===y?void 0:e}}class At extends de{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==y)}}class wt extends de{constructor(e,s,i,a,r){super(e,s,i,a,r),this.type=5}_$AI(e,s=this){if((e=O(this,e,s,0)??y)===ee)return;const i=this._$AH,a=e===y&&i!==y||e.capture!==i.capture||e.once!==i.once||e.passive!==i.passive,r=e!==y&&(i===y||a);a&&this.element.removeEventListener(this.name,this,i),r&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class kt{constructor(e,s,i){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=i}get _$AU(){return this._$AM._$AU}_$AI(e){O(this,e)}}const ve=V.litHtmlPolyfillSupport;ve==null||ve(te,ne),(V.litHtmlVersions??(V.litHtmlVersions=[])).push("3.3.3");const St=(t,e,s)=>{const i=e;let a=i._$litPart$;return a===void 0&&(i._$litPart$=a=new ne(e.insertBefore(Z(),null),null,void 0,{})),a._$AI(t),a},Ct=document.getElementById("app");let m="available",P="all",R=[],C=[],le=[],_t=null,T=null,se=!1,J="",ge=null,M="",k="all",I="all",j="all",B="all",S="all",ie="",ae="",Q=!0,N=!1,A=null,xe=!1,G=!1,Y="",re="",he="Mathematics",me="+15550199002";function v(t){J=t,ge&&clearTimeout(ge),ge=setTimeout(()=>{J="",u()},1e4)}function ke(t){if(!t)return"Unknown date";const e=Date.now(),s=Math.floor((e-t)/1e3);if(s<60)return"Just now";const i=Math.floor(s/60);if(i<60)return`${i}m ago`;const a=Math.floor(i/60);if(a<24)return`${a}h ago`;const r=Math.floor(a/24);return r===1?"Yesterday":r<30?`${r}d ago`:new Date(t).toLocaleDateString()}function U(t){return t?new Date(t).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function ce(t){switch(t){case"Mathematics":return"badge-math";case"Science":return"badge-science";case"Languages":return"badge-languages";case"Humanities":return"badge-humanities";case"Arts":return"badge-arts";default:return"badge-active"}}function Oe(t){switch(t){case"PrimarySchool":return"badge-primary";case"MiddleSchool":return"badge-middle";case"HighSchool":return"badge-high";case"UniversityPrep":return"badge-uniprep";default:return"badge-active"}}function Pt(t){switch(t){case"PrimarySchool":return"Primary (Years 1-6)";case"MiddleSchool":return"Middle School (Years 7-9)";case"HighSchool":return"High School (Years 10-13)";case"UniversityPrep":return"Uni Prep";default:return t||"General"}}function je(t){switch(t){case"New":return d`
        <span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">
          Verified New
        </span>
      `;case"LikeNew":return d`
        <span class="badge" style="background:rgba(59,130,246,0.15);color:#60a5fa;border:1px solid rgba(59,130,246,0.35);">
          Like New
        </span>
      `;case"Good":return d`
        <span class="badge" style="background:rgba(245,158,11,0.15);color:#fbbf24;border:1px solid rgba(245,158,11,0.35);">
          Good Condition
        </span>
      `;case"Acceptable":return d`
        <span class="badge" style="background:rgba(156,163,175,0.15);color:#d1d5db;border:1px solid rgba(156,163,175,0.35);">
          Acceptable
        </span>
      `;default:return d`<span class="badge badge-active">${t||"Good"}</span>`}}function Ue(t){if(!t)return!0;const e=Date.now();if(S==="today"){const s=new Date;return s.setHours(0,0,0,0),t>=s.getTime()}if(S==="7days"){const s=e-6048e5;return t>=s}if(S==="30days"){const s=e-2592e6;return t>=s}if(S==="custom"){let s=!0;if(ie){const i=new Date(ie).setHours(0,0,0,0);t<i&&(s=!1)}if(ae){const i=new Date(ae).setHours(23,59,59,999);t>i&&(s=!1)}return s}return!0}function Et(t){return t.filter(e=>{if(M.trim()){const s=M.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(s)||e.concept&&e.concept.toLowerCase().includes(s)||e.description&&e.description.toLowerCase().includes(s)||e.domain&&e.domain.toLowerCase().includes(s)||e.providerCategory&&e.providerCategory.toLowerCase().includes(s)||e.sellerPhone&&e.sellerPhone.toLowerCase().includes(s)))return!1}return!(k!=="all"&&e.domain!==k||I!=="all"&&e.providerCategory!==I||j!=="all"&&e.conditionType!==j||B!=="all"&&e.sellerPhone!==B||!Ue(e.createdAt))}).sort((e,s)=>{const i=e.createdAt||0,a=s.createdAt||0;return Q?a-i:i-a})}function We(t,e){return t.filter(s=>{if(s.status!==e)return!1;if(M.trim()){const i=M.toLowerCase().trim();if(!(s.requestedQuery&&s.requestedQuery.toLowerCase().includes(i)||s.concept&&s.concept.toLowerCase().includes(i)||s.domain&&s.domain.toLowerCase().includes(i)||s.userPhone&&s.userPhone.toLowerCase().includes(i)))return!1}return!(k!=="all"&&s.domain!==k||!Ue(s.createdAt))}).sort((s,i)=>{const a=s.createdAt||0,r=i.createdAt||0;return Q?r-a:a-r})}function It(){let t=0;return M.trim()&&t++,k!=="all"&&t++,I!=="all"&&t++,j!=="all"&&t++,B!=="all"&&t++,S!=="all"&&t++,t}function Fe(){M="",k="all",I="all",j="all",B="all",S="all",ie="",ae="",u()}async function $(){se=!0,u();try{try{await b.releaseExpiredHolds()}catch{}const[t,e,s,i,a]=await Promise.all([b.listInventory(),b.listDemands(),b.getLifecycleEvents(),b.getSecurityObservabilityStatus(),b.getSupplyGaps()]);R=t||[],C=e||[],le=s||[],_t=i||null,T=a||null}catch(t){console.error("Failed to load dashboard data:",t),v(`❌ Failed to load data: ${t.message}`)}finally{se=!1,u()}}async function Mt(t){xe=!0,N=!0,A=null,u();try{A=await b.getSellerStorefront(t)}catch(e){v(`❌ Failed to load seller storefront: ${e.message}`),N=!1}finally{xe=!1,u()}}async function Dt(){try{const t=await b.verifyWebhook("subscribe","my_verify_token_123",`challenge_${Date.now()}`);t.status===200?v(`✅ Handshake Verified! Echoed challenge: "${t.challenge}"`):v(`❌ Verification failed: ${t.error}`)}catch(t){v(`❌ Error verifying webhook: ${t.message}`)}$()}async function z(t,e="+15550199001"){var s,i,a,r;v(`🚀 Processing simulated WhatsApp message: "${t}"...`),u();try{const n={media_id:`media_${Date.now()}`,from_phone:e,message_text:t},o=await b.handleWebhook(n);((s=o.result)==null?void 0:s.status)==="matched"?(v(`🎉 Match Connected! Matched wishlist ID: ${o.result.matchedDemandId}`),m="matches"):((i=o.result)==null?void 0:i.status)==="needs_year_clarification"?v("ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!"):((a=o.result)==null?void 0:a.status)==="greeting"?v("👋 Greeting Handled: Welcome & Guide sent."):(v(`📦 Book Listed into Inventory! Item ID: ${((r=o.result)==null?void 0:r.itemId)||"saved"}`),m="available")}catch(n){v(`❌ Webhook simulation error: ${n.message}`)}$()}async function $e(t,e,s="Mathematics",i="+15550199002"){v(`⏳ Registering demand for "${e}" (${t})...`),u();try{const a=await b.createDemand(i,e,t,s);v(`✨ Wishlist demand registered: "${a.requestedQuery}"!`),G=!1,m="pendings"}catch(a){v(`❌ Error adding demand: ${a.message}`)}$()}async function Ye(t){try{await b.deleteDemand(t),v("🗑️ Removed demand entry."),C=C.filter(e=>e.demandId!==t),u()}catch(e){v(`❌ Error removing demand: ${e.message}`)}}async function Tt(t){try{await b.deleteInventory(t),v("🗑️ Removed inventory item."),R=R.filter(e=>e.itemId!==t),u()}catch(e){v(`❌ Error removing inventory: ${e.message}`)}}async function Ge(){v("🔒 Validating HMAC-SHA256 Payload Signature..."),u();try{const t="secret_key_whatsapp_demo_1234",e=JSON.stringify({test:"hmac-verification",timestamp:Date.now()}),s=new TextEncoder,i=await crypto.subtle.importKey("raw",s.encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),a=await crypto.subtle.sign("HMAC",i,s.encode(e)),r=Array.from(new Uint8Array(a)).map(o=>o.toString(16).padStart(2,"0")).join("");(await b.validateSignature(e,`sha256=${r}`,t)).valid?v("🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified."):v("❌ HMAC Verification Failed!")}catch(t){v(`❌ HMAC test error: ${t.message}`)}$()}function Ht(){const t=C.filter(a=>a.status==="pending").length,e=C.filter(a=>a.status==="matched").length,s=R.length,i=le.length;return d`
    <div class="stats-row">
      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="available",u()}}>
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${s}</div>
          <div class="stat-label">Available Books</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="pendings",u()}}>
        <div class="stat-icon" style="background:rgba(245,158,11,0.15);color:#fbbf24;">⏳</div>
        <div class="stat-info">
          <div class="stat-value">${t}</div>
          <div class="stat-label">Pending Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="matches",u()}}>
        <div class="stat-icon" style="background:rgba(16,185,129,0.15);color:#34d399;">🤝</div>
        <div class="stat-info">
          <div class="stat-value">${e}</div>
          <div class="stat-label">Matched Demands</div>
        </div>
      </div>

      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="observability",u()}}>
        <div class="stat-icon" style="background:rgba(139,92,246,0.15);color:#a78bfa;">📊</div>
        <div class="stat-info">
          <div class="stat-value">${i}</div>
          <div class="stat-label">Live Events</div>
        </div>
      </div>
    </div>
  `}function Lt(){const t=C.filter(i=>i.status==="pending").length,e=C.filter(i=>i.status==="matched").length,s=R.length;return d`
    <div class="tabs-nav">
      <button
        class="tab-btn ${m==="available"?"active":""}"
        @click=${()=>{m="available",u()}}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${s}</span>
      </button>

      <button
        class="tab-btn ${m==="pendings"?"active":""}"
        @click=${()=>{m="pendings",u()}}
      >
        <span>⏳ Pending Demands</span>
        <span class="tab-count">${t}</span>
      </button>

      <button
        class="tab-btn ${m==="matches"?"active":""}"
        @click=${()=>{m="matches",u()}}
      >
        <span>🤝 Matched Pairs</span>
        <span class="tab-count">${e}</span>
      </button>

      <button
        class="tab-btn ${m==="webhook"?"active":""}"
        @click=${()=>{m="webhook",u()}}
      >
        <span>⚡ Webhook & Simulations</span>
      </button>

      <button
        class="tab-btn ${m==="observability"?"active":""}"
        @click=${()=>{m="observability",u()}}
      >
        <span>📊 Observability & Stream</span>
      </button>
    </div>
  `}function Rt(){return T?d`
    <div class="card" style="background:linear-gradient(135deg, rgba(236,72,153,0.1) 0%, rgba(139,92,246,0.1) 100%);border:1px solid rgba(236,72,153,0.3);margin-bottom:20px;">
      <div style="display:flex;justify-content:space-between;align-items:center;flex-wrap:wrap;gap:14px;">
        <div style="max-width:700px;">
          <div style="display:flex;align-items:center;gap:8px;margin-bottom:4px;">
            <span style="font-size:1.1rem;">📢</span>
            <h4 style="font-size:1.1rem;color:#f472b6;">Community Supply Deficit Alert (Feature 3B)</h4>
          </div>
          <p style="margin:0;font-size:0.88rem;color:var(--text-muted);line-height:1.4;">
            High demand / low stock in: 
            <strong>${T.deficitSubjects.map(t=>`${t.domain} (${t.count})`).join(", ")}</strong> 
            and grades <strong>${T.deficitGrades.map(t=>t.grade).join(", ")}</strong>.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="sm"
            style="background:linear-gradient(135deg, #ec4899 0%, #8b5cf6 100%);"
            title="Preview and simulate WhatsApp Broadcast to parent group"
            @click=${()=>{v(`📢 Broadcast Dispatched to WhatsApp Group: "${T==null?void 0:T.broadcastMessageEn}"`)}}
          >
            🚀 Broadcast Supply Call
          </button>
        </div>
      </div>
    </div>
  `:""}function Se(t=!0){const e=It(),s=Array.from(new Set(R.map(i=>i.sellerPhone).filter(Boolean)));return d`
    <div class="filter-toolbar">
      <div class="toolbar-main">
        <!-- Search Input -->
        <div class="search-box">
          <span class="search-icon">🔍</span>
          <input
            type="text"
            class="search-input"
            placeholder="Search titles, concepts, subjects, or phone..."
            .value=${M}
            @input=${i=>{M=i.target.value,u()}}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${k}
          @change=${i=>{k=i.target.value,u()}}
        >
          <option value="all">🌐 All Subjects</option>
          <option value="Mathematics">📐 Mathematics</option>
          <option value="Science">🔬 Science</option>
          <option value="Languages">🗣️ Languages</option>
          <option value="Humanities">🌍 Humanities</option>
          <option value="Arts">🎨 Arts</option>
        </select>

        <!-- Class / Level Selector -->
        ${t?d`
              <select
                class="filter-select"
                .value=${I}
                @change=${i=>{I=i.target.value,u()}}
              >
                <option value="all">🏫 All Classes / Levels</option>
                <option value="PrimarySchool">🎒 Primary School (Y1-Y6)</option>
                <option value="MiddleSchool">📘 Middle School (Y7-Y9)</option>
                <option value="HighSchool">🎓 High School (Y10-Y13)</option>
                <option value="UniversityPrep">🏛️ University Prep</option>
              </select>
            `:""}

        <!-- Condition Selector (Feature 3D) -->
        ${t?d`
              <select
                class="filter-select"
                .value=${j}
                @change=${i=>{j=i.target.value,u()}}
              >
                <option value="all">All Conditions</option>
                <option value="New">New</option>
                <option value="LikeNew">Like New</option>
                <option value="Good">Good</option>
                <option value="Acceptable">Acceptable</option>
              </select>
            `:""}

        <!-- Seller Filter (Feature 3A) -->
        ${s.length>1?d`
              <select
                class="filter-select"
                .value=${B}
                @change=${i=>{B=i.target.value,u()}}
              >
                <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                ${s.map(i=>d`<option value="${i}">Seller: ${i}</option>`)}
              </select>
            `:""}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${S}
          @change=${i=>{S=i.target.value,u()}}
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
          @click=${()=>{Q=!Q,u()}}
        >
          ${Q?"⬇️ Newest First":"⬆️ Oldest First"}
        </button>

        <!-- Reset Button -->
        ${e>0?d`
              <button class="danger sm" @click=${Fe}>
                ✕ Reset (${e})
              </button>
            `:""}
      </div>

      <!-- Custom Date Inputs (if selected) -->
      ${S==="custom"?d`
            <div style="display:flex;gap:12px;align-items:center;flex-wrap:wrap;background:rgba(0,0,0,0.3);padding:10px 14px;border-radius:10px;">
              <span style="font-size:0.82rem;color:var(--text-muted);font-weight:600;">Custom Created Date:</span>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">From:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${ie}
                  @change=${i=>{ie=i.target.value,u()}}
                />
              </div>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${ae}
                  @change=${i=>{ae=i.target.value,u()}}
                />
              </div>
            </div>
          `:""}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${["all","Mathematics","Science","Languages","Humanities","Arts"].map(i=>d`
              <button
                class="pill ${k===i?"active":""}"
                @click=${()=>{k=i,u()}}
              >
                ${i==="all"?"All Subjects":i}
              </button>
            `)}
        </div>

        ${t?d`
              <div class="pill-group">
                <span class="pill-label">Classes:</span>
                ${[{id:"all",label:"All Levels"},{id:"PrimarySchool",label:"Primary"},{id:"MiddleSchool",label:"Middle"},{id:"HighSchool",label:"High"},{id:"UniversityPrep",label:"Uni Prep"}].map(i=>d`
                    <button
                      class="pill ${I===i.id?"active":""}"
                      @click=${()=>{I=i.id,u()}}
                    >
                      ${i.label}
                    </button>
                  `)}
              </div>
            `:""}
      </div>
    </div>
  `}function Bt(){const t=Et(R);return d`
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
              class="sm ${P==="all"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="all",u()}}
            >
              Grid
            </button>
            <button
              class="sm ${P==="by-subject"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="by-subject",u()}}
            >
              By Subject
            </button>
            <button
              class="sm ${P==="by-class"?"":"secondary"}"
              style="border-radius:6px;box-shadow:none;"
              @click=${()=>{P="by-class",u()}}
            >
              By Class
            </button>
          </div>
          <button class="secondary sm" @click=${$}>
            ${se?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      <!-- Feature 3B: Supply Gaps Alert -->
      ${Rt()}

      ${Se(!0)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">📖</div>
              <div class="empty-state-title">No books match your current filters</div>
              <div class="empty-state-text">
                Try clearing your search keyword, selecting "All Subjects" / "All Dates", or simulate a book upload in the Webhook tab.
              </div>
              <button class="secondary sm" style="margin-top:10px;" @click=${Fe}>
                Clear All Filters
              </button>
            </div>
          `:P==="all"?d`
            <div class="items-grid">
              ${t.map(e=>Ce(e))}
            </div>
          `:P==="by-subject"?Nt(t):zt(t)}
    </div>

    <!-- Feature 3A: Seller Storefront Modal -->
    ${Ot()}
  `}function Ce(t){return d`
    <div class="item-card">
      <div class="item-card-header">
        <div class="item-title-wrap">
          <div class="book-title">${t.title}</div>
          <div class="book-concept">${t.concept}</div>
        </div>
        <span class="badge ${ce(t.domain)}">
          ${t.domain}
        </span>
      </div>

      <div class="tags-row">
        <span class="badge ${Oe(t.providerCategory)}">
          ${Pt(t.providerCategory)}
        </span>
        <!-- Feature 3D: Verified Condition Badge -->
        ${je(t.conditionType)}
      </div>

      ${t.description?d`<div style="font-size:0.84rem;color:var(--text-muted);line-height:1.4;">${t.description}</div>`:""}

      <div class="card-footer">
        <div style="display:flex;flex-direction:column;gap:2px;">
          <!-- Feature 3A: Clickable Seller Storefront Link -->
          <div style="font-size:0.75rem;color:var(--text-dim);">
            Seller: 
            <button
              class="secondary sm"
              style="padding:2px 6px;font-size:0.72rem;margin-left:4px;display:inline-flex;"
              title="Click to view full family collection & grade bundles"
              @click=${()=>Mt(t.sellerPhone)}
            >
              👨‍👩‍👧 ${t.sellerPhone||"Parent"} Storefront
            </button>
          </div>
          <div class="date-badge" title="${U(t.createdAt)}">
            📅 ${ke(t.createdAt)} (${U(t.createdAt)})
          </div>
        </div>
        <button
          class="danger sm"
          style="padding:4px 8px;font-size:0.72rem;"
          title="Remove from active inventory"
          @click=${()=>Tt(t.itemId)}
        >
          🗑️
        </button>
      </div>
    </div>
  `}function Nt(t){return d`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${["Mathematics","Science","Languages","Humanities","Arts"].map(s=>{const i=t.filter(a=>a.domain===s);return i.length===0?"":d`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s}</h4>
              <span class="badge ${ce(s)}">${i.length} Available</span>
            </div>
            <div class="items-grid">
              ${i.map(a=>Ce(a))}
            </div>
          </div>
        `})}
    </div>
  `}function zt(t){return d`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[{key:"PrimarySchool",label:"Primary School (Years 1 - 6)"},{key:"MiddleSchool",label:"Middle School (Years 7 - 9)"},{key:"HighSchool",label:"High School (Years 10 - 13)"},{key:"UniversityPrep",label:"University Prep"}].map(s=>{const i=t.filter(a=>a.providerCategory===s.key);return i.length===0?"":d`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s.label}</h4>
              <span class="badge ${Oe(s.key)}">${i.length} Available</span>
            </div>
            <div class="items-grid">
              ${i.map(a=>Ce(a))}
            </div>
          </div>
        `})}
    </div>
  `}function Ot(){return N?d`
    <div
      style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.75);z-index:1000;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(10px);"
      @click=${t=>{t.target===t.currentTarget&&(N=!1,u())}}
    >
      <div class="card" style="width:100%;max-width:680px;max-height:85vh;overflow-y:auto;background:#111827;border:1px solid var(--surface-border-hover);box-shadow:0 25px 50px -12px rgba(0,0,0,0.9);display:flex;flex-direction:column;gap:18px;">
        ${xe?d`<div style="text-align:center;padding:40px 0;color:var(--text-muted);">Loading Family Storefront...</div>`:A?d`
              <div style="display:flex;justify-content:space-between;align-items:flex-start;border-bottom:1px solid rgba(255,255,255,0.08);padding-bottom:14px;">
                <div>
                  <div style="display:inline-flex;align-items:center;gap:6px;padding:3px 8px;border-radius:6px;background:rgba(59,130,246,0.15);color:#60a5fa;font-size:0.75rem;font-weight:600;margin-bottom:6px;">
                    👨‍👩‍👧 FAMILY COLLECTION (FEATURE 3A)
                  </div>
                  <h3 style="font-size:1.4rem;">Parent Storefront: ${A.sellerPhone}</h3>
                  <p style="margin:4px 0 0 0;font-size:0.85rem;color:var(--text-muted);">
                    Total <strong>${A.totalBooks} textbooks</strong> available across multiple grades.
                  </p>
                </div>
                <button class="secondary sm" @click=${()=>{N=!1,u()}}>
                  ✕ Close
                </button>
              </div>

              <!-- Grade Bundles Section -->
              <div>
                <h4 style="font-size:1.05rem;margin-bottom:10px;color:#f3f4f6;">📦 Available Grade Bundles</h4>
                <div style="display:grid;grid-template-columns:repeat(auto-fit, minmax(180px, 1fr));gap:10px;">
                  ${A.bundles.map(t=>d`
                      <div style="background:rgba(255,255,255,0.04);border:1px solid var(--surface-border);border-radius:10px;padding:12px;">
                        <div style="font-weight:700;font-size:0.95rem;color:#fff;">${t.grade} Bundle</div>
                        <div style="font-size:0.8rem;color:#60a5fa;margin-top:2px;">${t.count} Books Available</div>
                        <button
                          class="secondary sm"
                          style="margin-top:8px;width:100%;font-size:0.72rem;"
                          @click=${()=>{v(`💬 WhatsApp Bundle Request sent to seller ${A==null?void 0:A.sellerPhone} for all ${t.count} books in ${t.grade}!`)}}
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
                  ${A.items.map(t=>d`
                      <div style="display:flex;justify-content:space-between;align-items:center;padding:10px 12px;background:rgba(255,255,255,0.02);border:1px solid var(--surface-border);border-radius:8px;">
                        <div>
                          <div style="font-weight:600;font-size:0.88rem;color:#fff;">${t.title}</div>
                          <div style="font-size:0.75rem;color:var(--text-dim);">${t.domain} &bull; ${t.concept}</div>
                        </div>
                        <div>
                          ${je(t.conditionType)}
                        </div>
                      </div>
                    `)}
                </div>
              </div>

              <div style="display:flex;justify-content:flex-end;gap:10px;border-top:1px solid rgba(255,255,255,0.08);padding-top:12px;">
                <button
                  class="secondary"
                  @click=${()=>{B=(A==null?void 0:A.sellerPhone)||"all",N=!1,u()}}
                >
                  Filter Main Catalog by this Seller
                </button>
              </div>
            `:""}
      </div>
    </div>
  `:""}function jt(){const t=We(C,"pending");return d`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>⏳ Pending Wishlists & Demands</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Parents actively seeking books. When an inbound offer matches, Relay automatically pairs them (Sorted newest first).
          </p>
        </div>
        <div style="display:flex;gap:10px;">
          <button class="sm" @click=${()=>{G=!0,u()}}>
            + Create Demand
          </button>
          <button class="secondary sm" @click=${$}>
            ${se?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Se(!1)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">⏳</div>
              <div class="empty-state-title">No pending wishlists found</div>
              <div class="empty-state-text">
                All requests have either been matched or no parents are waiting for books right now.
              </div>
              <button
                class="sm"
                style="margin-top:10px;"
                @click=${()=>$e("Year5Chemistry","Year 5 Chemistry","Science")}
              >
                + Add Demo "Year 5 Chemistry" Demand
              </button>
            </div>
          `:d`
            <div class="items-grid">
              ${t.map(e=>d`
                  <div class="item-card" style="border-left: 3px solid var(--warning);">
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${e.requestedQuery}</div>
                        <div class="book-concept">Concept: ${e.concept}</div>
                      </div>
                      <span class="badge badge-pending">PENDING</span>
                    </div>

                    <div class="tags-row">
                      <span class="badge ${ce(e.domain)}">
                        ${e.domain||"Marketplace"}
                      </span>
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Waiting Parent: <strong style="color:var(--text);">${e.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${U(e.createdAt)}">
                          📅 ${ke(e.createdAt)} (${U(e.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        <button
                          class="secondary sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Simulate seller offering this book to trigger automatic match"
                          @click=${()=>z(`I have ${e.requestedQuery} available for Year parent`,"+15559998888")}
                        >
                          ⚡ Match
                        </button>
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>Ye(e.demandId)}
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
    ${G?d`
          <div
            style="position:fixed;top:0;left:0;width:100vw;height:100vh;background:rgba(0,0,0,0.7);z-index:999;display:flex;align-items:center;justify-content:center;backdrop-filter:blur(8px);"
            @click=${e=>{e.target===e.currentTarget&&(G=!1,u())}}
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
                    .value=${Y}
                    @input=${e=>{Y=e.target.value,re=e.target.value.replace(/[^a-zA-Z0-9]/g,"")}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Normalized Concept Key</label>
                  <input
                    type="text"
                    class="search-input"
                    placeholder="e.g. Year10Physics"
                    style="padding-left:14px;"
                    .value=${re}
                    @input=${e=>{re=e.target.value}}
                  />
                </div>

                <div>
                  <label style="font-size:0.82rem;font-weight:600;color:var(--text-muted);display:block;margin-bottom:6px;">Subject Domain</label>
                  <select
                    class="filter-select"
                    style="width:100%;"
                    .value=${he}
                    @change=${e=>{he=e.target.value}}
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
                    .value=${me}
                    @input=${e=>{me=e.target.value}}
                  />
                </div>

                <div style="display:flex;gap:10px;justify-content:flex-end;margin-top:10px;">
                  <button class="secondary" @click=${()=>{G=!1,u()}}>
                    Cancel
                  </button>
                  <button
                    @click=${()=>{Y.trim()&&$e(re||Y.replace(/[^a-zA-Z0-9]/g,""),Y,he,me)}}
                  >
                    Save Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        `:""}
  `}function Ut(){const t=We(C,"matched");return d`
    <div class="card">
      <div class="card-header">
        <div>
          <h3>🤝 Matched Pairs & 48-Hour Reservations</h3>
          <p style="margin:4px 0 0 0;font-size:0.9rem;color:var(--text-muted);">
            Demands matched with available books. Holds automatically release after 48 hours if handover is not confirmed.
          </p>
        </div>
        <div style="display:flex;gap:8px;flex-wrap:wrap;">
          <button
            class="secondary sm"
            style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);"
            title="Seed 22 rich, realistic demo matched records for student presentations"
            @click=${async()=>{const e=await b.seedDemoMatches();v(`🌱 Seeded ${e.count} demo matches in active 48-hour hold state!`),await $()}}
          >
            🌱 Seed 22 Matches
          </button>
          <button
            class="secondary sm"
            style="background:rgba(239,68,68,0.1);color:#f87171;border:1px solid rgba(239,68,68,0.25);"
            title="Clear all seeded demo match records"
            @click=${async()=>{const e=await b.clearDemoMatches();v(`🧹 Cleared ${e.count} demo matches from database.`),await $()}}
          >
            🗑️ Clear Demo
          </button>
          <button
            class="secondary sm"
            title="Proactively sweep and release all expired 48H holds"
            @click=${async()=>{const e=await b.releaseExpiredHolds();v(`🧹 Swept holds: ${e.releasedCount} expired hold(s) released back to active inventory.`),await $()}}
          >
            🧹 Sweep Holds
          </button>
          <button class="secondary sm" @click=${$}>
            ${se?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Se(!1)}

      ${t.length===0?d`
            <div class="empty-state">
              <div class="empty-state-icon">🤝</div>
              <div class="empty-state-title">No active matched pairs found</div>
              <div class="empty-state-text">
                When a seller lists a book that matches a waiting parent's wishlist, it will be placed on a 48-hour hold and displayed here.
              </div>
              <div style="margin-top:12px;display:flex;gap:10px;">
                <button
                  class="secondary sm"
                  @click=${async()=>{await $e("Year8Science","Year 8 Science","Science","+15559990001"),await z("I have Year 8 Science textbook in great shape","+15559990002")}}
                >
                  ⚡ Run Auto-Match Simulation
                </button>
              </div>
            </div>
          `:d`
            <div class="items-grid">
              ${t.map(e=>{const s=e.matchedAt||e.createdAt||Date.now(),i=2880*60*1e3,a=s+i-Date.now(),r=e.status!=="fulfilled"&&a<=0,n=Math.max(1,Math.ceil(a/(1e3*60*60)));return d`
                  <div
                    class="item-card"
                    style="border-left: 3px solid ${e.status==="fulfilled"?"var(--success)":r?"#ef4444":"#6366f1"};"
                  >
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${e.requestedQuery}</div>
                        <div class="book-concept">Concept: ${e.concept}</div>
                      </div>
                      ${e.status==="fulfilled"?d`<span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">COMPLETED / SOLD</span>`:r?d`<span class="badge" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);">HOLD EXPIRED</span>`:d`<span class="badge badge-matched">48H HOLD (${n}h left)</span>`}
                    </div>

                    <div class="tags-row">
                      <span class="badge ${ce(e.domain)}">
                        ${e.domain||"Marketplace"}
                      </span>
                      ${e.handoverCode?d`<span class="badge" style="background:rgba(99,102,241,0.15);color:#818cf8;border:1px solid rgba(99,102,241,0.3);">Code: #${e.handoverCode}</span>`:""}
                    </div>

                    <div
                      style="background:${e.status==="fulfilled"?"rgba(16,185,129,0.08);border:1px solid rgba(16,185,129,0.2);color:#6ee7b7;":r?"rgba(239,68,68,0.08);border:1px solid rgba(239,68,68,0.2);color:#fca5a5;":"rgba(99,102,241,0.08);border:1px solid rgba(99,102,241,0.2);color:#a5b4fc;"};padding:10px 12px;border-radius:8px;font-size:0.83rem;"
                    >
                      ${e.status==="fulfilled"?"Handover completed! Book marked as sold and removed from active catalog.":r?"⚠️ 48-Hour hold has elapsed without physical exchange. Book can be returned to community circulation.":`⏳ 48-Hour Reservation Active (${n}h remaining). Matched parents introduced via WhatsApp.`}
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          Recipient Parent: <strong style="color:var(--text);">${e.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${U(e.createdAt)}">
                          ${ke(e.createdAt)} (${U(e.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        ${e.status!=="fulfilled"?d`
                              <button
                                class="sm"
                                style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                title="Confirm physical handover and mark book sold"
                                @click=${async()=>{await b.confirmHandover({itemId:e.matchedItemId||"",demandId:e.demandId}),v("Handover confirmed! Book marked as sold."),await $()}}
                              >
                                Mark Sold
                              </button>
                            `:""}
                        ${r?d`
                              <button
                                class="secondary sm"
                                style="font-size:0.72rem;padding:4px 8px;"
                                title="Release expired hold back to active community inventory"
                                @click=${async()=>{await b.releaseHold({itemId:e.matchedItemId,demandId:e.demandId}),v("Hold released! Book returned to active catalog."),await $()}}
                              >
                                🔄 Release Hold
                              </button>
                            `:""}
                        <button
                          class="danger sm"
                          style="font-size:0.72rem;padding:4px 8px;"
                          title="Delete demand"
                          @click=${()=>Ye(e.demandId)}
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
  `}function Wt(){return d`
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
              @click=${()=>z("Year 5 Chemistry Textbook - Pristine Condition")}
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
              @click=${()=>z("I have Year 12 Computer Science Book")}
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
              @click=${()=>z("J'ai un livre de physique pour la classe de 3ème")}
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
              @click=${()=>z("I have Chemistry books available for anyone who wants them")}
            >
              Simulate Missing Year
            </button>
          </div>
        </div>

        <div style="margin-top:24px;padding-top:20px;border-top:1px solid rgba(255,255,255,0.05);display:flex;gap:12px;flex-wrap:wrap;">
          <button @click=${Dt}>
            🔗 Test GET Webhook Handshake (hub.challenge)
          </button>
          <button class="secondary" @click=${Ge}>
            🔐 Test HMAC-SHA256 Payload Signature
          </button>
        </div>
      </div>
    </div>
  `}function Ft(){return d`
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
          <button class="secondary sm" @click=${Ge}>
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
          <button class="secondary sm" @click=${$}>
            🔄 Refresh Stream
          </button>
        </div>

        <div class="terminal-log">
          ${le.length===0?d`<div style="color:var(--text-muted);padding:12px 0;">Waiting for lifecycle events...</div>`:le.slice().reverse().map(t=>d`
                    <div class="log-entry">
                      <span class="log-time">[${new Date(t.timestamp).toLocaleTimeString([],{hour12:!1,hour:"2-digit",minute:"2-digit",second:"2-digit"})}]</span>
                      <span class="log-type">${t.eventType}</span>
                      <span class="log-details">${JSON.stringify(t.details)}</span>
                    </div>
                  `)}
        </div>
      </div>
    </div>
  `}function u(){St(d`
      <div style="display:flex;flex-direction:column;gap:20px;">
        <!-- Status Notification Banner -->
        ${J?d`
              <div class="status-banner">
                <div style="display:flex;align-items:center;gap:10px;">
                  <span style="font-size:1.1rem;">🔔</span>
                  <span>${J}</span>
                </div>
                <button
                  class="secondary sm"
                  style="padding:2px 8px;font-size:0.75rem;"
                  @click=${()=>{J="",u()}}
                >
                  ✕
                </button>
              </div>
            `:""}

        <!-- Top Level Stats Summary -->
        ${Ht()}

        <!-- Tab Bar Navigation -->
        ${Lt()}

        <!-- Active Tab Content -->
        ${m==="available"?Bt():m==="pendings"?jt():m==="matches"?Ut():m==="webhook"?Wt():Ft()}
      </div>
    `,Ct)}$();
