var Ke=Object.defineProperty;var Je=(t,e,s)=>e in t?Ke(t,e,{enumerable:!0,configurable:!0,writable:!0,value:s}):t[e]=s;var ve=(t,e,s)=>Je(t,typeof e!="symbol"?e+"":e,s);(function(){const e=document.createElement("link").relList;if(e&&e.supports&&e.supports("modulepreload"))return;for(const i of document.querySelectorAll('link[rel="modulepreload"]'))o(i);new MutationObserver(i=>{for(const n of i)if(n.type==="childList")for(const a of n.addedNodes)a.tagName==="LINK"&&a.rel==="modulepreload"&&o(a)}).observe(document,{childList:!0,subtree:!0});function s(i){const n={};return i.integrity&&(n.integrity=i.integrity),i.referrerPolicy&&(n.referrerPolicy=i.referrerPolicy),i.crossOrigin==="use-credentials"?n.credentials="include":i.crossOrigin==="anonymous"?n.credentials="omit":n.credentials="same-origin",n}function o(i){if(i.ep)return;i.ep=!0;const n=s(i);fetch(i.href,n)}})();const Qe="modulepreload",Ze=function(t){return"/"+t},Ie={},Xe=function(e,s,o){let i=Promise.resolve();if(s&&s.length>0){let a=function(f){return Promise.all(f.map(p=>Promise.resolve(p).then(u=>({status:"fulfilled",value:u}),u=>({status:"rejected",reason:u}))))};document.getElementsByTagName("link");const l=document.querySelector("meta[property=csp-nonce]"),d=(l==null?void 0:l.nonce)||(l==null?void 0:l.getAttribute("nonce"));i=a(s.map(f=>{if(f=Ze(f),f in Ie)return;Ie[f]=!0;const p=f.endsWith(".css"),u=p?'[rel="stylesheet"]':"";if(document.querySelector(`link[href="${f}"]${u}`))return;const g=document.createElement("link");if(g.rel=p?"stylesheet":Qe,p||(g.as="script"),g.crossOrigin="",g.href=f,d&&g.setAttribute("nonce",d),document.head.appendChild(g),p)return new Promise((x,S)=>{g.addEventListener("load",x),g.addEventListener("error",()=>S(new Error(`Unable to preload CSS for ${f}`)))})}))}function n(a){const l=new Event("vite:preloadError",{cancelable:!0});if(l.payload=a,window.dispatchEvent(l),!l.defaultPrevented)throw a}return i.then(a=>{for(const l of a||[])l.status==="rejected"&&n(l.reason);return e().catch(n)})},et="ApiError";class tt extends Error{constructor(s,o,i){super(s,i!=null&&i.cause?{cause:i.cause}:void 0);ve(this,"status");ve(this,"retriable");this.name=(i==null?void 0:i.name)??et,this.status=o,this.retriable=(i==null?void 0:i.retriable)??!1}}const st="2.0";let it=1;function ot(t,e,s){return JSON.stringify({jsonrpc:st,method:`${t}.${e}`,params:s,id:it++})}function at(t){const e=t;if(e.error){const{code:s,message:o,data:i}=e.error,n=s>0?s:500;throw new tt(o,n,{...i!=null&&i.name?{name:i.name}:{},...(i==null?void 0:i.retriable)===!0?{retriable:!0}:{}})}return e.result}var E={};const nt=typeof window>"u";function rt(){if(!nt||typeof globalThis>"u")return;const t=globalThis.__BLOCKS_REQUEST_COOKIES_STORE__;if(!(!t||typeof t.getStore!="function"))return t.getStore()}let K=null,Y=null;async function lt(){return K||Y||(Y=dt().catch(t=>{throw Y=null,t}),Y)}async function dt(){var s;if(K)return K;function t(o){if(!o||typeof o!="string"||!o.trim()||o==="undefined"||o.startsWith("undefined"))return!0;if(o.startsWith("/"))return!1;try{const i=new URL(o);return i.hostname==="undefined"||i.pathname==="/undefined"||i.pathname.startsWith("/undefined/")}catch{return!0}}function e(o,i){if(!o||typeof o!="string"||t(o))throw new Error(`Blocks API URL is not configured (source: ${i}). Ensure BLOCKS_API_URL environment variable is set or config.json is deployed. Run with --conditions=cdk during CDK synthesis.`);return K=o,o}if(typeof process<"u"&&(E!=null&&E.BLOCKS_API_URL)){const o=E.BLOCKS_API_URL;if(/\$\{Token\[/.test(o))throw new Error("Blocks API URL contains unresolved CDK tokens. This usually means a Server Component is being statically prerendered during `next build` inside `cdk deploy`.\nFix: add `export const dynamic = 'force-dynamic';` to any page that calls the Blocks API so Next.js skips prerendering it.");const i=e(o,"env BLOCKS_API_URL");return console.log("[Blocks] Using API (env BLOCKS_API_URL):",i),i}if(typeof process<"u"&&(E!=null&&E.BLOCKS_CONFIG))try{const o=JSON.parse(E.BLOCKS_CONFIG),i=e(o.apiUrl,"env BLOCKS_CONFIG");return console.log("[Blocks] Using API (env BLOCKS_CONFIG):",i),i}catch{}if(typeof process<"u"&&((s=process.versions)!=null&&s.node))try{const o=await Xe(()=>import("./__vite-browser-external-BIHI7g3E.js"),[]),i=JSON.parse(o.readFileSync(".blocks-sandbox/config.json","utf-8")),n=e(i.apiUrl,"config.json file");return console.log("[Blocks] Using API (config.json file):",n),n}catch{}try{const o=await fetch("/.blocks-sandbox/config.json");if(o.ok){const i=await o.json(),n=e(i.apiUrl,"config.json fetch");return console.log("[Blocks] Using API (config.json fetch):",n),n}}catch{}throw new Error(`Blocks API URL not configured. Ensure:
1. You ran \`npm run deploy\` (deploys config.json)
2. SSR Lambda has BLOCKS_API_URL env var, OR
3. config.json exists at /.blocks-sandbox/config.json`)}const Se=[];function Ne(t){Se.push(t)}async function ct(t){for(const e of Se)if(e.onRequest){const s=await e.onRequest(t);s&&(t=s)}return t}function ut(t){for(const e of Se)e.onResponse&&(t=e.onResponse(t));return t}function v(t,e){return new Proxy({},{get(s,o){if(typeof o!="symbol")return async(...i)=>{const n=await lt();let a={apiNamespace:t,method:o,args:i,headers:{"Content-Type":"application/json"}};a=await ct(a);const l=rt();if(l){const u="Cookie"in a.headers?"Cookie":"cookie"in a.headers?"cookie":null,g=u?a.headers[u]:void 0;if(u&&u!=="Cookie"&&delete a.headers[u],g){const x=new Set(g.split(";").filter(Boolean).map(fe=>fe.trim().split("=")[0])),S=l.split(";").filter(Boolean).filter(fe=>!x.has(fe.trim().split("=")[0])).join("; ");a.headers.Cookie=S?`${g}; ${S}`:g}else a.headers.Cookie=l}const f=await(await fetch(n,{method:"POST",headers:a.headers,credentials:"include",body:ot(a.apiNamespace,a.method,a.args)})).json(),p=at(f);return ut(p)}}})}function pt(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/download"&&typeof e.url=="string"}function ft(t){if(typeof t!="object"||t===null)return!1;const e=t;return e.__blocks==="file-bucket/upload"&&typeof e.url=="string"}function xe(t){if(pt(t)){const{url:e}=t;return{async download(){const s=await fetch(e);if(!s.ok)throw new Error(`Download failed: ${s.status}`);return s.blob()},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/download",url:e}}}}if(ft(t)){const{url:e,contentType:s}=t;return{async upload(o){const i={};s&&(i["Content-Type"]=s);const n=await fetch(e,{method:"PUT",body:o,headers:i});if(!n.ok)throw new Error(`Upload failed: ${n.status}`)},getUrl(){return e},toJSON(){return{__blocks:"file-bucket/upload",url:e,contentType:s}}}}if(Array.isArray(t))return t.map(xe);if(typeof t=="object"&&t!==null){const e={};for(const[s,o]of Object.entries(t))e[s]=xe(o);return e}return t}Ne({onResponse:xe});const vt=540*1e3,J=new Map;function gt(t,e){let s=J.get(t);if(s)return s;s={ws:void 0,connected:!1,subscriptions:new Map,pendingEstablished:new Map,pendingSubs:[],keepAliveTimer:null,disconnectHandlers:new Set},J.set(t,s);const o=`${t}?token=${encodeURIComponent(e)}`,i=new WebSocket(o);return s.ws=i,i.onopen=()=>{s.connected=!0;for(const n of s.pendingSubs)i.send(JSON.stringify({action:"subscribe",channel:n.channel,token:n.token}));s.pendingSubs.length=0,s.keepAliveTimer=setInterval(()=>{i.readyState===WebSocket.OPEN&&i.send(JSON.stringify({action:"ping"}))},vt)},i.onmessage=n=>{try{const a=JSON.parse(n.data);if(a.type==="subscribe_success"&&a.channel){const l=s.pendingEstablished.get(a.channel);l&&(l.forEach(d=>d.resolve()),s.pendingEstablished.delete(a.channel))}else if(a.type==="error"&&a.channel){const l=s.pendingEstablished.get(a.channel);if(l){const d=new Error(a.message||"Subscription rejected");d.name="ConnectionFailedException",l.forEach(f=>f.reject(d)),s.pendingEstablished.delete(a.channel)}s.subscriptions.delete(a.channel)}else if(a.type==="message"&&a.channel){const l=s.subscriptions.get(a.channel);l&&l.forEach(d=>{try{d(a.data)}catch{}})}}catch{}},i.onerror=()=>{const n=new Error("WebSocket connection failed");n.name="ConnectionFailedException";for(const a of s.pendingEstablished.values())a.forEach(l=>l.reject(n));s.pendingEstablished.clear(),s.disconnectHandlers.forEach(a=>{try{a("error")}catch{}})},i.onclose=n=>{const a=new Error("WebSocket closed");a.name="ConnectionFailedException";for(const d of s.pendingEstablished.values())d.forEach(f=>f.reject(a));s.pendingEstablished.clear(),s.connected=!1,s.keepAliveTimer&&(clearInterval(s.keepAliveTimer),s.keepAliveTimer=null);const l=n.code===1001?"timeout":n.code===1006?"error":"unknown";s.disconnectHandlers.forEach(d=>{try{d(l)}catch{}}),s.disconnectHandlers.clear(),J.delete(t)},s}function ht(t,e,s,o,i,n){var p;const a=gt(t,e);a.subscriptions.has(s)||a.subscriptions.set(s,new Set),a.subscriptions.get(s).add(i),n&&a.disconnectHandlers.add(n);let l,d;const f=new Promise((u,g)=>{l=u,d=g});return a.pendingEstablished.has(s)||a.pendingEstablished.set(s,[]),a.pendingEstablished.get(s).push({resolve:l,reject:d}),a.connected&&((p=a.ws)==null?void 0:p.readyState)===WebSocket.OPEN?a.ws.send(JSON.stringify({action:"subscribe",channel:s,token:o})):a.pendingSubs.push({channel:s,token:o}),{unsubscribe(){var g;if(n){try{n("client")}catch{}a.disconnectHandlers.delete(n)}const u=a.subscriptions.get(s);if(u&&(u.delete(i),u.size===0&&(a.subscriptions.delete(s),a.connected&&((g=a.ws)==null?void 0:g.readyState)===WebSocket.OPEN&&a.ws.send(JSON.stringify({action:"unsubscribe",channel:s})))),a.subscriptions.size===0&&a.ws){a.keepAliveTimer&&(clearInterval(a.keepAliveTimer),a.keepAliveTimer=null),a.ws.onmessage=null,a.ws.onerror=null,a.ws.onclose=null,a.ws.close(),a.connected=!1;for(const[x,S]of J)if(S===a){J.delete(x);break}}},established:f,connection:a.ws}}function mt(t){return typeof t=="object"&&t!==null&&t.__blocks==="realtime/channel"&&typeof t.wsUrl=="string"&&typeof t.connectToken=="string"&&typeof t.token=="string"}function $e(t){if(mt(t)){const{channel:e,wsUrl:s,connectToken:o,token:i}=t;return{subscribe(n){const a=typeof n=="function"?n:n.onMessage,l=typeof n=="function"?void 0:n.onDisconnect;return ht(s,o,e,i,a,l)}}}if(Array.isArray(t))return t.map($e);if(typeof t=="object"&&t!==null){const e={};for(const[s,o]of Object.entries(t))e[s]=$e(o);return e}return t}Ne({onResponse:$e});v("CONDITION_TYPES");v("DOMAIN_TYPES");v("PROVIDER_CATEGORIES");v("SUBJECT_CATALOG");v("activeInventorySchema");const y=v("api");v("buildBuyerMatchMessage");v("buildGroupedCatalogText");v("buildIntentClassificationPrompt");v("buildInteractiveCatalogPayload");v("buildInteractiveRequestConfirmationPayload");v("buildInteractiveYearSubjectsPayload");v("buildLLMMessagePrompt");v("buildSellerMatchMessage");v("chunkTextForVectorStore");v("cleanSubjectName");v("demandBoardSchema");v("emitLifecycleEvent");v("formatConditionBadges");v("formatDemandDisplay");v("formatPhoneNumber");v("generateLLMMessage");v("getHelpMessage");v("getWhatsAppCredentials");v("hasExplicitSchoolYear");v("inferDomainFromConcept");v("maskPromptPII");v("normalizeConceptKey");v("parseParentMessageIntentsWithLLM");v("processWhatsAppInbound");v("sanitizeExtractedTitle");v("sendWhatsAppInteractiveMessage");v("sendWhatsAppTextMessage");v("sweepExpiredHolds");v("truncateWhatsAppText");v("verifyMetaHmacSignature");v("withDurableExecution");/**
 * @license
 * Copyright 2017 Google LLC
 * SPDX-License-Identifier: BSD-3-Clause
 */const Q=globalThis,He=t=>t,de=Q.trustedTypes,Te=de?de.createPolicy("lit-html",{createHTML:t=>t}):void 0,ze="$lit$",H=`lit$${Math.random().toFixed(9).slice(2)}$`,Oe="?"+H,bt=`<${Oe}>`,z=document,ee=()=>z.createComment(""),te=t=>t===null||typeof t!="object"&&typeof t!="function",Ce=Array.isArray,yt=t=>Ce(t)||typeof(t==null?void 0:t[Symbol.iterator])=="function",ge=`[ 	
\f\r]`,G=/<(?:(!--|\/[^a-zA-Z])|(\/?[a-zA-Z][^>\s]*)|(\/?$))/g,Me=/-->/g,Le=/>/g,D=RegExp(`>|${ge}(?:([^\\s"'>=/]+)(${ge}*=${ge}*(?:[^ 	
\f\r"'\`<>=]|("|')|))|$)`,"g"),De=/'/g,Re=/"/g,je=/^(?:script|style|textarea|title)$/i,xt=t=>(e,...s)=>({_$litType$:t,strings:e,values:s}),r=xt(1),se=Symbol.for("lit-noChange"),b=Symbol.for("lit-nothing"),Be=new WeakMap,N=z.createTreeWalker(z,129);function Ue(t,e){if(!Ce(t)||!t.hasOwnProperty("raw"))throw Error("invalid template strings array");return Te!==void 0?Te.createHTML(e):e}const $t=(t,e)=>{const s=t.length-1,o=[];let i,n=e===2?"<svg>":e===3?"<math>":"",a=G;for(let l=0;l<s;l++){const d=t[l];let f,p,u=-1,g=0;for(;g<d.length&&(a.lastIndex=g,p=a.exec(d),p!==null);)g=a.lastIndex,a===G?p[1]==="!--"?a=Me:p[1]!==void 0?a=Le:p[2]!==void 0?(je.test(p[2])&&(i=RegExp("</"+p[2],"g")),a=D):p[3]!==void 0&&(a=D):a===D?p[0]===">"?(a=i??G,u=-1):p[1]===void 0?u=-2:(u=a.lastIndex-p[2].length,f=p[1],a=p[3]===void 0?D:p[3]==='"'?Re:De):a===Re||a===De?a=D:a===Me||a===Le?a=G:(a=D,i=void 0);const x=a===D&&t[l+1].startsWith("/>")?" ":"";n+=a===G?d+bt:u>=0?(o.push(f),d.slice(0,u)+ze+d.slice(u)+H+x):d+H+(u===-2?l:x)}return[Ue(t,n+(t[s]||"<?>")+(e===2?"</svg>":e===3?"</math>":"")),o]};class ie{constructor({strings:e,_$litType$:s},o){let i;this.parts=[];let n=0,a=0;const l=e.length-1,d=this.parts,[f,p]=$t(e,s);if(this.el=ie.createElement(f,o),N.currentNode=this.el.content,s===2||s===3){const u=this.el.content.firstChild;u.replaceWith(...u.childNodes)}for(;(i=N.nextNode())!==null&&d.length<l;){if(i.nodeType===1){if(i.hasAttributes())for(const u of i.getAttributeNames())if(u.endsWith(ze)){const g=p[a++],x=i.getAttribute(u).split(H),S=/([.?@])?(.*)/.exec(g);d.push({type:1,index:n,name:S[2],strings:x,ctor:S[1]==="."?kt:S[1]==="?"?wt:S[1]==="@"?St:ue}),i.removeAttribute(u)}else u.startsWith(H)&&(d.push({type:6,index:n}),i.removeAttribute(u));if(je.test(i.tagName)){const u=i.textContent.split(H),g=u.length-1;if(g>0){i.textContent=de?de.emptyScript:"";for(let x=0;x<g;x++)i.append(u[x],ee()),N.nextNode(),d.push({type:2,index:++n});i.append(u[g],ee())}}}else if(i.nodeType===8)if(i.data===Oe)d.push({type:2,index:n});else{let u=-1;for(;(u=i.data.indexOf(H,u+1))!==-1;)d.push({type:7,index:n}),u+=H.length-1}n++}}static createElement(e,s){const o=z.createElement("template");return o.innerHTML=e,o}}function W(t,e,s=t,o){var a,l;if(e===se)return e;let i=o!==void 0?(a=s._$Co)==null?void 0:a[o]:s._$Cl;const n=te(e)?void 0:e._$litDirective$;return(i==null?void 0:i.constructor)!==n&&((l=i==null?void 0:i._$AO)==null||l.call(i,!1),n===void 0?i=void 0:(i=new n(t),i._$AT(t,s,o)),o!==void 0?(s._$Co??(s._$Co=[]))[o]=i:s._$Cl=i),i!==void 0&&(e=W(t,i._$AS(t,e.values),i,o)),e}class At{constructor(e,s){this._$AV=[],this._$AN=void 0,this._$AD=e,this._$AM=s}get parentNode(){return this._$AM.parentNode}get _$AU(){return this._$AM._$AU}u(e){const{el:{content:s},parts:o}=this._$AD,i=((e==null?void 0:e.creationScope)??z).importNode(s,!0);N.currentNode=i;let n=N.nextNode(),a=0,l=0,d=o[0];for(;d!==void 0;){if(a===d.index){let f;d.type===2?f=new re(n,n.nextSibling,this,e):d.type===1?f=new d.ctor(n,d.name,d.strings,this,e):d.type===6&&(f=new Ct(n,this,e)),this._$AV.push(f),d=o[++l]}a!==(d==null?void 0:d.index)&&(n=N.nextNode(),a++)}return N.currentNode=z,i}p(e){let s=0;for(const o of this._$AV)o!==void 0&&(o.strings!==void 0?(o._$AI(e,o,s),s+=o.strings.length-2):o._$AI(e[s])),s++}}class re{get _$AU(){var e;return((e=this._$AM)==null?void 0:e._$AU)??this._$Cv}constructor(e,s,o,i){this.type=2,this._$AH=b,this._$AN=void 0,this._$AA=e,this._$AB=s,this._$AM=o,this.options=i,this._$Cv=(i==null?void 0:i.isConnected)??!0}get parentNode(){let e=this._$AA.parentNode;const s=this._$AM;return s!==void 0&&(e==null?void 0:e.nodeType)===11&&(e=s.parentNode),e}get startNode(){return this._$AA}get endNode(){return this._$AB}_$AI(e,s=this){e=W(this,e,s),te(e)?e===b||e==null||e===""?(this._$AH!==b&&this._$AR(),this._$AH=b):e!==this._$AH&&e!==se&&this._(e):e._$litType$!==void 0?this.$(e):e.nodeType!==void 0?this.T(e):yt(e)?this.k(e):this._(e)}O(e){return this._$AA.parentNode.insertBefore(e,this._$AB)}T(e){this._$AH!==e&&(this._$AR(),this._$AH=this.O(e))}_(e){this._$AH!==b&&te(this._$AH)?this._$AA.nextSibling.data=e:this.T(z.createTextNode(e)),this._$AH=e}$(e){var n;const{values:s,_$litType$:o}=e,i=typeof o=="number"?this._$AC(e):(o.el===void 0&&(o.el=ie.createElement(Ue(o.h,o.h[0]),this.options)),o);if(((n=this._$AH)==null?void 0:n._$AD)===i)this._$AH.p(s);else{const a=new At(i,this),l=a.u(this.options);a.p(s),this.T(l),this._$AH=a}}_$AC(e){let s=Be.get(e.strings);return s===void 0&&Be.set(e.strings,s=new ie(e)),s}k(e){Ce(this._$AH)||(this._$AH=[],this._$AR());const s=this._$AH;let o,i=0;for(const n of e)i===s.length?s.push(o=new re(this.O(ee()),this.O(ee()),this,this.options)):o=s[i],o._$AI(n),i++;i<s.length&&(this._$AR(o&&o._$AB.nextSibling,i),s.length=i)}_$AR(e=this._$AA.nextSibling,s){var o;for((o=this._$AP)==null?void 0:o.call(this,!1,!0,s);e!==this._$AB;){const i=He(e).nextSibling;He(e).remove(),e=i}}setConnected(e){var s;this._$AM===void 0&&(this._$Cv=e,(s=this._$AP)==null||s.call(this,e))}}class ue{get tagName(){return this.element.tagName}get _$AU(){return this._$AM._$AU}constructor(e,s,o,i,n){this.type=1,this._$AH=b,this._$AN=void 0,this.element=e,this.name=s,this._$AM=i,this.options=n,o.length>2||o[0]!==""||o[1]!==""?(this._$AH=Array(o.length-1).fill(new String),this.strings=o):this._$AH=b}_$AI(e,s=this,o,i){const n=this.strings;let a=!1;if(n===void 0)e=W(this,e,s,0),a=!te(e)||e!==this._$AH&&e!==se,a&&(this._$AH=e);else{const l=e;let d,f;for(e=n[0],d=0;d<n.length-1;d++)f=W(this,l[o+d],s,d),f===se&&(f=this._$AH[d]),a||(a=!te(f)||f!==this._$AH[d]),f===b?e=b:e!==b&&(e+=(f??"")+n[d+1]),this._$AH[d]=f}a&&!i&&this.j(e)}j(e){e===b?this.element.removeAttribute(this.name):this.element.setAttribute(this.name,e??"")}}class kt extends ue{constructor(){super(...arguments),this.type=3}j(e){this.element[this.name]=e===b?void 0:e}}class wt extends ue{constructor(){super(...arguments),this.type=4}j(e){this.element.toggleAttribute(this.name,!!e&&e!==b)}}class St extends ue{constructor(e,s,o,i,n){super(e,s,o,i,n),this.type=5}_$AI(e,s=this){if((e=W(this,e,s,0)??b)===se)return;const o=this._$AH,i=e===b&&o!==b||e.capture!==o.capture||e.once!==o.once||e.passive!==o.passive,n=e!==b&&(o===b||i);i&&this.element.removeEventListener(this.name,this,o),n&&this.element.addEventListener(this.name,this,e),this._$AH=e}handleEvent(e){var s;typeof this._$AH=="function"?this._$AH.call(((s=this.options)==null?void 0:s.host)??this.element,e):this._$AH.handleEvent(e)}}class Ct{constructor(e,s,o){this.element=e,this.type=6,this._$AN=void 0,this._$AM=s,this.options=o}get _$AU(){return this._$AM._$AU}_$AI(e){W(this,e)}}const he=Q.litHtmlPolyfillSupport;he==null||he(ie,re),(Q.litHtmlVersions??(Q.litHtmlVersions=[])).push("3.3.3");const _t=(t,e,s)=>{const o=e;let i=o._$litPart$;return i===void 0&&(o._$litPart$=i=new re(e.insertBefore(ee(),null),null,void 0,{})),i._$AI(t),i},Pt=document.getElementById("app");let m="available",I="all",$=[],A=[],ce=[],Et=null,R=null,oe=!1,Z="",me=null,L="",_="all",T="all",F="all",O="all",C="all",B="holds",P="all",ae="",ne="",X=!0,j=!1,k=null,Ae=!1,V=!1,q="",le="",be="Mathematics",ye="+15550199002";function h(t){Z=t,me&&clearTimeout(me),me=setTimeout(()=>{Z="",c()},1e4)}function _e(t){if(!t)return"Unknown date";const e=Date.now(),s=Math.floor((e-t)/1e3);if(s<60)return"Just now";const o=Math.floor(s/60);if(o<60)return`${o}m ago`;const i=Math.floor(o/60);if(i<24)return`${i}h ago`;const n=Math.floor(i/24);return n===1?"Yesterday":n<30?`${n}d ago`:new Date(t).toLocaleDateString()}function M(t){return t?new Date(t).toLocaleString(void 0,{year:"numeric",month:"short",day:"numeric",hour:"2-digit",minute:"2-digit"}):""}function pe(t){switch(t){case"Mathematics":return"badge-math";case"Science":return"badge-science";case"Languages":return"badge-languages";case"Humanities":return"badge-humanities";case"Arts":return"badge-arts";default:return"badge-active"}}function We(t){switch(t){case"PrimarySchool":return"badge-primary";case"MiddleSchool":return"badge-middle";case"HighSchool":return"badge-high";case"UniversityPrep":return"badge-uniprep";default:return"badge-active"}}function It(t){switch(t){case"PrimarySchool":return"Primary (Years 1-6)";case"MiddleSchool":return"Middle School (Years 7-9)";case"HighSchool":return"High School (Years 10-13)";case"UniversityPrep":return"Uni Prep";default:return t||"General"}}function Fe(t){switch(t){case"New":return r`
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
      `;default:return r`<span class="badge badge-active">${t||"Good"}</span>`}}function Ye(t){if(!t)return!0;const e=Date.now();if(P==="today"){const s=new Date;return s.setHours(0,0,0,0),t>=s.getTime()}if(P==="7days"){const s=e-6048e5;return t>=s}if(P==="30days"){const s=e-2592e6;return t>=s}if(P==="custom"){let s=!0;if(ae){const o=new Date(ae).setHours(0,0,0,0);t<o&&(s=!1)}if(ne){const o=new Date(ne).setHours(23,59,59,999);t>o&&(s=!1)}return s}return!0}function Ht(t){return t.filter(e=>{if(L.trim()){const s=L.toLowerCase().trim();if(!(e.title&&e.title.toLowerCase().includes(s)||e.concept&&e.concept.toLowerCase().includes(s)||e.description&&e.description.toLowerCase().includes(s)||e.domain&&e.domain.toLowerCase().includes(s)||e.providerCategory&&e.providerCategory.toLowerCase().includes(s)||e.sellerPhone&&e.sellerPhone.toLowerCase().includes(s)))return!1}return!(_!=="all"&&e.domain!==_||T!=="all"&&e.providerCategory!==T||F!=="all"&&e.conditionType!==F||O!=="all"&&e.sellerPhone!==O||C!=="all"&&e.status!==C||!Ye(e.createdAt))}).sort((e,s)=>{const o=e.createdAt||0,i=s.createdAt||0;return X?i-o:o-i})}function ke(t,e){return t.filter(s=>{if(s.status!==e)return!1;if(L.trim()){const o=L.toLowerCase().trim();if(!(s.requestedQuery&&s.requestedQuery.toLowerCase().includes(o)||s.concept&&s.concept.toLowerCase().includes(o)||s.domain&&s.domain.toLowerCase().includes(o)||s.userPhone&&s.userPhone.toLowerCase().includes(o)||s.handoverCode&&s.handoverCode.toLowerCase().includes(o)))return!1}return!(_!=="all"&&s.domain!==_||!Ye(s.createdAt))}).sort((s,o)=>{const i=s.matchedAt||s.createdAt||0,n=o.matchedAt||o.createdAt||0;return X?n-i:i-n})}function Tt(){let t=0;return L.trim()&&t++,_!=="all"&&t++,T!=="all"&&t++,F!=="all"&&t++,O!=="all"&&t++,C!=="all"&&t++,P!=="all"&&t++,t}function Ge(){L="",_="all",T="all",F="all",O="all",C="all",P="all",ae="",ne="",c()}async function w(){oe=!0,c();try{try{await y.releaseExpiredHolds()}catch{}const[t,e,s,o,i]=await Promise.all([y.listInventory(),y.listDemands(),y.getLifecycleEvents(),y.getSecurityObservabilityStatus(),y.getSupplyGaps()]);$=t||[],A=e||[],ce=s||[],Et=o||null,R=i||null}catch(t){console.error("Failed to load dashboard data:",t),h(`❌ Failed to load data: ${t.message}`)}finally{oe=!1,c()}}async function Mt(t){Ae=!0,j=!0,k=null,c();try{k=await y.getSellerStorefront(t)}catch(e){h(`❌ Failed to load seller storefront: ${e.message}`),j=!1}finally{Ae=!1,c()}}async function Lt(){try{const t=await y.verifyWebhook("subscribe","my_verify_token_123",`challenge_${Date.now()}`);t.status===200?h(`✅ Handshake Verified! Echoed challenge: "${t.challenge}"`):h(`❌ Verification failed: ${t.error}`)}catch(t){h(`❌ Error verifying webhook: ${t.message}`)}w()}async function U(t,e="+15550199001"){var s,o,i,n;h(`🚀 Processing simulated WhatsApp message: "${t}"...`),c();try{const a={media_id:`media_${Date.now()}`,from_phone:e,message_text:t},l=await y.handleWebhook(a);((s=l.result)==null?void 0:s.status)==="matched"?(h(`🎉 Match Connected! Matched wishlist ID: ${l.result.matchedDemandId}`),m="matches"):((o=l.result)==null?void 0:o.status)==="needs_year_clarification"?h("ℹ️ Clarification Prompt Triggered: Bot asked parent for school year/grade!"):((i=l.result)==null?void 0:i.status)==="greeting"?h("👋 Greeting Handled: Welcome & Guide sent."):(h(`📦 Book Listed into Inventory! Item ID: ${((n=l.result)==null?void 0:n.itemId)||"saved"}`),m="available")}catch(a){h(`❌ Webhook simulation error: ${a.message}`)}w()}async function we(t,e,s="Mathematics",o="+15550199002"){h(`⏳ Registering demand for "${e}" (${t})...`),c();try{const i=await y.createDemand(o,e,t,s);h(`✨ Wishlist demand registered: "${i.requestedQuery}"!`),V=!1,m="pendings"}catch(i){h(`❌ Error adding demand: ${i.message}`)}w()}async function qe(t){try{await y.deleteDemand(t),h("🗑️ Removed demand entry."),A=A.filter(e=>e.demandId!==t),c()}catch(e){h(`❌ Error removing demand: ${e.message}`)}}async function Dt(t){try{await y.deleteInventory(t),h("🗑️ Removed inventory item."),$=$.filter(e=>e.itemId!==t),c()}catch(e){h(`❌ Error removing inventory: ${e.message}`)}}async function Ve(){h("🔒 Validating HMAC-SHA256 Payload Signature..."),c();try{const t="secret_key_whatsapp_demo_1234",e=JSON.stringify({test:"hmac-verification",timestamp:Date.now()}),s=new TextEncoder,o=await crypto.subtle.importKey("raw",s.encode(t),{name:"HMAC",hash:"SHA-256"},!1,["sign"]),i=await crypto.subtle.sign("HMAC",o,s.encode(e)),n=Array.from(new Uint8Array(i)).map(l=>l.toString(16).padStart(2,"0")).join("");(await y.validateSignature(e,`sha256=${n}`,t)).valid?h("🛡️ HMAC Verification SUCCESS: Timing-safe cryptographic signature verified."):h("❌ HMAC Verification Failed!")}catch(t){h(`❌ HMAC test error: ${t.message}`)}w()}function Rt(){const t=A.filter(n=>n.status==="pending").length,e=A.filter(n=>n.status==="matched").length,s=A.filter(n=>n.status==="fulfilled").length||$.filter(n=>n.status==="sold").length,o=$.filter(n=>n.status==="active").length,i=ce.length;return r`
    <div class="stats-row">
      <div class="stat-card" style="cursor:pointer;" @click=${()=>{m="available",C="active",c()}}>
        <div class="stat-icon" style="background:rgba(59,130,246,0.15);color:#60a5fa;">📚</div>
        <div class="stat-info">
          <div class="stat-value">${o}</div>
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
  `}function Bt(){const t=A.filter(i=>i.status==="pending").length,e=A.filter(i=>i.status==="matched").length,s=A.filter(i=>i.status==="fulfilled").length||$.filter(i=>i.status==="sold").length,o=$.filter(i=>i.status==="active").length;return r`
    <div class="tabs-nav">
      <button
        class="tab-btn ${m==="available"?"active":""}"
        @click=${()=>{m="available",c()}}
      >
        <span>📚 Available Books</span>
        <span class="tab-count">${o}</span>
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
  `:""}function Pe(t=!0){const e=Tt(),s=Array.from(new Set($.map(o=>o.sellerPhone).filter(Boolean)));return r`
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
            @input=${o=>{L=o.target.value,c()}}
          />
        </div>

        <!-- Subject / Domain Selector -->
        <select
          class="filter-select"
          .value=${_}
          @change=${o=>{_=o.target.value,c()}}
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
                .value=${T}
                @change=${o=>{T=o.target.value,c()}}
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
                @change=${o=>{F=o.target.value,c()}}
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
                @change=${o=>{C=o.target.value,c()}}
              >
                <option value="all">📦 All Statuses (${$.length})</option>
                <option value="active">🟢 Available (${$.filter(o=>o.status==="active").length})</option>
                <option value="reserved">⏳ On Hold (${$.filter(o=>o.status==="reserved").length})</option>
                <option value="sold">🎓 Sold & Completed (${$.filter(o=>o.status==="sold").length})</option>
              </select>
            `:""}

        <!-- Seller Filter (Feature 3A) -->
        ${s.length>1?r`
              <select
                class="filter-select"
                .value=${O}
                @change=${o=>{O=o.target.value,c()}}
              >
                <option value="all">👨‍👩‍👧 All Parent Sellers</option>
                ${s.map(o=>r`<option value="${o}">Seller: ${o}</option>`)}
              </select>
            `:""}

        <!-- Date Range Presets -->
        <select
          class="filter-select"
          .value=${P}
          @change=${o=>{P=o.target.value,c()}}
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
                  .value=${ae}
                  @change=${o=>{ae=o.target.value,c()}}
                />
              </div>
              <div class="date-filter-group">
                <label style="font-size:0.78rem;color:var(--text-dim);">To:</label>
                <input
                  type="date"
                  class="date-input"
                  .value=${ne}
                  @change=${o=>{ne=o.target.value,c()}}
                />
              </div>
            </div>
          `:""}

      <!-- Interactive Subject & Class Pills -->
      <div class="toolbar-secondary">
        <div class="pill-group">
          <span class="pill-label">Subjects:</span>
          ${["all","Mathematics","Science","Languages","Humanities","Arts"].map(o=>r`
              <button
                class="pill ${_===o?"active":""}"
                @click=${()=>{_=o,c()}}
              >
                ${o==="all"?"All Subjects":o}
              </button>
            `)}
        </div>

        ${t?r`
              <div class="pill-group">
                <span class="pill-label">Classes:</span>
                ${[{id:"all",label:"All Levels"},{id:"PrimarySchool",label:"Primary"},{id:"MiddleSchool",label:"Middle"},{id:"HighSchool",label:"High"},{id:"UniversityPrep",label:"Uni Prep"}].map(o=>r`
                    <button
                      class="pill ${T===o.id?"active":""}"
                      @click=${()=>{T=o.id,c()}}
                    >
                      ${o.label}
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
          <button class="secondary sm" @click=${w}>
            ${oe?"⏳ Refreshing...":"🔄 Refresh"}
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
              ${t.soldAt?r`<div style="font-size:0.75rem;color:var(--text-dim);">Sold on ${M(t.soldAt)}</div>`:""}
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
              @click=${()=>Mt(t.sellerPhone)}
            >
              👨‍👩‍👧 ${t.sellerPhone||"Parent"} Storefront
            </button>
          </div>
          <div class="date-badge" title="${M(t.createdAt)}">
            📅 ${_e(t.createdAt)} (${M(t.createdAt)})
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
      ${["Mathematics","Science","Languages","Humanities","Arts"].map(s=>{const o=t.filter(i=>i.domain===s);return o.length===0?"":r`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s}</h4>
              <span class="badge ${pe(s)}">${o.length} Available</span>
            </div>
            <div class="items-grid">
              ${o.map(i=>Ee(i))}
            </div>
          </div>
        `})}
    </div>
  `}function jt(t){return r`
    <div style="display:flex;flex-direction:column;gap:32px;">
      ${[{key:"PrimarySchool",label:"Primary School (Years 1 - 6)"},{key:"MiddleSchool",label:"Middle School (Years 7 - 9)"},{key:"HighSchool",label:"High School (Years 10 - 13)"},{key:"UniversityPrep",label:"University Prep"}].map(s=>{const o=t.filter(i=>i.providerCategory===s.key);return o.length===0?"":r`
          <div>
            <div style="display:flex;align-items:center;gap:10px;margin-bottom:14px;">
              <h4 style="font-size:1.25rem;">${s.label}</h4>
              <span class="badge ${We(s.key)}">${o.length} Available</span>
            </div>
            <div class="items-grid">
              ${o.map(i=>Ee(i))}
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
          <button class="secondary sm" @click=${w}>
            ${oe?"⏳ Refreshing...":"🔄 Refresh"}
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
                @click=${()=>we("Year5Chemistry","Year 5 Chemistry","Science")}
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
                        <div class="date-badge" title="${M(e.createdAt)}">
                          📅 ${_e(e.createdAt)} (${M(e.createdAt)})
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
                    @click=${()=>{q.trim()&&we(le||q.replace(/[^a-zA-Z0-9]/g,""),q,be,ye)}}
                  >
                    Save Request
                  </button>
                </div>
              </div>
            </div>
          </div>
        `:""}
  `}function Ft(){const t=ke(A,"matched"),e=ke(A,"fulfilled"),s=B==="completed",o=s?e:t;return r`
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
                  @click=${async()=>{const i=await y.releaseExpiredHolds();h(`🧹 Swept holds: ${i.releasedCount} expired hold(s) released back to active inventory.`),await w()}}
                >
                  🧹 Sweep Holds
                </button>
              `}
          <button class="secondary sm" @click=${w}>
            ${oe?"⏳ Refreshing...":"🔄 Refresh"}
          </button>
        </div>
      </div>

      ${Pe(!1)}

      ${o.length===0?r`
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
                        @click=${async()=>{await we("Year8Science","Year 8 Science","Science","+15559990001"),await U("I have Year 8 Science textbook in great shape","+15559990002")}}
                      >
                        ⚡ Run Auto-Match Simulation
                      </button>
                    </div>
                  `}
            </div>
          `:r`
            <div class="items-grid">
              ${o.map(i=>{const n=i.matchedAt||i.createdAt||Date.now(),a=2880*60*1e3,l=n+a-Date.now(),d=i.status!=="fulfilled"&&l<=0,f=Math.max(1,Math.ceil(l/(1e3*60*60))),p=$.find(u=>u.itemId===i.matchedItemId);return r`
                  <div
                    class="item-card"
                    style="border-left: 3px solid ${i.status==="fulfilled"?"var(--success)":d?"#ef4444":"#6366f1"};"
                  >
                    <div class="item-card-header">
                      <div class="item-title-wrap">
                        <div class="book-title">${i.requestedQuery}</div>
                        <div class="book-concept">Concept: ${i.concept}</div>
                      </div>
                      ${i.status==="fulfilled"?r`<span class="badge" style="background:rgba(16,185,129,0.15);color:#34d399;border:1px solid rgba(16,185,129,0.35);">COMPLETED / SOLD 🎓</span>`:d?r`<span class="badge" style="background:rgba(239,68,68,0.15);color:#f87171;border:1px solid rgba(239,68,68,0.35);">HOLD EXPIRED</span>`:r`<span class="badge badge-matched">48H HOLD (${f}h left)</span>`}
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
                              ${p!=null&&p.sellerPhone?r`<div>Seller: <strong style="color:var(--text);">${p.sellerPhone}</strong> ${p.title?`(${p.title})`:""}</div>`:""}
                              <div>Buyer: <strong style="color:var(--text);">${i.userPhone}</strong></div>
                              ${p!=null&&p.soldAt||i.matchedAt?r`<div>Completed: <strong>${M((p==null?void 0:p.soldAt)||i.matchedAt)}</strong></div>`:""}
                            </div>
                          `:d?"⚠️ 48-Hour hold has elapsed without physical exchange. Book can be returned to community circulation.":`⏳ 48-Hour Reservation Active (${f}h remaining). Matched parents introduced via WhatsApp.`}
                    </div>

                    <div class="card-footer">
                      <div style="display:flex;flex-direction:column;gap:2px;">
                        <div style="font-size:0.75rem;color:var(--text-dim);">
                          ${i.status==="fulfilled"?"Buyer Phone:":"Recipient Parent:"} <strong style="color:var(--text);">${i.userPhone}</strong>
                        </div>
                        <div class="date-badge" title="${M(i.createdAt)}">
                          ${_e(i.createdAt)} (${M(i.createdAt)})
                        </div>
                      </div>
                      <div style="display:flex;gap:6px;">
                        ${i.status!=="fulfilled"?r`
                              <button
                                class="sm"
                                style="font-size:0.72rem;padding:4px 8px;background:#059669;"
                                title="Confirm physical handover and mark book sold"
                                @click=${async()=>{await y.confirmHandover({itemId:i.matchedItemId||"",demandId:i.demandId}),h("Handover confirmed! Book marked as sold."),await w()}}
                              >
                                Mark Sold
                              </button>
                            `:""}
                        ${d?r`
                              <button
                                class="secondary sm"
                                style="font-size:0.72rem;padding:4px 8px;"
                                title="Release expired hold back to active community inventory"
                                @click=${async()=>{await y.releaseHold({itemId:i.matchedItemId,demandId:i.demandId}),h("Hold released! Book returned to active catalog."),await w()}}
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
          <button class="secondary sm" @click=${w}>
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
    `,Pt)}w();
